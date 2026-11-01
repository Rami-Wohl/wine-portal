# Atlas-portaal: QA-review vanuit menselijk perspectief — 2026-11-01

Review-ID: `QCR-2026-11-01-02` · peildatum 2026-11-01 · branch `feat/attempt-at-atlas`

Status: fase 1 (nulmeting en codelezing) en fase 2 (beoordeling van het nieuwe
portaal, `MNT-078`) afgerond; oordeel "ship after fixes", zie de laatste sectie.

## Reikwijdte en methode

Deze review beoordeelt de Atlas-landingspagina `/atlas` als portaal naar de
wijnregio's van de wereld, vóór en na de herbouw die de orchestrator aan de
bouwer heeft gegeven. De lens is menselijk: een lezer die een wijnregio zoekt
en wil begrijpen wat de kaart toont; een wijndocent die de Atlas in de les
gebruikt; een schermlezer- of toetsenbordgebruiker; een telefoongebruiker op
een trage verbinding; en een nieuwe ontwikkelaar die deze code volgende maand
moet lezen en wijzigen. Gelezen beleid: `AGENTS.md`, `docs/atlas-plan.md`
(§2, §8, §9, §10), `docs/product-principles.md`, `docs/geography-policy.md`
(§1, §6), `docs/visual-language.md` (§2, §5–§8), `editorial/writing-style.md`,
`docs/localization-routing.md`, `docs/quality-assurance.md`, en de eerdere
reviews [`QCR-2026-10-31-02`](atlas-ux-review-2026-10-31.md) en
[`QCR-2026-10-31-03`](atlas-ux-round-a-review-2026-10-31.md). De nog open
voorstellen daaruit (rijen 10–21 en `UX-24`) zijn hier niet opnieuw als nieuw
gemeld; waar een bevinding ermee samenhangt, staat dat erbij.

Browser: Chromium via de `@playwright/test` van de repo, tegen de
productiebuild op `http://127.0.0.1:3104` (huidige werkboom). Oppervlakken:
`/atlas`, `/en/atlas`, `/atlas/medoc`, `/atlas/libournais`, `/regions/medoc`,
`/appellations/pauillac`, `/appellations/sauternes`, `/en/atlas/champagne`.
Viewports 320 × 844, 390 × 844 (touch), 768 × 1024 en 1440 × 900 CSS px; met en
zonder JavaScript; alleen toetsenbord (70 Tab-stappen per viewport);
`prefers-reduced-motion: reduce`; `forced-colors: active`; print via
`page.emulateMedia({ media: "print" })` plus een A4-pdf; axe-core 4 (WCAG 2 A/AA
en best practice) op 390 en 1440. Paginagewicht met `curl` (gzip en ruw).
Scripts, JSON-uitvoer en schermafbeeldingen staan in de sessiescratch
(`scratchpad/qa-portal/`).

Code gelezen als nieuwkomer: `src/app/[lang]/atlas/**`,
`src/components/atlas/**` met tests, `src/styles/atlas.css`, het Atlas-blok
van `src/styles/responsive.css`, `src/content/geography.ts`,
`src/content/model/geography.ts`, `scripts/geography/build.ts` en
`scripts/geography/lib/*`, `e2e/atlas.spec.ts`, `data/geography/README.md`,
en ter vergelijking de Atlas-kaart op de homepagina (`src/app/[lang]/page.tsx`).
Alleen-lezen controles: `npx tsc --noEmit` schoon; `npx vitest run
src/components/atlas src/content` 16 bestanden, 124 tests geslaagd; `npx eslint`
op alle genoemde paden zonder meldingen. Geen build, geen `npm run check`,
geen browsersuite, geen serverbeheer, geen git-mutaties. De werkboom was bij
aanvang schoon (`git status` leeg); dit rapport is het enige gewijzigde
bestand.

## Nulmeting van het huidige portaal

### Metingen `/atlas` (NL; EN tussen haakjes waar het afwijkt)

| Meting | 320 px | 390 px | 768 px | 1440 × 900 |
| --- | ---: | ---: | ---: | ---: |
| Bovenkant eerste regiokaart | 380 (416) | 387 (360) | 376 (347) | 437 (408) |
| Kaarten per rij | 1 | 2 | 4 | 7 |
| Hoogte van één kaart | 198 | 241 | 241 | 241 |
| Onderkant laatste kaart | 1.835 (1.871) | 1.364 (1.337) | 873 (844) | 678 (648) |
| Bovenkant Bordeaux-overzichtskaart | 2.105 | 1.611 | 1.131 | 843 |
| Hoogte legenda (met JS) | 1.510 | 1.203 | 731 | 732 |
| Documenthoogte (met JS) | 4.187 | 3.465 | 2.799 | 2.508 |
| Regiokaarten volledig in het eerste scherm | 2 | 2 (rij 2 half) | 7 | 7 |
| Horizontaal scrollen | nee | nee | nee | nee |

- Aantal regiokaarten: **7**, alfabetisch: Blayais en Bourgeais, Bordeaux,
  Entre-deux-Mers, Fronsadais, Graves en Sauternais, Libournais, Médoc. Allemaal
  Bordeaux; Champagne ontbreekt omdat de eigenaar `region.champagne` draft is,
  hoewel `/atlas/champagne` bestaat en bereikbaar is.
- Zonder JavaScript is de bovenkant van de kaarten en van de overzichtskaart
  identiek; alleen de legenda is 20–45 px korter (de aanwijzerzin valt weg).
- Toetsenbord: de eerste regiokaart is Tab-stap 6 (390) of 9 (1440); daarna
  op 390 de gevouwen samenvatting "Toon alle 37 gebieden" en het kader (stap 14),
  op 1440 eerst 37 lijstlinks en pas op stap 53 het kaartkader. Focusring
  overal zichtbaar (3 px, donker).
- Paginagewicht: `/atlas` 1.172 KB ruw, **371 KB gzip** (`/en/atlas` gelijk);
  `/atlas/medoc` 360 KB gzip; `/appellations/pauillac` 401 KB gzip. Ongeveer de
  helft van de HTML van `/atlas` is de RSC-payload na de opmaak (563 KB opmaak,
  609 KB payload); een padfragment van AOP Médoc staat vier keer in het document.
