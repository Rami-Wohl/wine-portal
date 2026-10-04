# Taalkeuze en publieke URLs

Besluit: `MNT-045`, 2026-10-04. Dit is het implementatiecontract voor `MNT-046`;
de applicatie presenteert momenteel nog uitsluitend Nederlands. De gedeelde
kennislaag en publicatievoorwaarden uit [de architectuur](knowledge-architecture.md)
en [het blockcontract](content-blocks.md) blijven leidend.

## 1. Eén identiteit, twee presentaties

- Ondersteunde talen zijn `nl` en `en`. De publieke URL bepaalt de taal, ook bij
  een rechtstreeks bezoek, delen, herladen en browsergeschiedenis.
- Nederlandse URLs blijven ongewijzigd. Engels krijgt uitsluitend `/en` vóór
  dezelfde route. Bestaande routecomponenten, inclusief `verdiepingen`, blijven
  stabiel; labels in navigatie worden wel vertaald.
- Beide talen gebruiken de Engelse canonical slug. IDs, relaties, feiten,
  publicatiestatus, bronnen en voortgang worden niet per taal gekopieerd.
- Er komt geen automatische redirect op basis van `Accept-Language`, cookies of
  browseropslag. Een bezoek aan `/` blijft Nederlands; een bezoek aan `/en`
  blijft Engels. De URL is ook de deelbare taalkeuze.
- Actieve content moet in beide talen publiceerbaar zijn. Ontbrekende vertaling
  is een validatie-/releasefout, geen reden om stil Nederlands onder `/en` te
  tonen. Draft/deprecated content blijft buiten publieke discovery en sitemap.
  Bekende concept-/entity- en narrativedrafts behouden hun voorbereidingspagina
  met `noindex` in de gekozen taal; onbekende routes en ongeldige Learn-paths
  blijven 404. Er komt geen afzonderlijke publicatiestatus per taal.

| Bestemming | Nederlands | Engels |
| --- | --- | --- |
| Home | `/` | `/en` |
| Statische pagina/index | `/about`, `/explore`, `/regions`, `/atlas` | `/en/about`, `/en/explore`, `/en/regions`, `/en/atlas` |
| Entity | `/concepts/<english-slug>` | `/en/concepts/<english-slug>` |
| Narrative-index | `/verdiepingen` | `/en/verdiepingen` |
| Narrative | `/verdiepingen/<type>/<english-slug>` | `/en/verdiepingen/<type>/<english-slug>` |
| Learn-path en afronding | `/learn/<english-slug>[/complete]` | `/en/learn/<english-slug>[/complete]` |
| Zoeken | `/search?q=...` | `/en/search?q=...` |

Dit geldt voor alle bestaande entity- en narrativetypen en de Learn-index.
Media, fonts, frameworkassets, `/robots.txt`, `/sitemap.xml` en eventuele
toekomstige `/api`-routes krijgen geen taalprefix.

## 2. Links, redirects en taalwisselaar

- Eén centrale routehelper vertaalt route-identiteit plus locale naar een
  publieke bestemming. Rendererlinks, breadcrumbs, cards, backlinks, navigatie,
  zoekresultaten en Learn-links gebruiken die helper; alleen een vertaald label
  op een Nederlandse href is onvoldoende. De home-/merklink behoudt de taal.
- Een afwijkende Nederlandse slug blijft een permanente 308-alias naar de
  Engelse slug, binnen de aangevraagde taal. `/nl` en `/nl/...` worden 308-aliases
  naar de bestaande Nederlandse routes, geen derde publieke presentatie.
  Niet-ondersteunde taalprefixen zoals `/fr/...` geven 404. Redirects behouden
  querywaarden, inclusief dubbele waarden, zodat validatie ze niet ongemerkt
  als geldige context behandelt. Voorkom redirectlussen en onnodige ketens.
- Producenten met een ingebed profiel blijven doorverwijzen naar hun owner
  in de gekozen taal met dezelfde gedeelde `presentation.anchor`. Ze krijgen
  geen tweede zelfstandige pagina. Het owneranker heeft bij deze redirect
  voorrang op een fragment van de oude producentenroute.
