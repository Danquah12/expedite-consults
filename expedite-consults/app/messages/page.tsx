"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Settings,
  Mail,
  Send,
  Image as ImageIcon,
  Smile,
  Heart,
  MoreVertical,
  CheckCheck,
  Plus,
  ArrowLeft,
  User,
  Shield,
  Sparkles,
} from "lucide-react";
import { XLeftNav } from "@/components/feed/XLeftNav";
import { XTrendingSidebar } from "@/components/feed/XTrendingSidebar";
import { initialLiveStreams } from "@/lib/feed-store";

interface MessageItem {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  badgeType?: "blue" | "gold" | "gospel" | "campus";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online?: boolean;
  messages: MessageItem[];
}

const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Pastor David Osei",
    username: "pastordavid",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true,
    badgeType: "gospel",
    lastMessage: "God bless you Kwesi! Looking forward to Friday fellowship at Stamp.",
    lastMessageTime: "12m",
    unreadCount: 1,
    online: true,
    messages: [
      { id: "m1", senderId: "pastordavid", text: "Peace and grace to you Kwesi!", time: "10:30 AM", isMe: false },
      { id: "m2", senderId: "me", text: "Thank you Pastor David! Really appreciated your message on 2 Corinthians 12.", time: "10:32 AM", isMe: true },
      { id: "m3", senderId: "pastordavid", text: "God bless you Kwesi! Looking forward to Friday fellowship at Stamp.", time: "10:35 AM", isMe: false },
    ],
  },
  {
    id: "c2",
    name: "Dr. Evelyn Reed (UMD CS)",
    username: "ereed_umd",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    verified: true,
    badgeType: "campus",
    lastMessage: "Your distributed ledger analysis proposal looks solid. Office hours tomorrow 2pm.",
    lastMessageTime: "1h",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "m4", senderId: "me", text: "Dr. Reed, submitted the draft proposal for the consensus algorithm comparison.", time: "9:15 AM", isMe: true },
      { id: "m5", senderId: "ereed_umd", text: "Your distributed ledger analysis proposal looks solid. Office hours tomorrow 2pm.", time: "9:45 AM", isMe: false },
    ],
  },
  {
    id: "c3",
    name: "Sarah Mensah",
    username: "sarah_m",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verified: true,
    badgeType: "blue",
    lastMessage: "Did you finish the biochemistry study guide for Cook Library session?",
    lastMessageTime: "3h",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m6", senderId: "sarah_m", text: "Hey! Are we still meeting at Cook Library on 3rd floor?", time: "Yesterday", isMe: false },
      { id: "m7", senderId: "me", text: "Yes! 4:00 PM right by the quiet study pods.", time: "Yesterday", isMe: true },
      { id: "m8", senderId: "sarah_m", text: "Did you finish the biochemistry study guide for Cook Library session?", time: "Yesterday", isMe: false },
    ],
  },
  {
    id: "c4",
    name: "Michael Adjei",
    username: "madjei",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    verified: true,
    badgeType: "blue",
    lastMessage: "That new CeCe Winans acoustic worship stream on Gospel Music is incredible!",
    lastMessageTime: "5h",
    unreadCount: 0,
    online: true,
    messages: [
      { id: "m9", senderId: "madjei", text: "That new CeCe Winans acoustic worship stream on Gospel Music is incredible!", time: "5h ago", isMe: false },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvoId, setSelectedConvoId] = useState<string>("c1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversation = conversations.find((c) => c.id === selectedConvoId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: MessageItem = {
      id: `msg_${Date.now()}`,
      senderId: "me",
      text: inputText.trim(),
      time: "Just now",
      isMe: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConvoId) {
          return {
            ...c,
            lastMessage: inputText.trim(),
            lastMessageTime: "Just now",
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );
    setInputText("");
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="max-w-[1300px] mx-auto flex justify-center min-h-screen">
        {/* LEFT NAVIGATION RAIL */}
        <aside className="w-16 sm:w-20 xl:w-[275px] h-screen sticky top-0 flex-shrink-0 border-r border-neutral-800/80 z-30">
          <XLeftNav
            activeTab="MESSAGES"
            onSelectTab={() => {}}
            onOpenCompose={() => {}}
          />
        </aside>

        {/* CENTER COLUMN: CONVERSATION LIST (TWITTER / X DM LAYOUT) */}
        <div className="w-full sm:w-[380px] xl:w-[400px] min-h-screen border-r border-neutral-800/80 flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800/80 p-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-white tracking-tight">Messages</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 text-amber-400 transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-neutral-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Direct Messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
            {filteredConversations.map((convo) => {
              const isSelected = convo.id === selectedConvoId;
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all hover:bg-white/5 ${
                    isSelected ? "bg-white/10 border-r-2 border-amber-400" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={convo.avatar}
                      alt={convo.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                    {convo.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {convo.name}
                        </span>
                        {convo.verified && (
                          <span className="text-xs text-amber-400">✓</span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium flex-shrink-0">
                        {convo.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 truncate">
                      {convo.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION WINDOW */}
        <main className="hidden sm:flex flex-1 flex-col min-h-screen">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-neutral-800/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-white">
                        {activeConversation.name}
                      </h2>
                      {activeConversation.verified && (
                        <span className="text-xs text-amber-400">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      @{activeConversation.username} &middot; {activeConversation.online ? "Active now" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Message Feed History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm space-y-1 shadow-sm ${
                        msg.isMe
                          ? "bg-amber-500 text-black font-medium rounded-br-none"
                          : "bg-neutral-800 text-white rounded-bl-none border border-white/10"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <div
                        className={`text-[10px] text-right font-mono ${
                          msg.isMe ? "text-amber-950 font-semibold" : "text-neutral-400"
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Composer Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800/80 bg-neutral-950">
                <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 focus-within:border-amber-400 transition-colors">
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-amber-400 transition-colors p-1"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-amber-400 transition-colors p-1"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Start a new message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none px-2"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 fill-black ml-0.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-2">
              <Mail className="w-12 h-12 text-neutral-600" />
              <h3 className="text-lg font-bold text-white">Select a message</h3>
              <p className="text-xs max-w-sm">
                Choose from your existing conversations, or start a new one with campus peers and faculty.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
