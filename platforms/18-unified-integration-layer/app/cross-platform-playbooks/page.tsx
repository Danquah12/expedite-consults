"use client";
import { useState } from "react";
import {
  GitGraph,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Radio,
  Sliders,
  Plus,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { CROSS_PLATFORM_PLAYBOOKS, CONNECTED_PLATFORMS } from "@/data/integrationData";
import { CrossPlatformPlaybook, PlaybookStep } from "@/types/integration";

export default function CrossPlatformPlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<CrossPlatformPlaybook[]>(CROSS_PLATFORM_PLAYBOOKS);
  const [activePlaybookId, setActivePlaybookId] = useState<string>(CROSS_PLATFORM_PLAYBOOKS[0].id);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [requiresApprovalStep, setRequiresApprovalStep] = useState<PlaybookStep | null>(null);

  const activePlaybook = playbooks.find((p) => p.id === activePlaybookId) || playbooks[0];

  const handleExecutePlaybook = () => {
    setIsExecuting(true);
    setActiveStepIndex(0);
    setExecutionLogs([`[${new Date().toLocaleTimeString()}] Playbook initiated: ${activePlaybook.name}`]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < activePlaybook.steps.length) {
        const cur = activePlaybook.steps[step];
        setExecutionLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Step ${cur.stepNumber} [${cur.targetPlatform.toUpperCase()}]: ${cur.name} - EXECUTING...`,
          `[${new Date().toLocaleTimeString()}] Output: ${cur.outputSummary || "Success"}`
        ]);
        setActiveStepIndex(step);
        step++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setActiveStepIndex(activePlaybook.steps.length);
        setExecutionLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Playbook completed successfully across all targets!`
        ]);
      }
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <GitGraph size={20} color="#a855f7" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Cross-Product SOAR & Autonomous Orchestration Engine
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Multi-platform closed-loop automation chaining CERBERUS-RE reverse engineering, Aegis Recovery S3 lockdown, and AXIOM DAST scans.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            disabled={isExecuting}
            onClick={handleExecutePlaybook}
            style={{
              background: isExecuting ? "rgba(168,85,247,0.3)" : "var(--primary)",
              color: "#050811",
              fontWeight: 800,
              fontSize: 12.5,
              padding: "8px 18px",
              borderRadius: 6,
              border: "none",
              cursor: isExecuting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Play size={14} className={isExecuting ? "animate-spin" : ""} />
            <span>{isExecuting ? "ORCHESTRATING DAG..." : "Execute Active Playbook"}</span>
          </button>
        </div>
      </div>

      {/* Playbook Selection Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {playbooks.map((pb) => {
          const isSelected = pb.id === activePlaybookId;
          return (
            <div
              key={pb.id}
              onClick={() => {
                setActivePlaybookId(pb.id);
                setActiveStepIndex(-1);
                setExecutionLogs([]);
              }}
              style={{
                background: isSelected ? "rgba(168,85,247,0.12)" : "var(--surface-2)",
                border: `1px solid ${isSelected ? "#a855f7" : "var(--border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  background: "rgba(168,85,247,0.2)",
                  color: "#c084fc",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}>
                  {pb.category}
                </span>
                <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>
                  ● {pb.successRate}% SUCCESS
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>
                {pb.name}
              </div>

              <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                {pb.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "var(--fg-2)" }}>
                <span>Trigger: <strong>{pb.triggerSource.toUpperCase()}</strong></span>
                <span>{pb.steps.length} Actions in DAG</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual DAG Canvas (Center) */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GitGraph size={16} color="#a855f7" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Visual Orchestration DAG: {activePlaybook.name}
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Total Executions: <strong>{activePlaybook.executionsTotal}</strong> · Last Run: <strong>{activePlaybook.lastRun}</strong>
          </span>
        </div>

        {/* Workflow DAG Chain */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          overflowX: "auto",
          padding: "16px 8px",
          background: "var(--surface-2)",
          borderRadius: 8,
          border: "1px solid var(--border)"
        }}>
          {/* Trigger Node */}
          <div style={{
            minWidth: 160,
            background: "rgba(244,63,94,0.12)",
            border: "1px solid #f43f5e",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: "#f43f5e", textTransform: "uppercase" }}>
              1. TRIGGER EVENT
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
              {activePlaybook.triggerEvent}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>
              Source: {activePlaybook.triggerSource.toUpperCase()}
            </div>
          </div>

          <ArrowRight size={18} color="var(--muted)" />

          {/* Steps */}
          {activePlaybook.steps.map((step, idx) => {
            const isCompleted = activeStepIndex > idx;
            const isCurrent = activeStepIndex === idx && isExecuting;

            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  minWidth: 200,
                  background: isCurrent
                    ? "rgba(168,85,247,0.2)"
                    : isCompleted
                    ? "rgba(16,185,129,0.12)"
                    : "var(--surface-3)",
                  border: `1px solid ${
                    isCurrent
                      ? "#a855f7"
                      : isCompleted
                      ? "#10b981"
                      : "var(--border)"
                  }`,
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: isCurrent ? "0 0 15px rgba(168,85,247,0.3)" : "none",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: isCompleted ? "#10b981" : isCurrent ? "#a855f7" : "var(--muted)",
                      textTransform: "uppercase"
                    }}>
                      Step {step.stepNumber}: {step.targetPlatform.toUpperCase()}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 size={13} color="#10b981" />
                    ) : isCurrent ? (
                      <RefreshCw size={13} color="#a855f7" className="animate-spin" />
                    ) : (
                      <Clock size={13} color="var(--muted)" />
                    )}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>
                    {step.name}
                  </div>

                  <div style={{ fontSize: 10.5, color: "var(--fg-2)", lineHeight: 1.3 }}>
                    {step.action}
                  </div>

                  {step.outputSummary && (
                    <div style={{
                      fontSize: 9.5,
                      background: "rgba(0,0,0,0.3)",
                      padding: "3px 6px",
                      borderRadius: 4,
                      color: isCompleted ? "#34d399" : "var(--muted)",
                      fontFamily: "monospace",
                      marginTop: 4
                    }}>
                      ✓ {step.outputSummary}
                    </div>
                  )}
                </div>

                {idx < activePlaybook.steps.length - 1 && (
                  <ArrowRight size={18} color="var(--muted)" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Console Logs */}
      <div className="card-tactical" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
            Real-Time SOAR Engine Audit Log
          </span>
          <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
            gRPC DISPATCH TRACE
          </span>
        </div>

        <div style={{
          height: 160,
          overflowY: "auto",
          background: "#050811",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: 12,
          fontFamily: "monospace",
          fontSize: 11
        }}>
          {executionLogs.length > 0 ? (
            executionLogs.map((log, lIdx) => (
              <div key={lIdx} style={{ color: log.includes("completed") ? "#10b981" : log.includes("Step") ? "#a855f7" : "#cbd5e1", marginBottom: 4 }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: "var(--muted)", fontStyle: "italic" }}>
              Ready to execute. Click 'Execute Active Playbook' to stream step-by-step cross-product commands.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
