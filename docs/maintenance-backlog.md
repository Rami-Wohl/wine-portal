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

Peildatum: 2026-09-08.

| Status | Aantal | Acties |
| --- | ---: | --- |
| Open | 11 | `MNT-001`, `MNT-003` t/m `MNT-012` |
| Gepland | 0 | — |
| Bezig | 0 | — |
| Geblokkeerd | 3 | `MNT-002`, `MNT-013`, `MNT-014` |
| Afgerond | 5 | `MNT-015` t/m `MNT-019` |
| Vervallen | 0 | — |

Van het uitvoerbare open werk hebben vijf acties prioriteit `hoog` en zes
prioriteit `middel`. De drie geblokkeerde acties zijn afhankelijk van een
betrouwbare Atlas- en geographydatalaag.

## Open werk

### `MNT-001` — Assemblage wereldwijd verbreden

- **Status:** open
- **Prioriteit:** hoog
- **Categorie:** content, research
- **Scope:** `concept.assemblage`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de uitleg is bruikbaar, maar voorbeelden en bronbasis leunen te
  sterk op Bordeaux voor een algemeen wijnbouwkundig concept.
- **Klaar wanneer:** de NL- en EN-pagina's behandelen representatieve
  toepassingen buiten Bordeaux, waaronder waar passend multi-vintage,
  mousserende wijn en assemblage van rassen, percelen of partijen; de bronbasis
  ondersteunt die bredere scope en beide talen blijven inhoudelijk gelijk.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

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

### `MNT-003` — Classificatievisual voor Bordeaux 1855

- **Status:** open
- **Prioriteit:** hoog
- **Categorie:** media, accessibility
- **Scope:** `classification.bordeaux-1855`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de classificatiepagina heeft geen beeld terwijl de hiërarchie
  zich goed leent voor visuele uitleg.
- **Klaar wanneer:** de pagina een rechtenveilige, toegankelijke visual of
  historische documentweergave bevat die de classificatie verduidelijkt zonder
  betekenis uitsluitend via kleur over te brengen.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-004` — Educatieve ampelografievisual

- **Status:** open
- **Prioriteit:** hoog
- **Categorie:** media, content
- **Scope:** `concept.ampelography`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** herkenningskenmerken worden alleen tekstueel uitgelegd.
- **Klaar wanneer:** een rechtenveilige visual scheuttop, blad, tros, bes en pit
  herkenbaar en botanisch verantwoord toont, met gelokaliseerde alttekst en
  caption.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-005` — Gedeelde visual voor lies, autolyse en bâtonnage

- **Status:** open
- **Prioriteit:** hoog
- **Categorie:** media, content
- **Scope:** `concept.lees-ageing`, `concept.autolysis`, `concept.batonnage`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** drie verbonden processen zijn correct beschreven maar missen
  een visueel model van bezinken, contact, afbraak en oproeren.
- **Klaar wanneer:** één samenhangend, herbruikbaar beeldsysteem de verschillen
  en samenhang correct uitlegt en op de relevante pagina's met passende
  gelokaliseerde context wordt ingezet.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-006` — Verdwenen officiële Yquem-bronnen vervangen

- **Status:** open
- **Prioriteit:** hoog
- **Categorie:** research, content
- **Scope:** `producer.chateau-d-yquem`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** vier eerder gebruikte officiële deelpagina's zijn niet meer
  rechtstreeks toegankelijk.
- **Klaar wanneer:** de betrokken claims opnieuw zijn gecontroleerd tegen
  toegankelijke primaire bronnen of gecontroleerde archiefkopieën, nieuwe
  bronrecords zijn gekoppeld waar nodig en de oude provenance bewaard blijft.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-007` — Tweede appellationbeeld voor Pauillac

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `appellation.pauillac`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** één châteaubeeld vertegenwoordigt de appellation visueel te
  smal.
- **Klaar wanneer:** een tweede rechtenveilig beeld een appellationkenmerk zoals
  landschap, estuariuminvloed, kiezelterroir of ruimtelijke context uitlegt en
  niet slechts nog een beroemde producent portretteert.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-008` — Procesvisual voor methoxypyrazinen

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.methoxypyrazines`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de relatie tussen concentratie, rijping en waarneming blijft
  abstract zonder beeld.
- **Klaar wanneer:** een toegankelijke visual de causale keten zorgvuldig en
  zonder schijnprecisie toont.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-009` — Procesvisual voor vluchtige thiolen

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.volatile-thiols`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de omzetting van geurloze precursoren tijdens gisting naar
  waarneembare aroma's is visueel beter uit te leggen.
- **Klaar wanneer:** een toegankelijke visual precursor, gistingsstap en vluchtig
  aroma correct verbindt en de beperkingen van het vereenvoudigde model noemt.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-010` — Procesvisual voor klonale selectie

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** media, content
- **Scope:** `concept.clonal-selection`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** selectie, vermeerdering en genetische variatie zijn tekstueel
  correct maar visueel lastig te onderscheiden.
- **Klaar wanneer:** een toegankelijke visual het selectie- en
  vermeerderingsproces toont zonder een kloon als genetisch onveranderlijk of
  als kwaliteitsgarantie voor te stellen.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-011` — Toepassingen bij autolyse en liesrijping toevoegen

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** content, research
- **Scope:** `concept.autolysis`, `concept.lees-ageing`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de mechanismen zijn goed uitgelegd, maar herkenbare toepassingen
  in verschillende wijnstijlen blijven beperkt.
- **Klaar wanneer:** beide pagina's enkele wereldwijd relevante, zorgvuldig
  begrensde toepassingen bevatten zonder effect als vaste smaakgarantie te
  presenteren; NL en EN blijven gelijkwaardig.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

### `MNT-012` — Retrospectieve contentbrief voor Grand Vin

- **Status:** open
- **Prioriteit:** middel
- **Categorie:** content
- **Scope:** `concept.grand-vin`
- **Herkomst:** `QCR-2026-09-08-01`
- **Bevinding:** de actieve pagina is inhoudelijk op orde, maar mist het
  procesdocument waarmee scope, vragen en bewuste uitsluitingen later kunnen
  worden herleid.
- **Klaar wanneer:** een compacte contentbrief de bestaande scope en
  kennisniveaus documenteert zonder nieuwe proza of feiten als filler toe te
  voegen.
- **Log:** 2026-09-08 — geregistreerd vanuit de content-health-review.

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

## Historie

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
