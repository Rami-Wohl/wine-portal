import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open as openFile, readFile, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { isNodeError } from "../content/pipeline/files";

/**
 * Verify and, where allowed, download the datasets pinned in data/geography/manifest.yaml.
 *
 * Two kinds of resource exist (docs/atlas-plan.md §3 and §6):
 *
 * - `storage: cache` — a versioned bulk file. It is downloaded into data/geography/cache/
 *   (gitignored) and verified against the pinned byte count and SHA-256. A verified file is
 *   skipped on the next run; a file that does not match its pin is never replaced silently.
 * - `storage: raw` — the response of a pinned service request (for example a WFS GetFeature)
 *   that the service would not reproduce byte for byte later. The response is committed under
 *   data/geography/raw/<raw_directory>/ and only verified here. `--capture-raw` performs the pinned
 *   request again: it writes a missing file so an editor can review and pin it, and for a
 *   present file it compares the service content with the committed one, ignoring only the
 *   server's `timeStamp` member.
 */

export const MANIFEST_RELATIVE_PATH = path.join("data", "geography", "manifest.yaml");
export const CACHE_RELATIVE_PATH = path.join("data", "geography", "cache");
export const RAW_RELATIVE_PATH = path.join("data", "geography", "raw");

/** Contract §6: a committed raw response stays under 10 MiB. */
export const RAW_FILE_BYTE_LIMIT = 10 * 1024 * 1024;

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 hex digest");
const sha1Schema = z.string().regex(/^[a-f0-9]{40}$/, "must be a lowercase SHA-1 hex digest");
const dateSchema = z.iso.date();
const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const manifestLicenceSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    url: z.url(),
    attribution: z.string().min(1),
    conditions: z.string().min(1).optional(),
    upstream_warning: z.string().min(1).optional(),
    evidence: z.string().min(1).optional(),
  })
  .strict();

export const manifestCrsSchema = z
  .object({
    recognised: z.string().min(1),
    equivalent_epsg: z.string().regex(/^EPSG:\d+$/),
    units: z.literal("metre"),
    /** Verbatim PRJ WKT of a shapefile resource. */
    wkt: z.string().min(1).optional(),
    /** Verbatim `crs.properties.name` of a GeoJSON service response. */
    urn: z.string().min(1).optional(),
    proj_definition: z.string().min(1),
  })
  .strict()
  .refine((crs) => crs.wkt !== undefined || crs.urn !== undefined, {
    message: "must record the verbatim source CRS as wkt (shapefile) or urn (service response)",
  });

export const manifestRequestSchema = z
  .object({
    service: z.url(),
    protocol: z.literal("WFS 2.0.0 GetFeature"),
    typename: z.string().min(1),
    output_format: z.literal("application/json"),
    srs: z.string().regex(/^EPSG:\d+$/),
    sort_by: z.string().min(1),
    cql_filter: z.string().min(1),
    envelope: z.string().min(1).optional(),
  })
  .strict();

export const manifestResourceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case id"),
    storage: z.enum(["cache", "raw"]).default("cache"),
    source_id: z.string().regex(/^source\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
    publisher: z.string().min(1),
    title: z.string().min(1),
    // The publisher's catalogue identifier, the one `dataset_url` resolves.
    dataset_id: z.string().min(1),
    dataset_url: z.url(),
    // Local directory under data/geography/raw/ for a committed service response; a repository
    // slug, never presented as the publisher's identifier.
    raw_directory: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case directory name")
      .optional(),
    resource_id: z.string().min(1),
    url: z.url(),
    request: manifestRequestSchema.optional(),
    filename: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "must be a plain file name"),
    format: z.enum(["shapefile-zip", "csv", "geojson"]),
    bytes: z.number().int().positive(),
    sha256: sha256Schema,
    catalogue_sha1: sha1Schema.optional(),
    release: dateSchema,
    edition: z.string().min(1).optional(),
    upstream_last_modified: z.iso.datetime().optional(),
    retrieved_at: dateSchema,
    retrieved_at_time: z.iso.datetime().optional(),
    licence: manifestLicenceSchema,
    encoding: z.string().min(1),
    crs: manifestCrsSchema.optional(),
    expected_extent_wgs84: bboxSchema.optional(),
    members: z
      .array(z.object({ name: z.string().min(1), bytes: z.number().int().nonnegative() }).strict())
      .optional(),
    record_count: z.number().int().nonnegative().optional(),
    feature_count: z.number().int().nonnegative().optional(),
    attribute_fields: z.array(z.string().min(1)).optional(),
    populated_attribute_fields: z.array(z.string().min(1)).optional(),
    delimiter: z.string().length(1).optional(),
    purpose: z.string().min(1).optional(),
  })
  .strict();

