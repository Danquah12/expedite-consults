"use client";

import { useState } from "react";
import { Bot, Sparkles, Code2, GitPullRequest, CheckCircle2, Copy, Play, ArrowRight, ShieldCheck, FileText } from "lucide-react";

export default function DeveloperAssistPage() {
  const [selectedFinding, setSelectedFinding] = useState("sqli");
  const [prCreated, setPrCreated] = useState(false);

  const diffFixes: Record<string, { title: string; file: string; cwe: string; diff: string; test: string }> = {
    sqli: {
      title: "CWE-89: SQL Injection via Raw Template String",
      file: "src/controllers/authController.ts",
      cwe: "CWE-89 / CVSS 9.8",
      diff: `--- a/src/controllers/authController.ts
+++ b/src/controllers/authController.ts
@@ -24,3 +24,3 @@ export async function findUser(username: string) {
-  const query = "SELECT * FROM users WHERE username = '" + username + "'";
-  return await db.raw(query);
+  const query = 'SELECT * FROM users WHERE username = $1';
+  return await db.query(query, [username]);
 }`,
      test: `describe("authController Security Tests", () => {
  it("should prevent SQL injection payloads with single quotes", async () => {
    const payload = "admin' OR '1'='1";
    const result = await findUser(payload);
    expect(result.length).toBe(0);
  });
});`
    },
    ssrf: {
      title: "CWE-918: Server-Side Request Forgery in Webhook Exporter",
      file: "src/services/webhookService.ts",
      cwe: "CWE-918 / CVSS 8.6",
      diff: `--- a/src/services/webhookService.ts
+++ b/src/services/webhookService.ts
@@ -14,3 +14,5 @@ export async function dispatchWebhook(targetUrl: string) {
+  if (isPrivateSubnet(targetUrl)) {
+    throw new Error("Egress to private metadata IP (169.254.169.254) blocked");
+  }
   return await fetch(targetUrl);
 }`,
      test: `it("should reject private AWS IMDSv1 IP addresses", async () => {
  await expect(dispatchWebhook("http://169.254.169.254/latest/meta-data/"))
    .rejects.toThrow("blocked");
});`
    }
  };

  const current = diffFixes[selectedFinding];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 4, background: "#f4e5dc", border: "1px solid var(--border)", color: "#8b4528", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
          <Bot size={13} />
          <span>DEVELOPER ASSIST &amp; TRIAGE AGENT</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1f1b18" }}>1-Click Automated Remediation &amp; PR Generator</h1>
        <p style={{ fontSize: 14, color: "#5c5349" }}>
          AI-generated, AST-validated secure code patches and unit tests ready to merge directly into GitHub/GitLab.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        <div style={{ background: "#fbf8f3", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
            Actionable Findings
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { setSelectedFinding("sqli"); setPrCreated(false); }}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 8,
                background: selectedFinding === "sqli" ? "#f4e5dc" : "#ece5d8",
                border: selectedFinding === "sqli" ? "1px solid #8b4528" : "1px solid var(--border)",
                color: "#1f1b18",
                cursor: "pointer"
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "#e5484d" }}>SQL Injection</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>authController.ts</div>
            </button>

            <button
              onClick={() => { setSelectedFinding("ssrf"); setPrCreated(false); }}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 8,
                background: selectedFinding === "ssrf" ? "#f4e5dc" : "#ece5d8",
                border: selectedFinding === "ssrf" ? "1px solid #8b4528" : "1px solid var(--border)",
                color: "#1f1b18",
                cursor: "pointer"
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "#e2853b" }}>SSRF Egress</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>webhookService.ts</div>
            </button>
          </div>
        </div>

        <div style={{ background: "#fbf8f3", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1f1b18" }}>{current.title}</h2>
              <div style={{ fontSize: 12, color: "#8b4528", fontFamily: "monospace", marginTop: 2 }}>{current.file} &middot; {current.cwe}</div>
            </div>

            <button
              onClick={() => setPrCreated(true)}
              style={{
                background: prCreated ? "#46a36e" : "#8b4528",
                color: "#f3eee4",
                padding: "8px 18px",
                borderRadius: 6,
                border: "none",
                fontSize: 12.5,
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <GitPullRequest size={15} />
              <span>{prCreated ? "PR #104 Opened on GitHub" : "Create 1-Click Pull Request"}</span>
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4a4239", marginBottom: 6 }}>AST-Verified Git Diff</div>
            <pre style={{
              background: "#f3eee4",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              fontFamily: "monospace",
              color: "#1f1b18",
              overflowX: "auto",
              lineHeight: 1.5
            }}>
              {current.diff}
            </pre>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4a4239", marginBottom: 6 }}>Generated Jest Security Regression Test</div>
            <pre style={{
              background: "#f3eee4",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              fontFamily: "monospace",
              color: "#8b4528",
              overflowX: "auto",
              lineHeight: 1.5
            }}>
              {current.test}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
