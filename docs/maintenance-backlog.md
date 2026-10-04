# Algemene onderhoudsbacklog

Dit is de centrale, levende lijst van kwaliteits- en onderhoudsacties voor
Oenocademy. Gedateerde rapporten bewaren de oorspronkelijke controles en
bevindingen; dit document bewaart de actuele status, uitvoering en resterende
werkvoorraad. De werkwijze en het reviewregister staan in
[`quality-assurance.md`](quality-assurance.md).

## Gebruik

- Voeg concrete vervolgacties uit iedere kwaliteitscheck hier toe met een
  permanent `MNT-NNN`-ID.
- Werk status en log hier bij; herschrijf het oorspronkelijke reviewrapport niet
  om voortgang weer te geven.
- Splits werk wanneer onderdelen onafhankelijk kunnen worden afgerond.
- Verwijder afgeronde of vervallen acties niet, maar verplaats ze naar
  **Historie**.
- Regulier contentauthoringwerk hoort in de entityplanning. Neem het hier alleen
  op wanneer een kwaliteitscheck een concrete reparatie of platformbrede
  verbetering verlangt.

## Actuele stand

Peildatum: 2026-10-04.

| Status | Aantal | Acties |
| --- | ---: | --- |
| Open | 6 | `MNT-046`, `MNT-048`, `MNT-049`, `MNT-051` t/m `MNT-053` |
| Gepland | 1 | `MNT-050` |
| Bezig | 0 | — |
| Geblokkeerd | 7 | `MNT-002`, `MNT-013`, `MNT-014`, `MNT-020`, `MNT-039`, `MNT-055`, `MNT-056` |
| Afgerond | 42 | `MNT-001`, `MNT-003` t/m `MNT-012`, `MNT-015` t/m `MNT-019`, `MNT-021` t/m `MNT-038`, `MNT-040` t/m `MNT-045`, `MNT-047`, `MNT-054` |
| Vervallen | 0 | — |

De [productplanning](product-roadmap.md) geeft de volgorde van alle resterende
taken. Het taalcontract (`MNT-045`) is vastgelegd; het eerstvolgende uitvoerbare
werk is gist en alcoholische vergisting (`EXP-018`), na de afgeronde
ontvangst- en mostvoorbereidingshub (`EXP-017`).
Runtime en lokale CI-implementatie zijn afgerond; externe activatie (`MNT-056`)
en de ongepatchte ontwikkeltoolketen (`MNT-055`) blijven zichtbaar geblokkeerd.
De vijf oudere blokkades zijn behouden zonder nieuwe externe contentreview.

## Open werk

### `MNT-055` — Kwetsbare ontwikkeldependencies gericht herstellen

- **Status:** geblokkeerd
- **Prioriteit:** hoog
- **Scope:** lint-/ontwikkelketen: `brace-expansion`, `braces`, `micromatch`,
  `fast-glob` en de bovenliggende Next ESLint-packages
- **Categorie:** engineering, testing, operations
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** na de Next.js-patch meldt de volledige npm-audit zes high
  dependencyvermeldingen, deels door dezelfde transitieve oorzaak. De
  productieaudit is schoon. Advisories betreffen onder meer stack exhaustion en
  dure expansie bij kwaadaardige bracepatronen; dit zijn ontwikkeltools, geen
  aangetoonde publieke applicatieroute.
- **Klaar wanneer:** de dependencyketens en bereikbaarheid zijn getrieerd,
  compatibele patches zijn toegepast en lint, tests en build blijven slagen.
  Waar een upstreamfix ontbreekt, documenteer de begrensde blootstelling en een
  concrete hercontrole; verlaag niet blind `eslint-config-next` naar versie 14
  en gebruik geen ongecontroleerde `npm audit fix --force`.
- **Blokkade:** voor `braces <=3.0.3` (`GHSA-vfj7-8cjw-p6xm`) bestaat op
  2026-10-04 geen gepubliceerde upstreampatch. De vijf resterende high meldingen
  komen uit dezelfde ontwikkelketen; productieaudit blijft schoon. De Next-rule
  gebruikt fast-glob voor een expliciete `settings.next.rootDir`; de huidige
  ESLint-config stelt die niet in. CI heeft geen secrets, schrijfrechten of
  bewaarde credentials en heeft een timeout.
- **Hercontrole:** uiterlijk 2026-10-18 en bij wijziging van lintconfig of
  dependencies: controleer de advisory en npm-release, pas een compatibele fix
  toe en herhaal de volledige audit plus lint/build/tests. Dit is een handmatig
  controlepunt, geen ingestelde automation. Neem daarbij de ESLint 10-migratie
  mee zodra de React-plugin die major ondersteunt; versie 9 wordt inmiddels
  door npm als unsupported gemeld.
- **Log:** 2026-10-04 — volledige audit na `MNT-054` getrieerd; apart gehouden van
  de geslaagde productiepatch. Adviesdetails staan in het reviewrapport.

- **Uitvoering 2026-10-04:** `brace-expansion` 1.1.18 → 1.1.21 en 5.0.9 →
  5.0.12 binnen bestaande semverranges bijgewerkt, zonder overrides. De
  volledige audit daalt van zes naar vijf dependencyvermeldingen. De
  incompatibele downgrade en een ongeteste major-upgrade zijn niet toegepast.

### `MNT-046` — Volledige NL/EN-presentatie en taalwisselaar bouwen

- **Status:** open
- **Prioriteit:** hoog
- **Scope:** publieke NL/EN-interface en contentpresentatie
- **Categorie:** product-ux, accessibility, engineering, testing
- **Herkomst:** `QCR-2026-10-04-01`
- **Afhankelijkheid:** `MNT-045` (afgerond); volg het
  [taal- en routingcontract](localization-routing.md).
- **Klaar wanneer:** een toegankelijke taalwisselaar de equivalente entity,
  narrative of Learnpagina opent; interface, captions, alttekst, zoekresultaten,
  foutmeldingen en metadata de gekozen taal volgen. Anchors, query/pathcontext,
  browsergeschiedenis, redirects en gedeelde voortgang op stable IDs blijven
  correct. Beide talen zijn op mobiel/desktop en zonder JavaScript getest.
- **Uitvoeringsvolgorde:** bewijs eerst de gedeelde locale-routeboom, publieke
  NL-rewrite en routehelpers met clientnavigatie en metadata. Lokaliseer daarna
  alle UI-/contentlinks, zoeken en Learn; controleer ook ingebakken beeldtekst.
  Rond af met de contractmatrix in beide talen, inclusief no-JS, embedded
  producenten en tijdelijke voortgang bij geblokkeerde storage. Het contract
  specificeert de fragmentbeperking van een taalwissel zonder JavaScript.
- **Planning:** aanbevolen vóór `EXP-020`, zodat Engelse presentatie vóór de
  laatste grote contentfase echt gebruikt en gereviewd wordt; vertalingen zijn
  expliciet gereviewd, geen runtime-machinevertaling.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-048` — Contentpipeline en model in herkenbare modules verdelen

- **Status:** open
- **Prioriteit:** middel
- **Scope:** `scripts/content/pipeline.ts`, `src/content/model.ts` en importgrenzen
- **Categorie:** engineering, testing, knowledge-data
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** `pipeline.ts` telt 1.339 regels en combineert discovery,
  validatie, contentplannen, graphopbouw en searchindexing; `model.ts` telt 912
  regels met schema's, constants en runtimevormen. Dit bemoeilijkt lokale review.
- **Klaar wanneer:** planvalidatie en searchindexing eigen modules hebben en de
  pipeline als leesbare orchestration fungeert; modellen langs bestaande
  verantwoordelijkheden zijn gegroepeerd zonder importcycli. Bestaande exports,
  foutmeldingen, deterministische output en inhoud blijven gelijk. Vergelijk
  bundles vóór/na en behoud de huidige fixturetests. Borg dat de repository en
  generated bundle niet vanuit clientmodules geïmporteerd kunnen worden.
- **Planning:** incrementeel vóór volgende schema-/GIS-uitbreiding; geen volledige
  herschrijving of nieuwe abstractielaag zonder concrete use-case.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-049` — Stylesheet langs bestaande UI-grenzen organiseren

