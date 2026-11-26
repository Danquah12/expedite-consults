"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  Mail,
  MessageSquare,
  PhoneCall,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  Users,
  Video,
  X,
} from "lucide-react"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"

const ADMIN_QR_PATH =
  "M2,2H3V3H2zM3,2H4V3H3zM4,2H5V3H4zM5,2H6V3H5zM6,2H7V3H6zM7,2H8V3H7zM8,2H9V3H8zM11,2H12V3H11zM12,2H13V3H12zM13,2H14V3H13zM14,2H15V3H14zM15,2H16V3H15zM18,2H19V3H18zM19,2H20V3H19zM20,2H21V3H20zM21,2H22V3H21zM22,2H23V3H22zM24,2H25V3H24zM25,2H26V3H25zM26,2H27V3H26zM27,2H28V3H27zM28,2H29V3H28zM29,2H30V3H29zM30,2H31V3H30zM2,3H3V4H2zM8,3H9V4H8zM11,3H12V4H11zM14,3H15V4H14zM16,3H17V4H16zM17,3H18V4H17zM18,3H19V4H18zM19,3H20V4H19zM22,3H23V4H22zM24,3H25V4H24zM30,3H31V4H30zM2,4H3V5H2zM4,4H5V5H4zM5,4H6V5H5zM6,4H7V5H6zM8,4H9V5H8zM10,4H11V5H10zM14,4H15V5H14zM17,4H18V5H17zM21,4H22V5H21zM24,4H25V5H24zM26,4H27V5H26zM27,4H28V5H27zM28,4H29V5H28zM30,4H31V5H30zM2,5H3V6H2zM4,5H5V6H4zM5,5H6V6H5zM6,5H7V6H6zM8,5H9V6H8zM10,5H11V6H10zM11,5H12V6H11zM12,5H13V6H12zM17,5H18V6H17zM19,5H20V6H19zM24,5H25V6H24zM26,5H27V6H26zM27,5H28V6H27zM28,5H29V6H28zM30,5H31V6H30zM2,6H3V7H2zM4,6H5V7H4zM5,6H6V7H5zM6,6H7V7H6zM8,6H9V7H8zM10,6H11V7H10zM11,6H12V7H11zM14,6H15V7H14zM15,6H16V7H15zM18,6H19V7H18zM19,6H20V7H19zM20,6H21V7H20zM21,6H22V7H21zM22,6H23V7H22zM24,6H25V7H24zM26,6H27V7H26zM27,6H28V7H27zM28,6H29V7H28zM30,6H31V7H30zM2,7H3V8H2zM8,7H9V8H8zM10,7H11V8H10zM11,7H12V8H11zM13,7H14V8H13zM15,7H16V8H15zM16,7H17V8H16zM17,7H18V8H17zM19,7H20V8H19zM22,7H23V8H22zM24,7H25V8H24zM30,7H31V8H30zM2,8H3V9H2zM3,8H4V9H3zM4,8H5V9H4zM5,8H6V9H5zM6,8H7V9H6zM7,8H8V9H7zM8,8H9V9H8zM10,8H11V9H10zM12,8H13V9H12zM14,8H15V9H14zM16,8H17V9H16zM18,8H19V9H18zM20,8H21V9H20zM22,8H23V9H22zM24,8H25V9H24zM25,8H26V9H25zM26,8H27V9H26zM27,8H28V9H27zM28,8H29V9H28zM29,8H30V9H29zM30,8H31V9H30zM10,9H11V10H10zM11,9H12V10H11zM12,9H13V10H12zM13,9H14V10H13zM14,9H15V10H14zM15,9H16V10H15zM17,9H18V10H17zM18,9H19V10H18zM20,9H21V10H20zM21,9H22V10H21zM22,9H23V10H22zM2,10H3V11H2zM4,10H5V11H4zM5,10H6V11H5zM6,10H7V11H6zM7,10H8V11H7zM8,10H9V11H8zM13,10H14V11H13zM16,10H17V11H16zM17,10H18V11H17zM18,10H19V11H18zM19,10H20V11H19zM21,10H22V11H21zM24,10H25V11H24zM25,10H26V11H25zM26,10H27V11H26zM27,10H28V11H27zM28,10H29V11H28zM2,11H3V12H2zM4,11H5V12H4zM5,11H6V12H5zM10,11H11V12H10zM12,11H13V12H12zM18,11H19V12H18zM19,11H20V12H19zM20,11H21V12H20zM21,11H22V12H21zM23,11H24V12H23zM24,11H25V12H24zM25,11H26V12H25zM26,11H27V12H26zM30,11H31V12H30zM2,12H3V13H2zM4,12H5V13H4zM6,12H7V13H6zM7,12H8V13H7zM8,12H9V13H8zM10,12H11V13H10zM11,12H12V13H11zM12,12H13V13H12zM13,12H14V13H13zM17,12H18V13H17zM19,12H20V13H19zM22,12H23V13H22zM23,12H24V13H23zM25,12H26V13H25zM26,12H27V13H26zM2,13H3V14H2zM3,13H4V14H3zM10,13H11V14H10zM11,13H12V14H11zM12,13H13V14H12zM16,13H17V14H16zM20,13H21V14H20zM22,13H23V14H22zM24,13H25V14H24zM25,13H26V14H25zM26,13H27V14H26zM27,13H28V14H27zM29,13H30V14H29zM2,14H3V15H2zM6,14H7V15H6zM8,14H9V15H8zM11,14H12V15H11zM14,14H15V15H14zM17,14H18V15H17zM18,14H19V15H18zM19,14H20V15H19zM21,14H22V15H21zM27,14H28V15H27zM28,14H29V15H28zM7,15H8V16H7zM10,15H11V16H10zM12,15H13V16H12zM13,15H14V16H13zM14,15H15V16H14zM15,15H16V16H15zM16,15H17V16H16zM18,15H19V16H18zM20,15H21V16H20zM21,15H22V16H21zM22,15H23V16H22zM24,15H25V16H24zM25,15H26V16H25zM26,15H27V16H26zM30,15H31V16H30zM2,16H3V17H2zM4,16H5V17H4zM5,16H6V17H5zM7,16H8V17H7zM8,16H9V17H8zM11,16H12V17H11zM12,16H13V17H12zM14,16H15V17H14zM15,16H16V17H15zM16,16H17V17H16zM17,16H18V17H17zM18,16H19V17H18zM22,16H23V17H22zM27,16H28V17H27zM28,16H29V17H28zM3,17H4V18H3zM4,17H5V18H4zM5,17H6V18H5zM6,17H7V18H6zM9,17H10V18H9zM13,17H14V18H13zM14,17H15V18H14zM15,17H16V18H15zM18,17H19V18H18zM21,17H22V18H21zM22,17H23V18H22zM23,17H24V18H23zM25,17H26V18H25zM29,17H30V18H29zM3,18H4V19H3zM6,18H7V19H6zM8,18H9V19H8zM10,18H11V19H10zM12,18H13V19H12zM13,18H14V19H13zM16,18H17V19H16zM19,18H20V19H19zM21,18H22V19H21zM27,18H28V19H27zM28,18H29V19H28zM2,19H3V20H2zM3,19H4V20H3zM5,19H6V20H5zM6,19H7V20H6zM9,19H10V20H9zM10,19H11V20H10zM13,19H14V20H13zM18,19H19V20H18zM20,19H21V20H20zM21,19H22V20H21zM22,19H23V20H22zM23,19H24V20H23zM24,19H25V20H24zM25,19H26V20H25zM26,19H27V20H26zM28,19H29V20H28zM30,19H31V20H30zM2,20H3V21H2zM4,20H5V21H4zM5,20H6V21H5zM7,20H8V21H7zM8,20H9V21H8zM10,20H11V21H10zM11,20H12V21H11zM12,20H13V21H12zM17,20H18V21H17zM19,20H20V21H19zM20,20H21V21H20zM22,20H23V21H22zM24,20H25V21H24zM25,20H26V21H25zM28,20H29V21H28zM2,21H3V22H2zM4,21H5V22H4zM5,21H6V22H5zM6,21H7V22H6zM11,21H12V22H11zM13,21H14V22H13zM14,21H15V22H14zM16,21H17V22H16zM17,21H18V22H17zM21,21H22V22H21zM23,21H24V22H23zM25,21H26V22H25zM29,21H30V22H29zM2,22H3V23H2zM5,22H6V23H5zM7,22H8V23H7zM8,22H9V23H8zM11,22H12V23H11zM17,22H18V23H17zM18,22H19V23H18zM19,22H20V23H19zM22,22H23V23H22zM23,22H24V23H23zM24,22H25V23H24zM25,22H26V23H25zM26,22H27V23H26zM28,22H29V23H28zM29,22H30V23H29zM30,22H31V23H30zM10,23H11V24H10zM11,23H12V24H11zM13,23H14V24H13zM15,23H16V24H15zM16,23H17V24H16zM18,23H19V24H18zM22,23H23V24H22zM26,23H27V24H26zM27,23H28V24H27zM28,23H29V24H28zM29,23H30V24H29zM30,23H31V24H30zM2,24H3V25H2zM3,24H4V25H3zM4,24H5V25H4zM5,24H6V25H5zM6,24H7V25H6zM7,24H8V25H7zM8,24H9V25H8zM11,24H12V25H11zM12,24H13V25H12zM13,24H14V25H13zM15,24H16V25H15zM16,24H17V25H16zM17,24H18V25H17zM18,24H19V25H18zM21,24H22V25H21zM22,24H23V25H22zM24,24H25V25H24zM26,24H27V25H26zM27,24H28V25H27zM28,24H29V25H28zM2,25H3V26H2zM8,25H9V26H8zM10,25H11V26H10zM11,25H12V26H11zM12,25H13V26H12zM14,25H15V26H14zM15,25H16V26H15zM17,25H18V26H17zM18,25H19V26H18zM20,25H21V26H20zM21,25H22V26H21zM22,25H23V26H22zM26,25H27V26H26zM2,26H3V27H2zM4,26H5V27H4zM5,26H6V27H5zM6,26H7V27H6zM8,26H9V27H8zM10,26H11V27H10zM11,26H12V27H11zM12,26H13V27H12zM13,26H14V27H13zM14,26H15V27H14zM16,26H17V27H16zM19,26H20V27H19zM22,26H23V27H22zM23,26H24V27H23zM24,26H25V27H24zM25,26H26V27H25zM26,26H27V27H26zM28,26H29V27H28zM2,27H3V28H2zM4,27H5V28H4zM5,27H6V28H5zM6,27H7V28H6zM8,27H9V28H8zM10,27H11V28H10zM11,27H12V28H11zM14,27H15V28H14zM15,27H16V28H15zM19,27H20V28H19zM20,27H21V28H20zM22,27H23V28H22zM27,27H28V28H27zM28,27H29V28H28zM29,27H30V28H29zM30,27H31V28H30zM2,28H3V29H2zM4,28H5V29H4zM5,28H6V29H5zM6,28H7V29H6zM8,28H9V29H8zM10,28H11V29H10zM11,28H12V29H11zM14,28H15V29H14zM16,28H17V29H16zM17,28H18V29H17zM20,28H21V29H20zM21,28H22V29H21zM22,28H23V29H22zM23,28H24V29H23zM24,28H25V29H24zM25,28H26V29H25zM26,28H27V29H26zM27,28H28V29H27zM28,28H29V29H28zM29,28H30V29H29zM2,29H3V30H2zM8,29H9V30H8zM11,29H12V30H11zM13,29H14V30H13zM14,29H15V30H14zM18,29H19V30H18zM22,29H23V30H22zM24,29H25V30H24zM25,29H26V30H25zM27,29H28V30H27zM29,29H30V30H29zM2,30H3V31H2zM3,30H4V31H3zM4,30H5V31H4zM5,30H6V31H5zM6,30H7V31H6zM7,30H8V31H7zM8,30H9V31H8zM10,30H11V31H10zM12,30H13V31H12zM14,30H15V31H14zM16,30H17V31H16zM19,30H20V31H19zM23,30H24V31H23zM24,30H25V31H24zM26,30H27V31H26zM28,30H29V31H28z"

