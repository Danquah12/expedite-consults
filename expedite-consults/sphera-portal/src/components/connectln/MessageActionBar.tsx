'use client';

import React, { useEffect, useState } from 'react';
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

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Registered members are loaded once and reused by every message.
let membersCache: ShareTarget[] | null = null;
let membersPromise: Promise<ShareTarget[]> | null = null;
export function loadMembers(): Promise<ShareTarget[]> {
    if (membersCache) return Promise.resolve(membersCache);
    if (!membersPromise) {
        membersPromise = fetch('/api/connectin/users', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => {
                const list: ShareTarget[] = (d?.users || []).map((u: any) => ({
                    id: `member_${String(u.email || u.name).toLowerCase()}`,
                    name: String(u.name || ''),
                    avatar: u.avatar && !String(u.avatar).startsWith('data:') ? u.avatar : undefined,
                    subtitle: u.headline || '',
                }));
                membersCache = list.filter((m) => m.name);
                return membersCache;
            })
            .catch(() => {
                membersPromise = null;
                return [] as ShareTarget[];
            });
    }
    return membersPromise;
}

/** Small reaction chips shown on the top-right corner of a message bubble. */
export function ReactionBadges({ msg }: { msg: B2BMessageItem }) {
    const active = REACTIONS.filter((r) => (msg.reactions?.[r.kind] || []).length > 0);
    if (active.length === 0) return null;
    return (
        <div className="absolute -top-3 right-2 z-10 flex items-center gap-1">
            {active.map((r) => (
                <span
                    key={r.kind}
                    title={r.label}
                    className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-800 shadow-md"
                >
                    <span>{r.emoji}</span>
                    <span className="text-[10px]">{(msg.reactions?.[r.kind] || []).length}</span>
                </span>
            ))}
        </div>
    );
}

/**
 * Actions under a chat message: like / thumbs up / thumbs down, comment, share (members on ConnectLn, WhatsApp,
 * LinkedIn, Facebook, email), and post (own message) or repost (someone else's message, with credit) to the Feed.
 */
export function MessageActionBar({
    msg,
    isMe,
    myKey,
    myName,
    shareTargets,
    shareText,
    shareLink,
    onReact,
    onComment,
    onForward,
    onPostToFeed,
}: {
    msg: B2BMessageItem;
    isMe: boolean;
    /** Normalized name of the signed-in member (matches what the server stores in reactions). */
    myKey: string;
    myName: string;
    /** The member's own connections (open conversations). */
    shareTargets: ShareTarget[];
    shareText: string;
    shareLink: string;
    onReact: (kind: 'like' | 'up' | 'down') => void;
    onComment: (text: string) => void;
    onForward: (target: ShareTarget) => Promise<void> | void;
    onPostToFeed: () => void;
}) {
    const [showComments, setShowComments] = useState(false);
    const [draft, setDraft] = useState('');
    const [showShare, setShowShare] = useState(false);
    const [shareQuery, setShareQuery] = useState('');
    const [members, setMembers] = useState<ShareTarget[]>(membersCache || []);
    const [note, setNote] = useState<string | null>(null);
    const comments = msg.comments || [];

    useEffect(() => {
        if (showShare && !membersCache) loadMembers().then(setMembers);
    }, [showShare]);

    const flash = (t: string) => {
        setNote(t);
        setTimeout(() => setNote(null), 2500);
    };

    const btn =
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer';

    // Connections first, then every other registered member; matches as soon as one letter is typed.
    const q = shareQuery.trim().toLowerCase();
    const qc = compact(shareQuery);
    const seen = new Set<string>([compact(myName)]);
    const pool: ShareTarget[] = [];
    for (const t of [...shareTargets, ...members]) {
        const key = compact(t.name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        pool.push(t);
    }
    const targets = (q
        ? pool.filter((t) => t.name.toLowerCase().includes(q) || (qc && compact(t.name).includes(qc)))
        : pool
    ).slice(0, 8);

    const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=640,height=560');
    const fullText = `${shareText}\n${shareLink}`;
    const external = [
        { label: 'WhatsApp', icon: '🟢', go: () => open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`) },
        { label: 'LinkedIn', icon: '🔵', go: () => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`) },
        {
            label: 'Facebook',
            icon: '🟦',
            go: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(shareText)}`),
        },
        {
            label: 'Email',
            icon: '✉️',
            go: () => {
                window.location.href = `mailto:?subject=${encodeURIComponent('A message shared from ConnectLn')}&body=${encodeURIComponent(fullText)}`;
            },
        },
    ];

    return (
        <div className={`mt-1 flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex flex-wrap items-center gap-1">
                {REACTIONS.map((r) => {
                    const mine = (msg.reactions?.[r.kind] || []).includes(myKey);
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
                        </button>
                    );
                })}
                <button type="button" className={btn} onClick={() => setShowComments((v) => !v)} title="Comment">
                    💬 {comments.length > 0 ? comments.length : 'Comment'}
                </button>
                <button type="button" className={btn} onClick={() => setShowShare((v) => !v)} title="Share">
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
                <div className="w-72 max-w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg text-slate-900">
                    <p className="px-1 pb-1 text-[11px] font-extrabold text-slate-500">Share on</p>
                    <div className="mb-2 grid grid-cols-4 gap-1">
                        {external.map((e) => (
                            <button
                                key={e.label}
                                type="button"
                                onClick={() => {
                                    e.go();
                                    setShowShare(false);
                                }}
                                className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-200 p-1.5 text-[10px] font-bold hover:bg-slate-100"
                            >
                                <span className="text-base">{e.icon}</span>
                                {e.label}
                            </button>
                        ))}
                    </div>
                    <p className="px-1 pb-1 text-[11px] font-extrabold text-slate-500">Send to a friend on ConnectLn</p>
                    <input
                        autoFocus
                        value={shareQuery}
                        onChange={(e) => setShareQuery(e.target.value)}
                        placeholder="Type a name…"
                        className="mb-1 w-full rounded-lg border border-slate-300 p-1.5 text-xs"
                    />
                    <div className="max-h-44 overflow-y-auto">
                        {targets.length === 0 && (
                            <p className="p-2 text-[11px] text-slate-500">{membersCache ? 'No members found.' : 'Loading members…'}</p>
                        )}
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
                                {t.avatar ? <img src={t.avatar} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="h-6 w-6 shrink-0 rounded-full bg-slate-200" />}
                                <span className="min-w-0">
                                    <span className="block truncate text-xs font-bold">{t.name}</span>
                                    {t.subtitle && <span className="block truncate text-[10px] text-slate-500">{t.subtitle}</span>}
                                </span>
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
