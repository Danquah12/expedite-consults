import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TerpSync | University of Maryland, College Park Digital Campus",
  description: "Official autonomous digital campus operating system for UMD Terrapins.",
};

export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="w-full min-h-screen bg-slate-950 text-slate-100">{children}</section>;
}
