"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

async function createPost(data: {
  caption: string;
  type: string;
  audience: string;
  media: { type: string; url: string; width?: number; height?: number }[];
}) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function CreatePostModal() {
  const { isCreatePostOpen, setIsCreatePostOpen } = useAppStore();
  const queryClient = useQueryClient();

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<"PUBLIC" | "FOLLOWERS" | "CLOSE_FRIENDS">("PUBLIC");
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setIsCreatePostOpen(false);
    setCaption("");
    setPreview(null);
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview({ url, file });
  };

  const handleSubmit = async () => {
    if (!caption && !preview) return;

    let mediaPayload: { type: string; url: string }[] = [];

    if (preview) {
      // Phase 1: Upload via Uploadthing or presigned URL
      // For now, we'll show the local preview URL as a placeholder
      // This will be replaced with actual Uploadthing upload in the next step
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", preview.file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          mediaPayload = [{ type: "image", url: uploadJson.data.url }];
        }
      } catch {
        // If upload fails, still post with caption only
      }
      setUploading(false);
    }

    mutation.mutate({
      caption,
      type: preview ? "PHOTO" : "TEXT",
      audience,
      media: mediaPayload,
    });
  };

  if (!isCreatePostOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-semibold text-white">New post</h2>
          <button
            onClick={handleSubmit}
            disabled={(!caption && !preview) || mutation.isPending || uploading}
            className="text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:text-violet-800 disabled:cursor-not-allowed transition"
          >
            {mutation.isPending || uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Share"
            )}
          </button>
        </div>

        {/* Image preview */}
        {preview ? (
          <div className="relative aspect-square bg-zinc-900">
            <img
              src={preview.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/2] flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-gray-400 hover:bg-zinc-900/50 transition"
          >
            <ImagePlus className="w-10 h-10" />
            <span className="text-sm">Add photo or video</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Caption */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption… #hashtags and @mentions work"
            maxLength={2200}
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              className="text-xs text-gray-500 bg-transparent border border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-600"
            >
              <option value="PUBLIC">🌐 Everyone</option>
              <option value="FOLLOWERS">👥 Followers only</option>
              <option value="CLOSE_FRIENDS">⭐ Close friends</option>
            </select>
            <span className="text-xs text-gray-600">{caption.length}/2200</span>
          </div>
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="px-4 pb-3 text-red-400 text-xs">
            {(mutation.error as Error).message}
          </div>
        )}
      </div>
    </div>
  );
}
