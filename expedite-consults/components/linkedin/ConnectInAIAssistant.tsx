"use client"

import React, { useState } from "react"
import {
  Sparkles,
  Bot,
  Send,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Award,
  Zap,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserProfile } from "@/lib/linkedin-data"

interface ConnectInAIAssistantProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  suggestedCards?: {
    title: string
    category: string
    actionText: string
    targetTab: string
    matchPercent?: string
  }[]
  comparisonTable?: {
    headers: string[]
    rows: { feature: string; val1: string; val2: string; val3: string }[]
  }
}

export function ConnectInAIAssistant({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab
}: ConnectInAIAssistantProps) {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name.split(' ')[0]}! I am **ConnectIn AI**, your platform-wide intelligence assistant. I can search across jobs, compare enterprise software, match verified experts, or configure customized solution blueprints for your organization.`,
      suggestedCards: [
        {
          title: "💼 Find Cybersecurity Jobs Paying >$180K",
          category: "Career Intelligence",
          actionText: "View 14 Matched Jobs",
          targetTab: "jobs",
          matchPercent: "98% Match"
        },
        {
          title: "🛡️ Compare AXIOM vs Snyk vs CrowdStrike",
          category: "Software Matrix",
          actionText: "Open Comparison",
          targetTab: "marketplace",
          matchPercent: "Feature Match"
        },
        {
          title: "🎯 Recommend Vulnerability Tool for 5,000 Users",
          category: "AI Product Advisor",
          actionText: "Run Questionnaire",
          targetTab: "marketplace",
          matchPercent: "Advisor Engine"
        },
        {
          title: "⭐ Find Verified AWS Security Experts ($150-$175/hr)",
          category: "Expert Booking",
          actionText: "Browse Experts",
          targetTab: "peerreview",
          matchPercent: "Top Rated"
        }
      ]
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText
    }

    setMessages(prev => [...prev, userMsg])
    setQuery("")
    setIsTyping(true)

    setTimeout(() => {
      let reply: ChatMessage

      const lower = promptText.toLowerCase()

      if (lower.includes('compare') || lower.includes('axiom')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `Here is the comprehensive enterprise comparison between **AXIOM AI Cyber Suite**, **Expedite Strike**, and traditional scanners:`,
          comparisonTable: {
            headers: ["Feature / Capability", "AXIOM Cyber Suite", "Expedite Strike 2026", "Legacy Scanners"],
            rows: [
              { feature: "Autonomous Pentesting", val1: "✓ Full Mesh", val2: "✓ Exploit Graph", val3: "— Manual" },
              { feature: "AI-BOM LLM Scanner", val1: "✓ Token Guardrails", val2: "✓ Checkmarx MCP", val3: "— None" },
              { feature: "cATO OSCAL Exports", val1: "✓ Automated", val2: "✓ Continuous Sync", val3: "— Static PDF" },
              { feature: "GovCloud Ingress Support", val1: "✓ FIPS 140-3", val2: "✓ FIPS 140-3", val3: "Partial" },
              { feature: "Monthly Starting Price", val1: "$499 / mo", val2: "$499 / mo", val3: "$2,500+ / mo" }
            ]
          },
          suggestedCards: [
            {
              title: "Launch AXIOM 14-Day Free Evaluation",
              category: "Marketplace Product",
              actionText: "Start Free Trial",
              targetTab: "marketplace",
              matchPercent: "98% Match"
            }
          ]
        }
      } else if (lower.includes('vulnerability') || lower.includes('5,000') || lower.includes('recommend')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `Based on your multi-tenant environment (5,000 users, AWS GovCloud, FedRAMP requirement), **ConnectIn AI Product Advisor** calculated these top 3 matches:

