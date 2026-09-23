"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserLearningProgressRepository } from "@/learning/browser-progress-repository";
import {
  firstIncompleteStepId,
  hasCompletedLearningPath,
  toggleLearningStep,
  type LearningProgressPersistence,
  type LearningProgressRecord,
  type LearningProgressRepository,
} from "@/learning/progress";

interface UseLearningProgressOptions {
  pathId: string;
  stepIds: readonly string[];
  repository?: LearningProgressRepository;
}

export function useLearningProgress({
  pathId,
  stepIds,
  repository = browserLearningProgressRepository,
}: UseLearningProgressOptions) {
  const stableStepIds = useMemo(() => [...stepIds], [stepIds]);
  const stepKey = stableStepIds.join("\u0000");
  const [record, setRecord] = useState<LearningProgressRecord | null>(null);
  const [persistence, setPersistence] = useState<LearningProgressPersistence>("persistent");
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    const snapshot = await repository.load(pathId, stableStepIds);
    setRecord(snapshot.record);
    setPersistence(snapshot.persistence);
    setIsReady(true);
  }, [pathId, repository, stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true;
    void repository.load(pathId, stableStepIds).then((snapshot) => {
      if (!active) return;
      setRecord(snapshot.record);
      setPersistence(snapshot.persistence);
      setIsReady(true);
    });
    const unsubscribe = repository.subscribe(pathId, () => void reload());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [pathId, repository, reload, stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStep = useCallback(
    async (stepId: string) => {
      if (isSaving || !stableStepIds.includes(stepId)) return;
      setIsSaving(true);
      const latest = await repository.load(pathId, stableStepIds);
      const nextRecord = toggleLearningStep(latest.record, pathId, stepId, stableStepIds);
      setRecord(nextRecord);
      setPersistence(await repository.save(nextRecord));
      setIsReady(true);
      setIsSaving(false);
    },
    [isSaving, pathId, repository, stepKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const clear = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setRecord(null);
    setPersistence(await repository.clear(pathId));
    setIsReady(true);
    setIsSaving(false);
  }, [isSaving, pathId, repository]);

  return {
    record,
    isReady,
    isSaving,
    persistence,
    completedCount: record?.completed_step_ids.length ?? 0,
    isComplete: hasCompletedLearningPath(record, stableStepIds),
    firstIncompleteStepId: firstIncompleteStepId(record, stableStepIds),
    isStepComplete: (stepId: string) => record?.completed_step_ids.includes(stepId) ?? false,
    toggleStep,
    clear,
  };
}
