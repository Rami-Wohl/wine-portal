# Learn-roadmap

Status: actieve productroadmap  
Peildatum: 2026-10-12

Dit document ordent de Learn-MVP en de daaropvolgende inhoudelijke uitbreiding.
Het is de enige actuele ticketlijst voor deze capability. Reguliere
kwaliteitsbevindingen blijven thuishoren in `maintenance-backlog.md`; afgeronde
Learn-tickets blijven hier als historisch spoor staan.

De eerste versie is anoniem en file-backed. Zij moet echte lessen en leerpaden
bruikbaar maken zonder accounts, API of database, maar mag een latere overgang
naar gesynchroniseerde gebruikersvoortgang niet onnodig bemoeilijken.

## Doel en afbakening

De eerste Learn-release bewijst dat een gebruiker:

1. een passend leerpad kan vinden en begrijpen wat het oplevert;
2. lessen in een doordachte volgorde kan volgen;
3. vrij kan wisselen tussen lescontext en canonical kennis in Explore;
4. lokaal en zonder account voortgang kan bewaren;
5. ook zonder local storage alle lessen kan lezen en navigeren.

De release bouwt geen account-, authenticatie-, API- of databasesysteem. Ook
quizzen, certificaten, streaks, persoonlijke aanbevelingen, notities,
spaced repetition en docentfuncties vallen buiten deze roadmap. Zulke functies
krijgen pas een eigen productbesluit na evaluatie van het eerste echte leerpad.

## Vaste uitgangspunten

Deze keuzes volgen uit het bestaande product- en architectuurbeleid en worden
niet per ticket opnieuw geopend:

- **Eén kennisstelsel.** Entities blijven eigenaar van stabiele onderwerpkennis;
  lessons leggen verbanden en learning paths ordenen bestaande content.
- **Geen contentkopieën in een curriculum.** Een learning path verwijst met
  stable IDs naar lessons en waar nuttig naar canonical entities.
- **Canonical content blijft file-backed.** Accounts of een database zijn geen
  voorwaarde voor het authoren, bouwen of publiceren van een leerpad.
- **Voortgang is gebruikersstaat, geen wijnkennis.** Progressdata komt nooit in
  entity-, narrative- of learning-pathpackages terecht.
- **NL en EN blijven beide authored.** De publieke interface mag voorlopig
  Nederlandstalig zijn, maar een actieve lesson of learning path volgt het
  bestaande lokalisatiecontract.
- **Bestaande canonical routes blijven leidend.** Een lesson houdt één canonical
  narrative-URL, ook wanneer hij binnen een leerpad wordt geopend.
- **Anoniem leren blijft werken.** Local-storageproblemen mogen lezen,
  vorige/volgende-navigatie of directe links nooit blokkeren.
- **Geen automatische voltooiing door alleen bezoek.** Een pagina openen is geen
  bewijs dat de gebruiker de les heeft afgerond.
- **Leerniveau en kennisdiepte zijn onafhankelijke assen.** Een lesson- of
  pathniveau wordt nooit automatisch afgeleid uit de relatieve blockdiepte op
  een entitypagina.
- **Een leerpad eindigt met aanmoediging en richting.** De MVP heeft een
  succesbestemming met een recap, een passend compliment en relevante
  vervolgsuggesties, zonder certificeringsclaim.
- **De eerste echte use-case bepaalt het model.** Schema en UI worden ontworpen
  tegen het goedgekeurde pilotcurriculum, niet tegen een hypothetisch volledig
  LMS.

## Voorbereiding op accounts, API en database

De tijdelijke implementatie moet vervangbaar zijn zonder canonical content of
UI volledig te herschrijven. Daarom gelden vanaf de eerste versie deze
technische grenzen:

1. Learning paths en steps hebben stabiele, onveranderlijke IDs.
2. De UI leest voortgang via één kleine progressinterface; Reactcomponenten
   gebruiken niet rechtstreeks verspreide `localStorage`-aanroepen.
3. De lokale adapter bewaart een versieerbaar record en uitsluitend minimale
   staat, bijvoorbeeld path-ID, voltooide step-ID's en wijzigingstijd.
4. Afgeleide waarden zoals percentage, totaal aantal stappen en huidige
   lestitels worden telkens uit canonical pathdata berekend en niet opgeslagen.
5. Opslagfouten leveren een expliciete anonieme fallback op en geen kapotte
   pagina.
6. Een toekomstige remote adapter moet dezelfde gebruikersacties kunnen
   uitvoeren: voortgang lezen, een step voltooien of heropenen en een pad
   resetten.
7. Een latere login kan lokale voortgang pas samenvoegen nadat conflict- en
   privacyregels expliciet zijn besloten. De anonieme MVP claimt nog geen
   automatische migratie.

Deze grenzen zijn een vervangbaarheidscontract, geen opdracht om nu alvast een
backendachtige abstractielaag, netwerkclient of database-entiteiten te bouwen.

## Werkvolgorde

| Volgorde | Ticket | Resultaat | Afhankelijk van | Status |
| ---: | --- | --- | --- | --- |
| 1 | `LRN-001` | Productcontract en succescriteria | — | afgerond |
| 2 | `LRN-002` | Pilotcurriculum, lesoutline en contentgap-analyse | `LRN-001` | afgerond |
| 3 | `LRN-003` | Canonical learning-pathschema en authoringcontract | `LRN-002` | afgerond |
| 4 | `LRN-004` | Pipeline, validatie, indexes en tests | `LRN-003` | afgerond |
| 5 | `LRN-005` | Eerste echte lesson vertical slice | `LRN-002`, `LRN-004` | afgerond |
| 6 | `LRN-006` | Learn-catalogus en learning-pathoverzicht | `LRN-004`, `LRN-005` | afgerond |
| 7 | `LRN-007` | Lescontext en vorige/volgende-navigatie | `LRN-006` | afgerond |
| 8 | `LRN-008` | Volledig pilotcurriculum en ontbrekende basiscontent | `LRN-005`, `LRN-007` | afgerond |
| 9 | `LRN-009` | Anonieme, vervangbare lokale voortgang | `LRN-007`, `LRN-008` | afgerond |
| 10 | `LRN-010` | Integrale UX-, accessibility- en content-QA | `LRN-008`, `LRN-009` | afgerond |
| 11 | `LRN-011` | Anonieme pilot publiceren | `LRN-010` | afgerond |
| 12 | `LRN-012` | Werkelijk gebruik evalueren en product-/architectuurvervolg toetsen | `LRN-011` + werkelijk gebruik | gepland, tijdgebonden |
| 13 | `LRN-013` | Volgend curriculum en concrete lessonbatches voorbereiden | Bestaande contentinventaris; geen gebruiksgate | afgerond, curriculum goedgekeurd |
| 14 | `LRN-014` | Wijngaardlessen 1–3: plant/jaarcyclus, klimaat/plek, bodem/water | Goedgekeurd `DEC-LRN-015` | afgerond |
| 15 | `LRN-015` | Wijngaardlessen 4–6: loofwand, voeding/vloer en risico | `LRN-014`, goedgekeurd curriculum | afgerond |
| 16 | `LRN-016` | Wijngaardlessen 7–8: rijpheid/oogst en teeltsystemen | `LRN-015`, goedgekeurd curriculum | open |
| 17 | `LRN-017` | Volledig wijngaardpad integreren, toetsen en publiceren | `LRN-014–016`, goedgekeurd curriculum | open |

