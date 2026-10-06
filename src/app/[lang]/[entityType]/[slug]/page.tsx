import { ContentDocumentView } from "@/components/content-document";
import { EntityLink } from "@/components/entity-link";
import { KnowledgeDepth } from "@/components/knowledge-depth";
import { mediaIdsForDocument } from "@/content/media";
import type { Locale } from "@/content/model";
import { DEPTHS, type Depth, type Entity, type GeneratedEntity } from "@/content/model";
import { clusterRelations, type RelationDirection } from "@/content/relations";
import {
  getAllEntities,
  getEntityById,
  getEntityByRoute,
  getEntityPublicHref,
  getMediaByIds,
  getPublishedLearningPathsForLesson,
  getPublishedNarrativeBacklinks,
  getRelationsForEntity,
  getSourcesByIds,
} from "@/content/repository";
import {
  contentLabels,
  ENTITY_ROUTE_SEGMENTS,
  learningPathLessonHref,
  narrativeHref,
} from "@/content/routing";
import { languageAlternates, localizedHref, withRouteQuery, type RouteQuery } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

interface EntityPageProps {
  searchParams?: Promise<RouteQuery>;
  params: Promise<{ lang: string; entityType: string; slug: string }>;
}

function highestDocumentDepth(entity: GeneratedEntity, locale: Locale): Depth | null {
  const depths = entity.content[locale].blocks
    .map((block) => block.depth ?? entity.depth)
    .filter((depth): depth is Depth => Boolean(depth));

  return depths.reduce<Depth | null>((highest, depth) => {
    if (!highest) return depth;
    return DEPTHS.indexOf(depth) > DEPTHS.indexOf(highest) ? depth : highest;
  }, null);
}

function narrativeLearningHref(
  narrative: ReturnType<typeof getPublishedNarrativeBacklinks>[number],
  locale: Locale,
) {
  if (narrative.type !== "lesson") return narrativeHref(narrative, locale);
  const learningPaths = getPublishedLearningPathsForLesson(narrative.id);
  return learningPaths.length === 1
    ? learningPathLessonHref(learningPaths[0], narrative, locale)
    : narrativeHref(narrative, locale);
}

export function generateStaticParams() {
  return getAllEntities().flatMap((entity) =>
    Array.from(new Set([entity.slugs.en, entity.slugs.nl])).map((slug) => ({
      entityType: ENTITY_ROUTE_SEGMENTS[entity.type],
      slug,
    })),
  );
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  const { entityType, slug } = await params;
  const entity = getEntityByRoute(entityType, slug);
  if (!entity) return {};
  const canonical = getEntityPublicHref(entity, locale);

  return {
    title: `${entity.names[locale]}: ${contentLabels(locale).entity[entity.type].toLocaleLowerCase(locale)}`,
    description:
      entity.status === "active"
        ? locale === "nl"
          ? `Ontdek ${entity.names[locale]} en de verbonden onderwerpen in de kennisbank van Oenocademy.`
          : `Discover ${entity.names[locale]} and connected topics in the Oenocademy knowledge base.`
        : locale === "nl"
          ? `De pagina over ${entity.names[locale]} wordt voorbereid voor de kennisbank van Oenocademy.`
          : `The page about ${entity.names[locale]} is being prepared for the Oenocademy knowledge base.`,
    alternates: entity.status === "active" ? languageAlternates(canonical, locale) : { canonical },
    robots: entity.status === "active" ? undefined : { index: false, follow: true },
    openGraph: {
      locale: locale === "nl" ? "nl_NL" : "en_US",
      title: entity.names[locale],
      description:
        locale === "nl"
          ? `${contentLabels(locale).entity[entity.type]} in de kennisbank van Oenocademy.`
          : `${contentLabels(locale).entity[entity.type]} in the Oenocademy knowledge base.`,
      url: canonical,
    },
  };
}

