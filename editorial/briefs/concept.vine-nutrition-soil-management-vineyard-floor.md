# Contentbrief — Voeding, bodembeheer en wijngaardvloer

Datum: 2026-10-02  
Roadmapticket: `EXP-013`  
Voorgesteld package: `concept.vine-nutrition-soil-management-vineyard-floor`  
Archetype: `concept-system-overview`

## Voorkennis, paginabelofte en ownership

- Veronderstelde voorkennis: de lezer kent de wijnstok als levend systeem en begrijpt de hoofdlijnen van bodemprofiel en waterrelaties.
- Na afloop kan de lezer nutriëntenvoorraad, beschikbaarheid, opname en plantstatus van elkaar scheiden; een diagnose opbouwen; en keuzes voor vloerbeheer beoordelen als contextgebonden afwegingen.
- Deze pagina is canonical eigenaar van de samenhang tussen wijnstokvoeding, diagnose, organische stof, bodemleven, cover crops, grondbewerking, compactie, erosie, meststoffen en bodemverbeteraars.
- Deze pagina bezit bewust niet: bodemtypen en geologie (`concept.vineyard-soils`), waterfysiologie en irrigatie (`concept.vine-water-relations`), afzonderlijke ziekten of fysiologische stoornissen (`EXP-014`) en certificerings- of duurzaamheidslabels (`EXP-015`).
- Parenthub: `concept.vineyard-soils`; plantcontext: `concept.vine-as-living-system`.

## Entitybesluit

- [x] De satellite-toets is toegepast.
- Eén systeemhub is nodig omdat voeding, diagnose en vloerbeheer dezelfde wortelzone en dezelfde beslisketen delen.
- Stikstof, kalium, compost, cover crops, grondbewerking en afzonderlijke symptomen blijven hub-owned begrippen. Losse entities zouden nu vooral context en waarschuwingen herhalen.
- Tekorten en toxiciteiten kunnen later vanuit `EXP-014` als stoornissen worden ontsloten wanneer daar voldoende zelfstandige narratieve waarde voor blijkt.

## Lezersvragen en coverage

| Coverage key | Lezersvragen | Plaats | Reden |
| --- | --- | --- | --- |
| `identity-and-scope` | Wat is plantenvoeding en wat omvat de wijngaardvloer? | on-page | Scheidt voedingsstoffen van gesteentemineralen en beheer van bodemtype. |
| `system-components-and-relationships` | Welke voorraden, omzettingen, routes en verliezen verbinden bodem en wijnstok? | on-page | Voorkomt het beeld van meststof rechtstreeks naar druif. |
| `mechanisms-and-interactions` | Waarom is totale hoeveelheid niet hetzelfde als beschikbaarheid of opname? | on-page | pH, water, zuurstof, binding, wortels en reserves werken samen. |
| `conditions-and-variation` | Waarom verschilt dezelfde ingreep per plek, seizoen, ras en onderstam? | on-page | Grenzen aan universele streefwaarden en recepten. |
| `decisions-and-trade-offs` | Hoe diagnoseer en beheer je voeding, begroeiing, erosie en compactie? | on-page | Praktische kern van EXP-013. |
| `global-context-and-examples` | Hoe veranderen vloerkeuzes tussen natte, droge, vlakke, hellende en krachtige wijngaarden? | on-page | Wereldwijde geldigheid zonder normregio. |
| `evidence-and-limits` | Wat bewijzen bodemtest, weefselanalyse, symptomen en microbiomeclaims? | on-page | Begrenst schijnzekerheid. |
| `practical-interpretation` | Hoe leest een wijnstudent claims over voeding, oude bodems, cover crops en ‘levende bodem’? | on-page | Verbindt landbouwtaal met wijnkennis. |

## Sectie-outline en kennisdiepte

| Block-ID | Kern | Foundation | Verdieping | Gevorderd |
| --- | --- | --- | --- | --- |
| `overzicht` | definities en doel | complete oriëntatie | — | — |
| `opbouw-en-samenhang` | kringloop van bodem naar plant en terug | voorraden en routes | organische stof en organismen | microbiële causaliteit begrenzen |
| `werking` | beschikbaarheid en opname | hoofdmechanismen | pH, binding en transport | interacties en reserves |
| `omstandigheden-en-variatie` | plaats, jaar en plant | klimaat, water, bodem, onderstam | dynamische diagnose | — |
| `keuzes-en-afwegingen` | meten en ingrijpen | diagnose en hoofdkeuzes | cover crops, timing en organische input | amendments, compactie en langetermijneffecten |
| `wereldwijde-context` | contrasterende systemen | vier functionele situaties | — | — |
| `bewijs-en-grenzen` | schaal en bewijs | meerdere signalen combineren | consistente bemonstering | microbiome- en smaakclaims |
| `betekenis-voor-wijn` | interpretatie | groeikracht, vruchtvorming, rijping en most | — | — |

