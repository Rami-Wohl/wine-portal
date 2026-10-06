import { PageIntro } from "@/components/page-intro";
import { ResultPagination } from "@/components/result-pagination";
import { SearchFocusManager } from "@/components/search-focus-manager";
import type { EntityType, Locale } from "@/content/model";
import {
  getEntityById,
  getEntityPublicHref,
  getNarrativeById,
  getPublishedSearchIndex,
} from "@/content/repository";
import { contentLabels, ENTITY_TYPE_LABELS_NL, narrativeHref } from "@/content/routing";
import {
  firstSearchParam,
  normalizeSearchValue,
  parseEntityTypeFilter,
  searchEntryTitle,
  searchKnowledge,
  type KnowledgeSearchResult,
} from "@/content/search";
import { localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";

const PAGE_SIZE = 24;

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Zoeken" : "Search",
    description:
      locale === "nl"
        ? "Zoek direct in de verbonden kennisbank van Oenocademy."
        : "Search the connected Oenocademy knowledge base.",
    alternates: { canonical: localizedHref("/search", locale) },
    robots: { index: false, follow: true },
  };
}

// The shared header must receive request query data before any HTML is streamed.
export const dynamic = "force-dynamic";

interface SearchPageProps extends LocalePageProps {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    page?: string | string[];
  }>;
}

function pageHref(query: string, type: string, page: number, locale: Locale): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return localizedHref(`/search?${params.toString()}`, locale);
}

function resultHref(result: KnowledgeSearchResult, locale: Locale): string | null {
  const entry = result.entry;
  let baseHref: string | null;
  if (entry.kind === "entity") {
    const entity = getEntityById(entry.id);
    baseHref = entity ? getEntityPublicHref(entity, locale) : null;
  } else {
    const narrative = getNarrativeById(entry.id);
    baseHref = narrative ? narrativeHref(narrative, locale) : null;
  }
  if (!baseHref) return null;
  return result.anchor ? `${baseHref}#${result.anchor}` : baseHref;
}

function resultTypeLabel(result: KnowledgeSearchResult, locale: Locale): string {
  return result.entry.kind === "entity"
    ? contentLabels(locale).entity[result.entry.entity_type]
    : contentLabels(locale).narrative[result.entry.narrative_type];
}

function resultContext(result: KnowledgeSearchResult, locale: Locale): string | null {
  if (result.match_kind === "media-caption")
    return locale === "nl" ? "Gevonden in een beeldbijschrift" : "Found in an image caption";
  if (result.match_kind === "metadata") return null;
  if (result.passage?.heading)
    return locale === "nl"
      ? `Gevonden in ${result.passage.heading}`
      : `Found in ${result.passage.heading}`;
  return locale === "nl" ? "Gevonden in de artikeltekst" : "Found in the article text";
}

