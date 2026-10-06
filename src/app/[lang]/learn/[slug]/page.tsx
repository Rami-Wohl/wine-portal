import { LearningPathProgressPanel, LearningPathStepList } from "@/components/learning-progress";
import type { GeneratedNarrative } from "@/content/model";
import {
  getLearningPathByRoute,
  getNarrativeById,
  getPublishedLearningPaths,
} from "@/content/repository";
import {
  contentLabels,
  learningPathCompletionHref,
  learningPathHref,
  learningPathLessonHref,
} from "@/content/routing";
import { languageAlternates, localizedHref, withRouteQuery, type RouteQuery } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

interface LearningPathPageProps {
  searchParams?: Promise<RouteQuery>;
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return getPublishedLearningPaths().flatMap((learningPath) =>
    Array.from(new Set([learningPath.slugs.en, learningPath.slugs.nl])).map((slug) => ({ slug })),
  );
}

export async function generateMetadata({ params }: LearningPathPageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") return {};

  return {
    title: learningPath.title[locale],
    description: learningPath.summary[locale],
    alternates: languageAlternates(learningPathHref(learningPath, locale), locale),
  };
}

export default async function LearningPathPage({ params, searchParams }: LearningPathPageProps) {
  const locale = await pageLocale(params);
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") notFound();
  if (slug !== learningPath.slugs.en)
    permanentRedirect(
      withRouteQuery(learningPathHref(learningPath, locale), (await searchParams) ?? {}),
    );

  const lessons = learningPath.steps.map((step) => ({
    step,
    lesson: getNarrativeById(step.target),
  }));
  if (
    lessons.some(
      (item): item is { step: (typeof learningPath.steps)[number]; lesson: undefined } =>
        !item.lesson || item.lesson.type !== "lesson" || item.lesson.status !== "active",
    )
  ) {
    notFound();
  }
  const resolvedLessons = lessons as Array<{
    step: (typeof learningPath.steps)[number];
    lesson: GeneratedNarrative;
  }>;
  const progressLessons = resolvedLessons.map(({ step, lesson }) => ({
    stepId: step.id,
    title: lesson.title[locale],
    href: learningPathLessonHref(learningPath, lesson, locale),
    context: step.context[locale],
  }));

  return (
    <main id="main-content" className="page-shell learning-path-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Broodkruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/learn", locale)}>{locale === "nl" ? "Leren" : "Learn"}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{learningPath.title[locale]}</span>
      </nav>

      <header className="learning-path-hero">
        <p className="eyebrow">
          Leerpad · {contentLabels(locale).curriculum[learningPath.curriculum_level]}
        </p>
        <h1>{learningPath.title[locale]}</h1>
        <p className="learning-path-summary">{learningPath.summary[locale]}</p>
        <dl
          className="learning-path-facts"
          aria-label={locale === "nl" ? "Leerpadinformatie" : "Learning path information"}
        >
          <div>
            <dt>{locale === "nl" ? "Omvang" : "Length"}</dt>
            <dd>
              {learningPath.steps.length}{" "}
              {learningPath.steps.length === 1
                ? locale === "nl"
                  ? "kernles"
                  : "core lesson"
                : locale === "nl"
                  ? "kernlessen"
                  : "core lessons"}
            </dd>
          </div>
          <div>
            <dt>{locale === "nl" ? "Voor wie" : "Who it is for"}</dt>
            <dd>{learningPath.audience[locale]}</dd>
          </div>
        </dl>
      </header>

      <LearningPathProgressPanel pathId={learningPath.id} lessons={progressLessons} />

      <div className="learning-path-layout">
        <div className="learning-path-main">
          <section className="learning-path-objectives" aria-labelledby="path-objectives-title">
            <p className="eyebrow">
              {locale === "nl" ? "Na dit leerpad" : "After this learning path"}
            </p>
            <h2 id="path-objectives-title">
              {locale === "nl" ? "Dit kun je uitleggen" : "What you will be able to explain"}
            </h2>
            <ul>
              {learningPath.objectives[locale].map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <section className="learning-path-route" aria-labelledby="path-route-title">
            <div className="section-heading-compact">
              <p className="eyebrow">{locale === "nl" ? "De route" : "The route"}</p>
              <h2 id="path-route-title">
                {locale === "nl" ? "Kernlessen in volgorde" : "Core lessons in order"}
              </h2>
              <p>
                {locale === "nl"
                  ? "Alleen deze lessen vormen de voortgang van het pad. Links naar begrippen en andere kennisbankpagina's zijn naslag: nuttig, maar geen verplichte stap."
                  : "These lessons count towards your progress through the path. Links to concepts and other knowledge pages provide optional reference material."}{" "}
              </p>
            </div>
            <LearningPathStepList pathId={learningPath.id} lessons={progressLessons} />
          </section>
        </div>

        <aside className="learning-path-sidebar" aria-labelledby="path-start-title">
          <p className="eyebrow">{locale === "nl" ? "Voor je begint" : "Before you begin"}</p>
          <h2 id="path-start-title">{locale === "nl" ? "Voorkennis" : "Prior knowledge"}</h2>
          {learningPath.prerequisites[locale].length > 0 ? (
            <ul>
              {learningPath.prerequisites[locale].map((prerequisite) => (
                <li key={prerequisite}>{prerequisite}</li>
              ))}
            </ul>
          ) : (
            <p>
              {locale === "nl"
                ? "Je hebt voor dit leerpad geen specifieke voorkennis nodig."
                : "This path does not require any specific prior knowledge."}
            </p>
          )}
          <p className="learning-path-reference-note">
            {locale === "nl"
              ? "Je kunt iedere les ook zelfstandig openen. Naslagpagina's blijven altijd optioneel."
              : "You can also open each lesson on its own. Reference pages are always optional."}{" "}
          </p>
          <Link className="text-link" href={learningPathCompletionHref(learningPath, locale)}>
            {locale === "nl" ? "Bekijk de afsluiting" : "View the conclusion"}{" "}
          </Link>
        </aside>
      </div>
    </main>
  );
}
