"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Check,
  Copy,
  Loader2,
  Maximize2,
  Minimize2,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  Trash2,
} from "lucide-react";
import { loadActiveScanSession } from "@/lib/live-sast-scanner";

export function openAskNoctisPopup(initialQuestion?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-ask-noctis", {
        detail: { question: initialQuestion || "" },
      })
    );
  }
}

const QUICK_PROMPTS = [
  "Summarize current scan findings",
  "What SAST apps, modules & engines are in this platform?",
  "Inspect F-001 (CWE-89 SQL Injection) & remediation diff",
  "Inspect PLG-046 vs PLG-054 (CWE-94 Code Injection)",
  "List SAST & DAST benchmark repositories",
];

const ASSET_PRESETS = [
  { label: "Finding F-001 (SQLi)", query: "Inspect finding F-001 and show taint trace and Java/Python/Node remediation" },
  { label: "Finding F-002 (Command Inj)", query: "Inspect finding F-002 and show taint trace and remediation" },
  { label: "Finding F-003 (SSRF)", query: "Inspect finding F-003 and show SSRF remediation" },
  { label: "Plugin PLG-046 (Python exec)", query: "Inspect PLG-046 Python exec/compile rule and fix" },
  { label: "Plugin PLG-054 (JavaCompiler)", query: "Inspect PLG-054 JavaCompiler BlindScript.java rule and fix" },
  { label: "All SAST Apps & Modules", query: "What apps, modules, engines, and resources are in XTRIKE SAST?" },
];

