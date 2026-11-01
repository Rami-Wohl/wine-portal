# Atlas: schaalbaarheid en onderhoudbaarheid — 2026-11-01

Review-ID: `QCR-2026-11-01-01`

Branch `feat/attempt-at-atlas` (laatste commit `f8b0be6`). Rol: reviewer voor
schaalbaarheid en onderhoudbaarheid in het vierrollenteam onder de
orchestrator. Deze review wijzigt geen code; bevindingen lopen via de
orchestrator naar de bouwer.

## Reikwijdte en methode

Toetsvraag: hoe ver draagt de huidige Atlas-oplossing richting het einddoel
(orde 15 landen, 150+ regio's met subregio's, 1.500+ appellaties, extra
oriëntatielagen uit fase 4 van het contract, meer talen, jaren redactioneel
onderhoud door een klein team), waar breekt, vertraagt of verduurt zij, en in
welke volgorde moet dat worden aangepakt.

Gelezen als bindend kader: `AGENTS.md`, `docs/project-map.md`,
[het Atlas-contract](../docs/atlas-plan.md) (§2–§11), `docs/geography-policy.md`,
`docs/knowledge-architecture.md`, `docs/product-principles.md`,
`docs/developer-guide.md`, `docs/performance-budgets.md`,
`data/geography/README.md`, `docs/quality-assurance.md` en de reviews
[release één](atlas-release-one-review-2026-10-31.md) en
[UX-ronde A](atlas-ux-round-a-review-2026-10-31.md).

Geïnspecteerd: de hele datapijplijn (`manifest.yaml`, beide mappings, de
features per soort, de acht scènes, `fetch.ts`, `import.ts`, `build.ts` en
alle modules in `scripts/geography/lib/`), de contentintegratie
(`scripts/content/pipeline.ts`, `scripts/content/pipeline/geography.ts`), model
en repository (`src/content/model/geography.ts`, `src/content/geography.ts`),
routes (`src/app/[lang]/atlas/**`, de Atlas-tegel op `src/app/[lang]/page.tsx`),
componenten (`src/components/atlas/**`), stijlen (`src/styles/atlas.css`, het
Atlas-blok in `responsive.css`), `next.config.ts`, de ESLint-grensregel en alle
Atlas-tests.

Metingen (alleen lezend; geen build, geen `npm run check`, geen Playwright,
geen serverbeheer):

- `npm run content:check` (3,45 s wandklok) en een CPU-profiel van
  `buildContent({ write: false })`;
- een simulatie van `buildAtlasDisplay` met strakkere scènebudgetten op de echte
  invoer, zonder iets te schrijven;
- groottes van `src/generated/geography/**` (ruw en `gzip -9`) en een
  ontleding van `index.json` per veld;
- vertexanalyse van de gegenereerde paden (aandeel per laagrol, aandeel buiten
  het kader, effect van relatieve padcodering);
- vier `GET`-verzoeken naar de previewserver op poort 3104 (`/atlas`,
  `/atlas/medoc`, `/atlas/bordeaux`, `/appellations/pauillac`) en analyse van
  HTML tegen RSC-payload;
- de bestaande productie-uitvoer in `.next/server/app` van de bouwer (build van
  2026-11-01 11:02);
- `npx vitest run` op de Atlas-tests (12 bestanden, 182 tests, 0,53 s),
  `npx tsc --noEmit` en `npx eslint` op het Atlas-gebied (beide schoon);
- `git count-objects` en de omvang van de gecommitte geografie.

Scratchbestanden staan buiten de repository; er is geen bestand in de werkboom
gewijzigd behalve dit rapport. Regelverwijzingen gelden voor commit `f8b0be6`.
Tijdens deze review werkte de bouwer aan het portaal in
`src/content/geography.ts` en `src/content/model/geography.ts`; die wijzigingen
vallen onder fase 2 van deze review.

## Samenvatting

De data- en provenancelaag draagt ver: strikte schema's, vastgepinde bronnen,
checksums, `held`-status, berekende dekking en een gedeelde recordpijplijn
schalen naar honderden bronnen zonder herontwerp, en moeten blijven zoals ze
zijn. De weergave- en afleverlaag draagt echter tot ongeveer twintig scènes. Bij
circa 19 scènes overschrijdt `index.json` het harde budget van 20 KiB gzip en
faalt `content:build`, en daarmee `dev`, `test`, `typecheck`, `build` en
`check` (SCL-01). Daarnaast zit iedere kaart volledig en dubbel (als HTML en
als RSC-payload) in elke pagina die haar toont. `/atlas/medoc` is 1,05 MB
HTML (360 KB gzip) voor een scène van 497 KB. De Pauillac-pagina kost 3,0 MiB
prerender-uitvoer tegen 80 KiB voor een appellatiepagina zonder kaart; op
einddoelschaal is dat ordegrootte 5–10 GiB buildoutput en zo'n 400 KB gzip per
appellatiepagina, zonder caching tussen pagina's (SCL-02, SCL-03). Wat het meest
uitmaakt: haal de scènegeometrie uit de pagina-payload. Lever één bijgesneden,
compact gecodeerde en cachebare weergave per scène en detailniveau, zodat
paginagewicht en buildomvang niet langer meegroeien met het product van
paginatal en scènegrootte. Goedkope voorstappen (bijsnijden tot het kader,
relatieve padcodering, grover detail voor oriëntatielagen) halveren de payload
al zonder architectuurbesluit. Eén punt is geen bouwvraag maar een
contractvraag: boven het regioniveau (land, wereld) bestaat nog geen toegestane
kaartvorm. Dat moet de gebruiker beslissen voordat het portaal kaarten op dat
niveau toont (SCL-05).

## Bevindingen

Ernst: **hoog** = breekt of wordt onjuist vóór of bij de volgende uitbreiding;
**midden** = maakt groei merkbaar duurder of trager; **laag** = netheid,
drift of kleine kosten.

