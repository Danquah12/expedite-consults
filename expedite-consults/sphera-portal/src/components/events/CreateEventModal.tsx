"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Calendar, Sparkles, Loader2, MapPin, Globe } from "lucide-react";
import type { EventType } from "@/types";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [type, setType] = useState<EventType>("PUBLIC");

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setLocation("");
    setIsOnline(false);
    setMeetingUrl("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      startAt: new Date(startDate).toISOString(),
      location: isOnline ? "Virtual Stage" : location || "Campus Center",
      isOnline,
      meetingUrl: meetingUrl || undefined,
      type,
      coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
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
            Host Event
          </div>
          <div className="w-5" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Event Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bitcamp Hackathon Kickoff"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Mode Switcher (In-Person vs Virtual) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsOnline(false)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                !isOnline
                  ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]"
                  : "border-[#1e2a3a] bg-[#161924] text-[#9ca3af]"
              }`}
            >
              <MapPin size={13} />
              In-Person
            </button>
            <button
              type="button"
              onClick={() => setIsOnline(true)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isOnline
                  ? "border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]"
                  : "border-[#1e2a3a] bg-[#161924] text-[#9ca3af]"
              }`}
            >
              <Globe size={13} />
              Virtual Stage
            </button>
          </div>

          {/* Location / Meeting URL */}
          {isOnline ? (
            <div>
              <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
                Stream / Meeting Link
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://sphera.live/stage/..."
                className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
                Physical Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Iribe Center Auditorium, Room 110"
                className="w-full h-10 px-3.5 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff]"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1">
              Event Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda, speakers, prizes, and dress code..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[#1e2a3a] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || !startDate || mutation.isPending}
            className="w-full h-10 mt-2 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 hover:scale-[1.01] transition-transform"
          >
            {mutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Publish Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
