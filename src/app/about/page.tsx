import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Over Oenocademy",
  description:
    "Lees waarom Oenocademy is gebouwd en hoe leren, vrije verkenning, bronnen en geografische data samenkomen in één wijnkennisplatform.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page-shell">
      <article className="about-copy">
        <section>
          <h2>Waarom bestaat Oenocademy?</h2>
          <p className="mb-4">
            Ik ben een wijnenthousiast met een achtergrond in software development. De afgelopen
            jaren is mijn passie voor wijn zo sterk toegenomen dat ik de opleidingen in ben gegaan.
            Na het halen van WSET 3 merkte ik dat ik niet zo makkelijk een goede, complete bron van
            informatie kon vinden om door te leren op het niveau waar ik op zat. Dus besloot ik om
            iets voor mezelf te bouwen, dat is Oenocademy geworden.
          </p>
          <p>
            Initieel was mijn idee om een specifiek curriculum op te zetten voor mezelf, met alleen
            de onderwerpen waar ik me op dat moment verder in wilde verdiepen. Maar gaandeweg leek
            het me een steeds mooier idee om een vollediger platform te bouwen waarin zoveel
            mogelijk wijnkennis beschikbaar is, en je op verschillende manieren door de kennis heen
            kan navigeren.
          </p>
        </section>
        <section>
          <h2>AI disclaimer</h2>
          <p>
            Het is je vast niet ontgaan: AI is al een paar jaar de wereld in rap tempo aan het
            veranderen. Ik zou dit platform niet in mijn eentje kunnen maken zonder de mogelijkheid
            om verschillende AI modellen aan het werk te zetten om informatie te zoeken, te
            valideren, teksten te schrijven en allerlei andere taken uit te voeren die anders vele
            malen zo lang zouden duren. Hoewel alles voor publicatie eerst door mij en andere
            wijnfanaten gelezen wordt, weet dus dat ik de teksten niet zelf heb geschreven. Ik heb
            de AI werkprocessen zo opgezet dat alle tekst meerdere keren tegen externe bronnen
            gecheckt wordt, dus als leerplatform heb ik vertrouwen in de correctheid van het
            materiaal. Mocht je toch iets zien dat niet klopt, laat het dan vooral weten!
          </p>
        </section>
      </article>
    </main>
  );
}
