# Wijngaardlessen, batch 2 — publicatiereview 2026-10-12

Review-ID: `QCR-2026-10-12-05`. Uitvoering: Codex. Scope: `LRN-015`, binnen
het goedgekeurde achtlessencurriculum (`DEC-LRN-015`). Inhoudelijke en technische
controle; geen menselijke gebruikerstest, externe expertgoedkeuring of live
deploymentverificatie.

## Resultaat en didactiek

Drie complete actieve standalone lessons met eigen NL/EN-proza:

| ID | Verklaringsboog en toepassing |
| --- | --- |
| `narrative.lesson.pruning-canopy-and-crop` | Vorm/knoppen → groen werk → licht/bescherming → fruitbelasting; fictieve late ontbladering vóór een hete week met beredeneerde afweging |
| `narrative.lesson.nutrition-and-vineyard-floor` | Bodemvoorraad/opname → weefselconcentratie → functie/concurrentie van bedekking → herbeoordeling; fictief lager stikstofgetal bij snellere groei |
| `narrative.lesson.vineyard-risks-and-protection` | Oorzaken ordenen → symptoom/hypothese → preventie/actie/nacontrole → fruitdoel; fictieve gele bladeren in natte laagte, geen diagnose uit het patroon alleen |

Iedere les heeft drie leerdoelen, verklarend proza, een PNG met gelokaliseerde
markerlegenda, een uitgewerkte kwalitatieve oefening, een glas-koppeling en
kernidee. Begrippen zoals cordon, concentratie, infiltratie, vector en hypothese
zijn bij eerste gebruik uitgelegd. De eerder behandelde plant, jaarcyclus,
microklimaat, bodem en water worden waar nodig hernomen met gerichte naslaglinks.
De plant-/fruitketen blijft zichtbaar zonder direct smaak aan een ingreep toe
te schrijven. NL/EN naast elkaar beoordeeld op claims, leesvolgorde en betekenis;
de validator bewaakt gelijkwaardige blockstructuur, media en bronreferenties.

Canonical kennisowners en de oorspronkelijke zevenlessenroute blijven behouden.
De nieuwe lessen zijn vindbaar via Learn, Verdiepingen, zoeken, sitemap en
naslagteruglinks. Zes van acht wijngaardlessen zijn nu actief; het volledige
wijngaardpath en zijn voortgang volgen pas in LRN-017. Een query met het oude
stille-wijnpad geeft de nieuwe lessen geen onterechte pathcontext.

## Bronnen en claimgrenzen

Elf bestaande bronrecords opnieuw geraadpleegd; `accessed_at` bijgewerkt.
AWRI-waterlogging was dezelfde dag al in batch 1 gelezen en is opnieuw als
begrensde input gebruikt. Geen nieuwe bronrecords of feitelijke entitywijziging.

| Claimfamilie | Broncontrole en grens |
| --- | --- |
| Geleiding, eenjarig hout, spoorsnoei/lange snoei | UGA dormant pruning: volledige Extension-tekst; geen regionale snoeidata, afmetingen of knopgetallen overgenomen |
| Blootstelling en late ontbladering | Gambetta sunburn: volledige Frontiers-tekst, specifiek management/leaf-removal; geen universeel veilige zijde of drempel |
| Fruitbelasting en trosdunning | VanderWeide review/meta-analyse: DOI-open gaf toolfout, volledige PDF via auteursrepository Universiteit Turijn gelezen; variatie door ras/sterkte, geen uniform timing-/klimaateffect geclaimd |
| Concentratie, groei en representatieve vergelijking | OSU monitoring vineyard nutrition: volledige Extension-tekst; weefsel versus totale hoeveelheid onderscheiden, geen analysedrempel of bemestingsrecept |
| Bodemprocessen en voeding | Lazcano: volledige Frontiers-tekst; bodemleven en beschikbaarheid, geen microbiome-naar-smaakclaim |
| Bedekking en bodemfunctie/concurrentie | Abad reviews 1/2: rechtstreeks publisher-open gaf toolfouten; relevante volledige tekstpassages beschikbaar via de publisherzoekindex, inclusief erosie/structuur en water-/nutriëntenconcurrentie. Geen proefgemiddelden of mengselrecepten |
| Geïntegreerde bescherming | OIV-VITI 592-2018: PDF met beslisfactoren, monitoring en impactbeperking; gebruikt als begripskader, geen claim over actuele lokale toelatingen |
| Symptomen, lookalikes en vector | UC IPM Pierce’s disease: pagina gelezen; labonderzoek bij twijfel, insectaanwezigheid bewijst geen infectie |
| Phylloxera en onderstam | INRAE ePhytia: historische/generieke grafting-uitleg; geen resistentierangschikking of actuele quarantaineclaims |
| Botrytis en fruitdoel | Váczy 2024: volledige Frontiers-tekst; verschil grijze/edele rot in passende omstandigheden, geen specifieke Furmint-proefuitkomst veralgemeend |
| Natte wortelzone | AWRI managing waterlogged vineyards: eerdere PDF-review dezelfde dag; zuurstof/wortelfunctie, geen drainageontwerp |

