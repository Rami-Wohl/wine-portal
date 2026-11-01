import type { AtlasPortal, AtlasPortalNode, Locale } from "@/content/model";
import type { AtlasThumbnail } from "@/content/model/geography";
import Link from "next/link";
import type { ReactNode } from "react";
import { AtlasPortalFinder } from "./atlas-portal-finder";
import { atlasCopy } from "./copy";
import { portalMatchValue } from "./portal-match";

/**
 * Shown when no region has a map yet. The regions themselves are still listed below it when
 * there are any; only without regions does it point to Explore.
 */
export function AtlasPortalEmpty({
  locale,
  exploreHref,
}: {
  locale: Locale;
  /** Link to the regions in Explore; omitted when the portal still lists regions. */
  exploreHref?: string;
}) {
  const copy = atlasCopy(locale).portal;
  return (
    <section aria-labelledby="atlas-empty-title" className="empty-state atlas-portal-empty">
      <h2 id="atlas-empty-title">{copy.emptyHeading}</h2>
      <p>{copy.emptyBody}</p>
      {exploreHref ? (
        <p>
          <Link className="text-link" href={exploreHref}>
            {copy.exploreRegions}
          </Link>
        </p>
      ) : null}
    </section>
  );
}

/** Sections from which the folded jump list is worth its tab stop. */
export const PORTAL_JUMP_MIN_SECTIONS = 4;

/**
 * A scene's verified appellation areas in miniature, drawn from the build's thumbnail. It is
 * decorative (the card names the region), never a regional outline.
 */
export function AtlasThumbnailSvg({ thumbnail }: { thumbnail: AtlasThumbnail }) {
  const { width, height } = thumbnail.viewBox;
  return (
    <svg
      aria-hidden="true"
      className="atlas-portal-thumb"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* The build clips areas just outside the viewBox; this inner viewport cuts them at its
      edge, so a letterboxed card never shows the clip line as if it were a boundary. */}
      <svg height={height} overflow="hidden" width={width} x="0" y="0">
        {thumbnail.paths.map((path, index) => (
          <path className="atlas-portal-thumb-area" d={path} key={index} />
        ))}
      </svg>
    </svg>
  );
}

function domId(id: string): string {
  return `atlas-portal-${id.replace(/[^a-z0-9-]+/gi, "-")}`;
}

/** Keeps hyphenated proper names such as Entre-deux-Mers whole; spaces still wrap. */
function ProperName({ name }: { name: string }) {
  if (!name.includes("-")) return name;
  return name.split(" ").flatMap((word, index) => [
    index > 0 ? " " : null,
    word.includes("-") ? (
      <span className="atlas-portal-nobreak" key={index}>
        {word}
      </span>
    ) : (
      word
    ),
  ]);
}

function stateText(node: AtlasPortalNode, locale: Locale): string {
  const copy = atlasCopy(locale);
  switch (node.state.kind) {
    case "map":
      return copy.page.coverageLine(node.state.shown, node.state.intended);
    case "preparing":
      return copy.portal.preparing;
    case "parent-map":
      return copy.portal.parentMap(node.state.parentName);
    case "text":
      return copy.portal.textOnly;
  }
}

/**
 * Attributes the finder reads: every node is filterable by its own names (normalised) and by
 * the appellations its map draws (as published, so the finder can say which one matched).
 */
function nodeData(node: AtlasPortalNode) {
  return {
    "data-portal-node": "",
    "data-match": portalMatchValue(node.matchNames),
    ...(node.areaNames.length > 0 ? { "data-areas": node.areaNames.join("\n") } : {}),
  };
}

/** Filled by the finder with the appellation that matched ("Met Pauillac"); empty otherwise. */
function AreaHit() {
  return <span className="atlas-portal-area-hit" data-area-hit="" />;
}

