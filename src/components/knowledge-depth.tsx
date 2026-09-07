"use client";

import { useMemo, type ReactNode } from "react";
import type { Depth } from "@/content/model";
import { DEPTH_LABELS_NL } from "@/content/routing";
import { usePersistedKnowledgeDepth } from "@/hooks/use-persisted-knowledge-depth";

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
  const options = useMemo(() => DEPTH_ORDER.slice(0, maxDepthIndex + 1), [maxDepthIndex]);
  const safeInitialDepth = options.includes(initialDepth) ? initialDepth : options[0];
  const [selectedDepth, selectDepth] = usePersistedKnowledgeDepth(options, safeInitialDepth);

  return (
    <div className="knowledge-depth">
      <div className="knowledge-depth-control" data-selected-depth={selectedDepth}>
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
              data-depth={depth}
              key={depth}
              onClick={() => selectDepth(depth)}
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
