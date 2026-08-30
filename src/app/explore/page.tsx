import type { Metadata } from "next";
import Link from "next/link";
import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getEntities } from "@/content/repository";
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
  { type: "producer", title: "Producenten", description: "Châteaux, domeinen, estates en andere producenten." },
  { type: "grape", title: "Druiven", description: "Druivenrassen, synoniemen en relevante relaties." },
  { type: "vintage", title: "Jaargangen", description: "Jaargangen binnen een expliciete regionale scope." },
  { type: "classification", title: "Classificaties", description: "Classificatiesystemen met tijdigheid en provenance." },
  { type: "concept", title: "Concepten", description: "Wijnbouw, vinificatie, geologie, chemie en sensoriek." },
];

export default function ExplorePage() {
  const entities = getEntities();

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Ontdekken" title="Waar ben je nieuwsgierig naar?">
        <p>
          Verken Oenocademy vrij via onderwerpen en hun onderlinge relaties.
          Je hoeft de structuur van de kennisbank niet te kennen om te beginnen.
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
          const available = entities.filter((entity) => entity.type === category.type);
          return (
            <article className="category-row" key={category.type}>
              <div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <div className="entity-link-list">
                {available.length > 0 ? (
                  available.map((entity) => <EntityLink entity={entity} key={entity.id} />)
                ) : (
                  <span className="empty-inline">Nog geen gecontroleerde content beschikbaar</span>
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
