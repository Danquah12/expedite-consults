"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Laptop,
  Mail,
  MessageSquare,
  PhoneCall,
  PlayCircle,
  Plus,
  Presentation,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Table2,
  Tv,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { useLanguage } from "@/context/LanguageContext"
import type { LanguageCode } from "@/lib/translations"

const FOOTER_CURRENCIES = {
  USD: { code: "USD", label: "US Dollar $", symbol: "$", rate: 1 },
  EUR: { code: "EUR", label: "Euro €", symbol: "€", rate: 0.92 },
  GBP: { code: "GBP", label: "British Pound £", symbol: "£", rate: 0.79 },
  GHS: { code: "GHS", label: "Ghana Cedi ₵", symbol: "₵", rate: 15.5 },
  CAD: { code: "CAD", label: "Canadian Dollar C$", symbol: "C$", rate: 1.38 },
} as const

const PORTAL_QR_PATH =
  "M2,2H3V3H2zM3,2H4V3H3zM4,2H5V3H4zM5,2H6V3H5zM6,2H7V3H6zM7,2H8V3H7zM8,2H9V3H8zM11,2H12V3H11zM12,2H13V3H12zM13,2H14V3H13zM14,2H15V3H14zM15,2H16V3H15zM18,2H19V3H18zM19,2H20V3H19zM20,2H21V3H20zM21,2H22V3H21zM22,2H23V3H22zM24,2H25V3H24zM25,2H26V3H25zM26,2H27V3H26zM27,2H28V3H27zM28,2H29V3H28zM29,2H30V3H29zM30,2H31V3H30zM2,3H3V4H2zM8,3H9V4H8zM11,3H12V4H11zM14,3H15V4H14zM16,3H17V4H16zM17,3H18V4H17zM18,3H19V4H18zM19,3H20V4H19zM22,3H23V4H22zM24,3H25V4H24zM30,3H31V4H30zM2,4H3V5H2zM4,4H5V5H4zM5,4H6V5H5zM6,4H7V5H6zM8,4H9V5H8zM10,4H11V5H10zM14,4H15V5H14zM17,4H18V5H17zM21,4H22V5H21zM24,4H25V5H24zM26,4H27V5H26zM27,4H28V5H27zM28,4H29V5H28zM30,4H31V5H30zM2,5H3V6H2zM4,5H5V6H4zM5,5H6V6H5zM6,5H7V6H6zM8,5H9V6H8zM10,5H11V6H10zM11,5H12V6H11zM12,5H13V6H12zM17,5H18V6H17zM19,5H20V6H19zM24,5H25V6H24zM26,5H27V6H26zM27,5H28V6H27zM28,5H29V6H28zM30,5H31V6H30zM2,6H3V7H2zM4,6H5V7H4zM5,6H6V7H5zM6,6H7V7H6zM8,6H9V7H8zM10,6H11V7H10zM11,6H12V7H11zM14,6H15V7H14zM15,6H16V7H15zM18,6H19V7H18zM19,6H20V7H19zM20,6H21V7H20zM21,6H22V7H21zM22,6H23V7H22zM24,6H25V7H24zM26,6H27V7H26zM27,6H28V7H27zM28,6H29V7H28zM30,6H31V7H30zM2,7H3V8H2zM8,7H9V8H8zM10,7H11V8H10zM11,7H12V8H11zM13,7H14V8H13zM15,7H16V8H15zM16,7H17V8H16zM17,7H18V8H17zM19,7H20V8H19zM22,7H23V8H22zM24,7H25V8H24zM30,7H31V8H30zM2,8H3V9H2zM3,8H4V9H3zM4,8H5V9H4zM5,8H6V9H5zM6,8H7V9H6zM7,8H8V9H7zM8,8H9V9H8zM10,8H11V9H10zM12,8H13V9H12zM14,8H15V9H14zM16,8H17V9H16zM18,8H19V9H18zM20,8H21V9H20zM22,8H23V9H22zM24,8H25V9H24zM25,8H26V9H25zM26,8H27V9H26zM27,8H28V9H27zM28,8H29V9H28zM29,8H30V9H29zM30,8H31V9H30zM10,9H11V10H10zM11,9H12V10H11zM12,9H13V10H12zM13,9H14V10H13zM14,9H15V10H14zM15,9H16V10H15zM17,9H18V10H17zM18,9H19V10H18zM20,9H21V10H20zM21,9H22V10H21zM22,9H23V10H22zM2,10H3V11H2zM4,10H5V11H4zM5,10H6V11H5zM6,10H7V11H6zM7,10H8V11H7zM8,10H9V11H8zM13,10H14V11H13zM16,10H17V11H16zM17,10H18V11H17zM18,10H19V11H18zM19,10H20V11H19zM21,10H22V11H21zM24,10H25V11H24zM25,10H26V11H25zM26,10H27V11H26zM27,10H28V11H27zM28,10H29V11H28zM2,11H3V12H2zM4,11H5V12H4zM5,11H6V12H5zM10,11H11V12H10zM12,11H13V12H12zM18,11H19V12H18zM19,11H20V12H19zM20,11H21V12H20zM21,11H22V12H21zM23,11H24V12H23zM24,11H25V12H24zM25,11H26V12H25zM26,11H27V12H26zM30,11H31V12H30zM2,12H3V13H2zM4,12H5V13H4zM6,12H7V13H6zM7,12H8V13H7zM8,12H9V13H8zM10,12H11V13H10zM11,12H12V13H11zM12,12H13V13H12zM13,12H14V13H13zM17,12H18V13H17zM19,12H20V13H19zM22,12H23V13H22zM23,12H24V13H23zM25,12H26V13H25zM26,12H27V13H26zM2,13H3V14H2zM3,13H4V14H3zM10,13H11V14H10zM11,13H12V14H11zM12,13H13V14H12zM16,13H17V14H16zM20,13H21V14H20zM22,13H23V14H22zM24,13H25V14H24zM25,13H26V14H25zM26,13H27V14H26zM27,13H28V14H27zM29,13H30V14H29zM2,14H3V15H2zM6,14H7V15H6zM8,14H9V15H8zM11,14H12V15H11zM14,14H15V15H14zM17,14H18V15H17zM18,14H19V15H18zM19,14H20V15H19zM21,14H22V15H21zM27,14H28V15H27zM28,14H29V15H28zM7,15H8V16H7zM10,15H11V16H10zM12,15H13V16H12zM13,15H14V16H13zM14,15H15V16H14zM15,15H16V16H15zM16,15H17V16H16zM18,15H19V16H18zM20,15H21V16H20zM21,15H22V16H21zM22,15H23V16H22zM24,15H25V16H24zM25,15H26V16H25zM26,15H27V16H26zM30,15H31V16H30zM2,16H3V17H2zM4,16H5V17H4zM5,16H6V17H5zM7,16H8V17H7zM8,16H9V17H8zM11,16H12V17H11zM12,16H13V17H12zM14,16H15V17H14zM15,16H16V17H15zM16,16H17V17H16zM17,16H18V17H17zM18,16H19V17H18zM22,16H23V17H22zM27,16H28V17H27zM28,16H29V17H28zM3,17H4V18H3zM4,17H5V18H4zM5,17H6V18H5zM6,17H7V18H6zM9,17H10V18H9zM13,17H14V18H13zM14,17H15V18H14zM15,17H16V18H15zM18,17H19V18H18zM21,17H22V18H21zM22,17H23V18H22zM23,17H24V18H23zM25,17H26V18H25zM29,17H30V18H29zM3,18H4V19H3zM6,18H7V19H6zM8,18H9V19H8zM10,18H11V19H10zM12,18H13V19H12zM13,18H14V19H13zM16,18H17V19H16zM19,18H20V19H19zM21,18H22V19H21zM27,18H28V19H27zM28,18H29V19H28zM2,19H3V20H2zM3,19H4V20H3zM5,19H6V20H5zM6,19H7V20H6zM9,19H10V20H9zM10,19H11V20H10zM13,19H14V20H13zM18,19H19V20H18zM20,19H21V20H20zM21,19H22V20H21zM22,19H23V20H22zM23,19H24V20H23zM24,19H25V20H24zM25,19H26V20H25zM26,19H27V20H26zM28,19H29V20H28zM30,19H31V20H30zM2,20H3V21H2zM4,20H5V21H4zM5,20H6V21H5zM7,20H8V21H7zM8,20H9V21H8zM10,20H11V21H10zM11,20H12V21H11zM12,20H13V21H12zM17,20H18V21H17zM19,20H20V21H19zM20,20H21V21H20zM22,20H23V21H22zM24,20H25V21H24zM25,20H26V21H25zM28,20H29V21H28zM2,21H3V22H2zM4,21H5V22H4zM5,21H6V22H5zM6,21H7V22H6zM11,21H12V22H11zM13,21H14V22H13zM14,21H15V22H14zM16,21H17V22H16zM17,21H18V22H17zM21,21H22V22H21zM23,21H24V22H23zM25,21H26V22H25zM29,21H30V22H29zM2,22H3V23H2zM5,22H6V23H5zM7,22H8V23H7zM8,22H9V23H8zM11,22H12V23H11zM17,22H18V23H17zM18,22H19V23H18zM19,22H20V23H19zM22,22H23V23H22zM23,22H24V23H23zM24,22H25V23H24zM25,22H26V23H25zM26,22H27V23H26zM28,22H29V23H28zM29,22H30V23H29zM30,22H31V23H30zM10,23H11V24H10zM11,23H12V24H11zM13,23H14V24H13zM15,23H16V24H15zM16,23H17V24H16zM18,23H19V24H18zM22,23H23V24H22zM26,23H27V24H26zM27,23H28V24H27zM28,23H29V24H28zM29,23H30V24H29zM30,23H31V24H30zM2,24H3V25H2zM3,24H4V25H3zM4,24H5V25H4zM5,24H6V25H5zM6,24H7V25H6zM7,24H8V25H7zM8,24H9V25H8zM11,24H12V25H11zM12,24H13V25H12zM13,24H14V25H13zM15,24H16V25H15zM16,24H17V25H16zM17,24H18V25H17zM18,24H19V25H18zM21,24H22V25H21zM22,24H23V25H22zM24,24H25V25H24zM26,24H27V25H26zM27,24H28V25H27zM28,24H29V25H28zM2,25H3V26H2zM8,25H9V26H8zM10,25H11V26H10zM11,25H12V26H11zM12,25H13V26H12zM14,25H15V26H14zM15,25H16V26H15zM17,25H18V26H17zM18,25H19V26H18zM20,25H21V26H20zM21,25H22V26H21zM22,25H23V26H22zM26,25H27V26H26zM2,26H3V27H2zM4,26H5V27H4zM5,26H6V27H5zM6,26H7V27H6zM8,26H9V27H8zM10,26H11V27H10zM11,26H12V27H11zM12,26H13V27H12zM13,26H14V27H13zM14,26H15V27H14zM16,26H17V27H16zM19,26H20V27H19zM22,26H23V27H22zM23,26H24V27H23zM24,26H25V27H24zM25,26H26V27H25zM26,26H27V27H26zM28,26H29V27H28zM2,27H3V28H2zM4,27H5V28H4zM5,27H6V28H5zM6,27H7V28H6zM8,27H9V28H8zM10,27H11V28H10zM11,27H12V28H11zM14,27H15V28H14zM15,27H16V28H15zM19,27H20V28H19zM20,27H21V28H20zM22,27H23V28H22zM27,27H28V28H27zM28,27H29V28H28zM29,27H30V28H29zM30,27H31V28H30zM2,28H3V29H2zM4,28H5V29H4zM5,28H6V29H5zM6,28H7V29H6zM8,28H9V29H8zM10,28H11V29H10zM11,28H12V29H11zM14,28H15V29H14zM16,28H17V29H16zM17,28H18V29H17zM20,28H21V29H20zM21,28H22V29H21zM22,28H23V29H22zM23,28H24V29H23zM24,28H25V29H24zM25,28H26V29H25zM26,28H27V29H26zM27,28H28V29H27zM28,28H29V29H28zM29,28H30V29H29zM2,29H3V30H2zM8,29H9V30H8zM11,29H12V30H11zM13,29H14V30H13zM14,29H15V30H14zM18,29H19V30H18zM22,29H23V30H22zM24,29H25V30H24zM25,29H26V30H25zM27,29H28V30H27zM29,29H30V30H29zM2,30H3V31H2zM3,30H4V31H3zM4,30H5V31H4zM5,30H6V31H5zM6,30H7V31H6zM7,30H8V31H7zM8,30H9V31H8zM10,30H11V31H10zM12,30H13V31H12zM14,30H15V31H14zM16,30H17V31H16zM19,30H20V31H19zM23,30H24V31H23zM24,30H25V31H24zM26,30H27V31H26zM28,30H29V31H28z"

