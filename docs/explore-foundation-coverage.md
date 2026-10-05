# Explore foundation coverage matrix

Status: living planning document  
Baseline date: 2026-09-24  
Owner: `docs/explore-foundation-roadmap.md`

Latest vinification ownership audit: 2026-10-03 (`EXP-016`)

Dit document is de uitvoer van `EXP-001`. Het legt vast wat Oenocademy al bezit,
waar de conceptuele basis nog gaten heeft en welk toekomstig ticket eigenaar is
van ieder deel. Het is een planningsmatrix, geen nieuwe feitenbron en geen
vervanging van entity-YAML, Markdown, source- of mediarecords.

Werk deze matrix bij wanneer een `EXP-*`-ticket de status, eigenaar of scope van
een onderwerp verandert. Absolute aantallen zijn een momentopname; canonical
status blijft uit de contentpipeline en `docs/entity-status.md` komen.

## 1. Reikwijdte en methode

De audit omvatte:

- alle 55 conceptrecords en hun Nederlandse en Engelse contentstructuur;
- alle acht narratives, waaronder zeven actieve lessen;
- blocktype en kennisdiepte van de Nederlandse structurele spiegel;
- source- en relationrecords van ieder concept;
- alle figureblocks op concept- en lessonpagina's en de gekoppelde mediarecords;
- hergebruik via entitylinks en bestaande lessen;
- expliciete Bordeauxverwijzingen als signaal voor mogelijke regionale
  oververtegenwoordiging; en
- de geplande onderwerpen in `EXP-004` tot en met `EXP-025`.

Een telling zegt niet automatisch iets over inhoudelijke kwaliteit. Eén sterke
review kan geschikter zijn dan vijf zwakke bronnen; één relevante procesplaat
kan meer onderwijzen dan meerdere foto's. De cijfers hieronder zijn daarom
triagesignalen die tijdens het betreffende authoringticket inhoudelijk worden
beoordeeld.

## 2. Baseline — momentopname 2026-09-24

De aantallen en oorspronkelijke bevindingen in §2–3 en §7 beschrijven de
startinventaris; zij zijn geen actuele totalen na EXP-004–016. De bijgewerkte
uitvoeringsmatrix staat in §4, de vinificatiebesluiten in §8. Voor de laatste
gerichte inventaris, bewijsplekken en vervolgacties zie de
[EXP-016-audit](../editorial/vinification-ownership-audit-2026-10-03.md).

| Onderdeel | Huidige stand | Betekenis voor de roadmap |
| --- | ---: | --- |
| Alle entities | 337 | De bredere graaf bestaat en kan de foundation hergebruiken |
| Actieve concepts | 49 | Veel bruikbare bouwstenen, maar nog geen complete conceptuele ruggengraat |
| Draftconcepts | 6 | Eén minimale draft en vijf lege bestemmingen |
| Actieve lessons | 7 | Sterke eerste vinificatieroute; lessons blijven narrative, geen feitenowner |
| Actieve conceptblocks, NL-spiegel | 472 | 289 foundation, 97 intermediate, 66 advanced; 20 figures zonder eigen depth |
| Actieve lessonblocks, NL-spiegel | 75 | 74 foundation en 1 intermediate, passend bij het eerste WSET 2+-pad |
| Unieke sources bij actieve concepts | 124 | Goede start, maar geschiktheid blijft per claim te beoordelen |
| Figureblocks bij actieve concepts, NL | 51 | 44 van 49 actieve conceptpagina's hebben minimaal één beeld |
| Figureblocks bij actieve lessons, NL | 10 | Alle lessen hebben beeld; twee lessen hebben meerdere figures |
| Unieke media gebruikt door concepts en lessons | 47 | 32 documentaire foto's, 12 educatieve illustraties, 3 documentaire illustraties |
| Uitgaande relaties uit actieve concepts | 114 | 80 naar concepts; de rest naar regio, appellation, druif, classificatie of producent |

Geen conceptpackage heeft momenteel een `content-plan.yaml`. Dat is geen
validatorfout onder het huidige contract, maar betekent dat historische
conceptpagina's geen duurzaam vastgelegde scope- en volledigheidsvragen hebben.
`EXP-002` moet hiervoor een proportioneel conceptcontract bepalen zonder alle
kleine pagina's met regiopagina-administratie te belasten.

## 3. Hoofdconclusies

### 3.1 De kelder is verder ontwikkeld dan de wijngaard

