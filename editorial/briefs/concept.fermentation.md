# Contentbrief — Gist en alcoholische vergisting

Datum: 2026-10-05

Roadmapticket: `EXP-018`

Package: `concept.fermentation`

Archetype: `concept-system-overview`

## Paginabelofte en ownership

De lezer kent druif, most en het verschil tussen sap en schillen. Deze pagina is
de canonical eigenaar van alcoholische vergisting, gistecologie, startkeuze,
voeding, verloop, monitoring en onbedoeld vastlopen. De pagina legt uit hoe
most, gist en kelderbeheer samen bepalen wat tijdens de vergisting gebeurt.

De bestaande entity, slugs, tien gepubliceerde block-IDs en documentaire foto
blijven behouden. Er komt geen afzonderlijke gistentity. Ontvangst en
mostcorrecties blijven bij `grape-reception-must-preparation`, contact bij
`maceration`, stofoverdracht bij `extraction`, zuurconversie bij
`malolactic-fermentation`, rijping bij `elevage` en `lees-ageing`, oxidatie bij
`oxidation` en sulfietchemie bij `sulfur-dioxide`. Brede bederfdiagnostiek volgt
in EXP-022; de volledige routevergelijking volgt in EXP-019.

## Outline, lezersvragen en claimplan

| Coverage | Block | Lezersvragen en kernclaims | Diepte | Bewijs |
| --- | --- | --- | --- | --- |
| identity-and-scope | van-suiker-naar-wijn | Wat wordt omgezet, door wie, en wat zijn de producten? | foundation | OIV vergisting; AWRI temperatuur |
| system-components-and-relationships | opbouw-en-samenhang | Hoe werken suikers, populatie, voeding en vat samen? | foundation | AWRI gistkeuze/YAN; UC Davis |
| mechanisms-and-interactions | werking | Hoe verschillen groei, suikeromzetting en vertraging? | foundation; intermediate groei versus activiteit | Mouret et al. 2021; UC Davis |
| conditions-and-variation | gist-en-temperatuur | Wat verandert met startkeuze, temperatuur en zuurstof? | foundation; bestaande intermediate voeding en advanced ecologische herkomst | OIV; AWRI temperatuur, YAN, voedingsbeheer, sequencing, aeration |
| decisions-and-trade-offs | einde-van-de-gisting | Hoe kies en controleer je droog uitgisten, onderbreken of ingrijpen? | foundation; bestaande advanced meetblock | OIV interruption; AWRI restsuiker/TSS |
| global-context-and-examples | wereldwijde-context | Waarom vraagt iedere most een eigen verloop? | foundation | Australisch voedingsonderzoek; UC Davis Grenache-vergelijking |
| evidence-and-limits | bewijs-en-grenzen | Welke meting helpt bij vertragen; wat kan een diagnose niet uit één symptoom afleiden? | foundation; intermediate herstart; advanced aroma gevormd versus behouden | AWRI 2013 en rescue 2020; Mouret et al. 2021 |
| practical-interpretation | andere-processen | Wat verklaart vergisting aan het glas; welke buurprocessen doen iets anders? | foundation | OIV; AWRI gistkeuze; Comité Champagne; AWRI lies |

Status: de roadmap en de EXP-016-ownershipaudit autoriseren deze afbakening.
Outline en dependencies zijn vóór nieuwe prose gecontroleerd. Claims worden
alleen op de hierboven afgebakende schaal gebruikt. Er komt geen universele
voedingsdosering, temperatuur, fermentatieduur of alcoholtolerantie.

## Dependencies en begrippen

Bestaande concepts hergebruiken: ontvangst/mostvoorbereiding, maceration,
extraction, malolactic-fermentation, second-fermentation, elevage, lees-ageing,
oxidation, sulfur-dioxide, acidity en terroir. Structurele relaties worden
alleen toegevoegd als zij niet al aan de andere kant van de graph staan.
YAN, glucose/fructose, groeifasen en herstart zijn hub-owned uitleg, geen
nieuwe satellites. Chardonnay verwijst naar het bestaande draftrecord, zonder
activatie of structurele gist-druifrelatie. Grenache identificeert uitsluitend
het besproken onderzoeksmateriaal; er komt hiervoor geen nieuw druivenpackage. De lesson `alcoholic-fermentation` krijgt een inline
naslaglink en gerichte bron-/formuleringscorrecties; leerdoelen en path blijven.

