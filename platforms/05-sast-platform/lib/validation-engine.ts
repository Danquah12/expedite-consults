export type ValidationStatus =
  | "confirmed"
  | "inconclusive"
  | "not_reproduced"
  | "blocked"
  | "not_applicable";

export type GroundTruthCategory =
  | "actually_vulnerable"
  | "safely_mitigated"
  | "unreachable_or_inactive"
  | "insufficient_context";

export type LifecycleStageKey =
  | "preflight"
  | "assess"
  | "plan"
  | "execute"
  | "verify";

export type ProofRequirementCheck = {
  requirement:
    | "Source provenance"
    | "Sink reachability"
    | "Security control"
    | "Behavioral proof"
    | "Alternative explanations"
    | "Reproducibility";
  question: string;
  satisfied: boolean;
  evidenceSummary: string;
  sourceType: "AST" | "DataFlow" | "XTRIKE-Trace Trace" | "App Log" | "Controlled Check";
};

export type EvidenceArtifact = {
  evidenceId: string;
  kind: "SARIF Trace" | "AST Guard Check" | "Controlled HTTP Exchange" | "XTRIKE-Trace Span" | "Audit Log";
  summary: string;
  sha256Checksum: string;
  commitSha: string;
  timestamp: string;
};

export type CanonicalValidationFinding = {
  // 1. Identity
  findingId: string;
  scanner: "XTRIKE XQL" | "XTRIKE DeepFlow" | "XTRIKE StructSCA" | "XTRIKE AST-Query" | "XTRIKE PatternGuard" | "XTRIKE DepGuard" | "XTRIKE GraphCPG";
  ruleId: string;
  cwe: string;
  cweTitle: string;
  title: string;
  validatorPriority: 1 | 2 | 3 | 4 | 5;
  validatorName: string;

  // 2. Source
  repository: string;
  commitSha: string;
  buildCommitSha: string;
  filePath: string;
  startLine: number;
  endLine: number;
  functionName: string;
  language: string;
  framework: string;

  // 3. Data flow
  sourceExpr: string;
  intermediateCalls: string[];
  sinkExpr: string;
  sanitizersDetected: string[];
  traceProvenance: string;

  // 4. Runtime
  buildId: string;
  endpoint: string;
  httpMethod: "GET" | "POST" | "PUT" | "DELETE";
  authContext: string;

  // 5. Preconditions
  requiredConfig: string[];
  permissions: string[];
  dependencies: string[];
  featureFlags: string[];

  // 6. Validation Lifecycle (1. Preflight -> 2. Assess -> 3. Plan -> 4. Execute -> 5. Verify)
  lifecycle: Record<
    LifecycleStageKey,
    {
      label: string;
      deterministic: boolean;
      status: "pass" | "fail" | "warn" | "blocked";
      summary: string;
      detail: string;
      durationMs: number;
    }
  >;

  // 7. Evidence & Proof Contract
  evidence: EvidenceArtifact[];
  proofContract: ProofRequirementCheck[];

  // 8. Assessment (status strictly separated from evidenceConfidence)
  status: ValidationStatus;
  evidenceConfidence: number; // 0.0 - 1.0
  groundTruthCategory: GroundTruthCategory;
  impact: string;
  rationale: string;
  unresolvedAssumptions: string[];
  limitations: string[];
  reproducible: boolean;
  runtimeCostMs: number;
  requestsSent: number;

  // 9. Remediation & Regression
  rootCause: string;
  suggestedFix: string;
  regressionTest: string;

  // Original scanner SARIF snippet preserved verbatim
  rawSarifRecord: {
    schemaVersion: "2.1.0";
    toolDriver: string;
    ruleId: string;
    level: "error" | "warning";
    physicalLocation: string;
    codeFlowsCount: number;
  };
};

export const PIPELINE_ARCHITECTURE_STAGES = [
  {
    code: "A",
    title: "SAST Ingestion",
    subtitle: "SARIF 2.1.0 / JSON · Rule IDs · Locations · Traces",
    deterministic: true,
    tech: "XTRIKE-Schema + SARIF 2.1.0",
    description:
      "Ingests raw static analysis reports from XTRIKE AST-Query, XTRIKE PatternGuard, and XTRIKE XQL while preserving the original rule, physical location, and codeFlow trace verbatim.",
  },
  {
    code: "B",
    title: "Normalization & Code Intelligence",
    subtitle: "Repo Map · AST · Call Graph · Taint · Build Commit SHA",
    deterministic: true,
    tech: "XTRIKE-CST / XTRIKE AST-Query / Language Adapters",
    description:
      "Maps findings into a CanonicalFinding record bound to an exact commit_sha, resolving framework routes, middleware guards, and call-graph reachability.",
  },
  {
    code: "C",
    title: "Validation Planner",
    subtitle: "CWE Priority 1–5 · Preconditions · Scope & Stop Rules",
    deterministic: true,
    tech: "Policy-Gated Planner + Template Selector",
    description:
      "Selects the registered CWE validator, verifies scope and build identity, checks prerequisites, and schedules controlled verification steps.",
  },
  {
    code: "D1",
    title: "Static Validator",
    subtitle: "Data Flow · Call Sites · Sanitizer Guards · Safe Sinks",
    deterministic: true,
    tech: "Language AST & Taint Verifier",
    description:
      "Verifies whether untrusted input crosses an active call path into a sensitive sink without parameterization, type coercion, or context encoding.",
  },
  {
    code: "D2",
    title: "Runtime Validator",
    subtitle: "Controlled HTTP/API Checks · Role Matrix · XTRIKE-Trace Spans",
    deterministic: true,
    tech: "XTRIKE-HTTP + XTRIKE-DOM + XTRIKE-Trace",
    description:
      "Executes non-destructive comparison checks in an isolated disposable container, recording HTTP exchanges, XTRIKE-Trace spans, and database driver logs.",
  },
  {
    code: "E",
    title: "Independent Evidence Verifier",
    subtitle: "6-Point Proof Contract · Reproducibility · Alternatives",
    deterministic: true,
    tech: "ProofContract Engine (Status ≠ Confidence)",
    description:
      "Independently evaluates whether collected artifacts satisfy the finding-specific proof contract on the exact tested commit before permitting CONFIRMED status.",
  },
  {
    code: "F",
    title: "Findings & Remediation",
    subtitle: "Evidence-Backed Status · Patch Diff · pytest Regression",
    deterministic: false,
    tech: "AI-Assisted Synthesis + pytest Runner",
    description:
      "Pairs the verified status and evidence bundle with a minimal code fix and a deterministic regression test that re-verifies the patch.",
  },
] as const;

export const PRIORITY_VALIDATOR_SPECS = [
  {
    priority: 1,
    name: "Authorization & Access Control Validator",
    cwes: ["CWE-285", "CWE-862", "CWE-639"],
    target: "Role matrix & resource ownership boundaries",
    proofSummary:
      "Compares permitted vs. unprivileged test principals on test-owned resources and verifies actual state/record access rather than HTTP status codes alone.",
  },
  {
    priority: 2,
    name: "SQL Query Structure & Parameterization Validator",
    cwes: ["CWE-89"],
    target: "Prepared statements, ORM bindings, and DB driver AST",
    proofSummary:
      "Traces input into query construction, checks parameter binding tokens, and verifies query structure telemetry against a disposable test database.",
  },
  {
    priority: 3,
    name: "Rendering Context & Output Encoding Validator",
    cwes: ["CWE-79"],
    target: "DOM/template sink context and encoding pipeline",
    proofSummary:
      "Traces untrusted data to its rendering context, inspects auto-escaping/DOMPurify guards, and checks context rendering in an isolated browser.",
  },
  {
    priority: 4,
    name: "Path Canonicalization & File Boundary Validator",
    cwes: ["CWE-22", "CWE-73"],
    target: "Path resolution, realpath normalization, and root prefix checks",
    proofSummary:
      "Traces user path segments through normalization checks and verifies containment against harmless fixture boundary markers.",
  },
  {
    priority: 5,
    name: "Outbound Policy & Command Guard Validator",
    cwes: ["CWE-918", "CWE-78"],
    target: "RFC-1918 subnet guards, allowlists, and approval gates",
    proofSummary:
      "Enforces strict execution controls and approval gates; verifies private-IP blocks and argument-array isolation using local test fixtures.",
  },
] as const;

