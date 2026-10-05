"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Sparkles,
  Clock,
  Share2,
  Check,
  ExternalLink,
  Globe,
  Loader2,
} from "lucide-react";
import { formatCount } from "@/lib/utils";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import type { EventWithDetails } from "@/types";

const fallbackEvents: EventWithDetails[] = [
  {
    id: "ev1",
    creatorId: "u1",
    creator: {
      id: "u1",
      role: "ADMIN" as any,
      profile: {
        username: "kwesi",
        displayName: "Kwesi Asiedu",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
    },
    spaceId: null,
    title: "Sphera Global Builders & Autonomous Agent Hackathon 2026",
    description: "Build the next wave of social, decentralized identity, and autonomous multi-agent systems. $50,000 in cash bounties.",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    location: "Iribe Center @ UMD + Virtual Global",
    isOnline: true,
    meetingUrl: "https://sphera.live/hackathon2026",
    type: "CAMPUS",
    maxAttendees: 2000,
    createdAt: new Date(),
    _count: { rsvps: 1420 },
    isRsvpd: true,
    userRsvpStatus: "GOING",
  },
  {
    id: "ev2",
    creatorId: "u2",
    creator: {
      id: "u2",
      role: "USER" as any,
      profile: {
        username: "mj_tech",
        displayName: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
    },
    spaceId: null,
    title: "Tech Founders, Defense Cyber Execs & Angel Mixer",
    description: "Exclusive evening of lightning talks, founder networking, and venture capital syndicates in the DC/MD area.",
    coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    endAt: null,
    location: "Bethesda Sky Lounge, MD",
    isOnline: false,
    meetingUrl: null,
    type: "PROFESSIONAL",
    maxAttendees: 250,
    createdAt: new Date(),
    _count: { rsvps: 185 },
    isRsvpd: false,
    userRsvpStatus: null,
  },
  {
    id: "ev3",
    creatorId: "u3",
    creator: {
      id: "u3",
      role: "CREATOR" as any,
      profile: {
        username: "zara.w",
        displayName: "Zara Williams",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
    },
    spaceId: null,
    title: "AI Product Architecture & Zero-Trust Cloud Masterclass",
    description: "Deep dive into real-time collaborative sandboxes, low-latency video streaming, and zero-trust IAM enclaves.",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    endAt: null,
    location: "Sphera Live Stage (Streamed)",
    isOnline: true,
    meetingUrl: "https://sphera.live/masterclass",
    type: "PUBLIC",
    maxAttendees: 1000,
    createdAt: new Date(),
    _count: { rsvps: 640 },
    isRsvpd: false,
    userRsvpStatus: null,
  },
];

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All Events");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localRsvps, setLocalRsvps] = useState<Record<string, { isRsvpd: boolean; count: number }>>({});

  const { data: dbEvents, isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["events", activeTab],
    queryFn: async () => {
      const typeParam = activeTab === "All Events" ? "" : `?type=${encodeURIComponent(activeTab)}`;
      const res = await fetch(`/api/events${typeParam}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const events = dbEvents && dbEvents.length > 0 ? dbEvents : fallbackEvents;

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: "GOING" | "NOT_GOING" }) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data, variables) => {
      setLocalRsvps((prev) => ({
        ...prev,
        [variables.eventId]: { isRsvpd: data.isRsvpd, count: data.totalGoing },
      }));
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const categories = ["All Events", "CAMPUS", "PROFESSIONAL", "PUBLIC"];

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#1c202e] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Events & Meetups
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Discover tech hackathons, campus fests, founder mixers, and live virtual stages.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Host Event</span>
        </button>
      </div>

      {/* ── Category Filters ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === cat
                ? "bg-[#00d4ff] text-[#08090d] font-bold shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                : "bg-[#10121a] text-[#94a3b8] border border-[#1c202e] hover:text-white"
            }`}
          >
            {cat === "All Events" ? "All Events" : `${cat} Events`}
          </button>
        ))}
      </div>

      {/* ── Loading State ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
        </div>
      )}

      {/* ── Events Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          const dateObj = new Date(ev.startAt);
          const monthStr = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
          const dayStr = dateObj.getDate();

          const rsvpState = localRsvps[ev.id];
          const isRsvpd = rsvpState ? rsvpState.isRsvpd : (ev.isRsvpd ?? false);
          const attendeeCount = rsvpState ? rsvpState.count : ev._count.rsvps;
          const organizerName = ev.creator?.profile?.displayName || ev.creator?.profile?.username || "Organizer";
          const organizerAvatar = ev.creator?.profile?.avatar;

          return (
            <div
              key={ev.id}
              className="bg-[#10121a] border border-[#1c202e] rounded-3xl overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#00d4ff]/30 transition-all group"
            >
              {/* Photo Canvas */}
              <div className="h-44 w-full relative overflow-hidden bg-zinc-900">
                {ev.coverUrl && (
                  <img
                    src={ev.coverUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-transparent to-black/40" />

                {/* Date Badge */}
                <div className="absolute top-3.5 left-3.5 bg-black/85 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-center flex flex-col">
                  <span className="text-[10px] font-black text-[#00d4ff]">{monthStr}</span>
                  <span className="text-lg font-black text-white leading-none">{dayStr}</span>
                </div>

                <div className="absolute top-3.5 right-3.5">
                  <span className="bg-black/70 backdrop-blur-md text-[#00d4ff] border border-[#00d4ff]/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {ev.isOnline ? <Globe size={12} /> : <MapPin size={12} />}
                    {ev.isOnline ? "Virtual Stage" : "In-Person"}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#ec4899] uppercase tracking-wider">
                    {ev.type}
                  </span>

                  <h3 className="text-sm font-black text-white leading-snug mt-1">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-xs text-[#94a3b8] leading-relaxed mt-2 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-1 text-xs text-[#cbd5e1] mt-3">
                    <span className="flex items-center gap-1.5 text-[#94a3b8]">
                      <Clock size={13} className="text-[#00d4ff]" />
                      {dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1.5 text-[#94a3b8]">
                        <MapPin size={13} className="text-[#f87171]" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Organizer & RSVP Action */}
                <div className="flex items-center justify-between pt-3.5 border-t border-[#1c202e] mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-[#161924] border border-[#1c202e] flex items-center justify-center text-xs font-bold text-white">
                      {organizerAvatar ? (
                        <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover" />
                      ) : (
                        organizerName[0]
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{organizerName}</p>
                      <p className="text-[10px] text-[#64748b]">{formatCount(attendeeCount)} attending</p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      rsvpMutation.mutate({
                        eventId: ev.id,
                        status: isRsvpd ? "NOT_GOING" : "GOING",
                      })
                    }
                    disabled={rsvpMutation.isPending}
                    className={`h-8 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isRsvpd
                        ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                        : "bg-[#00d4ff] text-[#08090d] shadow-[0_0_12px_rgba(0,212,255,0.25)] hover:bg-[#00bce0]"
                    }`}
                  >
                    {isRsvpd ? (
                      <>
                        <Check size={12} strokeWidth={3} />
                        Attending
                      </>
                    ) : (
                      "RSVP (Going)"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Event Dialog */}
      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
