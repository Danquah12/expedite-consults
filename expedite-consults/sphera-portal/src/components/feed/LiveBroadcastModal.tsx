"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Radio,
  Heart,
  MessageCircle,
  Gift,
  Share2,
  Users,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Video,
  VideoOff
} from "lucide-react";
import { LiveStreamItem } from "@/lib/feed-store";

interface LiveBroadcastModalProps {
  isOpen: boolean;
  stream: LiveStreamItem | null;
  onClose: () => void;
  onSendGift: (giftName: string, recipient: string) => void;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  avatar: string;
  isGift?: boolean;
}

export function LiveBroadcastModal({
  isOpen,
  stream,
  onClose,
  onSendGift,
}: LiveBroadcastModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(stream?.viewerCount || 4230);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", user: "Marcus Johnson", text: "Audio sounds super crisp today! 🔥", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { id: "m2", user: "Zara Williams", text: "Can you explain the state synchronization again? 👏", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
    { id: "m3", user: "Elena Vasquez", text: "Sending love from College Park campus! 🚀", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time viewer count fluctuation & simulated active chat
  useEffect(() => {
    if (!isOpen) return;

    const viewerInterval = setInterval(() => {
      setViewerCount((prev) => Math.max(10, prev + Math.floor(Math.random() * 7) - 3));
    }, 3000);

    const simulatedChat = [
      "This architecture is insane! 💯",
      "SpheraNet live streaming is so smooth 🔥",
      "Greetings from the robotics lab! 🤖",
      "Just sent 1,000 Diamonds! 💎✨",
      "Can we get a quick shoutout? 🙌",
      "Will this recording be available on Reels later? 🎬",
    ];

    const chatInterval = setInterval(() => {
      const randomText = simulatedChat[Math.floor(Math.random() * simulatedChat.length)];
      const names = ["Alex Rivera", "Samson K.", "Tasha B.", "Chloe Bennett", "Jordan Miller"];
      const randomName = names[Math.floor(Math.random() * names.length)];

      setMessages((prev) => [
        ...prev.slice(-20),
        {
          id: `m-${Date.now()}`,
          user: randomName,
          text: randomText,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
        },
      ]);
    }, 4000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [isOpen]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        user: "Kwesi Asiedu (You)",
        text: chatInput.trim(),
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      },
    ]);
    setChatInput("");
  };

  const handleHeartBurst = () => {
    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  if (!isOpen || !stream) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-[#121318] border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 relative">
        
        {/* Floating Heart Reactions Animation */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              className="absolute bottom-16 animate-float-up text-2xl"
              style={{ left: `${h.left}%` }}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* Left Side: Live Broadcast Stream Video */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] md:min-h-[520px] overflow-hidden">
          {/* Stream Graphic / Video */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.streamUrl || stream.avatar}
            alt={stream.title}
            className="w-full h-full object-cover max-h-[520px]"
          />

          {/* Gradient Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Top Broadcaster Status Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-rose-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stream.avatar} alt={stream.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{stream.name}</span>
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black rounded-sm animate-pulse">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 block">{stream.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono font-bold text-rose-400">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>{viewerCount.toLocaleString()} viewers</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stream Title Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 max-w-[85%]">
              <h4 className="text-xs font-black text-white">{stream.title}</h4>
              <p className="text-[10px] text-zinc-400">Broadcasting live on Sphera Sovereign Network</p>
            </div>
          </div>
        </div>

        {/* Right Side: Real-Time Live Chat & Creator Sparks Drawer */}
        <div className="w-full md:w-[360px] p-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800 bg-[#141517]">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-black text-white">Live Broadcast Chat</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Rolling Chat Stream */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 max-h-[360px]">
            {messages.map((m) => (
              <div key={m.id} className="flex gap-2 items-start text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.avatar} alt={m.user} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/40">
                  <span className="font-bold text-pink-400 text-[11px] block">{m.user}</span>
                  <p className="text-zinc-200 text-xs mt-0.5">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gift & Spark Quick Bar */}
          <div className="pt-2 pb-2 flex items-center justify-between border-t border-zinc-800 gap-1.5">
            <button
              onClick={() => onSendGift("💎 1,000 Diamonds", stream.username)}
              className="flex-1 py-2 px-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1 shadow-md hover:scale-105 transition"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Send 1,000 💎</span>
            </button>
            <button
              onClick={handleHeartBurst}
              className="w-10 h-10 rounded-xl bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transition active:scale-90"
              title="Send Live Heart Reaction"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              placeholder="Send live chat message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              onClick={handleSendChat}
              className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-xl shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
