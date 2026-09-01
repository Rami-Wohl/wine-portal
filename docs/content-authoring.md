# Content authoring

Canonical content lives in self-contained packages. Generated indexes live under `src/generated/content/` and must never be edited manually.

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
├── overview.en.md
└── media/
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

Authors never edit `src/generated/content/**`. Rebuild it with `npm run content:build`; canonical content is not stored there. The generator also removes retired split JSON fragments that were previously emitted beside the runtime bundle.
