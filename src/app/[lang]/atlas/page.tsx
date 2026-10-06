import { PageIntro } from "@/components/page-intro";
import { localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Interactieve wijnatlas" : "Interactive wine atlas",
    description:
      locale === "nl"
        ? "Verken wijnregio's, appellaties en producenten geografisch via de interactieve atlas van Oenocademy."
        : "Explore wine regions, appellations and producers geographically through the interactive Oenocademy atlas.",
    alternates: { canonical: localizedHref("/atlas", locale) },
    robots: { index: false, follow: true },
  };
}

export default async function AtlasPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <PageIntro
        eyebrow="Atlas"
        title={
          locale === "nl"
            ? "Wijnkennis in geografische context"
            : "Wine knowledge in geographic context"
        }
      >
        <p>
          {locale === "nl"
            ? "De Atlas wordt de geografische ingang tot dezelfde wijnkennis die je via Ontdekken, Leren en Zoeken bereikt."
            : "The Atlas will provide a geographic entry point to the same wine knowledge available through Explore, Learn and Search."}{" "}
        </p>
      </PageIntro>

      <section className="atlas-shell" aria-labelledby="atlas-status-title">
        <div className="atlas-toolbar">
          <div>
            <span>{locale === "nl" ? "Geografisch zoeken" : "Geographic search"}</span>
            <strong>{locale === "nl" ? "Nog niet beschikbaar" : "Not available yet"}</strong>
          </div>
          <div>
            <span>{locale === "nl" ? "Kaartlagen" : "Map layers"}</span>
            <strong>
              {locale === "nl" ? "Wachten op geverifieerde data" : "Awaiting verified data"}
            </strong>
          </div>
        </div>
        <div className="atlas-layout">
          <div className="map-empty-state">
            <p className="eyebrow">
              {locale === "nl" ? "Gecontroleerde kaartgegevens" : "Verified map data"}
            </p>
            <h2 id="atlas-status-title">
              {locale === "nl"
                ? "De kaart blijft bewust leeg."
                : "The map is awaiting verified data."}
            </h2>
            <p>
              {locale === "nl"
                ? "Appellationgrenzen, regio’s en producentlocaties worden pas weergegeven wanneer bron, licentie, precisie en betekenis zijn gecontroleerd. Oenocademy tekent geen benaderde geografie om deze ruimte op te vullen."
                : "Appellation boundaries, regions and producer locations will appear once their sources, licenses, precision and meaning have been checked. Oenocademy uses verified geography for its maps."}{" "}
            </p>
          </div>
          <aside
            className="atlas-detail"
            aria-label={locale === "nl" ? "Geselecteerde kaartentiteit" : "Selected map feature"}
          >
            <p className="eyebrow">{locale === "nl" ? "Selectie" : "Selection"}</p>
            <h3>{locale === "nl" ? "Nog geen onderwerp geselecteerd" : "No topic selected yet"}</h3>
            <p>
              {locale === "nl"
                ? "Een toekomstige kaartselectie opent aanvullende kennis over de gekozen regio, appellatie, wijngaard of producent."
                : "Selecting a map feature will open further information about the chosen region, appellation, vineyard or producer."}{" "}
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