Fermentatie, maceratie, extractie, persen, MLF, élevage, liescontact,
oxidatiebescherming, klaring en botteling hebben al zelfstandige concepten en
worden grotendeels door de eerste lessen verbonden. De belangrijkste
vinificatiegaten liggen vóór de vergisting, bij microbiologie en gist, bij
kelderhygiëne en fouten, en bij één overkoepelend procesmodel.

De wijnstok zelf mist daarentegen de noodzakelijke basisowners voor anatomie,
fotosynthese, xyleem/floëem, source–sink, fenologie, bloei, vruchtzetting,
besontwikkeling en rijpheid. Bestaande pagina's over ampelografie, selectie,
onderstammen en phylloxera kunnen hierop aansluiten, maar kunnen deze ruggengraat
niet dragen.

### 3.2 Omgeving en wijnbouwbeslissingen vormen het grootste gat

`concept.terroir` en `concept.vintage` introduceren samenhang en seizoenseffect,
maar er zijn nog geen canonical owners voor klimaat versus weer, waterstatus,
bodem, irrigatie, snoei, training, canopy, opbrengstvorming, voeding,
wijngaardvloer, ziekten als systeem of duurzame teeltkeuzes. Dit rechtvaardigt
de volgorde `EXP-008` tot en met `EXP-015`.

### 3.3 Bestaande compositiekennis is waardevol maar smal

Zuur, tannine, methoxypyrazinen en vluchtige thiolen zijn al actief. Een
overkoepelend model ontbreekt voor suiker, ethanol, zuren als familie,
fenolische stoffen, aromaverbindingen, polysachariden, eiwitten, mineralen en
gassen. Ook waarneming, drempelwaarden, interactie, textuur, balans en
flesontwikkeling hebben nog geen gezamenlijk canonical kader.

### 3.4 Bordeauxbias zit vooral in contextconcepten

Vijftien actieve conceptpagina's bevatten drie of meer Bordeauxverwijzingen.
Daarvan zijn Clairet, Claret, courtier, en primeur, grand vin en Place de
Bordeaux terecht sterk regionaal. Bij AOP, assemblage, cru, élevage,
estate-bottling, franc de pied, phylloxera en traditionele methode moet een
volgende inhoudelijke review bewaken dat Bordeaux een voorbeeld blijft en geen
stilzwijgende wereldnorm wordt. Dit is een reviewvlag, geen automatische fout.

### 3.5 Beeld is breed aanwezig, maar systeemvisuals ontbreken

De huidige concept- en lessonmedia zijn vooral documentaire foto's en
procesillustraties rond vinificatie. Geen van de 47 gebruikte assets is als
`diagram` geregistreerd. Dat past bij het historische corpus, maar laat precies
de nieuwe behoefte open voor plantanatomie, transport, cycli, waterrelaties,
bodemeigenschappen en procesvergelijkingen. `EXP-003` moet eerst één
schematisch-naturalistische plaat als productie- en responsive pilot bewijzen.

De actieve concepten zonder figureblock zijn:

- `concept.assemblage`;
- `concept.courtier`;
- `concept.cru`;
- `concept.franc-de-pied`; en
- `concept.sulfur-dioxide`.

Dit is geen automatisch verzoek om vijf beelden. `Assemblage` en zwaveldioxide
hebben een duidelijke proceskans; bij de overige drie moet het latere ticket
eerst aantonen welke concrete leestaak beeld beter vervult dan tekst.

## 4. Curriculumdekkingsmatrix

Statussen:

- **afwezig** — geen canonical owner voor het noodzakelijke hoofdonderwerp;
- **fragmenten** — bruikbare onderdelen bestaan, maar vormen nog geen complete
  route;
- **sterke basis** — meerdere herbruikbare owners bestaan; integratie of
  gerichte aanvulling blijft nodig;
- **context** — bestaand materiaal is nuttig als voorbeeld of dependency, maar
  is niet de foundation-owner.

