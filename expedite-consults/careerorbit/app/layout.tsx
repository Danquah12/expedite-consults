import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "CareerOrbit — Your Career, In Orbit",
  description:
    "AI-powered career platform with smart job matching, professional networking, and orbit intelligence. Find your perfect role with 97% match accuracy.",
  keywords: "jobs, career, AI matching, professional network, resume, orbit, job search",
  openGraph: {
    title: "CareerOrbit — Your Career, In Orbit",
    description: "AI-powered career platform with smart job matching and orbit intelligence.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
