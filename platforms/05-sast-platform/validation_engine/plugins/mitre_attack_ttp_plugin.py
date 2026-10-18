"""
Plugin 1: MITRE ATT&CK® Enterprise v15 (Tactics, Techniques, Sub-Techniques & Procedures)
+ MITRE D3FEND™ Defensive Countermeasure Plugin.

Maps any scanned source-code sink and CWE to its full MITRE ATT&CK Tactic -> Technique ->
Sub-Technique -> Code-Level Procedure trace and prescribes the MITRE D3FEND countermeasure.
"""

from __future__ import annotations

from typing import Dict, Any
from .base_plugin import CodeSnippetContext, SecurityStandardPlugin, StandardCheckVerdict


MITRE_TTP_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "CWE-89": {
        "tactic_id": "TA0001 / TA0009",
        "tactic_name": "Initial Access · Collection",
        "technique_id": "T1190",
        "sub_technique_id": "T1190 / T1213",
        "technique_name": "Exploit Public-Facing Application -> Data from Information Repositories",
        "procedure_template": (
            "Adversary supplies crafted relational predicates into `{file}:{line}` where `{code}` "
            "concatenates untrusted input directly into the SQL command parser, bypassing row-level "
            "filters and reading/modifying backend tables."
        ),
        "d3fend_id": "D3-IV / D3-SCA",
        "d3fend_countermeasure": "Input Validation (Parameterized Prepared Statements & Bound AST Variables)",
        "detection_telemetry": "Database query AST structure anomaly & prepared-statement bypass audit log",
    },
    "CWE-78": {
        "tactic_id": "TA0002",
        "tactic_name": "Execution",
        "technique_id": "T1059",
        "sub_technique_id": "T1059.004",
        "technique_name": "Command and Scripting Interpreter: Unix Shell / OS Subprocess",
        "procedure_template": (
            "Untrusted parameter reaches OS process execution sink at `{file}:{line}` (`{code}`), "
            "allowing shell metacharacters (`;`, `|`, `$()`) to spawn child interpreter processes under the service account."
        ),
        "d3fend_id": "D3-HBLP / D3-IV",
        "d3fend_countermeasure": "Execve Argument Array Isolation (`shell=False`) & Strict Alphanumeric Allowlist",
        "detection_telemetry": "eBPF / auditd child process creation (`execve` from web worker PID)",
    },
    "CWE-94": {
        "tactic_id": "TA0002 / TA0005",
        "tactic_name": "Execution · Defense Evasion",
        "technique_id": "T1059",
        "sub_technique_id": "T1059.006 / T1059.007",
        "technique_name": "Command and Scripting Interpreter: Dynamic Code Evaluation (`eval` / `exec`)",
        "procedure_template": (
            "Dynamic code interpreter invoked on user-controlled expression at `{file}:{line}` (`{code}`), "
            "enabling arbitrary runtime AST execution within the application memory space."
        ),
        "d3fend_id": "D3-SCA / D3-IV",
        "d3fend_countermeasure": "Replace `eval`/`exec`/`Function()` with safe JSON/AST literal parsing (`ast.literal_eval`)",
        "detection_telemetry": "Runtime dynamic compilation / interpreter hook alert",
    },
    "CWE-79": {
        "tactic_id": "TA0001 / TA0006",
        "tactic_name": "Initial Access · Credential Access",
        "technique_id": "T1189 / T1059.007",
        "sub_technique_id": "T1059.007",
        "technique_name": "Drive-by Compromise / JavaScript Execution in Victim Origin",
        "procedure_template": (
            "Unencoded input rendered into DOM/HTML response sink at `{file}:{line}` (`{code}`), "
            "allowing arbitrary script execution in the authenticated user's browser session."
        ),
        "d3fend_id": "D3-IV",
        "d3fend_countermeasure": "Context-Aware Output Encoding, DOMPurify Sanitization & Strict CSP (`script-src 'nonce-...'`)",
        "detection_telemetry": "CSP violation report (`Content-Security-Policy-Report-Only`)",
    },
    "CWE-22": {
        "tactic_id": "TA0009 / TA0006",
        "tactic_name": "Collection · Credential Access",
        "technique_id": "T1005",
        "sub_technique_id": "T1005 / T1552.001",
        "technique_name": "Data from Local System (Relative Path Traversal)",
        "procedure_template": (
            "File-system path constructed with unsanitized user segment at `{file}:{line}` (`{code}`), "
            "permitting `../` dot-dot-slash sequences to escape the intended base directory."
        ),
        "d3fend_id": "D3-FPA",
        "d3fend_countermeasure": "File Path Canonicalization (`Path.resolve()`) + Base-Directory Prefix Enforcement",
        "detection_telemetry": "Filesystem access outside chroot/base storage prefix",
    },
    "CWE-502": {
        "tactic_id": "TA0002 / TA0004",
        "tactic_name": "Execution · Privilege Escalation",
        "technique_id": "T1203",
        "sub_technique_id": "T1059",
        "technique_name": "Exploitation for Client/Server Execution via Unsafe Object Deserialization",
        "procedure_template": (
            "Untrusted byte/YAML/pickle/ObjectInputStream stream deserialized at `{file}:{line}` (`{code}`), "
            "triggering gadget-chain constructors before type validation occurs."
        ),
        "d3fend_id": "D3-IV / D3-SCA",
        "d3fend_countermeasure": "Use safe data-only parsers (`yaml.safe_load`, JSON schema, `ObjectInputFilter` allowlists)",
        "detection_telemetry": "Classloader instantiation of unexpected gadget classes",
    },
    "CWE-798": {
        "tactic_id": "TA0006 / TA0008",
        "tactic_name": "Credential Access · Lateral Movement",
        "technique_id": "T1552",
        "sub_technique_id": "T1552.001",
        "technique_name": "Unsecured Credentials: Credentials In Files / Source Code",
        "procedure_template": (
            "Static secret, API token, or private key embedded in source at `{file}:{line}` (`{code}`), "
            "allowing any principal with repo or build-artifact read access to authenticate laterally."
        ),
        "d3fend_id": "D3-CH",
        "d3fend_countermeasure": "Credential Hardening: Externalize to KMS/Vault & Rotate Compromised Key Immediately",
        "detection_telemetry": "Git commit entropy scanner & IAM anomalous token source IP alert",
    },
    "CWE-918": {
        "tactic_id": "TA0007 / TA0006",
        "tactic_name": "Discovery · Credential Access",
        "technique_id": "T1090 / T1552.005",
        "sub_technique_id": "T1552.005",
        "technique_name": "Cloud Instance Metadata API & Internal Service Discovery via SSRF",
        "procedure_template": (
            "Server-side HTTP client fetches caller-controlled URL at `{file}:{line}` (`{code}`), "
            "allowing internal VPC scanning or cloud metadata (`169.254.169.254`) credential retrieval."
        ),
        "d3fend_id": "D3-NTF",
        "d3fend_countermeasure": "Network Traffic Filtering: HTTPS Domain Allowlist + DNS Resolution Private-IP Block",
        "detection_telemetry": "Egress proxy block log for RFC1918 / link-local `169.254.169.254` addresses",
    },
    "CWE-327": {
        "tactic_id": "TA0006 / TA0005",
        "tactic_name": "Credential Access · Defense Evasion",
        "technique_id": "T1600",
        "sub_technique_id": "T1600.001",
        "technique_name": "Weaken Encryption: Reduce Key Space / Broken Cryptographic Algorithm",
        "procedure_template": (
            "Deprecated or collision-prone cryptographic primitive (`MD5`/`SHA1`/`DES`/`ECB`) invoked at `{file}:{line}` (`{code}`)."
        ),
        "d3fend_id": "D3-CH",
        "d3fend_countermeasure": "Upgrade to AES-256-GCM, SHA-256/SHA-3, and Argon2id / bcrypt (cost >= 12)",
        "detection_telemetry": "Cryptographic API policy audit",
    },
    "CWE-862": {
        "tactic_id": "TA0004 / TA0009",
        "tactic_name": "Privilege Escalation · Collection",
        "technique_id": "T1548",
        "sub_technique_id": "T1078",
        "technique_name": "Abuse Elevation Control Mechanism / Missing Authorization Predicate",
        "procedure_template": (
            "Endpoint or data-access function at `{file}:{line}` (`{code}`) executes without verifying "
            "caller role or tenant ownership predicate."
        ),
        "d3fend_id": "D3-ACL",
        "d3fend_countermeasure": "Enforce Default-Deny RBAC Middleware & Row-Level `tenant_id` Ownership Filter",
        "detection_telemetry": "Cross-tenant authorization audit failure log",
    },
}


