import { describe, expect, it } from "vitest";
import { getEntities } from "./repository";
import { filterEntities, firstSearchParam, parseEntityTypeFilter } from "./search";

describe("entity search", () => {
  it("matches IDs, localized names, slugs, case, and diacritics", () => {
    const entities = getEntities();

    expect(filterEntities(entities, "PRODUCER.CHATEAU-LATOUR")[0]?.id).toBe(
      "producer.chateau-latour",
    );
    expect(filterEntities(entities, "Chateau Latour")[0]?.id).toBe("producer.chateau-latour");
    expect(filterEntities(entities, "cabernet-sauvignon")[0]?.id).toBe("grape.cabernet-sauvignon");
  });

  it("combines text and entity-type filters", () => {
    const entities = getEntities();

    expect(filterEntities(entities, "bordeaux", "region").map((entity) => entity.id)).toEqual([
      "region.bordeaux",
    ]);
    expect(filterEntities(entities, "bordeaux", "producer")).toEqual([]);
    expect(filterEntities(entities, "", "classification").map((entity) => entity.id)).toEqual([
      "classification.bordeaux-1855",
    ]);
  });

  it("normalizes repeated and invalid URL parameters", () => {
    expect(firstSearchParam(["first", "second"])).toBe("first");
    expect(firstSearchParam([], "all")).toBe("all");
    expect(firstSearchParam(undefined)).toBe("");
    expect(parseEntityTypeFilter("appellation")).toBe("appellation");
    expect(parseEntityTypeFilter("invalid")).toBe("all");
    expect(parseEntityTypeFilter("toString")).toBe("all");
  });
});
