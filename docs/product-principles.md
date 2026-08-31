# Product principles

Status: binding repository policy

Oenocademy is a Dutch-first, multilingual wine knowledge platform. It helps
people understand wine through free discovery and structured learning, while
making the origin and limits of its knowledge visible. Product, content,
design, and application decisions must follow these principles.

## 1. One shared knowledge system

Oenocademy is entity-first and narrative-second. Stable subject knowledge
belongs to canonical entities, relations, assertions, sources, and verified
geography. Narratives explain themes across those entities; learning paths
arrange shared knowledge into a useful sequence. They must not create parallel
copies of canonical facts.

Self-contained entity and narrative packages are the canonical authoring unit.
Preserve the repository's stable IDs, localized routes, relation and backlink
generation, content pipeline, and provenance model. Generated indexes and
runtime bundles are outputs, not authoring sources. The detailed contract is in
`knowledge-architecture.md`.

## 2. Explore, Learn, and Atlas are complementary

The three primary modes are different views over the same knowledge graph:

- **Explore** supports curiosity, search, comparison, and free movement between
  related subjects.
- **Learn** supplies deliberate order, learning objectives, progression, and
  context without owning a separate copy of the knowledge.
- **Atlas** is the geographic expression of the shared graph. It connects
  verified places and geometry to the same entities and narratives.

None is the universal parent of the others. In particular, Learn must not
automatically dominate Explore or Atlas. A user should be able to reach useful
entity knowledge without entering a course, and a learning path may reuse an
entity or narrative without changing its canonical ownership.

## 3. Progressive depth, not artificial silos

Serve newcomers and specialists through progressive disclosure. Lead with a
clear summary, then make detail, caveats, sources, related entities, and deeper
material available in context. Depth describes content, not a separate database
or duplicate page family. Do not make every noun an entity or every idea a new
feature; use the smallest structure that supports real discovery, reuse, or
learning needs.

## 4. Dutch first, English deliberately maintained

Dutch is the primary editorial language. English is a maintained localization
of the same underlying knowledge, never an independent fact set and never an
unreviewed fallback. IDs, relations, assertions, source records, and geography
are shared; titles, prose, labels, captions, aliases, and alternative text may
be localized.

Do not invent a missing translation or silently display Dutch as if it were
English. Prefer an explicit unavailable, draft, or incomplete state. Localized
routes are presentation; stable entity IDs are identity.

## 5. Trust before apparent completeness

Factual claims must be traceable to appropriate sources, with freshness,
scope, and uncertainty represented when relevant. Passing schema validation
proves only structural validity; it does not make content verified. Apply
`../editorial/research-policy.md` to research, writing, translation, and
migration, and `geography-policy.md` to every geographic claim or asset.

Never manufacture facts, citations, quotations, sources, relations, dates,
figures, classifications, legal claims, tasting guarantees, geography,
translations, statistics, or examples presented as fact. Do not add placeholder
prose merely to make a page look complete. Omission, an explicit draft, a clear
unknown value, or a useful empty state is better than false confidence.

## 6. Interfaces speak to people

Public copy describes wine knowledge in recognizable human language. Translate
structured relations into contextual labels and sentences. Never expose raw
IDs, schema field names, relation enums, pipeline terms, migration states, or
other developer language as the user experience.

Interfaces should be calm, clear, contemporary, educational, responsive, and
accessible. They should help a reader understand where they are, what is known,
what is related, and what they can do next. Preserve user context when moving
between modes. Do not hide essential meaning behind hover, color alone, or an
unexplained icon. Follow `visual-language.md` for visual and interaction work.

## 7. Show scope and uncertainty honestly

Labels, comparisons, counts, classifications, vintages, and sensory statements
must state the scope needed to interpret them. Distinguish region from legal
appellation, producer from vineyard, current status from historical status, and
observation from rule or guarantee. When sources disagree or data is partial,
show the limitation or withhold the claim; do not smooth it away in copy or UI.

## 8. Scope follows demonstrated value

Prefer coherent vertical slices that strengthen the shared system. Add a new
entity type, relation, mode, filter, or abstraction only when concrete use cases
cannot be served by the existing model. Avoid redesigning the information
architecture to solve a local presentation problem. Migrations remain
reviewable and non-destructive until replacements are verified.

## Decision test

Before shipping product, content, design, or application work, confirm that it:

- has one clear canonical owner for each fact;
- works with Explore, Learn, and Atlas as peers where relevant;
- keeps NL and EN aligned without fabricating missing localization;
- exposes human meaning rather than implementation language;
- makes provenance, scope, uncertainty, and incompleteness honest;
- remains usable responsively and accessibly; and
- does not expand the model or product without a demonstrated need.
