"""
TrePath 2.3 Acceptance & Negative Quality Gate Test Suite (NG-01 through NG-06 & AT-2.3-01..07).

Verifies all resolutions from the Scan #40 Technical Analysis:
  - NG-01: Candidate /dashboard or /admin HTTP 200 routes without verified admin console controls
           are classified as OBSERVATION_CONFIRMED :: LOGIN_INTERFACE_OR_ROUTE_DISCOVERED (Low).
  - NG-02: Modern versions (e.g. nginx 1.31.8) have is_outdated == False; banner-only fingerprints
           use OBSERVATION_CONFIRMED :: VERSION_FINGERPRINT_BANNER_ONLY (Low).
  - NG-03: Anti-bot / honeypot challenge routes (e.g. Anubis /.within.website/x/cmd/anubis/api/honeypot/...)
           are classified as OBSERVATION_CONFIRMED :: ANTIBOT_OR_PUBLIC_API_ROUTE_OBSERVED (Low).
  - NG-04: Pre-auth login forms without CSRF tokens use PRE_AUTH_FORM_CSRF_OBSERVED (Low), and missing
           X-RateLimit-* headers use RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED (Low).
  - NG-05: Canonical Finding -> Asset -> Effective Origin -> RemediationTask relational integrity;
           zero non-owasp.org remediation tasks reference owasp.org (fixes REM-00138 on github.com:443).
  - NG-06: 7-Stage Scope Reconciliation Funnel (46 -> 46 -> 14 -> 14 -> 0 -> 0 -> 377),
           3-Pillar Score Attribution (Confirmed Compromise = 0.0 pts in Scan #40),
           Sensor Coverage Completeness (83.3% when OpenVAS is standby), and HYPOTHETICAL_PROJECTION labeling.
"""

from __future__ import annotations

from pathlib import Path

from app import models
from app.database import SessionLocal
from app.discovery.technology_classifier import _check_outdated
from app.reporting import build_orchestrator_report, generate_pdf_assessment_report
from app.stage9_validation import reconcile_historical_scan_records


def test_ng_01_admin_route_reachability_not_overclaimed_as_admin_console():
    """NG-01: Scan #40 F-01 (portswigger.net/web-security/dashboard & www.root-me.org/admin) are Low OBSERVATION_CONFIRMED :: LOGIN_INTERFACE_OR_ROUTE_DISCOVERED."""
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        rep = build_orchestrator_report(db, 40)
        admin_findings = [
            cf for cf in rep["consolidated_security_findings"]
            if "DAST-ADMIN-ACCESS-" in cf["finding_key"]
        ]
        assert len(admin_findings) >= 1
        f01 = next(cf for cf in admin_findings if cf["target_host"] == "portswigger.net")
        assert f01["host_port"] == "portswigger.net:443"
        assert f01["asset_id"] == "ASSET-00030"
        for af in admin_findings:
            assert af["proof_category"] == "OBSERVATION_CONFIRMED"
            assert af["proof_substate"] == "LOGIN_INTERFACE_OR_ROUTE_DISCOVERED"
            assert af["severity"] == "low"
            assert "Not proven by this check: administrative console exposure" in af["not_proven_statement"]
    finally:
        db.close()


def test_ng_02_modern_nginx_version_and_banner_only_fingerprint_not_outdated():
    """NG-02: nginx 1.31.8 is NOT outdated, and Scan #40 F-02 is classified as OBSERVATION_CONFIRMED :: VERSION_FINGERPRINT_BANNER_ONLY."""
    assert _check_outdated("nginx", "1.31.8", "nginx/1.31.8") is False
    assert _check_outdated("nginx", "1.24.0", "nginx/1.24.0") is False
    assert _check_outdated("nginx", "1.18.0", "nginx/1.18.0") is True
    assert _check_outdated("Apache", "2.2.8", "Apache/2.2.8 (Ubuntu)") is True

    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        techs = db.query(models.Technology).filter_by(scan_id=40).all()
        for t in techs:
            if "nginx" in (t.name or "").lower() and "1.31" in (t.version or ""):
                assert t.is_outdated is False

        rep = build_orchestrator_report(db, 40)
        ver_findings = [
            cf for cf in rep["consolidated_security_findings"]
            if "DAST-VER-INTEL-" in cf["finding_key"]
        ]
        assert len(ver_findings) == 1
        f02 = ver_findings[0]
        assert f02["host_port"] == "pentest-ground.com:443"
        assert f02["asset_id"] == "ASSET-00037"
        assert f02["proof_category"] == "OBSERVATION_CONFIRMED"
        assert f02["proof_substate"] == "VERSION_FINGERPRINT_BANNER_ONLY"
        assert f02["severity"] == "low"
        assert "Current Release" in f02["title"]
    finally:
        db.close()


def test_ng_03_antibot_honeypot_api_route_classified_as_observation():
    """NG-03: Scan #40 F-13 (Anubis /.within.website/x/cmd/anubis/api/honeypot/.../init on www.root-me.org) is ANTIBOT_OR_PUBLIC_API_ROUTE_OBSERVED."""
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        rep = build_orchestrator_report(db, 40)
        api_findings = [
            cf for cf in rep["consolidated_security_findings"]
            if "DAST-API-AUTHZ-" in cf["finding_key"]
        ]
        assert len(api_findings) == 1
        f13 = api_findings[0]
        assert f13["host_port"] == "www.root-me.org:443"
        assert f13["asset_id"] == "ASSET-00035"
        assert f13["proof_category"] == "OBSERVATION_CONFIRMED"
        assert f13["proof_substate"] == "ANTIBOT_OR_PUBLIC_API_ROUTE_OBSERVED"
        assert f13["severity"] == "low"
        assert float(f13["cvss_score"]) <= 2.5
    finally:
        db.close()


