// ─── Kubernetes Security Platform — Core Types ───────────────────────────────

export type K8sSeverity    = "Critical" | "High" | "Medium" | "Low" | "Info";
export type ResourceKind   = "Deployment" | "Pod" | "StatefulSet" | "DaemonSet" | "Namespace" | "ClusterRole" | "ServiceAccount" | "NetworkPolicy" | "PodSecurityPolicy" | "Ingress";
export type FindingCategory = "Misconfiguration" | "RBAC" | "Network" | "Workload" | "Secret" | "Supply Chain";
export type ClusterStatus  = "At Risk" | "Warning" | "Healthy";

export interface K8sResource {
  kind:       ResourceKind;
  name:       string;
  namespace:  string;
  apiVersion: string;
}

export interface K8sFinding {
  id:          string;       // "K8S-001"
  title:       string;
  severity:    K8sSeverity;
  category:    FindingCategory;
  status:      "Open" | "Suppressed" | "Resolved";
  resource:    K8sResource;
  description: string;
  impact:      string;
  remediation: string;
  yamlSnippet: string;       // the bad config
  yamlFix:     string;       // the fixed config
  cisRef:      string;       // e.g. "CIS K8s 5.2.1"
  detectedAt:  string;
  owner:       string;
}

export interface NamespaceSummary {
  name:       string;
  criticalCount: number;
  highCount:  number;
  totalCount: number;
  status:     ClusterStatus;
}

export interface ClusterSummary {
  clusterName:     string;
  k8sVersion:      string;
  nodeCount:       number;
  namespaceCount:  number;
  podCount:        number;
  criticalFindings: number;
  highFindings:    number;
  totalFindings:   number;
  cisScore:        number;   // percentage compliant
  rbacRisks:       number;
  networkGaps:     number;
}
