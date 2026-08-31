export const BRAND = {
  name: "Oenocademy",
  tagline: {
    nl: "Navigeer door de wereld van wijn.",
    en: "Navigate the world of wine.",
  },
  description: {
    nl: "Oenocademy is een meertalig kennisplatform voor wijn, met gestructureerde leerpaden en ruimte om vrij te verkennen.",
    en: "Oenocademy is a multilingual wine knowledge platform for structured learning and free exploration.",
  },
} as const;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);
