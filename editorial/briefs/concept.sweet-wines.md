# Contentbrief — Zoete wijnen

Datum: 2026-10-08  
Roadmapticket: `EXP-029`  
Package: `concept.sweet-wines`  
Archetype: `concept-system-overview`

## Paginabelofte en ownership

Voorkennis: gewone betekenis van druif, most en wijn; gisting wordt kort uitgelegd.

Deze pagina is de canonical eigenaar van de samenhang tussen druifconcentratie, restsuiker, gisting, zoetheidsaanduidingen en stabiliteit bij zoete wijn.

Appassimento, passerillage, botrytis en versterken houden hun mechanisme; Spätlese bezit de Duitse oogstterm. Wijnsamenstelling en sensorische interacties volgen in EXP-024/025.

Zelfstandige familiepagina; verwante families hebben ieder hun eigen scope.
Entitytoets: eigen zoekvraag, uitgebreide samenhang boven compact hubniveau, meerdere herbruikbare relaties en een eigen bronnen-/onderhoudslifecycle. Door de gebruiker goedgekeurd in DEC-EXP-006.

## Coverage, outline en bewijsplan

| Coverage | Block | Lezersvraag | Bronnen |
| --- | --- | --- | --- |
| identity-and-scope | overzicht | Wat maakt wijn zoet, en hoe overlapt dit met bruis en versterken? | source.dwi-wine-taste-categories, source.oiv-fermentation-interruption |
| system-components-and-relationships | opbouw-en-samenhang | Hoe hangen druif, gisting, restsuiker en stabiliteit samen? | source.sanmartin-postharvest-water-loss-2021, source.awri-microbiological-stability |
| mechanisms-and-interactions | werking | Welke routes concentreren suiker en welke behouden of voegen suiker toe? | source.dwi-praedikate, source.blanco-ulate-noble-rot-2015, source.sanmartin-postharvest-water-loss-2021, source.oiv-fermentation-interruption, source.champagne-dosage, source.ivdp-port-vinification |
| conditions-and-variation | omstandigheden-en-variatie | Hoe veranderen fruitgezondheid, droogomstandigheden en gisting de uitkomst? | source.sanmartin-postharvest-water-loss-2021, source.blanco-ulate-noble-rot-2015 |
| decisions-and-trade-offs | keuzes-en-afwegingen | Welke afwegingen horen bij concentreren, onderbreken en bottelen? | source.awri-microbiological-stability, source.oiv-fermentation-interruption |
| global-context-and-examples | wereldwijde-context | Wat tonen Duitsland, Italië, Frankrijk, Portugal en Zuid-Afrika? | source.dwi-praedikate, source.masaf-pantelleria-specification-2024, source.ivdp-port-vinification, source.wosa-wine-styles |
| evidence-and-limits | bewijs-en-grenzen | Wat bewijzen oogstterm, suikeranalyse en etiket elk afzonderlijk? | source.dwi-wine-taste-categories, source.german-wine-law-pradikate-2026 |
| practical-interpretation | betekenis-voor-wijn | Welke gegevens helpen een concrete zoete wijn begrijpen? | source.dwi-wine-taste-categories, source.dwi-praedikate, source.champagne-dosage |

Alle acht secties zijn foundation. Detail `concentratie-en-restsuiker` hoort bij `werking` op intermediate: Concentratie vóór gisting en suiker ná gisting hebben verschillende meetmomenten. Algemene synthese gebruikt bestaande gereviewde bronnen; plaatselijke en juridische claims krijgen een directe citation. Geen universele druk-, suiker-, alcohol- of rijpingsgrenzen. Sensorische samenhang wordt alleen kort benoemd; EXP-025 bezit de volledige waarnemingsuitleg.

## Wereldwijde voorbeelden en dependencies

Duitsland: Eiswein en Spätlese onderscheiden grondstof, oogstterm en smaak. Italië: passito en droge appassimento-uitkomst. Portugal: zoete Port door versterken. Zuid-Afrika: Noble Late Harvest als lokale botrytiscontext.

Vervangingstest: de procesuitleg blijft gelden als het bekendste regionale voorbeeld vervangen wordt; lokale regels worden niet geëxtrapoleerd.

Hergebruik en contextlinks: `concept.sparkling-wines`, `concept.fortified-wines`, `concept.fermentation`, `concept.late-harvest`, `concept.passerillage`, `concept.appassimento`, `concept.botrytis`, `concept.fortification`, `concept.dosage`, `concept.bottling`, `concept.spatlese`, `concept.passito`, `concept.vin-de-paille`. Geen aanvullende procesentities nodig voor deze scope. Individuele wijnnamen gaan naar EXP-032; bestaande appellations, regio’s en concepts eerst inventariseren.

## Visual teaching contract

Twee scènes onderscheiden concentratie vóór vergisting en de daaropvolgende gisting; de waterslotillustratie toont ontsnappend gas, geen aanwijzing voor mousserende wijn. Geen universele oorzaak van zoetheid of aroma.

