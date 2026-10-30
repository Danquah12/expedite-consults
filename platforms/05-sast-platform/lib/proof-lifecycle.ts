import type { SASTFinding } from "@/types/sast";

/**
 * Proof lifecycle: 7 independent proof milestones with explicit prerequisites.
 * Each milestone reports both a 5-state verdict (PASSED | FAILED | BLOCKED | NOT_RUN | NOT_APPLICABLE)
 * and a backward-compatible status. Milestones are evaluated independently rather than as a single
 * mutually exclusive label so a finding can have e.g. DATAFLOW_VALIDATED=PASSED, GUARD_EVALUATED=PASSED,
 * PATH_VALIDATED=PASSED, RUNTIME_REPRODUCED=NOT_RUN, and REMEDIATION_VERIFIED=NOT_RUN simultaneously.
 */
export type LifecycleStageId =
  | "DISCOVERED"
  | "DATAFLOW_VALIDATED"
  | "GUARD_EVALUATED"
  | "PATH_VALIDATED"
  | "RUNTIME_REPRODUCED"
  | "IMPACT_VERIFIED"
  | "REMEDIATION_VERIFIED";

export type MilestoneVerdict =
  | "PASSED"
  | "FAILED"
  | "BLOCKED"
  | "NOT_RUN"
  | "NOT_APPLICABLE";

export interface LifecycleStage {
  stage: LifecycleStageId;
  status: "ACHIEVED" | "NOT_ACHIEVED" | "NOT_APPLICABLE" | "BLOCKED" | "NOT_RUN";
  verdict: MilestoneVerdict;
  prerequisites: LifecycleStageId[];
  evidence: string;
}

export interface ProofLifecycle {
  stages: LifecycleStage[];
  /** List of all milestones that have independently achieved PASSED. */
  achievedMilestones: LifecycleStageId[];
  /** Highest contiguous milestone reached with every earlier applicable milestone achieved. */
  maturity: LifecycleStageId;
  nextRequiredStage: LifecycleStageId | null;
}

const ORDER: LifecycleStageId[] = [
  "DISCOVERED",
  "DATAFLOW_VALIDATED",
  "GUARD_EVALUATED",
  "PATH_VALIDATED",
  "RUNTIME_REPRODUCED",
  "IMPACT_VERIFIED",
  "REMEDIATION_VERIFIED",
];

export interface ExecutionRecordValidationEnvelope {
  findingId: string;
  expectedFindingId: string;
  record?: {
    kind: "RUNTIME_REPRODUCTION" | "IMPACT_VERIFICATION" | "PATCH_EXECUTION" | "REGRESSION_TEST";
    executedAt: string;
    expiresAt?: string;
    environment: string;
    artifactSha256: string;
    expectedArtifactSha256?: string;
    artifactModifiedAfterSeal?: boolean;
    result: "PASS" | "FAIL";
  } | null;
  referenceTimeIso?: string;
}

export interface EvidenceValidatorTestCaseResult {
  caseId: string;
  scenario: string;
  expectedOutcome: "ACCEPTED" | "REJECTED_FAIL_CLOSED";
  actualOutcome: "ACCEPTED" | "REJECTED_FAIL_CLOSED";
  passed: boolean;
  rejectionReason: string;
}

/**
 * Fail-closed validator for runtime/patch execution records (AT-EVIDENCE-14).
 * Rejects missing records, mismatched finding IDs, tampered timestamps, expired records,
 * malformed/mismatched SHA-256 digests, and post-seal modified artifacts.
 */
