# Atlas UX- en UI-review met verbetervoorstellen — 2026-10-31

Review-ID: `QCR-2026-10-31-02`

Status: voorstellen. De gebruiker besloot op 2026-10-31 de rijen 1–9 van de
prioriteitsvolgorde te laten bouwen als `MNT-077` (UX-ronde A); de overige
rijen wachten op een volgend besluit. Opvolger van `QCR-2026-10-31-01`
(release één) op `feat/attempt-at-atlas`.

## Reikwijdte en methode

Onderzocht in een echte browser (Chromium via Playwright) tegen de
productiebuild van de branch op poort 3103:

- Oppervlakken: `/atlas`, `/en/atlas`, alle acht scèneroutes,
  `/regions/bordeaux`, `/regions/champagne`, `/appellations/pauillac`,
  `/appellations/barsac`, `/appellations/bordeaux-aop`,
  `/appellations/cotes-de-bordeaux`, de homepagina.
- Viewports: telefoon 390 × 844 (touch), tablet 768 × 1024, desktop 1440 × 900.
- Gemeten: positie van de kaart in het document, paginahoogte, zichtbare
  labels, afmetingen van de klikbare gebieden, layoutverschuiving bij
  hydratie (met en zonder JavaScript), contrast en lettergrootte van kleine
  tekst, uitkomst van klikken en tikken op de kleinste appellaties, gedrag van
  hover, kiezer, activeren, zoomen, slepen en toetsenbord.
- Scripts en alle schermafbeeldingen staan in de sessiescratch
  (`scratchpad/ux/`); drie bewijsafbeeldingen zijn gekopieerd naar
  `editorial/measurements/atlas-ux-review-*-2026-10-31.png`.

Een onafhankelijke, taakgerichte tweede ronde door een aparte agent staat
in de laatste sectie.

## Samenvatting

De kaart klopt inhoudelijk en is toegankelijk, maar de pagina's zijn gebouwd
als document met een kaart erin, niet als kaart met uitleg eromheen. De vijf
grootste knelpunten:

1. **De kaart staat ver onder de vouw.** Op de telefoon begint de kaart van
   `/atlas` na 3.242 px (bijna vier schermen) omdat de volledige lijst van 34
   gebieden eraan voorafgaat; scènepagina's beginnen na 1,5 tot 2 schermen.
   Op desktop is bij het laden maar 150 tot 175 px kaart zichtbaar.
2. **Het bedieningsmodel is onbekend en zit zichzelf in de weg.** "Kaart
   bedienen" moet apart aan; na `+` zoomen kan de lezer niet slepen; knijpen
   op de telefoon zoomt de pagina in plaats van de kaart; de statustekst
   noemt pijltjestoetsen en Esc op een telefoon.
3. **Het Bordeaux-overzicht is op de telefoon geen bruikbaar doelvlak.** 24
   van de 34 gebieden zijn kleiner dan 44 px, 14 kleiner dan 24 px
   (Saint-Georges-Saint-Émilion 7 × 6 px). Elke tik op een klein gebied opent
   een kiezer met vijf tot zeven opties, waarvan drie "Overkoepelend gebied".
4. **De kaart is grotendeels naamloos.** Op desktop dragen 7 van de 34
   gebieden een naam, op de telefoon 3. Zonder hover of lijst is de mozaïek
   anoniem; de lijst staat dan vaak buiten beeld.
5. **Drievoudige uitleg vóór de kaart.** Pagina-intro, figuurintro en legenda
   zeggen elk dat de kaart voor oriëntatie is en geen perceelsgrens; de
   figuurintro gebruikt "oriëntatie" twee keer in twee zinnen.

Daarnaast: een onzichtbare link ("Lees over Médoc" in tekstkleur, zonder
onderstreping), een layoutverschuiving van 70 tot 138 px wanneer de werkbalk
na hydratie verschijnt, rivieren en kust als streeplijnen die als grenzen
lezen, en de regiokiezer onderaan `/atlas` op 3.928 px (desktop) of 4.769 px
(telefoon).

