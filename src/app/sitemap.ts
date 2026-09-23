import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/brand";
import { DISCOVERY_CATEGORIES } from "@/content/discovery";
import {
  getPublishedLearningPaths,
  getPublishedNarratives,
  getPublishedStandaloneEntities,
} from "@/content/repository";
import { entityHref, learningPathHref, narrativeHref } from "@/content/routing";

const staticPaths = [
  "/",
  "/explore",
  ...DISCOVERY_CATEGORIES.map((category) => `/explore/${category.route_segment}`),
  "/verdiepingen",
  "/learn",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const indexableEntityPaths = getPublishedStandaloneEntities().map(entityHref);
  const indexableNarrativePaths = getPublishedNarratives().map(narrativeHref);
  const indexableLearningPaths = getPublishedLearningPaths().map(learningPathHref);

  return [
    ...staticPaths,
    ...indexableEntityPaths,
    ...indexableNarrativePaths,
    ...indexableLearningPaths,
  ].map((pathname) => ({
    url: new URL(pathname, SITE_URL).toString(),
  }));
}
