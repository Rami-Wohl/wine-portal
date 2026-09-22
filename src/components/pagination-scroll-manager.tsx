"use client";

import { useEffect } from "react";

interface PaginationScrollManagerProps {
  active: boolean;
  currentPage: number;
  targetId: string;
}

export function PaginationScrollManager({
  active,
  currentPage,
  targetId,
}: PaginationScrollManagerProps) {
  useEffect(() => {
    if (!active || window.location.hash !== `#${targetId}`) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    const animationFrame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      target.querySelector<HTMLElement>("[data-pagination-heading]")?.focus({
        preventScroll: true,
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, currentPage, targetId]);

  return null;
}
