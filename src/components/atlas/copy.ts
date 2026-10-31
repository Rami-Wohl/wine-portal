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

/** Public map copy. Human, localized, honest about scale, source, date and gaps. */
export interface AtlasCopy {
  mapHeading: (ownerName: string | null) => string;
  /** Names only the orientation layers the scene actually draws. */
  mapIntro: (ownerName: string | null, orientation: AtlasOrientation) => string;
  scaleStatement: string;
  regionNote: string;
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
    coverage: (shown: number, intended: number) => string;
    coverageComplete: (count: number) => string;
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
    aboutSummary: string;
  };
  unavailable: (name: string, reason: AtlasMissingReason | null) => string;
  controls: {
    /** Fixed toggle label; its state is carried by aria-pressed. */
    activate: string;
    idleStatus: string;
    activeStatus: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
    /** Template; the client replaces {zoom} with the formatted factor. */
    zoomLevel: string;
    frame: string;
    toolbar: string;
    chooserHeading: string;
    chooserIntro: string;
    /** Prefix for an overarching (context) area in the chooser, e.g. "Overkoepelend gebied: Bordeaux". */
    chooserContext: string;
    close: string;
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
  regionNote:
    "De regio zelf heeft op deze kaart geen eigen omtrek: je ziet het mozaïek van appellatiegebieden dat erin ligt.",
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
    coverageComplete: (count) =>
      count === 1
        ? "De appellatie van deze kaart is getekend."
        : count === 2
          ? "Beide appellaties van deze kaart zijn getekend."
          : `Alle ${count} appellaties van deze kaart zijn getekend.`,
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
    aboutSummary: "Over deze kaart: legenda, bron en dekking",
  },
  unavailable: (name, reason) =>
    reason
      ? `${name} staat nog niet op de kaart: ${nl.legend.missingReason[reason]}. De kaart toont de andere appellatiegebieden van de regio.`
      : `${name} staat nog niet op de kaart. De kaart toont de andere appellatiegebieden van de regio.`,
  controls: {
    activate: "Kaart bedienen",
    idleStatus:
      "Klik op een gebied om het te openen, of activeer de kaart om te zoomen en te verschuiven.",
    activeStatus:
      "Kaart actief: scroll of knijp om te zoomen, sleep of gebruik de pijltjestoetsen om te verschuiven, + en − zoomen, 0 herstelt, Esc laat los.",
    zoomIn: "Inzoomen",
    zoomOut: "Uitzoomen",
    reset: "Beginstand",
    zoomLevel: "Zoom {zoom}×",
    frame: "Interactieve kaart",
    toolbar: "Kaartbediening",
    chooserHeading: "Meerdere gebieden op deze plek",
    chooserIntro: "Kies welk gebied je wilt openen.",
    chooserContext: "Overkoepelend gebied",
    close: "Sluiten",
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
  regionNote:
    "The region itself has no outline on this map: you see the mosaic of appellation areas that lie within it.",
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
    coverageComplete: (count) =>
      count === 1
        ? "This map's appellation is drawn."
        : count === 2
          ? "Both of this map's appellations are drawn."
          : `All ${count} of this map's appellations are drawn.`,
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
    aboutSummary: "About this map: legend, source and coverage",
  },
  unavailable: (name, reason) =>
    reason
      ? `${name} is not on the map yet: ${en.legend.missingReason[reason]}. The map shows the region's other appellation areas.`
      : `${name} is not on the map yet. The map shows the region's other appellation areas.`,
  controls: {
    activate: "Use the map",
    idleStatus: "Click an area to open it, or activate the map to zoom and pan.",
    activeStatus:
      "Map active: scroll or pinch to zoom, drag or use the arrow keys to pan, + and − zoom, 0 resets, Esc releases.",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    zoomLevel: "Zoom {zoom}×",
    frame: "Interactive map",
    toolbar: "Map controls",
    chooserHeading: "Several areas at this spot",
    chooserIntro: "Choose which area to open.",
    chooserContext: "Overarching area",
    close: "Close",
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

/**
 * Alphabetical order of area names for readers: per language, ignoring a leading
 * "AOP "/"AOC " so "AOP Médoc" sorts under M.
 */
export function compareAreaNames(locale: Locale) {
  const collator = new Intl.Collator(locale === "nl" ? "nl-NL" : "en-GB");
  const key = (name: string) => name.replace(/^(AOP|AOC)\s+/i, "");
  return (left: string, right: string) => collator.compare(key(left), key(right));
}
