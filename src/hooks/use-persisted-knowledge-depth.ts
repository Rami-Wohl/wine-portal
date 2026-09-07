"use client";

import { useSyncExternalStore } from "react";
import type { Depth } from "@/content/model";

const STORAGE_KEY = "oenocademy:knowledge-depth";
const STORAGE_EVENT = "oenocademy:knowledge-depth-change";
const DEPTH_ORDER: Depth[] = ["foundation", "intermediate", "advanced", "specialist"];
let inMemoryDepth: string | null = null;

function subscribeToStoredDepth(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function readStoredDepth() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? inMemoryDepth;
  } catch {
    return inMemoryDepth;
  }
}

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function readHash() {
  return window.location.hash;
}

function clampDepth(storedDepth: string | null, options: Depth[], fallback: Depth) {
  const storedIndex = DEPTH_ORDER.indexOf(storedDepth as Depth);
  if (storedIndex < 0) return fallback;
  return options[Math.min(storedIndex, options.length - 1)];
}

function getHashTargetDepth(hash: string) {
  if (!hash) return null;
  try {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    return target
      ? (DEPTH_ORDER.find((depth) => target.classList.contains(`content-depth-${depth}`)) ?? null)
      : null;
  } catch {
    return null;
  }
}

export function usePersistedKnowledgeDepth(options: Depth[], fallback: Depth) {
  const storedDepth = useSyncExternalStore(subscribeToStoredDepth, readStoredDepth, () => null);
  const hash = useSyncExternalStore(subscribeToHash, readHash, () => "");
  const preferredDepth = clampDepth(storedDepth, options, fallback);
  const targetDepth = getHashTargetDepth(hash);
  const selectedDepth =
    targetDepth && DEPTH_ORDER.indexOf(targetDepth) > DEPTH_ORDER.indexOf(preferredDepth)
      ? targetDepth
      : preferredDepth;

  const selectDepth = (depth: Depth) => {
    inMemoryDepth = depth;
    try {
      window.localStorage.setItem(STORAGE_KEY, depth);
    } catch {
      // The control remains fully usable when persisting is unavailable.
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  };

  return [selectedDepth, selectDepth] as const;
}
