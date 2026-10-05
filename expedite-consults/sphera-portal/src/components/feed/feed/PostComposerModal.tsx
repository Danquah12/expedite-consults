"use client";

import { useState, useRef } from "react";
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
  Users,
  Loader2
} from "lucide-react";
import { saveVideoBlob, saveLocalFeedPost } from "@/lib/indexed-db-media";

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
  const selectedFileRef = useRef<File | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      selectedFileRef.current = file;
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(type);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !mediaUrl && !selectedFileRef.current) return;
    setIsSubmitting(true);

    const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let serverMediaUrl = "";

    try {
      const file = selectedFileRef.current;
      if (file) {
        // 1. Save binary Blob to IndexedDB
        await saveVideoBlob(postId, file);

        // 2. Upload to D: drive backend via multipart
        try {
          const formData = new FormData();
          formData.append("file", file, file.name);
          formData.append("id", postId);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
              serverMediaUrl = uploadData.url;
            }
          }
        } catch (uploadErr) {
          console.warn("[Upload notice]:", uploadErr);
        }
      }

      const parsedHashtags = hashtags
        .split(" ")
        .filter((t) => t.startsWith("#") || t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      const payload = {
        id: postId,
        content: content.trim(),
        type: mediaType === "video" ? "immersive_video" : "standard",
        videoUrl: mediaType === "video" ? (serverMediaUrl || (file ? `idb://${postId}` : mediaUrl || undefined)) : undefined,
        imageUrl: mediaType === "image" ? (serverMediaUrl || (file ? `idb://${postId}` : mediaUrl || undefined)) : (serverMediaUrl || (file ? `idb://${postId}` : mediaUrl || undefined)),
        musicTitle,
        musicAuthor: "Sphera Audio Lab",
        hashtags: parsedHashtags,
        authorName: "Kwesi Asiedu",
        authorUsername: "kwesi",
      };

      let createdPost = {
        ...payload,
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        isLiked: true,
        author: {
          id: "user-kwesi",
          name: "Kwesi Asiedu",
          username: "kwesi",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          verified: true,
          timeAgo: "Just now",
        },
      };

      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.post) createdPost = data.post;
        }
      } catch (feedErr) {
        console.warn("[Feed publish notice]:", feedErr);
      }

      // Save local post metadata to IndexedDB
      await saveLocalFeedPost(createdPost);

      onPostCreated(createdPost);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121318] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-black text-white">Create Post</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                alt="Kwesi Asiedu"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500"
              />
              <div>
                <span className="font-black text-sm text-white block">Kwesi Asiedu</span>
                <span className="text-xs text-zinc-500">@kwesi</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-300 font-semibold cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{visibility}</span>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening across the campus or your project? Share your thoughts, code, or ideas..."
            className="w-full h-32 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none"
          />

          {mediaUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-zinc-800 max-h-48 flex items-center justify-center">
              {mediaType === "video" ? (
                <video src={mediaUrl} controls className="max-h-48 object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl} alt="Preview" className="max-h-48 object-contain" />
              )}
              <button
                onClick={() => {
                  setMediaUrl(null);
                  selectedFileRef.current = null;
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-zinc-400">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 transition"
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2">
              <label className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, "image")} />
              </label>

              <label className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition">
                <Video className="w-4 h-4 text-pink-400" />
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, "video")} />
              </label>
            </div>

            <button
              disabled={isSubmitting || (!content.trim() && !mediaUrl)}
              onClick={handlePublish}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-500/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post to Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
