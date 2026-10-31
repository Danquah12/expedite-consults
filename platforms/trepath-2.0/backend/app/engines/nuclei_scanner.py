"""TrePath 2.0 - Nuclei Commercial Vulnerability & CVE Scanner Adapter (Deep Streaming Mode).

Integrates ProjectDiscovery Nuclei (14,000+ templates) with TrePath's evidence vault.
Streams JSON Lines output line-by-line in real time using subprocess.Popen so zero findings are ever
lost on timeout, maps severity/CWE/CVE, emits live telemetry via on_progress, and captures authentic
request/response transcripts.
"""

from __future__ import annotations

import asyncio
import json
import logging
import subprocess
import threading
import time
from typing import Any, Callable

from app.config import BACKEND_DIR
from app.models import ProofState

logger = logging.getLogger(__name__)

PLATFORM_DIR = BACKEND_DIR.parent
NUCLEI_BIN = PLATFORM_DIR / "bin" / "nuclei.exe"
TEMPLATES_DIR = PLATFORM_DIR / "nuclei-templates"

SEVERITY_MAP = {
    "info": "info",
    "low": "low",
    "medium": "medium",
    "high": "high",
    "critical": "critical",
    "unknown": "info",
}

RISK_PRIORITY_MAP = {
    "critical": 10,
    "high": 8,
    "medium": 5,
    "low": 2,
    "info": 1,
}


def _stream_nuclei_sync(
    cmd: list[str],
    timeout: int = 110,
    on_line: Callable[[str], None] | None = None,
    on_progress: Callable[[str], None] | None = None,
) -> list[str]:
    """Stream Nuclei JSONL stdout line-by-line in a worker thread, preserving all lines even on timeout."""
    captured_lines: list[str] = []
    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )

        def _reader():
            if not proc.stdout:
                return
            for raw_line in proc.stdout:
                s = raw_line.strip()
                if s and s.startswith("{"):
                    captured_lines.append(s)
                    if on_line:
                        on_line(s)

        reader_thread = threading.Thread(target=_reader, daemon=True)
        reader_thread.start()

        deadline = time.time() + timeout
        while reader_thread.is_alive() and time.time() < deadline:
            reader_thread.join(timeout=1.0)

        if proc.poll() is None:
            if on_progress:
                on_progress(
                    f"Nuclei reached {timeout}s deep window ({len(captured_lines)} matches captured); finalizing stream..."
                )
            proc.kill()
        reader_thread.join(timeout=2.0)
    except Exception as exc:
        logger.error(f"Nuclei streaming execution failed: {type(exc).__name__}: {exc}")

    return captured_lines


