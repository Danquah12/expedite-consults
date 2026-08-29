// ─── IaC Security Platform — Core Types ──────────────────────────────────────

export type IaCSeverity   = "Critical" | "High" | "Medium" | "Low" | "Info";
export type IaCFramework  = "Terraform" | "CloudFormation" | "Pulumi" | "Ansible" | "Bicep" | "ARM" | "CDK";
export type CloudProvider = "AWS" | "Azure" | "GCP" | "Multi-Cloud";
export type IaCCategory   = "Network" | "IAM" | "Encryption" | "Logging" | "Storage" | "Compute" | "Database" | "Compliance";
export type ComplianceFramework = "CIS AWS" | "PCI DSS" | "HIPAA" | "SOC2" | "NIST 800-53" | "ISO 27001";

export interface IaCFinding {
  id:           string;        // "IAC-001"
  title:        string;
  severity:     IaCSeverity;
  category:     IaCCategory;
  framework:    IaCFramework;
  provider:     CloudProvider;
  status:       "Open" | "Resolved" | "Suppressed";

  resource:     string;        // e.g. "aws_s3_bucket.customer_data"
  file:         string;        // "infrastructure/s3.tf"
  line:         number;

  description:  string;
  impact:       string;
  codeSnippet:  string;        // vulnerable code
  codeFix:      string;        // fixed code
  remediation:  string;

  complianceRefs: { framework: ComplianceFramework; control: string; }[];
  ruleId:       string;        // "CKV_AWS_18"
  detectedAt:   string;
  owner:        string;
}

export interface ScanSummary {
  filesScanned:     number;
  resourcesScanned: number;
  criticalCount:    number;
  highCount:        number;
  mediumCount:      number;
  totalFindings:    number;
  passedChecks:     number;
  failedChecks:     number;
}
