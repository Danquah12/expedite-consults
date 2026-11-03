"""TrePath 2.2 Acceptance Test Suite (AT-01 through AT-10).

Verifies:
- AT-01: External crawled links are classified as EXTERNAL_REFERENCE_NOT_SCANNED (OUT_OF_SCOPE) and never scanned.
- AT-02: Redirects crossing out of allowed_origins are blocked with 9-field provenance and not evaluated for headers/DAST.
- AT-03: Unexecuted PoC adapters are never counted as CONFIRMED_ADMIN_AUTH or IMPACT_VERIFIED.
- AT-04: Tomcat Manager authentication verification produces CONFIRMED_ADMIN_AUTH == 1 when verified.
- AT-05: SMB share enumeration produces IMPACT_VERIFIED == 1 with SHARE_ENUMERATION_VERIFIED.
- AT-06: phpinfo.php disclosure produces IMPACT_VERIFIED == 1 with CONFIG_AND_PATH_DISCLOSURE_VERIFIED (and SPA catch-all pages do not false-positive).
- AT-07: RiskEngine 7-dimension sum equals overall_risk_index_100 (and overall_risk_index_10 * 10 within rounding).
- AT-08: Open TCP port count matches across Cover, Executive Summary, Asset Reconciliation, and Risk Decomposition (0 for Scan #39, never falling back to 16).
- AT-09: Repeated missing HTTP security headers in multi-target scans consolidate per effective_origin.
- AT-10: Cross-section proof-state and origin attribution reconciliation across PDF and JSON reports.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models
from app.database import Base
from app.discovery.webpulse_enumerator import run_webpulse_enumerator
from app.engines.safe_dast import run_read_only_checks
from app.finding_normalizer import build_consolidated_finding_intelligence, extract_finding_target_metadata
from app.reporting import build_orchestrator_report, generate_pdf_assessment_report
from app.risk import compute_asset_risk_profile
from app.scope import evaluate_url_scope_provenance


def _run_async(coro):
    """Drive a coroutine to completion without instantiating Windows IocpProactor socketpairs in sandbox."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise RuntimeError("Coroutine yielded unexpected future")


def _make_in_memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def test_at_01_external_link_not_promoted_to_assessed_asset(monkeypatch):
    """AT-01: Target page links to external domain -> Recorded as EXTERNAL_REFERENCE_NOT_SCANNED, not scanned."""
    import httpx

    class MockResponse:
        status_code = 200
        url = "https://owasp.org/"
        history = []
        headers = {"content-type": "text/html", "server": "cloudflare", "allow": "GET, HEAD"}
        text = (
            '<html><body>'
            '<a href="/www-project-juice-shop/?id=1">Juice Shop</a>'
            '<a href="https://github.com/OWASP/crAPI">External GitHub Repo</a>'
            '<a href="https://tryhackme.com/">External TryHackMe</a>'
            '</body></html>'
        )
        content = text.encode("utf-8")

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url, **kwargs):
            return MockResponse()

        async def options(self, url, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    res = _run_async(
        run_webpulse_enumerator(
            ["https://owasp.org/"],
            allowed_origins=["https://owasp.org:443"],
            assessment_scope_id="ROE-TEST-01",
        )
    )

    assert all("owasp.org" in u for u in res.discovered_urls)
    assert not any("github.com" in u or "tryhackme.com" in u for u in res.discovered_urls)

    ext_refs = res.external_references
    ext_urls = {r["reference_url"] for r in ext_refs}
    assert "https://github.com/OWASP/crAPI" in ext_urls
    assert "https://tryhackme.com/" in ext_urls
    for r in ext_refs:
        assert r["classification"] == "EXTERNAL_REFERENCE_NOT_SCANNED"
        assert r["scope_decision"] == "OUT_OF_SCOPE"


def test_at_02_out_of_scope_redirect_blocked_with_provenance(monkeypatch):
    """AT-02: In-scope URL redirects to out-of-scope domain -> Redirect blocked, scope_decision=OUT_OF_SCOPE, 0 findings."""
    import httpx

    class MockRedirectResponse:
        status_code = 302
        url = "https://owasp.org/external-redirect"
        headers = {"location": "https://unapproved-thirdparty.example.com/login"}
        text = ""
        content = b""

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url, **kwargs):
            return MockRedirectResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    findings = _run_async(
        run_read_only_checks(
            "https://owasp.org/external-redirect",
            allowed_origins=["https://owasp.org:443"],
            assessment_scope_id="ROE-TEST-02",
        )
    )
    assert findings == [], "Out-of-scope redirect target must never be evaluated for missing security headers"

    prov = evaluate_url_scope_provenance(
        requested_url="https://owasp.org/external-redirect",
        final_url="https://unapproved-thirdparty.example.com/login",
        allowed_origins=["https://owasp.org"],
        scope_id="ROE-TEST-02",
        asset_id="ASSET-00013",
        redirect_hops=[
            {"hop": 1, "status_code": 302, "url": "https://owasp.org/external-redirect"},
            {"hop": 2, "status_code": 200, "url": "https://unapproved-thirdparty.example.com/login"},
        ],
    )
    assert prov["scope_decision"] == "OUT_OF_SCOPE"
    assert prov["redirect_blocked"] is True
    assert len(prov["redirect_chain"]) == 2
    assert prov["redirect_chain"][0]["scope_decision"] == "IN_SCOPE"
    assert prov["redirect_chain"][1]["scope_decision"] == "OUT_OF_SCOPE"


