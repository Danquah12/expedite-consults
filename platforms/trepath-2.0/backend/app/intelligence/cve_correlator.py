"""CVE Correlator — Correlates fingerprinted software versions and CPEs against known CVE advisories."""

from __future__ import annotations

import re
from dataclasses import dataclass

from ..discovery.technology_classifier import FingerprintedTech


@dataclass
class CveAdvisory:
    cve_id: str
    cwe_id: str
    cvss_score: float
    summary: str


TECHNOLOGY_CVE_KNOWLEDGE_BASE: list[tuple[str, str, CveAdvisory]] = [
    (
        r"apache",
        r"2\.2\.",
        CveAdvisory(
            cve_id="CVE-2011-3192",
            cwe_id="CWE-400",
            cvss_score=7.8,
            summary="Apache HTTP Server 2.2.x Range Header DoS & End-of-Life security advisory correlation (CVE-2011-3192 / CVE-2017-9798 Optionsbleed).",
        ),
    ),
    (
        r"apache",
        r"2\.4\.([0-9]|[1-4][0-9])\b",
        CveAdvisory(
            cve_id="CVE-2021-41773",
            cwe_id="CWE-22",
            cvss_score=7.5,
            summary="Apache HTTP Server 2.4.x path traversal and file disclosure advisory correlation.",
        ),
    ),
    (
        r"tomcat|coyote",
        r".*",
        CveAdvisory(
            cve_id="CVE-2020-1938",
            cwe_id="CWE-200",
            cvss_score=9.8,
            summary="Apache Tomcat AJP / Manager exposure (Ghostcat CVE-2020-1938 / CVE-2017-12617 JSP upload RCE correlation).",
        ),
    ),
    (
        r"openssh",
        r"([1-7]\.|8\.[0-4])",
        CveAdvisory(
            cve_id="CVE-2023-38408",
            cwe_id="CWE-287",
            cvss_score=9.8,
            summary="Legacy OpenSSH daemon version correlated with ssh-agent forwarding & authentication advisories.",
        ),
    ),
    (
        r"vsftpd",
        r"2\.3\.4",
        CveAdvisory(
            cve_id="CVE-2011-2523",
            cwe_id="CWE-78",
            cvss_score=9.8,
            summary="vsftpd 2.3.4 backdoor command execution vulnerability correlation.",
        ),
    ),
    (
        r"proftpd",
        r"1\.3\.[0-5]",
        CveAdvisory(
            cve_id="CVE-2015-3306",
            cwe_id="CWE-284",
            cvss_score=9.8,
            summary="ProFTPD 1.3.x mod_copy unauthenticated file copy advisory correlation.",
        ),
    ),
    (
        r"php",
        r"([457]\.|8\.0)",
        CveAdvisory(
            cve_id="CVE-2012-1823",
            cwe_id="CWE-78",
            cvss_score=9.8,
            summary="Outdated PHP runtime correlated with CGI argument injection and end-of-life advisories.",
        ),
    ),
    (
        r"samba|smb|netbios",
        r".*",
        CveAdvisory(
            cve_id="CVE-2017-7494",
            cwe_id="CWE-78",
            cvss_score=9.8,
            summary="SMB / Samba service exposure correlated with remote code execution advisories (SambaCry CVE-2017-7494 / MS17-010).",
        ),
    ),
    (
        r"mysql",
        r"5\.[015]\.",
        CveAdvisory(
            cve_id="CVE-2012-2122",
            cwe_id="CWE-287",
            cvss_score=7.5,
            summary="Legacy MySQL 5.x server correlated with authentication bypass & end-of-life advisories.",
        ),
    ),
]


def correlate_technology_cves(tech: FingerprintedTech) -> list[CveAdvisory]:
    """Match a fingerprinted technology name and version against known CVE advisories."""
    matches: list[CveAdvisory] = []
    name_str = f"{tech.name} {tech.banner}".lower()
    ver_str = (tech.version or tech.banner or "").lower()

    for name_pat, ver_pat, advisory in TECHNOLOGY_CVE_KNOWLEDGE_BASE:
        if re.search(name_pat, name_str) and re.search(ver_pat, ver_str):
            matches.append(advisory)

    return matches