| Roadmapowner | Geplande canonical scope | Bestaande bruikbare owners | Auditstatus | Belangrijkste ontbrekende dekking | Prioriteit |
| --- | --- | --- | --- | --- | --- |
| `EXP-004` | Wijnstok als levend systeem | `vine-as-living-system`, `ampelography`, `rootstock`, `clonal-selection`, `phylloxera` | complete hub | Vervolgdetails landen bij fenologie, water, bodem en beheer zonder de systeemhub te dupliceren | voltooid |
| `EXP-005` | Jaarcyclus en fenologie | `grapevine-phenology`, met `vine-as-living-system` en `vintage` als dependencies | complete hub | Detail over bloembiologie, rijpheid en klimaatmechanismen landt bij EXP-006–008 | voltooid |
| `EXP-006` | Bloei, vruchtzetting en opbrengstvorming | `flowering-fruit-set-yield`, met `coulure` en `millerandage` als satellites | complete hub | Verdere beschemie en rijpheid landen bij EXP-007; snoei, loofwand en crop load bij EXP-012 | voltooid |
| `EXP-007` | Besontwikkeling, véraison en rijpheid | `berry-development-ripeness`, met `acidity`, `tannin` en `late-harvest` als satellites | complete hub | Verdere waterstress landt bij EXP-009; volledige wijnsamenstelling en perceptie bij EXP-024/025 | voltooid |
| `EXP-008` | Klimaat, weer, standplaats en microklimaat | `climate-weather-site-microclimate`, met `terroir`, `vintage`, `grapevine-phenology`, `vine-as-living-system` en `berry-development-ripeness` als dependencies | complete hub | Waterfysiologie landt bij EXP-009; bodems bij EXP-010/011; loofwandkeuzes en weergevaren bij EXP-012/014 | voltooid |
| `EXP-009` | Waterrelaties, droogte en irrigatie | `vine-water-relations`, met `vine-as-living-system`, `climate-weather-site-microclimate`, `grapevine-phenology`, `berry-development-ripeness`, `rootstock` en `terroir` als dependencies | complete hub | Volledige bodemfysica landt bij EXP-010/011; loofwandkeuzes bij EXP-012; regionale irrigatieregels bij hun geografische owners; brede duurzaamheidsafwegingen bij EXP-015 | voltooid |
| `EXP-010/011` | Wijngaardbodems en alfabetische directory | `vineyard-soils`, met `calcareous-vineyard-soils` en `volcanic-vineyard-soils` als satellites; `terroir`, `vine-water-relations` en `rootstock` als dependencies | complete hub and satellites | Verdere bodemvoeding, vloerbeheer en amendments landen bij EXP-013; volledige sensorische behandeling van minerality bij EXP-025 | voltooid |
| `EXP-012` | Snoei, training, canopy en crop load | `pruning-training-canopy-crop-load`, met de biologische, fenologische, klimaat-, water- en bodemhubs als dependencies | complete hub | Afzonderlijke ziekten en IPM landen bij EXP-014; brede teeltsystemen en duurzaamheid bij EXP-015; regionale regels bij hun geografische owners | voltooid |
| `EXP-013` | Voeding, bodembeheer en wijngaardvloer | `vine-nutrition-soil-management-vineyard-floor`, met bodem-, water-, plant-, klimaat-, fenologie-, loofwand- en rijpheidshubs als dependencies | complete hub | Afzonderlijke ziekten en fysiologische stoornissen landen bij EXP-014; certificerings- en duurzaamheidsclaims bij EXP-015; bodemtypen en waterfysiologie blijven bij hun bestaande owners | voltooid |
| `EXP-014` | Weerrisico's, ziekten, plagen en stoornissen | `vineyard-hazards-diseases-pests-disorders`, met `phylloxera` en `botrytis` als satellites en klimaat-, fenologie-, water-, voeding-, loofwand- en onderstamhubs als dependencies | complete hub | Afzonderlijke pathogenen blijven hub-owned totdat de entitytest zelfstandige satellites rechtvaardigt; teeltsystemen, certificering en brede duurzaamheid landen bij EXP-015 | voltooid |
| `EXP-015` | Teeltsystemen, duurzaamheid en adaptatie | `vineyard-systems-sustainability-adaptation`, met klimaat-, water-, bodem-, voeding-, loofwand-, risico-, onderstam- en rijpheidsconcepts als dependencies | complete hub | Teeltsystemen, certificeringsscope, resultaatmeting en adaptatie zijn hub-owned; bodem- en plantmechanismen blijven bij hun bestaande owners; kelder- en verpakkingsprocessen volgen bij EXP-016–023 | voltooid |
| `EXP-016` | Vinificatiegraaf en kleinste set hubs | 25 actieve concepts, vier drafts en zeven lessons | audit complete | Zeven hubs afgebakend, waarvan drie bestaande owners; tien kernonderwerpen en alle vervolgacties toegewezen in §8 en het auditrapport | voltooid |
| `EXP-017` | Ontvangst, sortering en mostvoorbereiding | Actieve hub `grape-reception-must-preparation`; bestaande `pressing`, rijpheids-/risicohubs en vroege lesson | volledig binnen scope | Tweetalige ontvangsthub, materiaal-PNG, mostbezinking, bescherming en juridisch begrensde correcties; directe rosépersing en naslaglinks in perspagina/lesson gecontroleerd | voltooid |
| `EXP-018` | Gist, microbiologie en alcoholische vergisting | Actieve systeemhub `fermentation`; lesson `alcoholic-fermentation` | volledig binnen scope | Tweetalige hub voor gistecologie, voeding, groei/activiteit en monitoring; hergebruik proces-PNG, oude anchors behouden en les gekoppeld | voltooid |
| `EXP-019` | Hoofdroutes, schilcontact en extractie | Nieuwe owner `winemaking-routes`; `maceration`, `extraction`, `pressing`; `carbonic-maceration` draft; route-lesson | sterke basis | Vertakkende routehub; cap management bij `extraction`, contactregime bij `maceration`; carbonische satellite onderzoeken en vullen; rosé/schilvergist wit expliciet vergelijken | volgende |
| `EXP-020` | Na vergisting, zuurstof en rijping | Bestaande owner `elevage`; `malolactic-fermentation`, `lees-ageing`, `batonnage`, `autolysis`, `oxidation`, `assemblage` | sterke basis | Élevage zelf tot systeemhub uitbreiden, gericht detail bij bestaande satellites houden; timing kan overlappen met vergisting | P1 |
| `EXP-021` | Stabilisatie, klaring, filtratie en verpakking | Bestaande owner `bottling`; `clarification-and-fining`, `sulfur-dioxide`; cellar-to-bottle-lesson | sterke basis | Botteling uitbreiden met systeemmodel voor stabiliteit, filtratie, gassen en sluitingen; geen extra afwerkingshub; fining en SO₂ bij bestaande owners | P1 |
| `EXP-022` | Hygiëne, microbiële risico's en fouten | Nieuwe owner `cellar-hygiene-wine-faults`; `oxidation`, `sulfur-dioxide`, `fermentation`, MLF en risicopassages | fragmenten | Preventie en diagnose samenbrengen; reductie, VA, Brett, TCA en hergisting onderzoeken; mechanismeowners blijven behouden | P1 |
| `EXP-023` | Zoete, mousserende en versterkte families | Nieuwe owner `sweet-sparkling-fortified-wines`; droog-, botrytis- en traditional-methodfamilies; drie drafts | sterke fragmenten | Eén vergelijkende hub; fortification gericht invullen, passito/Spätlese op eigen termscope beoordelen; tank/carbonatie en overige relevante families onderzoeken; vijf NL/EN-linkverschillen reviewen | P1 |
| `EXP-024` | Wijnsamenstelling als systeem | `acidity`, `tannin`, `methoxypyrazines`, `volatile-thiols`, `sulfur-dioxide` | fragmenten | Volledige compositiekaart en interacties zonder component-aromalijst | P1 |
| `EXP-025` | Waarneming, balans en flesontwikkeling | Sensorische passages in concepts, grapes en lessons | afwezig | Zintuigen, thresholds, interactie, context, textuur, balans, kwaliteitsoordeel en ontwikkeling | P1 |

