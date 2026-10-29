'use client';

import React, { useEffect, useState } from 'react';
import { loadScheduledMeetings } from './ScheduleMeetingModal';

const FIRED_KEY = 'connectln_meeting_reminders_fired_v1';

interface ReminderToast {
    key: string;
    reason: string;
    minutes: number;
    startIso: string;
    mode: 'video' | 'audio';
    names: string;
}

function loadFired(): string[] {
    try {
        return JSON.parse(window.localStorage.getItem(FIRED_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveFired(list: string[]) {
    try {
        window.localStorage.setItem(FIRED_KEY, JSON.stringify(list.slice(-300)));
    } catch {
        // ignore storage failures
    }
}

/**
 * Shows an in-app reminder (and a desktop notification, if allowed) 15 / 30 minutes (or whatever the host chose)
 * before a scheduled meeting. Works while ConnectLn is open in a browser tab.
 */
export function MeetingReminders({ onOpenMessaging }: { onOpenMessaging?: () => void }) {
    const [toasts, setToasts] = useState<ReminderToast[]>([]);

    useEffect(() => {
        const check = () => {
            const now = Date.now();
            const fired = loadFired();
            const newToasts: ReminderToast[] = [];
            for (const m of loadScheduledMeetings()) {
                const start = new Date(m.startIso).getTime();
                if (!Number.isFinite(start) || start < now) continue; // meeting already started or passed
                for (const min of m.reminders || []) {
                    const key = `${m.id}:${min}`;
                    if (fired.includes(key)) continue;
                    if (now >= start - min * 60000) {
                        fired.push(key);
                        newToasts.push({
                            key,
                            reason: m.reason,
                            minutes: Math.max(1, Math.round((start - now) / 60000)),
                            startIso: m.startIso,
                            mode: m.mode,
                            names: m.invitees.map((i) => i.name).join(', '),
                        });
                    }
                }
            }
            if (newToasts.length) {
                saveFired(fired);
                setToasts((t) => [...t, ...newToasts]);
                if ('Notification' in window && Notification.permission === 'granted') {
                    for (const n of newToasts) {
                        try {
                            new Notification(`Meeting in ${n.minutes} min: ${n.reason}`, {
                                body: `${new Date(n.startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${n.mode === 'video' ? 'Video Huddle' : 'Voice Call'} · ${n.names}`,
                            });
                        } catch {
                            // notification not supported in this context
                        }
                    }
                }
            }
        };
        check();
        const id = setInterval(check, 15000);
        return () => clearInterval(id);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
            {toasts.map((t) => (
                <div key={t.key} className="rounded-xl border border-amber-300 bg-white p-3 shadow-2xl text-slate-900">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-extrabold">⏰ Meeting in about {t.minutes} min</p>
                        <button
                            type="button"
                            aria-label="Dismiss reminder"
                            onClick={() => setToasts((all) => all.filter((x) => x.key !== t.key))}
                            className="h-6 w-6 shrink-0 rounded-full bg-slate-100 hover:bg-red-100 text-xs font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="mt-1 text-sm font-bold">{t.reason}</p>
                    <p className="text-xs text-slate-600">
                        {new Date(t.startIso).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
                        {t.mode === 'video' ? '🎥 Video Huddle' : '📞 Voice Call'} · {t.names}
                    </p>
                    {onOpenMessaging && (
                        <button
                            type="button"
                            onClick={() => {
                                onOpenMessaging();
                                setToasts((all) => all.filter((x) => x.key !== t.key));
                            }}
                            className="mt-2 rounded-lg bg-[#0A66C2] px-3 py-1.5 text-xs font-extrabold"
                            style={{ color: '#FFFFFF' }}
                        >
                            Open Messaging
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
