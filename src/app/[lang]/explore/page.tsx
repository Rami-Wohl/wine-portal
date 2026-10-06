import { EntityLink } from "@/components/entity-link";
import { PageIntro } from "@/components/page-intro";
import { getDiscoveryCategories, getDiscoveryEntries } from "@/content/discovery";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Wijnkennis ontdekken" : "Explore wine knowledge",
    description:
      locale === "nl"
        ? "Ontdek wijnregio's, appellaties, producenten, druiven, jaargangen en wijnconcepten via een verbonden kennisbank."
        : "Explore wine regions, appellations, producers, grapes, vintages and wine concepts through a connected knowledge base.",
    alternates: languageAlternates("/explore", locale),
  };
}

const CATEGORY_PREVIEW_LIMIT = 5;

export default async function ExplorePage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const categoryGroups = getDiscoveryCategories(locale).map((category) => {
    const available = getDiscoveryEntries(category.type, locale).map((entry) => entry.entity);
    return { ...category, available, preview: available.slice(0, CATEGORY_PREVIEW_LIMIT) };
  });

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <PageIntro
        eyebrow={locale === "nl" ? "Ontdekken" : "Explore"}
        title={locale === "nl" ? "Waar ben je nieuwsgierig naar?" : "What are you curious about?"}
      >
        <p>
          {locale === "nl"
            ? "Verken onderwerpen en ontdek hoe regio's, producenten, druiven en wijnbegrippen met elkaar samenhangen."
            : "Explore topics and discover the connections between regions, producers, grapes and wine concepts."}{" "}
        </p>
      </PageIntro>

      <form className="discovery-search" action={localizedHref("/search", locale)} role="search">
        <label htmlFor="explore-query">
          {locale === "nl" ? "Zoek in de kennisbank" : "Search the knowledge base"}
        </label>
        <div className="search-field">
          <input
            id="explore-query"
            name="q"
            type="search"
            placeholder={
              locale === "nl"
                ? "Zoek een regio, producent, druif of onderwerp…"
                : "Search for a region, producer, grape or topic…"
            }
          />
          <button type="submit">{locale === "nl" ? "Zoeken" : "Search"}</button>
        </div>
      </form>

      <section className="category-list" aria-labelledby="categories-title">
        <div className="section-heading-compact">
          <p className="eyebrow">{locale === "nl" ? "Kennisgebieden" : "Areas of knowledge"}</p>
          <h2 id="categories-title">
            {locale === "nl" ? "Kies je ingang" : "Choose where to begin"}
          </h2>
          <p>
            {locale === "nl"
              ? "Iedere categorie toont een kleine voorproef. Open de categorie om de volledige, doorzoekbare verzameling te bekijken."
              : "Each category offers a small preview. Open it to browse and search the full collection."}{" "}
          </p>
        </div>
        <div className="category-grid">
          {categoryGroups.map((category) => {
            const categoryHref = localizedHref(`/explore/${category.route_segment}`, locale);
            const remaining = category.available.length - category.preview.length;
            return (
              <article className="category-card" key={category.type}>
                <div className="category-card-heading">
                  <div>
                    <p className="category-count">
                      {category.available.length}{" "}
                      {category.available.length === 1
                        ? locale === "nl"
                          ? "onderwerp"
                          : "topic"
                        : locale === "nl"
                          ? "onderwerpen"
                          : "topics"}
                    </p>
                    <h3>{category.title}</h3>
                  </div>
                  {category.available.length > 0 ? (
                    <Link
                      className="category-arrow-link"
                      href={categoryHref}
                      aria-label={
                        locale === "nl"
                          ? `Bekijk alle onderwerpen in ${category.title}`
                          : `View all topics in ${category.title}`
                      }
                    >
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
                <p>{category.description}</p>
                <div className="category-preview">
                  {category.preview.length > 0 ? (
                    category.preview.map((entity) => (
                      <EntityLink locale={locale} entity={entity} key={entity.id} />
                    ))
                  ) : (
                    <span className="empty-inline">
                      {locale === "nl" ? "Binnenkort beschikbaar" : "Coming soon"}
                    </span>
                  )}
                </div>
                {category.available.length > 0 ? (
                  <Link className="category-browse-link" href={categoryHref}>
                    {locale === "nl" ? "Bekijk" : "View"}{" "}
                    {category.available.length === 1
                      ? locale === "nl"
                        ? "het onderwerp"
                        : "the topic"
                      : locale === "nl"
                        ? "alle onderwerpen"
                        : "all topics"}
                    {remaining > 0
                      ? locale === "nl"
                        ? ` · nog ${remaining}`
                        : ` · ${remaining} more`
                      : ""}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span className="category-browse-link category-browse-link-disabled">
                    {locale === "nl"
                      ? "Nog geen gepubliceerde onderwerpen"
                      : "No published topics yet"}{" "}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <p className="quiet-note">
        {locale === "nl"
          ? "Liever een onderwerp in volgorde bestuderen? Ga naar"
          : "Prefer to study a topic step by step? Go to"}{" "}
        <Link href={localizedHref("/learn", locale)}>{locale === "nl" ? "Leren" : "Learn"}</Link>.
      </p>
    </main>
  );
}