const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#noctis-ai", label: "Noctis AI" },
  { href: "#tour", label: "Preview" },
  { href: "#plans", label: "Plans" },
  { href: "#download-app", label: "Download" },
  { href: "#mobile-app", label: "Mobile App" },
  { href: "#suite", label: "Suite" },
  { href: "#faq", label: "FAQ" },
]

const HERO_TABS = ["Core Capabilities", "Unified Comms", "Noctis AI"] as const
type HeroTab = (typeof HERO_TABS)[number]

const OVERVIEW_FEATURES: Array<{
  id: string
  tab: HeroTab
  title: string
  body: string
  previewTitle: string
  previewBadge: string
  previewRows: Array<{ sender: string; subject: string; time: string; tag: string }>
}> = [
  {
    id: "together",
    tab: "Core Capabilities",
    title: "Everything your workday needs, unified",
    body: "See everything you need to run your workday inside a single connected portal. Manage messages, voice & video meetings, jobs, courses, and client proposals from one clean home.",
    previewTitle: "ConnectLn 360 · Inbox & Workspace",
    previewBadge: "Live Sync",
    previewRows: [
      { sender: "Project Dispatch", subject: "Electrical inspection schedule confirmed", time: "9:14 AM", tag: "Mail" },
      { sender: "Design Team Call", subject: "3 participants · HD WebRTC room ready", time: "10:00 AM", tag: "Call" },
      { sender: "Verified Jobs Match", subject: "Lead Site Engineer · $142k/yr match", time: "11:30 AM", tag: "Jobs" },
    ],
  },
  {
    id: "calls",
    tab: "Unified Comms",
    title: "Crystal-clear group voice & video calls",
    body: "Start 1-on-1 or multi-party calls straight from any phone or browser with real-time caller portraits, screen sharing, in-call chat, and instant hangup across every connected device.",
    previewTitle: "Vibe Studio · Group Conference",
    previewBadge: "E2EE HD",
    previewRows: [
      { sender: "Host · Workspace Lead", subject: "Live camera + virtual backdrop active", time: "04:18", tag: "Host" },
      { sender: "Field Operations", subject: "Connected via Android APK", time: "04:18", tag: "Mobile" },
      { sender: "Shared Document", subject: "Q4_Site_Checklist.pdf on stage", time: "Pinned", tag: "Stage" },
    ],
  },
  {
    id: "profession",
    tab: "Core Capabilities",
    title: "Tailored to your profession on login",
    body: "Whether you are a registered nurse, master electrician, software architect, or contractor, ConnectLn adapts your training reels, jobs board, and peer communities automatically.",
    previewTitle: "Profession-Matched Workspace",
    previewBadge: "Auto-Curated",
    previewRows: [
      { sender: "Academy Stream", subject: "Code compliance & safety walk-throughs", time: "12 mins", tag: "Video" },
      { sender: "Trade Enclave", subject: "42 active RFPs in your region", time: "Updated", tag: "RFP" },
      { sender: "Peer Network", subject: "18 verified specialists online", time: "Live", tag: "Peers" },
    ],
  },
  {
    id: "files",
    tab: "Noctis AI",
    title: "Noctis AI inbox triage & smart drafts",
    body: "Ask Noctis AI to summarize long message threads, draft client estimates, prioritize urgent replies, or recommend high-fit jobs and upskilling modules.",
    previewTitle: "Ask Noctis AI · Executive Assistant",
    previewBadge: "Ready",
    previewRows: [
      { sender: "Thread Summary", subject: "3 action items extracted from vendor chat", time: "Just now", tag: "AI" },
      { sender: "Smart Reply", subject: "Client quote follow-up drafted for review", time: "1s ago", tag: "Draft" },
      { sender: "Career Match", subject: "2 certifications boost match score +18%", time: "Ready", tag: "Career" },
    ],
  },
]

const PROMPT_CARDS: Record<
  "Messages & Calls" | "Careers & Jobs" | "Business & RFPs",
  Array<{ title: string; prompt: string; icon: "mail" | "search" | "sparkles" | "video" }>
