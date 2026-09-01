"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  ShoppingBag,
  Briefcase,
  Calendar,
  AtSign,
  Star,
  Check,
  CheckCheck,
  Settings,
  Filter,
  X,
  Sparkles,
  Globe,
  Loader2,
} from "lucide-react";
import type { NotificationWithActor } from "@/types";

interface NotificationItem {
  id: string;
  type: string;
  actor: { name: string; username: string; initial: string; avatar?: string };
  message: string;
  timeAgo: string;
  isRead: boolean;
  preview?: string;
}

const fallbackNotifications: NotificationItem[] = [
  { id: "n1", type: "FRIEND_REQUEST", actor: { name: "Elena Vasquez", username: "elena_v", initial: "E", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" }, message: "sent you a friend request.", timeAgo: "2m ago", isRead: false },
  { id: "n2", type: "POST_LIKE", actor: { name: "Amara Diallo", username: "amara_creates", initial: "A", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }, message: "liked your post.", timeAgo: "15m ago", isRead: false, preview: "Just shipped the biggest platform feature of my career 🚀" },
  { id: "n3", type: "POST_COMMENT", actor: { name: "Marcus Johnson", username: "mj_tech", initial: "M", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }, message: "commented: \"This is incredible! How long did this take?\"", timeAgo: "1h ago", isRead: false },
  { id: "n4", type: "ALERT_MATCH", actor: { name: "Sphera AI", username: "sphera_ai", initial: "🤖" }, message: "Found a deal matching your wishlist: PS5 under $400 in Silver Spring, MD.", timeAgo: "2h ago", isRead: false },
  { id: "n5", type: "FOLLOW", actor: { name: "Priya Sharma", username: "priya_s", initial: "P", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }, message: "started following your creator channel.", timeAgo: "3h ago", isRead: true },
  { id: "n6", type: "MENTION", actor: { name: "Kai Nakamura", username: "kai.dev", initial: "K", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }, message: "mentioned you in a comment in Tech Minds DC.", timeAgo: "5h ago", isRead: true },
  { id: "n7", type: "ORDER_UPDATE", actor: { name: "Sphera Bazaar", username: "bazaar", initial: "🛒" }, message: "Your order for Sony WH-1000XM5 has been confirmed!", timeAgo: "1d ago", isRead: true },
  { id: "n8", type: "EVENT_INVITE", actor: { name: "Zara Williams", username: "zara.w", initial: "Z", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }, message: "invited you to UMD Hackathon Kickoff.", timeAgo: "1d ago", isRead: true },
];

const FILTER_TABS = ["All", "Unread", "Requests", "Social", "Bazaar"] as const;
type FilterTab = typeof FILTER_TABS[number];

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("All");
  const [localNotifications, setLocalNotifications] = useState(fallbackNotifications);

  const { data: dbData, isLoading } = useQuery<{ notifications: NotificationWithActor[]; unreadCount: number }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (!json.success) return { notifications: [], unreadCount: 0 };
      return json.data;
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    },
  });

  const notifications = localNotifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const dismiss = (id: string) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "Unread") return !n.isRead;
    if (filter === "Requests") return n.type === "FRIEND_REQUEST";
    if (filter === "Social") return ["POST_LIKE", "POST_COMMENT", "FOLLOW", "MENTION"].includes(n.type);
    if (filter === "Bazaar") return ["MARKETPLACE_INQUIRY", "ORDER_UPDATE", "ALERT_MATCH"].includes(n.type);
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-12">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#1c202e] pb-4">
        <div>
          <h1 className="text-xl font-black text-white">Notifications</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="h-8 px-3 rounded-xl bg-[#161924] border border-[#1c202e] text-[#00d4ff] text-xs font-bold hover:bg-[#00d4ff]/10 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* ── Filter Pills ─────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filter === tab
                ? "bg-[#00d4ff] text-[#08090d] shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                : "bg-[#10121a] text-[#94a3b8] border border-[#1c202e] hover:text-white"
            }`}
          >
            {tab}
            {tab === "Unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification Cards List ──────────────────────────────── */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#10121a] border border-[#1c202e] rounded-3xl p-8">
            <Bell size={36} className="mx-auto mb-3 text-[#64748b] opacity-40" />
            <p className="text-xs font-bold text-[#94a3b8]">No notifications in this tab</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                notif.isRead
                  ? "bg-[#10121a] border-[#1c202e] opacity-80 hover:opacity-100"
                  : "bg-[#161d2d] border-[#00d4ff]/30 shadow-[0_0_15px_rgba(0,212,255,0.06)]"
              }`}
            >
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                {notif.actor.avatar ? (
                  <img src={notif.actor.avatar} alt={notif.actor.name} className="w-full h-full object-cover" />
                ) : (
                  notif.actor.initial
                )}
              </div>

              {/* Content Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#e2e8f0] leading-snug">
                  <strong className="text-white font-bold">{notif.actor.name}</strong>{" "}
                  {notif.message}
                </p>

                {notif.preview && (
                  <p className="text-[11px] text-[#94a3b8] mt-1 truncate">
                    &ldquo;{notif.preview}&rdquo;
                  </p>
                )}

                <p className="text-[10px] text-[#64748b] font-semibold mt-1">
                  {notif.timeAgo}
                </p>
              </div>

              {/* Actions for Friend Requests */}
              {notif.type === "FRIEND_REQUEST" && !notif.isRead && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(notif.id);
                    }}
                    className="h-7 px-3 rounded-lg bg-[#00d4ff] text-[#08090d] text-[11px] font-black hover:scale-105 transition-transform"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(notif.id);
                    }}
                    className="h-7 px-2.5 rounded-lg bg-[#161924] text-[#94a3b8] border border-[#1c202e] text-[11px] font-bold hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Unread Indicator */}
              {!notif.isRead && notif.type !== "FRIEND_REQUEST" && (
                <span className="h-2 w-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff] flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
