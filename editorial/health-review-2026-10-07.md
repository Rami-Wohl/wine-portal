# Health review — EXP-021 en dependencyonderhoud

Review-ID: QCR-2026-10-07-01. Peildatum: 2026-10-07.
Scope: audit van volledige en productiedependencyboom, beschikbare updates,
lockfile, CI, worktrees en lokale content-/applicatiechecks. Uitvoering naast
EXP-021; externe deployment en accountinstellingen vallen buiten deze ronde.
Methode: npm audit (ook omit=dev), npm outdated/explain/ls, Git-worktreecontrole,
bronreview van advisories, reproduceerbare installatie en verplichte checks.

## Eerste bevindingen

- Schone checkout bij start, één werkboom op main (221f6a6); geen achterlopende
  extra worktrees om gelijk te trekken.
- Volledige audit: 7 high dependencyvermeldingen; productieaudit: 2 high.
- Nieuwe herstelbare ketens: Next → sharp 0.35.4 en Next/PostCSS → source-map-js
  1.2.1. Beoogde patches binnen bestaande ranges: sharp 0.35.5 en source-map-js
  1.2.2. Deze actie krijgt MNT-057; validatie volgt vóór afronding.
- [Sharp-advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w): kwetsbare
  librsvg-afhankelijkheid; de beschreven RCE-condities betreffen specifieke
  glibc-Linux-runtimes. Geen exploitbaarheid van deze site vastgesteld. De
  imageconfig beperkt bronnen en schakelt SVG-optimalisatie niet expliciet in.
- [Source-map-js-advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q):
  onbeperkte indexed-map-offsets kunnen de event loop blokkeren. Package wordt
  via bouwgereedschap én Next geregistreerd; geen publieke upload/parserroute
  voor door bezoekers aangeleverde source maps gevonden.
- [Braces-advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): bekende
  ontwikkelketen; blijft bij MNT-055. Geen geforceerde ESLint-downgrade.
- Beschikbare major-/feature-updates zijn een inventaris, geen automatische
  migratieopdracht. Deze ronde richt zich op concrete patches en regressies.

## Uitvoering en eindcontrole

- `npm update sharp source-map-js` heeft uitsluitend de betreffende transitieve
  ketens bijgewerkt: sharp 0.35.5, bijbehorende libvips 1.3.4 en source-map-js
  1.2.2. Geen overrides, geforceerde downgrade of wijziging van package.json.
- Schone `npm ci` en `npm ls --depth=0` geslaagd. De npm-waarschuwing over
  install-scripts is geïnventariseerd; geen extra installatierechten toegekend.
  Build, image-optimalisatie en tests werken met de bestaande configuratie.
- Productieaudit: **0** kwetsbaarheden. Volledige audit: **5 high** vermeldingen
  voor braces, micromatch, fast-glob en de twee bovenliggende ESLint-packages.
  Dit zijn vijf dependencyvermeldingen uit dezelfde bekende ontwikkelketen,
  geen vijf nieuwe aangetoonde exploiteerbare applicatieroutes.
- `npm view braces version` geeft nog 3.0.3. De React ESLint-plugin ondersteunt
  ESLint 10 nog niet. MNT-055 blijft geblokkeerd met handmatige hercontrole
  uiterlijk 2026-10-18; de nieuwe productiepatches zijn afgerond als MNT-057.
- `npm outdated` geïnventariseerd: onder meer Next 16.4, React 19.3, ESLint 10,
  TypeScript 7 en Vitest 5 beschikbaar. Deze feature-/major-migraties zijn geen
  vereiste voor de twee securityfixes; de huidige onderling compatibele
  frameworkversies blijven behouden. Kleine overige updates blijven regulier
  onderhoud, geen nieuwe releaseblokkades.
- Eigen ESLint-plugin had één waarschuwing over een anonieme default-export.
  Het object heeft nu een naam; de grensregel en haar gedrag zijn ongewijzigd.
  De laatste lintcontrole bevat geen waarschuwingen of fouten.
- 425 echte lokale Markdown-bestandslinks in docs/editorial gecontroleerd:
  geen ontbrekende doelen. De extra match `url` is het expliciete syntaxvoorbeeld
  in content-blocks.md. Historische reviews blijven behouden; geen relevante
  informatie verwijderd. Roadmaps, coverage en reviewregister zijn bijgewerkt.
- Eén werkboom op main; geen extra worktrees met divergerend werk. Geen branches
  herschreven, commits gemaakt, externe instellingen aangepast of deployment
  als geslaagd verondersteld. MNT-056 blijft de externe releasecontrole.
- `npm run format`, `npm run check` (148 unit-tests), contentvalidatie,
  relatieaudit en productiebuild met webpack geslaagd. De link- en taalaudits
  leveren reviewkandidaten voor EXP-026, geen geconstateerde gebroken links.
- Volledige browsersuite: **125 tests geslaagd**. Na het compacter maken van
  de stabiliteitstabel zijn check en build opnieuw uitgevoerd; de gerichte
  bottling-/Learn-suite slaagde met **21 tests**.
- Handmatige NL/EN-review op 390×844 en 1440×1000: compacte tabel, PNG,
  bijschrift en taalwissel gecontroleerd. Mobiele tabel horizontaal bereikbaar,
  geen pagina-overloop; desktopkolommen passen. Geen consolefouten waargenomen.
  Lokale preview op 3101 draait de definitieve productiebuild.

## Route en vervolg

EXP-021 is voltooid zonder nieuwe entity of dubbele mechanisme-uitleg. Er zijn
nu 353 entities (286 actief), 576 bronnen, 182 media en 1.300 forward relations.
EXP-022 volgt met preventie en diagnose van wijnfouten; flesontwikkeling blijft
EXP-025. De onderhoudscheck verandert de productvolgorde niet: Atlas- en
performancewerk staan vóór verdere regiogroei; backend/API/database houden hun
expliciete beslismoment bij daadwerkelijk gebruik of de Learn-evaluatie.
Alle 19 open tickets staan geordend in de productplanning.
