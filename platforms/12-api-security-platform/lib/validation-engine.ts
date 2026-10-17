export type ApiValidationStatus =
  | "CONFIRMED"
  | "LIKELY"
  | "FALSE_POSITIVE"
  | "NEEDS_ENVIRONMENT"
  | "FIXED_VERIFIED";

export interface SixPointApiProofContract {
  commitSha: string;
  openApiSha256: string;
  point1EntryToController: string;
  point2AuthPreconditions: string[];
  point3RoleDifferentialTrace: string;
  point4ExpectedVsObserved: {
    expectedSafe: string;
    observedBehavior: string;
  };
  point5Reproducibility: string;
  point6RemediationAndContractTest: string;
}

export interface ValidatedApiFinding {
  id: string;
  title: string;
  owaspApiId: string;
  cweId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: ApiValidationStatus;
  confidence: number;
  endpoint: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    apiType: "REST" | "GraphQL" | "gRPC";
    controllerFile: string;
    lineRange: string;
  };
  staticVerdict: {
    reachable: boolean;
    authMiddlewareChain: string[];
    missingPredicate: string;
    ormSink: string;
  };
  runtimeDifferential: {
    principalA: string;
    principalB: string;
    baselineResponse: string;
    differentialResponse: string;
    replaysMatched: string;
  };
  proofContract: SixPointApiProofContract;
}

export interface ApiSecurityClaimItem {
  id: string;
  title: string;
  owaspRef: string;
  formalInvariant: string;
  scope: string;
  status: "VERIFIED" | "COUNTEREXAMPLE_FOUND";
  solverTimeMs: number;
  counterexample?: {
    principalContext: string;
    requestInput: string;
    controllerPath: string;
    violatedPostcondition: string;
  };
  executableContract: string;
}

export interface PluggableApiModule {
  id: string;
  name: string;
  owaspFocus: string;
  capability: string;
  invariantVerified: string;
  status: "Active · Verified" | "Active · Alert";
  findingsCount: number;
  sampleEvidence: string;
}

export interface ApiMutantCase {
  id: string;
  endpoint: string;
  controllerFile: string;
  injectedDefect: string;
  owaspCategory: string;
  detected: boolean;
  catchingStage: string;
  timeMs: number;
}

export interface ApiReleaseGate {
  id: string;
  name: string;
  requirement: string;
  measured: string;
  status: "PASS" | "WARN";
  rationale: string;
}

export interface OwaspApiCatalogEntry {
  owaspId: string;
  name: string;
  cweIds: string[];
  nistControls: string[];
  sampleCves: string[];
  riskSummary: string;
  staticCheck: string;
  runtimeDifferentialCheck: string;
  remediationPattern: string;
  defensivePythonCheck: string;
}

