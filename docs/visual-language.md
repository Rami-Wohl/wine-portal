# Visual language

Status: binding repository policy

Oenocademy's visual language is editorial, warm, calm, clear, contemporary, and
educational. It should feel trustworthy and generous without borrowing the
cliches of a luxury-wine label, retail catalogue, tasting app, or exam portal.
This policy applies to UI, responsive layouts, imagery, illustration, diagrams,
charts, maps, and presentation. Existing implementation details remain in
`design-system-plan.md`.

## 1. Information leads the composition

Visual hierarchy must explain what the page is about, its scope, and the next
useful action. Prefer a legible title, concise orientation, primary content, and
progressively disclosed depth over dense dashboards or decorative hero areas.
Typography, spacing, grouping, and alignment should carry structure before
ornament does.

Explore, Learn, and Atlas share a family resemblance but may emphasize
different tasks. Do not style Learn as the owner of entity or Atlas content.
Mode, depth, related knowledge, sources, and incomplete states should be
recognizable without exposing internal schemas or pipeline vocabulary.

## 2. Copy is part of the interface

Use human-readable, localized labels. Turn relation types into natural phrases
appropriate to context. Never show stable IDs, field names, relation enums,
internal workflow terminology, or raw validation messages as finished public copy.
Labels must distinguish concepts such as region versus appellation and current
versus historical state when that difference matters.

Dutch is the primary editorial presentation. English is a reviewed
localization, not a machine-filled fallback. Layouts must tolerate natural text
expansion in both languages without truncating essential meaning.

## 3. Illustration has a teaching job

Use educational illustration to teach, orient, compare, or explain something
that prose alone cannot show as efficiently. Suitable uses include processes,
causal relationships, structure, scale, and conceptual comparisons. Do not use
illustration as filler or as a generic signal of sophistication.

Conceptual simplification is allowed when it is pedagogically useful, visibly
appropriate to the subject, and reviewed for accuracy. Captions or surrounding
copy must identify important simplifications and uncertainty. Generated imagery
is never a source and must not pretend to be a photograph, historical record,
scientific observation, or geographic evidence.

Prefer reusable visuals without baked-in language. Use HTML/SVG labels or other
localizable overlays where practical; otherwise maintain explicit NL and EN
variants with equivalent meaning and localized alternative text.

### 3.1 Editorial illustration house style

For atmospheric educational illustrations, use a painterly editorial-naturalist
style: detailed watercolor and gouache, optionally supported by restrained fine
ink, with believable light, vegetation, architecture, vineyard practice, soil,
and material texture. The default palette is warm and quiet—parchment,
limestone, clay, muted olive, vine green, and natural sky tones—without making
every subject look nostalgic or interchangeable.

An illustration must remain understandable as an image, while its caption
completes the lesson. Prefer a legible landscape, cutaway, process scene, or
small comparative plate over floating symbols, generic icons, vague collage, or
decorative abstraction. Show enough physical detail to distinguish the specific
landform, soil sequence, vineyard practice, or process being taught.

Painterly illustrations are raster assets, normally PNG or WebP, and not SVG.
Reserve SVG for interface icons and genuinely diagrammatic visuals whose value
depends on scalable geometry, labels, or data—not as a substitute for a rich
editorial illustration. A horizontal editorial image may default to an
approximately 16:9 composition, but the content determines the final aspect
ratio.

Geographic character must be calibrated against verified sources. Do not
exaggerate elevation, slope, cliffs, valleys, watercourses, quarry faces, soil
depth, or the proximity of landmarks merely to make a composition more
dramatic. Bordeaux in particular contains strong local changes of relief within
a generally low landscape; an illustration must preserve that scale. Never
arrange conceptual panels so that they imply real adjacency or direction unless
verified geographic data supports it.

Generated illustrations contain no baked-in names, legends, logos, borders, or
map-like labels. Add localized explanation in the page layer where necessary.
They must not imitate a photograph or present a generic château, bottle, person,
or parcel as the named real subject.

### 3.2 Caption convention for educational illustration

An educational caption should normally do three jobs in this order:

1. tell the reader how to read the image and identify its relevant elements;
2. explain the relationship or contrast those elements illustrate; and
3. state the material limitation, such as “conceptual,” “not a map,” “not a real
   parcel,” or “not evidence of quality.”

Write the caption as useful editorial prose rather than production metadata.
Keep the creator or credit line separate. Alternative text describes the visual
information required to understand the image; it does not repeat the complete
caption.

## 4. Image credibility and rights

Choose images because they contribute evidence, explanation, atmosphere tied to
the subject, or useful recognition. Do not imply that a generic vineyard,
cellar, soil, bottle, producer, or person depicts the named subject. Clearly
label representative or conceptual imagery where confusion is possible.

Retain creator, source, license, credit line, usage limits, localization,
review status, and relevant factual sources. Provide a meaningful caption when
context or credibility requires it. Unknown rights or provenance is a reason
not to publish an asset.

## 5. Maps and charts are data presentations

All factual map geometry follows `geography-policy.md`. A decorative map must
never function as factual geography, and a schematic must be unmistakably
labeled. Do not use generative output to invent map boundaries, coordinates,
labels, or spatial relations.

Charts must derive their values from structured, cited data. Axes, units,
baselines, time periods, samples, and uncertainty must be readable. Avoid
decorative precision, misleading scales, or visual encodings that overstate the
evidence. Provide a text or table alternative when the visual contains essential
information.

## 6. Responsive behavior is designed, not compressed

Start with reading and task order on a narrow screen, then add columns,
sidebars, persistent navigation, comparison, or map controls only when space
supports them. Preserve content meaning and priority at every size. Reflow
rather than merely shrink; avoid horizontal scrolling except where a deliberate
data comparison includes an accessible alternative.

Do not require hover for information or action. Touch targets, overlays,
captions, legends, tables, long names, localized copy, and empty states must be
tested at realistic narrow and wide viewports. On small screens, a map must not
trap navigation or displace the non-map path to essential information.

## 7. Accessibility is part of visual quality

Use semantic structure, logical heading order, visible keyboard focus, sensible
reading order, and controls with clear names and states. Maintain appropriate
contrast and support zoom and reduced-motion preferences. Motion must clarify a
change or relationship, never be required to understand it.

Color is never the only signal. Combine it with labels, patterns, shapes,
position, or text. Write alternative text for the purpose and information of an
image; do not duplicate nearby prose or list purely decorative details. Complex
diagrams and maps need an equivalent explanation or structured alternative.

## 8. Incomplete states remain useful and honest

Missing imagery, translation, geography, sources, relations, or detail must not
be concealed with invented filler. Design explicit draft, unavailable,
unverified, partial-coverage, and empty states that explain what is missing and
offer a useful next path when one exists. A restrained layout is preferable to
a visually complete but misleading page.

## Review checklist

Before approving visual or UI work, confirm that:

- hierarchy and copy communicate the subject and scope without internal jargon;
- every visual has a purpose and does not overstate its evidentiary role;
- geographic relief, physical scale, relative distance, and process proportions
  match the sources rather than the needs of a dramatic composition;
- the visual neither beautifies the subject nor invents or suppresses material
  detail, variation, ordinary land use, weathering, or operational reality;
- a domain expert could regard every consequential visible element and
  relationship as plausible and correctly bounded;
- images and data visuals have suitable provenance, rights, and credits;
- maps use verified geography or are unmistakably schematic;
- NL and EN, long content, and missing states are supported;
- narrow, wide, keyboard, zoom, contrast, and reduced-motion behavior work; and
- meaning never depends on color, hover, motion, or imagery alone.
