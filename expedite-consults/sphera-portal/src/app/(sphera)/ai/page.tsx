"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Terminal,
  Code2,
  Search,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  SlidersHorizontal,
  CornerDownLeft,
  Flame,
  Hash,
  FileText,
  Lightbulb,
  Loader2,
} from "lucide-react";
import type { AiGenerationResponse, AiTaskType } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  meta?: {
    model: string;
    latency: string;
  };
}

const initialConversation: Message[] = [
  {
    id: "m0",
    role: "assistant",
    content: "Welcome to the **Sphera AI Co-Pilot & Studio**.\n\nI am directly integrated with the **Decentralized Social Graph**, your **Verified Skill Passport (TS/SCI Poly)**, and the **Reels & Bazaar Engines**.\n\nAsk any question below or switch to the **Hook & Caption Studio** to generate viral hooks for your next Reel.",
    timestamp: "10:00 AM",
    meta: {
      model: "Gemini 2.5 Pro Ultra",
      latency: "18ms",
    },
  },
];

const samplePrompts = [
  { label: "TS/SCI Defense Bounties", prompt: "Scan and match my skill passport with all active TS/SCI defense bounties over $180k." },
  { label: "Viral Reel Script", prompt: "Write a 30-second high-retention vertical Reel script about building full-stack AI apps." },
  { label: "Local Bazaar Deals", prompt: "Find all MacBook Pro M3 listings within 5 miles under $1,200 and check seller trust scores." },
  { label: "Campus AI Founders", prompt: "Find all University of Maryland alumni in the DMV area working on Autonomous AI Agents." },
];

