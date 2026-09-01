# Contentbrief: Bordeaux

Status: inhoudelijk goedgekeurd voor research

Deze brief is een tijdelijk redactioneel werkdocument voor de herschrijving van
`region.bordeaux`. Hij bevat een informatieontwerp en onderzoeksvragen, geen
goedgekeurde wijnfeiten. Zodra onderzoek een claim ondersteunt, verhuizen bron en
inhoud naar het sourceregister en de canonical content; de brief bewaart geen
parallel feitenarchief. De bestaande NL/EN-Markdown blijft staan tot research en
publication gate zijn afgerond.

## Diagnose van de huidige pagina

De huidige pagina heeft een aantrekkelijke opening en maakt het onderscheid
tussen regio en appellation terecht zichtbaar. De informatielast is daarna echter
scheef verdeeld:

- drie secties en een caveat gaan geheel of gedeeltelijk over assemblage;
- historisch belang, belangrijke deelgebieden, wijnsoorten en natuurlijke
  omstandigheden krijgen nauwelijks of geen plaats;
- termen als `appellation`, `assemblage`, `cuvée`, `terroir`, `INAO` en `CIVB`
  verschijnen voordat hun betekenis of rol duidelijk is;
- interne woorden als `provenance` en `entities` lekken in lezerscopy;
- advanced detail over partijen en cuvées verschijnt voordat het regionale
  basisbeeld compleet is;
- de drie huidige bronnen dekken vooral één Bordeaux-AOP, druiven en assemblage.
  Zij kunnen geen evenwichtige regiopagina dragen.

De herschrijving moet assemblage niet verwijderen, maar terugbrengen tot één
onderdeel van een veel groter verhaal.

## Veronderstelde voorkennis

De lezer weet globaal wat wijn en een druivenras zijn. De pagina veronderstelt geen
kennis van Bordeaux, Franse herkomstwetgeving, classificaties, vinificatie of een
examenprogramma zoals WSET. Een noodzakelijk begrip dat niet uit gewone taal
volgt, wordt bij eerste gebruik in dezelfde zin uitgelegd.

## Centrale lezersvraag

Als iemand “Bordeaux” op een fles, wijnkaart of in een boek ziet: wat kan die naam
dan precies betekenen, en welke volgende naam moet die zoeken om specifieker te
worden?

De beoogde navigatiefunnel is:

```text
Bordeaux → wijnsoort → appellation → producent → jaargang
                                      ↓
                         site / classificatie / concept
```

Niet ieder knooppunt hoeft vóór publicatie al een eigen actieve pagina te hebben.
De Bordeaux-pagina moet deze denkroute zelfstandig begrijpelijk maken.

## Paginabelofte

Na deze pagina kan een geïnteresseerde lezer:

1. Bordeaux globaal plaatsen rond stad, rivieren, estuarium en Atlantische invloed,
   zonder een tekstuele schets voor een wettelijke kaart aan te zien;
2. uitleggen waarom Bordeaux historisch meer is dan een verzameling beroemde
   châteaux;
3. begrijpen dat “Bordeaux” een regio én de naam van specifieke herkomstbenamingen
   kan zijn;
4. de belangrijkste regionale verschillen, wijnsoorten en druiven herkennen;
5. een etiket gebruiken om van de brede regio naar appellation, producent en
   jaargang door te vragen;
6. weten welke verdiepende begrippen en gebieden daarna het lezen waard zijn.

De pagina is geen lijst van alle appellations, geen producentenranglijst, geen
juridisch handboek en geen volledige geschiedenis. Zulke diepte hoort op
appellation-, classification-, concept- of narrativepagina's.

## Dekkingsmatrix

| Dimensie | Waarom noodzakelijk | Bestemming | Huidige dekking | Besluit voor herschrijving |
| --- | --- | --- | --- | --- |
| Identiteit en scope | Voorkomt dat regio, AOP en wijnstijl door elkaar lopen | Bordeaux, foundation | Gedeeltelijk | Behouden, maar zonder systeemtaal en met directe uitleg van `appellation` |
| Landschap en oriëntatie | Maakt de vele namen ruimtelijk begrijpelijk | Bordeaux, foundation; kaart later | Gedeeltelijk | Stad, rivieren, estuarium, oceaan en oevers als leesbare oriëntatie; geen verzonnen grenzen |
| Historische betekenis | Verklaart waarom Bordeaux wereldwijd zoveel taal en instituties rond wijn heeft gevormd | Bordeaux, foundation; langere geschiedenis later als narrative | Ontbreekt | Haven en handel als te onderzoeken narratieve ingang, niet als vooraf bewezen monocausale verklaring |
| Deelgebieden | Laat zien dat Bordeaux intern geen eenheid is | Bordeaux, foundation; eigen regio/appellation-entities later | Ontbreekt | Een navigeerbaar overzicht van de grote families, geen encyclopedische opsomming |
| Wijnsoorten en druiven | Corrigeert het beeld dat Bordeaux alleen rode cabernetblend is | Bordeaux, foundation | Gedeeltelijk | Kleuren/stijlen eerst, daarna hoofdrollen van druiven; uitzonderingen niet als lijstdump |
| Assemblage | Verklaart een belangrijke regionale werkwijze | Korte introductie op Bordeaux; eigen conceptentity voor echte verdieping | Oververtegenwoordigd | Eén compacte uitleg; techniek en uitzonderingen uitbesteden |
| Klimaat, water en bodem | Verklaart regionale variatie zonder terroirdeterminisme | Bordeaux, intermediate | Ontbreekt | Alleen brede, bronvaste contrasten; detail naar deelgebieden |
| Appellations en classificaties | Twee systemen worden vaak verward | Bordeaux, intermediate; links naar concept/classification | Gedeeltelijk | Functie en verschil uitleggen, geen complete juridische inventaris |
| Etiket en glas | Maakt kennis direct bruikbaar | Bordeaux, foundation | Gedeeltelijk | Appellation, kleur/stijl, producent en jaargang als leesvolgorde |
| Grenzen van vuistregels | Voorkomt dat linker-/rechteroever en druivenmix garanties worden | Bordeaux, advanced | Nauwelijks | Eén verdiepende sectie plus caveat, niet verspreid over alle basisalinea's |
| Bordeaux vandaag | Kan geschiedenis met huidige relevantie verbinden | Alleen duurzame context op Bordeaux; actualiteit eventueel als narrative | Ontbreekt | Geen verplichte sectie: alleen opnemen wanneer research een jarenlang bruikbare kern oplevert; cijfers en snelle ontwikkelingen als gedateerde assertions of elders |
| Specialistische details | Kunnen een regiopagina onleesbaar maken | Child entities/narratives | Niet van toepassing | Voor v1 geen specialist-block op Bordeaux zonder concrete lezersvraag |

