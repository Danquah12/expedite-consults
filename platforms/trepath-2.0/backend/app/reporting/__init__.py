"""Reporting Engine — Executive/Technical Assessment Reports and Evidence-Driven Finding Investigation Workspaces."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .. import models
from ..risk import compute_asset_risk_profile
from .finding_workspace import build_finding_investigation_workspace, sanitize_forensic_text


def build_orchestrator_report(db: Session, scan_id: int) -> dict[str, object]:
    """Compile a structured executive and technical assessment summary for a completed scan."""
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return {}

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

    sev_counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        s = (f.severity or "low").lower()
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

    return {
        "scan_id": scan.id,
        "engagement_id": scan.engagement_id,
        "target_url": scan.target_url,
        "status": scan.status.value,
        "started_at": scan.started_at.isoformat() if scan.started_at else None,
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
        "counts": {
            "assets": len(assets),
            "endpoints": len(endpoints),
            "technologies": len(technologies),
            "intelligence_matches": len(intel),
            "planned_tests": len(plans),
            "test_executions": len(executions),
            "findings": len(findings),
            "attack_paths": len(paths),
            "remediation_tasks": len(remediations),
            "retest_executions": len(retest_execs),
        },
        "severity_breakdown": sev_counts,
        "plan_selection_breakdown": plan_breakdown,
        "execution_status_breakdown": exec_breakdown,
        "risk_profile": risk_profile,
    }


def generate_markdown_assessment_report(db: Session, scan_id: int) -> str:
    """
    Generate an audit-ready Markdown Executive & Technical Penetration Testing Report
    for Stage 8 Reporting, grounded in real database and EvidenceCore records.
    """
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return "# TrePath 2.0 Assessment Report — Scan Not Found\n"

    engagement = db.get(models.Engagement, scan.engagement_id)
    asset = db.query(models.Asset).filter_by(scan_id=scan_id).first()
    endpoints = db.query(models.Endpoint).filter_by(scan_id=scan_id).all()
    technologies = db.query(models.Technology).filter_by(scan_id=scan_id).all()
    intel_matches = db.query(models.IntelligenceMatch).filter_by(scan_id=scan_id).all()
    findings = db.query(models.Finding).filter_by(scan_id=scan_id).order_by(models.Finding.risk_priority.desc()).all()
    attack_paths = db.query(models.AttackPath).filter_by(scan_id=scan_id).all()
    remediations = db.query(models.RemediationTask).filter_by(scan_id=scan_id).all()
    retest_execs = db.query(models.RetestExecution).filter_by(scan_id=scan_id).all()
    risk_profile = compute_asset_risk_profile(db, scan_id)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines: list[str] = [
        f"# TrePath 2.0 — Executive & Technical Security Assessment Report",
        f"",
        f"- **Scan ID**: `#{scan.id}`",
        f"- **Engagement**: {engagement.name if engagement else 'Authorized Assessment'} ({engagement.client_name if engagement else 'Client'})",
        f"- **Target Scope**: `{scan.target_url}`",
        f"- **Asset Key**: `{asset.asset_key if asset else 'ASSET-00001'}` (`{asset.hostname if asset else scan.target_url}`)",
        f"- **ROE Profile**: `{scan.profile}` (Deterministic Non-Destructive Control Plane)",
        f"- **Report Generated**: `{now_iso}`",
        f"",
        f"---",
        f"",
        f"## 1. Executive Risk Summary (`RiskEngine`)",
        f"",
        f"- **Overall Risk Rating**: **{risk_profile.get('overall_risk_rating', 'MEDIUM')}** "
        f"(`{risk_profile.get('overall_risk_index_10', 0.0)} / 10` | `{risk_profile.get('overall_risk_index_100', 0.0)} / 100` internal triage scale)",
        f"- **Surface Exposure Score**: `{risk_profile.get('surface_exposure_score', 0.0)} / 100` "
        f"({len(asset.open_ports or []) if asset else 0} open TCP ports, {len(endpoints)} deduplicated endpoints)",
        f"- **Threat Velocity Score**: `{risk_profile.get('threat_velocity_score', 0.0)} / 100` "
        f"({risk_profile.get('kev_exposures_count', 0)} CISA KEV exposures, Max EPSS: `{risk_profile.get('max_epss_probability', 0.0)}`)",
        f"- **Total Findings**: `{len(findings)}` (`{risk_profile.get('remediated_findings_count', 0)}` verified remediated)",
        f"",
        f"> **Note**: {risk_profile.get('disclaimer', '')}",
        f"",
        f"---",
        f"",
        f"## 2. AttackGraph Multi-Step Correlation (`AttackGraph`)",
        f"",
    ]

    if attack_paths:
        for ap in attack_paths:
            lines.append(f"### {ap.path_key}: {ap.title} (`{ap.severity.upper()}` — Score: `{ap.composite_risk_score}`)")
            lines.append(f"- **Proof State**: `{ap.proof_state.value if hasattr(ap.proof_state, 'value') else ap.proof_state}`")
            lines.append(f"- **Narrative**: {ap.narrative}")
            lines.append(f"- **Attack Chain Steps**:")
            for st in ap.steps_json or []:
                lines.append(
                    f"  {st.get('step')}. **[{st.get('phase')}]** `{st.get('finding_key')}` — {st.get('summary')} "
                    f"*(Chokepoint: {st.get('mitigation_chokepoint', 'Apply control')})*"
                )
            lines.append("")
    else:
        lines.append("No multi-step attack chains correlated for this scan.\n")

    lines.extend([
        f"---",
        f"",
        f"## 3. Fingerprinted Technologies & ENUMCORE Intelligence",
        f"",
        f"| Tech Key | Software & Version | CPE | Outdated | Source Evidence ID |",
        f"| :--- | :--- | :--- | :--- | :--- |",
    ])
    for t in technologies:
        lines.append(
            f"| `{t.tech_key}` | {t.name} {t.version or ''} | `{t.cpe or 'N/A'}` | "
            f"{'YES' if t.is_outdated else 'No'} | `#{t.evidence_artifact_id}` |"
        )

    if intel_matches:
        lines.extend([
            f"",
            f"### ENUMCORE CVE / CWE / KEV / EPSS Correlations",
            f"",
            f"| CVE / CWE | CVSS | EPSS | CISA KEV | Maturity | Summary |",
            f"| :--- | :--- | :--- | :--- | :--- | :--- |",
        ])
        for im in intel_matches[:20]:
            lines.append(
                f"| `{im.cve_id or im.cwe_id}` | `{im.cvss_score}` | `{im.epss_score:.3f}` | "
                f"{'**YES**' if im.in_cisa_kev else 'No'} | `{im.exploit_maturity}` | {im.summary[:90]} |"
            )

    lines.extend([
        f"",
        f"---",
        f"",
        f"## 4. Prioritized Remediation Roadmap & Verification (`Stage 8`)",
        f"",
        f"| Task Key | Priority | Status | Owner | Title |",
        f"| :--- | :--- | :--- | :--- | :--- |",
    ])
    for r in remediations:
        lines.append(f"| `{r.task_key}` | **{r.priority}** | `{r.status}` | {r.owner} | {r.title} |")

    if retest_execs:
        lines.extend([
            f"",
            f"### Deterministic Retest Execution Records (`RTEX-xxxxx`)",
            f"",
            f"| Retest Key | Finding ID | Status | Resulting Proof State | Evidence ID | Notes |",
            f"| :--- | :--- | :--- | :--- | :--- | :--- |",
        ])
        for rx in retest_execs:
            st_val = rx.status.value if hasattr(rx.status, "value") else str(rx.status)
            pf_val = rx.proof_state.value if hasattr(rx.proof_state, "value") else str(rx.proof_state)
            lines.append(
                f"| `{rx.retest_exec_key}` | `#{rx.finding_id}` | `{st_val}` | `{pf_val}` | "
                f"`#{rx.evidence_artifact_id}` | {rx.notes} |"
            )

    lines.extend([
        f"",
        f"---",
        f"",
        f"## 5. Technical Findings & EvidenceCore SHA-256 Registry",
        f"",
    ])
    for idx, f in enumerate(findings[:25], start=1):
        art = db.query(models.EvidenceArtifact).filter_by(finding_id=f.id).first()
        pf_str = f.proof_state.value if hasattr(f.proof_state, "value") else str(f.proof_state)
        lines.extend([
            f"### 5.{idx} [{f.severity.upper()}] {f.title} (`{f.finding_key}`)",
            f"- **Proof State**: `{pf_str}` | **TrePath Priority**: `{f.risk_priority} / 100` | **CWE**: `{f.cwe_id or 'CWE-200'}`",
            f"- **Remediation**: {f.remediation}",
            f"- **EvidenceCore SHA-256**: `{art.sha256 if art else 'N/A'}` (`{art.artifact_type if art else 'N/A'}`)",
            f"",
        ])

    return "\n".join(lines)


__all__ = [
    "build_orchestrator_report",
    "generate_markdown_assessment_report",
    "build_finding_investigation_workspace",
    "sanitize_forensic_text",
]
