import { describe, expect, it } from "vitest";
import {
  getEntities,
  getEntitiesByType,
  getEntityByRoute,
  getNarrativeBacklinks,
  getNarrativeByRoute,
  getNarratives,
  getRelationsForEntity,
} from "./repository";
import {
  ENTITY_ROUTE_SEGMENTS,
  NARRATIVE_ROUTE_SEGMENTS,
  entityHref,
  entityTypeFromRouteSegment,
  narrativeHref,
} from "./routing";

describe("canonical content routing", () => {
  it("derives context-independent entity URLs", () => {
    const latour = getEntities().find((entity) => entity.id === "producer.chateau-latour");
    expect(latour && entityHref(latour)).toBe("/producers/chateau-latour");
  });

  it("maps only known route families to entity types", () => {
    expect(entityTypeFromRouteSegment("appellations")).toBe("appellation");
    expect(entityTypeFromRouteSegment("explore")).toBeUndefined();
  });

  it("resolves every generated entity route and rejects mismatched routes", () => {
    for (const entity of getEntities()) {
      expect(getEntityByRoute(ENTITY_ROUTE_SEGMENTS[entity.type], entity.slugs.nl)).toBe(entity);
    }
    expect(getEntityByRoute("producers", "bordeaux")).toBeUndefined();
    expect(getEntityByRoute("unknown", "bordeaux")).toBeUndefined();
  });

  it("uses the generated type index for category lookups", () => {
    expect(getEntitiesByType("producer").map((entity) => entity.id)).toEqual([
      "producer.chateau-latour",
    ]);
    expect(getEntitiesByType("site")).toEqual([]);
  });

  it("resolves forward, inverse, and narrative relationships", () => {
    expect(getRelationsForEntity("appellation.pauillac")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "appellation.pauillac",
          type: "part_of",
          target: "region.bordeaux",
        }),
        expect.objectContaining({
          source: "producer.chateau-latour",
          type: "located_in",
          target: "appellation.pauillac",
        }),
      ]),
    );
    expect(getRelationsForEntity("region.unknown")).toEqual([]);
    expect(getNarrativeBacklinks("region.bordeaux").map((item) => item.id)).toEqual([
      "narrative.regional.bordeaux-proof",
    ]);
  });

  it("derives Learn narrative routes from canonical metadata", () => {
    const narrative = getNarratives().find(
      (item) => item.id === "narrative.regional.bordeaux-proof",
    );
    expect(narrative && narrativeHref(narrative)).toBe(
      "/learn/regional-deep-dives/bordeaux-pipeline-proef",
    );
  });

  it("resolves every generated narrative route and rejects unknown families", () => {
    for (const narrative of getNarratives()) {
      expect(
        getNarrativeByRoute(NARRATIVE_ROUTE_SEGMENTS[narrative.type], narrative.slugs.nl),
      ).toBe(narrative);
    }
    expect(getNarrativeByRoute("lessons", "bordeaux-pipeline-proef")).toBeUndefined();
  });

  it("keeps all canonical generated routes unique", () => {
    const routes = [...getEntities().map(entityHref), ...getNarratives().map(narrativeHref)];
    expect(new Set(routes).size).toBe(routes.length);
  });
});
