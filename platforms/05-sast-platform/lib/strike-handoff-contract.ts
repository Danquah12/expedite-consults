import type { SASTFinding } from "@/types/sast";
import { computeProofLifecycle, type LifecycleStageId } from "@/lib/proof-lifecycle";

/**
 * Shared Evidence, Vulnerability & Attack-Path Handoff Contract between:
 *  - XTRIKE SAST Desk (Source-Code Intelligence, AST Taint, Guard Dominance, Path Feasibility)
 *  - Expedite Strike (Isolated Offensive Validation, Controlled Reproduction, Runtime Evidence Capture)
 */

export type TaxonomyMappingQualification =
  | "DIRECTLY_APPLICABLE"
  | "SUPPORTING_REFERENCE"
  | "INFERRED_RELATIONSHIP"
  | "REQUIRES_ORGANIZATIONAL_EVIDENCE";

export interface QualifiedTaxonomyMapping {
  standard: string;
  referenceId: string;
  qualification: TaxonomyMappingQualification;
  rationale: string;
}

export interface StrikeHandoffStep {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  owner: "XTRIKE_SAST_DESK" | "EXPEDITE_STRIKE" | "SHARED_EVIDENCE_LAYER";
  action: string;
  status: "COMPLETED" | "READY_FOR_HANDOFF" | "AWAITING_SANDBOX" | "BLOCKED";
  artifactOrDetail: string;
}

export interface StrikeHandoffEnvelope {
  envelopeId: string;
  findingId: string;
  cwe: string;
  language: string;
  targetFile: string;
  targetLine: number;
  sourceExpr: string;
  sinkExpr: string;
  interproceduralChain: string[];
  guardDominanceState: string;
  pathFeasibilityState: string;
  handoffEligibility: "ELIGIBLE_FOR_CONTROLLED_REPRODUCTION" | "REQUIRES_CALL_GRAPH_CONFIRMATION" | "STATIC_CONFIG_CHECK_ONLY";
  investigationPriorityRank?: number;
  steps: StrikeHandoffStep[];
  qualifiedMappings: QualifiedTaxonomyMapping[];
}

export interface LanguageCapabilityRow {
  language: string;
  intraProceduralAst: "SUPPORTED" | "PARTIAL";
  interProceduralCallGraph: "SUPPORTED (Direct Calls)" | "PARTIAL" | "NOT_MODELLED";
  frameworkBindings: string;
  asyncAndQueues: string;
  dynamicDispatchAndReflection: "NOT_MODELLED";
}

export const LANGUAGE_CAPABILITY_MATRIX: LanguageCapabilityRow[] = [
  {
    language: "C# (.NET / ASP.NET Core)",
    intraProceduralAst: "SUPPORTED",
    interProceduralCallGraph: "SUPPORTED (Direct Calls)",
    frameworkBindings: "[FromQuery], [FromBody], [FromRoute], [FromForm], [FromHeader], Request.Query/Form/Body",
    asyncAndQueues: "async/await direct method calls modelled; MassTransit/ServiceBus queues NOT_MODELLED",
    dynamicDispatchAndReflection: "NOT_MODELLED",
  },
  {
    language: "Python (Flask / FastAPI / Django)",
    intraProceduralAst: "SUPPORTED",
    interProceduralCallGraph: "SUPPORTED (Direct Calls)",
    frameworkBindings: "request.args, request.form, request.json, request.GET/POST, sys.argv",
    asyncAndQueues: "async def direct calls modelled; Celery/RQ/Kafka queues NOT_MODELLED",
    dynamicDispatchAndReflection: "NOT_MODELLED",
  },
  {
    language: "JavaScript / TypeScript (Express / Koa / Node)",
    intraProceduralAst: "SUPPORTED",
    interProceduralCallGraph: "SUPPORTED (Direct Calls)",
    frameworkBindings: "req.query, req.body, req.params, req.headers, ctx.query/request.body",
    asyncAndQueues: "async/await arrow & function calls modelled; BullMQ/EventEmitter NOT_MODELLED",
    dynamicDispatchAndReflection: "NOT_MODELLED",
  },
  {
    language: "Java (Spring Boot / Jakarta Servlet)",
    intraProceduralAst: "SUPPORTED",
    interProceduralCallGraph: "SUPPORTED (Direct Calls)",
    frameworkBindings: "@RequestParam, @PathVariable, @RequestBody, @RequestHeader, HttpServletRequest.getParameter",
    asyncAndQueues: "Direct method calls modelled; JMS/Kafka/@Async proxies NOT_MODELLED",
    dynamicDispatchAndReflection: "NOT_MODELLED",
  },
  {
    language: "Go / PHP / Ruby / Kotlin / Swift",
    intraProceduralAst: "SUPPORTED",
    interProceduralCallGraph: "NOT_MODELLED",
    frameworkBindings: "Intra-function source/sink pattern & guard dominance only",
    asyncAndQueues: "NOT_MODELLED",
    dynamicDispatchAndReflection: "NOT_MODELLED",
  },
];

