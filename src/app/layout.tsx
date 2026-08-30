import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinaria — Begrijp wijn van wortel tot glas",
  description: "Een rustig opgebouwd kennisplatform voor wijnliefhebbers die verder willen leren.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
