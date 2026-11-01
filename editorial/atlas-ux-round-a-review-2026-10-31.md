# Atlas UX-ronde A op de featurebranch — 2026-10-31

Review-ID: `QCR-2026-10-31-03`

Ticket: `MNT-077`. Herkomst: de rijen 1–9 van de prioriteitsvolgorde in de
[Atlas-UX-review](atlas-ux-review-2026-10-31.md) (`QCR-2026-10-31-02`), door de
gebruiker op 2026-10-31 vrijgegeven voor de bouw. Branch
`feat/attempt-at-atlas`; niets is gecommit.

## Reikwijdte en methode

De gebruiker legde het proces vast: één orchestrator (Fable), één bouwagent
(Opus) die alle code schrijft, één UI/UX-reviewagent (Opus) die het resultaat
in de browser toetst, en één QA-agent (Fable) voor codekwaliteit,
onderhoudbaarheid, leesbaarheid, tests en de netheid van proces en
documentatie. Bevindingen liepen via de orchestrator terug naar de bouwer.
Vóór de bouw zijn contract §1, §7 en §9 van [atlas-plan.md](../docs/atlas-plan.md)
en het ticket bijgewerkt, zodat de bouwer vanuit een bindende brief werkte.

Verloop: één bouwronde, twee parallelle reviews (browser en code), één
herstelronde met zeventien punten, en een herverificatie door beide
reviewers. De bouwer draaide een eigen productiebuild op poort 3104; de
reviewers raakten geen bestand en geen server aan.

## Wat is gebouwd

1. **Kaart eerst (`UX-01`).** De gebiedenlijst vouwt natief (gesloten) op
   smalle schermen in elke variant; op ≥ 981 px opent de enhancer haar naast
   de kaart. Scènepagina's hebben één kop (de figuurkop is visueel
   verborgen), één introzin en de link "Lees over …" als eigen regel. De
   schaalverklaring staat één keer per kaart, in de legenda of in de
   uitklap. Atlas-pagina's hebben een strakkere intro-afstand, zodat de
   kaart op 1440 × 900 op 396 px begint en 72 % van het kader bij laden
   zichtbaar is.
2. **Regiokiezer bovenaan `/atlas` (`UX-03`).** Zeven kaarten met
   servergerenderde miniaturen van de selecteerbare appellatiegebieden
   (buildartefact in `index.json`, `thumbnail: { viewBox, paths }`, hoogstens
   3 KiB padtekst per scène, deterministisch); daarna de overzichtskaart.
3. **Bediening op de kaart zonder verschuiving (`UX-07`, `UX-05`).** Drie
   pictogramknoppen (inzoomen, uitzoomen, herstel weergave) als overlay,
   servergerenderd en uitgeschakeld tot de enhancer klaar is; kolom
   rechtsboven op brede schermen, op schermen tot 760 px een smalle balk
   direct onder het kader (44 px knoppen) die nooit kaartinhoud bedekt.
   De werkbalk, de toggle, de statusregel en de zoomweergave zijn weg;
   de kaartpositie is met en zonder JavaScript gelijk.
4. **Kiezer (`UX-08`).** Specifiekste gebied eerst en visueel primair
   (scènebrede `areaRank`, gelijke vormen delen een rang, daarna
   alfabetisch), overkoepelende gebieden op één regel "Ligt ook in: …".
   De kiezer blijft binnen het kader en wordt op schermen tot 620 px een
   onderpaneel van hoogstens 60 % van het kader.
5. **Gebarenmodel (`UX-06`).** Slepen verschuift direct; het wiel zoomt
   alleen met Ctrl/⌘, anders scrolt de pagina en verschijnt 1,6 s de hint
   "Gebruik Ctrl + scrollen om te zoomen" (⌘ op Apple); één vinger scrolt de
   pagina, twee vingers verschuiven en knijpen de kaart (hint bij een
   éénvingerpoging); pijltjes, `+`, `−` en `0` werken zodra het kader focus
   heeft, met een zichtbaar bijschrift bij toetsenbordfocus.
6. **Compacte inbedding (`UX-04`).** Kop, één bijschriftregel, "Bekijk in de
   Atlas", kaart en één uitklap "Over deze kaart: gebieden, legenda en bron".
   Het Médoc-blok op de Pauillac-pagina is op 390 px 557 px van kop tot de
   onderkant van de bedieningsbalk.
7. **Eén uitleg, kloppende tellingen (`UX-15`, `UX-17`, `UX-23`).** Geen
   dubbele oriëntatiezin; de dekkingsregel alleen bij een gat; de
   vouwsamenvatting telt de gebieden die tot de berekende dekking van de
   kaart horen, zodat zij altijd gelijk is aan het getal op de regiokaart
   (Bordeaux "Toon alle 37 gebieden" naast "37 van 38"; Médoc 8; Libournais
   12). Ingebedde kaarten hebben geen aparte vouwsamenvatting meer: de lijst
   staat in de uitklap "Over deze kaart".
8. **Zichtbare introlink (`UX-16`).** Links in `.page-intro-copy` krijgen de
   merkkleur en een onderstreping; geen andere pagina had een link in de intro.
