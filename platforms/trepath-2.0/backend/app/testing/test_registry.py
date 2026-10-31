"""Test Registry — Canonical catalog of security test definitions across all feature families."""

from __future__ import annotations

from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from .. import models


@dataclass(frozen=True)
class RegisteredTest:
    test_id: str
    name: str
    family: str
    target_feature: str
    risk_classification: str  # "read_only" | "safe_active" | "intrusive" | "destructive"
    adapter_name: str
    supported: bool = True
    requires_auth: bool = False
    applicable_asset_types: list[str] = field(default_factory=lambda: ["web_application", "https_web_application", "api_service", "hybrid_host_and_web"])
    description: str = ""


BUILTIN_TEST_CATALOG: list[RegisteredTest] = [
    # 1. Baseline HTTP & Web Reconnaissance
    RegisteredTest(
        test_id="HTTP-POSTURE-001",
        name="HTTP Security Header & Transport Policy Audit",
        family="Transport and HTTP Posture",
        target_feature="web_root",
        risk_classification="read_only",
        adapter_name="safe_dast",
        supported=True,
        requires_auth=False,
        description="Audits Content-Security-Policy, HSTS, X-Frame-Options, Referrer-Policy, and X-Content-Type-Options.",
    ),
    RegisteredTest(
        test_id="NET-RECON-001",
        name="1,000-Port High-Speed TCP Service & Banner Discovery",
        family="Network Service Reconnaissance",
        target_feature="network_host",
        risk_classification="read_only",
        adapter_name="port_discovery",
        supported=True,
        requires_auth=False,
        description="Discovers open TCP services and extracts initial socket banners.",
    ),
    # 2. The 8 Specification Feature-to-Family Mappings
    RegisteredTest(
        test_id="AUTH-SESSION-001",
        name="Login Page Authentication & Session Cookie Security Audit",
        family="Authentication and session security",
        target_feature="login_page",
        risk_classification="read_only",
        adapter_name="zap_scanner",
        supported=True,
        requires_auth=False,
        description="Evaluates login surfaces, session token flags (HttpOnly/Secure/SameSite), and cleartext credential exposure.",
    ),
    RegisteredTest(
        test_id="API-AUTHZ-001",
        name="API Endpoint Authorization & Schema Input Validation",
        family="API authorization and input validation",
        target_feature="api_endpoint",
        risk_classification="read_only",
        adapter_name="web_recon",
        supported=True,
        requires_auth=False,
        description="Verifies API endpoint authorization enforcement, CORS policy boundaries, and schema validation.",
    ),
    RegisteredTest(
        test_id="BOLA-IDOR-001",
        name="Object-Level Authorization (BOLA / IDOR) Boundary Check",
        family="Object-level authorization",
        target_feature="user_id_parameter",
        risk_classification="read_only",
        adapter_name="active_fuzzer",
        supported=True,
        requires_auth=False,
        description="Inspects object identifier parameters (id, user_id, account_id) for horizontal/vertical access control boundaries.",
    ),
    RegisteredTest(
        test_id="INJ-INPUT-001",
        name="Reflected Canary & SQL Syntax Error Boundary Probe",
        family="Injection and input-handling tests",
        target_feature="search_parameter",
        risk_classification="read_only",
        adapter_name="active_fuzzer",
        supported=True,
        requires_auth=False,
        description="Sends non-destructive canary tokens and syntax probes to search/query parameters to detect reflection or DBMS error leakage.",
    ),
    RegisteredTest(
        test_id="FILE-UPLOAD-001",
        name="Multipart File Upload Content-Type & Extension Boundary Verification",
        family="File validation and upload security",
        target_feature="file_upload",
        risk_classification="read_only",
        adapter_name="zap_scanner",
        supported=True,
        requires_auth=False,
        description="Audits file upload endpoints for MIME validation, path traversal, and executable upload restrictions.",
    ),
    RegisteredTest(
        test_id="ADMIN-ACCESS-001",
        name="Administrative Interface Access-Control & Privilege-Boundary Audit",
        family="Access-control and privilege-boundary tests",
        target_feature="admin_interface",
        risk_classification="read_only",
        adapter_name="web_recon",
        supported=True,
        requires_auth=False,
        description="Verifies authentication gates and exposure on administrative consoles (/admin, :8080/manager, /phpmyadmin).",
    ),
    RegisteredTest(
        test_id="TLS-CERT-001",
        name="TLS Handshake, Certificate Chain & Cipher Suite Compliance Audit",
        family="TLS and certificate assessment",
        target_feature="https_service",
        risk_classification="read_only",
        adapter_name="ssl_auditor",
        supported=True,
        requires_auth=False,
        applicable_asset_types=["https_web_application", "hybrid_host_and_web", "web_application"],
        description="Validates TLS protocol versions, forward secrecy ciphers, and X.509 certificate validity against PCI-DSS 4.0.",
    ),
    RegisteredTest(
        test_id="VER-INTEL-001",
        name="Outdated Software Banner CVE & Template Verification",
        family="Version intelligence and verification",
        target_feature="outdated_software_banner",
        risk_classification="read_only",
        adapter_name="nuclei_scanner",
        supported=True,
        requires_auth=False,
        description="Correlates fingerprinted software versions with Nmap NSE and Nuclei CVE verification templates.",
    ),
    RegisteredTest(
        test_id="INFRA-NVT-001",
        name="Deep Nmap NSE & OpenVAS Infrastructure Vulnerability Inspection",
        family="Infrastructure and Service Vulnerability Assessment",
        target_feature="network_host",
        risk_classification="read_only",
        adapter_name="nmap_scanner",
        supported=True,
        requires_auth=False,
        description="Runs Nmap service/script inspection and OpenVAS GMP network vulnerability checks.",
    ),
    # 3. High-Risk / Intrusive & Unsupported Tests (for deterministic ROE blocking & unsupported verification)
    RegisteredTest(
        test_id="EXPLOIT-DESTRUCTIVE-001",
        name="Active Memory Corruption & Denial-of-Service Stress Payload",
        family="Destructive Exploitation",
        target_feature="network_host",
        risk_classification="destructive",
        adapter_name="exploit_runner",
        supported=True,
        requires_auth=False,
        description="High-risk destructive payload prohibited under read_only or safe_active Rules of Engagement.",
    ),
    RegisteredTest(
        test_id="CLOUD-K8S-EBFP-001",
        name="Kernel eBPF Container Escape Runtime Probe",
        family="Container Runtime Escape",
        target_feature="network_host",
        risk_classification="read_only",
        adapter_name="ebpf_agent",
        supported=False,
        requires_auth=True,
        description="Requires an in-cluster eBPF kernel sensor not supported by remote network orchestrator.",
    ),
    # 4. Safe Lab PoC Exploitation & Post-Exploitation Verification Adapters
    RegisteredTest(
        test_id="SMB-LIST-001",
        name="Anonymous SMB Share Enumeration & Null-Session Verification",
        family="Safe Lab PoC Exploitation & Post-Exploitation",
        target_feature="network_host",
        risk_classification="safe_active",
        adapter_name="smb_share_probe",
        supported=True,
        requires_auth=False,
        description="Enumerates publicly readable SMB shares (IPC$, ADMIN$, C$) over ports 139/445 without modifying state.",
    ),
    RegisteredTest(
        test_id="PHPINFO-001",
        name="Exposed phpinfo.php Environment & Runtime Directive Extraction",
        family="Safe Lab PoC Exploitation & Post-Exploitation",
        target_feature="web_root",
        risk_classification="safe_active",
        adapter_name="phpinfo_probe",
        supported=True,
        requires_auth=False,
        description="Retrieves /phpinfo.php and verifies post-exploitation extraction of PHP directives and DOCUMENT_ROOT.",
    ),
    RegisteredTest(
        test_id="TOMCAT-MGR-001",
        name="Apache Tomcat Manager Console & Default Credential Verification",
        family="Safe Lab PoC Exploitation & Post-Exploitation",
        target_feature="admin_interface",
        risk_classification="safe_active",
        adapter_name="tomcat_manager_probe",
        supported=True,
        requires_auth=False,
        description="Probes /manager/html on port 8080 and verifies read-only administrative access.",
    ),
]


def sync_test_registry(db: Session) -> list[models.TestDefinition]:
    """Ensure all BUILTIN_TEST_CATALOG entries exist in the test_definitions table."""
    records: list[models.TestDefinition] = []
    for item in BUILTIN_TEST_CATALOG:
        existing = db.query(models.TestDefinition).filter_by(test_id=item.test_id).first()
        if existing:
            records.append(existing)
            continue
        rec = models.TestDefinition(
            test_id=item.test_id,
            name=item.name,
            family=item.family,
            target_feature=item.target_feature,
            risk_classification=item.risk_classification,
            adapter_name=item.adapter_name,
            supported=item.supported,
            requires_auth=item.requires_auth,
            applicable_asset_types=item.applicable_asset_types,
            description=item.description,
        )
        db.add(rec)
        db.flush()
        records.append(rec)
    return records
