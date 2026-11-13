'use client';

import React, { useEffect, useState } from 'react';
import type { B2BMessageItem } from '@/lib/b2b-messaging-data';
import { recordLocalBilateralDirectMessage } from '@/lib/direct-mailbox-sync';

export interface ShareTarget {
    id: string;
    name: string;
    avatar?: string;
    subtitle?: string;
}

export const DEFAULT_CONNECTLN_SHARE_MEMBERS: ShareTarget[] = [
    {
        id: 'member_gus_vandermeer',
        name: 'Gus Vandermeer, PE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Cascade Structural Engineering · Timber Bent & Heavy Rigging',
    },
    {
        id: 'member_patience_addo',
        name: 'PATIENCE Addo',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PATIENCE%20Addo&backgroundColor=0a66c2',
        subtitle: 'Doctor of Veterinary Medicine (DVM) · Small Animal Surgery',
    },
    {
        id: 'member_elena_rostova',
        name: 'Dr. Elena Rostova, MD, FACS',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Attending Orthopedic Trauma Surgeon & Surgical Director',
    },
    {
        id: 'member_markus_thorne',
        name: 'Markus Thorne',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Commercial Framing & Craft Superintendent · Turner Construction',
    },
    {
        id: 'member_mike_mukasa',
        name: 'Mike Mukasa',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Principal Infrastructure & Field Operations Lead',
    },
    {
        id: 'member_suzzan_coldwell',
        name: 'Suzzan Coldwell Banker',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Senior Commercial Real Estate & Portfolio Director',
    },
    {
        id: 'member_sam_k',
        name: 'Sam K',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Master Electrician & Industrial Controls Specialist',
    },
    {
        id: 'member_boat',
        name: 'Boat',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        subtitle: 'Senior Systems & Cloud Security Practitioner',
    },
];

export type MessageReactionKind = 'like' | 'up' | 'down' | 'rsvp_yes' | 'rsvp_no' | 'rsvp_maybe';

const REACTIONS: { kind: 'like' | 'up' | 'down'; emoji: string; label: string }[] = [
    { kind: 'like', emoji: '❤️', label: 'Like' },
    { kind: 'up', emoji: '👍', label: 'Thumbs up' },
    { kind: 'down', emoji: '👎', label: 'Thumbs down' },
];

const RSVP_OPTIONS: { kind: 'rsvp_yes' | 'rsvp_no' | 'rsvp_maybe'; choice: 'yes' | 'no' | 'maybe'; emoji: string; label: string; activeClass: string }[] = [
    { kind: 'rsvp_yes', choice: 'yes', emoji: '✅', label: 'Yes', activeClass: '!border-emerald-600 !bg-emerald-600 !text-white' },
    { kind: 'rsvp_no', choice: 'no', emoji: '❌', label: 'No', activeClass: '!border-rose-600 !bg-rose-600 !text-white' },
    { kind: 'rsvp_maybe', choice: 'maybe', emoji: '🤔', label: 'Maybe', activeClass: '!border-amber-600 !bg-amber-600 !text-white' },
];

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Registered members are loaded once and merged with default verified ConnectLn professionals.
let membersCache: ShareTarget[] | null = null;
let membersPromise: Promise<ShareTarget[]> | null = null;
export function loadMembers(): Promise<ShareTarget[]> {
    if (membersCache) return Promise.resolve(membersCache);
    if (!membersPromise) {
        membersPromise = fetch('/api/connectin/users', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => {
                const apiList: ShareTarget[] = (d?.users || []).map((u: any) => ({
                    id: `member_${String(u.email || u.name).toLowerCase()}`,
                    name: String(u.name || ''),
                    avatar: u.avatar && !String(u.avatar).startsWith('data:') ? u.avatar : undefined,
                    subtitle: u.headline || 'Verified ConnectLn Professional',
                }));
                const seen = new Set<string>();
                const merged: ShareTarget[] = [];
                for (const item of [...DEFAULT_CONNECTLN_SHARE_MEMBERS, ...apiList]) {
                    const key = compact(item.name);
                    if (!key || seen.has(key)) continue;
                    seen.add(key);
                    merged.push(item);
                }
                membersCache = merged;
                return membersCache;
            })
            .catch(() => {
                membersPromise = null;
                membersCache = DEFAULT_CONNECTLN_SHARE_MEMBERS;
                return DEFAULT_CONNECTLN_SHARE_MEMBERS;
            });
    }
    return membersPromise;
}

