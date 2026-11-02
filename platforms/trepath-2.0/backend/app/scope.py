from __future__ import annotations

import ipaddress
import json
import re
import socket
from typing import Any
from urllib.parse import urlparse
from fastapi import HTTPException

MAX_FLEET_IPS = 10000
MAX_FLEET_TARGETS = 10000

OWASP_TESTING_BENCHMARK_URLS: list[str] = [
    "https://owasp.org/projects/juice-shop",
    "https://owasp.org/www-project-juice-shop/",
    "https://github.com/digininja/DVWA",
    "https://owasp.org/www-project-webgoat/",
    "https://github.com/OWASP/crAPI",
    "https://github.com/webpwnized/mutillidae",
    "https://github.com/raesene/bWAPP",
    "https://github.com/OWASP/SecurityShepherd",
    "https://github.com/OWASP/NodeGoat",
    "https://github.com/adeyosemanputra/pygoat",
    "https://github.com/OWASP/railsgoat",
    "https://github.com/stamparm/DSVW",
    "https://github.com/adamdoupe/WackoPicko",
    "https://github.com/OWASP/Benchmark",
    "https://google-gruyere.appspot.com/",
    "https://github.com/rapid7/hackazon",
    "https://github.com/Peruggia/Peruggia",
    "https://github.com/OWASP/django-goat",
    "https://github.com/OWASP/WebGoatPHP",
    "https://github.com/globocom/secDevLabs",
    "https://github.com/OWASP/VulnerableApp",
    "https://github.com/OWASP/VulnerableApp-facade",
    "https://github.com/blabla1337/skf-labs",
    "https://github.com/snoopysecurity/dvws",
    "https://github.com/erev0s/VAmPI",
    "https://github.com/ine-labs/REST-API-Goat",
    "https://github.com/commjoen/dv-restaurant",
    "https://github.com/dolevf/Black-Hat-GraphQL",
    "https://github.com/rootxjs/grpc-goat",
    "https://github.com/interference-security/DVWS",
    "https://github.com/cr0hn/nosqlinjection",
    "https://github.com/sectooladdict/wavsep",
    "https://github.com/OWASP-Benchmark/BenchmarkJava",
    "https://github.com/google/security-testbeds",
    "https://portswigger.net/web-security",
    "https://pentesterlab.com/",
    "https://www.hackthebox.com/",
    "https://tryhackme.com/",
    "https://www.hackthissite.org/",
    "https://www.root-me.org/",
    "https://www.hackinghub.io/",
    "https://pentest-ground.com/",
    "https://genai.owasp.org/",
    "https://gandalf.lakera.ai/",
    "https://owasp.org/www-project-mcp-top-10/",
    "https://vwad.owasp.org/",
]

_CSV_HEADER_WORDS = {
    "ip",
    "ips",
    "ip_address",
    "ipaddress",
    "url",
    "urls",
    "target",
    "targets",
    "target_url",
    "host",
    "hosts",
    "hostname",
    "domain",
    "cidr",
    "subnet",
    "address",
    "endpoint",
    "notes",
    "note",
    "label",
    "description",
    "name",
}


def _looks_like_target_token(tok: str) -> bool:
    """Return True if token looks like an IPv4/IPv6 address, CIDR, IP range, URL, or domain hostname."""
    if not tok or tok.lower() in _CSV_HEADER_WORDS:
        return False
    low = tok.lower()
    if low.startswith(("http://", "https://")):
        return True
    _, core, _, _ = _strip_url_wrapper(tok)
    if re.match(r"^\d+\.\d+\.\d+\.\d+(?:/\d+|-(?:\d+\.\d+\.\d+\.\d+|\d+))?$", core):
        return True
    if ":" in core or "." in core or low == "localhost":
        return True
    return False


def normalize_origin(value: str) -> str:
    val = (value or "").strip()
    if not val:
        raise HTTPException(400, "Empty target origin")
    # If bare IPv4/IPv6 is provided without scheme, normalize to http://<ip>:80
    try:
        ip_obj = ipaddress.ip_address(val.strip("/"))
        return f"http://{ip_obj}:80"
    except ValueError:
        pass

    p = urlparse(val if "://" in val else f"http://{val}")
    if p.scheme not in ("http", "https") or not p.hostname:
        raise HTTPException(400, "Only explicit HTTP(S) origins, IP addresses, or CIDR/IP ranges are allowed")
    if p.username or p.password:
        raise HTTPException(400, "Credentials in target URLs are prohibited")
    port = p.port or (443 if p.scheme == "https" else 80)
    return f"{p.scheme}://{p.hostname.lower()}:{port}"


