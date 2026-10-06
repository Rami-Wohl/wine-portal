import { describe, expect, it } from "vitest";
import { getDiscoveryEntries } from "@/content/discovery";
import { getPublishedSearchIndex } from "@/content/repository";
import { searchKnowledge } from "@/content/search";
import sitemap from "@/app/sitemap";
import { getLanguageSwitchRules } from "./switch-rules-server";
import { languageSwitchHref } from "./switch-rules";
import { languageAlternates, localizedHref, withRouteQuery } from "./routing";

const rules = getLanguageSwitchRules();

describe("public language identity", () => {
  it("keeps Dutch URLs stable and resolves fragments and duplicate redirect queries", () => {
    expect(localizedHref("/en", "nl")).toBe("/");
    expect(localizedHref("/", "en")).toBe("/en");
    expect(localizedHref("/en/concepts/winemaking-routes#source-1", "nl")).toBe(
      "/concepts/winemaking-routes#source-1",
    );
    expect(withRouteQuery("/en/classifications/bordeaux-1855#owner", { path: ["a", "b"] })).toBe(
      "/en/classifications/bordeaux-1855?path=a&path=b#owner",
    );
    expect(languageAlternates("/en/learn/path?path=other#source-1", "en")).toEqual({
      canonical: "/en/learn/path",
      languages: { nl: "/learn/path", en: "/en/learn/path", "x-default": "/learn/path" },
    });
  });

  it("drops untrusted context and pagination when choosing a language", () => {
    expect(
      languageSwitchHref(
        "/search",
        new URLSearchParams("q=grape&type=invalid&page=2&extra=x"),
        "en",
        rules,
      ),
    ).toBe("/en/search?q=grape");
    expect(
      languageSwitchHref(
        "/explore/producers",
        new URLSearchParams("context=unknown&initial=??&page=2"),
        "en",
        rules,
      ),
    ).toBe("/en/explore/producers");
    expect(
      languageSwitchHref(
        "/verdiepingen/lessons/three-routes-for-still-wine",
        new URLSearchParams("path=from-grape-to-still-wine&path=from-grape-to-still-wine"),
        "en",
        rules,
      ),
    ).toBe("/en/verdiepingen/lessons/three-routes-for-still-wine");
  });

  it("keeps discovery caches and search passages separate by presentation language", () => {
    const english = getDiscoveryEntries("concept", "en");
    const dutch = getDiscoveryEntries("concept", "nl");
    expect(english).not.toBe(dutch);
    for (const [locale, entries] of [
      ["nl", dutch],
      ["en", english],
    ] as const) {
      expect(entries.map((entry) => entry.entity.names[locale])).toEqual(
        entries
          .map((entry) => entry.entity.names[locale])
          .toSorted((a, b) => a.localeCompare(b, locale, { sensitivity: "base" })),
      );
    }
    const results = searchKnowledge(getPublishedSearchIndex(), "fermentation", "all", "en");
    const contentResults = results.filter((result) => result.passage);
    expect(contentResults.length).toBeGreaterThan(0);
    for (const result of contentResults) expect(result.entry.passages.en).toContain(result.passage);
    expect(getDiscoveryEntries("concept", "en")).toBe(english);
  });

  it("publishes reciprocal sitemap alternatives only for indexable routes", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((entry) => entry.url));
    expect(urls.size).toBe(entries.length);
    for (const entry of entries) {
      const path = new URL(entry.url).pathname;
      expect(path).not.toMatch(/\/nl(?:\/|$)|\/search$|\/atlas$|\/complete$/);
      for (const href of Object.values(entry.alternates!.languages!))
        expect(href && urls.has(href)).toBe(true);
      expect(entry.url).not.toMatch(/[?#]/);
    }
  });
});