`LRN-001–011` vormen de afgeronde MVP-volgorde. Vanaf het prioriteitsbesluit
van 2026-10-12 loopt **inhoudelijke uitbreiding via LRN-013–017 onafhankelijk
van LRN-012**: een site zonder gebruikers hoeft niet op gebruiksdata te wachten
om meer lessen te krijgen. Gebruiksevaluatie, accounts, sync en personalisatie
blijven afzonderlijke beslissingen. De [productroadmap](product-roadmap.md)
ordent dit werk naast Explore en Atlas; geen volgende lessonbatch wordt
stilzwijgend gebouwd vóór goedkeuring van haar curriculumbrief.

## Tickets

### `LRN-001` — Productcontract en succescriteria vastleggen

- **Status:** afgerond
- **Doel:** vastleggen wat de anonieme Learn-MVP voor een gebruiker moet doen en
  hoe we bepalen of de pilot bruikbaar is.
- **Werk:**
  - beschrijf de primaire beginnende gebruiker en diens beginsituatie;
  - bepaal het verschil tussen een lesson, learning path, entitypagina en
    optionele naslag;
  - bepaal de gewenste gebruiksflow van Learn-landingspagina tot laatste les;
  - formuleer observeerbare succescriteria voor begrip, navigatie en voortgang;
  - leg vast welke analytics of gebruiksdata niet nodig zijn voor de pilot;
  - actualiseer verouderde statuspassages in de architectuurdocumentatie zonder
    roadmapwerk als reeds geïmplementeerd te presenteren.
- **Beslismomenten:** `DEC-LRN-001`, `DEC-LRN-002` en `DEC-LRN-003`.
- **Voortgang:** 2026-09-23 — verouderde statuspassages over bronnen,
  Bordeaux-dependencies, narratives en provenance in
  `knowledge-architecture.md` gecorrigeerd. De primaire gebruiker,
  succescriteria en publieke terminologie zijn besloten en vastgelegd in
  `learn-product-brief.md`.
- **Klaar wanneer:** één korte productbrief door de gebruiker is goedgekeurd en
  alle vervolgtickets tegen dezelfde doelgroep, terminologie en succescriteria
  kunnen worden getoetst.
- **Buiten scope:** lesinhoud schrijven, schema's of UI implementeren.

### `LRN-002` — Pilotcurriculum en contentgap-analyse ontwerpen

- **Status:** afgerond
- **Doel:** eerst de echte leerroute ontwerpen en pas daarna het generieke model.
- **Werk:**
  - kies het pilotonderwerp en de afbakening;
  - formuleer einddoelen en noodzakelijke voorkennis;
  - maak een geordende outline van vermoedelijk vijf tot zeven lessons;
  - schrijf per lesson leerdoelen, kernvragen, kernidee, koppeling naar het glas,
    benodigde visuals en bewuste niet-scope;
  - wijs bestaande entities en concepts toe als herbruikbare kennis;
  - selecteer per lesson de relevante entityblocks of kennisclaims zonder
    contentdepth automatisch naar curriculumniveau te vertalen;
  - inventariseer ontbrekende entities, lessons, bronnen en media;
  - bepaal welke ontbrekende onderwerpen noodzakelijk zijn voor de pilot en
    welke naar een later leerpad mogen;
  - controleer expliciet dat het pilotpad niet onnodig Bordeaux-centraal wordt.
- **Beslismomenten:** `DEC-LRN-004`, `DEC-LRN-005`, `DEC-LRN-006`,
  `DEC-LRN-007` en `DEC-LRN-014`.
- **Voortgang:** 2026-09-23 — onderwerp, pilotniveau en publieke niveaunamen
  zijn besloten. De voorgestelde zeven lessen, exacte hergebruikselectie en
  contentgaps staan in
  `../editorial/briefs/learning-path.from-grape-to-still-wine.md`. De gebruiker
  heeft de lessonindeling en viticultuurgrens op 2026-09-23 goedgekeurd.
- **Klaar wanneer:** de gebruiker de pathoutline en lessonbriefs heeft
  goedgekeurd, de dependencylijst compleet is en iedere contentgap een eigenaar
  en plaats in de werkvolgorde heeft.
- **Buiten scope:** definitieve prose schrijven en een universeel curriculum
  voor alle wijnkennis ontwerpen.

### `LRN-003` — Canonical learning-pathschema en authoringcontract ontwerpen

- **Status:** afgerond
- **Doel:** learning paths als geordende, gelokaliseerde view op bestaande
  canonical content modelleren.
- **Werk:**
  - kies de package- en bestandsstructuur;
  - definieer stable path- en step-ID's, status, slugs, titels, beschrijving,
    doelgroep, curriculumniveau, leerdoelen en geordende targets;
  - modelleer curriculumniveau los van entity- en blockdepth;
  - leg vast hoe core lessons en optionele entitynaslag van elkaar verschillen;
  - leg vast hoe prerequisite- of vervolgrelaties worden behandeld zonder een
    tweede kennisgraaf te maken;
  - definieer draft-, active- en deprecatedgedrag;
  - documenteer canonical route, lokale aliases en NL/EN-eigendom;
  - werk `knowledge-architecture.md`, `project-map.md` en de authoringdocumentatie
    bij als besloten contract, maar nog niet als geïmplementeerd gedrag.
- **Beslismomenten:** `DEC-LRN-008`, `DEC-LRN-009` en `DEC-LRN-010`.
- **Voortgang:** 2026-09-23 — een minimaal v1-contract is uitgewerkt in
  `learning-paths.md`. De gebruiker heeft de drie architectuurbesluiten over
  core steps, pathproza en prerequisites goedgekeurd; het contract is verwerkt
  in de architectuur-, project- en authoringdocumentatie.
- **Klaar wanneer:** het contract de goedgekeurde pilot zonder uitzonderingen
  kan beschrijven, feiten niet dupliceert en een expliciete definition of done
  heeft voor implementatie.
- **Buiten scope:** voortgang, accounts, quizresultaten en gebruikersprofielen.

### `LRN-004` — Learning paths in pipeline en runtimebundle opnemen

- **Status:** afgerond
- **Doel:** het authoringcontract uitvoerbaar en betrouwbaar maken.
- **Werk:**
  - voeg strikte modelschema's en Typescripttypen toe;
  - ontdek en parse learning-pathpackages deterministisch;
  - valideer unieke IDs/slugs, NL/EN-pariteit, status en bekende step-targets;
  - voorkom actieve paths naar niet-actieve verplichte content;
  - valideer dat curriculumniveau en contentdepth verschillende velden en
    betekenissen houden;
  - genereer path-, target- en reverse-membershipindexes;
  - neem paths op in de ene reproduceerbare runtimebundle;
  - voeg gerichte unit-tests, foutmeldingen en contentcommandodocumentatie toe;
  - beslis pas na herhaald handwerk of een packagegenerator waarde toevoegt.
