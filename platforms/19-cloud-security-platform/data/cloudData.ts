import { CloudAccount, AttackPathChain, CSPMFinding, IAMPrivEscRoute, KubernetesWorkload } from "@/types/cloud";

export const CLOUD_ACCOUNTS: CloudAccount[] = [
  {
    id: "acc-aws-01",
    name: "AWS-Production-Core",
    provider: "AWS",
    accountId: "4819-2041-8891",
    regionCount: 4,
    totalAssets: 4820,
    criticalIssues: 3,
    complianceScore: 88.4,
    status: "CONNECTED",
    lastScan: "2 mins ago (Agentless)"
  },
  {
    id: "acc-azure-01",
    name: "Azure-Enterprise-Hub",
    provider: "Azure",
    accountId: "sub-98a4-01fc-production",
    regionCount: 3,
    totalAssets: 3150,
    criticalIssues: 2,
    complianceScore: 91.2,
    status: "CONNECTED",
    lastScan: "Just now (Microsoft Graph API)"
  },
  {
    id: "acc-gcp-01",
    name: "GCP-DataLake-Analytics",
    provider: "GCP",
    accountId: "gcp-prod-datalake-782",
    regionCount: 2,
    totalAssets: 1940,
    criticalIssues: 1,
    complianceScore: 94.0,
    status: "CONNECTED",
    lastScan: "5 mins ago (Asset Inventory)"
  },
  {
    id: "acc-k8s-01",
    name: "EKS-Global-Microservices",
    provider: "Kubernetes",
    accountId: "eks-cluster-us-east-1",
    regionCount: 1,
    totalAssets: 850,
    criticalIssues: 4,
    complianceScore: 84.6,
    status: "CONNECTED",
    lastScan: "Real-time Telemetry (eBPF)"
  }
];

