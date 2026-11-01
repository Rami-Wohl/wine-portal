import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { EntityAtlas } from "./entity-atlas";
import { sampleEntities } from "./fixtures/sample-entities";
import { sampleScene } from "./fixtures/sample-scene";

vi.mock("@/content/repository", () => ({
  getEntityById: (id: string) => sampleEntities[id],
}));

vi.mock("@/content/geography", () => ({
  atlasSceneHref: (slug: string, locale: string) => `${locale === "en" ? "/en" : ""}/atlas/${slug}`,
  getAtlasSceneForEntity: (entityId: string) => {
    // A draft region owns a scene of its own, like Champagne in release one.
    if (entityId === "region.champagne") {
      return {
        scene: {
          ...sampleScene,
          id: "scene.fixture-champagne",
          owner: entityId,
          slug: "champagne",
        },
        featureId: undefined,
      };
    }
    const owned = ["region.graves-sauternais", "appellation.barsac", "appellation.cerons"];
    if (!owned.includes(entityId)) return undefined;
    const feature = sampleScene.layers
      .flatMap((layer) => layer.features)
      .find((candidate) => candidate.owner === entityId);
    return { scene: sampleScene, featureId: feature?.id };
  },
}));

describe("EntityAtlas", () => {
  it("embeds the owner scene with the entity highlighted", () => {
    const html = renderToStaticMarkup(
      <EntityAtlas entity={sampleEntities["appellation.barsac"]} locale="nl" />,
    );
    expect(html).toContain('class="entity-atlas"');
    expect(html).toContain('class="atlas-scene atlas-scene-embedded"');
    expect(html).toContain('<h2 class="atlas-scene-title"');
    expect(html).toMatch(
      /<a aria-current="page" class="atlas-link" data-highlighted="true" href="\/appellations\/barsac" tabindex="-1">/,
    );
    expect(html).toContain('<a href="/atlas/graves-and-sauternais">Bekijk in de Atlas</a>');
  });

  it("embeds a region scene without a highlight on the region itself", () => {
    const html = renderToStaticMarkup(
      <EntityAtlas entity={sampleEntities["region.graves-sauternais"]} locale="en" />,
    );
    expect(html).toContain("Map of Graves and Sauternais");
    expect(html).not.toContain("data-highlighted");
    expect(html).not.toContain("is not on the map yet");
    expect(html).toContain('<a href="/en/atlas/graves-and-sauternais">View in the Atlas</a>');
  });

  it("explains an appellation without published geometry instead of drawing one", () => {
    const html = renderToStaticMarkup(
      <EntityAtlas entity={sampleEntities["appellation.cerons"]} locale="nl" />,
    );
    expect(html).toContain("Cérons staat nog niet op de kaart");
    expect(html).not.toContain("data-highlighted");
  });

  it("embeds a draft region's own scene for editorial review", () => {
    const champagne = sampleEntities["region.champagne"];
    expect(champagne.status).toBe("draft");
    const html = renderToStaticMarkup(<EntityAtlas entity={champagne} locale="nl" />);
    expect(html).toContain('data-entity-atlas="scene.fixture-champagne"');
    expect(html).toContain("Kaart van Champagne");
    expect(html).not.toContain("atlas-scene-notice");
    expect(html).not.toContain("data-highlighted");
    // The map embeds, but no link leads into the draft scene context.
    expect(html).not.toContain("atlas-scene-link");
    expect(html).not.toContain('href="/atlas/champagne"');
  });

  it("renders nothing without a scene, for other entity types and for a draft without a scene", () => {
    for (const id of [
      "appellation.graves",
      "region.bordeaux",
      "grape.fixture-grape",
      "appellation.fixture-draft",
    ]) {
      expect(renderToStaticMarkup(<EntityAtlas entity={sampleEntities[id]} locale="nl" />)).toBe(
        "",
      );
    }
  });
});
