"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Users,
  Plus,
  ShieldCheck,
  Sparkles,
  Lock,
  MessageSquare,
  ArrowRight,
  Flame,
  Star,
  Loader2,
  Check,
} from "lucide-react";
import { formatCount } from "@/lib/utils";
import { CreateSpaceModal } from "@/components/spaces/CreateSpaceModal";
import type { SpaceWithDetails } from "@/types";

const fallbackSpaces: SpaceWithDetails[] = [
  {
    id: "sp1",
    ownerId: "u1",
    name: "CyberMatrix Defense Guild",
    slug: "cybermatrix-defense",
    category: "Cybersecurity",
    type: "PROFESSIONAL",
    description: "Collaborative threat hunting, TS/SCI defense bounties, CTF tournaments, and enclave architecture research.",
    memberCount: 1420,
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    rules: ["Respect enclave NDAs", "No zero-day disclosures without disclosure approval"],
    createdAt: new Date(),
    updatedAt: new Date(),
    channels: [
      { id: "ch1", spaceId: "sp1", name: "general", type: "TEXT", order: 0 },
      { id: "ch2", spaceId: "sp1", name: "bounties", type: "ANNOUNCEMENTS", order: 1 },
      { id: "ch3", spaceId: "sp1", name: "Threat Hunting Lounge", type: "VOICE", order: 2 },
    ],
    isJoined: true,
  },
  {
    id: "sp2",
    ownerId: "u2",
    name: "Autonomous AI Agents & LLM Core",
    slug: "autonomous-ai-agents",
    category: "Technology & AI",
    type: "PUBLIC",
    description: "Building production multi-agent systems, local model quantization, and distributed AI pipelines.",
    memberCount: 2840,
    coverUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
    rules: ["Open source first", "Share research papers"],
    createdAt: new Date(),
    updatedAt: new Date(),
    channels: [
      { id: "ch4", spaceId: "sp2", name: "general", type: "TEXT", order: 0 },
      { id: "ch5", spaceId: "sp2", name: "agent-architecture", type: "TEXT", order: 1 },
    ],
    isJoined: true,
  },
  {
    id: "sp3",
    ownerId: "u3",
    name: "DMV Tech Founders & Angels",
    slug: "dmv-tech-founders",
    category: "Startups & Venture",
    type: "PROFESSIONAL",
    description: "Connecting Maryland, DC, and Northern Virginia tech founders with early-stage venture capital and angel syndicates.",
    memberCount: 3190,
    coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rules: ["Constructive feedback", "No unsolicited cold pitches"],
    createdAt: new Date(),
    updatedAt: new Date(),
    channels: [],
    isJoined: false,
  },
  {
    id: "sp4",
    ownerId: "u4",
    name: "Terrapin Esports & Gaming Society",
    slug: "terrapin-esports",
    category: "Esports & Gaming",
    type: "CAMPUS",
    description: "Official University of Maryland gaming hub. Valorant, Rocket League, and Smash tournament rosters.",
    memberCount: 890,
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80",
    rules: ["Positive esports spirit"],
    createdAt: new Date(),
    updatedAt: new Date(),
    channels: [],
    isJoined: false,
  },
];

export default function SpacesPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All Spaces");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localJoined, setLocalJoined] = useState<Record<string, { isJoined: boolean; count: number }>>({});

  const { data: dbSpaces, isLoading } = useQuery<SpaceWithDetails[]>({
    queryKey: ["spaces", activeCategory],
    queryFn: async () => {
      const param = activeCategory === "All Spaces" ? "" : `?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(`/api/spaces${param}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const spaces = dbSpaces && dbSpaces.length > 0 ? dbSpaces : fallbackSpaces;

  const joinMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      const res = await fetch(`/api/spaces/${spaceId}/join`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data, spaceId) => {
      setLocalJoined((prev) => ({
        ...prev,
        [spaceId]: { isJoined: data.isJoined, count: data.memberCount },
      }));
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });

  const categories = [
    "All Spaces",
    "Technology & AI",
    "Cybersecurity",
    "Startups & Venture",
    "Esports & Gaming",
    "Campus & Greek Life",
  ];

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#1c202e] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Spaces & Communities
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Join dedicated channels, guild hubs, and real-time voice study lounges.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Create Space</span>
        </button>
      </div>

      {/* ── Category Filters ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-[#00d4ff] text-[#08090d] font-bold shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                : "bg-[#10121a] text-[#94a3b8] border border-[#1c202e] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Loading State ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
        </div>
      )}

      {/* ── Spaces Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {spaces.map((space) => {
          const joinedState = localJoined[space.id];
          const isJoined = joinedState ? joinedState.isJoined : (space.isJoined ?? false);
          const memberCount = joinedState ? joinedState.count : space.memberCount;

          return (
            <div
              key={space.id}
              className="bg-[#10121a] border border-[#1c202e] rounded-3xl overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-[#00d4ff]/30 transition-all group"
            >
              {/* Cover Banner */}
              <div className="h-32 w-full relative overflow-hidden bg-zinc-900">
                {space.coverUrl && (
                  <img
                    src={space.coverUrl}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-transparent to-transparent" />

                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#00d4ff] border border-[#00d4ff]/30 px-2.5 py-1 rounded-full">
                  {space.type}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 -mt-8 relative flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-3 border-[#10121a] bg-[#161924] shadow-xl flex-shrink-0">
                      {space.avatarUrl ? (
                        <img src={space.avatarUrl} alt={space.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#00d4ff] text-xl">
                          {space.name[0]}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => joinMutation.mutate(space.id)}
                      disabled={joinMutation.isPending}
                      className={`h-8 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isJoined
                          ? "bg-[#161924] text-[#94a3b8] border border-[#1c202e] hover:text-white"
                          : "bg-[#00d4ff] text-[#08090d] shadow-[0_0_12px_rgba(0,212,255,0.25)] hover:bg-[#00bce0]"
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check size={12} strokeWidth={3} />
                          Joined
                        </>
                      ) : (
                        "+ Join"
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-black text-white leading-snug">{space.name}</h3>
                  <p className="text-[11px] text-[#00d4ff] font-bold mt-0.5">{space.category}</p>

                  <p className="text-xs text-[#94a3b8] leading-relaxed mt-2.5 line-clamp-3">
                    {space.description}
                  </p>

                  {/* Channel Pills Preview */}
                  {space.channels && space.channels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {space.channels.slice(0, 3).map((ch) => (
                        <span
                          key={ch.id}
                          className="bg-[#161924] border border-[#1c202e] text-[#cbd5e1] text-[10px] px-2 py-0.5 rounded-md font-mono"
                        >
                          {ch.type === "VOICE" ? "🔊" : "#"} {ch.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-3.5 mt-4 border-t border-[#1c202e]">
                  <span>
                    <strong className="text-white font-bold">{formatCount(memberCount)}</strong> members
                  </span>
                  <span className="text-[#10b981] font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    Online active
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Space Dialog */}
      <CreateSpaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
