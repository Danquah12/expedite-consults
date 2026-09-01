"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── Products Data (21 Connected Products) ─── */
const products = [
  {
    name: "SpheraNet — Sovereign Social",
    tagline: "Flagship · Sovereign Social Network, Campus Graph & AI Enclave",
    description:
      "The next-generation sovereign social network: Feed & Stories, 4K Reels player, SpheraChat WebSockets, Multi-Channel Spaces, P2P Bazaar Escrow, VeritasLens Deepfake Shield, Careers Matrix, Esports Arena, Verified Pages, and Financial Vault.",
    url: "/feed",
    isInternal: true,
    color: "#00d4ff",
    icon: "🌐",
    status: "live",
    badge: "FLAGSHIP",
  },
  {
    name: "Ægis — Mission Control",
    tagline: "Unified Fleet Gateway & Security Operations Command",
    description:
      "Central Mission Control Launchpad federating 12 security services, 68+ modules, local gateways (Ports 9000, 9011, 9012), and cloud production suites.",
    url: "http://localhost:9000",
    color: "#00e5b0",
    icon: "🚀",
    status: "live",
  },
  {
    name: "Expedite Strike & Fusion 2026",
    tagline: "Autonomous Pentest, ASPM & Hybrid AI AppSec Platform",
    description:
      "Enterprise Agentic AppSec & Offensive Security Suite — Expedite Fusion™ Hybrid Scanning, AI-BOM & LLM Scanner, Checkmarx MCP Server, Triage & Auto-PR Assist, XM Cyber Choke Point Graph, and 10-Section Board PDF Dossiers.",
    url: "http://localhost:9012",
    color: "#a855f7",
    icon: "⚡",
    status: "live",
  },
  {
    name: "ÆGIS · SOC Autonomous PenTest",
    tagline: "Autonomous Agentic AI Penetration Testing & Exploit Hub",
    description:
      "Full SOC Autonomous PenTest console — multi-target asset discovery, weaponized auto-exploit queue, PoC interactive evidence terminal, and Neo4j blast radius attack graphs.",
    url: "http://localhost:9011/app/?standalone=1",
    color: "#42b9f5",
    icon: "🎯",
    status: "live",
  },
  {
    name: "BAZAAR Marketplace",
    tagline: "Standalone AI-Powered Marketplace & Restaurant Delivery",
    description:
      "Independent multi-vendor marketplace with 68 DC/MD/VA restaurants, instant ZIP delivery lookup, real-time cart, and eBay C2C sync.",
    url: "/bazaar",
    isInternal: true,
    color: "#6366f1",
    icon: "🛍️",
    status: "live",
  },
  {
    name: "CareerOrbit Suite",
    tagline: "44-Tool Enterprise Career & ATS Mobility Suite",
    description:
      "Complete standalone intelligence suite with 44 deep-linked tools — JD Match, Interview Forge, Dark Orbit, Offer War Room, and Command Center.",
    url: "/career",
    isInternal: true,
    color: "#f59e0b",
    icon: "🚀",
    status: "live",
  },
  {
    name: "SPHERA Studio",
    tagline: "10-Tool Creation & Content Suite",
    description:
      "Dedicated creative powerhouse — Reels vertical video, SphereVision TV, Video Studio editor, AI Video Creator, SpheraCut, and Live Broadcasting.",
    url: "/reels",
    isInternal: true,
    color: "#ec4899",
    icon: "🎬",
    status: "live",
  },
  {
    name: "SPHERA Social & Chat",
    tagline: "9-Tool Community & Networking Suite",
    description:
      "Independent social ecosystem — Communities, Encrypted SpheraChat DMs, Orbit Connections, SpheraMatch AI matching, and Nexus global broadcast.",
    url: "/messages",
    isInternal: true,
    color: "#10b981",
    icon: "💬",
    status: "live",
  },
  {
    name: "Sphera Main Platform",
    tagline: "Unified Digital Universe",
    description:
      "Next-gen social universe uniting feed streams, career mobility, marketplace commerce, and creator tools in one experience.",
    url: "/feed",
    isInternal: true,
    color: "#00d4ff",
    icon: "🌍",
    status: "live",
  },
  {
    name: "VeritasLens",
    tagline: "AI Media Credibility & Information Intelligence Platform",
    description:
      "Bloomberg Terminal + Ground News + Reuters + Knowledge Graph. Real-time Kafka stream ingestion, BERT claim classification, 7-Day TV scorecard & B2B Brand Safety ad-shield.",
    url: "/veritaslens",
    isInternal: true,
    color: "#06b6d4",
    icon: "🛡️",
    status: "live",
  },
  {
    name: "SpheraCut",
    tagline: "AI Creative Suite",
    description:
      "AI-powered creative tools for video, image, story, and audio — Text to Video, Character Builder, Motion Sync & more.",
    url: "https://spheracut.expediteconsults.com",
    color: "#ec4899",
    icon: "✂️",
    status: "live",
  },
  {
    name: "AXIOM Cloud Security",
    tagline: "Product 4 · Multi-Cloud PenTest & Attack Path Engine",
    description:
      "Enterprise multi-cloud security assessment, IAM privilege escalation graphing, and authorized penetration testing across AWS, Azure, GCP, and Kubernetes.",
    url: "https://19-cloud-security-platform.vercel.app",
    color: "#f59e0b",
    icon: "☁️",
    status: "live",
  },
  {
    name: "Unified Integration Layer",
    tagline: "Product 3 · Cross-Platform Ecosystem Hub",
    description:
      "Enterprise orchestration layer federating CERBERUS-RE, Aegis Recovery, and AXIOM DAST with 24.5k evt/s telemetry & SOAR playbooks.",
    url: "https://18-unified-integration-layer.vercel.app",
    color: "#10b981",
    icon: "🌐",
    status: "live",
  },
  {
    name: "Aegis Recovery",
    tagline: "Product 2 · Ransomware Recovery & Resilience (78 Studios)",
    description:
      "Full-lifecycle autonomous ransomware recovery, exposure digital twin, eBPF syscall freeze, in-memory key carving & AD-FDR.",
    url: "https://17-ransomware-recovery-platform.vercel.app",
    color: "#06b6d4",
    icon: "🛡️",
    status: "live",
  },
  {
    name: "CERBERUS-RE",
    tagline: "Product 1 · Autonomous Malware Intelligence (62 Studios)",
    description:
      "Autonomous binary reverse engineering, Cutter/Ghidra disassembler, x32dbg dynamic debugger, Volatility memory analysis & YARA forge.",
    url: "https://16-malware-analysis-platform.vercel.app",
    color: "#f43f5e",
    icon: "🦠",
    status: "live",
  },
  {
    name: "AXIOM DAST",
    tagline: "Dynamic Application Security Testing Platform",
    description:
      "Enterprise DAST security platform with OWASP Top 10 fuzzing, post-exploitation engine, and live ZAP/Wapiti scan automation.",
    url: "https://11-dast-security-platform.vercel.app",
    color: "#e8912d",
    icon: "⚡",
    status: "live",
  },
  {
    name: "Expedite Consults",
    tagline: "Cybersecurity Solutions You Can Trust",
    description:
      "Expert cybersecurity, cloud security, and risk management to help organizations move forward securely.",
    url: "https://www.expediteconsults.com",
    color: "#00b4d8",
    icon: "🛡️",
    status: "live",
  },
  {
    name: "SkillHands",
    tagline: "Book Quality Home Services",
    description:
      "Need a certified expert? Licensed & insured, background checked pros with same-day service. Book in 30 seconds.",
    url: "https://skillhands.expediteconsults.com",
    color: "#6366f1",
    icon: "🔧",
    status: "live",
  },
];

