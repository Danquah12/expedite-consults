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
    <div className="w-full h-[calc(100vh-100px)] max-h-[860px] rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between shadow-sm">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Assistant & Writing Studio</h2>
              <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                AI Companion
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Campus research, writing assistant, and creator tools</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-800 p-0.5 rounded-xl border border-zinc-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "studio"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles size={12} />
              Writing Studio
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium px-2.5 py-1.5 rounded-xl outline-none cursor-pointer"
          >
            <option>Gemini 2.5 Pro</option>
            <option>Claude 3.7 Sonnet</option>
            <option>GPT-4.5</option>
          </select>
        </div>
      </div>

      {/* ── Tab 1: Co-Pilot Chat Viewport ─────────────────────────── */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 items-start p-3.5 rounded-xl ${
                  m.role === "assistant"
                    ? "bg-zinc-800/40 border border-zinc-800"
                    : "bg-transparent"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 ${
                    m.role === "assistant"
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}
                >
                  {m.role === "assistant" ? "AI" : "YOU"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">
                      {m.role === "assistant" ? "Sphera Assistant" : "You"}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      {m.meta && (
                        <span className="text-zinc-400 font-medium">{m.meta.model} ({m.meta.latency})</span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium p-3 bg-zinc-800/60 border border-zinc-800 rounded-xl w-fit">
                <Loader2 size={14} className="animate-spin" />
                <span>Thinking with {selectedModel}...</span>
              </div>
            )}
          </div>

          {/* Preset Chips & Input Bar */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 space-y-2.5">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {samplePrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSendChat(p.prompt)}
                  className="bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 rounded-full px-3 py-1 text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                >
                  <Zap size={11} className="text-zinc-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-2 px-3.5 flex items-center gap-3">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Ask anything or request assistance..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={!chatInput.trim() || chatMutation.isPending}
                className="h-7 px-3.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold disabled:opacity-40 hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                Send <CornerDownLeft size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Hook & Caption Studio ──────────────────────────── */}
      {activeTab === "studio" && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Task Type Switcher */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "HOOKS", label: "Post & Video Hooks", icon: Flame },
                { id: "CAPTION", label: "Captions", icon: FileText },
                { id: "HASHTAGS", label: "Topic Hashtags", icon: Hash },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStudioTask(t.id as AiTaskType)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    studioTask === t.id
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-xs"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <t.icon size={15} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Topic Input */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-semibold text-white">
                What is your post or discussion about?
              </label>
              <textarea
                value={studioPrompt}
                onChange={(e) => setStudioPrompt(e.target.value)}
                placeholder="e.g. 5 tips for university computer science students, or building modern React apps..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
              />
              <button
                onClick={() => studioMutation.mutate()}
                disabled={!studioPrompt.trim() || studioMutation.isPending}
                className="w-full h-9 rounded-xl bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
              >
                {studioMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin text-zinc-950" />
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Ideas & Drafts</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Preview */}
            {studioResult && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Generated with {studioResult.model} ({studioResult.latencyMs}ms)
                  </span>
                  <button
                    onClick={() => handleCopy(studioResult.result)}
                    className="h-7 px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy All"}</span>
                  </button>
                </div>

                <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap bg-zinc-900 p-3.5 rounded-lg border border-zinc-800">
                  {studioResult.result}
                </div>

                {studioResult.hooks && studioResult.hooks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-zinc-400">Recommended Hook Ideas:</p>
                    {studioResult.hooks.map((hook, i) => (
                      <div
                        key={i}
                        onClick={() => handleCopy(hook)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-700 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span>{hook}</span>
                        <Copy size={12} className="text-zinc-500" />
                      </div>
                    ))}
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
