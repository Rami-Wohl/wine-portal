# Dependency- en securityronde — 2026-10-30

Review-ID: `QCR-2026-10-30-02`

## Opdracht en methode

Op gebruikersverzoek npm-dependencies en de vermoedelijke Next.js-kwetsbaarheid
controleren en benodigde updates uitvoeren. Begonnen met de ongecommitte
Atlasverwijdering en het bewaarde Atlasresearchwerk; die wijzigingen zijn behouden.
De officiële npm-registry en de primaire advisories zijn geraadpleegd, niet
alleen een versielijst of zoekresultaat. Audits zijn na een schone `npm ci` herhaald.
[Machineleesbaar auditbewijs](measurements/dependency-audit-2026-10-30.json)
bewaart de voor-/nametingen, versies en lockfilehashes.

## Bevindingen vóór updates

- Volledige audit: vijf dependencyvermeldingen — één critical, twee high en
  twee moderate. Productieaudit: één critical en één high.
- Next 16.4.0 valt in het getroffen bereik van drie advisories van 14 oktober:
  [SVG/image-optimization RCE](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw),
  [use-cache typed-array RCE](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)
  en [Server Actions DoS](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r).
  De [officiële update](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
  noemt 16.4.1 als eerste gepatchte 16.x-versie. Npm en de officiële releasepagina
  wijzen 16.4.3 aan als actuele stabiele versie op de controledatum.
- Er zijn geen eigen `use cache`-/`use server`-directives of ingeschakelde
  Cache Components gevonden. Sharp stond al op 0.35.5, de genoemde workaround
  voor de SVG-advisory. Dit is geen bewijs van exploiteerbaarheid van deze site;
  de frameworkversie is wel bijgewerkt zoals de maintainer voorschrijft.
- [Zod GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
  betreft resource-uitputting en is opgelost vanaf 4.6.6.
- Vitest/mocker en Vite bevatten meldingen over mockregistratie, padtoegang en
  editor/middlewaregedrag. Die keten wordt als ontwikkeldependency gebruikt;
  ook de veilige compatibele fixes daarvan zijn geïnstalleerd.
- De oorspronkelijke [braces-advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
  is op 23 oktober ingetrokken als niet praktisch exploiteerbaar. Het verdwijnen
  daarvan is geen braces-patch en geen auditonderdrukking.
- Node 24.21.0 mist de [securityrelease van 21 oktober](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
  De huidige 24.x-LTS-versie is [24.22.2](https://nodejs.org/en/blog/release/v24.22.2),
  inclusief die fixes en de daaropvolgende V8-/streamcorrecties.

## Uitgevoerd

| Onderdeel | Voor | Na |
| --- | --- | --- |
| Node LTS | 24.21.0 | 24.22.2 |
| Meegeleverde npm | 11.19.0 | 11.19.1 |
| Next / eslint-config-next | 16.4.0 | 16.4.3 |
| React / React DOM | 19.2.8 | 19.3.1 |
| Zod | 4.5.4 | 4.6.7 |
| Vitest / mocker | 4.1.11 | 4.1.12 |
| Vite, transitief | 8.2.2 | 8.3.5 |
| Playwright | 1.62.1 | 1.64.1 |
| Prettier | 3.9.6 | 3.9.10 |
| YAML | 2.9.0 | 2.9.1 |
| tsx | 4.23.13 | 4.23.15 |

Node is via nvm vanaf de officiële Node-download geïnstalleerd; nvm bevestigde
de SHA-256-checksum. `.nvmrc`, packageManager en README sluiten op de gebruikte
runtime en meegeleverde npm aan. Er is geen globale defaultalias gewijzigd.
Andere compatibele transitieve updates en types staan in het lockbestand;
`npm ls --all` bevat geen dependencyconflicten. Geen `--force`, override of
advisory-uitzondering. Een schone installatie uit het bijgewerkte lockbestand slaagt.

De CI-workflow controleert nu alle dependencies met
`npm audit --audit-level=low`, in plaats van uitsluitend high/critical in
productiedependencies. De bestaande beperkte workflowrechten blijven behouden.
Dit is een repositorywijziging, geen reeds uitgevoerde GitHub-run.

## Verificatie

| Controle | Resultaat |
| --- | --- |
| Schone `npm ci` | geslaagd |
| Volledige `npm audit` | nul kwetsbaarheden |
| `npm audit --omit=dev` | nul kwetsbaarheden |
| `npm ls --all` | geen ongeldige peers of dependencyproblemen |
| `npm run format` / `npm run check` | geslaagd; 192 unit-tests |
| `npm run build` | Turbopack-productiebuild geslaagd op Node 24.22.2 |
| `CI=true npm run test:e2e -- --workers=2 --retries=0` | Webpack-build en 211/211 Chromiumtests geslaagd zonder retries |
| `CI=true npm run test:feedback-prototype` | 34/34 bestaande prototypeflows geslaagd |
| Workflow-YAML | geldig; volledige audit en bestaande read-only rechten bevestigd |

Er is geen nieuwe applicatiefunctie of wijncontent toegevoegd. De build gebruikt
nog dezelfde 372 entities, 16 narratives, twee paths, 190 media en 1.372 relaties.
Tests controleren ook Learn-voortgang, NL/EN, afbeeldingen en de Atlasverwijdering.

## Resterend werk en grenzen

MNT-055 sluit de eerdere dependencytriage af. ESLint 9.39.5 is unsupported, maar
de actuele React-lintplugin 7.37.5 accepteert ESLint slechts tot `^9.7`.
**MNT-073** bewaart daarom de afzonderlijke ESLint-10-migratie als geblokkeerd
compatibiliteitsonderhoud, met hercontrole uiterlijk 30 november. Er zijn nu
geen open npm-auditmeldingen. TypeScript 7, Vitest 5 en Node/types 26 zijn
nieuwe majorlijnen; de huidige compatibele lijnen leveren de benodigde fixes.

Nul auditmeldingen betekent dat de registry op deze datum geen bekende meldingen
voor deze dependencyboom rapporteert; het bewijst geen afwezigheid van onbekende
kwetsbaarheden of problemen buiten npm. De huidige wijzigingen zijn lokaal en
nog niet gecommit, gepusht of gedeployd. Nieuwe Actions-/Vercel-verificatie blijft
MNT-056. Vercel beheert de exacte Node-patch binnen `24.x`; controleer de Node-versie
in de nieuwe deploymentlog en test de live site na uitrol.
