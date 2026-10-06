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
import type { Locale } from "@/content/model";
import { getEntityPublicHref } from "@/content/repository";
import { firstSearchParam } from "@/content/search";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// The shared header must receive request query data before any HTML is streamed.
export const dynamic = "force-dynamic";

interface DiscoveryBrowsePageProps {
  params: Promise<{ lang: string; entityType: string }>;
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
  const locale = await pageLocale(params);
  const { entityType } = await params;
  const category = getDiscoveryCategoryBySegment(entityType, locale);
  if (!category) return {};
  return {
    title:
      locale === "nl"
        ? `${category.title} ontdekken`
        : `Explore ${category.title.toLocaleLowerCase(locale)}`,
    description:
      locale === "nl"
        ? `${category.description} Bekijk alle gepubliceerde onderwerpen binnen Oenocademy.`
        : `${category.description} Browse all published topics in Oenocademy.`,
    alternates: languageAlternates(`/explore/${category.route_segment}`, locale),
  };
}

function browseHref(routeSegment: string, options: BrowseHrefOptions, locale: Locale): string {
  const params = new URLSearchParams();
  if (options.query) params.set("q", options.query);
  if (options.context) params.set("context", options.context);
  if (options.initial) params.set("initial", options.initial);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  const queryString = params.toString();
  return localizedHref(`/explore/${routeSegment}${queryString ? `?${queryString}` : ""}`, locale);
}

function DiscoveryEntityCard({ entry, locale }: { entry: DiscoveryEntry; locale: Locale }) {
  const contextNames = entry.contexts.map((item) => item.names[locale]);
  const context =
    contextNames.length > 2
      ? `${contextNames.slice(0, 2).join(" · ")} · +${contextNames.length - 2}`
      : contextNames.join(" · ");
  return (
    <Link className="discovery-entity-card" href={getEntityPublicHref(entry.entity, locale)}>
      <h3>{entry.entity.names[locale]}</h3>
      {context ? <p>{context}</p> : null}
      <span>{locale === "nl" ? "Open onderwerp →" : "Open topic →"}</span>
    </Link>
  );
}