export const API_PIPELINE_FINDINGS: ValidatedApiFinding[] = [
  {
    id: "API-001",
    title: "BOLA — Cross-Tenant User Record Access via Path ID",
    owaspApiId: "API1:2023",
    cweId: "CWE-639",
    severity: "Critical",
    status: "CONFIRMED",
    confidence: 0.99,
    endpoint: {
      method: "GET",
      path: "/api/v2/users/{id}",
      apiType: "REST",
      controllerFile: "services/users/controllers/user_controller.py",
      lineRange: "L42–L68",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["verify_jwt_bearer", "rate_limit_standard"],
      missingPredicate: "Missing `AND users.tenant_id = :jwt_tenant_id` in SQLAlchemy query",
      ormSink: "session.query(User).filter(User.id == path_id).first()",
    },
    runtimeDifferential: {
      principalA: "Tenant A (user_1000 · role: member)",
      principalB: "Tenant B Resource (user_1001 · Jane Smith)",
      baselineResponse: "GET /api/v2/users/1000 -> HTTP 200 OK (own record)",
      differentialResponse:
        "GET /api/v2/users/1001 with user_1000 JWT -> HTTP 200 OK (leaks ssn_last4, salary)",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController:
        "GET /api/v2/users/{id} -> UserController.get_user(id) -> UserRepository.find_by_id(id)",
      point2AuthPreconditions: [
        "Valid standard member JWT (`sub: 1000`, `tenant_id: org_alpha`)",
        "Target resource `1001` belongs to `tenant_id: org_beta`",
      ],
      point3RoleDifferentialTrace:
        "Replay #1..#3: Principal 1000 requested `/api/v2/users/1001` -> HTTP 200 OK (218 bytes, fields: `id, email, ssn_last4, salary`)",
      point4ExpectedVsObserved: {
        expectedSafe: "HTTP 403 Forbidden or HTTP 404 Not Found when `resource.tenant_id != jwt.tenant_id`",
        observedBehavior: "HTTP 200 OK returning full cross-tenant User DTO",
      },
      point5Reproducibility: "100% (3/3 isolated container replays on commit 9f4c2a1e)",
      point6RemediationAndContractTest:
        "Add `.filter(User.id == id, User.tenant_id == current_principal.tenant_id)` + Pytest contract `test_get_user_cross_tenant_denied`",
    },
  },
  {
    id: "API-002",
    title: "JWT 'alg: none' Signature Bypass on Admin Endpoint",
    owaspApiId: "API2:2023",
    cweId: "CWE-347",
    severity: "Critical",
    status: "CONFIRMED",
    confidence: 0.99,
    endpoint: {
      method: "GET",
      path: "/api/v2/admin/users",
      apiType: "REST",
      controllerFile: "services/auth/middleware/jwt_guard.py",
      lineRange: "L19–L44",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["jwt_decode_unpinned", "require_admin_claim"],
      missingPredicate: "`jwt.decode(token, pub_key)` invoked without explicit `algorithms=['RS256']`",
      ormSink: "AdminUserController.list_all_users()",
    },
    runtimeDifferential: {
      principalA: "Unauthenticated / Unsigned Token (`alg: none`, `role: admin`)",
      principalB: "Signed RS256 Admin Token",
      baselineResponse: "Unsigned token expected -> HTTP 401 Unauthorized",
      differentialResponse: "GET /api/v2/admin/users with `alg:none` token -> HTTP 200 OK (50 user records)",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController:
        "Authorization Header -> jwt_guard.verify_bearer() -> pyjwt.decode() -> AdminUserController.list_all_users()",
      point2AuthPreconditions: [
        "Endpoint reachable over HTTPS without mTLS client cert",
        "JWT verifier accepts header-controlled `alg` parameter",
      ],
      point3RoleDifferentialTrace:
        "Submitted synthetic lab token `eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9.` -> HTTP 200 OK",
      point4ExpectedVsObserved: {
        expectedSafe: "HTTP 401 Unauthorized (`InvalidAlgorithmError: The specified alg value is not allowed`)",
        observedBehavior: "HTTP 200 OK with admin user directory payload",
      },
      point5Reproducibility: "100% (3/3 replays verified on commit 9f4c2a1e)",
      point6RemediationAndContractTest:
        "Enforce `jwt.decode(token, key, algorithms=['RS256'], audience='api.acme.com', issuer='auth.acme.com')`",
    },
  },
  {
    id: "API-003",
    title: "GraphQL Schema Introspection & Internal Mutation Exposure",
    owaspApiId: "API8:2023",
    cweId: "CWE-200",
    severity: "Critical",
    status: "CONFIRMED",
    confidence: 0.98,
    endpoint: {
      method: "POST",
      path: "/api/graphql",
      apiType: "GraphQL",
      controllerFile: "services/graphql/schema_server.py",
      lineRange: "L74–L102",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["optional_jwt_context"],
      missingPredicate: "Ariadne/Strawberry server initialized with `introspection=True` in production config",
      ormSink: "GraphQLHTTPHandler(schema, introspection=True)",
    },
    runtimeDifferential: {
      principalA: "Anonymous Client",
      principalB: "Authenticated Client",
      baselineResponse: "POST /api/graphql `{ __schema { types { name } } }` -> expected HTTP 400/403",
      differentialResponse:
        "HTTP 200 OK exposing 42 internal types including `InternalPayoutMutation` and `User.password_hash`",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController:
        "POST /api/graphql -> GraphQLRouter.execute() -> IntrospectionSchemaResolver",
      point2AuthPreconditions: ["Public `/api/graphql` gateway route"],
      point3RoleDifferentialTrace:
        "Executed read-only `{ __schema { queryType { name } mutationType { fields { name } } } }` -> HTTP 200 OK",
      point4ExpectedVsObserved: {
        expectedSafe: "GraphQL validation error: `GraphQL introspection is not allowed in production`",
        observedBehavior: "Full schema metadata returned (38 queries, 19 mutations)",
      },
      point5Reproducibility: "100% (3/3 replays verified)",
      point6RemediationAndContractTest:
        "Add `DisableIntrospection()` validation rule when `ENV == 'production'` and enforce depth <= 6",
    },
  },
  {
    id: "API-006",
    title: "BOPLA / Mass Assignment Escalates `is_admin` & `role` Fields",
    owaspApiId: "API3:2023",
    cweId: "CWE-915",
    severity: "High",
    status: "CONFIRMED",
    confidence: 0.99,
    endpoint: {
      method: "PUT",
      path: "/api/v2/users/{id}",
      apiType: "REST",
      controllerFile: "services/users/controllers/user_controller.py",
      lineRange: "L88–L119",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["verify_jwt_bearer"],
      missingPredicate: "Request JSON dictionary unpacked directly into SQLAlchemy `User` model without DTO allowlist",
      ormSink: "for k, v in request.json.items(): setattr(user, k, v)",
    },
    runtimeDifferential: {
      principalA: "Standard User (`user_1000`, `role: member`)",
      principalB: "Same User after PUT with `{\"is_admin\": true}`",
      baselineResponse: "GET /api/v2/users/1000 -> `{\"is_admin\": false, \"role\": \"member\"}`",
      differentialResponse:
        "PUT /api/v2/users/1000 `{\"displayName\":\"dev\",\"is_admin\":true}` -> HTTP 200 OK `{\"is_admin\":true}`",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController:
        "PUT /api/v2/users/{id} -> UserController.update_user() -> setattr(user_entity, key, val)",
      point2AuthPreconditions: ["Authenticated member token updating own profile `/api/v2/users/1000`"],
      point3RoleDifferentialTrace:
        "State transition verified in sandbox DB rollback transaction: `user.is_admin` mutated `False -> True`",
      point4ExpectedVsObserved: {
        expectedSafe: "HTTP 422 Unprocessable Entity or silent filtering of `is_admin` and `role`",
        observedBehavior: "HTTP 200 OK persisting `is_admin: true` on User model",
      },
      point5Reproducibility: "100% (3/3 replays verified)",
      point6RemediationAndContractTest:
        "Bind input to `class UserProfileUpdateDTO(BaseModel): display_name: str; bio: str; model_config = ConfigDict(extra='forbid')`",
    },
  },
  {
    id: "API-005",
    title: "Excessive Data Exposure — `password_hash` Returned in User Detail JSON",
    owaspApiId: "API3:2023",
    cweId: "CWE-312",
    severity: "High",
    status: "CONFIRMED",
    confidence: 0.99,
    endpoint: {
      method: "GET",
      path: "/api/v2/admin/users/{id}",
      apiType: "REST",
      controllerFile: "services/admin/serializers/user_serializer.py",
      lineRange: "L14–L31",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["verify_jwt_bearer", "require_admin_claim"],
      missingPredicate: "Serializer uses `fields = '__all__'` on `User` ORM entity including `password_hash`",
      ormSink: "return jsonify(user.to_dict(include_sensitive=True))",
    },
    runtimeDifferential: {
      principalA: "Authorized Admin Token",
      principalB: "OpenAPI 3.1 `AdminUserResponse` Schema Contract",
      baselineResponse: "Schema declares `id, email, role, created_at`",
      differentialResponse: "Response JSON contains undeclared `password_hash: \"$2a$10$rBhvQtyV...\"`",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController:
        "GET /api/v2/admin/users/{id} -> AdminUserController.get_detail() -> User.to_dict()",
      point2AuthPreconditions: ["Admin role token"],
      point3RoleDifferentialTrace:
        "Response schema diff detected `password_hash` (60-char bcrypt digest) violating OpenAPI 3.1 contract",
      point4ExpectedVsObserved: {
        expectedSafe: "Response strictly projected through `AdminUserReadDTO` (no credential hashes)",
        observedBehavior: "Bcrypt digest serialized in HTTP 200 body",
      },
      point5Reproducibility: "100% (3/3 replays verified)",
      point6RemediationAndContractTest:
        "Exclude `password_hash`, `mfa_secret`, and `recovery_codes` at the ORM column deferral and Pydantic response_model layer",
    },
  },
  {
    id: "API-007",
    title: "CORS Arbitrary Origin Reflection with `Access-Control-Allow-Credentials: true`",
    owaspApiId: "API8:2023",
    cweId: "CWE-942",
    severity: "High",
    status: "CONFIRMED",
    confidence: 0.98,
    endpoint: {
      method: "GET",
      path: "/api/v2/users/me",
      apiType: "REST",
      controllerFile: "services/gateway/cors_policy.py",
      lineRange: "L22–L39",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["cors_reflect_middleware", "session_cookie_auth"],
      missingPredicate: "`allow_origin_regex='.*'` combined with `allow_credentials=True`",
      ormSink: "CORSMiddleware(allow_origin_regex='.*', allow_credentials=True)",
    },
    runtimeDifferential: {
      principalA: "Trusted Origin (`https://app.acme.com`)",
      principalB: "Untrusted Synthetic Origin (`https://sandbox-check.invalid`)",
      baselineResponse: "Trusted origin receives ACAO header",
      differentialResponse:
        "Untrusted Origin echoed in `Access-Control-Allow-Origin: https://sandbox-check.invalid` + `Allow-Credentials: true`",
      replaysMatched: "3 / 3 deterministic replays matched (100%)",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController: "OPTIONS/GET /api/v2/users/me -> CORSMiddleware.process_request()",
      point2AuthPreconditions: ["Browser session or credentialed cross-origin fetch"],
      point3RoleDifferentialTrace:
        "Sent `Origin: https://sandbox-check.invalid` -> Response echoed exact origin with `Access-Control-Allow-Credentials: true`",
      point4ExpectedVsObserved: {
        expectedSafe: "Omit `Access-Control-Allow-Origin` for non-allowlisted origins",
        observedBehavior: "Reflected arbitrary origin with credentials enabled",
      },
      point5Reproducibility: "100% (3/3 replays verified)",
      point6RemediationAndContractTest:
        "Replace regex reflection with strict origin allowlist `['https://app.acme.com', 'https://admin.acme.com']`",
    },
  },
  {
    id: "API-004",
    title: "Missing Rate-Limit Enforcement on `/api/v2/auth/login`",
    owaspApiId: "API4:2023",
    cweId: "CWE-307",
    severity: "High",
    status: "LIKELY",
    confidence: 0.86,
    endpoint: {
      method: "POST",
      path: "/api/v2/auth/login",
      apiType: "REST",
      controllerFile: "services/auth/controllers/login_controller.py",
      lineRange: "L30–L72",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["public_route"],
      missingPredicate: "Route bypasses Redis token-bucket limiter decorator `@rate_limit('5/minute')`",
      ormSink: "AuthService.authenticate_credentials(username, password)",
    },
    runtimeDifferential: {
      principalA: "Calibration Probe (15 sequential requests in 3s)",
      principalB: "Expected Quota Policy (5 req/min)",
      baselineResponse: "Requests #1..#5 -> HTTP 401 (with X-RateLimit-Remaining header)",
      differentialResponse:
        "Requests #6..#15 -> HTTP 401 without `X-RateLimit-Remaining` or `HTTP 429 Too Many Requests`",
      replaysMatched: "Staging Envoy rate-limit filter disabled in local docker-compose",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController: "POST /api/v2/auth/login -> LoginController.login()",
      point2AuthPreconditions: ["Public authentication endpoint"],
      point3RoleDifferentialTrace:
        "15 controlled calibration requests completed with 0 throttling headers; marked LIKELY pending production Envoy config verification",
      point4ExpectedVsObserved: {
        expectedSafe: "HTTP 429 Too Many Requests on request #6 within 60s window",
        observedBehavior: "All 15 requests processed at application layer without rate-limit headers",
      },
      point5Reproducibility: "100% at app layer (Envoy gateway policy check pending)",
      point6RemediationAndContractTest:
        "Attach `@rate_limit(key='ip+username', rate='5/m', block='15m')` at application controller in addition to API gateway",
    },
  },
  {
    id: "API-009",
    title: "Reported SQL Injection on `/api/v2/products/search` Parameter `q`",
    owaspApiId: "API8:2023",
    cweId: "CWE-89",
    severity: "Medium",
    status: "FALSE_POSITIVE",
    confidence: 0.96,
    endpoint: {
      method: "GET",
      path: "/api/v2/products/search",
      apiType: "REST",
      controllerFile: "services/catalog/controllers/product_controller.py",
      lineRange: "L51–L80",
    },
    staticVerdict: {
      reachable: true,
      authMiddlewareChain: ["verify_jwt_bearer"],
      missingPredicate: "None — query uses bound SQLAlchemy parameter `:q_pattern`",
      ormSink: "session.execute(select(Product).where(Product.name.ilike(:q_pattern)), {'q_pattern': f'%{q}%'})",
    },
    runtimeDifferential: {
      principalA: "Alphanumeric Search Query (`q=laptop`)",
      principalB: "Metacharacter Syntax Probe (`q=laptop'\"--`)",
      baselineResponse: "HTTP 200 OK (JSON array, 14ms)",
      differentialResponse: "HTTP 200 OK (empty JSON array `[]`, 12ms, 0 SQL syntax errors, bound parameter confirmed)",
      replaysMatched: "3 / 3 replays confirmed safe parameterization",
    },
    proofContract: {
      commitSha: "9f4c2a1e",
      openApiSha256: "sha256:4b8e91c0...d32a",
      point1EntryToController: "GET /api/v2/products/search -> ProductController.search()",
      point2AuthPreconditions: ["Standard bearer token"],
      point3RoleDifferentialTrace:
        "AST taint analysis + PostgreSQL statement log confirmed `$1` prepared parameter binding",
      point4ExpectedVsObserved: {
        expectedSafe: "Input treated strictly as literal string bind parameter",
        observedBehavior: "Input safely bound as `$1`; scanner rule triggered on legacy comment",
      },
      point5Reproducibility: "100% safe across 3 replays (Downgraded to FALSE_POSITIVE)",
      point6RemediationAndContractTest: "No code change required; scanner suppression recorded for commit 9f4c2a1e",
    },
  },
];

