# Node 24, CI en ontwikkeldependencies — 2026-10-04

Review-ID: `QCR-2026-10-04-02`

## Reikwijdte en methode

Uitvoering van `MNT-047` en het uitvoerbare deel van `MNT-055`, vanaf de schone
gebruikerscommit `9a4e681`. Gecontroleerd zijn de runtime, lockinstallatie,
TypeScript-typen, ontwikkeldependencyketens, GitHub Actions-configuratie en
beschikbaarheid van externe repository-/deploymenttoegang. De
geïnstalleerde Next.js Playwright-guide (`node_modules/next/dist/docs/`)
is gebruikt voor de productiegerichte browsersuite; applicatie- en
contentcontracten veranderen niet.

## Uitgevoerd

- Node **24.21.0 LTS** staat exact in `.nvmrc`. npm **11.19.0** hoort bij deze
  runtime en staat in `packageManager`; engines begrenzen Node op `24.x` en npm
  op `11.x`. `.npmrc` laat een installatie met de verkeerde major stoppen.
- Node 24.21.0 is lokaal via nvm naast de bestaande versies geïnstalleerd; de
  downloadchecksum is geverifieerd. Twee kapotte nvm-links naar het oude Intel-
  Homebrew-pad zijn naar de aanwezige Apple Silicon-installatie hersteld.
  De nvm-defaultalias blijft `20`; in deze repo selecteert `nvm use` versie 24.
- `@types/node` is bijgewerkt van 20.19.43 naar 24.19.1, inclusief bijpassende
  `undici-types`. Andere directe dependencies zijn niet algemeen geüpgraded.
- `brace-expansion` is binnen bestaande compatibele ranges bijgewerkt:
  **1.1.18 → 1.1.21** en **5.0.9 → 5.0.12**. Geen override of forced downgrade.
- De vastgepinde **Quality**-workflow draait op pushes naar `main`, PR's en
  handmatige dispatch. **Quality checks** installeert het lockbestand, doet een
  productieaudit, de bestaande checkketen, Chromiuminstallatie en productie-
  browsertests; hij faalt bij wijzigingen aan gevolgde bestanden na generatie.
- Actions zijn op geverifieerde commits gepind. De workflow heeft alleen
  `contents: read`, geen bewaarde Git-credentials, geen projectsecrets en een
  timeout van twintig minuten. Twee browserworkers begrenzen het gebruik;
  foutdiagnostiek wordt maximaal zeven dagen bewaard.
- De normale productiebuild logt de Node-versie. Volgens het
  [Vercel-runtimecontract](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
  selecteert `engines.node: 24.x` de major voor volgende deployments, ook als
  projectinstellingen anders staan. Vercel beheert zelf de exacte patchversie.

## Resterende ontwikkeldependency

De volledige audit meldt nu **vijf high dependencyvermeldingen** uit één keten:
`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` →
`braces`. De melding voor `brace-expansion` is verdwenen. De productieaudit is
schoon.

Voor `braces` is npm's nieuwste gepubliceerde versie nog 3.0.3. De
[advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) noemt geen patched
version. De Next-plugin importeert fast-glob in `get-root-dirs.js` en roept de
functie aan bij een expliciete `settings.next.rootDir`. Onze ESLint-config
bevat die instelling niet en ontvangt geen publieke gebruikersinvoer.

Deze beperkte bereikbaarheid maakt de dependency niet gepatcht. `MNT-055`
blijft geblokkeerd met hercontrole uiterlijk **2026-10-18**, en eerder bij een
lintconfig-/dependencywijziging. De productieaudit is de blokkerende CI-check;
de volledige audit blijft een expliciete onderhoudscontrole met deze bekende
open melding. Er is geen automation voor die datum ingesteld.

npm meldt daarnaast ESLint 9 als unsupported. Een blinde overstap naar ESLint
10 is niet compatibel met de huidige React-plugin: diens peer-range eindigt bij
`^9.7`. Deze migratie wordt bij dezelfde hercontrole beoordeeld. npm 11 meldt
ook adviserende `allowScripts`-waarschuwingen voor bestaande installscripts;
de schone installatie en validatie slagen zonder nieuwe uitzonderingen.

## Validatie

| Controle | Resultaat |
| --- | --- |
| `nvm use`, `node --version`, `npm --version` | 24.21.0 en 11.19.0 bevestigd |
| `npm ci` op Node 24 | Geslaagd vanuit het bijgewerkte lockbestand |
| Installatie-dry-run op Node 20/npm 10 | Verwacht afgewezen met `EBADENGINE` |
| `npm run format` en `npm run check` | Geslaagd; 133 unit-tests en relationele dekking van 283 actieve entities |
| `CI=true npm run test:e2e` | Webpack-productiebuild en 85 Chromiumtests geslaagd met twee workers |
| `npm run build` | Normale Turbopack-productiebuild geslaagd; buildlog bevestigt Node 24.21.0 |
| `npm audit --omit=dev --audit-level=high` | Nul kwetsbaarheden |
| Volledige `npm audit` | Vijf bekende high ontwikkeldependencyvermeldingen; MNT-055 blijft open |
| Actionlint 1.7.12 | Nieuwe workflow geldig; officiële binarychecksum gecontroleerd |
| Gevolgde generated output | `docs/entity-status.md` ongewijzigd na herbouw |

De CI-job zelf is nog niet op GitHub/Ubuntu uitgevoerd. De lokale browsersuite
is op macOS gedraaid; dat is geen bewijs van een externe run. De complete
werkboom bevat de gewenste wijzigingen, dus de workflowcontrole
`git diff --exit-code` kan pas in een schone checkout van die commit groen zijn.

## Externe verificatie en afbakening

`git ls-remote origin HEAD` faalt nog met `Permission denied (publickey)`.
De repositoryinstellingen openen in de beschikbare browser als uitgelogde
GitHub-404; Vercel redirect naar login. Er zijn geen passende CLI-sessies of
connectoren beschikbaar. Geen credentials, instellingen, push of deployment
zijn gewijzigd om dit te omzeilen.

`MNT-047` sluit het lokale werk af. De oorspronkelijke externe acceptatiepunten
zijn expliciet afgesplitst naar **MNT-056**:

1. Na commit/push moet **Quality checks** op GitHub groen worden; controleer
   daarbij ook Actions-rechten en beschikbare branch protection.
2. Beoordeel of deze check verplicht moet zijn voor merges en leg het gekozen
   beleid vast; het workflowbestand schakelt dat niet zelf in.
3. Controleer na de eerstvolgende toegestane Vercel-deployment de Node 24-regel
   in de buildlog en draai de bestaande `test:e2e:live`-smoke.

De eerstvolgende lokaal uitvoerbare taak is **MNT-045**, het taal-/URL-contract.
De [productplanning](../docs/product-roadmap.md) bevat alle 28 resterende tickets
in uitvoeringsvolgorde, met datumgebonden en geblokkeerde acties apart.
