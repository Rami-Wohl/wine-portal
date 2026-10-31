import type { AtlasFeatureView, AtlasLayerRole, AtlasSceneView, Locale } from "@/content/model";
import { getEntityById } from "@/content/repository";
import { contentLabels, entityHref } from "@/content/routing";
import type { CSSProperties } from "react";
import { AtlasFeatureList, type AtlasListArea } from "./atlas-feature-list";
import { AtlasLegend } from "./atlas-legend";
import { AtlasSceneEnhancer } from "./atlas-scene-enhancer";
import { atlasCopy } from "./copy";
import { labelVisibleAt, NO_SCRIPT_ZOOM, planLabels, type PlannedLabel } from "./labels";

export interface AtlasSceneProps {
  scene: AtlasSceneView;
  locale: Locale;
  /** Entity whose area is highlighted with a heavier outline and a label. */
  highlightedEntityId?: string;
  headingLevel?: 2 | 3;
  variant: "overview" | "embedded";
  /** Route of the full Atlas scene; embedded maps link to it. */
  sceneHref?: string;
}

interface ResolvedFeature {
  feature: AtlasFeatureView;
  role: AtlasLayerRole;
  name: string;
  href: string | null;
  state: AtlasListArea["state"];
  highlighted: boolean;
  typeLabel: string | null;
}

function resolveFeature(
  feature: AtlasFeatureView,
  role: AtlasLayerRole,
  locale: Locale,
  highlightedEntityId: string | undefined,
): ResolvedFeature {
  const name = feature.names[locale];
  const highlighted = Boolean(highlightedEntityId && feature.owner === highlightedEntityId);
  if (!feature.owner) {
    return { feature, role, name, href: null, state: "unlinked", highlighted, typeLabel: null };
  }
  const entity = getEntityById(feature.owner);
  if (!entity) {
    return { feature, role, name, href: null, state: "unlinked", highlighted, typeLabel: null };
  }
  const typeLabel =
    entity.type === "appellation" ? null : contentLabels(locale).entity[entity.type];
  // Readers are never sent to draft pages; the shape stays, the link waits.
  if (entity.status !== "active") {
    return { feature, role, name, href: null, state: "preview", highlighted, typeLabel };
  }
  return {
    feature,
    role,
    name,
    href: entityHref(entity, locale),
    state: "linked",
    highlighted,
    typeLabel,
  };
}

function toListArea(resolved: ResolvedFeature): AtlasListArea {
  return {
    id: resolved.feature.id,
    name: resolved.name,
    href: resolved.href,
    state: resolved.state,
    highlighted: resolved.highlighted,
    typeLabel: resolved.typeLabel,
  };
}

/**
 * Visibility attributes for a planned label: `data-visible` at the planning width
 * (the client rewrites it from the measured width), plus the no-JavaScript
 * answers for the narrow and medium breakpoints that responsive.css applies
 * before the enhancement has measured the map.
 */
function labelVisibility(label: PlannedLabel | undefined) {
  if (!label) {
    return {
      "data-min-zoom": "none",
      "data-visible": "false",
      "data-visible-medium": "false",
      "data-visible-narrow": "false",
    };
  }
  return {
    "data-max-zoom": label.maxZoom,
    "data-min-zoom": label.minZoom,
    "data-visible": String(labelVisibleAt(label, NO_SCRIPT_ZOOM.wide)),
    "data-visible-medium": String(labelVisibleAt(label, NO_SCRIPT_ZOOM.medium)),
    "data-visible-narrow": String(labelVisibleAt(label, NO_SCRIPT_ZOOM.narrow)),
  };
}

