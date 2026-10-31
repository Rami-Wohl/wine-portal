import type { AtlasSceneView } from "@/content/model";

/**
 * TEST FIXTURE — NOT GEOGRAPHY.
 *
 * Every shape, anchor and coordinate below is invented so the Atlas components
 * can be rendered and tested without the generated display assets. The owners
 * reference real knowledge-base entities so links resolve, but the polygons bear
 * no relation to any appellation's real extent. Never publish or derive data
 * from this file; see docs/geography-policy.md.
 */
export const sampleScene: AtlasSceneView = {
  id: "scene.fixture-graves-sauternais",
  owner: "region.graves-sauternais",
  slug: "graves-and-sauternais",
  viewBox: { width: 1000, height: 700 },
  bbox: [-0.7, 44.4, 0.1, 44.95],
  projection: { name: "mercator", scale: 1, translate: [0, 0] },
  layers: [
    {
      id: "water",
      role: "water",
      features: [
        {
          id: "geo.water-body.fixture-estuary",
          kind: "water-body",
          names: { nl: "Oefenestuarium (testdata)", en: "Practice estuary (test data)" },
          geometryType: "area",
          path: "M 0 0 L 260 0 L 300 120 L 200 260 L 120 380 L 0 420 Z",
          labelAnchor: [120, 150],
        },
        {
          id: "geo.river.fixture-river",
          kind: "river",
          names: { nl: "Oefenrivier (testdata)", en: "Practice river (test data)" },
          geometryType: "line",
          path: "M 300 120 L 420 230 L 520 330 L 640 420 L 760 560 L 860 700",
        },
      ],
    },
    {
      id: "context",
      role: "context",
      features: [
        {
          id: "geo.appellation-area.bordeaux",
          kind: "appellation-area",
          owner: "appellation.bordeaux",
          names: { nl: "AOP Bordeaux", en: "Bordeaux AOP" },
          geometryType: "area",
          path: "M 60 40 L 940 60 L 960 660 L 40 640 Z",
          labelAnchor: [880, 110],
          areaRank: 1,
        },
      ],
    },
    {
      id: "appellations",
      role: "selectable",
      features: [
        {
          id: "geo.appellation-area.graves",
          kind: "appellation-area",
          owner: "appellation.graves",
          names: { nl: "Graves", en: "Graves" },
          geometryType: "area",
          path: "M 330 140 L 560 170 L 600 330 L 520 470 L 360 430 L 300 290 Z",
          labelAnchor: [450, 310],
          areaRank: 1,
        },
        {
          id: "geo.appellation-area.sauternes",
          kind: "appellation-area",
          owner: "appellation.sauternes",
          names: { nl: "Sauternes", en: "Sauternes" },
          geometryType: "area",
          path: "M 560 460 L 760 480 L 790 620 L 600 640 Z",
          labelAnchor: [740, 600],
          areaRank: 2,
        },
        {
          id: "geo.appellation-area.pessac-leognan",
          kind: "appellation-area",
          owner: "appellation.pessac-leognan",
          names: { nl: "Pessac-Léognan", en: "Pessac-Léognan" },
          geometryType: "area",
          path: "M 330 60 L 500 80 L 520 160 L 330 140 Z",
          labelAnchor: [420, 110],
          areaRank: 3,
        },
        {
          // Lies entirely inside the Sauternes shape to exercise the overlap chooser.
          id: "geo.appellation-area.barsac",
          kind: "appellation-area",
          owner: "appellation.barsac",
          names: { nl: "Barsac", en: "Barsac" },
          geometryType: "area",
          path: "M 600 490 L 690 500 L 700 570 L 610 575 Z",
          labelAnchor: [650, 533],
          areaRank: 4,
        },
      ],
    },
    {
      id: "places",
      role: "places",
      features: [
        {
          id: "geo.populated-place.fixture-town-a",
          kind: "populated-place",
          names: { nl: "Oefenstad (testdata)", en: "Practice town (test data)" },
          geometryType: "point",
          point: [560, 120],
        },
        {
          id: "geo.populated-place.fixture-town-b",
          kind: "populated-place",
          names: { nl: "Oefendorp (testdata)", en: "Practice village (test data)" },
          geometryType: "point",
          point: [820, 560],
        },
      ],
    },
  ],
  coverage: {
    intended: [
      "appellation.graves",
      "appellation.pessac-leognan",
      "appellation.sauternes",
      "appellation.barsac",
      "appellation.cerons",
    ],
    shown: [
      "appellation.graves",
      "appellation.pessac-leognan",
      "appellation.sauternes",
      "appellation.barsac",
    ],
    missing: [{ entity: "appellation.cerons", reason: "held" }],
  },
  credits: [
    {
      sourceId: "source.inao-geographical-areas-2026",
      publisher: "Institut national de l’origine et de la qualité (INAO)",
      licence: {
        id: "etalab-2.0",
        name: "Licence Ouverte / Open Licence 2.0",
        url: "https://www.data.gouv.fr/pages/legal/licences/etalab-2.0",
      },
      url: "https://www.data.gouv.fr/datasets/delimitation-des-aires-geographiques-des-siqo",
      attribution:
        "INAO, Délimitation des aires géographiques des SIQO, édition du 12 octobre 2026",
    },
  ],
  simplification: {
    method: "fixture",
    tolerance: 0,
    pixels: 0,
    droppedParts: [],
    vertexCountBefore: 0,
    vertexCountAfter: 0,
  },
};
