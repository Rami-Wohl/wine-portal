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

- een ondersteunde Node.js LTS-versie; de frameworkondergrens is `20.9.0`,
  maar Node 20 is inmiddels end-of-life. De overstap naar vastgepinde Node 24 LTS
  en CI-validatie staat als `MNT-047` in de onderhoudsbacklog;
- npm en Git;
- Chromium voor de optionele end-to-endtests.

Installeer exact de dependencies uit `package-lock.json` en start de
ontwikkelserver:

```bash
npm ci
npm run dev
```

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
