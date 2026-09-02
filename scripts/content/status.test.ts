import { describe, expect, it } from "vitest";
import type { GeneratedEntity } from "../../src/content/model";
import { renderEntityStatus } from "./status";

function entity(
  id: string,
  type: GeneratedEntity["type"],
  status: GeneratedEntity["status"],
  name: string,
): GeneratedEntity {
  const slug = id.slice(id.indexOf(".") + 1);
  return {
    id,
    type,
    status,
    canonical_name: name,
    names: { nl: name, en: name },
    slugs: { nl: slug, en: slug },
    locales: { nl: "overview.nl.md", en: "overview.en.md" },
    relations: [],
    assertions: [],
    source_refs: [],
    content: { nl: { blocks: [] }, en: { blocks: [] } },
  };
}

describe("entity status report", () => {
  it("groups statuses and explains public visibility", () => {
    const report = renderEntityStatus([
      entity("region.zeta", "region", "draft", "Zeta"),
      entity("appellation.alpha", "appellation", "active", "Alpha"),
      entity("concept.oude-term", "concept", "deprecated", "Oude term"),
    ]);

    expect(report).toContain("**Totaal:** 3 entities — 1 active, 1 draft, 1 deprecated.");
    expect(report.indexOf("## Actief")).toBeLessThan(report.indexOf("## Draft"));
    expect(report.indexOf("## Draft")).toBeLessThan(report.indexOf("## Vervallen"));
    expect(report).toContain("| [Alpha](../content/entities/appellations/alpha/entity.yaml)");
    expect(report).toContain("| Ja | `/appellations/alpha` |");
    expect(report).toContain("| Nee — reviewroute | `/regions/zeta` |");
  });

  it("sorts entities within a status by type label and Dutch name", () => {
    const report = renderEntityStatus([
      entity("region.zeta", "region", "draft", "Zeta"),
      entity("appellation.beta", "appellation", "draft", "Beta"),
      entity("appellation.alpha", "appellation", "draft", "Alpha"),
    ]);

    expect(report.indexOf("[Alpha]")).toBeLessThan(report.indexOf("[Beta]"));
    expect(report.indexOf("[Beta]")).toBeLessThan(report.indexOf("[Zeta]"));
  });
});
