import type { IaCFinding, ScanSummary } from "@/types/iac";

export const SCAN_SUMMARY: ScanSummary = {
  filesScanned: 87, resourcesScanned: 412,
  criticalCount: 3, highCount: 8, mediumCount: 14,
  totalFindings: 25, passedChecks: 387, failedChecks: 25,
};

export const FINDINGS: IaCFinding[] = [
  {
    id: "IAC-001", title: "S3 bucket allows public access",
    severity: "Critical", category: "Storage", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_s3_bucket.customer_data", file: "infrastructure/s3.tf", line: 12,
    description: "The customer_data S3 bucket has ACL set to 'public-read', exposing all objects to the internet. Block Public Access settings are not configured.",
    impact: "All customer PII, documents, and uploads stored in this bucket are publicly readable without authentication. Any internet user can enumerate and download bucket contents.",
    codeSnippet: `resource "aws_s3_bucket" "customer_data" {
  bucket = "acme-customer-data-prod"
  acl    = "public-read"  # CRITICAL: All objects public
}`,
    codeFix: `resource "aws_s3_bucket" "customer_data" {
  bucket = "acme-customer-data-prod"
}

resource "aws_s3_bucket_public_access_block" "customer_data" {
  bucket                  = aws_s3_bucket.customer_data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "customer_data" {
  bucket = aws_s3_bucket.customer_data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}`,
    remediation: "Remove the ACL attribute, add an aws_s3_bucket_public_access_block resource with all four settings set to true, and add KMS encryption.",
    complianceRefs: [
      { framework: "PCI DSS", control: "7.1" },
      { framework: "CIS AWS", control: "2.1.5" },
      { framework: "SOC2", control: "CC6.1" },
    ],
    ruleId: "CKV_AWS_20", detectedAt: "2026-08-20", owner: "Platform Team",
  },
  {
    id: "IAC-002", title: "Security Group allows ingress from 0.0.0.0/0 on port 22 (SSH)",
    severity: "Critical", category: "Network", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_security_group.bastion", file: "infrastructure/networking.tf", line: 34,
    description: "The bastion security group allows inbound SSH (port 22) from the entire internet (0.0.0.0/0 and ::/0). This exposes SSH to brute force and exploitation attacks.",
    impact: "Any internet attacker can attempt to authenticate to the bastion host. Successful exploitation provides direct shell access to the internal network.",
    codeSnippet: `resource "aws_security_group_rule" "ssh_ingress" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]  # CRITICAL: Open to internet
  ipv6_cidr_blocks = ["::/0"]
}`,
    codeFix: `resource "aws_security_group_rule" "ssh_ingress" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["10.0.0.0/8"]  # VPN/office CIDR only
  description = "SSH from corporate VPN only"
}
# Better: Use AWS Systems Manager Session Manager
# (no SSH required, no port 22 needed at all)`,
    remediation: "Restrict to specific IP ranges (corporate VPN/office). Better: remove SSH entirely and use AWS Systems Manager Session Manager for bastion access.",
    complianceRefs: [
      { framework: "CIS AWS", control: "5.2" },
      { framework: "PCI DSS", control: "1.3.1" },
      { framework: "NIST 800-53", control: "SC-7" },
    ],
    ruleId: "CKV_AWS_25", detectedAt: "2026-08-20", owner: "Network Team",
  },
  {
    id: "IAC-003", title: "RDS instance not encrypted at rest",
    severity: "Critical", category: "Database", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_db_instance.customer_postgres", file: "infrastructure/rds.tf", line: 8,
    description: "The production PostgreSQL RDS instance has storage_encrypted = false. Database files, automated backups, read replicas, and snapshots will all be stored unencrypted.",
    impact: "AWS personnel or physical media theft could expose all customer data. Violates PCI DSS, HIPAA, and most enterprise security policies. Encryption cannot be enabled after creation — requires a snapshot and restore.",
    codeSnippet: `resource "aws_db_instance" "customer_postgres" {
  identifier        = "prod-postgres"
  engine            = "postgres"
  instance_class    = "db.r6g.xlarge"
  allocated_storage = 500
  storage_encrypted = false  # CRITICAL
  username          = "admin"
  password          = var.db_password  # Also: use secrets manager
}`,
    codeFix: `resource "aws_db_instance" "customer_postgres" {
  identifier        = "prod-postgres"
  engine            = "postgres"
  instance_class    = "db.r6g.xlarge"
  allocated_storage = 500
  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn
  manage_master_user_password = true  # Use Secrets Manager
  deletion_protection = true
  backup_retention_period = 30
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}`,
    remediation: "Set storage_encrypted = true with a KMS key. You must recreate the instance — take a snapshot, restore with encryption enabled. Also enable deletion protection and CloudWatch logging.",
    complianceRefs: [
      { framework: "PCI DSS", control: "3.5" },
      { framework: "HIPAA", control: "164.312(a)(2)(iv)" },
      { framework: "CIS AWS", control: "2.3.1" },
    ],
    ruleId: "CKV_AWS_17", detectedAt: "2026-08-19", owner: "Database Team",
  },
  {
    id: "IAC-004", title: "IAM policy allows wildcard actions (*) on all resources",
    severity: "High", category: "IAM", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_iam_policy.app_policy", file: "infrastructure/iam.tf", line: 23,
    description: "The application IAM policy grants Action: '*' on Resource: '*', effectively making this a root-equivalent policy. Any EC2 instance or Lambda with this role has god-mode AWS access.",
    impact: "Compromised application can enumerate, modify, or delete any AWS resource. Can create new admin IAM users, read all Secrets Manager secrets, access any S3 bucket, and escalate privileges.",
    codeSnippet: `resource "aws_iam_policy" "app_policy" {
  policy = jsonencode({
    Statement = [{
      Action   = "*"      # GOD MODE
      Effect   = "Allow"
      Resource = "*"      # ALL RESOURCES
    }]
  })
}`,
    codeFix: `resource "aws_iam_policy" "app_policy" {
  policy = jsonencode({
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "arn:aws:s3:::acme-app-data/*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:us-east-1:*:secret:app/*"
      }
    ]
  })
}`,
    remediation: "Enumerate the exact AWS actions the application needs. Scope to specific resources with ARNs. Follow least privilege — start with Deny All and add only what's needed.",
    complianceRefs: [
      { framework: "CIS AWS", control: "1.16" },
      { framework: "NIST 800-53", control: "AC-6" },
      { framework: "SOC2", control: "CC6.3" },
    ],
    ruleId: "CKV_AWS_40", detectedAt: "2026-08-20", owner: "Security Team",
  },
  {
    id: "IAC-005", title: "CloudTrail not enabled for all regions",
    severity: "High", category: "Logging", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_cloudtrail.main", file: "infrastructure/cloudtrail.tf", line: 5,
    description: "CloudTrail is configured with is_multi_region_trail = false. API activity in non-primary regions is not logged, creating blind spots for lateral movement and unauthorized resource creation.",
    impact: "Attackers can operate undetected in non-logged AWS regions. Incident response is severely hampered without a complete audit trail. Fails CIS AWS Benchmark and many compliance audits.",
    codeSnippet: `resource "aws_cloudtrail" "main" {
  name           = "main-trail"
  s3_bucket_name = aws_s3_bucket.trail.id
  is_multi_region_trail   = false  # Blind spots!
  enable_log_file_validation = false
  # No CloudWatch integration
}`,
    codeFix: `resource "aws_cloudtrail" "main" {
  name                          = "main-trail"
  s3_bucket_name                = aws_s3_bucket.trail.id
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  include_global_service_events = true
  cloud_watch_logs_group_arn    = "\${aws_cloudwatch_log_group.trail.arn}:*"
  cloud_watch_logs_role_arn     = aws_iam_role.cloudtrail_cw.arn
  kms_key_id                    = aws_kms_key.trail.arn
}`,
    remediation: "Set is_multi_region_trail = true, enable log file validation, integrate with CloudWatch Logs for real-time alerting, and encrypt trail with KMS.",
    complianceRefs: [
      { framework: "CIS AWS", control: "3.1" },
      { framework: "PCI DSS", control: "10.1" },
      { framework: "ISO 27001", control: "A.12.4" },
    ],
    ruleId: "CKV_AWS_67", detectedAt: "2026-08-20", owner: "Security Team",
  },
  {
    id: "IAC-006", title: "EC2 instance metadata service v1 enabled (IMDSv1)",
    severity: "High", category: "Compute", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_instance.api_server", file: "infrastructure/ec2.tf", line: 18,
    description: "EC2 instances allow IMDSv1 which does not require session tokens. SSRF vulnerabilities in application code can be exploited to steal instance credentials via http://169.254.169.254/.",
    impact: "SSRF → IMDSv1 → steal IAM role credentials → full AWS account compromise. This attack vector was used in the Capital One data breach (2019, $80M fine).",
    codeSnippet: `resource "aws_instance" "api_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "m5.xlarge"
  # IMDSv1 allowed by default — no metadata_options block
}`,
    codeFix: `resource "aws_instance" "api_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "m5.xlarge"
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 only
    http_put_response_hop_limit = 1
  }
}`,
    remediation: "Add metadata_options block with http_tokens = 'required' to enforce IMDSv2. Set hop limit to 1 to prevent container workloads from accessing instance metadata.",
    complianceRefs: [
      { framework: "CIS AWS", control: "5.6" },
      { framework: "NIST 800-53", control: "SC-8" },
    ],
    ruleId: "CKV_AWS_79", detectedAt: "2026-08-19", owner: "Platform Team",
  },
  {
    id: "IAC-007", title: "Azure Storage Account allows public blob access",
    severity: "High", category: "Storage", framework: "Terraform", provider: "Azure", status: "Open",
    resource: "azurerm_storage_account.documents", file: "infrastructure/azure/storage.tf", line: 9,
    description: "The Azure Storage Account has allow_nested_items_to_be_public = true, allowing individual containers and blobs to be made publicly accessible without authentication.",
    impact: "Any container in this storage account can be set to public by developers, potentially exposing sensitive documents. No visibility into which blobs are currently public.",
    codeSnippet: `resource "azurerm_storage_account" "documents" {
  name                     = "acmedocsprod"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "GRS"
  allow_nested_items_to_be_public = true  # DANGEROUS
}`,
    codeFix: `resource "azurerm_storage_account" "documents" {
  name                     = "acmedocsprod"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "GRS"
  allow_nested_items_to_be_public = false
  min_tls_version          = "TLS1_2"
  enable_https_traffic_only = true
  blob_properties {
    delete_retention_policy { days = 30 }
  }
}`,
    remediation: "Set allow_nested_items_to_be_public = false, enforce TLS 1.2+, enable HTTPS only, and configure soft delete retention.",
    complianceRefs: [
      { framework: "CIS AWS", control: "2.1.1" },
      { framework: "SOC2", control: "CC6.1" },
    ],
    ruleId: "CKV_AZURE_59", detectedAt: "2026-08-18", owner: "Cloud Team",
  },
  {
    id: "IAC-008", title: "VPC Flow Logs disabled",
    severity: "Medium", category: "Logging", framework: "Terraform", provider: "AWS", status: "Open",
    resource: "aws_vpc.production", file: "infrastructure/vpc.tf", line: 3,
    description: "The production VPC does not have Flow Logs enabled. Network-level traffic (accepted and rejected) is not captured, making it impossible to detect network attacks, data exfiltration, or lateral movement.",
    impact: "Cannot detect network-based attacks, port scans, data exfiltration, or lateral movement after a breach. Incident response is severely limited without network forensics.",
    codeSnippet: `resource "aws_vpc" "production" {
  cidr_block = "10.0.0.0/16"
  # No flow logs configured
}`,
    codeFix: `resource "aws_vpc" "production" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_flow_log" "production" {
  iam_role_arn    = aws_iam_role.flow_log.arn
  log_destination = aws_cloudwatch_log_group.flow_log.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.production.id
}`,
    remediation: "Create an aws_flow_log resource attached to the VPC. Configure traffic_type = 'ALL' to capture both accepted and rejected traffic. Send to CloudWatch Logs or S3 for analysis.",
    complianceRefs: [
      { framework: "CIS AWS", control: "3.9" },
      { framework: "PCI DSS", control: "10.6" },
      { framework: "NIST 800-53", control: "AU-3" },
    ],
    ruleId: "CKV2_AWS_11", detectedAt: "2026-08-20", owner: "Network Team",
  },
];
