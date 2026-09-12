"use client";

import React, { useState } from 'react';
import { 
  FINAL_EVIDENCE_RECORDS, 
  EVIDENCE_SCALE_HIERARCHY, 
  ARCHIVE_ANALYTICS_SUMMARY,
  FACEBOOK_SEARCH_LAUNCHERS,
  FinalEvidenceRecord,
  EvidenceScaleLevel
} from '@/lib/truth-platform/ghana-chieftaincy-monitors-data';
import { HumanVoicePlayer } from '@/components/truth-platform/HumanVoicePlayer';
import { 
  Crown, 
  Video, 
  Share2, 
  AlertTriangle, 
  ShieldAlert, 
  Scale, 
  Volume2, 
  Play, 
  Filter, 
  Search, 
  Radio, 
  ExternalLink, 
  Landmark, 
  Flame, 
  TrendingUp, 
  Eye, 
  Cpu, 
  ChevronRight, 
  Sparkles,
  Users,
  Layers,
  FileText,
  BadgeAlert,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Building,
  Calendar,
  Layers3,
  SplitSquareVertical,
  Tv,
  FileSearch,
  BookOpen
} from 'lucide-react';

export function GhanaChieftaincyMonitorStudio() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'archive' | 'fb-search-hub' | 'evidence-scale' | 'dromankese' | 'authenticity' | 'bipartisan'>('archive');
  const [selectedEntry, setSelectedEntry] = useState<FinalEvidenceRecord | null>(FINAL_EVIDENCE_RECORDS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fbSearchFilter, setFbSearchFilter] = useState<string>('ALL');

  const filteredEntries = FINAL_EVIDENCE_RECORDS.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetRoyalAndStool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exactWords.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.verificationNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFbLaunchers = FACEBOOK_SEARCH_LAUNCHERS.filter((l) => {
    return fbSearchFilter === 'ALL' || l.category.toLowerCase().includes(fbSearchFilter.toLowerCase());
  });

  const getAuthenticityBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED_AUTHENTIC_2024':
        return { label: 'Verified Authentic 2024 Broadcast', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'DEBUNKED_RECYCLED_HISTORICAL':
        return { label: 'Debunked Recycled Clip (GhMedia Hub)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'OFFICIAL_PARTY_RECORD':
        return { label: 'Official Party / Royal Record', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      default:
        return { label: 'Documented Newsroom Investigation', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    }
  };

  const getScaleColor = (level: EvidenceScaleLevel) => {
    switch (level) {
      case 'LEVEL_1_ANONYMOUS_ACCUSATION':
        return 'text-slate-400 bg-slate-900 border-slate-700';
      case 'LEVEL_2_ORGANIC_DIGITAL_CIRCULATION':
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80';
      case 'LEVEL_3_PARTY_OFFICIAL_AMPLIFICATION':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-800/80';
      case 'LEVEL_4_PARTY_OFFICIAL_ENDORSEMENT':
        return 'text-purple-300 bg-purple-950/60 border-purple-800/80';
      case 'LEVEL_5_CAMPAIGN_STAGE_APPEARANCE':
      case 'LEVEL_6_OFFICIAL_CAMPAIGN_TEAM_MEMBER':
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80';
      default:
        return 'text-rose-300 bg-rose-950/60 border-rose-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Methodological Integrity Header */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-900 flex items-center justify-center text-amber-100 shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Crown className="w-8 h-8 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  TRADITIONAL AUTHORITY & MEDIA FORENSICS ARCHIVE
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  16-FIELD EVIDENCE RECORD
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">
                Auditing 2024 political commentary concerning Ghanaian Kings & Queens, Facebook video verification (GhanaFact), and testing the legal evidentiary threshold for party employment.
              </p>
            </div>
          </div>
        </div>

        {/* Methodological Standard Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
          <span className="font-bold text-amber-300">⚖️ Core Evidentiary Standard:</span> We document who spoke, exact words, circulation, and formal organizational links. We classify commentators as <em>“pro-NDC / NDC-aligned”</em> or <em>“independent agitators”</em> rather than <em>“contracted employees hired to insult chiefs”</em> unless documented payment records, campaign team rosters, or instruction contracts exist.
        </div>

        {/* High-Level Fact-Check Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">16-Field Case Records</div>
            <div className="text-2xl font-black text-white mt-1">
              {ARCHIVE_ANALYTICS_SUMMARY.totalAuditedEntries} Cases
            </div>
            <div className="text-[11px] text-amber-400/90 mt-0.5">Categories A through H</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Live Search Launchers</div>
            <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
              {FACEBOOK_SEARCH_LAUNCHERS.length} Queries
            </div>
            <div className="text-[11px] text-cyan-300/80 mt-0.5">Direct Facebook Video Archive</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">GhanaFact & Media Hub</div>
            <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
              {ARCHIVE_ANALYTICS_SUMMARY.verifiedAuthenticCount} Verified
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">1 Recycled Clip Debunked</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Documented Employment</div>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              0 Proof
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">No Invoices / Contracts</div>
          </div>
        </div>
      </div>

      {/* Main Studio Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('archive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'archive'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers3 className="w-4 h-4" />
          <span>🏛️ 16-Field Case Records (A-H)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fb-search-hub')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'fb-search-hub'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>🔎 Live Facebook Video Search Hub (18 Queries)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evidence-scale')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'evidence-scale'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>⚖️ The Evidence Scale (Levels 1-8)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dromankese')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'dromankese'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <SplitSquareVertical className="w-4 h-4" />
          <span>📐 3-Sided Dromankese Incident (AdomOnline)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('authenticity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'authenticity'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🔍 Video Authenticity Desk (GhanaFact)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bipartisan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'bipartisan'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>⚖️ Bipartisan Record (NPP vs NDC)</span>
        </button>
      </div>

      {/* SUB-TAB 1: 16-FIELD CASE RECORDS (A-H) */}
      {activeSubTab === 'archive' && (
        <div className="space-y-6">
          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {[
                { id: 'ALL', label: 'All Categories (A-H)' },
                { id: 'A_KELVIN_TAYLOR', label: 'A: Kelvin Taylor' },
                { id: 'B_TWENE_JONAS', label: 'B: Twene Jonas' },
                { id: 'C_OHENE_DAVID', label: 'C: Ohene David' },
                { id: 'D_NDC_OFFICIAL_PAGES', label: 'D: NDC Official Pages' },
                { id: 'E_MAHAMA_PUBLIC_STATEMENTS', label: 'E: Mahama Statements' },
                { id: 'F_DROMANKESE_THREE_SIDED_DISPUTE', label: 'F: Dromankese Case' },
                { id: 'G_ASANTEHENE_OTUMFUO_CONTROVERSIES', label: 'G: Otumfuo / Dela Edem' },
                { id: 'H_NPP_TRADITIONAL_CONTROVERSIES', label: 'H: NPP Protocol Debates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 16-field evidence cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Active Audio Player */}
          {selectedEntry && (
            <HumanVoicePlayer
              textToRead={`${selectedEntry.speaker} regarding ${selectedEntry.targetRoyalAndStool}. Statement: "${selectedEntry.exactWords}". Verification findings: ${selectedEntry.verificationNotes} Evidentiary result: ${selectedEntry.evidenceOfPaymentOrEmployment}`}
              label={`Listen to Forensic Audit: ${selectedEntry.targetRoyalAndStool}`}
              sublabel={`True Human Voice (OpenAI HD) reading full 16-field dossier for ${selectedEntry.id}`}
            />
          )}

          {/* Entries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Case Cards */}
            <div className="lg:col-span-7 space-y-4">
              {filteredEntries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id;
                const authBadge = getAuthenticityBadge(entry.authenticationResult);

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500 shadow-xl ring-1 ring-amber-400/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {entry.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${authBadge.color}`}>
                          {authBadge.label}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-amber-300 border border-amber-800/60">
                        {entry.exactDate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2.5 leading-snug">
                      {entry.speaker}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-1.5 font-mono">
                      <span className="text-amber-300 font-semibold">👑 {entry.targetRoyalAndStool}</span>
                      <span>•</span>
                      <span className="text-cyan-400">📍 {entry.targetRegion}</span>
                    </div>

                    {/* Verbatim Statement */}
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/90 text-xs text-slate-200 italic">
                      "{entry.exactWords}"
                      {entry.akanTranslation && (
                        <div className="mt-1 text-[11px] text-amber-400/80 not-italic font-mono">
                          🔊 Akan: {entry.akanTranslation}
                        </div>
                      )}
                    </div>

                    {/* 16-Field Key Findings Summary */}
                    <div className="mt-3 pt-3 border-t border-slate-800/70 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500">Relationship:</span>{' '}
                        <span className="text-slate-300">{entry.relationshipToNDC}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Employment:</span>{' '}
                        <span className="text-rose-400">{entry.evidenceOfPaymentOrEmployment}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Complete 16-Field Dossier Drawer */}
            <div className="lg:col-span-5">
              {selectedEntry ? (
                <div className="sticky top-20 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl space-y-4 backdrop-blur-md max-h-[85vh] overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white text-sm">16-FIELD CASE EVIDENCE DOSSIER</h3>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">{selectedEntry.id}</span>
                  </div>

                  {/* 1. Speaker & Affiliation */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">1. Speaker & Relationship</div>
                    <div className="font-bold text-white text-sm">{selectedEntry.speaker}</div>
                    <div className="text-cyan-300 font-mono text-[11px]">Status: {selectedEntry.relationshipToNDC}</div>
                  </div>

                  {/* 2. Target Royal & Stool */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">2. Target Royal & Stool</div>
                    <div className="font-bold text-amber-300">{selectedEntry.targetRoyalAndStool}</div>
                    <div className="text-slate-400 text-[11px]">Region: {selectedEntry.targetRegion}</div>
                  </div>

                  {/* 3. Media Links & Source Pages */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">3. Primary Pages & Video Source</div>
                    <div className="text-slate-300 text-[11px]">Original: <span className="font-mono text-amber-400">{selectedEntry.originalFacebookPage}</span></div>
                    {selectedEntry.mirrorUrl && (
                      <div className="text-slate-400 text-[11px]">Mirror: {selectedEntry.mirrorUrl}</div>
                    )}
                    <a
                      href={selectedEntry.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 text-[11px] font-mono font-bold border border-slate-700 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Source Archive Link</span>
                    </a>
                  </div>

                  {/* 4. Broadcast Coverage */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">4. TV & Radio Coverage</div>
                    <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-cyan-400" />
                      <span>TV: {selectedEntry.tvCoverage}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-amber-400" />
                      <span>Radio: {selectedEntry.radioCoverage}</span>
                    </div>
                  </div>

                  {/* 5. Transcript Snippet */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">5. Raw Transcript Snippet</div>
                    <div className="text-slate-300 italic text-[11px] leading-relaxed">
                      {selectedEntry.transcriptSnippet}
                    </div>
                  </div>

                  {/* 6. Legal Standard: Amplification vs Employment */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 text-xs space-y-2">
                    <div className="font-mono font-bold text-rose-400 text-[10px] uppercase flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      6. Amplification vs. Employment Finding
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      <strong>Amplification:</strong> {selectedEntry.evidenceOfNDCAmplification}
                    </div>
                    <div className="text-amber-300 text-[11px] font-mono">
                      <strong>Employment Status:</strong> {selectedEntry.evidenceOfPaymentOrEmployment}
                    </div>
                  </div>

                  {/* 7. Party & Traditional Responses */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-cyan-400 text-[10px] uppercase font-mono block">Party / Campaign Position:</span>
                      <span className="text-slate-300 text-[11px]">{selectedEntry.responseFromNDC}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-900">
                      <span className="font-bold text-amber-400 text-[10px] uppercase font-mono block">Traditional Authority Response:</span>
                      <span className="text-slate-300 text-[11px]">{selectedEntry.responseFromTraditionalAuthority}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                  Select an archive entry on the left to inspect.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIVE FACEBOOK VIDEO SEARCH HUB */}
      {activeSubTab === 'fb-search-hub' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Live Facebook Video Search Hub (18 Primary Queries)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct 1-click live Facebook video search queries to independently verify every broadcaster, campaign speech, and traditional leader mention.
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {['ALL', 'Kevin Taylor', 'Twene Jonas', 'Ohene David', 'NDC Official', 'Mahama Official', 'Asantehene Matrix'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFbSearchFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fbSearchFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Official Channel Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <a
                href="https://www.facebook.com/LoudSilenceMedia/videos/"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">Loud Silence Media</div>
                  <div className="text-[10px] text-slate-400 font-mono">Facebook Video Vault</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </a>

              <a
                href="https://www.facebook.com/NDCGhana/"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">NDC Ghana Official</div>
                  <div className="text-[10px] text-slate-400 font-mono">Facebook Page</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href="https://www.facebook.com/OfficialJohnMahama/"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">John Dramani Mahama</div>
                  <div className="text-[10px] text-slate-400 font-mono">Official Facebook Page</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </a>

              <a
                href="https://www.linkedin.com/company/ndc-online-gh/"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300">NDC Online GH</div>
                  <div className="text-[10px] text-slate-400 font-mono">Official LinkedIn</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </a>
            </div>

            {/* Grid of Search Query Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {filteredFbLaunchers.map((launcher) => (
                <div
                  key={launcher.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/60 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                        {launcher.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{launcher.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {launcher.targetTopic}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {launcher.description}
                    </p>
                  </div>

                  <a
                    href={launcher.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-mono text-xs font-bold transition-all border border-slate-800 hover:border-amber-400"
                  >
                    <span className="truncate max-w-[200px]">q="{launcher.query}"</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: THE EVIDENCE SCALE (LEVELS 1-8) */}
      {activeSubTab === 'evidence-scale' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                The 8-Tier Evidence Scale: "Did the NDC Employ These Commentators?"
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In investigative media analysis, asserting that a political party <em>"employed"</em> or <em>"contracted"</em> an online broadcaster requires concrete documentary evidence. Below is the evidentiary hierarchy used to audit all 2024 campaign broadcasts.
            </p>

            <div className="space-y-3 mt-4">
              {EVIDENCE_SCALE_HIERARCHY.map((tier) => (
                <div
                  key={tier.level}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    tier.thresholdMet
                      ? 'bg-slate-950/90 border-amber-500/40'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{tier.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        tier.thresholdMet
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {tier.thresholdMet ? 'Threshold Met in 2024 Archive' : 'No Documentary Proof Found'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{tier.notes}</p>
                  </div>

                  <div className="text-right sm:min-w-[200px]">
                    <span className="text-xs font-mono font-bold text-amber-300 block">
                      What it proves:
                    </span>
                    <span className="text-xs text-slate-300 font-sans">
                      {tier.evidentiaryValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-2 mt-4">
              <div className="font-bold text-amber-300 uppercase font-mono">Final Evidentiary Finding:</div>
              <p>
                While individuals like Kelvin Taylor produced pro-NDC commentary and their videos were circulated widely by party supporters (Level 2) and quoted by communicators (Level 3), there is <strong>zero public documentary proof (Level 7 or 8)</strong> indicating formal campaign contracts, payroll retainers, or instructions from the NDC National Executive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 3-SIDED DROMANKESE INCIDENT */}
      {activeSubTab === 'dromankese' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <SplitSquareVertical className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    The 3-Sided Dromankese Dispute (September 3-12, 2024)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Documented via Adom Online, JoyNews, and regional broadcast desks.
                  </p>
                </div>
              </div>

              <a
                href="https://www.adomonline.com/mahama-breaks-silence-on-brouhaha-with-dromankese-chiefs/?utm_source=chatgpt.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all"
              >
                <FileSearch className="w-4 h-4" />
                <span>Read Full AdomOnline Report</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Side 1 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Side 1: Traditional Leaders
                </div>
                <h4 className="font-bold text-white text-sm">Palace Protest & Customary Curses</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On Sept 3, 2024, Dromankese elders protested after waiting for an unfulfilled campaign visit, pouring libation and invoking traditional sanctions over alleged disrespect.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  Source: Adom TV Bono East Coverage
                </div>
              </div>

              {/* Side 2 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
                  <Radio className="w-4 h-4" />
                  Side 2: NDC Regional Response
                </div>
                <h4 className="font-bold text-white text-sm">Adom FM Logistical Explanation</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NDC Bono East communication team clarified on Adom FM that severe road conditions between Kintampo and Nkoranza caused convoy delays, dispatching an emissary with formal apologies.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  Source: Adom FM Kasiebo Morning Show
                </div>
              </div>

              {/* Side 3 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  Side 3: Mahama Public Address
                </div>
                <h4 className="font-bold text-white text-sm">Flagbearer Rebuttal & Reverence</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On Sept 12, 2024, John Mahama publicly addressed traditional authorities during a Bono rally, rejecting all claims of campaign disrespect and reiterating lifelong reverence for traditional rulers.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  Source: Official Mahama Tour Broadcast
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VIDEO AUTHENTICITY & FACT-CHECK DESK */}
      {activeSubTab === 'authenticity' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  Video Authenticity & Reverse-Image Verification Desk
                </h3>
                <p className="text-xs text-slate-400">
                  Documenting verified videos vs. recycled and misattributed social media clips.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Verified GhanaFact Case */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    VERIFIED AUTHENTIC 2024
                  </span>
                  <span className="text-xs font-mono text-slate-400">October 31, 2024</span>
                </div>
                <h4 className="font-bold text-white text-sm">GhanaFact Loud Silence Media Video Verification</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  GhanaFact used video verification tools and reverse-image techniques to trace a viral political broadcast directly to the With All Due Respect – Loud Silence Media Facebook page posted on October 31, 2024.
                </p>
                <div className="text-[11px] text-emerald-400 font-mono">
                  ✓ Authenticity Confirmed • Provenance: Loud Silence Media Facebook Page
                </div>
              </div>

              {/* Debunked GhMedia Hub Case */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    RECYCLED & MISATTRIBUTED
                  </span>
                  <span className="text-xs font-mono text-slate-400">Originally Uploaded Aug 11, 2020</span>
                </div>
                <h4 className="font-bold text-white text-sm">GhMedia Hub Debunk: Viral Twene Jonas Curse Video</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A video circulated in 2024 claiming traditional leaders recently cursed Twene Jonas was traced by GhMedia Hub back to an August 11, 2020 YouTube upload, proving it was repurposed out of context during the campaign.
                </p>
                <div className="text-[11px] text-rose-400 font-mono">
                  ⚠️ Misattributed Timeline • Do Not Treat as 2024 Campaign Event
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: BIPARTISAN RECORD */}
      {activeSubTab === 'bipartisan' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  Bipartisan Balance: Traditional Authority Political Controversies
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing political arguments from both major parties regarding traditional chieftaincy respect.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* NDC Arguments */}
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3">
                <h4 className="font-bold text-rose-300 text-sm">NDC Critique of NPP Treatment of Chiefs</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Presidential Standing Protocol:</strong> NDC leaders criticized incidents where traditional rulers were instructed to stand at public durbars to greet the President.
                  </li>
                  <li>
                    <strong>Galamsey Destabilization:</strong> Opposition communicators alleged government illegal mining policies undermined traditional stewards of ancestral lands.
                  </li>
                </ul>
              </div>

              {/* NPP Arguments */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-3">
                <h4 className="font-bold text-blue-300 text-sm">NPP Critique of NDC-Aligned Commentators</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Diaspora Cyber Vitriol:</strong> NPP officials pointed to online broadcasts targeting Asantehene Otumfuo and Okyenhene as proxy attacks on royal institutions.
                  </li>
                  <li>
                    <strong>Dela Edem TV Remarks:</strong> Condemned controversial remarks regarding former President Kufuor and traditional elders prior to official apology.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