> = {
  "Messages & Calls": [
    {
      title: "Drafting client updates",
      prompt:
        "Draft a concise update to Marcus summarizing today's site inspection milestones, resolved safety items, and the confirmed delivery window for Friday.",
      icon: "mail",
    },
    {
      title: "Prioritizing & triaging inbox",
      prompt:
        "Review my unread ConnectLn messages: highlight client requests needing a reply today, flag call invitations, and mute low-priority notifications.",
      icon: "sparkles",
    },
    {
      title: "Searching past threads",
      prompt:
        "What timeline and rate estimate did we agree on with our structural contractor last month, and which attachments are linked in that thread?",
      icon: "search",
    },
    {
      title: "Recapping group calls",
      prompt:
        "Summarize today's 4-person ConnectLn group call into owners, decisions made, and follow-up calendar reminders.",
      icon: "video",
    },
  ],
  "Careers & Jobs": [
    {
      title: "Matching high-fit roles",
      prompt:
        "Filter verified ConnectLn jobs matching my trade credentials and suggest the top 5 roles with transparent pay and fast dispatch.",
      icon: "search",
    },
    {
      title: "Tailoring applications",
      prompt:
        "Rewrite my summary and highlight three measurable project outcomes to match this Senior Operations role.",
      icon: "mail",
    },
    {
      title: "Daily training digest",
      prompt:
        "Curate a 15-minute ConnectLn Learning video playlist focused on my specialty and compliance renewals due this quarter.",
      icon: "sparkles",
    },
    {
      title: "Interview preparation",
      prompt:
        "Run a mock technical walkthrough based on the job requirements and check my audio/video setup before the live ConnectLn call.",
      icon: "video",
    },
  ],
  "Business & RFPs": [
    {
      title: "Drafting RFP bids",
      prompt:
        "Outline a competitive bid response from my ConnectLn Business Hub credentials, past vouches, and crew availability.",
      icon: "mail",
    },
    {
      title: "Pipeline tracking",
      prompt:
        "List all open buyer inquiries, pending escrow milestones, and unpaid invoices across my Seller Center this week.",
      icon: "search",
    },
    {
      title: "Executive weekly brief",
      prompt:
        "Generate a Monday morning briefing combining inbound leads, calendar meetings, and team capacity.",
      icon: "sparkles",
    },
    {
      title: "Scheduling kickoff calls",
      prompt:
        "Propose three 30-minute video huddle slots this Thursday with all invited subcontractors and attach the spec PDF.",
      icon: "video",
    },
  ],
}

const TOUR_TABS = [
  {
    id: "comms",
    title: "Communicate without friction",
    heading: "Unified inbox, 1-click group video & mobile calling",
    caption:
      "Switch smoothly between formatted threads, scheduled team meetings, and live WebRTC group calls without leaving your workspace.",
    composeTo: "ops-team@expedite-consults.com",
    composeSubject: "Q4 Dispatch & Site Kickoff",
    composePreview: "Hi team — shared the updated inspection checklist in our room and scheduled our 10:00 AM group call.",
    aiSuggestion: "Help me finalize the agenda and invite everyone to the room",
  },
  {
    id: "noctis",
    title: "Collaborate with Noctis AI",
    heading: "Side-by-side AI drafting, summaries & profession intelligence",
    caption:
      "Noctis AI sits neatly alongside your inbox and calendar so you can draft replies, search credentials, or summarize threads in seconds.",
    composeTo: "hiring-lead@conectln.com",
    composeSubject: "Shortlist Review: Senior Field Engineers",
    composePreview: "Three verified candidates completed peer vouches and match 95%+ of the site safety requirements.",
    aiSuggestion: "Compare top 3 applicants and draft interview invites",
  },
  {
    id: "apps",
    title: "Switch Across ConnectLn 360 Apps",
    heading: "One launcher for Jobs, Academy, Marketplace & Business Hub",
    caption:
      "Jump between any ConnectLn module via the 9-dot App Launcher or slim desktop rail without losing your place.",
    composeTo: "procurement@conectln.com",
    composeSubject: "RFP Package Submitted · Escrow Milestone #2",
    composePreview: "Deliverables uploaded to the Business Workspace along with signed verification certificates.",
    aiSuggestion: "Generate milestone summary and notify the buyer",
  },
]

const PLAN_TIERS = {
  individual: [
    {
      name: "ConnectLn Free",
      yearlyPrice: "$0",
      monthlyPrice: "$0",
      unit: "forever",
      highlight: false,
      description: "Messaging, 1-on-1 & group WebRTC calls, verified profile, jobs browsing, and profession feed.",
      cta: "Create free account",
    },
    {
      name: "ConnectLn Basic",
      yearlyPrice: "$19.99",
      monthlyPrice: "$2.49",
      unit: "year",
      unitMonthly: "month",
      highlight: false,
      description: "Ad-free workspace, expanded file sharing in calls, priority dispatch alerts, and verified badge tools.",
      cta: "Get Basic",
    },
    {
      name: "ConnectLn Pro",
      yearlyPrice: "$69.99",
      monthlyPrice: "$6.99",
      unit: "first year",
      unitMonthly: "month",
      strikePrice: "$99.99",
      highlight: true,
      badge: "Recommended",
      description: "Full Noctis AI Assistant, CareerSuite interview coach, HD call recording & recaps, and priority jobs matching.",
      cta: "Start Pro Trial",
    },
    {
      name: "ConnectLn Pro Plus",
      yearlyPrice: "$129.99",
      monthlyPrice: "$12.99",
      unit: "year",
      unitMonthly: "month",
      highlight: false,
      description: "Share workspace benefits across up to 6 crew members or collaborators with shared calendars & files.",
      cta: "Choose Pro Plus",
    },
  ],
  business: [
    {
      name: "Starter Crew",
      yearlyPrice: "$0",
      monthlyPrice: "$0",
      unit: "up to 3 seats",
      highlight: false,
      description: "Company profile, verified directory listing, group messaging, and team voice/video huddles.",
      cta: "Launch Crew",
    },
    {
      name: "Business Standard",
      yearlyPrice: "$149.00",
      monthlyPrice: "$14.50",
      unit: "user / year",
      unitMonthly: "user / month",
      highlight: false,
      description: "Procurement & RFP desk, calendar booking, Seller Center storefronts, and audit-ready call attendance logs.",
      cta: "Start Business",
    },
    {
      name: "Business Premium",
      yearlyPrice: "$249.00",
      monthlyPrice: "$22.90",
      unit: "user / year",
      unitMonthly: "user / month",
      strikePrice: "$299.00",
      highlight: true,
      badge: "Best Value",
      description: "Everything in Standard plus Noctis AI Executive Advisor, FIDO2 passkey enforcement, and multi-org IAM.",
      cta: "Upgrade Team",
    },
    {
      name: "Sovereign Enterprise",
      yearlyPrice: "Custom",
      monthlyPrice: "Custom",
      unit: "dedicated deployment",
      highlight: false,
      description: "Private trade enclaves, dedicated TURN media relay, custom SSO/SAML, and compliance retention controls.",
      cta: "Contact Architecture",
    },
  ],
}

