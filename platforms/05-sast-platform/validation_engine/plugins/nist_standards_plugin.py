"""
Plugin 5: NIST Standards Suite Plugin (NIST SP 800-53 Rev. 5, NIST SP 800-218 SSDF v1.1,
NIST SP 800-115 Technical Guide to Information Security Testing, and NIST CSF 2.0).
"""

from __future__ import annotations

from typing import Dict, List
from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict


NIST_STANDARDS_MAP: Dict[str, Dict[str, Any]] = {
    "CWE-89": {
        "sp_800_53": ["SI-10 (Information Input Validation)", "SI-16 (Memory/Query Protection)"],
        "ssdf_800_218": "PW.8.1 / PW.7.2 (Review & Analyze Human-Readable Code for Injection)",
        "csf_2_0": "PR.DS-01 / DE.CM-09",
        "sp_800_115_phase": "Section 4.3 Source Code Analysis & Section 5.2 Target Validation",
    },
    "CWE-78": {
        "sp_800_53": ["SI-10 (Information Input Validation)", "CM-7 (Least Functionality)"],
        "ssdf_800_218": "PW.4.4 / PW.7.2 (Eliminate Unsafe OS Subprocess Invocations)",
        "csf_2_0": "PR.PS-01 / PR.AA-05",
        "sp_800_115_phase": "Section 4.3 Source Code Analysis & Controlled Command Execution Verification",
    },
    "CWE-94": {
        "sp_800_53": ["SI-10 (Information Input Validation)", "SC-18 (Mobile/Dynamic Code)"],
        "ssdf_800_218": "PW.7.2 (Static Analysis of Dynamic Code Evaluation Sinks)",
        "csf_2_0": "PR.PS-01",
        "sp_800_115_phase": "Section 4.3 AST Sink Verification",
    },
    "CWE-79": {
        "sp_800_53": ["SI-10 (Information Input Validation)", "SC-18 (Active Content Protection)"],
        "ssdf_800_218": "PW.8.2 (Context-Aware Output Encoding Verification)",
        "csf_2_0": "PR.DS-02",
        "sp_800_115_phase": "Section 5.3 Web Application DOM Context Verification",
    },
    "CWE-22": {
        "sp_800_53": ["AC-3 (Access Enforcement)", "SI-10 (Information Input Validation)"],
        "ssdf_800_218": "PW.4.1 (Canonical File Path Boundary Enforcement)",
        "csf_2_0": "PR.AA-05",
        "sp_800_115_phase": "Section 4.3 File-System Boundary Analysis",
    },
    "CWE-502": {
        "sp_800_53": ["SI-10 (Information Input Validation)", "SI-7 (Software & Information Integrity)"],
        "ssdf_800_218": "PW.4.4 (Safe Deserialization & Schema Integrity)",
        "csf_2_0": "PR.DS-06",
        "sp_800_115_phase": "Section 4.3 Deserialization Gadget Graph Audit",
    },
    "CWE-798": {
        "sp_800_53": ["IA-5 (Authenticator Management)", "SC-12 (Cryptographic Key Establishment)", "SC-28 (Protection of Info at Rest)"],
        "ssdf_800_218": "PW.1.3 / RV.1.2 (Zero Hardcoded Secrets in Source Control)",
        "csf_2_0": "PR.AA-01 / PR.DS-01",
        "sp_800_115_phase": "Section 4.2 Credential & Entropy Discovery",
    },
    "CWE-918": {
        "sp_800_53": ["SC-7 (Boundary Protection)", "AC-4 (Information Flow Enforcement)"],
        "ssdf_800_218": "PW.1.1 / PW.7.2 (Egress Trust-Boundary & Metadata Isolation)",
        "csf_2_0": "PR.IR-01 / DE.CM-01",
        "sp_800_115_phase": "Section 5.2 Outbound Trust-Boundary Verification",
    },
    "CWE-327": {
        "sp_800_53": ["SC-13 (Cryptographic Protection · FIPS 140-3)", "SC-8 (Transmission Confidentiality)"],
        "ssdf_800_218": "PW.4.1 (Approved Cryptographic Primitives Only)",
        "csf_2_0": "PR.DS-01 / PR.DS-02",
        "sp_800_115_phase": "Section 4.3 Cryptographic API Misuse Audit",
    },
    "CWE-862": {
        "sp_800_53": ["AC-3 (Access Enforcement)", "AC-6 (Least Privilege)"],
        "ssdf_800_218": "PW.1.2 / PW.8.1 (Verify Role & Multi-Tenant Authorization Predicates)",
        "csf_2_0": "PR.AA-05",
        "sp_800_115_phase": "Section 5.3 Role-Differential Authorization Verification",
    },
}


class NistStandardsPlugin(SecurityStandardPlugin):
    @property
    def plugin_id(self) -> str:
        return "PY-PLUGIN-NIST-SUITE"

    @property
    def plugin_name(self) -> str:
        return "NIST SP 800-53 Rev. 5, SP 800-218 (SSDF), SP 800-115 & CSF 2.0 Verifier"

    @property
    def standard_family(self) -> str:
        return "NIST SP 800-53r5 · SSDF 800-218 · 800-115 · CSF 2.0"

    def evaluate_finding(self, ctx: CodeSnippetContext) -> StandardCheckVerdict:
        entry = NIST_STANDARDS_MAP.get(ctx.cwe_id, NIST_STANDARDS_MAP["CWE-89"])
        passed = ctx.sanitizer_present
        controls_str = ", ".join(entry["sp_800_53"])
        return StandardCheckVerdict(
            plugin_id=self.plugin_id,
            plugin_name=self.plugin_name,
            standard_family=self.standard_family,
            passed=passed,
            primary_id=f"{entry['sp_800_53'][0].split(' ')[0]} · {entry['ssdf_800_218'].split(' ')[0]}",
            title=f"800-53: {controls_str}",
            summary=f"SSDF: {entry['ssdf_800_218']} | CSF 2.0: {entry['csf_2_0']} | 800-115: {entry['sp_800_115_phase']}",
            metadata=entry,
            remediation_control=f"Enforce {controls_str} and verify under {entry['sp_800_115_phase']}.",
        )
