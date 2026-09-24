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

- Node.js `20.9.0` of nieuwer, zoals vereist door de vastgepinde Next.js-versie;
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

## Mentale kaart

```text
content/entities + content/narratives + content/learning-paths + data/sources + data/media
                              │
                              │ content:check / content:build
                              ▼
             src/generated/content/knowledge-base.json
                              │
                              ▼
                  Next.js-routes en React-UI
```

- `content/` bevat canonical entity-, narrative- en learning-pathpackages.
- `data/sources/` en `data/media/` bevatten herbruikbare bron- en
  mediametadata.
- `public/media/` is de huidige lokale opslagadapter voor mediabestanden.
- `src/generated/content/knowledge-base.json` is afgeleid, wordt niet gecommit
  en mag nooit handmatig worden aangepast.
- `src/` bevat de applicatie, renderer en presentatie; het is geen tweede
  feitenbron.
- `docs/entity-status.md` is een gegenereerd maar wél gevolgd overzicht van alle
  entities en hun publicatiestatus.

Lees eerst [de projectkaart](docs/project-map.md) voor de feitelijke workflow en
canonical ownership. `AGENTS.md` wijst per taak naar de bindende product-,
architectuur-, content-, geography-, visuele en researchrichtlijnen.

## Content authoren

Een entitypackage combineert gedeelde data met gelokaliseerde uitleg:

```text
content/entities/<type>/<slug>/
├── entity.yaml
├── content-plan.yaml  # verplicht redactiecontract waar het archetype dit vereist
├── overview.nl.md
└── overview.en.md
```

`entity.yaml` bepaalt wat een entity is: identiteit, stable ID, relaties,
assertions en provenance. De Markdownbestanden leggen dezelfde kennis per taal
uit. Relaties verwijzen naar stable IDs; inverse relaties en backlinks worden
door de pipeline afgeleid. Applicatieroutes en provider-URLs horen niet in
canonical content.

De dagelijkse workflow is:

1. Lees [content authoring](docs/content-authoring.md), de relevante policies en
   voor feitelijke content altijd [de research policy](editorial/research-policy.md).
2. Maak voor een grote overzichtsentity eerst de contentbrief en het
   `content-plan.yaml`; scaffold daarna geplande dependencies als één batch.
3. Leg identiteit, relaties, assertions en bronnen vast in YAML.
4. Schrijf en review Nederlands en Engels met dezelfde blockstructuur en
   kennisdekking volgens [content blocks](docs/content-blocks.md).
5. Registreer media, controleer inhoudelijke juistheid en rechten, en verwijs in
   Markdown uitsluitend via een stabiel `media.*`-ID.
6. Valideer tijdens het schrijven; activeer content pas na inhoudelijke,
   relationele, visuele en tweetalige review.

Maak bijvoorbeeld een leeg conceptpackage:

```bash
npm run content:new -- concept example-concept
```

Producenten vereisen altijd een expliciete publicatievorm. Maak een zelfstandige
producent alleen na de monografietoets:

```bash
npm run content:new -- producer example-estate monograph
```

`collection-profile`- en `register-entry`-producenten horen normaal uit een
goedgekeurd contentplan te komen:

```bash
npm run content:deps -- scaffold appellation.example
```

De generator voegt geen wijnfeiten toe. Controleer gegenereerde namen en slugs
altijd voordat je het package inhoudelijk vult.

### Media

Plaats huidige lokale bytes onder `public/media/<storage_key>` en het bijbehorende
record onder `data/media/`. Dat record bewaart onder meer stable ID, opslagkey,
afmetingen, gelokaliseerde alttekst, credit, rechten en checksum. Canonical
Markdown bevat alleen het media-ID. Een latere CDN-migratie kan daardoor dezelfde
storage keys via `MEDIA_BASE_URL` leveren zonder contentbestanden of URLs
handmatig te herschrijven.

Fotografie documenteert echte plaatsen en objecten; illustratie legt een proces
of gecontroleerde abstractie uit. Volg voor selectie, nauwkeurigheid, captions en
responsive presentatie [de visuele richtlijnen](docs/visual-language.md).

## Commando's

| Commando | Doel |
| --- | --- |
| `npm run dev` | Genereert content en start de ontwikkelserver op poort 3000 |
| `npm run build` | Genereert content en maakt een productionbuild |
| `npm run content:check` | Valideert canonical content zonder bestanden te schrijven |
| `npm run content:build` | Valideert, genereert de runtimebundle en vernieuwt `docs/entity-status.md` |
| `npm run content:status` | Vernieuwt alleen het entity-statusoverzicht na validatie |
| `npm run content:new -- <type> <slug>` | Maakt een leeg entitypackage; producenten vereisen extra presentatieargumenten |
| `npm run content:deps -- scaffold <entity-id>` | Maakt ontbrekende dependencies uit een geldig contentplan als drafts aan |
| `npm run content:link-audit` | Rapporteert bekende entitynamen die mogelijk nog niet zijn gelinkt |
| `npm run content:relation-audit` | Controleert de structurele minimumdekking van actieve entityrelaties |
| `npm run format` | Formatteert code, CSS, JSON en YAML met de vastgepinde Prettier-versie |
| `npm run check` | Controleert formatting, lint, types, unit-tests en relationele dekking |
| `npm run test:e2e` | Bouwt de productieapp en draait de volledige Playwright-suite in Chromium |
| `npm run test:e2e:live` | Draait de niet-destructieve Learn-smokesuite rechtstreeks tegen de publieke Vercel-omgeving |

Markdown valt bewust buiten Prettier: de eigen directives worden door de
contentpipeline gevalideerd en mogen niet door een algemene Markdownformatter
worden herschreven.

## Wat test je wanneer?

Voer vóór iedere oplevering minimaal uit:

```bash
npm run format
npm run check
```

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

## Verdieping

- [Projectkaart](docs/project-map.md) — systeemoverzicht en dagelijkse workflow
- [Content authoring](docs/content-authoring.md) — packages, plannen, relaties,
  kennisdiepte, lokalisatie en media
- [Content blocks](docs/content-blocks.md) — canonical Markdowncontract
- [Research policy](editorial/research-policy.md) — feiten, bronnen, provenance,
  vertaling en correcties
- [Writing style](editorial/writing-style.md) — redactionele stem en volledigheid
- [Knowledge architecture](docs/knowledge-architecture.md) — model, routing,
  search, indexes en migraties
- [Visual language](docs/visual-language.md) — UI, responsive gedrag en beelden
- [Explore-foundation-roadmap](docs/explore-foundation-roadmap.md) — geordende
  tickets voor de wereldwijde basis van wijnstok, wijngaard en vinificatie
- [Explore-foundation-dekking](docs/explore-foundation-coverage.md) — actuele
  owners, bestaande bouwstenen, hiaten en dependencies voor die roadmap
- [Learn-roadmap](docs/learn-roadmap.md) — geordende tickets, beslismomenten en
  definition of done voor de anonieme leerervaring
- [Learn-productbrief](docs/learn-product-brief.md) — doelgroep, niveaumodel,
  succescriteria en afbakening van de anonieme MVP
- [Learn-pilotrelease](docs/learn-pilot-release.md) — productiecontrole,
  privacygrens, observatieperiode en rollback
- [Learning-pathcontract](docs/learning-paths.md) — canonical schema, ownership,
  lifecycle en validatieregels voor leerpaden
- [Content commands](scripts/content/README.md) — compacte technische
  commandoreferentie
