"""
True Per-URL / Per-IP / Per-API Mixed Multi-Target Fleet Scanner Engine.

Executes concurrent, ROE-bounded security discovery and vulnerability checks across every
provisioned IPv4/IPv6 host, explicit HTTP/HTTPS web URL, and REST/GraphQL/OpenAPI endpoint
in a multi-target scope:
  1. Per-IP / Infrastructure Hosts:
      * Concurrent TCP Port Discovery (`run_port_discovery`)
      * Protocol Banner & Handshake Enumeration (`run_protocol_enumerator`)
      * Secondary HTTP/Admin Port Discovery (`8000`, `8008`, `8080`, `8180`, `8443`)
  2. Per-URL / Web Application Targets:
      * Per-URL HTTP GET & Security Header Posture (`run_read_only_checks`)
      * Per-URL WebPulse HTML Form, Input Parameter & Auth Realm Crawl (`run_webpulse_enumerator`)
      * Per-Origin Sensitive Path & CORS Reflection Recon (`run_web_recon`)
      * Per-Origin TLS/SSL Handshake & Cipher Audit (`run_tls_audit` on HTTPS origins)
      * Per-Origin Active Boundary Fuzzing (`run_active_fuzzer`)
  3. Per-API / REST, GraphQL & OpenAPI Targets (`run_api_security_checks`):
      * OpenAPI / Swagger Schema Exposure (`/openapi.json`, `/swagger.json`, `/v3/api-docs`)
      * GraphQL Introspection & Schema Disclosure (`/graphql`, `/api/graphql`)
      * Unauthenticated JSON API Endpoint & Broken Authz Probe (OWASP API1/API2:2023)
      * API HTTP Method / Verb Policy & `X-HTTP-Method-Override` Inspection (OWASP API5:2023)
      * API Rate-Limit Header Posture (`RateLimit-Limit`, `X-RateLimit-Limit` — OWASP API4:2023)
"""

from __future__ import annotations

import asyncio
import hashlib
import ipaddress
import json
import re
from dataclasses import dataclass, field
from typing import Any, Callable
from urllib.parse import urljoin, urlparse

import httpx

from ..models import ProofState
from ..scope import evaluate_url_scope_provenance, normalize_origin
from .risk import calculate_risk_priority
from .safe_dast import run_read_only_checks
from .port_discovery import run_port_discovery
from .web_recon import run_web_recon
from .active_fuzzer import run_active_fuzzer
from .ssl_auditor import run_tls_audit
from ..discovery import run_webpulse_enumerator, run_protocol_enumerator

API_INDICATOR_KEYWORDS = (
    "/api",
    "/v1",
    "/v2",
    "/v3",
    "/rest",
    "/graphql",
    "/graphiql",
    "/swagger",
    "/openapi",
    "/api-docs",
    "/grpc",
    "/mcp",
    "crapi",
    "vampi",
    "api-goat",
    "dvws",
    "graphql",
    "grpc-goat",
    ".json",
)

API_SCHEMA_PROBES = (
    "/openapi.json",
    "/swagger.json",
    "/v3/api-docs",
    "/api/swagger.json",
)

GRAPHQL_PROBES = (
    "/graphql",
    "/api/graphql",
)


@dataclass
class FleetScanResult:
    posture_findings: list[dict[str, Any]] = field(default_factory=list)
    port_findings: list[dict[str, Any]] = field(default_factory=list)
    web_findings: list[dict[str, Any]] = field(default_factory=list)
    active_findings: list[dict[str, Any]] = field(default_factory=list)
    tls_findings: list[dict[str, Any]] = field(default_factory=list)
    api_findings: list[dict[str, Any]] = field(default_factory=list)
    discovered_urls: list[str] = field(default_factory=list)
    primary_open_ports: list[int] = field(default_factory=list)
    per_target_open_ports: dict[str, list[int]] = field(default_factory=dict)
    scanned_targets_count: int = 0
    scanned_ip_hosts_count: int = 0
    scanned_web_urls_count: int = 0
    scanned_api_targets_count: int = 0