## Wereldwijde voorbeeldmatrix

- Wit na sapklaring versus rood met schillen: andere beschikbaarheid van voeding
  en andere samenhang tussen temperatuur en extractie.
- UC Davis vergelijkt een geïnoculeerde en ongeïnoculeerde vergisting van dezelfde
  Grenache-most: verschillende curven kunnen beide droog eindigen. Geen duur
  uit die vergelijking verheffen tot een algemene kalender.
- Australische AWRI-publicaties tonen stam- en mostafhankelijke stikstofvraag;
  aroma-aanbevelingen uit Chardonnay-onderzoek blijven tot die context begrensd.
- Suikerrijke most versus een lager startgehalte: andere stress en voedingsvraag,
  zonder ieder warm wijngebied of iedere oogst over één kam te scheren.

Het algemene mechanisme blijft geldig zonder Bordeauxvoorbeelden. Onderzoeks-
contexten uit beide hemisferen dienen het inhoudelijke contrast, geen landenlijst.

## Visual teaching contract

De bestaande PNG `media.lesson.alcoholic-fermentation.fermentation-conversion`
wordt hergebruikt: sap met sterk vergrote gist, gasafvoer, sonde en koelmantel
verbinden biologische omzetting met kelderbeheer. De plaat is een conceptuele
opengewerkte tank, geen technisch bouwplan; de cellen en belletjes zijn niet op
ware schaal. Caption en omringende tekst leggen suiker → alcohol/CO₂ en warmte
uit. Geen nieuwe cijfers, molecuulstructuren, labels of empirische curves nodig.

De bestaande foto `oak-fermentation-tanks` documenteert houten kuipen bij
O. Fournier in Mendoza; oorspronkelijke Commons-beschrijving en CC BY 2.0
gecontroleerd. Zij blijft bij het fysieke vat en krijgt geen bewijsrol voor
onzichtbare biologische of sensorische uitkomsten. De PNG toont juist het
onzichtbare proces. Controleer beide beelden op 390 en 1440 pixels.

## Research en correcties

- De vijf bestaande fermentation-bronnen zijn opnieuw geopend. De AWRI-tekst
  uit 2013 blijft bruikbaar voor algemene monitoring en diagnose; geen absolute
  zuurstofveiligheidsclaim of temperatuurgrens overnemen. Het rescueprotocol
  van maart 2020 en het voedingsartikel van december 2022 scherpen die scope aan.
- Mouret et al. (2021), DOI `10.3390/fermentation7030155`, is gelezen als volledige
  uitgevers-PDF via de Semantic Scholar-mirror; de uitgeverspagina was voor de
  webtool niet bereikbaar. Identiteit, auteurs, datum en CC BY staan in de PDF.
- De les citeerde OIV voor dichtheidsmonitoring en AWRI's rode-temperatuurpagina
  voor algemene vatmateriaalclaims. De monitoring krijgt eigen brondekking;
  het vatgedeelte richt zich op het onderbouwde warmte-/meetvraagstuk. Detail
  over materialen blijft bij EXP-020.
- De informele brede mostdefinitie wordt vervangen door een verwijzing naar de
  nieuwe ontvangsthub; de omzetting blijft deze pagina's onderwerp.
- Gepubliceerde anchors blijven werken, ook wanneer hun kop positiever wordt
  geformuleerd. De naam `spontaan-is-geen-herkomstbewijs` blijft technisch intact.

## Publication gate

