"""EvidenceCore — Cryptographic Evidence Preservation, Provenance, and Independent SHA-256 Verification."""

from __future__ import annotations

import hashlib
from pathlib import Path
from sqlalchemy.orm import Session

from .. import models
from ..engines.evidence import store_evidence
from ..validation.proof_validator import validate_finding_proof


def determine_artifact_type(finding_key: str) -> str:
    if finding_key.startswith("OPENVAS-"):
        return "OPENVAS_GVM_EVIDENCE"
    if finding_key.startswith("ZAP-"):
        return "OWASP_ZAP_DAST_RECORD"
    if finding_key.startswith("NMAP-"):
        return "NMAP_XML_EVIDENCE"
    if finding_key.startswith("TLS-"):
        return "TLS_COMPLIANCE_RECORD"
    if finding_key.startswith("NUCLEI-"):
        return "NUCLEI_CVE_EVIDENCE"
    if finding_key.startswith("PORT-"):
        return "PORT_DISCOVERY"
    if finding_key.startswith("APP-ACTIVE"):
        return "ACTIVE_FUZZ_PROBE"
    if finding_key.startswith("DAST-"):
        return "ORCHESTRATOR_TARGETED_DAST_RECORD"
    if finding_key.startswith("ENUM-"):
        return "WEBPULSE_NETRECON_ENUMERATION"
    if finding_key.startswith("WEB-"):
        return "WEB_RECON"
    return "HTTP_HEADER_OBSERVATION"


def verify_evidence_integrity(artifact: models.EvidenceArtifact) -> dict[str, object]:
    """Independently recompute the FIPS 180-4 SHA-256 hash of a stored evidence file and compare with DB record."""
    file_path = Path(artifact.storage_path)
    if not file_path.exists():
        return {
            "artifact_id": artifact.id,
            "verified": False,
            "expected_sha256": artifact.sha256,
            "computed_sha256": None,
            "reason": "Evidence binary missing on disk.",
        }

    raw_bytes = file_path.read_bytes()
    computed = hashlib.sha256(raw_bytes).hexdigest()
    matches = (computed == artifact.sha256)
    return {
        "artifact_id": artifact.id,
        "verified": matches,
        "expected_sha256": artifact.sha256,
        "computed_sha256": computed,
        "bytes": len(raw_bytes),
        "reason": "Cryptographic SHA-256 digest matches stored binary." if matches else "Digest mismatch detected!",
    }


def seal_finding_with_evidence(
    db: Session,
    evidence_dir: str,
    scan_id: int,
    raw_item: dict[str, object],
) -> tuple[models.Finding, models.EvidenceArtifact]:
    """Validate proof state via PentestValidator, store immutable evidence binary, and persist Finding + EvidenceArtifact."""
    item = dict(raw_item)
    raw_ev_str = str(item.pop("evidence", "{}"))
    evidence_bytes = raw_ev_str.encode("utf-8", errors="replace")
    finding_key = str(item.get("finding_key", "FINDING-001"))
    artifact_type = determine_artifact_type(finding_key)

    path, digest, meta = store_evidence(evidence_dir, scan_id, artifact_type, evidence_bytes)

    # Enforce Rule #10: Findings cannot be marked exploitable without required proof
    requested_ps = item.get("proof_state", models.ProofState.OBSERVATION_CONFIRMED)
    if not isinstance(requested_ps, models.ProofState):
        try:
            requested_ps = models.ProofState(str(requested_ps))
        except ValueError:
            requested_ps = models.ProofState.OBSERVATION_CONFIRMED

    validation = validate_finding_proof(requested_ps, evidence_bytes, digest)
    item["proof_state"] = validation.approved_proof_state
    meta["proof_validation"] = {
        "requested": requested_ps.value,
        "approved": validation.approved_proof_state.value,
        "was_downgraded": validation.was_downgraded,
        "reason": validation.reason,
    }

    finding = models.Finding(scan_id=scan_id, **item)
    db.add(finding)
    db.flush()

    artifact = models.EvidenceArtifact(
        scan_id=scan_id,
        finding_id=finding.id,
        artifact_type=artifact_type,
        sha256=digest,
        storage_path=path,
        metadata_json=meta,
        collector_version="trepath-evidencecore/2.0.0",
    )
    db.add(artifact)
    db.flush()
    return finding, artifact


__all__ = ["determine_artifact_type", "verify_evidence_integrity", "seal_finding_with_evidence"]