## Metingen

Kaartpositie en labeldekking per route (documentcoördinaten in CSS-px; "klein"
is een gebied met een omsluitend kader kleiner dan 44 px, tussen haakjes
kleiner dan 24 px):

| Route | Viewport | Kaart begint op | Paginahoogte | Labels gebied/plaats | Kleine gebieden |
| --- | --- | ---: | ---: | --- | --- |
| `/atlas` | 390 | 3.242 | 5.909 | 3 / 9 | 24 (14) van 34 |
| `/atlas` | 768 | 1.701 | 4.290 | 7 / 10 | 12 (3) |
| `/atlas` | 1440 | 724 | 5.089 | 7 / 10 | 13 (6) |
| `/atlas/medoc` | 390 | 1.595 | 3.429 | 4 / 4 | 1 (0) van 8 |
| `/atlas/medoc` | 1440 | 746 | 2.358 | 5 / 3 | 1 (0) |
| `/atlas/libournais` | 390 | 1.764 | 3.173 | 2 / 2 | 2 (1) van 12 |
| `/regions/bordeaux` | 390 | 1.456 | 14.709 | 3 / 9 | 24 (14) |
| `/regions/bordeaux` | 1440 | 1.269 | 10.625 | 7 / 10 | 13 (6) |
| `/appellations/pauillac` | 390 | 1.576 | 12.138 | 5 / 3 | 1 (0) |
| `/appellations/pauillac` | 1440 | 1.368 | 9.580 | 5 / 3 | 1 (0) |

Overige metingen:

- Op desktop `/atlas` eindigt de kaart op 1.428 px en begint de legenda op
  3.327 px: de lijstkolom van 2.654 px duwt de legenda 1.900 px onder de
  kaart, met een lege rechterkolom ertussen.
- Op de telefoon is het kaartkader van Libournais 240 px hoog (landschap-
  scène in een smalle kolom); Médoc 585 px; het Bordeaux-overzicht 376 px.
- Op desktop vult de staande Médoc-scène circa 500 van de 880 px
  kaderbreedte; links en rechts blijft 190 px leeg (`max-height: 78vh`).
- Layoutverschuiving door de werkbalk die pas na hydratie verschijnt:
  `/atlas/medoc` 82 px (desktop) en 150 px (telefoon); `/appellations/pauillac`
  194 px en 322 px (waarvan 70 respectievelijk 138 px de werkbalk).
- Op regiopagina's staat de hero-afbeelding pas op 2.096 px (telefoon) en
  2.213 px (desktop); de eerste inhoudssectie op 2.406 respectievelijk 2.705 px.
- Omsluitende kaders op de telefoon (`/atlas/bordeaux`): Saint-Georges 7 × 6,
  Barsac 11 × 17, Loupiac 12 × 14, Saint-Estèphe 15 × 19, Pomerol 19 × 24,
  Saint-Julien 27 × 25, Pauillac 29 × 31 px. Tikken raken wel doel: elk
  opende de kiezer, Sauternes (25 × 38) navigeerde direct.
- Kiezer na een klik op Pauillac (Médoc-scène): "Haut-Médoc, AOP Médoc,
  Pauillac, Overkoepelend gebied: AOP Bordeaux". Op het Bordeaux-overzicht:
  Loupiac zes opties, Saint-Estèphe op de telefoon zeven. Hoogte van de
  kiezer met vijf opties: 365 px.
- Na twee keer `+` (zoom 2,25×) verplaatst slepen de kaart niet; de kaart is
  niet geactiveerd.
- Contrast: statustekst 4,81:1 bij 11,8 px (telefoon), gedempte tekst 5,2:1
  bij 12,8 tot 13,1 px. Alles boven 4,5:1.