export const ATTACK_PATH_CHAINS: AttackPathChain[] = [
  {
    id: "path-01",
    name: "Internet ALB -> SSRF -> EC2 Instance Profile -> iam:PassRole -> Production RDS DB Takeover",
    provider: "AWS",
    severity: "CRITICAL",
    depth: 5,
    chokePoint: "Remove iam:PassRole on app-workload-role & Enforce IMDSv2 (Hop Limit 1)",
    entryPoint: "Public ALB (app.expediteconsults.com:443)",
    targetAsset: "aurora-prod-customer-db.c12x.rds.amazonaws.com (Encrypted PII)",
    estimatedBlastRadius: "$4.2M Data Exfiltration & Complete Database Wipe",
    exploitFeasibility: "TRIVIAL",
    nodes: [
      { id: "n1", label: "Public ALB / Ingress", type: "INTERNET_EXPOSURE", provider: "AWS", service: "Elastic Load Balancing", severity: "HIGH", details: "Publicly accessible endpoint (0.0.0.0/0)", riskScore: 75 },
      { id: "n2", label: "EC2 App Node (IMDSv1 Open)", type: "COMPROMISED_IDENTITY", provider: "AWS", service: "EC2 Metadata Service", severity: "HIGH", details: "IMDSv1 enabled allowing unauthenticated SSRF token theft", riskScore: 88 },
      { id: "n3", label: "Instance Profile: AppRole", type: "IAM_ROLE", provider: "AWS", service: "IAM", severity: "MEDIUM", details: "Attached role possesses iam:PassRole over AdminLambda", riskScore: 80 },
      { id: "n4", label: "PrivEsc: iam:PassRole -> Lambda", type: "PRIVILEGE_ESCALATION", provider: "AWS", service: "AWS Lambda", severity: "CRITICAL", details: "Attacker passes AdministratorAccess role to Lambda function", riskScore: 98 },
      { id: "n5", label: "Production Aurora RDS DB", type: "CROWN_JEWEL", provider: "AWS", service: "Amazon RDS", severity: "CRITICAL", details: "Holds 4.2M encrypted customer credit cards & HIPAA records", riskScore: 100 }
    ],
    edges: [
      { from: "n1", to: "n2", label: "Routes HTTP Traffic", technique: "T1190 Exploit Public App", verified: true },
      { from: "n2", to: "n3", label: "Steals STS Token via IMDSv1", technique: "T1552.005 Cloud Instance Metadata", verified: true },
      { from: "n3", to: "n4", label: "Invokes with iam:PassRole", technique: "T1078.004 Cloud Accounts", verified: true },
      { from: "n4", to: "n5", label: "Dumps Database Snapshot", technique: "T1530 Data from Cloud Storage", verified: true }
    ],
    remediationSnippet: `# Terraform Automated Choke-point Fix
resource "aws_instance" "app_server" {
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Enforces IMDSv2
    http_put_response_hop_limit = 1
  }
}

# Restrict iam:PassRole to specific non-admin ARNs`
  },
  {
    id: "path-02",
    name: "Public Azure App Service -> Managed Identity -> Key Vault Contributor -> Global Subscription Admin",
    provider: "Azure",
    severity: "CRITICAL",
    depth: 4,
    chokePoint: "Remove Contributor role on Key Vault & Enforce Azure RBAC data plane permissions",
    entryPoint: "Public Azure App Service Web App",
    targetAsset: "Enterprise Key Vault (Master Encryption Keys & Service Principals)",
    estimatedBlastRadius: "Complete Azure Tenant Takeover & CMEK Revocation",
    exploitFeasibility: "TRIVIAL",
    nodes: [
      { id: "az1", label: "Exposed Web App Service", type: "INTERNET_EXPOSURE", provider: "Azure", service: "App Service", severity: "HIGH", details: "Public endpoint with debug console enabled", riskScore: 78 },
      { id: "az2", label: "System-Assigned Identity", type: "COMPROMISED_IDENTITY", provider: "Azure", service: "Entra ID", severity: "HIGH", details: "Acquires MSI token from 127.0.0.1:41741", riskScore: 85 },
      { id: "az3", label: "PrivEsc: Key Vault Contributor", type: "PRIVILEGE_ESCALATION", provider: "Azure", service: "Azure RBAC", severity: "CRITICAL", details: "Can extract Global Admin client secrets from Key Vault", riskScore: 96 },
      { id: "az4", label: "Global Subscription Admin", type: "CROWN_JEWEL", provider: "Azure", service: "Management Group", severity: "CRITICAL", details: "Full write access across all 18 production subscriptions", riskScore: 100 }
    ],
    edges: [
      { from: "az1", to: "az2", label: "Extracts MSI Token", technique: "T1552 Unsecured Credentials", verified: true },
      { from: "az2", to: "az3", label: "Reads Vault Secrets", technique: "T1528 Steal Application Access Token", verified: true },
      { from: "az3", to: "az4", label: "Assumes Global Admin", technique: "T1098 Account Manipulation", verified: true }
    ],
    remediationSnippet: `# Azure CLI Remediation
az role assignment delete \
  --assignee <MSI_PRINCIPAL_ID> \
  --role "Contributor" \
  --scope "/subscriptions/<SUB_ID>/resourceGroups/prod/providers/Microsoft.KeyVault/vaults/core-vault"`
  },
  {
    id: "path-03",
    name: "GKE Privileged Pod -> HostPath /var/run/docker.sock -> Node Service Account -> GCS Exfiltration",
    provider: "Kubernetes",
    severity: "CRITICAL",
    depth: 4,
    chokePoint: "Enforce Pod Security Admission (restricted) & Remove editor role from GKE compute service account",
    entryPoint: "Developer Microservice Deployment in 'default' namespace",
    targetAsset: "gs://corporate-financial-backups-bucket (Sensitive Parquet Datalake)",
    estimatedBlastRadius: "18.4 TB Customer Financial Ledger Exfiltration",
    exploitFeasibility: "MODERATE",
    nodes: [
      { id: "k1", label: "Privileged Pod in Default NS", type: "INTERNET_EXPOSURE", provider: "Kubernetes", service: "GKE Pod", severity: "HIGH", details: "securityContext.privileged: true", riskScore: 82 },
      { id: "k2", label: "Node HostPath Escape", type: "PRIVILEGE_ESCALATION", provider: "Kubernetes", service: "K8s Kubelet", severity: "CRITICAL", details: "Mounts /var/log & steals node bootstrap token", riskScore: 94 },
      { id: "k3", label: "Default Compute SA (Editor)", type: "IAM_ROLE", provider: "GCP", service: "Cloud IAM", severity: "HIGH", details: "Node SA has roles/editor over whole GCP project", riskScore: 92 },
      { id: "k4", label: "Production GCS DataLake", type: "CROWN_JEWEL", provider: "GCP", service: "Cloud Storage", severity: "CRITICAL", details: "18.4 TB unencrypted financial records", riskScore: 100 }
    ],
    edges: [
      { from: "k1", to: "k2", label: "Escapes Container Namespace", technique: "T1611 Escape to Host", verified: true },
      { from: "k2", to: "k3", label: "Extracts GCP SA Token", technique: "T1552 Credentials in Files", verified: true },
      { from: "k3", to: "k4", label: "Streams Bucket Data", technique: "T1530 Cloud Storage Exfil", verified: true }
    ],
    remediationSnippet: `# Kubernetes Pod Security Standards Fix
apiVersion: v1
kind: Namespace
metadata:
  name: default
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted`
  }
];

