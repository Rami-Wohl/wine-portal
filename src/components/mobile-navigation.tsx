"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PRIMARY_NAVIGATION, UTILITY_NAVIGATION } from "@/config/navigation";
import { NavigationLinks } from "./navigation-links";

export function MobileNavigation() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openMenu() {
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  function handleClosed() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="mobile-navigation">
      <Link className="mobile-search-link" href="/search">
        Zoeken
      </Link>
      <button
        aria-controls="mobile-navigation-dialog"
        aria-expanded={isOpen}
        className="mobile-menu-trigger"
        onClick={openMenu}
        ref={triggerRef}
        type="button"
      >
        <span>Menu</span>
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M3 6h14M3 14h14" />
        </svg>
      </button>

      <dialog
        aria-labelledby="mobile-navigation-title"
        className="mobile-navigation-dialog"
        id="mobile-navigation-dialog"
        onCancel={() => setIsOpen(false)}
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
              <span aria-hidden="true">×</span>
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
