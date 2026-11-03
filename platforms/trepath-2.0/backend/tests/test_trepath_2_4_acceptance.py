"""TrePath 2.4 Acceptance Test Suite (`test_trepath_2_4_acceptance.py`).

Verifies all engineering directives from the TrePath 2.3 Scan #42 Technical Analysis:
1. Section 3 — Header-Policy Evaluation Engine:
   - Effective header-policy inspection (detects present vs. missing headers and compensating controls such as CSP `frame-ancestors`).
   - Targeted, specific remediation for ONLY the missing headers in each finding (`F-01`..`F-12`) — never prescribing already-present headers.
2. Issue 1 (P1) — 4-Metric Sensor Coverage Model:
   - `Installed Coverage`, `Operational Coverage`, `Execution Coverage`, and `Applicable Coverage`.
3. Issue 2 (P1) — 4-State Port & Application Transport Discovery Reconciliation:
   - Distinguishes raw Nmap TCP port scan state (`0` open raw ports in web-only scan) from HTTP/HTTPS application transport (`376` endpoints across `14` origins).
4. Issue 3 (P1) — 4-Track Score Separation:
   - `OBSERVATION_CONFIRMED` items (`F-13`..`F-17`: candidate admin routes, missing rate-limit headers, pre-auth forms, Anubis honeypot routes) have `vulnerability_cvss = None` (`"N/A (Observation)"`) and separate `configuration_control_priority`, `reconnaissance_intelligence_priority`, and `exploitability_confidence`.
5. Issue 4 (P1) — Centralized Version Manifest (`TREPATH_VERSION_MANIFEST`):
   - Eliminates version drift across Cover Page, Running Page Header, RiskEngine, AttackGraph, and Sign-Off (`TrePath 2.4` everywhere).
6. Issue 5 (P1) — Verifiable RFC 8032 Ed25519 Cryptographic Signature & Tamper-Detection Bundle:
   - Real Ed25519 signature verification (`VERIFIED_AUTHENTIC`) + live 1-bit payload mutation tamper rejection (`PASSED`).
7. Section 4 & Section 7 — 4-Level Administrative Route Evidence Taxonomy & Per-Origin Written Authorization Governance.
8. Sections 8–12 — Unified Finding Registry (`XTRIKE + TrePath 2.4 + Expedite Strike + Noctis`) & Complete 10-Step Controlled OWASP Juice Shop E2E Lifecycle (`T0 HIGH -> T1 LOW` with `5/5 REMEDIATION_VERIFIED`).
"""
from __future__ import annotations

from pathlib import Path
import pytest

from app.attack_graph import CANONICAL_FOUR_EDGE_STATES, build_five_stage_evidence_progression
from app.database import Base, SessionLocal, engine
from app.finding_normalizer import build_consolidated_finding_intelligence
from app import models
from app.reporting import build_orchestrator_report, generate_pdf_assessment_report
from app.risk import compute_asset_risk_profile
from app.stage9_validation import reconcile_historical_scan_records
from app.unified_platform import run_controlled_juice_shop_e2e_lab, sync_unified_finding_registry
from app.version_manifest import (
    TREPATH_VERSION_MANIFEST,
    build_ed25519_signature_bundle,
    get_trusted_public_key_discovery_bundle,
    verify_detached_ed25519_bundle,
)

Base.metadata.create_all(bind=engine)

ARTIFACT_DIR = Path(r"C:\Users\asied\.gemini\antigravity\brain\b74eac86-cae5-4cb9-add4-602e2ef40dd7")


@pytest.fixture()
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_01_centralized_version_manifest_zero_drift():
    """Issue 4 (P1): Centralized Version Manifest eliminates version drift across all modules (TrePath 2.6)."""
    assert TREPATH_VERSION_MANIFEST["platform_version"] == "TrePath 2.6"
    assert TREPATH_VERSION_MANIFEST["release_version"] == "2.6.0"
    assert "TREPATH 2.6" in TREPATH_VERSION_MANIFEST["running_header_brand"]
    mods = TREPATH_VERSION_MANIFEST["module_versions"]
    for key in (
        "discovery_engine",
        "vulnerability_intelligence",
        "header_policy_engine",
        "exploit_validation_engine",
        "runtime_verification",
        "attack_graph",
        "risk_engine",
        "evidence_core",
        "rtex_engine",
        "sast_bridge",
        "security_intelligence",
    ):
        assert "2.6" in mods[key], f"Module {key} has version drift: {mods[key]}"


