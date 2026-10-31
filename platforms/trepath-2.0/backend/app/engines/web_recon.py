import asyncio
import httpx
from urllib.parse import urljoin, urlparse
from ..models import ProofState
from .risk import calculate_risk_priority

SENSITIVE_PATHS = [
    ("/robots.txt", "Robots.txt Crawl Directive Inspection", "info", "CWE-200", "Review robots.txt disallow directives to avoid leaking private path names."),
    ("/.well-known/security.txt", "Vulnerability Disclosure Policy Check", "info", "CWE-1059", "Publish RFC 9116 security.txt with authorized contact details."),
    ("/.git/HEAD", "Exposed .git Source Code Repository", "critical", "CWE-538", "Prohibit public access to .git metadata directory."),
    ("/.env", "Exposed Environment Configuration File", "critical", "CWE-552", "Exclude .env files from the web document root."),
    ("/phpinfo.php", "PHP Information Diagnostic Exposure", "high", "CWE-200", "Disable diagnostic phpinfo() scripts in staging and production."),
    ("/server-status", "Apache Server-Status Handler Exposure", "medium", "CWE-200", "Restrict Apache mod_status access to localhost only."),
    ("/admin/", "Administrative Portal Entrypoint Discovered", "info", "CWE-200", "Enforce strong authentication and IP restriction on admin routes."),
    ("/login", "Authentication Route Identified", "info", "CWE-200", "Verify rate-limiting and anti-automation on login endpoints."),
    ("/api/", "REST API Route Entrypoint", "info", "CWE-200", "Enforce API key or JWT authentication across API namespaces."),
    ("/swagger.json", "Exposed OpenAPI / Swagger Documentation", "low", "CWE-200", "Review whether API documentation should be public or authenticated.")
]

async def probe_single_path(client: httpx.AsyncClient, origin: str, path: str, label: str, severity: str, cwe_id: str, remediation: str):
    test_url = urljoin(origin, path)
    try:
        res = await client.get(test_url)
        if res.status_code == 200:
            body_snippet = res.text[:300].strip()
            is_exposed_secret = path in ("/.git/HEAD", "/.env") and ("ref: refs/" in body_snippet or "=" in body_snippet)
            proof = ProofState.CONTROL_GAP_CONFIRMED if is_exposed_secret or severity in ("critical", "high") else ProofState.OBSERVATION_CONFIRMED
            return {
                "finding_key": f"WEB-PATH-{path.strip('/').replace('.', '_').replace('/', '_').upper() or 'ROOT'}",
                "title": f"Reachable Path Discovered: {path} (HTTP 200 OK)",
                "description": f"Endpoint {test_url} responded with HTTP 200 OK. {label}.",
                "severity": severity if is_exposed_secret else ("medium" if path == "/phpinfo.php" else severity),
                "proof_state": proof,
                "cvss_score": None,
                "cve_id": None,
                "cwe_id": cwe_id,
                "remediation": remediation,
                "risk_priority": calculate_risk_priority(severity, exposure=0.8, exploitability=0.4, confidence=1.0),
                "evidence": f"GET {test_url}\nHTTP {res.status_code} {res.reason_phrase}\n" +
                            f"Content-Type: {res.headers.get('content-type', 'unknown')}\n\n" +
                            f"Response Excerpt:\n{body_snippet}"
            }
    except Exception:
        pass
    return None

async def run_web_recon(target_url: str, timeout: float = 2.0) -> list[dict]:
    findings = []
    parsed = urlparse(target_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    timeout_config = httpx.Timeout(connect=1.5, read=1.5, write=1.5, pool=2.0)
    async with httpx.AsyncClient(timeout=timeout_config, verify=False, follow_redirects=False,
                                 headers={"User-Agent": "TrePath-WebRecon/2.0"}) as client:
        tasks = [probe_single_path(client, origin, p, l, s, c, r) for p, l, s, c, r in SENSITIVE_PATHS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, dict):
                findings.append(r)

        # CORS Reflection Check
        try:
            cors_origin_test = "https://evil-cors-audit.example.com"
            cors_res = await client.get(target_url, headers={"Origin": cors_origin_test})
            acao = cors_res.headers.get("access-control-allow-origin")
            acac = cors_res.headers.get("access-control-allow-credentials")
            if acao == cors_origin_test or (acao == "*" and acac == "true"):
                findings.append({
                    "finding_key": "WEB-CORS-ARBITRARY-ORIGIN-REFLECTED",
                    "title": "Permissive Cross-Origin Resource Sharing (CORS) Origin Reflection",
                    "description": f"Target endpoint reflects arbitrary incoming Origin header ({cors_origin_test}) in Access-Control-Allow-Origin.",
                    "severity": "high" if acac == "true" else "medium",
                    "proof_state": ProofState.CONTROL_GAP_CONFIRMED,
                    "cvss_score": None,
                    "cve_id": None,
                    "cwe_id": "CWE-942",
                    "remediation": "Validate incoming Origin headers against an explicit trusted whitelist.",
                    "risk_priority": calculate_risk_priority("high" if acac == "true" else "medium", exposure=0.8, exploitability=0.5, confidence=1.0),
                    "evidence": f"GET {target_url}\nOrigin: {cors_origin_test}\n\nHeaders:\nAccess-Control-Allow-Origin: {acao}\nAccess-Control-Allow-Credentials: {acac}"
                })
        except Exception:
            pass

    return findings
