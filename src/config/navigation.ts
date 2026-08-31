export interface NavigationItem {
  href: string;
  label: string;
  activePrefixes: string[];
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

export const UTILITY_NAVIGATION: NavigationItem[] = [
  { href: "/search", label: "Zoeken", activePrefixes: ["/search"] },
  { href: "/about", label: "Over Oenocademy", activePrefixes: ["/about"] },
];
