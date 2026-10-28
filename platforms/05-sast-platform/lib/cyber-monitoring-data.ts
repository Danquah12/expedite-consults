export interface RiskInstanceSlice {
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  count: number;
  displayCount: string;
  color: string;
  percentage: number;
}

export interface DeploymentEnvironmentBar {
  environment: string;
  shortLabel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
  clusterOwner: string;
  linkedCwes: string[];
}

export interface AntivirusKpiCard {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
  numericValue: number;
  accentColor: string;
  description: string;
}

export interface HostOsSlice {
  os: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DetectionTimelinePoint {
  year: number;
  linux: number;
  windows: number;
  mac: number;
}

export interface RecentDetectionRecord {
  id: string;
  severity: "Critical" | "High" | "Medium";
  tactic: string;
  mitreId: string;
  techniqueName: string;
  timestamp: string;
  hostId: string;
  fullHostName: string;
  processOrPath: string;
  linkedSastFindingId: string;
  status: "Active" | "Contained" | "Remediated";
}

export interface XtrikeTopAlerter {
  problems: number;
  host: string;
  service: string;
  state: "CRIT" | "WARN" | "OK";
  lastCheck: string;
  outputSummary: string;
  correlatedCwe?: string;
}

export interface XtrikeHexHostCell {
  id: string;
  hostname: string;
  cluster: string;
  state: "UP" | "DOWN" | "WARN";
  servicesOk: number;
  servicesWarn: number;
  servicesCrit: number;
  cpuLoad: string;
  memoryUsed: string;
}

export interface XtrikeDistroReleaseRow {
  releaseVersion: string;
  codename: string;
  edition: "community" | "ultimate";
  filename: string;
  wgetCommand: string;
  aptInstallCommand: string;
  sha256: string;
}

export interface XtrikeDistroAccordionGroup {
  id: string;
  distroName: string;
  releases: XtrikeDistroReleaseRow[];
}

export const CYBER_VULN_KPI_SUMMARY = {
  openVulnerabilityCount: 16800,
  openVulnerabilityDisplay: "16.8K",
  openCveCount: 6400,
  openCveDisplay: "6.4K",
  openRemediationCount: 1300,
  openRemediationDisplay: "1.3K",
  totalRiskInstances: 16065,
};

export const OPEN_RISK_INSTANCES: RiskInstanceSlice[] = [
  { severity: "Critical", count: 1400, displayCount: "1.4K", color: "#0b6e4f", percentage: 8.7 },
  { severity: "High",     count: 6000, displayCount: "6.0K", color: "#149c68", percentage: 37.3 },
  { severity: "Medium",   count: 7100, displayCount: "7.1K", color: "#5ce1b8", percentage: 44.2 },
  { severity: "Low",      count: 1300, displayCount: "1.3K", color: "#9bf0d5", percentage: 8.1 },
  { severity: "Info",     count: 265,  displayCount: "265",  color: "#d7fbf0", percentage: 1.7 },
];

export const OPEN_DEPLOYMENT_INSTANCES: DeploymentEnvironmentBar[] = [
  {
    environment: "AWS Production",
    shortLabel: "AWS Production",
    critical: 40,
    high: 11,
    medium: 5,
    low: 0,
    info: 0,
    total: 56,
    clusterOwner: "Cloud Platform SecOps",
    linkedCwes: ["CWE-89", "CWE-918", "CWE-798"],
  },
  {
    environment: "Fargate Demo",
    shortLabel: "Fargate Demo",
    critical: 0,
    high: 35,
    medium: 9,
    low: 0,
    info: 0,
    total: 44,
    clusterOwner: "Container Runtime Team",
    linkedCwes: ["CWE-250", "CWE-94"],
  },
  {
    environment: "Ozone Demo Dev",
    shortLabel: "Ozone Demo De",
    critical: 20,
    high: 14,
    medium: 5,
    low: 0,
    info: 0,
    total: 39,
    clusterOwner: "AppSec Sandbox Team",
    linkedCwes: ["CWE-502", "CWE-611"],
  },
  {
    environment: "Development",
    shortLabel: "Development",
    critical: 24,
    high: 8,
    medium: 4,
    low: 0,
    info: 0,
    total: 36,
    clusterOwner: "Core Engineering",
    linkedCwes: ["CWE-79", "CWE-89", "CWE-22"],
  },
  {
    environment: "Product Manage",
    shortLabel: "Product Manage",
    critical: 20,
    high: 10,
    medium: 3,
    low: 0,
    info: 0,
    total: 33,
    clusterOwner: "Product Portal Squad",
    linkedCwes: ["CWE-639", "CWE-347"],
  },
  {
    environment: "CIS Benchmark",
    shortLabel: "CIS Benchmark fo",
    critical: 0,
    high: 22,
    medium: 15,
    low: 0,
    info: 0,
    total: 37,
    clusterOwner: "Compliance & Hardening",
    linkedCwes: ["CWE-16", "CWE-284"],
  },
  {
    environment: "ExposureNotifica",
    shortLabel: "ExposureNotifica",
    critical: 0,
    high: 29,
    medium: 4,
    low: 0,
    info: 0,
    total: 33,
    clusterOwner: "Notification Gateway",
    linkedCwes: ["CWE-918", "CWE-400"],
  },
  {
    environment: "Production Data",
    shortLabel: "Production Data",
    critical: 0,
    high: 0,
    medium: 15,
    low: 5,
    info: 0,
    total: 20,
    clusterOwner: "Data Lake & Analytics",
    linkedCwes: ["CWE-312", "CWE-532"],
  },
];

export const ANTIVIRUS_PERFORMANCE_KPIS: AntivirusKpiCard[] = [
  {
    id: "detections",
    label: "Detections",
    value: "213",
    numericValue: 213,
    accentColor: "#0ea5e9",
    description: "Total endpoint, container, and runtime behavioral detections across monitored hosts.",
  },
  {
    id: "attacks-prevented",
    label: "Attacks prevented",
    subLabel: "Last day",
    value: "32",
    numericValue: 32,
    accentColor: "#10b981",
    description: "Exploit payloads and shellcode executions blocked in the last 24 hours.",
  },
  {
    id: "leads-on-hunting",
    label: "Leads on hunting",
    value: "26",
    numericValue: 26,
    accentColor: "#f97316",
    description: "Active threat-hunting hypotheses correlated with static SAST taint sinks.",
  },
  {
    id: "hunting-leads-stock",
    label: "Hunting leads stock",
    value: "26",
    numericValue: 26,
    accentColor: "#0284c7",
    description: "Queued behavioral and AST indicator leads awaiting analyst verification.",
  },
  {
    id: "remedied-detections",
    label: "Remedied detections",
    subLabel: "Last 30 days",
    value: "73",
    numericValue: 73,
    accentColor: "#14b8a6",
    description: "Detections closed via verified code patches, container rebuilds, or host isolation.",
  },
  {
    id: "current-score",
    label: "Current score",
    value: "53/100",
    numericValue: 53,
    accentColor: "#f97316",
    description: "Composite cyber defense & endpoint resilience score across 1,765 monitored hosts.",
  },
];

export const MONITORED_HOSTS_BY_OS: { totalHosts: number; breakdown: HostOsSlice[] } = {
  totalHosts: 1765,
  breakdown: [
    { os: "Windows",    count: 890, percentage: 50.4, color: "#0ea5e9" },
    { os: "Linux x86",  count: 340, percentage: 19.3, color: "#0369a1" },
    { os: "Lumos X64",  count: 215, percentage: 12.2, color: "#0284c7" },
    { os: "MacOS",      count: 160, percentage: 9.1,  color: "#38bdf8" },
    { os: "Chrome OS",  count: 85,  percentage: 4.8,  color: "#7dd3fc" },
    { os: "iOS",        count: 45,  percentage: 2.5,  color: "#bae6fd" },
    { os: "Android",    count: 30,  percentage: 1.7,  color: "#e0f2fe" },
  ],
};

export const ACTIVITY_DETECTION_TIMELINE: DetectionTimelinePoint[] = [
  { year: 2008, linux: 42,   windows: 15, mac: 5 },
  { year: 2009, linux: 38,   windows: 18, mac: 6 },
  { year: 2010, linux: 35,   windows: 20, mac: 7 },
  { year: 2011, linux: 112,  windows: 24, mac: 8 },
  { year: 2012, linux: 58,   windows: 19, mac: 6 },
  { year: 2013, linux: 40,   windows: 16, mac: 5 },
  { year: 2014, linux: 12,   windows: 12, mac: 4 },
  { year: 2015, linux: 14,   windows: 14, mac: 5 },
  { year: 2016, linux: 15,   windows: 15, mac: 5 },
  { year: 2017, linux: 18,   windows: 16, mac: 6 },
  { year: 2018, linux: 22,   windows: 18, mac: 7 },
  { year: 2019, linux: 34,   windows: 24, mac: 8 },
  { year: 2020, linux: 45,   windows: 32, mac: 10 },
  { year: 2021, linux: 1120, windows: 44, mac: 14 },
  { year: 2022, linux: 48,   windows: 39, mac: 12 },
  { year: 2023, linux: 315,  windows: 46, mac: 15 },
  { year: 2024, linux: 54,   windows: 38, mac: 14 },
];

export const MOST_RECENT_DETECTIONS: RecentDetectionRecord[] = [
  {
    id: "DET-2026-01",
    severity: "Critical",
    tactic: "Impact",
    mitreId: "T1486",
    techniqueName: "Data Encrypted for Impact / Runtime Tampering",
    timestamp: "Mar. 20, 2024 15:57:20",
    hostId: "Rely-Ra...",
    fullHostName: "rely-raptor-prod-eu-01.internal",
    processOrPath: "/opt/app/SqlInjectionLesson5a.java -> Statement.executeQuery",
    linkedSastFindingId: "F-001",
    status: "Active",
  },
  {
    id: "DET-2026-02",
    severity: "Critical",
    tactic: "Impact",
    mitreId: "T1059.006",
    techniqueName: "Command and Scripting Interpreter: Python exec()",
    timestamp: "Mar. 20, 2024 15:55:19",
    hostId: "Rely-Ra...",
    fullHostName: "rely-raptor-prod-eu-02.internal",
    processOrPath: "src/scripting/rule_runner.py -> exec(compile(user_code))",
    linkedSastFindingId: "F-002",
    status: "Active",
  },
  {
    id: "DET-2026-03",
    severity: "High",
    tactic: "Initial Access",
    mitreId: "T1190",
    techniqueName: "Exploit Public-Facing Application (SSRF Metadata Probe)",
    timestamp: "Mar. 20, 2024 15:42:08",
    hostId: "eks-node-09",
    fullHostName: "node-eks-i-0d7cb370c8eea26c9.eu-central-1.compute.internal",
    processOrPath: "src/services/webhookService.ts -> fetch(169.254.169.254)",
    linkedSastFindingId: "F-003",
    status: "Contained",
  },
  {
    id: "DET-2026-04",
    severity: "High",
    tactic: "Execution",
    mitreId: "T1059",
    techniqueName: "Dynamic JavaCompiler Task Creation (BlindScript.java)",
    timestamp: "Mar. 20, 2024 15:31:44",
    hostId: "jvm-app-04",
    fullHostName: "jvm-app-04.prod.xtrike.internal",
    processOrPath: "BlindScript.java -> javax.tools.JavaCompiler.getTask(...)",
    linkedSastFindingId: "F-006",
    status: "Contained",
  },
];

export const XTRIKE_FLEET_OVERVIEW = {
  hosts: {
    up: 708,
    down: 2,
    unreachable: 0,
    inDowntime: 0,
    total: 710,
    unhandledProblems: 1,
  },
  services: {
    ok: 15688,
    inDowntime: 2,
    onDownHost: 4,
    warning: 37,
    unknown: 0,
    critical: 77,
    total: 15808,
    unhandledProblems: 112,
  },
  events: {
    total: 1001,
    unhandledProblems: 4,
  },
};

export const XTRIKE_TOP_ALERTERS: XtrikeTopAlerter[] = [
  {
    problems: 484,
    host: "xtrike.app",
    service: "HTTPS xtrike.app",
    state: "CRIT",
    lastCheck: "12s ago",
    outputSummary: "HTTP CRITICAL - TLS certificate expiry & upstream WAF anomaly on port 443",
    correlatedCwe: "CWE-295",
  },
  {
    problems: 292,
    host: "node eks i-0d7cb370c8eea26c9.eu-central-1.compute.internal",
    service: "Memory",
    state: "WARN",
    lastCheck: "18s ago",
    outputSummary: "RAM usage at 91.4% (29.2 GB / 32.0 GB) — unthrottled query allocation in pod",
    correlatedCwe: "CWE-400",
  },
  {
    problems: 373,
    host: "play.xtrike.app",
    service: "HTTPS play.xtrike.app",
    state: "CRIT",
    lastCheck: "24s ago",
    outputSummary: "Response time > 2,400ms on /sast/validation-engine endpoint",
    correlatedCwe: "CWE-89",
  },
  {
    problems: 436,
    host: "ideas.xtrike.app",
    service: "HTTPS ideas.xtrike.app",
    state: "CRIT",
    lastCheck: "31s ago",
    outputSummary: "502 Bad Gateway burst detected during unauthenticated payload fuzzing",
    correlatedCwe: "CWE-502",
  },
  {
    problems: 9,
    host: "docs.xtrike.app",
    service: "HTTPS docs.xtrike.app",
    state: "WARN",
    lastCheck: "42s ago",
    outputSummary: "Content-Security-Policy header missing frame-ancestors directive",
    correlatedCwe: "CWE-1021",
  },
  {
    problems: 6,
    host: "forum.xtrike.app",
    service: "HTTPS forum.xtrike.app",
    state: "WARN",
    lastCheck: "55s ago",
    outputSummary: "Elevated rate-limit triggers on /session/sso callback",
    correlatedCwe: "CWE-307",
  },
  {
    problems: 2,
    host: "ideas.xtrike.app",
    service: "XTRIKE_Agent",
    state: "CRIT",
    lastCheck: "1m ago",
    outputSummary: "Agent systemd unit socket timeout (exit status 2)",
    correlatedCwe: "CWE-755",
  },
];

export const XTRIKE_HONEYCOMB_HOSTS: XtrikeHexHostCell[] = Array.from({ length: 72 }, (_, idx) => {
  const isDown = idx === 11 || idx === 46;
  const isWarn = idx % 9 === 3 || idx % 13 === 5;
  const state: "UP" | "DOWN" | "WARN" = isDown ? "DOWN" : isWarn ? "WARN" : "UP";
  const clusters = [
    "eu-central-1.eks",
    "us-east-1.prod",
    "xtrike-core",
    "sast-workers",
    "db-replica-set",
    "api-gateway",
  ];
  const cluster = clusters[idx % clusters.length];
  return {
    id: `HOST-${String(idx + 1).padStart(3, "0")}`,
    hostname:
      idx === 0
        ? "xtrike.app"
        : idx === 1
        ? "node-eks-i-0d7cb370c8eea26c9.eu-central-1.compute.internal"
        : idx === 2
        ? "play.xtrike.app"
        : idx === 3
        ? "ideas.xtrike.app"
        : `${cluster}-node-${String((idx % 24) + 1).padStart(2, "0")}.internal`,
    cluster,
    state,
    servicesOk: isDown ? 4 : isWarn ? 19 : 24,
    servicesWarn: isWarn ? 3 : 0,
    servicesCrit: isDown ? 6 : isWarn ? 1 : 0,
    cpuLoad: isDown ? "98.4%" : isWarn ? "78.2%" : `${18 + ((idx * 7) % 42)}%`,
    memoryUsed: isDown ? "96.1%" : isWarn ? "88.7%" : `${32 + ((idx * 5) % 45)}%`,
  };
});

export const XTRIKE_OMD_RUNTIME_SPEC = {
  version: "2.5.0p17",
  omdVersionOutput: "OMD - Open Monitoring Distribution Version 2.5.0p17.xtrike",
  daemons: [
    "mkeventd",
    "liveproxyd",
    "mknotifyd",
    "rrdcached",
    "cmc",
    "apache",
    "dcd",
    "redis",
    "Crontab",
  ],
};

export const XTRIKE_DISTRO_ACCORDION_GROUPS: XtrikeDistroAccordionGroup[] = [
  {
    id: "ubuntu",
    distroName: "Ubuntu",
    releases: [
      {
        releaseVersion: "Ubuntu 26.04",
        codename: "resolute",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17_0.resolute_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=ubuntu&release=resolute&edition=community -O xtrike-monitor-community-2.5.0p17_0.resolute_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-community-2.5.0p17_0.resolute_amd64.deb",
        sha256: "e20ad3518f4a442af83a642ba15a354f923233bae31f6bdd78828a80b9cec833",
      },
      {
        releaseVersion: "Ubuntu 24.04",
        codename: "noble",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17_0.noble_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=ubuntu&release=noble&edition=community -O xtrike-monitor-community-2.5.0p17_0.noble_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-community-2.5.0p17_0.noble_amd64.deb",
        sha256: "d3799444e1685971d63333e9a3dde865e0c9a36ca8a2c15f2a2617b180b3ff57",
      },
      {
        releaseVersion: "Ubuntu 22.04",
        codename: "jammy",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17_0.jammy_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=ubuntu&release=jammy&edition=community -O xtrike-monitor-community-2.5.0p17_0.jammy_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-community-2.5.0p17_0.jammy_amd64.deb",
        sha256: "39b432d4884872c2b5b802058348d4bb019363c98e3af3fbf60eaba1acc3cf4c",
      },
      {
        releaseVersion: "Ubuntu 26.04 (Ultimate)",
        codename: "resolute-ultimate",
        edition: "ultimate",
        filename: "xtrike-monitor-ultimate-2.5.0p17_0.resolute_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=ubuntu&release=resolute&edition=ultimate -O xtrike-monitor-ultimate-2.5.0p17_0.resolute_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-ultimate-2.5.0p17_0.resolute_amd64.deb",
        sha256: "26e50d4d55a4a11c06688dca78e3a8e29610fdd4f0da6a72596309cbad126adb",
      },
    ],
  },
  {
    id: "debian",
    distroName: "Debian",
    releases: [
      {
        releaseVersion: "Debian 13.0",
        codename: "trixie",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17_0.trixie_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=debian&release=trixie&edition=community -O xtrike-monitor-community-2.5.0p17_0.trixie_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-community-2.5.0p17_0.trixie_amd64.deb",
        sha256: "eddd6d50039dd4ed417ab8b3c69a627f4545008e5abfb05d5c8ad1ad4de54fcf",
      },
      {
        releaseVersion: "Debian 12.0",
        codename: "bookworm",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17_0.bookworm_amd64.deb",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=debian&release=bookworm&edition=community -O xtrike-monitor-community-2.5.0p17_0.bookworm_amd64.deb",
        aptInstallCommand: "sudo apt install ./xtrike-monitor-community-2.5.0p17_0.bookworm_amd64.deb",
        sha256: "19e4f827d2833e5e582907386919aaff04a5db4394736da71e77f34a1460ca91",
      },
    ],
  },
  {
    id: "sles",
    distroName: "SLES",
    releases: [
      {
        releaseVersion: "SLES 16.0",
        codename: "sles16.0",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17-sles16.0-38.x86_64.rpm",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=sles&release=sles16.0&edition=community -O xtrike-monitor-community-2.5.0p17-sles16.0-38.x86_64.rpm",
        aptInstallCommand: "sudo zypper install ./xtrike-monitor-community-2.5.0p17-sles16.0-38.x86_64.rpm",
        sha256: "fbb97df875006854621e979c6d1dd145d8f961bbd183e0183e01a6b9f98cb4bd",
      },
      {
        releaseVersion: "SLES 15 SP7",
        codename: "sles15sp7",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17-sles15sp7-38.x86_64.rpm",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=sles&release=sles15sp7&edition=community -O xtrike-monitor-community-2.5.0p17-sles15sp7-38.x86_64.rpm",
        aptInstallCommand: "sudo zypper install ./xtrike-monitor-community-2.5.0p17-sles15sp7-38.x86_64.rpm",
        sha256: "af4686865700b9163f043742f45ca774a39fd3be0bfb2c605022d7acee2b8d53",
      },
    ],
  },
  {
    id: "redhat",
    distroName: "Red Hat / Enterprise Linux",
    releases: [
      {
        releaseVersion: "RHEL 10.x",
        codename: "el10",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17-el10-38.x86_64.rpm",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=redhat&release=el10&edition=community -O xtrike-monitor-community-2.5.0p17-el10-38.x86_64.rpm",
        aptInstallCommand: "sudo dnf install ./xtrike-monitor-community-2.5.0p17-el10-38.x86_64.rpm",
        sha256: "448c49538f0f71c531cd85f578ad86d61987af1406afa761390360315e27bc38",
      },
      {
        releaseVersion: "RHEL 9.x",
        codename: "el9",
        edition: "community",
        filename: "xtrike-monitor-community-2.5.0p17-el9-38.x86_64.rpm",
        wgetCommand: "wget https://05-sast-platform.vercel.app/api/xtrike-package?distro=redhat&release=el9&edition=community -O xtrike-monitor-community-2.5.0p17-el9-38.x86_64.rpm",
        aptInstallCommand: "sudo dnf install ./xtrike-monitor-community-2.5.0p17-el9-38.x86_64.rpm",
        sha256: "cc9705e0b1c6676abece66e1af2010d188e6b195ae57b3ce1e05cd987ee0ef69",
      },
    ],
  },
];

export function buildCyberMonitoringNoctisSummary(): string {
  const envSummary = OPEN_DEPLOYMENT_INSTANCES.map(
    (e) =>
      `- **${e.environment}:** ${e.total} open vulnerabilities (Critical: ${e.critical}, High: ${e.high}, Medium: ${e.medium}, Low: ${e.low}) · Linked CWEs: \`${e.linkedCwes.join(", ")}\``
  ).join("\n");

  const alerterSummary = XTRIKE_TOP_ALERTERS.map(
    (a) =>
      `- **\`${a.host}\` (${a.service}):** **${a.problems} problems** [${a.state}] — ${a.outputSummary} (Correlated: \`${a.correlatedCwe}\`)`
  ).join("\n");

  return [
    `### Noctis Cyber KPI & XTRIKE Live Fleet Monitoring Intelligence`,
    `#### 1. Cyber Vulnerability & Deployment KPI Dashboard`,
    `- **Open Vulnerability Count:** **${CYBER_VULN_KPI_SUMMARY.openVulnerabilityDisplay}** (${CYBER_VULN_KPI_SUMMARY.openVulnerabilityCount.toLocaleString()})`,
    `- **Open CVE Count:** **${CYBER_VULN_KPI_SUMMARY.openCveDisplay}** (${CYBER_VULN_KPI_SUMMARY.openCveCount.toLocaleString()})`,
    `- **Open Remediation Count:** **${CYBER_VULN_KPI_SUMMARY.openRemediationDisplay}** (${CYBER_VULN_KPI_SUMMARY.openRemediationCount.toLocaleString()})`,
    `- **Open Risk Instances Breakdown:** Critical **1.4K**, High **6.0K**, Medium **7.1K**, Low **1.3K**, Info **265**`,
    `\n#### 2. Open Deployment Instances by Environment\n${envSummary}`,
    `\n#### 3. Antivirus / EDR & Threat Hunting Performance KPIs`,
    `- **Detections:** **213** · **Attacks Prevented (Last Day):** **32** · **Leads on Hunting:** **26** · **Hunting Leads Stock:** **26** · **Remedied Detections (Last 30d):** **73** · **Current Security Score:** **53/100**`,
    `- **Monitored Fleet by OS (1,765 Total Hosts):** Windows (890), Linux x86 (340), Lumos X64 (215), MacOS (160), Chrome OS (85), iOS (45), Android (30)`,
    `\n#### 4. XTRIKE Host & Service Live Telemetry (v2.5.0p17)`,
    `- **Host Statistics:** **710 Total Hosts** (708 Up, 2 Down, 1 Unhandled Host Problem)`,
    `- **Service Statistics:** **15,808 Total Services** (15,688 OK, 77 Critical, 37 Warning, 4 On Down Host, 2 In Downtime, 112 Unhandled Service Problems)`,
    `- **Events (Syslog, SNMP Traps & Log Files):** **1,001 Total Events** (4 Unhandled)`,
    `\n#### 5. XTRIKE Monitoring Package Installation & OMD Site Provisioning`,
    `- **3.1 Download (Ubuntu 26.04 Resolute):** \`wget ... -O xtrike-monitor-community-2.5.0p17_0.resolute_amd64.deb\` (SHA-256: \`e20ad3518f4a442af83a642ba15a354f923233bae31f6bdd78828a80b9cec833\`)`,
    `- **3.2 GnuPG Verification:** Verify package signature before installation`,
    `- **3.3 Install & Verify Version:** \`sudo apt install ./xtrike-monitor-community-2.5.0p17_0.resolute_amd64.deb\` → \`omd version\` (\`${XTRIKE_OMD_RUNTIME_SPEC.omdVersionOutput}\`)`,
    `- **3.4 Create & Start Site:** \`sudo omd create monitoring\` → \`sudo omd start monitoring\` (starts \`mkeventd\`, \`liveproxyd\`, \`mknotifyd\`, \`rrdcached\`, \`cmc\`, \`apache\`, \`dcd\`, \`redis\`, \`Crontab\`)`,
    `\n#### 6. Top Alerters (Last 7 Days)\n${alerterSummary}`,
  ].join("\n");
}
