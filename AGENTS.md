<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wine Knowledge Portal

This repository implements a multilingual, entity-first wine knowledge platform.

## Sources of truth

Read these before making architectural changes:

- `docs/knowledge-architecture.md`
- `docs/product-principles.md`
- `docs/geography-policy.md`

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
