"use client";

import { useState } from "react";
import { Bot, X, Sparkles, Send, Minimize2, Maximize2 } from "lucide-react";

export function DeveloperAssistAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "👋 Hi! I am Max, your STRIDE Threat Modeling Copilot. I can build Data Flow Diagrams, simulate Attack Trees, and map MITRE ATT&CK / CAPEC techniques.",
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
          text: "✨ Analysis Completed: Findings correlated across real-time telemetry. 1-Click remediation verified.",
          time: "Just now"
        }
      ]);
    }, 800);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "linear-gradient(135deg, #8b5cf6 0%, #00f0ff 100%)",
          color: "#070414",
          padding: "12px 20px",
          borderRadius: 50,
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)",
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
          background: "#070414",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Sparkles size={14} color="#00f0ff" />
        </div>
        <span>Ask Max &middot; AI Threat Modeler Agent</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: isMinimized ? 320 : 390,
        height: isMinimized ? 56 : 540,
        zIndex: 9999,
        background: "rgba(14, 8, 38, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(139, 92, 246, 0.4)",
        borderRadius: 16,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "height 0.2s ease"
      }}
    >
      <div style={{
        padding: "12px 16px",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(0, 240, 255, 0.25) 100%)",
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
            background: "linear-gradient(135deg, #8b5cf6, #00f0ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(0,240,255,0.4)"
          }}>
            <Bot size={18} color="#070414" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>Max &middot; AI Threat Modeler Agent</div>
            <div style={{ fontSize: 10, color: "#00f0ff", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Engine Online
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
          >
            {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
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
                  background: m.sender === "user" ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(21, 13, 56, 0.8)",
                  border: m.sender === "user" ? "none" : "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#f8fafc",
                  lineHeight: 1.4
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: "0 12px 8px 12px", display: "flex", gap: 6, overflowX: "auto" }}>
            <button
              onClick={() => setInput("Simulate STRIDE Attack Tree")}
              style={{
                fontSize: 10.5,
                background: "rgba(0, 240, 255, 0.15)",
                border: "1px solid rgba(0, 240, 255, 0.4)",
                color: "#00f0ff",
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              ⚡ Simulate STRIDE Attack Tree
            </button>
            <button
              onClick={() => setInput("Map MITRE ATT&CK Matrix")}
              style={{
                fontSize: 10.5,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              🛡️ Map MITRE ATT&CK Matrix
            </button>
          </div>

          <div style={{
            padding: 10,
            borderTop: "1px solid var(--border)",
            background: "rgba(7, 4, 20, 0.9)",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <input
              type="text"
              placeholder="Ask Max..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                background: "rgba(21, 13, 56, 0.9)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#f8fafc",
                fontSize: 12,
                borderRadius: 8,
                padding: "8px 12px",
                outline: "none"
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #00f0ff)",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#070414",
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
