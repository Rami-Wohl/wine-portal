import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ContentDocument, MediaAsset, Source } from "@/content/model";
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

const mediaAsset: MediaAsset = {
  id: "media.example.photo",
  kind: "photo",
  role: "documentary",
  status: "active",
  storage_key: "example/photo.jpg",
  mime_type: "image/jpeg",
  width: 1200,
  height: 800,
  checksum_sha256: "a".repeat(64),
  alt: { nl: "Een voorbeeldwijngaard", en: "An example vineyard" },
  caption: { nl: "Wijngaard bij zonsondergang.", en: "Vineyard at sunset." },
  rights: {
    status: "open-licensed",
    creator: "Example Photographer",
    source_url: "https://example.com/photo",
    license_name: "CC BY 4.0",
    license_url: "https://creativecommons.org/licenses/by/4.0/",
    credit_line: "Example Photographer",
  },
  acquired_at: "2026-09-01",
};

const document: ContentDocument = {
  blocks: [
    {
      id: "orientatie",
      type: "summary",
      depth: "foundation",
      source_refs: [],
      variant: null,
      media_id: null,
      nodes: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "Een heldere introductie." }],
        },
      ],
    },
    {
      id: "uitleg",
      type: "section",
      depth: "intermediate",
      source_refs: ["source.example"],
      variant: null,
      media_id: null,
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
      <ContentDocumentView document={document} locale="nl" media={[]} sources={[source]} />,
    );

    expect(html).toContain('id="orientatie"');
    expect(html).toContain("<h2>Uitleg</h2>");
    expect(html).toContain('href="/regions/bordeaux"');
    expect(html).toContain('href="#source-1"');
    expect(html).toContain('aria-label="Bron 1: Example source, p. 42"');
    expect(html).not.toContain("source.example");
  });

  it("renders registered media with localized text and rights information", () => {
    const figureDocument: ContentDocument = {
      blocks: [
        {
          id: "voorbeeldfoto",
          type: "figure",
          depth: null,
          source_refs: [],
          variant: null,
          media_id: mediaAsset.id,
          nodes: [],
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ContentDocumentView
        document={figureDocument}
        locale="nl"
        media={[mediaAsset]}
        sources={[]}
      />,
    );

    expect(html).toContain("Een voorbeeldwijngaard");
    expect(html).toContain("Wijngaard bij zonsondergang.");
    expect(html).toContain("url=%2Fmedia%2Fexample%2Fphoto.jpg");
    expect(html).toContain("Example Photographer");
    expect(html).toContain("CC BY 4.0");
  });
});
