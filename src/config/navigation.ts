import type { Locale } from "@/content/model";
import { localizedHref } from "@/i18n/routing";
export interface NavigationItem {
  href: string;
  label: string;
  activePrefixes: string[];
}

export function isNavigationItemCurrent(item: NavigationItem, pathname: string) {
  pathname = pathname.replace(/^\/nl(?=\/|$)/, "") || "/";
  return item.activePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const PRIMARY_NAVIGATION: NavigationItem[] = [
  {
    href: "/explore",
    label: "Ontdekken",
    activePrefixes: [
      "/explore",
      "/regions",
      "/appellations",
      "/sites",
      "/producers",
      "/grapes",
      "/vintages",
      "/classifications",
      "/concepts",
    ],
  },
  { href: "/learn", label: "Leren", activePrefixes: ["/learn"] },
  { href: "/atlas", label: "Atlas", activePrefixes: ["/atlas"] },
];

export const SEARCH_NAVIGATION_ITEM: NavigationItem = {
  href: "/search",
  label: "Zoeken",
  activePrefixes: ["/search"],
};

export const UTILITY_NAVIGATION: NavigationItem[] = [
  SEARCH_NAVIGATION_ITEM,
  { href: "/about", label: "Over Oenocademy", activePrefixes: ["/about"] },
];

export function localizedNavigation(items: NavigationItem[], locale: Locale): NavigationItem[] {
  const english: Record<string, string> = {
    "/explore": "Explore",
    "/learn": "Learn",
    "/atlas": "Atlas",
    "/search": "Search",
    "/about": "About Oenocademy",
  };
  return items.map((item) => ({
    ...item,
    label: locale === "nl" ? item.label : english[item.href],
    href: localizedHref(item.href, locale),
    activePrefixes: item.activePrefixes.map((path) => localizedHref(path, locale)),
  }));
}
