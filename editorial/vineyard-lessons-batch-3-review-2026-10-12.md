# Wijngaardlessen, batch 3 — publicatiereview 2026-10-12

Review-ID: `QCR-2026-10-12-06`. Uitvoering: Codex. Scope: `LRN-016`, binnen
het goedgekeurde achtlessencurriculum (`DEC-LRN-015`). Inhoudelijke en technische
controle; geen menselijke gebruikerstest, externe expertgoedkeuring of live
deploymentverificatie.

## Resultaat en didactiek

Twee complete actieve standalone lessons met eigen NL/EN-proza:

| ID | Verklaringsboog en toepassing |
| --- | --- |
| `narrative.lesson.ripeness-and-harvest` | Meerdere rijpheidsprocessen → meting/proeven → representatief verloop → oogst onder onzekerheid; fictieve frisse witte wijn met stijgende suikerwaarde, verschrompeling en weersverwachting |
| `narrative.lesson.vineyard-systems-and-adaptation` | Samenhang in beheer → naam/afspraken → praktijk/controle/resultaat → adaptatie/mitigatie → zelf een begrensde keuze uitwerken; fictieve bedekking bij afstroming en droogte |

Iedere les heeft drie leerdoelen, verklarend proza, een PNG met gelokaliseerde
markerlegenda, een kwalitatieve toepassing, glas-koppeling en kernidee.
Véraison, Brix, pH/titreerbaar zuur, monster/tijdreeks en adaptatie/mitigatie
worden in de uitleg geïntroduceerd. De twee lessen zijn zelfstandig te lezen.
Claims, volgorde en betekenis in beide talen naast elkaar beoordeeld;
blockstructuur, bronreferenties en media via de parityvalidator gecontroleerd.

Alle acht wijngaardlessen zijn nu actief; totaal vijftien actieve lessons plus
één regionale draft. Het volledige wijngaardpath blijft afzonderlijk LRN-017.
De lessen zijn vindbaar via Learn, Verdiepingen, zoeken en naslagteruglinks.
De productiebuild neemt de nieuwe routes ook in de sitemap op. Geen nieuwe
entities, bronrecords, mediabytes of dependencies nodig.

## Bronnen, versie en claimgrenzen

Acht bestaande bronrecords opnieuw geopend en `accessed_at` bijgewerkt:

| Bron | Beoordeelde input en grens |
| --- | --- |
| AWRI berry ripening | PDF: rijpingsprocessen en waterverlies/concentratie; geen exacte tijden, percentages, absolute chemische vereenvoudigingen of universele oogstgrens overgenomen |
| AWRI sampling | On-farm-trials manual 3.1, met name maturity assessment: variatie binnen/tussen trossen, bemonstering en herhaling; geen generiek monstergetal of meetinterval voorgeschreven |
| OSU preparing for harvest (2023) | Volledige Extension-pagina: Brix versus volledige suikeranalyse, pH/TA en monstervoorbereiding; geen alcoholformule, laboratoriumprocedure of correctiedosis |
| OIV sustainability principles (2016) | Milieu, sociaal en economisch samen; geïntegreerde productie als begripskader, geen keurmerkenranglijst |
| OIV implementation guide (2020) | Secties 3.2.7–3.2.9 en actiegebied 2.8: doelen/indicatoren, bijstellen, adaptatie/mitigatie en keuzehorizon; geen lokale wettelijke claim |
| Europese Commissie organic production/products | Actuele uitleg over EU-productieregels en afzonderlijke wijnbereidingsregels; geen wereldwijde regels of gedetailleerde lijst van middelen/limieten |
| Demeter international standard 2026 | PDF: scope, certificering en preparaten (2.5–2.6, 6.2); normversie benoemd, normtekst geen werkzaamheidsbewijs; geen uitspraak dat alle biodynamische wijn Demeter-gecertificeerd is |
| Newton et al. (2020) | Review met proces-/uitkomstdefinities: vraag om concrete definitie; geen actuele wereldwijde juridische claim over het ontbreken van een definitie |

De twee Abad-reviews over bodembedekking waren dezelfde dag in batch 2
herbeoordeeld via primaire publisherpassages. Hergebruikt voor begrensde
erosie-/waterafweging, zonder proefuitkomsten, mengselrecepten of verzonnen data.
De Van Leeuwen-adaptatiepaper was via DOI en publisher niet bereikbaar; niet als
nieuwe claimbasis of heropend bronrecord opgevoerd. OIV 2020 ondersteunt de
gebruikte aanpassingsopties zelfstandig. De volledige catalogus van REG-003
blijft buiten dit curriculum; geen essentiële link naar draftcontent toegevoegd.

