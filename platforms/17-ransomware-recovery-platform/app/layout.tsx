import type { Metadata } from "next";
import "./globals.css";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "Aegis Recovery | Ransomware Decryption & Forensic Recovery Platform",
  description: "Next-generation Ransomware Incident Response and Disaster Recovery platform.",
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
