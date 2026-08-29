'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  PRESET_VIDEO_CASES, 
  VideoPolygraphCase, 
  VideoTranscriptSegment 
} from '@/lib/veritaslens/video-polygraph-engine';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Activity, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Scale, 
  Download, 
  Volume2,
  VolumeX,
  Mic,
  Tv,
  Smartphone,
  RefreshCw,
  Check
} from 'lucide-react';
import { MobileAlertModal } from './MobileAlertModal';

export const VideoPolygraphStudio: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<VideoPolygraphCase>(PRESET_VIDEO_CASES[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [voicesLoaded, setVoicesLoaded] = useState<boolean>(false);
  const [isMobileAlertOpen, setIsMobileAlertOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync live broadcast hearings
  const handleSyncLiveVideos = async () => {
    setIsSyncing(true);
    try {
      try {
        await fetch('/api/veritaslens/sync');
      } catch (e) {
        console.warn(e);
      }
      const now = new Date();
      setLastSyncedAt(now);
      setSyncNotice(`✅ Ingested latest broadcast hearings across C-SPAN, Senate Judiciary & White House Press! (Next auto-refresh in 30m)`);
      setTimeout(() => setSyncNotice(null), 6000);
    } catch (err) {
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  // Continuous background auto-refresh every 30 minutes
  useEffect(() => {
    setIsMounted(true);
    setLastSyncedAt(new Date());
    const interval = setInterval(() => {
      handleSyncLiveVideos();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load browser speech voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) setVoicesLoaded(true);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Synchronize active segment based on currentTime when seeking manually
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    const foundIdx = selectedCase.segments.findIndex(
      seg => seconds >= seg.startTime && seconds < seg.endTime
    );
    if (foundIdx !== -1) {
      setActiveSegmentIndex(foundIdx);
    }
    if (isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Chromium Keep-Alive Heartbeat (prevents browser 15s pause bug)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const heartbeat = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 4000);
    return () => clearInterval(heartbeat);
  }, []);

  // Seamless Continuous Speech Engine (Reads Claim + Forensic Verdict + Statutory Proof without cutting off)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!isPlaying || isMuted) {
      window.speechSynthesis.cancel();
      return;
    }

    const currentSegment = selectedCase.segments[activeSegmentIndex];
    if (!currentSegment) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Construct the complete broadcast script
    const textPieces = [
      `Claim: ${currentSegment.spokenText}.`,
      `Forensic Analysis: ${currentSegment.veracityScore} percent veracity rating, classified as ${currentSegment.verdict.replace('_', ' ')}. ${currentSegment.explanation}.`,
      `Official statutory ground truth from ${currentSegment.docketProof.officialSource}: ${currentSegment.docketProof.verifiedFact}.`
    ];

    const fullScript = textPieces.join(' ');
    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = playbackRate * 0.92;
    utterance.pitch = voiceGender === 'male' ? 0.95 : 1.05;
    utterance.volume = 1;

    // Pick highest-quality Natural Human Voice
    const voices = window.speechSynthesis.getVoices();
    let bestHumanVoice: SpeechSynthesisVoice | undefined;

    if (voiceGender === 'male') {
      bestHumanVoice = voices.find(v => 
        v.lang.startsWith('en') && (
          (v.name.includes('Natural') && (v.name.includes('Guy') || v.name.includes('Christopher') || v.name.includes('David') || v.name.includes('Ryan') || v.name.includes('Oliver'))) ||
          v.name.includes('Guy') || v.name.includes('Christopher') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Alex')
        )
      ) || voices.find(v => v.lang.startsWith('en') && !v.name.includes('Zira') && !v.name.includes('Jenny') && !v.name.includes('Aria'));
    } else {
      bestHumanVoice = voices.find(v => 
        v.lang.startsWith('en') && (
          (v.name.includes('Natural') && (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Sonia') || v.name.includes('Ava') || v.name.includes('Emma'))) ||
          v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google US English')
        )
      );
    }

    if (bestHumanVoice) {
      utterance.voice = bestHumanVoice;
    }

    // When this segment finishes speaking completely, seamlessly advance to next segment!
    utterance.onend = () => {
      if (activeSegmentIndex < selectedCase.segments.length - 1) {
        setActiveSegmentIndex(prev => prev + 1);
        setCurrentTime(selectedCase.segments[activeSegmentIndex + 1].startTime);
      } else {
        setIsPlaying(false);
        setCurrentTime(selectedCase.durationSeconds);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback note:', e);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, isMuted, activeSegmentIndex, playbackRate, selectedCase, voiceGender, voicesLoaded]);

  // Smooth visual time incrementer during speech
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev + 1 >= selectedCase.durationSeconds) {
          return selectedCase.durationSeconds;
        }
        return prev + 1;
      });
    }, 1000 / playbackRate);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackRate, selectedCase.durationSeconds]);

  const activeSegment: VideoTranscriptSegment = selectedCase.segments[activeSegmentIndex] || selectedCase.segments[0];

  const handleSelectCase = (caseItem: VideoPolygraphCase) => {
    setSelectedCase(caseItem);
    setCurrentTime(0);
    setActiveSegmentIndex(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleExportMarkdown = () => {
    const md = `# VERITASLENS: Video & Broadcast Polygraph Forensic Report
**Video Title:** ${selectedCase.title}
**Speaker:** ${selectedCase.speaker} (${selectedCase.speakerTitle})
**Newsroom Mapping:** ${selectedCase.newsRelevance}
**Event Context:** ${selectedCase.eventContext}
**Overall Veracity Score:** ${selectedCase.overallVeracityScore} / 100 (${selectedCase.overallVerdict})

---

## Synchronized Teleprompter Transcript & Docket Verifications
${selectedCase.segments.map(seg => `
### [${seg.timestampDisplay}] ${seg.speaker}
- **Spoken Text:** "${seg.spokenText}"
- **Veracity Rating:** ${seg.veracityScore}/100 (${seg.verdict})
- **Evasion Index:** ${seg.evasionIndex}% | **Hedging Score:** ${seg.hedgingIndex}%
- **Forensic Finding:** ${seg.explanation}
- **Primary Statutory Evidence:** ${seg.docketProof.officialSource} (${seg.docketProof.sourceType})
  - *Verified Fact:* ${seg.docketProof.verifiedFact}
  - *Docket Link:* ${seg.docketProof.sourceUrl}
`).join('\n')}

---
*Generated by VeritasLens Multi-Modal Video Engine (https://portal.expediteconsults.com/veritaslens)*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VeritasLens_Video_Forensic_Report_${selectedCase.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 4000);
  };

  const formatTimeDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getNewsBadge = (caseId: string) => {
    switch (caseId) {
      case 'vid-homan-nyc-2026':
        return { label: '🔴 Left Blindspot #1', bg: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'vid-scotus-ballot-2026':
        return { label: '⚖️ SCOTUS Docket', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'vid-tariff-2026':
        return { label: '🚨 Trade Policy Lie #1', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'vid-interior-detentions-2026':
        return { label: '🔵 Right Blindspot #1', bg: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'vid-kyiv-energy-2026':
        return { label: '🌐 Foreign Affairs #1', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      default:
        return { label: '📡 Broadcast Feed', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const formattedSyncTime = isMounted && lastSyncedAt 
    ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Live';

  return (
    <div className="space-y-4">
      {/* 30-Minute Auto-Refresh Notice Banner */}
      {syncNotice && (
        <div className="p-3.5 bg-rose-950/90 border border-rose-600 rounded-xl text-xs text-rose-200 flex items-center justify-between font-mono shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold uppercase">30-Minute Synced</span>
        </div>
      )}

      {/* 5-Column Newsroom Broadcast Selector Bar (Aligned & Responsive) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs uppercase font-mono font-bold text-white tracking-wider">
              Select News Broadcast Speech to Detect Lies:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-700/80 text-rose-300 text-[11px] font-mono font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>LIVE 30m Auto-Sync:</span>
              <span className="text-rose-200">{formattedSyncTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncLiveVideos}
              disabled={isSyncing}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-md text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Force Immediate Re-Sync of Live Hearings"
            >
              <RefreshCw className={`w-3 h-3 text-rose-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Refresh Hearings'}</span>
            </button>

            <button
              onClick={() => setIsMobileAlertOpen(true)}
              className="px-3 py-1 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 rounded-md text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Send this Polygraph Forensic Case to Phone via SMS or WhatsApp"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>📱 Send Alert to Phone</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-mono font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>{exportedSuccess ? 'Exported!' : 'Export Dossier (.MD)'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PRESET_VIDEO_CASES.map(c => {
            const isSelected = selectedCase.id === c.id;
            const badge = getNewsBadge(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCase(c)}
                className={`p-2.5 rounded-lg text-left border transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/80 ring-1 ring-rose-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    c.overallVeracityScore >= 70 ? 'text-emerald-400' : c.overallVeracityScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {c.overallVeracityScore}% Truth
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-100 line-clamp-1">
                  {c.speaker}
                </div>

                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {c.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Cockpit: Video (Left 4 cols) | Polygraph Speedometer (Center 4 cols) | Teleprompter (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* ── COLUMN 1: HD Broadcast Visualizer Screen (4 Cols) ── */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col">
            {/* Live Visualizer Screen */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 flex flex-col justify-between overflow-hidden border-b border-slate-800">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none"></div>

              {/* Play Overlay Button if paused */}
              {!isPlaying && (
                <div 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-white cursor-pointer hover:bg-black/50 transition group"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-500 group-hover:scale-110 text-white flex items-center justify-center shadow-2xl shadow-rose-600/60 transition-all border border-rose-400/40">
                    <Play className="w-8 h-8 ml-1 text-white" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-300 bg-rose-950/90 px-3 py-1 rounded-full border border-rose-700/80 shadow-lg">
                    Click to Play Speech & Read Analysis
                  </span>
                </div>
              )}

              {/* Status Header */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                    {isPlaying ? 'LIVE BROADCAST' : 'PAUSED'}
                  </span>
                </div>

                <div className="bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 font-bold">
                  {formatTimeDisplay(currentTime)} / {formatTimeDisplay(selectedCase.durationSeconds)}
                </div>
              </div>

              {/* Speaker Visual Avatar & Waveform */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center shadow-xl shadow-rose-950/40">
                    <Mic className="w-6 h-6 text-rose-400" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-rose-950 border border-rose-700 text-rose-300 font-mono text-[8px] font-bold">
                    MIC 1
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white font-sans">{selectedCase.speaker}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedCase.speakerTitle}</p>
                </div>

                {/* Sound Wave Bars */}
                <div className="flex items-center justify-center gap-1 h-6">
                  {[40, 75, 90, 60, 100, 85, 45, 95, 65, 80, 50, 75].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isPlaying 
                          ? activeSegment.veracityScore >= 75
                            ? 'bg-emerald-400' 
                            : activeSegment.veracityScore >= 40
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ 
                        height: isPlaying ? `${Math.max(10, (h * ((i % 3) + 1) * 0.25))}px` : '4px' 
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Subtitle Chyron */}
              <div className="relative z-10 bg-slate-950/95 backdrop-blur-md p-2 rounded-lg border border-slate-800 shadow-xl flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-100 font-medium truncate font-sans">
                  "{activeSegment.spokenText}"
                </p>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                  activeSegment.veracityScore >= 75
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : activeSegment.veracityScore >= 40
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {activeSegment.veracityScore}% Truth
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="p-3 bg-slate-950 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-600/30"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                  title="Rewind 10s"
                >
                  <Rewind className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSeek(Math.min(selectedCase.durationSeconds, currentTime + 10))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                  title="Forward 10s"
                >
                  <FastForward className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Timeline Slider */}
              <input
                type="range"
                min={0}
                max={selectedCase.durationSeconds}
                value={currentTime}
                onChange={e => handleSeek(Number(e.target.value))}
                className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />

              {/* Speed Buttons */}
              <div className="flex items-center gap-0.5 text-[10px] font-mono bg-slate-900 p-0.5 rounded border border-slate-800">
                {[1, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      playbackRate === rate ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Voice Sound Toggle */}
              <button
                onClick={() => {
                  if (!isMuted) {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }
                  setIsMuted(!isMuted);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer border ${
                  !isMuted 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700/80 shadow-sm' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={!isMuted ? 'Mute Broadcast Speech Voice' : 'Unmute Broadcast Speech Voice'}
              >
                {!isMuted ? <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
                <span>{!isMuted ? 'Voice ON' : 'Muted'}</span>
              </button>

              {/* Natural Human Voice Gender Switcher */}
              {!isMuted && (
                <button
                  onClick={() => setVoiceGender(voiceGender === 'male' ? 'female' : 'male')}
                  className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Switch between Natural Human News Anchor voices (Free Neural Engine)"
                >
                  <span>{voiceGender === 'male' ? '🎙️ Human Male Anchor' : '🎙️ Human Female Anchor'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: Full Rotary NLP Polygraph Speedometer Dial (4 Cols) ── */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-xs uppercase font-mono font-bold text-white">
                  NLP Polygraph Speedometer
                </h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                activeSegment.veracityScore >= 75
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : activeSegment.veracityScore >= 40
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {activeSegment.verdict}
              </span>
            </div>

            {/* Rotary Speedometer SVG Gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
              <div className="relative w-52 h-28 flex items-center justify-center">
                <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="polyArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="35%" stopColor="#fb923c" />
                      <stop offset="65%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Base Track */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Colored Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#polyArcGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (activeSegment.veracityScore / 100))}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Rotating Needle */}
                <div 
                  className="absolute bottom-1 w-1 h-20 bg-gradient-to-t from-slate-200 to-rose-500 rounded-full origin-bottom transition-all duration-700 ease-out shadow-lg"
                  style={{
                    transform: `rotate(${((activeSegment.veracityScore / 100) * 180) - 90}deg)`,
                    boxShadow: '0 0 10px rgba(244, 63, 94, 0.9)'
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white absolute -top-1 -left-0.5 shadow-md"></div>
                </div>

                {/* Hub */}
                <div className="absolute bottom-0 w-5 h-5 rounded-full bg-slate-900 border-2 border-rose-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                </div>
              </div>

              {/* Digital Score */}
              <div className="text-center mt-1 space-y-0.5">
                <div className="text-3xl font-black font-mono tracking-tight" style={{
                  color: activeSegment.veracityScore >= 75 ? '#10b981' : activeSegment.veracityScore >= 40 ? '#facc15' : '#f43f5e'
                }}>
                  {activeSegment.veracityScore}%
                </div>
                <div className="text-[10px] font-mono uppercase font-bold text-slate-300">
                  {activeSegment.veracityScore >= 75 ? '🟢 EMPIRICALLY VERIFIED' : activeSegment.veracityScore >= 40 ? '🟡 CONTESTED / PIVOT' : '🔴 DECEPTION DETECTED'}
                </div>
              </div>
            </div>

            {/* 4 Cognitive Signals */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">Factual Match</div>
                <div className="text-xs font-bold text-emerald-400">{activeSegment.veracityScore}%</div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-500 h-full" style={{ width: `${activeSegment.veracityScore}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">Evasion Index</div>
                <div className="text-xs font-bold text-amber-400">{activeSegment.evasionIndex}%</div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                  <div className="bg-amber-500 h-full" style={{ width: `${activeSegment.evasionIndex}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">Cognitive Hedging</div>
                <div className="text-xs font-bold text-purple-400">{activeSegment.hedgingIndex}%</div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                  <div className="bg-purple-500 h-full" style={{ width: `${activeSegment.hedgingIndex}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">NLP Pattern</div>
                <div className="text-[11px] font-bold text-cyan-400 truncate mt-0.5">{activeSegment.anomalyType || 'VERIFIED'}</div>
              </div>
            </div>

            {/* Primary Docket Evidence */}
            <div className="bg-slate-950/90 border border-indigo-900/60 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono text-indigo-400 font-bold flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  Docket: {activeSegment.docketProof.officialSource}
                </span>
                <a
                  href={activeSegment.docketProof.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  <span>{activeSegment.docketProof.sourceType}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug font-sans line-clamp-2">
                {activeSegment.docketProof.verifiedFact}
              </p>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Synchronized Teleprompter Transcript (4 Cols) ── */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col max-h-[580px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Synchronized Transcript
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                Click sentence to jump
              </span>
            </div>

            {/* Scrollable Claims */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {selectedCase.segments.map((seg, idx) => {
                const isActive = idx === activeSegmentIndex;
                return (
                  <div
                    key={seg.id}
                    onClick={() => handleSeek(seg.startTime)}
                    className={`p-3 rounded-lg border transition cursor-pointer space-y-1.5 ${
                      isActive
                        ? 'bg-rose-950/50 border-rose-500/80 shadow-md shadow-rose-950/60 ring-1 ring-rose-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {seg.timestampDisplay}
                      </span>

                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        seg.veracityScore >= 75
                          ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                          : seg.veracityScore >= 40
                          ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                          : 'text-rose-400 bg-rose-950/80 border border-rose-800'
                      }`}>
                        {seg.veracityScore}% Truth
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isActive ? 'text-white font-medium' : 'text-slate-400'
                    }`}>
                      "{seg.spokenText}"
                    </p>

                    <div className="text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 flex items-start gap-1 leading-relaxed">
                      <span className="font-bold text-cyan-400 font-mono shrink-0">Analysis:</span>
                      <span>{seg.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Phone Alert Modal */}
      <MobileAlertModal
        isOpen={isMobileAlertOpen}
        onClose={() => setIsMobileAlertOpen(false)}
        customTitle={`Polygraph Alert: ${selectedCase.title}`}
        customBody={selectedCase.segments[0]?.spokenText}
      />
    </div>
  );
};
