'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  RefreshCw,
  Settings,
  Upload,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConnectLnCalendarEvent } from '@/lib/connectln-calendar-utils';
import { setLocalPresenceStatus } from '@/lib/connectln-presence';

export interface CalendarPreferences {
  workStartHour: number;
  workEndHour: number;
  secondaryTimeZone: string;
  oooAutoDecline: boolean;
  oooMessage: string;
}

export const CALENDAR_PREFS_STORAGE_KEY = 'connectln_calendar_prefs_v1';

export const DUAL_TIMEZONE_OPTIONS = [
  { id: '', label: 'Single Time Zone (Local Only)' },
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { id: 'America/New_York', label: 'New York (ET)' },
  { id: 'America/Chicago', label: 'Chicago (CT)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { id: 'Europe/London', label: 'London (GMT/BST)' },
  { id: 'Africa/Accra', label: 'Accra, Ghana (GMT)' },
  { id: 'Europe/Paris', label: 'Paris / Berlin (CET)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

export function loadCalendarPreferences(): CalendarPreferences {
  if (typeof window === 'undefined') {
    return {
      workStartHour: 8,
      workEndHour: 17,
      secondaryTimeZone: '',
      oooAutoDecline: false,
      oooMessage: 'Out of office — auto-declining overlapping invites.',
    };
  }
  try {
    const raw = window.localStorage.getItem(CALENDAR_PREFS_STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        workStartHour: Number.isFinite(p.workStartHour) ? Number(p.workStartHour) : 8,
        workEndHour: Number.isFinite(p.workEndHour) ? Number(p.workEndHour) : 17,
        secondaryTimeZone: String(p.secondaryTimeZone || ''),
        oooAutoDecline: Boolean(p.oooAutoDecline),
        oooMessage: String(p.oooMessage || 'Out of office — auto-declining overlapping invites.'),
      };
    }
  } catch {}
  return {
    workStartHour: 8,
    workEndHour: 17,
    secondaryTimeZone: '',
    oooAutoDecline: false,
    oooMessage: 'Out of office — auto-declining overlapping invites.',
  };
}

export function saveCalendarPreferences(prefs: CalendarPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CALENDAR_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function formatHourInZone(localHour: number, timeZone: string): string {
  if (!timeZone) return '';
  try {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), localHour, 0, 0, 0);
    return d.toLocaleTimeString([], {
      timeZone,
      hour: 'numeric',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function toGoogleUtcStamp(ms: number): string {
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(
    d.getUTCHours()
  )}${pad2(d.getUTCMinutes())}00Z`;
}

export function buildGoogleCalendarAddUrl(ev: ConnectLnCalendarEvent): string {
  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${toGoogleUtcStamp(ev.startMs)}/${toGoogleUtcStamp(ev.endMs)}`,
    details: [ev.notes || '', ev.joinUrl ? `Join ConnectLn: ${ev.joinUrl}` : '']
      .filter(Boolean)
      .join('\n\n'),
    location: ev.location || ev.joinUrl || 'ConnectLn Video Meeting',
  });
  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

export function buildOutlookCalendarAddUrl(ev: ConnectLnCalendarEvent): string {
  const qs = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: ev.title,
    startdt: new Date(ev.startMs).toISOString(),
    enddt: new Date(ev.endMs).toISOString(),
    body: [ev.notes || '', ev.joinUrl ? `Join ConnectLn: ${ev.joinUrl}` : '']
      .filter(Boolean)
      .join('\n\n'),
    location: ev.location || ev.joinUrl || 'ConnectLn Video Meeting',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${qs.toString()}`;
}

interface AttendeeAvailability {
  name: string;
  email?: string;
  presenceStatus?: string;
  oooAutoDecline?: boolean;
  hasConflict: boolean;
  busyBlocks: Array<{ startMs: number; endMs: number; showAs: string; title: string }>;
}

export function SchedulingAssistantPanel({
  dateStr,
  startMs,
  endMs,
  durationMin,
  attendees,
  onPickSlot,
}: {
  dateStr: string;
  startMs: number;
  endMs: number;
  durationMin: number;
  attendees: Array<{ name: string; email?: string }>;
  onPickSlot: (slotStartMs: number, slotEndMs: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AttendeeAvailability[]>([]);
  const [anyConflict, setAnyConflict] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<
    Array<{ startMs: number; endMs: number; label: string }>
  >([]);

  const attendeesKey = JSON.stringify(attendees.map((a) => `${a.name}:${a.email || ''}`));

  useEffect(() => {
    if (!dateStr || !Number.isFinite(startMs) || !Number.isFinite(endMs)) return;
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams({
      checkAvailability: '1',
      date: dateStr,
      startMs: String(startMs),
      endMs: String(endMs),
      durationMin: String(Math.max(15, durationMin || 30)),
      attendees: JSON.stringify(attendees),
    });
    fetch(`/api/connectin/calendar?${qs.toString()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        setAvailability(Array.isArray(data.attendees) ? data.attendees : []);
        setAnyConflict(Boolean(data.anyConflict));
        setSuggestedSlots(Array.isArray(data.suggestedSlots) ? data.suggestedSlots : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateStr, startMs, endMs, durationMin, attendeesKey]);

  const dayAnchor = new Date(`${dateStr}T00:00:00`);
  const windowStartMs = dayAnchor.getTime() + 8 * 3600000;
  const windowSpanMs = 10 * 3600000; // 8 AM to 6 PM

  const toPct = (ms: number) =>
    Math.max(0, Math.min(100, ((ms - windowStartMs) / windowSpanMs) * 100));

  const targetLeftPct = toPct(startMs);
  const targetWidthPct = Math.max(3, toPct(endMs) - targetLeftPct);

  return (
    <div className="rounded-2xl border border-[#E0D6C5] bg-[#FBF8F3] p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-[#0A66C2]" />
          <span className="text-xs font-extrabold text-[#1C1917]">
            Scheduling Assistant (8 AM – 6 PM Free/Busy)
          </span>
        </div>
        {loading ? (
          <span className="text-[10.5px] font-semibold text-[#78716C]">Checking calendars...</span>
        ) : anyConflict ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10.5px] font-extrabold text-rose-800">
            <AlertTriangle className="h-3 w-3" />
            <span>Schedule Conflict Detected</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>All Attendees Available</span>
          </span>
        )}
      </div>

      {/* Per-attendee timeline bars */}
      {availability.length === 0 ? (
        <p className="text-[11px] text-[#78716C]">
          Add attendees to compare live free/busy and Out-of-Office schedules.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-[9.5px] font-bold text-[#78716C] px-0.5">
            <span>8a</span>
            <span>10a</span>
            <span>12p</span>
            <span>2p</span>
            <span>4p</span>
            <span>6p</span>
          </div>
          {availability.map((att) => (
            <div key={att.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#1C1917] truncate">{att.name}</span>
                <span
                  className={`text-[10px] font-extrabold ${
                    att.oooAutoDecline
                      ? 'text-purple-700'
                      : att.hasConflict
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {att.oooAutoDecline
                    ? 'Out of Office (Auto-Decline)'
                    : att.hasConflict
                    ? 'Busy Conflict'
                    : 'Free'}
                </span>
              </div>
              <div className="relative h-5 rounded-lg bg-emerald-50 border border-emerald-200 overflow-hidden">
                {att.busyBlocks.map((b, bi) => {
                  const l = toPct(b.startMs);
                  const w = Math.max(2, toPct(b.endMs) - l);
                  return (
                    <div
                      key={bi}
                      title={`${b.title} (${b.showAs})`}
                      className={`absolute inset-y-0 ${
                        b.showAs === 'oof'
                          ? 'bg-rose-500/80'
                          : b.showAs === 'tentative'
                          ? 'bg-amber-400/80'
                          : 'bg-[#0A66C2]/75'
                      }`}
                      style={{ left: `${l}%`, width: `${w}%` }}
                    />
                  );
                })}
                {/* Proposed time window overlay */}
                <div
                  className={`absolute inset-y-0 border-2 ${
                    att.hasConflict
                      ? 'border-rose-700 bg-rose-500/20'
                      : 'border-emerald-700 bg-emerald-500/20'
                  }`}
                  style={{ left: `${targetLeftPct}%`, width: `${targetWidthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Conflict-Free Times */}
      {suggestedSlots.length > 0 && (
        <div className="pt-2 border-t border-[#E0D6C5] space-y-1.5">
          <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#57534E]">
            Suggested Open Slots:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSlots.map((slot) => (
              <button
                key={slot.startMs}
                type="button"
                onClick={() => onPickSlot(slot.startMs, slot.endMs)}
                className="rounded-lg bg-white hover:bg-blue-50 border border-[#D0C4AE] hover:border-[#0A66C2] px-2.5 py-1 text-[11px] font-bold text-[#0A66C2] cursor-pointer"
              >
                ✓ {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CalendarSyncSettingsModal({
  open,
  onClose,
  userName,
  userEmail,
  prefs,
  onSavePrefs,
  onImportedEvents,
  triggerToast,
}: {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  prefs: CalendarPreferences;
  onSavePrefs: (next: CalendarPreferences) => void;
  onImportedEvents: () => void;
  triggerToast: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<CalendarPreferences>(prefs);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (open) setDraft(prefs);
  }, [open, prefs]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://conectln.com';
  const feedUrl = `${origin}/api/connectin/calendar/ics?userName=${encodeURIComponent(
    userName || ''
  )}&userEmail=${encodeURIComponent(userEmail || '')}`;

  const handleImportIcsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    try {
      const icsText = await file.text();
      const res = await fetch('/api/connectin/calendar/ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icsText, userName, userEmail }),
      });
      const data = await res.json();
      if (data?.ok) {
        triggerToast(`📅 Imported ${data.importedCount || 0} event(s) from ${file.name}.`);
        onImportedEvents();
      } else {
        triggerToast(data?.error || 'Could not parse that .ics calendar file.');
      }
    } catch {
      triggerToast('Failed to import .ics calendar file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-[#FBF8F3] border border-[#D0C4AE] text-[#1C1917]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
            <Settings className="h-4 w-4 text-[#0A66C2]" />
            <span>Calendar Sync, Working Hours &amp; Dual Time Zone</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Two-Way Google & Outlook Sync Feed */}
          <div className="rounded-2xl bg-white border border-[#E0D6C5] p-3.5 space-y-2">
            <p className="font-extrabold text-[#1C1917] flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>Subscribe in Google Calendar, Outlook &amp; Apple Calendar</span>
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 rounded-lg bg-[#F3EDE2] border border-[#D0C4AE] px-2.5 py-1.5 text-[11px] font-mono text-[#1C1917]"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(feedUrl).catch(() => {});
                  triggerToast('🔗 Live ConnectLn Calendar feed URL copied!');
                }}
                className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 text-[11px] font-extrabold text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="h-3 w-3" />
                <span>Copy URL</span>
              </button>
            </div>
            <p className="text-[11px] text-[#57534E]">
              In Google Calendar choose <strong>Other calendars → From URL</strong>; in Outlook choose{' '}
              <strong>Add calendar → Subscribe from web</strong>.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] px-3 py-1.5 text-[11px] font-bold text-[#5E3119] cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>{importing ? 'Importing...' : 'Import .ics File from Google / Outlook'}</span>
                <input
                  type="file"
                  accept=".ics,text/calendar"
                  className="hidden"
                  onChange={handleImportIcsFile}
                />
              </label>
              <a
                href={feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Download .ics Snapshot</span>
              </a>
            </div>
          </div>

          {/* Working Hours & Dual Time Zone */}
          <div className="rounded-2xl bg-white border border-[#E0D6C5] p-3.5 space-y-3">
            <p className="font-extrabold text-[#1C1917] flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>Working Hours &amp; Dual Time Zone Display</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[11px] font-bold text-[#57534E]">Workday Starts</span>
                <select
                  value={draft.workStartHour}
                  onChange={(e) => setDraft((d) => ({ ...d, workStartHour: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg bg-[#F7F2E8] border border-[#D0C4AE] px-2.5 py-1.5 text-xs font-semibold"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 5).map((h) => (
                    <option key={h} value={h}>
                      {h <= 12 ? `${h}:00 AM` : `${h - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-[#57534E]">Workday Ends</span>
                <select
                  value={draft.workEndHour}
                  onChange={(e) => setDraft((d) => ({ ...d, workEndHour: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg bg-[#F7F2E8] border border-[#D0C4AE] px-2.5 py-1.5 text-xs font-semibold"
                >
                  {Array.from({ length: 13 }, (_, i) => i + 11).map((h) => (
                    <option key={h} value={h}>
                      {h === 12 ? '12:00 PM' : h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] font-bold text-[#57534E]">
                Secondary Time Zone Column (Shown Alongside Local Hours)
              </span>
              <select
                value={draft.secondaryTimeZone}
                onChange={(e) => setDraft((d) => ({ ...d, secondaryTimeZone: e.target.value }))}
                className="mt-1 w-full rounded-lg bg-[#F7F2E8] border border-[#D0C4AE] px-2.5 py-1.5 text-xs font-semibold"
              >
                {DUAL_TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="pt-2 border-t border-[#E0D6C5] space-y-2">
              <label className="flex items-center gap-2 font-bold text-[#1C1917] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.oooAutoDecline}
                  onChange={(e) => setDraft((d) => ({ ...d, oooAutoDecline: e.target.checked }))}
                />
                <span>Enable Out-of-Office Auto-Decline for New Invites</span>
              </label>
              {draft.oooAutoDecline && (
                <input
                  type="text"
                  value={draft.oooMessage}
                  onChange={(e) => setDraft((d) => ({ ...d, oooMessage: e.target.value }))}
                  placeholder="Out of office auto-reply note..."
                  className="w-full rounded-lg bg-[#F7F2E8] border border-[#D0C4AE] px-2.5 py-1.5 text-xs"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#EFE8DA] px-4 py-2 font-bold text-[#57534E] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                saveCalendarPreferences(draft);
                onSavePrefs(draft);
                if (draft.oooAutoDecline) {
                  await setLocalPresenceStatus(
                    {
                      status: 'ooo',
                      oooAutoDecline: true,
                      oooMessage: draft.oooMessage,
                    },
                    { name: userName, email: userEmail }
                  );
                } else {
                  await setLocalPresenceStatus(
                    { oooAutoDecline: false },
                    { name: userName, email: userEmail }
                  );
                }
                triggerToast('✓ Saved Calendar Sync, Working Hours & Time Zone preferences.');
                onClose();
              }}
              style={{ color: '#FFFFFF' }}
              className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 font-extrabold cursor-pointer flex items-center gap-1.5"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
