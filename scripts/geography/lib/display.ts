import { gzipSync } from "fflate";
import type { Position } from "geojson";
import { feature as topologyFeature } from "topojson-client";
import { topology as buildTopology } from "topojson-server";
import { presimplify, simplify, sphericalTriangleArea } from "topojson-simplify";
import type { Objects, Topology } from "topojson-specification";
import {
  GEOGRAPHY_LICENCES,
  sceneLayerRole,
  type AtlasCoverageView,
  type AtlasCreditView,
  type AtlasFeatureView,
  type AtlasGeometryType,
  type AtlasIndex,
  type AtlasLayerRole,
  type AtlasLayerView,
  type AtlasSceneSummary,
  type AtlasSceneView,
  type Entity,
  type GeographyRecord,
  type LonLatBbox,
  type Scene,
  type Source,
} from "../../../src/content/model";
import { AtlasBuildError, SceneBuildError } from "./errors";
import {
  countVertices,
  geometryPositions,
  geometryTypeToDisplay,
  type GeographyFeature,
  type GeographyGeometry,
} from "./geometry";
import {
  bboxCorners,
  fitProjection,
  pixelAreaSteradians,
  projectPosition,
  projectShape,
  PROJECTION_DECIMALS,
  round,
  sphericalArea,
  VIEWBOX_WIDTH,
  type ProjectedShape,
} from "./projection";

export { AtlasBuildError } from "./errors";
export { fitProjection, labelAnchorForPolygons, VIEWBOX_WIDTH } from "./projection";

export const SCENE_GZIP_BUDGET_BYTES = 250 * 1024;
export const INDEX_GZIP_BUDGET_BYTES = 20 * 1024;

/** Shared boundaries only join when both records quantize to the same grid. */
const PRE_QUANTIZATION = 1e5;
/** Triangle-area thresholds in viewBox pixels, tried in order until the budget holds. */
const SIMPLIFICATION_PIXEL_LADDER = [0, 0.25, 0.5, 1, 2, 4, 8] as const;
const SIMPLIFICATION_METHOD =
  "topojson-simplify Visvalingam-Whyatt on spherical triangle area (steradians); topology preserved, no feature dropped; coordinates pre-quantized to 1e5 steps; display paths rounded to 0.1 viewBox units; sub-parts without extent at that resolution are left out and counted";

export interface AtlasBuildRecord {
  file: string;
  record: GeographyRecord;
  feature: GeographyFeature;
}

export interface AtlasBuildScene {
  file: string;
  scene: Scene;
}

export interface AtlasBuildInput {
  records: AtlasBuildRecord[];
  scenes: AtlasBuildScene[];
  entities: Entity[];
  sources: Source[];
  budgets?: { sceneGzipBytes?: number; indexGzipBytes?: number };
}

export interface AtlasBuildOutput {
  index: AtlasIndex;
  scenes: AtlasSceneView[];
  /** Relative output paths with their exact file contents. */
  files: Record<string, string>;
  sizes: Record<string, { bytes: number; gzipBytes: number }>;
  report: string[];
}

interface ResolvedFeature {
  id: string;
  record: GeographyRecord;
  feature: GeographyFeature;
  names: Record<"nl" | "en", string>;
  displayType: AtlasGeometryType;
  sphericalArea: number;
}

interface ResolvedLayer {
  id: string;
  role: AtlasLayerRole;
  features: ResolvedFeature[];
}

interface SceneContext {
  entitiesById: Map<string, Entity>;
  sourcesById: Map<string, Source>;
  recordsById: Map<string, AtlasBuildRecord>;
  sceneBudget: number;
}

export function gzipSize(text: string): number {
  return gzipSync(new TextEncoder().encode(text), { level: 9, mtime: 0 }).length;
}