interface AppItem {
  name: string;
  icon: string;
  description: string;
  badge?: string;
  status: "available" | "coming";
  tab?: string;
  url?: string;
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  apps: AppItem[];
}

const categories: Category[] = [
  {
    id: "sphera-network",
    title: "SpheraNet Sovereign Ecosystem",
    subtitle: "Complete next-generation digital campus graph, social matrix & creator sovereign tools",
    icon: "🌐",
    color: "#00d4ff",
    apps: [
      { name: "Sovereign Home Feed", icon: "📱", description: "Global media feed, verified creator posts, and interactive polls", badge: "HOT", url: "/feed", status: "available" },
      { name: "4K Vertical Reels", icon: "🎬", description: "Mux streaming vertical video stage with reactions & uploads", badge: "HOT", url: "/reels", status: "available" },
      { name: "SpheraChat Messenger", icon: "💬", description: "Pusher real-time direct messages, group chats & voice notes", badge: "LIVE", url: "/messages", status: "available" },
      { name: "Spaces & Guilds", icon: "🏛️", description: "Multi-channel community lounges, audio stages, and discussions", badge: "NEW", url: "/spaces", status: "available" },
      { name: "Bazaar Escrow Commerce", icon: "🛍️", description: "P2P escrow marketplace with merchant verification tiers", badge: "HOT", url: "/bazaar", status: "available" },
      { name: "VeritasLens AI Shield", icon: "🛡️", description: "Deepfake detection studio with optical frequency telemetry", badge: "AI", url: "/veritaslens", status: "available" },
      { name: "Career & Skill Passport", icon: "💼", description: "ConnectIn career matrix, TS/SCI cleared bounties, and 1-click apply", badge: "PRO", url: "/career", status: "available" },
      { name: "Esports & Gaming Arena", icon: "🎮", description: "Tournament brackets, 4K broadcast stage & collegiate MMR ladders", badge: "HOT", url: "/gaming", status: "available" },
      { name: "Verified Brand Pages", icon: "🏢", description: "Institutional brand directories, verified badges & creator storefronts", badge: "NEW", url: "/pages", status: "available" },
      { name: "Decentralized Vault", icon: "🔐", description: "Decentralized financial enclave, balance releases & transaction logs", badge: "SECURE", url: "/vault", status: "available" },
      { name: "Campus Operating OS", icon: "🎓", description: "Collegiate hub, academic events, courses, and .EDU verification", badge: "EDU", url: "/campus", status: "available" },
      { name: "Zero-Trust Security Enclave", icon: "⚙️", description: "FIDO2 passkeys, biometric keypairs, and 3-mode theme engine", badge: "NEW", url: "/settings", status: "available" },
    ],
  },
  {
    id: "profile",
    title: "Profile & Identity",
    subtitle: "Your personal space & creator passport",
    icon: "👤",
    color: "#8b5cf6",
    apps: [
      { name: "My Profile", icon: "◯", description: "Manage your identity & personal orbit", url: "/profile", status: "available" },
      { name: "Orbiters & Friends", icon: "🌐", description: "Followers, following network & connection matrix", url: "/friends", status: "available" },
      { name: "Your Verified Channels", icon: "📺", description: "Professional, Creative, Personal & Business personas", badge: "NEW", url: "/pages", status: "available" },
    ],
  },
  {
    id: "content",
    title: "Content & Creation (SPHERA Studio)",
    subtitle: "10 standalone creative tools — video, audio, streaming & editing",
    icon: "🎬",
    color: "#ec4899",
    apps: [
      { name: "Reels Stage", icon: "▶", description: "TikTok-style vertical video feed & upload", badge: "HOT", url: "/reels", status: "available" },
      { name: "SphereVision", icon: "🎥", description: "TV-style streaming content & media rooms", badge: "HOT", tab: "watch", status: "available" },
      { name: "Video Studio", icon: "🎬", description: "Professional video editing & timeline suite", badge: "NEW", tab: "videostudio", status: "available" },
      { name: "Video Creator AI", icon: "🎞️", description: "AI-powered video generation & automated script rendering", badge: "AI", tab: "creator", status: "available" },
      { name: "SpheraCut", icon: "✂️", description: "AI Creative Suite — Video, Image, Story & Audio", badge: "HOT", url: "https://spheracut.expediteconsults.com", status: "available" },
      { name: "Creator Studio", icon: "📊", description: "Analytics, impressions & content management", tab: "creatorstudio", status: "available" },
      { name: "Pulse Rooms", icon: "⟳", description: "Real-time live conversation streams", badge: "LIVE", tab: "pulse", status: "available" },
      { name: "Community Spaces", icon: "🎙", description: "Multi-channel audio rooms & discussions", url: "/spaces", status: "available" },
      { name: "Go Live Stage", icon: "🔴", description: "Live streaming broadcasts to your audience", badge: "LIVE", url: "/gaming", status: "available" },
      { name: "24h Stories", icon: "◎", description: "24-hour ephemeral content & reactions", url: "/feed", status: "available" },
    ],
  },
  {
    id: "social",
    title: "Social & Community (SPHERA Social)",
    subtitle: "9 standalone community & communication tools",
    icon: "🌍",
    color: "#10b981",
    apps: [
      { name: "Spaces & Guilds", icon: "◈", description: "Join & create multi-channel communities", url: "/spaces", status: "available" },
      { name: "SpheraChat", icon: "💬", description: "Real-time encrypted messaging & DMs", url: "/messages", status: "available" },
      { name: "Connections Matrix", icon: "🤝", description: "Build your sovereign professional network", url: "/friends", status: "available" },
      { name: "SpheraMatch", icon: "💫", description: "AI-powered people matching & swipe cards", badge: "AI", tab: "linkedup", status: "available" },
      { name: "Nexus Broadcast", icon: "🌊", description: "Global broadcast hub and trending universe", badge: "NEW", url: "/feed", status: "available" },
      { name: "Universal Search", icon: "🔍", description: "Explore across 15 SpheraNet worlds and topics", url: "/search", status: "available" },
      { name: "Book Club", icon: "📚", description: "Read & discuss tech books together", tab: "bookclub", status: "available" },
      { name: "Recipe Hub", icon: "🍽", description: "Share & discover recipes", tab: "recipehub", status: "available" },
      { name: "Fitness Community", icon: "💪", description: "Workout community & health tracking", tab: "fitness", status: "available" },
    ],
  },
  {
    id: "career",
    title: "Career & Professional (CareerOrbit)",
    subtitle: "44 standalone AI-powered career intelligence & mobility tools",
    icon: "💼",
    color: "#f59e0b",
    apps: [
      { name: "CareerOrbit Matrix", icon: "🚀", description: "Job search, orbit matching & cleared bounties", badge: "HOT", url: "/career", status: "available" },
      { name: "Skill Passport", icon: "⚡", description: "Cryptographic skills assessment & polygraph verification", badge: "PRO", url: "/career", status: "available" },
      { name: "Orbit Resume", icon: "📋", description: "AI resume builder with 4 templates", tab: "resume", status: "available" },
      { name: "Skill Probe", icon: "⚡", description: "Skills assessment & expertise testing", tab: "probe", status: "available" },
      { name: "Hire Me Page", icon: "🏆", description: "Professional landing page for recruiters", tab: "hireme", status: "available" },
      { name: "Career Path Sim", icon: "📈", description: "AI career path simulation & projections", badge: "AI", tab: "pathsim", status: "available" },
      { name: "Interview Forge", icon: "🎤", description: "AI interview practice with live Q&A", badge: "AI", tab: "forge", status: "available" },
      { name: "Interview Prep", icon: "🎤", description: "Question generation & prep materials", tab: "interviewprep", status: "available" },
      { name: "Offer Orbit", icon: "💼", description: "Compare & negotiate multiple offers", tab: "offers", status: "available" },
      { name: "Fraud Sentinel", icon: "🛡️", description: "AI job posting fraud detection", badge: "AI", tab: "fraudsentinel", status: "available" },
      { name: "Resume Score", icon: "⭐", description: "AI resume scoring & optimization", badge: "AI", tab: "resumescore", status: "available" },
      { name: "Benefits Decoder", icon: "💰", description: "Total offer value calculator & comparison", tab: "decoder", status: "available" },
      { name: "Orbit Debrief", icon: "🔍", description: "Post-interview analysis & feedback", tab: "debrief", status: "available" },
      { name: "Orbit Watch", icon: "👁", description: "Company watchlist & intel tracking", tab: "orbitwatch", status: "available" },
      { name: "Proof Orbit", icon: "🗂", description: "Portfolio & proof-of-work projects", tab: "proof", status: "available" },
      { name: "Interview Log", icon: "📝", description: "Interview notes & tracking journal", tab: "interviewlog", status: "available" },
      { name: "Referral Engine", icon: "🤝", description: "Professional referral requests & tracking", tab: "referrals", status: "available" },
      { name: "Relocate Advisor", icon: "🗺", description: "Relocation cost & city comparison", tab: "relocate", status: "available" },
      { name: "Signal Check", icon: "🌱", description: "Career signal health & visibility score", tab: "signalcheck", status: "available" },
      { name: "Command Center", icon: "🚀", description: "Central career command dashboard", badge: "PRO", tab: "commandcenter", status: "available" },
      { name: "Orbit Intel", icon: "🔭", description: "Company & market intelligence reports", tab: "orbitintel", status: "available" },
      { name: "Salary War Room", icon: "💵", description: "Salary negotiation analysis & benchmarks", tab: "salarywar", status: "available" },
      { name: "Dark Orbit", icon: "🌑", description: "Hidden job market scanner", tab: "darkorbit", status: "available" },
      { name: "Orbit Blind", icon: "🙈", description: "Anonymous company reviews & ratings", tab: "blind", status: "available" },
      { name: "Team Match", icon: "🤜", description: "Team compatibility & culture matching", tab: "teammatch", status: "available" },
      { name: "MedOrbit", icon: "🏥", description: "Healthcare career vertical & licensing", tab: "medorbit", status: "available" },
      { name: "Command Orbit", icon: "🪖", description: "Military & defense career vertical", tab: "commandorbit", status: "available" },
      { name: "Launch Pad", icon: "🚀", description: "Startup & entrepreneurship career tools", tab: "launchpad", status: "available" },
      { name: "Orbit Score", icon: "⚡", description: "Gamified professional readiness score", tab: "orbitscore", status: "available" },
      { name: "Mission Sim", icon: "🎮", description: "Career gamification missions & challenges", tab: "missionsim", status: "available" },
      { name: "Orbit Market", icon: "🏪", description: "Professional services marketplace", tab: "orbitmarket", status: "available" },
      { name: "Offer Timeline", icon: "⏱️", description: "Offer deadline tracking & management", tab: "offertimeline", status: "available" },
      { name: "Orbit Pulse", icon: "📡", description: "Career market pulse & trend analysis", tab: "orbitpulse", status: "available" },
      { name: "Skill Gap Radar", icon: "🎯", description: "Skills gap analysis & upskill roadmap", tab: "radar", status: "available" },
      { name: "Orbit Vault", icon: "🔐", description: "Secure document & credential storage", url: "/vault", status: "available" },
      { name: "App Funnel", icon: "📊", description: "Application pipeline analytics & tracking", tab: "funnel", status: "available" },
      { name: "JD Match", icon: "🎯", description: "Job description matching & fit analysis", badge: "AI", tab: "jdmatch", status: "available" },
      { name: "CPE Tracker", icon: "🎓", description: "Continuing education & certification tracking", tab: "cpetracker", status: "available" },
      { name: "Negotiation", icon: "💬", description: "Salary negotiation scripts & coaching", badge: "AI", tab: "negotiation", status: "available" },
      { name: "References", icon: "📋", description: "Reference management & request tracking", tab: "references", status: "available" },
      { name: "Comp Builder", icon: "💰", description: "Compensation package builder & analyzer", tab: "compbuilder", status: "available" },
      { name: "Career Timeline", icon: "📅", description: "Visual career milestones & planning", tab: "careertimeline", status: "available" },
      { name: "Orbit News", icon: "📰", description: "Curated career news & industry updates", tab: "orbitnews", status: "available" },
      { name: "Orbit Copilot", icon: "🤖", description: "Floating AI career assistant & advisor", badge: "AI", tab: "copilot", status: "available" },
    ],
  },
  {
    id: "marketplace",
    title: "Marketplace & Services (BAZAAR)",
    subtitle: "AI-powered marketplace, restaurant delivery & safe meetup escrow",
    icon: "🛍️",
    color: "#6366f1",
    apps: [
      { name: "BAZAAR Marketplace", icon: "✦", description: "P2P Escrow marketplace with Bronze/Gold/Diamond verified sellers", badge: "LIVE", url: "/bazaar", status: "available" },
      { name: "BAZAAR Eats", icon: "🍽", description: "DC/MD/VA restaurant delivery with ZIP lookup", badge: "NEW", url: "https://bazaar-standalone.vercel.app", status: "available" },
      { name: "eBay Seller Portal", icon: "📦", description: "Cross-list & manage eBay inventory", url: "https://sphera-backend-alpha.vercel.app/docs#/eBay%20Marketplace", status: "available" },
      { name: "Sphera Vault & Pay", icon: "💳", description: "Decentralized escrow enclave & payment releases", badge: "LIVE", url: "/vault", status: "available" },
      { name: "Local Meetup Zones", icon: "📍", description: "Police department & campus safe exchange hubs", url: "/bazaar", status: "available" },
    ],
  },
  {
    id: "ai",
    title: "AI & Media Intelligence (VeritasLens)",
    subtitle: "Deepfake optical frequency detection, fact verification & knowledge graphs",
    icon: "🤖",
    color: "#8b5cf6",
    apps: [
      { name: "VeritasLens Platform", icon: "🌐", description: "Deepfake shield & claim verification terminal", badge: "HOT", url: "/veritaslens", status: "available" },
      { name: "Blindspot Radar", icon: "👁️", description: "Asymmetric partisan coverage & 1-click unspun wire facts", badge: "RADAR", url: "/veritaslens", status: "available" },
      { name: "BERT Claim Classifier", icon: "🧠", description: "Sentence verification, DeBERTa inference & MLOps drift", badge: "BERT", url: "/veritaslens", status: "available" },
      { name: "VeritasGraph Lineage", icon: "🕸️", description: "OpenLineage provenance graph & XAI confidence weights", badge: "XAI", url: "/veritaslens", status: "available" },
      { name: "7-Day TV Scorecard", icon: "📺", description: "Network credibility deductions & headline spin deconstructor", badge: "SPIN", url: "/veritaslens", status: "available" },
      { name: "B2B Brand Safety", icon: "🛡️", description: "Programmatic ad blocklists (JSON/CSV) & Slack webhooks", badge: "B2B", url: "/veritaslens", status: "available" },
      { name: "AI Viral Hook Studio", icon: "🤖", description: "AI content copilot with viral score simulators", badge: "AI", url: "/ai", status: "available" },
      { name: "Video Creator AI", icon: "🎞️", description: "Generate short videos & hooks with AI", badge: "AI", url: "/ai", status: "available" },
    ],
  },
  {
    id: "events",
    title: "Events & Campus OS",
    subtitle: "Collegiate hackathons, campus calendars, and RSVP tracking",
    icon: "🎉",
    color: "#ef4444",
    apps: [
      { name: "Campus Events & Meetups", icon: "📅", description: "Discover collegiate hackathons, tech talks & RSVPs", url: "/events", status: "available" },
      { name: "Digital Campus OS", icon: "🎓", description: "Decoupled student OS with .EDU verification & GPA badge", badge: "NEW", url: "/campus", status: "available" },
    ],
  },
  {
    id: "security",
    title: "Security & Threat Intelligence",
    subtitle: "AI/LLM defenses, Autonomous Reverse Engineering, Ransomware Recovery & Cross-Platform Orchestration",
    icon: "🛡️",
    color: "#10b981",
    apps: [
      { name: "Expedite Strike & Fusion", icon: "⚡", description: "Autonomous Pentest & ASPM Platform — Expedite Fusion™ Hybrid Scanning, AI-BOM, MCP Server, Choke Point Graph & Auto-PR.", badge: "PORT 9012", url: "http://localhost:9012", status: "available" },
      { name: "ÆGIS · SOC Autonomous PenTest", icon: "🎯", description: "Autonomous AI PenTest console, multi-target asset discovery, PoC terminal & Neo4j attack graphs.", badge: "PORT 9011", url: "http://localhost:9011/app/?standalone=1", status: "available" },
      { name: "Expedite Fusion™ Engine", icon: "✨", description: "Deterministic Rules + Frontier AI Reasoning. 70% fewer false positives across SAST, DAST & Secrets.", badge: "FUSION", url: "http://localhost:9012", status: "available" },
      { name: "Checkmarx / Strike MCP Server", icon: "🔌", description: "Single Model Context Protocol connection providing IDE AI assistants (Cursor, Claude) with enterprise context.", badge: "MCP 2026", url: "http://localhost:9012", status: "available" },
      { name: "AI-BOM & LLM Scanner", icon: "🧠", description: "AI Supply Chain Security — Tracks AI models, fine-tuning datasets, agent swarms & MCP tools against EU AI Act & ISO 42001.", badge: "AI-BOM", url: "http://localhost:9012", status: "available" },
      { name: "Triage & Auto-PR Assist", icon: "🤖", description: "Autonomous agents that verify exploitability and generate review-ready fix Pull Requests directly in GitHub/GitLab.", badge: "AUTO-PR", url: "http://localhost:9012", status: "available" },
      { name: "Unified Integration Layer", icon: "🌐", description: "Product 3 · Cross-Platform Ecosystem Hub — Enterprise orchestration layer federating CERBERUS-RE, Aegis Recovery, and AXIOM DAST with 24.5k evt/s telemetry & SOAR playbooks.", badge: "LIVE", url: "https://18-unified-integration-layer.vercel.app", status: "available" },
      { name: "AXIOM DAST", icon: "⚡", description: "Dynamic Application Security Testing Platform — Enterprise DAST security platform with OWASP Top 10 fuzzing, post-exploitation engine, and live ZAP/Wapiti scan automation.", badge: "LIVE", url: "https://11-dast-security-platform.vercel.app", status: "available" },
      { name: "Aegis Recovery", icon: "🛡️", description: "Product 2 · Ransomware Recovery & Resilience (78 Studios) — Full-lifecycle autonomous ransomware recovery, exposure digital twin, eBPF syscall freeze, in-memory key carving & AD-FDR.", badge: "LIVE", url: "https://17-ransomware-recovery-platform.vercel.app", status: "available" },
      { name: "Expedite Consults", icon: "🛡️", description: "Cybersecurity Solutions You Can Trust — Expert cybersecurity, cloud security, and risk management to help organizations move forward securely.", badge: "LIVE", url: "https://expedite-consults.vercel.app", status: "available" },
      { name: "CERBERUS-RE", icon: "🦠", description: "Product 1 · Autonomous Malware Intelligence (62 Studios) — Autonomous binary reverse engineering, Cutter/Ghidra disassembler, x32dbg dynamic debugger, Volatility memory analysis & YARA forge.", badge: "LIVE", url: "https://16-malware-analysis-platform.vercel.app", status: "available" },
      { name: "Product 4: AXIOM Cloud", icon: "☁️", description: "Multi-cloud attack path analysis, IAM privesc & authorized pentest.", badge: "PRODUCT 4", url: "https://19-cloud-security-platform.vercel.app", status: "available" },
      { name: "Multi-Cloud Attack Paths", icon: "🕸️", description: "Chained exploit paths across AWS STS, Azure RBAC & GCP IAM.", badge: "FLAGSHIP", url: "https://19-cloud-security-platform.vercel.app/attack-paths", status: "available" },
      { name: "IAM Privilege Escalation", icon: "🔑", description: "28+ Cloud IAM privesc paths (PassRole, AssumeRole, actAs).", badge: "PRIVESC", url: "https://19-cloud-security-platform.vercel.app/iam-analyzer", status: "available" },
      { name: "Cloud PenTest Drills", icon: "⚡", description: "Safe authorized exploit verification across AWS, Azure & GCP.", badge: "PENTEST", url: "https://19-cloud-security-platform.vercel.app/pentest", status: "available" },
      { name: "Multi-Cloud CSPM Engine", icon: "🛡️", description: "CIS AWS/Azure/GCP v3.0, NIST 800-53 & auto-remediation.", badge: "CSPM", url: "https://19-cloud-security-platform.vercel.app/cspm", status: "available" },
      { name: "Kubernetes Cloud Security", icon: "📦", description: "EKS, AKS & GKE pod escape & cloud IAM role protection.", badge: "K8S", url: "https://19-cloud-security-platform.vercel.app/kubernetes", status: "available" },
      { name: "Product 3: Unified Nexus", icon: "🌐", description: "Enterprise integration layer, gRPC bus & cross-platform SOAR.", badge: "PRODUCT 3", url: "https://18-unified-integration-layer.vercel.app", status: "available" },
      { name: "Product 2: Aegis Recovery", icon: "🛡️", description: "Full-lifecycle ransomware recovery & resilience (78 studios).", badge: "PRODUCT 2", url: "https://17-ransomware-recovery-platform.vercel.app", status: "available" },
      { name: "Product 1: CERBERUS-RE", icon: "🦠", description: "Autonomous malware reverse engineering & dynamic debugger (62 studios).", badge: "PRODUCT 1", url: "https://16-malware-analysis-platform.vercel.app", status: "available" },
      { name: "GPU Analytics & RAPIDS cuDF", icon: "⚡", description: "10,000 CUDA worker threads scanning parallel file blocks in < 12ms.", badge: "CUDA", url: "https://17-ransomware-recovery-platform.vercel.app/gpu-analytics", status: "available" },
      { name: "Adaptive Dynamic Baselining", icon: "📊", description: "Gaussian 3-sigma (μ+3σ) role-based device profiles & time windows.", badge: "DYNAMIC", url: "https://17-ransomware-recovery-platform.vercel.app/adaptive-baselining", status: "available" },
      { name: "Multi-Stage 6-Signal Scoring", icon: "🎯", description: "6-tier false-positive elimination with FPR < 1.2% & Precision 98.6%.", badge: "PRECISION", url: "https://17-ransomware-recovery-platform.vercel.app/multi-stage-scoring", status: "available" },
      { name: "Zero-Loss Safe Recovery", icon: "🛡️", description: "5-Step non-destructive pipeline with application render verification.", badge: "ZERO-LOSS", url: "https://17-ransomware-recovery-platform.vercel.app/zero-loss-workflow", status: "available" },
      { name: "Synthetic Attack Lab & Bench", icon: "🧪", description: "5 Safe non-destructive behavioral attack simulations & SLA bench.", badge: "BENCH", url: "https://17-ransomware-recovery-platform.vercel.app/synthetic-attack-lab", status: "available" },
      { name: "AXIOM DAST Platform", icon: "⚡", description: "Dynamic AppSec scanner, OWASP Top 10 fuzzer & post-exploit engine.", badge: "LIVE", url: "https://11-dast-security-platform.vercel.app", status: "available" },
      { name: "Exposure Digital Twin", icon: "🕸️", description: "6-layer ransomware cascade failure & blast radius modeler.", badge: "TWIN", url: "https://17-ransomware-recovery-platform.vercel.app/exposure-digital-twin", status: "available" },
      { name: "eBPF Syscall Freeze & Key Rescue", icon: "⚡", description: "Sub-millisecond thread pre-emption & RAM key carving.", badge: "KERNEL", url: "https://17-ransomware-recovery-platform.vercel.app/ebpf-freeze", status: "available" },
      { name: "AD Forest Recovery (AD-FDR)", icon: "🌳", description: "Clean DC factory & automated KRBTGT double-roll sequencer.", badge: "IDENTITY", url: "https://17-ransomware-recovery-platform.vercel.app/ad-forest-recovery", status: "available" },
      { name: "Attack Progression Model", icon: "⏱️", description: "8-stage kill chain tracking & pre-encryption countdown.", badge: "KILLCHAIN", url: "https://17-ransomware-recovery-platform.vercel.app/attack-progression", status: "available" },
      { name: "Cryptanalytic Bridge", icon: "🔗", description: "CERBERUS-RE to Aegis live decryptor auto-compiler & dispatcher.", badge: "BRIDGE", url: "https://17-ransomware-recovery-platform.vercel.app/cryptanalytic-bridge", status: "available" },
      { name: "Cross-Platform SOAR Engine", icon: "🤖", description: "Multi-product closed-loop automated playbooks & workflow DAG.", badge: "SOAR", url: "https://18-unified-integration-layer.vercel.app/cross-platform-playbooks", status: "available" },
      { name: "Federated Telemetry Bus", icon: "📡", description: "Real-time streaming gRPC/Kafka telemetry (24,500 evt/sec).", badge: "STREAM", url: "https://18-unified-integration-layer.vercel.app/federated-telemetry", status: "available" },
      { name: "Enterprise Threat Intel Hub", icon: "🛡️", description: "Bi-directional STIX 2.1 / TAXII 2.1 IOC & threat actor sync.", badge: "STIX 2.1", url: "https://18-unified-integration-layer.vercel.app/shared-threat-intel", status: "available" },
      { name: "Aegis Security SOC", icon: "⚡", description: "Real-time SIEM defense cockpit & ClickHouse/Kafka threat streams.", badge: "LIVE", url: "https://expedite-strike.onrender.com/app/", status: "available" },
      { name: "Expedite Strike Engine", icon: "⚡", description: "Autonomous pentesting engine dashboard and execution control.", badge: "LIVE", url: "https://expedite-strike.onrender.com/xstrike/", status: "available" },
      { name: "AI/LLM Security Sandbox", icon: "🧠", description: "Meta Llama Guard 3 & NeMo guardrail defense evaluator.", badge: "AI", url: "https://14-exploitability-platform.vercel.app/ai-security", status: "available" },
      { name: "AI Red Teaming", icon: "🎯", description: "Autonomous adversary agent emulator & MITRE ATT&CK simulator.", badge: "AI", url: "https://14-exploitability-platform.vercel.app/ai-redteam", status: "available" },
      { name: "Multi-Agent Swarm (LangGraph)", icon: "🤖", description: "Decentralized ReAct consensus engine & autonomic software repair.", badge: "SWARM", url: "https://14-exploitability-platform.vercel.app/agent-swarm", status: "available" },
      { name: "Attack Chain Visualizer", icon: "🔗", description: "PyTorch GNN GraphSAGE & Neo4j blast radius visualizer.", badge: "GNN", url: "https://15-threat-modeling-platform.vercel.app/attack-chain", status: "available" },
      { name: "STRIDE Modeler", icon: "🛡️", description: "LLM-synthesized threat modeling & SOC2/ISO 27001 export.", badge: "SOC2", url: "https://15-threat-modeling-platform.vercel.app/threat-model", status: "available" },
      { name: "AXIOM Exploitability", icon: "⚡", description: "Controlled exploit validation & live cross-app telemetry broadcast.", badge: "LIVE", url: "https://14-exploitability-platform.vercel.app/exploit", status: "available" },
      { name: "05-SAST Platform", icon: "🛡️", description: "DeepSeek-Coder source code vulnerability analyzer.", url: "https://05-sast-platform.vercel.app", status: "available" },
      { name: "06-SCA Platform", icon: "📦", description: "Software Composition Analysis dependency scanning.", url: "https://06-sca-platform.vercel.app", status: "available" },
      { name: "07-Secrets Platform", icon: "🔑", description: "Audit credentials, certificates, and leaked keys.", url: "https://07-secrets-platform.vercel.app", status: "available" },
      { name: "08-Container Security", icon: "🐳", description: "Docker container and base image vulnerability checks.", url: "https://08-container-security-platform.vercel.app", status: "available" },
      { name: "09-Kubernetes Security", icon: "☸️", description: "K8s cluster runtime and manifest configuration checks.", url: "https://09-k8s-security-platform.vercel.app", status: "available" },
      { name: "10-IaC Security", icon: "🏗️", description: "Infrastructure-as-Code Terraform policy checks.", url: "https://10-iac-security-platform.vercel.app", status: "available" },
      { name: "12-API Security", icon: "📡", description: "REST/GraphQL API schema fuzzing and validation checks.", url: "https://12-api-security-platform.vercel.app", status: "available" },
      { name: "13-Mobile Security", icon: "📱", description: "iOS and Android client security verification audits.", url: "https://13-mobile-security-platform.vercel.app", status: "available" },
      { name: "14-Exploitability Hub", icon: "⚡", description: "Exploitation probability & weaponization validation.", url: "https://14-exploitability-platform.vercel.app", status: "available" },
      { name: "15-Threat Modeler", icon: "🗺️", description: "Automated architecture threat analysis & STRIDE mapping.", url: "https://15-threat-modeling-platform.vercel.app", status: "available" },
    ],
  },
];

