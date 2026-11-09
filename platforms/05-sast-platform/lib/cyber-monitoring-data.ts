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
  version: "5.2.0-enterprise",
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

// ============================================================================
// 5. 4-STAGE DATA-TO-OBSERVABILITY HOURGLASS ARCHITECTURE (SCREENSHOT 1)
// ============================================================================

export interface HourglassStageItem {
  stepNumber: 1 | 2 | 3 | 4;
  verticalLabel: "Ingest" | "Transform" | "Analyze" | "Solve";
  headline: string;
  subDetail: string;
  leadBold: string;
  paragraph1: string;
  paragraph2: string;
  accentColor: string;
}

export const XTRIKE_WORKFLOW_INTEGRATIONS = [
  { id: "wf-itsm", label: "ITSM", detail: "ServiceNow, Jira & PagerDuty ticket sync" },
  { id: "wf-ai", label: "AI Agents", detail: "Noctis AI & Autonomous Patch Synthesis" },
  { id: "wf-collab", label: "Collaboration", detail: "Slack, MS Teams & OpsGenie alerts" },
  { id: "wf-auto", label: "Automation", detail: "Ansible, Terraform & GitHub Actions" },
  { id: "wf-mcp", label: "MCP server", detail: "IDE & Agentic Model Context Protocol" },
];

export const XTRIKE_PIPELINE_HOURGLASS_STAGES: HourglassStageItem[] = [
  {
    stepNumber: 4,
    verticalLabel: "Solve",
    headline: "Full stack monitoring and observability",
    subDetail: "Autonomous root-cause correlation, context-exact AST patch synthesis, and isolated sandbox verification",
    leadBold: "Resolve infrastructure incidents and code vulnerabilities before they impact production.",
    paragraph1:
      "XTRIKE bridges full-stack observability with deterministic security verification. When a release gate or production host enters a CRITICAL state, Noctis AI correlates infrastructure pressure, runtime traces, and source-level taint paths into a single actionable dossier.",
    paragraph2:
      "From one-click context-exact AST patches to automated ITSM ticketing, ChatOps notifications, and native MCP server tool calls in your IDE, XTRIKE turns telemetry directly into verified remediation.",
    accentColor: "#e6b89c",
  },
  {
    stepNumber: 3,
    verticalLabel: "Analyze",
    headline: "Advanced analytics and visualization",
    subDetail: "8-Engine Hybrid AST, inter-procedural taint graphs, hexagonal fleet telemetry, and Noctis AI explainability",
    leadBold: "Cut through alert noise with multi-engine concordance, reachability graphs, and AI-guided root-cause analysis.",
    paragraph1:
      "XTRIKE's analytical core combines 4 static AST engines (XQL, DeepFlow, StructSCA, AST-Query) with real-time host, network, database, and synthetic user-journey telemetry across 710+ repository and cluster nodes.",
    paragraph2:
      "Interactive hexagonal fleet maps, inter-procedural source-to-sink dataflow traces, and 'Explain with XTRIKE AI' problem drawers pinpoint whether an issue stems from an unparameterized SQL query, an exhausted disk volume, or an upstream API latency spike.",
    accentColor: "#d4a359",
  },
  {
    stepNumber: 2,
    verticalLabel: "Transform",
    headline: "Robust, flexible and efficient storage",
    subDetail: "Cryptographic Ed25519 evidence ledger, normalized Code Property Graphs (CPG), and high-speed time-series store",
    leadBold: "Normalize high-velocity telemetry and AST graphs into an immutable, low-footprint evidence ledger.",
    paragraph1:
      "Incoming metrics, eBPF kernel events, OpenTelemetry spans, and polyglot Abstract Syntax Trees are structured into unified Code Property Graphs (CPGs) and high-efficiency time-series partitions with sub-second query performance.",
    paragraph2:
      "Every security finding and runtime reproduction artifact is cryptographically sealed with SHA-256 hash chains and Ed25519 signatures, enforcing a strict 12-field semantic binding between target language, framework, and runtime proof.",
    accentColor: "#68b684",
  },
  {
    stepNumber: 1,
    verticalLabel: "Ingest",
    headline: "2000+ pre-built integrations",
    subDetail: "400+ OWASP/NIST/CWE SAST plugins, GitHub/GitLab webhooks, Kubernetes/EKS agents, Linux/Windows hosts & cloud APIs",
    leadBold: "Monitor everything across your entire hybrid landscape from a single platform.",
    paragraph1:
      "XTRIKE's automated discovery finds and connects to every host, repository, and service across your environment, covering servers, networks, storage, cloud workloads, containers, and applications through one of the largest integration catalogs in the market.",
    paragraph2:
      "Data collection is flexible by design with standard, agentless (SNMP / HTTP / Cloud API) or native agent-based methods with centralized package management and cryptographic signing via the XTRIKE Agent Bakery.",
    accentColor: "#408a67",
  },
];

export const XTRIKE_HOURGLASS_TOP_PILLARS = [
  {
    id: "infra-monitoring",
    title: "Infrastructure Monitoring",
    subtitle: "Servers, Kubernetes, networks, storage & hybrid cloud nodes",
    metricBadge: "710 Nodes · 99.86% Up",
  },
  {
    id: "app-monitoring",
    title: "Application Monitoring",
    subtitle: "8-Engine SAST, reachable SCA CVEs, APM traces & service gates",
    metricBadge: "15,808 Policy Gates",
  },
  {
    id: "synthetic-monitoring",
    title: "Synthetic Monitoring",
    subtitle: "End-to-end UX journeys, PTES exploit replay & regression probes",
    metricBadge: "100% Deterministic Proof",
  },
];

export const XTRIKE_EXTRACTION_COLLECTORS = [
  { id: "col-net", label: "Network", tag: "SNMP / eBPF" },
  { id: "col-srv", label: "Servers", tag: "Bare-Metal / VM" },
  { id: "col-os", label: "OS", tag: "Linux / Win / macOS" },
  { id: "col-otel", label: "OTel/Prometheus", tag: "Metrics & Spans" },
  { id: "col-k8s", label: "Containers/Virtualization", tag: "K8s / Docker / VMware" },
  { id: "col-db", label: "Databases", tag: "SQL / NoSQL / Cache" },
  { id: "col-app", label: "Applications", tag: "AST / APM / Synthetic" },
];

// ============================================================================
// 6. HYBRID ENTERPRISE FLEET DASHBOARD TELEMETRY (SCREENSHOT 5)
// ============================================================================

export const XTRIKE_HYBRID_FLEET_TELEMETRY = {
  dashboardTitle: "Monitor > Overview > Linux & Hybrid Enterprise Hosts",
  hostStats: {
    up: 11,
    inDowntime: 0,
    unreachable: 0,
    down: 0,
    total: 11,
  },
  serviceStats: {
    ok: 347,
    inDowntime: 0,
    onDownHost: 0,
    warning: 5,
    unknown: 0,
    critical: 11,
    total: 363,
  },
  executionTimeSeries: [
    { time: "04:21", meanSec: 1.8, medianSec: 1.2, totalSec: 5.4 },
    { time: "05:00", meanSec: 2.1, medianSec: 1.4, totalSec: 6.2 },
    { time: "06:00", meanSec: 1.9, medianSec: 1.3, totalSec: 5.8 },
    { time: "07:00", meanSec: 2.4, medianSec: 1.5, totalSec: 8.1 },
    { time: "08:00", meanSec: 2.2, medianSec: 1.4, totalSec: 7.3 },
    { time: "09:00", meanSec: 2.8, medianSec: 1.6, totalSec: 11.4 },
    { time: "10:00", meanSec: 2.3, medianSec: 1.4, totalSec: 7.9 },
    { time: "11:00", meanSec: 2.0, medianSec: 1.3, totalSec: 6.5 },
    { time: "12:00", meanSec: 2.5, medianSec: 1.5, totalSec: 9.2 },
    { time: "13:00", meanSec: 2.1, medianSec: 1.3, totalSec: 6.8 },
    { time: "14:00", meanSec: 2.6, medianSec: 1.5, totalSec: 9.8 },
    { time: "15:00", meanSec: 2.2, medianSec: 1.4, totalSec: 7.4 },
  ],
  top10Cpu: [
    { host: "mysql-2.erp.company.com", valueLabel: "203.09 %", pctBar: 100, alert: "CRIT" as const },
    { host: "app-1.erp.company.com", valueLabel: "162.31 %", pctBar: 92, alert: "CRIT" as const },
    { host: "app-2.erp.company.com", valueLabel: "100 %", pctBar: 78, alert: "WARN" as const },
    { host: "mysql-1.erp.company.com", valueLabel: "100 %", pctBar: 78, alert: "WARN" as const },
    { host: "node_eks_i-0d5fe9f123edec6b2a.eu-central-1.compute.internal", valueLabel: "81.16 %", pctBar: 66, alert: "OK" as const },
    { host: "node_eks_i-031567b749c60c2fd.eu-central-1.compute.internal", valueLabel: "74.56 %", pctBar: 60, alert: "OK" as const },
    { host: "play.xtrike.internal", valueLabel: "9.84 %", pctBar: 14, alert: "OK" as const },
    { host: "webserver.company.com", valueLabel: "3.43 %", pctBar: 8, alert: "OK" as const },
    { host: "application.company.com", valueLabel: "3.25 %", pctBar: 7, alert: "OK" as const },
  ],
  top10Memory: [
    { host: "node_eks_i-031567b749c60c2fd.eu-central-1.compute.internal", valueLabel: "55.56 %", pctBar: 76 },
    { host: "mysql-2.erp.company.com", valueLabel: "43.34 %", pctBar: 60 },
    { host: "app-2.erp.company.com", valueLabel: "43.34 %", pctBar: 60 },
    { host: "mysql-1.erp.company.com", valueLabel: "43.34 %", pctBar: 60 },
    { host: "node_eks_i-0d5fe9f123edec6b2a.eu-central-1.compute.internal", valueLabel: "34.86 %", pctBar: 48 },
    { host: "play.xtrike.internal", valueLabel: "24.89 %", pctBar: 35 },
    { host: "app-1.erp.company.com", valueLabel: "19.48 %", pctBar: 28 },
    { host: "webserver.company.com", valueLabel: "19.22 %", pctBar: 27 },
    { host: "application.company.com", valueLabel: "14.81 %", pctBar: 21 },
  ],
  top10InputBandwidth: [
    { host: "play.xtrike.internal", service: "Interface lo", valueLabel: "1.28 MBit/s", pctBar: 88, color: "#34d399" },
    { host: "node_eks_i-0d5fe9f123edec6b2a.eu-central-1", service: "AWS/EC2 Network IO Summary", valueLabel: "806.13 kBit/s", pctBar: 64, color: "#38bdf8" },
    { host: "play.xtrike.internal", service: "Interface ens5", valueLabel: "192.66 kBit/s", pctBar: 32, color: "#34d399" },
    { host: "webserver.company.com", service: "Interface lo", valueLabel: "24.55 kBit/s", pctBar: 12, color: "#64748b" },
  ],
  top10OutputBandwidth: [
    { host: "play.xtrike.internal", service: "Interface lo", valueLabel: "1.28 MBit/s", pctBar: 88, color: "#38bdf8" },
    { host: "node_eks_i-031567b749c60c2fd.eu-central-1", service: "AWS/EC2 Network IO Summary", valueLabel: "391.18 kBit/s", pctBar: 46, color: "#38bdf8" },
    { host: "payment-settlement-core", service: "Interface eth0", valueLabel: "214.40 kBit/s", pctBar: 30, color: "#34d399" },
  ],
  top10Disk: [
    { host: "win-dc-04.corp.meridian-retail.com", service: "Filesystem C:/", valueLabel: "91.45 %", pctBar: 92, state: "CRIT" as const },
    { host: "fileserver-01.corp.meridian-retail.com", service: "Volume /srv/artifacts", valueLabel: "78.20 %", pctBar: 78, state: "WARN" as const },
    { host: "webserver.company.com", service: "Filesystem /var/log", valueLabel: "64.10 %", pctBar: 64, state: "OK" as const },
    { host: "play.xtrike.internal", service: "Filesystem /", valueLabel: "51.80 %", pctBar: 52, state: "OK" as const },
    { host: "mysql-2.erp.company.com", service: "Volume /var/lib/mysql", valueLabel: "48.30 %", pctBar: 48, state: "OK" as const },
  ],
};

