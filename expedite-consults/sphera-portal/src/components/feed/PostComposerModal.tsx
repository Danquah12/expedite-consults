"use client";

import { useState, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  Send,
  Globe,
  Loader2
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

  const blobToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    if (!content.trim() && !mediaUrl) return;
    setIsSubmitting(true);

    let persistentMediaUrl = "";

    try {
      if (selectedFileRef.current) {
        const formData = new FormData();
        formData.append("file", selectedFileRef.current);

        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.success && uploadJson.data?.url) {
              persistentMediaUrl = uploadJson.data.url;
            }
          }
        } catch (uploadErr) {
          console.warn("[Upload failed, converting to sovereign data URL]:", uploadErr);
        }

        if (!persistentMediaUrl) {
          persistentMediaUrl = await blobToDataUrl(selectedFileRef.current);
        }
      }

      if (!persistentMediaUrl && mediaUrl && !mediaUrl.startsWith("blob:")) {
        persistentMediaUrl = mediaUrl;
      }

      const parsedHashtags = hashtags
        .split(" ")
        .filter((t) => t.startsWith("#") || t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      const payload = {
        content: content.trim(),
        type: mediaType === "video" ? "immersive_video" : "standard",
        videoUrl: mediaType === "video" ? (persistentMediaUrl || undefined) : undefined,
        imageUrl: mediaType === "image" ? (persistentMediaUrl || undefined) : (persistentMediaUrl || undefined),
        musicTitle,
        musicAuthor: "Sphera Audio Lab",
        hashtags: parsedHashtags,
        authorName: "Kwesi Asiedu",
        authorUsername: "kwesi",
      };

      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          onPostCreated(data.post);
          onClose();
          return;
        }
      } catch (feedErr) {
        console.warn("[Feed publish network notice]:", feedErr);
      }

      onPostCreated({
        ...payload,
        id: `post-${Date.now()}`,
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
      });
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
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-white font-black text-sm">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Create SpheraNet Post</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Body */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update, collegiate hackathon project, or creator clip..."
          rows={4}
          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition resize-none font-medium"
        />

        {/* Media Preview Box */}
        {mediaUrl && (
          <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 max-h-48 flex items-center justify-center">
            {mediaType === "video" ? (
              <video src={mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Upload preview" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => {
                setMediaUrl(null);
                selectedFileRef.current = null;
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Media Attachment Bar */}
        <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-2xl p-2 px-3 text-xs font-bold text-zinc-400">
          <span className="text-[11px] text-zinc-500">Attach to post:</span>
          <div className="flex items-center gap-2">
            <label className="p-2 hover:bg-zinc-800 rounded-xl cursor-pointer hover:text-pink-400 transition flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, "image")} />
            </label>
            <label className="p-2 hover:bg-zinc-800 rounded-xl cursor-pointer hover:text-cyan-400 transition flex items-center gap-1">
              <Video className="w-4 h-4 text-rose-500" />
              <span className="text-[11px]">Video Reel</span>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, "video")} />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handlePublish}
            disabled={isSubmitting || (!content.trim() && !mediaUrl)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs shadow-lg disabled:opacity-50 transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to Persistent Storage...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Publish Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
