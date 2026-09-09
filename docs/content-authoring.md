# Content authoring

Canonical content lives in self-contained packages. Generated indexes live under `src/generated/content/` and must never be edited manually.

## Begin met een contentbrief, niet met proza

Een nieuwe entity, narrative of ingrijpende herschrijving begint met een tijdelijke
contentbrief onder `editorial/briefs/<package-id>.md`. Kleine correcties en zuivere
bronupdates hebben geen nieuwe brief nodig. De brief is een reviewdocument: hij
wordt niet door de applicatie gelezen en is nooit een tweede canonical feitenbron.

De brief wordt goedgekeurd voordat de Nederlandse Markdownbody wordt geschreven.
Hij bevat minimaal:

1. **Veronderstelde voorkennis** — wat mag de pagina bij binnenkomst wel en niet
   bekend veronderstellen?
2. **Paginabelofte en scope** — wat moet een lezer na afloop begrijpen, en wat
   hoort bewust op een andere entity of narrative?
3. **Lezersvragen** — de concrete vragen waarop de pagina antwoord moet geven.
4. **Dekkingsmatrix** — per noodzakelijke dimensie: op deze pagina behandelen,
   via een andere entity ontsluiten, bewust weglaten of nog onderzoeken.
5. **Sectie-outline** — per block een werktitel, hoofdgedachte, kennisdiepte,
   reden voor die diepte, benodigde bronnen, begrippen/links en eventuele visual.
6. **Dependencyplan** — wat vóór publicatie echt moet bestaan en welke child
   entities, narratives of visuals zonder kwaliteitsverlies later mogen volgen.
7. **Begrippenplan** — jargon bij eerste gebruik in gewone taal uitleggen en
   alleen een entity maken wanneer het begrip zelfstandig vindbaar en herbruikbaar
   moet zijn.
8. **Bronnenplan** — welk soort bron iedere claimfamilie nodig heeft en welke
   onderzoeksgaten nog openstaan.
9. **Claimplan** — per block de twee tot vier centrale uitspraken die onderzoek
   moet kunnen dragen, hun passende bronsoort en hun status (`open`, `supported`
   of `omit`). Dit staat los van de lijst met gevonden bronnen.
10. **Visualvragen** — welke concrete informatie ieder voorgesteld beeld sneller
    of duidelijker moet overbrengen dan tekst alleen.
11. **Publication gate** — de controle waaraan outline, research, dependencies,
    NL/EN en uiteindelijke presentatie vóór publicatie moeten voldoen.

Een brief mag niet uitgroeien tot een tweede knowledge base. Researchnotities,
citaten en verzamelingen geverifieerde feiten blijven er niet langdurig in staan.
Zodra een claim is onderbouwd, verhuist de bron naar `data/sources/` en de kennis
naar assertions, relaties of canonical Markdown. De brief bewaart alleen de
argumentatiestructuur, beslissingen, statussen en nog open vragen.

Na goedkeuring krijgt iedere grote overzichtsentity een duurzaam, machineleesbaar
`content-plan.yaml` in hetzelfde package als `entity.yaml`. Het plan bevat geen
wijnfeiten en wordt niet naar de runtimebundle gekopieerd. Het bewaart uitsluitend:

- het page-archetype;
- de verplichte inhoudsdimensies en hun bestemming;
- de block- en detailstructuur per kennisniveau;
- de vragen waarmee sectievolledigheid wordt beoordeeld;
- het onderscheid tussen algemene synthese en specifieke claims;
- de geplande entitydependencies en hun redactionele bestemming; en
- de status van outline-, dependency-, NL- en EN-review.

Het contentplan vervangt de verkennende brief zodra scope en outline zijn
goedgekeurd. De brief mag daarna worden gearchiveerd; het contentplan blijft naast
de canonical content bestaan als afdwingbaar publicatiecontract, niet als tweede
feitenbron.

### Harde regel: een sectie is pas klaar wanneer haar onderwerp compleet is

Gegenereerd of handgeschreven proza wordt nooit na één concept als voltooid
beschouwd. Voor iedere sectie en ieder zichtbaar kennisniveau geldt dezelfde
iteratieve controle:

1. benoem vooraf de lezersvragen die binnen de afgesproken sectiescope vallen;
2. schrijf de sectie vanuit die vragen en de geverifieerde kennis;
3. controleer na het schrijven welke noodzakelijke verklaring, samenhang,
   uitzondering, term of vervolglink nog ontbreekt;
4. vul de sectie aan of besteed het ontbrekende punt expliciet uit aan een
   concrete entity of narrative; en
