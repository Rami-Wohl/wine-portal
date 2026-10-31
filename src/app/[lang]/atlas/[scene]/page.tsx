import { AtlasScene } from "@/components/atlas/atlas-scene";
import { orientationLayers, scenesOrientation } from "@/components/atlas/copy";
import { PageIntro } from "@/components/page-intro";
import {
  ATLAS_PREVIEW,
  atlasSceneHref,
  getAtlasSceneBySlug,
  getAtlasSceneSummaries,
  getAtlasSceneSummaryBySlug,
} from "@/content/geography";
import { getEntityById, getEntityPublicHref } from "@/content/repository";
import { languageAlternates, localizedHref, withRouteQuery, type RouteQuery } from "@/i18n/routing";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

interface AtlasScenePageProps {
  searchParams?: Promise<RouteQuery>;
  params: Promise<{ lang: string; scene: string }>;
}

export function generateStaticParams() {
  // The owner's Dutch slug is a permanent alias of the English route, as for entity pages.
  return getAtlasSceneSummaries().flatMap((scene) =>
    Array.from(new Set([scene.slug, getEntityById(scene.owner)?.slugs.nl ?? scene.slug])).map(
      (slug) => ({ scene: slug }),
    ),
  );
}

export async function generateMetadata({ params }: AtlasScenePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  const { scene: slug } = await params;
  const summary = getAtlasSceneSummaryBySlug(slug);
  if (!summary) return {};
  const owner = getEntityById(summary.owner);
  const name = owner?.names[locale] ?? summary.slug;
  const published = owner?.status === "active";
  // Indexing follows the release gate and the owner's status; a noindex page gets no SEO
  // language alternates (docs/localization-routing.md §4).
  const indexable = !ATLAS_PREVIEW && published;
  const canonical = atlasSceneHref(summary.slug, locale);
  const full = getAtlasSceneBySlug(slug);
  const orientation = full ? orientationLayers(scenesOrientation([full]), locale) : null;

  return {
    title: locale === "nl" ? `${name}: kaart` : `${name}: map`,
    description: published
      ? locale === "nl"
        ? `Kaart van ${name} met geverifieerde appellatiegebieden${orientation ? `, ${orientation} als oriëntatie` : ""}.`
        : `Map of ${name} with verified appellation areas${orientation ? `, ${orientation} for orientation` : ""}.`
      : locale === "nl"
        ? `De kaart van ${name} wordt voorbereid voor de wijnatlas van Oenocademy.`
        : `The map of ${name} is being prepared for the Oenocademy wine atlas.`,
    alternates: indexable ? languageAlternates(canonical, locale) : { canonical },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      locale: locale === "nl" ? "nl_NL" : "en_US",
      title: locale === "nl" ? `Kaart van ${name}` : `Map of ${name}`,
      url: canonical,
    },
  };
}

export default async function AtlasScenePage({ params, searchParams }: AtlasScenePageProps) {
  const locale = await pageLocale(params);
  const { scene: slug } = await params;
  const scene = getAtlasSceneBySlug(slug);
  if (!scene) notFound();
  if (slug !== scene.slug) {
    permanentRedirect(
      withRouteQuery(atlasSceneHref(scene.slug, locale), (await searchParams) ?? {}),
    );
  }
  const owner = getEntityById(scene.owner);
  const name = owner?.names[locale] ?? slug;
  const published = owner?.status === "active";
  const orientation = orientationLayers(scenesOrientation([scene]), locale);

  return (
    <main id="main-content" className="page-shell atlas-page" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label={locale === "nl" ? "Broodkruimelpad" : "Breadcrumbs"}>
        <Link href={localizedHref("/atlas", locale)}>Atlas</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>

      <PageIntro
        eyebrow={
          published
            ? ATLAS_PREVIEW
              ? locale === "nl"
                ? "Atlas · voorvertoning"
                : "Atlas · preview"
              : "Atlas"
            : locale === "nl"
              ? "Atlas · in voorbereiding"
              : "Atlas · in preparation"
        }
        title={name}
      >
        <p>
          {published
            ? locale === "nl"
              ? `Deze kaart toont de geverifieerde appellatiegebieden van de regio${orientation ? ` met ${orientation} als oriëntatie` : ""}.`
              : `This map shows the region's verified appellation areas${orientation ? ` with ${orientation} for orientation` : ""}.`
            : locale === "nl"
              ? "Deze regio wordt nog voorbereid. De kaart is al te bekijken; de pagina over de regio volgt."
              : "This region is still being prepared. The map can already be viewed; the page about the region follows."}{" "}
          {owner ? (
            <Link href={getEntityPublicHref(owner, locale)}>
              {locale === "nl" ? `Lees over ${name}` : `Read about ${name}`}
            </Link>
          ) : null}
        </p>
      </PageIntro>

      <AtlasScene scene={scene} locale={locale} variant="overview" headingLevel={2} />
    </main>
  );
}
