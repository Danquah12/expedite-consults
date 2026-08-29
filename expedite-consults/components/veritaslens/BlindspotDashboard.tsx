'use client';

import React, { useState } from 'react';
import { 
  NewsCluster, 
  MediaOutlet, 
  NewsArticle 
} from '@/lib/veritaslens/types';
import { 
  Eye, 
  ShieldAlert, 
  Compass, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  FileText, 
  TrendingUp, 
  Filter,
  Sparkles,
  Info,
  Scale,
  ArrowRight,
  Share2,
  Smartphone,
  Flame
} from 'lucide-react';
import { SocialSyndicationModal } from './SocialSyndicationModal';
import { MobileAlertModal } from './MobileAlertModal';
import { ArticleSummaryModal } from './ArticleSummaryModal';
import { PolarizationAnalysisModal } from './PolarizationAnalysisModal';
import { HistoricArchiveModal } from './HistoricArchiveModal';

interface BlindspotDashboardProps {
  clusters: NewsCluster[];
  outlets: MediaOutlet[];
  onSelectClusterForInvestigation?: (cluster: NewsCluster) => void;
  onOpenDietCalculator?: () => void;
  onOpenVideoPolygraph?: () => void;
  onOpenHotTopics?: () => void;
  onSyncLiveData?: () => Promise<void>;
  isSyncing?: boolean;
  syncSuccessMsg?: string | null;
  lastSyncedAt?: Date | null;
}

