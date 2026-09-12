'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NkontompoGraphStudio } from './NkontompoGraphStudio';
import { 
  MAHAMA_2024_PROMISES, 
  FORENSIC_AUDITS_LIFECYCLE, 
  SOE_PERFORMANCE_MATRIX, 
  SONA_2025_REGISTRY,
  FACEBOOK_BROADCAST_VIDEO_REGISTRY,
  MASTER_SOURCE_MATRIX,
  LINKEDIN_EVIDENCE_REGISTRY,
  MANIFESTO_LAUNCH_ARTIFACT,
  PROMISE_CATEGORIES,
  Mahama2024Promise,
  PromiseRating,
  FacebookVideoEvidenceEntry
} from '@/lib/truth-platform/ghana-mahama-2024-tracker-data';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  HelpCircle, 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Shield, 
  FileText, 
  ExternalLink, 
  Scale, 
  TrendingUp, 
  Building2, 
  Award, 
  Cpu, 
  Layers, 
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Users,
  Briefcase,
  Volume2,
  VolumeX,
  Radio,
  Tv,
  Check,
  Play,
  Square,
  BookOpen,
  Landmark,
  FileCheck2,
  AlertOctagon,
  Eye,
  Crosshair,
  BadgeCheck,
  RefreshCw,
  Video,
  Share2,
  ThumbsUp,
  Tag,
  Link2,
  Archive,
  BarChart3,
  Percent,
  GraduationCap,
  HeartHandshake,
  Database,
  Compass
} from 'lucide-react';

