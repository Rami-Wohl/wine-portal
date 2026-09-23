"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLearningProgress } from "@/hooks/use-learning-progress";

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
        <strong>{completed ? "Les voltooid" : "Nog te leren"}</strong>
        <small>{completed ? "Markeer als nog te leren" : "Markeer als voltooid"}</small>
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
  if (placement === "header") {
    return (
      <section className="lesson-path-context" aria-label="Positie binnen het leerpad">
        <div>
          <p className="eyebrow">Onderdeel van het leerpad</p>
          <Link href={context.pathHref}>{context.pathTitle}</Link>
        </div>
        <p>
          Les <strong>{context.position}</strong> van {context.total}
        </p>
        <LessonCompletionToggle context={context} />
      </section>
    );
  }

  return (
    <div className="lesson-path-footer">
      <div className="lesson-completion-footer">
        <div>
          <p className="eyebrow">Rond deze les af</p>
          <p>Markeer de les bewust wanneer je klaar bent. Navigeren alleen telt niet mee.</p>
        </div>
        <LessonCompletionToggle context={context} />
      </div>
      <nav className="lesson-path-navigation" aria-label="Verder binnen het leerpad">
        <div className="lesson-path-navigation-heading">
          <p className="eyebrow">Verder leren</p>
          <p>
            Les {context.position} van {context.total} ·{" "}
            <Link href={context.pathHref}>bekijk het leerpad</Link>
          </p>
        </div>
        <div className="lesson-path-navigation-links">
          {context.previous ? (
            <Link className="lesson-path-navigation-link previous" href={context.previous.href}>
              <span>← Vorige les</span>
              <strong>{context.previous.title}</strong>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <Link className="lesson-path-navigation-link next" href={context.next.href}>
            <span>
              {context.next.kind === "completion" ? "Naar de afsluiting" : "Volgende les"} →
            </span>
            <strong>{context.next.title}</strong>
          </Link>
        </div>
      </nav>
    </div>
  );
}