5. herhaal de controle totdat geen relevante vraag onbeantwoord of ongemotiveerd
   buiten scope blijft.

Een sectie is niet compleet omdat hij lang is, veel feiten noemt of aan zijn
woordbudget voldoet. Hij is compleet wanneer hij zijn beloofde onderwerp zonder
kennishiaten uitlegt, de grenzen van die uitleg zichtbaar maakt en de lezer naar
het juiste detailniveau of vervolgobject kan brengen. `content-plan.yaml` legt de
volledigheidsvragen en de reviewstatus per sectie vast. Een actieve grote
overzichtspagina mag geen sectie als compleet markeren zolang een vraag nog
`open`, een noodzakelijke dependency nog afwezig of een specifieke claim nog
onvoldoende ondersteund is.

### Proportionele provenance: algemene synthese versus specifieke feiten

Brongebruik is proportioneel aan het soort uitspraak, niet aan het aantal zinnen.
Het contentplan onderscheidt daarom per sectie:

- **algemene synthese** — breed aanvaarde, stabiele context die door één of enkele
  geschikte overzichtsbronnen voor de gehele claimfamilie kan worden gedragen;
- **specifieke claims** — onder meer precieze data, cijfers, juridische regels,
  classificatiescopes, historische prioriteitsclaims, causale verklaringen,
  veranderlijke situaties en precieze geografische uitspraken.

Algemene synthese krijgt een compacte, herbruikbare bronbasis op blockniveau. Er
wordt niet voor iedere aangrenzende algemeen aanvaarde zin een nieuwe externe bron
toegevoegd. Specifieke claims krijgen wel een directe citation en waar nodig een
locator, datum, versie of afzonderlijke officiële bron. Een bron mag meerdere
blocks ondersteunen wanneer scope en autoriteit passen. Bronminimalisatie mag
nooit worden gebruikt om een specifieke of betwistbare claim zonder passende
steun te publiceren; omgekeerd is een groot aantal bronnen geen bewijs van
inhoudelijke volledigheid.

Deze proportionaliteitscontrole is een harde stap in iedere sectiereview. AI mag
algemene kennis helpen synthetiseren, maar is nooit de bron en mag het onderscheid
tussen algemene context en een specifieke claim niet zelf stilzwijgend vervagen.

### Kennisdiepte toekennen

Diepte beschrijft de functie van informatie voor de lezer, niet hoe technisch een
woord klinkt:

- `foundation`: zonder dit punt begrijpt of herkent de lezer het onderwerp
  verkeerd, of kan die niet zinvol verder navigeren;
- `intermediate`: verklaart waarom hoofdpatronen ontstaan of binnen het onderwerp
  verschillen;
- `advanced`: onderzoekt uitzonderingen, grenzen van bekende modellen en
  historische, juridische of technische wisselwerking;
- `specialist`: vraagt primaire vakdocumenten, precieze methoden of een debat
  tussen deskundigen en hoort alleen op de overzichtspagina als dat werkelijk
  nodig is.

Gebruik bij de toekenning van deze niveaus voortaan ook de WSET-leerlijn als
praktische externe graadmeter, zonder de inhoud of terminologie van het WSET-
curriculum te kopiëren:

- `foundation` ligt ongeveer op WSET Level 2: de lezer moet het onderwerp, zijn
  belangrijkste plaatsen en stijlen, en de bepalende factoren kunnen herkennen en
  in gewone taal beschrijven;
- `intermediate` ligt ongeveer op WSET Level 3: de lezer moet kunnen verklaren hoe
  plaats, wijnbouw, wijnmaken en rijping de stijl, kwaliteit en onderlinge
  verschillen veroorzaken;
- `advanced` begint pas duidelijk boven Level 3: nuances, uitzonderingen,
  historische of juridische wisselwerking, technische mechanismen en de grenzen
  van gangbare verklaringsmodellen; en
- `specialist` blijft bestemd voor vakonderzoek, primaire methoden en werkelijke
  expertendebatten.

Dit is een kalibratiehulpmiddel, geen examenmapping en geen reden om kennis op een
hoger niveau te verbergen. Informatie die noodzakelijk is om een hoofdrol of
hoofdstijl van de entity te begrijpen blijft `foundation`, ook wanneer het
onderliggende mechanisme technisch is. Botrytis bij Sémillon, koolzuurmaceratie bij
Beaujolais of de tweede gisting bij traditionele mousserende wijn zijn voorbeelden
van zulke fundamentele kennis. De basislaag introduceert dan het verschijnsel en
zijn betekenis; `intermediate` verklaart de causale keten; `advanced` behandelt
uitzonderingen, grensgevallen en technisch of juridisch detail.