export const manifestEnvelopeSchema = z
  .object({
    wgs84: bboxSchema,
    lambert93: bboxSchema,
    notes: z.string().min(1).optional(),
  })
  .strict();

export const manifestSchema = z
  .object({
    version: z.literal(1),
    envelopes: z
      .record(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), manifestEnvelopeSchema)
      .optional(),
    resources: z.array(manifestResourceSchema).min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    const seen = new Set<string>();
    manifest.resources.forEach((resource, index) => {
      if (seen.has(resource.id)) {
        context.addIssue({
          code: "custom",
          path: ["resources", index, "id"],
          message: `duplicates resource id '${resource.id}'`,
        });
      }
      seen.add(resource.id);
      if (resource.format === "shapefile-zip" && !resource.crs?.wkt) {
        context.addIssue({
          code: "custom",
          path: ["resources", index, "crs"],
          message: "is required for a shapefile resource; record the verbatim PRJ WKT",
        });
      }
      if (resource.storage === "raw") {
        if (!resource.raw_directory) {
          context.addIssue({
            code: "custom",
            path: ["resources", index, "raw_directory"],
            message:
              "is required for a raw service response; name its directory under data/geography/raw/",
          });
        }
        if (!resource.request) {
          context.addIssue({
            code: "custom",
            path: ["resources", index, "request"],
            message: "is required for a raw service response; pin the exact request",
          });
        }
        if (resource.format !== "geojson" || !resource.crs?.urn) {
          context.addIssue({
            code: "custom",
            path: ["resources", index, "crs"],
            message: "a raw response must be GeoJSON with its verbatim crs urn recorded",
          });
        }
        if (resource.bytes > RAW_FILE_BYTE_LIMIT) {
          context.addIssue({
            code: "custom",
            path: ["resources", index, "bytes"],
            message: `exceeds the ${RAW_FILE_BYTE_LIMIT} byte limit for a committed raw response (contract §6)`,
          });
        }
        if (resource.request?.envelope && !manifest.envelopes?.[resource.request.envelope]) {
          context.addIssue({
            code: "custom",
            path: ["resources", index, "request", "envelope"],
            message: `names envelope '${resource.request.envelope}', which the manifest does not define`,
          });
        }
      }
    });
  });

export type GeographyManifest = z.infer<typeof manifestSchema>;

export type ManifestResource = z.infer<typeof manifestResourceSchema>;

export class ManifestError extends Error {}

export class FetchVerificationError extends Error {
  constructor(
    message: string,
    readonly resourceId: string,
    readonly observed: { bytes: number; sha256: string } | undefined,
  ) {
    super(message);
    this.name = "FetchVerificationError";
  }
}

export async function loadManifest(root: string): Promise<GeographyManifest> {
  const file = path.join(root, MANIFEST_RELATIVE_PATH);
  const raw: unknown = parseYaml(await readFile(file, "utf8"));
  const result = manifestSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) =>
        `${MANIFEST_RELATIVE_PATH}: ${issue.path.join(".") || "manifest"} ${issue.message}`,
    );
    throw new ManifestError(`Invalid geography manifest:\n${issues.join("\n")}`);
  }
  return result.data;
}

/** Where a pinned resource lives locally: the gitignored cache or the committed raw directory. */
export function resourcePathFor(
  root: string,
  resource: Pick<ManifestResource, "id" | "filename" | "storage" | "raw_directory">,
): string {
  if (resource.storage === "raw" && !resource.raw_directory) {
    throw new ManifestError(`${resource.id}: a raw resource needs raw_directory`);
  }
  return resource.storage === "raw"
    ? path.join(root, RAW_RELATIVE_PATH, resource.raw_directory as string, resource.filename)
    : path.join(root, CACHE_RELATIVE_PATH, resource.id, resource.filename);
}

