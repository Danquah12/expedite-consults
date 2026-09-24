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
  const [musicList] = useState<GospelMusicTrack[]>(initialGospelMusic);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [musicSearch, setMusicSearch] = useState("");
  const [lyricsModalTrack, setLyricsModalTrack] = useState<GospelMusicTrack | null>(null);
  const [volume, setVolume] = useState(80);
  const [trackProgress, setTrackProgress] = useState(15);
  const [activeRadio, setActiveRadio] = useState<GospelRadioStation | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentVerse = dailyVerses[selectedVerseIndex] || dailyVerses[0];
  const currentTrack = musicList[currentTrackIndex] || musicList[0];

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Clean up audio intervals
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Web Speech API for reading Scripture audio
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

  // Play synthetic worship chord pads using Web Audio API
  const playWorshipChordTone = (freqs: number[] = [261.63, 329.63, 392.0, 523.25]) => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volume / 100) * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 3.6);
      });
    } catch (e) {
      console.warn("Web Audio chord note notice:", e);
    }
  };

  const handleToggleMusic = (trackIndex?: number) => {
    const targetIdx = trackIndex !== undefined ? trackIndex : currentTrackIndex;
    if (trackIndex !== undefined && trackIndex !== currentTrackIndex) {
      setCurrentTrackIndex(targetIdx);
      setIsMusicPlaying(true);
      playWorshipChordTone();
      return;
    }

    if (isMusicPlaying) {
      setIsMusicPlaying(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      setIsMusicPlaying(true);
      playWorshipChordTone();
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        setTrackProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % musicList.length;
    setCurrentTrackIndex(nextIdx);
    setTrackProgress(0);
    if (isMusicPlaying) playWorshipChordTone();
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + musicList.length) % musicList.length;
    setCurrentTrackIndex(prevIdx);
    setTrackProgress(0);
    if (isMusicPlaying) playWorshipChordTone();
  };

  const handlePray = (id: string) => {
    const res = feedStore.togglePray(id);
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayedCount: res.prayedCount, hasPrayed: res.hasPrayed } : p))
    );
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerTitle.trim() || !newPrayerDetails.trim()) return;
    const added = feedStore.addPrayerRequest(newPrayerTitle.trim(), newPrayerDetails.trim(), newPrayerCategory);
    setPrayers((prev) => [added, ...prev]);
    setNewPrayerTitle("");
    setNewPrayerDetails("");
    setIsPrayerFormOpen(false);
  };

  const handleShare = (verse: GospelVerse) => {
    if (onShareToFeed) {
      onShareToFeed(verse.text, verse.reference);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${verse.text}" — ${verse.reference} (#GospelMenu #SpheraNet)`);
      setCopiedId(verse.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShareTrack = (track: GospelMusicTrack) => {
    if (onShareToFeed) {
      onShareToFeed(
        `Now listening to "${track.title}" by ${track.artist} 🎵✨\n\n"${track.lyricsPreview.split('/')[0].trim()}"\nScripture Anchor: ${track.scriptureAnchor || 'Praise & Worship'}`,
        track.scriptureAnchor || "Faith & Worship"
      );
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`🎵 "${track.title}" by ${track.artist} on Sphera Gospel Music (#GospelMusic #SpheraNet)`);
      setCopiedId(track.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredPrayers = prayers.filter((pr) => {
    if (selectedPrayerCategory !== "All" && pr.category !== selectedPrayerCategory) return false;
    if (searchQuery.trim() && !pr.title.toLowerCase().includes(searchQuery.toLowerCase()) && !pr.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredMusic = musicList.filter((track) => {
    if (selectedGenre !== "All" && track.genre !== selectedGenre) return false;
    if (musicSearch.trim()) {
      const q = musicSearch.toLowerCase();
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        (track.scriptureAnchor && track.scriptureAnchor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const topicsData: Record<string, { verses: { ref: string; text: string }[]; summary: string }> = {
    Peace: {
      summary: "Divine rest and freedom from worry in high-stress campus & life seasons.",
      verses: [
        { ref: "John 14:27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." },
        { ref: "Philippians 4:7", text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
        { ref: "Psalm 29:11", text: "The Lord gives strength to his people; the Lord blesses his people with peace." },
      ],
    },
    Strength: {
      summary: "Endurance and resilience when physical or mental fatigue sets in.",
      verses: [
        { ref: "Isaiah 40:29", text: "He gives strength to the weary and increases the power of the weak." },
        { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
        { ref: "2 Timothy 1:7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." },
      ],
    },
    Academics: {
      summary: "Wisdom, focus, and clarity during exams, research, and career applications.",
      verses: [
        { ref: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." },
        { ref: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." },
        { ref: "Proverbs 16:3", text: "Commit to the Lord whatever you do, and he will establish your plans." },
      ],
    },
    Hope: {
      summary: "Assurance for your future and confidence in divine purpose.",
      verses: [
        { ref: "Jeremiah 29:11", text: "'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.'" },
        { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit." },
      ],
    },
    Guidance: {
      summary: "Clarity in decision-making and seeking God's will.",
      verses: [
        { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
        { ref: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." },
      ],
    },
  };

  return (
    <div className="w-full bg-black text-white min-h-screen pb-16">
      {/* Gospel Hub Banner */}
      <div className="relative border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-900/20 p-6 sm:p-8 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black text-2xl font-bold">
              ✝️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Gospel & Faith Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SACRED SPACE
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                Daily Scriptures, Gospel Music, Inter-Collegiate Prayer Wall & Praise Radio
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPrayerFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all duration-200 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post Prayer Request</span>
          </button>
        </div>

        {/* 5-Tab Navigation (Including Gospel Music) */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar border-t border-white/5 pt-4">
          {[
            { id: "devotional", label: "Verse & Devotional", icon: BookOpen },
            {
              id: "music",
              label: "Gospel Music",
              icon: Music,
              isFeatured: true,
              badge: "LIVE PLAYER",
            },
            { id: "prayers", label: "Prayer Wall", icon: Heart },
            { id: "promises", label: "Scripture Finder", icon: Sparkles },
            { id: "media", label: "24/7 Praise Radio", icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                    : tab.isFeatured
                    ? "text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.isFeatured && !isActive ? "text-amber-400" : ""}`} />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {/* TAB 1: Verse & Devotional */}
        {activeTab === "devotional" && (
          <div className="space-y-6">
            {/* Featured Verse Card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-900/90 to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Verse of the Day · {currentVerse.theme}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAudio}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isPlayingAudio
                        ? "bg-amber-400 text-black animate-pulse"
                        : "bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? "Pause Audio" : `Listen (${currentVerse.audioDuration})`}</span>
                  </button>
                </div>
              </div>

              <blockquote className="my-6">
                <p className="text-xl sm:text-2xl font-serif leading-relaxed text-neutral-100 italic">
                  "{currentVerse.text}"
                </p>
                <footer className="mt-4 text-sm font-bold text-amber-400 tracking-wide">
                  — {currentVerse.reference} ({currentVerse.translation})
                </footer>
              </blockquote>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Devotional Commentary
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {currentVerse.commentary}
                  </p>
                </div>

                <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Reflection Prompt
                  </h4>
                  <p className="text-sm text-amber-200">
                    {currentVerse.reflectionQuestion}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {currentVerse.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(currentVerse)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedId === currentVerse.id ? "Copied!" : "Share to Feed"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel of Previous Verses */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Recent Daily Scriptures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dailyVerses.map((verse, index) => (
                  <button
                    key={verse.id}
                    onClick={() => {
                      setSelectedVerseIndex(index);
                      if (isPlayingAudio) window.speechSynthesis.cancel();
                      setIsPlayingAudio(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedVerseIndex === index
                        ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-white/10 bg-neutral-900/60 hover:bg-neutral-900 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-400">
                        {verse.reference}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {verse.theme}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 line-clamp-2 italic">
                      "{verse.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Gospel Music & Worship Studio (THE NEW REQUESTED SUB-MENU) */}
        {activeTab === "music" && (
          <div className="space-y-6">
            {/* Interactive Music Player Card */}
            <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-neutral-900 to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
                {/* Album Art with Equalizer */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 group">
                  <img
                    src={currentTrack.albumArt}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isMusicPlaying ? "scale-105" : "scale-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Animated Waveform Bars */}
                  {isMusicPlaying && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1 h-8 bg-black/60 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
                      {[12, 24, 16, 32, 20, 28, 14, 26, 18, 30].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-amber-400 rounded-full animate-pulse"
                          style={{
                            height: `${(h * (trackProgress % 5 + 1)) % 28 + 4}px`,
                            animationDelay: `${i * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                    {currentTrack.genre}
                  </span>
                </div>

                {/* Track Details & Player Controls */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        Gospel Worship Studio
                      </span>
                      <span className="text-xs text-neutral-400">
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
                      <p className="text-xs text-amber-400/90 font-serif italic mt-1">
                        Scripture Foundation: {currentTrack.scriptureAnchor}
                      </p>
                    )}
                  </div>

                  {/* Seek Bar & Progress */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden cursor-pointer">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${trackProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>0:45</span>
                      <span>{currentTrack.duration}</span>
                    </div>
                  </div>

                  {/* Playback Button Controls */}
                  <div className="flex items-center justify-between gap-4 pt-2">
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
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLyricsModalTrack(currentTrack)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lyrics</span>
                      </button>

                      <button
                        onClick={() => handleShareTrack(currentTrack)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Post with Song</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Genre Filter Tabs & Search */}
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

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search songs, artists, scriptures..."
                    value={musicSearch}
                    onChange={(e) => setMusicSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Gospel Music Tracks Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMusic.map((track, index) => {
                  const isCurrent = currentTrack.id === track.id;
                  const isTrackActive = isCurrent && isMusicPlaying;

                  return (
                    <div
                      key={track.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? "border-amber-400/60 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                          : "border-white/10 bg-neutral-900/70 hover:bg-neutral-900 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleMusic(index)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
                            isTrackActive
                              ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                              : "bg-white/10 text-white group-hover:bg-amber-400 group-hover:text-black"
                          }`}
                        >
                          {isTrackActive ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            {track.title}
                            {track.isFavorite && (
                              <span className="text-amber-400 text-xs">★</span>
                            )}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">
                            {track.artist} &middot; <span className="text-neutral-500">{track.genre}</span>
                          </p>
                          {track.scriptureAnchor && (
                            <p className="text-[10px] text-amber-400/80 truncate font-serif italic">
                              {track.scriptureAnchor}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setLyricsModalTrack(track)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="View Lyrics"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareTrack(track)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-amber-400 transition-colors"
                          title="Share to Feed"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-neutral-500 pl-1">
                          {track.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 24/7 Live Gospel Radio Stations Banner */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/90 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400" />
                    24/7 Live Gospel Praise Stations
                  </h3>
                </div>
                <span className="text-xs text-neutral-400">Live Campus & Global Streams</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {initialGospelRadios.map((radio) => (
                  <div
                    key={radio.id}
                    className="p-4 rounded-2xl bg-black/60 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          LIVE
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {radio.listeners.toLocaleString()} listening
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {radio.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                        {radio.tagline}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveRadio(radio);
                        playWorshipChordTone([220, 277.18, 329.63, 440]);
                        alert(`📻 Now tuned into ${radio.name}`);
                      }}
                      className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Tune In</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Prayer Wall */}
        {activeTab === "prayers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {["All", "Academics", "Healing", "Guidance", "Peace", "Family", "General"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPrayerCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedPrayerCategory === cat
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search prayer requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="p-5 rounded-2xl border border-white/10 bg-neutral-900/80 hover:border-amber-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={prayer.authorAvatar}
                        alt={prayer.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {prayer.authorName}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          @{prayer.authorUsername} &middot; {prayer.timeAgo}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-amber-300 border border-amber-500/20">
                      {prayer.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-neutral-100">
                      {prayer.title}
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {prayer.details}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => handlePray(prayer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        prayer.hasPrayed
                          ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                          : "bg-white/5 text-neutral-300 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      <span>🙏</span>
                      <span>{prayer.hasPrayed ? "Prayed" : "Pray"} ({prayer.prayedCount})</span>
                    </button>

                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {prayer.answersCount} encouragement notes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Scripture Promises Finder */}
        {activeTab === "promises" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {Object.keys(topicsData).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedTopic === topic
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                      : "bg-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold">
                  📖
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Scriptures for {selectedTopic}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {topicsData[selectedTopic]?.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {topicsData[selectedTopic]?.verses.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-400">
                        {v.ref}
                      </span>
                      <p className="text-xs text-neutral-200 font-serif italic">
                        "{v.text}"
                      </p>
                    </div>
                    <button
                      onClick={() => onShareToFeed && onShareToFeed(v.text, v.ref)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-neutral-200 transition-all whitespace-nowrap self-end sm:self-auto"
                    >
                      Share to Feed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 24/7 Praise & Media */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialGospelMedia.map((media) => (
              <div
                key={media.id}
                className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden hover:border-amber-500/30 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={media.thumbnail}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                    {media.duration}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                    {media.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {media.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {media.artistOrSpeaker}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {media.verseRef && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        {media.verseRef}
                      </span>
                    )}
                    <button
                      onClick={() => alert(`Playing: ${media.title}`)}
                      className="flex items-center gap-1 text-xs text-white font-semibold hover:text-amber-400 transition-colors ml-auto"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lyrics Modal */}
      {lyricsModalTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lyricsModalTrack.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {lyricsModalTrack.artist} &middot; {lyricsModalTrack.album}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLyricsModalTrack(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {lyricsModalTrack.scriptureAnchor && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-serif italic">
                  📖 Scripture Anchor: {lyricsModalTrack.scriptureAnchor}
                </div>
              )}

              <div className="space-y-3 font-serif text-sm leading-relaxed text-neutral-200">
                <p className="font-bold text-xs uppercase tracking-wider text-amber-400 font-sans">
                  Chorus / Lyrics Meditation
                </p>
                {lyricsModalTrack.lyricsPreview.split('/').map((line, idx) => (
                  <p key={idx} className="italic">
                    "{line.trim()}"
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-4">
              <button
                type="button"
                onClick={() => handleShareTrack(lyricsModalTrack)}
                className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md shadow-amber-400/20 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Post with Song</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Prayer Modal */}
      {isPrayerFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🙏</span>
                <h3 className="text-base font-bold text-white">Post Prayer Request</h3>
              </div>
              <button
                onClick={() => setIsPrayerFormOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPrayer} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Prayer Title / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterms peace, Family healing, Guidance..."
                  value={newPrayerTitle}
                  onChange={(e) => setNewPrayerTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Academics", "Healing", "Guidance", "Peace", "Family", "General"] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewPrayerCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        newPrayerCategory === cat
                          ? "bg-amber-400 text-black"
                          : "bg-black text-neutral-400 border border-white/10 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Details & Specific Intercession Needs
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your heart and how our collegiate family can stand in faith with you..."
                  value={newPrayerDetails}
                  onChange={(e) => setNewPrayerDetails(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrayerFormOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md shadow-amber-400/20"
                >
                  Submit to Wall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
