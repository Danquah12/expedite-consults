import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetrieverSync | UMBC Digital Campus",
  description: "Official digital campus operating system for UMBC Retrievers.",
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
