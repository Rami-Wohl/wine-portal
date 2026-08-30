import Link from "next/link";
import { BRAND } from "@/config/brand";
import { LogoMark } from "./logo-mark";

const primaryNavigation = [
  { href: "/explore", label: "Ontdekken" },
  { href: "/learn", label: "Leren" },
  { href: "/atlas", label: "Atlas" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={`${BRAND.name}, home`}>
        <LogoMark />
        <span>{BRAND.name}</span>
      </Link>
      <nav className="site-nav" aria-label="Hoofdnavigatie">
        {primaryNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="utility-nav" aria-label="Aanvullende navigatie">
        <Link href="/search">Zoeken</Link>
        <Link href="/about">Over Oenocademy</Link>
      </nav>
    </header>
  );
}