export const CANONICAL_VALIDATION_FINDINGS: CanonicalValidationFinding[] = [
  {
    findingId: "VAL-101",
    scanner: "XTRIKE AST-Query",
    ruleId: "py/missing-object-level-authorization",
    cwe: "CWE-862",
    cweTitle: "Missing Authorization (BOLA / IDOR)",
    title: "Cross-Tenant Invoice Read in BillingService",
    validatorPriority: 1,
    validatorName: "Authorization & Access Control Validator",
    repository: "github.com/acme-corp/billing-api",
    commitSha: "a4f92c81e03b4d12",
    buildCommitSha: "a4f92c81e03b4d12",
    filePath: "app/api/routes/invoices.py",
    startLine: 64,
    endLine: 79,
    functionName: "get_invoice_by_id",
    language: "Python",
    framework: "XTRIKE-API + SQLAlchemy",
    sourceExpr: "invoice_id: UUID (Path param)",
    intermediateCalls: [
      "invoices.get_invoice_by_id()",
      "InvoiceRepository.fetch_one(invoice_id)",
      "session.execute(select(Invoice).where(Invoice.id == invoice_id))",
    ],
    sinkExpr: "session.execute() without tenant_id predicate",
    sanitizersDetected: ["Depends(get_current_user) — authenticates caller but omits tenant ownership check"],
    traceProvenance: "SARIF codeFlow #0 + XTRIKE-CST route decorator inspection",
    buildId: "build-2026.10.16-a4f92c81",
    endpoint: "/api/v1/invoices/{invoice_id}",
    httpMethod: "GET",
    authContext: "Role comparison: tenant_a_member vs. tenant_b_owner fixture",
    requiredConfig: ["MULTI_TENANT_MODE=true"],
    permissions: ["invoice:read (authenticated member)"],
    dependencies: ["fastapi==0.115.0", "sqlalchemy==2.0.35"],
    featureFlags: ["billing_v2_enabled"],
    lifecycle: {
      preflight: {
        label: "1. Preflight",
        deterministic: true,
        status: "pass",
        summary: "Scope authorized · commit a4f92c81 matches running container build",
        detail: "Verified repository in authorized_scope, commit_sha == build_commit_sha (a4f92c81e03b4d12), and seeded two disposable test tenants.",
        durationMs: 42,
      },
      assess: {
        label: "2. Assess",
        deterministic: true,
        status: "pass",
        summary: "Route reachable · SQLAlchemy WHERE clause filters by Invoice.id only",
        detail: "Python AST + XTRIKE-CST inspection confirmed Depends(get_current_user) is present, but current_user.tenant_id is never passed to InvoiceRepository.fetch_one().",
        durationMs: 118,
      },
      plan: {
        label: "3. Plan",
        deterministic: true,
        status: "pass",
        summary: "Scheduled P1 Role-Matrix & Resource Ownership comparison (2 principals)",
        detail: "Planned controlled GET on fixture resource INV-TEST-009 owned by Tenant-B using Tenant-A session token. Stop condition: 2 requests max.",
        durationMs: 28,
      },
      execute: {
        label: "4. Execute",
        deterministic: true,
        status: "pass",
        summary: "Tenant-A principal received Tenant-B fixture record (3/3 repeatable runs)",
        detail: "XTRIKE-HTTP recorded HTTP 200 with fixture JSON matching Tenant-B resource checksum; XTRIKE-Trace DB span confirmed query lacked tenant_id filter.",
        durationMs: 310,
      },
      verify: {
        label: "5. Verify",
        deterministic: true,
        status: "pass",
        summary: "6/6 Proof Contract criteria satisfied → Status: CONFIRMED (99% confidence)",
        detail: "IndependentEvidenceVerifier confirmed resource ownership boundary violation across 3 deterministic runs on commit a4f92c81.",
        durationMs: 54,
      },
    },
    evidence: [
      {
        evidenceId: "EV-101-AST",
        kind: "AST Guard Check",
        summary: "XTRIKE-CST verified select(Invoice).where(Invoice.id == invoice_id) omits tenant_id predicate at L74.",
        sha256Checksum: "9f84b2c011e8a34d",
        commitSha: "a4f92c81e03b4d12",
        timestamp: "2026-10-16T19:35:01Z",
      },
      {
        evidenceId: "EV-101-HTTP",
        kind: "Controlled HTTP Exchange",
        summary: "Principal tenant_a_test read fixture INV-TEST-009 (owner: tenant_b_test) in isolated test container.",
        sha256Checksum: "3c17d4a8902bf51e",
        commitSha: "a4f92c81e03b4d12",
        timestamp: "2026-10-16T19:35:02Z",
      },
      {
        evidenceId: "EV-101-OTEL",
        kind: "XTRIKE-Trace Span",
        summary: "DB span trace_id=7b2019ef showed SELECT invoices WHERE invoices.id = $1 with 1 row returned.",
        sha256Checksum: "6a91e044bc8210fa",
        commitSha: "a4f92c81e03b4d12",
        timestamp: "2026-10-16T19:35:02Z",
      },
    ],
    proofContract: [
      {
        requirement: "Source provenance",
        question: "Did the tested input originate from the relevant user-controlled source?",
        satisfied: true,
        evidenceSummary: "Path parameter invoice_id traced directly from XTRIKE-API route handler.",
        sourceType: "DataFlow",
      },
      {
        requirement: "Sink reachability",
        question: "Did the input reach the sensitive operation along an active call path?",
        satisfied: true,
        evidenceSummary: "XTRIKE-Trace span confirmed InvoiceRepository.fetch_one() executed.",
        sourceType: "XTRIKE-Trace Trace",
      },
      {
        requirement: "Security control",
        question: "Was the operation missing an effective authorization or ownership guard?",
        satisfied: true,
        evidenceSummary: "Authentication present, but tenant_id ownership predicate is absent.",
        sourceType: "AST",
      },
      {
        requirement: "Behavioral proof",
        question: "Did controlled test inputs demonstrate unauthorized resource access?",
        satisfied: true,
        evidenceSummary: "Tenant-A principal retrieved Tenant-B fixture record body (not just HTTP 200).",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Alternative explanations",
        question: "Have caching, public resource flags, and mock fallbacks been ruled out?",
        satisfied: true,
        evidenceSummary: "Cache-Control: no-store verified; fixture marked private to Tenant-B.",
        sourceType: "App Log",
      },
      {
        requirement: "Reproducibility",
        question: "Can the behavior be reproduced on the same build and configuration?",
        satisfied: true,
        evidenceSummary: "Reproduced 3/3 times on build-2026.10.16-a4f92c81.",
        sourceType: "Controlled Check",
      },
    ],
    status: "confirmed",
    evidenceConfidence: 0.99,
    groundTruthCategory: "actually_vulnerable",
    impact: "Any authenticated user can read invoice records belonging to other tenants by UUID.",
    rationale:
      "All 6 proof contract requirements satisfied. Both AST analysis and controlled two-tenant role comparison confirm missing tenant scoping.",
    unresolvedAssumptions: [],
    limitations: [],
    reproducible: true,
    runtimeCostMs: 552,
    requestsSent: 3,
    rootCause: "Query predicate filters only on primary key Invoice.id without binding current_user.tenant_id.",
    suggestedFix: `stmt = select(Invoice).where(
    Invoice.id == invoice_id,
    Invoice.tenant_id == current_user.tenant_id,
)`,
    regressionTest: `def test_cross_tenant_invoice_access_denied(client, tenant_a_token, tenant_b_invoice):
    res = client.get(f"/api/v1/invoices/{tenant_b_invoice.id}", headers=tenant_a_token)
    assert res.status_code == 404`,
    rawSarifRecord: {
      schemaVersion: "2.1.0",
      toolDriver: "XTRIKE AST-Query 2.19.1",
      ruleId: "py/missing-object-level-authorization",
      level: "error",
      physicalLocation: "app/api/routes/invoices.py:64:5",
      codeFlowsCount: 1,
    },
  },
  {
    findingId: "VAL-102",
    scanner: "XTRIKE PatternGuard",
    ruleId: "java.spring.jdbc-raw-query-concat",
    cwe: "CWE-89",
    cweTitle: "SQL Injection",
    title: "Unparameterized Order Search Filter in OrderDao",
    validatorPriority: 2,
    validatorName: "SQL Query Structure & Parameterization Validator",
    repository: "github.com/acme-corp/order-service",
    commitSha: "7d31b904c12e88a1",
    buildCommitSha: "7d31b904c12e88a1",
    filePath: "src/main/java/com/acme/orders/OrderDao.java",
    startLine: 112,
    endLine: 128,
    functionName: "searchOrdersByCode",
    language: "Java",
    framework: "Spring Boot 3.3 + JdbcTemplate",
    sourceExpr: "@RequestParam(\"code\") String orderCode",
    intermediateCalls: [
      "OrderController.searchOrders(orderCode)",
      "OrderService.findMatching(orderCode)",
      "OrderDao.searchOrdersByCode(orderCode)",
    ],
    sinkExpr: "jdbcTemplate.queryForList(sql)",
    sanitizersDetected: [],
    traceProvenance: "XTRIKE AST-Query dataflow + Spring RequestMapping AST resolver",
    buildId: "build-2026.10.16-7d31b904",
    endpoint: "/api/orders/search?code=",
    httpMethod: "GET",
    authContext: "Authenticated test customer token",
    requiredConfig: ["SPRING_PROFILES_ACTIVE=test-isolated"],
    permissions: ["orders:search"],
    dependencies: ["spring-boot-starter-jdbc:3.3.2", "postgresql:42.7.3"],
    featureFlags: [],
    lifecycle: {
      preflight: {
        label: "1. Preflight",
        deterministic: true,
        status: "pass",
        summary: "Scope authorized · commit 7d31b904 verified against disposable Postgres container",
        detail: "Verified commit_sha == build_commit_sha and attached PostgreSQL query structure listener.",
        durationMs: 50,
      },
      assess: {
        label: "2. Assess",
        deterministic: true,
        status: "pass",
        summary: "String concatenation into jdbcTemplate.queryForList() with zero parameter placeholders",
        detail: "AST inspection confirmed sql string is concatenated prior to jdbcTemplate.queryForList(sql) instead of using PreparedStatementSetter or NamedParameterJdbcTemplate.",
        durationMs: 145,
      },
      plan: {
        label: "3. Plan",
        deterministic: true,
        status: "pass",
        summary: "Scheduled P2 Query AST Token & Parameter-Binding comparison check",
        detail: "Planned benign structural comparison inputs against disposable DB with pg_stat_statements AST token logging.",
        durationMs: 31,
      },
      execute: {
        label: "4. Execute",
        deterministic: true,
        status: "pass",
        summary: "Postgres driver telemetry recorded unparameterized SQL AST structure shift",
        detail: "Observed literal interpolation directly in Postgres parse tree instead of $1 bind parameter across 3 test runs.",
        durationMs: 390,
      },
      verify: {
        label: "5. Verify",
        deterministic: true,
        status: "pass",
        summary: "6/6 Proof Contract criteria satisfied → Status: CONFIRMED (99% confidence)",
        detail: "IndependentEvidenceVerifier confirmed unparameterized query construction and driver-level parse tree proof.",
        durationMs: 49,
      },
    },
    evidence: [
      {
        evidenceId: "EV-102-AST",
        kind: "SARIF Trace",
        summary: "BinaryExpression (+) concatenates orderCode into String sql at OrderDao.java:118.",
        sha256Checksum: "4d90e12a77c3b801",
        commitSha: "7d31b904c12e88a1",
        timestamp: "2026-10-16T19:35:10Z",
      },
      {
        evidenceId: "EV-102-OTEL",
        kind: "XTRIKE-Trace Span",
        summary: "JDBC span db.statement confirmed zero bind parameters ($1 absent) on executed query.",
        sha256Checksum: "88f12c9400ab412d",
        commitSha: "7d31b904c12e88a1",
        timestamp: "2026-10-16T19:35:12Z",
      },
    ],
    proofContract: [
      {
        requirement: "Source provenance",
        question: "Did the tested input originate from the relevant user-controlled source?",
        satisfied: true,
        evidenceSummary: "Traced from @RequestParam('code') in OrderController.java:44.",
        sourceType: "DataFlow",
      },
      {
        requirement: "Sink reachability",
        question: "Did the input reach the vulnerable query operation?",
        satisfied: true,
        evidenceSummary: "JDBC driver span recorded execution at OrderDao.java:121.",
        sourceType: "XTRIKE-Trace Trace",
      },
      {
        requirement: "Security control",
        question: "Was the query safely parameterized or otherwise protected?",
        satisfied: true,
        evidenceSummary: "No PreparedStatement placeholders (?) or allowlist validation present.",
        sourceType: "AST",
      },
      {
        requirement: "Behavioral proof",
        question: "Did controlled test inputs demonstrate query parse-tree alteration?",
        satisfied: true,
        evidenceSummary: "Postgres parse tree telemetry confirmed input tokens altered predicate structure.",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Alternative explanations",
        question: "Could caching, application errors, or normal business logic explain the result?",
        satisfied: true,
        evidenceSummary: "Distinguished from 500 syntax errors via direct JDBC prepared-parameter inspection.",
        sourceType: "App Log",
      },
      {
        requirement: "Reproducibility",
        question: "Can the behavior be reproduced on the same build and configuration?",
        satisfied: true,
        evidenceSummary: "Reproduced 3/3 times on commit 7d31b904.",
        sourceType: "Controlled Check",
      },
    ],
    status: "confirmed",
    evidenceConfidence: 0.99,
    groundTruthCategory: "actually_vulnerable",
    impact: "Unsanitized query parameter reaches JDBC execution without parameter binding.",
    rationale:
      "Confirmed via both static AST inspection and runtime JDBC parameter-binding telemetry on the exact build commit.",
    unresolvedAssumptions: [],
    limitations: [],
    reproducible: true,
    runtimeCostMs: 665,
    requestsSent: 3,
    rootCause: "Raw string concatenation used with jdbcTemplate.queryForList(sql) instead of parameterized varargs.",
    suggestedFix: `String sql = "SELECT id, order_code, total FROM orders WHERE tenant_id = ? AND order_code = ?";
return jdbcTemplate.queryForList(sql, tenantId, orderCode);`,
    regressionTest: `@Test
void searchOrdersUsesParameterizedQuery() {
    orderDao.searchOrdersByCode(tenantId, "ORD-100");
    verify(jdbcTemplate).queryForList(
        eq("SELECT id, order_code, total FROM orders WHERE tenant_id = ? AND order_code = ?"),
        eq(tenantId),
        eq("ORD-100")
    );
}`,
    rawSarifRecord: {
      schemaVersion: "2.1.0",
      toolDriver: "XTRIKE PatternGuard 1.90.0",
      ruleId: "java.spring.jdbc-raw-query-concat",
      level: "error",
      physicalLocation: "src/main/java/com/acme/orders/OrderDao.java:118:19",
      codeFlowsCount: 1,
    },
  },
  {
    findingId: "VAL-103",
    scanner: "XTRIKE PatternGuard",
    ruleId: "ts.express.ssrf-fetch-sink",
    cwe: "CWE-918",
    cweTitle: "Server-Side Request Forgery (SSRF)",
    title: "Webhook Dispatcher Outbound URL Fetch",
    validatorPriority: 5,
    validatorName: "Outbound Policy & Command Guard Validator",
    repository: "github.com/acme-corp/webhook-gateway",
    commitSha: "c8104f29a91d7e05",
    buildCommitSha: "c8104f29a91d7e05",
    filePath: "src/services/webhookDispatcher.ts",
    startLine: 80,
    endLine: 102,
    functionName: "dispatchWebhook",
    language: "TypeScript",
    framework: "Node.js 22 + Express",
    sourceExpr: "req.body.targetUrl",
    intermediateCalls: [
      "webhookRouter.post('/test')",
      "assertPublicHostnameAndResolve(targetUrl)",
      "dispatchWebhook(validatedUrl)",
    ],
    sinkExpr: "fetch(validatedUrl, { redirect: 'error' })",
    sanitizersDetected: [
      "assertPublicHostnameAndResolve() at L82 — blocks RFC 1918, loopback, link-local 169.254.0.0/16, and pins DNS lookup",
      "redirect: 'error' prevents open-redirect bypass",
    ],
    traceProvenance: "XTRIKE PatternGuard pattern match + TypeScript compiler AST call-graph",
    buildId: "build-2026.10.16-c8104f29",
    endpoint: "/api/webhooks/test",
    httpMethod: "POST",
    authContext: "Workspace admin fixture token",
    requiredConfig: ["EGRESS_POLICY=strict"],
    permissions: ["webhooks:configure"],
    dependencies: ["express@4.21.0", "ipaddr.js@2.2.0"],
    featureFlags: [],
    lifecycle: {
      preflight: {
        label: "1. Preflight",
        deterministic: true,
        status: "pass",
        summary: "Scope authorized · outbound network sandboxed to local loopback callback fixture",
        detail: "Container network restricted; external egress disabled; commit c8104f29 verified.",
        durationMs: 38,
      },
      assess: {
        label: "2. Assess",
        deterministic: true,
        status: "pass",
        summary: "Effective guard detected at L82 (ipaddr.js range check + DNS pinning + redirect: 'error')",
        detail: "Static validator traced req.body.targetUrl through assertPublicHostnameAndResolve() before reaching fetch().",
        durationMs: 96,
      },
      plan: {
        label: "3. Plan",
        deterministic: true,
        status: "pass",
        summary: "Scheduled P5 Outbound Policy check against RFC-1918 & link-local test addresses",
        detail: "Planned controlled policy verification to confirm guard rejects private/link-local ranges before socket connect.",
        durationMs: 24,
      },
      execute: {
        label: "4. Execute",
        deterministic: true,
        status: "pass",
        summary: "All private/link-local ranges deterministically rejected with EgressPolicyError (0 sockets opened)",
        detail: "XTRIKE-Trace net.sock span count = 0 for restricted ranges; allowed fixture host succeeded.",
        durationMs: 210,
      },
      verify: {
        label: "5. Verify",
        deterministic: true,
        status: "pass",
        summary: "Effective security control proven → Status: NOT_REPRODUCED (Safely Mitigated, 98% confidence)",
        detail: "Evidence establishes that the reported SSRF condition is mitigated by DNS-pinned RFC-1918/link-local enforcement.",
        durationMs: 41,
      },
    },
    evidence: [
      {
        evidenceId: "EV-103-AST",
        kind: "AST Guard Check",
        summary: "assertPublicHostnameAndResolve() dominates sink fetch() on all control-flow paths.",
        sha256Checksum: "11b8e3094fa20c77",
        commitSha: "c8104f29a91d7e05",
        timestamp: "2026-10-16T19:35:20Z",
      },
      {
        evidenceId: "EV-103-LOG",
        kind: "Audit Log",
        summary: "EgressPolicyError thrown prior to socket creation; 0 outbound connections recorded.",
        sha256Checksum: "72d490a1bc55e302",
        commitSha: "c8104f29a91d7e05",
        timestamp: "2026-10-16T19:35:21Z",
      },
    ],
    proofContract: [
      {
        requirement: "Source provenance",
        question: "Did the tested input originate from the relevant user-controlled source?",
        satisfied: true,
        evidenceSummary: "Traced from req.body.targetUrl.",
        sourceType: "DataFlow",
      },
      {
        requirement: "Sink reachability",
        question: "Did restricted inputs reach the underlying socket connect operation?",
        satisfied: false,
        evidenceSummary: "Blocked at L82 by assertPublicHostnameAndResolve() prior to fetch().",
        sourceType: "XTRIKE-Trace Trace",
      },
      {
        requirement: "Security control",
        question: "Was the operation missing an effective security control?",
        satisfied: false,
        evidenceSummary: "Effective control present: ipaddr.js subnet block + DNS pinning + redirect:'error'.",
        sourceType: "AST",
      },
      {
        requirement: "Behavioral proof",
        question: "Did controlled checks demonstrate unauthorized internal network access?",
        satisfied: false,
        evidenceSummary: "0 internal sockets opened across all controlled test cases.",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Alternative explanations",
        question: "Have network failures or container firewall drops been distinguished from app guard?",
        satisfied: true,
        evidenceSummary: "Application threw explicit EgressPolicyError before any syscall.",
        sourceType: "App Log",
      },
      {
        requirement: "Reproducibility",
        question: "Can the mitigation behavior be reproduced on the same build?",
        satisfied: true,
        evidenceSummary: "Verified 3/3 runs on commit c8104f29.",
        sourceType: "Controlled Check",
      },
    ],
    status: "not_reproduced",
    evidenceConfidence: 0.98,
    groundTruthCategory: "safely_mitigated",
    impact: "No exploitable impact — XTRIKE PatternGuard pattern rule matched fetch(), but upstream DNS-pinned subnet guard prevents internal egress.",
    rationale:
      "Classified as Safely Mitigated (NOT_REPRODUCED with 98% evidence confidence) because both control-flow dominance and runtime telemetry prove the guard blocks restricted ranges.",
    unresolvedAssumptions: [],
    limitations: [],
    reproducible: true,
    runtimeCostMs: 409,
    requestsSent: 3,
    rootCause: "Pattern-only SAST rule did not model custom ipaddr.js sanitizer helper.",
    suggestedFix: `// Code is already protected. Add a XTRIKE PatternGuard sanitizer annotation to suppress recurring false alerts:
// semgrep-sanitizer: assertPublicHostnameAndResolve(targetUrl)`,
    regressionTest: `test("rejects RFC1918 and link-local metadata addresses", async () => {
  await expect(assertPublicHostnameAndResolve("http://169.254.169.254/latest")).rejects.toThrow(EgressPolicyError);
});`,
    rawSarifRecord: {
      schemaVersion: "2.1.0",
      toolDriver: "XTRIKE PatternGuard 1.90.0",
      ruleId: "ts.express.ssrf-fetch-sink",
      level: "warning",
      physicalLocation: "src/services/webhookDispatcher.ts:94:18",
      codeFlowsCount: 1,
    },
  },
  {
    findingId: "VAL-104",
    scanner: "XTRIKE GraphCPG",
    ruleId: "go.ArchivePathTraversal",
    cwe: "CWE-22",
    cweTitle: "Path Traversal",
    title: "Unanchored filepath.Join in ArtifactDownloadHandler",
    validatorPriority: 4,
    validatorName: "Path Canonicalization & File Boundary Validator",
    repository: "github.com/acme-corp/artifact-store",
    commitSha: "5e209a14f88c31b0",
    buildCommitSha: "5e209a14f88c31b0",
    filePath: "internal/handlers/download.go",
    startLine: 47,
    endLine: 68,
    functionName: "ServeArtifactFile",
    language: "Go",
    framework: "Go 1.23 + chi router",
    sourceExpr: "r.URL.Query().Get(\"artifact\")",
    intermediateCalls: [
      "ServeArtifactFile(w, r)",
      "filepath.Join(baseStorageDir, artifactParam)",
      "os.Open(resolvedPath)",
    ],
    sinkExpr: "os.Open(resolvedPath)",
    sanitizersDetected: ["filepath.Join() cleans lexically but does not enforce baseStorageDir prefix when relative segments resolve above root"],
    traceProvenance: "XTRIKE GraphCPG CPG call-graph + Go SSA dataflow",
    buildId: "build-2026.10.16-5e209a14",
    endpoint: "/v1/artifacts/download?artifact=",
    httpMethod: "GET",
    authContext: "Authenticated reader token",
    requiredConfig: ["STORAGE_ROOT=/var/lib/acme/sandbox-Bucket"],
    permissions: ["artifacts:read"],
    dependencies: ["github.com/go-chi/chi/v5@v5.1.0"],
    featureFlags: [],
    lifecycle: {
      preflight: {
        label: "1. Preflight",
        deterministic: true,
        status: "pass",
        summary: "Scope authorized · seeded benign canary file outside STORAGE_ROOT inside disposable container",
        detail: "Created /var/lib/acme/canary_boundary_marker.txt (test-owned fixture) and verified commit 5e209a14.",
        durationMs: 35,
      },
      assess: {
        label: "2. Assess",
        deterministic: true,
        status: "pass",
        summary: "Missing strings.HasPrefix(filepath.Clean(p), baseDir + string(os.PathSeparator)) check",
        detail: "Go AST inspection showed filepath.Join(baseStorageDir, artifactParam) passed directly to os.Open without boundary prefix verification.",
        durationMs: 88,
      },
      plan: {
        label: "3. Plan",
        deterministic: true,
        status: "pass",
        summary: "Scheduled P4 Boundary Marker check against adjacent test directory",
        detail: "Planned controlled read of test-owned boundary marker one level above STORAGE_ROOT.",
        durationMs: 22,
      },
      execute: {
        label: "4. Execute",
        deterministic: true,
        status: "pass",
        summary: "Handler returned test-owned boundary marker outside STORAGE_ROOT",
        detail: "Observed deterministic boundary escape to /var/lib/acme/canary_boundary_marker.txt across 3 runs.",
        durationMs: 185,
      },
      verify: {
        label: "5. Verify",
        deterministic: true,
        status: "pass",
        summary: "6/6 Proof Contract criteria satisfied → Status: CONFIRMED (99% confidence)",
        detail: "IndependentEvidenceVerifier verified file boundary escape using harmless test-owned canary file.",
        durationMs: 40,
      },
    },
    evidence: [
      {
        evidenceId: "EV-104-AST",
        kind: "AST Guard Check",
        summary: "No os.Root or strings.HasPrefix boundary check after filepath.Join at download.go:55.",
        sha256Checksum: "e0412a98bc3177d4",
        commitSha: "5e209a14f88c31b0",
        timestamp: "2026-10-16T19:35:30Z",
      },
      {
        evidenceId: "EV-104-HTTP",
        kind: "Controlled HTTP Exchange",
        summary: "Retrieved benign test fixture canary_boundary_marker.txt outside STORAGE_ROOT.",
        sha256Checksum: "b51209ff41e8c203",
        commitSha: "5e209a14f88c31b0",
        timestamp: "2026-10-16T19:35:31Z",
      },
    ],
    proofContract: [
      {
        requirement: "Source provenance",
        question: "Did the tested input originate from the relevant user-controlled source?",
        satisfied: true,
        evidenceSummary: "Query param 'artifact' read at download.go:49.",
        sourceType: "DataFlow",
      },
      {
        requirement: "Sink reachability",
        question: "Did the input reach the file open operation?",
        satisfied: true,
        evidenceSummary: "os.Open() executed with resolved path.",
        sourceType: "XTRIKE-Trace Trace",
      },
      {
        requirement: "Security control",
        question: "Was the path missing canonical prefix or os.Root containment?",
        satisfied: true,
        evidenceSummary: "filepath.Join used without prefix boundary check or os.OpenInRoot.",
        sourceType: "AST",
      },
      {
        requirement: "Behavioral proof",
        question: "Did controlled test inputs cross the intended directory boundary?",
        satisfied: true,
        evidenceSummary: "Read test-owned boundary fixture in parent directory.",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Alternative explanations",
        question: "Could symlinks or static fallback assets explain the response?",
        satisfied: true,
        evidenceSummary: "Verified via SHA-256 checksum of unique per-run canary marker.",
        sourceType: "App Log",
      },
      {
        requirement: "Reproducibility",
        question: "Can the behavior be reproduced on the same build and configuration?",
        satisfied: true,
        evidenceSummary: "Reproduced 3/3 times on commit 5e209a14.",
        sourceType: "Controlled Check",
      },
    ],
    status: "confirmed",
    evidenceConfidence: 0.99,
    groundTruthCategory: "actually_vulnerable",
    impact: "Authenticated callers can read files outside STORAGE_ROOT readable by the service UID.",
    rationale:
      "Confirmed via Go AST analysis and controlled boundary-marker verification in a disposable container.",
    unresolvedAssumptions: [],
    limitations: [],
    reproducible: true,
    runtimeCostMs: 370,
    requestsSent: 3,
    rootCause: "filepath.Join cleans relative segments lexically, which permits escaping baseStorageDir when not followed by a canonical prefix check.",
    suggestedFix: `root, err := os.OpenRoot(baseStorageDir)
if err != nil {
    http.Error(w, "storage unavailable", http.StatusInternalServerError)
    return
}
defer root.Close()
f, err := root.Open(artifactParam)`,
    regressionTest: `func TestServeArtifactRejectsParentTraversal(t *testing.T) {
    req := httptest.NewRequest("GET", "/v1/artifacts/download?artifact=../canary_boundary_marker.txt", nil)
    rec := httptest.NewRecorder()
    ServeArtifactFile(rec, req)
    if rec.Code != http.StatusBadRequest && rec.Code != http.StatusNotFound {
        t.Fatalf("expected boundary rejection, got %d", rec.Code)
    }
}`,
    rawSarifRecord: {
      schemaVersion: "2.1.0",
      toolDriver: "XTRIKE GraphCPG 2.0",
      ruleId: "go.ArchivePathTraversal",
      level: "error",
      physicalLocation: "internal/handlers/download.go:55:12",
      codeFlowsCount: 1,
    },
  },
  {
    findingId: "VAL-105",
    scanner: "XTRIKE XQL",
    ruleId: "csharp.aspnet.reflected-xss-razor",
    cwe: "CWE-79",
    cweTitle: "Cross-Site Scripting (XSS)",
    title: "Legacy Audit Note Preview in Razor Admin View",
    validatorPriority: 3,
    validatorName: "Rendering Context & Output Encoding Validator",
    repository: "github.com/acme-corp/compliance-portal",
    commitSha: "91ab4402d11e73c9",
    buildCommitSha: "e30291bc44a0912f", // Deliberate build drift to demonstrate BLOCKED preflight gate!
    filePath: "Pages/Admin/AuditPreview.cshtml",
    startLine: 29,
    endLine: 36,
    functionName: "Html.Raw(Model.FormattedNote)",
    language: "C#",
    framework: "ASP.NET Core 8.0 Razor Pages",
    sourceExpr: "Request.Query[\"note\"]",
    intermediateCalls: [
      "AuditPreviewModel.OnGet(string note)",
      "HtmlSanitizer.Sanitize(note)",
      "Html.Raw(Model.FormattedNote)",
    ],
    sinkExpr: "@Html.Raw(Model.FormattedNote)",
    sanitizersDetected: ["Ganss.XSS.HtmlSanitizer detected in OnGet(), but deployed staging build SHA differs from scanned commit"],
    traceProvenance: "XTRIKE XQL AST trace",
    buildId: "build-2026.10.14-e30291bc",
    endpoint: "/Admin/AuditPreview?note=",
    httpMethod: "GET",
    authContext: "Auditor role session",
    requiredConfig: ["ASPNETCORE_ENVIRONMENT=Staging"],
    permissions: ["audit:preview"],
    dependencies: ["HtmlSanitizer@8.1.870"],
    featureFlags: ["legacy_razor_preview"],
    lifecycle: {
      preflight: {
        label: "1. Preflight",
        deterministic: true,
        status: "blocked",
        summary: "BLOCKED: SAST commit 91ab4402 ≠ running application build e30291bc",
        detail: "Build identity gate rejected execution: a test result from build e30291bc must never validate a finding from commit 91ab4402.",
        durationMs: 19,
      },
      assess: {
        label: "2. Assess",
        deterministic: true,
        status: "warn",
        summary: "Static AST shows HtmlSanitizer.Sanitize() added in commit 91ab4402",
        detail: "Source at 91ab4402 invokes HtmlSanitizer before @Html.Raw, but runtime target has not been redeployed to 91ab4402.",
        durationMs: 74,
      },
      plan: {
        label: "3. Plan",
        deterministic: true,
        status: "blocked",
        summary: "Execution halted by Preflight Build-Identity Gate",
        detail: "Planner queued P3 Headless Browser Context Check pending container rebuild to commit 91ab4402d11e73c9.",
        durationMs: 12,
      },
      execute: {
        label: "4. Execute",
        deterministic: true,
        status: "blocked",
        summary: "Skipped — awaiting matching build deployment",
        detail: "0 requests sent to prevent cross-build false dismissal or false confirmation.",
        durationMs: 0,
      },
      verify: {
        label: "5. Verify",
        deterministic: true,
        status: "blocked",
        summary: "Status: BLOCKED (Build Commit Mismatch · 92% gate confidence)",
        detail: "Verifier enforced rule: commit_sha (91ab4402) != build_commit_sha (e30291bc).",
        durationMs: 15,
      },
    },
    evidence: [
      {
        evidenceId: "EV-105-GATE",
        kind: "Audit Log",
        summary: "Preflight gate blocked runtime test: finding commit 91ab4402 != container build e30291bc.",
        sha256Checksum: "c0192837465faabb",
        commitSha: "91ab4402d11e73c9",
        timestamp: "2026-10-16T19:35:40Z",
      },
    ],
    proofContract: [
      {
        requirement: "Source provenance",
        question: "Did the tested input originate from the relevant user-controlled source?",
        satisfied: true,
        evidenceSummary: "Verified statically in AuditPreview.cshtml.cs.",
        sourceType: "AST",
      },
      {
        requirement: "Sink reachability",
        question: "Did the input reach the rendering context on the exact build?",
        satisfied: false,
        evidenceSummary: "Runtime build e30291bc does not match scanned commit 91ab4402.",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Security control",
        question: "Was the rendering context missing effective encoding/sanitization?",
        satisfied: false,
        evidenceSummary: "HtmlSanitizer.Sanitize() present in source commit 91ab4402.",
        sourceType: "AST",
      },
      {
        requirement: "Behavioral proof",
        question: "Did an isolated browser observe unencoded context execution?",
        satisfied: false,
        evidenceSummary: "Not executed due to commit mismatch gate.",
        sourceType: "Controlled Check",
      },
      {
        requirement: "Alternative explanations",
        question: "Have CSP headers and build drift been accounted for?",
        satisfied: false,
        evidenceSummary: "Build drift detected during preflight check.",
        sourceType: "App Log",
      },
      {
        requirement: "Reproducibility",
        question: "Can the behavior be reproduced on the exact commit_sha?",
        satisfied: false,
        evidenceSummary: "Requires container image built from 91ab4402d11e73c9.",
        sourceType: "Controlled Check",
      },
    ],
    status: "blocked",
    evidenceConfidence: 0.92,
    groundTruthCategory: "insufficient_context",
    impact: "Held at gate until staging container is rebuilt from commit 91ab4402d11e73c9.",
    rationale:
      "Demonstrates strict build-identity enforcement: a test result from one build must never validate or dismiss a finding from a different commit.",
    unresolvedAssumptions: ["Staging container still runs commit e30291bc44a0912f"],
    limitations: ["Build SHA mismatch between SARIF report and target container"],
    reproducible: false,
    runtimeCostMs: 120,
    requestsSent: 0,
    rootCause: "Use of @Html.Raw() requires verified HTML sanitization on the exact deployed artifact.",
    suggestedFix: `// Prefer Razor's default context-aware encoding instead of @Html.Raw:
<div class="audit-note">@Model.PlainTextNote</div>`,
    regressionTest: `[Fact]
public void AuditPreview_EncodesUntrustedMarkup() {
    var model = new AuditPreviewModel();
    model.OnGet("<b>review</b>");
    Assert.DoesNotContain("<script>", model.FormattedNote);
}`,
    rawSarifRecord: {
      schemaVersion: "2.1.0",
      toolDriver: "XTRIKE XQL One 3.14",
      ruleId: "csharp.aspnet.reflected-xss-razor",
      level: "warning",
      physicalLocation: "Pages/Admin/AuditPreview.cshtml:33:14",
      codeFlowsCount: 1,
    },
  },
];

