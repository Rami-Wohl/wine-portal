import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/brand";
import { getEntities, getNarratives } from "@/content/repository";
import { entityHref, narrativeHref } from "@/content/routing";

const staticPaths = ["/", "/explore", "/learn", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const indexableEntityPaths = getEntities()
    .filter((entity) => entity.status === "active")
    .map(entityHref);
  const indexableNarrativePaths = getNarratives()
    .filter((narrative) => narrative.status === "active")
    .map(narrativeHref);

  return [...staticPaths, ...indexableEntityPaths, ...indexableNarrativePaths].map(
    (pathname) => ({ url: new URL(pathname, SITE_URL).toString() }),
  );
}
