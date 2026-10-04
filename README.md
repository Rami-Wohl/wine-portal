# Oenocademy

**Navigeer door de wereld van wijn.**

Oenocademy is een meertalig, entity-first kennisplatform voor wijn, gericht op
zowel gestructureerd leren als vrij verkennen. Entities, narratives,
kennisdiepte en bronverwijzingen vormen samen één kennisgraaf voor Explore,
Learn en de toekomstige geografische Atlas.

De publieke interface is momenteel Nederlandstalig. Canonical feiten en
relaties zijn taaloverstijgend; Nederlandse en Engelse content worden beide
expliciet geschreven en gevalideerd. Engelse slugs vormen de canonical publieke
URLs en eventuele afwijkende Nederlandse slugs blijven als legacyredirects
werken.

## Snel starten

Vereisten:

- Node.js **24.21.0 LTS**, vastgelegd in `.nvmrc`;
- npm **11.19.0**, meegeleverd met deze Node-versie;
- npm en Git;
- Chromium voor de optionele end-to-endtests.

Installeer exact de dependencies uit `package-lock.json` en start de
ontwikkelserver:

```bash
nvm install
nvm use
npm ci
npm run dev
```

De eerste twee opdrachten gebruiken [nvm](https://github.com/nvm-sh/nvm).
Gebruik je een andere version manager, selecteer dan de versie uit `.nvmrc`.
`node --version` moet `v24.21.0` tonen. `.npmrc` laat installaties met een andere
Node-major of npm-major expliciet stoppen. De exacte ontwikkel-/CI-pin staat in
`.nvmrc`; `package.json` houdt de ondersteunde reeks op Node `24.x` en npm `11.x`.

Open daarna [http://localhost:3000](http://localhost:3000). `npm run dev`
valideert en genereert eerst automatisch de actuele contentbundle.

Installeer Chromium eenmalig voordat je de Playwright-suite draait:

```bash
npx playwright install chromium
```

De meegeleverde VS Code-instellingen gebruiken de aanbevolen
Prettier-extensie en formatteren ondersteunde bestanden automatisch bij opslaan.

## Wegwijs

Begin bij [de projectkaart](docs/project-map.md): die legt canonical ownership,
de dagelijkse contentworkflow en de relevante policies uit. De
[productplanning](docs/product-roadmap.md) verbindt contentwerk met taalkeuze,
platformonderhoud, Learn en Atlas.

- [Content authoring](docs/content-authoring.md) en
  [content blocks](docs/content-blocks.md) beschrijven packages en Markdown.
- [Content commands](scripts/content/README.md) documenteert generators, audits
  en builds. Producenten vereisen een expliciete publicatievorm.
- [Visual language](docs/visual-language.md) beschrijft beelden en presentatie;
  mediametadata staat onder `data/media/`, huidige bytes onder `public/media/`.
- [Quality assurance](docs/quality-assurance.md) en de
  [onderhoudsbacklog](docs/maintenance-backlog.md) bewaren reviews en vervolgwerk.

Canonical content leeft in `content/` en `data/`. De runtimebundle onder
`src/generated/content/` wordt automatisch gebouwd, niet gecommit en nooit
handmatig aangepast. `docs/entity-status.md` is het gegenereerde, wél gevolgde
publicatieoverzicht. `npm run build` maakt een productionbuild;
`npm run start` serveert die build.

## Wat test je wanneer?

Voer vóór iedere oplevering minimaal uit:

```bash
npm run format
npm run check
```

Markdown valt bewust buiten Prettier; de contentpipeline valideert de eigen
directives. `check` omvat formatting, lint, types, unit-tests en relationele
dekking.

Voeg `npm run content:link-audit` toe wanneer prose of entityverwijzingen zijn
gewijzigd. De audit levert kandidaten op en verandert zelf geen content.

Draai ook de browsersuite wanneer routing, rendering, responsive gedrag,
interactie, toegankelijkheid of een andere volledige gebruikersflow verandert:

```bash
npm run test:e2e
```

## Automatische kwaliteitscontrole

[De Quality-workflow](.github/workflows/quality.yml) draait na pushes naar `main`,
bij pull requests en op handmatig verzoek in GitHub Actions. Eén job
**Quality checks** gebruikt de versie uit `.nvmrc`, `npm ci`, een productieaudit,
`npm run check` en de volledige productiebuild/browsersuite. Twee browserworkers
begrenzen het geheugengebruik; foutdiagnostiek blijft zeven dagen beschikbaar.
Een afsluitende `git diff --exit-code` detecteert ook achterlopende gevolgde
buildoutput, zoals `docs/entity-status.md`. Commit die gegenereerde wijzigingen
samen met de bijbehorende contentwijziging.

De workflow heeft alleen leesrechten op repositorycontent, bewaart geen Git-
credentials en gebruikt vastgepinde Action-commits. Een workflowbestand maakt
zijn resultaat niet automatisch verplicht voor merges: de eerste GitHub-run en
branch protection moeten nog worden bevestigd (`MNT-056`).

`npm audit --omit=dev --audit-level=high` blokkeert CI bij nieuwe high/critical
productiemeldingen. De volledige `npm audit` heeft nog een bekende, ongepatchte
ontwikkeltoolketen (`MNT-055`); die wordt apart getrieerd en niet als schone audit
voorgesteld. Hercontroleer die bij dependencywijzigingen en uiterlijk 2026-10-18.

Vercel gebruikt voor volgende deployments de Node `24.x`-reeks uit
`package.json`; Vercel beheert de patchversie. `npm run build` logt daarvoor de
Node-versie vóór de build. Verifieer die regel in de eerstvolgende deployment;
de bestaande productieomgeving is hiermee nog niet opnieuw uitgerold.

## Productie en Learn-pilot

De publieke omgeving staat op
[`https://wine-portal.vercel.app`](https://wine-portal.vercel.app). De
Learn-smokesuite schrijft uitsluitend tijdelijke browserstaat in de geïsoleerde
Playwrightcontext en muteert geen serverdata. Voer haar na een relevante
productiedeployment uit met:

```bash
npm run test:e2e:live
```

Een andere preview- of productieomgeving kan zonder configuratiewijziging worden
gecontroleerd met:

```bash
PLAYWRIGHT_BASE_URL=https://example.test npx playwright test e2e/learn.spec.ts
```

Playwright controleert de integratie en presentatie, niet de waarheid van
wijninhoud. Feitelijke volledigheid, bronkwaliteit, vertaalgelijkwaardigheid,
mediarechten en visuele nauwkeurigheid blijven afzonderlijke menselijke
reviewstappen. Registreer periodieke controles en vervolgacties volgens
[quality assurance](docs/quality-assurance.md) en de
[onderhoudsbacklog](docs/maintenance-backlog.md).
