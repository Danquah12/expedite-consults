import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConnectLn DevHub — Engineering Control Plane (v1.0)",
  description:
    "Standalone Internal Developer Platform & Engineering Control Center for ConnectLn — Isolated from Production (connectln.app)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
