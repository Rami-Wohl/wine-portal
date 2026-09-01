import { describe, expect, it } from "vitest";
import { RELATION_TYPES } from "./model";
import { RELATION_PRESENTATIONS, relationLabel } from "./relations";

describe("relationship presentation", () => {
  it("defines localized forward and inverse labels for every relationship", () => {
    expect(Object.keys(RELATION_PRESENTATIONS).sort()).toEqual([...RELATION_TYPES].sort());

    for (const type of RELATION_TYPES) {
      expect(RELATION_PRESENTATIONS[type].forward.nl).not.toBe("");
      expect(RELATION_PRESENTATIONS[type].forward.en).not.toBe("");
      expect(RELATION_PRESENTATIONS[type].inverse.nl).not.toBe("");
      expect(RELATION_PRESENTATIONS[type].inverse.en).not.toBe("");
    }
  });

  it("uses natural labels in both directions", () => {
    expect(relationLabel("part_of", "forward", "nl")).toBe("Onderdeel van");
    expect(relationLabel("part_of", "inverse", "nl")).toBe("Bevat");
    expect(relationLabel("located_in", "forward", "en")).toBe("Located in");
    expect(relationLabel("located_in", "inverse", "nl")).toBe("Hier gevestigd");
  });
});
