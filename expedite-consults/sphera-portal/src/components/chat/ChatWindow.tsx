"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  ChevronLeft,
  Loader2,
  CheckCheck,
  Play,
  Pause,
  Reply,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getPusherClient, pusherChannels, pusherEvents } from "@/lib/pusher";
import { formatRelativeTime } from "@/lib/utils";
import type { ConversationWithDetails, MessageWithSender } from "@/types";

interface ChatWindowProps {
  conversation: ConversationWithDetails;
  currentUserId?: string;
  onBack?: () => void;
}

const quickEmojis = ["❤️", "🔥", "👍", "😂", "😮", "👏"];

export function ChatWindow({ conversation, currentUserId, onBack }: ChatWindowProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation messages
  const { data: messageData, isLoading } = useQuery<{
    messages: MessageWithSender[];
    nextCursor: string | null;
  }>({
    queryKey: ["conversation-messages", conversation.id],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversation.id}/messages?limit=50`);
      const json = await res.json();
      if (!json.success) return { messages: [], nextCursor: null };
      return json.data;
    },
    refetchOnWindowFocus: false,
  });

  const [messages, setMessages] = useState<MessageWithSender[]>([]);

  useEffect(() => {
    if (messageData?.messages) {
      setMessages(messageData.messages);
    }
  }, [messageData]);

  // Mark conversation as read on load
  useEffect(() => {
    fetch(`/api/conversations/${conversation.id}/read`, { method: "POST" }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [conversation.id, queryClient]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Real-time Pusher WebSockets listener
  useEffect(() => {
    let client: any;
    let channel: any;

    try {
      client = getPusherClient();
      const channelName = pusherChannels.conversation(conversation.id);
      channel = client.subscribe(channelName);

      channel.bind(pusherEvents.newMessage, (newMsg: MessageWithSender) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      });

      channel.bind(
        pusherEvents.messageReaction,
        ({ messageId, userId, emoji, action }: { messageId: string; userId: string; emoji: string; action: string }) => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== messageId) return m;
              const reactions =
                action === "added"
                  ? [...m.reactions, { id: `${messageId}-${userId}-${emoji}`, emoji, userId, createdAt: new Date() }]
                  : m.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji));
              return { ...m, reactions };
            })
          );
        }
      );

      channel.bind(pusherEvents.userTyping, ({ userId, name }: { userId: string; name: string }) => {
        if (userId === currentUserId) return;
        setTypingUsers((prev) => [...new Set([...prev, name])]);
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((n) => n !== name));
        }, 3000);
      });
    } catch {
      // Pusher graceful fallback
    }

    return () => {
      if (client && channel) {
        client.unsubscribe(pusherChannels.conversation(conversation.id));
      }
    };
  }, [conversation.id, currentUserId, scrollToBottom]);

  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: { content?: string; mediaUrl?: string; type?: string; replyToId?: string }) => {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInput("");
      setReplyTo(null);
      scrollToBottom();
    },
  });

  // Reaction Mutation
  const reactMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await fetch(`/api/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate({
      content: input.trim(),
      type: "TEXT",
      replyToId: replyTo?.id,
    });
  };

  const handleSendVoiceNote = () => {
    sendMutation.mutate({
      content: "Voice note (0:15)",
      type: "AUDIO",
      mediaUrl: "https://actions.google.com/sounds/v1/water/air_woosh_underwater.ogg",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.data?.url) {
        sendMutation.mutate({
          mediaUrl: json.data.url,
          type: file.type.startsWith("image/") ? "IMAGE" : "FILE",
          content: file.name,
        });
      }
    } catch {
      // Non-blocking
    } finally {
      setUploading(false);
    }
  };

  const otherParticipant = conversation.participants.find((p) => p.userId !== currentUserId);
  const isGroup = conversation.type === "GROUP";
  const title = isGroup
    ? conversation.name || "Group Chat"
    : otherParticipant?.user?.profile?.displayName || otherParticipant?.user?.profile?.username || "Sphera User";
  const avatar = isGroup ? conversation.avatarUrl : otherParticipant?.user?.profile?.avatar;

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#10121a] h-full relative">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-[#1c202e] flex items-center justify-between bg-[#0d0f17]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden text-[#94a3b8] hover:text-white">
              <ChevronLeft size={20} />
            </button>
          )}

          <Avatar name={title} src={avatar || undefined} size="md" />

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white">{title}</h3>
              {otherParticipant?.user?.profile?.isVerified && (
                <span className="text-[#00d4ff] text-xs">✓</span>
              )}
            </div>
            <p className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Active on Sphera
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages Stream ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          const senderName = m.sender?.profile?.displayName || m.sender?.profile?.username || "User";

          // Group reactions by emoji count
          const reactionCounts = m.reactions.reduce((acc: Record<string, number>, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          }, {});

          return (
            <div
              key={m.id}
              className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
            >
              {/* Sender name for group chats */}
              {isGroup && !isMe && (
                <span className="text-[10px] text-[#64748b] ml-1 mb-1 font-semibold">{senderName}</span>
              )}

              {/* Reply Quote Header */}
              {m.replyTo && (
                <div
                  className={`text-[10px] px-3 py-1 mb-1 rounded-lg bg-[#161924] border border-[#1c202e] text-[#94a3b8] max-w-sm truncate ${
                    isMe ? "mr-1" : "ml-1"
                  }`}
                >
                  <span className="font-bold text-[#00d4ff] mr-1">
                    {m.replyTo.sender?.profile?.displayName || "Reply"}:
                  </span>
                  {m.replyTo.content}
                </div>
              )}

              {/* Bubble Container */}
              <div className="relative max-w-[480px]">
                {/* Media Image */}
                {m.type === "IMAGE" && m.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden mb-1 border border-[#1c202e] max-h-72">
                    <img src={m.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Voice Note Audio Player */}
                {m.type === "AUDIO" ? (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                      isMe
                        ? "bg-[#00d4ff] text-[#08090d]"
                        : "bg-[#161924] text-white border border-[#1c202e]"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setActiveVoicePlaying(activeVoicePlaying === m.id ? null : m.id)
                      }
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isMe ? "bg-black/20 text-black" : "bg-[#00d4ff] text-[#0a0f1e]"
                      }`}
                    >
                      {activeVoicePlaying === m.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-4">
                        {[12, 24, 16, 32, 20, 28, 14, 26, 18, 30].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${isMe ? "bg-black/40" : "bg-[#00d4ff]/60"}`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-80 mt-1 block">0:15 Voice Note</span>
                    </div>
                  </div>
                ) : (
                  /* Standard Text Message */
                  m.content && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                        isMe
                          ? "bg-[#00d4ff] text-[#08090d] font-bold rounded-br-sm shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                          : "bg-[#161924] text-white rounded-bl-sm border border-[#1c202e]"
                      }`}
                    >
                      {m.content}
                    </div>
                  )
                )}

                {/* Hover Action Menu (Emoji reactions + Reply) */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#161924] border border-[#1c202e] rounded-full px-2 py-1 shadow-lg z-20 ${
                    isMe ? "-left-36" : "-right-36"
                  }`}
                >
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactMutation.mutate({ messageId: m.id, emoji })}
                      className="hover:scale-125 transition-transform text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setReplyTo(m)}
                    className="text-[#94a3b8] hover:text-white ml-1"
                  >
                    <Reply size={12} />
                  </button>
                </div>
              </div>

              {/* Reaction Badges */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 px-1">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      onClick={() => reactMutation.mutate({ messageId: m.id, emoji })}
                      className="inline-flex items-center gap-1 bg-[#161924] border border-[#1c202e] px-1.5 py-0.5 rounded-full text-[10px] text-white cursor-pointer hover:border-[#00d4ff]"
                    >
                      <span>{emoji}</span>
                      <span className="text-[9px] text-[#64748b]">{count}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Timestamp & Read Status */}
              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[#64748b]">
                <span>{formatRelativeTime(m.createdAt)}</span>
                {isMe && <CheckCheck size={12} className="text-[#00d4ff]" />}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#64748b] italic py-1">
            <span className="h-2 w-2 rounded-full bg-[#00d4ff] animate-ping" />
            <span>{typingUsers.join(", ")} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply Preview Banner ─────────────────────────────── */}
      {replyTo && (
        <div className="px-5 py-2 bg-[#161924] border-t border-[#1c202e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Reply size={14} className="text-[#00d4ff]" />
            <span className="text-[#94a3b8]">
              Replying to{" "}
              <strong className="text-white">
                {replyTo.sender?.profile?.displayName || "message"}
              </strong>
              : {replyTo.content}
            </span>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-[#64748b] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Bottom Input Bar ─────────────────────────────────── */}
      <div className="p-4 border-t border-[#1c202e] bg-[#0d0f17]/80 backdrop-blur-md">
        <div className="bg-[#161924] border border-[#1c202e] rounded-2xl px-4 py-2 flex items-center gap-3">
          {/* File attachment picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[#64748b] hover:text-white transition-colors"
          >
            {uploading ? <Loader2 size={16} className="animate-spin text-[#00d4ff]" /> : <Paperclip size={16} />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Text Input */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Send a message or voice note..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-[#64748b] outline-none"
          />

          {/* Quick Voice Note */}
          <button
            onClick={handleSendVoiceNote}
            className="text-[#64748b] hover:text-[#00d4ff] transition-colors"
            title="Record Voice Note"
          >
            <Mic size={16} />
          </button>

          {/* Send Action */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#0284c7] text-[#08090d] flex items-center justify-center font-bold disabled:opacity-30 hover:scale-105 transition-transform"
          >
            {sendMutation.isPending ? (
              <Loader2 size={13} className="animate-spin text-[#0a0f1e]" />
            ) : (
              <Send size={13} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
