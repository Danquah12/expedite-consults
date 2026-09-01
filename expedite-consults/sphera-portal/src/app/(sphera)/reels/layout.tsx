import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sphera Reels",
  description: "Short vertical videos from creators you love",
};

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
