import type { Metadata } from "next";
import Link from "next/link";
import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getEntitiesByType } from "@/content/repository";
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
  { type: "region", title: "Regio's", description: "Wijngebieden als geografische en culturele context." },
  { type: "appellation", title: "Appellaties", description: "Beschermde herkomsten en hun plaats in het grotere geheel." },
  { type: "site", title: "Wijngaardsites", description: "Afgebakende wijngaarden en lieux-dits binnen hun geografische context." },
  { type: "producer", title: "Producenten", description: "Châteaux, domeinen, estates en andere producenten." },
  { type: "grape", title: "Druiven", description: "Druivenrassen, synoniemen en relevante relaties." },
  { type: "vintage", title: "Jaargangen", description: "Jaargangen binnen een expliciete regionale scope." },
  { type: "classification", title: "Classificaties", description: "Classificatiesystemen met duidelijke geldigheid en bronvermelding." },
  { type: "concept", title: "Concepten", description: "Wijnbouw, vinificatie, geologie, chemie en sensoriek." },
];

export default function ExplorePage() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Ontdekken" title="Waar ben je nieuwsgierig naar?">
        <p>
          Verken onderwerpen en ontdek hoe regio&apos;s, producenten, druiven en
          wijnbegrippen met elkaar samenhangen.
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
          <h2 id="categories-title">Begin bij een categorie</h2>
        </div>
        {categories.map((category) => {
          const available = getEntitiesByType(category.type);
          return (
            <article className="category-row" key={category.type}>
              <div className="category-heading">
                {available.length > 0 ? (
                  <Link className="category-title-link" href={`/search?type=${category.type}`}>
                    <h3>{category.title}</h3>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <h3>{category.title}</h3>
                )}
                <p>{category.description}</p>
                {available.length > 0 ? (
                  <span className="category-count">
                    {available.length} {available.length === 1 ? "onderwerp" : "onderwerpen"}
                  </span>
                ) : null}
              </div>
              <div className="entity-link-list">
                {available.length > 0 ? (
                  available.map((entity) => <EntityLink entity={entity} key={entity.id} />)
                ) : (
                  <span className="empty-inline">Binnenkort beschikbaar</span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className="quiet-note">
        Liever een onderwerp in volgorde bestuderen? Ga naar <Link href="/learn">Leren</Link>.
      </p>
    </main>
  );
}
