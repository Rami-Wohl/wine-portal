export const LEARNING_PROGRESS_SCHEMA_VERSION = 1 as const;

export interface LearningProgressRecord {
  schema_version: typeof LEARNING_PROGRESS_SCHEMA_VERSION;
  path_id: string;
  completed_step_ids: string[];
  updated_at: string;
}

export type LearningProgressPersistence = "persistent" | "temporary";

export interface LearningProgressSnapshot {
  record: LearningProgressRecord | null;
  persistence: LearningProgressPersistence;
}

export interface LearningProgressRepository {
  load(pathId: string, knownStepIds: readonly string[]): Promise<LearningProgressSnapshot>;
  save(record: LearningProgressRecord): Promise<LearningProgressPersistence>;
  clear(pathId: string): Promise<LearningProgressPersistence>;
  subscribe(pathId: string, onChange: () => void): () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

export function parseLearningProgressRecord(
  value: unknown,
  pathId: string,
  knownStepIds: readonly string[],
): LearningProgressRecord | null {
  if (!isRecord(value)) return null;
  if (value.schema_version !== LEARNING_PROGRESS_SCHEMA_VERSION) return null;
  if (value.path_id !== pathId) return null;
  if (!Array.isArray(value.completed_step_ids)) return null;
  if (!isIsoTimestamp(value.updated_at)) return null;

  const knownSteps = new Set(knownStepIds);
  const completedStepIds = value.completed_step_ids.filter(
    (stepId): stepId is string => typeof stepId === "string" && knownSteps.has(stepId),
  );

  return {
    schema_version: LEARNING_PROGRESS_SCHEMA_VERSION,
    path_id: pathId,
    completed_step_ids: Array.from(new Set(completedStepIds)),
    updated_at: value.updated_at,
  };
}

export function createLearningProgressRecord(
  pathId: string,
  completedStepIds: readonly string[],
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  return {
    schema_version: LEARNING_PROGRESS_SCHEMA_VERSION,
    path_id: pathId,
    completed_step_ids: Array.from(new Set(completedStepIds)),
    updated_at: updatedAt,
  };
}

export function toggleLearningStep(
  current: LearningProgressRecord | null,
  pathId: string,
  stepId: string,
  knownStepIds: readonly string[],
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  const completed = new Set(
    (current?.path_id === pathId ? current.completed_step_ids : []).filter((id) =>
      knownStepIds.includes(id),
    ),
  );

  if (completed.has(stepId)) completed.delete(stepId);
  else if (knownStepIds.includes(stepId)) completed.add(stepId);

  return createLearningProgressRecord(
    pathId,
    knownStepIds.filter((id) => completed.has(id)),
    updatedAt,
  );
}

export function firstIncompleteStepId(
  record: LearningProgressRecord | null,
  stepIds: readonly string[],
): string | undefined {
  const completed = new Set(record?.completed_step_ids ?? []);
  return stepIds.find((stepId) => !completed.has(stepId));
}

export function hasCompletedLearningPath(
  record: LearningProgressRecord | null,
  stepIds: readonly string[],
): boolean {
  if (stepIds.length === 0) return false;
  const completed = new Set(record?.completed_step_ids ?? []);
  return stepIds.every((stepId) => completed.has(stepId));
}
