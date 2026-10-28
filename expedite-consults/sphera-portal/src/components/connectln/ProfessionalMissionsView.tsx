"use client"

import React, { useState } from "react"
import {
  Flame,
  CheckCircle2,
  Circle,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  Store,
  DollarSign,
  TrendingUp,
  FolderGit2
} from "lucide-react"
import {
  USER_CAREER_MISSION,
  CareerMission
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/connectln-data"

interface ProfessionalMissionsViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function ProfessionalMissionsView({
  currentUser,
  onNavigateTab
}: ProfessionalMissionsViewProps) {
  const [mission, setMission] = useState<CareerMission>(USER_CAREER_MISSION)

  const toggleTask = (taskId: string) => {
    setMission(prev => {
      const updatedTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
      const completed = updatedTasks.filter(t => t.isCompleted).length
      const progress = Math.round((completed / updatedTasks.length) * 100)
      return {
        ...prev,
        tasks: updatedTasks,
        completedTasks: completed,
        currentProgress: progress
      }
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 w-fit">
              <Flame className="h-3.5 w-3.5 text-[#0A66C2]" />
              Career Roadmap &amp; Milestones
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {mission.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Target role: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{mission.roleTarget}</strong>. Complete key milestones to showcase verified capabilities to employers and mentors.
            </p>
          </div>

          {/* Progress Gauge */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-4 border border-zinc-200 dark:border-zinc-700 text-center min-w-[170px] shrink-0 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Career Progress</span>
            <p className="text-3xl font-black text-[#0A66C2]">{mission.currentProgress}%</p>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#0A66C2] transition-all duration-500 rounded-full" style={{ width: `${mission.currentProgress}%` }} />
            </div>
            <span className="text-[11px] text-zinc-500 block pt-0.5">{mission.completedTasks} of {mission.totalTasks} Milestones Done</span>
          </div>
        </div>
      </div>

      {/* 1. OBJECTIVE TASKS CHECKLIST */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Active Mission Action Checklist</span>
          </h3>
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            +{mission.xpEarned} Verified XP Earned
          </span>
        </div>

        <div className="space-y-2.5">
          {mission.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                task.isCompleted
                  ? "bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 text-zinc-700 dark:text-zinc-300"
                  : "bg-white border-zinc-200 hover:border-indigo-400 dark:bg-zinc-800/60 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {task.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-400 shrink-0" />
                )}
                <div>
                  <p className={`text-xs font-bold ${task.isCompleted ? "line-through opacity-70" : ""}`}>
                    {task.title}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono">Category: {task.category}</span>
                </div>
              </div>

              <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-300 shrink-0">
                +{task.points} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. THE 10-STEP PROFESSIONAL JOURNEY LIFECYCLE */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
        <div className="space-y-1">
          <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#0A66C2]" />
            <span>The 10-Step Professional Journey Lifecycle</span>
          </h3>
          <p className="text-xs text-zinc-500">
            From initial skills acquisition to publishing high-margin commercial software on ConnectIn Marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mission.professionalJourneySteps.map((step) => (
            <div
              key={step.stepNumber}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
                step.status === 'completed'
                  ? "bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : step.status === 'in_progress'
                  ? "bg-purple-50/50 border-purple-400 dark:bg-purple-950/30 dark:border-purple-600 ring-2 ring-purple-500/20"
                  : "bg-zinc-50 border-zinc-200 dark:bg-zinc-800/40 dark:border-zinc-800 opacity-60"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-zinc-400">Step {step.stepNumber}</span>
                  <span className={step.status === 'completed' ? "text-emerald-600" : step.status === 'in_progress' ? "text-purple-600" : "text-zinc-400"}>
                    {step.status === 'completed' ? "✓ Done" : step.status === 'in_progress' ? "⚡ Active" : "Upcoming"}
                  </span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{step.name}</h4>
                <p className="text-[11px] text-zinc-500 leading-tight">{step.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                <span>🎯 {step.deliverable}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