export const API_SECURITY_CLAIMS: ApiSecurityClaimItem[] = [
  {
    id: "CLAIM-API-01",
    title: "Tenant-Scoped Object Ownership on All `/api/v2/users/{id}` Routes",
    owaspRef: "API1:2023 · BOLA",
    formalInvariant:
      "∀ req, obj: route(req) == '/api/v2/users/{id}' ⇒ (status(req) == 200 ⇒ obj.tenant_id == req.jwt.tenant_id ∨ req.jwt.role == 'ADMIN')",
    scope: "services/users/controllers/user_controller.py (6 endpoints)",
    status: "COUNTEREXAMPLE_FOUND",
    solverTimeMs: 42,
    counterexample: {
      principalContext: "req.jwt = { sub: 1000, tenant_id: 'org_alpha', role: 'member' }",
      requestInput: "GET /api/v2/users/1001 (where user 1001 has tenant_id = 'org_beta')",
      controllerPath: "user_controller.py:L54 -> session.query(User).filter(User.id == 1001)",
      violatedPostcondition: "Returned HTTP 200 with org_beta record to org_alpha principal",
    },
    executableContract: `def test_claim_api_01_bola_tenant_isolation(client, token_org_alpha):
    # Generated from Z3 Counterexample Witness (CLAIM-API-01)
    response = client.get(
        "/api/v2/users/1001",
        headers={"Authorization": f"Bearer {token_org_alpha}"}
    )
    assert response.status_code in (403, 404), (
        f"BOLA violation: expected 403/404 for cross-tenant user 1001, got {response.status_code}"
    )`,
  },
  {
    id: "CLAIM-API-02",
    title: "Asymmetric JWT Algorithm Pinning (`RS256` / `ES256` Only)",
    owaspRef: "API2:2023 · Broken Auth",
    formalInvariant:
      "∀ token: jwt_verify(token) == VALID ⇒ token.header.alg ∈ {'RS256', 'ES256'} ∧ token.header.alg ≠ 'none'",
    scope: "services/auth/middleware/jwt_guard.py",
    status: "COUNTEREXAMPLE_FOUND",
    solverTimeMs: 19,
    counterexample: {
      principalContext: "Anonymous request with crafted JWT header",
      requestInput: "Header: {\"alg\": \"none\", \"typ\": \"JWT\"}, Payload: {\"userId\": 1, \"role\": \"admin\"}",
      controllerPath: "jwt_guard.py:L28 -> jwt.decode(token, options={'verify_signature': False})",
      violatedPostcondition: "jwt_verify(token) returned VALID for alg == 'none'",
    },
    executableContract: `def test_claim_api_02_reject_jwt_alg_none(client):
    unsigned_token = "eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9."
    response = client.get(
        "/api/v2/admin/users",
        headers={"Authorization": f"Bearer {unsigned_token}"}
    )
    assert response.status_code == 401`,
  },
  {
    id: "CLAIM-API-03",
    title: "Strict DTO Write-Field Allowlist on Profile Mutation Endpoints",
    owaspRef: "API3:2023 · BOPLA / Mass Assignment",
    formalInvariant:
      "∀ req: route(req) == 'PUT /api/v2/users/{id}' ⇒ keys(bound_orm_diff(req)) ∩ {'is_admin', 'role', 'tenant_id', 'balance'} == ∅",
    scope: "services/users/controllers/user_controller.py :: update_user",
    status: "COUNTEREXAMPLE_FOUND",
    solverTimeMs: 31,
    counterexample: {
      principalContext: "req.jwt = { sub: 1000, role: 'member' }",
      requestInput: "PUT /api/v2/users/1000 body: {\"displayName\": \"alice\", \"is_admin\": true}",
      controllerPath: "user_controller.py:L97 -> setattr(user, k, v) for k, v in req.json.items()",
      violatedPostcondition: "bound_orm_diff contains 'is_admin' == True",
    },
    executableContract: `def test_claim_api_03_block_mass_assignment(client, token_user_1000):
    response = client.put(
        "/api/v2/users/1000",
        json={"displayName": "alice", "is_admin": True, "role": "admin"},
        headers={"Authorization": f"Bearer {token_user_1000}"}
    )
    assert response.json().get("is_admin") is False
    assert response.json().get("role") == "member"`,
  },
  {
    id: "CLAIM-API-04",
    title: "Function-Level RBAC Guard Across All HTTP Verbs on `/api/v2/admin/*`",
    owaspRef: "API5:2023 · BFLA",
    formalInvariant:
      "∀ req: prefix(req.path, '/api/v2/admin/') ∧ method(req) ∈ {GET, POST, PUT, DELETE, PATCH} ⇒ (req.jwt.role ≠ 'ADMIN' ⇒ status(req) ∈ {401, 403})",
    scope: "services/admin/routers/admin_router.py (14 routes)",
    status: "VERIFIED",
    solverTimeMs: 28,
    executableContract: `@pytest.mark.parametrize("method", ["GET", "POST", "PUT", "DELETE", "PATCH"])
def test_claim_api_04_admin_verb_rbac(client, member_jwt, method):
    response = client.request(
        method, "/api/v2/admin/users",
        headers={"Authorization": f"Bearer {member_jwt}"}
    )
    assert response.status_code in (401, 403, 405)`,
  },
  {
    id: "CLAIM-API-05",
    title: "Idempotency & Positive-Amount Invariant on `/api/v2/Ledger/Transfer`",
    owaspRef: "API6:2023 · Business Flows",
    formalInvariant:
      "∀ tx1, tx2: tx1.idempotency_key == tx2.idempotency_key ⇒ committed_debits(tx1, tx2) == 1 ∧ tx1.amount > 0",
    scope: "services/ledger/controllers/transfer_controller.py",
    status: "VERIFIED",
    solverTimeMs: 54,
    executableContract: `def test_claim_api_05_transfer_idempotency(client, token_user_1000):
    headers = {"Authorization": f"Bearer {token_user_1000}", "Idempotency-Key": "idem-9941"}
    r1 = client.post("/api/v2/ledger/transfer", json={"to": 1002, "amount": 50}, headers=headers)
    r2 = client.post("/api/v2/ledger/transfer", json={"to": 1002, "amount": 50}, headers=headers)
    assert r1.status_code == 200 and r2.status_code == 409`,
  },
];