- **Status:** open
- **Prioriteit:** middel
- **Scope:** `src/app/globals.css` en componentstijlen
- **Categorie:** engineering, product-ux, testing
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** `globals.css` telt 2.853 regels; tokens, globale basis en
  componentpatronen staan in één bestand.
- **Klaar wanneer:** tokens en basis globaal herkenbaar blijven, componentstijlen
  logisch te vinden zijn en cascade/importvolgorde expliciet behouden blijven;
  desktop, mobiel, kennisdiepte, print en Learn geen visuele regressie tonen.
  Kies gewone stylesheets of CSS Modules passend bij de bestaande stack;
  introduceer geen nieuw stylingframework om alleen bestanden te splitsen.
- **Planning:** bij de eerstvolgende bredere UI-uitbreiding; geen verplichte
  voorwaarde voor een kleine contentwijziging.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-050` — Beslismoment voor backend, API en database

- **Status:** gepland
- **Prioriteit:** middel
- **Scope:** gebruikersdata, redactionele samenwerking en toekomstige API-consumers
- **Categorie:** engineering, operations, product-ux
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** de Next.js-server en contentrepository bestaan; een aparte
  account-/voortgangsbackend bestaat nog niet. Lokale voortgang heeft een
  repositoryinterface, maar netwerkfouten, authenticatie en conflicten zijn nog
  geen uitgewerkt contract.
- **Klaar wanneer:** een besluit de concrete use-cases en invoertriggers benoemt:
  accounts/cross-device voortgang, redactionele samenwerking, externe consumers
  of bewezen query-/GIS-behoefte. Vergelijk file-backed content plus een aparte
  gebruikersdatabase met verdere migratie. Leg zo nodig autorisatie, retries,
  offlinegedrag, conflicten, export/verwijdering, backups en migratie vast.
  Ook bewust uitstel krijgt een volgende toetsbare trigger.
- **Planning:** samen met `LRN-012` (vroegst 2026-10-22 bij genoeg gebruik), of
  eerder zodra een genoemde use-case wordt ingepland. Dit ticket bewaakt het
  platformbesluit; `LRN-012` blijft eigenaar van de pilotevaluatie. Geen tweede
  handmatig onderhouden feitenbron en geen verplichte REST-laag zonder consumer.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-051` — Eerste verifieerbare Atlasdataset en kleine pilot afbakenen

- **Status:** open
- **Prioriteit:** middel
- **Scope:** geverifieerde geography-data en eerste Atlaslevering
- **Categorie:** atlas-gis, research, engineering
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** Atlas heeft nog geen data; drie oudere kaarttickets blijven
  daardoor geblokkeerd zonder een concrete eerste datalevering.
- **Klaar wanneer:** een beperkte dataset voor Bordeaux is gekozen op officiële
  provenance, licentie, schaal, CRS, versie en updatepad; een import- en
  validatiecontract plus eerste publiek bruikbare kaart zijn afgebakend. Leg vast
  welke oude kaarttickets hierdoor wel/niet kunnen volgen. Punten, appellation-
  geometrie en wereldwijde druivenverspreiding zijn afzonderlijke dataproblemen.
- **Planning:** bronverkenning vóór `EXP-027`; bouw pas op geverifieerde data.
  PostGIS is een mogelijke latere keuze, geen vereiste voor de eerste pilot.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-052` — Meetbare performance- en mediabudgetten vastleggen

- **Status:** open
- **Prioriteit:** middel
- **Scope:** search, builds, runtimebundles en media
- **Categorie:** engineering, operations, media
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** lokale media nemen circa 311 MiB in, de gegenereerde JSON circa
  16 MiB; dit zijn schijfvolumes, geen gemeten browserdownloads. De zoekcode
  normaliseert passages tijdens iedere zoekactie.
- **Klaar wanneer:** buildduur, route-/clientbundles, beeldbytes en zoeklatentie
  met een reproduceerbare workload zijn gemeten en passende budgetten gekozen.
  Optimaliseer alleen aangetoonde knelpunten. Een eventuele CDN-stap omvat
  synchronisatie, checksums, cachebeleid en rollback; `MEDIA_BASE_URL` alleen
  uploadt niets. Bewaar bronmetadata en canonical media-ID's.
- **Planning:** vóór de volgende grootschalige regio-uitbreiding en bij Atlas-
  datasetkeuze; grote bronbestanden alleen rechtvaardigen geen databasemigratie.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-053` — Bestaande SVG-diagrammen naar de gewenste rasterstijl migreren

- **Status:** open
- **Prioriteit:** laag; apart te plannen beeldronde
- **Scope:** redactionele SVG-diagrammen met een geregistreerd media-ID
- **Categorie:** media, content, accessibility
- **Herkomst:** gebruikersvoorkeur uit de wijngaardsystemenronde; bevestigd als
  toekomstig werk in `QCR-2026-10-04-01`
- **Klaar wanneer:** de nog gebruikte redactionele SVG's geïnventariseerd en per
  leerdoel vervangen zijn door gecontroleerde rasterillustraties, met behoud
  van betekenis, bronnen, stabiele media-ID's en gelijkwaardige NL/EN-uitleg.
  UI-iconen en geverifieerde GIS-weergave zijn geen automatisch onderdeel van
  deze illustratiemigratie. Controleer leesbaarheid op mobiel en assetomvang.
- **Planning:** afzonderlijke illustratieronde; in deze onderhoudsreview zijn
  geen bestaande beelden opnieuw gegenereerd.
- **Log:** 2026-10-04 — geregistreerd vanuit de platformreview; uitvoering
  volgt de overkoepelende productplanning.

### `MNT-056` — CI extern activeren en deploymentruntime bevestigen

- **Status:** geblokkeerd
- **Prioriteit:** hoog; afronden zodra de commit is gepusht en toegang werkt
- **Scope:** GitHub Actions, repositoryrechten/branch protection en Vercel
- **Categorie:** operations, testing
- **Herkomst:** afgesplitst van de externe acceptatiestappen van `MNT-047`
- **Bevinding:** de lokale implementatie is gereed, maar SSH-authenticatie faalt
  en de beschikbare browser is niet ingelogd op GitHub of Vercel. Een workflow
  in een lokale commit bewijst nog geen geslaagde Ubuntu-run of mergebescherming.
- **Klaar wanneer:** de gepushte commit een geslaagde **Quality checks**-run op
  GitHub heeft; repositoryrechten en Actions-instellingen zijn gecontroleerd;
  de passende branch protection/required check is expliciet beoordeeld; en de
  eerstvolgende toegestane Vercel-deployment Node 24 in zijn buildlog toont en
  de Learn-live-smoke doorstaat. Vercel kiest de patch binnen `24.x` zelf.
- **Blokkade:** geauthenticeerde toegang en een gepushte commit/deployment zijn
  vereist. Geen credentials aangemaakt en geen deployment of permissiewijziging
  uitgevoerd tijdens lokaal ontwikkelwerk.
- **Log:** 2026-10-04 — SSH en browsertoegang read-only geprobeerd; externe
  controle blijft open. Volg de runbookstappen in README en het runtime-reviewrapport.

### `MNT-002` — Geverifieerde Atlas-kaart voor Bordeaux

- **Status:** geblokkeerd
- **Prioriteit:** afhankelijk
- **Categorie:** atlas-gis, media
- **Scope:** `region.bordeaux`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de overzichtspagina mist de belangrijkste geografische
  oriëntatie, maar grenzen mogen niet worden geïmproviseerd.
- **Klaar wanneer:** Bordeaux een kaart heeft uit de geverifieerde Atlaslaag met
  vastgelegde databron, schaalbetekenis, toegankelijke legenda en gecontroleerd
  responsive gedrag.
- **Blokkade:** de geverifieerde geography- en Atlas-datalaag is nog niet
  beschikbaar.
- **Log:** 2026-09-08 — geregistreerd; bewust niet opgelost met handgetekende of
  generatief verzonnen grenzen.

### `MNT-013` — Wereldwijde druivenverspreiding via Atlas

- **Status:** geblokkeerd
- **Prioriteit:** afhankelijk
- **Categorie:** atlas-gis, media
- **Scope:** actieve druivenentities
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** foto's tonen het ras, maar niet de wereldwijde geografische
  spreiding en relatieve zwaartepunten.
