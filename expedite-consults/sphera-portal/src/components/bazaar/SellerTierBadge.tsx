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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Crown size={12} className="text-amber-400" />
            Top Seller
          </span>
          {showDetails && rating && (
            <span className="text-[11px] text-amber-400 font-medium">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount} sales)` : ""}
            </span>
          )}
        </div>
      );

    case "SILVER":
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Award size={12} className="text-zinc-400" />
            Verified Seller
          </span>
          {showDetails && rating && (
            <span className="text-[11px] text-zinc-400">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount})` : ""}
            </span>
          )}
        </div>
      );

    case "PLATINUM":
    case "DIAMOND":
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Sparkles size={12} className="text-sky-400" />
            Premier Merchant
          </span>
          {showDetails && rating && (
            <span className="text-[11px] text-sky-400 font-medium">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount} sales)` : ""}
            </span>
          )}
        </div>
      );

    case "BRONZE":
    default:
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
            <ShieldCheck size={12} className="text-zinc-400" />
            Verified Member
          </span>
          {showDetails && rating && (
            <span className="text-[11px] text-zinc-500">
              ★ {rating.toFixed(1)} {salesCount ? `(${salesCount})` : ""}
            </span>
          )}
        </div>
      );
  }
}
