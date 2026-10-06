import type { Locale } from "@/content/model";

export const locales = ["nl", "en"] as const;
export function isLocale(value: string): value is Locale {
  return value === "nl" || value === "en";
}

/** Public Dutch URLs have no prefix; English uses the same path under /en. */
export function localizedHref(path: string, locale: Locale = "nl"): string {
  const unprefixed = path.replace(/^\/(?:nl|en)(?=\/|[?#]|$)/, "") || "/";
  const suffix = unprefixed.startsWith("/") ? unprefixed : `/${unprefixed}`;
  return locale === "en" ? `/en${suffix === "/" ? "" : suffix}` : suffix;
}

export type RouteQuery = Record<string, string | string[] | undefined>;

/** Redirects retain duplicates and put query data before an embedded owner anchor. */
export function withRouteQuery(href: string, query: RouteQuery): string {
  const [path, hash] = href.split("#");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      params.append(key, item);
    }
  }
  return `${path}${params.size ? `?${params}` : ""}${hash ? `#${hash}` : ""}`;
}

export function languageAlternates(path: string, locale: Locale) {
  path = path.split(/[?#]/)[0];
  return {
    canonical: localizedHref(path, locale),
    languages: {
      nl: localizedHref(path, "nl"),
      en: localizedHref(path, "en"),
      "x-default": localizedHref(path, "nl"),
    },
  };
}
