"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLearningProgress } from "@/hooks/use-learning-progress";

export interface LearningProgressLesson {
  stepId: string;
  title: string;
  href: string;
  context?: string;
}

interface LearningPathProgressProps {
  pathId: string;
  lessons: LearningProgressLesson[];
}

function ProgressMeter({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="learning-progress-meter">
      <progress value={completed} max={total} aria-label={`${completed} van ${total} voltooid`} />
      <span>
        {completed} van {total} {total === 1 ? "les" : "lessen"} voltooid
      </span>
    </div>
  );
}

export function LearningPathCardProgress({ pathId, lessons }: LearningPathProgressProps) {
  const stepIds = lessons.map((lesson) => lesson.stepId);
  const progress = useLearningProgress({ pathId, stepIds });
  const nextLesson = lessons.find((lesson) => lesson.stepId === progress.firstIncompleteStepId);

  if (!progress.isReady) {
    return <div className="learning-card-progress loading" aria-hidden="true" />;
  }

  return (
    <div className="learning-card-progress" aria-live="polite">
      <ProgressMeter completed={progress.completedCount} total={lessons.length} />
      {progress.completedCount > 0 && !progress.isComplete && nextLesson ? (
        <Link href={nextLesson.href}>Ga verder met {nextLesson.title} →</Link>
      ) : progress.isComplete ? (
        <span className="learning-progress-complete">Leerpad voltooid</span>
      ) : (
        <span>Nog niet gestart</span>
      )}
    </div>
  );
}

export function LearningPathProgressPanel({ pathId, lessons }: LearningPathProgressProps) {
  const stepIds = lessons.map((lesson) => lesson.stepId);
  const progress = useLearningProgress({ pathId, stepIds });
  const [confirmingReset, setConfirmingReset] = useState(false);
  const progressTitleRef = useRef<HTMLHeadingElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const nextLesson = lessons.find((lesson) => lesson.stepId === progress.firstIncompleteStepId);

  return (
    <section className="learning-progress-panel" aria-labelledby="learning-progress-title">
      <div>
        <p className="eyebrow">Jouw voortgang</p>
        <h2 id="learning-progress-title" ref={progressTitleRef} tabIndex={-1}>
          {!progress.isReady
            ? "Voortgang laden"
            : progress.isComplete
              ? "Alle lessen voltooid"
              : progress.completedCount > 0
                ? "Ga verder waar je was"
                : "Klaar om te beginnen"}
        </h2>
        {progress.isReady ? (
          <ProgressMeter completed={progress.completedCount} total={lessons.length} />
        ) : (
          <p className="learning-progress-loading">Je lokale voortgang wordt gecontroleerd.</p>
        )}
        {progress.persistence === "temporary" && progress.isReady ? (
          <p className="learning-progress-notice" role="status">
            Opslaan in deze browser is niet beschikbaar. Je markeringen blijven alleen tijdens dit
            bezoek bewaard; de lessen en navigatie blijven gewoon werken.
          </p>
        ) : null}
      </div>

      {progress.isReady ? (
        <div className="learning-progress-actions">
          {!progress.isComplete && nextLesson ? (
            <Link className="secondary-action" href={nextLesson.href}>
              {progress.completedCount > 0 ? "Ga verder" : "Start het leerpad"}
            </Link>
          ) : null}
          {progress.completedCount > 0 ? (
            <button
              className="text-button"
              type="button"
              aria-expanded={confirmingReset}
              aria-controls="learning-progress-reset-confirmation"
              ref={resetButtonRef}
              onClick={() => setConfirmingReset((current) => !current)}
            >
              Wis voortgang
            </button>
          ) : null}
          {confirmingReset ? (
            <div
              className="learning-progress-reset"
              id="learning-progress-reset-confirmation"
              role="group"
              aria-label="Voortgang wissen"
            >
              <p>Alle lesmarkeringen voor dit leerpad worden op dit apparaat verwijderd.</p>
              <div>
                <button
                  className="secondary-action"
                  type="button"
                  disabled={progress.isSaving}
                  onClick={() => {
                    void progress.clear().then(() => {
                      setConfirmingReset(false);
                      requestAnimationFrame(() => progressTitleRef.current?.focus());
                    });
                  }}
                >
                  Ja, wis voortgang
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setConfirmingReset(false);
                    requestAnimationFrame(() => resetButtonRef.current?.focus());
                  }}
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function LearningPathStepList({ pathId, lessons }: LearningPathProgressProps) {
  const stepIds = lessons.map((lesson) => lesson.stepId);
  const progress = useLearningProgress({ pathId, stepIds });

  return (
    <ol className="learning-step-list">
      {lessons.map((lesson, index) => {
        const completed = progress.isReady && progress.isStepComplete(lesson.stepId);
        return (
          <li className={completed ? "is-complete" : undefined} key={lesson.stepId}>
            <span className="learning-step-number" aria-hidden="true">
              {completed ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="learning-step-kind">{completed ? "Voltooid" : "Kernles"}</p>
              <h3>
                <Link href={lesson.href}>{lesson.title}</Link>
              </h3>
              {lesson.context ? <p>{lesson.context}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface LearningCompletionStatusProps extends LearningPathProgressProps {
  pathHref: string;
  encouragement: string;
}

export function LearningCompletionStatus({
  pathId,
  lessons,
  pathHref,
  encouragement,
}: LearningCompletionStatusProps) {
  const stepIds = lessons.map((lesson) => lesson.stepId);
  const progress = useLearningProgress({ pathId, stepIds });
  const nextLesson = lessons.find((lesson) => lesson.stepId === progress.firstIncompleteStepId);

  if (!progress.isReady) {
    return <div className="learning-completion-status loading" aria-hidden="true" />;
  }

  return (
    <section
      className={`learning-completion-status${progress.isComplete ? " is-complete" : ""}`}
      aria-labelledby="completion-status-title"
      aria-live="polite"
    >
      <p className="eyebrow">Lokale voortgang</p>
      <h2 id="completion-status-title">
        {progress.isComplete ? "Je hebt alle lessen voltooid" : "Je leerpad is nog niet voltooid"}
      </h2>
      <ProgressMeter completed={progress.completedCount} total={lessons.length} />
      <p>
        {progress.isComplete
          ? `${encouragement} Je hebt iedere les bewust als voltooid gemarkeerd; deze status is lokaal in deze browser bewaard.`
          : "Je kunt deze terugblik altijd bekijken. Een persoonlijke voltooiing verschijnt pas wanneer je iedere les bewust hebt gemarkeerd."}
      </p>
      {!progress.isComplete && nextLesson ? (
        <Link className="secondary-action" href={nextLesson.href}>
          Ga naar {nextLesson.title}
        </Link>
      ) : (
        <Link className="text-link" href={pathHref}>
          Bekijk het leerpad opnieuw
        </Link>
      )}
    </section>
  );
}
