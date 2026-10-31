"""CISA Known Exploited Vulnerabilities (KEV) Lookup — Identifies actively exploited CVEs."""

from __future__ import annotations

CISA_KEV_CATALOG: dict[str, dict[str, str]] = {
    "CVE-2017-0144": {"vendor": "Microsoft", "product": "SMBv1 (EternalBlue / MS17-010)", "date_added": "2021-11-03"},
    "CVE-2008-4250": {"vendor": "Microsoft", "product": "Server Service (MS08-067)", "date_added": "2022-03-03"},
    "CVE-2021-41773": {"vendor": "Apache", "product": "HTTP Server 2.4.49 Path Traversal", "date_added": "2021-11-03"},
    "CVE-2021-44228": {"vendor": "Apache", "product": "Log4j2 Remote Code Execution (Log4Shell)", "date_added": "2021-12-10"},
    "CVE-2020-1938": {"vendor": "Apache", "product": "Tomcat AJP Ghostcat File Inclusion", "date_added": "2022-03-25"},
    "CVE-2019-0232": {"vendor": "Apache", "product": "Tomcat CGI Servlet RCE", "date_added": "2021-11-03"},
    "CVE-2017-12617": {"vendor": "Apache", "product": "Tomcat JSP Upload RCE", "date_added": "2022-04-15"},
    "CVE-2012-1823": {"vendor": "PHP", "product": "PHP CGI Argument Injection", "date_added": "2021-11-03"},
    "CVE-2017-7494": {"vendor": "Samba", "product": "SambaCry Remote Code Execution", "date_added": "2022-05-24"},
}


def is_in_cisa_kev(cve_id: str | None) -> bool:
    """Return True if the CVE is listed in the CISA Known Exploited Vulnerabilities catalog."""
    if not cve_id:
        return False
    return cve_id.strip().upper() in CISA_KEV_CATALOG
