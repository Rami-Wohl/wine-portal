import {
  DISCOVERY_CATEGORIES,
  discoveryContextOptions,
  discoveryInitials,
  getDiscoveryEntries,
} from "@/content/discovery";
import { getNarrativeById, getPublishedLearningPaths } from "@/content/repository";
import { ENTITY_ROUTE_SEGMENTS, narrativeHref } from "@/content/routing";
import type { LanguageSwitchRules } from "./switch-rules";

export function getLanguageSwitchRules(): LanguageSwitchRules {
  const lessonPaths: LanguageSwitchRules["lessonPaths"] = {};
  for (const path of getPublishedLearningPaths()) {
    for (const step of path.steps) {
      const lesson = getNarrativeById(step.target);
      if (lesson?.status === "active" && lesson.type === "lesson") {
        (lessonPaths[narrativeHref(lesson)] ??= []).push(path.slugs.en);
      }
    }
  }
  return {
    lessonPaths,
    searchTypes: ["all", ...Object.keys(ENTITY_ROUTE_SEGMENTS)],
    discovery: Object.fromEntries(
      DISCOVERY_CATEGORIES.map((category) => {
        const dutch = getDiscoveryEntries(category.type, "nl");
        const english = getDiscoveryEntries(category.type, "en");
        return [
          `/explore/${category.route_segment}`,
          {
            contexts: discoveryContextOptions(dutch).map((option) => option.slug),
            initials: { nl: discoveryInitials(dutch), en: discoveryInitials(english) },
          },
        ];
      }),
    ),
  };
}
