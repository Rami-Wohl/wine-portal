# Performance budgets and measurement

Engineering reference for `MNT-052`, completed 2026-10-11. Canonical facts remain
in authored packages. These guardrails concern resource use, not wine quality
or a promise of cloud capacity. Current limits live in
[`scripts/performance/budgets.ts`](../scripts/performance/budgets.ts); the dated
[measurement review](../editorial/performance-review-2026-10-11.md) records evidence.

## Reproduce

Use the pinned Node 24/npm 11 environment from the repository root:

```sh
npm run benchmark -- --scales=1
npm run benchmark -- --production --clone --reference=7cf03c1 --enforce
npm run benchmark -- --check=editorial/measurements/performance-2026-10-11.json
```

The first command measures content and search in fresh processes. The full run
also builds isolated 1×/3×/8× apps, starts temporary servers on loopback ports
3311/3313/3318, measures HTTP and deployment traces, and makes a local Git clone.
`--reference` compares search against that Git revision and fails on changed
ranking, snippets, match kinds, depths or anchors. It does not restore the old
repository loader or perform a historical deployment.

Results and logs go to a new directory under the system temp directory. Use
`--output=/absolute/new/empty/directory` to choose an output outside the repo.
Fixtures are removed after each scale unless `--keep-fixtures` is requested.
`--enforce` returns a failing exit code on a budget breach; `--check` evaluates
saved measurements against current limits without rebuilding. Interrupted
production runs cannot pass by omitting their missing measurements.

No canonical files, Git settings, public hosting or remote storage are changed.
The synthetic copies have unique entity/narrative/path/assertion IDs and slugs,
including dependency slugs in content plans. Relations, prose links, embedded
producer owners and path targets point into the corresponding copy; block
anchors stay stable. Sources, media records and image bytes are shared. Existing
geographic identities deliberately prevent multi-copy fixtures until a verified
geographic fixture contract is added. A 1× measurement remains available.

## What the numbers mean

- Content timing includes validation, graph derivation, serialization and writing;
  worker startup is reported separately. Peak RSS includes native buffers.
- Search measures a cold first query for each locale, then five timed samples
  per query/filter/locale. p95 with five samples is the observed maximum, not a
  statistically stable estimate. Raw samples are retained.
- HTTP measurements warm both locales first, then take three samples per case;
  their p95 is likewise the observed maximum. Process-to-first-response includes
  startup and the first Dutch search. OS filesystem caches are warm: this is
  not a serverless cold-start measurement.
- JSON gzip/Brotli sizes are transport estimates. JSON is not downloaded to the
  browser. Article HTML and referenced JS/CSS use actual gzip response-body
  bytes; the JS inventory conservatively includes legacy `nomodule` scripts.
  Fonts, images and headers are separate, and browser execution time is not measured.
- Local trace sizes deduplicate a route trace and the Next server trace. They
  include the generated JSON file and are a packaging proxy, not a verified
  Vercel function size. The dynamic search trace must contain the data file.
- Server RSS is a post-workload snapshot, not a peak or leak test. The 1× run
  also exercises two image types at 828/1920 pixels; scaled runs share media.
- Clone timing uses local full-history copy and checkout without hardlinks.
  It says nothing about internet bandwidth, GitHub checkout time or remote caches.

## Guardrails and decisions

The same local limits apply across 1×/3×/8×: 50 ms warm search, 200 ms warm HTTP
search, 2 seconds process-to-first-search, 1 GiB post-workload server RSS,
15 seconds content build and 120 seconds production build. Search normalization
gets a 64 MiB heap budget, and content build peak RSS gets 1.5 GiB. The largest
local traced closure has a 150 MiB review limit. Sampled article JS is capped at
220 KiB compressed and article HTML at 64 KiB. These are deliberately different
budgets for different measurements; confirm reproducible breaches before choosing
an architecture migration.

Sampled image bodies target 250 KiB at 828 pixels and 500 KiB at 1920 pixels.
Keep source quality and rights/checksums intact; the existing Next image adapter
serves optimized variants. The sample does not certify every registered image.
Review storage when raw media reaches 500 MiB or Git objects reach 512 MiB,
**before** further large ingestion. Plan synchronization, checksums, cache policy,
rollback and ownership before a CDN move; `MEDIA_BASE_URL` alone uploads nothing.

Repeat 1× after search, repository or media-pipeline changes; repeat all scales
before major regional batches, after substantial corpus/composition changes or
when adding Atlas data. A breach produces a concrete maintenance action before
that expansion. Run the full benchmark manually on a comparable idle machine;
ordinary CI keeps deterministic checks and browser behavior, without fragile
wall-clock thresholds on shared runners. External deployment/cold-start
verification remains `MNT-056`.
