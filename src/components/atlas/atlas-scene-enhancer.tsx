"use client";

import type { Locale } from "@/content/model";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { AtlasChooser, type AtlasChooserState } from "./atlas-chooser";
import {
  chooserPosition,
  exceedsDragThreshold,
  isModifiedClick,
  orderCandidates,
  pinchView,
  shouldOpenChooser,
  wheelZoomFactor,
  ZOOM_STEP,
  type Candidate,
  type Point,
  type View,
} from "./map-view";
import { useAtlasView } from "./use-atlas-view";

/** Strings only: this object crosses the server/client boundary. */
export interface AtlasEnhancerLabels {
  frame: string;
  toolbar: string;
  activate: string;
  idleStatus: string;
  activeStatus: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  zoomLevel: string;
  chooserHeading: string;
  chooserIntro: string;
  chooserContext: string;
  close: string;
}

interface Gesture {
  moved: boolean;
  startView: View;
  pinch: { midUnits: [number, number]; distance: number } | null;
}

function escapeSelector(value: string) {
  return typeof CSS !== "undefined" && "escape" in CSS
    ? CSS.escape(value)
    : value.replace(/"/g, "");
}

function insideChooser(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(".atlas-chooser"));
}

/**
 * Progressive enhancement around the server-rendered map: pan, zoom, reset,
 * hover and focus highlighting, and an overlap chooser. Wheel, drag and pinch
 * act only once the reader engages the map (toolbar button, a click on empty
 * map space, or keyboard focus on the frame itself), so page scrolling and
 * link focus are never hijacked.
 */