Deze matrix is de completeness-gate. De pagina is pas klaar wanneer iedere rij is
geschreven, uitbesteed of bewust als open onderzoek is gemarkeerd.

## Voorgestelde leesvolgorde

| Volgorde | Block-ID / werktitel | Diepte | Hoofdgedachte en taak | Waarom dit niveau? |
| --- | --- | --- | --- | --- |
| 1 | `orientatie` — Bordeaux aan haven en rivieren | foundation | Haven en water als sterke narratieve en ruimtelijke ingang; hun verklarende historische rol blijft een researchvraag | Dit is een voorstelbaar begin zonder de uitkomst van onderzoek vooraf vast te zetten |
| 2 | bestaande documentaire foto | foundation | Plaatsgevoel en menselijke schaal; caption moet uitleggen waarom dit beeld representatief is | Een regiopagina heeft vroeg visuele oriëntatie nodig |
| 3 | `waarom-bordeaux-geschiedenis-maakte` | foundation | Onderzoek hoe haven, handel, politieke verhoudingen en wijnbouw samenhingen; presenteer pas daarna een begrensde historische lijn | Historisch belang is kernidentiteit, maar causaliteit moet uit bronnen volgen |
| 4 | `een-naam-veel-wijnen` | foundation | Bordeaux is geen enkele stijl: introduceer belangrijke kleuren en wijnfamilies vóór druiven of techniek | Corrigeert de meest waarschijnlijke beginnersmisvatting |
| 5 | `wegwijs-tussen-de-wateren` | foundation | Leg de grote regionale families en de oriënterende rol van oevers en rivieren uit; linker-/rechteroever is daarbij een hulpmiddel, geen complete taxonomie | Nodig om appellationnamen later te kunnen plaatsen zonder Bordeaux tot twee oevers te reduceren |
| 6 | `druiven-met-verschillende-rollen` | foundation | Introduceer de belangrijkste blauwe en witte druiven via hun rol in verschillende delen en wijnsoorten | Druiven zijn basisnavigatie; geen technische aromalijst |
| 7 | `zo-lees-je-een-bordeaux` | foundation | Lees van appellation en wijnsoort naar producent en jaargang; leg elk begrip bij eerste gebruik uit | Maakt de regiokennis direct bruikbaar |
| 8 | `centraal-inzicht` | foundation | Bordeaux begrijpen betekent steeds van de grote naam naar de preciezere herkomst en maker bewegen | Verankert de leesstrategie in één zin |
| 9 | `landschap-klimaat-en-bodem` | intermediate | Verklaar de brede maritieme context en waarom water, ligging en bodemverschillen variatie mogelijk maken, zonder smaak te voorspellen | Geeft oorzaken en samenhang nadat de kaart in het hoofd staat |
| 10 | `wijn-samenstellen` | intermediate | Leg in gewone taal uit dat afzonderlijke druiven/partijen kunnen worden samengebracht; introduceer daarna pas `assemblage` | De techniek verdiept een bekend basisbeeld en hoeft de pagina niet te domineren |
| 11 | `appellations-zijn-geen-classificaties` | intermediate | Zet herkomstregels en rangschikkingen helder naast elkaar en verwijs naar specifieke systemen | Vereist enige basiskennis, maar voorkomt een fundamentele verwarring |
| 12 | `bordeaux-vandaag` — conditioneel | intermediate | Alleen toevoegen als onderzoek duurzame moderne context oplevert; anders uitbesteden aan een gedateerde narrative | De entity blijft stabiel en wordt geen onderhoudsgevoelige nieuwsrubriek |
| 13 | `waar-vuistregels-breken` | advanced | Onderzoek waarom linker-/rechteroever, druif en classificatie nuttige ingangen maar slechte garanties zijn | Advanced hoort vereenvoudigingen te bevragen, niet alleen meer jargon te geven |
| 14 | `reikwijdte-van-dit-overzicht` | advanced | Benoem wat alleen per appellation, producent, perceel of jaargang verantwoord kan worden gezegd | De nuance is belangrijk zodra de lezer algemene modellen gaat toepassen |
| 15 | `etiket-als-startpunt` | foundation | Sluit af met een uitnodiging om de specifieke wijn te lezen en door te klikken | De praktische kern moet ook bij basisweergave zichtbaar blijven |

De definitieve pagina hoeft niet vijftien visueel zware onderdelen te krijgen.
Tijdens het schrijven mogen aangrenzende foundationtaken in één vloeiende section
samengaan, zolang de dekkingsmatrix aantoonbaar intact blijft.