/**
 * Sends a shared post, video, photo, or message directly into another ConnectLn member's Inbox
 * (both local bilateral DM store and server `/api/connectin/messages`).
 */
export async function sendSharedItemToConnectLnMember(params: {
    senderName: string;
    senderEmail?: string;
    senderAvatar?: string;
    senderHeadline?: string;
    target: ShareTarget;
    itemTitle: string;
    itemText: string;
    shareUrl: string;
    itemKindLabel?: string;
}): Promise<void> {
    const senderName = params.senderName || 'Kwesi Asiedu';
    const senderAvatar = params.senderAvatar || '/brand/kwesi-avatar.png';
    const senderRole = params.senderHeadline || 'Verified ConnectLn Professional';
    const kind = params.itemKindLabel || 'ConnectLn Post';
    const dmBody = `↪ Shared ${kind} with you on ConnectLn:\n\n"${params.itemTitle}"\n${params.itemText ? `${params.itemText.slice(0, 260)}\n` : ''}\n🔗 Open on ConnectLn: ${params.shareUrl}`;

    recordLocalBilateralDirectMessage({
        senderName,
        senderEmail: params.senderEmail,
        senderAvatar,
        senderRole,
        recipientName: params.target.name,
        recipientAvatar: params.target.avatar,
        recipientSubtitle: params.target.subtitle,
        subject: `Shared ${kind}: ${params.itemTitle.slice(0, 60)}`,
        text: dmBody,
        channelType: 'People',
        subType: 'DM',
    });

    try {
        await fetch('/api/connectin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderName,
                senderEmail: params.senderEmail,
                senderAvatar,
                senderRole,
                recipientName: params.target.name,
                recipientAvatar: params.target.avatar,
                recipientRole: params.target.subtitle,
                text: dmBody,
            }),
        });
    } catch {
        // Local bilateral message is already persisted
    }
}

