"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isNavigationItemCurrent,
  type NavigationItem,
} from "@/config/navigation";

interface NavigationLinksProps {
  items: NavigationItem[];
  onNavigate?: () => void;
}

export function NavigationLinks({ items, onNavigate }: NavigationLinksProps) {
  const pathname = usePathname();

  return items.map((item) => {
    const isCurrent = isNavigationItemCurrent(item, pathname);

    return (
      <Link
        aria-current={isCurrent ? "page" : undefined}
        className={`nav-link${isCurrent ? " nav-link-active" : ""}`}
        href={item.href}
        key={item.href}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  });
}