- **Klaar wanneer:** relevante druivenpagina's geverifieerde, vergelijkbare
  verspreidingskaarten uit de Atlaslaag tonen met bronjaar, scope en heldere
  legenda.
- **Blokkade:** er is nog geen geverifieerde dataset en kaartconventie voor deze
  wereldwijde laag.
- **Log:** 2026-09-08 — geregistreerd als latere Atlascapability.

### `MNT-014` — Grenzen van Barsac en Sauternes via Atlas

- **Status:** geblokkeerd
- **Prioriteit:** afhankelijk
- **Categorie:** atlas-gis, media
- **Scope:** `appellation.barsac`, `appellation.sauternes`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de verhouding tussen gemeenten, appellationzones en toegestane
  productie is belangrijk maar mag niet uit een onbetrouwbare schets worden
  afgeleid.
- **Klaar wanneer:** beide pagina's officiële, geverifieerde geometrie tonen en
  visueel ondubbelzinnig maken welk type grens of productiezone zichtbaar is.
- **Blokkade:** officiële geometrie, schaalbetekenis en Atlasweergave zijn nog
  niet als betrouwbare keten beschikbaar.
- **Log:** 2026-09-08 — geregistreerd; uitvoering wacht op Atlas.

### `MNT-020` — Ideale beeldparen voor Ausone, Angélus en Canon

- **Status:** geblokkeerd
- **Prioriteit:** afhankelijk
- **Categorie:** media, content
- **Scope:** `producer.chateau-ausone`, `producer.chateau-angelus`,
  `producer.chateau-canon`
- **Herkomst:** contentauthoring 2026-09-08
- **Bevinding:** alle drie actieve pagina's hebben rechtenveilig documentair
  beeld, maar de gewenste combinatie van een herkenbaar châteaubeeld én een
  Grand Vin-fles is nog niet compleet. Ausone en Canon missen een geschikte
  open-gelicentieerde flesfoto; Angélus mist een geschikte open-gelicentieerde
  opname van het château.
- **Klaar wanneer:** iedere pagina het ontbrekende complementaire beeld lokaal
  of via de beheerde mediaketen toont, met volledige rechtenmetadata,
  gelokaliseerde alttekst en een caption met een andere didactische functie dan
  het bestaande beeld.
- **Blokkade:** op 22 september 2026 is voor geen van de drie ontbrekende
  beelden een kandidaat gevonden die tegelijk het juiste onderwerp toont én
  een controleerbare oorspronkelijke maker en hergebruiklicentie heeft. De
  producentengalerij van Angélus reserveert alle reproductierechten; commerciële
  flesfoto's van Ausone en Canon hebben evenmin een open licentie. Een
  aggregatorsclaim zonder oorspronkelijke maker of bron geldt niet als
  voldoende rechtenbewijs.
- **Log:** 2026-09-08 — geregistreerd nadat Wikimedia wel bruikbare historische
  en wijngaardbeelden opleverde, maar niet alle drie gewenste beeldparen.
  2026-09-22 — Wikimedia Commons, Mapillary, producentenpersmateriaal en
  vindbare commerciële beelden opnieuw gecontroleerd; uitkomst en
  acceptatiecriteria vastgelegd in
  [`iconic-producer-media-review-2026-09-22.md`](../editorial/iconic-producer-media-review-2026-09-22.md).
  Vrijgave vereist eigen fotografie, expliciete schriftelijke toestemming van
  de rechthebbende of een nieuwe open-licensepublicatie met volledige
  provenance.

### `MNT-039` — Definitief EU-besluit Graves Supérieures verwerken

- **Status:** geblokkeerd
- **Prioriteit:** afhankelijk
- **Categorie:** content, research, regelgeving
- **Scope:** `appellation.graves-superieures`, `appellation.graves`
- **Herkomst:** afgesplitst van `MNT-025` in `QCR-2026-09-22-04`
- **Bevinding:** Frankrijk heeft de samenvoeging voorbereid en de EU heeft het
  annuleringsverzoek gepubliceerd, maar eAmbrosia toont Graves Supérieures op
  22 september 2026 nog als geregistreerd, met een lopende wijzigingsprocedure
  en zonder verwijderingsmarkering.
- **Klaar wanneer:** een definitief officieel EU-besluit is gepubliceerd en de
  assertions, samenvattingen, juridische uitleg, relaties, etiketcontext en
  controledatums in beide talen claimgewijs zijn bijgewerkt.
- **Blokkade:** het definitieve EU-besluit is nog niet gepubliceerd; het
  verstrijken van de oppositietermijn bewijst op zichzelf geen annulering.
- **Log:** 2026-09-22 — externe afhankelijkheid expliciet afgesplitst zodat de
  uitgevoerde periodieke hercontrole traceerbaar kan worden afgesloten.

## Historie

### `MNT-045` — Contract voor taalkeuze, URLs en publicatie vastleggen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Scope:** taalkeuze, publieke routes, SEO en navigatie
- **Categorie:** product-ux, knowledge-data, engineering
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** NL/EN-content bestaat, maar routes, interface, metadata en
  navigatie presenteren Nederlands. Tweetalige authoring is nog geen tweetalig
  product.
- **Klaar wanneer:** een kort besluit locale-URLs, taalkeuze, legacyredirects,
  canonical/hreflang/sitemap, zoeken, anchors en pathcontext vastlegt. Aanbevolen
  uitgangspunt ter toetsing: behoud bestaande NL-URLs, voeg `/en` toe en behoud
  stabiele Engelse entityslugs; geen stille contentfallback. Toets dit aan de
  geïnstalleerde Next.js-documentatie voordat het routecontract verandert.
- **Planning:** direct na `MNT-047`, vóór verdere route-uitbreidingen; de huidige
  publieke URLs veranderen pas in `MNT-046` na compatibiliteitscontrole.
- **Log:** 2026-10-04 — route-, zoek-, renderer-, metadata- en Learn-contracten
  geïnventariseerd en aan de geïnstalleerde Next.js 16.3.8-documentatie getoetst.
  [Het taalcontract](localization-routing.md) legt NL zonder prefix, EN onder
  `/en`, aliasgedrag, taalwisselen, anchors, querycontext, gedeelde voortgang, SEO
  en publicatie vast. De acceptatiematrix en implementatievolgorde horen bij
  `MNT-046`; deze beslissing wijzigt nog geen runtimegedrag.
- **Validatie:** `npm run format` en `npm run check` geslaagd op Node 24.21.0
  (133 tests, typecheck, lint en relationele audit); lokale documentatielinks
  gecontroleerd. Geen nieuwe E2E-run: alleen documentatie is gewijzigd; de
  taalwisselaar wordt met de contractmatrix in `MNT-046` getest.

### `MNT-047` — Ondersteunde Node-versie en automatische kwaliteitscontrole

- **Status:** afgerond
- **Prioriteit:** hoog
- **Scope:** packagecontract, ontwikkelruntime en CI; externe activatie volgt in `MNT-056`
- **Categorie:** engineering, testing, operations
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** de lokale runtime is Node 20.19.6 (end-of-life); de repo heeft
  geen runtimepin, `engines`-contract of GitHub Actions-workflow. De daadwerkelijk
  ingestelde productieruntime is in deze review niet vastgesteld.
- **Uitvoering:** migreer en test op Node 24 LTS, leg runtime en onboarding vast,
  controleer de deploymentinstelling en voeg een CI-workflow voor pushes/PR's toe.
- **Klaar wanneer:** `npm ci`, `npm run check` en de volledige browsersuite op de
  vastgelegde runtime slagen; CI Chromium installeert en faalt op testfouten en
  ongewenste wijzigingen aan gevolgde gegenereerde bestanden; repositoryrechten
  en eventuele branch protection apart zijn gecontroleerd. Voer geen algemene
  dependency-upgrade uit als bijvangst.
- **Planning:** vóór de volgende release; geen globale Node-installatie vervangen
  als onderdeel van alleen documentatieonderhoud.
- **Log:** 2026-10-04 — Node 24.21.0 en npm 11.19.0 lokaal geïnstalleerd en
  getest, `.nvmrc`, engines, strikte enginecontrole, Node 24-typen en vastgepinde
  Quality-workflow toegevoegd. Schone installatie, vaste checks, productiebuild
  en browsersuite gecontroleerd. De oorspronkelijke externe acceptatiestappen
  (eerste GitHub-run, rechten/branch protection en deploymentverificatie) zijn
  expliciet afgesplitst naar `MNT-056`; dit ticket sluit het lokale werk af.


