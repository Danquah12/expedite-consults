"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Heart,
  ShoppingBag,
  Plus,
  Sparkles,
  Package,
  Car,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Wrench,
  Ticket,
  Utensils,
  ArrowUpDown,
  Grid,
  List,
  Eye,
  ShieldCheck,
  Check,
  MessageCircle,
  Loader2,
  Crown,
} from "lucide-react";
import { formatCount } from "@/lib/utils";
import { SellerTierBadge } from "@/components/bazaar/SellerTierBadge";
import { CreateListingModal } from "@/components/bazaar/CreateListingModal";
import Link from "next/link";
import type { ListingWithSeller, ListingCategory } from "@/types";

const fallbackListings: ListingWithSeller[] = [
  {
    id: "l1",
    sellerId: "u1",
    title: "Apple MacBook Pro 14\" (M3 Pro 18GB / 512GB SSD) Space Black",
    price: 1200,
    condition: "USED_LIKE_NEW" as any,
    category: "ELECTRONICS" as any,
    location: "College Park, MD (1.1 mi)",
    seller: {
      id: "u1",
      role: "CREATOR" as any,
      profile: {
        username: "alex_mensah",
        displayName: "Alex Mensah",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
      salesCount: 47,
      rating: 4.9,
      sellerTier: "GOLD",
    },
    views: 482,
    savesCount: 38,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"],
    tag: "🔥 HOT DEAL",
    specs: "Battery Health 99% · Original box + 96W USB-C charger included",
    status: "ACTIVE" as any,
    description: "Flawless condition MacBook Pro. Used for 4 months for university computer science coursework.",
  },
  {
    id: "l2",
    sellerId: "u2",
    title: "Sony PlayStation 5 Disc Edition + 2 DualSense Controllers Bundle",
    price: 380,
    condition: "USED_LIKE_NEW" as any,
    category: "ELECTRONICS" as any,
    location: "Silver Spring, MD (3.4 mi)",
    seller: {
      id: "u2",
      role: "USER" as any,
      profile: {
        username: "jordan_p",
        displayName: "Jordan Patterson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
      salesCount: 19,
      rating: 4.8,
      sellerTier: "SILVER",
    },
    views: 890,
    savesCount: 94,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80"],
    tag: "AI MATCH",
    specs: "Spider-Man 2 & God of War Ragnarok digital copies included",
    status: "ACTIVE" as any,
    description: "Includes console, 2 controllers, HDMI 2.1 cable, and charging dock.",
  },
  {
    id: "l3",
    sellerId: "u3",
    title: "Autonomous ErgoChair Pro + Solid Walnut Motorized Standing Desk",
    price: 290,
    condition: "USED_LIKE_NEW" as any,
    category: "HOUSING" as any,
    location: "Bethesda, MD (5.2 mi)",
    seller: {
      id: "u3",
      role: "USER" as any,
      profile: {
        username: "priya_s",
        displayName: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
      salesCount: 31,
      rating: 5.0,
      sellerTier: "GOLD",
    },
    views: 310,
    savesCount: 27,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&auto=format&fit=crop&q=80"],
    specs: "Dual-motor smart height presets, 60\" wide walnut surface",
    status: "ACTIVE" as any,
    description: "Moving out of state. Must pick up before end of month.",
  },
  {
    id: "l4",
    sellerId: "u4",
    title: "2022 Tesla Model 3 Long Range AWD — 28,400 Miles",
    price: 26500,
    condition: "USED_GOOD" as any,
    category: "VEHICLES" as any,
    location: "Rockville, MD (8.1 mi)",
    seller: {
      id: "u4",
      role: "USER" as any,
      profile: {
        username: "mj_tech",
        displayName: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        bio: null,
        isVerified: true,
        profileVisibility: "PUBLIC" as any,
      },
      salesCount: 6,
      rating: 4.9,
      sellerTier: "BRONZE",
    },
    views: 1420,
    savesCount: 210,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80"],
    tag: "VERIFIED TITLE",
    specs: "Full Self-Driving (FSD) Transferable · Single Owner Garage Kept",
    status: "ACTIVE" as any,
    description: "Pearl white multi-coat exterior with premium black interior.",
  },
];

export default function BazaarPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  const { data: dbListings, isLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ["bazaar", category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/bazaar?${params}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const listings = dbListings && dbListings.length > 0 ? dbListings : fallbackListings;

  const toggleSave = (id: string) => {
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "electronics", label: "Tech & Gear" },
    { id: "vehicles", label: "Vehicles" },
    { id: "housing", label: "Home & Furniture" },
    { id: "books", label: "Books & Courseware" },
  ];

  return (
    <div className="w-full flex flex-col gap-7 pb-12">
      {/* ── Humanized Marketplace Banner ──────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800 flex justify-between items-center gap-6 flex-wrap">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex gap-2 items-center">
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              Marketplace
            </span>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              Verified Community Sellers & Local Meetups
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Buy, Sell & Discover with <span className="text-zinc-100 underline decoration-zinc-600 underline-offset-4">Community Trust</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Local distance matching, verified campus exchange points, direct buyer-seller messaging, and zero hidden platform fees.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          <span>List an Item</span>
        </button>
      </div>

      {/* ── Search & Filter Tabs ──────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <div className="flex-1 min-w-[260px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search electronics, furniture, books, gear..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-900/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                category === c.id
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading State ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      )}

      {/* ── Product Listings Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((item) => {
          const isSaved = !!savedMap[item.id];
          const sellerName = item.seller?.profile?.displayName || item.seller?.profile?.username || "Seller";
          const sellerAvatar = item.seller?.profile?.avatar;
          const sellerTier = item.seller?.sellerTier || "BRONZE";
          const rating = item.seller?.rating || 5.0;
          const sales = item.seller?.salesCount || 10;
          const isGold = sellerTier === "GOLD";

          return (
            <div
              key={item.id}
              className="bg-zinc-900/50 rounded-2xl overflow-hidden flex flex-col justify-between border border-zinc-800 hover:border-zinc-700 transition-all group shadow-sm"
            >
              {/* Product Photo Canvas */}
              <div className="h-52 w-full relative overflow-hidden bg-zinc-950">
                {item.images && item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20" />

                {/* Top Tags */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {item.tag && (
                    <span className="bg-black/75 backdrop-blur-md text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                      {item.tag}
                    </span>
                  )}
                </div>

                {/* Wishlist Heart */}
                <button
                  onClick={() => toggleSave(item.id)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:scale-105 transition-transform"
                >
                  <Heart
                    size={14}
                    className={isSaved ? "text-rose-500 fill-rose-500" : "text-white"}
                  />
                </button>

                {/* Price & Condition Badge */}
                <div className="absolute bottom-3 left-3.5 flex items-center gap-2">
                  <span className="bg-zinc-950/90 backdrop-blur-md text-emerald-400 text-sm font-bold px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    ${item.price.toLocaleString()}
                  </span>
                  <span className="bg-zinc-950/80 backdrop-blur-md text-zinc-400 text-[11px] font-medium px-2 py-0.5 rounded-md">
                    {item.condition.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Product Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  {item.specs ? (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.specs}</p>
                  ) : item.description ? (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.description}</p>
                  ) : null}

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                      <MapPin size={13} className="text-zinc-500" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Seller Dock & Chat Action */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                      {sellerAvatar ? (
                        <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                      ) : (
                        sellerName[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{sellerName}</p>
                      <SellerTierBadge tier={sellerTier} salesCount={sales} rating={rating} />
                    </div>
                  </div>

                  <Link
                    href="/messages"
                    className="h-7 px-3 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
                  >
                    <MessageCircle size={13} />
                    <span>Chat</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
