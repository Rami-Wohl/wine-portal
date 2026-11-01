import { z } from "zod";
import {
  dateSchema,
  entityIdSchema,
  localizedTextSchema,
  scalarSchema,
  slugSchema,
  sourceIdSchema,
  type Locale,
} from "./common";

// Canonical geography records and scene definitions follow docs/atlas-plan.md §4 and §5.
// Geometry itself lives in the paired GeoJSON file and never enters the knowledge bundle.

export const GEOGRAPHY_KINDS = [
  "appellation-area",
  "river",
  "water-body",
  "coastline",
  "populated-place",
] as const;

export type GeographyKind = (typeof GEOGRAPHY_KINDS)[number];

export const GEOGRAPHY_GEOMETRY_TYPES = [
  "Polygon",
  "MultiPolygon",
  "LineString",
  "MultiLineString",
  "Point",
] as const;

export type GeographyGeometryType = (typeof GEOGRAPHY_GEOMETRY_TYPES)[number];

export const GEOGRAPHY_REVIEW_STATUSES = ["imported", "reviewed", "published", "held"] as const;

export type GeographyReviewStatus = (typeof GEOGRAPHY_REVIEW_STATUSES)[number];

/** Layer kinds that may share one scene layer; a layer never mixes groups. */
export const GEOGRAPHY_KIND_GROUPS = {
  water: ["coastline", "water-body", "river"],
  appellation: ["appellation-area"],
  places: ["populated-place"],
} as const satisfies Record<string, readonly GeographyKind[]>;

/**
 * Licences a geography record may declare. A new licence needs its own review before it
 * is added here; the build copies name and URL into the public credits.
 */
export const GEOGRAPHY_LICENCES = {
  "etalab-2.0": {
    name: "Licence Ouverte / Open Licence 2.0",
    url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
  },
} as const satisfies Record<string, { name: string; url: string }>;

export type GeographyLicenceId = keyof typeof GEOGRAPHY_LICENCES;

const GEOGRAPHY_LICENCE_IDS = Object.keys(GEOGRAPHY_LICENCES) as [
  GeographyLicenceId,
  ...GeographyLicenceId[],
];

const kindPattern = GEOGRAPHY_KINDS.join("|");

export const geographyIdPattern = new RegExp(
  `^geo\\.(?:${kindPattern})\\.[a-z0-9]+(?:-[a-z0-9]+)*$`,
);

export const geographyIdSchema = z
  .string()
  .regex(geographyIdPattern, "must be 'geo.<kind>.<slug>' with a known geography kind");

