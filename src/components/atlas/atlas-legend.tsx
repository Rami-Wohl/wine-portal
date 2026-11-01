import type { AtlasCreditView, Locale } from "@/content/model";
import { atlasCopy, joinNames, type AtlasMissingReason } from "./copy";

export interface AtlasLegendCoverage {
  intended: number;
  shown: number;
  /** Localized names; null when an entity could not be resolved (never show its id). */
  missing: Array<{ name: string | null; reason: AtlasMissingReason }>;
}

export interface AtlasLegendExplanationProps {
  locale: Locale;
  idBase: string;
  /** One line per source; each carries its own edition in the verbatim attribution. */
  credits: AtlasCreditView[];
  /** Simplification rung as a viewBox pixel length; 0 means the shapes were not simplified. */
  simplificationPixels: number;
  /** True when the build dropped sub-parts below display resolution. */
  partsDropped: boolean;
  layers: { context: boolean; water: boolean; places: boolean; overlap: boolean };
  /** The owning region's name, and the area's name when the scene draws only one. */
  region: { name: string | null; singleArea: string | null };
}

export interface AtlasLegendProps extends AtlasLegendExplanationProps {
  headingLevel: 3 | 4;
  coverage: AtlasLegendCoverage;
}

function Swatch({
  kind,
  idBase,
}: {
  kind: "area" | "context" | "water" | "place";
  idBase: string;
}) {
  const patternId = `${idBase}-swatch-${kind}`;
  return (
    <svg aria-hidden="true" className={`atlas-swatch atlas-swatch-${kind}`} viewBox="0 0 24 24">
      {kind === "context" ? (
        <defs>
          <pattern
            height="6"
            id={patternId}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
            width="6"
          >
            <line className="atlas-hatch-line" x1="0" x2="0" y1="0" y2="6" />
          </pattern>
        </defs>
      ) : null}
      {kind === "water" ? (
        <defs>
          <pattern height="6" id={patternId} patternUnits="userSpaceOnUse" width="12">
            <rect className="atlas-water-base" height="6" width="12" />
            <path className="atlas-water-line" d="M0 3q3-2 6 0t6 0" />
          </pattern>
        </defs>
      ) : null}
      {kind === "place" ? (
        <circle className="atlas-swatch-place-dot" cx="12" cy="12" r="4.5" />
      ) : (
        <rect
          className="atlas-swatch-shape"
          fill={kind === "area" ? undefined : `url(#${patternId})`}
          height="18"
          rx="2"
          width="18"
          x="3"
          y="3"
        />
      )}
      {kind === "water" ? (
        // Rivers are dashed lines on the map; the swatch shows the same stroke.
        <line className="atlas-swatch-river" x1="4" x2="20" y1="20" y2="4" />
      ) : null}
    </svg>
  );
}

/** Complete coverage needs no statement: only a gap is news to the reader. */
export function coverageIsComplete(coverage: AtlasLegendCoverage): boolean {
  return (
    coverage.intended > 0 && coverage.missing.length === 0 && coverage.shown >= coverage.intended
  );
}

/**
 * The computed coverage statement, shown only when an intended area is missing or held (or
 * none was assigned); renders nothing for a complete map.
 */
export function AtlasCoverageNotice({
  coverage,
  locale,
}: {
  coverage: AtlasLegendCoverage;
  locale: Locale;
}) {
  if (coverageIsComplete(coverage)) return null;
  const copy = atlasCopy(locale);
  const named = coverage.missing.filter(
    (entry): entry is { name: string; reason: AtlasMissingReason } => entry.name !== null,
  );
  const unnamed = coverage.missing.length - named.length;
  const statement =
    coverage.intended === 0
      ? copy.legend.coverageNone
      : copy.legend.coverage(coverage.shown, coverage.intended);
  return (
    <div className="atlas-legend-coverage">
      <p>{statement}</p>
      {coverage.missing.length > 0 ? (
        <p className="atlas-legend-missing">
          {copy.legend.missingIntro}{" "}
          {joinNames(
            [
              ...named.map((entry) => `${entry.name} (${copy.legend.missingReason[entry.reason]})`),
              ...(unnamed > 0 ? [copy.legend.moreMissing(unnamed)] : []),
            ],
            locale,
          )}
          .
        </p>
      ) : null}
    </div>
  );
}

