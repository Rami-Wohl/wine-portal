import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Interactieve wijnatlas",
  description:
    "Verken wijnregio's, appellaties en producenten geografisch via de interactieve atlas van Oenocademy.",
  alternates: { canonical: "/atlas" },
  robots: { index: false, follow: true },
};

export default function AtlasPage() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Atlas" title="Wijnkennis in geografische context">
        <p>
          De Atlas wordt de geografische ingang tot dezelfde wijnkennis die je
          via Ontdekken, Leren en Zoeken bereikt.
        </p>
      </PageIntro>

      <section className="atlas-shell" aria-labelledby="atlas-status-title">
        <div className="atlas-toolbar">
          <div>
            <span>Geografisch zoeken</span>
            <strong>Nog niet beschikbaar</strong>
          </div>
          <div>
            <span>Kaartlagen</span>
            <strong>Wachten op geverifieerde data</strong>
          </div>
        </div>
        <div className="atlas-layout">
          <div className="map-empty-state">
            <p className="eyebrow">Gecontroleerde kaartgegevens</p>
            <h2 id="atlas-status-title">De kaart blijft bewust leeg.</h2>
            <p>
              Appellationgrenzen, regio’s en producentlocaties worden pas
              weergegeven wanneer bron, licentie, precisie en betekenis zijn
              gecontroleerd. Oenocademy tekent geen benaderde geografie om deze
              ruimte op te vullen.
            </p>
          </div>
          <aside
            className="atlas-detail"
            aria-label="Geselecteerde kaartentiteit"
          >
            <p className="eyebrow">Selectie</p>
            <h3>Nog geen onderwerp geselecteerd</h3>
            <p>
              Een toekomstige kaartselectie opent aanvullende kennis over de
              gekozen regio, appellatie, wijngaard of producent.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
