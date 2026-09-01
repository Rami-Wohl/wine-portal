import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ContentDocument, Source } from "@/content/model";
import { ContentDocumentView } from "./content-document";

const source: Source = {
  id: "source.example",
  source_type: "book",
  publisher: "Example Publisher",
  title: "Example source",
  url: "https://example.com/source",
  language: "en",
  status: "active",
};

const document: ContentDocument = {
  blocks: [
    {
      id: "orientatie",
      type: "summary",
      depth: "foundation",
      source_refs: [],
      variant: null,
      nodes: [{
        type: "paragraph",
        children: [{ type: "text", value: "Een heldere introductie." }],
      }],
    },
    {
      id: "uitleg",
      type: "section",
      depth: "intermediate",
      source_refs: ["source.example"],
      variant: null,
      nodes: [
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", value: "Uitleg" }],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Lees ook " },
            { type: "entity-link", entity_id: "region.bordeaux", label: "Bordeaux" },
            { type: "text", value: ". " },
            { type: "citation", source_id: "source.example", locator: "p. 42" },
          ],
        },
      ],
    },
  ],
};

describe("ContentDocumentView", () => {
  it("renders semantic blocks, canonical entity routes, and accessible citations", () => {
    const html = renderToStaticMarkup(
      <ContentDocumentView document={document} locale="nl" sources={[source]} />,
    );

    expect(html).toContain('id="orientatie"');
    expect(html).toContain('<h2>Uitleg</h2>');
    expect(html).toContain('href="/regions/bordeaux"');
    expect(html).toContain('aria-label="Example source, p. 42"');
    expect(html).not.toContain("source.example");
  });
});
