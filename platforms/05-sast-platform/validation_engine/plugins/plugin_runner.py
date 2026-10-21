"""
Unified Python Plugin Registry & Live Source Code Multi-Standard Scanner.

Executes all 5 Python security standard plugins (MITRE ATT&CK v15 + D3FEND, OWASP Top 10 + ASVS,
MITRE CWE AST, FIRST CVSS v3.1/v4.0, and NIST SP 800-53 / SSDF / 800-115 / CSF 2.0) against
any scanned code snippet or canonical finding.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Pattern, Tuple
from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict
from .mitre_attack_ttp_plugin import MitreAttackTtpPlugin
from .owasp_top10_sast_plugin import OwaspTop10SastPlugin
from .cwe_ast_plugin import CweAstPlugin
from .cvss_calculator_plugin import CvssCalculatorPlugin
from .nist_standards_plugin import NistStandardsPlugin
from .ptes_exploitdb_msf_plugin import (
    GitHubGhsaPlugin,
    PtesMethodologyPlugin,
    XTRIKE Exploit-IndexExploitDbPlugin,
    XTRIKE VerifyModuleCheckReferencePlugin,
)


@dataclass(frozen=True)
class MultiStandardFindingReport:
    finding_id: str
    title: str
    file_path: str
    line_number: int
    code_line: str
    cwe_id: str
    verdicts: Dict[str, StandardCheckVerdict]


LIVE_CODE_PATTERNS: List[Tuple[str, str, Pattern[str]]] = [
    (
        "CWE-89",
        "SQL Injection via Unparameterized Query Construction",
        re.compile(r"(SELECT\s+.*\s+FROM\s+.*(\+|\$\{|f[\"']|%s|\.format\())|(executeQuery\s*\(\s*[\"']SELECT)", re.IGNORECASE),
    ),
    (
        "CWE-78",
        "OS Command Injection via Shell Execution Sink",
        re.compile(r"(os\.system\s*\(|subprocess\.(Popen|call|run)\s*\(.*shell\s*=\s*True|child_process\.exec\s*\(|Runtime\.getRuntime\(\)\.exec\s*\()", re.IGNORECASE),
    ),
    (
        "CWE-94",
        "Dynamic Code Injection via eval() / exec()",
        re.compile(r"\b(eval|exec)\s*\(\s*[^\"')\s]", re.IGNORECASE),
    ),
    (
        "CWE-79",
        "Cross-Site Scripting (DOM / Unencoded HTML Sink)",
        re.compile(r"(dangerouslySetInnerHTML|\.innerHTML\s*=|v-html\s*=|document\.write\s*\()", re.IGNORECASE),
    ),
    (
        "CWE-22",
        "Relative Path Traversal in File System Sink",
        re.compile(r"(open\s*\(\s*.*\+|readFileSync\s*\(\s*path\.join|send_file\s*\(\s*request\.)", re.IGNORECASE),
    ),
    (
        "CWE-502",
        "Insecure Deserialization of Untrusted Stream",
        re.compile(r"(pickle\.loads?\s*\(|yaml\.load\s*\([^,)]*\)|ObjectInputStream\s*\(|unserialize\s*\()", re.IGNORECASE),
    ),
    (
        "CWE-798",
        "Hardcoded Secret / API Token / Private Credential in Source",
        re.compile(r"(api[_-]?key|secret[_-]?key|password|jwt[_-]?secret|private[_-]?key|aws_secret)\s*[:=]\s*[\"'][A-Za-z0-9_\-./+=]{8,}[\"']", re.IGNORECASE),
    ),
    (
        "CWE-918",
        "Server-Side Request Forgery (Unvalidated Outbound URL Fetch)",
        re.compile(r"(requests\.(get|post)\s*\(\s*(req|user|url|target)|fetch\s*\(\s*(req\.|params\.|query\.|userUrl)|http\.Get\s*\(\s*req)", re.IGNORECASE),
    ),
    (
        "CWE-327",
        "Weak or Broken Cryptographic Primitive (MD5 / SHA1 / DES / ECB)",
        re.compile(r"(hashlib\.(md5|sha1)\s*\(|MessageDigest\.getInstance\s*\(\s*[\"'](MD5|SHA-1)[\"']|Cipher\.getInstance\s*\(\s*[\"'](DES|AES/ECB))", re.IGNORECASE),
    ),
]


class StandardsPluginRunner:
    def __init__(self) -> None:
        self.plugins: List[SecurityStandardPlugin] = [
            MitreAttackTtpPlugin(),
            OwaspTop10SastPlugin(),
            CweAstPlugin(),
            CvssCalculatorPlugin(),
            NistStandardsPlugin(),
            GitHubGhsaPlugin(),
            PtesMethodologyPlugin(),
            XTRIKE Exploit-IndexExploitDbPlugin(),
            XTRIKE VerifyModuleCheckReferencePlugin(),
        ]

    def evaluate_context(self, ctx: CodeSnippetContext, finding_id: str, title: str) -> MultiStandardFindingReport:
        verdicts: Dict[str, StandardCheckVerdict] = {}
        for plugin in self.plugins:
            verdicts[plugin.plugin_id] = plugin.evaluate_finding(ctx)
        return MultiStandardFindingReport(
            finding_id=finding_id,
            title=title,
            file_path=ctx.file_path,
            line_number=ctx.line_number,
            code_line=ctx.code_line,
            cwe_id=ctx.cwe_id,
            verdicts=verdicts,
        )

    def scan_source_code(
        self,
        source_code: str,
        file_path: str = "scanned_module.py",
        language: str = "Python",
        repository: str = "live-code-submission",
        commit_sha: str = "live-ast-scan",
    ) -> List[MultiStandardFindingReport]:
        reports: List[MultiStandardFindingReport] = []
        lines = source_code.splitlines()
        idx_counter = 1
        for line_idx, raw_line in enumerate(lines, start=1):
            stripped = raw_line.strip()
            if not stripped or stripped.startswith(("#", "//", "/*", "*")):
                continue
            for cwe_id, title, pattern in LIVE_CODE_PATTERNS:
                if pattern.search(raw_line):
                    ctx = CodeSnippetContext(
                        repository=repository,
                        commit_sha=commit_sha,
                        file_path=file_path,
                        language=language,
                        line_number=line_idx,
                        code_line=stripped,
                        surrounding_snippet="\n".join(
                            lines[max(0, line_idx - 2) : min(len(lines), line_idx + 2)]
                        ),
                        cwe_id=cwe_id,
                    )
                    reports.append(
                        self.evaluate_context(
                            ctx=ctx,
                            finding_id=f"LIVE-{idx_counter:03d}",
                            title=title,
                        )
                    )
                    idx_counter += 1
        return reports
