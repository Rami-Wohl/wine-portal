# Explore foundation coverage matrix

Status: living planning document  
Baseline date: 2026-09-24  
Owner: `docs/explore-foundation-roadmap.md`

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

## 2. Baseline

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
| `EXP-006` | Bloei, vruchtzetting en opbrengstvorming | `coulure` (minimale draft) | afwezig | Bloembiologie, vruchtzetting, millerandage, clusterbouw en yield components | P0 |
| `EXP-007` | Besontwikkeling, véraison en rijpheid | `acidity`, `tannin`, `late-harvest`; lesson `grape-as-raw-material` | fragmenten | Groeifasen, suiker/zuur/water/phenolics, meerdere rijpheidsbegrippen en oogstsampling | P0 |
| `EXP-008` | Klimaat, weer, site en microklimaat | `terroir`, `vintage`; regionale voorbeelden | fragmenten | Schalen, meetbegrippen en causale routes via hitte, licht, regen, vocht, wind, aspect en canopy | P0 |
| `EXP-009` | Waterrelaties, droogte en irrigatie | Incidentele passages in `terroir`, druiven en regio's | afwezig | Bodem–plant–atmosfeer, huidmondjes, waterstatus, timing van tekort, teveel water en irrigatie | P0 |
| `EXP-010/011` | Wijngaardbodems en alfabetische directory | `terroir`; verspreide regiobodemtekst | afwezig | Terminologie, fysische eigenschappen, wortelomgeving, indirecte effecten, mythes en beeldrijke vergelijking | P0 |
| `EXP-012` | Snoei, training, canopy en crop load | Losse voorbeelden op druiven- en regiopagina's | afwezig | Doelen, systemen, seizoenswerk en trade-offs tussen opbrengst, rijping, ziekte en levensduur | P1 |
| `EXP-013` | Voeding, bodembeheer en wijngaardvloer | Geen zelfstandige owner | afwezig | Nutriënten, diagnose, organische stof, bodemleven, cover crops, erosie, compactie en amendments | P1 |
| `EXP-014` | Weerrisico's, ziekten, plagen en stoornissen | `phylloxera`, `botrytis`, `rootstock` | fragmenten | Samenhangend risicokader, vorst/hagel/hitte, hoofdziekten, virussen, IPM en fysiologische schade | P1 |
| `EXP-015` | Teeltsystemen, duurzaamheid en adaptatie | Incidentele regiopassages | afwezig | Praktijken versus certificering en resultaten; biodiversiteit, water, koolstof, arbeid, veerkracht en adaptatie | P1 |
| `EXP-016` | Vinificatiegraaf en kleinste set hubs | Veel actieve kelderconcepten en zeven lessons | sterke basis | Canonical procesoverzicht, grensafspraken en expliciete plaats voor ieder bestaand concept | P0 na EXP-002 |
| `EXP-017` | Ontvangst, sortering en mostvoorbereiding | `pressing`; lessons `grape-as-raw-material` en `grape-to-must` | fragmenten | Oogstconditie, transport, sortering, ontstelen, kneuzen, hele trossen en mostbehandelingen | P1 |
| `EXP-018` | Gist, microbiologie en alcoholische vergisting | `fermentation`; lesson `alcoholic-fermentation` | sterke basis | Gistecologie, inoculatiekeuze, voeding, kinetiek, monitoring en vastlopende gisting in één owner | P1 |
| `EXP-019` | Hoofdroutes, schilcontact en extractie | `maceration`, `extraction`, `pressing`; `carbonic-maceration` draft; route-lesson | sterke basis | Rosé/orange volledigheid, cap management en beslissing over carbonic-macerationdraft | P1 |
| `EXP-020` | Na vergisting, zuurstof en rijping | `malolactic-fermentation`, `elevage`, `lees-ageing`, `batonnage`, `autolysis`, `oxidation`, `assemblage` | sterke basis | Overkoepelende beslisroute, vaten/hout, overhevelen, topping en begrensde interacties | P1 |
| `EXP-021` | Stabilisatie, klaring, filtratie en verpakking | `clarification-and-fining`, `sulfur-dioxide`, `bottling`; cellar-to-bottle-lesson | sterke basis | Tartraat/proteïne/microbiële stabiliteit, filtratie, gassen en sluitingen als systeem | P1 |
| `EXP-022` | Hygiëne, microbiële risico's en fouten | `oxidation`, `sulfur-dioxide`; risicopassages elders | fragmenten | Hygiëne-owner, reductie, VA, Brett, TCA, refermentatie, drempels en diagnosegrenzen | P1 |
| `EXP-023` | Zoete, mousserende en versterkte families | `botrytis`, `late-harvest`, `passerillage`, `appassimento`, `vin-de-paille`, traditional-methodfamilie; drie drafts | sterke fragmenten | Familiehubs, restsuikerroutes, tankmethode/carbonatie, fortification en besluit over passito/spätlese | P1 |
| `EXP-024` | Wijnsamenstelling als systeem | `acidity`, `tannin`, `methoxypyrazines`, `volatile-thiols`, `sulfur-dioxide` | fragmenten | Volledige compositiekaart en interacties zonder component-aromalijst | P1 |
| `EXP-025` | Waarneming, balans en flesontwikkeling | Sensorische passages in concepts, grapes en lessons | afwezig | Zintuigen, thresholds, interactie, context, textuur, balans, kwaliteitsoordeel en ontwikkeling | P1 |

