import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLink } from "@/components/entity-link";
import {
  getEntities,
  getEntityById,
  getNarrativeBacklinks,
  getRelationsForEntity,
} from "@/content/repository";
import {
  ENTITY_ROUTE_SEGMENTS,
  ENTITY_TYPE_LABELS_NL,
  entityHref,
  entityTypeFromRouteSegment,
  narrativeHref,
} from "@/content/routing";
import type { Entity } from "@/content/model";

interface EntityPageProps {
  params: Promise<{ entityType: string; slug: string }>;
}

const relationLabels: Record<string, string> = {
  part_of: "Onderdeel van",
  contains: "Bevat",
  located_in: "Gelegen in",
  produces_in: "Produceert in",
  associated_with: "Gerelateerd aan",
  important_grape: "Belangrijke druif",
  parent_appellation: "Bovenliggende appellatie",
  classified_under: "Geclassificeerd onder",
  related_to: "Gerelateerd aan",
  contrasts_with: "Te vergelijken met",
  scope: "Geografische scope",
};

function findEntity(entityType: string, slug: string): Entity | undefined {
  const type = entityTypeFromRouteSegment(entityType);
  if (!type) return undefined;
  return getEntities().find(
    (entity) => entity.type === type && entity.slugs.nl === slug,
  );
}

export function generateStaticParams() {
  return getEntities().map((entity) => ({
    entityType: ENTITY_ROUTE_SEGMENTS[entity.type],
    slug: entity.slugs.nl,
  }));
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { entityType, slug } = await params;
  const entity = findEntity(entityType, slug);
  if (!entity) return {};
  const canonical = entityHref(entity);
  return {
    title: `${entity.names.nl}: ${ENTITY_TYPE_LABELS_NL[entity.type].toLocaleLowerCase("nl")}`,
    description:
      entity.status === "active"
        ? `Ontdek ${entity.names.nl} en de relaties binnen de verbonden wijnkennis van Oenocademy.`
        : `${entity.names.nl} is als ${ENTITY_TYPE_LABELS_NL[entity.type].toLocaleLowerCase("nl")} geregistreerd in de kennisbank van Oenocademy.`,
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
  const entity = findEntity(entityType, slug);
  if (!entity) notFound();

  const relations = getRelationsForEntity(entity.id).map((relation) => {
    const isForward = relation.source === entity.id;
    return {
      relation,
      direction: isForward ? "forward" : "inverse",
      related: getEntityById(isForward ? relation.target : relation.source),
    };
  }).filter((item): item is typeof item & { related: Entity } => Boolean(item.related));
  const parent = relations.find(
    ({ direction, relation }) =>
      direction === "forward" && ["part_of", "located_in", "parent_appellation"].includes(relation.type),
  )?.related;
  const relatedNarratives = getNarrativeBacklinks(entity.id).filter(
    (narrative) => narrative.status === "active",
  );

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

      <header className="entity-header">
        <div>
          <p className="eyebrow">{ENTITY_TYPE_LABELS_NL[entity.type]}</p>
          <h1>{entity.names.nl}</h1>
          <p className="entity-summary">
            {entity.status === "active"
              ? "Canonical kenniscontent voor deze entiteit."
              : "Deze canonical entity is geregistreerd; inhoudelijke redactie en broncontrole volgen nog."}
          </p>
        </div>
        <aside className="depth-control" aria-label="Kennisdiepte">
          <span>Kennisdiepte</span>
          <strong>{entity.depth ?? "Nog niet toegekend"}</strong>
          <p>Dezelfde pagina zal later secties progressief kunnen tonen.</p>
        </aside>
      </header>

      <div className="entity-layout">
        <article className="entity-content">
          <section aria-labelledby="overview-title">
            <p className="eyebrow">Overzicht</p>
            <h2 id="overview-title">Canonical content in voorbereiding</h2>
            <p>
              De huidige fixture bewijst identiteit, routing en relaties. Er
              wordt geen wijninhoud toegevoegd voordat tekst en bronnen zijn
              beoordeeld.
            </p>
          </section>
          <section className="media-slot" aria-labelledby="media-title">
            <p className="eyebrow">Media</p>
            <h2 id="media-title">Ruimte voor inhoudelijke media</h2>
            <p>
              Toekomstige illustraties, diagrammen en captions horen bij een
              gecontroleerde entity of sectie. Geografie komt uitsluitend uit
              geverifieerde data.
            </p>
          </section>
          <section aria-labelledby="sources-title">
            <p className="eyebrow">Bronnen</p>
            <h2 id="sources-title">Provenance</h2>
            <p>
              {entity.source_refs.length > 0
                ? `${entity.source_refs.length} bronreferentie(s) geregistreerd.`
                : "Voor deze technische fixture zijn nog geen bronrecords geregistreerd."}
            </p>
          </section>
        </article>

        <aside className="relations-panel" aria-labelledby="relations-title">
          <p className="eyebrow">Kennisrelaties</p>
          <h2 id="relations-title">Ga verder vanuit {entity.names.nl}</h2>
          {relations.length > 0 ? (
            <ul>
              {relations.map(({ direction, related, relation }) => (
                <li key={`${relation.source}-${relation.type}-${relation.target}`}>
                  <span>
                    {direction === "forward" ? relationLabels[relation.type] : `Via ${relationLabels[relation.type].toLocaleLowerCase("nl")}`}
                  </span>
                  <EntityLink entity={related} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">Nog geen relaties geregistreerd.</p>
          )}
          <div className="related-learning">
            <h3>Gerelateerde leercontent</h3>
            {relatedNarratives.length > 0 ? relatedNarratives.map((narrative) => (
              <Link href={narrativeHref(narrative)} key={narrative.id}>{narrative.title.nl}</Link>
            )) : <p>Er is nog geen beoordeelde leercontent gekoppeld.</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