export const BENCHMARK_SUITE_SUMMARY = {
  totalGroundTruthCases: 160,
  categories: [
    {
      id: "actually_vulnerable" as GroundTruthCategory,
      label: "Actually Vulnerable",
      description: "Weakness is present in the build, reachable along an active route, and reproducibly demonstrable.",
      cases: 48,
      validatedCorrectly: 47,
    },
    {
      id: "safely_mitigated" as GroundTruthCategory,
      label: "Safely Mitigated",
      description: "Scanner flags a syntax pattern, but effective controls (parameterization, subnet guards, canonicalization) prevent exploitation.",
      cases: 52,
      validatedCorrectly: 51,
    },
    {
      id: "unreachable_or_inactive" as GroundTruthCategory,
      label: "Unreachable or Inactive",
      description: "Vulnerable-looking code exists in dead helpers, disabled feature flags, or test-only fixtures.",
      cases: 36,
      validatedCorrectly: 36,
    },
    {
      id: "insufficient_context" as GroundTruthCategory,
      label: "Insufficient Context / Blocked",
      description: "Build SHA drift, missing credentials, or safety gate restrictions prevent conclusive validation.",
      cases: 24,
      validatedCorrectly: 24,
    },
  ],
  metrics: [
    {
      name: "Confirmation Precision",
      value: "98.9%",
      question: "What proportion of CONFIRMED findings are genuinely exploitable?",
      detail: "Zero unverified confirmations permitted — requires 6/6 proof contract checks.",
    },
    {
      name: "False Confirmation Rate",
      value: "1.1%",
      question: "How often does the engine incorrectly claim a finding is confirmed?",
      detail: "Kept near zero by requiring DB/XTRIKE-Trace span proof in addition to HTTP responses.",
    },
    {
      name: "False Dismissal Rate",
      value: "0.0%",
      question: "How often does it incorrectly dismiss a real vulnerability?",
      detail: "Failed probes map to NOT_REPRODUCED or INCONCLUSIVE, never automatic False Positive.",
    },
    {
      name: "Validation Coverage",
      value: "88.5%",
      question: "What proportion of imported SAST findings receive a meaningful validation attempt?",
      detail: "Reported separately from precision across Priority 1–5 CWE classes.",
    },
    {
      name: "Evidence Completeness",
      value: "96.4%",
      question: "What proportion of results meet their required SHA-256 evidence contract?",
      detail: "Every result bundles SARIF trace, AST guard check, and runtime span checksums.",
    },
    {
      name: "Reproducibility Rate",
      value: "99.2%",
      question: "How consistently do results repeat under the same commit_sha and config?",
      detail: "Requires 3/3 deterministic passes on disposable containers bound to commit_sha.",
    },
    {
      name: "Median Runtime Cost",
      value: "420 ms / 2.4 req",
      question: "How long and how many requests does validation require per finding?",
      detail: "Bounded by explicit stop conditions in the Validation Planner.",
    },
  ],
};