- **Klaar wanneer:** een geldige pilotfixture bouwt, alle relevante ongeldige
  varianten vroeg falen en bestaande entity- en narrativebuilds onveranderd
  blijven werken.
- **Voortgang:** 2026-09-23 — schema v1, deterministische ontdekking,
  target- en lifecyclevalidatie, runtime-opname, sluglookups en omgekeerde
  lessonmembership zijn geïmplementeerd. Een zeven-lessenfixture en gerichte
  foutgevallen zijn met unit-tests afgedekt. Er is bewust nog geen generator:
  één handgeschreven pilotpackage rechtvaardigt die abstractie nog niet.
- **Verificatie:** formatter, lint, typecheck, unit-tests, `content:check` en
  deterministische `content:build`.

### `LRN-005` — Eerste echte lesson als volledige vertical slice maken

- **Status:** afgerond
- **Voortgang:** 2026-09-23 — de actieve, tweetalige les **De druif als
  grondstof** is gepubliceerd als eerste core step van het draftleerpad. De les
  verbindt besopbouw, meervoudige rijpheid, oogstmoment en fruitgezondheid in
  één didactische boog, hergebruikt de geregistreerde druivendoorsnede en linkt
  canonical naslag zonder entityproza te kopiëren. De narrativepagina en de
  bestaande Learn-index zijn op 390 en 1440 CSS-pixels gecontroleerd; content,
  tabel, beeld, bronnen en contextkolom reflowen correct.
- **Nacontrole:** 2026-09-23 — de leskoppen zijn aangescherpt als directe
  leerbakens, een educatieve procesillustratie van oogst via sortering naar
  kelderontvangst is toegevoegd en de verplichte visual-opportunity-check voor
  toekomstige lessons is in de authoring- en schrijfrichtlijnen vastgelegd.
- **Verificatie:** `content:check`, deterministische `content:build`, desktop- en
  mobiele visuele controle; volledige repositorycheck bij afsluiting van het
  ticket.
- **Doel:** contentcontract, renderer en didactische kwaliteit bewijzen met echte
  inhoud voordat de hele Learn-UI wordt gebouwd.
- **Werk:**
  - onderzoek en schrijf NL en EN volgens de goedgekeurde lessonbrief;
  - gebruik de expliciet geselecteerde entityblocks en claims als inhoudelijke
    input, onafhankelijk van hun lokale depthlabel;
  - gebruik summary, objectives, sections, key idea en in-the-glass bewust;
  - verbind bestaande entities met stable links en voeg alleen noodzakelijke
    nieuwe canonical content toe;
  - selecteer of maak inhoudelijk noodzakelijke media volgens het mediabeleid;
  - controleer volledigheid, niveau, bronnen, schrijfstijl en
    vertaalgelijkwaardigheid;
  - beoordeel de bestaande narrativepagina met echte lescontent op mobiel en
    desktop.
- **Klaar wanneer:** één actieve, inhoudelijk volwaardige lesson publiek kan
  renderen en als eerste core step in het draftleerpad voorkomt.
- **Buiten scope:** tijdelijke fixtureprose als eindresultaat en het volledige
  pilotcurriculum.

### `LRN-006` — Learn-catalogus en learning-pathoverzicht bouwen

- **Status:** afgerond
- **Doel:** gebruikers een leerpad laten kiezen en vóór de start laten begrijpen
  wat zij gaan leren.
- **Werk:**
  - vervang de huidige lege Learn-state door een schaalbare catalogus van actieve
    paths en waar passend zelfstandige lessons;
  - bouw een canonical pathpagina met beschrijving, doelgroep, leerdoelen,
    vereiste voorkennis, lessonvolgorde en onderscheid tussen core en naslag;
  - bouw een eindbestemming met recap, aanmoediging en authored
    vervolgsuggesties;
  - toon draftcontent niet als publiek aanbod;
  - voeg metadata, sitemapgedrag en eerlijke lege/incomplete states toe;
  - houd de presentatie bruikbaar bij één, tientallen en later veel paths zonder
    voortijdig een zware taxonomie te introduceren.
- **Klaar wanneer:** een gebruiker het pilotpad kan vinden, de scope begrijpt en
  de eerste lesson kan starten zonder account.
- **Verificatie:** unit-tests en Playwright op smal en breed scherm, keyboard en
  correcte active/draft-discovery.
- **Opgeleverd op 2026-09-23:** de Learn-catalogus toont actieve leerpaden en
  actieve zelfstandige lessen als afzonderlijk aanbod; de canonical pathpagina
  maakt niveau, doelgroep, leerdoelen, voorkennis, kernstappen en naslagrol
  expliciet; de afsluitpagina bevat een authored recap, aanmoediging en
  vervolgsuggesties. Alleen actieve paden komen in catalogus, routes, metadata
  en sitemap. De responsive UI is op smal en breed scherm beoordeeld en routing,
  lifecycle en discovery zijn geautomatiseerd getest.
- **Lifecycle-notitie:** het pilotpad blijft bewust `draft` zolang de zes overige
  kernlessen ontbreken. De volledige actieve ervaring is tijdens ontwikkeling
  tijdelijk als preview gecontroleerd en daarna teruggezet. Definitieve
  activatie en publieke vindbaarheid horen bij `LRN-008`; tot die tijd blijft de
  volwaardige eerste les eerlijk als zelfstandige les in de catalogus staan.

### `LRN-007` — Leerpadcontext en vorige/volgende-navigatie toevoegen

- **Status:** afgerond
- **Doel:** een canonical lesson binnen een gekozen leerpad als onderdeel van een
  volgorde laten voelen zonder een tweede lesson-URL te maken.
- **Werk:**
  - draag pathcontext deelbaar en valideerbaar over naar de canonical lessonroute;
  - toon pathnaam, huidige positie en vorige/volgende core step;
  - bied een duidelijke terugweg naar het pathoverzicht;
  - laat de laatste core lesson logisch doorlopen naar de succesbestemming;
  - laat een lesson zonder pathcontext zelfstandig en volledig bruikbaar;
  - negeer onbekende of ongeldige context veilig;
  - voorkom dat query- of clientstaat de canonical metadata vervuilt.
- **Beslismoment:** `DEC-LRN-011`.
- **Klaar wanneer:** directe, standalone en pathgebonden lessonbezoeken allemaal
  correcte navigatie, canonical URL en focus/scrollgedrag hebben.
- **Verificatie:** routingtests en Playwright voor direct bezoek, refresh,
  deep-link, vorige/volgende, mobiel en toetsenbord.