export default function AiPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "studio">("chat");

  // Chat State
  const [messages, setMessages] = useState<Message[]>(initialConversation);
  const [chatInput, setChatInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Pro Ultra");

  // Studio State
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioTask, setStudioTask] = useState<AiTaskType>("HOOKS");
  const [studioResult, setStudioResult] = useState<AiGenerationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, task: "REASONING", model: selectedModel }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as AiGenerationResponse;
    },
    onSuccess: (data) => {
      const botMsg: Message = {
        id: `b_${Date.now()}`,
        role: "assistant",
        content: data.result,
        timestamp: "Just now",
        meta: {
          model: data.model,
          latency: `${data.latencyMs}ms`,
        },
      };
      setMessages((prev) => [...prev, botMsg]);
    },
  });

  const studioMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: studioPrompt, task: studioTask, model: selectedModel }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as AiGenerationResponse;
    },
    onSuccess: (data) => {
      setStudioResult(data);
    },
  });

  const handleSendChat = (text?: string) => {
    const promptToSend = text || chatInput.trim();
    if (!promptToSend || chatMutation.isPending) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    chatMutation.mutate(promptToSend);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] max-h-[860px] rounded-3xl overflow-hidden bg-[#10121a] border border-[#1c202e] flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[#1c202e] flex items-center justify-between bg-[#0d0f17] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#6366f1] flex items-center justify-center text-[#08090d] shadow-[0_0_15px_rgba(0,212,255,0.3)]">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Sphera AI Intelligence Core</h2>
              <span className="text-[10px] font-black text-[#00d4ff] bg-[#00d4ff]/15 px-2 py-0.5 rounded-md border border-[#00d4ff]/30">
                PRO ULTRA
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">Multi-model reasoning agent & creator studio</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#161924] p-1 rounded-xl border border-[#1c202e]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-[#00d4ff] text-[#08090d] shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              Co-Pilot Chat
            </button>
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "studio"
                  ? "bg-[#00d4ff] text-[#08090d] shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <Sparkles size={12} />
              Hook & Caption Studio
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#161924] border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer"
          >
            <option>Gemini 2.5 Pro Ultra</option>
            <option>Claude 3.7 Sonnet Thinking</option>
            <option>DeepSeek R1 Distill</option>
            <option>GPT-4.5 Omni Realtime</option>
          </select>
        </div>
      </div>

      {/* ── Tab 1: Co-Pilot Chat Viewport ─────────────────────────── */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 items-start p-4 rounded-2xl ${
                  m.role === "assistant"
                    ? "bg-[#161924] border border-[#1c202e]"
                    : "bg-transparent"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    m.role === "assistant"
                      ? "bg-[#00d4ff] text-[#08090d]"
                      : "bg-[#334155] text-white"
                  }`}
                >
                  {m.role === "assistant" ? "AI" : "YOU"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">
                      {m.role === "assistant" ? "Sphera AI Agent" : "You"}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                      {m.meta && (
                        <span className="text-[#00d4ff] font-semibold">{m.meta.model} ({m.meta.latency})</span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex items-center gap-2.5 text-[#00d4ff] text-xs font-bold p-3.5 bg-[#161924] border border-[#1c202e] rounded-2xl w-fit">
                <Sparkles size={15} className="animate-spin" />
                <span>Reasoning across graph using {selectedModel}...</span>
              </div>
            )}
          </div>

          {/* Preset Chips & Input Bar */}
          <div className="p-5 border-t border-[#1c202e] bg-[#0d0f17] space-y-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {samplePrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSendChat(p.prompt)}
                  className="bg-[#161924] border border-[#1c202e] text-[#cbd5e1] rounded-full px-3.5 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all"
                >
                  <Zap size={11} className="text-[#00d4ff]" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#161924] border border-[#00d4ff]/30 rounded-2xl p-2.5 px-4 flex items-center gap-3 shadow-[0_0_15px_rgba(0,212,255,0.08)]">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Ask Sphera AI anything across all 15 worlds..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-[#64748b] outline-none"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={!chatInput.trim() || chatMutation.isPending}
                className="h-8 px-4 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black disabled:opacity-40 hover:scale-105 transition-transform flex items-center gap-1"
              >
                Send <CornerDownLeft size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Hook & Caption Studio ──────────────────────────── */}
      {activeTab === "studio" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Task Type Switcher */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "HOOKS", label: "Viral Reel Hooks", icon: Flame },
                { id: "CAPTION", label: "Smart Caption", icon: FileText },
                { id: "HASHTAGS", label: "Hashtag Clusters", icon: Hash },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStudioTask(t.id as AiTaskType)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    studioTask === t.id
                      ? "bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                      : "bg-[#161924] border-[#1c202e] text-[#9ca3af] hover:text-white"
                  }`}
                >
                  <t.icon size={16} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Topic Input */}
            <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 space-y-3">
              <label className="block text-xs font-bold text-white">
                What is your Reel / Post about?
              </label>
              <textarea
                value={studioPrompt}
                onChange={(e) => setStudioPrompt(e.target.value)}
                placeholder="e.g. 5 VS Code shortcuts for Next.js builders, or launching my college startup..."
                rows={3}
                className="w-full bg-[#10121a] border border-[#1c202e] rounded-xl p-3 text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] resize-none"
              />
              <button
                onClick={() => studioMutation.mutate()}
                disabled={!studioPrompt.trim() || studioMutation.isPending}
                className="w-full h-10 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_15px_rgba(0,212,255,0.3)]"
              >
                {studioMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin text-[#08090d]" />
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Viral Hooks & Captions</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Preview */}
            {studioResult && (
              <div className="bg-[#161924] border border-[#00d4ff]/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#00d4ff]">
                    Generated with {studioResult.model} ({studioResult.latencyMs}ms)
                  </span>
                  <button
                    onClick={() => handleCopy(studioResult.result)}
                    className="h-7 px-3 rounded-lg bg-[#10121a] border border-[#1c202e] text-[11px] font-bold text-white hover:text-[#00d4ff] flex items-center gap-1"
                  >
                    {copied ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy All"}</span>
                  </button>
                </div>

                <div className="text-xs text-white leading-relaxed whitespace-pre-wrap bg-[#10121a] p-4 rounded-xl border border-[#1c202e]">
                  {studioResult.result}
                </div>

                {studioResult.hooks && studioResult.hooks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-amber-400">🔥 High-Retention Hook Options:</p>
                    {studioResult.hooks.map((hook, i) => (
                      <div
                        key={i}
                        onClick={() => handleCopy(hook)}
                        className="p-2.5 rounded-lg bg-[#10121a] border border-[#1c202e] text-xs text-[#cbd5e1] hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span>{hook}</span>
                        <Copy size={12} className="text-[#64748b]" />
                      </div>
                    ))}
                  </div>
                )}

                {studioResult.hashtags && studioResult.hashtags.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-[#00d4ff] mb-1.5"># Recommended Hashtags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {studioResult.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#10121a] border border-[#1c202e] text-[#00d4ff] text-[11px] px-2 py-0.5 rounded-md font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
