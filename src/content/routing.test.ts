import { describe, expect, it } from "vitest";
import {
  getAllEntities,
  getAllEntitiesByType,
  getAllNarrativeBacklinks,
  getAllNarratives,
  getEntityByRoute,
  getNarrativeByRoute,
  getPublishedEntities,
  getPublishedEntitiesByType,
  getPublishedNarrativeBacklinks,
  getPublishedNarratives,
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
    const latour = getAllEntities().find((entity) => entity.id === "producer.chateau-latour");
    expect(latour && entityHref(latour)).toBe("/producers/chateau-latour");
  });

  it("maps only known route families to entity types", () => {
    expect(entityTypeFromRouteSegment("appellations")).toBe("appellation");
    expect(entityTypeFromRouteSegment("explore")).toBeUndefined();
  });

  it("resolves every generated entity route and rejects mismatched routes", () => {
    for (const entity of getAllEntities()) {
      expect(getEntityByRoute(ENTITY_ROUTE_SEGMENTS[entity.type], entity.slugs.nl)).toBe(entity);
    }
    expect(getEntityByRoute("producers", "bordeaux")).toBeUndefined();
    expect(getEntityByRoute("unknown", "bordeaux")).toBeUndefined();
  });

  it("uses the generated type index for category lookups", () => {
    expect(getAllEntitiesByType("producer").map((entity) => entity.id)).toEqual([
      "producer.chateau-latour",
    ]);
    expect(getAllEntitiesByType("site")).toEqual([]);
  });

  it("keeps draft content out of every published repository view", () => {
    expect(getPublishedEntities()).toEqual(
      getAllEntities().filter((entity) => entity.status === "active"),
    );
    expect(getPublishedEntitiesByType("producer")).toEqual(
      getAllEntitiesByType("producer").filter((entity) => entity.status === "active"),
    );
    expect(getPublishedNarratives()).toEqual(
      getAllNarratives().filter((narrative) => narrative.status === "active"),
    );
    expect(getPublishedNarrativeBacklinks("region.bordeaux")).toEqual(
      getAllNarrativeBacklinks("region.bordeaux").filter(
        (narrative) => narrative.status === "active",
      ),
    );
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
    expect(getAllNarrativeBacklinks("region.bordeaux").map((item) => item.id)).toEqual([
      "narrative.regional.bordeaux-proof",
    ]);
  });

  it("derives mode-neutral narrative routes from canonical metadata", () => {
    const narrative = getAllNarratives().find(
      (item) => item.id === "narrative.regional.bordeaux-proof",
    );
    expect(narrative && narrativeHref(narrative)).toBe(
      "/verdiepingen/regional-deep-dives/bordeaux-pipeline-proef",
    );
  });

  it("resolves every generated narrative route and rejects unknown families", () => {
    for (const narrative of getAllNarratives()) {
      expect(
        getNarrativeByRoute(NARRATIVE_ROUTE_SEGMENTS[narrative.type], narrative.slugs.nl),
      ).toBe(narrative);
    }
    expect(getNarrativeByRoute("lessons", "bordeaux-pipeline-proef")).toBeUndefined();
  });

  it("keeps all canonical generated routes unique", () => {
    const routes = [...getAllEntities().map(entityHref), ...getAllNarratives().map(narrativeHref)];
    expect(new Set(routes).size).toBe(routes.length);
  });
});
