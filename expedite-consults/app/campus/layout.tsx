import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CampusSync | College Community Hub",
  description: "Connect with student clubs, explore campus events, find study groups, and stay updated with campus life.",
};

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