- axe: op `/atlas`, `/en/atlas`, `/atlas/medoc`, `/atlas/libournais` en
  `/en/atlas/champagne` geen Atlas-overtredingen; één sitebrede
  contrastovertreding (zie `QA-14`).
- Gereduceerde beweging: `scroll-behavior` wordt `auto`, overgangen van de
  kaarten worden 0,00001 s. Geforceerde kleuren: kaarten, miniaturen
  (`Canvas`/`CanvasText`) en focus blijven herkenbaar. Print: de zeven kaarten
  op één rij, daarna de volledige lijst van 37 gebieden in één kolom vóór de
  kaart (zie `QA-11`).

### Wat een lezer ziet zonder te scrollen

**Nederlands, 390 px.** Eyebrow "ATLAS · VOORVERTONING", kop "Waar ligt wat?",
de zin "Iedere kaart toont geverifieerde appellatiegebieden met water en
plaatsen als oriëntatie.", eyebrow "KAARTEN", kop "Kies een regio", en twee
rijen kaarten: "Blayais en Bourgeais — 2 van 2 appellaties op de kaart",
"Bordeaux — 37 van 38 appellaties op de kaart", en de namen Entre-deux-Mers en
Fronsadais half in beeld. Op 1440 px dezelfde tekst met alle zeven kaarten op
één rij en de kop "Kaart van Bordeaux" onderaan het scherm.

**Engels, 390 px.** "ATLAS · PREVIEW", "Find your bearings", "Each map shows
verified appellation areas with water and towns for orientation.", "MAPS",
"Choose a region", en dezelfde kaarten met "2 of 2 appellations mapped".

Wat de lezer leert: dat er kaarten zijn, dat ze geverifieerd zijn en dat er
zeven regio's zijn. Wat de lezer niet leert: dat alle zeven in Bordeaux (en
Frankrijk) liggen; dat "Bordeaux" de andere zes omvat; dat Champagne bestaat;
dat de kennisbank nog 19 andere regio's kent (Alsace, Douro, Mosel, Tokaj,
Marlborough, Mendoza …) die geen kaart hebben; en wat "voorvertoning"
betekent voor wat hij ziet.

**Over regio's zonder kaart zegt de pagina niets.** Er is één lege toestand
("Er zijn nog geen gepubliceerde kaarten."), die alleen verschijnt als er
helemaal geen kaart is. Draft-regio's verschijnen terecht niet in publieke
lijsten (`localization-routing.md` §1), maar er is ook geen zin die de
reikwijdte noemt.

**Het voorvertoningslabel** is alleen de eyebrow "Atlas · voorvertoning" /
"Atlas · preview" in kleine kapitalen. Er staat nergens wat er voorlopig aan
is. Op `/atlas/champagne` wordt het "Atlas · in voorbereiding", terwijl de kaart
er volledig staat.

**NL en EN** verschillen in de kop: "Waar ligt wat?" (een vraag naar ligging)
tegenover "Find your bearings" (een aansporing om je te oriënteren). Beide zijn
idiomatisch, maar ze beloven iets anders. De Engelse metabeschrijving herhaalt
de kop ("Find your bearings on maps …"); de Nederlandse niet.

### Dezelfde metingen op de overige oppervlakken (referentie voor fase 2)

| Pagina | Kaartkader begint (320 / 390 / 768 / 1440) | Opmerking |
| --- | --- | --- |
| `/atlas/medoc` | 519 / 503 / 501 / 396 | ronde-A-doel gehaald op 1440 |
| `/atlas/libournais` | 519 / 503 / 501 / 396 | kader 193 px hoog op 320 (bekend, `UX-13`) |
| `/regions/medoc` | 1.408 / 1.203 / 874 / 1.043 | ingebed, kop tot kader 132 px op 320 |
| `/appellations/pauillac` | 1.355 / 1.124 / 847 / 1.012 | |
| `/appellations/sauternes` | 1.408 / 1.229 / 874 / 1.043 | kader 236 px op 320 |
| `/en/atlas/champagne` | 493 / 450 / 442 / 337 | eyebrow "in preparation" |

Geen consolefouten, geen horizontaal scrollen op enige combinatie.

## Bevindingen

Ernst: **hoog** = een lezer krijgt een onjuist beeld of loopt vast;
**midden** = merkbaar knelpunt of onderhoudsrisico; **laag** = verfijning.

### A. UI/UX en copy

