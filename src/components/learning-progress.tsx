"use client";

import { useLearningProgress } from "@/hooks/use-learning-progress";
import { useLocale } from "@/i18n/locale-context";
import Link from "next/link";
import { useRef, useState } from "react";

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
  const locale = useLocale();
  return (
    <div className="learning-progress-meter">
      <progress
        value={completed}
        max={total}
        aria-label={
          locale === "nl"
            ? `${completed} van ${total} voltooid`
            : `${completed} of ${total} complete`
        }
      />
      <span>
        {completed} {locale === "nl" ? "van" : "of"} {total}{" "}
        {total === 1
          ? locale === "nl"
            ? "les"
            : "lesson"
          : locale === "nl"
            ? "lessen"
            : "lessons"}{" "}
        {locale === "nl" ? "voltooid" : "complete"}{" "}
      </span>
    </div>
  );
}

export function LearningPathCardProgress({ pathId, lessons }: LearningPathProgressProps) {
  const locale = useLocale();
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
        <Link href={nextLesson.href}>
          {locale === "nl" ? "Ga verder met" : "Continue with"} {nextLesson.title} →
        </Link>
      ) : progress.isComplete ? (
        <span className="learning-progress-complete">
          {locale === "nl" ? "Leerpad voltooid" : "Learning path complete"}
        </span>
      ) : (
        <span>{locale === "nl" ? "Nog niet gestart" : "Not started yet"}</span>
      )}
    </div>
  );
}

export function LearningPathProgressPanel({ pathId, lessons }: LearningPathProgressProps) {
  const locale = useLocale();
  const stepIds = lessons.map((lesson) => lesson.stepId);
  const progress = useLearningProgress({ pathId, stepIds });
  const [confirmingReset, setConfirmingReset] = useState(false);
  const progressTitleRef = useRef<HTMLHeadingElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const nextLesson = lessons.find((lesson) => lesson.stepId === progress.firstIncompleteStepId);

  return (
    <section className="learning-progress-panel" aria-labelledby="learning-progress-title">
      <div>
        <p className="eyebrow">{locale === "nl" ? "Jouw voortgang" : "Your progress"}</p>
        <h2 id="learning-progress-title" ref={progressTitleRef} tabIndex={-1}>
          {!progress.isReady
            ? locale === "nl"
              ? "Voortgang laden"
              : "Loading progress"
            : progress.isComplete
              ? locale === "nl"
                ? "Alle lessen voltooid"
                : "All lessons complete"
              : progress.completedCount > 0
                ? locale === "nl"
                  ? "Ga verder waar je was"
                  : "Continue where you left off"
                : locale === "nl"
                  ? "Klaar om te beginnen"
                  : "Ready to begin"}
        </h2>
        {progress.isReady ? (
          <ProgressMeter completed={progress.completedCount} total={lessons.length} />
        ) : (
          <p className="learning-progress-loading">
            {locale === "nl"
              ? "Je lokale voortgang wordt gecontroleerd."
              : "Checking your local progress."}
          </p>
        )}
        {progress.persistence === "temporary" && progress.isReady ? (
          <p className="learning-progress-notice" role="status">
            {locale === "nl"
              ? "Opslaan in deze browser is niet beschikbaar. Wijzigingen gelden alleen tijdens dit bezoek. Eerder opgeslagen voortgang kan bij een nieuw bezoek terugkomen; de lessen en navigatie blijven gewoon werken."
              : "Storage is unavailable in this browser. Changes last only for this visit. Previously saved progress may return on your next visit; lessons and navigation remain available."}{" "}
          </p>
        ) : null}
      </div>

      {progress.isReady ? (
        <div className="learning-progress-actions">
          {!progress.isComplete && nextLesson ? (
            <Link className="secondary-action" href={nextLesson.href}>
              {progress.completedCount > 0
                ? locale === "nl"
                  ? "Ga verder"
                  : "Continue"
                : locale === "nl"
                  ? "Start het leerpad"
                  : "Start the learning path"}
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
              {locale === "nl" ? "Wis voortgang" : "Clear progress"}{" "}
            </button>
          ) : null}
          {confirmingReset ? (
            <div
              className="learning-progress-reset"
              id="learning-progress-reset-confirmation"
              role="group"
              aria-label={locale === "nl" ? "Voortgang wissen" : "Clear progress"}
            >
              <p>
                {locale === "nl"
                  ? "Alle lesmarkeringen voor dit leerpad worden op dit apparaat verwijderd."
                  : "All completion marks for this learning path will be removed from this device."}
              </p>
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
                  {locale === "nl" ? "Ja, wis voortgang" : "Yes, clear progress"}{" "}
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setConfirmingReset(false);
                    requestAnimationFrame(() => resetButtonRef.current?.focus());
                  }}
                >
                  {locale === "nl" ? "Annuleren" : "Cancel"}{" "}
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
  const locale = useLocale();
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
              <p className="learning-step-kind">
                {completed
                  ? locale === "nl"
                    ? "Voltooid"
                    : "Complete"
                  : locale === "nl"
                    ? "Kernles"
                    : "Core lesson"}
              </p>
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
  const locale = useLocale();
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
      <p className="eyebrow">{locale === "nl" ? "Lokale voortgang" : "Local progress"}</p>
      <h2 id="completion-status-title">
        {progress.isComplete
          ? locale === "nl"
            ? "Je hebt alle lessen voltooid"
            : "You have completed every lesson"
          : locale === "nl"
            ? "Je leerpad is nog niet voltooid"
            : "Your learning path is not complete yet"}
      </h2>
      <ProgressMeter completed={progress.completedCount} total={lessons.length} />
      <p>
        {progress.isComplete
          ? locale === "nl"
            ? `${encouragement} Je hebt iedere les bewust als voltooid gemarkeerd; deze status is lokaal in deze browser bewaard.`
            : `${encouragement} You have marked every lesson as complete. This status is saved locally in this browser.`
          : locale === "nl"
            ? "Je kunt deze terugblik altijd bekijken. Een persoonlijke voltooiing verschijnt pas wanneer je iedere les bewust hebt gemarkeerd."
            : "You can view this recap at any time. Your personal completion status appears once you have marked every lesson as complete."}
      </p>
      {!progress.isComplete && nextLesson ? (
        <Link className="secondary-action" href={nextLesson.href}>
          {locale === "nl" ? "Ga naar" : "Go to"} {nextLesson.title}
        </Link>
      ) : (
        <Link className="text-link" href={pathHref}>
          {locale === "nl" ? "Bekijk het leerpad opnieuw" : "Revisit the learning path"}{" "}
        </Link>
      )}
    </section>
  );
}
