# Atlas hervat op de featurebranch: contract, docsync en kick-off — 2026-10-30

Review-ID: `QCR-2026-10-30-03`

## Reikwijdte en methode

Op de branch `feat/attempt-at-atlas` heeft de gebruiker besloten Atlas opnieuw
te bouwen. Op `main` blijft het uitstelbesluit van `QCR-2026-10-30-01` gelden.
Deze review legt fase 1 vast: het contract, de documentsynchronisatie, de
tooling en de start van het multi-agentproces. Er is in deze fase geen
geografie geïmporteerd, geen kaart gerenderd en geen route toegevoegd.

Gelezen: alle bindende policies, het historische pilotcontract, de twee
gedateerde Atlasreviews met inspectiebestand, het verwijderde paginabestand uit
de git-historie, het entity- en pipelinemodel en de repositorygrens.

## Samenvatting

- Gebruikersbesluiten: server-gerenderde SVG-scènes met progressive enhancement;
  eerste release Bordeaux-cluster plus Champagne; regio's als appellationmozaïek
  met water en plaatsen, nooit een getekende regio-omtrek; Atlas mag op deze
  branch vroeg als gelabelde preview terugkeren.
- Het [Atlas-implementatiecontract](../docs/atlas-plan.md) is het actieve
  contract. Het legt datastroom, eigenaarschap per agent, het
  geografierecord- en scènemodel, import-, build- en budgetregels, de
  interfaceregels, tests, fasen en ticketmapping vast. Het oude pilotcontract
  is als vervangen gemarkeerd; het bronnenonderzoek blijft geldig.
- Projectmap, productprincipes, kennisarchitectuur, designsysteemplan,
  regionale roadmap, productroadmap, onderhoudsbacklog en de geography-README
  verwijzen nu naar het contract. `MNT-070/071/002/014` zijn hervat met nieuwe
  scope; `MNT-013` blijft geparkeerd.
- Tooling: `shapefile`, `proj4`, `topojson-server/client/simplify`, `d3-geo` en
  `fflate` met typedefinities als devDependencies; npm-scripts
  `geography:fetch`, `geography:import` en `geography:build`; `.gitignore`
  negeert `src/generated/geography/` en `data/geography/cache/`.
- Drie agents gestart met eigen bestandsgrenzen: geodata (bronnen, fetch,
  import, appellationrecords), build (model, validatie, displaybuild,
  repository, routes) en UI (SVG-scènecomponent, enhancement, legenda, lijst).
  De reviewer start zodra de eerste oplevering er is.

## Bevindingen

- De lokale shell start met Node 20; het project vereist Node 24 via `.nvmrc`.
  Alle agentinstructies schrijven daarom `nvm use` voor ieder commando voor.
- Er is geen 7z-extractor beschikbaar; IGN-bulkbestanden worden vaak als `.7z`
  verspreid. De geodata-agent moet een ZIP-, GeoJSON-, GeoPackage- of
  WFS-distributie kiezen of de behoefte rapporteren.
- Port en Sherry zijn de enige actieve niet-Franse appellations; zij krijgen in
  release één een eerlijke “niet beschikbaar”-toestand.

## Direct gecorrigeerd

Niets inhoudelijks; alleen de hierboven genoemde documentatie- en toolingwijzigingen.

## Verificatie

- `npm audit` na installatie: 0 kwetsbaarheden.
- `npx prettier --check package.json next.config.ts`: geslaagd.
- Volledige `npm run check`, productiebuild en browsersuite volgen aan het eind
  van fase 2, wanneer de agentopleveringen zijn samengevoegd.

## Vervolgacties

Fase 2 volgens het contract: bronnen opnieuw vastgepind en geïmporteerd;
model, validatie, build en repository op fixtures; kaartcomponent op fixtures;
reviewerronde per oplevering; daarna integratie in fase 3.
