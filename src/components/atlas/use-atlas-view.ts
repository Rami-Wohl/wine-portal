import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { labelVisibleAt } from "./labels";
import {
  clampView,
  effectiveZoom,
  formatViewBox,
  MAX_ZOOM,
  MIN_ZOOM,
  parseViewBox,
  translateView,
  unitsAt,
  viewMetrics,
  zoomFactor,
  zoomView,
  type View,
} from "./map-view";

export interface Measured {
  rect: DOMRect;
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Owns the SVG view: finds the server-rendered map inside the frame, records
 * its base viewBox and writes every change back to the DOM (viewBox, the CSS
 * unit scale for labels and markers, zoom data attribute, label visibility).
 */
export function useAtlasView(frameRef: RefObject<HTMLDivElement | null>) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const baseRef = useRef<View | null>(null);
  const viewRef = useRef<View | null>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [atBase, setAtBase] = useState(true);

  const measure = useCallback((): Measured | null => {
    const svg = svgRef.current;
    const view = viewRef.current;
    if (!svg || !view) return null;
    const rect = svg.getBoundingClientRect();
    const metrics = viewMetrics(view, rect.width, rect.height);
    return metrics ? { rect, ...metrics } : null;
  }, []);

  const applyView = useCallback(
    (next: View) => {
      const svg = svgRef.current;
      const base = baseRef.current;
      if (!svg || !base) return;
      const view = clampView(next, base);
      viewRef.current = view;
      svg.setAttribute("viewBox", formatViewBox(view));
      svg.style.setProperty("--atlas-view-width", String(view.w));
      const factor = zoomFactor(base, view);
      svg.setAttribute("data-zoom", factor.toFixed(2));
      const metrics = measure();
      if (metrics) {
        svg.style.setProperty("--atlas-u", String(1 / metrics.scale));
        const effective = effectiveZoom(metrics.scale, base.w);
        svg.querySelectorAll<SVGElement>("[data-min-zoom]").forEach((label) => {
          const minZoom = Number(label.getAttribute("data-min-zoom"));
          const max = label.getAttribute("data-max-zoom");
          const visible =
            Number.isFinite(minZoom) &&
            labelVisibleAt({ minZoom, maxZoom: max === null ? undefined : Number(max) }, effective);
          label.setAttribute("data-visible", visible ? "true" : "false");
        });
      }
      setZoom(factor);
      const tolerance = base.w * 1e-6;
      setAtBase(
        Math.abs(view.x - base.x) <= tolerance &&
          Math.abs(view.y - base.y) <= tolerance &&
          Math.abs(view.w - base.w) <= tolerance,
      );
    },
    [measure],
  );

  const pointToUnits = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const metrics = measure();
      const view = viewRef.current;
      if (!metrics || !view) return null;
      return unitsAt(view, metrics, clientX - metrics.rect.left, clientY - metrics.rect.top);
    },
    [measure],
  );

  const zoomTo = useCallback(
    (targetZoom: number, about?: [number, number] | null) => {
      const base = baseRef.current;
      const view = viewRef.current;
      if (base && view) applyView(zoomView(base, view, targetZoom, about));
    },
    [applyView],
  );

  const zoomBy = useCallback(
    (factor: number, about?: [number, number] | null) => {
      const base = baseRef.current;
      const view = viewRef.current;
      if (base && view) zoomTo(zoomFactor(base, view) * factor, about);
    },
    [zoomTo],
  );

  const panBy = useCallback(
    (dxUnits: number, dyUnits: number) => {
      const base = baseRef.current;
      const view = viewRef.current;
      if (base && view) applyView(translateView(view, base, dxUnits, dyUnits));
    },
    [applyView],
  );

  const reset = useCallback(() => {
    if (baseRef.current) applyView(baseRef.current);
  }, [applyView]);

  // Mount: adopt the server-rendered SVG and keep label sizes in CSS pixels on resize.
  useEffect(() => {
    const frame = frameRef.current;
    const svg = frame?.querySelector("svg");
    const base = svg ? parseViewBox(svg.getAttribute("viewBox")) : null;
    if (!frame || !svg || !base) return;
    svgRef.current = svg;
    baseRef.current = base;
    viewRef.current = base;
    setReady(true);
    const refresh = () => {
      if (viewRef.current) applyView(viewRef.current);
    };
    refresh();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refresh);
    observer?.observe(frame);
    window.addEventListener("resize", refresh);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, [applyView, frameRef]);

  return {
    svgRef,
    baseRef,
    viewRef,
    ready,
    zoom,
    atMin: zoom <= MIN_ZOOM + 1e-6,
    /** True at the base view: neither zoomed nor panned, so reset has nothing to do. */
    atBase,
    atMax: zoom >= MAX_ZOOM - 1e-6,
    measure,
    applyView,
    pointToUnits,
    zoomTo,
    zoomBy,
    panBy,
    reset,
  };
}