De artikelen bewaren hun citaties en herbruikbare bron-IDs. Casussen zijn
expliciet fictief, zonder echte plaatsnamen, verzonnen metingen, opbrengst- of
kwaliteitsclaims. Geen uitvoeringsdosis, pesticideprogramma of diagnose op
bladkleur. De twee nieuwe linkauditkandidaten voor sweet-wines zijn als relevante
verwijzingen toegevoegd in NL/EN; geen globale registry-sync uitgevoerd.

## Beeldreview

Drie bestaande project-PNG's zelfstandig visueel bekeken; geen nieuwe mediabytes:

- **Annual decision chain, 1–5:** eerste beeld vóór snoei, tweede na snoei,
  vervolgens scheutwerk, zomerwerk en beoordeling. De legenda voorkomt dat
  losse trossen als algemeen dunningsadvies of getekende knoppen als recept gelden.
- **Root-zone nutrient cycle, 1–6:** voorraad, omzetting, oplossing/binding,
  opname, verdeling en open kringloop. Pijlen, bolletjes en vergroot bodemleven
  schematisch; schimmelpartner niet als gegarandeerde opname gepresenteerd.
- **Diagnostic framework, 1–5:** verschillende mogelijke oorzaken en een
  onderzoekscyclus. Geen symptoomatlas of soortidentificatie. De legenda noemt
  expliciet dat het insect geen phylloxera is en dat de getekende plastic zak
  geen monsterprotocol biedt: verpakking/transport volgens het ontvangende lab.
  Dit voorkomt ook strijd met OSU’s instructies voor voedingsmonsters.

## Verificatie

- `npm run content:check`: geldig, **359 entities, 14 narratives, 1 path,
  612 sources, 188 media**. Dertien actieve lessons en één regionale draft.
- `npm run format` en `npm run check`: formatting, ESLint, contentbuild,
  relationele audit van **295 actieve entities / 1342 forward relations**,
  Next-typegeneratie, TypeScript en **184 unit-tests in 24 bestanden** geslaagd.
- `npm run test:e2e -- --workers=4`: productiebuild (939 statische pagina's) en
  **173/173 browsertests geslaagd**. De vineyard-suite uitgebreid naar alle zes
  bestaande/nieuwe wijngaardlessen; drie nieuwe taalwisselchecks met gedeeld anker.
  Alle twaalf gelokaliseerde pagina's op **320 en 1440px**, PNG-lading/alttekst,
  markerlegenda, geen horizontale overflow, naslag/backlinks, Learn/Verdiepingen/
  zoeken en toetsenbordactivatie gecontroleerd. Beide talen zonder JavaScript,
  onterechte pathquery en twaalf permanente aliasredirects meegenomen.
- Visuele browsercontrole **390/1440px**: NL-snoeiles inclusief figuur op desktop,
  EN-snoeiles op mobiel, NL-voedingsles op desktop, EN-voedingsfiguur/legenda op
  mobiel, EN-risicofiguur/legenda op desktop en NL-risicoles/oefening op mobiel.
  Titels, tekstkolommen, leerdoelen, legenda en zijbalk passen bij de huisstijl.
- De bestaande preview op **3101** was een eerder gestarte productieserver met
  oude content in geheugen. Herstart met de geteste build, nieuwe pagina zichtbaar
  gecontroleerd en Learn-overzicht klaargezet. Geen appcodefix nodig.
- Geen runtime-/pipeline-/schemawijziging, nieuwe dependency of mediagroei.
  Schaalbenchmark niet opnieuw nodig; MNT-064/065 behouden hun bestaande triggers.

## Vervolg

`LRN-015` afgerond; **60** niet-afgeronde tickets in de productplanning.
Eerstvolgend: `LRN-016`, rijpheid/oogst en teeltsystemen/duurzaamheid/aanpassing.
Extra aandacht voor overlap met de bestaande keldergerichte grondstofles en
actuele scope/versie van normbronnen. Curriculumakkoord blijft geldig.
`LRN-017` verbindt daarna alle acht lessen tot het volledige path.
Geen nieuwe blocker of onderhoudsticket gevonden; feedback blijft geparkeerd.