export const DETERMINISTIC_VS_AI_MATRIX = {
  deterministic: [
    {
      item: "Authorization & Scope Enforcement",
      detail: "Hard-coded allowlists of repositories, disposable containers, and test-owned principals.",
    },
    {
      item: "Build Identity Lock (commit_sha == build_commit_sha)",
      detail: "Rejects validation when the running build does not match the scanned source commit.",
    },
    {
      item: "Test Execution Limits & Stop Conditions",
      detail: "Strict cap on request count, timeout, and network egress per validator.",
    },
    {
      item: "Content-Addressed Evidence Integrity",
      detail: "SHA-256 hashes over raw SARIF traces, HTTP exchanges, and XTRIKE-Trace spans.",
    },
    {
      item: "Proof-Contract Evaluation & State Transitions",
      detail: "A finding transitions to CONFIRMED only when all 6 proof requirements pass deterministically.",
    },
    {
      item: "Immutable Audit Logging",
      detail: "Every preflight check, planned probe, and verifier decision is logged with timestamps.",
    },
  ],
  aiAssisted: [
    {
      item: "Complex Multi-File Path Interpretation",
      detail: "Summarizes indirect framework middleware and dependency injection wiring for human review.",
    },
    {
      item: "Candidate Sanitizer & Guard Discovery",
      detail: "Flags custom validation helpers so deterministic AST rules can model them.",
    },
    {
      item: "Template-Bounded Test Plan Suggestions",
      detail: "Proposes parameter shapes from approved validator templates (never raw unconstrained payloads).",
    },
    {
      item: "Static vs. Runtime Disagreement Explanations",
      detail: "Explains why a static match did not reproduce at runtime (e.g., upstream subnet guard).",
    },
    {
      item: "Candidate Attack-Path Correlation",
      detail: "Groups related validated findings across services for architecture review.",
    },
    {
      item: "Developer-Ready Remediation & pytest Drafting",
      detail: "Drafts minimal framework-idiomatic patches and unit regression tests.",
    },
  ],
};


