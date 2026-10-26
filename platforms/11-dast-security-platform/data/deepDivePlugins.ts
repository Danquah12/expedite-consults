export interface DeepDivePlugin {
  id: string;
  code: string;
  name: string;
  version: string;
  author: string;
  brainStage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  brainStageName:
    | "1. DISCOVER"
    | "2. UNDERSTAND"
    | "3. PLAN"
    | "4. EXECUTE"
    | "5. VALIDATE"
    | "6. CORRELATE"
    | "7. REPORT"
    | "8. RETEST";
  category:
    | "Deep Spider & Recon"
    | "Architecture & Trust Model"
    | "Adaptive Test Planning"
    | "Active & Passive DAST"
    | "Zero-FP Verification"
    | "Correlation & Root-Cause"
    | "Dossier & Virtual Patching"
    | "D3FEND Retest & Regression";
  engineModule: "NMAP" | "OPENVAS" | "ZAP" | "BURP" | "POST_EXPLOIT" | "AI" | "REPORT";
  estimatedMinutes1HrMode: number;
  standards: string;
  description: string;
  deepDiveActions: string[];
  permissions: string[];
  status: "ACTIVE" | "VERIFIED";
}

export const COMMERCIAL_DEEP_DIVE_PLUGINS: DeepDivePlugin[] = [
  // ── BRAIN STAGE 1: 1. DISCOVER (Full 65,535 TCP + 65,535 UDP Port Recon & Recursive URL Spidering) ──
  {
    id: "plugin-101-recursive-dom-spider",
    code: "EXP-PLG-101",
    name: "Full 65,535 TCP/UDP Port Recon & Multi-Depth HTML/DOM Recursive Spider",
    version: "5.5.0",
    author: "TrePath™ Core Labs",
    brainStage: 1,
    brainStageName: "1. DISCOVER",
    category: "Deep Spider & Recon",
    engineModule: "NMAP",
    estimatedMinutes1HrMode: 3.0,
    standards: "OWASP WSTG-INFO-01/03 · PTES P2 · MITRE TA0043 T1046 / T1595",
    description:
      "Executes exhaustive transport reconnaissance across all 65,535 TCP ports (-sS -p T:1-65535) and all 65,535 UDP ports (-sU -p U:1-65535 — 131,070 total sockets) while recursively spidering the customer's specified URL across same-origin internal links, /sitemap.xml <loc> entries, and /robots.txt directives.",
    deepDiveActions: [
      "Sweep all 65,535 TCP ports (T:1-65535) & 65,535 UDP ports (U:1-65535) — 131,070 total sockets",
      "Fetch root document & parse all same-origin <a href>, <area>, and navigation routes",
      "Parse /robots.txt Allow/Disallow rules & /sitemap.xml <loc> URL inventory",
      "Concurrently spider discovered internal sub-pages to map deep application hierarchy"
    ],
    permissions: ["network.tcp.scan_65535", "network.udp.scan_65535", "network.http.get", "spider.crawl.same_origin"],
    status: "ACTIVE"
  },
  {
    id: "plugin-102-js-ast-route-extractor",
    code: "EXP-PLG-102",
    name: "JavaScript Bundle & Webpack/Next.js Route Extractor",
    version: "5.5.0",
    author: "TrePath™ Core Labs",
    brainStage: 1,
    brainStageName: "1. DISCOVER",
    category: "Deep Spider & Recon",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 2.5,
    standards: "OWASP WSTG-INFO-05 · API9:2023 · MITRE TA0007 T1083",
    description:
      "Inspects inline and external <script src> bundles (Webpack, Next.js _next/static chunks, Vite, React Router, Angular) to uncover client-side routes, REST endpoints (/api/v1/*, /api/v2/*), and GraphQL operations.",
    deepDiveActions: [
      "Enumerate all <script src> assets and inline JavaScript blocks across spidered pages",
      "Extract embedded REST API routes (/api/*, /v1/*, /v2/*, /graphql, /auth/*, /admin/*)",
      "Identify Next.js / SPA build manifests and client-side route tables",
      "Catalog undocumented / shadow API endpoints for Stage 3 test planning"
    ],
    permissions: ["script.fetch", "ast.route.extract", "spider.api_discovery"],
    status: "ACTIVE"
  },
  {
    id: "plugin-103-openapi-graphql-probe",
    code: "EXP-PLG-103",
    name: "OpenAPI v3 / Swagger / GraphQL & Well-Known Endpoint Prober",
    version: "5.5.0",
    author: "TrePath™ Core Labs",
    brainStage: 1,
    brainStageName: "1. DISCOVER",
    category: "Deep Spider & Recon",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 2.0,
    standards: "OWASP API9:2023 · WSTG-CONF-04 · RFC 9116 (security.txt)",
    description:
      "Probes 15+ commercial discovery paths including /openapi.json, /swagger.json, /api-docs, /graphql, /.well-known/security.txt, /.well-known/openid-configuration, /manifest.json, /humans.txt, and /crossdomain.xml.",
    deepDiveActions: [
      "Probe OpenAPI/Swagger schema endpoints (/openapi.json, /swagger.json, /api-docs)",
      "Check OIDC/OAuth discovery metadata (/.well-known/openid-configuration)",
      "Verify RFC 9116 vulnerability disclosure policy (/.well-known/security.txt)",
      "Filter out SPA HTML catch-all responses to prevent false endpoint hits"
    ],
    permissions: ["network.http.probe", "schema.openapi.parse"],
    status: "ACTIVE"
  },
  {
    id: "plugin-104-doh-dns-ct-recon",
    code: "EXP-PLG-104",
    name: "UDP Service (QUIC/53/123/161) & Cloudflare DoH DNS Surface Auditor",
    version: "5.5.0",
    author: "TrePath™ Core Labs",
    brainStage: 1,
    brainStageName: "1. DISCOVER",
    category: "Deep Spider & Recon",
    engineModule: "NMAP",
    estimatedMinutes1HrMode: 1.5,
    standards: "NIST SP 800-115 §2 · PTES P2 · MITRE TA0043 T1046 / T1590.002",
    description:
      "Audits UDP transport services across all 65,535 UDP ports (53/udp DNS, 123/udp NTP, 161/udp SNMP, 443/udp QUIC HTTP/3) alongside live DNS-over-HTTPS (DoH) resolution for A, AAAA, MX, NS, TXT (SPF), _dmarc (DMARC), and CAA records.",
    deepDiveActions: [
      "Probe UDP transport services (53/udp DNS, 123/udp NTP, 161/udp SNMP, 443/udp QUIC/HTTP3) across U:1-65535",
      "Resolve live A / AAAA / NS / MX records via Cloudflare DNS-over-HTTPS",
      "Audit TXT v=spf1 sender policy framework & _dmarc v=DMARC1 enforcement policy",
      "Inspect DNS CAA records & correlate edge CDN / reverse proxy infrastructure"
    ],
    permissions: ["network.udp.scan_65535", "dns.doh.query", "recon.domain.inspect"],
    status: "ACTIVE"
  },

  // ── BRAIN STAGE 2: 2. UNDERSTAND (Application Architecture, Forms & Trust Boundaries) ──
  {
    id: "plugin-201-form-input-parameter-mapper",
    code: "EXP-PLG-201",
    name: "Deep Form, Input Field, Hidden Token & Parameter Inventory Plugin",
    version: "5.4.0",
    author: "TrePath™ Core Labs",
    brainStage: 2,
    brainStageName: "2. UNDERSTAND",
    category: "Architecture & Trust Model",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 2.5,
    standards: "OWASP ASVS v4.0.3 V5 · WSTG-INPV · NIST SP 800-115 §3",
    description:
      "Parses every spidered HTML page to extract <form> actions, methods (GET/POST), <input>, <select>, <textarea> names/types, hidden state fields, CSRF anti-forgery tokens, and URL query parameters.",
    deepDiveActions: [
      "Extract all <form action method> blocks across root and spidered internal pages",
      "Catalog <input name type>, hidden fields, and anti-CSRF token presence",
      "Inventory all URL query string parameters (?id=, ?q=, ?page=, ?redirect=)",
      "Build parameter data-type and trust boundary model for Stage 3 planning"
    ],
    permissions: ["dom.forms.parse", "parameters.inventory"],
    status: "ACTIVE"
  },
  {
    id: "plugin-202-tech-stack-waf-fingerprinter",
    code: "EXP-PLG-202",
    name: "Server, CDN, WAF & Framework Stack Fingerprinter",
    version: "5.4.0",
    author: "TrePath™ Core Labs",
    brainStage: 2,
    brainStageName: "2. UNDERSTAND",
    category: "Architecture & Trust Model",
    engineModule: "OPENVAS",
    estimatedMinutes1HrMode: 2.0,
    standards: "OWASP WSTG-INFO-02/08 · MITRE TA0043 T1592.002",
    description:
      "Fingerprints web servers (Nginx, Apache, IIS, Envoy), application runtimes (Next.js, React, Node.js, PHP, ASP.NET, Spring, Django), and edge WAF/CDN layers (Cloudflare, Vercel Edge, AWS WAF, ModSecurity).",
    deepDiveActions: [
      "Inspect Server, X-Powered-By, X-Vercel-Id, CF-Ray, and Via headers",
      "Detect frontend/SSR framework signatures (__NEXT_DATA__, ng-version, data-reactroot)",
      "Identify edge WAF rate-limiting and bot-mitigation headers",
      "Flag verbose version banners for CWE-200 / OWASP A05 hardening"
    ],
    permissions: ["fingerprint.headers", "fingerprint.dom"],
    status: "ACTIVE"
  },
  {
    id: "plugin-203-auth-session-boundary-modeler",
    code: "EXP-PLG-203",
    name: "Authentication State Machine, Cookie Entropy & JWT Trust Boundary Plugin",
    version: "5.4.0",
    author: "TrePath™ Core Labs",
    brainStage: 2,
    brainStageName: "2. UNDERSTAND",
    category: "Architecture & Trust Model",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 2.0,
    standards: "OWASP ASVS V2/V3 · WSTG-SESS-01..09 · MITRE TA0006",
    description:
      "Models authentication and session trust boundaries across Public/Guest, Authenticated User, and Admin contexts, auditing Set-Cookie attributes (HttpOnly, Secure, SameSite) and Authorization header handling.",
    deepDiveActions: [
      "Parse all Set-Cookie headers across spidered responses",
      "Verify HttpOnly, Secure, and SameSite=Strict/Lax flags on session cookies",
      "Map login, registration, password reset, and OAuth/OIDC callback routes",
      "Model privilege boundaries between anonymous and authenticated endpoints"
    ],
    permissions: ["session.cookie.audit", "auth.boundary.model"],
    status: "ACTIVE"
  },
  {
    id: "plugin-204-sri-third-party-script-auditor",
    code: "EXP-PLG-204",
    name: "Subresource Integrity (SRI) & Third-Party Supply-Chain Script Tracker",
    version: "5.4.0",
    author: "TrePath™ Core Labs",
    brainStage: 2,
    brainStageName: "2. UNDERSTAND",
    category: "Architecture & Trust Model",
    engineModule: "OPENVAS",
    estimatedMinutes1HrMode: 1.5,
    standards: "OWASP A08:2021 · WSTG-CONF-11 · PCI-DSS v4.0 Req 6.4.3",
    description:
      "Audits all external <script src> and <link rel='stylesheet'> inclusions loaded from third-party CDNs to verify Subresource Integrity (integrity='sha384-...') and PCI-DSS v4.0 client-side script inventory compliance.",
    deepDiveActions: [
      "Inventory all cross-origin <script src> and stylesheet inclusions",
      "Check each external script for cryptographic Subresource Integrity (SRI) hashes",
      "Evaluate third-party script trust domains (CDNs, analytics, payment widgets)",
      "Generate PCI-DSS v4.0 Req 6.4.3 / OWASP A08 client-side script integrity evidence"
    ],
    permissions: ["dom.sri.audit", "supplychain.scripts.inspect"],
    status: "ACTIVE"
  },

  // ── BRAIN STAGE 3: 3. PLAN (Adaptive Risk-Based EPSS v4, CISA KEV & WSTG v4.2 Test Planner) ──
  {
    id: "plugin-301-epss-kev-threat-prioritizer",
    code: "EXP-PLG-301",
    name: "FIRST EPSS v4 & CISA Known Exploited Vulnerabilities (KEV) Prioritizer",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 3,
    brainStageName: "3. PLAN",
    category: "Adaptive Test Planning",
    engineModule: "AI",
    estimatedMinutes1HrMode: 2.0,
    standards: "FIRST EPSS v4 · CISA BOD 22-01 KEV · NIST SP 800-115 §4",
    description:
      "Correlates fingerprinted server/framework versions and spidered endpoints against FIRST Exploit Prediction Scoring System (EPSS v4) probabilities and the CISA KEV catalog to prioritize high-risk checks.",
    deepDiveActions: [
      "Score discovered services and endpoints by FIRST EPSS v4 exploit probability",
      "Cross-reference server/runtime banners against CISA KEV active exploitation catalog",
      "Rank spidered routes by attack surface complexity (forms, query params, auth state)",
      "Emit prioritized test execution queue for Stage 4 engines"
    ],
    permissions: ["ai.epss.score", "threat.kev.lookup"],
    status: "ACTIVE"
  },
  {
    id: "plugin-302-wstg-asvs-test-matrix-generator",
    code: "EXP-PLG-302",
    name: "OWASP WSTG v4.2 (91 Tests) & ASVS v4.0.3 Dynamic Test Plan Synthesizer",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 3,
    brainStageName: "3. PLAN",
    category: "Adaptive Test Planning",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.5,
    standards: "OWASP WSTG v4.2 · OWASP ASVS v4.0.3 L2/L3",
    description:
      "Synthesizes a custom per-endpoint OWASP WSTG v4.2 (INFO, CONF, IDNT, ATHN, ATHZ, SESS, INPV, ERRH, CRYP, BUSL, CLNT, APIT) and ASVS v4.0.3 test plan for every spidered URL.",
    deepDiveActions: [
      "Map all 12 OWASP WSTG v4.2 categories to discovered customer URLs and forms",
      "Bind ASVS v4.0.3 V1–V14 verification controls to each endpoint type",
      "Select passive and safe non-destructive active checks per parameter",
      "Log full test coverage matrix into the Autonomous Brain ledger"
    ],
    permissions: ["ai.plan.wstg", "ai.plan.asvs"],
    status: "ACTIVE"
  },
  {
    id: "plugin-303-api-top10-bola-test-planner",
    code: "EXP-PLG-303",
    name: "OWASP API Security Top 10 (2023) Object & Function Level Test Planner",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 3,
    brainStageName: "3. PLAN",
    category: "Adaptive Test Planning",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.5,
    standards: "OWASP API Top 10:2023 (API1–API10) · MITRE ATLAS",
    description:
      "Builds targeted test plans for REST, GraphQL, and JSON endpoints covering API1:2023 BOLA, API2 Broken Auth, API3 Property Auth, API5 BFLA, API7 SSRF, API8 Misconfiguration, and API9 Improper Inventory.",
    deepDiveActions: [
      "Identify object ID patterns (numeric IDs, UUIDs, slugs) across spidered routes",
      "Plan role-differential authorization checks (Admin vs. User vs. Guest)",
      "Schedule CORS, HTTP method (OPTIONS/PUT/DELETE), and rate-header checks",
      "Include AI/LLM prompt boundary checks if AI endpoints are detected"
    ],
    permissions: ["ai.plan.api10", "ai.plan.role_diff"],
    status: "ACTIVE"
  },
  {
    id: "plugin-304-rate-limit-waf-safe-scheduler",
    code: "EXP-PLG-304",
    name: "Commercial Rate-Limiter, WAF-Safe Pacing & RoE Guardrail Scheduler",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 3,
    brainStageName: "3. PLAN",
    category: "Adaptive Test Planning",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.0,
    standards: "PTES P1 RoE · NIST SP 800-115 §2.3 · Safe DAST Governance",
    description:
      "Enforces Rules of Engagement (RoE) safety guardrails, non-destructive probe constraints, adaptive request pacing, and commercial 1-hour deep-dive scheduling across all target hosts.",
    deepDiveActions: [
      "Verify target scope authorization & enforce non-destructive probe guardrails",
      "Calibrate request concurrency and jitter to avoid service degradation",
      "Configure stage-by-stage timing across Fast, Standard, Deep, or 1-Hr Commercial modes",
      "Arm circuit-breaker monitors for target latency and HTTP 429/503 responses"
    ],
    permissions: ["scheduler.rate_limit", "roe.guardrails.enforce"],
    status: "ACTIVE"
  },

  // ── BRAIN STAGE 4: 4. EXECUTE (Exhaustive Dynamic Security & WSTG/ASVS Active/Passive Audit) ──
  {
    id: "plugin-401-wstg-security-headers-deep-auditor",
    code: "EXP-PLG-401",
    name: "OWASP WSTG Deep HTTP Security Header & Directive Auditor",
    version: "5.4.0",
    author: "TrePath™ DAST Engine",
    brainStage: 4,
    brainStageName: "4. EXECUTE",
    category: "Active & Passive DAST",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 4.0,
    standards: "OWASP WSTG-CONF-07 · ASVS V14.4 · OWASP A05:2021",
    description:
      "Executes deep directive-level analysis of HSTS (max-age, includeSubDomains, preload), CSP (script-src, unsafe-inline, unsafe-eval, frame-ancestors, object-src), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and COOP/CORP across all spidered pages.",
    deepDiveActions: [
      "Audit Content-Security-Policy directives for unsafe-inline, unsafe-eval & wildcard sources",
      "Verify Strict-Transport-Security max-age >= 31536000 and includeSubDomains",
      "Check X-Frame-Options / CSP frame-ancestors clickjacking protection on all spidered pages",
      "Inspect X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy & COOP"
    ],
    permissions: ["dast.headers.audit", "dast.directives.parse"],
    status: "ACTIVE"
  },
  {
    id: "plugin-402-cors-origin-reflection-auditor",
    code: "EXP-PLG-402",
    name: "CORS Origin Reflection, Null-Origin & Wildcard Credentials Auditor",
    version: "5.4.0",
    author: "TrePath™ DAST Engine",
    brainStage: 4,
    brainStageName: "4. EXECUTE",
    category: "Active & Passive DAST",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 3.5,
    standards: "OWASP WSTG-CLNT-07 · ASVS V14.5.3 · CWE-942",
    description:
      "Tests Cross-Origin Resource Sharing (CORS) policies by sending controlled Origin headers and OPTIONS preflight probes to detect arbitrary Origin reflection with Access-Control-Allow-Credentials: true.",
    deepDiveActions: [
      "Send controlled Origin probe (https://audit-probe.expeditestrike.io) to target endpoints",
      "Inspect Access-Control-Allow-Origin and Access-Control-Allow-Credentials headers",
      "Execute HTTP OPTIONS preflight audit to enumerate allowed HTTP methods",
      "Flag permissive CORS configurations (CWE-942) with exact HTTP transcript proof"
    ],
    permissions: ["dast.cors.probe", "dast.options.probe"],
    status: "ACTIVE"
  },
  {
    id: "plugin-403-injection-input-vector-auditor",
    code: "EXP-PLG-403",
    name: "Injection Surface & Parameter Reflection Auditor (SQLi / XSS / SSTI / CMDi)",
    version: "5.4.0",
    author: "TrePath™ DAST Engine",
    brainStage: 4,
    brainStageName: "4. EXECUTE",
    category: "Active & Passive DAST",
    engineModule: "ZAP",
    estimatedMinutes1HrMode: 4.5,
    standards: "OWASP A03:2021 · WSTG-INPV-01..12 · MITRE TA0001 T1190",
    description:
      "Audits discovered query parameters, form inputs, and request headers across spidered pages for unencoded reflection, database error signatures, template evaluation, and command injection surfaces.",
    deepDiveActions: [
      "Inspect spidered URL parameters and HTML forms for unvalidated input sinks",
      "Check response bodies for SQL/database driver error strings and stack traces (CWE-209)",
      "Evaluate DOM and reflected parameter encoding contexts alongside CSP enforcement",
      "Execute full OWASP ZAP #40018/#40012/#90020 rule matrix on authorized lab targets"
    ],
    permissions: ["dast.input.audit", "dast.zap.active"],
    status: "ACTIVE"
  },
  {
    id: "plugin-404-bola-bfla-ssrf-api-auditor",
    code: "EXP-PLG-404",
    name: "Broken Object/Function Authorization (BOLA/BFLA) & SSRF Webhook Auditor",
    version: "5.4.0",
    author: "TrePath™ DAST Engine",
    brainStage: 4,
    brainStageName: "4. EXECUTE",
    category: "Active & Passive DAST",
    engineModule: "BURP",
    estimatedMinutes1HrMode: 4.0,
    standards: "OWASP API1/API5/API7:2023 · A10:2021 SSRF · MITRE TA0011",
    description:
      "Audits API endpoints and spidered routes for Broken Object Level Authorization (BOLA/IDOR), Broken Function Level Authorization (BFLA), and Server-Side Request Forgery (SSRF) URL/webhook parameters.",
    deepDiveActions: [
      "Audit API object reference parameters (?id=, /users/{id}, /orders/{id}) for BOLA/IDOR",
      "Check administrative and diagnostic paths (/admin, /api/export, /actuator) for BFLA",
      "Inspect URL/webhook/callback parameters for SSRF reachability",
      "Correlate Burp Collaborator OOB and OpenVAS NVT telemetry"
    ],
    permissions: ["dast.api.bola", "dast.burp.ssrf"],
    status: "ACTIVE"
  },

  // ── BRAIN STAGE 5: 5. VALIDATE (Independent Zero-False-Positive Verification Engine) ──
  {
    id: "plugin-501-differential-response-verifier",
    code: "EXP-PLG-501",
    name: "Differential HTTP Status, Header & DOM Hash Replay Verifier",
    version: "5.4.0",
    author: "TrePath™ Verification Brain",
    brainStage: 5,
    brainStageName: "5. VALIDATE",
    category: "Zero-FP Verification",
    engineModule: "POST_EXPLOIT",
    estimatedMinutes1HrMode: 2.5,
    standards: "PTES P5 · NIST SP 800-115 §5 · Zero False-Positive Standard",
    description:
      "Independently replays candidate findings and compares baseline vs. test HTTP status codes, header sets, and DOM structural hashes to guarantee 0% false positives before reporting.",
    deepDiveActions: [
      "Replay HTTP probe requests to confirm deterministic reproducibility",
      "Compare baseline vs. probe status codes, headers, and response body lengths",
      "Filter out generic SPA 200-OK soft-404 catch-all pages",
      "Promote only deterministically verified findings to CONFIRMED status"
    ],
    permissions: ["verify.differential.replay", "verify.fp.filter"],
    status: "VERIFIED"
  },
  {
    id: "plugin-502-oob-oast-callback-verifier",
    code: "EXP-PLG-502",
    name: "Out-of-Band (OAST) DNS/HTTP Callback & Blind Vector Verifier",
    version: "5.4.0",
    author: "TrePath™ Verification Brain",
    brainStage: 5,
    brainStageName: "5. VALIDATE",
    category: "Zero-FP Verification",
    engineModule: "BURP",
    estimatedMinutes1HrMode: 2.0,
    standards: "OWASP WSTG-INPV-19 · MITRE TA0011 T1071.001",
    description:
      "Validates asynchronous and blind security findings via Out-of-Band Application Security Testing (OAST) DNS and HTTP callback correlation.",
    deepDiveActions: [
      "Correlate unique OAST interaction IDs with originating request parameters",
      "Verify DNS A/TXT and HTTP callback timestamps and source IPs",
      "Attach cryptographic OAST proof transcripts to verified findings",
      "Eliminate unconfirmed speculative blind alerts"
    ],
    permissions: ["verify.oast.correlate"],
    status: "VERIFIED"
  },
  {
    id: "plugin-503-sandbox-browser-dom-verifier",
    code: "EXP-PLG-503",
    name: "Headless DOM Sink, CSP Bypass & Clickjacking Frameability Verifier",
    version: "5.4.0",
    author: "TrePath™ Verification Brain",
    brainStage: 5,
    brainStageName: "5. VALIDATE",
    category: "Zero-FP Verification",
    engineModule: "POST_EXPLOIT",
    estimatedMinutes1HrMode: 2.0,
    standards: "OWASP WSTG-CLNT-01/09 · CWE-1021 · CWE-79",
    description:
      "Verifies client-side security controls including iframe embeddability (Clickjacking CWE-1021), CSP script execution policies, and DOM sink reachability across spidered pages.",
    deepDiveActions: [
      "Verify whether target pages can be framed in an external cross-origin <iframe>",
      "Confirm absence of both X-Frame-Options and CSP frame-ancestors before alerting",
      "Validate cookie exposure to document.cookie when HttpOnly is omitted",
      "Generate interactive HTML PoC harness for verified client-side findings"
    ],
    permissions: ["verify.dom.sandbox", "verify.clickjacking"],
    status: "VERIFIED"
  },
  {
    id: "plugin-504-sha256-evidence-chain-signer",
    code: "EXP-PLG-504",
    name: "Cryptographic SHA-256 HTTP Transcript & Evidence Chain-of-Custody Signer",
    version: "5.4.0",
    author: "TrePath™ Verification Brain",
    brainStage: 5,
    brainStageName: "5. VALIDATE",
    category: "Zero-FP Verification",
    engineModule: "POST_EXPLOIT",
    estimatedMinutes1HrMode: 1.5,
    standards: "ISO/IEC 27037 Digital Evidence · SOC 2 · PCI-DSS v4.0",
    description:
      "Captures verbatim HTTP request/response headers, HTML excerpts, and reproduction commands for every verified finding and signs them with a tamper-evident SHA-256 chain-of-custody hash.",
    deepDiveActions: [
      "Capture verbatim HTTP/1.1 status line, response headers, and DOM excerpt",
      "Generate copy-pasteable curl reproduction command for each finding",
      "Compute SHA-256 integrity digest across request/response evidence bundle",
      "Seal evidence artifacts for compliance audit inspection"
    ],
    permissions: ["evidence.sha256.sign", "evidence.custody.log"],
    status: "VERIFIED"
  },

  // ── BRAIN STAGE 6: 6. CORRELATE (Multi-Hop Attack-Path Graph & Systemic Root-Cause Engine) ──
  {
    id: "plugin-601-attack-path-killchain-correlator",
    code: "EXP-PLG-601",
    name: "Multi-Hop Attack-Path Graph & MITRE ATT&CK® v15 Kill-Chain Correlator",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 6,
    brainStageName: "6. CORRELATE",
    category: "Correlation & Root-Cause",
    engineModule: "AI",
    estimatedMinutes1HrMode: 2.0,
    standards: "MITRE ATT&CK® Enterprise v15 (TA0043–TA0040)",
    description:
      "Chains individual findings across spidered endpoints (e.g. missing CSP + missing HttpOnly cookie + permissive CORS + exposed endpoint) into compound multi-step attack paths.",
    deepDiveActions: [
      "Construct directed attack-path graph across all spidered customer URLs",
      "Map each finding to MITRE ATT&CK® v15 Tactics (TA0043 Recon through TA0040 Impact)",
      "Calculate compound exploitability when multiple defense-in-depth headers are absent",
      "Highlight critical choke points that break the entire attack chain when fixed"
    ],
    permissions: ["ai.correlate.attack_graph", "ai.mitre.map"],
    status: "VERIFIED"
  },
  {
    id: "plugin-602-cwe-nist-ssdf-root-cause-clusterer",
    code: "EXP-PLG-602",
    name: "CWE & NIST SP 800-218 (SSDF) Systemic Root-Cause Clustering Engine",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 6,
    brainStageName: "6. CORRELATE",
    category: "Correlation & Root-Cause",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.5,
    standards: "MITRE CWE · NIST SP 800-218 (SSDF) · OWASP SAMM",
    description:
      "Groups individual findings across dozens of spidered URLs into unified systemic root-cause clusters (e.g. Edge Response Header Middleware, Cookie Session Configuration, DNS Mail Policy) so engineers fix the root cause once.",
    deepDiveActions: [
      "Cluster per-URL findings by underlying CWE and architectural layer",
      "Map each cluster to NIST SP 800-218 (SSDF) secure development practices (PW.4, PW.6, PW.8)",
      "Eliminate duplicate remediation noise across spidered sub-pages",
      "Prioritize single-point architectural fixes with highest risk reduction"
    ],
    permissions: ["ai.cluster.root_cause", "ai.ssdf.map"],
    status: "VERIFIED"
  },
  {
    id: "plugin-603-14-framework-compliance-mapper",
    code: "EXP-PLG-603",
    name: "14-Framework Compliance Crosswalk Plugin (OWASP, PCI-DSS v4.0, SOC 2, ISO 27001)",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 6,
    brainStageName: "6. CORRELATE",
    category: "Correlation & Root-Cause",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.5,
    standards: "OWASP Top 10 · WSTG · ASVS · API10 · PCI-DSS v4.0 · SOC 2 · ISO 27001",
    description:
      "Cross-maps every verified finding and spidered asset across all 14 supported cybersecurity standards, generating audit-ready compliance matrices.",
    deepDiveActions: [
      "Cross-reference findings to OWASP Top 10:2021 (A01–A10) and API Top 10:2023",
      "Map controls to PCI-DSS v4.0 (Req 6.2, 6.4.1, 6.4.3), SOC 2 CC6/CC7, and ISO 27001 A.8",
      "Populate the Uncertainty & Coverage Ledger (Confirmed, Suspected, Safe-Skipped)",
      "Synthesize executive compliance readiness metrics"
    ],
    permissions: ["ai.compliance.crosswalk"],
    status: "VERIFIED"
  },
  {
    id: "plugin-604-cvss4-epss-blast-radius-calculator",
    code: "EXP-PLG-604",
    name: "CVSS v3.1 / v4.0 Environmental & Blast-Radius Risk Calculator",
    version: "5.4.0",
    author: "TrePath™ AI Brain",
    brainStage: 6,
    brainStageName: "6. CORRELATE",
    category: "Correlation & Root-Cause",
    engineModule: "AI",
    estimatedMinutes1HrMode: 1.0,
    standards: "FIRST CVSS v3.1 & v4.0 · FIRST EPSS v4",
    description:
      "Computes overall 0–100 Security Posture Score, Letter Grade (A+ to F), and 5-Pillar Executive Benchmark across Transport/TLS, HTTP Headers, Cookie/CORS, Application/API Surface, and DNS/Email Security.",
    deepDiveActions: [
      "Compute environmental CVSS v3.1 and v4.0 vector strings for each finding",
      "Calculate 5-Pillar security posture scores from live HTTP and DNS telemetry",
      "Assign overall A+ to F letter grade for executive benchmarking",
      "Project post-remediation score improvement (98/100 · Grade A+)"
    ],
    permissions: ["ai.risk.cvss", "ai.scorecard.compute"],
    status: "VERIFIED"
  },

  // ── BRAIN STAGE 7: 7. REPORT (Commercial Executive & Engineering Dossier Compiler) ──
  {
    id: "plugin-701-white-label-executive-dossier-builder",
    code: "EXP-PLG-701",
    name: "White-Label Executive & Board Security Dossier Generator",
    version: "5.4.0",
    author: "TrePath™ Reporting Engine",
    brainStage: 7,
    brainStageName: "7. REPORT",
    category: "Dossier & Virtual Patching",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 2.0,
    standards: "PTES P7 · NIST SP 800-115 §6 · Executive Audit Dossier",
    description:
      "Compiles the comprehensive on-screen and printable PDF/HTML penetration testing dossier contextualized 100% to the customer's scanned URLs, spidered sub-pages, and organization branding.",
    deepDiveActions: [
      "Bind Client Organization Name, Lead Assessor, Engagement ID & Classification Banner",
      "Contextualize all tables, walkthroughs, and appendices to the customer's scanned URLs",
      "Include complete Deep Spider Inventory (all crawled sub-pages, forms, params, scripts)",
      "Format print-ready HTML/PDF layout with page-break controls and executive summary"
    ],
    permissions: ["report.dossier.build", "report.pdf.print"],
    status: "VERIFIED"
  },
  {
    id: "plugin-702-sarif-csv-json-siem-exporter",
    code: "EXP-PLG-702",
    name: "OASIS SARIF v2.1.0, CSV & JSON SIEM Telemetry Exporter",
    version: "5.4.0",
    author: "TrePath™ Reporting Engine",
    brainStage: 7,
    brainStageName: "7. REPORT",
    category: "Dossier & Virtual Patching",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.5,
    standards: "OASIS SARIF v2.1.0 · Splunk / Sentinel / GitHub Security",
    description:
      "Exports all verified findings, CWE/OWASP mappings, HTTP transcripts, and remediation steps in OASIS SARIF v2.1.0 JSON and Executive CSV formats.",
    deepDiveActions: [
      "Serialize verified findings into OASIS SARIF v2.1.0 schema with rule descriptors",
      "Generate spreadsheet-ready CSV with CVSS, CWE, OWASP, URL, and Retest status",
      "Include SHA-256 verification hashes and timestamped evidence",
      "Enable one-click download directly from the Report tab"
    ],
    permissions: ["report.export.sarif", "report.export.csv"],
    status: "VERIFIED"
  },
  {
    id: "plugin-703-waf-modsec-cloudflare-patch-generator",
    code: "EXP-PLG-703",
    name: "Automated Nginx, ModSecurity CRS & Cloudflare WAF Virtual Patch Generator",
    version: "5.4.0",
    author: "TrePath™ Reporting Engine",
    brainStage: 7,
    brainStageName: "7. REPORT",
    category: "Dossier & Virtual Patching",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.5,
    standards: "OWASP ModSecurity CRS · Cloudflare WAF · Next.js / Nginx Hardening",
    description:
      "Synthesizes copy-pasteable production configuration snippets (Next.js next.config.js headers, Nginx add_header blocks, Cloudflare Transform Rules, and ModSecurity SecRules) tailored to the customer's host.",
    deepDiveActions: [
      "Generate strict CSP, HSTS, X-Frame-Options, and Permissions-Policy header blocks",
      "Produce ModSecurity CRS and Cloudflare WAF expressions for injection/SSRF protection",
      "Provide DNS TXT records for SPF (v=spf1) and DMARC (v=DMARC1; p=reject)",
      "Attach remediation code snippets to every finding card and modal"
    ],
    permissions: ["report.waf.generate", "report.patch.synthesize"],
    status: "VERIFIED"
  },
  {
    id: "plugin-704-jira-github-servicenow-ticket-formatter",
    code: "EXP-PLG-704",
    name: "One-Click Jira, GitHub Issues & ServiceNow Remediation Ticket Formatter",
    version: "5.4.0",
    author: "TrePath™ Reporting Engine",
    brainStage: 7,
    brainStageName: "7. REPORT",
    category: "Dossier & Virtual Patching",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.0,
    standards: "Agile SecOps · Jira / GitHub Issues / ServiceNow",
    description:
      "Formats any finding into a complete Markdown engineering ticket containing severity, CVSS/CWE, affected customer URL, cURL reproduction command, raw HTTP response, and remediation code.",
    deepDiveActions: [
      "Format structured Markdown ticket with reproduction steps and HTTP evidence",
      "Include cURL verification command and expected post-patch behavior",
      "Support one-click clipboard copy for Jira, GitHub Issues, or Azure DevOps",
      "Link ticket status to Stage 8 Retest tracker"
    ],
    permissions: ["tickets.markdown.format", "clipboard.write"],
    status: "VERIFIED"
  },

  // ── BRAIN STAGE 8: 8. RETEST (Automated Post-Remediation Regression & MITRE D3FEND™ Verifier) ──
  {
    id: "plugin-801-live-remediation-retest-prober",
    code: "EXP-PLG-801",
    name: "Live Outbound Post-Patch HTTP/TLS & Header Regression Prober",
    version: "5.4.0",
    author: "TrePath™ D3FEND Brain",
    brainStage: 8,
    brainStageName: "8. RETEST",
    category: "D3FEND Retest & Regression",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 2.0,
    standards: "PTES P7 Retest · NIST SP 800-115 §6 · Continuous Verification",
    description:
      "Executes live outbound retest probes against the customer's URLs after engineering deploys a patch or WAF rule, verifying HTTP status, latency, and updated security headers in real time.",
    deepDiveActions: [
      "Re-probe customer URL via /api/engine/scan with live HTTP/TLS handshake",
      "Verify newly deployed CSP, HSTS, X-Frame-Options, or CORS headers",
      "Record live response latency and updated security grade (A+ / 98)",
      "Transition finding state from OPEN to VERIFIED_FIXED"
    ],
    permissions: ["retest.live.probe", "retest.status.update"],
    status: "VERIFIED"
  },
  {
    id: "plugin-802-mitre-d3fend-countermeasure-verifier",
    code: "EXP-PLG-802",
    name: "MITRE D3FEND™ Defensive Countermeasure & Hardening Verifier",
    version: "5.4.0",
    author: "TrePath™ D3FEND Brain",
    brainStage: 8,
    brainStageName: "8. RETEST",
    category: "D3FEND Retest & Regression",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.5,
    standards: "MITRE D3FEND™ Matrix (D3-SPP · D3-IVV · D3-NI · D3-ACH)",
    description:
      "Validates that defensive countermeasures align with MITRE D3FEND™ techniques including Credential Hardening, Input Validation, Application Configuration Hardening, and Network Isolation.",
    deepDiveActions: [
      "Verify MITRE D3FEND™ countermeasure alignment for each remediated CWE",
      "Confirm virtual WAF rules or code-level fixes block the original test vector",
      "Ensure zero regression across spidered sub-pages",
      "Log D3FEND verification telemetry into the Retest Sign-Off Matrix"
    ],
    permissions: ["retest.d3fend.verify"],
    status: "VERIFIED"
  },
  {
    id: "plugin-803-ci-cd-regression-gate-generator",
    code: "EXP-PLG-803",
    name: "CI/CD GitHub Actions & GitLab DAST Regression Gate Generator",
    version: "5.4.0",
    author: "TrePath™ D3FEND Brain",
    brainStage: 8,
    brainStageName: "8. RETEST",
    category: "D3FEND Retest & Regression",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.0,
    standards: "NIST SP 800-218 (SSDF) PW.8 · OWASP SAMM Verification",
    description:
      "Generates automated cURL and CI/CD regression assertions so every future deployment automatically verifies security headers, cookie flags, and endpoint access controls.",
    deepDiveActions: [
      "Synthesize automated cURL header and status-code regression assertions",
      "Bind regression checks to every spidered route in the customer scope",
      "Prevent re-introduction of remediated vulnerabilities in future releases",
      "Export regression suite in the Printable Dossier Appendix"
    ],
    permissions: ["retest.cicd.generate"],
    status: "VERIFIED"
  },
  {
    id: "plugin-804-retest-certificate-signoff-ledger",
    code: "EXP-PLG-804",
    name: "Cryptographic Retest Sign-Off Certificate & Compliance Audit Ledger",
    version: "5.4.0",
    author: "TrePath™ D3FEND Brain",
    brainStage: 8,
    brainStageName: "8. RETEST",
    category: "D3FEND Retest & Regression",
    engineModule: "REPORT",
    estimatedMinutes1HrMode: 1.0,
    standards: "SOC 2 Type II · PCI-DSS v4.0 · ISO/IEC 27001:2022 Sign-Off",
    description:
      "Issues cryptographic verification hashes (d3fend-sha256-...) and ISO-8601 timestamps for every verified fix, updating the executive remediation progress bar to 100%.",
    deepDiveActions: [
      "Generate unique d3fend-sha256 verification hash upon successful retest",
      "Record ISO-8601 verification timestamp and assessor sign-off note",
      "Update live Executive Scorecard to 98/100 (Grade A+) when all findings are fixed",
      "Persist sign-off ledger into the Printable Compliance Dossier"
    ],
    permissions: ["retest.signoff.issue", "ledger.audit.write"],
    status: "VERIFIED"
  }
];

export {
  THOUSAND_VULN_PLUGINS,
  THOUSAND_PLUGINS_SUMMARY,
  matchPluginsForFinding,
  buildMitreNavigatorLayerJson,
  buildBlueTeamSiemAndWafPack,
  type PluginScannerFamily,
  type FindingPluginCorrelation,
  type ThousandVulnPlugin,
  type MitreTtpMapping,
  type BlueTeamDefenseMapping
} from "./thousandPluginsCatalog";

