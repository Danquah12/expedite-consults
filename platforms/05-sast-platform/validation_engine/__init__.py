"""SAST-to-Validation Proof-Driven Engine Package."""

from .models import (
    CanonicalFinding,
    EvidenceRecord,
    GroundTruthCategory,
    ProofContract,
    ProofRequirementResult,
    ValidationContext,
    ValidationResult,
    ValidationStatus,
)
from .interfaces import EvidenceVerifierProtocol, LanguageAstAdapter, Validator
from .verifier import BenchmarkMetrics, IndependentEvidenceVerifier
from .pipeline import FindingValidationPipeline, PRIORITY_VALIDATORS
from .claims_and_contracts import (
    CandidateTestPlan,
    ClaimVerdict,
    SecurityClaim,
    SecurityClaimVerifier,
    SecurityContract,
    TestSelectionOptimizer,
)
from .catalog import (
    CWE_CATALOG,
    CweCatalogEntry,
    NVD_CVE_CATALOG,
    NvdAdvisoryEntry,
    OWASP_TOP_10_CATALOG,
    OwaspTop10Entry,
    lookup_finding_guidance,
)

__all__ = [
    "BenchmarkMetrics",
    "CWE_CATALOG",
    "CandidateTestPlan",
    "CanonicalFinding",
    "ClaimVerdict",
    "CweCatalogEntry",
    "EvidenceRecord",
    "EvidenceVerifierProtocol",
    "FindingValidationPipeline",
    "GroundTruthCategory",
    "IndependentEvidenceVerifier",
    "LanguageAstAdapter",
    "NVD_CVE_CATALOG",
    "NvdAdvisoryEntry",
    "OWASP_TOP_10_CATALOG",
    "OwaspTop10Entry",
    "PRIORITY_VALIDATORS",
    "ProofContract",
    "ProofRequirementResult",
    "SecurityClaim",
    "SecurityClaimVerifier",
    "SecurityContract",
    "TestSelectionOptimizer",
    "ValidationContext",
    "ValidationResult",
    "ValidationStatus",
    "Validator",
    "lookup_finding_guidance",
]
