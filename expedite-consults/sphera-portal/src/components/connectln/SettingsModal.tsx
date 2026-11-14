"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  Search,
  X,
  UserCircle2,
  Plug,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"

export interface SettingsShortcut {
  id: string
  label: string
  badge?: string
  url?: string
  description?: string
}

type SectionId = "account" | "apps" | "billing" | "admin"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  user: UserProfile
  isAdmin: boolean
  /** External live apps for the user's profession (open in a new tab) */
  connectedApps: SettingsShortcut[]
  /** Account & identity items (Switch Persona, Safety & FIDO2 Identity ...) */
  accountItems: SettingsShortcut[]
  /** Wallet / escrow / payouts items */
  billingItems: SettingsShortcut[]
  /** Privileged items (Admin IAM Console ...) - only shown to admins */
  adminItems: SettingsShortcut[]
  onActivate: (item: SettingsShortcut) => void
  onOpenIDModal?: () => void
  initialSection?: SectionId
}

/** Strips the leading emoji from a label so the row can render its own icon cleanly. */
function splitLabel(label: string): { icon: string; text: string } {
  const m = label.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*(.*)$/u)
  return m ? { icon: m[1], text: m[2] } : { icon: "", text: label }
}

export function SettingsModal({
  open,
  onClose,
  user,
  isAdmin,
  connectedApps,
  accountItems,
  billingItems,
  adminItems,
  onActivate,
  onOpenIDModal,
  initialSection = "account",
}: SettingsModalProps) {
  const [section, setSection] = useState<SectionId>(initialSection)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      setSection(initialSection)
      setQuery("")
    }
  }, [open, initialSection])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const sections = useMemo(() => {
    const list: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
      { id: "account", label: "Account", icon: UserCircle2, count: accountItems.length },
      { id: "apps", label: "Connected Apps", icon: Plug, count: connectedApps.length },
      { id: "billing", label: "Billing & Payouts", icon: CreditCard, count: billingItems.length },
    ]
    if (isAdmin && adminItems.length > 0) {
      list.push({ id: "admin", label: "Admin", icon: ShieldCheck, count: adminItems.length })
    }
    return list
  }, [accountItems.length, connectedApps.length, billingItems.length, adminItems.length, isAdmin])

  const q = query.trim().toLowerCase()
  const matches = (item: SettingsShortcut) =>
    !q || `${item.label} ${item.badge || ""} ${item.description || ""}`.toLowerCase().includes(q)

  // When searching, show matching items from every section at once
  const searchResults = useMemo(() => {
    if (!q) return []
    const pool: { section: string; item: SettingsShortcut }[] = [
      ...accountItems.map((item) => ({ section: "Account", item })),
      ...connectedApps.map((item) => ({ section: "Connected Apps", item })),
      ...billingItems.map((item) => ({ section: "Billing & Payouts", item })),
      ...(isAdmin ? adminItems.map((item) => ({ section: "Admin", item })) : []),
    ]
    return pool.filter(({ item }) => matches(item))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, accountItems, connectedApps, billingItems, adminItems, isAdmin])

  if (!open || !mounted) return null

  const activate = (item: SettingsShortcut) => {
    onClose()
    // Let the modal unmount first so any follow-up modal/tab switch renders on top cleanly
    setTimeout(() => onActivate(item), 0)
  }

  const Row = ({ item, hint }: { item: SettingsShortcut; hint?: string }) => {
    const { icon, text } = splitLabel(item.label)
    return (
      <button
        type="button"
        onClick={() => activate(item)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer group"
      >
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="text-base leading-none shrink-0">{icon}</span>}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{text}</p>
            {(item.description || hint) && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{item.description || hint}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {item.badge && (
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {item.badge}
            </span>
          )}
          {item.url ? (
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#0A66C2]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#0A66C2]" />
          )}
        </div>
      </button>
    )
  }

  const Group = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      {title && <p className="px-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p>}
      <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  )

  const Empty = ({ text }: { text: string }) => (
    <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {text}
    </div>
  )

  const activeSection = sections.find((s) => s.id === section) || sections[0]

  const renderBody = () => {
    if (q) {
      return searchResults.length === 0 ? (
        <Empty text={`No settings match "${query}".`} />
      ) : (
        <Group title={`${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}>
          {searchResults.map(({ section: s, item }) => (
            <Row key={`${s}-${item.id}-${item.label}`} item={item} hint={s} />
          ))}
        </Group>
      )
    }

    switch (activeSection.id) {
      case "account":
        return (
          <div className="space-y-5">
            <Group>
              <div className="flex items-center gap-3 px-4 py-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/60"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.headline}</p>
                </div>
                {onOpenIDModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      setTimeout(() => onOpenIDModal(), 0)
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0A66C2]/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30 cursor-pointer"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" /> ID Verified
                  </button>
                )}
              </div>
            </Group>
            <Group title="Identity & security">
              {accountItems.length === 0 ? (
                <Empty text="No account items available." />
              ) : (
                accountItems.map((item) => <Row key={item.id + item.label} item={item} />)
              )}
            </Group>
          </div>
        )
      case "apps":
        return (
          <Group title="Live apps for your profession — each opens in a new tab">
            {connectedApps.length === 0 ? (
              <Empty text="No connected apps for your profession yet." />
            ) : (
              connectedApps.map((item) => <Row key={item.id + item.label} item={item} />)
            )}
          </Group>
        )
      case "billing":
        return (
          <Group title="Wallet, escrow and payouts">
            {billingItems.length === 0 ? (
              <Empty text="No billing items available." />
            ) : (
              billingItems.map((item) => <Row key={item.id + item.label} item={item} />)
            )}
          </Group>
        )
      case "admin":
        return (
          <Group title="Privileged — visible to administrators only">
            {adminItems.map((item) => (
              <Row key={item.id + item.label} item={item} />
            ))}
          </Group>
        )
      default:
        return null
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="flex h-[min(640px,92vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 sm:flex-row">
        {/* Left rail */}
        <div className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:w-56 sm:border-b-0 sm:border-r">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              autoFocus
              className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
            {sections.map((s) => {
              const Icon = s.icon
              const active = !q && activeSection.id === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setSection(s.id)
                  }}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                    active
                      ? "bg-zinc-200/70 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {q ? "Search results" : activeSection.label}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{renderBody()}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
