"""RiskEngine — Composite Risk Scoring combining CVSS, EPSS, CISA KEV, and Proof State."""

from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session
from .. import models


PROOF_STATE_WEIGHTS: dict[models.ProofState, float] = {
    models.ProofState.IMPACT_VERIFIED: 1.25,
    models.ProofState.RUNTIME_REPRODUCED: 1.20,
    models.ProofState.ATTACK_PATH_VALIDATED: 1.15,
    models.ProofState.CONTROL_GAP_CONFIRMED: 1.05,
    models.ProofState.OBSERVATION_CONFIRMED: 1.00,
    models.ProofState.DISCOVERED: 0.85,
    models.ProofState.REMEDIATION_VERIFIED: 0.10,
    models.ProofState.NOT_VULNERABLE: 0.0,
}

SEVERITY_DEFAULT_WEIGHTS: dict[str, float] = {
    "critical": 9.5,
    "high": 7.8,
    "medium": 5.5,
    "low": 3.2,
    "info": 1.0,
}


def recalculate_scan_risk_priorities(
    db: Session,
    findings: list[models.Finding],
    intelligence_matches: list[models.IntelligenceMatch],
) -> None:
    """Update risk_priority (0-100 scale) on every Finding using CVSS/Severity + ENUMCORE KEV/EPSS + ProofState weight."""
    intel_by_finding: dict[int, models.IntelligenceMatch] = {
        m.finding_id: m for m in intelligence_matches if m.finding_id is not None
    }
    for f in findings:
        sev_key = (f.severity or "low").lower()
        base_val = float(f.cvss_score) if f.cvss_score is not None else SEVERITY_DEFAULT_WEIGHTS.get(sev_key, 3.5)
        intel = intel_by_finding.get(f.id)
        epss_bonus = float(intel.epss_score * 15.0) if intel else 1.0
        kev_bonus = 15.0 if (intel and intel.in_cisa_kev) else 0.0
        weight = PROOF_STATE_WEIGHTS.get(f.proof_state, 1.0)
        score = min(100.0, round((base_val * 7.0 + epss_bonus + kev_bonus) * weight, 1))
        f.risk_priority = score
    db.flush()


def compute_asset_risk_profile(db: Session, scan_id: int) -> dict[str, Any]:
    """
    Compute an explainable Asset & Engagement Risk Profile for Stage 7 RiskEngine.
    Combines Surface Exposure, Threat Intelligence Velocity (KEV/EPSS), and Proof-Weighted Findings.
    """
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return {}

    asset = db.query(models.Asset).filter_by(scan_id=scan_id).first()
    findings = db.query(models.Finding).filter_by(scan_id=scan_id).all()
    intel_matches = db.query(models.IntelligenceMatch).filter_by(scan_id=scan_id).all()
    endpoints = db.query(models.Endpoint).filter_by(scan_id=scan_id).all()
    attack_paths = db.query(models.AttackPath).filter_by(scan_id=scan_id).all()

    active_findings = [
        f for f in findings
        if f.proof_state not in (models.ProofState.REMEDIATION_VERIFIED, models.ProofState.NOT_VULNERABLE)
    ]
    remediated_count = sum(1 for f in findings if f.proof_state == models.ProofState.REMEDIATION_VERIFIED)

    priorities = [float(f.risk_priority or 0.0) for f in active_findings]
    max_priority = max(priorities) if priorities else 0.0
    avg_top5 = (
        round(sum(sorted(priorities, reverse=True)[:5]) / min(len(priorities), 5), 1)
        if priorities
        else 0.0
    )

    open_ports_count = len(asset.open_ports or []) if asset else 0
    high_sens_eps = sum(1 for ep in endpoints if ep.sensitivity == "high")
    surface_exposure_score = min(100.0, round(open_ports_count * 8.0 + high_sens_eps * 12.0 + len(endpoints) * 2.5, 1))

    kev_count = sum(1 for m in intel_matches if m.in_cisa_kev)
    max_epss = max((float(m.epss_score or 0.0) for m in intel_matches), default=0.0)
    threat_velocity_score = min(100.0, round(kev_count * 35.0 + max_epss * 65.0, 1))

    overall_index = min(
        100.0,
        round(max_priority * 0.55 + avg_top5 * 0.25 + surface_exposure_score * 0.10 + threat_velocity_score * 0.10, 1),
    )
    if overall_index >= 80.0:
        rating = "CRITICAL"
    elif overall_index >= 60.0:
        rating = "HIGH"
    elif overall_index >= 35.0:
        rating = "MEDIUM"
    else:
        rating = "LOW"

    top_findings = sorted(active_findings, key=lambda x: float(x.risk_priority or 0.0), reverse=True)[:5]

    return {
        "scan_id": scan_id,
        "asset_key": asset.asset_key if asset else "ASSET-00001",
        "hostname": asset.hostname if asset else scan.target_url,
        "overall_risk_index_100": overall_index,
        "overall_risk_index_10": round(overall_index / 10.0, 1),
        "overall_risk_rating": rating,
        "surface_exposure_score": surface_exposure_score,
        "threat_velocity_score": threat_velocity_score,
        "proof_weighted_top5_avg": avg_top5,
        "active_findings_count": len(active_findings),
        "remediated_findings_count": remediated_count,
        "kev_exposures_count": kev_count,
        "max_epss_probability": round(max_epss, 4),
        "attack_paths_count": len(attack_paths),
        "top_risk_drivers": [
            {
                "finding_id": f.id,
                "finding_key": f.finding_key,
                "title": f.title,
                "severity": f.severity,
                "proof_state": f.proof_state.value if hasattr(f.proof_state, "value") else str(f.proof_state),
                "risk_priority_100": float(f.risk_priority or 0.0),
                "risk_priority_10": round(float(f.risk_priority or 0.0) / 10.0, 1),
                "cvss_score": f.cvss_score,
                "cve_id": f.cve_id,
            }
            for f in top_findings
        ],
        "disclaimer": (
            "TrePath Risk Priority (0-10 / 0-100) is an internal composite triage index combining base severity/CVSS, "
            "FIRST EPSS probability, CISA KEV status, and PentestValidator ProofState weight. It is never represented as an official CVSS score."
        ),
    }


__all__ = ["recalculate_scan_risk_priorities", "compute_asset_risk_profile", "PROOF_STATE_WEIGHTS"]
