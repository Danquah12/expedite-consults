"use client";
import { useState } from "react";
import { SlidersHorizontal, Filter } from "lucide-react";
import { methodColor, methodBg } from "@/lib/utils";
import type { HttpMethod } from "@/types/dast";

type Location = "query" | "body-json" | "body-form" | "header" | "cookie" | "path" | "graphql" | "multipart";
type ParamType = "String" | "Integer" | "Boolean" | "Array" | "Object" | "File";
type Sensitivity = "Authorization" | "PII" | "Financial" | "Internal" | "Public";

interface Parameter {
  id:          string;
  name:        string;
  location:    Location;
  type:        ParamType;
  sensitivity: Sensitivity;
  endpoint:    string;
  method:      HttpMethod;
  sampleValue: string;
  tests:       string[];
}

const PARAMETERS: Parameter[] = [
  { id:"p1",  name:"id",            location:"query",     type:"Integer", sensitivity:"Authorization", endpoint:"/api/users",           method:"GET",   sampleValue:"1001",            tests:["BOLA/IDOR","Auth Bypass","Enumeration"] },
  { id:"p2",  name:"userId",        location:"body-json", type:"Integer", sensitivity:"Authorization", endpoint:"/api/orders",           method:"POST",  sampleValue:"42",              tests:["BOLA/IDOR","Mass Assignment"] },
  { id:"p3",  name:"email",         location:"body-json", type:"String",  sensitivity:"PII",           endpoint:"/api/auth/login",       method:"POST",  sampleValue:"user@acme.com",   tests:["SQLi","XSS","Enumeration"] },
  { id:"p4",  name:"password",      location:"body-json", type:"String",  sensitivity:"PII",           endpoint:"/api/auth/login",       method:"POST",  sampleValue:"{{SECRET}}",      tests:["Brute Force","Weak Password"] },
  { id:"p5",  name:"q",             location:"query",     type:"String",  sensitivity:"Public",        endpoint:"/api/products/search",  method:"GET",   sampleValue:"laptop",          tests:["SQLi","XSS","SSTI","Command Injection"] },
  { id:"p6",  name:"url",           location:"body-json", type:"String",  sensitivity:"Internal",      endpoint:"/api/webhooks/test",    method:"POST",  sampleValue:"https://...",     tests:["SSRF","Open Redirect","XXE"] },
  { id:"p7",  name:"displayName",   location:"body-json", type:"String",  sensitivity:"PII",           endpoint:"/api/profile/update",  method:"PUT",   sampleValue:"John Doe",        tests:["XSS","SSTI","SQLi"] },
  { id:"p8",  name:"filename",      location:"path",      type:"String",  sensitivity:"Internal",      endpoint:"/api/files/{filename}", method:"GET",   sampleValue:"report.pdf",      tests:["Path Traversal","LFI","SSRF"] },
  { id:"p9",  name:"role",          location:"body-json", type:"String",  sensitivity:"Authorization", endpoint:"/api/users/{id}",      method:"PUT",   sampleValue:"user",            tests:["Privilege Escalation","Mass Assignment"] },
  { id:"p10", name:"Authorization", location:"header",    type:"String",  sensitivity:"Authorization", endpoint:"*",                    method:"GET",   sampleValue:"Bearer eyJ…",     tests:["JWT Attacks","alg:none","Key Confusion"] },
  { id:"p11", name:"session",       location:"cookie",    type:"String",  sensitivity:"Authorization", endpoint:"*",                    method:"GET",   sampleValue:"sess_a1b2…",      tests:["Session Fixation","Predictability","CSRF"] },
  { id:"p12", name:"page",          location:"query",     type:"Integer", sensitivity:"Public",        endpoint:"/api/products",        method:"GET",   sampleValue:"1",               tests:["Enumeration","SQLi"] },
  { id:"p13", name:"upload",        location:"multipart", type:"File",    sensitivity:"Internal",      endpoint:"/api/files/upload",    method:"POST",  sampleValue:"file.pdf",        tests:["File Upload","SSRF","Path Traversal","Malware"] },
  { id:"p14", name:"query",         location:"graphql",   type:"Object",  sensitivity:"Public",        endpoint:"/graphql",            method:"POST",  sampleValue:"{users{id,role}}", tests:["GraphQL Introspection","Authorization","Injection"] },
];

const locColor: Record<Location, string> = { query:"var(--primary)", "body-json":"var(--green)", "body-form":"#80cbc4", header:"var(--yellow)", cookie:"#ce93d8", path:"#ffb74d", graphql:"#f48fb1", multipart:"var(--blue)" };
const sensColor: Record<Sensitivity, string> = { Authorization:"#ef5350", PII:"#ffb74d", Financial:"#ff8a65", Internal:"var(--yellow)", Public:"var(--muted)" };

