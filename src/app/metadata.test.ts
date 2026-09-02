import { describe, expect, it } from "vitest";
import { BRAND, SITE_URL } from "@/config/brand";
import { getAllEntities, getAllNarratives } from "@/content/repository";
import { entityHref, narrativeHref } from "@/content/routing";
import {
  generateMetadata as generateEntityMetadata,
  generateStaticParams as generateEntityStaticParams,
} from "./[entityType]/[slug]/page";
import { metadata as rootMetadata } from "./layout";
import {
  generateMetadata as generateNarrativeMetadata,
  generateStaticParams as generateNarrativeStaticParams,
} from "./verdiepingen/[narrativeType]/[slug]/page";
import robots from "./robots";
import sitemap from "./sitemap";

describe("application metadata", () => {
  it("uses the centralized brand for root SEO metadata", () => {
    expect(rootMetadata.applicationName).toBe(BRAND.name);
    expect(rootMetadata.description).toBe(BRAND.description.nl);
    expect(rootMetadata.openGraph).toMatchObject({
      siteName: BRAND.name,
      description: BRAND.description.nl,
    });
  });

  it("publishes a robots policy linked to the canonical sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    });
  });

  it("includes static and active content routes in the sitemap only", () => {
    const paths = new Set(sitemap().map((item) => new URL(item.url).pathname));

    for (const path of ["/", "/about", "/explore", "/verdiepingen", "/learn"]) {
      expect(paths.has(path)).toBe(true);
    }
    expect(paths.has("/search")).toBe(false);
    expect(paths.has("/atlas")).toBe(false);
    for (const entity of getAllEntities()) {
      expect(paths.has(entityHref(entity))).toBe(entity.status === "active");
    }
    for (const narrative of getAllNarratives()) {
      expect(paths.has(narrativeHref(narrative))).toBe(narrative.status === "active");
    }
  });

  it("generates params and noindex metadata for draft entity routes", async () => {
    expect(generateEntityStaticParams()).toHaveLength(getAllEntities().length);
    const metadata = await generateEntityMetadata({
      params: Promise.resolve({
        entityType: "producers",
        slug: "chateau-mouton-rothschild",
      }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "/producers/chateau-mouton-rothschild",
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.description).not.toMatch(/canonical|fixture|entity/i);
    await expect(
      generateEntityMetadata({
        params: Promise.resolve({ entityType: "producers", slug: "unknown" }),
      }),
    ).resolves.toEqual({});
  });

  it("generates params and noindex metadata for draft narrative routes", async () => {
    expect(generateNarrativeStaticParams()).toHaveLength(getAllNarratives().length);
    const metadata = await generateNarrativeMetadata({
      params: Promise.resolve({
        narrativeType: "regional-deep-dives",
        slug: "bordeaux-pipeline-proef",
      }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "/verdiepingen/regional-deep-dives/bordeaux-pipeline-proef",
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBe("Bordeaux: verdieping in voorbereiding");
    await expect(
      generateNarrativeMetadata({
        params: Promise.resolve({ narrativeType: "lessons", slug: "unknown" }),
      }),
    ).resolves.toEqual({});
  });
});
