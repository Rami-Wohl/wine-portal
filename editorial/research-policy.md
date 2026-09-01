# Research policy

Status: binding repository policy

This policy governs factual research, provenance, editorial writing,
translation, corrections, imports, and replacement. It applies to entities,
relations, assertions, narratives, learning material, captions, labels, maps,
charts, and media metadata. The canonical storage and assertion model is
defined in `../docs/knowledge-architecture.md`.

## 1. Standard of publication

Trust and traceability take priority over completeness. Publish a factual claim
only when an appropriate source supports the claim at the stated scope and
time. Unknown, disputed, or unverified information must remain absent or be
marked with an explicit editorial status. Schema validation establishes
structural correctness, not factual verification.

Never manufacture a fact, citation, quotation, source, relation, date, figure,
classification, legal claim, tasting guarantee, geographic detail,
translation, statistic, priority claim, or example presented as fact. Do not
write placeholder prose to make an entity or narrative appear complete.

## 2. Choose sources for the claim

Source authority is contextual. Use the strongest source suited to the specific
claim and preserve enough metadata for another editor to identify and assess it.
A practical hierarchy is:

1. competent regulators, legislation, official registers, standards, and
   original legal texts for rules, protected names, and classifications;
2. peer-reviewed research, academic works, recognized scientific bodies, and
   primary datasets for scientific and quantitative claims;
3. archival material and reputable scholarly histories for historical claims;
4. official producer or trade-body material for first-party operations,
   releases, holdings, and stated methods;
5. reputable books, specialist reference works, trade publications, and
   journalism for synthesis and context;
6. critics and other clearly attributed observers for opinion, reputation, and
   sensory assessment.

First-party sources establish what an organization officially states; they do
not independently prove reputation, superiority, causation, or contested
history. Search snippets, unsourced aggregators, generated summaries, and AI
output are discovery aids at most, never evidence. Wikipedia and community
sources may lead to better sources but should not carry a claim when a suitable
primary or authoritative source exists.

## 3. Reusable provenance and claim-level support

Register reusable sources under `data/sources/` with stable IDs rather than
repeating incomplete citations in prose. Retain, as applicable, author,
publisher, title, edition, URL or identifier, publication date, accessed date,
language, page or section locator, source type, and availability status.

Attach support at the narrowest useful level. Time-sensitive, numeric, legal,
contested, reputational, or potentially changing assertions require explicit
source and review metadata. A bibliography at the bottom of a long narrative
does not show which source supports which claim. Use block- or claim-level
references where needed, while avoiding citation clutter for adjacent claims
supported by the same clearly scoped source.

Never silently replace a dead or superseded source. Preserve the old provenance
record, record its status, and add the new supporting source and review event.
Quotations require an exact locator and must not be reconstructed from memory.

## 4. Claim-specific requirements

### Legal, regulatory, and classification claims

Consult the competent regulator or original legal publication. Record the
jurisdiction, instrument or classification version, effective date, and scope.
Distinguish legal requirements from common practice and historical rules from
current rules. Do not infer permission or prohibition from marketing copy.

### Geography

Follow `../docs/geography-policy.md`. Verify place identity, hierarchy,
coordinates, geometry meaning, source dataset, license, CRS, transformation,
version, and uncertainty as applicable. Never trace, guess, or generate factual
geography.

### History, origin, first, oldest, and priority claims

Treat superlatives and origin stories as high-risk. Prefer contemporaneous
primary evidence and reputable historical scholarship, define the category and
geographic scope, and state when evidence supports only "among the earliest"
or a documented tradition. Producer lore and repeated secondary claims are not
proof of priority.

### Viticulture and winemaking

Distinguish scientific mechanism, legal rule, producer-reported practice,
regional convention, and editorial interpretation. State material conditions
and exceptions. Do not generalize one producer's method to an appellation or
present correlation as causation.

### Sensory descriptions

Sensory language is observation or synthesis, not a guaranteed property.
Attribute producer-, critic-, panel-, or editor-specific notes and identify the
wine, vintage, sample context, and date when relevant. General style summaries
should reflect multiple suitable sources or clearly bounded editorial synthesis.
Avoid deterministic claims that a soil, technique, grape, or place always
causes a particular aroma or quality.