type CapabilityKey = "it" | "setup" | "migration" | "support"

const CAPABILITY_TABS: Array<{
  key: CapabilityKey
  label: string
  accordions: Array<{
    title: string
    body: string
    linkLabel: string
    linkHref: string
  }>
  consoleTitle: string
  consoleGreeting: string
  metrics: Array<{ label: string; value: string; badge: string }>
  users: Array<{ name: string; role: string; email: string; license: string }>
}> = [
  {
    key: "it",
    label: "Simplified IT management",
    accordions: [
      {
        title: "Drive everyday efficiencies",
        body: "Use the ConnectLn Admin Center to configure roles, monitor service health, manage billing, and govern team workspaces from one dashboard.",
        linkLabel: "Open Admin Console",
        linkHref: "/connectin-admin",
      },
      {
        title: "Manage from anywhere",
        body: "Approve new members, reset passkeys, and inspect call & messaging health securely from desktop or mobile without VPN overhead.",
        linkLabel: "Explore Security Controls",
        linkHref: "/connectin?tab=accountsecurity",
      },
    ],
    consoleTitle: "ConnectLn Admin Center · Zero-Trust Overview",
    consoleGreeting: "Good afternoon, Platform Admin",
    metrics: [
      { label: "Verified Members", value: "70+", badge: "Active directory" },
      { label: "SSO Providers", value: "Google & Entra ID", badge: "Session isolated" },
      { label: "Uptime SLA", value: "99.98%", badge: "All services healthy" },
    ],
    users: [
      { name: "Kwesi Asiedu", role: "Platform Admin", email: "kasiedu@expedite-consults.com", license: "Enterprise" },
      { name: "Aswin Prakash", role: "Verified Member", email: "itsashwin.prakash@gmail.com", license: "ConnectLn Pro" },
      { name: "Esther Boah", role: "Healthcare Lead", email: "Verified DVM", license: "ConnectLn 360" },
      { name: "Mike Mukasa", role: "Operations Lead", email: "Verified Enclave", license: "Team Seat" },
    ],
  },
  {
    key: "setup",
    label: "Setup and installation",
    accordions: [
      {
        title: "Provision workspaces in minutes",
        body: "Turn on Mail & Chat, Vibe HD Video Calling, Noctis AI Notetaker, and Studio Docs across every team seat with zero client installers.",
        linkLabel: "Launch Workspace",
        linkHref: "/connectin",
      },
      {
        title: "Connect Google & Microsoft Entra ID",
        body: "Enforce per-session identity isolation and OTP mobile verification for instant Calling & Direct Messaging access.",
        linkLabel: "Configure Sign-In",
        linkHref: "/connectin-login",
      },
    ],
    consoleTitle: "ConnectLn Setup · Identity & App Provisioning",
    consoleGreeting: "Automated enclave & seat rollout",
    metrics: [
      { label: "Mail & Chat", value: "Enabled", badge: "E2EE Active" },
      { label: "Vibe HD Calls", value: "WebRTC + Push", badge: "215+ Countries" },
      { label: "Mobile 2FA", value: "SMS / Email", badge: "Enforced" },
    ],
    users: [
      { name: "Domain Verification", role: "TLS & DNS", email: "conectln.com", license: "Verified" },
      { name: "Enclave Directory", role: "Auto-Sync", email: "MongoDB + Sync", license: "Live" },
      { name: "Web Push VAPID", role: "Background Ring", email: "PWA Ready", license: "Active" },
    ],
  },
  {
    key: "migration",
    label: "Easy migration and adoption",
    accordions: [
      {
        title: "Import members & contacts seamlessly",
        body: "Everyone who registers or signs in joins your searchable ConnectLn directory automatically across Mail & Chat and Calls.",
        linkLabel: "Browse Directory",
        linkHref: "/connectin?tab=network",
      },
      {
        title: "Zero-friction external links & market apps",
        body: "Connect SkillHands.us, VeritasLens, CampusSync, and external email workflows alongside internal threads.",
        linkLabel: "Open ConnectLn Market",
        linkHref: "/connectin?tab=marketplace",
      },
    ],
    consoleTitle: "ConnectLn Migration · Directory & App Bridge",
    consoleGreeting: "Unified onboarding without downtime",
    metrics: [
      { label: "Search Indexing", value: "Instant", badge: "Fuzzy + Prefix" },
      { label: "Market Apps", value: "100+ Tools", badge: "Curated" },
      { label: "External Mail", value: "Gmail / Outlook", badge: "Synced" },
    ],
    users: [
      { name: "Directory Sync", role: "Real-Time", email: "/api/connectin/users", license: "Synced" },
      { name: "Calls Bridge", role: "Audio & Video", email: "Direct Dialer", license: "Ready" },
      { name: "Noctis Notetaker", role: "In-Call AI", email: "Live Transcripts", license: "Included" },
    ],
  },
  {
    key: "support",
    label: "Support and training",
    accordions: [
      {
        title: "24/7 Noctis AI & admin helpdesk",
        body: "Use Ask Noctis for guided configuration answers or open a direct billing and technical ticket from your portal.",
        linkLabel: "Explore Learn Hub",
        linkHref: "/connectin?tab=learning",
      },
      {
        title: "Guided onboarding for every profession",
        body: "Role-tailored learning tracks help crews, clinicians, founders, and IT leads master ConnectLn in under a week.",
        linkLabel: "View Courses",
        linkHref: "/connectin?tab=learning",
      },
    ],
    consoleTitle: "ConnectLn Support · Health & Learning Center",
    consoleGreeting: "Live telemetry and guided training",
    metrics: [
      { label: "Support Response", value: "< 15 min", badge: "Priority SLA" },
      { label: "Noctis Guidance", value: "24/7 Live", badge: "AI Agent" },
      { label: "Training Modules", value: "15 Enclaves", badge: "Self-paced" },
    ],
    users: [
      { name: "Billing & Seats Desk", role: "Direct Support", email: "Ticket Queue", license: "Available" },
      { name: "Tech Diagnostics", role: "WebRTC & Sync", email: "Live Telemetry", license: "Healthy" },
      { name: "Admin Academy", role: "Video Walkthroughs", email: "On-demand", license: "Free" },
    ],
  },
]

