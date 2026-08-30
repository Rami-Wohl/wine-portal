import Link from "next/link";
import { BRAND } from "@/config/brand";
import { LogoMark } from "./logo-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/" className="brand">
        <LogoMark />
        <span>{BRAND.name}</span>
      </Link>
      <p>{BRAND.tagline.nl}</p>
    </footer>
  );
}
