# Atlas implementation contract

Status: active implementation contract, approved by the user on 2026-10-30 on
the feature branch `feat/attempt-at-atlas`. It supersedes the historical
[pilot proposal](atlas-pilot-contract.md), whose dataset research it reuses.
The binding policies remain `geography-policy.md`, `knowledge-architecture.md`,
`visual-language.md`, `product-principles.md` and `../editorial/research-policy.md`.
Where this contract is silent, those policies decide. Where it appears to
conflict with them, raise the conflict; do not resolve it silently.

## 1. Decisions taken

The user decided on 2026-10-30:

1. **Rendering:** server-rendered SVG scenes composed from verified layers,
   progressively enhanced on the client. No tile provider, no WebGL map library.
2. **First-release scope:** the Bordeaux cluster plus Champagne. The goal is a
   solid, extendable base, not worldwide coverage.
3. **Regions:** a region page shows an appellation mosaic with water and towns.
   A cultural wine region never gets a drawn outline of its own.
4. **Visibility:** on this branch Atlas may return to navigation and home as
   soon as it is useful to inspect, labelled as a preview until release gates pass.

## 2. What Atlas is

Atlas is the geographic expression of the shared knowledge graph. It owns no
place facts of its own. Every area on a map is a verified geographic feature
linked to one canonical entity or named as an orientation feature such as a
river or town. Maps are **regional orientation**, not survey, parcel eligibility
or legal evidence. The interface says so in human language.

A **scene** is a composed map with a fixed extent: a set of layers, in drawing
order, with one owning entity. Release one ships eight scenes: one per active
Bordeaux region entity plus Champagne. The Bordeaux region scene is the Atlas
overview.

| Scene | Owner | Selectable appellation areas |
| --- | --- | --- |
| `scene.bordeaux` | `region.bordeaux` | every active Bordeaux-cluster appellation with published geometry |
| `scene.medoc` | `region.medoc` | Médoc, Haut-Médoc, Saint-Estèphe, Pauillac, Saint-Julien, Listrac-Médoc, Moulis-en-Médoc, Margaux |
| `scene.libournais` | `region.libournais` | Saint-Émilion, Saint-Émilion grand cru, the four Saint-Émilion satellites, Pomerol, Lalande-de-Pomerol, Fronsac, Canon-Fronsac, Castillon and Francs Côtes de Bordeaux |
| `scene.fronsadais` | `region.fronsadais` | Fronsac, Canon-Fronsac |
| `scene.graves-sauternais` | `region.graves-sauternais` | Graves, Graves supérieures, Pessac-Léognan, Cérons, Barsac, Sauternes |
| `scene.entre-deux-mers` | `region.entre-deux-mers` | Entre-Deux-Mers, Cadillac, Cadillac Côtes de Bordeaux, Loupiac, Sainte-Croix-du-Mont, Sainte-Foy Côtes de Bordeaux |
| `scene.blayais-bourgeais` | `region.blayais-bourgeais` | Blaye Côtes de Bordeaux, Côtes de Bourg |
| `scene.champagne` | `region.champagne` | Champagne |

The appellation lists above are the intended coverage. The geo agent verifies
each identity against the source; the build computes actual coverage from
published records. Hand-typed coverage statements are not allowed in UI copy.
`region.champagne` is currently a draft entity; the scene may exist while its
owner is draft, and follows the owner's publication status in public views.

## 3. Data flow and ownership

```text
data/geography/manifest.yaml         pinned datasets: url, bytes, sha256, release, licence   (committed)
data/geography/cache/                raw downloads, gitignored, recreated by the fetch step
data/geography/features/<kind>/      canonical GeoJSON per feature + provenance YAML         (committed)
data/geography/scenes/               scene definitions                                       (committed)
scripts/geography/fetch.ts           download pinned resources, verify bytes and checksums
scripts/geography/import.ts          read source, select reviewed features, reproject, validate, write canonical records
scripts/geography/build.ts           validate records, simplify per scene, write display assets
src/generated/geography/             display scenes and index, gitignored, rebuilt like knowledge-base.json
src/content/geography.ts             server-only repository for scenes and features
src/components/atlas/                SVG scene, enhancement, legend, list alternative, selection
src/app/[lang]/atlas/                Atlas routes
```

