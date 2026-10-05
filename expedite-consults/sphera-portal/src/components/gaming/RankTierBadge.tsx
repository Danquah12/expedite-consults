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
          bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          icon: Crown,
          label: "Radiant",
        };
      case "MASTER":
        return {
          bg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          icon: Flame,
          label: "Grandmaster",
        };
      case "DIAMOND":
        return {
          bg: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          icon: Sparkles,
          label: "Diamond",
        };
      case "PLATINUM":
        return {
          bg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
          icon: Award,
          label: "Platinum",
        };
      case "GOLD":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: Award,
          label: "Gold",
        };
      case "SILVER":
        return {
          bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
          icon: Shield,
          label: "Silver",
        };
      case "BRONZE":
      default:
        return {
          bg: "bg-zinc-800/70 text-zinc-400 border-zinc-700/60",
          icon: Shield,
          label: "Bronze",
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${style.bg} font-semibold text-[11px]`}
    >
      <Icon size={12} />
      <span>{style.label}</span>
      {mmr !== undefined && (
        <span className="opacity-75 font-mono ml-0.5">{mmr} MMR</span>
      )}
    </div>
  );
}
