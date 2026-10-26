---
name: applyVulnScript
description: |
  Skill that maps a vulnerability finding from supported scanners (ZAP, Nessus, BNAP, OpenVAS, Burp, Nuclei, etc.) to the corresponding script defined in `src/scripts/vulnerabilityScriptMap.ts` and executes it against the target URL.

steps:
  - name: Identify finding type
    description: |
      The skill receives a JSON payload `{ "scanner": "ZAP", "finding": "Clickjacking", "targetUrl": "https://example.com" }`.
      It extracts the `finding` field.
  - name: Resolve script path
    description: |
      Load `src/scripts/vulnerabilityScriptMap.ts`, locate the entry where `description` contains the finding (e.g., "Clickjacking lab 01 – ...").
      Retrieve the `path` value.
  - name: Execute script
    description: |
      Run the script with `node src/scripts/<script>.js` (or `python` for .py) passing the `targetUrl`.
      Capture stdout/stderr and return the result.
  - name: Return result
    description: |
      Produce a concise report `{ "script": "<path>", "output": "...", "status": "success|error" }`.

usage: |
  ```json
  {"scanner":"ZAP","finding":"Clickjacking","targetUrl":"https://demo.vuln"}
  ```

notes:
  - The skill does not embed third‑party URLs; all script references are internal.
  - Extend the mapping by adding new entries to `vulnerabilityScriptMap.ts`.
---