export function DeveloperAssistAgent() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assetsSummary, setAssetsSummary] = useState({
    plugins: 401,
    findings: 27,
    benchmarks: 58,
    modules: 11,
  });
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
    {
      role: "assistant",
      text: "Hello! I am **Noctis**, running directly inside your **XTRIKE SAST Platform** pop-up via the Noctis API (`/api/noctis`).\n\nI have full access to all **XTRIKE SAST assets, apps, and resources**:\n• **401 SAST Plugins** (`PLG-001`–`PLG-401`)\n• **All Workspace & Live Scan Findings** (`F-001`–`F-027` + active scan session)\n• **Integrated SAST & DAST Benchmark Repositories**\n• **All 11 SAST Platform Apps & Engines** (Proof Engine, Taint Graph, Fusion, AI-BOM, MCP, Reports)\n\nAsk me any question below and I will fetch the answer right into this pop-up without leaving your current screen.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const sendQuestion = useCallback(
    async (questionText: string) => {
      const trimmed = questionText.trim();
      if (!trimmed || loading) return;

      setMessages((prev) => {
        const nextMessages: { role: "assistant" | "user"; text: string }[] = [
          ...prev,
          { role: "user", text: trimmed },
        ];

        // Trigger async fetch using nextMessages
        (async () => {
          setLoading(true);
          try {
            let scanRepoName: string | undefined;
            let findings: unknown[] | undefined;
            if (typeof window !== "undefined") {
              const activeSession = loadActiveScanSession();
              if (activeSession) {
                scanRepoName = activeSession.repoUrl;
                if (Array.isArray(activeSession.sastFindings) && activeSession.sastFindings.length > 0) {
                  findings = activeSession.sastFindings.slice(0, 35);
                }
              }
            }

            const res = await fetch("/api/noctis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: trimmed,
                turns: nextMessages.map((m) => ({ role: m.role, content: m.text })),
                scanRepoName,
                findings,
              }),
            });

            const data = await res.json();
            if (data?.assetsSynced) {
              setAssetsSummary(data.assetsSynced);
            }
            const replyText =
              data?.answer ||
              data?.error ||
              "Noctis processed your SAST query.";

            setMessages((curr) => [...curr, { role: "assistant", text: replyText }]);
          } catch {
            setMessages((curr) => [
              ...curr,
              {
                role: "assistant",
                text: "Noctis API encountered a temporary connection issue. Please try your question again.",
              },
            ]);
          } finally {
            setLoading(false);
          }
        })();

        return nextMessages;
      });

      setPrompt("");
    },
    [loading]
  );

  // Listen for global "open-ask-noctis" events from Navbar, Finding cards, etc.
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ question?: string }>;
      setOpen(true);
      const q = custom.detail?.question?.trim();
      if (q) {
        sendQuestion(q);
      }
    };
    window.addEventListener("open-ask-noctis", handler);
    return () => window.removeEventListener("open-ask-noctis", handler);
  }, [sendQuestion]);

  const handleCopy = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.text || "";
    navigator.clipboard.writeText(lastAssistant);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared. Ask **Noctis** about any finding (`F-001`–`F-027`), plugin (`PLG-001`–`PLG-401`), CWE, taint flow, benchmark repository, or SAST module!",
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (Always accessible in bottom-right) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 90,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 22px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #b86b35, #8b4528)",
          color: "#f3eee4",
          border: "1px solid #72361d",
          fontWeight: 900,
          fontSize: 13.5,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(139, 69, 40, 0.38)",
        }}
      >
        <Sparkles size={16} />
        <span>Ask Noctis</span>
      </button>

      {/* Backdrop when expanded into centered modal pop-up */}
      {open && expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(31, 27, 24, 0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 99,
          }}
        />
      )}

      {/* In-App Ask Noctis Pop-up Modal (Never transitions away from the SAST app) */}
      {open && (
        <div
          role="dialog"
          aria-label="Ask Noctis SAST Pop-up"
          style={
            expanded
              ? {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "min(920px, calc(100vw - 32px))",
                  height: "min(760px, calc(100vh - 48px))",
                  background: "#fbf8f3",
                  border: "1px solid var(--border)",
                  borderRadius: 18,
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 28px 70px rgba(31, 27, 24, 0.35)",
                  overflow: "hidden",
                }
              : {
                  position: "fixed",
                  bottom: 84,
                  right: 24,
                  width: 500,
                  maxWidth: "calc(100vw - 32px)",
                  height: 640,
                  maxHeight: "calc(100vh - 110px)",
                  background: "#fbf8f3",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 20px 55px rgba(31, 27, 24, 0.26)",
                  overflow: "hidden",
                }
          }
        >
          {/* Pop-up Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "#ece5d8",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#8b4528",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fbf8f3",
                }}
              >
                <Bot size={19} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 900, color: "#1f1b18" }}>
                    Ask Noctis
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#8b4528",
                      background: "#f4e5dc",
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                    }}
                  >
                    IN-APP API POP-UP
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#2e6f40", fontWeight: 700, marginTop: 1 }}>
                  ● Connected to Noctis API &middot; All XTRIKE SAST Assets Synced
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation"
                style={{
                  background: "#fbf8f3",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                  padding: "5px 7px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                title={expanded ? "Dock pop-up to corner" : "Expand pop-up modal"}
                style={{
                  background: "#fbf8f3",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                  padding: "5px 7px",
                  color: "#1f1b18",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close Ask Noctis pop-up"
                style={{
                  background: "#fbf8f3",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                  padding: "5px 7px",
                  color: "#1f1b18",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Synced SAST Assets & Resources Telemetry Bar */}
          <div
            style={{
              padding: "8px 14px",
              background: "#f4e5dc",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 10.5,
              fontWeight: 800,
              color: "#6e3820",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Cpu size={12} /> {assetsSummary.plugins} Plugins
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={12} /> {assetsSummary.findings} Findings
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Database size={12} /> {assetsSummary.benchmarks} Benchmark Repos
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Layers size={12} /> {assetsSummary.modules} SAST Modules
              </span>
            </div>
            <span style={{ fontSize: 10, color: "#8b4528" }}>Zero-Transition API Mode</span>
          </div>

          {/* SAST Asset Quick-Inspector Bar */}
          <div
            style={{
              padding: "7px 12px",
              background: "#f5efe4",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {ASSET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => sendQuestion(preset.query)}
                disabled={loading}
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "4px 9px",
                  borderRadius: 6,
                  background: "#ece5d8",
                  border: "1px solid var(--border)",
                  color: "#8b4528",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Quick Prompt Pills */}
          <div
            style={{
              padding: "7px 12px",
              background: "#fbf8f3",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendQuestion(q)}
                disabled={loading}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#f3eee4",
                  border: "1px solid var(--border)",
                  color: "#5c4a3e",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Conversation Messages Stream */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#8b4528" : "#ece5d8",
                  border: "1px solid var(--border)",
                  color: m.role === "user" ? "#fbf8f3" : "#1f1b18",
                  fontSize: 12.5,
                  lineHeight: 1.58,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#ece5d8",
                  border: "1px solid var(--border)",
                  color: "#8b4528",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Loader2 size={14} className="animate-spin" />
                <span>Noctis API is fetching SAST repository &amp; finding analysis...</span>
              </div>
            )}

            {/* Footer Copy Utility */}
            <div
              style={{
                background: "#f3eee4",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "8px 12px",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8b4528" }}>
                NOCTIS API &middot; XTRIKE SAST FULL ASSET CONTEXT
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#ece5d8",
                  border: "1px solid var(--border)",
                  color: "#1f1b18",
                  padding: "3px 9px",
                  borderRadius: 5,
                  fontSize: 10.5,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? "Copied Answer" : "Copy Latest Answer"}</span>
              </button>
            </div>
          </div>

          {/* Question Input Box */}
          <div
            style={{
              padding: 12,
              background: "#ece5d8",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion(prompt)}
              placeholder="Ask Noctis anything about XTRIKE SAST, findings (F-001..), plugins (PLG-001..), or fixes..."
              style={{
                flex: 1,
                background: "#fbf8f3",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 12px",
                color: "#1f1b18",
                fontSize: 12.5,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => sendQuestion(prompt)}
              disabled={loading}
              style={{
                background: "#8b4528",
                color: "#f3eee4",
                border: "none",
                borderRadius: 8,
                padding: "0 16px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontWeight: 800,
                fontSize: 12,
              }}
              aria-label="Send question to Noctis"
            >
              <Send size={14} />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DeveloperAssistAgent;
