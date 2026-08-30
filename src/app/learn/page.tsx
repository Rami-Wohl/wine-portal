import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { getNarratives } from "@/content/repository";
import { narrativeHref } from "@/content/routing";

export const metadata: Metadata = {
  title: "Leer wijn op jouw niveau",
  description:
    "Volg gestructureerde leerpaden en verdiep je wijnkennis van fundamentele onderwerpen tot specialistisch niveau.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const publishedNarratives = getNarratives().filter(
    (narrative) => narrative.status === "active",
  );

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Leren" title="Leer in een doordachte volgorde">
        <p>
          Leerpaden verbinden geselecteerde entities en narratives tot een
          duidelijke route. Kennisdiepte blijft daarbij onafhankelijk van de
          pagina waarop je leest.
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="paths-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Leerpaden</p>
          <h2 id="paths-title">Beschikbare routes</h2>
        </div>
        {publishedNarratives.length > 0 ? (
          <div className="learning-list">
            {publishedNarratives.map((narrative) => (
              <Link href={narrativeHref(narrative)} key={narrative.id}>
                <span>{narrative.depth ?? "Niveau volgt"}</span>
                <strong>{narrative.title.nl}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">In redactie</p>
            <h3>De eerste leerroute wordt zorgvuldig opgebouwd.</h3>
            <p>
              De huidige content is nog een technische architectuurproef. We
              publiceren hier pas een leerpad wanneer inhoud, volgorde en
              bronnen zijn beoordeeld.
            </p>
            <Link className="text-link" href="/explore">
              Verken intussen de kennisbank →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
