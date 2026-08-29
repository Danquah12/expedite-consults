import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SAST-2 VERSION-DAST: AXIOM Security Intelligence (Version 2)", template: "%s | SAST-2 VERSION-DAST" },
  description: "AXIOM is an automated web security intelligence platform with an AI-powered engine brain, intercepting proxy, active scanner, evidence engine, and enterprise reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "var(--bg)", color: "var(--fg)", display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
