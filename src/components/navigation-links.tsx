"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/config/navigation";

interface NavigationLinksProps {
  items: NavigationItem[];
  onNavigate?: () => void;
}

export function NavigationLinks({ items, onNavigate }: NavigationLinksProps) {
  const pathname = usePathname();

  return items.map((item) => {
    const isCurrent = item.activePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    return (
      <Link
        aria-current={isCurrent ? "page" : undefined}
        className={isCurrent ? "nav-link-active" : undefined}
        href={item.href}
        key={item.href}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  });
}
