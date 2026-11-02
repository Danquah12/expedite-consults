"""Reporting Engine — TrePath 2.1 Executive/Technical Assessment Reports, Consolidated Finding Intelligence, and Investigation Workspaces."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .. import models
from ..attack_graph import (
    build_attack_graph_intelligence_summary,
    build_five_stage_evidence_progression,
)
from ..finding_normalizer import build_consolidated_finding_intelligence
from ..risk import compute_asset_risk_profile
from ..stage9_validation import (
    build_stage9_exploitation_and_post_exploitation_report,
    reconcile_historical_scan_records,
)
from ..unified_platform import sync_unified_finding_registry
from ..version_manifest import build_ed25519_signature_bundle, get_report_version_metadata
from .finding_workspace import build_finding_investigation_workspace, sanitize_forensic_text
from .pdf_generator import generate_pdf_assessment_report


def build_orchestrator_report(db: Session, scan_id: int) -> dict[str, object]:
    """Compile a structured TrePath 2.1 executive and technical assessment summary for a completed scan."""
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return {}

    stage9_report = build_stage9_exploitation_and_post_exploitation_report(db, scan_id)

    assets = db.query(models.Asset).filter_by(scan_id=scan_id).all()
    endpoints = db.query(models.Endpoint).filter_by(scan_id=scan_id).all()
    technologies = db.query(models.Technology).filter_by(scan_id=scan_id).all()
    intel = db.query(models.IntelligenceMatch).filter_by(scan_id=scan_id).all()
    plans = db.query(models.AssessmentPlan).filter_by(scan_id=scan_id).all()
    executions = db.query(models.TestExecution).filter_by(scan_id=scan_id).all()
    findings = db.query(models.Finding).filter_by(scan_id=scan_id).all()
    paths = db.query(models.AttackPath).filter_by(scan_id=scan_id).all()
    remediations = db.query(models.RemediationTask).filter_by(scan_id=scan_id).all()
    retest_execs = db.query(models.RetestExecution).filter_by(scan_id=scan_id).all()

    primary_asset = assets[0] if assets else None
    intel_summary = build_consolidated_finding_intelligence(
        findings=findings,
        asset=primary_asset,
        endpoints=endpoints,
        intel_matches=intel,
        assets=assets,
    )
    exec_counts = intel_summary["executive_counts"]

    sev_counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for cf in intel_summary["consolidated_security_findings"]:
        s = (cf["severity"] or "low").lower()
        sev_counts[s] = sev_counts.get(s, 0) + 1

    plan_breakdown: dict[str, int] = {}
    for p in plans:
        st = p.selection_status.value
        plan_breakdown[st] = plan_breakdown.get(st, 0) + 1

    exec_breakdown: dict[str, int] = {}
    for ex in executions:
        st = ex.status.value
        exec_breakdown[st] = exec_breakdown.get(st, 0) + 1

    risk_profile = compute_asset_risk_profile(db, scan_id)
    from ..eve import ExploitOrchestrator
    eve_summary = ExploitOrchestrator.get_scan_eve_summary(db, scan_id)
    unified_registry = sync_unified_finding_registry(db, scan_id)
    signature_bundle = build_ed25519_signature_bundle(db, scan_id)
    version_manifest = get_report_version_metadata(scan.profile)
    five_stage_progression = build_five_stage_evidence_progression(findings, paths, len(retest_execs))
    attack_graph_intelligence = build_attack_graph_intelligence_summary(findings, paths, retest_execs)

    return {
        "scan_id": scan.id,
        "engagement_id": scan.engagement_id,
        "target_url": scan.target_url,
        "status": scan.status.value,
        "started_at": scan.started_at.isoformat() if scan.started_at else None,
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
        "version_manifest": version_manifest,
        "five_stage_evidence_progression": five_stage_progression,
        "attack_graph_intelligence": attack_graph_intelligence,
        "counts": {
            "assets": len(assets),
            "endpoints": len(endpoints),
            "technologies": len(technologies),
            "intelligence_matches": len(intel),
            "planned_tests": len(plans),
            "test_executions": len(executions),
            "findings": len(findings),
            "raw_scanner_observations": exec_counts["raw_scanner_observations"],
            "unique_assets_and_services": exec_counts["unique_assets_and_services"],
            "unique_security_findings": exec_counts["unique_security_findings"],
            "confirmed_exploitable_findings": exec_counts["confirmed_exploitable_findings"],
            "impact_verified_findings": exec_counts["impact_verified_findings"],
            "informational_observations": exec_counts["informational_observations"],
            "attack_paths": len(paths),
            "remediation_tasks": len(remediations),
            "retest_executions": len(retest_execs),
            "eve_validation_jobs": eve_summary["total_jobs"],
            "unified_finding_records": len(unified_registry),
        },
        "executive_counts": exec_counts,
        "scope_reconciliation_funnel": intel_summary.get("scope_reconciliation_funnel", {}),
        "target_resolution_intelligence": intel_summary.get("target_resolution_intelligence", {}),
        "per_origin_authorization_matrix": intel_summary.get("per_origin_authorization_matrix", []),
        "port_and_transport_reconciliation": intel_summary.get("port_and_transport_reconciliation", {}),
        "consolidated_security_findings": intel_summary["consolidated_security_findings"],
        "consolidated_informational_observations": intel_summary["consolidated_informational_observations"],
        "scanner_health_coverage": intel_summary["scanner_health_coverage"],
        "validated_intelligence": intel_summary["validated_intelligence"],
        "severity_breakdown": sev_counts,
        "plan_selection_breakdown": plan_breakdown,
        "execution_status_breakdown": exec_breakdown,
        "risk_profile": risk_profile,
        "stage9_validation": stage9_report,
        "exploit_validation_engine": eve_summary,
        "unified_finding_registry": unified_registry,
        "ed25519_signature_bundle": signature_bundle,
    }


def generate_markdown_assessment_report(db: Session, scan_id: int) -> str:
    """
    Generate an audit-ready TrePath 2.1 Markdown Executive & Technical Penetration Testing Report
    grounded in consolidated finding intelligence, 7-dimension risk calibration, and per-edge AttackGraph evidence.
    """
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return "# TrePath 2.1 Assessment Report — Scan Not Found\n"

    engagement = db.get(models.Engagement, scan.engagement_id)
    assets = db.query(models.Asset).filter_by(scan_id=scan_id).all()
    asset = assets[0] if assets else None
    endpoints = db.query(models.Endpoint).filter_by(scan_id=scan_id).all()
    technologies = db.query(models.Technology).filter_by(scan_id=scan_id).all()
    intel_matches = db.query(models.IntelligenceMatch).filter_by(scan_id=scan_id).all()
    findings = db.query(models.Finding).filter_by(scan_id=scan_id).order_by(models.Finding.risk_priority.desc()).all()
    attack_paths = db.query(models.AttackPath).filter_by(scan_id=scan_id).all()
    remediations = db.query(models.RemediationTask).filter_by(scan_id=scan_id).all()
    retest_execs = db.query(models.RetestExecution).filter_by(scan_id=scan_id).all()
    risk_profile = compute_asset_risk_profile(db, scan_id)
    intel_summary = build_consolidated_finding_intelligence(
        findings=findings,
        asset=asset,
        endpoints=endpoints,
        intel_matches=intel_matches,
        assets=assets,
    )
    ec = intel_summary["executive_counts"]
    consolidated_sec = intel_summary["consolidated_security_findings"]

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines: list[str] = [
        "# TrePath 2.1 — Executive & Technical Security Assessment Report",
        "",
        f"- **Scan ID**: `#{scan.id}`",
        f"- **Engagement**: {engagement.name if engagement else 'Authorized Assessment'} ({engagement.client_name if engagement else 'Client'})",
        f"- **Target Scope**: `{scan.target_url}`",
        f"- **Asset Key**: `{asset.asset_key if asset else 'ASSET-00001'}` (`{asset.hostname if asset else scan.target_url}`)",
        f"- **ROE Profile**: `{scan.profile}` (Deterministic Non-Destructive Control Plane)",
        f"- **Report Generated**: `{now_iso}`",
        "",
        "---",
        "",
        "## 1. Executive Risk Summary & 6-Tier Metric Breakdown (`RiskEngine 2.1`)",
        "",
        f"- **Overall Risk Rating**: **{risk_profile.get('overall_risk_rating', 'MEDIUM')}** "
        f"(`{risk_profile.get('overall_risk_index_10', 0.0)} / 10` | `{risk_profile.get('overall_risk_index_100', 0.0)} / 100` calibrated 7-dimension scale)",
        f"- **1. Raw Scanner Observations**: `{ec['raw_scanner_observations']}`",
        f"- **2. Unique Assets & Services**: `1 host / {ec['unique_assets_and_services']} services / {len(endpoints)} HTTP endpoints`",
        f"- **3. Unique Consolidated Security Findings**: `{ec['unique_security_findings']}` (deduplicated by asset + service + component + root cause)",
        f"- **4. Confirmed Exploitable Findings**: `{ec['confirmed_exploitable_findings']}` (`CONFIRMED_ADMIN_AUTH` + `IMPACT_VERIFIED`)",
        f"- **5. Impact-Verified PoC Findings**: `{ec['impact_verified_findings']}`",
        f"- **6. Informational & Telemetry Observations**: `{ec['informational_observations']}`",
        f"- **Applicable Threat Intelligence**: `{ec['confirmed_applicable_kev_count']}` confirmed applicable KEVs, "
        f"`{ec['unvalidated_candidate_kev_count']}` unverified banner-only KEV candidates (Max Applicable EPSS: `{risk_profile.get('confirmed_applicable_max_epss', 0.0)}` | Raw Banner Max EPSS: `{risk_profile.get('max_epss_probability', 0.0)}`)",
        "",
        "### 7-Dimension Calibrated Risk Score Breakdown",
        "",
        "| Dimension | Score | Max | Evidence Rationale |",
        "| :--- | :--- | :--- | :--- |",
    ]
    for dim in risk_profile.get("risk_dimensions_breakdown", []):
        lines.append(f"| **{dim['dimension']}** | `{dim['score']}` | `{dim['max_score']}` | {dim['rationale']} |")

    lines.extend([
        "",
        f"> **Note**: {risk_profile.get('disclaimer', '')}",
        "",
        "---",
        "",
        "## 2. AttackGraph Multi-Step Correlation with Per-Edge Evidence States (`AttackGraph 2.1`)",
        "",
    ])

    if attack_paths:
        for ap in attack_paths:
            pf_ap = ap.proof_state.value if hasattr(ap.proof_state, "value") else str(ap.proof_state)
            lines.append(f"### {ap.path_key}: {ap.title} (`{ap.severity.upper()}` — Score: `{ap.composite_risk_score}`)")
            lines.append(f"- **Path Classification / Proof State**: `{pf_ap}`")
            lines.append(f"- **Narrative**: {ap.narrative}")
            lines.append("- **Attack Chain Steps & Transition Evidence**:")
            for st in ap.steps_json or []:
                edge_st = st.get("edge_evidence_state", "OBSERVED")
                lines.append(
                    f"  {st.get('step')}. **[{st.get('phase')}]** `{st.get('finding_key')}` — {st.get('summary')} "
                    f"| **Edge Evidence**: `{edge_st}` ({st.get('transition_rationale', '')}) "
                    f"*(Chokepoint: {st.get('mitigation_chokepoint', 'Apply control')})*"
                )
            lines.append("")
    else:
        lines.append("No multi-step attack chains correlated for this scan.\n")

    lines.extend([
        "---",
        "",
        "## 3. Fingerprinted Technologies & ENUMCORE Vulnerability Applicability Lifecycle",
        "",
        "| Tech Key | Software & Version | CPE | Outdated | Source Evidence ID |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ])
    for t in technologies:
        lines.append(
            f"| `{t.tech_key}` | {t.name} {t.version or ''} | `{t.cpe or 'N/A'}` | "
            f"{'YES' if t.is_outdated else 'No'} | `#{t.evidence_artifact_id}` |"
        )

    if intel_summary["validated_intelligence"]:
        lines.extend([
            "",
            "### ENUMCORE CVE Applicability & Precondition Validation (`6-Stage Lifecycle`)",
            "",
            "| CVE / CWE | CVSS | EPSS | CISA KEV | Validation State | Preconditions Verified | Applicability Note |",
            "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
        ])
        for vi in intel_summary["validated_intelligence"][:20]:
            lines.append(
                f"| `{vi['cve_id'] or vi['cwe_id']}` | `{vi['cvss_score']}` | `{vi['epss_score']:.3f}` | "
                f"{'**YES**' if vi['in_cisa_kev'] else 'No'} | `{vi['validation_state']}` | "
                f"{'YES' if vi['preconditions_verified'] else 'No (Candidate)'} | {vi['applicability_note']} |"
            )

    lines.extend([
        "",
        "---",
        "",
        "## 4. Prioritized Remediation Work Packages & Retest Ledger (`Stage 8`)",
        "",
        "| Task Key | Priority | Status | Owner | Title | Verification & Closure Criteria |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ])
    for r in remediations:
        lines.append(
            f"| `{r.task_key}` | **{r.priority}** | `{r.status}` | {r.owner} | {r.title} | {r.verification_criteria} |"
        )

    lines.extend([
        "",
        "### Deterministic Retest Execution Ledger (`RTEX-xxxxx`)",
        "",
        "| Retest Key | Finding ID | Status | Resulting Proof State | Evidence ID | Notes |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |",
    ])
    if retest_execs:
        for rx in retest_execs:
            st_val = rx.status.value if hasattr(rx.status, "value") else str(rx.status)
            pf_val = rx.proof_state.value if hasattr(rx.proof_state, "value") else str(rx.proof_state)
            lines.append(
                f"| `{rx.retest_exec_key}` | `#{rx.finding_id}` | `{st_val}` | `{pf_val}` | "
                f"`#{rx.evidence_artifact_id}` | {rx.notes} |"
            )
    else:
        lines.append("| `PENDING` | `N/A` | `AWAITING_REMEDIATION` | `NOT_TESTED` | `N/A` | Ready for one-click live retest verification after fix deployment. |")

    lines.extend([
        "",
        "---",
        "",
        f"## 5. Consolidated Security Findings ({len(consolidated_sec)} Unique Control Deficiencies from {len(findings)} Raw Observations)",
        "",
    ])
    for idx, cf in enumerate(consolidated_sec[:25], start=1):
        art = db.query(models.EvidenceArtifact).filter_by(finding_id=cf["finding_id"]).first()
        lines.extend([
            f"### 5.{idx} [{cf['severity'].upper()}] [{cf['proof_category']} / {cf['proof_substate']}] {cf['title']} (`{cf['finding_key']}`)",
            f"- **Consolidated Observations**: `{cf['merged_observations_count']}` (`{', '.join(cf['supporting_finding_keys'][:6])}`)",
            f"- **CVE Validation State**: `{cf['cve_validation']['validation_state']}` ({cf['cve_validation']['applicability_note']})",
            f"- **Remediation**: {cf['remediation']}",
            f"- **EvidenceCore SHA-256**: `{art.sha256 if art else 'N/A'}`",
            "",
        ])

    if intel_summary["scanner_health_coverage"]:
        lines.extend([
            "---",
            "",
            "## 6. Scanner Health & Assessment Coverage Telemetry",
            "",
        ])
        for sh in intel_summary["scanner_health_coverage"]:
            lines.append(f"- **`{sh['sensor_key']}` (`{sh['status']}`)**: {sh['coverage_note']}")

    return "\n".join(lines)


__all__ = [
    "build_orchestrator_report",
    "generate_markdown_assessment_report",
    "generate_pdf_assessment_report",
    "build_finding_investigation_workspace",
    "sanitize_forensic_text",
]
