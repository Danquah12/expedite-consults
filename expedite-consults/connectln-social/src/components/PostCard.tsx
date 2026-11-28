"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react";
import { useConnectLn } from "./ConnectLnContext";
import { PostMediaArtwork, UserAvatar, VerifiedBadge } from "./ConnectLnArtwork";
import type { Post } from "@/lib/types";

function formatMetric(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }
  return String(value);
}

function renderRichText(text: string) {
  const parts = text.split(/(#[A-Za-z0-9_]+|@[A-Za-z0-9_]+|Digital Nomad)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("#")) {
      return (
        <Link
          key={idx}
          href={`/discover?tag=${encodeURIComponent(part)}`}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part === "Digital Nomad") {
      return (
        <Link
          key={idx}
          href={`/discover?tag=${encodeURIComponent("Digital Nomad")}`}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      return (
        <Link
          key={idx}
          href={`/profile/${handle}`}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function PostCard({ post }: { post: Post }) {
  const {
    users,
    currentUser,
    toggleLike,
    toggleRepost,
    toggleBookmark,
    addReply,
    settings,
  } = useConnectLn();

  const author = users[post.authorHandle];
  const [replyDrawerOpen, setReplyDrawerOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!author) return null;

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    const ok = await addReply(post.id, replyText.trim());
    setSendingReply(false);
    if (ok) {
      setReplyText("");
    }
  }

  function handleShare() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(`${window.location.origin}/profile/${author.handle}`)
        .catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article
      className={`border-b border-[#E5E7EB] bg-white transition hover:bg-[#FAFCFF] ${
        settings.compactFeed ? "px-4 py-3" : "px-4 py-4"
      }`}
    >
      <div className="flex gap-3">
        <Link href={`/profile/${author.handle}`} className="shrink-0">
          <UserAvatar
            variant={author.avatarVariant}
            name={author.name}
            size={42}
          />
        </Link>

        <div className="min-w-0 flex-1">
          {/* Post Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <Link
                href={`/profile/${author.handle}`}
                className="font-bold text-[#0F172A] hover:underline"
              >
                {author.name}
              </Link>
              {author.verified && <VerifiedBadge size={15} />}
              <Link
                href={`/profile/${author.handle}`}
                className="text-[#64748B]"
              >
                @{author.handle}
              </Link>
              <span className="text-[#94A3B8]">·</span>
              <span className="text-[#64748B]">{post.timeAgo}</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Post options"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
                  <Link
                    href={`/profile/${author.handle}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    View @{author.handle}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void toggleBookmark(post.id);
                      setMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    {post.bookmarked ? "Remove bookmark" : "Bookmark post"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleShare();
                      setMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    Copy link to post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Content (hidden when rendering full Keepsake Stationery Card below) */}
          {!post.cardAttachment && (
            <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-[1.55] text-[#0F172A]">
              {renderRichText(post.content)}
            </p>
          )}

          {/* Media Artwork */}
          {post.media && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
              <PostMediaArtwork kind={post.media} />
            </div>
          )}

          {/* Embedded Keepsake Greeting Card (Exact Vertical Keepsake Stationery Layout) */}
          {post.cardAttachment && (
            <div className="mt-3 mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-[#E5E0D8] bg-white shadow-sm">
              {/* 1. Top Navy Banner */}
              <div className="bg-[#1B2A4A] px-8 py-6 text-center">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[3px] text-[#B8935A]">
                  CONNECTLN KEEPSAKE
                </p>
                <h4 className="mt-2 font-serif text-[26px] font-semibold leading-tight text-white">
                  {post.cardAttachment.title}
                </h4>
                <p className="mt-1 text-xs text-[#CBD5E1]">
                  {post.cardAttachment.occasion &&
                  post.cardAttachment.occasion.includes("·")
                    ? post.cardAttachment.occasion
                    : "Thanksgiving · Action de Grâce"}
                </p>
              </div>

              {/* 2. Upper Cream Artwork Stage */}
              <div className="bg-[#F3F1EC] px-8 pt-7 pb-4 text-center">
                <img
                  src={post.cardAttachment.imageUrl}
                  alt={post.cardAttachment.title}
                  className="mx-auto block h-auto w-full max-w-[300px] rounded-[12px] border border-[#D8D0C5] bg-white shadow-xs"
                />
              </div>

              {/* 3. Lower White Message Body */}
              <div className="bg-white px-7 py-7 sm:px-9 text-left">
                <p className="mb-3 text-[13px] font-semibold text-[#7C6239]">
                  Warm greetings,
                </p>
                <div className="rounded-r-[12px] border-l-[3px] border-[#B8935A] bg-[#FAF9F7] px-[18px] py-3">
                  <p className="m-0 font-serif text-[19px] italic leading-[1.6] text-[#1B2A4A]">
                    &ldquo;{post.cardAttachment.message}&rdquo;
                  </p>
                </div>
                <p className="mt-5 text-right font-serif text-[17px] font-semibold text-[#1B2A4A]">
                  {post.cardAttachment.senderName || "Kwesi Asiedu"}
                </p>
                <p className="mt-1.5 text-right text-[11px] text-[#5A6475]">
                  Presented on Handmade Stock ·{" "}
                  {post.cardAttachment.envelopeColor || "Cotton Ivory"} Envelope
                </p>
                <div className="mt-6 text-center">
                  <a
                    href={
                      post.cardAttachment.shareUrl ||
                      "https://connectln-cards.vercel.app"
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-full bg-[#1B2A4A] px-6 py-[11px] text-[13px] font-semibold text-white no-underline transition hover:bg-[#121D34]"
                  >
                    Send Your Own Keepsake Card
                  </a>
                </div>
              </div>

              {/* 4. Bottom Footer Strip */}
              <div className="border-t border-[#E5E0D8] bg-[#F3F1EC] px-8 py-4 text-center">
                <p className="m-0 text-[11px] text-[#5A6475]">
                  Sent via{" "}
                  <strong className="font-semibold text-[#1B2A4A]">
                    ConnectLn Keepsake
                  </strong>{" "}
                  · Fine Letterpress &amp; Digital Stationery
                </p>
              </div>
            </div>
          )}

          {/* Engagement Bar */}
          <div className="mt-3 flex items-center justify-between max-w-[480px] text-[#64748B]">
            <button
              type="button"
              onClick={() => setReplyDrawerOpen((prev) => !prev)}
              className={`group flex items-center gap-1.5 rounded-full py-1 pr-2 text-xs font-medium transition ${
                replyDrawerOpen
                  ? "text-[#2563EB]"
                  : "hover:text-[#2563EB]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:bg-[#EFF6FF]">
                <MessageCircle className="h-[17px] w-[17px]" />
              </span>
              <span>{formatMetric(post.repliesCount)}</span>
            </button>

            <button
              type="button"
              onClick={() => void toggleRepost(post.id)}
              className={`group flex items-center gap-1.5 rounded-full py-1 pr-2 text-xs font-medium transition ${
                post.reposted
                  ? "text-emerald-600"
                  : "hover:text-emerald-600"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:bg-emerald-50">
                <Repeat2 className="h-[18px] w-[18px]" />
              </span>
              <span>{formatMetric(post.repostsCount)}</span>
            </button>

            <button
              type="button"
              onClick={() => void toggleLike(post.id)}
              className={`group flex items-center gap-1.5 rounded-full py-1 pr-2 text-xs font-medium transition ${
                post.liked
                  ? "text-[#EF4444]"
                  : "hover:text-[#EF4444]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:bg-red-50">
                <Heart
                  className={`h-[17px] w-[17px] ${
                    post.liked ? "fill-[#EF4444]" : ""
                  }`}
                />
              </span>
              <span>{formatMetric(post.likesCount)}</span>
            </button>

            <button
              type="button"
              onClick={() => void toggleBookmark(post.id)}
              aria-label="Bookmark post"
              className={`group flex items-center gap-1 rounded-full p-1 transition ${
                post.bookmarked
                  ? "text-[#2563EB]"
                  : "hover:text-[#2563EB]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:bg-[#EFF6FF]">
                <Bookmark
                  className={`h-[17px] w-[17px] ${
                    post.bookmarked ? "fill-[#2563EB]" : ""
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share post"
              className="group flex items-center gap-1 rounded-full p-1 text-xs font-medium transition hover:text-[#2563EB]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:bg-[#EFF6FF]">
                {copied ? (
                  <Check className="h-[17px] w-[17px] text-emerald-600" />
                ) : (
                  <Share className="h-[17px] w-[17px]" />
                )}
              </span>
            </button>
          </div>

          {/* Expandable Reply Drawer */}
          {replyDrawerOpen && (
            <div className="mt-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
              {post.replies.length > 0 && (
                <div className="mb-3 space-y-2.5 border-b border-[#E5E7EB] pb-3">
                  {post.replies.map((reply) => {
                    const replyUser = users[reply.authorHandle];
                    return (
                      <div key={reply.id} className="flex gap-2.5 text-sm">
                        <UserAvatar
                          variant={replyUser?.avatarVariant ?? "david"}
                          name={reply.authorName}
                          size={28}
                        />
                        <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 border border-[#E5E7EB]">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="font-semibold text-[#0F172A]">
                              {reply.authorName}
                            </span>
                            {reply.authorVerified && (
                              <VerifiedBadge size={12} />
                            )}
                            <span className="text-[#64748B]">
                              @{reply.authorHandle}
                            </span>
                            <span className="text-[#94A3B8]">·</span>
                            <span className="text-[#64748B]">
                              {reply.timeAgo}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] text-[#0F172A]">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
                <UserAvatar
                  variant={currentUser?.avatarVariant ?? "alex"}
                  name={currentUser?.name ?? "Alex Morgan"}
                  size={28}
                />
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${author.handle}...`}
                  className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="rounded-full bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-45"
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