// ============================================================================
// 7. "EXPLAIN WITH XTRIKE AI" PROBLEM DRAWER DOSSIERS (SCREENSHOT 4)
// ============================================================================

export interface AiExplainProblemDossier {
  id: string;
  host: string;
  hostStatus: "UP" | "DOWN";
  service: string;
  serviceStatus: "CRIT" | "WARN";
  pluginOutput: string;
  since: string;
  cweOrCategory: string;
  dataQuality: "High" | "Verified";
  aiSummary: string;
  metrics: Array<{
    metric: string;
    value: string;
    status?: "CRIT" | "WARN" | "OK";
  }>;
  serviceContext: string;
}

export const XTRIKE_AI_EXPLAIN_DOSSIERS: AiExplainProblemDossier[] = [
  {
    id: "prob-fs-c",
    host: "win-dc-04.corp.meridian-retail.com",
    hostStatus: "UP",
    service: "Filesystem C:/",
    serviceStatus: "CRIT",
    pluginOutput: "CRIT - 91.45% used (110.0 GiB of 120.3 GiB), (warn/crit at 80.00%/90.00%), trend: +4.2 GiB / 24h",
    since: "11m ago",
    cweOrCategory: "INFRA-STORAGE-CRIT",
    dataQuality: "High",
    aiSummary:
      "The system filesystem is in a CRIT state because its disk usage has reached 91.45%, crossing the 90.00% critical threshold. Cross-service correlation reveals this storage pressure is isolated to the C:/ drive and is directly driven by a stopped and crashing backup agent, which has accumulated 21.3 GiB of staging files and 844 MiB of crash dumps. Purging the orphaned backup staging buffer and restarting the agent will immediately restore C:/ utilization below 74%.",
    metrics: [
      { metric: "Filesystem C:/ space used", value: "91.45% (110 GiB)", status: "CRIT" },
      { metric: "Backup agent staging size", value: "21.3 GiB", status: "WARN" },
      { metric: "Backup agent crash dumps", value: "844 MiB", status: "WARN" },
      { metric: "Security log size", value: "1.02 GiB", status: "OK" },
      { metric: "Windows Update cache", value: "1.68 GiB", status: "OK" },
    ],
    serviceContext:
      "The service: Filesystem monitoring tracks storage capacity on the Windows system drive (C:/) to ensure adequate space is available for operating system operations, pagefiles, and domain controller replication logs.",
  },
  {
    id: "prob-sqli-core",
    host: "payment-settlement-core",
    hostStatus: "UP",
    service: "XQL Gate · CWE-89 SQL Injection",
    serviceStatus: "CRIT",
    pluginOutput: "CRIT - DATAFLOW_CONFIRMED: Unbound @RequestParam account reaches Statement.executeQuery() at line 12 (0 sanitizers)",
    since: "14m ago",
    cweOrCategory: "CWE-89 · SQL Injection",
    dataQuality: "High",
    aiSummary:
      "The release gate for payment-settlement-core is in a CRIT state because XTRIKE DeepFlow and XQL confirmed an unparameterized source-to-sink taint path from @RequestParam String account into Statement.executeQuery() at SqlInjectionLesson5a.java:12. Controlled sandbox replay reproduced authentication predicate bypass (' OR '1'='1) pre-patch and verified that replacing Statement concatenation with a parameterized PreparedStatement (ps.setString(1, account)) blocks the exploit with 0 functional regressions.",
    metrics: [
      { metric: "Canonical Proof State", value: "RUNTIME_REPRODUCED · FULLY_CERTIFIED", status: "CRIT" },
      { metric: "CVSS v3.1 Base Score", value: "9.8 Critical (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)", status: "CRIT" },
      { metric: "Sanitizer / Guard Dominance", value: "0 dominating guards on path", status: "CRIT" },
      { metric: "Isolated Sandbox Patch Build", value: "Exit 0 (javac -Xlint:all -Werror)", status: "OK" },
      { metric: "Post-Patch Exploit Replay", value: "EXPLOIT_BLOCKED (0 unauthorized rows)", status: "OK" },
    ],
    serviceContext:
      "The service: XQL Release Gate enforces NIST SP 800-53 SI-10 and OWASP ASVS v4.0.3 §5.3.4 parameterization invariants before allowing container promotion to production.",
  },
  {
    id: "prob-dotnet-bench",
    host: "owasp-benchmark-dotnet",
    hostStatus: "UP",
    service: "ADO.NET & BCL Gate · BenchmarkDotNetTest00104.cs",
    serviceStatus: "CRIT",
    pluginOutput: "CRIT - 3 Runtime-Reproduced Sinks (CWE-89 SqlCommand, CWE-78 Process.Start, CWE-502 BinaryFormatter) + 1 CWE-798 Connection-String Secret",
    since: "19m ago",
    cweOrCategory: "CWE-89 / CWE-78 / CWE-502 / CWE-798",
    dataQuality: "High",
    aiSummary:
      "BenchmarkDotNetTest00104.cs in OWASP/BenchmarkDotNet exposes four distinct security constructs inside Evaluate(): (1) an embedded SQL connection-string password (CWE-798, NEEDS_MANUAL_VALIDATION), (2) unparameterized SqlCommand concatenation on the Invoices table (CWE-89, RUNTIME_REPRODUCED), (3) Process.Start(\"cmd.exe\", \"/c ping \" + diagArg) shell command injection (CWE-78, RUNTIME_REPRODUCED), and (4) BinaryFormatter.Deserialize(Request.Body) unsafe native deserialization (CWE-502, RUNTIME_REPRODUCED). All C# runtime proofs are semantically bound to .NET 8.0 / ADO.NET artifacts.",
    metrics: [
      { metric: "SAST-001 · CWE-89 (Line 14)", value: "SqlCommand @userFilter SqlParameter verified", status: "CRIT" },
      { metric: "SAST-002 · CWE-78 (Line 16)", value: "ProcessStartInfo ArgumentList + IPAddress.TryParse", status: "CRIT" },
      { metric: "SAST-003 · CWE-502 (Line 18)", value: "JsonSerializer.DeserializeAsync<InvoiceAuditDto>", status: "CRIT" },
      { metric: "SAST-004 · CWE-798 (Line 13)", value: "NEEDS_MANUAL_VALIDATION (Connection-string secret)", status: "WARN" },
      { metric: "Semantic Evidence Binding", value: "C# / .NET SDK 8.0.402 (12/12 fields verified)", status: "OK" },
    ],
    serviceContext:
      "The service: XTRIKE Semantic Evidence-to-Target Validator guarantees that C# / ASP.NET Core findings are verified exclusively with .NET 8.0 BCL and ADO.NET runtime harnesses.",
  },
  {
    id: "prob-ssrf-broker",
    host: "webhook-event-broker",
    hostStatus: "UP",
    service: "DeepFlow · CWE-918 SSRF Egress",
    serviceStatus: "CRIT",
    pluginOutput: "CRIT - PROVEN_EXPLOITABLE: User callbackUrl reaches HttpClient.send() without scheme pinning or RFC1918/IMDSv2 block",
    since: "1h 08m ago",
    cweOrCategory: "CWE-918 · Server-Side Request Forgery",
    dataQuality: "High",
    aiSummary:
      "Outbound webhook dispatch accepts an unvalidated callbackUrl and invokes HttpClient without HTTPS scheme pinning, hostname allowlisting, or post-DNS-resolution IP filtering against RFC1918 private subnets and cloud metadata (169.254.169.254). Enforcing pre-connect DNS resolution checks and disabling automatic HTTP redirects neutralizes internal network pivoting.",
    metrics: [
      { metric: "Outbound Egress Sink", value: "HttpClient.send(callbackUrl)", status: "CRIT" },
      { metric: "IMDSv2 / 169.254.169.254 Guard", value: "Missing pre-connect IP check", status: "CRIT" },
      { metric: "HTTP Redirect Policy", value: "Redirects enabled (vulnerable to 302 bypass)", status: "WARN" },
      { metric: "Context-Exact Patch Status", value: "SocketsHttpHandler + DNS IP guard ready", status: "OK" },
    ],
    serviceContext:
      "The service: Outbound Egress Policy Gate inspects all HTTP client invocations for SSRF DNS-rebinding, link-local metadata access, and redirect bypasses.",
  },
  {
    id: "prob-javac-compiler",
    host: "dynamic-rule-compiler",
    hostStatus: "UP",
    service: "AST-Query · PLG-054 JavaCompiler",
    serviceStatus: "WARN",
    pluginOutput: "WARN - NEEDS_MANUAL_VALIDATION: javax.tools.JavaCompiler.getTask() detected in BlindScript.java; verify fileObjects source & -proc:none",
    since: "32m ago",
    cweOrCategory: "CWE-94 · Dynamic Compilation",
    dataQuality: "High",
    aiSummary:
      "Static AST inspection identified javax.tools.JavaCompiler.getTask() in BlindScript.java. Because the excerpt does not establish whether untrusted input flows into fileObjects or whether compiled classes are loaded via ClassLoader, XTRIKE classifies this finding as NEEDS_MANUAL_VALIDATION rather than overclaiming confirmed RCE. Pass -proc:none to disable annotation processors or replace dynamic compilation with Jackson DTO schema validation.",
    metrics: [
      { metric: "Canonical Proof State", value: "NEEDS_MANUAL_VALIDATION", status: "WARN" },
      { metric: "Annotation Processor Guard", value: "-proc:none flag not verified in excerpt", status: "WARN" },
      { metric: "Untrusted Input Taint Flow", value: "NOT_ESTABLISHED in single-file excerpt", status: "OK" },
      { metric: "Promotion Gate Policy", value: "Blocked from RUNTIME_REPRODUCED promotion", status: "OK" },
    ],
    serviceContext:
      "The service: XTRIKE Proof-State Gate prevents unestablished or configuration-dependent findings from being inflated to confirmed runtime vulnerabilities.",
  },
];

