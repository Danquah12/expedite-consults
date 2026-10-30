import type { SASTFinding } from "@/types/sast";

/**
 * Proof lifecycle: a maturity dimension that is independent of the evidence category / canonical proof state.
 * A stage is ACHIEVED only when the finding carries the evidence that stage requires. Runtime, impact and
 * remediation stages require a stored verification record; an unexecuted claim can never reach them.
 */
export type LifecycleStageId =
  | "DISCOVERED"
  | "DATAFLOW_VALIDATED"
  | "GUARD_EVALUATED"
  | "PATH_VALIDATED"
  | "RUNTIME_REPRODUCED"
  | "IMPACT_VERIFIED"
  | "REMEDIATION_VERIFIED";

export interface LifecycleStage {
  stage: LifecycleStageId;
  status: "ACHIEVED" | "NOT_ACHIEVED" | "NOT_APPLICABLE" | "NOT_RUN";
  evidence: string;
}

export interface ProofLifecycle {
  stages: LifecycleStage[];
  /** Highest stage reached with every earlier applicable stage achieved. */
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

  const isTaintClass = f.evidenceType === "TAINT_DATAFLOW" || !f.evidenceType;
  const ip = f.interprocedural;

  const dataflow: LifecycleStage = (() => {
    if (!isTaintClass) {
      return { stage: "DATAFLOW_VALIDATED", status: "NOT_APPLICABLE", evidence: `${f.evidenceType} evidence is not a taint flow` };
    }
    if (ip?.status === "ESTABLISHED") {
      return {
        stage: "DATAFLOW_VALIDATED",
        status: "ACHIEVED",
        evidence: `${ip.steps.length}-step trace${ip.crossesFunctions ? ` across ${ip.functionChain.join(" → ")}` : " within one function"}`,
      };
    }
    if (ip?.status === "NOT_ESTABLISHED") {
      return { stage: "DATAFLOW_VALIDATED", status: "NOT_ACHIEVED", evidence: ip.note || "engine could not connect source to sink" };
    }
    if (f.proofState === "DATAFLOW_CONFIRMED") {
      return { stage: "DATAFLOW_VALIDATED", status: "ACHIEVED", evidence: "intra-procedural dataflow recorded by the scanner (no inter-procedural trace attached)" };
    }
    return { stage: "DATAFLOW_VALIDATED", status: "NOT_ACHIEVED", evidence: "no confirmed source-to-sink trace" };
  })();

  const guard: LifecycleStage = {
    stage: "GUARD_EVALUATED",
    status: f.controlDominanceSummary ? "ACHIEVED" : "NOT_ACHIEVED",
    evidence: f.controlDominanceSummary ? f.controlDominanceSummary.slice(0, 160) : "no control-dominance analysis recorded",
  };

  const path: LifecycleStage = (() => {
    const pf = ip?.pathFeasibility;
    if (!pf) return { stage: "PATH_VALIDATED", status: "NOT_ACHIEVED", evidence: "no path-feasibility result" } as LifecycleStage;
    if (pf.status === "FEASIBLE") return { stage: "PATH_VALIDATED", status: "ACHIEVED", evidence: pf.reason };
    return { stage: "PATH_VALIDATED", status: "NOT_ACHIEVED", evidence: `${pf.status}: ${pf.reason}` } as LifecycleStage;
  })();

  const runtimeRec = rec("RUNTIME_REPRODUCTION");
  const impactRec = rec("IMPACT_VERIFICATION");
  const patchRec = rec("PATCH_EXECUTION");
  const regRec = rec("REGRESSION_TEST");

  const stages: LifecycleStage[] = [
    { stage: "DISCOVERED", status: "ACHIEVED", evidence: `${f.cwe} matched at ${f.file}:${f.line}` },
    dataflow,
    guard,
    path,
    runtimeRec
      ? { stage: "RUNTIME_REPRODUCED", status: "ACHIEVED", evidence: `${runtimeRec.environment} @ ${runtimeRec.executedAt} (sha256 ${runtimeRec.artifactSha256.slice(0, 12)}…)` }
      : { stage: "RUNTIME_REPRODUCED", status: "NOT_RUN", evidence: "no stored sandbox execution record" },
    impactRec
      ? { stage: "IMPACT_VERIFIED", status: "ACHIEVED", evidence: `${impactRec.environment} @ ${impactRec.executedAt}` }
      : { stage: "IMPACT_VERIFIED", status: "NOT_RUN", evidence: "no stored impact-verification record" },
    patchRec && regRec
      ? { stage: "REMEDIATION_VERIFIED", status: "ACHIEVED", evidence: `patch executed and regression passed (${patchRec.executedAt})` }
      : { stage: "REMEDIATION_VERIFIED", status: "NOT_RUN", evidence: "patch not executed / regression not recorded" },
  ];

  let maturity: LifecycleStageId = "DISCOVERED";
  for (const id of ORDER) {
    const s = stages.find((x) => x.stage === id)!;
    if (s.status === "ACHIEVED" || s.status === "NOT_APPLICABLE") {
      if (s.status === "ACHIEVED") maturity = id;
    } else break;
  }
  const next = ORDER.find((id) => {
    const s = stages.find((x) => x.stage === id)!;
    return s.status === "NOT_ACHIEVED" || s.status === "NOT_RUN";
  });
  return { stages, maturity, nextRequiredStage: next ?? null };
}