export async function sha256OfFile(file: string): Promise<{ bytes: number; sha256: string }> {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk as Buffer);
    bytes += (chunk as Buffer).length;
  }
  return { bytes, sha256: hash.digest("hex") };
}

export type CacheVerification =
  | { status: "missing" }
  | { status: "verified"; bytes: number; sha256: string }
  | { status: "mismatch"; bytes: number; sha256: string };

/** Compare a local file with its pin. The size is checked first so a wrong file fails fast. */
export async function verifyCachedResource(
  file: string,
  resource: Pick<ManifestResource, "bytes" | "sha256">,
): Promise<CacheVerification> {
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return { status: "missing" };
    throw error;
  }
  if (size !== resource.bytes) {
    const observed = await sha256OfFile(file);
    return { status: "mismatch", ...observed };
  }
  const observed = await sha256OfFile(file);
  if (observed.sha256 !== resource.sha256) return { status: "mismatch", ...observed };
  return { status: "verified", ...observed };
}

export type FetchImplementation = (url: string) => Promise<Response>;

/**
 * Stream a pinned resource to a temporary file next to its destination, hashing as it
 * arrives. The temporary file becomes the cached file only after bytes and SHA-256 match.
 */
export async function downloadResource(
  resource: ManifestResource,
  destination: string,
  fetchImplementation: FetchImplementation = (url) => fetch(url),
): Promise<{ bytes: number; sha256: string }> {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.part`;
  const hash = createHash("sha256");
  let bytes = 0;
  try {
    const response = await fetchImplementation(resource.url);
    if (!response.ok || !response.body) {
      throw new FetchVerificationError(
        `${resource.id}: download failed with HTTP ${response.status} from ${resource.url}`,
        resource.id,
        undefined,
      );
    }
    const handle = await openFile(temporary, "w");
    try {
      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        hash.update(chunk);
        bytes += chunk.length;
        if (bytes > resource.bytes) {
          throw new FetchVerificationError(
            `${resource.id}: download from ${resource.url} exceeds the pinned ${resource.bytes} bytes; the upstream edition changed and needs a new source review`,
            resource.id,
            undefined,
          );
        }
        await handle.write(chunk);
      }
    } finally {
      await handle.close();
    }
    const sha256 = hash.digest("hex");
    if (bytes !== resource.bytes || sha256 !== resource.sha256) {
      throw new FetchVerificationError(
        `${resource.id}: download from ${resource.url} does not match the pin ` +
          `(expected ${resource.bytes} bytes, sha256 ${resource.sha256}; ` +
          `observed ${bytes} bytes, sha256 ${sha256}). The upstream edition changed; ` +
          "review it and re-pin the manifest before importing.",
        resource.id,
        { bytes, sha256 },
      );
    }
    await rename(temporary, destination);
    return { bytes, sha256 };
  } finally {
    await unlink(temporary).catch((error: unknown) => {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error;
    });
  }
}

/** Fetch a pinned service request completely into memory (raw responses are small by rule). */
export async function requestRaw(
  resource: ManifestResource,
  fetchImplementation: FetchImplementation = (url) => fetch(url),
): Promise<Uint8Array> {
  const response = await fetchImplementation(resource.url);
  if (!response.ok) {
    throw new FetchVerificationError(
      `${resource.id}: request failed with HTTP ${response.status} from ${resource.url}`,
      resource.id,
      undefined,
    );
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > RAW_FILE_BYTE_LIMIT) {
    throw new FetchVerificationError(
      `${resource.id}: the response is ${bytes.length} bytes, above the ${RAW_FILE_BYTE_LIMIT} byte limit for a committed raw response; report the gap instead of committing it`,
      resource.id,
      undefined,
    );
  }
  return bytes;
}

/**
 * Compare two GeoJSON service responses as content: everything except the server's
 * `timeStamp`. Returns the list of differences, empty when the content is the same.
 */
export function compareServiceResponses(left: string, right: string): string[] {
  let a: Record<string, unknown>;
  let b: Record<string, unknown>;
  try {
    a = JSON.parse(left) as Record<string, unknown>;
    b = JSON.parse(right) as Record<string, unknown>;
  } catch (error) {
    return [
      `a response is not valid JSON (${error instanceof Error ? error.message : String(error)})`,
    ];
  }
  const differences: string[] = [];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.delete("timeStamp");
  for (const key of Array.from(keys).sort()) {
    if (key === "features" && Array.isArray(a.features) && Array.isArray(b.features)) {
      if (a.features.length !== b.features.length) {
        differences.push(
          `features: ${a.features.length} committed, ${b.features.length} from the service`,
        );
        continue;
      }
      a.features.forEach((feature, index) => {
        if (JSON.stringify(feature) !== JSON.stringify((b.features as unknown[])[index])) {
          differences.push(`features[${index}] differs`);
        }
      });
      continue;
    }
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) differences.push(`${key} differs`);
  }
  return differences;
}

export interface FetchOptions {
  only?: string[];
  verifyOnly?: boolean;
  captureRaw?: boolean;
  fetchImplementation?: FetchImplementation;
  log?: (line: string) => void;
}

export interface FetchResult {
  resourceId: string;
  file: string;
  outcome:
    | "verified"
    | "downloaded"
    | "missing"
    | "mismatch"
    | "failed"
    | "captured"
    | "service-unchanged"
    | "service-changed";
  detail?: string;
}

export async function fetchResources(
  root: string,
  options: FetchOptions = {},
): Promise<FetchResult[]> {
  const log = options.log ?? (() => {});
  const manifest = await loadManifest(root);
  const selected = options.only
    ? manifest.resources.filter((resource) => options.only?.includes(resource.id))
    : manifest.resources;
  if (options.only) {
    const known = new Set(manifest.resources.map((resource) => resource.id));
    const unknown = options.only.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw new ManifestError(
        `Unknown resource id(s): ${unknown.join(", ")}. Known: ${Array.from(known).join(", ")}`,
      );
    }
  }
  const results: FetchResult[] = [];
  for (const resource of selected) {
    const file = resourcePathFor(root, resource);
    const relativeFile = path.relative(root, file);
    const verification = await verifyCachedResource(file, resource);
    if (verification.status === "verified") {
      log(
        `verified  ${resource.id}  ${relativeFile}  (${resource.bytes} bytes, sha256 ${resource.sha256.slice(0, 12)}…)`,
      );
      if (resource.storage === "raw" && options.captureRaw) {
        try {
          const fresh = await requestRaw(resource, options.fetchImplementation);
          const differences = compareServiceResponses(
            await readFile(file, "utf8"),
            new TextDecoder("utf-8", { fatal: true }).decode(fresh),
          );
          if (differences.length === 0) {
            log(
              `unchanged ${resource.id}  the service returns the same content (timeStamp ignored)`,
            );
            results.push({ resourceId: resource.id, file, outcome: "service-unchanged" });
          } else {
            const detail = `the service content differs from the committed response: ${differences.slice(0, 5).join("; ")}${differences.length > 5 ? "; …" : ""}. Review before re-pinning.`;
            log(`CHANGED   ${resource.id}  ${detail}`);
            results.push({ resourceId: resource.id, file, outcome: "service-changed", detail });
          }
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          log(`FAILED    ${resource.id}  ${detail}`);
          results.push({ resourceId: resource.id, file, outcome: "failed", detail });
        }
        continue;
      }
      results.push({ resourceId: resource.id, file, outcome: "verified" });
      continue;
    }
    if (verification.status === "mismatch") {
      const detail =
        `${relativeFile} does not match the pin (expected ${resource.bytes} bytes, sha256 ${resource.sha256}; ` +
        `observed ${verification.bytes} bytes, sha256 ${verification.sha256}). ` +
        "The file is left untouched: remove it by hand if it is damaged, or re-pin the manifest after a source review.";
      log(`MISMATCH  ${resource.id}  ${detail}`);
      results.push({ resourceId: resource.id, file, outcome: "mismatch", detail });
      continue;
    }
    if (resource.storage === "raw") {
      if (!options.captureRaw) {
        log(
          `missing   ${resource.id}  ${relativeFile}  (committed raw response; run with --capture-raw to request it)`,
        );
        results.push({ resourceId: resource.id, file, outcome: "missing" });
        continue;
      }
      log(`request   ${resource.id}  ${resource.url}`);
      try {
        const bytes = await requestRaw(resource, options.fetchImplementation);
        await writeBytesAtomically(file, bytes);
        const sha256 = createHash("sha256").update(bytes).digest("hex");
        if (bytes.length === resource.bytes && sha256 === resource.sha256) {
          log(
            `verified  ${resource.id}  ${relativeFile}  (${bytes.length} bytes, sha256 ${sha256.slice(0, 12)}…)`,
          );
          results.push({ resourceId: resource.id, file, outcome: "downloaded" });
        } else {
          const detail = `captured ${bytes.length} bytes, sha256 ${sha256} into ${relativeFile}; the manifest pins ${resource.bytes} bytes, sha256 ${resource.sha256}. Review the file and pin these values (the server timeStamp alone changes the digest).`;
          log(`CAPTURED  ${resource.id}  ${detail}`);
          results.push({ resourceId: resource.id, file, outcome: "captured", detail });
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        log(`FAILED    ${resource.id}  ${detail}`);
        results.push({ resourceId: resource.id, file, outcome: "failed", detail });
      }
      continue;
    }
    if (options.verifyOnly) {
      log(`missing   ${resource.id}  ${relativeFile}`);
      results.push({ resourceId: resource.id, file, outcome: "missing" });
      continue;
    }
    log(`download  ${resource.id}  ${resource.url}`);
    try {
      const downloaded = await downloadResource(resource, file, options.fetchImplementation);
      log(
        `verified  ${resource.id}  ${relativeFile}  (${downloaded.bytes} bytes, sha256 ${downloaded.sha256.slice(0, 12)}…)`,
      );
      results.push({ resourceId: resource.id, file, outcome: "downloaded" });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      log(`FAILED    ${resource.id}  ${detail}`);
      results.push({ resourceId: resource.id, file, outcome: "failed", detail });
    }
  }
  return results;
}

/** Write through a temporary `.part` file and rename; the temporary file never survives a failure. */
export async function writeBytesAtomically(file: string, bytes: Uint8Array): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.part`;
  try {
    const handle = await openFile(temporary, "w");
    try {
      await handle.write(bytes);
    } finally {
      await handle.close();
    }
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch((error: unknown) => {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error;
    });
  }
}

