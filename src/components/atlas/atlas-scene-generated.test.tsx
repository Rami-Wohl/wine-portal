import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AtlasSceneView, Locale } from "@/content/model";
import { AtlasScene } from "./atlas-scene";

/**
 * Production copy check: renders the real generated Bordeaux scene so record titles,
 * pipeline terms and identifiers can never reach readers. Skips when the geography build
 * has not run (`npm run content:build`).
 */
const scenePath = join(process.cwd(), "src/generated/geography/scenes/scene.bordeaux.json");
const available = existsSync(scenePath);
const scene: AtlasSceneView | null = available
  ? (JSON.parse(readFileSync(scenePath, "utf8")) as AtlasSceneView)
  : null;

// Stable identifiers look like `appellation.pauillac`: a namespace, a dot and a lowercase
// slug with no space. Plain prose such as "a regional appellation. The hatching" must pass.
const IDENTIFIER_PATTERN = /\b(?:geo|appellation|region|scene|source)\.[a-z]/;

const FORBIDDEN = [
  "shapefile",
  "WFS",
  "remplace",
  "mercator",
  "EPSG",
  "etalab-2.0",
  "steradia",
  "pixel",
  "beoogd",
  "intended",
  "Brongegevens per",
  "Source data as of",
];

function visibleText(html: string) {
  return html
    .replace(/<title>[^<]*<\/title>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&#x27;/g, "'");
}

describe.skipIf(!available)("AtlasScene with the generated Bordeaux scene", () => {
  for (const locale of ["nl", "en"] as Locale[]) {
    for (const variant of ["overview", "embedded"] as const) {
      it(`keeps ${locale} ${variant} copy free of pipeline terms and identifiers`, () => {
        const html = renderToStaticMarkup(
          <AtlasScene locale={locale} scene={scene!} variant={variant} />,
        );
        const text = visibleText(html);
        for (const term of FORBIDDEN) expect(text, term).not.toContain(term);
        expect(text, "stable identifier").not.toMatch(IDENTIFIER_PATTERN);
        const credits = html.match(/<li class="atlas-legend-credit">/g) ?? [];
        expect(credits).toHaveLength(scene!.credits.length);
        for (const credit of scene!.credits) {
          expect(text.split(credit.attribution)).toHaveLength(2);
        }
      });
    }
  }
});
