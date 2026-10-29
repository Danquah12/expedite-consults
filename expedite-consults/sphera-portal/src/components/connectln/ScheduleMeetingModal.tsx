'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface MeetingInvitee {
    id: string;
    name: string;
    avatar?: string;
    subtitle?: string;
}

export interface ScheduledMeeting {
    id: string;
    reason: string;
    notes: string;
    startIso: string;
    durationMin: number;
    mode: 'video' | 'audio';
    invitees: { id: string; name: string }[];
    createdAtIso: string;
    /** Minutes before the start time at which the host is reminded (e.g. [15, 30]). */
    reminders?: number[];
}

const STORAGE_KEY = 'connectln_scheduled_meetings_v1';

export function loadScheduledMeetings(): ScheduledMeeting[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveMeeting(m: ScheduledMeeting) {
    try {
        const all = loadScheduledMeetings();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([m, ...all].slice(0, 200)));
    } catch {
        // storage unavailable: invites are still sent
    }
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const icsStamp = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

function buildIcs(m: ScheduledMeeting, host: string): string {
    const start = new Date(m.startIso);
    const end = new Date(start.getTime() + m.durationMin * 60000);
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ConnectLn//Meeting//EN',
        'BEGIN:VEVENT',
        `UID:${m.id}@connectln.app`,
        `DTSTAMP:${icsStamp(new Date())}`,
        `DTSTART:${icsStamp(start)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:${m.reason.replace(/\n/g, ' ')}`,
        `DESCRIPTION:${(m.notes || '').replace(/\n/g, '\\n')} (Organizer: ${host})`,
        ...(m.reminders || []).flatMap((min) => [
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            `DESCRIPTION:Reminder: ${m.reason.replace(/\n/g, ' ')} starts in ${min} minutes`,
            `TRIGGER:-PT${min}M`,
            'END:VALARM',
        ]),
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

const TIMES = Array.from({ length: 48 }, (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);

export function ScheduleMeetingModal({
    open,
    onClose,
    invitees,
    defaultInviteeId,
    hostName,
    onSendInvite,
}: {
    open: boolean;
    onClose: () => void;
    invitees: MeetingInvitee[];
    defaultInviteeId?: string;
    hostName: string;
    onSendInvite: (invitee: MeetingInvitee, text: string) => Promise<void> | void;
}) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
    const [dateStr, setDateStr] = useState(ymd(today));
    const [time, setTime] = useState('10:00');
    const [durationMin, setDurationMin] = useState(30);
    const [mode, setMode] = useState<'video' | 'audio'>('video');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Record<string, boolean>>(() =>
        defaultInviteeId ? { [defaultInviteeId]: true } : {}
    );
    const [reminders, setReminders] = useState<number[]>([15, 30]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<ScheduledMeeting | null>(null);

    React.useEffect(() => {
        if (open) {
            setSelected(defaultInviteeId ? { [defaultInviteeId]: true } : {});
            setDone(null);
            setError(null);
        }
    }, [open, defaultInviteeId]);

    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [
        ...Array.from({ length: startPad }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i + 1)),
    ];

    const filtered = invitees.filter(
        (p) => !query.trim() || `${p.name} ${p.subtitle || ''}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    const chosen = invitees.filter((p) => selected[p.id]);

    const submit = async () => {
        setError(null);
        if (!reason.trim()) return setError('Please enter the reason for the meeting.');
        if (chosen.length === 0) return setError('Select at least one person to invite.');
        const [h, mi] = time.split(':').map(Number);
        const [y, mo, d] = dateStr.split('-').map(Number);
        const start = new Date(y, mo - 1, d, h, mi, 0, 0);
        if (start.getTime() < Date.now()) return setError('Please choose a date and time in the future.');

        const meeting: ScheduledMeeting = {
            id: `mtg_${Date.now()}`,
            reason: reason.trim(),
            notes: notes.trim(),
            startIso: start.toISOString(),
            durationMin,
            mode,
            invitees: chosen.map((c) => ({ id: c.id, name: c.name })),
            createdAtIso: new Date().toISOString(),
            reminders: [...reminders].sort((a, b) => b - a),
        };
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && reminders.length > 0) {
            // Ask once so reminders can also appear as a desktop notification while the app is open.
            Notification.requestPermission().catch(() => {});
        }
        const when = start.toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const others = chosen.map((c) => c.name).join(', ');
        const text =
            `📅 Meeting invitation from ${hostName}\n` +
            `Reason: ${meeting.reason}\n` +
            `When: ${when} (${durationMin} min, ${mode === 'video' ? 'Video Huddle' : 'Voice Call'})\n` +
            `Invited: ${others}` +
            (meeting.notes ? `\nNotes: ${meeting.notes}` : '') +
            (meeting.reminders && meeting.reminders.length ? `\nReminders: ${meeting.reminders.join(' & ')} min before` : '') +
            `\nOpen Messaging at the scheduled time to join.`;

        setSending(true);
        try {
            for (const p of chosen) {
                await onSendInvite(p, text);
            }
            saveMeeting(meeting);
            setDone(meeting);
        } catch {
            setError('Could not send every invitation. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const downloadIcs = () => {
        if (!done) return;
        const blob = new Blob([buildIcs(done, hostName)], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'connectln-meeting.ics';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-3xl w-[96vw] max-h-[92vh] overflow-y-auto bg-white text-slate-900">
                <DialogHeader>
                    <DialogTitle className="text-lg font-extrabold">📅 Schedule a meeting</DialogTitle>
                </DialogHeader>

                {done ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
                            <p className="font-extrabold text-emerald-900">Meeting scheduled and invitations sent.</p>
                            <p className="mt-1 text-emerald-900">
                                {done.reason} · {new Date(done.startIso).toLocaleString()} · {done.durationMin} min ·{' '}
                                {done.invitees.map((i) => i.name).join(', ')}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={downloadIcs} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold border border-slate-200">
                                ⬇ Add to my calendar (.ics)
                            </button>
                            <button onClick={onClose} className="px-3 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-extrabold" style={{ color: '#FFFFFF' }}>
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <button type="button" aria-label="Previous month" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} className="px-2 py-1 rounded-lg hover:bg-slate-100 font-bold">‹</button>
                                    <span className="text-sm font-extrabold">{monthCursor.toLocaleString([], { month: 'long', year: 'numeric' })}</span>
                                    <button type="button" aria-label="Next month" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} className="px-2 py-1 rounded-lg hover:bg-slate-100 font-bold">›</button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-1">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {cells.map((d, i) =>
                                        d ? (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled={d < today}
                                                onClick={() => setDateStr(ymd(d))}
                                                className={`h-8 rounded-lg text-xs font-bold ${ymd(d) === dateStr ? 'bg-[#0A66C2] text-white' : d < today ? 'text-slate-300' : 'hover:bg-slate-100'}`}
                                                style={ymd(d) === dateStr ? { color: '#FFFFFF' } : undefined}
                                            >
                                                {d.getDate()}
                                            </button>
                                        ) : (
                                            <span key={i} />
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="text-xs font-bold">Time
                                    <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal bg-white">
                                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </label>
                                <label className="text-xs font-bold">Duration
                                    <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal bg-white">
                                        {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
                                    </select>
                                </label>
                            </div>

                            <div className="flex gap-2 text-xs font-bold">
                                <button type="button" onClick={() => setMode('video')} className={`flex-1 rounded-lg border p-2 ${mode === 'video' ? 'bg-[#0A66C2] border-[#0A66C2]' : 'bg-white border-slate-300'}`} style={mode === 'video' ? { color: '#FFFFFF' } : undefined}>🎥 Video Huddle</button>
                                <button type="button" onClick={() => setMode('audio')} className={`flex-1 rounded-lg border p-2 ${mode === 'audio' ? 'bg-[#0A66C2] border-[#0A66C2]' : 'bg-white border-slate-300'}`} style={mode === 'audio' ? { color: '#FFFFFF' } : undefined}>📞 Voice Call</button>
                            </div>

                            <div className="text-xs font-bold">
                                Remind me before the meeting
                                <div className="mt-1 flex gap-3 font-normal">
                                    {[15, 30].map((min) => (
                                        <label key={min} className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={reminders.includes(min)}
                                                onChange={(e) =>
                                                    setReminders((r) => (e.target.checked ? Array.from(new Set([...r, min])) : r.filter((x) => x !== min)))
                                                }
                                                className="h-4 w-4"
                                            />
                                            {min} minutes before
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <label className="block text-xs font-bold">Reason for the meeting
                                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Project kickoff" className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal" />
                            </label>
                            <label className="block text-xs font-bold">Notes (optional)
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal" />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold">Invite connections ({chosen.length} selected)</span>
                                <button type="button" className="text-[11px] font-bold text-[#0A66C2]" onClick={() => setSelected(chosen.length === invitees.length ? {} : Object.fromEntries(invitees.map((p) => [p.id, true])))}>
                                    {chosen.length === invitees.length ? 'Clear all' : 'Select all'}
                                </button>
                            </div>
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people…" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
                            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                                {filtered.length === 0 && <p className="p-3 text-xs text-slate-500">No connections found.</p>}
                                {filtered.map((p) => (
                                    <label key={p.id} className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-slate-50">
                                        <input type="checkbox" checked={!!selected[p.id]} onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))} className="h-4 w-4" />
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {p.avatar ? <img src={p.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-slate-200" />}
                                        <span className="min-w-0">
                                            <span className="block text-sm font-bold truncate">{p.name}</span>
                                            {p.subtitle && <span className="block text-[11px] text-slate-500 truncate">{p.subtitle}</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!done && (
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <span className="text-xs text-red-600 font-bold">{error}</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold border border-slate-200">Cancel</button>
                            <button type="button" disabled={sending} onClick={submit} className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-extrabold disabled:opacity-60" style={{ color: '#FFFFFF' }}>
                                {sending ? 'Sending…' : 'Schedule & send invites'}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