export function serializeDisplay(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

export function formatKib(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function simplifiedGeometry(topology: Topology, id: string): GeographyGeometry {
  const object = topology.objects[id];
  if (!object) throw new SceneBuildError(`topology lost feature '${id}'`);
  const result = topologyFeature(topology, object);
  if (result.type !== "Feature" || !result.geometry) {
    throw new SceneBuildError(`topology returned no geometry for feature '${id}'`);
  }
  return result.geometry as GeographyGeometry;
}

function resolveLayers(
  input: AtlasBuildScene,
  context: SceneContext,
  report: string[],
): ResolvedLayer[] {
  return input.scene.layers.map((layer) => {
    const role = sceneLayerRole(layer);
    const features: ResolvedFeature[] = [];
    for (const id of layer.features) {
      const entry = context.recordsById.get(id);
      if (!entry)
        throw new SceneBuildError(`layer '${layer.id}' references unknown record '${id}'`);
      const { record, feature } = entry;
      if (record.review.status !== "published") {
        report.push(
          `${input.file}: '${id}' is ${record.review.status}, not published; excluded from layer '${layer.id}'`,
        );
        continue;
      }
      let names: Record<"nl" | "en", string>;
      if (record.owner) {
        const owner = context.entitiesById.get(record.owner);
        if (!owner)
          throw new SceneBuildError(`'${id}' owner '${record.owner}' is not a known entity`);
        names = owner.names;
      } else if (record.names) {
        names = record.names;
      } else {
        throw new SceneBuildError(`'${id}' has neither an owner nor names`);
      }
      features.push({
        id,
        record,
        feature,
        names,
        displayType: geometryTypeToDisplay(feature.geometry.type),
        sphericalArea: sphericalArea(feature.geometry),
      });
    }
    const order: Record<AtlasGeometryType, number> = { area: 0, line: 1, point: 2 };
    // Larger areas first so smaller areas stay reachable; lines and points keep authored order.
    features.sort(
      (left, right) =>
        order[left.displayType] - order[right.displayType] ||
        (left.displayType === "area" && right.displayType === "area"
          ? right.sphericalArea - left.sphericalArea || left.id.localeCompare(right.id)
          : 0),
    );
    return { id: layer.id, role, features };
  });
}

function coverageForScene(
  scene: Scene,
  shownIds: Set<string>,
  context: SceneContext,
): AtlasCoverageView {
  const coverage: AtlasCoverageView = {
    intended: [...scene.intended_entities],
    shown: [],
    missing: [],
  };
  for (const entityId of scene.intended_entities) {
    const entity = context.entitiesById.get(entityId);
    const entry = entity?.geography_id ? context.recordsById.get(entity.geography_id) : undefined;
    if (!entry) {
      coverage.missing.push({ entity: entityId, reason: "no-record" });
    } else if (entry.record.review.status === "published") {
      if (!shownIds.has(entry.record.id)) {
        throw new SceneBuildError(
          `intended entity '${entityId}' has the published record '${entry.record.id}', which no layer includes`,
        );
      }
      coverage.shown.push(entityId);
    } else {
      coverage.missing.push({
        entity: entityId,
        reason: entry.record.review.status === "held" ? "held" : "unpublished",
      });
    }
  }
  return coverage;
}

function creditsForScene(features: ResolvedFeature[], context: SceneContext): AtlasCreditView[] {
  const bySource = new Map<string, ResolvedFeature[]>();
  for (const feature of features) {
    const list = bySource.get(feature.record.source.source_id) ?? [];
    list.push(feature);
    bySource.set(feature.record.source.source_id, list);
  }
  return Array.from(bySource.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, sourceFeatures]) => {
      const source = context.sourcesById.get(sourceId);
      if (!source) throw new SceneBuildError(`source '${sourceId}' is not a known source record`);
      const licenceIds = Array.from(
        new Set(sourceFeatures.map((item) => item.record.licence.id)),
      ).sort();
      if (licenceIds.length > 1) {
        throw new SceneBuildError(
          `records from '${sourceId}' declare different licences (${licenceIds.join(", ")}); one source carries one licence`,
        );
      }
      const licence = GEOGRAPHY_LICENCES[licenceIds[0]];
      const unique = (values: string[]) => Array.from(new Set(values)).sort();
      return {
        sourceId,
        publisher: source.publisher,
        licence: { id: licenceIds[0], name: licence.name, url: licence.url },
        ...(source.url ? { url: source.url } : {}),
        attribution: unique(sourceFeatures.map((item) => item.record.licence.attribution)).join(
          "; ",
        ),
      };
    });
}

interface SceneBuild {
  view: AtlasSceneView;
  json: string;
  gzipBytes: number;
}