Een essentieel vakwoord kan dus `foundation` zijn, mits het direct wordt uitgelegd.
Een detail wordt niet automatisch waardevol doordat het `advanced` heet.

### Wanneer is een outline volledig genoeg?

“Volledig” betekent niet dat alle feiten over het onderwerp op één pagina staan.
De outline is klaar wanneer iedere kernvraag van de beoogde lezer:

- op de pagina wordt beantwoord;
- bewust naar een concrete entity of narrative wordt uitbesteed; of
- als zichtbaar onderzoeksgat is gemarkeerd.

Daarnaast mag geen deelonderwerp de pagina domineren voordat identiteit, plaats,
historische betekenis, interne verscheidenheid en relevantie zijn afgedekt. Iedere
sectie heeft een eigen taak; herhaling en tekst die alleen volledigheid simuleert
worden geschrapt.

Na goedkeuring volgt de volgorde: bronnen verifiëren en registreren, benodigde
claims als `supported` of `omit` besluiten, verplichte dependencies aanmaken,
Nederlandse tekst schrijven en reviewen, de Engelse
lokalisatie schrijven en reviewen, daarna pas buildvalidatie en publicatie.

### Page-archetype: `region-overview`

Een grote regiopagina is een kennis-hub en behandelt of ontsluit minimaal deze
dimensies:

1. identiteit, scope, ligging en ruimtelijke oriëntatie;
2. historische ontwikkeling en betekenis;
3. landschap, water, klimaat en bodems;
4. wijnfamilies en producttypen;
5. druivenrassen en hun regionale rollen;
6. regionale viticultuur en wijnmaakpatronen;
7. appellationstructuur, subregio's en geografische woordenschat;
8. classificatiesystemen en hun onderlinge scopes;
9. handel, distributie en andere kenmerkende regionale instituties;
10. etiketten, terminologie en praktische navigatie;
11. bruikbare stijl- of glascontext zonder deterministische smaakgaranties;
12. moderne ontwikkelingen, waarbij vluchtige gegevens naar een gedateerde
    narrative of assertion mogen worden uitbesteed;
13. relevante visuals en hun concrete leertaak; en
14. child entities en narratives waarmee de lezer verder kan.

De volgorde is redactioneel, niet schematisch. Een dimensie mag `on-page`,
`child-entity`, `dated-narrative`, `omitted-with-reason` of `research-gap` zijn.
Alleen de eerste drie gelden als publiceerbaar afgedekt; een research-gap blokkeert
activatie wanneer de dimensie essentieel is voor de paginabelofte.

### Page-archetype: `appellation-overview`

Een appellation-overview zoomt verder in dan een regiopagina. Hij behandelt of
ontsluit minimaal:

1. identiteit, wettelijke scope, ligging en verhouding tot bovenliggende regio's;
2. historische ontwikkeling en wijnhistorische betekenis;
3. landschap, klimaat, bodemvariatie en afwatering;
4. toegestane druiven en hun lokale rollen;
5. herkenbare viticultuur- en wijnmaakkeuzes zonder één producentenrecept te
   suggereren;
6. de actuele appellationregels, met juridische details proportioneel aan hun
   leerwaarde;
7. toepasselijke classificaties, producenten en de grenzen van hun
   representativiteit;
8. stijl, ontwikkeling op fles en bruikbare context in het glas;
9. etiket-, koop- en serveernavigatie zonder prijs- of jaargangadvies te
   vereeuwigen;
10. moderne ontwikkelingen, waarbij veranderlijke gegevens naar gedateerde
    assertions of narratives mogen;
11. visuals met een concrete geografische, historische of wijnbouwkundige
    leertaak; en
12. child entities en narratives voor verdere verdieping.

Een actieve appellation gebruikt dit archetype in een package-lokaal
`content-plan.yaml`. Dezelfde harde volledigheids-, dependency- en
proportionaliteitsreviews als voor een regio-overview gelden per dimensie.

### Page-archetype: `producer-overview`

Een producentenoverzicht behandelt of ontsluit minimaal identiteit en plaats,
geschiedenis en eigendom, wijngaard en terroir, de hoofdwijn, overige wijnen,
werkwijze en de bruikbare grenzen van een stijlbeeld. Veranderlijke personen,
arealen en commerciële werkwijzen krijgen een verificatiedatum. Een
producentenbron mag de eigen praktijk en visie documenteren, maar niet als
onafhankelijke kwaliteitstoets worden opgevoerd.

