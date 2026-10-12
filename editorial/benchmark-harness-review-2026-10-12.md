# Benchmark-harnessreview — 2026-10-12

Review-ID: `QCR-2026-10-12-03`

## Reikwijdte en methode

Analyse van `scripts/performance/` getoetst aan de code, Node 24.21.0,
de geïnstalleerde Next.js 16.3.8-implementatie en eerdere meetrapporten.
De gebruiker vroeg directe correcties, begrijpelijke Nederlandse codecomments
voor een beginnende lezer, grondige tests en geprioriteerde vervolgtickets.
De bestaande ongecommitte toevoeging bestond uit 272 Engelse commentaarregels;
deze is bewust herschreven, niet weggegooid als ongewenst gebruikerswerk.

Referentie-HEAD bij uitvoering: `77b9a611f5ae0481479c5029fd7f7760bc684cef`.
De metingen zijn uitgevoerd met de ongecommitte verbeteringen; `dirty: true`
is behouden. Er is geen sitefeature, canonical content, dependency of hostingconfig
gewijzigd. De lokale benchmark gebruikt eigen proefmappen en loopbackservers.

## Bevindingen en directe correcties

Afgehandeld in `MNT-063`:

- Kindprocesuitvoer wordt pas na `close` verwerkt. UTF-8-decoding bewaart
  multibytetekens over chunks heen; foutuitvoer blijft in het commandolog.
- `postcss.config.mjs` gaat mee in de appfixture. `.env`-bestanden blijven buiten
  de kopie. De gegenereerde schaalbundel wordt niet door de appkopie overschreven.
- Procesopruiming herkent niet-gestarte en al beëindigde processen, inclusief
  signaalbeëindiging. SIGTERM krijgt vijf seconden; daarna SIGKILL en maximaal
  één extra seconde wachten. Uitblijven van exit wordt een fout, geen eindeloze wachtlus.
- Fixtureopruiming omvat nu ook fouten tijdens setup. Een gedeeltelijke Git-clone
  wordt eveneens in finally verwijderd. `--keep-fixtures` behoudt bewust de proefmap.
- Uitvoerlocaties worden via hun bestaande fysieke bovenliggende map gecontroleerd;
  een symlink naar de repository omzeilt de normale locatiecontrole niet.
- Budgetcontrole weigert lege, dubbele of onverwachte schalen, ontbrekende
  zoekgevallen/locales/herhalingen, ongeldige getallen, ontbrekende traces,
  ontbrekende artikelresources/beeldsamples en onvolledige productiefasen.
  De volledige historische meting van 2026-10-11 blijft geldig beoordeeld.
- Brotli gebruikt kwaliteit 4 in plaats van default 11 en legt dat vast in de methode.
  De bestuurder bewaart de ruwe bytes alleen tijdens de compressieschatting;
  volledige JSON-parsing gebeurt alleen bij productie en alleen media wordt behouden.
- Deploymenttraces delen een cache van bestandsgrootte-Promises per buildmeting.
  Daarmee worden ook gelijktijdige dubbele stat-oproepen voorkomen.
- Alle performancebestanden hebben Nederlandse comments. Korte uitleg introduceert
  processen, stdout/stderr, events, Promises, async/await, JSON, caches, geheugen,
  types en tests naast de relevante code; onderlinge verwijzingen geven leesvolgorde.

De oorspronkelijke verklaring van de shutdown-hang is gecorrigeerd: een
mislukte spawn bij ENOENT geeft in deze Node-versie exitCode -2. Een reeds door
SIGTERM beëindigd proces heeft juist exitCode null en signalCode SIGTERM; de oude
cleanup kon dan een reeds verstreken exit-event afwachten. Beide routes zijn getest.

## Validatie

- `npm run format` en `npm run check`: geslaagd; 184 unit-tests in 24 bestanden,
  inclusief 34 gerichte performancetests.
