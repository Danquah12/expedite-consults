// ─── Secrets Security Platform — Core Types ──────────────────────────────────

export type SecretType =
  | "AWS Access Key"
  | "AWS Secret Key"
  | "GitHub Token"
  | "Stripe API Key"
  | "Slack Webhook"
  | "Private Key (RSA)"
  | "Private Key (EC)"
  | "Google API Key"
  | "Twilio Auth Token"
  | "SendGrid API Key"
  | "Database URL"
  | "JWT Secret"
  | "Generic API Key"
  | "OAuth Client Secret"
  | "Azure Storage Key"
  | "GCP Service Account";

export type SecretSeverity  = "Critical" | "High" | "Medium" | "Low";
export type SecretStatus    = "Active" | "Revoked" | "Unknown" | "False Positive";
export type SecretLocation  = "Source Code" | "Config File" | "CI/CD" | "Docker Image" | "IaC" | "Git History";
export type ValidationState = "Verified Live" | "Verified Revoked" | "Unverified" | "Invalid Format";

export interface SecretEntropy {
  score:    number;   // Shannon entropy 0–8
  label:    "Very High" | "High" | "Medium" | "Low";
}

export interface SecretLocation_Detail {
  repository:  string;
  file:        string;
  line:        number;
  commit:      string;
  branch:      string;
  author:      string;
  committedAt: string;
  locationType: SecretLocation;
}

export interface SecretFinding {
  id:              string;          // "SEC-001"
  type:            SecretType;
  severity:        SecretSeverity;
  status:          SecretStatus;
  validation:      ValidationState;

  // The secret (partially masked for display)
  maskedValue:     string;          // e.g. "AKIA••••••••••••WXYZ"
  prefix:          string;          // detectable prefix
  detector:        string;          // regex rule that matched

  // Location
  locations:       SecretLocation_Detail[];

  // Risk context
  entropy:         SecretEntropy;
  internetExposed: boolean;         // repo is public?
  inGitHistory:    boolean;         // appears in old commits too?
  age:             number;          // days since first detected
  accessScope:     string;          // what this credential can access
  blastRadius:     string;          // what damage if exploited

  // Business
  service:         string;          // "AWS Production", "Stripe Live"
  environment:     "Production" | "Staging" | "Development" | "Unknown";
  owner:           string;
  slaDeadline:     string;

  // Remediation
  remediationSteps: string[];
  rotationUrl:     string | null;   // direct link to rotate the credential

  // Detection metadata
  firstDetected:   string;
  lastSeen:        string;
  ruleId:          string;
}

export interface DetectorRule {
  id:          string;
  name:        string;
  pattern:     string;    // simplified (not the full regex)
  secretType:  SecretType;
  confidence:  number;    // 0–1
  falsePositiveRate: number;
}

export interface ScanSummary {
  totalSecrets:    number;
  activeSecrets:   number;
  revokedSecrets:  number;
  publicRepos:     number;
  inGitHistory:    number;
  criticalCount:   number;
  highCount:       number;
  reposScanned:    number;
  filesScanned:    number;
  commitsScanned:  number;
}