De basislaag bevat minimaal een korte geschiedenis, de actuele eigenaar of
eigendomscontext, de Grand Vin — de hoofdwijn van het domein — en het karakter
waarmee die wijn zorgvuldig wordt geassocieerd. Overige wijnen zoals een tweede
wijn horen in beginsel bij `intermediate`. Exacte percentages, selectiegrenzen,
technische uitzonderingen en veranderlijke commerciële details horen bij
`advanced`, tenzij zij onmisbaar zijn om de producent überhaupt te begrijpen.

Voor iedere actieve producentenmonografie worden waar mogelijk twee documentaire
beelden gepland: het landgoed in zijn wijnbouwkundige context en de Grand Vin als fles.
Beide vereisen expliciete rechten en een inhoudelijke caption; een generieke
châteaufoto of los etiket zonder betrouwbare identificatie is onvoldoende.

### Publicatievormen van producenten

Een genoemde producent is niet automatisch een zelfstandige contentpagina.
Iedere producentdependency krijgt vóór scaffolding één expliciete
**publicatievorm**. Deze keuze beschrijft redactionele leerwaarde en presentatie;
zij is geen publieke kwaliteitsrang.

| Publicatievorm | Wanneer passend | Publieke presentatie |
| --- | --- | --- |
| `monograph` | De producent is onmisbaar voor het begrijpen van een belangrijke regio, stijl, innovatie of historische ontwikkeling en heeft een zelfstandig pedagogisch verhaal met voldoende onafhankelijke bronnen. | Een zelfstandige producentenpagina volgens `producer-overview`, met een eigen route, bronnen en doorgaans twee documentaire beelden. |
| `collection-profile` | De producent is een belangrijke regionale, classificatoire of stilistische referentie, maar het verhaal krijgt meer betekenis naast vergelijkbare producenten. | Een eigen sectie op een regio-, appellation- of classificatiepagina. Het producerrecord houdt zijn stabiele ID; links en zoeken verwijzen naar de vaste block-anchor op de eigenaarpagina. |
| `register-entry` | De naam is nodig voor volledige classificatiedekking, navigatie of een controleerbaar register, maar een profiel zou weinig extra leerwaarde leveren. | Een compacte, geïdentificeerde vermelding op de relevante eigenaarpagina, eveneens met stabiele anchor. Geen biografische filler. |

Het `presentation`-veld is verplicht op ieder producerrecord, ook wanneer het
record nog `draft` is. Een impliciete standaard bestaat niet. Alle
contentplannen gebruiken `schema_version: 2`; iedere producerdependency herhaalt
daar exact dezelfde publicatievorm. Daardoor kan scaffolding, review of latere
authoring nooit ongemerkt van “genoemde producent” naar “zelfstandige pagina”
springen. Iedere producer die in `coverage.target_ids` of via een entitylink in
de geplande content voorkomt, moet daarom ook als `entity_dependency` met die
keuze zijn opgenomen. Het entityrecord legt de canonical keuze vast:

```yaml
presentation:
  mode: collection-profile
  owner: appellation.pomerol
  anchor: producent-chateau-lafleur
```

Alleen een `producer` mag een producentenpublicatievorm dragen. Ontbreekt de
keuze of wijkt een contentplan af van het entityrecord, dan faalt de build. Een collectie- of
registerrecord heeft een canonical relation naar zijn `owner`. Activering vereist
dat die eigenaar actief is en in beide talen een contentblock met exact dezelfde
anchor bezit. De eigen `overview.nl.md` en `overview.en.md` blijven leeg: het
profielproza heeft één eigenaar en wordt niet parallel gekopieerd. Een directe
oude producentenroute verwijst na activatie permanent naar de owner-anchor.

#### Beslissen over een monografie

Een producent krijgt alleen `monograph` wanneer de contentbrief aantoont dat:

1. er een zelfstandig leerdoel bestaat dat niet goed door appellation-,
   classificatie- of regiocontent wordt gedragen;
2. de historische, technische of stilistische invloed verder reikt dan louter
   lokale bekendheid, prijs of rang;
3. meerdere belangrijke pagina's de producent inhoudelijk nodig hebben; en
4. voldoende onafhankelijke bronnen en betekenisvol documentair beeld bestaan.

Prijs, reputatie, classificatierang of het toevallig beschikbaar zijn van veel
producentencopy zijn afzonderlijk onvoldoende. Bij twijfel is
`collection-profile` de veilige standaard. Een record kan later promoveren of
worden teruggebracht zonder ID-wijziging; alleen de publicatievorm en bestemming
veranderen.