def test_02_scan_42_header_policy_evaluation_and_specific_remediation(db_session):
    """Section 3: Header-Policy Evaluation Engine & Specific Missing-Header Remediation on Scan #42."""
    scan = db_session.get(models.Scan, 42)
    assert scan is not None, "Scan #42 must exist in trepath.db"

    reconcile_historical_scan_records(db_session, 42)
    assets = db_session.query(models.Asset).filter_by(scan_id=42).all()
    endpoints = db_session.query(models.Endpoint).filter_by(scan_id=42).all()
    intel_matches = db_session.query(models.IntelligenceMatch).filter_by(scan_id=42).all()
    findings = db_session.query(models.Finding).filter_by(scan_id=42).all()

    intel = build_consolidated_finding_intelligence(
        findings=findings,
        asset=assets[0] if assets else None,
        endpoints=endpoints,
        intel_matches=intel_matches,
        assets=assets,
    )
    cons_sec = intel["consolidated_security_findings"]
    assert len(cons_sec) == 17

    header_findings = [cf for cf in cons_sec if cf.get("header_policy_evaluation") is not None]
    assert len(header_findings) == 12, f"Expected 12 header control-gap findings in Scan #42, got {len(header_findings)}"

    for cf in header_findings:
        hpe = cf["header_policy_evaluation"]
        missing = hpe["missing_headers"]
        present = hpe["present_headers"]
        assert len(missing) >= 1
        # TrePath 2.6 Section 9A: No flat CVSS 5.5 across all missing-header findings
        assert float(cf["cvss_score"]) != 5.5, f"Finding {cf['finding_key']} must use context-calibrated CVSS, not flat 5.5"
        assert "Content-Security-Policy-Report-Only" in hpe["csp_compatibility_plan"]["stage_1_report_only_header"]
        # Specific remediation must list every missing header
        for mh in missing:
            assert mh in cf["remediation"], f"Missing header {mh} not included in remediation for {cf['finding_key']}"
        # Specific title must name the actual missing header(s) rather than generic boilerplate when <=3 headers are missing
        if len(missing) == 1:
            assert missing[0] in cf["title"], f"Single missing header {missing[0]} should be named in title: {cf['title']}"
        # If CSP is present and X-Frame-Options is missing, compensating control must be noted
        if "Content-Security-Policy" in present and "X-Frame-Options" in missing:
            assert len(hpe["compensating_controls"]) >= 1
            assert "CSP_FRAME_ANCESTORS_PARTIAL_COMPENSATION" in hpe["effective_posture"]

    # TrePath 2.6 Section 3 & 4: Target-Resolution Intelligence Layer & Per-Origin Authorization Matrix
    tri = intel["target_resolution_intelligence"]
    assert tri["total_submitted_urls"] >= 14
    type_dist = tri["target_type_distribution"]
    assert type_dist.get("REPOSITORY_URL", 0) >= 1
    assert type_dist.get("DOCUMENTATION_PAGE", 0) >= 1
    auth_mat = intel["per_origin_authorization_matrix"]
    assert len(auth_mat) == 14
    for am in auth_mat:
        assert am["passive_scanning_permitted"] is True
        assert am["exploitation_permitted"] is False
        assert am["post_exploitation_permitted"] is False


