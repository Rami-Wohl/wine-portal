# Vinificatie: scope, samenhang en eigenaarschap — 2026-10-03

Review-ID: `QCR-2026-10-03-01`

Roadmapticket: `EXP-016`

Repositorybaseline: `de2669d` (`feat: vineyard systems and sustainability`)

Status: afgeronde architectuur- en contentinventaris; authoring volgt in EXP-017–023.

## 1. Reikwijdte en methode

Deze audit bepaalt waar de bestaande vinificatiekennis thuishoort en welke
overzichtspagina's nog nodig zijn. De primaire inputs zijn de canonical
`entity.yaml`, `narrative.yaml` en NL/EN-Markdown, plus de gekoppelde source- en
mediarecords. De runtimebundle is geen bron voor redactionele beslissingen.

Geïnventariseerd zijn 29 conceptpackages: 25 actieve begrippen en vier lege
drafts. Daarnaast zijn alle zeven actieve lessen van het eerste leerpad
meegenomen. Dat zijn 36 packages, 72 localebestanden, 331 NL-contentblocks
(256 bij concepts, 75 bij lessen), 63 unieke package-source-ID's en 27 unieke
media-ID's. Lege drafts hebben geen contentblocks. De inventaristabel onderaan
maakt de selectie controleerbaar; dit is geen telling van alle concepts in het
platform.

De Nederlandse kernpagina's, methodefamilies en lessen zijn gelezen op
onderwerp, overlap, hiaten en procesvolgorde. Botrytis is als bestaande
wijngaard/kelderdependency op scope en koppelingen meegenomen. Voor Engels zijn
blockstructuur, depth, media, gebruikte source-ID's en entitymentions vergeleken;
identiteit en scope van de te behouden hoofdowners en afwijkende linkpassages
zijn inhoudelijk nagelezen. Dit is geen nieuwe volledige vertaal- of claimreview.

De graphcontrole onderscheidt geschreven relaties, afgeleide inverse
verbindingen en mentions in actieve NL-proza. Een nul bij uitgaande relaties
betekent niet dat een pagina geïsoleerd is. Bronbeoordeling betreft aanwezige
dekking en noodzakelijke vervolgvragen: externe bronnen, actuele regelgeving
en iedere afzonderlijke wijnclaim zijn in deze audit niet opnieuw geverifieerd.
De authoringtickets moeten bronnen openen en claims opnieuw beoordelen voordat
zij uitleg uitbreiden. Er zijn hier geen nieuwe wijnfeiten gepubliceerd.

## 2. Besluit: zeven hubs, vier nieuwe packages

De kleinste werkbare set omvat zeven systeemhubs voor EXP-017–023. Drie bouwen
voort op bestaande identities: `fermentation`, `elevage` en `bottling`. Vier
hebben een nieuwe systeemvraag. Een extra algemene vinificatiepagina zou de
routehub dupliceren; een afzonderlijke gist-, rijpings- of afwerkingshub zou
juist bestaande owners verdubbelen.