export const SPECIALIZED_API_MODULES: PluggableApiModule[] = [
  {
    id: "MOD-01",
    name: "Identity Propagation Analyzer",
    owaspFocus: "API1:2023 / API2:2023",
    capability: "Traces JWT `sub` and `tenant_id` claims from API Gateway through gRPC metadata to downstream microservices.",
    invariantVerified: "Downstream service never trusts unverified `X-User-Id` header when gateway mTLS is absent.",
    status: "Active · Alert",
    findingsCount: 1,
    sampleEvidence: "`orders-service` trusts raw `X-Tenant-Id` header on internal port 8082 without verifying gateway JWT signature.",
  },
  {
    id: "MOD-02",
    name: "Trust-Boundary & Gateway Drift Analyzer",
    owaspFocus: "API8:2023 / API9:2023",
    capability: "Compares Kong/Envoy gateway route tables and OpenAPI 3.1 specs against live framework router registrations.",
    invariantVerified: "Every exposed controller route is registered in the signed OpenAPI 3.1 contract.",
    status: "Active · Alert",
    findingsCount: 2,
    sampleEvidence: "Undocumented shadow route `GET /api/v1/users/export-csv` and `/api/swagger-ui` reachable in production.",
  },
  {
    id: "MOD-03",
    name: "Database Row-Level Authorization Analyzer",
    owaspFocus: "API1:2023 · CWE-639",
    capability: "Inspects SQLAlchemy / Prisma AST queries to ensure every primary-key lookup includes a tenant or owner predicate.",
    invariantVerified: "All `SELECT/UPDATE/DELETE` statements on multi-tenant tables bind `tenant_id == principal.tenant_id`.",
    status: "Active · Alert",
    findingsCount: 1,
    sampleEvidence: "`UserController.get_user` queries `User.id == path_id` without tenant filter (`API-001`).",
  },
  {
    id: "MOD-04",
    name: "File & Object-Storage Presigned URL Analyzer",
    owaspFocus: "API1:2023 / API8:2023",
    capability: "Audits S3/GCS presigned URL generation, upload MIME validation, and path traversal in object keys.",
    invariantVerified: "Presigned URLs expire within <= 900s and prefix object keys with authenticated `tenant_id/`.",
    status: "Active · Verified",
    findingsCount: 0,
    sampleEvidence: "All 4 document upload endpoints scope S3 keys to `s3://acme-docs/{tenant_id}/{uuid}` with 300s TTL.",
  },
  {
    id: "MOD-05",
    name: "Message-Queue & Async Consumer Security Analyzer",
    owaspFocus: "API6:2023 / API10:2023",
    capability: "Verifies Kafka/RabbitMQ event schemas and ensures async workers re-verify tenant authorization before executing side effects.",
    invariantVerified: "Async consumer validates schema signature and principal authorization state before execution.",
    status: "Active · Verified",
    findingsCount: 0,
    sampleEvidence: "Protobuf envelope signature and `tenant_id` ACL verified on `payout.requested` consumer.",
  },
  {
    id: "MOD-06",
    name: "API Cache & CDN Poisoning Analyzer",
    owaspFocus: "API8:2023 · CWE-524",
    capability: "Detects personalized API responses missing `Cache-Control: private, no-store` or `Vary: Authorization` headers.",
    invariantVerified: "Authenticated JSON responses never cache publicly at CDN edge without `Vary: Authorization`.",
    status: "Active · Verified",
    findingsCount: 0,
    sampleEvidence: "All `/api/v2/users/*` responses emit `Cache-Control: no-store, max-age=0`.",
  },
  {
    id: "MOD-07",
    name: "Cryptographic & JWT Token Guard",
    owaspFocus: "API2:2023 · CWE-347",
    capability: "Audits JWT signing algorithms, JWKS rotation, webhook HMAC comparison, and TLS cipher suites.",
    invariantVerified: "Rejects `alg: none`, enforces asymmetric `RS256/ES256`, and validates `exp`, `iss`, and `aud`.",
    status: "Active · Alert",
    findingsCount: 1,
    sampleEvidence: "`jwt_guard.py` accepts `alg: none` tokens (`API-002`).",
  },
  {
    id: "MOD-08",
    name: "Configuration & CORS Differential Analyzer",
    owaspFocus: "API8:2023 · CWE-942",
    capability: "Compares staging vs. production API gateway policies, CORS allowlists, and GraphQL introspection flags.",
    invariantVerified: "Production disables GraphQL introspection, Swagger UI, and wildcard credentialed CORS.",
    status: "Active · Alert",
    findingsCount: 2,
    sampleEvidence: "Production enables GraphQL introspection (`API-003`) and reflects arbitrary CORS origins (`API-007`).",
  },
  {
    id: "MOD-09",
    name: "Third-Party API & Webhook Consumption Analyzer",
    owaspFocus: "API7:2023 / API10:2023",
    capability: "Checks outbound webhook dispatchers for SSRF egress blocks and inbound webhooks for HMAC + replay window validation.",
    invariantVerified: "Outbound HTTP clients block RFC1918/link-local IPs; inbound webhooks enforce 300s timestamp window.",
    status: "Active · Verified",
    findingsCount: 0,
    sampleEvidence: "Egress proxy blocks `169.254.169.254` and `10.0.0.0/8` on webhook callback tester.",
  },
  {
    id: "MOD-10",
    name: "Multi-Step Business Workflow State Verifier",
    owaspFocus: "API6:2023 · CWE-841",
    capability: "Models multi-step API sequences (cart -> checkout -> capture -> refund) to detect state-skipping and race conditions.",
    invariantVerified: "Settlement and refund routes require prior `CAPTURED` state lock and idempotency token.",
    status: "Active · Verified",
    findingsCount: 0,
    sampleEvidence: "PostgreSQL `SELECT ... FOR UPDATE` row lock verified on `/api/v2/ledger/transfer`.",
  },
];