def test_03_scan_42_four_metric_sensor_coverage_and_port_transport_reconciliation(db_session):
    """Issue 1 & Issue 2 (P1): 4-Metric Sensor Coverage Model & 4-State Port/Transport Reconciliation."""
    risk_profile = compute_asset_risk_profile(db_session, 42)
    cov = risk_profile["four_tier_sensor_coverage"]

    assert cov["installed_coverage_pct"] == 100.0
    assert cov["installed_count"] == "6/6"
    assert cov["operational_coverage_pct"] == 83.3
    assert cov["operational_count"] == "5/6"
    assert cov["execution_coverage_pct"] == 66.7
    assert cov["executed_count"] == "4/6"
    assert cov["applicable_coverage_pct"] == 100.0
    assert cov["applicable_executed_count"] == "4/4"

    # P1 / Section 5: Granular 6-Sensor Execution Matrix
    for sm in cov["sensor_matrix"]:
        assert "version_or_policy" in sm
        assert "command_or_config" in sm
        assert "skip_or_failure_reason" in sm

    # P1 / Section 6: Mandatory Pre-Execution Sensor Readiness Gate
    gate = cov["pre_execution_readiness_gate"]
    assert gate["gate_id"] == "GATE-SENSOR-READINESS-2.6"
    assert len(gate["unavailable_or_held_sensors"]) >= 2
    sensor_names = [s["sensor"] for s in gate["unavailable_or_held_sensors"]]
    assert any("OpenVAS" in s for s in sensor_names)
    assert any("Safe PoC" in s for s in sensor_names)

    rep = build_orchestrator_report(db_session, 42)
    port_recon = rep["port_and_transport_reconciliation"]
    assert port_recon["raw_tcp_open_ports_count"] == 0
    assert port_recon["port_scan_execution_state"] == "SKIPPED_BY_WEB_ONLY_PROFILE"
    assert port_recon["application_transport_state"] == "HTTP_HTTPS_TRANSPORT_REACHABLE"
    assert port_recon["reachable_http_endpoints_count"] == 376
    assert 443 in port_recon["implicit_application_transport_ports"]

    # P1 / Section 7: AttackGraph 2.6 Causal Edge Filtering (no TLS-COMPLIANT in attack paths)
    prog = rep["five_stage_evidence_progression"]
    assert len(prog) == 5
    for st_p in prog:
        assert st_p["edge_evidence_state"] in CANONICAL_FOUR_EDGE_STATES
    ag_intel = rep["attack_graph_intelligence"]
    for sp in ag_intel["sanitized_paths"]:
        for st in sp["steps"]:
            assert "COMPLIANT" not in st["finding_key"].upper()
            assert st["edge_evidence_state"] in CANONICAL_FOUR_EDGE_STATES

    # P0 / Section 12: External Black-Box Targets must NEVER be mapped to server.ts:118
    for ufr in rep["unified_finding_registry"]:
        assert ufr["xtrike_sast"]["is_source_attached_lab"] is False
        assert ufr["xtrike_sast"]["vulnerable_file"] is None
        assert "External Black-Box Target" in ufr["provenance_separation"]["finding_source_code_location"]


def test_04_scan_42_four_track_score_separation_and_admin_taxonomy(db_session):
    """Issue 3 (P1) & Section 4/7: 4-Track Score Separation & 4-Level Admin Boundary Taxonomy."""
    rep = build_orchestrator_report(db_session, 42)
    cons_sec = rep["consolidated_security_findings"]

    obs_findings = [cf for cf in cons_sec if cf["proof_category"] == "OBSERVATION_CONFIRMED"]
    ctrl_findings = [cf for cf in cons_sec if cf["proof_category"] == "CONTROL_GAP_CONFIRMED"]
    assert len(obs_findings) == 5
    assert len(ctrl_findings) == 12

    for obs in obs_findings:
        tracks = obs["scoring_tracks"]
        assert tracks["vulnerability_cvss"] is None, f"Observation {obs['finding_key']} must not carry a vulnerability CVSS score"
        assert tracks["vulnerability_cvss_display"] == "N/A (Observation)"
        assert tracks["reconnaissance_intelligence_priority"] > 0.0
        assert obs["authorization_governance_tier"] == "ROE_SUBMITTED_PASSIVE_OBSERVATION_ONLY"

    for ctrl in ctrl_findings:
        tracks = ctrl["scoring_tracks"]
        assert tracks["vulnerability_cvss"] is not None and tracks["vulnerability_cvss"] > 0.0
        assert tracks["configuration_control_priority"] > 0.0


