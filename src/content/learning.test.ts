import { describe, expect, it } from "vitest";
import { getAllLearningPaths } from "./repository";
import { getLearningPathLessonPosition } from "./learning";

describe("learning-path lesson position", () => {
  const learningPath = getAllLearningPaths().find(
    (item) => item.id === "learning-path.from-grape-to-still-wine",
  );

  it("resolves the current position and adjacent core lessons", () => {
    expect(learningPath).toBeDefined();
    if (!learningPath) return;

    const middlePath = {
      ...learningPath,
      steps: [
        { ...learningPath.steps[0], id: "first", target: "narrative.lesson.first" },
        { ...learningPath.steps[0], id: "second", target: "narrative.lesson.second" },
        { ...learningPath.steps[0], id: "third", target: "narrative.lesson.third" },
      ],
    };

    expect(getLearningPathLessonPosition(middlePath, "narrative.lesson.second")).toEqual({
      position: 2,
      total: 3,
      previousTarget: "narrative.lesson.first",
      nextTarget: "narrative.lesson.third",
    });
  });

  it("resolves the real pilot boundaries without inventing adjacent targets", () => {
    expect(learningPath).toBeDefined();
    if (!learningPath) return;

    expect(
      getLearningPathLessonPosition(learningPath, "narrative.lesson.grape-as-raw-material"),
    ).toEqual({
      position: 1,
      total: 7,
      previousTarget: undefined,
      nextTarget: "narrative.lesson.grape-to-must",
    });
    expect(
      getLearningPathLessonPosition(learningPath, "narrative.lesson.cellar-to-bottle"),
    ).toEqual({
      position: 7,
      total: 7,
      previousTarget: "narrative.lesson.maturation-and-protection",
      nextTarget: undefined,
    });
    expect(getLearningPathLessonPosition(learningPath, "narrative.lesson.unknown")).toBeUndefined();
  });
});