function SearchResultCard({ result, locale }: { result: KnowledgeSearchResult; locale: Locale }) {
  const href = resultHref(result, locale);
  if (!href) return null;
  const context = resultContext(result, locale);

  return (
    <Link className="search-result-card" href={href}>
      <span className="search-result-meta">
        <span>{resultTypeLabel(result, locale)}</span>
        {result.passage?.depth ? (
          <span>{contentLabels(locale).depth[result.passage.depth]}</span>
        ) : null}
      </span>
      <h3>{searchEntryTitle(result.entry, locale)}</h3>
      {context ? <span className="search-result-context">{context}</span> : null}
      {result.snippet ? <span className="search-result-snippet">{result.snippet}</span> : null}
      <span className="search-result-action">
        {locale === "nl" ? "Lees verder →" : "Read more →"}
      </span>
    </Link>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const locale = await pageLocale(params);
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
    ? searchKnowledge(getPublishedSearchIndex(), q, selectedType, locale)
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
      <PageIntro
        eyebrow={locale === "nl" ? "Zoeken" : "Search"}
        title={locale === "nl" ? "Vind direct wat je nodig hebt" : "Find what you need"}
      >
        <p>
          {locale === "nl"
            ? "Zoek op onderwerp of op woorden uit artikelen en beeldbijschriften. Een inhoudstreffer brengt je meteen naar de relevante passage."
            : "Search for a topic or words from articles and image captions. A content match takes you straight to the relevant passage."}{" "}
        </p>
      </PageIntro>

      <form className="discovery-search" action={localizedHref("/search", locale)} role="search">
        <label htmlFor="search-query">{locale === "nl" ? "Zoekterm" : "Search term"}</label>
        <div className="search-field">
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={
              locale === "nl"
                ? "Bordeaux, Cabernet Sauvignon, wortelschade…"
                : "Bordeaux, Cabernet Sauvignon, root damage…"
            }
          />
          <button type="submit">{locale === "nl" ? "Zoeken" : "Search"}</button>
        </div>
        <fieldset className="filter-row">
          <legend>{locale === "nl" ? "Filter op type" : "Filter by type"}</legend>
          <label>
            <input type="radio" name="type" value="all" defaultChecked={selectedType === "all"} />
            {locale === "nl" ? "Alles" : "All"}{" "}
          </label>
          {validTypes.map((item) => (
            <label key={item}>
              <input type="radio" name="type" value={item} defaultChecked={selectedType === item} />
              {contentLabels(locale).entity[item]}
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
              {allResults.length}{" "}
              {allResults.length === 1
                ? locale === "nl"
                  ? "resultaat"
                  : "result"
                : locale === "nl"
                  ? "resultaten"
                  : "results"}
            </p>
            <h2 id="results-title" data-pagination-heading tabIndex={-1}>
              {hasQuery
                ? locale === "nl"
                  ? `Voor “${q.trim()}”`
                  : `For “${q.trim()}”`
                : selectedType !== "all"
                  ? contentLabels(locale).entities[selectedType]
                  : locale === "nl"
                    ? "Resultaten"
                    : "Results"}
            </h2>
          </div>
          {pageCount > 1 ? (
            <ResultPagination
              locale={locale}
              currentPage={currentPage}
              hrefForPage={(page) => pageHref(q.trim(), selectedType, page, locale)}
              label={locale === "nl" ? "Pagina's met zoekresultaten" : "Search result pages"}
              pageCount={pageCount}
              position="top"
              targetId="search-results"
            />
          ) : null}
          <div className="search-result-list">
            {results.length > 0 ? (
              results.map((result) => (
                <SearchResultCard
                  locale={locale}
                  result={result}
                  key={`${result.entry.kind}:${result.entry.id}`}
                />
              ))
            ) : (
              <p>
                {locale === "nl"
                  ? "Geen passende onderwerpen gevonden. Probeer een andere zoekterm of filter."
                  : "No matching topics found. Try a different search term or filter."}
              </p>
            )}
          </div>
          {pageCount > 1 ? (
            <ResultPagination
              locale={locale}
              currentPage={currentPage}
              hrefForPage={(page) => pageHref(q.trim(), selectedType, page, locale)}
              label={locale === "nl" ? "Pagina's met zoekresultaten" : "Search result pages"}
              pageCount={pageCount}
              position="bottom"
              targetId="search-results"
            />
          ) : null}
        </section>
      ) : (
        <section className="search-start-state" aria-labelledby="search-start-title">
          <p className="eyebrow">{locale === "nl" ? "Begin met zoeken" : "Start searching"}</p>
          <h2 id="search-start-title">
            {locale === "nl"
              ? "Welk onderwerp wil je verkennen?"
              : "Which topic would you like to explore?"}
          </h2>
          <p>
            {locale === "nl"
              ? "Vul een naam of begrip in, of kies een categorie om gericht te bladeren."
              : "Enter a name or concept, or choose a category to browse."}
          </p>
        </section>
      )}
    </main>
  );
}