// ============================================================================
// 8. SYNTHETIC USER EXPERIENCE (UX) JOURNEYS & LEARN MEGA-HUB
// ============================================================================

export interface SyntheticJourneyStep {
  id: string;
  state: "OK" | "WARN" | "CRIT";
  hostNode: string;
  application: string;
  variant: string;
  taskName: string;
  statusDetail: string;
  runtimeLabel: string;
  runtimeMs: number;
}

export interface SyntheticPlanExecution {
  planName: string;
  lastExecution: string;
  durationSec: number;
  state: "OK" | "WARN";
}

export const XTRIKE_SYNTHETIC_PLANS: SyntheticPlanExecution[] = [
  { planName: "Last execution: 2026-11-05 13:45:00 (+00:00) · Checkout & OAuth2 PKCE Flow", lastExecution: "13:45:00 UTC", durationSec: 25, state: "OK" },
  { planName: "Last execution: 2026-11-05 13:44:00 (+00:00) · Payment Settlement & 3DS2 Challenge", lastExecution: "13:44:00 UTC", durationSec: 29, state: "OK" },
  { planName: "Last execution: 2026-11-05 13:43:00 (+00:00) · Multi-Tenant Portal & RBAC Session", lastExecution: "13:43:00 UTC", durationSec: 32, state: "WARN" },
  { planName: "Last execution: 2026-11-05 13:42:00 (+00:00) · Invoice Export & ADO.NET Query Flow", lastExecution: "13:42:00 UTC", durationSec: 31, state: "OK" },
  { planName: "Last execution: 2026-11-05 13:41:00 (+00:00) · SAST Release Gate & SARIF Webhook", lastExecution: "13:41:00 UTC", durationSec: 28, state: "OK" },
];

export const XTRIKE_SYNTHETIC_HOST_NODES = [
  { host: "synth-node-eu-central-01", service: "XTRIKE Synthetic: Web Checkout & Auth", runtimeLabel: "12.63 s", pct: 78, tone: "cyan" as const },
  { host: "synth-node-us-east-02", service: "XTRIKE Synthetic: Payment Gateway API", runtimeLabel: "9.85 s", pct: 62, tone: "cyan" as const },
  { host: "synth-node-ap-south-01", service: "XTRIKE Synthetic: Tenant Portal SSO", runtimeLabel: "8.98 s", pct: 56, tone: "emerald" as const },
  { host: "synth-node-eu-west-03", service: "XTRIKE Synthetic: GraphQL Order Pipeline", runtimeLabel: "6.42 s", pct: 41, tone: "emerald" as const },
];

export const XTRIKE_SYNTHETIC_RUNTIME_SERIES = [
  { time: "08:30", checkoutMs: 820, authMs: 390, apiMs: 185, searchMs: 510 },
  { time: "08:35", checkoutMs: 890, authMs: 410, apiMs: 192, searchMs: 530 },
  { time: "08:40", checkoutMs: 760, authMs: 380, apiMs: 178, searchMs: 495 },
  { time: "08:45", checkoutMs: 950, authMs: 425, apiMs: 205, searchMs: 540 },
  { time: "08:50", checkoutMs: 1120, authMs: 440, apiMs: 215, searchMs: 580 },
  { time: "08:55", checkoutMs: 840, authMs: 395, apiMs: 188, searchMs: 505 },
  { time: "09:00", checkoutMs: 790, authMs: 385, apiMs: 180, searchMs: 490 },
  { time: "09:05", checkoutMs: 910, authMs: 405, apiMs: 195, searchMs: 520 },
  { time: "09:10", checkoutMs: 865, authMs: 398, apiMs: 184, searchMs: 512 },
];

export const XTRIKE_SYNTHETIC_UX_STEPS: SyntheticJourneyStep[] = [
  { id: "ux-01", state: "OK", hostNode: "synth-node-eu-01", application: "checkout-web", variant: "en-US", taskName: "Open Homepage & TLS Handshake", statusDetail: "PASS, Runtime: 641 milliseconds · Strict HSTS & TLS 1.3 verified", runtimeLabel: "641 ms", runtimeMs: 641 },
  { id: "ux-02", state: "OK", hostNode: "synth-node-eu-01", application: "identity-sso", variant: "oidc", taskName: "OAuth2 PKCE Login & MFA Challenge", statusDetail: "PASS, Runtime: 1.25 seconds · JWT RS256 signature & nonce validated", runtimeLabel: "1.25 s", runtimeMs: 1250 },
  { id: "ux-03", state: "WARN", hostNode: "synth-node-us-02", application: "catalog-search", variant: "graphql", taskName: "Search & Filter Product Catalog", statusDetail: "WARN, Runtime: 4.92 seconds (Threshold: 3.50s) · Keyword index shard warm-up", runtimeLabel: "4.92 s", runtimeMs: 4920 },
  { id: "ux-04", state: "OK", hostNode: "synth-node-eu-01", application: "cart-service", variant: "grpc", taskName: "Add Item to Cart & Inventory Lock", statusDetail: "PASS, Runtime: 438 milliseconds · Redis distributed lock acquired", runtimeLabel: "438 ms", runtimeMs: 438 },
  { id: "ux-05", state: "OK", hostNode: "synth-node-eu-01", application: "payment-core", variant: "prod", taskName: "Submit Settlement & Parameterized Ledger Write", statusDetail: "PASS, Runtime: 930 milliseconds · Zero SQLi/SSRF policy violations", runtimeLabel: "930 ms", runtimeMs: 930 },
  { id: "ux-06", state: "OK", hostNode: "synth-node-ap-01", application: "billing-portal", variant: "dotnet8", taskName: "Download Signed Invoice PDF (ADO.NET)", statusDetail: "PASS, Runtime: 734 milliseconds · Content-Disposition & path guard active", runtimeLabel: "734 ms", runtimeMs: 734 },
  { id: "ux-07", state: "OK", hostNode: "synth-node-us-02", application: "webhook-broker", variant: "mtls", taskName: "Dispatch Signed Webhook Event", statusDetail: "PASS, Runtime: 312 milliseconds · DNS IP allowlist & mTLS verified", runtimeLabel: "312 ms", runtimeMs: 312 },
];

export interface CyberMonitorInspectableDossier {
  id: string;
  title: string;
  category: string;
  badge: string;
  status: "OK" | "WARN" | "CRIT" | "VERIFIED" | "ACTIVE";
  targetTab: "all" | "platform" | "fleet" | "ux" | "domains" | "posture" | "sensors" | "mesh" | "cli";
  summary: string;
  architectureNotes: string;
  liveMetrics: { label: string; value: string; status?: "OK" | "WARN" | "CRIT"; delta?: string }[];
  cliCommand: string;
  relatedRoute: string;
  relatedRouteLabel: string;
}

export interface CyberMonitorMenuGroup {
  id: "product" | "solutions" | "pricing" | "learn" | "community";
  label: string;
  subtitle: string;
  tagline?: string;
  items: CyberMonitorInspectableDossier[];
}

