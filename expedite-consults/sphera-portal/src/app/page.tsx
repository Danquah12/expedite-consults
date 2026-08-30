"use client";

import { useState, useEffect } from "react";

/* ─── data ─── */
const products = [
  {
    name: "ConnectIn — Autonomous AI Professional Ecosystem",
    tagline: "Next-Gen Professional Network, 2FA Passkeys, MicroVM Sandboxes, Enterprise Bounties & Admin IAM",
    description:
      "Enterprise professional intelligence & networking ecosystem — ⚡ Home Feed & Skill Passport (94.8%), 🏢 $2.4M Procurement Spend Desk & RFPs, 🎬 ConnectIn Studio & Podcasts ($92.4K Attribution), 💼 Seller Center ($122.7K MRR), 🏆 $15K–$50K Bounties, 🛡️ TS/SCI Cleared Guilds, 🖥️ Side-by-Side MicroVM Video Sandboxes, and 🔐 Platform IAM Enclave with 4-Eyes Approvals.",
    url: "https://expedite-consults.vercel.app/connectin",
    color: "#0A66C2",
    icon: "💼",
    status: "live",
  },
  {
    name: "ConnectIn Identity & Auth Gate",
    tagline: "FIDO2 Passkeys, 2FA Email/SMS Verification & Role Routing",
    description:
      "Universal cryptographic authentication portal with Two-Factor confirmation (Email & SMS text codes), biometric passkeys, dynamic persona switching, and automated workspace routing.",
    url: "https://expedite-consults.vercel.app/connectin-login",
    color: "#10b981",
    icon: "🔐",
    status: "live",
  },
  {
    name: "The Digital Campus (CampusSync)",
    tagline: "Decoupled Campus Operating Platform with Reels, Games & Co-Curricular Records",
    description:
      "All-in-one university community operating engine — 🔴 Live On Campus pulse, Campus Reels vertical video, Campus Games & Cybersecurity Challenge, Find My People peer matchmaker, 30s Quick Groups, Opportunity Hub, and verified Co-Curricular service transcripts.",
    url: "https://expedite-consults.vercel.app/campus",
    color: "#6366f1",
    icon: "🎓",
    status: "live",
  },
  {
    name: "Student Verification & Onboarding",
    tagline: ".edu Institutional SSO & 3-Step Student Profile Onboarding",
    description:
      "Verified academic authentication wizard for students, student club officers, and university faculty advisors.",
    url: "https://expedite-consults.vercel.app/campus/login",
    color: "#10b981",
    icon: "🔐",
    status: "live",
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
    url: "https://bazaar-standalone.vercel.app",
    color: "#6366f1",
    icon: "🛍️",
    status: "live",
  },
  {
    name: "CareerOrbit Suite",
    tagline: "44-Tool Enterprise Career & ATS Mobility Suite",
    description:
      "Complete standalone intelligence suite with 44 deep-linked tools — JD Match, Interview Forge, Dark Orbit, Offer War Room, and Command Center.",
    url: "https://careerorbit-standalone.vercel.app",
    color: "#f59e0b",
    icon: "🚀",
    status: "live",
  },
  {
    name: "SPHERA Studio",
    tagline: "10-Tool Creation & Content Suite",
    description:
      "Dedicated creative powerhouse — Reels vertical video, SphereVision TV, Video Studio editor, AI Video Creator, SpheraCut, and Live Broadcasting.",
    url: "https://sphera-studio.vercel.app",
    color: "#ec4899",
    icon: "🎬",
    status: "live",
  },
  {
    name: "SPHERA Social",
    tagline: "9-Tool Community & Networking Suite",
    description:
      "Independent social ecosystem — Communities, Encrypted SphereChat DMs, Orbit Connections, SpheraMatch AI matching, and Nexus global broadcast.",
    url: "https://sphera-social.vercel.app",
    color: "#10b981",
    icon: "🌐",
    status: "live",
  },
  {
    name: "Sphera Main Platform",
    tagline: "Unified Digital Universe",
    description:
      "Next-gen social universe uniting feed streams, career mobility, marketplace commerce, and creator tools in one experience.",
    url: "https://sphera.expediteconsults.com",
    color: "#00d4ff",
    icon: "🌍",
    status: "live",
  },
  {
    name: "VeritasLens",
    tagline: "AI Media Credibility & Information Intelligence Platform",
    description:
      "Bloomberg Terminal + Ground News + Reuters + Knowledge Graph. Real-time Kafka stream ingestion, BERT claim classification, 7-Day TV scorecard & B2B Brand Safety ad-shield.",
    url: "https://expedite-consults.vercel.app/veritaslens",
    color: "#06b6d4",
    icon: "🌐",
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
    id: "connectin",
    title: "ConnectIn — AI Professional & Enterprise Suite",
    subtitle: "10-tool autonomous intelligence layer, verified identities, microVM sandboxes & escrow bounties",
    icon: "💼",
    color: "#0A66C2",
    apps: [
      { name: "ConnectIn Main Feed", icon: "in", description: "Home Feed, Skill Passport (94.8%) & AI Network", badge: "HOT", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "2FA & Auth Gate", icon: "🔐", description: "Email & SMS 2FA, Passkeys & Session Registry", badge: "2FA", url: "https://expedite-consults.vercel.app/connectin-login", status: "available" },
      { name: "Media & Live Sandbox", icon: "🎥", description: "Interactive video player with Firecracker Linux sandbox", badge: "SANDBOX", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "AI Agents Marketplace", icon: "🤖", description: "Deploy autonomous security, recruiting & sales agents", badge: "AGENTS", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "Enterprise Bounties", icon: "🏆", description: "$15K–$50K hackathons and GitHub PR bounty submissions", badge: "$50K", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "TS/SCI Gated Guilds", icon: "🛡️", description: "Polygraph-cleared defense enclaves & $120K founder pools", badge: "TS/SCI", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "Admin IAM & 4-Eyes", icon: "⚖️", description: "4.28M User directory, 6 enforcement states & audit log", badge: "IAM", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "ConnectIn Code", icon: "🧑‍💻", description: "GitHub repo sync & recruit by verified commit telemetry", badge: "CODE", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "Seller Center", icon: "💼", description: "$122.7K MRR software storefront, licenses & escrow payout", badge: "$122K", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
      { name: "Procurement Desk", icon: "🏢", description: "$2.4M spend desk, active GovCloud RFPs & vendor bids", badge: "$2.4M", url: "https://expedite-consults.vercel.app/connectin", status: "available" },
    ],
  },
  {
    id: "profile",
    title: "Profile & Identity",
    subtitle: "Your personal space",
    icon: "👤",
    color: "#8b5cf6",
    apps: [
      { name: "My Profile", icon: "◯", description: "Manage your identity & personal orbit", tab: "profile", status: "available" },
      { name: "Orbiters", icon: "🌐", description: "Followers & following network", tab: "network", status: "available" },
      { name: "Your Channels", icon: "📺", description: "Professional, Creative, Personal & Business", badge: "NEW", tab: "feed", status: "available" },
    ],
  },
  {
    id: "content",
    title: "Content & Creation (SPHERA Studio)",
    subtitle: "10 standalone creative tools — video, audio, streaming & editing",
    icon: "🎬",
    color: "#ec4899",
    apps: [
      { name: "Reels", icon: "▶", description: "TikTok-style vertical video feed & upload", badge: "HOT", tab: "reels", status: "available" },
      { name: "SphereVision", icon: "🎥", description: "TV-style streaming content", badge: "HOT", tab: "watch", status: "available" },
      { name: "Video Studio", icon: "🎬", description: "Professional video editing", badge: "NEW", tab: "videostudio", status: "available" },
      { name: "Video Creator", icon: "🎞️", description: "AI-powered video generation", badge: "AI", tab: "creator", status: "available" },
      { name: "SpheraCut", icon: "✂️", description: "AI Creative Suite — Video, Image, Story & Audio", badge: "HOT", url: "https://spheracut.expediteconsults.com", status: "available" },
      { name: "Creator Studio", icon: "📊", description: "Analytics & content management", tab: "creatorstudio", status: "available" },
      { name: "Pulse", icon: "⟳", description: "Real-time live conversation streams", badge: "LIVE", tab: "pulse", status: "available" },
      { name: "Spaces", icon: "🎙", description: "Audio rooms & discussions", tab: "spaces", status: "available" },
      { name: "Go Live", icon: "🔴", description: "Live streaming to your audience", badge: "LIVE", tab: "live", status: "available" },
      { name: "Stories", icon: "◎", description: "24-hour ephemeral content", tab: "stories", status: "available" },
    ],
  },
  {
    id: "social",
    title: "Social & Community (SPHERA Social)",
    subtitle: "9 standalone community & communication tools",
    icon: "🌍",
    color: "#10b981",
    apps: [
      { name: "Groups", icon: "◈", description: "Join & create communities", tab: "groups", status: "available" },
      { name: "SpheraChat", icon: "💬", description: "Real-time encrypted messaging & DMs", tab: "messages", status: "available" },
      { name: "Connections", icon: "🤝", description: "Build your professional network", tab: "network", status: "available" },
      { name: "SpheraMatch", icon: "💫", description: "AI-powered people matching & swipe cards", badge: "AI", tab: "linkedup", status: "available" },
      { name: "Nexus", icon: "🌊", description: "Twitter/X-style global broadcast hub", badge: "NEW", tab: "nexus", status: "available" },
      { name: "Discover", icon: "🔍", description: "Explore people, topics & hashtags", tab: "discover", status: "available" },
      { name: "Book Club", icon: "📚", description: "Read & discuss tech books together", tab: "bookclub", status: "available" },
      { name: "Recipe Hub", icon: "🍽", description: "Share & discover recipes", tab: "recipehub", status: "available" },
      { name: "Fitness", icon: "💪", description: "Workout community & health tracking", tab: "fitness", status: "available" },
    ],
  },
  {
    id: "career",
    title: "Career & Professional (CareerOrbit)",
    subtitle: "44 standalone AI-powered career intelligence & mobility tools",
    icon: "💼",
    color: "#f59e0b",
    apps: [
      { name: "CareerOrbit", icon: "🚀", description: "Job search, orbit matching & applications", badge: "HOT", tab: "careerorbit", status: "available" },
      { name: "Elevate", icon: "⚡", description: "Learning & skill development", badge: "PRO", tab: "elevate", status: "available" },
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
      { name: "Orbit Vault", icon: "🔐", description: "Secure document & credential storage", tab: "vault", status: "available" },
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
    subtitle: "AI-powered marketplace, restaurant delivery & seller portal",
    icon: "🛍",
    color: "#6366f1",
    apps: [
      { name: "BAZAAR Marketplace", icon: "✦", description: "Standalone marketplace with 37+ products & full checkout", badge: "LIVE", url: "https://bazaar-standalone.vercel.app", status: "available" },
      { name: "BAZAAR Eats", icon: "🍽", description: "DC/MD/VA restaurant delivery with ZIP lookup", badge: "NEW", url: "https://bazaar-standalone.vercel.app", status: "available" },
      { name: "eBay Seller Portal", icon: "📦", description: "Cross-list & manage eBay inventory", url: "https://sphera-backend-alpha.vercel.app/docs#/eBay%20Marketplace", status: "available" },
      { name: "Sphera Pay", icon: "💳", description: "Payments & digital wallet", badge: "LIVE", tab: "spherapay", status: "available" },
      { name: "Local", icon: "📍", description: "Nearby tech hubs & regional meetups", tab: "local", status: "available" },
    ],
  },
  {
    id: "events",
    title: "Events & Time",
    subtitle: "Time-based content",
    icon: "🎉",
    color: "#ef4444",
    apps: [
      { name: "Events", icon: "📅", description: "Discover & create events", tab: "events", status: "available" },
      { name: "Time Capsule", icon: "⧗", description: "Save memories for the future", badge: "NEW", tab: "timecapsule", status: "available" },
    ],
  },
  {
    id: "ai",
    title: "AI & Media Intelligence",
    subtitle: "Powered by artificial intelligence, claim verification & knowledge graphs",
    icon: "🤖",
    color: "#8b5cf6",
    apps: [
      { name: "VeritasLens Platform", icon: "🌐", description: "Bloomberg Terminal for Media Credibility & Fact Verification", badge: "HOT", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "Blindspot Radar", icon: "👁️", description: "Asymmetric partisan coverage & 1-click unspun wire facts", badge: "RADAR", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "BERT Claim Classifier", icon: "🧠", description: "Sentence verification, DeBERTa inference & MLOps drift", badge: "BERT", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "VeritasGraph Lineage", icon: "🕸️", description: "OpenLineage provenance graph & XAI confidence weights", badge: "XAI", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "7-Day TV Scorecard", icon: "📺", description: "Network credibility deductions & headline spin deconstructor", badge: "SPIN", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "B2B Brand Safety", icon: "🛡️", description: "Programmatic ad blocklists (JSON/CSV) & Slack webhooks", badge: "B2B", url: "https://expedite-consults.vercel.app/veritaslens", status: "available" },
      { name: "AI Match 2.0", icon: "🤖", description: "Smart people & content matching", badge: "AI", tab: "discover", status: "available" },
      { name: "AI News Anchor", icon: "📡", description: "AI-generated news broadcasts", badge: "AI", tab: "feed", status: "available" },
      { name: "Video Creator AI", icon: "🎞️", description: "Generate videos with AI", badge: "AI", tab: "videocreator", status: "available" },
      { name: "SpheraReel AI", icon: "🎬", description: "Auto-generated short reels", badge: "AI", status: "coming" },
    ],
  },
  {
    id: "events",
    title: "Events & Time",
    subtitle: "Time-based content",
    icon: "🎉",
    color: "#ef4444",
    apps: [
      { name: "Events", icon: "📅", description: "Discover & create events", tab: "events", status: "available" },
      { name: "Time Capsule", icon: "⧗", description: "Save memories for the future", badge: "NEW", tab: "capsule", status: "available" },
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
    REPO: "badge-pro",
    LOCAL: "badge-new",
  };

  const iconMap: Record<string, string> = {
    HOT: "🔥",
    NEW: "✨",
    LIVE: "🔴",
    PRO: "⚡",
    AI: "🤖",
    COMING: "⏳",
    REPO: "📦",
    LOCAL: "💻",
  };

  return (
    <span className={`badge ${classMap[type] || "badge-coming"}`}>
      {iconMap[type]} {type}
    </span>
  );
}

/* ─── App Card ─── */
function AppCard({ app, delay }: { app: AppItem; delay: number }) {
  const studioTabs = new Set(["reels", "watch", "videostudio", "creator", "videocreator", "spheracut", "creatorstudio", "pulse", "spaces", "live", "stories"]);
  const socialTabs = new Set(["groups", "messages", "network", "linkedup", "nexus", "discover", "bookclub", "recipehub", "fitness"]);
  const careerTabs = new Set([
    "careerorbit", "elevate", "resume", "probe", "hireme", "pathsim", "forge", "interviewprep", "offers",
    "fraudsentinel", "resumescore", "decoder", "debrief", "orbitwatch", "proof", "interviewlog", "referrals",
    "relocate", "signalcheck", "commandcenter", "orbitintel", "salarywar", "darkorbit", "blind", "teammatch",
    "medorbit", "commandorbit", "launchpad", "orbitscore", "missionsim", "orbitmarket", "offertimeline",
    "orbitpulse", "radar", "vault", "funnel", "jdmatch", "cpetracker", "negotiation", "references",
    "compbuilder", "careertimeline", "orbitnews", "copilot"
  ]);

  let href = app.url;
  if (!href && app.tab) {
    if (app.tab === "bazaar-standalone" || app.tab === "eats" || app.tab === "marketplace" || app.tab === "bazaar") {
      href = "https://bazaar-standalone.vercel.app";
    } else if (app.tab === "ebay") {
      href = "https://sphera-backend-alpha.vercel.app/docs#/eBay%20Marketplace";
    } else if (studioTabs.has(app.tab)) {
      href = `https://sphera-studio.vercel.app?tool=${app.tab}`;
    } else if (socialTabs.has(app.tab)) {
      href = `https://sphera-social.vercel.app?tool=${app.tab}`;
    } else if (careerTabs.has(app.tab)) {
      href = `https://careerorbit-standalone.vercel.app?tool=${app.tab}`;
    } else {
      href = `https://sphera.expediteconsults.com?tab=${app.tab}`;
    }
  }

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
        {(app.tab || app.url) && app.status === "available" && (
          <span className="text-[10px] text-accent-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Open →
          </span>
        )}
      </div>
    </>
  );

  if (href && app.status === "available") {
    return (
      <a
        href={href}
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
          <AppCard key={app.name + i} app={app} delay={i * 0.05 + 0.1} />
        ))}
      </div>
    </section>
  );
}

