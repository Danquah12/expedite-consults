import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "IaC Security Platform", template: "%s | IaC Security" },
  description: "Scan Terraform, CloudFormation, Pulumi, and Ansible infrastructure code for security misconfigurations before deployment. Shift security left into your CI/CD pipeline.",
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
