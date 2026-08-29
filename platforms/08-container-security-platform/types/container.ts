// ─── Container Security Platform — Core Types ────────────────────────────────

export type ContainerSeverity  = "Critical" | "High" | "Medium" | "Low" | "Negligible";
export type FindingCategory    = "Vulnerability" | "Misconfiguration" | "Secret" | "Malware" | "License";
export type FixStatus          = "Fixed" | "Will Not Fix" | "Affected" | "Unknown";
export type ImageStatus        = "Clean" | "Vulnerable" | "Critical";

export interface LayerInfo {
  digest:    string;       // sha256:abc123...
  command:   string;       // RUN apt-get install...
  size:      number;       // bytes
  createdAt: string;
  vulnCount: number;
}

export interface ContainerCVE {
  id:           string;    // CVE-2023-XXXX or GHSA-xxx
  severity:     ContainerSeverity;
  cvss:         number;
  packageName:  string;
  installedVer: string;
  fixedVer:     string | null;
  layer:        string;    // which image layer
  description:  string;
  publishedAt:  string;
  fixStatus:    FixStatus;
}

export interface MisconfigFinding {
  id:          string;
  rule:        string;     // e.g. "CIS Docker 4.1"
  title:       string;
  severity:    ContainerSeverity;
  description: string;
  remediation: string;
  reference:   string;
}

export interface ContainerImage {
  id:            string;   // "IMG-001"
  name:          string;   // "acme/customer-api"
  tag:           string;   // "latest", "v2.3.1"
  digest:        string;   // sha256:...
  baseImage:     string;   // "ubuntu:20.04"
  os:            string;
  arch:          string;
  sizeBytes:     number;
  layerCount:    number;
  pushedAt:      string;
  registry:      string;
  status:        ImageStatus;

  // Vulnerability summary
  criticalCount: number;
  highCount:     number;
  mediumCount:   number;
  lowCount:      number;
  totalVulns:    number;

  // Detailed findings
  cves:          ContainerCVE[];
  misconfigs:    MisconfigFinding[];
  layers:        LayerInfo[];

  // Risk context
  isRunning:     boolean;   // currently deployed?
  replicaCount:  number;
  namespace:     string;    // kubernetes namespace
  internetFacing: boolean;
  hasRootUser:   boolean;
  hasPrivileged: boolean;
  noReadOnly:    boolean;

  // Remediation
  baseImageFix:  string | null;  // better base image to use
  remediationSteps: string[];
  complianceRefs: { framework: string; ref: string; description: string }[];

  // Meta
  scannedAt:     string;
  scanner:       string;   // "ContainerShield + LayerDissector + Syft"
  owner:         string;
  slaDeadline:   string;
}

export interface RegistrySummary {
  totalImages:    number;
  cleanImages:    number;
  vulnerableImages: number;
  criticalImages: number;
  totalVulns:     number;
  totalMisconfigs: number;
}
