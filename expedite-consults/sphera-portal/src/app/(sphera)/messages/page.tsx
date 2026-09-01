"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewConversationModal } from "@/components/chat/NewConversationModal";
import type { ConversationWithDetails } from "@/types";

// Fallback conversation for zero-state demo
const fallbackConversations: ConversationWithDetails[] = [
  {
    id: "c_demo_1",
    type: "DM",
    name: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessageAt: new Date(),
    participants: [
      {
        id: "p1",
        userId: "u_amara",
        role: "MEMBER",
        lastReadAt: new Date(),
        user: {
          id: "u_amara",
          role: "CREATOR",
          profile: {
            username: "amara_creates",
            displayName: "Amara Diallo",
            avatar: null,
            bio: "Building future experiences",
            isVerified: true,
            profileVisibility: "PUBLIC",
          },
        },
      },
    ],
    lastMessage: {
      id: "m_demo_1",
      conversationId: "c_demo_1",
      senderId: "u_amara",
      content: "The new video cut looks insane! Shipping today 🚀",
      type: "TEXT",
      mediaUrl: null,
      replyToId: null,
      isEdited: false,
      createdAt: new Date(),
      sender: {
        id: "u_amara",
        role: "CREATOR",
        profile: {
          username: "amara_creates",
          displayName: "Amara Diallo",
          avatar: null,
          bio: null,
          isVerified: true,
          profileVisibility: "PUBLIC",
        },
      },
      reactions: [],
    },
    unreadCount: 1,
  },
];

export default function MessagesPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const { data: dbConversations, isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const conversations =
    dbConversations && dbConversations.length > 0
      ? dbConversations
      : fallbackConversations;

  // Active conversation defaults to first on desktop if none explicitly selected
  const activeConversation = selectedConversation || (conversations.length > 0 ? conversations[0] : null);

  return (
    <div className="w-full h-[calc(100vh-100px)] max-h-[860px] rounded-3xl overflow-hidden bg-[#10121a] border border-[#1c202e] flex shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      {/* ── Left Column: Conversation List ──────────────────────── */}
      <div className={`${selectedConversation ? "hidden md:flex" : "flex"} w-full md:w-auto h-full`}>
        <ConversationList
          conversations={conversations}
          selectedId={activeConversation?.id ?? null}
          currentUserId={currentUserId}
          onSelect={(c) => setSelectedConversation(c)}
          onOpenNew={() => setIsNewModalOpen(true)}
        />
      </div>

      {/* ── Right Column: Active Chat Stream ────────────────────── */}
      <div className={`${!selectedConversation ? "hidden md:flex" : "flex"} flex-1 h-full`}>
        {activeConversation ? (
          <ChatWindow
            key={activeConversation.id}
            conversation={activeConversation}
            currentUserId={currentUserId}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#10121a]">
            <div className="h-16 w-16 rounded-3xl bg-[#161924] border border-[#1c202e] flex items-center justify-center text-[#00d4ff] mb-4 shadow-[0_0_30px_rgba(0,212,255,0.15)]">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Your SpheraChat Inbox</h3>
            <p className="text-xs text-[#64748b] max-w-xs mb-6">
              Send private, end-to-end encrypted messages, voice notes, and media to anyone across the Sphera Universe.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#00d4ff] text-[#0a0f1e] font-bold text-xs shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:bg-[#00bce0] transition-all"
            >
              Start a Conversation
            </button>
          </div>
        )}
      </div>

      {/* ── New Conversation Dialog ─────────────────────────────── */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSelectConversation={(c) => setSelectedConversation(c)}
      />
    </div>
  );
}
