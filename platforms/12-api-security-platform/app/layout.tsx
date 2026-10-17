import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DeveloperAssistAgent } from "@/components/DeveloperAssistAgent";

export const metadata: Metadata = {
  title: "AXIOM API | OWASP API Security & BOLA/BFLA Protection Platform",
  description: "Next-generation API security platform with BOLA/IDOR matrix testing, BFLA admin bypass detection, and OpenAPI/Postman fuzzing.",
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
