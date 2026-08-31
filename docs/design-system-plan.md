# Design system plan

Status: implemented as the first UI vertical slice.

## Product character

Oenocademy should feel calm, thoughtful and trustworthy. It should not imitate a
wine shop, luxury label or exam portal. The interface gives long-form learning
room to breathe and makes depth optional instead of intimidating.

## System layers

1. **Foundations** — semantic color, typography, spacing, radius and shadow
   tokens live in `src/app/globals.css`.
2. **Primitives** — links, buttons, cards, callouts, labels and progress
   indicators use semantic classes and never introduce one-off colors.
3. **Learning patterns** — lesson cards, objectives, diagrams, depth notes,
   simplifications and the “in the glass” summary are reusable editorial
   patterns.
4. **Page compositions** — Learn, Explore, Atlas, entity pages and comparisons
   compose those patterns without redefining their visual language.

## Responsive principles

- Start with a narrow reading measure and mobile content order.
- Enhance to multi-column navigation only when there is enough room.
- Never require hover for meaning or interaction.
- Test at 375, 768, 1024 and 1440 CSS pixels.
- Use fluid type and spacing within deliberate minimum and maximum bounds.

## Accessibility baseline

- Semantic landmarks and heading order.
- Visible keyboard focus and a skip link.
- Text alternatives for educational diagrams.
- WCAG-aware contrast; color is never the only carrier of meaning.
- Reduced-motion support.
- Interactive targets around 40–44 pixels where possible.

## Content contract

Every canonical lesson should eventually provide:

- title, summary, estimated duration and depth;
- learning objectives;
- content blocks with stable IDs and depth metadata;
- at least one “Kernidee”;
- honest simplifications or caveats where needed;
- a short “Waarom doet dit ertoe in het glas?” section;
- wine relevance score;
- sources and last-reviewed metadata.

## Next implementation steps

1. Implement the safe Markdown directive renderer and validator defined in
   `content-blocks.md`; canonical content remains `.md`, not executable MDX.
2. Extract repeated UI patterns into components when a second page needs them.
3. Add lesson routing and previous/next navigation.
4. Add persisted progress only after the anonymous reading flow works well.
5. Test keyboard, screen-reader, zoom, mobile and long-content edge cases.
6. Add screenshot regression tests for the four target viewport widths.
7. Build Bordeaux as the first entity/narrative vertical slice only after the
   lesson content model is proven.