#### Collectieprofielen schrijven

Een producentenverzameling begint met een korte uitleg van haar selectiegrond en
grenzen. Een officiële classificatie volgt de gedateerde officiële cohortindeling;
een informele appellationselectie noemt zichzelf nooit een ranglijst. Grote
cohorten worden op een inhoudelijke, controleerbare grond gegroepeerd, bijvoorbeeld
formele klasse, deelgebied of alfabet, niet via een verzonnen kwaliteitshiërarchie.

Een `collection-profile` beslaat gewoonlijk 150–300 woorden en beantwoordt in
lopende tekst: waar ligt of werkt deze producent, welke wijn of rol staat
centraal, welke ene historische of eigendomsontwikkeling verklaart de huidige
identiteit, welk kenmerk maakt de producent leerzaam en waar eindigt dat
stijlbeeld? Alleen relevante afwijkende wijnen of werkwijzen worden toegevoegd.
Veranderlijke eigendom, areaal en commerciële praktijk krijgen een datum en bron.

De eigenaarpagina beheert de citations en media. Een verzameling mag algemene
bronnen delen, maar een specifieke producentenclaim vraagt passende
onderbouwing. Beeld wordt op paginaniveau gepland: een hero, kaart of diagram en
een beperkte selectie echte landgoed- of flesbeelden kunnen de hele verzameling
dragen. Er geldt geen quotum van twee beelden per collectieprofiel; filler en
onzekere identificatie blijven verboden.

Een `register-entry` is nog compacter en beperkt zich tot de gegevens die de
reden voor opname aantonen. Het is geen samengeperste monografie.

#### Balans bewaken

Het statusrapport telt producentenrecords per publicatievorm. Als
redactionele guardrail bestaat op een volwassen platform bij voorkeur hoogstens
circa 15–20% van de actieve zelfstandige kennispagina's uit
producentenmonografieën. Dit is geen inhoudelijke wet, maar een signaal om eerst
ontbrekende regio's, appellations, druiven, stijlen, geschiedenis en technieken
af te dekken. Een nieuwe monografie wordt niet gestart zolang haar eigen
leerwaarde niet expliciet is gemotiveerd.

Producentenwerk wordt waar mogelijk in cohorten gepland: één selectie- en
bronreview, daarna meerdere korte profielen op dezelfde owner. Zo blijft volledige
dekking haalbaar zonder dat iedere naam een afzonderlijke onderzoeks-, beeld- en
publicatiecyclus veroorzaakt.

De gemigreerde Bordeaux-inventaris bevat elf bewuste monografieën: de tien reeds
actieve pagina's Château Angélus, Château Ausone, Château Canon, Château Cheval
Blanc, Château d'Yquem, Château Figeac, Château Lafite Rothschild, Château Latour,
Château Mouton Rothschild en Château Pavie, plus de geplande monografie Pétrus.
De vier Saint-Émilionnamen buiten de eerder benoemde iconische kern blijven niet
alleen wegens hun rang zelfstandig: hun bestaande pagina's dragen elk een eigen
leerbaar verhaal over respectievelijk positionering en classificatie, het
kalksteenplateau, een cabernetgedreven uitzondering en de relatie tussen
hellingterroir en stijlontwikkeling. Nieuwe kandidaten, waaronder Château
Haut-Brion, Château Margaux en Liber Pater, krijgen niet automatisch dezelfde
vorm wanneer hun record ontstaat; ook zij doorlopen eerst de monografietoets.

Dit is een redactionele momentopname, geen canon of publieke kwaliteitsrang.
Buiten Bordeaux wordt dezelfde toets toegepast vanuit het wereldwijde verhaal
van regio, stijl en producent; Bordeaux is de eerste ingang van het project,
niet de maatstaf voor alle producenten.

Voor een monografie blijft de basislaag menselijk bruikbaar: wie is dit, waar ligt
of werkt de producent, welke wijn staat centraal, wie is de actuele eigenaar of
wat is de relevante eigendomscontext, en welk zorgvuldig begrensd karakter helpt
de wijn herkennen? `Monograph` is geen toestemming voor trivia, een volledige
familiekroniek, een jaargangencatalogus of prestigeproza. De contentbrief noemt
expliciet wat op de pagina komt en wat naar een appellation, classificatie,
concept of narrative wordt uitbesteed.

### Page-archetype: `grape-overview`

