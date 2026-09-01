<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Oenocademy

Oenocademy is a multilingual, entity-first wine knowledge platform for structured learning and free exploration.

## Binding repository guidance

Start with `docs/project-map.md` for the current system overview and to select
the relevant policies. It is a navigation aid and does not override them.

The following policies are sources of truth, not optional background. Read every
document relevant to a task before editing, and apply them together:

- `docs/product-principles.md` — product, content, design, UI, and application
  work.
- `docs/knowledge-architecture.md` — content models, entities, relations,
  backlinks, routing, search, indexes, and pipelines.
- `docs/content-blocks.md` — canonical Markdown structure, semantic blocks,
  block metadata, entity links, citations, and renderer behavior.
- `docs/geography-policy.md` — places, maps, coordinates, boundaries,
  geographic hierarchy, geometry, and Atlas.
- `docs/visual-language.md` — UI, responsive behavior, imagery, illustration,
  diagrams, maps as presentation, and other visual output.
- `editorial/research-policy.md` — factual content, sources, provenance,
  translation, corrections, imports, and editorial work.
- `editorial/writing-style.md` — voice, regional introductions, readable
  factual prose, localization, and the editorial relationship between text and imagery.

A task can require more than one policy. For example, an Atlas UI change must
follow the product, knowledge architecture, geography, and visual guidance;
writing a regional article also requires the research policy. When guidance
appears to conflict, preserve verified facts and provenance, avoid destructive
replacement of canonical material, and raise the conflict rather than silently
choosing or inventing a resolution.

## Core principles

- Knowledge is entity-first, narrative-second.
- Geography must come from verified geographic data.
- Never fabricate geographic boundaries.
- Concepts may use generated educational illustrations.
- Dutch and English share canonical factual data.
- UI must support progressive knowledge depth.
- Sources and provenance are first-class data.

## Development

Before completing work:

- run lint
- run typecheck
- run tests where relevant