### `MNT-054` — Next.js-securitypatch gericht toepassen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** engineering, testing, operations
- **Scope:** `next`, `eslint-config-next` en lockbestand
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** npm audit meldde één kritieke advisory voor Next.js 16.3.3:
  `GHSA-vcvr-r3jv-pc5j`. In deze app is geen gebruik van `next/og` of
  `ImageResponse` gevonden; de specifieke aanvalvoorwaarde is daarmee niet
  aangetoond. De dependencyversie valt wel binnen het getroffen bereik.
- **Uitvoering:** Next.js en de bijbehorende ESLint-config gericht vastgepind op
  16.3.8; lockbestand bijgewerkt. Deze patch bevat ook de aanvullende fixes uit
  de [officiële releasenotes](https://github.com/vercel/next.js/releases/tag/v16.3.8).
- **Klaar wanneer:** dependencycontrole, vaste kwaliteitschecks, productiebuild
  en browsersuite op de gepatchte versie slagen.
- **Log:** 2026-10-04 — lokaal bijgewerkt en gecontroleerd; dit ticket omvat geen
  productiedeployment. Resultaten en beperkingen staan in het reviewrapport.


### `MNT-043` — Documentatie en overkoepelende planning opschonen

- **Status:** afgerond
- **Prioriteit:** middel
- **Scope:** documentatie-ingangen, placeholders en productplanning
- **Categorie:** engineering, operations
- **Herkomst:** `QCR-2026-10-04-01`
- **Uitvoering:** zes achterhaalde placeholder-README's/guides verwijderd,
  relevante mediabetekenis geconsolideerd, hoofd-README ingekort en verouderde
  Learn-/architectuurbeschrijvingen hersteld. Alle canonical contentbestanden,
  policycontracten, researchbriefs en historische audits zijn behouden.
  Productplanning verbindt de bestaande backlogs zonder tickets te dupliceren.
- **Log:** 2026-10-04 — uitgevoerd en gedocumenteerd in de sanity review.

### `MNT-044` — Tijdelijke browserstaat voorrang geven na mislukte opslag

- **Status:** afgerond
- **Prioriteit:** hoog
- **Scope:** lokale Learn-voortgang en kennisdieptekeuze
- **Categorie:** engineering, product-ux, testing
- **Herkomst:** `QCR-2026-10-04-01`
- **Bevinding:** een mislukte schrijfactie gevolgd door een succesvolle read
  herstelde oude voortgang of kennisdiepte. Een mislukte reset kon oude
  lesmarkeringen direct terugbrengen.
- **Uitvoering:** niet-opgeslagen wijzigingen blijven tijdens het bezoek
  leidend, inclusief lege voortgang na reset. Een succesvolle nieuwe schrijfactie
  herstelt persistent gedrag. De melding verduidelijkt dat oudere opgeslagen
  voortgang bij een nieuw bezoek kan terugkomen. Drie unitregressies en drie
  browserregressies dekken gedeeltelijk falende opslag.
- **Log:** 2026-10-04 — gereproduceerd en hersteld; validatie staat in het rapport.


### `MNT-030` — Markdown-linkaudit triageerbaar maken

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content, engineering, operations
- **Scope:** `npm run content:link-audit` en de volledige actieve contentcorpus
- **Herkomst:** `QCR-2026-09-13-01`
- **Bevinding:** de audit rapporteerde oorspronkelijk 579 kandidaatvermeldingen
  als één ongedifferentieerde lijst. Door verdere contentgroei waren dat bij
  uitvoering 768 kandidaten geworden.
- **Uitvoering:** kandidaten hebben nu een stabiele ID, een compacte baseline en
  gevalideerde handmatige besluiten voor `link`, `skip` en `false-positive`.
  De terminaluitvoer scheidt daarnaast `new`, `pending` en inactieve regels;
  alleen een expliciete `--sync` schrijft het beslisregister en geen enkele modus
  wijzigt content of relaties.
- **Log:** 2026-09-13 — geregistreerd vanuit de relationele corpusreview; bewust
  losgehouden van structurele graafdekking. 2026-09-22 — triageworkflow,
  compacte baseline van 768 pending kandidaten, documentatie en unit-tests
  toegevoegd; afgerond via `QCR-2026-09-22-06`.

### `MNT-011` — Toepassingen bij autolyse en liesrijping toevoegen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content, research
- **Scope:** `concept.autolysis`, `concept.lees-ageing`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de mechanismen waren goed uitgelegd, maar herkenbare
  toepassingen in verschillende wijnstijlen bleven beperkt.
- **Klaar wanneer:** beide pagina's enkele wereldwijd relevante, zorgvuldig
  begrensde toepassingen bevatten zonder effect als vaste smaakgarantie te
  presenteren; NL en EN blijven gelijkwaardig.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met gelijkwaardige NL/EN-secties over flesrijping van
  traditioneel gemaakte mousserende wijn en liescontact van stille witte wijn in
  vat en tank. Champagne fungeert als gedocumenteerd flesvoorbeeld, terwijl
  AWRI-onderzoek de internationale praktijk en afwegingen bij droge witte wijn
  ondersteunt. Basis introduceert de toepassingen; Verdieping vergelijkt
  contact, zuurstof, ingrepen en het einde van de rijping. Beide entities zijn
  structureel aan de traditionele methode gekoppeld.

### `MNT-042` — Paginatie dichter bij de resultaten bedienen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** product-ux, accessibility, navigation, testing
- **Scope:** gepagineerde zoekresultaten en Ontdekken-verzamelingen
- **Herkomst:** gebruikersevaluatie 2026-09-22
- **Bevinding:** de bediening stond alleen onder lange lijsten en een volgende of
  vorige pagina bracht de gebruiker niet betrouwbaar terug naar de lijstkop.
- **Klaar wanneer:** dezelfde toegankelijke bediening boven en onder iedere
  gepagineerde lijst staat, directe paginalinks lange reeksen compact houden,
  grensknoppen hun uitgeschakelde staat tonen en navigatie naar de bovenkant van
  de betreffende resultatenlijst scrolt zonder de volledige pagina te resetten.
- **Log:** 2026-09-22 — geregistreerd en afgerond met één gedeeld
  paginatiecomponent voor Search en Explore. Beide posities tonen vorige,
  volgende, huidige status en compacte directe paginalinks; links gebruiken een
  stabiele lijst-anchor en respecteren de bestaande scroll-offset. Unit- en
  Playwrighttests dekken paginabereik, states, beide posities, doelscroll en
  responsive overflow.

### `MNT-041` — Rustige wijngaardillustratie achter de homepagehero

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** product-ux, media, visual-design
- **Scope:** homepagehero
- **Herkomst:** gebruikersevaluatie 2026-09-22
- **Bevinding:** de heldere hero miste een rustige visuele introductie tot het
  onderwerp wijn en landschap.
- **Klaar wanneer:** een taalneutrale illustratie met geloofwaardig licht reliëf
  achter de bestaande tekst staat, aan beide zijden exact in de canvas-kleur
  overvloeit, tekstcontrast behoudt en op smalle en brede viewports goed uitsnijdt.
- **Log:** 2026-09-22 — geregistreerd en afgerond met een decoratieve,
  taalneutrale watercolor-en-gouacheplaat van zacht golvende wijngaarden. Het
  asset is in het mediasysteem geregistreerd; gelaagde CSS-overlays garanderen
  de overgang naar `#f4f1eb` en beschermen tekstcontrast. Desktop en mobiel zijn
  met echte responsive uitsnedes en beeldlading afgedekt.

### `MNT-010` — Procesvisual voor klonale selectie

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.clonal-selection`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** selectie, vermeerdering en genetische variatie waren tekstueel
  correct maar visueel lastig te onderscheiden.
- **Klaar wanneer:** een toegankelijke visual het selectie- en
  vermeerderingsproces toont zonder een kloon als genetisch onveranderlijk of
  als kwaliteitsgarantie voor te stellen.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met een taalneutrale procesplaat van kandidaatstok,
  identiteits- en gezondheidscontrole, vegetatieve vermeerdering en meerjarige
  proefrijen. Variatie blijft zichtbaar en de plaat gebruikt geen industriële
  kopieermetafoor of kwaliteitssymbool.

### `MNT-009` — Procesvisual voor vluchtige thiolen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.volatile-thiols`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de omzetting van geurloze precursoren tijdens gisting naar
  waarneembare aroma's was visueel beter uit te leggen.
- **Klaar wanneer:** een toegankelijke visual precursor, gistingsstap en vluchtig
  aroma correct verbindt en de beperkingen van het vereenvoudigde model noemt.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met een taalneutraal drieluik van precursoren in druif
  en most, gedeeltelijke omzetting door gist en aroma boven het glas. Het beeld
  laat bewust precursor achter en claimt geen exacte moleculen of rendement.

### `MNT-008` — Procesvisual voor methoxypyrazinen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.methoxypyrazines`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de relatie tussen concentratie, rijping en waarneming bleef
  abstract zonder beeld.
- **Klaar wanneer:** een toegankelijke visual de causale keten zorgvuldig en
  zonder schijnprecisie toont.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met een taalneutraal drieluik waarin groene
  herkenningsvormen van jong druivenweefsel via véraison in een aromatische
  wijncontext terechtkomen. De aantallen tonen een algemene tendens zonder
  meetschaal, nulpunt of kwaliteitsrangorde.

### `MNT-007` — Tweede appellationbeeld voor Pauillac

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `appellation.pauillac`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** één châteaubeeld vertegenwoordigde de appellation visueel te
  smal.
- **Klaar wanneer:** een tweede rechtenveilig beeld een appellationkenmerk zoals
  landschap, estuariuminvloed, kiezelterroir of ruimtelijke context uitlegt en
  niet slechts nog een beroemde producent portretteert.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met een taalneutrale, samengestelde landschapsdoorsnede
  van een lage grindcroupe aan de Gironde. Drie beelditeraties brachten reliëf,
  horizon, bodemdoorsnede, wortels en gesteentetextuur terug tot een voor
  Pauillac geloofwaardige schaal. De figure staat bij landschap, klimaat en
  bodem in NL en EN, is gekoppeld aan het INAO-dossier en BRGM-geologie en
  vormt samen met de bestaande estuariumfoto een documentair-uitleggend paar.

### `MNT-040` — Defensieve beeldbijschriften terugbrengen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, media, procedure
- **Scope:** alle actieve mediarecords en de captionconventie
- **Herkomst:** redactionele bevinding tijdens de onderhoudsronde van 2026-09-22
- **Bevinding:** veel bijschriften eindigden routinematig met wat één beeld niet
  toont, bewijst of voorspelt. Vooral vanzelfsprekende opmerkingen over smaak,
  kwaliteit, meetwaarden en representativiteit onderbraken de leesstroom.
- **Klaar wanneer:** alle actieve captions in Nederlands en Engels zijn
  beoordeeld; generieke disclaimers zijn verwijderd of positief geformuleerd;
  alleen beperkingen met een concrete kans op misleiding blijven staan; en de
  captionconventie voorkomt terugkeer van het patroon.
- **Log:** 2026-09-22 — geregistreerd en direct afgerond. Alle 132 actieve
  mediarecords zijn geaudit en 72 captionrecords zijn in beide talen compacter
  en positiever geformuleerd. Noodzakelijke begrenzingen voor conceptuele
  schaal, samengestelde geografie, historische status en wetenschappelijke
  variatie zijn behouden. `docs/visual-language.md` verlangt voortaan alleen
  een beperking bij een concrete, plausibele mislezing en noemt smaak- en
  kwaliteitsdisclaimers expliciet als ongewenste routine.

### `MNT-005` — Gedeelde visual voor lies, autolyse en bâtonnage

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** media, content
- **Scope:** `concept.lees-ageing`, `concept.autolysis`, `concept.batonnage`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** drie verbonden processen waren correct beschreven maar misten
  een visueel model van bezinken, contact, afbraak en oproeren.
- **Klaar wanneer:** één samenhangend, herbruikbaar beeldsysteem de verschillen
  en samenhang correct uitlegt en op de relevante pagina's met passende
  gelokaliseerde context wordt ingezet.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met één taalneutraal drieluik dat rustige lies, langzaam
  afbrekende gistcellen en tijdelijk opgeroerde lies gelijkwaardig vergelijkt.
  Twee inhoudelijke iteraties verminderden de bezinkselmassa en roerintensiteit
  en vervingen explosieve celbreuk door geleidelijke degradatie. Dezelfde
  foundation-figure staat met gelokaliseerde context op alle drie pagina's;
  caption en alttekst maken de conceptuele schaal en samenhang leesbaar.

### `MNT-004` — Educatieve ampelografievisual

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** media, content
- **Scope:** `concept.ampelography`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** herkenningskenmerken werden alleen tekstueel uitgelegd.
- **Klaar wanneer:** een rechtenveilige visual scheuttop, blad, tros, bes en pit
  herkenbaar en botanisch verantwoord toont, met gelokaliseerde alttekst en
  caption.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.
  2026-09-22 — afgerond met een taalneutrale botanische rasterplaat in de
  editorial-naturalistische huisstijl. Een eerste te brede compositie is na
  responsive review verworpen; de definitieve 3:2-plaat toont de vijf organen
  in twee leesbare rijen. Alttekst en caption zijn gelijkwaardig gelokaliseerd
  en begrenzen groeimoment, vergroting, rasidentiteit en bewijswaarde.

### `MNT-025` — Europese status Graves Supérieures opnieuw verifiëren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, research, regelgeving
- **Scope:** `appellation.graves-superieures`, `appellation.graves`
- **Herkomst:** contentauthoring 2026-09-11; afgerond in `QCR-2026-09-22-04`
- **Bevinding:** Frankrijk heeft een nieuw Graves-dossier met uitgestelde
  inwerkingtreding vastgesteld en de EU publiceerde op 3 juni 2026 het verzoek
  om de BOB Graves Supérieures te annuleren. Op 11 september 2026 was nog geen
  definitieve goedkeuring vastgesteld.
- **Klaar wanneer:** bij uitblijven van een definitief besluit de status bij de
  volgende periodieke contentreview opnieuw officieel is gecontroleerd,
  gedateerd en op alle betrokken oppervlakken gelijkgetrokken.
- **Log:** 2026-09-11 — geregistreerd met de voorlopige assertion
  `cancellation-request-published-not-confirmed`. 2026-09-22 — eAmbrosia toont
  de naam nog als geregistreerd, met een lopende wijzigingsprocedure en zonder
  verwijderingsmarkering; bron, assertion, NL/EN-proza en reviewdata bijgewerkt.
  Het latere definitieve besluit staat als externe blokkade in `MNT-039`.

### `MNT-031` — Bordeaux-specificatie 2026 claimgewijs doorvoeren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, knowledge-data
- **Scope:** `region.bordeaux`, `appellation.bordeaux`, `concept.grand-vin`, bijbehorende contentplannen en briefs, en het Bordeaux-stijlspectrum-mediarecord
- **Herkomst:** `QCR-2026-09-20-01`; afgerond in `QCR-2026-09-22-03`
- **Bevinding:** deze bestaande content verwees voor actuele regels nog naar de 2025-specificatie, terwijl een nieuwe Bordeaux-specificatie op 21 mei 2026 is gepubliceerd.
- **Klaar wanneer:** iedere betrokken juridische en productclaim tegen de definitieve 2026-tekst is gecontroleerd, nodige NL/EN-correcties zijn uitgevoerd, actuele referenties zijn omgezet, historische provenance intact blijft en alle contentchecks slagen.
- **Log:** 2026-09-20 — definitieve 2026-bron geregistreerd bij het Clairet/Claret-cluster; oudere referenties niet mechanisch vervangen zonder claimreview. 2026-09-22 — alle betrokken claims en bronverwijzingen gecontroleerd; claretverzoeting toegevoegd; scopeclaim voor `Grand Vin de Bordeaux` gecorrigeerd; 2025-bron als deprecated behouden; zie `QCR-2026-09-22-03`.

### `MNT-038` — Phylloxera en franc-de-pied inhoudelijk herbouwen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, research, media
- **Scope:** `concept.phylloxera`, relevante relaties en verwijzingen naar
  franc-de-pied en `producer.liber-pater`
- **Herkomst:** onderhoudsplan 2026-09-21; `QCR-2026-09-22-02`
- **Bevinding:** de pagina deed onvoldoende recht aan de historische crisis,
  de mondiale gevolgen en de gebieden en bewegingen rond wijnstokken op eigen
  wortel; het bladschadebeeld legde visueel het verkeerde accent.
- **Klaar wanneer:** geschiedenis, biologische werking aan de wortels,
  verspreiding, entreactie, blijvende gevolgen, zorgvuldig begrensde
  phylloxeravrije contexten en franc-de-pied samen een compleet NL/EN-verhaal
  vormen; claims zijn passend onderbouwd; relaties zijn vooruit aangelegd; en
  media ondersteunt de kern in plaats van perifere bladschade.
- **Log:** 2026-09-21 — geregistreerd als gerichte inhoudelijke herbouw, niet als
  kleine aanvulling. 2026-09-22 — phylloxera volledig herschreven; actieve
  franc-de-piedentity en Liber Pater-draft toegevoegd; bladgalfoto vervangen
  door gedocumenteerde wortelnodositeiten; bron-, relatie-, zoek-, taal-,
  responsive en repositorychecks afgerond; zie `QCR-2026-09-22-02`.

### `MNT-037` — Defensieve formuleringen corpusbreed terugdringen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** editorial, content-quality
- **Scope:** paragrafen, koppen en beeldbijschriften in actieve NL- en EN-content
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** teksten legden geregeld uit wat iets niet is, ook wanneer een
  positieve, directe formulering het onderwerp sterker en rustiger kon
  uitleggen.
- **Klaar wanneer:** de authoringrichtlijnen onderscheid maken tussen nuttige
  begrenzing en defensieve stopzinnen; het actieve corpus menselijk is
  doorgelopen; noodzakelijke contrasten behouden blijven; en beide talen
  inhoudelijk gelijkwaardig zijn herzien.
- **Log:** 2026-09-21 — geregistreerd; geen mechanische zoek-en-vervangactie,
  omdat ontkenningen soms essentieel zijn voor juistheid. 2026-09-22 — alle 263
  actieve packages en 526 lokalisaties geïnventariseerd; dichtste en meest
  zichtbare patronen in tien tweetalige packages inhoudelijk herschreven;
  positieve-herformuleringstest en herhaalbaar auditcommando ingevoerd; zie
  `QCR-2026-09-22-01`.

### `MNT-036` — Discovery schaalbaar maken met hiërarchie en facetten

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** discovery, product-ux, information-architecture
- **Scope:** Ontdekken en grote entiteitverzamelingen
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** de categoriepresentatie was helder voor het bestaande corpus,
  maar de vervolgstap bleef een vlakke lijst die bij honderden of duizenden
  onderwerpen niet scanbaar zou blijven.
- **Klaar wanneer:** de interface typegebonden tussenniveaus, hiërarchie en
  betekenisvolle filters of facetten kan tonen; filtertoestand deelbaar in de
  URL is; kleine collecties compact blijven; en de oplossing geen generieke,
  lege filterlaag over ieder entitytype legt.
- **Log:** 2026-09-21 — afgerond. Alle acht entitytypes hebben een vaste
  Explore-browse-route. Verzamelingen boven de drempel krijgen naamzoeken,
  contextgevoelige beginletters, 36 resultaten per pagina en waar betrouwbaar
  afleidbaar een relationeel contextfacet. Producenten gebruiken bijvoorbeeld
  hun `located_in`-appellation; appellations gebruiken hun meest specifieke
  actieve `part_of`-regio. Filters staan in de URL, kleine collecties blijven een
  directe lijst en er is bewust geen verzonnen concepttaxonomie toegevoegd. De
  routes staan in de sitemap en zijn met unit-, metadata-, responsive en
  Playwrightchecks afgedekt.

### `MNT-035` — Zoekinteractie direct en zichtbaar maken

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** search, product-ux, accessibility, testing
- **Scope:** zoekpagina zonder en met query, desktop en mobiel
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** zonder query kreeg het invoerveld niet vanzelf focus; na een
  zoekactie konden resultaten onder de fold verschijnen zonder zichtbare
  terugkoppeling.
- **Klaar wanneer:** een lege zoekpagina het zoekveld veilig focust, een
  uitgevoerde zoekopdracht het resultaatgebied zichtbaar maakt of focust zonder
  onverwachte beweging, reduced-motion en browsergeschiedenis respecteert, en
  het gedrag met Playwright op relevante viewports is afgedekt.
- **Log:** 2026-09-21 — afgerond. Een kleine client-helper focust het zoekveld
  alleen wanneer de pagina nog geen betekenisvolle focus heeft. Na zoeken krijgt
  de resultaatkop focus en wordt zij uitsluitend wanneer nodig zichtbaar
  gescrold; `prefers-reduced-motion` schakelt animatie uit. De bestaande
  GET-navigatie en browsergeschiedenis blijven intact. Desktop en mobiel zijn
  visueel gecontroleerd; Playwright dekt lege focus, resultaatfocus,
  reduced-motion, terugnavigatie en overflow af.

### `MNT-034` — Volledige artikelinhoud doorzoekbaar maken

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** search, knowledge-data, product-ux
- **Scope:** zoekindex, ranking, snippets en resultaatlinks
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** zoeken vond entities en metadata, maar benutte de eigenlijke
  artikeltitels, paragrafen en relevante beeldbijschriften nog onvoldoende.
- **Klaar wanneer:** betekenisvolle inhoud uit actieve, gelokaliseerde
  contentblokken reproduceerbaar wordt geïndexeerd; resultaten een begrijpelijke
  contextsnippet en zo mogelijk een stabiele sectieanchor tonen; ranking
  entitynamen boven losse teksttreffers houdt; en kennisdiepte geen verborgen
  informatie onvindbaar maakt.
- **Log:** 2026-09-21 — afgerond. De build maakt nu een tweetalige zoekindex voor
  entities en narratives met 2.170 Nederlandse passages over de 263 actieve
  documenten, waaronder 158 bijschriften van daadwerkelijk gebruikte figures.
  Exacte namen blijven boven headings, prose en captions staan. Iedere
  inhoudstreffer toont context en een begrensde snippet en linkt naar het
  stabiele blockanker; een gevorderde treffer opent daardoor automatisch het
  vereiste kennisniveau. De nieuwe resultaatkaarten zijn op 1440×1200 en 390×844
  visueel gecontroleerd en met unit-, pipeline- en Playwrighttests afgedekt.

### `MNT-033` — README en developer-onboarding actualiseren

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** documentatie, operations
- **Scope:** hoofd-README en de eerste lokale ontwikkelrun
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** de algemene README moest opnieuw tegen de actuele repository,
  scripts, contentworkflow, runtimevereisten en browserinstallatie worden
  getoetst; het producentenvoorbeeld was ongeldig en essentiële context ontbrak.
- **Klaar wanneer:** een nieuwe developer vanuit één actuele ingang de app kan
  installeren, starten, content kan authoren en genereren, media kan valideren
  en de vaste kwaliteitschecks kan uitvoeren, zonder impliciete kennis of een
  ongeldig voorbeeldcommando.
- **Log:** 2026-09-21 — afgerond. De README documenteert nu Node `>=20.9.0`,
  reproduceerbare installatie, de Playwright-browser, canonical versus
  generated data, de tweetalige entityworkflow, correcte generatorvoorbeelden,
  het mediasysteem, alle huidige scripts en een risicogestuurde testkeuze. Alle
  lokale links en genoemde niet-mutatieve commando's zijn gecontroleerd.

### `MNT-032` — Canonieke Engelstalige URL-slugs invoeren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** routing, knowledge-data, SEO, testing
- **Scope:** alle entity- en narrativepagina's, interne links, sitemap en
  legacyroutes
- **Herkomst:** onderhoudsplan 2026-09-21
- **Bevinding:** publieke URL-slugs wisselden tussen Nederlands en Engels,
  doordat de Nederlandse slug impliciet de route bepaalde.
- **Klaar wanneer:** de Engelse slug overal de canonieke publieke route vormt,
  bestaande Nederlandse URLs permanent blijven werken, interne links en sitemap
  alleen canonieke routes publiceren, en aliasbotsingen door de pipeline worden
  tegengehouden.
- **Log:** 2026-09-21 — afgerond. Alle 36 afwijkende entity-slugs en de ene
  afwijkende narrative-slug hebben een canonieke Engelse bestemming; 31 daarvan
  zijn momenteel publieke actieve entitypagina's. Nederlandse legacy-slugs
  blijven als permanente 308-redirect bestaan. Cross-locale collisions,
  statische generatie, canonicals, sitemap, embedded produceranchors en
  browsergedrag zijn geautomatiseerd gecontroleerd.

### `MNT-029` — Structurele volledigheidsaudit voor relaties

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** knowledge-data, testing, operations
- **Scope:** alle actieve entities
- **Herkomst:** `QCR-2026-09-13-01`
- **Bevinding:** de pipeline bewaakte geldigheid en doublures, maar rapporteerde
  niet afzonderlijk of actieve entitytypes hun minimale relationele context
  bezitten.
- **Klaar wanneer:** een herhaalbare opdracht alle actieve entities controleert
  op algemene en typegebonden minimumdekking, faalt bij bevindingen en door tests
  wordt gedekt; de grens met menselijke inhoudelijke review is gedocumenteerd.
- **Log:** 2026-09-13 — afgerond met `npm run content:relation-audit`, unit-tests
  en opname in de vaste QA-workflow. De actuele run controleerde 81 actieve
  entities en vond geen structurele lacunes.

### `MNT-028` — Gerelateerde onderwerpen compact en semantisch clusteren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** product-ux, accessibility, engineering, testing
- **Scope:** de relatiepanelen van alle entitypagina's
- **Herkomst:** `QCR-2026-09-13-01`
- **Bevinding:** vlakke, volledig open relatielijsten werden bij tientallen
  relaties lang en slecht scanbaar.
- **Klaar wanneer:** alle relatietypen zonder dataverlies onder stabiele,
  begrijpelijke clusters vallen; aantallen en precieze sublabels zichtbaar
  blijven; kleine lijsten direct leesbaar zijn; grote lijsten inklapbaar zijn;
  en toegankelijk plus responsive gedrag is getest.
- **Log:** 2026-09-13 — afgerond met vijf semantische native-detailsclusters,
  compacte kaarten, automatische aantallen en unit- plus Playwrightdekking.

### `MNT-012` — Retrospectieve contentbrief voor Grand Vin

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content
- **Scope:** `concept.grand-vin`
- **Herkomst:** `QCR-2026-09-08-01`, afgesloten in `QCR-2026-09-13-01`
- **Bevinding:** de actieve pagina was inhoudelijk op orde, maar miste het
  procesdocument waarmee scope, vragen en bewuste uitsluitingen later kunnen
  worden herleid.
- **Klaar wanneer:** een compacte contentbrief de bestaande scope en
  kennisniveaus documenteert zonder nieuwe proza of feiten als filler toe te
  voegen.
- **Log:** 2026-09-13 — afgerond. De retrospectieve brief documenteert belofte,
  begrenzing, kennisniveaus, bronnen, relaties en beeldrol zonder de actieve
  content te veranderen.

### `MNT-026` — Reliëf in rechteroeverillustraties geografisch herijken

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** media, geography, content
- **Scope:** `region.fronsadais`, `appellation.fronsac`,
  `appellation.canon-fronsac`, `appellation.lalande-de-pomerol` en de vier
  Saint-Émilion-satellieten
- **Herkomst:** visuele review 2026-09-13
- **Bevinding:** de eerste geschilderde illustraties waren inhoudelijk leesbaar,
  maar vergrootten plaatselijk het verticale reliëf, de kalkwanden en de
  bodemovergangen. Fronsac en Canon-Fronsac hebben echte coteaux en tertres,
  maar geen hoog heuvelland; Lalande-de-Pomerol is overwegend vlak tot zacht
  golvend.
- **Klaar wanneer:** iedere illustratie opnieuw is getoetst aan officiële
  reliëf- en landschapsbeschrijvingen; hoogte, hellingshoek, rivierdal,
  kalkcorniche, bodemovergang en groeve zijn proportioneel; captions benoemen de
  conceptuele beperking; en desktop plus mobiel zijn gecontroleerd.
- **Log:** 2026-09-13 — afgerond. Vijf PNG's zijn opnieuw gegenereerd met
  expliciete hoogteankers, menselijke schaal, gemengd landgebruik en verboden
  dramatisering. Fronsac noemt de circa 76 meter hoge tertre, Canon-Fronsac circa
  61 meter; Lalande toont een onregelmatig bodemmozaïek in zacht reliëf; het
  satellietvierluik gebruikt één vergelijkbare schaal en slechts een discrete
  groeveverwijzing. Mediarecords, checksums, NL/EN-altteksten en captions zijn
  vervangen en visueel plus technisch gevalideerd.

### `MNT-027` — Legacy SVG-illustraties tegen de nieuwe huisstijl toetsen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** media, content, accessibility
- **Scope:** `appellation.castillon-cotes-de-bordeaux`,
  `appellation.cotes-de-bordeaux`, `appellation.francs-cotes-de-bordeaux` en
  `appellation.sainte-foy-cotes-de-bordeaux`
- **Herkomst:** visuele review 2026-09-13
- **Bevinding:** vier pagina's gebruikten een SVG als atmosferische
  `illustration`, terwijl hun leerdoel beter paste bij de gedetailleerde,
  geschilderde rasterstijl. Echte schema's voor regels, etiketten,
  classificatiehiërarchie en de traditionele methode blijven functionele SVG's.
- **Klaar wanneer:** de vier visuals afzonderlijk zijn beoordeeld, geschikte
  gevallen zijn vervangen door brongetrouwe rasterillustraties met de nieuwe
  captionconventie en behouden SVG's expliciet een diagramfunctie hebben.
- **Log:** 2026-09-13 — afgerond. Castillon kreeg een gekalibreerde overgang van
  terras via helling naar plateau; de Côtes-overview vijf gelijkwaardige,
  niet-cartografische landschapsmotieven; Francs drie begrensde oogstroutes; en
  Sainte-Foy vier stijlen zonder kwaliteitsladder. De vier oude SVG-bestanden
  zijn verwijderd en hun stabiele media-ID's verwijzen nu naar PNG's.

### `MNT-023` — Pomerol-producentenverzameling als end-to-end pilot

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, research, product-ux, testing
- **Scope:** `appellation.pomerol` en de acht gekoppelde collectieprofielen
- **Herkomst:** `QCR-2026-09-09-01`
- **Bevinding:** de plannings- en routingstructuur was aanwezig, maar een actief
  cohort moest nog bewijzen dat meerdere producenten helder, beeldrijk en
  proportioneel op één ownerpagina kunnen functioneren.
- **Klaar wanneer:** de selectiegrond is uitgelegd, ieder profiel in NL en EN
  volledig en onderbouwd is, anchors en kennisdiepte bruikbaar zijn, producerlinks
  en oude routes naar de juiste sectie wijzen en desktop plus mobiel geen
  scanbaarheids- of overflowproblemen tonen.
- **Log:** 2026-09-09 — afgerond in `QCR-2026-09-09-03`. Acht tweetalige
  profielen zijn actief; routing, anchors, diepte en responsive gedrag zijn
  getest. Een apart collectiecomponent bleek vooralsnog niet nodig. Petrus is
  parallel als zelfstandige monografie gepubliceerd.

### `MNT-024` — Actieve producentenmonografieën opnieuw toetsen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content, product-ux
- **Scope:** de tien actieve producentenpagina's op 2026-09-09
- **Herkomst:** `QCR-2026-09-09-01`, afgesloten in `QCR-2026-09-09-02`
- **Bevinding:** deze pagina's zijn onder het eerdere drieschalenmodel geschreven.
  Hun inhoud was niet ongeldig, maar hun zelfstandige positie moest tegen de
  strengere monografietoets worden gemotiveerd.
- **Klaar wanneer:** iedere actieve producent een vastgelegde monografiemotivatie
  of gecontroleerd consolidatieplan heeft.
- **Log:** 2026-09-09 — afgerond. Alle tien actieve records zijn expliciet als
  monografie vastgelegd. De zes eerder benoemde iconen dragen evident een
  zelfstandig historisch en regionaal verhaal; Angélus, Canon, Figeac en Pavie
  blijven zelfstandig vanwege hun onderscheiden leerdoelen rond positionering
  en classificatie, kalksteenplateau, cabernetgedreven terroir en de relatie
  tussen helling en stijlontwikkeling. Geen bestaande proza, bronnen, media of
  routes zijn verwijderd.

### `MNT-022` — Legacy draftproducenten per cohort classificeren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** knowledge-data, content
- **Scope:** alle 119 draftproducenten op 2026-09-09
- **Herkomst:** `QCR-2026-09-09-01`, afgesloten in `QCR-2026-09-09-02`
- **Bevinding:** oudere dependencyrondes maakten ieder producentenrecord als
  impliciete monografie aan. Daardoor was de werkvoorraad groter dan de
  pedagogische paginabehoefte.
- **Klaar wanneer:** ieder bestaand draftrecord gemotiveerd is ingedeeld,
  embedded owners en anchors zijn vastgesteld en geen legacy-default resteert.
- **Log:** 2026-09-09 — afgerond voor Pomerol, Pauillac/1855,
  Sauternes–Barsac/1855 en Saint-Émilion. De volledige inventaris telt nu 11
  monografieën, 29 collectieprofielen en 89 registervermeldingen. Alle producer-
  records hebben een expliciete keuze; de volledige cohortmatrix en methode staan
  in `QCR-2026-09-09-02`.

### `MNT-021` — Schaalbaar producentenpublicatiemodel invoeren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** knowledge-data, engineering, content, testing
- **Scope:** producentenschema, dependencyplanning, routing, discovery,
  statusrapportage en authoringrichtlijnen
- **Herkomst:** `QCR-2026-09-09-01`
- **Bevinding:** een producerrecord en een zelfstandige producentenpagina waren
  technisch en procesmatig hetzelfde, waardoor volledige werelddekking niet
  haalbaar schaalde.
- **Klaar wanneer:** identiteit en publicatievorm losstaan, nieuwe plannen een
  keuze afdwingen, embedded profielen één canonical prose-owner hebben, links en
  routes stabiel blijven en de werkvoorraad zichtbaar per publicatievorm wordt
  gerapporteerd.
- **Log:** 2026-09-09 — afgerond. `monograph`, `collection-profile` en
  `register-entry` zijn schema-geldig; ownerrelatie, gelokaliseerde anchor,
  lege embedded overviewbestanden, publicatierouting, Explore/sitemapgedrag en
  schema-v2-dependencies worden gevalideerd. Documentatie, unit-tests en de
  Pomerol-planningspilot zijn toegevoegd.

### `MNT-001` — Assemblage wereldwijd verbreden

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content, research
- **Scope:** `concept.assemblage`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de uitleg was bruikbaar, maar voorbeelden en bronbasis leunden
  te sterk op Bordeaux voor een algemeen wijnbouwkundig concept.
- **Klaar wanneer:** de NL- en EN-pagina's behandelen representatieve
  toepassingen buiten Bordeaux, waaronder waar passend multi-vintage,
  mousserende wijn en assemblage van rassen, percelen of partijen; de bronbasis
  ondersteunt die bredere scope en beide talen blijven inhoudelijk gelijk.
- **Log:** 2026-09-08 — afgerond. De algemene definitie is losgemaakt van het
  Bordeauxvoorbeeld; Champagne verduidelijkt nu assemblage naar druif, cru,
  perceel en oogstjaar, reservewijnen en het moment vóór de tweede gisting. Twee
  geopende Comité Champagne-bronnen zijn geregistreerd en NL/EN-pariteit en
  linkaudit zijn gecontroleerd.

### `MNT-003` — Classificatievisual voor Bordeaux 1855

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** media, accessibility
- **Scope:** `classification.bordeaux-1855`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de classificatiepagina had geen beeld terwijl de hiërarchie
  zich goed leent voor visuele uitleg.
- **Klaar wanneer:** de pagina een rechtenveilige, toegankelijke visual of
  historische documentweergave bevat die de classificatie verduidelijkt zonder
  betekenis uitsluitend via kleur over te brengen.
- **Log:** 2026-09-08 — afgerond met een project-eigen SVG-diagram. Vijf tegenover
  drie niveaus, Romeinse rangnummers, exacte aantallen en verschillende posities
  dragen de betekenis naast kleur. De officiële classificatiebron is aan het
  figure-block en de mediaherkomst gekoppeld; gelokaliseerde alttekst en captions
  bieden de volledige tekstuele uitleg. De gerenderde SVG is visueel
  gecontroleerd.

### `MNT-006` — Verdwenen officiële Yquem-bronnen vervangen

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** research, content
- **Scope:** `producer.chateau-d-yquem`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** vier eerder gebruikte officiële deelpagina's waren niet meer
  rechtstreeks toegankelijk.
- **Klaar wanneer:** de betrokken claims opnieuw zijn gecontroleerd tegen
  toegankelijke primaire bronnen of gecontroleerde archiefkopieën, nieuwe
  bronrecords zijn gekoppeld waar nodig en de oude provenance bewaard blijft.
- **Log:** 2026-09-08 — afgerond. Werkende Internet Archive-snapshots van de
  officiële history-, estate-, expertise- en Y-pagina's zijn afzonderlijk
  geopend en als actieve bronrecords geregistreerd. Alle betrokken NL- en
  EN-blocks verwijzen naar deze archiefrecords. De oorspronkelijke vier records
  en URL's blijven met status `unavailable` in het sourceregister staan.

### `MNT-015` — Botrytiskennis op Bordeaux opnieuw kalibreren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content
- **Scope:** `region.bordeaux`
- **Herkomst:** `QCR-2026-09-08-01`
- **Klaar wanneer:** fundamentele botrytiskennis in de basislaag staat en verdere
  uitleg niet onnodig als gevorderd wordt verborgen.
- **Log:** 2026-09-08 — afgerond tijdens de review; introductie naar `foundation`
  en verdere uitleg naar `intermediate` verplaatst.

### `MNT-016` — Serveercontext Barsac en Sauternes opnieuw kalibreren

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content
- **Scope:** `appellation.barsac`, `appellation.sauternes`
- **Herkomst:** `QCR-2026-09-08-01`
- **Klaar wanneer:** praktische serveer- en combinatiekennis op het bij WSET 3
  passende verdiepingsniveau beschikbaar is.
- **Log:** 2026-09-08 — afgerond tijdens de review; relevante blocks van
  `advanced` naar `intermediate` verplaatst.

### `MNT-017` — Rootstocklink op Merlot herstellen

- **Status:** afgerond
- **Prioriteit:** middel
- **Categorie:** content, knowledge-data
- **Scope:** `grape.merlot`
- **Herkomst:** `QCR-2026-09-08-01`
- **Klaar wanneer:** de zichtbare term Onderstam / Rootstock naar de bestaande
  canonical entity verwijst en de linkaudit schoon is.
- **Log:** 2026-09-08 — afgerond tijdens de review; link naar
  `concept.rootstock` toegevoegd en linkaudit gecontroleerd.

### `MNT-018` — Yquem-hoofdkop standaardiseren

- **Status:** afgerond
- **Prioriteit:** laag
- **Categorie:** content
- **Scope:** `producer.chateau-d-yquem`
- **Herkomst:** `QCR-2026-09-08-01`
- **Klaar wanneer:** de top-level sectietitel begint met de afgesproken
  producentencategorie in beide talen.
- **Log:** 2026-09-08 — afgerond tijdens de review met `Druivenrassen / Grape
  varieties`.

### `MNT-019` — Producentendiepte differentiëren

- **Status:** afgerond
- **Prioriteit:** hoog
- **Categorie:** content
- **Scope:** producentenworkflow
- **Herkomst:** `QCR-2026-09-08-01`
- **Klaar wanneer:** de authoringrichtlijn onderscheid maakt tussen iconische,
  kern- en referentieproducenten zonder daar een publieke kwaliteitsrang van te
  maken.
- **Log:** 2026-09-08 — afgerond tijdens de review; de drie redactionele schalen
  en hun gebruik zijn vastgelegd in `content-authoring.md`.
