import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  AtlasFeatureView,
  AtlasIndex,
  AtlasSceneSummary,
  AtlasSceneView,
  Entity,
  Locale,
  ResolvedRelation,
} from "./model";
import { localizedHref } from "@/i18n/routing";
import { getEntityById, getRelationsForEntity } from "./repository";

// The only runtime entry to generated Atlas display assets. The index is small and loaded
// once per server module; each scene is read from its own file on first use, never all at once.

export interface AtlasEntityLookups {
  getEntityById: (id: string) => Entity | undefined;
  getRelationsForEntity: (entityId: string) => ResolvedRelation[];
}

export interface AtlasSceneForEntity {
  scene: AtlasSceneView;
  /** The feature that draws the entity in this scene, when it has published geometry. */
  featureId: string | undefined;
}

export interface AtlasFeatureForEntity {
  sceneId: string;
  feature: AtlasFeatureView;
}

export interface AtlasRepository {
  getAtlasSceneSummaries: () => AtlasSceneSummary[];
  getPublishedAtlasSceneSummaries: () => AtlasSceneSummary[];
  getAtlasSceneById: (id: string) => AtlasSceneView | undefined;
  /** Resolves the English route slug and the owner's Dutch slug alias, like entity routes. */
  getAtlasSceneSummaryBySlug: (slug: string) => AtlasSceneSummary | undefined;
  getAtlasSceneBySlug: (slug: string) => AtlasSceneView | undefined;
  getAtlasSceneForEntity: (entityId: string) => AtlasSceneForEntity | undefined;
  getAtlasFeatureForEntity: (entityId: string) => AtlasFeatureForEntity | undefined;
}

interface AtlasRepositoryOptions {
  /** Directory holding index.json and scenes/<scene-id>.json. */
  directory: string;
  /**
   * In development the default repository keeps the generated files in the module graph so a
   * rebuild refreshes pages; fixtures read files. The branch is dead outside development.
   */
  hotReload: boolean;
  lookups: AtlasEntityLookups;
}

function findSceneFeature(scene: AtlasSceneView, entityId: string): AtlasFeatureView | undefined {
  return scene.layers
    .flatMap((layer) => layer.features)
    .find((feature) => feature.owner === entityId);
}

