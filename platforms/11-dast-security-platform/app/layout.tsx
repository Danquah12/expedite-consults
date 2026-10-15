import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#090d16",
};

export const metadata: Metadata = {
  title: { default: "SAST-2 VERSION-DAST: AXIOM Security Intelligence (Version 2)", template: "%s | SAST-2 VERSION-DAST" },
  description: "AXIOM is an automated web security intelligence platform with an AI-powered engine brain, intercepting proxy, active scanner, evidence engine, and enterprise reporting.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EXPEDITE STRIKE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} app-shell-body`}
        style={{ background: "var(--bg)", color: "var(--fg)", display: "flex", height: "100dvh", overflow: "hidden" }}>
        <Sidebar />
        <main className="app-shell-main" style={{ flex: 1, height: "100dvh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", minWidth: 0, WebkitOverflowScrolling: "touch" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