def _strip_url_wrapper(token: str) -> tuple[str, str, int, str]:
    """Extract (scheme, raw_host_or_cidr_or_range, port, path_and_query) from a token."""
    t = token.strip()
    scheme = "http"
    port = 80
    has_explicit_scheme = False
    if t.lower().startswith("https://"):
        scheme = "https"
        port = 443
        t = t[len("https://") :]
        has_explicit_scheme = True
    elif t.lower().startswith("http://"):
        scheme = "http"
        port = 80
        t = t[len("http://") :]
        has_explicit_scheme = True
    if "@" in t:
        raise HTTPException(400, "Credentials in target URLs are prohibited")

    # Separate path/query if NOT a CIDR block
    path_part = "/"
    if "/" in t:
        first_slash = t.index("/")
        host_cand = t[:first_slash]
        rest = t[first_slash + 1 :]
        # Check if it's IPv4 CIDR (e.g. 192.168.1.0/24) and had no scheme or path after prefixlen
        if not has_explicit_scheme and re.match(r"^\d+\.\d+\.\d+\.\d+$", host_cand) and re.match(r"^\d{1,2}$", rest.strip("/")):
            return scheme, f"{host_cand}/{rest.strip('/')}", port, "/"
        path_part = "/" + rest
        t = host_cand

    if ":" in t and "/" not in t:
        host_part, port_part = t.rsplit(":", 1)
        if port_part.isdigit():
            t = host_part
            port = int(port_part)
            if port == 443 and not has_explicit_scheme:
                scheme = "https"
    return scheme, t, port, path_part


def _extract_tokens_from_spec(spec: str | list[str]) -> list[str]:
    """Parse raw text, JSON arrays, CSV rows, or string lists into clean target tokens."""
    lines: list[str] = []
    if isinstance(spec, list):
        for item in spec:
            s = str(item or "").strip()
            if s:
                lines.extend(s.splitlines())
    else:
        raw_str = str(spec or "").strip()
        if raw_str.startswith("[") or raw_str.startswith("{"):
            try:
                parsed_json = json.loads(raw_str)
                if isinstance(parsed_json, list):
                    for entry in parsed_json:
                        if isinstance(entry, dict):
                            for k in ("target", "url", "ip", "host", "hostname", "cidr"):
                                if entry.get(k):
                                    lines.append(str(entry[k]))
                        elif entry:
                            lines.append(str(entry))
                elif isinstance(parsed_json, dict):
                    for k in ("targets", "urls", "ips", "hosts", "items"):
                        if isinstance(parsed_json.get(k), list):
                            for v in parsed_json[k]:
                                lines.append(str(v))
                tokens_from_json: list[str] = []
                for l_val in lines:
                    tok = l_val.strip().strip('"').strip("'")
                    if _looks_like_target_token(tok):
                        tokens_from_json.append(tok)
                return tokens_from_json
            except Exception:
                lines = raw_str.splitlines()
        else:
            lines = raw_str.splitlines()

    tokens: list[str] = []
    for line in lines:
        cleaned = line.strip()
        if not cleaned or cleaned.startswith("#") or cleaned.startswith("//"):
            continue
        # Split on comma, semicolon, tab, or whitespace
        parts = re.split(r"[\s,;\t]+", cleaned)
        for p in parts:
            tok = p.strip().strip('"').strip("'")
            if not _looks_like_target_token(tok):
                continue
            tokens.append(tok)
    return tokens


