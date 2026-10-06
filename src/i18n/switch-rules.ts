import type { Locale } from "@/content/model";
import { localizedHref } from "./routing";

/** Only small route identities cross the server/client boundary, never article content. */
export interface LanguageSwitchRules {
  lessonPaths: Record<string, string[]>;
  discovery: Record<string, { contexts: string[]; initials: Record<Locale, string[]> }>;
  searchTypes: string[];
}

export function languageSwitchHref(
  pathname: string,
  query: URLSearchParams,
  targetLocale: Locale,
  rules: LanguageSwitchRules,
): string {
  const path = localizedHref(pathname, "nl");
  const retained = new URLSearchParams();
  const single = (key: string) => (query.getAll(key).length === 1 ? query.get(key)! : "");
  if (path === "/search") {
    if (single("q")) retained.set("q", single("q"));
    if (rules.searchTypes.includes(single("type"))) retained.set("type", single("type"));
  } else if (rules.discovery[path]) {
    const category = rules.discovery[path];
    if (single("q")) retained.set("q", single("q"));
    if (category.contexts.includes(single("context"))) retained.set("context", single("context"));
    const initial = single("initial").toLocaleUpperCase(targetLocale);
    if (category.initials[targetLocale].includes(initial)) retained.set("initial", initial);
  } else if (rules.lessonPaths[path]?.includes(single("path"))) {
    retained.set("path", single("path"));
  }
  return `${localizedHref(path, targetLocale)}${retained.size ? `?${retained}` : ""}`;
}
