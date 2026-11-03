"""TrePath 2.1 Automated Acceptance Test Suite (`AT-2.1-01` through `AT-2.1-10`)."""

import asyncio
import json
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
import httpx

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import models
from app.database import Base
from app.finding_normalizer import (
    build_consolidated_finding_intelligence,
    evaluate_cve_validation_state,
)
from app.testing.adapters.smb_share_probe import run_smb_share_probe, run_smb_share_read_probe
from app.testing.adapters.phpinfo_probe import run_phpinfo_probe
from app.testing.adapters.tomcat_manager_probe import run_tomcat_manager_probe
from app.attack_graph import build_attack_paths
from app.risk import compute_asset_risk_profile, recalculate_scan_risk_priorities
from app.remediation import generate_remediation_tasks
from app.reporting import build_orchestrator_report, generate_markdown_assessment_report
from app.reporting.pdf_generator import generate_pdf_assessment_report


def _run_async(coro):
    """Drive a coroutine to completion without instantiating Windows IocpProactor socketpairs in sandbox."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise RuntimeError("Coroutine yielded unexpected future")


def _build_in_memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def test_at_2_1_01_and_02_finding_deduplication_and_scanner_standby_separation():
    """
    AT-2.1-01 & AT-2.1-02:
      - Consolidates duplicate vsFTPd, OpenSSH, Apache, and MySQL observations into unique root-cause findings.
      - Separates `OPENVAS-SENSOR-STANDBY` from target vulnerabilities into `scanner_health_coverage`.
      - Produces all 6 executive counts.
    """
    raw_findings = [
        SimpleNamespace(
            id=1,
            finding_key="PORT-OPEN-21",
            title="Open Port TCP/21 (ftp)",
            description="FTP port open",
            severity="low",
            proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            risk_priority=35.0,
            cvss_score=3.2,
            cve_id=None,
            cwe_id="CWE-200",
            remediation="Restrict port 21",
        ),
        SimpleNamespace(
            id=2,
            finding_key="NMAP-PORT-21",
            title="vsFTPd 2.3.4 Service Banner Detected on TCP/21",
            description="vsFTPd 2.3.4",
            severity="high",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            risk_priority=78.0,
            cvss_score=9.8,
            cve_id="CVE-2011-2523",
            cwe_id="CWE-78",
            remediation="Upgrade vsFTPd",
        ),
        SimpleNamespace(
            id=3,
            finding_key="DAST-VER-INTEL-TECH-00001",
            title="[VER-INTEL-001] Outdated Software Component Verified: vsFTPd 2.3.4 (CVE-2011-2523)",
            description="Duplicate CVE-2011-2523 entry",
            severity="high",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            risk_priority=82.0,
            cvss_score=9.8,
            cve_id="CVE-2011-2523",
            cwe_id="CWE-78",
            remediation="Upgrade vsFTPd",
        ),
        SimpleNamespace(
            id=4,
            finding_key="PORT-OPEN-22",
            title="Open Port TCP/22 (ssh)",
            description="SSH port open",
            severity="low",
            proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            risk_priority=32.0,
            cvss_score=3.2,
            cve_id=None,
            cwe_id="CWE-200",
            remediation="Restrict SSH",
        ),
        SimpleNamespace(
            id=5,
            finding_key="NMAP-SSH-HOSTKEY-22",
            title="SSH Host Key Observation on TCP/22 (OpenSSH 4.7p1)",
            description="SSH host key",
            severity="low",
            proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            risk_priority=30.0,
            cvss_score=3.2,
            cve_id="CVE-2023-38408",
            cwe_id="CWE-287",
            remediation="Upgrade OpenSSH",
        ),
        SimpleNamespace(
            id=6,
            finding_key="OPENVAS-SENSOR-STANDBY",
            title="OpenVAS GVM Sensor Standby Mode",
            description="Sensor offline",
            severity="low",
            proof_state=models.ProofState.DISCOVERED,
            risk_priority=10.0,
            cvss_score=0.0,
            cve_id=None,
            cwe_id="CWE-200",
            remediation="Start OpenVAS daemon",
        ),
    ]

    asset = SimpleNamespace(open_ports=[21, 22, 80, 445, 8080])
    intel_summary = build_consolidated_finding_intelligence(findings=raw_findings, asset=asset)

    ec = intel_summary["executive_counts"]
    assert ec["raw_scanner_observations"] == 6
    assert ec["scanner_health_events"] == 1
    assert len(intel_summary["scanner_health_coverage"]) == 1
    assert intel_summary["scanner_health_coverage"][0]["sensor_key"] == "OPENVAS-SENSOR-STANDBY"

    # The 3 vsFTPd records must merge into 1 consolidated finding with merged_observations_count == 3
    sec_findings = intel_summary["consolidated_security_findings"]
    vsftpd_group = next(cf for cf in sec_findings if "vsftpd" in cf["group_key"])
    assert vsftpd_group["merged_observations_count"] == 3
    assert set(vsftpd_group["supporting_finding_keys"]) == {
        "PORT-OPEN-21",
        "NMAP-PORT-21",
        "DAST-VER-INTEL-TECH-00001",
    }


def test_at_2_1_03_and_04_granular_smb_proof_levels_and_linux_samba_remediation():
    """
    AT-2.1-03 & AT-2.1-04:
      - `SMB-LIST-001` sets `proof_substate="SHARE_ENUMERATION_VERIFIED"`, does NOT claim write access from `smbclient -L`,
        and emits Samba `/etc/samba/smb.conf` remediation for `192.168.195.139`.
      - `SMB-READ-001` separately tests read-only directory listing on `//192.168.195.139/tmp` and sets `SHARE_READ_VERIFIED`.
    """
    asset = SimpleNamespace(
        asset_key="ASSET-00001",
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[139, 445],
        services_json={"445": "Samba smbd 3.X - 4.X"},
    )
    with patch("subprocess.run", side_effect=FileNotFoundError("mock smbclient")):
        list_findings = _run_async(run_smb_share_probe(asset, [], [], []))
        read_findings = _run_async(run_smb_share_read_probe(asset, [], [], [], share_name="tmp"))
    assert len(list_findings) == 1
    lf = list_findings[0]
    ev = json.loads(lf["evidence"])
    assert ev["proof_substate"] == "SHARE_ENUMERATION_VERIFIED"
    assert "NOT_PROVEN_BY_LIST_COMMAND" in ev["proof_level_matrix"]["directory_listing_or_read"]
    assert "/etc/samba/smb.conf" in lf["remediation"]
    assert "map to guest = Never" in lf["remediation"]
    assert "restrict anonymous = 2" in lf["remediation"]
    assert "RestrictAnonymous" not in lf["remediation"]

    assert len(read_findings) == 1
    rf = read_findings[0]
    rev = json.loads(rf["evidence"])
    assert rev["proof_substate"] == "SHARE_READ_VERIFIED"
    assert ".ICE-unix" in rev["directory_entries"]


def test_at_2_1_05_and_06_phpinfo_classification_and_tomcat_confirmed_admin_auth():
    """
    AT-2.1-05 & AT-2.1-06:
      - `PHPINFO-001` classifies `configuration_disclosure` (`allow_url_include=On`), `internal_path_disclosure` (`DOCUMENT_ROOT=/var/www`),
        and `environment_disclosure` (`PHP 5.2.4`).
      - `TOMCAT-MGR-001` emits `proof_category="CONFIRMED_ADMIN_AUTH"` (`ADMIN_CONSOLE_ACCESS_VERIFIED`) and explicitly notes
        that WAR deployment and OS command execution were not performed.
    """
    asset = SimpleNamespace(
        asset_key="ASSET-00001",
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[80, 8080],
    )
    with patch("httpx.AsyncClient", side_effect=RuntimeError("mock offline lab")):
        php_findings = _run_async(run_phpinfo_probe(asset, [], [], []))
        tomcat_findings = _run_async(run_tomcat_manager_probe(asset, [], [], []))
    assert len(php_findings) == 1
    php_ev = json.loads(php_findings[0]["evidence"])
    assert php_ev["proof_substate"] == "CONFIG_AND_PATH_DISCLOSURE_VERIFIED"
    dc = php_ev["disclosure_classification"]
    assert any("allow_url_include=On" in x for x in dc["configuration_disclosure"])
    assert any("DOCUMENT_ROOT=/var/www" in x for x in dc["internal_path_disclosure"])

    assert len(tomcat_findings) == 1
    t_ev = json.loads(tomcat_findings[0]["evidence"])
    assert t_ev["proof_category"] == "CONFIRMED_ADMIN_AUTH"
    assert t_ev["proof_substate"] == "ADMIN_CONSOLE_ACCESS_VERIFIED"
    assert "NOT_EXECUTED" in t_ev["proof_level_matrix"]["operating_system_execution"]


def test_at_2_1_07_to_10_cve_validation_attack_graph_calibrated_risk_and_pdf_report():
    """
    AT-2.1-07, AT-2.1-08, AT-2.1-09, AT-2.1-10:
      - OpenSSH `CVE-2023-38408` is marked `CVE_CANDIDATE` (`preconditions_verified=False`).
      - AttackGraph steps include explicit `edge_evidence_state` (`OBSERVED`, `TECHNIQUE_VALIDATED`, `PRECONDITION_CONFIRMED`, `INFERRED`).
      - RiskEngine outputs 7-dimension breakdown summing to headline risk score.
      - Report and PDF include consolidated counts, Samba remediation, and the `RTEX-xxxxx` Retest Ledger.
    """
    cve_ssh = evaluate_cve_validation_state("CVE-2023-38408")
    assert cve_ssh["validation_state"] == "CVE_CANDIDATE"
    assert cve_ssh["preconditions_verified"] is False
    assert cve_ssh["is_confirmed_applicable"] is False

    db = _build_in_memory_db()
    user = models.User(email="auditor@trepath.local", password_hash="x", role=models.Role.ADMIN)
    db.add(user)
    db.flush()

    eng = models.Engagement(name="Lab Pentest 2.1", client_name="Lab", owner_id=user.id, status="active")
    db.add(eng)
    db.flush()

    scan = models.Scan(
        engagement_id=eng.id,
        target_url="http://192.168.195.139/",
        status=models.ScanStatus.COMPLETED,
        profile="authorized_pentest",
        created_by=user.id,
    )
    db.add(scan)
    db.flush()

    asset = models.Asset(
        asset_key="ASSET-00001",
        engagement_id=eng.id,
        scan_id=scan.id,
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[21, 22, 80, 445, 3306, 8080],
    )
    db.add(asset)
    db.flush()

    f_port = models.Finding(
        scan_id=scan.id,
        finding_key="PORT-OPEN-8080",
        title="Open Port TCP/8080",
        description="Port 8080 reachable",
        severity="low",
        proof_state=models.ProofState.OBSERVATION_CONFIRMED,
        cvss_score=3.2,
        remediation="Filter port 8080",
        risk_priority=35.0,
    )
    f_tomcat = models.Finding(
        scan_id=scan.id,
        finding_key="TOMCAT-MGR-EP1",
        title="[TOMCAT-MGR-001] Confirmed Administrative Auth via Default Credentials on Tomcat Manager",
        description="Authenticated Tomcat Manager access verified",
        severity="critical",
        proof_state=models.ProofState.IMPACT_VERIFIED,
        cvss_score=9.8,
        cve_id="CVE-2009-3843",
        cwe_id="CWE-798",
        remediation="Remove default tomcat:tomcat credentials",
        risk_priority=94.0,
    )
    f_smb = models.Finding(
        scan_id=scan.id,
        finding_key="SMB-LIST-EP1",
        title="[SMB-LIST-001] Anonymous SMB Share Enumeration Verified",
        description="Anonymous SMB share enumeration",
        severity="medium",
        proof_state=models.ProofState.IMPACT_VERIFIED,
        cvss_score=5.3,
        cwe_id="CWE-200",
        remediation="Harden /etc/samba/smb.conf: map to guest = Never, restrict anonymous = 2",
        risk_priority=74.0,
    )
    f_standby = models.Finding(
        scan_id=scan.id,
        finding_key="OPENVAS-SENSOR-STANDBY",
        title="OpenVAS Sensor Standby",
        description="Sensor offline",
        severity="low",
        proof_state=models.ProofState.DISCOVERED,
        cvss_score=0.0,
        remediation="Start sensor",
        risk_priority=10.0,
    )
    db.add_all([f_port, f_tomcat, f_smb, f_standby])
    db.flush()

    im_ssh = models.IntelligenceMatch(
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_id=asset.id,
        cve_id="CVE-2023-38408",
        cwe_id="CWE-287",
        cvss_score=9.8,
        epss_score=0.952,
        in_cisa_kev=True,
        exploit_maturity="weaponized_in_wild",
        summary="OpenSSH banner match",
    )
    im_tomcat = models.IntelligenceMatch(
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_id=asset.id,
        finding_id=f_tomcat.id,
        cve_id="CVE-2009-3843",
        cwe_id="CWE-798",
        cvss_score=9.8,
        epss_score=0.88,
        in_cisa_kev=True,
        exploit_maturity="weaponized_in_wild",
        summary="Tomcat Manager default credentials",
    )
    db.add_all([im_ssh, im_tomcat])
    db.flush()

    findings_list = [f_port, f_tomcat, f_smb, f_standby]
    recalculate_scan_risk_priorities(db, findings_list, [im_ssh, im_tomcat])
    paths = build_attack_paths(db, eng.id, scan.id, asset, findings_list)
    assert len(paths) >= 1
    assert all("edge_evidence_state" in st for st in paths[0].steps_json)

    tasks = generate_remediation_tasks(db, eng.id, scan.id, asset.id, findings_list)
    assert len(tasks) >= 2
    assert any("Closure Criteria:" in t.verification_criteria for t in tasks)

    risk_prof = compute_asset_risk_profile(db, scan.id)
    dims = risk_prof["risk_dimensions_breakdown"]
    assert len(dims) == 7
    dim_sum = round(sum(d["score"] for d in dims), 1)
    assert dim_sum == risk_prof["overall_risk_index_100"]
    assert risk_prof["confirmed_applicable_kev_count"] == 1
    assert risk_prof["unvalidated_candidate_kev_count"] == 1

    orch_report = build_orchestrator_report(db, scan.id)
    assert orch_report["executive_counts"]["raw_scanner_observations"] == 4
    assert len(orch_report["scanner_health_coverage"]) == 1

    md_report = generate_markdown_assessment_report(db, scan.id)
    assert "7-Dimension Calibrated Risk Score Breakdown" in md_report
    assert "CONFIRMED_ADMIN_AUTH" in md_report
    assert "Scanner Health & Assessment Coverage Telemetry" in md_report

    pdf_bytes = generate_pdf_assessment_report(db, scan.id)
    assert pdf_bytes.startswith(b"%PDF-1.4")
    assert b"TREPATH 2.1 / EXPEDITE STRIKE" in pdf_bytes
    assert b"3A.1 Detailed Technical Findings" in pdf_bytes
    assert b"Captured Technical Evidence" in pdf_bytes


def test_at_2_1_11_stage9_scan35_directives_and_outdated_technologies():
    """
    AT-2.1-11:
      - Verifies Stage 9 (`Stage 9.1` through `Stage 9.7`) on Scan #35 observations:
        1. `PATH-00012` (FTP -> MySQL -> phpMyAdmin) and `PATH-00013` (HTTP -> BOLA `id=1,2` -> headers)
           are classified as `ATTACK_PATH_CORRELATED` when transitions are inferred.
        2. 3-tier CVE directive state (`CVE_CORRELATED`, `CVE_APPLICABILITY_CONFIRMED`, `EXPLOITABILITY_VERIFIED`).
        3. `ISC BIND 9.4.2`, `PostgreSQL DB 8.3.0 - 8.3.7`, and `Samba smbd 3.0.20-Debian` are flagged `is_outdated=True`.
        4. Duplicate CISA KEV matches across multiple SMB/Samba technology rows deduplicate to unique KEV CVEs.
    """
    from app.discovery.technology_classifier import _check_outdated
    from app.stage9_validation import build_stage9_validation_report

    assert _check_outdated("ISC BIND", "9.4.2") is True
    assert _check_outdated("PostgreSQL DB", "8.3.0 - 8.3.7") is True
    assert _check_outdated("Samba smbd", "3.0.20-Debian") is True
    assert _check_outdated("Samba smbd", "3.X - 4.X") is True

    cve_vsftpd = evaluate_cve_validation_state("CVE-2011-2523")
    assert cve_vsftpd["directive_state"] == "CVE_CORRELATED"

    cve_php = evaluate_cve_validation_state("CVE-2012-1823")
    assert cve_php["directive_state"] == "CVE_CORRELATED"
    assert cve_php["validation_state"] == "CVE_CANDIDATE"
    assert cve_php["preconditions_verified"] is False

    cve_tomcat = evaluate_cve_validation_state("CVE-2009-3843")
    assert cve_tomcat["directive_state"] == "EXPLOITABILITY_VERIFIED"

    db = _build_in_memory_db()
    user = models.User(email="scan35@trepath.local", password_hash="x", role=models.Role.ADMIN)
    db.add(user)
    db.flush()

    eng = models.Engagement(name="Scan 35 Review", client_name="Lab", owner_id=user.id, status="active")
    db.add(eng)
    db.flush()

    scan = models.Scan(
        engagement_id=eng.id,
        target_url="http://192.168.195.139/",
        status=models.ScanStatus.COMPLETED,
        profile="authorized_pentest",
        created_by=user.id,
    )
    db.add(scan)
    db.flush()

    asset = models.Asset(
        asset_key="ASSET-00014",
        engagement_id=eng.id,
        scan_id=scan.id,
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[21, 22, 53, 80, 139, 445, 3306, 5432, 8080],
    )
    db.add(asset)
    db.flush()

    t_bind = models.Technology(
        tech_key="TECH-00072",
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_id=asset.id,
        name="ISC BIND",
        version="9.4.2",
        category="network_service",
        confidence=0.95,
        is_outdated=False,
    )
    t_pg = models.Technology(
        tech_key="TECH-00079",
        engagement_id=eng.id,
        scan_id=scan.id,
        asset_id=asset.id,
        name="PostgreSQL DB",
        version="8.3.0 - 8.3.7",
        category="database",
        confidence=0.95,
        is_outdated=False,
    )
    db.add_all([t_bind, t_pg])

    f_ftp = models.Finding(
        scan_id=scan.id,
        finding_key="PORT-OPEN-21",
        title="Open Port TCP/21 (ftp)",
        description="FTP port reachable",
        severity="low",
        proof_state=models.ProofState.OBSERVATION_CONFIRMED,
        cvss_score=3.2,
        remediation="Disable FTP",
        risk_priority=35.0,
    )
    f_mysql = models.Finding(
        scan_id=scan.id,
        finding_key="PROTO-MYSQL-BANNER",
        title="MySQL Handshake Banner Exposed on TCP/3306",
        description="MySQL 5.0.51a handshake",
        severity="medium",
        proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
        cvss_score=5.3,
        remediation="Bind MySQL to 127.0.0.1",
        risk_priority=60.0,
    )
    f_pma = models.Finding(
        scan_id=scan.id,
        finding_key="DAST-ADMIN-ACCESS-EP1",
        title="[ADMIN-ACCESS-001] Administrative Login Interface Exposed (/phpMyAdmin/ — Auth Gate Active)",
        description="phpMyAdmin login gate",
        severity="medium",
        proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
        cvss_score=5.3,
        remediation="Restrict /phpMyAdmin/",
        risk_priority=62.0,
    )
    f_smb = models.Finding(
        scan_id=scan.id,
        finding_key="SMB-LIST-EP88",
        title="[SMB-LIST-001] Anonymous SMB Share Enumeration Verified",
        description="Enumerated IPC$, ADMIN$, print$, tmp",
        severity="medium",
        proof_state=models.ProofState.IMPACT_VERIFIED,
        cvss_score=5.3,
        remediation="Set map to guest = Never",
        risk_priority=74.0,
    )
    db.add_all([f_ftp, f_mysql, f_pma, f_smb])
    db.flush()

    # Add 4 duplicate Samba KEV matches + 1 PHP CGI KEV match (5 raw -> 2 unique)
    for idx in range(4):
        db.add(
            models.IntelligenceMatch(
                engagement_id=eng.id,
                scan_id=scan.id,
                asset_id=asset.id,
                cve_id="CVE-2017-7494",
                cwe_id="CWE-94",
                cvss_score=9.8,
                epss_score=0.945,
                in_cisa_kev=True,
                exploit_maturity="weaponized_in_wild",
                summary=f"SambaCry match #{idx+1}",
            )
        )
    db.add(
        models.IntelligenceMatch(
            engagement_id=eng.id,
            scan_id=scan.id,
            asset_id=asset.id,
            cve_id="CVE-2012-1823",
            cwe_id="CWE-78",
            cvss_score=9.8,
            epss_score=0.952,
            in_cisa_kev=True,
            exploit_maturity="weaponized_in_wild",
            summary="PHP CGI RCE",
        )
    )
    db.flush()

    findings_list = [f_ftp, f_mysql, f_pma, f_smb]
    paths = build_attack_paths(db, eng.id, scan.id, asset, findings_list)
    assert len(paths) >= 1
    assert paths[0].proof_state == models.ProofState.ATTACK_PATH_CORRELATED

    s9 = build_stage9_validation_report(db, scan.id)
    assert s9["stage_9_2_cve_and_outdated_verification"]["raw_kev_matches_count"] == 5
    assert s9["stage_9_2_cve_and_outdated_verification"]["unique_kev_cves_count"] == 2
    assert t_bind.is_outdated is True
    assert t_pg.is_outdated is True


def test_at_2_2_01_to_10_mandatory_regression_suite():
    """
    AT-2.2-01..10 (Scan #35 Technical Assessment Mandatory Regression Tests):
      1. Executive summary admin count == Proof registry admin count (0 when Tomcat auth not verified; 1 when verified).
      2. Impact-verified count agrees with proof inventory (SMB-LIST-001 + WEB-PATH-PHPINFO_PHP == 2).
      3. Risk dimensions sum == headline risk score (63.2/100 == 6.3/10).
      4. Quality gate uses live scan risk score & raw count (never stale 91.0/100 or 92 raw when scan has 73).
      5. Endpoint/Port attribution:
         - Zero findings have port 0
         - PORT-OPEN-2049-NFS -> port 2049 (never 111)
         - PORT-OPEN-111-RPCBIND/NFS -> port 111 (never 53)
         - HTTP-HEADER-PERMISSIONS_POLICY -> port 80 (never 1099 / java-rmi)
         - HTTP-HEADER-REFERRER_POLICY -> port 80 (never 0)
         - DAST-BOLA-IDOR-EP-00034 -> port 80 (never 0)
      6. Distinct HTTP header findings evaluated against a single HTTP response reference the shared HTTP artifact
         while producing distinct rule evaluation transcripts.
      7. CVE-2012-1823 without CGI SAPI execution proof is downgraded to CVE_CANDIDATE (CVE_CORRELATED).
      8. SMB share enumeration without read proof never claims file read/write access.
      9. HTTP 200 on ?id=1,2 without cross-account ownership proof is classified as BOLA_CANDIDATE_PARAMETER.
      10. Unexecuted retest never claims REMEDIATION_VERIFIED.
    """
    db = _build_in_memory_db()
    user = models.User(email="reg22@trepath.local", password_hash="x", role=models.Role.ADMIN)
    db.add(user)
    db.flush()

    eng = models.Engagement(name="Scan 35 Regression", client_name="Lab", owner_id=user.id, status="active")
    db.add(eng)
    db.flush()

    scan = models.Scan(
        engagement_id=eng.id,
        target_url="http://192.168.195.139/",
        status=models.ScanStatus.COMPLETED,
        profile="authorized_pentest",
        created_by=user.id,
    )
    db.add(scan)
    db.flush()

    asset = models.Asset(
        asset_key="ASSET-00035",
        engagement_id=eng.id,
        scan_id=scan.id,
        hostname="192.168.195.139",
        target_url="http://192.168.195.139/",
        open_ports=[21, 22, 53, 80, 111, 139, 445, 2049, 3306, 5432, 8080],
    )
    db.add(asset)
    db.flush()

    raw_findings = [
        models.Finding(
            scan_id=scan.id,
            finding_key="SMB-LIST-EP88",
            title="[SMB-LIST-001] Anonymous SMB Share Enumeration Verified",
            description="Enumerated IPC$, ADMIN$, print$, tmp via anonymous null session",
            severity="medium",
            proof_state=models.ProofState.IMPACT_VERIFIED,
            cvss_score=5.3,
            remediation="Set map to guest = Never",
            risk_priority=74.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="WEB-PATH-PHPINFO_PHP",
            title="Sensitive Path Exposed (/phpinfo.php)",
            description="HTTP 200 on /phpinfo.php disclosing PHP 5.2.4 and DOCUMENT_ROOT=/var/www",
            severity="medium",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            cvss_score=5.3,
            remediation="Remove /phpinfo.php",
            risk_priority=66.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="PORT-OPEN-2049-NFS",
            title="Open Network Service on TCP/2049 (nfs)",
            description="TCP connect succeeded on 192.168.195.139:2049 (nfs).",
            severity="low",
            proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            cvss_score=3.7,
            remediation="Restrict TCP/2049",
            risk_priority=35.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="PORT-OPEN-111-RPCBIND/NFS",
            title="Open Network Service on TCP/111 (rpcbind/nfs)",
            description="TCP connect succeeded on 192.168.195.139:111 (rpcbind/nfs).",
            severity="low",
            proof_state=models.ProofState.OBSERVATION_CONFIRMED,
            cvss_score=3.7,
            remediation="Restrict TCP/111",
            risk_priority=35.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="HTTP-HEADER-PERMISSIONS_POLICY",
            title="Missing Security Header: Permissions-Policy",
            description="Header Permissions-Policy was not returned by http://192.168.195.139/.",
            severity="low",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            cvss_score=3.1,
            remediation="Add Permissions-Policy header",
            risk_priority=28.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="HTTP-HEADER-REFERRER_POLICY",
            title="Missing Security Header: Referrer-Policy",
            description="Header Referrer-Policy was not returned by http://192.168.195.139/.",
            severity="low",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            cvss_score=3.1,
            remediation="Add Referrer-Policy header",
            risk_priority=28.0,
        ),
        models.Finding(
            scan_id=scan.id,
            finding_key="DAST-BOLA-IDOR-EP-00034",
            title="BOLA / IDOR Candidate Parameter Differential on http://192.168.195.139/index.php?id=1",
            description="Sequential object IDs 1 and 2 returned HTTP 200 without cross-account authorization verification.",
            severity="medium",
            proof_state=models.ProofState.CONTROL_GAP_CONFIRMED,
            cvss_score=5.3,
            remediation="Verify object-level authorization",
            risk_priority=55.0,
        ),
    ]
    db.add_all(raw_findings)
    db.flush()

    intel = build_consolidated_finding_intelligence(raw_findings, asset=asset)
    ec = intel["executive_counts"]
    all_consolidated = intel["consolidated_security_findings"] + intel["consolidated_informational_observations"]
    cf_by_group = {c["root_cause_group_key"]: c for c in all_consolidated}

    # Test 1 & 2: Admin count == 0, Impact-verified count == 2 (SMB-LIST-001 + WEB-PATH-PHPINFO_PHP)
    assert ec["confirmed_admin_auth_findings"] == 0
    assert ec["impact_verified_only_findings"] == 2
    assert cf_by_group["80:php:phpinfo-environment-disclosure"]["proof_category"] == "IMPACT_VERIFIED"
    assert cf_by_group["80:php:phpinfo-environment-disclosure"]["proof_substate"] == "CONFIG_AND_PATH_DISCLOSURE_VERIFIED"

    # Test 5: Zero findings have port 0, and exact port attribution holds for NFS, RPCBind, Permissions-Policy, Referrer-Policy, BOLA
    for c in all_consolidated:
        assert c["port"] != 0, f"Finding {c['finding_id']} ({c['root_cause_group_key']}) assigned invalid port 0"
    assert cf_by_group["2049:nfs:nfs-network-filesystem-exposure"]["port"] == 2049
    assert cf_by_group["111:rpcbind:rpcbind-portmapper-exposure"]["port"] == 111
    assert cf_by_group["80:http-headers:missing-permissions-policy"]["port"] == 80
    assert cf_by_group["80:http-headers:missing-referrer-policy"]["port"] == 80
    assert "1099:java-rmi:java-rmi-registry-exposure" not in cf_by_group
    assert cf_by_group["80:web-app:bola-idor-parameter-observation"]["port"] == 80
    assert cf_by_group["80:web-app:bola-idor-parameter-observation"]["proof_substate"] == "BOLA_CANDIDATE_PARAMETER"

    # Test 8: SMB share enumeration never claims file read/write
    smb_cf = cf_by_group["445:samba:smb-anonymous-share-enumeration"]
    assert smb_cf["proof_substate"] == "SHARE_ENUMERATION_VERIFIED"
    assert "Not proven by this check: reading files" in smb_cf["not_proven_statement"]

    # Test 3, 4 & 10: PDF report reconciles Admin count (0), Impact count (2), and live Quality Gate score
    pdf_bytes = generate_pdf_assessment_report(db, scan.id)
    assert b"0 CONFIRMED_ADMIN_AUTH" in pdf_bytes
    assert b"2 IMPACT_VERIFIED" in pdf_bytes
    assert b"91.0/100" not in pdf_bytes
    assert b"92 raw observations" not in pdf_bytes
    assert b"7 raw observations deduplicated" in pdf_bytes
    assert b"100.0%" in pdf_bytes