def expand_target_specification(
    spec: str | list[str] | None = None,
    max_hosts: int = MAX_FLEET_IPS,
    *,
    raw_text: str | list[str] | None = None,
    max_targets: int | None = None,
    filename: str | None = None,
) -> dict[str, Any]:
    """
    Expand a target specification (single or bulk IPv4/IPv6 addresses, HTTP/HTTPS URLs,
    CIDR subnets, IPv4 start-end ranges, or uploaded CSV/TXT/JSON target lists)
    into up to 10,000 normalized target URLs and ROE origins.
    """
    effective_spec = raw_text if raw_text is not None else spec
    effective_max = max_targets if max_targets is not None else max_hosts
    effective_cap = min(max(1, effective_max), MAX_FLEET_IPS)
    tokens = _extract_tokens_from_spec(effective_spec or "")
    if not tokens:
        raise HTTPException(400, "At least one target IP, URL, CIDR subnet, or IP range is required")

    expanded_hosts: list[str] = []
    expanded_urls: list[str] = []
    allowed_origins: list[str] = []
    seen_targets: set[str] = set()
    seen_origins: set[str] = set()
    segments_summary: list[dict[str, Any]] = []

    ip_count = 0
    url_count = 0
    cidr_count = 0
    range_count = 0

    def _add_target(scheme: str, host_str: str, port: int, path: str = "/", is_url_entry: bool = False):
        nonlocal ip_count, url_count
        norm_host = host_str.lower()
        clean_path = path if path.startswith("/") else f"/{path}"
        default_port = (scheme == "http" and port == 80) or (scheme == "https" and port == 443)
        full_url = (
            f"{scheme}://{norm_host}{clean_path}"
            if default_port
            else f"{scheme}://{norm_host}:{port}{clean_path}"
        )
        dedup_key = full_url.rstrip("/") if clean_path == "/" else full_url
        if dedup_key in seen_targets:
            return
        if len(seen_targets) >= MAX_FLEET_IPS:
            raise HTTPException(
                400,
                f"Target scope exceeds maximum provisioned capacity of {MAX_FLEET_IPS:,} targets (IPs/URLs).",
            )
        seen_targets.add(dedup_key)
        expanded_hosts.append(norm_host)
        expanded_urls.append(full_url)

        origin_str = f"{scheme}://{norm_host}:{port}"
        if origin_str not in seen_origins:
            seen_origins.add(origin_str)
            allowed_origins.append(origin_str)

        if is_url_entry:
            url_count += 1
        else:
            ip_count += 1

    for tok in tokens:
        has_scheme = tok.lower().startswith(("http://", "https://"))
        scheme, core, port, path_part = _strip_url_wrapper(tok)

        # Case 1: CIDR notation (e.g., 192.168.195.0/24 or 10.10.0.0/20)
        if "/" in core and re.match(r"^\d+\.\d+\.\d+\.\d+/\d+$", core):
            try:
                net = ipaddress.ip_network(core, strict=False)
            except ValueError as exc:
                raise HTTPException(400, f"Invalid CIDR subnet '{tok}': {exc}")
            num_hosts = net.num_addresses - 2 if net.prefixlen < 31 else net.num_addresses
            if num_hosts > MAX_FLEET_IPS or (len(seen_targets) + num_hosts > MAX_FLEET_IPS and max_hosts >= MAX_FLEET_IPS):
                raise HTTPException(
                    400,
                    f"CIDR '{core}' expands to {num_hosts:,} hosts, exceeding the {MAX_FLEET_IPS:,}-target maximum provision.",
                )
            added_in_seg = 0
            host_iter = net.hosts() if net.prefixlen < 31 else iter(net)
            for ip in host_iter:
                if len(seen_targets) >= effective_cap:
                    break
                _add_target(scheme, str(ip), port, "/", is_url_entry=False)
                added_in_seg += 1
            cidr_count += 1
            if str(net) not in seen_origins:
                seen_origins.add(str(net))
                allowed_origins.append(str(net))
            segments_summary.append({"input": tok, "type": "cidr", "network": str(net), "hosts_expanded": added_in_seg})
            continue

        # Case 2: IPv4 Range (e.g., 192.168.195.1-192.168.195.254 or 10.10.0.1-10.10.39.16)
        if "-" in core and re.match(r"^\d+\.\d+\.\d+\.\d+-(?:\d+\.\d+\.\d+\.\d+|\d+)$", core):
            start_s, end_s = core.split("-", 1)
            try:
                start_ip = ipaddress.IPv4Address(start_s)
                if "." in end_s:
                    end_ip = ipaddress.IPv4Address(end_s)
                else:
                    prefix = ".".join(start_s.split(".")[:3])
                    end_ip = ipaddress.IPv4Address(f"{prefix}.{end_s}")
            except ValueError as exc:
                raise HTTPException(400, f"Invalid IP range '{tok}': {exc}")

            start_int = int(start_ip)
            end_int = int(end_ip)
            if end_int < start_int:
                raise HTTPException(400, f"IP range end '{end_ip}' is lower than start '{start_ip}'")
            range_len = end_int - start_int + 1
            if range_len > MAX_FLEET_IPS or (len(seen_targets) + range_len > MAX_FLEET_IPS and max_hosts >= MAX_FLEET_IPS):
                raise HTTPException(
                    400,
                    f"IP range '{core}' contains {range_len:,} addresses, exceeding the {MAX_FLEET_IPS:,}-target maximum provision.",
                )
            added_in_seg = 0
            for ip_int in range(start_int, end_int + 1):
                if len(seen_targets) >= effective_cap:
                    break
                _add_target(scheme, str(ipaddress.IPv4Address(ip_int)), port, "/", is_url_entry=False)
                added_in_seg += 1
            range_count += 1
            if core not in seen_origins:
                seen_origins.add(core)
                allowed_origins.append(core)
            segments_summary.append({"input": tok, "type": "ip_range", "hosts_expanded": added_in_seg})
            continue

        # Case 3: Single IP address or explicit HTTP/HTTPS URL / Hostname
        p = urlparse(tok if "://" in tok else f"{scheme}://{core}:{port}{path_part}")
        if p.username or p.password:
            raise HTTPException(400, "Credentials in target URLs are prohibited")
        if not p.hostname:
            raise HTTPException(400, f"Invalid target specification: '{tok}'")

        is_bare_ip = False
        try:
            ipaddress.ip_address(p.hostname)
            is_bare_ip = not has_scheme and path_part == "/"
        except ValueError:
            is_bare_ip = False

        full_path = p.path or "/"
        if p.query:
            full_path = f"{full_path}?{p.query}"

        _add_target(
            p.scheme or scheme,
            p.hostname,
            p.port or port,
            full_path,
            is_url_entry=(not is_bare_ip),
        )
        segments_summary.append(
            {
                "input": tok,
                "type": "single_ip" if is_bare_ip else "url",
                "hosts_expanded": 1,
            }
        )

    return {
        "max_provisioned_ips": MAX_FLEET_IPS,
        "total_expanded_ips": len(expanded_urls),
        "total_expanded_targets": len(expanded_urls),
        "ip_count": ip_count,
        "url_count": url_count,
        "cidr_count": cidr_count,
        "range_count": range_count,
        "primary_target_url": expanded_urls[0],
        "target_urls": expanded_urls,
        "hosts": expanded_hosts,
        "allowed_origins": allowed_origins[:MAX_FLEET_IPS],
        "sample_targets": expanded_urls[:15],
        "segments": segments_summary,
    }


