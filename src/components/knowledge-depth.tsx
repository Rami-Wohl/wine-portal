"use client";

import type { Depth } from "@/content/model";
import { contentLabels } from "@/content/routing";
import { usePersistedKnowledgeDepth } from "@/hooks/use-persisted-knowledge-depth";
import { useLocale } from "@/i18n/locale-context";
import { useMemo, type ReactNode } from "react";

const DEPTH_ORDER: Depth[] = ["foundation", "intermediate", "advanced", "specialist"];

const DEPTH_DESCRIPTIONS: Record<"nl" | "en", Record<Depth, string>> = {
  nl: {
    foundation: "De kern en de belangrijkste oriëntatie.",
    intermediate: "De basis, aangevuld met meer uitleg en samenhang.",
    advanced: "Ook de technische keuzes, nuances en uitzonderingen.",
    specialist: "Alle beschikbare details en specialistische context.",
  },
  en: {
    foundation: "The essentials and a clear starting point.",
    intermediate: "The foundations, with more explanation and connections.",
    advanced: "Technical choices, nuances and exceptions too.",
    specialist: "All available detail and specialist context.",
  },
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
  const locale = useLocale();
  const maxDepthIndex = Math.max(0, DEPTH_ORDER.indexOf(maxDepth));
  const options = useMemo(() => DEPTH_ORDER.slice(0, maxDepthIndex + 1), [maxDepthIndex]);
  const safeInitialDepth = options.includes(initialDepth) ? initialDepth : options[0];
  const [selectedDepth, selectDepth] = usePersistedKnowledgeDepth(options, safeInitialDepth);

  return (
    <div className="knowledge-depth">
      <div className="knowledge-depth-control" data-selected-depth={selectedDepth}>
        <div className="knowledge-depth-summary">
          <span>{locale === "nl" ? "Kennisdiepte" : "Knowledge depth"}</span>
          <strong aria-live="polite">{contentLabels(locale).depth[selectedDepth]}</strong>
          <p>{DEPTH_DESCRIPTIONS[locale][selectedDepth]}</p>
        </div>
        <div
          className="knowledge-depth-options"
          role="group"
          aria-label={
            locale === "nl" ? "Kies hoeveel detail je wilt zien" : "Choose how much detail to show"
          }
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
              {contentLabels(locale).depth[depth]}
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
