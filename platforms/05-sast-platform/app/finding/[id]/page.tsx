import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FindingHeader      from "@/components/finding/FindingHeader";
import ExecutiveSummary   from "@/components/finding/ExecutiveSummary";
import EvidencePanel      from "@/components/finding/EvidencePanel";
import AttackPath         from "@/components/finding/AttackPath";
import ExploitabilityScore from "@/components/finding/ExploitabilityScore";
import ConfidenceBreakdown from "@/components/finding/ConfidenceBreakdown";
import ComplianceMapping  from "@/components/finding/ComplianceMapping";
import DiffRemediation    from "@/components/finding/DiffRemediation";
import ValidationSteps    from "@/components/finding/ValidationSteps";
import AIExplanation      from "@/components/finding/AIExplanation";
import ChallengeAgent     from "@/components/finding/ChallengeAgent";
import FINDINGS           from "@/data/findings";

export async function generateStaticParams() {
  return FINDINGS.map(f => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const finding = FINDINGS.find(f => f.id === id);
  if (!finding) return { title: "Finding Not Found" };
  return {
    title: `${finding.id} — ${finding.title}`,
    description: finding.executiveSummary,
  };
}

export default async function FindingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const finding = FINDINGS.find(f => f.id === id);
  if (!finding) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <FindingHeader finding={finding} />

            {/* AI Explanation — full width, prominent */}
            <AIExplanation finding={finding} />

            {/* Next-Gen AI Challenge Agent (False-Positive Solver) */}
            <ChallengeAgent finding={finding} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main — left 2 cols */}
              <div className="lg:col-span-2 space-y-6">
                <ExecutiveSummary finding={finding} />
                <EvidencePanel    finding={finding} />
                {/* Diff remediation replaces old Remediation */}
                <DiffRemediation  finding={finding} />
                <ValidationSteps  finding={finding} />
              </div>

              {/* Sidebar — right col */}
              <div className="space-y-6">
                <AttackPath          finding={finding} />
                <ExploitabilityScore finding={finding} />
                <ConfidenceBreakdown finding={finding} />
                <ComplianceMapping   finding={finding} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