## 5. Bouwstenen uit de baseline en gerichte aanvullingen

Deze indeling beschrijft hun rol in de nieuwe foundation; zij verandert hun
canonical type of route niet.

### 5.1 Plantmateriaal en wijnstok

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.ampelography` | actief | Waarnemen en identificeren; bruikbare satelliet | `EXP-004` |
| `concept.clonal-selection` | actief | Plantmateriaalkeuze; bruikbare satelliet | `EXP-004/013` |
| `concept.massal-selection` | lege draft | Waarschijnlijke tegenhanger van klonale selectie; entitygrens herbeoordelen | `EXP-004/013` |
| `concept.rootstock` | actief | Enting en plaatsgebonden onderstamkeuze | `EXP-004/009/013` |
| `concept.phylloxera` | actief | Plaag, crisis en structurele gevolgen | `EXP-014` met dependencies naar `EXP-004` |
| `concept.franc-de-pied` | actief | Eigen wortels als bijzondere context | `EXP-014` |
| `concept.coulure` | actief | Sterke bloem- en jonge vruchtval; gerichte satellite van opbrengstvorming | `EXP-006` voltooid |
| `concept.millerandage` | actief | Ongelijke, blijvende besontwikkeling; gerichte satellite van opbrengstvorming | `EXP-006` voltooid |

### 5.2 Omgeving en wijngaardcontext

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.climate-weather-site-microclimate` | actief | Schaalniveaus, omgevingsdrivers, standplaats- en loofwandmicroklimaat, meting en klimaatgrenzen | `EXP-008` voltooid |
| `concept.terroir` | actief | Synthese van plaats en mens; niet de owner van bodem of klimaatmechanismen | `EXP-008` dependency / `EXP-010/015` |
| `concept.vintage` | actief | Seizoensvariatie en etiketbetekenis | `EXP-005/008` dependency |
| `concept.botrytis` | actief | Biologie, edele en grijze rot en oogstselectie | `EXP-014/023` |