Een druivenraspagina maakt een ras herkenbaar zonder het tot een vast smaakrecept
te reduceren. Zij behandelt of ontsluit minimaal:

1. identiteit, belang, gedocumenteerde oorsprong en de grens tussen zekerheid en
   overlevering;
2. de wijnstok en groeicyclus, waaronder knopvorming, bloei, rijping en oogstmoment
   voor zover die het ras helpen verklaren;
3. de verhouding tot klimaat, ligging, water en bodem, zonder terroir tot één
   oorzaak te versimpelen;
4. de belangrijkste regio's en appellations en de verschillende rollen die het
   ras daar speelt;
5. wijnstijlen, structuur en herkenningspunten in het glas, steeds als tendensen
   die mede door herkomst, oogstjaar en wijnmaken worden gevormd;
6. wijnbouwkundige sterktes, gevoeligheden en relevante ziekterisico's;
7. wijnmaak- en rijpingskeuzes die de expressie aantoonbaar beïnvloeden, inclusief
   de rol in assemblages wanneer die wezenlijk is;
8. relevante synoniemen, klonen en genetische verwantschappen;
9. herkenning op etiket en de vraag waar een ras wel of juist niet wordt genoemd;
10. hedendaagse ontwikkelingen, waarbij veranderlijke aanplantcijfers en trends
    naar gedateerde assertions of narratives mogen;
11. visuals met een concrete ampelografische, wijnbouwkundige, geografische of
    stilistische leertaak; en
12. verwante entities en narratives voor verdere verdieping.

De basislaag beantwoordt in gewone taal wat het ras is, waarom het ertoe doet,
waar het zijn belangrijkste rollen speelt en welke brede structuur of stijl het
kan bijdragen. `Intermediate` verklaart de hoofdpatronen: groeicyclus,
klimaatreactie, regionale verschillen, wijnbouw, wijnmaken en gebruik als
wijn van één ras of in een assemblage. `Advanced` behandelt onderbouwde oorsprong en
verwantschap, klonale variatie, fysiologische of ziektegerelateerde nuances,
historische verspreiding, juridische details en belangrijke uitzonderingen.
`Specialist` blijft gereserveerd voor vakdebatten, onderzoeksmethoden of
technische details die werkelijk nodig zijn voor de paginabelofte.

De geografische nadruk van een druivenpagina volgt het wereldwijde verhaal van
het ras zelf. De regio waarmee het project op dat moment wordt uitgebreid, een
beschikbare cluster van bestaande entities of een eerder gekozen ingang mag de
weging niet scheeftrekken. Het bronnen- en outlineplan bepaalt vooraf welke
herkomsten historisch, kwalitatief, stilistisch en hedendaags werkelijk
bepalend zijn; de hoeveelheid tekst en de kennisdiepte volgen die relevantie.
Een regio die voor één ras centraal staat, kan voor een ander slechts een
secundaire blend- of navigatierol hebben.

Volledigheid betekent hier niet dat iedere kloon, ieder synoniem en ieder land
wordt opgesomd. De pagina is compleet wanneer zij de bepalende eigenschappen,
variatie en grenzen uitlegt en het resterende detail bewust naar concrete
entities of narratives uitbesteedt. Oorsprongs-, ouderschaps- en genetische
claims vragen een gezaghebbende druivendatabase of wetenschappelijke bron;
producentenoverlevering alleen is daarvoor onvoldoende.

Voor beeld is een goed geïdentificeerde documentaire opname van tros, blad of
wijnstok het voorkeursanker. Een educatief diagram kan groei, anatomie of een
vergelijking uitleggen. Een gegenereerde illustratie mag een concept verhelderen,
maar geldt niet als bewijs voor rasidentificatie. Verspreidingskaarten gebruiken
uitsluitend geverifieerde geografische data en worden niet uit proza afgeleid.

Een actieve druivenrasentity gebruikt `grape-overview` in een package-lokaal
`content-plan.yaml`. De vaste dimensies zijn het startpunt, niet een dwangmatige
inhoudsopgave: categorieën mogen met een gemotiveerde scopebeslissing worden
samengevoegd of uitbesteed. Een ras-specifieke extra H2 mag worden toegevoegd
wanneer die noodzakelijk is voor het volledige narratief; de brief legt dan vast
waarom het onderwerp niet helder onder een standaardcategorie past. Verplichte
dimensies verdwijnen daardoor niet stilzwijgend.

### Semigestandaardiseerde titels van hoofdsecties