export const API_MUTATION_SUITE: ApiMutantCase[] = [
  {
    id: "MUT-API-01",
    endpoint: "GET /api/v2/invoices/{id}",
    controllerFile: "invoices_controller.py:L48",
    injectedDefect: "Removed `.filter(Invoice.tenant_id == principal.tenant_id)` predicate",
    owaspCategory: "API1:2023 (BOLA)",
    detected: true,
    catchingStage: "Stage D1 (ORM AST Validator) + Stage D2 (Role-Differential Replay)",
    timeMs: 310,
  },
  {
    id: "MUT-API-02",
    endpoint: "DELETE /api/v2/admin/tenants/{id}",
    controllerFile: "admin_router.py:L92",
    injectedDefect: "Commented out `@require_role('ADMIN')` decorator on DELETE verb",
    owaspCategory: "API5:2023 (BFLA)",
    detected: true,
    catchingStage: "Stage D1 (Router RBAC Matrix) + Z3 Claim Verifier (CLAIM-API-04)",
    timeMs: 185,
  },
  {
    id: "MUT-API-03",
    endpoint: "PATCH /api/v2/orgs/{id}/settings",
    controllerFile: "org_dto.py:L19",
    injectedDefect: "Changed Pydantic DTO `extra='forbid'` to `extra='allow'`",
    owaspCategory: "API3:2023 (BOPLA / Mass Assignment)",
    detected: true,
    catchingStage: "Stage D1 (DTO Schema Verifier) + Stage D2 (Property Differential Probe)",
    timeMs: 240,
  },
  {
    id: "MUT-API-04",
    endpoint: "POST /api/v2/webhooks/register",
    controllerFile: "webhook_service.py:L64",
    injectedDefect: "Bypassed `is_private_ip(parsed_url.hostname)` egress guard",
    owaspCategory: "API7:2023 (SSRF)",
    detected: true,
    catchingStage: "MOD-09 (Third-Party API & Egress Analyzer)",
    timeMs: 290,
  },
  {
    id: "MUT-API-05",
    endpoint: "POST /api/v2/auth/token",
    controllerFile: "jwt_signer.py:L33",
    injectedDefect: "Added `'HS256'` and `'none'` to allowed JWT verification algorithms",
    owaspCategory: "API2:2023 (Broken Auth)",
    detected: true,
    catchingStage: "MOD-07 (Cryptographic JWT Guard) + CLAIM-API-02",
    timeMs: 140,
  },
  {
    id: "MUT-API-06",
    endpoint: "POST /api/v2/coupons/redeem",
    controllerFile: "coupon_controller.py:L112",
    injectedDefect: "Removed Redis idempotency lock before balance credit",
    owaspCategory: "API6:2023 (Sensitive Business Flows)",
    detected: false,
    catchingStage: "Missed by single-request probe (flagged for multi-thread race fixture expansion)",
    timeMs: 620,
  },
];

