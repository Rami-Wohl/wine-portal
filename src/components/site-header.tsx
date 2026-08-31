import Link from "next/link";
import { BRAND } from "@/config/brand";
import { PRIMARY_NAVIGATION, UTILITY_NAVIGATION } from "@/config/navigation";
import { LogoMark } from "./logo-mark";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationLinks } from "./navigation-links";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${BRAND.name}, home`}>
        <LogoMark />
        <span>{BRAND.name}</span>
      </Link>
      <nav className="site-nav" aria-label="Hoofdnavigatie">
        <NavigationLinks items={PRIMARY_NAVIGATION} />
      </nav>
      <nav className="utility-nav" aria-label="Aanvullende navigatie">
        <NavigationLinks items={UTILITY_NAVIGATION} />
      </nav>
      <MobileNavigation />
    </header>
  );
}