9. **Begrensde lijstkolom (`UX-02`).** Op desktop is de lijst sticky
   (`--header-offset`), zo hoog als de kaart met eigen scroll en een
   onderfade; de legenda begint 20 px onder de kaart.

## Bevindingen uit review en QA, en hun afhandeling

UI/UX-review (eerste ronde): alle negen wijzigingen geleverd of grotendeels
geleverd, geen regressies. Twee grote bevindingen en acht kleine:

| # | Bevinding | Afhandeling |
| --- | --- | --- |
| F1 | Bedieningskolom bedekt na inzoomen de Médoc-gemeenten en de oostelijke Libournais-gebieden op 390 px | Eerst een rij linksonder; omdat die na inzoomen nog het label Saint-Émilion bedekte, nu een balk direct onder het kader op ≤ 760 px met 44 px knoppen; e2e-test op overlap met labels |
| F2 | Kiezer loopt uit het kader (Sluiten afgesneden op 1440; bedekt de hele kaart op 390) | Klemmen op beide assen, omklappen naar boven, onderpaneel ≤ 620 px waarvan alleen de lijst scrolt en de sluitknop altijd zichtbaar blijft; sluit bij herschalen; unit- en e2e-tests |
| F3 | Miniaturen tonen losse streepfragmenten van het overkoepelende gebied | Miniaturen uit selecteerbare gebieden alleen; contract §7 aangepast |
| F4 | Herstelpictogram leest als "volledig scherm" | Hercentreer-glyph |
| F5 | Rivieren zonder naam, stippen zonder naam | Buiten deze ronde (rij 10, `MNT-075`) |
| F6 | Champagne-intro spreekt zichzelf tegen; regionota spreekt van een mozaïek bij één gebied | Nieuwe introzin zonder link naar de conceptpagina; `regionNote` noemt de regio en heeft een één-gebied-variant |
| F7 | Printen breekt de kaart over pagina's | Printhoogte begrensd op 170 mm; de skiplink wordt bij printen verborgen (`base.css`) |
| F8 | Labels zonder JavaScript klein op 1440 | Buiten deze ronde (`MNT-075`, no-JS-labelplanning) |
| F9 | Geen scrollaanwijzing op de sticky lijst | Onderfade, scroll-gestuurd waar ondersteund |
| F10 | Focusring blijft staan na een tik op `+` | Ring alleen bij `:focus-visible` |

QA (eerste ronde): geen blokkades; verificatie van de bouwer onafhankelijk
gereproduceerd (format schoon, check groen, Atlas-spec groen, miniatuurbuild
byte-identiek over drie runs). Eén grote bevinding en acht kleine, alle
verwerkt in de herstelronde: acceptatie-dekking voor `/atlas` en de
1440-regel (e2e toegevoegd, ticket geherformuleerd); expliciete, null-veilige
rangvergelijking met alfabetische tie-break en scènebrede rang; negeren van
`matchMedia`-wisselingen tijdens het printen; één element voor de
toetsenbordhulp; foutmelding bij een lege miniatuur; `--header-offset` als
gedeeld token; opmerking bij het gedeelde breekpunt; attribuut-niveau
assertions; documentatie van terugval en weglating in README en §7.

QA stelde ook de oorzaak vast van het verschil van 112–172 px in kaartpositie
met en zonder JavaScript op entiteitspagina's: de kennisdiepte-keuze boven
het artikel is onder `scripting: none` verborgen. Het is een verschil tussen
twee stabiele toestanden, geen verschuiving bij hydratie; niets te herstellen
in Atlas.

## Verificatie

Herverificatie van beide reviewers op de herstelronde leverde nog drie kleine
punten op (sluitknop onder de scrollvouw van het onderpaneel, bedieningsrij
die na inzoomen een label bedekte, vouwtelling die op Médoc en Libournais
niet meer klopte) plus de wens om de 390-px-controle over alle scèneroutes
te laten lopen, de rangordening tot appellatiegebieden te beperken en het
kiezerpaneel bij herschalen te sluiten. Alle zijn in een derde, korte ronde
verwerkt.

Bouwer, na de derde ronde: `npm run format` schoon; `npm run check` exit 0 met
403 unit-tests; `npx playwright test e2e/atlas.spec.ts` 84 geslaagd;
`npm run test:e2e` 295 geslaagd. Budgetten: index 8,3 KiB gzip (budget 20),
grootste scène 172,9 KiB gzip (budget 250), Atlas-clientchunk 8,3 KiB gzip
(budget 15); miniaturen 1.977–3.039 B padtekst (budget 3.072).

