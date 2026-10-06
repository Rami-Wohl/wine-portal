import { BRAND } from "@/config/brand";
import type { Locale } from "@/content/model";
import { localizedHref } from "@/i18n/routing";
import Link from "next/link";
import { LogoMark } from "./logo-mark";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <Link href={localizedHref("/", locale)} className="brand">
        <LogoMark />
        <span>{BRAND.name}</span>
      </Link>
      <p>{BRAND.tagline[locale]}</p>
    </footer>
  );
}
