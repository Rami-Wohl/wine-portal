import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KnowledgeDepth } from "./knowledge-depth";

describe("KnowledgeDepth", () => {
  it("renders a cumulative scale through the highest available depth", () => {
    const html = renderToStaticMarkup(
      <KnowledgeDepth initialDepth="foundation" maxDepth="advanced">
        <p>Voorbeeldinhoud</p>
      </KnowledgeDepth>,
    );

    expect(html).toContain('data-visible-depth="foundation"');
    expect(html).toMatch(/<button[^>]+aria-pressed="true"[^>]*>Basis<\/button>/);
    expect(html).toContain(">Verdieping</button>");
    expect(html).toContain(">Gevorderd</button>");
    expect(html).not.toContain(">Specialistisch</button>");
  });
});
