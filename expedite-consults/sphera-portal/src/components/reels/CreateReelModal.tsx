"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Video as VideoIcon, Loader2, Sparkles, Music } from "lucide-react";
import { extractHashtags } from "@/lib/utils";

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateReelModal({ isOpen, onClose }: CreateReelModalProps) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState("");
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: {
      url: string;
      caption?: string;
      music?: string;
      hashtags?: string[];
      duration?: number;
      muxAssetId?: string;
      muxPlaybackId?: string;
    }) => {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setCaption("");
    setMusic("");
    setPreview(null);
    setUploading(false);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview({ url, file });
  };

  const handleSubmit = async () => {
    if (!preview) return;

    setUploading(true);
    let finalUrl = preview.url;

    try {
      const formData = new FormData();
      formData.append("file", preview.file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (uploadJson.success && uploadJson.data?.url) {
        finalUrl = uploadJson.data.url;
      }
    } catch {
      // Non-blocking fallback
    }
    setUploading(false);

    const hashtags = caption ? extractHashtags(caption) : [];

    mutation.mutate({
      url: finalUrl,
      caption: caption || undefined,
      music: music || undefined,
      hashtags,
      duration: 30,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a3a]">
          <button onClick={handleClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-sm text-[#f9fafb]">
            <Sparkles size={16} className="text-[#00d4ff]" />
            New Reel
          </div>
          <button
            onClick={handleSubmit}
            disabled={!preview || mutation.isPending || uploading}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00bce0] disabled:opacity-40 transition-all"
          >
            {mutation.isPending || uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Post"
            )}
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-[9/16] bg-[#0a0f1e] flex items-center justify-center overflow-hidden">
          {preview ? (
            <>
              <video src={preview.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 text-[#6b7280] hover:text-[#00d4ff] transition-colors p-8 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-[#1f2937] flex items-center justify-center border border-[#374151]">
                <VideoIcon size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#f9fafb]">Upload vertical video</p>
                <p className="text-xs text-[#6b7280] mt-1">MP4 or WebM up to 60s</p>
              </div>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Fields */}
        <div className="p-4 space-y-2 border-t border-[#1e2a3a] bg-[#111827]">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption with #hashtags..."
            className="w-full h-10 px-4 rounded-xl border border-[#1e2a3a] bg-[#1f2937] text-[#f9fafb] placeholder:text-[#6b7280] text-xs focus:outline-none focus:border-[#00d4ff] transition-all"
          />
          <div className="relative">
            <Music size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              value={music}
              onChange={(e) => setMusic(e.target.value)}
              placeholder="Audio or track name (optional)"
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#1e2a3a] bg-[#1f2937] text-[#f9fafb] placeholder:text-[#6b7280] text-xs focus:outline-none focus:border-[#00d4ff] transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
