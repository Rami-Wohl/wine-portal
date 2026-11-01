import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Entity, GeographyRecord, Scene, Source } from "../../../src/content/model";
import {
  bboxesMatch,
  countVertices,
  geometryBbox,
  parseGeographyFeature,
  sha256Hex,
  validateGeometryStructure,
} from "../../geography/lib/geometry";
import { findDuplicates, unknownReferenceMessage } from "./diagnostics";
import { isNodeError } from "./files";
import type { LoadedRecord, ParsedGeography, ParsedGeographyFeature } from "./types";

/**
 * Validate canonical geography records and scenes against docs/atlas-plan.md §4 and §5.
 * Geometry is parsed here once so the display build never re-reads canonical files, but it
 * stays out of the knowledge bundle. An empty data/geography/ is valid.
 */
export async function validateGeography(
  geographyRecords: Array<LoadedRecord<GeographyRecord>>,
  sceneRecords: Array<LoadedRecord<Scene>>,
  entityRecords: Array<LoadedRecord<Entity>>,
  sourceRecords: Array<LoadedRecord<Source>>,
  issues: string[],
): Promise<ParsedGeography> {
  findDuplicates(
    geographyRecords.map(({ file, value }) => ({ key: value.id, file })),
    "geography record ID",
    issues,
  );
  findDuplicates(
    sceneRecords.map(({ file, value }) => ({ key: value.id, file })),
    "scene ID",
    issues,
  );
  findDuplicates(
    sceneRecords.map(({ file, value }) => ({ key: value.owner, file })),
    "scene owner",
    issues,
  );

  const entitiesById = new Map(entityRecords.map((record) => [record.value.id, record]));
  const sourceIdSet = new Set(sourceRecords.map(({ value }) => value.id));
  const recordsById = new Map(geographyRecords.map((record) => [record.value.id, record]));
  const recordIds = Array.from(recordsById.keys()).sort();
  const features = new Map<string, ParsedGeographyFeature>();

  for (const record of geographyRecords) {
    const { file, value } = record;
    if (path.basename(file) !== `${value.id}.yaml`) {
      issues.push(`${file}: must be named '${value.id}.yaml' after its record ID`);
    }
    if (path.basename(record.directory) !== value.kind) {
      issues.push(`${file}: must live in data/geography/features/${value.kind}/`);
    }

    if (value.owner) {
      const owner = entitiesById.get(value.owner);
      if (!owner) {
        issues.push(
          `${file}: owner: ${unknownReferenceMessage(
            value.owner,
            entityRecords.map(({ value }) => value.id).sort(),
          )}`,
        );
      } else if (owner.value.geography_id !== value.id) {
        issues.push(
          `${file}: owner '${value.owner}' must declare geography_id '${value.id}' in ${owner.file}` +
            (owner.value.geography_id ? `; it declares '${owner.value.geography_id}'` : ""),
        );
      }
    }
    if (!sourceIdSet.has(value.source.source_id)) {
      issues.push(
        `${file}: source.source_id: ${unknownReferenceMessage(
          value.source.source_id,
          Array.from(sourceIdSet).sort(),
          "source",
        )}`,
      );
    }
    const geometryPath = path.join(record.directory, value.geometry.file);
    const geometryFile = path.join(path.dirname(file), value.geometry.file);
    let bytes: Buffer;
    try {
      bytes = await readFile(geometryPath);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        issues.push(`${file}: geometry.file '${value.geometry.file}' is missing`);
        continue;
      }
      throw error;
    }
    const checksum = sha256Hex(bytes);
    if (checksum !== value.geometry.sha256) {
      issues.push(
        `${file}: geometry.sha256 does not match ${geometryFile} (${checksum}); re-run the import instead of editing geometry by hand`,
      );
    }
    const parsed = parseGeographyFeature(bytes.toString("utf8"), geometryFile);
    issues.push(...parsed.issues);
    if (!parsed.feature) continue;
    const geometry = parsed.feature.geometry;
    if (geometry.type !== value.geometry.type) {
      issues.push(
        `${file}: geometry.type '${value.geometry.type}' does not match ${geometryFile}, which contains a ${geometry.type}`,
      );
      continue;
    }
    const structureIssues = validateGeometryStructure(geometry, geometryFile);
    issues.push(...structureIssues);
    if (structureIssues.length > 0) continue;
    const vertexCount = countVertices(geometry);
    if (vertexCount !== value.geometry.vertex_count) {
      issues.push(
        `${file}: geometry.vertex_count ${value.geometry.vertex_count} does not match ${geometryFile}, which has ${vertexCount} positions`,
      );
    }
    const bbox = geometryBbox(geometry);
    if (!bboxesMatch(bbox, value.geometry.bbox)) {
      issues.push(
        `${file}: geometry.bbox [${value.geometry.bbox.join(", ")}] does not match ${geometryFile}, whose bbox is [${bbox.join(", ")}]`,
      );
    }
    features.set(value.id, { record, feature: parsed.feature });
  }

  for (const entity of entityRecords) {
    const geographyId = entity.value.geography_id;
    if (!geographyId) continue;
    const record = recordsById.get(geographyId);
    if (!record) {
      issues.push(
        `${entity.file}: geography_id '${geographyId}' has no record under data/geography/features; add the verified record or remove the reference`,
      );
    } else if (record.value.owner !== entity.value.id) {
      issues.push(
        `${entity.file}: geography_id '${geographyId}' belongs to ${record.value.owner ? `'${record.value.owner}'` : "an orientation feature"} in ${record.file}`,
      );
    }
  }

  const entityIds = entityRecords.map(({ value }) => value.id).sort();

  for (const scene of sceneRecords) {
    const { file, value } = scene;
    if (path.basename(file) !== `${value.id}.yaml`) {
      issues.push(`${file}: must be named '${value.id}.yaml' after its scene ID`);
    }
    const owner = entitiesById.get(value.owner);
    if (!owner) {
      issues.push(`${file}: owner: ${unknownReferenceMessage(value.owner, entityIds)}`);
    } else if (owner.value.type !== "region") {
      issues.push(`${file}: owner '${value.owner}' must be a region entity`);
    }
    const sceneFeatureIds = new Set<string>();
    for (const layer of value.layers) {
      for (const featureId of layer.features) {
        sceneFeatureIds.add(featureId);
        const record = recordsById.get(featureId);
        if (!record) {
          issues.push(
            `${file}: layer '${layer.id}': ${unknownReferenceMessage(featureId, recordIds, "geography record")}`,
          );
          continue;
        }
        if (!layer.kinds.includes(record.value.kind)) {
          issues.push(
            `${file}: layer '${layer.id}' lists '${featureId}' of kind '${record.value.kind}', but allows ${layer.kinds.join(", ")}`,
          );
        }
      }
    }
    for (const entityId of value.intended_entities) {
      const entity = entitiesById.get(entityId);
      if (!entity) {
        issues.push(`${file}: intended_entities: ${unknownReferenceMessage(entityId, entityIds)}`);
        continue;
      }
      // The entity's own geography_id names its record; owner mismatches are reported above.
      const record = entity.value.geography_id
        ? recordsById.get(entity.value.geography_id)
        : undefined;
      const published = record?.value.review.status === "published" ? record : undefined;
      if (published && !sceneFeatureIds.has(published.value.id)) {
        issues.push(
          `${file}: intended entity '${entityId}' has the published record '${published.value.id}', which no layer of this scene includes`,
        );
      }
    }
  }

  return { features, scenes: sceneRecords };
}
