"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MapPin,
  BookOpen,
  Mail,
  CreditCard,
  Bus,
  Home,
  CloudSun,
  Calendar,
  Heart,
  Users,
  Video,
  Wind,
  Shield,
  Layers,
  Building,
  RefreshCw,
  Maximize2,
  Minimize2,
  Compass,
} from "lucide-react";

import {
  CopilotMessage,
  CopilotAction,
  COPILOT_SUGGESTIONS,
  generateGlobalCopilotResponse,
} from "@/lib/global-copilot-engine";

interface GlobalCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPerformAction?: (action: CopilotAction) => void;
  currentUserName?: string;
  initialQuery?: string;
}

export default function GlobalCopilotModal({
  isOpen,
  onClose,
  onPerformAction,
  currentUserName = "Kwesi",
  initialQuery,
}: GlobalCopilotModalProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-init-1",
      role: "assistant",
      text: `👋 Hello **${currentUserName}**! I am the **Global AI Copilot** for the **Expedite Consults & TowsonSync ecosystems**.\n\nI can answer questions and perform actions across **all parts of the site**:\n- 🎓 **Campus & Classes**: Canvas labs, Dining OneCard balances, Shuttle ETAs, Housing.\n- ✉️ **Axiom Mail & Teams**: Email threads, Teams meetings, Sweep inbox rules, Viva Insights.\n- 🏢 **Enterprise Portal**: Change Requests (CR-892), Zero-Trust IAM, FedRAMP cATO.\n- 🔍 **VeritasLens**: AI media bias & multi-vector claim verification.`,
      timestamp: "Just now",
      category: "GENERAL",
      actions: [
        { label: "📅 What is my schedule today?", tab: "home", icon: "Calendar" },
        { label: "💳 Check Dining Dollars & Swipes", modal: "wallet", icon: "CreditCard" },
        { label: "✉️ Open Axiom Mail & Teams", tab: "messages", icon: "Mail" },
        { label: "🏢 Enterprise CR Portal", href: "/portal", icon: "Building" },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("🎓 Campus & Academics");
  const [isExpanded, setIsExpanded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendQuery(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendQuery = (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const resp = generateGlobalCopilotResponse(text);
      const assistantMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: resp.text,
        timestamp: "Just now",
        category: resp.category,
        actions: resp.actions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleActionClick = (action: CopilotAction) => {
    if (action.href) {
      window.location.href = action.href;
      return;
    }
    if (onPerformAction) {
      onPerformAction(action);
      onClose();
    }
  };

  const renderActionIcon = (iconName?: string) => {
    switch (iconName) {
      case "MapPin": return <MapPin className="w-3.5 h-3.5 text-amber-500" />;
      case "BookOpen": return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
      case "Mail": return <Mail className="w-3.5 h-3.5 text-sky-500" />;
      case "CreditCard": return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case "Bus": return <Bus className="w-3.5 h-3.5 text-amber-500" />;
      case "Home": return <Home className="w-3.5 h-3.5 text-purple-500" />;
      case "CloudSun": return <CloudSun className="w-3.5 h-3.5 text-sky-500" />;
      case "Calendar": return <Calendar className="w-3.5 h-3.5 text-rose-500" />;
      case "Video": return <Video className="w-3.5 h-3.5 text-purple-500" />;
      case "Wind": return <Wind className="w-3.5 h-3.5 text-teal-500" />;
      case "Shield": return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
      case "Layers": return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      case "Building": return <Building className="w-3.5 h-3.5 text-indigo-500" />;
      case "Sparkles": return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      default: return <ArrowRight className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isExpanded ? "w-full h-full max-w-6xl max-h-[92vh]" : "w-full max-w-3xl h-[680px] max-h-[90vh]"
        }`}
      >
        {/* ── COPILOT HEADER ────────────────────────────────────────────── */}
        <header className="bg-gradient-to-r from-[#030c1d] via-[#091e42] to-[#030c1d] text-white p-4 px-6 border-b border-indigo-500/20 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-lg shadow-md animate-pulse">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-tight">GLOBAL COPILOT</h3>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                  OMNIPRESENT AI
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Connected to TowsonSync, Axiom Connect, Enterprise Portal & VeritasLens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title={isExpanded ? "Restore Size" : "Maximize"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: "assistant",
                    text: `Conversation cleared. What can I help you with across the platform?`,
                    timestamp: "Just now",
                    category: "GENERAL",
                  },
                ]);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close Copilot (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ── TOP SUGGESTION CATEGORIES ──────────────────────────────────── */}
        <div className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 p-2.5 px-4 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
          {COPILOT_SUGGESTIONS.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.category
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 border border-slate-200 dark:border-zinc-700"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* ── ACTIVE SUGGESTION PROMPTS ──────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900/60 p-2 px-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Suggested:
          </span>
          {COPILOT_SUGGESTIONS.find((c) => c.category === activeCategory)?.prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(p)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 whitespace-nowrap transition text-left"
            >
              • {p}
            </button>
          ))}
        </div>

        {/* ── CHAT MESSAGES STREAM ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
          {messages.map((msg) => {
            const isAi = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    ⚡
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs ${
                    isAi
                      ? "bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                      : "bg-indigo-600 text-white rounded-tr-xs"
                  }`}
                >
                  {/* Category Pill for AI responses */}
                  {isAi && msg.category && (
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-zinc-700/60 text-[10px]">
                      <span className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {msg.category === "CAMPUS" && "🎓 TowsonSync Campus Intelligence"}
                        {msg.category === "COMMUNICATIONS" && "✉️ Axiom Mail & Teams Operations"}
                        {msg.category === "ENTERPRISE" && "🏢 Expedite Consults Enterprise"}
                        {msg.category === "VERITAS" && "🔍 VeritasLens Fact Engine"}
                        {msg.category === "GENERAL" && "⚡ Cross-Ecosystem Global Response"}
                      </span>
                      <span className="font-mono text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Formatted Markdown Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal space-y-2">
                    {msg.text}
                  </div>

                  {/* 1-Click Interactive Action Jumpers */}
                  {isAi && msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Direct 1-Click Action Jumpers:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className="bg-white dark:bg-zinc-900 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black text-slate-800 dark:text-zinc-200 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 hover:border-amber-500 transition flex items-center gap-1.5 shadow-xs"
                          >
                            {renderActionIcon(act.icon)}
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUserName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-sm shrink-0">
                ⚡
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                <span className="text-xs text-slate-400 font-medium ml-1">Analyzing cross-domain context...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ── COPILOT INPUT BAR ──────────────────────────────────────────── */}
        <footer className="p-3 sm:p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder='Ask anything: "Where is CS 421?", "Clean my inbox", "FedRAMP cATO", "Check dining dollars"...'
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm font-medium border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Copilot</span>
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-slate-400">
            <span>⚡ Omnipresent across TowsonSync, Axiom Connect & Expedite Consults</span>
            <span>Press Esc to close</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
