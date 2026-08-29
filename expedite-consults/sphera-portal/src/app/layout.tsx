import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Expedite Consults Portal — Your Digital Ecosystem",
  description:
    "Access all Expedite Consults products and Sphera platform modules from one stunning portal. Cybersecurity, SkillHands, Sphera Social, and more.",
  keywords: [
    "Expedite Consults",
    "Sphera",
    "SkillHands",
    "Cybersecurity",
    "Portal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
