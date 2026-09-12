import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerpSync | University of Maryland, College Park Digital Campus",
  description: "Official digital campus operating system for UMD Terrapins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
