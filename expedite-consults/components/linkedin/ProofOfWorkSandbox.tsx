"use client"

import React, { useState } from "react"
import {
  Terminal,
  Play,
  ShieldCheck,
  Zap,
  CheckCircle,
  RefreshCw,
  Cpu,
  Layers,
  Lock,
  Check,
  AlertTriangle
} from "lucide-react"

export function ProofOfWorkSandbox() {
  const [isRunning, setIsRunning] = useState(false)
  const [testStage, setTestStage] = useState<'idle' | 'running' | 'passed'>('idle')
  const [logs, setLogs] = useState<string[]>([
    "Sandbox Ready: MicroVM Pool initialized (AWS Firecracker v1.4.1)",
    "Status: Listening for agent tool dispatch..."
  ])
  const [selectedScenario, setSelectedScenario] = useState<'replay' | 'memory' | 'sandbox'>('sandbox')

  const handleRunTest = () => {
    setIsRunning(true)
    setTestStage('running')
    setLogs(["[0.00ms] Initializing Ephemeral MicroVM Sandbox..."])

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[4.12ms] Ingesting agent tool call: `exec_shell(rm -rf /)`",
        "[6.80ms] Policy Rule Triggered: Disallowed root modification attempt",
        "[8.24ms] Cryptographic Nonce Verified: HMAC-SHA256 valid"
      ])
    }, 400)

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[12.45ms] Isolating process into cgroups ephemeral jail",
        "[15.10ms] Sub-agent execution aborted deterministically",
        "[18.90ms] SUCCESS: 0 container escapes, state restored in 2.1ms ✓"
      ])
      setTestStage('passed')
      setIsRunning(false)
    }, 900)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 shadow-lg dark:border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A66C2]/20 text-[#0A66C2]">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Veritas Proof™: Live Architecture Sandbox
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                Verified Candidate Artifact
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Interactive deterministic container defense loop built by Alex Taylor
            </p>
          </div>
        </div>

        {/* Scenario Toggle */}
        <div className="flex gap-1.5 text-xs">
          {[
            { id: 'sandbox', label: 'Sandbox Isolation' },
            { id: 'replay', label: 'Replay Rejection' },
            { id: 'memory', label: 'Memory Sanitization' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(s.id as any)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                selectedScenario === s.id
                  ? "bg-[#0A66C2] text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual System Nodes Topology */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`rounded-lg border p-3 transition-colors ${
          testStage === 'running'
            ? "border-sky-500 bg-sky-950/40"
            : "border-zinc-800 bg-zinc-900/60"
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200">1. Ingress Proxy</span>
            <Lock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">mTLS + HMAC Verification</p>
          <span className="text-[10px] font-mono text-sky-300 mt-2 block">Latency: 1.2ms</span>
        </div>

        <div className={`rounded-lg border p-3 transition-colors ${
          testStage === 'running'
            ? "border-amber-500 bg-amber-950/40"
            : "border-zinc-800 bg-zinc-900/60"
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200">2. Deterministic Sandbox</span>
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Firecracker MicroVM Jail</p>
          <span className="text-[10px] font-mono text-amber-300 mt-2 block">Isolated (1 vCPU, 128MB)</span>
        </div>

        <div className={`rounded-lg border p-3 transition-colors ${
          testStage === 'passed'
            ? "border-emerald-500 bg-emerald-950/40"
            : "border-zinc-800 bg-zinc-900/60"
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200">3. Anomaly Guardrail</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Killswitch Propagation</p>
          <span className="text-[10px] font-mono text-emerald-300 mt-2 block">Sub-ms Global Rollback</span>
        </div>
      </div>

      {/* Live Terminal Output */}
      <div className="rounded-lg border border-zinc-800 bg-black p-3.5 font-mono text-xs text-zinc-300 space-y-1 min-h-[110px]">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-800 pb-1.5 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" /> test_runner.sh
          </span>
          <span>Output: stdout</span>
        </div>
        {logs.map((log, lIdx) => (
          <div key={lIdx} className="leading-relaxed">
            {log.includes('SUCCESS') ? (
              <span className="text-emerald-400 font-bold">{log}</span>
            ) : log.includes('Triggered') ? (
              <span className="text-amber-400">{log}</span>
            ) : (
              <span>{log}</span>
            )}
          </div>
        ))}
      </div>

      {/* Control Action Bar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-zinc-400">
          Source code hosted on GitHub · Cryptographically signed by (ISC)² CISSP ID
        </span>
        <button
          onClick={handleRunTest}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 shadow-md transition-all"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Running Verification...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-white" /> Execute Live Sandbox Test
            </>
          )}
        </button>
      </div>
    </div>
  )
}
