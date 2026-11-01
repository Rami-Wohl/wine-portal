import type { Locale } from "@/content/model";

/**
 * Alphabetical order of area names for readers: per language, ignoring a leading
 * "AOP "/"AOC " so "AOP Médoc" sorts under M. Its own module so client code (map-view.ts) does
 * not pull the bilingual copy into its chunk.
 */
export function compareAreaNames(locale: Locale) {
  const collator = new Intl.Collator(locale === "nl" ? "nl-NL" : "en-GB");
  const key = (name: string) => name.replace(/^(AOP|AOC)\s+/i, "");
  return (left: string, right: string) => collator.compare(key(left), key(right));
}
