import { describe, expect, it } from "vitest";
import { getPublishedSearchIndex } from "./repository";
import {
  firstSearchParam,
  normalizeSearchValue,
  parseEntityTypeFilter,
  searchKnowledge,
} from "./search";

describe("knowledge search", () => {
  it("ranks an exact entity name above article mentions", () => {
    const results = searchKnowledge(getPublishedSearchIndex(), "Cabernet Sauvignon");

    expect(results[0]?.entry.id).toBe("grape.cabernet-sauvignon");
    expect(results[0]?.match_kind).toBe("metadata");
    expect(results.some((result) => result.entry.id === "region.bordeaux")).toBe(true);
  });

  it("matches IDs, localized names, aliases, slugs, case, and diacritics", () => {
    const index = getPublishedSearchIndex();

    expect(searchKnowledge(index, "PRODUCER.CHATEAU-LATOUR")[0]?.entry.id).toBe(
      "producer.chateau-latour",
    );
    expect(searchKnowledge(index, "Chateau Latour")[0]?.entry.id).toBe("producer.chateau-latour");
    expect(searchKnowledge(index, "cabernet-sauvignon")[0]?.entry.id).toBe(
      "grape.cabernet-sauvignon",
    );
    expect(normalizeSearchValue("Élevage & Cuvée")).toBe("elevage cuvee");
  });

  it("returns a contextual block anchor for article text", () => {
    const [result] = searchKnowledge(getPublishedSearchIndex(), "biologie en wortelschade");

    expect(result.entry.id).toBe("concept.phylloxera");
    expect(result.match_kind).toBe("heading");
    expect(result.anchor).toBe("biologie-en-wortelschade");
    expect(result.snippet).toContain("wortelschade");
  });

  it("indexes captions only when their figure is used by the page", () => {
    const [result] = searchKnowledge(getPublishedSearchIndex(), "gekromde verdikte wortelpunten");

    expect(result.entry.id).toBe("concept.phylloxera");
    expect(result.match_kind).toBe("media-caption");
    expect(result.anchor).toBe("wortelschade");
    expect(result.snippet).toContain("wortelpunten");
  });

  it("keeps the depth and anchor of advanced passages", () => {
    const [result] = searchKnowledge(getPublishedSearchIndex(), "AXR#1-onderstam");

    expect(result.entry.id).toBe("concept.phylloxera");
    expect(result.passage?.depth).toBe("advanced");
    expect(result.anchor).toBe("grenzen-van-resistentie");
  });

  it("combines text and entity-type filters", () => {
    const index = getPublishedSearchIndex();

    expect(searchKnowledge(index, "bordeaux", "region").map((result) => result.entry.id)).toContain(
      "region.bordeaux",
    );
    expect(searchKnowledge(index, "bordeaux", "producer")).not.toHaveLength(0);
    expect(searchKnowledge(index, "", "classification").map((result) => result.entry.id)).toEqual([
      "classification.bordeaux-1855",
      "classification.graves",
      "classification.saint-emilion",
      "classification.crus-artisans-du-medoc",
      "classification.crus-bourgeois-du-medoc",
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

  it("keeps cached passages isolated by locale and refreshes changed content", () => {
    const original = getPublishedSearchIndex().find(({ id }) => id === "concept.phylloxera")!;
    const entry = structuredClone(original);
    entry.passages = {
      nl: [
        {
          block_id: "nl-example",
          kind: "content",
          depth: "advanced",
          heading: "Één voorbeeld",
          text: "Een unieke proefpassage.",
        },
      ],
      en: [
        {
          block_id: "en-example",
          kind: "content",
          depth: "foundation",
          heading: null,
          text: "An isolated sample passage.",
        },
      ],
    };

    expect(searchKnowledge([entry], "unieke proefpassage", "all", "nl")[0]?.anchor).toBe(
      "nl-example",
    );
    expect(searchKnowledge([entry], "unieke proefpassage", "all", "en")).toEqual([]);
    expect(searchKnowledge([entry], "EEN VOORBEELD", "all", "nl")[0]?.match_kind).toBe("heading");

    entry.passages.nl[0].text = "Een vervangen passage.";
    entry.passages.nl[0].heading = "Nieuwe titel";
    expect(searchKnowledge([entry], "unieke proefpassage", "all", "nl")).toEqual([]);
    expect(searchKnowledge([entry], "een voorbeeld", "all", "nl")).toEqual([]);
    expect(searchKnowledge([entry], "vervangen passage", "all", "nl")[0]?.snippet).toBe(
      "Een vervangen passage.",
    );
    expect(searchKnowledge([entry], "nieuwe titel", "all", "nl")[0]?.match_kind).toBe("heading");
  });
});