## Claims- en bronnenplan

| Claimfamilie | Bronsoort | Bronnen |
| --- | --- | --- |
| opname, verdeling en reserves | peer-reviewed plantonderzoek | Schreiner 2016; OSU 2024 |
| diagnose met bodem, blad/petiool en veldwaarneming | reviewed extension | OSU 2024 |
| bodemfuncties, organische stof en bodemleven | peer-reviewed reviews + regulator | Lazcano 2020; Oliver 2013; NRCS |
| floor management en cover-cropafwegingen | reviews/systematic review | Guerra & Steenwerth 2011; Abad 2021; Novara 2018 |
| erosie | wereldwijde review | Rodrigo-Comino 2018 |
| kalkrijke bodem en ijzerchlorose | peer-reviewed review | Tagliavini & Rombolà 2001 |

## Visual teaching contract

| Visual | Teaching question | Vorm | Verplicht zichtbaar | Verboden implicaties | Labels |
| --- | --- | --- | --- | --- | --- |
| `root-zone-nutrient-cycle` | Hoe bewegen voedingsstoffen door wortelzone, plant en beheer? | schematisch-naturalistische rasterplaat | zes genummerde stappen: bodemvoorraden, omzetting, bodemoplossing/binding, wortelopname, verdeling/reserves, terugkeer/verwijdering/verlies | gesteente rechtstreeks naar smaak; één universele mestgift; overdreven worteldiepte of microbiële dichtheid; idyllisering | uitsluitend cijfers 1–6; volledige uitleg in HTML |
| `vineyard-cover-crop` | Hoe ziet een begroeide vloer eruit? | documentaire foto | winterse wijnstokken en begroeiing tussen rijen | dat permanente begroeiing overal optimaal is | gelokaliseerd bijschrift |
| `cultivated-vineyard-floor` | Hoe ziet open grondbewerking eruit? | documentaire foto | rijen en zichtbaar bewerkte bodem | dat kale bodem per definitie slecht of schoon is | gelokaliseerd bijschrift |

## Publication gate

- [x] Alle coveragevragen zijn geadresseerd.
- [x] Ownership overlapt niet met bodem, water, risico of duurzaamheid.
- [x] Foundation is zelfstandig begrijpelijk.
- [x] Voorbeelden zijn functioneel en wereldwijd toepasbaar.
- [x] Algemene synthese en specifieke claims hebben passende bronnen.
- [x] NL/EN-pariteit is vereist.
- [x] Visuals hebben een leertaak, rechten en HTML-alternatief.
- [x] Pipeline, links, tests en visuele review slagen.

## Iteratielog

- Iteratie 1 — Het onderwerp is van een lijst meststoffen omgebouwd tot één diagnose- en beheersysteem.
- Iteratie 2 — Bodemtype, waterfysiologie, ziekten en duurzaamheidslabels zijn expliciet uitbesteed aan hun canonical owners.
- Iteratie 3 — Foundation is opgezet rond beschikbaarheid, plantstatus en diagnose; hogere lagen bezitten chemische, microbiële en langetermijnnuance.
- Iteratie 4 — De Nederlandse en Engelse teksten zijn inhoudelijk gelijkgetrokken en alle dependencies zijn in beide talen gelinkt. De basislaag behandelt zelfstandig nutriënten, beschikbaarheid, diagnose, vloerbeheer en wereldwijde variatie; verdieping bezit het cover-cropontwerp en gevorderd de microbiële en langetermijnbeperkingen.
- Iteratie 5 — Eén taalneutrale rasterplaat toont de zes schakels van bodemvoorraad tot terugkeer, afvoer of verlies. Twee open gelicentieerde foto's documenteren winterbegroeiing en bewerkte grond als contrasterende toestanden, zonder kwaliteitsrangorde.
- Iteratie 6 — Contentvalidatie, link-, relatie- en taalaudits, formatter, lint, TypeScript, 130 unit-tests, productiebuild en de gerichte Playwright-test slagen. De route is visueel gereviewd op 390 × 844 en 1440 × 1000 pixels; titel, kennisdiepte, figuren en doorlopende niveaublokken blijven leesbaar zonder horizontale overflow.
