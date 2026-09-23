import { describe, expect, it } from "vitest";
import { selectLearningPathContext, type LearningPathContextOption } from "./learning-path-context";

const context: LearningPathContextOption = {
  pathId: "learning-path.from-grape-to-still-wine",
  pathSlug: "from-grape-to-still-wine",
  pathTitle: "Van druif naar stille wijn",
  pathHref: "/learn/from-grape-to-still-wine",
  stepId: "grape-to-must",
  stepIds: ["grape-as-raw-material", "grape-to-must"],
  position: 2,
  total: 7,
  next: {
    title: "De volgende les",
    href: "/verdiepingen/lessons/next?path=from-grape-to-still-wine",
    kind: "lesson",
  },
};

describe("learning-path lesson context", () => {
  it("selects exactly one known canonical path slug", () => {
    expect(selectLearningPathContext([context], [context.pathSlug])).toBe(context);
  });

  it("ignores missing, unknown, and duplicate path context", () => {
    expect(selectLearningPathContext([context], [])).toBeUndefined();
    expect(selectLearningPathContext([context], ["unknown"])).toBeUndefined();
    expect(selectLearningPathContext([context], [context.pathSlug, "unknown"])).toBeUndefined();
  });
});
