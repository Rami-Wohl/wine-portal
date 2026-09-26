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
      parent: null,
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
      depth: "foundation",
      parent: null,
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
    {
      id: "uitleg-detail",
      type: "detail",
      depth: "intermediate",
      parent: "uitleg",
      source_refs: [],
      variant: null,
      media_id: null,
      nodes: [
        {
          type: "heading",
          depth: 3,
          children: [{ type: "text", value: "Meer uitleg" }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Een verdiepende toelichting." }],
        },
      ],
    },
    {
      id: "uitleg-detail-twee",
      type: "detail",
      depth: "intermediate",
      parent: "uitleg",
      source_refs: [],
      variant: null,
      media_id: null,
      nodes: [
        {
          type: "heading",
          depth: 3,
          children: [{ type: "text", value: "Nog meer uitleg" }],
        },
      ],
    },
    {
      id: "verdiepende-sectie",
      type: "section",
      depth: "intermediate",
      parent: null,
      source_refs: [],
      variant: null,
      media_id: null,
      nodes: [
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", value: "Verdiepende sectie" }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Ook een volledige sectie toont haar niveau." }],
        },
      ],
    },
    {
      id: "tweede-verdiepende-sectie",
      type: "section",
      depth: "intermediate",
      parent: null,
      source_refs: [],
      variant: null,
      media_id: null,
      nodes: [
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", value: "Tweede verdiepende sectie" }],
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
    expect(html).toContain('class="content-section-group"');
    expect(html).toContain('data-parent="uitleg"');
    expect(html).toContain('class="content-depth-marker"');
    expect(html).toContain("Verdieping");
    expect(html).toContain("<h3>Meer uitleg</h3>");
    expect(html.match(/class="content-depth-marker"/g)).toHaveLength(2);
    expect(html).toMatch(
      /data-depth-detail-run="intermediate".*content-depth-marker.*Verdieping.*id="uitleg-detail".*id="uitleg-detail-twee"/,
    );
    expect(html).toMatch(
      /data-depth-run="intermediate".*content-depth-marker.*Verdieping.*id="verdiepende-sectie".*id="tweede-verdiepende-sectie"/,
    );
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
          parent: null,
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

  it("groups consecutive representative photographs into one compact gallery", () => {
    const representativeAssets: MediaAsset[] = [
      { ...mediaAsset, id: "media.example.rock-one", role: "representative" },
      { ...mediaAsset, id: "media.example.rock-two", role: "representative" },
    ];
    const galleryDocument: ContentDocument = {
      blocks: representativeAssets.map((asset, index) => ({
        id: `rock-${index + 1}`,
        type: "figure",
        depth: "foundation",
        parent: null,
        source_refs: [],
        variant: null,
        media_id: asset.id,
        nodes: [],
      })),
    };

    const html = renderToStaticMarkup(
      <ContentDocumentView
        document={galleryDocument}
        locale="nl"
        media={representativeAssets}
        sources={[]}
      />,
    );

    expect(html.match(/class="content-media-gallery"/g)).toHaveLength(1);
    expect(html).toContain('id="rock-1"');
    expect(html).toContain('id="rock-2"');
    expect(html.match(/sizes="\(max-width: 620px\) calc\(100vw - 32px\), 370px"/g)).toHaveLength(2);
  });

  it("starts a separate visual run when a detail is deeper than an already elevated section", () => {
    const mixedDepthDocument: ContentDocument = {
      blocks: [
        {
          id: "bewijs-en-grenzen",
          type: "section",
          depth: "intermediate",
          parent: null,
          source_refs: [],
          variant: null,
          media_id: null,
          nodes: [
            {
              type: "heading",
              depth: 2,
              children: [{ type: "text", value: "Bewijs en grenzen" }],
            },
          ],
        },
        {
          id: "categorieen",
          type: "detail",
          depth: "advanced",
          parent: "bewijs-en-grenzen",
          source_refs: [],
          variant: null,
          media_id: null,
          nodes: [
            {
              type: "heading",
              depth: 3,
              children: [{ type: "text", value: "Categorieën" }],
            },
          ],
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ContentDocumentView document={mixedDepthDocument} locale="nl" media={[]} sources={[]} />,
    );

    expect(html.match(/class="content-depth-marker"/g)).toHaveLength(2);
    expect(html).toMatch(
      /data-depth-run="intermediate".*Verdieping.*id="bewijs-en-grenzen".*<\/section><\/div><\/div><div class="content-depth-detail-run content-depth-advanced"/,
    );
    expect(html).toMatch(/data-depth-detail-run="advanced".*Gevorderd.*id="categorieen"/);
  });

  it("groups compact register entries under their owner section", () => {
    const registerDocument: ContentDocument = {
      blocks: [
        {
          id: "register",
          type: "section",
          depth: "foundation",
          parent: null,
          source_refs: [],
          variant: null,
          media_id: null,
          nodes: [{ type: "heading", depth: 2, children: [{ type: "text", value: "Register" }] }],
        },
        {
          id: "producent-voorbeeld",
          type: "register-entry",
          depth: "foundation",
          parent: "register",
          source_refs: [],
          variant: null,
          media_id: null,
          nodes: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Château Voorbeeld — Cinquième Cru." }],
            },
          ],
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ContentDocumentView document={registerDocument} locale="nl" media={[]} sources={[]} />,
    );

    expect(html).toContain("content-section-group content-register-group");
    expect(html).toContain('class="content-block content-block-register-entry');
    expect(html).toContain('data-parent="register"');
  });
});
