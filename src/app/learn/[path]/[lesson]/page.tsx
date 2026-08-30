import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLink } from "@/components/entity-link";
import { getEntityById, getNarratives } from "@/content/repository";
import { NARRATIVE_ROUTE_SEGMENTS, narrativeHref } from "@/content/routing";
import type { Entity, Narrative, NarrativeMention } from "@/content/model";

type GeneratedNarrative = Narrative & { mentions: NarrativeMention[] };

interface NarrativePageProps {
  params: Promise<{ path: string; lesson: string }>;
}

function findNarrative(path: string, lesson: string): GeneratedNarrative | undefined {
  return getNarratives().find(
    (narrative) =>
      NARRATIVE_ROUTE_SEGMENTS[narrative.type] === path &&
      narrative.slugs.nl === lesson,
  );
}

export function generateStaticParams() {
  return getNarratives().map((narrative) => ({
    path: NARRATIVE_ROUTE_SEGMENTS[narrative.type],
    lesson: narrative.slugs.nl,
  }));
}

export async function generateMetadata({ params }: NarrativePageProps): Promise<Metadata> {
  const { path, lesson } = await params;
  const narrative = findNarrative(path, lesson);
  if (!narrative) return {};
  const canonical = narrativeHref(narrative);
  return {
    title: narrative.title.nl,
    description: `Lees ${narrative.title.nl} als onderdeel van de leeromgeving van Oenocademy.`,
    alternates: { canonical },
    robots: narrative.status === "active" ? undefined : { index: false, follow: true },
  };
}

export default async function NarrativePage({ params }: NarrativePageProps) {
  const { path, lesson } = await params;
  const narrative = findNarrative(path, lesson);
  if (!narrative) notFound();

  const mentionedEntities = Array.from(
    new Set([
      ...(narrative.primary_entity ? [narrative.primary_entity] : []),
      ...narrative.related_entities,
      ...narrative.mentions.filter((mention) => mention.locale === "nl").map((mention) => mention.entity_id),
    ]),
  ).map(getEntityById).filter((entity): entity is Entity => Boolean(entity));

  return (
    <main id="main-content" className="page-shell lesson-page">
      <nav className="breadcrumbs" aria-label="Broodkruimelpad">
        <Link href="/learn">Leren</Link>
        <span aria-hidden="true">/</span>
        <span>{path.replaceAll("-", " ")}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{narrative.title.nl}</span>
      </nav>

      <header className="lesson-page-header">
        <p className="eyebrow">{narrative.type.replaceAll("-", " ")}</p>
        <h1>{narrative.title.nl}</h1>
        <div className="lesson-metadata">
          <span>Diepte: {narrative.depth ?? "nog niet toegekend"}</span>
          <span>Status: {narrative.status}</span>
        </div>
      </header>

      <div className="lesson-layout">
        <article className="lesson-body">
          {narrative.status === "active" ? (
            <p>De narrative-renderer wordt gekoppeld zodra beoordeelde content beschikbaar is.</p>
          ) : (
            <div className="empty-state">
              <p className="eyebrow">Technische fixture</p>
              <h2>Deze narrative is nog niet gepubliceerd.</h2>
              <p>
                De route bewijst canonical metadata, entitymentions en
                backlinks. De technische proefttekst wordt niet als volwaardige
                les gepresenteerd.
              </p>
            </div>
          )}

          <section className="media-slot" aria-labelledby="lesson-media-title">
            <p className="eyebrow">Educatieve media</p>
            <h2 id="lesson-media-title">Illustraties krijgen een inhoudelijke rol</h2>
            <p>
              Een toekomstige narrative kan hier gecontroleerde illustraties,
              diagrammen, captions en gelokaliseerde alt-tekst plaatsen.
            </p>
          </section>
        </article>

        <aside className="lesson-context" aria-labelledby="lesson-context-title">
          <p className="eyebrow">In deze narrative</p>
          <h2 id="lesson-context-title">Verbonden kennis</h2>
          <div className="entity-link-list">
            {mentionedEntities.map((entity) => <EntityLink entity={entity} key={entity.id} />)}
          </div>
          <p className="quiet-note">
            Entitylinks openen altijd de context-onafhankelijke canonical pagina.
          </p>
        </aside>
      </div>
    </main>
  );
}
