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
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Events & Meetups
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Discover student hackathons, campus fests, community mixers, and live discussions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Host Event</span>
        </button>
      </div>

      {/* ── Category Filters ──────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === cat
                ? "bg-white text-zinc-950 font-semibold shadow-xs"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {cat === "All Events" ? "All Events" : `${cat.charAt(0) + cat.slice(1).toLowerCase()} Events`}
          </button>
        ))}
      </div>

      {/* ── Loading State ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      )}

      {/* ── Events Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xs"
            >
              {/* Photo Canvas */}
              <div className="h-44 w-full relative overflow-hidden bg-zinc-950">
                {ev.coverUrl && (
                  <img
                    src={ev.coverUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30" />

                {/* Date Badge */}
                <div className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-center flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-300">{monthStr}</span>
                  <span className="text-base font-bold text-white leading-none">{dayStr}</span>
                </div>

                <div className="absolute top-3.5 right-3.5">
                  <span className="bg-black/70 backdrop-blur-md text-zinc-300 border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                    {ev.isOnline ? <Globe size={11} /> : <MapPin size={11} />}
                    {ev.isOnline ? "Online" : "In-Person"}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {ev.type}
                  </span>

                  <h3 className="text-sm font-semibold text-white leading-snug mt-1">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1.5 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-1 text-xs text-zinc-400 mt-2.5">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Clock size={13} className="text-zinc-500" />
                      {dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin size={13} className="text-zinc-500" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Organizer & RSVP Action */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white">
                      {organizerAvatar ? (
                        <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover" />
                      ) : (
                        organizerName[0]
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200 leading-tight">{organizerName}</p>
                      <p className="text-[10px] text-zinc-500">{formatCount(attendeeCount)} attending</p>
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
                    className={`h-7 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isRsvpd
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-xs"
                    }`}
                  >
                    {isRsvpd ? "Going ✓" : "RSVP"}
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