Deze baseline-inventaris wordt aangevuld door de hubmatrix en de voortgang in
de Explore-roadmap; zij is geen volledige actuele entitylijst.

### 5.3 Druif- en wijnsamenstelling

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.acidity` | actief | Zuur, pH en titreerbaar zuur | `EXP-007/024` |
| `concept.tannin` | actief | Herkomst, extractie, waarneming en ontwikkeling | `EXP-007/024/025` |
| `concept.berry-development-ripeness` | actief | Besgroei, véraison, meervoudige rijpheid en oogstbesluit | `EXP-024/025` |
| `concept.methoxypyrazines` | actief | Voorbeeld van druif, wijngaard en perceptie als keten | `EXP-024/025` |
| `concept.volatile-thiols` | actief | Voorloper–gist–aromaketen | `EXP-018/024/025` |

### 5.4 Kernvinificatie en rijping

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.fermentation` | actief | Canonical systeemhub gist, voeding, verloop en monitoring | `EXP-018` voltooid |
| `concept.maceration` | actief | Schilcontact in verschillende routes | `EXP-019` |
| `concept.extraction` | actief | Overdracht en sturing in de kuip | `EXP-019` |
| `concept.pressing` | actief | Scheiding, timing en fracties; vroege routes gereviewd in EXP-017 | `EXP-019` |
| `concept.carbonic-maceration` | lege draft | Behouden als gericht procesconcept; bronreview en authoring vereist | `EXP-019` |
| `concept.malolactic-fermentation` | actief | Omzetting, stijl en stabiliteit | `EXP-020` |
| `concept.elevage` | actief | Bestaande owner wordt zelf de opvoedingshub; geen parallelle rijpingshub | `EXP-020` |
| `concept.lees-ageing` | actief | Liescontact over vat, tank en fles | `EXP-020` |
| `concept.batonnage` | actief | Gerichte bewerking tijdens liescontact | `EXP-020` |
| `concept.autolysis` | actief | Onderliggend gistcelmechanisme | `EXP-020/023` |
| `concept.oxidation` | actief | Zuurstofeffect en fout/stijlgrens | `EXP-020/022/025` |
| `concept.assemblage` | actief | Partijen samenstellen; visuele proceskans | `EXP-020` |
| `concept.clarification-and-fining` | actief | Klaring en fining; filtratie nog elders | `EXP-021` |
| `concept.sulfur-dioxide` | actief | Antioxidatieve en microbiële bescherming; visuele proceskans | `EXP-021/022` |
| `concept.bottling` | actief | Bestaande owner wordt hub voor bottelvoorbereiding, stabiliteit en verpakking | `EXP-021` |

### 5.5 Mousserende wijn

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.second-fermentation` | actief | Gas en alcohol uit een tweede vergisting | `EXP-023` |
| `concept.traditional-method` | actief | Methodefamilie en afbakening van herkomst | `EXP-023` |
| `concept.liqueur-de-tirage` | actief | Start van flesgisting | `EXP-023` |
| `concept.remuage` | actief | Depot verzamelen | `EXP-023` |
| `concept.disgorgement` | actief | Depot verwijderen | `EXP-023` |
| `concept.dosage` | actief | Eindafstemming na dégorgement | `EXP-023` |

### 5.6 Zoet, gedroogd en versterkt

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.late-harvest` | actief | Later oogsten en uiteenlopende uitkomsten | `EXP-007/023` |
| `concept.passerillage` | actief | Concentratie door waterverlies | `EXP-023` |
| `concept.appassimento` | actief | Italiaanse uitvoering en terminologie | `EXP-023` |
| `concept.vin-de-paille` | actief | Meerdere strowijntradities | `EXP-023` |
| `concept.passito` | lege draft | Gerichte terminologische kandidaat behouden; geen extra droogmechanismeowner | `EXP-023` |
| `concept.spatlese` | lege draft | Gerichte juridische/etiketkandidaat behouden; officiële scope onderzoeken | `EXP-023` |
| `concept.fortification` | lege draft | Behouden als gerichte hoofdtechniek; nog bronnen en volledige uitleg nodig | `EXP-023` |