- De selector toont echte links met zelfnamen **Nederlands** en **English**,
  `lang`/`hreflang`, een herkenbare actieve taal en toegankelijke naam/focus.
  Gebruik geen vlaggen. Volg de bestaande responsive en aanraakdoelrichtlijnen.
  Een wissel opent hetzelfde object of dezelfde index en werkt met Terug/Vooruit.
- Block-ID's blijven exact gelijk, ook als een ID Nederlands leest. Met
  JavaScript bewaart de wissel het actuele fragment en opent zo nodig de
  betreffende kennisdiepte. Bronankers `source-N` blijven gelijk door dezelfde
  gedeelde bronnenvolgorde; filter of hernummer bronnen niet per vertaling.
- Zonder JavaScript blijft de selector een bruikbare link naar dezelfde pagina
  met geldige querycontext. Een server ontvangt het actuele URL-fragment niet:
  het meenemen van dat fragment door de selector is daarom een JS-verrijking.
  Rechtstreekse links mét fragment blijven zonder JS werken; de inhoud is dan
  volledig toegankelijk volgens het bestaande kennisdieptecontract.

## 3. Zoeken, filters en Learn

- Zoeken gebruikt de gekozen taal voor titels, passage-selectie, snippets,
  sortering en UI. Namen/aliases uit de andere taal mogen vindbaarheid helpen,
  maar er verschijnen geen snippets uit die andere taal als stille fallback.
- Taalwisselen bewaart `q` en een geldig `type` op search, en `q`, een geldig
  `context` en `initial` op discovery. Vertaal de zoekopdracht niet automatisch.
  Context verwijst naar een stabiele canonical slug; labels en alfabetische
  filtering volgen de nieuwe taal. Zet `page` terug naar de eerste pagina omdat
  resultaatvolgorde en aantallen kunnen wijzigen. Gewone paginalinks behouden
  de taal en de eigen filters. Neem onbekende queryparameters niet in UI-links over.
