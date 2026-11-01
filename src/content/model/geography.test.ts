import { describe, expect, it } from "vitest";
import { geographyTransformationStepSchema } from "./geography";

describe("geography transformation steps", () => {
  it("accepts the documented reproject, ring-orientation and coordinate-precision steps", () => {
    for (const step of [
      {
        step: "reproject",
        from: "EPSG:2154",
        to: "EPSG:4326",
        axis_order: "lon-lat",
        tool: "proj4@2.22.0",
      },
      { step: "ring-orientation", convention: "rfc7946" },
      { step: "coordinate-precision", decimals: 6, unit: "degree" },
      { step: "coordinate-precision", decimals: 0, unit: "degree" },
      { step: "clip", envelope: [-1.5, 44, 0.5, 46] },
    ]) {
      expect(geographyTransformationStepSchema.safeParse(step).success, JSON.stringify(step)).toBe(
        true,
      );
    }
  });

  it("rejects a coordinate-precision step with negative, fractional or missing decimals", () => {
    for (const decimals of [-1, 2.5, undefined, "6"]) {
      const result = geographyTransformationStepSchema.safeParse({
        step: "coordinate-precision",
        decimals,
        unit: "degree",
      });
      expect(result.success, String(decimals)).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain("decimals");
    }
  });

  it("rejects a coordinate-precision step whose unit is not degree or that carries extra keys", () => {
    for (const step of [
      { step: "coordinate-precision", decimals: 6, unit: "metre" },
      { step: "coordinate-precision", decimals: 6 },
      { step: "coordinate-precision", decimals: 6, unit: "degree", tool: "rounder" },
      { step: "round", decimals: 6, unit: "degree" },
    ]) {
      expect(geographyTransformationStepSchema.safeParse(step).success, JSON.stringify(step)).toBe(
        false,
      );
    }
  });
});
