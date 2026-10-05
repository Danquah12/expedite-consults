"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Plus,
  Flame,
  CheckCircle2,
  Send,
  MessageCircle,
  Headphones,
  Music,
  Radio,
  Bookmark,
  Search,
  Cross,
  Sun,
  Shield,
  Layers,
  Award,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Sliders,
  FileText,
  Copy,
  Check,
  Activity,
  Waveform,
} from "lucide-react";
import {
  GospelVerse,
  PrayerRequestItem,
  GospelMediaItem,
  GospelMusicTrack,
  GospelRadioStation,
  dailyVerses,
  initialPrayerRequests,
  initialGospelMedia,
  initialGospelMusic,
  initialGospelRadios,
  feedStore,
} from "@/lib/feed-store";

interface GospelHubProps {
  onShareToFeed?: (verseText: string, verseRef: string) => void;
  initialSubTab?: "devotional" | "music" | "prayers" | "promises" | "media";
}

// Chord progression frequencies for continuous ambient worship music
const WORSHIP_CHORDS = [
  // C Maj9
  [130.81, 196.0, 246.94, 261.63, 329.63, 392.0, 493.88],
  // G Maj
  [98.0, 146.83, 196.0, 246.94, 293.66, 392.0],
  // A min7
  [110.0, 164.81, 220.0, 261.63, 329.63, 392.0],
  // F Maj7
  [87.31, 130.81, 174.61, 220.0, 261.63, 329.63],
];

