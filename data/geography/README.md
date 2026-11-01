# Geography

Canonical verified geography for Atlas, built on the feature branch
`feat/attempt-at-atlas` under the [Atlas implementation contract](../../docs/atlas-plan.md).
The [geography policy](../../docs/geography-policy.md) is binding: no guessed,
traced or generated coordinates or boundaries, ever.

## What exists

- `manifest.yaml` pins every dataset: URL, bytes, SHA-256, release, licence,
  encoding and the verbatim source CRS (PRJ WKT or response URN). Cached
  resources: the INAO shapefile of geographical areas (edition 2026-10-26) and
  the INAO product register (extraction 2025-12-31), which carries the
  `id_app`/`id_denom` identity namespace. Raw resources (`storage: raw`): twenty
  pinned IGN Géoplateforme WFS requests (BD CARTO® V5 hydrography and land-sea
  limit, ADMIN EXPRESS COG 2026 chef-lieu points) whose responses are committed
  under `raw/<raw_directory>/` because IGN's bulk files are 7z archives. Each
  resource's `dataset_id` is the publisher's catalogue identifier that
  `dataset_url` resolves (`IGNF_BD-CARTO`, `IGNF_ADMIN-EXPRESS` for IGN);
  `raw_directory` is only the local directory name. The two
  scene envelopes (Bordeaux cluster, Champagne) are recorded here too.
- `mappings/inao-appellations.yaml` is the reviewed identity table: one entry per
  active French appellation entity (39), each naming the INAO key pair, both
  labels, the record type and the review decision. Hard cases and held entries
  are explained in the file. `mappings/ign-orientation.yaml` lists the 47
  orientation features (8 rivers, 9 water bodies, 1 coastline, 29 populated
  places) with their raw response, selection rule and NL/EN names.
- `features/<kind>/` holds the canonical records: `<id>.yaml` with provenance
  and `<id>.geojson` with one RFC 7946 Feature in EPSG:4326 (longitude first,
  counterclockwise exterior rings, 8 decimal degrees, recorded as the
  `coordinate-precision` step). 86 records: 39 `appellation-area` (38
  `published`, 1 `held`: Côtes de Bordeaux, whose published shape omits the
  Sainte-Foy sector), 8 `river`, 9 `water-body`, 1 `coastline` and 29
  `populated-place`, all `published`. Files are generated; edit a mapping and
  re-run the import instead of editing them by hand.
- `cache/` holds bulk downloads. It is gitignored and recreated by
  `npm run geography:fetch`, which verifies bytes and SHA-256 and never replaces a
  file that does not match its pin.
- `raw/<raw_directory>/` holds the committed WFS responses, byte-exact under
  their manifest checksums. They must not be reformatted (`.prettierignore`).
  `npm run geography:fetch -- --capture-raw` requests a missing response so it
  can be reviewed and pinned, and compares a present one with the live service
  content (ignoring only the server `timeStamp`). A freshly captured raw file is
  unverified until it has been reviewed and its bytes and SHA-256 are pinned in
  the manifest; the import refuses it until then.
- `scenes/scene.<region-slug>.yaml` compose features into the eight fixed-extent
  maps of release one (contract §5): layers context → appellations → water →
  places (water above the land fills since 2026-10-31), `intended_entities` per the contract table.

## Commands

- `npm run geography:fetch` downloads and verifies the pinned resources
  (`--verify` only checks, `--only=<id>` limits the run).
- `npm run geography:import` selects the mapped records from the cached
  shapefile and the committed responses, verifies PRJ/CRS against the manifest,
  reprojects, validates, and writes the records atomically. Both tables are
  prepared in full before anything is written, so nothing is written when any
  entry of either table fails (`--dry-run`, `--only=appellations|orientation`).
  The import also refuses a committed response whose features are not in
  strictly increasing `cleabs` order, and a polygon whose holes cross their
  exterior ring or each other (touching at a vertex or along an edge is allowed).
  Record checksums cover the Prettier-formatted GeoJSON and YAML, so they depend
  on the installed Prettier version: a Prettier upgrade requires a re-import
  (and a review of the changed checksums) before `npm run content:check` passes.
- `npm run content:check` validates every record, its GeoJSON checksum, vertex
  count, bbox, ring orientation and the owner's `geography_id`.

## Code layout

`scripts/geography/import.ts` is the command-line orchestrator. Its parts live in
`scripts/geography/lib/`: `mapping-schemas.ts` (mapping tables and their
schemas), `shapefile.ts` (the pinned INAO archive and row selection),
`register.ts` (the INAO product register), `validate.ts` (source topology,
hole crossings, RFC 7946 orientation, rounding), `record.ts` (reprojection and
record serialisation), `appellations.ts` and `orientation.ts` (the two tables),
`write.ts` (atomic writes and stale-file report) and `import-error.ts`. Shared
geometry helpers come from the build's `lib/geometry.ts`.
`scripts/geography/fetch.ts` downloads and verifies the pinned resources.

Generated display assets live in `src/generated/geography/` and are never
edited by hand. Besides one file per scene, `index.json` carries a small
`thumbnail` per scene for the Atlas portal cards: `{ viewBox: { width: 160,
height }, paths: [string] }`, one path per selectable area. Overarching
(context) areas, water and places never enter a thumbnail, and neither does any
outline of its own; a scene without selectable areas has no thumbnail. It is
derived in `scripts/geography/lib/display.ts` (with the pure helpers in
`lib/thumbnail.ts`) from the scene's own projection, scaled to a 160-unit-wide
viewBox, and simplified with the scene's ladder (read as thumbnail pixels)
until the path text is at most 3 KiB. Paths sit on a whole-unit grid, are
clipped just outside the viewBox, drop rings smaller than one unit, and are
written as compact relative path data; areas with an identical shape are drawn
once, and a small area that a coarse rung would flatten keeps its unsimplified
shape. The strict schema is `atlasThumbnailSchema` in
`src/content/model/geography.ts`; the build report prints the bytes and rung
per scene, and fails with "no selectable area keeps an extent at thumbnail
resolution" when nothing can be drawn. Scene files also carry a scene-wide
`areaRank` per appellation area (1 = largest; areas of the same projected size
share a rank; water polygons get none) that orders the overlap chooser. Research history: the
[source review of 2026-10-30 with its 2026-10-31 addendum](../../editorial/atlas-geography-sources-review-2026-10-30.md)
with its inspection evidence for the [appellations](../../editorial/measurements/atlas-geography-sources-inspection-2026-10-30.json)
and the [orientation features](../../editorial/measurements/atlas-orientation-sources-inspection-2026-10-31.json),
the earlier [dataset review of 2026-10-14](../../editorial/atlas-bordeaux-data-review-2026-10-14.md)
and the [historical pilot proposal](../../docs/atlas-pilot-contract.md).
