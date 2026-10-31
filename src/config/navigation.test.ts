import { describe, expect, it } from "vitest";
import { ENTITY_ROUTE_SEGMENTS } from "@/content/routing";
import {
  isNavigationItemCurrent,
  localizedNavigation,
  PRIMARY_NAVIGATION,
  SEARCH_NAVIGATION_ITEM,
  UTILITY_NAVIGATION,
} from "./navigation";

describe("site navigation", () => {
  it("keeps destinations unique and ordered without a promoted learning link", () => {
    const items = [...PRIMARY_NAVIGATION, ...UTILITY_NAVIGATION];
    expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
    expect(PRIMARY_NAVIGATION.map((item) => item.label)).toEqual(["Ontdekken", "Atlas", "Leren"]);
  });

  it("offers Atlas between Explore and Learn in both languages with its own routes", () => {
    const atlas = PRIMARY_NAVIGATION.find((item) => item.href === "/atlas");
    expect(atlas).toEqual({ href: "/atlas", label: "Atlas", activePrefixes: ["/atlas"] });
    expect(localizedNavigation(PRIMARY_NAVIGATION, "en").map((item) => item.label)).toEqual([
      "Explore",
      "Atlas",
      "Learn",
    ]);
    const english = localizedNavigation(PRIMARY_NAVIGATION, "en")[1];
    expect(english.href).toBe("/en/atlas");
    expect(isNavigationItemCurrent(english, "/en/atlas/medoc")).toBe(true);
    expect(isNavigationItemCurrent(atlas!, "/atlas")).toBe(true);
    expect(isNavigationItemCurrent(atlas!, "/atlases")).toBe(false);
    expect(isNavigationItemCurrent(atlas!, "/regions/bordeaux")).toBe(false);
  });

  it("marks every entity route as part of Explore", () => {
    const explore = PRIMARY_NAVIGATION.find((item) => item.href === "/explore");
    expect(explore).toBeDefined();

    for (const segment of Object.values(ENTITY_ROUTE_SEGMENTS)) {
      expect(explore?.activePrefixes).toContain(`/${segment}`);
    }
  });

  it("matches exact destinations and their nested routes without partial-prefix matches", () => {
    expect(isNavigationItemCurrent(SEARCH_NAVIGATION_ITEM, "/search")).toBe(true);
    expect(isNavigationItemCurrent(SEARCH_NAVIGATION_ITEM, "/search/results")).toBe(true);
    expect(isNavigationItemCurrent(SEARCH_NAVIGATION_ITEM, "/searching")).toBe(false);
  });
});