def test_05_scan_42_ed25519_signature_bundle_and_tamper_detection(db_session):
    """Issue 5 (P1) & Section 8 (P3): RFC 8032 Ed25519 Signature, UTC Timestamp Reconciliation & Detached Verification."""
    bundle = build_ed25519_signature_bundle(db_session, 42)
    assert bundle["signature_verification_result"] == "VERIFIED_AUTHENTIC"
    assert bundle["authentic_signature_verified"] is True
    assert len(bundle["canonical_manifest_sha256"]) == 64
    assert len(bundle["ed25519_signature_hex"]) == 128
    assert len(bundle["public_key_fingerprint_sha256"]) == 64
    assert "BEGIN PUBLIC KEY" in bundle["public_key_pem"]
    assert bundle["tamper_detection_self_test"]["executed"] is True
    assert bundle["tamper_detection_self_test"]["tampered_payload_rejected"] is True
    assert "PASSED" in bundle["tamper_detection_self_test"]["status"]

    # Section 8 (P3): Verify UTC Timestamp Reconciliation (0s drift, no +5h timezone offset bug)
    ts_recon = bundle["timestamp_reconciliation"]
    assert ts_recon["signing_vs_generation_drift_seconds"] == 0
    assert ts_recon["report_generated_utc"] == ts_recon["manifest_signed_utc"]
    assert bundle["trusted_timestamp_utc"] == ts_recon["manifest_signed_utc"]

    # Section 8 (P3): Verify Independent Public-Key Discovery & Detached Signature Verifier
    pubkey_disc = get_trusted_public_key_discovery_bundle()
    assert pubkey_disc["public_key_fingerprint_sha256"] == bundle["public_key_fingerprint_sha256"]
    assert pubkey_disc["well_known_discovery_uri"] == "/.well-known/trepath-evidencecore-pubkey.json"

    detached_ok = verify_detached_ed25519_bundle(
        canonical_manifest=bundle["canonical_manifest"],
        signature_hex=bundle["ed25519_signature_hex"],
        public_key_pem=pubkey_disc["public_key_pem"],
    )
    assert detached_ok["verified"] is True
    assert detached_ok["status"] == "INDEPENDENTLY_VERIFIED_AUTHENTIC"

    tampered_manifest = dict(bundle["canonical_manifest"])
    tampered_manifest["total_sealed_artifacts"] = -1
    detached_tampered = verify_detached_ed25519_bundle(
        canonical_manifest=tampered_manifest,
        signature_hex=bundle["ed25519_signature_hex"],
        public_key_pem=pubkey_disc["public_key_pem"],
    )
    assert detached_tampered["verified"] is False
    assert detached_tampered["status"] == "SIGNATURE_REJECTED"


def test_06_controlled_juice_shop_10_step_e2e_lifecycle_and_rtex_closure(db_session):
    """Sections 8–12: Complete 10-Step Controlled OWASP Juice Shop E2E Lifecycle (`T0 HIGH -> T1 LOW`)."""
    e2e = run_controlled_juice_shop_e2e_lab(db_session)
    assert e2e["status"] == "COMPLETED"
    assert len(e2e["lifecycle_steps_completed"]) == 10
    assert e2e["authorization_governance_tier"] == "LAB_OWNER_AUTHORIZED_ACTIVE_VALIDATION"

    t0 = e2e["t0_pre_remediation_risk"]
    t1 = e2e["t1_post_retest_risk"]
    assert t0["calibrated_score_10"] >= 7.5
    assert t1["calibrated_score_10"] <= 2.0
    assert t1["remediated_verified_count"] == 5
    assert t1["risk_reduction_delta_10"] < -5.0

    # Verify all 4 admin boundary levels were demonstrated
    levels = [item["level"] for item in e2e["admin_boundary_progression_demonstrated"]]
    assert levels == [
        "LEVEL_1_PUBLIC_PAGE_HTTP_200",
        "LEVEL_2_AUTHENTICATION_BOUNDARY",
        "LEVEL_3_AUTHENTICATED_ADMIN_SESSION",
        "LEVEL_4_VERIFIED_PRIVILEGED_ACTION",
    ]

    # Verify Unified Finding Registry (XTRIKE SAST + TrePath + Expedite Strike + RTEX + Noctis)
    ufr = e2e["unified_finding_registry"]
    assert len(ufr) == 5
    sast_files = {r["xtrike_sast"]["vulnerable_file"] for r in ufr}
    assert "routes/search.ts" in sast_files
    assert "routes/login.ts" in sast_files
    assert "server.ts" in sast_files
    for r in ufr:
        assert r["rtex_closure"]["security_closure_verified"] is True
        assert r["rtex_closure"]["functional_regression_passed"] is True
        assert r["noctis_intelligence"]["noctis_posture_state"] == "CLOSED_VERIFIED"
        assert len(r["evidence_sha256"]) == 64

    # Verify Ed25519 bundle on the E2E lab scan
    sig = e2e["ed25519_signature_bundle"]
    assert sig["signature_verification_result"] == "VERIFIED_AUTHENTIC"
    assert sig["tamper_detection_self_test"]["tampered_payload_rejected"] is True


