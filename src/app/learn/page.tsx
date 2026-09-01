import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { getNarratives } from "@/content/repository";
import { DEPTH_LABELS_NL, narrativeHref } from "@/content/routing";

export const metadata: Metadata = {
  title: "Leer wijn op jouw niveau",
  description:
    "Volg gestructureerde leerpaden en verdiep je wijnkennis van fundamentele onderwerpen tot specialistisch niveau.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const publishedNarratives = getNarratives().filter((narrative) => narrative.status === "active");

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Leren" title="Leer in een doordachte volgorde">
        <p>
          Leerpaden brengen onderwerpen en verdiepende verhalen samen in een heldere volgorde, van
          basiskennis tot specialistische verdieping.
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
                {narrative.depth ? (
                  <span>Kennisniveau: {DEPTH_LABELS_NL[narrative.depth]}</span>
                ) : null}
                <strong>{narrative.title.nl}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">In redactie</p>
            <h3>De eerste leerpaden zijn in voorbereiding.</h3>
            <p>
              We publiceren een leerpad zodra de inhoud, volgorde en bronnen zorgvuldig zijn
              beoordeeld.
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
