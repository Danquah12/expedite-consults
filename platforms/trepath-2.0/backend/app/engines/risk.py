def calculate_risk_priority(severity: str, exposure: float = 1.0,
                            exploitability: float = 0.25, confidence: float = 1.0) -> float:
    """Explainable triage score; intentionally NOT CVSS and never presented as CVSS."""
    base = {"critical": 10.0, "high": 8.0, "medium": 5.0, "low": 2.0, "info": 0.5}.get(severity.lower(), 1.0)
    values = [max(0.0, min(1.0, x)) for x in (exposure, exploitability, confidence)]
    return round(min(10.0, base * (0.45 + 0.25*values[0] + 0.20*values[1] + 0.10*values[2])), 2)
