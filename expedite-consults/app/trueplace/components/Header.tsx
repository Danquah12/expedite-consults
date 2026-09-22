'use client';

import React from 'react';
import { Shield, EyeOff, Lock, CheckCircle2 } from 'lucide-react';

export type ThemeKey = 'dark' | 'clean' | 'nordic' | 'green' | 'sand';

export interface ThemeOption {
  id: ThemeKey;
  label: string;
  name: string;
  colorClass: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'dark', label: 'Dark', name: 'Midnight obsidian dark', colorClass: 'bg-[#111827] border border-gray-600' },
  { id: 'clean', label: 'Clean', name: 'Minimalist architectural clean', colorClass: 'bg-white border border-gray-300' },
  { id: 'nordic', label: 'Nordic', name: 'Oceanic Nordic fjord', colorClass: 'bg-[#1E3A5F] border border-blue-400/40' },
  { id: 'green', label: 'Green', name: 'Sustainable cooling deep green', colorClass: 'bg-[#0D382C] border border-[#2DD4BF]' },
  { id: 'sand', label: 'Sand', name: 'Warm natural linen sand', colorClass: 'bg-[#EBD8B8] border border-[#D5C7B2]' },
];

export interface HeaderProps {
  ghostMode: boolean;
  onToggleGhostMode: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  theme?: ThemeKey;
  onSelectTheme?: (theme: ThemeKey) => void;
  onOpenLedger?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ghostMode,
  onToggleGhostMode,
  activeTab,
  onSelectTab,
  theme = 'green',
  onSelectTheme = () => {},
  onOpenLedger = () => {},
}) => {
  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[3];

  const getHeaderBg = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#0F172A] border-[#020617]';
      case 'clean':
        return 'bg-[#1E293B] border-[#0F172A]';
      case 'nordic':
        return 'bg-[#1E3A5F] border-[#152840]';
      case 'sand':
        return 'bg-[#3D3025] border-[#241C15]';
      case 'green':
      default:
        return 'bg-[#0C382E] border-[#07251E]';
    }
  };

  const getTopBarBg = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#0B0F19] border-[#020617]';
      case 'clean':
        return 'bg-[#0F172A] border-[#020617]';
      case 'nordic':
        return 'bg-[#14263D] border-[#0E1B2D]';
      case 'sand':
        return 'bg-[#2B221A] border-[#1F1813]';
      case 'green':
      default:
        return 'bg-[#07251E] border-[#041A15]';
    }
  };

  return (
    <header className={`w-full ${getHeaderBg()} text-white sticky top-0 z-50 shadow-md transition-colors duration-300`}>
      {/* Sleek Trust Top Bar with Theme Widget */}
      <div className={`${getTopBarBg()} text-xs py-1.5 px-4 sm:px-8 border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-gray-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
            <span className="font-medium text-gray-200">The Next-Generation Real Estate Platform</span>
            <span className="hidden lg:inline text-gray-500">|</span>
            <span className="hidden lg:inline text-gray-300">48h Verified Active Inventory</span>
            <span className="hidden lg:inline text-gray-500">|</span>
            <span className="hidden lg:flex items-center space-x-1">
              <Lock className="w-3 h-3 text-[#E07A5F]" />
              <span>Zero Lead-Auctioning</span>
            </span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <button
              onClick={onOpenLedger}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-900 hover:border-emerald-300 transition-all cursor-pointer text-[11px] font-semibold shadow-2xs"
              title="Inspect 30-Minute Real Property Ledger across Maryland, Virginia, and DC"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
              <span>🔄 30m Real Ledger (MD • VA • DC)</span>
            </button>
            <span className="hidden sm:inline text-gray-500">|</span>
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
              <span>🤖 Copilot DB: 50-State Network</span>
            </div>
          </div>

          {/* Theme Selector matching the user's screenshot */}
          <div className="flex flex-col items-center bg-black/30 border border-white/10 px-3.5 py-1 rounded-xl shadow-xs">
            <span className="text-[10px] text-gray-300 font-medium tracking-tight mb-0.5">
              {currentTheme.name}
            </span>
            <div className="flex items-center space-x-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  title={t.name}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full transition-all ${t.colorClass} ${
                      theme === t.id
                        ? 'ring-2 ring-emerald-400 scale-110 shadow-xs'
                        : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                  />
                  <span
                    className={`text-[8.5px] mt-0.5 font-medium transition-colors ${
                      theme === t.id ? 'text-[#34D399] font-bold' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('search')}>
            <div className="w-10 h-10 rounded-lg bg-[#F5EDE1] text-[#0C382E] flex items-center justify-center font-bold text-xl shadow-inner border border-white/20">
              <span className="tracking-tighter">T</span>
              <span className="text-[#E07A5F] text-sm -ml-0.5">P</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">TruePlace</span>
              </div>
              <p className="text-[11px] text-gray-300 font-light hidden sm:block">
                Real Homes. Real Data. Real Peace of Mind.
              </p>
            </div>
          </div>

          {/* Mobile Ghost Mode Toggle */}
          <div className="md:hidden">
            <button
              onClick={onToggleGhostMode}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                ghostMode
                  ? 'bg-[#2DD4BF]/20 text-emerald-300 border-emerald-400'
                  : 'bg-white/10 text-gray-300 border-white/20'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{ghostMode ? 'Ghost ON' : 'Ghost OFF'}</span>
            </button>
          </div>
        </div>

          {/* Module Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
            {[
              { id: 'search', label: 'Explore Homes' },
              { id: 'valuation', label: 'TrueValue™' },
              { id: 'homeos', label: 'HomeOS™' },
              { id: 'truecost', label: 'TrueCost™' },
              { id: 'copilot', label: 'AI Copilot' },
              { id: 'inspector', label: 'AI Inspector' },
              { id: 'community', label: 'Community' },
              { id: 'whatif', label: 'What-If' },
              { id: 'explainability', label: 'SHAP Explainability' },
              { id: 'map', label: 'Map & Risk' },
              { id: 'reports', label: 'Truth Reports' },
              { id: 'admin', label: 'Admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#F5EDE1] text-[#0C382E] shadow-sm font-semibold'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Desktop Ghost Mode Control */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            <button
              onClick={onToggleGhostMode}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                ghostMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15'
              }`}
              title="Ghost Mode eliminates lead tracking, cookies, and prevents real estate agent contact."
            >
              <EyeOff className="w-4 h-4" />
              <span>Ghost Mode: {ghostMode ? 'ACTIVE' : 'OFF'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  ghostMode ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Ghost Mode Status Banner */}
        {ghostMode && (
          <div className="bg-emerald-950/90 text-emerald-200 border-t border-emerald-800 text-[11px] sm:text-xs py-1 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong>Privacy Active:</strong> Zero lead sales, zero marketing beacons, and anonymous session telemetry.
                </span>
              </div>
              <span className="text-[9px] uppercase font-mono tracking-wider bg-emerald-900 text-emerald-300 px-1.5 py-0.2 rounded-xs ml-2 shrink-0 hidden sm:inline">
                GHOST-ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom Quick-Dock Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C382E]/95 backdrop-blur-md border-t border-emerald-800/80 px-1 py-1.5 flex justify-around items-center shadow-lg text-white">
          {[
            { id: 'search', label: 'Homes', icon: '🔍' },
            { id: 'valuation', label: 'TrueValue', icon: '💎' },
            { id: 'homeos', label: 'HomeOS', icon: '🏡' },
            { id: 'truecost', label: 'TrueCost', icon: '💰' },
            { id: 'copilot', label: 'Copilot', icon: '🤖' },
            { id: 'inspector', label: 'Inspect', icon: '🔬' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all rounded-lg cursor-pointer ${
                activeTab === item.id
                  ? 'text-emerald-300 font-bold bg-white/10'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </header>
    );
  };

  export default Header;
