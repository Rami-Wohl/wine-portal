import { BRAND } from "@/config/brand";
import { localizedNavigation, PRIMARY_NAVIGATION, UTILITY_NAVIGATION } from "@/config/navigation";
import type { Locale } from "@/content/model";
import { localizedHref } from "@/i18n/routing";
import { getLanguageSwitchRules } from "@/i18n/switch-rules-server";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo-mark";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationLinks } from "./navigation-links";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-header">
      <Link href={localizedHref("/", locale)} className="brand" aria-label={`${BRAND.name}, home`}>
        <LogoMark />
        <span>{BRAND.name}</span>
      </Link>
      <nav className="site-nav" aria-label={locale === "nl" ? "Hoofdnavigatie" : "Main navigation"}>
        <NavigationLinks items={localizedNavigation(PRIMARY_NAVIGATION, locale)} />
      </nav>
      <div className="site-actions">
        <nav
          className="utility-nav"
          aria-label={locale === "nl" ? "Aanvullende navigatie" : "Additional navigation"}
        >
          <NavigationLinks items={localizedNavigation(UTILITY_NAVIGATION, locale)} />
        </nav>
        <LanguageSwitcher rules={getLanguageSwitchRules()} />
        <MobileNavigation />
      </div>
    </header>
  );
}
