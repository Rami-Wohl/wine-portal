# Geography policy

Status: binding repository policy

This policy applies to places, geographic hierarchy, addresses, coordinates,
centroids, boundaries, map layers, spatial relations, geographic imports, and
every Atlas experience. It supplements `knowledge-architecture.md`; it does not
replace that document's entity, relation, source, or migration contracts.

## 1. Geography is verified data

Geography presented as factual must come from an appropriate, traceable data
source. Never invent, guess, hand-trace from a screenshot, or decoratively
approximate a coordinate, boundary, containment relation, centroid, river,
vineyard, appellation, or Atlas geometry. A plausible-looking map is not
evidence.

If verified geographic data is unavailable, omit the geometry and degrade
honestly. A page may still offer text, a list, related entities, or an explicit
"map unavailable" state. Do not substitute an inferred point or decorative
shape merely to fill space.

## 2. Place meanings must be explicit

Do not treat similar names as proof that two geographic concepts are identical.
Distinguish, where applicable:

- cultural or wine region from legal appellation;
- administrative area from viticultural area;
- producer, winery, visitor entrance, mailing address, estate, vineyard, and
  vineyard centroid;
- point location from polygon coverage;
- current boundary or classification from historical versions.

Every producer point must state what it locates, such as `winery`,
`estate-centroid`, `vineyard-centroid`, or another defined meaning. A geocoded
mailing address must not silently become a winery or vineyard location.

## 3. Source and provenance requirements

Geographic records must retain, where applicable:

- reusable source or dataset identifier, publisher, and original location;
- license and attribution requirements;
- dataset release or version and publication/update date;
- access and import dates;
- original coordinate reference system (CRS);
- transformations, reprojection, repair, simplification, or derivation steps;
- geometry type and semantic meaning;
- precision, uncertainty, limitations, and review status; and
- temporal validity when boundaries or hierarchies change.

Preserve the source geometry or a reproducible reference to it. Rendered tiles,
screenshots, exports, and simplified display geometry are not the canonical
source. Schema validity alone does not establish geographic accuracy.

## 4. Source choice and verification

Prefer the source with the strongest authority for the claim being made, not a
single universal source hierarchy. Legal appellation boundaries and rules
normally require the competent regulator or an official published dataset.
Physical features may require an authoritative national or scientific dataset.
Community data can be used only when its license permits use, its fitness for
purpose is reviewed, and its lower authority is represented honestly.

Verify that the dataset actually describes the intended concept, date, and
scale. Check CRS, axis order, units, topology, feature identity, and containment
before publication. Record conflicts rather than selecting the most convenient
shape. Apply the research rules in `../editorial/research-policy.md` to the
claims surrounding geographic data.

## 5. Derivation and uncertainty

Derived geography is acceptable only when the input data is verified, the
method is reproducible, and the result is labeled `derived`. For example, a
computed centroid must identify its source geometry and method. A centroid is a
representative point, not evidence of an entrance, winery, or vineyard.

Do not imply more precision than the source supports. Simplification may be
used for display performance but must preserve topology and must not become the
authoritative geometry. Uncertain or contested containment should be modeled or
explained as such, not forced into a confident hierarchy.

## 6. Atlas publication rules

Atlas renders the geographic part of the shared knowledge graph; it is not a
separate store of place facts. Atlas must use canonical entity identities and
verified geographic references. Public labels and legends must be localized,
human-readable, and clear about layer meaning, source, time, uncertainty, and
missing coverage where those affect interpretation.

The interface must not:

- draw an appellation or site boundary from generative imagery;
- use a decorative region silhouette as queryable data;
- imply that all producers, sites, or areas are shown when coverage is partial;
- infer legal containment from visual overlap alone; or
- expose raw geometry IDs, relation enums, CRS codes, or pipeline terms as the
  primary user-facing explanation.

Maps must remain usable by keyboard and at different viewport sizes, and must
have a meaningful non-map alternative for essential content. Color cannot be
the only way to distinguish layers or states. Follow `visual-language.md` for
presentation and accessibility.

## 7. Schematic and educational maps

A schematic map may teach orientation or comparison when exact geometry is not
necessary. It must be visibly and textually labeled as schematic, must not be
used as an Atlas boundary or measurement surface, and must not be mistaken for
documentary evidence. Generative tools may assist with a clearly conceptual
illustration but may never supply factual coordinates, boundaries, labels, or
spatial relationships.

## 8. Import and correction workflow

Geographic imports are migrations: validate them in reviewable batches,
preserve provenance, and keep prior data recoverable until the replacement is
verified. A correction must record what changed, why, the supporting source,
and whether dependent containment or display outputs need regeneration.

Before publishing geography, confirm:

- the feature represents the intended place and time;
- its coordinates, CRS, hierarchy, and geometry meaning are explicit;
- source, license, version, transformations, and uncertainty are retained;
- no screenshot tracing, guessing, or generative approximation was used; and
- the experience has an honest incomplete state and accessible alternative.