function parseArguments(argv: string[]): {
  only?: string[];
  verifyOnly: boolean;
  captureRaw: boolean;
} {
  const only: string[] = [];
  let verifyOnly = false;
  let captureRaw = false;
  for (const argument of argv) {
    if (argument === "--verify") verifyOnly = true;
    else if (argument === "--capture-raw") captureRaw = true;
    else if (argument.startsWith("--only="))
      only.push(...argument.slice("--only=".length).split(","));
    else
      throw new ManifestError(
        `Usage: npm run geography:fetch -- [--verify] [--capture-raw] [--only=<resource-id>[,<id>]]\nUnknown argument: ${argument}`,
      );
  }
  return { only: only.length > 0 ? only : undefined, verifyOnly, captureRaw };
}

async function main(): Promise<void> {
  const root = process.cwd();
  const { only, verifyOnly, captureRaw } = parseArguments(process.argv.slice(2));
  const results = await fetchResources(root, {
    only,
    verifyOnly,
    captureRaw,
    log: (line) => console.log(line),
  });
  const problems = results.filter((result) =>
    ["mismatch", "failed", "missing", "captured", "service-changed"].includes(result.outcome),
  );
  const summary = results.map((result) => `${result.resourceId}: ${result.outcome}`).join(", ");
  if (problems.length > 0) {
    console.error(`Geography fetch finished with ${problems.length} problem(s): ${summary}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Geography resources are complete and verified: ${summary}`);
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
