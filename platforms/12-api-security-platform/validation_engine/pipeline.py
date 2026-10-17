"""
Stages A–F Proof-Driven API Security Validation Pipeline Orchestrator.

Stage A: OpenAPI 3.1 / GraphQL Schema & Gateway Telemetry Ingestion
Stage B: Route Controller AST, Middleware Chain & Tenancy Context Normalization
Stage C: Validation Planner (selects Role-Differential, JWT Guard, or Schema Conformance checks)
Stage D1: Static Controller & ORM Authorization Predicate Validator
Stage D2: Controlled Multi-Principal Runtime Differential Validator (Safe Lab Replay)
Stage E: Independent Evidence Verifier (6-Point Proof Contract Check)
Stage F: Remediation Patch & Executable OpenAPI/Pytest Contract Generator
"""

from __future__ import annotations

from typing import Dict, List
from .interfaces import StaticRouteVerdict
from .models import (
    CanonicalApiFinding,
    RoleDifferentialObservation,
    SixPointProofContract,
)
from .verifier import IndependentApiEvidenceVerifier


class ApiValidationPipeline:
    def __init__(self, current_commit_sha: str = "9f4c2a1e") -> None:
        self.current_commit_sha = current_commit_sha
        self.verifier = IndependentApiEvidenceVerifier()

    def run_finding_pipeline(
        self,
        finding: CanonicalApiFinding,
        static_verdict: StaticRouteVerdict,
        observation: RoleDifferentialObservation,
        contract: SixPointProofContract,
    ) -> CanonicalApiFinding:
        return self.verifier.verify(
            finding=finding,
            static_verdict=static_verdict,
            observation=observation,
            contract=contract,
            current_commit_sha=self.current_commit_sha,
        )

    @staticmethod
    def describe_stages() -> List[Dict[str, str]]:
        return [
            {
                "stage": "Stage A",
                "name": "OpenAPI 3.1 / GraphQL & Gateway Ingestion",
                "summary": "Ingests OpenAPI 3.1 specs, Postman collections, SARIF, and API gateway telemetry.",
            },
            {
                "stage": "Stage B",
                "name": "Route AST & Auth Context Normalization",
                "summary": "Maps HTTP routes to controller ASTs, middleware chains, JWT claims, and ORM tenancy filters.",
            },
            {
                "stage": "Stage C",
                "name": "Risk-Ranked Validation Planner",
                "summary": "Plans safe role-differential replays, JWT algorithm checks, or DTO schema boundary checks.",
            },
            {
                "stage": "Stage D1 + D2",
                "name": "Hybrid Static Policy + Controlled Role-Differential Replay",
                "summary": "Combines static AST predicate checks with deterministic Tenant A vs. Tenant B lab replay.",
            },
            {
                "stage": "Stage E",
                "name": "Independent 6-Point Proof Verifier",
                "summary": "Verifies reproducibility (>= 98%), commit SHA binding, and expected vs. observed responses.",
            },
            {
                "stage": "Stage F",
                "name": "Remediation & Executable Contract Synthesis",
                "summary": "Generates middleware fixes, DTO allowlists, and Pytest/Schemathesis regression contracts.",
            },
        ]
