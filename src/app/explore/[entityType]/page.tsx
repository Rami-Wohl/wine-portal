import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ResultPagination } from "@/components/result-pagination";
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_FILTER_THRESHOLD,
  DISCOVERY_PAGE_SIZE,
  discoveryContextOptions,
  discoveryInitials,
  filterDiscoveryEntries,
  getDiscoveryCategoryBySegment,
  getDiscoveryEntries,
  type DiscoveryEntry,
  type DiscoveryFilters,
} from "@/content/discovery";
import { getEntityPublicHref } from "@/content/repository";
import { firstSearchParam } from "@/content/search";

interface DiscoveryBrowsePageProps {
  params: Promise<{ entityType: string }>;
  searchParams: Promise<{
    q?: string | string[];
    context?: string | string[];
    initial?: string | string[];
    page?: string | string[];
  }>;
}

interface BrowseHrefOptions extends DiscoveryFilters {
  page?: number;
}

export function generateStaticParams() {
  return DISCOVERY_CATEGORIES.map((category) => ({ entityType: category.route_segment }));
}

export async function generateMetadata({ params }: DiscoveryBrowsePageProps): Promise<Metadata> {
  const { entityType } = await params;
  const category = getDiscoveryCategoryBySegment(entityType);
  if (!category) return {};
  return {
    title: `${category.title} ontdekken`,
    description: `${category.description} Bekijk alle gepubliceerde onderwerpen binnen Oenocademy.`,
    alternates: { canonical: `/explore/${category.route_segment}` },
  };
}

function browseHref(routeSegment: string, options: BrowseHrefOptions): string {
  const params = new URLSearchParams();
  if (options.query) params.set("q", options.query);
  if (options.context) params.set("context", options.context);
  if (options.initial) params.set("initial", options.initial);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  const queryString = params.toString();
  return `/explore/${routeSegment}${queryString ? `?${queryString}` : ""}`;
}

function DiscoveryEntityCard({ entry }: { entry: DiscoveryEntry }) {
  const contextNames = entry.contexts.map((item) => item.names.nl);
  const context =
    contextNames.length > 2
      ? `${contextNames.slice(0, 2).join(" · ")} · +${contextNames.length - 2}`
      : contextNames.join(" · ");
  return (
    <Link className="discovery-entity-card" href={getEntityPublicHref(entry.entity)}>
      <h3>{entry.entity.names.nl}</h3>
      {context ? <p>{context}</p> : null}
      <span>Open onderwerp →</span>
    </Link>
  );
}

