"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldAlert, Flame, Crown, Globe, Lock, CheckCircle2,
  AlertTriangle, Clock, UserCheck, Filter, Search, Plus,
  ExternalLink, Download, FileText, GitPullRequest, Bell,
  Sliders, CheckSquare, XCircle, RefreshCw, Layers, Eye,
  MessageSquare, Key, Server, Activity, ArrowUpRight, Sparkles,
  Code2, GitMerge, Cpu, Printer, Mail
} from "lucide-react";
import { buildFormalFindingReport } from "@/data/portAndDaemonTtpCatalog";

export type VulnStatus =
  | "New"
  | "Triaged"
  | "In Progress"
  | "Fixed"
  | "Verified"
  | "Accepted Risk"
  | "Won't Fix"
  | "False Positive";

export type AppCriticality = "Critical" | "High" | "Medium" | "Low";
export type ExposureLevel = "Public Internet-Facing" | "Internal Authenticated" | "Staging / Non-Prod";
export type ConfidenceTier =
  | "Confirmed + Public Exploit / Easy"
  | "Confirmed"
  | "Potential / Low Confidence"
  | "Informational";

export interface MitreTechniqueMapping {
  techniqueId: string;        // e.g. "T1190" or "T1059.007"
  techniqueName: string;      // e.g. "Exploit Public-Facing Application"
  tacticId: string;           // e.g. "TA0001"
  tacticName: string;         // e.g. "Initial Access"
  relationDescription: string;// How this DAST finding enables the technique
  officialUrl: string;        // e.g. "https://attack.mitre.org/techniques/T1190/"
  isAutoSuggested: boolean;   // Auto-mapped by Engine Brain vs Analyst-added override
  isHighImpactTactic: boolean;// Initial Access, Execution, Privilege Escalation
}

export const MITRE_TECHNIQUE_LIBRARY: MitreTechniqueMapping[] = [
  {
    techniqueId: "T1190",
    techniqueName: "Exploit Public-Facing Application",
    tacticId: "TA0001",
    tacticName: "Initial Access",
    relationDescription: "Adversary exploits unauthenticated SQLi / web input flaws on internet-facing endpoints to gain initial foothold.",
    officialUrl: "https://attack.mitre.org/techniques/T1190/",
    isAutoSuggested: true,
    isHighImpactTactic: true
  },
  {
    techniqueId: "T1548",
    techniqueName: "Abuse Elevation Control Mechanism",
    tacticId: "TA0004",
    tacticName: "Privilege Escalation",
    relationDescription: "Adversary bypasses RBAC authorization controls and abuses SUID/admin elevation endpoints to gain root/SuperAdmin privileges.",
    officialUrl: "https://attack.mitre.org/techniques/T1548/",
    isAutoSuggested: true,
    isHighImpactTactic: true
  },
  {
    techniqueId: "T1078",
    techniqueName: "Valid Accounts (Forged JWT / Session)",
    tacticId: "TA0004",
    tacticName: "Privilege Escalation",
    relationDescription: "Adversary forges or hijacks valid session tokens / Bearer JWTs to impersonate privileged accounts without triggering MFA.",
    officialUrl: "https://attack.mitre.org/techniques/T1078/",
    isAutoSuggested: true,
    isHighImpactTactic: true
  },
  {
    techniqueId: "T1552.001",
    techniqueName: "Unsecured Credentials: Credentials In Files",
    tacticId: "TA0006",
    tacticName: "Credential Access",
    relationDescription: "Adversary extracts signing keys and DB secrets from exposed dotfiles (/.env.backup) in the webroot.",
    officialUrl: "https://attack.mitre.org/techniques/T1552/001/",
    isAutoSuggested: true,
    isHighImpactTactic: false
  },
  {
    techniqueId: "T1059.007",
    techniqueName: "Command and Scripting Interpreter: JavaScript",
    tacticId: "TA0002",
    tacticName: "Execution",
    relationDescription: "Adversary injects arbitrary JavaScript into victim browsers via Reflected/DOM XSS without Content-Security-Policy protection.",
    officialUrl: "https://attack.mitre.org/techniques/T1059/007/",
    isAutoSuggested: true,
    isHighImpactTactic: true
  },
  {
    techniqueId: "T1213",
    techniqueName: "Data from Information Repositories",
    tacticId: "TA0009",
    tacticName: "Collection",
    relationDescription: "Adversary enumerates sensitive financial ledger records via Broken Object Level Authorization (BOLA / IDOR) on REST/GraphQL APIs.",
    officialUrl: "https://attack.mitre.org/techniques/T1213/",
    isAutoSuggested: true,
    isHighImpactTactic: false
  },
  {
    techniqueId: "T1539",
    techniqueName: "Steal Web Session Cookie",
    tacticId: "TA0006",
    tacticName: "Credential Access",
    relationDescription: "Adversary harvests authenticated session cookies or cross-origin credentials via permissive CORS reflection and missing HttpOnly/HSTS.",
    officialUrl: "https://attack.mitre.org/techniques/T1539/",
    isAutoSuggested: true,
    isHighImpactTactic: false
  }
];

export interface CustomWeightsConfig {
  severityWeightPct: number;       // default 40
  confidenceWeightPct: number;     // default 25
  appCriticalityWeightPct: number; // default 20
  exposureWeightPct: number;       // default 15
  boostCisaKev: number;            // default 12
  boostAuthOrData: number;         // default 8
  boostPublicUnauthRule: boolean;  // custom boost rule (+5)
  boostHighImpactMitreTactic: boolean; // +5 pts for Initial Access / Execution / Privilege Escalation
}

export interface DastApplicationItem {
  id: string;
  name: string;
  portfolioGroup: "Payment & Core Banking" | "Customer-Facing Web" | "Partner & OpenBanking APIs" | "Internal Backoffice";
  baseUrls: string[];
  environments: ("Production" | "Staging" | "Preview" | "DR-Regional")[];
  activeEnvironment: "Production" | "Staging" | "Preview" | "DR-Regional";
  criticality: AppCriticality;
  isCrownJewel: boolean;
  ownerTeam: string;
  businessUnit: string;
  tags: string[];
  detectedTechStack: string[];
  tlsAndHeaderSummary: string;
  lastScanDate: string;
  scanFrequency: "Continuous (CI/CD)" | "Daily Automated" | "Weekly Scheduled";
  lastScanId: string;
  authenticatedScanSuccessRate: number;
  urlCoveragePct: number;
  endpointsCovered: number;
  spideredPagesCount: number;
  discoveredParamsCount: number;
}

export interface DastManagedFinding {
  id: string;
  sourceFindingIndex: number;
  vulnType: string;
  isApiOrGraphql: boolean;
  title: string;
  cwe: string;
  owasp: string;
  mitreAttack: string;
  mitreTechniques: MitreTechniqueMapping[];
  scannerDaemon: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  cvssBase: number;
  cvssVector: string;
  epssScorePct: number;
  epssPercentile: number;
  publicExploitStatus: "Weaponized PoC & Metasploit/Nuclei Module" | "Verified Functional PoC" | "Scanner Pattern Match";
  cisaKevDetails?: {
    dateAdded: string;
    ransomwareCampaignUse: "Known Active Use" | "High-Risk Precursor";
    requiredAction: string;
  };
  confidence: ConfidenceTier;
  appId: string;
  appName: string;
  portfolioGroup: string;
  appCriticality: AppCriticality;
  isCrownJewel: boolean;
  exposure: ExposureLevel;
  isUnauthenticated: boolean;
  inCisaKevOrRansomware: boolean;
  isAuthBypassOrSensitiveData: boolean;
  endpoint: string;
  parameter: string;
  status: VulnStatus;
  assignee: string;
  watchers: string[];
  firstSeen: string;
  lastSeen: string;
  reopenedCount: number;
  isRecurringAcrossScans: boolean;
  releaseComparisonState: "New in Release" | "Recurring" | "Fixed in Release";
  ageDays: number;
  slaTargetDays: number;
  scanId: string;
  authenticatedContext: "Unauthenticated" | "Authenticated (Bearer JWT / Session)";
  evidenceRequest: string;
  evidenceResponse: string;
  proofArtifact: string;
  screenshots: {
    figureId: string;
    title: string;
    caption: string;
    svgDataUri: string;
  }[];
  howToFixTechnical: string;
  howToFixDeveloperFriendly: string;
  codeRemediationSnippet: string;
  attackChainHint: string;
  aiCopilotExplanation: string;
  customFields: {
    complianceFramework: string;
    internalTrackingId: string;
    releaseBlocker: boolean;
  };
  linkedTicket?: {
    system: "Jira" | "Azure DevOps" | "ServiceNow" | "GitHub Issues";
    ticketKey: string;
    syncState: "Two-Way Synced" | "Pending Sync";
    prUrl?: string;
    commitSha?: string;
    fixVersion?: string;
  };
  retestRequested: boolean;
  suppressedFutureSimilar: boolean;
  falsePositiveReason?: string;
  riskAcceptance?: {
    justification: string;
    expiryDate: string;
    approver: string;
    approvedAt: string;
    policyApplied?: string;
  };
  comments: { author: string; role: string; timestamp: string; text: string }[];
}

export interface RiskBreakdownResult {
  severityScore: number;
  severityWeighted: number;
  confidenceScore: number;
  confidenceWeighted: number;
  appCritScore: number;
  appCritWeighted: number;
  exposureScore: number;
  exposureWeighted: number;
  baseWeightedTotal: number;
  cisaKevBoost: number;
  authOrDataBoost: number;
  customRuleBoost: number;
  mitreHighImpactBoost: number;
  finalScore: number;
  cvssComparableScore: number;
  contextDeltaVsCvss: number;
  tier: "Critical (Fix Immediately)" | "High" | "Medium" | "Low / Info";
  tierShort: "Critical" | "High" | "Medium" | "Low / Info";
  tierColor: string;
}

export function calculateDastRiskScoreWithWeights(
  f: {
    severity: "Critical" | "High" | "Medium" | "Low" | "Info";
    cvssBase?: number;
    confidence: ConfidenceTier;
    appCriticality: AppCriticality;
    exposure: ExposureLevel;
    isUnauthenticated?: boolean;
    inCisaKevOrRansomware: boolean;
    isAuthBypassOrSensitiveData: boolean;
    hasHighImpactMitreTactic?: boolean;
  },
  weights: CustomWeightsConfig
): RiskBreakdownResult {
  const sevMap: Record<string, number> = {
    Critical: 100,
    High: 75,
    Medium: 50,
    Low: 25,
    Info: 0
  };
  const confMap: Record<ConfidenceTier, number> = {
    "Confirmed + Public Exploit / Easy": 100,
    Confirmed: 75,
    "Potential / Low Confidence": 40,
    Informational: 0
  };
  const critMap: Record<AppCriticality, number> = {
    Critical: 100,
    High: 75,
    Medium: 50,
    Low: 25
  };
  const expMap: Record<ExposureLevel, number> = {
    "Public Internet-Facing": 100,
    "Internal Authenticated": 50,
    "Staging / Non-Prod": 20
  };

  const totalWeightPct = Math.max(
    1,
    weights.severityWeightPct +
      weights.confidenceWeightPct +
      weights.appCriticalityWeightPct +
      weights.exposureWeightPct
  );

  const severityScore = sevMap[f.severity] ?? 50;
  const confidenceScore = confMap[f.confidence] ?? 75;
  const appCritScore = critMap[f.appCriticality] ?? 75;
  const exposureScore = expMap[f.exposure] ?? 100;

  const severityWeighted = +(
    (severityScore * weights.severityWeightPct) /
    totalWeightPct
  ).toFixed(1);
  const confidenceWeighted = +(
    (confidenceScore * weights.confidenceWeightPct) /
    totalWeightPct
  ).toFixed(1);
  const appCritWeighted = +(
    (appCritScore * weights.appCriticalityWeightPct) /
    totalWeightPct
  ).toFixed(1);
  const exposureWeighted = +(
    (exposureScore * weights.exposureWeightPct) /
    totalWeightPct
  ).toFixed(1);

  const baseWeightedTotal = +(
    severityWeighted +
    confidenceWeighted +
    appCritWeighted +
    exposureWeighted
  ).toFixed(1);

  const cisaKevBoost = f.inCisaKevOrRansomware ? weights.boostCisaKev : 0;
  const authOrDataBoost = f.isAuthBypassOrSensitiveData ? weights.boostAuthOrData : 0;
  const customRuleBoost =
    weights.boostPublicUnauthRule &&
    f.exposure === "Public Internet-Facing" &&
    f.isUnauthenticated
      ? 5
      : 0;
  const mitreHighImpactBoost =
    weights.boostHighImpactMitreTactic && f.hasHighImpactMitreTactic ? 5 : 0;

  const finalScore = Math.min(
    100,
    Math.round(
      baseWeightedTotal +
        cisaKevBoost +
        authOrDataBoost +
        customRuleBoost +
        mitreHighImpactBoost
    )
  );

  const cvssComparableScore = Math.round((f.cvssBase ?? severityScore / 10) * 10);
  const contextDeltaVsCvss = finalScore - cvssComparableScore;

  let tier: RiskBreakdownResult["tier"] = "Low / Info";
  let tierShort: RiskBreakdownResult["tierShort"] = "Low / Info";
  let tierColor = "#38bdf8";

  if (finalScore >= 80) {
    tier = "Critical (Fix Immediately)";
    tierShort = "Critical";
    tierColor = "#f43f5e";
  } else if (finalScore >= 60) {
    tier = "High";
    tierShort = "High";
    tierColor = "#fb923c";
  } else if (finalScore >= 40) {
    tier = "Medium";
    tierShort = "Medium";
    tierColor = "#facc15";
  }

  return {
    severityScore,
    severityWeighted,
    confidenceScore,
    confidenceWeighted,
    appCritScore,
    appCritWeighted,
    exposureScore,
    exposureWeighted,
    baseWeightedTotal,
    cisaKevBoost,
    authOrDataBoost,
    customRuleBoost,
    mitreHighImpactBoost,
    finalScore,
    cvssComparableScore,
    contextDeltaVsCvss,
    tier,
    tierShort,
    tierColor
  };
}

export interface EngineBrainRawFinding {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info" | string;
  cvss?: number;
  cwe?: string;
  owasp?: string;
  mitre?: string;
  phase?: string;
  endpoint?: string;
  url?: string;
  evidence?: string;
  remediation?: string;
  d3fend?: string;
  [key: string]: any;
}

interface Props {
  primaryTargetUrl?: string;
  scopedTargetUrls?: string[];
  engineResults?: any[];
  engineBrainFindings?: any[];
  remediatedIds?: Record<string, boolean>;
  onTriggerSingleRetest?: (idx: number, f: any) => void;
  onTriggerBatchRetest?: () => void;
  onOpenFormalReportTab?: () => void;
}

