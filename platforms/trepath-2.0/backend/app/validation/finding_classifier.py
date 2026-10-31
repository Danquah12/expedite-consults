"""Finding Classifier — Normalizes and deduplicates raw scanner outputs before EvidenceCore sealing."""

from __future__ import annotations

from typing import Any
from .. import models


SEVERITY_DEFAULT_CVSS: dict[str, float] = {
    "critical": 9.5,
    "high": 7.8,
    "medium": 5.5,
    "low": 3.2,
    "info": 1.0,
}


def classify_and_deduplicate_findings(raw_findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate raw findings by finding_key while normalizing severity and CVSS scores."""
    deduped: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for item in raw_findings:
        key = (item.get("finding_key") or "UNKNOWN-FINDING").strip()
        if key in seen_keys:
            continue
        seen_keys.add(key)

        copy_item = dict(item)
        sev = (copy_item.get("severity") or "low").lower()
        if sev not in SEVERITY_DEFAULT_CVSS:
            sev = "low"
        copy_item["severity"] = sev

        if copy_item.get("cvss_score") is None:
            copy_item["cvss_score"] = SEVERITY_DEFAULT_CVSS[sev]

        if not isinstance(copy_item.get("proof_state"), models.ProofState):
            raw_ps = str(copy_item.get("proof_state") or "OBSERVATION_CONFIRMED").upper()
            try:
                copy_item["proof_state"] = models.ProofState(raw_ps)
            except ValueError:
                copy_item["proof_state"] = models.ProofState.OBSERVATION_CONFIRMED

        deduped.append(copy_item)

    return deduped