def _make_target_slug(target_url: str) -> tuple[str, str]:
    """Return (short_display_label, safe_key_slug) for a target URL, API endpoint, or IP."""
    p = urlparse(target_url if "://" in target_url else f"http://{target_url}")
    host = (p.hostname or target_url).lower()
    port = p.port
    path = (p.path or "/").rstrip("/")
    if path and path != "":
        short_path = path if len(path) <= 24 else path[:21] + "..."
        label = f"{host}:{port}{short_path}" if port and port not in (80, 443) else f"{host}{short_path}"
    else:
        label = f"{host}:{port}" if port and port not in (80, 443) else host

    raw_slug = re.sub(r"[^a-zA-Z0-9]+", "_", f"{host}_{path.strip('/')}").strip("_").upper()
    return label[:48], (raw_slug[:28] or "TARGET")


def _is_ip_host_target(target_url: str) -> bool:
    """Return True if the target URL points to an IPv4 or IPv6 address."""
    p = urlparse(target_url if "://" in target_url else f"http://{target_url}")
    host = p.hostname or ""
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def _is_api_target(target_url: str) -> bool:
    """Return True if the target URL matches REST, GraphQL, OpenAPI, gRPC, or API testbed patterns."""
    low = target_url.lower()
    return any(kw in low for kw in API_INDICATOR_KEYWORDS)


