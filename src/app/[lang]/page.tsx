import { BRAND } from "@/config/brand";
import { mediaUrl } from "@/content/media";
import { getMediaByIds } from "@/content/repository";
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
        ? "Oenocademy verbindt wijnkennis, gestructureerde leerpaden, vrije verkenning en geografische ontdekking in één kennisplatform."
        : "Oenocademy brings wine knowledge, structured learning paths, free exploration and geographic discovery together in one platform.",
    alternates: languageAlternates("/", locale),
  };
}

export default async function Home({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const modes = [
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
      href: "/learn",
      label: locale === "nl" ? "Leren" : "Learn",
      title: locale === "nl" ? "Bouw kennis doelgericht op" : "Build your knowledge with purpose",
      description:
        locale === "nl"
          ? "Volg gestructureerde leerpaden in een logische volgorde en op een passend kennisniveau."
          : "Follow structured learning paths in a logical order and at a suitable level.",
    },
    {
      href: "/atlas",
      label: "Atlas",
      title: locale === "nl" ? "Ontdek wijn geografisch" : "Explore wine geographically",
      description:
        locale === "nl"
          ? "Verken wijngebieden, appellaties en producenten via gecontroleerde geografische data."
          : "Explore wine regions, appellations and producers through verified geographic data.",
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
            ? "Oenocademy brengt verbonden wijnkennis, gestructureerd leren, vrije verkenning en geografische ontdekking samen. Kies hoe je vandaag door hetzelfde kennisnetwerk wilt navigeren."
            : "Oenocademy brings connected wine knowledge, structured learning, free exploration and geographic discovery together. Choose how you would like to navigate this shared knowledge network today."}{" "}
        </p>
      </section>

      <section
        className="mode-grid"
        aria-label={locale === "nl" ? "Kies hoe je wilt beginnen" : "Choose how to begin"}
      >
        {modes.map((mode) => (
          <Link className="mode-link" href={localizedHref(mode.href, locale)} key={mode.href}>
            <span className="mode-label">{mode.label}</span>
            <h2>{mode.title}</h2>
            <p>{mode.description}</p>
            <span className="text-link">Open {mode.label.toLowerCase()} →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