## Dependencyplan

### Vereist vóór publicatie

- voldoende geregistreerde bronnen om iedere centrale historische, juridische,
  geografische en causale claim te dragen;
- een zelfstandig bruikbare `concept.assemblage` met een korte, correcte uitleg;
- een geldige NL/EN-blockstructuur met gelijkwaardige betekenis;
- alleen entitylinks naar bestaande targets en begrijpelijke tekst wanneer een
  verwachte child entity nog draft of afwezig is;
- een herbeoordeelde foto/caption of een bewuste beslissing de foto weg te laten.

### Mag later volgen

- een abstracte `concept.appellation`;
- actieve pagina's voor alle Bordeaux-appellations en deelgebieden;
- een historische Bordeaux-narrative;
- een actuele “Bordeaux vandaag”-narrative;
- de Atlas-kaart en volledige geverifieerde geometrie;
- conceptentities voor terroir, château, classificatie of jaargang.

Geen ontbrekende child entity mag de regiopagina gijzelen of leiden tot een leeg
placeholderpackage.

## Begrippen- en entityplan

| Term | Eerste uitleg in gewone taal | Entitybesluit vóór schrijven |
| --- | --- | --- |
| appellation / AOP | “een wettelijk afgebakende herkomstbenaming met eigen productieregels” | Voorlopig inline uitleggen; heroverweeg `concept.appellation` pas bij aantoonbaar hergebruik naast specifieke `appellation.*`-entities |
| assemblage | “het samenstellen van een wijn uit afzonderlijk gemaakte onderdelen” | Maak een conceptentity en link pas ná de uitleg |
| terroir | Alleen gebruiken met een concrete betekenis voor plek, omstandigheden en menselijke praktijk | Conceptentity alleen als meerdere echte pagina's hem nodig hebben; niet als verklarend toverwoord |
| château | In Bordeaux vaak de naam/identiteit van een wijndomein, niet alleen een kasteelgebouw | Eerst beoordelen of een conceptpagina zelfstandig genoeg is |
| classificatie | Een rangschikking of erkenningssysteem; niet hetzelfde als herkomst | Algemene uitleg in tekst; link naar `classification.bordeaux-1855` wanneer precies dat systeem wordt bedoeld |
| cuvée | Een afzonderlijke wijn of samengestelde partij, afhankelijk van context | Vermijden waar “wijn” of “samenstelling” volstaat; nog geen entity nodig |
| INAO | De Franse publieke instantie die oorsprongsbenamingen beheert/toeziet | Geen entity in het huidige model; introduceer menselijk als de instantie inhoudelijk relevant is, anders alleen via citation |
| CIVB | De brancheorganisatie voor Bordeauxwijn | Geen entity nodig voor bronvermelding; de afkorting hoeft niet in de lopende tekst |
| provenance | Interne term voor herleidbaarheid van bronnen | Nooit in lezerscopy; schrijf “bron”, “herkomst van de gegevens” of laat de implementatie-uitleg weg |

Een link vervangt de uitleg niet. Ook een gelinkte term moet bij eerste gebruik in
de zin zelf begrijpelijk zijn.

## Bronnenplan en open onderzoek

### Bestaande bronnen

- De huidige INAO-record gaat specifiek over `Bordeaux blanc`. Gebruik hem niet
  als enige basis voor uitspraken over de hele wijnregio of alle wijnsoorten.
- De twee CIVB-pagina's zijn bruikbaar voor wat de Bordeauxbranche zelf zegt over
  druiven en assemblage. Als trade-body-bronnen bewijzen zij geen reputatie,
  historische prioriteit of universele smaakoorzaak.
- `source.boagri-bordeaux-specification-2025` is de actuele officiële
  productspecificatie voor AOP Bordeaux. Hij ondersteunt juridische claims over
  die ene appellation, niet automatisch over alle appellations van de regio.
- `source.oiv-blending-code` geeft een wijnbrede technische definitie van
  assemblage. De definitie ondersteunt niet de promotionele claim dat assemblage
  uniek voor Bordeaux zou zijn.
- `source.inao-aop-overview` ondersteunt de algemene betekenis van AOP/AOC en
  `source.boagri-bordeaux-specification-2025` laat zien hoe die bescherming voor
  de specifieke AOP Bordeaux in een concreet productdossier wordt uitgewerkt.
- `source.dgccrf-wine-labels-2025` ondersteunt wat een Frans wijnetiket verplicht
  en facultatief kan tonen. Het is geen bron voor smaak- of kwaliteitsclaims.
- `source.gcc1855-classification-overview` beschrijft de leden, niveaus en scope
  van het classificatiesysteem vanuit de organisatie die de geclassificeerde
  domeinen vertegenwoordigt. Gebruik hem niet als onafhankelijk bewijs voor
  kwaliteit of prestige.

### Kandidaten die vóór schrijven volledig moeten worden geopend en geregistreerd

- Een actueel officieel overzicht van appellations en hun juridische scopes,
  met de bevoegde INAO-/wetteksten voor juridische claims.
- Het CIVB-overzicht van de zes grote wijnlandschappen als mogelijke
  navigatiebron, met controle tegen de afzonderlijke appellations.
- `source.boutoulle-bordelais-wine-trade-2000` voor de vroege ontwikkeling van
  wijnbouw en handel. Bibliografische gegevens en beschikbaarheid zijn
  geregistreerd; claimreview loopt nog.
- `source.lavaud-bordeaux-vineyard-landscape-2014` voor de relatie tussen stad,
  haven, landschap en historische identiteit. Bibliografische gegevens en
  beschikbaarheid zijn geregistreerd; claimreview loopt nog.
