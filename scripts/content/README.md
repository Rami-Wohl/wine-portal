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
local asset checksums, producer presentation targets, and Markdown entity links
without writing generated files.

```bash
npm run content:build
```

Runs the same validation, then writes the deterministic runtime bundle `src/generated/content/knowledge-base.json`.

```bash
npm run content:new -- producer example-estate monograph
```

Creates a starter entity package with YAML metadata and Dutch and English Markdown files. It does not add wine facts or media. Producer creation requires an explicit presentation; collection profiles should normally come from a content plan instead.

```bash
npm run content:deps -- scaffold appellation.example
```

Scaffolds planned dependencies. Every content plan uses schema v2, and every producer
dependency must first choose `monograph`, `collection-profile`, or
`register-entry`; the generated draft preserves that decision.

```bash
npm run content:language-audit
```

Inventories possible defensive formulations in every active localized document
and ranks the densest files for human review. Matches are candidates rather than
validation errors: legal boundaries, material uncertainty and genuine conceptual
distinctions often require an explicit negation. Apply the positive-rephrasing
test in `editorial/writing-style.md`; never use this report for automatic prose
replacement.

```bash
npm run content:link-audit
```

Inventories known entity names that still occur as plain text and classifies
them against `editorial/link-audit-decisions.yaml`. The default command is
read-only and reports counts for new, pending, link, skip and false-positive
candidates. It only expands candidate details for new items and items already
marked for linking, so a large reviewed corpus remains usable in the terminal.

```bash
npm run content:link-audit -- --sync
npm run content:link-audit -- --status=pending
```

`--sync` is the only mode that writes: it adds new stable candidate IDs to the
registry as pending without changing existing decisions. Reviewers add `link`,
`skip` or `false-positive` decisions manually, including `reviewed_at` and a
reason for skip or false-positive. The audit never edits Markdown or graph
relations. `--status=<status>` lists one queue; `--all` expands the default new
and link queues.

## Output

The generated bundle contains normalized entities and narratives with their safe
content trees, forward and inverse relations, narrative backlinks, source and media data,
and application indexes for lookup, localized slugs, search, and geography
references.

`src/generated/content/` is ignored by Git and must not be edited manually. Change the canonical content and run `npm run content:build` again instead.