| ID | Ernst | Waar | Observatie | Verwachting | Voorstel |
| --- | --- | --- | --- | --- | --- |
| QA-01 | hoog | `/atlas`, `/en/atlas`, alle viewports | Kop "Waar ligt wat?" / "Find your bearings" en "Kies een regio" klinken als een algemene wereldatlas; de zeven kaarten zijn allemaal Bordeaux en nergens staat dat. De pagina zegt niets over regio's zonder kaart. | Een lezer weet in het eerste scherm welk deel van de wijnwereld de Atlas nu dekt en dat de rest volgt (`product-principles.md` §7, `geography-policy.md` §6: "must not imply all areas are shown when coverage is partial"). | Eén berekende reikwijdtezin in de intro (bijvoorbeeld "Nu op de kaart: Bordeaux. Andere regio's volgen zodra hun geografische data is geverifieerd."), uit gepubliceerde scènes afgeleid, niet handgetypt. Het nieuwe portaal moet regio's zonder kaart een eerlijke toestand geven (zie beslispunten). |
| QA-02 | hoog | `/atlas`, kaart "Bordeaux" | "Bordeaux — 37 van 38" staat alfabetisch tussen zijn eigen deelregio's; Fronsadais (deel van Libournais) staat er los naast. De hiërarchie die de kennisbank wel kent (`part_of`) is onzichtbaar. | Een docent ziet in één oogopslag dat Médoc, Libournais enz. binnen Bordeaux liggen. | Groepeer kaarten onder hun bovenliggende regio uit de `part_of`-relaties (nooit uit geometrie), met de overkoepelende regio als kop of eerste kaart. |
| QA-03 | midden | `/atlas` en `/atlas/bordeaux` | De kaart "Bordeaux" opent `/atlas/bordeaux`, die precies dezelfde kaart toont als onder de regiokaarten op `/atlas` zelf. Twee routes voor één scène. | Eén plek per kaart; de portaalpagina verwijst ernaar. | In het portaal de overzichtskaart vervangen door een verwijzing, of op `/atlas` alleen de kaarten tonen. Contract §2/§8 ("`/atlas` shows the overview scene") moet dan mee (beslispunt B2). |
| QA-04 | midden | `/atlas`, eyebrow; `/en/atlas/champagne` | "Atlas · voorvertoning" zegt niet wat voorlopig is. Op Champagne staat "Atlas · in voorbereiding" boven een volledig getekende kaart; de introzin gaat over de regiopagina, niet over de kaart. | Het label vertelt de lezer wat hij wel en niet kan verwachten. | Eén korte, gedeelde zin bij het label (uit de preview-schakelaar), bijvoorbeeld "Deze Atlas is in opbouw; kaarten en dekking kunnen nog veranderen." Op draft-scènes "Kaart · regiopagina in voorbereiding". |
| QA-05 | midden | `/atlas`, alle kaarten | "2 van 2 appellaties op de kaart" bij volledige dekking leest als ruis; alleen "37 van 38" is informatief. Op de kaart zelf is de regel juist weggelaten bij volledige dekking (`UX-17`). | Dezelfde logica op kaart en scène: getal altijd, "van" alleen bij een gat. | `coverageLine` met twee vormen: "8 appellaties" en "37 van 38 appellaties op de kaart". Blijft berekend; contract §9 noemt alleen "the computed coverage line". |
| QA-06 | midden | `/atlas` NL/EN, `page.tsx:64` | NL "Waar ligt wat?" en EN "Find your bearings" beloven iets anders; EN-metabeschrijving herhaalt de kop. | Gelijke betekenis, eigen idioom (`writing-style.md`, Lokalisatie). | Kies één belofte, bijvoorbeeld NL "Wijnregio's op de kaart" / EN "Wine regions on the map", of laat de vraag in beide talen terugkomen ("Where is what?" is geen goed Engels; "Where wine comes from" wel). |
| QA-07 | midden | `/atlas`, miniaturen | De miniaturen tonen losse vormen zonder enige context (geen kust, rivier of land). Een lezer die Bordeaux niet kent, kan ze niet plaatsen; voor zeven buurregio's lijken Fronsadais en Blayais op willekeurige vlekken. | Een portaal naar de wereld laat zien wáár een regio ligt, of zegt het in tekst. | Kortetermijn: een tekstregel met land en bovenliggende regio op elke kaart (uit canonieke data, zie B1). Een locatorkaart is fase 4 en vraagt geverifieerde geometrie. |
| QA-08 | laag | `/atlas` 390 en 1440, "Entre-deux-Mers" | De naam breekt af als "Entre-deux-" / "Mers" op 1440 en 390; "Graves en Sauternais" en "Blayais en Bourgeais" breken op twee regels terwijl ernaast één regel staat, waardoor de dekkingsregels niet uitlijnen. | Namen breken op spaties, kaarten lijnen hun onderregel uit. | `hyphens: manual` plus een harde koppelteken-variant (U+2011) in de weergave, of een iets bredere minimale kaartbreedte; dekkingsregel met `margin-top: auto`. |
| QA-09 | laag | `/atlas` 320 | Eén kaart per rij van 198 px: zeven kaarten beslaan 1.455 px. Met de 26 regio's die de kennisbank al kent zou dat ruim 5.000 px worden. | Het portaal schaalt op de telefoon. | In het nieuwe ontwerp op smalle schermen compacte rijen (miniatuur 64 px links, naam en regel rechts) of groepen die vouwen. |
| QA-10 | laag | `/atlas` 1440 | Naast de legenda staat een lege linkerkolom van circa 700 px onder de lijst. | Rustige, gevulde compositie. | Bekend gevolg van `UX-02`; in het portaal hoeft het overzicht geen volledige scène meer te zijn (QA-03). |
| QA-11 | laag | `/atlas` print | Een docent die de pagina print krijgt eerst de zeven kaarten, dan 37 gebieden in één kolom (≈ 2 A4-pagina's), pas dan de kaart; de zin "Klik of tik op een overlap …" wordt mee geprint. | Kaart en legenda bovenaan, de lijst compact. | In `@media print`: lijst in meerdere kolommen, `.atlas-needs-script` verbergen. |

### B. Toegankelijkheid

| ID | Ernst | Waar | Observatie | Verwachting | Voorstel |
| --- | --- | --- | --- | --- | --- |
| QA-12 | midden | `/atlas` en scènes, 1440, toetsenbord | Het kaartkader is Tab-stap 53 op `/atlas`: eerst 7 kaarten en 37 lijstlinks. Er is geen skiplink "Naar de kaart". (Eerder genoemd in de tweede ronde van `QCR-2026-10-31-02`, maar niet in de prioriteitsrijen opgenomen.) | Een toetsenbordgebruiker die wil verschuiven en zoomen hoeft niet door de hele lijst. | Skiplink "Naar de kaart" boven de lijst, of de samenvatting van de lijst ook op breed scherm als eerste stop met de links erachter. |
| QA-13 | laag | Alle scènes zonder JavaScript | Het kader heet "Interactieve kaart" met de toetsbeschrijving "Pijltjestoetsen verschuiven …" via `aria-describedby`, ook zonder script, terwijl het dan niet focusbaar en niet interactief is. | Een schermlezer hoort alleen wat werkt. | Naam en `aria-describedby` pas zetten wanneer `view.ready` waar is, of zonder script "Kaart van …" gebruiken. |
| QA-14 | laag (sitebreed) | footer `/atlas`; bijschriften en broodkruimel op regio- en appellatiepagina's | `--muted` #74776f op #f4f1eb heeft contrast 4,04:1 bij 12–12,5 px (axe `color-contrast`, 1 element op `/atlas`, 31–39 op entiteitspagina's). | Minstens 4,5:1 voor kleine tekst. | Token een tint donkerder; geen Atlas-specifieke wijziging, wel meenemen omdat de nieuwe portaalkaarten `--muted` gebruiken voor de dekkingsregel. |
| QA-15 | laag | `/atlas`, regiokaart | De toegankelijke naam van een kaart is "Blayais en Bourgeais 2 van 2 appellaties op de kaart": naam en telling lopen zonder scheiding in elkaar over. | "Blayais en Bourgeais, 2 van 2 appellaties op de kaart". | Een visueel verborgen komma of `aria-describedby` voor de dekkingsregel. |

