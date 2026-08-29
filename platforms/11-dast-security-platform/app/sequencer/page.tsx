"use client";
import { useState, useEffect, useRef } from "react";
import { Shuffle, Play, RefreshCw } from "lucide-react";

const SAMPLE_TOKENS = [
  "sess_a1b2c3d4e5f60001", "sess_a1b2c3d4e5f60002", "sess_a1b2c3d4e5f60003",
  "sess_a1b2c3d4e5f60004", "sess_a1b2c3d4e5f60005", "sess_a1b2c3d4e5f60006",
  "sess_f9e8d7c6b5a40001", "sess_f9e8d7c6b5a40002", "sess_f9e8d7c6b5a40003",
  "sess_1234567890abcdef", "sess_fedcba0987654321", "sess_11111111deadbeef",
];

const JWT_SAMPLES = [
  "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIn0.sig1",
  "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJ1c2VyIn0.sig2",
  "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJhZG1pbiJ9.sig3",
];

function entropy(s: string): number {
  const freq: Record<string, number> = {};
  for (const c of s) freq[c] = (freq[c] ?? 0) + 1;
  return -Object.values(freq).reduce((a, v) => a + (v / s.length) * Math.log2(v / s.length), 0);
}

function charDistribution(tokens: string[]): { char: string; pct: number }[] {
  const all = tokens.join("");
  const freq: Record<string, number> = {};
  for (const c of all) freq[c] = (freq[c] ?? 0) + 1;
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,10).map(([char, count]) => ({
    char, pct: Math.round(count / all.length * 100),
  }));
}

export default function SequencerPage() {
  const [tokens, setTokens]     = useState(SAMPLE_TOKENS.join("\n"));
  const [mode,   setMode]       = useState<"session" | "jwt">("session");
  const [analysed, setAnalysed] = useState(false);
  const [running, setRunning]   = useState(false);

  const tokenList = tokens.split("\n").map(t => t.trim()).filter(Boolean);
  const entropies = tokenList.map(t => entropy(t));
  const avgEntropy = entropies.reduce((a, v) => a + v, 0) / (entropies.length || 1);
  const dist = charDistribution(tokenList);
  const minLen = Math.min(...tokenList.map(t => t.length));
  const maxLen = Math.max(...tokenList.map(t => t.length));
  const isFixed = minLen === maxLen;
  const pattern = tokenList.length > 1 ? (tokenList.every(t => t.startsWith(tokenList[0].slice(0, 10))) ? "PREDICTABLE PREFIX" : "RANDOMISED") : "—";

  const runAnalysis = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1200));
    setAnalysed(true); setRunning(false);
  };

  const verdict = avgEntropy > 4 ? "SUFFICIENT ENTROPY" : avgEntropy > 2.5 ? "LOW ENTROPY — REVIEW" : "WEAK — PREDICTABLE";
  const verdictColor = avgEntropy > 4 ? "var(--green)" : avgEntropy > 2.5 ? "var(--yellow)" : "#ef5350";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Shuffle size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Sequencer — Token &amp; Randomness Analyzer</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {(["session","jwt"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setTokens(m === "jwt" ? JWT_SAMPLES.join("\n") : SAMPLE_TOKENS.join("\n")); setAnalysed(false); }}
              className="btn-secondary" style={mode === m ? { borderColor: "var(--primary)", color: "var(--primary)", fontSize: 11 } : { fontSize: 11 }}>
              {m === "session" ? "Session IDs" : "JWT Tokens"}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-primary" onClick={runAnalysis} disabled={running || tokenList.length < 2}>
            {running ? <><RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} /> Analysing…</> : <><Play size={11} /> Analyse</>}
          </button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Token input */}
        <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div className="tool-panel-header" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            Sample Tokens (one per line)
          </div>
          <textarea className="http-editor" style={{ flex: 1 }} value={tokens} onChange={e => { setTokens(e.target.value); setAnalysed(false); }} spellCheck={false} />
          <div style={{ padding: "4px 10px", borderTop: "1px solid var(--border)", fontSize: 10.5, color: "var(--muted)" }}>
            {tokenList.length} tokens · {minLen}–{maxLen} chars
          </div>
        </div>

        {/* Analysis results */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!analysed ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontSize: 12, gap: 8 }}>
              <Shuffle size={28} color="var(--muted)" />
              <span>Paste tokens and click Analyse</span>
              <span style={{ fontSize: 11, color: "rgba(100,116,139,0.6)" }}>Supports session IDs, JWTs, CSRF tokens, API keys, password reset tokens</span>
            </div>
          ) : (
            <div style={{ padding: 14 }}>
              {/* Verdict */}
              <div style={{ padding: "12px 16px", borderRadius: 8, background: `${verdictColor}10`, border: `1px solid ${verdictColor}35`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>Analysis Verdict</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: verdictColor }}>{verdict}</div>
              </div>

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Avg Entropy",     value: avgEntropy.toFixed(2), unit: "bits",  color: verdictColor },
                  { label: "Token Length",     value: isFixed ? minLen.toString() : `${minLen}–${maxLen}`, unit: "chars", color: "var(--primary)" },
                  { label: "Pattern",          value: pattern,               unit: "",       color: pattern === "RANDOMISED" ? "var(--green)" : "#ef5350" },
                ].map(m => (
                  <div key={m.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{m.label} {m.unit && `(${m.unit})`}</div>
                  </div>
                ))}
              </div>

              {/* Per-token entropy */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>Per-Token Entropy</div>
                {tokenList.map((t, i) => {
                  const e = entropies[i];
                  const pct = Math.min(100, (e / 6) * 100);
                  const c = e > 4 ? "var(--green)" : e > 2.5 ? "var(--yellow)" : "#ef5350";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
                      <div style={{ width: 80, height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, color: c, width: 30, textAlign: "right", fontFamily: "monospace" }}>{e.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Char distribution */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>Character Distribution (Top 10)</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {dist.map(d => (
                    <div key={d.char} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{d.char}</div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{d.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
