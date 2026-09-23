import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { LearningPath } from "@/content/model";
import {
  getEntityById,
  getEntityPublicHref,
  getLearningPathById,
  getLearningPathByRoute,
  getNarrativeById,
  getPublishedLearningPaths,
} from "@/content/repository";
import {
  ENTITY_TYPE_LABELS_NL,
  NARRATIVE_TYPE_LABELS_NL,
  learningPathCompletionHref,
  learningPathHref,
  narrativeHref,
} from "@/content/routing";

interface LearningPathCompletionPageProps {
  params: Promise<{ slug: string }>;
}

interface SuggestionPresentation {
  href: string;
  kind: string;
  title: string;
}

function suggestionPresentation(
  suggestion: LearningPath["completion"]["suggestions"][number],
): SuggestionPresentation | undefined {
  if (suggestion.target.startsWith("learning-path.")) {
    const target = getLearningPathById(suggestion.target);
    return target?.status === "active"
      ? { href: learningPathHref(target), kind: "Leerpad", title: target.title.nl }
      : undefined;
  }
  if (suggestion.target.startsWith("narrative.")) {
    const target = getNarrativeById(suggestion.target);
    return target?.status === "active"
      ? {
          href: narrativeHref(target),
          kind: NARRATIVE_TYPE_LABELS_NL[target.type],
          title: target.title.nl,
        }
      : undefined;
  }
  const target = getEntityById(suggestion.target);
  return target?.status === "active"
    ? {
        href: getEntityPublicHref(target),
        kind: ENTITY_TYPE_LABELS_NL[target.type],
        title: target.names.nl,
      }
    : undefined;
}

export function generateStaticParams() {
  return getPublishedLearningPaths().flatMap((learningPath) =>
    Array.from(new Set([learningPath.slugs.en, learningPath.slugs.nl])).map((slug) => ({ slug })),
  );
}

export async function generateMetadata({
  params,
}: LearningPathCompletionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") return {};

  return {
    title: `Afronding — ${learningPath.title.nl}`,
    description: `Blik terug op wat je hebt geleerd in ${learningPath.title.nl}.`,
    alternates: { canonical: learningPathCompletionHref(learningPath) },
    robots: { index: false, follow: true },
  };
}

export default async function LearningPathCompletionPage({
  params,
}: LearningPathCompletionPageProps) {
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") notFound();
  if (slug !== learningPath.slugs.en) {
    permanentRedirect(learningPathCompletionHref(learningPath));
  }

  const suggestions = learningPath.completion.suggestions.flatMap((suggestion) => {
    const presentation = suggestionPresentation(suggestion);
    return presentation ? [{ suggestion, presentation }] : [];
  });

  return (
    <main id="main-content" className="page-shell learning-completion-page">
      <nav className="breadcrumbs" aria-label="Broodkruimelpad">
        <Link href="/learn">Leren</Link>
        <span aria-hidden="true">/</span>
        <Link href={learningPathHref(learningPath)}>{learningPath.title.nl}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Afronding</span>
      </nav>

      <header className="learning-completion-hero">
        <p className="eyebrow">Afronding</p>
        <h1>Wat je nu kunt</h1>
        <p>{learningPath.completion.encouragement.nl}</p>
      </header>

      <section className="learning-recap" aria-labelledby="learning-recap-title">
        <p className="eyebrow">Terugblik</p>
        <h2 id="learning-recap-title">De belangrijkste opbrengsten</h2>
        <ul>
          {learningPath.completion.recap.nl.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="learning-next" aria-labelledby="learning-next-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Verder leren</p>
          <h2 id="learning-next-title">Kies je volgende stap</h2>
        </div>
        <div className="learning-suggestion-grid">
          {suggestions.map(({ suggestion, presentation }) => (
            <Link href={presentation.href} key={suggestion.id}>
              <span>{presentation.kind}</span>
              <strong>{presentation.title}</strong>
              <p>{suggestion.context.nl}</p>
            </Link>
          ))}
        </div>
        <Link className="text-link" href={learningPathHref(learningPath)}>
          Terug naar het leerpad
        </Link>
      </section>
    </main>
  );
}