function FeatureShape({
  resolved,
  hatchId,
  waterId,
  placeLabel,
}: {
  resolved: ResolvedFeature;
  hatchId: string;
  waterId: string;
  /** For places: the effective zoom from which the town label is shown; undefined hides it. */
  placeLabel?: PlannedLabel;
}) {
  const { feature, role, name, href, highlighted } = resolved;
  if (feature.geometryType === "point") {
    if (!feature.point) return null;
    const [cx, cy] = feature.point;
    return (
      <g
        className="atlas-place"
        data-feature-id={feature.id}
        data-kind={feature.kind}
        data-role={role}
      >
        <title>{name}</title>
        <circle cx={cx} cy={cy} r="4" />
        <text aria-hidden="true" {...labelVisibility(placeLabel)} x={cx} y={cy}>
          {name}
        </text>
      </g>
    );
  }
  if (!feature.path) return null;
  const fill =
    role === "context"
      ? `url(#${hatchId})`
      : role === "water" && feature.geometryType === "area"
        ? `url(#${waterId})`
        : undefined;
  const path = (
    <path
      className={`atlas-feature atlas-feature-${feature.kind} atlas-geometry-${feature.geometryType}`}
      d={feature.path}
      data-feature-id={feature.id}
      data-highlighted={highlighted ? "true" : undefined}
      data-kind={feature.kind}
      data-role={role}
      fill={fill}
    >
      {href ? null : <title>{name}</title>}
    </path>
  );
  if (!href) return path;
  // Real links for pointer and no-JS use, but out of the tab order: the list is the
  // keyboard path and the map frame is the single tab stop for pan and zoom.
  return (
    <a
      aria-current={highlighted ? "page" : undefined}
      className="atlas-link"
      data-highlighted={highlighted ? "true" : undefined}
      href={href}
      tabIndex={-1}
    >
      <title>{name}</title>
      {path}
    </a>
  );
}

/**
 * Server-rendered map scene: one path per verified feature, SVG links for
 * selectable areas, a list alternative, a legend and client enhancement.
 * The component draws what the scene supplies and nothing else: no regional
 * outline, no filler shapes, no hand-typed coverage.
 */