`concept.botrytis` hoort inhoudelijk ook bij deze familie, maar blijft hierboven
één keer als bestaande entity geïnventariseerd.

### 5.7 Juridische, handels- en regiocontext

Deze concepts zijn nuttige dependencies en voorbeelden, maar behoren niet tot
de kernruggengraat van wijnstok–omgeving–wijnmaken–waarneming.

| Concept | Status | Rol binnen foundation | Reviewmoment |
| --- | --- | --- | --- |
| `concept.aop` | actief | Juridische herkomstcontext | Gebruik in regionale voorbeelden |
| `concept.chateau` | actief | Bordeauxterm, domein en merk | Buiten foundation houden |
| `concept.clairet` | actief | Bordeauxwijnstijl | `EXP-023` alleen als stijlvoorbeeld |
| `concept.claret` | actief | Historische/actuele Bordeauxterm | Buiten foundation houden |
| `concept.courtier` | actief | Bordeauxhandel | Buiten foundation houden |
| `concept.cru` | actief | Contextafhankelijk kwaliteits-/plaatswoord | Link vanuit regio's en classificaties |
| `concept.cuvee` | actief | Etiket- en persbetekenis | `EXP-017/023` als terminologische dependency |
| `concept.en-primeur` | actief | Handelswijze | Buiten foundation houden |
| `concept.estate-bottling` | actief | Etiket en bottelaar | `EXP-021` als labelcontext |
| `concept.grand-vin` | actief | Hoofdwijn van een domein | Buiten foundation houden |
| `concept.negociant` | actief | Handel en keten | Buiten foundation houden |
| `concept.place-de-bordeaux` | actief | Specifiek distributiesysteem | Buiten foundation houden |
| `concept.second-wine` | actief | Producentenselectie en positionering | Buiten foundation houden |

## 6. Narratives en hergebruik

| Narrative | Status | Wat het al verbindt | Betekenis voor foundation |
| --- | --- | --- | --- |
| `narrative.lesson.grape-as-raw-material` | actief | Druif, zuur, tannine, Botrytis, jaargang en vergisting | Goede consumer van `EXP-004–009` en `EXP-024`; later actualiseren, geen feitenowner maken |
| `narrative.lesson.grape-to-must` | actief | Ontvangst en persen | Consumer van de actieve EXP-017-hub; naslaglink en directe rosépersing toegevoegd |
| `narrative.lesson.alcoholic-fermentation` | actief | Vergisting als kernstap | Consumer van `EXP-018`; naslaglink naar fermentation-hub en brondekking gereviewd |
| `narrative.lesson.three-still-wine-routes` | actief | Wit, rosé en rood; maceratie, extractie en persen | Sterke integratielaag voor `EXP-019` |
| `narrative.lesson.after-main-fermentation` | actief | MLF en bâtonnage | Consumer van `EXP-020`; kan later explicieter naar lies/autolyse verwijzen |
| `narrative.lesson.maturation-and-protection` | actief | Élevage, oxidatie en zwaveldioxide | Sterke consumer van `EXP-020/021` |
| `narrative.lesson.cellar-to-bottle` | actief | Assemblage, klaring, zwavel en botteling | Sterke consumer van `EXP-020/021` |
| `narrative.regional.bordeaux-proof` | draft | Technische Bordeaux-proef | Geen foundationdependency; buiten huidige scope |

De lessen bewijzen dat de entity-first grens werkt: zij ordenen en contextualiseren
kennis, terwijl concepts de herbruikbare uitleg bezitten. Bij toekomstige
herziening moeten ontbrekende links worden toegevoegd zonder lessonproza
mechanisch door conceptproza te vervangen.

## 7. Relaties, bronnen en media: gerichte reviewqueues

### Relations

Acht actieve concepts hebben momenteel geen uitgaande structurele relatie:
`cuvee`, `dosage`, `malolactic-fermentation`, `rootstock`,
`second-fermentation`, `tannin`, `terroir` en `vintage`. Zij worden wel vanuit
proza gebruikt, maar `EXP-026` moet beoordelen welke structurele relaties
inhoudelijk noodzakelijk zijn. Voeg geen relaties toe om alleen een teller te
verhogen.

