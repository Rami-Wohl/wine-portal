import type { AtlasPortal, AtlasPortalNode, AtlasPortalState } from "@/content/model";

/**
 * TEST FIXTURE — NOT GEOGRAPHY, NOT CONTENT.
 *
 * A synthetic Atlas portal at the end-goal scale (15 top-level places, 150 regions, 450
 * sub-regions) with clearly invented names ("Testland", "Testregio") and invented thumbnail
 * paths. It proves layout and counts only. Never render it on a public route; see
 * docs/geography-policy.md and docs/product-principles.md §5.
 */

export const PORTAL_SCALE = { sections: 15, cardsPerSection: 10, subsPerCard: 3 } as const;

/** A thumbnail near the 3 KiB path budget, different per index and irregular, so it compresses
 * like a real one: a deterministic pseudo-random walk, never a shape of anything. */
export function syntheticThumbnail(index: number) {
  let seed = index + 1;
  const step = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed % 19) - 9;
  };
  const walk = Array.from({ length: 420 }, () => `${step()} ${step()}`).join(" ");
  return {
    viewBox: { width: 160 as const, height: 90 },
    paths: [`M80 45l${walk}`.slice(0, 2999) + "z"],
  };
}

/** A map node's filter names: its own name plus those of the appellations its map draws. */
const node = (
  id: string,
  name: string,
  state: AtlasPortalState,
  children: AtlasPortalNode[] = [],
): AtlasPortalNode => ({
  id: `region.${id}`,
  name,
  matchNames: [name],
  areaNames:
    state.kind === "map"
      ? Array.from({ length: state.shown }, (_, area) => `Testappellatie ${id} ${area + 1}`)
      : [],
  href: state.kind === "map" ? `/atlas/${id}` : `/regions/${id}`,
  ...(state.kind === "map" ? { pageHref: `/regions/${id}` } : {}),
  state,
  children,
});

/** Every state in turn: text only, in preparation, complete map, partial map. */
function stateFor(index: number): AtlasPortalState {
  switch (index % 4) {
    case 0:
      return { kind: "text" };
    case 1:
      return { kind: "preparing" };
    case 2:
      return { kind: "map", shown: 10, intended: 10, thumbnail: syntheticThumbnail(index) };
    default:
      return { kind: "map", shown: 10, intended: 12, thumbnail: syntheticThumbnail(index) };
  }
}

export function syntheticPortal(): AtlasPortal {
  let maps = 0;
  const count = (state: AtlasPortalState) => {
    if (state.kind === "map") maps += 1;
    return state;
  };
  const sections = Array.from({ length: PORTAL_SCALE.sections }, (_, country) =>
    node(
      `testland-${country + 1}`,
      `Testland ${country + 1}`,
      count(
        country % 2 === 0
          ? { kind: "text" }
          : { kind: "map", shown: 40, intended: 41, thumbnail: syntheticThumbnail(1000 + country) },
      ),
      Array.from({ length: PORTAL_SCALE.cardsPerSection }, (_, region) => {
        const index = country * PORTAL_SCALE.cardsPerSection + region + 1;
        return node(
          `testregio-${index}`,
          `Testregio ${index}`,
          count(stateFor(index)),
          Array.from({ length: PORTAL_SCALE.subsPerCard }, (_, sub) => {
            const state = stateFor(sub);
            return node(
              `testregio-${index}-${sub + 1}`,
              `Testregio ${index}.${sub + 1}`,
              count(state.kind === "map" ? { ...state, thumbnail: undefined } : state),
            );
          }),
        );
      }),
    ),
  );
  const { sections: s, cardsPerSection: c, subsPerCard: u } = PORTAL_SCALE;
  return { sections, regionCount: s + s * c + s * c * u, mapCount: maps };
}
