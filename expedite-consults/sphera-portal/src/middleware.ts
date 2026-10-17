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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const userAgent = request.headers.get("user-agent") || "";

  // 1. Social Crawler & Link Preview Handler (WhatsApp, iMessage, Twitter, Facebook, LinkedIn)
  // Ensures 100% reliable OG preview tags without RSC streaming delay or missing tags
  if (isCrawler(userAgent)) {
    const rawUrl = request.url;
    const isConnectInRoute = pathname.includes("connectin") || pathname.includes("connectln") || host.includes("connectln");
    
    const pageTitle = isConnectInRoute
      ? "ConnectLn — Tickets, vouches, and real work"
      : "ConnectLn — Sovereign Social Network & Campus Graph";
    const pageDesc = isConnectInRoute
      ? "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams."
      : "The zero-trust professional network. Tickets, vouches, and real work.";

    const staticOgHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <link rel="canonical" href="${rawUrl}" />

  <!-- OpenGraph / WhatsApp / Facebook -->
  <meta property="og:site_name" content="ConnectLn" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${rawUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  
  <!-- Primary Square OG Image for WhatsApp & Chat Apps -->
  <meta property="og:image" content="https://connectln.vercel.app/brand/connectln-square-og.png" />
  <meta property="og:image:secure_url" content="https://connectln.vercel.app/brand/connectln-square-og.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:image:alt" content="ConnectLn Emblem — Tickets, vouches, and real work" />

  <!-- Wide OG Image for Twitter / LinkedIn / Slack -->
  <meta property="og:image" content="https://connectln.vercel.app/brand/connectln-og.png" />
  <meta property="og:image:secure_url" content="https://connectln.vercel.app/brand/connectln-og.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <meta name="twitter:image" content="https://connectln.vercel.app/brand/connectln-og.png" />

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="256x256" href="https://connectln.vercel.app/brand/connectln-icon-256.png" />
  <link rel="shortcut icon" href="https://connectln.vercel.app/brand/connectln-icon.png" />
  <link rel="apple-touch-icon" href="https://connectln.vercel.app/brand/connectln-icon.png" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #121110; color: #f2ede4; padding: 40px; text-align: center;">
  <div style="max-width: 500px; margin: 0 auto;">
    <img src="https://connectln.vercel.app/brand/connectln-icon-256.png" width="96" height="96" alt="ConnectLn" style="border-radius: 20px; margin-bottom: 20px;" />
    <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">${pageTitle}</h1>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">${pageDesc}</p>
    <a href="${rawUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 28px; background: #c2593f; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 14px;">Open ConnectLn</a>
  </div>
</body>
</html>`;

    return new NextResponse(staticOgHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  // 2. Normal User Routing
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
  matcher: ["/((?!api|_next/static|_next/image|brand/|favicon.ico).*)"],
};
