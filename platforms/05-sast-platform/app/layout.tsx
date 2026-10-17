import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM NG-SAST | Hybrid AST & Frontier AI Code Security Platform",
  description: "Next-generation Static Application Security Testing combining deterministic AST pattern matching with Frontier AI validation for zero false positives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <DeveloperAssistAgent />
      </body>
    </html>
  );
}
