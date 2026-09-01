"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Building2,
  Sparkles,
  Loader2,
  Globe,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePageModal({ isOpen, onClose }: CreatePageModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("Cybersecurity & Technology");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const categories = [
    "Cybersecurity & Technology",
    "Media & Production",
    "University & Education",
    "AI & Media Trust",
    "Esports & Gaming Guild",
    "Commerce & Lifestyle",
  ];

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-pages"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setName("");
    setHandle("");
    setDescription("");
    setWebsite("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) return;

    mutation.mutate({
      name: name.trim(),
      handle: handle.trim().replace(/^@/, ""),
      category,
      description: description.trim() || "Official verified institutional page on SpheraNet.",
      website: website.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0d0f17]">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <Building2 size={18} className="text-[#00d4ff]" />
            <span>Create Verified Page or Institution</span>
          </div>
          <button onClick={handleClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Page Name */}
          <div>
            <label className="block text-xs font-bold text-[#9ca3af] mb-1">
              Organization / Brand Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Expedite Defense Labs"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Unique Handle */}
          <div>
            <label className="block text-xs font-bold text-[#9ca3af] mb-1">
              Page Handle (@username) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] font-bold text-xs">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="expedite_defense"
                required
                className="w-full h-10 pl-8 pr-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] font-mono"
              />
            </div>
          </div>

          {/* Industry Category */}
          <div>
            <label className="block text-xs font-bold text-[#9ca3af] mb-1">
              Industry Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white focus:outline-none focus:border-[#00d4ff]"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#111827]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-bold text-[#9ca3af] mb-1">
              Official Website (Optional)
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. expeditedefense.com"
              className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#9ca3af] mb-1">
              About the Organization
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mission statement, verified credentials, campus initiatives..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || !handle.trim() || mutation.isPending}
            className="w-full h-11 mt-2 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] font-black text-xs flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          >
            {mutation.isPending ? (
              <Loader2 size={16} className="animate-spin text-[#08090d]" />
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Launch Verified Page</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