- `source.gironde-estuary-landscape-atlas` voor de feitelijke relatie tussen
  Garonne, Dordogne, Gironde-estuarium en Atlantische wateren. Deze publieke
  landschapsatlas is geschikt voor oriëntatie, niet voor wettelijke wijngebieden.
- `source.brgm-bordeaux-geology-2022` voor de brede oceanische context en de
  geologische verscheidenheid van het Bordelais. Alleen de beschrijvende
  geologie wordt gebruikt; smaak-, kwaliteits- en reputatietaal uit het artikel
  wordt niet als bewijs overgenomen.
- Gedateerde bronnen voor “Bordeaux vandaag” zijn alleen nodig voor een latere
  narrative. De v1-regiopagina krijgt bewust geen afzonderlijk actualiteitsblock.

### Onderzoeksregels per claimfamilie

- juridische definities: regulator of originele regelgeving;
- geschiedenis: historisch onderzoek, niet de marketingtijdlijn van een
  brancheorganisatie;
- druiven en regionale praktijk: branchebron mag een vertrekpunt zijn, aangevuld
  waar causaliteit of generalisatie wordt geclaimd;
- klimaat en bodem: wetenschappelijke of bevoegde publieke bronnen;
- smaak en stijl: begrensde synthese uit meerdere passende bronnen, nooit een
  garantie op basis van bodem of druif alleen;
- actuele cijfers of veranderingen: datum, scope en reviewmoment expliciet
  vastleggen.

## Claimplan per block

Deze tabel bewaart alleen te toetsen claimfamilies en statussen. Onderzoeksdetails
en bewijs verhuizen naar source records en uiteindelijk canonical content.

| Block | Centrale claims die research moet kunnen dragen | Passende bronsoort | Status |
| --- | --- | --- | --- |
| `orientatie` | Ligging rond stad, rivieren en estuarium; aantoonbare regionale verscheidenheid; een bronvaste formulering van historisch gewicht | Publieke geodata, officiële regio-overzichten, historisch onderzoek | supported voor tekstuele fysieke oriëntatie en historische kern; verified kaartgrenzen blijven open |
| `waarom-bordeaux-geschiedenis-maakte` | Welke rol stad, wijngaard, haven, politieke banden en handel samen speelden; welke middeleeuwse basis aantoonbaar is; welke latere ontwikkeling hier slechts kort genoemd mag worden | Peer-reviewed/scholarly geschiedenis en waar mogelijk primaire documenten | supported voor een begrensde middeleeuwse kern; latere tijdvakken gedelegeerd |
| `een-naam-veel-wijnen` | Welke wijnsoorten onder de brede regio voorkomen; wanneer “Bordeaux” regio of specifieke AOP betekent | Actuele regulatorische bronnen, gecontroleerd regio-overzicht | supported voor het onderscheid en de brede wijnfamilies |
| `wegwijs-tussen-de-wateren` | Welke brede indeling pedagogisch en bronmatig verdedigbaar is; waarom oevers slechts oriëntatie geven | Officieel regio-overzicht, verified geography, afzonderlijke appellationbronnen | supported als redactioneel oriëntatiemodel; kaart en juridische grenzen blijven open |
| `druiven-met-verschillende-rollen` | Welke druiven regionaal belangrijk zijn; hoe hun relevantie per wijnsoort/deelgebied varieert zonder smaakoorsaak te suggereren | Branchebron als vertrekpunt, aangevuld voor causaliteit of generalisatie | supported voor een regionaal overzicht; lokale rollen blijven bij child entities |
| `zo-lees-je-een-bordeaux` | Welke informatie appellation, wijnsoort, producent en jaargang de lezer werkelijk geven; welke conclusies ze niet garanderen | Regulatorische etikettering/herkomstbronnen en begrensde redactionele synthese | supported, met expliciete ruimte voor ontbrekende facultatieve vermeldingen |
| `landschap-klimaat-en-bodem` | Maritieme context; rol van water; alleen verdedigbare brede bodemcontrasten; grenzen van regionale generalisatie | Wetenschappelijke of bevoegde publieke bronnen | supported voor een begrensde regionale synthese |
| `wijn-samenstellen` | Dat onderdelen afzonderlijk kunnen ontstaan en later worden samengebracht; betekenis van assemblage; grenzen van de regionale vuistregel | Technische/branchebronnen, waar nodig onafhankelijke aanvulling | supported voor een compacte introductie; verdieping verhuist naar `concept.assemblage` |
| `appellations-zijn-geen-classificaties` | Definitie en functie van beide systemen; waarom het ene geen synoniem of algemene kwaliteitsgarantie voor het andere is | Regulator/originele regels en documenten van specifieke classificaties | supported voor het onderscheid; details blijven bij specifieke classification entities |
| `bordeaux-vandaag` | Alleen een duurzame moderne ontwikkeling die zonder snel verouderende cijfers betekenisvol blijft | Gedateerde publieke data plus geschikte onafhankelijke analyse | omit voor v1; actualiteit naar een latere gedateerde narrative |
| `waar-vuistregels-breken` | Welke bekende oriëntatiemodellen bruikbaar zijn en met welke aantoonbare uitzonderingen | Synthese uit deelgebied-, druif- en appellationbronnen | supported als synthese van de onderzochte scopes |
| `reikwijdte-van-dit-overzicht` | Welke uitspraken alleen per appellation, producent, site of jaargang verantwoord zijn | Afgeleid uit de onderzochte scopes van voorgaande blocks | supported als compacte slotcaveat |
| `etiket-als-startpunt` | Welke vervolgvraag de lezer per informatie-element kan stellen, zonder smaakgarantie | Onderbouwde synthese van foundationclaims | supported |

