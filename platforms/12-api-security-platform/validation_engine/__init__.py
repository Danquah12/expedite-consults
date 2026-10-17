"""
Proof-Driven API Security Validation Engine Package (PTES / NIST SP 800-115 / OWASP API Top 10:2023).
"""

from .catalog import OWASP_API_TOP_10_2023_CATALOG, lookup_owasp_api_entry
from .claims_and_contracts import (
    ApiMutationRecord,
    ApiSecurityClaim,
    get_default_api_security_claims,
)
from .interfaces import (
    ModuleFindingSummary,
    SpecializedApiSecurityModule,
    StaticApiValidator,
    StaticRouteVerdict,
)
from .models import (
    ApiEndpointContext,
    CanonicalApiFinding,
    RoleDifferentialObservation,
    Severity,
    SixPointProofContract,
    SourceLocation,
    ValidationStatus,
)
from .pipeline import ApiValidationPipeline
from .verifier import IndependentApiEvidenceVerifier, ReleaseQualityGateResult

__all__ = [
    "OWASP_API_TOP_10_2023_CATALOG",
    "lookup_owasp_api_entry",
    "ApiMutationRecord",
    "ApiSecurityClaim",
    "get_default_api_security_claims",
    "ModuleFindingSummary",
    "SpecializedApiSecurityModule",
    "StaticApiValidator",
    "StaticRouteVerdict",
    "ApiEndpointContext",
    "CanonicalApiFinding",
    "RoleDifferentialObservation",
    "Severity",
    "SixPointProofContract",
    "SourceLocation",
    "ValidationStatus",
    "ApiValidationPipeline",
    "IndependentApiEvidenceVerifier",
    "ReleaseQualityGateResult",
]
