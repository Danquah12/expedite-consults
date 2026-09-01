"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Download,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import type { SkillPassportData } from "@/types";

interface SkillPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkillPassportModal({ isOpen, onClose }: SkillPassportModalProps) {
  const [copied, setCopied] = useState(false);

  const { data: passport } = useQuery<SkillPassportData>({
    queryKey: ["skill-passport"],
    queryFn: async () => {
      const res = await fetch("/api/career/passport");
      const json = await res.json();
      if (!json.success) return null;
      return json.data;
    },
    enabled: isOpen,
  });

  const handleCopyHash = () => {
    if (passport?.signatureHash) {
      navigator.clipboard.writeText(passport.signatureHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0d0f17]">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <ShieldCheck size={18} className="text-amber-400" />
            <span>Cryptographic Skill Passport</span>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Passport Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Identity Card */}
          <div className="bg-gradient-to-br from-amber-500/15 via-[#161924] to-[#10121a] border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-black text-white">{passport?.name || "Kwesi Asiedu"}</h3>
                <p className="text-xs text-[#00d4ff] font-semibold">@{passport?.handle || "kwesi"}</p>
                <p className="text-[11px] text-[#9ca3af] mt-1">{passport?.university || "University of Maryland"}</p>
              </div>

              <span className="bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-black shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                TOP 1% PASSPORT
              </span>
            </div>

            {/* Badges Row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2a3a]">
              <div className="p-2.5 rounded-xl bg-[#10121a]/80 border border-purple-500/30">
                <span className="text-[9px] text-[#9ca3af] uppercase font-bold block">Security Clearance</span>
                <span className="text-xs font-black text-purple-300 flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} /> {passport?.clearanceLevel || "TS/SCI Polygraph"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#10121a]/80 border border-emerald-500/30">
                <span className="text-[9px] text-[#9ca3af] uppercase font-bold block">Academic GPA</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap size={12} /> {passport?.gpa || "3.94 / 4.0"}
                </span>
              </div>
            </div>
          </div>

          {/* Verified Skills */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#00d4ff]" />
              Verified Competencies & Bounties
            </h4>

            <div className="space-y-2">
              {(passport?.skills || []).map((sk, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#161924] border border-[#1c202e] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{sk.name}</p>
                    <p className="text-[10px] text-[#64748b]">Verified by {sk.verifiedBy}</p>
                  </div>
                  <span className="bg-[#00d4ff]/15 text-[#00d4ff] px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {sk.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Proof */}
          <div className="p-3.5 bg-[#0d0f17] border border-[#1c202e] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-[#64748b] block">Signed Cryptographic Proof Hash</span>
              <span className="text-[11px] text-[#00d4ff] truncate block">
                {passport?.signatureHash || "0x9f88b432a68e91cf738120b064c391aa"}
              </span>
            </div>
            <button
              onClick={handleCopyHash}
              className="h-8 px-2.5 rounded-lg bg-[#161924] border border-[#1c202e] text-white hover:text-[#00d4ff] flex items-center gap-1 text-[11px] flex-shrink-0"
            >
              {copied ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
