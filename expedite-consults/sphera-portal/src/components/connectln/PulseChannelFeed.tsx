'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Bell, BellOff, Briefcase, Newspaper } from 'lucide-react';

export type PulseChannelSource = 'news' | 'jobs';

export interface PulseChannelPost {
    id: string;
    title: string;
    body: string;
    meta: string;
    url?: string;
    ctaLabel: string;
    badge?: string;
}

const FOLLOW_KEY = 'connectln_pulse_followed_channels_v1';

export function getFollowedPulseChannels(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(FOLLOW_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return ['chan_noctis_brief', 'chan_connectln_jobs'];
}

function setFollowedPulseChannels(ids: string[]) {
    try {
        window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(ids));
    } catch {}
}

function cleanText(s: unknown): string {
    return String(s || '')
        .replace(/Â·/g, '·')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function fetchPulseChannelPosts(source: PulseChannelSource): Promise<PulseChannelPost[]> {
    if (source === 'news') {
        const res = await fetch('/api/connectin/pulse', { cache: 'no-store' });
        if (!res.ok) throw new Error('Pulse news feed unavailable');
        const data = await res.json();
        const articles: any[] = Array.isArray(data?.articles) ? data.articles : [];
        return articles.slice(0, 30).map((a) => ({
            id: String(a.id),
            title: cleanText(a.title),
            body: cleanText(a.summary).slice(0, 260),
            meta: [cleanText(a.category), cleanText(a.author?.name), cleanText(a.publishedAt)]
                .filter(Boolean)
                .join(' · '),
            url: Array.isArray(a.sourceLinks) && a.sourceLinks[0]?.url ? a.sourceLinks[0].url : undefined,
            ctaLabel: 'Read source',
            badge: a.isBreaking ? 'Breaking' : undefined,
        }));
    }
    const res = await fetch('/api/connectin/jobs', { cache: 'no-store' });
    if (!res.ok) throw new Error('Bounties feed unavailable');
    const data = await res.json();
    const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs.slice(0, 30).map((j) => ({
        id: String(j.id),
        title: cleanText(j.title),
        body: cleanText(j.description).slice(0, 220),
        meta: [cleanText(j.company), cleanText(j.location), cleanText(j.salaryRange), cleanText(j.postedTime)]
            .filter(Boolean)
            .join(' · '),
        url: j.applyUrl || undefined,
        ctaLabel: j.easyApply ? 'Easy Apply' : 'Apply',
        badge: cleanText(j.workplaceType) || undefined,
    }));
}

export function PulseChannelFeed({
    channelId,
    name,
    followers,
    avatar,
    source,
}: {
    channelId: string;
    name: string;
    followers: string;
    avatar: string;
    source: PulseChannelSource;
}) {
    const [posts, setPosts] = useState<PulseChannelPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [following, setFollowing] = useState(true);
    const [updatedAt, setUpdatedAt] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const list = await fetchPulseChannelPosts(source);
            setPosts(list);
            setUpdatedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
        } catch (e: any) {
            setError(e?.message || 'Could not load updates.');
        } finally {
            setLoading(false);
        }
    }, [source]);

    useEffect(() => {
        setFollowing(getFollowedPulseChannels().includes(channelId));
        void load();
        const iv = window.setInterval(() => void load(), 5 * 60 * 1000);
        return () => window.clearInterval(iv);
    }, [channelId, load]);

    const toggleFollow = () => {
        const cur = getFollowedPulseChannels();
        const next = cur.includes(channelId) ? cur.filter((id) => id !== channelId) : [...cur, channelId];
        setFollowedPulseChannels(next);
        setFollowing(next.includes(channelId));
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#F3EDE2]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E0D6C5] bg-[#FBF8F3]">
                <img src={avatar} alt={name} className="w-10 h-10 rounded-xl object-cover border border-[#D0C4AE]" />
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-bold text-[#1C1917] truncate">{name}</p>
                    <p className="text-[11px] text-[#78716C]">
                        {followers}
                        {updatedAt ? ` · Updated ${updatedAt}` : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void load()}
                    title="Refresh"
                    className="h-8 w-8 rounded-lg hover:bg-[#EFE8DA] flex items-center justify-center text-[#5E3119] cursor-pointer"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                    type="button"
                    onClick={toggleFollow}
                    style={{ color: following ? '#5E3119' : '#FFFFFF' }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        following ? 'bg-[#EFE8DA] border border-[#D0C4AE]' : 'bg-[#7C4225] hover:bg-[#5E3119]'
                    }`}
                >
                    {following ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    {following ? 'Following' : 'Follow'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loading && posts.length === 0 && (
                    <p className="text-center text-xs text-[#78716C] py-10">Loading latest updates…</p>
                )}
                {error && (
                    <div className="text-center text-xs text-rose-700 py-6">
                        {error}{' '}
                        <button type="button" onClick={() => void load()} className="underline font-semibold cursor-pointer">
                            Try again
                        </button>
                    </div>
                )}
                {!loading && !error && posts.length === 0 && (
                    <p className="text-center text-xs text-[#78716C] py-10">No updates in this channel yet.</p>
                )}
                {posts.map((p) => (
                    <div
                        key={p.id}
                        className="max-w-2xl mx-auto bg-[#FBF8F3] rounded-2xl border border-[#E0D6C5] shadow-2xs p-4 text-left"
                    >
                        <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-[#7C4225] shrink-0">
                                {source === 'jobs' ? <Briefcase className="h-4 w-4" /> : <Newspaper className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[#1C1917] leading-snug">
                                    {p.badge && (
                                        <span className="mr-1.5 inline-block rounded-full bg-[#E8D8C8] px-2 py-0.5 text-[10px] font-extrabold text-[#5E3119] align-middle">
                                            {p.badge}
                                        </span>
                                    )}
                                    {p.title}
                                </p>
                                {p.body && <p className="mt-1.5 text-xs text-[#44403C] leading-relaxed">{p.body}</p>}
                                <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                                    <p className="text-[10.5px] text-[#78716C]">{p.meta}</p>
                                    {p.url && (
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#FFFFFF' }}
                                            className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 no-underline"
                                        >
                                            {p.ctaLabel}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
