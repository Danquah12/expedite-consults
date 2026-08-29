"use client";
import { useState } from "react";
import { Layers, Zap, CheckCircle } from "lucide-react";
import { methodColor, methodBg, sevColor, sevBg } from "@/lib/utils";
import type { HttpMethod } from "@/types/dast";

interface EndpointPlan {
  id:          string;
  method:      HttpMethod;
  path:        string;
  category:    string;
  risk:        "High" | "Medium" | "Low" | "Ignored";
  params:      number;
  plugins:     string[];
  reason:      string;
}

const PLAN: EndpointPlan[] = [
  { id:"e1",  method:"GET",    path:"/api/users",              category:"List Resource",        risk:"Medium", params:2, plugins:["BOLA/IDOR","Auth","Rate Limiting"],                          reason:"List endpoint with pagination. Test object enumeration and auth enforcement." },
  { id:"e2",  method:"GET",    path:"/api/users/{id}",         category:"Object Resource",      risk:"High",   params:3, plugins:["BOLA/IDOR","Auth Bypass","Injection","CORS"],                reason:"ID-based resource — high IDOR risk. Auth bypass and response data leakage." },
  { id:"e3",  method:"PUT",    path:"/api/users/{id}",         category:"Object Update",        risk:"High",   params:5, plugins:["BOLA/IDOR","Mass Assignment","XSS","SQLi"],                  reason:"Mass assignment risk — test if role/admin fields can be changed." },
  { id:"e4",  method:"POST",   path:"/api/auth/login",         category:"Authentication",       risk:"High",   params:2, plugins:["Brute Force","SQLi","User Enum","Account Lockout"],          reason:"Login endpoint — credential stuffing, SQL injection, enumeration." },
  { id:"e5",  method:"POST",   path:"/api/auth/refresh",       category:"Token Refresh",        risk:"Medium", params:1, plugins:["JWT Security","Token Replay","Auth"],                        reason:"JWT refresh — test token replay and expiry enforcement." },
  { id:"e6",  method:"GET",    path:"/api/products/search",    category:"Search / Input",       risk:"High",   params:2, plugins:["SQLi","XSS","SSTI","CMDi"],                                 reason:"Search with query param — top injection risk surface." },
  { id:"e7",  method:"PUT",    path:"/api/profile/update",     category:"Object Update",        risk:"High",   params:4, plugins:["XSS","SQLi","SSTI","Mass Assignment","Auth"],               reason:"Profile update with text fields — stored XSS and mass assignment." },
  { id:"e8",  method:"POST",   path:"/api/webhooks/test",      category:"Server-side Request",  risk:"High",   params:2, plugins:["SSRF","XXE","Open Redirect","OOB"],                         reason:"URL parameter controlled by user — critical SSRF surface." },
  { id:"e9",  method:"GET",    path:"/api/files/{filename}",   category:"File Access",          risk:"High",   params:1, plugins:["Path Traversal","LFI","SSRF","Auth"],                       reason:"Filename in path — direct path traversal target." },
  { id:"e10", method:"POST",   path:"/graphql",                category:"GraphQL API",          risk:"High",   params:1, plugins:["GraphQL Introspection","Injection","Auth","BOLA"],           reason:"GraphQL endpoint — introspection, batching attacks, field-level auth." },
  { id:"e11", method:"GET",    path:"/api/products",           category:"List Resource",        risk:"Low",    params:3, plugins:["Auth","Rate Limiting"],                                      reason:"Public product list — minimal risk. Check auth enforcement." },
  { id:"e12", method:"POST",   path:"/api/files/upload",       category:"File Upload",          risk:"High",   params:1, plugins:["File Upload","Path Traversal","SSRF","Malware Check"],      reason:"File upload — check extension validation, path traversal, malware." },
  { id:"e13", method:"GET",    path:"/api/users/me",           category:"Auth Check",           risk:"Medium", params:0, plugins:["CORS","Auth","Data Exposure","JWT Security"],               reason:"Authenticated profile endpoint — CORS, token validation, data exposure." },
  { id:"e14", method:"GET",    path:"/static/*",               category:"Static Asset",         risk:"Ignored",params:0, plugins:[],                                                            reason:"Static assets — skipped. No active testing." },
];

