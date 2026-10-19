"use client";

import { useState } from "react";
import { Bot, X, Send, Minimize2, Maximize2, ShieldCheck } from "lucide-react";

export function DeveloperAssistAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "XTRIKE Desk Note Briefing: Ask me to audit STRIDE trust boundaries, simulate multi-stage attack trees, or map DFD components to MITRE ATT&CK and CAPEC controls.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const query = input.trim();
    const userMsg = { sender: "user", text: query, time: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      let reply =
        "STRIDE Boundary Verification: Trust boundary between `Public API Gateway` and `Customer_PII_DB` exhibits 2 unmitigated findings: (1) Information Disclosure (`I-2`, wildcard CORS + missing mTLS), and (2) Tampering (`T-2`, unencrypted local config keys). Recommend enforcing Envoy mTLS sidecar + KMS customer-managed keys.";
      if (query.toLowerCase().includes("attack") || query.toLowerCase().includes("tree")) {
        reply =
          "Attack Tree Choke-Point Analysis: Shortest adversary path `Client Portal -> API Gateway (BOLA/SQLi) -> Auth Service (JWT) -> PostgreSQL DB` has an estimated attacker time of 45m. Enforcing parameterized queries (`T-1`) and KMS MFA conditions breaks all 3 downstream branches.";
      } else if (query.toLowerCase().includes("mitre") || query.toLowerCase().includes("capec")) {
        reply =
          "MITRE ATT&CK / CAPEC Alignment: Mapped `CAPEC-66` (SQL Injection) and `T1190` (Exploit Public-Facing Application) to NIST SP 800-53 Rev. 5 controls `SI-10`, `AC-3`, and `SC-8`.";
      }
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: reply,
          time: "Just now",
        },
      ]);
    }, 450);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold shadow-md transition-colors cursor-pointer"
        style={{
          background: "var(--accent)",
          color: "#fbf8f3",
          border: "1px solid #72361d",
        }}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>XTRIKE Desk Note &middot; STRIDE Copilot</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-xl shadow-xl transition-all"
      style={{
        width: isMinimized ? 300 : 380,
        height: isMinimized ? 52 : 480,
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              color: "#fbf8f3",
            }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div
              className="text-xs font-bold font-editorial"
              style={{ color: "var(--foreground)" }}
            >
              XTRIKE Desk Note &middot; STRIDE Copilot
            </div>
            <div
              className="text-[10px] flex items-center gap-1.5"
              style={{ color: "var(--muted)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--success)" }}
              />
              STRIDE &middot; DFD v4.2 &middot; MITRE ATT&amp;CK
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[88%]"
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  background:
                    m.sender === "user" ? "var(--accent)" : "var(--surface-2)",
                  color: m.sender === "user" ? "#fbf8f3" : "var(--foreground)",
                  border:
                    m.sender === "user" ? "none" : "1px solid var(--border)",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
            {[
              { label: "Simulate Attack Tree", prompt: "Simulate multi-stage attack tree choke-points" },
              { label: "Audit STRIDE Boundaries", prompt: "Verify STRIDE trust boundaries on API Gateway" },
              { label: "Map MITRE & CAPEC", prompt: "Map DFD findings to MITRE ATT&CK and CAPEC" },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => setInput(chip.prompt)}
                className="text-[11px] px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div
            className="p-2.5 border-t flex items-center gap-2"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}
          >
            <input
              type="text"
              placeholder="Ask about STRIDE, DFD, Attack Trees, CAPEC..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "#fbf8f3",
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