### Quantitative claims

Retain units, geography, population or sample, methodology, period, dataset
version, and rounding. Do not compare values with incompatible definitions or
years without explaining the limitation. Derived figures must preserve their
inputs and calculation method. Charts follow `../docs/visual-language.md`.

## 5. Writing, paraphrase, and quotation

Write original synthesis. Do not closely imitate a source's structure or
phrasing. Use quotation only when the wording itself matters, quote accurately
and sparingly, and preserve attribution and a precise locator. Respect license,
copyright, database rights, and contractual reuse limits; a citation does not
create permission to reproduce protected material.

Facts shared by sources still require independent wording. Translate meaning,
not copyrighted expression. Do not translate a quotation unless the translation
is identified as such and checked against the original.

## 6. Dutch and English editorial consistency

Dutch is the primary editorial language. English is a deliberate maintained
localization of the same canonical knowledge, not a separate research track or
an automatic fallback. Localizations may adapt syntax and explanation for
clarity, but must preserve factual scope, qualifications, source meaning,
temporal status, and uncertainty.

Do not invent an English passage when the Dutch source text is incomplete, and
do not silently backfill Dutch from English. Mark the localization incomplete
and route it for editorial review. When a factual correction changes shared
knowledge, review every affected NL and EN presentation, caption, alias, and
search summary.

## 7. Drafts, uncertainty, and conflicting evidence

Use the architecture's statuses consistently: `verified`, `provisional`,
`contested`, `historical`, or `deprecated` for assertions, and the appropriate
review status for media and imported material. Draft language must not leak into public
presentation as confirmed fact.

When credible sources conflict, check whether they differ in date, definition,
scope, jurisdiction, or method. Record the disagreement and its sources. Do not
average incompatible numbers, select the tidiest account, or remove a caveat
for smoother prose. Escalate material unresolved conflicts for editorial review.

## 8. Corrections

Corrections must be traceable. Record the affected claim or content block, the
old and new understanding, supporting sources, date, editor or review process,
and downstream surfaces that may require rebuilding or retranslation. Do not
rewrite history by deleting valid historical values or provenance. Urgent
removal of harmful or legally risky material may precede full replacement, but
the editorial record should still explain the action.

## 9. Imports and replacement

Oenocademy currently authors its wine knowledge as new canonical content; it
does not maintain a workflow for converting an older curriculum. If external
datasets, donated material, or existing published content are imported or
replaced later, that work is research and editorial work, not mechanical
copying. Original input remains recoverable until its replacement has been
mapped, fact-checked, localized, and reviewed. For each imported or replaced
item:

- separate stable entity facts from narrative explanation and learning order;
- map references to stable entity and source IDs;
- verify relations rather than inferring them from prose or filenames;
- preserve useful provenance and mark unsupported claims for omission or review;
- check image rights, credits, factual role, and localization;
- keep NL and EN aligned without generating missing content; and
- record review status without treating `imported` as equivalent to `verified`.

Do not delete source input merely because a schema-valid replacement exists.
Follow the non-destructive import and replacement rules in the knowledge
architecture.

## 10. AI-assisted work

AI may help locate candidate sources, compare versions, structure notes,
identify possible inconsistencies, or draft prose from verified research. AI is
not a source, reviewer, or authority. Every factual output must be checked
against the cited material, and every citation must be opened and verified.

AI must not fill unknown fields, invent translations, infer relations, create
quotations, manufacture citations, or turn probability into fact. Keep private,
licensed, or restricted source material within its permitted handling rules.
Editors remain accountable for accuracy, originality, attribution, and release.

## Publication checklist

Before approving factual or editorial content, confirm that:

- each material claim has suitable support at the right scope and date;
- reusable sources and claim-level references are traceable;
- legal, geographic, historical, sensory, and numerical claims meet their
  additional requirements;
- quotations and paraphrases are accurate, original, and rights-compliant;
- uncertainty, disagreement, historical validity, and incomplete work are
  represented honestly;
- Dutch and English express the same underlying knowledge; and
- AI assistance has introduced neither facts nor citations that were not
  independently verified.
