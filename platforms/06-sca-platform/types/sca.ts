// ─── SCA Core Types ─────────────────────────────────────────────────────────

export type Severity        = "Critical" | "High" | "Medium" | "Low";
export type LicenseRisk     = "Copyleft" | "Permissive" | "Proprietary" | "Unknown";
export type VulnStatus      = "Open" | "Patched Available" | "No Fix" | "Won't Fix";
export type EcosystemType   = "npm" | "Maven" | "PyPI" | "NuGet" | "Go" | "RubyGems" | "Cargo";

export interface CVEEntry {
  id:          string;        // e.g. "CVE-2021-44228"
  cvss:        number;        // 0–10
  epss:        number;        // 0–1 probability
  description: string;
  publishedAt: string;
  severity:    Severity;
  patchedIn:   string | null; // version that fixes it, or null
  exploitInWild: boolean;
}

export interface LicenseInfo {
  name:        string;        // "MIT", "GPL-3.0", "Apache-2.0"
  spdxId:      string;
  risk:        LicenseRisk;
  copyleft:    boolean;
  commercial:  boolean;       // commercially usable
  notes:       string;
}

export interface TransitivePath {
  chain:       string[];      // ["your-app", "express", "qs", "vulnerable-dep"]
  depth:       number;
}

export interface SCACVEFinding {
  id:              string;            // "SCA-001"
  packageName:     string;            // "log4j-core"
  packageVersion:  string;            // "2.14.1"
  ecosystem:       EcosystemType;
  severity:        Severity;
  status:          VulnStatus;

  cves:            CVEEntry[];
  license:         LicenseInfo;

  // Dependency graph
  isDirect:        boolean;
  depth:           number;
  transitivePaths: TransitivePath[];
  dependentCount:  number;            // how many of your packages depend on it

  // Risk context
  internetFacing:    boolean;
  activelyExploited: boolean;
  reachable:         boolean;         // is the vulnerable code actually called?
  fixAvailable:      boolean;
  fixVersion:        string | null;
  breakingChange:    boolean;         // would upgrading break the API?

  // Business
  businessImpact:   string;
  executiveSummary: string;
  remediation:      string;
  validationSteps:  string[];
  slaDeadline:      string;
  owner:            string;

  // Compliance
  compliance: { framework: string; reference: string; description: string }[];

  // Metadata
  repository:  string;
  firstSeen:   string;
  lastUpdated: string;
}

export interface DependencyStats {
  total:       number;
  direct:      number;
  transitive:  number;
  outdated:    number;
  vulnerable:  number;
  licenseIssues: number;
}

export interface LicenseSummary {
  license:  string;
  count:    number;
  risk:     LicenseRisk;
}

export interface EcosystemBreakdown {
  ecosystem: EcosystemType;
  count:     number;
  vulnerable: number;
}

export type RiskBand = "Critical" | "High" | "Medium" | "Low" | "Safe";