/**
 * Licence Ouverte 2.0 credits: one line per source with the record's verbatim attribution
 * (publisher, dataset, edition), linked to the dataset when it has a page, and the licence
 * link. Source-record titles carry pipeline terms and never appear as public copy.
 */
function Credits({
  credits,
  simplificationPixels,
  partsDropped,
  locale,
}: {
  credits: AtlasCreditView[];
  simplificationPixels: number;
  partsDropped: boolean;
  locale: Locale;
}) {
  const copy = atlasCopy(locale);
  return (
    <div className="atlas-legend-credits">
      {credits.length > 0 ? (
        <>
          <p className="atlas-legend-label">{copy.legend.creditsHeading}</p>
          <ul>
            {credits.map((credit) => {
              const text = credit.attribution.trim() || credit.publisher;
              return (
                <li className="atlas-legend-credit" key={credit.sourceId}>
                  {credit.url ? (
                    <a href={credit.url} rel="noopener">
                      {text}
                    </a>
                  ) : (
                    <span className="atlas-legend-dataset">{text}</span>
                  )}
                  , {copy.legend.creditLicence}{" "}
                  <a href={credit.licence.url} rel="license noopener">
                    {credit.licence.name}
                  </a>
                  .
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      <p className="atlas-legend-note">
        {copy.legend.simplified(simplificationPixels)}
        {partsDropped ? <> {copy.legend.droppedParts}</> : null}
        {credits.length > 0 ? <> {copy.legend.creditIndependence}</> : null}
      </p>
    </div>
  );
}

/**
 * The legend body: layer keys, the scale statement (said once per map, here), the region and
 * overlap notes and the credits, in plain language. Raw IDs, CRS codes, enums and pipeline
 * terms never appear.
 */
export function AtlasLegendExplanation({
  locale,
  idBase,
  credits,
  simplificationPixels,
  partsDropped,
  layers,
  region,
}: AtlasLegendExplanationProps) {
  const copy = atlasCopy(locale);
  const key = (
    <dl className="atlas-legend-keys">
      <div>
        <dt>
          <Swatch idBase={idBase} kind="area" />
          <span>{copy.legend.area.term}</span>
        </dt>
        <dd>{copy.legend.area.description}</dd>
      </div>
      {layers.context ? (
        <div>
          <dt>
            <Swatch idBase={idBase} kind="context" />
            <span>
              {copy.legend.context.term}{" "}
              {/* Forced colours drop the hatching; the map shows a dashed outline instead. */}
              <span className="atlas-pattern-note">{copy.legend.context.pattern}</span>
              <span className="atlas-pattern-note-forced">{copy.legend.context.patternForced}</span>
            </span>
          </dt>
          <dd>{copy.legend.context.description}</dd>
        </div>
      ) : null}
      {layers.water ? (
        <div>
          <dt>
            <Swatch idBase={idBase} kind="water" />
            <span>{copy.legend.water.term}</span>
          </dt>
          <dd>{copy.legend.water.description}</dd>
        </div>
      ) : null}
      {layers.places ? (
        <div>
          <dt>
            <Swatch idBase={idBase} kind="place" />
            <span>{copy.legend.places.term}</span>
          </dt>
          <dd>{copy.legend.places.description}</dd>
        </div>
      ) : null}
    </dl>
  );

  return (
    <>
      {key}
      <p className="atlas-legend-scale">
        {copy.scaleStatement} {copy.regionNote(region.name, region.singleArea)}
        {layers.overlap ? (
          <>
            {" "}
            {copy.legend.overlap}{" "}
            <span className="atlas-needs-script">{copy.legend.overlapPointer}</span>
          </>
        ) : null}
      </p>
      <Credits
        credits={credits}
        locale={locale}
        partsDropped={partsDropped}
        simplificationPixels={simplificationPixels}
      />
    </>
  );
}

/** The Atlas-page legend: a coverage notice when something is missing, then the legend section. */
export function AtlasLegend({ headingLevel, coverage, ...explanation }: AtlasLegendProps) {
  const copy = atlasCopy(explanation.locale);
  const Title = `h${headingLevel}` as const;
  const titleId = `${explanation.idBase}-legend-title`;
  return (
    <div className="atlas-legend">
      <AtlasCoverageNotice coverage={coverage} locale={explanation.locale} />
      <section aria-labelledby={titleId} className="atlas-legend-section">
        <Title className="atlas-legend-title" id={titleId}>
          {copy.legend.heading}
        </Title>
        <AtlasLegendExplanation {...explanation} />
      </section>
    </div>
  );
}
