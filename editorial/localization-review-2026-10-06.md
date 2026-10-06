# NL/EN-presentatie — 2026-10-06

Review-ID: `QCR-2026-10-06-01`.
Uitvoering: `MNT-046`, volgens [het taalcontract](../docs/localization-routing.md).

## Reikwijdte en methode

Gecontroleerd: publieke routing, interface, weergave van bestaande Engelse
content, zoekpassages, metadata, Learn-context, browservoortgang en media.
De canonical wijninhoud en bronnen zijn niet herschreven. Dit is een
presentatie- en integratiereview, geen hernieuwde bronreview van ieder wijnfeit.

De build bevat 353 entities: 286 actief, waarvan 149 zelfstandig en 137
met ingebed profiel. Zeven narratives en één learning path zijn actief.
De pipeline blijft beide verplichte talen en dezelfde block-ID's valideren.

## Implementatie

- Eén `src/app/[lang]`-routeboom bedient NL en EN. NL houdt zijn publieke URLs;
  `/en` selecteert Engels. `/nl` verwijst permanent naar de NL-route.
- Centrale routehelpers sturen contentlinks, breadcrumbs, navigatie, Learn en
  metadata. De rewrite bewaart de oorspronkelijke origin en Next.js-navigatiequery.
- De taalkeuze toont Nederlands/English met toegankelijke links. Clientnavigatie
  behoudt het document, fragmenten, kennisdiepte en tijdelijke voortgang.
- Querycontext wordt beperkt tot geldige search-/discoveryfilters en actief
  lessonlidmaatschap. Dubbele lessoncontext blijft ongeldig. Redirects bewaren
  dubbele querywaarden; taalwisselen zet discovery-/searchpaginering terug.
- Bestaande Engelse content, altteksten en captions komen uit dezelfde
  gevalideerde graph. De nieuwe schermteksten zijn expliciet vertaald; er is
  geen runtimevertaling of Nederlandse passagefallback onder een Engelse URL.
- Beide talen hebben eigen canonicals en wederkerige alternatieven in de ene
  sitemap. Drafts, search, lege Atlas, afrondingen en fouten blijven uitgesloten.
- Query-afhankelijke pagina's gebruiken serverrendering; overige pagina's blijven
  waar mogelijk vooraf gebouwd. De header en lessoncontext blijven zichtbaar
  zonder JavaScript. De server ontvangt geen fragment: de selector neemt dit
  alleen bij een clientwissel mee, zoals het contract voorschrijft.

## Controles en uitkomst

`npm run format`, `npm run check`, productiebuild met `next build --webpack`
en de volledige Playwright-suite zijn geslaagd: **138 unit- en 97 browsertests**.

De nieuwe controles dekken directe bezoeken, reload, clientnavigatie/prefetch,
Terug, publieke NL-URLs en EN-aliases, queryduplicaten, ownerankers, diepe
passages, bronidentiteit, mobiele bediening en toetsenbord, zoekfilters,
lessonlidmaatschap, no-JS, gelokaliseerde 404's, metadata en sitemap. Dezelfde
in-memory voortgang en kennisdiepte blijven bestaan wanneer browseropslag faalt.
Discovery-caches en zoekpassages zijn per taal gecontroleerd.

De Engelse lesson is visueel bekeken op desktop en 375px mobiel. De bestaande
responsive regressiesuite controleert ook langere content en Learn-flows.
De mobiele header is compacter ingedeeld om de bestaande leesruimte te behouden.

## Vervolgcontrole: compacte taal-dropdown

Op verzoek van de producteigenaar is de taalkeuze vervangen door een vlagknop
met native disclosure. Desktop: naast Zoeken en Over Oenocademy op één regel.
Mobiel: naast zoeken en de menuknop. De dropdown gebruikt de bestaande warme
achtergrond, bordeaux accentkleur en typografie. De zelfnamen Nederlands en
English blijven zichtbaar in de geopende lijst; de actieve taal heeft een vinkje.
Vlaggen zijn decoratief en voegen geen regionale taalvarianten toe.

De vervolgcontrole vond een streamingrandgeval in de eerdere selector: een
lege-queryfallback kon bij vroeg klikken of zonder JavaScript de leerpadcontext
verliezen. De query-afhankelijke routes renderen nu expliciet op verzoek en de
selector wacht daar op de werkelijke query. Statische pagina's blijven statisch.
De vervolgtests controleren ook zoeken en discoveryfilters zonder JavaScript.

