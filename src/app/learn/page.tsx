import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { getPublishedNarratives } from "@/content/repository";
import { DEPTH_LABELS_NL, narrativeHref } from "@/content/routing";

export const metadata: Metadata = {
  title: "Leer wijn op jouw niveau",
  description:
    "Volg gestructureerde leerpaden en verdiep je wijnkennis van fundamentele onderwerpen tot specialistisch niveau.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const publishedLessons = getPublishedNarratives().filter(
    (narrative) => narrative.type === "lesson",
  );

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Leren" title="Leer in een doordachte volgorde">
        <p>
          Hier komen zelfstandige lessen en samengestelde leerpaden die kennis stap voor stap
          opbouwen. Verdiepende essays en profielen blijven ook buiten een leerpad leesbaar.
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="paths-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Lessen en leerpaden</p>
          <h2 id="paths-title">Beschikbaar om te leren</h2>
        </div>
        {publishedLessons.length > 0 ? (
          <div className="learning-list">
            {publishedLessons.map((narrative) => (
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
            <h3>De eerste lessen en leerpaden zijn in voorbereiding.</h3>
            <p>
              We publiceren een les zodra inhoud, didactische opbouw en bronnen zorgvuldig zijn
              beoordeeld. Een leerpad ontstaat daarna als een geordende reeks van zulke onderdelen.
            </p>
            <Link className="text-link" href="/verdiepingen">
              Lees intussen de verdiepingen →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
