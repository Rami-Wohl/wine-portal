"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useRef } from "react";
import { chooserPlacement, type Candidate, type Point } from "./map-view";

/** Narrow frames show the chooser as a sheet along the frame's bottom edge. */
const SHEET_QUERY = "(max-width: 620px)";

export interface AtlasChooserLabels {
  heading: string;
  intro: string;
  /** Introduces the overarching areas on one line, e.g. "Ligt ook in:". */
  alsoWithin: string;
  close: string;
}

export interface AtlasChooserState {
  /** The click, in px from the frame's top-left corner. */
  click: Point;
  /** Ordered by orderCandidates: most specific first, overarching areas last. */
  items: Candidate[];
}

function CandidateLink({ item }: { item: Candidate }) {
  return item.href ? <a href={item.href}>{item.name}</a> : <span>{item.name}</span>;
}

/**
 * Small non-modal popover listing every area under a click so the reader
 * chooses instead of the map guessing. The most specific area comes first and
 * reads as the primary choice; overarching areas share one "also within" line.
 * Focus moves to the first link on open; the parent closes it on Escape,
 * outside clicks and focus leaving.
 */
export function AtlasChooser({
  state,
  labels,
  onClose,
}: {
  state: AtlasChooserState;
  labels: AtlasChooserLabels;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const specific = state.items.filter((item) => !item.context);
  const overarching = state.items.filter((item) => item.context);

  // Measure before paint and place the chooser inside the frame; written to the element
  // directly so the first paint is already in place.
  useLayoutEffect(() => {
    const element = ref.current;
    const frame = element?.offsetParent;
    if (!element || !(frame instanceof HTMLElement)) return;
    const sheet = typeof window.matchMedia === "function" && window.matchMedia(SHEET_QUERY).matches;
    element.dataset.sheet = sheet ? "true" : "false";
    if (sheet) {
      element.style.left = "";
      element.style.top = "";
      return;
    }
    const { left, top } = chooserPlacement(
      state.click,
      { width: element.offsetWidth, height: element.offsetHeight },
      { width: frame.clientWidth, height: frame.clientHeight },
    );
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }, [state]);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
  }, [state]);

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="false"
      className="atlas-chooser"
      ref={ref}
      role="dialog"
    >
      <p className="atlas-chooser-title" id={titleId}>
        {labels.heading}
      </p>
      <p className="atlas-chooser-intro">{labels.intro}</p>
      {/* Only the candidates scroll; the title and the close button stay in view. */}
      <div className="atlas-chooser-body">
        <ul>
          {specific.map((item, index) => (
            <li className={index === 0 ? "atlas-chooser-primary" : undefined} key={item.id}>
              <CandidateLink item={item} />
            </li>
          ))}
        </ul>
        {overarching.length > 0 ? (
          <p className="atlas-chooser-context">
            {labels.alsoWithin}{" "}
            {overarching.map((item, index) => (
              <Fragment key={item.id}>
                {index > 0 ? <span aria-hidden="true"> · </span> : null}
                <CandidateLink item={item} />
              </Fragment>
            ))}
          </p>
        ) : null}
      </div>
      <button className="atlas-chooser-close" onClick={onClose} type="button">
        {labels.close}
      </button>
    </div>
  );
}
