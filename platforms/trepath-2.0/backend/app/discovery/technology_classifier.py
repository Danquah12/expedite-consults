"""Technology Classifier — Fingerprints software, versions, and CPEs with source evidence linkage."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any
from sqlalchemy.orm import Session

from .. import models
from .asset_normalizer import NormalizedAsset


@dataclass
class FingerprintedTech:
    name: str
    version: str | None
    category: str
    cpe: str | None
    banner: str
    is_outdated: bool
    confidence: float
    source_finding_key: str
    raw_evidence_bytes: bytes


OUTDATED_VERSION_PATTERNS = [
    (r"apache[/\s]+2\.[024]\.([0-9]|[1-4][0-9])\b", True),
    (r"openssh[_\s/]+([1-7]\.|8\.[0-4])", True),
    (r"tomcat[/\s]+([1-8]\.|9\.0\.[0-6][0-9])", True),
    (r"coyote[/\s]+1\.1", True),
    (r"php[/\s]+([457]\.|8\.0)", True),
    (r"nginx[/\s]+(0\.|1\.(1[0-9]|20)\.)", True),
    (r"proftpd[/\s]+1\.3\.[0-5]", True),
    (r"vsftpd[/\s]+2\.3\.4", True),
    (r"samba[/\s]+[34]\.[0-9]", True),
    (r"mysql[/\s]+([345]\.)", True),
    (r"postgresql[/\s]+([789]\.|1[0-2]\.)", True),
    (r"postfix", False),
]


def _check_outdated(name: str, version: str | None, banner: str) -> bool:
    combined = f"{name} {version or ''} {banner}".lower()
    for pat, flag in OUTDATED_VERSION_PATTERNS:
        if re.search(pat, combined):
            return flag
    if version and any(version.startswith(old) for old in ("1.", "2.0", "2.2", "4.", "5.", "0.")):
        return True
    return False


def classify_technologies(
    asset: NormalizedAsset,
    all_findings: list[dict[str, Any]],
) -> list[FingerprintedTech]:
    """Extract deduplicated software/service technology fingerprints from Nmap CPEs, port banners, protocol handshakes, and HTTP headers."""
    techs: list[FingerprintedTech] = []
    seen: set[str] = set()

    for item in all_findings:
        key = item.get("finding_key", "")
        raw_ev_str = item.get("evidence", "{}")
        raw_bytes = raw_ev_str.encode("utf-8", errors="replace") if isinstance(raw_ev_str, str) else b"{}"
        try:
            ev = json.loads(raw_ev_str) if isinstance(raw_ev_str, str) else {}
        except Exception:
            ev = {}

        # 1. Nmap Service / CPE findings (both NMAP-SERVICE-* and NMAP-PORT-*)
        if key.startswith(("NMAP-SERVICE-", "NMAP-PORT-")):
            product = ev.get("product") or ev.get("service_name") or ev.get("service") or ""
            version = ev.get("version") or None
            cpes = ev.get("cpes") or []
            cpe = cpes[0] if cpes else None
            banner = f"{product} {version or ''} {ev.get('extrainfo') or ''}".strip()
            if product:
                sig = f"{product.lower()}:{version or ''}"
                if sig not in seen:
                    seen.add(sig)
                    techs.append(
                        FingerprintedTech(
                            name=product,
                            version=version,
                            category="network_service",
                            cpe=cpe or (f"cpe:/a:{product.lower().replace(' ', '_')}:{product.lower().replace(' ', '_')}:{version}" if version else None),
                            banner=banner or item.get("title", ""),
                            is_outdated=_check_outdated(product, version, banner),
                            confidence=0.96 if cpe else 0.88,
                            source_finding_key=key,
                            raw_evidence_bytes=raw_bytes,
                        )
                    )

        # 2. Port Discovery Banners (both JSON and plain-text evidence)
        elif key.startswith("PORT-OPEN-"):
            banner = ""
            service = ""
            if isinstance(ev, dict) and ev:
                banner = (ev.get("banner") or "").strip()
                service = ev.get("service") or ""
            elif isinstance(raw_ev_str, str):
                for line in raw_ev_str.splitlines():
                    if "Captured Daemon Banner:" in line:
                        banner = line.split("Captured Daemon Banner:", 1)[1].strip()
                    elif "Service Identity:" in line:
                        service = line.split("Service Identity:", 1)[1].strip()
            if not service:
                parts = key.split("-")
                service = parts[3].lower() if len(parts) > 3 else "tcp"

            version_match = re.search(r"([A-Za-z0-9_.-]+)[/_ -](\d+\.\d+(?:\.\d+[a-z0-9]*)?)", banner)
            name = version_match.group(1) if version_match else service
            version = version_match.group(2) if version_match else None
            sig = f"{name.lower()}:{version or ''}"
            if sig not in seen:
                seen.add(sig)
                techs.append(
                    FingerprintedTech(
                        name=name,
                        version=version,
                        category="service_banner",
                        cpe=f"cpe:/a:{name.lower()}:{name.lower()}:{version}" if version else None,
                        banner=banner or f"Open Service ({service})",
                        is_outdated=_check_outdated(name, version, banner),
                        confidence=0.85 if version else 0.75,
                        source_finding_key=key,
                        raw_evidence_bytes=raw_bytes,
                    )
                )

        # 3. NetRecon Protocol Enumerator Findings (FTP, SMTP, MySQL)
        elif key.startswith("ENUM-PROTO-"):
            svc = ev.get("service") or "Protocol"
            ver = ev.get("version") or None
            banner = ev.get("banner") or ev.get("raw_greeting") or svc
            if not ver:
                vm = re.search(r"(\d+\.\d+(?:\.\d+[a-z0-9-]*))", str(banner))
                if vm:
                    ver = vm.group(1)
            sig = f"{svc.lower()}:{ver or ''}"
            if sig not in seen:
                seen.add(sig)
                techs.append(
                    FingerprintedTech(
                        name=svc,
                        version=ver,
                        category="enumerated_protocol",
                        cpe=f"cpe:/a:{svc.lower()}:{svc.lower()}:{ver}" if ver else None,
                        banner=str(banner)[:200],
                        is_outdated=_check_outdated(svc, ver, str(banner)),
                        confidence=0.90,
                        source_finding_key=key,
                        raw_evidence_bytes=raw_bytes,
                    )
                )

        # 4. Nuclei tech-detect / tomcat-detect / HTTP Server header disclosure
        elif key.startswith(("NUCLEI-", "HTTP-")):
            server_hdr = ""
            if isinstance(ev, dict) and ev:
                headers = ev.get("headers") or {}
                if isinstance(headers, dict):
                    server_hdr = headers.get("server") or headers.get("Server") or headers.get("x-powered-by") or ""
            elif isinstance(raw_ev_str, str) and ("server:" in raw_ev_str.lower() or "x-powered-by:" in raw_ev_str.lower()):
                server_hdr = raw_ev_str.strip()

            title = item.get("title") or ""
            if "tomcat" in title.lower() or "tomcat" in key.lower():
                sig = "apache tomcat:"
                if sig not in seen:
                    seen.add(sig)
                    techs.append(
                        FingerprintedTech(
                            name="Apache Tomcat",
                            version=None,
                            category="application_server",
                            cpe="cpe:/a:apache:tomcat",
                            banner=title,
                            is_outdated=True,
                            confidence=0.92,
                            source_finding_key=key,
                            raw_evidence_bytes=raw_bytes,
                        )
                    )
            elif server_hdr:
                for token_match in re.finditer(r"(Apache|nginx|PHP|OpenSSL|Phusion_Passenger|Tomcat|Microsoft-IIS)/(\d+\.\d+(?:\.\d+[a-z0-9-]*)?)", server_hdr, re.IGNORECASE):
                    t_name = token_match.group(1)
                    t_ver = token_match.group(2)
                    sig = f"{t_name.lower()}:{t_ver}"
                    if sig not in seen:
                        seen.add(sig)
                        techs.append(
                            FingerprintedTech(
                                name=t_name,
                                version=t_ver,
                                category="web_stack",
                                cpe=f"cpe:/a:{t_name.lower()}:{t_name.lower()}:{t_ver}",
                                banner=server_hdr[:200],
                                is_outdated=_check_outdated(t_name, t_ver, server_hdr),
                                confidence=0.93,
                                source_finding_key=key,
                                raw_evidence_bytes=raw_bytes,
                            )
                        )

    return techs


def persist_technologies(
    db: Session,
    engagement_id: int,
    scan_id: int,
    asset_id: int,
    tech_list: list[FingerprintedTech],
    finding_key_to_evidence_id: dict[str, int],
) -> list[models.Technology]:
    """Persist fingerprinted technologies and link each to its EvidenceArtifact ID."""
    persisted: list[models.Technology] = []
    base_count = db.query(models.Technology).count()

    for idx, tech in enumerate(tech_list, start=1):
        ev_id = finding_key_to_evidence_id.get(tech.source_finding_key)
        record = models.Technology(
            tech_key=f"TECH-{base_count + idx:05d}",
            engagement_id=engagement_id,
            scan_id=scan_id,
            asset_id=asset_id,
            name=tech.name,
            version=tech.version,
            category=tech.category,
            cpe=tech.cpe,
            banner=tech.banner,
            is_outdated=tech.is_outdated,
            confidence=tech.confidence,
            evidence_artifact_id=ev_id,
        )
        db.add(record)
        db.flush()
        persisted.append(record)

    return persisted
