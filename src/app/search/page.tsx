import type { Metadata } from "next";
import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getEntities } from "@/content/repository";
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
  const q = Array.isArray(rawSearchParams.q)
    ? rawSearchParams.q[0] ?? ""
    : rawSearchParams.q ?? "";
  const type = Array.isArray(rawSearchParams.type)
    ? rawSearchParams.type[0] ?? "all"
    : rawSearchParams.type ?? "all";
  const normalizedQuery = q.trim().toLocaleLowerCase("nl");
  const validTypes = Object.keys(ENTITY_TYPE_LABELS_NL) as EntityType[];
  const selectedType = validTypes.includes(type as EntityType) ? (type as EntityType) : "all";
  const results = getEntities().filter((entity) => {
    const matchesQuery = normalizedQuery.length === 0 || [entity.canonical_name, entity.names.nl, entity.names.en, entity.id]
      .some((value) => value.toLocaleLowerCase("nl").includes(normalizedQuery));
    const matchesType = selectedType === "all" || entity.type === selectedType;
    return matchesQuery && matchesType;
  });

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
            {normalizedQuery ? `${results.length} voor “${q.trim()}”` : "Beschikbare kennis"}
          </h2>
        </div>
        <div className="entity-link-list entity-link-list-wide">
          {results.length > 0 ? results.map((entity) => <EntityLink entity={entity} key={entity.id} />) : <p>Geen resultaten gevonden.</p>}
        </div>
      </section>
    </main>
  );
}
