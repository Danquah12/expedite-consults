import httpx
from urllib.parse import urlparse
from ..models import ProofState
from .risk import calculate_risk_priority

SECURITY_HEADERS = {
    "content-security-policy": ("Missing Content-Security-Policy", "medium",
        "Define a restrictive CSP based on the application's required script, style, image and connection sources."),
    "x-content-type-options": ("Missing X-Content-Type-Options", "low",
        "Set X-Content-Type-Options: nosniff."),
    "referrer-policy": ("Missing Referrer-Policy", "low",
        "Set a policy such as strict-origin-when-cross-origin after compatibility review."),
    "permissions-policy": ("Missing Permissions-Policy", "low",
        "Disable browser features the application does not require."),
    "x-frame-options": ("Missing anti-framing header", "medium",
        "Use CSP frame-ancestors; retain X-Frame-Options where legacy clients require it.")
}

async def run_read_only_checks(url: str, timeout: float = 2.0) -> list[dict]:
    findings = []
    headers = {}
    status_code = None

    try:
        timeout_config = httpx.Timeout(connect=1.5, read=1.5, write=1.5, pool=2.0)
        async with httpx.AsyncClient(timeout=timeout_config, follow_redirects=False,
                                     verify=False, headers={"User-Agent": "TrePath-ReadOnly/2.0"}) as client:
            response = await client.get(url)
            headers = {k.lower(): v for k, v in response.headers.items()}
            status_code = response.status_code

            for key, (title, severity, remediation) in SECURITY_HEADERS.items():
                if key not in headers:
                    findings.append({
                        "finding_key": f"HTTP-HEADER-{key.upper().replace('-', '_')}",
                        "title": title,
                        "description": f"The HTTP response did not include the {key} response header. This confirms a header observation only; it does not prove an exploit.",
                        "severity": severity,
                        "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                        "cvss_score": None,
                        "cve_id": None,
                        "cwe_id": "CWE-693",
                        "remediation": remediation,
                        "risk_priority": calculate_risk_priority(severity, exposure=0.8, exploitability=0.2, confidence=1.0),
                        "evidence": response.request.method + " " + str(response.request.url) + "\nHTTP " + str(status_code) + "\n" + "\n".join(f"{k}: {v}" for k, v in response.headers.items())
                    })

            if urlparse(url).scheme == "http":
                findings.append({
                    "finding_key": "HTTP-NO-HTTPS-REDIRECT",
                    "title": "HTTP endpoint does not enforce HTTPS redirect",
                    "description": "The HTTP endpoint responded without a redirect. This observation does not verify whether an HTTPS service is available.",
                    "severity": "medium",
                    "proof_state": ProofState.OBSERVATION_CONFIRMED,
                    "cvss_score": None,
                    "cve_id": None,
                    "cwe_id": "CWE-319",
                    "remediation": "Deploy and validate HTTPS, then redirect HTTP requests to the canonical HTTPS origin.",
                    "risk_priority": calculate_risk_priority("medium", 0.8, 0.3, 1.0),
                    "evidence": f"GET {url}\nHTTP {status_code}\n"
                })

            if "server" in headers or "x-powered-by" in headers:
                banner = "; ".join(f"{k}: {headers[k]}" for k in ("server", "x-powered-by") if k in headers)
                findings.append({
                    "finding_key": "HTTP-TECHNOLOGY-DISCLOSURE",
                    "title": "Technology identification headers disclosed",
                    "description": f"Response headers disclose implementation details ({banner}). This is banner-based inference, not verification of installed package versions.",
                    "severity": "info",
                    "proof_state": ProofState.OBSERVATION_CONFIRMED,
                    "cvss_score": None,
                    "cve_id": None,
                    "cwe_id": "CWE-200",
                    "remediation": "Remove unnecessary version details from response headers; validate actual package versions through authenticated asset inventory.",
                    "risk_priority": calculate_risk_priority("info", 0.5, 0.1, 1.0),
                    "evidence": banner
                })
    except Exception as e:
        findings.append({
            "finding_key": "HTTP-SERVICE-STATUS",
            "title": f"HTTP Service Probe State on {url}",
            "description": f"The HTTP probe experienced a {type(e).__name__} connecting to {url}. Port discovery and socket probes continue independently.",
            "severity": "info",
            "proof_state": ProofState.INCONCLUSIVE,
            "cvss_score": None,
            "cve_id": None,
            "cwe_id": "CWE-1059",
            "remediation": "Check web server configuration or local routing.",
            "risk_priority": calculate_risk_priority("info", 0.3, 0.1, 1.0),
            "evidence": f"GET {url}\nResult: {type(e).__name__}"
        })

    return findings
