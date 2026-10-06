import { ContentDocumentView } from "@/components/content-document";
import { EntityLink } from "@/components/entity-link";
import {
  LearningPathContext,
  type LearningPathContextOption,
} from "@/components/learning-path-context";
import { getLearningPathLessonPosition } from "@/content/learning";
import { mediaIdsForDocument } from "@/content/media";
import type { GeneratedEntity, GeneratedNarrative, Locale } from "@/content/model";
import {
  getAllNarratives,
  getEntityById,
  getMediaByIds,
  getNarrativeById,
  getNarrativeByRoute,
  getPublishedLearningPathsForLesson,
  getSourcesByIds,
} from "@/content/repository";
import {
  contentLabels,
  learningPathCompletionHref,
  learningPathHref,
  learningPathLessonHref,
  NARRATIVE_ROUTE_SEGMENTS,
  narrativeHref,
} from "@/content/routing";
import { languageAlternates, localizedHref, withRouteQuery, type RouteQuery } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

// The shared header must receive request query data before any HTML is streamed.
export const dynamic = "force-dynamic";

interface NarrativePageProps {
  searchParams?: Promise<RouteQuery>;
  params: Promise<{ lang: string; narrativeType: string; slug: string }>;
}

function publicNarrativeTitle(narrative: GeneratedNarrative, locale: Locale): string {
  if (narrative.status === "active") return narrative.title[locale];
  const primaryEntity = narrative.primary_entity
    ? getEntityById(narrative.primary_entity)
    : undefined;
  return primaryEntity
    ? locale === "nl"
      ? `${primaryEntity.names[locale]}: verdieping in voorbereiding`
      : `${primaryEntity.names[locale]}: deep dive in preparation`
    : locale === "nl"
      ? "Verdieping in voorbereiding"
      : "Deep dive in preparation";
}

function learningPathContextOptionsForLesson(
  lesson: GeneratedNarrative,
  locale: Locale,
): LearningPathContextOption[] {
  if (lesson.type !== "lesson" || lesson.status !== "active") return [];

  return getPublishedLearningPathsForLesson(lesson.id).flatMap((learningPath) => {
    const lessonPosition = getLearningPathLessonPosition(learningPath, lesson.id);
    if (!lessonPosition) return [];

    const previousLesson = lessonPosition.previousTarget
      ? getNarrativeById(lessonPosition.previousTarget)
      : undefined;
    const nextLesson = lessonPosition.nextTarget
      ? getNarrativeById(lessonPosition.nextTarget)
      : undefined;

    if (
      (lessonPosition.previousTarget && (!previousLesson || previousLesson.status !== "active")) ||
      (lessonPosition.nextTarget && (!nextLesson || nextLesson.status !== "active"))
    ) {
      return [];
    }

    return [
      {
        pathId: learningPath.id,
        pathSlug: learningPath.slugs.en,
        pathTitle: learningPath.title[locale],
        pathHref: learningPathHref(learningPath, locale),
        stepId: learningPath.steps[lessonPosition.position - 1].id,
        stepIds: learningPath.steps.map((step) => step.id),
        position: lessonPosition.position,
        total: lessonPosition.total,
        previous: previousLesson
          ? {
              title: previousLesson.title[locale],
              href: learningPathLessonHref(learningPath, previousLesson, locale),
            }
          : undefined,
        next: nextLesson
          ? {
              title: nextLesson.title[locale],
              href: learningPathLessonHref(learningPath, nextLesson, locale),
              kind: "lesson" as const,
            }
          : {
              title: locale === "nl" ? "Bekijk wat je nu kunt" : "See what you have learned",
              href: learningPathCompletionHref(learningPath, locale),
              kind: "completion" as const,
            },
      },
    ];
  });
}

export function generateStaticParams() {
  return getAllNarratives().flatMap((narrative) =>
    Array.from(new Set([narrative.slugs.en, narrative.slugs.nl])).map((slug) => ({
      narrativeType: NARRATIVE_ROUTE_SEGMENTS[narrative.type],
      slug,
    })),
  );
}

