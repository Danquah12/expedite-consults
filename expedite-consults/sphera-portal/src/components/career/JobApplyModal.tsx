"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { JobListingWithMatch } from "@/types";

interface JobApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListingWithMatch | null;
}

export function JobApplyModal({ isOpen, onClose, job }: JobApplyModalProps) {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState(false);

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!job) return;
      const res = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 2500);
    },
  });

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0d0f17]">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <Sparkles size={16} className="text-[#00d4ff]" />
            <span>1-Click Skill Passport Application</span>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {successMsg ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-in zoom-in-95">
              <CheckCircle2 size={44} className="text-[#10b981]" />
              <div>
                <h3 className="text-base font-bold text-white">Application Successfully Dispatched</h3>
                <p className="text-xs text-[#94a3b8] mt-1 max-w-xs">
                  Your encrypted Verified Skill Passport has been submitted directly to the hiring team at {job.company}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Job Info Summary */}
              <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 flex gap-3.5 items-center">
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-900 border border-[#1c202e] flex-shrink-0">
                  <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{job.title}</h3>
                  <p className="text-[11px] text-[#00d4ff] font-semibold">{job.company}</p>
                  <p className="text-[10px] text-[#9ca3af]">{job.salary} · {job.location}</p>
                </div>
              </div>

              {/* Match Highlights */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-[#10121a] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Passport Match Rating</span>
                  <span className="text-xs font-black text-[#10b981] bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    {job.matchScore}% Match
                  </span>
                </div>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                  Your verified TS/SCI Polygraph and Full-Stack competence meet all primary criteria for this opening.
                </p>
              </div>

              {/* Encrypted Handshake Seal */}
              <div className="p-3 bg-[#0d0f17] border border-[#1c202e] rounded-xl flex items-center gap-2 text-[11px] text-[#64748b]">
                <Lock size={13} className="text-[#00d4ff]" />
                <span>Zero-Trust cryptographic handshake applied automatically.</span>
              </div>

              {/* Submit CTA */}
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="w-full h-11 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(0,212,255,0.3)] mt-2"
              >
                {applyMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin text-[#08090d]" />
                ) : (
                  <>
                    <span>Confirm & Dispatch Application</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
