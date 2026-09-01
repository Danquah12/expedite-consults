"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  MapPin,
  Globe,
  Calendar,
  Edit3,
  Share2,
  Award,
  Star,
  Briefcase,
  GraduationCap,
  Sparkles,
  Grid,
  Bookmark,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Flame,
  Heart,
  ExternalLink,
} from "lucide-react";
import { SkillPassportModal } from "@/components/career/SkillPassportModal";
import Link from "next/link";

const personas = {
  founder: {
    title: "FOUNDER ARCHITECT",
    roleSubtitle: "Cybersecurity Architect & Founder @ SpheraNet",
    bio: "Architecting next-generation autonomous AI ecosystems, enterprise zero-trust cloud enclaves, and decentralized social networks. MS in Cybersecurity @ University of Maryland. Building SpheraNet 🚀✨",
    tags: ["Distributed Systems", "Zero Trust", "Autonomous Agents", "Next.js 16", "PostgreSQL"],
  },
  cyber: {
    title: "CYBER DEFENSE LEAD",
    roleSubtitle: "TS/SCI Polygraph IAM & Enclave Engineer",
    bio: "Securing sovereign enterprise networks, cryptographic hardware enclaves, FIDO2 passkeys, and multi-tenant authentication protocols for defense applications.",
    tags: ["TS/SCI Cleared", "FIDO2 Enclave", "Penetration Testing", "ASPM", "Neo4j Attack Graphs"],
  },
  creator: {
    title: "VERIFIED CREATOR",
    roleSubtitle: "4K Video & Tech Content Producer",
    bio: "Creating deep-dive architectural breakdowns, system design tutorials, and building-in-public stories for 100K+ developers worldwide.",
    tags: ["System Design", "4K Video", "AI Creator Tools", "Tech Tutorials", "Mux Video"],
  },
};

export default function ProfilePage() {
  const [activePersona, setActivePersona] = useState<"founder" | "cyber" | "creator">("founder");
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const current = personas[activePersona];

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Cover Photo & Profile Header ──────────────────────────── */}
      <div className="bg-[#10121a] border border-[#1c202e] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Cover Photo */}
        <div className="h-60 w-full relative overflow-hidden bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80"
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-transparent to-black/30" />

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsPassportOpen(true)}
              className="bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-colors"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Skill Passport</span>
            </button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-7 relative">
          <div className="flex justify-between items-end -mt-16 flex-wrap gap-5">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-5 flex-wrap">
              <div className="h-28 w-28 rounded-3xl p-1 bg-gradient-to-tr from-[#00d4ff] via-[#6366f1] to-[#ec4899] shadow-2xl relative flex-shrink-0">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#08090d]">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                    alt="Kwesi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-[#10121a]" />
              </div>

              <div className="pb-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">Kwesi Asiedu</h1>
                  <CheckCircle2 size={20} className="text-[#00d4ff] fill-[#00d4ff]" />
                  <span className="bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 rounded-full px-2.5 py-0.5 text-[10px] font-black">
                    {current.title}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] font-semibold">
                  @kwesi · {current.roleSubtitle}
                </p>
                <div className="flex gap-4 text-xs text-[#64748b] pt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[#cbd5e1]">
                    <MapPin size={13} className="text-red-400" /> College Park, MD
                  </span>
                  <span className="flex items-center gap-1 text-[#00d4ff]">
                    <Globe size={13} /> expediteconsults.com
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> Joined September 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pb-1.5">
              <button
                onClick={() => setIsPassportOpen(true)}
                className="h-9 px-5 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Verified Passport</span>
              </button>
            </div>
          </div>

          {/* Bio & Active Persona Switcher */}
          <div className="mt-6 pt-5 border-t border-[#1c202e] space-y-4">
            <p className="text-xs text-[#e2e8f0] leading-relaxed max-w-3xl">
              {current.bio}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-wider">
                Active Persona:
              </span>
              {[
                { id: "founder", label: "🚀 Tech Founder" },
                { id: "cyber", label: "🛡️ Cyber Architect" },
                { id: "creator", label: "🎬 Content Creator" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id as any)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    activePersona === p.id
                      ? "bg-[#00d4ff] text-[#08090d] shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                      : "bg-[#161924] text-[#94a3b8] border border-[#1c202e] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#161924] text-[#00d4ff] text-[11px] font-mono px-2.5 py-0.5 rounded-md border border-[#1c202e]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-Dimension Metric Matrix ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Universe Network", val: "4.8K", sub: "Friends & Graph", icon: <UserPlus size={20} className="text-[#00d4ff]" /> },
          { label: "Creator Score", val: "4.98 ★", sub: "100% Authenticity", icon: <Star size={20} className="text-amber-400" /> },
          { label: "Bazaar Escrow", val: "$14.2K", sub: "38 Verified Trades", icon: <Award size={20} className="text-emerald-400" /> },
          { label: "Bounties Solved", val: "24", sub: "Enterprise TS/SCI", icon: <Briefcase size={20} className="text-purple-400" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#10121a] border border-[#1c202e] rounded-2xl p-5 flex flex-col gap-1.5 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-white">{stat.val}</p>
            <p className="text-[11px] text-[#94a3b8]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Skill Passport Modal */}
      <SkillPassportModal isOpen={isPassportOpen} onClose={() => setIsPassportOpen(false)} />
    </div>
  );
}