- **Opgeleverd op 2026-09-23:** pathpagina's linken naar de bestaande canonical
  lessonroute met een gevalideerde `path`-queryparameter. Een geldige context
  toont pathnaam, positie, terugweg en vorige/volgende-navigatie; de laatste
  core lesson verwijst naar de afsluitpagina. Directe lessonbezoeken blijven
  zelfstandig bruikbaar en ontbrekende, dubbele, onbekende, draft- of foutieve
  context wordt genegeerd. Canonical metadata blijft query-onafhankelijk en de
  narrativepagina blijft statisch genereerbaar doordat alleen het kleine
  contextcomponent de query client-side leest.
- **QA-notitie:** de echte pilotdata is tijdelijk actief gemaakt voor visuele
  controle op 390 en 1440 pixels, keyboardfocus, deep-link en doorloop naar de
  afsluiting, en daarna teruggezet naar `draft`. Pure tests dekken ook een
  meerstapspad met zowel vorige als volgende core lesson; definitieve publieke
  end-to-enddekking volgt automatisch wanneer `LRN-008` het complete pad
  activeert.

### `LRN-008` — Pilotcurriculum en vereiste basiscontent voltooien

- **Status:** afgerond
- **Doel:** een klein maar inhoudelijk volledig leerpad publiceren, niet alleen
  een technische demo.
- **Werk:**
  - schrijf en review alle goedgekeurde lessons in NL en EN;
  - maak uitsluitend de door `LRN-002` aangetoonde ontbrekende entities;
  - controleer lesovergangen, herhaling en opbouw over het hele pad;
  - voorkom dat lessons entityproza kopiëren of alleen uit linklijsten bestaan;
  - voeg relevante foto's, procesvisuals of diagrammen toe;
  - voer per lesson dezelfde completeness-iteratie uit als bij entitycontent;
  - controleer het geheel tegen het afgesproken curriculumniveau en niet alleen
    per losse pagina.
- **Klaar wanneer:** alle core steps actief, volledig, tweetalig, bronmatig
  verantwoord en prettig achter elkaar te volgen zijn.
- **Buiten scope:** alle mondiale viticultuur- en vinificatiecontent vooraf
  compleet maken.
- **Opgeleverd op 2026-09-23:** alle zeven kernlessen zijn actief, tweetalig en
  in de goedgekeurde volgorde verbonden. De zes nieuwe lessen behandelen
  ontvangst en persen, alcoholische vergisting, de witte/rosé/rode routes,
  processen na de hoofdgisting, rijping en bescherming, en voorbereiding plus
  botteling. Vier aantoonbaar herbruikbare hiaten hebben een eigen actieve
  conceptentity gekregen: persen, zwaveldioxide, klaring en fining, en
  botteling. Kleinere verbindingsstappen zoals sorteren, ontstelen, overhevelen,
  filtratie en stabilisatie blijven lessonproza totdat zelfstandig hergebruik
  een verdere entitygrens rechtvaardigt.
- **Inhouds- en visual-QA:** iedere lesson bevat directe leerdoelen, heldere
  leerbakens, een glas-koppeling, kernidee en betekenis-equivalente NL/EN-opbouw.
  Vier nieuwe procesillustraties zijn op apparatuur, materiaal, volgorde,
  schaal, captions en mobiele leesbaarheid beoordeeld; relevante bestaande
  documentaire foto's en de liesprocesvisual zijn hergebruikt. Het pad bevat
  geen dragende Bordeaux-voorbeelden en blijft op het afgesproken niveau Wijn
  begrijpen, globaal WSET Level 2 plus.
- **Publicatie:** het volledige path is na integrale controle van `draft` naar
  `active` gegaan. Catalogus, zeven posities, vorige/volgende-links,
  standalonefallback en de succesbestemming zijn op 390 en 1440 pixels
  gecontroleerd zonder horizontale pagina-overflow.

### `LRN-009` — Anonieme lokale voortgang vervangbaar implementeren

- **Status:** afgerond
- **Doel:** terugkerende gebruikers lokaal laten doorgaan zonder accounts of
  backend, via een later vervangbare opslaggrens.
- **Werk:**
  - definieer een kleine progressinterface en een versieerbaar record;
  - implementeer een defensieve browseradapter;
  - laat gebruikers steps bewust voltooien of heropenen;
  - toon afgeleide voortgang en een doorgaanactie op catalogus en pathpagina;
  - laat de succesbestemming alleen een persoonlijke voltooiingsclaim tonen
    wanneer de vereiste steps volgens de lokale staat voltooid zijn;
  - bied resetfunctionaliteit met duidelijke gevolgen;
  - behandel ontbrekende, corrupte, verouderde of geblokkeerde opslag zonder
    content of navigatie te blokkeren;
  - documenteer welke interface een toekomstige API-adapter moet behouden;
  - voeg nog geen account-, sync- of mergegedrag toe.
- **Beslismomenten:** `DEC-LRN-012` en `DEC-LRN-013`.
- **Klaar wanneer:** lokale progressie refresh en navigatie overleeft, zonder
  JavaScript/opslag nog steeds een volledige leerervaring bestaat en de UI niet
  rechtstreeks van `localStorage` afhankelijk is.
- **Verificatie:** hook/store-unit-tests en Playwright voor first visit,
  voltooien, heropenen, refresh, reset, corrupte opslag en storage failure.
- **Opgeleverd op 2026-09-23:** de UI gebruikt één vervangbare
  `LearningProgressRepository` voor laden, opslaan, wissen en synchroniseren.
  Het versieerbare record bewaart alleen path-ID, voltooide stabiele step-ID's
  en `updated_at`; aantallen, percentages, vervolgactie en volledige status
  worden afgeleid. De lokale adapter valt bij onbeschikbare opslag terug op
  tijdelijk sessiegeheugen zonder lessen of navigatie te blokkeren. Dezelfde
  interface en payload kunnen later door een accountgebonden API- en
  databaseadapter worden geleverd.
- **UX:** iedere pathgebonden lesson toont boven en onder een toegankelijke,
  omkeerbare toggle tussen **Nog te leren** en **Les voltooid**. Catalogus en
  pathpagina tonen afgeleide voortgang en een passende doorgaanactie; de
  pathpagina ondersteunt een expliciet bevestigde reset. De afsluitpagina doet
  alleen bij alle gemarkeerde steps een persoonlijke voltooiingsclaim.
  Navigeren, openen en de afsluiting bekijken wijzigen nooit vanzelf de staat.
- **Gecontroleerd:** corrupte, toekomstige en geblokkeerde opslag, refresh,
  reset, synchronisatie tussen beide toggles, de volledige afronding, mobiel,
  desktop en navigatie zonder JavaScript. Formatter, lint, typecheck, 125
  unit-tests, relation-audit, production build en 10 gerichte Playwrighttests
  slagen.