export default async function DiscoveryBrowsePage({
  params,
  searchParams,
}: DiscoveryBrowsePageProps) {
  const locale = await pageLocale(params);
  const [{ entityType }, rawSearchParams] = await Promise.all([params, searchParams]);
  const category = getDiscoveryCategoryBySegment(entityType, locale);
  if (!category) notFound();

  const allEntries = getDiscoveryEntries(category.type, locale);
  const contextOptions = discoveryContextOptions(allEntries, locale);
  const requestedContext = firstSearchParam(rawSearchParams.context);
  const context = contextOptions.some((option) => option.slug === requestedContext)
    ? requestedContext
    : "";
  const requestedInitial = firstSearchParam(rawSearchParams.initial).toLocaleUpperCase(locale);
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
    <main id="main-content" className="page-shell discovery-browse-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Kruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/explore", locale)}>
          {locale === "nl" ? "Ontdekken" : "Explore"}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{category.title}</span>
      </nav>

      <PageIntro eyebrow={locale === "nl" ? "Ontdekken" : "Explore"} title={category.title}>
        <p>{category.description}</p>
      </PageIntro>

      {hasBrowseControls ? (
        <section className="discovery-browser" aria-labelledby="browse-controls-title">
          <div className="section-heading-compact">
            <p className="eyebrow">
              {locale === "nl" ? "Verfijn de verzameling" : "Refine the collection"}
            </p>
            <h2 id="browse-controls-title">
              {locale === "nl" ? "Vind je volgende onderwerp" : "Find your next topic"}
            </h2>
          </div>

          <form
            className="discovery-browser-form"
            action={localizedHref(`/explore/${category.route_segment}`, locale)}
          >
            <label htmlFor="browse-query">
              {locale === "nl" ? "Zoek binnen" : "Search within"}{" "}
              {category.title.toLocaleLowerCase(locale)}
            </label>
            <div className="discovery-browser-fields">
              <input
                id="browse-query"
                name="q"
                type="search"
                defaultValue={filters.query}
                placeholder={
                  locale === "nl"
                    ? `Zoek binnen ${category.title.toLocaleLowerCase(locale)}…`
                    : `Search within ${category.title.toLocaleLowerCase(locale)}…`
                }
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
              <button type="submit">{locale === "nl" ? "Toepassen" : "Apply"}</button>
            </div>
          </form>

          <nav
            className="alphabet-filter"
            aria-label={
              locale === "nl"
                ? `Filter ${category.title} op beginletter`
                : `Filter ${category.title} by initial letter`
            }
          >
            <Link
              className={!filters.initial ? "is-active" : undefined}
              href={browseHref(
                category.route_segment,
                { ...filters, initial: "", page: 1 },
                locale,
              )}
              aria-current={!filters.initial ? "page" : undefined}
            >
              {locale === "nl" ? "Alle" : "All"}{" "}
            </Link>
            {initials.map((initial) => (
              <Link
                className={filters.initial === initial ? "is-active" : undefined}
                href={browseHref(category.route_segment, { ...filters, initial, page: 1 }, locale)}
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
              {filteredEntries.length}{" "}
              {filteredEntries.length === 1
                ? locale === "nl"
                  ? "onderwerp"
                  : "topic"
                : locale === "nl"
                  ? "onderwerpen"
                  : "topics"}
            </p>
            <h2 id="browse-results-title" data-pagination-heading tabIndex={-1}>
              {hasActiveFilters
                ? locale === "nl"
                  ? "Gevonden onderwerpen"
                  : "Matching topics"
                : locale === "nl"
                  ? `Alle ${category.title.toLocaleLowerCase(locale)}`
                  : `All ${category.title.toLocaleLowerCase(locale)}`}
            </h2>
          </div>
          {hasActiveFilters ? (
            <Link
              className="text-link"
              href={localizedHref(`/explore/${category.route_segment}`, locale)}
            >
              {locale === "nl" ? "Wis filters" : "Clear filters"}{" "}
            </Link>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <ResultPagination
            locale={locale}
            currentPage={currentPage}
            hrefForPage={(page) =>
              browseHref(
                category.route_segment,
                {
                  ...filters,
                  page,
                },
                locale,
              )
            }
            label={
              locale === "nl"
                ? `Pagina's met ${category.title.toLocaleLowerCase(locale)}`
                : `Pages of ${category.title.toLocaleLowerCase(locale)}`
            }
            pageCount={pageCount}
            position="top"
            targetId="browse-results"
          />
        ) : null}

        {visibleEntries.length > 0 ? (
          <div className="discovery-entity-grid">
            {visibleEntries.map((entry) => (
              <DiscoveryEntityCard locale={locale} entry={entry} key={entry.entity.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>{locale === "nl" ? "Geen onderwerpen gevonden" : "No topics found"}</h3>
            <p>
              {locale === "nl"
                ? "Pas je zoekterm of filters aan om de verzameling opnieuw te bekijken."
                : "Adjust your search term or filters to browse the collection again."}
            </p>
            <Link
              className="text-link"
              href={localizedHref(`/explore/${category.route_segment}`, locale)}
            >
              {locale === "nl" ? "Toon de volledige verzameling" : "Show the full collection"}{" "}
            </Link>
          </div>
        )}

        {pageCount > 1 ? (
          <ResultPagination
            locale={locale}
            currentPage={currentPage}
            hrefForPage={(page) =>
              browseHref(
                category.route_segment,
                {
                  ...filters,
                  page,
                },
                locale,
              )
            }
            label={
              locale === "nl"
                ? `Pagina's met ${category.title.toLocaleLowerCase(locale)}`
                : `Pages of ${category.title.toLocaleLowerCase(locale)}`
            }
            pageCount={pageCount}
            position="bottom"
            targetId="browse-results"
          />
        ) : null}
      </section>
    </main>
  );
}
