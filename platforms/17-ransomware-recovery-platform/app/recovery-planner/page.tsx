"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ListOrdered,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Plus,
  Download,
  AlertTriangle,
  Layers,
  User,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Server,
  FileSpreadsheet
} from "lucide-react";
import { MOCK_CASES, MOCK_RECOVERY_PHASES } from "@/data/recoveryData";
import { RecoveryPlanPhase } from "@/types/recovery";

export default function RecoveryPlannerPage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [phases, setPhases] = useState<RecoveryPlanPhase[]>(MOCK_RECOVERY_PHASES);
  const [activePhaseIndex, setActivePhaseIndex] = useState(2); // Phase 3 In Progress
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.status === "DONE").length,
    0
  );
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  const toggleTaskStatus = (phaseIdx: number, taskId: string) => {
    setPhases((prevPhases) => {
      return prevPhases.map((phase, pIdx) => {
        if (pIdx !== phaseIdx) return phase;

        const updatedTasks = phase.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextStatus =
            task.status === "PENDING"
              ? "RUNNING"
              : task.status === "RUNNING"
              ? "DONE"
              : "PENDING";
          return { ...task, status: nextStatus as "DONE" | "RUNNING" | "PENDING" };
        });

        const allDone = updatedTasks.every((t) => t.status === "DONE");
        const anyRunning = updatedTasks.some((t) => t.status === "RUNNING");

        const updatedPhaseStatus = allDone
          ? "COMPLETED"
          : anyRunning
          ? "IN_PROGRESS"
          : "QUEUED";

        return {
          ...phase,
          tasks: updatedTasks,
          status: updatedPhaseStatus as RecoveryPlanPhase["status"]
        };
      });
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask = {
      id: `custom-t-${Date.now()}`,
      title: newTaskTitle,
      assignedTo: newTaskAssignee || "SecOps Lead",
      status: "PENDING" as const,
      durationMinutes: Number(newTaskDuration)
    };

    setPhases((prev) => {
      const updated = [...prev];
      updated[activePhaseIndex].tasks.push(newTask);
      return updated;
    });

    setShowAddTaskModal(false);
    setNewTaskTitle("");
    setNewTaskAssignee("");
  };

  const handleExportRunbook = () => {
    setExportNotice("Exported Aegis Master Incident Recovery Plan: RUNBOOK-INC-8841.md");
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ListOrdered size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Automated Recovery Plan Orchestrator with RTO/RPO
            </h1>
            <span className="badge-sev badge-success">Pillar 3: Recover & Orchestrate</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Orchestrates the 5-Phase Master Ransomware Recovery Runbook: Evidence Preservation → Identity Rebuild →
            Critical Database Systems → Clean Reinfection Gatekeeper → Production Reintegration with live RTO timers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleExportRunbook} className="btn-primary">
            <Download size={15} />
            Export Master Runbook
          </button>
        </div>
      </div>

      {exportNotice && (
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1px solid #10b981",
          borderRadius: 8,
          padding: "10px 16px",
          color: "#10b981",
          fontSize: 12.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top Recovery Progress & RTO Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Plan Completion
            </span>
            <CheckCircle2 size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>
            {progressPct}%
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {completedTasks} of {totalTasks} Recovery Tasks Done
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Target RTO Budget
            </span>
            <Clock size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#06b6d4" }}>
            18.5 Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Elapsed: 12.0h · Remaining: 6.5h
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              RPO Data Loss
            </span>
            <ShieldCheck size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>
            2.0 Hours
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Within 4.0h SLA Target
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Orchestration Phase
            </span>
            <Layers size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>
            Phase 3 of 5
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Critical Clinical DB Restoral
          </div>
        </div>
      </div>

      {/* 5-Phase Horizontal Timeline Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {phases.map((phase, idx) => {
          const isSelected = activePhaseIndex === idx;
          const isDone = phase.status === "COMPLETED";
          const isCurrent = phase.status === "IN_PROGRESS";

          return (
            <div
              key={phase.phaseNumber}
              onClick={() => setActivePhaseIndex(idx)}
              style={{
                background: isSelected ? "var(--surface-3)" : "var(--surface)",
                border: isSelected ? "1px solid var(--primary)" : isCurrent ? "1px solid #06b6d4" : "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: isDone ? "#10b981" : isCurrent ? "#06b6d4" : "var(--muted)" }}>
                  PHASE {phase.phaseNumber}
                </span>
                <span className={`badge-sev ${isDone ? "badge-success" : isCurrent ? "badge-medium" : "badge-low"}`} style={{ fontSize: 9 }}>
                  {phase.status}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc", lineHeight: 1.3 }}>
                {phase.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Phase Tasks Execution Workbench */}
      <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                Phase {phases[activePhaseIndex].phaseNumber}: {phases[activePhaseIndex].name}
              </h3>
              <span className={`badge-sev ${phases[activePhaseIndex].status === "COMPLETED" ? "badge-success" : "badge-medium"}`}>
                {phases[activePhaseIndex].status}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {phases[activePhaseIndex].description}
            </p>
          </div>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="btn-secondary"
            style={{ fontSize: 11.5 }}
          >
            <Plus size={13} />
            Add Custom Task
          </button>
        </div>

        {/* Task Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {phases[activePhaseIndex].tasks.map((task) => {
            const isDone = task.status === "DONE";
            const isRunning = task.status === "RUNNING";

            return (
              <div
                key={task.id}
                style={{
                  background: isDone ? "rgba(16,185,129,0.06)" : isRunning ? "rgba(6,182,212,0.08)" : "var(--surface-2)",
                  border: isDone ? "1px solid rgba(16,185,129,0.3)" : isRunning ? "1px solid rgba(6,182,212,0.4)" : "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                  <button
                    onClick={() => toggleTaskStatus(activePhaseIndex, task.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: isDone ? "#10b981" : isRunning ? "rgba(6,182,212,0.2)" : "var(--surface-3)",
                      border: isDone ? "none" : isRunning ? "1px solid #06b6d4" : "1px solid var(--border)",
                      color: isDone ? "#070b12" : "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isDone && <Check size={14} />}
                    {isRunning && <Play size={10} color="#06b6d4" />}
                  </button>

                  <div>
                    <div style={{
                      fontWeight: 700,
                      color: isDone ? "var(--muted)" : "#f8fafc",
                      fontSize: 13,
                      textDecoration: isDone ? "line-through" : undefined
                    }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      Assigned: <strong style={{ color: "var(--fg-2)" }}>{task.assignedTo}</strong> · Est Duration: <strong>{task.durationMinutes} mins</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`badge-sev ${isDone ? "badge-success" : isRunning ? "badge-medium" : "badge-low"}`}>
                    {task.status}
                  </span>

                  <button
                    onClick={() => toggleTaskStatus(activePhaseIndex, task.id)}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                  >
                    {isDone ? "Reopen Task" : isRunning ? "Mark Done" : "Start Task"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {showAddTaskModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          backdropFilter: "blur(4px)"
        }}>
          <div className="card-tactical" style={{ width: 440, padding: 24, background: "var(--surface)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
              Add Task to Phase {phases[activePhaseIndex].phaseNumber}
            </h3>

            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Task Title & Operational Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verify DNS round-robin routing on clinical subnet"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Assignee / Team
                </label>
                <input
                  type="text"
                  placeholder="e.g. NetOps Lead or DBA Team"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                  min={5}
                  max={480}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