export function GospelHub({ onShareToFeed, initialSubTab = "devotional" }: GospelHubProps) {
  const [activeTab, setActiveTab] = useState<"devotional" | "music" | "prayers" | "promises" | "media">(initialSubTab);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [prayers, setPrayers] = useState<PrayerRequestItem[]>(initialPrayerRequests);
  const [selectedPrayerCategory, setSelectedPrayerCategory] = useState<string>("All");
  const [isPrayerFormOpen, setIsPrayerFormOpen] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState("");
  const [newPrayerDetails, setNewPrayerDetails] = useState("");
  const [newPrayerCategory, setNewPrayerCategory] = useState<PrayerRequestItem["category"]>("General");
  const [selectedTopic, setSelectedTopic] = useState<string>("Peace");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gospel Music State
  const [musicList, setMusicList] = useState<GospelMusicTrack[]>(initialGospelMusic);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [musicSearch, setMusicSearch] = useState("");
  const [lyricsModalTrack, setLyricsModalTrack] = useState<GospelMusicTrack | null>(null);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(296);
  const [activeRadio, setActiveRadio] = useState<GospelRadioStation | null>(null);
  const [audioMode, setAudioMode] = useState<"STREAM" | "SYNTH_WORSHIP">("SYNTH_WORSHIP");

  // Audio References
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ masterGain: GainNode; filter: BiquadFilterNode } | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chordStepRef = useRef(0);

  const currentVerse = dailyVerses[selectedVerseIndex] || dailyVerses[0];
  const currentTrack = musicList[currentTrackIndex] || musicList[0];

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Initialize HTML Audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = volume / 100;
      
      audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        }
      });
      
      audio.addEventListener("loadedmetadata", () => {
        if (!isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("ended", () => {
        handleNextTrack();
      });

      audio.addEventListener("error", () => {
        // Fallback to synthetic worship engine if remote URL fails or CORS prevents loading
        console.info("Switching to continuous Web Audio worship synthesizer engine");
        setAudioMode("SYNTH_WORSHIP");
        startSyntheticWorshipPad();
      });

      htmlAudioRef.current = audio;
    }

    return () => {
      stopSyntheticWorshipPad();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.src = "";
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = isMuted ? 0 : volume / 100;
    }
    if (synthNodesRef.current) {
      synthNodesRef.current.masterGain.gain.setValueAtTime(
        isMuted ? 0 : (volume / 100) * 0.2,
        audioContextRef.current ? audioContextRef.current.currentTime : 0
      );
    }
  }, [volume, isMuted]);

  // Continuous Polyphonic Web Audio Worship Pad Engine
  const startSyntheticWorshipPad = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create Master Chain
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      masterGain.gain.setValueAtTime((volume / 100) * 0.18, ctx.currentTime);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      synthNodesRef.current = { masterGain, filter };

      const playChord = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
        const currentCtx = audioContextRef.current;
        const freqs = WORSHIP_CHORDS[chordStepRef.current % WORSHIP_CHORDS.length];
        chordStepRef.current += 1;

        freqs.forEach((freq, idx) => {
          const osc = currentCtx.createOscillator();
          const noteGain = currentCtx.createGain();
          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, currentCtx.currentTime);

          // Gentle ambient envelope
          noteGain.gain.setValueAtTime(0.001, currentCtx.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.04 / (idx + 1), currentCtx.currentTime + 1.2);
          noteGain.gain.exponentialRampToValueAtTime(0.0005, currentCtx.currentTime + 4.8);

          osc.connect(noteGain);
          noteGain.connect(filter);
          osc.start(currentCtx.currentTime);
          osc.stop(currentCtx.currentTime + 5.0);
        });
      };

      playChord();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      synthTimerRef.current = setInterval(() => {
        playChord();
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 4));
      }, 4000);
    } catch (e) {
      console.warn("Web Audio engine note:", e);
    }
  };

  const stopSyntheticWorshipPad = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  // Toggle Music Playback
  const handleToggleMusic = (trackIndex?: number) => {
    const targetIdx = trackIndex !== undefined ? trackIndex : currentTrackIndex;
    const track = musicList[targetIdx];

    if (trackIndex !== undefined && trackIndex !== currentTrackIndex) {
      setCurrentTrackIndex(targetIdx);
      setCurrentTime(0);
      setIsMusicPlaying(true);
      playTrack(track);
      return;
    }

    if (isMusicPlaying) {
      setIsMusicPlaying(false);
      if (htmlAudioRef.current) htmlAudioRef.current.pause();
      stopSyntheticWorshipPad();
    } else {
      setIsMusicPlaying(true);
      playTrack(track);
    }
  };

  const playTrack = (track: GospelMusicTrack) => {
    if (track.audioUrl && htmlAudioRef.current) {
      try {
        htmlAudioRef.current.src = track.audioUrl;
        htmlAudioRef.current.play().then(() => {
          setAudioMode("STREAM");
          stopSyntheticWorshipPad();
        }).catch((err) => {
          console.warn("Stream playback deferred to synth pad:", err);
          setAudioMode("SYNTH_WORSHIP");
          startSyntheticWorshipPad();
        });
      } catch (e) {
        setAudioMode("SYNTH_WORSHIP");
        startSyntheticWorshipPad();
      }
    } else {
      setAudioMode("SYNTH_WORSHIP");
      startSyntheticWorshipPad();
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % musicList.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    if (isMusicPlaying) {
      playTrack(musicList[nextIdx]);
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + musicList.length) % musicList.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    if (isMusicPlaying) {
      playTrack(musicList[prevIdx]);
    }
  };

  const handlePlayRadio = (station: GospelRadioStation) => {
    setActiveRadio(station);
    setIsMusicPlaying(true);
    startSyntheticWorshipPad();
  };

  // Web Speech API for Scripture reading
  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${currentVerse.reference}. ${currentVerse.text}. Reflection: ${currentVerse.commentary}`
      );
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handlePray = (id: string) => {
    const res = feedStore.togglePray(id);
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayedCount: res.prayedCount, hasPrayed: res.hasPrayed } : p))
    );
  };

  const handleShareTrack = (track: GospelMusicTrack) => {
    if (onShareToFeed) {
      onShareToFeed(
        `Listening to "${track.title}" by ${track.artist} 🎵✝️ "${track.lyricsPreview}"`,
        track.scriptureAnchor || "Gospel Worship Studio"
      );
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const filteredMusic = musicList.filter((track) => {
    const matchGenre = selectedGenre === "All" || track.genre === selectedGenre;
    const matchQ =
      musicSearch === "" ||
      track.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
      track.artist.toLowerCase().includes(musicSearch.toLowerCase()) ||
      track.album.toLowerCase().includes(musicSearch.toLowerCase());
    return matchGenre && matchQ;
  });

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* GOSPEL NAVIGATION SUB-MENU TABS */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-xl overflow-x-auto no-scrollbar shadow-xl">
        {[
          { id: "devotional", label: "Daily Devotional", icon: BookOpen },
          { id: "music", label: "Gospel Music & Radio", icon: Music },
          { id: "prayers", label: "Prayer Requests", icon: Heart },
          { id: "promises", label: "Scripture Promises", icon: Sun },
          { id: "media", label: "Sermons & Media", icon: Headphones },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-black scale-100"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-amber-400"}`} />
              <span>{tab.label}</span>
              {tab.id === "music" && isMusicPlaying && (
                <span className="w-2 h-2 rounded-full bg-black animate-ping ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOSPEL MUSIC & 24/7 PRAISE RADIO */}
      {activeTab === "music" && (
        <div className="space-y-6 animate-fadeIn">
          {/* INTERACTIVE WORSHIP PLAYER CARD */}
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
              {/* Album Art with Waveform Equalizer */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 group">
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isMusicPlaying ? "scale-105" : "scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Animated Equalizer Bars */}
                {isMusicPlaying && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1.5 h-10 bg-black/70 backdrop-blur-md rounded-xl p-2 border border-white/10">
                    {[14, 28, 18, 36, 24, 32, 16, 30, 20, 34, 22, 26].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-amber-400 rounded-full animate-pulse"
                        style={{
                          height: `${(h * (Math.sin(currentTime + i) + 1.2)) % 32 + 6}px`,
                          animationDelay: `${i * 90}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black shadow-md">
                  {currentTrack.genre}
                </span>

                {isMusicPlaying && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-500 text-black flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    PLAYING
                  </span>
                )}
              </div>

              {/* Track Details & Controls */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Music className="w-4 h-4" />
                      Sphera Gospel Worship Studio
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {currentTrack.plays} plays
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {currentTrack.title}
                  </h2>
                  <p className="text-sm text-neutral-300 font-medium">
                    {currentTrack.artist} &middot; <span className="text-neutral-400">{currentTrack.album}</span>
                  </p>
                  {currentTrack.scriptureAnchor && (
                    <p className="text-xs text-amber-400/90 font-serif italic mt-1 flex items-center gap-1.5">
                      <Cross className="w-3.5 h-3.5 text-amber-400" />
                      Scripture Anchor: {currentTrack.scriptureAnchor}
                    </p>
                  )}
                </div>

                {/* Seek Bar & Progress */}
                <div className="space-y-1.5">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      const newTime = clickPos * duration;
                      setCurrentTime(newTime);
                      if (htmlAudioRef.current) htmlAudioRef.current.currentTime = newTime;
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-full h-2 overflow-hidden cursor-pointer transition-colors"
                  >
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-amber-400/80 font-sans text-[10px]">
                      {audioMode === "SYNTH_WORSHIP" ? "🎹 Continuous Praise Pad Engine" : "🎵 High-Fidelity Audio Stream"}
                    </span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Playback Controls & Volume */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevTrack}
                      className="p-2.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                      title="Previous Track"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleToggleMusic()}
                      className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 transition-all active:scale-95"
                      title={isMusicPlaying ? "Pause" : "Play"}
                    >
                      {isMusicPlaying ? (
                        <Pause className="w-6 h-6 fill-black" />
                      ) : (
                        <Play className="w-6 h-6 fill-black ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleNextTrack}
                      className="p-2.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                      title="Next Track"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    {/* Volume Slider */}
                    <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-neutral-400 hover:text-white"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-20 accent-amber-400 h-1 bg-white/20 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLyricsModalTrack(currentTrack)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-200 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Lyrics</span>
                    </button>

                    <button
                      onClick={() => handleShareTrack(currentTrack)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share to Feed</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GENRE FILTER TABS & SEARCH */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  "All",
                  "Praise & Worship",
                  "Contemporary Gospel",
                  "Afro-Gospel",
                  "Prayer & Soaking",
                  "Hymns & Choral",
                ].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedGenre === genre
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search gospel songs, artists..."
                  value={musicSearch}
                  onChange={(e) => setMusicSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* TRACKS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMusic.map((track, idx) => {
                const isSelected = currentTrackIndex === musicList.findIndex((m) => m.id === track.id);
                const isTrackActive = isSelected && isMusicPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleToggleMusic(musicList.findIndex((m) => m.id === track.id))}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                        : "bg-neutral-900/80 border-white/5 hover:border-white/20 hover:bg-neutral-900"
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={track.albumArt}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isTrackActive ? (
                          <Pause className="w-5 h-5 text-amber-400 fill-amber-400" />
                        ) : (
                          <Play className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? "text-amber-300" : "text-white"}`}>
                          {track.title}
                        </h4>
                        <span className="text-[11px] text-neutral-400 font-mono">{track.duration}</span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                      <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 inline-block">
                        {track.genre}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24/7 PRAISE RADIO STATIONS */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              24/7 Live Gospel Radio Stations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {initialGospelRadios.map((radio) => {
                const isRadioActive = activeRadio?.id === radio.id && isMusicPlaying;
                return (
                  <div
                    key={radio.id}
                    onClick={() => handlePlayRadio(radio)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                      isRadioActive
                        ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10"
                        : "bg-neutral-900 border-white/10 hover:border-amber-400/40 hover:bg-neutral-900/90"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">{radio.listeners} tuning in</span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {radio.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{radio.tagline}</p>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500 truncate">{radio.currentProgram}</span>
                      <button className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-[10px] font-bold text-neutral-200 transition-colors flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        Listen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY DEVOTIONAL */}
      {activeTab === "devotional" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-900 to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentVerse.theme}
                </span>
                <span className="text-xs text-neutral-400 font-mono">Today's Scripture</span>
              </div>

              <blockquote className="text-lg sm:text-xl font-serif leading-relaxed text-neutral-100 italic border-l-2 border-amber-400 pl-4 py-1">
                "{currentVerse.text}"
              </blockquote>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-sm font-bold text-amber-400">{currentVerse.reference}</h4>
                  <p className="text-xs text-neutral-400">{currentVerse.translation} Translation</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAudio}
                    className={`p-2.5 rounded-full transition-all flex items-center gap-1.5 text-xs font-bold ${
                      isPlayingAudio
                        ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title="Listen to Scripture"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isPlayingAudio ? "Reading..." : "Listen"}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onShareToFeed) onShareToFeed(currentVerse.text, currentVerse.reference);
                    }}
                    className="p-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Post Verse</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2 mt-4">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Spiritual Reflection</h5>
                <p className="text-xs text-neutral-300 leading-relaxed">{currentVerse.commentary}</p>
                <p className="text-xs text-neutral-400 italic pt-1">
                  💭 {currentVerse.reflectionQuestion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRAYER REQUESTS */}
      {activeTab === "prayers" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Community Prayer Wall
            </h3>
            <button
              onClick={() => setIsPrayerFormOpen(!isPrayerFormOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Request
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {prayers.map((prayer) => (
              <div
                key={prayer.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{prayer.authorName}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{prayer.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-amber-300">{prayer.title}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">{prayer.details}</p>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-neutral-400">
                    {prayer.category}
                  </span>
                  <button
                    onClick={() => handlePray(prayer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      prayer.hasPrayed
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-white/10 hover:bg-white/20 text-neutral-300"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${prayer.hasPrayed ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{prayer.prayedCount} Prayed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCRIPTURE PROMISES */}
      {activeTab === "promises" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dailyVerses.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-neutral-900/80 border border-white/5 hover:border-amber-400/30 transition-all space-y-2"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{v.theme}</span>
                <p className="text-xs text-neutral-200 italic font-serif">"{v.text}"</p>
                <div className="pt-1 flex items-center justify-between text-xs font-bold text-neutral-400">
                  <span>{v.reference}</span>
                  <button
                    onClick={() => {
                      if (onShareToFeed) onShareToFeed(v.text, v.reference);
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SERMONS & MEDIA */}
      {activeTab === "media" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {initialGospelMedia.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-amber-400/40 transition-all space-y-2"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {m.duration}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{m.title}</h4>
                <p className="text-[11px] text-neutral-400 truncate">{m.artistOrSpeaker}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LYRICS MODAL */}
      {lyricsModalTrack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">{lyricsModalTrack.title}</h3>
                <p className="text-xs text-neutral-400">{lyricsModalTrack.artist}</p>
              </div>
              <button
                onClick={() => setLyricsModalTrack(null)}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="py-2 space-y-3 font-serif text-sm text-neutral-300 leading-relaxed max-h-72 overflow-y-auto">
              {lyricsModalTrack.lyricsPreview.split(" / ").map((line, idx) => (
                <p key={idx} className="italic">{line}</p>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLyricsModalTrack(null)}
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300"
              >
                Close Lyrics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
