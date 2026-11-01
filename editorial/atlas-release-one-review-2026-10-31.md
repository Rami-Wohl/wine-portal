# Atlas release één op de featurebranch — 2026-10-31

Review-ID: `QCR-2026-10-31-01`

## Reikwijdte en methode

Op `feat/attempt-at-atlas` is Atlas gebouwd volgens het
[Atlas-implementatiecontract](../docs/atlas-plan.md), na het gebruikersbesluit
van 2026-10-30 (SVG-scènes met progressive enhancement; Bordeaux-cluster plus
Champagne; regio's als appellationmozaïek zonder eigen omtrek; vroege preview).
Dit rapport sluit fase 2 en 3 af. Op `main` blijft het uitstelbesluit van
`QCR-2026-10-30-01` gelden tot de merge (`MNT-076`).

Het werk is uitgevoerd door vijf rolagents onder een orchestrator: geodata,
build, UI, codereviewer en QA, met bestandseigenaarschap per contract §3.
Iedere oplevering kreeg een onafhankelijke codereview; de QA-agent beoordeelde
copy, acceptatietraceerbaarheid, toegankelijkheid en het werkelijke
browsergedrag tegen een productiebuild. Alle bevindingen zijn via de
orchestrator naar de eigenaar gerouteerd en opnieuw gecontroleerd.

## Samenvatting

- **Data.** 86 canonical features met volledige provenance onder
  `data/geography/features/`: 39 appellationgebieden (38 gepubliceerd, Côtes
  de Bordeaux `held`), 8 rivieren, 9 waterlichamen, één kustlijn en 29
  plaatsen. Bronnen: INAO SIQO-gebieden (editie 2026-10-26, Licence Ouverte
  2.0), INAO-productregister, IGN BD CARTO V5 en IGN ADMIN EXPRESS COG 2026
  via 20 vastgepinde WFS-responses die als ruwe bytes zijn gecommit. Acht
  scènes onder `data/geography/scenes/`. Import en fetch zijn deterministisch,
  idempotent en getest (81 tests).
- **Model en build.** Strikt zod-model voor records en scènes; validatie in
  `content:check`; displaybuild met topologiebehoudende vereenvoudiging,
  build-time projectie en budgetcontrole; server-only repository met
  previewschakelaar en Nederlandse slugaliassen. Grootste scène 173 KiB gzip
  (budget 250 KiB); de index 2,7 KiB.
- **Interface.** `/atlas`, `/en/atlas` en acht scèneroutes; inbedding op regio-
  en appellationpagina's direct na de summary; lijstalternatief als
  toetsenbordpad; overlapkiezer; legenda met berekende dekking en credits
  volgens Licence Ouverte 2.0; navigatie, home-kaart en About als
  voorvertoning, gekoppeld aan één schakelaar. Clientscript 4,2 KiB gzip.
- **Eerlijkheid.** Geen regio-omtrek, geen handgetypte dekkingsclaims, geen
  pipeline-termen in publieke copy (getest op de echte scènes), een expliciete
  “nog niet op de kaart”-toestand voor Côtes de Bordeaux en geen kaart voor
  Port en Sherry.

## Bevindingen uit review en QA, en hun afhandeling

- INAO verving de editie van 12 oktober ter plekke door 26 oktober met lege
  sleutelvelden; identiteit steunt nu op exacte denominatielabels, het
  productregister en geometrische consistentie, vastgelegd in ieder record en
  in de [bronreview](atlas-geography-sources-review-2026-10-30.md). Vervolg:
  `MNT-074`.
- De legenda definieerde het INAO-gebied verkeerd (als beplante percelen); de
  definitie is gecorrigeerd op de INAO-brontekst: alle productiestappen,
  gemeenten of delen daarvan, alleen druiven van afgebakende percelen tellen.
- Scènes pasten op het overkoepelende Bordeaux-gebied, water lag onder de
  landvlakken en smalle schermen toonden geen labels; alle drie zijn
  verholpen (fit op selecteerbare gebieden, laagvolgorde context → appellaties
  → water → plaatsen, labelplanner met identieke uitkomst met en zonder
  JavaScript).
- Bordeaux Supérieur en Crémant de Bordeaux delen de vorm van AOP Bordeaux en
  zijn in het overzicht contextlagen geworden.
- In Windows High Contrast waren de vlakken niet aanklikbaar; opgelost met een
  transparante maar geschilderde vulling.
- Uitgesteld naar `MNT-075`: rivierlabels langs de lijn, presentatie van
  vormtweelingen (Graves Supérieures, Saint-Émilion Grand Cru), drukte van het
  overzicht op 320 px, locator-inzet en printcontrole in echte browsers.

## Verificatie

- `npm run format` en `npm run check`: geslaagd, inclusief 375 unit-tests,
  typecheck, lint en de contentbuild met acht scènes binnen budget en
  relationele audit.
- `npm run geography:fetch -- --verify`: 22 van 22 vastgepinde bronnen geverifieerd.
- Volledige browsersuite (`npm run test:e2e`, productiebuild): 263 van 265
  geslaagd; de twee fouten waren een testverwachting op de bewust gewijzigde
  forced-colours-vulling, daarna `e2e/atlas.spec.ts` 54 van 54 geslaagd op
  dezelfde build. Het Atlas-deel dekt routes, aliassen, draft-gedrag, no-JS,
  toetsenbord, kiezer, wiel- en zoomgedrag, forced colours, laagvolgorde,
  labels op 320 px en inbedding.
- QA-browserronde tegen de productiebuild: alle eerdere copy- en
  toegankelijkheidsbevindingen bevestigd als opgelost; geen consolefouten of
  mislukte requests op Atlas-pagina's.
- Screenshots van de eindbuild: [Médoc op 1440 px](measurements/atlas-release-one-medoc-1440-2026-10-31.png)
  en [Barsac ingebed op 320 px](measurements/atlas-release-one-barsac-320-2026-10-31.png).
  Ze zijn gedateerde reviewartefacten, geen media of bron.

## Vervolgacties

`MNT-074` (databronnen), `MNT-075` (presentatie) en `MNT-076` (preview
opheffen en merge) staan in de [onderhoudsbacklog](../docs/maintenance-backlog.md);
`MNT-013` blijft geparkeerd. De branch is niet gecommit; commit en merge zijn
gebruikersbesluiten.
