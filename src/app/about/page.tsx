import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Over Oenocademy",
  description:
    "Lees waarom Oenocademy is gebouwd en hoe leren, vrije verkenning, bronnen en geografische data samenkomen in één wijnkennisplatform.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow="Over Oenocademy" title="Vind je eigen weg door de wereld van wijn">
        <p>
          Oenocademy helpt wijnstudenten en nieuwsgierige liefhebbers verder na een eerste opleiding
          of introductie, zonder kennis op te sluiten in één vast curriculum.
        </p>
      </PageIntro>

      <article className="about-copy">
        <section>
          <h2>Waarom dit platform bestaat</h2>
          <p>
            Na een formele of informele basis ontbreekt vaak een heldere route voor verdere
            verdieping. Informatie bestaat wel, maar is verspreid, wisselend onderbouwd en zelden
            met elkaar verbonden. Oenocademy brengt onderwerpen, uitleg en bronnen samen in één
            kennisbank.
          </p>
        </section>
        <section>
          <h2>Ontdekken, Leren en Atlas</h2>
          <p>
            Ontdekken ondersteunt vrije kennisnavigatie. Leren ordent delen van dezelfde kennis tot
            doordachte leerroutes. Atlas voegt daar uiteindelijk een geografische manier van
            verkennen aan toe, op basis van gecontroleerde kaartgegevens.
          </p>
        </section>
        <section>
          <h2>Diepte zonder dubbele pagina’s</h2>
          <p>
            Je kunt beginnen bij de basis en later steeds verder verdiepen. Zo blijft één onderwerp
            bruikbaar voor zowel nieuwsgierige liefhebbers als ervaren wijnstudenten, zonder kennis
            onnodig te verdubbelen.
          </p>
        </section>
        <section>
          <h2>Talen, bronnen en geografische nauwkeurigheid</h2>
          <p>
            Nederlands en Engels delen dezelfde zorgvuldig beheerde kennis; uitleg en labels worden
            per taal geschreven. Veranderlijke informatie krijgt een duidelijke bronvermelding.
            Grenzen en locaties verschijnen alleen wanneer betrouwbare geografische gegevens
            beschikbaar zijn.
          </p>
        </section>
        <section>
          <h2>Onafhankelijk en corrigeerbaar</h2>
          <p>
            Oenocademy is redactioneel onafhankelijk en niet verbonden aan WSET of een andere
            formele opleidingsaanbieder. Bestaande niveaus kunnen alleen als referentie voor
            voorkennis dienen. In de toekomst kunnen lezers correcties en aanvullingen voorstellen;
            publicatie volgt pas na redactionele controle.
          </p>
        </section>
      </article>
    </main>
  );
}
