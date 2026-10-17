"""Canonical Finding and Evidence Data Models for the SAST Validation Engine.

Separates validation status from evidence confidence and preserves the original
scanner/SARIF record alongside the normalized canonical finding.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ValidationStatus(str, Enum):
    CONFIRMED = "confirmed"
    INCONCLUSIVE = "inconclusive"
    NOT_REPRODUCED = "not_reproduced"
    BLOCKED = "blocked"
    NOT_APPLICABLE = "not_applicable"


class GroundTruthCategory(str, Enum):
    ACTUALLY_VULNERABLE = "actually_vulnerable"
    SAFELY_MITIGATED = "safely_mitigated"
    UNREACHABLE_OR_INACTIVE = "unreachable_or_inactive"
    INSUFFICIENT_CONTEXT = "insufficient_context"


@dataclass
class ProofRequirementResult:
    requirement: str
    question: str
    satisfied: bool
    evidence_summary: str
    source_type: str  # "ast" | "dataflow" | "runtime_trace" | "app_log" | "behavioral_check"


@dataclass
class ProofContract:
    finding_id: str
    commit_sha: str
    build_commit_sha: str
    requirements: list[ProofRequirementResult] = field(default_factory=list)

    @property
    def commit_matches_build(self) -> bool:
        return bool(self.commit_sha) and self.commit_sha == self.build_commit_sha

    @property
    def is_satisfied(self) -> bool:
        return self.commit_matches_build and all(r.satisfied for r in self.requirements)


@dataclass
class EvidenceRecord:
    evidence_id: str
    kind: str  # "sarif_trace" | "ast_guard" | "http_exchange" | "otel_span" | "audit_log"
    summary: str
    sha256_checksum: str
    commit_sha: str
    timestamp: str
    artifacts: dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationContext:
    finding_id: str
    cwe: str | None
    repository: str
    commit_sha: str
    build_commit_sha: str
    file_path: str
    start_line: int
    language: str
    framework: str
    endpoint: str | None = None
    method: str | None = None
    authorized_scope: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationResult:
    finding_id: str
    status: ValidationStatus
    evidence_confidence: float
    rationale: str
    evidence_ids: list[str] = field(default_factory=list)
    proof_contract: ProofContract | None = None
    prerequisites_met: bool = False
    reproducible: bool = False
    limitations: list[str] = field(default_factory=list)
    lifecycle_log: dict[str, str] = field(default_factory=dict)


@dataclass
class CanonicalFinding:
    # 1. Identity
    finding_id: str
    scanner: str
    rule_id: str
    cwe: str
    title: str

    # 2. Source
    repository: str
    commit_sha: str
    file_path: str
    start_line: int
    end_line: int
    function_name: str
    language: str
    framework: str

    # 3. Data flow
    source_expr: str
    intermediate_calls: list[str]
    sink_expr: str
    sanitizers_detected: list[str]
    trace_provenance: str

    # 4. Runtime
    build_id: str
    build_commit_sha: str
    endpoint: str | None
    http_method: str | None
    auth_context: str

    # 5. Preconditions
    required_config: list[str]
    permissions: list[str]
    dependencies: list[str]
    feature_flags: list[str]

    # 6. Validation
    planned_tests: list[str] = field(default_factory=list)
    executed_tests: list[str] = field(default_factory=list)
    validation_environment: str = "disposable-container-isolated"

    # 7. Evidence
    evidence: list[EvidenceRecord] = field(default_factory=list)

    # 8. Assessment (status separated from evidence_confidence)
    status: ValidationStatus = ValidationStatus.INCONCLUSIVE
    evidence_confidence: float = 0.0
    impact: str = ""
    rationale: str = ""
    unresolved_assumptions: list[str] = field(default_factory=list)

    # 9. Remediation
    root_cause: str = ""
    suggested_fix: str = ""
    regression_test: str = ""

    # Original scanner record preserved verbatim
    raw_scanner_record: dict[str, Any] = field(default_factory=dict)