function buildScene(input: AtlasBuildScene, context: SceneContext, report: string[]): SceneBuild {
  const { scene, file } = input;
  const owner = context.entitiesById.get(scene.owner);
  if (!owner) throw new SceneBuildError(`owner '${scene.owner}' is not a known entity`);

  const layers = resolveLayers(input, context, report);
  const published = layers.flatMap((layer) => layer.features);
  if (published.length === 0) throw new SceneBuildError("has no published features to display");

  let fitted: ReturnType<typeof fitProjection>;
  if (scene.extent.mode === "fit") {
    // docs/atlas-plan.md §5: fit the listed (selectable) appellation areas only. Context areas
    // such as an umbrella appellation are clipped by the viewBox and never widen the extent.
    const areas = layers
      .filter((layer) => layer.role === "selectable")
      .flatMap((layer) => layer.features)
      .filter((feature) => feature.displayType === "area");
    if (areas.length === 0) {
      throw new SceneBuildError(
        "has no published selectable appellation areas to fit; publish a record or set extent.mode to bbox",
      );
    }
    fitted = fitProjection(
      areas.flatMap((area) => geometryPositions(area.feature.geometry)),
      scene.extent.padding,
    );
  } else {
    fitted = fitProjection(bboxCorners(scene.extent.bbox), 0);
  }
  const { projection, height } = fitted;
  const invert = projection.invert;
  if (!invert) throw new SceneBuildError("projection cannot be inverted");
  const southWest = invert([0, height]);
  const northEast = invert([VIEWBOX_WIDTH, 0]);
  if (!southWest || !northEast) throw new SceneBuildError("viewBox corners cannot be inverted");
  const bbox: LonLatBbox = [
    round(southWest[0], PROJECTION_DECIMALS),
    round(southWest[1], PROJECTION_DECIMALS),
    round(northEast[0], PROJECTION_DECIMALS),
    round(northEast[1], PROJECTION_DECIMALS),
  ];
  const [tx, ty] = projection.translate();

  const shownIds = new Set(published.map((feature) => feature.id));
  const coverage = coverageForScene(scene, shownIds, context);
  const credits = creditsForScene(published, context);

  const shaped = published.filter((feature) => feature.displayType !== "point");
  const objects = Object.fromEntries(
    shaped.map((feature) => [feature.id, structuredClone(feature.feature.geometry)]),
  );
  const base: Topology<Objects> = presimplify(
    buildTopology(objects, PRE_QUANTIZATION) as unknown as Topology<Objects>,
    sphericalTriangleArea,
  );
  const vertexCountBefore = shaped.reduce(
    (sum, feature) => sum + countVertices(feature.feature.geometry),
    0,
  );
  const pixelArea = pixelAreaSteradians(projection, (bbox[1] + bbox[3]) / 2);

  let chosen: (SceneBuild & { pixels: number }) | undefined;
  let collapsed: string | undefined;
  for (const pixels of SIMPLIFICATION_PIXEL_LADDER) {
    const tolerance = pixels === 0 ? 0 : pixels * pixels * pixelArea;
    const simplified = simplify(base, tolerance);
    const shapes = new Map<string, ProjectedShape>();
    const droppedParts: Array<{ featureId: string; parts: number }> = [];
    let vertexCountAfter = 0;
    for (const feature of shaped) {
      const shape = projectShape(projection, simplifiedGeometry(simplified, feature.id));
      // A rung that leaves a feature without any drawable part is rejected; parts that
      // vanish at display resolution are dropped and counted (docs/atlas-plan.md §7).
      if (shape.collapsed) {
        collapsed = `'${feature.id}' (${shape.collapsed})`;
        break;
      }
      vertexCountAfter += shape.vertexCount;
      if (shape.droppedParts > 0) {
        droppedParts.push({ featureId: feature.id, parts: shape.droppedParts });
      }
      shapes.set(feature.id, shape);
    }
    if (collapsed) break;
    droppedParts.sort((left, right) => left.featureId.localeCompare(right.featureId));

    const view: AtlasSceneView = {
      id: scene.id,
      owner: scene.owner,
      slug: owner.slugs.en,
      viewBox: { width: VIEWBOX_WIDTH, height },
      bbox,
      projection: {
        name: "mercator",
        scale: round(projection.scale(), PROJECTION_DECIMALS),
        translate: [round(tx, PROJECTION_DECIMALS), round(ty, PROJECTION_DECIMALS)],
      },
      layers: layers.map((layer): AtlasLayerView => ({
        id: layer.id,
        role: layer.role,
        features: layer.features.map((feature, index): AtlasFeatureView => {
          const view: AtlasFeatureView = {
            id: feature.id,
            kind: feature.record.kind,
            ...(feature.record.owner ? { owner: feature.record.owner } : {}),
            names: { nl: feature.names.nl, en: feature.names.en },
            geometryType: feature.displayType,
          };
          if (feature.displayType === "point") {
            view.point = projectPosition(
              projection,
              feature.feature.geometry.coordinates as Position,
            );
            return view;
          }
          const shape = shapes.get(feature.id);
          if (!shape) throw new SceneBuildError(`no projected shape for '${feature.id}'`);
          view.path = shape.path;
          if (shape.labelAnchor) view.labelAnchor = shape.labelAnchor;
          if (feature.displayType === "area") view.areaRank = index + 1;
          return view;
        }),
      })),
      coverage,
      credits,
      simplification: {
        method: SIMPLIFICATION_METHOD,
        tolerance,
        pixels,
        vertexCountBefore,
        vertexCountAfter,
        droppedParts,
      },
    };
    const json = serializeDisplay(view);
    const gzipBytes = gzipSize(json);
    chosen = { view, json, gzipBytes, pixels };
    if (gzipBytes <= context.sceneBudget) break;
  }

  if (!chosen) {
    throw new SceneBuildError(
      `cannot be displayed: even without simplification, quantization or display rounding collapses ${collapsed}; the feature is too small for this extent`,
    );
  }
  if (chosen.gzipBytes > context.sceneBudget) {
    throw new SceneBuildError(
      `display asset is ${formatKib(chosen.gzipBytes)} gzip at ${chosen.pixels} px tolerance, over the ${formatKib(context.sceneBudget)} budget; ${
        collapsed
          ? `further simplification would collapse ${collapsed}`
          : "the simplification ladder is exhausted"
      }. Split the scene or reduce its extent instead of dropping features (${file}).`,
    );
  }
  const droppedTotal = chosen.view.simplification.droppedParts.reduce(
    (sum, entry) => sum + entry.parts,
    0,
  );
  report.push(
    `${scene.id}: ${published.length} features, ${formatKib(chosen.gzipBytes)} gzip at ${chosen.pixels} px tolerance, ${chosen.view.simplification.vertexCountAfter}/${vertexCountBefore} vertices, coverage ${coverage.shown.length}/${coverage.intended.length}${
      droppedTotal > 0
        ? `, ${droppedTotal} part${droppedTotal === 1 ? "" : "s"} below display resolution dropped`
        : ""
    }`,
  );
  return chosen;
}

