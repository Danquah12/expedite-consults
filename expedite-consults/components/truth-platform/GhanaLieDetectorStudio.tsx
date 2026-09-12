'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GHANA_PRESET_VIDEO_CASES, 
  GhanaVideoPolygraphCase, 
  GhanaVideoTranscriptSegment 
} from '@/lib/truth-platform/ghana-lie-detector-engine';
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
  Check, 
  Flame, 
  ShieldAlert, 
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Video,
  Volume1,
  Headphones
} from 'lucide-react';

export const GhanaLieDetectorStudio: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<GhanaVideoPolygraphCase>(GHANA_PRESET_VIDEO_CASES[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpeakingTTS, setIsSpeakingTTS] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const activeSegment = selectedCase.segments[activeSegmentIndex] || selectedCase.segments[0];

  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTTS(false);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (isMuted || volume === 0) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate;
      utterance.volume = isMuted ? 0 : volume;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-GH') || v.lang.includes('en-US')) || voices[0];
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeakingTTS(true);
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis fallback error:', e);
      setIsSpeakingTTS(false);
    }
  };

  // Helper to trigger OpenAI HD True Human Voice (with browser fallback)
  const speakText = async (text: string) => {
    if (!text || isMuted || volume === 0) return;
    stopAllAudio();
    setIsSpeakingTTS(true);

    try {
      const cacheKey = `onyx-${playbackRate}-${text.slice(0, 300)}`;
      let audioUrl = audioCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: 'onyx',
            speed: playbackRate,
            model: 'tts-1'
          }),
        });

        if (!res.ok) {
          throw new Error('OpenAI TTS API unavailable');
        }

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeakingTTS(false);
      };

      audio.onerror = () => {
        fallbackBrowserSpeech(text);
      };

      await audio.play();
    } catch {
      fallbackBrowserSpeech(text);
    }
  };

  // Helper to play a subtle radio studio acoustic tone
  const playStudioBeep = () => {
    if (typeof window === 'undefined' || isMuted || volume === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioCtx not ready
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playStudioBeep();
      if (activeSegment?.spokenText) {
        speakText(activeSegment.spokenText);
      }

      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= selectedCase.durationSeconds) {
            setIsPlaying(false);
            stopAllAudio();
            return 0;
          }
          const foundIdx = selectedCase.segments.findIndex(
            seg => next >= seg.startTime && next < seg.endTime
          );
          if (foundIdx !== -1 && foundIdx !== activeSegmentIndex) {
            setActiveSegmentIndex(foundIdx);
          }
          return next;
        });
      }, 1000 / playbackRate);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAllAudio();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAllAudio();
    };
  }, [isPlaying, playbackRate, selectedCase]);

  const handleSelectCase = (c: GhanaVideoPolygraphCase) => {
    stopAllAudio();
    setSelectedCase(c);
    setCurrentTime(0);
    setActiveSegmentIndex(0);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      stopAllAudio();
    }
  };

  const handleManualSpeak = () => {
    playStudioBeep();
    speakText(activeSegment.spokenText);
  };

  const getVeracityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (score >= 40) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
  };

  const filteredCases = GHANA_PRESET_VIDEO_CASES.filter(c => {
    const matchesStation = stationFilter === 'ALL' || (c.stationBroadcast?.toLowerCase() || '').includes((stationFilter || '').toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.stationBroadcast.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* ── Top Header Banner: TV & Radio Speech Polygraph ── */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Tv className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>ALL GHANAIAN TV & RADIO BROADCAST SPEECHES POLYGRAPH</span>
              </span>
              <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>REAL SPEECH AUDIO (TTS & ACOUSTIC SYNTHESIS) ACTIVE</span>
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Ghana Political Speech & Broadcast Video Lie Detector
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Forensic video and audio polygraph analyzing verbatim speeches and radio broadcasts across *JoyNews, Citi TV, Peace FM, TV3, UTV, Metro TV, Net2 TV, Adom TV, Asempa FM, and GTV*. Plays speech aloud in real time and cross-examines on-air political assertions against primary court dockets and Auditor-General findings.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-center flex-1 min-w-[120px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Speeches Audited</div>
              <div className="text-2xl font-black text-rose-400 font-mono">{GHANA_PRESET_VIDEO_CASES.length} Cases</div>
              <div className="text-[9px] text-slate-500">2008 – 2026 Archive</div>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-center flex-1 min-w-[120px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Audio Output</div>
              <div className="text-2xl font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <span>{(volume * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[9px] text-slate-500">{isMuted ? 'Muted' : 'Audio Active'}</div>
            </div>
          </div>
        </div>

        {/* Station Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speech title, politician, station (Peace FM, JoyNews, Citi TV, TV3)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {['ALL', 'JoyNews', 'Citi', 'Peace FM', 'TV3', 'Metro', 'Net2', 'Adom', 'Angel', 'GTV'].map(st => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  stationFilter === st
                    ? 'bg-rose-500 text-white font-black shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Case Preset Selection Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {filteredCases.map(c => {
          const isSelected = selectedCase.id === c.id;
          const badgeClass = getVeracityColor(c.overallVeracityScore);
          return (
            <button
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-950 border-rose-500 shadow-lg shadow-rose-500/10' 
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{c.eventDate.split(',')[0]}</span>
                  <span className={`text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded border ${badgeClass}`}>
                    {c.overallVeracityScore}% Truth
                  </span>
                </div>
                <div className="text-xs font-black text-white line-clamp-1">{c.speaker}</div>
                <div className="text-[11px] text-slate-300 line-clamp-2 leading-snug">{c.title}</div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span className="truncate">{c.stationLogo || c.stationBroadcast.split(',')[0]}</span>
                <span className="text-slate-500">{c.durationSeconds}s</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Workstation: Player + Acoustic Polygraph + Timeline Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Speaker & Context Profile (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Speaker Profile</span>
              <span className="text-[10.5px] text-slate-400 font-mono">{selectedCase.eventDate}</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{selectedCase.speaker}</h3>
              <p className="text-xs text-rose-400 font-mono font-semibold">{selectedCase.speakerTitle}</p>
            </div>

            <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Broadcast Stations:</div>
              <div className="text-xs text-cyan-300 font-mono font-bold">{selectedCase.stationBroadcast}</div>
            </div>

            <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Event & Speech Venue:</div>
              <div className="text-xs text-slate-300 leading-relaxed">{selectedCase.eventContext}</div>
            </div>

            <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Democratic Accountability Focus:</div>
              <div className="text-xs text-slate-300 leading-relaxed">{selectedCase.newsRelevance}</div>
            </div>
          </div>

          {/* Overall Veracity Badge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Veracity Rating:</span>
              <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded border ${getVeracityColor(selectedCase.overallVeracityScore)}`}>
                {selectedCase.overallVerdict} ({selectedCase.overallVeracityScore} / 100)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  selectedCase.overallVeracityScore >= 80 ? 'bg-emerald-400' :
                  selectedCase.overallVeracityScore >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${selectedCase.overallVeracityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Audio/Video Player & Real-Time Polygraph Analyzer (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          
          {/* Player Controls Header with Volume Slider */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>BROADCAST MASTER AUDIO</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedCase.stationLogo || 'TV & Radio Master Audio'}</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">{selectedCase.title}</h3>
            </div>

            {/* Play/Pause & Audio Volume Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Volume & Mute Controls */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    if (isMuted && val > 0) setIsMuted(false);
                  }}
                  className="w-16 accent-cyan-400 cursor-pointer"
                  title={`Volume: ${(volume * 100).toFixed(0)}%`}
                />
              </div>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  setActiveSegmentIndex(0);
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg"
                title="Reset to 0s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`px-4 py-2 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-2 shadow-lg ${
                  isPlaying 
                    ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400' 
                    : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'PAUSE SPEECH' : '▶ PLAY AUDIO SPEECH'}</span>
              </button>

              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="0.75">0.75x</option>
                <option value="1">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
          </div>

          {/* Timeline Scrubber Bar */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Broadcast Playback Position:</span>
              </span>
              <span className="text-cyan-400 font-bold">{currentTime}s / {selectedCase.durationSeconds}s</span>
            </div>

            <input
              type="range"
              min={0}
              max={selectedCase.durationSeconds}
              value={currentTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCurrentTime(val);
                const foundIdx = selectedCase.segments.findIndex(
                  seg => val >= seg.startTime && val < seg.endTime
                );
                if (foundIdx !== -1) {
                  setActiveSegmentIndex(foundIdx);
                  if (isPlaying) {
                    speakText(selectedCase.segments[foundIdx].spokenText);
                  }
                }
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Active Spoken Sentence & Verbatim Audio Transcript with Direct TTS Button */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Verbatim Spoken Statement ({activeSegment.timestampDisplay}):</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSpeak}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 transition-all"
                  title="Speak this quote aloud via browser audio"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingTTS ? 'text-emerald-400 animate-ping' : 'text-cyan-400'}`} />
                  <span>{isSpeakingTTS ? 'SPEAKING ALOUD...' : '🔊 SPEAK QUOTE ALOUD'}</span>
                </button>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getVeracityColor(activeSegment.veracityScore)}`}>
                  {activeSegment.verdict} ({activeSegment.veracityScore}% Truth)
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-100 font-mono leading-relaxed italic border-l-4 border-l-rose-500 shadow-inner">
              "{activeSegment.spokenText}"
            </div>
          </div>

          {/* Acoustic & Linguistic Polygraph Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Evasion / Pivot Index</div>
              <div className="text-xl font-black text-rose-400 font-mono">{activeSegment.evasionIndex}%</div>
              <div className="text-[9px] text-slate-500">Dodging Question Metric</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Hedging / Ambiguity</div>
              <div className="text-xl font-black text-amber-400 font-mono">{activeSegment.hedgingIndex}%</div>
              <div className="text-[9px] text-slate-500">Non-committal phrasing</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Anomaly Classification</div>
              <div className="text-xs font-black text-cyan-400 font-mono truncate">{activeSegment.anomalyType?.replace('_', ' ') || 'STATISTICAL ERROR'}</div>
              <div className="text-[9px] text-slate-500">NLP Pattern Type</div>
            </div>
          </div>

          {/* Official Primary Docket Refutation */}
          <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Statutory Ground Truth & Official Docket Refutation:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{activeSegment.docketProof.sourceType}</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {activeSegment.explanation}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
              <span className="text-slate-400 font-bold">Citation: {activeSegment.docketProof.officialSource}</span>
              <span className="text-cyan-300">{activeSegment.docketProof.verifiedFact}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
