import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/brand";
import { getPublishedEntities, getPublishedNarratives } from "@/content/repository";
import { entityHref, narrativeHref } from "@/content/routing";

const staticPaths = ["/", "/explore", "/verdiepingen", "/learn", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const indexableEntityPaths = getPublishedEntities().map(entityHref);
  const indexableNarrativePaths = getPublishedNarratives().map(narrativeHref);

  return [...staticPaths, ...indexableEntityPaths, ...indexableNarrativePaths].map((pathname) => ({
    url: new URL(pathname, SITE_URL).toString(),
  }));
}
