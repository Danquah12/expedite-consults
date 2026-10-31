"""ENUMCORE Vulnerability Intelligence Package — CVE, CWE, CISA KEV, and FIRST EPSS Correlation."""

from .cve_correlator import CveAdvisory, correlate_technology_cves
from .cwe_mapper import CWE_CATALOG, resolve_cwe
from .kev_lookup import CISA_KEV_CATALOG, is_in_cisa_kev
from .epss_lookup import EPSS_FEED, lookup_epss
from .exploit_intelligence import determine_exploit_maturity, run_enumcore_correlation

__all__ = [
    "CveAdvisory",
    "correlate_technology_cves",
    "CWE_CATALOG",
    "resolve_cwe",
    "CISA_KEV_CATALOG",
    "is_in_cisa_kev",
    "EPSS_FEED",
    "lookup_epss",
    "determine_exploit_maturity",
    "run_enumcore_correlation",
]
