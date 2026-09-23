import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ResultPagination } from "@/components/result-pagination";
import { SearchFocusManager } from "@/components/search-focus-manager";
import {
  getEntityById,
  getEntityPublicHref,
  getNarrativeById,
  getPublishedSearchIndex,
} from "@/content/repository";
import {
  firstSearchParam,
  normalizeSearchValue,
  parseEntityTypeFilter,
  searchEntryTitle,
  searchKnowledge,
  type KnowledgeSearchResult,
} from "@/content/search";
import {
  DEPTH_LABELS_NL,
  ENTITY_TYPE_LABELS_NL,
  ENTITY_TYPE_PLURAL_LABELS_NL,
  NARRATIVE_TYPE_LABELS_NL,
  narrativeHref,
} from "@/content/routing";
import type { EntityType } from "@/content/model";

const PAGE_SIZE = 24;

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
    page?: string | string[];
  }>;
}

function pageHref(query: string, type: string, page: number): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function resultHref(result: KnowledgeSearchResult): string | null {
  const entry = result.entry;
  let baseHref: string | null;
  if (entry.kind === "entity") {
    const entity = getEntityById(entry.id);
    baseHref = entity ? getEntityPublicHref(entity) : null;
  } else {
    const narrative = getNarrativeById(entry.id);
    baseHref = narrative ? narrativeHref(narrative) : null;
  }
  if (!baseHref) return null;
  return result.anchor ? `${baseHref}#${result.anchor}` : baseHref;
}

function resultTypeLabel(result: KnowledgeSearchResult): string {
  return result.entry.kind === "entity"
    ? ENTITY_TYPE_LABELS_NL[result.entry.entity_type]
    : NARRATIVE_TYPE_LABELS_NL[result.entry.narrative_type];
}

function resultContext(result: KnowledgeSearchResult): string | null {
  if (result.match_kind === "media-caption") return "Gevonden in een beeldbijschrift";
  if (result.match_kind === "metadata") return null;
  if (result.passage?.heading) return `Gevonden in ${result.passage.heading}`;
  return "Gevonden in de artikeltekst";
}

function SearchResultCard({ result }: { result: KnowledgeSearchResult }) {
  const href = resultHref(result);
  if (!href) return null;
  const context = resultContext(result);

  return (
    <Link className="search-result-card" href={href}>
      <span className="search-result-meta">
        <span>{resultTypeLabel(result)}</span>
        {result.passage?.depth ? <span>{DEPTH_LABELS_NL[result.passage.depth]}</span> : null}
      </span>
      <h3>{searchEntryTitle(result.entry, "nl")}</h3>
      {context ? <span className="search-result-context">{context}</span> : null}
      {result.snippet ? <span className="search-result-snippet">{result.snippet}</span> : null}
      <span className="search-result-action">Lees verder →</span>
    </Link>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawSearchParams = await searchParams;
  const q = firstSearchParam(rawSearchParams.q);
  const type = firstSearchParam(rawSearchParams.type, "all");
  const requestedPage = Number.parseInt(firstSearchParam(rawSearchParams.page, "1"), 10);
  const validTypes = Object.keys(ENTITY_TYPE_LABELS_NL) as EntityType[];
  const selectedType = parseEntityTypeFilter(type);
  const hasQuery = normalizeSearchValue(q).length > 0;
  const hasTypeFilter = selectedType !== "all";
  const hasSearchIntent = hasQuery || hasTypeFilter;
  const allResults = hasSearchIntent
    ? searchKnowledge(getPublishedSearchIndex(), q, selectedType)
    : [];
  const pageCount = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const results = allResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const navigationKey = `${q}\u0000${selectedType}\u0000${currentPage}`;

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <SearchFocusManager hasSearchIntent={hasSearchIntent} navigationKey={navigationKey} />
      <PageIntro eyebrow="Zoeken" title="Vind direct wat je nodig hebt">
        <p>
          Zoek op onderwerp of op woorden uit artikelen en beeldbijschriften. Een inhoudstreffer
          brengt je meteen naar de relevante passage.
        </p>
      </PageIntro>

      <form className="discovery-search" action="/search" role="search">
        <label htmlFor="search-query">Zoekterm</label>
        <div className="search-field">
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Bordeaux, Cabernet Sauvignon, wortelschade…"
          />
          <button type="submit">Zoeken</button>
        </div>
        <fieldset className="filter-row">
          <legend>Filter op type</legend>
          <label>
            <input type="radio" name="type" value="all" defaultChecked={selectedType === "all"} />
            Alles
          </label>
          {validTypes.map((item) => (
            <label key={item}>
              <input type="radio" name="type" value={item} defaultChecked={selectedType === item} />
              {ENTITY_TYPE_LABELS_NL[item]}
            </label>
          ))}
        </fieldset>
      </form>

      {hasSearchIntent ? (
        <section
          id="search-results"
          className="search-results"
          aria-live="polite"
          aria-labelledby="results-title"
        >
          <div className="section-heading-compact">
            <p className="eyebrow">
              {allResults.length} {allResults.length === 1 ? "resultaat" : "resultaten"}
            </p>
            <h2 id="results-title" data-pagination-heading tabIndex={-1}>
              {hasQuery
                ? `Voor “${q.trim()}”`
                : selectedType !== "all"
                  ? ENTITY_TYPE_PLURAL_LABELS_NL[selectedType]
                  : "Resultaten"}
            </h2>
          </div>
          {pageCount > 1 ? (
            <ResultPagination
              currentPage={currentPage}
              hrefForPage={(page) => pageHref(q.trim(), selectedType, page)}
              label="Pagina's met zoekresultaten"
              pageCount={pageCount}
              position="top"
              targetId="search-results"
            />
          ) : null}
          <div className="search-result-list">
            {results.length > 0 ? (
              results.map((result) => (
                <SearchResultCard result={result} key={`${result.entry.kind}:${result.entry.id}`} />
              ))
            ) : (
              <p>Geen passende onderwerpen gevonden. Probeer een andere zoekterm of filter.</p>
            )}
          </div>
          {pageCount > 1 ? (
            <ResultPagination
              currentPage={currentPage}
              hrefForPage={(page) => pageHref(q.trim(), selectedType, page)}
              label="Pagina's met zoekresultaten"
              pageCount={pageCount}
              position="bottom"
              targetId="search-results"
            />
          ) : null}
        </section>
      ) : (
        <section className="search-start-state" aria-labelledby="search-start-title">
          <p className="eyebrow">Begin met zoeken</p>
          <h2 id="search-start-title">Welk onderwerp wil je verkennen?</h2>
          <p>Vul een naam of begrip in, of kies een categorie om gericht te bladeren.</p>
        </section>
      )}
    </main>
  );
}
