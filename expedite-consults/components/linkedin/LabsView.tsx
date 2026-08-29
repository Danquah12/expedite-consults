"use client"

import React, { useState } from "react"
import {
  Cpu,
  Terminal,
  Play,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Zap,
  Server
} from "lucide-react"
import {
  SECURITY_LABS_DATA,
  SecurityLabExercise
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface LabsViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function LabsView({
  currentUser,
  onNavigateTab
}: LabsViewProps) {
  const [labs, setLabs] = useState<SecurityLabExercise[]>(SECURITY_LABS_DATA)
  const [activeLab, setActiveLab] = useState<SecurityLabExercise | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[CONNECTIN LABS] Initializing Firecracker MicroVM container enclave...",
    "[K8S CLUSTER] Node 1 (Control Plane) READY. eBPF socket tracing probe attached.",
    "[ZERO TRUST] Cilium ClusterMesh policy active. Awaiting student validation commands."
  ])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isLabCompleted, setIsLabCompleted] = useState(false)

  const handleLaunchLab = (lab: SecurityLabExercise) => {
    setActiveLab(lab)
    setIsLabCompleted(false)
    setTerminalOutput([
      `[SANDBOX] Initialized ${lab.environment} enclave for ${currentUser.name}...`,
      `[SECURITY] Target: ${lab.title}`,
      `[TASK 1] Inspect ingress rules with 'cilium policy get' and apply micro-segmentation patch.`,
      `[READY] Type commands or click 'Run Automated Verification'.`
    ])
  }

  const handleRunVerification = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        "$ cilium bpf tunnel list",
        "$ kubectl apply -f /etc/cilium/zero-trust-egress.yaml",
        "✓ Micro-segmentation policy enforced across 48 pods.",
        "✓ Unauthorized cross-namespace socket dropped (0ns latency).",
        "★ ALL OBJECTIVES SATISFIED: Verified Fellow eBPF Micro-Credential Minted to Profile!"
      ])
      setIsExecuting(false)
      setIsLabCompleted(true)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-sky-500/30 px-3 py-0.5 text-xs font-bold text-sky-200 border border-sky-400/40 flex items-center gap-1.5 w-fit">
            <Cpu className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Interactive Hands-on Defense Labs &amp; MicroVM Sandboxes
          </span>
          <h1 className="text-2xl font-black text-white">
            Practice Real Exploits, Micro-Segmentation &amp; AI Defenses
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Live browser-based cloud sandboxes. Practice $\rightarrow$ Assessment $\rightarrow$ Skill Verification $\rightarrow$ Credential Badge $\rightarrow$ Recruiter Priority.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('learning')}
          className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2.5 text-xs shadow-md hover:bg-zinc-100 shrink-0"
        >
          View Full Learning Track →
        </button>
      </div>

      {/* ACTIVE LAB TERMINAL RUNNER */}
      {activeLab && (
        <div className="rounded-2xl border border-zinc-700 bg-black p-6 text-white shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              </div>
              <span className="font-bold text-zinc-300 ml-2">{activeLab.title} — {activeLab.environment}</span>
            </div>

            <button
              onClick={() => setActiveLab(null)}
              className="text-zinc-400 hover:text-white text-xs font-bold"
            >
              ✕ Exit Sandbox
            </button>
          </div>

          <div className="space-y-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-emerald-400 min-h-[160px] overflow-y-auto font-mono text-[11px] leading-relaxed">
            {terminalOutput.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
            {isExecuting && <p className="text-amber-400 animate-pulse">Running live eBPF verification probe...</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-400">Environment isolated with Firecracker MicroVM &amp; Cilium eBPF</span>
            <div className="flex items-center gap-2">
              {!isLabCompleted ? (
                <button
                  onClick={handleRunVerification}
                  disabled={isExecuting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2 text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Automated Verification &amp; Claim Badge</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black px-5 py-2 text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <Award className="h-4 w-4 text-amber-300" />
                  <span>View Verified Credential on Profile →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LABS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-sky-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  lab.difficulty === 'Master' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                  lab.difficulty === 'Advanced' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {lab.difficulty}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {lab.duration}
                </span>
              </div>

              <h3 className="font-bold text-base text-zinc-900 leading-snug dark:text-zinc-100">
                {lab.title}
              </h3>

              <p className="text-xs text-zinc-500 font-mono">
                Env: <strong className="text-zinc-700 dark:text-zinc-300">{lab.environment}</strong>
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {lab.description}
              </p>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Skills Verified:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {lab.skillsGained.map((sk, idx) => (
                    <span key={idx} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => handleLaunchLab(lab)}
                className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white py-2 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Launch Interactive Sandbox</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
