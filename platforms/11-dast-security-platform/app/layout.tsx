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
  themeColor: "#f2ede4",
};

export const metadata: Metadata = {
  title: { default: "TrePath™ — DAST & Web Interface Security Platform", template: "%s | TrePath™ DAST" },
  description: "Dynamic Application Security Testing (DAST) & Web Interface Security Assessment Platform powered by TrePath™ and TrePath™ with visual exploitation evidence and automated reporting.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TrePath DAST",
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

