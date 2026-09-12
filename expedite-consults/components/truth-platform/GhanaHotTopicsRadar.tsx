'use client';

import React, { useState } from 'react';
import { 
  GHANA_CURATED_HOT_TOPICS, 
  GhanaHotTopicDossier 
} from '@/lib/truth-platform/ghana-hot-topics';
import { 
  Flame, 
  Search, 
  Scale, 
  ShieldCheck, 
  ExternalLink, 
  Share2, 
  TrendingUp, 
  Compass, 
  Layers, 
  FileText, 
  AlertCircle,
  Radio,
  ArrowRight,
  Filter,
  RefreshCw,
  Check,
  Building,
  GraduationCap,
  Zap,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

export function GhanaHotTopicsRadar() {
  const [selectedTopic, setSelectedTopic] = useState<GhanaHotTopicDossier>(GHANA_CURATED_HOT_TOPICS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTopics = GHANA_CURATED_HOT_TOPICS.filter(t => 
    ((t.topicTitle?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) || (t.category?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) || (t.tags?.some(tag => (tag?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())) ?? false))
  );

  return (
    <div className="space-y-6">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900/90 to-blue-950/70 border border-slate-700/60 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>GHANA HOT TOPICS & POLARIZATION RADAR</span>
              </span>
              <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                100% GHANAIAN NATIONAL DATABASE
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>National Political Polarization, Narrative Framing & Blindspot Monitor</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time multi-dimensional analysis comparing NDC campaign narratives against NPP delivery records across Free SHS, Dumsor liabilities, Saglemi housing, and Trainee Allowances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-center min-w-[110px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Audited Topics</div>
              <div className="text-xl font-black text-white font-mono">{GHANA_CURATED_HOT_TOPICS.length}</div>
              <div className="text-[9.5px] text-cyan-400">National Dossiers</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>SELECT GHANAIAN HOT TOPIC DOSSIER:</span>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Free SHS, Dumsor, Saglemi, Allowances..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* ── Hot Topics Selection Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredTopics.map(topic => {
          const isSelected = selectedTopic.id === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{topic.category}</span>
                  <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {topic.polarizationScore}% Polarized
                  </span>
                </div>
                <h4 className="text-xs font-black text-white line-clamp-2 leading-snug">
                  {topic.topicTitle}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-3 mt-2 border-t border-slate-800/80">
                <span>Viral Index: {topic.viralIndex}/100</span>
                <span className="text-cyan-400 font-semibold">Inspect →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected Topic Dossier Deep Dive ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
        
        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {selectedTopic.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Polarization Score: <strong className="text-rose-400">{selectedTopic.polarizationScore}%</strong>
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {selectedTopic.topicTitle}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {selectedTopic.summary}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-center text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Viral Metric</span>
              <span className="text-lg font-black text-cyan-400">{selectedTopic.viralIndex}</span>
            </span>
          </div>
        </div>

        {/* ── SECTION 1: Undisputed Factual Baseline ── */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Undisputed National Wire Facts (Auditor General & Statutory Gazettes):</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200 pl-2">
            {selectedTopic.undisputedFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── SECTION 2: Side-by-Side Narrative Comparison (NDC vs. NPP) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Column: NDC Narrative & Blindspot Omission */}
          <div className="bg-slate-950/80 border border-red-900/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                NDC OPPOSITION NARRATIVE
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">Media Framing</span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">Core Argument:</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedTopic.ndcNarrative.coreArgument}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Key Campaign Talking Points:</div>
              <ul className="text-xs text-slate-300 space-y-1 pl-3">
                {selectedTopic.ndcNarrative.keyEmphases.map((e, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">{e}</li>
                ))}
              </ul>
            </div>

            {/* Blindspot Omission */}
            <div className="bg-rose-950/30 border border-rose-500/40 p-3 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-rose-400 font-bold uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Critical Blindspot Omission by Opposition Media:</span>
              </div>
              <p className="text-[11px] text-rose-200 leading-relaxed">
                {selectedTopic.ndcNarrative.blindspotOmission}
              </p>
            </div>
          </div>

          {/* Right Column: NPP Delivery Record & Narrative */}
          <div className="bg-slate-950/80 border border-blue-900/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                NPP RULING DELIVERY RECORD
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">Governance Position</span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">Core Argument:</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedTopic.nppNarrative.coreArgument}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Key Delivery Accomplishments:</div>
              <ul className="text-xs text-slate-300 space-y-1 pl-3">
                {selectedTopic.nppNarrative.keyEmphases.map((e, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">{e}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/40 p-3 rounded-lg space-y-1">
              <div className="text-[10px] font-mono text-blue-400 font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Delivery Validation:</span>
              </div>
              <p className="text-[11px] text-blue-200 leading-relaxed">
                Empirical records cross-checked with official Ministry of Finance and GES annual performance reviews.
              </p>
            </div>
          </div>

        </div>

        {/* ── SECTION 3: Official Government Dockets & Citations ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Official Citations:</span>
            {selectedTopic.primaryDockets.map((docket, dIdx) => (
              <span key={dIdx} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-cyan-300 text-[11px]">
                {docket.citation}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Tags:</span>
            {selectedTopic.tags.slice(0, 4).map((tag, tIdx) => (
              <span key={tIdx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