- **Visuele nacontrole 2026-09-23:** de volledige voortgangsflow is opnieuw
  beoordeeld op 375, 768, 1024 en 1440 CSS-pixels, inclusief lege,
  gedeeltelijke en voltooide staat, resetbevestiging, hover en keyboardfocus.
  Actieknoppen hebben consistente padding en minimaal 44 pixels
  aanraakhoogte; hoverstates veranderen geen geometrie; de lesson-toggle en het
  voortgangspaneel behouden hun afmetingen bij een gewone statewissel; kleine
  buttoncopy heeft aangescherpt contrast. Alle vier de publieke Learn-views
  blijven op iedere gecontroleerde breedte vrij van horizontale overflow.

### `LRN-010` — Integrale Learn-QA en releasegereedheid

- **Status:** afgerond
- **Doel:** inhoud, didactiek, techniek en UI als één productflow beoordelen.
- **Werk:**
  - voer een inhoudelijke curriculumreview uit op volledigheid, volgorde,
    niveau, herhaling, bronkwaliteit en wereldwijde toepasbaarheid;
  - controleer alle links, media, rechten, captions en NL/EN-pariteit;
  - test responsive gedrag op 375, 768, 1024 en 1440 CSS-pixels;
  - test keyboard, focus, headings, landmarks, zoom, reduced motion en
    fouttoestanden;
  - test terugkeer van Learn naar Explore en omgekeerd;
  - voer repositorybrede checks en relevante Playwrightsuite uit;
  - registreer resterende bevindingen in de algemene onderhoudsbacklog als ze de
    release niet blokkeren.
- **Klaar wanneer:** de volledige anonieme journey geen blockerende inhoudelijke,
  toegankelijkheids-, responsive-, routing- of progressproblemen heeft.
- **Opgeleverd op 2026-09-23:** de volledige catalogus–pad–lesson–afsluitflow en
  alle zeven lessen zijn inhoudelijk, tweetalig, visueel en technisch
  beoordeeld. De curriculumvolgorde, WSET 2-pluskalibratie, wereldwijde
  toepasbaarheid, 35 unieke bronrecords, mediarechten, captions en NL/EN-pariteit
  zijn gecontroleerd. De review staat in
  `../editorial/learn-release-qa-2026-09-23.md`.
- **Direct gecorrigeerd:** skiplinks verplaatsen nu ook toetsenbordfocus;
  resetten of annuleren van voortgang heeft voorspelbaar focusherstel; een
  canonical entitybacklink herstelt bij precies één actief pad de geldige
  lessoncontext. Gerichte regressietests dekken deze gevallen.
- **Gecontroleerd:** alle Learn-views op 375, 768, 1024 en 1440 CSS-pixels,
  200%-reflow, reduced motion, headings, landmarks, media, interne links,
  storagefouten, navigatie zonder JavaScript en Learn–Explore–Learn. Er zijn
  geen blockerende bevindingen en geen nieuwe onderhoudstickets.

### `LRN-011` — Anonieme pilot publiceren

- **Status:** afgerond
- **Doel:** de volledig gevalideerde anonieme leerervaring beschikbaar maken
  zonder al conclusies te trekken over nog niet geobserveerd gebruik.
- **Werk:**
  - voer de afgesproken release- en deploymentchecks uit;
  - publiceer het pilotpad en controleer de productieomgeving;
  - leg vast vanaf welke datum en met welke versie de pilot werkelijk gebruikt
    kan worden;
  - maak duidelijk dat voortgang lokaal op het huidige apparaat wordt bewaard;
  - registreer alleen vooraf goedgekeurde, privacyvriendelijke gebruikssignalen;
  - maak herstel- en rollbackstappen expliciet.
- **Klaar wanneer:** het pilotpad publiek, stabiel en observeerbaar is en
  `LRN-012` pas na een betekenisvolle gebruiksperiode kan starten.
- **Opgeleverd op 2026-09-23:** release `50b1cb5` is publiek beschikbaar op
  `https://wine-portal.vercel.app`. Catalogus, leerpad, lessons, afsluiting en
  canonical naslag zijn in productie gecontroleerd. De bestaande
  Learn-Playwrightsuite kan via `PLAYWRIGHT_BASE_URL` zonder lokale server als
  niet-destructieve live smoke-suite draaien; alle 17 scenario's zijn op 24
  september 2026 tegen Vercel geslaagd.
- **Privacy en observatie:** er is geen nieuwe analytics- of trackinglaag
  toegevoegd; voortgang blijft lokaal. Kwalitatieve feedback is het primaire
  pilotsignaal. De minimale observatieperiode loopt tot en met 21 oktober 2026
  en wordt verlengd als werkelijk gebruik nog onvoldoende bewijs oplevert.
- **Runbook:** scope, checks, privacygrens en herstelstappen staan in
  `learn-pilot-release.md`. Rollback gebruikt een Vercel-redeploy of normale
  `git revert`, nooit het herschrijven van gedeelde geschiedenis.

### `LRN-012` — Werkelijk gebruik evalueren en vervolgarchitectuur besluiten

- **Status:** gepland
- **Doel:** pas na een echte gebruiksperiode bepalen welke uitbreiding
  aantoonbare waarde heeft.
- **Werk:**
  - leg kwalitatieve bevindingen en waar beschikbaar privacyvriendelijke
    gebruikssignalen vast;
  - beoordeel of leslengte, volgorde, lokale voortgang en entityverwijzingen
    werken zoals bedoeld;
  - toets huidige en voorgenomen leerpaden aan werkelijk gebruik; inhoudelijke
    voorbereiding/publicatie via LRN-013–017 hoeft hier niet op te wachten;
  - neem afzonderlijke go/no-go-besluiten over accounts, remote progress, API,
    database, quizzen en andere personalisatie;
  - maak bij een backendbesluit een nieuwe roadmap met authenticatie, privacy,
    migratie, mergegedrag, API-contract, datamodel en operationeel beheer;
  - archiveer afgeronde Learn-tickets niet buiten dit document.
- **Startvoorwaarde:** de pilot is lang genoeg werkelijk beschikbaar geweest om
  niet alleen interne verwachtingen te evalueren; de benodigde periode wordt bij
  publicatie vastgelegd.
- **Vroegste evaluatiemoment:** 2026-10-22, mits er voldoende werkelijk gebruik
  of gerichte gebruiksgesprekken zijn vastgelegd; anders blijft het ticket
  gepland en wordt de observatieperiode verlengd. Gebruikersmelding 2026-10-12:
  er zijn nog geen gebruikers; een verstreken kalendertermijn is geen evaluatiebewijs.
- **Klaar wanneer:** de pilotuitkomst is vastgelegd en ieder vervolg een
  expliciet besluit heeft in plaats van een impliciete uitbreiding van de MVP.

### `LRN-013` — Volgend curriculum en lessonbatches voorbereiden

- **Status:** afgerond; **prioriteit:** hoog; **categorieën:** content, product-ux.
- **Herkomst/log:** gebruikersprioriteit 2026-10-12 — meer content, vooral lessen,
  vóór feedback en backend; als concrete volgende voorbereidingsronde geregistreerd.