export function AtlasScene({
  scene,
  locale,
  highlightedEntityId,
  headingLevel = 2,
  variant,
  sceneHref,
}: AtlasSceneProps) {
  const copy = atlasCopy(locale);
  const idBase = `atlas-${variant}-${scene.slug}`;
  const titleId = `${idBase}-title`;
  const introId = `${idBase}-intro`;
  const hatchId = `${idBase}-hatch`;
  const waterId = `${idBase}-water`;
  const Heading = `h${headingLevel}` as const;
  const subLevel = (headingLevel + 1) as 3 | 4;
  const owner = getEntityById(scene.owner);
  const ownerName = owner?.names[locale] ?? null;

  const layers = scene.layers.map((layer) => ({
    layer,
    features: layer.features.map((feature) =>
      resolveFeature(feature, layer.role, locale, highlightedEntityId),
    ),
  }));
  const byRole = (role: AtlasLayerRole) =>
    layers.filter(({ layer }) => layer.role === role).flatMap(({ features }) => features);
  const selectable = byRole("selectable");
  const context = byRole("context");
  const water = byRole("water");
  const places = byRole("places");

  const missing = scene.coverage.missing.map((entry) => ({
    name: getEntityById(entry.entity)?.names[locale] ?? null,
    reason: entry.reason,
  }));
  const highlightedFeature = [...selectable, ...context].find((item) => item.highlighted);
  const unavailableNotice = (() => {
    // A region owner is the mosaic itself and never has a shape of its own.
    if (!highlightedEntityId || highlightedFeature || highlightedEntityId === scene.owner)
      return null;
    const entity = getEntityById(highlightedEntityId);
    // Only appellations have areas; any region is drawn as its mosaic, never an outline.
    if (!entity || entity.type !== "appellation") return null;
    const gap = scene.coverage.missing.find((entry) => entry.entity === highlightedEntityId);
    return copy.unavailable(entity.names[locale], gap?.reason ?? null);
  })();

  const labelRole = new Map<string, AtlasLayerRole>();
  for (const item of [...selectable, ...context, ...water, ...places])
    labelRole.set(item.feature.id, item.role);
  const plan = planLabels(
    [...selectable, ...context, ...water, ...places].map((item) => item.feature),
    {
      locale,
      highlightedEntityId,
      viewWidth: scene.viewBox.width,
      viewHeight: scene.viewBox.height,
      roles: labelRole,
    },
  );
  const labels = plan.filter((label) => label.kind === "area");
  const placeLabels = new Map(
    plan.filter((label) => label.kind === "place").map((label) => [label.featureId, label]),
  );
  // Water is drawn above the area fills; the highlighted outline is repeated on top so
  // the estuary never hides it. Stroke only, inert and hidden from assistive technology.
  const highlightOutlines = [...selectable, ...context].filter(
    (item) => item.highlighted && item.feature.path,
  );
  const orientation = { water: water.length > 0, places: places.length > 0 };

  const { width, height } = scene.viewBox;
  const svgStyle = {
    "--atlas-base-width": width,
    "--atlas-base-height": height,
    "--atlas-view-width": width,
  } as CSSProperties;

  return (
    <figure
      aria-describedby={introId}
      aria-labelledby={titleId}
      className={`atlas-scene atlas-scene-${variant}`}
      data-atlas-scene={scene.id}
    >
      <div className="atlas-scene-heading">
        <Heading className="atlas-scene-title" id={titleId}>
          {copy.mapHeading(ownerName)}
        </Heading>
        <p className="atlas-scene-intro" id={introId}>
          {copy.mapIntro(ownerName, orientation)} {copy.scaleStatement}
        </p>
        {sceneHref ? (
          <p className="atlas-scene-link">
            <a href={sceneHref}>{copy.viewInAtlas}</a>
          </p>
        ) : null}
        {unavailableNotice ? (
          <p className="atlas-scene-notice" role="note">
            {unavailableNotice}
          </p>
        ) : null}
      </div>
      <div className="atlas-scene-body">
        <AtlasFeatureList
          areas={selectable.map(toListArea)}
          collapsible={variant === "embedded"}
          contextAreas={context.map(toListArea)}
          headingLevel={subLevel}
          idBase={idBase}
          locale={locale}
          missing={missing.flatMap((entry) =>
            entry.name ? [{ name: entry.name, reason: entry.reason }] : [],
          )}
          places={places.map((item) => item.name)}
          water={water.map((item) => item.name)}
        />
        <div className="atlas-map-panel">
          <AtlasSceneEnhancer idBase={idBase} labels={copy.controls} locale={locale}>
            <svg
              aria-labelledby={titleId}
              className="atlas-map"
              data-atlas-map={scene.id}
              preserveAspectRatio="xMidYMid meet"
              role="group"
              style={svgStyle}
              viewBox={`0 0 ${width} ${height}`}
            >
              <defs>
                <pattern
                  height="7"
                  id={hatchId}
                  patternTransform="rotate(45)"
                  patternUnits="userSpaceOnUse"
                  width="7"
                >
                  <line className="atlas-hatch-line" x1="0" x2="0" y1="0" y2="7" />
                </pattern>
                <pattern height="7" id={waterId} patternUnits="userSpaceOnUse" width="14">
                  <rect className="atlas-water-base" height="7" width="14" />
                  <path className="atlas-water-line" d="M0 3.5q3.5-2.4 7 0t7 0" />
                </pattern>
              </defs>
              {layers.map(({ layer, features }) => (
                <g
                  className={`atlas-layer atlas-layer-${layer.role}`}
                  data-layer={layer.id}
                  data-role={layer.role}
                  key={layer.id}
                >
                  {features.map((resolved) => (
                    <FeatureShape
                      hatchId={hatchId}
                      key={resolved.feature.id}
                      placeLabel={placeLabels.get(resolved.feature.id)}
                      resolved={resolved}
                      waterId={waterId}
                    />
                  ))}
                </g>
              ))}
              {highlightOutlines.length > 0 ? (
                <g aria-hidden="true" className="atlas-highlight-overlay">
                  {highlightOutlines.map((item) => (
                    <path
                      className="atlas-highlight-outline"
                      d={item.feature.path}
                      data-outline-for={item.feature.id}
                      key={item.feature.id}
                    />
                  ))}
                </g>
              ) : null}
              <g aria-hidden="true" className="atlas-labels">
                {labels.map((label) => (
                  <text
                    className={[
                      "atlas-label",
                      `atlas-label-${labelRole.get(label.featureId) ?? "selectable"}`,
                      label.highlighted ? "atlas-label-highlight" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    data-label-for={label.featureId}
                    data-shift={label.shift === 0 ? undefined : label.shift}
                    {...labelVisibility(label)}
                    key={label.featureId}
                    x={label.x}
                    y={label.y}
                  >
                    {label.text}
                  </text>
                ))}
              </g>
            </svg>
          </AtlasSceneEnhancer>
        </div>
      </div>
      <figcaption className="atlas-scene-caption">
        <AtlasLegend
          collapsible={variant === "embedded"}
          coverage={{
            intended: scene.coverage.intended.length,
            shown: scene.coverage.shown.length,
            missing,
          }}
          credits={scene.credits}
          headingLevel={subLevel}
          idBase={idBase}
          partsDropped={scene.simplification.droppedParts.length > 0}
          simplificationPixels={scene.simplification.pixels}
          layers={{
            context: context.length > 0,
            water: water.length > 0,
            places: places.length > 0,
            overlap: selectable.length > 1,
          }}
          locale={locale}
        />
      </figcaption>
    </figure>
  );
}
