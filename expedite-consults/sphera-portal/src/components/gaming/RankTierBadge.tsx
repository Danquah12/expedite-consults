"use client";

import { Award, Shield, Sparkles, Flame, Crown } from "lucide-react";
import type { GameRankTier } from "@/types";

interface RankTierBadgeProps {
  tier: GameRankTier;
  mmr?: number;
}

export function RankTierBadge({ tier, mmr }: RankTierBadgeProps) {
  const getStyles = () => {
    switch (tier) {
      case "RADIANT":
        return {
          gradient: "from-amber-400 via-rose-500 to-cyan-400",
          border: "border-cyan-400/50",
          text: "text-cyan-300",
          icon: Crown,
          label: "Radiant Master",
        };
      case "MASTER":
        return {
          gradient: "from-purple-500 to-indigo-600",
          border: "border-purple-500/50",
          text: "text-purple-300",
          icon: Flame,
          label: "Grandmaster",
        };
      case "DIAMOND":
        return {
          gradient: "from-cyan-400 to-blue-600",
          border: "border-cyan-400/40",
          text: "text-cyan-300",
          icon: Sparkles,
          label: "Diamond",
        };
      case "PLATINUM":
        return {
          gradient: "from-teal-400 to-emerald-500",
          border: "border-teal-400/40",
          text: "text-teal-300",
          icon: Award,
          label: "Platinum",
        };
      case "GOLD":
        return {
          gradient: "from-amber-400 to-yellow-500",
          border: "border-amber-400/40",
          text: "text-amber-300",
          icon: Award,
          label: "Gold",
        };
      case "SILVER":
        return {
          gradient: "from-slate-300 to-slate-400",
          border: "border-slate-300/40",
          text: "text-slate-200",
          icon: Shield,
          label: "Silver",
        };
      case "BRONZE":
      default:
        return {
          gradient: "from-amber-700 to-amber-900",
          border: "border-amber-700/40",
          text: "text-amber-500",
          icon: Shield,
          label: "Bronze",
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${style.gradient} border ${style.border} text-black font-black text-[10px] shadow-sm`}
    >
      <Icon size={11} className="fill-current" />
      <span>{style.label}</span>
      {mmr !== undefined && (
        <span className="opacity-80 font-mono ml-0.5">{mmr} MMR</span>
      )}
    </div>
  );
}
