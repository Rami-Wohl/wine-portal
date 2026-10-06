import { LearningPathCardProgress } from "@/components/learning-progress";
import { PageIntro } from "@/components/page-intro";
import {
  getNarrativeById,
  getPublishedLearningPaths,
  getPublishedStandaloneLessons,
} from "@/content/repository";
import {
  contentLabels,
  learningPathHref,
  learningPathLessonHref,
  narrativeHref,
} from "@/content/routing";
import { languageAlternates } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Leer wijn op jouw niveau" : "Learn about wine at your own level",
    description:
      locale === "nl"
        ? "Volg gestructureerde leerpaden en verdiep je wijnkennis van fundamentele onderwerpen tot specialistisch niveau."
        : "Follow structured learning paths and develop your wine knowledge from the foundations to specialist topics.",
    alternates: languageAlternates("/learn", locale),
  };
}

export default async function LearnPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const learningPaths = getPublishedLearningPaths();
  const standaloneLessons = getPublishedStandaloneLessons();

  return (
    <main id="main-content" className="page-shell learn-catalog-page" tabIndex={-1}>
      <PageIntro
        eyebrow={locale === "nl" ? "Leren" : "Learn"}
        title={
          locale === "nl" ? "Leer in een doordachte volgorde" : "Learn in a thoughtful sequence"
        }
      >
        <p>
          {locale === "nl"
            ? "Leerpaden bouwen wijnkennis stap voor stap op. Iedere kernles vertelt een zelfstandig verhaal; links naar de kennisbank bieden extra naslag wanneer je verder wilt kijken."
            : "Learning paths build your wine knowledge step by step. Each core lesson stands on its own, with links to the knowledge base for further reading."}{" "}
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="paths-title">
        <div className="section-heading-compact">
          <p className="eyebrow">{locale === "nl" ? "Leerpaden" : "Learning paths"}</p>
          <h2 id="paths-title">{locale === "nl" ? "Kies een route" : "Choose a path"}</h2>
          <p>
            {locale === "nl"
              ? "Elk pad heeft een duidelijk instapniveau, vaste kernlessen en een eigen afronding."
              : "Each path has a clear starting level, a set of core lessons and its own conclusion."}
          </p>
        </div>
        {learningPaths.length > 0 ? (
          <div className="learning-path-grid">
            {learningPaths.map((learningPath) => (
              <article className="learning-path-card" key={learningPath.id}>
                <div className="learning-card-meta">
                  <span>{contentLabels(locale).curriculum[learningPath.curriculum_level]}</span>
                  <span>
                    {learningPath.steps.length}{" "}
                    {learningPath.steps.length === 1
                      ? locale === "nl"
                        ? "les"
                        : "lesson"
                      : locale === "nl"
                        ? "lessen"
                        : "lessons"}
                  </span>
                </div>
                <h3>{learningPath.title[locale]}</h3>
                <p>{learningPath.summary[locale]}</p>
                <LearningPathCardProgress
                  pathId={learningPath.id}
                  lessons={learningPath.steps.flatMap((step) => {
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
                  })}
                />
                <Link className="learning-card-link" href={learningPathHref(learningPath, locale)}>
                  {locale === "nl" ? "Bekijk het leerpad" : "View the learning path"}{" "}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="learning-path-empty">
            <div>
              <p className="eyebrow">{locale === "nl" ? "In redactie" : "In review"}</p>
              <h3>
                {locale === "nl"
                  ? "Het eerste volledige leerpad wordt opgebouwd."
                  : "The first complete learning path is being prepared."}
              </h3>
            </div>
            <p>
              {locale === "nl"
                ? "Afgeronde lessen kun je hieronder alvast los lezen. Het pad verschijnt hier zodra alle kernlessen inhoudelijk en visueel zijn beoordeeld."
                : "You can already read the completed lessons below. The path will appear once every core lesson has passed its content and visual review."}{" "}
            </p>
          </div>
        )}
      </section>

      {standaloneLessons.length > 0 ? (
        <section className="standalone-lessons" aria-labelledby="standalone-lessons-title">
          <div className="section-heading-compact">
            <p className="eyebrow">{locale === "nl" ? "Losse lessen" : "Standalone lessons"}</p>
            <h2 id="standalone-lessons-title">
              {locale === "nl" ? "Nu al te lezen" : "Ready to read"}
            </h2>
            <p>
              {locale === "nl"
                ? "Zelfstandige lessen die nog niet als onderdeel van een gepubliceerd leerpad tellen."
                : "Standalone lessons that are not yet part of a published learning path."}{" "}
            </p>
          </div>
          <div className="standalone-lesson-list">
            {standaloneLessons.map((lesson) => (
              <Link href={narrativeHref(lesson, locale)} key={lesson.id}>
                <span className="standalone-lesson-type">{locale === "nl" ? "Les" : "Lesson"}</span>
                <strong>{lesson.title[locale]}</strong>
                <span className="standalone-lesson-meta">
                  {lesson.depth
                    ? contentLabels(locale).depth[lesson.depth]
                    : locale === "nl"
                      ? "Zelfstandig te lezen"
                      : "Read independently"}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
