# Pomerol-producentenpilot — 2026-09-09

Review-ID: `QCR-2026-09-09-03`

## Scope

End-to-end controle van de eerste actieve producentenverzameling op
`appellation.pomerol`, plus de afzonderlijke monografie van `producer.petrus`
en de schaalbaarheid van de Ontdekken-pagina.

## Uitkomst

- Le Pin, Vieux Château Certan, Lafleur, La Conseillante, L’Évangile, Trotanoy,
  Clinet en Gazin hebben ieder een tweetalig collectieprofiel met een stabiele
  anchor, eigen bronverwijzingen en een expliciete leerfunctie.
- De selectie wordt als leerroute gepresenteerd, niet als zelfgemaakte
  classificatie. Petrus blijft terecht buiten de verzameling als monografie.
- Alle acht producerrecords zijn actief. Zoeken en entiteitslinks wijzen naar
  de ownerpagina; de oude directe producentenroute stuurt door naar dezelfde
  anchor.
- De profielen verschijnen op niveau Verdieping. De algemene
  classificatie-uitleg blijft Basis; specialistische markt- en
  uitzonderingskennis blijft Gevorderd.
- De bestaande Pomerolbeelden functioneren als gedeelde regionale context.
  Acht afzonderlijke beeldparen zouden de pagina onnodig zwaar en lang maken.
- Een speciaal collectiecomponent is nu niet gerechtvaardigd. De bestaande
  semantische `detail`-blokken leveren goede progressive disclosure, anchors,
  bronweergave en no-JavaScript fallback. Een component wordt pas heroverwogen
  als een tweede actieve collectie een aantoonbaar terugkerend
  vergelijkingspatroon nodig heeft.
- Petrus heeft een complete NL/EN-monografie met documentaire wijngaard- en
  flesfoto, progressive knowledge depth en tijdgebonden bronvermelding.
- Ontdekken rendert per categorie maximaal vijf alfabetische voorbeelden.
  Volledige categorieën openen een gefilterde resultatenpagina met maximaal 48
  onderwerpen per pagina. Daardoor groeit de startpagina niet mee met het
  totale aantal entiteiten.

## Controle

- Contentvalidatie, formattering, lint, typecheck en 79 unit tests slagen.
- De nieuwe Playwright-tests controleren compacte categorieën, collectie-
  anchors, redirects, kennisdiepte, beelden en mobiele overflow.
- Desktopweergaven van Ontdekken, Pomerol en Petrus zijn visueel beoordeeld.

## Vervolg

De pilot rechtvaardigt geen nieuw infrastructuurwerk. Het volgende
contentcohort kan het vastgelegde owner-plus-anchorpatroon hergebruiken. Bij de
tweede collectie moet opnieuw worden getoetst of vergelijkende velden werkelijk
vaak genoeg terugkeren voor een eigen presentatielaag.
