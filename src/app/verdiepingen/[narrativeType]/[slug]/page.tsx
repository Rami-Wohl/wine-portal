import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentDocumentView } from "@/components/content-document";
import { EntityLink } from "@/components/entity-link";
import { mediaIdsForDocument } from "@/content/media";
import type { GeneratedEntity, GeneratedNarrative } from "@/content/model";
import {
  getAllNarratives,
  getEntityById,
  getMediaByIds,
  getNarrativeByRoute,
  getSourcesByIds,
} from "@/content/repository";
import {
  DEPTH_LABELS_NL,
  NARRATIVE_ROUTE_SEGMENTS,
  NARRATIVE_TYPE_LABELS_NL,
  narrativeHref,
} from "@/content/routing";

interface NarrativePageProps {
  params: Promise<{ narrativeType: string; slug: string }>;
}

function publicNarrativeTitle(narrative: GeneratedNarrative): string {
  if (narrative.status === "active") return narrative.title.nl;
  const primaryEntity = narrative.primary_entity
    ? getEntityById(narrative.primary_entity)
    : undefined;
  return primaryEntity
    ? `${primaryEntity.names.nl}: verdieping in voorbereiding`
    : "Verdieping in voorbereiding";
}

export function generateStaticParams() {
  return getAllNarratives().map((narrative) => ({
    narrativeType: NARRATIVE_ROUTE_SEGMENTS[narrative.type],
    slug: narrative.slugs.nl,
  }));
}

export async function generateMetadata({ params }: NarrativePageProps): Promise<Metadata> {
  const { narrativeType, slug } = await params;
  const narrative = getNarrativeByRoute(narrativeType, slug);
  if (!narrative) return {};
  const title = publicNarrativeTitle(narrative);

  return {
    title,
    description:
      narrative.status === "active"
        ? `Lees ${title} als verdieping bij de kennisbank van Oenocademy.`
        : "Deze verdieping wordt voorbereid voor de kennisbank van Oenocademy.",
    alternates: { canonical: narrativeHref(narrative) },
    robots: narrative.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function NarrativePage({ params }: NarrativePageProps) {
  const { narrativeType, slug } = await params;
  const narrative = getNarrativeByRoute(narrativeType, slug);
  if (!narrative) notFound();

  const mentionedEntities = Array.from(
    new Set([
      ...(narrative.primary_entity ? [narrative.primary_entity] : []),
      ...narrative.related_entities,
      ...narrative.mentions
        .filter((mention) => mention.locale === "nl")
        .map((mention) => mention.entity_id),
    ]),
  )
    .map(getEntityById)
    .filter((entity): entity is GeneratedEntity => Boolean(entity));
  const title = publicNarrativeTitle(narrative);
  const sources = getSourcesByIds(narrative.source_refs);
  const media = getMediaByIds(mediaIdsForDocument(narrative.content.nl));

  return (
    <main id="main-content" className="page-shell lesson-page">
      <nav className="breadcrumbs" aria-label="Broodkruimelpad">
        <Link href="/verdiepingen">Verdiepingen</Link>
        <span aria-hidden="true">/</span>
        <span>{NARRATIVE_TYPE_LABELS_NL[narrative.type]}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header className="lesson-page-header">
        <p className="eyebrow">{NARRATIVE_TYPE_LABELS_NL[narrative.type]}</p>
        <h1>{title}</h1>
        {narrative.depth ? (
          <div className="lesson-metadata">
            <span>Kennisniveau: {DEPTH_LABELS_NL[narrative.depth]}</span>
          </div>
        ) : null}
      </header>

      <div className="lesson-layout">
        <article className="lesson-body">
          {narrative.status === "active" ? (
            <ContentDocumentView
              document={narrative.content.nl}
              locale="nl"
              media={media}
              sources={sources}
            />
          ) : (
            <div className="empty-state">
              <p className="eyebrow">In voorbereiding</p>
              <h2>Deze verdieping wordt zorgvuldig opgebouwd.</h2>
              <p>
                Zodra de inhoud en bronnen zijn beoordeeld, verschijnt de volledige verdieping hier.
                Verken intussen de kennisbank via Ontdekken.
              </p>
              <Link className="text-link" href="/explore">
                Ga naar Ontdekken →
              </Link>
            </div>
          )}
        </article>

        {mentionedEntities.length > 0 || sources.length > 0 ? (
          <aside className="lesson-context" aria-labelledby="lesson-context-title">
            {mentionedEntities.length > 0 ? (
              <>
                <p className="eyebrow">In deze verdieping</p>
                <h2 id="lesson-context-title">Verbonden onderwerpen</h2>
                <div className="entity-link-list">
                  {mentionedEntities.map((entity) => (
                    <EntityLink entity={entity} key={entity.id} />
                  ))}
                </div>
              </>
            ) : (
              <h2 id="lesson-context-title">Bronnen</h2>
            )}
            {sources.length > 0 ? (
              <div className="content-source-list">
                {mentionedEntities.length > 0 ? <h3>Bronnen</h3> : null}
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
