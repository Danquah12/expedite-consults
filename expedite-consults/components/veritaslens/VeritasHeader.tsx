'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Cpu, 
  Network, 
  Tv, 
  ShieldCheck, 
  Terminal, 
  Search, 
  AlertTriangle,
  Zap,
  Layers,
  FileCode2,
  BookOpen,
  Smartphone,
  Palette,
  Check,
  Flame
} from 'lucide-react';

export type VeritasTab = 
  | 'hot-topics'
  | 'lie-detector'
  | 'blindspots' 
  | 'pipeline' 
  | 'classifier' 
  | 'graph' 
  | 'tv-scorecard' 
  | 'investigations' 
  | 'brand-safety' 
  | 'public-report'
  | 'python-cli';

export type VeritasTheme = 
  | 'navy' 
  | 'sapphire' 
  | 'emerald' 
  | 'twilight' 
  | 'crimson' 
  | 'obsidian' 
  | 'light';

export const THEME_OPTIONS: { id: VeritasTheme; label: string; bgClass: string; borderClass: string; dotColor: string }[] = [
  { id: 'navy', label: 'Executive Navy', bgClass: 'bg-[#0f172a]', borderClass: 'border-blue-500', dotColor: 'bg-blue-500' },
  { id: 'sapphire', label: 'Midnight Sapphire', bgClass: 'bg-[#031533]', borderClass: 'border-cyan-500', dotColor: 'bg-cyan-400' },
  { id: 'emerald', label: 'Alpine Emerald', bgClass: 'bg-[#06241a]', borderClass: 'border-emerald-500', dotColor: 'bg-emerald-400' },
  { id: 'twilight', label: 'Royal Twilight', bgClass: 'bg-[#1e0e38]', borderClass: 'border-purple-500', dotColor: 'bg-purple-400' },
  { id: 'crimson', label: 'Imperial Crimson', bgClass: 'bg-[#2b0d17]', borderClass: 'border-rose-500', dotColor: 'bg-rose-400' },
  { id: 'obsidian', label: 'OLED Obsidian', bgClass: 'bg-[#000000]', borderClass: 'border-slate-600', dotColor: 'bg-slate-400' },
  { id: 'light', label: 'Clean Ivory Light', bgClass: 'bg-[#f1f5f9]', borderClass: 'border-slate-400', dotColor: 'bg-slate-700' },
];

interface VeritasHeaderProps {
  activeTab: VeritasTab;
  onTabChange: (tab: VeritasTab) => void;
  dlqCount: number;
  activeLearningCount: number;
  lastSyncedAt?: Date | null;
  onOpenMobileAlert?: () => void;
  currentTheme?: VeritasTheme;
  onThemeChange?: (theme: VeritasTheme) => void;
}