const SUITE_APPS: Array<{
  name: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  bg: string
  cta: string
  href?: string
  externalUrl?: string
  domainLabel?: string
}> = [
  {
    name: "Mail & Chat",
    desc: "Organized inbox, threaded direct messages, file attachments, and instant push notifications across web and mobile.",
    icon: Mail,
    bg: "bg-[#0078D4]",
    cta: "Open Mail & Chat",
  },
  {
    name: "Vibe Calls & Studio",
    desc: "High-definition 1-on-1 and group calls with virtual backgrounds, screen sharing, whiteboard, and live recaps.",
    icon: Video,
    bg: "bg-emerald-600",
    cta: "Launch Studio",
  },
  {
    name: "Verified Jobs",
    desc: "Mobile-friendly job discovery filtered by profession enclave, licensing level, location, and transparent compensation.",
    icon: Briefcase,
    bg: "bg-indigo-600",
    cta: "Browse Jobs",
  },
  {
    name: "Noctis Learning Academy",
    desc: "Role-matched short & full-length training videos selected for your exact profession right when you sign in.",
    icon: GraduationCap,
    bg: "bg-amber-600",
    cta: "Watch Courses",
  },
  {
    name: "Business & RFPs",
    desc: "Manage Seller Center storefronts, procurement solicitations, invoicing, and escrow settlements from one hub.",
    icon: Building2,
    bg: "bg-sky-700",
    cta: "Open Business Hub",
  },
  {
    name: "Trust & Passkeys",
    desc: "Phone-verified identity, FIDO2 passkey protection, and clean zero-trust session isolation per device.",
    icon: ShieldCheck,
    bg: "bg-[#0B1F3A]",
    cta: "View Security",
  },
  {
    name: "Noctis Social",
    desc: "Create, learn, and connect in 60 seconds inside the ConnectLn 360 Universe — live short-form creator & community hub at noctis.social.",
    icon: PlayCircle,
    bg: "bg-fuchsia-600",
    cta: "Open Noctis Social",
    href: "/connectin?tab=noctissocial",
    externalUrl: "https://noctis.social",
    domainLabel: "noctis.social",
  },
  {
    name: "Noctis Clinic",
    desc: "Watch a Spark. Pass a drill. Take the stamp. Interactive rapid-mastery drills & intelligence clinic integrated directly at www.dstrike.app/noctis.",
    icon: Zap,
    bg: "bg-cyan-600",
    cta: "Open Noctis Clinic",
    href: "/connectin?tab=noctisclinic",
    externalUrl: "https://www.dstrike.app/noctis",
    domainLabel: "www.dstrike.app/noctis",
  },
  {
    name: "ConnectLn Docs",
    desc: "Proprietary rich document editor engineered by ConnectLn — create proposals, SOWs, and field reports with standard .docx export.",
    icon: FileText,
    bg: "bg-[#0B5CAD]",
    cta: "Open ConnectLn Docs",
    href: "/connectin?tab=docs",
  },
  {
    name: "ConnectLn Sheets",
    desc: "Proprietary formula spreadsheet engine built by ConnectLn — run live bids, payroll, and budgets with standard .xlsx & CSV export.",
    icon: Table2,
    bg: "bg-[#107C41]",
    cta: "Open ConnectLn Sheets",
    href: "/connectin?tab=sheets",
  },
  {
    name: "ConnectLn Slides",
    desc: "Proprietary visual presentation studio owned by ConnectLn — design themed widescreen decks and present live with .pptx export.",
    icon: Presentation,
    bg: "bg-[#C84B28]",
    cta: "Open ConnectLn Slides",
    href: "/connectin?tab=slides",
  },
]

const TIPS_ITEMS = [
  {
    cat: "What's new",
    tag: "Group Calling 2.0",
    title: "Seamless hangup & instant audio cleanup across Android, iOS & Desktop",
    desc: "When the host ends a group meeting, every connected phone closes cleanly and shuts down microphone hardware immediately.",
    accent: "from-sky-500 to-blue-700",
  },
  {
    cat: "Skilled Trades",
    tag: "Profession Feed",
    title: "Watch electrical, carpentry, plumbing & clinical videos curated for your role",
    desc: "Selecting your profession during sign-in automatically unlocks field-specific walkthroughs, jobs, and peer communities.",
    accent: "from-emerald-500 to-teal-700",
  },
  {
    cat: "Healthcare",
    tag: "Mobile First",
    title: "Full responsive Jobs board & safe-area mobile navigation for Android & iOS",
    desc: "Every header button, call banner, and job application drawer stays comfortably reachable on modern notched phones.",
    accent: "from-indigo-500 to-violet-700",
  },
  {
    cat: "Tech & Cyber",
    tag: "ConnectLn 360 Workflow",
    title: "Switch between Mail, Calls, Calendar, Jobs & RFPs from the 9-dot App Launcher",
    desc: "Zero tab overload — pin your everyday workspace tools on the slim desktop rail while keeping Full Menu one tap away.",
    accent: "from-amber-500 to-orange-600",
  },
]

const FAQ_ITEMS = [
  {
    q: "How do I install ConnectLn on Android or iPhone?",
    a: "Android users can download the official 6 MB ConnectLn APK directly from the Download section or scan the QR code above. iPhone and iPad users can open conectln.com in Safari, tap Share, and select Add to Home Screen for a full-screen mobile app experience.",
  },
  {
    q: "Does ConnectLn support group voice & video calls over the internet?",
    a: "Yes. ConnectLn connects group WebRTC rooms with caller photos, virtual backgrounds, screen sharing, and push notifications across Android APK, iOS Safari, and desktop browsers — with no carrier fees.",
  },
  {
    q: "How are training videos and jobs customized to my profession?",
    a: "When you select your profession during registration or sign in, ConnectLn automatically routes relevant trade, clinical, or engineering videos, jobs, and peer enclaves to your workspace.",
  },
  {
    q: "Do I keep my existing messages, contacts, and profile in the new ConnectLn 360 workspace?",
    a: "Yes. The ConnectLn 360 portal and workspace run on the same live MongoDB/Firebase backend, so every contact, call history, saved post, and profile stays right where you left it.",
  },
  {
    q: "Can I use ConnectLn for free without a paid subscription?",
    a: "Yes. ConnectLn Free includes your verified professional profile, messaging, 1-on-1 and group WebRTC calling, jobs discovery, and profession feed at $0.",
  },
  {
    q: "How do businesses accept RFPs, invoices, and team seats?",
    a: "Open For Business from the 9-dot App Launcher or left rail to access Procurement & RFPs, Seller Center, Invoicing & Escrow, and Company Directories.",
  },
]

