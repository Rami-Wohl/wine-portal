# Contentbrief — Cabernet Sauvignon

Status: uitgevoerd op 2026-09-07.

## Voorkennis, paginabelofte en scope

De lezer hoeft alleen te weten dat wijn van druiven wordt gemaakt. Na deze pagina
kan die Cabernet Sauvignon herkennen als laatrijpend blauw druivenras, zijn
Bordeauxse oorsprong en wereldwijde verspreiding plaatsen, en begrijpen hoe
groeiplaats, rijpheid, wijnbouw, extractie, assemblage en flesrijping het
uiteindelijke stijlbeeld veranderen.

De pagina is geen wereldwijde aanplantstatistiek, klooncatalogus, appellationlijst,
wijngaardhandleiding of garantie dat iedere Cabernet naar zwarte bes en ceder
smaakt. Regionale regels, producenten, jaargangen en afzonderlijke klonen horen in
eigen entities, datasets of narratives zodra dat detail zelfstandig leerwaarde
krijgt.

## Lezersvragen en dekkingsmatrix

| Dimensie | Bestemming | Kennislaag |
| --- | --- | --- |
| Identiteit, naam, betekenis en oorsprong | Op de pagina | Basis tot gevorderd |
| Afstamming uit Cabernet Franc en Sauvignon Blanc | Op de pagina en naar parent entities | Gevorderd |
| Wijnstok, knopvorming, rijping, tros en bes | Op de pagina | Basis tot verdieping |
| Klimaat, water, ligging en bodemfunctie | Op de pagina | Basis tot gevorderd |
| Bordeaux en belangrijke internationale ankers | Op de pagina en naar regio-entities | Basis tot verdieping |
| Structuur, aroma, variatie en flesontwikkeling | Op de pagina | Basis tot gevorderd |
| Wijnbouw, gevoeligheden en klimaatrisico | Op de pagina | Basis tot gevorderd |
| Extractie, vatrijping en assemblage | Op de pagina en naar conceptentities | Basis tot gevorderd |
| Synoniemen, klonen en plantmateriaal | Op de pagina en naar conceptentities | Basis tot gevorderd |
| Etiket en herkenning | Op de pagina | Basis tot gevorderd |
| Actuele hectares, productie en marktprijzen | Gedateerde dataset of narrative | Uitbesteed |
| Alle landen, appellations en klonen | Child entities en catalogi | Uitbesteed |

## Sectie-outline en dieptekeuzes

1. `identiteit-en-oorsprong` — het ras, zijn Bordeauxse wortels en betekenis
   (`foundation`); historische opkomst volgt op `intermediate`, genetische
   afstamming op `advanced`.
2. `wijnstok-en-groeicyclus` — late cyclus, kleine bessen en groeikracht
   (`foundation`); ampelografie volgt op `intermediate`, klonale variatie op
   `advanced`.
3. `klimaat-ligging-en-bodem` — lang seizoen, water en afwatering (`foundation`);
   het rijpheidsvenster en bodemsimplificaties volgen op hogere niveaus.
4. `regios-en-appellations` — Bordeaux en internationale verspreiding
   (`foundation`); belangrijke regionale rollen op `intermediate`, grenzen van
   geografische generalisaties op `advanced`.
5. `wijnstijlen-en-smaakprofiel` — structuur en herkenningspunten (`foundation`);
   groene tonen en flesontwikkeling op hogere niveaus.
6. `wijnbouw-en-gevoeligheden` — rijpheid en ziekterisico's (`foundation`);
   bladerdek en klimaatstress op hogere niveaus.
7. `wijnmaken-en-rijping` — extractie, vat en assemblage (`foundation`), met
   stijlkeuzes en hele trossen op hogere niveaus.
8. `synoniemen-klonen-en-verwantschap` — ras, synoniem en kloon uit elkaar houden
   (`foundation`); selectiesystemen en genetische grenzen op `advanced`.
9. `etiket-en-herkenning` — druifnaam tegenover herkomstnaam (`foundation`), met
   de Europese 85%-regel en veldidentificatie op hogere niveaus.
10. `hedendaagse-ontwikkelingen` — klimaatadaptatie zonder toekomstvoorspelling
    (`foundation` tot `advanced`).

## Bronnen-, claim- en begrippenplan

Plantgrape draagt de Franse rassenbeschrijving, fenologie, gebruikseigenschappen,
gevoeligheden en officiële synoniemenstatus. Het oorspronkelijke onderzoek van
Bowers en Meredith draagt uitsluitend de genetische ouderschapsclaim. UC Davis
ondersteunt de historische verspreiding en de betekenis van klonale selecties.
Wine Australia geeft één gezaghebbende regionale vergelijking buiten Europa; het
CIVB draagt de Bordeauxse rol. *Wine Grapes* fungeert als compacte synthese voor
stabiele internationale en historische context. EU-wetgeving ondersteunt het
concrete etiketteringsvoorbeeld. AWRI draagt de uitleg van groene aroma's en
methoxypyrazinen.

Precieze genetica, officiële synoniemenstatus en etiketteringsdrempels krijgen
directe citations. Algemene stijl- en regiopatronen worden door een kleine
combinatie van overzichtsbronnen gedragen. `Ampelografie`, `methoxypyrazinen` en
`klonale selectie` krijgen draftentities; termen die alleen een handeling binnen
deze uitleg zijn worden bij eerste gebruik gewoon uitgelegd.

## Visualvragen en rechten

- De documentaire foto moet de compacte tros en kleine donkere bessen zichtbaar
  maken, zonder één foto als sluitende rasidentificatie te presenteren. De foto
  van Christophe Eyquem is CC BY 3.0.
- De historische ampelografische plaat moet blad, tros en bes naast elkaar tonen
  en tegelijk duidelijk maken dat moderne identificatie meer vraagt dan kijken.
  De plaat van Jules Troncy uit *L'Ampélographie* is publiek domein.

Beide bestanden worden via stabiele media-ID's gebruikt en vervangen geen
genetische of gecertificeerde identificatie.

## Publication gate

- iedere vaste dimensie is behandeld of concreet uitbesteed;
- ieder zichtbaar kennisniveau voegt verklaring toe in plaats van alleen feiten;
- stijltaal blijft een bandbreedte en geen aromagarantie;
- oorsprong, genetica, gevoeligheden en etikettering zijn passend onderbouwd;
- alle zelfstandig herbruikbare genoemde onderwerpen bestaan als entitypackage;
- NL en EN delen block-ID's, betekenis en visuals;
- mediarechten, bestanden en checksums zijn compleet;
- formatter, contentcheck, linkaudit, lint, typecheck en tests slagen.