- "Lees over Médoc" in de pagina-intro: kleur `rgb(37 40 35)` gelijk aan de
  lopende tekst, geen onderstreping, gewicht 400.
- Champagne ontbreekt in "Kies een regio" en op de homekaart (de regio-
  entiteit is `draft`); de scène is alleen via de URL bereikbaar.
- Werkende onderdelen bevestigd: hover op de kaart markeert de lijstregel en
  omgekeerd; de kiezer krijgt focus op de eerste link en sluit met Esc; Tab
  gaat van de lijst naar het kaartkader (activeert bij toetsenbordfocus) en
  daarna naar de bronvermeldingen; scrollen over een niet-geactiveerde kaart
  scrolt de pagina; zonder JavaScript staan kaart, lijst en legenda er
  volledig.

## Bevindingen en voorstellen

Genummerd `UX-01` tot `UX-22`, gegroepeerd en op volgorde van verwachte
impact; `UX-23` en `UX-24` komen uit de onafhankelijke tweede ronde onderaan. "Beslispunt" markeert voorstellen die het
[Atlas-contract](../docs/atlas-plan.md) of een beleidsdocument raken.

### A. Opbouw en layout

**UX-01 — Kaart eerst.** Op elke Atlas-route moet de kaart op desktop bij
het laden grotendeels zichtbaar zijn en op de telefoon binnen één scherm
beginnen. Voorstel: (a) één kop per pagina: de H1 "Médoc" met één zin; de
figuurkop "Kaart van Médoc" wordt visueel verborgen (blijft voor
schermlezers); (b) de schaalverklaring verhuist naar de uitklap "Over deze
kaart", met één korte regel bij de legenda ("Ter oriëntatie; geen
perceelsgrens"); (c) op schermen smaller dan 980 px vouwt de lijst ook in de
overzichtsvariant, zoals nu al in de ingebedde variant ("Toon alle 34
gebieden"), zodat de kaart direct na de intro komt. Vouwen in plaats van
visueel herordenen met CSS `order` houdt de DOM-volgorde en de
toetsenbordvolgorde gelijk aan wat de lezer ziet.

**UX-02 — Lijstkolom op desktop begrenzen.** De lijst krijgt een maximale
hoogte gelijk aan de kaart (`position: sticky`, interne scroll) of wordt
twee- tot driekolommig onder de kaart; de legenda komt direct onder de kaart
in de rechterkolom (grid-areas). Zo staat de uitleg naast wat ze uitlegt in
plaats van 1.900 px lager.

**UX-03 — `/atlas` als kiezer, niet als document.** De regiokaarten
("Kies een regio") komen direct onder de intro, als raster met per scène een
kleine servergerenderde SVG-miniatuur van haar appellatiemozaïek (dezelfde
geverifieerde vormen, geen regio-omtrek, dus binnen het geografiebeleid).
Het Bordeaux-overzicht volgt daaronder. Aanvullend, als kaartgedreven
doorklik zonder regio-omtrek: wanneer een geklikt gebied tot een deelscène
behoort (afleidbaar uit `intended_entities`), toont de kiezer één extra regel
"Bekijk de kaart van Libournais".

**UX-04 — Compacte ingebedde kaart.** Op entiteitspagina's beslaat het
kaartblok nu circa 950 px (telefoon) tot 1.400 px (desktop) tussen
samenvatting en eerste sectie. Voorstel: één onderschriftregel, bediening op
de kaart zelf (UX-07), lijst, legenda en schaalverklaring samen in één
uitklap "Over deze kaart", de dekkingsregel alleen wanneer iets ontbreekt
(UX-17). Richtwaarde: hoogstens 600 px op de telefoon.

**UX-05 — Geen verschuiving bij hydratie.** De werkbalk wordt servergerenderd
met vaste hoogte (knoppen uitgeschakeld tot de enhancer klaar is) of als
overlay op de kaart getekend, zodat de kaart niet 70 tot 138 px zakt zodra
het script laadt. De resterende 124 tot 184 px verschuiving op
entiteitspagina's komt van buiten Atlas en verdient een eigen meting.

### B. Interactie

**UX-06 — Vertrouwd gebarenmodel in plaats van "Kaart bedienen".**
Beslispunt (contract §9). Voorstel naar het patroon van ingebedde kaarten
dat lezers al kennen: op desktop sleept de muis altijd (slepen conflicteert
niet met scrollen); het muiswiel zoomt alleen met Ctrl/⌘, anders toont de
kaart kort de hint "Gebruik Ctrl + scrollen om te zoomen"; op touch scrolt
één vinger de pagina en bewegen of zoomen twee vingers de kaart, met de hint
"Gebruik twee vingers om de kaart te bewegen"; `+`, `−` en herstel werken
altijd. Het toetsenbordpad blijft: focus op het kader, pijltjes, `+`, `−`,
`0`. De knop "Kaart bedienen" vervalt; eventueel blijft één knop "Kaart
vergroten" over (volledig scherm). De statustekst wordt per invoersoort
gekozen (geen pijltjestoetsen en Esc op een telefoon).

**UX-07 — Bediening op de kaart.** Zoomknoppen en herstel als compacte
overlay rechtsboven in het kader, met pictogram en `aria-label`; "Beginstand"
wordt "Herstel weergave"; de zoomfactor verdwijnt uit beeld of komt als
tooltip. Dat bespaart 70 tot 138 px boven de kaart en volgt de conventie
van elke kaartinterface.

**UX-08 — Kiezer: specifiekste gebied eerst, overkoepelend compact.** Nu
staat het gebied waarop de lezer klikte vaak als derde ("Haut-Médoc, AOP
Médoc, Pauillac") en herhalen drie regels "Overkoepelend gebied:". Voorstel:
sorteren op oppervlakte oplopend (het kleinste, meest specifieke gebied
bovenaan en visueel primair), overkoepelende gebieden als één regel "Ligt ook
in: AOP Bordeaux · Bordeaux Supérieur · Crémant de Bordeaux" met inline
links. Beslispunt: of een gewone klik het specifiekste gebied direct opent en
de stapel in een niet-blokkerende balk "Ook hier: …" toont; het contract
vraagt nu een expliciete keuze bij overlap.

**UX-09 — Kleine gebieden raakbaar maken.** Drie elkaar aanvullende
maatregelen: (a) een onzichtbare bredere raaklijn (`stroke` van 12 px,
transparant) om gebieden kleiner dan 24 px heen; (b) op touch zoomt de eerste
tik op een cluster kleine gebieden eerst in op dat cluster ("tik om in te
zoomen") en opent de tweede tik; (c) op het overzicht verwijzen kleine
gebieden naar hun deelscène (UX-03) in plaats van rechtstreeks naar een
appellatiepagina. Meting als acceptatie: op 390 px geen klikbaar gebied
zonder raakvlak van minstens 24 px in beide richtingen.

**UX-10 — Naam bij de aanwijzer en focus volgt de kaart.** Bij hover en bij
toetsenbordfocus op een lijstregel verschijnt een klein naamlabel in de hoek
van het kader ("Pomerol · Libournais"), en bij focus op een lijstregel
schuift of zoomt de kaart het gebied in beeld. Nu is de enige naam bij de
muis de trage native tooltip en staat de gemarkeerde lijstregel op het
overzicht meestal buiten beeld.

### C. Kaartbeeld

**UX-11 — Meer namen op de kaart.** Voor gebieden waar de naam niet past:
genummerde markers die de lijst herhaalt (klassieke atlasconventie), of korte
verwijslijnen naar een naam buiten het gebied. Labelgrootte minimaal 13 px
voor gebieden en 11 px voor plaatsen; bij inzoomen agressiever labelen (bij
2,5× staan nu alle acht Médoc-namen, bij 1× vijf). Wanneer een appellatie en
een plaats dezelfde naam dragen (Pauillac, Margaux), toont de kaart de plaats
pas bij hoge zoom. Sluit aan op `MNT-075`.

**UX-12 — Water als water.** Rivieren als doorgetrokken lijn met lichte
omlijning (twee strepen), kust als dunne doorgetrokken lijn met een zachte
zeetint erbuiten; het golfpatroon alleen voor estuarium en meren of
vervangen door een vlakke tint. Streeplijnen lezen nu als grenzen of
veerroutes (de Atlantische kust op de Médoc-kaart is een verticale
streeplijn). Onderscheid zonder kleur blijft gewaarborgd door lijndikte,
omlijning en cursieve waterlabels. Arcering van het overkoepelende gebied
lichter en wijder.

**UX-13 — Kader volgt de inhoud.** Op desktop krimpt het kader bij staande
scènes tot de inhoud (gecentreerd) of mag de kaart hoger worden
(`max-height` 85 vh); op smalle schermen krijgen liggende scènes een staande
uitsnede rond de selecteerbare gebieden ("cover" in plaats van "fit") met
verschuiven, zodat Libournais niet 240 px hoog is.

**UX-14 — Palet.** Het grijsgroene land, de grijze arcering en het blauwgrijze
water ogen technisch. Voorstel binnen het visuele beleid: een iets warmere
landtint, helderder water, gedempte maar onderscheidende tinten per cluster
(Médoc, Libournais, Graves en Sauternais, Entre-deux-Mers) als extra cue naast
omtrek en label, met de merkkleur alleen voor het uitgelichte gebied.

### D. Copy

**UX-15 — Eén keer uitleggen.** Pagina-intro, figuurintro en legenda
herhalen de oriëntatieboodschap. Voorstel: de pagina-intro draagt de ene zin
("Geverifieerde appellatiegebieden van Médoc, met water en plaatsen ter
oriëntatie."); de schaalverklaring staat één keer, in de uitklap (UX-01).

**UX-16 — Zichtbare link in de intro.** "Lees over Médoc" krijgt de
linkstijl van de site (kleur, onderstreping) of wordt een duidelijke
vervolgactie onder de intro ("Lees over de regio →"). Dit is een generieke
tekortkoming van `PageIntro` (geen linkregel in `page-intros.css`), dus een
fix helpt ook andere pagina's.

**UX-17 — Dekkingsregel alleen bij een gat.** "Alle 8 appellaties van deze
kaart zijn getekend." in vet onder elke complete kaart is ruis; de regel
blijft alleen wanneer iets ontbreekt of gecontroleerd wordt, en verhuist
anders naar de uitklap.

**UX-18 — Bronvermelding in de taal van de lezer.** Beslispunt (contract §9
schrijft de verbatim attributie voor). De titel van de dataset blijft
letterlijk, de editie- en raadpleegformule wordt vertaald: "INAO,
Délimitation des aires géographiques des SIQO, editie 26 oktober 2026,
hergebruikt onder Licence Ouverte 2.0". Licence Ouverte 2.0 vraagt bron en
datum, geen Franse formulering.

**UX-19 — Homekaart en regiolijst.** "7 kaarten (Blayais en Bourgeais,
Bordeaux, …, Libournais en Médoc)" leest als een datadump; voorstel: "Zeven
kaarten van Bordeaux en zijn deelgebieden, met water en plaatsen ter
oriëntatie." Champagne is nergens vindbaar zolang de regio-entiteit `draft`
is: publiceer de regiopagina of toon de scène in de lijst met het label "in
voorbereiding".

**UX-20 — Tegenstrijdige intro op Champagne.** "De pagina over de regio
volgt." staat naast de link "Lees over Champagne". Eén van beide.

**UX-21 — Knop- en statusteksten.** "Kaart bedienen", "Beginstand", "Zoom
1×" en de lange statuszin ("scroll of knijp om te zoomen, sleep of gebruik de
pijltjestoetsen …") worden korter en per apparaat gekozen; zie UX-06 en
UX-07. Engels: "Use the map" en "Reset view" idem.

**UX-22 — Lichtere legenda.** De definitie van "Productiegebied van een
appellatie" beslaat vier regels. Voorstel: één zin in de legenda en een link
naar een conceptpagina (entity-first: het begrip "appellatiegebied" als
concept) voor de volledige INAO-definitie. De legenda krijgt zo de lengte van
een legenda.

## Wat goed werkt

- Hover en focus synchroniseren lijst en kaart; het uitgelichte gebied houdt
  zijn omtrek boven het water.
- De kiezer bij overlap is eerlijk en toegankelijk (focus op de eerste
  optie, Esc sluit, context onderaan).
- Zonder JavaScript en in print staan kaart, lijst, legenda en bronnen er
  volledig; de werkbalk verschijnt pas als zij werkt.
- Contrast van alle tekst boven 4,5:1; de preview is als zodanig gelabeld;
  dekking en gaten worden berekend, niet getypt.

## Prioriteitsvolgorde op zekerheid van winst

Gevraagd door de gebruiker op 2026-10-31: alle voorstellen op volgorde van de
zekerheid dat ze de bruikbaarheid verbeteren, gewogen naar het aantal lezers
dat ze raakt. Zekerheid: hoog = conventie of gemeten knelpunt zonder
tegenargument; midden = duidelijk knelpunt, aanpak nog te kiezen; laag =
smaak of afhankelijk van uitvoering.

Status bijgewerkt op 2026-10-31 na UX-ronde A (`MNT-077`,
[review](atlas-ux-round-a-review-2026-10-31.md)): rijen 1–9 zijn uitgevoerd;
`UX-20` is meegenomen; `UX-21` is deels gedaan (knopteksten en hints per
apparaat; de hulptekstgrootte vervalt omdat de statusregel weg is). De
overige rijen wachten op een gebruikersbesluit.

| # | Voorstel | Zekerheid | Inspanning | Besluit nodig | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `UX-01` kaart eerst: lijst vouwen op smalle schermen, één kop, schaalverklaring in de uitklap | hoog | klein | nee | uitgevoerd |
| 2 | `UX-03` regiokiezer bovenaan `/atlas`, met miniaturen | hoog | midden | nee | uitgevoerd |
| 3 | `UX-07` + `UX-05` bediening als overlay op de kaart, geen hydratieverschuiving | hoog | klein | nee | uitgevoerd |
| 4 | `UX-08` kiezer: specifiekste gebied eerst, overkoepelend als één regel | hoog | klein | alleen voor direct openen | uitgevoerd; direct openen open |
| 5 | `UX-06` gebarenmodel in plaats van de toggle | hoog | midden | ja (§9) | uitgevoerd |
| 6 | `UX-04` compacte ingebedde kaart op alle regio- en appellatiepagina's | hoog | midden | nee | uitgevoerd |
| 7 | `UX-15` + `UX-17` + `UX-23` één uitleg, dekkingsregel alleen bij een gat, kloppende tellingen | hoog | klein | nee | uitgevoerd |
| 8 | `UX-16` zichtbare link in de pagina-intro | hoog | klein | nee | uitgevoerd |
| 9 | `UX-02` lijstkolom begrensd, legenda naast de kaart op desktop | hoog | klein | nee | uitgevoerd |
| 10 | `UX-11` meer namen: genummerde markers, verwijslijnen, gebiedslabels vóór plaatslabels, stippen zonder naam weg | hoog | groot | nee | open |
| 11 | `UX-09` kleine gebieden raakbaar: bredere raaklijn, tik-om-in-te-zoomen, verwijzing naar deelscène | hoog voor het doel, midden voor de aanpak | midden | nee | open |
| 12 | `UX-12` water als water: doorgetrokken rivieren met omlijning, kust als lijn met zeetint, legenda kloppend | midden-hoog | midden | visueel beleid | open |
| 13 | `UX-21` knop- en statusteksten per apparaat | hoog | klein | nee | grotendeels gedaan in ronde A |
| 14 | `UX-19` homekaart-copy en Champagne vindbaar | hoog | klein | publiceren regio Champagne | open |
| 15 | `UX-10` naamlabel bij hover en focus; focus op lijstregel brengt het gebied in beeld | midden | midden | nee | open |
| 16 | `UX-24` buren op appellatiepagina's | midden | midden | nee | open |
| 17 | `UX-18` bronvermelding in de taal van de lezer | midden | klein | ja (§9) | open, beslispunt |
| 18 | `UX-22` lichtere legenda, uitleg naar een conceptpagina | midden | midden | kennisarchitectuur | open |
| 19 | `UX-13` kader volgt de inhoud; staande uitsnede op smalle schermen | midden | midden | nee | open |
| 20 | `UX-20` tegenstrijdige intro op Champagne | hoog | klein | nee | uitgevoerd in ronde A |
| 21 | `UX-14` palet | laag | midden | visueel beleid | open |

Nieuw uit de herverificatie van ronde A, nog zonder rij: labels zonder
JavaScript op 1440 px zijn klein door de letterbox van staande scènes
(hoort bij `MNT-075`, no-JS-labelplanning); het kiezerpaneel op de telefoon
toont niet dat zijn lijst scrolt wanneer meer dan twee gebieden overlappen
(een onderfade zoals bij de lijstkolom volstaat; klein).

## Voorgestelde volgorde

1. **Ronde A, structuur (UX-01 t/m UX-05, UX-15 t/m UX-17):** grootste
   winst, geen contractwijziging nodig behalve de plaats van de
   schaalverklaring (§9 noemt haar als onderdeel van de scène, niet van de
   intro).
2. **Ronde B, interactie (UX-06 t/m UX-10, UX-21):** vraagt twee besluiten
   van de gebruiker: het gebarenmodel (UX-06) en het kiezergedrag (UX-08).
3. **Ronde C, kaartbeeld (UX-11 t/m UX-14):** samen met `MNT-075`; UX-12 en
   UX-14 raken `docs/visual-language.md` (kaarten als presentatie).
4. **Ronde D, copy (UX-18 t/m UX-20, UX-22):** UX-18 is een
   contractbeslissing; UX-22 vraagt een conceptentiteit en valt daarmee onder
   de kennisarchitectuur.

Acceptatie per ronde in de browsersuite: kaartpositie bij laden (desktop
minstens 60 % van het kader in beeld, telefoon binnen 900 px), geen
layoutverschuiving boven 0,05 CLS door Atlas, geen klikbaar gebied met een
raakvlak onder 24 px op 390 px, kiezer met het specifiekste gebied bovenaan,
geen dubbele oriëntatiezin in de zichtbare tekst.

## Onafhankelijke tweede ronde

Een aparte agent (Opus) liep zes lezerstaken door op telefoon en desktop
zonder deze review of eerdere reviews te lezen: van de homepagina naar
Pomerol ten opzichte van Saint-Émilion en de Dordogne; Saint-Julien openen
vanaf de Médoc-kaart; op de telefoon inzoomen en naar Margaux schuiven en
daarna verder lezen; vanaf de Pauillac-pagina een buur vinden; alleen met het
toetsenbord de Médoc-kaart bedienen; legenda en bronnen lezen als leek. De
tien bevindingen bevestigen UX-01, UX-03, UX-06 t/m UX-09, UX-11, UX-12,
UX-15, UX-17, UX-18 en UX-22. Nieuw of scherper:

- **Taakkosten.** Van home naar de kaart van Libournais: twee tikken en
  ongeveer acht schermen scrollen op de telefoon (overzicht 4.800 px, daarna
  nog 1.750 px tot de kaart). Op `/atlas` zijn 63 Tab-drukken nodig om de
  regiolink Médoc te bereiken, omdat de lijst van 38 links voorgaat. Voorstel:
  skiplink "Naar de kaart" en de regiokiezer vóór de lijst (UX-03).
- **Toggle zonder uitstand (UX-06).** "Kaart bedienen" houdt dezelfde tekst
  in beide standen; alleen `aria-pressed` wisselt. Op een telefoon vult het
  geactiveerde kader circa 70 % van het scherm en schuiven vegen op de kaart
  alleen de kaart (bewust: `touch-action: none`), zodat de lezer de weg
  terug naar de pagina moet zoeken. Een veeg in de zijmarge van 16 px scrolde
  in de emulatie evenmin; dit vraagt controle op een echt toestel. Voorstel:
  de knoptekst wisselt naar "Kaart loslaten", het geactiveerde kader blijft
  onder 60 vh of krijgt een losknop op de kaart.
- **Tellingen spreken elkaar tegen (nieuw, UX-23).** Op
  `/appellations/pauillac` zegt de vouw "Toon de andere 8 gebieden" (inclusief
  het overkoepelende AOP Bordeaux) en de regel onder de kaart "Alle 8
  appellaties van deze kaart zijn getekend" (zonder). Voorstel: overkoepelende
  gebieden buiten de "andere"-telling houden; samen met UX-17.
- **Buren onvindbaar vanaf een appellatiepagina (nieuw, UX-24).** Vanaf
  Pauillac zijn Saint-Estèphe en Saint-Julien noch gelabeld op de kaart, noch
  zichtbaar in de gevouwen lijst. Voorstel: een regel "Buren" naast de
  uitgelichte lijstregel, afgeleid uit de scène (aangrenzende gebieden), of ten
  minste de buurlabels altijd tonen wanneer een gebied is uitgelicht.
- **Legenda en kust spreken elkaar tegen (UX-12).** De legenda zegt
  "estuaria en kust als vlak met golfpatroon", maar de Atlantische kust is een
  streeplijn zonder zeevlak. Garonne en Dordogne verschijnen bij Bordeaux als
  twee tot drie evenwijdige streeplijnen (oevers plus as) en lezen als wegen.
- **Plaatslabels op de plek van gebiedslabels (UX-11).** Op de Médoc-kaart
  op de telefoon zijn "Saint-Estèphe" en "Pauillac" plaatslabels terwijl de
  gelijknamige appellaties geen label hebben; meerdere stippen hebben geen
  naam (Margaux, Saint-Julien-Beychevelle, Bordeaux). Op Libournais is het
  enige "Pomerol" het plaatslabel naast Libourne. Voorstel: gebiedslabels
  gaan vóór plaatslabels; een stip zonder label vervalt; plaatsen krijgen een
  afwijkende stijl (open stip, kleiner cursief).
- **Copy (UX-15, UX-22).** "INAO" wordt niet uitgelegd; "getekend",
  "kaartvorm wordt nog gecontroleerd", "geverifieerde appellatiegebieden" en
  "houdt het herkenbaar als achtergrond" klinken als werkplaatstaal;
  "Gironde-estuarium" is begrijpelijk maar "de Gironde" natuurlijker;
  "Overkoepelend gebied" is zonder arcering ondoorzichtig; "Lees over Médoc"
  loopt zonder punt door op de vorige zin; de licentiezin wordt drie keer
  herhaald in de bronvermelding.
- **Lettergrootte hulptekst (UX-21).** 11,8 px bij 4,8:1 haalt AA, maar is
  klein voor een instructieregel; minimaal 13 px.

Werkt goed volgens de tweede ronde: hover- en focusmarkering, progressieve
labels bij inzoomen (bij 2,3× staan Saint-Julien, Listrac en Moulis leesbaar),
nooit gekaapt scrollen in de ruststand, gerespecteerde gemodificeerde klikken,
en consistente Engelse copy.
