# Beoordeling codebase-analyse — 2026-10-11

Review-ID: `QCR-2026-10-11-03`. Baseline: commit `d584315` (`feat: wineperceptie`),
schone werkboom. Scope: toetsing van de aangeleverde health check aan code,
canonical inventaris, policies en roadmap; beperkte veilige engineeringcorrecties.
Geen volledige wijnfeitenreview, productiemeting of externe GitHub-/Vercelcontrole.
Dit rapport bewaart het oordeel van vandaag; actuele uitvoering staat in de backlogs.

## Oordeel over de vijf bevindingen

**F1 — gezonde codebasis: eens.** De grenzen tussen authored content, strict
build, server-only repository en renderer zijn duidelijk. Verspreide UI-teksten,
herhaald corpuswerk en contentgerichte browsertests zijn werkelijke onderhouds-
kansen. Een bestand van circa 530 regels is op zichzelf geen refactorbewijs:
`content-document.tsx` heeft al herkenbare functies voor inline nodes, blocks,
secties en documentpresentatie. Extra splitsing volgt een concrete wijziging of
complexiteitsprobleem, niet een regeltelling. Grootte van JSON en mediabestanden
op schijf is geen gemeten clientpayload.

**F2 — onboarding en documentlast: grotendeels eens.** De baseline heeft twintig
Markdownbestanden onder `docs/`, circa 58.500 whitespace-getelde woorden in plaats
van 75.000. De precieze telling verandert niets aan de navigatievraag. Policies,
domeincontracten, planning en reviews vragen een expliciete hiërarchie. Niet elk
document hoeft voor elke taak gelezen te worden; dat stond al in de project map.
De huidige `/verdiepingen`-routes zijn een bewust stabiliteitscontract: een Engelse
naam levert onvoldoende waarde om URLs te migreren. Lege `site`-/`vintage`-typen
zijn modelvoorraad; alleen werkelijk lege of verwarrende UI hoeft aangepast te
worden. `wine_style` is nog een uitgesteld kandidaat-type, geen geïmplementeerd leeg type.
Coverage-labelkeys horen bij het schema, normatieve dekkingsvragen bij
het authoringcontract; beide zijn niet automatisch overbodige duplicatie.

**F3 — schaalrisico: eens met meten, niet met vaste grenzen of oplossingen.**
De zoekcode normaliseert passagevelden opnieuw per query; dat verdient als eerste
meting aandacht. Maar 3× als grens, 2.500 entities als einddoel, halve seconden
zoekwerk en tientallen minuten build zijn scenario's, geen waarnemingen.
Samenstelling telt: registerproducenten, lange concepten en druiven hebben zeer
verschillende kosten. Compactie verkleint het JSON-bestand maar bewijst geen
kleinere gebundelde JS, snellere koude start of lager RAM.