Linkaudit read-only uitgevoerd. Geen kandidaat in de twee nieuwe lessen;
bestaande kandidaten in de grondstofles liggen buiten de toegevoegde alinea.
Geen globale registry-sync of ongerichte linkvermeerdering.

## Overlap en stabiele verwijzingen

De bestaande grondstofles behoudt alle package-/block-IDs, zelfstandige uitleg,
kelderperspectief en membership in het stille-wijnpad. Alleen één gerichte
alinea per taal bij `oogsten-is-kiezen` toegevoegd. Zij verwijst naar de nieuwe
veldbeslissing; de nieuwe oogstles verwijst terug vanuit de glas-koppeling.

Voor deze links ontbrak een bestaande stable-ID-vorm voor narrativetargets.
Het authoringcontract is beperkt uitgebreid met
`[gelokaliseerde naam](narrative.lesson.example)`. Bestaande link-AST gebruikt;
parser valideert ID-syntax, pipeline bestaan en actieve publicatiestatus, renderer
leidt locale-aware canonical route af. Geen hardgecodeerde routes of geleende
pathquery in Markdown. Dit zijn geen entitymentions of automatische backlinks.
Vier regressietests bewaken route-onafhankelijke ID, onbekende ID, ongeldige
syntax en actief-naar-draft. Browserchecks bewaken de daadwerkelijke routes
en context in beide talen, ook zonder JavaScript.

## Beeldreview

Twee bestaande project-PNG's zelfstandig visueel bekeken:

- **Ripeness variables, 1–7:** meten, schil, pitten, aroma, water en
  gezondheid/omstandigheden. Manden zijn geen kwaliteitsladder; beskleur geen
  universele rijpheidskalender; aroma’s symbolisch en apparatuur geen protocol.
- **Practice/audit/outcome, 1–3:** handeling, normcontrole en resultaat met
  terugkoppeling. De pot en liniaal zijn symbolen van onderzoek, geen methode
  of bewijs van bodemgezondheid/koolstofopslag.

## Verificatie

- `npm run content:check`: geldig, **359 entities, 16 narratives, 1 path,
  612 sources, 188 media**. Vijftien actieve lessons en één regionale draft.
- `npm run format` en `npm run check`: formatting, ESLint, contentbuild,
  relationele audit (**295 actieve entities / 1342 forward relations**),
  Next-typegeneratie, TypeScript en **188 unit-tests in 24 bestanden** geslaagd.
- `npm run test:e2e -- --workers=4`: productiebuild (**947 statische pagina's**)
  en **177/177 browsertests geslaagd**. Vineyard-suite nu zestien tests voor
  alle acht lessen. Alle zestien gelokaliseerde pagina's op **320/1440px**:
  PNG/alttekst/markerlegenda, geen horizontale overflow, naslag/backlinks;
  Learn/Verdiepingen/zoeken en keyboardactivatie, no-JS, ongeldige pathcontext
  en zestien permanente aliasredirects. Twee nieuwe anker-/taalwisselchecks en
  twee wederzijdse navigatiechecks; no-JS ook de nieuwe leslinks gevolgd.
- Visuele browsercontrole op **390/1440px**: NL-oogstles en PNG op desktop,
  EN-oogstles en PNG/legenda op mobiel; EN-slotles en PNG/legenda op desktop,
  NL-slotles, PNG/legenda en toepassing op mobiel. Titels, tekstkolommen,
  leerdoelen, legenda en zijbalk passen in de bestaande huisstijl.
- Lokale productiepreview op **3101** met de geteste build herstart en
  nieuwe pagina's zichtbaar gecontroleerd; Learn-overzicht klaargezet.
- Geen corpus-/schemaherziening, schaalclaim of nieuwe mediagroei. De kleine
  narrativelinkuitbreiding vraagt geen herhaling van de schaalbenchmark;
  MNT-064/065 behouden hun triggers. Git diff en actuele planningslinks nagezien.

## Vervolg

`LRN-016` afgerond; **59** niet-afgeronde tickets in de productplanning.
Eerstvolgend **LRN-017**: acht lessen integraal reviewen en tot één route
verbinden, inclusief context, recap, vervolgsuggesties en lokale voortgang.
Extra aandacht voor isolatie van bestaande pilotprogressie en behoud van de
oude path-/step-IDs. Geen nieuw curriculumakkoord of backend nodig; geen nieuwe
blocker of onderhoudsticket. Feedback blijft bewust geparkeerd.