### C. Code en documentatie vanuit menselijk perspectief

| ID | Ernst | Waar | Observatie | Verwachting | Voorstel |
| --- | --- | --- | --- | --- | --- |
| QA-16 | midden | `src/app/[lang]/atlas/page.tsx:24-33,61-64,91-104`; `[scene]/page.tsx:48-60,90-101`; `src/app/[lang]/page.tsx:45-49` | Atlas-copy staat op vier plaatsen: `copy.ts` (`page.*`), inline ternaries in beide routes (titel, kop, eyebrow, metadata, lege toestand) en inline op de homepagina. De eyebrowlogica "voorvertoning / in voorbereiding" staat twee keer. Een vertaler of redacteur vindt niet alle zinnen in één bestand. | Alle publieke Atlas-copy in `copy.ts`, zoals de typecommentaar daar belooft ("Public map copy"). | `atlasCopy(locale).page` uitbreiden met `title`, `heading`, `description`, `eyebrow(preview, published)`, `empty*`; de routes en de homepagina lezen alleen daaruit. |
| QA-17 | midden | `atlas/page.tsx:43-51`; `src/app/[lang]/page.tsx:30-38` | Om twee booleans voor één introzin te bepalen, laden `/atlas` en de homepagina elk volledig scènebestand (`getAtlasSceneById` per scène). Dat spreekt contract §8 tegen ("never all at once") en het commentaar bovenaan `geography.ts`; bij tientallen regio's wordt dit merkbaar. | De samenvatting in `index.json` draagt wat de landingspagina nodig heeft. | `orientation: { water, places }` in `AtlasSceneSummary` laten schrijven door de build; één helper voor beide pagina's. (Raakt ook de schaalbaarheidsreviewer.) |
| QA-18 | midden | `/atlas`, HTML-payload; `atlas-scene.tsx:301-378` | De servergerenderde SVG gaat als `children` door de clientcomponent `AtlasSceneEnhancer`; de paden staan daardoor in de HTML én in de RSC-payload (371 KB gzip voor `/atlas`, waarvan ongeveer de helft payload). Op een trage telefoonverbinding is dat de grootste kostenpost van de pagina. | Kaartgeometrie één keer over de lijn; budget §7 (250 KiB per scène) geldt voor de lezer, niet alleen voor het bestand. | Meten met de schaalbaarheidsreviewer; mogelijke aanpak: de enhancer als zuster van de SVG (verwijzing via id) in plaats van als ouder, zodat de SVG geen clientkind is. |
| QA-19 | midden | `src/content/geography.ts:216-217`; contract §2, §8, §9 | `ATLAS_OVERVIEW_SCENE_ID = "scene.bordeaux"` is hard gecodeerd en het contract zegt "The Bordeaux region scene is the Atlas overview". Een wereldportaal maakt die aanname onwaar; code en contract moeten samen veranderen. | Het portaal en het contract zeggen hetzelfde. | Bij de herbouw §2, §8 ("`/atlas` … show the overview scene"), §9 (laatste alinea over de regiokiezer) en §10 (browsertests) bijwerken; de constante verwijderen of hernoemen naar wat ze dan betekent. |
| QA-20 | laag | `atlas-scene.tsx:17`; tests met `atlas-overview-graves-and-sauternais-*` | `variant: "overview" \| "embedded"`: "overview" betekent hier "volledige Atlas-pagina" en wordt ook voor Médoc en Graves gebruikt, terwijl "overview" elders de Bordeaux-scène is. De id-basis `atlas-overview-<slug>` versterkt de verwarring. | Een naam die zegt wat hij doet. | `variant: "page" \| "embedded"` en `idBase = atlas-<slug>`; tests mee. |
| QA-21 | laag | `atlas/page.tsx:85-106` | De lege toestand heeft eigen kopmarkup (`atlas-scenes-title`) naast die van `AtlasRegionChooser` (`atlas-regions-title`), een losse `{" "}` aan het eind van de alinea, en wordt nergens getest. | Eén component met een lege variant, getest. | De lege toestand in `AtlasRegionChooser` (of de nieuwe portaalcomponent) onderbrengen en een unit-test toevoegen. |
| QA-22 | laag | `src/content/geography.ts:51-54,67-72,90-95,193-198` | Ontwikkel-herladen wordt dubbel bewaakt (`NODE_ENV === "development"` én `hotReload`), met een commentaar "dead outside development" dat de lezer moet ontcijferen; `getAtlasFeatureForEntity` zoekt de feature die `withFeature` al vond opnieuw op. | Eén bewaking met één uitleg; geen dubbele zoekslag. | `hotReload` alleen laten gelden via de optie (de standaardrepository geeft `process.env.NODE_ENV === "development"` mee); `feature` teruggeven uit `withFeature`. |
| QA-23 | laag | `src/styles/atlas.css` (o.a. `.atlas-layer-places`, `.atlas-label-water`, `.atlas-geometry-line`, `.atlas-swatch-water`) | Negen klassen zijn alleen via template-strings opgebouwd (`atlas-layer-${role}`, `atlas-label-${…}`, `atlas-geometry-${…}`, `atlas-swatch-${kind}`); een zoekactie naar de klassenaam vindt geen gebruiker en de ontwikkelaar denkt dat ze dood zijn. | Vindbaar gebruik. | Eén commentaarregel in `atlas.css` boven die blokken, of een expliciete map `role → className` in de component. |
| QA-24 | laag | `data/geography/README.md`, "Code layout"; `scripts/geography/lib/` | De README beschrijft de import-modules, maar niet `projection.ts`, `output.ts`, `errors.ts` en de rol van `display.ts` als buildkern. Er zijn twee foutmodules (`errors.ts` voor de build, `import-error.ts` voor de import) en `writeAtomically` wordt vanuit zowel `output.ts` als `write.ts` opnieuw geëxporteerd. Het doc-commentaar van `atlasThumbnailSchema` (`model/geography.ts:478-482`) breekt midden in de zin. | Eén plattegrond van import én build voor een nieuwkomer. | Een alinea "Build" naast "Code layout" in de README; foutklassen in één `errors.ts`; één exportpunt voor `writeAtomically`; commentaar herstellen. |