| Area | Owner |
| --- | --- |
| `data/geography/**`, `scripts/geography/fetch.ts`, `scripts/geography/import.ts`, geography source records in `data/sources/`, dated source reviews in `editorial/` | Geo data agent |
| `src/content/model/geography.ts`, geography validation in the content pipeline, `scripts/geography/build.ts`, `src/content/geography.ts`, `src/app/[lang]/atlas/**`, unit tests, geography browser tests | Build agent |
| `src/components/atlas/**`, `src/styles/atlas.css`, Atlas and map copy, map integration on region and appellation pages, navigation and home entry | UI agent |
| Review of every landing; `npm run check`; findings routed through the orchestrator | Reviewer |
| Reader-side verification: copy in NL and EN, acceptance traceability, accessibility, exploratory browser runs against the production build; findings routed through the orchestrator | QA agent |
| This contract, roadmap and backlog sync, dated phase reviews, integration review, demos | Orchestrator |

Shared files such as `package.json`, `scripts/content/pipeline.ts`,
`src/app/globals.css`, `next.config.ts`, `.gitignore` and the entity page are
edited by the agent named in the task, one agent at a time, announced to the
orchestrator first.

## 4. Geography record contract

Every canonical feature is a pair of files in `data/geography/features/<kind>/`:
`<id>.yaml` with provenance and `<id>.geojson` with one RFC 7946 Feature in
EPSG:4326, longitude first, counterclockwise exterior rings. IDs use the
existing `geo.` namespace and the pattern `geo.<kind>.<slug>`.

Kinds in release one: `appellation-area`, `river`, `water-body`, `coastline`,
`populated-place`. A kind describes meaning, not geometry type. Later kinds
such as `vineyard-parcels`, `administrative-area`, `relief` and
`producer-point` need their own meaning review before they are added.

```yaml
id: geo.appellation-area.pauillac
kind: appellation-area
owner: appellation.pauillac # required for appellation-area; the entity's geography_id must equal this id
names: { nl: Pauillac, en: Pauillac } # required when there is no owner, optional otherwise
geometry:
  file: geo.appellation-area.pauillac.geojson
  type: Polygon # Polygon | MultiPolygon | LineString | MultiLineString | Point
  sha256: <hex> # of the committed GeoJSON file
  vertex_count: 1234
  bbox: [minLon, minLat, maxLon, maxLat]
source:
  source_id: source.inao-geographical-areas-2026 # must exist in data/sources
  dataset_id: 5d7fb2856f444171a5f2780b
  resource_id: 687d62d7-8ee6-4997-a47a-81e3183be31b
  release: 2026-10-12
  retrieved_at: 2026-10-30
  resource_sha256: <hex>
  crs: IGNF:LAMB93 # as recognised; the verbatim WKT lives once in manifest.yaml
  encoding: UTF-8
  feature_key: # the reviewed, source-specific identity; never a row position
    id_app: 59
    id_denom: 118
    signe: AOC
    type_denom: appellation
    app: Pauillac
    denom: Pauillac
licence:
  id: etalab-2.0
  attribution: "INAO, Délimitation des aires géographiques des SIQO, édition du 12 octobre 2026"
  notes: informative geometry; official dossiers carry the legal delimitation
transformation:
  - step: reproject
    from: EPSG:2154
    to: EPSG:4326
    axis_order: lon-lat
    tool: <package>@<version>
  - step: ring-orientation
    convention: rfc7946
  - step: coordinate-precision
    decimals: 8
    unit: degree
meaning: geographical-production-area # localized explanation lives in the UI copy per kind
precision: regional-orientation
limitations: >
  Not a parcel delimitation, planted area or survey boundary.
review:
  status: published # imported | reviewed | published | held
  reviewed_at: 2026-10-30
  notes: identity matched on id_app/id_denom and both labels; shape compared with the INAO product page
supersedes: null # earlier record id when a snapshot is replaced
```

Validation, run by the content pipeline so `npm run content:check` and
`npm run check` cover geography:

- strict schema, unique IDs, kind-specific required fields;
- the GeoJSON file exists, parses, has one Feature, matches the declared
  geometry type, checksum, vertex count and bbox, has finite coordinates in
  range, closed rings and RFC 7946 ring orientation;
- `owner` resolves to an existing entity whose `geography_id` equals the record
  id; an entity `geography_id` without a record is an error;
- `source.source_id` resolves to an existing source record;
- only `published` records enter display assets; `held` records are reported;
- scenes reference existing records only, and every intended entity in a scene
  either has a published record or is listed in the generated coverage gap.

Geometry never enters `knowledge-base.json` or the search index. The existing
`indexes.geography` map stays as it is.

## 5. Scene contract

