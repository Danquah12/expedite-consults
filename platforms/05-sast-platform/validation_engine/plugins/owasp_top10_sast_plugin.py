"""
Plugin 2: OWASP Top 10 SAST (2021 / 2025) & OWASP ASVS v4.0.3 (Level 2 / Level 3) Plugin.
"""

from __future__ import annotations

from typing import Dict
from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict


OWASP_SAST_MAP: Dict[str, Dict[str, str]] = {
    "CWE-89": {
        "owasp_id": "A03:2021",
        "owasp_name": "Injection (SQL / HQL / NoSQL)",
        "asvs_id": "ASVS V5.3.4 (Level 1/2/3)",
        "asvs_requirement": "Verify that data selection or database queries use parameterized queries, ORMs, or prepared statements and are strictly free of string concatenation.",
    },
    "CWE-78": {
        "owasp_id": "A03:2021",
        "owasp_name": "Injection (OS Command Execution)",
        "asvs_id": "ASVS V5.3.8 (Level 1/2/3)",
        "asvs_requirement": "Verify that OS command execution uses parameterized APIs (`shell=False`) and avoids command shells.",
    },
    "CWE-94": {
        "owasp_id": "A03:2021",
        "owasp_name": "Injection (Dynamic Code Evaluation)",
        "asvs_id": "ASVS V5.2.4 (Level 2/3)",
        "asvs_requirement": "Verify that `eval()`, `exec()`, and dynamic code compilation of untrusted input are prohibited.",
    },
    "CWE-79": {
        "owasp_id": "A03:2021",
        "owasp_name": "Injection (Cross-Site Scripting / DOM XSS)",
        "asvs_id": "ASVS V5.3.3 (Level 1/2/3)",
        "asvs_requirement": "Verify that context-aware output encoding or strict HTML sanitization preserves structural integrity.",
    },
    "CWE-22": {
        "owasp_id": "A01:2021",
        "owasp_name": "Broken Access Control (Path Traversal)",
        "asvs_id": "ASVS V12.3.1 (Level 1/2/3)",
        "asvs_requirement": "Verify that user-submitted filename metadata is validated and canonicalized within a trusted base path.",
    },
    "CWE-502": {
        "owasp_id": "A08:2021",
        "owasp_name": "Software and Data Integrity Failures (Insecure Deserialization)",
        "asvs_id": "ASVS V5.5.3 (Level 1/2/3)",
        "asvs_requirement": "Verify that deserialization of untrusted data uses safe parsers or strict class allowlisting.",
    },
    "CWE-798": {
        "owasp_id": "A07:2021",
        "owasp_name": "Identification and Authentication Failures (Hardcoded Secrets)",
        "asvs_id": "ASVS V2.10.4 (Level 2/3)",
        "asvs_requirement": "Verify that passwords, API keys, and cryptographic private keys never appear in source code.",
    },
    "CWE-918": {
        "owasp_id": "A10:2021",
        "owasp_name": "Server-Side Request Forgery (SSRF)",
        "asvs_id": "ASVS V12.6.1 (Level 1/2/3)",
        "asvs_requirement": "Verify that web or application servers only make outbound requests to allowlisted domains/protocols and block internal IP ranges.",
    },
    "CWE-327": {
        "owasp_id": "A02:2021",
        "owasp_name": "Cryptographic Failures (Weak Algorithm / Hash)",
        "asvs_id": "ASVS V6.2.2 (Level 2/3)",
        "asvs_requirement": "Verify that industry-proven authenticated encryption and collision-resistant hashes (SHA-256+) are used.",
    },
    "CWE-862": {
        "owasp_id": "A01:2021",
        "owasp_name": "Broken Access Control (Missing Authorization)",
        "asvs_id": "ASVS V4.1.3 (Level 1/2/3)",
        "asvs_requirement": "Verify that the Principle of Least Privilege and object-level ownership checks are enforced on every route.",
    },
}


class OwaspTop10SastPlugin(SecurityStandardPlugin):
    @property
    def plugin_id(self) -> str:
        return "PY-PLUGIN-OWASP-SAST"

    @property
    def plugin_name(self) -> str:
        return "OWASP Top 10 SAST & ASVS v4.0.3 Verifier"

    @property
    def standard_family(self) -> str:
        return "OWASP Top 10 (2021/2025) + OWASP ASVS v4.0.3"

    def evaluate_finding(self, ctx: CodeSnippetContext) -> StandardCheckVerdict:
        info = OWASP_SAST_MAP.get(ctx.cwe_id, OWASP_SAST_MAP["CWE-89"])
        passed = ctx.sanitizer_present
        return StandardCheckVerdict(
            plugin_id=self.plugin_id,
            plugin_name=self.plugin_name,
            standard_family=self.standard_family,
            passed=passed,
            primary_id=f"{info['owasp_id']} · {info['asvs_id']}",
            title=info["owasp_name"],
            summary=info["asvs_requirement"],
            metadata=info,
            remediation_control=f"Satisfy {info['asvs_id']}: {info['asvs_requirement']}",
        )