export const VeritasHeader: React.FC<VeritasHeaderProps> = ({
  activeTab,
  onTabChange,
  dlqCount,
  activeLearningCount,
  lastSyncedAt,
  onOpenMobileAlert,
  currentTheme = 'navy',
  onThemeChange
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [formattedSyncTime, setFormattedSyncTime] = useState<string>('Live');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState<boolean>(false);

  useEffect(() => {
    setTimeString(new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    const interval = setInterval(() => {
      setTimeString(new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastSyncedAt) {
      setFormattedSyncTime(lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [lastSyncedAt]);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top Ticker / Bloomberg-Grade Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider uppercase">VERITAS CLOUD LIVE</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">US Polarization Index:</span>
            <span className="font-mono font-bold text-amber-400">71.4 / 100</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold">HIGH DIVISION</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Stream Throughput:</span>
            <span className="font-mono font-medium text-cyan-300">1,480 msgs/s</span>
            <span className="text-slate-500 font-mono">(Batch: 100)</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 hidden md:block"></div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">DeBERTa Classifier Drift:</span>
            <span className="font-mono text-emerald-400 font-semibold">PSI 0.082 (Stable)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-[11px] font-mono shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold">LIVE 30m Auto-Sync:</span>
            <span className="text-emerald-200 font-bold">
              {formattedSyncTime}
            </span>
          </div>

          {/* Theme Palette Switcher */}
          {onThemeChange && (
            <div className="relative">
              <button
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition text-xs font-mono font-semibold cursor-pointer shadow-sm"
                title="Change Background Theme & Color Palette"
              >
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Theme:</span>
                <span className="capitalize font-bold text-cyan-300">
                  {THEME_OPTIONS.find(t => t.id === currentTheme)?.label.split(' ')[1] || 'Theme'}
                </span>
              </button>

              {isThemePickerOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsThemePickerOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                      Select Background Theme:
                    </div>
                    {THEME_OPTIONS.map(opt => {
                      const isSelected = currentTheme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onThemeChange(opt.id);
                            setIsThemePickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 text-white font-bold border border-slate-600'
                              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border border-white/20 ${opt.bgClass} flex items-center justify-center`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                            </span>
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {onOpenMobileAlert && (
            <button
              onClick={onOpenMobileAlert}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-mono font-bold cursor-pointer shadow-md shadow-emerald-600/30"
              title="Send Breaking News or Blindspot Alert to Phone via SMS, WhatsApp, or Push"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 Send Alert to Phone</span>
            </button>
          )}

          {dlqCount > 0 && (
            <button
              onClick={() => onTabChange('pipeline')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 hover:bg-rose-900 transition text-[11px] font-mono cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>DLQ Alerts: {dlqCount} Unresolved</span>
            </button>
          )}

          {activeLearningCount > 0 && (
            <button
              onClick={() => onTabChange('classifier')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 hover:bg-indigo-900 transition text-[11px] font-mono cursor-pointer"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Active Review: {activeLearningCount}</span>
            </button>
          )}

          <div suppressHydrationWarning className="text-slate-500 text-[11px] font-mono hidden lg:block min-w-[160px] text-right">
            {timeString}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Clickable Brand Logo -> Returns to First Page */}
        <div 
          onClick={() => onTabChange('lie-detector')}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Click to return to Home (Video & AI Lie Detector)"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-200">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 group-hover:from-cyan-300 group-hover:to-white transition-colors">
                VERITAS<span className="text-cyan-400 font-normal group-hover:text-cyan-300">LENS</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold group-hover:border-cyan-500 group-hover:bg-cyan-900/60 transition-colors">
                Enterprise AI v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans group-hover:text-slate-300 transition-colors">
              Information Intelligence, Claim Verification & Media Credibility Platform
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => onTabChange('lie-detector')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'lie-detector'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>🎥 Video & AI Lie Detector</span>
          </button>

          <button
            onClick={() => onTabChange('hot-topics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'hot-topics'
                ? 'bg-orange-500/25 text-orange-300 border border-orange-500/60 shadow-md shadow-orange-500/20 font-bold'
                : 'text-slate-400 hover:text-orange-300 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>🔥 Hot Topics & Unbiased Search</span>
          </button>

          <button
            onClick={() => onTabChange('blindspots')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'blindspots'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Blindspot Radar</span>
          </button>

          <button
            onClick={() => onTabChange('pipeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kafka Event Stream</span>
          </button>

          <button
            onClick={() => onTabChange('classifier')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'classifier'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>BERT MLOps Studio</span>
          </button>

          <button
            onClick={() => onTabChange('graph')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>VeritasGraph Lineage</span>
          </button>

          <button
            onClick={() => onTabChange('tv-scorecard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tv-scorecard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>7-Day TV & Spin</span>
          </button>

          <button
            onClick={() => onTabChange('investigations')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'investigations'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>GraphRAG Copilot</span>
          </button>

          <button
            onClick={() => onTabChange('brand-safety')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'brand-safety'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>B2B Brand Safety</span>
          </button>

          <button
            onClick={() => onTabChange('public-report')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'public-report'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>🥗 Echo Chamber Diet & Reports</span>
          </button>

          <button
            onClick={() => onTabChange('python-cli')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'python-cli'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Python Pipeline</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