export const XTRIKE_CYBER_MONITOR_MENU_GROUPS: CyberMonitorMenuGroup[] = [
  {
    id: "product",
    label: "Product",
    subtitle: "The XTRIKE Platform: 4-Stage Hourglass, Hybrid Fleet & Autonomous AI",
    items: [
      {
        id: "menu-prod-platform",
        title: "The XTRIKE Platform (4-Stage Hourglass & Hexagon)",
        category: "Product · Core Architecture",
        badge: "4 Stages",
        status: "VERIFIED",
        targetTab: "platform",
        summary:
          "Unified data-to-observability hourglass architecture progressing through Stage 1 (Ingest: 2,000+ integrations & 401 SAST plugins), Stage 2 (Transform: Ed25519 evidence ledger & Code Property Graphs), Stage 3 (Analyze: 8-Engine AST + fleet analytics), and Stage 4 (Solve: Autonomous root-cause & context-exact patching).",
        architectureNotes:
          "Bridges static source-to-sink dataflow graphs with live host, network, container, and synthetic user-journey telemetry inside a single deterministic ledger.",
        liveMetrics: [
          { label: "Pre-Built Integrations & AST Rules", value: "2,000+ Collectors · 401 CWE Rules", status: "OK" },
          { label: "Evidence Ledger Integrity", value: "Ed25519 + SHA-256 Chain Sealed", status: "OK" },
          { label: "Multi-Engine Concordance", value: "93.2% across 4 Static AST Engines", status: "OK" },
          { label: "Workflow Connectors Active", value: "ITSM, AI Agents, ChatOps, Automation, MCP", status: "OK" },
        ],
        cliCommand: "xtrike-sast daemon start --engines xql,deepflow,structsca,ast-query --profile ptes-nist-800-115",
        relatedRoute: "/validation-engine",
        relatedRouteLabel: "Open 6-Stage Proof Engine",
      },
      {
        id: "menu-prod-fleet",
        title: "Hybrid Enterprise Infrastructure Monitoring",
        category: "Product · Infrastructure Telemetry",
        badge: "710 Nodes",
        status: "OK",
        targetTab: "fleet",
        summary:
          "Real-time host and service telemetry across Linux, Windows Server, Kubernetes/EKS clusters, and CI/CD SAST build runners. Tracks host availability, service states, agent execution latency, and Top 10 CPU, memory, bandwidth, and disk consumers.",
        architectureNotes:
          "Combines native lightweight OS agents (<1 min polling) with eBPF kernel hooks and SNMPv3/OpenTelemetry collectors.",
        liveMetrics: [
          { label: "Monitored Hybrid Hosts", value: "11 Core Cluster Hosts (100% Up) · 710 Mesh Nodes", status: "OK" },
          { label: "Active Service Checks", value: "363 Total (347 OK · 5 WARN · 11 CRIT)", status: "WARN" },
          { label: "Peak CPU Consumer", value: "mysql-2.erp.xtrike.internal (203.09% multi-core)", status: "WARN" },
          { label: "Critical Disk Alert", value: "win-dc-04.corp.meridian-retail.com (91.45% C:/)", status: "CRIT" },
        ],
        cliCommand: "xtrike-sast fleet status --cluster linux-hybrid-hosts --top 10",
        relatedRoute: "/dashboard",
        relatedRouteLabel: "Open Split Triage Desk",
      },
      {
        id: "menu-prod-ai",
        title: "Explain with XTRIKE AI & Autonomous Workflows",
        category: "Product · Agentic Observability",
        badge: "Noctis AI",
        status: "VERIFIED",
        targetTab: "fleet",
        summary:
          "Embedded AI root-cause investigator that correlates infrastructure problems (disk exhaustion, backup crashes, network saturation) with source-code vulnerabilities (CWE-89 ADO.NET SQLi, CWE-78 Process.Start injection) and synthesizes verified patches.",
        architectureNotes:
          "Synchronizes automatically with live `/scan` workspace sessions so every newly scanned repository finding appears immediately in the Problem Dashboard.",
        liveMetrics: [
          { label: "Active AI Problem Dossiers", value: "5 Core + Live Workspace Scan Findings", status: "CRIT" },
          { label: "Data Quality & Grounding", value: "High / Cryptographically Verified", status: "OK" },
          { label: "False-Positive Reduction", value: "94.2% Cut via Neural-Triage + AST Proof", status: "OK" },
          { label: "Context-Exact Patch Synthesis", value: "C# ADO.NET, Java JDBC, Node.js, Python, Go", status: "OK" },
        ],
        cliCommand: "xtrike-sast ai explain --host win-dc-04.corp.meridian-retail.com --verify-patch",
        relatedRoute: "/developer-assist",
        relatedRouteLabel: "Open Developer Assist Workbench",
      },
      {
        id: "menu-prod-ux",
        title: "Synthetic User Experience (UX) Monitoring",
        category: "Product · End-to-End Journeys",
        badge: "7 Steps Live",
        status: "OK",
        targetTab: "ux",
        summary:
          "Proactive synthetic browser and API probes that continuously execute critical customer journeys (Checkout, OAuth2 PKCE login, Catalog Search, Payment Settlement, Signed Invoice Download) and verify security headers and query guards.",
        architectureNotes:
          "Executes from distributed regional runner nodes (`eu-central-01`, `us-east-02`, `ap-south-01`, `eu-west-03`) with sub-millisecond waterfall tracing.",
        liveMetrics: [
          { label: "Checkout Homepage & TLS 1.3", value: "641 ms (PASS · Strict HSTS)", status: "OK" },
          { label: "OAuth2 PKCE & MFA Handshake", value: "1.25 s (PASS · RS256 Nonce Verified)", status: "OK" },
          { label: "GraphQL Product Catalog Search", value: "4.92 s (WARN · Threshold 3.50s)", status: "WARN" },
          { label: "Settlement Ledger Write", value: "930 ms (PASS · Zero SQLi/SSRF Violations)", status: "OK" },
        ],
        cliCommand: "xtrike-sast synthetic run --plan checkout-oauth2-pkce --region eu-central-01",
        relatedRoute: "/scan",
        relatedRouteLabel: "Launch Live Workspace Scanner",
      },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    subtitle: "Full-Stack Domain Suites for Sysadmins, DevOps, NetOps, DBAs & AppSec",
    items: [
      {
        id: "menu-sol-server",
        title: "Scalable Server & Build-Runner Monitoring",
        category: "Solutions · Sysadmins & DevOps",
        badge: "1,765 Nodes",
        status: "OK",
        targetTab: "domains",
        summary:
          "Comprehensive observability for web servers, mail relays, Kubernetes nodes, and CI/CD SAST build runners across Linux, Windows, and macOS with both native agents and agentless SNMP/HTTP probes.",
        architectureNotes:
          "Auto-discovers host processes, container cgroups, systemd services, and AST build-runner sandboxes with sub-minute polling intervals.",
        liveMetrics: [
          { label: "Web & API Tier (NGINX / Envoy)", value: "0.8ms p95 · TLS 1.3 Strict", status: "OK" },
          { label: "Messaging & Queues (Kafka / RMQ)", value: "14.2k msg/sec · Zero Consumer Lag", status: "OK" },
          { label: "Cloud & K8s Clusters (EKS/AKS/GKE)", value: "710 Pods Healthy · eBPF Active", status: "OK" },
          { label: "Instrumented Build Runners", value: "1,765 Total across Ubuntu, RHEL, K8s & macOS", status: "OK" },
        ],
        cliCommand: "xtrike-sast monitor servers --discover-topology --interval 30s",
        relatedRoute: "/cyber-monitoring",
        relatedRouteLabel: "Inspect Server Suite Below",
      },
      {
        id: "menu-sol-network",
        title: "Holistic Network & Zero-Trust Fabric Monitoring",
        category: "Solutions · NetOps & SecOps",
        badge: "1.28 GBit/s",
        status: "OK",
        targetTab: "domains",
        summary:
          "End-to-end visibility across core switches, routers, enterprise Wi-Fi access points, and HA firewalls without alert storms. Correlates packet throughput and VPN tunnel health with east-west SSRF egress blocks.",
        architectureNotes:
          "Supports Cisco Nexus/Catalyst, Juniper Junos, Arista EOS, HPE Aruba, Palo Alto PAN-OS, Fortinet FortiGate, Check Point, and F5 BIG-IP.",
        liveMetrics: [
          { label: "Switches & Core Fabric", value: "1.28 GBit/s Peak · 0 CRC Packet Drops", status: "OK" },
          { label: "Wireless & Branch Edge", value: "412 Access Points UP · 99.4% RF Quality", status: "OK" },
          { label: "Firewalls & Zero-Trust Gateways", value: "38 HA Pairs Synced · 32 SSRF Probes Halted", status: "OK" },
          { label: "East-West Service Mesh mTLS", value: "100% SPIFFE/SPIRE Cert Rotation Verified", status: "OK" },
        ],
        cliCommand: "xtrike-sast network audit --snmp-v3 --verify-ssrf-egress-guards",
        relatedRoute: "/taint-graph",
        relatedRouteLabel: "View Inter-Procedural Taint Graph",
      },
      {
        id: "menu-sol-database",
        title: "Database & Query Parameterization Monitoring",
        category: "Solutions · DBAs & AppSec",
        badge: "6 DB Engines",
        status: "VERIFIED",
        targetTab: "domains",
        summary:
          "Dual-vantage database monitoring ('outside' network port/TLS probes + 'inside' OS/driver telemetry) that tracks buffer cache hit ratios, tablespace size, and live CWE-89 PreparedStatement / SqlParameter enforcement.",
        architectureNotes:
          "Covers PostgreSQL 16, SQL Server 2022 (ADO.NET), Oracle 19c RAC, MySQL 8.0 / Aurora, Redis 7.2 Cluster, and MongoDB 7.0 ReplicaSet.",
        liveMetrics: [
          { label: "PostgreSQL 16 (Primary Ledger)", value: "1.42 TiB · Cache 99.4% · PreparedStatement 100%", status: "OK" },
          { label: "SQL Server 2022 (ERP & Invoices)", value: "860 GiB · Cache 98.8% · SqlParameter Verified", status: "OK" },
          { label: "Oracle 19c RAC (Settlement Vault)", value: "3.10 TiB · Cache 99.6% · Bind Variables Enforced", status: "OK" },
          { label: "Redis 7.2 & MongoDB 7.0", value: "99.9% Cache Hit · BSON Operator Sanitizer Active", status: "OK" },
        ],
        cliCommand: "xtrike-sast db inspect --engines postgres,mssql,oracle,mysql,redis,mongodb --check-cwe89",
        relatedRoute: "/reports",
        relatedRouteLabel: "Open CWE-89 Proof Report",
      },
      {
        id: "menu-sol-posture",
        title: "SAST Posture, Reachable SCA & 710-Node Mesh",
        category: "Solutions · Enterprise AppSec",
        badge: "16.8K Findings",
        status: "WARN",
        targetTab: "posture",
        summary:
          "Aggregates static findings across 4 AST engines (XQL, DeepFlow, StructSCA, AST-Query), filters dependency CVEs by call-graph reachability, and enforces release gates across 710 repository nodes.",
        architectureNotes:
          "Enforces the 5 canonical XTRIKE proof states so architectural hypotheses and unverified candidates never inflate confirmed runtime counts.",
        liveMetrics: [
          { label: "Open SAST Findings (82 Repos)", value: "16.8K (+12.3% · 4 AST Engines)", status: "CRIT" },
          { label: "Call-Graph Reachable SCA CVEs", value: "6.4K (-6.2% noise reduction)", status: "WARN" },
          { label: "Verified AST Remediations", value: "1.3K (+18.4% unit-retest verified)", status: "OK" },
          { label: "Release Gate Score", value: "84 / 100 across 15,808 Policy Gates", status: "OK" },
        ],
        cliCommand: "xtrike-sast posture summary --format sarif-v2.1.0 --enforce-release-gate",
        relatedRoute: "/fusion-engine",
        relatedRouteLabel: "Open XTRIKE Fusion Studio",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    subtitle: "Predictable Host, Repository & Service-Based Enterprise Licensing",
    items: [
      {
        id: "menu-price-standard",
        title: "XTRIKE Standard Edition (DevSecOps & Cloud Teams)",
        category: "Pricing · Predictable Scale",
        badge: "Up to 70% TCO Cut",
        status: "OK",
        targetTab: "cli",
        summary:
          "Predictable per-host and per-repository licensing with all 4 AST engines (XQL, DeepFlow, StructSCA, AST-Query), 2,000+ infrastructure plugins, and unlimited developer IDE MCP scans.",
        architectureNotes:
          "No per-byte ingestion penalties or surprise metric overages — designed to reduce monitoring and AppSec spend by up to 70%.",
        liveMetrics: [
          { label: "Included Collectors & SAST Plugins", value: "2,000+ Infra Checks · 401 CWE Rules", status: "OK" },
          { label: "TCO Savings vs. Legacy Tool Sprawl", value: "Up to 70% Annual Spend Reduction", status: "OK" },
          { label: "False-Positive Triage Reduction", value: "94.2% fewer manual review hours", status: "OK" },
          { label: "Deployment Footprint", value: "SaaS, Hybrid Cloud, or Self-Hosted DEB/RPM/OCI", status: "OK" },
        ],
        cliCommand: "xtrike-sast license inspect --tier enterprise-standard",
        relatedRoute: "/cyber-monitoring",
        relatedRouteLabel: "Download CLI Runner Packages",
      },
      {
        id: "menu-price-sovereign",
        title: "XTRIKE Sovereign & Air-Gapped Enterprise Edition",
        category: "Pricing · Critical Infrastructure",
        badge: "Air-Gapped Ready",
        status: "VERIFIED",
        targetTab: "cli",
        summary:
          "Purpose-built for defense, banking, and critical-infrastructure operators requiring 100% air-gapped operation, Ed25519 cryptographic evidence ledgers, FIPS 140-3 crypto validation, and local Noctis AI inference.",
        architectureNotes:
          "Includes offline Agent Bakery package signing, deterministic PTES exploit sandboxes, and full audit-ledger export.",
        liveMetrics: [
          { label: "Network Isolation Support", value: "100% Air-Gapped & Sovereign VPC Ready", status: "OK" },
          { label: "Cryptographic Evidence Sealing", value: "Ed25519 + SHA-256 Merkle Hash Chain", status: "OK" },
          { label: "Synthetic UX & Exploit Replay", value: "Unlimited Local Sandbox Executions", status: "OK" },
          { label: "Dedicated SLA & Werks Support", value: "24/7 Mission-Critical Engineering Response", status: "OK" },
        ],
        cliCommand: "xtrike-sast init --profile ptes-nist-800-115 --air-gapped --verify-ed25519",
        relatedRoute: "/reports",
        relatedRouteLabel: "Inspect Signed Evidence Report",
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    subtitle: "Documentation, Learning Materials, Best Practices & Trainings",
    items: [
      {
        id: "learn-user-guide",
        title: "XTRIKE User & Operator Guide (v5.2.0)",
        category: "Documentation · Core Manual",
        badge: "v5.2.0",
        status: "VERIFIED",
        targetTab: "platform",
        summary:
          "Complete operator handbook covering XTRIKE's 4-stage hourglass pipeline, 8-engine hybrid AST configuration, Agent Bakery deployment, and 12-field semantic evidence-to-target binding.",
        architectureNotes:
          "Documents the strict separation between PRIMARY_REPOSITORY findings and ARCHITECTURAL_CANDIDATE_HYPOTHESIS advisories.",
        liveMetrics: [
          { label: "Engine Release Version", value: "XTRIKE v5.2.0-enterprise", status: "OK" },
          { label: "Supported Target Languages", value: "Java, C#/.NET, JS/TS, Python, Go, C/C++, Rust, PHP", status: "OK" },
          { label: "Canonical Proof States", value: "5 States (STATIC -> DATAFLOW -> GUARD -> MANUAL -> RUNTIME)", status: "OK" },
          { label: "Compliance Mapping", value: "OWASP Top 10:2025, ASVS 4.0.3, NIST 800-53, PCI-DSS 4.0", status: "OK" },
        ],
        cliCommand: "xtrike-sast help --manual operator-guide-v5.2.0",
        relatedRoute: "/reports",
        relatedRouteLabel: "Open Executive Technical Report",
      },
      {
        id: "learn-plugin-catalog",
        title: "2,000+ Monitoring & 401 SAST Plug-ins Catalog",
        category: "Documentation · Plugin Registry",
        badge: "Catalog",
        status: "OK",
        targetTab: "sensors",
        summary:
          "Full directory of XTRIKE's 2,000+ infrastructure, network, and database health checks alongside 401 deterministic CWE AST rules (`PLG-001` through `PLG-401`).",
        architectureNotes:
          "Every plugin is language-strict and framework-bound so Java rules never fire on C# or TypeScript targets.",
        liveMetrics: [
          { label: "Static AST Security Plugins", value: "401 Rules (PLG-001..PLG-401)", status: "OK" },
          { label: "Infrastructure & Cloud Checks", value: "2,000+ Pre-Built Collectors", status: "OK" },
          { label: "C# / .NET Benchmark Coverage", value: "SQLi (ADO.NET), CmdInj (Process.Start), Path, LDAP", status: "OK" },
          { label: "Custom XQL Rule Authoring", value: "Live AST Rule Editor Supported", status: "OK" },
        ],
        cliCommand: "xtrike-sast plugins list --filter cwe,infra,db",
        relatedRoute: "/rule-editor",
        relatedRouteLabel: "Open Custom Rule Editor",
      },
      {
        id: "learn-changelog",
        title: "Changelog & Proof-Engine Werks (v5.2.0)",
        category: "Documentation · Release Notes",
        badge: "Release Notes",
        status: "VERIFIED",
        targetTab: "posture",
        summary:
          "Detailed engineering changelog for XTRIKE v5.2.0: full 4-sink C# BenchmarkDotNet coverage, context-exact ADO.NET/BCL patches, 12-field evidence binding validator, and Dossier Header vs. Ledger reconciliation.",
        architectureNotes:
          "Eliminates cross-language Java/Linux template leakage on C#/.NET findings and reconciles AT-SQLI-03 acceptance test status.",
        liveMetrics: [
          { label: "Work Package WP-1 & WP-2", value: "4/4 C# Sinks & Context-Exact Patches Complete", status: "OK" },
          { label: "Work Package WP-3", value: "12-Field Semantic Binding Validator Enforced", status: "OK" },
          { label: "Work Package WP-4", value: "AT-SQLI-03 & Dossier Header Reconciled (0 Contradictions)", status: "OK" },
          { label: "Work Package WP-5", value: "CVSS v3.1 Base Score Lookup Table Enforced", status: "OK" },
        ],
        cliCommand: "xtrike-sast changelog --version 5.2.0-enterprise",
        relatedRoute: "/reports",
        relatedRouteLabel: "Verify in Report Engine",
      },
      {
        id: "learn-basics",
        title: "Code-to-Runtime Monitoring Basics",
        category: "Learning Materials · Foundation",
        badge: "Guide",
        status: "OK",
        targetTab: "platform",
        summary:
          "Step-by-step onboarding guide showing how XTRIKE links source-code AST taint paths to live container, server, and database metrics.",
        architectureNotes:
          "Covers setting up your first repository scan in `/scan`, inspecting findings in the Problem Dashboard, and verifying fixes.",
        liveMetrics: [
          { label: "Time to First Repository Scan", value: "< 60 seconds in /scan", status: "OK" },
          { label: "Time to First Host Telemetry", value: "< 2 minutes via DEB/RPM/OCI Runner", status: "OK" },
          { label: "Supported CI/CD Pipelines", value: "GitHub Actions, GitLab CI, Jenkins, Azure DevOps", status: "OK" },
          { label: "SARIF Export Standard", value: "SARIF v2.1.0 + CyclonesDX AI-BOM", status: "OK" },
        ],
        cliCommand: "xtrike-sast quickstart --repo https://github.com/OWASP/BenchmarkDotNet",
        relatedRoute: "/scan",
        relatedRouteLabel: "Run Live Quickstart Scan",
      },
      {
        id: "learn-webinars",
        title: "Live Architecture Webinars & Deep Dives",
        category: "Learning Materials · On-Demand",
        badge: "On-Demand",
        status: "OK",
        targetTab: "mesh",
        summary:
          "Recorded and live technical sessions with XTRIKE principal architects covering inter-procedural SSA taint graphs, eBPF sink sensors, and 710-node service-mesh monitoring.",
        architectureNotes:
          "Includes live walkthroughs of OWASP BenchmarkJavaScript and OWASP BenchmarkDotNet verification.",
        liveMetrics: [
          { label: "Session 01", value: "Eliminating 94.2% False Positives with Hybrid AST + AI", status: "OK" },
          { label: "Session 02", value: "Zero-Contradiction Cryptographic Evidence Ledgers", status: "OK" },
          { label: "Session 03", value: "Scaling Hybrid Infrastructure Monitoring to 10,000+ Hosts", status: "OK" },
          { label: "Interactive Lab Access", value: "Included in Browser Workspace", status: "OK" },
        ],
        cliCommand: "xtrike-sast lab launch --track architecture-deep-dive",
        relatedRoute: "/taint-graph",
        relatedRouteLabel: "Explore Taint Graph Lab",
      },
      {
        id: "learn-videos",
        title: "Sandbox Exploit Replay & Verification Walkthroughs",
        category: "Learning Materials · Lab",
        badge: "Lab",
        status: "VERIFIED",
        targetTab: "sensors",
        summary:
          "Interactive walkthroughs demonstrating how XTRIKE compiles target applications, executes controlled pre-patch exploit probes, applies context-exact AST patches, and verifies post-patch blocking.",
        architectureNotes:
          "Demonstrates the 9-step controlled verification workflow under PTES and NIST SP 800-115.",
        liveMetrics: [
          { label: "Pre-Patch Exploit Reproduction", value: "Deterministic Payload Replay in Isolated VM", status: "OK" },
          { label: "Post-Patch Exploit Blocking", value: "100% Payload Neutralization Verified", status: "OK" },
          { label: "Functional Regression Suite", value: "Unit & Integration Assertions Passing", status: "OK" },
          { label: "Evidence Artifact Sealing", value: "Ed25519 Signed Transcript", status: "OK" },
        ],
        cliCommand: "xtrike-sast verify --finding SAST-001 --sandbox isolated",
        relatedRoute: "/validation-engine",
        relatedRouteLabel: "Open 6-Stage Validation Engine",
      },
      {
        id: "learn-kb",
        title: "CWE, ASVS 4.0.3 & Proof-State Knowledge Base",
        category: "Best Practices · Reference",
        badge: "ASVS 4.0.3",
        status: "VERIFIED",
        targetTab: "posture",
        summary:
          "Comprehensive CWE remediation library mapping every XTRIKE plugin to OWASP ASVS 4.0.3 controls, NIST SP 800-53 rev5 families, and language-specific secure coding patterns.",
        architectureNotes:
          "Provides copy-ready parameterized query, command-execution, path-canonicalization, and LDAP-escaping templates.",
        liveMetrics: [
          { label: "CWE-89 SQL Injection", value: "SqlParameter / PreparedStatement / Bind Variables", status: "OK" },
          { label: "CWE-78 Command Injection", value: "ProcessStartInfo.ArgumentList / ProcessBuilder", status: "OK" },
          { label: "CWE-22 Path Traversal", value: "Path.GetFullPath + StartsWith(baseDir) Guard", status: "OK" },
          { label: "CWE-90 LDAP Injection", value: "RFC 4515 Filter Escaping (\\2a, \\28, \\29, \\5c)", status: "OK" },
        ],
        cliCommand: "xtrike-sast kb lookup --cwe CWE-89,CWE-78,CWE-22,CWE-90",
        relatedRoute: "/validation-engine",
        relatedRouteLabel: "Browse OWASP/CWE Catalog",
      },
      {
        id: "learn-blog",
        title: "AppSec & SRE Engineering Blog",
        category: "Best Practices · Articles",
        badge: "Articles",
        status: "OK",
        targetTab: "fleet",
        summary:
          "Deep technical articles from the XTRIKE engineering team on bridging the gap between static code analysis and production infrastructure observability.",
        architectureNotes:
          "Covers why runtime proof must execute the exact target language and framework rather than synthetic cross-language harness templates.",
        liveMetrics: [
          { label: "Featured Article 1", value: "Why Language-Matched Runtime Proof Matters in Enterprise SAST", status: "OK" },
          { label: "Featured Article 2", value: "Correlating Disk Exhaustion & Crashing Agents with Noctis AI", status: "OK" },
          { label: "Featured Article 3", value: "Securing AI Model Weights & MCP Servers with AI-BOM", status: "OK" },
          { label: "Publication Cadence", value: "Weekly Engineering Dispatches", status: "OK" },
        ],
        cliCommand: "xtrike-sast docssearch --topic 'language-matched runtime proof'",
        relatedRoute: "/ai-bom",
        relatedRouteLabel: "Inspect AI-BOM Studio",
      },
      {
        id: "learn-podcasts",
        title: "Autonomous Observability & Security Podcasts",
        category: "Best Practices · Audio",
        badge: "Audio",
        status: "OK",
        targetTab: "ux",
        summary:
          "Conversations with CISOs, Principal SREs, and Staff Security Engineers on autonomous incident resolution, synthetic UX monitoring, and proof-driven release gates.",
        architectureNotes:
          "Includes full technical transcripts and runnable benchmark configurations for every episode.",
        liveMetrics: [
          { label: "Episode 42", value: "From Alert Fatigue to Autonomous Root-Cause Dossiers", status: "OK" },
          { label: "Episode 41", value: "Zero-Trust Service Meshes & East-West SSRF Prevention", status: "OK" },
          { label: "Episode 40", value: "Inside XTRIKE v5.2.0's 8-Engine Hybrid AST Architecture", status: "OK" },
          { label: "Transcript Indexing", value: "100% Searchable in Ask Noctis AI", status: "OK" },
        ],
        cliCommand: "xtrike-sast noctis ask 'Summarize Episode 42 on autonomous root-cause dossiers'",
        relatedRoute: "/developer-assist",
        relatedRouteLabel: "Ask Noctis AI Assistant",
      },
      {
        id: "learn-classes",
        title: "XTRIKE Operator & AppSec Hands-On Classes",
        category: "Trainings · Curriculum",
        badge: "Hands-On",
        status: "OK",
        targetTab: "cli",
        summary:
          "Instructor-led and self-paced lab courses covering XTRIKE CLI installation, custom XQL AST rule writing, synthetic UX probe authoring, and enterprise fleet administration.",
        architectureNotes:
          "Every participant receives a pre-configured multi-language sandbox with live repository and infrastructure targets.",
        liveMetrics: [
          { label: "Course 101", value: "XTRIKE Fleet & Server Monitoring Administration (2 Days)", status: "OK" },
          { label: "Course 201", value: "Hybrid AST Rule Authoring & Inter-Procedural Taint Analysis", status: "OK" },
          { label: "Course 301", value: "PTES Controlled Exploit Verification & Evidence Sealing", status: "OK" },
          { label: "Lab Environment", value: "Browser + CLI Ready", status: "OK" },
        ],
        cliCommand: "xtrike-sast training enroll --course xtrike-301-ptes-verification",
        relatedRoute: "/rule-editor",
        relatedRouteLabel: "Practice in Rule Editor",
      },
      {
        id: "learn-schedule",
        title: "Certification Schedule & Practical Labs (2026 Q4)",
        category: "Trainings · Certification",
        badge: "2026 Q4",
        status: "OK",
        targetTab: "cli",
        summary:
          "Upcoming cohorts for the Certified XTRIKE Security & Observability Architect (CXSOA) practical examination.",
        architectureNotes:
          "Candidates must diagnose 3 hybrid infrastructure incidents and remediate 4 polyglot SAST vulnerabilities with zero evidence contradictions.",
        liveMetrics: [
          { label: "November 2026 Cohort", value: "Nov 18–20, 2026 · Virtual & Frankfurt / New York", status: "OK" },
          { label: "December 2026 Cohort", value: "Dec 09–11, 2026 · Virtual & London / Singapore", status: "OK" },
          { label: "Practical Exam Format", value: "4-Hour Live Sandbox + Evidence Ledger Audit", status: "OK" },
          { label: "Prerequisite", value: "XTRIKE Operator 101 & AppSec 201", status: "OK" },
        ],
        cliCommand: "xtrike-sast cert verify-readiness --profile cxsoa-2026",
        relatedRoute: "/reports",
        relatedRouteLabel: "Review Certification Report Standard",
      },
      {
        id: "learn-locations",
        title: "Global, Virtual & Air-Gapped Training Tracks",
        category: "Trainings · Delivery",
        badge: "Enterprise",
        status: "OK",
        targetTab: "mesh",
        summary:
          "Flexible training delivery across regional training centers, live virtual classrooms, and on-site air-gapped sovereign facilities.",
        architectureNotes:
          "Custom enterprise tracks can be tailored directly to your organization's language stack (Java, C#/.NET, TypeScript, Python, Go) and cloud topology.",
        liveMetrics: [
          { label: "Americas Hubs", value: "New York, Austin, Reston (Federal/Air-Gapped)", status: "OK" },
          { label: "EMEA Hubs", value: "Munich, Frankfurt, London, Zurich", status: "OK" },
          { label: "APAC Hubs", value: "Singapore, Tokyo, Sydney", status: "OK" },
          { label: "On-Site Sovereign Delivery", value: "Available Worldwide", status: "OK" },
        ],
        cliCommand: "xtrike-sast training hubs --list-global",
        relatedRoute: "/mcp-server",
        relatedRouteLabel: "Configure Team MCP Server",
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    subtitle: "XTRIKE Exchange, Open-Source Plugins, MCP Hub & Advisory Forum",
    items: [
      {
        id: "menu-comm-exchange",
        title: "XTRIKE Exchange (Community Plugins & XQL Rules)",
        category: "Community · Plugin Exchange",
        badge: "2,400+ Packs",
        status: "OK",
        targetTab: "sensors",
        summary:
          "Discover, verify, and install community-contributed SNMP/OTel infrastructure check packs and custom XQL static analysis rules, all cryptographically signed before execution.",
        architectureNotes:
          "Integrates directly with the Rule Editor (`/rule-editor`) and CLI package manager.",
        liveMetrics: [
          { label: "Verified Community Check Packs", value: "2,000+ Infra & Network Collectors", status: "OK" },
          { label: "Custom XQL Security Rules", value: "401 Core + Community CWE Packs", status: "OK" },
          { label: "Package Signature Verification", value: "SHA-256 + Ed25519 Mandatory", status: "OK" },
          { label: "IDE MCP Server Extensions", value: "VS Code, Cursor, Windsurf, JetBrains", status: "OK" },
        ],
        cliCommand: "xtrike-sast exchange search --verified-only",
        relatedRoute: "/rule-editor",
        relatedRouteLabel: "Open XQL Rule Editor",
      },
      {
        id: "menu-comm-mcp",
        title: "XTRIKE MCP Server & GitHub Actions Community",
        category: "Community · Developer Ecosystem",
        badge: "MCP Protocol",
        status: "VERIFIED",
        targetTab: "cli",
        summary:
          "Connect your IDE coding agents and CI/CD workflows to XTRIKE via the Model Context Protocol (MCP) server and SARIF v2.1.0 GitHub Action runners.",
        architectureNotes:
          "Exposes `scan_buffer`, `verify_finding`, `explain_with_ai`, and `apply_patch` tools directly to local developer agents.",
        liveMetrics: [
          { label: "MCP Protocol Latency", value: "14ms local stdio / SSE bridge", status: "OK" },
          { label: "Exposed Agent Tools", value: "scan_buffer, apply_patch, query_fleet, verify_proof", status: "OK" },
          { label: "GitHub Action Runner", value: "xtrike-sast-ci-workflow.yml Ready", status: "OK" },
          { label: "AI-BOM Supply Chain Sync", value: "1,420 Model Weights & MCP Endpoints Indexed", status: "OK" },
        ],
        cliCommand: "npx @xtrike/mcp-sast --serve --profile ptes-nist-800-115",
        relatedRoute: "/mcp-server",
        relatedRouteLabel: "Open MCP Server Hub",
      },
    ],
  },
];

export const XTRIKE_LEARN_MEGA_HUB = {
  columns: [
    {
      heading: "Documentation",
      items: [
        { id: "learn-user-guide", label: "XTRIKE User & Operator Guide", badge: "v5.2.0", href: "/reports" },
        { id: "learn-plugin-catalog", label: "2,000+ Monitoring & 400+ SAST Plug-ins", badge: "Catalog", href: "/rule-editor" },
        { id: "learn-changelog", label: "Changelog & Proof-Engine Werks", badge: "Release Notes", href: "/reports" },
      ],
    },
    {
      heading: "Learning Materials",
      items: [
        { id: "learn-basics", label: "Code-to-Runtime Monitoring Basics", badge: "Guide", href: "/scan" },
        { id: "learn-webinars", label: "Live Architecture Webinars", badge: "On-Demand", href: "/taint-graph" },
        { id: "learn-videos", label: "Sandbox Exploit Replay Videos", badge: "Lab", href: "/validation-engine" },
      ],
      ctaCard: {
        id: "menu-prod-platform",
        title: "XTRIKE Interactive Demo",
        subtitle: "Explore our live 4-engine SAST + hybrid infrastructure sandbox in action!",
        href: "/scan",
        accent: "emerald" as const,
      },
    },
    {
      heading: "Best Practices",
      items: [
        { id: "learn-kb", label: "CWE & Proof-State Knowledge Base", badge: "ASVS 4.0.3", href: "/validation-engine" },
        { id: "learn-blog", label: "AppSec & SRE Engineering Blog", badge: "Articles", href: "/ai-bom" },
        { id: "learn-podcasts", label: "Autonomous Observability Podcasts", badge: "Audio", href: "/developer-assist" },
      ],
      ctaCard: {
        id: "menu-prod-ai",
        title: "Ask Noctis AI",
        subtitle: "Got a question? Our embedded AI assistant guides you to exact root causes & patches!",
        href: "#explain-with-ai",
        accent: "indigo" as const,
      },
    },
    {
      heading: "Trainings & Certification",
      items: [
        { id: "learn-classes", label: "XTRIKE Operator & AppSec Classes", badge: "Hands-On", href: "/rule-editor" },
        { id: "learn-schedule", label: "Certification Schedule & Labs", badge: "2026 Q4", href: "/reports" },
        { id: "learn-locations", label: "Global & Air-Gapped Training Tracks", badge: "Enterprise", href: "/mcp-server" },
      ],
    },
  ],
};

// ============================================================================
// 9. SERVER, NETWORK & DATABASE MONITORING SUITES (BATCH 2 CUSTOMIZATION)
// ============================================================================

export const XTRIKE_SERVER_DEVOPS_CAPABILITIES = {
  title: "Scalable server & build-runner monitoring software for Sysadmins, DevOps & AppSec",
  subtitle:
    "Ensure peak server and CI/CD runner performance across your infrastructure with XTRIKE. Eliminate preventable outages, build-queue stalls, and late-night security emergencies.",
  checkmarks: [
    "Monitor any type of server (web, mail, database, Kubernetes nodes, CI/CD runners, and isolated SAST sandboxes)",
    "Flexible server & code monitoring through more than 2,000 smart infrastructure checks and 400+ AST security rules",
    "Zero-friction configuration, automated topology discovery, and live service-dependency mapping",
    "Native lightweight agents for Windows, Linux (Debian, Ubuntu, RHEL, AlmaLinux, SUSE), and macOS",
    "Agentless monitoring via SNMP v3 and TCP/UDP protocol probes (HTTPS, gRPC, LDAP, IMAP, SSH, SMTP)",
    "API-based health & security checks over HTTP/JSON, GraphQL, OpenTelemetry, SSH, and Kubernetes APIs",
    "High-frequency telemetry & taint-sensor measurement intervals as short as < 1 minute (sub-second eBPF hooks)",
  ],
  serverTopologyNodes: [
    { id: "srv-web", label: "Web & API Tier", metrics: "NGINX / Envoy · 0.8ms p95 · TLS 1.3", status: "OK" as const },
    { id: "srv-mail", label: "Messaging & Queues", metrics: "Kafka / RabbitMQ · 14.2k msg/s", status: "OK" as const },
    { id: "srv-cloud", label: "Cloud & K8s Clusters", metrics: "EKS / AKS / GKE · 710 pods healthy", status: "OK" as const },
    { id: "srv-db", label: "Primary DB Clusters", metrics: "PostgreSQL / SQL Server · 99.99% Up", status: "OK" as const },
  ],
};

export const XTRIKE_NETWORK_MONITORING_DOMAINS = {
  title: "An easy-to-deploy holistic network & service-mesh monitoring suite",
  leadParagraph:
    "Your entire enterprise depends on a resilient, zero-trust network fabric. Even mid-sized hybrid topologies quickly grow complex across cloud VPCs, on-premise switches, and microservice meshes. XTRIKE gives you unified visibility across every layer without noisy alert storms.",
  domains: [
    {
      category: "Switches, Routers & Core Fabric",
      description:
        "Monitor packet throughput, CRC/frame error rates, port link states, bandwidth saturation, CPU utilization, fan RPM, redundant power supplies, and thermal sensors across every core and top-of-rack appliance.",
      vendors: ["Cisco Nexus/Catalyst", "Juniper Junos", "Arista EOS", "Dell PowerSwitch", "Extreme Networks", "Huawei", "HPE Aruba", "Netgear", "MikroTik"],
      liveStat: "1.28 GBit/s peak fabric throughput · 0 packet drops",
    },
    {
      category: "Wireless, Edge & SD-WAN",
      description:
        "Track access point availability, channel interference, signal-to-noise ratio (SNR), roaming latency, and authenticated client density across campus and branch edges.",
      vendors: ["HPE Aruba", "Cisco Meraki", "Ubiquiti UniFi", "Ruckus", "MikroTik", "FortiAP", "Netgear ProSAFE"],
      liveStat: "412 Access Points UP · 99.4% RF link quality",
    },
    {
      category: "Firewalls, WAF & Zero-Trust Gateways",
      description:
        "Ensure perimeter and east-west security by monitoring IPsec/WireGuard VPN tunnel state, High Availability (HA) failover sync, session table saturation, TLS inspection latency, and SSRF egress blocks.",
      vendors: ["Palo Alto PAN-OS", "Fortinet FortiGate", "Check Point", "F5 BIG-IP", "Cloudflare Magic WAN", "Cisco Firepower", "Sophos"],
      liveStat: "38 HA Firewall Pairs Synced · 32 SSRF probes halted",
    },
  ],
};

export const XTRIKE_DATABASE_MONITORING_CAPABILITIES = {
  title: "Database & Query Security Monitoring with XTRIKE",
  subtitle:
    "Complete observability and parameterization assurance across your relational, document, and in-memory database fleet — covering availability, tablespace growth, buffer cache hit ratios, lock contention, and live SQL injection guard verification.",
  checkmarks: [
    "Monitor databases across Linux, Windows Server, Solaris, AIX, HP-UX, and managed cloud engines (AWS RDS/Aurora, Azure SQL, Cloud SQL)",
    "Dual-vantage inspection: monitor from the 'outside' (network port & TLS handshake probes) and from 'within' (OS agent, ADO.NET, & JDBC telemetry)",
    "Unified coverage for on-premise enterprise clusters and serverless cloud-native data stores",
    "Preconfigured production thresholds for connection pools, replication lag, and deadlock detection to cut setup time",
    "Out-of-the-box diagnostic queries built into XTRIKE's database plugin pack — zero manual DBA scripting required",
    "Active query security monitoring: correlate slow or anomalous queries directly with XTRIKE CWE-89 PreparedStatement / SqlParameter proof states",
  ],
  engines: [
    { name: "PostgreSQL 16", role: "Primary Ledger Store", cacheHitRatio: "99.4%", sizeLabel: "1.42 TiB", queryGuard: "PreparedStatement 100%", state: "OK" as const },
    { name: "SQL Server 2022 (ADO.NET)", role: "ERP & Invoices DB", cacheHitRatio: "98.8%", sizeLabel: "860 GiB", queryGuard: "SqlParameter @userFilter Verified", state: "OK" as const },
    { name: "Oracle 19c RAC", role: "Core Settlement Vault", cacheHitRatio: "99.6%", sizeLabel: "3.10 TiB", queryGuard: "Bind Variables Enforced", state: "OK" as const },
    { name: "MySQL 8.0 / Aurora", role: "Identity & Session Read-Replicas", cacheHitRatio: "97.9%", sizeLabel: "540 GiB", queryGuard: "Strict Parameterized Queries", state: "OK" as const },
    { name: "Redis 7.2 Cluster", role: "Idempotency & Rate-Limit Cache", cacheHitRatio: "99.9%", sizeLabel: "64 GiB RAM", queryGuard: "mTLS + ACL Bound", state: "OK" as const },
    { name: "MongoDB 7.0 ReplicaSet", role: "Audit & SARIF Artifact Store", cacheHitRatio: "98.2%", sizeLabel: "1.18 TiB", queryGuard: "BSON Operator Sanitizer Active", state: "OK" as const },
  ],
};

export function buildCyberMonitoringNoctisSummary(question = ""): string {
  const q = question.toLowerCase();

  // Check if the user clicked or asked about any Cyber Monitor Menu Item (Product, Solutions, Pricing, Learn, Community)
  const allMenuItems = XTRIKE_CYBER_MONITOR_MENU_GROUPS.flatMap((g) => g.items);
  const matchedMenuDossier = allMenuItems.find(
    (item) =>
      q.includes(item.id.toLowerCase()) ||
      q.includes(item.title.toLowerCase())
  );

  const menuDossierSection = matchedMenuDossier
    ? [
        `### Noctis AI Answer — ${matchedMenuDossier.title} (\`${matchedMenuDossier.badge}\`)`,
        `- **Menu Category:** ${matchedMenuDossier.category} · **Verification Status:** \`${matchedMenuDossier.status}\` · **Dossier ID:** \`${matchedMenuDossier.id}\``,
        `\n#### 1. Detail 01 — Executive Summary & Operational Scope`,
        `${matchedMenuDossier.summary}`,
        `\n#### 2. Detail 02 — Architecture & Security Guard Specification`,
        `${matchedMenuDossier.architectureNotes}`,
        `\n#### 3. Detail 03 — 4 Live Telemetry & Proof Metrics`,
        ...matchedMenuDossier.liveMetrics.map(
          (m) => `- **${m.label}:** \`${m.value}\` (${m.delta || m.status || "VERIFIED"})`
        ),
        `\n#### 4. Detail 04 — Executable CLI Command & Studio Route`,
        `\`\`\`bash\n${matchedMenuDossier.cliCommand}\n\`\`\``,
        `- **Connected Workspace Route:** \`${matchedMenuDossier.relatedRoute}\` (${matchedMenuDossier.relatedRouteLabel})`,
        `\n---`,
      ].join("\n")
    : "";

  // Check if the user clicked a specific Repository Mesh Node (e.g., payment-ledger-svc-04)
  const matchedNode = XTRIKE_HONEYCOMB_HOSTS.find((n) =>
    q.includes(n.hostname.toLowerCase()) || q.includes(n.id.toLowerCase())
  );

  // Check if the user clicked a specific Release-Gate Violation row
  const matchedViolation = XTRIKE_HOST_PROBLEMS.find((v) =>
    q.includes(v.host.toLowerCase())
  );

  // Check if the user clicked or asked about a specific "Explain with XTRIKE AI" Problem Dossier
  const matchedAiDossier = XTRIKE_AI_EXPLAIN_DOSSIERS.find(
    (d) =>
      q.includes(d.host.toLowerCase()) ||
      q.includes(d.service.toLowerCase()) ||
      q.includes(d.id.toLowerCase())
  );

  const nodeSection = matchedNode
    ? [
        `#### Selected Repository Node Inspection — \`${matchedNode.hostname}\` (\`${matchedNode.id}\`)`,
        `- **Cluster / Stack:** ${matchedNode.cluster} · Language: \`${matchedNode.language}\``,
        `- **Gate Status:** \`${matchedNode.state}\` · **Policy Gates Checked:** \`${matchedNode.servicesCount}\` · **Open SAST Findings:** \`${matchedNode.openFindings}\` · **AST Scan Latency:** \`${matchedNode.latencyMs}ms\``,
        `- **Recommended Action:** ${
          matchedNode.openFindings > 0
            ? "Run 6-Stage Proof Validation on open sinks and apply language-matched AST remediation diff before release promotion."
            : "All AST & CWE policy gates passing (`MITIGATED_BY_GUARD`)."
        }`,
      ].join("\n")
    : "";

  const violationSection = matchedViolation
    ? [
        `#### Active Release-Gate Violation Dossier — \`${matchedViolation.host}\``,
        `- **Gate / Rule:** ${matchedViolation.service} (\`${matchedViolation.cwe}\`)`,
        `- **Canonical Proof State:** \`${matchedViolation.proofState}\` (\`${matchedViolation.state}\` · detected ${matchedViolation.since})`,
        `- **Analyzer Trace:** \`${matchedViolation.pluginOutput}\``,
      ].join("\n")
    : "";

  const aiDossierSection = matchedAiDossier
    ? [
        `#### Explain with XTRIKE AI Dossier — \`${matchedAiDossier.host}\` · \`${matchedAiDossier.service}\` (\`${matchedAiDossier.serviceStatus}\`)`,
        `- **Category / CWE:** \`${matchedAiDossier.cweOrCategory}\` · **Data Quality:** \`${matchedAiDossier.dataQuality}\` · **Detected:** ${matchedAiDossier.since}`,
        `- **AI Root-Cause Summary:** ${matchedAiDossier.aiSummary}`,
        `- **Key Telemetry Metrics:**`,
        ...matchedAiDossier.metrics.map(
          (m) => `  - **${m.metric}:** \`${m.value}\` (${m.status || "OK"})`
        ),
        `- **Service Context:** ${matchedAiDossier.serviceContext}`,
      ].join("\n")
    : "";

  const pkgLines = XTRIKE_DISTRO_ACCORDION_GROUPS.flatMap((g) =>
    g.packages.map(
      (p) =>
        `  - **${p.distroFamily} (${p.distroVersion} · ${p.edition}):** \`${p.packageFilename}\` (SHA-256: \`${p.sha256.slice(0, 16)}...\`)\n    - Install: \`${p.wgetCommand} && ${p.installCommand}\``
    )
  ).join("\n");

  return [
    `### Noctis — XTRIKE Platform Architecture, Hybrid Fleet, AI Problem Drawer, Synthetic UX & SAST Ledgers (\`/cyber-monitoring\`)`,
    menuDossierSection,
    nodeSection,
    violationSection,
    aiDossierSection,
    `#### 0. The XTRIKE Platform — 4-Stage Hourglass & 4-Chevron Hexagonal Core`,
    `- **Top Workflow Integrations (5 Hexagons):** ${XTRIKE_WORKFLOW_INTEGRATIONS.map((w) => `\`${w.label}\` (${w.detail})`).join(" · ")}`,
    `- **Top Monitoring Pillars:** ${XTRIKE_HOURGLASS_TOP_PILLARS.map((p) => `**${p.title}** (${p.metricBadge})`).join(" · ")}`,
    ...XTRIKE_PIPELINE_HOURGLASS_STAGES.map(
      (s) => `- **Stage ${s.stepNumber} — \`${s.verticalLabel}\` (${s.headline}):** ${s.leadBold} ${s.subDetail}`
    ),
    `- **Bottom Data Extraction Collectors (7 Hexagons):** ${XTRIKE_EXTRACTION_COLLECTORS.map((c) => `\`${c.label}\` (${c.tag})`).join(" · ")}`,
    `\n#### 0B. Hybrid Enterprise Fleet & "Explain with XTRIKE AI" Problem Drawer`,
    `- **Host Statistics:** \`${XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.up}/${XTRIKE_HYBRID_FLEET_TELEMETRY.hostStats.total} Up\` · **Service Statistics:** \`${XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.ok} OK\`, \`${XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.warning} Warning\`, \`${XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.critical} Critical\` (\`${XTRIKE_HYBRID_FLEET_TELEET_TOTAL_FALLBACK()}\` Total)`,
    `- **Top CPU Host:** \`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Cpu[0].host}\` (\`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Cpu[0].valueLabel}\`) · **Top Memory Host:** \`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Memory[0].host}\` (\`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Memory[0].valueLabel}\`) · **Top Disk Volume:** \`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Disk[0].host}\` (\`${XTRIKE_HYBRID_FLEET_TELEMETRY.top10Disk[0].valueLabel}\`)`,
    `- **Active "Explain with XTRIKE AI" Problem Dossiers (${XTRIKE_AI_EXPLAIN_DOSSIERS.length}):**`,
    ...XTRIKE_AI_EXPLAIN_DOSSIERS.map(
      (d) => `  - **\`${d.host}\` — ${d.service}** (\`${d.serviceStatus}\` · \`${d.cweOrCategory}\`): ${d.aiSummary.slice(0, 160)}...`
    ),
    `\n#### 0C. Synthetic User Experience (UX) Journeys & Full-Stack Domain Suites`,
    `- **End-to-End Synthetic UX Steps (${XTRIKE_SYNTHETIC_UX_STEPS.length}):**`,
    ...XTRIKE_SYNTHETIC_UX_STEPS.map(
      (u) => `  - \`[${u.state}]\` **${u.application}** (${u.taskName}): \`${u.runtimeLabel}\` — ${u.statusDetail}`
    ),
    `- **Network Monitoring Domains:** ${XTRIKE_NETWORK_MONITORING_DOMAINS.domains.map((d) => `**${d.category}** (${d.liveStat})`).join(" · ")}`,
    `- **Monitored Database Engines (${XTRIKE_DATABASE_MONITORING_CAPABILITIES.engines.length}):** ${XTRIKE_DATABASE_MONITORING_CAPABILITIES.engines.map((db) => `**${db.name}** (${db.sizeLabel}, Cache ${db.cacheHitRatio}, Guard: \`${db.queryGuard}\`)`).join(" · ")}`,
    `\n#### 1. Ledger 01 — SAST & Reachable CVE Posture Summary`,
    `- **Open SAST Findings:** \`16.8K\` (\`+12.3%\` across 82 repositories & 4 AST engines: \`XQL\`, \`DeepFlow\`, \`StructSCA\`, \`AST-Query\`)`,
    `- **Reachable SCA CVEs:** \`6.4K\` (\`-6.2%\` filtered by active call-graph reachability)`,
    `- **Verified AST Fixes:** \`1.3K\` (\`+18.4%\` passed post-fix unit retest suite)`,
    `- **5 Canonical Proof States Breakdown:**`,
    ...OPEN_RISK_INSTANCES.map(
      (s) => `  - **${s.severity} (\`${s.countLabel}\` · ${s.percentage}%):** \`${s.proofState}\``
    ),
    `- **Findings by Application Tier & Primary CWE:**`,
    ...OPEN_DEPLOYMENT_INSTANCES.map(
      (d) => `  - **${d.name}** (\`${d.repoSlug}\`): **${d.countLabel}** findings · Primary CWE: \`${d.primaryCwe}\``
    ),
    `\n#### 2. Ledger 02 — Code-to-Runtime Sink Sensors & Runner Coverage`,
    `- **Sensor KPIs:** Active Sink Triggers \`213\` (\`+18%\`) · Exploit Probes Halted \`32\` (\`+14%\`) · Unauth Taint Routes \`26\` (\`-11%\`) · Manual Proof Queue \`26\` · AST Diffs Verified \`73\` (\`+29%\`) · Release Gate Score \`84/100\` (\`+6 pts\`)`,
    `- **Instrumented Build & Runtime Fleet (\`1,765\` Nodes):**`,
    ...MONITORED_HOSTS_BY_OS.map((o) => `  - ${o.os}: \`${o.hosts}\` nodes`),
    `- **Recent SAST Sink Interceptions:**`,
    ...MOST_RECENT_DETECTIONS.map(
      (det) =>
        `  - \`${det.id}\` (\`${det.pluginId}\` · \`${det.cwe}\`): **${det.signature}** at \`${det.host}\` (${det.os}) — **${det.action}**`
    ),
    `\n#### 3. Ledger 03 — Repository & Microservice Mesh (\`710\` Nodes · \`15,808\` Policy Gates)`,
    `- **Mesh Health:** \`709 Online\`, \`0 Offline\`, \`1 Quarantined\` · **Policy Gates:** \`14,839 Passing\`, \`691 Warning\`, \`67 Needs Triage\`, \`210 Release-Blocking\` · **24h Taint Events:** \`1,001\``,
    `- **Priority Release-Gate Violators:**`,
    ...XTRIKE_TOP_ALERTERS.map(
      (a) =>
        `  - \`${a.host}\` (${a.primaryCwe}): **${a.totalAlerts} gates** (\`${a.critCount} CRIT\`, \`${a.warnCount} WARN\`)`
    ),
    `\n#### 4. Ledger 04 — XTRIKE SAST CLI & Runner Installation (\`v${XTRIKE_CLI_RUNTIME_SPEC.version}\`)`,
    pkgLines,
    `- **Initialize & Start All 4 XTRIKE SAST Engines:**`,
    `  \`\`\`bash`,
    `  xtrike-sast --version`,
    `  xtrike-sast init --profile ${XTRIKE_CLI_RUNTIME_SPEC.profileName}`,
    `  xtrike-sast daemon start --engines xql,deepflow,structsca,ast-query`,
    `  \`\`\``,
  ]
    .filter(Boolean)
    .join("\n");
}

function XTRIKE_HYBRID_FLEET_TELEET_TOTAL_FALLBACK(): number {
  return XTRIKE_HYBRID_FLEET_TELEMETRY.serviceStats.total;
}
