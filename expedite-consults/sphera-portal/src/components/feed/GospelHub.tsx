"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  GospelVerse,
  PrayerRequestItem,
  GospelMediaItem,
  dailyVerses,
  initialPrayerRequests,
  initialGospelMedia,
  feedStore,
} from "@/lib/feed-store";

interface GospelHubProps {
  onShareToFeed?: (verseText: string, verseRef: string) => void;
}

export function GospelHub({ onShareToFeed }: GospelHubProps) {
  const [activeTab, setActiveTab] = useState<"devotional" | "prayers" | "promises" | "media">("devotional");
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

  const currentVerse = dailyVerses[selectedVerseIndex] || dailyVerses[0];

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

  const filteredPrayers = prayers.filter((pr) => {
    if (selectedPrayerCategory !== "All" && pr.category !== selectedPrayerCategory) return false;
    if (searchQuery.trim() && !pr.title.toLowerCase().includes(searchQuery.toLowerCase()) && !pr.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
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
    <div className="w-full bg-black text-white min-h-screen">
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
                Daily Scriptures, Inter-Collegiate Prayer Wall, Devotionals & Sacred Worship
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

        {/* 4-Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar border-t border-white/5 pt-4">
          {[
            { id: "devotional", label: "Verse & Devotional", icon: BookOpen },
            { id: "prayers", label: "Prayer Wall", icon: Heart },
            { id: "promises", label: "Scripture Finder", icon: Sparkles },
            { id: "media", label: "Worship & Audio", icon: Headphones },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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

              {/* Scripture Text */}
              <blockquote className="text-xl sm:text-2xl font-serif leading-relaxed text-neutral-100 italic">
                “{currentVerse.text}”
              </blockquote>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                <div className="text-base font-bold text-amber-400 tracking-wide font-sans">
                  — {currentVerse.reference} ({currentVerse.translation})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(currentVerse)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedId === currentVerse.id ? "Copied!" : "Share to Feed"}</span>
                  </button>
                </div>
              </div>

              {/* Commentary & Reflection */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Devotional Commentary
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {currentVerse.commentary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Personal Reflection
                  </h4>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {currentVerse.reflectionQuestion}
                  </p>
                </div>
              </div>

              {/* Verse Selector Carousel */}
              <div className="mt-6 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs text-neutral-500 font-medium mr-2 whitespace-nowrap">Explore Verses:</span>
                {dailyVerses.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVerseIndex(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedVerseIndex === idx
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {v.book} ({v.tags[0]})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Prayer Wall */}
        {activeTab === "prayers" && (
          <div className="space-y-6">
            {/* Category Filter + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {["All", "Academics", "Healing", "Guidance", "Peace", "Family"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPrayerCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedPrayerCategory === cat
                        ? "bg-amber-400 text-black"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search prayer requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 bg-neutral-900 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Prayer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="rounded-2xl border border-white/10 bg-neutral-900/70 p-5 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prayer.authorAvatar}
                          alt={prayer.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {prayer.authorName}
                          </h4>
                          <span className="text-[10px] text-neutral-400">
                            @{prayer.authorUsername} · {prayer.timeAgo}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {prayer.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-100 mt-2">
                      {prayer.title}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                      {prayer.details}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      onClick={() => handlePray(prayer.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        prayer.hasPrayed
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${prayer.hasPrayed ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span>{prayer.hasPrayed ? "Prayed" : "I'm Praying"} ({prayer.prayedCount})</span>
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

        {/* TAB 3: Scripture Promises Finder */}
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
                      Share
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Worship & Audio */}
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
