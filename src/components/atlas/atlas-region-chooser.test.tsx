import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasRegionChooser } from "./atlas-region-chooser";

const thumbnail = {
  viewBox: { width: 160 as const, height: 90 },
  paths: ["M0 0l160 0 0 90-160 0z", "M10 20l30 0 0 30z"],
};

describe("AtlasRegionChooser", () => {
  it("renders one card per scene with its thumbnail, name and computed coverage", () => {
    const html = renderToStaticMarkup(
      <AtlasRegionChooser
        cards={[
          {
            id: "scene.medoc",
            href: "/atlas/medoc",
            name: "Médoc",
            coverage: { shown: 8, intended: 8 },
            thumbnail,
          },
          {
            id: "scene.bordeaux",
            href: "/atlas/bordeaux",
            name: "Bordeaux",
            coverage: { shown: 37, intended: 38 },
          },
        ]}
        locale="nl"
      />,
    );
    expect(html).toContain('<h2 id="atlas-regions-title">Kies een regio</h2>');
    expect(html.match(/class="atlas-region-card"/g)).toHaveLength(2);
    // Attribute-level checks: the outer SVG is decorative, the inner viewport clips the paths.
    const outer = html.match(/<svg [^>]*class="atlas-region-thumb"[^>]*>/)?.[0] ?? "";
    expect(outer).toContain('aria-hidden="true"');
    expect(outer).toContain('viewBox="0 0 160 90"');
    const inner = html.match(/<svg [^>]*overflow="hidden"[^>]*>/)?.[0] ?? "";
    expect(inner).toContain('width="160"');
    expect(inner).toContain('height="90"');
    expect(html.match(/<path class="atlas-region-thumb-area" d="[^"]+"/g)).toHaveLength(2);
    expect(html).toContain('d="M10 20l30 0 0 30z"');
    expect(html).toContain("8 van 8 appellaties op de kaart");
    expect(html).toContain("37 van 38 appellaties op de kaart");
    // Without a thumbnail the card keeps its height but draws nothing of its own.
    expect(html).toContain('<span aria-hidden="true" class="atlas-region-thumb"></span>');
  });

  it("localizes the heading and coverage line", () => {
    const html = renderToStaticMarkup(
      <AtlasRegionChooser
        cards={[
          {
            id: "scene.medoc",
            href: "/en/atlas/medoc",
            name: "Médoc",
            coverage: { shown: 1, intended: 1 },
            thumbnail,
          },
        ]}
        locale="en"
      />,
    );
    expect(html).toContain("Choose a region");
    expect(html).toContain("1 of 1 appellation mapped");
    expect(html).toContain('href="/en/atlas/medoc"');
  });
});
