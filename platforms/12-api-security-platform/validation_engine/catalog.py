"""
Defensive Security Reference Catalog for API Security (OWASP API Top 10:2023, MITRE CWE,
NIST NVD/CVE, and NIST SP 800-53 Rev. 5).

Strictly defensive: stores structured taxonomy metadata, safe static/runtime verification
checklists, and remediation patterns. Contains zero offensive exploit payloads.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class OwaspApiEntry:
    owasp_id: str
    title: str
    cwe_ids: List[str]
    nist_800_53_controls: List[str]
    sample_cves: List[str]
    static_verification_check: str
    runtime_differential_check: str
    remediation_pattern: str


OWASP_API_TOP_10_2023_CATALOG: Dict[str, OwaspApiEntry] = {
    "API1:2023": OwaspApiEntry(
        owasp_id="API1:2023",
        title="Broken Object Level Authorization (BOLA / IDOR)",
        cwe_ids=["CWE-639", "CWE-284", "CWE-285"],
        nist_800_53_controls=["AC-3 (Access Enforcement)", "AC-4 (Information Flow Enforcement)"],
        sample_cves=["CVE-2023-34362", "CVE-2024-21626"],
        static_verification_check="Verify every route with path/query object IDs enforces an ORM ownership or tenant_id predicate bound to the authenticated principal.",
        runtime_differential_check="Replay GET/PUT/DELETE with Principal A's token against Principal B's resource ID in an isolated test fixture; verify HTTP 403/404.",
        remediation_pattern="Enforce centralized policy dependencies (e.g., Depends(require_object_owner)) and scope all queries by authenticated tenant_id.",
    ),
    "API2:2023": OwaspApiEntry(
        owasp_id="API2:2023",
        title="Broken Authentication (JWT & Token Verification)",
        cwe_ids=["CWE-347", "CWE-287", "CWE-798"],
        nist_800_53_controls=["IA-2 (Identification and Authentication)", "IA-5 (Authenticator Management)", "SC-13 (Cryptographic Protection)"],
        sample_cves=["CVE-2022-21449", "CVE-2023-48238"],
        static_verification_check="Inspect JWT decoder calls for explicit algorithm allowlists (RS256/ES256), signature verification enabled, and iss/aud/exp validation.",
        runtime_differential_check="Submit a synthetic test token with alg:none or expired exp claim to staging auth middleware; confirm HTTP 401 rejection.",
        remediation_pattern="Pin asymmetric algorithms (algorithms=['RS256']), enforce strict iss/aud/exp checks, and rotate signing keys via JWKS.",
    ),
    "API3:2023": OwaspApiEntry(
        owasp_id="API3:2023",
        title="Broken Object Property Level Authorization (BOPLA / Excessive Data Exposure & Mass Assignment)",
        cwe_ids=["CWE-915", "CWE-213", "CWE-312"],
        nist_800_53_controls=["AC-3 (Access Enforcement)", "SI-10 (Information Input Validation)", "SC-28 (Protection of Information at Rest)"],
        sample_cves=["CVE-2023-22515", "CVE-2024-23897"],
        static_verification_check="Ensure request bodies bind to explicit input DTOs rather than ORM entities, and responses serialize through read-only output schemas.",
        runtime_differential_check="Compare API response fields against OpenAPI response schema to detect sensitive properties (password_hash, ssn_last4, role).",
        remediation_pattern="Separate Create/Update input DTOs from database models and strip privileged fields (is_admin, role, tenant_id) via strict schema validation.",
    ),
    "API4:2023": OwaspApiEntry(
        owasp_id="API4:2023",
        title="Unrestricted Resource Consumption (Rate Limiting & Pagination Quotas)",
        cwe_ids=["CWE-770", "CWE-400", "CWE-307"],
        nist_800_53_controls=["SC-5 (Denial-of-Service Protection)", "AC-7 (Unsuccessful Logon Attempts)"],
        sample_cves=["CVE-2023-44487"],
        static_verification_check="Verify rate-limiter middleware, pagination max-limit caps (limit <= 100), and GraphQL query depth/cost limits.",
        runtime_differential_check="Send controlled burst of 15 calibration requests in staging to verify X-RateLimit-Remaining headers and HTTP 429 threshold.",
        remediation_pattern="Enforce per-principal and per-IP token-bucket rate limits, cap page sizes, and bound GraphQL query depth.",
    ),
    "API5:2023": OwaspApiEntry(
        owasp_id="API5:2023",
        title="Broken Function Level Authorization (BFLA)",
        cwe_ids=["CWE-285", "CWE-269"],
        nist_800_53_controls=["AC-3 (Access Enforcement)", "AC-6 (Least Privilege)"],
        sample_cves=["CVE-2023-22518", "CVE-2023-46604"],
        static_verification_check="Cross-reference router RBAC decorators across all HTTP methods (GET, POST, PUT, DELETE, PATCH) on administrative routes.",
        runtime_differential_check="Replay administrative route requests using a low-privilege member token and verify HTTP 403 Forbidden across all verbs.",
        remediation_pattern="Apply default-deny RBAC middleware at the router level and require explicit @require_role('ADMIN') annotations.",
    ),
    "API6:2023": OwaspApiEntry(
        owasp_id="API6:2023",
        title="Unrestricted Access to Sensitive Business Flows",
        cwe_ids=["CWE-841", "CWE-799"],
        nist_800_53_controls=["AC-3 (Access Enforcement)", "SI-4 (System Monitoring)"],
        sample_cves=["CVE-2023-38545"],
        static_verification_check="Verify state-transition guards, idempotency keys, and velocity controls on checkout, transfer, and reservation flows.",
        runtime_differential_check="Verify duplicate idempotency-key replay is rejected with HTTP 409 Conflict.",
        remediation_pattern="Require idempotency keys, step-up authentication, and workflow state-machine invariants on high-value business operations.",
    ),
    "API7:2023": OwaspApiEntry(
        owasp_id="API7:2023",
        title="Server Side Request Forgery (SSRF via Webhook / URL Fetchers)",
        cwe_ids=["CWE-918"],
        nist_800_53_controls=["SC-7 (Boundary Protection)", "SI-10 (Information Input Validation)"],
        sample_cves=["CVE-2023-27524", "CVE-2024-21887"],
        static_verification_check="Trace user-supplied callback_url or webhook_url parameters reaching HTTP client sinks without scheme/host allowlisting.",
        runtime_differential_check="Test URL validator unit fixtures against RFC1918 / link-local metadata IP ranges (169.254.169.254) to confirm blocklist/allowlist enforcement.",
        remediation_pattern="Enforce HTTPS-only domain allowlists, resolve DNS prior to connection, and block private/link-local IP ranges at the egress proxy.",
    ),
    "API8:2023": OwaspApiEntry(
        owasp_id="API8:2023",
        title="Security Misconfiguration (CORS Reflection, GraphQL Introspection, Verbose Errors)",
        cwe_ids=["CWE-942", "CWE-200", "CWE-16"],
        nist_800_53_controls=["CM-6 (Configuration Settings)", "CM-7 (Least Functionality)", "SI-11 (Error Handling)"],
        sample_cves=["CVE-2023-29017"],
        static_verification_check="Audit CORS middleware for wildcard/reflected origins paired with allow_credentials=True, and check GraphQL production introspection flags.",
        runtime_differential_check="Send probes with untrusted Origin header and GraphQL __schema query; verify origin is not reflected and introspection is disabled.",
        remediation_pattern="Maintain explicit CORS origin allowlists, disable GraphQL introspection in production, and standardize RFC 7807 Problem Details error responses.",
    ),
    "API9:2023": OwaspApiEntry(
        owasp_id="API9:2023",
        title="Improper Inventory Management (Shadow & Deprecated API Versions)",
        cwe_ids=["CWE-1059", "CWE-1357"],
        nist_800_53_controls=["CM-8 (System Component Inventory)", "SA-22 (Unsupported System Components)"],
        sample_cves=["CVE-2023-35078"],
        static_verification_check="Diff registered framework routes (/api/v1/*, /api/swagger-ui, /debug/*) against the published OpenAPI 3.1 specification.",
        runtime_differential_check="Verify deprecated /api/v1/* and unauthenticated /api/swagger-ui routes return 404/410 Gone or require authentication.",
        remediation_pattern="Enforce API gateway route allowlisting from the signed OpenAPI 3.1 contract and sunset legacy API versions on a strict schedule.",
    ),
    "API10:2023": OwaspApiEntry(
        owasp_id="API10:2023",
        title="Unsafe Consumption of Third-Party APIs & Webhooks",
        cwe_ids=["CWE-20", "CWE-345", "CWE-502"],
        nist_800_53_controls=["SI-10 (Information Input Validation)", "SC-8 (Transmission Confidentiality and Integrity)"],
        sample_cves=["CVE-2023-49103"],
        static_verification_check="Verify upstream API responses and incoming webhooks undergo signature verification (HMAC/mTLS), schema validation, and timeouts.",
        runtime_differential_check="Validate webhook signature verifier rejects tampered payloads or timestamps outside the 5-minute replay window.",
        remediation_pattern="Validate all third-party API payloads against strict schemas, verify webhook HMAC signatures with constant-time comparison, and set circuit-breaker timeouts.",
    ),
}


def lookup_owasp_api_entry(owasp_id: str) -> Optional[OwaspApiEntry]:
    return OWASP_API_TOP_10_2023_CATALOG.get(owasp_id.upper())
