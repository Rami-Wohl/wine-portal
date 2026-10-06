import {
  LOCALES,
  type ContentDocument,
  type Locale,
  type MediaAsset,
  type GeneratedEntity,
  type GeneratedNarrative,
  type SearchIndexEntry,
  type SearchPassage,
} from "../../../src/content/model";
import { inlineText, blockNodeText } from "./content-text";

function searchPassagesForDocument(
  document: ContentDocument,
  locale: Locale,
  entityNamesById: Map<string, Record<Locale, string>>,
  mediaById: Map<string, MediaAsset>,
): SearchPassage[] {
  const entityLabel = (id: string) => entityNamesById.get(id)?.[locale] ?? id;
  const clean = (value: string) => value.replace(/\s+/g, " ").trim();

  return document.blocks.flatMap((block): SearchPassage[] => {
    if (block.type === "figure") {
      const caption = block.media_id ? mediaById.get(block.media_id)?.caption?.[locale] : undefined;
      const description = clean(
        block.nodes.map((node) => blockNodeText(node, entityLabel)).join(" "),
      );
      const text = description || clean(caption ?? "");
      if (!text) return [];
      return [
        {
          block_id: block.id,
          kind: "media-caption",
          depth: block.depth,
          heading: null,
          text,
        },
      ];
    }

    const headingNode = block.nodes.find((node) => node.type === "heading");
    const heading = headingNode ? clean(inlineText(headingNode.children, entityLabel)) : null;
    const text = clean(block.nodes.map((node) => blockNodeText(node, entityLabel)).join(" "));
    if (!text) return [];
    return [
      {
        block_id: block.id,
        kind: "content",
        depth: block.depth,
        heading,
        text,
      },
    ];
  });
}

export function buildSearchIndex(
  entities: GeneratedEntity[],
  narratives: GeneratedNarrative[],
  media: MediaAsset[],
): SearchIndexEntry[] {
  const entityNamesById = new Map(entities.map((entity) => [entity.id, entity.names]));
  const mediaById = new Map(media.map((asset) => [asset.id, asset]));
  const search: SearchIndexEntry[] = [
    ...entities.map(({ id, status, type, canonical_name, names, aliases, slugs, content }) => ({
      kind: "entity" as const,
      id,
      status,
      entity_type: type,
      canonical_name,
      names,
      aliases: aliases ?? { nl: [], en: [] },
      slugs,
      passages: Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          searchPassagesForDocument(content[locale], locale, entityNamesById, mediaById),
        ]),
      ) as SearchIndexEntry["passages"],
    })),
    ...narratives.map(({ id, status, type, title, slugs, content }) => ({
      kind: "narrative" as const,
      id,
      status,
      narrative_type: type,
      titles: title,
      slugs,
      passages: Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          searchPassagesForDocument(content[locale], locale, entityNamesById, mediaById),
        ]),
      ) as SearchIndexEntry["passages"],
    })),
  ];
  return search;
}