export default async function EntityPage({ params, searchParams }: EntityPageProps) {
  const locale = await pageLocale(params);
  const { entityType, slug } = await params;
  const entity = getEntityByRoute(entityType, slug);
  if (!entity) notFound();
  if (slug !== entity.slugs.en)
    permanentRedirect(
      withRouteQuery(getEntityPublicHref(entity, locale), (await searchParams) ?? {}),
    );
  if (
    entity.status === "active" &&
    entity.presentation &&
    entity.presentation.mode !== "monograph"
  ) {
    permanentRedirect(
      withRouteQuery(getEntityPublicHref(entity, locale), (await searchParams) ?? {}),
    );
  }

  const relations = getRelationsForEntity(entity.id)
    .map((relation) => {
      const isForward = relation.source === entity.id;
      return {
        relation,
        direction: (isForward ? "forward" : "inverse") as RelationDirection,
        related: getEntityById(isForward ? relation.target : relation.source),
      };
    })
    .filter((item): item is typeof item & { related: Entity } => Boolean(item.related));
  const parent = relations.find(
    ({ direction, relation }) =>
      direction === "forward" &&
      ["part_of", "located_in", "parent_appellation"].includes(relation.type),
  )?.related;
  const relationClusters = clusterRelations(relations, locale).map((cluster) => ({
    ...cluster,
    groups: cluster.groups.map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) =>
        left.related.names[locale].localeCompare(right.related.names[locale], locale),
      ),
    })),
  }));
  const relatedNarratives = getPublishedNarrativeBacklinks(entity.id);
  const sources = getSourcesByIds(
    Array.from(
      new Set([
        ...entity.source_refs,
        ...entity.assertions.flatMap((assertion) => assertion.sources),
      ]),
    ),
  );
  const media = getMediaByIds(mediaIdsForDocument(entity.content[locale]));
  const maxContentDepth = highestDocumentDepth(entity, locale);
  const hasRelatedKnowledge = relations.length > 0 || relatedNarratives.length > 0;
  const hasSupportingInformation = hasRelatedKnowledge || sources.length > 0;

  return (
    <main id="main-content" className="page-shell entity-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Broodkruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/explore", locale)}>
          {locale === "nl" ? "Ontdekken" : "Explore"}
        </Link>
        <span aria-hidden="true">/</span>
        {parent ? (
          <>
            <Link href={getEntityPublicHref(parent, locale)}>{parent.names[locale]}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span aria-current="page">{entity.names[locale]}</span>
      </nav>

      <header className="entity-header entity-header-compact">
        <div>
          <p className="eyebrow">{contentLabels(locale).entity[entity.type]}</p>
          <h1>{entity.names[locale]}</h1>
          {entity.status !== "active" ? (
            <p className="entity-summary">
              {locale === "nl"
                ? "De inhoud van deze pagina wordt zorgvuldig voorbereid."
                : "The content of this page is being carefully prepared."}
            </p>
          ) : null}
        </div>
      </header>

      {entity.status === "active" && entity.content[locale].blocks.length > 0 ? (
        entity.depth && maxContentDepth ? (
          <KnowledgeDepth initialDepth={entity.depth} maxDepth={maxContentDepth}>
            <article className="entity-body">
              <ContentDocumentView
                document={entity.content[locale]}
                locale={locale}
                media={media}
                sources={sources}
              />
            </article>
          </KnowledgeDepth>
        ) : (
          <article className="entity-body">
            <ContentDocumentView
              document={entity.content[locale]}
              locale={locale}
              media={media}
              sources={sources}
            />
          </article>
        )
      ) : null}

      {hasSupportingInformation ? (
        <div className="entity-support-layout">
          {hasRelatedKnowledge ? (
            <section className="relations-panel" aria-labelledby="relations-title">
              <p className="eyebrow">
                {locale === "nl" ? "Gerelateerde onderwerpen" : "Related topics"}
              </p>
              <h2 id="relations-title">
                {locale === "nl" ? "Ga verder vanuit" : "Continue from"} {entity.names[locale]}
              </h2>
              <p className="relations-intro">
                {locale === "nl"
                  ? "Open een cluster om verwante plaatsen, druiven, producenten en begrippen te verkennen."
                  : "Open a group to explore related places, grapes, producers and concepts."}{" "}
              </p>
              {relationClusters.length > 0 ? (
                <div className="relation-clusters">
                  {relationClusters.map((cluster) => (
                    <details
                      className="relation-cluster"
                      data-relation-cluster={cluster.id}
                      key={cluster.id}
                      open={cluster.itemCount <= 4}
                    >
                      <summary>
                        <span>{cluster.label}</span>
                        <span
                          className="relation-cluster-count"
                          aria-label={
                            locale === "nl"
                              ? `${cluster.itemCount} onderwerpen`
                              : `${cluster.itemCount} topics`
                          }
                        >
                          {cluster.itemCount}
                        </span>
                      </summary>
                      <div className="relation-cluster-body">
                        {cluster.groups.map((group, index) => {
                          const titleId = `relation-${cluster.id}-group-${index + 1}`;
                          return (
                            <div className="relation-group" key={group.label}>
                              <h3 id={titleId}>{group.label}</h3>
                              <ul aria-labelledby={titleId}>
                                {group.items.map(({ related, relation }) => (
                                  <li
                                    key={`${relation.source}-${relation.type}-${relation.target}`}
                                  >
                                    <EntityLink locale={locale} entity={related} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              ) : null}
              {relatedNarratives.length > 0 ? (
                <details
                  className="relation-cluster related-learning"
                  open={relatedNarratives.length <= 4}
                >
                  <summary>
                    <span>{locale === "nl" ? "Verder leren" : "Continue learning"}</span>
                    <span
                      className="relation-cluster-count"
                      aria-label={
                        locale === "nl"
                          ? `${relatedNarratives.length} verdiepingen`
                          : `${relatedNarratives.length} deep dives`
                      }
                    >
                      {relatedNarratives.length}
                    </span>
                  </summary>
                  <div className="relation-cluster-body related-learning-links">
                    {relatedNarratives.map((narrative) => (
                      <Link href={narrativeLearningHref(narrative, locale)} key={narrative.id}>
                        {narrative.title[locale]}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : null}
            </section>
          ) : null}
          {sources.length > 0 ? (
            <section className="sources-panel" aria-labelledby="sources-title">
              <p className="eyebrow">{locale === "nl" ? "Bronnen" : "Sources"}</p>
              <h2 id="sources-title">{locale === "nl" ? "Verder lezen" : "Further reading"}</h2>
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
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
