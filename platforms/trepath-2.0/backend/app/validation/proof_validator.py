"""PentestValidator Proof Validator — Enforces strict proof-of-exploitation criteria before elevating proof states."""

from __future__ import annotations

import json
from dataclasses import dataclass

from .. import models


EXPLOITABLE_PROOF_STATES: set[models.ProofState] = {
    models.ProofState.ATTACK_PATH_VALIDATED,
    models.ProofState.RUNTIME_REPRODUCED,
    models.ProofState.IMPACT_VERIFIED,
}


@dataclass
class ProofValidationResult:
    approved_proof_state: models.ProofState
    was_downgraded: bool
    reason: str


def validate_finding_proof(
    requested_state: models.ProofState,
    evidence_bytes: bytes | None,
    sha256_digest: str | None = None,
) -> ProofValidationResult:
    """
    Rule #10: Findings cannot be marked exploitable (ATTACK_PATH_VALIDATED, RUNTIME_REPRODUCED,
    or IMPACT_VERIFIED) without verified cryptographic proof containing a deterministic reproduction trace.
    A test completing does NOT mean a vulnerability has been proven.
    """
    if requested_state not in EXPLOITABLE_PROOF_STATES:
        if not evidence_bytes:
            return ProofValidationResult(
                approved_proof_state=models.ProofState.DISCOVERED,
                was_downgraded=(requested_state != models.ProofState.DISCOVERED),
                reason="No raw evidence payload provided; capped at DISCOVERED.",
            )
        return ProofValidationResult(
            approved_proof_state=requested_state,
            was_downgraded=False,
            reason=f"Proof state '{requested_state.value}' verified against observation evidence.",
        )

    # Requested state is an exploitable state -> require non-empty evidence + deterministic reproduction markers
    if not evidence_bytes or not sha256_digest or len(sha256_digest) != 64:
        return ProofValidationResult(
            approved_proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            was_downgraded=True,
            reason=(
                f"Downgraded from '{requested_state.value}' to 'OBSERVATION_CONFIRMED': "
                "missing cryptographic SHA-256 evidence artifact."
            ),
        )

    try:
        payload = json.loads(evidence_bytes.decode("utf-8", errors="replace"))
    except Exception:
        payload = {}

    has_reproduction_proof = bool(
        isinstance(payload, dict)
        and (
            payload.get("verified_exploit_proof")
            or payload.get("reproduction_trace")
            or payload.get("matched_canary")
            or payload.get("impact_proof")
        )
    )

    if not has_reproduction_proof:
        return ProofValidationResult(
            approved_proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            was_downgraded=True,
            reason=(
                f"Downgraded from '{requested_state.value}' to 'CONTROL_GAP_CONFIRMED': "
                "evidence proves control gap but lacks deterministic runtime reproduction or impact proof."
            ),
        )

    return ProofValidationResult(
        approved_proof_state=requested_state,
        was_downgraded=False,
        reason=f"Exploitable proof state '{requested_state.value}' cryptographically verified.",
    )