export const API_RELEASE_GATES: ApiReleaseGate[] = [
  {
    id: "GATE-01",
    name: "Zero Unverified Confirmations",
    requirement: "0 CONFIRMED findings without a complete 6-Point Proof Contract",
    measured: "0 unverified (6 / 6 CONFIRMED have full proof contracts)",
    status: "PASS",
    rationale: "Prevents hallucinated or unverified scanner alerts from paging engineering teams.",
  },
  {
    id: "GATE-02",
    name: "Role-Differential Replay Reproducibility",
    requirement: ">= 98.0% deterministic match across 3 isolated container replays",
    measured: "100.0% (18 / 18 replay probes matched status & schema diff)",
    status: "PASS",
    rationale: "Guarantees every confirmed BOLA/BFLA/JWT finding is deterministically reproducible.",
  },
  {
    id: "GATE-03",
    name: "Scanner False-Positive Suppression",
    requirement: "Automatically downgrade parameterized/unreachable routes before triage",
    measured: "API-009 (SQLi on bound parameter) downgraded with proof",
    status: "PASS",
    rationale: "Saves developer triage hours by proving when ORM parameterization neutralizes taint.",
  },
  {
    id: "GATE-04",
    name: "API Security Mutation Catch Rate",
    requirement: ">= 90.0% of seeded BOLA/BFLA/JWT/DTO mutants detected",
    measured: "95.0% (19 / 20 seeded API security mutants caught)",
    status: "PASS",
    rationale: "Continuously benchmarks the validation engine against realistic authorization regressions.",
  },
  {
    id: "GATE-05",
    name: "Commit SHA & OpenAPI 3.1 Digest Binding",
    requirement: "100% of proof artifacts bound to exact Git SHA + OpenAPI SHA-256",
    measured: "100% bound (commit 9f4c2a1e · spec sha256:4b8e91c0...d32a)",
    status: "PASS",
    rationale: "Prevents stale validation results from carrying over after route or schema changes.",
  },
  {
    id: "GATE-06",
    name: "Executable Regression Contract Generation",
    requirement: "100% of CONFIRMED findings emit a runnable Pytest / Schemathesis test",
    measured: "6 / 6 CONFIRMED findings have CI-ready Pytest contracts",
    status: "PASS",
    rationale: "Turns every validated finding into a permanent CI/CD regression gate.",
  },
];

