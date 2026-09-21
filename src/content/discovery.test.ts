import { describe, expect, it } from "vitest";
import {
  DISCOVERY_CATEGORIES,
  discoveryContextOptions,
  filterDiscoveryEntries,
  getDiscoveryCategoryBySegment,
  getDiscoveryEntries,
} from "./discovery";

describe("discovery browsing", () => {
  it("exposes one stable browse route per entity type", () => {
    expect(DISCOVERY_CATEGORIES).toHaveLength(8);
    expect(getDiscoveryCategoryBySegment("producers")?.type).toBe("producer");
    expect(getDiscoveryCategoryBySegment("unknown")).toBeUndefined();
  });

  it("derives type-specific context from canonical relations", () => {
    const producers = getDiscoveryEntries("producer");
    const batailley = producers.find((entry) => entry.entity.id === "producer.chateau-batailley");
    expect(batailley?.contexts.map((context) => context.id)).toEqual(["appellation.pauillac"]);

    const appellations = getDiscoveryEntries("appellation");
    const barsac = appellations.find((entry) => entry.entity.id === "appellation.barsac");
    expect(barsac?.contexts.map((context) => context.id)).toEqual(["region.graves-sauternais"]);
  });

  it("builds counted context facets and combines shareable filters", () => {
    const producers = getDiscoveryEntries("producer");
    const pauillac = discoveryContextOptions(producers).find(
      (option) => option.slug === "pauillac",
    );
    expect(pauillac?.count).toBeGreaterThan(1);

    const filtered = filterDiscoveryEntries(producers, {
      query: "Batailley",
      context: "pauillac",
      initial: "C",
    });
    expect(filtered.map((entry) => entry.entity.id)).toEqual([
      "producer.chateau-batailley",
      "producer.chateau-haut-batailley",
    ]);
  });

  it("matches localized names and aliases without accents", () => {
    const concepts = getDiscoveryEntries("concept");
    const results = filterDiscoveryEntries(concepts, {
      query: "elevage",
      context: "",
      initial: "",
    });
    expect(results.map((entry) => entry.entity.id)).toContain("concept.elevage");
  });
});
