import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const { pathname } = url;
  if (pathname === "/api" || pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();
  url.pathname = `/nl${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|media/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