Aanvulling EXP-016 (2026-10-03): uitgaande relaties alleen geven geen volledig
beeld. MLF, dosage en tweede vergisting hebben in de huidige entityinventaris
respectievelijk acht, drie en drie inkomende geschreven relaties. Hun afgeleide
verbindingen bestaan dus al; schrijf geen spiegelrelaties. Nieuwe hubkoppelingen
volgen per authoringticket, met integrale controle in EXP-026. Het auditrapport
onderscheidt de beperkte vinificatiedeelgraaf van verbindingen via proza en het
gehele platform.

### Sources

Alle actieve concepts hebben minimaal één geregistreerde source. `batonnage` en
`pressing` hebben ieder één package-source; tien andere actieve concepts hebben
er twee. Dit is alleen een reviewqueue. De inhoudelijke vraag is of de bron de
volledige claimfamilie en het vereiste detailniveau draagt.

Nieuwe plant-, bodem-, microbiologie- en waarnemingshubs vereisen vooral
academische reviews, vakboeken, wetenschappelijke instituten en passende
primaire literatuur. Regionale trade bodies blijven nuttig voor plaatselijke
praktijk en terminologie, maar mogen geen algemene biologische causaliteit
dragen.

### Media

De 47 gebruikte concept- en lessonassets zijn allemaal via het mediasysteem
geregistreerd. Hergebruik is al zichtbaar bij onder meer:

- de lees/autolyse/bâtonnage-illustratie;
- de traditionele-methode-illustratie;
- de grand-vin/tweede-wijn-illustratie;
- de lessonillustraties voor persen en bottelen; en
- documentaire beelden voor extractie, élevage en tannine.

Dit bevestigt dat nieuwe systeemvisuals bij voorkeur rond één canonical
mechanisme worden ontworpen en vervolgens in hub, satellite en lesson worden
hergebruikt. Een nieuwe visual krijgt dus niet automatisch de naam van één
pagina wanneer zijn teaching question breder is.

## 8. Canonical owners en vinificatiebesluiten

Onderstaande brede inventaris begon als dependencylijst voor `EXP-002`. De
wijngaardowners zijn inmiddels uitgevoerd volgens §4. EXP-016 heeft de zeven
vinificatieowners definitief afgebakend voor de volgende authoringrondes; hun
ontvangsthub is in EXP-017 gepubliceerd. De overige nieuwe IDs bestaan nog
niet als packages. Samenstelling en waarneming volgen
later hun eigen scopebrief.

| Werknaam | Minimale scope | Eerste consumer | Waarschijnlijke vorm |
| --- | --- | --- | --- |
| Vine as a living system | Anatomie, transport, energie en reserves | `EXP-004`, eerste lesson | Hub |
| Phenology and annual cycle | Jaarfasen en variatie | `EXP-005` | Hub of groot concept |
| Flowering and fruit set | Bloei, set en yield formation | `EXP-006` | Concept met mogelijke satellites |
| Berry development and ripeness | Véraison, compositie en oogstbesluit | `EXP-007` | Hub |
| Climate, weather and microclimate | Schalen en causale routes | `EXP-008` | Hub |
| Vine water relations | Bodem–plant–atmosfeer en stress | `EXP-009` | Groot concept |
| Vineyard soils | Eigenschappen, wortelomgeving en directory | `EXP-010/011` | Hub met goedgekeurde satellites |
| Pruning, training and canopy | Winter- en seizoensbeslissingen | `EXP-012` | Hub |
| Vine nutrition and soil management | Nutriënten en wijngaardvloer | `EXP-013` | Hub met beperkte satellites |
| Vineyard hazards and health | Weer, ziekte, plagen en stoornissen | `EXP-014` | Hub die bestaande concepts ontsluit |
| Vineyard systems and sustainability | Praktijken, uitkomsten en adaptatie | `EXP-015` | Hub |
| `concept.grape-reception-must-preparation` (actief) | Ontvangst, selectie en mostvoorbereiding; persmechaniek blijft bij `pressing` | `EXP-017` | Systeemhub |
| `concept.fermentation` (bestaand) | Alcoholische vergisting, gist, voeding en kinetiek; bederfdiagnose bij EXP-022 | `EXP-018` voltooid | Bestaande entity actief als systeemhub |
| `concept.winemaking-routes` (nieuw) | Volledige routeoriëntatie en vergelijking wit, rosé, rood en schilvergist wit; mechanismen blijven satellites | `EXP-019` | Systeemhub; geen extra algemene vinificatiehub |
| `concept.elevage` (bestaand) | Samenhang van MLF, lies, vat, tijd, zuurstof en assemblage; detail bij bestaande concepts | `EXP-020` | Bestaande entity uitbreiden tot systeemhub |
| `concept.bottling` (bestaand) | Stabiliteit, filtratie, opgeloste gassen, verpakking en sluiting; fining/SO₂ bij eigen owners | `EXP-021` | Bestaande entity uitbreiden tot systeemhub |
| `concept.cellar-hygiene-wine-faults` (nieuw) | Preventie, foutfamilies en diagnostische grenzen; oxidatiechemie bij `oxidation` | `EXP-022` | Systeemhub; gerichte satellites alleen na entitytoets |
| `concept.sweet-sparkling-fortified-wines` (nieuw) | Vergelijking restsuiker, mousse en versterking; specialistische methoden bij eigen concepts | `EXP-023` | Eén vergelijkende systeemhub met drie families |
| Wine composition | Stoffamilies, herkomst en interactie | `EXP-024` | Hub |
| Sensory perception and development | Waarneming, balans en tijd | `EXP-025` | Hub |

