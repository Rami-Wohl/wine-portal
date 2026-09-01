import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLink } from "@/components/entity-link";
import { ContentDocumentView } from "@/components/content-document";
import { KnowledgeDepth } from "@/components/knowledge-depth";
import { DEPTHS, type Depth, type Entity, type GeneratedEntity } from "@/content/model";
import { mediaIdsForDocument } from "@/content/media";
import { relationLabel, type RelationDirection } from "@/content/relations";
import {
  getEntities,
  getEntityById,
  getEntityByRoute,
  getMediaByIds,
  getNarrativeBacklinks,
  getRelationsForEntity,
  getSourcesByIds,
} from "@/content/repository";
import {
  ENTITY_ROUTE_SEGMENTS,
  ENTITY_TYPE_LABELS_NL,
  entityHref,
  narrativeHref,
} from "@/content/routing";

interface EntityPageProps {
  params: Promise<{ entityType: string; slug: string }>;
}

function highestDocumentDepth(entity: GeneratedEntity): Depth | null {
  const depths = entity.content.nl.blocks
    .map((block) => block.depth ?? entity.depth)
    .filter((depth): depth is Depth => Boolean(depth));

  return depths.reduce<Depth | null>((highest, depth) => {
    if (!highest) return depth;
    return DEPTHS.indexOf(depth) > DEPTHS.indexOf(highest) ? depth : highest;
  }, null);
}

export function generateStaticParams() {
  return getEntities().map((entity) => ({
    entityType: ENTITY_ROUTE_SEGMENTS[entity.type],
    slug: entity.slugs.nl,
  }));
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { entityType, slug } = await params;
  const entity = getEntityByRoute(entityType, slug);
  if (!entity) return {};
  const canonical = entityHref(entity);

  return {
    title: `${entity.names.nl}: ${ENTITY_TYPE_LABELS_NL[entity.type].toLocaleLowerCase("nl")}`,
    description:
      entity.status === "active"
        ? `Ontdek ${entity.names.nl} en de verbonden onderwerpen in de kennisbank van Oenocademy.`
        : `De pagina over ${entity.names.nl} wordt voorbereid voor de kennisbank van Oenocademy.`,
    alternates: { canonical },
    robots: entity.status === "active" ? undefined : { index: false, follow: true },
    openGraph: {
      title: entity.names.nl,
      description: `${ENTITY_TYPE_LABELS_NL[entity.type]} in de kennisbank van Oenocademy.`,
      url: canonical,
    },
  };
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { entityType, slug } = await params;
  const entity = getEntityByRoute(entityType, slug);
  if (!entity) notFound();

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
  const relatedNarratives = getNarrativeBacklinks(entity.id).filter(
    (narrative) => narrative.status === "active",
  );
  const sources = getSourcesByIds(
    Array.from(
      new Set([
        ...entity.source_refs,
        ...entity.assertions.flatMap((assertion) => assertion.sources),
      ]),
    ),
  );
  const media = getMediaByIds(mediaIdsForDocument(entity.content.nl));
  const maxContentDepth = highestDocumentDepth(entity);
  const hasRelatedKnowledge = relations.length > 0 || relatedNarratives.length > 0;
  const hasSupportingInformation = hasRelatedKnowledge || sources.length > 0;

  return (
    <main id="main-content" className="page-shell entity-page">
      <nav className="breadcrumbs" aria-label="Broodkruimelpad">
        <Link href="/explore">Ontdekken</Link>
        <span aria-hidden="true">/</span>
        {parent ? (
          <>
            <Link href={entityHref(parent)}>{parent.names.nl}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span aria-current="page">{entity.names.nl}</span>
      </nav>

      <header className="entity-header entity-header-compact">
        <div>
          <p className="eyebrow">{ENTITY_TYPE_LABELS_NL[entity.type]}</p>
          <h1>{entity.names.nl}</h1>
          {entity.status !== "active" ? (
            <p className="entity-summary">De inhoud van deze pagina wordt zorgvuldig voorbereid.</p>
          ) : null}
        </div>
      </header>

      {entity.status === "active" && entity.content.nl.blocks.length > 0 ? (
        entity.depth && maxContentDepth ? (
          <KnowledgeDepth initialDepth={entity.depth} maxDepth={maxContentDepth}>
            <article className="entity-body">
              <ContentDocumentView
                document={entity.content.nl}
                locale="nl"
                media={media}
                sources={sources}
              />
            </article>
          </KnowledgeDepth>
        ) : (
          <article className="entity-body">
            <ContentDocumentView
              document={entity.content.nl}
              locale="nl"
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
              <p className="eyebrow">Gerelateerde onderwerpen</p>
              <h2 id="relations-title">Ga verder vanuit {entity.names.nl}</h2>
              {relations.length > 0 ? (
                <ul>
                  {relations.map(({ direction, related, relation }) => (
                    <li key={`${relation.source}-${relation.type}-${relation.target}`}>
                      <span>{relationLabel(relation.type, direction, "nl")}</span>
                      <EntityLink entity={related} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {relatedNarratives.length > 0 ? (
                <div className="related-learning">
                  <h3>Verder leren</h3>
                  {relatedNarratives.map((narrative) => (
                    <Link href={narrativeHref(narrative)} key={narrative.id}>
                      {narrative.title.nl}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
          {sources.length > 0 ? (
            <section className="sources-panel" aria-labelledby="sources-title">
              <p className="eyebrow">Bronnen</p>
              <h2 id="sources-title">Verder lezen</h2>
              <ul>
                {sources.map((source) => (
                  <li key={source.id}>
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
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