const crossPlatformSharing = [
  { name: "Instagram", icon: "📷" },
  { name: "LinkedIn", icon: "💼" },
  { name: "X", icon: "✕" },
  { name: "Facebook", icon: "📘" },
  { name: "TikTok", icon: "🎵" },
];

/* ─── Badge component ─── */
function Badge({ type }: { type: string }) {
  const classMap: Record<string, string> = {
    HOT: "badge-hot",
    NEW: "badge-new",
    LIVE: "badge-live",
    PRO: "badge-pro",
    AI: "badge-ai",
    COMING: "badge-coming",
    FLAGSHIP: "badge-hot",
    SECURE: "badge-pro",
    EDU: "badge-new",
  };

  const iconMap: Record<string, string> = {
    HOT: "🔥",
    NEW: "✨",
    LIVE: "🔴",
    PRO: "⚡",
    AI: "🤖",
    COMING: "⏳",
    FLAGSHIP: "💎",
    SECURE: "🔐",
    EDU: "🎓",
  };

  return (
    <span className={`badge ${classMap[type] || "badge-coming"}`}>
      {iconMap[type]} {type}
    </span>
  );
}

/* ─── App Card ─── */
function AppCard({ app, delay }: { app: AppItem; delay: number }) {
  const isInternal = app.url?.startsWith("/");

  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
          {app.icon}
        </span>
        <div className="flex gap-1">
          {app.badge && <Badge type={app.badge} />}
          {app.status === "coming" && <Badge type="COMING" />}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-text-primary">{app.name}</h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">{app.description}</p>
      </div>
      <div className="mt-auto pt-2 flex items-center justify-between">
        {app.status === "available" ? (
          <span className="flex items-center gap-1.5 text-[10px] text-accent-green font-medium">
            <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            Available
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium">
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full" />
            Coming Soon
          </span>
        )}
        {app.url && app.status === "available" && (
          <span className="text-[10px] text-accent-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Open →
          </span>
        )}
      </div>
    </>
  );

  if (app.url && app.status === "available") {
    if (isInternal) {
      return (
        <Link
          href={app.url}
          className="glass-card p-4 flex flex-col gap-3 cursor-pointer group opacity-0 animate-fade-in-up block"
          style={{ animationDelay: `${delay}s` }}
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card p-4 flex flex-col gap-3 cursor-pointer group opacity-0 animate-fade-in-up block"
        style={{ animationDelay: `${delay}s` }}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className="glass-card p-4 flex flex-col gap-3 cursor-pointer group opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {cardContent}
    </div>
  );
}

/* ─── Category Section ─── */
function CategorySection({ category }: { category: Category }) {
  return (
    <section id={category.id} className="mb-14">
      <div className="category-header">
        <div
          className="category-icon"
          style={{ background: `${category.color}15`, border: `1px solid ${category.color}30` }}
        >
          {category.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{category.title}</h2>
          <p className="text-xs text-text-muted">{category.subtitle}</p>
        </div>
        <span
          className="ml-auto text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: `${category.color}15`, color: category.color }}
        >
          {category.apps.length} apps
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {category.apps.map((app, i) => (
          <AppCard key={app.name + i} app={app} delay={i * 0.04 + 0.05} />
        ))}
      </div>
    </section>
  );
}

/* ─── Product Card (Top Ecosystem Section) ─── */
function ProductCard({
  product,
  delay,
}: {
  product: (typeof products)[0];
  delay: number;
}) {
  const isInternal = product.url.startsWith("/");

  const inner = (
    <div
      className="product-card group opacity-0 animate-fade-in-up block h-full flex flex-col justify-between"
      style={
        { animationDelay: `${delay}s`, "--card-accent": product.color } as React.CSSProperties
      }
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-500">
          {product.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-text-primary">{product.name}</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `${product.color}20`, color: product.color }}
            >
              {product.badge || "Live"}
            </span>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: product.color }}>
            {product.tagline}
          </p>
          <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-accent-green">
          <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          Online
        </span>
        <span
          className="text-xs font-medium group-hover:translate-x-1 transition-transform duration-300"
          style={{ color: product.color }}
        >
          {isInternal ? "Enter Social Graph →" : "Visit →"}
        </span>
      </div>
    </div>
  );

  if (isInternal) {
    return (
      <Link href={product.url} className="block">
        {inner}
      </Link>
    );
  }

  return (
    <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  );
}

/* ─── Floating Orb ─── */
function FloatingOrb({
  color,
  size,
  top,
  left,
  delay,
}: {
  color: string;
  size: number;
  top: string;
  left: string;
  delay: string;
}) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 animate-float pointer-events-none"
      style={{
        background: color,
        width: size,
        height: size,
        top,
        left,
        animationDelay: delay,
      }}
    />
  );
}

