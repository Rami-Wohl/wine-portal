import { describe, expect, it } from "vitest";
import { getEntities, getNarratives } from "./repository";
import {
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

  it("derives Learn narrative routes from canonical metadata", () => {
    const narrative = getNarratives().find(
      (item) => item.id === "narrative.regional.bordeaux-proof",
    );
    expect(narrative && narrativeHref(narrative)).toBe(
      "/learn/regional-deep-dives/bordeaux-pipeline-proef",
    );
  });
});
