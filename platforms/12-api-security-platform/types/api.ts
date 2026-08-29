export type HttpMethod    = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export type BodyType      = "json" | "xml" | "form-data" | "urlencoded" | "raw" | "graphql" | "binary" | "none";
export type AuthType      = "none" | "bearer" | "basic" | "apikey" | "oauth2" | "jwt" | "digest" | "mtls";
export type VariableScope = "global" | "workspace" | "collection" | "environment" | "request" | "runtime";
export type APISeverity   = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type APIType       = "REST" | "GraphQL" | "gRPC" | "SOAP" | "WebSocket";
export type APICategory   = "BOLA" | "Auth" | "Data Exposure" | "Rate Limiting" | "Mass Assignment" | "CORS" | "Injection" | "JWT" | "Schema";

export interface HTTPMethod { method: HttpMethod; color: string; bg: string; }

export interface ApiRequest {
  id:          string;
  name:        string;
  method:      HttpMethod;
  url:         string;
  description: string;
  headers:     KVPair[];
  params:      KVPair[];
  auth:        Auth;
  body:        RequestBody;
  preScript:   string;
  testScript:  string;
  tags:        string[];
}

export interface KVPair {
  id:       string;
  key:      string;
  value:    string;
  enabled:  boolean;
  secret?:  boolean;
  description?: string;
}

export interface Auth {
  type:    AuthType;
  token?:  string;
  username?: string;
  password?: string;
  key?:    string;
  value?:  string;
  in?:     "header" | "query";
}

export interface RequestBody {
  type:    BodyType;
  content: string;
}

export interface ApiResponse {
  status:     number;
  statusText: string;
  time:       number;
  size:       number;
  protocol:   string;
  headers:    KVPair[];
  body:       string;
  cookies:    KVPair[];
  timeline:   TimelineEntry[];
  security:   SecurityCheck[];
}

export interface TimelineEntry {
  phase: string;
  ms:    number;
}

export interface SecurityCheck {
  name:    string;
  status:  "pass" | "fail" | "warn" | "skip";
  detail:  string;
}

export interface Collection {
  id:       string;
  name:     string;
  icon:     string;
  folders:  CollectionFolder[];
  variables: KVPair[];
}

export interface CollectionFolder {
  id:       string;
  name:     string;
  requests: ApiRequest[];
  folders?: CollectionFolder[];
}

export interface Environment {
  id:      string;
  name:    string;
  active:  boolean;
  vars:    KVPair[];
}

export interface RunnerResult {
  requestId:  string;
  requestName: string;
  status:     number;
  time:       number;
  passed:     number;
  failed:     number;
  tests:      TestResult[];
}

export interface TestResult {
  name:    string;
  passed:  boolean;
  error?:  string;
}

export interface ApiHistoryEntry {
  id:        string;
  timestamp: string;
  method:    HttpMethod;
  url:       string;
  status:    number;
  time:      number;
  env:       string;
  collection?: string;
}

export interface ApiEndpoint {
  method:      HttpMethod;
  path:        string;
  description: string;
  params:      string[];
  tested:      boolean;
  findings:    number;
}

export interface APIFinding {
  id:          string;
  title:       string;
  severity:    APISeverity;
  category:    APICategory;
  apiType:     APIType;
  status:      "Open" | "Resolved" | "Suppressed";
  endpoint:    { method: HttpMethod; path: string; description: string };
  description: string;
  impact:      string;
  remediation: string;
  requestExample:  string;
  responseExample: string;
  owaspRef:    string;
  cweId:       string;
  owner:       string;
  detectedAt:  string;
}

export interface APIScanSummary {
  target:           string;
  apiType:          APIType;
  endpointsScanned: number;
  criticalCount:    number;
  highCount:        number;
  mediumCount:      number;
  totalFindings:    number;
}
