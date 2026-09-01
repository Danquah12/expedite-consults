"use client";

import { useState } from "react";
import { Search, ShieldCheck, Plus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  currentUserId?: string;
  onSelect: (c: ConversationWithDetails) => void;
  onOpenNew: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
  onOpenNew,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();

    if (c.type === "GROUP") {
      return (c.name || "Group Chat").toLowerCase().includes(term);
    }

    const otherParticipant = c.participants.find((p) => p.userId !== currentUserId);
    const name = otherParticipant?.user?.profile?.displayName || otherParticipant?.user?.profile?.username || "";
    return name.toLowerCase().includes(term);
  });

  return (
    <div className="w-full md:w-[340px] border-r border-[#1c202e] flex flex-col justify-between bg-[#0d0f17] h-full flex-shrink-0">
      {/* Top Header */}
      <div className="p-4 flex flex-col gap-3 border-b border-[#1c202e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-tight">SpheraChat</h2>
            <span className="text-[10px] font-bold text-[#00d4ff] bg-[#00d4ff]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={11} /> E2E
            </span>
          </div>

          <button
            onClick={onOpenNew}
            className="h-8 w-8 rounded-full bg-[#00d4ff] text-[#0a0f1e] flex items-center justify-center font-bold hover:bg-[#00bce0] transition-colors shadow-[0_0_12px_rgba(0,212,255,0.3)]"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#1c202e] bg-[#161924] text-white text-xs placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] transition-all"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 text-xs text-[#64748b]">
            {search ? "No conversations match your search" : "No conversations yet. Start a chat!"}
          </div>
        )}

        {filtered.map((c) => {
          const isSelected = selectedId === c.id;
          const isGroup = c.type === "GROUP";

          const otherParticipant = c.participants.find((p) => p.userId !== currentUserId);
          const name = isGroup
            ? c.name || "Group Chat"
            : otherParticipant?.user?.profile?.displayName || otherParticipant?.user?.profile?.username || "User";
          const avatar = isGroup
            ? c.avatarUrl
            : otherParticipant?.user?.profile?.avatar;
          const isVerified = otherParticipant?.user?.profile?.isVerified;

          const lastMsgText = c.lastMessage
            ? c.lastMessage.content || (c.lastMessage.mediaUrl ? "📷 Attachment" : "Sent a message")
            : "Started a new conversation";
          const time = c.lastMessage ? formatRelativeTime(c.lastMessage.createdAt) : "";

          return (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#161924] border border-[#00d4ff]/30 shadow-[0_0_15px_rgba(0,212,255,0.08)]"
                  : "border border-transparent hover:bg-[#161924]/60"
              }`}
            >
              {/* Avatar + Online presence */}
              <div className="relative flex-shrink-0">
                {isGroup ? (
                  <div className="h-11 w-11 rounded-full bg-[#1e293b] border border-[#1c202e] flex items-center justify-center text-[#00d4ff]">
                    <Users size={20} />
                  </div>
                ) : (
                  <Avatar name={name} src={avatar || undefined} size="md" />
                )}
                {!isGroup && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#0d0f17]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                    {isVerified && <span className="text-[#00d4ff] text-[10px]">✓</span>}
                  </div>
                  {time && <span className="text-[10px] text-[#64748b] flex-shrink-0">{time}</span>}
                </div>

                <p className={`text-[11px] truncate ${isSelected ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
                  {lastMsgText}
                </p>
              </div>

              {/* Unread badge */}
              {c.unreadCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#00d4ff] text-[#08090d] text-[10px] font-black flex items-center justify-center flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
