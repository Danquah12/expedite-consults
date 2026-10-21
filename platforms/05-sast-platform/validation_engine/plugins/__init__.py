"""
XTRIKE SAST Python Security Standards & MITRE ATT&CK TTP Plugin Repository.
"""

from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict
from .mitre_attack_ttp_plugin import MitreAttackTtpPlugin, MITRE_TTP_KNOWLEDGE_BASE
from .owasp_top10_sast_plugin import OwaspTop10SastPlugin, OWASP_SAST_MAP
from .cwe_ast_plugin import CweAstPlugin, CWE_AST_SPECS
from .cvss_calculator_plugin import CvssCalculatorPlugin, CWE_IMPACT_PROFILE
from .nist_standards_plugin import NistStandardsPlugin, NIST_STANDARDS_MAP
from .ptes_exploitdb_msf_plugin import (
    GitHubGhsaPlugin,
    PtesMethodologyPlugin,
    XTRIKE Exploit-IndexExploitDbPlugin,
    XTRIKE VerifyModuleCheckReferencePlugin,
    GITHUB_GHSA_MAP,
    PTES_7PHASE_MAP,
    SEARCHSPLOIT_EXPLOITDB_MAP,
    METASPLOIT_CHECK_MAP,
)
from .plugin_runner import MultiStandardFindingReport, StandardsPluginRunner

__all__ = [
    "CodeSnippetContext",
    "SecurityStandardPlugin",
    "StandardCheckVerdict",
    "MitreAttackTtpPlugin",
    "MITRE_TTP_KNOWLEDGE_BASE",
    "OwaspTop10SastPlugin",
    "OWASP_SAST_MAP",
    "CweAstPlugin",
    "CWE_AST_SPECS",
    "CvssCalculatorPlugin",
    "CWE_IMPACT_PROFILE",
    "NistStandardsPlugin",
    "NIST_STANDARDS_MAP",
    "GitHubGhsaPlugin",
    "PtesMethodologyPlugin",
    "XTRIKE Exploit-IndexExploitDbPlugin",
    "XTRIKE VerifyModuleCheckReferencePlugin",
    "GITHUB_GHSA_MAP",
    "PTES_7PHASE_MAP",
    "SEARCHSPLOIT_EXPLOITDB_MAP",
    "METASPLOIT_CHECK_MAP",
    "MultiStandardFindingReport",
    "StandardsPluginRunner",
]
