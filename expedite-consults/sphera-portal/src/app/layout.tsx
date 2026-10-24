import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#00d4ff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://connectln.vercel.app"),
  title: {
    default: "ConnectLn — Tickets, vouches, and real work",
    template: "%s | ConnectLn",
  },
  description:
    "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams.",
  keywords: [
    "ConnectLn",
    "ConnectIn",
    "Tickets vouches real work",
    "zero-trust professional network",
    "Expedite Consults",
    "ASPM",
    "cybersecurity",
    "trades"
  ],
  icons: {
    icon: [
      { url: "/brand/connectln-icon.png", sizes: "114x114", type: "image/png" },
      { url: "/brand/connectln-icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/brand/connectln-icon.png",
    apple: "/brand/connectln-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.connectln.app",
    siteName: "ConnectLn",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams.",
    images: [
      {
        url: "https://www.connectln.app/brand/connectln-og.png?v=connectln5",
        width: 1200,
        height: 630,
        alt: "ConnectLn Video Telemetry & Profile Card",
      },
      {
        url: "https://www.connectln.app/brand/connectln-square-og.png?v=connectln5",
        width: 600,
        height: 600,
        alt: "ConnectLn Profile & Telemetry Card",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work.",
    images: ["https://www.connectln.app/brand/connectln-og.png?v=connectln5"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta property="og:site_name" content="ConnectLn" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ConnectLn — Tickets, vouches, and real work" />
        <meta property="og:description" content="ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams." />
        <meta property="og:image" content="https://www.connectln.app/brand/connectln-og.png?v=connectln5" />
        <meta property="og:image:secure_url" content="https://www.connectln.app/brand/connectln-og.png?v=connectln5" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ConnectLn Video Telemetry & Profile Card" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ConnectLn — Tickets, vouches, and real work" />
        <meta name="twitter:description" content="ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work." />
        <meta name="twitter:image" content="https://www.connectln.app/brand/connectln-og.png?v=connectln5" />
        <link rel="icon" type="image/png" sizes="256x256" href="https://www.connectln.app/brand/connectln-icon-256.png" />
        <link rel="shortcut icon" href="https://www.connectln.app/brand/connectln-icon.png" />
        <link rel="apple-touch-icon" href="https://www.connectln.app/brand/connectln-icon.png" />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