export const sceneIdSchema = z
  .string()
  .regex(/^scene\.[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be 'scene.<slug>'");

export const sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 hex digest");

const crsCodeSchema = z
  .string()
  .regex(/^[A-Za-z]+:[A-Za-z0-9_.-]+$/, "must be an authority code such as 'EPSG:2154'");

/** [minLon, minLat, maxLon, maxLat] in EPSG:4326, longitude first. */
export const lonLatBboxSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .superRefine((bbox, context) => {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (!bbox.every(Number.isFinite)) {
      context.addIssue({ code: "custom", message: "must contain finite numbers" });
      return;
    }
    if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90) {
      context.addIssue({
        code: "custom",
        message: "must stay within longitude [-180, 180] and latitude [-90, 90]",
      });
    }
    if (minLon > maxLon || minLat > maxLat) {
      context.addIssue({
        code: "custom",
        message: "must be ordered [minLon, minLat, maxLon, maxLat]",
      });
    }
  });

export type LonLatBbox = [number, number, number, number];

export const geographyTransformationStepSchema = z.discriminatedUnion("step", [
  z
    .object({
      step: z.literal("reproject"),
      from: crsCodeSchema,
      to: z.literal("EPSG:4326"),
      axis_order: z.literal("lon-lat"),
      tool: z.string().min(1),
    })
    .strict(),
  z
    .object({
      step: z.literal("ring-orientation"),
      convention: z.literal("rfc7946"),
    })
    .strict(),
  z
    .object({
      step: z.literal("coordinate-precision"),
      decimals: z.number().int().min(0),
      unit: z.literal("degree"),
    })
    .strict(),
  z
    .object({
      step: z.literal("clip"),
      envelope: lonLatBboxSchema,
      tool: z.string().min(1).optional(),
    })
    .strict(),
]);

export const geographyRecordSchema = z
  .object({
    id: geographyIdSchema,
    kind: z.enum(GEOGRAPHY_KINDS),
    owner: entityIdSchema.optional(),
    names: localizedTextSchema.optional(),
    geometry: z
      .object({
        file: z.string().regex(/^geo\.[a-z0-9.-]+\.geojson$/, "must be '<record id>.geojson'"),
        type: z.enum(GEOGRAPHY_GEOMETRY_TYPES),
        sha256: sha256Schema,
        vertex_count: z.number().int().positive(),
        bbox: lonLatBboxSchema,
      })
      .strict(),
    source: z
      .object({
        source_id: sourceIdSchema,
        dataset_id: z.string().min(1),
        resource_id: z.string().min(1),
        release: dateSchema,
        retrieved_at: dateSchema,
        resource_sha256: sha256Schema,
        crs: crsCodeSchema,
        encoding: z.string().min(1),
        feature_key: z
          .record(z.string().min(1), scalarSchema)
          .refine(
            (key) => Object.keys(key).length > 0,
            "must name the reviewed source-specific identity, never a row position",
          ),
      })
      .strict(),
    licence: z
      .object({
        id: z.enum(GEOGRAPHY_LICENCE_IDS),
        attribution: z.string().min(1),
        notes: z.string().min(1).optional(),
      })
      .strict(),
    transformation: z.array(geographyTransformationStepSchema),
    meaning: slugSchema,
    precision: slugSchema,
    limitations: z.string().min(1),
    review: z
      .object({
        status: z.enum(GEOGRAPHY_REVIEW_STATUSES),
        reviewed_at: dateSchema.optional(),
        notes: z.string().min(1).optional(),
      })
      .strict(),
    supersedes: geographyIdSchema.nullable().optional(),
  })
  .strict()
  .superRefine((record, context) => {
    const idKind = record.id.split(".")[1];
    if (idKind !== record.kind) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: `must use the record kind '${record.kind}' as its second segment`,
      });
    }
    if (record.geometry.file !== `${record.id}.geojson`) {
      context.addIssue({
        code: "custom",
        path: ["geometry", "file"],
        message: `must be '${record.id}.geojson'`,
      });
    }
    if (record.kind === "appellation-area") {
      if (!record.owner) {
        context.addIssue({
          code: "custom",
          path: ["owner"],
          message: "is required for an appellation-area record",
        });
      } else if (!record.owner.startsWith("appellation.")) {
        context.addIssue({
          code: "custom",
          path: ["owner"],
          message: "must be an appellation entity; a cultural region never owns a drawn outline",
        });
      }
    } else if (record.owner) {
      context.addIssue({
        code: "custom",
        path: ["owner"],
        message: `is only supported for appellation-area records; a ${record.kind} is an orientation feature`,
      });
    }
    if (!record.owner && !record.names) {
      context.addIssue({
        code: "custom",
        path: ["names"],
        message: "is required when the record has no owner",
      });
    }
    if (record.review.status !== "imported" && !record.review.reviewed_at) {
      context.addIssue({
        code: "custom",
        path: ["review", "reviewed_at"],
        message: `is required once a record is ${record.review.status}`,
      });
    }
    if (record.review.status === "held" && !record.review.notes) {
      context.addIssue({
        code: "custom",
        path: ["review", "notes"],
        message: "must explain why the record is held",
      });
    }
    if (record.supersedes === record.id) {
      context.addIssue({
        code: "custom",
        path: ["supersedes"],
        message: "must not reference the record itself",
      });
    }
  });

export type GeographyRecord = z.infer<typeof geographyRecordSchema>;

export type GeographyTransformationStep = z.infer<typeof geographyTransformationStepSchema>;

export const SCENE_LAYER_ROLES = ["context", "selectable"] as const;

export const sceneLayerSchema = z
  .object({
    id: slugSchema,
    kinds: z.array(z.enum(GEOGRAPHY_KINDS)).min(1),
    features: z.array(geographyIdSchema).min(1),
    role: z.enum(SCENE_LAYER_ROLES).optional(),
  })
  .strict();

