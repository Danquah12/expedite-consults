"""Orchestrator Execution Manager — Central Control Plane coordinating the 8-Stage TrePath 2.0 Pipeline."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable
from sqlalchemy.orm import Session

from .. import models
from ..discovery import (
    normalize_discovered_assets,
    persist_normalized_asset,
    classify_endpoints,
    persist_classified_endpoints,
    classify_technologies,
    persist_technologies,
)
from ..intelligence import run_enumcore_correlation
from ..validation import classify_and_deduplicate_findings
from ..evidence import seal_finding_with_evidence
from ..risk import recalculate_scan_risk_priorities
from ..attack_graph import build_attack_paths
from ..remediation import generate_remediation_tasks
from .planner import generate_asset_assessment_plan
from .dispatcher import dispatch_scheduled_jobs
from .workflow_state import record_execution_event


@dataclass
class OrchestrationSummary:
    asset: models.Asset
    endpoints: list[models.Endpoint]
    technologies: list[models.Technology]
    intelligence_matches: list[models.IntelligenceMatch]
    assessment_plans: list[models.AssessmentPlan]
    test_executions: list[models.TestExecution]
    findings: list[models.Finding]
    evidence_artifacts: list[models.EvidenceArtifact]
    attack_paths: list[models.AttackPath]
    remediation_tasks: list[models.RemediationTask]


def execute_orchestrated_ingestion_and_lifecycle(
    db: Session,
    scan: models.Scan,
    roe: models.RulesOfEngagement | None,
    evidence_dir: str,
    posture_findings: list[dict[str, Any]],
    port_findings: list[dict[str, Any]],
    web_findings: list[dict[str, Any]],
    active_findings: list[dict[str, Any]],
    nmap_findings: list[dict[str, Any]],
    tls_findings: list[dict[str, Any]],
    nuclei_findings: list[dict[str, Any]],
    zap_findings: list[dict[str, Any]],
    openvas_findings: list[dict[str, Any]],
    extra_discovered_urls: list[str] | None = None,
    emit_cb: Callable[[int, str, str, str, str], None] | None = None,
) -> OrchestrationSummary:
    """
    Execute the complete 8-Stage TrePath Assessment Orchestrator v1 lifecycle:
      1. WebPulse + NetRecon discovery ingestion
      2. Asset & Endpoint Normalization + Technology Classification
      3. EvidenceCore sealing with FIPS 180-4 SHA-256 + PentestValidator proof verification
      4. ENUMCORE Vulnerability Intelligence correlation (CVE, CWE, KEV, EPSS)
      5. ROE-aware Assessment Plan generation & Test Selection
      6. Job Queue Scheduling & Execution Dispatch (`EXEC-00001` -> `ASSET-00001`)
      7. RiskEngine composite scoring & AttackGraph path correlation
      8. Remediation Task generation
    """
    def _notify(pct: int, stage: str, eng: str, msg: str, level: str = "info"):
        record_execution_event(
            db=db,
            engagement_id=scan.engagement_id,
            scan_id=scan.id,
            stage=stage,
            engine=eng,
            message=msg,
            percent=pct,
            status=level.upper(),
        )
        if emit_cb:
            emit_cb(pct, stage, eng, msg, level)

    # Stage 2: Asset Normalization & Endpoint Classification
    norm_asset = normalize_discovered_assets(
        target_url=scan.target_url,
        port_findings=port_findings,
        posture_findings=posture_findings,
        web_findings=web_findings,
    )
    asset_record = persist_normalized_asset(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        normalized=norm_asset,
    )

    classified_eps = classify_endpoints(
        asset=norm_asset,
        web_findings=web_findings,
        extra_urls=extra_discovered_urls,
    )
    endpoint_records = persist_classified_endpoints(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset_id=asset_record.id,
        classified=classified_eps,
        include_duplicates=False,
    )
    dup_count = sum(1 for ep in classified_eps if ep.is_duplicate)
    _notify(
        90,
        "NORMALIZATION",
        "ASSET_NORMALIZER",
        f"Normalized asset {asset_record.asset_key} ({asset_record.hostname}) -> "
        f"{len(endpoint_records)} unique endpoints ({dup_count} duplicates suppressed).",
    )

    # Combine all raw findings (keep deep copies for technology fingerprinting before 'evidence' is popped)
    all_raw = (
        list(posture_findings)
        + list(port_findings)
        + list(web_findings)
        + list(active_findings)
        + list(nmap_findings)
        + list(tls_findings)
        + list(nuclei_findings)
        + list(zap_findings)
        + list(openvas_findings)
    )
    deduped_raw = classify_and_deduplicate_findings(all_raw)
    raw_techs = classify_technologies(norm_asset, [dict(x) for x in deduped_raw])

    # Stage 5 & 6: PentestValidator + EvidenceCore Sealing
    persisted_findings: list[models.Finding] = []
    persisted_artifacts: list[models.EvidenceArtifact] = []
    finding_key_to_evidence_id: dict[str, int] = {}
    finding_id_to_evidence_id: dict[int, int] = {}

    for item in deduped_raw:
        finding, artifact = seal_finding_with_evidence(
            db=db,
            evidence_dir=evidence_dir,
            scan_id=scan.id,
            raw_item=item,
        )
        persisted_findings.append(finding)
        persisted_artifacts.append(artifact)
        finding_key_to_evidence_id[finding.finding_key] = artifact.id
        finding_id_to_evidence_id[finding.id] = artifact.id

    # Persist Technologies linked to their source EvidenceArtifact IDs
    tech_records = persist_technologies(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset_id=asset_record.id,
        tech_list=raw_techs,
        finding_key_to_evidence_id=finding_key_to_evidence_id,
    )

    # Stage 3: ENUMCORE Vulnerability Intelligence
    intel_records = run_enumcore_correlation(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset_id=asset_record.id,
        persisted_techs=tech_records,
        raw_techs=raw_techs,
        persisted_findings=persisted_findings,
    )

    # Synthesize deterministic VER-INTEL-001 findings for outdated fingerprinted software correlated by ENUMCORE
    for tech in tech_records:
        if not tech.is_outdated:
            continue
        ver_key = f"DAST-VER-INTEL-{tech.tech_key}"
        if ver_key in finding_key_to_evidence_id:
            continue
        matched_intel = next((m for m in intel_records if m.technology_id == tech.id), None)
        cve_str = matched_intel.cve_id if matched_intel else None
        cvss_val = float(matched_intel.cvss_score) if matched_intel else 6.5
        ver_raw = {
            "finding_key": ver_key,
            "title": (
                f"[VER-INTEL-001] Outdated Software Component Verified: {tech.name} {tech.version or ''} "
                + (f"({cve_str})" if cve_str else "(Legacy Release)")
            )[:255],
            "description": (
                f"Version intelligence check `VER-INTEL-001` verified fingerprinted component `{tech.name} {tech.version or ''}` "
                f"(CPE: `{tech.cpe or 'N/A'}`, Banner: `{tech.banner}`). "
                + (matched_intel.summary if matched_intel else "Outdated software release detected.")
            ),
            "severity": "high" if cvss_val >= 7.5 else "medium",
            "proof_state": models.ProofState.CONTROL_GAP_CONFIRMED,
            "cvss_score": cvss_val,
            "cve_id": cve_str,
            "cwe_id": matched_intel.cwe_id if matched_intel else "CWE-1104",
            "remediation": f"Upgrade {tech.name} ({tech.version or 'legacy'}) to a current vendor-supported release and apply security advisories.",
            "risk_priority": 74.0 if cvss_val >= 7.5 else 52.0,
            "evidence": json.dumps({
                "source": "TrePath Version Intelligence Adapter (VER-INTEL-001)",
                "test_id": "VER-INTEL-001",
                "matched_at": asset_record.target_url,
                "request": f"GET / HTTP/1.1\r\nHost: {asset_record.hostname}",
                "response": (
                    f"Fingerprinted Software: {tech.name} {tech.version or ''}\n"
                    f"CPE: {tech.cpe or 'N/A'}\n"
                    f"Correlated CVE: {cve_str or 'N/A'}"
                ),
            }, indent=2),
        }
        vf, va = seal_finding_with_evidence(db=db, evidence_dir=evidence_dir, scan_id=scan.id, raw_item=ver_raw)
        persisted_findings.append(vf)
        persisted_artifacts.append(va)
        finding_key_to_evidence_id[vf.finding_key] = va.id
        finding_id_to_evidence_id[vf.id] = va.id

    _notify(
        93,
        "ENUMCORE",
        "ENUMCORE_INTEL",
        f"ENUMCORE fingerprinted {len(tech_records)} software technologies and correlated {len(intel_records)} CVE/CWE/KEV/EPSS records.",
    )

    # Stage 4: Assessment Orchestrator Planning & ROE Test Selection
    plan_records, job_queue = generate_asset_assessment_plan(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset=asset_record,
        endpoints=endpoint_records,
        technologies=tech_records,
        intelligence_matches=intel_records,
        roe=roe,
    )
    eligible_cnt = sum(1 for p in plan_records if p.selection_status == models.SelectionStatus.ELIGIBLE)
    blocked_cnt = sum(1 for p in plan_records if p.selection_status == models.SelectionStatus.BLOCKED_BY_SCOPE)
    unsupported_cnt = sum(1 for p in plan_records if p.selection_status == models.SelectionStatus.UNSUPPORTED)
    _notify(
        96,
        "ORCHESTRATOR",
        "TEST_SELECTOR",
        f"Generated Assessment Plan ({len(plan_records)} tests: {eligible_cnt} ELIGIBLE, "
        f"{blocked_cnt} BLOCKED_BY_SCOPE, {unsupported_cnt} UNSUPPORTED).",
    )

    # Stage 5b: Dispatch Jobs & Record Standardized TestExecution Lifecycle
    execution_records = dispatch_scheduled_jobs(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        jobs=job_queue,
        persisted_findings=persisted_findings,
        finding_id_to_evidence_id=finding_id_to_evidence_id,
    )

    # Stage 7: RiskEngine & AttackGraph
    recalculate_scan_risk_priorities(db, persisted_findings, intel_records)
    attack_paths = build_attack_paths(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset=asset_record,
        findings=persisted_findings,
    )

    # Stage 8: Remediation & Retesting Tasks
    remediation_tasks = generate_remediation_tasks(
        db=db,
        engagement_id=scan.engagement_id,
        scan_id=scan.id,
        asset_id=asset_record.id,
        findings=persisted_findings,
    )
    _notify(
        98,
        "RISK_GRAPH",
        "ATTACK_GRAPH",
        f"RiskEngine prioritized {len(persisted_findings)} findings, synthesized {len(attack_paths)} attack paths, "
        f"and created {len(remediation_tasks)} remediation tasks.",
    )

    db.flush()
    return OrchestrationSummary(
        asset=asset_record,
        endpoints=endpoint_records,
        technologies=tech_records,
        intelligence_matches=intel_records,
        assessment_plans=plan_records,
        test_executions=execution_records,
        findings=persisted_findings,
        evidence_artifacts=persisted_artifacts,
        attack_paths=attack_paths,
        remediation_tasks=remediation_tasks,
    )
