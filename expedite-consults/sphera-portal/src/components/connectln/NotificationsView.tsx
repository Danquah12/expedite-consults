"use client"

import React, { useState, useEffect } from "react"
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Heart,
  MessageSquare,
  Sparkles,
  Award,
  Calendar,
  Filter,
  Check,
  AlertTriangle,
  Shield,
  ShoppingBag,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Store,
  Layers
} from "lucide-react"
import {
  CategorizedNotificationItem,
  INITIAL_CATEGORIZED_NOTIFICATIONS
} from "@/lib/notifications-engine-data"

interface NoctisAlertCardExplanation {
  alertId: string
  whatItRepresents: string
  whyItMatters: string
  recommendedActionPlan: string[]
  liveNoctisNote?: string
}

interface NotificationsViewProps {
  onNavigateTab?: (tab: string) => void
  currentUserName?: string
  currentUserProfession?: string
}

export function NotificationsView({
  onNavigateTab,
  currentUserName = "Kwesi Asiedu",
  currentUserProfession = ""
}: NotificationsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Security' | 'Career' | 'Marketplace' | 'Learning' | 'Social'>('All')
  const [notifications, setNotifications] = useState<CategorizedNotificationItem[]>(INITIAL_CATEGORIZED_NOTIFICATIONS)
  const [unreadOnly, setUnreadOnly] = useState(false)

  // Noctis Alerts Intelligence States
  const [showNoctisOverview, setShowNoctisOverview] = useState<boolean>(true)
  const [isNoctisOverviewLoading, setIsNoctisOverviewLoading] = useState<boolean>(false)
  const [noctisOverviewText, setNoctisOverviewText] = useState<string>("")
  const [noctisUpdatedAtLabel, setNoctisUpdatedAtLabel] = useState<string>("Updated just now")
  const [noctisAlertQuestion, setNoctisAlertQuestion] = useState<string>("")
  const [noctisCustomAnswer, setNoctisCustomAnswer] = useState<string | null>(null)
  const [alertExplanationsMap, setAlertExplanationsMap] = useState<Record<string, NoctisAlertCardExplanation>>({})
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>(['notif_sec_1'])
  const [loadingSingleAlertId, setLoadingSingleAlertId] = useState<string | null>(null)
  const [singleAlertQuestions, setSingleAlertQuestions] = useState<Record<string, string>>({})

  // Category counts
  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return notifications.length
    return notifications.filter(n => n.category === cat).length
  }

  const getUnreadCount = (cat: string) => {
    if (cat === 'All') return notifications.filter(n => n.unread).length
    return notifications.filter(n => n.category === cat && n.unread).length
  }

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    const matchCategory = selectedCategory === 'All' || n.category === selectedCategory
    const matchUnread = !unreadOnly || n.unread
    return matchCategory && matchUnread
  })

  const serializeAlertForNoctis = (n: CategorizedNotificationItem) => ({
    id: n.id,
    category: n.category,
    subType: n.subType,
    actorName: n.actor.name,
    actorRole: n.actor.role,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    unread: n.unread,
    priority: n.priority,
    actionText: n.actionText,
    externalLabel: n.externalLabel,
    externalUrl: n.externalUrl
  })

  const fetchNoctisAlertsBriefing = async (customQuestion?: string) => {
    setIsNoctisOverviewLoading(true)
    try {
      const targetAlerts = filteredNotifications.map(serializeAlertForNoctis)
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'alerts_briefing',
          question: customQuestion || undefined,
          categoryFilter: selectedCategory,
          alerts: targetAlerts,
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.alertExplanations && typeof data.alertExplanations === 'object') {
        setAlertExplanationsMap(prev => ({ ...prev, ...data.alertExplanations }))
      }
      if (data?.text) {
        if (customQuestion) {
          setNoctisCustomAnswer(data.text)
        } else {
          setNoctisOverviewText(data.text)
        }
        setNoctisUpdatedAtLabel(
          `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        )
      }
    } catch {
      // Keep existing local explanation
    } finally {
      setIsNoctisOverviewLoading(false)
    }
  }

  const handleExplainSingleAlertWithNoctis = async (
    notif: CategorizedNotificationItem,
    customQuestion?: string
  ) => {
    if (!expandedAlertIds.includes(notif.id)) {
      setExpandedAlertIds(prev => [...prev, notif.id])
    } else if (!customQuestion) {
      // Toggle close if already open and no custom question submitted
      setExpandedAlertIds(prev => prev.filter(id => id !== notif.id))
      return
    }

    setLoadingSingleAlertId(notif.id)
    try {
      const res = await fetch('/api/connectin/noctis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_single_alert',
          question: customQuestion || undefined,
          selectedAlert: serializeAlertForNoctis(notif),
          profile: {
            name: currentUserName,
            profession: currentUserProfession
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (data?.singleExplanation) {
        setAlertExplanationsMap(prev => ({
          ...prev,
          [notif.id]: data.singleExplanation
        }))
      }
    } catch {
      // Keep structured breakdown
    } finally {
      setLoadingSingleAlertId(null)
    }
  }

  useEffect(() => {
    fetchNoctisAlertsBriefing()
  }, [selectedCategory, unreadOnly])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const handleNotificationAction = (item: CategorizedNotificationItem) => {
    handleMarkAsRead(item.id)
    if (onNavigateTab) {
      onNavigateTab(item.targetTab)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* 1. TOP NOTIFICATIONS BANNER */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 text-xs font-semibold text-[#0A66C2] dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 w-fit">
              <Bell className="h-3.5 w-3.5" />
              Notifications &amp; Activity
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1.5">
              Updates &amp; Career Signals
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Stay informed on peer connections, career matches, community discussions, and account alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowNoctisOverview(prev => !prev)
                if (!showNoctisOverview) {
                  fetchNoctisAlertsBriefing()
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                showNoctisOverview
                  ? "bg-[#1967D2] text-white hover:bg-[#1557B0]"
                  : "bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] border border-[#1967D2]/30"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{showNoctisOverview ? "Noctis Alert Intelligence: ON" : "✨ Explain Alerts with Noctis"}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="h-4 w-4 text-[#0A66C2]" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* Notification Categories Filter Ribbon */}
        <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'All', label: 'All', count: getCategoryCount('All'), unread: getUnreadCount('All') },
              { id: 'Career', label: '💼 Career', count: getCategoryCount('Career'), unread: getUnreadCount('Career') },
              { id: 'Social', label: '💬 Network & Community', count: getCategoryCount('Social'), unread: getUnreadCount('Social') },
              { id: 'Learning', label: '🎓 Learning', count: getCategoryCount('Learning'), unread: getUnreadCount('Learning') },
              { id: 'Marketplace', label: '🛍️ Solutions', count: getCategoryCount('Marketplace'), unread: getUnreadCount('Marketplace') },
              { id: 'Security', label: '🛡️ Account & Safety', count: getCategoryCount('Security'), unread: getUnreadCount('Security') }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A66C2] text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.unread > 0 ? (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {cat.unread}
                    </span>
                  ) : (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-white/20 text-white" : "bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              unreadOnly
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{unreadOnly ? "Showing Unread Only" : "Show All"}</span>
          </button>
        </div>
      </div>

      {/* 1.5 NOCTIS ALERTS INTELLIGENCE & SIGNAL EXPLANATION PANEL */}
      {showNoctisOverview && (
        <div className="rounded-2xl border border-[#D3E3FD] bg-[#F8FAFD] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2.5 py-0.5 text-xs font-extrabold">
                <span>✨</span>
                <span>Noctis</span>
              </span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#041E49]">
                Noctis Live Alert &amp; Signal Explanation ({filteredNotifications.length} Alerts in View)
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>API Connected · /api/connectin/noctis</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => fetchNoctisAlertsBriefing()}
              disabled={isNoctisOverviewLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 px-3.5 py-1 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isNoctisOverviewLoading ? "Analyzing alerts with Noctis..." : noctisUpdatedAtLabel}</span>
              <span className={isNoctisOverviewLoading ? "animate-spin" : ""}>↻</span>
            </button>
          </div>

          <div className="rounded-xl bg-white border border-blue-100 p-4 mb-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium max-h-72 overflow-y-auto">
            {noctisOverviewText ||
              `Noctis is analyzing ${filteredNotifications.length} alerts (${filteredNotifications.filter(n => n.unread).length} unread) across your ConnectLn feed to explain what each signal represents and what actions to take...`}
          </div>

          {noctisCustomAnswer && (
            <div className="mb-3.5 rounded-xl bg-white border border-blue-300 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold text-[#1967D2]">
                  💬 Noctis Deep-Dive Alert Answer:
                </span>
                <button
                  type="button"
                  onClick={() => setNoctisCustomAnswer(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Dismiss ✕
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {noctisCustomAnswer}
              </p>
            </div>
          )}

          {/* Ask Noctis About Any Alert Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!noctisAlertQuestion.trim()) return
              fetchNoctisAlertsBriefing(noctisAlertQuestion.trim())
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={noctisAlertQuestion}
              onChange={(e) => setNoctisAlertQuestion(e.target.value)}
              placeholder="Ask Noctis what any alert represents (e.g. 'Explain CVE-2026-44921', 'Explain USP <797>/<800>', 'Summarize my unread Career Signals')..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0A66C2] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isNoctisOverviewLoading || !noctisAlertQuestion.trim()}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:bg-slate-300 px-4 py-2 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
            >
              {isNoctisOverviewLoading ? "Asking Noctis..." : "Ask Noctis →"}
            </button>
          </form>

          {/* 1-Click Quick Alert Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[
              "Explain what my critical Security & Clinical Advisories represent",
              "Explain USP <797>/<800> & Sepsis Hour-1 Bundle alerts in detail",
              "Summarize my unread Career & Interview alerts",
              "Which alerts require immediate action within 24 hours?"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setNoctisAlertQuestion(chip)
                  fetchNoctisAlertsBriefing(chip)
                }}
                className="rounded-full bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
              >
                ✨ {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS STREAM */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const isCriticalSecurity = notif.priority === 'critical'
          const isExpanded = expandedAlertIds.includes(notif.id)
          const exp = alertExplanationsMap[notif.id]
          const isLoadingSingle = loadingSingleAlertId === notif.id

          return (
            <div
              key={notif.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col gap-3.5 ${
                isCriticalSecurity
                  ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/20"
                  : notif.unread
                  ? "border-[#0A66C2]/40 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Category Icon / Actor Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.actor.avatar ? (
                      <img
                        src={notif.actor.avatar}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xl font-black dark:bg-purple-950 dark:text-purple-300">
                        🔔
                      </div>
                    )}

                    {/* Channel Tag Badge */}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-xs dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                      {notif.category === 'Security'
                        ? '🛡️'
                        : notif.category === 'Career'
                        ? '💼'
                        : notif.category === 'Marketplace'
                        ? '🛍️'
                        : notif.category === 'Learning'
                        ? '🎓'
                        : '💬'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {notif.subType}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {notif.timestamp}
                      </span>
                      {notif.unread && (
                        <span className="h-2 w-2 rounded-full bg-[#0A66C2] animate-ping" />
                      )}
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base leading-snug ${
                      isCriticalSecurity ? "text-red-700 dark:text-red-300 font-black" : "text-zinc-900 dark:text-zinc-100"
                    }`}>
                      {notif.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* 1-Click Action Button + Explain with Noctis + Optional Live External Link */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExplainSingleAlertWithNoctis(notif)}
                    className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isExpanded
                        ? "bg-[#1967D2] text-white"
                        : "bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] border border-[#1967D2]/30"
                    }`}
                    title="Ask Noctis to explain what this alert represents in detail"
                  >
                    <span>✨</span>
                    <span>{isExpanded ? "Hide Noctis Explanation" : "Explain with Noctis"}</span>
                  </button>

                  {notif.externalUrl && (
                    <a
                      href={notif.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full px-3.5 py-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>{notif.externalLabel || 'Live Portal'}</span>
                      <span>↗</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleNotificationAction(notif)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isCriticalSecurity
                        ? "bg-red-600 hover:bg-red-700"
                        : notif.category === 'Marketplace'
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        : "bg-[#0A66C2] hover:bg-[#004182]"
                    }`}
                  >
                    <span>{notif.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Noctis Detailed Alert Breakdown Drawer */}
              {isExpanded && (
                <div className="rounded-xl border border-[#D3E3FD] bg-[#F8FAFD] p-4 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-blue-200/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 text-[11px] font-extrabold">
                        ✨ Noctis Alert Breakdown
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Detailed Explanation of What This Signal Represents
                      </span>
                    </div>
                    {isLoadingSingle && (
                      <span className="text-[11px] font-bold text-[#1967D2] animate-pulse">
                        Syncing with Noctis API...
                      </span>
                    )}
                  </div>

                  {exp ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-[#1967D2] mb-1">
                          🔍 What This Alert Represents
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whatItRepresents}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-amber-800 mb-1">
                          ⚡ Why It Matters &amp; Impact
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {exp.whyItMatters}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-blue-100 p-3">
                        <div className="font-extrabold text-emerald-800 mb-1">
                          ✅ Noctis Recommended Action Plan
                        </div>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          {exp.recommendedActionPlan.map((step, idx) => (
                            <li key={idx} className="leading-snug">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Loading Noctis explanation for {notif.title}...
                    </p>
                  )}

                  {exp?.liveNoctisNote && (
                    <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      <span className="font-extrabold text-[#1967D2] block mb-1">
                        ✨ Noctis Deep-Dive Response:
                      </span>
                      {exp.liveNoctisNote}
                    </div>
                  )}

                  {/* Ask Noctis a specific question about THIS alert */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const q = (singleAlertQuestions[notif.id] || "").trim()
                      if (!q) return
                      handleExplainSingleAlertWithNoctis(notif, q)
                    }}
                    className="flex flex-col sm:flex-row gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={singleAlertQuestions[notif.id] || ""}
                      onChange={(e) =>
                        setSingleAlertQuestions(prev => ({
                          ...prev,
                          [notif.id]: e.target.value
                        }))
                      }
                      placeholder={`Ask Noctis a specific question about "${notif.title.slice(0, 48)}..."`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#0A66C2] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingSingle || !(singleAlertQuestions[notif.id] || "").trim()}
                      className="rounded-lg bg-[#1967D2] hover:bg-[#1557B0] disabled:bg-slate-300 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all cursor-pointer shrink-0"
                    >
                      {isLoadingSingle ? "Asking Noctis..." : "Ask Noctis About This Alert →"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}

        {filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <Bell className="mx-auto h-8 w-8 text-zinc-400" />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              No notifications in this category
            </h4>
            <p className="text-xs text-zinc-500">
              You are completely up to date with all signals.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
