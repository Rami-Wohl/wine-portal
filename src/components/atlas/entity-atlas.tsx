import { atlasSceneHref, getAtlasSceneForEntity } from "@/content/geography";
import type { Entity, Locale } from "@/content/model";
import { getEntityById } from "@/content/repository";
import { AtlasScene } from "./atlas-scene";

/**
 * The map block of an entity page: the owner region's scene with this entity
 * highlighted. Renders nothing when the entity has no scene, so pages never
 * show an empty map box. Regions and appellations only. Draft entities keep
 * their map for editorial review, like the rest of the entity page; the scene
 * itself withholds links to draft pages. The "View in the Atlas" link appears only when the
 * scene owner is active: an active page never links readers into a draft context.
 */
export function EntityAtlas({ entity, locale }: { entity: Entity; locale: Locale }) {
  if (entity.type !== "region" && entity.type !== "appellation") return null;
  const found = getAtlasSceneForEntity(entity.id);
  if (!found) return null;
  const ownerActive = getEntityById(found.scene.owner)?.status === "active";
  return (
    <div className="entity-atlas" data-entity-atlas={found.scene.id}>
      <AtlasScene
        headingLevel={2}
        highlightedEntityId={entity.id}
        locale={locale}
        scene={found.scene}
        sceneHref={ownerActive ? atlasSceneHref(found.scene.slug, locale) : undefined}
        variant="embedded"
      />
    </div>
  );
}
