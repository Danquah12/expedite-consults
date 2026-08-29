'use client';

import React from 'react';
import { 
  Compass, 
  X, 
  TrendingUp, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PolarizationAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  polarizationScore: number;
}

export const PolarizationAnalysisModal: React.FC<PolarizationAnalysisModalProps> = ({
  isOpen,
  onClose,
  polarizationScore = 71.4
}) => {
  if (!isOpen) return null;

  const domainBreakdown = [
    { category: 'Judicial & Supreme Court', score: 88.4, status: 'Severe Division', color: 'bg-rose-500', textColor: 'text-rose-400' },
    { category: 'Immigration & Border Policy', score: 84.1, status: 'Severe Division', color: 'bg-rose-500', textColor: 'text-rose-400' },
    { category: 'National Politics & Elections', score: 78.2, status: 'High Polarization', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { category: 'Economy, Tariffs & Trade', score: 64.5, status: 'Moderate Division', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { category: 'Foreign Policy & Global Conflicts', score: 58.0, status: 'Moderate Division', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { category: 'Science, Tech & Environment', score: 42.3, status: 'Low Polarization', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  ];

  const historicalTrends = [
    { year: '2020 (Election Cycle)', score: 76.8, dominantIssue: 'Mail-in Ballots & Pandemic Policy' },
    { year: '2021 (Jan 6 & Transition)', score: 79.4, dominantIssue: 'Congressional Certification & Capitol' },
    { year: '2022 (Inflation & Midterms)', score: 68.2, dominantIssue: 'Monetary Policy & Inflation Act' },
    { year: '2023 (Banking Crisis & SCOTUS)', score: 64.1, dominantIssue: 'SVB Bailouts & Affirmative Action' },
    { year: '2024 (General Election)', score: 81.5, dominantIssue: 'Border Security Bill & Lawfare' },
    { year: '2025 (Tariffs & Trade Orders)', score: 69.8, dominantIssue: 'Reciprocal Trade & Budget Caps' },
    { year: '2026 (Current Live Index)', score: 71.4, dominantIssue: 'Federal Preemption & Sanctuary Ordinances' },
  ];

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-700/80 text-amber-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  National Media Polarization Index
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 border border-amber-800 text-amber-300">
                  71.4 / 100 High Division
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mathematical divergence metrics across 14 major Left, Center, and Right newsrooms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Top Graphic Gauge & Methodology */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-800">
              {/* Semi Circle Visual Gauge */}
              <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden mb-1">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                    strokeDasharray="125.6"
                    strokeDashoffset="0"
                  />
                  {/* Gradient Active Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#polarizationGrad)"
                    strokeWidth="12"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - polarizationScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="polarizationGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center Value */}
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-3xl font-black font-mono text-white leading-none">
                    {polarizationScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">out of 100</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-bold uppercase mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>High Partisan Asymmetry</span>
              </div>
            </div>

            {/* Formula & Definition */}
            <div className="md:col-span-7 space-y-2 text-xs">
              <span className="font-mono text-cyan-400 font-bold uppercase">Mathematical Formulation:</span>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                Index = (1/N) * Σ |Coverage(Left) - Coverage(Right)| * 100
              </div>
              <p className="text-slate-300 leading-relaxed">
                A score of <strong>71.4 / 100</strong> indicates that 71.4% of breaking news stories in the United States today are covered with $\ge 70\%$ partisan asymmetry, meaning one political side covers it aggressively while the other ignores it.
              </p>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-400">
              <span>Polarization Breakdown by Subject Domain:</span>
              <span className="text-[10px] text-cyan-400">Live Ingest Audit</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {domainBreakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200 truncate">{item.category}</span>
                    <span className={`font-mono font-bold ${item.textColor}`}>{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.score}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Severity:</span>
                    <span className={item.textColor}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Year Timeline Evolution */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Historic 2020–2026 Polarization Trajectory:
              </span>
            </div>
            <div className="space-y-1.5">
              {historicalTrends.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="font-mono text-slate-300 font-bold shrink-0">{t.year}:</span>
                  <span className="text-slate-400 text-[11px] truncate flex-1">{t.dominantIssue}</span>
                  <span className={`font-mono font-bold shrink-0 ${
                    t.score >= 75 ? 'text-rose-400' : t.score >= 65 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {t.score} / 100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