export default function DastVulnManagementTab({
  primaryTargetUrl = "https://demo.testfire.net",
  scopedTargetUrls,
  engineResults = [],
  engineBrainFindings = [],
  remediatedIds = {},
  onTriggerSingleRetest,
  onTriggerBatchRetest,
  onOpenFormalReportTab
}: Props) {
  const effectiveTargets = useMemo(
    () =>
      scopedTargetUrls && scopedTargetUrls.length > 0
        ? scopedTargetUrls
        : [primaryTargetUrl],
    [scopedTargetUrls, primaryTargetUrl]
  );

  // Sub-Navigation across the Expanded Enterprise Feature Set + MITRE ATT&CK & Vulnerability Intelligence
  const [activeSubView, setActiveSubView] = useState<
    | "PRIORITIZATION_WHAT_TO_FIX"
    | "FINDINGS_MANAGEMENT"
    | "MITRE_ATTACK_VULN_INTEL"
    | "APP_ASSET_CONTEXT"
    | "WORKFLOW_FP_EXCEPTIONS"
    | "SCAN_COVERAGE_DIFF"
    | "DASHBOARDS_REPORTS"
    | "ENTERPRISE_RBAC_PHASING"
  >("PRIORITIZATION_WHAT_TO_FIX");

  // Developer-Friendly Mode Toggle (Advanced Differentiator)
  const [developerFriendlyMode, setDeveloperFriendlyMode] = useState(false);

  // Enterprise 6-Role RBAC & Business Unit Scoping
  const [activeRole, setActiveRole] = useState<
    "Security Analyst" | "App Owner" | "Developer" | "Auditor" | "Viewer" | "Admin"
  >("Security Analyst");
  const [scopedBusinessUnit, setScopedBusinessUnit] = useState<string>("ALL_UNITS");

  // Configurable Risk Scoring Weights (Prioritization & Risk)
  const [weights, setWeights] = useState<CustomWeightsConfig>({
    severityWeightPct: 40,
    confidenceWeightPct: 25,
    appCriticalityWeightPct: 20,
    exposureWeightPct: 15,
    boostCisaKev: 12,
    boostAuthOrData: 8,
    boostPublicUnauthRule: true,
    boostHighImpactMitreTactic: true
  });

  // Auto-Accept Non-Prod Medium Policy Toggle
  const [autoAcceptNonProdMediumPolicy, setAutoAcceptNonProdMediumPolicy] = useState(true);

  // Build Application Inventory directly from Engine Brain `effectiveTargets` + `engineResults`
  const [appOverrides, setAppOverrides] = useState<
    Record<string, { criticality?: AppCriticality; isCrownJewel?: boolean }>
  >({});

  const applications: DastApplicationItem[] = useMemo(() => {
    const primaryLive = engineResults[0];
    const detectedServer = primaryLive?.serverHeader || "Apache-Coyote/1.1 · Tomcat Servlet Engine";
    const detectedTls = primaryLive?.tlsVersion || "TLSv1.3 (AEAD-AES256-GCM-SHA384)";
    const spideredCount = primaryLive?.deepSpider?.spideredPages?.length || 18;
    const paramsCount = primaryLive?.deepSpider?.discoveredParameters?.length || 24;
    const liveTech: string[] = primaryLive?.techStack?.length
      ? primaryLive.techStack
      : ["Java J2EE / JSP", "Apache Tomcat", "Bootstrap UI", "REST / JSON API", "JWT Bearer Auth"];

    const baseApps: DastApplicationItem[] = effectiveTargets.map((tUrl, idx) => {
      const resForTarget = engineResults[idx] || primaryLive;
      let cleanHost = tUrl.replace(/^https?:\/\//, "").split("/")[0] || "demo.testfire.net";
      const appId = `APP-ENGINE-${idx + 1}`;
      const ov = appOverrides[appId] || {};
      return {
        id: appId,
        name:
          idx === 0
            ? `${cleanHost} — Primary Web Interface & API Target (Engine Brain)`
            : `${cleanHost} — Scoped Secondary DAST Target #${idx + 1}`,
        portfolioGroup: idx === 0 ? "Payment & Core Banking" : "Customer-Facing Web",
        baseUrls: [
          tUrl,
          `${tUrl.replace(/\/$/, "")}/api/v1`,
          `https://staging.${cleanHost}`
        ],
        environments: ["Production", "Staging", "Preview", "DR-Regional"],
        activeEnvironment: "Production",
        criticality: ov.criticality ?? "Critical",
        isCrownJewel: ov.isCrownJewel ?? true,
        ownerTeam: "Web Interface & IAM SecOps Team (Kwesi Asiedu)",
        businessUnit: "Digital Channels & Core Web",
        tags: [
          "Engine-Brain-Live",
          "Crown-Jewel",
          "PCI-DSS-v4.0",
          "OWASP-WSTG-v4.2",
          "Customer-Facing"
        ],
        detectedTechStack: resForTarget?.techStack?.length ? resForTarget.techStack : liveTech,
        tlsAndHeaderSummary: `${resForTarget?.tlsVersion || detectedTls} · Server: ${resForTarget?.serverHeader || detectedServer}`,
        lastScanDate: resForTarget?.timestamp || new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        scanFrequency: "Continuous (CI/CD)",
        lastScanId: `SCAN-BRAIN-${new Date().toISOString().slice(0, 10)}-0${idx + 1}`,
        authenticatedScanSuccessRate: resForTarget?.authenticatedMode ? 100 : 94,
        urlCoveragePct: Math.min(99, 86 + spideredCount),
        endpointsCovered: Math.max(32, spideredCount * 4),
        spideredPagesCount: spideredCount,
        discoveredParamsCount: paramsCount
      };
    });

    const primaryCleanHost = effectiveTargets[0]?.replace(/^https?:\/\//, "").split("/")[0] || "demo.testfire.net";
    const extraPortfolioApps: DastApplicationItem[] = [
      {
        id: "APP-ENGINE-API",
        name: `${primaryCleanHost} — REST & GraphQL API Gateway (/api/admin/rbac & /graphql)`,
        portfolioGroup: "Partner & OpenBanking APIs",
        baseUrls: [`${effectiveTargets[0]?.replace(/\/$/, "")}/api`, `${effectiveTargets[0]?.replace(/\/$/, "")}/graphql`],
        environments: ["Production", "Staging"],
        activeEnvironment: "Production",
        criticality: appOverrides["APP-ENGINE-API"]?.criticality ?? "Critical",
        isCrownJewel: appOverrides["APP-ENGINE-API"]?.isCrownJewel ?? true,
        ownerTeam: "API Platform & Identity Guild (Elena Rostova)",
        businessUnit: "Digital Channels & Core Web",
        tags: ["REST-API", "GraphQL", "JWT-RBAC", "OWASP-API-Top-10"],
        detectedTechStack: ["OpenAPI v3", "JWT HS256/RS256", "GraphQL BFF", detectedServer],
        tlsAndHeaderSummary: `${detectedTls} · CORS Audited`,
        lastScanDate: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        scanFrequency: "Continuous (CI/CD)",
        lastScanId: `SCAN-BRAIN-${new Date().toISOString().slice(0, 10)}-API`,
        authenticatedScanSuccessRate: 98,
        urlCoveragePct: 94,
        endpointsCovered: 42,
        spideredPagesCount: 14,
        discoveredParamsCount: 31
      },
      {
        id: "APP-ENGINE-STAGING",
        name: `staging.${primaryCleanHost} — Pre-Production QA & Canary Environment`,
        portfolioGroup: "Internal Backoffice",
        baseUrls: [`https://staging.${primaryCleanHost}`],
        environments: ["Staging", "Preview"],
        activeEnvironment: "Staging",
        criticality: appOverrides["APP-ENGINE-STAGING"]?.criticality ?? "Medium",
        isCrownJewel: appOverrides["APP-ENGINE-STAGING"]?.isCrownJewel ?? false,
        ownerTeam: "Release Engineering & QA Squad (Devon Brooks)",
        businessUnit: "Release Engineering",
        tags: ["Staging", "Pre-Release-Gate", "Auto-Accept-Policy-Eligible"],
        detectedTechStack: liveTech,
        tlsAndHeaderSummary: `${detectedTls} · Staging WAF`,
        lastScanDate: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        scanFrequency: "Daily Automated",
        lastScanId: `SCAN-BRAIN-${new Date().toISOString().slice(0, 10)}-STG`,
        authenticatedScanSuccessRate: 91,
        urlCoveragePct: 88,
        endpointsCovered: 29,
        spideredPagesCount: 11,
        discoveredParamsCount: 19
      }
    ];

    return [...baseApps, ...extraPortfolioApps];
  }, [effectiveTargets, engineResults, appOverrides]);

  // Local workflow overrides (status, assignee, tickets, FP, Risk Acceptance, comments, custom fields, mitreTechniques) keyed by finding ID
  const [findingWorkflowState, setFindingWorkflowState] = useState<
    Record<
      string,
      Partial<
        Pick<
          DastManagedFinding,
          | "status"
          | "assignee"
          | "watchers"
          | "linkedTicket"
          | "retestRequested"
          | "suppressedFutureSimilar"
          | "falsePositiveReason"
          | "riskAcceptance"
          | "comments"
          | "customFields"
          | "mitreTechniques"
        >
      >
    >
  >({});

  // Default Engine Brain findings if `engineBrainFindings` prop isn't passed (e.g., when opened directly via `/vuln-management` route)
  const effectiveRawBrainFindings: EngineBrainRawFinding[] = useMemo(() => {
    if (engineBrainFindings && engineBrainFindings.length > 0) {
      return engineBrainFindings;
    }
    return [
      {
        title: "Privilege Escalation — Forged SuperAdmin JWT & SUID Elevation",
        severity: "Critical",
        cvss: 9.8,
        cwe: "CWE-287",
        owasp: "A07:2021",
        mitre: "TA0004 / T1548 · T1078",
        phase: "PTES P6 · NIST §5.3 (Exploitation & PrivEsc)",
        endpoint: `POST ${primaryTargetUrl}/api/admin/rbac/elevate`,
        evidence: `[XTRIKE-WebPulse™ ZAP & Aegis.SOC-Apex™ · CWE-287] Leaked JWT signing secret in ${primaryTargetUrl}/.env.backup used to forge Bearer SuperAdmin token; response confirmed "effectiveRole":"superadmin","uid":0.`,
        remediation: "Purge /.env.backup from webroot, migrate JWT signing to asymmetric RS256 in KMS, enforce server-side RBAC ownership checks, and strip SUID root bits.",
        d3fend: "D3-IAM · D3-SCD · D3-EAL"
      },
      {
        title: "Unauthenticated SQL Injection (SQLi) in Web Login Authentication Handler",
        severity: "Critical",
        cvss: 9.8,
        cwe: "CWE-89",
        owasp: "A03:2021",
        mitre: "TA0001 / T1190",
        phase: "PTES P5 · NIST §5.2 (Web Interface Exploitation)",
        endpoint: `POST ${primaryTargetUrl}/doLogin (param: uid)`,
        evidence: `[XTRIKE-WebPulse™ ZAP Rule 40018 & XTRIKE-StrikeFuzzer™ Burp · CWE-89] Boolean/Union SQLi payload uid=admin' OR '1'='1-- bypassed login authentication and enumerated 4,210 customer records.`,
        remediation: "Refactor all dynamic SQL queries in LoginServlet to parameterized PreparedStatements and enforce least-privilege database roles.",
        d3fend: "D3-IV · D3-SCD"
      },
      {
        title: "Reflected Cross-Site Scripting (XSS) & Missing Content-Security-Policy (CSP)",
        severity: "High",
        cvss: 8.2,
        cwe: "CWE-79",
        owasp: "A03:2021",
        mitre: "TA0002 / T1059.007",
        phase: "PTES P5 · OWASP WSTG-INPV-01",
        endpoint: `GET ${primaryTargetUrl}/search.jsp?query=`,
        evidence: `[XTRIKE-WebPulse™ ZAP Rule 40012 · CWE-79] Unencoded script reflection confirmed in DOM response body with HttpOnly=false session cookie exfiltration.`,
        remediation: "Apply context-aware HTML output encoding (OWASP Encoder) and deploy a strict nonce-based Content-Security-Policy (CSP) header.",
        d3fend: "D3-IV · D3-HBPI"
      },
      {
        title: "Broken Object Level Authorization (BOLA / IDOR) on Account Transaction API",
        severity: "High",
        cvss: 8.6,
        cwe: "CWE-639",
        owasp: "API1:2023",
        mitre: "TA0009 / T1213",
        phase: "PTES P5 · OWASP API Security Top 10",
        endpoint: `GET ${primaryTargetUrl}/api/account/800001/transactions`,
        evidence: `[XTRIKE-StrikeFuzzer™ Burp Intruder · CWE-639] Authenticated low-privilege user (id=1042) accessed account 800001 ledger records without ownership verification.`,
        remediation: "Enforce server-side object-level authorization verifying that the authenticated JWT subject owns the requested account ID.",
        d3fend: "D3-ACA · D3-IAM"
      },
      {
        title: "Cross-Origin Resource Sharing (CORS) Arbitrary Origin Reflection & Missing HSTS",
        severity: "Medium",
        cvss: 6.5,
        cwe: "CWE-942",
        owasp: "A05:2021",
        mitre: "TA0006 / T1539",
        phase: "PTES P4 · OWASP WSTG-CLNT-07",
        endpoint: `OPTIONS ${primaryTargetUrl}/api/v1/profile`,
        evidence: `[XTRIKE-WebPulse™ Passive Rule 10035/40040] Access-Control-Allow-Origin reflects arbitrary Origin header with Access-Control-Allow-Credentials: true.`,
        remediation: "Restrict Access-Control-Allow-Origin to an explicit allowlist of trusted origins and enforce Strict-Transport-Security (max-age=63072000; includeSubDomains; preload).",
        d3fend: "D3-NI · D3-SPP"
      }
    ];
  }, [engineBrainFindings, primaryTargetUrl]);

  // Transform Engine Brain Findings into Rich Managed DAST Findings with `buildFormalFindingReport` Evidence + Screenshots + Multi-Technique MITRE ATT&CK
  const managedFindings: DastManagedFinding[] = useMemo(() => {
    return effectiveRawBrainFindings.map((rawF, idx) => {
      const formal = buildFormalFindingReport(rawF as any, idx, primaryTargetUrl);
      const id = formal.findingId; // e.g., DAST-WEB-2026-001
      const wf = findingWorkflowState[id] || {};
      const isRemediatedInBrain = Boolean(remediatedIds[`${idx}-${rawF.title}`]);
      const endpointStr = rawF.endpoint || rawF.url || formal.affectedAssets[0]?.detail || primaryTargetUrl;
      const owaspStr = rawF.owasp || rawF.owaspRef || "A03:2021";
      const cweStr = rawF.cwe || rawF.cweId || "CWE-287";
      const mitreStr = rawF.mitre || formal.frameworkMapping || "TA0001 / T1190";
      const sevNorm: "Critical" | "High" | "Medium" | "Low" | "Info" =
        rawF.severity === "Critical" || rawF.severity === "High" || rawF.severity === "Medium" || rawF.severity === "Low"
          ? rawF.severity
          : "High";

      const isApi =
        endpointStr.includes("/api/") ||
        endpointStr.includes("graphql") ||
        owaspStr.includes("API") ||
        rawF.title.toLowerCase().includes("jwt") ||
        rawF.title.toLowerCase().includes("bola");

      const assignedApp = isApi && idx % 2 === 1 ? applications[1] || applications[0] : applications[0];

      const isUnauth =
        !rawF.title.toLowerCase().includes("authenticated low-privilege") &&
        !rawF.title.toLowerCase().includes("bola");

      const inKev =
        cweStr === "CWE-89" ||
        cweStr === "CWE-287" ||
        sevNorm === "Critical";

      const isAuthOrSensitive =
        cweStr === "CWE-287" ||
        cweStr === "CWE-89" ||
        cweStr === "CWE-639" ||
        cweStr === "CWE-79";

      // Auto-suggest multiple MITRE ATT&CK techniques based on vulnerability type / CWE
      const autoSuggestedMitre: MitreTechniqueMapping[] =
        cweStr === "CWE-287"
          ? [
              MITRE_TECHNIQUE_LIBRARY[1], // T1548 Abuse Elevation Control Mechanism
              MITRE_TECHNIQUE_LIBRARY[2], // T1078 Valid Accounts
              MITRE_TECHNIQUE_LIBRARY[3]  // T1552.001 Unsecured Credentials in Files
            ]
          : cweStr === "CWE-89"
          ? [
              MITRE_TECHNIQUE_LIBRARY[0], // T1190 Exploit Public-Facing Application
              MITRE_TECHNIQUE_LIBRARY[5]  // T1213 Data from Information Repositories
            ]
          : cweStr === "CWE-79"
          ? [
              MITRE_TECHNIQUE_LIBRARY[4], // T1059.007 JavaScript Execution
              MITRE_TECHNIQUE_LIBRARY[6]  // T1539 Steal Web Session Cookie
            ]
          : cweStr === "CWE-639"
          ? [
              MITRE_TECHNIQUE_LIBRARY[5], // T1213 Data from Information Repositories
              MITRE_TECHNIQUE_LIBRARY[2]  // T1078 Valid Accounts
            ]
          : [
              MITRE_TECHNIQUE_LIBRARY[6]  // T1539 Steal Web Session Cookie
            ];

      const defaultStatus: VulnStatus = isRemediatedInBrain
        ? "Verified"
        : idx === 0
        ? "Triaged"
        : idx === 1
        ? "In Progress"
        : "New";

      const firstArtifact = formal.evidence.collectedExploitationSamples[0];
      const paramExtracted =
        formal.affectedAssets.find(r => r.item.toLowerCase().includes("parameter"))?.detail ||
        (endpointStr.includes("?") ? endpointStr.split("?")[1] : "Authorization / JSON Body");

      return {
        id,
        sourceFindingIndex: idx,
        vulnType: rawF.title.split("—")[0].split(" in ")[0].trim(),
        isApiOrGraphql: isApi,
        title: formal.title,
        cwe: cweStr,
        owasp: owaspStr,
        mitreAttack: mitreStr,
        mitreTechniques: wf.mitreTechniques ?? autoSuggestedMitre,
        scannerDaemon: formal.testerTool,
        severity: sevNorm,
        cvssBase: Number(formal.cvssScore) || 8.5,
        cvssVector: formal.cvssVector,
        epssScorePct: sevNorm === "Critical" ? 94.2 : sevNorm === "High" ? 78.6 : 41.5,
        epssPercentile: sevNorm === "Critical" ? 99.4 : sevNorm === "High" ? 94.8 : 76.2,
        publicExploitStatus:
          sevNorm === "Critical"
            ? "Weaponized PoC & Metasploit/Nuclei Module"
            : sevNorm === "High"
            ? "Verified Functional PoC"
            : "Scanner Pattern Match",
        cisaKevDetails: inKev
          ? {
              dateAdded: "2026-08-19",
              ransomwareCampaignUse: "Known Active Use",
              requiredAction: "Apply vendor remediation or virtual WAF patch within 7 days per BOD 22-01."
            }
          : undefined,
        confidence:
          sevNorm === "Critical" || sevNorm === "High"
            ? "Confirmed + Public Exploit / Easy"
            : "Confirmed",
        appId: assignedApp.id,
        appName: assignedApp.name,
        portfolioGroup: assignedApp.portfolioGroup,
        appCriticality: assignedApp.criticality,
        isCrownJewel: assignedApp.isCrownJewel,
        exposure: "Public Internet-Facing",
        isUnauthenticated: isUnauth,
        inCisaKevOrRansomware: inKev,
        isAuthBypassOrSensitiveData: isAuthOrSensitive,
        endpoint: endpointStr,
        parameter: paramExtracted,
        status: wf.status ?? defaultStatus,
        assignee:
          wf.assignee ??
          (idx === 0
            ? "Elena Rostova (IAM & RBAC Lead)"
            : idx === 1
            ? "Marcus Vance (Core DB Engineering)"
            : "Devon Brooks (Web Interface Guild)"),
        watchers: wf.watchers ?? ["Kwesi Asiedu (CISO)", "SecOps Triage Queue"],
        firstSeen: "2026-10-14",
        lastSeen: formal.discoveryDate,
        reopenedCount: idx === 2 ? 1 : 0,
        isRecurringAcrossScans: idx <= 2,
        releaseComparisonState: idx === 0 ? "New in Release" : isRemediatedInBrain ? "Fixed in Release" : "Recurring",
        ageDays: idx === 0 ? 2 : idx === 1 ? 5 : idx * 4 + 3,
        slaTargetDays: sevNorm === "Critical" ? 7 : sevNorm === "High" ? 14 : 30,
        scanId: assignedApp.lastScanId,
        authenticatedContext: isUnauth ? "Unauthenticated" : "Authenticated (Bearer JWT / Session)",
        evidenceRequest: firstArtifact?.capturedCommandOrRequest || `GET ${endpointStr} HTTP/1.1\nHost: ${primaryTargetUrl.replace(/^https?:\/\//, "")}`,
        evidenceResponse: firstArtifact?.capturedOutputOrLoot || rawF.evidence || formal.descriptionParagraphs.join(" "),
        proofArtifact: firstArtifact?.customerCiSummary || rawF.evidence || formal.descriptionParagraphs.join(" "),
        screenshots: formal.evidence.exploitationPictures.map(s => ({
          figureId: s.figureId,
          title: s.title,
          caption: s.caption,
          svgDataUri: s.svgDataUri
        })),
        howToFixTechnical: `${formal.remediation.immediateActions.join("; ")}. ${formal.remediation.shortTermHardening.join("; ")}`,
        howToFixDeveloperFriendly: `Plain-Language Fix for Developers: 1) Validate and sanitize the input parameter (${paramExtracted}) on the server before processing. 2) Apply the drop-in patch below and run the XTRIKE Retest button to verify the fix.`,
        codeRemediationSnippet:
          cweStr === "CWE-89"
            ? `// Fix CWE-89: Use Parameterized PreparedStatement\nPreparedStatement ps = conn.prepareStatement("SELECT id, role FROM users WHERE uid = ? AND pass = ?");\nps.setString(1, userInputUid);\nps.setString(2, passwordHash);`
            : cweStr === "CWE-287"
            ? `// Fix CWE-287: Block dotfiles at WAF & verify RS256 Asymmetric JWT\nlocation ~ /\\.(?!well-known).* { deny all; return 404; }\nJwtParser parser = Jwts.parserBuilder().setSigningKey(kmsPublicKey).build();`
            : `// Fix ${cweStr}: Enforce strict server-side authorization & output encoding\nresponse.setHeader("Content-Security-Policy", "default-src 'self'; object-src 'none';");\nString safeOut = Encode.forHtmlContent(untrustedParam);`,
        attackChainHint:
          idx === 0
            ? "⛓️ Attack Chain Detected: Info Disclosure (/.env.backup · T1552.001) ➔ Forged HS256 SuperAdmin JWT (/api/admin/rbac/elevate · T1078) ➔ Container SUID Root Takeover (uid=0 · T1548)."
            : idx === 1
            ? "⛓️ Attack Chain Detected: Unauthenticated Login SQLi (/doLogin · T1190) ➔ Admin Session Hijack (T1078) ➔ Bulk Wire Transfer Export (T1213)."
            : "⛓️ Attack Chain Detected: Unencoded Parameter Reflection (T1059.007) ➔ DOM Script Execution ➔ Session Token Exfiltration (T1539).",
        aiCopilotExplanation: `🧠 Aegis.SOC™ AI Copilot: Prioritized immediately because ${formal.findingId} has deterministic PoC evidence (${cweStr}) mapped to ${autoSuggestedMitre.map(m => m.techniqueId).join(", ")} on a public-facing Crown Jewel asset with ${isUnauth ? "zero authentication barrier" : "low-privilege authenticated access"}.`,
        customFields: wf.customFields ?? {
          complianceFramework: "PCI-DSS v4.0 Req 6.2 & SOC2 CC6.1",
          internalTrackingId: `EXT-TRACK-00${idx + 1}`,
          releaseBlocker: rawF.severity === "Critical"
        },
        linkedTicket:
          wf.linkedTicket ??
          (idx === 0
            ? {
                system: "Jira",
                ticketKey: "SEC-4910",
                syncState: "Two-Way Synced",
                prUrl: "https://github.com/Danquah12/expedite-consults/pull/104",
                commitSha: "18e2ec4",
                fixVersion: "v4.12.1-hotfix"
              }
            : idx === 1
            ? {
                system: "GitHub Issues",
                ticketKey: "GH-819",
                syncState: "Two-Way Synced",
                prUrl: "https://github.com/Danquah12/expedite-consults/pull/108",
                commitSha: "d838319",
                fixVersion: "v4.12.1-hotfix"
              }
            : undefined),
        retestRequested: wf.retestRequested ?? isRemediatedInBrain,
        suppressedFutureSimilar: wf.suppressedFutureSimilar ?? false,
        falsePositiveReason: wf.falsePositiveReason,
        riskAcceptance: wf.riskAcceptance,
        comments: wf.comments ?? [
          {
            author: "Engine Brain Auto-Triage",
            role: "Autonomous DAST Daemon",
            timestamp: `${formal.discoveryDate} 08:30 UTC`,
            text: `Ingested directly from Engine Brain (${formal.testerTool}). Captured ${formal.evidence.collectedExploitationSamples.length} forensic evidence artifacts and ${formal.evidence.exploitationPictures.length} visual exploitation screenshots.`
          }
        ]
      };
    });
  }, [effectiveRawBrainFindings, primaryTargetUrl, applications, findingWorkflowState, remediatedIds]);

  // Compute live DAST Risk Score (0-100) for every Engine Brain finding using configurable weights
  const enrichedFindings = useMemo(() => {
    return managedFindings
      .map(f => {
        const hasHighImpactMitreTactic = f.mitreTechniques.some(t => t.isHighImpactTactic);
        const riskBreakdown = calculateDastRiskScoreWithWeights(
          {
            severity: f.severity,
            cvssBase: f.cvssBase,
            confidence: f.confidence,
            appCriticality: f.appCriticality,
            exposure: f.exposure,
            isUnauthenticated: f.isUnauthenticated,
            inCisaKevOrRansomware: f.inCisaKevOrRansomware,
            isAuthBypassOrSensitiveData: f.isAuthBypassOrSensitiveData,
            hasHighImpactMitreTactic
          },
          weights
        );
        return { ...f, riskBreakdown };
      })
      .sort((a, b) => b.riskBreakdown.finalScore - a.riskBreakdown.finalScore);
  }, [managedFindings, weights]);

  // Persist to localStorage so `/vuln-management` sidebar route stays synced with `/engine`
  useEffect(() => {
    try {
      localStorage.setItem(
        "xtrike_dast_vuln_mgmt_sync",
        JSON.stringify({
          updatedAt: new Date().toISOString(),
          primaryTargetUrl,
          scopedTargetUrls: effectiveTargets,
          findingsCount: enrichedFindings.length
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [primaryTargetUrl, effectiveTargets, enrichedFindings.length]);

  // Saved Prioritization Views / Filters (including MITRE ATT&CK + CISA KEV + EPSS)
  const [savedViewFilter, setSavedViewFilter] = useState<
    | "ALL"
    | "PUBLIC_CRITICAL_CROWN"
    | "AUTH_BYPASS_PRIVESC"
    | "UNAUTHENTICATED"
    | "CISA_KEV_HIGH_EPSS"
    | "HIGH_RISK_ATTACK_TECHNIQUES"
    | "API_GRAPHQL_ONLY"
    | "SLA_AGING"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterMitreTactic, setFilterMitreTactic] = useState("ALL");
  const [filterMitreTechnique, setFilterMitreTechnique] = useState("ALL");
  const [groupByMode, setGroupByMode] = useState<"FLAT" | "APPLICATION" | "RELATED_ENDPOINT" | "ATTACK_TECHNIQUE">("FLAT");
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [activeFindingId, setActiveFindingId] = useState<string>("DAST-WEB-2026-001");
  const [selectedMitreTechniqueToAdd, setSelectedMitreTechniqueToAdd] = useState<string>("T1190");

  // Workflow & Exception Inputs
  const [bulkStatusTarget, setBulkStatusTarget] = useState<VulnStatus>("Triaged");
  const [bulkAssigneeTarget, setBulkAssigneeTarget] = useState("Elena Rostova (IAM Lead)");
  const [fpReasonInput, setFpReasonInput] = useState("WAF upstream virtual patch blocks payload; verified non-exploitable.");
  const [suppressFutureToggle, setSuppressFutureToggle] = useState(true);
  const [raJustificationInput, setRaJustificationInput] = useState("Compensating mTLS + network segmentation active; scheduled for next sprint.");
  const [raExpiryInput, setRaExpiryInput] = useState("2026-12-31");
  const [raApproverInput, setRaApproverInput] = useState("Kwesi Asiedu (CISO / Risk Owner)");
  const [newCommentText, setNewCommentText] = useState("");

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<
    { id: string; timestamp: string; actor: string; role: string; action: string; detail: string }[]
  >([
    {
      id: "AUD-1001",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
      actor: "Engine Brain DAST Synchronizer",
      role: "Autonomous System",
      action: "ENGINE_BRAIN_RESULTS_INGESTED",
      detail: `Ingested ${effectiveRawBrainFindings.length} live DAST penetration testing findings + exploitation screenshots + auto-suggested MITRE ATT&CK® techniques from Engine Brain for ${effectiveTargets.join(", ")}.`
    }
  ]);

  const appendAudit = (action: string, detail: string) => {
    setAuditLogs(prev => [
      {
        id: `AUD-${1002 + prev.length}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
        actor: `User (${activeRole})`,
        role: activeRole,
        action,
        detail
      },
      ...prev
    ]);
  };

  const filteredFindings = useMemo(() => {
    return enrichedFindings.filter(f => {
      if (scopedBusinessUnit !== "ALL_UNITS") {
        const app = applications.find(a => a.id === f.appId);
        if (app && app.businessUnit !== scopedBusinessUnit) return false;
      }
      if (savedViewFilter === "PUBLIC_CRITICAL_CROWN") {
        if (!f.isCrownJewel || f.exposure !== "Public Internet-Facing" || f.riskBreakdown.finalScore < 80) return false;
      } else if (savedViewFilter === "AUTH_BYPASS_PRIVESC") {
        if (!f.isAuthBypassOrSensitiveData) return false;
      } else if (savedViewFilter === "UNAUTHENTICATED") {
        if (!f.isUnauthenticated) return false;
      } else if (savedViewFilter === "CISA_KEV_HIGH_EPSS") {
        if (!f.inCisaKevOrRansomware && f.epssScorePct < 75) return false;
      } else if (savedViewFilter === "HIGH_RISK_ATTACK_TECHNIQUES") {
        const hasHighImpact = f.mitreTechniques.some(t => t.isHighImpactTactic);
        if (!hasHighImpact || (!f.inCisaKevOrRansomware && f.epssScorePct < 75)) return false;
      } else if (savedViewFilter === "API_GRAPHQL_ONLY") {
        if (!f.isApiOrGraphql) return false;
      } else if (savedViewFilter === "SLA_AGING") {
        if (f.ageDays < 5) return false;
      }
      if (filterSeverity !== "ALL" && f.severity !== filterSeverity) return false;
      if (filterStatus !== "ALL" && f.status !== filterStatus) return false;
      if (filterMitreTactic !== "ALL") {
        if (!f.mitreTechniques.some(t => t.tacticName === filterMitreTactic)) return false;
      }
      if (filterMitreTechnique !== "ALL") {
        if (!f.mitreTechniques.some(t => t.techniqueId === filterMitreTechnique)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          f.id.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.endpoint.toLowerCase().includes(q) ||
          f.cwe.toLowerCase().includes(q) ||
          f.appName.toLowerCase().includes(q) ||
          f.mitreTechniques.some(
            t =>
              t.techniqueId.toLowerCase().includes(q) ||
              t.techniqueName.toLowerCase().includes(q) ||
              t.tacticName.toLowerCase().includes(q)
          );
        if (!match) return false;
      }
      return true;
    });
  }, [
    enrichedFindings,
    scopedBusinessUnit,
    applications,
    savedViewFilter,
    filterSeverity,
    filterStatus,
    filterMitreTactic,
    filterMitreTechnique,
    searchQuery
  ]);

  const activeFinding = useMemo(
    () =>
      enrichedFindings.find(f => f.id === activeFindingId) ||
      filteredFindings[0] ||
      enrichedFindings[0],
    [enrichedFindings, filteredFindings, activeFindingId]
  );

  // Rolled-up Application Risk Scores + Aggregate MITRE ATT&CK Tactics/Techniques per Application
  const enrichedApplications = useMemo(() => {
    return applications.map(app => {
      const appFindings = enrichedFindings.filter(
        f =>
          f.appId === app.id &&
          f.status !== "Fixed" &&
          f.status !== "Verified" &&
          f.status !== "False Positive" &&
          f.status !== "Won't Fix"
      );
      const maxScore = appFindings.reduce((m, f) => Math.max(m, f.riskBreakdown.finalScore), 0);
      const avgScore =
        appFindings.length > 0
          ? Math.round(appFindings.reduce((s, f) => s + f.riskBreakdown.finalScore, 0) / appFindings.length)
          : 0;
      const rolledUpScore =
        appFindings.length > 0 ? Math.min(100, Math.round(maxScore * 0.75 + avgScore * 0.25)) : 14;
      const aggregatedTechniques = Array.from(
        new Map(
          appFindings
            .flatMap(f => f.mitreTechniques)
            .map(t => [t.techniqueId, t])
        ).values()
      );
      return {
        ...app,
        openFindingsCount: appFindings.length,
        criticalCount: appFindings.filter(f => f.riskBreakdown.finalScore >= 80).length,
        highCount: appFindings.filter(f => f.riskBreakdown.finalScore >= 60 && f.riskBreakdown.finalScore < 80).length,
        rolledUpScore,
        aggregatedTechniques
      };
    });
  }, [applications, enrichedFindings]);

  // Workflow Mutators
  const updateFindingField = (id: string, patch: Partial<DastManagedFinding>, auditAction: string, auditDetail: string) => {
    if (activeRole === "Viewer" || activeRole === "Auditor") return;
    setFindingWorkflowState(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch }
    }));
    appendAudit(auditAction, auditDetail);
  };

  // Analyst manual override / add additional MITRE ATT&CK technique to a finding
  const handleAddMitreTechnique = (finding: DastManagedFinding, techniqueIdToAdd: string) => {
    if (activeRole === "Viewer" || activeRole === "Auditor") return;
    const foundTemplate = MITRE_TECHNIQUE_LIBRARY.find(t => t.techniqueId === techniqueIdToAdd);
    if (!foundTemplate) return;
    if (finding.mitreTechniques.some(t => t.techniqueId === techniqueIdToAdd)) return;
    const updatedList: MitreTechniqueMapping[] = [
      ...finding.mitreTechniques,
      { ...foundTemplate, isAutoSuggested: false }
    ];
    updateFindingField(
      finding.id,
      { mitreTechniques: updatedList },
      "MITRE_ATTACK_MANUAL_OVERRIDE_ADDED",
      `Analyst manually mapped ${foundTemplate.techniqueId} (${foundTemplate.techniqueName} · ${foundTemplate.tacticName}) to ${finding.id}.`
    );
  };

  const handleRemoveMitreTechnique = (finding: DastManagedFinding, techniqueIdToRemove: string) => {
    if (activeRole === "Viewer" || activeRole === "Auditor") return;
    if (finding.mitreTechniques.length <= 1) return;
    const updatedList = finding.mitreTechniques.filter(t => t.techniqueId !== techniqueIdToRemove);
    updateFindingField(
      finding.id,
      { mitreTechniques: updatedList },
      "MITRE_ATTACK_TECHNIQUE_REMOVED",
      `Analyst removed MITRE ATT&CK technique ${techniqueIdToRemove} from ${finding.id}.`
    );
  };

  const handleBulkApply = () => {
    if (selectedFindingIds.length === 0 || activeRole === "Viewer" || activeRole === "Auditor") return;
    const nextPatch: typeof findingWorkflowState = { ...findingWorkflowState };
    selectedFindingIds.forEach(id => {
      nextPatch[id] = {
        ...(nextPatch[id] || {}),
        status: bulkStatusTarget,
        assignee: bulkAssigneeTarget
      };
    });
    setFindingWorkflowState(nextPatch);
    appendAudit(
      "BULK_WORKFLOW_OPERATION",
      `Updated ${selectedFindingIds.length} Engine Brain findings (${selectedFindingIds.join(", ")}) → Status: ${bulkStatusTarget}, Assignee: ${bulkAssigneeTarget}.`
    );
    setSelectedFindingIds([]);
  };

  const handleCreateTicket = (
    findingId: string,
    system: "Jira" | "Azure DevOps" | "ServiceNow" | "GitHub Issues"
  ) => {
    const keyMap = {
      Jira: `SEC-${Math.floor(5100 + Math.random() * 800)}`,
      "Azure DevOps": `AB#${Math.floor(12000 + Math.random() * 800)}`,
      ServiceNow: `INC00${Math.floor(96000 + Math.random() * 800)}`,
      "GitHub Issues": `GH-${Math.floor(900 + Math.random() * 200)}`
    };
    const key = keyMap[system];
    updateFindingField(
      findingId,
      {
        status: "Triaged",
        linkedTicket: {
          system,
          ticketKey: key,
          syncState: "Two-Way Synced",
          prUrl: "https://github.com/Danquah12/expedite-consults/pulls",
          commitSha: "18e2ec4",
          fixVersion: "v4.13.0-hotfix"
        }
      },
      "TICKET_TWO_WAY_SYNC_CREATED",
      `Created two-way synced ${system} ticket ${key} for ${findingId}.`
    );
  };

  const handleTriggerRetest = (f: DastManagedFinding) => {
    if (onTriggerSingleRetest && effectiveRawBrainFindings[f.sourceFindingIndex]) {
      onTriggerSingleRetest(f.sourceFindingIndex, effectiveRawBrainFindings[f.sourceFindingIndex]);
    }
    updateFindingField(
      f.id,
      { status: "Verified", retestRequested: true },
      "ENGINE_BRAIN_RETEST_VERIFIED",
      `Triggered live Engine Brain DAST Retest probe on ${f.id} (${f.endpoint}) → Status: Verified.`
    );
  };

  const exportCsvPack = () => {
    const headers = [
      "Finding ID",
      "DAST Risk Score (0-100)",
      "Pure CVSS Score (0-100)",
      "Context Delta",
      "Risk Tier",
      "Severity",
      "EPSS Probability %",
      "EPSS Percentile",
      "CISA KEV",
      "Public Exploit Status",
      "MITRE ATT&CK Tactics",
      "MITRE ATT&CK Techniques",
      "Vulnerability Type",
      "Application",
      "Crown Jewel",
      "Exposure",
      "Authenticated Context",
      "Status",
      "Assignee",
      "Endpoint",
      "Parameter",
      "Age (Days)",
      "SLA Target (Days)",
      "Linked Ticket",
      "Scan ID"
    ];
    const rows = enrichedFindings.map(f => [
      f.id,
      f.riskBreakdown.finalScore,
      f.riskBreakdown.cvssComparableScore,
      `+${f.riskBreakdown.contextDeltaVsCvss}`,
      f.riskBreakdown.tierShort,
      f.severity,
      `${f.epssScorePct}%`,
      `${f.epssPercentile}th`,
      f.inCisaKevOrRansomware ? "YES" : "NO",
      `"${f.publicExploitStatus}"`,
      `"${Array.from(new Set(f.mitreTechniques.map(t => `${t.tacticId}:${t.tacticName}`))).join(" | ")}"`,
      `"${f.mitreTechniques.map(t => `${t.techniqueId} (${t.techniqueName})`).join(" | ")}"`,
      `"${f.vulnType.replace(/"/g, '""')}"`,
      `"${f.appName.replace(/"/g, '""')}"`,
      f.isCrownJewel ? "YES" : "NO",
      f.exposure,
      f.authenticatedContext,
      f.status,
      `"${f.assignee}"`,
      `"${f.endpoint}"`,
      `"${f.parameter}"`,
      f.ageDays,
      f.slaTargetDays,
      f.linkedTicket ? `${f.linkedTicket.system}:${f.linkedTicket.ticketKey}` : "None",
      f.scanId
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `XTRIKE-Engine-Brain-DAST-Vuln-Management-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── TOP ENTERPRISE BANNER: SOURCE DATA = LIVE ENGINE BRAIN & DAST PENETRATION TESTING RESULTS ── */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8", fontWeight: 800, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                🎯 ENTERPRISE DAST VULNERABILITY MANAGEMENT
              </span>
              <span style={{ background: "#090d16", border: "1px solid #1e293b", color: "#cbd5e1", fontWeight: 700, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                ● LIVE SOURCE: ENGINE BRAIN DAST ({enrichedFindings.length} FINDINGS)
              </span>
              <span style={{ background: "#090d16", border: "1px solid #1e293b", color: "#94a3b8", fontWeight: 700, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                0–100 DAST RISK SCORE + CISA KEV + EPSS
              </span>
            </div>
            <h2 style={{ margin: "6px 0 2px 0", fontSize: 16.5, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              XTRIKE™ &amp; Aegis.SOC™ — Enterprise DAST Vulnerability Management &amp; Risk Prioritization Center
            </h2>
            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
              Directly powered by live <strong style={{ color: "#e2e8f0" }}>Engine Brain DAST Penetration Testing telemetry</strong> across <code style={{ color: "#38bdf8" }}>{effectiveTargets.join(", ")}</code> — uniting Application Context, Crown Jewels, Configurable 0–100 Risk Scoring, Proof Screenshots, Two-Way Ticket Sync, and Automated Retests.
            </div>
          </div>

          {/* Right Controls: Developer Mode, Business Unit Scope, 6-Role RBAC & Export */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setDeveloperFriendlyMode(prev => !prev)}
              style={{
                background: developerFriendlyMode ? "#1e293b" : "#090d16",
                border: `1px solid ${developerFriendlyMode ? "#38bdf8" : "#1e293b"}`,
                color: developerFriendlyMode ? "#38bdf8" : "#cbd5e1",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              👩‍💻 {developerFriendlyMode ? "Developer-Friendly Mode: ON" : "Developer View: OFF"}
            </button>

            <select
              value={scopedBusinessUnit}
              onChange={e => setScopedBusinessUnit(e.target.value)}
              style={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: 6, padding: "5px 8px", color: "#cbd5e1", fontSize: 10.5, fontFamily: "monospace", fontWeight: 600 }}
            >
              <option value="ALL_UNITS">Scope: All Business Units</option>
              <option value="Digital Channels & Core Web">BU: Digital Channels &amp; Core Web</option>
              <option value="Release Engineering">BU: Release Engineering</option>
            </select>

            <select
              value={activeRole}
              onChange={e => setActiveRole(e.target.value as any)}
              style={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: 6, padding: "5px 8px", color: "#cbd5e1", fontSize: 10.5, fontFamily: "monospace", fontWeight: 600 }}
            >
              <option value="Security Analyst">RBAC: Security Analyst</option>
              <option value="App Owner">RBAC: App Owner</option>
              <option value="Developer">RBAC: Developer</option>
              <option value="Admin">RBAC: Admin / CISO</option>
              <option value="Auditor">RBAC: Auditor (Read-Only)</option>
              <option value="Viewer">RBAC: Viewer (Read-Only)</option>
            </select>

            <button
              onClick={exportCsvPack}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#f8fafc",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <Download size={12} color="#38bdf8" />
              <span>Export CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Pills for All Expanded Enterprise Categories + MITRE ATT&CK & Vulnerability Intelligence */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #1e293b", paddingTop: 10 }}>
          {[
            { id: "PRIORITIZATION_WHAT_TO_FIX", label: "1. Prioritization & 'What to Fix First' (0–100 Score vs CVSS)" },
            { id: "FINDINGS_MANAGEMENT", label: `2. Findings Management, ATT&CK Detail & Screenshots (${enrichedFindings.length})` },
            { id: "MITRE_ATTACK_VULN_INTEL", label: "3. Vulnerability Intelligence (EPSS + KEV) & MITRE ATT&CK® Matrix" },
            { id: "APP_ASSET_CONTEXT", label: `4. Application & Asset Context (${applications.length} Apps · Aggregate ATT&CK)` },
            { id: "WORKFLOW_FP_EXCEPTIONS", label: "5. Workflow, SLA Escalations, Risk Acceptance & False Positives" },
            { id: "SCAN_COVERAGE_DIFF", label: "6. Scan Coverage, Release Diff (New/Fixed/Recurring) & Attack Chains" },
            { id: "DASHBOARDS_REPORTS", label: "7. Executive & Operational Dashboards, MTTR & Audit Evidence Packs" },
            { id: "ENTERPRISE_RBAC_PHASING", label: `8. Enterprise RBAC, Audit Trail (${auditLogs.length}) & Roadmap` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as any)}
              style={{
                background: activeSubView === tab.id ? "#1e293b" : "#090d16",
                border: activeSubView === tab.id ? "1px solid #38bdf8" : "1px solid #1e293b",
                color: activeSubView === tab.id ? "#f8fafc" : "#94a3b8",
                fontWeight: activeSubView === tab.id ? 700 : 600,
                fontSize: 10.5,
                padding: "6px 11px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW 1: PRIORITIZATION & RISK ("WHAT TO FIX FIRST", CONFIGURABLE WEIGHTS, RISK SCORE VS CVSS, SAVED VIEWS) ── */}
      {activeSubView === "PRIORITIZATION_WHAT_TO_FIX" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Configurable Risk Scoring Weights + Formula Guidance Table */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13, color: "#f8fafc" }}>
                  🎛️ Configurable DAST Risk Score Weights (Live Recalculates All Engine Brain Findings)
                </strong>
                <button
                  onClick={() =>
                    setWeights({
                      severityWeightPct: 40,
                      confidenceWeightPct: 25,
                      appCriticalityWeightPct: 20,
                      exposureWeightPct: 15,
                      boostCisaKev: 12,
                      boostAuthOrData: 8,
                      boostPublicUnauthRule: true,
                      boostHighImpactMitreTactic: true
                    })
                  }
                  style={{ background: "#090d16", border: "1px solid #1e293b", color: "#94a3b8", fontSize: 9.5, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}
                >
                  Reset Recommended (40/25/20/15)
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", color: "#e2e8f0" }}>
                    <span>Severity Weight</span>
                    <strong style={{ color: "#38bdf8" }}>{weights.severityWeightPct}%</strong>
                  </div>
                  <input type="range" min={10} max={60} step={5} value={weights.severityWeightPct} onChange={e => setWeights(w => ({ ...w, severityWeightPct: Number(e.target.value) }))} style={{ width: "100%", accentColor: "#38bdf8" }} />
                  <div style={{ fontSize: 9.5, color: "#94a3b8" }}>Crit=100, High=75, Med=50, Low=25, Info=0</div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", color: "#e2e8f0" }}>
                    <span>Exploitability / Confidence</span>
                    <strong style={{ color: "#38bdf8" }}>{weights.confidenceWeightPct}%</strong>
                  </div>
                  <input type="range" min={10} max={50} step={5} value={weights.confidenceWeightPct} onChange={e => setWeights(w => ({ ...w, confidenceWeightPct: Number(e.target.value) }))} style={{ width: "100%", accentColor: "#38bdf8" }} />
                  <div style={{ fontSize: 9.5, color: "#94a3b8" }}>Confirmed+PoC=100, Confirmed=75, Potential=40</div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", color: "#e2e8f0" }}>
                    <span>Application Criticality</span>
                    <strong style={{ color: "#38bdf8" }}>{weights.appCriticalityWeightPct}%</strong>
                  </div>
                  <input type="range" min={5} max={40} step={5} value={weights.appCriticalityWeightPct} onChange={e => setWeights(w => ({ ...w, appCriticalityWeightPct: Number(e.target.value) }))} style={{ width: "100%", accentColor: "#38bdf8" }} />
                  <div style={{ fontSize: 9.5, color: "#94a3b8" }}>Crown Jewel=100, High=75, Med=50, Low=25</div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", color: "#e2e8f0" }}>
                    <span>Exposure Weight</span>
                    <strong style={{ color: "#38bdf8" }}>{weights.exposureWeightPct}%</strong>
                  </div>
                  <input type="range" min={5} max={40} step={5} value={weights.exposureWeightPct} onChange={e => setWeights(w => ({ ...w, exposureWeightPct: Number(e.target.value) }))} style={{ width: "100%", accentColor: "#38bdf8" }} />
                  <div style={{ fontSize: 9.5, color: "#94a3b8" }}>Public Internet=100, Internal=50, Staging=20</div>
                </div>
              </div>

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 5, fontSize: 10.5, color: "#cbd5e1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={weights.boostPublicUnauthRule}
                    onChange={e => setWeights(w => ({ ...w, boostPublicUnauthRule: e.target.checked }))}
                    style={{ accentColor: "#38bdf8" }}
                  />
                  <span>Custom Boost Rule: <strong>+5 pts</strong> for Unauthenticated Findings on Public Internet Apps</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#cbd5e1" }}>
                  <input
                    type="checkbox"
                    checked={weights.boostHighImpactMitreTactic}
                    onChange={e => setWeights(w => ({ ...w, boostHighImpactMitreTactic: e.target.checked }))}
                    style={{ accentColor: "#38bdf8" }}
                  />
                  <span>MITRE ATT&amp;CK® Tactic Boost: <strong>+5 pts</strong> for High-Impact Tactics (Initial Access · Execution · Privilege Escalation)</span>
                </label>
                <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>
                  External Threat Signals: <strong style={{ color: "#e2e8f0" }}>+{weights.boostCisaKev} CISA KEV</strong> · <strong style={{ color: "#e2e8f0" }}>+{weights.boostAuthOrData} Auth Bypass/Data Exposure</strong> (Cap 100)
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison: DAST Risk Score (0-100) vs Pure CVSS Severity + EPSS + KEV */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <strong style={{ fontSize: 13, color: "#f8fafc" }}>
                ⚖️ Why Context Matters: DAST Risk Score (0–100) vs. Pure CVSS + EPSS + MITRE ATT&amp;CK®
              </strong>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Pure CVSS is theoretical. Our 0–100 DAST Risk Score fuses <strong style={{ color: "#e2e8f0" }}>Crown Jewel criticality</strong>, <strong style={{ color: "#e2e8f0" }}>Public Exposure</strong>, <strong style={{ color: "#e2e8f0" }}>EPSS 30-day probability</strong>, <strong style={{ color: "#e2e8f0" }}>CISA KEV</strong>, and <strong style={{ color: "#e2e8f0" }}>MITRE ATT&amp;CK® Tactics</strong>.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                  <thead>
                    <tr style={{ background: "#090d16", color: "#94a3b8", textAlign: "left" }}>
                      <th style={{ padding: "5px 7px", border: "1px solid #1e293b" }}>Finding &amp; Primary ATT&amp;CK</th>
                      <th style={{ padding: "5px 7px", border: "1px solid #1e293b" }}>Pure CVSS</th>
                      <th style={{ padding: "5px 7px", border: "1px solid #1e293b" }}>DAST Risk Score</th>
                      <th style={{ padding: "5px 7px", border: "1px solid #1e293b" }}>EPSS / KEV / Context Drivers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedFindings.slice(0, 5).map(f => (
                      <tr key={f.id}>
                        <td style={{ padding: "5px 7px", border: "1px solid #1e293b", fontWeight: 700, color: "#f8fafc" }}>
                          <div>{f.id}</div>
                          <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>
                            {f.mitreTechniques[0]?.techniqueId} ({f.mitreTechniques[0]?.tacticName})
                          </div>
                        </td>
                        <td style={{ padding: "5px 7px", border: "1px solid #1e293b", fontFamily: "monospace", color: "#94a3b8" }}>
                          {f.cvssBase} ({f.riskBreakdown.cvssComparableScore})
                        </td>
                        <td style={{ padding: "5px 7px", border: "1px solid #1e293b", fontFamily: "monospace", fontWeight: 800, color: f.riskBreakdown.tierColor }}>
                          {f.riskBreakdown.finalScore}/100 ({f.riskBreakdown.contextDeltaVsCvss >= 0 ? `+${f.riskBreakdown.contextDeltaVsCvss}` : f.riskBreakdown.contextDeltaVsCvss})
                        </td>
                        <td style={{ padding: "5px 7px", border: "1px solid #1e293b", fontSize: 10, color: "#cbd5e1" }}>
                          {f.isCrownJewel ? "Crown Jewel · " : ""}
                          {f.inCisaKevOrRansomware ? "CISA KEV · " : ""}
                          EPSS {f.epssScorePct}% ({f.epssPercentile}th pct)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Saved Prioritization Views + Ranked "What to Fix First" List */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <div>
                <strong style={{ fontSize: 14, color: "#f8fafc" }}>
                  🔥 &ldquo;What to Fix First&rdquo; — Ranked Engine Brain DAST Findings &amp; Saved Prioritization Views
                </strong>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Click any Saved View filter (including High-Risk ATT&amp;CK® Techniques + KEV) or click any finding to inspect its MITRE ATT&amp;CK® Mapping, Proof Screenshots, and Remediation Patch.
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "ALL", label: `All Ranked (${enrichedFindings.length})` },
                  { id: "PUBLIC_CRITICAL_CROWN", label: "Public Critical on Crown Jewels" },
                  { id: "HIGH_RISK_ATTACK_TECHNIQUES", label: "High-Risk ATT&CK + KEV" },
                  { id: "AUTH_BYPASS_PRIVESC", label: "Auth Bypass & Sensitive Data" },
                  { id: "UNAUTHENTICATED", label: "Unauthenticated Exploitable" },
                  { id: "CISA_KEV_HIGH_EPSS", label: "CISA KEV / High EPSS (>75%)" },
                  { id: "API_GRAPHQL_ONLY", label: "API & GraphQL Findings" }
                ].map(sv => (
                  <button
                    key={sv.id}
                    onClick={() => setSavedViewFilter(sv.id as any)}
                    style={{
                      background: savedViewFilter === sv.id ? "#1e293b" : "#090d16",
                      border: `1px solid ${savedViewFilter === sv.id ? "#38bdf8" : "#1e293b"}`,
                      color: savedViewFilter === sv.id ? "#f8fafc" : "#94a3b8",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "5px 9px",
                      borderRadius: 5,
                      cursor: "pointer"
                    }}
                  >
                    {sv.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredFindings.map((f, idx) => (
                <div
                  key={f.id}
                  onClick={() => {
                    setActiveFindingId(f.id);
                    setActiveSubView("FINDINGS_MANAGEMENT");
                  }}
                  style={{
                    background: "#090d16",
                    border: "1px solid #1e293b",
                    borderLeft: `4px solid ${f.riskBreakdown.tierColor}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 260 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#cbd5e1", fontFamily: "monospace", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                        PRIORITY #{idx + 1} · {f.id}
                      </span>
                      <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>{f.title}</strong>
                      {f.isCrownJewel && (
                        <span style={{ background: "rgba(250,204,21,0.18)", border: "1px solid #facc15", color: "#fde047", fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>
                          👑 CROWN JEWEL
                        </span>
                      )}
                      {f.inCisaKevOrRansomware && (
                        <span style={{ background: "rgba(244,63,94,0.2)", border: "1px solid #f43f5e", color: "#fda4af", fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>
                          🔥 CISA KEV · EPSS {f.epssScorePct}% ({f.epssPercentile}th pct)
                        </span>
                      )}
                      {/* Primary & Multi-Technique MITRE ATT&CK Badges */}
                      {f.mitreTechniques.map(mt => (
                        <span
                          key={mt.techniqueId}
                          style={{
                            background: "rgba(192,132,252,0.16)",
                            border: "1px solid #c084fc",
                            color: "#e9d5ff",
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontFamily: "monospace"
                          }}
                        >
                          ⚔️ {mt.techniqueId}: {mt.techniqueName} [{mt.tacticName}]
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: 10.5, color: "#94a3b8", fontFamily: "monospace" }}>
                      <strong style={{ color: "#38bdf8" }}>{f.appName}</strong> &nbsp;|&nbsp; Endpoint: <code style={{ color: "#f8fafc" }}>{f.endpoint}</code> &nbsp;|&nbsp; Exploit: <strong style={{ color: "#fda4af" }}>{f.publicExploitStatus}</strong>
                    </div>

                    <div style={{ fontSize: 10, color: "#cbd5e1", fontFamily: "monospace" }}>
                      Formula: Sev({f.riskBreakdown.severityWeighted}) + Conf({f.riskBreakdown.confidenceWeighted}) + AppCrit({f.riskBreakdown.appCritWeighted}) + Exp({f.riskBreakdown.exposureWeighted}) + Boosts(+{f.riskBreakdown.cisaKevBoost + f.riskBreakdown.authOrDataBoost + f.riskBreakdown.customRuleBoost + f.riskBreakdown.mitreHighImpactBoost}) = <strong style={{ color: f.riskBreakdown.tierColor }}>{f.riskBreakdown.finalScore}/100</strong> (vs Pure CVSS {f.cvssBase})
                    </div>
                    <div style={{ fontSize: 10, color: "#fde68a" }}>{f.aiCopilotExplanation}</div>
                  </div>

                  {/* Quick Actions on Each Ranked Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleTriggerRetest(f)}
                      style={{
                        background: f.status === "Verified" ? "#10b981" : "rgba(16,185,129,0.18)",
                        border: "1px solid #10b981",
                        color: f.status === "Verified" ? "#050811" : "#10b981",
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "5px 9px",
                        borderRadius: 5,
                        cursor: "pointer"
                      }}
                    >
                      {f.status === "Verified" ? "✓ Verified Fixed" : "⚡ Run DAST Retest"}
                    </button>
                    <button
                      onClick={() => handleCreateTicket(f.id, "Jira")}
                      style={{
                        background: "rgba(56,189,248,0.16)",
                        border: "1px solid #38bdf8",
                        color: "#38bdf8",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "5px 9px",
                        borderRadius: 5,
                        cursor: "pointer"
                      }}
                    >
                      {f.linkedTicket ? `🔗 ${f.linkedTicket.ticketKey}` : "+ Jira Ticket"}
                    </button>
                    <div style={{ textAlign: "right", fontFamily: "monospace", minWidth: 74 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: f.riskBreakdown.tierColor, lineHeight: 1 }}>
                        {f.riskBreakdown.finalScore}<span style={{ fontSize: 10, color: "#94a3b8" }}>/100</span>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: f.riskBreakdown.tierColor }}>
                        {f.riskBreakdown.tierShort.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: FINDINGS MANAGEMENT + MITRE ATT&CK DETAIL & OVERRIDE + ENGINE BRAIN SCREENSHOTS + REMEDIATION LIBRARY ── */}
      {activeSubView === "FINDINGS_MANAGEMENT" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Search, MITRE Tactic/Technique Filters, Grouping & Bulk Operations Bar */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by ID, CWE, MITRE Technique (T1190, T1548), endpoint, parameter..."
                style={{ flex: 1, minWidth: 200, background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", color: "#f8fafc", fontSize: 11 }}
              />
              <select value={groupByMode} onChange={e => setGroupByMode(e.target.value as any)} style={{ background: "#050811", border: "1px solid #38bdf8", borderRadius: 6, padding: "6px 8px", color: "#38bdf8", fontSize: 10.5, fontWeight: 800 }}>
                <option value="FLAT">View: Master Ranked List</option>
                <option value="ATTACK_TECHNIQUE">⚔️ Attack Technique View (Group by ATT&amp;CK)</option>
                <option value="APPLICATION">Group By: Application Inventory</option>
                <option value="RELATED_ENDPOINT">Group Related: Endpoint + Vuln Type</option>
              </select>
              <select value={filterMitreTactic} onChange={e => setFilterMitreTactic(e.target.value)} style={{ background: "#050811", border: "1px solid #c084fc", borderRadius: 6, padding: "6px 8px", color: "#e9d5ff", fontSize: 10.5, fontWeight: 800 }}>
                <option value="ALL">MITRE Tactic: All Tactics</option>
                <option value="Initial Access">TA0001 · Initial Access</option>
                <option value="Execution">TA0002 · Execution</option>
                <option value="Privilege Escalation">TA0004 · Privilege Escalation</option>
                <option value="Credential Access">TA0006 · Credential Access</option>
                <option value="Collection">TA0009 · Collection</option>
              </select>
              <select value={filterMitreTechnique} onChange={e => setFilterMitreTechnique(e.target.value)} style={{ background: "#050811", border: "1px solid rgba(192,132,252,0.5)", borderRadius: 6, padding: "6px 8px", color: "#e9d5ff", fontSize: 10.5 }}>
                <option value="ALL">MITRE Technique: All IDs</option>
                {MITRE_TECHNIQUE_LIBRARY.map(t => (
                  <option key={t.techniqueId} value={t.techniqueId}>
                    {t.techniqueId} — {t.techniqueName}
                  </option>
                ))}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", color: "#f8fafc", fontSize: 10.5 }}>
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Triaged">Triaged</option>
                <option value="In Progress">In Progress</option>
                <option value="Fixed">Fixed</option>
                <option value="Verified">Verified</option>
                <option value="Accepted Risk">Accepted Risk</option>
                <option value="Won't Fix">Won&apos;t Fix</option>
                <option value="False Positive">False Positive</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, fontSize: 10.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "#38bdf8", fontFamily: "monospace", fontWeight: 800 }}>
                  ☑️ {selectedFindingIds.length} Selected
                </span>
                <select value={bulkStatusTarget} onChange={e => setBulkStatusTarget(e.target.value as VulnStatus)} style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", color: "#f8fafc", fontSize: 10.5 }}>
                  <option value="Triaged">Bulk Status → Triaged</option>
                  <option value="In Progress">Bulk Status → In Progress</option>
                  <option value="Fixed">Bulk Status → Fixed</option>
                  <option value="Verified">Bulk Status → Verified</option>
                  <option value="Accepted Risk">Bulk Status → Accepted Risk</option>
                  <option value="Won't Fix">Bulk Status → Won&apos;t Fix</option>
                  <option value="False Positive">Bulk Status → False Positive</option>
                </select>
                <input
                  type="text"
                  value={bulkAssigneeTarget}
                  onChange={e => setBulkAssigneeTarget(e.target.value)}
                  style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", color: "#f8fafc", fontSize: 10.5 }}
                />
                <button
                  onClick={handleBulkApply}
                  disabled={selectedFindingIds.length === 0}
                  style={{ background: selectedFindingIds.length > 0 ? "#0284c7" : "rgba(255,255,255,0.06)", color: "#fff", border: "none", borderRadius: 4, padding: "5px 10px", fontWeight: 800, cursor: "pointer" }}
                >
                  Execute Bulk Operation
                </button>
              </div>
              {onTriggerBatchRetest && (
                <button
                  onClick={onTriggerBatchRetest}
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", color: "#10b981", fontSize: 10.5, fontWeight: 800, padding: "5px 10px", borderRadius: 5, cursor: "pointer" }}
                >
                  ✅ Verify All Fixes via Engine Brain Batch Retest
                </button>
              )}
            </div>
          </div>

          {/* Left Findings Table + Right Engine Brain Detail Drawer with MITRE ATT&CK Section & Visual Screenshots */}
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1.15fr", gap: 12, alignItems: "start" }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                <thead>
                  <tr style={{ background: "#050811", color: "#94a3b8", textAlign: "left" }}>
                    <th style={{ padding: "7px 6px" }}>
                      <input
                        type="checkbox"
                        checked={selectedFindingIds.length === filteredFindings.length && filteredFindings.length > 0}
                        onChange={e => setSelectedFindingIds(e.target.checked ? filteredFindings.map(f => f.id) : [])}
                      />
                    </th>
                    <th style={{ padding: "7px 6px" }}>DAST Risk</th>
                    <th style={{ padding: "7px 6px" }}>Finding, EPSS &amp; Primary ATT&amp;CK®</th>
                    <th style={{ padding: "7px 6px" }}>Endpoint &amp; App</th>
                    <th style={{ padding: "7px 6px" }}>Status &amp; Recurrence</th>
                    <th style={{ padding: "7px 6px" }}>Assignee &amp; Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.map(f => (
                    <tr
                      key={f.id}
                      onClick={() => setActiveFindingId(f.id)}
                      style={{
                        background: activeFinding?.id === f.id ? "rgba(56,189,248,0.15)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer"
                      }}
                    >
                      <td style={{ padding: "7px 6px" }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedFindingIds.includes(f.id)}
                          onChange={e =>
                            setSelectedFindingIds(prev =>
                              e.target.checked ? [...prev, f.id] : prev.filter(i => i !== f.id)
                            )
                          }
                        />
                      </td>
                      <td style={{ padding: "7px 6px", fontFamily: "monospace" }}>
                        <div style={{ fontWeight: 900, fontSize: 12, color: f.riskBreakdown.tierColor }}>
                          {f.riskBreakdown.finalScore}/100
                        </div>
                        <div style={{ fontSize: 9, color: "#94a3b8" }}>CVSS {f.cvssBase}</div>
                      </td>
                      <td style={{ padding: "7px 6px" }}>
                        <div style={{ fontWeight: 800, color: "#f8fafc" }}>{f.id} · {f.vulnType}</div>
                        <div style={{ fontSize: 9.5, color: "#94a3b8", fontFamily: "monospace" }}>
                          {f.cwe} · {f.owasp} · EPSS {f.epssScorePct}% ({f.epssPercentile}th)
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                          {f.mitreTechniques.map(mt => (
                            <span
                              key={mt.techniqueId}
                              style={{
                                background: "rgba(192,132,252,0.16)",
                                border: "1px solid rgba(192,132,252,0.5)",
                                color: "#e9d5ff",
                                fontSize: 8.5,
                                fontWeight: 800,
                                padding: "1px 5px",
                                borderRadius: 3,
                                fontFamily: "monospace"
                              }}
                            >
                              ⚔️ {mt.techniqueId} ({mt.tacticName})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "7px 6px", fontFamily: "monospace", fontSize: 10 }}>
                        <div style={{ color: "#38bdf8" }}>{f.endpoint}</div>
                        <div style={{ color: "#cbd5e1" }}>{f.appName} {f.isCrownJewel ? "👑" : ""}</div>
                      </td>
                      <td style={{ padding: "7px 6px" }}>
                        <span style={{ fontWeight: 800, color: f.status === "Verified" ? "#34d399" : "#38bdf8", fontSize: 10 }}>
                          {f.status}
                        </span>
                        <div style={{ fontSize: 9, color: "#fde047", fontFamily: "monospace" }}>
                          {f.releaseComparisonState} {f.reopenedCount > 0 ? `(Reopened ×${f.reopenedCount})` : ""}
                        </div>
                      </td>
                      <td style={{ padding: "7px 6px", fontSize: 10 }}>
                        <div style={{ color: "#e2e8f0" }}>{f.assignee}</div>
                        {f.linkedTicket && (
                          <div style={{ color: "#10b981", fontFamily: "monospace", fontSize: 9.5 }}>
                            🔗 {f.linkedTicket.system}: {f.linkedTicket.ticketKey}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Detail Drawer with Dedicated MITRE ATT&CK® Mapping + Vulnerability Intelligence + Engine Brain Evidence + Screenshots */}
            {activeFinding && (
              <div style={{ background: "#050811", border: `1.5px solid ${activeFinding.riskBreakdown.tierColor}`, borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#38bdf8", fontWeight: 800 }}>
                      {activeFinding.id} · {activeFinding.cwe} · {activeFinding.owasp} · {activeFinding.mitreAttack}
                    </div>
                    <h3 style={{ margin: "3px 0", fontSize: 13.5, color: "#f8fafc" }}>{activeFinding.title}</h3>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>
                      Scanner: {activeFinding.scannerDaemon} · Scan ID: {activeFinding.scanId}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: activeFinding.riskBreakdown.tierColor }}>
                      {activeFinding.riskBreakdown.finalScore}/100
                    </div>
                    <div style={{ fontSize: 9, color: "#cbd5e1" }}>Pure CVSS: {activeFinding.cvssBase}</div>
                  </div>
                </div>

                {/* Dedicated MITRE ATT&CK® Mapping & Vulnerability Intelligence Card (Multi-Technique + Official Links + Analyst Manual Override) */}
                <div style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <strong style={{ fontSize: 11.5, color: "#e9d5ff" }}>
                      ⚔️ MITRE ATT&amp;CK® Mapping &amp; Vulnerability Intelligence (EPSS · CISA KEV · Exploit PoC)
                    </strong>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontFamily: "monospace", fontSize: 9.5 }}>
                      <span style={{ background: "rgba(244,63,94,0.2)", border: "1px solid #f43f5e", color: "#fda4af", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                        EPSS: {activeFinding.epssScorePct}% ({activeFinding.epssPercentile}th Pct)
                      </span>
                      <span style={{ background: "rgba(16,185,129,0.18)", border: "1px solid #10b981", color: "#a7f3d0", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                        {activeFinding.publicExploitStatus}
                      </span>
                      {activeFinding.inCisaKevOrRansomware && (
                        <span style={{ background: "#e11d48", color: "#fff", padding: "1px 6px", borderRadius: 4, fontWeight: 900 }}>
                          🔥 CISA KEV ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mapped MITRE ATT&CK Techniques List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activeFinding.mitreTechniques.map(mt => (
                      <div key={mt.techniqueId} style={{ background: "#090d16", border: "1px solid rgba(192,132,252,0.3)", borderRadius: 5, padding: "6px 8px", fontSize: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ background: "#7e22ce", color: "#fff", fontFamily: "monospace", fontWeight: 900, fontSize: 9.5, padding: "1px 6px", borderRadius: 3 }}>
                              {mt.techniqueId}
                            </span>
                            <strong style={{ color: "#f8fafc" }}>{mt.techniqueName}</strong>
                            <span style={{ color: "#fde047", fontFamily: "monospace", fontSize: 9.5 }}>
                              [{mt.tacticId} · {mt.tacticName}]
                            </span>
                            <span style={{ color: mt.isAutoSuggested ? "#38bdf8" : "#34d399", fontFamily: "monospace", fontSize: 8.5 }}>
                              {mt.isAutoSuggested ? "(Auto-Suggested by Engine Brain)" : "(Analyst Manual Override)"}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <a
                              href={mt.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#38bdf8", fontSize: 9.5, fontFamily: "monospace", textDecoration: "underline" }}
                            >
                              Official MITRE ATT&amp;CK ↗
                            </a>
                            {activeFinding.mitreTechniques.length > 1 && (
                              <button
                                onClick={() => handleRemoveMitreTechnique(activeFinding, mt.techniqueId)}
                                style={{ background: "transparent", border: "1px solid rgba(244,63,94,0.4)", color: "#fda4af", fontSize: 8.5, padding: "1px 5px", borderRadius: 3, cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ color: "#cbd5e1", marginTop: 3, fontSize: 9.5 }}>
                          {mt.relationDescription}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Analyst Manual Override / Add Additional MITRE ATT&CK Technique */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 9.5, color: "#cbd5e1", fontFamily: "monospace" }}>
                      Analyst Override / Add Technique:
                    </span>
                    <select
                      value={selectedMitreTechniqueToAdd}
                      onChange={e => setSelectedMitreTechniqueToAdd(e.target.value)}
                      style={{ background: "#050811", border: "1px solid rgba(192,132,252,0.5)", borderRadius: 4, padding: "3px 6px", color: "#e9d5ff", fontSize: 9.5, fontFamily: "monospace" }}
                    >
                      {MITRE_TECHNIQUE_LIBRARY.map(t => (
                        <option key={t.techniqueId} value={t.techniqueId}>
                          {t.techniqueId} — {t.techniqueName} ({t.tacticName})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddMitreTechnique(activeFinding, selectedMitreTechniqueToAdd)}
                      style={{ background: "rgba(192,132,252,0.22)", border: "1px solid #c084fc", color: "#e9d5ff", fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}
                    >
                      + Map Technique
                    </button>
                  </div>
                </div>

                {/* Attack Chain Hint & Custom Compliance Fields */}
                <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 6, padding: 8, fontSize: 10.5, color: "#fda4af" }}>
                  {activeFinding.attackChainHint}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 10, fontFamily: "monospace" }}>
                  <span style={{ background: "#0f172a", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 4, color: "#cbd5e1" }}>
                    Compliance: {activeFinding.customFields.complianceFramework}
                  </span>
                  <span style={{ background: "#0f172a", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 4, color: "#38bdf8" }}>
                    Tracking ID: {activeFinding.customFields.internalTrackingId}
                  </span>
                  {activeFinding.customFields.releaseBlocker && (
                    <span style={{ background: "rgba(244,63,94,0.2)", border: "1px solid #f43f5e", padding: "2px 7px", borderRadius: 4, color: "#fda4af", fontWeight: 800 }}>
                      🚫 CI/CD RELEASE BLOCKER
                    </span>
                  )}
                </div>

                {/* Two-Way Ticket Creation & CI/CD PR Link */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["Jira", "Azure DevOps", "ServiceNow", "GitHub Issues"] as const).map(sys => (
                    <button
                      key={sys}
                      onClick={() => handleCreateTicket(activeFinding.id, sys)}
                      style={{ background: "rgba(56,189,248,0.14)", border: "1px solid rgba(56,189,248,0.4)", color: "#38bdf8", fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 5, cursor: "pointer" }}
                    >
                      + {sys}
                    </button>
                  ))}
                  <button
                    onClick={() => handleTriggerRetest(activeFinding)}
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", color: "#10b981", fontSize: 10, fontWeight: 900, padding: "4px 9px", borderRadius: 5, cursor: "pointer" }}
                  >
                    🔄 Trigger Engine Brain Retest
                  </button>
                </div>

                {/* Captured Engine Brain HTTP Request/Response Evidence */}
                <div>
                  <strong style={{ fontSize: 11, color: "#38bdf8", display: "block", marginBottom: 4 }}>
                    🔬 Engine Brain Captured HTTP Request / Response &amp; Proof:
                  </strong>
                  <pre style={{ margin: 0, background: "#090d16", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 8, fontSize: 9.5, color: "#bae6fd", overflowX: "auto", whiteSpace: "pre-wrap" }}>
{activeFinding.evidenceRequest}

--- RESPONSE ---
{activeFinding.evidenceResponse}
                  </pre>
                </div>

                {/* Visual Exploitation Screenshots from Engine Brain */}
                {activeFinding.screenshots.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 11, color: "#fde047", display: "block", marginBottom: 4 }}>
                      📸 Engine Brain Visual Exploitation Screenshots ({activeFinding.screenshots.length}):
                    </strong>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                      {activeFinding.screenshots.slice(0, 1).map(sc => (
                        <div key={sc.figureId} style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: 6 }}>
                          <div style={{ fontSize: 9.5, fontFamily: "monospace", color: "#38bdf8", marginBottom: 4 }}>
                            [{sc.figureId}] {sc.title}
                          </div>
                          <img src={sc.svgDataUri} alt={sc.title} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remediation Guidance (Switches between Security Analyst & Developer-Friendly View) */}
                <div>
                  <strong style={{ fontSize: 11, color: "#34d399", display: "block", marginBottom: 4 }}>
                    🛠️ {developerFriendlyMode ? "Developer-Friendly Fix Guide (Simplified Engineering Steps)" : "Technical Remediation & Code Patch Library"}:
                  </strong>
                  <div style={{ fontSize: 10.5, color: "#e2e8f0", marginBottom: 6, lineHeight: 1.45 }}>
                    {developerFriendlyMode ? activeFinding.howToFixDeveloperFriendly : activeFinding.howToFixTechnical}
                  </div>
                  <pre style={{ margin: 0, background: "#090d16", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: 8, fontSize: 9.5, color: "#a7f3d0", overflowX: "auto", whiteSpace: "pre-wrap" }}>
{activeFinding.codeRemediationSnippet}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW 3 (NEW): VULNERABILITY INTELLIGENCE (EPSS + CISA KEV + CVSS) & MITRE ATT&CK® MATRIX ── */}
      {activeSubView === "MITRE_ATTACK_VULN_INTEL" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Row 1: Vulnerability Intelligence Correlation Table (CVSS vs EPSS vs CISA KEV vs DAST Risk Score) */}
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(192,132,252,0.4)", borderRadius: 8, padding: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 14, color: "#e9d5ff" }}>
                🧠 Vulnerability Intelligence &amp; Threat Context Matrix (CVSS + EPSS 30-Day Probability + CISA KEV + MITRE ATT&amp;CK®)
              </strong>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Answers <em>&ldquo;How bad is it theoretically (CVSS)?&rdquo;</em> + <em>&ldquo;Is it being exploited in the wild (EPSS + CISA KEV)?&rdquo;</em> + <em>&ldquo;How would an attacker use this in a real attack chain (MITRE ATT&amp;CK®)?&rdquo;</em>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                <thead>
                  <tr style={{ background: "#050811", color: "#e9d5ff", textAlign: "left" }}>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>Finding &amp; CWE</th>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>CVSS v3.1</th>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>EPSS (30-Day Prob &amp; Pct)</th>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>CISA KEV &amp; Public Exploit</th>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>Mapped MITRE ATT&amp;CK® Techniques &amp; Tactics</th>
                    <th style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>0–100 DAST Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedFindings.map(f => (
                    <tr key={f.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 900, color: "#f8fafc" }}>{f.id} · {f.vulnType}</div>
                        <div style={{ fontSize: 9.5, color: "#38bdf8", fontFamily: "monospace" }}>{f.cwe} · {f.owasp} · {f.endpoint}</div>
                      </td>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)", fontFamily: "monospace", color: "#cbd5e1" }}>
                        <strong>{f.cvssBase}</strong> ({f.severity})
                      </td>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)", fontFamily: "monospace" }}>
                        <div style={{ color: f.epssScorePct >= 75 ? "#fda4af" : "#fde047", fontWeight: 900 }}>
                          {f.epssScorePct}% Probability
                        </div>
                        <div style={{ fontSize: 9, color: "#94a3b8" }}>{f.epssPercentile}th Percentile</div>
                      </td>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)", fontSize: 10 }}>
                        {f.inCisaKevOrRansomware ? (
                          <span style={{ background: "rgba(244,63,94,0.2)", border: "1px solid #f43f5e", color: "#fda4af", padding: "1px 6px", borderRadius: 4, fontWeight: 800, fontFamily: "monospace" }}>
                            🔥 CISA KEV ACTIVE
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>Not in KEV</span>
                        )}
                        <div style={{ fontSize: 9.5, color: "#a7f3d0", marginTop: 3 }}>{f.publicExploitStatus}</div>
                      </td>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {f.mitreTechniques.map(mt => (
                            <div key={mt.techniqueId} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 9.5, fontFamily: "monospace" }}>
                              <a
                                href={mt.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ background: "#7e22ce", color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 900, textDecoration: "none" }}
                              >
                                {mt.techniqueId} ↗
                              </a>
                              <strong style={{ color: "#f8fafc" }}>{mt.techniqueName}</strong>
                              <span style={{ color: "#fde047" }}>[{mt.tacticName}]</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "7px 8px", border: "1px solid var(--border)", textAlign: "center", fontFamily: "monospace" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: f.riskBreakdown.tierColor }}>
                          {f.riskBreakdown.finalScore}/100
                        </div>
                        <div style={{ fontSize: 9, color: f.riskBreakdown.tierColor }}>{f.riskBreakdown.tierShort}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2: Attack Technique Grouped View + 14-Tactic Enterprise Coverage vs Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <strong style={{ fontSize: 13, color: "#38bdf8" }}>
                ⚔️ &ldquo;Attack Technique&rdquo; Ranked View (Findings Grouped by MITRE ATT&amp;CK® Technique)
              </strong>
              {MITRE_TECHNIQUE_LIBRARY.map(tech => {
                const matching = enrichedFindings.filter(f =>
                  f.mitreTechniques.some(m => m.techniqueId === tech.techniqueId)
                );
                if (matching.length === 0) return null;
                return (
                  <div key={tech.techniqueId} style={{ background: "#050811", border: "1px solid rgba(192,132,252,0.3)", borderRadius: 6, padding: "8px 10px", fontSize: 10.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <span style={{ background: "#7e22ce", color: "#fff", fontFamily: "monospace", fontWeight: 900, fontSize: 9.5, padding: "1px 6px", borderRadius: 3, marginRight: 6 }}>
                          {tech.techniqueId}
                        </span>
                        <strong style={{ color: "#f8fafc" }}>{tech.techniqueName}</strong>
                        <span style={{ color: "#fde047", fontFamily: "monospace", fontSize: 9.5, marginLeft: 6 }}>
                          [{tech.tacticId} · {tech.tacticName}]
                        </span>
                      </div>
                      <a href={tech.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: 9.5, fontFamily: "monospace" }}>
                        attack.mitre.org ↗
                      </a>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 9.5, marginTop: 3 }}>{tech.relationDescription}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                      {matching.map(mf => (
                        <span
                          key={mf.id}
                          onClick={() => {
                            setActiveFindingId(mf.id);
                            setActiveSubView("FINDINGS_MANAGEMENT");
                          }}
                          style={{ background: "rgba(244,63,94,0.16)", border: "1px solid #f43f5e", color: "#fda4af", fontSize: 9.5, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontWeight: 800 }}
                        >
                          {mf.id} (Score {mf.riskBreakdown.finalScore}/100)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 14-Tactic MITRE ATT&CK Coverage & Gap Analysis */}
            <div style={{ background: "var(--surface-2)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <strong style={{ fontSize: 13, color: "#34d399" }}>
                🛡️ MITRE ATT&amp;CK® Tactic Detections vs. DAST Coverage Matrix
              </strong>
              <div style={{ fontSize: 10.5, color: "#cbd5e1" }}>
                Highlights which adversary tactics have active DAST detections vs. where additional authenticated or runtime coverage is recommended.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, fontFamily: "monospace" }}>
                {[
                  { tactic: "TA0001 · Initial Access", status: "ACTIVE DETECTION (T1190)", color: "#f43f5e" },
                  { tactic: "TA0002 · Execution", status: "ACTIVE DETECTION (T1059.007)", color: "#fb923c" },
                  { tactic: "TA0004 · Privilege Escalation", status: "ACTIVE DETECTION (T1548, T1078)", color: "#f43f5e" },
                  { tactic: "TA0006 · Credential Access", status: "ACTIVE DETECTION (T1552.001, T1539)", color: "#facc15" },
                  { tactic: "TA0009 · Collection", status: "ACTIVE DETECTION (T1213)", color: "#fb923c" },
                  { tactic: "TA0005 · Defense Evasion", status: "COVERED VIA JWT / WAF PROBES", color: "#38bdf8" },
                  { tactic: "TA0007 · Discovery", status: "COVERED VIA DEEP SPIDER", color: "#34d399" },
                  { tactic: "TA0010 · Exfiltration", status: "GAP: ENABLE EGRESS DLP TELEMETRY", color: "#94a3b8" }
                ].map(row => (
                  <div key={row.tactic} style={{ background: "#050811", border: `1px solid ${row.color}55`, borderRadius: 5, padding: "6px 8px" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 800 }}>{row.tactic}</div>
                    <div style={{ color: row.color, fontSize: 9, marginTop: 2 }}>{row.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 4: APPLICATION & ASSET CONTEXT (PORTFOLIOS, MULTI-ENV, TECH STACK FROM ENGINE BRAIN, AGGREGATE ATT&CK, COVERAGE %) ── */}
      {activeSubView === "APP_ASSET_CONTEXT" && (
        <div style={{ background: "var(--surface-2)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <strong style={{ fontSize: 14, color: "#f8fafc" }}>
              🏛️ Application &amp; Asset Context (Engine Brain Tech Stack, Crown Jewels &amp; Aggregate MITRE ATT&amp;CK® Exposure)
            </strong>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              Displays live technology stacks fingerprinted by the Engine Brain (`serverHeader`, `tlsVersion`, `deepSpider`), multi-URL/multi-environment inventories, Crown Jewel flags, Aggregate ATT&amp;CK® Techniques per Application, and authenticated URL coverage %.
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
              <thead>
                <tr style={{ background: "#050811", color: "#38bdf8", textAlign: "left" }}>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Application, Portfolio &amp; Multi-URLs</th>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Criticality &amp; Crown Jewel</th>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Detected Tech Stack (Engine Brain)</th>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Aggregate MITRE ATT&amp;CK® Exposure</th>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Scan Frequency &amp; Auth Coverage %</th>
                  <th style={{ padding: "8px", border: "1px solid var(--border)" }}>Rolled-Up App Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {enrichedApplications.map(app => (
                  <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 900, color: "#f8fafc", fontSize: 11.5 }}>
                        {app.name} {app.isCrownJewel && "👑"}
                      </div>
                      <div style={{ fontSize: 9.5, color: "#fde047", fontFamily: "monospace" }}>
                        Portfolio: {app.portfolioGroup} · Env: {app.activeEnvironment} ({app.environments.join("/")})
                      </div>
                      <div style={{ fontSize: 9.5, color: "#38bdf8", fontFamily: "monospace" }}>
                        URLs: {app.baseUrls.join(" | ")}
                      </div>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid var(--border)" }}>
                      <button
                        onClick={() =>
                          setAppOverrides(prev => ({
                            ...prev,
                            [app.id]: {
                              isCrownJewel: !app.isCrownJewel,
                              criticality: !app.isCrownJewel ? "Critical" : "High"
                            }
                          }))
                        }
                        style={{
                          background: app.isCrownJewel ? "rgba(250,204,21,0.2)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${app.isCrownJewel ? "#facc15" : "var(--border)"}`,
                          color: app.isCrownJewel ? "#fde047" : "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                      >
                        {app.isCrownJewel ? "👑 Crown Jewel (Crit=100)" : "Set Crown Jewel"}
                      </button>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 3 }}>
                        {app.detectedTechStack.map(t => (
                          <span key={t} style={{ background: "#050811", border: "1px solid rgba(56,189,248,0.3)", color: "#bae6fd", fontSize: 9, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 9.5, color: "#94a3b8", fontFamily: "monospace" }}>{app.tlsAndHeaderSummary}</div>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {app.aggregatedTechniques.length > 0 ? (
                          app.aggregatedTechniques.map(mt => (
                            <span
                              key={mt.techniqueId}
                              style={{ background: "rgba(192,132,252,0.16)", border: "1px solid #c084fc", color: "#e9d5ff", fontSize: 8.5, fontFamily: "monospace", padding: "1px 5px", borderRadius: 3, fontWeight: 800 }}
                            >
                              {mt.techniqueId} ({mt.tacticName})
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: 9, color: "#34d399", fontFamily: "monospace" }}>No Active ATT&amp;CK Exposure</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 10 }}>
                      <div style={{ color: "#34d399", fontWeight: 800 }}>
                        Auth Success: {app.authenticatedScanSuccessRate}% · URL Cov: {app.urlCoveragePct}%
                      </div>
                      <div style={{ color: "#cbd5e1" }}>
                        {app.spideredPagesCount} Spidered Pages · {app.discoveredParamsCount} Params
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: 9 }}>{app.scanFrequency} · {app.lastScanDate}</div>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid var(--border)", textAlign: "center", fontFamily: "monospace" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: app.rolledUpScore >= 80 ? "#f43f5e" : "#fb923c" }}>
                        {app.rolledUpScore}/100
                      </div>
                      <div style={{ fontSize: 9.5, color: "#94a3b8" }}>{app.openFindingsCount} Open Findings</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VIEW 4: WORKFLOW, OWNERSHIP, EXCEPTION MANAGEMENT, AUTO-EXPIRY & FALSE POSITIVES ── */}
      {activeSubView === "WORKFLOW_FP_EXCEPTIONS" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <strong style={{ fontSize: 13.5, color: "#fde047" }}>
              ⚖️ Exception Management, Risk Acceptance (Auto-Expiry) &amp; False Positive Suppression
            </strong>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a7f3d0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoAcceptNonProdMediumPolicy}
                onChange={e => setAutoAcceptNonProdMediumPolicy(e.target.checked)}
              />
              <span>Custom Policy Active: <strong>Auto-accept Medium findings on Non-Prod/Staging for 90 days</strong></span>
            </label>

            <select
              value={activeFinding?.id || ""}
              onChange={e => setActiveFindingId(e.target.value)}
              style={{ background: "#050811", border: "1px solid var(--border)", borderRadius: 5, padding: "6px 8px", color: "#f8fafc", fontSize: 11 }}
            >
              {enrichedFindings.map(f => (
                <option key={f.id} value={f.id}>
                  [{f.id} · Score {f.riskBreakdown.finalScore}] {f.title} ({f.status})
                </option>
              ))}
            </select>

            <div style={{ background: "#050811", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <strong style={{ fontSize: 11.5, color: "#38bdf8" }}>1. False Positive Management + Future Scan Suppression</strong>
              <input
                type="text"
                value={fpReasonInput}
                onChange={e => setFpReasonInput(e.target.value)}
                style={{ background: "#090d16", border: "1px solid var(--border)", borderRadius: 4, padding: "5px 8px", color: "#f8fafc", fontSize: 10.5 }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "#cbd5e1" }}>
                <input type="checkbox" checked={suppressFutureToggle} onChange={e => setSuppressFutureToggle(e.target.checked)} />
                <span>Suppress similar future findings on same endpoint + CWE across subsequent scans</span>
              </label>
              <button
                onClick={() =>
                  activeFinding &&
                  updateFindingField(
                    activeFinding.id,
                    {
                      status: "False Positive",
                      falsePositiveReason: fpReasonInput,
                      suppressedFutureSimilar: suppressFutureToggle
                    },
                    "FALSE_POSITIVE_SUPPRESSED",
                    `Marked ${activeFinding.id} as False Positive (Suppress Future=${suppressFutureToggle}). Reason: ${fpReasonInput}`
                  )
                }
                style={{ alignSelf: "flex-start", background: "rgba(56,189,248,0.2)", border: "1px solid #38bdf8", color: "#38bdf8", fontSize: 10.5, fontWeight: 800, padding: "5px 10px", borderRadius: 5, cursor: "pointer" }}
              >
                Mark False Positive &amp; Suppress Rule
              </button>
            </div>

            <div style={{ background: "#050811", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <strong style={{ fontSize: 11.5, color: "#fde047" }}>2. Accept Risk / Won&apos;t Fix (Justification + Expiry + CISO Approver)</strong>
              <input
                type="text"
                value={raJustificationInput}
                onChange={e => setRaJustificationInput(e.target.value)}
                style={{ background: "#090d16", border: "1px solid var(--border)", borderRadius: 4, padding: "5px 8px", color: "#f8fafc", fontSize: 10.5 }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  type="date"
                  value={raExpiryInput}
                  onChange={e => setRaExpiryInput(e.target.value)}
                  style={{ background: "#090d16", border: "1px solid var(--border)", borderRadius: 4, padding: "5px 8px", color: "#fde047", fontSize: 10.5 }}
                />
                <input
                  type="text"
                  value={raApproverInput}
                  onChange={e => setRaApproverInput(e.target.value)}
                  style={{ background: "#090d16", border: "1px solid var(--border)", borderRadius: 4, padding: "5px 8px", color: "#f8fafc", fontSize: 10.5 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() =>
                    activeFinding &&
                    updateFindingField(
                      activeFinding.id,
                      {
                        status: "Accepted Risk",
                        riskAcceptance: {
                          justification: raJustificationInput,
                          expiryDate: raExpiryInput,
                          approver: raApproverInput,
                          approvedAt: new Date().toISOString().slice(0, 10)
                        }
                      },
                      "RISK_ACCEPTED",
                      `Accepted Risk on ${activeFinding.id} until ${raExpiryInput} by ${raApproverInput}.`
                    )
                  }
                  style={{ background: "rgba(250,204,21,0.2)", border: "1px solid #facc15", color: "#fde047", fontSize: 10.5, fontWeight: 800, padding: "5px 10px", borderRadius: 5, cursor: "pointer" }}
                >
                  Approve Risk Acceptance
                </button>
                <button
                  onClick={() =>
                    activeFinding &&
                    updateFindingField(
                      activeFinding.id,
                      { status: "Won't Fix" },
                      "MARKED_WONT_FIX",
                      `Marked ${activeFinding.id} as Won't Fix.`
                    )
                  }
                  style={{ background: "rgba(148,163,184,0.2)", border: "1px solid #94a3b8", color: "#cbd5e1", fontSize: 10.5, fontWeight: 800, padding: "5px 10px", borderRadius: 5, cursor: "pointer" }}
                >
                  Mark Won&apos;t Fix
                </button>
              </div>
            </div>
          </div>

          {/* SLA Escalation Rules & Team Workload */}
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(244,63,94,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 13.5, color: "#fda4af" }}>
              ⏰ SLA Timers, Automated Escalation Rules &amp; Team Workload
            </strong>
            <div style={{ background: "#050811", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 6, padding: 10, fontSize: 11, color: "#e2e8f0" }}>
              <div>• <strong>Critical Tier (80–100):</strong> 7-Day SLA → Auto-escalates to CISO &amp; VP Engineering at Day 5.</div>
              <div>• <strong>High Tier (60–79):</strong> 14-Day SLA → Auto-escalates to App Owner Lead at Day 10.</div>
              <div>• <strong>Medium Tier (40–59):</strong> 30-Day SLA → Included in weekly SecOps digest.</div>
            </div>
            <strong style={{ fontSize: 12, color: "#38bdf8", marginTop: 4 }}>👥 Active Assignee Workload &amp; Watchers</strong>
            {enrichedFindings.map(f => (
              <div key={f.id} style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px", fontSize: 10.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#f8fafc" }}>{f.id}</strong> · {f.assignee}
                  <div style={{ fontSize: 9.5, color: "#94a3b8", fontFamily: "monospace" }}>
                    Watchers: {f.watchers.join(", ")}
                  </div>
                </div>
                <span style={{ fontFamily: "monospace", color: f.ageDays >= f.slaTargetDays ? "#f43f5e" : "#34d399", fontWeight: 800 }}>
                  Age: {f.ageDays}d / {f.slaTargetDays}d SLA
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW 5: SCAN & COVERAGE MANAGEMENT + RELEASE COMPARISON DIFF + ATTACK PATHS ── */}
      {activeSubView === "SCAN_COVERAGE_DIFF" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 13.5, color: "#38bdf8" }}>
              🛰️ Scan History, Release Comparison Diff (Before / After Release) &amp; Coverage Gaps
            </strong>
            {[
              { scanId: "SCAN-BRAIN-CURRENT", release: "v4.12.1 (Current Engine Brain Run)", newCount: 1, recurringCount: 3, fixedCount: Object.keys(remediatedIds).length || 1, authMode: "Authenticated + Unauthenticated" },
              { scanId: "SCAN-BRAIN-PREV-02", release: "v4.12.0 (Pre-Hotfix Release)", newCount: 2, recurringCount: 3, fixedCount: 2, authMode: "Authenticated JWT Session" },
              { scanId: "SCAN-BRAIN-PREV-01", release: "v4.11.4 (Q3 Baseline)", newCount: 5, recurringCount: 0, fixedCount: 0, authMode: "Unauthenticated Surface" }
            ].map(sc => (
              <div key={sc.scanId} style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: 10, fontSize: 10.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#f8fafc" }}>
                  <span>{sc.scanId} — {sc.release}</span>
                  <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{sc.authMode}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 5, fontFamily: "monospace" }}>
                  <span style={{ color: "#fda4af" }}>New: {sc.newCount}</span>
                  <span style={{ color: "#fde047" }}>Recurring: {sc.recurringCount}</span>
                  <span style={{ color: "#34d399" }}>Fixed: {sc.fixedCount}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(244,63,94,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 13.5, color: "#fda4af" }}>
              ⛓️ Multi-Finding Attack Path &amp; Chaining Analysis (Engine Brain Graph)
            </strong>
            {enrichedFindings.map(f => (
              <div key={f.id} style={{ background: "#050811", border: "1px solid rgba(244,63,94,0.28)", borderRadius: 6, padding: 9, fontSize: 10.5 }}>
                <div style={{ fontWeight: 800, color: "#f8fafc" }}>{f.id} · {f.title}</div>
                <div style={{ color: "#fda4af", marginTop: 3, fontFamily: "monospace" }}>{f.attackChainHint}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW 6: EXECUTIVE & OPERATIONAL DASHBOARDS, MTTR & AUDIT EVIDENCE PACKS ── */}
      {activeSubView === "DASHBOARDS_REPORTS" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 13.5, color: "#38bdf8" }}>
              📊 Executive &amp; Operational Telemetry (Risk Reduction Trend &amp; New vs. Fixed)
            </strong>
            {[
              { period: "Cycle 1 (Q2)", newF: 6, fixedF: 1, netRisk: 86 },
              { period: "Cycle 2 (Q3)", newF: 3, fixedF: 4, netRisk: 74 },
              { period: "Current Engine Brain Run", newF: 1, fixedF: 2 + Object.keys(remediatedIds).length, netRisk: 62 },
              { period: "Post-7d SLA Target", newF: 0, fixedF: 5, netRisk: 18 }
            ].map(r => (
              <div key={r.period} style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", display: "flex", justifyContent: "space-between", fontSize: 10.5, fontFamily: "monospace" }}>
                <span style={{ color: "#f8fafc", fontWeight: 800 }}>{r.period}</span>
                <span style={{ color: "#fda4af" }}>New: {r.newF}</span>
                <span style={{ color: "#34d399" }}>Fixed: {r.fixedF}</span>
                <span style={{ color: "#38bdf8", fontWeight: 900 }}>Posture Risk: {r.netRisk}/100</span>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ fontSize: 13.5, color: "#34d399" }}>
              📦 Pre-Built Compliance Reports &amp; Audit-Ready Evidence Packs
            </strong>
            <div style={{ fontSize: 11, color: "#cbd5e1" }}>
              Generate complete audit-ready packages containing Engine Brain findings, 0–100 DAST Risk Score breakdowns, visual exploitation screenshots, status histories, and risk acceptance justifications.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <button onClick={exportCsvPack} style={{ background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", color: "#10b981", fontSize: 11, fontWeight: 800, padding: "7px 12px", borderRadius: 6, cursor: "pointer" }}>
                📊 Download Top Risks &amp; Aging CSV/Excel Pack
              </button>
              {onOpenFormalReportTab && (
                <button onClick={onOpenFormalReportTab} style={{ background: "rgba(56,189,248,0.2)", border: "1px solid #38bdf8", color: "#38bdf8", fontSize: 11, fontWeight: 800, padding: "7px 12px", borderRadius: 6, cursor: "pointer" }}>
                  📄 Open Executive Summary &amp; Printable PDF Dossier
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 7: ENTERPRISE RBAC, AUDIT TRAIL & SUGGESTED PHASING (MVP → v1.1 → v1.2+) ── */}
      {activeSubView === "ENTERPRISE_RBAC_PHASING" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 8, padding: 14 }}>
            <strong style={{ fontSize: 13, color: "#38bdf8", display: "block", marginBottom: 8 }}>
              📋 Immutable Enterprise Audit Log (SOC2 / PCI-DSS / ISO 27001 Compliance)
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 290, overflowY: "auto" }}>
              {auditLogs.map(a => (
                <div key={a.id} style={{ background: "#050811", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px", fontSize: 10, fontFamily: "monospace" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#38bdf8", fontWeight: 800 }}>
                    <span>[{a.id}] {a.action}</span>
                    <span style={{ color: "#94a3b8" }}>{a.timestamp}</span>
                  </div>
                  <div style={{ color: "#f8fafc", marginTop: 2 }}>{a.detail}</div>
                  <div style={{ color: "#10b981", marginTop: 2 }}>Actor: {a.actor} · Role: {a.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface-2)", border: "1px solid rgba(192,132,252,0.35)", borderRadius: 8, padding: 14 }}>
            <strong style={{ fontSize: 13, color: "#c084fc", display: "block", marginBottom: 8 }}>
              🗺️ Enterprise DAST Vulnerability Management Phasing Matrix (All 3 Phases Active)
            </strong>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
              <thead>
                <tr style={{ background: "#050811", color: "#c084fc", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", border: "1px solid var(--border)" }}>Phase</th>
                  <th style={{ padding: "6px 8px", border: "1px solid var(--border)" }}>Focus</th>
                  <th style={{ padding: "6px 8px", border: "1px solid var(--border)" }}>Key Features Implemented</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", fontWeight: 900, color: "#34d399" }}>MVP (Live)</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#f8fafc" }}>Usable prioritization + workflow</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#cbd5e1" }}>Application inventory, findings list with 0–100 risk score, prioritization view, status + assignment, FP/risk acceptance, dashboard, export, ticket creation</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", fontWeight: 900, color: "#38bdf8" }}>v1.1 (Live)</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#f8fafc" }}>Enterprise readiness</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#cbd5e1" }}>SLAs, BU/team scoping, immutable audit log, scheduled reports, richer dashboards, Engine Brain retest tracking</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", fontWeight: 900, color: "#c084fc" }}>v1.2+ (Live)</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#f8fafc" }}>Differentiation</td>
                  <td style={{ padding: "6px 8px", border: "1px solid var(--border)", color: "#cbd5e1" }}>Configurable scoring sliders, advanced grouping, Developer-Friendly View, CI/CD PR links, custom auto-accept policies, AI Copilot assistance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
