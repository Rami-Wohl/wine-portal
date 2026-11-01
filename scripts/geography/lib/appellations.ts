import { readFile } from "node:fs/promises";
import { loadManifest, type GeographyManifest, type ManifestResource } from "../fetch";
import { ImportError } from "./import-error";
import {
  APPELLATION_AREA_KIND,
  loadMapping,
  type AppellationMapping,
  type MappingEntry,
} from "./mapping-schemas";
import {
  PROJECTION_AGREEMENT_DEGREES,
  buildRecord,
  createFormatters,
  createProjection,
  limitationsFor,
  projectionDisagreement,
  readToolVersions,
  verifiedResourcePath,
  type BuiltRecord,
  type Logger,
  type PipelineContext,
} from "./record";
import { indexRegister, verifyAgainstRegister } from "./register";
import {
  indexSourceRows,
  matchSourceRow,
  openShapefileBundle,
  sourceRowKey,
  type MatchResult,
} from "./shapefile";
import { COORDINATE_DECIMALS } from "./validate";
import { findStaleFiles, writeRecords, type ImportOptions, type WrittenRecord } from "./write";

// INAO appellation areas: one record per reviewed mapping entry from the pinned shapefile.

export interface BuildContext extends PipelineContext {
  manifest: GeographyManifest;
  resource: ManifestResource;
  registerResource: ManifestResource;
  mapping: AppellationMapping;
}

export interface ImportedFeature extends BuiltRecord {
  entry: MappingEntry;
  sourceIndex: number;
}

export interface PreparedAppellations {
  resource: ManifestResource;
  features: ImportedFeature[];
  recordCount: number;
}

export interface ImportSummary extends PreparedAppellations {
  written: WrittenRecord[];
  stale: string[];
}

function verificationSentence(context: BuildContext, match: MatchResult): string {
  const { resource, registerResource, tools } = context;
  const verified = match.verifiedFields.join(", ");
  const absent = match.absentFields;
  const typeDenom = String(match.row.properties.type_denom ?? "");
  return (
    `Matched in the ${resource.release} edition on ${verified}` +
    (absent.length > 0
      ? `; the DBF fields ${absent.join(", ")} are blank in every record of this edition, so these values were confirmed against the INAO product register of ${registerResource.release} instead`
      : "") +
    `. Read with shapefile@${tools.shapefile} (${resource.encoding} DBF, type_denom '${typeDenom}') from the pinned ZIP (fflate@${tools.fflate}); reprojected with proj4@${tools.proj4} with explicit longitude-latitude order and no datum shift (RGF93 treated as WGS 84, difference under one metre); coordinates rounded to ${COORDINATE_DECIMALS} decimal degrees (about one millimetre) after reprojection; no other coordinate change.`
  );
}

export async function buildImportedFeature(
  context: BuildContext,
  entry: MappingEntry,
  match: MatchResult,
): Promise<ImportedFeature> {
  const built = await buildRecord(context, {
    id: entry.id,
    kind: APPELLATION_AREA_KIND,
    owner: entry.entity,
    geometry: match.row.geometry,
    resource: context.resource,
    featureKey: {
      id_app: entry.feature_key.id_app,
      id_denom: entry.feature_key.id_denom,
      signe: entry.feature_key.signe,
      type_denom: entry.feature_key.type_denom,
      app: entry.feature_key.app,
      denom: entry.feature_key.denom,
    },
    meaning: "geographical-production-area",
    limitations: limitationsFor(APPELLATION_AREA_KIND),
    review: {
      status: entry.review.status,
      reviewed_at: context.mapping.reviewed_at,
      notes: `${verificationSentence(context, match)} ${entry.review.notes.trim()}`,
    },
    label: `${entry.entity} (source record ${match.row.index})`,
  });
  return { ...built, entry, sourceIndex: match.row.index };
}

