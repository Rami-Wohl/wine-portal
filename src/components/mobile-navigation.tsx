"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AnimationEvent, MouseEvent } from "react";
import {
  isNavigationItemCurrent,
  PRIMARY_NAVIGATION,
  SEARCH_NAVIGATION_ITEM,
  UTILITY_NAVIGATION,
} from "@/config/navigation";
import { NavigationLinks } from "./navigation-links";

type MenuState = "closed" | "open" | "closing";

export function MobileNavigation() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closingTimerRef = useRef<number | null>(null);
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<MenuState>("closed");
  const isOpen = menuState !== "closed";
  const isSearchCurrent = isNavigationItemCurrent(SEARCH_NAVIGATION_ITEM, pathname);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 861px)");

    function closeAtDesktop(event: MediaQueryListEvent) {
      if (event.matches && dialogRef.current?.open) {
        dialogRef.current.close();
      }
    }

    desktopQuery.addEventListener("change", closeAtDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeAtDesktop);
      if (closingTimerRef.current !== null) {
        window.clearTimeout(closingTimerRef.current);
      }
    };
  }, []);

  function openMenu() {
    if (!dialogRef.current || dialogRef.current.open) {
      return;
    }

    setMenuState("open");
    dialogRef.current.showModal();
  }

  function finishClose() {
    if (closingTimerRef.current !== null) {
      window.clearTimeout(closingTimerRef.current);
      closingTimerRef.current = null;
    }

    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }

  function closeMenu() {
    if (!dialogRef.current?.open || menuState === "closing") {
      return;
    }

    setMenuState("closing");
    closingTimerRef.current = window.setTimeout(finishClose, 450);
  }

  function handleClosed() {
    if (closingTimerRef.current !== null) {
      window.clearTimeout(closingTimerRef.current);
      closingTimerRef.current = null;
    }

    setMenuState("closed");
    triggerRef.current?.focus();
  }

  function handleAnimationEnd(event: AnimationEvent<HTMLDialogElement>) {
    if (
      menuState === "closing" &&
      event.target === dialogRef.current &&
      event.animationName === "mobile-navigation-out"
    ) {
      finishClose();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeMenu();
    }
  }

  return (
    <div className="mobile-navigation">
      <Link
        aria-label="Zoeken"
        aria-current={isSearchCurrent ? "page" : undefined}
        className="mobile-header-action mobile-search-link"
        href={SEARCH_NAVIGATION_ITEM.href}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <circle cx="8.5" cy="8.5" r="5.25" />
          <path d="m12.5 12.5 4 4" />
        </svg>
      </Link>
      <button
        aria-label="Navigatiemenu openen"
        aria-controls="mobile-navigation-dialog"
        aria-expanded={isOpen}
        className="mobile-header-action mobile-menu-trigger"
        onClick={openMenu}
        ref={triggerRef}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M3 6h14M3 14h14" />
        </svg>
      </button>

      <dialog
        aria-labelledby="mobile-navigation-title"
        className="mobile-navigation-dialog"
        data-state={menuState}
        id="mobile-navigation-dialog"
        onAnimationEnd={handleAnimationEnd}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={handleBackdropClick}
        onClose={handleClosed}
        ref={dialogRef}
      >
        <div className="mobile-navigation-sheet">
          <header>
            <p id="mobile-navigation-title">Navigatie</p>
            <button
              aria-label="Navigatiemenu sluiten"
              className="mobile-menu-close"
              onClick={closeMenu}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
          </header>
          <nav className="mobile-nav-primary" aria-label="Hoofdnavigatie mobiel">
            <NavigationLinks items={PRIMARY_NAVIGATION} onNavigate={closeMenu} />
          </nav>
          <nav className="mobile-nav-utility" aria-label="Aanvullende navigatie mobiel">
            <NavigationLinks items={UTILITY_NAVIGATION} onNavigate={closeMenu} />
          </nav>
        </div>
      </dialog>
    </div>
  );
}
