'use client';

import React, { useState } from 'react';
import { NewsCluster } from '@/lib/veritaslens/types';
import { 
  Eye, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HistoricArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: NewsCluster[];
  onSelectCluster: (cluster: NewsCluster) => void;
}

export const HistoricArchiveModal: React.FC<HistoricArchiveModalProps> = ({
  isOpen,
  onClose,
  clusters,
  onSelectCluster
}) => {
  const [selectedYear, setSelectedYear] = useState<'ALL' | number>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'Left_Blindspot' | 'Right_Blindspot'>('ALL');

  if (!isOpen) return null;

  const years = Array.from(new Set(clusters.map(c => c.year || 2026))).sort((a, b) => b - a);

  const filtered = clusters.filter(c => {
    const matchYear = selectedYear === 'ALL' || (c.year || 2026) === selectedYear;
    const matchType = selectedType === 'ALL' || c.blindspotType === selectedType;
    return matchYear && matchType;
  });

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/80 text-cyan-400">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  2020–2026 Multi-Year Blindspot Archive
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {clusters.length} Historic Dossiers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore longitudinal partisan coverage asymmetries across major US political eras.
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

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">Year:</span>
            <button
              onClick={() => setSelectedYear('ALL')}
              className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                selectedYear === 'ALL' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  selectedYear === yr ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                selectedType === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('Left_Blindspot')}
              className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                selectedType === 'Left_Blindspot' ? 'bg-blue-950 border border-blue-600 text-blue-300 font-bold' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              Left Ignored
            </button>
            <button
              onClick={() => setSelectedType('Right_Blindspot')}
              className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                selectedType === 'Right_Blindspot' ? 'bg-rose-950 border border-rose-600 text-rose-300 font-bold' : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Right Ignored
            </button>
          </div>
        </div>

        {/* Archive List */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {filtered.map(c => (
            <div 
              key={c.id}
              onClick={() => {
                onClose();
                onSelectCluster(c);
              }}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/80 transition flex flex-col justify-between space-y-2.5 cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {c.year || 2026}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    c.blindspotType === 'Left_Blindspot'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {c.blindspotType === 'Left_Blindspot' ? 'Left Blindspot (Ignored by Left)' : 'Right Blindspot (Ignored by Right)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {c.category}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-cyan-400 group-hover:underline flex items-center gap-1">
                  <span>Open Dossier</span>
                  <span>→</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                "{c.representativeTitle}"
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2">
                {c.rawWireFact || c.rawWireFactSummary}
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-900">
                <span className="text-blue-400">Left: {c.leftCoveragePct}%</span>
                <span className="text-slate-400">Center: {c.centerCoveragePct}%</span>
                <span className="text-rose-400">Right: {c.rightCoveragePct}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0 text-xs text-slate-400 font-mono">
          <span>Showing {filtered.length} of {clusters.length} Historic Blindspot Records</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
