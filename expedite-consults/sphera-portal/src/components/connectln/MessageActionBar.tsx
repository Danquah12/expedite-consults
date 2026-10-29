'use client';

import React, { useState } from 'react';
import type { B2BMessageItem } from '@/lib/b2b-messaging-data';

export interface ShareTarget {
    id: string;
    name: string;
    avatar?: string;
    subtitle?: string;
}

const REACTIONS: { kind: 'like' | 'up' | 'down'; emoji: string; label: string }[] = [
    { kind: 'like', emoji: '❤️', label: 'Like' },
    { kind: 'up', emoji: '👍', label: 'Thumbs up' },
    { kind: 'down', emoji: '👎', label: 'Thumbs down' },
];

/**
 * Actions under a chat message: like / thumbs up / thumbs down, comment, share (forward to a connection),
 * and post (own message) or repost (someone else's message, with credit) to the member's Feed.
 */
export function MessageActionBar({
    msg,
    isMe,
    myKey,
    shareTargets,
    onReact,
    onComment,
    onForward,
    onPostToFeed,
}: {
    msg: B2BMessageItem;
    isMe: boolean;
    /** Normalized name of the signed-in member (matches what the server stores in reactions). */
    myKey: string;
    shareTargets: ShareTargetsProp;
    onReact: (kind: 'like' | 'up' | 'down') => void;
    onComment: (text: string) => void;
    onForward: (target: ShareTarget) => Promise<void> | void;
    onPostToFeed: () => void;
}) {
    const [showComments, setShowComments] = useState(false);
    const [draft, setDraft] = useState('');
    const [showShare, setShowShare] = useState(false);
    const [shareQuery, setShareQuery] = useState('');
    const [note, setNote] = useState<string | null>(null);
    const comments = msg.comments || [];

    const flash = (t: string) => {
        setNote(t);
        setTimeout(() => setNote(null), 2500);
    };

    const btn =
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer';

    const targets = shareTargets.filter(
        (t) => !shareQuery.trim() || t.name.toLowerCase().includes(shareQuery.trim().toLowerCase())
    );

    return (
        <div className={`mt-1 flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex flex-wrap items-center gap-1">
                {REACTIONS.map((r) => {
                    const who = msg.reactions?.[r.kind] || [];
                    const mine = who.includes(myKey);
                    return (
                        <button
                            key={r.kind}
                            type="button"
                            title={r.label}
                            aria-label={r.label}
                            onClick={() => onReact(r.kind)}
                            className={`${btn} ${mine ? '!border-[#0A66C2] !bg-blue-50 !text-[#0A66C2]' : ''}`}
                        >
                            <span>{r.emoji}</span>
                            {who.length > 0 && <span>{who.length}</span>}
                        </button>
                    );
                })}
                <button type="button" className={btn} onClick={() => setShowComments((v) => !v)} title="Comment">
                    💬 {comments.length > 0 ? comments.length : 'Comment'}
                </button>
                <button type="button" className={btn} onClick={() => setShowShare((v) => !v)} title="Share with a connection">
                    ↪ Share
                </button>
                <button
                    type="button"
                    className={btn}
                    onClick={() => {
                        onPostToFeed();
                        flash(isMe ? 'Posted to your Feed' : 'Reposted to your Feed');
                    }}
                    title={isMe ? 'Post this message to your Feed' : 'Repost this message to your Feed (credits the sender)'}
                >
                    {isMe ? '📝 Post' : '🔁 Repost'}
                </button>
                {note && <span className="text-[11px] font-bold text-emerald-700">{note}</span>}
            </div>

            {showShare && (
                <div className="w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg text-slate-900">
                    <input
                        value={shareQuery}
                        onChange={(e) => setShareQuery(e.target.value)}
                        placeholder="Share with…"
                        className="mb-1 w-full rounded-lg border border-slate-300 p-1.5 text-xs"
                    />
                    <div className="max-h-40 overflow-y-auto">
                        {targets.length === 0 && <p className="p-2 text-[11px] text-slate-500">No connections found.</p>}
                        {targets.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100"
                                onClick={async () => {
                                    try {
                                        await onForward(t);
                                        flash(`Shared with ${t.name}`);
                                    } catch {
                                        flash('Could not share');
                                    }
                                    setShowShare(false);
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {t.avatar ? <img src={t.avatar} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="h-6 w-6 rounded-full bg-slate-200" />}
                                <span className="truncate text-xs font-bold">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showComments && (
                <div className="w-72 max-w-full rounded-xl border border-slate-200 bg-white p-2 shadow-sm text-slate-900">
                    {comments.length === 0 && <p className="px-1 pb-1 text-[11px] text-slate-500">No comments yet.</p>}
                    <div className="max-h-40 space-y-1.5 overflow-y-auto">
                        {comments.map((c) => (
                            <div key={c.id} className="text-xs">
                                <span className="font-extrabold">{c.author}</span>{' '}
                                <span className="text-slate-500">
                                    {new Date(c.createdAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <p className="whitespace-pre-line">{c.text}</p>
                            </div>
                        ))}
                    </div>
                    <form
                        className="mt-1.5 flex gap-1.5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const t = draft.trim();
                            if (!t) return;
                            onComment(t);
                            setDraft('');
                        }}
                    >
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Write a comment…"
                            maxLength={200}
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 p-1.5 text-xs"
                        />
                        <button type="submit" className="rounded-lg bg-[#0A66C2] px-2.5 text-xs font-extrabold" style={{ color: '#FFFFFF' }}>
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

type ShareTargetsProp = ShareTarget[];