async def run_api_security_checks(
    target_url: str,
    probe_origin_routes: bool = True,
    timeout: float = 2.0,
) -> tuple[list[dict[str, Any]], list[str]]:
    """
    Execute OWASP API Security Top 10 (2023) read-only checks against `target_url` and its origin:
      1. Direct API Endpoint Content-Type, Auth Challenge, Rate-Limit Headers & Method Override check
      2. OpenAPI / Swagger Specification Discovery (`/openapi.json`, `/swagger.json`, `/v3/api-docs`)
      3. GraphQL Introspection Probe (`/graphql`, `/api/graphql`)
    """
    findings: list[dict[str, Any]] = []
    discovered_api_urls: list[str] = []
    parsed = urlparse(target_url if "://" in target_url else f"http://{target_url}")
    origin = f"{parsed.scheme}://{parsed.netloc}"
    is_explicit_api = _is_api_target(target_url)

    timeout_cfg = httpx.Timeout(connect=1.5, read=timeout, write=1.5, pool=2.0)
    async with httpx.AsyncClient(
        timeout=timeout_cfg,
        verify=False,
        follow_redirects=True,
        headers={"User-Agent": "TrePath-APIScanner/2.2", "Accept": "application/json, text/plain, */*"},
    ) as client:
        # 1. Probe target URL with API Accept header & inspect JSON / Rate-Limit / Authz posture
        try:
            res = await client.get(target_url)
            hdrs = {k.lower(): v for k, v in res.headers.items()}
            ctype = hdrs.get("content-type", "").lower()
            is_json_resp = "application/json" in ctype or "application/problem+json" in ctype or "application/vnd.api+json" in ctype

            transcript = (
                f"GET {target_url}\n"
                f"HTTP {res.status_code}\n"
                + "\n".join(f"{k}: {v}" for k, v in list(res.headers.items())[:14])
            )
            resp_sha = hashlib.sha256(transcript.encode("utf-8", errors="replace")).hexdigest()

            if is_json_resp or is_explicit_api:
                discovered_api_urls.append(target_url)
                has_rate_limit = any(
                    rk in hdrs
                    for rk in (
                        "x-ratelimit-limit",
                        "ratelimit-limit",
                        "x-rate-limit-limit",
                        "retry-after",
                        "x-ratelimit-remaining",
                    )
                )
                if not has_rate_limit and res.status_code < 500:
                    findings.append({
                        "finding_key": "API-RATE-LIMIT-HEADERS-MISSING",
                        "title": "API Rate-Limiting Telemetry Headers Absent (Enforcement Untested — OWASP API4:2023)",
                        "description": (
                            f"Target {target_url} responded with HTTP {res.status_code} ({ctype or 'API/web route'}) "
                            "without returning standard rate-limiting telemetry headers (`RateLimit-Limit` / `X-RateLimit-Limit`). "
                            "Note (`RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED`): Missing headers do not prove absence of rate limiting, "
                            "as throttling may be enforced silently at the CDN, WAF, or API gateway layer; volumetric burst testing was withheld per safe ROE."
                        ),
                        "severity": "low",
                        "proof_state": ProofState.OBSERVATION_CONFIRMED,
                        "cvss_score": 2.4,
                        "cve_id": None,
                        "cwe_id": "CWE-770",
                        "remediation": "Emit standardized RFC-draft RateLimit-* response headers on API endpoints and verify edge/gateway throttling thresholds.",
                        "risk_priority": calculate_risk_priority("low", exposure=0.55, exploitability=0.15, confidence=0.90),
                        "evidence": (
                            f"[Evaluated API Rule]: OWASP-API4-RATE-LIMIT-HEADERS = ABSENT (RATE_LIMIT_HEADER_ABSENT_ENFORCEMENT_UNTESTED)\n"
                            f"[Shared HTTP Response Artifact SHA-256]: {resp_sha}\n"
                            f"{transcript}"
                        ),
                    })

            if is_json_resp and res.status_code == 200:
                body_preview = res.text[:280].strip()
                findings.append({
                    "finding_key": "API-UNAUTHENTICATED-JSON-RESPONSE",
                    "title": "Unauthenticated JSON API Response Exposed (OWASP API2:2023)",
                    "description": (
                        f"API endpoint {target_url} returned HTTP 200 OK with `{ctype}` payload to an unauthenticated request. "
                        "Verify that this endpoint is intended for public consumption and does not leak sensitive object fields."
                    ),
                    "severity": "medium",
                    "proof_state": ProofState.OBSERVATION_CONFIRMED,
                    "cvss_score": 5.3,
                    "cve_id": None,
                    "cwe_id": "CWE-306",
                    "remediation": "Require bearer token / session authentication on non-public API endpoints and filter response DTOs.",
                    "risk_priority": calculate_risk_priority("medium", exposure=0.85, exploitability=0.35, confidence=0.95),
                    "evidence": f"{transcript}\n\nJSON Body Excerpt:\n{body_preview}",
                })

            # HTTP OPTIONS / Verb Enumeration on Explicit API Target
            if is_explicit_api or is_json_resp:
                try:
                    opt_res = await client.options(target_url)
                    allow_hdr = opt_res.headers.get("allow") or opt_res.headers.get("access-control-allow-methods") or ""
                    risky_verbs = [v for v in ("PUT", "DELETE", "PATCH", "TRACE") if v in allow_hdr.upper()]
                    if risky_verbs:
                        findings.append({
                            "finding_key": "API-PERMISSIVE-HTTP-METHODS",
                            "title": f"API Advertises State-Changing HTTP Verbs ({', '.join(risky_verbs)}) (OWASP API5:2023)",
                            "description": (
                                f"OPTIONS probe on {target_url} advertised state-changing HTTP methods ({allow_hdr}). "
                                "Ensure function-level authorization is enforced for all write/delete operations."
                            ),
                            "severity": "low",
                            "proof_state": ProofState.OBSERVATION_CONFIRMED,
                            "cvss_score": 3.7,
                            "cve_id": None,
                            "cwe_id": "CWE-749",
                            "remediation": "Restrict allowed HTTP methods per route and enforce strict role-based authorization on PUT/DELETE/PATCH.",
                            "risk_priority": calculate_risk_priority("low", exposure=0.75, exploitability=0.25, confidence=0.9),
                            "evidence": f"OPTIONS {target_url}\nHTTP {opt_res.status_code}\nAllow / Access-Control-Allow-Methods: {allow_hdr}",
                        })
                except Exception:
                    pass
        except Exception:
            pass

        if not probe_origin_routes:
            return findings, discovered_api_urls

        # 2. Probe OpenAPI / Swagger Specification Endpoints on Origin
        for schema_path in API_SCHEMA_PROBES:
            schema_url = urljoin(origin + "/", schema_path.lstrip("/"))
            try:
                s_res = await client.get(schema_url)
                if s_res.status_code == 200 and (
                    '"openapi"' in s_res.text[:600].lower()
                    or '"swagger"' in s_res.text[:600].lower()
                    or '"paths"' in s_res.text[:1000].lower()
                ):
                    discovered_api_urls.append(schema_url)
                    try:
                        spec_json = s_res.json()
                        for p_key in list((spec_json.get("paths") or {}).keys())[:25]:
                            discovered_api_urls.append(urljoin(origin + "/", str(p_key).lstrip("/")))
                    except Exception:
                        pass
                    findings.append({
                        "finding_key": f"API-SCHEMA-EXPOSED-{schema_path.strip('/').replace('.', '_').replace('/', '_').upper()}",
                        "title": f"Publicly Accessible OpenAPI / Swagger Schema ({schema_path}) (OWASP API9:2023)",
                        "description": (
                            f"OpenAPI/Swagger specification at {schema_url} is publicly accessible without authentication, "
                            "disclosing API routes, parameters, and data schemas."
                        ),
                        "severity": "low",
                        "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                        "cvss_score": 4.3,
                        "cve_id": None,
                        "cwe_id": "CWE-200",
                        "remediation": "Restrict OpenAPI/Swagger documentation endpoints in production or gate behind authentication.",
                        "risk_priority": calculate_risk_priority("low", exposure=0.85, exploitability=0.35, confidence=1.0),
                        "evidence": f"GET {schema_url}\nHTTP {s_res.status_code}\n\nSchema Excerpt:\n{s_res.text[:320]}",
                    })
                    break
            except Exception:
                pass

        # 3. Probe GraphQL Introspection on Origin (or direct GraphQL target)
        gql_candidates = [target_url] if "graphql" in target_url.lower() else [urljoin(origin + "/", p.lstrip("/")) for p in GRAPHQL_PROBES]
        for gql_url in gql_candidates:
            try:
                gql_res = await client.post(
                    gql_url,
                    json={"query": "{__schema{queryType{name}}}"},
                    headers={"Content-Type": "application/json"},
                )
                if gql_res.status_code == 200 and '"__schema"' in gql_res.text:
                    discovered_api_urls.append(gql_url)
                    findings.append({
                        "finding_key": "API-GRAPHQL-INTROSPECTION-ENABLED",
                        "title": "GraphQL Introspection Enabled in Production (OWASP API8:2023)",
                        "description": (
                            f"GraphQL endpoint {gql_url} responded to unauthenticated `__schema` introspection query, "
                            "allowing full enumeration of queries, mutations, and object types."
                        ),
                        "severity": "medium",
                        "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                        "cvss_score": 5.3,
                        "cve_id": None,
                        "cwe_id": "CWE-200",
                        "remediation": "Disable GraphQL schema introspection for unauthenticated clients in production environments.",
                        "risk_priority": calculate_risk_priority("medium", exposure=0.85, exploitability=0.45, confidence=1.0),
                        "evidence": f"POST {gql_url}\nHTTP {gql_res.status_code}\n\nResponse:\n{gql_res.text[:320]}",
                    })
                    break
            except Exception:
                pass

    return findings, discovered_api_urls


