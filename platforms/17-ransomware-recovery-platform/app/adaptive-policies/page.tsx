"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Lock,
  Code,
  Terminal,
  Server,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Play,
  Users,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  FileCode,
  Layers,
  Flame,
  Key,
  Radio,
  Sliders
} from "lucide-react";

interface AdaptiveRule {
  id: string;
  category: "FIREWALL" | "EDR_BEHAVIORAL" | "GPO_ACTIVE_DIRECTORY" | "SIEM_SIGMA";
  name: string;
  targetPlatform: string;
  sourceFinding: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  riskImpact: "ZERO_DOWNTIME" | "LOW_USER_IMPACT" | "REQUIRES_MAINTENANCE_WINDOW";
  dryRunPassed: boolean;
  status: "READY_FOR_APPROVAL" | "APPROVED_STAGED" | "DEPLOYED_LIVE" | "SIMULATION_TESTING";
  codeSnippet: string;
  syntaxLanguage: "powershell" | "xml" | "json" | "yaml" | "bash";
  signersRequired: number;
  currentSignatures: string[];
}

const INITIAL_RULES: AdaptiveRule[] = [
  {
    id: "rule-01",
    category: "FIREWALL",
    name: "Palo Alto PAN-OS Dynamic Inter-VLAN SMB & C2 Egress Drop",
    targetPlatform: "Palo Alto Networks Next-Gen Firewall (PAN-OS 11.x)",
    sourceFinding: "Case INC-2026-8841: Lateral PsExec worming across Clinical VLAN 10.14.0.0/16",
    severity: "CRITICAL",
    riskImpact: "ZERO_DOWNTIME",
    dryRunPassed: true,
    status: "READY_FOR_APPROVAL",
    syntaxLanguage: "xml",
    signersRequired: 2,
    currentSignatures: ["Dave Chen (NetOps Director)"],
    codeSnippet: `<entry name="RULE-AEGIS-DROP-LATERAL-SMB">
  <to><member>Clinical-EHR-Zone</member></to>
  <from><member>User-Workstation-Zone</member></from>
  <source><member>any</member></source>
  <destination><member>10.14.3.0/24</member></destination>
  <service>
    <member>service-netbios-ssn</member>
    <member>service-microsoft-ds</member>
    <member>service-ms-rdp</member>
  </service>
  <application>
    <member>ms-ds-smb</member>
    <member>ms-rdp</member>
    <member>wmi</member>
  </application>
  <action>deny</action>
  <log-end>yes</log-end>
  <tag><member>Aegis-Adaptive-Containment</member></tag>
</entry>`
  },
  {
    id: "rule-02",
    category: "EDR_BEHAVIORAL",
    name: "CrowdStrike Falcon Custom IOA: Shadow Copy Deletion Block",
    targetPlatform: "CrowdStrike Falcon Endpoint Security (Custom IOA Rule)",
    sourceFinding: "Case INC-2026-8841: Malicious invocation of vssadmin delete shadows & bcdedit",
    severity: "CRITICAL",
    riskImpact: "ZERO_DOWNTIME",
    dryRunPassed: true,
    status: "READY_FOR_APPROVAL",
    syntaxLanguage: "json",
    signersRequired: 2,
    currentSignatures: ["Elena Rostova (Incident Lead)"],
    codeSnippet: `{
  "name": "AEGIS-IOA-BLOCK-VSS-TAMPER",
  "description": "Prevents ransomware from invoking shadow copy deletion or recovery alteration commands",
  "platform": "windows",
  "action": "kill_process_and_quarantine",
  "severity": "critical",
  "grandparent_process": ".*",
  "parent_process": "(cmd|powershell|pwsh|wscript|cscript)\\\\.exe",
  "target_process": "(vssadmin|wmic|bcdedit|wbadmin|diskshadow)\\\\.exe",
  "command_line": ".*(delete\\\\s+shadows|shadowcopy\\\\s+delete|recoveryenabled\\\\s+no|bootstatuspolicy\\\\s+ignoreallfailures).*",
  "notifications": {
    "siem_webhook": true,
    "soc_high_priority_page": true
  }
}`
  },
  {
    id: "rule-03",
    category: "GPO_ACTIVE_DIRECTORY",
    name: "Active Directory GPO: Enforce SMBv3 Signing & Block NTLMv1",
    targetPlatform: "Microsoft Active Directory Domain Services (Group Policy Script)",
    sourceFinding: "Case INC-2026-8841: NTLM relaying and credential harvesting on legacy hosts",
    severity: "HIGH",
    riskImpact: "LOW_USER_IMPACT",
    dryRunPassed: true,
    status: "APPROVED_STAGED",
    syntaxLanguage: "powershell",
    signersRequired: 2,
    currentSignatures: ["Sarah Jenkins (IAM Lead)", "Marcus Vance (Principal Forensics)"],
    codeSnippet: `# Aegis Active Directory Adaptive Hardening Script
# Enforces strict SMB Signing and disables legacy NTLM authentication
Import-Module GroupPolicy

$GpoName = "AEGIS-Hardening-Identity-Tier0"
$GPO = New-GPO -Name $GpoName -Comment "Automated Post-Incident Hardening"

# 1. Require SMBv3 Server & Client Signing
Set-GPRegistryValue -Name $GpoName -Key "HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters" -ValueName "RequireSecuritySignature" -Type DWord -Value 1
Set-GPRegistryValue -Name $GpoName -Key "HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters" -ValueName "RequireSecuritySignature" -Type DWord -Value 1

# 2. Block NTLMv1 / Restrict NTLM
Set-GPRegistryValue -Name $GpoName -Key "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa" -ValueName "LmCompatibilityLevel" -Type DWord -Value 5

# 3. Enable RDP Restricted Admin Mode
Set-GPRegistryValue -Name $GpoName -Key "HKLM\\System\\CurrentControlSet\\Control\\Lsa" -ValueName "DisableRestrictedAdmin" -Type DWord -Value 0

Write-Output "[+] GPO '$GpoName' successfully staged for Tier-0 OU deployment."`
  },
  {
    id: "rule-04",
    category: "SIEM_SIGMA",
    name: "Sigma Detection: Rapid Entropy Burst & Mass Rename Pattern",
    targetPlatform: "Sigma Generic Rule (Exportable to Splunk, Microsoft Sentinel, Elastic)",
    sourceFinding: "Case INC-2026-8841: LockBit 3.0 multi-threaded encryptor file renaming",
    severity: "HIGH",
    riskImpact: "ZERO_DOWNTIME",
    dryRunPassed: true,
    status: "READY_FOR_APPROVAL",
    syntaxLanguage: "yaml",
    signersRequired: 2,
    currentSignatures: [],
    codeSnippet: `title: Pre-Encryption Rapid File Renaming Burst
id: 489d8132-7bb1-4df2-8e12-8841aegis001
status: experimental
description: Detects rapid renaming of files to ransomware appended extensions (.lockbit, .crypted)
author: Aegis Automated Threat Intelligence
logsource:
    category: file_event
    product: windows
detection:
    selection:
        TargetFilename|endswith:
            - '.lockbit'
            - '.crypted'
            - '.alphv'
            - '.royal_u'
    timeframe: 10s
    condition: selection | count() by ProcessId > 50
fields:
    - Image
    - ProcessId
    - User
    - TargetFilename
falsepositives:
    - High-volume backup archives or legitimate bulk ZIP compressors
level: critical`
  }
];

