"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Locale } from "@/content/model";
import { AtlasChooser, type AtlasChooserState } from "./atlas-chooser";
import {
  exceedsDragThreshold,
  HINT_DURATION_MS,
  isModifiedClick,
  orderCandidates,
  pinchView,
  shouldOpenChooser,
  wheelZoomFactor,
  wheelZooms,
  ZOOM_STEP,
  zoomModifierKey,
  type Candidate,
  type Point,
  type View,
} from "./map-view";
import { useAtlasView } from "./use-atlas-view";

/** Strings only: this object crosses the server/client boundary (copy.ts `controls`). */
export interface AtlasEnhancerLabels {
  frame: string;
  controls: string;
  keys: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  wheelHint: string;
  touchHint: string;
  chooserHeading: string;
  chooserIntro: string;
  chooserAlsoWithin: string;
  close: string;
}

/**
 * Wide screens show the area list open beside the map. Shared breakpoint: the min-width: 981px
 * rule in atlas.css and the max-width: 980px block in responsive.css; change all three together.
 */
const WIDE_QUERY = "(min-width: 981px)";

interface Gesture {
  moved: boolean;
  startView: View;
  pinch: { midUnits: [number, number]; distance: number } | null;
  /** One finger on a touch screen: the page scrolls, the map only hints. */
  oneFinger: boolean;
}

type HintKind = "wheel" | "touch";