export const BlindspotDashboard: React.FC<BlindspotDashboardProps> = ({
  clusters,
  outlets,
  onSelectClusterForInvestigation,
  onOpenDietCalculator,
  onOpenVideoPolygraph,
  onOpenHotTopics,
  onSyncLiveData,
  isSyncing,
  syncSuccessMsg,
  lastSyncedAt
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'Left_Blindspot' | 'Right_Blindspot' | 'Balanced'>('ALL');
  const [selectedYear, setSelectedYear] = useState<'ALL' | number>('ALL');
  const [selectedClusterForWire, setSelectedClusterForWire] = useState<NewsCluster | null>(null);
  const [syndicateCluster, setSyndicateCluster] = useState<NewsCluster | null>(null);
  const [mobileAlertCluster, setMobileAlertCluster] = useState<NewsCluster | null>(null);
  const [selectedArticleForSummary, setSelectedArticleForSummary] = useState<{ article: NewsArticle; cluster: NewsCluster } | null>(null);
  const [isPolarizationModalOpen, setIsPolarizationModalOpen] = useState<boolean>(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [outletSearch, setOutletSearch] = useState('');
  const [outletFilterBias, setOutletFilterBias] = useState<string>('ALL');
  const [clientSyncTime, setClientSyncTime] = useState<string>('Live (Just Now)');

  React.useEffect(() => {
    if (lastSyncedAt) {
      setClientSyncTime(lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [lastSyncedAt]);

  const filteredClusters = clusters.filter(c => {
    const matchesType = filterType === 'ALL' || c.blindspotType === filterType;
    const matchesYear = selectedYear === 'ALL' || (c.year || 2026) === selectedYear;
    return matchesType && matchesYear;
  });

  const availableYears = [2026, 2024, 2023, 2022, 2021, 2020];

  const filteredOutlets = outlets.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(outletSearch.toLowerCase()) || 
                          o.domain.toLowerCase().includes(outletSearch.toLowerCase());
    const matchesBias = outletFilterBias === 'ALL' || o.biasCategory === outletFilterBias;
    return matchesSearch && matchesBias;
  });

  return (
    <div className="space-y-6">
      {/* Sync Alert Banner if active */}
      {syncSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 rounded-xl text-xs text-emerald-200 flex items-center justify-between font-mono shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Live Synced</span>
        </div>
      )}

      {/* Hot Topics Viral Radar Quick-Launch Banner */}
      {onOpenHotTopics && (
        <div 
          onClick={onOpenHotTopics}
          className="bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 border border-orange-600/70 hover:border-orange-500 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 cursor-pointer group transition-all duration-200 hover:shadow-orange-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-orange-300">
                  🔥 Viral Hot Topics Deep Unbiased Search:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 border border-orange-800 text-orange-300 font-bold">
                  What Everyone Is Discussing
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore unbiased forensic verdicts on <strong>AI Deepfakes</strong>, <strong>Universal Tariffs</strong>, <strong>Sanctuary Cities</strong>, <strong>TikTok Ban</strong>, and <strong>Student Loans</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold group-hover:text-orange-300">
            <span>Launch Unbiased Search Studio</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      )}

      {/* Top Banner / Strategy Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* National Polarization Gauge (Clickable Graphic Card) */}
        <div 
          onClick={() => setIsPolarizationModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/80 rounded-xl p-5 shadow-lg relative overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10"
          title="Click to view full mathematical polarization analysis & domain breakdown"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-full blur-2xl pointer-events-none transition-all"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              National Polarization Index
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 border border-amber-800 text-amber-300 group-hover:border-amber-500 transition">
              High Polarization
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono text-white group-hover:text-amber-300 transition-colors">71.4</span>
              <span className="text-sm text-slate-400 font-mono">/ 100</span>
            </div>

            {/* Mini SVG Gauge Indicator */}
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Audited</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2.5 shadow-inner">
            <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full w-[71.4%] transition-all duration-500"></div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
            Measures the percentage of daily breaking news events exhibiting <strong className="text-slate-200 font-mono">≥ 70%</strong> asymmetric partisan coverage imbalance.
          </p>

          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-amber-400 opacity-90 group-hover:opacity-100 transition">
            <span>📊 View Polarization Breakdown</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Active Blindspot Feed Counter (Clickable Interactive Archive & Filter Box) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-2.5">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span 
                onClick={() => setIsArchiveModalOpen(true)}
                className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 cursor-pointer hover:text-cyan-300 transition"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                2020–2026 Blindspot Archive
              </span>
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-500 text-cyan-300 transition cursor-pointer shadow-sm"
                title="Click to open full historic multi-year archive dossier"
              >
                {clusters.length} Multi-Year Stories ↗
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              {/* Left Blindspots Interactive Filter Button */}
              <button
                onClick={() => setFilterType(prev => prev === 'Left_Blindspot' ? 'ALL' : 'Left_Blindspot')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  filterType === 'Left_Blindspot'
                    ? 'bg-blue-950/90 border-blue-500 shadow-md shadow-blue-950 ring-1 ring-blue-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-blue-700/80 hover:bg-blue-950/30'
                }`}
                title="Click to filter feed to Left Blindspots"
              >
                <div className="text-xs text-blue-400 font-mono font-bold flex items-center justify-between">
                  <span>Left Blindspots</span>
                  {filterType === 'Left_Blindspot' && <span className="text-[9px] bg-blue-500 text-white px-1 rounded">Active</span>}
                </div>
                <div className="text-2xl font-black text-white font-mono my-0.5">
                  {clusters.filter(c => c.blindspotType === 'Left_Blindspot').length} Stories
                </div>
                <div className="text-[10px] text-slate-400">Ignored by Left Outlets (Click to filter)</div>
              </button>

              {/* Right Blindspots Interactive Filter Button */}
              <button
                onClick={() => setFilterType(prev => prev === 'Right_Blindspot' ? 'ALL' : 'Right_Blindspot')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  filterType === 'Right_Blindspot'
                    ? 'bg-rose-950/90 border-rose-500 shadow-md shadow-rose-950 ring-1 ring-rose-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-rose-700/80 hover:bg-rose-950/30'
                }`}
                title="Click to filter feed to Right Blindspots"
              >
                <div className="text-xs text-rose-400 font-mono font-bold flex items-center justify-between">
                  <span>Right Blindspots</span>
                  {filterType === 'Right_Blindspot' && <span className="text-[9px] bg-rose-500 text-white px-1 rounded">Active</span>}
                </div>
                <div className="text-2xl font-black text-white font-mono my-0.5">
                  {clusters.filter(c => c.blindspotType === 'Right_Blindspot').length} Stories
                </div>
                <div className="text-[10px] text-slate-400">Ignored by Right Outlets (Click to filter)</div>
              </button>
            </div>
          </div>

          <div 
            onClick={() => setIsArchiveModalOpen(true)}
            className="flex items-center justify-between pt-1 text-[10px] font-mono text-cyan-400 cursor-pointer hover:underline"
          >
            <span>📁 Explore Multi-Year Archive (2020–2026)</span>
            <span>→</span>
          </div>
        </div>

        {/* The 2026 Balanced News Strategy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-400" />
              The Veritas Dual Shield Strategy
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 border border-purple-800 text-purple-300">
              Media Literacy
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2 text-xs">
              <span className="font-bold text-cyan-400 font-mono">1. Bias Aggregator:</span>
              <span className="text-slate-300">See how competing outlets spin or selectively omit the story.</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <span className="font-bold text-emerald-400 font-mono">2. Neutral Wire:</span>
              <span className="text-slate-300">Go directly to Reuters / AP to read raw, unadorned factual events.</span>
            </div>
          </div>
          <div className="text-[11px] bg-slate-950/80 p-2 rounded border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-semibold">Core Insight:</span> Spinning is not lying; bias lies in the adjectives chosen and stories omitted.
          </div>
        </div>
      </div>

      {/* Prominent Echo Chamber Diet Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/60 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-900/60 border border-purple-700 text-purple-300 text-xl shadow-inner">
            🥗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Where Is Your News Diet? Test Your Personal Echo Chamber
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-mono font-bold">
                100% Free Citizen Tool
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Select the 3–4 outlets you read to calculate your net bias exposure, blindspot risks, and get personalized recommendations.
            </p>
          </div>
        </div>

        {onOpenDietCalculator && (
          <button
            onClick={onOpenDietCalculator}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <span>Open Echo Chamber Diet Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Blindspot Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Asymmetric News Cluster Feed (Live & Multi-Year Archive)
            </h2>
            <p className="text-xs text-slate-400">
              Real-time clustering across 14 Left, Center, and Right newsrooms alongside the 2020–2026 archive.
            </p>
          </div>

          {/* Sync Now, Last Synced & Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Last Synced Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 rounded-lg border border-slate-800 text-[11px] font-mono shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Last Synced:</span>
              <strong className="text-emerald-300">
                {clientSyncTime}
              </strong>
            </div>

            {onSyncLiveData && (
              <button
                onClick={onSyncLiveData}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing 14 Feeds...' : '🔄 Sync Live News Feeds (Now)'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                  filterType === 'ALL' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Types ({clusters.length})
              </button>
              <button
                onClick={() => setFilterType('Left_Blindspot')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'Left_Blindspot' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Left Blindspots ({clusters.filter(c => c.blindspotType === 'Left_Blindspot').length})
              </button>
              <button
                onClick={() => setFilterType('Right_Blindspot')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'Right_Blindspot' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Right Blindspots ({clusters.filter(c => c.blindspotType === 'Right_Blindspot').length})
              </button>
              <button
                onClick={() => setFilterType('Balanced')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'Balanced' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Balanced ({clusters.filter(c => c.blindspotType === 'Balanced').length})
              </button>
            </div>
          </div>
        </div>

        {/* Year Filter Timeline Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Filter By Year:</span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setSelectedYear('ALL')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                  selectedYear === 'ALL'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All (2020–2026)
              </button>
              {availableYears.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {yr} ({clusters.filter(c => (c.year || 2026) === yr).length})
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-cyan-300 font-bold">
            {filteredClusters.length} Stories Matching Timeline
          </span>
        </div>

        {/* Cluster Cards */}
        <div className="grid grid-cols-1 gap-6 mt-4">
          {filteredClusters.map(cluster => (
            <div 
              key={cluster.id}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition duration-150 space-y-4 shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {cluster.year || 2026}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {cluster.category}
                    </span>
                    {cluster.blindspotType === 'Left_Blindspot' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                        LEFT BLINDSPOT (Ignored by Left Networks)
                      </span>
                    )}
                    {cluster.blindspotType === 'Right_Blindspot' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        RIGHT BLINDSPOT (Ignored by Right Networks)
                      </span>
                    )}
                    {cluster.blindspotType === 'Balanced' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                        BALANCED COVERAGE (Divergent Partisan Spin)
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {cluster.totalArticlesCount} Outlets Reporting
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {cluster.representativeTitle}
                  </h3>
                </div>

                {/* Unspun Wire & Video Polygraph Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedClusterForWire(cluster)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30 transition text-xs font-bold cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Read Unspun Facts ({cluster.rawWireSource})</span>
                  </button>

                  {onOpenVideoPolygraph && (
                    <button
                      onClick={onOpenVideoPolygraph}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 hover:bg-rose-900/90 transition text-xs font-mono font-bold cursor-pointer shadow-md"
                      title="Watch live broadcast speech with synchronized Polygraph & docket evidence"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>🎥 Watch Video Polygraph</span>
                    </button>
                  )}

                  {/* Share & Broadcast Studio Launcher */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSyndicateCluster(cluster);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition text-xs font-mono font-bold cursor-pointer shadow-lg shadow-blue-600/25"
                    title="1-Click Broadcast & Share to LinkedIn, X, Facebook, and Newsletters"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>📢 Share & Broadcast</span>
                  </button>

                  {/* Send Alert to Phone Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMobileAlertCluster(cluster);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/90 transition text-xs font-mono font-bold cursor-pointer shadow-md"
                    title="Send Instant Alert to Phone via SMS, WhatsApp, Telegram, or Push"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>📱 Send to Phone</span>
                  </button>

                  {onSelectClusterForInvestigation && (
                    <button
                      onClick={() => onSelectClusterForInvestigation(cluster)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold cursor-pointer"
                    >
                      <span>Investigate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bias Distribution Bar */}
              <div className="space-y-1.5 bg-slate-900/95 p-3.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-blue-400">Left Coverage: {cluster.leftCoveragePct}%</span>
                  <span className="text-slate-400">Center Wire: {cluster.centerCoveragePct}%</span>
                  <span className="text-rose-400">Right Coverage: {cluster.rightCoveragePct}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
                  <div style={{ width: `${cluster.leftCoveragePct}%` }} className="bg-blue-500 transition-all duration-300" title={`Left: ${cluster.leftCoveragePct}%`}></div>
                  <div style={{ width: `${cluster.centerCoveragePct}%` }} className="bg-slate-400 transition-all duration-300" title={`Center: ${cluster.centerCoveragePct}%`}></div>
                  <div style={{ width: `${cluster.rightCoveragePct}%` }} className="bg-rose-500 transition-all duration-300" title={`Right: ${cluster.rightCoveragePct}%`}></div>
                </div>
                <div className="text-xs text-slate-300 flex items-start gap-1.5 pt-1.5 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400 font-mono">Why Asymmetry Occurred:</strong> {cluster.asymmetryReason}</span>
                </div>
              </div>

              {/* Divergent Outlet Headlines */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
                  <span>Divergent Media Headlines & Editorial Summaries:</span>
                  <span className="text-[10px] text-cyan-400 font-normal lowercase">click any card to open summary popup</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {cluster.articles.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => setSelectedArticleForSummary({ article: art, cluster })}
                      className="bg-slate-900/90 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/80 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-md hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer group relative overflow-hidden"
                      title="Click to view complete executive summary & forensic spin analysis"
                    >
                      {/* Subtle hover indicator */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 group-hover:bg-cyan-500/15 rounded-bl-full transition-all pointer-events-none"></div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                            art.biasAlignment === 'Left' || art.biasAlignment === 'Lean_Left'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : art.biasAlignment === 'Right' || art.biasAlignment === 'Lean_Right'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {art.outletName} ({art.biasAlignment})
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 group-hover:border-cyan-500/40 transition">
                            Spin: {(art.lexicalLoad * 100).toFixed(0)}%
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 leading-snug transition-colors">
                          "{art.title.replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')}"
                        </h4>
                      </div>
                      <div className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-md border border-slate-800/80 group-hover:border-slate-700 leading-relaxed break-words overflow-hidden">
                        {(() => {
                          const raw = art.cleanedContent || '';
                          const stripped = raw
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&apos;/g, "'")
                            .replace(/&#39;/g, "'")
                            .replace(/&amp;/g, '&')
                            .replace(/<[^>]*>/g, ' ')
                            .replace(/https?:\/\/\S+/g, '')
                            .replace(/target=["']?[^"'\s>]*["']?/gi, '')
                            .replace(/href=["']?[^"'\s>]*["']?/gi, '')
                            .replace(/oc=["']?[^"'\s>]*["']?/gi, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                          if (!stripped || stripped.length < 15 || stripped.startsWith('=')) {
                            return `${art.title}. Detailed wire report and factual coverage from ${art.outletName}.`;
                          }
                          return stripped;
                        })()}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-cyan-400 opacity-80 group-hover:opacity-100 transition">
                        <span>🔍 Click to Read Summary</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Independent Rating Institutions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Independent Media Rating Matrix (The Sources of Truth)
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated bias & factual reliability scores from Ad Fontes Media, AllSides, and Media Bias/Fact Check (MBFC).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search outlet or domain..."
              value={outletSearch}
              onChange={e => setOutletSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 w-48"
            />
            <select
              value={outletFilterBias}
              onChange={e => setOutletFilterBias(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Political Leans</option>
              <option value="Center">Center / Neutral</option>
              <option value="Lean_Left">Lean Left</option>
              <option value="Left">Left</option>
              <option value="Lean_Right">Lean Right</option>
              <option value="Right">Right</option>
            </select>
          </div>
        </div>

        {/* Outlets Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Outlet & Domain</th>
                <th className="py-2.5 px-3">AllSides Bias</th>
                <th className="py-2.5 px-3">Ad Fontes Reliability (0-64)</th>
                <th className="py-2.5 px-3">MBFC Factuality</th>
                <th className="py-2.5 px-3">Ownership Structure</th>
                <th className="py-2.5 px-3">Brand Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOutlets.map(out => (
                <tr key={out.id} className="hover:bg-slate-950/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{out.name}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">{out.domain}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      out.biasCategory === 'Center'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : out.biasCategory === 'Lean_Left' || out.biasCategory === 'Left'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {out.biasCategory.replace('_', ' ')} ({out.biasScore > 0 ? `+${out.biasScore}` : out.biasScore})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${out.reliabilityScore >= 45 ? 'text-emerald-400' : out.reliabilityScore >= 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {out.reliabilityScore.toFixed(1)} / 64
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${(out.reliabilityScore / 64) * 100}%` }}
                          className={`h-full ${out.reliabilityScore >= 45 ? 'bg-emerald-500' : out.reliabilityScore >= 35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      out.factualityCategory === 'Very_High' || out.factualityCategory === 'High'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : out.factualityCategory === 'Mixed'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {out.factualityCategory.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div className="font-semibold text-slate-200">{out.ownerType}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">{out.ownerName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      out.brandSafetyRisk === 'Low'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : out.brandSafetyRisk === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {out.brandSafetyRisk} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unspun Wire Facts Modal / Drawer */}
      {selectedClusterForWire && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Raw Unspun Wire Verification ({selectedClusterForWire.rawWireSource})
                </h3>
              </div>
              <button
                onClick={() => setSelectedClusterForWire(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 rounded cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Story Cluster:</span>
                <p className="text-sm font-bold text-slate-100">{selectedClusterForWire.representativeTitle}</p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-semibold">
                  <span>Gold-Standard Wire Report</span>
                  <span>Lexical Load: &lt; 5% (Neutral)</span>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  "{selectedClusterForWire.rawWireFactSummary}"
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs text-slate-300">
                <span className="font-mono text-cyan-400 font-bold uppercase">Why Wire Reporting Matters:</span>
                <p className="text-slate-400">
                  Wire organizations like Reuters and the Associated Press have structural and funding models that penalize editorializing because outlets across the entire political spectrum license their raw feeds.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClusterForWire(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Syndication & Broadcast Modal */}
      <SocialSyndicationModal
        cluster={syndicateCluster}
        isOpen={!!syndicateCluster}
        onClose={() => setSyndicateCluster(null)}
      />

      {/* Mobile Phone Alert Modal */}
      <MobileAlertModal
        cluster={mobileAlertCluster}
        isOpen={!!mobileAlertCluster}
        onClose={() => setMobileAlertCluster(null)}
      />

      {/* Interactive Article Summary & Forensic Pop-Up Modal */}
      <ArticleSummaryModal
        article={selectedArticleForSummary?.article || null}
        cluster={selectedArticleForSummary?.cluster || null}
        isOpen={!!selectedArticleForSummary}
        onClose={() => setSelectedArticleForSummary(null)}
        onShareBroadcast={(c) => setSyndicateCluster(c)}
        onSendToPhone={(c) => setMobileAlertCluster(c)}
      />

      {/* National Polarization Analysis Graphic Deep-Dive Modal */}
      <PolarizationAnalysisModal
        isOpen={isPolarizationModalOpen}
        onClose={() => setIsPolarizationModalOpen(false)}
        polarizationScore={71.4}
      />

      {/* 2020-2026 Historic Multi-Year Blindspot Archive Modal */}
      <HistoricArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        clusters={clusters}
        onSelectCluster={(c) => {
          onSelectClusterForInvestigation ? onSelectClusterForInvestigation(c) : setSelectedClusterForWire(c);
        }}
      />
    </div>
  );
};
