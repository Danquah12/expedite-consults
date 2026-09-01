"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  Github,
  Globe,
  Radio,
  Server,
  Layers,
  Shield,
  ShieldAlert,
  Building2,
  Workflow,
  GraduationCap,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  Code2,
  ArrowUpRight,
  Terminal,
  Grid,
  List,
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  Boxes,
  KeyRound,
  FileCode2,
  PackageCheck,
  Webhook,
  Smartphone,
  Compass,
  Bug,
  ShieldCheck,
  CloudRain,
  Crosshair,
  Globe2,
  Eye,
  FileCheck2,
  PhoneCall,
  Share2,
  Layout,
  Briefcase,
  Video,
  Bot,
  MapPin,
  UserCheck,
  ShoppingBag,
  Mail,
  Recycle,
  Hammer,
  Home,
  ChevronRight,
  Wifi,
  Cloud,
  Network
} from "lucide-react";
import { ECOSYSTEM_APPS, ECOSYSTEM_PILLARS, EcosystemApp } from "@/lib/ecosystemData";

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  FileCode2,
  PackageCheck,
  KeyRound,
  Boxes,
  Network,
  FileSliders: SlidersHorizontal,
  ShieldAlert,
  Webhook,
  Smartphone,
  Cpu,
  Compass,
  Bug,
  ShieldCheck,
  Radio,
  CloudRain,
  Crosshair,
  Shield,
  Globe2,
  Eye,
  FileCheck2,
  PhoneCall,
  Share2,
  Sparkles,
  Layout,
  Server,
  Orbit: Layers,
  Briefcase,
  Video,
  Bot,
  GraduationCap,
  MapPin,
  UserCheck,
  ShoppingBag,
  Mail,
  Recycle,
  Hammer,
  Home,
  Layers,
  Building2,
  Workflow,
  Globe,
};

type EnvMode = "vercel" | "local" | "github";
type ViewMode = "grid" | "matrix" | "table";

