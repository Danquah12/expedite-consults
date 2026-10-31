import json
import httpx
from urllib.parse import urlparse
from ..models import ProofState
from .risk import calculate_risk_priority

# Non-destructive canary tokens & active probe cases
CANARY_TOKEN = "trepath_active_7f9b2"

SQLI_CANARIES = [
    ("'", "SQL Syntax Quotation Error Test"),
    ("\" OR \"1\"=\"1", "Boolean Logical SQL Injection Probe"),
    ("1' AND '1'='1", "String Literal Comparison Probe")
]

SQL_ERROR_PATTERNS = [
    "SQL syntax", "mysql_fetch", "Warning: mysql_", "PostgreSQL query failed",
    "ORA-01756", "SQLite3::SQLException", "Microsoft OLE DB Provider for SQL Server",
    "Unclosed quotation mark after the character string", "Syntax error in SQL statement"
]

TRAVERSAL_PATHS = [
    ("/etc/passwd", "Linux /etc/passwd disclosure"),
    ("..%2f..%2f..%2fetc%2fpasswd", "URL-encoded relative path traversal"),
    ("/windows/win.ini", "Windows system initialization disclosure")
]

async def run_active_fuzzer(target_url: str, timeout: float = 3.0) -> list[dict]:
    """
    Executes controlled, non-destructive active application testing:
    1. Reflected Input / XSS Canary sanitization check (RUNTIME_REPRODUCED when canary reflects)
    2. SQL Error-Boundary Response differential test (RUNTIME_REPRODUCED when DBMS error triggers)
    3. Path Traversal & Sensitive File Exposure test (IMPACT_VERIFIED when OS file contents disclose)
    """
    findings = []
    parsed = urlparse(target_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    timeout_config = httpx.Timeout(connect=1.5, read=2.0, write=1.5, pool=2.5)

    async with httpx.AsyncClient(timeout=timeout_config, verify=False, follow_redirects=True,
                                 headers={"User-Agent": "TrePath-ActiveProbe/2.0"}) as client:
        # 1. Reflected Input / Potential XSS Sink Check
        try:
            canary_payload = f"<script>{CANARY_TOKEN}</script>"
            test_xss_url = f"{origin}/?q={canary_payload}&search={canary_payload}"
            res = await client.get(test_xss_url)
            
            if canary_payload in res.text:
                findings.append({
                    "finding_key": "APP-ACTIVE-REFLECTED-XSS-SINK",
                    "title": f"Reflected Unencoded Input Discovered on {origin}",
                    "description": f"Target endpoint reflected untrusted HTML markup ('{canary_payload}') without context-aware HTML entity encoding.",
                    "severity": "high",
                    "proof_state": ProofState.RUNTIME_REPRODUCED,
                    "cvss_score": 6.1,
                    "cve_id": None,
                    "cwe_id": "CWE-79",
                    "remediation": "Apply context-aware output encoding (htmlspecialchars, DOM textContent, or template auto-escaping) on all reflected parameters.",
                    "risk_priority": calculate_risk_priority("high", exposure=0.8, exploitability=0.6, confidence=1.0),
                    "evidence": json.dumps({
                        "source": "TrePath Active Boundary Fuzzer (INJ-INPUT-001)",
                        "matched_at": test_xss_url,
                        "matched_canary": canary_payload,
                        "reproduction_trace": f"GET {test_xss_url} -> HTTP {res.status_code} response body reflected unencoded canary '{canary_payload}'.",
                        "request": f"GET /?q={canary_payload}&search={canary_payload} HTTP/1.1\r\nHost: {parsed.netloc}\r\nUser-Agent: TrePath-ActiveProbe/2.0",
                        "response": f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n\r\n{res.text[:600]}",
                    }, indent=2),
                })
        except Exception:
            pass

        # 2. SQL Syntax Error-Boundary Probe
        for payload, label in SQLI_CANARIES:
            try:
                test_sql_url = f"{origin}/?id=1{payload}&cat=1{payload}&item=1{payload}"
                res = await client.get(test_sql_url)
                body = res.text
                
                matched_error = next((err for err in SQL_ERROR_PATTERNS if err.lower() in body.lower()), None)
                if matched_error:
                    findings.append({
                        "finding_key": "APP-ACTIVE-SQL-SYNTAX-ERROR",
                        "title": f"Database SQL Error Disclosed via Injection Probe ({label})",
                        "description": f"Injecting SQL syntax test '{payload}' triggered a verbose database error signature ('{matched_error}'). Indicates unparameterized query construction.",
                        "severity": "critical",
                        "proof_state": ProofState.RUNTIME_REPRODUCED,
                        "cvss_score": 8.5,
                        "cve_id": None,
                        "cwe_id": "CWE-89",
                        "remediation": "Use parameterized prepared statements with bound parameters; suppress database error messages in production.",
                        "risk_priority": calculate_risk_priority("critical", exposure=0.9, exploitability=0.7, confidence=1.0),
                        "evidence": json.dumps({
                            "source": "TrePath Active Boundary Fuzzer (INJ-INPUT-001)",
                            "matched_at": test_sql_url,
                            "matched_canary": matched_error,
                            "reproduction_trace": f"GET {test_sql_url} -> HTTP {res.status_code} disclosed DBMS error '{matched_error}'.",
                            "request": f"GET /?id=1{payload}&cat=1{payload}&item=1{payload} HTTP/1.1\r\nHost: {parsed.netloc}\r\nUser-Agent: TrePath-ActiveProbe/2.0",
                            "response": f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n\r\n{body[:600]}",
                        }, indent=2),
                    })
                    break
            except Exception:
                pass

        # 3. Path Traversal & Sensitive File Exposure Check
        for trav_path, label in TRAVERSAL_PATHS:
            try:
                test_trav_url = f"{origin}/?file={trav_path}&page={trav_path}&path={trav_path}"
                res = await client.get(test_trav_url)
                body = res.text
                
                is_passwd = "root:x:0:0:" in body or "root:*:0:0:" in body
                is_win_ini = "[fonts]" in body.lower() or "[extensions]" in body.lower()

                if is_passwd or is_win_ini:
                    findings.append({
                        "finding_key": "APP-ACTIVE-DIRECTORY-TRAVERSAL",
                        "title": f"Arbitrary File Traversal Exposure: {label}",
                        "description": f"Querying file parameter with traversal path '{trav_path}' disclosed operating system file contents.",
                        "severity": "critical",
                        "proof_state": ProofState.IMPACT_VERIFIED,
                        "cvss_score": 8.6,
                        "cve_id": None,
                        "cwe_id": "CWE-22",
                        "remediation": "Validate input against a strict whitelist of file identifiers; never pass user-controlled paths directly to filesystem APIs.",
                        "risk_priority": calculate_risk_priority("critical", exposure=0.9, exploitability=0.8, confidence=1.0),
                        "evidence": json.dumps({
                            "source": "TrePath Active Boundary Fuzzer (FILE-TRAVERSAL)",
                            "matched_at": test_trav_url,
                            "impact_proof": body[:250],
                            "reproduction_trace": f"GET {test_trav_url} -> Disclosed OS file signature.",
                            "request": f"GET /?file={trav_path}&page={trav_path}&path={trav_path} HTTP/1.1\r\nHost: {parsed.netloc}",
                            "response": f"HTTP/1.1 {res.status_code} {res.reason_phrase}\r\n\r\n{body[:400]}",
                        }, indent=2),
                    })
                    break
            except Exception:
                pass

    return findings