## Wat goed werkt

- **Toetsenbord en focus:** de regiokaarten zijn binnen 6–9 Tab-stappen
  bereikbaar, elke stop heeft een zichtbare 3-px-ring, er is geen focusval en
  de lijst geeft elk gebied een echte link.
- **Zonder JavaScript** is `/atlas` volledig bruikbaar en staat alles op
  dezelfde plek; de bediening is uitgeschakeld en de aanwijzerzin verborgen.
- **Eerlijkheid in de kaart zelf:** "37 van de 38 appellaties … getekend" met
  de naam en reden van het ontbrekende gebied (Côtes de Bordeaux, vorm wordt
  nog gecontroleerd); geen handgetypte dekking; draft-pagina's worden niet
  gelinkt.
- **Geforceerde kleuren, gereduceerde beweging en print** werken zonder
  verlies van betekenis; miniaturen worden in `forced-colors` lijnen.
- **axe** vindt op de Atlas-routes niets Atlas-specifieks.
- **Code:** typecheck, lint en 124 unit-tests schoon; `copy.ts` heeft een
  getypte NL/EN-interface waardoor een ontbrekende vertaling niet compileert;
  de componenten documenteren hun waarom (bijvoorbeeld de keuze voor SVG-links
  buiten de tabvolgorde); de repository noemt haar beleidsbronnen.

## Beslispunten voor de orchestrator

