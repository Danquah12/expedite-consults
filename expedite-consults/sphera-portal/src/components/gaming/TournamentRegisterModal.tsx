"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Swords,
  Shield,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trophy,
  Users,
} from "lucide-react";
import type { TournamentWithDetails } from "@/types";

interface TournamentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentWithDetails | null;
}

export function TournamentRegisterModal({
  isOpen,
  onClose,
  tournament,
}: TournamentRegisterModalProps) {
  const queryClient = useQueryClient();
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [discordContact, setDiscordContact] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!tournament) return;
      const res = await fetch(`/api/gaming/tournaments/${tournament.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          teamTag: teamTag.trim().toUpperCase(),
          discordContact: discordContact.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gaming-tournaments"] });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamTag.trim()) return;
    registerMutation.mutate();
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a] bg-[#0d0f17]">
          <div className="flex items-center gap-2 font-black text-sm text-white">
            <Swords size={18} className="text-[#c084fc]" />
            <span>Register Squad for Tournament</span>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-in zoom-in-95">
              <CheckCircle2 size={44} className="text-[#10b981]" />
              <div>
                <h3 className="text-base font-bold text-white">Squad Registered Successfully!</h3>
                <p className="text-xs text-[#94a3b8] mt-1 max-w-xs">
                  Your team [{teamTag.toUpperCase()}] {teamName} has been seeded into the tournament bracket.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tournament Summary */}
              <div className="bg-[#161924] border border-[#1c202e] rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#c084fc] font-bold uppercase">{tournament.game}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Prize: {tournament.prizePool}</span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{tournament.title}</h4>
                <p className="text-[11px] text-[#9ca3af]">Starts: {tournament.startsAt}</p>
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-xs font-bold text-[#9ca3af] mb-1">
                  Squad / Team Name *
                </label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Terrapin Alpha"
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              {/* Clan Tag */}
              <div>
                <label className="block text-xs font-bold text-[#9ca3af] mb-1">
                  Clan Tag (2-5 Letters) *
                </label>
                <input
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                  placeholder="e.g. TERP"
                  maxLength={5}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#c084fc] font-mono uppercase font-bold"
                />
              </div>

              {/* Discord Contact */}
              <div>
                <label className="block text-xs font-bold text-[#9ca3af] mb-1">
                  Captain Discord / Sphera Handle
                </label>
                <input
                  value={discordContact}
                  onChange={(e) => setDiscordContact(e.target.value)}
                  placeholder="e.g. captain#1337 or @kwesi"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#1c202e] bg-[#161924] text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#c084fc]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!teamName.trim() || !teamTag.trim() || registerMutation.isPending}
                className="w-full h-11 rounded-2xl bg-gradient-to-tr from-[#a855f7] to-[#6366f1] text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-2"
              >
                {registerMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    <Swords size={16} />
                    <span>Confirm Tournament Entry (0 Fees)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
