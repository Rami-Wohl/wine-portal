import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import {
  MANIFEST_RELATIVE_PATH,
  compareServiceResponses,
  downloadResource,
  fetchResources,
  loadManifest,
  manifestSchema,
  resourcePathFor,
  writeBytesAtomically,
  verifyCachedResource,
  type FetchImplementation,
  type ManifestResource,
} from "./fetch";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "geography-fetch-"));
  temporaryRoots.push(root);
  return root;
}

const sha256 = (bytes: Uint8Array | string): string =>
  createHash("sha256").update(bytes).digest("hex");

const PAYLOAD = new TextEncoder().encode("pinned geography payload\n");

function resource(overrides: Partial<ManifestResource> = {}): ManifestResource {
  return {
    id: "fixture-csv",
    storage: "cache",
    source_id: "source.fixture",
    publisher: "Fixture publisher",
    title: "Fixture resource",
    dataset_id: "dataset-1",
    dataset_url: "https://example.test/datasets/fixture",
    resource_id: "resource-1",
    url: "https://example.test/resources/fixture.csv",
    filename: "fixture.csv",
    format: "csv",
    bytes: PAYLOAD.length,
    sha256: sha256(PAYLOAD),
    release: "2026-10-26",
    retrieved_at: "2026-10-30",
    licence: {
      id: "etalab-2.0",
      name: "Licence Ouverte / Open Licence 2.0",
      url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
      attribution: "Fixture publisher, fixture resource, 2026-10-26",
    },
    encoding: "UTF-8",
    ...overrides,
  };
}

function serviceResponse(timeStamp: string, extraFeature = false): string {
  const features = [
    {
      type: "Feature",
      id: "x.1",
      geometry: { type: "Point", coordinates: [700000, 6600000] },
      geometry_name: "geometrie",
      properties: { cleabs: "A", nom_officiel: "Fixture" },
    },
  ];
  if (extraFeature) {
    features.push({
      type: "Feature",
      id: "x.2",
      geometry: { type: "Point", coordinates: [700100, 6600100] },
      geometry_name: "geometrie",
      properties: { cleabs: "B", nom_officiel: "Other" },
    });
  }
  return JSON.stringify({
    type: "FeatureCollection",
    features,
    totalFeatures: features.length,
    numberMatched: features.length,
    numberReturned: features.length,
    timeStamp,
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::2154" } },
  });
}

const RAW_TEXT = serviceResponse("2026-10-30T12:00:00.000Z");
const RAW_BYTES = new TextEncoder().encode(RAW_TEXT);

function rawResource(overrides: Partial<ManifestResource> = {}): ManifestResource {
  return resource({
    id: "fixture-raw",
    storage: "raw",
    dataset_id: "FIXTURE_CATALOGUE-ID",
    raw_directory: "fixture-dataset",
    resource_id: "FIXTURE:layer",
    url: "https://example.test/wfs?REQUEST=GetFeature&TYPENAMES=FIXTURE%3Alayer",
    request: {
      service: "https://example.test/wfs",
      protocol: "WFS 2.0.0 GetFeature",
      typename: "FIXTURE:layer",
      output_format: "application/json",
      srs: "EPSG:2154",
      sort_by: "cleabs",
      cql_filter: "cleabs='A'",
    },
    filename: "fixture-raw.geojson",
    format: "geojson",
    bytes: RAW_BYTES.length,
    sha256: sha256(RAW_BYTES),
    crs: {
      recognised: "EPSG:2154",
      equivalent_epsg: "EPSG:2154",
      units: "metre",
      urn: "urn:ogc:def:crs:EPSG::2154",
      proj_definition:
        "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs",
    },
    feature_count: 1,
    ...overrides,
  });
}

function fakeFetch(bytes: Uint8Array, status = 200): FetchImplementation & { calls: string[] } {
  const calls: string[] = [];
  const implementation = async (url: string): Promise<Response> => {
    calls.push(url);
    return new Response(bytes.slice(), { status });
  };
  return Object.assign(implementation, { calls });
}

async function writeManifest(root: string, resources: ManifestResource[]): Promise<void> {
  const file = path.join(root, MANIFEST_RELATIVE_PATH);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, stringifyYaml({ version: 1, resources }), "utf8");
}