def test_07_export_scan_42_and_juice_shop_e2e_pdfs_zero_version_drift(db_session):
    """Generate and verify PDF deliverables for Scan #45/#44/#42 (v2.6) and OWASP Juice Shop E2E Lab (v2.6)."""
    target_scan_id = (
        45
        if db_session.get(models.Scan, 45) is not None
        else (44 if db_session.get(models.Scan, 44) is not None else 42)
    )
    pdf_45 = generate_pdf_assessment_report(db_session, target_scan_id)
    assert pdf_45.startswith(b"%PDF-1.4")
    txt_45 = pdf_45.decode("latin-1", errors="ignore")
    assert "TREPATH 2.6 / EXPEDITE STRIKE / NOCTIS" in txt_45
    assert "TREPATH 2.1" not in txt_45
    assert "TREPATH 2.2" not in txt_45
    assert "TREPATH 2.3" not in txt_45
    assert "TREPATH 2.4" not in txt_45
    assert "TREPATH 2.5" not in txt_45
    assert "RiskEngine 2.1" not in txt_45
    assert "RiskEngine 2.2" not in txt_45
    assert "RiskEngine 2.4" not in txt_45
    assert "RiskEngine 2.5" not in txt_45
    # Section 12 (P0): External Black-Box Scan #45 must NEVER attribute findings to server.ts:118
    assert "server.ts:118" not in txt_45
    assert "External Black-Box" in txt_45
    assert "Target-Resolution Intelligence Layer" in txt_45
    assert "Per-Origin 4-Tier Authorization" in txt_45
    assert "Granular 6-Sensor Execution" in txt_45
    assert "VERIFIED_AUTHENTIC" in txt_45
    assert "/.well-known/trepath-evidencecore-pubkey.json" in txt_45

    # 2. Export Controlled OWASP Juice Shop E2E Closure PDF
    e2e = run_controlled_juice_shop_e2e_lab(db_session)
    js_scan_id = e2e["scan_id"]
    pdf_js = generate_pdf_assessment_report(db_session, js_scan_id)
    assert pdf_js.startswith(b"%PDF-1.4")
    txt_js = pdf_js.decode("latin-1", errors="ignore")
    assert "TREPATH 2.6 / EXPEDITE STRIKE / NOCTIS" in txt_js
    assert "routes/search.ts" in txt_js
    assert "routes/login.ts" in txt_js
    assert "VERIFIED_AUTHENTIC" in txt_js
    assert "Five-Stage Attack-Path Evidence Progression Matrix" in txt_js

    if ARTIFACT_DIR.exists():
        (ARTIFACT_DIR / "trepath-post-exploitation-report-scan-45-v2.6.pdf").write_bytes(pdf_45)
        (ARTIFACT_DIR / "trepath-juice-shop-e2e-closure-report-v2.6.pdf").write_bytes(pdf_js)
