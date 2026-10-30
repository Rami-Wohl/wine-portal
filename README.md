# Oenocademy

**Navigeer door de wereld van wijn.**

Oenocademy is een meertalig, entity-first kennisplatform voor wijn, gericht op
zowel gestructureerd leren als vrij verkennen. Entities, narratives,
kennisdiepte en bronverwijzingen vormen samen één kennisgraaf voor Explore,
Learn. Atlas is op gebruikersverzoek uitgesteld (2026-10-30); de huidige
pagina en navigatie zijn verwijderd. De [productplanning](docs/product-roadmap.md)
geeft inhoud voor Leren en Ontdekken voorrang.

De publieke interface en content zijn beschikbaar in Nederlands en Engels.
Nederlandse URLs blijven ongewijzigd; Engelse pagina's staan onder `/en`.
De taalwisselaar behoudt hetzelfde onderwerp en geldige leerpadcontext.
Canonical feiten, relaties en voortgang blijven gedeeld. Beide talen gebruiken
Engelse slugs; afwijkende Nederlandse slugs blijven permanente redirects binnen
de gekozen taal. Zie [taalkeuze en routing](docs/localization-routing.md).

## Snel starten

Vereisten:

- Node.js **24.22.2 LTS**, vastgelegd in `.nvmrc`;
- npm **11.19.1**, meegeleverd met deze Node-versie;
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
`node --version` moet `v24.22.2` tonen. `.npmrc` laat installaties met een andere
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
**Quality checks** gebruikt de versie uit `.nvmrc`, `npm ci`, een volledige dependency-audit,
`npm run check` en de volledige productiebuild/browsersuite. Twee browserworkers
begrenzen het geheugengebruik; foutdiagnostiek blijft zeven dagen beschikbaar.
Een afsluitende `git diff --exit-code` detecteert ook achterlopende gevolgde
buildoutput, zoals `docs/entity-status.md`. Commit die gegenereerde wijzigingen
samen met de bijbehorende contentwijziging.

De workflow heeft alleen leesrechten op repositorycontent, bewaart geen Git-
credentials en gebruikt vastgepinde Action-commits. Een workflowbestand maakt
zijn resultaat niet automatisch verplicht voor merges: de eerste GitHub-run en
branch protection moeten nog worden bevestigd (`MNT-056`).

`npm audit --audit-level=low` controleert productie- én ontwikkeldependencies
en blokkeert CI bij iedere gemelde kwetsbaarheid vanaf low. De volledige en
productieaudit zijn op 2026-10-30 schoon na de beveiligingsupdates. De eerdere
`braces`-advisory is ingetrokken; de compatibiliteitsgate voor ESLint 10 wordt
afzonderlijk gevolgd via `MNT-073`. Zie de
[dependencyreview](editorial/dependency-security-review-2026-10-30.md).

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