export function createAtlasRepository(options: AtlasRepositoryOptions): AtlasRepository {
  const { directory, hotReload, lookups } = options;

  function loadIndex(): AtlasIndex {
    if (process.env.NODE_ENV === "development") {
      // require has no inferred giant JSON type; this branch is eliminated in production.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      if (hotReload) return require("../generated/geography/index.json") as AtlasIndex;
    }
    // Keep production data out of JS/TS compilation. next.config.ts traces this directory.
    const file = path.join(directory, "index.json");
    try {
      return JSON.parse(readFileSync(file, "utf8")) as AtlasIndex;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        throw new Error(`Generated Atlas index is missing at ${file}; run npm run content:build`);
      }
      throw error;
    }
  }

  function loadScene(id: string): AtlasSceneView {
    if (process.env.NODE_ENV === "development") {
      // The static prefix keeps every scene file in the dev module graph for HMR.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      if (hotReload) return require(`../generated/geography/scenes/${id}.json`) as AtlasSceneView;
    }
    return JSON.parse(
      readFileSync(path.join(directory, "scenes", `${id}.json`), "utf8"),
    ) as AtlasSceneView;
  }

  const index = loadIndex();
  const summariesById = new Map(index.scenes.map((scene) => [scene.id, scene]));
  const summariesBySlug = new Map(index.scenes.map((scene) => [scene.slug, scene]));
  // Dutch slugs are permanent aliases of the English route (docs/localization-routing.md §2).
  const summariesByAlias = new Map(
    index.scenes.flatMap((scene) => {
      const dutch = lookups.getEntityById(scene.owner)?.slugs.nl;
      return dutch && dutch !== scene.slug ? [[dutch, scene] as const] : [];
    }),
  );
  const summariesByOwner = new Map(index.scenes.map((scene) => [scene.owner, scene]));
  const scenes = new Map<string, AtlasSceneView>();

  function getAtlasSceneById(id: string): AtlasSceneView | undefined {
    if (!summariesById.has(id)) return undefined;
    let scene = scenes.get(id);
    if (!scene) {
      scene = loadScene(id);
      scenes.set(id, scene);
    }
    return scene;
  }

  function getAtlasSceneSummaryBySlug(slug: string): AtlasSceneSummary | undefined {
    return summariesBySlug.get(slug) ?? summariesByAlias.get(slug);
  }

  function ownerIsPublished(summary: AtlasSceneSummary): boolean {
    return lookups.getEntityById(summary.owner)?.status === "active";
  }

  function parentRegions(entityId: string): string[] {
    return lookups
      .getRelationsForEntity(entityId)
      .filter((relation) => relation.source === entityId && relation.type === "part_of")
      .map((relation) => relation.target);
  }

  function sceneLists(summary: AtlasSceneSummary, entityId: string): boolean {
    return (
      summary.coverage.intended.includes(entityId) || summary.selectableEntities.includes(entityId)
    );
  }

  function withFeature(summary: AtlasSceneSummary, entityId: string): AtlasSceneForEntity {
    const scene = getAtlasSceneById(summary.id) as AtlasSceneView;
    return { scene, featureId: findSceneFeature(scene, entityId)?.id };
  }

  /**
   * The scene for an entity. A region owner gets its own scene. Otherwise the scene definitions
   * are the authority: among the scenes that list the entity in intended_entities (or draw it as
   * a selectable feature), the one with the fewest intended entities wins; ties go to a scene
   * whose owner the entity is part_of, then to the scene id. An entity no scene lists falls back
   * to the scene of a region it is part_of. Containment is never inferred from geometry.
   */
  function getAtlasSceneForEntity(entityId: string): AtlasSceneForEntity | undefined {
    const own = summariesByOwner.get(entityId);
    if (own) return { scene: getAtlasSceneById(own.id) as AtlasSceneView, featureId: undefined };
    const parents = new Set(parentRegions(entityId));
    const listing = index.scenes
      .filter((summary) => sceneLists(summary, entityId))
      .sort(
        (left, right) =>
          left.coverage.intended.length - right.coverage.intended.length ||
          Number(parents.has(right.owner)) - Number(parents.has(left.owner)) ||
          left.id.localeCompare(right.id),
      );
    if (listing.length > 0) return withFeature(listing[0], entityId);
    const parentScene = Array.from(parents)
      .map((parent) => summariesByOwner.get(parent))
      .filter((summary): summary is AtlasSceneSummary => Boolean(summary))
      .sort(
        (left, right) =>
          // The most specific parent: one that is not itself a parent of another candidate.
          Number(parentRegions(right.owner).includes(left.owner)) -
            Number(parentRegions(left.owner).includes(right.owner)) ||
          left.id.localeCompare(right.id),
      )[0];
    return parentScene ? withFeature(parentScene, entityId) : undefined;
  }

  return {
    getAtlasSceneSummaries: () => index.scenes,
    getPublishedAtlasSceneSummaries: () => index.scenes.filter(ownerIsPublished),
    getAtlasSceneById,
    getAtlasSceneSummaryBySlug,
    getAtlasSceneBySlug: (slug) => {
      const summary = getAtlasSceneSummaryBySlug(slug);
      return summary ? getAtlasSceneById(summary.id) : undefined;
    },
    getAtlasSceneForEntity,
    getAtlasFeatureForEntity: (entityId) => {
      const found = getAtlasSceneForEntity(entityId);
      if (!found?.featureId) return undefined;
      const feature = findSceneFeature(found.scene, entityId);
      return feature ? { sceneId: found.scene.id, feature } : undefined;
    },
  };
}

const atlas = createAtlasRepository({
  directory: path.join(process.cwd(), "src/generated/geography"),
  hotReload: true,
  lookups: { getEntityById, getRelationsForEntity },
});

export const getAtlasSceneSummaries = atlas.getAtlasSceneSummaries;
export const getPublishedAtlasSceneSummaries = atlas.getPublishedAtlasSceneSummaries;
export const getAtlasSceneById = atlas.getAtlasSceneById;
export const getAtlasSceneSummaryBySlug = atlas.getAtlasSceneSummaryBySlug;
export const getAtlasSceneBySlug = atlas.getAtlasSceneBySlug;
export const getAtlasSceneForEntity = atlas.getAtlasSceneForEntity;
export const getAtlasFeatureForEntity = atlas.getAtlasFeatureForEntity;

/** The Atlas overview scene when it exists: the Bordeaux region per docs/atlas-plan.md §2. */
export const ATLAS_OVERVIEW_SCENE_ID = "scene.bordeaux";

/**
 * Atlas is a labelled preview until the phase 3 release gate (docs/atlas-plan.md §10) flips
 * this. While it is true, Atlas routes stay `noindex`, publish only a canonical URL without
 * language alternates (docs/localization-routing.md §4), and stay out of the sitemap regardless
 * of which scenes exist.
 */
export const ATLAS_PREVIEW = true;

/** Scene routes reuse the English region slug like other entity routes. */
export function atlasSceneHref(slug: string, locale: Locale = "nl"): string {
  return localizedHref(`/atlas/${slug}`, locale);
}
