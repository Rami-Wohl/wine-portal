# Explore foundation authoring contract

Status: binding workflow for `EXP-*` foundation content  
Established: 2026-09-24  
Roadmap: `explore-foundation-roadmap.md`  
Coverage baseline: `explore-foundation-coverage.md`

Dit contract vertaalt de algemene contentregels naar herbruikbare afspraken voor
de conceptuele basis van Explore: wijnstok, wijngaardomgeving,
wijnbouwbeslissingen, vinificatie, samenstelling en waarneming. De research
policy, knowledge architecture, contentblocks en visual language blijven
onverkort van toepassing.

## 1. Eerst de juiste publicatievorm kiezen

Kies vóór research en scaffolding één vorm. Een onderwerp wordt niet groter
gemaakt omdat er veel informatie over vindbaar is.

### `concept-system-overview`

Gebruik dit archetype voor een systeemhub wanneer de lezer meerdere onderdelen,
fasen of beslissingen in samenhang moet begrijpen. Een hub:

- beantwoordt één overkoepelende systeemvraag;
- maakt relaties tussen onderdelen zichtbaar;
- geeft een bruikbare route door het geheel;
- verwijst duurzaam naar zelfstandig herbruikbare satellites; en
- blijft begrijpelijk zonder eerst iedere satellite te openen.

Voorbeelden uit de roadmap zijn de wijnstok als levend systeem,
besontwikkeling en rijpheid, wijngaardbodems, hoofdvinificatieroutes en
wijnsamenstelling.

### `concept-focused-overview`

Gebruik dit archetype voor een gericht concept met één herkenbaar mechanisme,
functie of beslisvraag. Een focused concept:

- is zelfstandig zoekbaar en op meerdere plaatsen herbruikbaar;
- bezit meer uitleg dan een korte hubdefinitie;
- heeft een duidelijke grens met zijn parent of buurconcepten; en
- hoeft geen miniatuurversie van de volledige systeemhub te worden.

Voorbeelden kunnen source–sink, véraison, waterstatus, bâtonnage of
fortificatie zijn, mits de entitytoets de zelfstandigheid bevestigt.

### Geen zelfstandige pagina

Houd informatie in een hubsectie of compact register wanneer het onderwerp
alleen daar betekenis heeft, slechts een synoniem of variant is, geen eigen
bronnen/relaties nodig heeft of in een korte uitleg volledig kan worden
afgedekt. Een naam in een boek of syllabus is geen automatisch entityrecht.

Pas vóór een nieuwe entity de satellite-toets uit de roadmap toe. Minimaal twee
van deze signalen moeten gelden: zelfstandige zoekvraag, hergebruik door
meerdere pagina's, betekenisvolle eigen relaties/bronnen, uitleg die niet
compact in de hub past, of een eigen onderhoudslifecycle.

## 2. Canonical ownership en grenzen

Leg in de contentbrief één zin vast die begint met:

> Deze pagina is de canonical eigenaar van …

Leg daarna expliciet vast wat de pagina niet bezit en naar welke concrete owner
dat detail gaat. Gebruik deze regels:

- De hub bezit het systeemmodel, de oriëntatie en de relaties tussen onderdelen.
- Een satellite bezit de volledige uitleg van zijn specifieke mechanisme of
  term.
- Een lesson bezit leerorde, context en oefening, maar geen parallelle versie
  van stabiele wijnfeiten.
- Regio-, druif- en producentpagina's tonen plaatselijke toepassing en linken
  naar het algemene mechanisme.
- Eén feit krijgt één primaire onderhoudsplek. Andere pagina's mogen het kort
  contextualiseren, niet stilzwijgend een tweede canonical uitleg onderhouden.

Wanneer twee geplande pagina's dezelfde vraag zouden beantwoorden, wordt de
grens vóór proza herzien. Een `related_to`-relatie lost dubbele ownership niet
op.

## 3. Verplichte dekking voor systeemhubs

Een `concept-system-overview` gebruikt onderstaande coverage keys in
`content-plan.yaml`. De vaste kop is een scanbaar begin; tekst na ` — ` mag
levendig en onderwerpspecifiek zijn.

