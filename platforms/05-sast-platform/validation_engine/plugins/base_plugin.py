"""
Base Interfaces for the XTRIKE SAST Python Security Standards & TTP Plugin Repository.

Strictly defensive: each plugin analyzes source code AST/pattern traces and canonical
findings against formal security standards (MITRE ATT&CK + D3FEND, OWASP Top 10 + ASVS,
MITRE CWE, FIRST CVSS v3.1/v4.0, and NIST SP 800-53 / SSDF / CSF 2.0).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass(frozen=True)
class CodeSnippetContext:
    repository: str
    commit_sha: str
    file_path: str
    language: str
    line_number: int
    code_line: str
    surrounding_snippet: str
    cwe_id: str
    reachable: bool = True
    internet_facing: bool = True
    auth_required: bool = False
    sanitizer_present: bool = False


@dataclass(frozen=True)
class StandardCheckVerdict:
    plugin_id: str
    plugin_name: str
    standard_family: str
    passed: bool
    primary_id: str
    title: str
    summary: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    remediation_control: str = ""


class SecurityStandardPlugin(ABC):
    @property
    @abstractmethod
    def plugin_id(self) -> str:
        ...

    @property
    @abstractmethod
    def plugin_name(self) -> str:
        ...

    @property
    @abstractmethod
    def standard_family(self) -> str:
        ...

    @abstractmethod
    def evaluate_finding(self, ctx: CodeSnippetContext) -> StandardCheckVerdict:
        """Evaluate a code finding context against this security standard."""
