"""Execution Adapters — Standardized interface connecting registered tests to underlying DAST & recon engines."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ... import models
from .targeted_dast import run_targeted_dast_adapters


@dataclass
class AdapterExecutionOutput:
    test_id: str
    adapter_name: str
    findings: list[dict[str, Any]] = field(default_factory=list)
    evidence_ids: list[int] = field(default_factory=list)
    proof_state: models.ProofState = models.ProofState.OBSERVATION_CONFIRMED
    limitations: list[str] = field(default_factory=list)


ADAPTER_FINDING_PREFIX_MAP: dict[str, tuple[str, ...]] = {
    "HTTP-POSTURE-001": ("HTTP-", "ENUM-HTTP-METHODS-"),
    "NET-RECON-001": ("PORT-", "ENUM-PROTO-"),
    "AUTH-SESSION-001": ("DAST-AUTH-SESSION-", "ENUM-AUTH-REALM-", "ZAP-10105", "ZAP-10010", "ZAP-10054"),
    "API-AUTHZ-001": ("DAST-API-AUTHZ-", "WEB-CORS-", "WEB-PATH-API"),
    "BOLA-IDOR-001": ("DAST-BOLA-IDOR-", "APP-ACTIVE-"),
    "INJ-INPUT-001": ("APP-ACTIVE-", "ZAP-40012", "ZAP-40018"),
    "FILE-UPLOAD-001": ("DAST-FILE-UPLOAD-", "WEB-PATH-UPLOAD"),
    "ADMIN-ACCESS-001": ("DAST-ADMIN-ACCESS-", "WEB-EXPOSED-ADMIN", "WEB-PATH-ADMIN", "NUCLEI-APACHE-TOMCAT"),
    "TLS-CERT-001": ("TLS-",),
    "VER-INTEL-001": ("DAST-VER-INTEL-", "NUCLEI-", "NMAP-SERVICE-", "NMAP-PORT-"),
    "INFRA-NVT-001": ("NMAP-", "OPENVAS-", "ENUM-PROTO-"),
}


def map_findings_to_test_execution(
    test_id: str,
    adapter_name: str,
    persisted_findings: list[models.Finding],
    finding_id_to_evidence_id: dict[int, int],
) -> AdapterExecutionOutput:
    """Link findings and cryptographic EvidenceArtifact IDs produced by an engine adapter to a TestExecution."""
    prefixes = ADAPTER_FINDING_PREFIX_MAP.get(test_id, ())
    matched_findings: list[models.Finding] = [
        f for f in persisted_findings if any(f.finding_key.startswith(p) for p in prefixes)
    ]
    ev_ids: list[int] = []
    for f in matched_findings:
        eid = finding_id_to_evidence_id.get(f.id)
        if eid and eid not in ev_ids:
            ev_ids.append(eid)

    # Determine highest verified proof state among matched findings, without assuming completion == exploitation
    proof = models.ProofState.OBSERVATION_CONFIRMED if matched_findings else models.ProofState.DISCOVERED
    for p_target in (
        models.ProofState.IMPACT_VERIFIED,
        models.ProofState.RUNTIME_REPRODUCED,
        models.ProofState.ATTACK_PATH_VALIDATED,
        models.ProofState.CONTROL_GAP_CONFIRMED,
    ):
        if any(f.proof_state == p_target for f in matched_findings):
            proof = p_target
            break

    limitations: list[str] = ["Executed under deterministic ROE read-only safety constraints."]
    if not matched_findings:
        limitations.append("Adapter completed probe cycle with 0 vulnerable observations on this surface.")

    return AdapterExecutionOutput(
        test_id=test_id,
        adapter_name=adapter_name,
        findings=[{"id": f.id, "finding_key": f.finding_key, "title": f.title} for f in matched_findings],
        evidence_ids=ev_ids,
        proof_state=proof,
        limitations=limitations,
    )


__all__ = [
    "AdapterExecutionOutput",
    "ADAPTER_FINDING_PREFIX_MAP",
    "map_findings_to_test_execution",
    "run_targeted_dast_adapters",
]