// ── 5-Technique Hybrid Proof Engine ──────────────────────────────
export const HYBRID_PROOF_TECHNIQUES = [
  {
    step: 1,
    title: "Static & Bidirectional Analysis",
    engine: "XTRIKE AST-Query + XTRIKE-CST + XTRIKE GraphCPG CPG",
    role: "Traces untrusted data forward from sources to sinks and backward from sensitive operations to enumerate every upstream caller, sanitizer, and variable alias.",
    metric: "100% call-graph coverage across 5 languages",
  },
  {
    step: 2,
    title: "Symbolic & Constraint Analysis",
    engine: "XTRIKE-Solver Theorem Prover + XTRIKE-SymExec",
    role: "Derives path conditions and guard clauses required to reach a sink, solves for minimal satisfying inputs, and proves dead/unreachable branches.",
    metric: "36 unreachable branches proven statically",
  },
  {
    step: 3,
    title: "Dynamic & Runtime-to-Source Correlation",
    engine: "XTRIKE-HTTP + XTRIKE-DOM + XTRIKE-Trace",
    role: "Exercises controlled inputs in disposable containers while mapping HTTP requests directly to executed functions, DB queries, and source lines.",
    metric: "Sub-millisecond XTRIKE-Trace span-to-line correlation",
  },
  {
    step: 4,
    title: "Differential & Fix Verification",
    engine: "Multi-Build & Role Matrix Runner",
    role: "Compares behavior across vulnerable vs. patched builds, role boundaries, and parser configurations, then re-runs proof and regression tests after fixes.",
    metric: "98.6% patch retest verification rate",
  },
  {
    step: 5,
    title: "Evidence Adjudication & Provenance",
    engine: "Append-Only ProofContract Verifier",
    role: "Independently evaluates the 6-point proof contract, separates validation status from confidence, and writes SHA-256 content-addressed provenance records.",
    metric: "0.0% false dismissal · 98.9% precision",
  },
] as const;

// ── Security Validation Scorecard (Exact Spec Layout) ────────────
export const VALIDATION_SCORECARD = {
  sastFindingsTotal: 248,
  runtimeConfirmed: 36, // subset of 248, never additive
  safelyMitigated: 52,
  inconclusive: 41,
  notYetValidated: 119, // explicitly labeled untested, never labeled safe
  independentDiscoveries: 4, // kept strictly separate from SAST-originated findings
  kpis: [
    { label: "Validation Coverage", value: "88.5%", note: "Of eligible SAST findings" },
    { label: "Evidence Completeness", value: "96.4%", note: "Meet SHA-256 proof contract" },
    { label: "False-Confirmation Rate", value: "1.1%", note: "On ground-truth benchmark" },
    { label: "False-Dismissal Rate", value: "0.0%", note: "Failed checks != False Positive" },
    { label: "Median Time / Finding", value: "420 ms", note: "2.4 controlled requests avg" },
    { label: "Attack-Chain Coverage", value: "92.0%", note: "Cross-finding graph paths" },
    { label: "Retest Success Rate", value: "98.6%", note: "Differential patch verification" },
  ],
};

// ── Counterexample Engine & Test Minimization ────────────────────
export type CounterexampleRecord = {
  findingId: string;
  cwe: string;
  title: string;
  proofLevel: "Concrete Counterexample" | "Reachability Proof Only" | "Mitigation Proven";
  sourceStage: string;
  executionPathStage: string;
  pathConstraintZ3: string;
  sensitiveOperationStage: string;
  minimizedCounterexample: string;
  unminimizedLength: number;
  minimizedLength: number;
  differentialOutcome: string;
};

export const COUNTEREXAMPLE_RECORDS: CounterexampleRecord[] = [
  {
    findingId: "VAL-101",
    cwe: "CWE-862",
    title: "Cross-Tenant Invoice Read in BillingService",
    proofLevel: "Concrete Counterexample",
    sourceStage: "GET /api/v1/invoices/{invoice_id} with path param invoice_id controlled by caller.",
    executionPathStage:
      "get_invoice_by_id() -> Depends(get_current_user) [authenticates principal] -> InvoiceRepository.fetch_one(invoice_id) [omits tenant_id filter].",
    pathConstraintZ3:
      "And(auth.valid_token == True, auth.tenant_id == 'tenant_a', resource.id == 'INV-TEST-009', resource.owner_tenant == 'tenant_b')",
    sensitiveOperationStage:
      "SQLAlchemy session.execute(select(Invoice).where(Invoice.id == invoice_id)) returns row across tenant boundary.",
    minimizedCounterexample:
      "Principal=tenant_a_member, Method=GET, Path=/api/v1/invoices/INV-TEST-009 -> HTTP 200 (owner=tenant_b)",
    unminimizedLength: 480,
    minimizedLength: 94,
    differentialOutcome:
      "Vulnerable build a4f92c81 returns HTTP 200 + Tenant-B record; patched build f902e11c returns HTTP 404 with 0 rows read.",
  },
  {
    findingId: "VAL-102",
    cwe: "CWE-89",
    title: "Unparameterized Order Search Filter in OrderDao",
    proofLevel: "Concrete Counterexample",
    sourceStage: "GET /api/orders/search?code= enters OrderController.searchOrders(@RequestParam String orderCode).",
    executionPathStage:
      "OrderController.searchOrders() -> OrderService.findMatching() -> OrderDao.searchOrdersByCode() [no sanitizer or bind parameter].",
    pathConstraintZ3:
      "And(len(orderCode) > 0, not(is_alphanumeric(orderCode)), jdbc.prepared_params_count == 0)",
    sensitiveOperationStage:
      "jdbcTemplate.queryForList(sql) executes concatenated SQL string with 0 bound parameters.",
    minimizedCounterexample:
      "Param code='ORD-100' vs structural quote token -> JDBC pg_stat_statements AST node count shifts from 1 predicate to 2",
    unminimizedLength: 310,
    minimizedLength: 62,
    differentialOutcome:
      "Vulnerable build parses unparameterized literal; patched build binds $1 parameter with immutable SQL parse tree.",
  },
  {
    findingId: "VAL-103",
    cwe: "CWE-918",
    title: "Webhook Dispatcher Outbound URL Fetch",
    proofLevel: "Mitigation Proven",
    sourceStage: "POST /api/webhooks/test with JSON field req.body.targetUrl.",
    executionPathStage:
      "webhookRouter.post() -> assertPublicHostnameAndResolve(targetUrl) [blocks RFC-1918 & link-local] -> dispatchWebhook().",
    pathConstraintZ3:
      "And(ip.is_private(resolved_ip) == True, passes_guard(assertPublicHostnameAndResolve) == True) ==> UNSAT",
    sensitiveOperationStage:
      "fetch(validatedUrl, { redirect: 'error' }) is unreachable for private or link-local IP ranges.",
    minimizedCounterexample:
      "XTRIKE-Solver constraint UNSAT for private/link-local ranges; runtime check confirmed EgressPolicyError with 0 sockets opened.",
    unminimizedLength: 220,
    minimizedLength: 48,
    differentialOutcome:
      "Guard active in current build c8104f29; negative control fixture without guard opens socket as expected.",
  },
];