export const sceneExtentSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("fit"), padding: z.number().min(0).lt(1) }).strict(),
  z.object({ mode: z.literal("bbox"), bbox: lonLatBboxSchema }).strict(),
]);

export const sceneSchema = z
  .object({
    id: sceneIdSchema,
    owner: entityIdSchema,
    extent: sceneExtentSchema,
    projection: z.literal("mercator"),
    layers: z.array(sceneLayerSchema).min(1),
    intended_entities: z.array(entityIdSchema),
  })
  .strict()
  .superRefine((scene, context) => {
    if (!scene.owner.startsWith("region.")) {
      context.addIssue({
        code: "custom",
        path: ["owner"],
        message: "must be a region entity",
      });
    } else if (scene.id !== `scene.${scene.owner.slice("region.".length)}`) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: `must be 'scene.${scene.owner.slice("region.".length)}' for owner '${scene.owner}'`,
      });
    }
    const layerIds = new Set<string>();
    const featureIds = new Set<string>();
    for (const [index, layer] of scene.layers.entries()) {
      if (layerIds.has(layer.id)) {
        context.addIssue({
          code: "custom",
          path: ["layers", index, "id"],
          message: `duplicates layer '${layer.id}'`,
        });
      }
      layerIds.add(layer.id);
      if (new Set(layer.kinds).size !== layer.kinds.length) {
        context.addIssue({
          code: "custom",
          path: ["layers", index, "kinds"],
          message: "must not repeat a kind",
        });
      }
      const group = sceneLayerGroup(layer.kinds);
      if (!group) {
        context.addIssue({
          code: "custom",
          path: ["layers", index, "kinds"],
          message: "must stay within one group: water kinds, appellation-area, or populated-place",
        });
      }
      if (group === "appellation" && !layer.role) {
        context.addIssue({
          code: "custom",
          path: ["layers", index, "role"],
          message: "is required for an appellation-area layer: 'context' or 'selectable'",
        });
      }
      if (group && group !== "appellation" && layer.role) {
        context.addIssue({
          code: "custom",
          path: ["layers", index, "role"],
          message: "is only supported for appellation-area layers",
        });
      }
      for (const [featureIndex, featureId] of layer.features.entries()) {
        if (featureIds.has(featureId)) {
          context.addIssue({
            code: "custom",
            path: ["layers", index, "features", featureIndex],
            message: `feature '${featureId}' appears more than once in the scene`,
          });
        }
        featureIds.add(featureId);
      }
    }
    const intended = new Set<string>();
    for (const [index, entityId] of scene.intended_entities.entries()) {
      if (!entityId.startsWith("appellation.")) {
        context.addIssue({
          code: "custom",
          path: ["intended_entities", index],
          message: "must be an appellation entity; coverage is computed for appellation areas",
        });
      }
      if (intended.has(entityId)) {
        context.addIssue({
          code: "custom",
          path: ["intended_entities", index],
          message: `duplicates '${entityId}'`,
        });
      }
      intended.add(entityId);
    }
  });

export type Scene = z.infer<typeof sceneSchema>;

export type SceneLayer = z.infer<typeof sceneLayerSchema>;

export function sceneLayerGroup(
  kinds: readonly GeographyKind[],
): keyof typeof GEOGRAPHY_KIND_GROUPS | undefined {
  return (Object.keys(GEOGRAPHY_KIND_GROUPS) as Array<keyof typeof GEOGRAPHY_KIND_GROUPS>).find(
    (group) =>
      kinds.every((kind) =>
        (GEOGRAPHY_KIND_GROUPS[group] as readonly GeographyKind[]).includes(kind),
      ),
  );
}

/** The display role of a scene layer: explicit for appellation layers, derived otherwise. */
export function sceneLayerRole(layer: Pick<SceneLayer, "kinds" | "role">): AtlasLayerRole {
  if (layer.role) return layer.role;
  const group = sceneLayerGroup(layer.kinds);
  if (group === "water") return "water";
  if (group === "places") return "places";
  throw new Error(`Scene layer with kinds ${layer.kinds.join(", ")} has no display role`);
}

