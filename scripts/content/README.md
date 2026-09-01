# Content commands

These scripts turn author-written content packages into a validated, derived knowledge graph for the application.

## Input

The pipeline reads canonical content from:

- `content/entities/**/entity.yaml` and their localized Markdown files;
- `content/narratives/**/narrative.yaml` and their localized Markdown files;
- reusable source records under `data/sources/`.
- media records under `data/media/`, with local assets under `public/media/`.

Relationships and narrative links use stable IDs such as `producer.chateau-latour`. Authors store forward relationships once; inverse relationships and backlinks are derived automatically.

## Commands

```bash
npm run content:check
```

Validates schemas, IDs, slugs, locale files, relations, semantic content blocks,
hard NL/EN block parity, source inventories, citations, media references,
local asset checksums, and Markdown entity
links without writing generated files.

```bash
npm run content:build
```

Runs the same validation, then writes the deterministic runtime bundle `src/generated/content/knowledge-base.json`.

```bash
npm run content:new -- producer example-estate
```

Creates a starter entity package with YAML metadata and Dutch and English Markdown files. It does not add wine facts or media.

## Output

The generated bundle contains normalized entities and narratives with their safe
content trees, forward and inverse relations, narrative backlinks, source and media data,
and application indexes for lookup, localized slugs, search, and geography
references.

`src/generated/content/` is ignored by Git and must not be edited manually. Change the canonical content and run `npm run content:build` again instead.
