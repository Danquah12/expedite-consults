"use client";

import { ShieldCheck, Award, Sparkles, Crown } from "lucide-react";
import type { SellerTier } from "@/types";

interface SellerTierBadgeProps {
  tier?: SellerTier;
  salesCount?: number;
  rating?: number;
  showDetails?: boolean;
}

export function SellerTierBadge({
  tier = "BRONZE",
  salesCount,
  rating,
  showDetails = true,
}: SellerTierBadgeProps) {
  switch (tier) {
    case "GOLD":
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-[0_0_12px_rgba(251,191,36,0.45)] border border-yellow-200">
            <Crown size={11} className="fill-black" />
            GOLD MASTER
          </span>
          {showDetails && rating && (
            <span className="text-[10px] text-amber-400 font-bold">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount} sales)` : ""}
            </span>
          )}
        </div>
      );

    case "SILVER":
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400 text-slate-900 border border-slate-300">
            <Award size={11} />
            SILVER SELLER
          </span>
          {showDetails && rating && (
            <span className="text-[10px] text-slate-300 font-medium">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount})` : ""}
            </span>
          )}
        </div>
      );

    case "PLATINUM":
    case "DIAMOND":
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 text-black shadow-[0_0_15px_rgba(0,212,255,0.4)] border border-cyan-200">
            <Sparkles size={11} className="fill-black" />
            DIAMOND GUILD
          </span>
          {showDetails && rating && (
            <span className="text-[10px] text-[#00d4ff] font-bold">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount} sales)` : ""}
            </span>
          )}
        </div>
      );

    case "BRONZE":
    default:
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-100 border border-amber-600/50">
            <ShieldCheck size={11} />
            BRONZE VERIFIED
          </span>
          {showDetails && rating && (
            <span className="text-[10px] text-[#9ca3af]">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount})` : ""}
            </span>
          )}
        </div>
      );
  }
}
