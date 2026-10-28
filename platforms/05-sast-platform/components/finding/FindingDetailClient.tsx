"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FindingHeader, { type AuthoritativeProofStatus } from "@/components/finding/FindingHeader";
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
import DeepExploitabilityPanel from "@/components/finding/DeepExploitabilityPanel";
import FINDINGS from "@/data/findings";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";
import type { SASTFinding } from "@/types/sast";

function deriveInitialProofStatus(f: SASTFinding): AuthoritativeProofStatus {
  if (f.status === "Resolved" || f.proofState === "MITIGATED_BY_GUARD") {
    return "False Positive";
  }
  if (f.proofState === "NEEDS_MANUAL_VALIDATION" || f.cwe === "CWE-798") {
    return "Inconclusive";
  }
  if (
    f.proofState === "DETECTED_STATIC" ||
    f.cwe === "CWE-327" ||
    f.cwe === "CWE-328" ||
    f.cwe === "CWE-330"
  ) {
    return "Static Candidate";
  }
  if (f.proofState === "RUNTIME_REPRODUCED") {
    return "Runtime Reproduced";
  }
  if (f.proofState === "IMPACT_CONFIRMED") {
    return "Impact Confirmed";
  }
  return "Dataflow Confirmed";
}

export default function FindingDetailClient({ id }: { id: string }) {
  const [finding, setFinding] = useState<SASTFinding | null>(() => {
    const session = loadActiveScanSession();
    const liveMatch = session?.sastFindings?.find((f) => f.id === id);
    if (liveMatch) return liveMatch;
    return FINDINGS.find((f) => f.id === id) || null;
  });
  const [proofStatus, setProofStatus] = useState<AuthoritativeProofStatus>("Dataflow Confirmed");
  const [runtimeReproduced, setRuntimeReproduced] = useState<boolean>(false);
  const [mitigationVerified, setMitigationVerified] = useState<boolean>(false);

  useEffect(() => {
    const syncFinding = () => {
      let resolvedFinding: SASTFinding | null = null;
      const session = loadActiveScanSession();
      const liveMatch = session?.sastFindings?.find((f) => f.id === id);
      if (liveMatch) {
        resolvedFinding = liveMatch;
      } else {
        const staticMatch = FINDINGS.find((f) => f.id === id);
        if (staticMatch) {
          resolvedFinding = staticMatch;
        } else if (session?.sastFindings && session.sastFindings.length > 0) {
          resolvedFinding = session.sastFindings[0];
        } else {
          resolvedFinding = FINDINGS[0];
        }
      }

      if (resolvedFinding) {
        setFinding(resolvedFinding);
        const initialStatus = deriveInitialProofStatus(resolvedFinding);
        setProofStatus(initialStatus);
        setRuntimeReproduced(
          initialStatus === "Runtime Reproduced" || initialStatus === "Impact Confirmed"
        );
        setMitigationVerified(initialStatus === "False Positive");
      }
    };

    syncFinding();
    window.addEventListener("storage", syncFinding);
    window.addEventListener("xtrike-scan-updated", syncFinding);
    window.addEventListener("xtrike-scan-cleared", syncFinding);
    return () => {
      window.removeEventListener("storage", syncFinding);
      window.removeEventListener("xtrike-scan-updated", syncFinding);
      window.removeEventListener("xtrike-scan-cleared", syncFinding);
    };
  }, [id]);

  const handleProofStatusChange = (nextStatus: AuthoritativeProofStatus) => {
    setProofStatus(nextStatus);
    setRuntimeReproduced(
      nextStatus === "Runtime Reproduced" || nextStatus === "Impact Confirmed"
    );
    if (nextStatus === "False Positive") {
      setMitigationVerified(true);
    } else {
      setMitigationVerified(false);
    }
  };

  const handleRunRuntimeProbe = () => {
    setRuntimeReproduced(true);
    setMitigationVerified(false);
    setProofStatus("Runtime Reproduced");
  };

  const handleMitigationVerified = () => {
    setMitigationVerified(true);
    setProofStatus("False Positive");
  };

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
            <FindingHeader
              finding={finding}
              proofStatus={proofStatus}
              onProofStatusChange={handleProofStatusChange}
              runtimeReproduced={runtimeReproduced}
              mitigationVerified={mitigationVerified}
            />
            <DeepExploitabilityPanel finding={finding} />
            <AIExplanation finding={finding} />
            <ChallengeAgent finding={finding} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6 min-w-0">
                <ExecutiveSummary
                  finding={finding}
                  proofStatus={proofStatus}
                  runtimeReproduced={runtimeReproduced}
                />
                <EvidencePanel
                  finding={finding}
                  proofStatus={proofStatus}
                  runtimeReproduced={runtimeReproduced}
                  mitigationVerified={mitigationVerified}
                  onRunRuntimeProbe={handleRunRuntimeProbe}
                />
                <DiffRemediation
                  finding={finding}
                  mitigationVerified={mitigationVerified}
                  onMitigationVerified={handleMitigationVerified}
                />
                <ValidationSteps finding={finding} />
              </div>

              <div className="space-y-6 min-w-0">
                <AttackPath
                  finding={finding}
                  proofStatus={proofStatus}
                  runtimeReproduced={runtimeReproduced}
                />
                <ExploitabilityScore
                  finding={finding}
                  proofStatus={proofStatus}
                  runtimeReproduced={runtimeReproduced}
                  mitigationVerified={mitigationVerified}
                />
                <ConfidenceBreakdown
                  finding={finding}
                  proofStatus={proofStatus}
                  runtimeReproduced={runtimeReproduced}
                  mitigationVerified={mitigationVerified}
                />
                <ComplianceMapping finding={finding} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