def _match_allowed_scope_rule(target_origin: str, target_host: str, allowed_origins: list[str]) -> tuple[bool, str]:
    """
    Check if target_origin or target_host matches an explicit origin, CIDR block, or IP range in allowed_origins.
    Returns (is_in_scope, scope_evidence_rule).
    """
    target_ip: ipaddress.IPv4Address | ipaddress.IPv6Address | None = None
    try:
        target_ip = ipaddress.ip_address(target_host)
    except ValueError:
        pass

    for entry in allowed_origins or []:
        raw = (entry or "").strip()
        if not raw:
            continue
        if raw == "*":
            return True, "Authorized by wildcard ROE rule '*'"
        _, core, _, _ = _strip_url_wrapper(raw)
        # Check CIDR allowlist entry
        if "/" in core and re.match(r"^\d+\.\d+\.\d+\.\d+/\d+$", core):
            try:
                net = ipaddress.ip_network(core, strict=False)
                if target_ip and target_ip in net:
                    return True, f"Authorized by ROE CIDR rule '{raw}' ({net})"
            except ValueError:
                pass
            continue
        # Check IP range allowlist entry
        if "-" in core and re.match(r"^\d+\.\d+\.\d+\.\d+-(?:\d+\.\d+\.\d+\.\d+|\d+)$", core):
            start_s, end_s = core.split("-", 1)
            try:
                s_ip = ipaddress.IPv4Address(start_s)
                e_ip = (
                    ipaddress.IPv4Address(end_s)
                    if "." in end_s
                    else ipaddress.IPv4Address(f"{'.'.join(start_s.split('.')[:3])}.{end_s}")
                )
                if isinstance(target_ip, ipaddress.IPv4Address) and int(s_ip) <= int(target_ip) <= int(e_ip):
                    return True, f"Authorized by ROE IP-range rule '{raw}'"
            except ValueError:
                pass
            continue
        # Standard origin match
        try:
            norm_rule = normalize_origin(raw)
            if norm_rule == target_origin:
                return True, f"Authorized by ROE origin rule '{norm_rule}'"
        except HTTPException:
            if core.lower() == target_host.lower():
                return True, f"Authorized by ROE hostname rule '{raw}'"
    return False, f"Origin '{target_origin}' is not present in approved ROE allowlist"