export function AtlasSceneEnhancer({
  children,
  labels,
  locale,
  idBase,
}: {
  children: ReactNode;
  labels: AtlasEnhancerLabels;
  locale: Locale;
  idBase: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const view = useAtlasView(frameRef);
  const { svgRef, baseRef, viewRef, measure, applyView, pointToUnits, zoomBy, panBy, reset } = view;
  const engagedRef = useRef(false);
  const skipEngageOnFocusRef = useRef(false);
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const [engaged, setEngagedState] = useState(false);
  const [chooser, setChooser] = useState<AtlasChooserState | null>(null);
  const statusId = `${idBase}-map-status`;

  const setEngaged = useCallback((next: boolean) => {
    engagedRef.current = next;
    setEngagedState(next);
  }, []);

  const closeChooser = useCallback((returnFocus: boolean) => {
    setChooser(null);
    if (returnFocus) {
      // Returning focus is a courtesy, not an engagement: the page keeps scrolling.
      skipEngageOnFocusRef.current = true;
      frameRef.current?.focus({ preventScroll: true });
      skipEngageOnFocusRef.current = false;
    }
  }, []);

  // Wheel zoom needs a non-passive listener, attached only while engaged.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !engaged) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      zoomBy(
        wheelZoomFactor(event.deltaY, event.deltaMode),
        pointToUnits(event.clientX, event.clientY),
      );
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [engaged, pointToUnits, zoomBy]);

  // Hover and focus on either the map or the list highlight the same feature in both.
  useEffect(() => {
    const figure = rootRef.current?.closest<HTMLElement>("[data-atlas-scene]");
    if (!figure) return;
    const toggle = (event: Event, active: boolean) => {
      const target = event.target as Element | null;
      const id = target?.closest?.("[data-feature-id]")?.getAttribute("data-feature-id");
      if (!id) return;
      figure
        .querySelectorAll(`[data-feature-id="${escapeSelector(id)}"]`)
        .forEach((element) => element.classList.toggle("is-active", active));
    };
    const over = (event: Event) => toggle(event, true);
    const out = (event: Event) => toggle(event, false);
    figure.addEventListener("pointerover", over);
    figure.addEventListener("pointerout", out);
    figure.addEventListener("focusin", over);
    figure.addEventListener("focusout", out);
    return () => {
      figure.removeEventListener("pointerover", over);
      figure.removeEventListener("pointerout", out);
      figure.removeEventListener("focusin", over);
      figure.removeEventListener("focusout", out);
    };
  }, []);

  // Printing shows the folded list and legend: open every disclosure, restore afterwards.
  useEffect(() => {
    const figure = rootRef.current?.closest<HTMLElement>("[data-atlas-scene]");
    if (!figure) return;
    let reopened: HTMLDetailsElement[] = [];
    const before = () => {
      reopened = Array.from(figure.querySelectorAll<HTMLDetailsElement>("details:not([open])"));
      reopened.forEach((details) => (details.open = true));
    };
    const after = () => {
      reopened.forEach((details) => (details.open = false));
      reopened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const collectCandidates = (clientX: number, clientY: number): Candidate[] => {
    const svg = svgRef.current;
    if (!svg || typeof document.elementsFromPoint !== "function") return [];
    const items: Candidate[] = [];
    for (const element of document.elementsFromPoint(clientX, clientY)) {
      if (!(element instanceof SVGPathElement) || !svg.contains(element)) continue;
      const role = element.getAttribute("data-role");
      if (role !== "selectable" && role !== "context") continue;
      const id = element.getAttribute("data-feature-id");
      const link = element.closest("a");
      const name = (link ?? element).querySelector("title")?.textContent?.trim();
      if (!id || !name) continue;
      items.push({
        id,
        name,
        href: link?.getAttribute("href") ?? null,
        context: role === "context",
      });
    }
    return orderCandidates(items, locale);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    if (chooser && !insideChooser(event.target)) closeChooser(false);
    if (!engagedRef.current || event.button !== 0 || insideChooser(event.target)) return;
    const current = viewRef.current;
    if (!current) return;
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointers.values());
    if (points.length >= 2) {
      // Capture only once a pinch starts; a drag captures when it passes the threshold.
      // Capturing on every press would retarget the click and break the SVG links.
      for (const id of pointers.keys()) frameRef.current?.setPointerCapture(id);
      const [a, b] = points;
      const midUnits = pointToUnits((a.x + b.x) / 2, (a.y + b.y) / 2);
      gestureRef.current = {
        moved: false,
        startView: current,
        pinch: midUnits ? { midUnits, distance: Math.hypot(a.x - b.x, a.y - b.y) } : null,
      };
      return;
    }
    gestureRef.current = { moved: false, startView: current, pinch: null };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    const gesture = gestureRef.current;
    const start = pointers.get(event.pointerId);
    if (!gesture || !start) return;
    const metrics = measure();
    const base = baseRef.current;
    if (!metrics || !base) return;
    if (pointers.size >= 2 && gesture.pinch) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const [a, b] = Array.from(pointers.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (Math.abs(distance - gesture.pinch.distance) >= 4) gesture.moved = true;
      const box = { width: metrics.rect.width, height: metrics.rect.height };
      const local = (point: Point) => ({
        x: point.x - metrics.rect.left,
        y: point.y - metrics.rect.top,
      });
      applyView(
        pinchView(base, { view: gesture.startView, ...gesture.pinch }, local(a), local(b), box),
      );
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!gesture.moved && !exceedsDragThreshold(dx, dy)) return;
    if (!gesture.moved) frameRef.current?.setPointerCapture(event.pointerId);
    gesture.moved = true;
    applyView({
      ...gesture.startView,
      x: gesture.startView.x - dx / metrics.scale,
      y: gesture.startView.y - dy / metrics.scale,
    });
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.delete(event.pointerId)) return;
    const gesture = gestureRef.current;
    if (gesture?.moved) suppressClickRef.current = true;
    if (pointers.size === 0 || !viewRef.current) {
      gestureRef.current = null;
      return;
    }
    // One finger remains after a pinch: continue as a drag from the current view.
    gestureRef.current = {
      moved: gesture?.moved ?? false,
      startView: viewRef.current,
      pinch: null,
    };
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (insideChooser(event.target) || isModifiedClick(event)) return;
    // Keyboard-activated clicks (Enter on a focused link) carry detail 0 and no real
    // coordinates: let the link navigate, never probe elementsFromPoint(0, 0) or engage.
    if (event.detail === 0) return;
    const candidates = collectCandidates(event.clientX, event.clientY);
    if (shouldOpenChooser(candidates)) {
      event.preventDefault();
      const frameRect = frameRef.current?.getBoundingClientRect();
      if (!frameRect) return;
      setChooser({
        ...chooserPosition(
          { x: event.clientX - frameRect.left, y: event.clientY - frameRect.top },
          frameRect,
          candidates.length,
        ),
        items: candidates,
      });
      return;
    }
    // A single area (over an overarching one or not) follows its link; empty space engages.
    if (candidates.length === 0) setEngaged(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (insideChooser(event.target)) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeChooser(true);
      }
      return;
    }
    if (event.key === "Escape") {
      if (chooser) closeChooser(true);
      else if (engagedRef.current) setEngaged(false);
      else return;
      event.preventDefault();
      return;
    }
    // Pan and zoom keys belong to the frame itself; a focused link keeps its native keys.
    if (!engagedRef.current || event.target !== frameRef.current) return;
    const current = viewRef.current;
    if (!current) return;
    const stepX = current.w * 0.1;
    const stepY = current.h * 0.1;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => panBy(-stepX, 0),
      ArrowRight: () => panBy(stepX, 0),
      ArrowUp: () => panBy(0, -stepY),
      ArrowDown: () => panBy(0, stepY),
      "+": () => zoomBy(ZOOM_STEP),
      "=": () => zoomBy(ZOOM_STEP),
      "-": () => zoomBy(1 / ZOOM_STEP),
      _: () => zoomBy(1 / ZOOM_STEP),
      "0": reset,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame || event.target !== frame || skipEngageOnFocusRef.current) return;
    // Only keyboard focus on the frame itself engages; pointer focus and inner links do not.
    if (frame.matches(":focus-visible")) setEngaged(true);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const to = event.relatedTarget as Node | null;
    if (to && rootRef.current?.contains(to)) return;
    setEngaged(false);
    if (chooser) setChooser(null);
  };

  const toggleEngaged = () => {
    const next = !engagedRef.current;
    setEngaged(next);
    if (next) frameRef.current?.focus({ preventScroll: true });
  };

  const zoomText = labels.zoomLevel.replace(
    "{zoom}",
    (Math.round(view.zoom * 10) / 10).toLocaleString(locale === "nl" ? "nl-NL" : "en-GB", {
      maximumFractionDigits: 1,
    }),
  );

  return (
    <div
      className="atlas-map-enhancer"
      data-ready={view.ready ? "true" : undefined}
      onBlur={onBlur}
      onFocus={onFocus}
      ref={rootRef}
    >
      <div className="atlas-toolbar" role="group" aria-label={labels.toolbar}>
        <button
          aria-pressed={engaged}
          className="atlas-toolbar-toggle"
          onClick={toggleEngaged}
          type="button"
        >
          {labels.activate}
        </button>
        <div className="atlas-toolbar-zoom">
          <button
            aria-disabled={view.atMin}
            aria-label={labels.zoomOut}
            onClick={() => zoomBy(1 / ZOOM_STEP)}
            type="button"
          >
            <span aria-hidden="true">−</span>
          </button>
          <button
            aria-disabled={view.atMax}
            aria-label={labels.zoomIn}
            onClick={() => zoomBy(ZOOM_STEP)}
            type="button"
          >
            <span aria-hidden="true">+</span>
          </button>
          <button aria-disabled={view.atBase} onClick={reset} type="button">
            {labels.reset}
          </button>
          <span className="atlas-toolbar-level">{zoomText}</span>
        </div>
        <p aria-live="polite" className="atlas-toolbar-status" id={statusId}>
          {engaged ? labels.activeStatus : labels.idleStatus}
        </p>
      </div>
      <div
        aria-describedby={statusId}
        aria-label={labels.frame}
        className="atlas-map-frame"
        data-engaged={engaged ? "true" : "false"}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onPointerCancel={endPointer}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        ref={frameRef}
        role="group"
        tabIndex={view.ready ? 0 : undefined}
      >
        {children}
        {chooser ? (
          <AtlasChooser
            labels={{
              heading: labels.chooserHeading,
              intro: labels.chooserIntro,
              context: labels.chooserContext,
              close: labels.close,
            }}
            onClose={() => closeChooser(true)}
            state={chooser}
          />
        ) : null}
      </div>
    </div>
  );
}
