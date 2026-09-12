import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeaGullSync | Salisbury University Digital Campus",
  description: "Official digital campus operating system for Salisbury University Sea Gulls.",
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
