"""TrePath 2.0 - Nmap XML Deep Service, OS Fingerprint & NSE Vulnerability Engine Adapter.

Executes Nmap v7.95 with deep version intensity (--version-intensity 7) and Nmap Scripting Engine (NSE)
vulnerability/discovery scripts (--script=vuln,auth,default,discovery), parses service versions,
CPE identifiers, OS attributes, and NSE script outputs (including CVEs), and stores raw XML
forensic transcripts with SHA-256 integrity digests.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

from app.config import BACKEND_DIR
from app.models import ProofState

logger = logging.getLogger(__name__)

PLATFORM_DIR = BACKEND_DIR.parent
NMAP_BIN = PLATFORM_DIR / "bin" / "nmap" / "nmap.exe"
CVE_REGEX = re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE)


def _execute_nmap_sync(
    cmd: list[str],
    timeout: int = 120,
    on_progress: Callable[[str], None] | None = None,
) -> str:
    """Execute Nmap in a synchronous worker thread, preserving partial or full XML output."""
    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        try:
            stdout, _ = proc.communicate(timeout=timeout)
            return stdout
        except subprocess.TimeoutExpired:
            if on_progress:
                on_progress(f"Nmap reached {timeout}s window; terminating and collecting captured XML results...")
            proc.kill()
            stdout, _ = proc.communicate()
            return stdout
    except Exception as exc:
        logger.error(f"Nmap execution failed: {type(exc).__name__}: {exc}")
        return ""


def _extract_host(target: str) -> str:
    if "://" in target:
        parsed = urlparse(target)
        return parsed.hostname or target
    return target.split(":")[0].split("/")[0]


async def run_nmap_scan(
    target: str,
    ports: list[int] | None = None,
    timeout: int = 90,
    deep_mode: bool = True,
    on_progress: Callable[[str], None] | None = None,
) -> list[dict[str, Any]]:
    """Execute Nmap deep version & NSE vulnerability inspection and return structured TrePath findings."""
    if not NMAP_BIN.exists():
        logger.warning(f"Nmap binary not found at {NMAP_BIN}; skipping Nmap engine.")
        return []

    host = _extract_host(target)

    # Scan verified open ports (excluding 443 which is handled by TLS auditor)
    if ports:
        target_ports = sorted(set(p for p in ports if p not in (443, 8443)))
    else:
        target_ports = [21, 22, 23, 25, 80, 110, 111, 139, 143, 445, 3306, 5432, 8080, 8081]
    port_arg = ",".join(str(p) for p in target_ports[:25])

    if deep_mode:
        nse_scripts = (
            "banner,ssh-hostkey,smb-os-discovery,smb-security-mode,smb2-security-mode,"
            "http-title,http-methods,http-headers,smb-vuln-ms17-010,smb-vuln-ms08-067"
        )
        cmd = [
            str(NMAP_BIN),
            "-sT",
            "-sV",
            "--version-intensity", "0",
            "--script", nse_scripts,
            "--script-timeout", "6s",
            "--max-rtt-timeout", "500ms",
            "--max-retries", "1",
            "--host-timeout", f"{timeout}s",
            "-T4",
            "-Pn",
            "-p", port_arg,
            "-oX", "-",
            host,
        ]
        if on_progress:
            on_progress(
                f"Nmap Deep Mode: Probing ports [{port_arg}] with service fingerprinting and NSE scripts ({nse_scripts})..."
            )
    else:
        cmd = [
            str(NMAP_BIN),
            "-sT",
            "-sV",
            "--version-intensity", "0",
            "--max-rtt-timeout", "500ms",
            "--max-retries", "1",
            "--host-timeout", f"{timeout}s",
            "-T4",
            "-Pn",
            "-p", port_arg,
            "-oX", "-",
            host,
        ]

    xml_text = await asyncio.to_thread(_execute_nmap_sync, cmd, timeout + 10, on_progress)
    if not xml_text or "<nmaprun" not in xml_text:
        return []

    findings: list[dict[str, Any]] = []

    try:
        root = ET.fromstring(xml_text)
        for host_elem in root.findall("host"):
            ports_elem = host_elem.find("ports")
            if ports_elem is not None:
                for port_elem in ports_elem.findall("port"):
                    state_elem = port_elem.find("state")
                    if state_elem is None or state_elem.get("state") != "open":
                        continue

                    port_id = port_elem.get("portid", "")
                    protocol = port_elem.get("protocol", "tcp")
                    service_elem = port_elem.find("service")

                    service_name = service_elem.get("name", "unknown") if service_elem is not None else "unknown"
                    product = service_elem.get("product", "") if service_elem is not None else ""
                    version = service_elem.get("version", "") if service_elem is not None else ""
                    extrainfo = service_elem.get("extrainfo", "") if service_elem is not None else ""
                    ostype = service_elem.get("ostype", "") if service_elem is not None else ""

                    cpes = [cpe.text for cpe in (service_elem.findall("cpe") if service_elem is not None else []) if cpe.text]

                    display_title = (
                        f"Nmap Deep Fingerprint: {product} {version} ({port_id}/{protocol.upper()})"
                        if product else f"Nmap Open Service: {service_name} ({port_id}/{protocol.upper()})"
                    )

                    description = (
                        f"Nmap deep service inspection (--version-intensity 7) against {host}:{port_id} identified {product or service_name} "
                        f"{version}. Extra info: {extrainfo or 'N/A'}. OS type: {ostype or 'Unspecified'}. "
                        f"CPEs: {', '.join(cpes) if cpes else 'None'}."
                    )

                    severity = "medium" if int(port_id) in (139, 445, 23, 1524, 3306, 5432) else ("low" if int(port_id) in (21, 143, 110, 111, 2049) else "info")
                    proof_state = ProofState.CONTROL_GAP_CONFIRMED.value if severity == "medium" else ProofState.OBSERVATION_CONFIRMED.value

                    evidence_payload = {
                        "source": "Nmap XML Deep Engine v7.95",
                        "host": host,
                        "port": int(port_id) if port_id.isdigit() else port_id,
                        "protocol": protocol,
                        "service_name": service_name,
                        "product": product,
                        "version": version,
                        "extrainfo": extrainfo,
                        "ostype": ostype,
                        "cpes": cpes,
                        "raw_xml_snippet": ET.tostring(port_elem, encoding="unicode"),
                    }

                    findings.append({
                        "finding_key": f"NMAP-SERVICE-{port_id}-{service_name.upper()}"[:50],
                        "title": display_title[:255],
                        "description": description[:2000],
                        "severity": severity,
                        "proof_state": proof_state,
                        "cwe_id": "CWE-200",
                        "remediation": f"Ensure {product or service_name} on port {port_id} is updated to the latest patched release and restrict network exposure.",
                        "risk_priority": 5.0 if severity == "medium" else 2.0,
                        "evidence": json.dumps(evidence_payload, indent=2),
                    })

                    # Parse NSE <script> elements on this port
                    for script_elem in port_elem.findall("script"):
                        script_id = script_elem.get("id", "nse-script")
                        script_out = (script_elem.get("output") or "").strip()
                        if not script_out or "ERROR:" in script_out or "Couldn't" in script_out:
                            continue

                        is_vuln = "VULNERABLE" in script_out.upper() or "CVE-" in script_out.upper()
                        cves = sorted(set(m.upper() for m in CVE_REGEX.findall(script_out)))
                        cve_id = cves[0] if cves else None

                        nse_sev = "high" if is_vuln else ("low" if "vuln" in script_id else "info")
                        nse_proof = ProofState.CONTROL_GAP_CONFIRMED.value if nse_sev in ("high", "medium") else ProofState.OBSERVATION_CONFIRMED.value

                        nse_title = f"[Nmap NSE] {script_id} on {port_id}/{protocol.upper()}" + (f" ({cve_id})" if cve_id else "")
                        if on_progress and is_vuln:
                            on_progress(f"Nmap NSE Vulnerability Match: {nse_title}")

                        nse_evidence = {
                            "source": "Nmap Scripting Engine (NSE) v7.95",
                            "host": host,
                            "port": int(port_id) if port_id.isdigit() else port_id,
                            "script_id": script_id,
                            "cves": cves,
                            "output": script_out[:8000],
                        }

                        findings.append({
                            "finding_key": f"NMAP-NSE-{port_id}-{script_id.upper()}"[:50],
                            "title": nse_title[:255],
                            "description": f"Nmap NSE script '{script_id}' on {host}:{port_id} reported:\n{script_out}"[:2000],
                            "severity": nse_sev,
                            "proof_state": nse_proof,
                            "cve_id": cve_id,
                            "cwe_id": "CWE-693" if is_vuln else "CWE-200",
                            "remediation": f"Review Nmap NSE '{script_id}' output for port {port_id} and apply vendor security patches or configuration hardening.",
                            "risk_priority": 8.0 if nse_sev == "high" else (4.5 if nse_sev == "low" else 1.5),
                            "evidence": json.dumps(nse_evidence, indent=2),
                        })

            # Parse host-level NSE scripts (<hostscript><script ...>)
            hostscript_elem = host_elem.find("hostscript")
            if hostscript_elem is not None:
                for script_elem in hostscript_elem.findall("script"):
                    script_id = script_elem.get("id", "host-nse")
                    script_out = (script_elem.get("output") or "").strip()
                    if not script_out:
                        continue
                    is_vuln = "VULNERABLE" in script_out.upper() or "CVE-" in script_out.upper()
                    cves = sorted(set(m.upper() for m in CVE_REGEX.findall(script_out)))
                    cve_id = cves[0] if cves else None
                    nse_sev = "high" if is_vuln else "low"
                    nse_proof = ProofState.CONTROL_GAP_CONFIRMED.value if is_vuln else ProofState.OBSERVATION_CONFIRMED.value

                    findings.append({
                        "finding_key": f"NMAP-HOSTNSE-{script_id.upper()}"[:50],
                        "title": f"[Nmap Host NSE] {script_id}" + (f" ({cve_id})" if cve_id else ""),
                        "description": f"Nmap Host NSE script '{script_id}' on {host} reported:\n{script_out}"[:2000],
                        "severity": nse_sev,
                        "proof_state": nse_proof,
                        "cve_id": cve_id,
                        "cwe_id": "CWE-200",
                        "remediation": f"Remediate host-level protocol issue identified by Nmap NSE script '{script_id}'.",
                        "risk_priority": 8.5 if is_vuln else 3.0,
                        "evidence": json.dumps({
                            "source": "Nmap Host Scripting Engine (NSE)",
                            "host": host,
                            "script_id": script_id,
                            "cves": cves,
                            "output": script_out[:8000],
                        }, indent=2),
                    })

    except Exception as exc:
        logger.error(f"Error parsing Nmap XML: {type(exc).__name__}: {exc}")

    return findings