```yaml
id: scene.medoc
owner: region.medoc
extent:
  mode: fit # fit the listed appellation areas with padding, or
  # mode: bbox with bbox: [minLon, minLat, maxLon, maxLat]
  padding: 0.08 # fraction of the fitted extent
projection: mercator # release one: Mercator fitted to the extent; recorded for honesty, not shown
layers:
  - id: water
    kinds: [coastline, water-body, river]
    features: [geo.water-body.gironde-estuary, geo.river.garonne, geo.river.dordogne]
  - id: context
    kinds: [appellation-area]
    features: [geo.appellation-area.bordeaux]
    role: context # drawn beneath, selectable, patterned rather than filled
  - id: appellations
    kinds: [appellation-area]
    features: [geo.appellation-area.medoc, geo.appellation-area.haut-medoc, ...]
    role: selectable
  - id: places
    kinds: [populated-place]
    features: [geo.populated-place.pauillac, geo.populated-place.bordeaux]
intended_entities: [appellation.medoc, appellation.haut-medoc, ...] # coverage is computed against this list
```

Drawing order is the layer order. Within a selectable layer, larger areas are
drawn first so smaller areas stay reachable; overlap is never resolved by
hiding a candidate. The build computes, per scene: fitted extent, projected
display geometry, coverage of `intended_entities`, credits per source and the
feature list for the non-map alternative.

## 6. Import rules

- Pin every dataset in `manifest.yaml` with URL, bytes, SHA-256, release date,
  licence and the source CRS: the verbatim PRJ WKT for a file distribution, or
  the CRS URN the service declares for a committed raw response. A changed
  download fails the import and requires a new review; nothing updates silently.
- Read the PRJ, DBF and CPG; never infer CRS from coordinate magnitudes.
  Reproject with explicit longitude-latitude axis order.
- Match appellation features on the reviewed key pairs and both labels. Record
  one-to-many and many-to-one cases explicitly, for example an AOC with several
  complementary denominations, or two entities that share one source shape.
  Do not substitute a similar shape for a missing one. When an edition lacks
  key fields (the 2026-10-26 INAO export has blank identifiers), matching on
  the exact denomination label corroborated by the pinned INAO product
  register and by geometric consistency is acceptable only when every record
  and the dated review state that weaker evidence, and a re-pin to a corrected
  edition is scheduled as a follow-up.
- Validate topology before and after reprojection. Refuse empty, non-finite,
  unclosed or self-intersecting input. Self-intersection is detected by the
  importer, where the source topology is still at hand; the content pipeline
  re-checks closure, orientation, ranges, checksums and counts, not
  self-intersection. No silent repair, union, hull or centroid replacement.
- Hydrography and places come from a reviewed national dataset under an open
  licence. Clip to a generous scene envelope before committing; record the
  clip as a transformation step. Keep OpenStreetMap out of release one.
