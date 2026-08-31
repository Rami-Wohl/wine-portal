import { describe, expect, it } from "vitest";
import { ENTITY_ROUTE_SEGMENTS } from "@/content/routing";
import { PRIMARY_NAVIGATION, UTILITY_NAVIGATION } from "./navigation";

describe("site navigation", () => {
  it("keeps destinations unique and ordered without a promoted learning link", () => {
    const items = [...PRIMARY_NAVIGATION, ...UTILITY_NAVIGATION];
    expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
    expect(PRIMARY_NAVIGATION.map((item) => item.label)).toEqual([
      "Ontdekken",
      "Leren",
      "Atlas",
    ]);
  });

  it("marks every entity route as part of Explore", () => {
    const explore = PRIMARY_NAVIGATION.find((item) => item.href === "/explore");
    expect(explore).toBeDefined();

    for (const segment of Object.values(ENTITY_ROUTE_SEGMENTS)) {
      expect(explore?.activePrefixes).toContain(`/${segment}`);
    }
  });
});
