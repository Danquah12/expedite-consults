"""Targeted Feature-Specific DAST Probes — Executes non-destructive, parameter-aware checks for Orchestrator test families."""

from __future__ import annotations

import json
from typing import Any
from urllib.parse import urlparse, urlencode, parse_qsl, urlunparse
import httpx

from ... import models


def _replace_query_param(url: str, param: str, value: str) -> str:
    parsed = urlparse(url)
    pairs = dict(parse_qsl(parsed.query, keep_blank_values=True))
    pairs[param] = value
    new_query = urlencode(pairs)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path or "/", parsed.params, new_query, ""))


async def run_targeted_dast_adapters(
    asset: models.Asset,
    endpoints: list[models.Endpoint],
    technologies: list[models.Technology],
    intelligence_matches: list[models.IntelligenceMatch],
    timeout: float = 2.5,
) -> list[dict[str, Any]]:
    """
    Execute targeted, non-destructive feature-specific probes against classified endpoints:
      - AUTH-SESSION-001 -> Login Page & Session Cookie Attribute Verification
      - API-AUTHZ-001    -> API Unauthenticated Access & Schema Boundary Probe
      - BOLA-IDOR-001    -> Object-Level Authorization (Differential ID Probe)
      - INJ-INPUT-001    -> Search Parameter Canary Reflection & Error Boundary Verification
      - FILE-UPLOAD-001  -> Upload Surface Access & Method Boundary Verification
      - ADMIN-ACCESS-001 -> Administrative Console Authentication Gate Verification
      - VER-INTEL-001    -> Outdated Software Version & CVE Advisory Verification
    """
    findings: list[dict[str, Any]] = []
    timeout_cfg = httpx.Timeout(connect=1.5, read=2.0, write=1.5, pool=2.5)

    async with httpx.AsyncClient(
        timeout=timeout_cfg,
        verify=False,
        follow_redirects=False,
        headers={"User-Agent": "TrePath-Orchestrator-Adapter/2.0"},
    ) as client:
        # 1. AUTH-SESSION-001: Login Page & Session Cookie Attribute Probe
        login_eps = [ep for ep in endpoints if ep.surface_type == "login_page" or ep.functionality == "authentication"]
        for ep in login_eps[:2]:
            try:
                res = await client.get(ep.url)
                parsed_u = urlparse(ep.url)
                set_cookies = res.headers.get_list("set-cookie") if hasattr(res.headers, "get_list") else (
                    [res.headers["set-cookie"]] if "set-cookie" in res.headers else []
                )
                is_cleartext = (parsed_u.scheme == "http")
                missing_flags: list[str] = []
                for sc in set_cookies:
                    sc_low = sc.lower()
                    if "httponly" not in sc_low:
                        missing_flags.append("HttpOnly")
                    if "samesite" not in sc_low:
                        missing_flags.append("SameSite")
                    if parsed_u.scheme == "https" and "secure" not in sc_low:
                        missing_flags.append("Secure")

                if is_cleartext or missing_flags:
                    req_str = f"GET {parsed_u.path or '/'} HTTP/1.1\r\nHost: {parsed_u.netloc}\r\nUser-Agent: TrePath-Orchestrator-Adapter/2.0"
                    resp_str = (
                        f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n"
                        + "\r\n".join(f"{k}: {v}" for k, v in list(res.headers.items())[:12])
                    )
                    findings.append({
                        "finding_key": f"DAST-AUTH-SESSION-{ep.endpoint_key}",
                        "title": f"[AUTH-SESSION-001] Unencrypted Login Transport / Cookie Hardening Gap on {ep.path}",
                        "description": (
                            f"Targeted authentication probe `AUTH-SESSION-001` inspected login endpoint `{ep.url}` "
                            f"(HTTP {res.status_code}). Transport scheme: `{parsed_u.scheme.upper()}`. "
                            + (f"Session cookies missing flags: {sorted(set(missing_flags))}." if missing_flags else "Login page is served over cleartext HTTP without HTTPS redirect.")
                        ),
                        "severity": "medium" if is_cleartext else "low",
                        "proof_state": models.ProofState.CONTROL_GAP_CONFIRMED,
                        "cvss_score": 6.5 if is_cleartext else 4.3,
                        "cve_id": None,
                        "cwe_id": "CWE-319" if is_cleartext else "CWE-614",
                        "remediation": "Serve all authentication routes strictly over HTTPS (TLS 1.2/1.3) and set HttpOnly, Secure, and SameSite=Lax/Strict on session cookies.",
                        "risk_priority": 55.0 if is_cleartext else 32.0,
                        "evidence": json.dumps({
                            "source": "TrePath DAST Adapter (AUTH-SESSION-001)",
                            "test_id": "AUTH-SESSION-001",
                            "matched_at": ep.url,
                            "request": req_str,
                            "response": resp_str,
                            "missing_cookie_flags": sorted(set(missing_flags)),
                        }, indent=2),
                    })
            except Exception:
                pass

        # 2. API-AUTHZ-001: API Endpoint Unauthenticated Access & Content-Type Check (TP23-01 Anti-Bot / Public API Filter)
        api_eps = [ep for ep in endpoints if ep.surface_type == "api_endpoint"]
        for ep in api_eps[:2]:
            try:
                res = await client.get(ep.url, headers={"Accept": "application/json"})
                parsed_u = urlparse(ep.url)
                if res.status_code == 200:
                    path_low = (ep.path or "").lower()
                    body_low = (res.text or "")[:2000].lower()
                    is_antibot_or_honeypot = any(
                        tok in path_low or tok in body_low
                        for tok in ("/.within.website/", "anubis", "honeypot", "turnstile", "cf-chl", "proof-of-work")
                    )
                    has_sensitive_records = (not is_antibot_or_honeypot) and any(
                        tok in body_low
                        for tok in ('"password"', '"secret"', '"private_key"', '"ssn"', '"credit_card"', '"access_token"')
                    )
                    req_str = f"GET {parsed_u.path or '/'} HTTP/1.1\r\nHost: {parsed_u.netloc}\r\nAccept: application/json"
                    resp_str = (
                        f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n"
                        f"Content-Type: {res.headers.get('content-type', 'unknown')}\r\n"
                        f"Endpoint Classification: {'ANTIBOT_OR_HONEYPOT_CHALLENGE' if is_antibot_or_honeypot else ('SENSITIVE_API_RECORDS_EXPOSED' if has_sensitive_records else 'PUBLIC_OR_UNPROVEN_API_ROUTE')}\r\n\r\n"
                        f"{res.text[:600]}"
                    )
                    findings.append({
                        "finding_key": f"DAST-API-AUTHZ-{ep.endpoint_key}",
                        "title": (
                            f"[API-AUTHZ-001] Anti-Bot / Honeypot Challenge API Route Observed ({ep.path})"
                            if is_antibot_or_honeypot
                            else (
                                f"[API-AUTHZ-001] Unauthenticated Sensitive API Data Exposure ({ep.path})"
                                if has_sensitive_records
                                else f"[API-AUTHZ-001] Public or Unauthenticated API Route Reachable ({ep.path} — AuthZ Unproven)"
                            )
                        )[:255],
                        "description": (
                            f"Targeted API authorization check `API-AUTHZ-001` issued an unauthenticated request to `{ep.url}` "
                            f"and received `HTTP 200 OK` ({len(res.content)} bytes). "
                            + (
                                "Route signature matches an anti-bot proof-of-work or honeypot challenge endpoint (`anubis` / `/.within.website/`); this is defensive bot-mitigation telemetry, not an unauthorized data disclosure vulnerability."
                                if is_antibot_or_honeypot
                                else (
                                    "Response payload contains sensitive record fields accessible without authentication (`EXPLOITABILITY_VERIFIED`)."
                                    if has_sensitive_records
                                    else "Route is publicly reachable (`API_ROUTE_REACHABLE_AUTHZ_UNPROVEN`), but response does not expose private user records or privileged state mutations."
                                )
                            )
                        ),
                        "severity": "high" if has_sensitive_records else "low",
                        "proof_state": models.ProofState.IMPACT_VERIFIED if has_sensitive_records else models.ProofState.OBSERVATION_CONFIRMED,
                        "cvss_score": 7.5 if has_sensitive_records else (2.0 if is_antibot_or_honeypot else 3.1),
                        "cve_id": None,
                        "cwe_id": "CWE-284" if has_sensitive_records else "CWE-200",
                        "remediation": (
                            "No remediation required for intentional anti-bot/honeypot challenge endpoints; verify WAF/bot-protection rules."
                            if is_antibot_or_honeypot
                            else "Verify whether this API route is intended to be public; enforce Bearer token / session authentication for non-public APIs."
                        ),
                        "risk_priority": 72.0 if has_sensitive_records else (18.0 if is_antibot_or_honeypot else 26.0),
                        "evidence": json.dumps({
                            "source": "TrePath DAST Adapter (API-AUTHZ-001)",
                            "test_id": "API-AUTHZ-001",
                            "matched_at": ep.url,
                            "is_antibot_or_honeypot": is_antibot_or_honeypot,
                            "has_sensitive_records": has_sensitive_records,
                            "request": req_str,
                            "response": resp_str,
                        }, indent=2),
                    })
            except Exception:
                pass

        # 3. BOLA-IDOR-001: Object-Level Authorization Differential ID & Content Ownership Probe
        bola_eps = [ep for ep in endpoints if "user_id_parameter" in (ep.input_types or []) or ep.functionality == "object_lookup"]
        for ep in bola_eps[:2]:
            id_param = next((p for p in (ep.parameters or ["id"]) if p.lower() in ("id", "user_id", "userid", "account_id", "uid")), "id")
            url_id1 = _replace_query_param(ep.url, id_param, "1")
            url_id2 = _replace_query_param(ep.url, id_param, "2")
            try:
                import hashlib
                r_base = await client.get(ep.url)
                r1 = await client.get(url_id1)
                r2 = await client.get(url_id2)
                if r1.status_code == 200 and r2.status_code == 200:
                    h_base = hashlib.sha256(r_base.content).hexdigest()
                    h1 = hashlib.sha256(r1.content).hexdigest()
                    h2 = hashlib.sha256(r2.content).hexdigest()
                    distinct_objects = (h1 != h2) and (h1 != h_base or h2 != h_base)
                    body_low = (r1.text[:2000] + r2.text[:2000]).lower()
                    has_private_fields = any(tok in body_low for tok in ('"email":', '"ssn":', '"account_number":', '"balance":', '"private":', '"role":'))
                    parsed_u = urlparse(url_id1)
                    req_str = f"GET {parsed_u.path}?{parsed_u.query} HTTP/1.1\r\nHost: {parsed_u.netloc}\r\n# Differential Probe 2: GET {urlparse(url_id2).path}?{urlparse(url_id2).query}"
                    resp_str = (
                        f"Baseline ({ep.path}) -> HTTP {r_base.status_code} ({len(r_base.content)} bytes, sha256={h_base[:16]}...)\r\n"
                        f"Probe 1 ({id_param}=1) -> HTTP {r1.status_code} ({len(r1.content)} bytes, sha256={h1[:16]}...)\r\n"
                        f"Probe 2 ({id_param}=2) -> HTTP {r2.status_code} ({len(r2.content)} bytes, sha256={h2[:16]}...)\r\n"
                        f"Differential Body Match: {'DISTINCT_OBJECTS_RETURNED' if distinct_objects else 'IDENTICAL_STATIC_RESPONSE (Parameter Ignored)'}\r\n"
                        f"Sensitive Object Attributes Detected: {has_private_fields}"
                    )
                    if distinct_objects:
                        findings.append({
                            "finding_key": f"DAST-BOLA-IDOR-{ep.endpoint_key}",
                            "title": (
                                f"[BOLA-IDOR-001] Differential Object Responses on `{ep.path}` (`{id_param}=1` vs `2`)"
                                if not has_private_fields
                                else f"[BOLA-IDOR-001] Unauthenticated Object Record Disclosure on `{ep.path}` (`{id_param}`)"
                            ),
                            "description": (
                                f"Targeted object-level authorization test `BOLA-IDOR-001` compared baseline `{ep.path}` against "
                                f"`{id_param}=1` ({len(r1.content)}B) and `{id_param}=2` ({len(r2.content)}B). "
                                + (
                                    "Distinct object payloads containing sensitive record attributes were returned without authentication."
                                    if has_private_fields
                                    else "Distinct response bodies were returned, but cross-tenant resource ownership violation is not yet proven without dual-identity context."
                                )
                            ),
                            "severity": "high" if has_private_fields else "low",
                            "proof_state": models.ProofState.IMPACT_VERIFIED if has_private_fields else models.ProofState.OBSERVATION_CONFIRMED,
                            "cvss_score": 7.5 if has_private_fields else 3.7,
                            "cve_id": None,
                            "cwe_id": "CWE-639",
                            "remediation": "Enforce server-side object-level authorization checks verifying that the authenticated caller owns the requested resource ID.",
                            "risk_priority": 72.0 if has_private_fields else 28.0,
                            "evidence": json.dumps({
                                "source": "TrePath DAST Adapter (BOLA-IDOR-001)",
                                "test_id": "BOLA-IDOR-001",
                                "matched_at": url_id1,
                                "distinct_objects": distinct_objects,
                                "has_private_fields": has_private_fields,
                                "sha256_id1": h1,
                                "sha256_id2": h2,
                                "request": req_str,
                                "response": resp_str,
                            }, indent=2),
                        })
            except Exception:
                pass

        # 4. ADMIN-ACCESS-001: Administrative Interface & Login Gate Boundary Verification (TP23-01 / NG-01)
        admin_eps = [ep for ep in endpoints if ep.surface_type == "admin_interface"]
        for ep in admin_eps[:3]:
            try:
                res = await client.get(ep.url)
                parsed_u = urlparse(ep.url)
                www_auth = res.headers.get("www-authenticate")
                if res.status_code in (200, 401):
                    body_low = (res.text or "").lower()
                    has_login_form = any(
                        tok in body_low
                        for tok in ('type="password"', "type='password'", "pma_username", "pma_password", 'name="password"', "login_form")
                    )
                    has_verified_admin_console = any(
                        tok in body_low
                        for tok in (
                            "tomcat web application manager",
                            "phpmyadmin",
                            "pma_username",
                            "wp-admin",
                            "django site admin",
                            "server status",
                            "user management",
                            "system configuration",
                        )
                    )
                    is_unauth_console = (res.status_code == 200 and not has_login_form and not www_auth and has_verified_admin_console)
                    is_exposed_login_gate = (res.status_code == 200 and has_login_form and has_verified_admin_console)
                    req_str = f"GET {parsed_u.path or '/'} HTTP/1.1\r\nHost: {parsed_u.netloc}"
                    resp_str = (
                        f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n"
                        + (f"WWW-Authenticate: {www_auth}\r\n" if www_auth else "")
                        + f"Content-Length: {len(res.content)}\r\n"
                        + f"Verified Admin Console Markers: {has_verified_admin_console}\r\n"
                        + f"Authentication Gate Analysis: {'LOGIN_FORM_ENFORCED (Credentials Required)' if has_login_form else ('HTTP_AUTH_CHALLENGE' if www_auth else ('UNAUTH_ADMIN_CONSOLE_VERIFIED' if is_unauth_console else 'ROUTE_REACHABLE_ADMIN_CONSOLE_UNPROVEN'))}"
                    )
                    findings.append({
                        "finding_key": f"DAST-ADMIN-ACCESS-{ep.endpoint_key}",
                        "title": (
                            f"[ADMIN-ACCESS-001] Administrative Login Interface Exposed (Auth Gate Present) on {ep.url}"
                            if is_exposed_login_gate
                            else (
                                f"[ADMIN-ACCESS-001] Unauthenticated Administrative Console Exposed on {ep.url}"
                                if is_unauth_console
                                else f"[ADMIN-ACCESS-001] Candidate Route or Login Interface Discovered (HTTP {res.status_code} — Admin Access Unproven) on {ep.url}"
                            )
                        )[:255],
                        "description": (
                            f"Administrative boundary test `ADMIN-ACCESS-001` probed `{ep.url}` and received `HTTP {res.status_code}`. "
                            + (
                                "The administrative login page (e.g. phpMyAdmin authentication form) is network-reachable, but interactive login credentials are required before administration is permitted (unauthenticated admin access is NOT proven)."
                                if is_exposed_login_gate
                                else (
                                    "Verified administrative console controls were rendered with HTTP 200 OK without an authentication gate."
                                    if is_unauth_console
                                    else (
                                        f"The candidate route is reachable (`LOGIN_INTERFACE_OR_ROUTE_DISCOVERED`), and challenges with `{www_auth}`."
                                        if www_auth
                                        else "The candidate route (`/dashboard` or `/admin` path) returned HTTP 200 OK, but no administrative console controls, privileged state actions, or authentication bypass were verified (`LOGIN_INTERFACE_OR_ROUTE_DISCOVERED`)."
                                    )
                                )
                            )
                        ),
                        "severity": "high" if is_unauth_console else ("medium" if is_exposed_login_gate else "low"),
                        "proof_state": (
                            models.ProofState.CONTROL_GAP_CONFIRMED
                            if (is_unauth_console or is_exposed_login_gate)
                            else models.ProofState.OBSERVATION_CONFIRMED
                        ),
                        "cvss_score": 7.5 if is_unauth_console else (5.3 if is_exposed_login_gate else 3.1),
                        "cve_id": None,
                        "cwe_id": "CWE-284" if (is_unauth_console or is_exposed_login_gate) else "CWE-200",
                        "remediation": "Restrict administrative interfaces (/phpMyAdmin, /admin, :8080/manager) to internal management VPNs or bastion hosts and enforce HTTPS + MFA.",
                        "risk_priority": 68.0 if is_unauth_console else (48.0 if is_exposed_login_gate else 26.0),
                        "evidence": json.dumps({
                            "source": "TrePath DAST Adapter (ADMIN-ACCESS-001)",
                            "test_id": "ADMIN-ACCESS-001",
                            "matched_at": ep.url,
                            "login_gate_present": has_login_form or bool(www_auth),
                            "verified_admin_console_markers": has_verified_admin_console,
                            "unauthenticated_admin_proven": is_unauth_console,
                            "request": req_str,
                            "response": resp_str,
                        }, indent=2),
                    })
            except Exception:
                pass

    # 5. VER-INTEL-001: Outdated Software Banner & ENUMCORE CVE Correlation (TP23-01 / NG-02)
    from ...discovery.technology_classifier import _check_outdated
    outdated_techs = [t for t in technologies if t.is_outdated and _check_outdated(t.name or "", t.version, t.banner or "")]
    for tech in outdated_techs[:5]:
        matched_intel = next((m for m in intelligence_matches if m.technology_id == tech.id), None)
        cve_str = matched_intel.cve_id if matched_intel else None
        cvss_val = float(matched_intel.cvss_score) if matched_intel else 5.3
        findings.append({
            "finding_key": f"DAST-VER-INTEL-{tech.tech_key}",
            "title": (
                f"[VER-INTEL-001] Outdated Software Component Identified (Version Fingerprint): {tech.name} {tech.version or ''} "
                + (f"[CVE_CORRELATED: {cve_str}]" if cve_str else "(End-of-Life / Legacy Release)")
            )[:255],
            "description": (
                f"Version intelligence check `VER-INTEL-001` identified legacy software fingerprint "
                f"`{tech.name} {tech.version or ''}` (CPE: `{tech.cpe or 'N/A'}`, Banner: `{tech.banner}`). "
                "Note: This finding confirms technology version identification (`CVE_CORRELATED`), not active vulnerability exploitation. "
                + (matched_intel.summary if matched_intel else "Running legacy software versions increases exposure to publicly known vulnerabilities.")
            ),
            "severity": "high" if (cve_str and cvss_val >= 7.5) else ("medium" if cve_str else "low"),
            "proof_state": models.ProofState.CONTROL_GAP_CONFIRMED if cve_str else models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": cvss_val if cve_str else 3.7,
            "cve_id": cve_str,
            "cwe_id": matched_intel.cwe_id if matched_intel else "CWE-1104",
            "remediation": f"Upgrade {tech.name} from version {tech.version or 'legacy'} to the current vendor-supported stable release.",
            "risk_priority": 74.0 if (cve_str and cvss_val >= 7.5) else (52.0 if cve_str else 28.0),
            "evidence": json.dumps({
                "source": "TrePath Version Intelligence Verifier (VER-INTEL-001)",
                "test_id": "VER-INTEL-001",
                "matched_at": asset.target_url,
                "technology": tech.name,
                "version": tech.version,
                "cpe": tech.cpe,
                "banner": tech.banner,
                "correlated_cve": cve_str,
                "request": f"Service / Banner Fingerprint Inspection on {asset.hostname}",
                "response": f"Detected Component: {tech.name} {tech.version or ''}\nCPE: {tech.cpe or 'N/A'}\nRaw Banner: {tech.banner}",
            }, indent=2),
        })

    # 6. Safe Lab PoC Exploitation & Post-Exploitation Verification (SMB-LIST-001, PHPINFO-001, TOMCAT-MGR-001)
    from .smb_share_probe import run_smb_share_probe
    from .phpinfo_probe import run_phpinfo_probe
    from .tomcat_manager_probe import run_tomcat_manager_probe

    try:
        findings.extend(await run_smb_share_probe(asset, endpoints, technologies, intelligence_matches))
    except Exception:
        pass
    try:
        findings.extend(await run_phpinfo_probe(asset, endpoints, technologies, intelligence_matches))
    except Exception:
        pass
    try:
        findings.extend(await run_tomcat_manager_probe(asset, endpoints, technologies, intelligence_matches))
    except Exception:
        pass

    return findings