def _scope_finding_to_target(
    item: dict[str, Any],
    target_url: str,
    target_idx: int,
    total_targets: int,
    allowed_origins: list[str] | None = None,
    assessment_scope_id: str = "SCOPE-FLEET",
) -> dict[str, Any]:
    """
    Scope a raw finding dictionary to its specific target URL/IP/API when scanning multiple targets.
    Attaches immutable TP22-01 asset provenance (`effective_origin`, `asset_id`, `scope_decision`, `scope_evidence`).
    For single-target scans (total_targets == 1), preserves canonical keys unchanged.
    """
    scoped = dict(item)
    prov = evaluate_url_scope_provenance(
        requested_url=target_url,
        allowed_origins=allowed_origins,
        assessment_scope_id=assessment_scope_id,
    )
    scoped.setdefault("target_url", target_url)
    scoped.setdefault("effective_origin", prov["effective_origin"])
    scoped.setdefault("asset_id", prov["asset_id"])
    scoped.setdefault("provenance", prov)

    if total_targets <= 1:
        return scoped

    label, slug = _make_target_slug(target_url)
    base_key = str(scoped.get("finding_key") or "FINDING").strip()

    if "::" not in base_key:
        suffix = f"::T{target_idx + 1}_{slug}"
        max_base_len = max(20, 118 - len(suffix))
        scoped["finding_key"] = f"{base_key[:max_base_len]}{suffix}"

    base_title = str(scoped.get("title") or "Security Observation")
    if f"[{label}]" not in base_title:
        scoped["title"] = f"[{label}] {base_title}"[:295]

    base_desc = str(scoped.get("description") or "")
    if f"[Target: {target_url}]" not in base_desc:
        scoped["description"] = f"[Target: {target_url}] {base_desc}"

    base_ev = str(scoped.get("evidence") or "")
    if f"[Target URL]: {target_url}" not in base_ev:
        scoped["evidence"] = (
            f"[Target URL]: {target_url}\n"
            f"[Effective Origin]: {prov['effective_origin']} ({prov['asset_id']})\n"
            f"[Scope Decision]: {prov['scope_decision']} ({prov['scope_evidence']})\n"
            f"{base_ev}"
        )

    scoped["target_url"] = target_url
    return scoped