def _is_target_in_allowed_scope(target_origin: str, target_host: str, allowed_origins: list[str]) -> bool:
    """Check if target_origin or target_host matches an explicit origin, CIDR block, or IP range in allowed_origins."""
    ok, _ = _match_allowed_scope_rule(target_origin, target_host, allowed_origins)
    return ok


_DNS_CACHE: dict[str, str] = {}


def evaluate_url_scope_provenance(
    requested_url: str,
    allowed_origins: list[str] | None = None,
    allow_private: bool = True,
    redirect_urls: list[str] | None = None,
    assessment_scope_id: str = "SCOPE-DEFAULT",
    asset_id: str | None = None,
    *,
    final_url: str | None = None,
    scope_id: str | None = None,
    redirect_hops: list[Any] | None = None,
) -> dict[str, Any]:
    """
    TP22-01 — Evaluate a requested URL and its HTTP redirect chain against the approved ROE allowlist,
    producing an immutable 9-field Asset Identity & Scope Provenance record:
      - assessment_scope_id
      - requested_url
      - final_url
      - effective_origin
      - resolved_ip
      - asset_id
      - scope_decision (IN_SCOPE | OUT_OF_SCOPE | UNKNOWN)
      - scope_evidence
      - redirect_chain
    """
    import hashlib

    eff_scope_id = scope_id or assessment_scope_id
    raw_req = (requested_url or "").strip()
    if not raw_req:
        return {
            "assessment_scope_id": eff_scope_id,
            "requested_url": "",
            "final_url": "",
            "effective_origin": "unknown",
            "resolved_ip": "unresolved",
            "asset_id": asset_id or "ASSET-UNRESOLVED",
            "scope_decision": "UNKNOWN",
            "scope_evidence": "Empty target URL",
            "redirect_chain": [],
            "redirect_blocked": False,
        }

    extra_urls: list[str] = [u.strip() for u in (redirect_urls or []) if u and str(u).strip()]
    if redirect_hops:
        for rh in redirect_hops:
            u_str = rh.get("url", "") if isinstance(rh, dict) else str(rh)
            if u_str and u_str.strip() and u_str.strip() != raw_req and u_str.strip() not in extra_urls:
                extra_urls.append(u_str.strip())
    if final_url and final_url.strip() and final_url.strip() != raw_req and final_url.strip() not in extra_urls:
        extra_urls.append(final_url.strip())

    hops = [raw_req] + extra_urls
    redirect_chain: list[dict[str, Any]] = []
    overall_decision = "IN_SCOPE"
    overall_evidence = ""
    redirect_blocked = False
    effective_final_url = raw_req
    effective_origin = "unknown"
    effective_host = ""

    for hop_idx, hop_url in enumerate(hops):
        try:
            hop_origin = normalize_origin(hop_url)
            parsed_hop = urlparse(hop_url if "://" in hop_url else f"http://{hop_url}")
            hop_host = (parsed_hop.hostname or "").lower()
        except Exception as exc:
            redirect_chain.append({
                "hop": hop_idx,
                "url": hop_url,
                "effective_origin": "invalid",
                "scope_decision": "OUT_OF_SCOPE",
                "scope_evidence": f"Malformed URL hop: {exc}",
            })
            overall_decision = "OUT_OF_SCOPE"
            overall_evidence = f"Hop {hop_idx} malformed ({hop_url})"
            if hop_idx > 0:
                redirect_blocked = True
            break

        if allowed_origins is None:
            in_scope, rule_ev = True, f"Implicitly authorized primary origin '{hop_origin}'"
        else:
            in_scope, rule_ev = _match_allowed_scope_rule(hop_origin, hop_host, allowed_origins)

        hop_decision = "IN_SCOPE" if in_scope else "OUT_OF_SCOPE"
        redirect_chain.append({
            "hop": hop_idx,
            "url": hop_url,
            "effective_origin": hop_origin,
            "scope_decision": hop_decision,
            "scope_evidence": rule_ev,
        })

        if not in_scope:
            overall_decision = "OUT_OF_SCOPE"
            overall_evidence = (
                f"Redirect hop #{hop_idx} to '{hop_origin}' blocked: {rule_ev}"
                if hop_idx > 0
                else rule_ev
            )
            if hop_idx > 0:
                redirect_blocked = True
            effective_final_url = hop_url
            effective_origin = hop_origin
            effective_host = hop_host
            break

        effective_final_url = hop_url
        effective_origin = hop_origin
        effective_host = hop_host
        overall_evidence = rule_ev

    resolved_ip = "unresolved"
    if effective_host and overall_decision == "IN_SCOPE":
        if effective_host in _DNS_CACHE:
            resolved_ip = _DNS_CACHE[effective_host]
        else:
            try:
                resolved_ip = str(ipaddress.ip_address(effective_host))
            except ValueError:
                resolved_ip = "resolved-via-http-client"
            _DNS_CACHE[effective_host] = resolved_ip

    if not asset_id:
        origin_digest = hashlib.sha256(effective_origin.encode("utf-8")).hexdigest()[:6].upper()
        asset_id = f"ASSET-{origin_digest}"

    return {
        "assessment_scope_id": eff_scope_id,
        "requested_url": raw_req,
        "final_url": effective_final_url,
        "effective_origin": effective_origin,
        "resolved_ip": resolved_ip,
        "asset_id": asset_id,
        "scope_decision": overall_decision,
        "scope_evidence": overall_evidence,
        "redirect_chain": redirect_chain,
        "redirect_blocked": redirect_blocked,
    }