De H2 van iedere `section` in een region-, appellation-, producer- of
grape-overview begint met een vaste, gelokaliseerde categorie. Een auteur mag
daarna met ` — ` een vrije, levendige toevoeging schrijven. Zo blijft een pagina
scanbaar en onderling vergelijkbaar zonder de redactionele stem uit de koppen te
verwijderen.

Voorbeeld:

```md
## Geschiedenis — de haven kwam vóór de wereldfaam
```

De `coverage.key` in `content-plan.yaml` bepaalt het label; er komt geen tweede
headingveld in YAML. De pipeline valideert beide talen. Stable block-ID's blijven
ongewijzigd wanneer een zichtbare kop wordt herschreven. De regel geldt niet voor
de H3-koppen van `detail`-blocks.

| Coverage | Regio NL / EN | Appellation NL / EN |
| --- | --- | --- |
| `identity-and-orientation` | Overzicht / Overview | Ligging en afbakening / Location and boundaries |
| `historical-development` | Geschiedenis / History | Geschiedenis / History |
| `landscape-climate-and-soils` | Landschap, klimaat en bodem / Landscape, climate and soils | Landschap, klimaat en bodem / Landscape, climate and soils |
| `wine-families` | Wijnstijlen / Wine styles | — |
| `grape-varieties` | Druivenrassen / Grape varieties | Druivenrassen / Grape varieties |
| `viticulture-and-winemaking` | Wijnbouw en wijnmaken / Viticulture and winemaking | Wijnbouw en wijnmaken / Viticulture and winemaking |
| `appellation-structure` | Appellations / Appellations | — |
| `appellation-rules` | — | Appellationregels / Appellation rules |
| `classification-systems` | Classificaties / Classifications | — |
| `classification-and-producers` | — | Classificatie en producenten / Classification and producers |
| `trade-and-institutions` | Handel en instituties / Trade and institutions | — |
| `labels-and-terminology` | Etiketten en begrippen / Labels and terminology | — |
| `labels-and-buying` | — | Etiket en aankoop / Labels and buying |
| `style-and-glass-context` | In het glas / In the glass | Wijnstijl en flesontwikkeling / Wine style and bottle development |
| `modern-developments` | Hedendaagse ontwikkelingen / Contemporary developments | Hedendaagse ontwikkelingen / Contemporary developments |
| `visuals` | Beeld / Visuals | Beeld / Visuals |
| `child-knowledge` | Verder ontdekken / Explore further | Verder ontdekken / Explore further |

Producenten gebruiken dezelfde vorm met deze kerncategorieën: `Geschiedenis en
eigendom / History and ownership`, `Wijngaard en terroir / Vineyard and terroir`,
`Grand Vin / Grand Vin`, `Overige wijnen / Other wines` en `Werkwijze en uitgifte
/ Working methods and release`. Wanneer de inhoud dat beter beschrijft mag de
laatste categorie `Wijnmaken en opvoeding / Winemaking and maturation` heten.
Iconische producenten mogen daarnaast de scanbare categorieën `Druivenrassen /
Grape varieties`, `Classificatie en reputatie / Classification and reputation`,
`Etiket, serveren en bewaren / Label, serving and storage` en `Hedendaagse
ontwikkelingen / Contemporary developments` gebruiken. Alleen de tekst na ` — `
is vrij. Een categorie mag worden weggelaten wanneer de contentbrief haar
aantoonbaar uitbesteedt of als niet relevant motiveert; een kleinere schaal wordt
niet met lege standaardsecties opgevuld.

Druivenrassen gebruiken deze vaste categorieën:

| Coverage | Druivenras NL / EN |
| --- | --- |
| `identity-and-origins` | Identiteit en oorsprong / Identity and origins |
| `vine-and-growing-cycle` | Wijnstok en groeicyclus / Vine and growing cycle |
| `site-climate-and-soils` | Klimaat, ligging en bodem / Climate, site and soils |
| `regions-and-appellations` | Regio's en appellations / Regions and appellations |
| `wine-styles-and-sensory-profile` | Wijnstijlen en smaakprofiel / Wine styles and sensory profile |
| `viticulture-and-risks` | Wijnbouw en gevoeligheden / Viticulture and vulnerabilities |
| `winemaking-and-ageing` | Wijnmaken en rijping / Winemaking and ageing |
| `synonyms-clones-and-relatives` | Synoniemen, klonen en verwantschap / Synonyms, clones and relationships |
| `labels-and-recognition` | Etiket en herkenning / Labels and recognition |
| `modern-developments` | Hedendaagse ontwikkelingen / Contemporary developments |
| `visuals` | Beeld / Visuals |
| `child-knowledge` | Verder ontdekken / Explore further |