/* ─── MAIN LAUNCHPAD PAGE ─── */
export default function LaunchpadPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeHeading, setActiveHeading] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const headings = [
    { id: "all", title: "All Ecosystem", icon: "🌐", color: "#00d4ff" },
    { id: "sphera", title: "SpheraNet Universe", icon: "🌍", color: "#00d4ff" },
    { id: "content", title: "Content & Creation", icon: "🎬", color: "#ec4899" },
    { id: "social", title: "Social & Community", icon: "💬", color: "#10b981" },
    { id: "career", title: "Career & Professional", icon: "💼", color: "#f59e0b" },
    { id: "ai", title: "AI & Innovation", icon: "🤖", color: "#8b5cf6" },
    { id: "marketplace", title: "Marketplace & Services", icon: "🛍️", color: "#6366f1" },
    { id: "security", title: "Cybersecurity & Defense", icon: "🛡️", color: "#10b981" },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeHeading === "all") return true;
    if (activeHeading === "sphera") return p.name.includes("Sphera") || p.name === "SpheraCut" || p.name === "CareerOrbit Suite";
    if (activeHeading === "content") return p.name === "SpheraCut" || p.name.includes("Studio");
    if (activeHeading === "social") return p.name.includes("Social") || p.name.includes("SpheraNet");
    if (activeHeading === "career") return p.name.includes("Career");
    if (activeHeading === "ai") return p.name === "VeritasLens" || p.name === "SpheraCut";
    if (activeHeading === "marketplace") return p.name.includes("BAZAAR") || p.name === "SkillHands";
    if (activeHeading === "security") return p.name.includes("Security") || p.name.includes("Consults") || p.name.includes("Recovery") || p.name.includes("CERBERUS") || p.name.includes("AXIOM") || p.name.includes("Strike") || p.name.includes("Ægis");
    return true;
  });

  const headingCategories = categories.filter((c) => {
    if (activeHeading === "all") return true;
    if (activeHeading === "sphera") return ["sphera-network", "profile", "content", "social", "career", "marketplace", "ai", "events"].includes(c.id);
    if (activeHeading === "security") return c.id === "security";
    if (activeHeading === "content") return c.id === "content" || c.id === "profile";
    if (activeHeading === "social") return c.id === "social" || c.id === "sphera-network";
    if (activeHeading === "career") return c.id === "career";
    if (activeHeading === "ai") return c.id === "ai";
    if (activeHeading === "marketplace") return c.id === "marketplace";
    return true;
  });

  const allApps = categories.flatMap((c) =>
    c.apps.map((app) => ({ ...app, categoryId: c.id, categoryTitle: c.title }))
  );

  const filteredCategories = searchQuery
    ? headingCategories
        .map((c) => ({
          ...c,
          apps: c.apps.filter(
            (a) =>
              a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((c) => c.apps.length > 0)
    : activeCategory === "all"
    ? headingCategories
    : headingCategories.filter((c) => c.id === activeCategory);

  const totalApps = allApps.length;
  const availableApps = allApps.filter((a) => a.status === "available").length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative">
      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <FloatingOrb color="#00d4ff" size={400} top="5%" left="80%" delay="0s" />
        <FloatingOrb color="#8b5cf6" size={350} top="40%" left="-5%" delay="2s" />
        <FloatingOrb color="#ec4899" size={300} top="70%" left="70%" delay="4s" />
        <FloatingOrb color="#10b981" size={250} top="20%" left="30%" delay="6s" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05),transparent_50%)]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border-glass bg-bg-primary/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-lg font-black text-white shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              E
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary leading-none">
                Expedite Consults
              </h1>
              <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                PORTAL & LAUNCHPAD
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps, features, tools across 147 apps..."
                className="w-full bg-bg-secondary/60 border border-border-glass rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:bg-bg-secondary transition-all"
              />
            </div>
          </div>

          {/* Action Links & Stats */}
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#6366f1] text-[#08090d] text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,212,255,0.25)]"
            >
              <span>🌐</span>
              <span>Open SpheraNet</span>
            </Link>

            <div className="hidden md:flex items-center gap-3 text-xs text-text-muted pl-2 border-l border-border-glass">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                {availableApps} Active
              </span>
              <span>{totalApps} Apps</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
              All Systems Operational
            </span>
          </div>

          <h1 className="opacity-0 animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-black leading-tight" style={{ animationDelay: "0.2s" }}>
            Your Digital{" "}
            <span className="glow-text">Ecosystem</span>
          </h1>

          <p className="opacity-0 animate-fade-in-up mt-5 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: "0.3s" }}>
            Access all Expedite Consults products and Sphera platform modules from one place. Cybersecurity, services, social, and AI — all connected.
          </p>

          {/* Quick Stats */}
          <div className="opacity-0 animate-fade-in-up mt-10 flex items-center justify-center gap-6 sm:gap-10 flex-wrap" style={{ animationDelay: "0.4s" }}>
            {[
              { value: `${products.length}`, label: "Products", color: "#00d4ff" },
              { value: `${totalApps}`, label: "Sphera Apps", color: "#8b5cf6" },
              { value: `${categories.length}`, label: "Categories", color: "#ec4899" },
              { value: "99.3%", label: "Uptime", color: "#10b981" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Major Headings Filter ── */}
        <section className="mb-12 mt-4 text-center">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {headings.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setActiveHeading(h.id);
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className={`shrink-0 px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  activeHeading === h.id
                    ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan shadow-lg shadow-accent-cyan/5"
                    : "bg-bg-secondary/50 text-text-muted border-border-glass hover:text-text-primary hover:border-border-glass-hover"
                }`}
                style={
                  activeHeading === h.id
                    ? { borderColor: h.color, color: h.color, background: `${h.color}15` }
                    : {}
                }
              >
                <span className="text-sm">{h.icon}</span>
                {h.title}
              </button>
            ))}
          </div>
        </section>

        {/* ── Products ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-text-primary">Products & Services</h2>
            <div className="section-divider flex-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.name} product={p} delay={i * 0.08 + 0.2} />
            ))}
          </div>
        </section>

        {/* ── Category Filter ── */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-text-primary">Sphera Platform Modules ({availableApps} Live)</h2>
            <div className="section-divider flex-1" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCategory === "all" && !searchQuery
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                  : "bg-bg-secondary/50 text-text-muted border border-border-glass hover:text-text-primary"
              }`}
            >
              All Apps ({totalApps})
            </button>
            {headingCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveCategory(c.id); setSearchQuery(""); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === c.id && !searchQuery
                    ? "border"
                    : "bg-bg-secondary/50 text-text-muted border border-border-glass hover:text-text-primary"
                }`}
                style={
                  activeCategory === c.id && !searchQuery
                    ? { background: `${c.color}15`, color: c.color, borderColor: `${c.color}40` }
                    : {}
                }
              >
                <span>{c.icon}</span>
                {c.title}
              </button>
            ))}
          </div>
        </section>

        {/* ── App Categories ── */}
        {filteredCategories.map((c) => (
          <CategorySection key={c.id} category={c} />
        ))}

        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-text-secondary">No apps found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {/* ── Cross Platform Sharing ── */}
        <section className="mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="glass-card p-6 sm:p-8 text-center">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              🔗 Cross-Platform Sharing
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Share your content across all major platforms
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {crossPlatformSharing.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary/60 border border-border-glass hover:border-accent-cyan/30 transition-all cursor-pointer hover:-translate-y-1"
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-xs font-medium text-text-secondary">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border-glass py-8 text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Expedite Consults LLC. All rights reserved.
          </p>
          <p className="text-[10px] text-text-muted/50 mt-2">
            Portal v1.0 — All Systems Operational · SpheraNet Sovereign Enclave
          </p>
        </footer>
      </div>
    </div>
  );
}
