import type { SASTFinding } from "@/types/sast";

export const FINDINGS: SASTFinding[] = [
  // ─── CRITICAL ───────────────────────────────────────────────────────────────
  {
    id: "F-001",
    title: "SQL Injection via Unsanitized User Input",
    severity: "Critical",
    status: "Open",
    cwe: "CWE-89",
    cweName: "Improper Neutralization of Special Elements used in an SQL Command",
    cvss: 9.8,
    epss: 0.142,
    mitre: "T1190",
    owasp: "A03:2021",
    owaspCategory: "Injection",
    file: "src/main/java/com/api/UserController.java",
    line: 142,
    language: "Java",
    source: "request.getParameter(\"id\")",
    sink: "jdbcTemplate.query(sql)",
    taintPath: [
      "request.getParameter(\"id\")",
      "String sql = \"SELECT * FROM users WHERE id = \" + id",
      "jdbcTemplate.query(sql)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.97, confirmed: true,  details: "Taint flow from HTTP param to SQL sink confirmed" },
      { name: "PatternGuard AST", confidence: 0.94, confirmed: true,  details: "Pattern match: java.sql injection rule" },
      { name: "Joern",   confidence: 0.99, confirmed: true,  details: "CPG path analysis: direct source→sink path" },
      { name: "DataFlow",confidence: 0.98, confirmed: true,  details: "No sanitization node in path" },
    ],
    confidence: 0.97,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Very Easy",
    privilegeGain: "Full database read/write access, potential OS command execution",
    attackPath: [
      { label: "Internet",              type: "entry",         description: "Unauthenticated HTTP request" },
      { label: "GET /api/users?id=...", type: "vulnerability", description: "SQL Injection point — id parameter not sanitized" },
      { label: "Database Query",        type: "lateral",       description: "Injected SQL executes against CustomerDB" },
      { label: "CustomerDB",            type: "asset",         description: "Contains PII: names, emails, payment info" },
      { label: "Full Data Exfiltration",type: "impact",        description: "All customer records extractable" },
    ],
    executiveSummary:
      "An attacker can extract the entire customer database without authentication by manipulating the 'id' URL parameter. This requires no special skills and can be automated. Combined with the public-facing nature of the endpoint, this represents an immediate data breach risk.",
    businessImpact:
      "Complete exposure of all customer PII. Potential GDPR/CCPA violation fines. Reputational damage. Estimated breach cost: $2M–$15M depending on record count.",
    rootCause:
      "String concatenation used to build SQL query instead of parameterized queries or prepared statements. Input reaches the sink with no sanitization layer.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",       reference: "Req 6.2.4",    description: "Prevent injection attacks" },
      { framework: "NIST 800-53",   reference: "SI-10",        description: "Information input validation" },
      { framework: "ISO 27001",     reference: "A.8.28",       description: "Secure coding" },
      { framework: "OWASP Top 10",  reference: "A03:2021",     description: "Injection" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Replace string concatenation with PreparedStatement to eliminate the injection point.",
        code: `// ❌ VULNERABLE
String sql = "SELECT * FROM users WHERE id = " + id;
jdbcTemplate.query(sql);

// ✅ FIXED — Use PreparedStatement
String sql = "SELECT * FROM users WHERE id = ?";
jdbcTemplate.query(sql, new Object[]{id}, rowMapper);`,
      },
      {
        platform: "Python",
        explanation: "Use parameterized queries with the DB-API parameter substitution.",
        code: `# ❌ VULNERABLE
cursor.execute(f"SELECT * FROM users WHERE id = {id}")

# ✅ FIXED
cursor.execute("SELECT * FROM users WHERE id = %s", (id,))`,
      },
      {
        platform: "Node.js",
        explanation: "Use query placeholders with your ORM or driver.",
        code: `// ❌ VULNERABLE
db.query(\`SELECT * FROM users WHERE id = \${id}\`);

// ✅ FIXED
db.query("SELECT * FROM users WHERE id = ?", [id]);`,
      },
    ],
    validationSteps: [
      "Send request: GET /api/users?id=1' OR '1'='1 — confirm no data returned",
      "Send request: GET /api/users?id=1; DROP TABLE users; -- — confirm no error/change",
      "Run CodeQL query java/sql-injection — confirm zero results",
      "Run PatternGuard AST with java.lang.security rules — confirm clean",
    ],
    slaDeadline: "2026-08-27",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 97,
    firstDetected: "2026-08-18",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-002",
    title: "Insecure Deserialization of Untrusted Data",
    severity: "Critical",
    status: "Open",
    cwe: "CWE-502",
    cweName: "Deserialization of Untrusted Data",
    cvss: 9.0,
    epss: 0.089,
    mitre: "T1059",
    owasp: "A08:2021",
    owaspCategory: "Software and Data Integrity Failures",
    file: "src/main/java/com/api/SessionManager.java",
    line: 87,
    language: "Java",
    source: "request.getCookies()",
    sink: "ObjectInputStream.readObject()",
    taintPath: [
      "Cookie sessionData = request.getCookies()[0]",
      "byte[] data = Base64.decode(sessionData.getValue())",
      "ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data))",
      "Object obj = ois.readObject()",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.95, confirmed: true, details: "Deserialization gadget chain detected" },
      { name: "PatternGuard AST", confidence: 0.90, confirmed: true, details: "java.io.ObjectInputStream rule triggered" },
      { name: "Joern",   confidence: 0.96, confirmed: true, details: "CPG confirms unsafe deserialization" },
      { name: "DataFlow",confidence: 0.93, confirmed: true, details: "Cookie value flows to readObject() unsanitized" },
    ],
    confidence: 0.94,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Remote code execution as application service account",
    attackPath: [
      { label: "Authenticated Session",   type: "entry",         description: "Attacker has valid session (or forged cookie)" },
      { label: "Crafted Serialized Object",type: "vulnerability", description: "Malicious Java serialized payload in cookie" },
      { label: "ObjectInputStream.readObject()", type: "lateral", description: "Gadget chain executes arbitrary code" },
      { label: "Application Server",      type: "asset",         description: "Full JVM context" },
      { label: "Remote Code Execution",   type: "impact",        description: "Attacker gains shell on application server" },
    ],
    executiveSummary:
      "An attacker who can manipulate session cookies can execute arbitrary code on the application server. This can lead to full system compromise, ransomware deployment, or use as a pivot point into internal networks.",
    businessImpact:
      "Full application server compromise. Lateral movement into internal network. Potential ransomware vector. Complete loss of application availability and data integrity.",
    rootCause:
      "Java ObjectInputStream used to deserialize user-controlled cookie data without type checking, allowlisting, or integrity verification.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 6.2.4",    description: "Protect against serialization attacks" },
      { framework: "NIST 800-53",  reference: "SI-16",        description: "Memory protection" },
      { framework: "OWASP Top 10", reference: "A08:2021",     description: "Software and Data Integrity Failures" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Use JSON/JWT for session data instead of Java serialization. If serialization is required, use a deserialization filter.",
        code: `// ❌ VULNERABLE
ObjectInputStream ois = new ObjectInputStream(inputStream);
Object obj = ois.readObject();

// ✅ FIXED — Use ObjectInputFilter (Java 17+)
ObjectInputStream ois = new ObjectInputStream(inputStream);
ois.setObjectInputFilter(info -> {
    if (info.serialClass() == AllowedClass.class) return ObjectInputFilter.Status.ALLOWED;
    return ObjectInputFilter.Status.REJECTED;
});`,
      },
    ],
    validationSteps: [
      "Generate ysoserial payload and embed in cookie — confirm no RCE",
      "Verify ObjectInputFilter is active and allowlist is restrictive",
      "Run ysoserial scanner against all deserialization endpoints",
      "CodeQL query: java/unsafe-deserialization — confirm zero results",
    ],
    slaDeadline: "2026-08-27",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 92,
    firstDetected: "2026-08-15",
    lastSeen: "2026-08-20",
  },

  // ─── HIGH ────────────────────────────────────────────────────────────────────
  {
    id: "F-003",
    title: "IDOR — Broken Object Level Authorization",
    severity: "High",
    status: "Open",
    cwe: "CWE-639",
    cweName: "Authorization Bypass Through User-Controlled Key",
    cvss: 8.1,
    epss: 0.074,
    mitre: "T1078",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    file: "src/main/java/com/api/AccountController.java",
    line: 213,
    language: "Java",
    source: "request.getParameter(\"accountId\")",
    sink: "accountRepository.findById(accountId)",
    taintPath: [
      "String accountId = request.getParameter(\"accountId\")",
      "Account acct = accountRepository.findById(accountId)",
      "return acct; // No ownership check",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.88, confirmed: true,  details: "Missing authorization check before data access" },
      { name: "PatternGuard AST", confidence: 0.85, confirmed: true,  details: "IDOR pattern: user input → DB fetch, no auth check" },
      { name: "Joern",   confidence: 0.90, confirmed: true,  details: "No ownership validation node in call graph" },
      { name: "DataFlow",confidence: 0.87, confirmed: false, details: "Low confidence — auth may be elsewhere in chain" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Access to any account's data by incrementing accountId",
    attackPath: [
      { label: "Authenticated User",   type: "entry",         description: "Valid user session required" },
      { label: "GET /api/accounts/123",type: "vulnerability", description: "No ownership check — any accountId accepted" },
      { label: "AccountRepository",    type: "lateral",       description: "Fetches any account from DB" },
      { label: "Customer Accounts",    type: "asset",         description: "All customer financial data" },
      { label: "Horizontal Privilege Escalation", type: "impact", description: "Any user can access any other user's account" },
    ],
    executiveSummary:
      "Any authenticated user can access another user's account data by changing the accountId parameter. This is a classic IDOR vulnerability that can expose all customer financial records.",
    businessImpact:
      "Exposure of all customer account data. GDPR violation risk. Customer trust damage. Regulatory fines.",
    rootCause:
      "The endpoint fetches records by ID without verifying that the requesting user owns or has permission to access that resource.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 7.1",   description: "Restrict access to system components" },
      { framework: "OWASP Top 10", reference: "A01:2021",  description: "Broken Access Control" },
      { framework: "NIST 800-53",  reference: "AC-3",      description: "Access enforcement" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Always verify the authenticated user owns the requested resource before returning data.",
        code: `// ❌ VULNERABLE
Account acct = accountRepository.findById(accountId);
return acct;

// ✅ FIXED
String userId = SecurityContextHolder.getContext()
    .getAuthentication().getName();
Account acct = accountRepository.findByIdAndUserId(accountId, userId);
if (acct == null) throw new AccessDeniedException("Forbidden");
return acct;`,
      },
    ],
    validationSteps: [
      "As User A, fetch /api/accounts/{User-B-account-id} — expect 403",
      "Verify authorization check exists in controller and service layer",
      "Run PatternGuard AST IDOR ruleset — confirm clean",
    ],
    slaDeadline: "2026-09-03",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 78,
    firstDetected: "2026-08-17",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-004",
    title: "Server-Side Request Forgery (SSRF)",
    severity: "High",
    status: "Open",
    cwe: "CWE-918",
    cweName: "Server-Side Request Forgery (SSRF)",
    cvss: 8.6,
    epss: 0.061,
    mitre: "T1090",
    owasp: "A10:2021",
    owaspCategory: "Server-Side Request Forgery",
    file: "src/controllers/webhook.controller.ts",
    line: 56,
    language: "Node.js",
    source: "req.body.callbackUrl",
    sink: "axios.get(callbackUrl)",
    taintPath: [
      "const callbackUrl = req.body.callbackUrl",
      "const response = await axios.get(callbackUrl)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.92, confirmed: true, details: "SSRF pattern confirmed — user URL to HTTP client" },
      { name: "PatternGuard AST", confidence: 0.89, confirmed: true, details: "nodejs/ssrf rule triggered" },
      { name: "Joern",   confidence: 0.91, confirmed: true, details: "URL flows directly to outbound HTTP call" },
      { name: "DataFlow",confidence: 0.90, confirmed: true, details: "No allowlist validation in taint path" },
    ],
    confidence: 0.91,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Internal network access, cloud metadata service access, port scanning",
    attackPath: [
      { label: "Attacker (Authenticated)",   type: "entry",         description: "POST /webhooks with malicious URL" },
      { label: "callbackUrl: http://169.254.169.254/", type: "vulnerability", description: "AWS metadata service URL" },
      { label: "Application Server HTTP Client", type: "lateral",  description: "Server makes request to internal URL" },
      { label: "Cloud Metadata Service",    type: "asset",         description: "Returns IAM credentials, instance info" },
      { label: "Cloud Account Compromise",  type: "impact",        description: "AWS/Azure credentials exposed to attacker" },
    ],
    executiveSummary:
      "An attacker can make the server issue HTTP requests to any URL — including internal services and cloud metadata endpoints — by controlling the webhook callback URL. This can expose AWS/Azure credentials and internal services.",
    businessImpact:
      "Cloud account credential theft. Internal network reconnaissance. Potential cloud account takeover.",
    rootCause:
      "User-supplied URL is passed directly to an HTTP client (axios) without allowlist validation or protocol/host restrictions.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A10:2021", description: "SSRF" },
      { framework: "NIST 800-53",  reference: "SC-7",     description: "Boundary protection" },
    ],
    remediation: [
      {
        platform: "Node.js",
        explanation: "Validate the URL against an allowlist of permitted domains and block private IP ranges.",
        code: `// ❌ VULNERABLE
const response = await axios.get(req.body.callbackUrl);

// ✅ FIXED
const ALLOWED_DOMAINS = ['api.trusted.com', 'hooks.partner.com'];
const url = new URL(req.body.callbackUrl);

if (!ALLOWED_DOMAINS.includes(url.hostname)) {
  return res.status(400).json({ error: 'URL not permitted' });
}

// Block private/internal IP ranges
const ipRanges = ['10.', '172.', '192.168.', '127.', '169.254.'];
if (ipRanges.some(range => url.hostname.startsWith(range))) {
  return res.status(400).json({ error: 'Internal URLs not permitted' });
}

const response = await axios.get(url.toString(), { timeout: 5000 });`,
      },
    ],
    validationSteps: [
      "POST callbackUrl=http://169.254.169.254/latest/meta-data/ — expect 400 rejection",
      "POST callbackUrl=http://internal-service/ — expect 400 rejection",
      "Confirm allowlist is enforced and covers all HTTP client usages",
    ],
    slaDeadline: "2026-09-03",
    owner: "API Team",
    application: "Webhook Service",
    riskScore: 81,
    firstDetected: "2026-08-16",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-005",
    title: "XML External Entity (XXE) Injection",
    severity: "High",
    status: "In Progress",
    cwe: "CWE-611",
    cweName: "Improper Restriction of XML External Entity Reference",
    cvss: 7.5,
    epss: 0.043,
    mitre: "T1190",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    file: "src/services/XmlParserService.java",
    line: 34,
    language: "Java",
    source: "request.getInputStream()",
    sink: "DocumentBuilder.parse()",
    taintPath: [
      "InputStream xmlInput = request.getInputStream()",
      "DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance()",
      "// External entities NOT disabled",
      "DocumentBuilder db = dbf.newDocumentBuilder()",
      "Document doc = db.parse(xmlInput)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.91, confirmed: true, details: "XXE: external entity processing not disabled" },
      { name: "PatternGuard AST", confidence: 0.88, confirmed: true, details: "java.xxe rule: DocumentBuilderFactory without security features" },
      { name: "Joern",   confidence: 0.89, confirmed: true, details: "No setFeature(DISALLOW_DOCTYPE) call in path" },
      { name: "DataFlow",confidence: 0.85, confirmed: true, details: "XML input from HTTP body to parser" },
    ],
    confidence: 0.88,
    reachable: true,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Local file read, internal network probing",
    attackPath: [
      { label: "Authenticated API Request", type: "entry",         description: "POST XML payload to /api/import" },
      { label: "XXE Payload in XML",        type: "vulnerability", description: "<!ENTITY xxe SYSTEM 'file:///etc/passwd'>" },
      { label: "XML Parser",                type: "lateral",       description: "Processes external entity reference" },
      { label: "Filesystem / Internal Services", type: "asset",   description: "Local files and internal HTTP endpoints" },
      { label: "Data Exfiltration",         type: "impact",        description: "Sensitive config files, credentials readable" },
    ],
    executiveSummary:
      "The XML parser processes external entity declarations without restriction, allowing an authenticated attacker to read local files (e.g., /etc/passwd, application config) or probe internal services.",
    businessImpact:
      "Exposure of application configuration, credentials, and internal service discovery.",
    rootCause:
      "DocumentBuilderFactory created without disabling external entity processing or DOCTYPE declarations.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A05:2021", description: "Security Misconfiguration" },
      { framework: "NIST 800-53",  reference: "SI-10",    description: "Input validation" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Disable external entity processing and DOCTYPE declarations on the DocumentBuilderFactory.",
        code: `// ❌ VULNERABLE
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
DocumentBuilder db = dbf.newDocumentBuilder();

// ✅ FIXED
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);
DocumentBuilder db = dbf.newDocumentBuilder();`,
      },
    ],
    validationSteps: [
      "POST XML with <!ENTITY xxe SYSTEM 'file:///etc/passwd'> — confirm no file content returned",
      "Verify DocumentBuilderFactory has all security features set",
      "Run CodeQL xxe query — confirm zero results",
    ],
    slaDeadline: "2026-09-10",
    owner: "Integration Team",
    application: "Import Service",
    riskScore: 71,
    firstDetected: "2026-08-10",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-006",
    title: "Authentication Bypass via JWT Algorithm Confusion",
    severity: "High",
    status: "Open",
    cwe: "CWE-287",
    cweName: "Improper Authentication",
    cvss: 8.8,
    epss: 0.051,
    mitre: "T1550.001",
    owasp: "A07:2021",
    owaspCategory: "Identification and Authentication Failures",
    file: "src/middleware/auth.middleware.ts",
    line: 22,
    language: "Node.js",
    source: "req.headers.authorization",
    sink: "jwt.verify(token, secret, { algorithms: undefined })",
    taintPath: [
      "const token = req.headers.authorization.split(' ')[1]",
      "const payload = jwt.verify(token, publicKey)",
      "// algorithms option not specified — allows 'none' algorithm",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.93, confirmed: true, details: "JWT verify called without algorithm constraint" },
      { name: "PatternGuard AST", confidence: 0.91, confirmed: true, details: "jwt-none-algorithm rule triggered" },
      { name: "Joern",   confidence: 0.90, confirmed: true, details: "Algorithm parameter missing in JWT verify call" },
      { name: "DataFlow",confidence: 0.89, confirmed: true, details: "Token header flows to verify without algorithm lock" },
    ],
    confidence: 0.91,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain: "Full authentication bypass — can forge any user token including admin",
    attackPath: [
      { label: "Internet (No Auth)",     type: "entry",         description: "Attacker crafts forged JWT" },
      { label: "alg:none JWT Token",     type: "vulnerability", description: "Token with algorithm=none accepted" },
      { label: "JWT Verification",       type: "lateral",       description: "Signature check bypassed" },
      { label: "Admin Session",          type: "asset",         description: "Attacker claims admin role in payload" },
      { label: "Full Application Access",type: "impact",        description: "Complete privilege escalation to any role" },
    ],
    executiveSummary:
      "The JWT library accepts tokens with the 'none' algorithm, meaning an attacker can forge a token for any user — including administrators — without knowing any secret key. This completely bypasses authentication.",
    businessImpact:
      "Complete authentication bypass. Any attacker can impersonate any user or admin. Full application compromise.",
    rootCause:
      "jwt.verify() called without specifying the allowed algorithms parameter, enabling the 'none' algorithm attack.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A07:2021",  description: "Identification and Authentication Failures" },
      { framework: "PCI DSS",      reference: "Req 8.6.1", description: "Authentication mechanism security" },
      { framework: "NIST 800-53",  reference: "IA-5",      description: "Authenticator management" },
    ],
    remediation: [
      {
        platform: "Node.js",
        explanation: "Always specify the allowed algorithms explicitly in jwt.verify(). Never allow 'none'.",
        code: `// ❌ VULNERABLE
const payload = jwt.verify(token, publicKey);

// ✅ FIXED
const payload = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],  // Explicitly allowlist algorithms
});`,
      },
    ],
    validationSteps: [
      "Forge JWT with alg:none and empty signature — expect 401 rejection",
      "Confirm algorithms array is specified in all jwt.verify() calls",
      "Run PatternGuard AST jwt security rules — confirm clean",
    ],
    slaDeadline: "2026-08-27",
    owner: "Auth Team",
    application: "API Gateway",
    riskScore: 85,
    firstDetected: "2026-08-19",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-007",
    title: "Hardcoded AWS Secret Key in Source Code",
    severity: "High",
    status: "Open",
    cwe: "CWE-798",
    cweName: "Use of Hard-coded Credentials",
    cvss: 7.8,
    epss: 0.098,
    mitre: "T1552.001",
    owasp: "A02:2021",
    owaspCategory: "Cryptographic Failures",
    file: "src/services/storage.service.py",
    line: 11,
    language: "Python",
    source: "aws_secret_access_key = \"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\"",
    sink: "boto3.client(...)",
    taintPath: [
      "aws_access_key_id = 'AKIAIOSFODNN7EXAMPLE'",
      "aws_secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'",
      "client = boto3.client('s3', aws_access_key_id=..., aws_secret_access_key=...)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.99, confirmed: true, details: "Hardcoded string matches AWS key format" },
      { name: "PatternGuard AST", confidence: 0.99, confirmed: true, details: "secrets.hardcoded-aws-key rule triggered" },
      { name: "Joern",   confidence: 0.97, confirmed: true, details: "Literal string with high entropy in credential field" },
      { name: "DataFlow",confidence: 0.99, confirmed: true, details: "Key literal flows directly to AWS SDK client" },
    ],
    confidence: 0.99,
    reachable: true,
    internetFacing: false,
    authRequired: false,
    exploitabilityLevel: "Very Easy",
    privilegeGain: "Full AWS account access for associated IAM role",
    attackPath: [
      { label: "Repository Access",     type: "entry",         description: "Any developer with repo access" },
      { label: "Hardcoded Credential",  type: "vulnerability", description: "AWS key visible in plaintext source" },
      { label: "AWS SDK",               type: "lateral",       description: "Key used to authenticate to AWS" },
      { label: "Cloud Storage / Services", type: "asset",     description: "All resources accessible by IAM role" },
      { label: "Cloud Account Takeover", type: "impact",       description: "Data exfiltration, resource abuse, cost fraud" },
    ],
    executiveSummary:
      "An AWS secret access key is hardcoded directly in source code. Anyone with repository access — including attackers who gain access through other vulnerabilities — can extract this key and access AWS resources directly.",
    businessImpact:
      "Immediate AWS credential exposure. Potential for complete cloud account takeover, S3 data exfiltration, and significant cost fraud.",
    rootCause:
      "Developer stored credentials in source code instead of using environment variables, AWS Secrets Manager, or IAM instance roles.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 8.3.2",  description: "No hardcoded credentials" },
      { framework: "NIST 800-53",  reference: "IA-5(7)",    description: "No embedded unencrypted authenticators" },
      { framework: "ISO 27001",    reference: "A.8.13",     description: "Information backup and credential security" },
    ],
    remediation: [
      {
        platform: "Python",
        explanation: "Remove hardcoded credentials. Use environment variables or AWS IAM roles.",
        code: `# ❌ VULNERABLE
client = boto3.client('s3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/...')

# ✅ FIXED — Use environment variables
import os
client = boto3.client('s3',
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])

# ✅ BEST — Use IAM instance role (no credentials in code at all)
client = boto3.client('s3')  # Credentials from instance profile`,
      },
    ],
    validationSteps: [
      "Search codebase for AWS key patterns — confirm zero results",
      "Rotate the exposed key immediately in AWS IAM console",
      "Enable GitHub secret scanning to prevent future occurrences",
      "Verify credentials loaded from environment or Secrets Manager",
    ],
    slaDeadline: "2026-08-21",
    owner: "DevOps Team",
    application: "Storage Service",
    riskScore: 79,
    firstDetected: "2026-08-20",
    lastSeen: "2026-08-20",
  },

  // ─── MEDIUM ──────────────────────────────────────────────────────────────────
  {
    id: "F-008",
    title: "Cross-Site Request Forgery (CSRF) — State-Changing Endpoint",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-352",
    cweName: "Cross-Site Request Forgery (CSRF)",
    cvss: 6.5,
    epss: 0.024,
    mitre: "T1185",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    file: "src/controllers/AccountController.java",
    line: 78,
    language: "Java",
    source: "request.getParameter(\"email\")",
    sink: "userService.updateEmail(userId, email)",
    taintPath: [
      "@PostMapping(\"/account/update-email\")",
      "// No CSRF token validation",
      "String email = request.getParameter(\"email\")",
      "userService.updateEmail(userId, email)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.82, confirmed: true,  details: "State-changing POST with no CSRF token check" },
      { name: "PatternGuard AST", confidence: 0.78, confirmed: true,  details: "csrf-missing-token rule triggered" },
      { name: "Joern",   confidence: 0.80, confirmed: false, details: "CSRF token may be checked in filter layer" },
      { name: "DataFlow",confidence: 0.75, confirmed: false, details: "Cannot confirm absence of global CSRF filter" },
    ],
    confidence: 0.79,
    reachable: true,
    internetFacing: true,
    authRequired: true,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Perform actions as victim user (email change, password reset trigger)",
    attackPath: [
      { label: "Victim (Authenticated)", type: "entry",         description: "User visits attacker-controlled page" },
      { label: "Hidden Form / Script",   type: "vulnerability", description: "Auto-submits POST to /account/update-email" },
      { label: "No CSRF Token Check",    type: "lateral",       description: "Server accepts request without validation" },
      { label: "Account Update",         type: "impact",        description: "Victim's email changed to attacker's" },
    ],
    executiveSummary:
      "State-changing endpoints accept POST requests without CSRF token validation. An attacker can trick authenticated users into performing account changes by embedding hidden forms on malicious pages.",
    businessImpact:
      "Account hijacking via email/password changes. Unauthorized transactions. Loss of account integrity.",
    rootCause:
      "CSRF token generation and validation not implemented on state-changing endpoints.",
    falsePositiveLikelihood: "Medium",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021", description: "Broken Access Control" },
      { framework: "PCI DSS",      reference: "Req 6.2.4", description: "Web application security" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Enable Spring Security CSRF protection or implement Synchronizer Token Pattern.",
        code: `// ✅ Enable Spring Security CSRF (default in Spring Security)
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().csrfTokenRepository(
            CookieCsrfTokenRepository.withHttpOnlyFalse()
        );
    }
}`,
      },
    ],
    validationSteps: [
      "Submit state-changing POST without CSRF token — expect 403",
      "Verify Spring Security CSRF is enabled in SecurityConfig",
      "Test all state-changing endpoints with Autonomous Dynamic Fuzzer CSRF scanner",
    ],
    slaDeadline: "2026-09-17",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 58,
    firstDetected: "2026-08-12",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-009",
    title: "Path Traversal — Arbitrary File Read",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-22",
    cweName: "Improper Limitation of a Pathname to a Restricted Directory",
    cvss: 6.5,
    epss: 0.038,
    mitre: "T1083",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    file: "src/controllers/FileController.py",
    line: 44,
    language: "Python",
    source: "request.args.get('filename')",
    sink: "open(os.path.join(BASE_DIR, filename))",
    taintPath: [
      "filename = request.args.get('filename')",
      "filepath = os.path.join(BASE_DIR, filename)",
      "with open(filepath) as f: return f.read()",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.86, confirmed: true,  details: "Path traversal: user input in file open call" },
      { name: "PatternGuard AST", confidence: 0.83, confirmed: true,  details: "python.path-traversal rule triggered" },
      { name: "Joern",   confidence: 0.84, confirmed: true,  details: "filename parameter flows to filesystem sink" },
      { name: "DataFlow",confidence: 0.81, confirmed: true,  details: "No path normalization or containment check" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Easy",
    privilegeGain: "Read any file accessible to the application process",
    attackPath: [
      { label: "Authenticated Request",        type: "entry",         description: "GET /files?filename=../../etc/passwd" },
      { label: "Path Traversal Payload",       type: "vulnerability", description: "../ sequences escape base directory" },
      { label: "os.path.join() + open()",      type: "lateral",       description: "Opens arbitrary file on filesystem" },
      { label: "Application Filesystem",       type: "asset",         description: "Config files, credentials, system files" },
      { label: "Credential / Config Exposure", type: "impact",        description: "Database passwords, API keys readable" },
    ],
    executiveSummary:
      "User-supplied filename parameter is used directly in a file open call without path normalization. Attackers can read any file accessible to the application by supplying ../ sequences.",
    businessImpact:
      "Exposure of application secrets, configuration files, and potentially OS-level sensitive files.",
    rootCause:
      "os.path.join() does not prevent path traversal — a filename starting with / or containing ../ can escape the base directory.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021", description: "Broken Access Control" },
      { framework: "NIST 800-53",  reference: "SI-10",    description: "Input validation" },
    ],
    remediation: [
      {
        platform: "Python",
        explanation: "Resolve and validate the canonical path stays within the allowed base directory.",
        code: `import os

BASE_DIR = '/app/files'

# ❌ VULNERABLE
filepath = os.path.join(BASE_DIR, filename)
with open(filepath) as f: return f.read()

# ✅ FIXED
real_path = os.path.realpath(os.path.join(BASE_DIR, filename))
if not real_path.startswith(os.path.realpath(BASE_DIR) + os.sep):
    abort(403, "Path traversal detected")
with open(real_path) as f: return f.read()`,
      },
    ],
    validationSteps: [
      "Request ?filename=../../etc/passwd — expect 403",
      "Request ?filename=../config.py — expect 403",
      "Verify os.path.realpath containment check is present",
    ],
    slaDeadline: "2026-09-17",
    owner: "Backend Team",
    application: "File Service",
    riskScore: 60,
    firstDetected: "2026-08-14",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-010",
    title: "Weak Cryptographic Algorithm (MD5 for Password Hashing)",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-327",
    cweName: "Use of a Broken or Risky Cryptographic Algorithm",
    cvss: 5.9,
    epss: 0.019,
    mitre: "T1110",
    owasp: "A02:2021",
    owaspCategory: "Cryptographic Failures",
    file: "src/services/UserService.java",
    line: 156,
    language: "Java",
    source: "password",
    sink: "MessageDigest.getInstance(\"MD5\")",
    taintPath: [
      "String password = request.getParameter(\"password\")",
      "MessageDigest md = MessageDigest.getInstance(\"MD5\")",
      "byte[] hash = md.digest(password.getBytes())",
      "user.setPasswordHash(Base64.encode(hash))",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.95, confirmed: true, details: "MD5 used for password hashing — broken algorithm" },
      { name: "PatternGuard AST", confidence: 0.93, confirmed: true, details: "weak-crypto-md5 rule triggered" },
      { name: "Joern",   confidence: 0.92, confirmed: true, details: "MessageDigest.getInstance('MD5') in password flow" },
      { name: "DataFlow",confidence: 0.90, confirmed: true, details: "Password flows to MD5 MessageDigest" },
    ],
    confidence: 0.93,
    reachable: false,
    internetFacing: false,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Offline password cracking against leaked database",
    attackPath: [
      { label: "Database Breach (other vector)", type: "entry",         description: "Attacker obtains password hash dump" },
      { label: "MD5 Hashes",                    type: "vulnerability", description: "MD5 hashes are pre-image invertible via rainbow tables" },
      { label: "Offline Rainbow Table Attack",  type: "lateral",       description: "MD5 cracked in seconds with modern hardware" },
      { label: "User Passwords",               type: "asset",         description: "Plaintext passwords recovered" },
      { label: "Account Takeover",             type: "impact",        description: "All user accounts compromised from hash dump" },
    ],
    executiveSummary:
      "Passwords are hashed using MD5, which is cryptographically broken for this purpose. If the database is ever breached, all user passwords can be recovered near-instantly using rainbow tables, enabling mass account takeover.",
    businessImpact:
      "In the event of a database breach, all user passwords would be immediately recoverable. This amplifies the impact of any future breach significantly.",
    rootCause:
      "MD5 used instead of a modern password hashing algorithm (BCrypt, Argon2, PBKDF2). MD5 has no salt, no work factor, and is trivially reversible.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "PCI DSS",      reference: "Req 8.3.2",  description: "Strong cryptography for stored passwords" },
      { framework: "NIST 800-53",  reference: "IA-5(1)",    description: "Authenticator management — password-based" },
      { framework: "ISO 27001",    reference: "A.8.24",     description: "Use of cryptography" },
    ],
    remediation: [
      {
        platform: "Java",
        explanation: "Replace MD5 with BCrypt (Spring Security) which includes automatic salting and a work factor.",
        code: `// ❌ VULNERABLE
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] hash = md.digest(password.getBytes());

// ✅ FIXED — Use BCrypt
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12); // work factor 12
String hashedPassword = encoder.encode(password);

// Verify:
boolean matches = encoder.matches(rawPassword, storedHash);`,
      },
    ],
    validationSteps: [
      "Confirm no MessageDigest.getInstance('MD5') or 'SHA-1' in password context",
      "Verify BCryptPasswordEncoder or Argon2 is used for all password operations",
      "Migrate existing MD5 hashes: force password reset on next login",
    ],
    slaDeadline: "2026-09-17",
    owner: "Backend Team",
    application: "Customer API",
    riskScore: 55,
    firstDetected: "2026-08-11",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-011",
    title: "Open Redirect via Unvalidated returnUrl Parameter",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-601",
    cweName: "URL Redirection to Untrusted Site ('Open Redirect')",
    cvss: 6.1,
    epss: 0.017,
    mitre: "T1192",
    owasp: "A01:2021",
    owaspCategory: "Broken Access Control",
    file: "src/controllers/auth.controller.ts",
    line: 31,
    language: "Node.js",
    source: "req.query.returnUrl",
    sink: "res.redirect(returnUrl)",
    taintPath: [
      "const returnUrl = req.query.returnUrl as string",
      "// After login...",
      "res.redirect(returnUrl)",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.80, confirmed: true,  details: "Open redirect: user-controlled URL in redirect call" },
      { name: "PatternGuard AST", confidence: 0.77, confirmed: true,  details: "open-redirect rule triggered" },
      { name: "Joern",   confidence: 0.78, confirmed: false, details: "Redirect may have validation elsewhere" },
      { name: "DataFlow",confidence: 0.75, confirmed: false, details: "Cannot confirm absence of validation" },
    ],
    confidence: 0.78,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Easy",
    privilegeGain: "Phishing facilitation — trusted URL used for credential theft",
    attackPath: [
      { label: "Phishing Email / Link",  type: "entry",         description: "https://trustedapp.com/login?returnUrl=https://evil.com" },
      { label: "Open Redirect",          type: "vulnerability", description: "After login, user redirected to attacker URL" },
      { label: "Attacker Site",          type: "asset",         description: "Identical login page captures credentials" },
      { label: "Credential Theft",       type: "impact",        description: "User re-enters credentials on fake site" },
    ],
    executiveSummary:
      "The login endpoint redirects users to an arbitrary URL after authentication. Attackers can use the trusted domain in phishing campaigns to trick users into visiting malicious sites.",
    businessImpact:
      "Phishing facilitation using trusted company domain. Credential theft. Brand damage.",
    rootCause:
      "returnUrl parameter used directly in redirect without validation against an allowlist of permitted URLs.",
    falsePositiveLikelihood: "Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A01:2021", description: "Broken Access Control" },
    ],
    remediation: [
      {
        platform: "Node.js",
        explanation: "Validate returnUrl against an allowlist of permitted paths. Reject absolute URLs to external domains.",
        code: `// ❌ VULNERABLE
res.redirect(req.query.returnUrl);

// ✅ FIXED — Only allow relative paths on same domain
const returnUrl = req.query.returnUrl as string;
const url = new URL(returnUrl, \`https://\${req.hostname}\`);

if (url.hostname !== req.hostname) {
  return res.redirect('/dashboard'); // Default safe redirect
}
res.redirect(url.pathname + url.search);`,
      },
    ],
    validationSteps: [
      "?returnUrl=https://evil.com — expect redirect to /dashboard, not external URL",
      "?returnUrl=//evil.com — expect rejection",
      "Verify all redirect targets are validated against allowlist",
    ],
    slaDeadline: "2026-09-17",
    owner: "Auth Team",
    application: "API Gateway",
    riskScore: 52,
    firstDetected: "2026-08-13",
    lastSeen: "2026-08-20",
  },

  {
    id: "F-012",
    title: "Missing Security Response Headers",
    severity: "Medium",
    status: "Open",
    cwe: "CWE-693",
    cweName: "Protection Mechanism Failure",
    cvss: 5.4,
    epss: 0.012,
    mitre: "T1557",
    owasp: "A02:2021",
    owaspCategory: "Cryptographic Failures",
    file: "src/app.ts",
    line: 14,
    language: "Node.js",
    source: "express()",
    sink: "response headers",
    taintPath: [
      "const app = express()",
      "// No Strict-Transport-Security header",
      "// No X-Frame-Options header",
      "// No Content-Security-Policy header",
      "// No X-Content-Type-Options header",
    ],
    engines: [
      { name: "CodeQL",  confidence: 0.88, confirmed: true, details: "Missing security headers detected in Express config" },
      { name: "PatternGuard AST", confidence: 0.85, confirmed: true, details: "missing-security-headers rule triggered" },
      { name: "Joern",   confidence: 0.82, confirmed: true, details: "No helmet() or equivalent middleware in call graph" },
      { name: "DataFlow",confidence: 0.80, confirmed: true, details: "Response object not augmented with security headers" },
    ],
    confidence: 0.84,
    reachable: true,
    internetFacing: true,
    authRequired: false,
    exploitabilityLevel: "Moderate",
    privilegeGain: "Enables clickjacking, MIME sniffing attacks, downgrade attacks",
    attackPath: [
      { label: "Internet User",              type: "entry",         description: "Normal browsing session" },
      { label: "Missing HSTS",              type: "vulnerability", description: "Browser allows HTTP — enables downgrade attack" },
      { label: "Missing X-Frame-Options",   type: "vulnerability", description: "Page can be embedded in iframe" },
      { label: "Clickjacking / MITM",       type: "impact",        description: "User credentials/actions intercepted" },
    ],
    executiveSummary:
      "The application does not set critical browser security headers, leaving users exposed to clickjacking, MIME confusion attacks, and HTTP downgrade/MITM attacks.",
    businessImpact:
      "Facilitates credential theft, clickjacking, and man-in-the-middle attacks against application users.",
    rootCause:
      "Security middleware (e.g., Helmet.js) not configured in Express application.",
    falsePositiveLikelihood: "Very Low",
    compliance: [
      { framework: "OWASP Top 10", reference: "A02:2021",     description: "Cryptographic Failures" },
      { framework: "PCI DSS",      reference: "Req 6.2.4",    description: "Secure coding practices" },
      { framework: "NIST 800-53",  reference: "SC-8",         description: "Transmission confidentiality and integrity" },
      { framework: "ISO 27001",    reference: "A.8.9",        description: "Configuration management" },
    ],
    remediation: [
      {
        platform: "Node.js",
        explanation: "Add Helmet.js middleware to automatically set all security headers.",
        code: `// ✅ FIXED — Use Helmet.js
import helmet from 'helmet';

app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  contentSecurityPolicy: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
}));`,
      },
      {
        platform: "Java",
        explanation: "Add security headers in Spring Security or a filter.",
        code: `// Spring Security headers
http.headers()
    .contentSecurityPolicy("default-src 'self'")
    .and()
    .frameOptions().deny()
    .httpStrictTransportSecurity()
    .maxAgeInSeconds(31536000);`,
      },
    ],
    validationSteps: [
      "curl -I https://app.example.com — verify all headers present",
      "Run Mozilla Observatory or securityheaders.com scan — grade A minimum",
      "Verify HSTS, X-Frame-Options, CSP, X-Content-Type-Options all present",
    ],
    slaDeadline: "2026-09-17",
    owner: "DevOps Team",
    application: "API Gateway",
    riskScore: 48,
    firstDetected: "2026-08-09",
    lastSeen: "2026-08-20",
  },

  // ─── LOW ─────────────────────────────────────────────────────────────────────
  ...(
    [
      { id: "F-013", title: "Verbose Error Messages Exposing Stack Traces",    cwe: "CWE-209", cvss: 4.3, file: "src/middleware/error.middleware.ts:23",       source: "error.stack", sink: "res.json(error)" },
      { id: "F-014", title: "Insecure Cookie — Missing HttpOnly Flag",         cwe: "CWE-1004",cvss: 4.3, file: "src/services/session.service.ts:19",         source: "sessionId",   sink: "res.cookie(...)" },
      { id: "F-015", title: "Insecure Cookie — Missing Secure Flag",           cwe: "CWE-614", cvss: 3.7, file: "src/services/session.service.ts:19",         source: "sessionId",   sink: "res.cookie(...)" },
      { id: "F-016", title: "Logging of Sensitive Data (Password in Log)",     cwe: "CWE-532", cvss: 4.9, file: "src/services/auth.service.py:67",            source: "password",    sink: "logger.debug()" },
      { id: "F-017", title: "Insecure Randomness — Math.random() for Token",  cwe: "CWE-338", cvss: 4.8, file: "src/utils/token.util.ts:12",                 source: "Math.random()", sink: "resetToken" },
      { id: "F-018", title: "Missing Rate Limiting on Login Endpoint",         cwe: "CWE-307", cvss: 5.3, file: "src/controllers/auth.controller.ts:15",      source: "POST /login", sink: "authService.login()" },
      { id: "F-019", title: "Outdated Dependency — Apache Commons Text 1.9",  cwe: "CWE-1395",cvss: 4.0, file: "pom.xml:34",                                 source: "commons-text:1.9", sink: "StringSubstitutor" },
      { id: "F-020", title: "Debug Endpoint Exposed in Production",            cwe: "CWE-489", cvss: 4.8, file: "src/routes/admin.routes.ts:88",              source: "/debug/env",  sink: "process.env" },
      { id: "F-021", title: "Server Version Disclosed in Response Headers",   cwe: "CWE-200", cvss: 3.7, file: "src/app.ts:8",                               source: "X-Powered-By", sink: "response headers" },
      { id: "F-022", title: "Commented-Out Code Contains Credentials",        cwe: "CWE-615", cvss: 4.0, file: "src/db/connection.js:45",                    source: "//password:", sink: "source code" },
      { id: "F-023", title: "Missing Input Length Validation",                cwe: "CWE-1284",cvss: 4.3, file: "src/controllers/profile.controller.ts:34",   source: "req.body.bio", sink: "profileService.update()" },
      { id: "F-024", title: "Unsafe innerHTML Assignment",                     cwe: "CWE-79",  cvss: 4.7, file: "frontend/src/components/Comment.tsx:22",     source: "comment.body", sink: "innerHTML" },
      { id: "F-025", title: "Missing CORS Allowlist — Wildcard Origin",       cwe: "CWE-942", cvss: 4.8, file: "src/app.ts:22",                               source: "CORS config",  sink: "Access-Control-Allow-Origin: *" },
      { id: "F-026", title: "Race Condition in Balance Update Transaction",    cwe: "CWE-362", cvss: 4.2, file: "src/services/payment.service.ts:112",        source: "getBalance()", sink: "updateBalance()" },
      { id: "F-027", title: "Unused Elevated Permission in IAM Role Binding", cwe: "CWE-250", cvss: 4.1, file: "infra/terraform/iam.tf:67",                  source: "roles/owner",  sink: "service_account" },
    ] as Array<{id:string;title:string;cwe:string;cvss:number;file:string;source:string;sink:string}>
  ).map(f => ({
    ...f,
    severity: "Low" as const,
    status: "Open" as const,
    cweName: "Low severity misconfiguration or information disclosure",
    epss: 0.005,
    mitre: "T1082",
    owasp: "A05:2021",
    owaspCategory: "Security Misconfiguration",
    line: 1,
    language: "TypeScript",
    taintPath: [f.source, f.sink],
    engines: [
      { name: "CodeQL"  as const, confidence: 0.72, confirmed: true,  details: "Low severity pattern detected" },
      { name: "PatternGuard AST" as const, confidence: 0.70, confirmed: true,  details: "Security misconfiguration rule" },
      { name: "Joern"   as const, confidence: 0.68, confirmed: false, details: "Low confidence — context dependent" },
      { name: "DataFlow"as const, confidence: 0.65, confirmed: false, details: "Limited taint path evidence" },
    ],
    confidence: 0.69,
    reachable: false,
    internetFacing: false,
    authRequired: true,
    exploitabilityLevel: "Difficult" as const,
    privilegeGain: "Information disclosure or minor security control bypass",
    attackPath: [
      { label: "Attacker",           type: "entry"         as const, description: "Requires access to application" },
      { label: f.title,              type: "vulnerability" as const, description: `${f.cwe} — ${f.source}` },
      { label: "Limited Impact",     type: "impact"        as const, description: "Low severity — informational finding" },
    ],
    executiveSummary: `Low severity finding: ${f.title}. Does not represent an immediate risk but should be addressed as part of security hygiene.`,
    businessImpact: "Minimal direct business impact. Contributes to attack surface if combined with other vulnerabilities.",
    rootCause: "Security best practice not followed during development.",
    falsePositiveLikelihood: "Medium" as const,
    compliance: [
      { framework: "OWASP Top 10" as const, reference: "A05:2021", description: "Security Misconfiguration" },
    ],
    remediation: [
      { platform: "Node.js" as const, explanation: "Follow security best practices for this finding type.", code: `// Remediate per finding-specific guidance` },
    ],
    validationSteps: ["Verify the specific control is implemented", "Re-run scanner — confirm clean"],
    slaDeadline: "2026-10-20",
    owner: "Development Team",
    application: "Customer API",
    riskScore: Math.floor(f.cvss * 5),
    firstDetected: "2026-08-15",
    lastSeen: "2026-08-20",
  })),
];

export default FINDINGS;
