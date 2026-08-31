import type { Metadata } from "next";
import AxiomConnectWorkspace from "@/components/connect-suite/AxiomConnectWorkspace";

export const metadata: Metadata = {
  title: "Axiom Connect — Enterprise Mail, Calendar & Teams Suite",
  description: "Unified business communications platform integrating Zoho-style Mail, Outlook Calendar, and Microsoft Teams-style Video Meetings.",
};

export default function MailPage() {
  return (
    <AxiomConnectWorkspace
      initialApp="mail"
      currentUserName="Kwesi Asiedu"
      currentUserEmail="kwesi@towson.edu"
      currentUserRole="Student & Lead Architect"
    />
  );
}
