"use client"

import React, { useState } from "react"
import {
  Grid3X3,
  Code2,
  Cpu,
  Terminal,
  Key,
  Globe,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Users,
  Building2,
  ShoppingBag,
  ArrowRight,
  Zap,
  Radio,
  Server,
  Cloud,
  FileCode2,
  Plug,
  Handshake,
  Download,
  CheckCircle2,
  Lock,
  Boxes
} from "lucide-react"
import {
  DEVELOPER_APIS_DATA,
  DEVELOPER_SDKS_DATA,
  ENTERPRISE_INTEGRATIONS_DATA,
  ECOSYSTEM_PARTNERS_DATA,
  ECOSYSTEM_COMMUNITIES_DATA,
  THIRD_PARTY_APPS_DATA,
  EnterpriseIntegration,
  ThirdPartyApp
} from "@/lib/ecosystem-platform-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EcosystemViewProps {
  currentUser: UserProfile
  onNavigateMarketplace?: () => void
  onNavigateCommunityChat?: (communityName: string) => void
}

export function EcosystemView({
  currentUser,
  onNavigateMarketplace,
  onNavigateCommunityChat
}: EcosystemViewProps) {
  // 5 Ecosystem Master Pillars
  const [ecosystemTab, setEcosystemTab] = useState<
    'developers' | 'integrations' | 'partners' | 'communities' | 'apps'
  >('developers')

  // Developer API Explorer State
  const [selectedApiCategory, setSelectedApiCategory] = useState<string>('All')
  const [copiedKey, setCopiedKey] = useState(false)
  const [liveApiKey, setLiveApiKey] = useState("cin_live_9842aef912_govcloud_enterprise")
  const [activeEndpoint, setActiveEndpoint] = useState(DEVELOPER_APIS_DATA[0])

  // Integrations State
  const [integrations, setIntegrations] = useState<EnterpriseIntegration[]>(ENTERPRISE_INTEGRATIONS_DATA)
  const [selectedIntegration, setSelectedIntegration] = useState<EnterpriseIntegration | null>(null)

  // Third-Party Apps State
  const [apps, setApps] = useState<ThirdPartyApp[]>(THIRD_PARTY_APPS_DATA)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(liveApiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleToggleInstallApp = (appId: string) => {
    setApps(prev =>
      prev.map(a => (a.id === appId ? { ...a, isInstalled: !a.isInstalled } : a))
    )
  }

  const handleToggleConnectIntegration = (intId: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.id === intId
          ? { ...i, status: i.status === 'Connected' ? 'Ready to Connect' : 'Connected' }
          : i
      )
    )
    if (selectedIntegration && selectedIntegration.id === intId) {
      setSelectedIntegration(prev =>
        prev ? { ...prev, status: prev.status === 'Connected' ? 'Ready to Connect' : 'Connected' } : null
      )
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* 1. TOP ECOSYSTEM HERO BANNER */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/40 flex items-center gap-1.5">
                <Grid3X3 className="h-3.5 w-3.5 text-amber-300" />
                ConnectIn Global Ecosystem &amp; Developer Platform
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                Enterprise OS &middot; 137 Apps &middot; Multi-Cloud Mesh
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ecosystem: Developers, Integrations, Partners &amp; Apps
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              ConnectIn is more than a social network—it is an enterprise operating system connecting cloud infrastructures, developer APIs &amp; SDKs, federal consulting partners, and third-party software.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-black/40 border border-white/15 p-3.5 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-mono text-sky-300">Active API Calls</span>
              <p className="text-xl font-black text-emerald-400">2.4M / mo</p>
              <span className="text-[10px] text-zinc-400">99.99% Uptime</span>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/15 p-3.5 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-mono text-purple-300">Ecosystem Apps</span>
              <p className="text-xl font-black text-amber-300">137 Verified</p>
              <span className="text-[10px] text-zinc-400">Sphera Micro-Apps</span>
            </div>
          </div>
        </div>

        {/* 5 Master Ecosystem Pillars Switcher Ribbon */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'developers', label: '💻 Developers (APIs & SDKs)', icon: Code2 },
            { id: 'integrations', label: '🔌 Integrations (Cloud, SIEM, DevOps)', icon: Plug },
            { id: 'partners', label: '🤝 Partners (Tech, Consulting, GSA)', icon: Handshake },
            { id: 'communities', label: '🌐 Specialized Communities', icon: Users },
            { id: 'apps', label: '📱 Third-Party Apps (137 Sphera Apps)', icon: Boxes }
          ].map((tab) => {
            const isSelected = ecosystemTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setEcosystemTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-white text-zinc-950 shadow-md font-extrabold"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEVELOPERS: APIS, SDKS & DEVELOPER PORTAL */}
      {/* ========================================================================= */}
      {ecosystemTab === 'developers' && (
        <div className="space-y-6">
          {/* API Key & Developer Portal Management */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <span>Developer Portal &amp; API Gateway</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Authenticate your serverless functions, CI/CD pipelines, and MCP agent bindings.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                <span className="font-mono text-zinc-600 dark:text-zinc-300 select-all truncate max-w-[240px]">
                  {liveApiKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="rounded-lg bg-[#0A66C2] px-3 py-1 font-bold text-white hover:bg-[#004182] flex items-center gap-1 shadow-xs shrink-0"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Official SDKs Matrix */}
          <div className="space-y-3">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" />
              <span>Official ConnectIn Client SDKs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEVELOPER_SDKS_DATA.map((sdk) => (
                <div
                  key={sdk.language}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{sdk.icon}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-mono font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {sdk.version}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {sdk.language} SDK
                    </h5>
                    <p className="text-[11px] text-zinc-500 font-mono">{sdk.packageName}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="rounded-lg bg-zinc-900 text-emerald-400 p-2 font-mono text-[10px] truncate">
                      $ {sdk.installCommand}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono block text-right">
                      {sdk.downloadsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive REST & MCP API Endpoints */}
          <div className="space-y-3">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-600" />
              <span>Interactive Model Context Protocol (MCP) &amp; REST Endpoints</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Endpoint Selector List */}
              <div className="lg:col-span-5 space-y-2">
                {DEVELOPER_APIS_DATA.map((api) => {
                  const isSelected = activeEndpoint.endpoint === api.endpoint
                  return (
                    <div
                      key={api.endpoint}
                      onClick={() => setActiveEndpoint(api)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                        isSelected
                          ? "border-[#0A66C2] bg-sky-50/70 dark:bg-sky-950/30 shadow-xs"
                          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono text-white ${
                          api.method === 'MCP' ? 'bg-purple-600' : api.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
                          {api.method}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{api.category}</span>
                      </div>
                      <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {api.title}
                      </h5>
                      <p className="text-[11px] text-zinc-500 truncate font-mono">
                        {api.endpoint}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Live JSON Response Preview */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-black p-5 text-white font-mono text-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                    <span className="text-emerald-400 font-bold">{activeEndpoint.method} {activeEndpoint.endpoint}</span>
                    <span>200 OK (14ms)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    {activeEndpoint.description}
                  </p>
                  <pre className="text-sky-300 text-xs overflow-x-auto p-2 bg-zinc-950 rounded-lg">
                    {activeEndpoint.sampleResponse}
                  </pre>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Transport: TLS 1.3 · HMAC-SHA256 Auth</span>
                  <span className="text-emerald-400 font-bold">● Ready for Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTEGRATIONS: AWS, AZURE, GCP, GITHUB, SERVICENOW, SIEMS */}
      {/* ========================================================================= */}
      {ecosystemTab === 'integrations' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300">
              Enterprise Cloud &amp; DevOps Connectors
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Native Multi-Cloud &amp; Security Stack Integrations
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Bi-directionally stream telemetry, trigger automated pull request fixes, dispatch ServiceNow change approvals, and forward threat radar CVEs to Splunk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((int) => (
              <div
                key={int.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{int.icon}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        int.status === 'Connected'
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {int.status === 'Connected' ? "Connected ✓" : "Ready to Connect"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {int.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-mono">{int.provider} · {int.category}</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {int.description}
                  </p>

                  <div className="space-y-1 text-xs pt-1">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Capabilities:</p>
                    {int.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedIntegration(int)}
                    className="text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    View Config →
                  </button>

                  <button
                    onClick={() => handleToggleConnectIntegration(int.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-xs ${
                      int.status === 'Connected'
                        ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200"
                        : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                    }`}
                  >
                    {int.status === 'Connected' ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARTNERS: TECH, CONSULTING & GSA RESELLERS */}
      {/* ========================================================================= */}
      {ecosystemTab === 'partners' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 text-white shadow-xl space-y-2">
            <span className="rounded-full bg-purple-500/30 px-3 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/40">
              Technology Alliances &amp; Government Contract Vehicles
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Global Strategic &amp; Federal Partners
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              Accelerate joint deployments across AWS GovCloud, Carahsoft GSA Schedule 70, Checkmarx AppSec, and Expedite Consults CISO advisory retainers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ECOSYSTEM_PARTNERS_DATA.map((partner) => (
              <div
                key={partner.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-purple-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{partner.logo}</span>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {partner.name}
                        </h4>
                        <span className="text-xs text-[#0A66C2] font-semibold">{partner.partnerType}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                      {partner.tier}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Specialization: <strong>{partner.specialization}</strong>
                  </p>

                  <div className="rounded-xl bg-purple-50/40 p-3 text-xs dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 space-y-1">
                    <p className="font-bold text-purple-900 dark:text-purple-300">Joint Solution Offerings:</p>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      {partner.jointOfferings.map((off, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>{off}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={onNavigateMarketplace}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    {partner.contactActionText} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMMUNITIES: CYBERSECURITY, AI, CLOUD, DEVELOPERS */}
      {/* ========================================================================= */}
      {ecosystemTab === 'communities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ECOSYSTEM_COMMUNITIES_DATA.map((comm) => (
              <div
                key={comm.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{comm.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {comm.name}
                        </h4>
                        <span className="text-xs text-zinc-400 font-mono">{comm.category} Track</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300">
                      {comm.membersCount.toLocaleString()} Members
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {comm.description}
                  </p>

                  <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800 space-y-1 border border-zinc-100 dark:border-zinc-700">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">🔥 Trending Active Topic:</p>
                    <p className="text-zinc-600 dark:text-zinc-400 italic">"{comm.recentTopic}"</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Curator: {comm.leadCurator}</span>
                  <button
                    onClick={() => {
                      if (onNavigateCommunityChat) onNavigateCommunityChat(comm.name)
                    }}
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                  >
                    Join Guild Discussion →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APPS: THIRD-PARTY ECOSYSTEM & SPHERA APPS */}
      {/* ========================================================================= */}
      {ecosystemTab === 'apps' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-teal-500/30 px-3 py-0.5 text-xs font-bold text-teal-200 border border-teal-400/40">
                137 Verified Third-Party &amp; Sphera Micro-Apps
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Ecosystem Application Marketplace &amp; App Hub
              </h3>
              <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
                Install one-click extensions, automated compliance bots, and real-time intelligence feeds into your ConnectIn workspace.
              </p>
            </div>

            <button
              onClick={onNavigateMarketplace}
              className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2.5 text-xs shadow-md hover:bg-zinc-100 shrink-0"
            >
              Browse 137 Apps in Marketplace →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {apps.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-teal-500 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{app.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {app.name}
                        </h4>
                        <span className="text-xs text-zinc-400">{app.developerName} · {app.category}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      Verified ✓
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-mono">{app.installsCount}</span>
                    <span className="text-amber-500 font-bold">★ {app.rating}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-bold">
                    {app.isInstalled ? "Active in Workspace" : "Ready to Install"}
                  </span>

                  <button
                    onClick={() => handleToggleInstallApp(app.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-xs ${
                      app.isInstalled
                        ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200"
                        : "bg-teal-600 hover:bg-teal-700 text-white"
                    }`}
                  >
                    {app.isInstalled ? "Uninstall" : "Install App"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTEGRATION CONFIGURATION MODAL */}
      <Dialog
        open={!!selectedIntegration}
        onOpenChange={(open) => {
          if (!open) setSelectedIntegration(null)
        }}
      >
        <DialogContent className="max-w-md">
          {selectedIntegration && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedIntegration.icon}</span>
                  <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedIntegration.name} Configuration
                  </DialogTitle>
                </div>
              </DialogHeader>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedIntegration.description}
              </p>

              <div className="space-y-2 text-xs rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <p className="font-bold">Active Configuration Parameters:</p>
                <p className="font-mono text-[11px] text-zinc-500">
                  Endpoint: https://ingest.connectin.internal/cloud-telemetry
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  Auth Mode: Mutual TLS (mTLS) + OIDC Token
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => handleToggleConnectIntegration(selectedIntegration.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold text-white ${
                    selectedIntegration.status === 'Connected' ? "bg-red-600" : "bg-[#0A66C2]"
                  }`}
                >
                  {selectedIntegration.status === 'Connected' ? "Disconnect Integration" : "Authorize & Connect"}
                </button>

                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
