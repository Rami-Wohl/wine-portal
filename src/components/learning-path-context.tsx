"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface LearningPathContextOption {
  pathSlug: string;
  pathTitle: string;
  pathHref: string;
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
      </section>
    );
  }

  return (
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
  );
}
