"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  Code,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { FeedPost } from "@/lib/feed-store";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
  onShareCompleted?: (platform: string) => void;
}

export function ShareModal({ isOpen, onClose, post, onShareCompleted }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  if (!isOpen || !post) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://portal.expediteconsults.com";
  const postUrl = `${origin}/feed?postId=${post.id}`;
  const shareText = `Check out "${post.content.slice(0, 80)}..." by @${post.author.username} on SpheraNet!`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(shareText);

  // Social Sharing Targets
  const shareTargets = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.354.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.348 21.652l4.636-1.04A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.492-4.404-1.336l-.315-.21-2.753.618.63-2.683-.231-.328A8.212 8.212 0 013.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
        </svg>
      ),
      bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, "_blank"),
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-6 h-6 fill-current text-blue-500" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"),
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-6 h-6 fill-current text-sky-400" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300",
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank"),
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-6 h-6 fill-current text-pink-400" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      bg: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30 text-pink-300",
      action: async () => {
        // Copy TikTok formatted caption with hashtags and open TikTok
        const tiktokText = `${post.content}\n\n${(post.hashtags || ['#SpheraViral', '#FYP']).join(' ')}\n\nWatch on Sphera: ${postUrl}`;
        await navigator.clipboard.writeText(tiktokText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        window.open("https://www.tiktok.com/upload?lang=en", "_blank");
      },
    },
    {
      name: "X (Twitter)",
      icon: (
        <svg className="w-6 h-6 fill-current text-zinc-100" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: "bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-200",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank"),
    },
    {
      name: "Telegram",
      icon: (
        <svg className="w-6 h-6 fill-current text-cyan-400" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
        </svg>
      ),
      bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank"),
    },
    {
      name: "Reddit",
      icon: (
        <svg className="w-6 h-6 fill-current text-orange-500" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703z"/>
        </svg>
      ),
      bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-300",
      action: () => window.open(`https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`, "_blank"),
    },
    {
      name: "Email",
      icon: (
        <svg className="w-6 h-6 fill-current text-violet-400" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30 text-violet-300",
      action: () => window.open(`mailto:?subject=${encodeURIComponent("Watch " + post.author.name + " on SpheraNet")}&body=${encodedText}%0A%0A${encodedUrl}`, "_blank"),
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      if (onShareCompleted) onShareCompleted("link_copy");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${post.author.name} on SpheraNet`,
          text: shareText,
          url: postUrl,
        });
        if (onShareCompleted) onShareCompleted("native_share");
      } catch (err) {
        console.warn("Native share canceled:", err);
      }
    }
  };

  const handleDownloadVideo = () => {
    const videoSrc = post.videoUrl || post.imageUrl;
    if (!videoSrc) return;
    const a = document.createElement("a");
    a.href = videoSrc;
    a.download = `sphera_${post.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onShareCompleted) onShareCompleted("download");
  };

  const embedCode = `<iframe src="${postUrl}&embed=true" width="360" height="640" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#121318] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-black text-white">Share to Community & Socials</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Post Preview Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate">{post.author.name}</span>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{post.content}</p>
            </div>
          </div>

          {/* Social Platform Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Direct Social Share</label>
            <div className="grid grid-cols-4 gap-3">
              {shareTargets.map((target) => (
                <button
                  key={target.name}
                  onClick={() => {
                    target.action();
                    if (onShareCompleted) onShareCompleted(target.name.toLowerCase());
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition transform hover:scale-105 active:scale-95 ${target.bg}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">{target.icon}</div>
                  <span className="text-[10px] font-bold mt-1 text-zinc-200">{target.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link Copy Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Share Link</label>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 pl-3">
              <span className="text-xs text-zinc-400 truncate flex-1 font-mono">{postUrl}</span>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extra Advanced Actions: Native App Share, Download, Embed */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                onClick={handleNativeShare}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-800 transition"
              >
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>Device Share</span>
              </button>
            )}

            <button
              onClick={handleDownloadVideo}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-800 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Save Media</span>
            </button>

            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-800 transition col-span-2"
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span>{showEmbed ? "Hide Embed Snippet" : "Get Embed Code"}</span>
            </button>
          </div>

          {/* Embed Code Snippet Drawer */}
          {showEmbed && (
            <div className="p-3 bg-black/60 rounded-2xl border border-zinc-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Embed HTML</span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(embedCode);
                    setCopiedEmbed(true);
                    setTimeout(() => setCopiedEmbed(false), 2500);
                  }}
                  className="text-[10px] text-pink-400 hover:underline font-bold"
                >
                  {copiedEmbed ? "Copied!" : "Copy Snippet"}
                </button>
              </div>
              <textarea
                readOnly
                value={embedCode}
                className="w-full h-16 bg-zinc-950 text-[10px] font-mono text-zinc-300 p-2 rounded-xl resize-none border border-zinc-800 focus:outline-none"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
