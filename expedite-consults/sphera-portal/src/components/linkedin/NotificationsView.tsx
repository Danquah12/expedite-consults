"use client"

import React, { useState } from "react"
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

interface NotificationsViewProps {
  onNavigateTab?: (tab: string) => void
}

export function NotificationsView({ onNavigateTab }: NotificationsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Security' | 'Career' | 'Marketplace' | 'Learning' | 'Social'>('All')
  const [notifications, setNotifications] = useState<CategorizedNotificationItem[]>(INITIAL_CATEGORIZED_NOTIFICATIONS)
  const [unreadOnly, setUnreadOnly] = useState(false)

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
      {/* 1. TOP NOTIFICATIONS HERO BANNER */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-purple-500/20 px-3 py-0.5 text-xs font-bold text-purple-300 border border-purple-400/40 flex items-center gap-1.5 w-fit">
              <Bell className="h-3.5 w-3.5 text-amber-300" />
              ConnectIn Intelligent Notifications Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
              Updates, Security Advisories &amp; Career Signals
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Categorized intelligence across Social engagements, Career job matches, Marketplace updates, Learning milestones, and critical Security advisories.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* 5 Master Notification Categories Filter Ribbon */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'All', label: '🌐 All', count: getCategoryCount('All'), unread: getUnreadCount('All') },
              { id: 'Security', label: '🛡️ Security', count: getCategoryCount('Security'), unread: getUnreadCount('Security') },
              { id: 'Career', label: '💼 Career', count: getCategoryCount('Career'), unread: getUnreadCount('Career') },
              { id: 'Marketplace', label: '🛍️ Marketplace', count: getCategoryCount('Marketplace'), unread: getUnreadCount('Marketplace') },
              { id: 'Learning', label: '🎓 Learning', count: getCategoryCount('Learning'), unread: getUnreadCount('Learning') },
              { id: 'Social', label: '💬 Social', count: getCategoryCount('Social'), unread: getUnreadCount('Social') }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? "bg-white text-zinc-950 shadow-md font-extrabold"
                      : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.unread > 0 ? (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {cat.unread}
                    </span>
                  ) : (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-zinc-900 text-white" : "bg-white/20 text-white/90"}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
              unreadOnly
                ? "bg-amber-400 text-zinc-950 font-black shadow-xs"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{unreadOnly ? "Showing Unread Only" : "Show All"}</span>
          </button>
        </div>
      </div>

      {/* 2. NOTIFICATIONS STREAM */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const isCriticalSecurity = notif.priority === 'critical'
          const isHighPriority = notif.priority === 'high'

          return (
            <div
              key={notif.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCriticalSecurity
                  ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/20"
                  : notif.unread
                  ? "border-[#0A66C2]/40 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
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

              {/* 1-Click Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleNotificationAction(notif)}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold text-white transition-all flex items-center gap-1.5 shadow-sm ${
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
