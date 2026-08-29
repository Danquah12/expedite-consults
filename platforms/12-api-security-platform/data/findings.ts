import type { Collection, Environment, ApiHistoryEntry, ApiRequest, APIFinding, APIScanSummary } from "@/types/api";

// ─── Collections ─────────────────────────────────────────────────────────────
export const COLLECTIONS: Collection[] = [
  {
    id: "col-1", name: "ACME API v2", icon: "🌐",
    variables: [
      { id: "v1", key: "base_url", value: "https://api.acme.com/v2", enabled: true },
      { id: "v2", key: "api_version", value: "v2", enabled: true },
    ],
    folders: [
      {
        id: "f-auth", name: "Authentication",
        requests: [
          { id: "r-login", name: "Login", method: "POST", url: "{{base_url}}/auth/login", description: "Authenticate and receive JWT",
            headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
            params: [], auth: { type: "none" },
            body: { type: "json", content: '{\n  "username": "{{username}}",\n  "password": "{{password}}"\n}' },
            preScript: "// Auto-inject timestamp\npm.environment.set('timestamp', Date.now());",
            testScript: 'test("Status is 200", () => expect(response.status).toBe(200));\ntest("Token returned", () => expect(response.json.token).toBeDefined());\npm.environment.set("access_token", response.json.token);',
            tags: ["auth", "login"],
          },
          { id: "r-refresh", name: "Refresh Token", method: "POST", url: "{{base_url}}/auth/refresh", description: "Refresh JWT token",
            headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
            params: [], auth: { type: "bearer", token: "{{refresh_token}}" },
            body: { type: "json", content: '{\n  "refresh_token": "{{refresh_token}}"\n}' },
            preScript: "", testScript: 'test("Status is 200", () => expect(response.status).toBe(200));', tags: ["auth"],
          },
        ],
      },
      {
        id: "f-users", name: "Users",
        requests: [
          { id: "r-getuser", name: "Get User by ID", method: "GET", url: "{{base_url}}/users/{{user_id}}", description: "Retrieve user profile — test IDOR by changing user_id",
            headers: [], params: [{ id: "p1", key: "include", value: "profile,settings", enabled: true }],
            auth: { type: "bearer", token: "{{access_token}}" },
            body: { type: "none", content: "" },
            preScript: "", testScript: 'test("Status 200", () => expect(response.status).toBe(200));\ntest("User ID matches", () => expect(response.json.id).toBe(pm.environment.get("user_id")));',
            tags: ["users", "idor-test"],
          },
          { id: "r-updateuser", name: "Update User", method: "PUT", url: "{{base_url}}/users/{{user_id}}", description: "Update profile — test mass assignment",
            headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
            params: [], auth: { type: "bearer", token: "{{access_token}}" },
            body: { type: "json", content: '{\n  "displayName": "{{name}}",\n  "bio": "{{bio}}",\n  "is_admin": true\n}' },
            preScript: "", testScript: 'test("No privilege escalation", () => expect(response.json.is_admin).toBeUndefined());', tags: ["users", "mass-assignment"],
          },
        ],
        folders: [
          {
            id: "f-admin", name: "Admin (Restricted)",
            requests: [
              { id: "r-listusers", name: "List All Users", method: "GET", url: "{{base_url}}/admin/users", description: "Admin endpoint — verify access control",
                headers: [], params: [{ id: "p1", key: "page", value: "1", enabled: true }, { id: "p2", key: "limit", value: "100", enabled: true }],
                auth: { type: "bearer", token: "{{access_token}}" },
                body: { type: "none", content: "" },
                preScript: "", testScript: 'test("Non-admin gets 403", () => expect(response.status).toBe(403));', tags: ["admin", "bac"],
              },
            ],
          },
        ],
      },
      {
        id: "f-security", name: "Security Tests",
        requests: [
          { id: "r-sqli", name: "SQLi — Search Endpoint", method: "GET", url: "{{base_url}}/products/search", description: "Test SQL injection via q parameter",
            headers: [], params: [{ id: "p1", key: "q", value: "' UNION SELECT username,password,3,4 FROM users--", enabled: true }],
            auth: { type: "bearer", token: "{{access_token}}" }, body: { type: "none", content: "" },
            preScript: "pm.request.headers.add({ key: 'X-Security-Test', value: 'SQLi-UNION' });",
            testScript: 'test("No DB error exposed", () => expect(response.body).not.toContain("syntax error"));\ntest("No data leakage", () => expect(response.body).not.toContain("password"));',
            tags: ["security", "sqli"],
          },
          { id: "r-xss", name: "Stored XSS — Profile", method: "PUT", url: "{{base_url}}/profile/update", description: "Test XSS via displayName field",
            headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
            params: [], auth: { type: "bearer", token: "{{access_token}}" },
            body: { type: "json", content: '{\n  "displayName": "<script>alert(1)</script>",\n  "bio": "test"\n}' },
            preScript: "", testScript: 'test("XSS sanitized", () => expect(response.json.displayName).not.toContain("<script>"));', tags: ["security", "xss"],
          },
          { id: "r-jwt-none", name: "JWT alg:none Bypass", method: "GET", url: "{{base_url}}/admin/users", description: "Test JWT algorithm confusion",
            headers: [{ id: "h1", key: "Authorization", value: "Bearer eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.", enabled: true }],
            params: [], auth: { type: "none" }, body: { type: "none", content: "" },
            preScript: "", testScript: 'test("JWT alg:none rejected", () => expect(response.status).toBe(401));', tags: ["security", "jwt"],
          },
        ],
      },
    ],
  },
];

