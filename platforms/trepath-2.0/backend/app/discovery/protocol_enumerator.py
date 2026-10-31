"""NetRecon Protocol Enumerator — Performs non-destructive protocol handshakes on discovered open TCP ports."""

from __future__ import annotations

import asyncio
import json
import socket
from typing import Any
from urllib.parse import urlparse

from ..models import ProofState


def _probe_ftp_anonymous(host: str, port: int = 21, timeout: float = 2.0) -> dict[str, Any] | None:
    """Check FTP banner and whether anonymous login (USER anonymous) is accepted (230) or prompted (331)."""
    try:
        with socket.create_connection((host, port), timeout=timeout) as sock:
            banner = sock.recv(512).decode("latin1", errors="replace").strip()
            sock.sendall(b"USER anonymous\r\n")
            resp_user = sock.recv(512).decode("latin1", errors="replace").strip()
            resp_pass = ""
            if resp_user.startswith("331"):
                sock.sendall(b"PASS anonymous@trepath.local\r\n")
                resp_pass = sock.recv(512).decode("latin1", errors="replace").strip()
            sock.sendall(b"QUIT\r\n")
            anon_allowed = resp_user.startswith("230") or resp_pass.startswith("230")
            return {
                "service": "FTP",
                "port": port,
                "banner": banner,
                "user_response": resp_user,
                "pass_response": resp_pass,
                "anonymous_allowed": anon_allowed,
            }
    except Exception:
        return None


def _probe_smtp_ehlo(host: str, port: int = 25, timeout: float = 2.0) -> dict[str, Any] | None:
    """Issue EHLO to enumerate SMTP capabilities (STARTTLS, AUTH, VRFY, EXPN)."""
    try:
        with socket.create_connection((host, port), timeout=timeout) as sock:
            banner = sock.recv(512).decode("latin1", errors="replace").strip()
            sock.sendall(b"EHLO trepath.audit.local\r\n")
            ehlo_resp = sock.recv(1024).decode("latin1", errors="replace").strip()
            sock.sendall(b"QUIT\r\n")
            supports_starttls = "STARTTLS" in ehlo_resp.upper()
            supports_vrfy = "VRFY" in ehlo_resp.upper()
            return {
                "service": "SMTP",
                "port": port,
                "banner": banner,
                "ehlo_capabilities": ehlo_resp,
                "supports_starttls": supports_starttls,
                "supports_vrfy": supports_vrfy,
            }
    except Exception:
        return None


def _probe_mysql_handshake(host: str, port: int = 3306, timeout: float = 2.0) -> dict[str, Any] | None:
    """Read initial MySQL/MariaDB server greeting packet to extract version string or host ACL message."""
    try:
        with socket.create_connection((host, port), timeout=timeout) as sock:
            raw = sock.recv(512)
            if not raw or len(raw) < 5:
                return None
            text = raw.decode("latin1", errors="replace")
            is_acl_blocked = "is not allowed to connect" in text or "Host '" in text
            # MySQL greeting packet has protocol version at byte 4 followed by null-terminated version string
            version_str = ""
            if not is_acl_blocked and len(raw) > 6:
                end_idx = raw.find(b"\x00", 5)
                if end_idx != -1:
                    version_str = raw[5:end_idx].decode("latin1", errors="replace")
            return {
                "service": "MySQL",
                "port": port,
                "version": version_str or None,
                "acl_restricted": is_acl_blocked,
                "raw_greeting": text[:300],
            }
    except Exception:
        return None


