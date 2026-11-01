import { describe, expect, it } from "vitest";
import { fixtureEntity } from "../../scripts/content/fixtures/geography";
import { buildAtlasPortal, placePortalNodes } from "./atlas-portal";
import type { AtlasPortalNode, AtlasSceneSummary, Entity } from "./model";

const region = (id: string, nl: string, en: string, options: Partial<Entity> = {}) =>
  fixtureEntity(`region.${id}`, {
    status: "active",
    names: { nl, en },
    canonical_name: en,
    ...options,
  });
const partOf = (...targets: string[]) =>
  targets.map((target) => ({ type: "part_of" as const, target: `region.${target}` }));

const summary = (owner: string, shown: number, intended = shown): AtlasSceneSummary => ({
  id: `scene.${owner}`,
  owner: `region.${owner}`,
  slug: owner,
  viewBox: { width: 1000, height: 800 },
  bbox: [0, 44, 1, 45],
  projection: { name: "mercator", scale: 1, translate: [0, 0] },
  coverage: {
    intended: Array.from({ length: intended }, (_, index) => `appellation.${owner}-${index}`),
    shown: Array.from({ length: shown }, (_, index) => `appellation.${owner}-${index}`),
    missing: [],
  },
  credits: [],
  simplification: {
    method: "fixture",
    tolerance: 0,
    pixels: 0,
    vertexCountBefore: 0,
    vertexCountAfter: 0,
    droppedParts: [],
  },
  featureCount: shown,
  selectableEntities: [],
  thumbnail: { viewBox: { width: 160, height: 90 }, paths: ["M0 0l1 0 0 1z"] },
});

function build(locale: "nl" | "en", all: Entity[], summaries: AtlasSceneSummary[]) {
  const byOwner = new Map(summaries.map((item) => [item.owner, item]));
  return buildAtlasPortal({
    locale,
    entities: all.filter((candidate) => candidate.status === "active"),
    getEntityById: (id) => all.find((candidate) => candidate.id === id),
    // A simple stand-in for the repository rule: own scene, else a direct parent's.
    sceneFor: (id) =>
      byOwner.get(id) ??
      all
        .find((candidate) => candidate.id === id)
        ?.relations.map((relation) => byOwner.get(relation.target))
        .find(Boolean),
    sceneHref: (scene, target) => `${target === "en" ? "/en" : ""}/atlas/${scene.slug}`,
    areaNames: (scene) => scene.coverage.shown.map((id) => `Area ${id.split(".")[1]}`),
    pageHref: (target, target2) => `${target2 === "en" ? "/en" : ""}/regions/${target.slugs.en}`,
  });
}

const names = (nodes: AtlasPortalNode[]): string[] => nodes.map((item) => item.name);

describe("buildAtlasPortal", () => {
  const all = [
    region("bordeaux", "Bordeaux", "Bordeaux"),
    region("medoc", "Médoc", "Médoc", { relations: partOf("bordeaux") }),
    region("libournais", "Libournais", "Libournais", { relations: partOf("bordeaux") }),
    region("fronsadais", "Fronsadais", "Fronsadais", { relations: partOf("libournais") }),
    // A draft between two published regions is skipped, never named.
    region("draft-middle", "Conceptgebied", "Draft area", {
      status: "draft",
      relations: partOf("bordeaux"),
    }),
    region("graves", "Graves", "Graves", { relations: partOf("draft-middle") }),
    region("loire", "Loirevallei", "Loire Valley", { status: "draft" }),
    region("mosel", "Moezel", "Mosel"),
    region("entre-deux-mers", "Entre-deux-Mers", "Entre-deux-Mers", {
      relations: partOf("bordeaux"),
    }),
  ];
  const summaries = [
    summary("bordeaux", 37, 38),
    summary("medoc", 8),
    summary("libournais", 12),
    summary("fronsadais", 2),
    summary("entre-deux-mers", 0, 6),
  ];

  it("nests published regions by part_of, alphabetically per language, drafts left out", () => {
    const portal = build("nl", all, summaries);
    expect(names(portal.sections)).toEqual(["Bordeaux", "Moezel"]);
    expect(names(portal.sections[0].children)).toEqual([
      "Entre-deux-Mers",
      "Graves",
      "Libournais",
      "Médoc",
    ]);
    expect(names(portal.sections[0].children[2].children)).toEqual(["Fronsadais"]);
    expect(portal.regionCount).toBe(7);
    expect(portal.mapCount).toBe(4);
    expect(JSON.stringify(portal)).not.toMatch(/Conceptgebied|Draft area|Loire/);
    expect(names(build("en", all, summaries).sections)).toEqual(["Bordeaux", "Mosel"]);
  });

  it("gives every region one entry and an honest state; maps add their appellation names", () => {
    const portal = build("en", all, summaries);
    const [bordeaux, mosel] = portal.sections;
    expect(bordeaux).toMatchObject({
      href: "/en/atlas/bordeaux",
      pageHref: "/en/regions/bordeaux",
      state: { kind: "map", shown: 37, intended: 38 },
    });
    expect(bordeaux.areaNames).toContain("Area bordeaux-36");
    const [entreDeuxMers, graves] = bordeaux.children;
    expect(entreDeuxMers).toMatchObject({
      href: "/en/regions/entre-deux-mers",
      state: { kind: "preparing" },
    });
    expect(entreDeuxMers.pageHref).toBeUndefined();
    // Its draft parent has no scene, so text only.
    expect(graves).toMatchObject({ href: "/en/regions/graves", state: { kind: "text" } });
    expect(mosel).toMatchObject({ state: { kind: "text" }, children: [] });
    expect(mosel.matchNames).toEqual(["Moezel", "Mosel"]);
    expect(mosel.areaNames).toEqual([]);
  });
});

