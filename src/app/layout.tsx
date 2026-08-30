import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND, SITE_URL } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
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
      <body>
        <a className="skip-link" href="#main-content">
          Ga naar de inhoud
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
