import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  description:
    "Oenocademy verbindt wijnkennis, gestructureerde leerpaden, vrije verkenning en geografische ontdekking in één kennisplatform.",
  alternates: { canonical: "/" },
};

const modes = [
  {
    href: "/explore",
    label: "Ontdekken",
    title: "Volg je nieuwsgierigheid",
    description:
      "Navigeer vrij door regio's, appellaties, producenten, druiven, jaargangen en wijnconcepten.",
  },
  {
    href: "/learn",
    label: "Leren",
    title: "Bouw kennis doelgericht op",
    description:
      "Volg gestructureerde leerpaden in een logische volgorde en op een passend kennisniveau.",
  },
  {
    href: "/atlas",
    label: "Atlas",
    title: "Ontdek wijn geografisch",
    description:
      "Verken wijngebieden, appellaties en producenten via gecontroleerde geografische data.",
  },
];

export default function Home() {
  return (
    <main id="main-content" className="page-shell">
      <section className="home-hero">
        <p className="eyebrow">Verbonden wijnkennis</p>
        <h1>{BRAND.name}</h1>
        <p className="home-tagline">{BRAND.tagline.nl}</p>
        <p className="home-description">
          Oenocademy brengt verbonden wijnkennis, gestructureerd leren, vrije verkenning en
          geografische ontdekking samen. Kies hoe je vandaag door hetzelfde kennisnetwerk wilt
          navigeren.
        </p>
      </section>

      <section className="mode-grid" aria-label="Kies hoe je wilt beginnen">
        {modes.map((mode) => (
          <Link className="mode-link" href={mode.href} key={mode.href}>
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
