import { joinNames, orientationLayers, scenesOrientation } from "@/components/atlas/copy";
import { BRAND } from "@/config/brand";
import {
  ATLAS_PREVIEW,
  getAtlasSceneById,
  getPublishedAtlasSceneSummaries,
} from "@/content/geography";
import { mediaUrl } from "@/content/media";
import { getEntityById, getMediaByIds } from "@/content/repository";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    description:
      locale === "nl"
        ? "Oenocademy verbindt wijnkennis, gestructureerde leerpaden en vrije verkenning in één kennisplatform."
        : "Oenocademy brings wine knowledge, structured learning paths and free exploration together in one platform.",
    alternates: languageAlternates("/", locale),
  };
}

export default async function Home({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  // Coverage is computed, never hand-typed: name the published scenes or say none exist yet.
  const atlasSummaries = getPublishedAtlasSceneSummaries();
  const atlasOrientation = orientationLayers(
    scenesOrientation(
      atlasSummaries.flatMap((scene) => {
        const full = getAtlasSceneById(scene.id);
        return full ? [full] : [];
      }),
    ),
    locale,
  );
  const atlasRegions = atlasSummaries
    .map((scene) => getEntityById(scene.owner)?.names[locale])
    .filter((name): name is string => Boolean(name))
    .sort((left, right) => left.localeCompare(right, locale));
  // The badge alone says preview (ATLAS_PREVIEW); the description stays data-derived.
  const atlasDescription =
    atlasRegions.length > 0
      ? locale === "nl"
        ? `${atlasRegions.length === 1 ? "Eén kaart" : `${atlasRegions.length} kaarten`} (${joinNames(atlasRegions, locale)}): geverifieerde appellatiegebieden${atlasOrientation ? ` met ${atlasOrientation} als oriëntatie` : ""}.`
        : `${atlasRegions.length === 1 ? "One map" : `${atlasRegions.length} maps`} (${joinNames(atlasRegions, locale)}): verified appellation areas${atlasOrientation ? ` with ${atlasOrientation} for orientation` : ""}.`
      : locale === "nl"
        ? "De eerste kaarten verschijnen zodra hun geografische data is geverifieerd en gepubliceerd."
        : "The first maps appear once their geographic data has been verified and published.";
  const modes: Array<{
    href: string;
    label: string;
    title: string;
    description: string;
    badge?: string;
  }> = [
    {
      href: "/explore",
      label: locale === "nl" ? "Ontdekken" : "Explore",
      title: locale === "nl" ? "Volg je nieuwsgierigheid" : "Follow your curiosity",
      description:
        locale === "nl"
          ? "Navigeer vrij door regio's, appellaties, producenten, druiven, jaargangen en wijnconcepten."
          : "Explore regions, appellations, producers, grapes, vintages and wine concepts at your own pace.",
    },
    {
      href: "/atlas",
      label: "Atlas",
      badge: ATLAS_PREVIEW ? (locale === "nl" ? "Voorvertoning" : "Preview") : undefined,
      title: locale === "nl" ? "Oriënteer je op de kaart" : "Find your bearings on the map",
      description: atlasDescription,
    },
    {
      href: "/learn",
      label: locale === "nl" ? "Leren" : "Learn",
      title: locale === "nl" ? "Bouw kennis doelgericht op" : "Build your knowledge with purpose",
      description:
        locale === "nl"
          ? "Volg gestructureerde leerpaden in een logische volgorde en op een passend kennisniveau."
          : "Follow structured learning paths in a logical order and at a suitable level.",
    },
  ];

  const [heroImage] = getMediaByIds(["media.home.vineyard-hero"]);

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <section className="home-hero">
        {heroImage ? (
          <Image
            alt={heroImage.alt[locale]}
            className="home-hero-image"
            fill
            preload
            sizes="(max-width: 620px) calc(100vw - 32px), 1220px"
            src={mediaUrl(heroImage)}
          />
        ) : null}
        <p className="eyebrow">
          {locale === "nl" ? "Verbonden wijnkennis" : "Connected wine knowledge"}
        </p>
        <h1>{BRAND.name}</h1>
        <p className="home-tagline">{BRAND.tagline[locale]}</p>
        <p className="home-description">
          {locale === "nl"
            ? "Oenocademy brengt verbonden wijnkennis, gestructureerd leren en vrije verkenning samen. Kies hoe je vandaag door hetzelfde kennisnetwerk wilt navigeren."
            : "Oenocademy brings connected wine knowledge, structured learning and free exploration together. Choose how you would like to navigate this shared knowledge network today."}{" "}
        </p>
      </section>

      <section
        className="mode-grid"
        aria-label={locale === "nl" ? "Kies hoe je wilt beginnen" : "Choose how to begin"}
      >
        {modes.map((mode) => (
          <Link className="mode-link" href={localizedHref(mode.href, locale)} key={mode.href}>
            <span className="mode-label">
              {mode.label}
              {mode.badge ? <span className="mode-badge">{mode.badge}</span> : null}
            </span>
            <h2>{mode.title}</h2>
            <p>{mode.description}</p>
            <span className="text-link">Open {mode.label.toLowerCase()} →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
