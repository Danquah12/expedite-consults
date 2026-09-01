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
  title: {
    default: "SpheraNet — Sovereign Social Network & Campus Graph",
    template: "%s | SpheraNet",
  },
  description:
    "SpheraNet is a next-generation decentralized social network: Universal Feed, 4K Reels, SpheraChat Messenger, Local Bazaar, Verified Skill Passport, Campus OS, and Esports Arena.",
  keywords: [
    "SpheraNet",
    "social network",
    "sphera",
    "decentralized social",
    "marketplace",
    "reels",
    "career",
    "Expedite Consults",
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
