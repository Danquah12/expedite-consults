"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  Repeat2,
  MessageCircle,
  Sparkles,
  UserPlus,
  BookOpen,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";
import { initialLiveStreams } from "@/lib/feed-store";

interface NotificationItem {
  id: string;
  type: "like" | "repost" | "reply" | "follow" | "gospel";
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  targetContent?: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "like",
    user: {
      name: "Pastor David Osei",
      username: "pastordavid",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
    },
    text: "liked your scripture reflection on 2 Corinthians 12:9",
    targetContent: "When you feel like you are at the end of your strength, remember that God's grace is perfected...",
    time: "15m",
    read: false,
  },
  {
    id: "n2",
    type: "gospel",
    user: {
      name: "Sarah Mensah",
      username: "sarah_m",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
    },
    text: "prayed for your request: 'Midterm Exams & Mental Clarity'",
    time: "1h",
    read: false,
  },
  {
    id: "n3",
    type: "repost",
    user: {
      name: "Amara Diallo",
      username: "amara_creates",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
    },
    text: "reposted your collegiate tech update",
    targetContent: "Just pushed the real-time shuttle GPS and dining capacity tracker to Towson and UMD portals...",
    time: "2h",
    read: true,
  },
  {
    id: "n4",
    type: "follow",
    user: {
      name: "Michael Adjei",
      username: "madjei",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verified: true,
    },
    text: "started following you",
    time: "4h",
    read: true,
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "VERIFIED" | "MENTIONS">("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "VERIFIED") return n.user.verified;
    if (activeTab === "MENTIONS") return n.type === "reply";
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
        {/* LEFT NAVIGATION RAIL */}
        <aside className="w-16 sm:w-20 xl:w-[275px] h-screen sticky top-0 flex-shrink-0 border-r border-neutral-800/80 z-30">
          <XLeftNav
            activeTab="NOTIFICATIONS"
            onSelectTab={() => {}}
            onOpenCompose={() => {}}
          />
        </aside>

        {/* CENTER TIMELINE */}
        <main className="flex-1 max-w-[620px] min-h-screen border-r border-neutral-800/80">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800/80">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-black text-white tracking-tight">Notifications</h1>
              <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 text-center border-t border-neutral-800/50">
              {(["ALL", "VERIFIED", "MENTIONS"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative py-3 text-sm font-bold transition hover:bg-white/5"
                >
                  <span className={activeTab === tab ? "text-white" : "text-neutral-500 font-medium"}>
                    {tab === "ALL" ? "All" : tab === "VERIFIED" ? "Verified" : "Mentions"}
                  </span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-amber-400 rounded-full shadow-md shadow-amber-400/50" />
                  )}
                </button>
              ))}
            </div>
          </header>

          {/* Notifications Feed List */}
          <div className="divide-y divide-neutral-900">
            {filteredNotifs.map((notif) => {
              const Icon =
                notif.type === "like"
                  ? Heart
                  : notif.type === "repost"
                  ? Repeat2
                  : notif.type === "gospel"
                  ? Sparkles
                  : notif.type === "follow"
                  ? UserPlus
                  : MessageCircle;

              const iconColor =
                notif.type === "like"
                  ? "text-rose-500 fill-rose-500/20"
                  : notif.type === "repost"
                  ? "text-emerald-500"
                  : notif.type === "gospel"
                  ? "text-amber-400"
                  : "text-sky-400";

              return (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-4 ${
                    !notif.read ? "bg-amber-500/[0.03]" : ""
                  }`}
                >
                  <div className="pt-0.5">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={notif.user.avatar}
                        alt={notif.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {notif.user.name}
                        {notif.user.verified && <span className="text-amber-400">✓</span>}
                      </span>
                      <span className="text-xs text-neutral-400">{notif.text}</span>
                      <span className="text-[11px] text-neutral-500 ml-auto font-mono">{notif.time}</span>
                    </div>

                    {notif.targetContent && (
                      <p className="text-xs text-neutral-400 pl-10 line-clamp-2 italic">
                        "{notif.targetContent}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT TRENDING SIDEBAR */}
        <aside className="hidden lg:block w-[350px] xl:w-[390px] sticky top-0 h-screen p-4 flex-shrink-0">
          <XTrendingSidebar
            liveStreams={initialLiveStreams}
            onWatchLive={() => {}}
            onFollowUser={() => {}}
          />
        </aside>
      </div>
    </div>
  );
}