| ID | Ernst | Gebied | Bevinding en bewijs | Gevolg op eindschaal | Aanbeveling |
| --- | --- | --- | --- | --- | --- |
| SCL-01 | hoog | Build, index | `index.json` is 45.756 B, 8.178 B gzip voor 8 scènes: ≈ 1,0 KiB gzip per scène. `AtlasSceneSummary` is `Omit<AtlasSceneView, "layers">` (`src/content/model/geography.ts:509`), dus de index draagt per scène ook credits (10.688 tekens totaal), dekkingslijsten (4.786), het simplificatierecord met de lange methodezin (4.321), projectie en bbox, naast de miniaturen (20.859 van 45.603 tekens). Het budget van 20 KiB is een harde fout (`scripts/geography/lib/display.ts:58`, `:643–651`) die `content:build` laat falen; die draait in `predev`, `pretest`, `pretypecheck`, `prebuild`, `check` en `test:e2e` (`package.json`). | Bij ≈ 19–20 gepubliceerde scènes stopt elke ontwikkel- en testopdracht. Bij 150 scènes ≈ 150 KiB gzip. Het portaal dat nu wordt gebouwd, raakt deze grens als eerste. | Beperk de samenvatting tot wat consumenten lezen (`id`, `owner`, `slug`, dekkingstellingen plus `coverage.intended`, `selectableEntities`, oriëntatievlaggen, zie SCL-05). Zet miniaturen in een eigen bestand of per scène. Vervang het totaalbudget door een budget per scènesamenvatting, gemeten en vastgelegd in contract §7. |
| SCL-02 | hoog | Aflevering, pagina's | Iedere SVG-padtekst staat twee keer in de pagina: als HTML en in de RSC-payload (`self.__next_f`). Gemeten op poort 3104: `/atlas/medoc` 1.051.590 B (360 KB gzip, RSC-deel 535 KB) voor een scène van 497.277 B; `/appellations/pauillac` 1.221.530 B (400 KB gzip); de langste padstring komt telkens 2× voor. Prerender: `pauillac.html` 1,22 MB, `.rsc` 0,62 MB, segment 0,62 MB; samen 3,0 MiB, tegen 80 KiB voor de Amarone-pagina zonder kaart. 94 entiteitspagina's bedden een kaart in (78 appellaties, 16 regio's); bestanden > 400 KiB vormen 145 van 267 MiB `.next/server/app`. Het scènebudget van 250 KiB (§7) meet het bestand, niet wat de lezer ontvangt (≈ 2×). | 1.500 appellaties en 150 regio's in twee talen geven ≈ 3.300 kaartpagina's van 1,5–3 MiB: ordegrootte 5–10 GiB prerender, en lange buildtijden. Elke appellatiepagina ≈ 400 KB gzip. Pagina's delen niets: wie Pauillac en daarna Margaux leest, laadt de Médoc-kaart twee keer. | Ontkoppel geometrie van de pagina. Spike: per scène en detailniveau één onveranderlijk, gehasht SVG-bestand dat de build schrijft, met in de pagina alleen de interactieve laag (links met `data-feature-id`, namen, labels), bijvoorbeeld via `<a><use href="…svg#id"/></a>`. Toets daarbij no-JS-selectie, geforceerde kleuren, hover en `elementsFromPoint`. Geef ingebedde kaarten minimaal een eigen, grover detailniveau. Voeg een budget toe op pagina-HTML (gzip), niet alleen op het scènebestand. |
| SCL-03 | hoog | Build, weergave | De ladder (`display.ts:63`, `:463–545`) stopt bij de eerste trede onder het budget, dus het budget is het doel: 6 van 8 scènes staan op 0 px (Blayais-Bourgeais 20.522/20.602 vertices voor 8 features). 51 % van de Médoc-vertices ligt meer dan 5 % buiten het kader (Fronsadais 89 %, Libournais 49 %, Blayais 44 %), terwijl `clampView` (`src/components/atlas/map-view.ts:73`) het beeld binnen het kader houdt: die geometrie is nooit zichtbaar. Oriëntatie domineert: water is 73 % van de Médoc-padbytes en 70 % bij Champagne; het overkoepelende Bordeaux-gebied is 62 % bij Fronsadais. Paden zijn absoluut met één decimaal; relatieve codering (zoals `encodeRings`, `scripts/geography/lib/thumbnail.ts:118`) brengt Médoc in een proefmeting van 168,6 naar 89,4 KB gzip. Met een budget van 60 KiB zakt Bordeaux van 172,9 naar 50,5 KiB (1 px) en Médoc naar 58,3 KiB. | Zonder deze stappen groeit de payload van SCL-02 lineair mee met elke rivier, kustlijn en elk overkoepelend gebied; subregio's, die vrijwel alle geometrie buiten beeld hebben, zijn het duurst. | Snijd weergavegeometrie bij tot kader plus marge (`clipRing`, `thumbnail.ts:49`, bestaat al; voeg een lijnclipper toe). Leg dat als weergavestap vast; canonieke records blijven ongemoeid. Gebruik een tolerantie per rol (oriëntatie grover dan appellaties), afgeleid van wat bij `MAX_ZOOM` (8) zichtbaar is in plaats van van het budget. Codeer relatief. Verplaats `pathBounds` (`labels.ts:92`, regex over alle padtekst per render) naar de build, want relatieve paden breken die functie. |
| SCL-04 | midden | Build, ontwikkelsnelheid | De weergavebuild draait ongecached in iedere contentbuild en contentcheck (`scripts/content/pipeline.ts:63`): 0,82 s van 3,0 s `buildContent` (26 %, CPU-profiel) voor 8 scènes en 86 features, ≈ 100 ms per scène inclusief een gzip per laddertrede. | 150–200 scènes met grotere featuresets: naar schatting 15–30 s extra op elke `npm test`, `typecheck`, start van `dev`, `build` en `check`. Dat maakt de dagelijkse lus van een klein team traag. | Cache per scène op een invoerhash (scène-YAML, `sha256` van de records, versie van de buildcode) in een gitignored map. Draai de weergavebuild alleen wanneer geografie of buildcode wijzigt; overweeg worker-parallelisme. Voeg de geografie toe aan de benchmark (zie SCL-16). |
| SCL-05 | hoog | Contract, portaal | (a) `/atlas` (`src/app/[lang]/atlas/page.tsx:43–50`) en de home (`src/app/[lang]/page.tsx:30–38`) lezen elk scènebestand om twee vlaggen (water, plaatsen) te bepalen; de scènemetadata laadt de hele scène (`[scene]/page.tsx:44–45`). Dat schendt contract §8 ("never all at once"); de logica staat drie keer. De home noemt alle regionamen in één zin (`page.tsx:48`). (b) Boven de regio bestaat geen toegestane kaartvorm: regio-omtrekken zijn verboden (§1.3), een appellatiemozaïek op landsniveau past niet (Bordeaux haalt met 63 features al 173 KiB bij 0,25 px; in de simulatie past Champagne zelfs bij 8 px niet in 30 KiB). De projectie is `z.literal("mercator")` (`model/geography.ts:289`) en de miniatuur gaat uit van een kale Mercator (`display.ts:321–325`). Het model kent geen land: `ENTITY_TYPES` heeft geen `country` en bijvoorbeeld `region.mosel` heeft `relations: []`. | (a) Bij 150 scènes ≈ 40+ MB JSON parsen voor één zin, per taal en per pagina, plus een home-tekst van 150 namen. (b) Het portaal moet landen en werelddelen tonen zonder dat vastligt wat er getekend mag worden; het risico is dat de UI dan zelf grenzen, groeperingen of omtrekken verzint. | (a) Neem oriëntatievlaggen op in de scènesamenvatting en bied één repositoryfunctie; tel regio's op de home in plaats van ze op te sommen. (b) Leg aan de gebruiker voor welke vormen op land- en wereldniveau zijn toegestaan (punten of labels op verankerde locaties, miniaturen, een geverifieerde basiskaart met landsgrenzen uit een beoordeelde bron) en waar de landgroepering vandaan komt (landentiteit of ISO-code op de regio, uit de graph, niet uit UI-constanten). Leg het besluit vast in contract §2 en §11. |
| SCL-06 | hoog | Import | De import kent twee hardgecodeerde tabellen en geen bronadapter: `importAll` (`scripts/geography/import.ts:35–47`), `--only=appellations\|orientation` (`:79`), INAO-sleutels in het schema (`lib/mapping-schemas.ts:36`, `id_app`), `VERIFIABLE_KEY_FIELDS` (`lib/shapefile.ts:118`) en IGN-specifieke `cleabs`-volgorde (`lib/orientation.ts:83`). De beperkingstekst staat per soort en noemt INAO en BD CARTO (`lib/record.ts:145–156`). De gedeelde recordpijplijn (`record.ts`, `validate.ts`) is wel bronneutraal. | Elk nieuw land of nieuwe bron (Italiaanse regionale geoportalen, Spaanse DO-bestanden, Amerikaanse AVA's) vraagt een nieuwe tak in `import.ts` en een nieuwe CLI-vlag, en maakt de soortbrede beperkingstekst onjuist voor alle andere records. | Introduceer een `SourceAdapter`-interface: lees resource → kandidaatrijen met sleutel → match tegen mapping → gedeelde `buildRecord`. Eén mapping per bron of land; de beperkingstekst per bron of mapping in plaats van per soort. Doe dit vóór de eerste niet-Franse bron (fase 4). |
| SCL-07 | hoog | Copy, juistheid | De legendadefinitie van een appellatiegebied is één INAO-tekst voor alle scènes (`src/components/atlas/copy.ts:166`, `:288`). `compareAreaNames` haalt alleen `AOP`/`AOC` weg (`copy.ts:385`). Het recordveld `meaning` (`geographical-production-area`) wordt in de UI niet gebruikt. | De eerste scène met DOC-, DO- of AVA-gebieden zegt dan iets onjuists over bron en betekenis. Dat botst met het onderzoeksbeleid en met contract §9 (legenda verklaart betekenis en bron), en met internationale namen sorteert de lijst verkeerd. | Koppel de legendaverklaring aan `meaning` plus bron, met copy per betekenis. Laat de build falen bij een `meaning` zonder copy. Maak het prefixfilter een lijst per bron of rechtsstelsel. Klein werk, maar het moet klaar zijn vóór de eerste niet-Franse scène. |
| SCL-08 | midden | Redactioneel onderhoud | Een nieuwe regio vraagt handwerk op zes à acht plekken: scène-YAML met featurelijsten én `intended_entities`, die bij Médoc gelijk zijn aan de selecteerbare laag (8 = 8); een mappingregel per appellatie; ≈ 15 regels per oriëntatiefeature (`ign-orientation.yaml`, 707 regels voor 47 features); ≈ 46 regels manifest per WFS-verzoek, met licentie, uitgever en CRS 20× herhaald (1.057 regels voor 22 resources); `geography_id` op elke entiteit; het e2e-register met een redactionele statusopmerking (`e2e/atlas.spec.ts:216–235`); en `ATLAS_OVERVIEW_SCENE_ID` (`src/content/geography.ts:217`). De validatie controleert alleen dat een gepubliceerde beoogde entiteit in een laag staat (`scripts/content/pipeline/geography.ts:176–192`), niet dat een appellatie die `part_of` de regio is in de scène ontbreekt. | 150 regio's: stille dekkingsgaten wanneer een appellatie wel in de graph maar niet in de scène wordt toegevoegd; een manifest van ≈ 1.500 resources en ≈ 70.000 regels in één bestand, dat bij parallel werk merge-conflicten oplevert. | Valideer `intended_entities` tegen `part_of`-relaties (fout of expliciete uitzondering) en leid de standaardlijst af uit de graph. Normaliseer het manifest (datasetblok plus verzoeken) en splits het per bron of land. Bundel oriëntatieverzoeken per envelop. Genereer het e2e-register uit `index.json` en de entiteitstatus. |
| SCL-09 | midden | Identiteit oriëntatie | Oriëntatie-ID's zijn regio-loos (`geo.river.garonne`), maar de geometrie is bijgesneden tot één envelop (`envelope: bordeaux` in `manifest.yaml`). | Zodra een tweede regio (Sud-Ouest, Cahors, Bergerac) dezelfde rivier nodig heeft, botst de identiteit of wordt de bijsnijding stilzwijgend verbreed. | Leg vóór de volgende regio vast: één record per rivier met een ruime, gedeelde bijsnijding, of een record per envelop met een eigen ID. Dat besluit hoort bij de geodata-eigenaar; leg het vast in contract §6. |
| SCL-10 | midden | Uitbreidbaarheid lagen | Soorten en rollen zijn gesloten en verspreid: `GEOGRAPHY_KINDS` en `GEOGRAPHY_KIND_GROUPS` (`model/geography.ts:15`, `:40`), `AtlasLayerRole`, `sceneLayerRole`, de regel dat `intended_entities` `appellation.` moet zijn, rolfilters in `display.ts` (fit, miniatuur, `areaRank`), de vulkeuze in `FeatureShape` (`atlas-scene.tsx:137–142`), `byRole` (`:207–212`), het `Role`-type van de labelplanner (`labels.ts:111`), legenda, copy en CSS. | Reliëf, aanplant, producentpunten en druivenverspreiding (fase 4) raken elk ongeveer tien bestanden. Reliëf is bovendien raster en past niet in het padmodel. | Eén registertabel per laagsoort (groep, rol, geometrie, legendasleutel, labelbeleid, stijlklasse) waaruit schema, build en component lezen. Maak reliëf een apart assettype. Backlog voor fase 4, niet nu. |
| SCL-11 | midden | Runtime, deployment | De scènecache in de repository is onbegrensd (`src/content/geography.ts:112–121`). In ontwikkeling trekt `require(\`…/scenes/${id}.json\`)` alle scènes in de modulegraaf (`:94`). De tracing neemt alle geografie op voor elke route (`next.config.ts:14`, `"/*"`). | Bij 150 scènes van 250–500 KB komt 40–75 MB JSON in iedere serverfunctie, naast de kennisbundel van 11 MB. Buildworkers houden alle geparste scènes vast; de dev-server herbouwt bij elke scènewijziging alles. | Begrens de cache (LRU) of laat hem weg; beperk de tracing tot Atlas- en entiteitsroutes; lees in ontwikkeling via `fs` met een watcher. Vervalt grotendeels als SCL-02 de geometrie naar statische assets verplaatst. |
| SCL-12 | midden | Talen | `atlasCopy` geeft Engels voor elke taal behalve `nl` (`copy.ts:289–290`), dus een derde taal valt stil terug. De routes hebben 16 inline `locale === "nl" ?`-ternaries (8 in `atlas/page.tsx`, 8 in `[scene]/page.tsx`), plus de home. `display.ts:104` en `:163` typen namen als `Record<"nl" \| "en">` in plaats van `Locale`; de collatorkeuze staat hardgecodeerd (`copy.ts:305`). | Een nieuwe taal betekent zoeken in routes en componenten; TypeScript waarschuwt niet. | `Record<Locale, AtlasCopy>`, zodat de compiler volledigheid afdwingt. Routecopy verhuist naar `copy.ts`; overal `Locale` in plaats van `"nl" \| "en"`. Het `AtlasCopy`-interface zelf is goed en moet blijven. |
| SCL-13 | midden | Grenzen, hergebruik | `AtlasScene` (470 regels) is component en viewmodel tegelijk: vier aanroepen van `getEntityById` (`atlas-scene.tsx:48`, `:198`, `:215`, `:223`) voor links, status, namen en de onbeschikbaarheidsmelding, plus labelplanning in de render. Tests moeten de repository mocken (`entity-atlas.test.tsx:7–11`) of lezen de echte kennisbundel. | Het portaal hergebruikt kaarten in kaarten, overzichten en inbeddingen; zonder een pure resolutiestap kopieert elke variant de resolutielogica. | Maak een pure functie `resolveSceneView(scene, locale, lookups)` naast de repository; houd componenten puur op props. Verplaats de labelplanning naar de build zodra SCL-03 de paden verandert. |
| SCL-14 | laag | Stijlen | `atlas.css` (1.116 regels) is 7,3 KB gzip van de globale stylesheet van 17,4 KB gzip en laadt op elke pagina (`src/app/globals.css:15`). Vijf TS-constanten worden met de hand gelijk gehouden met CSS (`labels.ts:48–52`, `:74`, `:130`); het breekpunt 980/981 staat op drie plekken (`atlas-scene-enhancer.tsx:52–54`, `responsive.css:324–327`, `atlas.css`), zonder test. | Iedere nieuwe laag of kaartvariant groeit de globale CSS voor alle pagina's; een stille afwijking tussen TS en CSS verschuift labels zonder dat een test faalt. | De importvolgorde valt onder `docs/design-system-plan.md`; leg routeniveau-CSS daar als vraag voor in plaats van het hier te beslissen. Laat één unittest `atlas.css` lezen en de gedeelde constanten en het breekpunt toetsen. |
| SCL-15 | laag | Canonieke opslag | Coördinaten met 8 decimalen (≈ 1 mm), Prettier-opgemaakt (Pauillac: 2.077 regels voor 1.756 vertices). Drie byte-identieke vormen van 231 KB (Bordeaux, Bordeaux supérieur, Crémant de Bordeaux). Checksums hangen af van de Prettier-versie (`data/geography/README.md:62–64`). Gecommitte geografie: 13,9 MB in 204 bestanden (features 1,5 MB gzip); de repository telt al 377 MiB aan objecten. | Een Prettier-upgrade dwingt een herimport en checksumreview van alle 1.500+ records af. Bij ≈ 64 KB per appellatie groeit de werkboom naar ≈ 100 MB, en iedere nieuwe editie herschrijft de bestanden in de geschiedenis. | Schrijf canonieke GeoJSON met een eigen deterministische serializer en sluit `data/geography/features/` uit van Prettier (zoals `raw/` al is), zodat checksums gereedschapsonafhankelijk zijn. Leg 7 decimalen (≈ 1 cm) voor als geografiebeleidsvraag. Tweelingvormen blijven per entiteit (geen lenen), zoals besloten. |
| SCL-16 | laag | Documentatiedrift, dode code | Het voorbeeld in contract §5 zet water vóór context (`docs/atlas-plan.md:189–202`); werkelijk is de volgorde context → appellaties → water → plaatsen (README `:46–48`). §8 "never all at once" wordt geschonden (SCL-05a). `docs/developer-guide.md:34–39` noemt alleen `repository.ts` als lezer van gegenereerde data en niet `src/content/geography.ts`; het kernschema in `docs/project-map.md` mist `src/generated/geography`. `docs/performance-budgets.md:46–47` houdt geografie buiten de benchmark, waardoor schaal niet gemeten wordt. `getAtlasFeatureForEntity` wordt alleen in tests gebruikt (`src/content/geography.ts:193–198`). `thumbnail?` is optioneel "so older index files … still read" (`model/geography.ts:511–512`) voor een gitignored, altijd herbouwd bestand. | Nieuwe teamleden en agents werken vanuit documenten die de code niet meer beschrijven. Zonder geografische benchmark blijven de grenzen van SCL-01 tot en met SCL-04 onzichtbaar tot ze breken. | Synchroniseer §5, §8, de developer guide en de project map. Verwijder de ongebruikte functie en de optionaliteit. Voeg een synthetisch geografisch fixturecontract toe aan de benchmark (1×/3×/8× scènes). |
| SCL-17 | laag | Tests | Unittests: 182 in 12 bestanden, 0,53 s, met waardevolle generieke checks (pipelinetermen op de echte Bordeaux-scène, determinisme, budgetten). E2e: 84 tests, 1.289 regels; het scèneregister staat hardgecodeerd (`atlas.spec.ts:216–235`); typen worden gedupliceerd in plaats van uit het model geïmporteerd (`:9–33`); de afwezigheid van het verwijderde `[data-engaged]` wordt nog getoetst (`:441`); de lus over alle actieve scènes (`:1024`) groeit lineair mee. Geen test bewaakt het paginagewicht of het budget per scènesamenvatting. | Bij 150 scènes groeit de e2e-looptijd lineair, en de grenzen die er echt toe doen (SCL-01, SCL-02) zijn niet getest. | Leid het register af uit de gegenereerde index en de entiteitstatus; neem bij schaal een vaste steekproef plus de randgevallen. Importeer modeltypen. Voeg buildtests toe op HTML-gzip per kaartpagina en op de indexgrootte per scène. |

## Wat goed is

Dit moet blijven; het is de reden dat de oplossing te repareren is in plaats
van te vervangen.

- **Provenance als data.** Elk record draagt bron, editie, sleutel,
  transformaties, beperking en reviewstatus, gevalideerd met strikte zod-schema's
  en tweerichtingscontrole tussen `owner` en `geography_id`
  (`scripts/content/pipeline/geography.ts:59–143`). Bij 1.500 records is dit
  goud waard; versoepel het niet om sneller te importeren.
- **Vastgepinde bronnen en eerlijke statussen.** Checksums op bytes en
  bestanden, `held` met verplichte reden, geen stille vervanging. Een
  gewijzigde download faalt. Dit schaalt naar elke bron.
- **Gedeelde recordpijplijn.** `record.ts` en `validate.ts` zijn bronneutraal
  (reprojectie met expliciete aslijnvolgorde, ringoriëntatie, afronding,
  topologiecontrole). Een bronadapter (SCL-06) bouwt hierop voort.
- **Projectie en vereenvoudiging op buildtijd.** De client krijgt geen
  geobibliotheek; de Atlas-chunk is 8,3 KiB gzip (budget 15). Server-render
  van Médoc kost 2,5 ms en labelplanning 1,3 ms, dus rekenkracht is geen
  probleem. Dit model (vooraf geprojecteerd, gedeelde planner voor server en
  client) is juist.
- **Berekende dekking en `areaRank`.** Geen handgetypte claims; de kiezer
  heeft geen geometrie nodig op runtime.
- **Eén runtime-ingang met ESLint-grens.** `src/content/geography.ts` is
  `server-only` en `scripts/eslint/content-boundaries.mjs` dwingt dat af. Houd
  deze grens aan wanneer de geometrie naar statische assets verhuist.
- **Deterministische, atomische output.** Scènes eerst, index als laatste,
  oude bestanden opgeruimd (`scripts/geography/lib/output.ts:30–53`). De
  build faalt met een concrete boodschap ("Split the scene…") in plaats van
  stil te degraderen.
- **Getypte copy per taal.** Het `AtlasCopy`-interface dwingt de structuur af;
  alleen de keuzefunctie moet `Record<Locale, …>` worden (SCL-12).
- **Snelle, gerichte unittests** die echte data gebruiken waar het telt
  (generieke copycheck) en fixtures elders. De e2e-tests lezen tellingen en
  ankers uit de gegenereerde scènes in plaats van getallen hard te coderen.
- **Miniatuurbouw.** Bijsnijden, rastersnap, relatieve codering en ontdubbeling
  in `thumbnail.ts` zijn precies de technieken die SCL-03 voor de scènes
  vraagt: hergebruik ze.

## Aanbevolen volgorde

Ticketnummers kent de orchestrator toe. "Nu" betekent vóór of tijdens het
portaalwerk; "daarna" vóór de volgende regiobatch; "backlog" mag wachten op de
fase waarin het nodig is.

| # | Wanneer | Voorgestelde tickettitel | Scope in één regel | Bevindingen |
| --- | --- | --- | --- | --- |
| 1 | Nu | Atlas-index afslanken en budget per scène | Samenvatting beperken tot wat consumenten lezen, oriëntatievlaggen toevoegen, miniaturen apart, budget per scène in §7; pagina's laden nooit meer alle scènes | SCL-01, SCL-05a |
| 2 | Nu | Legenda en sortering per betekenis en bron | Legendaverklaring via `meaning` en bron, buildfout bij ontbrekende copy, prefixfilter per rechtsstelsel | SCL-07 |
| 3 | Nu | Scènegeometrie bijsnijden en compact coderen | Bijsnijden tot kader plus marge, tolerantie per rol op basis van zichtbaarheid, relatieve padcodering, padgrenzen naar de build | SCL-03 |
| 4 | Nu (besluit) | Contractbesluit: kaartvormen boven het regioniveau | Gebruikersbesluit over wat het portaal op land- en wereldniveau mag tekenen en waar de landgroepering vandaan komt; vastleggen in §2 en §11 | SCL-05b |
| 5 | Daarna | Spike: scènegeometrie als cachebaar asset met detailniveaus | Geometrie uit HTML en RSC halen (gehasht SVG per scène en detailniveau, `<use>` of overlay), grover niveau voor inbedding, budget op pagina-gzip; no-JS, geforceerde kleuren en kiezer behouden | SCL-02, SCL-11 |
| 6 | Daarna | Scènedekking afleiden uit de graph | `intended_entities` valideren tegen `part_of`, standaard afleiden, e2e-register genereren | SCL-08, SCL-17 |
| 7 | Daarna | Manifest normaliseren en oriëntatie-identiteit vastleggen | Datasetblok plus verzoeken, splitsen per bron of land, verzoeken per envelop bundelen; ID-beleid voor rivieren en meren over enveloppen | SCL-08, SCL-09 |
| 8 | Daarna | Incrementele Atlas-build en geografische benchmark | Cache per scène op invoerhash, weergavebuild alleen bij wijziging; synthetisch geografisch fixturecontract in de benchmark | SCL-04, SCL-16 |
| 9 | Vóór de eerste niet-Franse bron | Bronadapters voor de geografie-import | `SourceAdapter`-interface, mapping per bron of land, beperkingstekst per bron | SCL-06 |
| 10 | Backlog | Taalonafhankelijke Atlas-copy | `Record<Locale, AtlasCopy>`, routecopy naar `copy.ts`, `Locale` in plaats van `"nl" \| "en"` | SCL-12 |
| 11 | Backlog | Pure resolutiestap voor scèneweergave | `resolveSceneView` naast de repository, componenten puur op props | SCL-13 |
| 12 | Backlog (fase 4) | Register van laagsoorten | Eén tabel per soort voor schema, build, component, legenda en stijl; reliëf als apart assettype | SCL-10 |
| 13 | Backlog | Canonieke serializer zonder Prettier-koppeling | Eigen deterministische GeoJSON-uitvoer, features uit Prettier, precisievraag aan geografiebeleid | SCL-15 |
| 14 | Backlog | Atlas-stijlen en gedeelde constanten | Test op TS/CSS-constanten en breekpunt; vraag over routeniveau-CSS naar het design-system-plan | SCL-14 |
| 15 | Bij de volgende documentronde | Atlas-documentatie en opruiming | §5-voorbeeld, §8, developer guide, project map; `getAtlasFeatureForEntity` en optionele `thumbnail` weg; e2e-typen uit het model | SCL-16, SCL-17 |

Toelichting op de volgorde. 1 is de enige harde breuk op korte termijn en hangt
direct samen met het portaal. 2 is klein en voorkomt een onjuiste uitspraak
zodra er buiten Frankrijk wordt gekarteerd. 3 halveert de payload zonder
architectuurbesluit en maakt 5 kleiner en eenvoudiger te meten. 4 is een besluit
en geen bouwwerk; het portaal mag op land- en wereldniveau niets tekenen wat
het contract niet toestaat. 5 is de belangrijkste structurele wijziging, maar
heeft een spike nodig omdat no-JS-selectie, geforceerde kleuren en de kiezer
moeten blijven werken. 6–9 horen vóór de tweede regiobatch; 9 uiterlijk vóór de
eerste niet-Franse bron.

## Opmerkingen over het portaal

Fase 2, dezelfde dag, op de werkboom van de bouwer na `MNT-078` (niet
gecommit). Regelverwijzingen in deze sectie gelden voor die werkboom.
Gelezen: `src/content/geography.ts` (nu 412 regels), `atlas-portal.tsx`,
`atlas-portal-finder.tsx`, `portal-match.ts`, `fixtures/portal-scale.ts`, de
portaltests, de nieuwe `src/app/[lang]/atlas/page.tsx`, de copy-diff en het
schaalblok in `e2e/atlas.spec.ts`.

Gecontroleerd: `npx vitest run` op het Atlas-gebied (193 tests, 0,56 s, groen),
`npx tsc --noEmit` en `npx eslint` (schoon), `GET /atlas` en `/en/atlas` op
poort 3104 (71.250 B, 15,8 KB gzip; prerender `atlas.html` 71 KB plus
`atlas.rsc` 37,5 KB), de clientchunks van de nieuwe build (11:59), en een
probe van `buildAtlasPortal` met een cyclus in een tijdelijke test (daarna
verwijderd).

### Oordeel

**Ship after fixes.** Het portaal zelf schaalt goed. Het leest alleen
samenvattingen, kost onder 700 B per knoop exclusief miniaturen en rekent in
lineaire tijd op een paar honderd knopen. `/atlas` gaat van 1,17 MB (371 KB
gzip) naar 71 KB (16 KB gzip). Wat nog moet, is klein en maakt het portaal
eerlijk en goedkoop uitbreidbaar: zie de lijst onderaan.

### 1. Is de REG-001-naad echt?

Voor de structuur wel, voor de presentatie maar half.

- **Echt.** `buildAtlasPortal` (`src/content/geography.ts:109–223`) is generiek
  in type en relatie: `PORTAL_ENTITY_TYPES` en `PORTAL_HIERARCHY_RELATIONS`
  (`:83–84`) zijn de enige twee plekken met een type of relatie. Een landniveau
  dat via `part_of` boven de regio's hangt, komt zonder wijziging in de
  boomopbouw bovenaan. Kiest `REG-001` voor landen als `region` met een
  niveau-attribuut, dan verandert er in de code zelfs niets.
- **Niet zonder werk elders.**
  - Een nieuw entiteitstype `country` raakt eerst het model (`ENTITY_TYPES`,
    `src/content/model/common.ts:3`), de directories, de entiteitsroute, de
    zoekfilters, `contentLabels` en de relatieregels.
  - In het portaal is de copy regio-gebonden. `scope`, `finder.label`,
    `finder.found`, `jumpLabel` en `emptyBody` zeggen "regio('s)", en de teller
    heet `regionCount` (`AtlasPortal`).
  - Het zoekformulier stuurt vast `type=region` mee
    (`atlas-portal-finder.tsx:97`). Een land is zonder JavaScript dus niet te
    vinden.
  - "Nog geen kaart" (`textOnly`) is voor een land zonder eigen kaart een
    vreemde zin.
  - De presentatie hangt aan diepte, niet aan type. Secties zijn niveau 1,
    kaarten niveau 2 en links niveau 3+ (`atlas-portal.tsx:199–235`, `:108–128`).
    Met landen bovenaan zakken Médoc, Libournais en de andere subregio's van
    kaart (met miniatuur) naar tekstlink. Dat is een ontwerpkeuze die bij
    `MNT-082` hoort, niet iets wat de naad oplost.
  - `parent-map` kijkt alleen naar directe ouders (`geography.ts:175–177`).
  - Scène-eigenaars moeten `region.` zijn (`model/geography.ts:294–298`).
  - Tests die nu `["Bordeaux", "Moezel"]` als secties verwachten
    (`geography.test.ts`) en de e2e-portaaltests met Bordeaux als sectie moeten
    worden herschreven.
- **Conclusie.** De naad is echt voor data en boom. Contract §9 belooft "becomes
  the top level without a redesign"; dat klopt alleen als `MNT-082` ook de copy
  per niveau en de presentatie per diepte vastlegt. Leg dat als "klaar wanneer"
  in `MNT-082` vast.

### 2. `buildAtlasPortal`: complexiteit, randgevallen, plaats

- **Complexiteit.**
  - `ancestors()` wordt niet gememoriseerd en per kandidatenpaar opnieuw
    berekend (`:136–139`, `:178–183`). Dat is O(n · c² · d). Bij 615 knopen,
    c ≈ 1–2 en d ≤ 4 is dat verwaarloosbaar; geen actie nodig.
  - `getAtlasPortal` wordt per taal twee keer gebouwd, in `generateMetadata` en
    in de pagina (`atlas/page.tsx:13`, `:33`). Bij statische generatie is dat
    onschuldig.
- **Meerdere ouders.** Correct en deterministisch: de meest specifieke ouder
  wint, gelijke ouders op ID, en elke knoop staat één keer (getest met
  Pomerol-plateau). Een regio onder twee ongerelateerde ouders verschijnt
  alleen onder de alfabetisch eerste ID. Dat is verdedigbaar, want de vinder
  dekt het, maar zet het in §9.
- **Conceptouder.** Correct: `nearestPublished` (`:124–131`) klimt erlangs en
  noemt de conceptouder nooit.
- **Scène zonder gebieden.** Correct: die krijgt `preparing` en een link naar de
  entiteitspagina (`:155–172`).
- **Cycli.** Wel zichtbaar, maar volgordeafhankelijk. In de probe met
  X → A → B → A gaf de invoervolgorde `x, a, b` de boom `A(B), X` (X losgemaakt
  naar het hoogste niveau), en de volgorde `a, b, x` de boom `A(B, X)`. De
  herstellus (`:144–153`) maakt de knoop los die het pad als eerste ziet, niet
  per se een lid van de cyclus. Een `part_of`-cyclus is een datafout, en de
  contentpijplijn weigert die nu niet (geen cycluscontrole in
  `scripts/content/pipeline/`).
- **Regio waarvan alleen een ouder een kaart heeft.** Hier zit een
  dubbele regel.
  - De portaalstatus `parent-map` (`:173–188`) en `findSceneForEntity`
    (`:323–346`), die bepaalt welke kaart de regiopagina inbedt, beantwoorden
    dezelfde vraag apart. Contract §9 belooft "on the map of a containing
    region (the one the region page embeds)".
  - De twee wijken af in drie dingen. De relatiebron verschilt
    (`entity.relations` tegen `getRelationsForEntity`). De verzameling scènes
    verschilt: het portaal ziet alleen gepubliceerde eigenaars, de pagina ook
    conceptscènes zoals Champagne. En alleen het portaal eist `shown > 0`.
  - Gevolg: het portaal kan "Nog geen kaart" zeggen terwijl de pagina een
    (concept)kaart inbedt, of "Op de kaart van X" terwijl de pagina een lege
    kaart toont. Vandaag treft dat geen echte regio, maar de regel moet door
    constructie één zijn.
- **Plaats.** `buildAtlasPortal` is puur en heeft geen bestandstoegang nodig.
  Het hoort in een eigen module, bijvoorbeeld `src/content/atlas-portal.ts`,
  zonder `server-only`. Dan is het los testbaar en blijft de repository alleen
  laden en bedraden. De repository groeide van 230 naar 412 regels, met drie
  verantwoordelijkheden in één bestand; dit versterkt SCL-13.

### 3. Index, miniaturen en het juiste budget

- **Welke indexvelden het portaal leest.** Alleen `owner`, `slug`,
  `coverage.shown.length`, `coverage.intended.length` en `thumbnail`
  (`geography.ts:159–168`), via `summaries` uit de repository. SCL-01 houdt de
  eerste vier; alleen `thumbnail` verhuist naar een eigen bestand. De aanpassing
  is klein, mits het portaal miniaturen via een repositoryfunctie krijgt in
  plaats van uit de samenvatting. Doe dat binnen `MNT-079`, zodat
  `buildAtlasPortal` niet opnieuw open hoeft.
- **De miniatuur domineert de groei.** In de index is de miniatuur ≈ 0,7 KiB van
  de ≈ 1,0 KiB gzip per scène (fase 1). Op de pagina staat ze twee keer, in HTML
  en RSC, met ≈ 3 KB padtekst per kaart. Bij 150 kaarten is dat ≈ 900 KB ruw
  alleen aan miniaturen. De schaalproef van de bouwer telt 82 miniaturen
  (66 KB gzip voor de markup, ≈ 130 KB gzip als pagina), dus de "≈ 40 kaarten"
  in de testopmerking is al ruim overschreden in de proef zelf.
- **Is het testbudget de juiste bewaking?** Gedeeltelijk.
  - De unittest (`atlas-portal.test.tsx:156–185`) bewaakt de componentmarkup:
    < 450 KiB ruw, < 96 KiB gzip en < 700 B per knoop. Dat hoort in een
    unittest en is goed opgezet.
  - Hij meet niet wat de lezer krijgt. De RSC-verdubbeling ontbreekt, en de
    aftrek van `thumbnails * 3000` rekent met een vaste schatting in plaats van
    de gemeten padlengte.
  - Voeg in `MNT-079` een budget toe op de echte pagina (HTML plus RSC, gzip),
    gemeten in de build of in een test die de prerender-uitvoer leest.
- **Gecachete miniatuurroute eerder dan ≈ 40 kaarten?** Ja: neem haar op in
  `MNT-079`.
  - De bouw schrijft één statisch, gehasht SVG-spritebestand met één
    `<symbol id="scene.…">` per scène.
  - Het portaal tekent `<svg><use href="…#scene.medoc"/></svg>`.
  - Dat haalt de miniaturen uit index, HTML en RSC tegelijk, is cachebaar tussen
    bezoeken, en is meteen de proef voor de `<use>`-route van SCL-02/`MNT-083`
    met weinig risico, want de miniatuur is decoratief en `aria-hidden`.

### 4. De clientvinder

- **Omvang.**
  - De vinder zelf is klein: 3,8 KB bron, plus 1,0 KB voor `portal-match.ts`.
  - Hij importeert `atlasCopy` (`atlas-portal-finder.tsx:5`), en daarmee komt de
    hele `copy.ts` mee, beide talen en alle Atlas-teksten (20,5 KB bron, 6,4 KB
    gzip). Dat zit in de paginachunk van `/atlas` (12,8 KB, 5,1 KiB gzip; daarin
    staat ook "appellatiegebieden" en "Ligt ook in"), dus de Nederlandse legenda
    gaat mee naar `/en/atlas`.
  - Hetzelfde gebeurde al vóór het portaal in de gedeelde scènechunk via
    `map-view.ts:1` (`compareAreaNames` uit `copy.ts`; chunk 861, 8,9 KiB gzip).
    Fase 1 heeft dat gemist; het hoort bij SCL-12.
  - Met elke taal en elk copyblok groeien beide chunks mee.
- **Koppeling aan de DOM.**
  - De filter is generiek op `[data-portal-node]` en `data-match`. Dat is goed:
    hij werkt op elke diepte en blijft werken als secties landen worden.
  - Bij één treffer klikt hij op de eerste `<a>` in de knoop (`:71`). Dat leunt
    op de volgorde van de markup: een toekomstige link vóór de kaartlink (een
    kaart-icoon, een locatorlink) breekt dit stil.
  - Ondertussen wordt het daarvoor bedoelde `data-href` (`atlas-portal.tsx:103`,
    op elk van de 615 knopen) nergens gelezen, alleen in tests.
  - `filterPortal` is O(n · m), met `matches.some(contains)` per knoop (`:27`).
    Bij een korte zoekterm met honderden treffers op 615 knopen is dat
    honderdduizenden `contains`-aanroepen per toetsaanslag. Dat is merkbaar op
    een trage telefoon, en markeren via `closest()` en een ancestorwandeling
    maakt het O(n · d).
- **i18n van de status.** De statusregel is gelokaliseerd via de copyfuncties,
  met meervoudsvormen, en `aria-live` staat goed. Maar `found`/`none` zeggen
  "regio" (zie §1), en de client heeft ze alleen omdat de hele copymodule
  meekomt.
- **Wat breekt als secties landen worden.** Functioneel niets in de filter. De
  copy zegt "regio", `type=region` sluit landen uit van de no-JS-zoekroute, en
  de spronglijst (vanaf vier secties) groeit naar ≈ 15 items. Dat laatste is
  prima.

### 5. De e2e-schaalproef

De aanpak (de echte component renderen in het Playwright-proces, laden met
`page.setContent` en de productiestylesheets van `/atlas`) is de juiste plek
voor lay-outbeweringen: geen horizontale overloop, minimale kaartbreedte, en
tellingen op 320, 390, 768 en 1440 px. Er hoeft geen synthetische route te
bestaan, wat het geografiebeleid respecteert. Bytebudgetten horen in de
unittest, en daar staan ze ook.

De proef is matig broos:

- Ze laadt `next/link` en TSX buiten Next in de Node-transform van Playwright.
  Een Next-upgrade kan dat breken, want `AGENTS.md` waarschuwt voor afwijkende
  API's.
- De vinder hydrateert in `setContent` niet, dus de filter op schaal wordt niet
  getest.
- De stylesheet-URL's komen van een live pagina en vergen een productiebuild.

Advies: houd de proef, en voeg één unittest met jsdom toe die
`filterPortal` op het synthetische portaal draait (615 knopen, korte zoekterm)
op correctheid en een ruwe tijdsgrens. De e2e-runtime is niet gemeten (geen
Playwright-run in deze review); het aantal e2e-tests in de spec steeg van 84
naar 104 (bouwer).

### 6. SCL-05a

Opgelost voor `/atlas`. De pagina leest alleen `getAtlasPortal`
(`atlas/page.tsx:13`, `:33`); er wordt geen scènebestand geladen en er is geen
oriëntatieberekening meer. De unittest "reads summaries only" bewijst dat door
de scènemap te verwijderen. Nog open:

- De home laadt nog alle scènes (`src/app/[lang]/page.tsx:30–38`). Dat blijft
  `MNT-079`, zoals afgesproken.
- De metadata van een scèneroute laadt de volledige scène voor de
  oriëntatiezin. Dat is onschuldig: de route laadt de scène toch en de
  repository cachet haar.

### 7. Effect op de bevindingen van fase 1

Beter:

- **SCL-05a** is voor `/atlas` opgelost.
- **SCL-08:** `ATLAS_OVERVIEW_SCENE_ID` is weg, een handgeschreven constante
  minder per regio.
- **Paginagewicht `/atlas`:** van 371 naar 16 KB gzip. SCL-02 blijft wel
  volledig gelden voor scène- en entiteitspagina's.
- **Ontwikkelcontrole:** de dubbele `NODE_ENV`-controle is opgeschoond, en
  `findSceneForEntity` doet geen dubbele opzoeking meer.

Slechter of scherper:

- **SCL-01:** het portaal maakt de miniatuur in de samenvatting tot een
  kritiek pad (`geography.ts:166`). Zonder de accessor uit punt 3 raakt
  `MNT-079` ook het portaal.
- **SCL-12:** de volledige tweetalige copy staat nu in twee clientchunks.
- **SCL-13:** de repository is 412 regels met drie verantwoordelijkheden, en de
  regel "welke kaart toont deze regio" bestaat twee keer.
- **Copy en CSS:** er staan nog vier inline `locale === "nl"`-ternaries in de
  metadata (`atlas/page.tsx:15–19`). `atlas.css` groeide van 1.116 naar 1.279
  regels, nog steeds globaal (SCL-14). De naam "region chooser" staat nog in
  `data/geography/README.md:82` en `src/styles/atlas.css:2` (SCL-16).

### Moet vóór oplevering

1. **Eén regel voor "welke kaart toont deze regio".** Laat de portaalstatus
   `parent-map` en `findSceneForEntity` dezelfde functie gebruiken: dezelfde
   relatiebron, dezelfde scèneverzameling, dezelfde eis aan getekende gebieden.
   Dan klopt de belofte van §9 door constructie. Voeg een test toe die voor
   elke portaalknoop met `parent-map` controleert dat de entiteitspagina die
   kaart inbedt.
2. **Vinder ontkoppelen van copy en markupvolgorde.**
   - Geef de vinderteksten als props door, zoals de enhancer met `labels` doet,
     en verplaats `compareAreaNames` uit `copy.ts` naar een eigen module, zodat
     geen clientchunk de copymodule meer bevat.
   - Navigeer bij één treffer via `data-href`, of verwijder `data-href`; nu is
     het dode markup op elke knoop terwijl de klik op de eerste `<a>` leunt.
3. **Cycli deterministisch.** Maak de herstellus volgordeonafhankelijk (alleen
   leden van de cyclus losmaken, op ID). Registreer een cycluscontrole voor
   `part_of` in de contentpijplijn als vervolgticket; daar hoort de fout
   eigenlijk.

### Mag later (met ticket of binnen een bestaand ticket)

- `buildAtlasPortal` naar een eigen pure module (SCL-13).
- Miniaturen via een repositoryaccessor en een gecachet SVG-spritebestand
  binnen `MNT-079`, met een budget op HTML plus RSC (gzip) in plaats van alleen
  op de componentmarkup; werk de opmerking "≈ 40 kaarten" in de test bij.
- `MNT-082` "klaar wanneer" uitbreiden met copy per niveau ("regio" tegen
  "land"), de zoekfilter (`type=region`) en de presentatie per diepte (wie een
  kaart met miniatuur krijgt).
- `filterPortal` naar O(n · d) via `closest()`, plus een jsdom-test op
  615 knopen.
- Meervoudige ouders en hun plaatsing (alfabetisch eerste ID) in §9 noemen.
- Restdrift: de naam "region chooser" in `README.md:82` en `atlas.css:2`; de
  metadata-ternaries naar `copy.ts`.

### Aftekening na de herstelronde — 2026-11-01

Codepas op de definitieve werkboom en de build op poort 3104. Atlas- en
contenttests: 237 tests, groen. `tsc` en `eslint` zijn schoon.

- **Must-fix 1: opgelost.** `sceneSummaryForEntity`
  (`src/content/geography.ts:178–201`) is nu de enige regel. Zowel
  `findSceneForEntity` (`:203–210`) als het portaal gebruiken haar, het portaal
  via `sceneFor` (`src/content/atlas-portal.ts:30`, `:177–203`). Het portaal
  noemt een kaart alleen als de eigenaar gepubliceerd is en de kaart gebieden
  tekent. `parent-map` draagt `sceneId`, en een test controleert die tegen de
  inbedding op de pagina (`geography.test.ts:417`).
- **Must-fix 2: opgelost.**
  - De vinder importeert alleen een type uit `copy.ts`, plus `portal-match.ts`.
  - `compareAreaNames` staat nu in `area-names.ts`, en `map-view.ts:1` importeert
    haar daaruit.
  - Gemeten: de paginachunk van `/atlas` is 2.499 B (1,3 KiB gzip) en de gedeelde
    scènechunk 13.131 B (5,0 KiB gzip), beide zonder Atlas-copy.
  - `data-href` is verwijderd. Bij één treffer volgt de vinder nog steeds de
    eerste `<a>` van de knoop (`atlas-portal-finder.tsx:81`). Dat was een van
    de twee toegestane opties, maar de koppeling aan de markupvolgorde blijft;
    zie de restpunten.
- **Must-fix 3: opgelost.** Cycli worden gevonden met Tarjan over gesorteerde
  ID's (`atlas-portal.ts:70–105`). In elke cyclus verliest alleen het lid met
  de kleinste ID zijn cyclusranden (`:113–128`), dus het resultaat is
  volgordeonafhankelijk. Knopen buiten de cyclus houden hun plaats. Meerdere
  ouders worden opgelost via de diepste kandidaat, gelijke diepte op ID.
- **Module.** `buildAtlasPortal` staat in `src/content/atlas-portal.ts`, puur en
  zonder `server-only`. De repository is terug naar 285 regels.
- **Geen jsdom: aanvaardbaar.** De logica zit in de pure kern
  `portalVisibility` (O(n·d), `portal-match.ts`) en is getest op de fixture
  van 615 knopen. De DOM-schil is dun (indexen naar `hidden`) en wordt in de
  browser getest. Een nieuwe dev-dependency alleen voor die schil weegt niet op
  tegen de wijziging in `package.json`.

**Oordeel: ship.**

Restpunten (geen blokkade):

- Navigeer bij één treffer via de `href` van de kaartlink met een eigen
  selector in plaats van de eerste `<a>`.
- `foundOne`/`foundOther` dekken alleen twee meervoudsvormen; neem
  `Intl.PluralRules` mee in SCL-12.
- De verwachtingen voor de miniaturen, het paginabudget (HTML plus RSC) en de
  copy per niveau blijven bij `MNT-079` en `MNT-082`. De appellatienamen in de
  matchdata brengen de schaalrender op 470 KB ruw en 78 KB gzip; dat valt binnen
  het nieuwe budget, maar op de pagina verdubbelt de RSC-payload het.