export function sceneSummary(view: AtlasSceneView): AtlasSceneSummary {
  const { layers, ...rest } = view;
  const selectableEntities = Array.from(
    new Set(
      layers
        .filter((layer) => layer.role === "selectable")
        .flatMap((layer) => layer.features)
        .flatMap((feature) => (feature.owner ? [feature.owner] : [])),
    ),
  ).sort();
  return {
    ...rest,
    featureCount: layers.reduce((sum, layer) => sum + layer.features.length, 0),
    selectableEntities,
  };
}

/** Build every scene's display asset and the index deterministically; throws on any failure. */
export function buildAtlasDisplay(input: AtlasBuildInput): AtlasBuildOutput {
  const context: SceneContext = {
    entitiesById: new Map(input.entities.map((entity) => [entity.id, entity])),
    sourcesById: new Map(input.sources.map((source) => [source.id, source])),
    recordsById: new Map(input.records.map((entry) => [entry.record.id, entry])),
    sceneBudget: input.budgets?.sceneGzipBytes ?? SCENE_GZIP_BUDGET_BYTES,
  };
  const indexBudget = input.budgets?.indexGzipBytes ?? INDEX_GZIP_BUDGET_BYTES;
  const issues: string[] = [];
  const report: string[] = [];
  const files: Record<string, string> = {};
  const sizes: AtlasBuildOutput["sizes"] = {};
  const scenes: AtlasSceneView[] = [];

  for (const entry of [...input.scenes].sort((left, right) =>
    left.scene.id.localeCompare(right.scene.id),
  )) {
    try {
      const built = buildScene(entry, context, report);
      scenes.push(built.view);
      const filename = `scenes/${built.view.id}.json`;
      files[filename] = built.json;
      sizes[filename] = { bytes: Buffer.byteLength(built.json), gzipBytes: built.gzipBytes };
    } catch (error) {
      if (error instanceof SceneBuildError) issues.push(`${entry.file}: ${error.message}`);
      else throw error;
    }
  }

  const index: AtlasIndex = { scenes: scenes.map(sceneSummary) };
  const indexJson = serializeDisplay(index);
  const indexGzip = gzipSize(indexJson);
  files["index.json"] = indexJson;
  sizes["index.json"] = { bytes: Buffer.byteLength(indexJson), gzipBytes: indexGzip };
  if (indexGzip > indexBudget) {
    issues.push(
      `index.json is ${formatKib(indexGzip)} gzip, over the ${formatKib(indexBudget)} budget`,
    );
  }
  report.push(
    `index: ${scenes.length} scene${scenes.length === 1 ? "" : "s"}, ${formatKib(indexGzip)} gzip`,
  );
  if (issues.length > 0) throw new AtlasBuildError(issues.sort());
  return { index, scenes, files, sizes, report };
}
