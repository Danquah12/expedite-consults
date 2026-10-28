/**
 * XTRIKE SAST Desk — Native AppSec Posture KPIs, Code-to-Runtime Sensor Telemetry,
 * Repository & Service Mesh Health, and XTRIKE SAST CLI (v4.2.0) Distribution Catalog.
 *
 * Designed natively for Platform 05 (XTRIKE SAST Desk).
 */

export interface CyberVulnKpiCard {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  delta: string;
  deltaDirection: "up" | "down";
  deltaContext: string;
  accentColor: string;
  subLabel: string;
}

export interface RiskInstanceSlice {
  severity: "Critical" | "High" | "Medium" | "Low" | "Guarded";
  proofState: string;
  countLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DeploymentInstanceItem {
  name: string;
  repoSlug: string;
  count: number;
  countLabel: string;
  color: string;
  primaryCwe: string;
}

export interface VulnTrendPoint {
  date: string;
  openVulnerabilities: number;
  openCves: number;
  verifiedRemediations: number;
}

export interface AntivirusKpiCard {
  id: string;
  title: string;
  value: string;
  delta: string;
  isPositiveTrend: boolean;
  sparkline: number[];
  color: string;
  ruleRef: string;
}

export interface OsHostDistribution {
  os: string;
  hosts: number;
  color: string;
}

export interface ActivityDetectionPoint {
  period: string;
  astDataflow: number;
  runtimeGuard: number;
  ciReleaseGate: number;
}

export interface RecentDetectionItem {
  id: string;
  signature: string;
  host: string;
  os: "Java / Spring" | "Python / FastAPI" | "Node / TypeScript" | "Go / gRPC";
  severity: "Critical" | "High" | "Medium";
  action: "Blocked at Gate" | "Runtime Guarded" | "Patch PR Opened";
  timestamp: string;
  cwe: string;
  pluginId: string;
}

export interface FleetProblemRow {
  host: string;
  service: string;
  state: "CRIT" | "WARN" | "UNKNOWN" | "OK";
  pluginOutput: string;
  since: string;
  cwe: string;
  proofState: string;
}

export interface TopAlerterBar {
  host: string;
  critCount: number;
  warnCount: number;
  unknownCount: number;
  totalAlerts: number;
  primaryCwe: string;
}

export interface HoneycombHostCell {
  id: string;
  hostname: string;
  cluster: string;
  state: "OK" | "WARN" | "CRIT" | "UNKNOWN";
  servicesCount: number;
  openFindings: number;
  latencyMs: number;
  language: string;
}

export interface XtrikeDistroPackage {
  id: string;
  distroFamily: "Ubuntu / Debian APT" | "RHEL / Rocky / Amazon Linux" | "macOS Homebrew & Apple Silicon" | "Docker / Helm & GitHub Actions";
  distroVersion: string;
  codename: string;
  architecture: string;
  edition: "CLI Standard" | "Enterprise Runner";
  packageFilename: string;
  downloadUrl: string;
  wgetCommand: string;
  installCommand: string;
  sha256: string;
}

export interface XtrikeDistroAccordionGroup {
  family: "Ubuntu / Debian APT" | "RHEL / Rocky / Amazon Linux" | "macOS Homebrew & Apple Silicon" | "Docker / Helm & GitHub Actions";
  badge: string;
  description: string;
  defaultOpen?: boolean;
  packages: XtrikeDistroPackage[];
}

// ============================================================================
// 1. SAST & CVE POSTURE KPI TELEMETRY
// ============================================================================

export const CYBER_VULN_KPI_SUMMARY: CyberVulnKpiCard[] = [
  {
    id: "open-vulns",
    label: "Open SAST Findings",
    value: "16.8K",
    numericValue: 16840,
    delta: "+12.3%",
    deltaDirection: "up",
    deltaContext: "across 82 repos & 4 AST engines",
    accentColor: "#9e2a2b",
    subLabel: "XQL · DeepFlow · StructSCA · AST-Query",
  },
  {
    id: "open-cves",
    label: "Reachable SCA CVEs",
    value: "6.4K",
    numericValue: 6412,
    delta: "-6.2%",
    deltaDirection: "down",
    deltaContext: "verified call-graph reachability",
    accentColor: "#8b4528",
    subLabel: "Filtered by active sink invocation",
  },
  {
    id: "open-remediations",
    label: "Verified AST Fixes",
    value: "1.3K",
    numericValue: 1318,
    delta: "+18.4%",
    deltaDirection: "up",
    deltaContext: "passed post-fix retest suite",
    accentColor: "#2d6a4f",
    subLabel: "Language-matched diff + unit test",
  },
];

export const OPEN_RISK_INSTANCES: RiskInstanceSlice[] = [
  {
    severity: "Critical",
    proofState: "PROVEN_EXPLOITABLE / DATAFLOW_CONFIRMED",
    countLabel: "1.4K",
    count: 1420,
    percentage: 8.8,
    color: "#9e2a2b",
  },
  {
    severity: "High",
    proofState: "DATAFLOW_CONFIRMED (0 Sanitizers)",
    countLabel: "6.0K",
    count: 6010,
    percentage: 37.3,
    color: "#8b4528",
  },
  {
    severity: "Medium",
    proofState: "DETECTED_STATIC (Context-Dependent)",
    countLabel: "7.1K",
    count: 7120,
    percentage: 44.2,
    color: "#996b1f",
  },
  {
    severity: "Low",
    proofState: "NEEDS_MANUAL_VALIDATION",
    countLabel: "1.3K",
    count: 1310,
    percentage: 8.1,
    color: "#6b705c",
  },
  {
    severity: "Guarded",
    proofState: "MITIGATED_BY_GUARD",
    countLabel: "265",
    count: 265,
    percentage: 1.6,
    color: "#2d6a4f",
  },
];

export const OPEN_DEPLOYMENT_INSTANCES: DeploymentInstanceItem[] = [
  { name: "Payment & Ledger Core", repoSlug: "xtrike/payment-settlement-core", count: 3420, countLabel: "3.4K", color: "#9e2a2b", primaryCwe: "CWE-89" },
  { name: "Identity & OAuth Gateway", repoSlug: "xtrike/identity-oauth-gateway", count: 3290, countLabel: "3.3K", color: "#8b4528", primaryCwe: "CWE-347" },
  { name: "GraphQL & Mobile BFF", repoSlug: "xtrike/graphql-mobile-bff", count: 2810, countLabel: "2.8K", color: "#996b1f", primaryCwe: "CWE-918" },
  { name: "Order Fulfillment API", repoSlug: "xtrike/order-fulfillment-api", count: 2640, countLabel: "2.6K", color: "#b56547", primaryCwe: "CWE-502" },
  { name: "Dynamic Rule Compiler", repoSlug: "xtrike/dynamic-rule-compiler", count: 2490, countLabel: "2.5K", color: "#7f5539", primaryCwe: "CWE-94" },
  { name: "Terraform & EKS IaC", repoSlug: "xtrike/terraform-eks-infra", count: 1210, countLabel: "1.2K", color: "#6b705c", primaryCwe: "CWE-798" },
  { name: "Webhook & Event Broker", repoSlug: "xtrike/webhook-event-broker", count: 843, countLabel: "843", color: "#3a5a40", primaryCwe: "CWE-78" },
  { name: "AI-BOM & RAG Pipeline", repoSlug: "xtrike/ai-bom-rag-pipeline", count: 314, countLabel: "314", color: "#2d6a4f", primaryCwe: "CWE-22" },
];

export const VULNERABILITY_TRENDS_TIMELINE: VulnTrendPoint[] = [
  { date: "W1", openVulnerabilities: 11200, openCves: 7400, verifiedRemediations: 620 },
  { date: "W2", openVulnerabilities: 12400, openCves: 7150, verifiedRemediations: 740 },
  { date: "W3", openVulnerabilities: 11900, openCves: 6980, verifiedRemediations: 810 },
  { date: "W4", openVulnerabilities: 13600, openCves: 6890, verifiedRemediations: 890 },
  { date: "W5", openVulnerabilities: 14100, openCves: 6720, verifiedRemediations: 960 },
  { date: "W6", openVulnerabilities: 15300, openCves: 6610, verifiedRemediations: 1080 },
  { date: "W7", openVulnerabilities: 14900, openCves: 6550, verifiedRemediations: 1150 },
  { date: "W8", openVulnerabilities: 16100, openCves: 6490, verifiedRemediations: 1240 },
  { date: "W9", openVulnerabilities: 16840, openCves: 6412, verifiedRemediations: 1318 },
];

// ============================================================================
// 2. CODE-TO-RUNTIME SENSOR & EXPLOIT PREVENTION TELEMETRY
// ============================================================================

export const ANTIVIRUS_PERFORMANCE_KPIS: AntivirusKpiCard[] = [
  {
    id: "sink-triggers",
    title: "Active Sink Triggers",
    value: "213",
    delta: "+18% vs 30d",
    isPositiveTrend: false,
    sparkline: [95, 112, 130, 128, 155, 174, 190, 213],
    color: "#9e2a2b",
    ruleRef: "PLG-001..PLG-401",
  },
  {
    id: "exploits-blocked",
    title: "Exploit Probes Halted",
    value: "32",
    delta: "+14% vs 30d",
    isPositiveTrend: true,
    sparkline: [14, 18, 16, 22, 24, 27, 29, 32],
    color: "#2d6a4f",
    ruleRef: "PTES Stage-4 Guard",
  },
  {
    id: "taint-entrypoints",
    title: "Unauth Taint Routes",
    value: "26",
    delta: "-11% vs 30d",
    isPositiveTrend: true,
    sparkline: [38, 35, 34, 31, 30, 29, 27, 26],
    color: "#8b4528",
    ruleRef: "DeepFlow SSA Trace",
  },
  {
    id: "manual-proof-queue",
    title: "Manual Proof Queue",
    value: "26",
    delta: "Needs Triage",
    isPositiveTrend: true,
    sparkline: [34, 33, 31, 29, 28, 27, 26, 26],
    color: "#996b1f",
    ruleRef: "NEEDS_VALIDATION",
  },
  {
    id: "auto-patched",
    title: "AST Diffs Verified",
    value: "73",
    delta: "+29% vs 30d",
    isPositiveTrend: true,
    sparkline: [32, 38, 44, 49, 55, 61, 68, 73],
    color: "#2d6a4f",
    ruleRef: "TC-SQLI / TC-CODEI",
  },
  {
    id: "posture-score",
    title: "Release Gate Score",
    value: "84/100",
    delta: "+6 pts",
    isPositiveTrend: true,
    sparkline: [68, 70, 73, 75, 78, 80, 82, 84],
    color: "#8b4528",
    ruleRef: "NIST 800-115 Gate",
  },
];

export const MONITORED_HOSTS_BY_OS: OsHostDistribution[] = [
  { os: "Linux x86_64 Build & Runtime Nodes", hosts: 468, color: "#8b4528" },
  { os: "Kubernetes / EKS Microservice Pods", hosts: 406, color: "#2d6a4f" },
  { os: "GitHub Actions / GitLab CI Runners", hosts: 320, color: "#996b1f" },
  { os: "macOS IDE & MCP Agent Workstations", hosts: 249, color: "#6b705c" },
  { os: "Windows Server / .NET Core Workers", hosts: 122, color: "#9e2a2b" },
  { os: "ARM64 Graviton Container Nodes", hosts: 100, color: "#7f5539" },
  { os: "Serverless & Edge Runtime Functions", hosts: 100, color: "#3a5a40" },
];

export const ACTIVITY_DETECTION_TIMELINE: ActivityDetectionPoint[] = [
  { period: "Q1", astDataflow: 180, runtimeGuard: 90, ciReleaseGate: 140 },
  { period: "Q2", astDataflow: 230, runtimeGuard: 115, ciReleaseGate: 175 },
  { period: "Q3", astDataflow: 210, runtimeGuard: 130, ciReleaseGate: 195 },
  { period: "Q4", astDataflow: 290, runtimeGuard: 160, ciReleaseGate: 240 },
  { period: "Q5", astDataflow: 340, runtimeGuard: 195, ciReleaseGate: 280 },
  { period: "Q6", astDataflow: 310, runtimeGuard: 210, ciReleaseGate: 305 },
  { period: "Q7", astDataflow: 380, runtimeGuard: 245, ciReleaseGate: 350 },
  { period: "Q8", astDataflow: 425, runtimeGuard: 280, ciReleaseGate: 395 },
];

export const MOST_RECENT_DETECTIONS: RecentDetectionItem[] = [
  {
    id: "DET-9041",
    signature: "Unparameterized SQL Concatenation in Statement.executeQuery()",
    host: "SqlInjectionLesson5a.java:12",
    os: "Java / Spring",
    severity: "Critical",
    action: "Blocked at Gate",
    timestamp: "2 mins ago",
    cwe: "CWE-89",
    pluginId: "PLG-001",
  },
  {
    id: "DET-9040",
    signature: "JavaCompiler.getTask() Without Proven Input / Execution Guard",
    host: "BlindScript.java:42",
    os: "Java / Spring",
    severity: "Medium",
    action: "Runtime Guarded",
    timestamp: "9 mins ago",
    cwe: "CWE-94",
    pluginId: "PLG-054",
  },
  {
    id: "DET-9039",
    signature: "Python Dynamic exec(compile(...)) on Untrusted Rule Expression",
    host: "rule_runner.py:88",
    os: "Python / FastAPI",
    severity: "Critical",
    action: "Blocked at Gate",
    timestamp: "17 mins ago",
    cwe: "CWE-94",
    pluginId: "PLG-046",
  },
  {
    id: "DET-9038",
    signature: "SSRF Outbound URL Fetch Reaching Cloud Metadata 169.254.169.254",
    host: "WebhookDispatcher.ts:64",
    os: "Node / TypeScript",
    severity: "High",
    action: "Patch PR Opened",
    timestamp: "28 mins ago",
    cwe: "CWE-918",
    pluginId: "PLG-168",
  },
  {
    id: "DET-9037",
    signature: "Unsafe ObjectInputStream.readObject() Without JEP 290 Filter",
    host: "SessionSerializer.java:105",
    os: "Java / Spring",
    severity: "Critical",
    action: "Blocked at Gate",
    timestamp: "41 mins ago",
    cwe: "CWE-502",
    pluginId: "PLG-061",
  },
];

// ============================================================================
// 3. XTRIKE REPOSITORY, RUNNER & SERVICE MESH TELEMETRY
// ============================================================================

export const XTRIKE_FLEET_OVERVIEW = {
  totalHosts: 710,
  hostsUp: 709,
  hostsDown: 0,
  hostsUnreachable: 1,
  totalServices: 15808,
  servicesOk: 14839,
  servicesWarn: 691,
  servicesUnknown: 67,
  servicesCrit: 210,
  totalEvents: 1001,
};

export const XTRIKE_HOST_PROBLEMS: FleetProblemRow[] = [
  {
    host: "payment-settlement-core",
    service: "XQL Gate · CWE-89 SQL Injection",
    state: "CRIT",
    pluginOutput: "CRIT - DATAFLOW_CONFIRMED: Unbound @RequestParam account reaches Statement.executeQuery() at line 12 (0 sanitizers)",
    since: "14m ago",
    cwe: "CWE-89",
    proofState: "DATAFLOW_CONFIRMED",
  },
  {
    host: "dynamic-rule-compiler",
    service: "AST-Query · PLG-054 JavaCompiler",
    state: "WARN",
    pluginOutput: "WARN - NEEDS_MANUAL_VALIDATION: javax.tools.JavaCompiler.getTask() detected in BlindScript.java; verify fileObjects source & -proc:none",
    since: "32m ago",
    cwe: "CWE-94",
    proofState: "NEEDS_MANUAL_VALIDATION",
  },
  {
    host: "webhook-event-broker",
    service: "DeepFlow · CWE-918 SSRF Egress",
    state: "CRIT",
    pluginOutput: "CRIT - PROVEN_EXPLOITABLE: User callbackUrl reaches HttpClient.send() without scheme pinning or RFC1918/IMDSv2 block",
    since: "1h 08m ago",
    cwe: "CWE-918",
    proofState: "PROVEN_EXPLOITABLE",
  },
  {
    host: "identity-oauth-gateway",
    service: "StructSCA · CWE-347 JWT Signature",
    state: "CRIT",
    pluginOutput: "CRIT - DATAFLOW_CONFIRMED: jwt.decode() invoked without signature verification on Authorization Bearer token",
    since: "2h 15m ago",
    cwe: "CWE-347",
    proofState: "DATAFLOW_CONFIRMED",
  },
  {
    host: "order-fulfillment-api",
    service: "XQL Gate · CWE-502 Deserialization",
    state: "WARN",
    pluginOutput: "WARN - DATAFLOW_CONFIRMED: ObjectInputStream.readObject() lacks JEP 290 ObjectInputFilter allowlist",
    since: "3h 40m ago",
    cwe: "CWE-502",
    proofState: "DATAFLOW_CONFIRMED",
  },
];

export const XTRIKE_TOP_ALERTERS: TopAlerterBar[] = [
  { host: "payment-settlement-core", critCount: 48, warnCount: 64, unknownCount: 4, totalAlerts: 116, primaryCwe: "CWE-89 SQLi" },
  { host: "identity-oauth-gateway", critCount: 39, warnCount: 52, unknownCount: 6, totalAlerts: 97, primaryCwe: "CWE-347 JWT" },
  { host: "graphql-mobile-bff", critCount: 31, warnCount: 49, unknownCount: 5, totalAlerts: 85, primaryCwe: "CWE-918 SSRF" },
  { host: "order-fulfillment-api", critCount: 24, warnCount: 41, unknownCount: 3, totalAlerts: 68, primaryCwe: "CWE-502 Deser" },
  { host: "dynamic-rule-compiler", critCount: 12, warnCount: 38, unknownCount: 8, totalAlerts: 58, primaryCwe: "CWE-94 CodeGen" },
  { host: "webhook-event-broker", critCount: 19, warnCount: 27, unknownCount: 2, totalAlerts: 48, primaryCwe: "CWE-78 CmdInj" },
];

const REPO_CLUSTERS = [
  { prefix: "payment-ledger-svc", cluster: "Core Banking & Ledger", lang: "Java 21" },
  { prefix: "oauth-token-gateway", cluster: "Identity & Access", lang: "Go 1.22" },
  { prefix: "graphql-edge-bff", cluster: "API Gateway Mesh", lang: "TypeScript" },
  { prefix: "order-worker-node", cluster: "Fulfillment Engine", lang: "Python 3.12" },
  { prefix: "compiler-sandbox-vm", cluster: "Rule Execution Tier", lang: "Java 17" },
  { prefix: "terraform-eks-mod", cluster: "Cloud IaC & Helm", lang: "HCL / YAML" },
];

export const XTRIKE_HONEYCOMB_HOSTS: HoneycombHostCell[] = Array.from({ length: 72 }, (_, idx) => {
  const group = REPO_CLUSTERS[idx % REPO_CLUSTERS.length];
  let state: "OK" | "WARN" | "CRIT" | "UNKNOWN" = "OK";
  if (idx === 3 || idx === 14 || idx === 27 || idx === 41 || idx === 58) {
    state = "CRIT";
  } else if (idx === 7 || idx === 19 || idx === 33 || idx === 46 || idx === 52 || idx === 64) {
    state = "WARN";
  } else if (idx === 61) {
    state = "UNKNOWN";
  }
  return {
    id: `NODE-${String(idx + 1).padStart(3, "0")}`,
    hostname: `${group.prefix}-${String((idx % 12) + 1).padStart(2, "0")}`,
    cluster: group.cluster,
    state,
    servicesCount: 18 + (idx % 14),
    openFindings: state === "CRIT" ? 4 + (idx % 5) : state === "WARN" ? 1 + (idx % 3) : 0,
    latencyMs: 11 + ((idx * 7) % 42),
    language: group.lang,
  };
});

// ============================================================================
// 4. XTRIKE SAST CLI & PROOF SANDBOX RUNNER PACKAGES (v4.2.0)
// ============================================================================

export const XTRIKE_DISTRO_ACCORDION_GROUPS: XtrikeDistroAccordionGroup[] = [
  {
    family: "Ubuntu / Debian APT",
    badge: "DEB · x86_64 / ARM64",
    description: "Native Debian/Ubuntu package containing the 4 XTRIKE SAST AST engines (XQL, DeepFlow, StructSCA, AST-Query), 401 CWE plugins, and local PTES proof sandbox.",
    defaultOpen: true,
    packages: [
      {
        id: "ubuntu-2404-cli",
        distroFamily: "Ubuntu / Debian APT",
        distroVersion: "Ubuntu 24.04 LTS / 26.04",
        codename: "noble / resolute",
        architecture: "amd64",
        edition: "CLI Standard",
        packageFilename: "xtrike-sast-cli_4.2.0_amd64.deb",
        downloadUrl: "/api/xtrike-package?pkg=xtrike-sast-cli_4.2.0_amd64.deb",
        wgetCommand: "curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-cli_4.2.0_amd64.deb -o xtrike-sast-cli_4.2.0_amd64.deb",
        installCommand: "sudo apt install ./xtrike-sast-cli_4.2.0_amd64.deb",
        sha256: "3da7fe4b86a9e606b6a55bfba08a3b42fc4ac4e72df742989e89f9ef7c0e3282",
      },
      {
        id: "ubuntu-2404-runner",
        distroFamily: "Ubuntu / Debian APT",
        distroVersion: "Ubuntu 24.04 LTS / Debian 13",
        codename: "noble / trixie",
        architecture: "amd64",
        edition: "Enterprise Runner",
        packageFilename: "xtrike-sast-runner-enterprise_4.2.0_amd64.deb",
        downloadUrl: "/api/xtrike-package?pkg=xtrike-sast-runner-enterprise_4.2.0_amd64.deb",
        wgetCommand: "curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-runner-enterprise_4.2.0_amd64.deb -o xtrike-sast-runner-enterprise_4.2.0_amd64.deb",
        installCommand: "sudo apt install ./xtrike-sast-runner-enterprise_4.2.0_amd64.deb",
        sha256: "26e50d4d55a4a11c06688dca78e3a8e29610fdd4f0da6a72596309cbad126adb",
      },
    ],
  },
  {
    family: "RHEL / Rocky / Amazon Linux",
    badge: "RPM · x86_64",
    description: "Signed RPM bundles for Enterprise Linux 9/10 and AWS Graviton/EC2 build runners with FIPS-validated crypto checks.",
    packages: [
      {
        id: "rhel-9-cli",
        distroFamily: "RHEL / Rocky / Amazon Linux",
        distroVersion: "RHEL 9.x / 10.x & Amazon Linux 2023",
        codename: "el9 / al2023",
        architecture: "x86_64",
        edition: "Enterprise Runner",
        packageFilename: "xtrike-sast-runner-4.2.0-1.el9.x86_64.rpm",
        downloadUrl: "/api/xtrike-package?pkg=xtrike-sast-runner-4.2.0-1.el9.x86_64.rpm",
        wgetCommand: "curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-runner-4.2.0-1.el9.x86_64.rpm -o xtrike-sast-runner-4.2.0-1.el9.x86_64.rpm",
        installCommand: "sudo dnf install ./xtrike-sast-runner-4.2.0-1.el9.x86_64.rpm",
        sha256: "9b41a28c7710f4e91c52d8e4410a77c92a110f8b6632d1c98310ab42e7719c01",
      },
    ],
  },
  {
    family: "macOS Homebrew & Apple Silicon",
    badge: "macOS · arm64 / x64",
    description: "Developer workstation CLI & MCP server bridge for real-time IDE AST scanning and 1-click remediation diffs.",
    packages: [
      {
        id: "macos-arm64-cli",
        distroFamily: "macOS Homebrew & Apple Silicon",
        distroVersion: "macOS 14 Sonoma / 15 Sequoia",
        codename: "darwin-arm64",
        architecture: "arm64",
        edition: "CLI Standard",
        packageFilename: "xtrike-sast-cli_4.2.0_darwin_arm64.tar.gz",
        downloadUrl: "/api/xtrike-package?pkg=xtrike-sast-cli_4.2.0_darwin_arm64.tar.gz",
        wgetCommand: "curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-cli_4.2.0_darwin_arm64.tar.gz -o xtrike-sast-cli_4.2.0_darwin_arm64.tar.gz",
        installCommand: "tar -xzf xtrike-sast-cli_4.2.0_darwin_arm64.tar.gz && sudo mv xtrike-sast /usr/local/bin/",
        sha256: "7c82d19e4401b5a82f61c9e3301b88d03b221e9c7743e2d09421bc53f8820d14",
      },
    ],
  },
  {
    family: "Docker / Helm & GitHub Actions",
    badge: "Container · SARIF v2.1.0",
    description: "Zero-config container runner for GitHub Actions, GitLab CI, and Kubernetes Admission Webhooks with automatic SARIF v2.1.0 & Noctis AI sync.",
    packages: [
      {
        id: "docker-ci-runner",
        distroFamily: "Docker / Helm & GitHub Actions",
        distroVersion: "OCI Container / Helm Chart v4.2.0",
        codename: "alpine-3.20",
        architecture: "multi-arch",
        edition: "Enterprise Runner",
        packageFilename: "xtrike-sast-ci-workflow.yml",
        downloadUrl: "/api/xtrike-package?pkg=xtrike-sast-ci-workflow.yml",
        wgetCommand: "curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-ci-workflow.yml -o .github/workflows/xtrike-sast.yml",
        installCommand: "xtrike-sast scan --repo . --engines xql,deepflow,structsca,ast-query --sarif xtrike-results.sarif",
        sha256: "5e91f04a8832c7d10e43a6b2219f44e12c330d8a5512b7e08134ac92d1104f89",
      },
    ],
  },
];

export const XTRIKE_CLI_RUNTIME_SPEC = {
  version: "4.2.0-enterprise",
  profileName: "ptes-nist-800-115",
  webUiUrl: "https://05-sast-platform.vercel.app/scan",
  noctisBridgeUrl: "https://05-sast-platform.vercel.app/api/noctis",
  daemons: [
    { name: "xtrike-xql-parser", role: "Multi-Language AST & Best-Fix-Location (BFL) Dominance Engine", status: "OK" },
    { name: "xtrike-deepflow-ssa", role: "Intra/Inter-Procedural SSA Taint & Sanitizer Gate Analyzer", status: "OK" },
    { name: "xtrike-structsca-7k", role: "7-Kingdom Structural & Reachable CVE Dependency Correlator", status: "OK" },
    { name: "xtrike-ast-dispatcher", role: "401-Plugin Language-Strict Token Dispatcher (PLG-001..PLG-401)", status: "OK" },
    { name: "xtrike-proof-sandbox", role: "6-Stage PTES / NIST 800-115 Deterministic Validation Runner", status: "OK" },
    { name: "xtrike-mcp-bridge", role: "IDE Model Context Protocol (MCP) & SARIF v2.1.0 Exporter", status: "OK" },
    { name: "xtrike-noctis-sync", role: "Live In-App Noctis AI Pop-up Telemetry Synchronizer", status: "OK" },
  ],
};

export function buildCyberMonitoringNoctisSummary(): string {
  return [
    `### Noctis — XTRIKE SAST Posture KPIs, Runtime Sensor Mesh & CLI (\`/cyber-monitoring\`)`,
    `- **SAST & CVE Posture Summary:**`,
    `  - **Open SAST Findings:** \`16.8K\` (\`+12.3%\` across 82 repositories & 4 AST engines)`,
    `  - **Reachable SCA CVEs:** \`6.4K\` (\`-6.2%\` filtered by active call-graph reachability)`,
    `  - **Verified AST Remediations:** \`1.3K\` (\`+18.4%\` passed post-fix unit retest suite)`,
    `  - **Canonical Proof State Breakdown:** Critical \`1.4K\` (\`PROVEN_EXPLOITABLE / DATAFLOW_CONFIRMED\`), High \`6.0K\` (\`DATAFLOW_CONFIRMED\`), Medium \`7.1K\` (\`DETECTED_STATIC\`), Low \`1.3K\` (\`NEEDS_MANUAL_VALIDATION\`), Guarded \`265\` (\`MITIGATED_BY_GUARD\`)`,
    `- **Code-to-Runtime Sensor Telemetry:**`,
    `  - **Active Sink Triggers:** \`213\` · **Exploit Probes Halted:** \`32\` · **Unauthenticated Taint Routes:** \`26\` · **Manual Proof Queue:** \`26\` · **AST Diffs Verified:** \`73\` · **Release Gate Posture Score:** \`84/100\``,
    `  - **Protected Build & Runtime Fleet (\`1,765\` Nodes):** Linux x86_64 (\`468\`), Kubernetes/EKS Pods (\`406\`), CI Runners (\`320\`), macOS Workstations (\`249\`), Windows/.NET (\`122\`), ARM64 Graviton (\`100\`), Serverless (\`100\`)`,
    `- **XTRIKE Repository & Service Mesh (\`710\` Repos/Runners · \`15,808\` Policy Gates):**`,
    `  - **Top Release-Gate Violators:** \`payment-settlement-core\` (\`CWE-89\`), \`identity-oauth-gateway\` (\`CWE-347\`), \`graphql-mobile-bff\` (\`CWE-918\`), \`order-fulfillment-api\` (\`CWE-502\`), \`dynamic-rule-compiler\` (\`CWE-94 / PLG-054\`)`,
    `- **XTRIKE SAST CLI & Runner Installation (\`v4.2.0\`):**`,
    `  \`\`\`bash`,
    `  curl -fsSL https://05-sast-platform.vercel.app/api/xtrike-package?pkg=xtrike-sast-cli_4.2.0_amd64.deb -o xtrike-sast-cli_4.2.0_amd64.deb`,
    `  sudo apt install ./xtrike-sast-cli_4.2.0_amd64.deb`,
    `  xtrike-sast --version`,
    `  xtrike-sast init --profile ptes-nist-800-115`,
    `  xtrike-sast daemon start --engines xql,deepflow,structsca,ast-query`,
    `  \`\`\``,
  ].join("\n");
}
