import { AtlasScene } from "@/components/atlas/atlas-scene";
import { orientationLayers, scenesOrientation } from "@/components/atlas/copy";
import { PageIntro } from "@/components/page-intro";
import {
  ATLAS_OVERVIEW_SCENE_ID,
  ATLAS_PREVIEW,
  atlasSceneHref,
  getAtlasSceneById,
  getPublishedAtlasSceneSummaries,
} from "@/content/geography";
import { getEntityById } from "@/content/repository";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  // Indexing follows the release gate and data availability; a noindex page gets no SEO
  // language alternates (docs/localization-routing.md §4).
  const indexable = !ATLAS_PREVIEW && getPublishedAtlasSceneSummaries().length > 0;
  return {
    title: locale === "nl" ? "Wijnatlas" : "Wine atlas",
    description:
      locale === "nl"
        ? "Oriënteer je op kaarten van wijnregio's en appellaties, opgebouwd uit geverifieerde geografische data."
        : "Find your bearings on maps of wine regions and appellations, built from verified geographic data.",
    alternates: indexable
      ? languageAlternates("/atlas", locale)
      : { canonical: localizedHref("/atlas", locale) },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

/** "37 van 38 appellaties op de kaart"; computed, never hand-typed. */
function coverageLine(shown: number, intended: number, locale: "nl" | "en") {
  if (locale === "nl") {
    return `${shown} van ${intended} ${intended === 1 ? "appellatie" : "appellaties"} op de kaart`;
  }
  return `${shown} of ${intended} ${intended === 1 ? "appellation" : "appellations"} mapped`;
}

export default async function AtlasPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const scenes = getPublishedAtlasSceneSummaries().map((scene) => ({
    scene,
    name: getEntityById(scene.owner)?.names[locale] ?? scene.slug,
  }));
  // Claim only the orientation layers every published map actually draws.
  const orientation = orientationLayers(
    scenesOrientation(
      scenes.flatMap(({ scene }) => {
        const full = getAtlasSceneById(scene.id);
        return full ? [full] : [];
      }),
    ),
    locale,
  );
  const overview = scenes.some(({ scene }) => scene.id === ATLAS_OVERVIEW_SCENE_ID)
    ? getAtlasSceneById(ATLAS_OVERVIEW_SCENE_ID)
    : undefined;

  return (
    <main id="main-content" className="page-shell atlas-page" tabIndex={-1}>
      <PageIntro
        eyebrow={
          ATLAS_PREVIEW ? (locale === "nl" ? "Atlas · voorvertoning" : "Atlas · preview") : "Atlas"
        }
        title={locale === "nl" ? "Waar ligt wat?" : "Find your bearings"}
      >
        <p>
          {locale === "nl"
            ? `Iedere kaart toont geverifieerde appellatiegebieden${orientation ? ` met ${orientation} als oriëntatie` : ""}. Kaarten zijn bedoeld om je te oriënteren, niet als perceelsgrens of juridisch bewijs.`
            : `Each map shows verified appellation areas${orientation ? ` with ${orientation} for orientation` : ""}. Maps help you find your bearings; they are not parcel boundaries or legal evidence.`}{" "}
        </p>
      </PageIntro>

      {overview ? (
        <AtlasScene scene={overview} locale={locale} variant="overview" headingLevel={2} />
      ) : null}

      <section className="atlas-scene-list" aria-labelledby="atlas-scenes-title">
        <div className="section-heading-compact">
          <p className="eyebrow">{locale === "nl" ? "Kaarten" : "Maps"}</p>
          <h2 id="atlas-scenes-title">{locale === "nl" ? "Kies een regio" : "Choose a region"}</h2>
        </div>
        {scenes.length > 0 ? (
          <ul className="learning-list">
            {scenes.map(({ scene, name }) => (
              <li key={scene.id}>
                <Link href={atlasSceneHref(scene.slug, locale)}>
                  <strong>{name}</strong>
                  <span>
                    {coverageLine(
                      scene.coverage.shown.length,
                      scene.coverage.intended.length,
                      locale,
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">{locale === "nl" ? "In voorbereiding" : "In preparation"}</p>
            <h3>
              {locale === "nl"
                ? "Er zijn nog geen gepubliceerde kaarten."
                : "There are no published maps yet."}
            </h3>
            <p>
              {locale === "nl"
                ? "Kaarten verschijnen hier zodra hun geografische data is geverifieerd en gepubliceerd. De regio's en appellaties in de kennisbank zijn nu al te verkennen."
                : "Maps appear here once their geographic data has been verified and published. The regions and appellations in the knowledge base are already available to explore."}{" "}
            </p>
            <Link className="text-link" href={localizedHref("/explore/regions", locale)}>
              {locale === "nl" ? "Verken de regio's →" : "Explore the regions →"}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
