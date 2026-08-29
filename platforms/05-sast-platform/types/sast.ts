export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Status = "Open" | "In Progress" | "Resolved" | "False Positive";

export type EngineResult = {
  name: "CodeQL" | "PatternGuard AST" | "Joern" | "DataFlow";
  confidence: number; // 0–1
  confirmed: boolean;
  details?: string;
};

export type AttackPathStep = {
  label: string;
  type: "entry" | "vulnerability" | "lateral" | "asset" | "impact";
  description?: string;
};

export type ComplianceRef = {
  framework: "PCI DSS" | "NIST 800-53" | "ISO 27001" | "CIS Controls" | "OWASP Top 10";
  reference: string;
  description: string;
};

export type Remediation = {
  platform: "Java" | "Python" | "Node.js" | "Go" | "C#" | "PHP";
  code: string;
  explanation: string;
};

export type ExploitabilityLevel = "Very Easy" | "Easy" | "Moderate" | "Difficult" | "Very Difficult";

export type SASTFinding = {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  cwe: string;
  cweName: string;
  cvss: number;
  epss: number; // 0–1 probability
  mitre: string;
  owasp: string;
  owaspCategory: string;

  // Location
  file: string;
  line: number;
  language: string;

  // Taint analysis
  source: string;
  sink: string;
  taintPath: string[];

  // Engine results
  engines: EngineResult[];
  confidence: number; // 0–1 aggregate

  // Exploitability
  reachable: boolean;
  internetFacing: boolean;
  authRequired: boolean;
  exploitabilityLevel: ExploitabilityLevel;
  privilegeGain: string;

  // Attack context
  attackPath: AttackPathStep[];
  executiveSummary: string;
  businessImpact: string;
  rootCause: string;
  falsePositiveLikelihood: "Very Low" | "Low" | "Medium" | "High";

  // Compliance
  compliance: ComplianceRef[];

  // Fix guidance
  remediation: Remediation[];
  validationSteps: string[];

  // Management
  slaDeadline: string;
  owner: string;
  application: string;
  riskScore: number;

  // Trend
  firstDetected: string;
  lastSeen: string;
};

export type ScanResult = {
  id: string;
  repoUrl: string;
  language: string;
  startedAt: string;
  completedAt: string;
  linesScanned: number;
  filesScanned: number;
  findings: SASTFinding[];
  riskScore: number;
  engines: string[];
};

export type RiskBand = "Critical" | "High" | "Medium" | "Low";

export function getRiskBand(score: number): RiskBand {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}
