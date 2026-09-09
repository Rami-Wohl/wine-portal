import type { Metadata } from "next";
import Link from "next/link";
import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getPublishedEntitiesByType } from "@/content/repository";
import type { EntityType } from "@/content/model";

export const metadata: Metadata = {
  title: "Wijnkennis ontdekken",
  description:
    "Ontdek wijnregio's, appellaties, producenten, druiven, jaargangen en wijnconcepten via een verbonden kennisbank.",
  alternates: { canonical: "/explore" },
};

const categories: Array<{
  type: EntityType;
  title: string;
  description: string;
}> = [
  {
    type: "region",
    title: "Regio's",
    description: "Wijngebieden als geografische en culturele context.",
  },
  {
    type: "appellation",
    title: "Appellaties",
    description: "Beschermde herkomsten en hun plaats in het grotere geheel.",
  },
  {
    type: "site",
    title: "Wijngaardsites",
    description: "Afgebakende wijngaarden en lieux-dits binnen hun geografische context.",
  },
  {
    type: "producer",
    title: "Producenten",
    description: "Châteaux, domeinen, estates en andere producenten.",
  },
  {
    type: "grape",
    title: "Druiven",
    description: "Druivenrassen, synoniemen en relevante relaties.",
  },
  {
    type: "vintage",
    title: "Jaargangen",
    description: "Jaargangen binnen een expliciete regionale scope.",
  },
  {
    type: "classification",
    title: "Classificaties",
    description: "Classificatiesystemen met duidelijke geldigheid en bronvermelding.",
  },
  {
    type: "concept",
    title: "Concepten",
    description: "Wijnbouw, vinificatie, geologie, chemie en sensoriek.",
  },
];

const CATEGORY_PREVIEW_LIMIT = 5;

export default function ExplorePage() {
  const categoryGroups = categories.map((category) => {
    const available = getPublishedEntitiesByType(category.type).toSorted((left, right) =>
      left.names.nl.localeCompare(right.names.nl, "nl", { sensitivity: "base" }),
    );
    return { ...category, available, preview: available.slice(0, CATEGORY_PREVIEW_LIMIT) };
  });

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Ontdekken" title="Waar ben je nieuwsgierig naar?">
        <p>
          Verken onderwerpen en ontdek hoe regio&apos;s, producenten, druiven en wijnbegrippen met
          elkaar samenhangen.
        </p>
      </PageIntro>

      <form className="discovery-search" action="/search" role="search">
        <label htmlFor="explore-query">Zoek in de kennisbank</label>
        <div className="search-field">
          <input
            id="explore-query"
            name="q"
            type="search"
            placeholder="Zoek een regio, producent, druif of onderwerp…"
          />
          <button type="submit">Zoeken</button>
        </div>
      </form>

      <section className="category-list" aria-labelledby="categories-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Kennisgebieden</p>
          <h2 id="categories-title">Kies je ingang</h2>
          <p>
            Iedere categorie toont een kleine voorproef. Open de categorie om de volledige,
            doorzoekbare verzameling te bekijken.
          </p>
        </div>
        <div className="category-grid">
          {categoryGroups.map((category) => {
            const categoryHref = `/search?type=${category.type}`;
            const remaining = category.available.length - category.preview.length;
            return (
              <article className="category-card" key={category.type}>
                <div className="category-card-heading">
                  <div>
                    <p className="category-count">
                      {category.available.length}{" "}
                      {category.available.length === 1 ? "onderwerp" : "onderwerpen"}
                    </p>
                    <h3>{category.title}</h3>
                  </div>
                  {category.available.length > 0 ? (
                    <Link
                      className="category-arrow-link"
                      href={categoryHref}
                      aria-label={`Bekijk alle onderwerpen in ${category.title}`}
                    >
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
                <p>{category.description}</p>
                <div className="category-preview">
                  {category.preview.length > 0 ? (
                    category.preview.map((entity) => <EntityLink entity={entity} key={entity.id} />)
                  ) : (
                    <span className="empty-inline">Binnenkort beschikbaar</span>
                  )}
                </div>
                {category.available.length > 0 ? (
                  <Link className="category-browse-link" href={categoryHref}>
                    Bekijk {category.available.length === 1 ? "het onderwerp" : "alle onderwerpen"}
                    {remaining > 0 ? ` · nog ${remaining}` : ""}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span className="category-browse-link category-browse-link-disabled">
                    Nog geen gepubliceerde onderwerpen
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <p className="quiet-note">
        Liever een onderwerp in volgorde bestuderen? Ga naar <Link href="/learn">Leren</Link>.
      </p>
    </main>
  );
}
