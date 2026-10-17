"""Security Claim Verification Engine, Executable Security Contracts, and Test-Selection Optimizer."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ClaimVerdict(str, Enum):
    ESTABLISHED = "established"
    REFUTED_MITIGATED = "refuted_mitigated"
    UNESTABLISHED = "unestablished"


@dataclass
class SecurityClaim:
    claim_id: str
    claim_type: str
    finding_id: str
    required_proof: str
    observed_evidence: str
    verdict: ClaimVerdict
    unestablished_limitations: list[str] = field(default_factory=list)


@dataclass
class SecurityContract:
    """Structured Given / When / Expected / Evidence security requirement."""

    contract_id: str
    property_name: str
    given: str
    when: str
    expected: str
    evidence_required: list[str]
    generated_test_fn: str


@dataclass
class CandidateTestPlan:
    finding_id: str
    validator_name: str
    applicability_probability: float  # 0.0 - 1.0
    expected_info_gain: float         # 0.0 - 1.0
    security_impact: float            # 0.0 - 1.0
    estimated_cost_ms: int
    state_mutation_risk: float        # 0.0 - 1.0
    prerequisites_ready: bool
    already_resolved_statically: bool

    @property
    def priority_score(self) -> float:
        if not self.prerequisites_ready or self.already_resolved_statically:
            return 0.0
        reward = (
            self.applicability_probability * 0.35
            + self.expected_info_gain * 0.35
            + self.security_impact * 0.30
        )
        penalty = (self.estimated_cost_ms / 2000.0) * 0.15 + self.state_mutation_risk * 0.25
        return round(max(0.0, reward - penalty), 4)


class TestSelectionOptimizer:
    """Ranks candidate validation tests by information gain, applicability, and low state risk."""

    def rank_candidates(self, candidates: list[CandidateTestPlan]) -> list[CandidateTestPlan]:
        return sorted(candidates, key=lambda c: c.priority_score, reverse=True)


class SecurityClaimVerifier:
    """Evaluates explicit testable claims and records what could not be established."""

    def verify_claim(
        self,
        claim_id: str,
        claim_type: str,
        finding_id: str,
        required_proof: str,
        evidence_bundle: dict[str, Any],
    ) -> SecurityClaim:
        if evidence_bundle.get("mitigation_proven"):
            return SecurityClaim(
                claim_id=claim_id,
                claim_type=claim_type,
                finding_id=finding_id,
                required_proof=required_proof,
                observed_evidence=str(evidence_bundle.get("summary", "Effective control verified")),
                verdict=ClaimVerdict.REFUTED_MITIGATED,
                unestablished_limitations=evidence_bundle.get("limitations", []),
            )

        if evidence_bundle.get("proof_satisfied") and evidence_bundle.get("commit_matches_build"):
            return SecurityClaim(
                claim_id=claim_id,
                claim_type=claim_type,
                finding_id=finding_id,
                required_proof=required_proof,
                observed_evidence=str(evidence_bundle.get("summary", "Proof criteria met")),
                verdict=ClaimVerdict.ESTABLISHED,
                unestablished_limitations=evidence_bundle.get("limitations", []),
            )

        return SecurityClaim(
            claim_id=claim_id,
            claim_type=claim_type,
            finding_id=finding_id,
            required_proof=required_proof,
            observed_evidence=str(evidence_bundle.get("summary", "Insufficient proof")),
            verdict=ClaimVerdict.UNESTABLISHED,
            unestablished_limitations=evidence_bundle.get(
                "limitations", ["Required proof criteria not established on target build"]
            ),
        )
