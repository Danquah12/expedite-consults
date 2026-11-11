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
  themeColor: "#1C1916",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://conectln.com"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ConnectLn",
  },
  formatDetection: {
    telephone: false,
  },
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
      { url: "/brand/connectln-icon.png?v=5", sizes: "114x114", type: "image/png" },
      { url: "/brand/connectln-icon-256.png?v=5", sizes: "256x256", type: "image/png" },
      { url: "/favicon.ico?v=5" }
    ],
    shortcut: "/brand/connectln-icon.png?v=5",
    apple: "/brand/connectln-icon.png?v=5",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://conectln.com",
    siteName: "ConnectLn",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams.",
    images: [
      {
        url: "https://conectln.com/api/connectin/share-card?t=ConnectLn+%E2%80%94+Tickets%2C+vouches%2C+and+real+work",
        width: 1200,
        height: 630,
        alt: "ConnectLn — Tickets, vouches, and real work",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work.",
    images: ["https://conectln.com/api/connectin/share-card?t=ConnectLn+%E2%80%94+Tickets%2C+vouches%2C+and+real+work"],
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
        <link rel="icon" type="image/png" sizes="256x256" href="/brand/connectln-icon-256.png?v=5" />
        <link rel="icon" type="image/png" sizes="114x114" href="/brand/connectln-icon.png?v=5" />
        <link rel="shortcut icon" href="/brand/connectln-icon.png?v=5" />
        <link rel="apple-touch-icon" href="/brand/connectln-icon.png?v=5" />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
