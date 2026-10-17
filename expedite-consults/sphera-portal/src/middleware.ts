import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // If visitor arrives at root from connectln.vercel.app or connectin domain, send straight to /connectin
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    if (host.includes("connectln") || host.includes("connectin")) {
      url.pathname = "/connectin";
    } else {
      url.pathname = "/feed";
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
