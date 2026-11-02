"""WebPulse Deep Application Enumerator — Extracts HTML forms, input parameters, authentication realms, cookies, and HTTP methods."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field, asdict
from typing import Any
from urllib.parse import urljoin, urlparse, parse_qs
import httpx

from ..models import ProofState
from ..scope import evaluate_url_scope_provenance, normalize_origin


FORM_TAG_RE = re.compile(r"<form\b([^>]*)>(.*?)</form>", re.IGNORECASE | re.DOTALL)
INPUT_TAG_RE = re.compile(r"<(?:input|textarea|select)\b([^>]*)>", re.IGNORECASE)
ANCHOR_HREF_RE = re.compile(r"""<a\b[^>]*\bhref=["']([^"'#]+)["']""", re.IGNORECASE)
ATTR_RE = re.compile(r"""([a-zA-Z0-9_-]+)\s*=\s*(?:["']([^"']*)["']|([^\s>]+))""")


def _parse_attrs(attr_str: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for m in ATTR_RE.finditer(attr_str):
        key = m.group(1).lower()
        val = m.group(2) if m.group(2) is not None else (m.group(3) or "")
        attrs[key] = val.strip()
    return attrs


@dataclass
class EnumeratedForm:
    page_url: str
    action_url: str
    method: str
    input_names: list[str] = field(default_factory=list)
    input_types: list[str] = field(default_factory=list)
    has_password: bool = False
    has_file_upload: bool = False
    has_csrf_token: bool = False


@dataclass
class WebPulseEnumerationResult:
    discovered_urls: list[str] = field(default_factory=list)
    forms: list[EnumeratedForm] = field(default_factory=list)
    auth_challenges: list[dict[str, str]] = field(default_factory=list)
    allowed_methods_by_origin: dict[str, list[str]] = field(default_factory=dict)
    findings: list[dict[str, Any]] = field(default_factory=list)
    external_references: list[dict[str, Any]] = field(default_factory=list)
    blocked_redirects: list[dict[str, Any]] = field(default_factory=list)


COMMON_ENUM_ROUTES = [
    "/",
    "/login",
    "/admin",
    "/manager/html",
    "/host-manager/html",
    "/phpinfo.php",
    "/server-status",
    "/api/",
    "/search",
    "/upload",
]


async def run_webpulse_enumerator(
    http_origins: list[str],
    timeout: float = 2.5,
    allowed_origins: list[str] | None = None,
    assessment_scope_id: str = "SCOPE-DEFAULT",
) -> WebPulseEnumerationResult:
    """
    Crawl and enumerate discovered HTTP origins (`:80`, `:8080`, etc.):
      1. Extract `<form>` elements, input parameters, password fields, file uploads, and CSRF tokens.
      2. Extract same-origin `<a href>` links with query parameters; log external links as EXTERNAL_REFERENCE_NOT_SCANNED (AT-01).
      3. Re-evaluate scope on every HTTP redirect hop; block out-of-scope redirects (AT-02).
      4. Inspect `WWW-Authenticate` headers to distinguish Basic vs. Digest vs. Bearer authentication realms.
      5. Probe `OPTIONS` to enumerate allowed HTTP methods (`PUT`, `DELETE`, `TRACE`, `PROPFIND`).
    """
    result = WebPulseEnumerationResult()
    seen_urls: set[str] = set()
    seen_ext_refs: set[str] = set()

    effective_allowlist = list(allowed_origins) if allowed_origins is not None else []
    if not effective_allowlist:
        for orig in http_origins:
            try:
                norm_o = normalize_origin(orig)
                if norm_o not in effective_allowlist:
                    effective_allowlist.append(norm_o)
            except Exception:
                pass

    timeout_cfg = httpx.Timeout(connect=1.5, read=2.0, write=1.5, pool=2.5)
    async with httpx.AsyncClient(
        timeout=timeout_cfg,
        verify=False,
        follow_redirects=True,
        headers={"User-Agent": "TrePath-WebPulse-Enumerator/2.0"},
    ) as client:
        for origin in http_origins[:4]:
            base = origin.rstrip("/")
            parsed_origin = urlparse(origin)
            origin_host = parsed_origin.netloc

            # 1. HTTP OPTIONS Method Enumeration
            try:
                opt_res = await client.options(origin)
                allow_hdr = opt_res.headers.get("allow") or opt_res.headers.get("public") or ""
                if allow_hdr:
                    methods = [m.strip().upper() for m in allow_hdr.split(",") if m.strip()]
                    result.allowed_methods_by_origin[origin] = methods
                    risky = [m for m in methods if m in ("PUT", "DELETE", "TRACE", "CONNECT", "PROPFIND", "MOVE")]
                    if risky:
                        ev_payload = {
                            "source": "WebPulse HTTP Method Enumerator",
                            "url": origin,
                            "allowed_methods": methods,
                            "risky_methods": risky,
                            "request": f"OPTIONS {parsed_origin.path or '/'} HTTP/1.1\r\nHost: {origin_host}\r\nUser-Agent: TrePath-WebPulse-Enumerator/2.0",
                            "response": f"HTTP/1.1 {opt_res.status_code} {opt_res.reason_phrase}\r\nAllow: {allow_hdr}",
                        }
                        result.findings.append({
                            "finding_key": f"ENUM-HTTP-METHODS-{parsed_origin.port or 80}",
                            "title": f"[WebPulse] Permissive HTTP Methods Enabled ({', '.join(risky)}) on {origin}",
                            "description": (
                                f"HTTP OPTIONS enumeration on {origin} advertised methods [{', '.join(methods)}], "
                                f"including potentially risky verbs [{', '.join(risky)}]."
                            ),
                            "severity": "medium" if ("PUT" in risky or "DELETE" in risky or "TRACE" in risky) else "low",
                            "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                            "cvss_score": 5.3,
                            "cve_id": None,
                            "cwe_id": "CWE-693",
                            "remediation": "Disable unnecessary HTTP verbs (PUT, DELETE, TRACE, WebDAV) in the web server configuration.",
                            "risk_priority": 45.0,
                            "evidence": json.dumps(ev_payload, indent=2),
                        })
            except Exception:
                pass

            # 2. Probe candidate routes for HTML forms, links, and WWW-Authenticate challenges
            for route in COMMON_ENUM_ROUTES:
                probe_url = f"{base}{route}"
                if probe_url in seen_urls:
                    continue
                seen_urls.add(probe_url)

                try:
                    res = await client.get(probe_url)
                except Exception:
                    continue

                # TP22-01 / AT-02: Validate every redirect hop against approved ROE allowlist
                redirect_hops = [str(r.headers.get("location") or r.url) for r in res.history] if res.history else []
                if str(res.url) != probe_url and str(res.url) not in redirect_hops:
                    redirect_hops.append(str(res.url))
                prov = evaluate_url_scope_provenance(
                    requested_url=probe_url,
                    allowed_origins=effective_allowlist,
                    redirect_urls=[ str(urljoin(probe_url, h)) for h in redirect_hops ],
                    assessment_scope_id=assessment_scope_id,
                )
                if prov["scope_decision"] != "IN_SCOPE":
                    result.blocked_redirects.append(prov)
                    continue

                # Check WWW-Authenticate challenge (even on 401/403)
                www_auth = res.headers.get("www-authenticate")
                if www_auth:
                    scheme_word = www_auth.strip().split(" ")[0].capitalize()
                    realm_match = re.search(r'realm=["\']?([^"\',]+)', www_auth, re.IGNORECASE)
                    realm = realm_match.group(1) if realm_match else "default"
                    result.auth_challenges.append({
                        "url": probe_url,
                        "scheme": scheme_word,
                        "realm": realm,
                        "header": www_auth,
                        "status_code": str(res.status_code),
                    })
                    result.discovered_urls.append(probe_url)

                    is_cleartext_basic = (parsed_origin.scheme == "http" and scheme_word.lower() == "basic")
                    ev_auth = {
                        "source": "WebPulse Authentication Realm Enumerator",
                        "url": probe_url,
                        "scheme": scheme_word,
                        "realm": realm,
                        "transport": parsed_origin.scheme.upper(),
                        "request": f"GET {route} HTTP/1.1\r\nHost: {origin_host}\r\nUser-Agent: TrePath-WebPulse-Enumerator/2.0",
                        "response": (
                            f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n"
                            f"WWW-Authenticate: {www_auth}\r\n"
                            f"Server: {res.headers.get('server', 'unknown')}"
                        ),
                    }
                    result.findings.append({
                        "finding_key": f"ENUM-AUTH-REALM-{parsed_origin.port or 80}-{scheme_word.upper()}"[:50],
                        "title": f"[WebPulse] HTTP {scheme_word} Authentication Challenge Enumerated (Realm: '{realm}')",
                        "description": (
                            f"Endpoint {probe_url} issued an HTTP {res.status_code} challenge with "
                            f"`WWW-Authenticate: {www_auth}` over {parsed_origin.scheme.upper()}. "
                            + (
                                "Because Basic authentication transmits credentials encoded in reversible Base64 over unencrypted HTTP, credentials submitted to this realm are exposed to passive network interception."
                                if is_cleartext_basic
                                else f"Authentication mechanism '{scheme_word}' verified on endpoint."
                            )
                        ),
                        "severity": "medium" if is_cleartext_basic else "low",
                        "proof_state": ProofState.CONTROL_GAP_CONFIRMED if is_cleartext_basic else ProofState.OBSERVATION_CONFIRMED,
                        "cvss_score": 6.5 if is_cleartext_basic else 3.7,
                        "cve_id": None,
                        "cwe_id": "CWE-319" if is_cleartext_basic else "CWE-287",
                        "remediation": "Enforce TLS (HTTPS) before issuing HTTP authentication challenges, and restrict administrative realms (/manager/html) to trusted management networks.",
                        "risk_priority": 55.0 if is_cleartext_basic else 25.0,
                        "evidence": json.dumps(ev_auth, indent=2),
                    })

                if res.status_code >= 404:
                    continue

                result.discovered_urls.append(probe_url)
                ctype = (res.headers.get("content-type") or "").lower()
                if "html" not in ctype and "<html" not in res.text[:400].lower():
                    continue

                html = res.text[:50000]

                # Parse <form> tags
                for fm in FORM_TAG_RE.finditer(html):
                    f_attrs = _parse_attrs(fm.group(1))
                    f_body = fm.group(2)
                    action_raw = f_attrs.get("action") or probe_url
                    action_url = urljoin(probe_url, action_raw)
                    method = (f_attrs.get("method") or "GET").upper()

                    in_names: list[str] = []
                    in_types: list[str] = []
                    has_pw = False
                    has_file = False
                    has_csrf = False

                    for im in INPUT_TAG_RE.finditer(f_body):
                        i_attrs = _parse_attrs(im.group(1))
                        iname = i_attrs.get("name") or i_attrs.get("id")
                        itype = (i_attrs.get("type") or "text").lower()
                        if iname:
                            in_names.append(iname)
                            if any(tok in iname.lower() for tok in ("csrf", "xsrf", "token", "nonce", "__requestverificationtoken")):
                                has_csrf = True
                        in_types.append(itype)
                        if itype == "password":
                            has_pw = True
                        if itype == "file":
                            has_file = True

                    enum_form = EnumeratedForm(
                        page_url=probe_url,
                        action_url=action_url,
                        method=method,
                        input_names=in_names,
                        input_types=in_types,
                        has_password=has_pw,
                        has_file_upload=has_file,
                        has_csrf_token=has_csrf,
                    )
                    result.forms.append(enum_form)

                    # Construct synthetic URL with form parameters for Endpoint Classifier
                    if in_names:
                        q_str = "&".join(f"{n}=1" for n in in_names[:6])
                        sep = "&" if "?" in action_url else "?"
                        result.discovered_urls.append(f"{action_url}{sep}{q_str}")
                    else:
                        result.discovered_urls.append(action_url)

                    # If state-changing POST form lacks anti-CSRF token, record enumeration finding
                    if method == "POST" and not has_csrf and in_names:
                        result.findings.append({
                            "finding_key": f"ENUM-FORM-NOCSRF-{len(result.forms)}"[:50],
                            "title": f"[WebPulse] HTML POST Form Without Anti-CSRF Token on {urlparse(action_url).path or '/'}",
                            "description": (
                                f"WebPulse enumerated an HTML `<form method='POST' action='{action_url}'>` with inputs "
                                f"{in_names} that does not include a recognizable anti-CSRF synchronizer token."
                            ),
                            "severity": "low",
                            "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                            "cvss_score": 4.3,
                            "cve_id": None,
                            "cwe_id": "CWE-352",
                            "remediation": "Include a cryptographically random anti-CSRF token in state-changing POST forms and enforce SameSite=Strict/Lax cookies.",
                            "risk_priority": 35.0,
                            "evidence": json.dumps(asdict(enum_form), indent=2),
                        })

                # Parse <a href="..."> links: keep same-origin/in-scope links; record external links as EXTERNAL_REFERENCE_NOT_SCANNED (AT-01)
                for am in ANCHOR_HREF_RE.finditer(html):
                    href = am.group(1).strip()
                    if href.startswith(("javascript:", "mailto:", "tel:")):
                        continue
                    full_link = urljoin(probe_url, href)
                    parsed_link = urlparse(full_link)
                    link_prov = evaluate_url_scope_provenance(
                        requested_url=full_link,
                        allowed_origins=effective_allowlist,
                        assessment_scope_id=assessment_scope_id,
                    )
                    if parsed_link.hostname == parsed_origin.hostname and link_prov["scope_decision"] == "IN_SCOPE":
                        if len(result.discovered_urls) < 60 and full_link not in result.discovered_urls:
                            result.discovered_urls.append(full_link)
                    else:
                        if full_link not in seen_ext_refs:
                            seen_ext_refs.add(full_link)
                            result.external_references.append({
                                "discovered_on": probe_url,
                                "reference_url": full_link,
                                "effective_origin": link_prov["effective_origin"],
                                "scope_decision": "OUT_OF_SCOPE",
                                "scope_evidence": link_prov["scope_evidence"],
                                "classification": "EXTERNAL_REFERENCE_NOT_SCANNED",
                            })

    return result
