"use client";
import { useLocale } from "@/i18n/locale-context";
import { localizedHref } from "@/i18n/routing";
import Link from "next/link";

export default function NotFound() {
  const locale = useLocale();
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <div className="page-intro">
        <p className="eyebrow">{locale === "nl" ? "Niet gevonden" : "Not found"}</p>
        <h1>{locale === "nl" ? "Deze pagina bestaat niet." : "This page does not exist."}</h1>
        <div className="page-intro-copy">
          <p>
            {locale === "nl"
              ? "We kunnen de pagina die je zoekt niet vinden."
              : "We could not find the page you are looking for."}
          </p>
          <Link className="text-link" href={localizedHref("/explore", locale)}>
            {locale === "nl" ? "Ga naar Ontdekken →" : "Go to Explore →"}{" "}
          </Link>
        </div>
      </div>
    </main>
  );
}
