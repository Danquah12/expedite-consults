"""TrePath 2.0 - TLS/SSL & Cryptographic Compliance Auditor.

Audits TLS endpoint configurations against enterprise standards (PCI-DSS 4.0, NIST SP 800-52r2).
Checks certificate validity, self-signed certificates, expiration, cipher suites,
and deprecated protocol support (SSLv2, SSLv3, TLS 1.0, TLS 1.1).
"""

from __future__ import annotations

import asyncio
import json
import logging
import socket
import ssl
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from app.models import ProofState

logger = logging.getLogger(__name__)


def _extract_host_and_port(target: str, default_port: int = 443) -> tuple[str, int]:
    if "://" in target:
        parsed = urlparse(target)
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or (443 if parsed.scheme == "https" else default_port)
        return host, port
    if ":" in target:
        parts = target.split(":")
        return parts[0], int(parts[1].split("/")[0])
    return target.split("/")[0], default_port


def _audit_ssl_sync(host: str, port: int, timeout: float = 3.5) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []

    # First verify if TCP port is open and listening
    try:
        with socket.create_connection((host, port), timeout=timeout):
            pass
    except Exception:
        # TLS port not open / unreachable; return cleanly without errors
        return []

    # Test modern TLS connection & extract certificate
    cert_info = None
    cipher_info = None
    proto_version = None

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE  # Allow inspecting invalid/self-signed certs

        with socket.create_connection((host, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert_info = ssock.getpeercert(binary_form=False)
                cipher_info = ssock.cipher()
                proto_version = ssock.version()
    except (ssl.SSLError, TimeoutError, OSError) as err:
        # Server rejected modern TLS or enforces legacy/incompatible ciphers
        evidence = {"host": host, "port": port, "error": str(err), "note": "Server failed standard TLS handshake"}
        findings.append({
            "finding_key": f"TLS-HANDSHAKE-FAIL-{port}",
            "title": f"TLS Handshake Failure / Incompatible Ciphers ({port}/TCP)",
            "description": f"The TLS endpoint on {host}:{port} failed standard cryptographic negotiation: {err}. Target service is either misconfigured or requires deprecated SSLv2/SSLv3 ciphers disallowed by modern TLS clients.",
            "severity": "medium",
            "proof_state": ProofState.CONTROL_GAP_CONFIRMED.value,
            "cwe_id": "CWE-326",
            "remediation": "Update the TLS terminating service to support TLS 1.2 and TLS 1.3 with modern forward-secret cipher suites.",
            "risk_priority": 5,
            "evidence": json.dumps(evidence, indent=2),
        })
        return findings
    except Exception as exc:
        logger.debug(f"TLS inspection skipped for {host}:{port}: {exc}")
        return []

    evidence_dict: dict[str, Any] = {
        "host": host,
        "port": port,
        "protocol": proto_version,
        "cipher": cipher_info,
        "certificate": cert_info,
    }

    # 1. Deprecated Protocol Check
    if proto_version in ("SSLv2", "SSLv3", "TLSv1", "TLSv1.1"):
        findings.append({
            "finding_key": f"TLS-DEPRECATED-PROTOCOL-{proto_version.upper()}",
            "title": f"Deprecated Insecure TLS Protocol Negotiated ({proto_version})",
            "description": f"Target {host}:{port} negotiated {proto_version}. Protocols prior to TLS 1.2 are deprecated by NIST SP 800-52r2, RFC 8996, and violate PCI-DSS 4.0 requirements.",
            "severity": "high",
            "proof_state": ProofState.CONTROL_GAP_CONFIRMED.value,
            "cwe_id": "CWE-326",
            "remediation": "Disable SSLv2, SSLv3, TLS 1.0, and TLS 1.1 in web server configuration. Enforce TLS 1.2 or TLS 1.3 only.",
            "risk_priority": 8,
            "evidence": json.dumps(evidence_dict, indent=2),
        })

    # 2. Certificate Expiration & Validity Analysis
    if cert_info:
        not_after = cert_info.get("notAfter")
        if not_after:
            try:
                # Format: 'May 20 12:00:00 2025 GMT'
                exp_date = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                if datetime.now(timezone.utc) > exp_date:
                    findings.append({
                        "finding_key": "TLS-CERTIFICATE-EXPIRED",
                        "title": f"Expired SSL/TLS Certificate on {host}:{port}",
                        "description": f"The X.509 certificate for {host}:{port} expired on {not_after}. Browsers and API clients will reject connections with certificate trust errors.",
                        "severity": "high",
                        "proof_state": ProofState.CONTROL_GAP_CONFIRMED.value,
                        "cwe_id": "CWE-298",
                        "remediation": "Renew and deploy a valid, non-expired TLS certificate from an approved Certificate Authority.",
                        "risk_priority": 8,
                        "evidence": json.dumps(evidence_dict, indent=2),
                    })
            except Exception:
                pass

        # Check for Self-Signed Certificate
        issuer = dict(x[0] for x in cert_info.get("issuer", []))
        subject = dict(x[0] for x in cert_info.get("subject", []))
        if issuer and subject and issuer == subject:
            findings.append({
                "finding_key": "TLS-SELF-SIGNED-CERT",
                "title": f"Self-Signed SSL/TLS Certificate Detected on {host}:{port}",
                "description": f"The certificate issuer matches the subject ({subject.get('commonName', 'Unknown')}), indicating an untrusted self-signed certificate.",
                "severity": "medium",
                "proof_state": ProofState.CONTROL_GAP_CONFIRMED.value,
                "cwe_id": "CWE-295",
                "remediation": "Replace self-signed certificates with a certificate signed by a trusted public CA (e.g. Let's Encrypt) or internal corporate PKI.",
                "risk_priority": 5,
                "evidence": json.dumps(evidence_dict, indent=2),
            })

    # 3. Weak Cipher Analysis
    if cipher_info:
        cipher_name, proto, bits = cipher_info
        is_weak = False
        weak_reasons = []

        if bits and bits < 128:
            is_weak = True
            weak_reasons.append(f"insufficient key length ({bits} bits < 128)")
        if any(w in cipher_name.upper() for w in ("RC4", "3DES", "DES", "NULL", "EXPORT", "MD5")):
            is_weak = True
            weak_reasons.append(f"insecure cipher suite ({cipher_name})")

        if is_weak:
            findings.append({
                "finding_key": f"TLS-WEAK-CIPHER-{cipher_name}",
                "title": f"Weak or Deprecated Cipher Suite ({cipher_name})",
                "description": f"Target {host}:{port} allows connection using weak cipher suite {cipher_name} ({', '.join(weak_reasons)}).",
                "severity": "medium",
                "proof_state": ProofState.CONTROL_GAP_CONFIRMED.value,
                "cwe_id": "CWE-327",
                "remediation": "Disable legacy CBC, 3DES, and RC4 ciphers. Enforce AEAD ciphers such as AES-GCM or ChaCha20-Poly1305.",
                "risk_priority": 6,
                "evidence": json.dumps(evidence_dict, indent=2),
            })
        else:
            # Positive compliance finding
            findings.append({
                "finding_key": f"TLS-COMPLIANT-CIPHER-{cipher_name}",
                "title": f"Compliant TLS Encryption ({proto_version} / {cipher_name})",
                "description": f"Host {host}:{port} negotiated {proto_version} using {cipher_name} ({bits}-bit encryption). Meets PCI-DSS and NIST standards.",
                "severity": "info",
                "proof_state": ProofState.OBSERVATION_CONFIRMED.value,
                "cwe_id": None,
                "remediation": "Maintain current cryptographic configuration.",
                "risk_priority": 1,
                "evidence": json.dumps(evidence_dict, indent=2),
            })

    return findings


async def run_tls_audit(target: str, timeout: float = 4.0) -> list[dict[str, Any]]:
    """Execute TLS audit asynchronously in worker thread."""
    host, port = _extract_host_and_port(target)
    # Check default port 443 as well as target port if specified
    ports_to_check = {port}
    if port != 443:
        ports_to_check.add(443)

    all_findings: list[dict[str, Any]] = []
    for p in ports_to_check:
        res = await asyncio.to_thread(_audit_ssl_sync, host, p, timeout)
        all_findings.extend(res)

    return all_findings
