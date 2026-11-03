"""
Antigravity Autonomous Security Triage Engine for Trepath 2.0
Integrates with the local Antigravity runtime to generate:
- Exploit validity analysis
- Root-cause remediation diffs
- Safe curl reproduction vectors
Uses the local Antigravity authentication session with zero external API keys.
"""
import asyncio
import json
import sys
from typing import Dict, Any, Optional
from google.antigravity import Agent, LocalAgentConfig

TRIAGE_SYSTEM_PROMPT = """
You are a Principal Offensive Security & Application Defense Engineer in Trepath 2.0.
When given a security finding (vulnerability type, target, parameter, payload, and response evidence):
1. Assess validity (True Positive, False Positive, or Informational).
2. Explain the root-cause mechanics.
3. Provide the exact code fix in the appropriate programming language.
4. Provide a benign, non-destructive curl command to verify the fix.
Format the output as a valid JSON object:
{
  "finding_id": string,
  "assessment": "TRUE_POSITIVE" | "FALSE_POSITIVE" | "INFORMATIONAL",
  "cvss_score": float,
  "cwe": string,
  "root_cause_explanation": string,
  "remediation_diff": string,
  "validation_curl": string
}
Return ONLY the raw JSON object.
"""

async def triage_finding(finding: Dict[str, Any]) -> Dict[str, Any]:
    config = LocalAgentConfig(
        system_instructions=TRIAGE_SYSTEM_PROMPT
    )
    async with Agent(config) as agent:
        prompt = (
            f"Triage this finding:\n"
            f"ID: {finding.get('id', 'F-001')}\n"
            f"Type: {finding.get('type')}\n"
            f"URL: {finding.get('url')}\n"
            f"Parameter: {finding.get('parameter')}\n"
            f"Injected Payload: {finding.get('payload')}\n"
            f"Evidence: {finding.get('evidence')}"
        )
        response = await agent.chat(prompt)
        raw_text = ""
        async for token in response:
            raw_text += token

    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())

if __name__ == "__main__":
    sample_finding = {
        "id": "TP-FINDING-042",
        "type": "Blind SQL Injection (Time-Based)",
        "url": "https://api.internal.target/v1/users/lookup",
        "parameter": "account_id",
        "payload": "1004' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)-- -",
        "evidence": "Server responded in 5,210ms vs normal baseline of 42ms."
    }
    print("[Trepath 2.0] Triaging finding via local Antigravity Agent...")
    result = asyncio.run(triage_finding(sample_finding))
    print(json.dumps(result, indent=2))