| Meting | Vóór (release één) | Na ronde A |
| --- | ---: | ---: |
| Kaart begint `/atlas/medoc`, 390 px | 1.595 px | 555 px |
| Kaart begint `/atlas/medoc`, 1440 × 900 | 746 px (22 % zichtbaar) | 396 px (72 % zichtbaar) |
| `/atlas`, 390 px | kaart op 3.242 px | regiokaarten in het eerste scherm; overzicht op 1.663 px |
| Pauillac-inbedding, 390 px, kop tot onderkant bedieningsbalk | ≈ 950 px | 557 px |
| Legenda onder de kaart, `/atlas` 1440 px | 1.900 px eronder | 20 px eronder |
| Verschuiving door werkbalk na hydratie | 70–138 px | 0 px |
| Kiezer na klik op Pauillac | Haut-Médoc, AOP Médoc, Pauillac, overkoepelend apart | Pauillac, Haut-Médoc, AOP Médoc, "Ligt ook in: AOP Bordeaux" |
| Unit-tests | 375 | 403 |
| Atlas-browsertests | 54 | 84 |
| Volledige browsersuite | 263/265 | 295/295 |

## Teststrategie voor deze wijzigingen

Automatisch, bij elke wijziging: `npm run check` (schema, miniatuurbudget en
determinisme, kiezervolgorde, vouwtellingen, copy zonder pipelinetaal) en
`npx playwright test e2e/atlas.spec.ts` tegen een productiebuild (84 tests:
kaartpositie met en zonder JavaScript, regiokaarten vóór het overzicht,
gebaren met wiel, sleep, één en twee vingers via CDP, kiezervolgorde en
-klem, gevouwen lijst op 390 en open sticky lijst op 1440, compacte
inbedding, overlap van bediening en labels, geforceerde kleuren, print,
no-JS). De volledige `npm run test:e2e` vóór een merge.

Handmatig, op echte apparaten (de CDP-aanraakemulatie is geen vervanging):
iOS Safari en Android Chrome op `/atlas/medoc` en `/appellations/pauillac`:
één vinger scrolt de pagina altijd; twee vingers verschuiven en knijpen de
kaart; de hint verschijnt bij een éénvingerpoging en verdwijnt vanzelf; de
kiezer opent als onderpaneel met zichtbare sluitknop en sluit met een tik
buiten het paneel; de bedieningsbalk onder het kader voelt als één geheel
met de kaart.
Desktop Safari, Firefox en Chrome: wiel zonder modifier scrolt, met Ctrl/⌘
zoomt; slepen verschuift; klik op een gebied opent de pagina of de kiezer.
Toetsenbord: Tab van de lijst naar het kader, pijltjes en `+`/`−`/`0`, Enter
op een lijstlink. Schermlezer (VoiceOver): de kaart heet "Kaart van Médoc",
het kader beschrijft de toetsen, de kiezer meldt zich als dialoog. Printen
van `/atlas/medoc`: kaart op één pagina, lijst en legenda open. Ten slotte de
inhoudelijke blik: staan de regiokaarten op `/atlas` in de volgorde die de
lezer verwacht, zijn de miniaturen herkenbaar, en klopt elke zichtbare zin
in NL en EN.

## Open punten en vervolg

- De overige voorstellen (rijen 10–21 van de prioriteitsvolgorde, plus
  `UX-24` buren) wachten op een gebruikersbesluit; zie de bijgewerkte
  statuskolom in de [Atlas-UX-review](atlas-ux-review-2026-10-31.md).
- Twee beslispunten blijven open: direct openen van het specifiekste gebied
  bij een gewone klik (`UX-08`, deel twee) en bronvermelding in de taal van
  de lezer (`UX-18`).
- De previewservers op de poorten 3101–3103 delen dezelfde `.next`-map en zijn
  door de nieuwe builds overschreven; alleen poort 3104 toont de huidige
  build betrouwbaar. Ze zijn niet gestopt.
- Niets is gecommit; de werkboom bevat ronde A, de reviews en de
  documentupdates.

## Aftekening

- **UI/UX-review (Opus), derde pas op poort 3104:** bedieningsbalk onder het
  kader op 390 px (Médoc en Libournais), 44 px knoppen, na twee keer inzoomen
  niets bedekt; onderpaneel met zichtbare sluitknop en scrollende lijst,
  Pauillac-blok 557 px; vouwtellingen 8, 12 en 37; Champagne zonder link;
  skiplink niet geprint; op 1440 kolom rechtsboven en kiezer binnen het
  kader. Oordeel: "ship this round". Optioneel vervolg: scrollaanwijzing in
  het kiezerpaneel.
- **QA (Fable), derde pas:** `format:check` schoon, `check` 403 tests,
  Atlas-spec 84 geslaagd (eigen Playwright-server); scrollstructuur van het
  paneel, opruimen van de resize-listener, kaderpositie onafhankelijk van de
  bedieningsbalk, `inCoverage` uit `coverage.shown`, rang alleen voor
  appellatiegebieden, `base.css` beperkt tot de twee afgesproken regels,
  §7/§9 en README gelijk aan de code, werkboom schoon. Geen open bevindingen.
  Oordeel: aftekenen.
- **Orchestrator:** integratie tegen product-, kennisarchitectuur-, geografie-
  en visueel beleid gecontroleerd: geen nieuwe geometrie, miniaturen afgeleid
  van geverifieerde vormen, tellingen en dekking berekend, copy zonder
  pipelinetaal in NL en EN, toetsenbordpad en no-JS intact. `MNT-077`
  afgerond; merge en opheffen van de preview blijven `MNT-076`.