// ── Security-Invariant Engine & SAST-Independent Discovery ───────
export type SecurityInvariantSpec = {
  id: string;
  property: string;
  category:
    | "Authentication"
    | "Multi-Tenant Isolation"
    | "Role Hierarchy"
    | "Token Lifecycle"
    | "Workflow State Machine"
    | "Cache Isolation";
  status: "VIOLATION PROVEN" | "ENFORCED" | "PARTIAL";
  origin: "SAST + Invariant Confirmed" | "Independent Discovery (Not Reported by SAST)";
  evaluatedRoutes: number;
  evidenceSummary: string;
};

export const SECURITY_INVARIANTS: SecurityInvariantSpec[] = [
  {
    id: "INV-01",
    property: "An unauthenticated principal must never access protected resource endpoints.",
    category: "Authentication",
    status: "ENFORCED",
    origin: "SAST + Invariant Confirmed",
    evaluatedRoutes: 42,
    evidenceSummary:
      "All 42 protected routes rejected unauthenticated requests with 401 before controller invocation.",
  },
  {
    id: "INV-02",
    property: "A principal in Tenant A must never read or mutate records owned by Tenant B.",
    category: "Multi-Tenant Isolation",
    status: "VIOLATION PROVEN",
    origin: "SAST + Invariant Confirmed",
    evaluatedRoutes: 28,
    evidenceSummary:
      "Violated on GET /api/v1/invoices/{invoice_id} (VAL-101) — Tenant-A read Tenant-B fixture INV-TEST-009.",
  },
  {
    id: "INV-03",
    property: "A low-privilege member role must never execute administrator state transitions.",
    category: "Role Hierarchy",
    status: "VIOLATION PROVEN",
    origin: "Independent Discovery (Not Reported by SAST)",
    evaluatedRoutes: 19,
    evidenceSummary:
      "Undocumented route POST /internal/v1/tenants/limits accepted member role token because proxy route lacked @RequireAdmin middleware.",
  },
  {
    id: "INV-04",
    property: "A revoked or rotated session token must never authorize subsequent API requests.",
    category: "Token Lifecycle",
    status: "ENFORCED",
    origin: "SAST + Invariant Confirmed",
    evaluatedRoutes: 14,
    evidenceSummary:
      "Revoked JWT jti rejected within 5ms via Redis denylist check across all 14 stateful endpoints.",
  },
  {
    id: "INV-05",
    property: "A payout transaction must never settle before the mandatory two-person approval state.",
    category: "Workflow State Machine",
    status: "VIOLATION PROVEN",
    origin: "Independent Discovery (Not Reported by SAST)",
    evaluatedRoutes: 9,
    evidenceSummary:
      "State-machine runner transitioned DRAFT -> SETTLED directly via PUT /api/payouts/{id}/finalize, skipping PENDING_APPROVAL.",
  },
  {
    id: "INV-06",
    property: "Responses containing tenant-scoped fields must never be stored in a shared public cache.",
    category: "Cache Isolation",
    status: "ENFORCED",
    origin: "SAST + Invariant Confirmed",
    evaluatedRoutes: 31,
    evidenceSummary:
      "Verified Vary: Authorization and Cache-Control: private, no-store headers on all 31 tenant responses.",
  },
];

// ── Multi-Vulnerability Attack-Chain Discovery ───────────────────
export const MULTI_VULN_ATTACK_CHAINS = [
  {
    chainId: "CHAIN-01",
    title: "Cross-Tenant Invoice Read -> Webhook Secret Exposure -> Signed Event Replay",
    combinedSeverity: "Critical (Composite Risk 9.6)",
    individualSeverities: ["Medium (Info Disclosure)", "Medium (Config Leak)", "High (BOLA)"],
    steps: [
      {
        step: 1,
        findingRef: "VAL-101 (CWE-862)",
        label: "Cross-tenant invoice metadata read exposes tenant webhook configuration ID",
      },
      {
        step: 2,
        findingRef: "INV-03 (Independent Discovery)",
        label: "Unprotected /internal/v1/tenants/limits endpoint returns webhook signing metadata",
      },
      {
        step: 3,
        findingRef: "Impact Proven",
        label: "Allows deterministic cross-tenant event forgery inside isolated test harness",
      },
    ],
  },
  {
    chainId: "CHAIN-02",
    title: "Artifact Path Boundary Escape -> Config Read -> Workflow Approval Bypass",
    combinedSeverity: "Critical (Composite Risk 9.3)",
    individualSeverities: ["High (CWE-22)", "Medium (State Machine INV-05)"],
    steps: [
      {
        step: 1,
        findingRef: "VAL-104 (CWE-22)",
        label: "Unanchored filepath.Join reads parent directory configuration fixture",
      },
      {
        step: 2,
        findingRef: "INV-05 (State Machine)",
        label: "Direct DRAFT -> SETTLED transition bypasses secondary approval check",
      },
    ],
  },
] as const;

// ── Attack-Surface Completeness & Dependency Reachability ────────
export const ATTACK_SURFACE_COMPLETENESS = {
  sourceDefinedRoutes: 84,
  openApiDocumentedRoutes: 76,
  reverseProxyExposedRoutes: 81,
  runtimeObservedRoutes: 79,
  undocumentedShadowRoutes: [
    {
      route: "POST /internal/v1/tenants/limits",
      sourceFile: "app/api/internal/limits.py:18",
      inOpenApi: false,
      exposedByProxy: true,
      authBoundary: "Missing @RequireAdmin (Discovered by INV-03)",
    },
    {
      route: "GET /debug/cache-keys",
      sourceFile: "src/server/debugRoutes.ts:41",
      inOpenApi: false,
      exposedByProxy: false,
      authBoundary: "Blocked at reverse-proxy ingress (Unreachable externally)",
    },
  ],
  dependencyReachability: [
    {
      package: "org.postgresql:postgresql@42.7.1",
      advisory: "CVE-2024-1597",
      vulnerableMethod: "PGSimpleDataSource.setPreferQueryMode()",
      callGraphReachable: false,
      verdict: "Unreachable — application uses default extended query mode only",
    },
    {
      package: "node-serialize@0.0.4",
      advisory: "CVE-2017-5941",
      vulnerableMethod: "serialize.unserialize(payload)",
      callGraphReachable: true,
      verdict: "Reachable — invoked directly in workers/jobProcessor.ts:54",
    },
  ],
};

// ── Security Test Knowledge Graph & Self-Testing Quality Gates ───
export const KNOWLEDGE_GRAPH_EDGES = [
  {
    fromType: "SAST Rule",
    fromNode: "py/missing-object-level-authorization (CWE-862)",
    relation: "MAPS_TO_SOURCE_SINK",
    toType: "AST Function",
    toNode: "invoices.get_invoice_by_id() -> session.execute()",
    learnedInsight: "XTRIKE-API Depends(get_current_user) proves authentication, not tenant ownership.",
  },
  {
    fromType: "AST Sanitizer",
    fromNode: "assertPublicHostnameAndResolve() [ipaddr.js]",
    relation: "MITIGATES_SINK",
    toType: "Runtime Sink",
    toNode: "fetch(validatedUrl, { redirect: 'error' })",
    learnedInsight: "Reusable rule learned: verify ipaddr.js version >= 2.1.0 and redirect:'error' in future Node.js repos.",
  },
  {
    fromType: "Evidence Hash",
    fromNode: "EV-101-OTEL (sha256:6a91e044bc8210fa)",
    relation: "PROVES_COUNTEREXAMPLE",
    toType: "Regression Test",
    toNode: "pytest: test_cross_tenant_invoice_access_denied",
    learnedInsight: "Bound to commit a4f92c81e03b4d12; automatically re-executed on every subsequent PR.",
  },
] as const;

export const SELF_TESTING_QUALITY_GATES = [
  {
    gate: "1. Known Vulnerable Fixtures",
    question: "Can the engine detect and reproducibly demonstrate seeded ground-truth vulnerabilities?",
    status: "PASS (47 / 48)",
    metric: "97.9% recall on seeded corpus",
  },
  {
    gate: "2. Secure Negative Controls",
    question: "Does it avoid falsely confirming effectively mitigated code paths?",
    status: "PASS (51 / 52)",
    metric: "1.1% false-confirmation rate",
  },
  {
    gate: "3. Honest Inconclusive Admission",
    question: "Does it report INCONCLUSIVE or BLOCKED when prerequisites or build identity are missing?",
    status: "PASS (24 / 24)",
    metric: "0.0% unverified assumptions",
  },
  {
    gate: "4. Validator Regression Suite",
    question: "Do all Priority 1–5 validators pass deterministic unit and container replay checks?",
    status: "PASS (142 / 142)",
    metric: "100% pytest suite green",
  },
  {
    gate: "5. Safety & Scope Enforcement Gate",
    question: "Does preflight block out-of-scope hosts, build SHA drift, and unapproved network egress?",
    status: "PASS (100%)",
    metric: "0 policy escapes permitted",
  },
  {
    gate: "6. Bounded Runtime Performance",
    question: "Does validation stay within request and latency budgets as repository size scales?",
    status: "PASS (420 ms median)",
    metric: "Max 3 requests / finding",
  },
] as const;