def test_ng_04_pre_auth_csrf_and_missing_rate_limit_headers_calibrated():
    """NG-04: F-14 uses PRE_AUTH_FORM_CSRF_OBSERVED and F-15 uses RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED."""
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        rep = build_orchestrator_report(db, 40)
        csrf_findings = [
            cf for cf in rep["consolidated_security_findings"]
            if "ENUM-FORM-NOCSRF" in cf["finding_key"]
        ]
        assert len(csrf_findings) == 1
        f14 = csrf_findings[0]
        assert f14["host_port"] == "www.hackthissite.org:443"
        assert f14["proof_category"] == "OBSERVATION_CONFIRMED"
        assert f14["proof_substate"] == "PRE_AUTH_FORM_CSRF_OBSERVED"
        assert f14["severity"] == "low"

        rl_findings = [
            cf for cf in rep["consolidated_security_findings"]
            if "API-RATE-LIMIT-" in cf["finding_key"]
        ]
        assert len(rl_findings) == 1
        f15 = rl_findings[0]
        assert f15["host_port"] == "github.com:443"
        assert f15["asset_id"] == "ASSET-00028"
        assert f15["proof_category"] == "OBSERVATION_CONFIRMED"
        assert f15["proof_substate"] == "RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED"
        assert f15["severity"] == "low"
    finally:
        db.close()


def test_ng_05_canonical_remediation_asset_binding_zero_cross_domain_contamination():
    """NG-05: Every RemediationTask in Scan #40 is bound to its exact finding asset_id and host_port (REM-00138 -> github.com:443 ASSET-00028, never owasp.org)."""
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        rep = build_orchestrator_report(db, 40)
        cf_by_fid = {cf["finding_id"]: cf for cf in rep["consolidated_security_findings"]}
        assets_by_id = {a.id: a for a in db.query(models.Asset).filter_by(scan_id=40).all()}
        remediations = db.query(models.RemediationTask).filter_by(scan_id=40).all()
        assert len(remediations) == 15

        for r in remediations:
            cf = cf_by_fid[r.finding_id]
            bound_asset = assets_by_id[r.asset_id]
            assert bound_asset.asset_key == cf["asset_id"]
            assert cf["host_port"] in r.fix_guidance
            assert cf["asset_id"] in r.fix_guidance
            if cf["target_host"] != "owasp.org":
                assert "Affected Asset: owasp.org" not in r.fix_guidance

        rem_138 = next(r for r in remediations if r.task_key == "REM-00138")
        assert "github.com:443 (ASSET-00028" in rem_138.fix_guidance
        assert "owasp.org" not in rem_138.fix_guidance
    finally:
        db.close()


def test_ng_06_seven_stage_scope_funnel_and_three_pillar_risk_attribution():
    """NG-06: Scan #40 reports the 7-stage scope reconciliation funnel, 3-pillar risk attribution, 83.3% sensor coverage, and all 6 NG gates PASSED."""
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 40)
        rep = build_orchestrator_report(db, 40)
        funnel = rep["scope_reconciliation_funnel"]
        assert funnel["requested_targets_count"] == 46
        assert funnel["authorized_targets_count"] == 46
        assert funnel["resolved_hosts_count"] == 14
        assert funnel["in_scope_origins_count"] == 14
        assert funnel["out_of_scope_origins_count"] == 0
        assert funnel["discovered_endpoints_count"] == 377

        risk = rep["risk_profile"]
        pillars = risk["score_pillar_attribution"]
        assert pillars["confirmed_compromise_score"] == 0.0
        assert pillars["control_gap_hygiene_score"] > 0.0
        assert pillars["surface_and_baseline_score"] > 0.0
        assert risk["sensor_coverage_completeness_pct"] == 83.3
        assert "HYPOTHETICAL_PROJECTION" in pillars["forecast_state"]
        assert pillars["verified_t1_risk_reduction_10"] == 0.0

        ng_gates = rep["stage9_validation"]["negative_quality_gates"]
        assert len(ng_gates) == 6
        assert all(g["passed"] is True for g in ng_gates)
    finally:
        db.close()


def test_scan_40_pdf_report_renders_all_trepath_2_3_sections_and_gates():
    """Verify Scan #40 PDF renders cleanly with TrePath 2.3 header, 7-stage funnel, origin-bound remediation, and NG-01..NG-06."""
    db = SessionLocal()
    try:
        pdf_bytes = generate_pdf_assessment_report(db, 40)
        assert pdf_bytes.startswith(b"%PDF-1.4")
        text = pdf_bytes.decode("latin-1", errors="ignore")
        assert "TREPATH 2.3 - Penetration Testing Report" in text
        assert "Seven-Stage Scope & Asset Reconciliation Funnel" in text
        assert "LOGIN_INTERFACE_OR_ROUTE_DISCOVERED" in text
        assert "VERSION_FINGERPRINT_BANNER_ONLY" in text
        assert "ANTIBOT_OR_PUBLIC_API_ROUTE_OBSERVED" in text
        assert "RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED" in text
        assert "github.com:443" in text
        assert "ASSET-00028" in text
        assert "Effective Origin: https://github.com:443" in text
        assert "NG-01" in text
        assert "NG-05" in text
        assert "NG-06" in text

        out_path = Path(r"C:\Users\asied\.gemini\antigravity\brain\b74eac86-cae5-4cb9-add4-602e2ef40dd7\trepath-post-exploitation-report-scan-40-v2.3.pdf")
        out_path.write_bytes(pdf_bytes)
        assert out_path.exists() and out_path.stat().st_size > 25000
    finally:
        db.close()