### Researchbesluit: historische kern

Ondersteund voor de regiopagina:

- presenteer Bordeaux als een historische wisselwerking tussen stad, omringende
  wijnbouw, haven, politieke verhoudingen en handelsnetwerken;
- de bronnen dragen een beknopte middeleeuwse kern waarin wijnbouw, de stedelijke
  identiteit en handel richting Engeland aantoonbaar betekenis hebben;
- maak duidelijk dat deze geschiedenis ruim vóór de classificatie van 1855 begint,
  zonder van de regiopagina een tijdlijn te maken.

Niet gebruiken op de regiopagina:

- “de haven maakte Bordeaux beroemd” of een andere monocausale verklaring;
- exacte historische exportvolumes of vergelijkingen met moderne productie;
- een rechte succeslijn van Romeinse oorsprong naar hedendaagse reputatie;
- claims als “eerste”, “grootste”, “belangrijkste” of “geboorteplaats” zonder een
  veel nauwere scope en aanvullend bewijs;
- een uitgebreide uitleg van Engelse, Nederlandse, koloniale of
  classificatiegeschiedenis. Die vragen verdienen later een eigen narrative.

Ondersteunende source IDs:

- `source.boutoulle-bordelais-wine-trade-2000`;
- `source.lavaud-bordeaux-vineyard-landscape-2014`.

Dit cluster is hiermee inhoudelijk besloten. De uiteindelijke formulering wordt
pas tijdens de prozafase geschreven en citeert beide bronnen op blockniveau.

### Researchbesluit: naam, AOP en wijnfamilies

Ondersteund voor de regiopagina:

- leg expliciet uit dat “Bordeaux” in alledaagse wijnspraak de brede wijnregio kan
  aanduiden, terwijl AOP Bordeaux één specifieke beschermde herkomst binnen dat
  grotere geheel is;
- presenteer Bordeaux als regio van rode wijn, droge en zoete witte wijn,
  rosé/clairet en mousserende Crémant, zonder daarvan één uniforme stijlladder te
  maken;
- gebruik de wijnsoort als eerste praktische verfijning en daarna de specifieke
  appellation, producent en jaargang;
- de zes CIVB-landschappen kunnen een bruikbare redactionele groepering voor
  oriëntatie zijn, mits duidelijk blijft dat dit geen complete wettelijke
  taxonomie of verified kaartlaag is.

Niet gebruiken op de regiopagina:

- de suggestie dat iedere Bordeaux-appellation iedere wijnsoort mag produceren;
- het exacte aantal appellations als tijdloos feit zonder gedateerde definitie;
- promotionele smaakbeschrijvingen of kwaliteitsclaims uit de trade-body-site;
- AOP Bordeaux en de hele Bordeauxregio als verwisselbare juridische gebieden;
- “linkeroever versus rechteroever” als vervanging voor de bredere regionale
  indeling.

Ondersteunende source IDs:

- `source.inao-bordeaux-clairet-product-page` voor de officiële AOP-context;
- `source.civb-bordeaux-designations` voor de redactionele groepering van de
  regio;
- `source.civb-bordeaux-wine-styles` voor het aantoonbare brede palet aan
  wijnfamilies, niet voor onafhankelijke smaak- of reputatieclaims.

Het juridische detail per appellation en de feitelijke kaartlaag blijven open.

### Researchbesluit: landschap, klimaat en bodem

Ondersteund voor de regiopagina:

- oriënteer de lezer op de Garonne en Dordogne, die bij het Bec d’Ambès samen het
  Gironde-estuarium vormen; verder stroomafwaarts ontmoeten rivierwater en
  Atlantisch zeewater elkaar;
- gebruik die waterstructuur als ruimtelijk geraamte voor het verhaal, zonder de
  rivieren tot wijnrechtelijke grenzen of een volledige indeling te maken;
- beschrijf het klimaat alleen op regionale schaal als oceanisch of maritiem van
  karakter. Dat is een gedeelde achtergrond, geen verklaring voor iedere
  appellation, wijngaard of jaargang;
- benadruk dat Bordeaux geologisch geen uniforme bodem heeft. Op hoofdlijnen zijn
  er kalkrijke en meer of minder kleihoudende gesteenten op plateaus, naast
  rivierterrassen met grind, kiezels en zand;
- leg uit dat oceaan, rivieren en sedimentatie het landschap over geologische
  tijd mede hebben gevormd. Houd dit beschrijvend: de regiopagina hoeft geen
  geologische tijdlijn te worden;
- gebruik de bodemcontrasten om regionale variatie voorstelbaar te maken, niet om
  smaak, kwaliteit of druivenkeuze automatisch uit een grondsoort af te leiden.

Niet gebruiken op de regiopagina:

- “linkeroever is grind, rechteroever is klei” als sluitende bodemkaart;
- een directe keten van bodemsoort naar aroma, smaak, kwaliteit of prestige;
- de bewering dat de rivieren overal hetzelfde klimaateffect hebben of een
  specifieke jaargang verklaren;
- exacte bodem-, appellation- of oevergrenzen zonder geverifieerde geografische
  data;
- `terroir` als afkorting voor een oorzaak die niet concreet wordt benoemd;
- lokale details over afwatering, warmteopslag, expositie of mesoklimaat op het
  niveau van de hele regio. Die horen bij een passende appellation, site of
  verdiepende narrative.

Kennisdiepte:

- de namen en onderlinge relatie van Garonne, Dordogne, estuarium en Atlantische
  Oceaan zijn `foundation` en horen al in de oriëntatie;
