# Platform sanity review — 2026-10-04

Review-ID: `QCR-2026-10-04-01`

## Reikwijdte en methode

Uitgevoerd op 3–4 oktober 2026 vanaf lokale `main`, commit `3f8523c`.
De opdracht omvat documentatieonderhoud, langetermijnplanning, leesbaarheid,
architectuur, bestaande werkcheckouts en gerichte correcties. De werkboom was
bij aanvang schoon. Inventarisatie combineert Git, YAML-manifests,
Markdown-AST-links, TypeScript-imports, handmatige review van policies,
roadmaps en kernmodules, npm-audit en de bestaande testketen.

Dit is geen nieuwe feitelijke review van alle wijninhoud, penetratietest,
volledige toegankelijkheidsaudit of productie-infrastructuuraudit. Bestaande
research en beeldrechten zijn behouden; de externe blokkades van eerdere
contenttickets zijn niet opnieuw als actuele feiten geverifieerd.

## Oordeel over de koers

De entity-first architectuur past nog bij het product. Content heeft één
canonical eigenaar; provenance, lokalisatie, mediagegevens en validatie zijn
expliciet. Learn hergebruikt deze kennis en houdt gebruikersvoortgang apart.
Een algemene herschrijving of onmiddellijke database-invoering is niet
onderbouwd door de huidige behoeften.

De risico's zitten vooral in ongelijke voortgang: de content groeit terwijl de
Engelse productpresentatie en Atlas nog geen uitvoeringsplek hadden. Ook
runtimeonderhoud en de grootte van enkele centrale bestanden vragen aandacht.
De nieuwe [productplanning](../docs/product-roadmap.md) legt daarom concrete
momenten vast en verwijst voor ticketstatus naar de bestaande backlogs.

## Markdown: behouden, vereenvoudigen en verwijderen

De uitgangsinventaris telt **871 gevolgde Markdownbestanden**. Van de 719 onder
`content/` zijn er 718 gelokaliseerde documenten die door een canonical manifest
worden aangewezen; het resterende bestand is de legitieme content-README.
Er zijn geen losgeraakte content-Markdownbestanden gevonden.

Van de 406 lege bestanden horen 132 bij draftpackages en 274 bij actieve
producenten die als `register-entry` of `collection-profile` verschijnen. Hun
inhoud heeft bewust elders een eigenaar; deze bestanden mogen niet op basis
van hun lege omvang worden weggegooid. De pipeline bewaakt dit contract.

| Wijziging | Reden en behoud |
| --- | --- |
| `learning/README.md` en `learning/paths/README.md` verwijderd | Verwezen naar een toekomstige canonical locatie; de werkelijke locatie is inmiddels `content/learning-paths/` met een geïmplementeerd schema |
| `editorial/visual-style.md` verwijderd | Lege toekomstplaceholder naast de bindende `docs/visual-language.md` |
| Drie subdirectory-README's onder `media/` verwijderd | Betekenis rond reviewed illustraties, lokaliseerbare diagrammen en afgeleide kaartbeelden samengebracht in de media-README |
| Hoofd-README ingekort | Van 234 naar 115 regels: onboarding en checks blijven; duplicaten van de contentworkflow en volledige beleidsindex verwijzen naar de projectkaart |
| Architectuur, projectkaart, designstatus en Learn-brief bijgewerkt | Learn was op plaatsen nog ten onrechte toekomstwerk; ook actieve narratives, conceptplannen en de nog ongebouwde CDN-sync zijn nu correct beschreven |
| Explore-dekkingsinventaris verduidelijkt | Baselinebouwstenen worden niet meer als volledige actuele conceptinventaris gepresenteerd |

Alle researchbriefs, prompt-/bronprovenance, policies, content en historische
audits blijven behouden. `CLAUDE.md` blijft een nuttige verwijzing naar
`AGENTS.md`. Twee nieuwe documenten hebben een eigen functie: deze gedateerde
review en de overkoepelende planningskaart. Netto blijven **867 Markdownbestanden**
over. Een grotere reductie zou vooral relevante content of controlehistorie
raken, niet overbodige administratie.

## Code en architectuur

- **Duidelijke scheiding:** de contentrepository leest de generated graph,
  routes renderen canonical data en lokale gebruikersvoortgang heeft een eigen
  model en opslaginterface. TypeScript staat op strict.