export default async function DiscoveryBrowsePage({
  params,
  searchParams,
}: DiscoveryBrowsePageProps) {
  const [{ entityType }, rawSearchParams] = await Promise.all([params, searchParams]);
  const category = getDiscoveryCategoryBySegment(entityType);
  if (!category) notFound();

  const allEntries = getDiscoveryEntries(category.type);
  const contextOptions = discoveryContextOptions(allEntries);
  const requestedContext = firstSearchParam(rawSearchParams.context);
  const context = contextOptions.some((option) => option.slug === requestedContext)
    ? requestedContext
    : "";
  const requestedInitial = firstSearchParam(rawSearchParams.initial).toLocaleUpperCase("nl");
  const filtersWithoutInitial: DiscoveryFilters = {
    query: firstSearchParam(rawSearchParams.q).trim(),
    context,
    initial: "",
  };
  const initials = discoveryInitials(filterDiscoveryEntries(allEntries, filtersWithoutInitial));
  const filters: DiscoveryFilters = {
    ...filtersWithoutInitial,
    initial: initials.includes(requestedInitial) ? requestedInitial : "",
  };
  const hasBrowseControls = allEntries.length > DISCOVERY_FILTER_THRESHOLD;
  const hasContextFilter = hasBrowseControls && contextOptions.length > 1;
  const hasActiveFilters = Boolean(filters.query || filters.context || filters.initial);
  const filteredEntries = filterDiscoveryEntries(allEntries, filters);
  const requestedPage = Number.parseInt(firstSearchParam(rawSearchParams.page, "1"), 10);
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / DISCOVERY_PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const visibleEntries = hasBrowseControls
    ? filteredEntries.slice(
        (currentPage - 1) * DISCOVERY_PAGE_SIZE,
        currentPage * DISCOVERY_PAGE_SIZE,
      )
    : filteredEntries;

  return (
    <main id="main-content" className="page-shell discovery-browse-page">
      <nav className="breadcrumbs" aria-label="Kruimelpad">
        <Link href="/explore">Ontdekken</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{category.title}</span>
      </nav>

      <PageIntro eyebrow="Ontdekken" title={category.title}>
        <p>{category.description}</p>
      </PageIntro>

      {hasBrowseControls ? (
        <section className="discovery-browser" aria-labelledby="browse-controls-title">
          <div className="section-heading-compact">
            <p className="eyebrow">Verfijn de verzameling</p>
            <h2 id="browse-controls-title">Vind je volgende onderwerp</h2>
          </div>

          <form className="discovery-browser-form" action={`/explore/${category.route_segment}`}>
            <label htmlFor="browse-query">
              Zoek binnen {category.title.toLocaleLowerCase("nl")}
            </label>
            <div className="discovery-browser-fields">
              <input
                id="browse-query"
                name="q"
                type="search"
                defaultValue={filters.query}
                placeholder={`Zoek binnen ${category.title.toLocaleLowerCase("nl")}…`}
              />
              {hasContextFilter ? (
                <label className="discovery-context-field">
                  <span>{category.context_label}</span>
                  <select name="context" defaultValue={filters.context}>
                    <option value="">{category.context_all_label}</option>
                    {contextOptions.map((option) => (
                      <option value={option.slug} key={option.slug}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button type="submit">Toepassen</button>
            </div>
          </form>

          <nav className="alphabet-filter" aria-label={`Filter ${category.title} op beginletter`}>
            <Link
              className={!filters.initial ? "is-active" : undefined}
              href={browseHref(category.route_segment, { ...filters, initial: "", page: 1 })}
              aria-current={!filters.initial ? "page" : undefined}
            >
              Alle
            </Link>
            {initials.map((initial) => (
              <Link
                className={filters.initial === initial ? "is-active" : undefined}
                href={browseHref(category.route_segment, { ...filters, initial, page: 1 })}
                aria-current={filters.initial === initial ? "page" : undefined}
                key={initial}
              >
                {initial}
              </Link>
            ))}
          </nav>
        </section>
      ) : null}

      <section
        id="browse-results"
        className="discovery-results"
        aria-labelledby="browse-results-title"
      >
        <div className="discovery-results-heading">
          <div>
            <p className="eyebrow">
              {filteredEntries.length} {filteredEntries.length === 1 ? "onderwerp" : "onderwerpen"}
            </p>
            <h2 id="browse-results-title" data-pagination-heading tabIndex={-1}>
              {hasActiveFilters
                ? "Gevonden onderwerpen"
                : `Alle ${category.title.toLocaleLowerCase("nl")}`}
            </h2>
          </div>
          {hasActiveFilters ? (
            <Link className="text-link" href={`/explore/${category.route_segment}`}>
              Wis filters
            </Link>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <ResultPagination
            currentPage={currentPage}
            hrefForPage={(page) =>
              browseHref(category.route_segment, {
                ...filters,
                page,
              })
            }
            label={`Pagina's met ${category.title.toLocaleLowerCase("nl")}`}
            pageCount={pageCount}
            position="top"
            targetId="browse-results"
          />
        ) : null}

        {visibleEntries.length > 0 ? (
          <div className="discovery-entity-grid">
            {visibleEntries.map((entry) => (
              <DiscoveryEntityCard entry={entry} key={entry.entity.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Geen onderwerpen gevonden</h3>
            <p>Pas je zoekterm of filters aan om de verzameling opnieuw te bekijken.</p>
            <Link className="text-link" href={`/explore/${category.route_segment}`}>
              Toon de volledige verzameling
            </Link>
          </div>
        )}

        {pageCount > 1 ? (
          <ResultPagination
            currentPage={currentPage}
            hrefForPage={(page) =>
              browseHref(category.route_segment, {
                ...filters,
                page,
              })
            }
            label={`Pagina's met ${category.title.toLocaleLowerCase("nl")}`}
            pageCount={pageCount}
            position="bottom"
            targetId="browse-results"
          />
        ) : null}
      </section>
    </main>
  );
}