- de oceanische context en brede geologische contrasten zijn `intermediate`,
  omdat zij verklaren waarom het regionale beeld uiteenvalt zonder eenvoudige
  smaakvoorspellingen te doen;
- de grenzen van bodem- en oevervuistregels zijn `advanced` en keren compact
  terug in `waar-vuistregels-breken`.

Ondersteunende source IDs:

- `source.gironde-estuary-landscape-atlas`;
- `source.brgm-bordeaux-geology-2022`.

Dit cluster is inhoudelijk besloten. De oriëntatiekaart blijft afzonderlijk
geblokkeerd totdat daarvoor geverifieerde geodata en passende licenties zijn
vastgelegd.

### Researchbesluit: druiven met verschillende rollen

Ondersteund voor de regiopagina:

- introduceer druiven per wijnfamilie, niet als één regionale boodschappenlijst:
  merlot, cabernet sauvignon en cabernet franc als de drie belangrijkste blauwe
  namen; sauvignon blanc, sémillon en muscadelle als de drie belangrijkste witte
  namen;
- noem dit een hanteerbare hoofdgroep, geen volledige juridische rassenlijst. De
  actuele AOP Bordeaux-specificatie bevat ook aanvullende en onder voorwaarden
  toegestane rassen;
- maak bij eerste lezing vooral duidelijk dat witte Bordeaux dus een eigen
  druivenverhaal heeft en geen voetnoot bij rode Bordeaux is;
- koppel druiven op deze regiopagina aan rollen en vervolgroutes, niet aan vaste
  aroma's. Welke druif is toegestaan, dominant of betekenisvol verschilt per
  appellation, kleur, producent en wijn;
- een druivennaam mag naar een bestaande grape entity linken, maar de paragraaf
  moet ook zonder die childpagina begrijpelijk zijn.

Niet gebruiken op de regiopagina:

- “de zes Bordeauxdruiven” als uitputtende of juridisch vaste set;
- actuele aanplantpercentages zonder peildatum, scope en onderhoudsplan;
- een smaakwoordenlijst waarin iedere druif een vast aroma of vaste structuur
  levert;
- een vaste koppeling `merlot = rechteroever` en `cabernet sauvignon =
  linkeroever` zonder lokale context en uitzonderingen;
- de nieuwe, beperkt toegestane aanpassingsrassen als foundation-lijst. Die zijn
  bruikbaar als gedateerde moderne ontwikkeling, niet als eerste mentale model.

Kennisdiepte:

- de zes belangrijkste blauwe en witte namen, gegroepeerd per wijnfamilie, zijn
  `foundation`;
- verschillen in wettelijke toelating, aanplant en lokale rol zijn
  `intermediate` of horen bij de relevante appellation/grape entity;
- veranderende rassenregels en de redenen erachter horen in een gedateerde
  `bordeaux-vandaag`-assertion of narrative, niet in de stabiele basisuitleg.

Ondersteunende source IDs:

- `source.civb-bordeaux-grape-varieties` voor de regionale hoofdgroep;
- `source.boagri-bordeaux-specification-2025` voor de juridische correctie dat
  AOP Bordeaux een ruimere en voorwaardelijke rassenlijst kent.

Dit cluster is inhoudelijk besloten. Voor publicatie hoeft niet iedere genoemde
druif al een eigen entity te hebben; ontbrekende links mogen de tekst niet
onbegrijpelijk maken.

### Researchbesluit: assemblage

Ondersteund voor de regiopagina:

- leg eerst in gewone taal uit dat een wijnmaker verschillende wijnen of partijen
  kan samenbrengen tot de uiteindelijke wijn; introduceer daarna tussen haakjes de
  term `assemblage`;
- druivenras is slechts één mogelijke bron van verschil tussen componenten.
  Partijen kunnen ook afzonderlijk zijn gehouden vanwege perceel, vinificatie of
  andere selectiekeuzes;
- Bordeaux heeft een sterke regionale associatie met assemblage, maar ook
  wijnen uit één druivenras komen voor. Formuleer assemblage daarom als een
  belangrijke werkwijze, niet als definitie of universele regel van Bordeaux;
- gebruik de AOP Bordeaux-specificatie alleen om te tonen dat assemblageregels
  concreet en productspecifiek kunnen zijn. De regiopagina neemt geen percentages
  of volledige technische voorschriften over;
- verwijs voor de algemene techniek naar `concept.assemblage`, dat zelfstandig
  moet uitleggen wat wel en niet wordt samengebracht.

Niet gebruiken op de regiopagina:

- “elke cuvée is een huwelijk van meerdere druiven, percelen of terroirs”;
- assemblage als bewijs van kwaliteit, complexiteit, balans of een herkenbare
  huisstijl;
- vaste karakterrollen als “merlot geeft rondheid” en “cabernet geeft ruggengraat”
  zonder passende, begrensde onderbouwing;
- de dirigent-, huwelijk- en muziekmetaforen uit de branchetekst als feitelijke
  uitleg;
- `cuvée`, `terroir`, `maître de chai` of partijselectie introduceren wanneer
  “wijn”, “plek”, “wijnmaker” of “afzonderlijk gemaakte component” volstaat;
- de huidige drie assemblageblokken handhaven. Eén compacte regionale sectie en
  een link naar het concept zijn voldoende.

Kennisdiepte:

- de eenvoudige definitie en het feit dat de samenstelling per wijn kan
  verschillen zijn `intermediate` op Bordeaux;
- typen componenten, proef- en selectiebeslissingen, juridische grenzen en
  uitzonderingen horen op `concept.assemblage`;
