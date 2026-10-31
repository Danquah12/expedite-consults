"""CWE Mapper — Maps CWE identifiers and vulnerability classes to canonical CWE metadata."""

from __future__ import annotations

CWE_CATALOG: dict[str, str] = {
    "CWE-20": "Improper Input Validation",
    "CWE-22": "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
    "CWE-78": "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
    "CWE-79": "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
    "CWE-89": "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')",
    "CWE-200": "Exposure of Sensitive Information to an Unauthorized Actor",
    "CWE-284": "Improper Access Control",
    "CWE-287": "Improper Authentication",
    "CWE-295": "Improper Certificate Validation",
    "CWE-319": "Cleartext Transmission of Sensitive Information",
    "CWE-326": "Inadequate Encryption Strength",
    "CWE-327": "Use of a Broken or Risky Cryptographic Algorithm",
    "CWE-352": "Cross-Site Request Forgery (CSRF)",
    "CWE-434": "Unrestricted Upload of File with Dangerous Type",
    "CWE-522": "Insufficiently Protected Credentials",
    "CWE-639": "Authorization Bypass Through User-Controlled Key (BOLA / IDOR)",
    "CWE-693": "Protection Mechanism Failure (Missing Security Headers)",
    "CWE-942": "Permissive Cross-domain Policy with Untrusted Domains (CORS)",
    "CWE-1021": "Improper Restriction of Rendered UI Layers or Frames (Clickjacking)",
    "CWE-1104": "Use of Unmaintained Third Party Components",
}


def resolve_cwe(cwe_id: str | None, fallback_title: str = "") -> tuple[str, str]:
    """Return canonical (cwe_id, cwe_name) given a CWE code or finding title."""
    if cwe_id and cwe_id.upper() in CWE_CATALOG:
        norm = cwe_id.upper()
        return norm, CWE_CATALOG[norm]

    lower = fallback_title.lower()
    if "sql" in lower:
        return "CWE-89", CWE_CATALOG["CWE-89"]
    if "xss" in lower or "cross-site scripting" in lower:
        return "CWE-79", CWE_CATALOG["CWE-79"]
    if "header" in lower or "csp" in lower or "hsts" in lower:
        return "CWE-693", CWE_CATALOG["CWE-693"]
    if "tls" in lower or "cipher" in lower or "ssl" in lower:
        return "CWE-327", CWE_CATALOG["CWE-327"]
    if "admin" in lower or "access" in lower or "authz" in lower:
        return "CWE-284", CWE_CATALOG["CWE-284"]
    if "outdated" in lower or "version" in lower or "cve" in lower:
        return "CWE-1104", CWE_CATALOG["CWE-1104"]

    code = (cwe_id or "CWE-200").upper()
    return code, CWE_CATALOG.get(code, "Security Control Weakness")
