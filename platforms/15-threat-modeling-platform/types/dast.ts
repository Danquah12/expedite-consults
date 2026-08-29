// ─── DAST Workstation — Core Types ───────────────────────────────────────────

export type HttpMethod   = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type Severity     = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type Confidence   = "Confirmed" | "High" | "Medium" | "Low";
export type ScanStatus   = "idle" | "running" | "paused" | "completed" | "error";
export type VulnPlugin   = "SQLi" | "XSS" | "SSRF" | "CSRF" | "IDOR" | "JWT" | "CORS" | "OpenRedirect" | "PathTraversal" | "XXE" | "SSTI" | "CMDi" | "LFI" | "Header" | "Auth";

// ─── Proxy ──────────────────────────────────────────────────────────────────

export interface ProxyEntry {
  id:           number;
  timestamp:    string;
  method:       HttpMethod;
  url:          string;
  host:         string;
  path:         string;
  statusCode:   number;
  mimeType:     string;
  requestLength: number;
  responseLength: number;
  timeMs:       number;
  intercepted:  boolean;
  tags:         string[];
  request:      RawRequest;
  response:     RawResponse;
}

export interface RawRequest {
  method:   HttpMethod;
  path:     string;
  protocol: string;
  headers:  Record<string, string>;
  body?:    string;
  raw:      string;
}

export interface RawResponse {
  protocol:   string;
  statusCode: number;
  statusText: string;
  headers:    Record<string, string>;
  body:       string;
  raw:        string;
}

// ─── Scanner / Findings ─────────────────────────────────────────────────────

// MITRE ATT&CK Tactic/Technique mapping
export interface TTP {
  tactic:         string;   // e.g. "Initial Access"
  tacticId:       string;   // e.g. "TA0001"
  technique:      string;   // e.g. "Exploit Public-Facing Application"
  techniqueId:    string;   // e.g. "T1190"
  subtechnique?:  string;   // e.g. "Web Application Exploitation"
  procedure:      string;   // how an attacker executes this
  mitigations:    string[]; // recommended MITRE mitigations
  references:     string[]; // URLs
}

// Working proof-of-concept exploit
export interface POC {
  description:    string;
  curlCommand?:   string;
  pythonScript?:  string;
  browserPayload?: string;
  nucleiTemplate?: string;
  expectedResult: string;
  severity:       string;
}

// Annotated captured evidence item
export interface CollectedEvidence {
  id:          string;
  label:       string;
  type:        "http-request" | "http-response" | "diff" | "screenshot-desc" | "log-snippet";
  content:     string;
  highlight?:  string;   // regex or string to highlight in content
  annotation?: string;   // analyst note on this evidence item
}

export interface Finding {
  id:               string;
  title:            string;
  severity:         Severity;
  confidence:       Confidence;
  plugin:           VulnPlugin;
  url:              string;
  parameter:        string;
  method:           HttpMethod;
  owaspRef:         string;
  cweId:            string;
  description:      string;
  impact:           string;
  remediation:      string;
  evidence:         FindingEvidence;
  ttp?:             TTP[];
  poc?:             POC;
  collectedEvidence?: CollectedEvidence[];
  verificationStatus: "Verified" | "Needs Review" | "False Positive";
  detectedAt:       string;
}

export interface FindingEvidence {
  originalRequest:  string;
  testRequest:      string;
  originalResponse: string;
  testResponse:     string;
  payload:          string;
  matchedPattern:   string;
  reproductionSteps: string[];
}

// ─── Repeater ───────────────────────────────────────────────────────────────

export interface RepeaterTab {
  id:       string;
  label:    string;
  request:  string;
  response: string;
  status?:  number;
  timeMs?:  number;
  length?:  number;
}

// ─── Intruder ───────────────────────────────────────────────────────────────

export type AttackMode = "Sniper" | "Battering Ram" | "Pitchfork" | "Cluster Bomb";

export interface IntruderResult {
  id:         number;
  payload:    string;
  status:     number;
  length:     number;
  timeMs:     number;
  match:      boolean;
  error:      boolean;
}

// ─── Crawler ────────────────────────────────────────────────────────────────

export interface CrawledUrl {
  id:       number;
  url:      string;
  method:   HttpMethod;
  status:   number;
  type:     "page" | "api" | "form" | "asset" | "websocket";
  params:   string[];
  forms:    number;
  depth:    number;
}

// ─── Plugin ─────────────────────────────────────────────────────────────────

export interface Plugin {
  id:          VulnPlugin;
  name:        string;
  category:    "Injection" | "XSS" | "Auth" | "Config" | "Disclosure" | "Business Logic";
  description: string;
  enabled:     boolean;
  payloads:    number;
  findings?:   number;
}

// ─── API Scanner ─────────────────────────────────────────────────────────────

export interface ApiEndpoint {
  method:      HttpMethod;
  path:        string;
  description: string;
  params:      string[];
  tested:      boolean;
  findings:    number;
}
