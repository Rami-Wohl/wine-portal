"use client";

import { useEffect, useId, useRef } from "react";
import type { Candidate } from "./map-view";

export interface AtlasChooserLabels {
  heading: string;
  intro: string;
  /** Prefix for an overarching (context) area, e.g. "Overkoepelend gebied: Bordeaux". */
  context: string;
  close: string;
}

export interface AtlasChooserState {
  left: number;
  top: number;
  items: Candidate[];
}

/**
 * Small non-modal popover listing every area under a click so the reader
 * chooses instead of the map guessing. Focus moves to the first link on open;
 * the parent closes it on Escape, outside clicks and focus leaving.
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
      style={{ left: state.left, top: state.top }}
    >
      <p className="atlas-chooser-title" id={titleId}>
        {labels.heading}
      </p>
      <p className="atlas-chooser-intro">{labels.intro}</p>
      <ul>
        {state.items.map((item) => {
          const text = item.context ? `${labels.context}: ${item.name}` : item.name;
          return (
            <li className={item.context ? "atlas-chooser-context" : undefined} key={item.id}>
              {item.href ? <a href={item.href}>{text}</a> : <span>{text}</span>}
            </li>
          );
        })}
      </ul>
      <button className="atlas-chooser-close" onClick={onClose} type="button">
        {labels.close}
      </button>
    </div>
  );
}
