import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Container Security Platform", template: "%s | Container Security" },
  description: "Scan Docker images and container registries for CVEs, misconfigurations, exposed secrets, and malware. Layer-by-layer vulnerability analysis powered by Trivy, Grype, and Syft.",
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
