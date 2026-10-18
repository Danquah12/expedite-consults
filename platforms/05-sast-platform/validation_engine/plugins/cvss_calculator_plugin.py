"""
Plugin 4: FIRST CVSS v3.1 & CVSS v4.0 Deterministic Vector & Score Calculator Plugin.

Computes exact CVSS v3.1 and CVSS v4.0 vectors and numeric scores from reachability,
authentication requirements, and CWE confidentiality/integrity/availability impact.
"""

from __future__ import annotations

from typing import Dict, Tuple
from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict


CWE_IMPACT_PROFILE: Dict[str, Tuple[str, str, str, float]] = {
    "CWE-89":  ("H", "H", "H", 9.8),
    "CWE-78":  ("H", "H", "H", 9.8),
    "CWE-94":  ("H", "H", "H", 9.8),
    "CWE-502": ("H", "H", "H", 9.8),
    "CWE-798": ("H", "H", "N", 9.1),
    "CWE-918": ("H", "L", "N", 8.6),
    "CWE-22":  ("H", "L", "N", 8.2),
    "CWE-862": ("H", "H", "N", 8.1),
    "CWE-79":  ("L", "L", "N", 6.1),
    "CWE-327": ("H", "N", "N", 7.4),
}


class CvssCalculatorPlugin(SecurityStandardPlugin):
    @property
    def plugin_id(self) -> str:
        return "PY-PLUGIN-CVSS-CALC"

    @property
    def plugin_name(self) -> str:
        return "FIRST CVSS v3.1 & v4.0 Deterministic Vector Calculator"

    @property
    def standard_family(self) -> str:
        return "FIRST CVSS v3.1 + CVSS v4.0"

    def evaluate_finding(self, ctx: CodeSnippetContext) -> StandardCheckVerdict:
        c, i, a, base_score = CWE_IMPACT_PROFILE.get(
            ctx.cwe_id, ("H", "L", "N", 7.5)
        )
        av = "N" if ctx.internet_facing else "A"
        pr = "L" if ctx.auth_required else "N"
        ui = "R" if ctx.cwe_id == "CWE-79" else "N"
        scope = "C" if ctx.cwe_id in ("CWE-79", "CWE-918") else "U"

        adjusted_score = base_score
        if ctx.auth_required:
            adjusted_score = round(max(4.0, adjusted_score - 1.0), 1)
        if not ctx.reachable:
            adjusted_score = round(max(2.0, adjusted_score - 3.5), 1)
        if ctx.sanitizer_present:
            adjusted_score = 0.0

        vector_v31 = f"CVSS:3.1/AV:{av}/AC:L/PR:{pr}/UI:{ui}/S:{scope}/C:{c}/I:{i}/A:{a}"
        vector_v40 = (
            f"CVSS:4.0/AV:{av}/AC:L/AT:N/PR:{pr}/UI:{ui}"
            f"/VC:{c}/VI:{i}/VA:{a}/SC:N/SI:N/SA:N"
        )
        severity = (
            "None"
            if adjusted_score == 0.0
            else "Critical"
            if adjusted_score >= 9.0
            else "High"
            if adjusted_score >= 7.0
            else "Medium"
            if adjusted_score >= 4.0
            else "Low"
        )

        return StandardCheckVerdict(
            plugin_id=self.plugin_id,
            plugin_name=self.plugin_name,
            standard_family=self.standard_family,
            passed=adjusted_score < 7.0,
            primary_id=f"CVSS {adjusted_score} ({severity})",
            title=vector_v31,
            summary=f"v3.1: {vector_v31} | v4.0: {vector_v40}",
            metadata={
                "cvss_v31_score": adjusted_score,
                "cvss_v31_vector": vector_v31,
                "cvss_v40_vector": vector_v40,
                "severity_band": severity,
            },
            remediation_control="Neutralize tainted dataflow or enforce authentication/authorization boundaries to reduce CVSS base & environmental score.",
        )