- de waarschuwing dat een blendpercentage stijl of kwaliteit niet volledig
  verklaart wordt onderdeel van het `advanced` block over vuistregels, niet een
  afzonderlijk assemblagehoofdstuk.

Ondersteunende source IDs:

- `source.oiv-blending-code` voor de algemene technische definitie;
- `source.civb-bordeaux-blending` voor de wijze waarop de Bordeauxbranche haar
  eigen praktijk beschrijft, met uitsluiting van de promotionele claims;
- `source.boagri-bordeaux-specification-2025` voor productspecifieke juridische
  regels binnen AOP Bordeaux.

Dit cluster is inhoudelijk besloten. Het schrijven van de Bordeaux-sectie blijft
afhankelijk van een bruikbare `concept.assemblage`.

### Researchbesluit: appellation, classificatie en etiket

Ondersteund voor de regiopagina:

- leg `appellation` bij eerste gebruik uit als een beschermde herkomstnaam met een
  afgebakend gebied en een productdossier met regels voor onder meer producttype,
  productie en presentatie;
- leg `classificatie` daarnaast uit als een afzonderlijk systeem dat bepaalde
  wijnen of domeinen groepeert en eventueel rangschikt. Het systeem heeft altijd
  een eigen doelgroep, gebied, tijd en set niveaus;
- gebruik Bordeaux 1855 als concreet voorbeeld, niet als overkoepelend
  kwaliteitssysteem voor de hele regio. Het betreft een beperkte groep rode crus
  uit vooral de Médoc en zoete witte crus uit Sauternes en Barsac, met eigen
  rangen;
- leer de lezer op een AOP-etiket eerst de beschermde herkomstnaam en het type
  wijn te herkennen, daarna de naam waaronder de wijn wordt aangeboden en de
  bottelaar; kijk vervolgens naar jaargang en druif wanneer die vermeld zijn;
- benoem dat jaargang en druivenras facultatieve, gereguleerde vermeldingen zijn.
  Hun afwezigheid is dus geen fout en een Bordeauxblend hoeft zijn percentages
  niet als standaardinformatie op de voorkant te tonen;
- gebruik de uitkomst als start voor navigatie: zoek de specifieke appellation op,
  identificeer vervolgens de concrete wijn of maker en plaats een eventuele
  classificatie in haar eigen systeem.

Niet gebruiken op de regiopagina:

- appellation als kwaliteitsrang of classificatie als herkomstgebied;
- `grand cru`, `cru classé`, `château` of een classificatieniveau als universeel
  Bordeauxkeurmerk;
- de classificatie van 1855 als verklaring voor alle beroemde Bordeauxwijnen of
  als lijst die iedere appellation omvat;
- “hoger geclassificeerd smaakt beter”, “AOP garandeert kwaliteit” of vergelijkbare
  koopgaranties;
- de suggestie dat de bottelaar per definitie dezelfde partij is als de teler,
  eigenaar van het domein of maker van alle componenten;
- jaargang, druivenras of blendpercentages presenteren als informatie die op
  iedere fles moet staan;
- een juridische inventaris van alle verplichte etiketvermeldingen. De Bordeaux-
  pagina geeft een leesstrategie; het volledige etiketteringsrecht hoort elders.

Kennisdiepte:

- de praktische volgorde voor het lezen van de fles is `foundation`;
- het functionele verschil tussen appellation en classificatie is `intermediate`;
- scope, historische geldigheid, wijzigingen en tiers van afzonderlijke
  classificaties horen bij de betreffende classification entity en kunnen daar
  `advanced` worden;
- de advanced Bordeaux-caveat benoemt slechts dat geen van deze labels op
  zichzelf de ervaring van een specifieke fles voorspelt.

Ondersteunende source IDs:

- `source.inao-aop-overview`;
- `source.boagri-bordeaux-specification-2025`;
- `source.dgccrf-wine-labels-2025`;
- `source.gcc1855-classification-overview`.

Dit cluster is inhoudelijk besloten. `classification.bordeaux-1855` kan vanuit de
Bordeaux-pagina worden gelinkt zodra zijn eigen minimale bronvaste content en
relations zijn bijgewerkt; de algemene uitleg blijft ook zonder die link volledig.

### Researchbesluit: deelgebieden en bruikbare vuistregels

Ondersteund voor de regiopagina:

- maak eerst onderscheid tussen brede appellationnamen die niet één compact
  deelgebied beschrijven — Bordeaux, Bordeaux Supérieur en Crémant de Bordeaux —
  en groepen die de lezer ruimtelijk helpen oriënteren;
- gebruik daarna vijf herkenbare ruimtelijke families als leesroute, niet als
  wettelijke taxonomie:
  1. Médoc langs de westzijde van het Gironde-estuarium;
  2. Graves en Sauternes ten zuiden van de stad, langs de Garonne;
  3. Entre-deux-Mers en naburige coteaux tussen Garonne en Dordogne;
  4. Saint-Émilion, Pomerol en Fronsac rond de Dordogne ten oosten van Bordeaux;
  5. Blaye en Bourg aan de noordoostelijke zijde van het estuarium;
- introduceer de concrete namen als families waarin de lezer later specifieke
  appellations kan vinden. De regiopagina hoeft hun leden niet volledig op te
  sommen;
- gebruik “linkeroever” en “rechteroever” alleen als aanvullende spreektaal voor
  oriëntatie. Noem altijd de rivier of het estuarium wanneer de context anders
  dubbelzinnig wordt;
- laat de Foundation-versie vooral zien dat water namen helpt plaatsen. De
  Intermediate-versie mag uitleggen waarom brede appellations en ruimtelijke
  families geen gelijksoortige lagen zijn.

Niet gebruiken op de regiopagina:

- “zes subregio's” als officiële of juridisch uitputtende indeling;
- de CIVB-groep Bordeaux/Bordeaux Supérieur/Crémant behandelen als een compact
  landschap naast Médoc of Blaye-Bourg;
- linker- en rechteroever als twee helften die alle appellations, wijnsoorten,
  druiven en bodems verklaren;
- exacte positionering of containment van een appellation zonder afzonderlijk
  geverifieerde geografische gegevens;
- aan iedere familie één kleur, druif, bodem of smaak koppelen;
- alle namen in één opsomming plaatsen zonder duidelijk te maken welke volgende
  vraag de lezer ermee kan beantwoorden.

Kennisdiepte:

- de vijf ruimtelijke families en de brede regionale namen zijn `foundation`;
- het onderscheid tussen een redactionele groep, brede appellation en
  juridische grens is `intermediate`;
- uitzonderingen op oever-, druif-, bodem- en classificatievuistregels worden
  samengebracht in één `advanced` caveat en niet door de hele basislaag gestrooid.

Ondersteunende source IDs:

- `source.civb-bordeaux-designations` voor de zes door de branche gebruikte
  redactionele groepen;
- `source.gironde-estuary-landscape-atlas` voor de fysieke wateroriëntatie;
- `source.boagri-bordeaux-specification-2025` als concrete juridische controle
  dat een appellation zijn eigen afgebakende scope heeft.

Dit cluster is inhoudelijk besloten. Het oriëntatiemodel mag in tekst worden
gepubliceerd; een feitelijke kaart blijft geblokkeerd totdat Atlas geverifieerde
geometrie kan leveren.

### Researchbesluit: Bordeaux vandaag en reikwijdte

Voor v1 wordt `bordeaux-vandaag` bewust niet geschreven. De actuele toelating van
beperkte aanpassingsrassen in de AOP Bordeaux-specificatie is inhoudelijk relevant,
maar juridisch gedateerd en te specifiek om de stabiele regiopagina als geheel te
vertegenwoordigen. Dit onderwerp kan later een narrative worden met een eigen
datum, scope, klimaatbronnen en reviewmoment.

De advanced afsluiting beperkt zich daarom tot een duurzame leesregel:

- regio, oever, druif, bodem en classificatie zijn ingangen om gerichtere vragen
  te stellen;
- geen van die ingangen voorspelt zelfstandig de stijl, kwaliteit of ervaring van
  een concrete fles;
- uitspraken over precieze regels horen bij de appellation, over keuzes bij de
  wijn of producent, over omstandigheden bij site en jaargang, en over rang bij
  het specifieke classificatiesysteem.

Daarmee zijn `waar-vuistregels-breken` en `reikwijdte-van-dit-overzicht`
ondersteund als synthese van de overige onderzochte blocks. Zij krijgen geen
nieuwe losse feiten en introduceren geen extra bronfamilie.

## Visuals

1. **Panorama-foto.** Informatievraag: helpt dit beeld de lezer wijngaard,
   nederzetting en menselijke schaal van één Bordeauxlandschap voor zich te zien?
   De caption moet Saint-Émilion als concreet voorbeeld benoemen en niet als beeld
   van heel Bordeaux presenteren.
2. **Oriëntatiekaart.** Informatievraag: kan de lezer zien hoe Gironde, Garonne en
   Dordogne de grote regionale oriëntatie structureren, zonder oevers of
   wijnfamilies voor juridische grenzen aan te zien? Alleen verified data of een
   onmiskenbaar gelabeld schema mag dit beantwoorden.
3. **Assemblage-illustratie.** Informatievraag: begrijpt de lezer sneller dat een
   uiteindelijke wijn uit afzonderlijk gemaakte componenten kan worden
   samengesteld? Dit beeld hoort primair op `concept.assemblage` en kan worden
   hergebruikt.

## Besluiten bij goedkeuring

- Haven en handel zijn goedgekeurd als historische onderzoeksingang, niet als
  vooraf bewezen monocausale verklaring.
- De entity bevat alleen duurzame moderne context. Tijdgevoelige cijfers worden
  gedateerde assertions of materiaal voor een afzonderlijke narrative.
- Foundation/intermediate/advanced is de juiste verhouding; specialist wordt niet
  gevuld om een vierde niveau te benutten.
- `concept.assemblage` is een dependency; `concept.appellation` wordt uitgesteld
  totdat hergebruik aantoonbaar is.
- De expliciete lezersvraag over wat “Bordeaux” betekent en welke naam daarna
  volgt, stuurt de navigatiefunnel van de pagina.

## Publication gate

Publicatie is geblokkeerd totdat:

- iedere rij van de dekkingsmatrix is geschreven, uitbesteed of bewust `omit`;
- ieder gepland block alleen claims met status `supported` bevat;
- foundation geen noodzakelijk, onuitgelegd jargon of bronorganisatie-afkortingen
  bevat;
- historische, juridische, geografische en causale claims passende bronnen op de
  juiste scope hebben;
- tijdelijke hypotheses en researchnotities niet als feiten in Markdown of YAML
  zijn achtergebleven;
- de pagina zonder ontbrekende child entities zelfstandig begrijpelijk en nuttig
  is;
- iedere visual haar informatievraag beantwoordt, juiste rechten heeft en haar
  feitelijke of representatieve rol eerlijk toont;
- NL en EN dezelfde claims, scope, onzekerheid en blockstructuur dragen;
- `npm run content:check`, de standaard codechecks en relevante browsertests
  slagen.

De brief is hiermee goedgekeurd voor research. Proza begint pas wanneer de
centrale claimfamilies voldoende `supported` of bewust `omit` zijn.
