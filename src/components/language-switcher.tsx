"use client";

import { useLocale } from "@/i18n/locale-context";
import { locales, localizedHref } from "@/i18n/routing";
import { languageSwitchHref, type LanguageSwitchRules } from "@/i18n/switch-rules";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function LanguageFlag({ language }: { language: "nl" | "en" }) {
  return (
    <span className="language-flag" aria-hidden="true">
      {language === "nl" ? "🇳🇱" : "🇬🇧"}
    </span>
  );
}

function LanguageLinks({ rules, query }: { rules: LanguageSwitchRules; query: URLSearchParams }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !disclosure.current?.contains(event.target)) {
        disclosure.current?.removeAttribute("open");
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, []);

  return (
    <details
      className="language-switcher"
      ref={disclosure}
      onKeyDown={(event) => {
        if (event.key === "Escape" && disclosure.current?.open) {
          event.preventDefault();
          disclosure.current.open = false;
          trigger.current?.focus({ preventScroll: true });
        }
      }}
    >
      <summary
        ref={trigger}
        aria-label={
          locale === "nl"
            ? "Taal kiezen, huidige taal: Nederlands"
            : "Choose language, current language: English"
        }
        title={locale === "nl" ? "Taal kiezen" : "Choose language"}
      >
        <LanguageFlag language={locale} />
        <span className="language-chevron" aria-hidden="true" />
      </summary>
      <nav aria-label={locale === "nl" ? "Taal" : "Language"} className="language-options">
        <p className="language-options-label">{locale === "nl" ? "Taal" : "Language"}</p>
        {locales.map((language) => {
          const href = languageSwitchHref(pathname, query, language, rules);
          return (
            <Link
              key={language}
              href={href}
              lang={language}
              hrefLang={language}
              aria-current={locale === language ? "true" : undefined}
              onNavigate={(event) => {
                event.preventDefault();
                disclosure.current?.removeAttribute("open");
                trigger.current?.focus({ preventScroll: true });
                router.push(`${href}${window.location.hash}`);
              }}
            >
              <LanguageFlag language={language} />
              <span>{language === "nl" ? "Nederlands" : "English"}</span>
              {locale === language && (
                <span className="language-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}

function QueryLanguageLinks({ rules }: { rules: LanguageSwitchRules }) {
  const query = useSearchParams();
  return <LanguageLinks rules={rules} query={new URLSearchParams(query.toString())} />;
}

export function LanguageSwitcher({ rules }: { rules: LanguageSwitchRules }) {
  const path = localizedHref(usePathname(), "nl");
  // These pages already render on request. Wait for their query instead of exposing
  // an empty-query streaming fallback that loses context before hydration or without JS.
  if (path === "/search" || rules.discovery[path] || rules.lessonPaths[path]) {
    return <QueryLanguageLinks rules={rules} />;
  }
  // Other pages discard query parameters and can keep their fully static header.
  return <LanguageLinks rules={rules} query={new URLSearchParams()} />;
}