const CANDIDATE_PRIORITY_BY_CWE: Record<string, { rank: number; reason: string }> = {
  "CWE-502": { rank: 1, reason: "Untrusted deserialization and potential gadget-chain remote code execution" },
  "CWE-918": { rank: 2, reason: "Outbound SSRF and potential reachability to internal metadata or control-plane services" },
  "CWE-639": { rank: 3, reason: "Cross-tenant or cross-user object authorization bypass (BOLA / IDOR)" },
  "CWE-347": { rank: 4, reason: "Potential JWT signature verification bypass or unverified claim trust" },
  "CWE-89": { rank: 5, reason: "Second-order or direct SQL predicate injection" },
  "CWE-22": { rank: 6, reason: "Archive extraction (Zip-Slip) or filesystem path traversal" },
  "CWE-611": { rank: 7, reason: "XML external entity (XXE) parser configuration weakness" },
};

export function qualifyFindingTaxonomyMappings(f: SASTFinding): QualifiedTaxonomyMapping[] {
  return [
    {
      standard: "MITRE CWE™ AST Classification",
      referenceId: f.cwe,
      qualification: "DIRECTLY_APPLICABLE",
      rationale: `Structural source/sink pattern matched directly at ${f.file}:${f.line}.`,
    },
    {
      standard: "OWASP Top 10 / ASVS v4.0.3",
      referenceId: `${f.owasp} (${f.owaspCategory})`,
      qualification: "DIRECTLY_APPLICABLE",
      rationale: "Code-level verification requirement governs parameterization/sanitization at this sink.",
    },
    {
      standard: "MITRE ATT&CK® Enterprise v15",
      referenceId: f.mitre || "T1190",
      qualification: "INFERRED_RELATIONSHIP",
      rationale: "Threat-model technique mapping; does not prove live adversary exploitation occurred.",
    },
    {
      standard: "NIST SP 800-53 Rev. 5 / PCI-DSS / ISO 27001",
      referenceId: f.compliance?.map((c) => `${c.framework} ${c.reference}`).join(" · ") || "SI-10 / Req 6.2.4 / A.8.28",
      qualification: "REQUIRES_ORGANIZATIONAL_EVIDENCE",
      rationale: "Maps code weakness to control family; organizational control failure requires compensating-control & deployment audit.",
    },
    {
      standard: "GHSA / XTRIKE Exploit-Index / VerifyModule",
      referenceId: f.checkmarxQuery || `${f.cwe}-ADVISORY-REF`,
      qualification: "SUPPORTING_REFERENCE",
      rationale: "Reference intelligence for triage prioritization; not proof of vulnerable runtime configuration.",
    },
  ];
}

