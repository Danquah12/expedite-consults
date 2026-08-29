export type CloudProvider = "AWS" | "Azure" | "GCP" | "Kubernetes" | "OCI" | "Alibaba" | "Hybrid";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string;
  regionCount: number;
  totalAssets: number;
  criticalIssues: number;
  complianceScore: number;
  status: "CONNECTED" | "SYNCING" | "ERROR";
  lastScan: string;
}

export interface AttackPathNode {
  id: string;
  label: string;
  type: "INTERNET_EXPOSURE" | "COMPROMISED_IDENTITY" | "IAM_ROLE" | "PRIVILEGE_ESCALATION" | "CLOUD_SERVICE" | "CROWN_JEWEL";
  provider: CloudProvider;
  service: string;
  severity: Severity;
  details: string;
  riskScore: number;
}

export interface AttackPathEdge {
  from: string;
  to: string;
  label: string;
  technique: string;
  verified: boolean;
}

export interface AttackPathChain {
  id: string;
  name: string;
  provider: CloudProvider;
  severity: Severity;
  depth: number;
  chokePoint: string;
  entryPoint: string;
  targetAsset: string;
  estimatedBlastRadius: string;
  exploitFeasibility: "TRIVIAL" | "MODERATE" | "COMPLEX";
  nodes: AttackPathNode[];
  edges: AttackPathEdge[];
  remediationSnippet: string;
}

export interface CSPMFinding {
  id: string;
  title: string;
  provider: CloudProvider;
  service: string;
  resourceId: string;
  severity: Severity;
  benchmark: string;
  complianceImpact: string[];
  description: string;
  status: "OPEN" | "SUPPRESSED" | "REMEDIATED";
  remediationCommand: string;
}

export interface IAMPrivEscRoute {
  id: string;
  identityName: string;
  identityType: "User" | "Role" | "ServiceAccount" | "ManagedIdentity";
  provider: CloudProvider;
  startingPermissions: string[];
  escalationVector: string;
  targetPrivilege: string;
  riskLevel: "CRITICAL" | "HIGH";
  remediationPolicy: string;
}

export interface KubernetesWorkload {
  id: string;
  cluster: string;
  namespace: string;
  workloadName: string;
  kind: "Deployment" | "DaemonSet" | "StatefulSet" | "Pod";
  provider: "EKS" | "AKS" | "GKE" | "K8s";
  isPrivileged: boolean;
  hasHostPath: boolean;
  cloudIAMRole: string;
  vulnerabilityCount: number;
  status: "SECURE" | "RISKY" | "CRITICAL";
}