- [x] Ownership, outline, dependencies en beeldhergebruik beoordeeld.
- [x] Acht coveragevragen volledig en brongebonden beantwoord.
- [x] Foundation zelfstandig; hogere lagen voegen verklaringen en grenzen toe.
- [x] NL/EN structureren dezelfde kennis, links en citations.
- [x] Oude anchors, nieuwe naslaglink en afgeleide relaties gecontroleerd.
- [x] Smal/breed, zoeken, kennisdiepte, beide beelden en bronankers gecontroleerd.
- [x] Content-, link-, taal- en repositorychecks en relevante E2E geslaagd.

## Iteratielog

- Outline: bestaande IDs behouden; gisting, groei en voltooiing onderscheiden;
  voedingsstrategie en herstart geen recept geven. Bestaande PNG hergebruiken.
- Inhoud: acht foundationsecties, drie intermediate- en drie advanceddetails;
  de tien oude block-IDs zijn behouden. Groei/activiteit, restsuikermethoden en
  gevormd/behouden aroma expliciet onderscheiden. NL/EN-blockmetadata en
  entitylinks zijn gelijk; de lesson behoudt haar tien blocks en leerpadpositie.
- Bron- en linkreview: negen nieuwe source records, vijf oude bronnen opnieuw
  geraadpleegd; geen duplicaatmedia of nieuwe entity. Gerichte links naar
  Chardonnay en extractie toegevoegd. De globale linkaudit houdt 945 kandidaten
  over (174 nieuw, 768 pending, 3 false-positive); dit is redactionele voorraad,
  geen lijst gebroken links. Brede afhandeling blijft bij EXP-026.
- Techniek: `npm run format`, `npm run check` (133 tests), contentvalidatie,
  taal-/linkinventaris en productiebuild geslaagd. De volledige Playwright-suite
  slaagt met 85 tests. De sandbox blokkeerde poort 3100; dezelfde tests zijn
  daarna met toegestane lokale server uitgevoerd.
- Browser: 390 en 1440 pixels, foto/PNG, cumulatieve kennisdiepte, alle
  bronankers en les → naslag → les gecontroleerd. Geen horizontale overflow.
  Zoeken op YAN plaatst de voedingspassage bovenaan en opent de juiste
  intermediate-passage via haar bewaarde anchor. De preview draait op 3101.
- Publicatiestatus: 352 entities (284 actief), 8 narratives, één leerpad,
  559 sources en 179 media; 1.282 authored forward relations. EXP-018 afgerond;
  EXP-019 volgt, met platformonderhoud volgens de productroadmap.

Deze review is een redactionele zelfcontrole met technische validatie, geen
onafhankelijke expertcertificering.

## Historische review — 2026-09-16

Het eerdere vierpagina-cluster had een smallere introductiescope en uitsluitend
documentaire fotografie. EXP-018 breidt deze owner uit; de oorspronkelijke
reviewbevindingen blijven hieronder bewaard.


- Iteratie 1: dekkingsvragen per hoofdsectie gecontroleerd; definitie, werking, wijnstijlen en beperkingen geïntegreerd. Basis draagt de identiteit zelfstandig; verdieping verklaart keuzes en gevorderd behandelt niet-lineaire of microbiologische grenzen.
- Iteratie 2: het cluster onderling nagelopen. Bewust stoppen van vergisting onderscheiden van vastlopen; koolzuurmaceratie onderscheiden van koude schilinweking; kleur onderscheiden van tannine; élevage aangevuld met voorbereiding op botteling. Koolzuurmaceratie heeft een eigen draftrecord voor latere volledige uitwerking, geen tweede eigenaar op deze pagina.
- Iteratie 3: NL/EN naast elkaar gecontroleerd op gelijkwaardige blokken, diepte en betekenis. Geen Bordeaux als universele norm, geen vaste kelderrecepten of kwaliteitsscores. Fotografie toont daadwerkelijk zichtbare apparatuur of handelingen; captions begrenzen wat daaruit kan worden afgeleid.
- De secties beantwoorden de dekkingsvragen binnen deze paginabelofte; specialistische uitvoering en volledige deeltechnieken blijven bij hun eigen onderwerpen. Dit is een redactionele zelfcontrole, geen onafhankelijke expertcertificering.
