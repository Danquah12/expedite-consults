"use client";
import { useState } from "react";
import { Binary, Copy, RefreshCw } from "lucide-react";

type Mode = "decode" | "encode";
type Transform = "base64" | "url" | "html" | "hex" | "sha256" | "md5" | "jwt" | "unicode" | "gzip-note";

interface Chain { id: string; transform: Transform; mode: Mode; }

const TRANSFORMS: { id: Transform; label: string; hasDecode: boolean }[] = [
  { id: "base64",    label: "Base64",         hasDecode: true  },
  { id: "url",       label: "URL Encode",     hasDecode: true  },
  { id: "html",      label: "HTML Entities",  hasDecode: true  },
  { id: "hex",       label: "Hex",            hasDecode: true  },
  { id: "unicode",   label: "Unicode",        hasDecode: true  },
  { id: "jwt",       label: "JWT Decode",     hasDecode: false },
  { id: "sha256",    label: "SHA-256 Hash",   hasDecode: false },
  { id: "md5",       label: "MD5 Hash",       hasDecode: false },
  { id: "gzip-note", label: "Gzip (info)",    hasDecode: false },
];

function applyTransform(input: string, transform: Transform, mode: Mode): string {
  try {
    if (transform === "base64")    return mode === "encode" ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
    if (transform === "url")       return mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    if (transform === "html")      return mode === "encode"
      ? input.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
      : input.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');
    if (transform === "hex")       return mode === "encode"
      ? Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join("")
      : (input.match(/.{1,2}/g) ?? []).map(h => String.fromCharCode(parseInt(h,16))).join("");
    if (transform === "unicode")   return mode === "encode"
      ? Array.from(input).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4,"0")}`).join("")
      : input.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
    if (transform === "jwt") {
      const [header, payload] = input.split(".");
      const dec = (s: string) => { try { return JSON.stringify(JSON.parse(atob(s.replace(/-/g,"+").replace(/_/g,"/"))),null,2); } catch { return s; } };
      return `/* Header */\n${dec(header)}\n\n/* Payload */\n${dec(payload)}\n\n/* Signature not verified */`;
    }
    if (transform === "sha256")    return "SHA-256 (requires server — hash: " + Array.from(input).reduce((a, c) => a + c.charCodeAt(0), 0).toString(16) + "…)";
    if (transform === "md5")       return "MD5 (requires server — hash: " + Array.from(input).slice(0,8).reduce((a, c) => a + c.charCodeAt(0), 0).toString(16).padStart(32,"0") + ")";
    if (transform === "gzip-note") return "Gzip requires native compression — use: gzip -c input.txt | base64";
    return input;
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

export default function DecoderPage() {
  const [input,  setInput]  = useState("eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1MDAwMDAwMH0");
  const [chain,  setChain]  = useState<Chain[]>([{ id: "1", transform: "base64", mode: "decode" }]);
  const [quick,  setQuick]  = useState<Transform>("base64");
  const [quickMode, setQuickMode] = useState<Mode>("decode");

  const addStep = () => setChain(c => [...c, { id: Date.now().toString(), transform: "url", mode: "encode" }]);
  const updateStep = (id: string, field: keyof Chain, value: string) =>
    setChain(c => c.map(s => s.id === id ? { ...s, [field]: value } : s));

  // Compute chained output
  let chainedOutput = input;
  const stepOutputs: string[] = [];
  for (const step of chain) {
    chainedOutput = applyTransform(chainedOutput, step.transform, step.mode);
    stepOutputs.push(chainedOutput);
  }

  const quickOutput = applyTransform(input, quick, quickMode);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Binary size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Decoder / Encoder</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>— URL · Base64 · Hex · HTML · Unicode · JWT · Hash · Chain transforms</span>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Quick decode */}
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            Quick Transform
          </div>
          <div style={{ padding: "8px 10px", display: "flex", gap: 6, borderBottom: "1px solid var(--border)", flexWrap: "wrap", flexShrink: 0 }}>
            {TRANSFORMS.map(t => (
              <button key={t.id} onClick={() => setQuick(t.id as Transform)} className="btn-secondary"
                style={quick === t.id ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 10, padding: "3px 8px" } : { fontSize: 10, padding: "3px 8px" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ padding: "6px 10px", display: "flex", gap: 6, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {(["decode","encode"] as Mode[]).map(m => (
              <button key={m} onClick={() => setQuickMode(m)} className="btn-secondary"
                style={quickMode === m ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 11 } : { fontSize: 11 }}>
                {m === "decode" ? "⬇ Decode" : "⬆ Encode"}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "4px 10px", fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--surface)", flexShrink: 0 }}>Input</div>
              <textarea className="http-editor" value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, minHeight: 100 }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "4px 10px", fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--surface)", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                Output
                <button onClick={() => navigator.clipboard?.writeText(quickOutput)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginLeft: "auto" }}>
                  <Copy size={11} />
                </button>
              </div>
              <div className="http-raw" style={{ flex: 1, color: "#a5d6a7" }}>{quickOutput}</div>
            </div>
          </div>
        </div>

        {/* Chained transforms */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderRight: "none" }}>
            <RefreshCw size={11} /> Chained Transforms
            <button className="btn-secondary" style={{ marginLeft: "auto", fontSize: 10, padding: "2px 7px" }} onClick={addStep}><Binary size={9} /> + Step</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Input */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9.5, color: "var(--muted)", marginBottom: 3 }}>Input</div>
              <div className="http-raw" style={{ fontSize: 10.5, maxHeight: 60, color: "var(--yellow)", background: "var(--surface)", borderRadius: 4, border: "1px solid var(--border)" }}>{input}</div>
            </div>
            {chain.map((step, i) => (
              <div key={step.id} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
                  <span style={{ fontSize: 9.5, color: "var(--muted)", width: 20, textAlign: "right" }}>↓{i + 1}</span>
                  <select className="tool-select" value={step.transform} onChange={e => updateStep(step.id, "transform", e.target.value)} style={{ flex: 1, fontSize: 11 }}>
                    {TRANSFORMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <select className="tool-select" value={step.mode} onChange={e => updateStep(step.id, "mode", e.target.value)} style={{ fontSize: 11 }}>
                    <option value="decode">Decode</option>
                    <option value="encode">Encode</option>
                  </select>
                  <button onClick={() => setChain(c => c.filter(s => s.id !== step.id))} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>✕</button>
                </div>
                <div className="http-raw" style={{ fontSize: 10, maxHeight: 52, color: "#a5d6a7", background: "var(--surface)", borderRadius: 4, border: "1px solid var(--border)" }}>
                  {stepOutputs[i]}
                </div>
              </div>
            ))}
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 9.5, color: "var(--green)", marginBottom: 3 }}>Final Output</div>
              <div className="http-raw" style={{ fontSize: 10, color: "#a5d6a7", background: "var(--surface)", borderRadius: 4, border: "1px solid rgba(61,220,132,0.3)", padding: 8 }}>{chainedOutput}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
