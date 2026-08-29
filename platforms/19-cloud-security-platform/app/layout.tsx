import type { Metadata } from "next";
import "./globals.css";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM Cloud | CNAPP & Multi-Cloud Graph Security Platform",
  description: "Next-generation Cloud Native Application Protection Platform (CNAPP) with CSPM, CIEM, and CWPP across AWS, Azure, GCP, and Kubernetes.",
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
