import type { EntityType, Locale, SearchIndexEntry, SearchPassage } from "./model";
import { ENTITY_TYPE_LABELS_NL } from "./routing";

export type EntityTypeFilter = EntityType | "all";
export type SearchMatchKind = "metadata" | "heading" | "content" | "media-caption";

export interface KnowledgeSearchResult {
  entry: SearchIndexEntry;
  score: number;
  match_kind: SearchMatchKind;
  passage: SearchPassage | null;
  anchor: string | null;
  snippet: string | null;
}

export function firstSearchParam(value: string | string[] | undefined, fallback = ""): string {
  return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
}

export function parseEntityTypeFilter(value: string): EntityTypeFilter {
  return Object.prototype.hasOwnProperty.call(ENTITY_TYPE_LABELS_NL, value)
    ? (value as EntityType)
    : "all";
}

export function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("nl")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchEntryTitle(entry: SearchIndexEntry, locale: Locale): string {
  return entry.kind === "entity" ? entry.names[locale] : entry.titles[locale];
}

function fieldScore(value: string, query: string, exact: number): number {
  const normalized = normalizeSearchValue(value);
  if (!normalized || !query) return 0;
  if (normalized === query) return exact;
  if (normalized.startsWith(query)) return exact - 80;
  if (normalized.includes(query)) return exact - 160;
  return 0;
}

function metadataScore(entry: SearchIndexEntry, query: string, locale: Locale): number {
  const secondaryLocale: Locale = locale === "nl" ? "en" : "nl";
  if (entry.kind === "entity") {
    const localizedNames = [entry.names[locale], ...entry.aliases[locale]];
    const secondaryNames = [entry.names[secondaryLocale], ...entry.aliases[secondaryLocale]];
    return Math.max(
      ...localizedNames.map((value) => fieldScore(value, query, 1_000)),
      ...secondaryNames.map((value) => fieldScore(value, query, 940)),
      fieldScore(entry.canonical_name, query, 920),
      fieldScore(entry.id, query, 880),
      fieldScore(entry.slugs[locale], query, 860),
      fieldScore(entry.slugs[secondaryLocale], query, 840),
    );
  }

  return Math.max(
    fieldScore(entry.titles[locale], query, 1_000),
    fieldScore(entry.titles[secondaryLocale], query, 940),
    fieldScore(entry.id, query, 880),
    fieldScore(entry.slugs[locale], query, 860),
    fieldScore(entry.slugs[secondaryLocale], query, 840),
  );
}

function passageScore(
  passage: SearchPassage,
  query: string,
  tokens: string[],
): { score: number; kind: Exclude<SearchMatchKind, "metadata"> } | null {
  const heading = passage.heading ? normalizeSearchValue(passage.heading) : "";
  const text = normalizeSearchValue(passage.text);
  const phraseInHeading = Boolean(heading && heading.includes(query));
  const phraseInText = text.includes(query);
  const allTokensInHeading = Boolean(heading && tokens.every((token) => heading.includes(token)));
  const allTokensInText = tokens.every((token) => text.includes(token));

  let score = 0;
  let kind: Exclude<SearchMatchKind, "metadata"> =
    passage.kind === "media-caption" ? "media-caption" : "content";

  if (phraseInHeading) {
    score = heading === query ? 760 : 700;
    kind = "heading";
  } else if (allTokensInHeading) {
    score = 650;
    kind = "heading";
  } else if (phraseInText) {
    score = passage.kind === "media-caption" ? 500 : 560;
  } else if (allTokensInText) {
    score = passage.kind === "media-caption" ? 420 : 480;
  } else {
    return null;
  }

  const depthBonus = { foundation: 16, intermediate: 12, advanced: 8, specialist: 4 };
  return { score: score + (passage.depth ? depthBonus[passage.depth] : 0), kind };
}

function positionalSearchValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("nl");
}

function excerpt(value: string, query: string, maxLength = 220): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const positionalValue = positionalSearchValue(clean);
  const positionalQuery = positionalSearchValue(query.trim());
  const firstToken = positionalQuery.split(/\s+/).find(Boolean) ?? "";
  const matchIndex = positionalValue.indexOf(positionalQuery);
  const fallbackIndex = firstToken ? positionalValue.indexOf(firstToken) : -1;
  const center = matchIndex >= 0 ? matchIndex : Math.max(fallbackIndex, 0);
  let start = Math.max(0, center - Math.floor(maxLength * 0.38));
  let end = Math.min(clean.length, start + maxLength);

  if (start > 0) {
    const nextSpace = clean.indexOf(" ", start);
    if (nextSpace >= 0 && nextSpace < center) start = nextSpace + 1;
  }
  if (end < clean.length) {
    const previousSpace = clean.lastIndexOf(" ", end);
    if (previousSpace > center) end = previousSpace;
  }

  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

function matchesType(entry: SearchIndexEntry, type: EntityTypeFilter): boolean {
  if (type === "all") return true;
  return entry.kind === "entity" && entry.entity_type === type;
}

function firstPreviewPassage(entry: SearchIndexEntry, locale: Locale): SearchPassage | null {
  return (
    entry.passages[locale].find(
      (passage) => passage.kind === "content" && passage.depth === "foundation",
    ) ??
    entry.passages[locale].find((passage) => passage.kind === "content") ??
    entry.passages[locale][0] ??
    null
  );
}

export function searchKnowledge(
  entries: SearchIndexEntry[],
  query: string,
  type: EntityTypeFilter = "all",
  locale: Locale = "nl",
): KnowledgeSearchResult[] {
  const normalizedQuery = normalizeSearchValue(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return entries
    .filter((entry) => matchesType(entry, type))
    .flatMap((entry): KnowledgeSearchResult[] => {
      if (!normalizedQuery) {
        const passage = firstPreviewPassage(entry, locale);
        return [
          {
            entry,
            score: 0,
            match_kind: "metadata",
            passage,
            anchor: null,
            snippet: passage ? excerpt(passage.text, "") : null,
          },
        ];
      }

      const metadata = metadataScore(entry, normalizedQuery, locale);
      const passageMatches = entry.passages[locale]
        .map((passage) => ({ passage, match: passageScore(passage, normalizedQuery, tokens) }))
        .filter(
          (
            candidate,
          ): candidate is {
            passage: SearchPassage;
            match: NonNullable<ReturnType<typeof passageScore>>;
          } => candidate.match !== null,
        )
        .sort((left, right) => right.match.score - left.match.score);
      const bestPassage = passageMatches[0];

      if (metadata === 0 && !bestPassage) return [];
      if (metadata >= (bestPassage?.match.score ?? 0)) {
        const passage = firstPreviewPassage(entry, locale);
        return [
          {
            entry,
            score: metadata,
            match_kind: "metadata",
            passage,
            anchor: null,
            snippet: passage ? excerpt(passage.text, normalizedQuery) : null,
          },
        ];
      }

      return [
        {
          entry,
          score: bestPassage.match.score,
          match_kind: bestPassage.match.kind,
          passage: bestPassage.passage,
          anchor: bestPassage.passage.block_id,
          snippet: excerpt(bestPassage.passage.text, normalizedQuery),
        },
      ];
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        searchEntryTitle(left.entry, locale).localeCompare(
          searchEntryTitle(right.entry, locale),
          locale,
          { sensitivity: "base" },
        ),
    );
}
