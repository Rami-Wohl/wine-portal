"use client";

import { useLearningProgress } from "@/hooks/use-learning-progress";
import { useLocale } from "@/i18n/locale-context";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface LearningPathContextOption {
  pathId: string;
  pathSlug: string;
  pathTitle: string;
  pathHref: string;
  stepId: string;
  stepIds: string[];
  position: number;
  total: number;
  previous?: {
    title: string;
    href: string;
  };
  next: {
    title: string;
    href: string;
    kind: "lesson" | "completion";
  };
}

interface LearningPathContextProps {
  options: LearningPathContextOption[];
  placement: "header" | "footer";
}

export function selectLearningPathContext(
  options: LearningPathContextOption[],
  pathValues: string[],
): LearningPathContextOption | undefined {
  if (pathValues.length !== 1) return undefined;
  return options.find((option) => option.pathSlug === pathValues[0]);
}

export function LearningPathContext({ options, placement }: LearningPathContextProps) {
  const searchParams = useSearchParams();
  const context = selectLearningPathContext(options, searchParams.getAll("path"));
  if (!context) return null;

  return <LearningPathContextView context={context} placement={placement} />;
}

function LessonCompletionToggle({ context }: { context: LearningPathContextOption }) {
  const locale = useLocale();
  const progress = useLearningProgress({ pathId: context.pathId, stepIds: context.stepIds });
  const completed = progress.isStepComplete(context.stepId);

  return (
    <button
      className={`lesson-completion-toggle${completed ? " is-complete" : ""}`}
      type="button"
      aria-pressed={completed}
      disabled={!progress.isReady || progress.isSaving}
      onClick={() => void progress.toggleStep(context.stepId)}
    >
      <span className="lesson-completion-icon" aria-hidden="true">
        {completed ? "✓" : ""}
      </span>
      <span>
        <strong>
          {completed
            ? locale === "nl"
              ? "Les voltooid"
              : "Lesson complete"
            : locale === "nl"
              ? "Nog te leren"
              : "Still to learn"}
        </strong>
        <small>
          {completed
            ? locale === "nl"
              ? "Markeer als nog te leren"
              : "Mark as still to learn"
            : locale === "nl"
              ? "Markeer als voltooid"
              : "Mark as complete"}
        </small>
      </span>
    </button>
  );
}

function LearningPathContextView({
  context,
  placement,
}: {
  context: LearningPathContextOption;
  placement: LearningPathContextProps["placement"];
}) {
  const locale = useLocale();
  if (placement === "header") {
    return (
      <section
        className="lesson-path-context"
        aria-label={
          locale === "nl" ? "Positie binnen het leerpad" : "Position in the learning path"
        }
      >
        <div>
          <p className="eyebrow">
            {locale === "nl" ? "Onderdeel van het leerpad" : "Part of the learning path"}
          </p>
          <Link href={context.pathHref}>{context.pathTitle}</Link>
        </div>
        <p>
          {locale === "nl" ? "Les" : "Lesson"} <strong>{context.position}</strong>{" "}
          {locale === "nl" ? "van" : "of"} {context.total}
        </p>
        <LessonCompletionToggle context={context} />
      </section>
    );
  }

  return (
    <div className="lesson-path-footer">
      <div className="lesson-completion-footer">
        <div>
          <p className="eyebrow">{locale === "nl" ? "Rond deze les af" : "Complete this lesson"}</p>
          <p>
            {locale === "nl"
              ? "Markeer de les bewust wanneer je klaar bent. Navigeren alleen telt niet mee."
              : "Mark the lesson as complete when you are ready. Opening a page alone does not count."}
          </p>
        </div>
        <LessonCompletionToggle context={context} />
      </div>
      <nav
        className="lesson-path-navigation"
        aria-label={
          locale === "nl" ? "Verder binnen het leerpad" : "Continue through the learning path"
        }
      >
        <div className="lesson-path-navigation-heading">
          <p className="eyebrow">{locale === "nl" ? "Verder leren" : "Continue learning"}</p>
          <p>
            {locale === "nl" ? "Les" : "Lesson"} {context.position} {locale === "nl" ? "van" : "of"}{" "}
            {context.total} ·{" "}
            <Link href={context.pathHref}>
              {locale === "nl" ? "bekijk het leerpad" : "view the learning path"}
            </Link>
          </p>
        </div>
        <div className="lesson-path-navigation-links">
          {context.previous ? (
            <Link className="lesson-path-navigation-link previous" href={context.previous.href}>
              <span>{locale === "nl" ? "← Vorige les" : "← Previous lesson"}</span>
              <strong>{context.previous.title}</strong>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <Link className="lesson-path-navigation-link next" href={context.next.href}>
            <span>
              {context.next.kind === "completion"
                ? locale === "nl"
                  ? "Naar de afsluiting"
                  : "Go to the conclusion"
                : locale === "nl"
                  ? "Volgende les"
                  : "Next lesson"}{" "}
              →
            </span>
            <strong>{context.next.title}</strong>
          </Link>
        </div>
      </nav>
    </div>
  );
}