- **Doel:** van de brede wens voor meer lessen naar een reviewbare curriculumbrief
  en afgebakende publicatiebatch, zonder nieuw LMS- of opslagmodel.
- **Werk:** vergelijk leerwaarde en beschikbare naslag van kandidaatonderwerpen
  (waaronder een wijngaardleerpad); kies een gemotiveerd voorstel voor doelgroep,
  niveau, leerdoelen, lesvolgorde en zelfstandige leswaarde. Inventariseer per les
  bestaande canonical owners/blocks, noodzakelijke gaps, bronnen, NL/EN en visuals.
  Maak concrete batches/volgorde, inclusief raakvlakken met EXP-032/026 en Atlas.
  Een wijngaardpad is kandidaat, nog geen gekozen curriculum.
- **Afhankelijkheden:** bestaande Learn-/contentcontracten; geen LRN-012-,
  feedback-, account-, database- of Atlasvoorwaarde voor de brief.
- **Klaar wanneer:** één onderbouwde brief met gap-analyse en uitvoerbare eerste
  lessonbatch ter review klaarstaat; DEC-LRN-015 is expliciet gekozen of nog open
  gemarkeerd, geen stilzwijgende authoringvrijgave. Blijkt de publicatiebatch te
  groot, splits LRN-014 vóór uitvoering met nieuwe permanente IDs.
- **Verificatie:** handmatige curriculum-/ownershipreview tegen
  learning-paths.md, content-blocks.md en de redactionele policies. Geen claim
  dat dit gebruikersonderzoek of gepubliceerde lessen oplevert.

- **Uitvoering 2026-10-12:** [curriculumvoorstel](../editorial/briefs/learning-path.vine-and-vineyard.md)
  gereed: vergelijking met methode-, waarnemings- en regionale curricula; acht
  voorgestelde lessen; bestaande NL/EN-blocks, bronrecords en media gecontroleerd;
  gaps en buiten-scope REG-003-werk onderscheiden. Oorspronkelijk te grote LRN-014
  gesplitst naar LRN-014–017. DEC-LRN-015 was toen nog open; geen canonical lesson/path
  aangemaakt en geen gebruikersonderzoek geclaimd.

### `LRN-014` — Wijngaardbatch 1: plant, jaarcyclus en omgeving

- **Status:** afgerond; **prioriteit:** hoog; **categorieën:** content, research, testing.
- **Herkomst/log:** 2026-10-12 — oorspronkelijke brede publicatiescope opgesplitst
  na LRN-013; deze ID blijft eigenaar van de eerste batch.
- **Doel/scope:** schrijf en publiceer de drie complete standalone lessen
  **De wijnstok door het jaar**, **Klimaat, weer en de plek van de stok** en
  **Bodem, wortels en beschikbaar water** uit de
  [curriculumbrief](../editorial/briefs/learning-path.vine-and-vineyard.md).
- **Werk:** verifieer gekozen input per les; schrijf eigen NL/EN-uitleg, leerdoelen,
  kernidee, glas-koppeling, gerichte naslag en beoordeel bestaand beeld. Leg de
  gekozen lesson-IDs na akkoord vast. Nog geen path met onbekende lessontargets.
- **Afhankelijkheden:** LRN-013 afgerond en DEC-LRN-015 expliciet goedgekeurd;
  noodzakelijke nieuw ontdekte gaps vóór publicatie een owner geven. EXP-032/026,
  Atlas, feedback en gebruikersaantallen zijn geen generieke voorgangers.
- **Klaar wanneer:** drie actieve, complete tweetalige lessen hun eigen leervragen
  beantwoorden, bronnen/beelden gereviewd zijn en standalone discovery werkt.
  Dit sluit het volledige leerpad niet; pathactivatie hoort bij LRN-017.
- **Verificatie:** bron-/didactiek-/NL/EN-review, npm run format/check en relevante
  e2e; desktop/mobile/keyboard/no-JS. Nieuwe PNG alleen bij echte teaching gap.
- **Uitvoering 2026-10-12:** drie actieve NL/EN-lessons gepubliceerd onder
  `narrative.lesson.vine-through-year`, `narrative.lesson.climate-site-and-season`
  en `narrative.lesson.soil-roots-and-water`. Eigen uitleg, oefeningen met
  beredeneerde antwoorden en drie herbeoordeelde PNG's; tien bestaande
  bronrecords opnieuw geraadpleegd. Learn-losse-lessen, Verdiepingen, zoeken en
  naslagteruglinks werken. [Batchreview QCR-2026-10-12-04](../editorial/vineyard-lessons-batch-1-review-2026-10-12.md):
  format/check, 184 unit-tests, productiebuild en 171 browsertests geslaagd;
  NL/EN op 320/1440px, keyboard, no-JS en visuele steekproef gecontroleerd.
  Eén bestaand path blijft actief; geen nieuw path of voortgangsclaim.

### `LRN-015` — Wijngaardbatch 2: werk aan stok en bodem, risico

- **Status:** afgerond; **prioriteit:** hoog; **categorieën:** content, research, testing.
- **Herkomst/log:** 2026-10-12 — zelfstandig uitvoerbare tweede batch uit LRN-013.
- **Doel/scope:** drie lessen **Snoei, loofwand en gewasbelasting**, **Voeding en
  leven op de wijngaardvloer**, **Risico herkennen en de wijngaard beschermen**.
- **Werk:** gecontroleerde NL/EN-synthese, verbinding met batch 1, beperkte
  hypothetische toepassingen en bestaande media. Behandel symptomen/meetwaarden
  als onderzoeksvragen; geen uitvoerende doserings- of bestrijdingsrecepten.
- **Afhankelijkheden:** LRN-014 en goedgekeurd DEC-LRN-015; hergebruik canonical
  owners, scheid bredere REG-003-gaps van deze basisroute.
- **Klaar wanneer:** drie complete actieve lessen, gecontroleerde bronnen en
  beelden, begrijpelijke overgangen en betekenis-equivalente NL/EN-opbouw.
- **Verificatie:** dezelfde lesson-/source-/mediareview en format/check/e2e als
  LRN-014, inclusief responsive, toetsenbord en no-JS. Nog geen pathactivatie.

- **Uitvoering 2026-10-12:** drie complete standalone lessen in NL/EN actief,
  met eigen verklaringsboog, leerdoelen, beredeneerde oefening en glas-koppeling.
  Elf bestaande bronrecords heropend en drie PNG's opnieuw beoordeeld; geen
  nieuwe entities, assets of runtimewijzigingen. Naslag, teruglinks en discovery
  gebruiken bestaande afleiding. [Batchreview QCR-2026-10-12-05](../editorial/vineyard-lessons-batch-2-review-2026-10-12.md):
  format/check, 184 unit-tests, productiebuild en 173 browsertests geslaagd;
  NL/EN, 320/1440px, keyboard, no-JS en visuele steekproef gecontroleerd.
  Zes van acht wijngaardlessen actief; LRN-016 volgt, pathactivatie blijft LRN-017.

