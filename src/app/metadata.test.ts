import { describe, expect, it } from "vitest";
import { BRAND, SITE_URL } from "@/config/brand";
import { getAllEntities, getAllLearningPaths, getAllNarratives } from "@/content/repository";
import { entityPresentationMode } from "@/content/model";
import { DISCOVERY_CATEGORIES } from "@/content/discovery";
import { entityHref, learningPathHref, narrativeHref } from "@/content/routing";
import {
  generateMetadata as generateEntityMetadata,
  generateStaticParams as generateEntityStaticParams,
} from "./[entityType]/[slug]/page";
import { metadata as rootMetadata } from "./layout";
import {
  generateMetadata as generateNarrativeMetadata,
  generateStaticParams as generateNarrativeStaticParams,
} from "./verdiepingen/[narrativeType]/[slug]/page";
import {
  generateMetadata as generateLearningPathMetadata,
  generateStaticParams as generateLearningPathStaticParams,
} from "./learn/[slug]/page";
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
    for (const category of DISCOVERY_CATEGORIES) {
      expect(paths.has(`/explore/${category.route_segment}`)).toBe(true);
    }
    expect(paths.has("/search")).toBe(false);
    expect(paths.has("/atlas")).toBe(false);
    for (const entity of getAllEntities()) {
      expect(paths.has(entityHref(entity))).toBe(
        entity.status === "active" && entityPresentationMode(entity) === "monograph",
      );
    }
    for (const narrative of getAllNarratives()) {
      expect(paths.has(narrativeHref(narrative))).toBe(narrative.status === "active");
    }
    for (const learningPath of getAllLearningPaths()) {
      expect(paths.has(learningPathHref(learningPath))).toBe(learningPath.status === "active");
    }
  });

  it("generates params and noindex metadata for draft entity routes", async () => {
    expect(generateEntityStaticParams()).toHaveLength(
      getAllEntities().reduce(
        (count, entity) => count + new Set([entity.slugs.en, entity.slugs.nl]).size,
        0,
      ),
    );
    const draft = getAllEntities().find(
      (entity) => entity.type === "concept" && entity.status === "draft",
    );
    if (!draft) throw new Error("This integration check requires a draft concept");
    const href = entityHref(draft);
    const [, entityType, slug] = href.split("/");
    const metadata = await generateEntityMetadata({
      params: Promise.resolve({
        entityType,
        slug,
      }),
    });

    expect(metadata.alternates).toEqual({
      canonical: href,
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
    expect(generateNarrativeStaticParams()).toHaveLength(
      getAllNarratives().reduce(
        (count, narrative) => count + new Set([narrative.slugs.en, narrative.slugs.nl]).size,
        0,
      ),
    );
    const metadata = await generateNarrativeMetadata({
      params: Promise.resolve({
        narrativeType: "regional-deep-dives",
        slug: "bordeaux-pipeline-proef",
      }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "/verdiepingen/regional-deep-dives/bordeaux-pipeline-proof",
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBe("Bordeaux: verdieping in voorbereiding");
    await expect(
      generateNarrativeMetadata({
        params: Promise.resolve({ narrativeType: "lessons", slug: "unknown" }),
      }),
    ).resolves.toEqual({});
  });

  it("publishes only active learning-path routes", async () => {
    expect(generateLearningPathStaticParams()).toHaveLength(
      getAllLearningPaths()
        .filter((learningPath) => learningPath.status === "active")
        .reduce(
          (count, learningPath) =>
            count + new Set([learningPath.slugs.en, learningPath.slugs.nl]).size,
          0,
        ),
    );
    await expect(
      generateLearningPathMetadata({
        params: Promise.resolve({ slug: "from-grape-to-still-wine" }),
      }),
    ).resolves.toMatchObject({
      title: "Van druif naar stille wijn — hoe wijn wordt gemaakt",
      alternates: { canonical: "/learn/from-grape-to-still-wine" },
    });
  });
});
