import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Secrets Security Platform", template: "%s | Secrets Platform" },
  description: "Detect, validate, and remediate exposed secrets, API keys, credentials, and private keys across your entire codebase, git history, CI/CD, and container images.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {children}
      </body>
    </html>
  );
}