export default function EcosystemLaunchpad() {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [envMode, setEnvMode] = useState<EnvMode>("vercel");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string>("all");

  const badges = ["all", "Platform", "Portal", "SuperApp", "AI Engine", "Vercel Live", "Enterprise", "Impact"];

  const filteredApps = useMemo(() => {
    return ECOSYSTEM_APPS.filter((app) => {
      // Pillar filter
      if (selectedPillar !== "all" && app.pillar !== selectedPillar) {
        return false;
      }
      // Badge filter
      if (selectedBadge !== "all" && app.badge !== selectedBadge) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = app.name.toLowerCase().includes(q);
        const matchCode = app.codeName.toLowerCase().includes(q);
        const matchDesc = app.description.toLowerCase().includes(q);
        const matchVercel = app.vercelUrl.toLowerCase().includes(q);
        const matchPort = app.localPort ? String(app.localPort).includes(q) : false;
        const matchTech = app.techStack.some((t) => t.toLowerCase().includes(q));
        const matchFeature = app.features.some((f) => f.toLowerCase().includes(q));
        const matchCategory = app.categoryLabel.toLowerCase().includes(q);
        const matchGithub = app.githubRepo ? app.githubRepo.toLowerCase().includes(q) : false;
        return matchName || matchCode || matchDesc || matchVercel || matchPort || matchTech || matchFeature || matchCategory || matchGithub;
      }
      return true;
    });
  }, [selectedPillar, selectedBadge, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLaunchTarget = (app: EcosystemApp) => {
    if (envMode === "vercel") {
      return app.customDomain || app.vercelUrl;
    }
    if (envMode === "local") {
      if (app.localPort) return `http://localhost:${app.localPort}`;
      if (app.internalRoute) return app.internalRoute;
      return app.customDomain || app.vercelUrl;
    }
    if (envMode === "github") {
      return app.githubUrl || `https://github.com/${app.githubRepo || "Danquah12/expedite-consults"}`;
    }
    return app.customDomain || app.vercelUrl;
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white pb-24">
      {/* Background Gradients & Mesh Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-cyan-600/20 via-blue-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[25%] -left-40 w-[600px] h-[600px] bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="absolute top-[55%] -right-40 w-[600px] h-[600px] bg-cyan-600/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Top Breadcrumb & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Building2 className="size-3.5" />
              Expedite Consults
            </Link>
            <ChevronRight className="size-3 text-slate-600" />
            <span className="text-cyan-400 font-medium flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-cyan-400 animate-pulse" />
              Digital Ecosystem Launchpad
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-xs text-emerald-300">
              <span className="inline-block size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono font-semibold">100% Global Cloud Ready</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs text-cyan-300 font-mono">
              <Cloud className="size-3 text-cyan-400" />
              <span>34 Vercel Cloud Nodes</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Globe className="size-3.5 text-cyan-400" />
            Global Cloud Access from Anywhere in the World
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
            Digital Ecosystem{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Launchpad
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed">
            Direct, single-click global access to all 34 cyber defense platforms, autonomous testing loops (Platforms 05–19), Sphera simulation studio, ConnectIn professional super app, campus operating ecosystems, and live Vercel cloud deployments.
          </p>

          {/* Global Vercel Deployment Notice Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Wifi className="size-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  Worldwide Vercel Cloud Network Enabled
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Every application below has a live Vercel production URL. Click &quot;Launch Cloud App&quot; to open the live instance from any network or device.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEnvMode("vercel")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  envMode === "vercel"
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Globe className="size-3.5" />
                Vercel Mode (Default)
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Total Applications</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">34</div>
              <div className="text-[11px] text-cyan-400 mt-0.5">Across 7 Strategic Pillars</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Vercel Deployments</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">100%</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">34 Worldwide Cloud URLs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">Configured Local Ports</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">16</div>
              <div className="text-[11px] text-indigo-400 mt-0.5">Ports 3000 – 3019, 8090</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-medium">GitHub Repositories</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">12+</div>
              <div className="text-[11px] text-purple-400 mt-0.5">@Danquah12 Organization</div>
            </div>
          </div>
        </div>

        {/* Global Control Bar: Search + Environment Switcher + View Mode */}
        <div className="sticky top-4 z-40 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by app name, Vercel URL, port (e.g. 3011), tech stack (Next.js, ZAP), keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded bg-slate-800"
                >
                  Esc
                </button>
              )}
            </div>

            {/* Environment Launch Mode Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Launch Action:</span>
              <div className="flex p-1 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setEnvMode("vercel")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    envMode === "vercel"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="size-3.5" />
                  Vercel Cloud (Global)
                </button>
                <button
                  onClick={() => setEnvMode("local")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    envMode === "local"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="size-3.5" />
                  Local Ports
                </button>
                <button
                  onClick={() => setEnvMode("github")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    envMode === "github"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Github className="size-3.5" />
                  GitHub Code
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex p-1 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-400">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-800 text-white" : "hover:text-white"}`}
                  title="Grid View"
                >
                  <Grid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-slate-800 text-white" : "hover:text-white"}`}
                  title="Table View"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Pillar / Category Scrollable Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-slate-800/80">
            {ECOSYSTEM_PILLARS.map((pillar) => {
              const IconComponent = ICON_MAP[pillar.icon] || Layers;
              const isActive = selectedPillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(pillar.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <IconComponent className={`size-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{pillar.shortName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-900 text-slate-500"
                    }`}
                  >
                    {pillar.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Badge Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-xs text-slate-400">
            Showing <span className="text-white font-bold">{filteredApps.length}</span> of{" "}
            <span className="text-white font-bold">{ECOSYSTEM_APPS.length}</span> applications
            {searchQuery && (
              <span>
                {" "}
                matching &quot;<span className="text-cyan-400">{searchQuery}</span>&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Filter Type:</span>
            {badges.map((badge) => (
              <button
                key={badge}
                onClick={() => setSelectedBadge(badge)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  selectedBadge === badge
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300"
                }`}
              >
                {badge === "all" ? "All Types" : badge}
              </button>
            ))}
          </div>
        </div>

        {/* Main Applications Content */}
        {filteredApps.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-slate-900/40 border border-slate-800">
            <ShieldAlert className="size-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No applications match your filter</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Try searching with another keyword, clearing the search query, or switching the category pillar.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPillar("all");
                setSelectedBadge("all");
              }}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApps.map((app) => {
              const IconComponent = ICON_MAP[app.icon] || Shield;
              const targetUrl = getLaunchTarget(app);
              const isExternal = isExternalUrl(targetUrl);
              const globalVercelUrl = app.customDomain || app.vercelUrl;

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-md"
                >
                  {/* Top Bar: Icon, CodeName, Badge, Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-xl flex items-center justify-center border border-slate-700/60 shrink-0 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${app.accentColor}15`,
                            borderColor: `${app.accentColor}40`,
                            color: app.accentColor,
                          }}
                        >
                          <IconComponent className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {app.codeName}
                            </span>
                            {app.localPort && (
                              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                                Port :{app.localPort}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-1 line-clamp-1">
                            {app.name}
                          </h3>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        {app.badge}
                      </span>
                    </div>

                    {/* Category Label & Description */}
                    <div className="text-[11px] font-medium text-cyan-400/90 mb-2">{app.categoryLabel}</div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{app.description}</p>

                    {/* Dedicated Worldwide Vercel Link Strip */}
                    <div className="mb-3.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Globe className="size-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-mono text-slate-300 truncate" title={globalVercelUrl}>
                          {globalVercelUrl.replace("https://", "")}
                        </span>
                      </div>
                      <a
                        href={globalVercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/50 shrink-0 flex items-center gap-1 transition-colors"
                        title="Open Global Vercel Link"
                      >
                        <span>Cloud</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </div>

                    {/* Feature Bullets */}
                    <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                      {app.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="size-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {app.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800/80 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                    {/* Secondary Quick Links (GitHub, Local Port, Copy) */}
                    <div className="flex items-center gap-1.5">
                      {app.githubUrl && (
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                          title={`View on GitHub: ${app.githubRepo}`}
                        >
                          <Github className="size-3.5" />
                        </a>
                      )}

                      {app.localPort && (
                        <a
                          href={`http://localhost:${app.localPort}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
                          title={`Launch Localhost :${app.localPort}`}
                        >
                          <Terminal className="size-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleCopy(app.id, globalVercelUrl)}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors"
                        title="Copy Global Vercel URL"
                      >
                        {copiedId === app.id ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>

                    {/* Primary Launch Action Button (Opens Global Vercel by default) */}
                    {isExternal ? (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_18px_rgba(6,182,212,0.5)] transition-all duration-300"
                      >
                        <span>
                          {envMode === "local"
                            ? `Port ${app.localPort || 3000}`
                            : envMode === "github"
                            ? "Repo"
                            : "Launch Cloud App"}
                        </span>
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={targetUrl}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_18px_rgba(6,182,212,0.5)] transition-all duration-300"
                      >
                        <span>Launch App</span>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code / App Name</th>
                  <th className="py-3 px-4">Pillar / Category</th>
                  <th className="py-3 px-4">Global Vercel Production URL</th>
                  <th className="py-3 px-4">Local Port</th>
                  <th className="py-3 px-4">GitHub Repository</th>
                  <th className="py-3 px-4 text-right">Global Launch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map((app) => {
                  const globalVercelUrl = app.customDomain || app.vercelUrl;

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{app.codeName}</span>
                          <span className="text-white font-semibold">{app.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{app.categoryLabel}</td>
                      <td className="py-3 px-4 font-mono text-slate-300 truncate max-w-[240px]">
                        <a
                          href={globalVercelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1.5"
                        >
                          <Globe className="size-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{globalVercelUrl}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {app.localPort ? (
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                            :{app.localPort}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {app.githubRepo ? (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 flex items-center gap-1"
                          >
                            <Github className="size-3 shrink-0" />
                            <span className="truncate">{app.githubRepo}</span>
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={globalVercelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold inline-flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        >
                          <span>Open Cloud</span>
                          <ArrowUpRight className="size-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