Nieuwe PNG in de aquarel-/gouachehuisstijl via ingebouwde imagegen. Geen bronbeeld of geografie. Gelokaliseerde HTML-opsomming verklaart iedere scène. Afbeelding moet ook op 390 px herkenbaar zijn; alttekst en volledige uitleg blijven zonder JavaScript beschikbaar. De definitieve prompt wordt hier vóór publicatie bewaard.

## Publicatiecontrole

- [x] Scope, entitytoets, acht vragen, dependencies en bewijsplan vóór prose vastgelegd.
- [x] NL/EN, claims, ownership en links gereviewd.
- [x] PNG, alttekst, mobiele en desktopweergave gecontroleerd.
- [x] Format, check, contentvalidatie en relevante E2E geslaagd.

## Aanvullende juridische broncontrole

Zoetheidsaanduidingen worden direct gedragen door `source.eu-wine-sugar-labelling-2025`: EU 2019/33, geconsolideerd 18 januari 2025, artikelen 47/52 en bijlage III A/B. Op EUR-Lex geopend op 2026-10-08; de actuele versie verwijst naar deze consolidatie. Het oudere bronrecord over druivenetikettering blijft bewaard. DWI/Champagne geven context; de regulator draagt de formele categorieclaim. Geen universele suikergrens toegevoegd.

## Definitieve beeldprompt

Via ingebouwde imagegen; gegenereerde illustratie, geen factual bron.

```text
Use case: scientific-educational. Asset type: Oenocademy educational PNG, landscape 1536×1024. Primary request: a refined watercolor and gouache comparative plate showing two separate decision moments in making sweet wine. Vignette 1 left: fresh golden grape bunch beside visibly wrinkled golden grapes on a low wooden drying tray. Vignette 2 right: a glass fermentation vessel holding golden grape must with a discreet small stream of escaping gas and a small stemmed glass of golden wine nearby. Exactly the small numerals "1" and "2" above the respective vignettes, no other text. The two scenes compare grape concentration before fermentation with what fermentation does afterwards; no arrows or implied automatic sweetness. Warm ivory paper, muted olive, straw gold, burgundy marks, delicate ink, large readable objects, restrained natural shadows, generous space, calm editorial naturalist style. No raisins in the finished wine, no sugar cubes, no measured scales, no recipe, no logos, no vector look, no decorative vineyard scenery.
```

## Eindcontrole — 2026-10-08

Review-ID: QCR-2026-10-08-02. Iedere familie heeft acht inhoudelijke secties,
één intermediate detail, één PNG, gelokaliseerde toelichting en kernidee.
NL/EN bevatten dezelfde block-ID's, linktargets, bronnen en inhoudelijke nuances.
De familie bezit samenhang; bestaande technieken en termen houden hun detail.

De drie nieuwe PNG's zijn fysiek en didactisch beoordeeld: duidelijke verse/
gedroogde druiven en gasafvoer, gesloten fles/tank en externe CO₂-bron, spirit
en schematische vatdoorsneden met/zonder flor. Geen meetrecept, rangorde,
geografische reconstructie of smaakgarantie. Nummers hebben complete NL/EN-HTML.
Elke PNG is 1536×1024 en circa 3,1 MB; opslag en checksum staan in het mediarecord.
De media-/performancebegroting blijft het bestaande MNT-052-werk.

Browserreview op 390×844 en 1440×1000 in beide talen: titels, lopende tekst,
kennisdiepte, navigatie en illustraties sluiten aan op de huisstijl. Tabellen
scrollen binnen hun eigen kader; geen paginaoverloop of browsermeldingen.
Ook 768 px wordt door E2E afgedekt. Screenshotbewijs van de Nederlandse
desktopweergave: `/tmp/oenocademy-family-desktop.png`.

Pipeline: 358 entities, 294 actief, 64 draft, 597 bronnen, 187 media en
1334 forwardrelations. Eén nieuw bronrecord voor de juridische labels.
De read-only linkaudit geeft 988 kandidaten (219 nieuw, 766 pending, 3
false-positive); dit zijn redactionele koppelkansen, geen kapotte links.
EXP-026 controleert de bredere integratie; individuele wijnen volgen EXP-032.

Format, check, lint, typecheck, alle 148 unit-tests en relationele audit slagen.
De volledige productie-E2E-suite heeft 144 geslaagde tests. Na laatste
tekst-/bronredactie zijn build en alle 15 familie-E2E-cases opnieuw geslaagd.
De negen toegevoegde browsercases controleren zelfstandige routes, zoekresultaten,
PNGs, kennisdiepte, bestaande proceslinks, aliasroutes, anchors, responsieve
overloop en volledige uitleg zonder JavaScript. De productiepreview op 3101
wordt met deze build hervat. EXP-024 is de volgende inhoudelijke taak.