export const SIXTEEN_ADVANCED_CAPABILITIES = [
  { id: 1, name: "Bidirectional Source-to-Sink Analysis", group: "Core Analysis", status: "Active (XTRIKE AST-Query + XTRIKE-CST)" },
  { id: 2, name: "Multi-Vulnerability Attack-Chain Discovery", group: "Graph Intelligence", status: "Active (CHAIN-01, CHAIN-02)" },
  { id: 3, name: "Runtime-to-Source Correlation", group: "Dynamic Telemetry", status: "Active (XTRIKE-Trace Span -> Line)" },
  { id: 4, name: "Coverage-Guided API & Schema Fuzzing", group: "Dynamic Telemetry", status: "Active (Schema-Bounded)" },
  { id: 5, name: "Automated Fix & Patch Bypass Verification", group: "Differential", status: "Active (PR Retest Loop)" },
  { id: 6, name: "Symbolic Execution & XTRIKE-Solver Constraint Solving", group: "Formal / Solver", status: "Active (XTRIKE-Solver + XTRIKE-SymExec)" },
  { id: 7, name: "Security-Invariant Engine (INV-01..06)", group: "Property Testing", status: "Active (SAST-Independent)" },
  { id: 8, name: "Multi-Tenant Isolation Testing", group: "Property Testing", status: "Active (Two-Tenant Harness)" },
  { id: 9, name: "Business-Logic & State-Machine Testing", group: "Property Testing", status: "Active (Transition Verifier)" },
  { id: 10, name: "Differential & Metamorphic Verification", group: "Differential", status: "Active (Build/Role/Parser)" },
  { id: 11, name: "Dependency & SCA Exploitability Reachability", group: "Core Analysis", status: "Active (Call-Graph Linked)" },
  { id: 12, name: "Attack-Surface Completeness Analysis", group: "Recon & Drift", status: "Active (AST vs OpenAPI vs Proxy)" },
  { id: 13, name: "Concurrency & Race-Condition Boundary Checks", group: "Property Testing", status: "Active (Barrier Sync)" },
  { id: 14, name: "Session & Token Lifecycle Verification", group: "Property Testing", status: "Active (Revocation Replay)" },
  { id: 15, name: "Cache Isolation & Parser Differential Checks", group: "Differential", status: "Active (Vary/Cache-Control)" },
  { id: 16, name: "Automatic Test Deduplication & Minimization", group: "Formal / Solver", status: "Active (Delta-Minimization)" },
] as const;


// ── Security Claim Verification Engine ───────────────────────────
export type VerifiableClaim = {
  claimId: string;
  claimType:
    | "Vulnerable code is reachable"
    | "Input reaches a sensitive sink"
    | "Authorization policy is violated"
    | "Weakness is reproducibly demonstrable"
    | "A remediation fix works"
    | "An attack chain is feasible";
  findingRef: string;
  requiredProof: string;
  observedEvidence: string;
  verdict: "ESTABLISHED" | "REFUTED (MITIGATED)" | "UNESTABLISHED (RECORDED)";
  unestablishedNotes: string;
};

export const SECURITY_CLAIMS_LEDGER: VerifiableClaim[] = [
  {
    claimId: "CLM-01",
    claimType: "Vulnerable code is reachable",
    findingRef: "VAL-101 (CWE-862)",
    requiredProof: "Supported call path and observed runtime XTRIKE-Trace trace on active route.",
    observedEvidence: "GET /api/v1/invoices/{invoice_id} invoked get_invoice_by_id() -> fetch_one() (trace_id=7b2019ef).",
    verdict: "ESTABLISHED",
    unestablishedNotes: "None — direct route-to-function span recorded on commit a4f92c81.",
  },
  {
    claimId: "CLM-02",
    claimType: "Input reaches a sensitive sink",
    findingRef: "VAL-103 (CWE-918)",
    requiredProof: "Data-flow trace tied to the tested source reaching the underlying network socket sink.",
    observedEvidence: "Input halted at L82 by assertPublicHostnameAndResolve(); 0 socket spans opened.",
    verdict: "REFUTED (MITIGATED)",
    unestablishedNotes: "Sink is unreachable for RFC-1918 and link-local addresses under current guard.",
  },
  {
    claimId: "CLM-03",
    claimType: "Authorization policy is violated",
    findingRef: "VAL-101 (CWE-862)",
    requiredProof: "Controlled unauthorized principal accesses or mutates a test-owned resource.",
    observedEvidence: "Principal tenant_a_test retrieved Tenant-B fixture INV-TEST-009 payload (checksum 3c17d4a8).",
    verdict: "ESTABLISHED",
    unestablishedNotes: "Write/mutation path not claimed; read disclosure is deterministically proven.",
  },
  {
    claimId: "CLM-04",
    claimType: "Weakness is reproducibly demonstrable",
    findingRef: "VAL-102 (CWE-89)",
    requiredProof: "Vulnerability-specific proof criteria satisfied across 3/3 runs on identical commit_sha.",
    observedEvidence: "Postgres parse tree altered across 3 consecutive runs with 0 bound parameters ($1 absent).",
    verdict: "ESTABLISHED",
    unestablishedNotes: "None — 3/3 deterministic passes in disposable DB container.",
  },
  {
    claimId: "CLM-05",
    claimType: "A remediation fix works",
    findingRef: "VAL-101 Patch Verification",
    requiredProof: "Original proof test fails to reproduce, no alternate entry point remains, and regression suite passes.",
    observedEvidence: "Patched build f902e11c returned HTTP 404 for cross-tenant read; all 3 routes calling fetch_one() enforce tenant_id.",
    verdict: "ESTABLISHED",
    unestablishedNotes: "None — verified across REST and GraphQL resolvers.",
  },
  {
    claimId: "CLM-06",
    claimType: "An attack chain is feasible",
    findingRef: "CHAIN-01 (VAL-101 -> INV-03)",
    requiredProof: "Direct evidence for every transition, with any inferred steps explicitly marked.",
    observedEvidence: "Step 1 (VAL-101) and Step 2 (INV-03) proven directly; Step 3 replay verified in local harness.",
    verdict: "ESTABLISHED",
    unestablishedNotes: "External webhook receiver signature rotation interval is inferred from default config.",
  },
];

// ── Given / When / Expected Security Contracts ───────────────────
export type SecurityContractSpec = {
  contractId: string;
  property: string;
  given: string;
  when: string;
  expected: string;
  evidenceRequired: string;
  generatedTestName: string;
  executionStatus: "VIOLATION DETECTED" | "CONTRACT SATISFIED";
  observedOutcome: string;
};

export const EXECUTABLE_SECURITY_CONTRACTS: SecurityContractSpec[] = [
  {
    contractId: "CTR-01",
    property: "Tenant Isolation",
    given: "Two authorized test users belonging to different tenants (tenant_a_member, tenant_b_owner).",
    when: "User A requests an invoice or artifact object owned by Tenant B.",
    expected: "The application must not disclose or modify Tenant B's protected data (HTTP 403/404, 0 rows returned).",
    evidenceRequired: "Authenticated request, object ownership metadata, response diff, and DB query authorization trace.",
    generatedTestName: "test_contract_tenant_isolation_invoices()",
    executionStatus: "VIOLATION DETECTED",
    observedOutcome: "User A received Tenant B's INV-TEST-009 record on GET /api/v1/invoices/{id} (linked to VAL-101).",
  },
  {
    contractId: "CTR-02",
    property: "Segregation of Duties (Two-Person Approval)",
    given: "A single finance principal who created payout transaction PAY-8821 in DRAFT state.",
    when: "The same principal submits an approval or finalization request for PAY-8821.",
    expected: "The state machine must reject self-approval and require a distinct approver principal.",
    evidenceRequired: "Creator principal ID, approver principal ID, state-transition audit log, and DB row state.",
    generatedTestName: "test_contract_segregation_of_duties_payout()",
    executionStatus: "VIOLATION DETECTED",
    observedOutcome: "PUT /api/payouts/PAY-8821/finalize transitioned DRAFT -> SETTLED under creator principal (linked to INV-05).",
  },
  {
    contractId: "CTR-03",
    property: "Outbound Egress Containment",
    given: "An authenticated workspace administrator configuring a webhook callback URL.",
    when: "The callback URL resolves to RFC-1918 private space or link-local metadata (169.254.169.254).",
    expected: "The dispatcher must reject the address prior to opening any network socket.",
    evidenceRequired: "DNS resolution log, guard exception trace, and XTRIKE-Trace net.sock span count == 0.",
    generatedTestName: "test_contract_egress_containment_webhooks()",
    executionStatus: "CONTRACT SATISFIED",
    observedOutcome: "assertPublicHostnameAndResolve() threw EgressPolicyError; 0 sockets opened (linked to VAL-103).",
  },
];

// ── Test-Selection Optimizer (7-Factor Planner) ──────────────────
export const TEST_SELECTION_OPTIMIZER_QUEUE = [
  {
    rank: 1,
    findingRef: "VAL-101 · CWE-862 (Cross-Tenant Invoice Read)",
    selectedAction: "Run Controlled 2-Principal Role Matrix Probe (2 HTTP GETs)",
    applicabilityProb: "0.98",
    infoGain: "High (Resolves ownership boundary)",
    stateRisk: "Zero (Read-only GET on fixture)",
    costMs: "310 ms",
    decisionReason: "Static AST shows missing tenant_id filter, but middleware could inject scope dynamically — low-cost read probe provides definitive proof.",
  },
  {
    rank: 2,
    findingRef: "VAL-103 · CWE-918 (Webhook Outbound Fetch)",
    selectedAction: "Skip External Probe -> Verify Local Unit Guard & Static Dominance",
    applicabilityProb: "0.99",
    infoGain: "Complete (Static + unit check sufficient)",
    stateRisk: "Zero",
    costMs: "41 ms",
    decisionReason: "AST dominance proves assertPublicHostnameAndResolve() executes on all paths before fetch(); avoids unnecessary runtime fuzzing.",
  },
  {
    rank: 3,
    findingRef: "VAL-102 · CWE-89 (OrderDao Search Filter)",
    selectedAction: "Run Disposable DB Parse-Tree Comparison (3 Queries)",
    applicabilityProb: "0.97",
    infoGain: "High (Confirms 0 bound parameters)",
    stateRisk: "Isolated (Disposable container DB)",
    costMs: "390 ms",
    decisionReason: "String concatenation confirmed statically; 3 benign comparison queries verify driver-level parse tree behavior.",
  },
  {
    rank: 4,
    findingRef: "VAL-105 · CWE-79 (Razor Audit Preview)",
    selectedAction: "Halt at Preflight (0 Requests Sent)",
    applicabilityProb: "0.00 (Build Drift)",
    infoGain: "None until container rebuild",
    stateRisk: "Avoided",
    costMs: "19 ms",
    decisionReason: "Scanned commit 91ab4402 != deployed staging build e30291bc; optimizer blocks execution to prevent invalid evidence.",
  },
] as const;

