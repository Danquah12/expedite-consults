import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM Unified Executive Cyber Command Center | Global Ecosystem Launchpad",
  description: "Federated executive single-pane command center integrating all 16 Expedite & AXIOM cybersecurity platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* Sticky Global Topbar */}
        <Navbar />

        {/* Workspace Body with Sidebar & Content */}
        <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 56px)", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "20px 24px", overflowY: "auto", minWidth: 0, height: "calc(100vh - 56px)" }}>
            {children}
          </main>
        </div>

        {/* AI Integration Copilot */}
        <DeveloperAssistAgent />
      </body>
    </html>
  );
}