| Coverage key | H2 NL / EN | Volledigheidsvragen |
| --- | --- | --- |
| `identity-and-scope` | Overzicht / Overview | Welk systeem verklaart deze pagina? Waar begint en eindigt het? Welke voorkennis is nodig? |
| `system-components-and-relationships` | Opbouw en samenhang / Structure and relationships | Welke onderdelen zijn essentieel? Hoe verhouden ze zich? Welke onderdelen hebben een eigen owner? |
| `mechanisms-and-interactions` | Werking / How it works | Welke causale of temporele processen verbinden de onderdelen? Welke vereenvoudigingen moeten worden begrensd? |
| `conditions-and-variation` | Omstandigheden en variatie / Conditions and variation | Welke biologische, fysische, chemische, menselijke of tijdsgebonden omstandigheden veranderen de uitkomst? |
| `decisions-and-trade-offs` | Keuzes en afwegingen / Decisions and trade-offs | Waar kan een teler of maker sturen? Welk voordeel, risico of alternatief hoort bij iedere hoofdkeuze? |
| `global-context-and-examples` | Wereldwijde context / Global context | Welke voorbeelden tonen werkelijk verschillende omstandigheden of toepassingen? Is één regio onbedoeld de norm geworden? |
| `evidence-and-limits` | Bewijs en grenzen / Evidence and limits | Wat is goed aangetoond, contextafhankelijk, betwist of nog onzeker? Welke populaire versimpeling vraagt correctie? |
| `practical-interpretation` | Betekenis voor wijn / Significance for wine | Hoe helpt dit systeem regio-, druif-, stijl- of wijngaardinformatie begrijpen zonder een smaak- of kwaliteitsgarantie te maken? |

Een coverage-item mag meerdere blocks bezitten en een block kan details op
meerdere kennisdieptes dragen. De tabel is geen voorgeschreven leesvolgorde.
Samenvoegen gebeurt alleen wanneer iedere vraag traceerbaar beantwoord blijft.

## 4. Verplichte dekking voor gerichte concepts

Een `concept-focused-overview` gebruikt:

| Coverage key | H2 NL / EN | Volledigheidsvragen |
| --- | --- | --- |
| `identity-and-scope` | Overzicht / Overview | Wat is het concept in gewone taal? Welke nabije begrippen worden vaak verward? |
| `mechanism-and-function` | Werking / How it works | Wat gebeurt er, in welke volgorde en via welk onderbouwd mechanisme? |
| `conditions-and-variation` | Omstandigheden en variatie / Conditions and variation | Wanneer verandert werking, intensiteit of relevantie? Welke uitzonderingen zijn materieel? |
| `application-and-decisions` | Toepassing en keuzes / Application and decisions | Hoe wordt het herkend, gemeten, gebruikt of gestuurd? Welke afwegingen zijn relevant? |
| `evidence-and-limits` | Bewijs en grenzen / Evidence and limits | Welke claims zijn aangetoond en welke uitleg zou te stellig zijn? |
| `practical-interpretation` | Betekenis voor wijn / Significance for wine | Waarom heeft de lezer dit concept nodig om druif, wijngaard, proces of wijn te begrijpen? |

Een compacte satellite blijft compact. Wanneer een coveragevraag met één helder
foundationblock is beantwoord, wordt hij niet opgevuld met een kunstmatige
advancedsectie.

## 5. Kennisdiepte

Page depth en lessonniveau zijn verschillende systemen. Een WSET 2+-lesson mag
foundationkennis uit een gespecialiseerd concept gebruiken; de hele conceptpagina
wordt daardoor niet automatisch een beginnersles.

Kalibreer ieder block afzonderlijk:

- `foundation` — ongeveer WSET 2+: identiteit, hoofdwerking en het onderscheid
  dat nodig is om het onderwerp correct te herkennen;
- `intermediate` — ongeveer WSET 3+: causale verklaring, hoofdvariatie en de
  belangrijkste beslissingen en trade-offs;
- `advanced` — ongeveer WSET 4+ en duidelijk boven Level 3: meerdere
  mechanismen, uitzonderingen, evidencegrenzen, meetproblemen en technische of
  historische wisselwerking;
- `specialist` — primaire methoden, specialistische analyse of een werkelijk
  vakdebat dat noodzakelijk is voor de paginabelofte.

Harde controles:

1. Een essentieel begrip blijft foundation, ook wanneer het mechanisme technisch
   is; leg het eerst eenvoudig uit.
2. Een advancedblock verdiept of problematiseert een eerder begrip; het bewaart
   geen kernkennis om de pagina langer interactief te laten lijken.
3. Niet ieder coverage-item heeft alle dieptes nodig.
4. Twee opeenvolgende blocks met dezelfde hogere diepte vormen in de presentatie
   één visuele groep; de authoringvolgorde moet dat logisch ondersteunen.

## 6. Wereldwijde voorbeeldselectie

Voorbeelden vervullen een verklarende functie. Kies ze tijdens de outline, niet
pas om afgerond proza op te fleuren.

Maak per hub een compacte voorbeeldmatrix met waar relevant:

- koel en warm;
- vochtig en droog;
- maritiem en continentaal;
- noordelijk en zuidelijk halfrond;
- oude en nieuwe wijnbouwcontext;
- verschillende druif-, bodem-, water- of productieroutes; en
- een situatie waarin het eenvoudige model zichtbaar tekortschiet.

Dit zijn selectieassen, geen quota. Eén treffend voorbeeld kan meerdere assen
dragen. Neem een regio alleen op wanneer zij het mechanisme beter uitlegt of een
relevante grens laat zien. Verdeel voorbeelden op inhoudelijke waarde, niet op
de volgorde waarin Oenocademy regio's heeft gepubliceerd.

Voer vóór publicatie de vervangingstest uit: als alle Bordeauxvoorbeelden door
een andere regio worden vervangen, blijft het algemene mechanisme dan hetzelfde?
Zo niet, dan is mogelijk regionale praktijk als universele regel geschreven.

## 7. Evidence- en claimcontract

Maak per coverage-item onderscheid tussen:

- **algemene synthese** — stabiele context die een geschikte review, vakboek of
  gezaghebbend instituut voor de hele claimfamilie kan dragen; en
- **specifieke claim** — causale, kwantitatieve, juridische, historische,
  betwiste, plaatsgebonden of veranderlijke uitspraak die directe support nodig
  heeft.

Voor biologische, chemische, bodemkundige en sensorische mechanismen begint de
research bij peer-reviewed reviews, wetenschappelijke instituten en geschikte
vakboeken. Primaire studies zijn nodig voor precieze of betwiste beweringen,
maar één studie wordt niet zonder synthese tot wereldwijde regel verheven.
Trade bodies en producenten kunnen lokale praktijk documenteren; zij dragen
geen algemene causaliteit of kwaliteitsoordeel.

`evidence-and-limits` is geen verzameling defensieve stopzinnen. Beschrijf
positief wat de evidence wél ondersteunt, welke factoren de uitkomst veranderen
en waar een populaire directe causaliteit moet worden vervangen door een
realistischer keten.

## 8. Visual teaching contract

Beoordeel ieder leerdoel en iedere moeilijke ruimtelijke, temporele of causale
relatie op beeldkans. Leg in de brief vast:

- de teaching question;
- waarom foto, schematisch-naturalistische plaat, eenvoudige diagram of geen
  beeld de juiste vorm is;
- welke objecten, fasen en relaties zichtbaar moeten zijn;
- welke details of implicaties verboden zijn;
- schaal, richting, timing en andere toegestane vereenvoudigingen;
- taalneutrale nummers, pijlen of symbolen die werkelijk in pixels moeten staan;
- hoe de Nederlandse en Engelse HTML-uitleg alle essentiële kennis draagt; en
- narrow-screen-, zoom- en alttekstgedrag.

Fotografie blijft eerste keus voor zichtbare werkelijkheid. Een diagram legt
een model, proces of onzichtbare relatie uit en is nooit bewijs dat een echt
monster, perceel of wijn zich zo gedraagt. Een systeemhub heeft normaal minimaal
één overzichtsvisual; een focused concept mag alleen zonder beeld worden
gepubliceerd wanneer de brief concreet uitlegt waarom beeld geen leertaak
vervult.

De inhoudelijke expertcheck vraagt niet alleen “is dit mooi?”, maar ook:

- zijn onderdelen botanisch, fysisch of technisch herkenbaar;
- kloppen richting, volgorde, schaal en relatieve verhoudingen;
- is variatie niet als vaste toestand getekend;
- suggereert de compositie geen causale relatie die de tekst niet ondersteunt;
  en
- blijft de uitleg compleet wanneer het beeld niet beschikbaar is?

## 9. Dependencies en entitylinks

Inventariseer vóór proza alle begrippen die mogelijk een eigen owner nodig
hebben. Geef elk kandidaatbegrip één besluit:

- bestaande entity hergebruiken;
- nieuwe satellite na geslaagde entitytoets;
- hub-owned sectie of registeritem;
- narrative voor leerorde of gedateerde context; of
- buiten scope met concrete owner of reden.

Maak noodzakelijke draftentities in één batch vóór authoring. Gebruik in proza
stable entitylinks en registreer structurele relaties slechts eenmaal. Controleer
na build zowel forward als afgeleide inverse relaties en voorkom dubbele items in
Gerelateerde onderwerpen.

## 10. Authoringvolgorde

1. Open de actuele coverage matrix en bevestig bestaande owners en gaps.
2. Kies `concept-system-overview`, `concept-focused-overview` of geen nieuwe
   pagina.
