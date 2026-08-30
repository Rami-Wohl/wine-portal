import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: BRAND.name,
  title: {
    default: `${BRAND.name} — ${BRAND.tagline.nl}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline.nl,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.tagline.nl,
  },
  twitter: {
    card: "summary",
    title: BRAND.name,
    description: BRAND.tagline.nl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
