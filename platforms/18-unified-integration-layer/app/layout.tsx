import type { Metadata } from "next";
import "./globals.css";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM Unified Integration Layer | Global Security Mesh",
  description: "Cross-platform threat defense bridge federating all 19 AXIOM and Aegis enterprise platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased">
        <main className="flex-1">
          {children}
        </main>
        <DeveloperAssistAgent />
      </body>
    </html>
  );
}
