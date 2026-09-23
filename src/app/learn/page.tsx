import type { Metadata } from "next";
import Link from "next/link";
import { LearningPathCardProgress } from "@/components/learning-progress";
import { PageIntro } from "@/components/page-intro";
import {
  getNarrativeById,
  getPublishedLearningPaths,
  getPublishedStandaloneLessons,
} from "@/content/repository";
import {
  CURRICULUM_LEVEL_LABELS_NL,
  DEPTH_LABELS_NL,
  learningPathHref,
  learningPathLessonHref,
  narrativeHref,
} from "@/content/routing";

export const metadata: Metadata = {
  title: "Leer wijn op jouw niveau",
  description:
    "Volg gestructureerde leerpaden en verdiep je wijnkennis van fundamentele onderwerpen tot specialistisch niveau.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const learningPaths = getPublishedLearningPaths();
  const standaloneLessons = getPublishedStandaloneLessons();

  return (
    <main id="main-content" className="page-shell learn-catalog-page">
      <PageIntro eyebrow="Leren" title="Leer in een doordachte volgorde">
        <p>
          Leerpaden bouwen wijnkennis stap voor stap op. Iedere kernles vertelt een zelfstandig
          verhaal; links naar de kennisbank bieden extra naslag wanneer je verder wilt kijken.
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="paths-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Leerpaden</p>
          <h2 id="paths-title">Kies een route</h2>
          <p>Elk pad heeft een duidelijk instapniveau, vaste kernlessen en een eigen afronding.</p>
        </div>
        {learningPaths.length > 0 ? (
          <div className="learning-path-grid">
            {learningPaths.map((learningPath) => (
              <article className="learning-path-card" key={learningPath.id}>
                <div className="learning-card-meta">
                  <span>{CURRICULUM_LEVEL_LABELS_NL[learningPath.curriculum_level]}</span>
                  <span>
                    {learningPath.steps.length} {learningPath.steps.length === 1 ? "les" : "lessen"}
                  </span>
                </div>
                <h3>{learningPath.title.nl}</h3>
                <p>{learningPath.summary.nl}</p>
                <LearningPathCardProgress
                  pathId={learningPath.id}
                  lessons={learningPath.steps.flatMap((step) => {
                    const lesson = getNarrativeById(step.target);
                    return lesson
                      ? [
                          {
                            stepId: step.id,
                            title: lesson.title.nl,
                            href: learningPathLessonHref(learningPath, lesson),
                          },
                        ]
                      : [];
                  })}
                />
                <Link className="learning-card-link" href={learningPathHref(learningPath)}>
                  Bekijk het leerpad <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="learning-path-empty">
            <div>
              <p className="eyebrow">In redactie</p>
              <h3>Het eerste volledige leerpad wordt opgebouwd.</h3>
            </div>
            <p>
              Afgeronde lessen kun je hieronder alvast los lezen. Het pad verschijnt hier zodra alle
              kernlessen inhoudelijk en visueel zijn beoordeeld.
            </p>
          </div>
        )}
      </section>

      {standaloneLessons.length > 0 ? (
        <section className="standalone-lessons" aria-labelledby="standalone-lessons-title">
          <div className="section-heading-compact">
            <p className="eyebrow">Losse lessen</p>
            <h2 id="standalone-lessons-title">Nu al te lezen</h2>
            <p>
              Zelfstandige lessen die nog niet als onderdeel van een gepubliceerd leerpad tellen.
            </p>
          </div>
          <div className="standalone-lesson-list">
            {standaloneLessons.map((lesson) => (
              <Link href={narrativeHref(lesson)} key={lesson.id}>
                <span className="standalone-lesson-type">Les</span>
                <strong>{lesson.title.nl}</strong>
                <span className="standalone-lesson-meta">
                  {lesson.depth ? DEPTH_LABELS_NL[lesson.depth] : "Zelfstandig te lezen"}
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
