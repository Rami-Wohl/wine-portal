# Atlas-portaal naar eindbeeld: rondereview — 2026-11-01

Review-ID: `QCR-2026-11-01-03` · peildatum 2026-11-01 · branch `feat/attempt-at-atlas` · ticket `MNT-078`

Status: afgerond 2026-11-01; beide reviewers "ship"; `MNT-078` afgerond

## Reikwijdte en methode

De eigenaar vroeg op 2026-11-01 om één refactor met het einddoel voor ogen: de
Atlas-landingspagina (`/atlas`, `/en/atlas`) was "alleen Bordeaux" (zeven
scènekaarten en de ingebedde overzichtskaart) en moest het portaal naar alle
wijnregio's worden, zoals het eruit hoort te zien wanneer de Atlas af is. Daarnaast
vroeg de eigenaar om een oordeel over de schaalbaarheid en onderhoudbaarheid van
de huidige oplossing en over de gezondheid en netheid van de codebase.

Team en proces, zoals door de eigenaar vastgelegd: één orchestrator (Fable)
stuurde drie Opus-agents aan. De **bouwer** schreef alle code, in twee fasen:
eerst een ontwerpnotitie (acht beslispunten, door de orchestrator beantwoord
vóór de bouw), daarna de bouw en één herstelronde. De
**schaalbaarheidsreviewer** beoordeelde de hele Atlas-oplossing tegen het
einddoel (circa 15 landen, 150+ regio's, 1.500+ appellaties, meer lagen en
talen) en daarna de portaalcode; review `QCR-2026-11-01-01`. De **QA-reviewer**
keek vanuit menselijk perspectief (lezer, docent, toetsenbord- en
schermlezergebruiker, trage telefoon, nieuwe ontwikkelaar): eerst een nulmeting
van het oude portaal en een codelezing, daarna het nieuwe portaal in de browser
op 320, 390, 768 en 1440 px, NL en EN, met en zonder JavaScript, reduced motion,
geforceerde kleuren en print; review `QCR-2026-11-01-02`. Bevindingen liepen
via de orchestrator; alleen de bouwer bouwde en draaide de browsersuite
(preview op poort 3104). Vorige agents waren bij de start niet meer actief.

Datawerkelijkheid waar het ontwerp op rust (door de orchestrator geverifieerd):
26 regio-entiteiten, waarvan 7 actief en alle in het Bordeaux-cluster, 19
concepten wereldwijd zonder inhoud; geen landentiteit en geen landrelatie
(`REG-001` open); acht scènes; concepten horen niet in publieke lijsten; boven
regioniveau bestaat geen toegestane kaartvorm. Het portaal groeit daarom uit de
`part_of`-hiërarchie van de kennisgraaf, tekent niets op land- of wereldniveau
en bewijst zijn schaal met synthetische testdata, nooit met verzonnen inhoud op
de publieke route.

## Besluiten in deze ronde

- Contract §1, besluit 6: `/atlas` is het portaal naar elke gepubliceerde regio;
  de Bordeaux-overzichtskaart verlaat de landingspagina en blijft als overzicht
  van het cluster op `/atlas/bordeaux`, bereikbaar via de kaartkaart van de
  sectie. Reden: op einddoelschaal zegt een Bordeaux-kaart bovenaan een
  wereldportaal niets, de pagina woog 371 KB gzip en telde 63 tabstops vóór de
  regiolinks.
- Concepten worden niet genoemd en niet geteld; Champagne blijft via URL
  bereikbaar met `noindex`.
- Diepere niveaus worden links in de kaart van hun ouder (Fronsadais in
  Libournais); dat houdt de pagina werkbaar op schaal.
- Geen fixture-route in `src/app`; schaal wordt bewezen in unit-tests en met
  een statische render in de browsertest.
- Wat boven regioniveau getekend mag worden en waar de landgroepering vandaan
  komt, is een gebruikersbesluit (`MNT-082`, met `REG-001`), geen bouwvraag.

## Wat is gebouwd