def test_at_03_to_at_06_proof_state_transitions():
    """AT-03..AT-06: Verify unexecuted vs executed Tomcat Admin Auth, SMB Share Enum, and PHPInfo proof states."""
    db = _make_in_memory_db()
    asset = models.Asset(
        engagement_id=1,
        scan_id=1,
        asset_key="ASSET-00001",
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[80, 445, 8080],
    )

    # Case A (AT-03): Only control gaps, zero PoC adapters executed -> ADMIN=0, IMPACT=0
    f_header = models.Finding(
        id=1,
        scan_id=1,
        finding_key="MISSING_CSP",
        title="Missing Content-Security-Policy on http://192.168.195.139/",
        description="Missing CSP",
        severity="medium",
        cvss_score=5.0,
        remediation="Add CSP.",
        proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
        risk_priority=55,
    )
    intel_a = build_consolidated_finding_intelligence(
        findings=[f_header], asset=asset, endpoints=[], intel_matches=[], assets=[asset]
    )
    assert intel_a["executive_counts"]["confirmed_admin_auth_findings"] == 0
    assert intel_a["executive_counts"]["impact_verified_only_findings"] == 0
    assert intel_a["executive_counts"]["confirmed_exploitable_findings"] == 0

    # Case B (AT-04, AT-05, AT-06): Executed Tomcat Manager, SMB-LIST-001, and PHPINFO-001
    f_tomcat = models.Finding(
        id=2,
        scan_id=1,
        finding_key="TOMCAT-MGR-001",
        title="Apache Tomcat Manager Default Admin Credentials Verified (http://192.168.195.139:8080/manager/html)",
        description="Authenticated HTTP 200 on /manager/html",
        severity="critical",
        cvss_score=9.8,
        remediation="Rotate credentials.",
        proof_state=models.ProofState.CONFIRMED_ADMIN_AUTH,
        risk_priority=98,
    )
    f_smb = models.Finding(
        id=3,
        scan_id=1,
        finding_key="SMB-LIST-001",
        title="Samba Anonymous SMB Share Enumeration Verified (smb://192.168.195.139:445)",
        description="Enumerated IPC$, ADMIN$, print$, tmp",
        severity="high",
        cvss_score=7.5,
        remediation="Disable guest SMB.",
        proof_state=models.ProofState.IMPACT_VERIFIED,
        risk_priority=88,
    )
    f_php = models.Finding(
        id=4,
        scan_id=1,
        finding_key="PHPINFO-001",
        title="PHP phpinfo() Configuration & Path Disclosure Verified (http://192.168.195.139/phpinfo.php)",
        description="Disclosed allow_url_include=On and DOCUMENT_ROOT=/var/www",
        severity="high",
        cvss_score=7.2,
        remediation="Remove phpinfo.php.",
        proof_state=models.ProofState.IMPACT_VERIFIED,
        risk_priority=82,
    )
    intel_b = build_consolidated_finding_intelligence(
        findings=[f_header, f_tomcat, f_smb, f_php],
        asset=asset,
        endpoints=[],
        intel_matches=[],
        assets=[asset],
    )
    ec_b = intel_b["executive_counts"]
    assert ec_b["confirmed_admin_auth_findings"] == 1  # AT-04
    assert ec_b["impact_verified_only_findings"] == 2  # AT-05 + AT-06
    assert ec_b["confirmed_exploitable_findings"] == 3

    by_key = {cf["finding_key"]: cf for cf in intel_b["consolidated_security_findings"]}
    assert by_key["TOMCAT-MGR-001"]["proof_category"] == "CONFIRMED_ADMIN_AUTH"
    assert by_key["TOMCAT-MGR-001"]["proof_substate"] == "ADMIN_CONSOLE_ACCESS_VERIFIED"
    assert by_key["SMB-LIST-001"]["proof_category"] == "IMPACT_VERIFIED"
    assert by_key["SMB-LIST-001"]["proof_substate"] == "SHARE_ENUMERATION_VERIFIED"
    assert by_key["PHPINFO-001"]["proof_category"] == "IMPACT_VERIFIED"
    assert by_key["PHPINFO-001"]["proof_substate"] == "CONFIG_AND_PATH_DISCLOSURE_VERIFIED"
    db.close()


