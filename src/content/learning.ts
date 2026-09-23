import type { LearningPath } from "./model";

export interface LearningPathLessonPosition {
  position: number;
  total: number;
  previousTarget?: string;
  nextTarget?: string;
}

export function getLearningPathLessonPosition(
  learningPath: LearningPath,
  lessonId: string,
): LearningPathLessonPosition | undefined {
  const index = learningPath.steps.findIndex((step) => step.target === lessonId);
  if (index < 0) return undefined;

  return {
    position: index + 1,
    total: learningPath.steps.length,
    previousTarget: learningPath.steps[index - 1]?.target,
    nextTarget: learningPath.steps[index + 1]?.target,
  };
}
