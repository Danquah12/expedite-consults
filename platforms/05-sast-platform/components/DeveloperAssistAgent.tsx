"use client";

import { useState } from "react";
import { Bot, X, MessageSquare, Sparkles, Send, Mic, Volume2, ShieldCheck, CheckCircle2, ChevronRight, Minimize2, Maximize2 } from "lucide-react";

export function DeveloperAssistAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "👋 Hi! I am Max, your AI AppSec & Developer Assist Copilot. I can explain SAST taint flows, generate verified 1-click code fixes, or triage false positives in real-time.",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input, time: "Just now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: "agent",
          text: "🔍 Analysis Complete: I verified that the SQL Injection in 'checkoutController.ts:L42' is an unauthenticated taint flow from req.body.username. I generated a parameterized query fix that passes all AST checks.",
          time: "Just now"
        }
      ]);
    }, 800);
  };

  if (!isOpen) {
    return (
      <button
        className="no-print"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "#8b4528",
          color: "#f3eee4",
          padding: "12px 20px",
          borderRadius: 50,
          border: "1px solid rgba(236, 236, 239, 0.3)",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.02em"
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#f3eee4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Sparkles size={14} color="#8b4528" />
        </div>
        <span>Ask XTRIKE Copilot &middot; AI AppSec Agent</span>
      </button>
    );
  }

  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: isMinimized ? 320 : 390,
        height: isMinimized ? 56 : 540,
        zIndex: 9999,
        background: "#fbf8f3",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "height 0.2s ease"
      }}
    >
      <div style={{
        padding: "12px 16px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#8b4528",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "none"
          }}>
            <Bot size={18} color="#f3eee4" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1f1b18" }}>XTRIKE Copilot &middot; AI AppSec Agent</div>
            <div style={{ fontSize: 10, color: "#8b4528", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#46a36e", display: "inline-block" }} />
              XTRIKE Hybrid Triage Ready
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: "transparent", border: "none", color: "#5c5349", cursor: "pointer", padding: 4 }}
          >
            {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "transparent", border: "none", color: "#5c5349", cursor: "pointer", padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.sender === "user" ? "#8b4528" : "#ece5d8",
                  border: m.sender === "user" ? "none" : "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#1f1b18",
                  lineHeight: 1.4
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: "0 12px 8px 12px", display: "flex", gap: 6, overflowX: "auto" }}>
            <button
              onClick={() => setInput("Explain this taint flow in plain English")}
              style={{
                fontSize: 10.5,
                background: "#f4e5dc",
                border: "1px solid var(--border)",
                color: "#8b4528",
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              💬 Explain Taint Flow
            </button>
            <button
              onClick={() => setInput("Generate 1-Click Pull Request Fix")}
              style={{
                fontSize: 10.5,
                background: "#f4e5dc",
                border: "1px solid var(--border)",
                color: "#8b4528",
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              ⚡ 1-Click PR Fix
            </button>
          </div>

          <div style={{
            padding: 10,
            borderTop: "1px solid var(--border)",
            background: "#f3eee4",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <input
              type="text"
              placeholder="Ask Max about SAST findings, AI fixes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                background: "#ece5d8",
                border: "1px solid var(--border)",
                color: "#1f1b18",
                fontSize: 12,
                borderRadius: 8,
                padding: "8px 12px",
                outline: "none"
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "#8b4528",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#f3eee4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