De standaardlimiet voor Node-functions bij Vercel is 250 MB ongecomprimeerd,
maar inmiddels bestaat ook een optionele Large Functions-beta tot 5 GB. De
projectconfiguratie en daadwerkelijk getraceerde deploymentfiles zijn hier niet
gecontroleerd. Een enkele JSON-grootte bewijst geen overschrijding of veilige
marge; de beta is evenmin een reden om inefficiëntie te behouden.
Bron: [Vercel Functions limits](https://vercel.com/docs/functions/limitations).

Per-entity files en afgeleide SQLite/FTS zijn serieuze opties, geen gekozen
architectuur. De contentrepository is nu **synchroon**; lazy filesystem-I/O met
hetzelfde contract is niet vanzelfsprekend. Scheid een searchindex van een
canonical database-/CMS-migratie. Bepaal beeldvarianten op werkelijk gebruik;
2500 pixels als universele maximummaat kan onnodig kwaliteit verliezen.

**F4 — planning: eens met expliciete volgende fase, nuance bij opruimen.**
De bestaande roadmap had al performance, Atlas, backend en mondiale QA gepland;
het probleem was onvoldoende uitgewerkte timing en regionale vervolgscope.
`MNT-052` wordt daarom eerstvolgende ontwikkeltaak. Een `REG-*`-fase maakt
landen, druiven en publicatievoorwaarden zichtbaar. Verplaats afgeronde
Learn-tickets niet automatisch naar een los archief: `LRN-012` schrijft expliciet
voor dat ze in de Learn-roadmap blijven. Historische reviews behouden hun eigen
bewijs; actuele ticketstatus blijft bij één domeinbacklog.

**F5 — mondiale foundation: veel bruikbare gaps, geen automatische paginalijst.**
Wetgeving/oorsprongsbescherming, genetica/massale selectie, aanleg/leeftijd en
oogst/logistiek verdienen expliciete owners en uitvoerbare vervolgbatches.
De dertien actieve druiven zijn geselecteerd rond Bordeaux; dat maakt hun
geografische betekenis niet Bordeaux-exclusief. Druivenuitbreiding is nodig,
maar een quotum van veertig en producentachtige publicatievormen zijn nog geen
onderbouwde kwaliteitsoplossing. Toets eerst proportionele uitleg binnen de
huidige twaalf dimensies.

Twee negatieve corpusclaims kloppen niet: `regions/libournais/overview.nl.md`
bespreekt handpluk én machinale oogst; onder meer `appellations/bordeaux/overview.en.md`
gebruikt primary-aroma-terminologie. Dat is fragmentarische uitleg, geen bewijs
dat een centrale uitleg/anker al compleet is. Mendoza bestaat als draft;
Barossa niet. Een warm/droog contrast was al onderdeel van `EXP-027` en krijgt
nu een concrete voorlopige kandidaat, zonder regionaal onderzoek voor te wenden.

Klimaatklassen, aroma-oorsprong, vaten en stille wijn vragen eerst een ownership-
besluit in `EXP-026`: een goed vindbaar hubanker kan voldoende zijn. Geen extra
pagina uitsluitend voor symmetrie. Een wijngaardleerpad is een zinvolle kandidaat,
maar blijft afhankelijk van de echte pilotevaluatie in `LRN-012`.

## Eigen baselinecontrole

| Controle | Uitkomst vóór wijzigingen |
| --- | --- |
| Canonical inventaris | 359 entities, 295 actief; 8 narratives, 1 leerpad, 612 bronnen, 188 mediarecords |
| Gepubliceerde zoekindex | 302 documenten; totaal inclusief drafts 367 |
| JSON-schijfvolume | 17.263.177 bytes; compact dezelfde data 10.439.079 bytes zonder afsluitende newline |
| Compacte deelvolumes | Entities 5,82 MB; totale zoekindex 3,67 MB |
| Taalkeuzes | 282 `locale === "nl"`-voorkomens in non-test TS; geen telling van unieke berichten |
| Direct zoeken in Node | 36 queries, mediaan circa 66 ms, p95 circa 70 ms |
| Regiovoorraad | Zeven actief, zestien draft; geen landentities of Atlasdataset |

Zoekmeting: Node 24.21.0, `node --import tsx`, import van `searchKnowledge` uit
`src/content/search.ts`, actieve entries uit de gegenereerde index. Zes rondes
van `bordeaux`, `water`, `tannine`, `phylloxera`, `nonexistent-query`,
`cabernet sauvignon`, standaard NL; wall time met `performance.now()`.
Dit is een lokale microbenchmark, geen HTTP-/EN-/cold-startbenchmark of
capaciteitsgarantie. De reproduceerbare uitgebreide workload hoort bij `MNT-052`.
De externe analyse noemt mediavolumes en productiebundels; die precieze waarden
zijn hier niet opnieuw als eigen meting gepresenteerd.

## Dispositie van alle aanbevelingen

| Advies | Besluit en eigenaar |
| --- | --- |
| A1 commit EXP-025 | Al gebeurd: `d584315`; geen nieuwe commit nodig voor dat advies. |
| A2 externe CI/deploy | Terecht, blijft `MNT-056`; geen push, protectionwijziging of deployment in deze review. |
| A3 compact/check eenmaal | Uitgevoerd als `MNT-059`; parsed data gelijk, zelfstandig testen/typecheck blijven veilig. |
| A4 audit vóór 18 oktober | Behouden bij `MNT-055`; deze review vervangt geen actuele advisory-/releasecontrole. |
| A5 synthetische schaalmeting | Naar voren bij `MNT-052`; geïsoleerde unieke IDs, 1×/3×/8×, geen duplicate canonical packages. |
| A6 shards of SQLite | Besluit ná metingen bij `MNT-052`; sync contract, deployment tracing en caching expliciet toetsen. |
| A7 normalisatie/index | Experiment binnen `MNT-052`; vergelijk caching, buildprecomputatie en index inclusief geheugen en ranking. |
| A8 media uit git/CDN | Meten en kiezen bij `MNT-052`; volledige synchronisatie/rollback nodig, geen automatische 2500px-cap. |
| A9 UI-catalogus | Nieuw `MNT-061`; vóór derde taal of forse nieuwe UI, geen authored wijncontent dupliceren. |
| A10 E2E-archetypen | Nieuw `MNT-062`; behoud gerichte content-/linkregressies en test echte interactiegrenzen. |
| A11 landenmodel | Nieuw `REG-001`; oplossing en universele `part_of`-plicht nog niet besloten. Stabiele IDs verbieden geen latere parentrelatie. |
| A12 Atlaspilot | Bestond als `MNT-051`; regionale geografiestrategie aanvullend bij `REG-001`. |
| A13 lichte druiven/40 rassen | `REG-002`: prioriteren en contract toetsen, geen stilzwijgende verlaging of vaste quota. |
| A14 wijnrechthub | `REG-003`: scope, owners en afgebakende uitvoertickets; geen verzameling ongeverifieerde rechtssystemen. |
| A15 genetica/massale selectie | `REG-003`: bestaande uitleg/drafts hergebruiken en echte ontbrekende uitleg publiceren in eigen batch. |
| A16 oogst/aanleg/leeftijd | `REG-003`: eigenaarschap kiezen; ontvangsthub niet zonder scopebesluit met hele wijngaardfase uitbreiden. |
| A17 klimaat/aroma/vaten | Bestaande `EXP-026` uitgebreid met vindbaarheid/ownershipbesluiten; niet automatisch drie nieuwe pagina's. |
| A18 stille wijn | Ownerbesluit bij `EXP-026`; `winemaking-routes` en bestaande families eerst toetsen. |
| A19 warm/droog contrast | `EXP-027` verduidelijkt; Mendoza voorlopig, definitieve keuze in `DEC-EXP-005`. |
| A20 tweede leerpad starten | Nu niet bouwen; kandidaat bij `LRN-012`, vroegst 22 oktober met voldoende werkelijk gebruik. |
| A21 hiërarchie/taalregel | Nu toegevoegd aan project map; bestaande policies niet ongecontroleerd vertaald. |
| A22 status/historie | Productplanning ingekort; verdere consolidatie `MNT-060`, expliciete Learn-uitzondering behouden. |
| A23 labeltabellen | `MNT-060`: gedeelde verwijzing/generatie zonder verlies van dekkingsvragen. |
| A24 Engelse developer guide | Nu toegevoegd als korte, niet-normatieve request-flowgids. |
| A25 regionale roadmap | Nu `REG-001–005`, voorlopige pilots en definitie van gereed; verdere batches volgen pilotbewijs. |
| A26 docdrift | Layoutpad en architectuurindex nu hersteld; resterend authoring-/coverageonderhoud `MNT-060`. |

## Directe wijzigingen en verificatie

`MNT-059` serialiseert compact en laat `content:build -- --audit-relations`
dezelfde graph auditen. `check` voert één productiecorpusbuild uit en gebruikt
daarna direct Next-typegeneratie, TypeScript en Vitest. Standalone `npm test`,
`typecheck` en `content:relation-audit` behouden hun veilige voorbereidingspad.
De bestaande schema's, feitelijke content, renderer en URL-contracten wijzigen niet.

Documentatie: hiërarchie/taalregel, korte Engelse gids, gecorrigeerd layoutpad,
centrale documentindex en kortere productplanning. Nieuwe open acties zijn
`MNT-060–062` en `REG-001–005`; bestaande `MNT-052`, `EXP-026/027` zijn aangescherpt.
Geen SQLite-, CMS-, CDN-, landenmodel- of publicatievormmigratie uitgevoerd.

Verificatie op 2026-10-11:

- `npm run format` en `npm run check` geslaagd: lint, typegeneratie, TypeScript,
  relation-audit en alle 148 unit-tests. Het checklog bevat één productiecorpusbuild.
- Compacte bundle 10.439.080 bytes inclusief newline: **39,53% minder schijfbytes**.
  SHA-256 van opnieuw geserialiseerde parsed JSON vóór en na is gelijk:
  `7e1dab5242fb27c46c85fc10237c5588a2353572685c49da41d3105445ff19f0`.
- Tijdelijke CLI-fixture: een schema-/documentgeldige actieve orphan-site bouwt
  zonder audit; zowel `build --audit-relations` als `relation-audit` geeft exitcode
  1 met de ontbrekende-relatiefinding. Een onbekende buildflag geeft ook exitcode 1.
  De tijdelijke fixture is verwijderd; canonical content is niet aangepast.
- Webpack-productiebuild geslaagd. De volledige Playwright-suite slaagt met
  **161/161 tests**. De sandbox blokkeerde eerst het openen van testpoort 3100;
  dezelfde gebouwde app is daarna succesvol getest met toegestane lokale
  serverrechten, zonder een onnodige tweede build.
- Lokale documentlinks, backlogtellingen en `git diff --check` gecontroleerd.
  Geen actuele npm-advisoryhercontrole of externe deploymentclaim; die blijven
  respectievelijk `MNT-055` en `MNT-056`.

Om zelf te herhalen: `npm run check` en `npm run test:e2e`. De interface hoort
hetzelfde te blijven; deze ronde verandert buildwerk en planning, geen wijnpagina's.