// ── 10 Pluggable Specialized Analyzer Modules ────────────────────
export const TEN_SPECIALIZED_MODULES = [
  {
    id: "MOD-01",
    name: "Identity Propagation Analyzer",
    capability: "Detects mismatches between API gateway JWT claims, service-to-service headers, and downstream authorization decisions.",
    status: "Enabled",
    findingsLinked: 2,
  },
  {
    id: "MOD-02",
    name: "Trust-Boundary Analyzer",
    capability: "Maps where untrusted parameters or identity assertions cross gateway, microservice, queue, and DB boundaries.",
    status: "Enabled",
    findingsLinked: 3,
  },
  {
    id: "MOD-03",
    name: "Database Authorization Analyzer",
    capability: "Verifies tenant_id predicates, PostgreSQL RLS policies, and row-level ownership filters on every query sink.",
    status: "Enabled",
    findingsLinked: 4,
  },
  {
    id: "MOD-04",
    name: "File & Object-Storage Analyzer",
    capability: "Correlates upload, download, path canonicalization (os.OpenRoot), and bucket policy boundaries.",
    status: "Enabled",
    findingsLinked: 1,
  },
  {
    id: "MOD-05",
    name: "Message-Queue Security Analyzer",
    capability: "Audits producer/consumer schema validation, dead-letter replay safety, and principal context across Kafka/RabbitMQ workers.",
    status: "Enabled",
    findingsLinked: 1,
  },
  {
    id: "MOD-06",
    name: "Cache Security Analyzer",
    capability: "Detects unsafe shared caching of tenant-scoped or authorization-dependent responses (Vary / Cache-Control).",
    status: "Enabled",
    findingsLinked: 0,
  },
  {
    id: "MOD-07",
    name: "Cryptographic-Use Analyzer",
    capability: "Reviews algorithm selection, key rotation, IV/nonce uniqueness, and JWT signature verification rules.",
    status: "Enabled",
    findingsLinked: 2,
  },
  {
    id: "MOD-08",
    name: "Configuration Differential Analyzer",
    capability: "Compares source, container build, staging, and production settings for drift in auth, CORS, and debug flags.",
    status: "Enabled",
    findingsLinked: 2,
  },
  {
    id: "MOD-09",
    name: "Error & Side-Channel Analyzer",
    capability: "Checks whether stack traces, differential status codes, or response timing leak sensitive state.",
    status: "Standby (Opt-in)",
    findingsLinked: 0,
  },
  {
    id: "MOD-10",
    name: "Security Regression Intelligence",
    capability: "Reuses historical proof contracts and counterexamples to detect vulnerability recurrence across branches and releases.",
    status: "Enabled",
    findingsLinked: 5,
  },
] as const;

// ── Security Mutation Testing & Cross-Service Tracing ────────────
export const MUTATION_TESTING_SUMMARY = {
  mutantsSeeded: 40,
  mutantsDetectedAndProven: 39,
  mutationScore: "97.5%",
  recentMutants: [
    {
      mutantId: "MUT-01",
      operator: "RemoveTenantPredicateMutator",
      target: "app/api/routes/invoices.py:74",
      description: "Stripped Invoice.tenant_id == current_user.tenant_id from SQLAlchemy WHERE clause in fixture branch.",
      detectedBy: "P1 Authorization Validator + CTR-01 Contract (310 ms)",
      status: "KILLED (Detected)",
    },
    {
      mutantId: "MUT-02",
      operator: "DowngradePreparedStatementMutator",
      target: "OrderDao.java:118",
      description: "Replaced parameterized ? binding with string concatenation in disposable test build.",
      detectedBy: "P2 SQL Structure Validator + XTRIKE-Trace JDBC Span Check (390 ms)",
      status: "KILLED (Detected)",
    },
    {
      mutantId: "MUT-03",
      operator: "BypassApprovalStateTransitionMutator",
      target: "payouts/stateMachine.py:92",
      description: "Permitted DRAFT -> SETTLED transition without secondary approver principal.",
      detectedBy: "CTR-02 Segregation of Duties Contract (240 ms)",
      status: "KILLED (Detected)",
    },
  ],
};


// ── Defensive Reference Catalog (OWASP Top 10 · MITRE CWE · NIST NVD · NIST 800-53) ──
export const OWASP_CWE_NVD_CATALOG = {
  owaspTop10: [
    {
      code: "A01:2021",
      title: "Broken Access Control",
      cwes: ["CWE-862", "CWE-863", "CWE-639", "CWE-22", "CWE-285"],
      nistControls: ["AC-3 (Access Enforcement)", "AC-6 (Least Privilege)", "AC-16 (Security Attributes)"],
      defensiveChecks: [
        "Verify route decorator or middleware enforces principal authentication.",
        "Verify database query predicates include tenant_id / owner_id bound from session context.",
        "Verify file path operations use canonical root confinement (os.OpenRoot / realpath prefix).",
      ],
      remediationStandard:
        "Enforce server-side resource ownership and role checks on every controller and repository query.",
    },
    {
      code: "A02:2021",
      title: "Cryptographic Failures",
      cwes: ["CWE-327", "CWE-328", "CWE-798", "CWE-330"],
      nistControls: ["SC-12 (Key Establishment)", "SC-13 (Cryptographic Protection)", "SC-28 (Protection of Info at Rest)"],
      defensiveChecks: [
        "Confirm AEAD algorithms (AES-GCM, ChaCha20-Poly1305) and modern password hashing (Argon2id).",
        "Confirm secrets are loaded from environment or KMS rather than source literals.",
      ],
      remediationStandard:
        "Use approved cryptographic primitives with unique nonces and managed key stores.",
    },
    {
      code: "A03:2021",
      title: "Injection",
      cwes: ["CWE-89", "CWE-79", "CWE-78", "CWE-94"],
      nistControls: ["SI-10 (Information Input Validation)", "SI-15 (Information Output Filtering)"],
      defensiveChecks: [
        "Confirm SQL statements use parameterized placeholders ($1, ?) or ORM bound expressions.",
        "Confirm HTML/DOM sinks apply context-aware auto-escaping or approved HTML sanitization.",
        "Confirm subprocess calls pass argument arrays with shell=False.",
      ],
      remediationStandard:
        "Separate untrusted data from code/commands using parameterized APIs and context-aware encoding.",
    },
    {
      code: "A04:2021",
      title: "Insecure Design",
      cwes: ["CWE-840", "CWE-799", "CWE-209"],
      nistControls: ["SA-8 (Security Engineering Principles)", "SA-11 (Developer Testing)", "SC-5 (DoS Protection)"],
      defensiveChecks: [
        "Verify workflow state machines enforce prerequisite approval transitions.",
        "Verify segregation-of-duties invariants (creator principal != approver principal).",
      ],
      remediationStandard:
        "Encode business-logic invariants and state-transition preconditions explicitly in domain services.",
    },
    {
      code: "A05:2021",
      title: "Security Misconfiguration",
      cwes: ["CWE-16", "CWE-611", "CWE-942"],
      nistControls: ["CM-2 (Baseline Configuration)", "CM-6 (Configuration Settings)", "CM-7 (Least Functionality)"],
      defensiveChecks: [
        "Verify XML parsers disable external entities (disallow-doctype-decl).",
        "Verify CORS, CSP, and Cache-Control headers match production policy.",
      ],
      remediationStandard:
        "Harden parser defaults, lock security headers, and detect configuration drift across environments.",
    },
    {
      code: "A06:2021",
      title: "Vulnerable and Outdated Components",
      cwes: ["CWE-1104", "CWE-1395"],
      nistControls: ["RA-5 (Vulnerability Monitoring)", "SI-2 (Flaw Remediation)", "SR-3 (Supply Chain Controls)"],
      defensiveChecks: [
        "Cross-reference lockfile versions against NVD advisories.",
        "Inspect call graph to determine whether vulnerable library symbols are reachable.",
      ],
      remediationStandard:
        "Upgrade affected dependencies and verify call-graph reachability for transitive packages.",
    },
    {
      code: "A07:2021",
      title: "Identification and Authentication Failures",
      cwes: ["CWE-287", "CWE-306", "CWE-384", "CWE-613"],
      nistControls: ["IA-2 (Identification & Authentication)", "IA-8 (Non-Org Users)", "AC-12 (Session Termination)"],
      defensiveChecks: [
        "Verify JWT verification enforces explicit algorithm allowlists (blocks alg='none').",
        "Verify token revocation / session invalidation checks on logout and rotation.",
      ],
      remediationStandard:
        "Enforce strict token verification, rotation, and revocation checks.",
    },
    {
      code: "A08:2021",
      title: "Software and Data Integrity Failures",
      cwes: ["CWE-502", "CWE-829", "CWE-345"],
      nistControls: ["SI-7 (Software & Information Integrity)", "SA-12 (Supply Chain Protection)"],
      defensiveChecks: [
        "Verify deserialization uses safe schema-validated parsers (JSON/Protobuf) instead of native object deserializers.",
        "Verify webhook and artifact signatures before processing.",
      ],
      remediationStandard:
        "Avoid unsafe native deserialization and verify cryptographic signatures on external artifacts.",
    },
    {
      code: "A09:2021",
      title: "Security Logging and Monitoring Failures",
      cwes: ["CWE-778", "CWE-117", "CWE-532"],
      nistControls: ["AU-2 (Event Logging)", "AU-3 (Content of Audit Records)", "AU-9 (Protection of Audit Info)"],
      defensiveChecks: [
        "Verify authorization denials and state changes emit structured audit events.",
        "Verify structured logs redact tokens, passwords, and PII fields.",
      ],
      remediationStandard:
        "Emit structured, tamper-evident audit logs with automatic secret redaction.",
    },
    {
      code: "A10:2021",
      title: "Server-Side Request Forgery (SSRF)",
      cwes: ["CWE-918"],
      nistControls: ["SC-7 (Boundary Protection)", "AC-4 (Information Flow Enforcement)", "SI-10 (Input Validation)"],
      defensiveChecks: [
        "Verify outbound URLs pass through hostname allowlists and DNS-pinned IP range checks.",
        "Verify HTTP clients disable automatic redirects or re-validate every redirect target.",
      ],
      remediationStandard:
        "Block RFC-1918, loopback, and link-local IP ranges after DNS resolution and disable unvalidated redirects.",
    },
  ],
  nvdAdvisories: [
    {
      cveId: "CVE-2024-1597",
      cweId: "CWE-89",
      ecosystem: "Maven",
      packageName: "org.postgresql:postgresql",
      affectedRange: "< 42.7.2",
      patchedVersion: "42.7.2",
      cvss: 9.8,
      severity: "Critical",
      vulnerableSymbol: "PGSimpleDataSource.setPreferQueryMode('simple')",
      reachabilityCheck: "Verify whether preferQueryMode=simple is configured; default extended mode is not vulnerable.",
    },
    {
      cveId: "CVE-2024-3456",
      cweId: "CWE-287",
      ecosystem: "npm",
      packageName: "jsonwebtoken-fast-verify",
      affectedRange: "< 3.1.4",
      patchedVersion: "3.1.4",
      cvss: 8.7,
      severity: "High",
      vulnerableSymbol: "verifyToken(token, { algorithms })",
      reachabilityCheck: "Check whether verifyToken is invoked without an explicit non-empty algorithms array.",
    },
    {
      cveId: "CVE-2023-44487",
      cweId: "CWE-400",
      ecosystem: "Go",
      packageName: "golang.org/x/net/http2",
      affectedRange: "< 0.17.0",
      patchedVersion: "0.17.0",
      cvss: 7.5,
      severity: "High",
      vulnerableSymbol: "http2.Server.ServeConn",
      reachabilityCheck: "Verify whether HTTP/2 listener is exposed directly or terminated by an updated ingress proxy.",
    },
  ],
} as const;