- **Clientgrens:** een statische traversie van runtime-imports vanaf alle negen
  `use client`-modules vindt geen pad naar `src/content/repository.ts` of de
  generated bundle. Type-only imports zijn uitgesloten. Dit is geen volledige
  meting van netwerkbytes; borg deze grens bij `MNT-048` en meet met `MNT-052`.
- **Te veel verantwoordelijkheden in één bestand:** `pipeline.ts` telt 1.339
  regels; `model.ts` 912; `globals.css` 2.853. Vooral planvalidatie,
  searchindexing en graph-orchestration kunnen apart worden gelezen. Splits
  langs bestaande verantwoordelijkheden met behoud van output en tests.
- **Een API-adapter is nog geen af product:** de voortgangsinterface is een goed
  vertrekpunt, maar `use-learning-progress` heeft nog geen volledig contract
  voor afgebroken requests, netwerkfouten, authenticatie of conflictresolutie.
  Dat hoort bij het backendbesluit, niet bij een impliciete adapterwissel.
- **Werkelijke fout hersteld:** als localStorage nog leesbaar bleef maar schrijven
  faalde, kreeg oude opgeslagen staat voorrang boven de net gewijzigde
  voortgang of kennisdiepte. Een reset kon oude markeringen terughalen.
  Tijdelijke wijzigingen zijn nu leidend tot een succesvolle nieuwe write;
  mislukte resets bewaren ook de lege toestand tijdens het bezoek.

De melding bij tijdelijke voortgang benoemt dat eerdere opgeslagen voortgang
bij een nieuw bezoek kan terugkomen. Er wordt geen duurzaamheid beloofd wanneer
de browser opslag weigert. Drie unitregressies reproduceerden het probleem vóór
de correctie; drie browserregressies controleren nu save, reset en kennisdiepte
met leesbare maar niet wijzigbare opslag.

## Omvang en eerste performancemeting

`public/media/` beslaat circa 311 MiB; de generated JSON bevat 15.932.087 bytes
(circa 15,2 MiB). Dit zijn bestanden op schijf, geen browserdownloadmetingen.
De actieve zoekindex bevat 290 documenten. De huidige zoekfunctie normaliseert
tekst tijdens iedere zoekactie.

Een lokale microbenchmark op Node 20.19.6, één warm-up en twintig runs per
query in de Nederlandse index, gaf:

| Query | Resultaten | Mediaan | Benaderde p95 |
| --- | ---: | ---: | ---: |
| `bordeaux` | 89 | 59,34 ms | 60,46 ms |
| `zuurstof` | 57 | 58,05 ms | 58,40 ms |
| `fermentation` | 5 | 57,05 ms | 57,60 ms |
| `water stress` | 18 | 57,91 ms | 58,84 ms |
| `xyzznonexistent` | 0 | 56,91 ms | 57,81 ms |

Dit meet alleen `searchKnowledge` op actieve `indexes.search`-records in dezelfde
Node-proces, met `performance.now()`, gesorteerde samples en sample 19 van 20
als benaderde p95. Het is geen productie-loadtest. De ongeveer gelijke kosten
voor treffers en een lege uitkomst rechtvaardigen meting van preprocessing,
maar bewijzen geen behoefte aan een externe searchdienst of database.

## Runtime en dependencies

