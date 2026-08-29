import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM Threat Modeling | STRIDE, DFD & Attack Tree Simulation",
  description: "Next-generation Threat Modeling with automated Data Flow Diagram synthesis, STRIDE risk identification, and MITRE ATT&CK / CAPEC alignment.",
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
