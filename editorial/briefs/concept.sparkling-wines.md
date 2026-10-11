# Contentbrief — Mousserende wijnen

Datum: 2026-10-08  
Roadmapticket: `EXP-030`  
Package: `concept.sparkling-wines`  
Archetype: `concept-system-overview`

## Paginabelofte en ownership

Voorkennis: gewone betekenis van druif, most en wijn; gisting wordt kort uitgelegd.

Deze pagina is de canonical eigenaar van de routevergelijking tussen flesgisting, tankgisting, voortgezette gisting, transfer en carbonatie, en hun samenhang met liescontact en zoetheid.

Traditional-method, second-fermentation, tirage, remuage, disgorgement, dosage en lees-ageing bezitten hun mechanisme. Herkomst- en individuele stijlregels horen op latere wijnpagina’s.

Zelfstandige familiepagina; verwante families hebben ieder hun eigen scope.
Entitytoets: eigen zoekvraag, uitgebreide samenhang boven compact hubniveau, meerdere herbruikbare relaties en een eigen bronnen-/onderhoudslifecycle. Door de gebruiker goedgekeurd in DEC-EXP-006.

## Coverage, outline en bewijsplan

| Coverage | Block | Lezersvraag | Bronnen |
| --- | --- | --- | --- |
| identity-and-scope | overzicht | Wat verbindt mousserende wijnen en welke voorkennis is nodig? | source.oiv-sparkling-production, source.oiv-carbonated-wines |
| system-components-and-relationships | opbouw-en-samenhang | Hoe verhouden basiswijn, suiker, gist, gas, lies en verpakking zich? | source.champagne-bottling-second-fermentation, source.champagne-dosage |
| mechanisms-and-interactions | werking | Hoe verschillen traditionele, tank-, voortgezette en carbonatieroutes? | source.oiv-sparkling-production, source.oiv-carbonated-wines, source.limoux-ancestral-method, source.champagne-bottling-second-fermentation |
| conditions-and-variation | omstandigheden-en-variatie | Wat veranderen liescontact, grondstof en timing? | source.awri-lees-contact-2020, source.champagne-bottling-second-fermentation |
| decisions-and-trade-offs | keuzes-en-afwegingen | Welke keuzes bepalen gasroute, sedimentverwijdering en zoetheid? | source.champagne-dosage, source.oiv-sparkling-production, source.awri-microbiological-stability |
| global-context-and-examples | wereldwijde-context | Wat laten Champagne, Limoux en Zuid-Afrika zien? | source.champagne-bottling-second-fermentation, source.limoux-ancestral-method, source.wosa-wine-styles |
| evidence-and-limits | bewijs-en-grenzen | Hoe onderscheid je proces, beschermde naam en smaakterm? | source.champagne-dosage, source.oiv-carbonated-wines |
| practical-interpretation | betekenis-voor-wijn | Hoe lees je methode, dosage en rijping op een wijnfiche? | source.champagne-dosage, source.oiv-sparkling-production |

Alle acht secties zijn foundation. Detail `voortgezette-gisting-en-transfer` hoort bij `werking` op intermediate: Voortgezette gisting en transfer verschillen van tweede gisting en verkoop in dezelfde fles. Algemene synthese gebruikt bestaande gereviewde bronnen; plaatselijke en juridische claims krijgen een directe citation. Geen universele druk-, suiker-, alcohol- of rijpingsgrenzen. Sensorische samenhang wordt alleen kort benoemd; EXP-025 bezit de volledige waarnemingsuitleg.

## Wereldwijde voorbeelden en dependencies

Champagne: traditionele route als begrensd lokaal voorbeeld. Limoux: één voortgezette gisting. Zuid-Afrika: Cap Classique plus tank/carbonatie; geen lokale minimumduur als wereldnorm.

Vervangingstest: de procesuitleg blijft gelden als het bekendste regionale voorbeeld vervangen wordt; lokale regels worden niet geëxtrapoleerd.

Hergebruik en contextlinks: `concept.sweet-wines`, `concept.fermentation`, `concept.traditional-method`, `concept.second-fermentation`, `concept.liqueur-de-tirage`, `concept.remuage`, `concept.disgorgement`, `concept.dosage`, `concept.lees-ageing`, `concept.autolysis`, `concept.bottling`. Geen aanvullende procesentities nodig voor deze scope. Individuele wijnnamen gaan naar EXP-032; bestaande appellations, regio’s en concepts eerst inventariseren.

## Visual teaching contract

Drie gescheiden scènes: gesloten kroonkurkfles, gesloten druktank, externe gascilinder aan gesloten vat. Nummers 1–3; geen rangorde of opeenvolgende productielijn.

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
Use case: scientific-educational. Asset type: Oenocademy educational PNG, landscape 1536×1024. Primary request: a calm watercolor and gouache comparison of three routes to wine bubbles, equal separate numbered vignettes. 1: closed thick dark-green wine bottle with crown cap; a separate small glass shows restrained bubbles. 2: a closed stainless steel winery pressure tank with rounded body, closed top and small valve fittings; nearby small glass of bubbling wine. 3: an unbranded grey gas cylinder connected by a thin hose to a closed small stainless wine vessel; nearby small glass of bubbling wine. Exactly small numerals "1", "2", "3" above the respective scenes, no other text. These are separate examples, no connecting arrows, no implied ranking or production line. Warm ivory paper, muted sage, straw gold, slate grey and burgundy marks; believable natural light, restrained fine ink, large simple silhouettes readable at mobile width. No exploding bottle, no open pressurised tank, no map, no brand labels, no measurements, no vector infographic boxes. The illustration compares bottle fermentation, tank fermentation and addition of CO2; HTML supplies all process explanation.
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
