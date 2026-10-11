# Contentbrief — Versterkte wijnen

Datum: 2026-10-08  
Roadmapticket: `EXP-031`  
Package: `concept.fortified-wines`  
Archetype: `concept-system-overview`

## Paginabelofte en ownership

Voorkennis: gewone betekenis van druif, most en wijn; gisting wordt kort uitgelegd.

Deze pagina is de canonical eigenaar van de samenhang tussen versterken, zoetheid, biologische of oxidatieve rijping en wijnfamilies bij versterkte wijn.

Fortification bezit alcoholtoevoeging en timing; oxidation en elevage bezitten algemene rijpingsmechanismen. De familiepagina bezit voorlopig flor/solera-uitleg; individuele Port/Sherry/Madeira/Muscatpagina’s volgen als eigen afgebakende onderwerpen.

Zelfstandige familiepagina; verwante families hebben ieder hun eigen scope.
Entitytoets: eigen zoekvraag, uitgebreide samenhang boven compact hubniveau, meerdere herbruikbare relaties en een eigen bronnen-/onderhoudslifecycle. Door de gebruiker goedgekeurd in DEC-EXP-006.

## Coverage, outline en bewijsplan

| Coverage | Block | Lezersvraag | Bronnen |
| --- | --- | --- | --- |
| identity-and-scope | overzicht | Wat verbindt versterkte wijnen en waar ligt de grens met zoete wijn? | source.oiv-fortification, source.oiv-liqueur-wine |
| system-components-and-relationships | opbouw-en-samenhang | Hoe hangen grondstof, alcoholtoevoeging, suiker en rijping samen? | source.ivdp-port-vinification, source.sherry-fortification, source.sherry-ageing |
| mechanisms-and-interactions | werking | Hoe sturen gisting en alcoholtoevoeging de uitgangswijn? | source.ivdp-port-vinification, source.sherry-fortification |
| conditions-and-variation | omstandigheden-en-variatie | Hoe verschillen biologische en oxidatieve rijpingsomgevingen? | source.sherry-ageing, source.wine-australia-rutherglen |
| decisions-and-trade-offs | keuzes-en-afwegingen | Welke afwegingen horen bij toevoegen, rijpen en mengen? | source.sherry-ageing, source.sherry-fortification |
| global-context-and-examples | wereldwijde-context | Wat tonen Port, Sherry, Pantelleria en Rutherglen? | source.ivdp-port-vinification, source.sherry-fortification, source.masaf-pantelleria-specification-2024, source.wine-australia-rutherglen |
| evidence-and-limits | bewijs-en-grenzen | Hoe onderscheid je techniek, wettelijke categorie en concrete productregels? | source.oiv-liqueur-wine, source.oiv-fortification |
| practical-interpretation | betekenis-voor-wijn | Hoe lees je zoetheid, alcohol en rijping afzonderlijk? | source.ivdp-port-vinification, source.sherry-ageing |

Alle acht secties zijn foundation. Detail `flor-en-solera` hoort bij `omstandigheden-en-variatie` op intermediate: Flor verandert de rijpingsomgeving; solera organiseert fractioneel mengen en kan beide routes dienen. Algemene synthese gebruikt bestaande gereviewde bronnen; plaatselijke en juridische claims krijgen een directe citation. Geen universele druk-, suiker-, alcohol- of rijpingsgrenzen. Sensorische samenhang wordt alleen kort benoemd; EXP-025 bezit de volledige waarnemingsuitleg.

## Wereldwijde voorbeelden en dependencies

Portugal: Port tijdens gisting. Spanje: droge Sherry na gisting, flor versus oxidatief. Italië: gedroogde druif plus versterken. Australië: zoete versterkte Muscat en Muscadelle.

Vervangingstest: de procesuitleg blijft gelden als het bekendste regionale voorbeeld vervangen wordt; lokale regels worden niet geëxtrapoleerd.

Hergebruik en contextlinks: `concept.sweet-wines`, `concept.fortification`, `concept.fermentation`, `concept.elevage`, `concept.oxidation`, `concept.passito`. Geen aanvullende procesentities nodig voor deze scope. Individuele wijnnamen gaan naar EXP-032; bestaande appellations, regio’s en concepts eerst inventariseren.

## Visual teaching contract

Toevoegen van kleurloze spirit als eerste procesvraag; twee schematische vatdoorsneden met en zonder flor als aparte rijpingsvraag. Kleur is illustratief, geen smaak- of categoriebewijs.

Nieuwe PNG in de aquarel-/gouachehuisstijl via ingebouwde imagegen. Geen bronbeeld of geografie. Gelokaliseerde HTML-opsomming verklaart iedere scène. Afbeelding moet ook op 390 px herkenbaar zijn; alttekst en volledige uitleg blijven zonder JavaScript beschikbaar. De definitieve prompt wordt hier vóór publicatie bewaard.

## Publicatiecontrole

- [x] Scope, entitytoets, acht vragen, dependencies en bewijsplan vóór prose vastgelegd.
- [x] NL/EN, claims, ownership en links gereviewd.
- [x] PNG, alttekst, mobiele en desktopweergave gecontroleerd.
- [x] Format, check, contentvalidatie en relevante E2E geslaagd.

## Definitieve beeldprompt

Via ingebouwde imagegen; gegenereerde illustratie, geen factual bron.

```text
Use case: scientific-educational. Asset type: Oenocademy educational PNG, landscape 1536×1024. Primary request: watercolor and gouache educational plate with two clearly separated numbered vignettes showing alcohol addition and subsequent ageing as different decisions. 1: a small clear glass vessel pouring a thin stream of colourless grape spirit into a larger glass vessel half full of ruby wine. 2: side by side two small oak barrels, schematic cutaways: one holding pale golden wine with a thin pale cream layer floating flat at the wine surface, one holding amber wine with exposed surface and air space above. Both barrels physically plausible curved staves, no flowers, foam or bubbles on surface. Exactly small numerals "1" and "2" above scenes, no other text. No arrows implying mandatory sequence, no specific recipe or alcohol thresholds, no brand or region labels. Warm ivory paper, clay oak, muted olive, burgundy, straw gold; fine restrained ink, watercolor textures, natural soft shadows, calm editorial-naturalist style, generous breathing space, large readable forms. The thin layer represents flor conceptually, the other barrel oxidative ageing; both are examples not a depiction of a named actual cellar.
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
