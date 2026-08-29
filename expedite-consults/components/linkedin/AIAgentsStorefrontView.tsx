"use client"

import React, { useState } from "react"
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight,
  Terminal,
  CheckCircle2,
  DollarSign,
  Plus
} from "lucide-react"
import {
  AI_AGENTS_MARKETPLACE_DATA,
  AIAgentItem
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface AIAgentsStorefrontViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function AIAgentsStorefrontView({
  currentUser,
  onNavigateTab
}: AIAgentsStorefrontViewProps) {
  const [agents, setAgents] = useState<AIAgentItem[]>(AI_AGENTS_MARKETPLACE_DATA)
  const [selectedAgent, setSelectedAgent] = useState<AIAgentItem | null>(null)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testOutput, setTestOutput] = useState<string[]>([])

  const handleTestAgent = (agent: AIAgentItem) => {
    setSelectedAgent(agent)
    setIsTestRunning(true)
    setTestOutput([
      `[CONNECTIN AGENT RUNTIME] Initializing sandbox for ${agent.name}...`,
      `[SECURITY] Verifying cryptographic tool boundaries and Ed25519 token signatures...`,
      `[CONNECTED] Autonomous agent active. Executing sample policy verification...`
    ])

    setTimeout(() => {
      setTestOutput(prev => [
        ...prev,
        `✓ Discovered 3 AWS GovCloud unencrypted S3 buckets.`,
        `✓ Generated automated Terraform remediation patch (PR #142).`,
        `✓ Exported OSCAL JSON control verification for NIST 800-53 SC-13.`,
        `★ SUCCESS: Agent test pass rate: 100%. Ready for 1-Click Cluster Deployment.`
      ])
      setIsTestRunning(false)
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40 flex items-center gap-1.5 w-fit">
            <Bot className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Autonomous AI Agent Marketplace
          </span>
          <h1 className="text-2xl font-black text-white">
            Discover, Test, Subscribe &amp; Deploy AI Agents
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Autonomous recruiting, pentesting, compliance, and coding agents with verified tool perimeters and 1-click cloud cluster deployment.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('marketplace')}
          className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2.5 text-xs shadow-md hover:bg-zinc-100 shrink-0"
        >
          View Full Software Store →
        </button>
      </div>

      {/* LIVE INTERACTIVE AGENT SANDBOX RUNNER */}
      {selectedAgent && (
        <div className="rounded-2xl border border-zinc-700 bg-black p-5 text-white shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedAgent.icon}</span>
              <span className="font-bold text-zinc-200">{selectedAgent.name} — Interactive Test Run</span>
            </div>
            <button onClick={() => setSelectedAgent(null)} className="text-zinc-400 hover:text-white text-xs font-bold">
              ✕ Close Test
            </button>
          </div>

          <div className="space-y-1 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-emerald-400 min-h-[140px] overflow-y-auto font-mono text-[11px] leading-relaxed">
            {testOutput.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
            {isTestRunning && <p className="text-amber-400 animate-pulse">Running live capability validation...</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-zinc-400">Sandbox isolated with WASM tool runtime</span>
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 text-xs shadow-md"
            >
              Subscribe &amp; Deploy ({selectedAgent.pricing}) →
            </button>
          </div>
        </div>
      )}

      {/* AGENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-purple-500 transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-2xl shadow-xs">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{agent.name}</span>
                      {agent.isVerified && <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />}
                    </h3>
                    <p className="text-xs text-zinc-500">By {agent.creator} · <strong className="text-amber-500">{agent.rating}</strong></p>
                  </div>
                </div>

                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-300">
                  {agent.deployCount}
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {agent.description}
              </p>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Agent Capabilities:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {agent.capabilities.map((cap, idx) => (
                    <span key={idx} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-emerald-600">{agent.pricing}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestAgent(agent)}
                  className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  Test Sandbox
                </button>
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1.5 text-xs font-bold shadow-xs hover:from-purple-500 hover:to-indigo-500"
                >
                  Deploy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
