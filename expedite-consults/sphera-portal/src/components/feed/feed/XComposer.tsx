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
  const effectivePlaceholder = placeholder || (isGospelMode ? "Share a reflection, encouragement, or scripture..." : "What's on your mind today?");
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
      const hashtags = matchedTags ? matchedTags.map((t) => t.toLowerCase()) : [];

      const newPost = feedStore.createPost({
        author: {
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatarUrl,
          verified: true,
        },
        content: content.trim(),
        category: postCategory,
        isGospel: postCategory === "gospel" || !!selectedScripture,
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
    <div className="border-b border-neutral-800 p-4 sm:p-5 bg-neutral-950/40">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover border border-neutral-700 flex-shrink-0"
        />

        {/* Form Body */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            {/* Category Pill Bar (Clean, Minimalist & Cohesive) */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar">
              {[
                { id: "general", label: "General" },
                { id: "gospel", label: "Faith & Reflection" },
                { id: "campus", label: "Campus" },
                { id: "tech", label: "Technology" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    category === cat.id
                      ? "bg-neutral-800 text-white font-semibold"
                      : "bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Input Text Area */}
            <textarea
              rows={isFocused || content.length > 0 ? 3 : 2}
              placeholder={effectivePlaceholder}
              value={content}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 resize-none focus:outline-none leading-relaxed"
            />

            {/* Selected Scripture Attachment Preview */}
            {selectedScripture && (
              <div className="mt-2 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 relative">
                <button
                  type="button"
                  onClick={() => setSelectedScripture(null)}
                  className="absolute top-2 right-2 text-neutral-400 hover:text-white p-1 rounded-full bg-black/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2 text-neutral-300 text-xs font-semibold mb-1">
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
              <div className="mt-2 relative rounded-xl overflow-hidden border border-neutral-800 max-h-60">
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
              <div className="mt-2 relative rounded-xl overflow-hidden border border-neutral-800 max-h-60">
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
              <div className="mt-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Create a Poll</span>
                  <button
                    type="button"
                    onClick={() => setShowPollBuilder(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                />
                {pollOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handlePollOptionChange(i, e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                  />
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1"
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
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3 mt-3">
              {/* Media Icon Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 text-neutral-400">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Upload Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Upload Video"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowPollBuilder(!showPollBuilder)}
                  className="p-2 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Create Poll"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowScripturePicker(!showScripturePicker)}
                  className="p-2 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Attach Scripture"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>

              {/* Submit & Character Count */}
              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className={`text-xs ${remainingChars < 20 ? "text-red-400" : "text-neutral-500"}`}>
                    {remainingChars}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && !imageUrl && !videoUrl && !selectedScripture)}
                  className="px-4 py-1.5 rounded-full bg-white text-neutral-950 font-semibold text-xs transition-all hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* Scripture Picker Drawer */}
            {showScripturePicker && (
              <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Quick Scripture Attacher</span>
                  <button
                    type="button"
                    onClick={() => setShowScripturePicker(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {dailyVerses.slice(0, 4).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedScripture(v);
                        setShowScripturePicker(false);
                      }}
                      className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-colors"
                    >
                      <p className="text-xs font-semibold text-neutral-200">{v.reference}</p>
                      <p className="text-[11px] text-neutral-400 font-serif line-clamp-1 italic">"{v.text}"</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
