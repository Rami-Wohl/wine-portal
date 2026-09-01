"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Depth } from "@/content/model";
import { DEPTH_LABELS_NL } from "@/content/routing";

const DEPTH_ORDER: Depth[] = ["foundation", "intermediate", "advanced", "specialist"];

const DEPTH_DESCRIPTIONS: Record<Depth, string> = {
  foundation: "De kern en de belangrijkste oriëntatie.",
  intermediate: "De basis, aangevuld met meer uitleg en samenhang.",
  advanced: "Ook de technische keuzes, nuances en uitzonderingen.",
  specialist: "Alle beschikbare details en specialistische context.",
};

export function KnowledgeDepth({
  children,
  initialDepth,
  maxDepth,
}: {
  children: ReactNode;
  initialDepth: Depth;
  maxDepth: Depth;
}) {
  const maxDepthIndex = Math.max(0, DEPTH_ORDER.indexOf(maxDepth));
  const options = DEPTH_ORDER.slice(0, maxDepthIndex + 1);
  const safeInitialDepth = options.includes(initialDepth) ? initialDepth : options[0];
  const [selectedDepth, setSelectedDepth] = useState<Depth>(safeInitialDepth);

  useEffect(() => {
    const revealHashTarget = () => {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      const targetDepth = DEPTH_ORDER.find((depth) =>
        target.classList.contains(`content-depth-${depth}`),
      );
      if (!targetDepth) return;

      setSelectedDepth((currentDepth) =>
        DEPTH_ORDER.indexOf(targetDepth) > DEPTH_ORDER.indexOf(currentDepth)
          ? targetDepth
          : currentDepth,
      );
    };

    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => window.removeEventListener("hashchange", revealHashTarget);
  }, []);

  return (
    <div className="knowledge-depth">
      <div className="knowledge-depth-control">
        <div className="knowledge-depth-summary">
          <span>Kennisdiepte</span>
          <strong aria-live="polite">{DEPTH_LABELS_NL[selectedDepth]}</strong>
          <p>{DEPTH_DESCRIPTIONS[selectedDepth]}</p>
        </div>
        <div
          className="knowledge-depth-options"
          role="group"
          aria-label="Kies hoeveel detail je wilt zien"
        >
          {options.map((depth) => (
            <button
              aria-controls="entity-knowledge-content"
              aria-pressed={selectedDepth === depth}
              key={depth}
              onClick={() => setSelectedDepth(depth)}
              type="button"
            >
              {DEPTH_LABELS_NL[depth]}
            </button>
          ))}
        </div>
      </div>
      <div
        className="knowledge-depth-content"
        data-visible-depth={selectedDepth}
        id="entity-knowledge-content"
      >
        {children}
      </div>
    </div>
  );
}
