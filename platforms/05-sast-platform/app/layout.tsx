import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SAST Platform — Static Application Security Testing",
    template: "%s | SAST Platform",
  },
  description:
    "Enterprise-grade Static Application Security Testing powered by CodeQL, Semgrep, Joern, and AI-driven false positive reduction. Find vulnerabilities before attackers do.",
  keywords: [
    "SAST", "static analysis", "application security", "CodeQL", "Semgrep",
    "vulnerability scanning", "AppSec", "OWASP", "security testing", "DevSecOps",
  ],
  openGraph: {
    title: "SAST Platform — Find Vulnerabilities Before Attackers Do",
    description: "Multi-engine static analysis with graph-backed exploitability validation and near-zero false positives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        {children}
      </body>
    </html>
  );
}
