# Developer guide

Start with [project-map.md](project-map.md) for document ownership and the
policies relevant to your change. Use Node 24 and npm 11, then `npm ci`.
Read the relevant installed Next.js guide under `node_modules/next/dist/docs/`
before changing framework code.

## Request flow

```text
Dutch public URL /concepts/... -> src/proxy.ts -> internal /nl/concepts/...
English URL /en/concepts/... -----------------> src/app/[lang]/...
                                               |
                                   src/content/repository.ts (server-only)
                                               |
                                      route + shared renderer
                                               |
                                    HTML + small client props
```

`/nl/...` public aliases redirect to the unprefixed Dutch URL. Localized links
use `src/i18n` and `src/content/routing.ts`; preserve the existing URL contract,
including `/verdiepingen`. Page content and metadata use the same locale.

## Three boundaries

- **Authored data:** `content/` and `data/` own identities, factual relations,
  localized prose, sources and media metadata. Edit these inputs rather than
  generated JSON. Sources and reviewed facts survive refactors.
- **Build:** `scripts/content/pipeline.ts` validates strict schemas and derives
  the graph, backlinks and passage search index. Its modules live under
  `scripts/content/pipeline/`; public model exports live in
  `src/content/model.ts`. The deterministic compact bundle is replaceable.
- **Runtime:** only `src/content/repository.ts` imports the generated bundle.
  Its content lookups are currently synchronous. ESLint and `server-only`
  protect the boundary; client components receive small serialized props.
  `src/components/content-document.tsx` renders the shared block AST. Browser
  learning progress has a separate versioned adapter and no account backend.

## Checks and tests

During authoring, `npm run content:check` validates without writing and
`npm run content:link-audit` finds candidates for human link review. Neither
proves wine facts correct.

Before finishing, run `npm run format` and `npm run check`. The latter builds
and audits the real corpus once, then generates route types, checks TypeScript
and runs Vitest. Standalone `npm test` and `npm run typecheck` still generate
fresh content through their prehooks. Fixture tests intentionally build their
own small corpora. Markdown and generated content are excluded from Prettier.

Unit tests are colocated with content, routing and component logic; pipeline
fixture tests live in `scripts/content/`. Browser tests live in `e2e/`.
Run `npm run test:e2e` for changes affecting routing, rendering, client behavior
or production integration; it builds with Webpack and starts a dedicated
Playwright server. Local Turbopack process permissions are a known environment
constraint, not evidence that a production deployment has passed.

Use [product-roadmap.md](product-roadmap.md) for priorities and the linked
backlogs for current status. Deployment verification remains a separate
external check; a green local suite does not establish GitHub or Vercel state.