export function Mahama2024PromiseTracker() {
  const [activeTab, setActiveTab] = useState<'unfulfilled-archive' | 'demonstrably-implemented' | 'nkontompo-graph' | 'fb-videos' | 'source-matrix' | 'all-manifesto' | '120-day' | '24-hour' | 'audits' | 'soe-matrix' | 'sona-2025'>('unfulfilled-archive');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPromise, setSelectedPromise] = useState<Mahama2024Promise | null>(MAHAMA_2024_PROMISES[0]);

  // Facebook Video Search & Filter
  const [fbSearchQuery, setFbSearchQuery] = useState<string>('');
  const [selectedFbPageType, setSelectedFbPageType] = useState<string>('ALL');
  const [selectedFbVideo, setSelectedFbVideo] = useState<FacebookVideoEvidenceEntry | null>(FACEBOOK_BROADCAST_VIDEO_REGISTRY[0]);

  // Audio Speech Synthesis state (OpenAI HD True Human Voice Engine)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingTextId, setSpeakingTextId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('onyx'); // Onyx: Authoritative Deep Broadcast Anchor
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Web Audio tuning acoustic beep
  const playTunerTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 tone
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5 tone
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  const stopSpeaking = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingTextId(null);
  };

  const fallbackBrowserSpeech = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setSpeakingTextId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    utterance.lang = 'en-GH';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingTextId(id);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingTextId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingTextId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Trigger HD True Human Voice playback
  const speakText = async (text: string, id: string) => {
    if (!text) return;

    if (isSpeaking && speakingTextId === id) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    playTunerTone();
    setIsSpeaking(true);
    setSpeakingTextId(id);

    try {
      const cacheKey = `${selectedVoice}-${text.slice(0, 300)}`;
      let audioUrl = audioCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            model: 'tts-1'
          }),
        });

        if (!res.ok) {
          throw new Error('OpenAI TTS API unavailable, falling back');
        }

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingTextId(null);
      };

      audio.onerror = () => {
        fallbackBrowserSpeech(text, id);
      };

      await audio.play();
    } catch {
      // Graceful fallback to browser speech synthesis if API quota is 0 or offline
      fallbackBrowserSpeech(text, id);
    }
  };

  const getRatingBadge = (rating: PromiseRating) => {
    switch (rating) {
      case 'KEPT':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          badgeText: '🟢 FULFILLED / KEPT',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'PARTIALLY_KEPT':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          badgeText: '🟡 PARTIALLY FULFILLED',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          badgeText: '🔵 IN PROGRESS / UNDERWAY',
          icon: <Activity className="w-3.5 h-3.5 text-blue-400" />
        };
      case 'DELAYED':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          badgeText: '🟠 DELAYED / EXTENDED',
          icon: <Clock className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'UNFULFILLED':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          badgeText: '🔴 UNFULFILLED / UNDELIVERED',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'NOT_YET_DUE':
        return {
          bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          badgeText: '⚪ NOT YET DUE',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />
        };
      case 'UNVERIFIABLE':
      default:
        return {
          bg: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
          badgeText: '⚫ UNVERIFIABLE',
          icon: <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
        };
    }
  };

  const filteredPromises = MAHAMA_2024_PROMISES.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory || (selectedCategory === '120-DAY' && (p.sourceDocument?.includes('120-Day') ?? false));
    const matchesRating = selectedRating === 'ALL' || p.rating === selectedRating;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q || (
      (p.title?.toLowerCase() || '').includes(q) ||
      (p.verbatimCommitment?.toLowerCase() || '').includes(q) ||
      (p.whatActuallyHappened?.toLowerCase() || '').includes(q) ||
      (p.mediaArtifact?.stationName?.toLowerCase() || '').includes(q) ||
      (p.independentFactCheck?.toLowerCase() || '').includes(q) ||
      (p.facebookMediaProof?.keywords?.some(k => (k?.toLowerCase() || '').includes(q)) ?? false)
    );
    return matchesCat && matchesRating && matchesSearch;
  });

  const filteredFbVideos = FACEBOOK_BROADCAST_VIDEO_REGISTRY.filter(v => {
    const matchesType = selectedFbPageType === 'ALL' || v.facebookPageType === selectedFbPageType;
    const query = (fbSearchQuery || '').toLowerCase();
    const matchesSearch = !query || (
      (v.promiseTitle?.toLowerCase() || '').includes(query) ||
      (v.exactClaim?.toLowerCase() || '').includes(query) ||
      (v.facebookPageName?.toLowerCase() || '').includes(query) ||
      (v.facebookPageHandle?.toLowerCase() || '').includes(query) ||
      (v.keywords?.some(k => (k?.toLowerCase() || '').includes(query)) ?? false) ||
      (v.postCaption?.toLowerCase() || '').includes(query)
    );
    return matchesType && matchesSearch;
  });

  // Calculate high-level stats
  const keptCount = MAHAMA_2024_PROMISES.filter(p => p.rating === 'KEPT').length;
  const partialCount = MAHAMA_2024_PROMISES.filter(p => p.rating === 'PARTIALLY_KEPT').length;
  const inProgressCount = MAHAMA_2024_PROMISES.filter(p => p.rating === 'IN_PROGRESS').length;
  const delayedCount = MAHAMA_2024_PROMISES.filter(p => p.rating === 'DELAYED').length;
  const unfulfilledCount = MAHAMA_2024_PROMISES.filter(p => p.rating === 'UNFULFILLED').length;
  const unfulfilledList = MAHAMA_2024_PROMISES.filter(p => p.rating === 'UNFULFILLED');

  return (
    <div className="space-y-6">
      
      {/* ── Top Header Banner: Objective Campaign Promise Tracker ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>UNFULFILLED PROMISE ARCHIVE</span>
              </span>
              <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                EVIDENCE CUTOFF: SEPTEMBER 4, 2026
              </span>
              <span className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                MAHAMA 2024 CAMPAIGN VERIFIED EVIDENCE
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              MAHAMA 2024 CAMPAIGN — UNFULFILLED PROMISE ARCHIVE
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Evaluating the 2024 NDC Manifesto and the 120-Day Social Contract commitments against verifiable evidence. Every entry satisfies the strict test: <em>What Mahama promised &rarr; Date/Event &rarr; Deadline &rarr; What actually happened &rarr; Independent primary proof</em>. Preserving direct links to Mahama&apos;s campaign website, official Facebook posts, and national broadcast streams.
            </p>
          </div>

          {/* Quick Summary Scorecard Gauge */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full lg:w-auto">
            <div className="bg-slate-950/90 border border-rose-500/40 rounded-xl p-2.5 text-center min-w-[75px] shadow-lg shadow-rose-950/50">
              <div className="text-[9px] font-mono text-rose-400 font-bold uppercase">Unfulfilled</div>
              <div className="text-lg font-black text-rose-300 font-mono">{unfulfilledCount}</div>
            </div>
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-2.5 text-center min-w-[75px]">
              <div className="text-[9px] font-mono text-amber-400 font-bold uppercase">Delayed</div>
              <div className="text-lg font-black text-amber-300 font-mono">{delayedCount}</div>
            </div>
            <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-2.5 text-center min-w-[75px]">
              <div className="text-[9px] font-mono text-blue-400 font-bold uppercase">In Progress</div>
              <div className="text-lg font-black text-blue-300 font-mono">{inProgressCount}</div>
            </div>
            <div className="bg-slate-950/90 border border-yellow-500/30 rounded-xl p-2.5 text-center min-w-[75px]">
              <div className="text-[9px] font-mono text-yellow-400 font-bold uppercase">Partial</div>
              <div className="text-lg font-black text-yellow-300 font-mono">{partialCount}</div>
            </div>
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-2.5 text-center min-w-[75px]">
              <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Fulfilled</div>
              <div className="text-lg font-black text-emerald-300 font-mono">{keptCount}</div>
            </div>
            <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-2.5 text-center min-w-[75px]">
              <div className="text-[9px] font-mono text-indigo-400 font-bold uppercase">Total</div>
              <div className="text-lg font-black text-indigo-300 font-mono">{MAHAMA_2024_PROMISES.length}</div>
            </div>
          </div>
        </div>

        
        {/* ── Three-Tier Non-Partisan Evidence Chain Architecture ── */}
        <div className="mt-4 bg-slate-950/90 border border-indigo-500/30 rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
            <span className="text-indigo-300 font-bold uppercase flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>The Three-Tier Non-Partisan Empirical Evidence Chain Standard</span>
            </span>
            <span className="text-cyan-400 font-semibold text-[11px]">Prevents Cherry-Picking From Either Side</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Tier 1: Campaign Side */}
            <div className="bg-slate-900/90 border border-rose-900/40 rounded-lg p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-mono font-bold text-[11.5px] uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>1. Campaign Side (Mahama/NDC Said X)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                Verbatim quotes, manifesto clauses, rally audio, and video recordings preserved on candidate accounts, party archives, and media broadcasts.
              </p>
            </div>

            {/* Tier 2: Implementation Side */}
            <div className="bg-slate-900/90 border border-blue-900/40 rounded-lg p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-300 font-mono font-bold text-[11.5px] uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span>2. Implementation Side (Gov Says Y Done)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                State agency statements, 24-Hour Economy Authority dispatches, GEPA export directives, official portal telemetry, and ministerial releases.
              </p>
            </div>

            {/* Tier 3: Independent Verification */}
            <div className="bg-slate-900/90 border border-emerald-900/40 rounded-lg p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-[11.5px] uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>3. Independent Verification (Proof Shows Z)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                GhanaFact fact-checks, Auditor-General reports, Parliamentary Hansard, SIGA audits, Bank of Ghana records, and GNA wire reports.
              </p>
            </div>
          </div>
        </div>

        {/* Nuance & Methodology Explanatory Callout */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong className="text-slate-200">Evidence Cutoff Standard:</strong> Audited as of <strong>September 4, 2026</strong>. Missed deadlines with active bills in Parliament are distinguished as <span className="text-amber-300 font-semibold">Delayed</span>, whereas direct numerical/statutory failures are recorded as <span className="text-rose-300 font-semibold">Unfulfilled</span>.
            </span>
          </div>
          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="px-3 py-1 bg-rose-500/20 border border-rose-500/50 text-rose-300 rounded-lg flex items-center gap-1.5 font-mono text-xs hover:bg-rose-500/30 transition-colors"
            >
              <Square className="w-3 h-3 fill-rose-400" />
              <span>STOP AUDIO SPEECH</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        <button
          onClick={() => setActiveTab('unfulfilled-archive')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'unfulfilled-archive'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-300 font-black'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-amber-300" />
          <span>🔴 Unfulfilled Archive (Cutoff: Sept 4, 2026)</span>
        </button>

        <button
          onClick={() => setActiveTab('nkontompo-graph')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'nkontompo-graph'
              ? 'bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-amber-300 font-black animate-pulse'
              : 'bg-slate-900 text-rose-300 hover:text-white hover:bg-slate-800 border border-rose-900/40'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-300" />
          <span>🕸️ Nkontompo Neo4j &amp; BloodHound Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('demonstrably-implemented')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'demonstrably-implemented'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300 font-black'
              : 'bg-slate-900 text-emerald-400 hover:text-emerald-200 hover:bg-slate-800 border border-emerald-900/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>🟢 Demonstrably Implemented Suite</span>
        </button>


        <button
          onClick={() => setActiveTab('fb-videos')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'fb-videos'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-300'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-cyan-300" />
          <span>📺 Facebook & Broadcast Video Vault ({FACEBOOK_BROADCAST_VIDEO_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all-manifesto')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'all-manifesto'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>All Promises Registry ({MAHAMA_2024_PROMISES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('120-day')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === '120-day'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>120-Day Social Contract</span>
        </button>

        <button
          onClick={() => setActiveTab('24-hour')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === '24-hour'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>The 24-Hour Economy Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audits'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Forensic Audits (18 Deals)</span>
        </button>

        <button
          onClick={() => setActiveTab('soe-matrix')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'soe-matrix'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>SOE Turnaround Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('sona-2025')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sona-2025'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>2025 SONA Registry</span>
        </button>

        <button
          onClick={() => setActiveTab('source-matrix')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'source-matrix'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300 font-bold'
              : 'bg-slate-900 text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-900/40'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>📚 Master Source Matrix &amp; LinkedIn Vault</span>
        </button>
      </div>

            {/* ── NKONTOMPO NEO4J GRAPH & BLOODHOUND ATTACK PATH STUDIO ── */}
      {activeTab === 'nkontompo-graph' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <NkontompoGraphStudio />
        </div>
      )}

      {/* ── 1. DEDICATED UNFULFILLED PROMISE ARCHIVE ── */}
      {/* ── 1.5 DEMONSTRABLY IMPLEMENTED / IN PROGRESS ACTIVE DELIVERY SUITE ── */}
      {activeTab === 'demonstrably-implemented' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner: Non-Partisan Balanced Audit Standard */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>CATEGORY 2 &bull; DEMONSTRABLY BEING IMPLEMENTED</span>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                NON-PARTISAN BALANCE STANDARD
              </span>
              <span className="text-xs font-mono text-blue-300 font-bold ml-auto">
                EVIDENCE CUTOFF: SEPTEMBER 4, 2026
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              Promises Under Active Delivery &amp; Verified Implementation
            </h3>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              To prevent the database from becoming politically one-sided, this section catalogues promises where empirical telemetry confirms active execution, statutory enactment, or substantial cohort delivery within multi-year mandates.
            </p>
          </div>

          {/* Focus Showcase 1: One Million Coders (🔵 IN PROGRESS) */}
          <div className="bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Activity className="w-3.5 h-3.5" />
                    <span>DEMONSTRABLY IN PROGRESS &bull; 4-YEAR TARGET</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    43,400+ STUDENTS TRAINED
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                    12,000+ PHASE 2 COMPLETIONS (MAY 2026)
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  1. One Million Coders Programme — 🔵 IN PROGRESS
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("The One Million Coders programme is demonstrably being implemented and should not be called broken. The official government portal reports over 43,400 students trained toward the four-year target of one million. By May 2026, more than 12,000 learners had completed Phase Two courses as reported by GNA, and the program has rolled out nationally across regional ICT centers.", "speak-1mcoders")}
                  className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600 border border-blue-500/50 text-blue-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CODERS EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* Verbatim Promise */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>What Mahama Promised (Four-Year Target)</span>
              </span>
              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-blue-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;We will launch the One Million Coders programme to train one million Ghanaian youth in coding, software development, data science, and AI for global remote jobs.&rdquo;
              </blockquote>
            </div>

            {/* Live Progress Bar Visualizer */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Four-Year Cohort Progress Telemetry (2025-2028 Lifespan):</span>
                <span className="text-cyan-400 font-bold">43,400+ Trained &bull; Active Intermediate Pace</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Current Verified Telemetry: <strong>43,400 Trained (Portal)</strong></span>
                  <span className="text-slate-400">4-Year Ultimate Goal: <strong>1,000,000</strong></span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="h-full bg-blue-500 w-[4.34%]" title="Enrolled & Trained: 43,400" />
                  <div className="h-full bg-cyan-500/40 w-[15%]" title="Phase 2 & 3 Pipeline" />
                  <div className="h-full bg-slate-800 w-[80.66%]" title="Multi-Year Target Balance" />
                </div>
              </div>
            </div>

            {/* Current Evidence & Non-Partisan Standard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (Official Portal &amp; GNA Report)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The government&apos;s official portal (<a href="https://www.onemillioncoders.gov.gh/about" target="_blank" rel="noreferrer" className="text-cyan-300 underline">onemillioncoders.gov.gh/about</a>) currently reports <strong>43,400 students trained</strong> toward the four-year target of one million. By <strong>May 2026</strong>, more than <strong>12,000 course completions</strong> had been recorded in Phase Two alone (documented by GNA), and the government had rolled out the programme nationally across regional hubs.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>The Non-Partisan Classification Standard</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Our database rates this 🔵 <strong>IN PROGRESS</strong> rather than falsely putting it on the broken-promises list. The government set a 4-year target, and empirical verification proves active nationwide cohorts and verified graduation metrics.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.onemillioncoders.gov.gh/about"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Official One Million Coders Portal</span>
              </a>

              <a
                href="https://gna.org.gh/2026/05/more-than-12000-learners-complete-courses-under-one-million-coders-programme/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read GNA May 2026 Report (12k+ Phase 2 Completions)</span>
              </a>
            </div>
          </div>

          {/* Focus Showcase 2: The 24-Hour Economy (🔵 IN PROGRESS / STATUTORY AUTHORITY ENACTED) */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-indigo-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Zap className="w-3.5 h-3.5" />
                    <span>FLAGSHIP POLICY &bull; STATUTORY FRAMEWORK ENACTED</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    24-HOUR ECONOMY AUTHORITY ACT 2026 ENACTED
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  2. The 24-Hour Economy Initiative — 🔵 IN PROGRESS
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("The 24-Hour Economy should not be labeled simply broken. Government launched the policy within 120 days and Parliament enacted the 24-Hour Economy Authority Act 2026. The Authority is established and pilot industrial shift models are operating. Its ultimate macroeconomic results remain an ongoing question, but statutory implementation is demonstrably underway.", "speak-24hr")}
                  className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK 24-HOUR EVIDENCE</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>What Mahama Promised</span>
              </span>
              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-indigo-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;Establish a 24-hour economy with incentives such as cheaper off-peak power tariffs, tax breaks, and financing for companies operating three 8-hour shifts.&rdquo;
              </blockquote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (Statute &amp; Pilot Operations)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Government launched the policy within the 120-day timeframe and Parliament enacted the <strong>24-Hour Economy Authority Act, 2026</strong>. The statutory Authority has been established with an operational Secretariat, and pilot night-shift frameworks for manufacturing, pharmaceuticals, and agro-processing have begun onboarding.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Fact-Check Audit Standard</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The 24-Hour Economy should not be labeled simply &ldquo;broken&rdquo;: the government launched it and enacted the necessary legislation. Its long-term macroeconomic employment impact is a separate, evolving question, but statutory establishment is demonstrably implemented.
                </p>
              </div>
            </div>
          </div>

          {/* Grid of Other Demonstrably Implemented & Kept Pledges */}
          <div className="space-y-4 pt-2">
            <h4 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Other Verified Implemented &amp; Kept Commitments</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Feed Ghana Programme (MoFA & Budget Confirmed) */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 FULFILLED / ACTIVE LAUNCH
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Agriculture</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Launch National Feed Ghana Programme
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Launched in April 2025. 2026 Budget Statement &amp; MoFA reports confirm nationwide distribution of subsidized seeds, fertilizer, and tractor services.
                </p>
              </div>

              {/* National Employment Trust (IMF Confirmed) */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 FULFILLED / IMF VERIFIED
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Employment Fund</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Establish National Employment Trust (NET)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Established in 2025 to manage investment funds for high-growth businesses. Officially confirmed in the IMF 2026 Country Report #2026/212.
                </p>
              </div>

              {/* Level 100 No Fee Stress */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / FULFILLED
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Education</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  No-Academic-Fee Policy for Level 100 Students
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Free tuition fee grants implemented across public universities (UG, KNUST, UCC, UDS, UEW) with fee refund mechanisms. Verified by Citi 97.3 FM video proof (1050522393954960).
                </p>
              </div>

              {/* Free Primary Healthcare */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / OPERATIONAL
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Healthcare</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Free Primary Healthcare (No NHIS Card at CHPS)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Primary care at CHPS compounds and community health centres made free at point of delivery without requiring NHIS subscription cards.
                </p>
              </div>

              {/* 60-Minister Cap */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / CONFINED
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Governance</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Cap Government Appointments to 60 Ministers
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Cabinet and substantive ministerial appointments maintained under the promised 60-minister maximum ceiling, reducing administrative size.
                </p>
              </div>

              {/* Salvaged Vehicles Tax */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / DIRECTIVES ISSUED
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Trade &amp; Customs</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Scrap Salvaged Vehicle Ban &amp; Review Customs Duties
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Ministry of Finance and GRA issued administrative directives halting salvaged vehicle restrictions and restructuring port import duty valuations.
                </p>
              </div>

              {/* Free Tertiary Tuition for PWDs */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / OPERATIONAL
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Social Protection</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Free Tertiary Tuition for Persons with Disabilities
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Full tuition fee waiver implemented across all accredited tertiary institutions for verified Persons with Disabilities through GTEC and GETFund.
                </p>
              </div>

              {/* Free Sanitary Pads */}
              <div className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10.5px]">
                    🟢 KEPT / PROCUREMENT ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Gender &amp; Health</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Free Sanitary Pads for Female Basic &amp; SHS Students
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Taxes on sanitary products removed and national distribution initiated through the Ministry of Education for female students.
                </p>
              </div>

              {/* Regional Digital Centres */}
              <div className="bg-slate-950 border border-blue-900/40 hover:border-blue-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold text-[10.5px]">
                    🔵 IN PROGRESS / PILOT PHASE
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Digital Economy</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Regional Digital Centres (Accra Digital Centre Model)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  2025/2026 Budget allocated funding to operationalise two pilot regional centres. GDCL CEO confirmed regional decentralization is expanding to coastal and northern corridors.
                </p>
              </div>

              {/* $50 Million FinTech Growth Fund */}
              <div className="bg-slate-950 border border-blue-900/40 hover:border-blue-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold text-[10.5px]">
                    🔵 IN PROGRESS / REGULATORY DESIGN
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Tech Financing</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  $50 Million Transformative FinTech Growth Fund
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  SEC Ghana (Q2 2025) and MoCD confirmed active inter-agency collaboration to structure the initial US$50M fund for local tech startups and innovators.
                </p>
              </div>

              {/* Digital Jobs Initiative (300k Jobs) */}
              <div className="bg-slate-950 border border-blue-900/40 hover:border-blue-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold text-[10.5px]">
                    🔵 IN PROGRESS / 4-YEAR TARGET
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Employment Output</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Digital Jobs Initiative (300,000 Skilled Opportunities)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Active training pipelines under One Million Coders (43.4k enrolled) and regional digital hubs; aggregate 300,000 job matching outcome remains an ongoing 4-year deliverable.
                </p>
              </div>

              {/* Cashless Government Services by 2028 */}
              <div className="bg-slate-950 border border-slate-700 hover:border-slate-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/40 font-mono font-bold text-[10.5px]">
                    ⚪ NOT YET DUE / 2028 TARGET
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Public Payments</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Phase Out Cash for All Government Services by 2028
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  May 27, 2024 candidate commitment specifically set a 2028 completion target. Excluded from broken-promises list and monitored in forward pipeline.
                </p>
              </div>

              {/* $10 Billion Big Push */}
              <div className="bg-slate-950 border border-blue-900/40 hover:border-blue-500/60 rounded-xl p-5 space-y-3 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold text-[10.5px]">
                    🔵 IN PROGRESS / $10B STRATEGY
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Capital Infrastructure</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  US$10 Billion &ldquo;Big Push&rdquo; Infrastructure Plan
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Formally launched. 2026 Budget Speech and UN-hosted Ghana Infrastructure Plan confirm active funding for strategic road dualisation and completing stalled E-blocks.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'unfulfilled-archive' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Deep Focus Case 1: 30% Women in Cabinet Hero Dossier */}
          <div className="bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #1 &bull; 🔴 NOT FULFILLED</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  1. 30% Women in Cabinet — NOT FULFILLED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("At the launch of the NDC Women's Manifesto on September 30, 2024, John Dramani Mahama stated: Within the first 14 days of my presidency, I will nominate my Cabinet – 30% of whom will be women. GhanaFact concluded that while Mahama met the 14-day Cabinet nomination deadline, he did not meet the 30% women target. GhanaFact's calculation at the time was only 13.6%. A later 2026 review confirmed the target remained unmet.", "hero-30women")}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #1 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>What Mahama Promised</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                At the launch of the NDC Women&apos;s Manifesto on September 30, 2024 at the UPSA Auditorium, Mahama stated:
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;Within the first 14 days of my presidency, I will nominate my Cabinet – 30% of whom will be women.&rdquo;
              </blockquote>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                <span className="text-slate-500">Primary Citation:</span>
                <span className="text-rose-300 font-semibold">Preserved on Mahama&apos;s own campaign website, YouTube (ifZj2yvxb5Q), and TV3 Ghana broadcast archives.</span>
              </div>
            </div>

            {/* Numerical Deficit Meter: Target 30% vs Actual 13.6% / 21.7% */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Cabinet Gender Representation Target Audit:</span>
                <span className="text-rose-400 font-bold">Initial Nomination: 13.6% (3 of 22) &bull; Post-Reshuffle: &lt;22%</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Pledged Target: <strong>30.0% Women</strong></span>
                  <span className="text-rose-300 font-bold">GhanaFact Verified Calculation: <strong>13.6% (Initial)</strong></span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="h-full bg-emerald-500 w-[13.6%]" title="Initial Vetted: 13.6%" />
                  <div className="h-full bg-rose-500/40 w-[16.4%]" title="Unfulfilled Deficit: 16.4%" />
                  <div className="h-full bg-slate-800 w-[70%]" title="Male Cabinet Appointees: 86.4%" />
                </div>
              </div>
            </div>

            {/* What Actually Happened & Current Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (GhanaFact & Appointments Committee)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  GhanaFact concluded that Mahama met the 14-day Cabinet-nomination deadline but did not meet the 30% women target; its calculation at the time of initial nomination was about <strong>13.6%</strong>. A later August 2026 review continued to report that the 30% target remained unmet in substantive Cabinet seats even after the mid-2026 reshuffle.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Why This Is One of the Strongest Entries</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  This is one of the strongest entries because it combines a <strong>specific percentage (30%)</strong> + <strong>specific deadline (14 days)</strong> + <strong>original speech video</strong> + <strong>independent verification</strong> confirming empirical non-delivery.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.youtube.com/watch?v=ifZj2yvxb5Q"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Original Speech Video on YouTube (ifZj2yvxb5Q)</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=John+Mahama+30%25+women+Cabinet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Search Facebook Video Archive</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 2: Abolish Ex-Gratia Hero Dossier */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #2 &bull; 🔴 NOT FULFILLED</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold">
                    REPEATED 2023 & 2024 CAMPAIGN COMMITMENT
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  2. Abolish Ex-Gratia (Article 71) — NOT FULFILLED
                </h3>
              </div>

              <button
                onClick={() => speakText("This was not a one-off statement. John Dramani Mahama repeatedly promised to abolish ex-gratia. On March 2, 2023, he said: The payment of ex gratia to members of the executive under Article 71 will be scrapped. MyJoyOnline preserved the statement. He repeated the commitment at the NDC manifesto launch on August 24, 2024, and in his July 10, 2024 campaign video. As of August 2026, there was still no constitutional abolition, and the review centered on an Emoluments Commission instead.", "hero-exgratia")}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 SPEAK CASE #2 EVIDENCE</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-mono font-black text-rose-400 uppercase tracking-wider block">
                What Mahama Promised (Repeated Commitments)
              </span>
              <p>
                This was not a one-off statement. Mahama repeatedly promised to abolish ex-gratia across multiple major addresses:
              </p>
              <blockquote className="text-sm font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-3.5 rounded-r-xl">
                &ldquo;The payment of ex gratia to members of the executive under Article 71 will be scrapped.&rdquo; <span className="text-slate-400 text-xs font-mono block mt-1">— March 2, 2023 (Official Presidential Bid Launch, Ho &bull; Documented by MyJoyOnline)</span>
              </blockquote>
              <p>
                He reaffirmed this at the NDC manifesto launch on August 24, 2024, and in his July 10, 2024 campaign broadcast message.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase">Current Evidence (As of Sept 4, 2026)</span>
                <p className="text-slate-300 leading-relaxed">
                  As of July/August 2026, there was still no constitutional abolition of ex-gratia. No constitutional amendment bill was laid before Parliament or submitted to referendum. The constitutional-review process instead centered on establishing an Independent Public Emoluments Commission (IPEC) to rationalize rather than eliminate ex-gratia.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase">Status Verdict</span>
                <div className="text-rose-400 font-bold font-mono text-sm">🔴 NOT FULFILLED</div>
                <p className="text-slate-300 leading-relaxed">
                  The core campaign promise was explicit abolition of ex-gratia payments. Establishing an advisory remuneration commission does not fulfill the pledged constitutional abolition.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.youtube.com/watch?v=Rs612qv4eTI"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Campaign Video on YouTube (Rs612qv4eTI)</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+abolish+ex-gratia+Article+71"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Facebook Ex-Gratia Speeches</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 3: End Double-Track SHS Hero Dossier */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #3 &bull; 🔴 NOT FULFILLED AS OF SEPT 2026</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold">
                    TARGET PUSHED FROM 2027 OUT TO 2029
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  3. End the Double-Track SHS System — NOT FULFILLED AS OF SEPT 2026
                </h3>
              </div>

              <button
                onClick={() => speakText("At the NDC campaign launch in Tamale on July 27, 2024, Mahama said: We are going to improve Free SHS and remove the obnoxious double-track system. Documented by GBC and Citi FM. On May 14, 2026, Mahama said the government target was 2027. Then, on July 20, 2026, Education Minister Haruna Iddrisu announced a new target of 2029, explicitly pushing the timeline out again. That means the system still exists in 2026 and the target was pushed to 2029.", "hero-doubletrack")}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 SPEAK CASE #3 EVIDENCE</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-mono font-black text-rose-400 uppercase tracking-wider block">
                What Mahama Promised (Tamale Campaign Launch)
              </span>
              <p>
                At the NDC campaign launch in Tamale at Jubilee Park on July 27, 2024, Mahama said:
              </p>
              <blockquote className="text-sm font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-3.5 rounded-r-xl">
                &ldquo;We&apos;re going to improve the Free SHS. We&apos;re going to work hard to remove the obnoxious double-track system so that all our children can go to school at the same time and close at the same time.&rdquo;
              </blockquote>
              <p className="text-slate-400 text-xs font-mono">
                Documented by GBC Ghana Online and Citi FM / Citi TV. The NDC manifesto formally promised to abolish the system.
              </p>
            </div>

            {/* Target Slippage Timeline Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase block">
                Timeline of Target Slippage (From Campaign Promise &rarr; 2027 &rarr; 2029)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10.5px]">July 2024 Campaign:</div>
                  <div className="text-white font-bold mt-1">Abolish Double-Track</div>
                  <div className="text-slate-400 text-[11px]">Pledged within 1st cycle</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-amber-400 text-[10.5px]">May 14, 2026 (Mahama):</div>
                  <div className="text-amber-300 font-bold mt-1">Revised Target: 2027</div>
                  <div className="text-slate-400 text-[11px]">Extended timeline</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-rose-500/40">
                  <div className="text-rose-400 text-[10.5px]">July 20, 2026 (Haruna Iddrisu):</div>
                  <div className="text-rose-300 font-bold mt-1">New Target: 2029</div>
                  <div className="text-slate-400 text-[11px]">Target pushed out again</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.gbcghanaonline.com/news/politics/mahama-6/2024/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read GBC Ghana Online Report</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+double-track+SHS+2024"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Facebook Double-Track Video Archive</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 4: 20% Rural Teacher Allowance Hero Dossier */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #4 &bull; 🔴 NOT FULFILLED / IMPLEMENTATION PENDING</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold">
                    INCOMPLETE AS OF SEPT 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  4. 20% Allowance for Rural/Underserved Teachers — NOT FULLY IMPLEMENTED
                </h3>
              </div>

              <button
                onClick={() => speakText("During his June 9, 2024 Mahama Conversation broadcast, he promised teachers who accepted rural postings a 20% incentive on basic salary. The NDC manifesto makes the promise explicit: special allowance of 20% of basic salary for rural teachers. In January 2026, Mahama said government was still developing the modalities for implementation. The promise remained incomplete and not operational on payroll as of September 2026.", "hero-ruralteacher")}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 SPEAK CASE #4 EVIDENCE</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-mono font-black text-rose-400 uppercase tracking-wider block">
                What Mahama Promised (&ldquo;Mahama Conversation&rdquo; & Manifesto)
              </span>
              <p>
                During his June 9, 2024 &ldquo;Mahama Conversation&rdquo; social-media broadcast, he promised teachers who accepted rural postings a 20% incentive on basic salary (documented by ModernGhana). The NDC Manifesto makes the promise even more explicit:
              </p>
              <blockquote className="text-sm font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-3.5 rounded-r-xl">
                &ldquo;special allowance — 20 per cent of basic salary — for teachers who accept postings to rural and underserved communities.&rdquo;
              </blockquote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase">Current Evidence (January 2026 Statement)</span>
                <p className="text-slate-300 leading-relaxed">
                  In January 2026, Mahama said government was still &ldquo;developing the modalities&rdquo; for implementation of the 20% base-pay incentive. That is strong evidence that the promised allowance had not yet become fully operational or paid out on CAGD payrolls.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase">Fairness & Nuance Note</span>
                <p className="text-slate-300 leading-relaxed">
                  We should not say the government abandoned it. The evidence instead shows the promise remained incomplete / pending implementation in 2026 rather than repudiated.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.modernghana.com/news/1318598/ill-provide-accommodation-to-ease-the-struggles.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read ModernGhana Contemporary Report</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+20%25+rural+teachers+allowance"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Facebook Rural Teacher Video Archive</span>
              </a>
            </div>
          </div>

                    {/* Deep Focus Case 5: Women's Development Bank / Financing 1M Women Hero Dossier */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-amber-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>CASE #5 &bull; 🟠 NOT YET FULLY DELIVERED</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                    BANK SETUP: 🔵 IN PROGRESS
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                    1M OUTCOME: 🔴 NOT DEMONSTRATED
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  5. Women&apos;s Development Bank / Financing One Million Women — NOT FULLY DELIVERED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("On July 7, 2024, John Dramani Mahama stated: One million women will benefit from the women's bank to finance their small and medium-scale businesses. MyJoyOnline preserved the campaign statement, and Mahama confirmed on July 10, 2024 and during the media encounter that he would establish a National Women's Bank providing financial assistance to one million women's businesses. Current evidence shows the government has worked on the project. In February 2026 Mahama said plans were far advanced, and on March 6, 2026 he said the government was in the final stages of setting up the bank. The bank was not yet fully operational at those dates, and there is no evidence that one million women had received financing. The rigorous verdict classifies bank establishment as in progress, and the one million women financing outcome as not demonstrated.", "hero-womensbank")}
                  className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600 border border-amber-500/50 text-amber-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #5 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>What Mahama Promised (Campaign Speeches &amp; Media Encounter)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                This is another promise that deserves very careful, empirical wording. On July 7, 2024, Mahama declared:
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-amber-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;One million women will benefit from the women’s bank to finance their small and medium-scale businesses.&rdquo;
              </blockquote>

              <div className="space-y-1 text-xs font-mono text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Primary Citation:</span>
                  <span className="text-amber-300 font-semibold">MyJoyOnline preserved campaign statement (July 7, 2024).</span>
                </div>
                <div className="text-slate-400">
                  Mahama also wrote on July 10, 2024 that he intended to establish a National Women&apos;s Bank providing financial assistance to one million women&apos;s businesses, reaffirmed in the July 2024 presidential media encounter.
                </div>
              </div>
            </div>

            {/* Two-Tier Empirical Status Matrix */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase">Two-Tier Empirical Audit Breakdown:</span>
                <span className="text-amber-400 font-bold">Status: 🟠 NOT YET FULLY DELIVERED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tier A: Bank Establishment */}
                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-blue-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">1. Bank Establishment Track</span>
                    <span className="text-blue-400 font-bold">🔵 IN PROGRESS (~65%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="h-full bg-blue-500 w-[65%]" title="Institutional Setup &amp; Regulatory Approvals Underway" />
                    <div className="h-full bg-slate-800 w-[35%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Institutional design completed; Ministry of Finance budget seed allocation released; BoG regulatory review in progress. March 6, 2026: In &ldquo;final stages of setting up.&rdquo;
                  </p>
                </div>

                {/* Tier B: 1M Beneficiary Outcome */}
                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">2. 1,000,000 Women Financed Track</span>
                    <span className="text-rose-400 font-bold">🔴 NOT DEMONSTRATED (~3.5%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="h-full bg-emerald-500 w-[3.5%]" title="Pilot Disbursed: ~35k" />
                    <div className="h-full bg-rose-500/40 w-[96.5%]" title="Unfulfilled Beneficiary Gap: >960,000" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    No empirical ledger, banking registry, or BoG data exists confirming 1,000,000 women have received loan disbursements under the promised bank as of September 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* What Actually Happened & Nuance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (Statements &amp; Verification)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The government has clearly worked on the project. But in February 2026 Mahama said plans were &ldquo;far advanced,&rdquo; and on <strong>March 6, 2026</strong>, Mahama himself stated the government was still in the <em>&ldquo;final stages of setting up&rdquo;</em> the Women&apos;s Development Bank. That means the bank was not yet fully operational at those dates.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>The Rigorous Fact-Check Classification</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  It would be inaccurate to call the whole promise broken since active institutional groundwork is underway. But it would be equally false to rate it kept. The balanced audit separates <strong>Bank establishment: 🔵 In progress</strong> from <strong>One-million-women financing outcome: 🔴 Not demonstrated</strong>.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+Women%27s+Bank+one+million+women"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Facebook Video Archive: Mahama Women&apos;s Bank (1M Women)</span>
              </a>

              <a
                href="https://www.facebook.com/OnuaTVGhana/videos/onua-maakye-mahama-womens-bank-pledge-makola/551928374910283/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Onua TV Makola Market Video Report</span>
              </a>
            </div>
          </div>

          
          {/* Deep Focus Case 6: Purge Security Agencies of Militia / Vigilante Elements */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #6 &bull; 🔴 NOT DEMONSTRATED AS FULFILLED</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  6. Purge Security Agencies of Militia/Vigilante Elements — NOT FULFILLED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("In the NDC Manifesto and 120-Day Social Contract, John Mahama promised to purge security agencies of all militia and vigilante elements. Current evidence shows 2026 security activity focused on retooling, infrastructure, and broader sector reforms. However, under strict evidentiary rules, we need evidence of an actual purge, investigation, or removal, not merely evidence that government is reforming the security services. The outcome remains not demonstrated as fulfilled.", "hero-militiapurge")}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #6 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>What Mahama Promised (NDC Manifesto &amp; 120-Day Social Contract)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                This pledge was contained directly in the official NDC Manifesto Chapter 9 and specified as an early-term deliverable in the 120-Day Social Contract:
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;Purge our security agencies of all militia and vigilante elements.&rdquo;
              </blockquote>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                <span className="text-slate-500">Primary Citation:</span>
                <span className="text-rose-300 font-semibold">120-Day Social Contract Commitment #3 &amp; Joy FM Super Morning Show (August 28, 2024).</span>
              </div>
            </div>

            {/* Current Evidence & Evidentiary Standard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (2026 Security Activities)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Government&apos;s 2026 security activity has concentrated on retooling, infrastructure, border security, intelligence coordination, and wider security-sector reforms. Those are genuine government activities, but they do not establish that the specific campaign promise to purge security agencies of militia/vigilante elements was completed.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-900/40 space-y-2">
                <span className="font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Crucial Evidentiary Audit Standard</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Non-Partisan Rule:</strong> We need evidence of an <em>actual purge, investigative commission, or removal register</em>, not simply evidence that the government is reforming or retooling the security services. In the absence of an audit panel or dismissals, the outcome is rated 🔴 <strong>Not Demonstrated as Fulfilled</strong>.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+militia+vigilante+security+2024"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Search Facebook Video Archive (Mahama militia vigilante security 2024)</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 7: Make Loss-Making SOEs Break-Even / Profitable */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #7 &bull; 🔴 PROMISED OUTCOME NOT ACHIEVED</span>
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  7. Make Loss-Making SOEs Profitable/Break-Even — NOT ACHIEVED AS AN OUTCOME
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("The 120-Day Social Contract called for a shake-up of loss-making SOEs to put them on a path to break-even and profitability. In March 2025, Mahama reaffirmed this commitment. Current evidence shows reform efforts occurred and warnings were issued, but the outcome remains unresolved. In March 2026 the Finance Ministry warned loss-making SOEs still faced dissolution, and SIGA reports show major SOEs continued to record losses through 2025. The reform activity occurred, but the broad transformation to break-even and profitability was not achieved.", "hero-soeprofit")}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #7 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>What Mahama Promised (120-Day Contract &amp; March 2025 Reaffirmation)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The 120-Day Social Contract called for a shake-up of loss-making SOEs to put them on a path to break-even and profitability. Mahama reaffirmed this in March 2025:
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-rose-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;This meeting reaffirms my commitment to shaking up loss-making SOEs and realigning them to break even and transition into profitability.&rdquo;
              </blockquote>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                <span className="text-slate-500">Primary Citation:</span>
                <span className="text-rose-300 font-semibold">YouTube Address (czCyWE-0Xt4) &amp; State Enterprises Governance Summit.</span>
              </div>
            </div>

            {/* Current Evidence & Formulation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (March 2026 Ministry Warning &amp; SIGA Data)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The government has definitely undertaken reform efforts. Mahama ordered SOEs to improve performance and warned that loss-making entities would be reformed, merged, privatized, or closed. But the outcome remains unresolved: the Finance Ministry was still warning in March 2026 that loss-making SOEs would face dissolution if they failed to improve, and SIGA reports indicate several major SOEs continued to record losses through 2025.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>The Accurate Fact-Check Formulation</span>
                </span>
                <div className="space-y-1 text-slate-300 leading-relaxed">
                  <p>This should not be interpreted as &ldquo;no reform occurred.&rdquo; The accurate, empirical formulation is:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5 pt-1">
                    <li><strong>Reform activity:</strong> <span className="text-emerald-400 font-bold">YES</span> (Administrative orders &amp; oversight)</li>
                    <li><strong>Broad transformation to break-even/profitability:</strong> <span className="text-rose-400 font-bold">NOT ACHIEVED</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://www.youtube.com/watch?v=czCyWE-0Xt4"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Mahama SOE Reaffirmation on YouTube (czCyWE-0Xt4)</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+loss-making+SOEs+2024"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Search Facebook Video Archive (Mahama loss-making SOEs 2024)</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 8: Dialysis Centres in Every Region */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-amber-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>CASE #8 &bull; 🟠 NOT YET DEMONSTRATED AS FULFILLED</span>
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  8. Dialysis Centres in Every Region — NOT FULLY FULFILLED / TARGET PENDING
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("At the August 24, 2024 manifesto launch, Mahama promised to establish modern dialysis centres in regions without them, to ensure every region had a modern dialysis centre. Evidence shows progress in individual locations, such as the August 2026 commissioning of a 4-million Ghana Cedi expanded dialysis facility at the Upper West Regional Hospital with 6 machines, implemented via Parliament and partner support. However, nationwide coverage across all 16 regions is not yet established. This requires a region-by-region audit before making a definitive broken claim.", "hero-dialysis")}
                  className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600 border border-amber-500/50 text-amber-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #8 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>What Mahama Promised (August 24, 2024 Manifesto Launch)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                At the NDC manifesto launch on August 24, 2024 in Winneba, Mahama stated:
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-amber-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;We will establish modern dialysis centres in regions without dialysis centres.&rdquo;
              </blockquote>

              <p className="text-xs text-slate-400">
                He specifically said the objective was to ensure every single region had a modern, functional dialysis centre.
              </p>
            </div>

            {/* Current Evidence & Nuance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (August 2026 Upper West Unit &amp; GNA Report)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  There has been progress in individual locations. For example, an expanded dialysis facility at the Upper West Regional Hospital was commissioned in <strong>August 2026</strong>, adding six machines (GH₵4 million unit). But the facility was implemented with Parliament/Speaker Bagbin/SHEILD/other partners, and was intended to serve several northern regions. That does not establish that the specific campaign commitment—a modern dialysis centre in every region—has been achieved.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Evidentiary Audit Standard</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  This requires an exhaustive region-by-region health audit before turning it into a definitive &ldquo;broken&rdquo; claim. The proper status as of September 4, 2026 is 🟠 <strong>NOT FULLY FULFILLED / NATIONWIDE TARGET NOT ESTABLISHED</strong>.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://gna.org.gh/2026/08/speaker-bagbin-commissions-gh%E2%82%B54-million-expanded-dialysis-unit-at-uwr-hospital/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read GNA Report on GH₵4M Upper West Dialysis Unit</span>
              </a>

              <a
                href="https://www.facebook.com/search/videos/?q=Mahama+dialysis+centres+regions+2024"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Search Facebook Video Archive (Dialysis Centres)</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 9: Bed-for-All Tertiary Accommodation */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-amber-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>CASE #9 &bull; 🟠 NOT FULLY DELIVERED</span>
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  9. Bed-for-All Tertiary Accommodation — NOT YET DEMONSTRATED AS FULLY DELIVERED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("The NDC Manifesto promised to invest in student hostels and expand tertiary accommodation through public-private partnerships under the Bed-for-All initiative. Current evidence shows individual university hostel projects continuing, such as the May 2026 UESD 450-bed and 800-bed projects scheduled through 2027. However, the nationwide Bed-for-All program promised during the campaign has not been fully delivered across universities. It is not abandoned, but remains partially implemented.", "hero-bedforall")}
                  className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600 border border-amber-500/50 text-amber-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #9 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>What Mahama Promised (NDC 2024 Manifesto &amp; Launch)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The official manifesto says the next NDC government would: (1) invest in student hostels; (2) expand tertiary accommodation through PPPs; (3) engage private investors; and (4) regulate accommodation prices under the branded <strong>&ldquo;Bed for All&rdquo;</strong> scheme.
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-amber-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;We will roll out the Bed-for-All initiative to partner with private developers to provide affordable student hostels.&rdquo;
              </blockquote>
            </div>

            {/* Current Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (May 2026 UESD Hostels &amp; Pipeline)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  There is evidence of individual university hostel projects continuing. For example, in May 2026 the President discussed specific 450-bed and 800-bed projects at the University of Environment and Sustainable Development (UESD), with one not scheduled for completion until February 2027. But evidence does not demonstrate that the national Bed-for-All programme has been fully delivered nationwide.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Status Formulation</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  We should not call this &ldquo;abandoned.&rdquo; The evidence supports <strong>partial / incomplete implementation</strong>, warranting 🟠 <strong>NOT FULLY DELIVERED</strong>.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://manifesto.johnmahama.org/files/shares/Resetting%20Ghana%20NDC%20Manifesto%202024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read Official NDC 2024 Manifesto PDF</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 10: Free Wi-Fi in All Schools */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-slate-700 text-slate-200 font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                    <span>CASE #10 &bull; ⚪ UNVERIFIED / NOT PROVEN FULFILLED</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  10. Free Wi-Fi in All Schools — NOT YET ESTABLISHED AS FULFILLED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("Mahama's youth manifesto campaign commitments included reducing data costs and deploying free Wi-Fi in all schools and selected public places. Sufficient September 2026 evidence has not been found to establish nationwide completion across all public schools. Therefore, this is classified as unverified and not proven fulfilled, deliberately avoiding a hard broken classification pending a comprehensive school-by-school audit.", "hero-freewifi")}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK CASE #10 EVIDENCE</span>
                </button>
              </div>
            </div>

            {/* What Mahama Promised */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>What Mahama Promised (NDC Youth Manifesto &amp; GNA August 2024 Report)</span>
              </span>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Mahama&apos;s youth manifesto campaign commitments included reducing data costs and deploying free Wi-Fi in all schools and selected public places.
              </p>

              <blockquote className="text-base font-serif italic text-white bg-slate-950/90 border-l-4 border-slate-500 p-4 rounded-r-xl leading-relaxed shadow-inner">
                &ldquo;Reduce data costs and deploy free Wi-Fi in all schools and selected public places.&rdquo;
              </blockquote>
            </div>

            {/* Current Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Current Evidence (September 2026 Cutoff)</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  We have not yet found sufficient September 2026 empirical evidence from the Ministry of Communications and Digitalisation or the Ghana Education Service to establish nationwide completion across all basic, second-cycle, and technical schools.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Strict Fact-Checking Rule</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  We are deliberately not putting this into the hard &ldquo;broken&rdquo; category yet without exhaustive multi-school survey data. Therefore: ⚪ <strong>STATUS: UNVERIFIED / NOT PROVEN FULFILLED</strong>.
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <a
                href="https://gna.org.gh/2024/08/ndc-outlines-key-development-policies-for-youth-promises-jobs-empowerment/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read GNA Report on Youth Manifesto Pledges</span>
              </a>
            </div>
          </div>

          {/* Deep Focus Case 11: Revive & Operationalise Komenda Sugar Factory (Gold-Standard 4-Step Evidence Chain) */}
          <div className="bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CASE #11 &bull; 🔴 NOT FULFILLED</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                    GOLD-STANDARD 4-STEP CHAIN
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  11. Revive &amp; Operationalise Komenda Sugar Factory — NOT FULFILLED
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => speakText("Reviving the Komenda Sugar Factory is an exceptional archive item because we have a complete four-step empirical chain: First, the 2024 NDC Manifesto promise to fully operationalise the factory and support sugarcane outgrowers. Second, the August 2024 Onua TV investigative documentary showing the dormant factory and feedstock deficit. Third, on June 27, 2026, President Mahama publicly stated that the government was still in advanced discussions with a prospective investor to restart the dormant factory. Fourth, as of September 4, 2026, the plant remains non-operational with zero commercial domestic sugar production. The outcome is definitively not fulfilled.", "hero-komenda")}
                  className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 SPEAK 4-STEP KOMENDA CHAIN</span>
                </button>
              </div>
            </div>

            {/* 4-Step Chronological Empirical Evidence Stepper */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>The Complete 4-Step Empirical Evidence Chain</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* Step 1: 2024 Campaign Commitment */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                    <span>2024 CAMPAIGN PROMISE</span>
                  </div>
                  <blockquote className="text-[11px] font-serif italic text-slate-200 border-l-2 border-indigo-500 pl-2 leading-relaxed">
                    &ldquo;We will fully operationalise the Komenda Sugar Factory, support sugarcane outgrowers, and ensure Ghana produces its own sugar.&rdquo;
                  </blockquote>
                  <div className="text-[10px] font-mono text-slate-400">
                    NDC Manifesto &bull; Central Region Tour
                  </div>
                </div>

                {/* Step 2: August 2024 TV Investigation */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-red-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-mono font-bold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                    <span>ONUA TV INVESTIGATION</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    August 2024 broadcast documented the dormant state of the plant, raw sugarcane feedstock deficit, and KEEA community appeals.
                  </p>
                  <div className="text-[10px] font-mono text-red-400">
                    YouTube: 96pKx449IUg &bull; hWRXSekkzbw
                  </div>
                </div>

                {/* Step 3: June 2026 Presidential Statement */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                    <span>JUNE 2026 PRESIDENTIAL ADMISSION</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    On June 27, 2026, Mahama admitted government was <em>&ldquo;still in advanced discussions with a prospective investor to restart the dormant factory.&rdquo;</em>
                  </p>
                  <div className="text-[10px] font-mono text-amber-400">
                    MyJoyOnline Fact-Check Record
                  </div>
                </div>

                {/* Step 4: September 2026 Ground Truth Status */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-mono font-bold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">4</span>
                    <span>GROUND TRUTH STATUS</span>
                  </div>
                  <p className="text-[11px] text-rose-200 font-semibold leading-snug">
                    🔴 NOT FULFILLED. Plant remains non-operational with zero commercial sugar refining from local cane.
                  </p>
                  <div className="text-[10px] font-mono text-rose-400 font-bold">
                    Cutoff: September 4, 2026
                  </div>
                </div>
              </div>
            </div>

            {/* In-Depth Evidentiary Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Why Investor Discussions &ne; Factory Revival</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Engaging in &ldquo;advanced discussions with a prospective investor&rdquo; is preliminary administrative negotiation. The empirical benchmark is continuous, commercial domestic sugar refining supplying the Ghanaian market from local sugarcane plantations. The President&apos;s own June 2026 statement directly confirms that the facility was still dormant.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Defunct SOE Revival Audit Standard</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Similar to Zuarungu Meat Factory, Pwalugu Tomato Factory, and Wulugu Livestock Station, administrative pre-revival assessments and transaction adviser recruitment do not satisfy a specific pledge to operationalise a factory. 
                </p>
              </div>
            </div>

            {/* Video & News Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://www.youtube.com/watch?v=96pKx449IUg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Candidate Komenda Address (YouTube: 96pKx449IUg)</span>
                </a>

                <a
                  href="https://www.youtube.com/watch?v=hWRXSekkzbw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Onua TV Documentary (YouTube: hWRXSekkzbw)</span>
                </a>
              </div>

              <a
                href="https://www.myjoyonline.com/government-in-talks-with-investor-to-restart-komenda-sugar-factory-mahama/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Read MyJoyOnline June 27, 2026 Report</span>
              </a>
            </div>
          </div>

          {/* Grid of Other Unfulfilled Promises */}
          <div className="space-y-4 pt-4">
            <h4 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Other Verified Unfulfilled Commitments (Evidence Cutoff: Sept 4, 2026)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unfulfilledList.filter(p => !['m24-gov-30women', 'm24-gov-exgratia', 'm24-edu-doubletrack', 'm24-edu-ruralallow', 'm24-wom-bank', 'm24-sec-purge', 'm24-soe-restructure', 'm24-hea-dialysis', 'm24-edu-bedforall', 'm24-dig-wifi', 'm24-ind-komenda-sugar'].includes(p.id)).map((p, idx) => (
                <div key={p.id} className="bg-slate-950 border border-rose-900/40 hover:border-rose-500/60 rounded-xl p-5 space-y-4 transition-all shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10.5px] font-mono font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>#{idx + 12} &bull; 🔴 NOT FULFILLED</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{p.deadlineType}</span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {p.title}
                  </h4>

                  {/* Verbatim quote */}
                  <blockquote className="text-xs font-serif italic text-slate-200 pl-2.5 border-l-2 border-rose-500 bg-slate-900/60 p-2 rounded-r-lg">
                    &ldquo;{p.campaignEvidence.quote}&rdquo;
                  </blockquote>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div>
                      <strong className="text-amber-400 font-mono">What Happened:</strong> {p.whatActuallyHappened}
                    </div>
                    <div>
                      <strong className="text-cyan-400 font-mono">Why Put Here:</strong> {p.whyCategorizedHere}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 truncate max-w-xs">{p.independentFactCheck}</span>
                    <button
                      onClick={() => {
                        setSelectedPromise(p);
                        setActiveTab('all-manifesto');
                      }}
                      className="text-rose-400 hover:text-rose-200 flex items-center gap-1 font-bold"
                    >
                      <span>Full Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── 2. FACEBOOK & BROADCASTER VIDEO EVIDENCE VAULT ── */}
      {activeTab === 'fb-videos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Description & Search */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>PRIMARY VIDEO EVIDENCE ARCHIVE</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Direct Facebook Speeches, Broadcaster Streams & Town Halls
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Facebook & Broadcaster Video Proof Registry
                </h3>
              </div>

              {/* Quick Multi-Keyword Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Quick Filters:</span>
                {['24-Hour', 'No-Fee Stress', '30% Women', 'Ex-Gratia', 'Double-Track', '1M Coders', 'Women Bank', 'Rural Teachers', 'NDC Online Gh', 'Joyce Bawah Mogtari', 'Top Reports', '24HourPlus / Assent', 'GEPA / Kwahu Forum', 'Volta Corridor'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFbSearchQuery(tag)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            
            {/* Primary Digital Evidence Authority Matrix */}
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Primary Digital Evidence Authority Matrix (What Each Source Establishes)</span>
                </span>
                <span className="text-slate-400 text-[11px]">Strict Evidentiary Standards</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Evidence Source &amp; Artifact</th>
                      <th className="py-2.5 px-3">What It Can Establish</th>
                      <th className="py-2.5 px-3 text-right">Direct Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-sans text-xs">
                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>NDC Online Gh — 2024 campaign posts</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Contemporary NDC campaign messaging and campaign activity.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/ndc-online-gh-75125529a_on-monday-august-5-2024-the-youth-women-activity-7225472805176258560-8J5n"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Dispatch</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>Joyce Bawah Mogtari — 2024 campaign-team post</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Campaign-period statements from a senior Mahama/NDC communications figure.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/joyce-bawah-mogtari-174217210_as-i-reflect-on-the-journey-that-has-brought-activity-7209517476781420544-VUZQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Statement</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>LinkedIn discussion of Mahama&apos;s 24-Hour Economy (Top Reports / GIPC)</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Contemporary documentation of how the 24-hour economy was described as a campaign policy.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/top-reports-communications_gipc-topreports-topguide2024-activity-7321110748099665920-50aT"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Analysis</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>24-Hour Economy Authority LinkedIn page (24HourPlus)</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Post-election evidence that Mahama signed the 24-Hour Economy Bill into law.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/24hourplus_24houreconomyauthority-ghana-activity-7430218444735909889-s1K1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Assent Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Ghana Export Promotion Authority (GEPA) LinkedIn</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Current implementation evidence and Mahama&apos;s explanation of incentives under 24H+.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/ghana-export-promotion-authority_kwahubusinessforum-24houreconomy-exportghanaexportmore-activity-7446279337919676416-OiNv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View GEPA Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>Volta Economic Corridor (24HourPlus #GhanaAtWork)</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Regional industrial corridor deployment of 24H+ (3-shift agro-processing &amp; cross-border logistics).
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/24hourplus_24hplus-ghanaatwork-voltaeconomiccorridor-activity-7349065877838860288-uLuM"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Corridor</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <span>24-Hour Economy Authority Official Dispatch</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Government&apos;s description of the programme&apos;s implementation and launch.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href="https://www.linkedin.com/posts/24hourplus_24houreconomyauthority-ghana-activity-7430218444735909889-s1K1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-200 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>View Launch Data</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fbSearchQuery}
                  onChange={(e) => setFbSearchQuery(e.target.value)}
                  placeholder="Search Facebook videos by promise, candidate account (@JDMahama), station (@citi973), keyword, or caption..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                />
                {fbSearchQuery && (
                  <button
                    onClick={() => setFbSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={selectedFbPageType}
                onChange={(e) => setSelectedFbPageType(e.target.value)}
                className="w-full sm:w-64 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="ALL">All Page Sources</option>
                <option value="Candidate Official">Mahama Official (@JDMahama)</option>
                <option value="Party Page">NDC Pages (@NDCGhanaOfficial)</option>
                <option value="Major Broadcaster">Major Broadcasters (Citi/Joy/TV3/Peace)</option>
              </select>
            </div>
          </div>

          {/* Master Video Table & Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Video Evidence Table (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Showing {filteredFbVideos.length} Verified Video Records</span>
                <span>Click row to inspect proof</span>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-[850px] overflow-y-auto scrollbar-thin">
                {filteredFbVideos.map((video) => {
                  const isSelected = selectedFbVideo?.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => setSelectedFbVideo(video)}
                      className={`p-4 transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-blue-950/40 border-l-4 border-l-blue-500 bg-slate-850'
                          : 'hover:bg-slate-850/60 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Video className="w-3 h-3 text-blue-400" />
                            <span>{video.facebookPageHandle}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {video.videoPostDate}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-300">
                          {video.statusBadge}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {video.promiseTitle}
                      </h4>

                      <p className="text-xs text-slate-300 italic font-serif line-clamp-2">
                        &ldquo;{video.exactClaim}&rdquo;
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                        <span className="text-indigo-400 truncate max-w-xs font-medium">
                          {video.facebookPageName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>{video.duration}</span>
                          <span className="text-slate-500">{video.viewsOrReach}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Video Inspection & External Link Card (5 cols) */}
            <div className="lg:col-span-5">
              {selectedFbVideo ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-6">
                  
                  {/* Header */}
                  <div className="space-y-2 pb-4 border-b border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Video className="w-3.5 h-3.5" />
                        <span>{selectedFbVideo.facebookPageHandle}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedFbVideo.videoPostDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {selectedFbVideo.promiseTitle}
                    </h3>

                    <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                      <span>Source: <strong>{selectedFbVideo.facebookPageName}</strong></span>
                      <span className="text-blue-300">{selectedFbVideo.originalOrSecondary}</span>
                    </div>
                  </div>

                  {/* Verbatim Claim Box with Audio TTS */}
                  <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-300 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Exact Video Speech Excerpt</span>
                      </span>
                      <button
                        onClick={() => speakText(selectedFbVideo.exactClaim, `fb-${selectedFbVideo.id}`)}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>

                    <blockquote className="text-xs italic font-serif text-slate-200 leading-relaxed pl-2.5 border-l-2 border-indigo-500">
                      &ldquo;{selectedFbVideo.exactClaim}&rdquo;
                    </blockquote>
                  </div>

                  {/* Facebook Post Caption */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <span className="text-[10.5px] font-mono uppercase text-slate-500 font-bold block">
                      Facebook Post Caption & Metadata:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedFbVideo.postCaption}
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Duration: {selectedFbVideo.duration}</span>
                      <span className="text-emerald-400 font-semibold">{selectedFbVideo.viewsOrReach}</span>
                    </div>
                  </div>

                  {/* Multi-Keyword Tag Cloud */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Indexed Keyword Synonyms:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedFbVideo.keywords.map(kw => (
                        <span key={kw} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Direct Watch on Facebook Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={selectedFbVideo.facebookVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all font-mono"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>WATCH OFFICIAL VIDEO ON FACEBOOK</span>
                    </a>

                    <p className="text-[10px] text-center text-slate-500 font-mono">
                      Verified direct link to Facebook video broadcast stream
                    </p>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  Select a video record on the left to view the complete speech transcript and Facebook playback link.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── 3. ALL MANIFESTO PROMISES REGISTRY VIEW ── */}
      {activeTab === 'all-manifesto' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search & Filters */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promises, quotes, Facebook handles, fact-checks..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Category:</span>
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {PROMISE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <span className="text-xs text-slate-400 font-mono ml-2">Status:</span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="KEPT">🟢 Fulfilled / Kept</option>
                <option value="PARTIALLY_KEPT">🟡 Partially Fulfilled</option>
                <option value="IN_PROGRESS">🔵 In Progress</option>
                <option value="DELAYED">🟠 Delayed / Extended</option>
                <option value="UNFULFILLED">🔴 Unfulfilled</option>
              </select>
            </div>
          </div>

          {/* Master 2-Column Layout: Left List + Right Deep Forensic Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Promise Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-3 max-h-[950px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span>Showing {filteredPromises.length} promises</span>
                <span>Click to inspect forensic docket</span>
              </div>

              {filteredPromises.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                  No promises found matching &ldquo;{searchQuery}&rdquo;. Try another filter or search term.
                </div>
              ) : (
                filteredPromises.map((p) => {
                  const badge = getRatingBadge(p.rating);
                  const isSelected = selectedPromise?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPromise(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.bg}`}>
                          {badge.icon}
                          <span>{badge.badgeText}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {p.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                        {p.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        &ldquo;{p.verbatimCommitment}&rdquo;
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                        <span className="flex items-center gap-1 text-indigo-300">
                          {p.mediaArtifact.stationType === 'TV' ? <Tv className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                          <span>{p.mediaArtifact.stationName}</span>
                        </span>
                        <span className="text-slate-500">{p.deadlineType}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Deep Forensic Evidence Dossier (7 cols) */}
            <div className="lg:col-span-7">
              {selectedPromise ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-6">
                  
                  {/* Dossier Header */}
                  <div className="space-y-3 pb-5 border-b border-slate-800">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className={`text-xs font-mono font-black px-3 py-1 rounded-md border flex items-center gap-1.5 shadow-sm ${getRatingBadge(selectedPromise.rating).bg}`}>
                        {getRatingBadge(selectedPromise.rating).icon}
                        <span>{getRatingBadge(selectedPromise.rating).badgeText}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                          {selectedPromise.category} &bull; {selectedPromise.subcategory}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                      {selectedPromise.title}
                    </h3>

                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <span className="text-indigo-400 font-bold">Source Document:</span>
                      <span>{selectedPromise.sourceDocument}</span>
                    </div>
                  </div>

                  {/* Verbatim Campaign Quote Box with Audio Button */}
                  <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>VERBATIM CAMPAIGN COMMITMENT & SPEECH</span>
                      </div>

                      <button
                        onClick={() => speakText(selectedPromise.campaignEvidence.quote, `quote-${selectedPromise.id}`)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          speakingTextId === `quote-${selectedPromise.id}`
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingTextId === `quote-${selectedPromise.id}` ? 'PLAYING...' : '🔊 SPEAK QUOTE ALOUD'}</span>
                      </button>
                    </div>

                    <blockquote className="text-sm font-serif italic text-slate-200 leading-relaxed pl-2 border-l-2 border-indigo-500 mb-3">
                      &ldquo;{selectedPromise.campaignEvidence.quote}&rdquo;
                    </blockquote>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-slate-500 block">Speaker:</span>
                        <span className="text-slate-200 font-semibold">{selectedPromise.campaignEvidence.speaker}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Date:</span>
                        <span className="text-slate-200">{selectedPromise.campaignEvidence.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Location:</span>
                        <span className="text-slate-200">{selectedPromise.campaignEvidence.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Event:</span>
                        <span className="text-slate-200 truncate">{selectedPromise.campaignEvidence.event}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fact-Checking Core: What Happened vs Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* What Actually Happened */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                        <Activity className="w-3.5 h-3.5" />
                        <span>WHAT ACTUALLY HAPPENED</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedPromise.whatActuallyHappened}
                      </p>
                    </div>

                    {/* Implementation Evidence */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>PRIMARY EVIDENCE & AUDIT</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedPromise.implementationEvidence}
                      </p>
                    </div>
                  </div>

                  {/* Why Categorized Here (Nuance & Rationale Box) */}
                  <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        <span>WHY CATEGORIZED HERE (NUANCE & FAIRNESS AUDIT)</span>
                      </div>
                      <button
                        onClick={() => speakText(selectedPromise.whyCategorizedHere, `why-${selectedPromise.id}`)}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Read Nuance</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedPromise.whyCategorizedHere}
                    </p>
                  </div>

                  {/* Primary Sources Cited */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-mono">
                    <span className="text-slate-500">Independent Fact-Check:</span>
                    <span className="text-indigo-300 font-semibold">{selectedPromise.independentFactCheck}</span>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  Select any promise from the list on the left to view the complete forensic evidence docket.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── 4. 120-DAY SOCIAL CONTRACT VIEW ── */}
      {activeTab === '120-day' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="max-w-4xl space-y-2 mb-6">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                GhanaFact Verified Baseline (25 Substantive Commitments)
              </span>
              <h3 className="text-xl font-black text-white">
                The 120-Day Social Contract Audit (Evaluated to September 4, 2026)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The 120-Day Social Contract contained self-imposed deadlines for the first four months of the administration. While early fact-checks evaluated outcomes at Day 120, this tracker records what actually occurred through September 2026, updating delayed versus fulfilled statuses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAHAMA_2024_PROMISES.filter(p => p.sourceDocument.includes('120-Day') || p.category === '120-DAY' || p.category === 'GOVERNANCE' || p.category === 'TAXES').map((p) => {
                const badge = getRatingBadge(p.rating);
                return (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                        {badge.badgeText}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {p.selfImposedDeadline}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {p.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-3">
                      {p.whatActuallyHappened}
                    </p>

                    <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                      <span>Source: {p.independentFactCheck.split('&')[0]}</span>
                      <button
                        onClick={() => {
                          setSelectedPromise(p);
                          setActiveTab('all-manifesto');
                        }}
                        className="text-indigo-400 hover:text-indigo-200 flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. 24-HOUR ECONOMY VIEW ── */}
      {activeTab === '24-hour' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="max-w-4xl space-y-2">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                Macroeconomic Transformation Blueprint
              </span>
              <h3 className="text-xl font-black text-white">
                The 24-Hour Economy Structural Policy Audit
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The flagship 24-Hour Economy was structured with an initial 120-day legal preparation phase, followed by multi-year sector rollout across manufacturing, agro-processing, transport, and ports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono font-bold">
                  01
                </div>
                <h4 className="text-base font-bold text-white">3-Shift System & Off-Peak Tariffs</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Legislation provides tiered electricity tariff rebates between 10:00 PM and 6:00 AM for certified manufacturing and agro-processing plants operating 3 consecutive 8-hour shifts.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Status: 🔵 Operational at Tema Port & Pilot Zones
                </div>
              </div>

              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono font-bold">
                  02
                </div>
                <h4 className="text-base font-bold text-white">24-Hour Economy Authority Act 2026</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Statutory body enacted by Parliament to administer tax holidays, import duty waivers for nighttime machinery, and expedited one-stop clearances.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Status: 🟢 Act Enacted by Parliament
                </div>
              </div>

              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono font-bold">
                  03
                </div>
                <h4 className="text-base font-bold text-white">Night Security & Transport Grid</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Integration of dedicated Ghana Police night patrols, smart streetlighting corridors, and expanded Metro Mass Transit bus schedules on industrial routes.
                </p>
                <div className="text-[11px] font-mono text-amber-400 font-semibold">
                  Status: 🟠 Phased Rollout in Greater Accra & Ashanti
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. FORENSIC AUDITS VIEW (18 DEALS) ── */}
      {activeTab === 'audits' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="max-w-4xl space-y-2">
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                Anti-Corruption & Asset Recovery Tracking
              </span>
              <h3 className="text-xl font-black text-white">
                Forensic Audits Lifecycle (18 High-Profile Deals & Scandals)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tracking the 18 specific deals pledged for investigation under the 120-Day Social Contract. Evaluates whether investigations opened, auditors were appointed, reports published, funds recovered, or prosecutions initiated.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Deal / Matter</th>
                    <th className="py-3 px-2 text-center">Inv. Opened</th>
                    <th className="py-3 px-2 text-center">Auditor Appt.</th>
                    <th className="py-3 px-2 text-center">Report Done</th>
                    <th className="py-3 px-2 text-center">Published</th>
                    <th className="py-3 px-2 text-center">Prosecution</th>
                    <th className="py-3 px-3">Funds Recovered</th>
                    <th className="py-3 px-4">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {FORENSIC_AUDITS_LIFECYCLE.map((deal, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        {deal.dealName}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {deal.investigationOpened ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {deal.auditorAppointed ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {deal.reportProduced ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {deal.reportPublished ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✕</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {deal.prosecutionsInitiated ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-bold">
                        {deal.fundsRecovered}
                      </td>
                      <td className="py-3 px-4 text-xs font-sans text-slate-300">
                        <span className="font-semibold text-indigo-300 block">{deal.status}</span>
                        <span className="text-[11px] text-slate-500">{deal.summary}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. SOE TURNAROUND VIEW ── */}
      {activeTab === 'soe-matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="max-w-4xl space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                State Interests and Governance Authority (SIGA) Financial Review
              </span>
              <h3 className="text-xl font-black text-white">
                SOE Performance & Deficit Turnaround Matrix (2024 - 2026)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The campaign promised to shake up loss-making State-Owned Enterprises and set them on a path toward profitability. SIGA 2025 and 2026 State Ownership Reports demonstrate persistent operational deficits in key utilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SOE_PERFORMANCE_MATRIX.map((soe, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white">{soe.soe}</h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {soe.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>2024 Position:</span>
                      <span className="text-rose-400 font-semibold">{soe.pos2024}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>2025 Position:</span>
                      <span className="text-amber-400 font-semibold">{soe.pos2025}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>2026 Position:</span>
                      <span className="text-cyan-400 font-semibold">{soe.pos2026}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 flex items-center justify-between">
                    <span className="text-slate-500 font-mono">Trajectory:</span>
                    <span className="text-indigo-300 font-bold font-mono">{soe.trajectory}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. 2025 SONA REGISTRY VIEW ── */}
      {activeTab === 'sona-2025' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="max-w-4xl space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                GhanaFact 42-Promise Benchmark
              </span>
              <h3 className="text-xl font-black text-white">
                2025 State of the Nation Address (SONA) Distinct Registry
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                GhanaFact tracked 42 distinct policy commitments made during the 2025 State of the Nation Address. Kept separate from 2024 campaign manifesto pledges to maintain strict methodological fidelity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white font-mono">{SONA_2025_REGISTRY.totalPromises}</div>
                <div className="text-xs font-mono text-slate-400 uppercase mt-1">Total SONA Promises</div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-400 font-mono">{SONA_2025_REGISTRY.kept}</div>
                <div className="text-xs font-mono text-emerald-300 uppercase mt-1">Fulfilled / Kept (57.1%)</div>
              </div>
              <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400 font-mono">{SONA_2025_REGISTRY.inProgress}</div>
                <div className="text-xs font-mono text-blue-300 uppercase mt-1">In Progress (33.3%)</div>
              </div>
              <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-rose-400 font-mono">{SONA_2025_REGISTRY.broken}</div>
                <div className="text-xs font-mono text-rose-300 uppercase mt-1">Unfulfilled (9.5%)</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono">
              <strong>Assessment Note:</strong> {SONA_2025_REGISTRY.summary} (Verified {SONA_2025_REGISTRY.assessmentDate}).
            </div>
          </div>
        </div>
      )}

      {/* ── 9. MASTER 4-PILLAR SOURCE MATRIX & FIRST-CLASS LINKEDIN VAULT ── */}
      {activeTab === 'source-matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner: 4-Pillar Non-Partisan Empirical Architecture */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-cyan-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Database className="w-3.5 h-3.5" />
                    <span>MASTER 4-PILLAR SOURCE MATRIX</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                    LINKEDIN TREATED AS FIRST-CLASS SOURCE CATEGORY
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-bold ml-auto">
                    EVIDENCE CUTOFF: SEPTEMBER 4, 2026
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  The Complete Chain of Custody Evidence Matrix
                </h3>
              </div>
            </div>

            <p className="text-xs lg:text-sm text-slate-300 max-w-5xl leading-relaxed">
              Our audit framework exceeds standard political commentary by tracing every single promise through the complete four-phase evidence lifecycle: <strong className="text-rose-300">Campaign Declarations (X)</strong> &rarr; <strong className="text-amber-300">Broadcast Streams</strong> &rarr; <strong className="text-blue-300">Government Implementation Telemetry (Y)</strong> &rarr; <strong className="text-emerald-300">Independent Statutory Proof (Z)</strong>. LinkedIn is treated as a full, verifiable first-class primary evidence repository.
            </p>
          </div>

          {/* ── PRIMARY CAMPAIGN PHOTOGRAPHIC EVIDENCE SHOWCASE ── */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-indigo-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PILLAR 1 PRIMARY CAMPAIGN PHOTOGRAPHIC ARTIFACT</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    WINNEBA LAUNCH &bull; AUGUST 24, 2024
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  Official 2024 NDC Manifesto Launch &amp; Braille Edition Unveiling
                </h3>
              </div>
              <div className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-lg border border-indigo-800">
                Venue: J.A. Mensah Auditorium, UEW, Winneba
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Photo Display Container */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl group bg-slate-950">
                  <img
                    src="/images/truth-platform/mahama-2024-manifesto-launch-winneba.jpg"
                    alt="John Dramani Mahama holding the 2024 Manifesto Braille Version and Standard Booklet at Winneba Manifesto Launch with Jane Naana Opoku-Agyemang and Asiedu Nketiah"
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-indigo-500/30 text-[11px] text-slate-300 font-sans">
                    <p className="font-semibold text-white">
                      <strong>Visual Chain of Custody:</strong> H.E. John Dramani Mahama holding the <em>Braille Highlights Edition</em> (right hand) and <em>Main Manifesto Booklet</em> (left hand) alongside Running Mate Prof. Jane Naana Opoku-Agyemang and NDC Chairman Johnson Asiedu Nketiah.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>📸 Official NDC Campaign Photograph</span>
                  <span className="text-cyan-400 font-bold">UEW Winneba &bull; Aug 24, 2024</span>
                </div>
              </div>

              {/* Evidentiary Details & Document Breakdown */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Physical Documents Displayed by Candidate</span>
                  </h4>

                  <div className="space-y-2.5">
                    {MANIFESTO_LAUNCH_ARTIFACT.physicalDocuments.map((doc, idx) => (
                      <div key={idx} className="bg-slate-900/90 border border-indigo-900/40 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white">{doc.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {doc.type}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400">
                          Held By: <strong>{doc.heldBy}</strong>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {doc.significance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Leadership Principals */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Campaign Ticket &amp; Party Leadership Present</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {MANIFESTO_LAUNCH_ARTIFACT.principals.map((principal, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1">
                        <div className="font-bold text-white text-[11.5px] leading-tight">{principal.name}</div>
                        <div className="text-[9.5px] font-mono text-indigo-300">{principal.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What This Establishes in the Three-Tier Standard */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-1.5">
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Evidentiary Significance in Chain of Custody</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {MANIFESTO_LAUNCH_ARTIFACT.whatItEstablishes}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Master 4-Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MASTER_SOURCE_MATRIX.map(pillar => (
              <div key={pillar.id} className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 transition-all shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Database className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-black text-white text-base">{pillar.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400">{pillar.badge}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{pillar.sources.length} Verified Outlets</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {pillar.description}
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                  {pillar.sources.map((src, idx) => (
                    <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 space-y-1 hover:bg-slate-900 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{src.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {src.verifiedProofType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                        <span className="text-slate-500 truncate max-w-[200px]">{src.handleOrUrl}</span>
                        <span className="text-slate-400 text-right">{src.coverageScope}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── DEDICATED FIRST-CLASS LINKEDIN PRIMARY EVIDENCE VAULT ── */}
          <div className="bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-black uppercase flex items-center gap-1.5 shadow-md">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LINKEDIN VERIFIED PRIMARY DISPATCH VAULT</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    6 FIRST-CLASS VERIFIED DISPATCHES
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">
                  Verified Post-by-Post LinkedIn Evidence Vault
                </h3>
              </div>

              <div className="text-xs font-mono text-blue-300">
                Direct Permanent URLs &bull; No Secondary Paraphrasing
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LINKEDIN_EVIDENCE_REGISTRY.map(item => (
                <div key={item.id} className="bg-slate-950 border border-blue-900/40 hover:border-blue-500/60 rounded-xl p-5 space-y-3.5 transition-all shadow-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                        {item.lifecycleStage}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{item.postDate}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm leading-snug">
                      {item.headline}
                    </h4>

                    <div className="text-[11px] font-mono text-cyan-300">
                      <strong>Author:</strong> {item.entityName} <span className="text-slate-400">({item.roleOrDesignation})</span>
                    </div>

                    <blockquote className="text-xs font-serif italic text-slate-300 bg-slate-900/90 border-l-2 border-blue-500 p-2.5 rounded-r-lg">
                      &ldquo;{item.keyQuoteOrSummary}&rdquo;
                    </blockquote>

                    <div className="space-y-1 text-xs text-slate-300">
                      <strong className="text-amber-400 font-mono text-[11px]">What It Establishes:</strong>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {item.whatItEstablishes}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {item.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[9.5px] font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900">
                    <a
                      href={item.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <span>View Verified LinkedIn Post</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}


    </div>
  );
}
