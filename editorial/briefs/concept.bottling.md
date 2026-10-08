# Contentbrief — Stabilisatie en botteling

Datum: 2026-10-07. Ticket: EXP-021. Archetype: concept-system-overview.

## Belofte, ownership en dependencies

De bestaande `concept.bottling` verbindt voorbereiding, drie soorten stabiliteit,
scheiding, gasbeheer en verpakking. Alle negen bestaande block-ID's, entity-ID,
route en Nederlandse alias blijven behouden. Fining en SO₂ houden hun eigen
mechanisme-eigenaars; latere flesontwikkeling blijft bij EXP-025. Geen extra hub
of nieuwe satelliet nodig. Dependencies: clarification-and-fining, sulfur-dioxide,
oxidation, assemblage en estate-bottling; alle bestaan en blijven gelinkt.

## Outline vóór prose

| Coverage / block | Vraag | Bronnen | Diepte |
| --- | --- | --- | --- |
| identity-and-scope / klaar-voor-verpakken | Wat betekent klaar voor verpakking? | AWRI pre-packaging/specifications | foundation |
| system-components-and-relationships / schone-overdracht | Welke schakels moeten samen beheerst worden? | AWRI microbiological stability; OIV filtration | foundation |
| mechanisms-and-interactions / werking | Hoe verschillen microbiële, eiwit- en tartraatstabiliteit? | AWRI microbiology, heat stability, cold stabilisation | foundation; intermediate tartraattest |
| conditions-and-variation / omstandigheden-en-variatie | Wat veranderen samenstelling, gas en distributie? | AWRI gas adjustment, microbiology | foundation; intermediate CO₂ |
| decisions-and-trade-offs / keuzes-en-afwegingen | Wat kies je tussen bezinken, fining en filtratie? | OIV filtration; AWRI fining, specifications | foundation; intermediate filterdoel |
| global-context-and-examples / wereldwijde-context | Welke globale bronnen tonen het verschil tussen doel en uitvoering? | OIV filtration; AWRI screw caps | foundation |
| evidence-and-limits / bewijs-en-grenzen | Wat toont een test wel en niet? | AWRI heat stability, specifications | foundation; advanced testcondities |
| practical-interpretation / betekenis-voor-wijn | Wat zegt een technische fiche over de fles? | AWRI specifications, microbiology | foundation |

Bestaande zuurstof- en sluitingsblokken blijven staan, met de basis zichtbaar
op foundation. Een apart intermediate blok onderscheidt opgeloste zuurstof en
kopruimte (AWRI TPO). Geen doseringsrecept, filtermaat, wettelijke limiet of
garantie op houdbaarheid. Koudebehandeling van kaliumwaterstoftartraat is geen
algemene oplossing voor calciumtartraat; testen en middelen horen bij hun doel.

## Bronnen en gerichte review

Primaire bronnen geopend: AWRI pre-packaging, microbiological stability, SO₂,
heat stability, cold stabilisation, gas adjustment, pre-bottling specifications,
screw caps en total package oxygen; OIV filtration. Bestaande finingpagina
behoudt haar brongebonden mechanisme. Nieuwe bronrecords voor de zes gerichte
AWRI-publicaties. Geen landelijk marktaandeel afgeleid uit wedstrijdinzendingen.

SO₂ krijgt een contextuele link naar bottling. De les cellar-to-bottle verwijst
voor het stabiliteitsmodel naar de bestaande owner en behoudt haar korte
introductie. Klaring/fining blijft inhoudelijk behouden na overlapcontrole.

Correctie: de bestaande algemene uitspraak dat wijn na botteling moet herstellen
van mechanische behandeling vervalt. De geraadpleegde bronnen rechtvaardigen
geen universele herstelduur of verplichte 'bottle shock'. Bewaring en sluiting
blijven wel relevant; latere ontwikkeling is geen scope van deze hub.

## Visual teaching contract

Hergebruik `media.lesson.cellar-to-bottle.final-preparation-and-bottling`, de
bestaande PNG in redactionele aquarelstijl. Drie zichtbare groepen — proefwerk,
voorbereiding en bottelen — corresponderen met een NL/EN-HTML-opsomming naast
het beeld. Geen verplichte volgorde of bewering dat elk filter alle risico's
oplost. De tabel benoemt de drie stabiliteitsvragen ook zonder afbeelding.
Controleer beeld en tabel op 390/1440 px, beide talen, diepte en oude anchors.

## Publicatiecontrole

- [x] Outline, ownership, bronplan en dependencies vóór prose vastgelegd.
- [x] NL/EN, claims, companions en oude anchors gecontroleerd.
- [x] Contentchecks, applicatiechecks en browsertests geslaagd.
- [x] Mobiele en desktopweergave visueel gecontroleerd.
- [x] Roadmaps, onderhoudsacties en reviewregister bijgewerkt.


## Eindcontrole — 2026-10-07

- NL/EN hebben dezelfde 20 blocks en kennisdiepte; alle negen oude ankers zijn
  behouden. Acht systeemdimensies in het gevalideerde contentplan. Geen nieuwe
  concepts of mediabytes; zes aanvullende primaire AWRI-bronrecords.
- Klaring/fining en estate-bottling inhoudelijk gereviewd en behouden. SO₂ en
  cellar-to-bottle hebben gerichte naslaglinks naar de bottling-owner gekregen;
  maturation-and-protection behoudt de bestaande grens met bottelvoorbereiding.
- Algemene verplichte hersteltijd na bottelen verwijderd; geen nieuw recept,
  garantie op houdbaarheid of universele filter-/SO₂-specificatie toegevoegd.
- Vier nieuwe E2E-tests toetsen NL/EN, kennisdiepte, oude anchors/alias, leslinks,
  responsieve overloop en inhoud zonder JavaScript. De volledige suite slaagt
  met 125 tests; na de compacte tabelredactie slagen 21 gerichte tests opnieuw.
- Format, check (148 unit-tests), contentvalidatie, relatieaudit en webpackbuild
  geslaagd. Link-/taalaudits zijn uitgevoerd als redactionele reviewvoorraad.
- Visuele NL/EN-review op 390 en 1440 px: de tabel past op desktop en scrolt
  binnen haar eigen kader op mobiel; PNG en HTML-uitleg zijn leesbaar. Geen
  browserconsolefouten. De bestaande globale nowrap-stijl is behouden.
- EXP-021 afgerond, volgende EXP-022. Onderhoud en dependencytriage staan
  afzonderlijk in QCR-2026-10-07-01 en MNT-057; MNT-055 blijft zichtbaar open.
