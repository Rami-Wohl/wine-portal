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
   * Embedded scenes keep the highlighted area visible and fold the rest into a
   * native disclosure, closed by default at every width; it expands without
   * JavaScript. Atlas pages render the full list open.
   */
  collapsible: boolean;
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
 * Semantic alternative to the map: every selectable area with its link and
 * state, the orientation layers as text, and the coverage gaps with a reason.
 * It precedes the map in DOM order so narrow screens read it first.
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
  collapsible,
}: AtlasFeatureListProps) {
  const copy = atlasCopy(locale);
  const Title = `h${headingLevel}` as const;
  const GroupTitle = `h${Math.min(headingLevel + 1, 6)}` as "h4" | "h5";
  const titleId = `${idBase}-list-title`;
  const hasOrientation = water.length > 0 || places.length > 0;
  // The highlighted entity may be an overarching area (e.g. the Bordeaux appellation page).
  const current = collapsible
    ? [...areas, ...contextAreas].find((area) => area.highlighted)
    : undefined;
  const listed = sortAreas(
    areas.filter((area) => area !== current),
    locale,
  );
  const listedContext = sortAreas(
    contextAreas.filter((area) => area !== current),
    locale,
  );
  const foldedAreas = listed.length + listedContext.length;
  const summary =
    foldedAreas > 0
      ? copy.list.showAreas(foldedAreas, Boolean(current))
      : hasOrientation
        ? copy.list.showOrientation(water.length > 0, places.length > 0)
        : null;

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
      {collapsible && summary ? (
        <details className="atlas-list-disclosure">
          <summary>{summary}</summary>
          <div className="atlas-list-disclosure-body">{body}</div>
        </details>
      ) : collapsible && current && missing.length === 0 ? null : (
        body
      )}
    </section>
  );
}