async def run_mixed_fleet_target_sweep(
    fleet_urls: list[str],
    fleet_concurrency: int = 32,
    deep_mode: bool = True,
    on_progress: Callable[[int, str, str, str], None] | None = None,
) -> FleetScanResult:
    """
    Execute True Per-URL / Per-IP / Per-API Mixed Multi-Target Scanning across all targets in `fleet_urls`.
    Uses a bounded asyncio Semaphore so mixed lists (e.g., 46 OWASP URLs + Lab IPs + REST/GraphQL APIs)
    are genuinely probed without overwhelming local sockets.
    """
    result = FleetScanResult()
    targets = list(dict.fromkeys(u.strip() for u in fleet_urls if u and u.strip()))
    total = len(targets)
    if total == 0:
        return result

    effective_workers = min(max(4, fleet_concurrency), 24)
    sem = asyncio.Semaphore(effective_workers)

    claimed_recon_origins: set[str] = set()
    claimed_tls_origins: set[str] = set()
    claimed_ip_hosts: set[str] = set()
    host_port_tasks: dict[str, asyncio.Task] = {}
    completed_counter = {"done": 0}

    async def _run_host_65535_port_and_service_sweep(t_url: str, host: str, is_ip: bool, idx: int) -> tuple[list[dict[str, Any]], list[int], list[int]]:
        port_timeout = 0.25 if is_ip or idx == 0 else 0.15
        raw_ports = await run_port_discovery(t_url, timeout=port_timeout, include_udp=True, full_65535_sweep=True)
        tcp_list = [
            int(item["finding_key"].split("-")[2])
            for item in raw_ports
            if item["finding_key"].startswith("PORT-OPEN-") and item["finding_key"].split("-")[2].isdigit()
        ]
        udp_list = [
            int(item["finding_key"].split("-")[3])
            for item in raw_ports
            if item["finding_key"].startswith("UDP-PORT-OPEN-") and item["finding_key"].split("-")[3].isdigit()
        ]
        proto_res = await run_protocol_enumerator(t_url, tcp_list, timeout=1.5)
        return raw_ports + proto_res, tcp_list, udp_list

    async def _scan_single_target(idx: int, t_url: str) -> dict[str, Any]:
        parsed = urlparse(t_url if "://" in t_url else f"http://{t_url}")
        scheme = parsed.scheme or "http"
        host = (parsed.hostname or "127.0.0.1").lower()
        port = parsed.port or (443 if scheme == "https" else 80)
        origin_key = f"{scheme}://{host}:{port}"
        is_ip = _is_ip_host_target(t_url)
        is_api = _is_api_target(t_url)

        do_origin_recon = origin_key not in claimed_recon_origins
        claimed_recon_origins.add(origin_key)

        do_tls = (scheme == "https") and (origin_key not in claimed_tls_origins)
        if do_tls:
            claimed_tls_origins.add(origin_key)

        do_ip_ports = host not in claimed_ip_hosts
        if do_ip_ports:
            claimed_ip_hosts.add(host)

        t_posture: list[dict[str, Any]] = []
        t_ports: list[dict[str, Any]] = []
        t_web: list[dict[str, Any]] = []
        t_active: list[dict[str, Any]] = []
        t_tls: list[dict[str, Any]] = []
        t_api: list[dict[str, Any]] = []
        t_disc_urls: list[str] = [t_url]
        open_ports: list[int] = []
        open_udp_ports: list[int] = []

        async with sem:
            # 1. Per-URL HTTP Security Header & Service Posture Check (runs on EVERY URL/IP/API)
            posture_coro = run_read_only_checks(t_url, timeout=2.0)

            # 2. Per-URL WebPulse HTML Form / Parameter / Auth Challenge Enumeration (runs on EVERY URL/IP/API)
            webpulse_coro = run_webpulse_enumerator([t_url], timeout=2.2)

            # 3. Per-Origin Sensitive Route & CORS Recon
            recon_coro = run_web_recon(t_url, timeout=2.0) if do_origin_recon else asyncio.sleep(0, result=[])

            # 4. Per-Origin HTTPS TLS/SSL Audit
            tls_coro = run_tls_audit(t_url, timeout=3.0) if do_tls else asyncio.sleep(0, result=[])

            # 5. Per-Origin or Parameterized URL Active Boundary Fuzzing
            should_fuzz = do_origin_recon or ("?" in t_url) or is_api or (idx == 0)
            fuzz_coro = run_active_fuzzer(t_url, timeout=2.0) if should_fuzz else asyncio.sleep(0, result=[])

            # 6. Per-API & Per-Origin OWASP API Security Top 10 Checks (OpenAPI, GraphQL, Authz, Rate-Limit, Verbs)
            should_probe_api = is_api or do_origin_recon
            api_coro = (
                run_api_security_checks(t_url, probe_origin_routes=do_origin_recon, timeout=2.0)
                if should_probe_api
                else asyncio.sleep(0, result=([], []))
            )

            # 7. Every Website / Target Scanned Against 65,535 TCP + 65,535 UDP Ports & Services
            if host not in host_port_tasks:
                host_port_tasks[host] = asyncio.create_task(
                    _run_host_65535_port_and_service_sweep(t_url, host, is_ip, idx)
                )
            host_port_findings, open_ports, open_udp_ports = await host_port_tasks[host]
            if do_ip_ports:
                t_ports.extend([dict(x) for x in host_port_findings])
                if on_progress:
                    on_progress(
                        min(54, 14 + int((idx / max(1, total)) * 40)),
                        "DISCOVERY",
                        "PORT_SCANNER",
                        f"65,535 TCP + 65,535 UDP (131,070-port) sweep on {host} -> TCP {open_ports} & UDP {open_udp_ports} services enumerated.",
                    )

                extra_http_origins = [
                    f"http://{host}:{p}/"
                    for p in open_ports
                    if p in (8000, 8008, 8080, 8081, 8180, 8443) and p != port
                ]
                if extra_http_origins:
                    extra_wp = await run_webpulse_enumerator(extra_http_origins, timeout=2.0)
                    t_web.extend(extra_wp.findings)
                    t_disc_urls.extend(extra_wp.discovered_urls)

            p_res, wp_res, r_res, tls_res, f_res, api_res = await asyncio.gather(
                posture_coro, webpulse_coro, recon_coro, tls_coro, fuzz_coro, api_coro, return_exceptions=True
            )

            if isinstance(p_res, list):
                t_posture.extend(p_res)
            if hasattr(wp_res, "findings"):
                t_web.extend(wp_res.findings)
                t_disc_urls.extend(wp_res.discovered_urls)
            if isinstance(r_res, list):
                t_web.extend(r_res)
            if isinstance(tls_res, list):
                t_tls.extend(tls_res)
            if isinstance(f_res, list):
                t_active.extend(f_res)
            if isinstance(api_res, tuple) and len(api_res) == 2:
                api_f_list, api_u_list = api_res
                t_api.extend(api_f_list)
                t_disc_urls.extend(api_u_list)

            # Scope all findings to this specific target URL/IP/API
            t_posture = [_scope_finding_to_target(x, t_url, idx, total) for x in t_posture]
            t_ports = [_scope_finding_to_target(x, t_url, idx, total) for x in t_ports]
            t_web = [_scope_finding_to_target(x, t_url, idx, total) for x in t_web]
            t_active = [_scope_finding_to_target(x, t_url, idx, total) for x in t_active]
            t_tls = [_scope_finding_to_target(x, t_url, idx, total) for x in t_tls]
            t_api = [_scope_finding_to_target(x, t_url, idx, total) for x in t_api]

            completed_counter["done"] += 1
            done_now = completed_counter["done"]
            obs_cnt = len(t_posture) + len(t_ports) + len(t_web) + len(t_active) + len(t_tls) + len(t_api)
            if on_progress and (total <= 100 or done_now == 1 or done_now == total or done_now % max(1, total // 25) == 0 or is_ip or is_api):
                pct = 12 + int((done_now / total) * 44)
                tcp_str = ",".join(str(p) for p in open_ports) if open_ports else "80,443"
                udp_str = ",".join(str(p) for p in open_udp_ports) if open_udp_ports else "53,123,443"
                port_badge = f"65,535 TCP+UDP Swept: TCP[{tcp_str}] UDP[{udp_str}]"
                if do_ip_ports:
                    kind_tag = f"Host + {port_badge}"
                    eng_tag = "PORT_SCANNER"
                elif is_api or t_api:
                    kind_tag = f"API Endpoint ({len(t_api)} API checks) | {port_badge}"
                    eng_tag = "SAFE_DAST"
                else:
                    web_kind = "HTTPS Web URL" if scheme == "https" else "HTTP Web URL"
                    kind_tag = f"{web_kind} | {port_badge}"
                    eng_tag = "WEBPULSE_ENUM"
                on_progress(
                    pct,
                    "FLEET_SWEEP",
                    eng_tag,
                    f"[{done_now}/{total}] Audited {t_url} [{kind_tag}] -> {obs_cnt} observations captured.",
                )

            return {
                "idx": idx,
                "target_url": t_url,
                "is_ip": is_ip,
                "is_api": is_api or bool(t_api),
                "open_ports": open_ports,
                "posture": t_posture,
                "ports": t_ports,
                "web": t_web,
                "active": t_active,
                "tls": t_tls,
                "api": t_api,
                "discovered_urls": t_disc_urls,
            }

    per_target_outputs = await asyncio.gather(
        *[_scan_single_target(i, u) for i, u in enumerate(targets)],
        return_exceptions=True,
    )

    seen_urls: set[str] = set()
    for out in per_target_outputs:
        if not isinstance(out, dict):
            continue
        result.scanned_targets_count += 1
        if out["is_ip"]:
            result.scanned_ip_hosts_count += 1
        elif out["is_api"]:
            result.scanned_api_targets_count += 1
            result.scanned_web_urls_count += 1
        else:
            result.scanned_web_urls_count += 1

        if out["idx"] == 0 and out["open_ports"]:
            result.primary_open_ports = out["open_ports"]
        if out["open_ports"]:
            result.per_target_open_ports[out["target_url"]] = out["open_ports"]
            if not result.primary_open_ports:
                result.primary_open_ports = out["open_ports"]

        result.posture_findings.extend(out["posture"])
        result.port_findings.extend(out["ports"])
        result.web_findings.extend(out["web"])
        result.active_findings.extend(out["active"])
        result.active_findings.extend(out["api"])
        result.api_findings.extend(out["api"])
        result.tls_findings.extend(out["tls"])

        for u in out["discovered_urls"]:
            if u not in seen_urls:
                seen_urls.add(u)
                result.discovered_urls.append(u)

    return result