export const OWASP_API_CATALOG: OwaspApiCatalogEntry[] = [
  {
    owaspId: "API1:2023",
    name: "Broken Object Level Authorization (BOLA / IDOR)",
    cweIds: ["CWE-639", "CWE-284", "CWE-285"],
    nistControls: ["AC-3 (Access Enforcement)", "AC-4 (Information Flow Enforcement)"],
    sampleCves: ["CVE-2023-34362", "CVE-2024-21626"],
    riskSummary:
      "Endpoints taking object identifiers (`/users/{id}`, `/invoices/{id}`) fail to verify that the authenticated principal owns or is authorized for the target object.",
    staticCheck:
      "Parse ORM query ASTs in route controllers to verify every path/query ID lookup includes a `tenant_id == principal.tenant_id` or `owner_id == principal.sub` predicate.",
    runtimeDifferentialCheck:
      "Execute controlled two-principal replay in staging: Principal A requests Principal B's fixture resource ID; verify response is HTTP 403/404 and zero PII fields leak.",
    remediationPattern:
      "Centralize object-level authorization in a reusable policy dependency (`Depends(require_tenant_resource)`) and use tenant-scoped ORM sessions.",
    defensivePythonCheck: `from validation_engine.catalog import lookup_owasp_api_entry

entry = lookup_owasp_api_entry("API1:2023")
# Verify ORM query AST contains tenant_id predicate before promoting BOLA finding
assert "tenant_id" in query_ast.bound_predicates, entry.remediation_pattern`,
  },
  {
    owaspId: "API2:2023",
    name: "Broken Authentication (JWT & Token Verification)",
    cweIds: ["CWE-347", "CWE-287", "CWE-798"],
    nistControls: ["IA-2 (Identification & Auth)", "IA-5 (Authenticator Mgmt)", "SC-13 (Cryptographic Protection)"],
    sampleCves: ["CVE-2022-21449", "CVE-2023-48238"],
    riskSummary:
      "Weaknesses in JWT signature verification (`alg: none`, RS256/HS256 key confusion), missing expiration/audience checks, or unthrottled token endpoints.",
    staticCheck:
      "Inspect `jwt.decode` / `jwt.verify` call sites to confirm explicit `algorithms=['RS256']`, `verify_signature=True`, and required claims `['exp', 'iss', 'aud']`.",
    runtimeDifferentialCheck:
      "Send synthetic calibration tokens (`alg: none`, expired `exp`, wrong `aud`) to staging auth middleware and confirm deterministic HTTP 401 rejection.",
    remediationPattern:
      "Pin asymmetric algorithms (`RS256`/`ES256`), validate `iss`, `aud`, and `exp` claims, and fetch public keys from a pinned JWKS endpoint.",
    defensivePythonCheck: `def verify_jwt_strict(token: str, jwks_key: str) -> dict:
    return jwt.decode(
        token,
        jwks_key,
        algorithms=["RS256"],
        audience="https://api.acme.com",
        issuer="https://auth.acme.com",
        options={"require": ["exp", "iss", "aud", "sub"]},
    )`,
  },
  {
    owaspId: "API3:2023",
    name: "Broken Object Property Level Authorization (BOPLA)",
    cweIds: ["CWE-915", "CWE-213", "CWE-312"],
    nistControls: ["AC-3 (Access Enforcement)", "SI-10 (Input Validation)", "SC-28 (Protection of Info at Rest)"],
    sampleCves: ["CVE-2023-22515", "CVE-2024-23897"],
    riskSummary:
      "Combines Excessive Data Exposure (returning sensitive fields like `password_hash`) and Mass Assignment (allowing clients to mutate `is_admin` or `role`).",
    staticCheck:
      "Verify write endpoints bind to strict input DTOs (`extra='forbid'`) and read endpoints serialize through explicit output DTOs rather than raw ORM entities.",
    runtimeDifferentialCheck:
      "Diff actual HTTP 200 JSON keys against declared OpenAPI 3.1 response properties and test whether restricted fields (`is_admin`) are ignored or rejected on PUT/PATCH.",
    remediationPattern:
      "Define separate Pydantic/Marshmallow Read and Write DTOs with `extra='forbid'` and explicit field allowlists.",
    defensivePythonCheck: `class UserProfileUpdateDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")
    display_name: str
    bio: Optional[str] = None
    # Privileged fields (is_admin, role, tenant_id) are structurally unbindable`,
  },
  {
    owaspId: "API4:2023",
    name: "Unrestricted Resource Consumption (Rate Limits & Quotas)",
    cweIds: ["CWE-770", "CWE-400", "CWE-307"],
    nistControls: ["SC-5 (DoS Protection)", "AC-7 (Unsuccessful Logon Attempts)"],
    sampleCves: ["CVE-2023-44487"],
    riskSummary:
      "Missing rate limits, unbounded pagination (`?limit=1000000`), or deeply nested GraphQL queries exhaust CPU, memory, or database connections.",
    staticCheck:
      "Check route decorators and OpenAPI `x-ratelimit` extensions; verify pagination parameters enforce `le=100` and GraphQL enforces max depth/cost.",
    runtimeDifferentialCheck:
      "Execute a safe 15-request calibration burst in staging to verify `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` headers.",
    remediationPattern:
      "Enforce token-bucket rate limiting per principal/IP, bound pagination `limit: int = Query(25, ge=1, le=100)`, and add `DepthLimitValidator(max_depth=6)`.",
    defensivePythonCheck: `@router.get("/api/v2/users")
def list_users(limit: int = Query(default=25, ge=1, le=100)):
    return user_repo.list_paginated(limit=limit)`,
  },
  {
    owaspId: "API5:2023",
    name: "Broken Function Level Authorization (BFLA)",
    cweIds: ["CWE-285", "CWE-269"],
    nistControls: ["AC-3 (Access Enforcement)", "AC-6 (Least Privilege)"],
    sampleCves: ["CVE-2023-22518", "CVE-2023-46604"],
    riskSummary:
      "Regular users can invoke administrative endpoints (`/api/v2/admin/*`) or privileged HTTP methods (`DELETE`, `POST`) due to missing role guards.",
    staticCheck:
      "Build a Route × HTTP Verb × Role matrix from router ASTs and flag administrative routes lacking `@require_role('ADMIN')` on any verb.",
    runtimeDifferentialCheck:
      "Replay administrative endpoints across `GET`, `POST`, `PUT`, `DELETE` using a standard member token and confirm HTTP 403 Forbidden.",
    remediationPattern:
      "Attach router-level RBAC dependencies (`APIRouter(prefix='/admin', dependencies=[Depends(require_admin)])`) with default-deny policy.",
    defensivePythonCheck: `admin_router = APIRouter(
    prefix="/api/v2/admin",
    dependencies=[Depends(require_role("ADMIN"))],
)`,
  },
  {
    owaspId: "API6:2023",
    name: "Unrestricted Access to Sensitive Business Flows",
    cweIds: ["CWE-841", "CWE-799"],
    nistControls: ["AC-3 (Access Enforcement)", "SI-4 (System Monitoring)"],
    sampleCves: ["CVE-2023-38545"],
    riskSummary:
      "High-value workflows (ledger transfers, coupon redemption, inventory reservation) lack idempotency keys, state-machine locks, or velocity controls.",
    staticCheck:
      "Verify financial/workflow controllers require an `Idempotency-Key` header and acquire a database row lock (`with_for_update()`) before state mutation.",
    runtimeDifferentialCheck:
      "Submit two sequential requests with the same `Idempotency-Key` in staging and verify the second returns HTTP 409 Conflict without duplicate side effects.",
    remediationPattern:
      "Enforce unique idempotency keys in Redis/PostgreSQL and explicit workflow state transition guards.",
    defensivePythonCheck: `with db.begin():
    acct = db.execute(select(Account).where(Account.id == id).with_for_update()).scalar_one()
    acct.debit(amount)`,
  },
  {
    owaspId: "API7:2023",
    name: "Server Side Request Forgery (SSRF)",
    cweIds: ["CWE-918"],
    nistControls: ["SC-7 (Boundary Protection)", "SI-10 (Input Validation)"],
    sampleCves: ["CVE-2023-27524", "CVE-2024-21887"],
    riskSummary:
      "Webhook registration, avatar import, or OIDC discovery endpoints fetch user-supplied URLs without blocking internal VPC or cloud metadata IPs.",
    staticCheck:
      "Trace URL parameters flowing into `httpx`/`requests` calls and verify DNS resolution + private IP range (`169.254.0.0/16`, `10.0.0.0/8`, `127.0.0.0/8`) blocking.",
    runtimeDifferentialCheck:
      "Validate the URL sanitizer unit fixture rejects `http://169.254.169.254/latest/meta-data/` and non-HTTPS schemes.",
    remediationPattern:
      "Validate scheme == `https`, resolve hostname IP addresses, reject private/link-local/loopback ranges, and route outbound webhooks through an isolated egress proxy.",
    defensivePythonCheck: `ip = ipaddress.ip_address(socket.gethostbyname(parsed.hostname))
if ip.is_private or ip.is_loopback or ip.is_link_local:
    raise ValueError("Outbound connection to internal IP range is forbidden")`,
  },
  {
    owaspId: "API8:2023",
    name: "Security Misconfiguration (CORS, Introspection, Headers)",
    cweIds: ["CWE-942", "CWE-200", "CWE-16"],
    nistControls: ["CM-6 (Configuration Settings)", "CM-7 (Least Functionality)", "SI-11 (Error Handling)"],
    sampleCves: ["CVE-2023-29017"],
    riskSummary:
      "Reflected CORS origins with credentials, GraphQL introspection left enabled in production, missing `Cache-Control` headers, or stack traces in 500 responses.",
    staticCheck:
      "Inspect CORS middleware, GraphQL server initialization flags, and exception handlers across environment configurations.",
    runtimeDifferentialCheck:
      "Send probes with an untrusted `Origin` header and GraphQL `__schema` query; verify CORS origin is not reflected and introspection is disabled.",
    remediationPattern:
      "Use explicit CORS origin allowlists, disable GraphQL introspection in production, and return standardized RFC 7807 Problem Details errors.",
    defensivePythonCheck: `app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.acme.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)`,
  },
  {
    owaspId: "API9:2023",
    name: "Improper Inventory Management (Shadow & Zombie APIs)",
    cweIds: ["CWE-1059", "CWE-1357"],
    nistControls: ["CM-8 (System Component Inventory)", "SA-22 (Unsupported System Components)"],
    sampleCves: ["CVE-2023-35078"],
    riskSummary:
      "Deprecated API versions (`/api/v1/*`), unauthenticated `/api/swagger-ui`, or debug endpoints remain deployed without current authentication controls.",
    staticCheck:
      "Diff the framework's registered route table against the signed OpenAPI 3.1 specification to surface undocumented shadow endpoints.",
    runtimeDifferentialCheck:
      "Probe deprecated version prefixes (`/api/v1/`) and documentation routes in staging to verify they return `404`/`410 Gone` or require admin auth.",
    remediationPattern:
      "Enforce positive route allowlisting at the API Gateway generated directly from the OpenAPI 3.1 contract and decommission legacy `/v1` routers.",
    defensivePythonCheck: `undocumented = set(registered_routes) - set(openapi_spec.paths.keys())
assert not undocumented, f"Shadow API routes detected: {undocumented}"`,
  },
  {
    owaspId: "API10:2023",
    name: "Unsafe Consumption of Third-Party APIs & Webhooks",
    cweIds: ["CWE-20", "CWE-345", "CWE-502"],
    nistControls: ["SI-10 (Input Validation)", "SC-8 (Transmission Confidentiality & Integrity)"],
    sampleCves: ["CVE-2023-49103"],
    riskSummary:
      "Blindly trusting payloads from upstream partner APIs or incoming webhooks without HMAC signature verification, timestamp replay checks, or schema validation.",
    staticCheck:
      "Ensure webhook handlers verify `hmac.compare_digest` over raw request bytes + timestamp header and validate upstream responses with Pydantic.",
    runtimeDifferentialCheck:
      "Replay a webhook fixture with a 10-minute-old timestamp or invalid HMAC digest and confirm HTTP 400/401 rejection.",
    remediationPattern:
      "Verify webhook HMAC-SHA256 signatures using constant-time comparison, enforce a <= 300s timestamp window, and validate upstream API JSON against strict schemas.",
    defensivePythonCheck: `if abs(time.time() - int(timestamp_hdr)) > 300:
    raise HTTPException(status_code=400, detail="Webhook timestamp outside 300s replay window")
if not hmac.compare_digest(computed_sig, signature_hdr):
    raise HTTPException(status_code=401, detail="Invalid webhook HMAC signature")`,
  },
];
