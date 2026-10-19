import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "XTRIKE Recovery Desk | Ransomware Decryption, Clean-Room & Forensic Recovery — Platform 17",
  description:
    "Deterministic 5-Pillar Ransomware Incident Response, FRE 901 Evidence Custody, Cryptographic Key Analysis, and Immutable ZFS/S3 Clean-Room Restoration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <DeveloperAssistAgent />
      </body>
    </html>
  );
}
