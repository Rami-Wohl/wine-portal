import type { Locale } from "@/content/model";
import { atlasCopy, compareAreaNames, type AtlasMissingReason } from "./copy";

export type AtlasAreaLinkState = "linked" | "preview" | "unlinked";

export interface AtlasListArea {
  id: string;
  name: string;
  href: string | null;
  state: AtlasAreaLinkState;
  highlighted: boolean;
  typeLabel: string | null;
  /** True when the area belongs to the scene's computed coverage (intended and shown). */
  inCoverage: boolean;
}

export interface AtlasMissingEntry {
  name: string;
  reason: AtlasMissingReason;
}

export interface AtlasFeatureListProps {
  locale: Locale;
  idBase: string;
  /** Heading level of the list title; group titles sit one level deeper. */
  headingLevel: 3 | 4;
  areas: AtlasListArea[];
  contextAreas: AtlasListArea[];
  water: string[];
  places: string[];
  missing: AtlasMissingEntry[];
  /**
   * `folded`: the highlighted area stays visible and the rest folds into a native
   * disclosure, closed in the server markup, that expands without JavaScript. With
   * `openWhenWide` the enhancer opens it on wide screens, where it sits beside the map.
   * `flat`: everything listed, highlighted area first; used inside the embedded map's
   * single "about" disclosure, which already folds it.
   */
  mode: "folded" | "flat";
  openWhenWide?: boolean;
}

function AreaItems({
  areas,
  locale,
  className = "atlas-area-list",
}: {
  areas: AtlasListArea[];
  locale: Locale;
  className?: string;
}) {
  const copy = atlasCopy(locale);
  return (
    <ul className={className}>
      {areas.map((area) => (
        <li
          className={area.highlighted ? "atlas-area-item is-highlighted" : "atlas-area-item"}
          data-feature-id={area.id}
          key={area.id}
        >
          {area.href ? (
            <a
              aria-current={area.highlighted ? "page" : undefined}
              className="atlas-area-link"
              href={area.href}
            >
              {area.name}
            </a>
          ) : (
            <span className="atlas-area-link atlas-area-link-static">{area.name}</span>
          )}
          {area.typeLabel ? <small className="atlas-area-type">{area.typeLabel}</small> : null}
          {area.highlighted ? (
            <span className="atlas-area-state">{copy.list.highlighted}</span>
          ) : null}
          {area.state === "preview" ? (
            <span className="atlas-area-state">{copy.list.preview}</span>
          ) : null}
          {area.state === "unlinked" ? (
            <span className="atlas-area-state">{copy.list.unlinked}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Alphabetical per language: the list is the keyboard path, not the map's draw order. */
export function sortAreas<T extends { name: string }>(areas: T[], locale: Locale): T[] {
  const compare = compareAreaNames(locale);
  return [...areas].sort((left, right) => compare(left.name, right.name));
}

/**
 * The fold summary counts the folded areas that belong to the map's computed coverage, drawn as
 * selectable or overarching, so it agrees with the coverage count ("8 van 8" on Médoc, "37 van
 * 38" on Bordeaux). An overarching area outside the coverage (AOP Bordeaux on Médoc) is listed
 * under its own heading but not counted. A list with no covered area falls back to every area.
 */
export function foldSummary(
  locale: Locale,
  folded: { areas: number; inCoverage: number; water: boolean; places: boolean },
  others: boolean,
): string | null {
  const copy = atlasCopy(locale);
  const count = folded.inCoverage > 0 ? folded.inCoverage : folded.areas;
  if (count > 0) return copy.list.showAreas(count, others);
  if (folded.water || folded.places) return copy.list.showOrientation(folded.water, folded.places);
  return null;
}

/**
 * Semantic alternative to the map: every selectable area with its link and
 * state, the orientation layers as text, and the coverage gaps with a reason.
 * On Atlas pages it precedes the map in DOM order, folded on narrow screens.
 */
export function AtlasFeatureList({
  locale,
  idBase,
  headingLevel,
  areas,
  contextAreas,
  water,
  places,
  missing,
  mode,
  openWhenWide = false,
}: AtlasFeatureListProps) {
  const copy = atlasCopy(locale);
  const Title = `h${headingLevel}` as const;
  const GroupTitle = `h${Math.min(headingLevel + 1, 6)}` as "h4" | "h5";
  const titleId = `${idBase}-list-title`;
  const hasOrientation = water.length > 0 || places.length > 0;
  // The highlighted entity may be an overarching area (e.g. the Bordeaux appellation page).
  const current = [...areas, ...contextAreas].find((area) => area.highlighted);
  const listed = sortAreas(
    areas.filter((area) => area !== current),
    locale,
  );
  const listedContext = sortAreas(
    contextAreas.filter((area) => area !== current),
    locale,
  );
  const summary = foldSummary(
    locale,
    {
      areas: listed.length + listedContext.length,
      inCoverage: [...listed, ...listedContext].filter((area) => area.inCoverage).length,
      water: water.length > 0,
      places: places.length > 0,
    },
    Boolean(current),
  );

  const body = (
    <>
      {listed.length > 0 ? (
        <AreaItems areas={listed} locale={locale} />
      ) : areas.length === 0 ? (
        <p className="atlas-list-empty">{copy.list.empty}</p>
      ) : null}
      {missing.length > 0 ? (
        <div className="atlas-list-group">
          <GroupTitle className="atlas-list-group-title">{copy.list.missingHeading}</GroupTitle>
          <ul className="atlas-missing-list">
            {missing.map((entry) => (
              <li key={`${entry.name}-${entry.reason}`}>
                <span className="atlas-missing-name">{entry.name}</span>
                <span className="atlas-missing-reason">
                  {" "}
                  — {copy.legend.missingReason[entry.reason]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {listedContext.length > 0 ? (
        <div className="atlas-list-group">
          <GroupTitle className="atlas-list-group-title">{copy.list.contextHeading}</GroupTitle>
          <AreaItems areas={listedContext} locale={locale} />
        </div>
      ) : null}
      {hasOrientation ? (
        <div className="atlas-list-group">
          <GroupTitle className="atlas-list-group-title">{copy.list.orientationHeading}</GroupTitle>
          <dl className="atlas-orientation">
            {water.length > 0 ? (
              <div>
                <dt>{copy.list.water}</dt>
                <dd>{water.join(", ")}</dd>
              </div>
            ) : null}
            {places.length > 0 ? (
              <div>
                <dt>{copy.list.places}</dt>
                <dd>{places.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </>
  );

  return (
    <section aria-labelledby={titleId} className="atlas-feature-list">
      <Title className="atlas-list-title" id={titleId}>
        {copy.list.heading}
      </Title>
      {current ? (
        <AreaItems
          areas={[current]}
          className="atlas-area-list atlas-area-list-current"
          locale={locale}
        />
      ) : null}
      {mode === "folded" && summary ? (
        <details className="atlas-list-disclosure" data-atlas-wide-open={openWhenWide || undefined}>
          <summary>{summary}</summary>
          <div className="atlas-list-disclosure-body">{body}</div>
        </details>
      ) : mode === "folded" && current && missing.length === 0 ? null : (
        body
      )}
    </section>
  );
}
