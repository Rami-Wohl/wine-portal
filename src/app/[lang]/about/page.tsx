import { languageAlternates } from "@/i18n/routing";
import { pageLocale, type LocalePageProps } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    title: locale === "nl" ? "Over Oenocademy" : "About Oenocademy",
    description:
      locale === "nl"
        ? "Lees waarom Oenocademy is gebouwd en hoe leren, vrije verkenning, bronnen en geografische data samenkomen in één wijnkennisplatform."
        : "Discover why Oenocademy was built and how learning, free exploration, sources and geographic data come together in one wine knowledge platform.",
    alternates: languageAlternates("/about", locale),
  };
}

export default async function AboutPage({ params }: LocalePageProps) {
  const locale = await pageLocale(params);
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <article className="about-copy">
        <section>
          <h2>{locale === "nl" ? "Waarom bestaat Oenocademy?" : "Why does Oenocademy exist?"}</h2>
          <p className="mb-4">
            {locale === "nl"
              ? "Ik ben een wijnenthousiast met een achtergrond in software development. De afgelopen jaren is mijn passie voor wijn zo sterk toegenomen dat ik de opleidingen in ben gegaan. Na het halen van WSET 3 merkte ik dat ik niet zo makkelijk een goede, complete bron van informatie kon vinden om door te leren op het niveau waar ik op zat. Dus besloot ik om iets voor mezelf te bouwen, dat is Oenocademy geworden."
              : "I am a wine enthusiast with a background in software development. My passion for wine grew so much over the past few years that I began studying it formally. After completing WSET Level 3, I struggled to find a good, comprehensive source of information to continue learning at my level. So I decided to build something for myself. That became Oenocademy."}{" "}
          </p>
          <p>
            {locale === "nl"
              ? "Initieel was mijn idee om een specifiek curriculum op te zetten voor mezelf, met alleen de onderwerpen waar ik me op dat moment verder in wilde verdiepen. Maar gaandeweg leek het me een steeds mooier idee om een vollediger platform te bouwen waarin zoveel mogelijk wijnkennis beschikbaar is, en je op verschillende manieren door de kennis heen kan navigeren."
              : "Initially, I wanted to create a personal curriculum covering the topics I was keen to study next. Over time, the idea grew into a broader platform that makes wine knowledge available through several different ways of exploring and learning."}{" "}
          </p>
        </section>
        <section>
          <h2>AI disclaimer</h2>
          <p>
            {locale === "nl"
              ? "Het is je vast niet ontgaan: AI is al een paar jaar de wereld in rap tempo aan het veranderen. Ik zou dit platform niet in mijn eentje kunnen maken zonder de mogelijkheid om verschillende AI modellen aan het werk te zetten om informatie te zoeken, te valideren, teksten te schrijven en allerlei andere taken uit te voeren die anders vele malen zo lang zouden duren. Hoewel alles voor publicatie eerst door mij en andere wijnfanaten gelezen wordt, weet dus dat ik de teksten niet zelf heb geschreven. Ik heb de AI werkprocessen zo opgezet dat alle tekst meerdere keren tegen externe bronnen gecheckt wordt, dus als leerplatform heb ik vertrouwen in de correctheid van het materiaal. Mocht je toch iets zien dat niet klopt, laat het dan vooral weten!"
              : "AI has been changing the world rapidly for several years. I could not build this platform alone without using AI models to find and verify information, write text and carry out tasks that would otherwise take much longer. Although other wine enthusiasts and I read everything before publication, the texts themselves are AI-written. The workflows check the material against external sources several times, which gives me confidence in its accuracy as a learning resource. If you spot something that is wrong, please let me know!"}{" "}
          </p>
        </section>
      </article>
    </main>
  );
}
