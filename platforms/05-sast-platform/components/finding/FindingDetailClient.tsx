"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FindingHeader from "@/components/finding/FindingHeader";
import ExecutiveSummary from "@/components/finding/ExecutiveSummary";
import EvidencePanel from "@/components/finding/EvidencePanel";
import AttackPath from "@/components/finding/AttackPath";
import ExploitabilityScore from "@/components/finding/ExploitabilityScore";
import ConfidenceBreakdown from "@/components/finding/ConfidenceBreakdown";
import ComplianceMapping from "@/components/finding/ComplianceMapping";
import DiffRemediation from "@/components/finding/DiffRemediation";
import ValidationSteps from "@/components/finding/ValidationSteps";
import AIExplanation from "@/components/finding/AIExplanation";
import ChallengeAgent from "@/components/finding/ChallengeAgent";
import FINDINGS from "@/data/findings";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";
import type { SASTFinding } from "@/types/sast";

export default function FindingDetailClient({ id }: { id: string }) {
  const [finding, setFinding] = useState<SASTFinding | null>(() => {
    return FINDINGS.find((f) => f.id === id) || null;
  });

  useEffect(() => {
    const staticMatch = FINDINGS.find((f) => f.id === id);
    if (staticMatch) {
      setFinding(staticMatch);
      return;
    }
    const session = loadActiveScanSession();
    const liveMatch = session?.sastFindings?.find((f) => f.id === id);
    if (liveMatch) {
      setFinding(liveMatch);
    } else if (session?.sastFindings && session.sastFindings.length > 0) {
      setFinding(session.sastFindings[0]);
    } else {
      setFinding(FINDINGS[0]);
    }
  }, [id]);

  if (!finding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            Loading finding {id}...
          </div>
          <Link href="/dashboard" style={{ color: "#8b4528", fontSize: 13, fontWeight: 700 }}>
            &larr; Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-8 pb-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <FindingHeader finding={finding} />
            <AIExplanation finding={finding} />
            <ChallengeAgent finding={finding} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6 min-w-0">
                <ExecutiveSummary finding={finding} />
                <EvidencePanel finding={finding} />
                <DiffRemediation finding={finding} />
                <ValidationSteps finding={finding} />
              </div>

              <div className="space-y-6 min-w-0">
                <AttackPath finding={finding} />
                <ExploitabilityScore finding={finding} />
                <ConfidenceBreakdown finding={finding} />
                <ComplianceMapping finding={finding} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
