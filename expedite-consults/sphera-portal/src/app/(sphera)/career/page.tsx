"use client";

import { useState } from "react";
import {
  Briefcase, ShieldCheck, Sparkles, Search, MapPin,
  Building2, DollarSign, Bookmark, ArrowUpRight, Check,
  SlidersHorizontal, CheckCircle2, Lock, Award, Clock
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface JobBounty {
  id: string;
  title: string;
  company: { name: string; logo: string; verified?: boolean; location: string };
  salary: string;
  type: "Full-Time" | "Contract Bounty" | "Part-Time";
  clearance?: "TS/SCI Polygraph" | "Secret Required" | "Public Trust" | "Unclassified";
  matchScore: number;
  tags: string[];
  postedTime: string;
  featured?: boolean;
}

const mockJobs: JobBounty[] = [
  {
    id: "job-1",
    title: "Lead Cybersecurity Architect & IAM Enclave Engineer",
    company: {
      name: "Expedite Federal Systems",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Bethesda, MD (Hybrid)",
    },
    salary: "$185,000 - $225,000",
    type: "Full-Time",
    clearance: "TS/SCI Polygraph",
    matchScore: 98,
    tags: ["Zero-Trust Architecture", "FIDO2 Passkeys", "OAuth/SAML", "Next.js 16", "TypeScript"],
    postedTime: "2 hours ago",
    featured: true,
  },
  {
    id: "job-2",
    title: "Autonomous AI Agent Systems & Distributed Core Engineer",
    company: {
      name: "Sphera Core Labs",
      logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Remote (US / Global)",
    },
    salary: "$170,000 - $210,000",
    type: "Full-Time",
    clearance: "Unclassified",
    matchScore: 95,
    tags: ["LLM Agents", "PostgreSQL", "Prisma", "Real-Time WebSockets", "Python"],
    postedTime: "1 day ago",
    featured: true,
  },
  {
    id: "job-3",
    title: "Penetration Tester & AppSec Bounty Specialist",
    company: {
      name: "CyberMatrix Defense",
      logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Annapolis Junction, MD",
    },
    salary: "$120 - $160 / hr",
    type: "Contract Bounty",
    clearance: "Secret Required",
    matchScore: 91,
    tags: ["Burp Suite", "SAST/DAST", "Network Forensics", "Zero-Day Research", "Python"],
    postedTime: "2 days ago",
  },
  {
    id: "job-4",
    title: "Principal Frontend Design Engineer (UI/UX Systems)",
    company: {
      name: "Orbit Digital & Creative",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Remote (US)",
    },
    salary: "$140,000 - $180,000",
    type: "Full-Time",
    clearance: "Unclassified",
    matchScore: 89,
    tags: ["React 19", "Tailwind CSS", "Framer Motion", "WebGL/Canvas", "Design Tokens"],
    postedTime: "3 days ago",
  },
];

export default function CareerPage() {
  const [selectedFilter, setSelectedFilter] = useState("All Roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const handleApply = (id: string) => {
    setAppliedJobs(prev => ({ ...prev, [id]: true }));
  };

  const toggleSave = (id: string) => {
    setSavedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Career Header ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800 flex justify-between items-center gap-6 flex-wrap">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex gap-2 items-center">
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Opportunities & Careers
            </span>
            <span className="text-xs text-zinc-400 font-medium">· Verified Student & Professional Network</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Discover Roles, Internships & <span className="text-zinc-100 underline decoration-zinc-600 underline-offset-4">Bounties</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Connect directly with verified teams, apply with your portfolio, and discover high-impact roles matching your expertise.
          </p>
        </div>

        <button className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>View Verified Profile</span>
        </button>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="flex-1 min-w-[260px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, skills, or location..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-900/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["All Roles", "Full-Time", "Contract", "Defense Bounty", "Remote"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Job & Bounty Cards List ───────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {mockJobs.map((job) => {
          const isApplied = !!appliedJobs[job.id];
          const isSaved = !!savedJobs[job.id];

          return (
            <div
              key={job.id}
              className="bg-zinc-900/40 rounded-2xl border border-zinc-800 hover:border-zinc-700 p-5 flex flex-col gap-4 transition-all shadow-xs"
            >
              {/* Header Row */}
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex gap-3.5 flex-1 min-w-[280px]">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-white">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                          Featured
                        </span>
                      )}
                      {job.clearance && job.clearance !== "Unclassified" && (
                        <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck size={11} /> {job.clearance}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1">
                      <strong className="text-zinc-200">{job.company.name}</strong> · {job.company.location} · <span className="text-zinc-500">{job.postedTime}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm sm:text-base font-bold text-emerald-400">{job.salary}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{job.type}</p>
                </div>
              </div>

              {/* Skill Tags */}
              <div className="flex gap-1.5 flex-wrap">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 text-[11px] font-medium px-2.5 py-0.5 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500 font-medium">
                  Direct Verified Application
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleSave(job.id)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
                      isSaved
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => handleApply(job.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isApplied
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-xs"
                    }`}
                  >
                    {isApplied ? "Application Sent ✓" : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