export async function generateMetadata({ params }: NarrativePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  const { narrativeType, slug } = await params;
  const narrative = getNarrativeByRoute(narrativeType, slug);
  if (!narrative) return {};
  const title = publicNarrativeTitle(narrative, locale);

  return {
    title,
    description:
      narrative.status === "active"
        ? locale === "nl"
          ? `Lees ${title} als verdieping bij de kennisbank van Oenocademy.`
          : `Read ${title} for a deeper look at the Oenocademy knowledge base.`
        : locale === "nl"
          ? "Deze verdieping wordt voorbereid voor de kennisbank van Oenocademy."
          : "This deep dive is being prepared for the Oenocademy knowledge base.",
    alternates:
      narrative.status === "active"
        ? languageAlternates(narrativeHref(narrative, locale), locale)
        : { canonical: narrativeHref(narrative, locale) },
    robots: narrative.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function NarrativePage({ params, searchParams }: NarrativePageProps) {
  await searchParams;
  const locale = await pageLocale(params);
  const { narrativeType, slug } = await params;
  const narrative = getNarrativeByRoute(narrativeType, slug);
  if (!narrative) notFound();
  if (slug !== narrative.slugs.en)
    permanentRedirect(withRouteQuery(narrativeHref(narrative, locale), (await searchParams) ?? {}));

  const mentionedEntities = Array.from(
    new Set([
      ...(narrative.primary_entity ? [narrative.primary_entity] : []),
      ...narrative.related_entities,
      ...narrative.mentions
        .filter((mention) => mention.locale === locale)
        .map((mention) => mention.entity_id),
    ]),
  )
    .map(getEntityById)
    .filter((entity): entity is GeneratedEntity => Boolean(entity));
  const title = publicNarrativeTitle(narrative, locale);
  const sources = getSourcesByIds(narrative.source_refs);
  const media = getMediaByIds(mediaIdsForDocument(narrative.content[locale]));
  const learningPathContexts = learningPathContextOptionsForLesson(narrative, locale);

  return (
    <main id="main-content" className="page-shell lesson-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Broodkruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/verdiepingen", locale)}>
          {locale === "nl" ? "Verdiepingen" : "Deep dives"}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{contentLabels(locale).narrative[narrative.type]}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      {learningPathContexts.length > 0 ? (
        <>
          <LearningPathContext options={learningPathContexts} placement="header" />
        </>
      ) : null}

      <header className="lesson-page-header">
        <p className="eyebrow">{contentLabels(locale).narrative[narrative.type]}</p>
        <h1>{title}</h1>
        {narrative.depth ? (
          <div className="lesson-metadata">
            <span>
              {locale === "nl" ? "Kennisniveau:" : "Knowledge level:"}{" "}
              {contentLabels(locale).depth[narrative.depth]}
            </span>
          </div>
        ) : null}
      </header>

      <div className="lesson-layout">
        <article className="lesson-body">
          {narrative.status === "active" ? (
            <>
              <ContentDocumentView
                document={narrative.content[locale]}
                locale={locale}
                media={media}
                sources={sources}
              />
              {learningPathContexts.length > 0 ? (
                <>
                  <LearningPathContext options={learningPathContexts} placement="footer" />
                </>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              <p className="eyebrow">{locale === "nl" ? "In voorbereiding" : "In preparation"}</p>
              <h2>
                {locale === "nl"
                  ? "Deze verdieping wordt zorgvuldig opgebouwd."
                  : "This deep dive is being carefully prepared."}
              </h2>
              <p>
                {locale === "nl"
                  ? "Zodra de inhoud en bronnen zijn beoordeeld, verschijnt de volledige verdieping hier. Verken intussen de kennisbank via Ontdekken."
                  : "The full deep dive will appear here once its content and sources have been reviewed. In the meantime, browse the knowledge base through Explore."}{" "}
              </p>
              <Link className="text-link" href={localizedHref("/explore", locale)}>
                {locale === "nl" ? "Ga naar Ontdekken →" : "Go to Explore →"}{" "}
              </Link>
            </div>
          )}
        </article>

        {mentionedEntities.length > 0 || sources.length > 0 ? (
          <aside className="lesson-context" aria-labelledby="lesson-context-title">
            {mentionedEntities.length > 0 ? (
              <>
                <p className="eyebrow">
                  {locale === "nl" ? "In deze verdieping" : "In this deep dive"}
                </p>
                <h2 id="lesson-context-title">
                  {locale === "nl" ? "Verbonden onderwerpen" : "Connected topics"}
                </h2>
                <div className="entity-link-list">
                  {mentionedEntities.map((entity) => (
                    <EntityLink locale={locale} entity={entity} key={entity.id} />
                  ))}
                </div>
              </>
            ) : (
              <h2 id="lesson-context-title">{locale === "nl" ? "Bronnen" : "Sources"}</h2>
            )}
            {sources.length > 0 ? (
              <div className="content-source-list">
                {mentionedEntities.length > 0 ? (
                  <h3>{locale === "nl" ? "Bronnen" : "Sources"}</h3>
                ) : null}
                <ol>
                  {sources.map((source, index) => (
                    <li id={`source-${index + 1}`} key={source.id}>
                      {source.url ? (
                        <a href={source.url} rel="noreferrer" target="_blank">
                          {source.title}
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                      <small>{source.publisher}</small>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
