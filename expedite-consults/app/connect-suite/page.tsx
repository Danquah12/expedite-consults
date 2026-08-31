import type { Metadata } from "next";
import AxiomConnectWorkspace from "@/components/connect-suite/AxiomConnectWorkspace";

export const metadata: Metadata = {
  title: "Axiom Connect — Unified Communications Workspace",
  description: "Unified business communications platform integrating Zoho-style Mail, Outlook Calendar, and Microsoft Teams-style Video Meetings.",
};

export default function ConnectSuitePage() {
  return (
    <AxiomConnectWorkspace
      initialApp="mail"
      currentUserName="Kwesi Asiedu"
      currentUserEmail="kwesi@expediteconsults.com"
      currentUserRole="Lead Architect"
    />
  );
}