/** Deeper levels: a link per node in reading order, with its state as a separate phrase. */
function SubList({ nodes, locale }: { nodes: AtlasPortalNode[]; locale: Locale }) {
  if (nodes.length === 0) return null;
  return (
    <ul className="atlas-portal-sub">
      {nodes.map((node) => {
        const stateId = `${domId(node.id)}-state`;
        return (
          <li key={node.id} {...nodeData(node)}>
            <Link aria-describedby={stateId} data-portal-entry="" href={node.href}>
              <ProperName name={node.name} />
            </Link>
            <span className="atlas-portal-state" id={stateId}>
              {stateText(node, locale)}
              <AreaHit />
            </span>
            <SubList locale={locale} nodes={node.children} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One region: thumbnail when it has a map, its name as the one link, its state, its children.
 * A card without a map has no thumbnail row at all. A lead card may add one secondary link to
 * the region's page (`aboutHref`), above the card-wide link like the inner links.
 */
function Card({
  node,
  locale,
  title,
  lead = false,
  aboutHref,
  children,
}: {
  node: AtlasPortalNode;
  locale: Locale;
  title: ReactNode;
  lead?: boolean;
  aboutHref?: string;
  children?: ReactNode;
}) {
  const stateId = `${domId(node.id)}-state${lead ? "-lead" : ""}`;
  const thumbnail = node.state.kind === "map" ? node.state.thumbnail : undefined;
  const classes = [
    "atlas-portal-card",
    lead ? "atlas-portal-card-lead" : null,
    thumbnail ? null : "atlas-portal-card-text",
  ].filter(Boolean);
  return (
    <div className={classes.join(" ")}>
      {thumbnail ? <AtlasThumbnailSvg thumbnail={thumbnail} /> : null}
      <h3 className="atlas-portal-card-title">
        <Link
          aria-describedby={stateId}
          className="atlas-portal-link"
          data-portal-entry=""
          href={node.href}
        >
          {title}
        </Link>
      </h3>
      <p className="atlas-portal-state" id={stateId}>
        {stateText(node, locale)}
        <AreaHit />
      </p>
      {aboutHref ? (
        <p className="atlas-portal-about">
          <Link href={aboutHref}>{atlasCopy(locale).page.readAbout(node.name)}</Link>
        </p>
      ) : null}
      {children}
    </div>
  );
}

/**
 * The Atlas portal (docs/atlas-plan.md §9): top-level nodes are sections, their children cards,
 * deeper levels links inside the card. Each region has exactly one entry. A section's own entry
 * is its lead card: the section map when it has one, otherwise its page. `locator` is the seam
 * for a world locator built from verified, sourced geography; nothing is drawn without it.
 */
export function AtlasPortalView({
  portal,
  locale,
  searchAction,
  locator,
}: {
  portal: AtlasPortal;
  locale: Locale;
  searchAction: string;
  locator?: ReactNode;
}) {
  const copy = atlasCopy(locale).portal;
  const portalId = "atlas-portal";
  return (
    <div className="atlas-portal" id={portalId}>
      <AtlasPortalFinder copy={copy.finder} portalId={portalId} searchAction={searchAction} />
      {locator ?? null}
      {portal.sections.length >= PORTAL_JUMP_MIN_SECTIONS ? (
        <details className="atlas-portal-jump">
          <summary>{copy.jump}</summary>
          <nav aria-label={copy.jumpLabel}>
            <ul>
              {portal.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${domId(section.id)}`}>{section.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      ) : null}
      {portal.sections.map((section) => {
        const headingId = `${domId(section.id)}-title`;
        const childless = section.children.length === 0;
        return (
          <section
            aria-labelledby={headingId}
            className={`atlas-portal-section${childless ? " atlas-portal-section-compact" : ""}`}
            id={domId(section.id)}
            key={section.id}
            {...nodeData(section)}
          >
            <h2 className="atlas-portal-section-title" id={headingId}>
              <ProperName name={section.name} />
            </h2>
            <div className="atlas-portal-section-body">
              <Card
                aboutHref={section.pageHref}
                lead
                locale={locale}
                node={section}
                title={
                  <ProperName
                    name={
                      section.state.kind === "map"
                        ? copy.leadMap(section.name)
                        : copy.leadAbout(section.name)
                    }
                  />
                }
              />
              {childless ? null : (
                <ul className="atlas-portal-grid">
                  {section.children.map((child) => (
                    <li key={child.id} {...nodeData(child)}>
                      <Card locale={locale} node={child} title={<ProperName name={child.name} />}>
                        <SubList locale={locale} nodes={child.children} />
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
