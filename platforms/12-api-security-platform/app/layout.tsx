import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "API Workstation", template: "%s | API Workstation" },
  description: "Professional API testing and security platform — request builder, collections, environments, runner, and built-in OWASP API Top 10 security scanner.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "var(--background)", color: "var(--foreground)", display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