3. Vul `editorial/templates/explore-foundation-brief.md` in.
4. Leg ownership, scopevragen, voorbeeldmatrix, dependencies, claims en visuals
   vast; laat de outline inhoudelijk goedkeuren.
5. Maak het package of behoud de bestaande entity-ID. Voeg een package-lokaal
   `content-plan.yaml` toe met een van de twee conceptarchetypes.
6. Registreer en verifieer sources; scaffold alleen goedgekeurde dependencies.
7. Schrijf en herzie eerst Nederlands per coveragevraag en kennisdiepte.
8. Schrijf de Engelse localization vanuit dezelfde kennis en blockstructuur.
9. Registreer media en toets inhoud, rechten, captions, alttekst en responsive
   presentatie.
10. Draai de section- en publication gates hieronder, daarna de repositorychecks.
11. Werk `explore-foundation-coverage.md` en de roadmapstatus bij.

## 11. Section completeness gate

Een coverage-item is pas `complete` wanneer:

- iedere vooraf benoemde lezersvraag is beantwoord of naar een concrete owner is
  uitbesteed;
- identiteit, werking, relevante variatie en gevolg niet door losse feiten van
  elkaar zijn losgeraakt;
- jargon bij eerste gebruik gewoon wordt uitgelegd;
- foundation zelfstandig begrijpelijk is;
- intermediate causaliteit verklaart en advanced werkelijk verder gaat;
- een regionale praktijk niet ongemerkt universeel is gemaakt;
- algemene synthese en specifieke claims passende sources hebben;
- onzekerheid of modelgrens precies staat waar zij nodig is;
- NL en EN dezelfde scope, nuance, links, citations en blockstructuur dragen; en
- de visualvraag bewust is beantwoord.

Herhaal deze gate na iedere inhoudelijke iteratie. Een lang block, veel bronnen
of foutloze YAML zijn afzonderlijk geen volledigheidsbewijs.

## 12. Publication gate

Een foundationpackage wordt pas actief of als herzien beschouwd wanneer:

- alle content-planreviews `complete` zijn;
- geen required coverage `research-gap` of ongemotiveerde omissie bevat;
- alle dependencies bestaan en de bedoelde ownershipgrens zichtbaar is;
- links, relations, backlinks en related-topicgroepen redactioneel zijn
  gecontroleerd;
- alle gebruikte sources en media in de canonical registers staan;
- kennisdiepte, globale balans en positieve formulering zijn gereviewd;
- de pagina op smal en breed scherm visueel is gecontroleerd;
- `npm run content:check`, `npm run content:link-audit` en `npm run check` slagen;
  en
- relevante E2E-tests slagen wanneer route, renderer of UI is gewijzigd.

## 13. Incrementele toepassing op bestaande concepts

De 49 bestaande actieve conceptpagina's blijven geldig zonder retroactieve
fillerplannen. Zodra een `EXP-*`-ticket een concept substantieel herschrijft of
tot hub promoveert, krijgt het eerst een passend contentplan. Nieuwe foundation-
concepts krijgen altijd een plan vóór activatie.

Dit is geen halve migratie: de coverage matrix benoemt precies welke pagina op
welk ticket wordt herzien. Zo wordt de overgang per inhoudelijke cluster
volledig uitgevoerd zonder 49 plannen te genereren die nog niet eerlijk zijn
onderzocht.

## 14. Visuele pilot voor review

`EXP-003` heeft `concept.clonal-selection` als eerste productieproef voor de
schematisch-naturalistische diagramstijl gebruikt. De goedgekeurde plaat is
`media.concept.clonal-selection.selection-propagation-trials-v3`.

De pilot bevestigt dat taalneutrale nummers en pijlen in het beeld, gecombineerd
met een sterke gelokaliseerde titel en genummerde uitleg in HTML, de beste balans
geven. De uitleg blijft zo vertaalbaar, doorzoekbaar en toegankelijk zonder de
plaat visueel te overladen. Vijf duidelijk genummerde fasen, concrete botanische
objecten en beperkte pijlen bleven ook op smal scherm als proces herkenbaar. Een
reviewcorrectie verwijderde bovendien bergen, heuvels en cipressen die een
onnodige mediterrane herkomst suggereerden; geografische neutraliteit is daarom
ook bij niet-geografische procesplaten een expliciete controle.

Deze plaat is een stijlreferentie, geen verplicht lay-outsjabloon. De
onderwijsvraag bepaalt of een volgende visual een route, cyclus, doorsnede of
vergelijking nodig heeft. Productieprompt, bronnen, correctierondes en
reviewstatus blijven per asset in brief en mediarecord traceerbaar.
