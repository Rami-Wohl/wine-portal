import { LearningCompletionStatus } from "@/components/learning-progress";
import type { LearningPath, Locale } from "@/content/model";
import {
  getEntityById,
  getEntityPublicHref,
  getLearningPathById,
  getLearningPathByRoute,
  getNarrativeById,
  getPublishedLearningPaths,
} from "@/content/repository";
import {
  contentLabels,
  learningPathCompletionHref,
  learningPathHref,
  learningPathLessonHref,
  narrativeHref,
} from "@/content/routing";
import { localizedHref, withRouteQuery, type RouteQuery } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

interface LearningPathCompletionPageProps {
  searchParams?: Promise<RouteQuery>;
  params: Promise<{ lang: string; slug: string }>;
}

interface SuggestionPresentation {
  href: string;
  kind: string;
  title: string;
}

function suggestionPresentation(
  suggestion: LearningPath["completion"]["suggestions"][number],
  locale: Locale,
): SuggestionPresentation | undefined {
  if (suggestion.target.startsWith("learning-path.")) {
    const target = getLearningPathById(suggestion.target);
    return target?.status === "active"
      ? {
          href: learningPathHref(target, locale),
          kind: locale === "nl" ? "Leerpad" : "Learning path",
          title: target.title[locale],
        }
      : undefined;
  }
  if (suggestion.target.startsWith("narrative.")) {
    const target = getNarrativeById(suggestion.target);
    return target?.status === "active"
      ? {
          href: narrativeHref(target, locale),
          kind: contentLabels(locale).narrative[target.type],
          title: target.title[locale],
        }
      : undefined;
  }
  const target = getEntityById(suggestion.target);
  return target?.status === "active"
    ? {
        href: getEntityPublicHref(target, locale),
        kind: contentLabels(locale).entity[target.type],
        title: target.names[locale],
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
  const locale = await pageLocale(params);
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") return {};

  return {
    title:
      locale === "nl"
        ? `Afronding — ${learningPath.title[locale]}`
        : `Completion — ${learningPath.title[locale]}`,
    description:
      locale === "nl"
        ? `Blik terug op wat je hebt geleerd in ${learningPath.title[locale]}.`
        : `Review what you have learned in ${learningPath.title[locale]}.`,
    alternates: { canonical: learningPathCompletionHref(learningPath, locale) },
    robots: { index: false, follow: true },
  };
}

export default async function LearningPathCompletionPage({
  params,
  searchParams,
}: LearningPathCompletionPageProps) {
  const locale = await pageLocale(params);
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") notFound();
  if (slug !== learningPath.slugs.en) {
    permanentRedirect(
      withRouteQuery(learningPathCompletionHref(learningPath, locale), (await searchParams) ?? {}),
    );
  }

  const suggestions = learningPath.completion.suggestions.flatMap((suggestion) => {
    const presentation = suggestionPresentation(suggestion, locale);
    return presentation ? [{ suggestion, presentation }] : [];
  });
  const progressLessons = learningPath.steps.flatMap((step) => {
    const lesson = getNarrativeById(step.target);
    return lesson
      ? [
          {
            stepId: step.id,
            title: lesson.title[locale],
            href: learningPathLessonHref(learningPath, lesson, locale),
          },
        ]
      : [];
  });

  return (
    <main id="main-content" className="page-shell learning-completion-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Broodkruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/learn", locale)}>{locale === "nl" ? "Leren" : "Learn"}</Link>
        <span aria-hidden="true">/</span>
        <Link href={learningPathHref(learningPath, locale)}>{learningPath.title[locale]}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{locale === "nl" ? "Afronding" : "Completion"}</span>
      </nav>

      <header className="learning-completion-hero">
        <p className="eyebrow">{locale === "nl" ? "Afronding" : "Completion"}</p>
        <h1>
          {locale === "nl" ? "Terugblik op het leerpad" : "Looking back on the learning path"}
        </h1>
        <p>
          {locale === "nl"
            ? "Bekijk wat deze route samenbrengt en welke lessen je bewust hebt afgerond."
            : "Review what this path brings together and the lessons you have marked as complete."}
        </p>
      </header>

      <LearningCompletionStatus
        pathId={learningPath.id}
        lessons={progressLessons}
        pathHref={learningPathHref(learningPath, locale)}
        encouragement={learningPath.completion.encouragement[locale]}
      />

      <section className="learning-recap" aria-labelledby="learning-recap-title">
        <p className="eyebrow">{locale === "nl" ? "Terugblik" : "Recap"}</p>
        <h2 id="learning-recap-title">
          {locale === "nl" ? "De belangrijkste opbrengsten" : "What you have learned"}
        </h2>
        <ul>
          {learningPath.completion.recap[locale].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="learning-next" aria-labelledby="learning-next-title">
        <div className="section-heading-compact">
          <p className="eyebrow">{locale === "nl" ? "Verder leren" : "Continue learning"}</p>
          <h2 id="learning-next-title">
            {locale === "nl" ? "Kies je volgende stap" : "Choose your next step"}
          </h2>
        </div>
        <div className="learning-suggestion-grid">
          {suggestions.map(({ suggestion, presentation }) => (
            <Link href={presentation.href} key={suggestion.id}>
              <span>{presentation.kind}</span>
              <strong>{presentation.title}</strong>
              <p>{suggestion.context[locale]}</p>
            </Link>
          ))}
        </div>
        <Link className="text-link" href={learningPathHref(learningPath, locale)}>
          {locale === "nl" ? "Terug naar het leerpad" : "Back to the learning path"}{" "}
        </Link>
      </section>
    </main>
  );
}