export function ConnectLn360PortalLanding() {
  const [activeHeroTab, setActiveHeroTab] = useState<HeroTab>("Core Capabilities")
  const [activeAccordionId, setActiveAccordionId] = useState<string>("together")
  const [promptCat, setPromptCat] = useState<keyof typeof PROMPT_CARDS>("Messages & Calls")
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)
  const promptStripRef = useRef<HTMLDivElement>(null)
  const [activeTourIdx, setActiveTourIdx] = useState(0)
  const [planAudience, setPlanAudience] = useState<"individual" | "business">("individual")
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">("yearly")
  const [activeTipsCat, setActiveTipsCat] = useState<string>("All")
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0])
  const [showIosGuideModal, setShowIosGuideModal] = useState(false)
  const [showNoctisWidget, setShowNoctisWidget] = useState(true)
  const [noctisAnswer, setNoctisAnswer] = useState<string | null>(null)
  const { language, setLanguage, languages } = useLanguage()
  const [selectedCurrency, setSelectedCurrency] =
    useState<keyof typeof FOOTER_CURRENCIES>("USD")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrencyPrice = (rawPrice: string) => {
    const cur = FOOTER_CURRENCIES[selectedCurrency] || FOOTER_CURRENCIES.USD
    if (rawPrice === "Custom") return "Custom"
    if (rawPrice === "$0") return `${cur.symbol}0`
    if (selectedCurrency === "USD") return rawPrice
    const num = Number(rawPrice.replace(/[^0-9.]/g, ""))
    if (!Number.isFinite(num) || num <= 0) return rawPrice
    return `${cur.symbol}${(num * cur.rate).toFixed(2)}`
  }

  const currentOverview =
    OVERVIEW_FEATURES.find((f) => f.id === activeAccordionId) || OVERVIEW_FEATURES[0]

  const currentPrompts = PROMPT_CARDS[promptCat]
  const currentTour = TOUR_TABS[activeTourIdx] || TOUR_TABS[0]
  const currentPlans = PLAN_TIERS[planAudience]
  const visibleTips =
    activeTipsCat === "All"
      ? TIPS_ITEMS
      : TIPS_ITEMS.filter((item) => item.cat === activeTipsCat)

  const handleCopyPrompt = (title: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setCopiedPrompt(title)
    setTimeout(() => setCopiedPrompt((prev) => (prev === title ? null : prev)), 2200)
  }

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  return (
    <div
      className="min-h-screen bg-[#FAF7F2] text-[#0B1F3A] font-sans selection:bg-[#0067B8] selection:text-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* ─── 1. FLOATING PILL STICKY CONNECTLN 360 PORTAL HEADER ─── */}
      <header
        className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border border-[#E7E2DA] bg-white/95 backdrop-blur-md px-3 sm:px-5 py-2 shadow-[0_10px_35px_rgba(11,31,58,0.08)]">
          <Link href="/connectin-portal" className="shrink-0 flex items-center gap-2">
            <ConnectInLogo size="sm" showSubtitle={false} />
            <span className="hidden sm:inline-flex items-center rounded-full bg-[#FAF7F2] border border-[#E7E2DA] px-2 py-0.5 text-[11px] font-bold text-[#0067B8]">
              360 Portal
            </span>
          </Link>

          <nav
            aria-label="Portal sections"
            className="hidden lg:flex items-center gap-4 text-xs font-semibold text-[#4B5563]"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap hover:text-[#0B1F3A] hover:underline underline-offset-8 decoration-2 decoration-[#0067B8] transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/connectin-login?mode=join"
              className="rounded-full bg-[#0B1F3A] hover:bg-[#163259] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold whitespace-nowrap transition-colors shadow-xs"
            >
              Create free account
            </Link>
            <Link
              href="/connectin-login"
              className="rounded-full border border-[#0B1F3A]/30 bg-white hover:bg-[#FAF7F2] text-[#0B1F3A] px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold whitespace-nowrap transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. OVERVIEW HERO + INTERACTIVE ACCORDION + PREVIEW FRAME ─── */}
      <section id="overview" className="mx-auto max-w-6xl px-4 sm:px-8 pt-10 sm:pt-14 pb-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
          OVERVIEW · CONNECTLN 360 WORKSPACE
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl sm:text-5xl font-semibold tracking-tight text-[#0B1F3A] leading-[1.12]">
          One unified command center for your entire profession
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {HERO_TABS.map((tab) => {
            const selected = activeHeroTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveHeroTab(tab)
                  const match = OVERVIEW_FEATURES.find((f) => f.tab === tab)
                  if (match) setActiveAccordionId(match.id)
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selected
                    ? "bg-[#0B1F3A] text-white shadow-xs"
                    : "bg-[#EAE5DC] text-[#0B1F3A] hover:bg-[#DFD8CC]"
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* ConnectLn 360 Universe Unified Ecosystem Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#E7E2DA] bg-white/90 px-4 py-3 shadow-2xs">
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0067B8] pr-1">
            360 Universe:
          </span>
          <Link
            href="/connectin"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E2DA] bg-[#FAF7F2] hover:border-[#0067B8] px-3 py-1 text-xs font-bold text-[#0B1F3A] transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-[#0067B8]" />
            <span>ConnectLn Core</span>
            <span className="text-[10px] font-mono text-[#6B7280]">conectln.com</span>
          </Link>
          <Link
            href="/connectin?tab=noctissocial"
            className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-50/70 hover:border-fuchsia-400 px-3 py-1 text-xs font-bold text-fuchsia-900 transition-colors"
          >
            <PlayCircle className="h-3.5 w-3.5 text-fuchsia-600" />
            <span>Noctis Social</span>
            <span className="text-[10px] font-mono text-fuchsia-700/80">noctis.social</span>
          </Link>
          <a
            href="https://noctis.social"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Noctis Social directly"
            className="text-[10px] font-semibold text-fuchsia-700 hover:underline -ml-1 mr-1"
            title="https://noctis.social"
          >
            ↗
          </a>
          <Link
            href="/connectin?tab=noctisclinic"
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/70 hover:border-cyan-400 px-3 py-1 text-xs font-bold text-cyan-950 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-600" />
            <span>Noctis Clinic</span>
            <span className="text-[10px] font-mono text-cyan-800/80">www.dstrike.app/noctis</span>
          </Link>
          <a
            href="https://www.dstrike.app/noctis"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Noctis Clinic directly"
            className="text-[10px] font-semibold text-cyan-800 hover:underline -ml-1"
            title="https://www.dstrike.app/noctis"
          >
            ↗
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Interactive Accordion */}
          <div className="lg:col-span-5 divide-y divide-[#E7E2DA] border-t border-b border-[#E7E2DA]">
            {OVERVIEW_FEATURES.map((feat) => {
              const isOpen = activeAccordionId === feat.id
              return (
                <div key={feat.id} className="relative py-4 pl-4">
                  {isOpen && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#0067B8]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAccordionId(feat.id)
                      setActiveHeroTab(feat.tab)
                    }}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-semibold text-[#0B1F3A]">
                      {feat.title}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#0B1F3A] shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#4B5563] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">
                      {feat.body}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Layered Desktop + Mobile Preview Card */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0078D4] via-[#1E56A0] to-[#3B82F6] p-4 sm:p-7 shadow-[0_24px_60px_rgba(11,31,58,0.14)] overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -left-8 h-44 w-44 rounded-3xl bg-amber-200/80 rotate-12 pointer-events-none"
              />
              {/* Desktop Mock Window */}
              <div className="relative z-10 rounded-2xl bg-white border border-white/80 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4F1EC] border-b border-[#E7E2DA]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0067B8]" />
                    <span className="text-xs font-bold text-[#0B1F3A]">
                      {currentOverview.previewTitle}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                    {currentOverview.previewBadge}
                  </span>
                </div>
                <div className="grid grid-cols-12 min-h-[230px]">
                  {/* Mini Workspace Rail */}
                  <div className="col-span-2 bg-[#FAF7F2] border-r border-[#E7E2DA] py-3 flex flex-col items-center gap-3 text-[#4B5563]">
                    <Mail className="h-4 w-4 text-[#0067B8]" />
                    <PhoneCall className="h-4 w-4" />
                    <Calendar className="h-4 w-4" />
                    <Briefcase className="h-4 w-4" />
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  {/* Rows */}
                  <div className="col-span-10 p-3.5 space-y-2.5 bg-white">
                    {currentOverview.previewRows.map((row) => (
                      <div
                        key={row.subject}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#EFECE6] bg-[#FAF7F2]/60 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B1F3A] truncate">
                              {row.sender}
                            </span>
                            <span className="rounded bg-sky-100 text-[#0067B8] px-1.5 py-0.5 text-[10px] font-bold">
                              {row.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[#4B5563] truncate mt-0.5">
                            {row.subject}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-[#6B7280] shrink-0">
                          {row.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Mobile Frame Overlay */}
              <div className="hidden sm:block relative z-20 ml-auto -mt-20 mr-2 w-48 rounded-2xl border-4 border-[#0B1F3A] bg-white shadow-2xl overflow-hidden">
                <div className="bg-[#0067B8] px-3 py-2 text-white flex items-center justify-between">
                  <span className="text-[11px] font-bold">ConnectLn Mobile</span>
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
                <div className="p-2.5 space-y-1.5 text-[10.5px]">
                  <div className="rounded-lg bg-[#FAF7F2] px-2 py-1.5 font-semibold text-[#0B1F3A]">
                    Incoming HD Call Ready
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-2 py-1.5 font-semibold text-emerald-800">
                    Jobs &amp; Videos Synced
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. NOCTIS AI PROMPT CARDS CAROUSEL ─── */}
      <section id="noctis-ai" className="mx-auto max-w-6xl px-4 sm:px-8 py-14 border-t border-[#E7E2DA]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
          NOCTIS AI WORKFLOWS
        </p>
        <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Accelerate client replies, calls &amp; career moves with Noctis AI
        </h2>
        <p className="mt-2 text-sm text-[#4B5563]">
          Copy any prompt below and run it inside ConnectLn Ask Noctis after signing in.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(Object.keys(PROMPT_CARDS) as Array<keyof typeof PROMPT_CARDS>).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setPromptCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                promptCat === cat
                  ? "bg-[#0B1F3A] text-white"
                  : "bg-[#EAE5DC] text-[#0B1F3A] hover:bg-[#DFD8CC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          ref={promptStripRef}
          className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {currentPrompts.map((card) => {
            const Icon =
              card.icon === "mail"
                ? Mail
                : card.icon === "search"
                ? Search
                : card.icon === "video"
                ? Video
                : Sparkles
            const isCopied = copiedPrompt === card.title
            return (
              <div
                key={card.title}
                className="flex flex-col justify-between rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_8px_24px_rgba(11,31,58,0.04)] hover:shadow-[0_14px_30px_rgba(11,31,58,0.08)] transition-shadow"
              >
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#0067B8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold text-[#6B7280]">Sample workflow:</p>
                  <h3 className="mt-0.5 text-base font-bold text-[#0B1F3A]">{card.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                    &ldquo;{card.prompt}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(card.title, card.prompt)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] hover:underline cursor-pointer"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Copied to clipboard" : "Copy prompt"}</span>
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const cats = Object.keys(PROMPT_CARDS) as Array<keyof typeof PROMPT_CARDS>
              const prevIdx = (cats.indexOf(promptCat) - 1 + cats.length) % cats.length
              setPromptCat(cats[prevIdx])
            }}
            aria-label="Previous prompt category"
            className="h-9 w-9 rounded-full border border-[#D4CEC3] bg-white hover:bg-[#F3EFE8] flex items-center justify-center text-[#0B1F3A] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const cats = Object.keys(PROMPT_CARDS) as Array<keyof typeof PROMPT_CARDS>
              const nextIdx = (cats.indexOf(promptCat) + 1) % cats.length
              setPromptCat(cats[nextIdx])
            }}
            aria-label="Next prompt category"
            className="h-9 w-9 rounded-full border border-[#0B1F3A] bg-white hover:bg-[#0B1F3A] hover:text-white flex items-center justify-center text-[#0B1F3A] transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── 4. INTERACTIVE PREVIEW — EXPLORE CONNECTLN 360 IN ACTION ─── */}
      <section
        id="tour"
        className="relative overflow-hidden py-16 border-t border-[#E7E2DA] bg-gradient-to-b from-[#FAF7F2] via-[#F7EFEA] to-[#FAF7F2]"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
            INTERACTIVE PREVIEW
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
            Explore ConnectLn 360 in Action
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-sm text-[#4B5563]">
            One clean command center for email-grade threads, HD group calls, job leads, and your industry network — on desktop, iOS, and Android.
          </p>

          <div className="mt-7 mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-[#E7E2DA] bg-white overflow-hidden shadow-xs">
            {TOUR_TABS.map((tItem, idx) => {
              const active = idx === activeTourIdx
              return (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setActiveTourIdx(idx)}
                  className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    active
                      ? "border-[#0067B8] text-[#0B1F3A] bg-[#FAF7F2]/60"
                      : "border-transparent text-[#4B5563] hover:text-[#0B1F3A]"
                  }`}
                >
                  {tItem.title}
                </button>
              )
            })}
          </div>

          <p className="mt-5 text-sm font-semibold text-[#0B1F3A]">{currentTour.heading}</p>
          <p className="mt-1 max-w-xl mx-auto text-xs text-[#4B5563]">{currentTour.caption}</p>

          {/* Interactive Split App Frame */}
          <div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-[#E7E2DA] bg-white shadow-[0_24px_60px_rgba(11,31,58,0.12)] overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F4F1EC] border-b border-[#E7E2DA]">
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-0.5 p-1 rounded bg-white border border-[#E7E2DA]">
                  <span className="h-1 w-1 rounded-full bg-[#0067B8]" />
                  <span className="h-1 w-1 rounded-full bg-emerald-600" />
                  <span className="h-1 w-1 rounded-full bg-amber-500" />
                  <span className="h-1 w-1 rounded-full bg-indigo-500" />
                  <span className="h-1 w-1 rounded-full bg-rose-500" />
                  <span className="h-1 w-1 rounded-full bg-[#0B1F3A]" />
                </div>
                <span className="text-xs font-bold text-[#0B1F3A]">ConnectLn 360</span>
              </div>
              <span className="text-[11px] font-medium text-[#6B7280] hidden sm:inline">
                Home · Mail · Calls · Jobs · Business
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Main Compose / Thread Pane */}
              <div className="md:col-span-8 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-[#E7E2DA] space-y-3">
                <div className="flex items-center gap-2">
                  <Link
                    href="/connectin-login"
                    className="rounded-lg bg-[#0067B8] text-white px-3 py-1.5 text-xs font-bold"
                  >
                    Open Live Workspace
                  </Link>
                  <span className="rounded-lg bg-[#FAF7F2] border border-[#E7E2DA] px-2.5 py-1.5 text-[11px] font-semibold text-[#4B5563]">
                    Encrypted E2EE
                  </span>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-[#FAF7F2]/70 p-3.5 space-y-2">
                  <p className="text-[11px] text-[#6B7280]">
                    <span className="font-bold text-[#0B1F3A]">To:</span> {currentTour.composeTo}
                  </p>
                  <p className="text-sm font-bold text-[#0B1F3A]">{currentTour.composeSubject}</p>
                  <p className="text-xs leading-relaxed text-[#4B5563]">
                    {currentTour.composePreview}
                  </p>
                </div>
              </div>

              {/* Right Noctis AI Pane */}
              <div className="md:col-span-4 p-4 sm:p-5 bg-[#FAF7F2]/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0067B8]" />
                  <span className="text-xs font-bold text-[#0B1F3A]">Noctis AI Assistant</span>
                </div>
                <div className="rounded-xl border border-[#E7E2DA] bg-white p-3 text-xs text-[#0B1F3A] font-medium shadow-2xs">
                  {currentTour.aiSuggestion}
                </div>
                <Link
                  href="/connectin-login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] hover:underline"
                >
                  <span>Try live in ConnectLn</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. PLANS & TIERS COMPARISON ─── */}
      <section id="plans" className="mx-auto max-w-6xl px-4 sm:px-8 py-16 border-t border-[#E7E2DA]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
          PLANS &amp; ACCESS
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Start free, upgrade as your crew grows
        </h2>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(["individual", "business"] as const).map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setPlanAudience(aud)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                  planAudience === aud
                    ? "bg-[#0B1F3A] text-white"
                    : "bg-[#EAE5DC] text-[#0B1F3A] hover:bg-[#DFD8CC]"
                }`}
              >
                {aud === "individual" ? "For individuals" : "For business"}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-full border border-[#E7E2DA] bg-white p-1 text-xs font-bold">
            {(["yearly", "monthly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-full px-3 py-1 capitalize cursor-pointer transition-colors ${
                  billingCycle === cycle
                    ? "bg-[#0B1F3A] text-white"
                    : "text-[#4B5563] hover:text-[#0B1F3A]"
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {currentPlans.map((plan) => {
            const displayPrice =
              billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
            const displayUnit =
              billingCycle === "yearly"
                ? plan.unit
                : (plan as { unitMonthly?: string }).unitMonthly || plan.unit
            return (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-2xl border bg-white overflow-hidden shadow-[0_10px_28px_rgba(11,31,58,0.05)] ${
                  plan.highlight ? "border-[#0B1F3A] ring-1 ring-[#0B1F3A]" : "border-[#E7E2DA]"
                }`}
              >
                <div>
                  {plan.highlight && (
                    <div className="bg-[#0B1F3A] px-4 py-1.5 text-center text-[11px] font-bold text-white">
                      {plan.badge || "Most Popular"}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-base font-bold text-[#0B1F3A]">{plan.name}</h3>
                    <div className="mt-5">
                      {billingCycle === "yearly" && plan.strikePrice && (
                        <p className="text-xl font-medium text-[#6B7280] line-through">
                          {formatCurrencyPrice(plan.strikePrice)}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-[#0B1F3A]">
                        {formatCurrencyPrice(displayPrice)}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">/{displayUnit}</p>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-[#4B5563]">
                      {plan.description}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href="/connectin-login?mode=join"
                    className={`block w-full rounded-xl py-2.5 text-center text-xs font-bold transition-colors ${
                      plan.highlight
                        ? "bg-[#0B1F3A] hover:bg-[#163259] text-white"
                        : "bg-[#0067B8] hover:bg-[#00559B] text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── 6. DOWNLOAD HUB — DESKTOP, ANDROID APK, iOS & WEB PORTAL ─── */}
      <section id="download-app" className="mx-auto max-w-6xl px-4 sm:px-8 py-16 border-t border-[#E7E2DA] text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
          DOWNLOAD THE APP
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Stay connected on Android, iPhone, Desktop &amp; Web
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-sm text-[#4B5563]">
          Get instant ring alerts, group calls, messages, and profession-matched videos on any device.
        </p>

        <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {/* Android APK */}
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">Android (Direct APK)</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                Download the native Android package (connectln.apk) with safe-area layouts, incoming call ring alerts, and zero shared session leaks.
              </p>
            </div>
            <a
              href="/connectln.apk"
              download="connectln.apk"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] underline underline-offset-4 hover:text-[#0B1F3A]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download ConnectLn APK</span>
            </a>
          </div>

          {/* iOS */}
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0067B8] border border-sky-200">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">iOS (iPhone &amp; iPad)</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                Full-screen iOS Web App supporting Safari notch safe areas, Push call alerts, WebRTC camera switching, and home-screen install.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIosGuideModal(true)}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] underline underline-offset-4 hover:text-[#0B1F3A] text-left cursor-pointer"
            >
              <span>View iPhone &amp; iPad Setup Guide</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Web Portal */}
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">Web Portal</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                Sign straight in from any modern browser to access the full ConnectLn 360 suite without installing anything.
              </p>
            </div>
            <Link
              href="/connectin-login"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] underline underline-offset-4 hover:text-[#0B1F3A]"
            >
              <span>Open ConnectLn Web Portal</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Windows */}
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Laptop className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">Windows</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                Install as a standalone Edge or Chrome desktop app with picture-in-picture call windows and instant taskbar access.
              </p>
            </div>
            <Link
              href="/connectin"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] underline underline-offset-4 hover:text-[#0B1F3A]"
            >
              <span>Launch on Windows</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* macOS */}
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-[#0B1F3A] border border-zinc-200">
                <Laptop className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0B1F3A]">macOS</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                Runs smoothly on Apple Silicon &amp; Intel Macs via Safari Add-to-Dock or Chrome with hardware-accelerated WebRTC video.
              </p>
            </div>
            <Link
              href="/connectin"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0067B8] underline underline-offset-4 hover:text-[#0B1F3A]"
            >
              <span>Launch on macOS</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. DEEP NAVY MOBILE QR BANNER ─── */}
      <section id="mobile-app" className="w-full bg-[#1E355E] py-16 px-4 sm:px-8 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Take ConnectLn everywhere on mobile
          </h2>
          <p className="mt-2.5 text-sm text-sky-100">
            Scan the QR code below on your iPhone or Android camera to open the portal &amp; mobile downloads right on your phone.
          </p>

          <div className="mt-8 inline-flex flex-col items-center rounded-2xl bg-white p-4 shadow-2xl">
            <svg
              viewBox="0 0 33 33"
              width={180}
              height={180}
              role="img"
              aria-label="QR Code for ConnectLn 360 Portal"
              className="block"
            >
              <path d={PORTAL_QR_PATH} fill="#0B1F3A" fillRule="nonzero" />
            </svg>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/connectln.apk"
              download="connectln.apk"
              className="rounded-full bg-white text-[#0B1F3A] hover:bg-sky-50 px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Android APK</span>
            </a>
            <button
              type="button"
              onClick={() => setShowIosGuideModal(true)}
              className="rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs font-bold cursor-pointer transition-colors"
            >
              iPhone Install Instructions
            </button>
          </div>
        </div>
      </section>

      {/* ─── 8. CONNECTLN 360 SUITE APPS ─── */}
      <section id="suite" className="mx-auto max-w-6xl px-4 sm:px-8 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
              CONNECTLN 360 SUITE
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
              Explore every connected ConnectLn workspace app
            </h2>
          </div>
          <Link
            href="/connectin"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7E2DA] bg-white px-4 py-2 text-xs font-bold text-[#0B1F3A] hover:bg-[#F3EFE8] transition-colors"
          >
            <span>Open Full Suite</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUITE_APPS.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.name}
                className="flex flex-col justify-between rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs ${app.bg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {app.externalUrl && (
                      <a
                        href={app.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[#E7E2DA] bg-[#FAF7F2] px-2.5 py-1 text-[10.5px] font-semibold text-[#4B5563] hover:border-[#0067B8] hover:text-[#0067B8] transition-colors"
                        title={`Visit ${app.externalUrl}`}
                      >
                        <span>{app.domainLabel}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0B1F3A]">{app.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">{app.desc}</p>
                </div>
                <Link
                  href={app.href || "/connectin"}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#0B1F3A] hover:text-[#0067B8]"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1F3A] text-white">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span>{app.cta}</span>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── 9. NEWS & PROFESSION TIPS ─── */}
      <section
        id="tips"
        className="border-t border-[#E7E2DA] bg-gradient-to-tr from-[#FCE9DF]/50 via-[#FAF7F2] to-[#E6F0FA]/60 py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
            NEWS &amp; TIPS
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
            Latest updates &amp; guides from ConnectLn 360
          </h2>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {["All", "What's new", "Skilled Trades", "Healthcare", "Tech & Cyber"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTipsCat(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                  activeTipsCat === cat
                    ? "bg-[#0B1F3A] text-white"
                    : "bg-white border border-[#E7E2DA] text-[#0B1F3A] hover:bg-[#F3EFE8]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleTips.map((tip) => (
              <div
                key={tip.title}
                className="flex flex-col justify-between rounded-2xl border border-[#E7E2DA] bg-white overflow-hidden shadow-xs"
              >
                <div>
                  <div
                    className={`h-28 bg-gradient-to-br ${tip.accent} p-4 flex items-end justify-between text-white`}
                  >
                    <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold">
                      {tip.cat}
                    </span>
                    <Tv className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold text-[#0067B8]">{tip.tag}</p>
                    <h3 className="mt-1 text-sm font-bold text-[#0B1F3A] leading-snug">
                      {tip.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">{tip.desc}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Link
                    href="/connectin-login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] hover:text-[#0067B8]"
                  >
                    <span>Explore feature</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. NUMBERED FAQ SECTION (01/ – 06/) ─── */}
      <section id="faq" className="mx-auto max-w-6xl px-4 sm:px-8 py-16 border-t border-[#E7E2DA]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A] uppercase">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenFaqIndices(FAQ_ITEMS.map((_, idx) => idx))}
              className="rounded-lg border border-[#0B1F3A] bg-white px-3 py-1.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F3EFE8] cursor-pointer"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setOpenFaqIndices([])}
              className="rounded-lg border border-[#E7E2DA] bg-white px-3 py-1.5 text-xs font-bold text-[#6B7280] hover:text-[#0B1F3A] cursor-pointer"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="mt-8 divide-y divide-[#E7E2DA] border-t border-b border-[#E7E2DA]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndices.includes(idx)
            const num = String(idx + 1).padStart(2, "0")
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-8">
                    <span className="text-xs font-mono font-bold text-[#6B7280] pt-0.5 sm:pt-0">
                      {num}/
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#0B1F3A]">
                      {item.q}
                    </span>
                  </div>
                  <span className="h-8 w-8 shrink-0 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center">
                    <Plus
                      className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 pl-9 sm:pl-14 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#4B5563]">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── ENTERPRISE MIDNIGHT CONNECTLN 360 PORTAL FOOTER ─── */}
      <footer className="bg-gradient-to-b from-[#04071E] via-[#060B2B] to-[#040822] text-white border-t border-white/10 pt-14 pb-24 sm:pb-16 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Left Brand & Utility Column */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <Link href="/connectin-portal" className="inline-flex items-center gap-2.5">
                <ConnectInLogo size="md" showSubtitle={false} inverted />
                <span className="rounded-full bg-[#0067B8]/30 border border-sky-400/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-200">
                  360
                </span>
              </Link>

              {/* Download Center Card */}
              <a
                href="#download-app"
                className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 max-w-[270px] transition-colors group"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0067B8] shadow-md group-hover:scale-105 transition-transform">
                  <Download className="h-5 w-5" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white leading-tight">Download Center</p>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Get the most out of ConnectLn 360
                  </p>
                </div>
              </a>

              {/* Live Language & Currency Selectors */}
              <div className="space-y-2.5 pt-1">
                <select
                  aria-label="Select portal language"
                  value={mounted ? language : "en"}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full max-w-[270px] rounded-lg border border-white/15 bg-[#12193A] px-3.5 py-2.5 text-xs font-semibold text-white cursor-pointer focus:border-sky-400 focus:outline-none"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#0B1230] text-white">
                      {lang.name}
                      {lang.localName && lang.localName !== lang.name ? ` · ${lang.localName}` : ""}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Select display currency"
                  value={selectedCurrency}
                  onChange={(e) =>
                    setSelectedCurrency(e.target.value as keyof typeof FOOTER_CURRENCIES)
                  }
                  className="w-full max-w-[270px] rounded-lg border border-white/15 bg-[#12193A] px-3.5 py-2.5 text-xs font-semibold text-white cursor-pointer focus:border-sky-400 focus:outline-none block"
                >
                  {Object.values(FOOTER_CURRENCIES).map((cur) => (
                    <option key={cur.code} value={cur.code} className="bg-[#0B1230] text-white">
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-400 font-medium">Get in touch</p>
              <div className="space-y-1 text-sm font-semibold text-white">
                <p>
                  <a href="mailto:support@conectln.com" className="hover:text-sky-300 transition-colors">
                    support@conectln.com
                  </a>
                </p>
                <p className="text-xs text-slate-300 font-normal flex flex-wrap items-center gap-3">
                  <Link href="/connectin" className="hover:text-white hover:underline">
                    conectln.com
                  </Link>
                  <span aria-hidden="true">·</span>
                  <a
                    href="https://www.expediteconsults.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    expediteconsults.com
                  </a>
                </p>
              </div>

              {/* ConnectLn 360 Ecosystem & Social Icon Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  href="/connectin"
                  aria-label="ConnectLn Core Workspace"
                  title="ConnectLn Core (/connectin)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                </Link>
                <a
                  href="https://noctis.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Noctis Social"
                  title="Noctis Social (noctis.social)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                </a>
                <a
                  href="https://www.dstrike.app/noctis"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Noctis Clinic"
                  title="Noctis Clinic (www.dstrike.app/noctis)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Zap className="h-4 w-4" />
                </a>
                <a
                  href="https://expedite-consults.vercel.app/launchpad"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Expedite Launchpad"
                  title="Expedite Launchpad (67+ Platforms)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <a
                  href="https://expedite-consults.vercel.app/trueplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TruePlace HomeOS"
                  title="TruePlace Real Estate & HomeOS"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: About */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">About</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#overview" className="hover:text-white hover:underline transition-colors">
                  ConnectLn 360 Overview
                </a>
              </li>
              <li>
                <Link href="/connectin" className="hover:text-white hover:underline transition-colors">
                  ConnectLn Workspace
                </Link>
              </li>
              <li>
                <a
                  href="https://noctis.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Noctis Social
                </a>
              </li>
              <li>
                <a
                  href="https://www.dstrike.app/noctis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Noctis Clinic
                </a>
              </li>
              <li>
                <a
                  href="https://expedite-consults.vercel.app/launchpad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Expedite Launchpad
                </a>
              </li>
              <li>
                <a
                  href="https://expedite-consults.vercel.app/trueplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  TruePlace HomeOS
                </a>
              </li>
              <li>
                <a
                  href="https://expedite-consults.vercel.app/trueplace?tab=hometruth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  TruePlace HomeTruth
                </a>
              </li>
              <li>
                <a
                  href="https://expedite-consults.vercel.app/trueplace?tab=passport&intake=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Housing Passport Intake
                </a>
              </li>
              <li>
                <a
                  href="https://www.expediteconsults.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Enterprise Advisory
                </a>
              </li>
              <li>
                <Link href="/connectin?tab=jobs" className="hover:text-white hover:underline transition-colors">
                  Verified Jobs
                </Link>
              </li>
              <li>
                <Link href="/connectin?tab=learning" className="hover:text-white hover:underline transition-colors">
                  Learning Academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Download */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">Download</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/connectin-login" className="hover:text-white hover:underline transition-colors">
                  ConnectLn 360 Web Portal
                </Link>
              </li>
              <li>
                <a
                  href="/connectln.apk"
                  download="connectln.apk"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Android Direct APK
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowIosGuideModal(true)}
                  className="text-left hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  iPhone &amp; iPad Web App
                </button>
              </li>
              <li>
                <a href="#download-app" className="hover:text-white hover:underline transition-colors">
                  Windows Desktop App
                </a>
              </li>
              <li>
                <a href="#download-app" className="hover:text-white hover:underline transition-colors">
                  macOS Desktop App
                </a>
              </li>
              <li>
                <a href="#mobile-app" className="hover:text-white hover:underline transition-colors">
                  Mobile QR Code
                </a>
              </li>
              <li>
                <Link href="/connectin?tab=vibecomms" className="hover:text-white hover:underline transition-colors">
                  Vibe Calls &amp; Studio
                </Link>
              </li>
              <li>
                <a
                  href="https://desk-note.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  DeskNote E2EE App
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Workspace & Plans */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">Workspace &amp; Plans</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link
                  href="/connectin-login?mode=join"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/connectin-login" className="hover:text-white hover:underline transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <a href="#plans" className="hover:text-white hover:underline transition-colors">
                  Plans &amp; Pricing
                </a>
              </li>
              <li>
                <a href="#tour" className="hover:text-white hover:underline transition-colors">
                  Interactive Preview
                </a>
              </li>
              <li>
                <a href="#noctis-ai" className="hover:text-white hover:underline transition-colors">
                  Noctis AI Workflows
                </a>
              </li>
              <li>
                <Link
                  href="/connectin?tab=workbusiness"
                  className="hover:text-white hover:underline transition-colors"
                >
                  For Business &amp; RFPs
                </Link>
              </li>
              <li>
                <Link
                  href="/connectin?tab=marketplace"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Enterprise Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/connectin?tab=veterans"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Veterans Network
                </Link>
              </li>
              <li>
                <Link
                  href="/connectin?tab=franchises"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Franchise Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">Support</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#faq" className="hover:text-white hover:underline transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowNoctisWidget(true)}
                  className="text-left hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  Ask Noctis Assistant
                </button>
              </li>
              <li>
                <Link href="/connectin" className="hover:text-white hover:underline transition-colors">
                  Account &amp; Passkeys
                </Link>
              </li>
              <li>
                <Link
                  href="/connectin?tab=careersuite"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Resume &amp; CareerSuite
                </Link>
              </li>
              <li>
                <Link
                  href="/connectin?tab=pulserooms"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Pulse Audio Rooms
                </Link>
              </li>
              <li>
                <a href="#tips" className="hover:text-white hover:underline transition-colors">
                  Latest Updates &amp; Guides
                </a>
              </li>
              <li>
                <a
                  href="https://www.expediteconsults.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Expedite Support Desk
                </a>
              </li>
              <li>
                <Link href="/connectin-login" className="hover:text-white hover:underline transition-colors">
                  Privacy, Security &amp; Trust Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mx-auto max-w-6xl mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>© 2026 Expedite Consults LLC · ConnectLn 360 Universe. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/connectin-login" className="hover:text-white hover:underline">
              Sign in
            </Link>
            <Link href="/connectin-login?mode=join" className="hover:text-white hover:underline">
              Create Account
            </Link>
            <a href="/connectln.apk" download="connectln.apk" className="hover:text-white hover:underline">
              Android APK
            </a>
            <a
              href="https://www.expediteconsults.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:underline"
            >
              Expedite Consults
            </a>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING BOTTOM-RIGHT "ASK NOCTIS" HELPER CARD ─── */}
      {showNoctisWidget ? (
        <div className="fixed bottom-4 right-4 z-40 w-[300px] sm:w-[330px] rounded-2xl border border-[#E7E2DA] bg-white p-4 shadow-[0_18px_45px_rgba(11,31,58,0.16)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#0B1F3A] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#0067B8]" />
                <span>Ask Noctis</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-[#0B1F3A]">
                Need help getting started?
              </p>
              <p className="mt-0.5 text-[11px] text-[#4B5563]">
                Instant guidance on mobile setup, group calls, and selecting your profession.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNoctisWidget(false)}
              aria-label="Minimize Ask Noctis"
              className="rounded-lg p-1 text-[#6B7280] hover:bg-[#FAF7F2] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {noctisAnswer && (
            <div className="mt-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7E2DA] p-2.5 text-[11px] leading-relaxed text-[#0B1F3A]">
              {noctisAnswer}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/connectin-login"
              className="rounded-lg bg-[#0067B8] hover:bg-[#00559B] text-white px-3.5 py-1.5 text-xs font-bold transition-colors"
            >
              Open Workspace
            </Link>
            <button
              type="button"
              onClick={() =>
                setNoctisAnswer(
                  "Choose 'Create free account' to pick your profession, or tap 'Download Android APK' / iOS Guide to install ConnectLn on mobile."
                )
              }
              className="rounded-lg border border-[#E7E2DA] bg-white hover:bg-[#FAF7F2] text-[#0B1F3A] px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              Quick tour
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNoctisWidget(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full bg-[#0B1F3A] text-white px-4 py-2.5 text-xs font-bold shadow-xl hover:bg-[#163259] cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-sky-300" />
          <span>Ask Noctis</span>
        </button>
      )}

      {/* ─── iPHONE / iPAD SAFARI INSTALLATION MODAL ─── */}
      {showIosGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setShowIosGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#E7E2DA] bg-white p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0B1F3A]">
                Install ConnectLn on iPhone &amp; iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuideModal(false)}
                className="rounded-lg p-1 text-[#6B7280] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-2.5 text-xs text-[#4B5563] list-decimal pl-4">
              <li>
                Open <span className="font-bold text-[#0B1F3A]">https://conectln.com/connectin</span> in{" "}
                <span className="font-bold text-[#0B1F3A]">Safari</span> on your iPhone or iPad.
              </li>
              <li>
                Tap the <span className="font-bold text-[#0B1F3A]">Share</span> icon at the bottom of Safari.
              </li>
              <li>
                Scroll down and tap <span className="font-bold text-[#0B1F3A]">Add to Home Screen</span>, then tap <span className="font-bold text-[#0B1F3A]">Add</span>.
              </li>
            </ol>
            <div className="pt-2 flex items-center justify-end gap-2">
              <Link
                href="/connectin-login"
                className="rounded-xl bg-[#0067B8] text-white px-4 py-2 text-xs font-bold"
              >
                Open Web App Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