export function buildStrikeHandoffEnvelope(f: SASTFinding): StrikeHandoffEnvelope {
  const lifecycle = computeProofLifecycle(f);
  const stageMap = new Map<LifecycleStageId, string>(lifecycle.stages.map((s) => [s.stage, s.verdict]));
  const isTaintConfirmed =
    f.interprocedural?.status === "ESTABLISHED" || f.proofState === "DATAFLOW_CONFIRMED";
  const hasRuntimeRecord = stageMap.get("RUNTIME_REPRODUCED") === "PASSED";
  const hasImpactRecord = stageMap.get("IMPACT_VERIFIED") === "PASSED";
  const hasRemediationRecord = stageMap.get("REMEDIATION_VERIFIED") === "PASSED";
  const isSynthetic = f.sourceProvenance?.status === "SYNTHETIC_TEMPLATE";

  const eligibility: StrikeHandoffEnvelope["handoffEligibility"] = isTaintConfirmed && !isSynthetic
    ? "ELIGIBLE_FOR_CONTROLLED_REPRODUCTION"
    : isSynthetic
      ? "REQUIRES_CALL_GRAPH_CONFIRMATION"
      : "STATIC_CONFIG_CHECK_ONLY";

  const steps: StrikeHandoffStep[] = [
    {
      stepNumber: 1,
      owner: "XTRIKE_SAST_DESK",
      action: `Identify ${f.cwe} weakness in source code (${f.file}:${f.line})`,
      status: isSynthetic ? "BLOCKED" : "COMPLETED",
      artifactOrDetail: isSynthetic
        ? `Synthetic architectural hypothesis (${f.file} not present in scanned tree)`
        : `Verified source excerpt at ${f.file}:${f.line}`,
    },
    {
      stepNumber: 2,
      owner: "XTRIKE_SAST_DESK",
      action: "Trace untrusted input to dangerous execution sink & evaluate guards",
      status: isTaintConfirmed ? "COMPLETED" : "BLOCKED",
      artifactOrDetail:
        f.interprocedural?.status === "ESTABLISHED"
          ? `${f.interprocedural.steps.length}-step trace (${f.interprocedural.functionChain.join(" -> ")}); Feasibility: ${f.interprocedural.pathFeasibility?.status || "FEASIBLE"}`
          : f.controlDominanceSummary || "Cross-module call-graph trace not established",
    },
    {
      stepNumber: 3,
      owner: "SHARED_EVIDENCE_LAYER",
      action: "Emit typed StrikeHandoffEnvelope to Expedite Strike validation queue",
      status: eligibility === "ELIGIBLE_FOR_CONTROLLED_REPRODUCTION" ? "READY_FOR_HANDOFF" : "BLOCKED",
      artifactOrDetail: `Envelope STRIKE-ENV-${f.id} · Eligibility: ${eligibility}`,
    },
    {
      stepNumber: 4,
      owner: "EXPEDITE_STRIKE",
      action: "Synthesize isolated container harness & non-destructive verification probe",
      status: hasRuntimeRecord ? "COMPLETED" : "AWAITING_SANDBOX",
      artifactOrDetail: hasRuntimeRecord
        ? "Isolated harness synthesized and executed"
        : "Not executed in STATIC_ONLY scan mode",
    },
    {
      stepNumber: 5,
      owner: "EXPEDITE_STRIKE",
      action: "Attempt controlled runtime reproduction against ephemeral target",
      status: hasRuntimeRecord ? "COMPLETED" : "AWAITING_SANDBOX",
      artifactOrDetail: hasRuntimeRecord
        ? "SHA-256 execution record captured"
        : "Awaiting isolated sandbox execution (0 requests sent)",
    },
    {
      stepNumber: 6,
      owner: "SHARED_EVIDENCE_LAYER",
      action: "Return signed VerificationRecord (stdout/stderr/HTTP trace SHA-256) to XTRIKE",
      status: hasRuntimeRecord ? "COMPLETED" : "AWAITING_SANDBOX",
      artifactOrDetail: hasRuntimeRecord
        ? `${f.verificationRecords?.length || 1} verification record(s) attached`
        : "No runtime VerificationRecord attached",
    },
    {
      stepNumber: 7,
      owner: "XTRIKE_SAST_DESK",
      action: "Advance independent proof milestones (RUNTIME_REPRODUCED / IMPACT_VERIFIED)",
      status: hasImpactRecord ? "COMPLETED" : "AWAITING_SANDBOX",
      artifactOrDetail: `Current highest verified milestone: ${lifecycle.maturity}`,
    },
    {
      stepNumber: 8,
      owner: "XTRIKE_SAST_DESK",
      action: "Compile language-native remediation patch & execute regression test",
      status: hasRemediationRecord ? "COMPLETED" : "AWAITING_SANDBOX",
      artifactOrDetail: `Language-matched ${f.remediation[0]?.platform || f.language} diff generated; compiler/regression verification NOT_RUN`,
    },
  ];

  return {
    envelopeId: `STRIKE-ENV-${f.id}`,
    findingId: f.id,
    cwe: f.cwe,
    language: f.language,
    targetFile: f.file,
    targetLine: f.line,
    sourceExpr: f.source,
    sinkExpr: f.sink,
    interproceduralChain: f.interprocedural?.functionChain || [],
    guardDominanceState: f.controlDominanceSummary || "No dominating guard identified",
    pathFeasibilityState: f.interprocedural?.pathFeasibility?.status || "UNVERIFIED",
    handoffEligibility: eligibility,
    investigationPriorityRank: CANDIDATE_PRIORITY_BY_CWE[f.cwe]?.rank,
    steps,
    qualifiedMappings: qualifyFindingTaxonomyMappings(f),
  };
}