interface BuiltInAppQuickLink {
  label: string
  href: string
  external?: boolean
  action?: "open_noctis"
}

const BUILTIN_APPS: Array<{
  id: string
  name: string
  tagline: string
  adminNote: string
  caption: string
  highlights: string[]
  primaryLabel: string
  href: string
  bg: string
  icon: React.ComponentType<{ className?: string }>
  quickLinks: BuiltInAppQuickLink[]
}> = [
  {
    id: "messaging",
    name: "Mail & Chat",
    tagline: "Encrypted Messaging & External Email",
    adminNote: "E2EE threads · Synced across all devices",
    caption: "Keep teams aligned in ConnectLn Mail & Chat with E2EE threads and instant member search.",
    highlights: [
      "End-to-end encrypted direct & group threads",
      "Instant first-name search across all registered members",
      "Full-width multi-line composer, drafts & scheduled send",
    ],
    primaryLabel: "Open Mail & Chat",
    href: "/connectin?tab=messaging",
    bg: "bg-sky-50 text-[#0A66C2]",
    icon: Mail,
    quickLinks: [
      { label: "Calendar", href: "/connectin?tab=calendar" },
      { label: "Security & Privacy", href: "/connectin?tab=accountsecurity" },
      { label: "Admin Directory", href: "/connectin-admin" },
    ],
  },
  {
    id: "vibecomms",
    name: "Vibe HD Calls",
    tagline: "WebRTC Audio, Video & Mobile Bridge",
    adminNote: "1-on-1 & Group HD · Zero Carrier Lock-In",
    caption: "Launch crystal-clear 1-on-1 and group voice or video meetings right from any browser or phone.",
    highlights: [
      "1-on-1 and multi-party HD WebRTC voice & video",
      "First-name call list search across every registered member",
      "Screen sharing, studio backgrounds & mobile SIM handoff",
    ],
    primaryLabel: "Open Vibe HD Calls",
    href: "/connectin?tab=vibecomms",
    bg: "bg-emerald-50 text-emerald-700",
    icon: Video,
    quickLinks: [
      { label: "Messaging Calls Rail", href: "/connectin?tab=messaging" },
      { label: "Live Video Studio", href: "/connectin?tab=vibecomms" },
      { label: "Admin Console", href: "/connectin-admin" },
    ],
  },
  {
    id: "noctis",
    name: "Noctis AI",
    tagline: "In-Call AI Notetaker & Workspace Copilot",
    adminNote: "Private 'Only You' Mode · Live Transcripts",
    caption: "Automate live meeting notes, Q&A, action items, and draft replies directly inside workflows.",
    highlights: [
      "Native in-call AI Notetaker tile with live transcripts",
      "Private 'Ask Noctis · Only you' real-time meeting Q&A",
      "Instant action items, summaries & smart draft replies",
    ],
    primaryLabel: "Open Noctis AI",
    href: "/connectin?tab=noctis",
    bg: "bg-violet-50 text-violet-700",
    icon: Sparkles,
    quickLinks: [
      { label: "Noctis Social", href: "/connectin?tab=noctissocial" },
      { label: "Ask Noctis Now", href: "#ask-noctis", action: "open_noctis" },
      { label: "Admin Console", href: "/connectin-admin" },
    ],
  },
  {
    id: "studio",
    name: "ConnectLn Studio",
    tagline: "Docs, Sheets, Decks, e-Sign & Invoices",
    adminNote: "Unified Office Suite · Client-Ready Deliverables",
    caption: "Co-author documents, spreadsheets, pitch decks, invoices, and verified e-signatures.",
    highlights: [
      "Docs, Sheets & Slide Decks built into one workspace",
      "Verified e-Signatures and direct client Invoicing",
      "Project Kanban Boards and structured Intake Forms",
    ],
    primaryLabel: "Open ConnectLn Studio",
    href: "/connectin?tab=docs",
    bg: "bg-amber-50 text-amber-700",
    icon: FileText,
    quickLinks: [
      { label: "Docs", href: "/connectin?tab=docs" },
      { label: "Sheets", href: "/connectin?tab=sheets" },
      { label: "Slides", href: "/connectin?tab=slides" },
      { label: "e-Sign", href: "/connectin?tab=sign" },
      { label: "Invoice", href: "/connectin?tab=invoice" },
    ],
  },
  {
    id: "marketplace",
    name: "ConnectLn Market",
    tagline: "Curated Partner Platforms & Field Apps",
    adminNote: "Global Enclave Access · Direct Launch Links",
    caption: "Discover curated apps including SkillHands.us, VeritasLens, CampusSync, and TruePlace.",
    highlights: [
      "SkillHands.us — Trusted Local Home Services (No Account Required)",
      "VeritasLens Blindspot Briefing & TruePlace HomeTruth™",
      "CampusSync College Hub & VibeTok Clinic partner apps",
    ],
    primaryLabel: "Open ConnectLn Market",
    href: "/connectin?tab=marketplace",
    bg: "bg-rose-50 text-rose-700",
    icon: Store,
    quickLinks: [
      { label: "SkillHands.us", href: "https://skillhands-client.vercel.app/", external: true },
      { label: "VeritasLens", href: "https://portal.expediteconsults.com/veritaslens", external: true },
      { label: "CampusSync", href: "https://expedite-consults.vercel.app/campus", external: true },
      { label: "TruePlace", href: "https://expedite-consults.vercel.app/trueplace", external: true },
    ],
  },
]

