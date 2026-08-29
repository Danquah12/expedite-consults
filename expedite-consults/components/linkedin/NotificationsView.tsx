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
  Check
} from "lucide-react"

interface NotificationItem {
  id: string
  type: 'reaction' | 'comment' | 'job' | 'anniversary' | 'security' | 'mention'
  actorName: string
  actorAvatar?: string
  actorRole?: string
  headline: string
  timeAgo: string
  unread: boolean
  actionText?: string
  actionCompleted?: boolean
}

export function NotificationsView() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'posts' | 'mentions' | 'jobs'>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      type: 'anniversary',
      actorName: 'Kavita Patel',
      actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      actorRole: 'Director of Cloud Governance @ CyberNova',
      headline: 'is celebrating 3 years at CyberNova today.',
      timeAgo: '1h ago',
      unread: true,
      actionText: 'Say Congrats 🎉',
      actionCompleted: false
    },
    {
      id: 'notif_2',
      type: 'reaction',
      actorName: 'Dr. Elena Rostova',
      actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      actorRole: 'Chief AI Research Scientist',
      headline: 'found your post insightful: "Autonomous agentic systems are entering production at record speed..."',
      timeAgo: '3h ago',
      unread: true,
      actionText: 'View post'
    },
    {
      id: 'notif_3',
      type: 'job',
      actorName: 'Expedite Consults',
      actorAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      headline: 'Job alert matching your preferences: Lead Cloud Security Architect in New York, NY.',
      timeAgo: '5h ago',
      unread: false,
      actionText: 'Apply now'
    },
    {
      id: 'notif_4',
      type: 'mention',
      actorName: 'Marcus Vance',
      actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      actorRole: 'VP of Engineering at CloudScale Global',
      headline: 'quoted your post in a discussion on Cryptographic Nonces and Replay resistance.',
      timeAgo: '1d ago',
      unread: false,
      actionText: 'View quote'
    },
    {
      id: 'notif_5',
      type: 'security',
      actorName: 'ConnectIn Security',
      headline: 'Your profile appeared in 342 recruiter searches this week. High engagement from Fortune 500 CISOs.',
      timeAgo: '2d ago',
      unread: false,
      actionText: 'See analytics'
    }
  ])

  const handlePerformAction = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, actionCompleted: true, unread: false } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'posts') return n.type === 'reaction' || n.type === 'comment'
    if (activeCategory === 'mentions') return n.type === 'mention'
    if (activeCategory === 'jobs') return n.type === 'job'
    return true
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-12">
      {/* Category Pills & Header */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0A66C2]" />
            Notifications
          </h2>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#0A66C2] hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {[
            { id: 'all', label: 'All' },
            { id: 'posts', label: 'My Posts & Reactions' },
            { id: 'mentions', label: 'Mentions & Quotes' },
            { id: 'jobs', label: 'Job Alerts' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#0A66C2] text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start justify-between p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-850 gap-3 ${
              notif.unread ? "bg-sky-50/40 dark:bg-sky-950/20" : ""
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {notif.actorAvatar ? (
                <div className="relative shrink-0">
                  <img
                    src={notif.actorAvatar}
                    alt={notif.actorName}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                  {notif.type === 'reaction' && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] text-white">
                      👍
                    </span>
                  )}
                  {notif.type === 'anniversary' && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                      🎉
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0A66C2] dark:bg-blue-950">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0 flex-1 text-xs">
                <p className="text-zinc-800 dark:text-zinc-200 leading-snug">
                  <strong className="font-bold text-zinc-900 dark:text-zinc-100">
                    {notif.actorName}
                  </strong>{" "}
                  {notif.headline}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">{notif.timeAgo}</p>
              </div>
            </div>

            {/* Quick Action Button */}
            {notif.actionText && (
              <div className="shrink-0 self-center">
                {notif.actionCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                    <Check className="h-3.5 w-3.5" /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handlePerformAction(notif.id)}
                    className="rounded-full border border-[#0A66C2] px-3.5 py-1 text-xs font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                  >
                    {notif.actionText}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
