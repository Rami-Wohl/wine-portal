import type { Locale } from "@/content/model";
import { notFound } from "next/navigation";
import { isLocale } from "./routing";

export type LocalePageProps = { params: Promise<{ lang: string }> };
export async function pageLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
