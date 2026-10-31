"""FIRST EPSS (Exploit Prediction Scoring System) Lookup — Estimates 30-day exploitation probability."""

from __future__ import annotations

EPSS_FEED: dict[str, tuple[float, float]] = {
    "CVE-2017-0144": (0.974, 0.998),
    "CVE-2008-4250": (0.962, 0.995),
    "CVE-2021-41773": (0.971, 0.997),
    "CVE-2021-44228": (0.975, 0.999),
    "CVE-2020-1938": (0.968, 0.996),
    "CVE-2019-0232": (0.941, 0.991),
    "CVE-2017-12617": (0.955, 0.993),
    "CVE-2012-1823": (0.952, 0.992),
    "CVE-2017-7494": (0.938, 0.990),
    "CVE-2011-3192": (0.914, 0.988),
    "CVE-2011-2523": (0.892, 0.984),
    "CVE-2015-3306": (0.865, 0.979),
    "CVE-2012-2122": (0.881, 0.982),
    "CVE-2023-38408": (0.684, 0.951),
    "CVE-2023-44487": (0.742, 0.965),
}


def lookup_epss(cve_id: str | None, cvss_score: float | None = 5.0) -> tuple[float, float]:
    """Return (epss_score, epss_percentile) for a CVE ID or estimate heuristically from CVSS."""
    if cve_id and cve_id.strip().upper() in EPSS_FEED:
        return EPSS_FEED[cve_id.strip().upper()]

    base = float(cvss_score or 5.0)
    if base >= 9.0:
        return (0.65, 0.92)
    if base >= 7.0:
        return (0.28, 0.78)
    if base >= 4.0:
        return (0.08, 0.45)
    return (0.02, 0.18)