- **B1 — Landen en hiërarchie bestaan niet als canonieke data.** Er is geen
  entiteitstype `country` en geen region-YAML heeft een landveld; de 19
  andere regio's zijn allemaal `draft`. Een wereldportaal dat groepeert per
  land of werelddeel, of dat regio's zonder kaart toont, moet óf die data
  eerst canoniek maken (kennisarchitectuur, `product-principles.md` §8), óf
  alleen tonen wat al bestaat (zeven actieve regio's, `part_of`-hiërarchie).
  Handgetypte landnamen of een vaste werelddeellijst in de UI zouden
  `product-principles.md` §1 en §5 schenden. Draft-regio's publiek noemen
  botst met `localization-routing.md` §1 (drafts buiten publieke lijsten).
- **B2 — Contract §2, §8, §9 en §10** gaan uit van "`/atlas` toont de
  Bordeaux-overzichtsscène". Een portaal zonder (of met een andere)
  overzichtskaart vraagt een contractwijziging die de gebruiker moet zien
  (QA-03, QA-19).
- **B3 — Champagne:** zolang `region.champagne` draft is, ontbreekt de enige
  niet-Bordeauxkaart op het portaal, terwijl de scène bestaat. Publiceren van
  de regio, of een expliciete "in voorbereiding"-vermelding toestaan, is een
  gebruikersbesluit (sluit aan op `UX-19`).

## Beoordeling van het nieuwe portaal

Fase 2, 2026-11-01, tegen de herbouwde productiebuild op poort 3104
(`MNT-078`). Zelfde methode als de nulmeting: `/atlas` en `/en/atlas` op 320,
390, 768 en 1440 px, met en zonder JavaScript, toetsenbord (22 Tab-stappen per
viewport), `prefers-reduced-motion`, `forced-colors`, print (scherm en A4-pdf),
axe op 390 en 1440; daarnaast de zoekfunctie (tien zoektermen per taal, Enter,
Escape, Terug-navigatie na klik, na Enter en na een harde navigatie, het
formulier zonder JavaScript), de synthetische schaalbeelden van de bouwer
(`scratchpad/portal-build/shots/atlas-portal-scale-*`, 15 secties, 150 kaarten,
450 links) en de diff plus de nieuwe bestanden. Alleen-lezen controles opnieuw:
`tsc` schoon, 135 unit-tests geslaagd, `eslint` zonder meldingen. Scripts en
beelden in `scratchpad/qa-portal/p2/`.

### Metingen nieuw portaal

| Meting | 320 px | 390 px | 768 px | 1440 × 900 |
| --- | ---: | ---: | ---: | ---: |
| Bovenkant zoekveld | 415 (391) | 403 (379) | 324 (300) | 363 (339) |
| Bovenkant sectiekop "Bordeaux" | 553 | 541 | 469 | 521 |
| Bovenkant eerste kaart (was) | 597 (380) | 585 (387) | 513 (376) | 574 (437) |
| Kaarten per rij naast/onder de hoofdkaart | 1 | 2 | 4 | 4 naast de hoofdkaart |
| Documenthoogte (was) | 2.166 (4.187) | 1.870 (3.465) | 1.594 (2.799) | 1.438 (2.508) |
| Tab-stappen tot de eerste kaart (was) | — | 8 (6) | — | 11 (9) |
| Paginagewicht gzip (was) | 15,9 KB (371 KB) | | | |

Met en zonder JavaScript zijn alle posities identiek; geen consolefouten,
geen horizontaal scrollen. axe vindt alleen de bekende sitebrede
contrastovertreding in de footer (`QA-14`). Gereduceerde beweging: geen
animatie, `scroll-behavior: auto`. Geforceerde kleuren: kaarten, miniaturen en
de focusrand (`Highlight`) blijven herkenbaar; de knop "Zoeken" verliest zijn
rand en leest als losse tekst naast het veld (sitebreed zoekveld, laag). Print:
zoekveld verborgen, kaarten heel, alles op één A4-pagina.

### Wat een lezer en een docent nu zien

Eerste scherm (390 px, NL): "ATLAS · VOORVERTONING", "Wijnregio's op de kaart",
"Kies een wijnregio en bekijk de appellaties op de kaart, of lees over de regio.
Nu in de atlas: 7 regio's, 7 met een kaart.", de kleinere voorvertoningsnoot,
het zoekveld, de sectiekop "Bordeaux" en de hoofdkaart "Kaart van Bordeaux —
37 van 38 appellaties op de kaart". Daaronder vijf kaarten; Fronsadais staat
als link in de kaart van Libournais. EN is gelijkwaardig ("Wine regions on the
map", "In the atlas so far: 7 regions, 7 with a map.").

- **Eerlijkheid.** Kop, telling en noot samen zijn eerlijk: de lezer ziet binnen
  het eerste scherm dat de atlas nu uit Bordeaux bestaat en dat hij groeit. De
  telling noemt geen concepten, zoals `localization-routing.md` §1 vraagt.
  "7 regio's, 7 met een kaart" leest vandaag dubbel; "7 regio's, alle met een
  kaart" of "7 regio's op de kaart" zegt hetzelfde vlotter (laag).
- **"Kaart van Bordeaux" direct onder de kop "Bordeaux"** is aanvaardbaar en
  zelfs nuttig: het onderscheidt de overzichtskaart van de deelregio's. Bij een
  sectie zonder kaart herhaalt de hoofdkaart echter alleen de sectienaam (in de
  schaalbeelden "Testland 1" als h2 en meteen weer als h3); zie `QA-27`.
- **"… of lees over de regio"** belooft iets wat de pagina vandaag niet biedt:
  alle zeven links gaan naar een kaart; geen enkele link gaat naar een
  regiopagina (die is pas via "Lees over …" op de scènepagina bereikbaar). Een
  docent die zijn klas naar de tekst over de Médoc wil sturen, vindt die hier
  niet. Zie `QA-25`.
- **Vinden.** Op naam werkt de zoekfunctie goed: "med", "MEDOC", "entre deux"
  en "fronsadais" vinden de juiste regio met zijn bovenliggende sectie als
  context; Escape wist en toont alles weer; één treffer plus Enter opent die
  kaart. Maar de namen die mensen kennen zijn vaak appellaties: "pauillac",
  "sauternes", "pomerol" en "fronsac" geven "Geen regio gevonden" met een link
  naar de hele kennisbank. Voor de vraag "waar ligt Pauillac?" is dat een omweg
  (`QA-29`, wens).

### Open punten van de bouwer

- **Lege miniatuurrij op tekstkaarten.** Vandaag onzichtbaar (alle kaarten
  hebben een kaart), maar in de schaalbeelden staat boven elke kaart "Nog geen
  kaart" of "Kaart in voorbereiding" een lege vlakte van ongeveer 110 px, die
  in een rij met miniaturen leest als een afbeelding die niet laadde. De
  uitlijning van de statusregels weegt daar niet tegen op. Zie `QA-26`.
- **Kleverige hoofdkaart.** Op 1440 px werkt `position: sticky` (top 88 px)
  zonder iets te bedekken; vandaag is de sectie te kort om het te merken, op
  schaal houdt het de sectiekaart in beeld naast tien kaarten. Aanvaardbaar.
  Wel blijft de linkerkolom onder de hoofdkaart leeg en valt een vijfde of
  negende kaart als wees op een nieuwe rij (Médoc vandaag; laag).
- **Terug-navigatie.** Na typen, openen van een kaart en Terug (via een klik,
  via Enter en na een harde navigatie) is het veld leeg en de lijst volledig:
  veld en lijst kloppen met elkaar, maar de zoekopdracht is weg. Aanvaardbaar;
  `?q=` in de URL zou de zoekopdracht bewaren en de lijst ook zonder
  JavaScript op de server kunnen filteren (wens).
- **Zoekgedrag en live status.** De status staat in een gereserveerde regel
  (`role="status"`, beleefd), meldt "1 regio gevonden" of "Geen regio gevonden
  voor ‘xyz’" met een link, en verschuift niets. Twee kleine punten: bij
  "bordeaux" meldt hij "1 regio gevonden" terwijl zeven kaarten zichtbaar
  blijven (de afstammelingen); en Enter bij meerdere treffers doet niets en
  zegt niets (`QA-30`). Zonder JavaScript gaat het formulier naar
  `/search?q=…&type=region`, waar "médoc" de Médoc-pagina bovenaan geeft.
- **Toetsenbord en focus.** De kaartlink zelf heeft geen focusring; de hele
  kaart krijgt via `:has(:focus-visible)` een rand van 3 px (contrast ca.
  3,5 : 1 op de achtergrond, binnen WCAG 1.4.11), in geforceerde kleuren
  `Highlight`. Fronsadais houdt de gewone linkring. De toegankelijke naam is
  alleen de regionaam, de staat volgt via `aria-describedby`: `QA-15` is
  opgelost.

### Schaal (15 secties, 150 kaarten, 450 links)

Een lezer die de naam kent, vindt zijn regio op elke breedte: het zoekveld
staat bovenaan en filtert direct, de uitklaplijst "Ga naar…" springt naar een
sectie. Bladeren is op 1440 px nog te doen (≈ 20.300 px, vier kaarten per rij,
de sectiekoppen als ankers), op 390 px niet meer (geschat ≈ 30.000 px: twee
kolommen van ongeveer 400 px hoog per rij); daar is het zoekveld de enige
werkbare weg. Dat is verdedigbaar zolang het zoekveld ook appellaties en
alternatieve namen vindt (`QA-29`) en de sectiekoppen bij landen straks
herkenbaar zijn. Wat op schaal opvalt: de herhaalde staatregels onder elke
deelregio ("Nog geen kaart", "Kaart in voorbereiding") wegen visueel net zo
zwaar als de namen, en de lege miniatuurrijen (`QA-26`) maken de rasters
onrustig.

### Code als nieuwkomer

Goed leesbaar: de pagina is 60 regels en laadt geen scènebestand meer; alle
portaalcopy staat in `copy.ts` onder `portal`; `atlas-portal.tsx` documenteert
zijn structuur (sectie, hoofdkaart, kaarten, links); `portal-match.ts` is klein
en gedeeld tussen server en client; de schaalfixture is luid gemarkeerd als
testdata en draagt duidelijk verzonnen namen.

Lastiger:

- `buildAtlasPortal` (`src/content/geography.ts`, ≈ 100 regels) combineert vier
  geneste closures, een recursieve `ancestors` die per kandidaat opnieuw wordt
  berekend, cyclusbreuk en sortering. Splits in `parentOf`, `stateOf` en
  `tree`, en cache `ancestors` per id (laag, leesbaarheid).
- De staat "Op de kaart van X" kijkt alleen naar directe `part_of`-doelen,
  terwijl het commentaar zegt dat hij volgt wat `getAtlasSceneForEntity` op de
  entiteitspagina doet (dat volgt `intended_entities` en valt pas daarna terug
  op `part_of`). Vandaag zonder gevolg, maar de twee regels kunnen uiteenlopen;
  hergebruik één helper (laag).
- `AtlasPortalFinder` bewaart DOM-elementen in React-state en zet `hidden` op
  servermarkup buiten React. Dat is bewust en gedocumenteerd, maar
  `filterPortal` (afstammelingen en voorouders zichtbaar houden) heeft geen
  eigen unit-test; alleen de normalisatie wel (laag).
- De metadata van `/atlas` (titel en beschrijving) staat nog inline in
  `page.tsx`, en de Engelse beschrijving begint nog met "Find your bearings",
  de oude kop.

### Nieuwe bevindingen

| ID | Ernst | Waar | Observatie | Verwachting | Voorstel |
| --- | --- | --- | --- | --- | --- |
| QA-25 | midden | `/atlas`, intro; `copy.ts` `portal.intro` | "… of lees over de regio" terwijl geen enkele link naar een regiopagina gaat. | Een belofte in de intro is op de pagina in te lossen; Explore en Atlas zijn gelijkwaardig (`product-principles.md` §2, §6). | Op de hoofdkaart van een sectie met kaart een tweede, kleine link "Lees over Bordeaux" (boven de uitgerekte link, zoals de deellinks), of de bijzin alleen tonen wanneer een regio zonder kaart naar haar pagina leidt. |
| QA-26 | midden | `atlas.css` subgrid rij 1; schaalbeelden 390 en 1440 | Kaarten zonder miniatuur houden een lege rij van ±110 px, die tussen miniaturen leest als een ontbrekende afbeelding. | Een tekstkaart ziet er bedoeld uit, niet kapot (`visual-language.md` §8). | De lege rij laten vallen (statusregels hoeven niet over de rij uit te lijnen), of de ruimte vullen met de staat zelf in een rustig vlak ("Nog geen kaart"), nooit met een vorm. |
| QA-27 | laag | `atlas-portal.tsx` `Card lead` bij een sectie zonder kaart | De hoofdkaart herhaalt de sectienaam ("Testland 1" als h2 en direct als h3). | Geen dubbele kop. | Titel "Over Testland 1" / "About Testland 1", of de sectiekop zelf als link. |
| QA-28 | laag | `atlas/page.tsx:15-19` | Metadata inline; EN-beschrijving "Find your bearings on maps …" hoort bij de oude kop. | Copy in `copy.ts`, beschrijving past bij de nieuwe kop. | `portal.metaTitle` en `portal.metaDescription` in `copy.ts`, bijvoorbeeld "Wine regions on maps built from verified geographic data." |
| QA-29 | laag (wens) | zoekveld | Appellatienamen ("pauillac", "sauternes") vinden niets. | Een docent vindt via de bekendste naam de juiste kaart. | Appellaties uit de berekende dekking van elke scène meenemen als treffer met context ("Pauillac — op de kaart van Médoc"); de data staat al in de scèneoverzichten. |
| QA-30 | laag | zoekveld | Enter bij meerdere treffers doet niets; de telling "1 regio gevonden" telt de zichtbare deelregio's niet mee. | Elke toets geeft een reactie; de telling past bij wat je ziet. | Bij meerdere treffers focus naar de eerste treffer, of het formulier laten doorgaan naar zoeken; telling "1 regio gevonden, met 6 deelregio's". |
| QA-31 | laag | `atlas-portal-scale`, 1440 | Een wees-kaart op een nieuwe rij en een lege linkerkolom onder de hoofdkaart. | Rustig raster. | Accepteren, of het raster `auto-fill` met een minimale breedte waarbij 5 en 10 kaarten rond uitkomen. |

`QA-26` en `QA-27` worden pas zichtbaar wanneer er een regio zonder kaart is;
het portaal is uitdrukkelijk voor dat eindbeeld gebouwd, daarom staan ze bij de
herstelpunten.

### Status van de fase-1-bevindingen

| ID | Status | Toelichting |
| --- | --- | --- |
| QA-01 | opgelost | Kop, berekende telling, noot en sectiekop "Bordeaux" maken de reikwijdte in het eerste scherm duidelijk, binnen de regel dat concepten niet genoemd worden. |
| QA-02 | opgelost | Secties en kaarten uit `part_of`; Fronsadais onder Libournais. |
| QA-03 | opgelost | `/atlas` toont geen scène meer; de hoofdkaart verwijst naar `/atlas/bordeaux`. |
| QA-04 | deels | Noot op `/atlas` opgelost; `/atlas/champagne` zegt nog "Atlas · in voorbereiding" boven een getekende kaart (scèneroute, buiten deze ronde). |
| QA-05 | opgelost | "8 appellaties op de kaart", "37 van 38" alleen bij een gat; ook in `coverageLine` voor de scènes. |
| QA-06 | deels | Koppen gelijkwaardig; EN-metabeschrijving nog oud (`QA-28`). |
| QA-07 | niet | Geen landcontext of locator; afhankelijk van `MNT-082`/B1; de sectiekop geeft wel de bovenliggende regio. |
| QA-08 | opgelost | Namen met koppelteken breken niet meer; staatregels lijnen uit. |
| QA-09 | deels | Kaarten compacter (189–249 px op 320) en zoekveld plus "Ga naar…"; bladeren blijft op schaal op de telefoon lang. |
| QA-10 | opgelost | Geen lege kolom naast een legenda meer (wel `QA-31`). |
| QA-11 | deels | Print van `/atlas` goed (één pagina); de scènepagina's vallen onder `MNT-094`. |
| QA-12 | niet | Scènepagina, `MNT-094`. |
| QA-13 | niet | Scènepagina, `MNT-094`. |
| QA-14 | niet | Sitebreed, `MNT-095`; de portaaltekst gebruikt `--muted-strong` en slaagt. |
| QA-15 | opgelost | Naam als toegankelijke naam, staat via `aria-describedby`. |
| QA-16 | deels | Portaalcopy in `copy.ts`; metadata van `/atlas`, eyebrow van de scèneroute en de homepagina nog inline. |
| QA-17 | deels | `/atlas` laadt geen scènebestand meer; de homepagina nog wel (`src/app/[lang]/page.tsx:30-38`). |
| QA-18 | deels | `/atlas` 371 → 15,9 KB gzip; de dubbele geometrie op scène- en entiteitspagina's blijft (`MNT-081`/`MNT-083`). |
| QA-19 | opgelost | `ATLAS_OVERVIEW_SCENE_ID` is weg; `docs/atlas-plan.md` is tijdens deze review bijgewerkt (besluit 6, §2, §8, §9, §10). Twee kleine afwijkingen tussen §9 en de code: §9 plaatst een regio met meerdere ouders "under the first parent by id", de code kiest eerst de specifiekste ouder; en §9 zegt dat "op de kaart van" de kaart is die de regiopagina inbedt, terwijl de code alleen directe `part_of`-doelen bekijkt (zie Code als nieuwkomer). |
| QA-20 | niet | `variant="overview"` ongewijzigd (buiten portaalscope). |
| QA-21 | opgelost | `AtlasPortalEmpty` met één kop en een unit-test. |
| QA-22 | opgelost | Eén ontwikkelcheck per lader; `findSceneForEntity` geeft de feature mee. |
| QA-23 | niet | `MNT-092`. |
| QA-24 | niet | `MNT-093`. |

### Oordeel

**Ship after fixes.** Het portaal is een duidelijke verbetering voor elke
lezer die ik in deze review heb gevolgd: de reikwijdte is eerlijk, de
hiërarchie is zichtbaar, vinden op naam werkt met en zonder JavaScript, het
toetsenbordpad is kort, en de pagina weegt nog 4 % van wat ze woog. Herstel
vóór aftekenen, in deze volgorde:

1. **Contract en code laten overeenkomen** (`QA-19`, klein): de twee
   afwijkingen hierboven rechtzetten in §9 of in `buildAtlasPortal`.
2. **Intro waarmaken** (`QA-25`): een "Lees over …"-link op de hoofdkaart, of
   de bijzin alleen tonen wanneer die klopt.
3. **Geen lege miniatuurrij** op kaarten zonder kaart (`QA-26`).
4. **Geen dubbele kop** op de hoofdkaart van een sectie zonder kaart (`QA-27`).
5. **Metadata in `copy.ts`** met een beschrijving die bij de nieuwe kop past
   (`QA-28`).

Wensen, niet blokkerend: appellaties vindbaar in het zoekveld (`QA-29`);
reactie op Enter bij meerdere treffers en een telling met deelregio's
(`QA-30`); `?q=` in de URL voor Terug en no-JS; "7 regio's, alle met een
kaart"; een rustiger raster zonder wees (`QA-31`); een unit-test voor
`filterPortal`; `buildAtlasPortal` opsplitsen en de staat "Op de kaart van X"
op dezelfde helper als de entiteitspagina laten steunen; de homepagina
overzetten op de scèneoverzichten (`QA-17`); de rand van de zoekknop in
geforceerde kleuren; een vloeiendere Engelse noot ("This is an early version
of the atlas; it grows as more verified map data is published.").

## Aftekening 2026-11-01

Korte eindronde op de definitieve build (poort 3104), NL en EN op 390, 1100 en
1440 px, toetsenbord, één keer zonder JavaScript. De vijf herstelpunten zijn
voor de lezer zichtbaar opgelost:

- `QA-19`: §9 en de code volgen dezelfde regel (specifiekste gepubliceerde
  voorouder, gelijke stand op id).
- `QA-25`: "Lees over Bordeaux" / "Read about Bordeaux" staat op de hoofdkaart
  onder de dekkingsregel, linkt naar `/regions/bordeaux`, heeft een eigen
  focusring van 3 px en werkt zonder JavaScript.
- `QA-26`: tekstkaarten hebben geen lege miniatuurrij meer; in een rij met
  kaartkaarten zijn ze korter, en dat leest als bedoeld.
- `QA-27`: "Over Testland 1" in plaats van een herhaalde kop.
- `QA-28`: metadata in `copy.ts`, met een passende Engelse beschrijving.

Ook goed: "7 regio's, alle met een kaart"; de Engelse noot; Enter bij meerdere
treffers gaat naar `/search?q=…&type=region`; zonder JavaScript gaat
"pauillac" naar dezelfde zoekpagina. Tab-volgorde: zoekveld, knop, "Kaart van
Bordeaux", "Lees over Bordeaux", daarna de kaarten. In de band 981–1279 px valt
Médoc bij vijf kaarten alleen op een tweede rij (gemeten op 1100 px); dat is
aanvaardbaar.

Eén punt blijft, vanuit de lezer gezien. Het zoekveld heet nu "Zoek een regio
of appellatie", maar "pauillac" en "sauternes" tonen alle zeven kaarten, met de
status "2 regio's gevonden, 7 getoond". De treffer is de Bordeaux-sectie (de
overzichtskaart tekent elke appellatie), en die toont al haar deelregio's. Zo
lijkt het filter niets te doen en ziet de lezer niet welke regio Pauillac
bevat (`QA-32`, midden). Voorstel: bij een treffer op een appellatienaam alleen
de regio's met die appellatie en hun voorouders tonen, zonder hun
afstammelingen. Zet op die kaarten de appellatie in de staatregel ("met
Pauillac"), zodat Médoc zichtbaar de plek is.

**Oordeel: ship.** `QA-32` is nagecontroleerd op de definitieve build (NL
390 en 1440, EN 1440). "pauillac" toont alleen de Bordeaux-sectie en Médoc,
beide met "Met Pauillac", met de status "2 regio's gevonden". "sauternes" toont
Bordeaux en Graves en Sauternais (EN: "With Sauternes", "2 regions found").
"fronsa" toont Bordeaux en Libournais ("Met Canon-Fronsac" en "Met Fronsac") en
Fronsadais, met "3 regio's gevonden". Escape herstelt de volledige lijst en
haalt de "Met …"-regels weg. Enter bij meerdere treffers gaat naar
`/search?q=…&type=region`. De "Met …"-regel staat in de staatregel die via
`aria-describedby` wordt voorgelezen. Een kleinigheid zonder gevolg: "médoc"
zet bij Bordeaux "Met Haut-Médoc", omdat een naamtreffer (de regio Médoc) en een
appellatietreffer samenvallen. Dat is begrijpelijk en geen herstelpunt.
