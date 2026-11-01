import { AtlasPortalEmpty, AtlasPortalView } from "@/components/atlas/atlas-portal";
import { atlasCopy } from "@/components/atlas/copy";
import { PageIntro } from "@/components/page-intro";
import { ATLAS_PREVIEW, getAtlasPortal } from "@/content/geography";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  // Indexing follows the release gate and data availability; a noindex page gets no SEO
  // language alternates (docs/localization-routing.md §4).
  const indexable = !ATLAS_PREVIEW && getAtlasPortal(locale).mapCount > 0;
  const copy = atlasCopy(locale).portal;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: indexable
      ? languageAlternates("/atlas", locale)
      : { canonical: localizedHref("/atlas", locale) },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

/**
 * The Atlas portal: every published region in its hierarchy with its map state. Built from scene
 * summaries only; no scene file is loaded here (each map lives on its own scene route).
 */
export default async function AtlasPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const portal = getAtlasPortal(locale);
  const copy = atlasCopy(locale).portal;

  return (
    <main id="main-content" className="page-shell atlas-page atlas-portal-page" tabIndex={-1}>
      <PageIntro eyebrow={copy.eyebrow(ATLAS_PREVIEW)} title={copy.title}>
        <p>
          {copy.intro} {copy.scope(portal.regionCount, portal.mapCount)}
        </p>
        {ATLAS_PREVIEW ? <p className="atlas-portal-preview-note">{copy.previewNote}</p> : null}
      </PageIntro>

      {portal.mapCount === 0 ? (
        <AtlasPortalEmpty
          exploreHref={
            portal.regionCount === 0 ? localizedHref("/explore/regions", locale) : undefined
          }
          locale={locale}
        />
      ) : null}

      {portal.regionCount > 0 ? (
        <AtlasPortalView
          locale={locale}
          portal={portal}
          searchAction={localizedHref("/search", locale)}
        />
      ) : null}
    </main>
  );
}
