# Bordeaux Atlas pilot contract

Status: historical pilot proposal, superseded on 2026-10-30 by the active
[Atlas implementation contract](atlas-plan.md) on branch `feat/attempt-at-atlas`.
The dataset research, identity keys, licence and CRS findings below remain valid
reference material; the nine-appellation scope and the ticket order no longer
apply. Owner: MNT-051. Research date: 2026-10-14.

The first pilot helps readers locate and compare a small set of Bordeaux
appellations and open their existing knowledge pages. It will use shared entity
IDs and shared geography with NL/EN labels. This document defines the bounded
work; the geography policy and knowledge architecture remain binding.

## Scope selected before presentation

Use the INAO geographical-area snapshot published on 2026-10-12. Review nine
appellation features: Bordeaux, Margaux, Pauillac, Saint-Julien, Saint-Estèphe,
Pomerol, Saint-Émilion, Barsac and Sauternes. These are existing active entities.
Do not equate the Bordeaux appellation polygon with `region.bordeaux` or with
Gironde. Bordeaux Haut-Benauge is a separate denomination in the file and is
outside the pilot selection.

The first map shows informative geographical production areas, not planted
vineyards, parcel eligibility, estates, producer entrances or terroir units.
Overlapping areas remain overlapping: selection must offer a choice, rather
than assign a polygon to whichever feature was drawn last. No containment or
producer membership is inferred from overlap.

The raw resource, identity mapping, license, CRS and validation observations
will be recorded in the dated research review before implementation.

## Dataset and identity contract