async def run_protocol_enumerator(
    target_url: str,
    open_ports: list[int],
    timeout: float = 2.0,
) -> list[dict[str, Any]]:
    """Run targeted protocol-specific enumeration on discovered open ports."""
    parsed = urlparse(target_url)
    host = parsed.hostname or target_url
    findings: list[dict[str, Any]] = []

    if 21 in open_ports:
        ftp_info = await asyncio.to_thread(_probe_ftp_anonymous, host, 21, timeout)
        if ftp_info:
            anon = ftp_info["anonymous_allowed"]
            findings.append({
                "finding_key": "ENUM-PROTO-FTP-21",
                "title": (
                    f"[NetRecon] Anonymous FTP Login Enabled on {host}:21"
                    if anon
                    else f"[NetRecon] FTP Service Banner & Auth Enumerated ({ftp_info['banner'][:40]})"
                ),
                "description": (
                    f"NetRecon FTP protocol enumeration against {host}:21 captured banner `{ftp_info['banner']}`. "
                    f"Anonymous login (`USER anonymous`) returned: `{ftp_info['user_response']} {ftp_info['pass_response']}`."
                ),
                "severity": "high" if anon else "low",
                "proof_state": ProofState.CONTROL_GAP_CONFIRMED if anon else ProofState.OBSERVATION_CONFIRMED,
                "cvss_score": 7.5 if anon else 3.1,
                "cve_id": None,
                "cwe_id": "CWE-287" if anon else "CWE-200",
                "remediation": "Disable anonymous FTP access and migrate file transfers to SFTP/SSH.",
                "risk_priority": 68.0 if anon else 22.0,
                "evidence": json.dumps(ftp_info, indent=2),
            })

    if 25 in open_ports:
        smtp_info = await asyncio.to_thread(_probe_smtp_ehlo, host, 25, timeout)
        if smtp_info:
            no_tls = not smtp_info["supports_starttls"]
            findings.append({
                "finding_key": "ENUM-PROTO-SMTP-25",
                "title": f"[NetRecon] SMTP EHLO Capabilities Enumerated on {host}:25 (STARTTLS={'No' if no_tls else 'Yes'})",
                "description": (
                    f"SMTP daemon on {host}:25 responded with banner `{smtp_info['banner']}` and EHLO capabilities:\n"
                    f"{smtp_info['ehlo_capabilities']}"
                ),
                "severity": "medium" if no_tls else "info",
                "proof_state": ProofState.CONTROL_GAP_CONFIRMED if no_tls else ProofState.OBSERVATION_CONFIRMED,
                "cvss_score": 5.3 if no_tls else 2.0,
                "cve_id": None,
                "cwe_id": "CWE-319" if no_tls else "CWE-200",
                "remediation": "Enable STARTTLS on SMTP listeners and disable VRFY/EXPN user enumeration commands.",
                "risk_priority": 42.0 if no_tls else 15.0,
                "evidence": json.dumps(smtp_info, indent=2),
            })

    if 3306 in open_ports:
        mysql_info = await asyncio.to_thread(_probe_mysql_handshake, host, 3306, timeout)
        if mysql_info:
            open_handshake = not mysql_info["acl_restricted"]
            findings.append({
                "finding_key": "ENUM-PROTO-MYSQL-3306",
                "title": (
                    f"[NetRecon] MySQL Server Handshake Exposed on {host}:3306 (Version: {mysql_info.get('version') or 'Detected'})"
                    if open_handshake
                    else f"[NetRecon] MySQL Listener Host ACL Verified on {host}:3306"
                ),
                "description": (
                    f"MySQL protocol probe on {host}:3306 returned greeting: `{mysql_info['raw_greeting']}`."
                ),
                "severity": "high" if open_handshake else "low",
                "proof_state": ProofState.CONTROL_GAP_CONFIRMED if open_handshake else ProofState.OBSERVATION_CONFIRMED,
                "cvss_score": 7.5 if open_handshake else 3.0,
                "cve_id": None,
                "cwe_id": "CWE-284" if open_handshake else "CWE-200",
                "remediation": "Bind MySQL (3306/TCP) to 127.0.0.1 or restrict network access strictly to application tier hosts.",
                "risk_priority": 65.0 if open_handshake else 20.0,
                "evidence": json.dumps(mysql_info, indent=2),
            })

    return findings