function escapeSelector(value: string) {
  return typeof CSS !== "undefined" && "escape" in CSS
    ? CSS.escape(value)
    : value.replace(/"/g, "");
}

function inside(target: EventTarget | null, selector: string) {
  return target instanceof Element && Boolean(target.closest(selector));
}

const insideChooser = (target: EventTarget | null) => inside(target, ".atlas-chooser");

function platformName(): string {
  const navigatorWithHints = navigator as Navigator & { userAgentData?: { platform?: string } };
  return navigatorWithHints.userAgentData?.platform || navigator.platform || "";
}

/** The platform never changes while the page is open: nothing to subscribe to. */
const subscribeToNothing = () => () => {};
const clientModifierKey = () => zoomModifierKey(platformName());
const serverModifierKey = () => "Ctrl";

function ControlIcon({ kind }: { kind: "in" | "out" | "reset" }) {
  return (
    <svg
      aria-hidden="true"
      className="atlas-map-control-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      {kind === "in" ? <path d="M12 5v14M5 12h14" /> : null}
      {kind === "out" ? <path d="M5 12h14" /> : null}
      {kind === "reset" ? (
        // Recentre: a ring with a centre dot and four ticks, not the fullscreen corners.
        <>
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" fill="currentColor" r="1.6" stroke="none" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Progressive enhancement around the server-rendered map: pan, zoom, reset,
 * hover and focus highlighting, and an overlap chooser. It follows the gesture
 * model of embedded maps: a pointer drag pans; the wheel zooms only with Ctrl
 * or ⌘ and otherwise scrolls the page with a short hint; on touch one finger
 * scrolls the page and two fingers pan and pinch; the focused frame takes the
 * arrow, +, − and 0 keys. The controls are rendered on the server inside the
 * frame, disabled until this component is ready, so nothing moves on hydration.
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
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  /** True from the moment a second finger lands until every finger has lifted. */
  const twoFingerRef = useRef(false);
  /** True between beforeprint and afterprint: print emulation may fire media changes. */
  const printingRef = useRef(false);
  const hintTimerRef = useRef<number | undefined>(undefined);
  const [chooser, setChooser] = useState<AtlasChooserState | null>(null);
  const [hintKind, setHintKind] = useState<HintKind>("wheel");
  const [hintVisible, setHintVisible] = useState(false);
  // The server cannot know the platform; hydration starts from "Ctrl" and the client then
  // names ⌘ on Apple devices.
  const modifierKey = useSyncExternalStore(
    subscribeToNothing,
    clientModifierKey,
    serverModifierKey,
  );
  const keysId = `${idBase}-map-keys`;

  const showHint = useCallback((kind: HintKind) => {
    setHintKind(kind);
    setHintVisible(true);
    window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHintVisible(false), HINT_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(hintTimerRef.current), []);

  const closeChooser = useCallback((returnFocus: boolean) => {
    setChooser(null);
    if (returnFocus) frameRef.current?.focus({ preventScroll: true });
  }, []);

  // A resize invalidates the chooser's placement (popover or sheet): close it rather than
  // leave it where it no longer fits.
  useEffect(() => {
    if (!chooser) return;
    const close = () => setChooser(null);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [chooser]);

  // Wheel zoom needs a non-passive listener to keep the page still while Ctrl or ⌘ is held.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !view.ready) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      if (insideChooser(event.target)) return;
      if (!wheelZooms(event)) {
        showHint("wheel");
        return;
      }
      event.preventDefault();
      zoomBy(
        wheelZoomFactor(event.deltaY, event.deltaMode),
        pointToUnits(event.clientX, event.clientY),
      );
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [view.ready, pointToUnits, zoomBy, showHint]);

  // touch-action: pan-y lets one finger scroll the page; while two fingers are down the page
  // must not scroll, which only a non-passive touchmove listener can prevent.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !view.ready) return;
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length >= 2 || twoFingerRef.current) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) twoFingerRef.current = false;
    };
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", onTouchEnd);
    frame.addEventListener("touchcancel", onTouchEnd);
    return () => {
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", onTouchEnd);
      frame.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [view.ready]);

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

  // The server renders the area list folded; wide screens show it open beside the map. Only
  // the list sits in the left column, so opening it never moves the map.
  useEffect(() => {
    const figure = rootRef.current?.closest<HTMLElement>("[data-atlas-scene]");
    const details = figure?.querySelector<HTMLDetailsElement>("details[data-atlas-wide-open]");
    if (!details || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(WIDE_QUERY);
    const sync = () => {
      // Printing opens every disclosure; a width change during print must not fold one again.
      if (printingRef.current) return;
      details.open = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Printing shows the folded list and legend: open every disclosure, restore afterwards.
  useEffect(() => {
    const figure = rootRef.current?.closest<HTMLElement>("[data-atlas-scene]");
    if (!figure) return;
    let reopened: HTMLDetailsElement[] = [];
    const before = () => {
      printingRef.current = true;
      reopened = Array.from(figure.querySelectorAll<HTMLDetailsElement>("details:not([open])"));
      reopened.forEach((details) => (details.open = true));
    };
    const after = () => {
      reopened.forEach((details) => (details.open = false));
      reopened = [];
      printingRef.current = false;
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
      const rank = Number(element.getAttribute("data-area-rank"));
      items.push({
        id,
        name,
        href: link?.getAttribute("href") ?? null,
        context: role === "context",
        areaRank: Number.isFinite(rank) && rank > 0 ? rank : null,
      });
    }
    return orderCandidates(items, locale);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    if (chooser && !insideChooser(event.target)) closeChooser(false);
    if (insideChooser(event.target)) return;
    const touch = event.pointerType === "touch";
    if (!touch && event.button !== 0) return;
    const current = viewRef.current;
    if (!current) return;
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointers.values());
    if (touch && points.length >= 2) {
      // Capture only once a two-finger gesture starts; a drag captures when it passes the
      // threshold. Capturing on every press would retarget the click and break the SVG links.
      twoFingerRef.current = true;
      for (const id of pointers.keys()) frameRef.current?.setPointerCapture(id);
      const [a, b] = points;
      const midUnits = pointToUnits((a.x + b.x) / 2, (a.y + b.y) / 2);
      gestureRef.current = {
        moved: false,
        startView: current,
        pinch: midUnits ? { midUnits, distance: Math.hypot(a.x - b.x, a.y - b.y) } : null,
        oneFinger: false,
      };
      return;
    }
    gestureRef.current = { moved: false, startView: current, pinch: null, oneFinger: touch };
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
    if (!exceedsDragThreshold(dx, dy)) return;
    if (gesture.oneFinger) {
      // The browser scrolls vertical swipes itself (and cancels this pointer); what reaches
      // here is a sideways drag that expected the map to move.
      if (!gesture.moved) showHint("touch");
      gesture.moved = true;
      return;
    }
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
    // One finger remains after a two-finger gesture: it keeps moving the map from here.
    gestureRef.current = {
      moved: gesture?.moved ?? false,
      startView: viewRef.current,
      pinch: null,
      oneFinger: false,
    };
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (insideChooser(event.target)) return;
    if (isModifiedClick(event)) return;
    // Keyboard-activated clicks (Enter on a focused link) carry detail 0 and no real
    // coordinates: let the link navigate, never probe elementsFromPoint(0, 0).
    if (event.detail === 0) return;
    const candidates = collectCandidates(event.clientX, event.clientY);
    // A single selectable area (over an overarching one or not) follows its own link.
    if (!shouldOpenChooser(candidates)) return;
    event.preventDefault();
    const frameRect = frameRef.current?.getBoundingClientRect();
    if (!frameRect) return;
    setChooser({
      click: { x: event.clientX - frameRect.left, y: event.clientY - frameRect.top },
      items: candidates,
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      if (!chooser) return;
      event.preventDefault();
      closeChooser(true);
      return;
    }
    // Pan and zoom keys belong to the frame itself; links and buttons keep their own keys.
    if (event.target !== frameRef.current) return;
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
    if (!action || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    action();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const to = event.relatedTarget as Node | null;
    if (to && rootRef.current?.contains(to)) return;
    if (chooser) setChooser(null);
  };

  const hintText =
    hintKind === "touch" ? labels.touchHint : labels.wheelHint.replace("{key}", modifierKey);

  return (
    <div
      className="atlas-map-enhancer"
      data-ready={view.ready ? "true" : undefined}
      onBlur={onBlur}
      ref={rootRef}
    >
      <div
        aria-describedby={keysId}
        aria-label={labels.frame}
        className="atlas-map-frame"
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
        <p
          aria-hidden="true"
          className="atlas-map-hint"
          data-visible={hintVisible ? "true" : "false"}
        >
          {hintText}
        </p>
        {/* One element: the frame's description, and its visible caption on keyboard focus. */}
        <p className="atlas-map-keys-caption" id={keysId}>
          {labels.keys}
        </p>
        {chooser ? (
          <AtlasChooser
            labels={{
              heading: labels.chooserHeading,
              intro: labels.chooserIntro,
              alsoWithin: labels.chooserAlsoWithin,
              close: labels.close,
            }}
            onClose={() => closeChooser(true)}
            state={chooser}
          />
        ) : null}
      </div>
      {/* After the frame in DOM and tab order: an overlay in the frame's top-right corner on
          wide screens, a bar attached below the frame on narrow ones (atlas.css). */}
      <div aria-label={labels.controls} className="atlas-map-controls" role="group">
        {(
          [
            ["in", labels.zoomIn, () => zoomBy(ZOOM_STEP), view.atMax],
            ["out", labels.zoomOut, () => zoomBy(1 / ZOOM_STEP), view.atMin],
            ["reset", labels.reset, reset, view.atBase],
          ] as const
        ).map(([kind, label, action, atLimit]) => (
          <button
            aria-disabled={view.ready && atLimit ? true : undefined}
            aria-label={label}
            className="atlas-map-control"
            disabled={!view.ready}
            key={kind}
            onClick={action}
            title={label}
            type="button"
          >
            <ControlIcon kind={kind} />
          </button>
        ))}
      </div>
    </div>
  );
}
