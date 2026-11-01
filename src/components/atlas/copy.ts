import type { AtlasCoverageView, Locale } from "@/content/model";

export type AtlasMissingReason = AtlasCoverageView["missing"][number]["reason"];

/** Which orientation layers a map (or every map in a set) actually draws. */
export interface AtlasOrientation {
  water: boolean;
  places: boolean;
}

/** The orientation layers drawn by every scene given (all must have one to claim it). */
export function scenesOrientation(
  scenes: Array<{ layers: Array<{ role: string; features: unknown[] }> }>,
): AtlasOrientation {
  const has = (role: string) =>
    scenes.length > 0 &&
    scenes.every((scene) =>
      scene.layers.some((layer) => layer.role === role && layer.features.length > 0),
    );
  return { water: has("water"), places: has("places") };
}

/** "water en plaatsen" / "water and towns", only for the layers present; null when none. */
export function orientationLayers(orientation: AtlasOrientation, locale: Locale): string | null {
  const parts = [
    orientation.water ? "water" : null,
    orientation.places ? (locale === "nl" ? "plaatsen" : "towns") : null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? joinNames(parts, locale) : null;
}

/**
 * The portal finder's strings as plain data (templates with {count}, {found}, {shown} and
 * {query}), so the server can pass them to the client finder as props.
 */
export interface AtlasFinderCopy {
  label: string;
  submit: string;
  foundOne: string;
  foundOther: string;
  /** Appended when context regions are shown besides the matches, e.g. ", 7 getoond". */
  shown: string;
  /** Under a region found by an appellation on its map, e.g. "Met Pauillac". */
  areaHit: string;
  none: string;
  searchAll: string;
}

/** Public map copy. Human, localized, honest about scale, source, date and gaps. */
export interface AtlasCopy {
  mapHeading: (ownerName: string | null) => string;
  /** Names only the orientation layers the scene actually draws. */
  mapIntro: (ownerName: string | null, orientation: AtlasOrientation) => string;
  /** Said once per map: in the legend section, or in the embedded map's about disclosure. */
  scaleStatement: string;
  /** Names the region; a one-area scene shows that area, not a mosaic. */
  regionNote: (regionName: string | null, singleArea: string | null) => string;
  /** Link text from an embedded map to its full Atlas scene. */
  viewInAtlas: string;
  list: {
    heading: string;
    contextHeading: string;
    missingHeading: string;
    orientationHeading: string;
    water: string;
    places: string;
    highlighted: string;
    preview: string;
    unlinked: string;
    empty: string;
    /**
     * Summary of the folded list: counts only the areas inside the fold. `others` is true
     * when the highlighted area stays visible above the fold ("Toon de andere 8 gebieden").
     */
    showAreas: (count: number, others: boolean) => string;
    /** Summary when only orientation layers are folded, e.g. "Toon water en plaatsen". */
    showOrientation: (water: boolean, places: boolean) => string;
  };
  legend: {
    heading: string;
    area: { term: string; description: string };
    /** `pattern` describes the hatching; `patternForced` the dashed outline under forced colours. */
    context: { term: string; pattern: string; patternForced: string; description: string };
    water: { term: string; description: string };
    places: { term: string; description: string };
    overlap: string;
    /** Pointer-only instruction; hidden when scripting is unavailable. */
    overlapPointer: string;
    /** Shown only when something is missing; complete coverage needs no statement. */
    coverage: (shown: number, intended: number) => string;
    coverageNone: string;
    missingIntro: string;
    missingReason: Record<AtlasMissingReason, string>;
    moreMissing: (count: number) => string;
    creditsHeading: string;
    /** Follows the verbatim attribution: ", hergebruikt onder" + licence link. */
    creditLicence: string;
    creditIndependence: string;
    /** Plain-language simplification note; never prints the rung. 0 means source detail. */
    simplified: (pixels: number) => string;
    /** Shown when the build dropped sub-parts below display resolution; never names or counts them. */
    droppedParts: string;
    /** Summary of the embedded map's single disclosure: areas, legend, scale and credits. */
    aboutSummary: string;
  };
  unavailable: (name: string, reason: AtlasMissingReason | null) => string;
  controls: {
    zoomIn: string;
    zoomOut: string;
    reset: string;
    frame: string;
    /** Accessible name of the overlaid zoom and reset buttons. */
    controls: string;
    /** Keyboard help for the focused frame, read through aria-describedby. */
    keys: string;
    /** Transient hint after an unmodified wheel turn; {key} is Ctrl or ⌘. */
    wheelHint: string;
    /** Transient hint after a one-finger drag on a touch screen. */
    touchHint: string;
    chooserHeading: string;
    chooserIntro: string;
    /** Introduces the overarching areas on one line, e.g. "Ligt ook in: AOP Bordeaux · …". */
    chooserAlsoWithin: string;
    close: string;
  };
  /** Atlas route copy around the maps. */
  page: {
    /** Scene route intro: one sentence; the link to the owner follows as its own paragraph. */
    sceneIntro: (orientation: string | null) => string;
    draftSceneIntro: string;
    readAbout: (name: string) => string;
    /**
     * Computed per scene: "8 appellaties op de kaart" when complete, "37 van 38 appellaties op
     * de kaart" only when something is missing (the rule the legend follows).
     */
    coverageLine: (shown: number, intended: number) => string;
  };
  /** The Atlas portal at /atlas. Counts come from data, never from copy. */
  portal: {
    title: string;
    eyebrow: (preview: boolean) => string;
    intro: string;
    /** Computed scope, e.g. "Nu in de atlas: 7 regio's, 7 met een kaart." */
    scope: (regions: number, maps: number) => string;
    /** Status of the preview, said once in the intro; no promise of dates or regions. */
    previewNote: string;
    /** Page metadata. */
    metaTitle: string;
    metaDescription: string;
    /** Title of a section's own map card, e.g. "Kaart van Bordeaux". */
    leadMap: (name: string) => string;
    /** Title of a section's own card when it has no map, e.g. "Over Testland". */
    leadAbout: (name: string) => string;
    preparing: string;
    parentMap: (name: string) => string;
    textOnly: string;
    /** Plain data: passed to the client finder as props, so copy.ts stays out of its chunk. */
    finder: AtlasFinderCopy;
    /** Summary of the folded jump list over the sections. */
    jump: string;
    jumpLabel: string;
    emptyHeading: string;
    emptyBody: string;
    exploreRegions: string;
  };
}

const nl: AtlasCopy = {
  mapHeading: (ownerName) => (ownerName ? `Kaart van ${ownerName}` : "Kaart"),
  mapIntro: (ownerName, orientation) => {
    const layers = orientationLayers(orientation, "nl");
    return `Productiegebieden van appellaties${ownerName ? ` in ${ownerName}` : ""}${layers ? `, met ${layers} ter oriëntatie` : ""}.`;
  },
  scaleStatement:
    "Bedoeld voor regionale oriëntatie. De vlakken zijn voor weergave vereenvoudigd en zijn geen perceelsgrens of juridische afbakening; het officiële dossier van elke appellatie bevat de bindende begrenzing.",
  regionNote: (regionName, singleArea) =>
    `${regionName ?? "De regio"} heeft op deze kaart geen eigen omtrek: ${
      singleArea
        ? `je ziet het productiegebied van de appellatie ${singleArea}.`
        : "je ziet het mozaïek van appellatiegebieden dat erin ligt."
    }`,
  viewInAtlas: "Bekijk in de Atlas",
  list: {
    heading: "Appellatiegebieden op deze kaart",
    contextHeading: "Overkoepelend gebied",
    missingHeading: "Nog niet op de kaart",
    orientationHeading: "Ter oriëntatie",
    water: "Water",
    places: "Plaatsen",
    highlighted: "Uitgelicht op de kaart",
    preview: "Pagina in voorbereiding",
    unlinked: "Nog geen pagina",
    empty: "Deze kaart bevat nog geen appellatiegebieden.",
    showAreas: (count, others) =>
      others
        ? count === 1
          ? "Toon het andere gebied"
          : `Toon de andere ${count} gebieden`
        : count === 1
          ? "Toon het gebied"
          : `Toon alle ${count} gebieden`,
    showOrientation: (water, places) =>
      water && places ? "Toon water en plaatsen" : water ? "Toon water" : "Toon plaatsen",
  },
  legend: {
    heading: "Zo lees je de kaart",
    area: {
      term: "Productiegebied van een appellatie",
      description:
        "Het geografische gebied van de appellatie zoals INAO het in kaart brengt: de gemeenten, of delen van gemeenten, waar alle stappen van de wijnproductie moeten plaatsvinden, van de druivenoogst tot de vinificatie. Alleen druiven van de afgebakende percelen daarbinnen komen in aanmerking voor de appellatie; die percelen staan niet op de kaart.",
    },
    context: {
      term: "Overkoepelend gebied",
      pattern: "(gearceerd)",
      patternForced: "(gestippelde rand)",
      description:
        "Een groter productiegebied dat onder de getoonde appellaties doorloopt, zoals een regionale appellatie. De arcering houdt het herkenbaar als achtergrond.",
    },
    water: {
      term: "Water",
      description:
        "Rivieren als onderbroken lijn; estuaria en kust als vlak met golfpatroon. Ter oriëntatie.",
    },
    places: {
      term: "Plaatsen",
      description: "Steden en dorpen als herkenningspunt.",
    },
    overlap: "Appellatiegebieden kunnen elkaar overlappen.",
    overlapPointer:
      "Klik of tik op een overlap om te kiezen welk gebied je opent; de lijst noemt ze allemaal.",
    coverage: (shown, intended) =>
      intended === 1
        ? shown === 0
          ? "De appellatie van deze kaart is nog niet getekend."
          : "De appellatie van deze kaart is getekend."
        : `${shown} van de ${intended} appellaties van deze kaart ${shown === 1 ? "is" : "zijn"} getekend.`,
    coverageNone: "Voor deze kaart zijn nog geen appellatiegebieden aangewezen.",
    missingIntro: "Nog niet op de kaart:",
    missingReason: {
      held: "de kaartvorm wordt nog gecontroleerd",
      "no-record": "er is nog geen geverifieerde kaartvorm",
      unpublished: "de kaartvorm is nog niet vrijgegeven",
    },
    moreMissing: (count) => (count === 1 ? "1 ander gebied" : `${count} andere gebieden`),
    creditsHeading: "Kaartgegevens",
    creditLicence: "hergebruikt onder",
    creditIndependence:
      "Oenocademy gebruikt deze gegevens onafhankelijk; de uitgevers zijn niet bij deze site betrokken.",
    simplified: (pixels) =>
      pixels > 0
        ? "De vormen zijn voor weergave vereenvoudigd; wie ver inzoomt, ziet randen grover dan in de bron."
        : "De vormen zijn niet verder vereenvoudigd.",
    droppedParts:
      "Heel kleine delen, zoals losse snippers van een appellatiegebied, korte rivierstukken of eilandjes, zijn op deze schaal niet getekend.",
    aboutSummary: "Over deze kaart: gebieden, legenda en bron",
  },
  unavailable: (name, reason) =>
    reason
      ? `${name} staat nog niet op de kaart: ${nl.legend.missingReason[reason]}. De kaart toont de andere appellatiegebieden van de regio.`
      : `${name} staat nog niet op de kaart. De kaart toont de andere appellatiegebieden van de regio.`,
  controls: {
    zoomIn: "Inzoomen",
    zoomOut: "Uitzoomen",
    reset: "Herstel weergave",
    frame: "Interactieve kaart",
    controls: "Kaartbediening",
    keys: "Pijltjestoetsen verschuiven de kaart, + en − zoomen, 0 herstelt de weergave.",
    wheelHint: "Gebruik {key} + scrollen om te zoomen",
    touchHint: "Gebruik twee vingers om de kaart te bewegen",
    chooserHeading: "Meerdere gebieden op deze plek",
    chooserIntro: "Kies welk gebied je wilt openen.",
    chooserAlsoWithin: "Ligt ook in:",
    close: "Sluiten",
  },
  page: {
    sceneIntro: (orientation) =>
      `Deze kaart toont de geverifieerde appellatiegebieden van de regio${orientation ? ` met ${orientation} als oriëntatie` : ""}.`,
    draftSceneIntro:
      "De pagina over deze regio is nog in voorbereiding; de kaart is al te bekijken.",
    readAbout: (name) => `Lees over ${name}`,
    coverageLine: (shown, intended) =>
      shown === intended
        ? `${shown} ${shown === 1 ? "appellatie" : "appellaties"} op de kaart`
        : `${shown} van ${intended} ${intended === 1 ? "appellatie" : "appellaties"} op de kaart`,
  },
  portal: {
    title: "Wijnregio's op de kaart",
    eyebrow: (preview) => (preview ? "Atlas · voorvertoning" : "Atlas"),
    intro: "Kies een wijnregio en bekijk de appellaties op de kaart, of lees over de regio.",
    scope: (regions, maps) =>
      `Nu in de atlas: ${regions === 1 ? "1 regio" : `${regions} regio's`}, ${
        maps === regions && regions > 1
          ? "alle met een kaart"
          : maps === regions
            ? "met een kaart"
            : `${maps} met een kaart`
      }.`,
    previewNote:
      "De atlas is al vroeg te zien en groeit naarmate er meer geverifieerde kaartgegevens worden gepubliceerd.",
    metaTitle: "Wijnatlas",
    metaDescription:
      "Wijnregio's op de kaart: appellatiegebieden opgebouwd uit geverifieerde geografische data.",
    leadMap: (name) => `Kaart van ${name}`,
    leadAbout: (name) => `Over ${name}`,
    preparing: "Kaart in voorbereiding",
    parentMap: (name) => `Op de kaart van ${name}`,
    textOnly: "Nog geen kaart",
    finder: {
      label: "Zoek een regio of appellatie",
      submit: "Zoeken",
      foundOne: "1 regio gevonden",
      foundOther: "{count} regio's gevonden",
      shown: ", {shown} getoond",
      areaHit: "Met {area}",
      none: "Geen regio gevonden voor ‘{query}’.",
      searchAll: "Zoek ‘{query}’ in de hele kennisbank",
    },
    jump: "Ga naar…",
    jumpLabel: "Regio's in de atlas",
    emptyHeading: "Er zijn nog geen kaarten",
    emptyBody:
      "Kaarten verschijnen hier zodra hun geografische gegevens zijn geverifieerd en gepubliceerd.",
    exploreRegions: "Verken de regio's",
  },
};

const en: AtlasCopy = {
  mapHeading: (ownerName) => (ownerName ? `Map of ${ownerName}` : "Map"),
  mapIntro: (ownerName, orientation) => {
    const layers = orientationLayers(orientation, "en");
    return `Appellation production areas${ownerName ? ` in ${ownerName}` : ""}${layers ? `, with ${layers} for orientation` : ""}.`;
  },
  scaleStatement:
    "Meant for regional orientation. The areas are simplified for display and are not parcel boundaries or legal evidence; each appellation's official file holds the binding delimitation.",
  regionNote: (regionName, singleArea) =>
    `${regionName ?? "The region"} has no outline of its own on this map: ${
      singleArea
        ? `you see the production area of the ${singleArea} appellation.`
        : "you see the mosaic of appellation areas that lie within it."
    }`,
  viewInAtlas: "View in the Atlas",
  list: {
    heading: "Appellation areas on this map",
    contextHeading: "Overarching area",
    missingHeading: "Not yet on the map",
    orientationHeading: "For orientation",
    water: "Water",
    places: "Towns",
    highlighted: "Highlighted on the map",
    preview: "Page in preparation",
    unlinked: "No page yet",
    empty: "This map has no appellation areas yet.",
    showAreas: (count, others) =>
      others
        ? count === 1
          ? "Show the other area"
          : `Show the other ${count} areas`
        : count === 1
          ? "Show the area"
          : `Show all ${count} areas`,
    showOrientation: (water, places) =>
      water && places ? "Show water and towns" : water ? "Show water" : "Show towns",
  },
  legend: {
    heading: "How to read the map",
    area: {
      term: "Appellation production area",
      description:
        "The appellation's geographical area as INAO maps it: the communes, or parts of communes, where all stages of producing the wine must take place, from harvesting the grapes to making the wine. Only grapes from the delimited parcels within it qualify for the appellation; the map does not show those parcels.",
    },
    context: {
      term: "Overarching area",
      pattern: "(hatched)",
      patternForced: "(dashed outline)",
      description:
        "A larger production area that continues beneath the appellations shown, such as a regional appellation. The hatching keeps it recognisable as background.",
    },
    water: {
      term: "Water",
      description:
        "Rivers as a dashed line; estuaries and coast as a wave-patterned area. For orientation.",
    },
    places: {
      term: "Towns",
      description: "Towns and villages as landmarks.",
    },
    overlap: "Appellation areas can overlap.",
    overlapPointer:
      "Click or tap an overlap to choose which area to open; the list names them all.",
    coverage: (shown, intended) =>
      intended === 1
        ? shown === 0
          ? "This map's appellation is not drawn yet."
          : "This map's appellation is drawn."
        : `${shown} of this map's ${intended} appellations ${shown === 1 ? "is" : "are"} drawn.`,
    coverageNone: "No appellation areas have been assigned to this map yet.",
    missingIntro: "Not yet on the map:",
    missingReason: {
      held: "its map shape is still being checked",
      "no-record": "there is no verified map shape yet",
      unpublished: "its map shape has not been released yet",
    },
    moreMissing: (count) => (count === 1 ? "1 other area" : `${count} other areas`),
    creditsHeading: "Map data",
    creditLicence: "reused under",
    creditIndependence:
      "Oenocademy uses this data independently; the publishers are not involved with this site.",
    simplified: (pixels) =>
      pixels > 0
        ? "Shapes are simplified for display; zoomed in closely, edges are coarser than in the source."
        : "Shapes are not further simplified.",
    droppedParts:
      "Very small parts, such as detached slivers of an appellation area, short river stretches or islets, are not drawn at this scale.",
    aboutSummary: "About this map: areas, legend and source",
  },
  unavailable: (name, reason) =>
    reason
      ? `${name} is not on the map yet: ${en.legend.missingReason[reason]}. The map shows the region's other appellation areas.`
      : `${name} is not on the map yet. The map shows the region's other appellation areas.`,
  controls: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    frame: "Interactive map",
    controls: "Map controls",
    keys: "Arrow keys move the map, + and − zoom, 0 resets the view.",
    wheelHint: "Use {key} + scroll to zoom",
    touchHint: "Use two fingers to move the map",
    chooserHeading: "Several areas at this spot",
    chooserIntro: "Choose which area to open.",
    chooserAlsoWithin: "Also within:",
    close: "Close",
  },
  page: {
    sceneIntro: (orientation) =>
      `This map shows the region's verified appellation areas${orientation ? ` with ${orientation} for orientation` : ""}.`,
    draftSceneIntro:
      "The page about this region is still in preparation; the map can already be viewed.",
    readAbout: (name) => `Read about ${name}`,
    coverageLine: (shown, intended) =>
      shown === intended
        ? `${shown} ${shown === 1 ? "appellation" : "appellations"} on the map`
        : `${shown} of ${intended} ${intended === 1 ? "appellation" : "appellations"} on the map`,
  },
  portal: {
    title: "Wine regions on the map",
    eyebrow: (preview) => (preview ? "Atlas · preview" : "Atlas"),
    intro: "Choose a wine region to see its appellations on the map, or read about the region.",
    scope: (regions, maps) =>
      `In the atlas so far: ${regions === 1 ? "1 region" : `${regions} regions`}, ${
        maps === regions && regions > 1
          ? "all with a map"
          : maps === regions
            ? "with a map"
            : `${maps} with a map`
      }.`,
    previewNote: "The atlas is published early and grows as verified map data is added.",
    metaTitle: "Wine atlas",
    metaDescription:
      "Wine regions on the map: appellation areas built from verified geographic data.",
    leadMap: (name) => `Map of ${name}`,
    leadAbout: (name) => `About ${name}`,
    preparing: "Map in preparation",
    parentMap: (name) => `On the map of ${name}`,
    textOnly: "No map yet",
    finder: {
      label: "Find a region or appellation",
      submit: "Search",
      foundOne: "1 region found",
      foundOther: "{count} regions found",
      shown: ", {shown} shown",
      areaHit: "With {area}",
      none: "No region matches ‘{query}’.",
      searchAll: "Search the whole knowledge base for ‘{query}’",
    },
    jump: "Go to…",
    jumpLabel: "Regions in the atlas",
    emptyHeading: "There are no maps yet",
    emptyBody: "Maps appear here once their geographic data has been verified and published.",
    exploreRegions: "Explore the regions",
  },
};

export function atlasCopy(locale: Locale): AtlasCopy {
  return locale === "nl" ? nl : en;
}

/** Joins names the way a sentence does, in the reader's language. */
export function joinNames(names: string[], locale: Locale): string {
  if (names.length <= 1) return names.join("");
  const conjunction = locale === "nl" ? " en " : " and ";
  return `${names.slice(0, -1).join(", ")}${conjunction}${names[names.length - 1]}`;
}

export { compareAreaNames } from "./area-names";
