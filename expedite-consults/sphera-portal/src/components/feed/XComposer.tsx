"use client";

import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Video,
  BarChart2,
  Smile,
  BookOpen,
  Calendar,
  Globe,
  Sparkles,
  X,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { FeedPost, ScriptureReference, dailyVerses, feedStore } from "@/lib/feed-store";

interface XComposerProps {
  onPostCreated: (post: FeedPost) => void;
  currentUser?: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  placeholder?: string;
  defaultCategory?: "general" | "gospel" | "campus" | "tech";
  isGospelMode?: boolean;
}

export function XComposer({
  onPostCreated,
  currentUser = {
    name: "Kwesi Asiedu",
    username: "kwesi",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  placeholder,
  defaultCategory = "general",
  isGospelMode = false,
}: XComposerProps) {
  const effectivePlaceholder = placeholder || (isGospelMode ? "Share a scripture, prayer, or word of faith..." : "What is happening?!");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"general" | "gospel" | "campus" | "tech">(isGospelMode ? "gospel" : defaultCategory);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showScripturePicker, setShowScripturePicker] = useState(false);
  const [selectedScripture, setSelectedScripture] = useState<ScriptureReference | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const maxChars = 280;
  const remainingChars = maxChars - content.length;
  const charPercent = Math.min(100, (content.length / maxChars) * 100);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setVideoUrl("");
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setImageUrl("");
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handlePollOptionChange = (idx: number, val: string) => {
    const next = [...pollOptions];
    next[idx] = val;
    setPollOptions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !videoUrl && !selectedScripture) return;

    setIsSubmitting(true);

    try {
      const postCategory = selectedScripture ? "gospel" : category;
      const matchedTags = content.match(/#[a-z0-9_]+/gi);
      const hashtags: string[] = matchedTags ? [...matchedTags] : [];
      if (postCategory === "gospel" && !hashtags.some(h => h.toLowerCase().includes("gospel"))) {
        hashtags.push("#GospelMenu");
      }

      const postType = showPollBuilder
        ? "poll"
        : selectedScripture
        ? "gospel_scripture"
        : videoUrl
        ? "immersive_video"
        : "standard";

      const newPost = feedStore.addPost({
        type: postType,
        category: postCategory,
        author: {
          id: `u-${currentUser.username}`,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          verified: true,
          badgeType: postCategory === "gospel" ? "gospel" : "blue",
          timeAgo: "Just now",
          privacy: "Public",
        },
        content: content.trim(),
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        scripture: selectedScripture || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        poll: showPollBuilder && pollQuestion.trim()
          ? {
              id: `poll-${Date.now()}`,
              question: pollQuestion.trim(),
              options: pollOptions.filter(o => o.trim()).map((o, idx) => ({
                id: `opt-${idx}`,
                text: o.trim(),
                votes: 0,
              })),
              totalVotes: 0,
              expiresIn: "24 hours left",
            }
          : undefined,
      });

      onPostCreated(newPost);

      // Reset
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setShowPollBuilder(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setSelectedScripture(null);
      setIsFocused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-neutral-800 p-4 sm:p-5 bg-black">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/10 flex-shrink-0"
        />

        {/* Form Body */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            {/* Category Pill Bar */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar">
              {[
                { id: "general", label: "Everyone", icon: Globe },
                { id: "gospel", label: "✝️ Gospel & Faith", icon: BookOpen },
                { id: "campus", label: "🎓 Campus Pulse", icon: Sparkles },
                { id: "tech", label: "💻 Tech & Dev", icon: Sparkles },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    category === cat.id
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Expanding Textarea */}
            <textarea
              rows={isFocused || content.length > 0 ? 3 : 2}
              placeholder={effectivePlaceholder}
              value={content}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-white text-base sm:text-lg placeholder-neutral-500 resize-none focus:outline-none leading-relaxed"
            />

            {/* Selected Scripture Attachment Preview */}
            {selectedScripture && (
              <div className="mt-2 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 relative">
                <button
                  type="button"
                  onClick={() => setSelectedScripture(null)}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-white p-1 rounded-full bg-black/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{selectedScripture.reference} ({selectedScripture.translation || "NIV"})</span>
                </div>
                <p className="text-xs font-serif text-neutral-200 italic">
                  "{selectedScripture.text}"
                </p>
              </div>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-2 relative rounded-2xl overflow-hidden border border-white/10 max-h-60">
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
                <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="mt-2 relative rounded-2xl overflow-hidden border border-white/10 max-h-60">
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <video src={videoUrl} controls className="w-full h-full object-cover" />
              </div>
            )}

            {/* Poll Builder Drawer */}
            {showPollBuilder && (
              <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Create a Poll</span>
                  <button
                    type="button"
                    onClick={() => setShowPollBuilder(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel Poll
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                {pollOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Choice ${i + 1}`}
                    value={opt}
                    onChange={(e) => handlePollOptionChange(i, e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add option</span>
                  </button>
                )}
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoFileChange}
              className="hidden"
            />

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
              {/* Media Icon Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 text-amber-400">
                <button
                  type="button"
                  title="Upload Image"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-amber-400/10 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Upload Video"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-amber-400/10 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Create Poll"
                  onClick={() => setShowPollBuilder(!showPollBuilder)}
                  className={`p-2 rounded-full transition-colors ${
                    showPollBuilder ? "bg-amber-400/20 text-amber-300" : "hover:bg-amber-400/10"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Attach Scripture (Gospel Menu)"
                  onClick={() => setShowScripturePicker(!showScripturePicker)}
                  className={`p-2 rounded-full transition-colors ${
                    showScripturePicker || selectedScripture ? "bg-amber-400/20 text-amber-300" : "hover:bg-amber-400/10"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Emoji"
                  onClick={() => setContent((prev) => prev + " 🕊️✨")}
                  className="p-2 rounded-full hover:bg-amber-400/10 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Right Submit & Progress */}
              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold ${remainingChars < 20 ? "text-rose-500" : "text-neutral-500"}`}>
                      {remainingChars}
                    </span>
                    <div className="w-5 h-5 rounded-full border border-neutral-700 relative flex items-center justify-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          remainingChars < 0 ? "bg-rose-500" : "bg-amber-400"
                        }`}
                        style={{ opacity: charPercent / 100 }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={(!content.trim() && !imageUrl && !videoUrl && !selectedScripture) || isSubmitting || remainingChars < 0}
                  className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white text-black font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Scripture Picker Popover */}
          {showScripturePicker && (
            <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Select Scripture to Attach
                </span>
                <button
                  type="button"
                  onClick={() => setShowScripturePicker(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dailyVerses.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedScripture({
                        book: v.book,
                        reference: v.reference,
                        text: v.text,
                        translation: v.translation,
                        theme: v.theme,
                      });
                      setCategory("gospel");
                      setShowScripturePicker(false);
                    }}
                    className="p-2.5 rounded-xl bg-black border border-white/10 hover:border-amber-400/40 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                      {v.reference}
                    </div>
                    <div className="text-[11px] text-neutral-300 line-clamp-1 italic mt-0.5">
                      "{v.text}"
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
