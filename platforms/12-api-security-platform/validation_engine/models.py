"""
Canonical Finding, Proof-Contract & API Evidence Models (PTES / NIST SP 800-115 / OWASP API Top 10:2023).

Strictly defensive: models OpenAPI / API Gateway ingestion, controller AST taint & authorization
predicates, multi-principal HTTP replay comparisons, and commit-bound 6-point Proof Contracts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class ValidationStatus(str, Enum):
    UNVALIDATED = "UNVALIDATED"
    CONFIRMED = "CONFIRMED"
    LIKELY = "LIKELY"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    NEEDS_ENVIRONMENT = "NEEDS_ENVIRONMENT"
    INCONCLUSIVE = "INCONCLUSIVE"
    FIXED_VERIFIED = "FIXED_VERIFIED"


class Severity(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


@dataclass(frozen=True)
class SourceLocation:
    repository: str
    commit_sha: str
    file_path: str
    start_line: int
    end_line: int
    controller_function: str


@dataclass(frozen=True)
class ApiEndpointContext:
    api_type: str  # REST, GraphQL, gRPC, WebSocket
    http_method: str
    route_template: str
    openapi_operation_id: str
    required_auth_scheme: str
    declared_roles: List[str]
    rate_limit_policy: Optional[str] = None


@dataclass(frozen=True)
class RoleDifferentialObservation:
    principal_a: str
    principal_b: str
    baseline_status: int
    probe_status: int
    exposed_fields: List[str]
    authorization_predicate_bypassed: bool
    deterministic_replay_matches: int
    total_replays: int


@dataclass(frozen=True)
class SixPointProofContract:
    """
    A finding can only be promoted to CONFIRMED when all 6 points are satisfied
    for the exact commit_sha and OpenAPI spec hash.
    """
    commit_sha: str
    openapi_sha256: str
    point_1_entry_to_controller_path: str
    point_2_auth_preconditions: List[str]
    point_3_controlled_role_trace: str
    point_4_expected_safe_vs_observed: Dict[str, str]
    point_5_reproducibility_rate: float
    point_6_remediation_and_contract_test: str

    def is_complete(self) -> bool:
        return (
            bool(self.commit_sha)
            and bool(self.point_1_entry_to_controller_path)
            and len(self.point_2_auth_preconditions) > 0
            and bool(self.point_3_controlled_role_trace)
            and "expected_safe" in self.point_4_expected_safe_vs_observed
            and "observed_behavior" in self.point_4_expected_safe_vs_observed
            and self.point_5_reproducibility_rate >= 0.98
            and bool(self.point_6_remediation_and_contract_test)
        )


@dataclass
class CanonicalApiFinding:
    finding_id: str
    scanner_rule_id: str
    owasp_api_id: str  # e.g., API1:2023
    cwe_id: str        # e.g., CWE-639
    title: str
    severity: Severity
    source: SourceLocation
    endpoint: ApiEndpointContext
    raw_scanner_record: Dict[str, Any]
    status: ValidationStatus = ValidationStatus.UNVALIDATED
    confidence: float = 0.0
    role_observation: Optional[RoleDifferentialObservation] = None
    proof_contract: Optional[SixPointProofContract] = None
    validated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
