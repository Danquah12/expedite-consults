"""Asset Normalization Engine — Deduplicates, classifies, and organizes discovered assets."""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from typing import Any
from urllib.parse import urlparse
from sqlalchemy.orm import Session

from .. import models


@dataclass
class NormalizedService:
    port: int
    protocol: str = "tcp"
    service_name: str = "unknown"
    banner: str = ""
    is_http: bool = False
    is_tls: bool = False


@dataclass
class NormalizedAsset:
    target_url: str
    hostname: str
    scheme: str
    primary_port: int
    asset_type: str = "web_application"
    open_ports: list[int] = field(default_factory=list)
    http_origins: list[str] = field(default_factory=list)
    services: dict[int, NormalizedService] = field(default_factory=dict)
    raw_discovery_findings: list[dict[str, Any]] = field(default_factory=list)


HTTP_CANDIDATE_PORTS = {80, 443, 3000, 5000, 8000, 8008, 8080, 8081, 8180, 8443, 8888, 9000}
TLS_CANDIDATE_PORTS = {443, 465, 636, 993, 995, 8443}


def normalize_discovered_assets(
    target_url: str,
    port_findings: list[dict[str, Any]],
    posture_findings: list[dict[str, Any]],
    web_findings: list[dict[str, Any]],
) -> NormalizedAsset:
    """Deduplicate and organize raw discovery findings into a canonical NormalizedAsset."""
    parsed = urlparse(target_url)
    scheme = (parsed.scheme or "http").lower()
    hostname = (parsed.hostname or target_url).lower()
    primary_port = parsed.port or (443 if scheme == "https" else 80)

    services: dict[int, NormalizedService] = {}
    open_ports: set[int] = set()

    for item in port_findings:
        key = item.get("finding_key", "")
        parts = key.split("-")
        if len(parts) >= 3 and parts[0] == "PORT" and parts[1] == "OPEN" and parts[2].isdigit():
            port_num = int(parts[2])
            open_ports.add(port_num)
            svc_name = parts[3].lower() if len(parts) > 3 else "tcp"
            banner = ""
            try:
                ev = json.loads(item.get("evidence", "{}"))
                banner = ev.get("banner", "") or ""
            except Exception:
                pass
            services[port_num] = NormalizedService(
                port=port_num,
                protocol="tcp",
                service_name=svc_name,
                banner=banner,
                is_http=(port_num in HTTP_CANDIDATE_PORTS or "http" in svc_name),
                is_tls=(port_num in TLS_CANDIDATE_PORTS or "https" in svc_name or "ssl" in svc_name),
            )

    sorted_ports = sorted(open_ports)

    # Determine primary asset classification
    has_api = any("api" in (w.get("title") or "").lower() for w in web_findings)
    if scheme == "https" or any(svc.is_tls for svc in services.values()):
        asset_type = "https_web_application"
    elif has_api:
        asset_type = "api_service"
    elif len(sorted_ports) > 3:
        asset_type = "hybrid_host_and_web"
    else:
        asset_type = "web_application"

    # Build deduplicated HTTP origins for downstream DAST & Nuclei testing
    http_origins = [target_url.rstrip("/") + "/"]
    for p in sorted_ports:
        if p in HTTP_CANDIDATE_PORTS and p not in (80, 443):
            alt_scheme = "https" if p in TLS_CANDIDATE_PORTS else "http"
            candidate = f"{alt_scheme}://{hostname}:{p}/"
            if candidate not in http_origins:
                http_origins.append(candidate)

    combined = list(posture_findings) + list(port_findings) + list(web_findings)
    return NormalizedAsset(
        target_url=target_url,
        hostname=hostname,
        scheme=scheme,
        primary_port=primary_port,
        asset_type=asset_type,
        open_ports=sorted_ports,
        http_origins=http_origins,
        services=services,
        raw_discovery_findings=combined,
    )


def persist_normalized_asset(
    db: Session,
    engagement_id: int,
    scan_id: int,
    normalized: NormalizedAsset,
) -> models.Asset:
    """Create or update the canonical Asset record linked to engagement_id and scan_id."""
    existing = db.query(models.Asset).filter_by(scan_id=scan_id, hostname=normalized.hostname).first()
    services_dict = {str(port): asdict(svc) for port, svc in normalized.services.items()}
    if existing:
        existing.open_ports = normalized.open_ports
        existing.http_origins = normalized.http_origins
        existing.services_json = services_dict
        existing.asset_type = normalized.asset_type
        db.flush()
        return existing

    count = db.query(models.Asset).count() + 1
    asset_key = f"ASSET-{count:05d}"
    record = models.Asset(
        asset_key=asset_key,
        engagement_id=engagement_id,
        scan_id=scan_id,
        hostname=normalized.hostname,
        target_url=normalized.target_url,
        asset_type=normalized.asset_type,
        scheme=normalized.scheme,
        primary_port=normalized.primary_port,
        open_ports=normalized.open_ports,
        http_origins=normalized.http_origins,
        services_json=services_dict,
    )
    db.add(record)
    db.flush()
    return record
