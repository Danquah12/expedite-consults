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
    title: "NexaCircle",
  },
  formatDetection: {
    telephone: false,
  },
  title: {
    default: "NexaCircle — Your Circle for Real Work, Calls & Growth",
    template: "%s | NexaCircle",
  },
  description:
    "NexaCircle: Your Circle for Real Work, Free Internet Voice/Video Calls, Peer Vouches, and Career Growth.",
  keywords: [
    "NexaCircle",
    "Nexa",
    "ConnectLn",
    "Your Circle for Real Work Calls and Growth",
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
    siteName: "NexaCircle",
    title: "NexaCircle — Your Circle for Real Work, Calls & Growth",
    description: "NexaCircle: Your Circle for Real Work, Free Internet Voice/Video Calls, Peer Vouches, and Career Growth.",
    images: [
      {
        url: "https://conectln.com/api/connectin/share-card?t=NexaCircle+%E2%80%94+Your+Circle+for+Real+Work%2C+Calls+%26+Growth",
        width: 1200,
        height: 630,
        alt: "NexaCircle — Your Circle for Real Work, Calls & Growth",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexaCircle — Your Circle for Real Work, Calls & Growth",
    description: "NexaCircle: Your Circle for Real Work, Free Internet Voice/Video Calls, Peer Vouches, and Career Growth.",
    images: ["https://conectln.com/api/connectin/share-card?t=NexaCircle+%E2%80%94+Your+Circle+for+Real+Work%2C+Calls+%26+Growth"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