export function validateExecutionRecordStrict(
  env: ExecutionRecordValidationEnvelope
): { accepted: boolean; reason: string } {
  if (!env.record) {
    return { accepted: false, reason: "MISSING_EXECUTION_RECORD: Fail-closed — no execution record attached." };
  }
  if (!env.findingId || env.findingId !== env.expectedFindingId) {
    return {
      accepted: false,
      reason: `MISMATCHED_FINDING_ID: Record bound to '${env.findingId}' does not match finding '${env.expectedFindingId}'.`,
    };
  }
  const r = env.record;
  if (!/^[0-9a-f]{64}$/i.test(r.artifactSha256 || "")) {
    return {
      accepted: false,
      reason: "MALFORMED_ARTIFACT_HASH: artifactSha256 is not a valid 64-hex SHA-256 digest.",
    };
  }
  if (r.expectedArtifactSha256 && r.artifactSha256.toLowerCase() !== r.expectedArtifactSha256.toLowerCase()) {
    return {
      accepted: false,
      reason: "INCORRECT_ARTIFACT_HASH: Computed artifact SHA-256 does not match sealed ledger digest.",
    };
  }
  if (r.artifactModifiedAfterSeal) {
    return {
      accepted: false,
      reason: "MODIFIED_EXECUTION_ARTIFACT: Artifact payload was mutated after cryptographic sealing.",
    };
  }
  const execMs = Date.parse(r.executedAt);
  const refMs = Date.parse(env.referenceTimeIso || "2026-10-30T16:00:00Z");
  if (Number.isNaN(execMs) || execMs <= 0 || execMs > refMs + 60_000) {
    return {
      accepted: false,
      reason: `TAMPERED_TIMESTAMP: Execution timestamp '${r.executedAt}' is invalid or in the future relative to audit clock.`,
    };
  }
  if (r.expiresAt) {
    const expMs = Date.parse(r.expiresAt);
    if (Number.isNaN(expMs) || expMs < refMs) {
      return {
        accepted: false,
        reason: `EXPIRED_EXECUTION_RECORD: Record expired at '${r.expiresAt}' prior to audit verification.`,
      };
    }
  }
  if (!r.environment || r.environment.trim().length <= 2) {
    return { accepted: false, reason: "INVALID_ENVIRONMENT: Execution environment identifier is missing." };
  }
  if (r.result !== "PASS") {
    return { accepted: false, reason: "EXECUTION_RESULT_FAILED: Execution record reported FAIL." };
  }
  return { accepted: true, reason: "ACCEPTED: Cryptographic hash, timestamp, expiry, and finding binding verified." };
}

/**
 * Runs the 7-case adversarial fail-closed self-test suite for AT-EVIDENCE-14 so the evidence
 * validator is actively tested even when a static scan has 0 live sandbox execution records.
 */
export function runEvidenceValidatorSelfTestSuite(): {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  cases: EvidenceValidatorTestCaseResult[];
} {
  const validSha = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
  const otherSha = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const refClock = "2026-10-30T16:00:00Z";

  const rawCases: {
    caseId: string;
    scenario: string;
    expected: "ACCEPTED" | "REJECTED_FAIL_CLOSED";
    envelope: ExecutionRecordValidationEnvelope;
  }[] = [
    {
      caseId: "EV-TEST-01",
      scenario: "Valid execution record with matching SHA-256, finding ID, and active timestamp",
      expected: "ACCEPTED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2026-10-30T15:55:00Z",
          expiresAt: "2026-11-30T15:55:00Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: validSha,
          expectedArtifactSha256: validSha,
          result: "PASS",
        },
      },
    },
    {
      caseId: "EV-TEST-02",
      scenario: "Missing execution record (null record on runtime claim)",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: null,
      },
    },
    {
      caseId: "EV-TEST-03",
      scenario: "Modified execution artifact after cryptographic seal",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2026-10-30T15:55:00Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: validSha,
          expectedArtifactSha256: validSha,
          artifactModifiedAfterSeal: true,
          result: "PASS",
        },
      },
    },
    {
      caseId: "EV-TEST-04",
      scenario: "Expired execution record (TTL elapsed prior to release gate check)",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2026-09-01T10:00:00Z",
          expiresAt: "2026-10-01T10:00:00Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: validSha,
          expectedArtifactSha256: validSha,
          result: "PASS",
        },
      },
    },
    {
      caseId: "EV-TEST-05",
      scenario: "Incorrect artifact SHA-256 hash (digest mismatch against ledger)",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2026-10-30T15:55:00Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: otherSha,
          expectedArtifactSha256: validSha,
          result: "PASS",
        },
      },
    },
    {
      caseId: "EV-TEST-06",
      scenario: "Mismatched finding ID (replay of SAST-002 artifact onto SAST-001)",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-002",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2026-10-30T15:55:00Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: validSha,
          expectedArtifactSha256: validSha,
          result: "PASS",
        },
      },
    },
    {
      caseId: "EV-TEST-07",
      scenario: "Tampered / future / malformed execution timestamp",
      expected: "REJECTED_FAIL_CLOSED",
      envelope: {
        findingId: "SAST-001",
        expectedFindingId: "SAST-001",
        referenceTimeIso: refClock,
        record: {
          kind: "RUNTIME_REPRODUCTION",
          executedAt: "2099-12-31T23:59:59Z",
          environment: "xtrike-ephemeral-sandbox-v5",
          artifactSha256: validSha,
          expectedArtifactSha256: validSha,
          result: "PASS",
        },
      },
    },
  ];

  const cases: EvidenceValidatorTestCaseResult[] = rawCases.map((c) => {
    const res = validateExecutionRecordStrict(c.envelope);
    const actualOutcome: "ACCEPTED" | "REJECTED_FAIL_CLOSED" = res.accepted
      ? "ACCEPTED"
      : "REJECTED_FAIL_CLOSED";
    return {
      caseId: c.caseId,
      scenario: c.scenario,
      expectedOutcome: c.expected,
      actualOutcome,
      passed: actualOutcome === c.expected,
      rejectionReason: res.reason,
    };
  });

  const passedCount = cases.filter((c) => c.passed).length;
  return {
    allPassed: passedCount === cases.length,
    passedCount,
    totalCount: cases.length,
    cases,
  };
}

