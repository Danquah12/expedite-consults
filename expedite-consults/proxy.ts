import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — protects all CR portal routes.
 *
 * Rules:
 * - /login          → public (always accessible)
 * - /api/auth/*     → public (NextAuth internals)
 * - /portal/*       → requires any authenticated session
 * - /dashboard/*    → requires session with role === "manager"
 * - /api/cr/*       → requires session (API protection)
 */
export default auth((req) => {
	const { nextUrl, auth: session } = req as any;
	const pathname = nextUrl.pathname;

	// Always allow NextAuth internal routes, login page, and token-authenticated routes
	if (
		pathname.startsWith("/api/auth") ||
		pathname === "/login" ||
		pathname.startsWith("/review") ||           // token-authenticated review page
		pathname.startsWith("/api/cr/vote") ||      // token-authenticated vote endpoint
		pathname === "/api/cr/cron"                 // allow cron from Vercel without session
	) {
		return NextResponse.next();
	}

	// Protected zones — redirect to login if not authenticated
	const isPortalRoute    = pathname.startsWith("/portal");
	const isDashboardRoute = pathname.startsWith("/dashboard");
	const isCRApiRoute     = pathname.startsWith("/api/cr");

	if ((isPortalRoute || isDashboardRoute || isCRApiRoute) && !session) {
		const loginUrl = new URL("/login", nextUrl.origin);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Dashboard is manager-only
	if (isDashboardRoute && session?.user) {
		const role = (session.user as any).role;
		if (role !== "manager") {
			// Redirect non-managers back to their portal
			return NextResponse.redirect(new URL("/portal", nextUrl.origin));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/portal/:path*",
		"/dashboard/:path*",
		"/api/cr/:path*",
		"/login",
	],
};