class MitreAttackTtpPlugin(SecurityStandardPlugin):
    @property
    def plugin_id(self) -> str:
        return "PY-PLUGIN-MITRE-TTP"

    @property
    def plugin_name(self) -> str:
        return "MITRE ATT&CK® v15 TTP & D3FEND™ Analyzer"

    @property
    def standard_family(self) -> str:
        return "MITRE ATT&CK Enterprise v15 + MITRE D3FEND"

    def evaluate_finding(self, ctx: CodeSnippetContext) -> StandardCheckVerdict:
        kb = MITRE_TTP_KNOWLEDGE_BASE.get(
            ctx.cwe_id,
            MITRE_TTP_KNOWLEDGE_BASE["CWE-89"],
        )
        procedure_trace = kb["procedure_template"].format(
            file=ctx.file_path,
            line=ctx.line_number,
            code=ctx.code_line.strip(),
        )
        passed = ctx.sanitizer_present
        return StandardCheckVerdict(
            plugin_id=self.plugin_id,
            plugin_name=self.plugin_name,
            standard_family=self.standard_family,
            passed=passed,
            primary_id=f"{kb['tactic_id']} · {kb['sub_technique_id']}",
            title=f"{kb['tactic_name']} -> {kb['technique_name']}",
            summary=procedure_trace,
            metadata={
                "tactic_id": kb["tactic_id"],
                "tactic_name": kb["tactic_name"],
                "technique_id": kb["technique_id"],
                "sub_technique_id": kb["sub_technique_id"],
                "technique_name": kb["technique_name"],
                "procedure_trace": procedure_trace,
                "d3fend_id": kb["d3fend_id"],
                "d3fend_countermeasure": kb["d3fend_countermeasure"],
                "detection_telemetry": kb["detection_telemetry"],
            },
            remediation_control=f"[{kb['d3fend_id']}] {kb['d3fend_countermeasure']}",
        )