## Add an entity

Generate a package:

```bash
npm run content:new -- producer example-estate monograph
```

Gebruik dit directe producentencommando alleen nadat de monografietoets is
vastgelegd. `collection-profile` en `register-entry` worden normaal vanuit een
contentplan met `content:deps scaffold` aangemaakt, zodat owner en
anchor niet los van de dekkingsbeslissing kunnen ontstaan.

This creates:

```text
content/entities/producers/example-estate/
├── entity.yaml
├── overview.nl.md
└── overview.en.md
```

Een actieve grote overzichtsentity krijgt daarnaast handmatig een
`content-plan.yaml`; de generieke packagegenerator maakt dit archetypespecifieke
redactiecontract niet zelf aan.

Review every generated name, then add only verified canonical relations to `entity.yaml`. Reference other entities by stable ID:

```yaml
relations:
  - type: located_in
    target: appellation.example
```

Do not add the inverse relation to the target entity. The pipeline derives it.

Wanneer een goedgekeurd contentplan dependencies bevat, maak de ontbrekende
packages in één idempotente batch aan:

```bash
npm run content:deps -- scaffold region.example
```

De generator neemt alleen identiteit, namen en slugs uit het plan over. Nieuwe
packages blijven leeg en `draft`; relaties en wijnfeiten worden nooit geraden.

## Add a narrative

Create a package under `content/narratives/<type>/<slug>/` containing `narrative.yaml`, `article.nl.md`, and `article.en.md`. The metadata schema requires localized titles, slugs, files, and stable entity references.

Link entities in Markdown without application routes:

```md
[[producer.example-estate]]
[[producer.example-estate|Example Estate]]
```

The first form lets the renderer choose a localized label later. The second supplies the displayed label. Both forms are validated and generate narrative backlinks.

## Write Markdown bodies

Canonical entity overviews and narratives follow `content-blocks.md`. That
contract defines the accepted top-level directives, stable block IDs, heading
rules, block depth, entity links, citations, and NL/EN parity.

The parser, renderer, and strict block validation are implemented.
`content:check` validates block structure, citations, entity links, source
inventories, publication requirements, and hard NL/EN parity. The generated
bundle contains the normalized safe content tree consumed by the server-side
renderer.

## Localization

Canonical facts and relations exist once in `entity.yaml`. Dutch and English names, slugs, and Markdown are localized presentation fields. Both locale files are required in v1 so missing translations are visible during validation rather than silently hidden.

## Sources, geography, and depth

- Reusable source records belong under `data/sources/` and use stable `source.*` IDs.
- Assertions reference source IDs; do not flatten provenance into an unstructured note.
- `geography_id` may reference future verified geography data. Never invent coordinates or boundaries.
- `depth` supports `foundation`, `intermediate`, `advanced`, or `specialist` independently of routes and UI.

## Add media

Create one metadata record under `data/media/` and place its current local file
at `public/media/<storage_key>`. In Markdown, add a bodyless `figure` block that
uses only the stable `media.*` ID. Do not copy paths, URLs, captions or credits
into content. `content:check` verifies the reference, rights metadata, local
file, and SHA-256 checksum. Setting `MEDIA_BASE_URL` later switches delivery to
the same keys on a CDN without rewriting authored content.

## Validate and build

```bash
npm run content:check
npm run content:link-audit
npm run content:build
```

`content:link-audit` controleert de genormaliseerde Markdown op bekende namen die
als gewone tekst zijn blijven staan. Zo worden nieuwe entities ook teruggevonden
in eerder geschreven content. De audit maakt geen links en bedenkt geen nieuwe
entities; de auteur beslist of een kandidaat werkelijk een verwijzing is.

`npm run dev` and `npm run build` run content generation first. The generated `knowledge-base.json` bundle includes entity indexes, forward relations, inverse relations, backlinks, localized slug lookups, geography references, and search metadata.

Validation fails for malformed schemas and IDs, duplicate IDs/slugs, missing locale files, unknown entity/source references, unsupported relation types, and malformed entity links. Suggestions are shown for close entity-ID typos.

## Canonical versus generated

Authors edit:

- `content/entities/**`
- `content/narratives/**`
- `data/sources/**`
- `data/media/**`
- `public/media/**` while the local storage adapter is in use

Authors never edit `src/generated/content/**`. Rebuild it with `npm run content:build`; canonical content is not stored there. The generator also removes retired split JSON fragments that were previously emitted beside the runtime bundle.
