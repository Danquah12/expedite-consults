"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Building2,
  Plus,
  Users,
  Globe,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Flame,
  Loader2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { CreatePageModal } from "@/components/pages/CreatePageModal";
import type { BusinessPageWithDetails } from "@/types";

const fallbackPages: BusinessPageWithDetails[] = [
  {
    id: "pg1",
    name: "Expedite Consults LLC",
    handle: "expedite_consults",
    category: "Cybersecurity & Technology",
    description: "Enterprise defense architectures, zero-trust cloud enclaves, and autonomous AI intelligence platforms.",
    followers: 48900,
    postsCount: 184,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    website: "expediteconsults.com",
    isFollowing: true,
  },
  {
    id: "pg2",
    name: "SpheraNet Studios & Creative",
    handle: "sphera_studios",
    category: "Media & Production",
    description: "Official creator tool suite, 4K rendering engines, and production network for SpheraNet creators worldwide.",
    followers: 124000,
    postsCount: 420,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    website: "sphera.net/studio",
    isFollowing: true,
  },
  {
    id: "pg3",
    name: "University of Maryland Alumni",
    handle: "umd_alumni",
    category: "University & Education",
    description: "Connecting 400,000+ Terps globally. Collegiate hackathons, campus mentorship, and cleared tech careers.",
    followers: 86400,
    postsCount: 512,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    website: "alumni.umd.edu",
    isFollowing: false,
  },
  {
    id: "pg4",
    name: "VeritasLens Media Watch",
    handle: "veritaslens",
    category: "AI & Media Trust",
    description: "Real-time automated media authenticity verification, synthetic deepfake detection, and news trust indices.",
    followers: 32100,
    postsCount: 96,
    isVerified: true,
    avatarImg: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&auto=format&fit=crop&q=80",
    coverImg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
    website: "veritaslens.ai",
    isFollowing: false,
  },
];

export default function PagesDirectoryPage() {
  const queryClient = useQueryClient();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({ pg1: true, pg2: true });
  const [activeFilter, setActiveFilter] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: dbPages, isLoading } = useQuery<BusinessPageWithDetails[]>({
    queryKey: ["business-pages", activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== "All") params.set("category", activeFilter);
      const res = await fetch(`/api/pages?${params}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const pages = dbPages && dbPages.length > 0 ? dbPages : fallbackPages;

  const toggleFollow = (id: string) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ["All", "Cybersecurity & Technology", "Media & Production", "University & Education", "AI & Media Trust"];

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#1c202e] pb-5 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Verified Pages & Institutions
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Official corporate organizations, media networks, university hubs, and verified creators.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-5 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] font-black text-xs shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Create a Page</span>
        </button>
      </div>

      {/* ── Category Filters ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === cat
                ? "bg-[#00d4ff] text-[#08090d] font-black shadow-[0_0_12px_rgba(0,212,255,0.3)]"
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

      {/* ── High-End Brand Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map((page) => {
          const isFollowing = followingMap[page.id] ?? page.isFollowing;
          return (
            <div
              key={page.id}
              className="bg-[#10121a] border border-[#1c202e] rounded-3xl overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#00d4ff]/30 transition-all group"
            >
              {/* Cover Banner */}
              <div className="h-36 w-full overflow-hidden relative bg-zinc-900">
                <img
                  src={page.coverImg}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-transparent to-black/20" />
              </div>

              {/* Body Content */}
              <div className="px-6 pb-6 -mt-9 relative space-y-3">
                <div className="flex justify-between items-end mb-2">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-[#10121a] shadow-xl flex-shrink-0 bg-zinc-900">
                    <img src={page.avatarImg} alt={page.name} className="w-full h-full object-cover" />
                  </div>

                  <button
                    onClick={() => toggleFollow(page.id)}
                    className={`h-9 px-5 rounded-xl text-xs font-bold transition-all ${
                      isFollowing
                        ? "bg-[#161924] text-[#94a3b8] border border-[#1c202e] hover:text-white"
                        : "bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] shadow-[0_0_12px_rgba(0,212,255,0.3)] hover:scale-105"
                    }`}
                  >
                    {isFollowing ? "Following" : "+ Follow"}
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">{page.name}</h3>
                    <CheckCircle2 size={15} className="text-[#00d4ff] fill-[#00d4ff]" />
                  </div>
                  <p className="text-xs text-[#00d4ff] font-semibold mt-0.5">
                    {page.category}
                  </p>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-2">
                  {page.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#64748b] pt-3 border-t border-[#1c202e] flex-wrap">
                  <span><strong className="text-white">{formatNumber(page.followers)}</strong> followers</span>
                  <span>·</span>
                  <span><strong className="text-white">{page.postsCount}</strong> posts</span>
                  {page.website && (
                    <>
                      <span>·</span>
                      <span className="text-[#00d4ff] flex items-center gap-1">
                        <Globe size={12} /> {page.website}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Page Modal */}
      <CreatePageModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
