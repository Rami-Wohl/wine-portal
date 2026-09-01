"use client";

import { useState, type ReactNode } from "react";
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