- Keep the raw download recoverable through the manifest and cache, not in git.
  When a dataset is only available through a service that changes over time
  (for example a WFS request), commit the raw response under
  `data/geography/raw/<raw_directory>/` (a manifest slug; `dataset_id` stays the
  publisher's catalogue identifier) with its checksum in the manifest, provided
  it stays under 10 MiB per file; otherwise report the gap instead of relying
  on an unrepeatable download.
- Write records for all intended features, with `held` status and a reason
  where identity or quality could not be confirmed.

## 7. Build and budget rules

- `npm run geography:build` is deterministic, offline, and runs inside
  `npm run content:build` so every existing script, test and deployment path
  picks it up. It writes to `src/generated/geography/` atomically and removes
  stale outputs.
- Display geometry is simplified per scene with a topology-preserving method,
  quantized, and measured. Record the method, tolerance and resulting vertex
  count in the generated index. Simplification never changes which areas exist
  or how they overlap. A sub-part of a multi-part feature (one river segment,
  one island hole, one exclave) that has no extent at display resolution is
  dropped from the display geometry and counted per feature in the generated
  scene; a feature whose every part collapses fails the build. The legend states
  when parts below display resolution are not drawn.
- Display assets carry pre-projected path data per scene in a fixed SVG
  viewBox, plus projected label anchors and the unprojected bbox. Projection
  happens once at build time, so the runtime server and the client need no
  geometry library. Projection parameters are recorded in the scene index.
  The scene view holds only what the interface renders: id, owner, slug,
  viewBox, bbox, projection, layers with features (id, kind, owner, names,
  geometry type, path or point, label anchor, area rank), computed coverage,
  credits (source id, publisher, licence, dataset url, verbatim attribution)
  and the simplification record (method, tolerance, pixels, vertex counts,
  dropped parts). Source-record titles and build timestamps stay out of it.
- The scene extent fits the selectable areas only; context areas are drawn but
  clipped by the frame. An entity embeds the most specific scene that lists it
  in `intended_entities`; a region owner embeds its own scene.
- Budgets for release one: each scene display asset at most 250 KiB gzip; the
  scene index at most 20 KiB gzip; client enhancement script at most 15 KiB
  gzip. The server does projection and path generation; the client receives no
  geometry library. Revisit budgets with measurements, not assumptions.
- `next.config.ts` traces `src/generated/geography/**` for production the same
  way it traces the knowledge bundle. Development keeps the generated files in
  the module graph so a rebuild refreshes the page.

## 8. Repository and routes

- `src/content/geography.ts` is the only runtime entry to generated geography
  and carries the `server-only` marker. The content-boundaries ESLint rule
  covers it. Scenes are loaded per request from their own file, never all at
  once, and serialised results passed to components are small.
- Routes: `/atlas` and `/en/atlas` show the overview scene and the scene list.
  `/atlas/<region-slug>` and `/en/atlas/<region-slug>` show one scene. Scene
  routes reuse the English region slug like other entity routes. Draft owners
  follow the existing draft rules: reachable, `noindex`, honest preview state,
  excluded from sitemap and public lists.
- Region pages embed their scene. Appellation pages embed the parent region's
  scene with the appellation highlighted and a link to the scene route. An
  appellation without published geometry shows the scene with an explicit
  unavailable state, never a stand-in shape.
- Metadata, alternates and the proxy follow `localization-routing.md`.

## 9. Interface contract

- The map is an inline SVG rendered on the server: one `<path>` per feature
  with a stable `data-feature-id`, an accessible name, and for selectable
  areas an SVG link to the entity route so selection works without JavaScript.
- Enhancement adds pan, zoom, reset, focus and hover highlighting, and an
  overlap chooser: when two or more selectable areas sit under the pointer,
  list all candidates, with overarching context areas last, and let the
  reader choose. The list is the keyboard path: keyboard users reach every
  area through the list, in alphabetical order per language, and the map
  frame takes focus once for pan and zoom; the SVG links stay out of the tab
  sequence so the map does not double every tab stop. No shape is reachable
  only by pointer.
- A semantic list alternative sits next to the map and carries the same
  features, states and links, alphabetically ordered. It is the primary order
  on narrow screens. On entity pages the list folds natively below the
  highlighted entry.
- Legend and copy explain layer meaning, scale and source in plain NL and EN.
  An appellation area is the INAO geographical area: the communes, or parts
  of communes, where all stages of producing the wine must take place; only
  grapes from the separately delimited parcels qualify, and those parcels are
  not shown. INAO publishes the shapes for information; the commune list in
  the specification is the legal delimitation. Raw
  IDs, CRS codes, relation enums, pipeline terms and source-record titles never
  appear as public copy. Credits satisfy Licence Ouverte 2.0 with one line per
  source: the record's verbatim attribution (publisher, dataset, edition)
  linked to the dataset, plus the licence link, without implying endorsement.
- Preview labelling follows the single preview switch in the geography
  repository, never hand-typed copy. Active pages never link readers into a
  draft context; a draft scene page may link to its draft owner.
- Coverage is stated from computed data: how many intended areas are shown
  and which are missing, with the honest reason the reader can act on.
- Colour never carries meaning alone: context areas use a pattern, selection
  uses outline weight plus a label, water uses a distinct texture or label.
- Reviewed at 320, 768 and 1440 CSS pixels, with keyboard, zoom and reduced
  motion. The map never traps focus or displaces the reading path on small
  screens. Pan and zoom do not take over page scrolling until the map is
  explicitly engaged.
- Styles live in `src/styles/atlas.css`, imported through `globals.css` in the
  documented order, using existing tokens.

## 10. Testing and gates

Unit tests cover: schema failures, checksum and geometry mismatches, missing
owners and dangling `geography_id`, ring orientation, coverage computation,
scene fitting, simplification budgets, repository lookups and route helpers.
Browser tests cover: Atlas overview and one scene in NL and EN, no-JS
selection through SVG links, keyboard selection, overlap chooser with
Barsac and Sauternes, region and appellation embedding, unavailable state,
three viewports and draft-owner behaviour.

Each phase ends with `npm run format`, `npm run check`, the browser suite,
reviewer and QA sign-off, an orchestrator integration review against the
policies, a dated review in `editorial/`, and a demo for the user.

| Phase | Work | Ticket mapping |
| --- | --- | --- |
| 1 | Contract, doc sync, agent kick-off | this document |
| 2 | Sources re-pinned and imported; model, validation, build and repository on fixtures; map component on fixtures | MNT-070, MNT-071 |
| 3 | Real data through Atlas routes, region and appellation pages; navigation and home entry; browser tests; budgets measured | MNT-002, MNT-014 |
| 4 | Enrichment: planted vines, relief, locator inset, non-French appellations, producer points, grape distribution | new tickets, MNT-013 |

## 11. Out of scope for release one

Non-French appellations, planted-vine and parcel layers, relief, producer
points, a slippy world map, geographic search, a database, accounts and
editing. Port and Sherry keep text-only pages with an honest unavailable
state until their geometry has its own source review.