const riskColor = (r: string) => r === "High" ? "#ef5350" : r === "Medium" ? "var(--yellow)" : r === "Low" ? "var(--green)" : "var(--muted)";
const riskBg    = (r: string) => r === "High" ? "rgba(239,83,80,0.08)" : r === "Medium" ? "rgba(255,204,0,0.06)" : r === "Low" ? "rgba(61,220,132,0.06)" : "var(--surface)";

export default function PlannerPage() {
  const [selected, setSelected] = useState<EndpointPlan | null>(PLAN[0]);

  const totalPlugins = PLAN.reduce((a, e) => a + e.plugins.length, 0);
  const highRisk = PLAN.filter(e => e.risk === "High").length;
  const ignored  = PLAN.filter(e => e.risk === "Ignored").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Layers size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Test Planner</span>
        <span style={{ fontSize: 11, color: "#ef5350" }}>{highRisk} high risk</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "var(--primary)" }}>{totalPlugins} plugin invocations planned</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{ignored} ignored</span>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-primary"><Zap size={11} /> Execute Plan</button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Endpoint plan list */}
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Method</th>
                <th>Endpoint</th>
                <th style={{ width: 130 }}>Category</th>
                <th style={{ width: 65 }}>Risk</th>
                <th style={{ width: 45 }}>Params</th>
                <th>Planned Plugins</th>
              </tr>
            </thead>
            <tbody>
              {PLAN.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} style={{ cursor: "pointer", opacity: e.risk === "Ignored" ? 0.4 : 1, background: selected?.id === e.id ? "rgba(232,145,45,0.05)" : "transparent" }}>
                  <td><span className="pill" style={{ background: methodBg(e.method), color: methodColor(e.method), fontSize: 9 }}>{e.method}</span></td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg)" }}>{e.path}</td>
                  <td style={{ fontSize: 10.5, color: "var(--muted)" }}>{e.category}</td>
                  <td><span style={{ fontSize: 10.5, fontWeight: 700, color: riskColor(e.risk), background: riskBg(e.risk), padding: "2px 6px", borderRadius: 8 }}>{e.risk}</span></td>
                  <td style={{ color: "var(--muted)", textAlign: "center" }}>{e.params}</td>
                  <td style={{ fontSize: 10 }}>
                    {e.plugins.slice(0, 4).map(p => (
                      <span key={p} style={{ marginRight: 3, color: "var(--primary)", background: "rgba(232,145,45,0.08)", padding: "1px 5px", borderRadius: 8, display: "inline-block", marginBottom: 2 }}>{p}</span>
                    ))}
                    {e.plugins.length > 4 && <span style={{ color: "var(--muted)", fontSize: 9 }}>+{e.plugins.length - 4}</span>}
                    {e.plugins.length === 0 && <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ width: 300, flexShrink: 0, overflowY: "auto" }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span className="pill" style={{ background: methodBg(selected.method), color: methodColor(selected.method) }}>{selected.method}</span>
                <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--fg)", fontWeight: 600 }}>{selected.path}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: riskColor(selected.risk), background: riskBg(selected.risk), padding: "2px 7px", borderRadius: 8 }}>{selected.risk} Risk</span>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>{selected.category}</span>
              </div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Classification Reason</div>
              <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>{selected.reason}</p>

              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Planned Plugins ({selected.plugins.length})</div>
              {selected.plugins.map((p, i) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)", fontSize: 10, width: 16, textAlign: "right" }}>{i + 1}</span>
                  <Zap size={11} color="var(--primary)" />
                  <span style={{ fontSize: 12, color: "var(--fg)" }}>{p}</span>
                </div>
              ))}
              {selected.plugins.length === 0 && (
                <div style={{ padding: "8px 0", color: "var(--muted)", fontSize: 11.5 }}>No active testing — endpoint excluded from scan.</div>
              )}

              <div style={{ marginTop: 12, padding: 8, background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}>PIPELINE</div>
                {["Baseline request","Classify endpoint","Select plugins","Generate payloads","Execute tests","Verify findings","Score confidence"].map((s, i) => (
                  <div key={s} style={{ display: "flex", gap: 6, fontSize: 10.5, padding: "3px 0", color: "var(--muted)" }}>
                    <span style={{ color: "var(--primary)", width: 16 }}>{i + 1}.</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
