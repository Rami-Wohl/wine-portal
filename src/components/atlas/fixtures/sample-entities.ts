import type { Entity } from "@/content/model";

/**
 * TEST FIXTURE. Minimal entities matching the owners in sample-scene.ts so
 * component tests do not depend on live content statuses or slugs.
 */
function entity(
  id: string,
  type: Entity["type"],
  status: Entity["status"],
  nl: string,
  en: string,
  slug: string,
): Entity {
  return {
    id,
    type,
    status,
    canonical_name: en,
    names: { nl, en },
    slugs: { nl: slug, en: slug },
    locales: { nl: `${slug}.nl.md`, en: `${slug}.en.md` },
    relations: [],
    assertions: [],
    source_refs: [],
  };
}

export const sampleEntities: Record<string, Entity> = Object.fromEntries(
  [
    entity(
      "region.graves-sauternais",
      "region",
      "active",
      "Graves en Sauternais",
      "Graves and Sauternais",
      "graves-and-sauternais",
    ),
    entity("region.champagne", "region", "draft", "Champagne", "Champagne", "champagne"),
    entity("region.bordeaux", "region", "active", "Bordeaux", "Bordeaux", "bordeaux"),
    entity(
      "appellation.bordeaux",
      "appellation",
      "active",
      "AOP Bordeaux",
      "Bordeaux AOP",
      "bordeaux-aop",
    ),
    entity("appellation.graves", "appellation", "active", "Graves", "Graves", "graves"),
    entity("appellation.sauternes", "appellation", "active", "Sauternes", "Sauternes", "sauternes"),
    entity(
      "appellation.pessac-leognan",
      "appellation",
      "active",
      "Pessac-Léognan",
      "Pessac-Léognan",
      "pessac-leognan",
    ),
    entity("appellation.barsac", "appellation", "active", "Barsac", "Barsac", "barsac"),
    entity("appellation.cerons", "appellation", "active", "Cérons", "Cérons", "cerons"),
    entity(
      "appellation.fixture-draft",
      "appellation",
      "draft",
      "Conceptgebied (testdata)",
      "Draft area (test data)",
      "fixture-draft",
    ),
    entity(
      "grape.fixture-grape",
      "grape",
      "active",
      "Proefdruif (testdata)",
      "Fixture grape (test data)",
      "fixture-grape",
    ),
  ].map((item) => [item.id, item]),
);