// ─── Environments ─────────────────────────────────────────────────────────────
export const ENVIRONMENTS: Environment[] = [
  {
    id: "env-prod", name: "Production", active: false,
    vars: [
      { id: "v1", key: "base_url",      value: "https://api.acme.com/v2",       enabled: true },
      { id: "v2", key: "username",      value: "admin@acme.com",                 enabled: true },
      { id: "v3", key: "password",      value: "•••••••••",                      enabled: true, secret: true },
      { id: "v4", key: "access_token",  value: "{{generated_at_runtime}}",       enabled: true },
      { id: "v5", key: "user_id",       value: "1001",                            enabled: true },
    ],
  },
  {
    id: "env-staging", name: "Staging", active: true,
    vars: [
      { id: "v1", key: "base_url",      value: "https://staging.api.acme.com/v2", enabled: true },
      { id: "v2", key: "username",      value: "testuser",                         enabled: true },
      { id: "v3", key: "password",      value: "•••••••••",                        enabled: true, secret: true },
      { id: "v4", key: "access_token",  value: "eyJhbGciOiJSUzI1NiJ9.eyJ1c2...", enabled: true },
      { id: "v5", key: "user_id",       value: "1000",                              enabled: true },
    ],
  },
  {
    id: "env-local", name: "Local Dev", active: false,
    vars: [
      { id: "v1", key: "base_url",      value: "http://localhost:3000/api/v2",   enabled: true },
      { id: "v2", key: "username",      value: "dev@local",                       enabled: true },
      { id: "v3", key: "access_token",  value: "dev-token-12345",                 enabled: true },
      { id: "v4", key: "user_id",       value: "999",                              enabled: true },
    ],
  },
];

// ─── History ──────────────────────────────────────────────────────────────────
export const API_HISTORY: ApiHistoryEntry[] = [
  { id: "h1", timestamp: "14:22:01", method: "POST", url: "https://staging.api.acme.com/v2/auth/login",    status: 200, time: 142, env: "Staging",   collection: "ACME API v2" },
  { id: "h2", timestamp: "14:22:09", method: "GET",  url: "https://staging.api.acme.com/v2/users/1001",   status: 200, time: 98,  env: "Staging",   collection: "ACME API v2" },
  { id: "h3", timestamp: "14:22:15", method: "GET",  url: "https://staging.api.acme.com/v2/products/search?q=%27+UNION+SELECT", status: 500, time: 287, env: "Staging", collection: "Security Tests" },
  { id: "h4", timestamp: "14:22:21", method: "PUT",  url: "https://staging.api.acme.com/v2/profile/update", status: 200, time: 203, env: "Staging",  collection: "ACME API v2" },
  { id: "h5", timestamp: "14:22:28", method: "POST", url: "https://staging.api.acme.com/v2/auth/refresh", status: 200, time: 67,  env: "Staging",   collection: "ACME API v2" },
  { id: "h6", timestamp: "14:21:50", method: "GET",  url: "https://api.acme.com/v2/admin/users",           status: 403, time: 45,  env: "Production", collection: "Admin" },
  { id: "h7", timestamp: "14:21:40", method: "DELETE",url:"https://staging.api.acme.com/v2/users/1002",   status: 204, time: 112, env: "Staging",   collection: "ACME API v2" },
  { id: "h8", timestamp: "14:21:30", method: "GET",  url: "https://staging.api.acme.com/v2/admin/users",   status: 200, time: 188, env: "Staging",   collection: "Security Tests" },
];

