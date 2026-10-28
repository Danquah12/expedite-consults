import type { SASTFinding } from "@/types/sast";
import { calculateCvss31BaseScore, cvss31QualitativeSeverity } from "@/lib/cvss31";

const RAW_FINDINGS: SASTFinding[] = [
  // ─── CRITICAL (CVSS 9.0 – 10.0) ─────────────────────────────────────────────
  {
    id: "F-001",
    title: "SQL Injection via Unsanitized String Concatenation / Interpolation",
    severity: "Critical",
    status: "Open",
    cwe: "CWE-89",
    cweName: "Improper Neutralization of Special Elements used in an SQL Command",
    cvss: 9.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    cvssRationale:
      "Base 9.8 Critical: Unauthenticated network request parameter is concatenated directly into a dynamic SQL statement without parameter binding; runtime CIA impact depends on endpoint auth filters and DB role privileges.",
    epss: 0.421,
    mitre: "T1190",
    owasp: "A03:2021",
    owaspCategory: "Injection",
    proofState: "DATAFLOW_CONFIRMED",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "Intra-procedural AST & SSA dataflow confirmed an unbroken path from @RequestParam String account (line 9) to Statement.executeQuery(query) (line 12) with 0 local sanitizers; upstream servlet filters and DB connection role privileges are not modeled statically.",
    auditDisposition:
      "Credible SQLi Candidate (Dataflow Confirmed) — Runtime Exploitation & DB Privilege Scope Pending Isolated Verification",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/main/java/org/owasp/webgoat/lessons/sqlinjection/introduction/SqlInjectionLesson5a.java",
    line: 12,
    snippetStartLine: 6,
    codeSnippet: `@RestController
public class SqlInjectionLesson5a {
    @PostMapping("/SqlInjection/attack5a")
    public String injectableQuery(@RequestParam String account, Connection connection) throws Exception {
        String query = "SELECT * FROM user_data WHERE first_name = 'John' AND last_name = '" + account + "'";
        Statement statement = connection.createStatement();
        ResultSet results = statement.executeQuery(query);
        return results.toString();
    }
}`,
    language: "Java",
    source: "@RequestParam String account",
    sink: "ResultSet results = statement.executeQuery(query);",
    taintPath: [
      "public String injectableQuery(@RequestParam String account, Connection connection) throws Exception {",
      "String query = \"SELECT * FROM user_data WHERE first_name = 'John' AND last_name = '\" + account + \"'\";",
      "ResultSet results = statement.executeQuery(query);",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.95, confirmed: true, details: "XTRIKE-XQL/High_Risk/SQL_Injection_Dynamic_Query · BFL at SqlInjectionLesson5a.java:10" },
      { name: "XTRIKE DeepFlow",  confidence: 0.94, confirmed: true, details: "DEEPFLOW-SQLI-TAINT-001 · Taint trace line 9 -> line 10 -> sink line 12" },
      { name: "XTRIKE StructSCA", confidence: 0.95, confirmed: true, details: "[Dataflow] Kingdom: Input Validation and Representation" },
      { name: "XTRIKE AST-Query", confidence: 0.92, confirmed: true, details: "AST DataFlow query matched CWE-89 sink in injectableQuery (line 12)" },
    ],
    confidence: 0.94,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Very Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Executes a dynamic SQL SELECT query against table 'user_data' via Statement.executeQuery(query). Unverified Hypothesis: Database write/DDL access or remote code execution (RCE) via DB extensions are NOT established by the displayed code.",
    attackPath: [
      { label: "1. Source Identified (Line 9)", type: "entry", description: "@RequestParam String account in injectableQuery()" },
      { label: "2. Taint Propagation (Line 10)", type: "vulnerability", description: "String concatenation into SQL query without parameter binding" },
      { label: "3. Dangerous Sink (Line 12)", type: "asset", description: "statement.executeQuery(query) executes SELECT on user_data" },
      { label: "4. Runtime Validation Gate", type: "lateral", description: "Requires isolated test environment to verify SQL predicate alteration" },
      { label: "Hypothesized Impact", type: "impact", description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Potential unauthorized read disclosure from user_data; DB write access and RCE are not proved by this method." },
    ],
    executiveSummary:
      "Static AST and dataflow analysis identified a credible SQL injection candidate: the request parameter 'account' (line 9) is concatenated into a SQL query string (line 10) and passed to Statement.executeQuery(query) (line 12) with zero sanitizers in the local method scope. While dataflow is confirmed statically, runtime exploitability, endpoint authentication middleware, and downstream database privileges require isolated runtime verification.",
    businessImpact:
      "If reachable and unmitigated by upstream filters, an attacker can alter the WHERE predicate of the SELECT query on 'user_data' to read unauthorized rows. Claims of database write access, schema tampering, or remote code execution are unverified hypotheses not established by the displayed code.",
    rootCause:
      "Dynamic SQL string concatenation (\"... last_name = '\" + account + \"'\") is used instead of a parameterized PreparedStatement with bound '?' placeholders.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Prevent injection attacks via parameterized queries" },
      { framework: "NIST 800-53",  reference: "SI-10",     description: "Information input validation & parameterization" },
      { framework: "ISO 27001",    reference: "A.8.28",    description: "Secure coding principles" },
      { framework: "OWASP Top 10", reference: "A03:2021",  description: "Injection (OWASP ASVS v4.0.3 5.3.4)" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Replace Statement string concatenation with a parameterized PreparedStatement using try-with-resources and bind every dynamic parameter explicitly (1-indexed). Verify with a unit test that tautology payloads (' OR '1'='1) are bound as literal strings.",
        code: `// ❌ VULNERABLE (Lines 10–12)
String query = "SELECT * FROM user_data WHERE first_name = 'John' AND last_name = '" + account + "'";
Statement statement = connection.createStatement();
ResultSet results = statement.executeQuery(query);

// ✅ FIXED — Parameterized PreparedStatement + try-with-resources + Regression Test
String sql = "SELECT * FROM user_data WHERE first_name = ? AND last_name = ?";
try (PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setString(1, "John");
    statement.setString(2, account); // Bound as literal parameter at index 2 (or index 1 if first_name is static)
    try (ResultSet results = statement.executeQuery()) {
        return formatResults(results);
    }
}

// ✅ REGRESSION TEST (JUnit 5 — TC-SQLI-089-001)
@Test
void sqlMetacharactersRemainLiteralParameter() throws Exception {
    String payload = "Smith' OR '1'='1";
    injectableQuery(payload, connection);
    verify(preparedStatement).setString(1, "John");
    verify(preparedStatement).setString(2, payload);
}`,
      },
    ],
    regressionTest:
      "TC-SQLI-089-001: Replay account=\"Smith' OR '1'='1\" against PreparedStatement and assert 0 extra rows are returned and SQL AST structure is invariant.",
    validationSteps: [
      "1. Source & Sink Audit: Confirm @RequestParam String account (line 9) is bound via PreparedStatement.setString(...) before executeQuery() (line 12).",
      "2. Controlled Runtime Probe (TC-SQLI-089-001): Send baseline 'account=Smith' vs. boolean probe \"account=Smith' OR '1'='1\" in an isolated test environment.",
      "3. Mitigation Retest: After applying PreparedStatement, replay \"account=Smith' OR '1'='1\" and verify the input is treated as a literal last_name value with zero SQL predicate alteration.",
      "4. Static Regression Gate: Re-run XTRIKE XQL & AST-Query java/sql-injection rules on commit SHA to confirm 0 remaining concatenation paths.",
    ],
    slaDeadline: "2026-10-30",
    owner: "Backend Team",
    application: "OWASP/WebGoat",
    riskScore: 95,
    firstDetected: "2026-10-24",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-002",
    title: "Insecure Deserialization of Untrusted Data",
    severity: "Critical",
    status: "Open",
    cwe: "CWE-502",
    cweName: "Deserialization of Untrusted Data",
    cvss: 9.0,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:L",
    cvssRationale:
      "Base 9.0 Critical: Base64-decoded HTTP cookie bytes flow directly into Java ObjectInputStream.readObject() without a JEP 290 ObjectInputFilter; RCE blast radius requires compatible gadget classes on the runtime classpath.",
    epss: 0.089,
    mitre: "T1059",
    owasp: "A08:2021",
    owaspCategory: "Software and Data Integrity Failures",
    proofState: "DATAFLOW_CONFIRMED",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "Static dataflow confirmed Cookie value -> Base64.decode() -> ByteArrayInputStream -> ObjectInputStream.readObject() with no ObjectInputFilter in SessionManager.java; runtime gadget chain availability on the JVM classpath is an unverified hypothesis.",
    auditDisposition:
      "Dataflow-Confirmed Untrusted Java Deserialization Sink (CWE-502) — Replace Java Serialization with Signed JSON/Opaque Session ID or Enforce JEP 290 ObjectInputFilter",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/main/java/com/api/SessionManager.java",
    line: 87,
    snippetStartLine: 80,
    codeSnippet: `public SessionPayload restoreSession(HttpServletRequest request) throws Exception {
    Cookie sessionCookie = request.getCookies()[0];
    byte[] data = Base64.getDecoder().decode(sessionCookie.getValue());
    ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
    Object obj = ois.readObject(); // Line 87: Unfiltered native Java deserialization
    return (SessionPayload) obj;
}`,
    language: "Java",
    source: "request.getCookies()",
    sink: "ObjectInputStream.readObject()",
    taintPath: [
      "Cookie sessionCookie = request.getCookies()[0]",
      "byte[] data = Base64.getDecoder().decode(sessionCookie.getValue())",
      "ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data))",
      "Object obj = ois.readObject()",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.95, confirmed: true, details: "XTRIKE-XQL/High_Risk/Deserialization_of_Untrusted_Data at SessionManager.java:87" },
      { name: "XTRIKE DeepFlow",  confidence: 0.93, confirmed: true, details: "Cookie value flows to ObjectInputStream.readObject() unsanitized" },
      { name: "XTRIKE StructSCA", confidence: 0.96, confirmed: true, details: "[Structural] Kingdom: Input Validation and Representation" },
      { name: "XTRIKE AST-Query", confidence: 0.92, confirmed: true, details: "java.io.ObjectInputStream without setObjectInputFilter()" },
    ],
    confidence: 0.94,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Unfiltered instantiation of arbitrary serializable classes from HTTP cookie bytes. Unverified Hypothesis: Remote code execution (RCE) under the JVM service account if compatible gadget libraries exist on the runtime classpath.",
    attackPath: [
      { label: "1. Cookie Input (Line 81)",     type: "entry",         description: "request.getCookies()[0].getValue() decoded from Base64" },
      { label: "2. Byte Stream (Line 83)",      type: "vulnerability", description: "Wrapped in ByteArrayInputStream without HMAC or schema check" },
      { label: "3. readObject() Sink (Line 87)",type: "asset",         description: "ObjectInputStream.readObject() invoked with no ObjectInputFilter" },
      { label: "4. Classpath Gadget Gate",      type: "lateral",       description: "Requires runtime classpath audit for gadget chains" },
      { label: "Hypothesized Impact",           type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Potential JVM RCE or denial-of-service via object graph exhaustion" },
    ],
    executiveSummary:
      "Static dataflow analysis confirmed that untrusted HTTP cookie data is Base64-decoded and passed directly to Java's ObjectInputStream.readObject() at SessionManager.java:87 without a JEP 290 ObjectInputFilter or cryptographic authentication. While the unsafe deserialization sink is confirmed statically, remote code execution depends on the presence of exploitable gadget classes on the runtime classpath.",
    businessImpact:
      "If compatible gadget chains exist on the server classpath, an attacker can execute arbitrary code or cause JVM denial-of-service via deeply nested object graphs.",
    rootCause:
      "Java native serialization (ObjectInputStream) is used on client-controlled cookie state instead of an opaque server-side session identifier or a signed, schema-validated JSON DTO.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Protect against unsafe deserialization attacks" },
      { framework: "NIST 800-53",  reference: "SI-10",     description: "Information Input Validation" },
      { framework: "OWASP Top 10", reference: "A08:2021",  description: "Software and Data Integrity Failures (ASVS v4.0.3 5.5.3)" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Preferred fix: Replace Java ObjectInputStream on cookies with an opaque server-side session ID or a signed JSON DTO parsed with explicit schema binding. If legacy Java serialization cannot be removed immediately, enforce a strict JEP 290 ObjectInputFilter restricting depth, array length, object references, and exact class allowlist.",
        code: `// ❌ VULNERABLE (SessionManager.java:83–87)
ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
Object obj = ois.readObject();

// ✅ PREFERRED FIX — Replace Java Serialization with Explicit JSON DTO (No Polymorphic Type Handling)
public record SessionDto(String sessionId, String subjectId, long issuedAtEpochSec) {}
ObjectMapper mapper = JsonMapper.builder()
    .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
    .build(); // Do NOT enable activateDefaultTyping
SessionDto session = mapper.readValue(verifiedHmacPayloadBytes, SessionDto.class);

// ✅ DEFENSE-IN-DEPTH (If ObjectInputStream Must Temporarily Remain) — JEP 290 ObjectInputFilter
ObjectInputFilter sessionFilter = ObjectInputFilter.Config.createFilter(
    "maxdepth=2;maxarray=32;maxrefs=64;maxbytes=4096;com.api.dto.SessionPayload;!*"
);
try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data))) {
    ois.setObjectInputFilter(sessionFilter);
    SessionPayload payload = (SessionPayload) ois.readObject();
}`,
      },
    ],
    regressionTest:
      "TC-DESER-502-001: Attempt to deserialize a non-allowlisted class descriptor (e.g., java.util.PriorityQueue) and assert InvalidClassException / filter status REJECTED.",
    validationSteps: [
      "1. Verify Java ObjectInputStream is replaced by signed JSON DTO or opaque server-side session lookup.",
      "2. If JEP 290 ObjectInputFilter is used, test that non-allowlisted classes, arrays > 32 elements, and depth > 2 throw InvalidClassException.",
      "3. Re-run XTRIKE AST-Query java/unsafe-deserialization rule to confirm 0 unfiltered readObject() calls.",
    ],
    slaDeadline: "2026-10-30",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 92,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  // ─── HIGH (CVSS 7.0 – 8.9) ─────────────────────────────────────────────────
  {
    id: "F-003",
    title: "IDOR — Broken Object Level Authorization (Missing Resource Ownership Guard)",
    severity: "High",
    status: "Open",
    cwe: "CWE-639",
    cweName: "Authorization Bypass Through User-Controlled Key",
    cvss: 8.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N",
    cvssRationale:
      "Base 8.1 High: Authenticated endpoint looks up Account records by user-supplied accountId without a caller-ownership or tenant-scope predicate in the controller or repository call.",
    epss: 0.074,
    mitre: "T1078",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    proofState: "GUARD_ANALYZED",
    evidenceType: "AUTHORIZATION_ENFORCEMENT",
    modeledAssumptions:
      "Control-flow & guard analysis inspected AccountController.getAccount() (line 213) and found no SecurityContext principal comparison, @PreAuthorize annotation, or tenant-scoped repository query; external API gateway policies or DB Row-Level Security (RLS) are not modeled statically.",
    auditDisposition:
      "Guard-Analyzed Missing Object-Level Ownership Predicate (CWE-639) — Verify Across Read/Update/Delete Endpoints with Two-Account Cross-Tenant Test",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/main/java/com/api/AccountController.java",
    line: 213,
    snippetStartLine: 208,
    codeSnippet: `@GetMapping("/api/accounts/{accountId}")
public ResponseEntity<Account> getAccount(@PathVariable String accountId, HttpServletRequest request) {
    // Line 213: Direct repository lookup by user-supplied key without principal ownership check
    Account acct = accountRepository.findById(accountId).orElseThrow();
    return ResponseEntity.ok(acct);
}`,
    language: "Java",
    source: "@PathVariable String accountId",
    sink: "accountRepository.findById(accountId)",
    taintPath: [
      "@GetMapping(\"/api/accounts/{accountId}\")",
      "Account acct = accountRepository.findById(accountId).orElseThrow(); // Guard analysis: 0 principal/tenant ownership checks in controller",
      "return ResponseEntity.ok(acct);",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.88, confirmed: true,  details: "Missing authorization guard before accountRepository.findById(accountId)" },
      { name: "XTRIKE DeepFlow",  confidence: 0.87, confirmed: false, details: "Identifier reaches repository; external filter/AOP aspects require verification" },
      { name: "XTRIKE StructSCA", confidence: 0.90, confirmed: true,  details: "[Control Flow] No principal ownership predicate in local call graph" },
      { name: "XTRIKE AST-Query", confidence: 0.85, confirmed: true,  details: "IDOR/BOLA pattern: user-controlled key -> findById without owner scope" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Controller method retrieves Account entity solely by accountId without checking caller ownership. Unverified Hypothesis: Horizontal access to other tenants' financial records if no upstream AOP/RLS guard enforces ownership.",
    attackPath: [
      { label: "1. Authenticated Principal",      type: "entry",         description: "Authenticated user session (User A)" },
      { label: "2. Missing Ownership Guard",      type: "vulnerability", description: "AccountController.java:213 calls findById(accountId) without ownerId" },
      { label: "3. Repository Query",             type: "lateral",       description: "Loads Account record regardless of authenticated principal" },
      { label: "4. Two-Account Verification Gate",type: "asset",         description: "Requires cross-account test (User A requesting User B's accountId)" },
      { label: "Hypothesized Impact",             type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Horizontal privilege escalation across customer accounts" },
    ],
    executiveSummary:
      "Static guard analysis of AccountController.java:213 shows that accountRepository.findById(accountId) is called using the request's accountId without verifying that the authenticated principal owns or is authorized for that account in the controller method. Note that a user-controlled ID reaching a repository lookup is not by itself sufficient proof of IDOR—exploitation depends on the absence of ownership enforcement in service/AOP layers or database RLS.",
    businessImpact:
      "If no upstream authorization aspect or row-level security policy enforces account ownership, any authenticated user can read or modify another customer's account record by substituting accountId.",
    rootCause:
      "Object lookup uses only the primary key (findById(accountId)) instead of scoping queries to the authenticated principal and tenant across read, update, and delete operations.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 7.2.1", description: "Restrict access to system components and data by role/ownership" },
      { framework: "OWASP Top 10", reference: "A01:2021",  description: "Broken Access Control (OWASP API1:2023 BOLA)" },
      { framework: "NIST 800-53",  reference: "AC-3",      description: "Access enforcement" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Enforce resource ownership in the service/repository layer across all read, update, and delete operations by scoping queries to the authenticated principal ID and tenant ID (and/or policy-based @PreAuthorize). Verify with a two-account integration test.",
        code: `// ❌ VULNERABLE (AccountController.java:213 — Unscoped lookup by ID alone)
Account acct = accountRepository.findById(accountId).orElseThrow();
return ResponseEntity.ok(acct);

// ✅ FIXED — Scope Read/Update/Delete Queries to Authenticated Principal & Tenant
@GetMapping("/api/accounts/{accountId}")
public ResponseEntity<AccountDto> getAccount(
        @PathVariable String accountId,
        @AuthenticationPrincipal JwtAuthenticatedUser principal) {
    Account acct = accountRepository
        .findByIdAndOwnerUserIdAndTenantId(accountId, principal.userId(), principal.tenantId())
        .orElseThrow(() -> new AccessDeniedException("Account ownership verification failed"));
    return ResponseEntity.ok(AccountDto.from(acct));
}

// ✅ TWO-ACCOUNT INTEGRATION TEST (TC-IDOR-639-001)
@Test
void userACannotReadOrUpdateUserBAccount() throws Exception {
    mockMvc.perform(get("/api/accounts/{id}", userBAccountId).with(jwt().jwt(userAToken)))
           .andExpect(status().isForbidden());
}`,
      },
    ],
    regressionTest:
      "TC-IDOR-639-001: Authenticate as User A and invoke GET/PUT/DELETE /api/accounts/{userBAccountId}; assert HTTP 403 Forbidden.",
    validationSteps: [
      "1. Audit controller, service, and Spring Security AOP interceptors to verify whether ownership checks exist outside the controller.",
      "2. Execute two-account integration test (User A requesting User B's accountId across GET, PUT, DELETE) and confirm HTTP 403.",
      "3. Re-run XTRIKE AST-Query authorization-guard rules to confirm all repository lookups bind principal/tenant ownership.",
    ],
    slaDeadline: "2026-11-03",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 78,
    firstDetected: "2026-08-17",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-004",
    title: "Server-Side Request Forgery (SSRF) via Unvalidated Outbound Webhook URL",
    severity: "High",
    status: "Open",
    cwe: "CWE-918",
    cweName: "Server-Side Request Forgery (SSRF)",
    cvss: 8.6,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N",
    cvssRationale:
      "Base 8.6 High: User-controlled req.body.callbackUrl is passed directly to axios.get() without HTTPS scheme pinning, hostname allowlisting, DNS-resolved IP validation, or redirect disabling (Scope: Changed).",
    epss: 0.061,
    mitre: "T1190",
    owasp: "A10:2021",
    owaspCategory: "Server-Side Request Forgery",
    proofState: "DATAFLOW_CONFIRMED",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "Intra-procedural AST dataflow confirmed req.body.callbackUrl (line 54) flows directly into axios.get(callbackUrl) (line 56) with 0 URL, DNS, or redirect guards; cloud VPC egress firewall rules and IMDSv2 hop limits are not modeled statically.",
    auditDisposition:
      "Dataflow-Confirmed Outbound SSRF Sink (CWE-918) — Enforce HTTPS Allowlist, DNS-Resolved IP Validation, and maxRedirects: 0",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/webhook.controller.ts",
    line: 56,
    snippetStartLine: 52,
    codeSnippet: `export async function triggerWebhookPreview(req: Request, res: Response) {
  const callbackUrl = String(req.body.callbackUrl || "");
  // Line 56: Direct outbound HTTP request to user-controlled URL
  const response = await axios.get(callbackUrl);
  return res.status(200).json({ status: response.status });
}`,
    language: "TypeScript",
    source: "req.body.callbackUrl",
    sink: "axios.get(callbackUrl)",
    taintPath: [
      "const callbackUrl = String(req.body.callbackUrl || \"\")",
      "const response = await axios.get(callbackUrl)",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.92, confirmed: true, details: "XTRIKE-XQL/High_Risk/SSRF_Outbound_Request at webhook.controller.ts:56" },
      { name: "XTRIKE DeepFlow",  confidence: 0.90, confirmed: true, details: "No scheme, DNS-resolved IP, or redirect guard in taint path" },
      { name: "XTRIKE StructSCA", confidence: 0.91, confirmed: true, details: "[Dataflow] URL flows directly to outbound HTTP client" },
      { name: "XTRIKE AST-Query", confidence: 0.89, confirmed: true, details: "nodejs/ssrf rule triggered on axios.get(callbackUrl)" },
    ],
    confidence: 0.91,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Server-side HTTP client sends GET request to an arbitrary caller-supplied URL. Unverified Hypothesis: Internal RFC-1918 service access or cloud metadata (169.254.169.254) read if egress routing permits and IMDSv1 is enabled.",
    attackPath: [
      { label: "1. Webhook Request (Line 54)",  type: "entry",         description: "POST /webhooks with user-supplied callbackUrl" },
      { label: "2. Missing URL/DNS Guard",      type: "vulnerability", description: "No scheme pin, host allowlist, DNS IP resolution check, or redirect block" },
      { label: "3. Outbound Sink (Line 56)",    type: "asset",         description: "axios.get(callbackUrl) executes server-side HTTP fetch" },
      { label: "4. Egress Network Gate",        type: "lateral",       description: "Depends on VPC egress routing and IMDSv2 configuration" },
      { label: "Hypothesized Impact",           type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Internal service reconnaissance or metadata exposure" },
    ],
    executiveSummary:
      "Static dataflow analysis confirmed that req.body.callbackUrl is passed directly to axios.get() at src/controllers/webhook.controller.ts:56 without scheme validation, hostname allowlisting, DNS resolution checks, or redirect disabling. Note that simple string prefix checks on url.hostname are insufficient because attackers can bypass them via DNS resolution to private IPs, HTTP 302 redirects, IPv6 local ranges, or alternate IP encodings.",
    businessImpact:
      "If outbound network egress is unrestricted, attackers can induce the application server to probe internal RFC-1918 services, localhost ports, or link-local metadata endpoints.",
    rootCause:
      "Outbound HTTP client invoked on raw user URL without pinning HTTPS, resolving DNS A/AAAA records to block loopback/RFC-1918/link-local/IPv6-unique-local addresses, and disabling HTTP redirects.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A10:2021", description: "Server-Side Request Forgery (OWASP ASVS v4.0.3 12.6.1)" },
      { framework: "NIST 800-53",  reference: "SC-7",     description: "Boundary protection & egress filtering" },
      { framework: "PCI DSS",      reference: "Req 6.2.4",description: "Prevent SSRF and unauthorized outbound connections" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Enforce HTTPS scheme and port 443, validate the hostname against an explicit partner allowlist, resolve all DNS A/AAAA records via dns.lookup({ all: true }) and block loopback/RFC-1918/link-local (169.254.0.0/16)/IPv6 local ranges Using parsed IP addresses (not string prefixes), and set maxRedirects: 0.",
        code: `// ❌ VULNERABLE (webhook.controller.ts:56 — Unvalidated URL + follows redirects + no DNS IP check)
const response = await axios.get(req.body.callbackUrl);

// ✅ FIXED — Scheme Pin + Host Allowlist + DNS-Resolved IP Check + maxRedirects: 0
import dns from "node:dns/promises";
import net from "node:net";
import https from "node:https";

const ALLOWED_HOSTS = new Set(["api.trusted.com", "hooks.partner.com"]);

function isInternalOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) || // AWS/Cloud link-local metadata 169.254.169.254
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const norm = ip.toLowerCase();
  return norm === "::1" || norm.startsWith("fe80:") || norm.startsWith("fc") || norm.startsWith("fd") || norm.startsWith("::ffff:127.") || norm.startsWith("::ffff:169.254.");
}

const parsed = new URL(String(req.body.callbackUrl));
if (parsed.protocol !== "https:" || (parsed.port && parsed.port !== "443") || !ALLOWED_HOSTS.has(parsed.hostname)) {
  return res.status(400).json({ error: "Disallowed webhook destination" });
}
const resolvedRecords = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
if (resolvedRecords.length === 0 || resolvedRecords.some((r) => isInternalOrReservedIp(r.address))) {
  return res.status(400).json({ error: "Webhook resolved to internal or reserved IP address" });
}

const response = await axios.get(parsed.toString(), {
  timeout: 4000,
  maxRedirects: 0, // Block redirect-based SSRF bypass
  httpsAgent: new https.Agent({ lookup: (_host, _opts, cb) => cb(null, resolvedRecords[0].address, resolvedRecords[0].family) }),
});`,
      },
    ],
    regressionTest:
      "TC-SSRF-918-001: Test http://169.254.169.254/latest/meta-data/, IPv6 [::1], DNS record resolving to 10.0.0.1, and 302 redirect to 127.0.0.1; assert all 4 are rejected.",
    validationSteps: [
      "1. Verify http:// scheme, non-443 ports, and non-allowlisted hostnames return HTTP 400.",
      "2. Verify DNS resolution check rejects domains resolving to 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, and IPv6 ::1/fc00::/7.",
      "3. Verify maxRedirects: 0 prevents 301/302 redirect chains to internal addresses.",
    ],
    slaDeadline: "2026-11-03",
    owner: "API Team",
    application: "Webhook Service",
    riskScore: 81,
    firstDetected: "2026-08-16",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-005",
    title: "XML External Entity (XXE) Injection — Unhardened DocumentBuilderFactory",
    severity: "High",
    status: "In Progress",
    cwe: "CWE-611",
    cweName: "Improper Restriction of XML External Entity Reference",
    cvss: 7.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
    cvssRationale:
      "Base 7.5 High: DocumentBuilderFactory.newInstance() parses request XML input without disallow-doctype-decl or external entity restrictions.",
    epss: 0.043,
    mitre: "T1190",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST configuration and dataflow analysis confirmed DocumentBuilderFactory.newInstance() at XmlParserService.java:34 omits setFeature(disallow-doctype-decl, true) before parsing request.getInputStream().",
    auditDisposition:
      "Guard-Analyzed Unhardened XML Parser Configuration (CWE-611) — Enforce Fail-Closed DOCTYPE & External Entity Disabling",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/XmlParserService.java",
    line: 34,
    snippetStartLine: 29,
    codeSnippet: `public Document parseImportPayload(HttpServletRequest request) throws Exception {
    InputStream xmlInput = request.getInputStream();
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    // Line 34: External DTDs and entities are NOT disabled on DocumentBuilderFactory
    DocumentBuilder db = dbf.newDocumentBuilder();
    return db.parse(xmlInput);
}`,
    language: "Java",
    source: "request.getInputStream()",
    sink: "DocumentBuilder.parse(xmlInput)",
    taintPath: [
      "InputStream xmlInput = request.getInputStream()",
      "DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance() // Missing disallow-doctype-decl feature",
      "Document doc = dbf.newDocumentBuilder().parse(xmlInput)",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.91, confirmed: true, details: "XTRIKE-XQL/High_Risk/XXE_DocumentBuilderFactory at XmlParserService.java:34" },
      { name: "XTRIKE DeepFlow",  confidence: 0.85, confirmed: true, details: "XML InputStream reaches db.parse() without DTD guard" },
      { name: "XTRIKE StructSCA", confidence: 0.89, confirmed: true, details: "[Configuration] No setFeature(disallow-doctype-decl) call on factory" },
      { name: "XTRIKE AST-Query", confidence: 0.88, confirmed: true, details: "java.xxe rule matched DocumentBuilderFactory.newInstance()" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain:
      "Demonstrated (Static Scope): XML parser accepts DOCTYPE and external entity declarations. Unverified Hypothesis: Arbitrary local file disclosure or internal SSRF via XML entity expansion.",
    attackPath: [
      { label: "1. XML Request Stream",       type: "entry",         description: "request.getInputStream() passed to parseImportPayload()" },
      { label: "2. Unhardened Parser Config", type: "vulnerability", description: "DocumentBuilderFactory lacks disallow-doctype-decl" },
      { label: "3. DocumentBuilder.parse()",  type: "asset",         description: "Resolves <!ENTITY xxe SYSTEM ...> declarations" },
      { label: "Hypothesized Impact",         type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Local file read or internal HTTP entity fetch" },
    ],
    executiveSummary:
      "Static configuration and dataflow analysis confirmed that XmlParserService.java:34 instantiates DocumentBuilderFactory.newInstance() and parses request XML without disabling DOCTYPE declarations or external general/parameter entities.",
    businessImpact:
      "Attackers supplying XML with external entity references can read local files accessible to the JVM process or trigger server-side requests to internal hosts.",
    rootCause:
      "DocumentBuilderFactory is instantiated with default permissive entity resolution settings instead of fail-closed XXE hardening.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (OWASP ASVS v4.0.3 5.5.2)" },
      { framework: "NIST 800-53",  reference: "SI-10",    description: "Information Input Validation" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Disable DOCTYPE declarations and external general/parameter entities on DocumentBuilderFactory, clear external DTD/schema attributes, and fail closed if ParserConfigurationException is thrown.",
        code: `// ❌ VULNERABLE (XmlParserService.java:31–35)
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
DocumentBuilder db = dbf.newDocumentBuilder();
return db.parse(xmlInput);

// ✅ FIXED — Fail-Closed XXE Hardening on DocumentBuilderFactory
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
try {
    dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
    dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
    dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
    dbf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
    dbf.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
    dbf.setXIncludeAware(false);
    dbf.setExpandEntityReferences(false);
} catch (ParserConfigurationException ex) {
    throw new IllegalStateException("Fail-closed: XML parser rejected mandatory XXE hardening features", ex);
}
DocumentBuilder db = dbf.newDocumentBuilder();
return db.parse(xmlInput);`,
      },
    ],
    regressionTest:
      "TC-XXE-611-001: Submit XML payload containing <!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]> and assert SAXParseException (DOCTYPE is disallowed).",
    validationSteps: [
      "1. Parse XML containing <!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]> and verify SAXParseException is thrown immediately.",
      "2. Confirm ParserConfigurationException is not swallowed and fails closed.",
      "3. Re-run XTRIKE AST-Query java/xxe rule to confirm 0 unhardened XML parser factories.",
    ],
    slaDeadline: "2026-11-10",
    owner: "Integration Team",
    application: "Import Service",
    riskScore: 71,
    firstDetected: "2026-08-10",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-006",
    title: "JWT Verification Missing Explicit Algorithm Allowlist & Claim Constraints",
    severity: "High",
    status: "Open",
    cwe: "CWE-287",
    cweName: "Improper Authentication",
    cvss: 8.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    cvssRationale:
      "Base 8.8 High: jwt.verify(token, verificationKey) is invoked without an explicit algorithms allowlist, issuer, or audience constraint, creating risk of RS256-to-HS256 algorithm confusion depending on library version and key type.",
    epss: 0.051,
    mitre: "T1550.001",
    owasp: "A07:2021",
    owaspCategory: "Identification and Authentication Failures",
    proofState: "GUARD_ANALYZED",
    evidenceType: "AUTHORIZATION_ENFORCEMENT",
    modeledAssumptions:
      "Static AST inspection of auth.middleware.ts:22 confirmed jwt.verify(token, publicKey) is called without { algorithms, issuer, audience } options; whether 'none' or HS256 confusion is exploitable at runtime depends on the installed jsonwebtoken library version and key object type.",
    auditDisposition:
      "Guard-Analyzed Missing JWT Algorithm & Claim Pinning (CWE-287) — Pin Allowed Asymmetric Algorithm, Issuer, Audience & Key Type",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/middleware/auth.middleware.ts",
    line: 22,
    snippetStartLine: 17,
    codeSnippet: `export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  // Line 22: jwt.verify called without explicit algorithms, issuer, or audience allowlist
  const payload = jwt.verify(token, publicKey);
  req.user = payload;
  next();
}`,
    language: "TypeScript",
    source: "req.headers.authorization",
    sink: "jwt.verify(token, publicKey)",
    taintPath: [
      "const token = (req.headers.authorization || \"\").split(\" \")[1]",
      "const payload = jwt.verify(token, publicKey) // Options argument omitted: no algorithms/issuer/audience pinning",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.93, confirmed: true, details: "JWT verify called without explicit algorithms allowlist at auth.middleware.ts:22" },
      { name: "XTRIKE DeepFlow",  confidence: 0.89, confirmed: true, details: "Bearer token flows to jwt.verify() without algorithm/claim pinning" },
      { name: "XTRIKE StructSCA", confidence: 0.90, confirmed: true, details: "[Control Flow] Options parameter absent in jwt.verify call" },
      { name: "XTRIKE AST-Query", confidence: 0.91, confirmed: true, details: "jwt-missing-algorithms rule triggered" },
    ],
    confidence: 0.91,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): jwt.verify(token, publicKey) omits algorithms, issuer, and audience constraints. Unverified Hypothesis: Forged token acceptance via RS256->HS256 key confusion or alg:none (contingent on jsonwebtoken version and PEM string key handling).",
    attackPath: [
      { label: "1. Bearer Token Header",      type: "entry",         description: "Authorization header parsed in authenticateJwt()" },
      { label: "2. Unconstrained jwt.verify", type: "vulnerability", description: "jwt.verify(token, publicKey) omits algorithms/issuer/audience" },
      { label: "3. Library & Key Type Gate",  type: "lateral",       description: "Exploitability depends on jsonwebtoken version & PEM vs KeyObject" },
      { label: "Hypothesized Impact",         type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Potential authentication bypass via algorithm confusion" },
    ],
    executiveSummary:
      "Static guard analysis of src/middleware/auth.middleware.ts:22 confirmed that jwt.verify(token, publicKey) is invoked without an explicit algorithms allowlist, issuer, or audience option. While modern jsonwebtoken versions reject alg:none when a non-empty key is supplied, omitting algorithms:['RS256'] leaves the verifier exposed to RS256-to-HS256 algorithm confusion if publicKey is passed as a PEM string/Buffer in vulnerable configurations, as well as cross-service token replay when issuer/audience are unchecked.",
    businessImpact:
      "If the installed JWT library version and key format permit algorithm confusion or cross-audience token acceptance, an attacker could forge or replay tokens to impersonate application users.",
    rootCause:
      "jwt.verify() is invoked without pinning the expected asymmetric algorithm (algorithms: ['RS256']), expected issuer, expected audience, and a crypto.KeyObject public key.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A07:2021",  description: "Identification and Authentication Failures (ASVS v4.0.3 3.5.3)" },
      { framework: "PCI DSS",      reference: "Req 8.6.1", description: "Authentication mechanism security" },
      { framework: "NIST 800-53",  reference: "IA-5",      description: "Authenticator management" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Parse the verification key as a Node.js crypto.createPublicKey() KeyObject (which cannot be used as an HMAC secret) and explicitly enforce algorithms: ['RS256'], issuer, audience, and clockTolerance in jwt.verify().",
        code: `// ❌ VULNERABLE (auth.middleware.ts:22)
const payload = jwt.verify(token, publicKey);

// ✅ FIXED — Pin Asymmetric KeyObject, Allowed Algorithms, Issuer & Audience
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const RSA_PUBLIC_KEY = crypto.createPublicKey(process.env.JWT_RSA_PUBLIC_KEY_PEM!);

const payload = jwt.verify(token, RSA_PUBLIC_KEY, {
  algorithms: ["RS256"],
  issuer: "https://auth.xtrike-banking.internal",
  audience: "xtrike-enterprise-banking-api",
  clockTolerance: 5,
});`,
      },
    ],
    regressionTest:
      "TC-JWT-287-001: Submit tokens signed with alg='none', alg='HS256' (using the public PEM as HMAC secret), and wrong 'aud'; assert all return 401 Unauthorized.",
    validationSteps: [
      "1. Test token with alg:none and empty signature — confirm 401 rejection.",
      "2. Test token signed with HS256 using publicKey PEM bytes — confirm 401 rejection.",
      "3. Test token with mismatched iss or aud claim — confirm 401 rejection.",
    ],
    slaDeadline: "2026-10-30",
    owner: "Auth Team",
    application: "API Gateway",
    riskScore: 85,
    firstDetected: "2026-08-19",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-007",
    title: "Hardcoded AWS Credential Literal in Source Code (Provenance Verification Required)",
    severity: "High",
    status: "Open",
    cwe: "CWE-798",
    cweName: "Use of Hard-coded Credentials",
    cvss: 7.8,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    cvssRationale:
      "Base 7.8 High: Credential literals matching AWS access key ID and secret key format are embedded in storage.service.py; actual environmental risk requires verifying whether the key is a documentation placeholder or a live credential.",
    epss: 0.098,
    mitre: "T1552.001",
    owasp: "A07:2021",
    owaspCategory: "Identification and Authentication Failures",
    proofState: "NEEDS_MANUAL_VALIDATION",
    evidenceType: "SECRET_PROVENANCE",
    modeledAssumptions:
      "Secret-provenance analyzer detected 'AKIAIOSFODNN7EXAMPLE' and 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' at storage.service.py:11 — these exact strings match AWS's official documentation example keys, so human verification is required to confirm no live key was committed in git history.",
    auditDisposition:
      "Secret Provenance Check Required (NEEDS_MANUAL_VALIDATION) — Matches Known AWS Documentation Example Key (AKIAIOSFODNN7EXAMPLE); Remove Hardcoded Literal & Use IAM Role",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/storage.service.py",
    line: 11,
    snippetStartLine: 8,
    codeSnippet: `import boto3

def create_s3_client():
    # Line 11: Hardcoded AWS key literals (matches AWS documentation placeholder pattern)
    return boto3.client(
        "s3",
        aws_access_key_id="AKIAIOSFODNN7EXAMPLE",
        aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    )`,
    language: "Python",
    source: "aws_secret_access_key = \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"",
    sink: "boto3.client('s3', aws_access_key_id=..., aws_secret_access_key=...)",
    taintPath: [
      "aws_access_key_id = 'AKIAIOSFODNN7EXAMPLE' (Known AWS documentation example identifier)",
      "aws_secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'",
      "boto3.client('s3', aws_access_key_id=..., aws_secret_access_key=...)",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.99, confirmed: true, details: "Hardcoded string matches AWS access key format at storage.service.py:11" },
      { name: "XTRIKE DeepFlow",  confidence: 0.99, confirmed: true, details: "Credential literal passed directly to boto3.client('s3')" },
      { name: "XTRIKE StructSCA", confidence: 0.97, confirmed: true, details: "[Configuration] Embedded authenticator literal (CWE-798); flagged EXAMPLE suffix" },
      { name: "XTRIKE AST-Query", confidence: 0.99, confirmed: true, details: "secrets.hardcoded-aws-key rule triggered (NEEDS_MANUAL_VALIDATION)" },
    ],
    confidence: 0.99,
    reachable: true,
    internetFacing: false,
    authRequired: false,
    exploitabilityLevel: "Very Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Hardcoded credential arguments passed to boto3.client('s3'). Provenance Note: 'AKIAIOSFODNN7EXAMPLE' is AWS's well-known documentation example key, NOT an active production key unless replaced in deployment branches.",
    attackPath: [
      { label: "1. Source Literal (Line 11)", type: "entry",         description: "AKIAIOSFODNN7EXAMPLE hardcoded in storage.service.py" },
      { label: "2. Secret Provenance Gate",   type: "vulnerability", description: "Matches AWS official example fixture; check git history for real keys" },
      { label: "3. boto3.client('s3')",       type: "asset",         description: "Overrides IAM ambient credential chain with hardcoded strings" },
      { label: "Hypothesized Impact",         type: "impact",        description: "[NEEDS_MANUAL_VALIDATION] Live cloud compromise only if real keys exist in commit history" },
    ],
    executiveSummary:
      "Static secret analysis detected hardcoded AWS credential arguments in src/services/storage.service.py:11. Crucially, the values 'AKIAIOSFODNN7EXAMPLE' and 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' are AWS's well-known documentation example keys rather than active production credentials. However, passing hardcoded credential arguments to boto3.client() is a code-hygiene defect that bypasses the default IAM role provider chain and risks accidental live credential commits.",
    businessImpact:
      "If a developer replaces the placeholder with a real key in a branch or environment commit, anyone with repository access can extract the credential. Even with placeholder values, explicit credential arguments break IAM instance/IRSA role resolution.",
    rootCause:
      "boto3.client('s3') is initialized with explicit aws_access_key_id and aws_secret_access_key string literals instead of relying on IAM roles for service accounts (IRSA) or AWS Secrets Manager.",
    falsePositiveLikelihood: "Medium",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 8.6.2", description: "No hardcoded credentials in source code" },
      { framework: "NIST 800-53",  reference: "IA-5(7)",   description: "No embedded unencrypted authenticators" },
      { framework: "ISO 27001",    reference: "A.8.28",    description: "Secure coding — secret externalization" },
    ],
    remediation: [
      {
        platform: "Python",
        explanation:
          "Remove explicit aws_access_key_id and aws_secret_access_key literals from boto3.client() so the SDK resolves short-lived credentials automatically from the IAM execution role (IRSA / ECS task role), and audit git history for any non-example keys.",
        code: `# ❌ VULNERABLE (storage.service.py:11 — Hardcoded AWS credential arguments)
client = boto3.client(
    "s3",
    aws_access_key_id="AKIAIOSFODNN7EXAMPLE",
    aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
)

# ✅ FIXED — Use Ambient IAM Role / IRSA Credential Chain (Zero Credentials in Code)
import os
import boto3
from botocore.config import Config

def create_s3_client():
    region = os.environ.get("AWS_REGION", "us-east-1")
    return boto3.client("s3", region_name=region, config=Config(retries={"max_attempts": 3}))`,
      },
    ],
    regressionTest:
      "TC-SEC-798-001: Scan repository and git log for AKIA[0-9A-Z]{16} excluding approved mock fixtures; assert 0 hardcoded credential arguments in boto3.client().",
    validationSteps: [
      "1. Provenance Check: Confirm AKIAIOSFODNN7EXAMPLE is only a documentation placeholder and scan full git history for any non-example AKIA/ASIA keys.",
      "2. Remove hardcoded credential parameters from create_s3_client() so boto3 uses the IAM role provider chain.",
      "3. Enable pre-commit secret scanning to block future credential literals.",
    ],
    slaDeadline: "2026-10-30",
    owner: "DevOps Team",
    application: "Storage Service",
    riskScore: 79,
    firstDetected: "2026-08-20",
    lastSeen: "2026-10-26",
  },

  // ─── MEDIUM (CVSS 4.0 – 6.9) ───────────────────────────────────────────────
  {
    id: "F-008",
    title: "Cross-Site Request Forgery (CSRF) — State-Changing Endpoint",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-352",
    cweName: "Cross-Site Request Forgery (CSRF)",
    cvss: 6.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N",
    cvssRationale:
      "Base 6.5 Medium: State-changing POST /account/update-email endpoint mutates account email without verifying a synchronizer CSRF token when cookie-based sessions are in use.",
    epss: 0.024,
    mitre: "T1185",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    proofState: "GUARD_ANALYZED",
    evidenceType: "AUTHORIZATION_ENFORCEMENT",
    modeledAssumptions:
      "Guard analysis inspected AccountController.updateEmail() (line 78) and found no local CSRF token check; exploitability depends on whether cookie-based session authentication is used and whether Spring Security's global CsrfFilter is disabled.",
    auditDisposition:
      "Guard-Analyzed State-Changing Endpoint (CWE-352) — Verify Spring Security SecurityFilterChain CSRF Policy & SameSite Cookie Mode",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/AccountController.java",
    line: 78,
    snippetStartLine: 74,
    codeSnippet: `@PostMapping("/account/update-email")
public ResponseEntity<Void> updateEmail(HttpServletRequest request, Principal principal) {
    String email = request.getParameter("email");
    // Line 78: State-changing email update; requires active Spring Security CSRF filter if cookie-authenticated
    userService.updateEmail(principal.getName(), email);
    return ResponseEntity.noContent().build();
}`,
    language: "Java",
    source: "request.getParameter(\"email\")",
    sink: "userService.updateEmail(principal.getName(), email)",
    taintPath: [
      "@PostMapping(\"/account/update-email\")",
      "String email = request.getParameter(\"email\")",
      "userService.updateEmail(principal.getName(), email) // Guard analysis: verify global SecurityFilterChain CSRF enforcement",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.82, confirmed: true,  details: "State-changing POST endpoint evaluated for CSRF protection" },
      { name: "XTRIKE DeepFlow",  confidence: 0.75, confirmed: false, details: "Global Spring SecurityFilterChain must be checked for csrf() state" },
      { name: "XTRIKE StructSCA", confidence: 0.80, confirmed: false, details: "[Control Flow] CSRF token may be enforced in filter chain" },
      { name: "XTRIKE AST-Query", confidence: 0.78, confirmed: true,  details: "csrf-state-changing-post rule matched at AccountController.java:78" },
    ],
    confidence: 0.79,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain:
      "Demonstrated (Static Scope): POST /account/update-email updates user email. Unverified Hypothesis: Cross-origin account email takeover if authenticated via cookies with CSRF protection disabled.",
    attackPath: [
      { label: "1. Cross-Origin Page",     type: "entry",         description: "Authenticated user visits third-party page" },
      { label: "2. Auto-Submitted POST",   type: "vulnerability", description: "POST /account/update-email sent with ambient session cookie" },
      { label: "3. SecurityFilterChain",   type: "lateral",       description: "Exploitable only if Spring Security csrf() is disabled" },
      { label: "Hypothesized Impact",      type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Unauthorized email change on victim account" },
    ],
    executiveSummary:
      "Guard analysis flagged the state-changing POST /account/update-email endpoint at AccountController.java:78. If the application authenticates requests via ambient browser cookies and disables CSRF in SecurityFilterChain, cross-origin pages can forge email update requests.",
    businessImpact:
      "Unauthorized modification of customer contact email, facilitating account recovery hijacking.",
    rootCause:
      "CSRF protection disabled or unverified on cookie-authenticated state-changing endpoints.",
    falsePositiveLikelihood: "Medium",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021",  description: "Broken Access Control (OWASP ASVS v4.0.3 4.2.2)" },
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Prevent cross-site request forgery (CSRF)" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Use modern Spring Security 6 SecurityFilterChain DSL (not deprecated WebSecurityConfigurerAdapter) with CsrfTokenRequestAttributeHandler and HttpOnly CookieCsrfTokenRepository (or server-side session token repository).",
        code: `// ❌ DEPRECATED / INSECURE (Disabling CSRF on cookie-authenticated routes)
// http.csrf(AbstractHttpConfigurer::disable);

// ✅ FIXED — Spring Security 6 SecurityFilterChain with Active CSRF Protection
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    CookieCsrfTokenRepository tokenRepo = new CookieCsrfTokenRepository();
    tokenRepo.setCookieCustomizer(cookie -> cookie.secure(true).sameSite("Lax"));
    http.csrf(csrf -> csrf
        .csrfTokenRepository(tokenRepo)
        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
    );
    return http.build();
}`,
      },
    ],
    regressionTest:
      "TC-CSRF-352-001: Send POST /account/update-email with valid session cookie but missing X-XSRF-TOKEN header; assert HTTP 403 Forbidden.",
    validationSteps: [
      "1. Submit POST /account/update-email with session cookie and no CSRF token — confirm HTTP 403.",
      "2. Verify SecurityFilterChain bean enables http.csrf(...) for all cookie-authenticated endpoints.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 58,
    firstDetected: "2026-08-12",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-009",
    title: "Path Traversal — Arbitrary File Read via Uncanonicalized Pathname",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-22",
    cweName: "Improper Limitation of a Pathname to a Restricted Directory",
    cvss: 6.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
    cvssRationale:
      "Base 6.5 Medium: Authenticated query parameter 'filename' is passed to os.path.join(BASE_DIR, filename) and opened for reading without canonical path boundary containment.",
    epss: 0.038,
    mitre: "T1083",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    proofState: "DATAFLOW_CONFIRMED",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "Intra-procedural AST dataflow confirmed request.args.get('filename') flows through os.path.join(BASE_DIR, filename) directly into open(filepath).read() at FileController.py:44 with 0 realpath/commonpath checks.",
    auditDisposition:
      "Dataflow-Confirmed Path Traversal into File Read Sink (CWE-22) — Enforce os.path.realpath() + os.path.commonpath() Containment",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/FileController.py",
    line: 44,
    snippetStartLine: 39,
    codeSnippet: `BASE_DIR = "/app/files"

@app.get("/api/files")
def download_file():
    filename = request.args.get("filename", "")
    filepath = os.path.join(BASE_DIR, filename)
    # Line 44: Uncanonicalized path opened for reading (vulnerable to ../ and absolute path override)
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()`,
    language: "Python",
    source: "request.args.get('filename')",
    sink: "open(os.path.join(BASE_DIR, filename))",
    taintPath: [
      "filename = request.args.get('filename', '')",
      "filepath = os.path.join(BASE_DIR, filename)",
      "with open(filepath, 'r', encoding='utf-8') as f: return f.read()",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.86, confirmed: true, details: "XTRIKE-XQL/High_Risk/Path_Traversal at FileController.py:44" },
      { name: "XTRIKE DeepFlow",  confidence: 0.81, confirmed: true, details: "No os.path.realpath or os.path.commonpath check on path" },
      { name: "XTRIKE StructSCA", confidence: 0.84, confirmed: true, details: "[Dataflow] filename parameter flows to open() filesystem sink" },
      { name: "XTRIKE AST-Query", confidence: 0.83, confirmed: true, details: "python.path-traversal rule triggered" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Unvalidated filename parameter reaches open(filepath).read(). Unverified Hypothesis: Disclosure of arbitrary readable files on the container filesystem.",
    attackPath: [
      { label: "1. Query Input (Line 42)",   type: "entry",         description: "request.args.get('filename') in download_file()" },
      { label: "2. os.path.join() (Line 43)",type: "vulnerability", description: "Does not strip '../' or leading '/' absolute paths" },
      { label: "3. open(filepath) (Line 44)",type: "asset",         description: "Reads file contents and returns in HTTP response" },
      { label: "Hypothesized Impact",        type: "impact",        description: "[UNVERIFIED — REQUIRES RUNTIME PROOF] Unauthorized file read outside /app/files" },
    ],
    executiveSummary:
      "Static dataflow analysis confirmed that request.args.get('filename') is passed to os.path.join(BASE_DIR, filename) and opened with open(filepath) at src/controllers/FileController.py:44. In Python, os.path.join('/app/files', '/etc/passwd') discards BASE_DIR entirely, and '../' sequences traverse parent directories.",
    businessImpact:
      "Authenticated attackers can read arbitrary application source, configuration, or OS files readable by the Python process.",
    rootCause:
      "Reliance on os.path.join() without resolving symlinks/relative segments via os.path.realpath() and verifying containment via os.path.commonpath().",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021", description: "Broken Access Control (OWASP ASVS v4.0.3 12.3.1)" },
      { framework: "NIST 800-53",  reference: "AC-3",     description: "Access Enforcement" },
    ],
    remediation: [
      {
        platform: "Python",
        explanation:
          "Resolve canonical real paths with os.path.realpath() and verify containment using os.path.commonpath([base_real, target_real]) == base_real before opening the file.",
        code: `# ❌ VULNERABLE (FileController.py:42–45)
filepath = os.path.join(BASE_DIR, filename)
with open(filepath, "r", encoding="utf-8") as f:
    return f.read()

# ✅ FIXED — Canonical Realpath Resolution + os.path.commonpath Boundary Check
base_real = os.path.realpath(BASE_DIR)
target_real = os.path.realpath(os.path.join(base_real, filename))
if os.path.commonpath([base_real, target_real]) != base_real or target_real == base_real:
    abort(403, "Path traversal attempt blocked")
with open(target_real, "r", encoding="utf-8") as f:
    return f.read()`,
      },
    ],
    regressionTest:
      "TC-PATH-022-001: Request ?filename=../../etc/passwd and ?filename=/etc/passwd; assert HTTP 403 Forbidden.",
    validationSteps: [
      "1. Request ?filename=../../etc/passwd and ?filename=/etc/passwd — expect HTTP 403.",
      "2. Verify os.path.realpath() and os.path.commonpath() guard precedes open().",
    ],
    slaDeadline: "2026-11-17",
    owner: "Backend Team",
    application: "File Service",
    riskScore: 60,
    firstDetected: "2026-08-14",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-010",
    title: "Weak Cryptographic Algorithm (MD5 Used for Password Hashing)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-327",
    cweName: "Use of a Broken or Risky Cryptographic Algorithm",
    cvss: 5.9,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N",
    cvssRationale:
      "Base 5.9 Medium: MessageDigest.getInstance('MD5') is used to hash user passwords without salt or adaptive work factor, enabling rapid offline recovery if password hashes are exposed.",
    epss: 0.019,
    mitre: "T1110",
    owasp: "A02:2021",
    owaspCategory: "Cryptographic Failures",
    proofState: "DETECTED_STATIC",
    evidenceType: "CRYPTOGRAPHIC_PRIMITIVE",
    modeledAssumptions:
      "AST cryptographic primitive check confirmed MessageDigest.getInstance('MD5') is invoked on user password bytes at UserService.java:156.",
    auditDisposition:
      "Confirmed Static Cryptographic Weakness (CWE-327 / DETECTED_STATIC) — Replace MD5 Password Hashing with Argon2id or BCrypt",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/UserService.java",
    line: 156,
    snippetStartLine: 152,
    codeSnippet: `public void updatePasswordHash(User user, String password) throws Exception {
    // Line 156: Unsalted MD5 digest used for password storage
    MessageDigest md = MessageDigest.getInstance("MD5");
    byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
    user.setPasswordHash(Base64.getEncoder().encodeToString(hash));
}`,
    language: "Java",
    source: "String password",
    sink: "MessageDigest.getInstance(\"MD5\")",
    taintPath: [
      "MessageDigest md = MessageDigest.getInstance(\"MD5\")",
      "byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8))",
      "user.setPasswordHash(Base64.getEncoder().encodeToString(hash))",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.95, confirmed: true, details: "MD5 used for password hashing at UserService.java:156" },
      { name: "XTRIKE DeepFlow",  confidence: 0.90, confirmed: true, details: "Password variable flows into MD5 MessageDigest" },
      { name: "XTRIKE StructSCA", confidence: 0.92, confirmed: true, details: "[Semantic] MessageDigest.getInstance('MD5') in credential context" },
      { name: "XTRIKE AST-Query", confidence: 0.93, confirmed: true, details: "weak-crypto-md5 rule triggered" },
    ],
    confidence: 0.93,
    reachable: false,
    internetFacing: false,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain:
      "Demonstrated (Static Scope): Unsalted MD5 used for password storage. Unverified Hypothesis: High-speed offline GPU cracking if database hashes are leaked.",
    attackPath: [
      { label: "1. Password Input",        type: "entry",         description: "User password passed to updatePasswordHash()" },
      { label: "2. MD5 Digest (Line 156)", type: "vulnerability", description: "Unsalted, fast, collision-prone hash algorithm" },
      { label: "Hypothesized Impact",      type: "impact",        description: "Rapid offline password recovery if database is compromised" },
    ],
    executiveSummary:
      "Static AST inspection confirmed that UserService.java:156 hashes user passwords with unsalted MD5 (MessageDigest.getInstance('MD5')). MD5 lacks salting and computational work factors, allowing billions of candidate hashes per second during offline attacks.",
    businessImpact:
      "Amplifies any database read disclosure into immediate plaintext password recovery and credential stuffing exposure.",
    rootCause:
      "Fast general-purpose digest (MD5) used instead of a salted, memory-hard password hashing function (Argon2id or BCrypt).",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 8.3.2", description: "Strong cryptography for stored passwords" },
      { framework: "NIST 800-53",  reference: "IA-5(1)",   description: "Password-based authenticator management" },
      { framework: "ISO 27001",    reference: "A.8.24",    description: "Use of cryptography" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation:
          "Replace MessageDigest('MD5') with Spring Security's Argon2PasswordEncoder or BCryptPasswordEncoder (work factor >= 12) and re-hash legacy digests on next authenticated login.",
        code: `// ❌ VULNERABLE (UserService.java:156)
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));

// ✅ FIXED — Adaptive Salted BCrypt / Argon2id Password Encoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

public void updatePasswordHash(User user, String rawPassword) {
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
}`,
      },
    ],
    regressionTest:
      "TC-CRYPTO-327-001: Assert stored password hash starts with $2a$12$ / $argon2id$ and two identical passwords produce distinct salted hashes.",
    validationSteps: [
      "1. Confirm zero occurrences of MessageDigest.getInstance('MD5') or 'SHA-1' in credential flows.",
      "2. Verify BCryptPasswordEncoder(12) or Argon2PasswordEncoder produces unique salted hashes.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 55,
    firstDetected: "2026-08-11",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-011",
    title: "Open Redirect via Unvalidated returnUrl Parameter",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-601",
    cweName: "URL Redirection to Untrusted Site ('Open Redirect')",
    cvss: 6.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
    cvssRationale:
      "Base 6.1 Medium: Query parameter req.query.returnUrl is passed directly to res.redirect(returnUrl) without relative-path or origin allowlist validation (Scope: Changed, User Interaction: Required).",
    epss: 0.017,
    mitre: "T1192",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    proofState: "DATAFLOW_CONFIRMED",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "Intra-procedural AST dataflow confirmed req.query.returnUrl flows directly into res.redirect(returnUrl) at auth.controller.ts:31 with 0 origin or path prefix guards.",
    auditDisposition:
      "Dataflow-Confirmed Open Redirect Sink (CWE-601) — Restrict Redirects to Strict Same-Origin Relative Paths",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/auth.controller.ts",
    line: 31,
    snippetStartLine: 26,
    codeSnippet: `export async function completeLoginRedirect(req: Request, res: Response) {
  const returnUrl = String(req.query.returnUrl || "/dashboard");
  // Line 31: Unvalidated redirect target allows external URLs and protocol-relative //evil.example
  return res.redirect(returnUrl);
}`,
    language: "TypeScript",
    source: "req.query.returnUrl",
    sink: "res.redirect(returnUrl)",
    taintPath: [
      "const returnUrl = String(req.query.returnUrl || \"/dashboard\")",
      "return res.redirect(returnUrl)",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.80, confirmed: true,  details: "Open redirect: user-controlled URL in res.redirect at auth.controller.ts:31" },
      { name: "XTRIKE DeepFlow",  confidence: 0.75, confirmed: true,  details: "req.query.returnUrl reaches res.redirect() without origin check" },
      { name: "XTRIKE StructSCA", confidence: 0.78, confirmed: true,  details: "[Dataflow] Unvalidated redirect target" },
      { name: "XTRIKE AST-Query", confidence: 0.77, confirmed: true,  details: "open-redirect rule triggered" },
    ],
    confidence: 0.78,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain:
      "Demonstrated (Static Scope): Unvalidated HTTP 302 redirect target. Unverified Hypothesis: Phishing redirection or OAuth state/code leakage if combined with token-in-query flows.",
    attackPath: [
      { label: "1. Crafted Login Link",  type: "entry",         description: "/login?returnUrl=https://evil.example" },
      { label: "2. res.redirect()",      type: "vulnerability", description: "Redirects user browser to external origin after login" },
      { label: "Hypothesized Impact",    type: "impact",        description: "Credential phishing via trusted domain redirect" },
    ],
    executiveSummary:
      "Static dataflow analysis confirmed that req.query.returnUrl is passed directly to res.redirect(returnUrl) at src/controllers/auth.controller.ts:31 without verifying that the target is a local relative path.",
    businessImpact:
      "Attackers can abuse the trusted banking login URL to redirect authenticated users to external phishing domains.",
    rootCause:
      "Missing relative-path pattern check and origin validation before invoking res.redirect().",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021", description: "Broken Access Control (OWASP ASVS v4.0.3 5.1.5)" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Require returnUrl to start with a single '/' (rejecting '//' and '\\\\' protocol-relative bypasses) and verify the resolved URL origin against a fixed server origin constant.",
        code: `// ❌ VULNERABLE (auth.controller.ts:31)
return res.redirect(String(req.query.returnUrl || "/dashboard"));

// ✅ FIXED — Strict Single-Slash Relative Path + Fixed Origin Verification
const SAFE_BASE_ORIGIN = "https://app.xtrike-banking.internal";
const rawReturn = String(req.query.returnUrl || "/dashboard");

if (!rawReturn.startsWith("/") || rawReturn.startsWith("//") || rawReturn.includes("\\\\")) {
  return res.redirect("/dashboard");
}
const resolved = new URL(rawReturn, SAFE_BASE_ORIGIN);
if (resolved.origin !== SAFE_BASE_ORIGIN) {
  return res.redirect("/dashboard");
}
return res.redirect(resolved.pathname + resolved.search);`,
      },
    ],
    regressionTest:
      "TC-REDIR-601-001: Test ?returnUrl=https://evil.com, ?returnUrl=//evil.com, and ?returnUrl=/\\evil.com; assert all redirect to /dashboard.",
    validationSteps: [
      "1. Test ?returnUrl=https://evil.com and ?returnUrl=//evil.com — confirm redirect falls back to /dashboard.",
      "2. Confirm fixed SAFE_BASE_ORIGIN is used rather than an unvalidated Host header.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Auth Team",
    application: "API Gateway",
    riskScore: 52,
    firstDetected: "2026-08-13",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-012",
    title: "Missing Security Response Headers in Express Application Bootstrap",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-693",
    cweName: "Protection Mechanism Failure",
    cvss: 5.4,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N",
    cvssRationale:
      "Base 5.4 Medium: Express bootstrap in src/app.ts omits HSTS, CSP, X-Frame-Options, and X-Content-Type-Options headers, reducing browser defense-in-depth against framing and MIME sniffing.",
    epss: 0.012,
    mitre: "T1557",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "Configuration inspection of src/app.ts:14 confirmed express() is initialized without helmet() middleware; reverse-proxy/CDN response header injection outside the repository is not modeled statically.",
    auditDisposition:
      "Guard-Analyzed Missing Browser Security Headers (CWE-693) — Configure Helmet Middleware & Verify Reverse-Proxy Headers",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/app.ts",
    line: 14,
    snippetStartLine: 10,
    codeSnippet: `import express from "express";

export const app = express();
// Line 14: Express initialized without helmet() security headers middleware
app.use(express.json());`,
    language: "TypeScript",
    source: "const app = express()",
    sink: "HTTP response header configuration",
    taintPath: [
      "export const app = express() // Guard analysis: no helmet() middleware registered in src/app.ts",
      "app.use(express.json())",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.88, confirmed: true, details: "Missing helmet() security headers in Express bootstrap at src/app.ts:14" },
      { name: "XTRIKE DeepFlow",  confidence: 0.80, confirmed: true, details: "Response pipeline not augmented with HSTS/CSP/XFO headers" },
      { name: "XTRIKE StructSCA", confidence: 0.82, confirmed: true, details: "[Configuration] No helmet() middleware in application call graph" },
      { name: "XTRIKE AST-Query", confidence: 0.85, confirmed: true, details: "missing-security-headers rule triggered" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain:
      "Demonstrated (Static Scope): Application bootstrap does not register Helmet security headers. Unverified Hypothesis: Clickjacking or MIME-sniffing exposure if edge reverse proxy does not inject headers.",
    attackPath: [
      { label: "1. Express Bootstrap (Line 14)", type: "entry",         description: "app = express() in src/app.ts" },
      { label: "2. Missing Helmet Middleware",   type: "vulnerability", description: "HSTS, CSP, X-Frame-Options, nosniff absent in app code" },
      { label: "Hypothesized Impact",            type: "impact",        description: "Browser framing / MIME-sniffing exposure if unset at edge proxy" },
    ],
    executiveSummary:
      "Static configuration analysis of src/app.ts:14 confirmed that the Express application does not register Helmet or equivalent middleware to emit Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options headers.",
    businessImpact:
      "Weakens browser-side defense-in-depth against clickjacking, MIME confusion, and protocol downgrade attacks.",
    rootCause:
      "Helmet middleware omitted during Express application initialization.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021",  description: "Security Misconfiguration (ASVS v4.0.3 14.4.1–14.4.7)" },
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Secure web application headers" },
      { framework: "NIST 800-53",  reference: "SC-8",      description: "Transmission confidentiality and integrity" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Register helmet() at the top of src/app.ts with strict HSTS, frameguard deny, nosniff, and Content-Security-Policy directives.",
        code: `// ❌ VULNERABLE (src/app.ts:14)
export const app = express();
app.use(express.json());

// ✅ FIXED — Register Helmet Security Headers Middleware
import helmet from "helmet";

export const app = express();
app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: "deny" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(express.json());`,
      },
    ],
    regressionTest:
      "TC-HDR-693-001: Assert GET /health response includes strict-transport-security, content-security-policy, x-frame-options: DENY, and x-content-type-options: nosniff.",
    validationSteps: [
      "1. Inspect HTTP response headers in integration tests and verify HSTS, CSP, X-Frame-Options, and X-Content-Type-Options are present.",
    ],
    slaDeadline: "2026-11-17",
    owner: "DevOps Team",
    application: "API Gateway",
    riskScore: 48,
    firstDetected: "2026-08-09",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-013",
    title: "Verbose Error Messages Exposing Internal Stack Traces",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-209",
    cweName: "Generation of Error Message Containing Sensitive Information",
    cvss: 4.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 4.3 Medium: Global error middleware serializes err.stack directly into the HTTP JSON response body, disclosing internal file paths, library versions, and query fragments.",
    epss: 0.008,
    mitre: "T1082",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST inspection of src/middleware/error.middleware.ts:23 confirmed res.status(500).json({ message: err.message, stack: err.stack }) executes unconditionally without a production environment guard.",
    auditDisposition:
      "Guard-Analyzed Stack Trace Exposure (CWE-209) — Return Opaque Correlation ID to Clients & Log Stack Server-Side Only",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/middleware/error.middleware.ts",
    line: 23,
    snippetStartLine: 18,
    codeSnippet: `export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Line 23: Serializes internal stack trace and raw exception message to client HTTP response
  return res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
}`,
    language: "TypeScript",
    source: "err.stack",
    sink: "res.status(500).json({ error: err.message, stack: err.stack })",
    taintPath: [
      "export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction)",
      "return res.status(500).json({ error: err.message, stack: err.stack })",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.86, confirmed: true, details: "err.stack serialized to HTTP JSON response at error.middleware.ts:23" },
      { name: "XTRIKE DeepFlow",  confidence: 0.82, confirmed: true, details: "Error stack property flows to res.json()" },
      { name: "XTRIKE StructSCA", confidence: 0.85, confirmed: true, details: "[Errors] Kingdom: Errors — Unfiltered stack trace disclosure" },
      { name: "XTRIKE AST-Query", confidence: 0.84, confirmed: true, details: "cwe-209-stack-trace-exposure rule matched" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Discloses internal module paths, framework versions, and database error details to API callers.",
    attackPath: [
      { label: "1. Malformed Request",     type: "entry",         description: "Caller triggers unhandled exception in controller" },
      { label: "2. Error Middleware (L23)",type: "vulnerability", description: "Serializes err.stack into HTTP 500 JSON payload" },
      { label: "3. Reconnaissance Leakage",type: "impact",        description: "Exposes internal filesystem layout and library versions" },
    ],
    executiveSummary:
      "Static inspection of src/middleware/error.middleware.ts:23 confirmed that the Express error handler returns err.message and err.stack directly in HTTP 500 responses.",
    businessImpact:
      "Provides attackers with internal stack traces, file paths, and SQL/ORM diagnostics that accelerate exploit development.",
    rootCause:
      "Error handler serializes raw Error properties into the client response instead of logging server-side with a correlation ID.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 7.4.1)" },
      { framework: "NIST 800-53",  reference: "SI-11",    description: "Error Handling" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Log the full stack trace internally with a unique request correlation ID and return a generic error payload to the client.",
        code: `// ❌ VULNERABLE (error.middleware.ts:23)
return res.status(500).json({ error: err.message, stack: err.stack });

// ✅ FIXED — Log Stack Trace Internally & Return Opaque Correlation ID
import crypto from "node:crypto";

export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const correlationId = crypto.randomUUID();
  logger.error({ correlationId, path: req.path, stack: err.stack }, "Unhandled request exception");
  return res.status(500).json({
    error: "Internal server error",
    correlationId,
  });
}`,
      },
    ],
    regressionTest:
      "TC-ERR-209-001: Trigger an unhandled Error in an endpoint and assert response body contains correlationId and does NOT contain 'stack' or '.ts:'.",
    validationSteps: [
      "1. Trigger a 500 error in test environment and verify 'stack' is absent from the JSON response.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 42,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-014",
    title: "Insecure Session Cookie — Missing HttpOnly Flag",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-1004",
    cweName: "Sensitive Cookie Without 'HttpOnly' Flag",
    cvss: 4.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 4.3 Medium: Session cookie is issued via res.cookie('sid', sessionId, ...) with httpOnly: false, allowing client-side JavaScript (document.cookie) to read the session identifier.",
    epss: 0.006,
    mitre: "T1539",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST configuration check of src/services/session.service.ts:19 confirmed res.cookie('sid', sessionId, { httpOnly: false }) explicitly disables HttpOnly protection.",
    auditDisposition:
      "Guard-Analyzed Cookie Attribute Misconfiguration (CWE-1004) — Set httpOnly: true on Session Cookies",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/session.service.ts",
    line: 19,
    snippetStartLine: 15,
    codeSnippet: `export function issueSessionCookie(res: Response, sessionId: string) {
  // Line 19: Session cookie issued without HttpOnly and Secure protections
  res.cookie("sid", sessionId, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });
}`,
    language: "TypeScript",
    source: "res.cookie('sid', sessionId, { httpOnly: false })",
    sink: "Set-Cookie response header",
    taintPath: [
      "res.cookie(\"sid\", sessionId, { httpOnly: false, secure: false, sameSite: \"lax\" })",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.91, confirmed: true, details: "Cookie 'sid' set with httpOnly: false at session.service.ts:19" },
      { name: "XTRIKE DeepFlow",  confidence: 0.86, confirmed: true, details: "Sensitive session identifier cookie lacks HttpOnly flag" },
      { name: "XTRIKE StructSCA", confidence: 0.89, confirmed: true, details: "[Configuration] CWE-1004 Missing HttpOnly attribute" },
      { name: "XTRIKE AST-Query", confidence: 0.90, confirmed: true, details: "cookie-missing-httponly rule matched" },
    ],
    confidence: 0.89,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Exposes session identifier to document.cookie access if any XSS occurs on the origin.",
    attackPath: [
      { label: "1. Session Issuance (Line 19)", type: "entry",         description: "issueSessionCookie() sets 'sid' cookie" },
      { label: "2. httpOnly: false",            type: "vulnerability", description: "Cookie accessible via window.document.cookie" },
      { label: "3. Session Theft Risk",         type: "impact",        description: "Client-side script can exfiltrate session token" },
    ],
    executiveSummary:
      "Static configuration analysis of src/services/session.service.ts:19 confirmed that the session cookie 'sid' is issued with httpOnly: false.",
    businessImpact:
      "Allows any injected or third-party script running in the page context to read and exfiltrate the user's active session cookie via document.cookie.",
    rootCause:
      "Cookie options object explicitly sets httpOnly: false instead of httpOnly: true.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 3.4.2)" },
      { framework: "PCI DSS",      reference: "Req 6.2.4",description: "Protect session tokens from script access" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Enforce httpOnly: true, secure: true, and sameSite: 'strict' (or 'lax') with a __Host- cookie prefix on all session cookies.",
        code: `// ❌ VULNERABLE (session.service.ts:19)
res.cookie("sid", sessionId, { httpOnly: false, secure: false, sameSite: "lax" });

// ✅ FIXED — Hardened Session Cookie Attributes
res.cookie("__Host-sid", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 15 * 60 * 1000,
});`,
      },
    ],
    regressionTest:
      "TC-COOKIE-1004-001: Assert Set-Cookie header for session cookie contains 'HttpOnly; Secure; SameSite=Strict'.",
    validationSteps: [
      "1. Inspect Set-Cookie header on login response and confirm HttpOnly flag is present.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Auth Team",
    application: "Customer API",
    riskScore: 41,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  // ─── LOW (CVSS 0.1 – 3.9) ──────────────────────────────────────────────────
  {
    id: "F-015",
    title: "Insecure Session Cookie — Missing Secure Flag",
    severity: "Low",
    status: "Open",
    cwe: "CWE-614",
    cweName: "Sensitive Cookie in HTTPS Session Without 'Secure' Attribute",
    cvss: 3.7,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 3.7 Low: Session cookie is issued with secure: false at session.service.ts:19, allowing the browser to transmit the cookie over unencrypted HTTP requests if HSTS is absent.",
    epss: 0.005,
    mitre: "T1557",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST configuration check of src/services/session.service.ts:19 confirmed res.cookie('sid', sessionId, { secure: false }) disables the Secure attribute.",
    auditDisposition:
      "Guard-Analyzed Cookie Attribute Misconfiguration (CWE-614) — Set secure: true on All Session Cookies",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/session.service.ts",
    line: 19,
    snippetStartLine: 15,
    codeSnippet: `export function issueSessionCookie(res: Response, sessionId: string) {
  // Line 19: secure: false permits cookie transmission over plaintext HTTP
  res.cookie("sid", sessionId, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });
}`,
    language: "TypeScript",
    source: "res.cookie('sid', sessionId, { secure: false })",
    sink: "Set-Cookie response header",
    taintPath: [
      "res.cookie(\"sid\", sessionId, { httpOnly: false, secure: false, sameSite: \"lax\" })",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.91, confirmed: true, details: "Cookie 'sid' set with secure: false at session.service.ts:19" },
      { name: "XTRIKE DeepFlow",  confidence: 0.85, confirmed: true, details: "Session cookie lacks Secure transport flag" },
      { name: "XTRIKE StructSCA", confidence: 0.88, confirmed: true, details: "[Configuration] CWE-614 Missing Secure attribute" },
      { name: "XTRIKE AST-Query", confidence: 0.90, confirmed: true, details: "cookie-missing-secure rule matched" },
    ],
    confidence: 0.89,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Difficult",
    privilegeGain: "Session cookie can be leaked over plaintext HTTP connections on untrusted networks.",
    attackPath: [
      { label: "1. Cookie Issued (Line 19)", type: "entry",         description: "secure: false set on 'sid' cookie" },
      { label: "2. Plaintext HTTP Subrequest",type: "vulnerability", description: "Browser sends cookie over cleartext HTTP link" },
      { label: "3. Network Interception",    type: "impact",        description: "Passive network observer captures session cookie" },
    ],
    executiveSummary:
      "Static configuration analysis of src/services/session.service.ts:19 confirmed that the 'sid' session cookie is configured with secure: false.",
    businessImpact:
      "Permits browsers to transmit the session cookie over unencrypted HTTP requests if a user follows an http:// link.",
    rootCause:
      "Cookie configuration sets secure: false instead of enforcing HTTPS-only cookie transmission.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 3.4.1)" },
      { framework: "NIST 800-53",  reference: "SC-8",     description: "Transmission confidentiality" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Set secure: true and use the __Host- cookie prefix (which requires Secure, Path=/, and no Domain attribute in modern browsers).",
        code: `// ❌ VULNERABLE (session.service.ts:19)
res.cookie("sid", sessionId, { httpOnly: false, secure: false, sameSite: "lax" });

// ✅ FIXED — Enforce Secure + HttpOnly + __Host- Prefix
res.cookie("__Host-sid", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
});`,
      },
    ],
    regressionTest:
      "TC-COOKIE-614-001: Verify Set-Cookie header includes 'Secure' attribute in all environments.",
    validationSteps: [
      "1. Confirm Set-Cookie header contains Secure and HttpOnly attributes.",
    ],
    slaDeadline: "2026-11-25",
    owner: "Auth Team",
    application: "Customer API",
    riskScore: 34,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  // ─── ADDITIONAL MEDIUM & LOW FINDINGS (F-016 – F-027) ──────────────────────
  {
    id: "F-016",
    title: "Insertion of Sensitive Information into Log File (Plaintext Password in Debug Log)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-532",
    cweName: "Insertion of Sensitive Information into Log File",
    cvss: 4.9,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:N/A:N",
    cvssRationale:
      "Base 4.9 Medium: Authentication service writes plaintext password argument to logger.debug() at auth.service.py:67, exposing user credentials to privileged log readers and SIEM pipelines.",
    epss: 0.009,
    mitre: "T1552.001",
    owasp: "A09:2021",
    owaspCategory: "Security Logging and Monitoring Failures",
    proofState: "NEEDS_MANUAL_VALIDATION",
    evidenceType: "SECRET_PROVENANCE",
    modeledAssumptions:
      "AST taint trace confirmed the 'password' parameter in authenticate_user(username, password) is interpolated into logger.debug() at auth.service.py:67; production log level and log-sink redaction filters require environment verification.",
    auditDisposition:
      "Credential Logging Detected (CWE-532 / NEEDS_MANUAL_VALIDATION) — Remove Password from Log Statement & Purge Historical Log Indexes",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/auth.service.py",
    line: 67,
    snippetStartLine: 63,
    codeSnippet: `def authenticate_user(username: str, password: str) -> bool:
    # Line 67: Plaintext password interpolated into debug log stream
    logger.debug(f"Authenticating user={username} with password={password}")
    return verify_password_hash(username, password)`,
    language: "Python",
    source: "password parameter in authenticate_user()",
    sink: "logger.debug(f\"Authenticating user={username} with password={password}\")",
    taintPath: [
      "def authenticate_user(username: str, password: str) -> bool:",
      "logger.debug(f\"Authenticating user={username} with password={password}\")",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.90, confirmed: true, details: "Sensitive variable 'password' logged at auth.service.py:67" },
      { name: "XTRIKE DeepFlow",  confidence: 0.88, confirmed: true, details: "Credential parameter flows into logger.debug() sink" },
      { name: "XTRIKE StructSCA", confidence: 0.86, confirmed: true, details: "[Dataflow] CWE-532 Sensitive credential written to log sink" },
      { name: "XTRIKE AST-Query", confidence: 0.89, confirmed: true, details: "python-sensitive-log rule matched" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Plaintext user passwords readable by operators or attackers with access to centralized log storage.",
    attackPath: [
      { label: "1. Login Attempt",      type: "entry",         description: "User submits username & password" },
      { label: "2. logger.debug (L67)", type: "vulnerability", description: "Plaintext password written to application logs" },
      { label: "3. SIEM / Log Store",   type: "impact",        description: "Credentials exposed in log aggregation indices" },
    ],
    executiveSummary:
      "Static analysis of src/services/auth.service.py:67 confirmed that authenticate_user() interpolates the plaintext password parameter into a logger.debug() statement.",
    businessImpact:
      "If debug logging is enabled in staging or production, user passwords are persisted in plaintext across log files and SIEM indices.",
    rootCause:
      "Developer logged raw authentication parameters instead of redacting sensitive credential fields.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A09:2021",  description: "Security Logging and Monitoring Failures (ASVS v4.0.3 7.1.1)" },
      { framework: "PCI DSS",      reference: "Req 3.3.1", description: "Do not store sensitive authentication data in logs" },
    ],
    remediation: [
      {
        platform: "Python",
        explanation:
          "Never log passwords, tokens, or secret keys at any log level. Log only the non-sensitive username/userId and authentication outcome.",
        code: `# ❌ VULNERABLE (auth.service.py:67)
logger.debug(f"Authenticating user={username} with password={password}")

# ✅ FIXED — Log Structured Non-Sensitive Metadata Only
logger.info("Authentication attempt received", extra={"username": username, "auth_flow": "password"})`,
      },
    ],
    regressionTest:
      "TC-LOG-532-001: Invoke authenticate_user('alice', 'SecretPass!99') with log capture enabled and assert 'SecretPass!99' does not appear in any log record.",
    validationSteps: [
      "1. Verify password variable is removed from all logger.* calls and check SIEM logs for historical exposure.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Auth Team",
    application: "Customer API",
    riskScore: 46,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-017",
    title: "Use of Cryptographically Weak PRNG (Math.random() for Password Reset Token)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-338",
    cweName: "Use of Cryptographically Weak Pseudo-Random Number Generator (PRNG)",
    cvss: 4.8,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N",
    cvssRationale:
      "Base 4.8 Medium: Math.random() is used to generate password reset tokens in src/utils/token.util.ts:12; V8's xorshift128+ PRNG is not cryptographically secure and internal state can be reconstructed from observed outputs.",
    epss: 0.011,
    mitre: "T1550",
    owasp: "A02:2021",
    owaspCategory: "Cryptographic Failures",
    proofState: "DETECTED_STATIC",
    evidenceType: "CRYPTOGRAPHIC_PRIMITIVE",
    modeledAssumptions:
      "AST cryptographic primitive check confirmed Math.random().toString(36) is returned by generateResetToken() at src/utils/token.util.ts:12.",
    auditDisposition:
      "Confirmed Static PRNG Weakness (CWE-338 / DETECTED_STATIC) — Replace Math.random() with crypto.randomBytes(32)",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/utils/token.util.ts",
    line: 12,
    snippetStartLine: 9,
    codeSnippet: `export function generateResetToken(): string {
  // Line 12: Non-cryptographic PRNG used for security-sensitive password reset token
  const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return resetToken;
}`,
    language: "TypeScript",
    source: "Math.random()",
    sink: "return resetToken",
    taintPath: [
      "const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36)",
      "return resetToken",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.94, confirmed: true, details: "Math.random() used in token generator at token.util.ts:12" },
      { name: "XTRIKE DeepFlow",  confidence: 0.89, confirmed: true, details: "Weak PRNG output returned as resetToken" },
      { name: "XTRIKE StructSCA", confidence: 0.92, confirmed: true, details: "[Semantic] CWE-338 Non-cryptographic PRNG in security token context" },
      { name: "XTRIKE AST-Query", confidence: 0.91, confirmed: true, details: "insecure-randomness-math-random rule matched" },
    ],
    confidence: 0.92,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Predictable password reset tokens enable account takeover if PRNG state is inferred.",
    attackPath: [
      { label: "1. Token Request",        type: "entry",         description: "Attacker requests password reset tokens" },
      { label: "2. Math.random() (L12)",  type: "vulnerability", description: "xorshift128+ PRNG + timestamp lacks cryptographic entropy" },
      { label: "3. Token Prediction",     type: "impact",        description: "Attacker predicts reset token for target account" },
    ],
    executiveSummary:
      "Static AST analysis of src/utils/token.util.ts:12 confirmed that generateResetToken() uses Math.random() combined with Date.now() to construct password reset tokens.",
    businessImpact:
      "Allows attackers who observe sequential tokens to recover the V8 PRNG state and predict password reset tokens for victim accounts.",
    rootCause:
      "Math.random() used instead of a cryptographically secure pseudo-random number generator (CSPRNG).",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A02:2021", description: "Cryptographic Failures (ASVS v4.0.3 6.3.1)" },
      { framework: "NIST 800-53",  reference: "SC-13",    description: "Cryptographic protection (FIPS-validated CSPRNG)" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Replace Math.random() with Node.js crypto.randomBytes(32).toString('hex') (256 bits of CSPRNG entropy).",
        code: `// ❌ VULNERABLE (token.util.ts:12)
const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

// ✅ FIXED — 256-Bit CSPRNG Token via node:crypto
import crypto from "node:crypto";

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}`,
      },
    ],
    regressionTest:
      "TC-PRNG-338-001: Assert generateResetToken() returns a 64-character hex string backed by crypto.randomBytes(32) and 0 calls to Math.random() remain.",
    validationSteps: [
      "1. Verify crypto.randomBytes(32) is used for all authentication and reset tokens.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Auth Team",
    application: "Customer API",
    riskScore: 45,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-018",
    title: "Missing Rate Limiting & Brute-Force Throttling on Login Endpoint",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-307",
    cweName: "Improper Restriction of Excessive Authentication Attempts",
    cvss: 5.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 5.3 Medium: POST /login route in src/controllers/auth.controller.ts:15 invokes authService.login() without route-level rate limiting or account lockout middleware.",
    epss: 0.014,
    mitre: "T1110.001",
    owasp: "A07:2021",
    owaspCategory: "Identification and Authentication Failures",
    proofState: "GUARD_ANALYZED",
    evidenceType: "AUTHORIZATION_ENFORCEMENT",
    modeledAssumptions:
      "Route guard inspection of src/controllers/auth.controller.ts:15 confirmed no express-rate-limit or account-lockout middleware is attached to POST /login in application code; API gateway / WAF rate limits outside the repository are not modeled statically.",
    auditDisposition:
      "Guard-Analyzed Missing Authentication Rate Limiter (CWE-307) — Enforce Per-IP & Per-Account Throttling",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/auth.controller.ts",
    line: 15,
    snippetStartLine: 11,
    codeSnippet: `// Line 15: POST /login route registered without rate-limiting or progressive lockout middleware
authRouter.post("/login", async (req: Request, res: Response) => {
  const result = await authService.login(req.body.username, req.body.password);
  return res.status(200).json(result);
});`,
    language: "TypeScript",
    source: "authRouter.post('/login', ...)",
    sink: "authService.login(req.body.username, req.body.password)",
    taintPath: [
      "authRouter.post(\"/login\", async (req, res) => ...) // Guard analysis: 0 rate-limiter middleware in route chain",
      "await authService.login(req.body.username, req.body.password)",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.84, confirmed: true, details: "POST /login route lacks rate-limit middleware at auth.controller.ts:15" },
      { name: "XTRIKE DeepFlow",  confidence: 0.78, confirmed: false, details: "Upstream API gateway rate limits must be verified separately" },
      { name: "XTRIKE StructSCA", confidence: 0.82, confirmed: true, details: "[Control Flow] CWE-307 No throttling guard on authentication route" },
      { name: "XTRIKE AST-Query", confidence: 0.81, confirmed: true, details: "missing-login-rate-limit rule matched" },
    ],
    confidence: 0.81,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain: "Permits automated credential stuffing and password brute-force attacks if unthrottled at the edge.",
    attackPath: [
      { label: "1. Automated Botnet",     type: "entry",         description: "High-velocity POST /login requests" },
      { label: "2. Unthrottled Handler",  type: "vulnerability", description: "No per-IP or per-account rate limit in auth.controller.ts:15" },
      { label: "3. Credential Stuffing",  type: "impact",        description: "Account compromise for weak or reused user passwords" },
    ],
    executiveSummary:
      "Static route guard analysis of src/controllers/auth.controller.ts:15 confirmed that POST /login does not attach rate-limiting or progressive backoff middleware.",
    businessImpact:
      "Leaves the authentication endpoint exposed to automated credential stuffing and brute-force attacks unless mitigated by an external WAF.",
    rootCause:
      "Authentication route registered without express-rate-limit or Redis-backed per-account failure throttling.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A07:2021",  description: "Identification and Authentication Failures (ASVS v4.0.3 2.2.1)" },
      { framework: "PCI DSS",      reference: "Req 8.3.4", description: "Lockout after invalid authentication attempts" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Attach express-rate-limit middleware keyed by IP and normalized username to POST /login and enforce progressive lockout after 5 failed attempts.",
        code: `// ❌ VULNERABLE (auth.controller.ts:15)
authRouter.post("/login", async (req: Request, res: Response) => {
  const result = await authService.login(req.body.username, req.body.password);
  return res.status(200).json(result);
});

// ✅ FIXED — Enforce Route-Level Rate Limiting + Per-Account Throttling
import rateLimit from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => \`\${req.ip}:\${String(req.body?.username || "").toLowerCase()}\`,
  message: { error: "Too many login attempts. Please retry in 15 minutes." },
});

authRouter.post("/login", loginRateLimiter, async (req: Request, res: Response) => {
  const result = await authService.login(req.body.username, req.body.password);
  return res.status(200).json(result);
});`,
      },
    ],
    regressionTest:
      "TC-RATE-307-001: Send 6 rapid POST /login requests for the same username and assert the 6th response returns HTTP 429 Too Many Requests.",
    validationSteps: [
      "1. Verify 6th consecutive failed login attempt within 15 minutes returns HTTP 429.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Auth Team",
    application: "API Gateway",
    riskScore: 50,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-019",
    title: "Outdated Third-Party Dependency — Apache Commons Text 1.9 (Reachability Check Required)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-1395",
    cweName: "Dependency on Vulnerable Third-Party Component",
    cvss: 4.0,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 4.0 Medium (Manifest Scope): pom.xml:34 declares org.apache.commons:commons-text:1.9 (affected by CVE-2022-42889 in versions 1.5–1.9 when StringSubstitutor.createInterpolator() is called on untrusted input); no active interpolator sink was found in first-party Java code.",
    epss: 0.015,
    mitre: "T1195.001",
    owasp: "A06:2021",
    owaspCategory: "Vulnerable and Outdated Components",
    proofState: "NEEDS_MANUAL_VALIDATION",
    evidenceType: "DEPENDENCY_VERSION",
    modeledAssumptions:
      "SCA manifest parser identified org.apache.commons:commons-text:1.9 in pom.xml:34; exploitability requires verifying whether StringSubstitutor.createInterpolator() or script/dns/url lookups are invoked anywhere in transitive or first-party code.",
    auditDisposition:
      "Vulnerable Dependency Version in Manifest (NEEDS_MANUAL_VALIDATION) — Upgrade commons-text to >= 1.10.0 & Verify Interpolator Reachability",
    advisoryApplicability: "DEPENDENCY_MANIFEST_ADVISORY",
    file: "pom.xml",
    line: 34,
    snippetStartLine: 30,
    codeSnippet: `<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-text</artifactId>
    <!-- Line 34: Version 1.9 is in the vulnerable 1.5–1.9 range for default script/dns/url interpolation -->
    <version>1.9</version>
</dependency>`,
    language: "Maven / XML",
    source: "pom.xml dependency declaration (commons-text:1.9)",
    sink: "StringSubstitutor interpolation API (reachability unconfirmed)",
    taintPath: [
      "pom.xml:34 declares <artifactId>commons-text</artifactId><version>1.9</version>",
      "Reachability check: verify whether StringSubstitutor.createInterpolator() is called with untrusted input",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.95, confirmed: true,  details: "Manifest dependency org.apache.commons:commons-text:1.9 at pom.xml:34" },
      { name: "XTRIKE DeepFlow",  confidence: 0.70, confirmed: false, details: "No direct taint flow into StringSubstitutor.createInterpolator() found" },
      { name: "XTRIKE StructSCA", confidence: 0.96, confirmed: true,  details: "[Configuration] CWE-1395 Vulnerable dependency version < 1.10.0" },
      { name: "XTRIKE AST-Query", confidence: 0.88, confirmed: true,  details: "maven-outdated-commons-text rule matched" },
    ],
    confidence: 0.87,
    reachable: false,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Difficult",
    privilegeGain: "Upgrade hygiene required; RCE only possible if StringSubstitutor.createInterpolator() is invoked on untrusted input.",
    attackPath: [
      { label: "1. Manifest Declaration (pom.xml:34)", type: "entry",         description: "commons-text:1.9 included on build classpath" },
      { label: "2. API Reachability Gate",             type: "vulnerability", description: "Requires StringSubstitutor.createInterpolator() usage" },
      { label: "3. Upgrade Remediation",               type: "impact",        description: "Upgrade to commons-text 1.10.0+ disables script/dns/url lookups by default" },
    ],
    executiveSummary:
      "Dependency manifest analysis of pom.xml:34 identified Apache Commons Text 1.9, which disables safe defaults for StringSubstitutor interpolation (fixed in 1.10.0). Static call-graph inspection did not find an active untrusted dataflow into StringSubstitutor.createInterpolator(), so this finding is classified as NEEDS_MANUAL_VALIDATION.",
    businessImpact:
      "Retaining vulnerable library versions on the classpath creates latent risk if future code invokes StringSubstitutor interpolation.",
    rootCause:
      "pom.xml pins org.apache.commons:commons-text to version 1.9 instead of >= 1.10.0.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A06:2021",  description: "Vulnerable and Outdated Components (ASVS v4.0.3 14.2.1)" },
      { framework: "PCI DSS",      reference: "Req 6.3.1", description: "Identify and manage third-party component vulnerabilities" },
    ],
    remediation: [
      {
        platform: "Maven / XML",
        explanation:
          "Upgrade org.apache.commons:commons-text in pom.xml from 1.9 to 1.10.0 (or 1.12.0), which disables script, dns, and url interpolator lookups by default.",
        code: `<!-- ❌ VULNERABLE (pom.xml:34) -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-text</artifactId>
    <version>1.9</version>
</dependency>

<!-- ✅ FIXED — Upgrade Apache Commons Text to >= 1.10.0 (1.12.0 LTS) -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-text</artifactId>
    <version>1.12.0</version>
</dependency>`,
      },
    ],
    regressionTest:
      "TC-SCA-1395-001: Run mvn dependency:tree and assert org.apache.commons:commons-text version >= 1.10.0.",
    validationSteps: [
      "1. Upgrade commons-text to 1.12.0 in pom.xml and verify mvn dependency:tree resolves >= 1.10.0.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 38,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-020",
    title: "Debug Environment Endpoint Exposed in Production Route Table (/debug/env)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-489",
    cweName: "Active Debug Code",
    cvss: 4.8,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N",
    cvssRationale:
      "Base 4.8 Medium: Route /debug/env in src/routes/admin.routes.ts:88 serializes process.env without an authentication guard or non-production environment gate.",
    epss: 0.010,
    mitre: "T1082",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "Route table inspection of src/routes/admin.routes.ts:88 confirmed adminRouter.get('/debug/env', ...) returns process.env without authentication middleware or NODE_ENV check in the route definition.",
    auditDisposition:
      "Guard-Analyzed Exposed Debug Endpoint (CWE-489) — Remove /debug/env Route from Production Builds",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/routes/admin.routes.ts",
    line: 88,
    snippetStartLine: 84,
    codeSnippet: `// Line 88: Unauthenticated diagnostic route dumps process.env runtime variables
adminRouter.get("/debug/env", (_req: Request, res: Response) => {
  return res.status(200).json({ env: process.env });
});`,
    language: "TypeScript",
    source: "adminRouter.get('/debug/env')",
    sink: "res.status(200).json({ env: process.env })",
    taintPath: [
      "adminRouter.get(\"/debug/env\", (_req, res) => res.status(200).json({ env: process.env }))",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.90, confirmed: true, details: "Debug endpoint /debug/env dumps process.env at admin.routes.ts:88" },
      { name: "XTRIKE DeepFlow",  confidence: 0.87, confirmed: true, details: "process.env serialized to HTTP response" },
      { name: "XTRIKE StructSCA", confidence: 0.89, confirmed: true, details: "[Configuration] CWE-489 Active debug route in production router" },
      { name: "XTRIKE AST-Query", confidence: 0.88, confirmed: true, details: "exposed-debug-endpoint rule matched" },
    ],
    confidence: 0.89,
    reachable: true,
    internetFacing: false,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain: "Exposes runtime environment variables if /debug/env is reachable.",
    attackPath: [
      { label: "1. GET /debug/env",       type: "entry",         description: "Request to diagnostic route" },
      { label: "2. process.env Dump (L88)",type: "vulnerability",description: "Returns full process.env object in JSON" },
      { label: "3. Configuration Leak",   type: "impact",        description: "Leaks runtime service URLs and environment secrets" },
    ],
    executiveSummary:
      "Static route analysis of src/routes/admin.routes.ts:88 confirmed that /debug/env serializes the entire process.env object into an HTTP response.",
    businessImpact:
      "Exposes environment variables, internal service endpoints, and injected runtime secrets to anyone who can reach the admin router.",
    rootCause:
      "Diagnostic debug endpoint left active in the router without removal or authentication/environment gating.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 14.3.2)" },
      { framework: "NIST 800-53",  reference: "CM-7",     description: "Least Functionality — disable debug interfaces" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Remove /debug/env from the router entirely and expose only a minimal, authenticated health/version check that never serializes process.env.",
        code: `// ❌ VULNERABLE (admin.routes.ts:88 — Dumps process.env)
adminRouter.get("/debug/env", (_req: Request, res: Response) => {
  return res.status(200).json({ env: process.env });
});

// ✅ FIXED — Remove process.env Dump; Expose Only Non-Sensitive Health Metadata
adminRouter.get("/healthz", requireAdminRole, (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    service: "xtrike-enterprise-banking-api",
    uptimeSeconds: Math.floor(process.uptime()),
  });
});`,
      },
    ],
    regressionTest:
      "TC-DBG-489-001: Request GET /debug/env and assert HTTP 404 Not Found.",
    validationSteps: [
      "1. Confirm GET /debug/env returns 404 and zero routes serialize process.env.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 45,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-021",
    title: "Server Technology Fingerprinting via X-Powered-By Header",
    severity: "Low",
    status: "Open",
    cwe: "CWE-200",
    cweName: "Exposure of Sensitive Information to an Unauthorized Actor",
    cvss: 3.7,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 3.7 Low: Express application at src/app.ts:8 does not call app.disable('x-powered-by'), emitting 'X-Powered-By: Express' on HTTP responses.",
    epss: 0.004,
    mitre: "T1592",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST configuration check of src/app.ts:8 confirmed express() is initialized without app.disable('x-powered-by') or helmet.hidePoweredBy().",
    auditDisposition:
      "Guard-Analyzed Header Fingerprinting (CWE-200) — Disable x-powered-by in Express Bootstrap",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/app.ts",
    line: 8,
    snippetStartLine: 5,
    codeSnippet: `import express from "express";

// Line 8: Express initialized without app.disable("x-powered-by")
export const app = express();`,
    language: "TypeScript",
    source: "express() default configuration",
    sink: "X-Powered-By: Express response header",
    taintPath: [
      "export const app = express() // Default x-powered-by header enabled",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.85, confirmed: true, details: "x-powered-by not disabled at src/app.ts:8" },
      { name: "XTRIKE DeepFlow",  confidence: 0.80, confirmed: true, details: "Default framework banner emitted in HTTP responses" },
      { name: "XTRIKE StructSCA", confidence: 0.84, confirmed: true, details: "[Configuration] CWE-200 Framework banner disclosure" },
      { name: "XTRIKE AST-Query", confidence: 0.86, confirmed: true, details: "express-x-powered-by rule matched" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Difficult",
    privilegeGain: "Discloses backend web framework technology to automated scanners.",
    attackPath: [
      { label: "1. HTTP Request",        type: "entry",         description: "Any request to Express server" },
      { label: "2. X-Powered-By Header", type: "vulnerability", description: "Emits X-Powered-By: Express" },
      { label: "3. Stack Fingerprinting",type: "impact",        description: "Assists automated vulnerability scanners" },
    ],
    executiveSummary:
      "Static configuration inspection of src/app.ts:8 confirmed that Express's default X-Powered-By header is not disabled.",
    businessImpact:
      "Low direct impact; aids automated reconnaissance by advertising the underlying runtime stack.",
    rootCause:
      "app.disable('x-powered-by') omitted during Express setup.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 14.3.3)" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Call app.disable('x-powered-by') immediately after creating the Express instance (or enable helmet()).",
        code: `// ❌ VULNERABLE (src/app.ts:8)
export const app = express();

// ✅ FIXED — Suppress X-Powered-By Fingerprinting Header
export const app = express();
app.disable("x-powered-by");`,
      },
    ],
    regressionTest:
      "TC-HDR-200-001: Assert HTTP responses do not contain the 'x-powered-by' header.",
    validationSteps: [
      "1. Verify X-Powered-By header is absent from HTTP responses.",
    ],
    slaDeadline: "2026-11-25",
    owner: "DevOps Team",
    application: "API Gateway",
    riskScore: 32,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-022",
    title: "Inclusion of Sensitive Information in Source Code Comments (Database Password)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-615",
    cweName: "Inclusion of Sensitive Information in Source Code Comments",
    cvss: 4.0,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cvssRationale:
      "Base 4.0 Medium: Commented-out database connection block at src/db/connection.js:45 embeds a legacy password string literal in version control.",
    epss: 0.005,
    mitre: "T1552.001",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "NEEDS_MANUAL_VALIDATION",
    evidenceType: "SECRET_PROVENANCE",
    modeledAssumptions:
      "Comment & lexical secret scanner detected '// password: \"bank_stg_db_2025!\"' at src/db/connection.js:45; requires human verification to determine whether the credential is still valid on any staging/production PostgreSQL instance.",
    auditDisposition:
      "Commented Credential Literal (CWE-615 / NEEDS_MANUAL_VALIDATION) — Verify Staging DB Credential Validity & Purge Comment",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/db/connection.js",
    line: 45,
    snippetStartLine: 41,
    codeSnippet: `// Legacy staging connection config:
// const stagingPool = new Pool({
//   host: "db-staging.xtrike.internal",
//   user: "postgres",
//   password: "bank_stg_db_2025!" // Line 45: Credential literal retained in source comment
// });`,
    language: "JavaScript",
    source: "// password: \"bank_stg_db_2025!\"",
    sink: "Source code comment in src/db/connection.js:45",
    taintPath: [
      "src/db/connection.js:45 contains commented credential literal // password: \"bank_stg_db_2025!\"",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.87, confirmed: true, details: "Credential pattern in source comment at src/db/connection.js:45" },
      { name: "XTRIKE DeepFlow",  confidence: 0.72, confirmed: false, details: "Commented code is not executed at runtime; check credential validity" },
      { name: "XTRIKE StructSCA", confidence: 0.85, confirmed: true, details: "[Configuration] CWE-615 Sensitive credential in comment" },
      { name: "XTRIKE AST-Query", confidence: 0.84, confirmed: true, details: "commented-out-credentials rule matched" },
    ],
    confidence: 0.82,
    reachable: false,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Exposes staging database credentials to anyone with repository read access if password remains unrotated.",
    attackPath: [
      { label: "1. Repository Read",      type: "entry",         description: "Developer or CI reader inspects src/db/connection.js" },
      { label: "2. Commented Credential", type: "vulnerability", description: "Line 45 contains plaintext staging password in comment" },
      { label: "3. Staging DB Access",    type: "impact",        description: "Unauthorized DB access if credential is still active" },
    ],
    executiveSummary:
      "Lexical comment analysis of src/db/connection.js:45 identified a commented-out database connection block containing a hardcoded password literal.",
    businessImpact:
      "If the commented password is still active on staging or shared database hosts, anyone with source access can authenticate directly.",
    rootCause:
      "Developer commented out a legacy database configuration containing a plaintext password instead of deleting it and rotating the secret.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 8.6.2", description: "No hardcoded passwords in source files or comments" },
      { framework: "OWASP Top 10", reference: "A05:2021",  description: "Security Misconfiguration" },
    ],
    remediation: [
      {
        platform: "Node.js",
        explanation:
          "Delete the commented-out credential block from src/db/connection.js, verify whether the password was ever active on staging/production databases (rotating if so), and load all DB credentials from environment variables.",
        code: `// ❌ VULNERABLE (src/db/connection.js:41–46 — Commented-out credential block)
// const stagingPool = new Pool({ user: "postgres", password: "bank_stg_db_2025!" });

// ✅ FIXED — Remove Commented Credentials & Load Exclusively from Secret Store / Env
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});
module.exports = { pool };`,
      },
    ],
    regressionTest:
      "TC-CMT-615-001: Scan source comments for /(?:password|secret|api_key)\\s*[:=]/i and assert 0 matches.",
    validationSteps: [
      "1. Remove the commented block and rotate the staging DB password if it was ever live.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 38,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-023",
    title: "Unbounded Input Length on Profile Bio Update (Missing Schema Length Constraint)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-1284",
    cweName: "Improper Validation of Specified Quantity in Input",
    cvss: 4.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L",
    cvssRationale:
      "Base 4.3 Medium: req.body.bio at src/controllers/profile.controller.ts:34 is passed to profileService.update() without string length or payload size bounds, allowing multi-megabyte strings to exhaust memory/storage.",
    epss: 0.005,
    mitre: "T1499.004",
    owasp: "A04:2021",
    owaspCategory: "Insecure Design",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "Controller guard analysis of src/controllers/profile.controller.ts:34 confirmed req.body.bio is passed directly to profileService.update() without a Zod/Joi max-length schema check.",
    auditDisposition:
      "Guard-Analyzed Missing Input Length Schema Guard (CWE-1284) — Enforce Strict Zod Max-Length Validation",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/controllers/profile.controller.ts",
    line: 34,
    snippetStartLine: 30,
    codeSnippet: `export async function updateProfileBio(req: Request, res: Response) {
  const bio = req.body.bio;
  // Line 34: Unbounded req.body.bio passed to persistence layer without type or length validation
  await profileService.update(req.user.id, { bio });
  return res.status(200).json({ updated: true });
}`,
    language: "TypeScript",
    source: "req.body.bio",
    sink: "profileService.update(req.user.id, { bio })",
    taintPath: [
      "const bio = req.body.bio",
      "await profileService.update(req.user.id, { bio }) // No max-length validation in controller",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.80, confirmed: true, details: "Unbounded input field req.body.bio at profile.controller.ts:34" },
      { name: "XTRIKE DeepFlow",  confidence: 0.76, confirmed: true, details: "req.body.bio reaches profileService.update without length guard" },
      { name: "XTRIKE StructSCA", confidence: 0.79, confirmed: true, details: "[Input Validation] CWE-1284 Missing quantity/length validation" },
      { name: "XTRIKE AST-Query", confidence: 0.78, confirmed: true, details: "missing-input-length-validation rule matched" },
    ],
    confidence: 0.78,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Application memory pressure or database row bloat via oversized string payloads.",
    attackPath: [
      { label: "1. Authenticated Request", type: "entry",         description: "POST /profile with multi-MB bio string" },
      { label: "2. Missing Length Guard",  type: "vulnerability", description: "profile.controller.ts:34 lacks max-length schema check" },
      { label: "3. Resource Exhaustion",   type: "impact",        description: "Degrades service memory and DB write performance" },
    ],
    executiveSummary:
      "Static guard analysis of src/controllers/profile.controller.ts:34 confirmed that req.body.bio is passed to profileService.update() without validating its type or maximum character length.",
    businessImpact:
      "Authenticated users can submit oversized payloads that degrade API worker memory and database storage.",
    rootCause:
      "Missing schema validation (e.g., Zod z.string().max(500)) on request body fields.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A04:2021", description: "Insecure Design (ASVS v4.0.3 5.1.3)" },
      { framework: "NIST 800-53",  reference: "SI-10",    description: "Information Input Validation" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Validate request bodies with a strict Zod schema enforcing type, trimming, and maximum character length (e.g., 500 chars) before calling the service layer.",
        code: `// ❌ VULNERABLE (profile.controller.ts:34)
await profileService.update(req.user.id, { bio: req.body.bio });

// ✅ FIXED — Strict Zod Schema with Maximum Length Bound
import { z } from "zod";

const UpdateProfileSchema = z.object({
  bio: z.string().trim().min(1).max(500),
}).strict();

export async function updateProfileBio(req: Request, res: Response) {
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile payload", issues: parsed.error.issues });
  }
  await profileService.update(req.user.id, { bio: parsed.data.bio });
  return res.status(200).json({ updated: true });
}`,
      },
    ],
    regressionTest:
      "TC-VAL-1284-001: Submit bio='A'.repeat(501) and assert HTTP 400 Bad Request.",
    validationSteps: [
      "1. Submit a 501-character bio string and confirm HTTP 400 rejection.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 40,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-024",
    title: "DOM-Based Cross-Site Scripting (XSS) Candidate — Unsafe innerHTML Assignment in React Component",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-79",
    cweName: "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
    cvss: 4.7,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:N/I:L/A:N",
    cvssRationale:
      "Base 4.7 Medium: React component at frontend/src/components/Comment.tsx:22 assigns comment.body to dangerouslySetInnerHTML / innerHTML without DOMPurify sanitization; exploitability depends on whether comment.body can contain unsanitized HTML.",
    epss: 0.014,
    mitre: "T1059.007",
    owasp: "A03:2021",
    owaspCategory: "Injection",
    proofState: "NEEDS_MANUAL_VALIDATION",
    evidenceType: "TAINT_DATAFLOW",
    modeledAssumptions:
      "AST sink inspection of frontend/src/components/Comment.tsx:22 confirmed comment.body is rendered via raw HTML injection without client-side DOMPurify sanitization; whether comment.body is sanitized before DB storage requires backend provenance verification.",
    auditDisposition:
      "Unsafe React HTML Sink (CWE-79 / NEEDS_MANUAL_VALIDATION) — Render as Plain JSX Text or Sanitize with DOMPurify",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "frontend/src/components/Comment.tsx",
    line: 22,
    snippetStartLine: 18,
    codeSnippet: `export function CommentCard({ comment }: { comment: { author: string; body: string } }) {
  return (
    <div className="comment-card">
      {/* Line 22: Unsafe raw HTML injection bypasses React's automatic JSX escaping */}
      <div dangerouslySetInnerHTML={{ __html: comment.body }} />
    </div>
  );
}`,
    language: "React / TypeScript",
    source: "comment.body prop",
    sink: "dangerouslySetInnerHTML={{ __html: comment.body }}",
    taintPath: [
      "export function CommentCard({ comment }: { comment: { author: string; body: string } })",
      "<div dangerouslySetInnerHTML={{ __html: comment.body }} />",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.89, confirmed: true, details: "Unsafe HTML sink in React component at Comment.tsx:22" },
      { name: "XTRIKE DeepFlow",  confidence: 0.82, confirmed: true, details: "comment.body prop passed to dangerouslySetInnerHTML without DOMPurify" },
      { name: "XTRIKE StructSCA", confidence: 0.86, confirmed: true, details: "[Dataflow] CWE-79 Unsanitized DOM HTML sink" },
      { name: "XTRIKE AST-Query", confidence: 0.88, confirmed: true, details: "react-dangerously-set-inner-html rule matched" },
    ],
    confidence: 0.86,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain: "Arbitrary JavaScript execution in victim browser sessions if comment.body contains unsanitized HTML.",
    attackPath: [
      { label: "1. Stored Comment Body",     type: "entry",         description: "User-submitted comment containing <img src=x onerror=...>" },
      { label: "2. Comment.tsx (Line 22)",   type: "vulnerability", description: "dangerouslySetInnerHTML renders raw HTML without DOMPurify" },
      { label: "3. Client Script Execution", type: "impact",        description: "Executes script in viewing user's browser origin" },
    ],
    executiveSummary:
      "Static AST inspection of frontend/src/components/Comment.tsx:22 confirmed that comment.body is rendered using dangerouslySetInnerHTML without client-side sanitization, bypassing React's built-in JSX auto-escaping.",
    businessImpact:
      "If user-supplied comments are not strictly stripped of HTML tags upstream, stored XSS payloads will execute in the browser of every user viewing the comment thread.",
    rootCause:
      "Use of dangerouslySetInnerHTML / innerHTML instead of standard JSX text binding ({comment.body}) or DOMPurify.sanitize().",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A03:2021", description: "Injection — Cross-Site Scripting (ASVS v4.0.3 5.3.3)" },
      { framework: "PCI DSS",      reference: "Req 6.2.4",description: "Prevent cross-site scripting (XSS)" },
    ],
    remediation: [
      {
        platform: "React / TypeScript",
        explanation:
          "Preferred fix: Render comment.body as standard JSX text ({comment.body}) so React escapes all HTML metacharacters automatically. If limited rich-text formatting is required, sanitize with DOMPurify.sanitize() using an explicit tag/attribute allowlist.",
        code: `// ❌ VULNERABLE (frontend/src/components/Comment.tsx:22)
<div dangerouslySetInnerHTML={{ __html: comment.body }} />

// ✅ PREFERRED FIX — Use React Default JSX Text Escaping (Zero HTML Execution)
export function CommentCard({ comment }: { comment: { author: string; body: string } }) {
  return (
    <div className="comment-card">
      <p className="comment-body">{comment.body}</p>
    </div>
  );
}

// ✅ ALTERNATIVE (If Safe Rich Formatting Is Required) — Sanitize with DOMPurify Allowlist
import DOMPurify from "dompurify";
const cleanHtml = DOMPurify.sanitize(comment.body, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "code"],
  ALLOWED_ATTR: [],
});
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />`,
      },
    ],
    regressionTest:
      "TC-XSS-079-001: Render <CommentCard comment={{ author: 'eve', body: '<img src=x onerror=alert(1)>' }} /> and assert no <img> element or onerror attribute is mounted in the DOM.",
    validationSteps: [
      "1. Replace dangerouslySetInnerHTML with standard JSX {comment.body} or DOMPurify.sanitize().",
      "2. Run Vitest/RTL test with '<img src=x onerror=alert(1)>' and confirm literal text rendering.",
    ],
    slaDeadline: "2026-11-17",
    owner: "Frontend Team",
    application: "Customer Portal UI",
    riskScore: 46,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-025",
    title: "Overly Permissive CORS Policy — Wildcard Origin (*)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-942",
    cweName: "Permissive Cross-domain Policy with Untrusted Domains",
    cvss: 4.8,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N",
    cvssRationale:
      "Base 4.8 Medium: Express CORS middleware at src/app.ts:22 configures origin: '*', permitting any external web origin to read API responses that do not rely on ambient credentials.",
    epss: 0.007,
    mitre: "T1189",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "AST configuration inspection of src/app.ts:22 confirmed app.use(cors({ origin: '*' })) is registered globally across API routes.",
    auditDisposition:
      "Guard-Analyzed Wildcard CORS Configuration (CWE-942) — Enforce Explicit Trusted Origin Allowlist",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/app.ts",
    line: 22,
    snippetStartLine: 19,
    codeSnippet: `import cors from "cors";

// Line 22: Wildcard Access-Control-Allow-Origin: * enabled across all API routes
app.use(cors({ origin: "*" }));`,
    language: "TypeScript",
    source: "cors({ origin: '*' })",
    sink: "Access-Control-Allow-Origin: * response header",
    taintPath: [
      "app.use(cors({ origin: \"*\" })) // Global wildcard CORS middleware at src/app.ts:22",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.90, confirmed: true, details: "Wildcard CORS origin '*' configured at src/app.ts:22" },
      { name: "XTRIKE DeepFlow",  confidence: 0.84, confirmed: true, details: "Access-Control-Allow-Origin: * emitted on API responses" },
      { name: "XTRIKE StructSCA", confidence: 0.88, confirmed: true, details: "[Configuration] CWE-942 Permissive cross-domain policy" },
      { name: "XTRIKE AST-Query", confidence: 0.89, confirmed: true, details: "cors-wildcard-origin rule matched" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Allows arbitrary third-party origins to read cross-origin API responses.",
    attackPath: [
      { label: "1. Malicious Origin",      type: "entry",         description: "Browser script on https://evil.example" },
      { label: "2. Wildcard CORS (Line 22)",type: "vulnerability", description: "API responds with Access-Control-Allow-Origin: *" },
      { label: "3. Cross-Origin Read",     type: "impact",        description: "Third-party script reads response body" },
    ],
    executiveSummary:
      "Static configuration inspection of src/app.ts:22 confirmed that the Express application enables cors({ origin: '*' }) globally.",
    businessImpact:
      "Permits untrusted web origins to perform cross-origin reads against public or token-parameterized endpoints.",
    rootCause:
      "Wildcard '*' used instead of an explicit origin allowlist.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration (ASVS v4.0.3 14.5.3)" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Replace origin: '*' with a strict allowlist of trusted frontend origins and set Vary: Origin.",
        code: `// ❌ VULNERABLE (src/app.ts:22)
app.use(cors({ origin: "*" }));

// ✅ FIXED — Explicit Trusted Origin Allowlist
const ALLOWED_ORIGINS = new Set([
  "https://portal.xtrike-banking.com",
  "https://admin.xtrike-banking.com",
]);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || ALLOWED_ORIGINS.has(requestOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not permitted by CORS policy"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);`,
      },
    ],
    regressionTest:
      "TC-CORS-942-001: Send preflight OPTIONS request with Origin: https://evil.example and assert Access-Control-Allow-Origin header is NOT emitted.",
    validationSteps: [
      "1. Verify requests with Origin: https://evil.example are rejected by the CORS origin callback.",
    ],
    slaDeadline: "2026-11-20",
    owner: "DevOps Team",
    application: "API Gateway",
    riskScore: 44,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-026",
    title: "Race Condition (TOCTOU) in Account Balance Update Transaction",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-362",
    cweName: "Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')",
    cvss: 4.2,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:L",
    cvssRationale:
      "Base 4.2 Medium: debitAccount() at src/services/payment.service.ts:112 performs a non-atomic getBalance() check followed by updateBalance(current - amount) without a database transaction or row-level lock.",
    epss: 0.008,
    mitre: "T1499",
    owasp: "A04:2021",
    owaspCategory: "Insecure Design",
    proofState: "PATH_FEASIBLE",
    evidenceType: "CONCURRENCY_STATE",
    modeledAssumptions:
      "Control-flow & state-isolation analysis of src/services/payment.service.ts:112 confirmed an unsynchronized check-then-act sequence (await getBalance(accountId) -> if (balance >= amount) -> await updateBalance(accountId, balance - amount)) with no SELECT ... FOR UPDATE or atomic SQL decrement.",
    auditDisposition:
      "Concurrency TOCTOU Window Feasible (CWE-362 / PATH_FEASIBLE) — Replace Read-Modify-Write with Atomic Conditional SQL UPDATE",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "src/services/payment.service.ts",
    line: 112,
    snippetStartLine: 106,
    codeSnippet: `export async function debitAccount(accountId: string, amount: number): Promise<void> {
  const currentBalance = await accountRepo.getBalance(accountId);
  if (currentBalance < amount) {
    throw new Error("Insufficient funds");
  }
  // Line 112: Non-atomic TOCTOU balance update allows parallel double-spend requests
  await accountRepo.updateBalance(accountId, currentBalance - amount);
}`,
    language: "TypeScript",
    source: "await accountRepo.getBalance(accountId)",
    sink: "await accountRepo.updateBalance(accountId, currentBalance - amount)",
    taintPath: [
      "const currentBalance = await accountRepo.getBalance(accountId) // Read outside lock",
      "if (currentBalance < amount) throw new Error(\"Insufficient funds\")",
      "await accountRepo.updateBalance(accountId, currentBalance - amount) // Unsynchronized write at line 112",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.83, confirmed: true, details: "TOCTOU check-then-act balance update at payment.service.ts:112" },
      { name: "XTRIKE DeepFlow",  confidence: 0.79, confirmed: true, details: "Read-modify-write across await boundary without row lock" },
      { name: "XTRIKE StructSCA", confidence: 0.85, confirmed: true, details: "[Time and State] Kingdom: Time and State — CWE-362 Race condition" },
      { name: "XTRIKE AST-Query", confidence: 0.81, confirmed: true, details: "async-toctou-balance-update rule matched" },
    ],
    confidence: 0.82,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Concurrent withdrawal requests can bypass balance checks (double-spend) within the async await window.",
    attackPath: [
      { label: "1. Parallel Withdrawals",  type: "entry",         description: "Two concurrent POST /payments requests for full balance" },
      { label: "2. Async Await Window",    type: "vulnerability", description: "Both requests read currentBalance before either writes" },
      { label: "3. Double-Spend Overdraft",type: "impact",        description: "Account debited twice while only subtracting amount once" },
    ],
    executiveSummary:
      "Concurrency state analysis of src/services/payment.service.ts:112 confirmed a check-then-act race condition (TOCTOU): debitAccount() reads the balance, awaits, and then writes currentBalance - amount without a database transaction or row-level lock.",
    businessImpact:
      "Concurrent requests can race the async read-modify-write window to overdraw accounts or double-spend balances.",
    rootCause:
      "Application-layer read-modify-write pattern used across async await boundaries instead of an atomic SQL conditional update or SELECT ... FOR UPDATE transaction.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A04:2021",  description: "Insecure Design (ASVS v4.0.3 1.11.1 / 11.1.4)" },
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Prevent race conditions and business logic bypasses" },
    ],
    remediation: [
      {
        platform: "TypeScript",
        explanation:
          "Execute the balance check and decrement atomically in a single parameterized SQL statement (UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1) inside a transaction.",
        code: `// ❌ VULNERABLE (payment.service.ts:107–112 — Non-atomic check-then-act)
const currentBalance = await accountRepo.getBalance(accountId);
if (currentBalance < amount) throw new Error("Insufficient funds");
await accountRepo.updateBalance(accountId, currentBalance - amount);

// ✅ FIXED — Atomic Single-Statement Conditional Decrement
export async function debitAccount(accountId: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Transfer amount must be positive");
  }
  const result = await db.query(
    "UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND balance >= $1 RETURNING balance",
    [amount, accountId]
  );
  if (result.rowCount === 0) {
    throw new Error("Insufficient funds or account not found");
  }
}`,
      },
    ],
    regressionTest:
      "TC-RACE-362-001: Fire 10 concurrent debitAccount(id, 100) calls against an account with balance=100 via Promise.allSettled(); assert exactly 1 succeeds and final balance == 0.",
    validationSteps: [
      "1. Run 10 parallel debit requests in integration test and verify exactly 1 succeeds.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Payments Team",
    application: "Customer API",
    riskScore: 44,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },

  {
    id: "F-027",
    title: "Overly Permissive IAM Role Binding (roles/owner Granted to Application Service Account)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-250",
    cweName: "Execution with Unnecessary Privileges",
    cvss: 4.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:C/C:L/I:N/A:N",
    cvssRationale:
      "Base 4.1 Medium: Terraform configuration at infra/terraform/iam.tf:67 binds roles/owner to the runtime banking API service account instead of least-privilege resource roles.",
    epss: 0.006,
    mitre: "T1078.004",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    proofState: "GUARD_ANALYZED",
    evidenceType: "CONFIGURATION_CONTROL",
    modeledAssumptions:
      "IaC AST inspection of infra/terraform/iam.tf:67 confirmed google_project_iam_member binds role = 'roles/owner' to serviceAccount:banking-api-sa; cloud Organization Policy constraints outside the repository are not modeled statically.",
    auditDisposition:
      "Guard-Analyzed Over-Privileged IaC IAM Binding (CWE-250) — Replace roles/owner with Scoped Least-Privilege Roles in Terraform HCL",
    advisoryApplicability: "FIRST_PARTY_CODE_WEAKNESS_NO_CVE",
    file: "infra/terraform/iam.tf",
    line: 67,
    snippetStartLine: 62,
    codeSnippet: `resource "google_project_iam_member" "banking_api_owner_binding" {
  project = var.project_id
  # Line 67: Primitive roles/owner role grants full project-wide administrative access
  role    = "roles/owner"
  member  = "serviceAccount:\${google_service_account.banking_api_sa.email}"
}`,
    language: "Terraform HCL",
    source: "role = \"roles/owner\" in infra/terraform/iam.tf:67",
    sink: "google_project_iam_member.banking_api_owner_binding",
    taintPath: [
      "infra/terraform/iam.tf:67 assigns role = \"roles/owner\" to google_service_account.banking_api_sa",
    ],
    engines: [
      { name: "XTRIKE XQL",       confidence: 0.94, confirmed: true, details: "Terraform IAM binding grants primitive roles/owner at iam.tf:67" },
      { name: "XTRIKE DeepFlow",  confidence: 0.88, confirmed: true, details: "Service account receives project-wide administrative permissions" },
      { name: "XTRIKE StructSCA", confidence: 0.92, confirmed: true, details: "[Configuration] CWE-250 Violation of least privilege in IaC" },
      { name: "XTRIKE AST-Query", confidence: 0.93, confirmed: true, details: "terraform-gcp-iam-primitive-owner rule matched" },
    ],
    confidence: 0.92,
    reachable: false,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Difficult",
    privilegeGain: "Amplifies any workload compromise or SSRF token theft into full GCP project takeover.",
    attackPath: [
      { label: "1. Service Account Token", type: "entry",         description: "Workload uses banking_api_sa identity" },
      { label: "2. roles/owner (Line 67)", type: "vulnerability", description: "Primitive owner role bound at project level" },
      { label: "3. Blast Radius Expansion",type: "impact",        description: "Full administrative control over all project resources" },
    ],
    executiveSummary:
      "Static Infrastructure-as-Code (IaC) analysis of infra/terraform/iam.tf:67 confirmed that the runtime banking API service account is bound to the primitive GCP role roles/owner at the project level.",
    businessImpact:
      "Violates least privilege; if the application container or service account token is compromised, the attacker gains full administrative ownership over the cloud project.",
    rootCause:
      "Primitive role (roles/owner) used in google_project_iam_member instead of resource-scoped predefined roles (e.g., roles/cloudsql.client, roles/storage.objectViewer).",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "NIST 800-53",  reference: "AC-6",      description: "Least Privilege" },
      { framework: "ISO 27001",    reference: "A.8.2",     description: "Privileged access rights" },
      { framework: "OWASP Top 10", reference: "A05:2021",  description: "Security Misconfiguration" },
    ],
    remediation: [
      {
        platform: "Terraform HCL",
        explanation:
          "Remove roles/owner and bind only the minimum predefined role (e.g., roles/cloudsql.client and bucket-scoped roles/storage.objectViewer) required by the banking API service account.",
        code: `# ❌ VULNERABLE (infra/terraform/iam.tf:64–69 — Project-wide primitive roles/owner)
resource "google_project_iam_member" "banking_api_owner_binding" {
  project = var.project_id
  role    = "roles/owner"
  member  = "serviceAccount:\${google_service_account.banking_api_sa.email}"
}

# ✅ FIXED — Least-Privilege Predefined Roles Scoped to Required Resources
resource "google_project_iam_member" "banking_api_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:\${google_service_account.banking_api_sa.email}"
}

resource "google_storage_bucket_iam_member" "banking_api_statements_reader" {
  bucket = google_storage_bucket.customer_statements.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:\${google_service_account.banking_api_sa.email}"
}`,
      },
    ],
    regressionTest:
      "TC-IAC-250-001: Run terraform validate & policy check asserting 0 google_project_iam_member resources use roles/owner or roles/editor.",
    validationSteps: [
      "1. Run terraform validate and confirm zero IAM bindings reference roles/owner or roles/editor.",
    ],
    slaDeadline: "2026-11-20",
    owner: "Cloud Infra Team",
    application: "Cloud Infrastructure (IaC)",
    riskScore: 42,
    firstDetected: "2026-08-15",
    lastSeen: "2026-10-26",
  },
];

/**
 * Guarantee that every finding's numeric CVSS v3.1 score and qualitative Severity band
 * are mathematically derived from its CVSS:3.1 vector string (AT-CVSS-01).
 */
export const FINDINGS: SASTFinding[] = RAW_FINDINGS.map((f) => {
  const vector = f.cvssVector || "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H";
  const computedCvss = calculateCvss31BaseScore(vector);
  const computedSeverity = cvss31QualitativeSeverity(computedCvss);
  return {
    ...f,
    cvssVector: vector,
    cvss: computedCvss,
    severity: computedSeverity,
  };
});

export default FINDINGS;
