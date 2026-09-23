import { describe, expect, it } from "vitest";
import {
  createLearningProgressRecord,
  firstIncompleteStepId,
  hasCompletedLearningPath,
  parseLearningProgressRecord,
  toggleLearningStep,
} from "./progress";

const pathId = "learning-path.example";
const stepIds = ["first", "second", "third"];
const timestamp = "2026-09-23T12:00:00.000Z";

describe("learning progress records", () => {
  it("accepts the current schema and removes unknown or duplicate step IDs", () => {
    expect(
      parseLearningProgressRecord(
        {
          schema_version: 1,
          path_id: pathId,
          completed_step_ids: ["second", "retired", "second"],
          updated_at: timestamp,
        },
        pathId,
        stepIds,
      ),
    ).toEqual(createLearningProgressRecord(pathId, ["second"], timestamp));
  });

  it("rejects corrupt, mismatched, or future records without guessing a migration", () => {
    expect(parseLearningProgressRecord("broken", pathId, stepIds)).toBeNull();
    expect(
      parseLearningProgressRecord(
        {
          schema_version: 2,
          path_id: pathId,
          completed_step_ids: [],
          updated_at: timestamp,
        },
        pathId,
        stepIds,
      ),
    ).toBeNull();
    expect(
      parseLearningProgressRecord(
        {
          schema_version: 1,
          path_id: "learning-path.other",
          completed_step_ids: [],
          updated_at: timestamp,
        },
        pathId,
        stepIds,
      ),
    ).toBeNull();
  });

  it("toggles only known steps and derives continuation and completion", () => {
    const first = toggleLearningStep(null, pathId, "first", stepIds, timestamp);
    const second = toggleLearningStep(first, pathId, "second", stepIds, timestamp);
    const complete = toggleLearningStep(second, pathId, "third", stepIds, timestamp);

    expect(firstIncompleteStepId(second, stepIds)).toBe("third");
    expect(hasCompletedLearningPath(second, stepIds)).toBe(false);
    expect(hasCompletedLearningPath(complete, stepIds)).toBe(true);
    expect(
      toggleLearningStep(complete, pathId, "second", stepIds, timestamp).completed_step_ids,
    ).toEqual(["first", "third"]);
  });
});
