import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND, SITE_URL } from "@/config/brand";
import { LocaleProvider } from "@/i18n/locale-context";
import { pageLocale } from "@/i18n/server";
import type { Metadata } from "next";
import "../globals.css";

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const locale = await pageLocale(params);
  return {
    metadataBase: SITE_URL,
    applicationName: BRAND.name,
    title: {
      default: `${BRAND.name} — ${BRAND.tagline[locale]}`,
      template: `%s | ${BRAND.name}`,
    },
    description: BRAND.description[locale],
    openGraph: {
      type: "website",
      locale: locale === "nl" ? "nl_NL" : "en_US",
      siteName: BRAND.name,
      title: BRAND.name,
      description: BRAND.description[locale],
    },
    twitter: {
      card: "summary",
      title: BRAND.name,
      description: BRAND.description[locale],
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "nl" }, { lang: "en" }];
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await pageLocale(params);
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <a className="skip-link" href="#main-content">
            {locale === "nl" ? "Ga naar de inhoud" : "Skip to content"}
          </a>
          <SiteHeader locale={locale} />
          {children}
          <SiteFooter locale={locale} />
        </LocaleProvider>
      </body>
    </html>
  );
}
