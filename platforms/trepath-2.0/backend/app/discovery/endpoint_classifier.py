"""Endpoint Classifier — Deduplicates and classifies URLs, API routes, and parameters."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlparse, parse_qs
from sqlalchemy.orm import Session

from .. import models
from .asset_normalizer import NormalizedAsset


@dataclass
class ClassifiedEndpoint:
    url: str
    canonical_signature: str
    method: str = "GET"
    path: str = "/"
    surface_type: str = "web_root"          # "login_page" | "api_endpoint" | "admin_interface" | "file_upload" | "config_exposure" | "web_root" | "app_route"
    functionality: str = "general"          # "authentication" | "api_resource" | "object_lookup" | "search" | "file_upload" | "administration" | "configuration" | "general"
    auth_required: bool = False
    parameters: list[str] = field(default_factory=list)
    input_types: list[str] = field(default_factory=list)
    sensitivity: str = "low"
    is_duplicate: bool = False


def canonicalize_endpoint(url: str, method: str = "GET") -> tuple[str, str, list[str]]:
    """Produce a deterministic canonical signature (METHOD + origin + normalized path + sorted param names)."""
    parsed = urlparse(url.strip())
    scheme = (parsed.scheme or "http").lower()
    host = (parsed.hostname or "localhost").lower()
    port = parsed.port or (443 if scheme == "https" else 80)
    raw_path = parsed.path or "/"
    norm_path = "/" + "/".join( seg for seg in raw_path.split("/") if seg )
    query_params = sorted(parse_qs(parsed.query, keep_blank_values=True).keys())
    param_sig = ",".join(query_params)
    signature = f"{method.upper()}:{scheme}://{host}:{port}{norm_path}?{param_sig}"
    return signature, norm_path, query_params


def _infer_features(path: str, params: list[str], title: str = "", key: str = "") -> tuple[str, str, bool, list[str], str]:
    """Infer surface_type, functionality, auth_required, input_types, and sensitivity."""
    lower_path = path.lower()
    lower_title = title.lower()
    upper_key = key.upper()
    lower_params = {p.lower() for p in params}

    input_types: list[str] = []
    if lower_params & {"id", "user_id", "userid", "account_id", "uid", "order_id", "doc_id"}:
        input_types.append("user_id_parameter")
    if lower_params & {"q", "query", "search", "keyword", "filter", "s", "term"}:
        input_types.append("search_parameter")
    if lower_params & {"file", "upload", "attachment", "avatar", "document", "import"} or "upload" in lower_path:
        input_types.append("file_upload")

    if any(tok in lower_path for tok in ("/login", "/signin", "/auth", "/session", "/oauth")) or "login" in lower_title:
        return "login_page", "authentication", False, input_types or ["credentials"], "high"
    if any(tok in lower_path for tok in ("/upload", "/import", "/media/upload")) or "file_upload" in input_types:
        return "file_upload", "file_upload", True, input_types or ["multipart_file"], "high"
    if any(tok in lower_path for tok in ("/admin", "/manager", "/console", "/dashboard", "/phpmyadmin")) or "ADMIN" in upper_key:
        return "admin_interface", "administration", True, input_types, "high"
    if any(tok in lower_path for tok in ("/api/", "/v1/", "/v2/", "/graphql", "/rest/")) or "api" in lower_title:
        func = "object_lookup" if "user_id_parameter" in input_types else "api_resource"
        return "api_endpoint", func, True, input_types or ["json_body"], "high"
    if "GIT" in upper_key or "ENV" in upper_key or "PHPINFO" in upper_key or any(tok in lower_path for tok in ("/.env", "/.git", "/phpinfo")):
        return "config_exposure", "configuration", False, input_types, "high"
    if "search_parameter" in input_types or "/search" in lower_path:
        return "app_route", "search", False, input_types, "medium"
    if "user_id_parameter" in input_types:
        return "app_route", "object_lookup", True, input_types, "medium"

    return ("web_root" if path == "/" else "app_route"), "general", False, input_types, "low"


def classify_endpoints(
    asset: NormalizedAsset,
    web_findings: list[dict[str, Any]],
    extra_urls: list[str] | None = None,
) -> list[ClassifiedEndpoint]:
    """Classify and deduplicate discovered HTTP origins, web recon routes, and fuzzed URLs."""
    endpoints: list[ClassifiedEndpoint] = []
    seen_signatures: set[str] = set()

    def _add_candidate(url: str, method: str = "GET", title: str = "", key: str = "", extra_params: list[str] | None = None):
        sig, norm_path, q_params = canonicalize_endpoint(url, method)
        merged_params = sorted(set(q_params + (extra_params or [])))
        if merged_params and not q_params:
            sig = f"{sig.split('?')[0]}?{','.join(merged_params)}"

        is_dup = sig in seen_signatures
        seen_signatures.add(sig)

        surface, func, auth_req, in_types, sens = _infer_features(norm_path, merged_params, title, key)
        parsed = urlparse(url)
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        if port in (8080, 8081, 8443, 9000) and surface == "web_root":
            surface = "admin_interface"
            func = "administration"
            sens = "high"

        endpoints.append(
            ClassifiedEndpoint(
                url=url,
                canonical_signature=sig,
                method=method,
                path=norm_path,
                surface_type=surface,
                functionality=func,
                auth_required=auth_req,
                parameters=merged_params,
                input_types=in_types,
                sensitivity=sens,
                is_duplicate=is_dup,
            )
        )

    for origin in asset.http_origins:
        _add_candidate(origin, "GET")

    # Add baseline functional probe routes discovered or tested by Active Fuzzer / Web Recon
    base = asset.target_url.rstrip("/")
    _add_candidate(f"{base}/?q=trepath_probe&id=1", "GET", title="Search and Object ID query parameters")

    for item in web_findings:
        title = item.get("title") or ""
        key = item.get("finding_key") or ""
        ev_url = ""
        try:
            ev = json.loads(item.get("evidence", "{}"))
            ev_url = ev.get("url") or ev.get("probe_url") or ""
        except Exception:
            pass
        if not ev_url:
            slug = key.split("-")[-1].lower() if "-" in key else "route"
            ev_url = f"{base}/{slug}"
        _add_candidate(ev_url, "GET", title=title, key=key)

    for raw_url in (extra_urls or []):
        _add_candidate(raw_url, "GET")

    return endpoints


def persist_classified_endpoints(
    db: Session,
    engagement_id: int,
    scan_id: int,
    asset_id: int,
    classified: list[ClassifiedEndpoint],
    include_duplicates: bool = False,
) -> list[models.Endpoint]:
    """Persist deduplicated Endpoint records into the database."""
    persisted: list[models.Endpoint] = []
    base_count = db.query(models.Endpoint).count()

    for idx, ep in enumerate(classified, start=1):
        if ep.is_duplicate and not include_duplicates:
            continue
        existing = (
            db.query(models.Endpoint)
            .filter_by(scan_id=scan_id, asset_id=asset_id, canonical_signature=ep.canonical_signature)
            .first()
        )
        if existing:
            persisted.append(existing)
            continue

        record = models.Endpoint(
            endpoint_key=f"EP-{base_count + idx:05d}",
            engagement_id=engagement_id,
            scan_id=scan_id,
            asset_id=asset_id,
            url=ep.url,
            canonical_signature=ep.canonical_signature,
            method=ep.method,
            path=ep.path,
            surface_type=ep.surface_type,
            functionality=ep.functionality,
            auth_required=ep.auth_required,
            parameters=ep.parameters,
            input_types=ep.input_types,
            sensitivity=ep.sensitivity,
            is_duplicate=ep.is_duplicate,
        )
        db.add(record)
        db.flush()
        persisted.append(record)

    return persisted