Primary source: [INAO geographical areas](https://www.data.gouv.fr/datasets/delimitation-des-aires-geographiques-des-siqo).
Pin dataset `5d7fb2856f444171a5f2780b`, resource
`687d62d7-8ee6-4997-a47a-81e3183be31b`, release 2026-10-12.
The resource is 88,984,476 bytes with SHA-256
`e9ea8b48c507da006774ad460d03619b464ca6598956ac7fd319f36af4f56bc4`.
The catalogue's SHA-1 was also checked. A changed download requires a new snapshot
review; no automatic replacement or silent update.

| Existing entity | `id_app` | `id_denom` | Expected `app` and `denom` |
| --- | ---: | ---: | --- |
| `appellation.bordeaux` | 14 | 67 | Bordeaux |
| `appellation.margaux` | 52 | 111 | Margaux |
| `appellation.pauillac` | 59 | 118 | Pauillac |
| `appellation.saint-julien` | 71 | 168 | Saint-Julien |
| `appellation.saint-estephe` | 69 | 166 | Saint-Estèphe |
| `appellation.pomerol` | 62 | 121 | Pomerol |
| `appellation.saint-emilion` | 67 | 162 | Saint-Emilion |
| `appellation.barsac` | 8 | 60 | Barsac |
| `appellation.sauternes` | 75 | 172 | Sauternes |

Require `signe=AOC` and `type_denom=appellation`, plus the reviewed identifier
pair and both expected labels. Fail on missing, duplicate or mismatched records.
Do not infer mappings from folder names or the `dt` field: the INAO Bordeaux
territorial office covers additional areas and non-wine products. The separate
Bordeaux Haut-Benauge feature is deliberately excluded. Do not substitute
Saint-Émilion grand cru for Saint-Émilion because their shapes happen to match.

`id_aire` is null in all nine selected features. Record position is only an
inspection locator. Neither is an update key. Keep entity identity independent
of the source snapshot, and identify an imported feature by snapshot and the
reviewed source key.

The older [INAO commune table](https://www.data.gouv.fr/datasets/aires-geographiques-des-aoc-aop)
is a comparison source, not a geometry generator. Its `IDA` is not the shapefile's
`id_app` or `id_denom`. Historic commune names and partial communes can occur.
Never union complete municipality polygons to replace an INAO shape.

## Provenance and import contract

MNT-070 will define and implement the smallest typed geography record for these
existing appellations. Required information, shared between NL and EN:

- stable geography ID and its one canonical entity owner;
- explicit meaning: geographical production area; geometry type and asset reference;
- source ID, dataset/resource IDs, release date, retrieval date and source checksum;
- source CRS WKT, recognized CRS, source encoding and reviewed feature key;
- license, attribution and upstream warning about informative geometry;
- transformation recipe and tool versions; separate raw/source and display geometry;
- publication review status, limitations and superseded-snapshot history.

The current `geography_id` field and uniqueness/index contract remain the starting
point. Adding the new storage and validation contract must preserve existing IDs
and fixtures, validate missing references, and keep geometry out of ordinary
entity/search bundles. No country type, new place hierarchy or containment
relations are introduced for this pilot; REG-001 still owns that broader decision.

MNT-071 will implement the reproducible import and publication review:

1. Fetch the pinned source into a bounded local staging/cache directory, check
   bytes/checksums and ZIP members, and retain a recoverable source reference.
2. Read DBF/CPG as UTF-8. Read the PRJ rather than guessing from coordinates.
   The inspected WKT is RGF93 / Lambert-93, recognized as IGNF:LAMB93 and equivalent
   to EPSG:2154. Preserve it verbatim.
3. Match exactly the nine reviewed identifier pairs. Validate finite coordinates,
   rings, topology, nonempty Polygon/MultiPolygon types and original bounds.
4. Reproject with explicit longitude/latitude axis order to EPSG:4326 for RFC 7946
   GeoJSON. Apply and record the [RFC 7946 ring convention](https://www.rfc-editor.org/rfc/rfc7946.html#section-3.1.6):
   counterclockwise exteriors and clockwise holes, preserving coordinates and
   topology. The current research size is measured before this representational
   normalization. Record any later simplification/quantization against the source. No silent repair, merging, convex hulls, centroid replacements or guessed gaps.
5. Verify geometric identity and intended scope against competent official
   documentation. Publication review is separate from successful parsing.
   The Pomerol PNO-source correction in MNT-072 precedes use of that source as
   current legal evidence.
6. Preserve Barsac/Sauternes as distinct features despite geometric containment.
   No wine-production entitlement is inferred from this observation.
7. Atomically publish reviewed metadata and a separately loaded display asset;
   refuse partial or ambiguous input. Generate bundle/indexes, never edit them.

Raw geography must not enter the Next server trace or main knowledge JSON merely
because it was downloaded during a build. Prefer a deterministic, offline import
step and file-backed generated assets. The current inspection produces 453,592
GeoJSON bytes, 179,873 bytes with gzip, before simplification. For this nine-feature
pilot use an initial display budget of 500 KiB raw / 250 KiB gzip. Revisit the
budget after implementation measurements; these bytes are not a server-memory
or user-latency benchmark. MNT-065 remains the owner of broader Atlas workloads.

Publication scale is **regional orientation**. The source does not supply a
survey-accuracy or scale guarantee. Avoid parcel-level zoom, area statistics,
distance tools and claims of vineyard eligibility. Choose map zoom/labels for
orientation and record the limits rather than deriving accuracy from decimal digits.

Use the catalogue's **Licence Ouverte 2.0**. Public credit must identify INAO,
the reused update date, the dataset link, the license and any display derivation.
Do not imply INAO endorsement. Preserve the publisher's informative-use warning.

## First public delivery — MNT-002

Reuse MNT-002 as the Atlas UI/publication ticket after MNT-070/071. This avoids a
second ticket for the same first map. Required product behavior:

- `/atlas` and `/en/atlas` show the nine reviewed areas with a clear coverage label,
  source/update information and useful missing/error states.
- Select an area through the map **or** a semantic keyboard-accessible list.
  Open its existing localized appellation route; the map owns no duplicate prose.
- Shared geometry, reviewed NL/EN legend and simple description of what the
  areas mean. Raw IDs, CRS and import state are not primary public copy.
- Offer overlap choices, including Barsac/Sauternes; do not silently hide candidates
  under the top polygon or infer parent relations.
- Provide pan/zoom/reset and usable touch/focus behavior, with a reading-first
  mobile order. Essential links and scope remain usable without map interaction
  and without JavaScript; motion and color are not required to understand selection.
- Connect `region.bordeaux` to this pilot and provide its verified-map presentation
  with an accessible list alternative. Do not draw a new regional outline.
- Load the map renderer/data on the relevant route only. Start without an account,
  write API or spatial database. Any basemap provider must undergo its own source,
  license, attribution and runtime-dependency review; no provider is preselected.

The first feature set is useful without producer points or worldwide data. MNT-014
can reuse the reviewed Barsac/Sauternes areas and selection behavior for their
individual pages after MNT-002. A parcel layer needs a separate provenance/meaning
review. MNT-013 remains blocked on a different worldwide grape dataset.

## Acceptance and handoff

- MNT-070: strict model, reference validation, generated repository boundary and
  meaningful tests for broken IDs/status/provenance; existing corpus still passes.
- MNT-071: deterministic import, snapshot/identity/topology/axis-order failures
  tested, raw input retained, all nine features independently approved or the
  publication held with a recorded reason.
- MNT-002: public NL/EN map and Bordeaux integration, list/keyboard/no-JS fallback,
  overlap/error behavior, responsive checks at 320/768/1440 pixels, appropriate
  browser tests and production/build-budget review.
- MNT-014: separate acceptance on both appellation pages, with explicit area
  meaning and no conflation with parcel eligibility.

Actual ticket status and ordering live in `maintenance-backlog.md` and
`product-roadmap.md`. This scoping document does not mean that geography has
already been imported or Atlas is available. The inspected metadata and PNG
preview are dated research artifacts, outside the runtime and media catalogue.
