"use client";

import { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  Send,
  Upload,
  Globe,
  Lock,
  Users
} from "lucide-react";

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

export function PostComposerModal({ isOpen, onClose, onPostCreated }: PostComposerModalProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [musicTitle, setMusicTitle] = useState("Afrobeats Synthwave Future Mix Vol. 4");
  const [hashtags, setHashtags] = useState("#SpheraViral #FYP #TechPulse");
  const [visibility, setVisibility] = useState<"Public" | "Followers" | "Only Me">("Public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(type);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !mediaUrl) return;
    setIsSubmitting(true);

    try {
      const parsedHashtags = hashtags
        .split(" ")
        .filter((t) => t.startsWith("#") || t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      const payload = {
        content: content.trim(),
        type: mediaType === "video" ? "immersive_video" : "standard",
        videoUrl: mediaType === "video" ? (mediaUrl || undefined) : undefined,
        imageUrl: mediaType === "image" ? (mediaUrl || undefined) : undefined,
        musicTitle,
        musicAuthor: "Sphera Audio Lab",
        hashtags: parsedHashtags,
        authorName: "Kwesi Asiedu",
        authorUsername: "kwesi",
      };

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onPostCreated(data.post);
      } else {
        onPostCreated({
          ...payload,
          id: `post-${Date.now()}`,
          likes: 0,
          commentsCount: 0,
          sharesCount: 0,
          savesCount: 0,
          author: {
            id: "user-kwesi",
            name: "Kwesi Asiedu",
            username: "kwesi",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            verified: true,
            timeAgo: "Just now",
          },
        });
      }
      onClose();
    } catch (err) {
      console.error("Composer error:", err);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#121318] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                alt="Kwesi"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Create Creator Post</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Sharing to Sphera #FYP</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your update, insight, code snippet, or short to the global feed..."
          rows={4}
          className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
        />

        {/* Media Preview */}
        {mediaUrl && (
          <div className="relative rounded-2xl overflow-hidden max-h-48 bg-black border border-zinc-800">
            {mediaType === "video" ? (
              <video src={mediaUrl} autoPlay loop playsInline className="w-full h-full object-cover max-h-48" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Upload" className="w-full h-full object-cover max-h-48" />
            )}
            <button
              onClick={() => setMediaUrl(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Media / Sound Selector Bar */}
        <div className="grid grid-cols-3 gap-2">
          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer border border-zinc-700/60 transition">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, "image")} />
          </label>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer border border-zinc-700/60 transition">
            <Video className="w-4 h-4 text-rose-500" />
            <span>Video Reel</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, "video")} />
          </label>

          <button
            onClick={() => setHashtags("#SpheraViral #FYP #TechPulse #AI2026")}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-pink-400 text-xs font-bold border border-zinc-700/60 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tags</span>
          </button>
        </div>

        {/* Audio Track */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
            <Music className="w-3 h-3 text-pink-400" />
            <span>Audio Track</span>
          </label>
          <input
            type="text"
            value={musicTitle}
            onChange={(e) => setMusicTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>

        {/* Publish Button */}
        <div className="pt-2 border-t border-zinc-800">
          <button
            onClick={handlePublish}
            disabled={isSubmitting || (!content.trim() && !mediaUrl)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition transform hover:scale-[1.02] disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Publishing to #FYP..." : "Post to SpheraNet"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