De actuele afspraken staan in
[`explore-foundation-coverage.md`, §8](../docs/explore-foundation-coverage.md#8-canonical-owners-en-vinificatiebesluiten).
Onderstaande tabel bewaart het besluit van deze audit. Nieuwe IDs zijn
planningsbestemmingen, nog geen bestaande entities of publieke links. Het
uitvoerende ticket maakt zijn package en noodzakelijke dependencies vóór proza;
deze audit maakt geen lege publieke pagina's.

| Ticket | Canonical systeemowner | Centrale vraag en grens |
| --- | --- | --- |
| EXP-017 | **Nieuw:** `concept.grape-reception-must-preparation` | Deze pagina is de canonical eigenaar van ontvangst, selectie en voorbereiding van druiven/most tot de start van de gekozen vergisting. Zij bezit transport, sorteren, ontstelen, kneuzen, keuze voor intact materiaal, sapbehandeling en de afweging rond mostcorrecties. Persmechaniek blijft bij `pressing`, oogstbesluit bij `berry-development-ripeness`, de vergelijking van volledige routes bij EXP-019. |
| EXP-018 | **Uitbreiden:** `concept.fermentation` | Deze pagina is de canonical eigenaar van alcoholische vergisting, gistecologie, startkeuze, voeding, verloop, monitoring en onbedoeld vastlopen. MLF blijft bij `malolactic-fermentation`; brede kelderhygiëne en bederfdiagnose bij EXP-022. Een aparte gist/microbiologiehub is niet nodig. |
| EXP-019 | **Nieuw:** `concept.winemaking-routes` | Deze pagina is de canonical eigenaar van het vertakkende procesoverzicht en de vergelijking tussen wit, rosé, rood en schilvergist wit, inclusief de aansluiting op latere kelderfasen en methodefamilies. De volledige mechanismen blijven bij `fermentation`, `maceration`, `extraction` en `pressing`. |
| EXP-020 | **Uitbreiden:** `concept.elevage` | Deze pagina is de canonical eigenaar van de samenhang tussen vat, tijd, zuurstofbeheer, overhevelen, bijvullen, lies, MLF en assemblage tijdens opvoeding. De bestaande gerichte concepts behouden hun mechanismen. Geen tweede `post-fermentation`- of `maturation`-hub. |
| EXP-021 | **Uitbreiden:** `concept.bottling` | Deze pagina is de canonical eigenaar van de beslisroute voor bottelvoorbereiding, stabiliteit, filtratie, opgeloste gassen, verpakking en sluiting. Eiwit-, tartraat- en microbiële stabiliteit krijgen herkenbare secties. Fining blijft bij `clarification-and-fining`, SO₂ bij `sulfur-dioxide`, latere flesontwikkeling bij EXP-025. Geen aparte afwerkingshub. |
| EXP-022 | **Nieuw:** `concept.cellar-hygiene-wine-faults` | Deze pagina is de canonical eigenaar van preventie, hygiëne, monitoring en het onderscheiden van foutfamilies, stijl en diagnostische onzekerheid. Oxidatiechemie blijft bij `oxidation`; SO₂-werking bij `sulfur-dioxide`; gistkinetiek bij `fermentation`. |
| EXP-023 | **Nieuw:** `concept.sweet-sparkling-fortified-wines` | Deze pagina is de canonical eigenaar van de vergelijking van routes naar restsuiker, mousse en versterking, met de samenhang tussen grondstof, vergisting en verdere rijping. Eén vergelijkende hub met drie herkenbare families volstaat; de bestaande methodeconcepts dragen detail. |

Alle zeven krijgen bij authoring `concept-system-overview` en de acht vereiste
coveragevragen. Een bestaande pagina wordt pas als herziene hub aangemerkt
wanneer haar contentplan en publication gate compleet zijn. EXP-016 wijzigt dus
de planning, niet de publicatiestatus of titel van bestaande pagina's.

## 3. Plaats in het systeem en tien verplichte owners

Het procesoverzicht wordt bij EXP-019 een vertakkend model. Ontvangst,
vergisting, scheiding, opvoeding en verpakking zijn oriëntatiepunten, geen
verplichte lineaire volgorde voor iedere wijn. De huidige MLF-pagina heeft al
een passage over co-inoculatie (`#verloop-in-de-kelder`); de ligging van dat
onderwerp in EXP-020 mag die timing niet uitwissen. SO₂, hygiëne en zuurstof
zijn aandachtspunten door meerdere fasen heen. Botteling kan bij een
mousserende route ook een tussenstap zijn: `traditional-method` en
`liqueur-de-tirage` bewaren die context.

| Vereist onderwerp | Bestaande canonical owner | Plaats en afbakening | Uitvoerend ticket |
| --- | --- | --- | --- |
| Vergisting | `concept.fermentation` | Van vergistbare most naar jonge wijn; ook mechanisme dat methodefamilies hergebruiken | EXP-018 |
| Extractie | `concept.extraction` | Overdracht en sturing; `maceration` bezit contactduur en contactregime, `tannin` de stoffamilie | EXP-019 |
| Persen | `concept.pressing` | Scheiding en fracties op verschillende momenten; EXP-017 behandelt de vroege toepassing, EXP-019 de routevergelijking | EXP-017, daarna EXP-019 |
| MLF | `concept.malolactic-fermentation` | Bacteriële omzetting, omstandigheden en controle; `elevage` toont de samenhang en bewaart overlap in timing | EXP-020 |
| Élevage | `concept.elevage` | Beslissingen tijdens opvoeding; wordt zelf de systeemhub | EXP-020 |
| Liesrijping | `concept.lees-ageing` | Selectie, duur en beheer van liescontact in vat, tank en fles; geen synoniem voor roeren of celafbraak | EXP-020 |
| Klaring | `concept.clarification-and-fining` | Bezinken, scheiden, fining en proefbehandeling; `bottling` bezit het stabiliteits- en filtratieoverzicht | EXP-021 |
| Oxidatie | `concept.oxidation` | Proces, omstandigheden en stijl/foutgrens; toepassingen vanuit ontvangst, élevage, hygiëne en flesontwikkeling | EXP-020, EXP-022 en EXP-025 als consumers |
| Zwavel | `concept.sulfur-dioxide` | SO₂, vrije/gebonden fracties, pH en controle door de route; geen owner van alle zwavelverbindingen of reductiegeuren | EXP-021; EXP-017/020/022 consumer |
| Botteling | `concept.bottling` | Stabiliteitsbesluit, fysieke overdracht en verpakking; `estate-bottling` bewaart de afzonderlijke herkomst-/verantwoordelijkheidsbetekenis | EXP-021 |

Procesvolgorde hoort in de uitleg en het toekomstige procesbeeld, niet in
verzonnen relationtypes of een `part_of`-keten. `related_to` beschrijft evenmin
een vaste chronologische volgorde. Het bestaande schema is toereikend.

## 4. Overlap en concrete vervolgacties

Iedere bevinding is gekoppeld aan een bestaand EXP-ticket. De audit is afgerond
wanneer eigenaarschap en opvolging vaststaan; het uitvoeren van alle volgende
contentrondes is geen verborgen voltooiingsvoorwaarde van EXP-016.

| Bevinding en bewijsplek | Afspraak / toetsbare vervolgactie | Ticket |
| --- | --- | --- |
| `maceration#tijd-en-beweging` en `extraction#sturen-in-de-kuip` leggen beide pigeage/remontage uit | `extraction` bezit de uitvoeringskeuzes en overdrachtsafweging; `maceration` houdt een korte uitleg van contactbeheer met link. Routehub vergelijkt de plaats, zonder de handleiding te kopiëren. | EXP-019 |
| `maceration#voor-tijdens-en-na` en `extraction#tijd-temperatuur-en-alcohol` behandelen duur, alcohol en temperatuur | Contactregime en cold soak bij `maceration`; overdracht en niet-lineaire effecten bij `extraction`. Behoud essentiële oriëntatie op beide pagina's. | EXP-019 |
| `pressing#moment-in-de-route`, beide vroege routelessen en `maceration#rood-rose-en-wit` hebben routevergelijkingen | Volledige vergelijking wordt routehub-owned. Controleer directe rosépersing, andere roséroutes en schilvergist wit naast het basismodel; pas lessen pas na bronreview aan. | EXP-017/019 |
| `elevage#werk-in-de-kelder` en `#richting-botteling` bezitten al vrijwel de geplande post-fermentation-scope | Breid dezelfde entity uit met een systeemplan; behoud ID, slugs, bronnen en bruikbare anchors. | EXP-020 |
| `lees-ageing#tijd-en-autolyse`, `autolysis#betekenis` en `batonnage#betekenis-en-werkwijze` leggen verwante maar verschillende processen uit | Behoud alle drie. Liesrijping bezit contactbeheer, autolyse het celmechanisme, bâtonnage de handeling. Maak herhaling kort en verwijzend. | EXP-020 |
| `elevage#voorbereiden-is-geen-uniform-recept`, `bottling#klaar-voor-verpakken` en `clarification-and-fining#filtratie-is-anders` delen voorbereiding | `bottling` wordt beslisowner voor stabiliteit/filtratie; élevage geeft de overgang, klaring bezit fining. Geen extra finishingpackage. | EXP-021 |
| `oxidation#chemie` is compact; bestaande risico's staan verspreid bij lies, MLF, SO₂ en botteling | Verdiep chemie bij `oxidation`; groepeer preventie, reductie, vluchtig zuur, Brett, TCA en ongewenste hergisting bij de hygiënehub. Geen aparte foutentity per aroma zonder entitytoets. | EXP-020/022 |
| `assemblage` gebruikt vooral Bordeaux- en Champagnevoorbeelden; traditionele-methodepagina's steunen sterk op Champagne/Crémant | Voeg bij de relevante herziening passende algemene synthese en contrasterende toepassingen toe. Juridische waarden blijven bij hun herkomst; geen lokale conventie als wereldnorm. | EXP-020/023; hertoets EXP-027 |
| Passerillage, appassimento en vin de paille herhalen droogmechanisme en moeilijke vergisting | `passerillage` bezit algemeen waterverlies; `appassimento` de Italiaanse toepassing/terminologie; `vin-de-paille` de wijnfamilie en beschermde term. Giststress wordt vanuit `fermentation` hergebruikt. | EXP-023 |
| Vijf entitytargets staan uitsluitend in EN-links; de NL-tekst bevat al overeenkomstige begrippen | Review de vijf concrete gevallen hieronder en herstel gelijke vindbaarheid of documenteer een bewuste taalreden. Geen feitelijke vertaalfout aangetoond. | EXP-023, eindcontrole EXP-026 |

De vijf EN-only targets staan bij `disgorgement#betekenis` (`vintage` en
`lees-ageing`), `late-harvest#jaar-en-perceel-beslissen-mee` (`vintage`),
`second-fermentation#druk-en-stijl` (`lees-ageing`) en
`vin-de-paille#naam-en-familie` (`elevage`). Blockstructuur, depth, media en de
sets gebruikte source-ID's zijn in alle 36 packages gelijk tussen NL en EN.
Deze bevindingen betekenen niet dat iedere formulering of citationplaatsing
opnieuw inhoudelijk is goedgekeurd.

## 5. Draftbesluiten en nieuwe begrippen

| Bestaande draft | Besluit en entitytoets | Uitvoering |
| --- | --- | --- |
| `carbonic-maceration` | Behouden als gericht concept: zelfstandige zoekvraag, eigen procesmechanisme en bron, al gelinkt vanuit `maceration`. Onderzoek carbonische/semi-carbonische varianten en de grens met hele trossen en cold soak. | EXP-019 vult en activeert na de gates; bestaande OIV-source is een startpunt. |
| `fortification` | Behouden als gericht concept: zelfstandige techniek met eigen timing, samenstellingsvraag en hergebruik door meerdere methodefamilies. De draft heeft nog geen bronnen; een actieve verwijzing vanuit `grape.muscadelle` maakt de leemte zichtbaar. | EXP-023 onderzoekt, vult en activeert na de gates. |
| `passito` | Behouden als gerichte terminologische kandidaat: eigen zoekvraag, hergebruik vanuit `appassimento` en `vin-de-paille`, eigen verhouding tussen wijnnaam en droogproces. Geen tweede algemene drooghub. | EXP-023 onderzoekt of voldoende zelfstandige uitleg resteert; alleen dan activeren. Anders expliciet niet-destructief consolidatiebesluit met behoud van links/route. |
| `spatlese` | Behouden als gerichte juridische/etiketkandidaat: zelfstandig gezochte term en afzonderlijke juridische onderhoudslifecycle. De verwijzing vanuit `late-harvest` is geen bewijs dat dit een universele productieroute is. | EXP-023 beoordeelt officiële Duitse bronnen, exacte scope en compacte uitleg; tot dan draft. |

Sorteren, ontstelen, kneuzen, hele trossen en mostbezinking krijgen aanvankelijk
secties bij EXP-017. Gistvoeding en vastgelopen vergisting blijven binnen
`fermentation`; pigeage/remontage binnen `extraction`; vatkeuze, topping en
overhevelen binnen `elevage`; stabiliteitstypen, filtratie en sluitingen binnen
`bottling`. Nieuwe satellites vereisen per geval minstens twee signalen uit de
entitytoets. De bestaande drafts worden niet verwijderd of stilzwijgend actief.

## 6. Graph en lessen

Binnen uitsluitend de 29 geselecteerde concepts vormen de ongerichte
structurele verbindingen drie componenten: 21 kern-/mousserende concepts,
zeven droog-/oogstconcepts en de fortificationdraft. Dit is een beperkte
deelgraaf, geen claim dat die pagina's in het hele platform onbereikbaar zijn.
Proza verbindt de droogfamilie al met vergisting en élevage; regionale en
druifrelaties liggen bovendien buiten deze selectie.

De uitbreiding krijgt daarom bij authoring doelgerichte, eenmaal opgeslagen
hubverbindingen. De routehub verbindt ontvangst, vergisting, schilcontact,
extractie, persen, élevage en botteling; de methodefamiliehub verbindt
vergisting, concentratieroutes, tweede vergisting, traditionele methode en
versterking. De hygiënehub verbindt relevante procesowners en bescherming.
Controleer telkens of de verbinding of inverse al bestaat voordat YAML wordt
toegevoegd. Een documentatietabel is geen opdracht om iedere vermelding in een
`related_to` te veranderen.

`malolactic-fermentation`, `dosage` en `second-fermentation` hebben nul
uitgaande relaties maar respectievelijk acht, drie en drie inkomende geschreven
relaties uit de gehele entityinventaris. Daar hoeft geen kunstmatige
spiegelrelatie bij. De levende coverage matrix verduidelijkt dit punt uit de
oude baseline.

| Bestaande lesson | Bestaande leerfunctie | Canonical aansluiting en vervolg |
| --- | --- | --- |
| `grape-as-raw-material` | Grondstof, rijpheid, gezondheid | `berry-development-ripeness`, `tannin`, `acidity`, `botrytis`; EXP-017 behandelt de ontvangst. EXP-026 controleert contextlinks naar de nieuwere plant-/rijpheidsowners. |
| `grape-to-must` | Sorteren, ontstelen, kneuzen, persen | Nieuwe ontvangsthub en bestaande `pressing`; EXP-017/019 stemmen vereenvoudigde routevoorbeelden af. |
| `alcoholic-fermentation` | Begrijpelijke leervolgorde door vergisting | `fermentation`; EXP-018 vergelijkt scope en brondekking zonder de lesson tot tweede hub te maken. |
| `three-still-wine-routes` | Basismodel wit, rosé en rood | `winemaking-routes`, `maceration`, `extraction`, `pressing`; EXP-019 bewaart de basisfocus maar maakt uitzonderingen vindbaar. |
| `after-main-fermentation` | MLF, lies, overhevelen en bâtonnage | `elevage` en satellites; `#lies-en-autolyse` noemt beide mechanismen nog zonder entitylinks. EXP-020/026 beoordelen die verbindingen en timing. |
| `maturation-and-protection` | Vat, tijd, zuurstof en bescherming | `elevage`, `oxidation`, `sulfur-dioxide`; EXP-020/021 stemmen de uitgebreide owners af. |
| `cellar-to-bottle` | Assemblage, voorbereiding en verpakking | `assemblage`, `clarification-and-fining`, `bottling`, `sulfur-dioxide`; EXP-021 houdt de slotles compact. |

Lesson-ID's, leerpadstappen, volgorde en opgeslagen voortgang blijven behouden.
De architectuur vraagt geen schemawijziging, routeverhuizing of migratie van
Learn-progress. Consumenten zoals `cuvee`, `estate-bottling`, `clairet`,
`grand-vin`, `second-wine`, `acidity`, `tannin`, `methoxypyrazines` en
`volatile-thiols` behouden hun eigen scope; algemene keldermechanismen worden
daar niet opnieuw ondergebracht.

## 7. Bronnen, beelden en onderzoeksopdrachten

De 63 bestaande source-ID's vormen een researchstart, geen bewijs dat alle
toekomstige hubvragen al zijn gedekt. De package-YAML van iedere rij in de
inventaris bewaart de volledige bronlijst. Bij uitbreiding gelden deze gerichte
vragen:

| Ticket | Bestaande startpunten | Benodigde aanvulling of scopecontrole |
| --- | --- | --- |
| EXP-017 | `oiv-grape-preparation`, `oiv-pressing`, `awri-managing-botrytis-fruit-2023` | Onderbouw transport, temperatuur/tijd, intact materiaal, saphelderheid, bescherming en mostbehandeling met geschikte technische/academische bronnen. OIV-praktijkbeschrijvingen bewijzen geen actuele lokale toestemming. |
| EXP-018 | `oiv-alcoholic-fermentation`, `awri-yeast-choice`, `awri-fermentation-temperature`, `awri-stuck-fermentations-2013` | Reviews over gistecologie, voeding en kinetiek; claimgewijs beoordelen of oudere technische stukken voldoende zijn. Geen automatische afkeuring uitsluitend op publicatiejaar. |
| EXP-019 | `oiv-maceration`, `wre-cap-management`, `awri-skin-contact`, `awri-extended-maceration-2019`, `oiv-carbonic-maceration` | Volledige routevergelijking, mechanisme en grenzen carbonische varianten; juridische rosévarianten op hun eigen scope controleren. |
| EXP-020 | AWRI-MLF-reeks, `awri-lees-contact-2020`, `oiv-oak-maturation`, `awri-oak-queries-2013` | Vatmaterialen, zuurstofreacties en interacties onderbouwen met algemene synthese; Bordeaux/Napa/Champagne blijven concrete toepassingen. |
| EXP-021 | `awri-pre-packaging`, `awri-microbiological-stability`, `awri-fining-agents`, `oiv-filtration-wine`, `awri-sulfur-dioxide` | Eiwit-/tartraatstabiliteit, filterdoelen, opgeloste gassen, sluitingen en verpakking; SO₂-doelen niet als universele dosering publiceren. |
| EXP-022 | `awri-wine-faults`, `wine-australia-oxygen-style`, bestaande MLF-/SO₂-bronnen | Nieuwe dekking voor hygiëne, bederforganismen, reductie, VA, Brett, TCA, hergisting en diagnostische grenzen. Een geur alleen krijgt geen bewijsrol. |
| EXP-023 | Champagne-reeks, `sanmartin-postharvest-water-loss-2021`, OIV-passerillage en lokale dossiers | Algemene methodevergelijking buiten Champagne/Bordeaux; tank, carbonatie en andere relevante mousse-/suikerroutes expliciet beoordelen; versterking en biologische/oxidatieve rijping onderzoeken; passito/Spätlese juridisch begrenzen. |

De selectie gebruikt 20 documentaire foto's en zeven educatieve illustraties.
Zes illustraties zijn PNG; één is de bestaande gedeelde SVG
`media.appellation.cremant-de-bordeaux.traditional-method`, gebruikt door
`traditional-method` en `liqueur-de-tirage` binnen deze selectie. De gebruiker
heeft vervanging van oudere SVG's voor een afzonderlijke ronde aangekondigd;
deze audit vervangt dat beeld niet.

Bestaande PNG's over ontvangst, vergisting, de drie stille routes, lies en
bottelvoorbereiding zijn kandidaten voor inhoudelijke herbeoordeling en
hergebruik, geen automatisch goedgekeurde beelden voor uitgebreidere hubs.
De routeplaat met drie stille routes dekt bijvoorbeeld nog niet de volledige
vraag van EXP-019. Nieuwe procesbeelden volgen de rustige PNG-huisstijl,
taalneutrale markeringen en volledige NL/EN-HTML-uitleg. Assemblage en SO₂
hebben geen eigen figure; bij EXP-020/021 wordt eerst de leertaak vastgesteld.

## 8. Controleerbare package-inventaris

Paden zijn `content/entities/concepts/<naam>/` en
`content/narratives/lessons/<naam>/`. Alle bestaande identities blijven behouden.
Blocks tellen de NL-structuur; bronnen tellen package-`source_refs`; media tellen
unieke figuretargets per package. Het zijn dekkingssignalen, geen kwaliteitsscore.

| Concept | Status | Blocks | Bronnen | Media | Primaire vervolgronde / rol |
| --- | --- | ---: | ---: | ---: | --- |
| `fermentation` | active | 10 | 5 | 1 | EXP-018, bestaande hubowner |
| `maceration` | active | 11 | 6 | 1 | EXP-019, contactregime |
| `extraction` | active | 9 | 6 | 1 | EXP-019, overdracht en cap management |
| `pressing` | active | 7 | 1 | 1 | EXP-017/019, scheiding |
| `malolactic-fermentation` | active | 11 | 5 | 1 | EXP-020, zuurconversie |
| `elevage` | active | 11 | 6 | 1 | EXP-020, bestaande hubowner |
| `lees-ageing` | active | 11 | 2 | 1 | EXP-020, contactbeheer |
| `batonnage` | active | 9 | 1 | 1 | EXP-020, oproeren |
| `autolysis` | active | 9 | 2 | 1 | EXP-020, celmechanisme; EXP-023 consumer |
| `oxidation` | active | 7 | 2 | 1 | EXP-020, mechanisme; EXP-022/025 consumer |
| `assemblage` | active | 12 | 5 | 0 | EXP-020, samenstellen |
| `clarification-and-fining` | active | 8 | 4 | 1 | EXP-021, klaring en fining |
| `sulfur-dioxide` | active | 7 | 2 | 0 | EXP-021, bescherming |
| `bottling` | active | 9 | 4 | 1 | EXP-021, bestaande hubowner |
| `second-fermentation` | active | 7 | 2 | 1 | EXP-023, tweede alcoholische vergisting |
| `traditional-method` | active | 7 | 6 | 1 | EXP-023, methode |
| `liqueur-de-tirage` | active | 7 | 3 | 1 | EXP-023, start flesgisting |
| `remuage` | active | 7 | 3 | 1 | EXP-023, depot verplaatsen |
| `disgorgement` | active | 7 | 4 | 1 | EXP-023, depot verwijderen |
| `dosage` | active | 7 | 3 | 1 | EXP-023, afwerking |
| `botrytis` | active | 20 | 8 | 3 | Bestaande biologieowner; EXP-017/023 consumer |
| `late-harvest` | active | 16 | 6 | 2 | EXP-023, timing en etikettering |
| `passerillage` | active | 18 | 4 | 2 | EXP-023, algemeen droogmechanisme |
| `appassimento` | active | 14 | 4 | 2 | EXP-023, Italiaanse toepassing |
| `vin-de-paille` | active | 15 | 5 | 2 | EXP-023, wijnfamilie/term |
| `carbonic-maceration` | draft | 0 | 1 | 0 | EXP-019, gericht concept behouden |
| `fortification` | draft | 0 | 0 | 0 | EXP-023, gericht concept behouden |
| `passito` | draft | 0 | 0 | 0 | EXP-023, termscope onderzoeken |
| `spatlese` | draft | 0 | 0 | 0 | EXP-023, juridische scope onderzoeken |

De zeven lessonpackages hebben in de volgorde van de tabel in §6 respectievelijk
11, 10, 10, 12, 10, 11 en 11 blocks. Samen bevatten ze 75 blocks: 74 foundation
en één intermediate. De vier drafts zijn leeg in beide talen. Bestaande actieve
pagina's mogen worden hergebruikt, maar geen van deze 29 conceptpackages heeft
al een `content-plan.yaml` voor zijn volgende vinificatieronde.

## 9. Overdracht aan EXP-017

De volgende taak maakt `concept.grape-reception-must-preparation` met een
tweetalige brief en systeemcontentplan. Begin bij deze vragen: welke grondstof
komt binnen, wat moet worden beoordeeld, welke delen blijven samen, welke
voorbereiding ondersteunt de gekozen route, en welke bescherming of correctie
heeft welke onderbouwing? Gebruik `berry-development-ripeness`,
`vineyard-hazards-diseases-pests-disorders`, `botrytis`, `pressing`,
`maceration`, `fermentation`, `clarification-and-fining`, `oxidation` en
`sulfur-dioxide` als te beoordelen bestaande dependencies.

Bijzonderheden voor die ronde zijn de grens tussen intacte bes en hele tros,
variatie in persmoment en roséroutes, het onderscheid tussen mostbezinking en
latere wijnstabilisatie, en juridische scope van mostcorrecties. De bestaande
ontvangstillustratie en perspagina krijgen een inhoudelijke hergebruikcheck.
Nieuwe details of links naar nog niet bestaande hubs worden niet vooruitlopend
als gecontroleerde kennis gepubliceerd. Er is geen technische blocker gevonden.

## 10. Afronding en validatie

- De tien verplichte onderwerpen hebben ieder één expliciete owner en plaats.
- Alle 29 geselecteerde concepts en zeven lessen hebben een vervolgrol.
- Zeven hubs zijn afgebakend; drie bestaande identities worden hergebruikt.
- Overlap, vier drafts, vijf linkverschillen en research-/beeldhiaten hebben
  een concrete vervolgronde in bestaande tickets; geen nieuwe MNT-tickets.
- Deze ronde wijzigt alleen redactionele documentatie en planning. Canonical
  content, sources, media, routes, renderer en leerpad blijven ongewijzigd.
- `npm run format` en `npm run check` geslaagd: formatting, lint, typecontrole,
  130 unittests en relation-audit van 283 actieve entities.
- `npm run content:check` geslaagd: 351 entities, acht narratives, één leerpad,
  543 sources en 178 mediarecords. De contentbuild behoudt 1269 geschreven
  relaties.
- Alle 29 inventarisregels afzonderlijk vergeleken met de canonical YAML en
  Markdown: status, blockaantal, sourceaantal, mediaaantal en afwezigheid van een
  bestaand conceptplan kloppen. De 21 lokale documentatielinks in de vier
  gewijzigde documenten zijn gecontroleerd, inclusief de nieuw gebruikte anchors.
- `git diff --check` geslaagd. Er zijn uitsluitend vier documentatiebestanden
  gewijzigd; daarom zijn geen nieuwe tests toegevoegd en geen E2E-tests gedraaid.
  Er is geen gewijzigd browsergedrag om in deze ronde te testen.
- Geen commit of deployment uitgevoerd.
