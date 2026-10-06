import { SITE_URL } from "@/config/brand";
import { DISCOVERY_CATEGORIES } from "@/content/discovery";
import {
  getPublishedLearningPaths,
  getPublishedNarratives,
  getPublishedStandaloneEntities,
} from "@/content/repository";
import { entityHref, learningPathHref, narrativeHref } from "@/content/routing";
import { languageAlternates, locales, localizedHref } from "@/i18n/routing";
import type { MetadataRoute } from "next";

const staticPaths = [
  "/",
  "/explore",
  ...DISCOVERY_CATEGORIES.map((category) => `/explore/${category.route_segment}`),
  "/verdiepingen",
  "/learn",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const indexableEntityPaths = getPublishedStandaloneEntities().map((item) => entityHref(item));
  const indexableNarrativePaths = getPublishedNarratives().map((item) => narrativeHref(item));
  const indexableLearningPaths = getPublishedLearningPaths().map((item) => learningPathHref(item));

  return [
    ...staticPaths,
    ...indexableEntityPaths,
    ...indexableNarrativePaths,
    ...indexableLearningPaths,
  ].flatMap((pathname) =>
    locales.map((locale) => ({
      url: new URL(localizedHref(pathname, locale), SITE_URL).toString(),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(pathname, locale).languages).map(([language, href]) => [
            language,
            new URL(href, SITE_URL).toString(),
          ]),
        ),
      },
    })),
  );
}
