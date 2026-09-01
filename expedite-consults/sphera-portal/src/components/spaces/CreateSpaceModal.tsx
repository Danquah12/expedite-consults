"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Users, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import type { SpaceType } from "@/types";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology & AI");
  const [type, setType] = useState<SpaceType>("PUBLIC");
  const [coverUrl, setCoverUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const categories = [
    "Technology & AI",
    "Cybersecurity",
    "Campus & Greek Life",
    "Esports & Gaming",
    "Startups & Venture",
    "Design & Creative",
  ];

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setCoverUrl("");
    setAvatarUrl("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    mutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      type,
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a3a]">
          <button onClick={handleClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-sm text-[#f9fafb]">
            <Sparkles size={16} className="text-[#00d4ff]" />
            Create Space
          </div>
          <div className="w-5" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Space Name */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Space Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Terrapin AI Hackers"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs focus:outline-none focus:border-[#00d4ff]"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#111827]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Space Type */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Audience Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["PUBLIC", "CAMPUS", "GAMING", "PROFESSIONAL"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    type === t
                      ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]"
                      : "border-[#1e2a3a] bg-[#161924] text-[#9ca3af] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this space about? Guidelines, goals, channels..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || mutation.isPending}
            className="w-full h-10 mt-2 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 hover:scale-[1.01] transition-transform"
          >
            {mutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Launch Space"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