// Generated display views, written by scripts/geography/build.ts and read through
// src/content/geography.ts. Everything is pre-projected; the runtime needs no geometry library.

export type AtlasGeometryType = "area" | "line" | "point";

export type AtlasLayerRole = "water" | "context" | "selectable" | "places";

export interface AtlasFeatureView {
  id: string;
  kind: GeographyKind;
  owner?: string;
  names: Record<Locale, string>;
  geometryType: AtlasGeometryType;
  path?: string;
  point?: [number, number];
  labelAnchor?: [number, number];
  areaRank?: number;
}

export interface AtlasLayerView {
  id: string;
  role: AtlasLayerRole;
  features: AtlasFeatureView[];
}

export interface AtlasCoverageView {
  intended: string[];
  shown: string[];
  missing: Array<{ entity: string; reason: "held" | "no-record" | "unpublished" }>;
}

export interface AtlasCreditView {
  sourceId: string;
  publisher: string;
  licence: { id: string; name: string; url: string };
  /** Dataset page of the source record; absent when the source has no URL. */
  url?: string;
  /** Verbatim attribution line(s) required by the licence, taken from the records. */
  attribution: string;
}

export interface AtlasSceneView {
  id: string;
  owner: string;
  /** English slug of the owner entity; also the Atlas route segment. */
  slug: string;
  viewBox: { width: number; height: number };
  /** Unprojected extent as [minLon, minLat, maxLon, maxLat]. */
  bbox: LonLatBbox;
  projection: { name: "mercator"; scale: number; translate: [number, number] };
  layers: AtlasLayerView[];
  coverage: AtlasCoverageView;
  credits: AtlasCreditView[];
  simplification: {
    method: string;
    /** Minimum triangle area kept, in steradians. */
    tolerance: number;
    /** The same threshold as a viewBox pixel length; 0 means no simplification. */
    pixels: number;
    vertexCountBefore: number;
    vertexCountAfter: number;
    /**
     * Features with sub-parts (line segments, holes, exclave polygons) that have no extent
     * at display resolution and are therefore not drawn; empty when nothing was dropped.
     */
    droppedParts: Array<{ featureId: string; parts: number }>;
  };
}

/** Width of the region-chooser thumbnail viewBox in user units (docs/atlas-plan.md §7). */
export const ATLAS_THUMBNAIL_WIDTH = 160;

/** Path text budget per thumbnail; the build simplifies further until it holds. */
export const ATLAS_THUMBNAIL_PATH_BUDGET_BYTES = 3 * 1024;

/**
 * A small derived view of a scene's verified selectable appellation areas for the Atlas region
 * chooser:
 * the same features as the scene, never an outline or shape of its own. Validated strictly
 * because it is the one display view the build assembles specially for the index.
 */
export const atlasThumbnailSchema = z
  .object({
    viewBox: z
      .object({
        width: z.literal(ATLAS_THUMBNAIL_WIDTH),
        height: z.number().int().positive(),
      })
      .strict(),
    /** One path per selectable area: whole-unit rings, an absolute move, relative offsets. */
    paths: z.array(z.string().regex(/^(?:M-?\d+[ -]?-?\d+(?:l[\d -]+)?z)+$/)).min(1),
  })
  .strict()
  .superRefine((thumbnail, context) => {
    const bytes = thumbnail.paths.reduce((sum, path) => sum + path.length, 0);
    if (bytes > ATLAS_THUMBNAIL_PATH_BUDGET_BYTES) {
      context.addIssue({
        code: "custom",
        path: ["paths"],
        message: `path text is ${bytes} bytes, over the ${ATLAS_THUMBNAIL_PATH_BUDGET_BYTES}-byte budget`,
      });
    }
  });

export type AtlasThumbnail = z.infer<typeof atlasThumbnailSchema>;

export interface AtlasSceneSummary extends Omit<AtlasSceneView, "layers"> {
  featureCount: number;
  /** Owners of the features drawn in a selectable layer, sorted; used to pick an entity's scene. */
  selectableEntities: string[];
  /** Region-chooser thumbnail; optional so older index files and fixtures still read. */
  thumbnail?: AtlasThumbnail;
}

export interface AtlasIndex {
  scenes: AtlasSceneSummary[];
}
