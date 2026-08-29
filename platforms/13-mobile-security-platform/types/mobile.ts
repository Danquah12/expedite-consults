export type MobileSeverity  = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type MobilePlatform  = "iOS" | "Android" | "React Native" | "Flutter" | "Both";
export type MobileCategory  = "Data Storage" | "Cryptography" | "Authentication" | "Network" | "Code Quality" | "Permissions" | "Binary" | "Reverse Engineering";

export interface MobileFinding {
  id:          string;
  title:       string;
  severity:    MobileSeverity;
  category:    MobileCategory;
  platform:    MobilePlatform;
  status:      "Open" | "Resolved" | "Suppressed";

  appId:       string;         // "com.acme.mobileapp" or "com.acme.app"
  appVersion:  string;
  file:        string;         // location in app binary/source
  line?:       number;

  description: string;
  impact:      string;
  codeExample: string;         // decompiled or source code snippet
  codeFix:     string;         // fixed code
  remediation: string;

  owaspRef:    string;         // "MASVS-STORAGE-1"
  cweId:       string;
  detectedAt:  string;
  owner:       string;
}

export interface MobileApp {
  id:        string;
  name:      string;
  platform:  MobilePlatform;
  version:   string;
  bundleId:  string;
  findings:  number;
  riskScore: number;           // 0-100
}

export interface ScanSummary {
  apps:           number;
  criticalCount:  number;
  highCount:      number;
  mediumCount:    number;
  totalFindings:  number;
  avgRiskScore:   number;
}
