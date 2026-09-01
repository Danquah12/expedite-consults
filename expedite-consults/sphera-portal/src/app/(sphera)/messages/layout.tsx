import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpheraChat",
  description: "Encrypted messaging on Sphera",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