### `LRN-016` — Wijngaardbatch 3: rijpheid, oogst en teeltsystemen

- **Status:** open; **prioriteit:** hoog; **categorieën:** content, research, testing.
- **Herkomst/log:** 2026-10-12 — laatste inhoudelijke batch uit LRN-013.
- **Doel/scope:** twee lessen **Rijpheid beoordelen en het oogstmoment kiezen**
  en **Teeltsystemen, duurzaamheid en aanpassen**.
- **Werk:** bronvaste NL/EN-uitleg, begrensde oogstbeslissing, praktijk/controle/
  resultaat onderscheiden; actuele normbronnen heropenen. Bewaak overlap met
  bestaande grondstofles en behoud haar IDs, zelfstandigheid en keldergerichte rol.
- **Afhankelijkheden:** LRN-015, goedgekeurd DEC-LRN-015 en passende research;
  geen verplichting de volledige oogst-/aanplantcatalogus van REG-003 af te maken.
- **Klaar wanneer:** beide lessen compleet actief, wederzijdse relevante links
  gecontroleerd, norm-/versiescope correct en geen ongeverifieerde cijfers/cases.
- **Verificatie:** bron-/overlap-/NL/EN-/mediareview en format/check/relevante e2e;
  beide talen, mobiel, toetsenbord en no-JS. Pathactivatie blijft LRN-017.

### `LRN-017` — Wijngaardleerpad integraal toetsen en publiceren

- **Status:** open; **prioriteit:** hoog; **categorieën:** content, product-ux, testing.
- **Herkomst/log:** 2026-10-12 — integratie/publicatie apart van de drie
  authoringbatches vastgelegd; geen onvolledig leerpad publiek presenteren.
- **Doel/scope:** acht goedgekeurde lessen tot één volledige anonieme leerroute
  verbinden volgens learning-paths.md en de curriculumbrief.
- **Werk:** maak het pathpackage met stabiele IDs en tweetalig contextproza,
  leerdoelen, recap en actieve vervolgtargets; controleer didactische boog,
  herhaling, naslag en glas-koppelingen over de hele route. Activeer na integrale QA.
- **Afhankelijkheden:** LRN-014/015/016 en goedgekeurd DEC-LRN-015; alle steps en
  completiontargets actief. Geen account-, feedback-, database- of Atlasgate.
- **Klaar wanneer:** route actief/vindbaar, iedere kernles in volgorde bruikbaar,
  afsluiting betekenisvol en lokale voortgang in beide talen werkt zonder oude
  pilotprogressie/IDs te wijzigen; inhoudelijke en productreview geregistreerd.
- **Verificatie:** volledige curriculum-/NL/EN-review, format/check en Learn-
  e2e voor discovery, pathcontext, vorige/volgende, completion, hervatten/reset,
  taalwissel, keyboard/mobile/no-JS en geblokkeerde opslag; media/rights/altreview.

## Beslisregister

Open beslissingen worden genomen in het genoemde ticket, vastgelegd met datum en
motivatie en daarna verwerkt in het relevante contract. Tot die tijd is de
aanbeveling richtinggevend maar niet bindend.

| ID | Beslissing | Nodig in | Huidige aanbeveling | Status |
| --- | --- | --- | --- | --- |
| `DEC-LRN-001` | Primaire pilotgebruiker | `LRN-001` | Eerste curriculumniveau: ongeveer WSET Level 2 plus, zonder diploma als toegangseis | besloten 2026-09-23 |
| `DEC-LRN-002` | Wat betekent succes zonder accounts of analytics? | `LRN-001` | Taakgerichte criteria plus een succesbestemming met recap, aanmoediging en vervolgsuggesties | besloten 2026-09-23 |
| `DEC-LRN-003` | Terminologie in de publieke UI | `LRN-001` | `Leerpad`, `les`, `onderdeel`, `naslag`, `voortgang` en `voltooid`; geen LMS- of schemataal | besloten 2026-09-23 |
| `DEC-LRN-004` | Onderwerp van het eerste leerpad | `LRN-002` | **Van druif naar stille wijn — hoe wijn wordt gemaakt** | besloten 2026-09-23 |
| `DEC-LRN-005` | Doelniveau van de pilot | `LRN-002` | Eerste curriculumniveau, globaal WSET Level 2 plus; publiek label nog te besluiten | besloten 2026-09-23 |
| `DEC-LRN-006` | Definitieve lessonindeling en aantal | `LRN-002` | Zeven lessons volgens de goedgekeurde curriculumbrief | besloten 2026-09-23 |
| `DEC-LRN-007` | Welke viticultuur hoort in het vinificatiepilotpad? | `LRN-002` | Alleen de druif- en oogstkennis die nodig is om de productiestappen te begrijpen | besloten 2026-09-23 |
| `DEC-LRN-008` | Mogen entitypagina's core steps zijn? | `LRN-003` | Alleen lesson-narratives zijn core steps; entities zijn naslag en tellen niet voor voortgang | besloten 2026-09-23 |
| `DEC-LRN-009` | Hoeveel gelokaliseerde prose bezit een path zelf? | `LRN-003` | Alleen compacte structurele UI-prose in tweetalige YAML; geen path-Markdown | besloten 2026-09-23 |
| `DEC-LRN-010` | Zijn prerequisites in v1 formele relaties? | `LRN-003` | Alleen menselijke, gelokaliseerde voorkennisbeschrijving; geen graph, gates of unlockregels | besloten 2026-09-23 |
| `DEC-LRN-011` | Hoe draagt een canonical lesson pathcontext? | `LRN-007` | Een gevalideerde, deelbare queryparameter; geen dubbele `/learn/.../lesson`-contentroute | besloten 2026-09-23 |
| `DEC-LRN-012` | Exact lokaal progressrecord en versiebeleid | `LRN-009` | Path-ID, schema-versie, voltooide step-ID's en `updated_at`; overige waarden afleiden; repositorygrens blijft vervangbaar door API/database | besloten 2026-09-23 |
| `DEC-LRN-013` | Wat betekent een step voltooien? | `LRN-009` | Expliciete omkeerbare toggle boven en onder de lesson; openen of navigeren voltooit niets | besloten 2026-09-23 |
| `DEC-LRN-014` | Publieke namen voor de drie curriculumniveaus | `LRN-002` | **Wijn begrijpen**, **Wijn verklaren** en **Wijn doorgronden**, met WSET 2+/3+/4+ als kalibrerende toelichting | besloten 2026-09-23 |
| `DEC-LRN-015` | Volgend curriculum: onderwerp, niveau, lesvolgorde en eerste publicatiebatch | Voorstel in `LRN-013`, sluiten vóór `LRN-014–017` | [Wijnstok en wijngaard](../editorial/briefs/learning-path.vine-and-vineyard.md): Wijn begrijpen, acht lessen, drie authoringbatches plus integratie | besloten 2026-10-12; expliciet gebruikersakkoord |

## Besluitenlog

