# Content authoring

Canonical content lives in self-contained packages. Generated indexes live under `src/generated/content/` and must never be edited manually.

## Begin met een contentbrief, niet met proza

Een nieuwe entity, narrative of ingrijpende herschrijving begint met een tijdelijke
contentbrief onder `editorial/briefs/<package-id>.md`. Kleine correcties en zuivere
bronupdates hebben geen nieuwe brief nodig. De brief is een reviewdocument: hij
wordt niet door de applicatie gelezen en is nooit een tweede canonical feitenbron.

De brief wordt goedgekeurd voordat de Nederlandse Markdownbody wordt geschreven.
Hij bevat minimaal:

1. **Veronderstelde voorkennis** — wat mag de pagina bij binnenkomst wel en niet
   bekend veronderstellen?
2. **Paginabelofte en scope** — wat moet een lezer na afloop begrijpen, en wat
   hoort bewust op een andere entity of narrative?
3. **Lezersvragen** — de concrete vragen waarop de pagina antwoord moet geven.
4. **Dekkingsmatrix** — per noodzakelijke dimensie: op deze pagina behandelen,
   via een andere entity ontsluiten, bewust weglaten of nog onderzoeken.
5. **Sectie-outline** — per block een werktitel, hoofdgedachte, kennisdiepte,
   reden voor die diepte, benodigde bronnen, begrippen/links en eventuele visual.
6. **Dependencyplan** — wat vóór publicatie echt moet bestaan en welke child
   entities, narratives of visuals zonder kwaliteitsverlies later mogen volgen.
7. **Begrippenplan** — jargon bij eerste gebruik in gewone taal uitleggen en
   alleen een entity maken wanneer het begrip zelfstandig vindbaar en herbruikbaar
   moet zijn.
8. **Bronnenplan** — welk soort bron iedere claimfamilie nodig heeft en welke
   onderzoeksgaten nog openstaan.
9. **Claimplan** — per block de twee tot vier centrale uitspraken die onderzoek
   moet kunnen dragen, hun passende bronsoort en hun status (`open`, `supported`
   of `omit`). Dit staat los van de lijst met gevonden bronnen.
10. **Visualvragen** — welke concrete informatie ieder voorgesteld beeld sneller
    of duidelijker moet overbrengen dan tekst alleen.
11. **Publication gate** — de controle waaraan outline, research, dependencies,
    NL/EN en uiteindelijke presentatie vóór publicatie moeten voldoen.

Een brief mag niet uitgroeien tot een tweede knowledge base. Researchnotities,
citaten en verzamelingen geverifieerde feiten blijven er niet langdurig in staan.
Zodra een claim is onderbouwd, verhuist de bron naar `data/sources/` en de kennis
naar assertions, relaties of canonical Markdown. De brief bewaart alleen de
argumentatiestructuur, beslissingen, statussen en nog open vragen.

### Kennisdiepte toekennen

Diepte beschrijft de functie van informatie voor de lezer, niet hoe technisch een
woord klinkt:

- `foundation`: zonder dit punt begrijpt of herkent de lezer het onderwerp
  verkeerd, of kan die niet zinvol verder navigeren;
- `intermediate`: verklaart waarom hoofdpatronen ontstaan of binnen het onderwerp
  verschillen;
- `advanced`: onderzoekt uitzonderingen, grenzen van bekende modellen en
  historische, juridische of technische wisselwerking;
- `specialist`: vraagt primaire vakdocumenten, precieze methoden of een debat
  tussen deskundigen en hoort alleen op de overzichtspagina als dat werkelijk
  nodig is.

Een essentieel vakwoord kan dus `foundation` zijn, mits het direct wordt uitgelegd.
Een detail wordt niet automatisch waardevol doordat het `advanced` heet.

### Wanneer is een outline volledig genoeg?

“Volledig” betekent niet dat alle feiten over het onderwerp op één pagina staan.
De outline is klaar wanneer iedere kernvraag van de beoogde lezer:

- op de pagina wordt beantwoord;
- bewust naar een concrete entity of narrative wordt uitbesteed; of
- als zichtbaar onderzoeksgat is gemarkeerd.

Daarnaast mag geen deelonderwerp de pagina domineren voordat identiteit, plaats,
historische betekenis, interne verscheidenheid en relevantie zijn afgedekt. Iedere
sectie heeft een eigen taak; herhaling en tekst die alleen volledigheid simuleert
worden geschrapt.

Na goedkeuring volgt de volgorde: bronnen verifiëren en registreren, benodigde
claims als `supported` of `omit` besluiten, verplichte dependencies aanmaken,
Nederlandse tekst schrijven en reviewen, de Engelse
lokalisatie schrijven en reviewen, daarna pas buildvalidatie en publicatie.

## Add an entity

Generate a package:

```bash
npm run content:new -- producer example-estate
```

This creates:

```text
content/entities/producers/example-estate/
├── entity.yaml
├── overview.nl.md
└── overview.en.md
```

Review every generated name, then add only verified canonical relations to `entity.yaml`. Reference other entities by stable ID:

```yaml
relations:
  - type: located_in
    target: appellation.example
```

Do not add the inverse relation to the target entity. The pipeline derives it.

## Add a narrative

Create a package under `content/narratives/<type>/<slug>/` containing `narrative.yaml`, `article.nl.md`, and `article.en.md`. The metadata schema requires localized titles, slugs, files, and stable entity references.

Link entities in Markdown without application routes:

```md
[[producer.example-estate]]
[[producer.example-estate|Example Estate]]
```

The first form lets the renderer choose a localized label later. The second supplies the displayed label. Both forms are validated and generate narrative backlinks.

## Write Markdown bodies

Canonical entity overviews and narratives follow `content-blocks.md`. That
contract defines the accepted top-level directives, stable block IDs, heading
rules, block depth, entity links, citations, and NL/EN parity.

The parser, renderer, and strict block validation are implemented.
`content:check` validates block structure, citations, entity links, source
inventories, publication requirements, and hard NL/EN parity. The generated
bundle contains the normalized safe content tree consumed by the server-side
renderer.

## Localization

Canonical facts and relations exist once in `entity.yaml`. Dutch and English names, slugs, and Markdown are localized presentation fields. Both locale files are required in v1 so missing translations are visible during validation rather than silently hidden.

## Sources, geography, and depth

- Reusable source records belong under `data/sources/` and use stable `source.*` IDs.
- Assertions reference source IDs; do not flatten provenance into an unstructured note.
- `geography_id` may reference future verified geography data. Never invent coordinates or boundaries.
- `depth` supports `foundation`, `intermediate`, `advanced`, or `specialist` independently of routes and UI.

## Add media

Create one metadata record under `data/media/` and place its current local file
at `public/media/<storage_key>`. In Markdown, add a bodyless `figure` block that
uses only the stable `media.*` ID. Do not copy paths, URLs, captions or credits
into content. `content:check` verifies the reference, rights metadata, local
file, and SHA-256 checksum. Setting `MEDIA_BASE_URL` later switches delivery to
the same keys on a CDN without rewriting authored content.

## Validate and build

```bash
npm run content:check
npm run content:build
```

`npm run dev` and `npm run build` run content generation first. The generated `knowledge-base.json` bundle includes entity indexes, forward relations, inverse relations, backlinks, localized slug lookups, geography references, and search metadata.

Validation fails for malformed schemas and IDs, duplicate IDs/slugs, missing locale files, unknown entity/source references, unsupported relation types, and malformed entity links. Suggestions are shown for close entity-ID typos.

## Canonical versus generated

Authors edit:

- `content/entities/**`
- `content/narratives/**`
- `data/sources/**`
- `data/media/**`
- `public/media/**` while the local storage adapter is in use

Authors never edit `src/generated/content/**`. Rebuild it with `npm run content:build`; canonical content is not stored there. The generator also removes retired split JSON fragments that were previously emitted beside the runtime bundle.
