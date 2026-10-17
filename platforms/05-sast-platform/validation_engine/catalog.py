"""Defensive Reference Catalog for OWASP Top 10, MITRE CWE, NIST NVD (CVE), and NIST SP 800-53.

Contains strictly defensive verification checklists, AST guard specifications,
safe remediation patterns, and compliance mappings called when a SAST finding
matches a rule or CWE ID.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class OwaspTop10Entry:
    code: str
    title: str
    cwe_ids: tuple[str, ...]
    nist_800_53_controls: tuple[str, ...]
    defensive_ast_checks: tuple[str, ...]
    remediation_standard: str


@dataclass(frozen=True)
class CweCatalogEntry:
    cwe_id: str
    name: str
    owasp_code: str
    abstraction: str  # "Base" | "Class" | "Variant"
    safe_code_pattern: str
    guard_functions: tuple[str, ...]
    verification_questions: tuple[str, ...]
    unit_test_assertion: str


@dataclass(frozen=True)
class NvdAdvisoryEntry:
    cve_id: str
    cwe_id: str
    package_ecosystem: str
    package_name: str
    affected_range: str
    patched_version: str
    cvss_score: float
    severity: str
    vulnerable_symbol: str
    reachability_check: str


OWASP_TOP_10_CATALOG: dict[str, OwaspTop10Entry] = {
    "A01:2021": OwaspTop10Entry(
        code="A01:2021",
        title="Broken Access Control",
        cwe_ids=("CWE-862", "CWE-863", "CWE-639", "CWE-22", "CWE-285"),
        nist_800_53_controls=("AC-3", "AC-6", "AC-16"),
        defensive_ast_checks=(
            "Verify route decorator or middleware enforces principal authentication.",
            "Verify database query predicates include tenant_id / owner_id bound from session context.",
            "Verify file path operations use canonical root confinement (os.OpenRoot / realpath prefix).",
        ),
        remediation_standard="Enforce server-side resource ownership and role checks on every controller and repository query.",
    ),
    "A02:2021": OwaspTop10Entry(
        code="A02:2021",
        title="Cryptographic Failures",
        cwe_ids=("CWE-327", "CWE-328", "CWE-798", "CWE-330"),
        nist_800_53_controls=("SC-12", "SC-13", "SC-28", "IA-5"),
        defensive_ast_checks=(
            "Confirm AEAD algorithms (AES-GCM, ChaCha20-Poly1305) and modern password hashing (Argon2id).",
            "Confirm secrets are loaded from environment or KMS rather than source literals.",
        ),
        remediation_standard="Use approved cryptographic primitives with unique nonces and managed key stores.",
    ),
    "A03:2021": OwaspTop10Entry(
        code="A03:2021",
        title="Injection",
        cwe_ids=("CWE-89", "CWE-79", "CWE-78", "CWE-94"),
        nist_800_53_controls=("SI-10", "SI-15"),
        defensive_ast_checks=(
            "Confirm SQL statements use parameterized placeholders ($1, ?) or ORM bound expressions.",
            "Confirm HTML/DOM sinks apply context-aware auto-escaping or approved HTML sanitization.",
            "Confirm subprocess calls pass argument arrays with shell=False.",
        ),
        remediation_standard="Separate untrusted data from code/commands using parameterized APIs and context-aware encoding.",
    ),
    "A04:2021": OwaspTop10Entry(
        code="A04:2021",
        title="Insecure Design",
        cwe_ids=("CWE-840", "CWE-799", "CWE-209"),
        nist_800_53_controls=("SA-8", "SA-11", "SC-5"),
        defensive_ast_checks=(
            "Verify workflow state machines enforce prerequisite approval transitions.",
            "Verify segregation-of-duties invariants (creator principal != approver principal).",
        ),
        remediation_standard="Encode business-logic invariants and state-transition preconditions explicitly in domain services.",
    ),
    "A05:2021": OwaspTop10Entry(
        code="A05:2021",
        title="Security Misconfiguration",
        cwe_ids=("CWE-16", "CWE-611", "CWE-942"),
        nist_800_53_controls=("CM-2", "CM-6", "CM-7"),
        defensive_ast_checks=(
            "Verify XML parsers disable external entities (disallow-doctype-decl).",
            "Verify CORS, CSP, and Cache-Control headers match production policy.",
        ),
        remediation_standard="Harden parser defaults, lock security headers, and detect configuration drift across environments.",
    ),
    "A06:2021": OwaspTop10Entry(
        code="A06:2021",
        title="Vulnerable and Outdated Components",
        cwe_ids=("CWE-1104", "CWE-1395"),
        nist_800_53_controls=("RA-5", "SI-2", "SR-3"),
        defensive_ast_checks=(
            "Cross-reference lockfile versions against NVD advisories.",
            "Inspect call graph to determine whether vulnerable library symbols are reachable.",
        ),
        remediation_standard="Upgrade affected dependencies and verify call-graph reachability for transitive packages.",
    ),
    "A07:2021": OwaspTop10Entry(
        code="A07:2021",
        title="Identification and Authentication Failures",
        cwe_ids=("CWE-287", "CWE-306", "CWE-384", "CWE-613"),
        nist_800_53_controls=("IA-2", "IA-8", "AC-12"),
        defensive_ast_checks=(
            "Verify JWT verification enforces explicit algorithm allowlists (blocks alg='none').",
            "Verify token revocation / session invalidation checks on logout and rotation.",
        ),
        remediation_standard="Enforce strict token verification, rotation, and revocation checks.",
    ),
    "A08:2021": OwaspTop10Entry(
        code="A08:2021",
        title="Software and Data Integrity Failures",
        cwe_ids=("CWE-502", "CWE-829", "CWE-345"),
        nist_800_53_controls=("SI-7", "SA-12"),
        defensive_ast_checks=(
            "Verify deserialization uses safe schema-validated parsers (JSON/Protobuf) instead of native object deserializers.",
            "Verify webhook and artifact signatures before processing.",
        ),
        remediation_standard="Avoid unsafe native deserialization and verify cryptographic signatures on external artifacts.",
    ),
    "A09:2021": OwaspTop10Entry(
        code="A09:2021",
        title="Security Logging and Monitoring Failures",
        cwe_ids=("CWE-778", "CWE-117", "CWE-532"),
        nist_800_53_controls=("AU-2", "AU-3", "AU-9", "AU-12"),
        defensive_ast_checks=(
            "Verify authorization denials and state changes emit structured audit events.",
            "Verify structured logs redact tokens, passwords, and PII fields.",
        ),
        remediation_standard="Emit structured, tamper-evident audit logs with automatic secret redaction.",
    ),
    "A10:2021": OwaspTop10Entry(
        code="A10:2021",
        title="Server-Side Request Forgery (SSRF)",
        cwe_ids=("CWE-918",),
        nist_800_53_controls=("SC-7", "AC-4", "SI-10"),
        defensive_ast_checks=(
            "Verify outbound URLs pass through hostname allowlists and DNS-pinned IP range checks.",
            "Verify HTTP clients disable automatic redirects or re-validate every redirect target.",
        ),
        remediation_standard="Block RFC-1918, loopback, and link-local IP ranges after DNS resolution and disable unvalidated redirects.",
    ),
}


CWE_CATALOG: dict[str, CweCatalogEntry] = {
    "CWE-862": CweCatalogEntry(
        cwe_id="CWE-862",
        name="Missing Authorization",
        owasp_code="A01:2021",
        abstraction="Class",
        safe_code_pattern="select(Resource).where(Resource.id == resource_id, Resource.tenant_id == current_user.tenant_id)",
        guard_functions=("require_tenant_scope", "AuthorizeResourceOwner", "check_object_permissions"),
        verification_questions=(
            "Does the route handler enforce authentication?",
            "Does the data-access query bind the authenticated principal's tenant_id or owner_id?",
        ),
        unit_test_assertion="assert client.get(other_tenant_url, headers=tenant_a_headers).status_code in (403, 404)",
    ),
    "CWE-89": CweCatalogEntry(
        cwe_id="CWE-89",
        name="SQL Injection",
        owasp_code="A03:2021",
        abstraction="Base",
        safe_code_pattern="jdbcTemplate.queryForList('SELECT * FROM orders WHERE tenant_id = ? AND code = ?', tenantId, code)",
        guard_functions=("PreparedStatement", "NamedParameterJdbcTemplate", "sqlalchemy.text.bindparams"),
        verification_questions=(
            "Is the SQL string constructed via concatenation or f-strings with user input?",
            "Are all dynamic values passed as bound parameters to the database driver?",
        ),
        unit_test_assertion="verify(jdbcTemplate).queryForList(eq(expectedParameterizedSql), eq(tenantId), eq(code))",
    ),
    "CWE-79": CweCatalogEntry(
        cwe_id="CWE-79",
        name="Cross-Site Scripting (XSS)",
        owasp_code="A03:2021",
        abstraction="Base",
        safe_code_pattern="<div>{userNote}</div> // or DOMPurify.sanitize(htmlNote, { ALLOWED_TAGS: ['b', 'i'] })",
        guard_functions=("DOMPurify.sanitize", "HtmlEncoder.Default.Encode", "markupsafe.escape"),
        verification_questions=(
            "Does untrusted data enter a raw HTML sink (dangerouslySetInnerHTML, @Html.Raw, v-html)?",
            "Is an approved context-aware encoder or HTML sanitizer applied immediately prior to rendering?",
        ),
        unit_test_assertion="assert '<script>' not in rendered_output",
    ),
    "CWE-22": CweCatalogEntry(
        cwe_id="CWE-22",
        name="Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)",
        owasp_code="A01:2021",
        abstraction="Base",
        safe_code_pattern="root, _ := os.OpenRoot(baseDir); f, err := root.Open(userFileName)",
        guard_functions=("os.OpenRoot", "Path.GetFullPath + StartsWith", "Path.resolve().is_relative_to"),
        verification_questions=(
            "Is user input passed to file system APIs without canonical path resolution?",
            "Does the code verify that the resolved canonical path starts with the intended base directory?",
        ),
        unit_test_assertion="assert resolve_safe_path(base_dir, '../outside.txt') raises ValueError",
    ),
    "CWE-918": CweCatalogEntry(
        cwe_id="CWE-918",
        name="Server-Side Request Forgery (SSRF)",
        owasp_code="A10:2021",
        abstraction="Base",
        safe_code_pattern="const safeUrl = await assertPublicHostnameAndResolve(inputUrl); await fetch(safeUrl, { redirect: 'error' });",
        guard_functions=("assertPublicHostnameAndResolve", "ipaddr.process", "SafeHttpClient"),
        verification_questions=(
            "Does the outbound HTTP client validate the resolved IP against RFC-1918, loopback, and link-local ranges?",
            "Are HTTP redirects disabled or re-validated against the same IP policy?",
        ),
        unit_test_assertion="await expect(assertPublicHostnameAndResolve('http://169.254.169.254')).rejects.toThrow()",
    ),
}


NVD_CVE_CATALOG: dict[str, NvdAdvisoryEntry] = {
    "CVE-2024-1597": NvdAdvisoryEntry(
        cve_id="CVE-2024-1597",
        cwe_id="CWE-89",
        package_ecosystem="Maven",
        package_name="org.postgresql:postgresql",
        affected_range="< 42.7.2",
        patched_version="42.7.2",
        cvss_score=9.8,
        severity="Critical",
        vulnerable_symbol="PGSimpleDataSource.setPreferQueryMode('simple')",
        reachability_check="Verify whether preferQueryMode=simple is configured; default extended mode is not vulnerable.",
    ),
    "CVE-2024-3456": NvdAdvisoryEntry(
        cve_id="CVE-2024-3456",
        cwe_id="CWE-287",
        package_ecosystem="npm",
        package_name="jsonwebtoken-fast-verify",
        affected_range="< 3.1.4",
        patched_version="3.1.4",
        cvss_score=8.7,
        severity="High",
        vulnerable_symbol="verifyToken(token, { algorithms })",
        reachability_check="Check whether verifyToken is invoked without an explicit non-empty algorithms array.",
    ),
    "CVE-2023-44487": NvdAdvisoryEntry(
        cve_id="CVE-2023-44487",
        cwe_id="CWE-400",
        package_ecosystem="Go",
        package_name="golang.org/x/net/http2",
        affected_range="< 0.17.0",
        patched_version="0.17.0",
        cvss_score=7.5,
        severity="High",
        vulnerable_symbol="http2.Server.ServeConn",
        reachability_check="Verify whether HTTP/2 listener is exposed directly or terminated by an updated ingress proxy.",
    ),
}


def lookup_finding_guidance(cwe_id: str) -> dict[str, object]:
    """Return defensive verification guidance from the CWE, OWASP Top 10, and NVD catalogs."""
    cwe_entry = CWE_CATALOG.get(cwe_id)
    owasp_entry = OWASP_TOP_10_CATALOG.get(cwe_entry.owasp_code) if cwe_entry else None
    related_cves = [cve for cve in NVD_CVE_CATALOG.values() if cve.cwe_id == cwe_id]
    return {
        "cwe": cwe_entry,
        "owasp": owasp_entry,
        "related_nvd_advisories": related_cves,
    }
