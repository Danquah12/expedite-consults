"use client";

import { useState } from "react";
import { Bot, X, Send, Minimize2, Maximize2, ShieldCheck } from "lucide-react";

export function DeveloperAssistAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "Desk Note Briefing: Ask me to verify BOLA/IDOR tenant boundaries, review JWT signature pinning, or generate a 6-point Proof Contract for an OpenAPI 3.1 endpoint.",
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
        "Proof-Driven Validation Summary: Endpoint `/api/v2/users/{id}` lacks a tenant-scoped predicate (`WHERE user.id = :id AND user.tenant_id = :jwt_tenant`). Differential replay between Tenant A (`user_1000`) and Tenant B (`user_1001`) returned HTTP 200 with 4 PII fields (`ssn_last4`, `salary`). Recommend enforcing middleware policy `requireOwnershipOrRole('ADMIN')`.";
      if (query.toLowerCase().includes("jwt")) {
        reply =
          "JWT Verification Check (API2:2023 / CWE-347): `jwt.verify(token, key)` is called without an explicit `algorithms: ['RS256']` allowlist, permitting `alg: none` bypass. Pin `algorithms: ['RS256']` and validate `iss` and `aud` claims.";
      } else if (query.toLowerCase().includes("openapi") || query.toLowerCase().includes("schema")) {
        reply =
          "OpenAPI 3.1 Contract Audit: 4 endpoints accept unvalidated request bodies (`additionalProperties: true`), enabling Mass Assignment (`API3:2023` / `CWE-915`) on `PUT /api/v2/users/{id}` (`is_admin`, `role`). Recommend strict DTO projection.";
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
        <span>Desk Note &middot; API Proof Copilot</span>
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
              Desk Note &middot; API Validation Copilot
            </div>
            <div
              className="text-[10px] flex items-center gap-1.5"
              style={{ color: "var(--muted)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--success)" }}
              />
              OWASP API Top 10:2023 &middot; Defensive Verifier
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
              { label: "Verify BOLA Matrix", prompt: "Verify BOLA authorization matrix on /api/v2/users/{id}" },
              { label: "Audit JWT Guard", prompt: "Check JWT algorithm pinning on /api/v2/admin/users" },
              { label: "OpenAPI Schema Check", prompt: "Audit OpenAPI 3.1 schema for mass assignment" },
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
              placeholder="Ask about BOLA, BFLA, JWT, OpenAPI..."
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