// ─── API Findings (scan) ──────────────────────────────────────────────────────
export const SCAN_SUMMARY: APIScanSummary = {
  target: "api.acme.com/v2", apiType: "REST",
  endpointsScanned: 83, criticalCount: 3, highCount: 4, mediumCount: 5, totalFindings: 12,
};

export const FINDINGS: APIFinding[] = [
  {
    id: "API-001", title: "BOLA — User record access by manipulating ID",
    severity: "Critical", category: "BOLA", apiType: "REST", status: "Open",
    endpoint: { method: "GET", path: "/api/v2/users/{id}", description: "Get user by ID" },
    description: "Broken Object Level Authorization: any authenticated user can access any other user's data by changing the ID parameter.",
    impact: "Full PII breach for all 50,000 users. Financial data, SSN fragments, and personal info accessible.",
    remediation: "Implement resource-level authorization. Verify authenticated user owns the resource. Use UUIDs instead of sequential IDs.",
    requestExample: `GET /api/v2/users/1001 HTTP/1.1\r\nHost: api.acme.com\r\nAuthorization: Bearer <user_1000_token>\r\n\r\n`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n{"id":1001,"name":"Jane Smith","email":"jane@corp.com","ssn_last4":"7821","salary":94000}`,
    owaspRef: "API1:2023", cweId: "CWE-639", owner: "API Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-002", title: "JWT 'none' algorithm accepted — Authentication bypass",
    severity: "Critical", category: "JWT", apiType: "REST", status: "Open",
    endpoint: { method: "GET", path: "/api/v2/admin/users", description: "Admin user list" },
    description: "The API accepts JWTs signed with alg:none, allowing attackers to forge tokens without a secret key.",
    impact: "Complete authentication bypass. Attacker can impersonate any user including administrators.",
    remediation: "Explicitly allowlist JWT algorithms. Reject 'none'. Use RS256 or ES256 with public key verification.",
    requestExample: `GET /api/v2/admin/users HTTP/1.1\r\nAuthorization: Bearer eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.\r\n\r\n`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n[{"id":1,"email":"admin@acme.com","role":"admin"},{"id":2,...}]`,
    owaspRef: "API2:2023", cweId: "CWE-327", owner: "Auth Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-003", title: "GraphQL introspection enabled in production",
    severity: "Critical", category: "Schema", apiType: "GraphQL", status: "Open",
    endpoint: { method: "POST", path: "/api/graphql", description: "GraphQL endpoint" },
    description: "GraphQL introspection is enabled allowing full schema discovery — all types, queries, mutations, and internal structures exposed.",
    impact: "Attacker can map entire API surface automatically. Exposes internal mutations, admin operations, and hidden fields.",
    remediation: "Disable introspection in production. Use field-level authorization. Implement query depth limiting.",
    requestExample: `POST /api/graphql HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"query":"{ __schema { types { name fields { name } } } }"}`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n{"data":{"__schema":{"types":[{"name":"User","fields":[{"name":"password_hash"},{"name":"secret_token"}]}]}}}`,
    owaspRef: "API8:2023", cweId: "CWE-200", owner: "API Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-004", title: "No rate limiting on authentication endpoint",
    severity: "High", category: "Rate Limiting", apiType: "REST", status: "Open",
    endpoint: { method: "POST", path: "/api/v2/auth/login", description: "Login endpoint" },
    description: "The login endpoint accepts unlimited requests without throttling, lockout, or CAPTCHA.",
    impact: "Credential stuffing and brute-force attacks. 10,000+ attempts accepted in testing.",
    remediation: "Implement rate limiting: max 5 attempts per IP per minute. Add exponential backoff. Consider CAPTCHA after 3 failures.",
    requestExample: `POST /api/v2/auth/login HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"username":"admin@acme.com","password":"password123"}`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n{"token":"eyJhbGci..."} (returned after 10,000th attempt — no lockout)`,
    owaspRef: "API4:2023", cweId: "CWE-307", owner: "Auth Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-005", title: "Password hash returned in API response",
    severity: "High", category: "Data Exposure", apiType: "REST", status: "Open",
    endpoint: { method: "GET", path: "/api/v2/admin/users/{id}", description: "Get user details (admin)" },
    description: "The admin user detail endpoint includes the bcrypt password hash in the JSON response.",
    impact: "Offline password cracking with Hashcat. Bcrypt at cost factor 10 crackable for weak passwords.",
    remediation: "Never return password hashes via API. Apply field-level projection. Audit all user-related responses.",
    requestExample: `GET /api/v2/admin/users/1 HTTP/1.1\r\nAuthorization: Bearer <admin_token>\r\n\r\n`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n{"id":1,"email":"admin@acme.com","password_hash":"$2a$10$rBhvQtyV...","role":"admin"}`,
    owaspRef: "API3:2023", cweId: "CWE-312", owner: "API Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-006", title: "Mass assignment allows privilege escalation",
    severity: "High", category: "Mass Assignment", apiType: "REST", status: "Open",
    endpoint: { method: "PUT", path: "/api/v2/users/{id}", description: "Update user profile" },
    description: "The user update endpoint binds all request properties including sensitive fields like is_admin and role.",
    impact: "Any user can escalate privileges to admin by including is_admin:true in the request body.",
    remediation: "Use allowlists for accepted fields. Never bind request body directly to ORM models. Separate user-visible from internal fields.",
    requestExample: `PUT /api/v2/users/1000 HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"displayName":"hacker","is_admin":true,"role":"admin"}`,
    responseExample: `HTTP/1.1 200 OK\r\n\r\n{"id":1000,"displayName":"hacker","is_admin":true,"role":"admin"}`,
    owaspRef: "API6:2023", cweId: "CWE-915", owner: "API Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-007", title: "CORS — Origin reflection with credentials allowed",
    severity: "High", category: "CORS", apiType: "REST", status: "Open",
    endpoint: { method: "GET", path: "/api/v2/users/me", description: "Current user profile" },
    description: "The API reflects arbitrary Origin headers and sets Access-Control-Allow-Credentials: true.",
    impact: "Cross-origin request forgery with credential exposure. Attacker can steal session data cross-domain.",
    remediation: "Maintain explicit CORS allowlist. Never combine origin reflection with credentials. Use SameSite=Strict cookies.",
    requestExample: `GET /api/v2/users/me HTTP/1.1\r\nOrigin: https://attacker.evil\r\nCookie: session=abc123\r\n\r\n`,
    responseExample: `HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: https://attacker.evil\r\nAccess-Control-Allow-Credentials: true\r\n\r\n{"id":1000,...}`,
    owaspRef: "API7:2023", cweId: "CWE-942", owner: "API Team", detectedAt: "2026-08-20",
  },
  {
    id: "API-008", title: "Swagger UI exposes internal API endpoints in production",
    severity: "Medium", category: "Schema", apiType: "REST", status: "Open",
    endpoint: { method: "GET", path: "/api/swagger-ui", description: "Swagger documentation" },
    description: "Interactive Swagger UI accessible in production exposes all endpoints including internal admin and debug routes.",
    impact: "Attacker can browse all endpoints, try them interactively, and discover undocumented attack surface.",
    remediation: "Disable Swagger UI in production. If needed, restrict behind authentication and IP allowlisting.",
    requestExample: `GET /api/swagger-ui HTTP/1.1\r\nHost: api.acme.com\r\n\r\n`,
    responseExample: `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html><!-- Swagger UI exposing /api/v2/admin/* endpoints -->`,
    owaspRef: "API9:2023", cweId: "CWE-200", owner: "DevOps", detectedAt: "2026-08-20",
  },
];