- Een lessonwissel behoudt uitsluitend geldige `?path=<english-path-slug>`-
  context. De bestaande controle op actief path en core-step-lidmaatschap blijft
  gelden; ontbrekende, dubbele of ongeldige context toont de standalone lesson.
  Pathcontext maakt geen tweede canonical lesson. Zie [Learn](learning-paths.md#8-routingcontract).
- De bestaande storage keys en stable path-/step-ID's blijven ongewijzigd.
  Taalwisselen behoudt voortgang én kennisdiepte, zonder dubbele records of
  migratie. Test ook tijdelijke voortgang wanneer browseropslag is geblokkeerd:
  navigatie binnen de app mag die in-memory toestand niet wissen.

## 4. Metadata en media

- `<html lang>` wordt `nl` of `en`; titels, beschrijvingen, foutpagina's en
  social metadata volgen dezelfde taal. Open Graph gebruikt `nl_NL`/`en_US`
  als metadatawaarden; dit introduceert geen regionale contentvariant.
- Elke indexeerbare pagina heeft een canonical naar haar eigen taalversie en
  wederkerige `hreflang`-links voor `nl`, `en` en `x-default` (de NL-versie).
  Canonicals en taalalternatieven bevatten geen fragments, filters of pathcontext;
  index-/zoekvarianten verwijzen naar de basisroute in dezelfde taal.
- Eén sitemap bevat beide versies van actieve zelfstandige entities, narratives,
  paths en indexeerbare statische pagina's, met wederkerige taalalternatieven.
  Redirectaliases en ingebedde producenten worden geen eigen sitemapvermelding.
  Search, de huidige lege Atlas, Learn-afronding, drafts en foutpagina's blijven
  `noindex` en buiten de sitemap; genereer daarvoor geen SEO-taalalternatieven.
  De gewone taalwisselaar blijft waar mogelijk beschikbaar.
- Gebruik de ingestelde publieke origin voor absolute metadata-/sitemap-URLs;
  controleer vóór release dat productie geen localhost-origin gebruikt.
  `/robots.txt` verwijst naar de ene sitemap.
- Alttekst, captions, bronlabels en figuurtoelichting volgen de gekozen taal.
  Oorspronkelijke brontitels en eigennamen hoeven geen verzonnen vertaling.
  Mediametadata heeft nu één opslagkey/checksum per gedeeld media-ID, geen
  taalafhankelijke beeldvarianten. Inventariseer daarom ingebakken beeldtekst.
  Geef waar nodig voorrang aan een taalneutrale PNG met gelokaliseerde HTML-uitleg.
  Een noodzakelijke assetvariant vereist eerst een expliciete schema-aanpassing
  en validatie; verschillende NL/EN-media-ID's doorbreken het blockcontract.
  De volledige stijlvervanging van bestaande SVG's blijft bij `MNT-053`.

## 5. Implementatiegrens en acceptatie

De geïnstalleerde Next.js 16.3.8-documentatie is getoetst: App Router ondersteunt
een gedeelde `[lang]`-boom, async routeparams, Proxy en serverdictionaries;
Metadata en sitemap ondersteunen `alternates.languages`. De beschreven
headeronderhandeling uit de frameworkgids is bewust geen productkeuze hier.
Referentie in `node_modules/next/dist/docs/01-app/`: `02-guides/internationalization.md`,
`03-api-reference/03-file-conventions/proxy.md`, `03-api-reference/04-functions/generate-metadata.md`
en `03-api-reference/03-file-conventions/01-metadata/sitemap.md`.

Begin `MNT-046` met een kleine integratieproef: één gedeelde locale-routeboom,
een interne NL-rewrite voor ongewijzigde publieke URLs en een centrale routehelper.
Bewijs direct dat externe `/nl`-aliases, interne rewrites, clientnavigatie,
prefetch en HTML-taal samenwerken zonder lus, interne URL-lek of verlies van
clientstate. Deze technische inrichting is nog niet geïmplementeerd of getest;
pas haar zo nodig aan met behoud van het publieke contract. Dupliceer geen
paginabomen of kennisbundle per taal, en stuur servercontent niet integraal naar
de browser om labels te vertalen. Houd asset-/API-routes buiten de rewrite.

Daarna volgen UI-/contentpresentatie en metadata, gevolgd door onderstaande
acceptatiecontrole. Deze matrix beschrijft **nog te bouwen tests**, geen geslaagde
browsercontrole van een bestaande taalwisselaar.

| Controle | Vereist resultaat in MNT-046 |
| --- | --- |
| Direct bezoek, reload, clientlink en Terug/Vooruit | URL, HTML-taal, content, navigatie en metadata blijven in dezelfde taal; ook na afwisselend NL/EN-verkeer geen cachevermenging |
| Bestaande NL-route, NL-slugalias, `/nl`, EN-alias en onbekende locale | Bestaande URL werkt; juiste permanente redirect zonder lus; onbekende taal 404 |
| Entity, narrative, index, embedded producer en Learn-afronding | Selector bereikt de equivalente bestemming; producer behoudt owneranker; afronding blijft noindex |
| Passage in verdiepende kennis en bronanker | Zelfde block/bron na wissel; kennisdiepte onthult de passage; zonder JS blijft inhoud bereikbaar |
| Zoekterm, context-/letterfilter en pagina 2 | Tekst/filters behouden, resultaten in gekozen taal, taalwissel terug naar pagina 1 |
| Lesson met geldige, dubbele of ongeldige pathquery | Geldige context blijft; overige gevallen standalone; canonical nooit met pathquery |
| Learn-markering en kennisdiepte vóór taalwissel | Dezelfde voortgang en diepte; ook bij geblokkeerde storage geen verlies door clientnavigatie |
| Publicatie en SEO | Ontbrekende verplichte vertaling blokkeert release; self-canonical en wederkerige alternatieven voor indexeerbare pagina's; uitsluitingen ontbreken in sitemap |
| Mobiel, desktop, toetsenbord en JS uit | Bedienbare selector, leesbare vertaling/beelden, geen overflow of ontoegankelijke inhoud; fragmentbeperking zonder JS zoals hierboven |

De inventaris op 2026-10-04 vond 146 actieve zelfstandige entities, 137 actieve
ingebedde producenten, zeven actieve narratives en één actief learning path.
Alle actieve zelfstandige entities en narratives hebben Engelse blocks; hun
NL/EN-block-ID's komen overeen. Dit bewijst technische beschikbaarheid, geen
volledige redactionele of visuele review van de Engelse productpresentatie.
