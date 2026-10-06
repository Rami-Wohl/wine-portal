import { PageIntro } from "@/components/page-intro";
import { getPublishedNarratives } from "@/content/repository";
import { contentLabels, narrativeHref } from "@/content/routing";
import { languageAlternates, localizedHref } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Verdiepingen in wijn" : "Wine deep dives",
    description:
      locale === "nl"
        ? "Lees essays, profielen, vergelijkingen en andere verdiepende verhalen uit de kennisbank van Oenocademy."
        : "Read essays, profiles, comparisons and other in-depth stories from the Oenocademy knowledge base.",
    alternates: languageAlternates("/verdiepingen", locale),
  };
}

export default async function NarrativesPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  const narratives = getPublishedNarratives();

  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <PageIntro
        eyebrow={locale === "nl" ? "Verdiepingen" : "Deep dives"}
        title={
          locale === "nl"
            ? "Verhalen die verbanden zichtbaar maken"
            : "Stories that reveal connections"
        }
      >
        <p>
          {locale === "nl"
            ? "Verdiepingen verbinden de feiten uit de kennisbank tot essays, profielen, vergelijkingen en proefgidsen. Je kunt ze zelfstandig lezen; een leerpad kan later naar dezelfde inhoud verwijzen."
            : "Deep dives connect the facts in the knowledge base through essays, profiles, comparisons and tasting guides. Read them independently or as part of a learning path that links to the same content."}{" "}
        </p>
      </PageIntro>

      <section className="learning-overview" aria-labelledby="narratives-title">
        <div className="section-heading-compact">
          <p className="eyebrow">{locale === "nl" ? "Bibliotheek" : "Library"}</p>
          <h2 id="narratives-title">
            {locale === "nl" ? "Gepubliceerde verdiepingen" : "Published deep dives"}
          </h2>
        </div>
        {narratives.length > 0 ? (
          <div className="learning-list">
            {narratives.map((narrative) => (
              <Link href={narrativeHref(narrative, locale)} key={narrative.id}>
                <span>
                  {contentLabels(locale).narrative[narrative.type]}
                  {narrative.depth ? ` · ${contentLabels(locale).depth[narrative.depth]}` : ""}
                </span>
                <strong>{narrative.title[locale]}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">{locale === "nl" ? "In redactie" : "In review"}</p>
            <h3>
              {locale === "nl"
                ? "De eerste verdiepingen zijn in voorbereiding."
                : "The first deep dives are in preparation."}
            </h3>
            <p>
              {locale === "nl"
                ? "Zodra tekst en bronnen zijn beoordeeld, verschijnen de verhalen hier. De actieve entiteiten in de kennisbank zijn nu al te verkennen."
                : "Stories will appear here once their text and sources have been reviewed. Published topics in the knowledge base are already available to explore."}{" "}
            </p>
            <Link className="text-link" href={localizedHref("/explore", locale)}>
              {locale === "nl" ? "Verken de kennisbank →" : "Explore the knowledge base →"}{" "}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