1. **Expedite Strike & Fusion 2026** (94% Match) — Best for automated ASPM and eliminating 90% of false-positive alert noise via GitHub auto-PR triage.
2. **AXIOM AI-Powered Cyber Suite** (91% Match) — Best for real-time zero trust blast-radius mapping and continuous cATO evidence.
3. **Sphera Zero-Trust Validator** (86% Match) — Micro-app add-on for Kubernetes Cilium eBPF packet enforcement.`,
          suggestedCards: [
            {
              title: "Expedite Strike 14-Day Free Sandbox",
              category: "Recommended Tool #1",
              actionText: "Launch Sandbox",
              targetTab: "marketplace",
              matchPercent: "94% Match"
            },
            {
              title: "Book 1:1 Architecture Briefing with Fellow",
              category: "Advisory Practice",
              actionText: "Book Consultation",
              targetTab: "peerreview",
              matchPercent: "$150 / hr"
            }
          ]
        }
      } else if (lower.includes('job') || lower.includes('180k') || lower.includes('career')) {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `I found **14 active high-compensation positions** matching your verified clearance and Zero-Trust skillset:

• **Lead Cloud Security Architect** @ Northrop Grumman ($195K–$225K TC) · Washington, DC / Remote
• **Principal Cloud & Zero Trust Architect** @ Expedite Consults ($245K TC) · DC Metro
• **Staff AI Security Engineer** @ Stripe ($385K TC) · San Francisco / Remote`,
          suggestedCards: [
            {
              title: "Browse All 14 Matching Jobs",
              category: "Direct Apply",
              actionText: "Go to Jobs",
              targetTab: "jobs",
              matchPercent: "Top Matches"
            }
          ]
        }
      } else {
        reply = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: `I processed your request for "${promptText}". ConnectIn AI has indexed relevant verified experts, technical courses, and enterprise solutions across our ecosystem.`,
          suggestedCards: [
            {
              title: "Explore Solutions Hub",
              category: "Business Outcomes",
              actionText: "View Solutions",
              targetTab: "marketplace",
              matchPercent: "Recommended"
            },
            {
              title: "Explore Interactive Hands-On Labs",
              category: "Technical Masterclasses",
              actionText: "View Learning",
              targetTab: "learning",
              matchPercent: "Practice Labs"
            }
          ]
        }
      }

      setMessages(prev => [...prev, reply])
      setIsTyping(false)
    }, 600)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>ConnectIn AI</span>
                <span className="rounded-full bg-purple-500/30 px-2 py-0.2 text-[9px] font-mono text-purple-200 border border-purple-400/40">
                  v2026.1 Platform Agent
                </span>
              </DialogTitle>
              <p className="text-[11px] text-zinc-300">
                Intelligent assistant across Professional, Knowledge &amp; Commerce layers
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? "bg-[#0A66C2] text-white font-medium"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Comparison Table View */}
                {msg.comparisonTable && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-300 dark:border-zinc-700">
                    <table className="w-full text-left text-[11px] border-collapse bg-white dark:bg-zinc-900">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-b border-zinc-300 dark:border-zinc-700 font-bold">
                          {msg.comparisonTable.headers.map((h, i) => (
                            <th key={i} className="p-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                        {msg.comparisonTable.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="p-2 font-sans font-semibold text-zinc-900 dark:text-zinc-100">{r.feature}</td>
                            <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">{r.val1}</td>
                            <td className="p-2 text-indigo-600 dark:text-indigo-400 font-bold">{r.val2}</td>
                            <td className="p-2 text-zinc-400">{r.val3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Suggested Action Cards */}
                {msg.suggestedCards && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    {msg.suggestedCards.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-700 space-y-1.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span className="font-mono">{c.category}</span>
                            {c.matchPercent && (
                              <span className="font-bold text-emerald-600">{c.matchPercent}</span>
                            )}
                          </div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {c.title}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onClose()
                            onNavigateTab(c.targetTab)
                          }}
                          className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1 px-2 text-center text-[10px] font-bold transition-colors"
                        >
                          {c.actionText} →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs italic">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-500" />
              <span>ConnectIn AI is synthesizing platform recommendations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask anything: 'Find jobs >$180k', 'Compare AXIOM vs Snyk', 'Recommend pentesting tools'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt(query)
            }}
            className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
          />
          <button
            onClick={() => handleSendPrompt(query)}
            disabled={!query.trim()}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-2.5 transition-all disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
