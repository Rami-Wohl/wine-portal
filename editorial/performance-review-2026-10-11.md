# Schaalbaarheid en performance — 2026-10-11

Review-ID: `QCR-2026-10-11-04`. Ticket: `MNT-052`.
Baseline: schone commit `7cf03c1`, Node 24.21.0, Apple M4 Pro, 48 GiB RAM.
Scope: echte contentpipeline, lokale productiebuilds, zoekfunctie, HTTP, traces,
clientresources, beelden en lokale clonekosten. Geen cloud-capaciteitsclaim,
feitelijke wijnreview of externe CI-/deploymentcontrole.

## Uitkomst en besluit

De huidige file-backed architectuur kan door na drie gerichte verbeteringen.
Een afgeleide zoekdatabase, gesplitste contentopslag en CDN zijn nu niet nodig
om de gemeten workloads te bedienen. Herbeoordeling volgt bij een budgetbreuk,
substantieel andere corpus-/mediacompositie of Atlasdata; gebruikersopslag en
redactionele samenwerking blijven afzonderlijke triggers bij `MNT-050`.

De schaaltest heeft wél een werkelijk probleem gevonden: de rechtstreeks
geïmporteerde JSON kwam in JavaScript en TypeScript-analyse terecht. Met 3×
content gebruikte de productieserver circa 2,25 GB RAM. De 8×-build faalde tijdens
TypeScript met een V8-heap van circa 4 GiB. Dit was geen probleem met de
gevalideerde wijncontent en is niet omzeild door typechecking uit te zetten of
meer heap toe te wijzen.

De productierepository leest de gevalideerde JSON nu eenmaal per servermodule als
**databestand**. Next neemt dit bestand expliciet op in de deploymenttraces;
de benchmark verifieert de dynamische zoektrace. Alle bestaande synchrone
repositoryfuncties en de server-only-grens blijven behouden. De grootste
server-JS-chunk daalt van 10,50 MB bij 1× naar 0,44 MB; de JSON bestaat nog wel
als apart te deployen databestand. Clientbundles bevatten geen kennisbundle.
De volledige lokale trace neemt af van 21,85 naar 11,37 MB bij 1× en van
62,40 naar 31,61 MB bij 3×. Dit is geen gecontroleerde Vercel-packagegrootte.

In development blijft een moduledependency op de gegenereerde JSON bestaan,
zodat een contentbuild HMR activeert zonder een enorm JSON-type af te leiden.
De pipeline vervangt gegenereerde snapshots atomisch: een lezer ziet het oude
of nieuwe volledige bestand. Een geïsoleerde Webpack-devtest bevestigt dat een
gewijzigde Nederlandse artikeltitel na een contentbuild zichtbaar wordt zonder
serverherstart. Canonical repositorycontent is daarbij niet gewijzigd.

Daarnaast bewaart een `WeakMap` de genormaliseerde passagevelden. De cache is
gebonden aan levende passageobjecten, niet aan zoektermen. Wijzigingen van tekst
of heading verversen de entry. Zoekrangorde, locale, originele snippets,
anchors, dieptes en captions blijven gelijk. De cache kost circa 5 MiB bij 1×
en 41 MiB bij 8× voor beide talen, binnen het gekozen budget.

Ten slotte leest SHA-256-mediavalidatie bytes via streams, met maximaal acht
tegelijk geopende bestanden. De build houdt daardoor niet de volledige
beeldcollectie als buffers vast. Het gemeten pipelinepiekgeheugen daalt van
circa 691 naar 477 MiB bij 1× en van 1484 naar 1292 MiB bij 8×; duur blijft
vergelijkbaar. Iedere byte blijft gecontroleerd, ook voorbij de eerste chunk.

## Resultaten

De definitieve ruwe metingen, samples en budgetuitslagen staan in
[performance-2026-10-11.json](measurements/performance-2026-10-11.json).
De eerdere inline-JSON-variant, met de al gecachte zoekfunctie, staat in
[performance-inline-json-2026-10-11.json](measurements/performance-inline-json-2026-10-11.json).
Die eerdere run is **onvolledig** doordat de 8×-productiebuild faalde; alleen
content- en zoekmetingen bestaan daar voor 8×. De referentiezoekfunctie in beide
runs komt uit commit `7cf03c1` en normaliseert nog per query.

| Metriek | 1× | 3× | 8× |
| --- | ---: | ---: | ---: |
| Entities / actief | 359 / 295 | 1077 / 885 | 2872 / 2360 |
| Gepubliceerde zoekdocumenten | 302 | 906 | 2416 |
| JSON-databestand, MB | 10,44 | 30,68 | 81,27 |
| Contentbuild, seconden | 1,70 | 4,50 | 11,13 |
| Productiebuild, seconden | 5,92 | 7,72 | 13,13 |
| Prerender-manifest: routes | 465 | 1361 | 3601 |
| NL `water`: oude zoekmediaan, ms | 66,24 | 195,70 | 516,87 |
| NL `water`: nieuwe warme mediaan, ms | 4,16 | 11,95 | 30,96 |
| Hoogste warme zoek-p95 over cases, ms | 8,19 | 16,46 | 32,31 |
| Hoogste warme HTTP-zoek-p95, ms | 12,74 | 19,68 | 40,33 |
| Server-RSS na workload, MB | 352 | 457 | 756 |
| Grootste lokale trace, MB | 11,37 | 31,61 | 82,20 |
| Artikel: gecomprimeerde JS-inventaris, KiB | 181 | 181 | 181 |
| Artikel: gecomprimeerde HTML, KiB | 21 | 21 | 22 |

