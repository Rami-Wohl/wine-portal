export interface NavigationItem {
  href: string;
  label: string;
  activePrefixes: string[];
}

export function isNavigationItemCurrent(item: NavigationItem, pathname: string) {
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