/** Small reaction chips shown on the top-right corner of a message bubble. */
export function ReactionBadges({ msg }: { msg: B2BMessageItem }) {
    const badges = [
        ...REACTIONS.map((r) => ({ kind: r.kind, emoji: r.emoji, label: r.label })),
        ...RSVP_OPTIONS.map((r) => ({ kind: r.kind, emoji: r.emoji, label: `RSVP ${r.label}` })),
    ].filter((r) => (msg.reactions?.[r.kind] || []).length > 0);

    if (badges.length === 0) return null;
    return (
        <div className="absolute -top-3 right-2 z-10 flex items-center gap-1">
            {badges.map((r) => (
                <span
                    key={r.kind}
                    title={`${r.label}: ${(msg.reactions?.[r.kind] || []).join(', ')}`}
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
 * Actions under a chat message:
 * - Meeting Invitation RSVP confirmation (Yes / No / Maybe) with ConnectLn logo that sends the response back to the host
 * - Like / Thumbs up / Thumbs down (shown at top-right of bubble)
 * - Comment
 * - Share (with branded profile picture + ConnectLn logo template for LinkedIn, WhatsApp, Facebook, Email, or ConnectLn members)
 * - Post / Repost to Feed
 */
export function MessageActionBar({
    msg,
    isMe,
    myKey,
    myName,
    authorName,
    authorRole,
    authorAvatar,
    shareTargets,
    shareText,
    onReact,
    onRsvp,
    onComment,
    onForward,
    onPostToFeed,
}: {
    msg: B2BMessageItem;
    isMe: boolean;
    /** Normalized name of the signed-in member (matches what the server stores in reactions). */
    myKey: string;
    myName: string;
    authorName?: string;
    authorRole?: string;
    authorAvatar?: string;
    /** The member's own connections (open conversations). */
    shareTargets: ShareTarget[];
    shareText: string;
    shareLink?: string;
    onReact: (kind: MessageReactionKind) => void;
    onRsvp?: (choice: 'yes' | 'no' | 'maybe') => Promise<void> | void;
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
        setTimeout(() => setNote(null), 2800);
    };

    const btn =
        'inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-colors';

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

    const resolvedAuthor = authorName || (isMe ? myName : msg.sender.name) || 'ConnectLn Member';
    const resolvedRole = authorRole || msg.sender.role || 'Verified ConnectLn Professional';
    const isKwesi = resolvedAuthor.toLowerCase().includes('kwesi asiedu');
    const rawAvatar = authorAvatar || msg.sender.avatar || '';
    const publicAvatar =
        rawAvatar.startsWith('data:') || (!isKwesi && rawAvatar.includes('kwesi-avatar'))
            ? ''
            : rawAvatar;

    const cardParams = new URLSearchParams({
        author: resolvedAuthor,
        role: resolvedRole,
        avatar: publicAvatar,
        text: shareText.slice(0, 420),
        sharedBy: myName || resolvedAuthor,
    });
    const brandedShareUrl = `https://www.conectln.com/share/message?${cardParams.toString()}`;
    const formattedDispatch = `📢 ${resolvedAuthor} (${resolvedRole}) on ConnectLn:\n\n"${shareText}"\n\n🔗 View verified ConnectLn card: ${brandedShareUrl}`;

    const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=680,height=620');
    const external = [
        {
            label: 'LinkedIn',
            icon: '🔵',
            go: () => open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(formattedDispatch)}`),
        },
        {
            label: 'Facebook',
            icon: '🟦',
            go: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(brandedShareUrl)}&quote=${encodeURIComponent(formattedDispatch)}`),
        },
        {
            label: 'Instagram',
            icon: '📸',
            go: () => {
                try {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(formattedDispatch).catch(() => {});
                    }
                } catch {}
                open('https://www.instagram.com/');
                flash('Copied caption & opened Instagram');
            },
        },
        {
            label: 'WhatsApp',
            icon: '🟢',
            go: () => open(`https://api.whatsapp.com/send?text=${encodeURIComponent(formattedDispatch)}`),
        },
        {
            label: 'Email',
            icon: '✉️',
            go: () => {
                window.location.href = `mailto:?subject=${encodeURIComponent(`${resolvedAuthor} shared a message via ConnectLn`)}&body=${encodeURIComponent(formattedDispatch)}`;
            },
        },
    ];

    const isMeetingInvite = msg.text.includes('Meeting invitation from');
    const yesList = msg.reactions?.rsvp_yes || [];
    const noList = msg.reactions?.rsvp_no || [];
    const maybeList = msg.reactions?.rsvp_maybe || [];

    return (
        <div className={`mt-1.5 flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
            {/* Meeting Invitation RSVP Bar (Yes / No / Maybe) with ConnectLn Logo */}
            {isMeetingInvite && (
                <div className="w-full max-w-md rounded-xl border border-slate-300 bg-white p-2.5 shadow-sm text-slate-900">
                    <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/brand/connectln-icon-256.png"
                                alt="ConnectLn"
                                className="h-4 w-4 rounded-xs object-contain"
                            />
                            <span className="text-[11px] font-black text-slate-800">
                                ConnectLn Meeting RSVP — Confirm Attendance:
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {RSVP_OPTIONS.map((opt) => {
                            const list = msg.reactions?.[opt.kind] || [];
                            const mine = list.includes(myKey);
                            return (
                                <button
                                    key={opt.kind}
                                    type="button"
                                    onClick={async () => {
                                        onReact(opt.kind);
                                        if (onRsvp) {
                                            await onRsvp(opt.choice);
                                        }
                                        flash(`RSVP "${opt.label}" sent to ${isMe ? 'invitees' : msg.sender.name}`);
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-800 hover:bg-slate-100 cursor-pointer transition-all ${
                                        mine ? opt.activeClass : ''
                                    }`}
                                >
                                    <span>{opt.emoji}</span>
                                    <span>{opt.label}</span>
                                    {list.length > 0 && (
                                        <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-0.2 text-[10px]">
                                            {list.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {(yesList.length > 0 || noList.length > 0 || maybeList.length > 0) && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-0.5 text-[11px]">
                            {yesList.length > 0 && (
                                <p className="text-emerald-800 font-bold">
                                    ✅ Yes ({yesList.length}): <span className="font-normal capitalize">{yesList.join(', ')}</span>
                                </p>
                            )}
                            {noList.length > 0 && (
                                <p className="text-rose-800 font-bold">
                                    ❌ No ({noList.length}): <span className="font-normal capitalize">{noList.join(', ')}</span>
                                </p>
                            )}
                            {maybeList.length > 0 && (
                                <p className="text-amber-800 font-bold">
                                    🤔 Maybe ({maybeList.length}): <span className="font-normal capitalize">{maybeList.join(', ')}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div
                className={`flex flex-wrap items-center gap-1 transition-all duration-150 ${
                    showComments || showShare || note || comments.length > 0
                        ? 'opacity-100 mt-1'
                        : 'opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-10 group-hover:mt-1 focus-within:opacity-100 focus-within:max-h-10'
                }`}
            >
                {REACTIONS.map((r) => {
                    const list = msg.reactions?.[r.kind] || [];
                    const mine = list.includes(myKey);
                    return (
                        <button
                            key={r.kind}
                            type="button"
                            title={
                                list.length > 0
                                    ? `${r.label} (${list.length}): ${list.join(', ')}`
                                    : r.label
                            }
                            aria-label={r.label}
                            onClick={() => onReact(r.kind)}
                            className={`${btn} ${mine ? '!border-[#0A66C2] !bg-blue-50 !text-[#0A66C2]' : list.length > 0 ? '!border-emerald-300 !bg-emerald-50/70 !text-emerald-900' : ''}`}
                        >
                            <span>{r.emoji}</span>
                            {list.length > 0 && (
                                <span className="text-[10px] font-black">{list.length}</span>
                            )}
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

            {/* Visible list of who reacted so both sender and recipient immediately see each other's reactions */}
            {(() => {
                const activeReacts = REACTIONS.map((r) => ({
                    ...r,
                    users: msg.reactions?.[r.kind] || [],
                })).filter((r) => r.users.length > 0);
                if (activeReacts.length === 0) return null;
                return (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {activeReacts.map((r) => (
                            <span
                                key={r.kind}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 capitalize"
                            >
                                <span>{r.emoji}</span>
                                <span>{r.users.join(', ')}</span>
                            </span>
                        ))}
                    </div>
                );
            })()}

            {showShare && (
                <div className="w-80 max-w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl text-slate-900">
                    {/* Branded ConnectLn Social Card Template Preview */}
                    <p className="px-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        ConnectLn Share Card Preview
                    </p>
                    <div
                        className="mb-2.5 rounded-xl overflow-hidden border border-[#2C2825] shadow-md"
                        style={{ backgroundColor: '#171513', color: '#F5F0EB' }}
                    >
                        <div
                            className="flex items-center justify-between gap-2 px-3 py-2 border-b"
                            style={{ backgroundColor: '#1F1C1A', borderColor: 'rgba(255,255,255,0.12)' }}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={authorAvatar || msg.sender.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedAuthor)}&backgroundColor=0a66c2`}
                                    alt={resolvedAuthor}
                                    onError={(e) => {
                                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedAuthor)}&backgroundColor=0a66c2`;
                                    }}
                                    className="h-7 w-7 rounded-full object-cover ring-2 ring-[#0A66C2] shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-[11px] font-extrabold truncate" style={{ color: '#F5F0EB' }}>
                                        {resolvedAuthor}
                                    </p>
                                    <p className="text-[9px] truncate text-slate-300">{resolvedRole}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/brand/connectln-icon-256.png"
                                    alt="ConnectLn"
                                    className="h-4 w-4 rounded-xs object-contain"
                                />
                                <span className="text-[11px] font-black" style={{ color: '#F5F0EB' }}>
                                    ConnectLn
                                </span>
                            </div>
                        </div>
                        <div className="p-2.5 text-[11px] leading-snug line-clamp-3 font-medium" style={{ color: '#F5F0EB' }}>
                            “{shareText}”
                        </div>
                    </div>

                    <p className="px-1 pb-1 text-[11px] font-extrabold text-slate-500">Share card on</p>
                    <div className="mb-2 grid grid-cols-5 gap-1">
                        {external.map((e) => (
                            <button
                                key={e.label}
                                type="button"
                                onClick={() => {
                                    e.go();
                                    setShowShare(false);
                                }}
                                className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-200 p-1.5 text-[10px] font-bold hover:bg-slate-100 cursor-pointer"
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
                        placeholder="Type 1st letter of name (e.g. V, J, Y)…"
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
                                className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 cursor-pointer"
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
