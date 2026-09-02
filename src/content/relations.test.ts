import { describe, expect, it } from "vitest";
import { RELATION_TYPES } from "./model";
import { RELATION_PRESENTATIONS, groupRelationsByLabel, relationLabel } from "./relations";

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

  it("groups repeated relationship labels in a useful semantic order", () => {
    const groups = groupRelationsByLabel(
      [
        {
          relation: { type: "located_in", target: "appellation.pauillac" },
          direction: "inverse" as const,
        },
        {
          relation: { type: "important_grape", target: "grape.merlot" },
          direction: "forward" as const,
        },
        {
          relation: { type: "part_of", target: "region.bordeaux" },
          direction: "forward" as const,
        },
        {
          relation: { type: "important_grape", target: "grape.cabernet-sauvignon" },
          direction: "forward" as const,
        },
      ],
      "nl",
    );

    expect(groups.map(({ label }) => label)).toEqual([
      "Onderdeel van",
      "Belangrijke druif",
      "Hier gevestigd",
    ]);
    expect(groups[1].items).toHaveLength(2);
  });
});
