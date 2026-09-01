"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Users,
  ShoppingBag,
  Briefcase,
  Globe,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type SearchDomain = "all" | "people" | "bazaar" | "career" | "spaces";

const recentSearches = [
  "Amara Diallo",
  "Cybersecurity TS/SCI Jobs near DC",
  "MacBook Pro M3",
  "#BitcampHackathon",
  "PS5 Console Deals",
];

const trendingSearches = [
  { term: "Sphera AI Agent v2", count: "24.8K searches", cat: "AI & Tech" },
  { term: "Cybersecurity jobs Maryland", count: "18.2K searches", cat: "Career" },
  { term: "Affordable apartments near UMD", count: "12.4K searches", cat: "Campus Housing" },
  { term: "MacBook Pro M3 under $1000", count: "9.8K searches", cat: "Bazaar" },
  { term: "DC Founder & Angel Meetup", count: "7.6K searches", cat: "Events" },
];

const fallbackSearchResults = [
  {
    type: "person",
    title: "Amara Diallo",
    subtitle: "@amara_creates · Sphera Creator Lead",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    meta: "248K followers · 12 mutual friends",
    verified: true,
    action: "Follow",
    link: "/profile",
  },
  {
    type: "job",
    title: "Lead Cybersecurity Architect & IAM Enclave Engineer",
    subtitle: "Expedite Federal Systems · Bethesda, MD",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    meta: "$185,000 - $225,000 · TS/SCI Polygraph · 98% Match",
    action: "Apply",
    link: "/career",
  },
  {
    type: "bazaar",
    title: "MacBook Pro 14\" M3 Pro (18GB / 512GB) Space Black",
    subtitle: "Alex Mensah · College Park, MD (1.1 mi)",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&auto=format&fit=crop&q=80",
    meta: "$1,200 · Mint Condition · Hot Deal",
    action: "View Item",
    link: "/bazaar",
  },
  {
    type: "space",
    title: "CyberMatrix Defense Guild",
    subtitle: "Official Cyber Guild · 1,420 Active Agents",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    meta: "Weekly CTF Bounties · Zero Trust Research",
    action: "Join Space",
    link: "/spaces",
  },
];

export default function UniversalSearchPage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<SearchDomain>("all");

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search", query, domain],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${domain}`);
      const json = await res.json();
      if (!json.success) return null;
      return json.data;
    },
    enabled: query.trim().length >= 2,
  });

  const filteredResults = fallbackSearchResults.filter((res) => {
    if (domain !== "all") {
      if (domain === "people" && res.type !== "person") return false;
      if (domain === "bazaar" && res.type !== "bazaar") return false;
      if (domain === "career" && res.type !== "job") return false;
      if (domain === "spaces" && res.type !== "space") return false;
    }
    if (query.trim()) {
      const term = query.toLowerCase();
      return (
        res.title.toLowerCase().includes(term) ||
        res.subtitle.toLowerCase().includes(term) ||
        res.meta.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Search Header ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-white">Universal AI Search</h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Search across 15 Sphera worlds: people, posts, marketplace, bounties, spaces, and campus.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search size={18} className="text-[#00d4ff] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything... 'MacBook Pro under $1000', 'TS/SCI cybersecurity jobs', '@amara'"
            className="w-full h-12 pl-12 pr-10 rounded-2xl bg-[#10121a] border border-[#00d4ff]/30 text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.08)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Domain Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Worlds" },
            { id: "people", label: "People & Graph" },
            { id: "bazaar", label: "Bazaar Products" },
            { id: "career", label: "Career Bounties" },
            { id: "spaces", label: "Spaces & Guilds" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDomain(d.id as SearchDomain)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                domain === d.id
                  ? "bg-[#00d4ff] text-[#08090d] shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                  : "bg-[#10121a] text-[#94a3b8] border border-[#1c202e] hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Results List ───────────────────────────────────── */}
      {query ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#94a3b8]">
              Results for &ldquo;{query}&rdquo;
            </h2>
            {isLoading && <Loader2 size={14} className="animate-spin text-[#00d4ff]" />}
          </div>

          <div className="space-y-2.5">
            {filteredResults.map((res, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#10121a] border border-[#1c202e] flex items-center justify-between gap-4 shadow-lg hover:border-[#00d4ff]/30 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-zinc-900 border border-[#1c202e] flex-shrink-0">
                    <img src={res.img} alt={res.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white truncate">{res.title}</h3>
                      {res.verified && <CheckCircle2 size={13} className="text-[#00d4ff] fill-[#00d4ff] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#00d4ff] font-semibold truncate">{res.subtitle}</p>
                    <p className="text-[11px] text-[#64748b] truncate">{res.meta}</p>
                  </div>
                </div>

                <Link
                  href={res.link}
                  className="h-8 px-4 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black flex items-center gap-1 flex-shrink-0 hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                >
                  <span>{res.action}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="p-6 rounded-3xl bg-[#10121a] border border-[#1c202e] space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#94a3b8]" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Searches</h3>
            </div>

            <div className="space-y-2">
              {recentSearches.map((s) => (
                <div
                  key={s}
                  onClick={() => setQuery(s)}
                  className="p-2.5 px-3.5 rounded-xl bg-[#161924] text-xs text-[#cbd5e1] hover:text-[#00d4ff] hover:border-[#00d4ff]/40 border border-transparent cursor-pointer transition-all flex items-center justify-between group"
                >
                  <span>{s}</span>
                  <ArrowRight size={13} className="text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <div className="p-6 rounded-3xl bg-[#10121a] border border-[#1c202e] space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#00d4ff]" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Trending on Sphera</h3>
            </div>

            <div className="space-y-2">
              {trendingSearches.map((t) => (
                <div
                  key={t.term}
                  onClick={() => setQuery(t.term)}
                  className="p-2.5 px-3 rounded-xl bg-[#161924] hover:border-[#00d4ff]/40 border border-transparent cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-[10px] text-[#64748b] font-bold">{t.cat}</p>
                    <p className="text-xs font-bold text-[#00d4ff] group-hover:underline">{t.term}</p>
                  </div>
                  <span className="text-[11px] text-[#94a3b8] font-semibold">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
