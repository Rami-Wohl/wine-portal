import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LearningPathProgressPanel, LearningPathStepList } from "@/components/learning-progress";
import type { GeneratedNarrative } from "@/content/model";
import {
  getLearningPathByRoute,
  getNarrativeById,
  getPublishedLearningPaths,
} from "@/content/repository";
import {
  CURRICULUM_LEVEL_LABELS_NL,
  learningPathCompletionHref,
  learningPathHref,
  learningPathLessonHref,
} from "@/content/routing";

interface LearningPathPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublishedLearningPaths().flatMap((learningPath) =>
    Array.from(new Set([learningPath.slugs.en, learningPath.slugs.nl])).map((slug) => ({ slug })),
  );
}

export async function generateMetadata({ params }: LearningPathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") return {};

  return {
    title: learningPath.title.nl,
    description: learningPath.summary.nl,
    alternates: { canonical: learningPathHref(learningPath) },
  };
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const { slug } = await params;
  const learningPath = getLearningPathByRoute(slug);
  if (!learningPath || learningPath.status !== "active") notFound();
  if (slug !== learningPath.slugs.en) permanentRedirect(learningPathHref(learningPath));

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
    title: lesson.title.nl,
    href: learningPathLessonHref(learningPath, lesson),
    context: step.context.nl,
  }));

  return (
    <main id="main-content" className="page-shell learning-path-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Broodkruimelpad">
        <Link href="/learn">Leren</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{learningPath.title.nl}</span>
      </nav>

      <header className="learning-path-hero">
        <p className="eyebrow">
          Leerpad · {CURRICULUM_LEVEL_LABELS_NL[learningPath.curriculum_level]}
        </p>
        <h1>{learningPath.title.nl}</h1>
        <p className="learning-path-summary">{learningPath.summary.nl}</p>
        <dl className="learning-path-facts" aria-label="Leerpadinformatie">
          <div>
            <dt>Omvang</dt>
            <dd>
              {learningPath.steps.length}{" "}
              {learningPath.steps.length === 1 ? "kernles" : "kernlessen"}
            </dd>
          </div>
          <div>
            <dt>Voor wie</dt>
            <dd>{learningPath.audience.nl}</dd>
          </div>
        </dl>
      </header>

      <LearningPathProgressPanel pathId={learningPath.id} lessons={progressLessons} />

      <div className="learning-path-layout">
        <div className="learning-path-main">
          <section className="learning-path-objectives" aria-labelledby="path-objectives-title">
            <p className="eyebrow">Na dit leerpad</p>
            <h2 id="path-objectives-title">Dit kun je uitleggen</h2>
            <ul>
              {learningPath.objectives.nl.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <section className="learning-path-route" aria-labelledby="path-route-title">
            <div className="section-heading-compact">
              <p className="eyebrow">De route</p>
              <h2 id="path-route-title">Kernlessen in volgorde</h2>
              <p>
                Alleen deze lessen vormen de voortgang van het pad. Links naar begrippen en andere
                kennisbankpagina&apos;s zijn naslag: nuttig, maar geen verplichte stap.
              </p>
            </div>
            <LearningPathStepList pathId={learningPath.id} lessons={progressLessons} />
          </section>
        </div>

        <aside className="learning-path-sidebar" aria-labelledby="path-start-title">
          <p className="eyebrow">Voor je begint</p>
          <h2 id="path-start-title">Voorkennis</h2>
          {learningPath.prerequisites.nl.length > 0 ? (
            <ul>
              {learningPath.prerequisites.nl.map((prerequisite) => (
                <li key={prerequisite}>{prerequisite}</li>
              ))}
            </ul>
          ) : (
            <p>Je hebt voor dit leerpad geen specifieke voorkennis nodig.</p>
          )}
          <p className="learning-path-reference-note">
            Je kunt iedere les ook zelfstandig openen. Naslagpagina&apos;s blijven altijd optioneel.
          </p>
          <Link className="text-link" href={learningPathCompletionHref(learningPath)}>
            Bekijk de afsluiting
          </Link>
        </aside>
      </div>
    </main>
  );
}