| Datum | Besluit | Motivatie |
| --- | --- | --- |
| 2026-10-12 | LRN-015 afgerond; LRN-016 is de volgende inhoudelijke batch. | Zes van acht wijngaardlessen actief. De laatste twee vragen expliciete overlapreview rond oogst en actualiteits-/scopereview van teeltnormen; volledige pathpublicatie blijft LRN-017. |
| 2026-10-12 | LRN-014 afgerond; LRN-015 is de volgende inhoudelijke batch. | Drie complete standalone lessen zijn technisch en redactioneel gereviewd. De vijf resterende lessen en pathintegratie behouden eigen tickets; geen nieuwe generieke platformafhankelijkheid. |
| 2026-10-12 | DEC-LRN-015 gesloten: gebruiker keurt onderwerp, niveau, achtlessenvolgorde en publicatiebatches expliciet goed; LRN-014 gestart. | De vereiste curriculumgate is gehaald. Per batch blijven feitelijke, didactische en technische publicatiechecks nodig; het volledige path volgt in LRN-017. |
| 2026-10-12 | LRN-013 gereed met achtlessenvoorstel; brede LRN-014 vóór uitvoering gesplitst in drie authoringbatches en aparte pathpublicatie (LRN-014–017). DEC-LRN-015 blijft open. | Concrete inventaris toont beschikbare naslag, maar acht tweetalige lessen plus integratie is te groot voor één slice. Publicatie wacht op curriculumakkoord; geen generieke afhankelijkheid van wijnpagina's of Atlas. |
| 2026-10-12 | Meer lessen voorbereiden via LRN-013/014 zonder te wachten op LRN-012; curriculumgoedkeuring blijft vereist. | Gebruiker heeft nog geen gebruikers en wil eerst inhoudelijk aanbod vergroten; werkelijk gebruik blijft nodig om latere product-/architectuurkeuzes te toetsen. |
| 2026-09-23 | De eerste Learn-versie is anoniem en gebruikt geen accounts, API of database. | Eerst de didactische en navigatie-ervaring bewijzen; infrastructuur volgt pas uit aangetoonde gebruikersbehoefte. |
| 2026-09-23 | De tijdelijke progressimplementatie moet via een afgebakende opslaginterface vervangbaar zijn. | Een toekomstige account- of API-adapter mag geen herschrijving van canonical content of de volledige Learn-UI vereisen. |
| 2026-09-23 | Learn en fundamentele content worden als één vertical slice ontwikkeld. | Het pilotcurriculum bepaalt welke ontbrekende viticultuur- en vinificatiekennis werkelijk noodzakelijk is. |
| 2026-09-23 | Learn gebruikt drie curriculumniveaus rond WSET Level 2+, 3+ en 4+, los van de bestaande kennisdiepte op entitypagina's. | Onderwerp-niche en lokale blockdiepte zeggen niet rechtstreeks welke voorkennis of curriculumdiepgang een lesson vraagt. |
| 2026-09-23 | De pilot richt zich op het eerste, WSET Level 2-plus niveau. | Dit veronderstelt iets meer voorkennis dan een absolute beginner en sluit aan bij de gewenste inhoudelijke ambitie. |
| 2026-09-23 | Ieder leerpad krijgt een succesbestemming met recap, aanmoediging en vervolgsuggesties. | De leerervaring moet ook zonder toetsing een duidelijke, positieve afronding en logische volgende stap bieden. |
| 2026-09-23 | Het eerste leerpad heet **Van druif naar stille wijn — hoe wijn wordt gemaakt**. | Stille wijn geeft een inhoudelijk volledige maar beheersbare eerste productieroute; mousserend, zoet en versterkt krijgen later eigen leerpaden. |
| 2026-09-23 | De publieke curriculumniveaus heten **Wijn begrijpen**, **Wijn verklaren** en **Wijn doorgronden**. | De namen beschrijven de oplopende cognitieve taak en houden de WSET 2+/3+/4+-vergelijking zichtbaar als kalibratie in plaats van als productidentiteit. |
| 2026-09-23 | Het pilotpad bestaat uit zeven lessen van druif als grondstof tot wijn in de fles. | De volgorde vormt één complete productieroute met cognitief samenhangende lessen en houdt de hoeveelheid per les beheersbaar. |
| 2026-09-23 | Het pilotpad behandelt alleen kelderrelevante druif- en oogstkennis. | Volledige viticultuur verdient een eigen leerpad; deze grens voorkomt een oppervlakkige halve wijnbouwcursus binnen het vinificatiepad. |
| 2026-09-23 | Alleen lesson-narratives zijn core steps; entities blijven naslag zonder voortgang. | Een kernstap heeft een didactische boog nodig en gebruikers moeten duidelijk kunnen onderscheiden wat het pad vormt en wat vrijwillige verdieping is. |
| 2026-09-23 | Een learning path bezit alleen compacte tweetalige UI-prose in YAML en geen eigen Markdown. | Dit ondersteunt catalogus, context en afronding zonder een parallelle opslagplaats voor wijnkennis te maken. |
| 2026-09-23 | Prerequisites blijven in v1 menselijke tekst zonder formele relaties of toegangspoorten. | Het ene pilotpad heeft geen aantoonbare behoefte aan een tweede curriculumgraaf of blokkerend gedrag. |
| 2026-09-23 | Canonical lessonroutes ontvangen geldige leerpadcontext via `?path=<canonical-english-path-slug>`. | Een deelbare queryparameter bewaart één eigenaar en canonical URL per lesson, terwijl dezelfde content binnen een gekozen leerroute positie en navigatie kan tonen. |

## Definition of done voor de anonieme Learn-MVP

De anonieme Learn-MVP is gereed wanneer:

- minimaal één inhoudelijk volledig learning path actief is;
- iedere core lesson echte, gereviewde NL- en EN-content bevat;
- paths en steps canonical, stabiel, gevalideerd en geïndexeerd zijn;
- directe lessonroutes en pathgebonden navigatie dezelfde canonical content tonen;
- gebruikers zonder account kunnen starten, navigeren, voltooien en lokaal
  hervatten;
- ieder voltooid pad eindigt met een inhoudelijke recap, passende aanmoediging
  en authored vervolgsuggesties;
- de ervaring zonder beschikbare local storage functioneel blijft;
- progressopslag achter één gedocumenteerde, later vervangbare grens zit;
- relevante unit-, integratie- en Playwrighttests slagen;
- content, bronnen, media, toegankelijkheid en responsive presentatie integraal
  zijn beoordeeld;
- de releasecriteria van `LRN-011` zijn gehaald.

De oorspronkelijke MVP-evaluatie is pas afgerond nadat `LRN-012` op basis
van werkelijk gebruik afzonderlijke vervolg- of uitstelbesluiten heeft
vastgelegd voor accounts, API, database en toetsing.

De nieuwe inhoudelijke uitbreiding heeft eigen voltooiingsvoorwaarden in
LRN-013–017; de afgeronde MVP wordt daardoor niet opnieuw als onvoltooid aangemerkt.