## 5. Volledige inventaris van bestaande concepts

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
| `concept.coulure` | minimale draft | Vruchtzettingsprobleem; zelfstandige entitygrens nog toetsen | `EXP-006` |

### 5.2 Omgeving en wijngaardcontext

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.terroir` | actief | Synthese van plaats en mens; niet de owner van bodem of klimaatmechanismen | `EXP-008/010/015` |
| `concept.vintage` | actief | Seizoensvariatie en etiketbetekenis | `EXP-005` voltooid / `EXP-008` |
| `concept.botrytis` | actief | Biologie, edele en grijze rot en oogstselectie | `EXP-014/023` |

Dit cluster is numeriek klein omdat de meeste geplande owners nog ontbreken.

### 5.3 Druif- en wijnsamenstelling

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.acidity` | actief | Zuur, pH en titreerbaar zuur | `EXP-007/024` |
| `concept.tannin` | actief | Herkomst, extractie, waarneming en ontwikkeling | `EXP-007/024/025` |
| `concept.methoxypyrazines` | actief | Voorbeeld van druif, wijngaard en perceptie als keten | `EXP-024/025` |
| `concept.volatile-thiols` | actief | Voorloper–gist–aromaketen | `EXP-018/024/025` |

### 5.4 Kernvinificatie en rijping