De lokale runtime is Node 20.19.6. Node 20 is volgens het
[officiële releaseschema](https://nodejs.org/en/about/previous-releases)
end-of-life; Node 24 is LTS. De repo heeft geen `.nvmrc`/`engines`-pin of CI-workflow.
Een geteste runtimepin en automatische checks zijn daarom de eerstvolgende
platformtaak. De feitelijke productieruntime is niet vastgesteld.

De eerste productieaudit meldde één kritieke advisory voor Next.js 16.3.3:
[`GHSA-vcvr-r3jv-pc5j`](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).
Deze betreft Node `ImageResponse` met aanvallergestuurde SVG-invoer. De app
importeert geen `next/og`/`ImageResponse`; de specifieke aanvalroute is hier
niet aangetoond. Wel is de dependency gericht bijgewerkt: `next` en
`eslint-config-next` staan nu vast op **16.3.8**, inclusief bijbehorende
lockwijzigingen. De [officiële patchrelease](https://github.com/vercel/next.js/releases/tag/v16.3.8)
bevat ook aanvullende securityfixes. Er is geen productiedeployment uitgevoerd.

De productieaudit na de patch meldt nul kwetsbaarheden. De volledige audit
meldt nog zes high dependencyvermeldingen in ontwikkeltools, deels afgeleide
vermeldingen van dezelfde oorzaak. Zij volgen de ketens `brace-expansion` en
`braces` → `micromatch` → `fast-glob` → Next ESLint. De upstreammeldingen gaan
onder meer over [recursie in braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
en [dure brace-expansie](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr).
`MNT-055` vraagt gerichte compatibiliteitscontrole; de door npm voorgestelde
major-downgrade van de Next-config is niet blind toegepast. Een schone npm-audit
is bovendien geen volledige beveiligingsgarantie.

## Worktrees en remote

Git registreert uitsluitend de primaire checkout op `main`; Codex heeft geen
extra worktree aan deze chat gekoppeld. Er zijn dus geen achterlopende lokale
worktrees om te mergen of archiveren.

`git fetch origin` is geprobeerd en faalde met `Permission denied (publickey)`.
Ten opzichte van de **gecachete** `origin/main` staat lokale `main` vijf commits
voor en nul achter; de actuele remotestand is daarmee niet bevestigd. Er is
geen push, reset, merge of opruiming van gebruikerswijzigingen uitgevoerd.
Herstel/verifieer GitHub-authenticatie vóór remote synchronisatie of het
publiceren van de nieuwe CI-configuratie.

## Direct gecorrigeerd en vervolg

- `MNT-043`: Markdownopschoning, actuele implementatiestatus en productplanning.
- `MNT-044`: gedeeltelijk falende browseropslag, inclusief regressietests.
- `MNT-054`: gerichte Next.js-securitypatch.

De [onderhoudsbacklog](../docs/maintenance-backlog.md) bevat tien nieuwe
niet-afgeronde acties (`MNT-045` t/m `MNT-053`, plus `MNT-055`) voor taalcontract,
taalpresentatie, runtime/CI, pipeline/model, CSS, backendbesluit, Atlaspilot,
performance/media, de latere SVG-migratie en ontwikkeldependencies. De
[productplanning](../docs/product-roadmap.md) geeft de complete uitvoeringsvoorraad
van 28 tickets en de aanbevolen afwisseling met Explore en Learn.

Begin met `MNT-047` en neem `MNT-055` mee. Daarna volgt het taalcontract; de
volgende inhoudelijke taak blijft `EXP-017`. Het backendbesluit sluit aan op
`LRN-012`, vroegst 22 oktober bij voldoende werkelijk gebruik, of eerder bij een
concrete account-, redactie- of API-use-case.

## Validatie

Uitgevoerd op de uiteindelijke code met Next.js 16.3.8:

| Controle | Resultaat |
| --- | --- |
| `npm run format` | Geslaagd; Markdown blijft bewust uitgesloten |
| `npm run check` | Formatting, lint, typecheck, 133 unit-tests en relationele audit geslaagd |
| `npm run content:check` en de daaropvolgende builds | 351 entities, 8 narratives, 1 learning path, 543 bronnen en 178 mediarecords geldig |
| Relationele audit | Alle 283 actieve entities voldoen aan de structurele ondergrens |
| `npm run test:e2e` | Productiebuild geslaagd; alle 85 Chromiumtests geslaagd, inclusief drie nieuwe regressies |
| `npm audit --omit=dev` | Nul gemelde productieafhankelijkheidskwetsbaarheden |
| Volledige `npm audit` | Zes high ontwikkeldependencyvermeldingen; vervolg `MNT-055` |
| Markdowninventaris en lokale documentlinks | 867 bestanden; 404 relatieve document-/beeldlinks gecontroleerd, nul ontbrekende bestemmingen |
| `git diff --check` | Geen whitespaceproblemen |

De documentlinkcontrole parseert niet-content-Markdown met remark en controleert
lokale bestandsbestemmingen; fragmentankers en externe URLs vallen hierbuiten.
Canonical contentlinks worden door de contentpipeline gevalideerd. De gehele
wijncorpus is niet opnieuw inhoudelijk gelezen. De productionbuild en
browsersuite draaien lokaal; productie en Node 24 zijn nog niet opnieuw getest.

Zelf de gewijzigde opslagflow controleren kan met
`npx playwright test e2e/storage-resilience.spec.ts` na een actuele build, of met
`npm run test:e2e` voor de hele keten. De drie regressies simuleren selectief
mislukte opslag terwijl lezen nog werkt. Normaal gebruik kun je controleren door
in Learn een les te markeren, naar het leerpad terug te gaan, te herladen en de
voortgang vervolgens te wissen. De kennisdiepteknoppen op een conceptpagina
moeten direct blijven reageren.