describe("manifest schema", () => {
  it("requires a CRS for shapefile resources", () => {
    const result = manifestSchema.safeParse({
      version: 1,
      resources: [resource({ id: "shape", format: "shapefile-zip", filename: "shape.zip" })],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      "is required for a shapefile resource; record the verbatim PRJ WKT",
    );
  });

  it("rejects duplicate resource ids and malformed digests", () => {
    const result = manifestSchema.safeParse({
      version: 1,
      resources: [resource(), resource({ sha256: "not-a-digest" })],
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toContain("duplicates resource id 'fixture-csv'");
    expect(messages).toContain("must be a lowercase SHA-256 hex digest");
  });

  it("requires a pinned request, a crs urn, a size limit and a known envelope for raw responses", () => {
    const tooLarge = manifestSchema.safeParse({
      version: 1,
      resources: [
        rawResource({ bytes: 11 * 1024 * 1024, request: undefined, raw_directory: undefined }),
      ],
    });
    expect(tooLarge.success).toBe(false);
    const messages = tooLarge.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages.some((message) => message.includes("pin the exact request"))).toBe(true);
    expect(messages.some((message) => message.includes("byte limit"))).toBe(true);
    expect(messages.some((message) => message.includes("name its directory"))).toBe(true);
    expect(() => resourcePathFor("/r", { ...rawResource(), raw_directory: undefined })).toThrow(
      /needs raw_directory/,
    );
    const unknownEnvelope = manifestSchema.safeParse({
      version: 1,
      resources: [
        rawResource({
          request: { ...rawResource().request!, envelope: "nowhere" },
        }),
      ],
    });
    expect(unknownEnvelope.success).toBe(false);
    expect(
      unknownEnvelope.error?.issues.some((issue) => issue.message.includes("envelope 'nowhere'")),
    ).toBe(true);
  });

  it("loads the committed manifest of this repository", async () => {
    const manifest = await loadManifest(path.resolve(__dirname, "..", ".."));
    expect(manifest.resources.map((entry) => entry.id)).toContain(
      "inao-geographical-areas-2026-10-26",
    );
    const shapefile = manifest.resources.find((entry) => entry.format === "shapefile-zip");
    expect(shapefile?.crs?.wkt).toContain("RGF93_Lambert_93");
    expect(shapefile?.sha256).toMatch(/^[a-f0-9]{64}$/);
    const raw = manifest.resources.filter((entry) => entry.storage === "raw");
    expect(raw.length).toBeGreaterThan(0);
    for (const entry of raw) {
      expect(
        entry.request?.envelope === undefined || manifest.envelopes?.[entry.request.envelope],
      ).toBeTruthy();
      // The publisher's catalogue identifier, which dataset_url resolves; never the local slug.
      expect(entry.dataset_url.endsWith(`/${entry.dataset_id}`)).toBe(true);
      expect(entry.raw_directory).not.toBe(entry.dataset_id);
    }
  });
});

describe("verifyCachedResource", () => {
  it("reports a missing file", async () => {
    const root = await temporaryRoot();
    expect(await verifyCachedResource(path.join(root, "absent.csv"), resource())).toEqual({
      status: "missing",
    });
  });

  it("verifies bytes and digest", async () => {
    const root = await temporaryRoot();
    const file = path.join(root, "fixture.csv");
    await writeFile(file, PAYLOAD);
    expect(await verifyCachedResource(file, resource())).toEqual({
      status: "verified",
      bytes: PAYLOAD.length,
      sha256: sha256(PAYLOAD),
    });
  });

  it("reports a file with the right size but another digest", async () => {
    const root = await temporaryRoot();
    const file = path.join(root, "fixture.csv");
    const tampered = PAYLOAD.slice();
    tampered[0] = tampered[0] ^ 0xff;
    await writeFile(file, tampered);
    const result = await verifyCachedResource(file, resource());
    expect(result.status).toBe("mismatch");
    expect(result).toMatchObject({ bytes: PAYLOAD.length, sha256: sha256(tampered) });
  });
});

describe("writeBytesAtomically", () => {
  it("writes the file and leaves no .part file behind when the rename fails", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "geography-write-"));
    try {
      const file = path.join(root, "raw", "response.geojson");
      await writeBytesAtomically(file, new TextEncoder().encode("{}"));
      expect(await readFile(file, "utf8")).toBe("{}");
      const blocked = path.join(root, "blocked");
      await mkdir(path.join(blocked, "child"), { recursive: true });
      await expect(writeBytesAtomically(blocked, new Uint8Array([1]))).rejects.toThrow();
      expect((await readdir(root)).filter((name) => name.endsWith(".part"))).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("resourcePathFor", () => {
  it("places cache files under the resource id and raw files under their raw directory", () => {
    expect(resourcePathFor("/r", resource())).toBe(
      "/r/data/geography/cache/fixture-csv/fixture.csv",
    );
    expect(resourcePathFor("/r", rawResource())).toBe(
      "/r/data/geography/raw/fixture-dataset/fixture-raw.geojson",
    );
  });
});

describe("downloadResource", () => {
  it("writes a verified download atomically", async () => {
    const root = await temporaryRoot();
    const destination = path.join(root, "cache", "fixture-csv", "fixture.csv");
    const fetchImplementation = fakeFetch(PAYLOAD);
    await expect(downloadResource(resource(), destination, fetchImplementation)).resolves.toEqual({
      bytes: PAYLOAD.length,
      sha256: sha256(PAYLOAD),
    });
    expect(fetchImplementation.calls).toEqual(["https://example.test/resources/fixture.csv"]);
    expect(new Uint8Array(await readFile(destination))).toEqual(PAYLOAD);
    expect(await readdir(path.dirname(destination))).toEqual(["fixture.csv"]);
  });

  it("fails loudly on a digest mismatch and leaves no file behind", async () => {
    const root = await temporaryRoot();
    const destination = path.join(root, "cache", "fixture-csv", "fixture.csv");
    const changed = new TextEncoder().encode("pinned geography PAYLOAD\n");
    expect(changed.length).toBe(PAYLOAD.length);
    await expect(downloadResource(resource(), destination, fakeFetch(changed))).rejects.toThrow(
      /does not match the pin .*observed 25 bytes, sha256 [a-f0-9]{64}/,
    );
    expect(await readdir(path.dirname(destination))).toEqual([]);
  });

  it("stops as soon as the download exceeds the pinned size", async () => {
    const root = await temporaryRoot();
    const destination = path.join(root, "cache", "fixture-csv", "fixture.csv");
    const longer = new Uint8Array(PAYLOAD.length + 10);
    await expect(downloadResource(resource(), destination, fakeFetch(longer))).rejects.toThrow(
      /exceeds the pinned 25 bytes/,
    );
    expect(await readdir(path.dirname(destination))).toEqual([]);
  });

  it("fails on an HTTP error", async () => {
    const root = await temporaryRoot();
    const destination = path.join(root, "cache", "fixture-csv", "fixture.csv");
    await expect(
      downloadResource(resource(), destination, fakeFetch(PAYLOAD, 404)),
    ).rejects.toThrow(/HTTP 404/);
  });
});

describe("compareServiceResponses", () => {
  it("ignores the server timeStamp only", () => {
    expect(compareServiceResponses(RAW_TEXT, serviceResponse("2026-11-01T00:00:00.000Z"))).toEqual(
      [],
    );
    expect(
      compareServiceResponses(RAW_TEXT, serviceResponse("2026-11-01T00:00:00.000Z", true)),
    ).toEqual([
      "features: 1 committed, 2 from the service",
      "numberMatched differs",
      "numberReturned differs",
      "totalFeatures differs",
    ]);
    expect(compareServiceResponses(RAW_TEXT, "not json")[0]).toMatch(/not valid JSON/);
  });
});

describe("fetchResources", () => {
  it("downloads missing resources and skips verified ones on the next run", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [resource()]);
    const first = fakeFetch(PAYLOAD);
    const log = vi.fn();
    const results = await fetchResources(root, { fetchImplementation: first, log });
    expect(results.map((result) => result.outcome)).toEqual(["downloaded"]);
    expect(first.calls).toHaveLength(1);
    expect(log.mock.calls.map(([line]) => String(line).split(/\s+/)[0])).toEqual([
      "download",
      "verified",
    ]);

    const second = fakeFetch(PAYLOAD);
    const again = await fetchResources(root, { fetchImplementation: second });
    expect(again.map((result) => result.outcome)).toEqual(["verified"]);
    expect(second.calls).toHaveLength(0);
  });

  it("never replaces a cached file that does not match the pin", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [resource()]);
    const file = resourcePathFor(root, resource());
    await mkdir(path.dirname(file), { recursive: true });
    const stale = new TextEncoder().encode("an older edition of the same resource\n");
    await writeFile(file, stale);
    const fetchImplementation = fakeFetch(PAYLOAD);
    const results = await fetchResources(root, { fetchImplementation });
    expect(results[0].outcome).toBe("mismatch");
    expect(results[0].detail).toMatch(/left untouched/);
    expect(fetchImplementation.calls).toHaveLength(0);
    expect(new Uint8Array(await readFile(file))).toEqual(stale);
  });

  it("only verifies when asked and reports what is missing", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [resource()]);
    const fetchImplementation = fakeFetch(PAYLOAD);
    const results = await fetchResources(root, { verifyOnly: true, fetchImplementation });
    expect(results.map((result) => result.outcome)).toEqual(["missing"]);
    expect(fetchImplementation.calls).toHaveLength(0);
  });

  it("rejects unknown resource ids in --only", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [resource()]);
    await expect(fetchResources(root, { only: ["nope"] })).rejects.toThrow(/Unknown resource id/);
  });

  it("verifies a committed raw response in place and never downloads it on its own", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [rawResource()]);
    const fetchImplementation = fakeFetch(RAW_BYTES);
    const missing = await fetchResources(root, { fetchImplementation });
    expect(missing.map((result) => result.outcome)).toEqual(["missing"]);
    expect(fetchImplementation.calls).toHaveLength(0);
    const file = resourcePathFor(root, rawResource());
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, RAW_BYTES);
    const verified = await fetchResources(root, { fetchImplementation });
    expect(verified.map((result) => result.outcome)).toEqual(["verified"]);
    expect(fetchImplementation.calls).toHaveLength(0);
  });

  it("captures a missing raw response and asks for a pin when the digest differs", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [rawResource({ sha256: "0".repeat(64) })]);
    const fetchImplementation = fakeFetch(RAW_BYTES);
    const results = await fetchResources(root, { captureRaw: true, fetchImplementation });
    expect(results[0].outcome).toBe("captured");
    expect(results[0].detail).toMatch(
      new RegExp(`captured ${RAW_BYTES.length} bytes, sha256 ${sha256(RAW_BYTES)}`),
    );
    expect(await readFile(resourcePathFor(root, rawResource()), "utf8")).toBe(RAW_TEXT);

    const pinned = await temporaryRoot();
    await writeManifest(pinned, [rawResource()]);
    const direct = await fetchResources(pinned, {
      captureRaw: true,
      fetchImplementation: fakeFetch(RAW_BYTES),
    });
    expect(direct.map((result) => result.outcome)).toEqual(["downloaded"]);
  });

  it("compares a present raw response with the service content, ignoring the timeStamp", async () => {
    const root = await temporaryRoot();
    await writeManifest(root, [rawResource()]);
    const file = resourcePathFor(root, rawResource());
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, RAW_BYTES);
    const same = await fetchResources(root, {
      captureRaw: true,
      fetchImplementation: fakeFetch(
        new TextEncoder().encode(serviceResponse("2027-01-01T00:00:00.000Z")),
      ),
    });
    expect(same.map((result) => result.outcome)).toEqual(["service-unchanged"]);
    const changed = await fetchResources(root, {
      captureRaw: true,
      fetchImplementation: fakeFetch(
        new TextEncoder().encode(serviceResponse("2027-01-01T00:00:00.000Z", true)),
      ),
    });
    expect(changed[0].outcome).toBe("service-changed");
    expect(changed[0].detail).toMatch(/features: 1 committed, 2 from the service/);
    expect(await readFile(file, "utf8")).toBe(RAW_TEXT);
  });
});
