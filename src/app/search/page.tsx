import type { Metadata } from "next";
import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getEntities } from "@/content/repository";
import {
  filterEntities,
  firstSearchParam,
  parseEntityTypeFilter,
} from "@/content/search";
import { ENTITY_TYPE_LABELS_NL } from "@/content/routing";
import type { EntityType } from "@/content/model";

export const metadata: Metadata = {
  title: "Zoeken",
  description: "Zoek direct in de verbonden kennisbank van Oenocademy.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawSearchParams = await searchParams;
  const q = firstSearchParam(rawSearchParams.q);
  const type = firstSearchParam(rawSearchParams.type, "all");
  const validTypes = Object.keys(ENTITY_TYPE_LABELS_NL) as EntityType[];
  const selectedType = parseEntityTypeFilter(type);
  const results = filterEntities(getEntities(), q, selectedType);

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Zoeken" title="Vind direct wat je nodig hebt">
        <p>Zoek in canonical entities. Narratives worden toegevoegd zodra er beoordeelde leercontent beschikbaar is.</p>
      </PageIntro>

      <form className="discovery-search" action="/search" role="search">
        <label htmlFor="search-query">Zoekterm</label>
        <div className="search-field">
          <input id="search-query" name="q" type="search" defaultValue={q} placeholder="Bordeaux, Cabernet Sauvignon…" />
          <button type="submit">Zoeken</button>
        </div>
        <fieldset className="filter-row">
          <legend>Filter op type</legend>
          <label>
            <input type="radio" name="type" value="all" defaultChecked={selectedType === "all"} />
            Alles
          </label>
          {validTypes.filter((item) => item !== "site").map((item) => (
            <label key={item}>
              <input type="radio" name="type" value={item} defaultChecked={selectedType === item} />
              {ENTITY_TYPE_LABELS_NL[item]}
            </label>
          ))}
        </fieldset>
      </form>

      <section className="search-results" aria-live="polite" aria-labelledby="results-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Resultaten</p>
          <h2 id="results-title">
            {q.trim() ? `${results.length} voor “${q.trim()}”` : "Beschikbare kennis"}
          </h2>
        </div>
        <div className="entity-link-list entity-link-list-wide">
          {results.length > 0 ? results.map((entity) => <EntityLink entity={entity} key={entity.id} />) : <p>Geen resultaten gevonden.</p>}
        </div>
      </section>
    </main>
  );
}