const RESOURCE_CARDS = [
  {
    tag: "Tech community",
    title: "Build your skills and connect with verified pros across 15+ industry enclaves.",
    cta: "Register today",
    href: "/connectin?tab=network",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
  },
  {
    tag: "Technical documentation",
    title: "Check out admin controls, zero-trust SSO policies, and user management guides.",
    cta: "Learn more",
    href: "/connectin-admin",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80",
  },
  {
    tag: "Public roadmap",
    title: "See the latest releases across ConnectLn 360 Portal, Vibe Calls, and Noctis AI.",
    cta: "Stay informed",
    href: "/connectin-portal#overview",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
  },
  {
    tag: "User resources",
    title: "Help your team get the most out of ConnectLn Mail, Calls, and Market apps.",
    cta: "View resources",
    href: "/connectin?tab=learning",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80",
  },
]

export function ConnectLnAdminGuideView() {
  const [activeSubNav, setActiveSubNav] = useState("capabilities")
  const [activeCapKey, setActiveCapKey] = useState<CapabilityKey>("it")
  const [openAccordionIdx, setOpenAccordionIdx] = useState(0)
  const [mobilePlatform, setMobilePlatform] = useState<"ios" | "android">("ios")
  const [showQrAlt, setShowQrAlt] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [activeAppId, setActiveAppId] = useState(BUILTIN_APPS[0].id)

  // Support ticket modal
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketCategory, setTicketCategory] = useState("Billing & Licensing")
  const [ticketDetails, setTicketDetails] = useState("")
  const [ticketSubmittedId, setTicketSubmittedId] = useState<string | null>(null)

  // Collapsed-by-default Ask Noctis widget
  const [noctisOpen, setNoctisOpen] = useState(false)
  const [noctisInput, setNoctisInput] = useState("")
  const [noctisAnswer, setNoctisAnswer] = useState("")
  const [noctisLoading, setNoctisLoading] = useState(false)

  const resourcesScrollRef = useRef<HTMLDivElement | null>(null)

  const currentCap = CAPABILITY_TABS.find((t) => t.key === activeCapKey) || CAPABILITY_TABS[0]
  const currentApp = BUILTIN_APPS.find((a) => a.id === activeAppId) || BUILTIN_APPS[0]

  const handleCopyAdminLink = () => {
    const url = "https://conectln.com/connectin-admin"
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleAskNoctis = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = noctisInput.trim()
    if (!q || noctisLoading) return
    setNoctisLoading(true)
    setNoctisAnswer("")
    try {
      const res = await fetch("/api/connectin/noctis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `ConnectLn Administration Guide question: ${q}`,
        }),
      })
      const data = await res.json().catch(() => null)
      setNoctisAnswer(
        data?.text ||
          "You can manage users, SSO settings, billing, and workspaces directly inside /connectin-admin."
      )
    } catch {
      setNoctisAnswer(
        "Open Admin sign in (/connectin-admin) to manage members, SSO sessions, and ConnectLn workspace policies."
      )
    } finally {
      setNoctisLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FCF6F4] text-[#0B1F3A] font-sans selection:bg-[#0A66C2] selection:text-white">
      {/* ─── TOP UTILITY BAR (Matches crisp single-row layout) ─── */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/connectin" className="shrink-0 flex items-center gap-2">
              <ConnectInLogo size="sm" showSubtitle={false} />
            </Link>
            <span className="hidden sm:inline-block h-5 w-px bg-slate-300" />
            <span className="hidden sm:inline-block text-sm font-bold text-slate-900 whitespace-nowrap">
              ConnectLn for business
            </span>
            <nav
              aria-label="ConnectLn business links"
              className="hidden md:flex items-center gap-5 ml-3 text-xs font-medium text-slate-600"
            >
              <Link href="/connectin-portal" className="hover:text-slate-950 transition-colors">
                360 Portal
              </Link>
              <Link href="/connectin-portal#plans" className="hover:text-slate-950 transition-colors">
                Plans and pricing
              </Link>
              <a href="#resources" className="hover:text-slate-950 transition-colors">
                Resources
              </a>
              <a href="#support" className="hover:text-slate-950 transition-colors">
                Support
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/connectin-login?mode=join"
              className="rounded-lg bg-[#0B1F3A] hover:bg-[#163259] text-white px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
            >
              Try for free
            </Link>
            <Link
              href="/connectin-admin"
              className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
            >
              Admin center
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 1. EDITORIAL HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FDF4F2] via-[#FAF6F4] to-[#F3EFFA] pt-10 sm:pt-16 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0B1F3A] leading-[1.1]">
              Your guide to ConnectLn administration
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Manage applications, data, devices, and users more efficiently for ConnectLn
              services across every workspace.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/connectin-admin"
                className="rounded-lg bg-[#0F2438] hover:bg-[#1A3550] text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors"
              >
                Admin sign in
              </Link>
              <Link
                href="/connectin-login?mode=join"
                className="rounded-lg border border-slate-900/30 bg-white/90 hover:bg-white text-[#0B1F3A] px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Try for free
              </Link>
            </div>
            <div>
              <Link
                href="/connectin"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] hover:underline"
              >
                <span className="h-6 w-6 rounded bg-[#0F2438] text-white inline-flex items-center justify-center">
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span>Open live ConnectLn 360 Workspace</span>
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg pt-1">
              Includes unified directory management, end-to-end encrypted Mail &amp; Chat, Vibe HD
              voice &amp; video conferencing, and zero-trust session isolation for teams of any size.
            </p>
          </div>

          <div className="lg:col-span-6 relative">
            {/* Soft decorative accent panels behind hero frame */}
            <div className="hidden sm:block absolute -top-5 -right-5 h-44 w-44 rounded-3xl bg-gradient-to-br from-rose-300/70 to-indigo-400/70 blur-[1px]" />
            <div className="hidden sm:block absolute -bottom-6 left-8 h-32 w-32 rounded-3xl bg-gradient-to-br from-emerald-300/60 to-teal-500/60" />
            <div className="relative rounded-3xl border border-white/80 bg-white p-2.5 shadow-[0_24px_60px_rgba(11,31,58,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80"
                alt="ConnectLn administrator reviewing organization controls on laptop"
                className="w-full h-[270px] sm:h-[320px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FLOATING STICKY PILL SUB-NAV ─── */}
      <div className="sticky top-3 z-40 px-4">
        <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-full border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_12px_32px_rgba(11,31,58,0.08)] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Administration sections"
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar text-xs font-semibold text-slate-700"
          >
            {[
              { id: "capabilities", label: "Capabilities" },
              { id: "mobile-app", label: "Mobile app" },
              { id: "built-in-apps", label: "Built-in apps" },
              { id: "resources", label: "Resources" },
            ].map((item) => {
              const active = activeSubNav === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSubNav(item.id)}
                  className={`whitespace-nowrap py-1 border-b-2 transition-colors ${
                    active
                      ? "border-[#0B1F3A] text-[#0B1F3A] font-bold"
                      : "border-transparent hover:text-[#0B1F3A]"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/connectin-admin"
              className="rounded-lg bg-[#0F2438] hover:bg-[#1A3550] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors"
            >
              Admin sign in
            </Link>
            <Link
              href="/connectin-portal#plans"
              className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#0B1F3A] px-3.5 py-1.5 text-xs font-semibold transition-colors hidden sm:inline-block"
            >
              See plans and pricing
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 3. CAPABILITIES (4 Pills + 2 Clean Accordions + Live Preview Panel) ─── */}
      <section id="capabilities" className="mx-auto max-w-6xl px-4 sm:px-8 pt-14 pb-20 scroll-mt-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          CAPABILITIES
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Meet the unique needs of your organization
        </h2>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {CAPABILITY_TABS.map((tab) => {
            const selected = tab.key === activeCapKey
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveCapKey(tab.key)
                  setOpenAccordionIdx(0)
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  selected
                    ? "bg-[#0F2438] text-white shadow-xs"
                    : "bg-[#EFE6E3] text-slate-700 hover:bg-[#E5DAD6]"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Clean 2-Item Accordion */}
          <div className="lg:col-span-5 space-y-2">
            {currentCap.accordions.map((item, idx) => {
              const isOpen = openAccordionIdx === idx
              return (
                <div
                  key={item.title}
                  className={`border-l-2 pl-5 py-3 transition-colors ${
                    isOpen ? "border-[#0B1F3A]" : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenAccordionIdx(idx)}
                    className="w-full flex items-center justify-between text-left gap-3 cursor-pointer"
                  >
                    <span className="text-base font-semibold text-[#0B1F3A]">{item.title}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                      <Link
                        href={item.linkHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1F3A] underline underline-offset-4 hover:text-[#0A66C2]"
                      >
                        <span>{item.linkLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right: Clean Interactive ConnectLn Admin Center Frame */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#D9F0A3]/60 via-[#F4F8EA] to-white p-4 sm:p-6 border border-slate-200/80 shadow-sm">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="bg-[#0F2438] text-white px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>{currentCap.consoleTitle}</span>
                  </div>
                  <Link
                    href="/connectin-admin"
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    <span>Open console</span>
                  </Link>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{currentCap.consoleGreeting}</p>
                      <p className="text-[11px] text-slate-500">
                        conectln.com · Live organization workspace controls
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {currentCap.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <p className="text-[10.5px] font-semibold text-slate-500">{m.label}</p>
                        <p className="text-sm font-extrabold text-slate-900 mt-0.5">{m.value}</p>
                        <p className="text-[10px] font-semibold text-[#0A66C2] mt-0.5">{m.badge}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Organization Snapshot</span>
                      <span>Status</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {currentCap.users.map((row) => (
                        <div
                          key={row.name}
                          className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{row.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {row.role} · {row.email}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {row.license}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. MOBILE APP BAND (Crisp Navy Contrast Section) ─── */}
      <section id="mobile-app" className="bg-[#233E6E] text-white py-16 sm:py-20 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">
            MOBILE APP
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            Get the free ConnectLn Admin mobile app
          </h2>
          <p className="mt-3 text-sm text-blue-100/90 max-w-xl mx-auto">
            Access common admin tasks on the go and receive notifications about service health,
            new registrations, and billing alerts directly on your mobile device.
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-white/25 bg-white/10 p-1">
            {(["ios", "android"] as const).map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setMobilePlatform(plat)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  mobilePlatform === plat
                    ? "bg-white text-[#0B1F3A]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {plat === "ios" ? "For iOS" : "For Android"}
              </button>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <div className="rounded-2xl bg-white p-3.5 shadow-xl">
              <svg
                viewBox="0 0 33 33"
                className="h-36 w-36 text-[#0B1F3A]"
                aria-label={`ConnectLn Admin ${mobilePlatform.toUpperCase()} QR Code`}
              >
                <rect width="33" height="33" fill="white" />
                <path d={ADMIN_QR_PATH} fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowQrAlt((v) => !v)}
              className="text-xs text-blue-100 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              Try another option if you&apos;re having trouble with the QR code
            </button>
            {showQrAlt && (
              <div className="mt-3 mx-auto max-w-md rounded-xl bg-white/10 border border-white/20 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-blue-100 truncate">
                  https://conectln.com/connectin-admin
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyAdminLink}
                    className="rounded-lg bg-white text-[#0B1F3A] px-2.5 py-1 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedUrl ? "Copied" : "Copy URL"}</span>
                  </button>
                  <Link
                    href="/connectin-admin"
                    className="rounded-lg border border-white/40 px-2.5 py-1 font-bold text-white hover:bg-white/10"
                  >
                    Open now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 5. BUILT-IN APPS SELECTOR (5 Clean Square Tiles) ─── */}
      <section id="built-in-apps" className="mx-auto max-w-5xl px-4 sm:px-8 py-16 sm:py-20 text-center scroll-mt-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          BUILT-IN APPS
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Get seamless integration with your favorite apps
        </h2>
        <p className="mt-2.5 text-sm text-slate-600 max-w-md mx-auto">
          Connect messaging, HD calls, AI notes, documents, and Market tools in one workspace.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {BUILTIN_APPS.map((app) => {
            const Icon = app.icon
            const active = app.id === currentApp.id
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setActiveAppId(app.id)}
                title={app.name}
                className={`h-24 w-28 sm:w-32 rounded-2xl bg-white border flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                  active
                    ? "border-[#0B1F3A] border-b-4 shadow-md -translate-y-0.5"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${app.bg}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold text-slate-800">{app.name}</span>
              </button>
            )
          })}
        </div>

        {(() => {
          const ActiveAppIcon = currentApp.icon
          return (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 text-left shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${currentApp.bg}`}
                  >
                    <ActiveAppIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F3A]">{currentApp.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{currentApp.tagline}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  {currentApp.adminNote}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-700 leading-relaxed">{currentApp.caption}</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentApp.highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-3 flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={currentApp.href}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2438] hover:bg-[#1A3550] text-white px-4 py-2 text-xs font-semibold transition-colors"
                >
                  <span>{currentApp.primaryLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <div className="flex flex-wrap items-center gap-1.5">
                  {currentApp.quickLinks.map((ql) =>
                    ql.action === "open_noctis" ? (
                      <button
                        key={ql.label}
                        type="button"
                        onClick={() => setNoctisOpen(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 text-[11px] font-semibold text-violet-800 transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{ql.label}</span>
                      </button>
                    ) : ql.external ? (
                      <a
                        key={ql.label}
                        href={ql.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        <span>{ql.label}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    ) : (
                      <Link
                        key={ql.label}
                        href={ql.href}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        <span>{ql.label}</span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })()}
      </section>

      {/* ─── 6. RESOURCES + 30-DAY TRIAL + SUPPORT ─── */}
      <section id="resources" className="mx-auto max-w-6xl px-4 sm:px-8 pt-6 pb-16 scroll-mt-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          RESOURCES
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1F3A]">
          Get more out of your investment
        </h2>

        <div
          ref={resourcesScrollRef}
          className="mt-8 flex gap-5 overflow-x-auto no-scrollbar pb-2 snap-x"
        >
          {RESOURCE_CARDS.map((card) => (
            <div
              key={card.tag}
              className="min-w-[270px] sm:min-w-[290px] flex-1 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs flex flex-col snap-start"
            >
              <img src={card.img} alt={card.tag} className="h-40 w-full object-cover" />
              <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">{card.tag}</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#0B1F3A] leading-snug">
                    {card.title}
                  </p>
                </div>
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] hover:underline"
                >
                  <span className="h-6 w-6 rounded bg-[#0F2438] text-white inline-flex items-center justify-center">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span>{card.cta}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => resourcesScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
            aria-label="Scroll resources left"
            className="h-9 w-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => resourcesScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
            aria-label="Scroll resources right"
            className="h-9 w-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Trial Split Card */}
        <div className="mt-14 rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-7 sm:p-10 space-y-4">
            <p className="text-[11px] font-semibold text-slate-500">Try for free</p>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1F3A]">
              Start your 30-day risk-free trial
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Get hands-on access to the ConnectLn Admin Center, team seats, Vibe HD Calls, and
              Noctis AI workspace controls when you sign up.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/connectin-login?mode=join"
                className="rounded-lg bg-[#0F2438] hover:bg-[#1A3550] text-white px-4 py-2 text-xs font-semibold transition-colors"
              >
                Get started
              </Link>
              <Link
                href="/connectin-portal"
                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#0B1F3A] px-4 py-2 text-xs font-semibold transition-colors"
              >
                Explore 360 Portal
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 h-full">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80"
              alt="Team admin collaborating with ConnectLn"
              className="w-full h-64 sm:h-72 object-cover"
            />
          </div>
        </div>

        {/* 2-Card Support Row */}
        <div id="support" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-24">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-lg font-semibold text-[#0B1F3A]">
                Open a billing or tech support ticket
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Get installation, setup, SSO directory, and billing support for all ConnectLn members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTicketSubmittedId(null)
                setShowTicketModal(true)
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] hover:underline cursor-pointer w-fit"
            >
              <span className="h-6 w-6 rounded bg-[#0F2438] text-white inline-flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span>Start a support ticket</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-lg font-semibold text-[#0B1F3A]">
                Browse help and learning topics
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Get a jump on onboarding your organization and managing subscriptions, calls, and
                verified users.
              </p>
            </div>
            <Link
              href="/connectin?tab=learning"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] hover:underline w-fit"
            >
              <span className="h-6 w-6 rounded bg-[#0F2438] text-white inline-flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span>Go to resources</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#F2F2F2] border-t border-slate-200 text-slate-600 py-10 px-4 sm:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-[11px]">
          <div className="space-y-2">
            <p className="font-bold text-slate-800">What&apos;s new</p>
            <Link href="/connectin-portal" className="block hover:underline">ConnectLn 360 Portal</Link>
            <Link href="/connectin?tab=vibecomms" className="block hover:underline">Vibe HD Video</Link>
            <Link href="/connectin?tab=noctis" className="block hover:underline">Noctis AI Notes</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800">ConnectLn Market</p>
            <Link href="/connectin?tab=marketplace" className="block hover:underline">Explore Market</Link>
            <Link href="/connectin?tab=marketplace" className="block hover:underline">SkillHands.us</Link>
            <Link href="/veritaslens" className="block hover:underline">VeritasLens</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800">Education</p>
            <Link href="/connectin?tab=learning" className="block hover:underline">Learning Academy</Link>
            <Link href="/campus" className="block hover:underline">CampusSync</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800">Business</p>
            <Link href="/connectin-admin" className="block hover:underline">Admin Console</Link>
            <Link href="/connectin?tab=messaging" className="block hover:underline">Mail &amp; Chat</Link>
            <Link href="/connectin?tab=jobs" className="block hover:underline">Verified Jobs</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800">Security &amp; IT</p>
            <Link href="/connectin?tab=accountsecurity" className="block hover:underline">Zero-Trust IAM</Link>
            <Link href="/connectin-login" className="block hover:underline">Google &amp; Entra SSO</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-slate-800">Portal</p>
            <Link href="/connectin" className="block hover:underline">Open Workspace</Link>
            <Link href="/connectin-portal#plans" className="block hover:underline">Plans &amp; Pricing</Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-8 pt-6 border-t border-slate-300/70 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> English (United States)
          </span>
          <span>© ConnectLn · Expedite Consults 2026</span>
        </div>
      </footer>

      {/* ─── SUPPORT TICKET MODAL ─── */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#0A66C2]" />
                <h3 className="text-base font-bold text-[#0B1F3A]">Open Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close ticket modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {ticketSubmittedId ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2 text-sm text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Ticket {ticketSubmittedId} submitted</span>
                </p>
                <p className="text-xs text-emerald-800">
                  Our ConnectLn Admin &amp; Support team has logged your request under {ticketCategory}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="mt-2 rounded-lg bg-[#0F2438] text-white px-4 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setTicketSubmittedId(`CLN-${Math.floor(100000 + Math.random() * 900000)}`)
                  setTicketSubject("")
                  setTicketDetails("")
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  >
                    <option>Billing &amp; Licensing</option>
                    <option>SSO &amp; Zero-Trust IAM</option>
                    <option>Calls &amp; Mail Delivery</option>
                    <option>Directory &amp; Member Sync</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Briefly describe what you need..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    placeholder="Steps, workspace email, or organization details..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0F2438] hover:bg-[#1A3550] text-white px-4 py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    Submit ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── FLOATING COLLAPSED-BY-DEFAULT ASK NOCTIS PILL ─── */}
      <div className="fixed bottom-4 right-4 z-40">
        {noctisOpen ? (
          <div className="w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[#0B1F3A]">Ask Noctis</p>
                <p className="text-[11px] text-slate-500">
                  I&apos;m an AI admin assistant, ready to help.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNoctisOpen(false)}
                className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close Ask Noctis"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {noctisAnswer && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 max-h-36 overflow-y-auto">
                {noctisAnswer}
              </div>
            )}
            <form onSubmit={handleAskNoctis} className="flex items-center gap-1.5">
              <input
                type="text"
                value={noctisInput}
                onChange={(e) => setNoctisInput(e.target.value)}
                placeholder="Ask about admin setup, SSO..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A66C2]"
              />
              <button
                type="submit"
                disabled={noctisLoading}
                className="rounded-xl bg-[#0067B8] hover:bg-[#00559B] text-white p-2 cursor-pointer disabled:opacity-50"
                aria-label="Send question"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoctisOpen(true)}
            className="rounded-xl border border-slate-200 bg-white shadow-lg px-3.5 py-2 flex items-center gap-2.5 text-xs font-bold text-[#0B1F3A] hover:shadow-xl transition-shadow cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[#0067B8]" />
            <span>Ask Noctis</span>
            <span className="h-6 w-6 rounded-lg bg-[#0067B8] text-white inline-flex items-center justify-center">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