- Gerichte regressies: uitvoer na directe kindprocesexit, gesplitste UTF-8-bytes,
  commandofouten, spawnfouten, normaal stoppen, al beëindigde processen,
  SIGTERM-weigering, begrensde shutdownfout, fout tijdens fixturesetup,
  fout tijdens meten, expliciete fixturebewaring, PostCSS-configuratie,
  symlinklocaties en corrupte/onvolledige meetrapporten.
- Echte productiemetingen met HTTP, deploymenttraces en zoekpariteit:
  - `npm run benchmark -- --scales=1 --production --reference=HEAD --enforce`
    — 18/18 budgetcontroles geslaagd; referentie is hierboven genoemde commit.
  - `npm run benchmark -- --scales=3,8 --production --clone --reference=7cf03c1 --enforce`
    — 26/26 budgetcontroles geslaagd; ook pariteit met de oorspronkelijke zoekimplementatie.
- Alle drie fixturemappen en de Git-clone waren na afloop verwijderd.
- De sandbox liet het eerste 1×-serverexperiment niet op loopback luisteren
  (EPERM); dit experiment werd correct afgewezen en opgeruimd. De volledige
  productieruns slaagden daarna met de toegestane lokale serverrechten.
- Geen nieuwe Playwright-run: browser-UI en runtimeapp zijn niet gewijzigd.
  HTTP-metingen zijn geen browserrendering-, toegankelijkheids- of cloudtest.

De twee runs bevatten dezelfde repositorybrede checks; hun 18 + 26 controles
zijn daarom geen 44 verschillende budgetten. De bestaande grenzen zijn niet verruimd.

| Schaal | Contentbuild | Productiebuild | Slechtste warme zoek-p95 | Slechtste HTTP-p95 | Server-RAM na workload | Grootste lokale trace |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1× | 1,70 s | 6,40 s | 8,55 ms | 12,35 ms | 331 MiB | 10,8 MiB |
| 3× | 4,18 s | 8,48 s | 16,24 ms | 19,55 ms | 435 MiB | 30,1 MiB |
| 8× | 10,84 s | 14,96 s | 31,66 ms | 38,71 ms | 720 MiB | 78,4 MiB |

Bewijs: [1×-rapport](measurements/performance-2026-10-12-1x.json) en
[3×/8×-rapport](measurements/performance-2026-10-12-3x-8x.json).
Bij alle drie artikelmetingen wordt één CSS-bestand van 13.415 gzipbytes
opgehaald. De oude fixture haalde twee bestanden van samen 16.778 bytes op.
Dit is bevestiging van de gecorrigeerde bouwopzet, geen bewezen algemene
snelheidswinst voor de site. Brotli-schattingen zijn door de gewijzigde kwaliteit
niet rechtstreeks vergelijkbaar met de oude kwaliteitsinstelling.

## Grenzen en vervolg

De vaste queryset is een regressiesteekproef. Synthetische kopieën representeren
volumegroei, geen echte nieuwe regio's of gebruikersverkeer. Bij vijf zoeksamples
of drie HTTP-samples is p95 de waargenomen maximumwaarde. Lokale traces zijn geen
geverifieerde Vercel-functiongroottes; RAM na workload is geen piek- of lektest.

- `MNT-064`: lage prioriteit; herhaald fixturelezen alleen optimaliseren wanneer
  setupkosten aantoonbaar een bottleneck worden, met behoud van geheugenbeheersing.
- `MNT-065`: middel; vóór grote corpus-/Atlasuitbreidingen representatieve scenario's,
  workloadversies en compatibiliteit van historische rapporten uitwerken.
- Externe verificatie blijft het bestaande `MNT-056`; geen duplicaat aangemaakt.

Actuele status en acceptatiecriteria staan in de
[onderhoudsbacklog](../docs/maintenance-backlog.md). Beide nieuwe acties blokkeren
de huidige wijngaardlessen niet. Curriculumakkoord DEC-LRN-015 blijft een apart
inhoudelijk besluit; deze onderhoudsopdracht keurt dat voorstel niet stilzwijgend goed.