Definitieve controles: `npm run format`, `npm run check`, productiebuild en
**138 unit- en 117 Playwright-browsertests geslaagd**. De 20 extra UI-tests toetsen:

- Beide talen op 320, 375, 620, 768, 860, 861, 1024, 1280 en 1440px: één
  headerregel, geen overlap/overflow, dropdown binnen het scherm en minimaal
  44px hoge aanraakdoelen (de vlagknop ook minimaal 44px breed).
- Enter, Spatie, Tab, Escape, focusherstel na Escape, buiten klikken en focus
  buiten de lijst; de native toegankelijkheidsboom meldt open/dicht correct.
- Taalkeuze naast het mobiele dialoogmenu, ook met verminderde beweging.
- Bestaande context-, fragment-, voortgang-, storage-, history- en no-JS-regressies.

Aanvullend zijn screenshots van desktop en mobiel in beide talen beoordeeld,
met handmatige browserbediening op desktop, 375px en 320px en controle van de
Engelse header direct boven het mobiele omslagpunt (861px). De geautomatiseerde
suite draait in Chromium; dit is geen volledige afzonderlijke VoiceOver- of
Safari/Firefox-certificering. De vlagemoji volgt het uiterlijk van het platform.

## Ingebakken beeldtekst

Inventaris: **181 mediarecords**, waarvan 178 actief en drie deprecated.
De 175 bestaande rasterbestanden zijn lokaal met OCR onderzocht; de zes SVG's
zijn op zichtbare tekstnodes en hun structuur gecontroleerd. OCR is een hulpmiddel
voor deze inventaris, geen garantie dat ieder klein teken is herkend. De actieve
productieroute- en klonale-selectieplaten zijn aanvullend visueel bekeken.

De actieve gegenereerde rasterillustraties hebben geen aangetroffen
Nederlandstalige uitleg in het beeld. Genummerde routes, pijlen en chemische
symbolen worden door gelokaliseerde HTML uitgelegd. Foto's en historische
etiketten behouden hun oorspronkelijke namen, opschriften en documentaire
betekenis; die worden niet in het beeld vertaald. De oude plaat
`selection-propagation-trials-v2.png` bevat Engelse proceslabels, maar is al
deprecated en vervangen door de actieve genummerde v3.

| Bestaande SVG | Ingebakken tekst | Vervolg |
| --- | --- | --- |
| `appellations/bordeaux/style-spectrum.svg` | Naam, nummers en `COLOUR · STRUCTURE · SWEETNESS` | Taalneutrale rasterplaat in MNT-053 |
| `appellations/bordeaux-superieur/bordeaux-superieur-rules.svg` | Namen en Engelse proces-/categoriebegrippen | Taalneutrale rasterplaat in MNT-053 |
| `appellations/cremant-de-bordeaux/traditional-method.svg` | Engelse processtappen en korte uitleg | Taalneutrale rasterplaat in MNT-053 |
| `appellations/cadillac-cotes-de-bordeaux/label-guide.svg` | Geen zichtbare woorden; labels zijn lijnen | Rasterstijl in MNT-053 |
| `classifications/bordeaux-1855/hierarchy.svg` | Jaartal, cijfers en rangsymbolen | Rasterstijl in MNT-053 |
| `classifications/saint-emilion/hierarchy-2022.svg` | Jaartal, cijfers en rangsymbolen | Rasterstijl in MNT-053 |

De drie oudere Engelstalige diagrammen hebben in beide presentaties de
bijbehorende gelokaliseerde uitleg. Er zijn geen nieuwe media-ID's of
ongevalideerde taalvarianten toegevoegd. De volledige stijlimigratie blijft
uitdrukkelijk bij `MNT-053`.

## Vervolg en releasegrens

`MNT-046` is lokaal afgerond. `MNT-048` is de volgende ontwikkeltaak. De
[productplanning](../docs/product-roadmap.md) bevat alle 22 resterende tickets.
Externe CI/deploymentverificatie blijft bij `MNT-056`; controleer daarbij dat
`NEXT_PUBLIC_SITE_URL` de publieke productie-origin bevat, zodat metadata en
sitemap niet de lokale ontwikkeldefault gebruiken. Er is in deze ronde niet
gecommit, gepusht of gedeployed.