/** Read, match and build every appellation record without writing anything. */
export async function prepareAppellationAreas(
  root: string,
  log: Logger = () => {},
): Promise<PreparedAppellations> {
  const manifest = await loadManifest(root);
  const mapping = await loadMapping(root);
  const resource = manifest.resources.find((candidate) => candidate.id === mapping.resource);
  if (!resource) {
    throw new ImportError(
      `The mapping names resource '${mapping.resource}', which the manifest does not pin`,
    );
  }
  const registerResource = manifest.resources.find(
    (candidate) => candidate.id === mapping.register,
  );
  if (!registerResource) {
    throw new ImportError(
      `The mapping names register '${mapping.register}', which the manifest does not pin`,
    );
  }
  if (resource.format !== "shapefile-zip" || !resource.crs?.wkt) {
    throw new ImportError(`Resource '${resource.id}' is not a shapefile with a recorded CRS`);
  }
  if (registerResource.format !== "csv") {
    throw new ImportError(`Resource '${registerResource.id}' is not a CSV register`);
  }

  const zipFile = await verifiedResourcePath(root, resource, log);
  const registerFile = await verifiedResourcePath(root, registerResource, log);

  const bundle = openShapefileBundle(new Uint8Array(await readFile(zipFile)));
  if (resource.members) {
    const expected = resource.members.map((member) => `${member.name}:${member.bytes}`).sort();
    const observed = bundle.members.map((member) => `${member.name}:${member.bytes}`).sort();
    if (expected.join("\n") !== observed.join("\n")) {
      throw new ImportError("The archive members differ from the manifest", [
        `expected: ${expected.join(", ")}`,
        `observed: ${observed.join(", ")}`,
      ]);
    }
  }
  if (bundle.prj !== resource.crs.wkt.trim()) {
    throw new ImportError("The PRJ member differs from the WKT pinned in the manifest", [
      `manifest: ${resource.crs.wkt}`,
      `archive:  ${bundle.prj}`,
    ]);
  }
  if (bundle.cpg.toUpperCase() !== resource.encoding.toUpperCase()) {
    throw new ImportError(
      `The CPG member declares '${bundle.cpg}', the manifest '${resource.encoding}'`,
    );
  }
  log(`checked   PRJ equals the pinned WKT (${resource.crs.recognised}); CPG ${bundle.cpg}`);

  const projection = createProjection(bundle.prj);
  const tools = await readToolVersions();

  const wantedKeys = new Set(
    mapping.entries.map((entry) =>
      sourceRowKey(entry.feature_key.type_denom, entry.feature_key.denom),
    ),
  );
  const sourceIndex = await indexSourceRows(bundle, resource.encoding, wantedKeys);
  if (resource.record_count !== undefined && sourceIndex.recordCount !== resource.record_count) {
    throw new ImportError(
      `The shapefile has ${sourceIndex.recordCount} records, the manifest pins ${resource.record_count}`,
    );
  }
  log(`read      ${sourceIndex.recordCount} source records; ${wantedKeys.size} wanted keys`);

  const disagreement = projectionDisagreement(
    projection,
    createProjection(resource.crs.proj_definition),
    sourceIndex.nativeBbox,
  );
  if (disagreement > PROJECTION_AGREEMENT_DEGREES) {
    throw new ImportError(
      `The PRJ WKT and the manifest proj_definition disagree by ${disagreement} degrees over the file extent`,
    );
  }
  log(
    `checked   PRJ WKT and manifest proj_definition agree within ${disagreement.toExponential(2)} degrees`,
  );

  const register = indexRegister(
    await readFile(registerFile, "utf8"),
    registerResource.delimiter ?? ",",
  );
  const formatters = await createFormatters(root);
  const context: BuildContext = {
    manifest,
    resource,
    registerResource,
    mapping,
    projection,
    tools,
    ...formatters,
  };

  const failures: string[] = [];
  const features: ImportedFeature[] = [];
  for (const entry of mapping.entries) {
    try {
      const registerIssues = verifyAgainstRegister(entry, register);
      if (registerIssues.length > 0) {
        throw new ImportError(`${entry.entity}: register check failed`, registerIssues);
      }
      const match = matchSourceRow(entry, sourceIndex);
      const imported = await buildImportedFeature(context, entry, match);
      features.push(imported);
      log(
        `prepared  ${entry.id}  record ${imported.sourceIndex}  ${imported.record.geometry.type}  ${imported.record.geometry.vertex_count} positions  ${imported.reversedRings} ring(s) reversed  ${entry.review.status}`,
      );
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      log(`FAILED    ${entry.id}`);
    }
  }
  if (failures.length > 0) {
    throw new ImportError(
      `${failures.length} of ${mapping.entries.length} entries failed; nothing was written`,
      failures,
    );
  }
  return { resource, features, recordCount: sourceIndex.recordCount };
}

/** Prepare and write the appellation table on its own. */
export async function importAppellationAreas(
  root: string,
  options: ImportOptions = {},
): Promise<ImportSummary> {
  const log = options.log ?? (() => {});
  const prepared = await prepareAppellationAreas(root, log);
  const written = await writeRecords(root, prepared.features, options, log);
  const stale = await findStaleFiles(root, [APPELLATION_AREA_KIND], prepared.features, log);
  return { ...prepared, written, stale };
}