def validate_target(target: str, allowed_origins: list[str], allow_private: bool = False) -> str:
    """
    Validate a single target URL/IP or a multi-target IP/URL/CIDR/range specification (up to 10,000 targets)
    against the engagement's approved ROE allowlist.
    """
    raw = (target or "").strip()
    if "@" in raw:
        raise HTTPException(400, "Credentials in target URLs are prohibited")

    _, core, _, _ = _strip_url_wrapper(raw)
    is_multi_spec = (
        any(sep in raw for sep in (",", ";", "\n", " "))
        or ("/" in core and re.match(r"^\d+\.\d+\.\d+\.\d+/\d+$", core))
        or ("-" in core and re.match(r"^\d+\.\d+\.\d+\.\d+-(?:\d+\.\d+\.\d+\.\d+|\d+)$", core))
    )

    if is_multi_spec:
        expanded = expand_target_specification(raw, max_hosts=MAX_FLEET_IPS)
        check_urls = [expanded["target_urls"][0], expanded["target_urls"][-1]]
        for u in check_urls:
            validate_target(u, allowed_origins, allow_private)
        return expanded["primary_target_url"]

    origin = normalize_origin(raw)
    host = urlparse(raw if "://" in raw else f"http://{core}/").hostname or core

    if not _is_target_in_allowed_scope(origin, host, allowed_origins):
        raise HTTPException(403, "Target origin is not present in approved ROE allowlist")

    try:
        addresses = {ipaddress.ip_address(host)}
    except ValueError:
        try:
            addresses = {ipaddress.ip_address(x[4][0]) for x in socket.getaddrinfo(host, None)}
        except socket.gaierror:
            if not allow_private:
                raise HTTPException(400, "Target hostname did not resolve")
            addresses = set()
    for ip in addresses:
        if not allow_private and (not ip.is_global or ip.is_loopback or ip.is_link_local or ip.is_reserved):
            raise HTTPException(403, f"Target resolves to prohibited address space: {ip}")
    return origin