export const CSPM_FINDINGS: CSPMFinding[] = [
  {
    id: "CSPM-AWS-001",
    title: "S3 Bucket Allows Public Read/Write Access via Wildcard Principal",
    provider: "AWS",
    service: "Amazon S3",
    resourceId: "arn:aws:s3:::expedite-customer-uploads-prod",
    severity: "CRITICAL",
    benchmark: "CIS AWS Benchmark v3.0 (2.1.5)",
    complianceImpact: ["PCI-DSS 3.4", "NIST 800-53 AC-3", "HIPAA 164.312"],
    description: "Bucket policy permits Principal '*' with s3:GetObject and s3:PutObject permissions.",
    status: "OPEN",
    remediationCommand: "aws s3api put-public-access-block --bucket expedite-customer-uploads-prod --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  },
  {
    id: "CSPM-AZ-002",
    title: "Azure Key Vault Soft Delete & Purge Protection Disabled",
    provider: "Azure",
    service: "Key Vault",
    resourceId: "/subscriptions/.../vaults/prod-secrets-vault",
    severity: "HIGH",
    benchmark: "CIS Azure Benchmark v2.0 (8.4)",
    complianceImpact: ["SOC 2 Type II", "ISO 27001 A.12.1.2"],
    description: "Without purge protection, a compromised administrator can permanently destroy cryptographic keys.",
    status: "OPEN",
    remediationCommand: "az keyvault update --name prod-secrets-vault --enable-purge-protection true"
  },
  {
    id: "CSPM-GCP-003",
    title: "Compute Engine Instance Has Full Cloud API Access Scope",
    provider: "GCP",
    service: "Compute Engine",
    resourceId: "projects/gcp-prod/zones/us-central1-a/instances/analytics-worker-01",
    severity: "CRITICAL",
    benchmark: "CIS GCP Benchmark v3.0 (4.1)",
    complianceImpact: ["CIS GCP 4.1", "NIST AC-6 Least Privilege"],
    description: "Instance configured with 'https://www.googleapis.com/auth/cloud-platform' full scope.",
    status: "OPEN",
    remediationCommand: "gcloud compute instances set-service-account analytics-worker-01 --scopes=https://www.googleapis.com/auth/logging.write"
  }
];

export const IAM_PRIVESC_ROUTES: IAMPrivEscRoute[] = [
  {
    id: "IAM-ESC-01",
    identityName: "dev-junior-engineer",
    identityType: "User",
    provider: "AWS",
    startingPermissions: ["iam:CreateAccessKey", "iam:GetUser"],
    escalationVector: "Can generate new access keys for any existing IAM user including root/admin.",
    targetPrivilege: "AdministratorAccess (Full AWS Takeover)",
    riskLevel: "CRITICAL",
    remediationPolicy: "Explicitly deny iam:CreateAccessKey on users with elevated policies."
  },
  {
    id: "IAM-ESC-02",
    identityName: "cicd-deployer-sa",
    identityType: "ServiceAccount",
    provider: "GCP",
    startingPermissions: ["iam.serviceAccounts.actAs", "iam.serviceAccounts.getAccessToken"],
    escalationVector: "Can impersonate the Organization Owner service account to mint temporary OAuth2 tokens.",
    targetPrivilege: "roles/owner (Global GCP Organization Admin)",
    riskLevel: "CRITICAL",
    remediationPolicy: "Remove iam.serviceAccounts.actAs and enforce workload identity federation."
  }
];

export const KUBERNETES_WORKLOADS: KubernetesWorkload[] = [
  {
    id: "k8s-wl-01",
    cluster: "prod-eks-us-east-1",
    namespace: "payment-gateway",
    workloadName: "stripe-processor-pod",
    kind: "Deployment",
    provider: "EKS",
    isPrivileged: false,
    hasHostPath: false,
    cloudIAMRole: "arn:aws:iam::481920418891:role/StripeProcessorIRSA",
    vulnerabilityCount: 0,
    status: "SECURE"
  },
  {
    id: "k8s-wl-02",
    cluster: "prod-eks-us-east-1",
    namespace: "monitoring",
    workloadName: "fluentd-logging-daemon",
    kind: "DaemonSet",
    provider: "EKS",
    isPrivileged: true,
    hasHostPath: true,
    cloudIAMRole: "arn:aws:iam::481920418891:role/EKSNodeInstanceRole",
    vulnerabilityCount: 3,
    status: "CRITICAL"
  }
];
