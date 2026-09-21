"use client";

import { useEffect } from "react";

interface SearchFocusManagerProps {
  hasSearchIntent: boolean;
  navigationKey: string;
}

function focusCanBeManaged(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement === null ||
    activeElement === document.body ||
    activeElement === document.documentElement
  );
}

export function SearchFocusManager({ hasSearchIntent, navigationKey }: SearchFocusManagerProps) {
  useEffect(() => {
    if (!focusCanBeManaged()) return;

    if (!hasSearchIntent) {
      document.getElementById("search-query")?.focus({ preventScroll: true });
      return;
    }

    const results = document.getElementById("search-results");
    const resultsTitle = document.getElementById("results-title");
    if (!results || !resultsTitle) return;

    resultsTitle.focus({ preventScroll: true });

    const titleBounds = resultsTitle.getBoundingClientRect();
    const titleIsVisible = titleBounds.top >= 0 && titleBounds.bottom <= window.innerHeight;
    if (titleIsVisible) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    results.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [hasSearchIntent, navigationKey]);

  return null;
}