export function isValidVerificationRecord(r: NonNullable<SASTFinding["verificationRecords"]>[number]): boolean {
  return (
    /^[0-9a-f]{64}$/i.test(r.artifactSha256 || "") &&
    !Number.isNaN(Date.parse(r.executedAt)) &&
    Boolean(r.environment && r.environment.trim().length > 2)
  );
}

export function computeProofLifecycle(f: SASTFinding): ProofLifecycle {
  const records = (f.verificationRecords || []).filter(isValidVerificationRecord);
  const rec = (kind: NonNullable<SASTFinding["verificationRecords"]>[number]["kind"]) =>
    records.find((r) => r.kind === kind && r.result === "PASS");
  const failRec = (kind: NonNullable<SASTFinding["verificationRecords"]>[number]["kind"]) =>
    records.find((r) => r.kind === kind && r.result === "FAIL");

  const isTaintClass = f.evidenceType === "TAINT_DATAFLOW" || !f.evidenceType;
  const ip = f.interprocedural;
  const isSynthetic = f.sourceProvenance?.status === "SYNTHETIC_TEMPLATE";

  const discovered: LifecycleStage = isSynthetic
    ? {
        stage: "DISCOVERED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites: [],
        evidence: `${f.cwe} architectural candidate hypothesis generated for ${f.file}:${f.line} (SYNTHETIC_TEMPLATE)`,
      }
    : {
        stage: "DISCOVERED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites: [],
        evidence: `${f.cwe} matched and verified in repository source at ${f.file}:${f.line}`,
      };

  const dataflow: LifecycleStage = (() => {
    const prerequisites: LifecycleStageId[] = ["DISCOVERED"];
    if (!isTaintClass) {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "NOT_APPLICABLE",
        verdict: "NOT_APPLICABLE",
        prerequisites,
        evidence: `${f.evidenceType} evidence is evaluated by guard/config inspection rather than taint dataflow`,
      };
    }
    if (isSynthetic) {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "BLOCKED",
        verdict: "BLOCKED",
        prerequisites,
        evidence: "Blocked: candidate template file is not present in scanned source tree",
      };
    }
    if (ip?.status === "ESTABLISHED") {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites,
        evidence: `${ip.steps.length}-step trace${ip.crossesFunctions ? ` across ${ip.functionChain.join(" → ")}` : " within one function"}`,
      };
    }
    if (ip?.status === "NOT_ESTABLISHED") {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "NOT_ACHIEVED",
        verdict: "FAILED",
        prerequisites,
        evidence: ip.note || "engine could not connect untrusted source to sink",
      };
    }
    if (f.proofState === "DATAFLOW_CONFIRMED") {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites,
        evidence: "intra-procedural source-to-sink dataflow confirmed in scanned method",
      };
    }
    return {
      stage: "DATAFLOW_VALIDATED",
      status: "NOT_ACHIEVED",
      verdict: "NOT_RUN",
      prerequisites,
      evidence: "cross-module call-graph confirmation not yet run",
    };
  })();

  const guard: LifecycleStage = {
    stage: "GUARD_EVALUATED",
    status: f.controlDominanceSummary ? "ACHIEVED" : "NOT_RUN",
    verdict: f.controlDominanceSummary ? "PASSED" : "NOT_RUN",
    prerequisites: ["DISCOVERED"],
    evidence: f.controlDominanceSummary
      ? f.controlDominanceSummary.slice(0, 160)
      : "no control-dominance analysis recorded",
  };

  const path: LifecycleStage = (() => {
    const prerequisites: LifecycleStageId[] = ["DISCOVERED", "DATAFLOW_VALIDATED"];
    if (!isTaintClass) {
      return {
        stage: "PATH_VALIDATED",
        status: "NOT_APPLICABLE",
        verdict: "NOT_APPLICABLE",
        prerequisites: ["DISCOVERED"],
        evidence: `${f.evidenceType} evidence is evaluated by guard/config dominance rather than path constraints`,
      };
    }
    const pf = ip?.pathFeasibility;
    if (!pf) {
      if (dataflow.verdict === "FAILED" || dataflow.verdict === "BLOCKED") {
        return {
          stage: "PATH_VALIDATED",
          status: "BLOCKED",
          verdict: "BLOCKED",
          prerequisites,
          evidence: "Blocked upstream: source-to-sink dataflow prerequisite not satisfied",
        };
      }
      return {
        stage: "PATH_VALIDATED",
        status: "NOT_RUN",
        verdict: "NOT_RUN",
        prerequisites,
        evidence: "no path-feasibility solver result attached",
      };
    }
    if (pf.status === "FEASIBLE") {
      return {
        stage: "PATH_VALIDATED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites,
        evidence: pf.reason,
      };
    }
    if (pf.status === "INFEASIBLE") {
      return {
        stage: "PATH_VALIDATED",
        status: "NOT_ACHIEVED",
        verdict: "FAILED",
        prerequisites,
        evidence: `INFEASIBLE: ${pf.reason}`,
      };
    }
    return {
      stage: "PATH_VALIDATED",
      status: "NOT_ACHIEVED",
      verdict: "BLOCKED",
      prerequisites,
      evidence: `${pf.status}: ${pf.reason}`,
    };
  })();

  const runtimeRec = rec("RUNTIME_REPRODUCTION");
  const runtimeFail = failRec("RUNTIME_REPRODUCTION");
  const impactRec = rec("IMPACT_VERIFICATION");
  const impactFail = failRec("IMPACT_VERIFICATION");
  const patchRec = rec("PATCH_EXECUTION");
  const regRec = rec("REGRESSION_TEST");
  const patchFail = failRec("PATCH_EXECUTION") || failRec("REGRESSION_TEST");

  const upstreamBlocked =
    isSynthetic ||
    f.proofState === "MITIGATED_BY_GUARD" ||
    (isTaintClass && (dataflow.verdict === "FAILED" || dataflow.verdict === "BLOCKED")) ||
    ip?.pathFeasibility?.status === "INFEASIBLE";

  const runtimeStage: LifecycleStage = runtimeRec
    ? {
        stage: "RUNTIME_REPRODUCED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites: ["DISCOVERED", "DATAFLOW_VALIDATED", "PATH_VALIDATED"],
        evidence: `${runtimeRec.environment} @ ${runtimeRec.executedAt} (sha256 ${runtimeRec.artifactSha256.slice(0, 12)}…)`,
      }
    : runtimeFail
      ? {
          stage: "RUNTIME_REPRODUCED",
          status: "NOT_ACHIEVED",
          verdict: "FAILED",
          prerequisites: ["DISCOVERED", "DATAFLOW_VALIDATED", "PATH_VALIDATED"],
          evidence: `Sandbox reproduction attempt failed in ${runtimeFail.environment}`,
        }
      : upstreamBlocked
        ? {
            stage: "RUNTIME_REPRODUCED",
            status: "BLOCKED",
            verdict: "BLOCKED",
            prerequisites: ["DISCOVERED", "DATAFLOW_VALIDATED", "PATH_VALIDATED"],
            evidence: "Blocked until upstream source provenance, dataflow, and path feasibility prerequisites are satisfied",
          }
        : {
            stage: "RUNTIME_REPRODUCED",
            status: "NOT_RUN",
            verdict: "NOT_RUN",
            prerequisites: ["DISCOVERED", "DATAFLOW_VALIDATED", "PATH_VALIDATED"],
            evidence: "Not executed — STATIC_ONLY mode (awaiting Expedite Strike sandbox harness)",
          };

  const impactStage: LifecycleStage = impactRec
    ? {
        stage: "IMPACT_VERIFIED",
        status: "ACHIEVED",
        verdict: "PASSED",
        prerequisites: ["RUNTIME_REPRODUCED"],
        evidence: `${impactRec.environment} @ ${impactRec.executedAt}`,
      }
    : impactFail
      ? {
          stage: "IMPACT_VERIFIED",
          status: "NOT_ACHIEVED",
          verdict: "FAILED",
          prerequisites: ["RUNTIME_REPRODUCED"],
          evidence: `Impact verification failed in ${impactFail.environment}`,
        }
      : !runtimeRec
        ? {
            stage: "IMPACT_VERIFIED",
            status: "BLOCKED",
            verdict: "BLOCKED",
            prerequisites: ["RUNTIME_REPRODUCED"],
            evidence: "Blocked: requires RUNTIME_REPRODUCED prerequisite before impact verification",
          }
        : {
            stage: "IMPACT_VERIFIED",
            status: "NOT_RUN",
            verdict: "NOT_RUN",
            prerequisites: ["RUNTIME_REPRODUCED"],
            evidence: "No stored impact-verification record",
          };

  const remediationStage: LifecycleStage =
    patchRec && regRec
      ? {
          stage: "REMEDIATION_VERIFIED",
          status: "ACHIEVED",
          verdict: "PASSED",
          prerequisites: ["DISCOVERED"],
          evidence: `Patch compiled and regression test passed (${patchRec.executedAt})`,
        }
      : patchFail
        ? {
            stage: "REMEDIATION_VERIFIED",
            status: "NOT_ACHIEVED",
            verdict: "FAILED",
            prerequisites: ["DISCOVERED"],
            evidence: `Patch compilation or regression test failed (${patchFail.executedAt})`,
          }
        : {
            stage: "REMEDIATION_VERIFIED",
            status: "NOT_RUN",
            verdict: "NOT_RUN",
            prerequisites: ["DISCOVERED"],
            evidence: `Static ${f.remediation?.[0]?.platform || f.language} remediation diff generated; compiler & regression harness NOT_RUN`,
          };

  const stages: LifecycleStage[] = [
    discovered,
    dataflow,
    guard,
    path,
    runtimeStage,
    impactStage,
    remediationStage,
  ];

  const achievedMilestones = stages
    .filter((s) => s.verdict === "PASSED")
    .map((s) => s.stage);

  let maturity: LifecycleStageId = "DISCOVERED";
  for (const id of ORDER) {
    const s = stages.find((x) => x.stage === id)!;
    if (s.status === "ACHIEVED" || s.status === "NOT_APPLICABLE") {
      if (s.status === "ACHIEVED") maturity = id;
    } else break;
  }
  const next = ORDER.find((id) => {
    const s = stages.find((x) => x.stage === id)!;
    return s.status === "NOT_ACHIEVED" || s.status === "BLOCKED" || s.status === "NOT_RUN";
  });
  return { stages, achievedMilestones, maturity, nextRequiredStage: next ?? null };
}