De tien verplichte owners uit EXP-016 blijven `fermentation`, `extraction`,
`pressing`, `malolactic-fermentation`, `elevage`, `lees-ageing`,
`clarification-and-fining`, `oxidation`, `sulfur-dioxide` en `bottling`.
`maceration` bezit het contactregime; `extraction` de overdracht en cap management;
`autolysis` de celafbraak en `batonnage` de handeling binnen liescontact.
`sulfur-dioxide` is geen owner voor alle zwavelverbindingen. Bottelvoorbereiding
en stabiliteit komen bij `bottling`, algemene flesontwikkeling bij EXP-025.

De [audit, §4–7](../editorial/vinification-ownership-audit-2026-10-03.md#4-overlap-en-concrete-vervolgacties)
legt de bewijsplekken en toewijzing van overlap, bron-/beeldhiaten en lessons
vast. EXP-023 beoordeelt de vijf EN-only entitytargets bij `disgorgement`,
`late-harvest`, `second-fermentation` en `vin-de-paille`; EXP-026 controleert de
uitkomst. Carbonic maceration en fortification blijven gerichte drafts voor
invulling in EXP-019/023; passito en Spätlese blijven terminologische/juridische
kandidaten voor expliciete review in EXP-023. Geen draft wordt op basis van deze
planning actief en geen bestaande ID of route wordt verwijderd.

## 9. Uitvoeringsvolgorde na deze audit

1. `EXP-002` heeft het proportionele authoringcontract voor hubs en satellites,
   inclusief coveragevragen, depth en entitygrenzen, vastgelegd en gevalideerd.
2. `EXP-003` heeft de nieuwe diagramstijl als geaccepteerde pilot toegepast op
   klonale selectie: één geografisch neutrale, taalneutraal genummerde
   procesplaat met gelokaliseerde uitleg, een volledige HTML-terugval en
   vastgelegde productie- en reviewhistorie.
3. `EXP-004` heeft de biologische systeemhub voltooid, `EXP-005` de
   fenologische jaarcyclus, `EXP-006` de reproductieve opbrengstketen,
   `EXP-007` besontwikkeling en het oogstbesluit, `EXP-008` klimaat en
   microklimaat, `EXP-009` waterrelaties, `EXP-010–011` de bodemruggengraat,
   `EXP-012` snoei en loofwand, `EXP-013` voeding en vloerbeheer, `EXP-014`
   weerrisico's, ziekten, plagen en fysiologische stoornissen en `EXP-015`
   teeltsystemen, duurzaamheid en adaptatie.
4. `EXP-016` heeft de vinificatiegraaf geïnventariseerd en zeven systeemhubs
   afgebakend, met behoud van de bestaande mechanismen, identities en sources.

5. `EXP-017` heeft ontvangst, selectie en mostvoorbereiding gepubliceerd, met
   behoud van persmechaniek bij `pressing`, een nieuwe materiaalillustratie en
   gecorrigeerde vroege roséroutes in de perspagina en `grape-to-must` lesson.

6. `EXP-018` heeft de bestaande fermentation-owner uitgebreid tot tweetalige
   systeemhub, met negen aanvullende bronnen, hergebruik van de proces-PNG,
   behoud van de oude anchors en een gereviewde naslaglink vanuit de les.

De volgende uitvoeringstaak is `EXP-019`: de routehub `winemaking-routes`, met
mechanismen bij `maceration`, `extraction` en `pressing`. Onderzoek de bestaande
carbonic-maceration-draft en vergelijk wit, rosé, rood en schilvergist wit.
Daarna volgen EXP-020–023 in de vastgelegde inhoudelijke volgorde; de
[productplanning](product-roadmap.md) plaatst platformonderhoud ertussen.