async def run_nuclei_scan(
    target: str,
    categories: list[str] | None = None,
    tags: list[str] | None = None,
    timeout_per_probe: int = 3,
    concurrency: int = 50,
    max_duration: int = 75,
    deep_mode: bool = True,
    open_ports: list[int] | None = None,
    on_progress: Callable[[str], None] | None = None,
) -> list[dict[str, Any]]:
    """Execute Nuclei against target (and discovered secondary HTTP ports) in streaming mode."""
    if not NUCLEI_BIN.exists():
        logger.warning(f"Nuclei binary not found at {NUCLEI_BIN}; skipping Nuclei suite.")
        return []

    if not TEMPLATES_DIR.exists():
        logger.warning(f"Nuclei templates directory not found at {TEMPLATES_DIR}; skipping.")
        return []

    from urllib.parse import urlparse
    parsed = urlparse(target)
    host = parsed.hostname or target.split(":")[0].split("/")[0]

    target_urls = [target]
    web_alt_ports = {8000, 8008, 8080, 8081, 8180, 8443, 8888, 9000, 3000, 5000}
    for p in (open_ports or []):
        if p in web_alt_ports and f":{p}" not in target:
            scheme = "https" if p == 8443 else "http"
            target_urls.append(f"{scheme}://{host}:{p}/")

    cmd = [
        str(NUCLEI_BIN),
        "-no-stdin",
        "-jsonl",
        "-silent",
        "-timeout", str(timeout_per_probe),
        "-retries", "0",
        "-rate-limit", "200",
        "-concurrency", str(concurrency),
        "-bulk-size", "40",
        "-stats-json=false",
    ]
    for u in target_urls:
        cmd.extend(["-u", u])

    if deep_mode:
        active_categories = categories or [
            "http/technologies",
            "http/exposed-panels",
            "http/default-logins",
            "http/exposures",
            "http/vulnerabilities/apache",
            "http/cves/2021",
            "http/cves/2022",
            "http/cves/2023",
            "http/cves/2024",
        ]
    else:
        active_categories = categories or [
            "http/technologies",
            "http/exposed-panels",
            "http/exposures",
        ]

    loaded_cats = []
    for cat in active_categories:
        cat_path = TEMPLATES_DIR / cat
        if cat_path.exists():
            cmd.extend(["-t", str(cat_path)])
            loaded_cats.append(cat)

    if tags:
        cmd.extend(["-tags", ",".join(tags)])

    if on_progress:
        on_progress(
            f"Nuclei Deep Engine probing {len(target_urls)} HTTP endpoint(s) ({', '.join(target_urls)}) across {len(loaded_cats)} template suites..."
        )

    findings: list[dict[str, Any]] = []

    def _handle_live_line(line: str):
        try:
            item = json.loads(line)
            tid = item.get("template-id", "unknown")
            info = item.get("info", {})
            tname = info.get("name") or tid
            sev = str(info.get("severity", "info")).upper()
            if on_progress:
                on_progress(f"Nuclei Template Match [{sev}]: {tname} ({tid})")
        except Exception:
            pass

    try:
        lines = await asyncio.to_thread(
            _stream_nuclei_sync, cmd, max_duration, _handle_live_line, on_progress
        )

        for line in lines:
            try:
                item = json.loads(line)
            except Exception:
                continue

            template_id = item.get("template-id", "unknown-check")
            matcher_name = item.get("matcher-name", "")
            info = item.get("info", {})
            name = info.get("name") or template_id
            if matcher_name:
                name = f"{name} ({matcher_name})"
            raw_severity = str(info.get("severity", "info")).lower()
            severity = SEVERITY_MAP.get(raw_severity, "info")
            description = info.get("description") or f"Nuclei commercial probe {template_id} matched on target."
            remediation = (
                info.get("remediation")
                or "Review server configuration, apply latest vendor security patches, and restrict unauthenticated access."
            )

            classification = info.get("classification", {})
            cve_ids = classification.get("cve-id", [])
            if isinstance(cve_ids, str):
                cve_ids = [cve_ids]
            cwe_ids = classification.get("cwe-id", [])
            if isinstance(cwe_ids, str):
                cwe_ids = [cwe_ids]
            cvss_score = classification.get("cvss-score")
            try:
                cvss_val = float(cvss_score) if cvss_score is not None else None
            except (ValueError, TypeError):
                cvss_val = None

            cwe_str = ", ".join(cwe_ids) if cwe_ids else ("CWE-200" if severity in ("info", "low") else None)
            cve_first = cve_ids[0] if cve_ids else None
            title = f"[Nuclei] [{cve_first}] {name}" if cve_first else f"[Nuclei] {name}"

            req = item.get("request", "")
            resp = item.get("response", "")
            matched_at = item.get("matched-at", target)
            curl_cmd = item.get("curl-command", "")
            extracted = item.get("extracted-results", [])

            evidence_data = {
                "source": "ProjectDiscovery Nuclei v3 (Commercial Deep Engine)",
                "template_id": template_id,
                "matcher_name": matcher_name,
                "matched_at": matched_at,
                "cve_ids": cve_ids,
                "cwe_ids": cwe_ids,
                "cvss_score": cvss_val,
                "extracted_results": extracted,
                "curl_command": curl_cmd,
                "request": req[:16000] if req else None,
                "response": resp[:16000] if resp else None,
            }

            proof_state = (
                ProofState.CONTROL_GAP_CONFIRMED.value
                if severity in ("critical", "high", "medium")
                else ProofState.OBSERVATION_CONFIRMED.value
            )

            key_suffix = f"{template_id}-{matcher_name}".upper() if matcher_name else template_id.upper()
            findings.append({
                "finding_key": f"NUCLEI-{key_suffix}"[:50],
                "title": title[:255],
                "description": description[:2000],
                "severity": severity,
                "proof_state": proof_state,
                "cvss_score": cvss_val,
                "cve_id": cve_first[:50] if cve_first else None,
                "cwe_id": cwe_str[:50] if cwe_str else None,
                "remediation": remediation[:2000],
                "risk_priority": cvss_val if cvss_val else RISK_PRIORITY_MAP.get(severity, 1),
                "evidence": json.dumps(evidence_data, indent=2),
            })

    except Exception as exc:
        logger.error(f"Error parsing Nuclei output: {type(exc).__name__}: {exc}")

    return findings