MB is decimaal; MiB/KiB gebruiken machten van 1024. De gemeten RSS na 1× bevat
ook de imageoptimizer-sample, die scaled runs niet opnieuw uitvoeren.
Alle **42 budgetcontroles slagen**. De afzonderlijke eerste zoekquery per taal
kost nog circa 70/57 ms bij 1× en 538/446 ms bij 8×. Caching verbetert herhaalde
queries; het verwijdert de initiële normalisatie niet. Processtart tot de eerste
Nederlandse zoekresponse blijft in de volledige run onder twee seconden.

## Media en repositorykosten

188 lokale bestanden, allemaal Git-tracked: 351.367.887 bytes (335 MiB).
77 zijn groter dan 2 MiB; de grootste bronfoto is 14,34 MB. Git-objecten nemen
circa 359 MiB in. Een lokale full-history clone met checkout zonder hardlinks
kost circa 1,56 seconde. Dat is geen meting van internet of GitHub Actions.

Next levert de waarnemings-PNG van 2,66 MB in de sample als WebP van circa
43 KB bij 828 pixels en 122 KB bij 1920 pixels. De gesamplede documentaire
steenfoto levert circa 13 en 26 KB. Grote bronbestanden zijn daarmee niet
hetzelfde als grote browserdownloads. Bronbeelden, metadata, rechten en
checksums zijn ongewijzigd; er is geen ongecontroleerde downscale uitgevoerd.

De synthetische corpora delen bronnen en mediabytes. Een evenredige groei van
beeldopslag zou bij 3× circa 0,98 GiB en bij 8× 2,62 GiB opleveren; dit zijn
**projecties**, geen gemeten fixturevolumes. Daarom geldt een opslagreviewtrigger
bij 500 MiB raw media of 512 MiB Git-objecten, vóór een volgende grote import.
Een eventuele CDN-stap vereist synchronisatie, integriteit, caching en rollback.

## Reproduceerbaarheid en beperkingen

De harness maakt geïsoleerde packages met unieke IDs/slugs en corresponderende
relaties, prose-links, plan-dependencies, producentenowners en pathtargets.
Schema- en contentvalidatie blijven aan; canonical files worden niet gewijzigd.
De referentiecontrole vergelijkt ranking, snippets, match kinds, anchors en
dieptes voor alle veertien query/locale-cases op alle drie schalen.

Vijf warme zoekmetingen per case en drie HTTP-metingen maken p95 praktisch de
waargenomen maximumtijd. Het zijn diagnostische samples op één lokale machine,
geen statistische garantie. OS-caches zijn warm; geen serverless cold start,
verzadigde concurrency, netwerklatentie, browser-LCP of duurtest is gemeten.
Een gelijkvormige kopie voorspelt niet alle kosten van nieuwe lange artikelen,
media, bronnen of GIS-data. Budgets en herhaaltriggers staan in
[performance-budgets.md](../docs/performance-budgets.md).

Herhalen:

```sh
npm run benchmark -- --scales=1
npm run benchmark -- --production --clone --reference=7cf03c1 --enforce
npm run benchmark -- --check=editorial/measurements/performance-2026-10-11.json
```

De laatste opdracht vergelijkt de bewaarde resultaten met de huidige budgetten;
hij verricht geen nieuwe meting. De volledige run gebruikt tijdelijke lokale
poorten en verwijdert de synthetische corpora na afloop.

## Regressiecontrole en vervolg

`npm run format` en `npm run check` slagen, inclusief lint, typegeneratie,
TypeScript, relationele audit en **155 unit-tests**. De Webpack-productiebuild
slaagt met alle **161 browsertests**. Nieuwe regressies dekken locale-/cache-
verversing, complete gestreamde checksums, onderling consistente fixture-
identities/slugs/relaties en afwijzing van onvolledige performancebestanden.
De gegenereerde content is semantisch identiek aan de baseline; de dynamische
zoektrace bevat het benodigde JSON-databestand. De hercontrole van de bewaarde
meting haalt alle 42 huidige budgetten.

Na de development-HMR-/atomische-schrijfcorrectie slagen de volledige checks
opnieuw. Aanvullende geïsoleerde productieruns op 1× en 8× halen respectievelijk
18/18 en 14/14 budgetcontroles; de developmentbranch komt niet in de
productie-JS terecht. Deze gerichte regressieruns vervangen de bovenstaande
volledige referentiemeting niet.

`MNT-052` is afgerond. De volgende ontwikkeltaak is de inventaris en eerste
Port/Sherry/Champagne-batch van `EXP-032`. De afhankelijkheid van `EXP-026/028`
is verduidelijkt: zij wachten op die eerste batch, niet op iedere toekomstige
wijnpagina. De overige batches blijven afzonderlijk open binnen `EXP-032`.
Deploymentverificatie blijft `MNT-056`, inclusief aanwezigheid van het externe
JSON-databestand en werkende NL/EN-search op de echte hostingomgeving.