export default function AdaptivePoliciesPage() {
  const [rules, setRules] = useState<AdaptiveRule[]>(INITIAL_RULES);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeRuleId, setActiveRuleId] = useState<string>("rule-01");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const activeRule = rules.find(r => r.id === activeRuleId) || rules[0];

  const filteredRules = useMemo(() => {
    return rules.filter(r => selectedCategory === "ALL" || r.category === selectedCategory);
  }, [rules, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: rules.length,
      deployed: rules.filter(r => r.status === "DEPLOYED_LIVE").length,
      staged: rules.filter(r => r.status === "APPROVED_STAGED").length,
      pending: rules.filter(r => r.status === "READY_FOR_APPROVAL").length
    };
  }, [rules]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    triggerToast("Policy syntax copied to clipboard.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const signAndApprove = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => {
        if (r.id !== ruleId) return r;
        const mySignature = "You (Incident Commander - Authenticated FIDO2)";
        const updatedSignatures = [...r.currentSignatures, mySignature];
        const nextStatus = updatedSignatures.length >= r.signersRequired ? "APPROVED_STAGED" : "READY_FOR_APPROVAL";
        return {
          ...r,
          currentSignatures: updatedSignatures,
          status: nextStatus
        };
      })
    );
    triggerToast("Dual-custody signature recorded. Rule updated to APPROVED.");
  };

  const deployLive = (ruleId: string) => {
    setIsDeploying(true);
    setTimeout(() => {
      setRules(prev =>
        prev.map(r => (r.id === ruleId ? { ...r, status: "DEPLOYED_LIVE" } : r))
      );
      setIsDeploying(false);
      triggerToast("Rule deployed to target infrastructure API successfully.");
    }, 1200);
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "calc(100vh - 54px)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 20 }}>
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "var(--surface-3)",
          border: "1px solid var(--primary)",
          color: "var(--fg)",
          padding: "10px 18px",
          borderRadius: 8,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Sparkles size={16} color="var(--primary)" />
          {toastMessage}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "0.08em"
            }}>
              DYNAMIC HARDENING & POLICY GENERATOR
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Automated Root-Cause to Policy Compiler
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
            Adaptive Security Policy & Rule Generator
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4, maxWidth: 880 }}>
            Converts post-incident root-cause findings into validated firewall deny rules (Palo Alto/Fortinet), EDR behavioral IOAs (CrowdStrike/SentinelOne), and Active Directory GPO hardening scripts under dual-custody governance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              const fullBundle = JSON.stringify({ bundleDate: new Date().toISOString(), rules }, null, 2);
              const blob = new Blob([fullBundle], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Aegis-Adaptive-Policy-Bundle.json";
              a.click();
              triggerToast("Complete policy bundle exported.");
            }}
            className="btn-primary"
          >
            <Download size={14} />
            Export Complete Policy Bundle
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Generated Policies</span>
            <Layers size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--fg)" }}>{stats.total} Rules</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Covering 4 Critical Infrastructure Domains</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--cyan)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Deployed Live to API</span>
            <CheckCircle2 size={16} color="var(--cyan)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>{stats.deployed} Active</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>0 False Positives Triggered</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Pending Dual-Custody</span>
            <Users size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--amber)" }}>{stats.pending} Staged</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Requires 2 Authorized Signers</div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, borderLeft: "4px solid var(--purple)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Dry-Run Simulation</span>
            <Play size={16} color="var(--purple)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "var(--purple)" }}>100% Passed</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Synthetic Sandbox Validated</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: 16, flex: 1 }}>
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "FIREWALL", "EDR_BEHAVIORAL", "GPO_ACTIVE_DIRECTORY", "SIEM_SIGMA"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? "var(--primary)" : "var(--surface-2)",
                  color: selectedCategory === cat ? "#04100c" : "var(--fg-2)",
                  border: selectedCategory === cat ? "none" : "1px solid var(--border)",
                  padding: "4px 10px",
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {cat === "ALL" ? "All" : cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 580 }}>
            {filteredRules.map((rule) => {
              const isSelected = activeRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setActiveRuleId(rule.id)}
                  style={{
                    background: isSelected ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--fg-2)",
                      fontFamily: "monospace"
                    }}>
                      {rule.category}
                    </span>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color:
                        rule.status === "DEPLOYED_LIVE"
                          ? "var(--primary)"
                          : rule.status === "APPROVED_STAGED"
                          ? "var(--cyan)"
                          : "var(--amber)"
                    }}>
                      {rule.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                    {rule.name}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Target: <strong style={{ color: "var(--fg-2)" }}>{rule.targetPlatform}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--primary)",
                  fontFamily: "monospace"
                }}>
                  {activeRule.category}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
                  {activeRule.name}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
                Triggered By: <span style={{ color: "var(--fg-2)" }}>{activeRule.sourceFinding}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => copyCode(activeRule.codeSnippet, activeRule.id)}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: 11.5 }}
              >
                {copiedId === activeRule.id ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                {copiedId === activeRule.id ? "Copied" : "Copy Code"}
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([activeRule.codeSnippet], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${activeRule.name.replace(/\s+/g, "_")}.${activeRule.syntaxLanguage}`;
                  a.click();
                  triggerToast(`Downloaded ${activeRule.name} policy script.`);
                }}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: 11.5 }}
              >
                <Download size={13} />
                Save File
              </button>
            </div>
          </div>

          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              background: "var(--surface-3)",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              fontFamily: "monospace",
              color: "var(--muted)"
            }}>
              <span>FORMAT: {activeRule.syntaxLanguage.toUpperCase()}</span>
              <span>SYNTAX VALIDATED · DRY-RUN PASSED</span>
            </div>

            <pre style={{
              margin: 0,
              padding: "16px 18px",
              color: "var(--fg)",
              fontFamily: "Consolas, Menlo, Monaco, monospace",
              fontSize: 12,
              lineHeight: 1.55,
              overflowX: "auto",
              maxHeight: 320
            }}>
              <code>{activeRule.codeSnippet}</code>
            </pre>
          </div>

          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={14} color="var(--amber)" />
                Dual-Custody Sign-Off ({activeRule.currentSignatures.length} of {activeRule.signersRequired} Signatures)
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                Signers: {activeRule.currentSignatures.length > 0 ? activeRule.currentSignatures.join(" · ") : "None yet"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeRule.status === "READY_FOR_APPROVAL" && (
                <button
                  onClick={() => signAndApprove(activeRule.id)}
                  className="btn-secondary"
                  style={{ color: "var(--primary)", borderColor: "rgba(16,185,129,0.4)" }}
                >
                  <ShieldCheck size={14} />
                  Authorize & Sign Policy
                </button>
              )}

              {activeRule.status === "APPROVED_STAGED" && (
                <button
                  disabled={isDeploying}
                  onClick={() => deployLive(activeRule.id)}
                  className="btn-primary"
                >
                  <Play size={14} />
                  {isDeploying ? "Deploying to API..." : "Push to Firewall / EDR API"}
                </button>
              )}

              {activeRule.status === "DEPLOYED_LIVE" && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--primary)",
                  fontWeight: 800,
                  fontSize: 12,
                  background: "rgba(16,185,129,0.15)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(16,185,129,0.3)"
                }}>
                  <CheckCircle2 size={15} />
                  LIVE ON PRODUCTION API
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
