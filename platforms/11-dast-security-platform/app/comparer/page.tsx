"use client";
import { useState } from "react";
import { Diff } from "lucide-react";

type DiffMode = "raw" | "word" | "header" | "json";

const SAMPLE_A = `HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: req-abc123
Cache-Control: no-store

{"id":1001,"name":"John Doe","email":"john@acme.com","role":"user","account_balance":8420.00}`;

const SAMPLE_B = `HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: req-def456
Cache-Control: no-store

{"id":1001,"name":"John Doe","email":"john@acme.com","role":"admin","account_balance":8420.00,"password_hash":"$2a$10$rBhvQty..."}`;

function diffLines(a: string, b: string): { text: string; status: "same" | "add" | "remove" }[] {
  const la = a.split("\n"), lb = b.split("\n");
  const max = Math.max(la.length, lb.length);
  const result = [];
  for (let i = 0; i < max; i++) {
    const l = la[i], r = lb[i];
    if (l === r) result.push({ text: l ?? "", status: "same" as const });
    else {
      if (l !== undefined) result.push({ text: `- ${l}`, status: "remove" as const });
      if (r !== undefined) result.push({ text: `+ ${r}`, status: "add" as const });
    }
  }
  return result;
}

function wordDiff(a: string, b: string): string {
  const wa = a.split(/(\s+)/), wb = b.split(/(\s+)/);
  const max = Math.max(wa.length, wb.length);
  let out = "";
  for (let i = 0; i < max; i++) {
    if (wa[i] === wb[i]) out += wa[i] ?? "";
    else {
      if (wa[i] !== undefined) out += `[−${wa[i]}]`;
      if (wb[i] !== undefined) out += `[+${wb[i]}]`;
    }
  }
  return out;
}

function jsonDiff(a: string, b: string): { key: string; va: string; vb: string; same: boolean }[] {
  try {
    const bodyA = JSON.parse(a.split("\n\n").slice(1).join("\n\n"));
    const bodyB = JSON.parse(b.split("\n\n").slice(1).join("\n\n"));
    const keys = new Set([...Object.keys(bodyA), ...Object.keys(bodyB)]);
    return Array.from(keys).map(k => ({
      key: k,
      va: JSON.stringify(bodyA[k] ?? "—"),
      vb: JSON.stringify(bodyB[k] ?? "—"),
      same: JSON.stringify(bodyA[k]) === JSON.stringify(bodyB[k]),
    }));
  } catch { return []; }
}

function headerDiff(a: string, b: string) {
  const parseHeaders = (s: string) => {
    const [, ...lines] = s.split("\n\n")[0].split("\n");
    return Object.fromEntries(lines.map(l => { const [k, ...v] = l.split(": "); return [k, v.join(": ")]; }).filter(([k]) => k));
  };
  const ha = parseHeaders(a), hb = parseHeaders(b);
  const keys = new Set([...Object.keys(ha), ...Object.keys(hb)]);
  return Array.from(keys).map(k => ({ key: k, va: ha[k] ?? "—", vb: hb[k] ?? "—", same: ha[k] === hb[k] }));
}

