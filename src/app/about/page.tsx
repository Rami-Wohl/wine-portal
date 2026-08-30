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
      <PageIntro eyebrow="Over Oenocademy" title="Eén kennisnetwerk, verschillende manieren om te navigeren">
        <p>
          Oenocademy helpt wijnstudenten en nieuwsgierige liefhebbers verder na
          een eerste opleiding of introductie, zonder kennis op te sluiten in
          één vast curriculum.
        </p>
      </PageIntro>

      <article className="about-copy">
        <section>
          <h2>Waarom dit platform bestaat</h2>
          <p>
            Na een formele of informele basis ontbreekt vaak een heldere route
            voor verdere verdieping. Informatie bestaat wel, maar is verspreid,
            wisselend onderbouwd en zelden verbonden. Oenocademy organiseert die
            kennis rond gedeelde entities, relaties, narratives en bronnen.
          </p>
        </section>
        <section>
          <h2>Ontdekken, Leren en Atlas</h2>
          <p>
            Ontdekken ondersteunt vrije kennisnavigatie. Leren ordent delen van
            hetzelfde netwerk tot pedagogische routes. Atlas toont uiteindelijk
            de geografische dimensie via geverifieerde GIS-data. Geen van deze
            modi bezit een afzonderlijke versie van de feiten.
          </p>
        </section>
        <section>
          <h2>Diepte zonder dubbele pagina’s</h2>
          <p>
            Kennis kan lopen van foundation tot specialist. Die niveaus zijn
            metadata voor progressieve verdieping, geen reden om hetzelfde
            onderwerp in meerdere los onderhouden pagina’s te dupliceren.
          </p>
        </section>
        <section>
          <h2>Talen, bronnen en geografische nauwkeurigheid</h2>
          <p>
            Nederlands en Engels delen canonical feiten, relaties en geografie;
            uitleg en labels worden gelokaliseerd. Veranderlijke claims moeten
            naar herbruikbare bronnen verwijzen. Grenzen en locaties verschijnen
            alleen wanneer gecontroleerde geografische data beschikbaar is.
          </p>
        </section>
        <section>
          <h2>Onafhankelijk en corrigeerbaar</h2>
          <p>
            Oenocademy is redactioneel onafhankelijk. Opleidingsniveaus zoals die
            van WSET kunnen uitsluitend als zelfstandig referentiepunt voor
            voorkennis worden gebruikt; er is geen affiliatie of endorsement en
            proprietary cursusmateriaal wordt niet gereproduceerd. Een latere
            correctieworkflow zal voorstellen verzamelen zonder canonical data
            rechtstreeks door gebruikers te laten overschrijven.
          </p>
        </section>
      </article>
    </main>
  );
}
