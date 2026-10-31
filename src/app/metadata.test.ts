import { BRAND, SITE_URL } from "@/config/brand";
import { DISCOVERY_CATEGORIES } from "@/content/discovery";
import {
  ATLAS_PREVIEW,
  atlasSceneHref,
  getAtlasSceneSummaries,
  getPublishedAtlasSceneSummaries,
} from "@/content/geography";
import { entityPresentationMode } from "@/content/model";
import {
  getAllEntities,
  getAllLearningPaths,
  getAllNarratives,
  getEntityById,
} from "@/content/repository";
import { entityHref, learningPathHref, narrativeHref } from "@/content/routing";
import { describe, expect, it } from "vitest";
import {
  generateMetadata as generateEntityMetadata,
  generateStaticParams as generateEntityStaticParams,
} from "./[lang]/[entityType]/[slug]/page";
import { generateMetadata as generateAtlasMetadata } from "./[lang]/atlas/page";
import {
  generateMetadata as generateAtlasSceneMetadata,
  generateStaticParams as generateAtlasSceneStaticParams,
} from "./[lang]/atlas/[scene]/page";
import { generateMetadata as generateRootMetadata } from "./[lang]/layout";
import {
  generateMetadata as generateLearningPathMetadata,
  generateStaticParams as generateLearningPathStaticParams,
} from "./[lang]/learn/[slug]/page";
import {
  generateMetadata as generateNarrativeMetadata,
  generateStaticParams as generateNarrativeStaticParams,
} from "./[lang]/verdiepingen/[narrativeType]/[slug]/page";
import robots from "./robots";
import sitemap from "./sitemap";

describe("application metadata", () => {
  it("uses the centralized brand for root SEO metadata", async () => {
    const rootMetadata = await generateRootMetadata({
      params: Promise.resolve({ lang: "nl" }),
      children: null,
    });
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
    // While Atlas is a preview no Atlas route is listed, whatever scenes exist; this matches
    // the noindex metadata and flips together with it at the phase 3 release gate.
    const publishedScenes = getPublishedAtlasSceneSummaries();
    if (ATLAS_PREVIEW) {
      expect(Array.from(paths).filter((path) => /^\/(?:en\/)?atlas(?:\/|$)/.test(path))).toEqual(
        [],
      );
    } else {
      expect(paths.has("/atlas")).toBe(publishedScenes.length > 0);
      for (const scene of getAtlasSceneSummaries()) {
        expect(paths.has(atlasSceneHref(scene.slug))).toBe(publishedScenes.includes(scene));
      }
    }
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
      params: Promise.resolve({ lang: "nl", entityType, slug }),
    });

    expect(metadata.alternates).toEqual({
      canonical: href,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.description).not.toMatch(/canonical|fixture|entity/i);
    await expect(
      generateEntityMetadata({
        params: Promise.resolve({ lang: "nl", entityType: "producers", slug: "unknown" }),
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
        lang: "nl",
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
        params: Promise.resolve({ lang: "nl", narrativeType: "lessons", slug: "unknown" }),
      }),
    ).resolves.toEqual({});
  });

  it("generates Atlas params for every scene and keeps the preview out of the index", async () => {
    const scenes = getAtlasSceneSummaries();
    // Both route slugs are prebuilt: the English one and the owner's Dutch alias.
    expect(generateAtlasSceneStaticParams()).toEqual(
      scenes.flatMap((scene) =>
        Array.from(new Set([scene.slug, getEntityById(scene.owner)?.slugs.nl ?? scene.slug])).map(
          (slug) => ({ scene: slug }),
        ),
      ),
    );
    await expect(
      generateAtlasSceneMetadata({ params: Promise.resolve({ lang: "nl", scene: "unknown" }) }),
    ).resolves.toEqual({});
    const overview = await generateAtlasMetadata({ params: Promise.resolve({ lang: "en" }) });
    const published = getPublishedAtlasSceneSummaries();
    const noindex = { index: false, follow: true };
    // Indexability and SEO language alternates are coupled: a noindex page carries only its
    // canonical, like entity routes (docs/localization-routing.md §4).
    const overviewIndexable = !ATLAS_PREVIEW && published.length > 0;
    expect(overview.robots).toEqual(overviewIndexable ? undefined : noindex);
    expect(overview.alternates).toEqual(
      overviewIndexable
        ? {
            canonical: "/en/atlas",
            languages: { nl: "/atlas", en: "/en/atlas", "x-default": "/atlas" },
          }
        : { canonical: "/en/atlas" },
    );
    for (const scene of scenes) {
      const metadata = await generateAtlasSceneMetadata({
        params: Promise.resolve({ lang: "nl", scene: scene.slug }),
      });
      expect(metadata.description).not.toMatch(/scene\.|geo\.|region\./);
      const alias = getEntityById(scene.owner)?.slugs.nl;
      if (alias && alias !== scene.slug) {
        const aliased = await generateAtlasSceneMetadata({
          params: Promise.resolve({ lang: "nl", scene: alias }),
        });
        expect(aliased.alternates?.canonical).toBe(`/atlas/${scene.slug}`);
      }
      if (!ATLAS_PREVIEW && published.includes(scene)) {
        expect(metadata.robots).toBeUndefined();
        expect(metadata.alternates).toEqual({
          canonical: `/atlas/${scene.slug}`,
          languages: {
            nl: `/atlas/${scene.slug}`,
            en: `/en/atlas/${scene.slug}`,
            "x-default": `/atlas/${scene.slug}`,
          },
        });
      } else {
        expect(metadata.robots).toEqual(noindex);
        expect(metadata.alternates).toEqual({ canonical: `/atlas/${scene.slug}` });
      }
    }
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
        params: Promise.resolve({ lang: "nl", slug: "from-grape-to-still-wine" }),
      }),
    ).resolves.toMatchObject({
      title: "Van druif naar stille wijn — hoe wijn wordt gemaakt",
      alternates: { canonical: "/learn/from-grape-to-still-wine" },
    });
  });
});

it("uses English metadata and reciprocal alternates without indexing drafts", async () => {
  const active = await generateEntityMetadata({
    params: Promise.resolve({ lang: "en", entityType: "concepts", slug: "winemaking-routes" }),
  });
  expect(active.title).toBe("Still wine production routes: concept");
  expect(active.openGraph).toMatchObject({
    locale: "en_US",
    url: "/en/concepts/winemaking-routes",
  });
  expect(active.alternates).toEqual({
    canonical: "/en/concepts/winemaking-routes",
    languages: {
      nl: "/concepts/winemaking-routes",
      en: "/en/concepts/winemaking-routes",
      "x-default": "/concepts/winemaking-routes",
    },
  });
  const draft = await generateNarrativeMetadata({
    params: Promise.resolve({
      lang: "en",
      narrativeType: "regional-deep-dives",
      slug: "bordeaux-pipeline-proof",
    }),
  });
  expect(draft.title).toBe("Bordeaux: deep dive in preparation");
  expect(draft.robots).toEqual({ index: false, follow: true });
  expect(draft.alternates).toEqual({
    canonical: "/en/verdiepingen/regional-deep-dives/bordeaux-pipeline-proof",
  });
});