export default function ParametersPage() {
  const [selected, setSelected] = useState<Parameter | null>(null);
  const [locFilter, setLocFilter] = useState("All");
  const [sensFilter, setSensFilter] = useState("All");

  const locations = ["All", "query", "body-json", "header", "cookie", "path", "graphql", "multipart"];
  const sensitivities = ["All", "Authorization", "PII", "Internal", "Public"];

  const visible = PARAMETERS.filter(p =>
    (locFilter === "All" || p.location === locFilter) &&
    (sensFilter === "All" || p.sensitivity === sensFilter)
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
        <SlidersHorizontal size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Parameter Analyzer</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{visible.length}/{PARAMETERS.length} parameters discovered</span>
        <Filter size={11} color="var(--muted)" style={{ marginLeft: 8 }} />
        {locations.map(l => (
          <button key={l} onClick={() => setLocFilter(l)} className="btn-secondary"
            style={locFilter === l ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 10, padding: "2px 7px" } : { fontSize: 10, padding: "2px 7px" }}>
            {l}
          </button>
        ))}
        <div style={{ width: 1, background: "var(--border)", height: 16 }} />
        {sensitivities.map(s => (
          <button key={s} onClick={() => setSensFilter(s)} className="btn-secondary"
            style={sensFilter === s ? { borderColor: sensColor[s as Sensitivity] ?? "var(--primary)", color: sensColor[s as Sensitivity] ?? "var(--primary)", fontSize: 10, padding: "2px 7px" } : { fontSize: 10, padding: "2px 7px" }}>
            {s}
          </button>
        ))}
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Table */}
        <div style={{ flex: 1, borderRight: selected ? "1px solid var(--border)" : "none", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th style={{ width: 90 }}>Location</th>
                <th style={{ width: 70 }}>Type</th>
                <th style={{ width: 90 }}>Sensitivity</th>
                <th style={{ width: 60 }}>Method</th>
                <th>Endpoint</th>
                <th>Applicable Tests</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id} onClick={() => setSelected(p === selected ? null : p)} style={{ cursor: "pointer", background: selected?.id === p.id ? "rgba(232,145,45,0.05)" : "transparent" }}>
                  <td style={{ fontFamily: "monospace", color: "var(--fg)", fontWeight: 600 }}>{p.name}</td>
                  <td><span style={{ fontSize: 9.5, fontWeight: 700, color: locColor[p.location], background: `${locColor[p.location]}12`, padding: "1px 6px", borderRadius: 8 }}>{p.location}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 11 }}>{p.type}</td>
                  <td><span style={{ fontSize: 10, fontWeight: 700, color: sensColor[p.sensitivity] }}>{p.sensitivity}</span></td>
                  <td><span className="pill" style={{ background: methodBg(p.method), color: methodColor(p.method), fontSize: 9 }}>{p.method}</span></td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{p.endpoint}</td>
                  <td style={{ fontSize: 10.5 }}>
                    {p.tests.slice(0, 3).map(t => (
                      <span key={t} style={{ marginRight: 4, color: "var(--primary)", background: "rgba(232,145,45,0.08)", padding: "1px 6px", borderRadius: 8, display: "inline-block", marginBottom: 2 }}>{t}</span>
                    ))}
                    {p.tests.length > 3 && <span style={{ fontSize: 9.5, color: "var(--muted)" }}>+{p.tests.length - 3}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 280, flexShrink: 0, padding: 12, overflowY: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "monospace", marginBottom: 8 }}>{selected.name}</div>
            {[
              { l: "Location",    v: selected.location,    c: locColor[selected.location] },
              { l: "Type",        v: selected.type,        c: "var(--muted)" },
              { l: "Sensitivity", v: selected.sensitivity, c: sensColor[selected.sensitivity] },
              { l: "Method",      v: selected.method,      c: methodColor(selected.method) },
              { l: "Endpoint",    v: selected.endpoint,    c: "var(--primary)" },
              { l: "Sample",      v: selected.sampleValue, c: "var(--yellow)" },
            ].map(m => (
              <div key={m.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
                <span style={{ color: "var(--muted)" }}>{m.l}</span>
                <span style={{ fontFamily: "monospace", color: m.c, fontWeight: 500, textAlign: "right", maxWidth: 160, wordBreak: "break-all" }}>{m.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>APPLICABLE TESTS ({selected.tests.length})</div>
              {selected.tests.map(t => (
                <div key={t} style={{ padding: "5px 8px", marginBottom: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, color: "var(--primary)" }}>⚡ {t}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