- **Portaalmodel** (`src/content/geography.ts`, typen in
  `src/content/model/geography.ts`): `getAtlasPortal(locale)` bouwt een kleine
  boom uit gepubliceerde regio's en scènesamenvattingen, zonder één scènebestand
  te laden. Hiërarchie uit `part_of`, plaatsing onder de meest specifieke
  gepubliceerde voorouder, alfabetisch per taal; per regio één staat uit data:
  kaart (met berekende dekking en miniatuur), kaart in voorbereiding, op de
  kaart van een omvattende regio, of nog geen kaart. `PORTAL_ENTITY_TYPES` en
  `PORTAL_HIERARCHY_RELATIONS` zijn de naad voor `REG-001`.
- **Portaal** (`src/components/atlas/atlas-portal.tsx`): per topniveau een
  sectie met een kaartkaart ("Kaart van Bordeaux") en kinderen als kaarten met
  precies één link; diepere niveaus als links in de kaart; toegankelijke namen
  alleen de naam, de staat apart via `aria-describedby`; miniatuur alleen bij een
  kaart; opgevouwen "Ga naar…"-lijst vanaf vier secties; een optionele
  locator-slot die niets tekent zonder geverifieerde bron; compacte sectie
  zonder kinderen; eerlijke lege staat.
- **Zoeker** (`atlas-portal-finder.tsx`): zonder JavaScript een echt
  zoekformulier naar `/search?q=…&type=region` (gecontroleerd: het zoekpad kent
  het filter); met JavaScript filtert het de servergerenderde lijst ter plekke,
  ongevoelig voor hoofdletters, accenten en koppeltekens, met beleefde
  live-status, Escape wist, geen treffer verwijst naar de sitezoekfunctie.
- **Pagina** (`src/app/[lang]/atlas/page.tsx`): H1 "Wijnregio's op de kaart" /
  "Wine regions on the map", introzin met berekende reikwijdte, één statuszin
  zolang `ATLAS_PREVIEW` aan staat; metadata, alternates en `noindex` als
  voorheen; `ATLAS_OVERVIEW_SCENE_ID` is verwijderd.
- **Stijlen**: `.atlas-portal-*` vervangt `.atlas-region-*`; plakkende
  kaartkaart naast het raster op brede schermen, subgrid voor uitgelijnde namen
  en staten, geforceerde kleuren en print geregeld.
