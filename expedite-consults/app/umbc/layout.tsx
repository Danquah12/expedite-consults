import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RetrieverSync | UMBC Digital Campus",
  description: "Official autonomous digital campus operating system for UMBC Retrievers.",
};

export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="w-full min-h-screen bg-slate-950 text-slate-100">{children}</section>;
}
