import type { K8sFinding, ClusterSummary, NamespaceSummary } from "@/types/k8s";

export const CLUSTER_SUMMARY: ClusterSummary = {
  clusterName: "prod-us-east-1", k8sVersion: "v1.28.4",
  nodeCount: 12, namespaceCount: 8, podCount: 247,
  criticalFindings: 4, highFindings: 7, totalFindings: 23,
  cisScore: 61, rbacRisks: 5, networkGaps: 3,
};

export const NAMESPACE_SUMMARIES: NamespaceSummary[] = [
  { name: "production",  criticalCount: 3, highCount: 4, totalCount: 12, status: "At Risk" },
  { name: "staging",     criticalCount: 1, highCount: 2, totalCount:  6, status: "At Risk" },
  { name: "ml-training", criticalCount: 0, highCount: 1, totalCount:  3, status: "Warning" },
  { name: "monitoring",  criticalCount: 0, highCount: 0, totalCount:  2, status: "Healthy" },
];

export const FINDINGS: K8sFinding[] = [
  {
    id: "K8S-001", title: "Container running as root (UID 0)",
    severity: "Critical", category: "Misconfiguration", status: "Open",
    resource: { kind: "Deployment", name: "customer-api", namespace: "production", apiVersion: "apps/v1" },
    description: "The customer-api Deployment does not set runAsNonRoot: true or a specific runAsUser in securityContext. All containers run as root by default, which means any process escape grants full host access.",
    impact: "Container escape vulnerability exploited with root access can pivot to the host node, access other pods' data, and potentially control the entire cluster through kubelet API.",
    remediation: "Set securityContext.runAsNonRoot: true and runAsUser: 1001 in both the pod spec and container spec. Rebuild the container image with a non-root USER directive.",
    yamlSnippet: `spec:
  containers:
  - name: customer-api
    image: acme/customer-api:latest
    # No securityContext defined
    # Runs as root by default`,
    yamlFix: `spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
  - name: customer-api
    image: acme/customer-api:latest
    securityContext:
      runAsNonRoot: true
      runAsUser: 1001
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true`,
    cisRef: "CIS K8s 5.2.6", detectedAt: "2026-08-20", owner: "Platform Team",
  },
  {
    id: "K8S-002", title: "Privileged container detected",
    severity: "Critical", category: "Misconfiguration", status: "Open",
    resource: { kind: "DaemonSet", name: "log-collector", namespace: "production", apiVersion: "apps/v1" },
    description: "The log-collector DaemonSet runs with privileged: true, which effectively disables all kernel security mechanisms including seccomp, AppArmor, SELinux, and capability restrictions.",
    impact: "A compromised privileged container has full access to the host kernel. Attacker can load kernel modules, modify kernel parameters via /proc/sys, read any host file, and escape to the node trivially.",
    remediation: "Remove privileged: true. Use specific volume mounts and capabilities. For log collection, mount only /var/log with hostPath and drop all capabilities.",
    yamlSnippet: `containers:
- name: log-collector
  securityContext:
    privileged: true  # DANGEROUS`,
    yamlFix: `containers:
- name: log-collector
  securityContext:
    privileged: false
    capabilities:
      drop: ["ALL"]
  volumeMounts:
  - name: varlog
    mountPath: /var/log
    readOnly: true`,
    cisRef: "CIS K8s 5.2.1", detectedAt: "2026-08-20", owner: "SRE Team",
  },
  {
    id: "K8S-003", title: "Wildcard RBAC ClusterRole grants excessive permissions",
    severity: "Critical", category: "RBAC", status: "Open",
    resource: { kind: "ClusterRole", name: "app-admin", namespace: "cluster-wide", apiVersion: "rbac.authorization.k8s.io/v1" },
    description: "The app-admin ClusterRole uses wildcard (*) verbs on wildcard (*) resources in the core API group, effectively granting god-mode cluster access to any ServiceAccount or user bound to this role.",
    impact: "Any service account with this role can create/delete any resource, read all secrets across all namespaces, modify RBAC, and deploy backdoors. Equivalent to cluster-admin.",
    remediation: "Enumerate the exact resources and verbs the app actually needs. Follow principle of least privilege — create a scoped Role (not ClusterRole) in the specific namespace with only required permissions.",
    yamlSnippet: `rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]  # God mode — DO NOT USE`,
    yamlFix: `rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list"]`,
    cisRef: "CIS K8s 5.1.3", detectedAt: "2026-08-19", owner: "Security Team",
  },
  {
    id: "K8S-004", title: "No NetworkPolicy — all pod-to-pod traffic allowed",
    severity: "Critical", category: "Network", status: "Open",
    resource: { kind: "Namespace", name: "production", namespace: "production", apiVersion: "v1" },
    description: "The production namespace has no NetworkPolicy objects. Kubernetes default is to allow all ingress and egress between all pods. A compromised pod can freely communicate with any other pod in the cluster.",
    impact: "Lateral movement: a compromised frontend pod can directly reach database pods, internal APIs, and metadata service (169.254.169.254). Dramatically increases blast radius of any single pod compromise.",
    remediation: "Apply a default-deny policy for the namespace, then add specific allow policies for known communication paths. Use labels to identify allowed traffic sources.",
    yamlSnippet: `# No NetworkPolicy exists for namespace 'production'
# All ingress/egress traffic is permitted by default`,
    yamlFix: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-db
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: postgres
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: customer-api
    ports:
    - port: 5432`,
    cisRef: "CIS K8s 5.3.2", detectedAt: "2026-08-20", owner: "Network Team",
  },
  {
    id: "K8S-005", title: "Kubernetes secret stored as plaintext in Pod env vars",
    severity: "High", category: "Secret", status: "Open",
    resource: { kind: "Deployment", name: "payment-service", namespace: "production", apiVersion: "apps/v1" },
    description: "The payment-service Deployment hardcodes a database password as a plaintext env var value in the manifest. This secret is stored unencrypted in etcd and visible to anyone with read access to the Deployment.",
    impact: "Any user with kubectl get deployment or read access to the namespace can extract the database password. Secrets visible in etcd backups and audit logs.",
    remediation: "Use Kubernetes Secrets with secretKeyRef, enable etcd encryption at rest, and ideally use an external secrets manager (Vault, AWS Secrets Manager) with the External Secrets Operator.",
    yamlSnippet: `env:
- name: DB_PASSWORD
  value: "MySuperSecret123!"  # PLAINTEXT IN MANIFEST`,
    yamlFix: `env:
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: payment-db-secret
      key: password
# Create secret: kubectl create secret generic payment-db-secret \\
#   --from-literal=password=\${DB_PASSWORD}`,
    cisRef: "CIS K8s 5.4.1", detectedAt: "2026-08-20", owner: "Payments Team",
  },
  {
    id: "K8S-006", title: "No resource limits — CPU/Memory unrestricted",
    severity: "High", category: "Workload", status: "Open",
    resource: { kind: "Deployment", name: "ml-inference", namespace: "ml-training", apiVersion: "apps/v1" },
    description: "The ml-inference Deployment has no resource requests or limits. A misbehaving or compromised container can consume all node resources, causing OOMKill for other pods (noisy neighbor / denial of service).",
    impact: "Resource exhaustion can DoS critical workloads. Without limits, Kubernetes cannot make good scheduling decisions. CPU throttling doesn't apply, allowing CPU starvation of other pods.",
    remediation: "Set resource requests (for scheduling) and limits (for enforcement). Use LimitRange in the namespace to enforce defaults.",
    yamlSnippet: `containers:
- name: ml-inference
  image: acme/ml-pipeline:v1.0.0
  # No resources defined`,
    yamlFix: `containers:
- name: ml-inference
  image: acme/ml-pipeline:v1.0.0
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"
    limits:
      cpu: "2"
      memory: "4Gi"`,
    cisRef: "CIS K8s 5.2.4", detectedAt: "2026-08-19", owner: "ML Team",
  },
  {
    id: "K8S-007", title: "ServiceAccount with automounted token in internet-facing pod",
    severity: "High", category: "RBAC", status: "Open",
    resource: { kind: "Deployment", name: "public-api", namespace: "production", apiVersion: "apps/v1" },
    description: "The public-api pod automounts its ServiceAccount token (default Kubernetes behavior). An SSRF vulnerability in the app could let attackers read /var/run/secrets/kubernetes.io/serviceaccount/token and query the Kubernetes API.",
    impact: "Kubernetes API token exfiltration via SSRF. Attacker can enumerate cluster resources, read secrets in the namespace, and potentially escalate privileges if the ServiceAccount has permissions.",
    remediation: "Set automountServiceAccountToken: false at the ServiceAccount and Pod spec level. Only enable for pods that explicitly need to call the Kubernetes API.",
    yamlSnippet: `spec:
  # automountServiceAccountToken defaults to true
  containers:
  - name: public-api
    # Token mounted at /var/run/secrets/kubernetes.io/`,
    yamlFix: `spec:
  automountServiceAccountToken: false
  serviceAccountName: public-api-sa
  containers:
  - name: public-api
    # Token no longer mounted`,
    cisRef: "CIS K8s 5.1.6", detectedAt: "2026-08-20", owner: "Backend Team",
  },
  {
    id: "K8S-008", title: "hostPath volume mount to sensitive host directory",
    severity: "High", category: "Misconfiguration", status: "Open",
    resource: { kind: "DaemonSet", name: "node-monitor", namespace: "monitoring", apiVersion: "apps/v1" },
    description: "The node-monitor DaemonSet mounts /etc/kubernetes/pki from the host — a directory containing cluster CA certificates and private keys. Even read-only access to PKI materials is extremely sensitive.",
    impact: "Access to /etc/kubernetes/pki allows an attacker to sign arbitrary certificates and impersonate any cluster identity, including cluster-admin. Complete cluster compromise.",
    remediation: "Use ConfigMap for non-sensitive config. For metrics collection, use the Kubernetes API instead of direct host filesystem access. Avoid hostPath entirely unless absolutely necessary.",
    yamlSnippet: `volumes:
- name: pki
  hostPath:
    path: /etc/kubernetes/pki  # CRITICAL: PKI EXPOSURE`,
    yamlFix: `# Use Kubernetes API for metrics instead:
# Remove the hostPath volume mount entirely
# Use metrics-server or Prometheus scraping via API`,
    cisRef: "CIS K8s 5.2.3", detectedAt: "2026-08-18", owner: "SRE Team",
  },
];
