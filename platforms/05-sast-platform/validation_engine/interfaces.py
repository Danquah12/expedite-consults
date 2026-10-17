"""Common Validator & Pipeline Interfaces for the Finding Validation Engine.

Separates Preflight, Static Assessment, Test Planning, Controlled Execution,
and Independent Evidence Verification into explicit contracts.
"""

from __future__ import annotations

from typing import Any, Protocol
from .models import (
    CanonicalFinding,
    EvidenceRecord,
    ProofContract,
    ValidationContext,
    ValidationResult,
)


class LanguageAstAdapter(Protocol):
    """Language-specific structural and data-flow adapter."""

    language: str
    supported_frameworks: set[str]

    def inspect_data_flow(self, finding: CanonicalFinding) -> dict[str, Any]:
        """Inspect AST call sites, sanitizer guards, and route reachability."""
        ...


class Validator(Protocol):
    """Common contract implemented by all CWE-specific validators (Priority 1-5)."""

    name: str
    priority: int
    supported_cwes: set[str]

    def preflight(self, context: ValidationContext) -> tuple[bool, list[str]]:
        """1. Preflight: Verify scope, commit_sha == build_commit_sha, prerequisites, and policy."""
        ...

    def assess_static(self, finding: CanonicalFinding, context: ValidationContext) -> dict[str, Any]:
        """2. Assess: Inspect source, data flow, sanitizer guards, and reachable paths."""
        ...

    def plan_tests(self, finding: CanonicalFinding, static_summary: dict[str, Any]) -> list[str]:
        """3. Plan: Choose controlled verification checks with explicit stop conditions."""
        ...

    def execute_controlled(
        self,
        finding: CanonicalFinding,
        context: ValidationContext,
        planned_tests: list[str],
    ) -> tuple[list[EvidenceRecord], dict[str, Any]]:
        """4. Execute: Run controlled checks in an isolated test environment and collect evidence."""
        ...

    def assess(self, finding: CanonicalFinding, context: ValidationContext) -> ValidationResult:
        """Run full 5-step lifecycle and delegate final confirmation to IndependentEvidenceVerifier."""
        ...


class EvidenceVerifierProtocol(Protocol):
    """Independent Evidence Verifier contract."""

    def evaluate_proof_contract(
        self,
        finding: CanonicalFinding,
        context: ValidationContext,
        static_summary: dict[str, Any],
        runtime_observations: dict[str, Any],
        evidence: list[EvidenceRecord],
    ) -> ProofContract:
        ...