/* ─── Product Card (top ecosystem section) ─── */
function ProductCard({
  product,
  delay,
}: {
  product: (typeof products)[0];
  delay: number;
}) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="product-card group opacity-0 animate-fade-in-up block"
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
              Live
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
          Visit →
        </span>
      </div>
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

/* ─── MAIN PAGE ─── */
export default function PortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeHeading, setActiveHeading] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const headings = [
    { id: "all", title: "All Ecosystem", icon: "🌐", color: "#00d4ff" },
    { id: "sphera", title: "Sphera Universe", icon: "🌍", color: "#00d4ff" },
    { id: "content", title: "Content & Creation", icon: "🎬", color: "#ec4899" },
    { id: "social", title: "Social & Community", icon: "💬", color: "#10b981" },
    { id: "career", title: "Career & Professional", icon: "💼", color: "#f59e0b" },
    { id: "ai", title: "AI & Innovation", icon: "🤖", color: "#8b5cf6" },
    { id: "marketplace", title: "Marketplace & Services", icon: "🛍️", color: "#6366f1" },
    { id: "security", title: "Cybersecurity & Defense", icon: "🛡️", color: "#10b981" },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeHeading === "all") return true;
    if (activeHeading === "sphera") return p.name === "Sphera" || p.name === "SpheraCut" || p.name === "CareerOrbit";
    if (activeHeading === "content") return p.name === "SpheraCut" || p.name === "Sphera";
    if (activeHeading === "social") return p.name === "Sphera";
    if (activeHeading === "career") return p.name === "CareerOrbit";
    if (activeHeading === "ai") return p.name === "SpheraCut";
    if (activeHeading === "marketplace") return p.name === "SkillHands";
    if (activeHeading === "security") return p.name.includes("Security") || p.name.includes("Consults") || p.name.includes("Recovery") || p.name.includes("CERBERUS") || p.name.includes("AXIOM") || p.name.includes("Unified");
    return true;
  });

  const headingCategories = categories.filter((c) => {
    if (activeHeading === "all") return true;
    if (activeHeading === "sphera") return ["profile", "content", "social", "career", "marketplace", "ai", "events"].includes(c.id);
    if (activeHeading === "security") return c.id === "security";
    if (activeHeading === "content") return c.id === "content" || c.id === "profile";
    if (activeHeading === "social") return c.id === "social";
    if (activeHeading === "career") return c.id === "career";
    if (activeHeading === "ai") return c.id === "ai";
    if (activeHeading === "marketplace") return c.id === "marketplace" || c.id === "events";
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
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <FloatingOrb color="#00d4ff" size={400} top="5%" left="80%" delay="0s" />
        <FloatingOrb color="#8b5cf6" size={350} top="40%" left="-5%" delay="2s" />
        <FloatingOrb color="#ec4899" size={300} top="70%" left="70%" delay="4s" />
        <FloatingOrb color="#10b981" size={250} top="20%" left="30%" delay="6s" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05),transparent_50%)]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border-glass bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-lg font-black text-white">
              E
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary leading-none">
                Expedite Consults
              </h1>
              <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                Portal
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
                placeholder="Search apps, features, tools..."
                className="w-full bg-bg-secondary/60 border border-border-glass rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:bg-bg-secondary transition-all"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              {availableApps} Active
            </span>
            <span>{totalApps} Total Apps</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
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
              <ProductCard key={p.name} product={p} delay={i * 0.1 + 0.3} />
            ))}
          </div>
        </section>

        {/* ── Category Filter ── */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-text-primary">Sphera Platform</h2>
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
              All Apps
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

        {/* ── Cross Platform ── */}
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
            Portal v1.0 — All Systems Operational
          </p>
        </footer>
      </div>
    </div>
  );
}