| Concept | Status | Foundationrol | Volgende eigenaar |
| --- | --- | --- | --- |
| `concept.fermentation` | actief | Canonical basisowner alcoholische vergisting | `EXP-018` |
| `concept.maceration` | actief | Schilcontact in verschillende routes | `EXP-019` |
| `concept.extraction` | actief | Overdracht en sturing in de kuip | `EXP-019` |
| `concept.pressing` | actief | Scheiding, timing en fracties | `EXP-017/019` |
| `concept.carbonic-maceration` | lege draft | Kandidaatsatelliet voor een bijzondere route | `EXP-019` |
| `concept.malolactic-fermentation` | actief | Omzetting, stijl en stabiliteit | `EXP-020` |
| `concept.elevage` | actief | Overkoepelende opvoeding; grens met nieuwe hub bepalen | `EXP-020` |
| `concept.lees-ageing` | actief | Liescontact over vat, tank en fles | `EXP-020` |
| `concept.batonnage` | actief | Gerichte bewerking tijdens liescontact | `EXP-020` |
| `concept.autolysis` | actief | Onderliggend gistcelmechanisme | `EXP-020/023` |
| `concept.oxidation` | actief | Zuurstofeffect en fout/stijlgrens | `EXP-020/022/025` |
| `concept.assemblage` | actief | Partijen samenstellen; visuele proceskans | `EXP-020` |
| `concept.clarification-and-fining` | actief | Klaring en fining; filtratie nog elders | `EXP-021` |
| `concept.sulfur-dioxide` | actief | Antioxidatieve en microbiële bescherming; visuele proceskans | `EXP-021/022` |
| `concept.bottling` | actief | Voorbereiding, zuurstof, sluiting en fles | `EXP-021` |

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
| `concept.passito` | lege draft | Term/entitygrens toetsen tegenover appassimento en passerillage | `EXP-023` |
| `concept.spatlese` | lege draft | Duitse wettelijke/stilistische term; waarschijnlijk context buiten procesowner | `EXP-023` |
| `concept.fortification` | lege draft | Ontbrekende hoofdtechniek voor versterkte wijn | `EXP-023` |

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
| `narrative.lesson.grape-to-must` | actief | Ontvangst en persen | Consumer van `EXP-017` |
| `narrative.lesson.alcoholic-fermentation` | actief | Vergisting als kernstap | Consumer van `EXP-018`; bevat nu geen entitylink naar de bestaande fermentation-owner |
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

## 8. Canonical owners die waarschijnlijk nodig zijn

Dit is de dependencylijst voor `EXP-002`, niet de definitieve entitylijst. Het
authoringcontract moet per regel besluiten tussen hub, conceptentity, sectie of
registeritem.

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
| From grape reception to must | Ontvangst en voorbereiding | `EXP-017` | Hub of process narrative plus concepts |
| Yeast and wine microbiology | Organismen, kinetiek en risico | `EXP-018/022` | Concept/hub; grens met fermentation bepalen |
| Main vinification routes | Gemeenschappelijke stappen en splitsingen | `EXP-019` | Hub |
| Post-fermentation decisions | MLF, rijping, zuurstof en assemblage | `EXP-020` | Hub |
| Finishing and packaging | Stabiliteit tot sluiting | `EXP-021` | Hub |
| Cellar hygiene and faults | Preventie, causale families en diagnose | `EXP-022` | Hub met selectieve satellites |
| Special wine method families | Zoet, mousserend en versterkt | `EXP-023` | Eén navigatiehub of drie family hubs; beslissen in EXP-002/016 |
| Wine composition | Stoffamilies, herkomst en interactie | `EXP-024` | Hub |
| Sensory perception and development | Waarneming, balans en tijd | `EXP-025` | Hub |

## 9. Uitvoeringsvolgorde na deze audit

1. `EXP-002` heeft het proportionele authoringcontract voor hubs en satellites,
   inclusief coveragevragen, depth en entitygrenzen, vastgelegd en gevalideerd.
2. `EXP-003` heeft de nieuwe diagramstijl als geaccepteerde pilot toegepast op
   klonale selectie: één geografisch neutrale, taalneutraal genummerde
   procesplaat met gelokaliseerde uitleg, een volledige HTML-terugval en
   vastgelegde productie- en reviewhistorie.
3. `EXP-004` heeft de biologische systeemhub voltooid en `EXP-005` de
   fenologische jaarcyclus; `EXP-006–011` bouwen nu de reproductieve en
   omgevingsruggengraat verder uit.
4. `EXP-016` mag na `EXP-002` al de bestaande vinificatiegraaf modelleren, maar
   nieuwe proza-authoring volgt de vastgelegde volgorde van de roadmap.

De visuele pilot, systeemhub en fenologiehub zijn voltooid; `EXP-006` is de
eerstvolgende uitvoeringstaak. `DEC-EXP-003` blijft daarna de eerste harde
inhoudelijke beslissing: welke bodemtermen na research een eigen entity krijgen.