- **Tests**: `atlas-portal.test.tsx` (structuur, copy NL/EN, toegankelijke
  namen, schaal 15/150/450 met bytebudgetten, lege staat), portaaltests in
  `src/content/geography.test.ts` (hiërarchie, staten, cyclus, "laadt geen
  scènebestand" door de scènemap te verwijderen), browsertests voor het portaal
  (alleen gepubliceerde regio's, zoeker met en zonder JavaScript, tabvolgorde,
  geen hydratieverschuiving, passend op vier breedtes, synthetische
  schaalrender via `page.setContent` met de productie-CSS; nooit een route); de
  overzichtskaarttests verhuisden naar `/atlas/bordeaux`.

## Metingen (productiebuild, poort 3104, bouwer en QA onafhankelijk)

| Meting | Vóór | Na |
| --- | ---: | ---: |
| `/atlas` HTML ruw / gzip | 1.171.973 / 371.478 B | 71.250 / 15.970 B |
| Eerste kaart (390 px, NL) | 387 px | 585 px (zoeker en statuszin ervoor) |
| Eerste kaart (1440 px, NL) | 437 px | 574 px |
| Tabstops tot de eerste kaart (390 / 1440) | 6 / 9 | 8 / 11 (veld en knop van de zoeker) |
| Regio-ingangen | 7 kaarten, hiërarchie onzichtbaar | 1 kaartkaart, 5 kaarten, 1 binnenlink |
| Hydratieverschuiving | 0 | 0 |
| Synthetische render 15/150/450 | — | 394 KB ruw, 66 KB gzip (verdubbeld door RSC) |

## Bevindingen uit de twee reviews en hun afhandeling

Schaalbaarheid, fase 2 (oordeel "ship after fixes"): één gedeelde regel voor
"welke kaart toont deze regio" (portaal en regiopagina gaven verschillende
antwoorden); zoeker losmaken van de copy-module (de hele tweetalige `copy.ts`
zat in de clientchunk van `/atlas`) en van de markupvolgorde; deterministische
cyclusafhandeling. Daarnaast: `buildAtlasPortal` in een eigen pure module, de
miniatuur als dominante groeiterm van index en pagina (naar `MNT-079`),
copy per niveau en zoekfilter als onderdeel van `MNT-082`, `filterPortal` naar
O(n·d), vermelding van meervoudige ouders in §9, restanten "region chooser".

QA, fase 2 (oordeel "ship after fixes"): contract en code verschilden over
meervoudige ouders en over "op de kaart van"; de intro beloofde "of lees over de
regio" zonder link naar een regiopagina; lege miniatuurrij bij tekstkaarten;
herhaalde sectienaam in een kaartkaart zonder kaart; metadata nog inline met
het oude Engelse "Find your bearings"; live-status die niet telt wat zichtbaar
is. Wensen: appellatienamen vindbaar ("waar ligt Pauillac?"), `?q=` in de URL,
"alle met een kaart", geen wees op 1440, unit-test voor `filterPortal`.

Van de 24 bevindingen uit de QA-nulmeting zijn na de bouw 10 opgelost, 7
deels (buiten de portaalscope of in `MNT-079`, `MNT-081`, `MNT-083`,
`MNT-094`) en 7 niet (tickets `MNT-082`, `MNT-092` t/m `MNT-095`, en de
variantnaam in `MNT-089`).

Afhandeling in de herstelronde (bouwer, één ronde, vijftien punten):

1. Eén regel voor "welke kaart toont deze regio": `sceneSummaryForEntity` in
   `src/content/geography.ts`, op samenvattingen alleen, gebruikt door de
   regio- en appellatiepagina's (`findSceneForEntity`) en door het portaal;
   geen vlag, de pagina mag een scène met conceptueigenaar inbedden, het
   portaal noemt nooit een concept en zegt "op de kaart van X" alleen als die
   kaart gebieden tekent; test die elke "op de kaart van"-knoop vergelijkt met
   de inbedding van de regiopagina.
2. Meervoudige ouders: diepste gepubliceerde kandidaat, gelijkspel op id;
   contract §9 zegt hetzelfde; tests voor beide invoervolgordes.
3. Zoeker losgemaakt: strings als props, import alleen `portal-match.ts`;
   `compareAreaNames` naar `src/components/atlas/area-names.ts` zodat
   `map-view.ts` `copy.ts` niet meer meesleept; `data-href` verwijderd.
   Clientchunk van `/atlas` van 23,9 KB (8,9 KiB gzip, met de volledige
   tweetalige copy) naar 2,5 KB (1,3 KiB gzip); scènechunk naar 13,1 KB
   (5,0 KiB gzip) zonder Atlas-copy.
4. Cycli deterministisch: detectie over gesorteerde id's, alleen het lid met
   de kleinste id laat zijn cyclusranden los; tests voor beide volgordes en
   een geneste cyclus.
5. "Lees over Bordeaux" op de kaartkaart (alleen bij een gepubliceerde
   pagina), gestapeld na de dekkingsregel zoals de Fronsadais-link; kinderen
   houden precies één link.
6. Tekstkaarten zonder miniatuurgebied (`.atlas-portal-card-text`), korter dan
   kaartkaarten in dezelfde rij.
7. Kaartkaart zonder kaart heet "Over X" / "About X".
8. Metadata naar `copy.ts`; EN-beschrijving "Wine regions on the map:
   appellation areas built from verified geographic data."
9. Status telt wat zichtbaar is ("1 regio gevonden, 3 getoond"); Enter bij
   één treffer opent die, bij meer of geen treffers gaat het formulier naar
   `/search?q=…&type=region`, net als zonder JavaScript.
10. Restanten "region chooser" weg uit `atlas.css` en `data/geography/README.md`.
11. Appellatienamen in de zoekdata (label "Zoek een regio of appellatie");
    "pauillac" vindt Médoc en Bordeaux; schaalrender 470 KB ruw / 78 KB gzip,
    budgetten < 480 KiB ruw, < 90 KiB gzip, < 500 B per knoop zonder miniaturen.
12. "7 regio's, alle met een kaart" wanneer alles een kaart heeft.
13. Vijf kindkolommen op 1440 px (kaartkolom `minmax(220px, 2fr)` tegen
    `7fr`), browsertest op één rij en geen overloop; tussen 981 en ±1279 px kan
    een vijfde kaart nog alleen op een rij komen.
14. `buildAtlasPortal`, `placePortalNodes`, invoertypen en constanten in de
    pure module `src/content/atlas-portal.ts` met eigen tests;
    `portalVisibility` als pure O(n·d)-kern in `portal-match.ts`, in een
    unit-test gedraaid op de fixture van 615 knopen; geen jsdom (niet
    geïnstalleerd; zou `package.json` raken), de DOM-wrapper is in de browser
    getest.
15. Engelse statuszin: "The atlas is published early and grows as verified map
    data is added."
16. QA-32 (na de aftekenronde van QA): regionamen en appellatienamen apart
    in de zoekdata (`data-match`, `data-areas`); een treffer op een appellatie
    toont de regio met haar ouders als context maar zonder deelregio's, en de
    staatregel krijgt "Met Pauillac" / "With Pauillac" (Escape wist); de
    status telt wat op het scherm staat ("pauillac" → "2 regio's gevonden":
    sectie Bordeaux en kaart Médoc); Enter bij één treffer gebruikt de eigen
    hoofdlink van de regio (`data-portal-entry`). Schaalrender 523 KB ruw /
    79 KB gzip, budget ruw naar 540 KiB; gzip 90 KiB en 500 B per knoop
    ongewijzigd.

Procesafwijking van de bouwer, zelf gemeld: één `git reset -q HEAD` op twee
paden na een `git rm --cached` (netto geen wijziging), daarna gewone `rm`.

## Verificatie

Door de bouwer gedraaid en door de orchestrator onafhankelijk herhaald op de
eindboom (2026-11-01):

| Controle | Resultaat |
| --- | --- |
| `npm run format` | schoon |
| `npm run check` | schoon; 423 unit-tests in 40 bestanden (was 403 in 39) |
| `npx playwright test e2e/atlas.spec.ts` | 106 geslaagd (was 84) |
| `npm run test:e2e` (bouwer) | 317 geslaagd (was 295) |
| `/atlas` HTML | 75.751 B ruw, 17.011 B gzip (was 1.171.973 / 371.478) |
| `/en/atlas` HTML | circa 75,7 KB ruw, 16,9 KB gzip |
| `/atlas/bordeaux`, `/atlas/medoc` | 360 KB gzip: de scènepagina's dragen de geometrie nog dubbel (`SCL-02`, `MNT-081`, `MNT-083`) |
| Clientchunk `/atlas` | 2.499 B / 1.305 B gzip, zonder copy of kaartcode |
| Eerste kaart (320/390/768/1440, NL) | 597 / 585 / 513 / 574 px, gelijk met en zonder JavaScript |
| Tabstops tot de eerste kindkaart (390 / 1440) | 9 / 12 (zoekveld, zoekknop, kaartkaart en "Lees over"-link ervoor) |
| Werkboom | 29 gewijzigde of nieuwe paden; niets vastgelegd |

## Teststrategie

Geautomatiseerd: `npm run check` (format, lint, contentbuild met relatie-audit,
typegen, tsc, vitest) en `npx playwright test e2e/atlas.spec.ts` bij elke
wijziging; `npm run test:e2e` vóór een merge. De portaaltests dekken: alleen
gepubliceerde regio's en geen concept genoemd; sectie, kaartkaart en plaatsing
van Fronsadais; dekkingsteksten uit data en natuurlijke toegankelijke namen;
zoeker met JavaScript (accenten, hoofdletters, koppeltekens, Escape, geen
treffer, Enter bij één treffer) en zonder (`?q=…&type=region`); tabvolgorde;
geen hydratieverschuiving; passend op 320/390/768/1440 zonder overloop,
afgebroken namen of overlap; de synthetische schaalrender op vier breedtes;
`getAtlasPortal` zonder scènebestanden.

Handmatig, in echte browsers: de zoeker op een telefoon (toetsenbord dat
accenten invoegt, autocorrectie), Terug-navigatie na een zoekopdracht,
schermlezer (VoiceOver: naam van een kaart gevolgd door de staat), afdrukken
van `/atlas`, en de Champagne-scène via URL.

## Open punten en beslispunten voor de eigenaar

1. **`MNT-082`:** wat mag het portaal boven regioniveau tekenen (locator uit
   een geverifieerde bron zoals Natural Earth of IGN na bronreview) en waar
   komt de landgroepering vandaan (`REG-001`)? Tot dat besluit tekent het
   portaal niets boven regioniveau en blijft "regio" de enige niveau-copy.
   Met landen bovenaan zakken Médoc en zijn buren van kaart naar link; de
   presentatie per diepte hoort bij datzelfde besluit.
2. **Champagne (UX-19, QA B3):** de regio publiceren, of een expliciete
   "in voorbereiding"-ingang toestaan? Nu niet genoemd en niet geteld.
3. **Volgorde van de onderhoudsacties:** `MNT-079` (index afslanken, miniaturen
   via een gecachete route) is de enige harde breuk op korte termijn en raakt
   het portaal direct; daarna `MNT-080`, `MNT-081`, dan de spike `MNT-083`.
4. De homepagina laadt nog elk scènebestand voor twee woorden (`MNT-079`).
5. De zoekknop verliest in geforceerde kleuren zijn rand (sitebreed, zoekknop).

## Aftekening

- **Schaalbaarheidsreviewer (Opus), fase 2 en aftekenpas:** eerst "ship after
  fixes" (één kaartregel, zoeker los van de copy-module en van de
  markupvolgorde, deterministische cycli), na de herstelronde "ship": alle drie
  opgelost, clientchunk van `/atlas` 1,3 KiB gzip zonder copy, geen jsdom
  aanvaardbaar omdat de filterkern puur en getest is. Restpunten naar tickets:
  meervoudsvormen (`MNT-088`), miniaturen en paginabudget met RSC (`MNT-079`),
  copy per niveau en zoekfilter (`MNT-082`).