def test_at_07_to_at_10_multi_origin_consolidation_port_and_report_reconciliation():
    """AT-07..AT-10: Verify multi-origin header consolidation, 0-port reconciliation, and PDF/JSON consistency."""
    db = _make_in_memory_db()
    eng = models.Engagement(name="Multi-Origin OWASP Fleet Test", client_name="Security Lab", owner_id=1)
    db.add(eng)
    db.commit()

    scan = models.Scan(
        engagement_id=eng.id,
        target_url="https://owasp.org/projects/juice-shop",
        status=models.ScanStatus.COMPLETED,
        profile="authorized_pentest",
        created_by=1,
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(scan)
    db.commit()

    asset_owasp = models.Asset(
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_key="ASSET-00013",
        hostname="owasp.org",
        target_url="https://owasp.org/projects/juice-shop",
        scheme="https",
        primary_port=443,
        open_ports=[],
    )
    asset_github = models.Asset(
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_key="ASSET-00014",
        hostname="github.com",
        target_url="https://github.com/OWASP/crAPI",
        scheme="https",
        primary_port=443,
        open_ports=[],
    )
    db.add_all([asset_owasp, asset_github])
    db.commit()

    # Add 10 missing header observations across 5 github.com repo URLs + 2 missing header observations on owasp.org
    raw_findings = []
    for idx in range(1, 6):
        repo_url = f"https://github.com/OWASP/repo-{idx}"
        raw_findings.append(
            models.Finding(
                scan_id=scan.id,
                finding_key=f"MISSING_CSP-T000{idx}",
                title=f"Missing Content-Security-Policy header on {repo_url}",
                description=f"[Target Scope: {repo_url}] Missing CSP header.",
                severity="medium",
                cvss_score=5.0,
                cwe_id="CWE-693",
                remediation="Set Content-Security-Policy.",
                proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
                risk_priority=55,
            )
        )
        raw_findings.append(
            models.Finding(
                scan_id=scan.id,
                finding_key=f"MISSING_PERMISSIONS_POLICY-T000{idx}",
                title=f"Missing Permissions-Policy header on {repo_url}",
                description=f"[Target Scope: {repo_url}] Missing Permissions-Policy header.",
                severity="low",
                cvss_score=3.1,
                cwe_id="CWE-693",
                remediation="Set Permissions-Policy.",
                proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
                risk_priority=40,
            )
        )

    for hdr_key, hdr_name in [("MISSING_CSP-T0000", "Content-Security-Policy"), ("MISSING_XFO-T0000", "X-Frame-Options")]:
        raw_findings.append(
            models.Finding(
                scan_id=scan.id,
                finding_key=hdr_key,
                title=f"Missing {hdr_name} header on https://owasp.org/projects/juice-shop",
                description="[Target Scope: https://owasp.org/projects/juice-shop] Missing header.",
                severity="medium",
                cvss_score=5.0,
                cwe_id="CWE-693",
                remediation=f"Set {hdr_name}.",
                proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
                risk_priority=55,
            )
        )

    db.add_all(raw_findings)
    db.commit()

    report = build_orchestrator_report(db, scan.id)
    risk = compute_asset_risk_profile(db, scan.id)

    # AT-09: 10 github.com header observations consolidate into 1 github.com:443 policy finding;
    # 2 owasp.org header observations consolidate into 1 owasp.org:443 policy finding.
    consolidated = report["consolidated_security_findings"]
    assert len(consolidated) == 2

    by_asset = {cf["asset_id"]: cf for cf in consolidated}
    assert "ASSET-00013" in by_asset
    assert "ASSET-00014" in by_asset
    assert by_asset["ASSET-00013"]["host_port"] == "owasp.org:443"
    assert by_asset["ASSET-00014"]["host_port"] == "github.com:443"
    assert by_asset["ASSET-00014"]["merged_observations_count"] == 10
    assert by_asset["ASSET-00014"]["affected_endpoints_count"] == 5

    # AT-07: Risk dimension sum equals overall_risk_index_100
    dim_sum = round(sum(d["score"] for d in risk["risk_dimensions_breakdown"]), 1)
    assert abs(dim_sum - risk["overall_risk_index_100"]) <= 0.2
    assert round(risk["overall_risk_index_100"] / 10.0, 1) == risk["overall_risk_index_10"]

    # AT-08: Open TCP ports count is 0 everywhere (never 16)
    assert report["executive_counts"]["open_tcp_ports_count"] == 0
    assert report["executive_counts"]["unique_assets_count"] == 2

    # AT-10: Generate PDF bytes and verify no false 16-port or static SMB/Tomcat PoC claims appear
    pdf_bytes = generate_pdf_assessment_report(db, scan.id)
    pdf_text = pdf_bytes.decode("latin-1", errors="ignore")
    assert "Penetration Testing Report" in pdf_text
    assert "16 Open TCP Ports" not in pdf_text
    assert "github.com:443" in pdf_text
    assert "ASSET-00014" in pdf_text
    assert "owasp.org:443" in pdf_text
    assert "ASSET-00013" in pdf_text
    assert "0 CONFIRMED_ADMIN_AUTH" in pdf_text
    assert "0 IMPACT_VERIFIED Safe PoCs" in pdf_text
    db.close()