describe("placing a region with several parents", () => {
  const place = (candidates: Record<string, string[]>) =>
    Object.fromEntries(placePortalNodes(new Map(Object.entries(candidates))));

  it("chooses the first by id between unrelated parents at the same depth", () => {
    expect(place({ x: ["b", "a"], a: [], b: [] })).toEqual({ x: "a" });
    expect(place({ x: ["a", "b"], b: [], a: [] })).toEqual({ x: "a" });
  });

  it("chooses the deeper parent when depths differ, related or not", () => {
    // c is under b: c is deeper than a.
    expect(place({ x: ["a", "c"], a: [], b: [], c: ["b"] })).toEqual({ x: "c", c: "b" });
    // c is under a itself: the more specific one wins.
    expect(place({ x: ["a", "c"], a: [], c: ["a"] })).toEqual({ x: "c", c: "a" });
  });
});

describe("containment cycles", () => {
  it("detaches only cycle members, chosen by id, whatever the input order", () => {
    // X → A → B → A: A (smallest id in the cycle) loses its edge into the cycle.
    const orders = [
      { x: ["a"], a: ["b"], b: ["a"] },
      { b: ["a"], a: ["b"], x: ["a"] },
    ];
    for (const order of orders) {
      const placed = Object.fromEntries(placePortalNodes(new Map(Object.entries(order))));
      expect(placed).toEqual({ x: "a", b: "a" });
    }
  });

  it("keeps a cycle member's other parent and breaks nested cycles one by one", () => {
    const placed = Object.fromEntries(
      placePortalNodes(
        new Map(Object.entries({ root: [], a: ["b", "root"], b: ["c"], c: ["b", "a"], x: ["c"] })),
      ),
    );
    // {a, b, c} is a cycle: a (smallest id) loses its edge to b and stays under root; {b, c}
    // still cycles, so b loses its edge to c and becomes top level; c takes the deeper of b
    // and a; x stays under c.
    expect(placed).toEqual({ a: "root", c: "a", x: "c" });
    // Every node still reaches the top: no node is lost to a cycle.
    for (const start of ["a", "b", "c", "x"]) {
      const seen = new Set<string>();
      for (let at: string | undefined = start; at; at = placed[at]) {
        expect(seen.has(at)).toBe(false);
        seen.add(at);
      }
    }
  });

  it("keeps the regions of a two-region cycle visible in the portal", () => {
    const cycle = [
      region("a", "A", "A", { relations: partOf("b") }),
      region("b", "B", "B", { relations: partOf("a") }),
    ];
    for (const list of [cycle, [...cycle].reverse()]) {
      const portal = build("nl", list, []);
      expect(names(portal.sections)).toEqual(["A"]);
      expect(names(portal.sections[0].children)).toEqual(["B"]);
    }
  });
});
