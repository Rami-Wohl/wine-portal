import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { getPublishedNarratives } from "@/content/repository";
import { DEPTH_LABELS_NL, NARRATIVE_TYPE_LABELS_NL, narrativeHref } from "@/content/routing";

export const metadata: Metadata = {
  title: "Verdiepingen in wijn",
  description:
    "Lees essays, profielen, vergelijkingen en andere verdiepende verhalen uit de kennisbank van Oenocademy.",
  alternates: { canonical: "/verdiepingen" },
};

export default function NarrativesPage() {
  const narratives = getPublishedNarratives();

  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Verdiepingen" title="Verhalen die verbanden zichtbaar maken">
        <p>
          Verdiepingen verbinden de feiten uit de kennisbank tot essays, profielen, vergelijkingen
          en proefgidsen. Je kunt ze zelfstandig lezen; een leerpad kan later naar dezelfde inhoud
          verwijzen.
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="narratives-title">
        <div className="section-heading-compact">
          <p className="eyebrow">Bibliotheek</p>
          <h2 id="narratives-title">Gepubliceerde verdiepingen</h2>
        </div>
        {narratives.length > 0 ? (
          <div className="learning-list">
            {narratives.map((narrative) => (
              <Link href={narrativeHref(narrative)} key={narrative.id}>
                <span>
                  {NARRATIVE_TYPE_LABELS_NL[narrative.type]}
                  {narrative.depth ? ` · ${DEPTH_LABELS_NL[narrative.depth]}` : ""}
                </span>
                <strong>{narrative.title.nl}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">In redactie</p>
            <h3>De eerste verdiepingen zijn in voorbereiding.</h3>
            <p>
              Zodra tekst en bronnen zijn beoordeeld, verschijnen de verhalen hier. De actieve
              entiteiten in de kennisbank zijn nu al te verkennen.
            </p>
            <Link className="text-link" href="/explore">
              Verken de kennisbank →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