- **QA-reviewer (Opus), fase 2 en aftekenpas:** eerst "ship after fixes" (vijf
  must-fixes), na de herstelronde één nieuwe bevinding QA-32 (appellatietreffer
  liet alles zichtbaar), na die laatste fix "ship": "pauillac" toont alleen
  Bordeaux en Médoc met "Met Pauillac", "sauternes" in het Engels idem, Escape
  herstelt, schermlezers horen de appellatie via de staatregel. Kleine
  eigenaardigheid zonder fix: "médoc" zet "Met Haut-Médoc" op de
  Bordeaux-kaart omdat regionaam en appellatienaam beide treffen.
- **Orchestrator (Fable):** integratie tegen product-, kennisarchitectuur-,
  geografie- en visueel beleid gecontroleerd: geen nieuwe geometrie, geen
  landen of wereldkaart verzonnen, concepten niet genoemd en niet geteld,
  miniaturen alleen uit geverifieerde vormen, copy NL en EN zonder
  pipelinetaal, pagina compleet zonder JavaScript, toetsenbordpad en metadata
  intact; verificatie onafhankelijk herhaald (423 unit-tests, Atlas-spec 106,
  `/atlas` 17,0 KB gzip). Contract §1 (besluit 6), §2, §8, §9 en §10
  bijgewerkt; `MNT-078` afgerond; `MNT-079` t/m `MNT-096` geregistreerd uit de
  twee reviews. Niets vastgelegd in git; de eigenaar beslist over commit en
  over de beslispunten hierboven.
