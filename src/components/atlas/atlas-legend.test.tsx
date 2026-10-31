import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasLegend } from "./atlas-legend";
import { sampleScene } from "./fixtures/sample-scene";

const layers = { context: true, water: true, places: true, overlap: true };

function visibleText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&#x27;/g, "'");
}

describe("AtlasLegend", () => {
  it("states computed coverage, human reasons and Licence Ouverte credits in Dutch", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={false}
        coverage={{ intended: 5, shown: 4, missing: [{ name: "Cérons", reason: "held" }] }}
        credits={sampleScene.credits}
        headingLevel={3}
        idBase="atlas-test"
        layers={layers}
        locale="nl"
        partsDropped={false}
        simplificationPixels={1}
      />,
    );
    const text = visibleText(html);
    expect(text).toContain("4 van de 5 appellaties van deze kaart zijn getekend.");
    expect(text).toContain("Nog niet op de kaart: Cérons (de kaartvorm wordt nog gecontroleerd).");
    expect(text).toContain("zoals INAO het in kaart brengt");
    expect(html).toMatch(
      /<li class="atlas-legend-credit"><a href="https:\/\/www\.data\.gouv\.fr\/datasets\/delimitation-des-aires-geographiques-des-siqo" rel="noopener">INAO, Délimitation des aires géographiques des SIQO, édition du 12 octobre 2026<\/a>, hergebruikt onder <a href="https:\/\/www\.data\.gouv\.fr\/pages\/legal\/licences\/etalab-2\.0" rel="license noopener">Licence Ouverte \/ Open Licence 2\.0<\/a>\.<\/li>/,
    );
    expect(text).toContain(
      "De vormen zijn voor weergave vereenvoudigd; wie ver inzoomt, ziet randen grover dan in de bron.",
    );
    expect(text).not.toMatch(/pixel/i);
    expect(text).not.toContain("Heel kleine delen");
    expect(text).not.toContain("Brongegevens per");
    expect(text).not.toContain("Bronvermelding");
    expect(text).not.toContain("editie van");
    expect(text.match(/de uitgevers zijn niet bij deze site betrokken/g)).toHaveLength(1);
    expect(text).toContain("Appellatiegebieden kunnen elkaar overlappen.");
    expect(html).toContain(
      '<span class="atlas-needs-script">Klik of tik op een overlap om te kiezen welk gebied je opent; de lijst noemt ze allemaal.</span>',
    );
    expect(text).toContain("Productiegebied van een appellatie");
    expect(text).toContain("Overkoepelend gebied (gearceerd)");
    expect(text).not.toContain("etalab-2.0");
    expect(text).not.toContain("source.");
    expect(html).toContain('<h3 class="atlas-legend-title"');
  });

  it("renders the English localization with the same facts", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={false}
        coverage={{ intended: 5, shown: 4, missing: [{ name: "Cérons", reason: "no-record" }] }}
        credits={sampleScene.credits}
        headingLevel={3}
        idBase="atlas-test"
        layers={layers}
        locale="en"
        partsDropped={true}
        simplificationPixels={2.5}
      />,
    );
    const text = visibleText(html);
    expect(text).toContain("4 of this map's 5 appellations are drawn.");
    expect(text).toContain("Not yet on the map: Cérons (there is no verified map shape yet).");
    expect(text).toContain(
      "INAO, Délimitation des aires géographiques des SIQO, édition du 12 octobre 2026 , reused under Licence Ouverte / Open Licence 2.0 .",
    );
    expect(text).toContain(
      "Shapes are simplified for display; zoomed in closely, edges are coarser than in the source. Very small parts, such as detached slivers of an appellation area, short river stretches or islets, are not drawn at this scale.",
    );
    expect(text).not.toContain("2.5");
    expect(text).not.toContain("Source data as of");
    expect(text).toContain("Appellation areas can overlap.");
    expect(text).toContain("Appellation production area");
  });

  it("describes complete coverage and keeps the summary plain with the heading inside", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={true}
        coverage={{ intended: 2, shown: 2, missing: [] }}
        credits={sampleScene.credits}
        headingLevel={4}
        idBase="atlas-test"
        layers={{ context: false, water: false, places: false, overlap: false }}
        locale="nl"
        partsDropped={false}
        simplificationPixels={0}
      />,
    );
    const text = visibleText(html);
    expect(text).toContain("Beide appellaties van deze kaart zijn getekend.");
    expect(text).toContain("De vormen zijn niet verder vereenvoudigd.");
    expect(text).not.toContain("Nog niet op de kaart");
    expect(text).not.toContain("Overkoepelend gebied");
    expect(text).not.toContain("overlappen");
    expect(html).toContain(
      '<details class="atlas-legend-disclosure"><summary>Over deze kaart: legenda, bron en dekking</summary>',
    );
    expect(html).toContain('<h4 class="atlas-legend-title"');
    expect(html.indexOf("<h4")).toBeGreaterThan(html.indexOf("</summary>"));
  });

  it("uses singular coverage for a one-appellation map", () => {
    const one = (shown: number, locale: "nl" | "en") =>
      visibleText(
        renderToStaticMarkup(
          <AtlasLegend
            collapsible={false}
            coverage={{
              intended: 1,
              shown,
              missing: shown ? [] : [{ name: "Champagne", reason: "held" }],
            }}
            credits={[]}
            headingLevel={3}
            idBase="atlas-test"
            layers={layers}
            locale={locale}
            partsDropped={false}
            simplificationPixels={0}
          />,
        ),
      );
    expect(one(1, "nl")).toContain("De appellatie van deze kaart is getekend.");
    expect(one(1, "en")).toContain("This map's appellation is drawn.");
    expect(one(0, "nl")).toContain("De appellatie van deze kaart is nog niet getekend.");
  });

  it("counts unresolved gaps without exposing their identifiers", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={false}
        coverage={{
          intended: 3,
          shown: 1,
          missing: [
            { name: "Cérons", reason: "unpublished" },
            { name: null, reason: "held" },
          ],
        }}
        credits={[]}
        headingLevel={3}
        idBase="atlas-test"
        layers={layers}
        locale="nl"
        partsDropped={false}
        simplificationPixels={1}
      />,
    );
    const text = visibleText(html);
    expect(text).toContain("1 van de 3 appellaties van deze kaart is getekend.");
    expect(text).toContain(
      "Nog niet op de kaart: Cérons (de kaartvorm is nog niet vrijgegeven) en 1 ander gebied.",
    );
    expect(text).not.toContain("Kaartgegevens");
  });

  it("keeps a source without a dataset page as plain text", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={false}
        coverage={{ intended: 1, shown: 1, missing: [] }}
        credits={[
          {
            ...sampleScene.credits[0],
            url: undefined,
          },
        ]}
        headingLevel={3}
        idBase="atlas-test"
        layers={layers}
        locale="nl"
        partsDropped={false}
        simplificationPixels={1}
      />,
    );
    expect(html).toContain(
      '<span class="atlas-legend-dataset">INAO, Délimitation des aires géographiques des SIQO, édition du 12 octobre 2026</span>, hergebruikt onder',
    );
    expect(html).not.toContain('href="https://www.data.gouv.fr/datasets/');
  });

  it("says when no appellation areas are assigned instead of claiming a complete set of zero", () => {
    const html = renderToStaticMarkup(
      <AtlasLegend
        collapsible={false}
        coverage={{ intended: 0, shown: 0, missing: [] }}
        credits={[]}
        headingLevel={3}
        idBase="atlas-test"
        layers={{ context: false, water: false, places: false, overlap: false }}
        locale="en"
        partsDropped={false}
        simplificationPixels={0}
      />,
    );
    const text = visibleText(html);
    expect(text).toContain("No appellation areas have been assigned to this map yet.");
    expect(text).not.toContain("All 0");
  });
});
