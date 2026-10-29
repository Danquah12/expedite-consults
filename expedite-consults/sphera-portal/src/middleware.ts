import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CRAWLER_USER_AGENTS = [
  "whatsapp",
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "telegrambot",
  "applebot",
  "bingbot",
  "googlebot",
  "discordbot",
  "skypeuripreview"
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((bot) => ua.includes(bot));
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const userAgent = request.headers.get("user-agent") || "";

  // 1. Social Crawler & Link Preview Handler (WhatsApp, iMessage, Twitter, Facebook, LinkedIn)
  if (isCrawler(userAgent)) {
    const rawUrl = request.url;
    const isConnectInRoute = pathname.includes("connectin") || pathname.includes("connectln") || host.includes("connectln");

    let pageTitle = isConnectInRoute
      ? "ConnectLn — Tickets, vouches, and real work"
      : "ConnectLn — Sovereign Social Network & Campus Graph";
    let pageDesc = isConnectInRoute
      ? "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams."
      : "The zero-trust professional network. Tickets, vouches, and real work.";
    let ogImageUrl = `https://www.connectln.app/api/connectin/share-card?t=${encodeURIComponent(pageTitle)}`;

    // Dynamic preview card for shared Wheel videos / posts (/connectin/share)
    if (pathname.startsWith("/connectin/share")) {
      const name = searchParams.get("n") || "";
      const title = (searchParams.get("t") || "ConnectLn Masterclass").replace(/ — Career Masterclass.*$/i, "");
      const plate = searchParams.get("d") || searchParams.get("plate") || "";
      const p = searchParams.get("p") || "";
      pageTitle = "ConnectLn — Tickets, vouches, and real work";
      pageDesc = "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams.";
      const imgParams = new URLSearchParams({ n: name, t: title, plate, p, cb: "2" });
      ogImageUrl = `https://www.connectln.app/api/connectin/share-card?${imgParams.toString()}`;
    } else if (pathname.startsWith("/share/message")) {
      // Dynamic preview card for shared chat messages (/share/message)
      const author = searchParams.get("author") || "ConnectLn Member";
      const role = searchParams.get("role") || "Verified ConnectLn Professional";
      const text = searchParams.get("text") || "Shared message from ConnectLn";
      const avatar = searchParams.get("avatar") || "";
      const sharedBy = searchParams.get("sharedBy") || "";
      const p = searchParams.get("p") || "";
      pageTitle = `ConnectLn — ${author}: "${text.slice(0, 70)}${text.length > 70 ? "…" : ""}"`;
      pageDesc = `${role} · ${text.slice(0, 180)}`;
      const imgParams = new URLSearchParams({ author, role, text, avatar, sharedBy, p });
      ogImageUrl = `https://www.connectln.app/api/connectin/share-card/image?${imgParams.toString()}`;
    }

    const staticOgHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(pageDesc)}" />
  <link rel="canonical" href="${esc(rawUrl)}" />

  <!-- OpenGraph / WhatsApp / Facebook / LinkedIn -->
  <meta property="og:site_name" content="ConnectLn" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(rawUrl)}" />
  <meta property="og:title" content="${esc(pageTitle)}" />
  <meta property="og:description" content="${esc(pageDesc)}" />

  <!-- Dynamic OG Image showing the actual sharer's photo or initials badge + ConnectLn logo -->
  <meta property="og:image" content="${esc(ogImageUrl)}" />
  <meta property="og:image:secure_url" content="${esc(ogImageUrl)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(pageTitle)}" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageTitle)}" />
  <meta name="twitter:description" content="${esc(pageDesc)}" />
  <meta name="twitter:image" content="${esc(ogImageUrl)}" />

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="256x256" href="https://www.connectln.app/brand/connectln-icon-256.png" />
  <link rel="shortcut icon" href="https://www.connectln.app/brand/connectln-icon.png" />
  <link rel="apple-touch-icon" href="https://www.connectln.app/brand/connectln-icon.png" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #121110; color: #f2ede4; padding: 40px; text-align: center;">
  <div style="max-width: 500px; margin: 0 auto;">
    <img src="https://www.connectln.app/brand/connectln-icon-256.png" width="96" height="96" alt="ConnectLn" style="border-radius: 20px; margin-bottom: 20px;" />
    <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">${esc(pageTitle)}</h1>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">${esc(pageDesc)}</p>
    <a href="${esc(rawUrl)}" style="display: inline-block; margin-top: 20px; padding: 12px 28px; background: #c2593f; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 14px;">Open ConnectLn</a>
  </div>
</body>
</html>`;

    return new NextResponse(staticOgHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }

  // 2. Normal User Routing
  if (pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/connectin-login";
    return NextResponse.redirect(url);
  }

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
  matcher: ["/((?!api|_next/static|_next/image|brand/|favicon.ico).*)"],
};