export default function ComparerPage() {
  const [left,  setLeft]  = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);
  const [mode,  setMode]  = useState<DiffMode>("raw");
  const [labelA, setLabelA] = useState("Baseline — User 1000 Token");
  const [labelB, setLabelB] = useState("Attack — User 1001 Token (IDOR)");

  const diff  = diffLines(left, right);
  const added = diff.filter(d => d.status === "add").length;
  const removed = diff.filter(d => d.status === "remove").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Diff size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Comparer</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {(["raw","word","header","json"] as DiffMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} className="btn-secondary"
              style={mode === m ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 11 } : { fontSize: 11 }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11 }}>
          <span style={{ color: "var(--green)" }}>+{added}</span>
          <span style={{ color: "var(--muted)", margin: "0 4px" }}>/</span>
          <span style={{ color: "#ef5350" }}>-{removed}</span>
          <span style={{ color: "var(--muted)", marginLeft: 8 }}>lines changed</span>
        </div>
      </div>

      {/* Editor row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {[
          { val: left,  setVal: setLeft,  label: labelA, setLabel: setLabelA },
          { val: right, setVal: setRight, label: labelB, setLabel: setLabelB },
        ].map((p, i) => (
          <div key={i} style={{ borderRight: i === 0 ? "1px solid var(--border)" : "none" }}>
            <div style={{ padding: "4px 8px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "#ef5350" : "var(--green)", flexShrink: 0 }} />
              <input className="kv-input" value={p.label} onChange={e => p.setLabel(e.target.value)} style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)" }} />
            </div>
            <textarea className="http-editor" value={p.val} onChange={e => p.setVal(e.target.value)} style={{ height: 160, display: "block" }} spellCheck={false} />
          </div>
        ))}
      </div>

      {/* Diff output */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {mode === "raw" && (
          <div style={{ fontFamily: "monospace", fontSize: 11.5 }}>
            {diff.map((d, i) => (
              <div key={i} style={{
                padding: "1px 12px", lineHeight: 1.6,
                background: d.status === "add" ? "rgba(52,199,89,0.07)" : d.status === "remove" ? "rgba(255,59,48,0.07)" : "transparent",
                color: d.status === "add" ? "#a5d6a7" : d.status === "remove" ? "#ef9a9a" : "var(--muted)",
                borderLeft: `3px solid ${d.status === "add" ? "#3ddc84" : d.status === "remove" ? "#ef5350" : "transparent"}`,
              }}>{d.text}</div>
            ))}
          </div>
        )}
        {mode === "word" && (
          <div className="http-raw" style={{ padding: "12px 14px" }}>
            {wordDiff(left, right).split(/(\[[-+][^\]]+\])/g).map((chunk, i) => (
              <span key={i} style={{
                color: chunk.startsWith("[+") ? "#a5d6a7" : chunk.startsWith("[-") ? "#ef9a9a" : "var(--muted)",
                background: chunk.startsWith("[+") ? "rgba(52,199,89,0.1)" : chunk.startsWith("[-") ? "rgba(255,59,48,0.1)" : "transparent",
                borderRadius: 2,
              }}>{chunk}</span>
            ))}
          </div>
        )}
        {mode === "header" && (
          <table className="data-table">
            <thead><tr><th>Header</th><th style={{ color: "#ef5350" }}>Baseline</th><th style={{ color: "var(--green)" }}>Attack</th></tr></thead>
            <tbody>
              {headerDiff(left, right).map((r, i) => (
                <tr key={i} style={{ background: !r.same ? "rgba(255,59,48,0.05)" : "transparent" }}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)" }}>{r.key}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: r.same ? "var(--muted)" : "#ef9a9a" }}>{r.va}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: r.same ? "var(--muted)" : "#a5d6a7" }}>{r.vb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {mode === "json" && (
          <table className="data-table">
            <thead><tr><th>Field</th><th style={{ color: "#ef5350" }}>Baseline</th><th style={{ color: "var(--green)" }}>Attack</th><th style={{ width: 60 }}>Δ</th></tr></thead>
            <tbody>
              {jsonDiff(left, right).map((r, i) => (
                <tr key={i} style={{ background: !r.same ? "rgba(255,59,48,0.05)" : "transparent" }}>
                  <td style={{ fontFamily: "monospace", color: "var(--primary)" }}>{r.key}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: r.same ? "var(--muted)" : "#ef9a9a" }}>{r.va}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: r.same ? "var(--muted)" : "#a5d6a7" }}>{r.vb}</td>
                  <td style={{ textAlign: "center" }}>{!r.same && <span style={{ color: "#ffb74d", fontWeight: 700, fontSize: 11 }}>DIFF</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
