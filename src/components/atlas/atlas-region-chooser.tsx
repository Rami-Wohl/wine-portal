import type { Locale } from "@/content/model";
import type { AtlasThumbnail } from "@/content/model/geography";
import Link from "next/link";
import { atlasCopy } from "./copy";

export interface AtlasRegionCard {
  id: string;
  href: string;
  name: string;
  coverage: { shown: number; intended: number };
  thumbnail?: AtlasThumbnail;
}

/**
 * A scene's verified appellation areas in miniature, drawn from the build's thumbnail. It is
 * decorative (the card names the region), never a regional outline, and draws nothing when the
 * index has no thumbnail.
 */
export function AtlasThumbnailSvg({ thumbnail }: { thumbnail?: AtlasThumbnail }) {
  if (!thumbnail) return <span aria-hidden="true" className="atlas-region-thumb" />;
  const { width, height } = thumbnail.viewBox;
  return (
    <svg
      aria-hidden="true"
      className="atlas-region-thumb"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* The build clips areas just outside the viewBox; this inner viewport cuts them at its
      edge, so a letterboxed card never shows the clip line as if it were a boundary. */}
      <svg height={height} overflow="hidden" width={width} x="0" y="0">
        {thumbnail.paths.map((path, index) => (
          <path className="atlas-region-thumb-area" d={path} key={index} />
        ))}
      </svg>
    </svg>
  );
}

/** The Atlas overview's region chooser: one card per published scene, first on the page. */
export function AtlasRegionChooser({
  cards,
  locale,
}: {
  cards: AtlasRegionCard[];
  locale: Locale;
}) {
  const copy = atlasCopy(locale);
  return (
    <section aria-labelledby="atlas-regions-title" className="atlas-region-chooser">
      <div className="section-heading-compact">
        <p className="eyebrow">{copy.page.chooserEyebrow}</p>
        <h2 id="atlas-regions-title">{copy.page.chooserHeading}</h2>
      </div>
      <ul className="atlas-region-grid">
        {cards.map((card) => (
          <li key={card.id}>
            <Link className="atlas-region-card" href={card.href}>
              <AtlasThumbnailSvg thumbnail={card.thumbnail} />
              <strong className="atlas-region-name">{card.name}</strong>
              <span className="atlas-region-coverage">
                {copy.page.coverageLine(card.coverage.shown, card.coverage.intended)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
