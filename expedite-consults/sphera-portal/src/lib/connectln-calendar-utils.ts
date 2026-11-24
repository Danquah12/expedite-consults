export type CalendarEventCategory = 'meeting' | 'shift' | 'focus' | 'site_visit' | 'ooo';
export type CalendarShowAs = 'busy' | 'tentative' | 'free' | 'oof';
export type CalendarRecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type CalendarRsvpStatus = 'organizer' | 'accepted' | 'tentative' | 'declined' | 'pending';

export interface CalendarAttendee {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  subtitle?: string;
  key: string;
  rsvp: CalendarRsvpStatus;
}

export interface ConnectLnCalendarEvent {
  id: string;
  title: string;
  category: CalendarEventCategory;
  showAs: CalendarShowAs;
  startIso: string;
  endIso: string;
  startMs: number;
  endMs: number;
  allDay?: boolean;
  recurrence: CalendarRecurrenceRule;
  recurrenceUntilIso?: string;
  callMode?: 'video' | 'audio' | 'in_person' | 'none';
  joinUrl?: string;
  location?: string;
  notes?: string;
  reminders?: number[];
  ownerId?: string;
  ownerName: string;
  ownerEmail?: string;
  ownerKey: string;
  attendees: CalendarAttendee[];
  participantKeys: string[];
  createdAtIso: string;
  updatedAtIso: string;
  cancelled?: boolean;
}

export interface ExpandedCalendarOccurrence {
  occurrenceKey: string;
  occurrenceStartMs: number;
  occurrenceEndMs: number;
  baseEvent: ConnectLnCalendarEvent;
  isRecurringInstance: boolean;
}

export const CALENDAR_CATEGORY_META: Record<
  CalendarEventCategory,
  {
    label: string;
    shortBadge: string;
    accentHex: string;
    softBgClass: string;
    borderClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  meeting: {
    label: 'Meeting',
    shortBadge: 'MTG',
    accentHex: '#0A66C2',
    softBgClass: 'bg-blue-50/95 hover:bg-blue-100/90',
    borderClass: 'border-blue-300 border-l-[#0A66C2]',
    textClass: 'text-blue-950',
    dotClass: 'bg-[#0A66C2]',
  },
  shift: {
    label: 'Work Shift',
    shortBadge: 'SHIFT',
    accentHex: '#7C4225',
    softBgClass: 'bg-amber-50/95 hover:bg-amber-100/90',
    borderClass: 'border-amber-300 border-l-[#7C4225]',
    textClass: 'text-amber-950',
    dotClass: 'bg-[#7C4225]',
  },
  focus: {
    label: 'Focus Time',
    shortBadge: 'FOCUS',
    accentHex: '#059669',
    softBgClass: 'bg-emerald-50/95 hover:bg-emerald-100/90',
    borderClass: 'border-emerald-300 border-l-[#059669]',
    textClass: 'text-emerald-950',
    dotClass: 'bg-[#059669]',
  },
  site_visit: {
    label: 'Site Visit',
    shortBadge: 'SITE',
    accentHex: '#4F46E5',
    softBgClass: 'bg-indigo-50/95 hover:bg-indigo-100/90',
    borderClass: 'border-indigo-300 border-l-[#4F46E5]',
    textClass: 'text-indigo-950',
    dotClass: 'bg-[#4F46E5]',
  },
  ooo: {
    label: 'Out of Office',
    shortBadge: 'OOO',
    accentHex: '#E11D48',
    softBgClass: 'bg-rose-50/95 hover:bg-rose-100/90',
    borderClass: 'border-rose-300 border-l-[#E11D48]',
    textClass: 'text-rose-950',
    dotClass: 'bg-[#E11D48]',
  },
};

export const CALENDAR_SHOW_AS_META: Record<CalendarShowAs, { label: string; dotClass: string }> = {
  busy: { label: 'Busy', dotClass: 'bg-[#0A66C2]' },
  tentative: { label: 'Tentative', dotClass: 'bg-amber-500' },
  free: { label: 'Free', dotClass: 'bg-emerald-500' },
  oof: { label: 'Out of Office', dotClass: 'bg-rose-600' },
};

export const CALENDAR_RECURRENCE_LABELS: Record<CalendarRecurrenceRule, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekdays: 'Every weekday (Mon–Fri)',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function normalizeCalendarParticipantKey(raw?: string): string {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return '';
  if (s.includes('@')) return s;
  return s.replace(/[^a-z0-9]/g, '');
}

export function buildViewerCalendarKeys(name?: string, email?: string): string[] {
  const keys = new Set<string>();
  const trimmedEmail = String(email || '').trim().toLowerCase();
  if (trimmedEmail) {
    keys.add(trimmedEmail);
    const localPart = trimmedEmail.split('@')[0] || '';
    const emailCompact = normalizeCalendarParticipantKey(localPart);
    if (emailCompact.length >= 4) keys.add(emailCompact);
  }
  const trimmedName = String(name || '').trim().toLowerCase();
  if (trimmedName) {
    keys.add(trimmedName);
    const compactName = normalizeCalendarParticipantKey(trimmedName);
    if (compactName) keys.add(compactName);
  }
  return Array.from(keys).filter(Boolean);
}

export function computeParticipantKeysForEvent(event: {
  ownerName?: string;
  ownerEmail?: string;
  ownerKey?: string;
  attendees?: CalendarAttendee[];
}): string[] {
  const set = new Set<string>();
  for (const k of buildViewerCalendarKeys(event.ownerName, event.ownerEmail)) {
    set.add(k);
  }
  const normalizedOwnerKey = normalizeCalendarParticipantKey(event.ownerKey);
  if (normalizedOwnerKey) set.add(normalizedOwnerKey);

  for (const att of event.attendees || []) {
    if (att.rsvp === 'declined') continue;
    for (const k of buildViewerCalendarKeys(att.name, att.email)) {
      set.add(k);
    }
    const attKey = normalizeCalendarParticipantKey(att.key);
    if (attKey) set.add(attKey);
  }
  return Array.from(set).filter(Boolean);
}

/**
 * Expands base events + recurring instances overlapping [rangeStartMs, rangeEndMs].
 * Uses local wall-clock components so daily/weekly shifts remain locked to user wall clock across DST.
 */
export function expandRecurringOccurrences(
  events: ConnectLnCalendarEvent[],
  rangeStartMs: number,
  rangeEndMs: number
): ExpandedCalendarOccurrence[] {
  const out: ExpandedCalendarOccurrence[] = [];
  const MAX_STEPS = 366;
  const MAX_INSTANCES_PER_EVENT = 180;

  for (const ev of events) {
    if (!ev || ev.cancelled) continue;
    const baseStartMs = Number.isFinite(ev.startMs) ? ev.startMs : new Date(ev.startIso).getTime();
    const baseEndMs = Number.isFinite(ev.endMs) ? ev.endMs : new Date(ev.endIso).getTime();
    if (!Number.isFinite(baseStartMs) || !Number.isFinite(baseEndMs) || baseEndMs <= baseStartMs) {
      continue;
    }

    const durationMs = baseEndMs - baseStartMs;
    const rule: CalendarRecurrenceRule = ev.recurrence || 'none';

    if (rule === 'none') {
      if (baseEndMs >= rangeStartMs && baseStartMs <= rangeEndMs) {
        out.push({
          occurrenceKey: `${ev.id}::${baseStartMs}`,
          occurrenceStartMs: baseStartMs,
          occurrenceEndMs: baseEndMs,
          baseEvent: ev,
          isRecurringInstance: false,
        });
      }
      continue;
    }

    const untilMs = ev.recurrenceUntilIso
      ? new Date(`${ev.recurrenceUntilIso.slice(0, 10)}T23:59:59.999`).getTime()
      : Number.POSITIVE_INFINITY;
    const effectiveMaxMs = Math.min(rangeEndMs, untilMs);

    const anchor = new Date(baseStartMs);
    const startH = anchor.getHours();
    const startMi = anchor.getMinutes();
    const startSec = anchor.getSeconds();
    const baseDayAnchor = anchor.getDate();

    let added = 0;
    for (let step = 0; step < MAX_STEPS && added < MAX_INSTANCES_PER_EVENT; step++) {
      let occDate: Date;
      if (rule === 'daily' || rule === 'weekdays') {
        occDate = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          baseDayAnchor + step,
          startH,
          startMi,
          startSec,
          0
        );
        if (rule === 'weekdays') {
          const dow = occDate.getDay();
          if (dow === 0 || dow === 6) continue;
        }
      } else if (rule === 'weekly') {
        occDate = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          baseDayAnchor + step * 7,
          startH,
          startMi,
          startSec,
          0
        );
      } else {
        // monthly — clamp to last day of target month if anchor was 29/30/31
        const targetMonthDate = new Date(anchor.getFullYear(), anchor.getMonth() + step, 1, startH, startMi, startSec, 0);
        const daysInTarget = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
        occDate = new Date(
          targetMonthDate.getFullYear(),
          targetMonthDate.getMonth(),
          Math.min(baseDayAnchor, daysInTarget),
          startH,
          startMi,
          startSec,
          0
        );
      }

      const occStartMs = occDate.getTime();
      const occEndMs = occStartMs + durationMs;

      if (occStartMs > effectiveMaxMs) break;
      if (occEndMs >= rangeStartMs && occStartMs <= rangeEndMs) {
        out.push({
          occurrenceKey: `${ev.id}::${occStartMs}`,
          occurrenceStartMs: occStartMs,
          occurrenceEndMs: occEndMs,
          baseEvent: ev,
          isRecurringInstance: step > 0,
        });
        added++;
      }
    }
  }

  return out.sort((a, b) => a.occurrenceStartMs - b.occurrenceStartMs);
}

/**
 * Assigns non-overlapping side-by-side columns within connected overlap clusters
 * for Day / Work Week / Week hourly views.
 */
export function layoutOverlappingEvents(
  occurrences: ExpandedCalendarOccurrence[]
): Array<ExpandedCalendarOccurrence & { colIndex: number; colCount: number }> {
  if (occurrences.length === 0) return [];
  const sorted = [...occurrences].sort(
    (a, b) => a.occurrenceStartMs - b.occurrenceStartMs || b.occurrenceEndMs - a.occurrenceEndMs
  );

  // Build connected overlap clusters first
  const clusters: ExpandedCalendarOccurrence[][] = [];
  let currentCluster: ExpandedCalendarOccurrence[] = [];
  let clusterMaxEnd = -Infinity;

  for (const occ of sorted) {
    if (currentCluster.length === 0 || occ.occurrenceStartMs < clusterMaxEnd) {
      currentCluster.push(occ);
      clusterMaxEnd = Math.max(clusterMaxEnd, occ.occurrenceEndMs);
    } else {
      clusters.push(currentCluster);
      currentCluster = [occ];
      clusterMaxEnd = occ.occurrenceEndMs;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  const placed: Array<ExpandedCalendarOccurrence & { colIndex: number; colCount: number }> = [];

  for (const cluster of clusters) {
    const colEndTimes: number[] = [];
    const assigned = cluster.map((occ) => {
      let colIndex = colEndTimes.findIndex((endMs) => endMs <= occ.occurrenceStartMs);
      if (colIndex === -1) {
        colIndex = colEndTimes.length;
        colEndTimes.push(occ.occurrenceEndMs);
      } else {
        colEndTimes[colIndex] = occ.occurrenceEndMs;
      }
      return { ...occ, colIndex };
    });
    const colCount = Math.max(1, colEndTimes.length);
    for (const item of assigned) {
      placed.push({ ...item, colCount });
    }
  }

  return placed;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function toLocalTimeString(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function icsUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeIcsText(raw: string): string {
  return String(raw || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildCalendarEventIcs(event: ConnectLnCalendarEvent): string {
  const start = new Date(event.startMs || event.startIso);
  const end = new Date(event.endMs || event.endIso);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ConnectLn//TeamsCalendar//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@conectln.com`,
    `DTSTAMP:${icsUtcStamp(new Date())}`,
  ];

  if (event.allDay) {
    const startDateTag = `${start.getFullYear()}${pad2(start.getMonth() + 1)}${pad2(start.getDate())}`;
    const endPlusOne = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    const endDateTag = `${endPlusOne.getFullYear()}${pad2(endPlusOne.getMonth() + 1)}${pad2(endPlusOne.getDate())}`;
    lines.push(`DTSTART;VALUE=DATE:${startDateTag}`, `DTEND;VALUE=DATE:${endDateTag}`);
  } else {
    lines.push(`DTSTART:${icsUtcStamp(start)}`, `DTEND:${icsUtcStamp(end)}`);
  }

  if (event.recurrence && event.recurrence !== 'none') {
    const untilSuffix = event.recurrenceUntilIso
      ? `;UNTIL=${icsUtcStamp(new Date(`${event.recurrenceUntilIso.slice(0, 10)}T23:59:59Z`))}`
      : '';
    if (event.recurrence === 'daily') lines.push(`RRULE:FREQ=DAILY${untilSuffix}`);
    else if (event.recurrence === 'weekdays') lines.push(`RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR${untilSuffix}`);
    else if (event.recurrence === 'weekly') lines.push(`RRULE:FREQ=WEEKLY${untilSuffix}`);
    else if (event.recurrence === 'monthly') lines.push(`RRULE:FREQ=MONTHLY${untilSuffix}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  const loc = event.location || event.joinUrl;
  if (loc) lines.push(`LOCATION:${escapeIcsText(loc)}`);
  if (event.joinUrl) lines.push(`URL:${event.joinUrl}`);

  const descParts = [
    event.notes || '',
    event.joinUrl ? `Join Meeting: ${event.joinUrl}` : '',
    `Organizer: ${event.ownerName}${event.ownerEmail ? ` <${event.ownerEmail}>` : ''}`,
  ].filter(Boolean);
  if (descParts.length) {
    lines.push(`DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`);
  }

  for (const min of event.reminders || []) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${escapeIcsText(event.title)} in ${min} min`,
      `TRIGGER:-PT${min}M`,
      'END:VALARM'
    );
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export const CALENDAR_CACHE_STORAGE_KEY = 'connectln_calendar_events_cache_v1';

interface CalendarCacheEnvelope {
  activeViewerKey?: string;
  viewers: Record<string, ConnectLnCalendarEvent[]>;
}

function readCacheEnvelope(): CalendarCacheEnvelope {
  if (typeof window === 'undefined') return { viewers: {} };
  try {
    const raw = window.localStorage.getItem(CALENDAR_CACHE_STORAGE_KEY);
    if (!raw) return { viewers: {} };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.viewers && typeof parsed.viewers === 'object') {
      return parsed as CalendarCacheEnvelope;
    }
    return { viewers: {} };
  } catch {
    return { viewers: {} };
  }
}

export function loadCachedCalendarEvents(viewerKey: string): ConnectLnCalendarEvent[] {
  const k = normalizeCalendarParticipantKey(viewerKey) || 'default';
  const env = readCacheEnvelope();
  const list = env.viewers[k];
  return Array.isArray(list) ? list : [];
}

export function saveCachedCalendarEvents(viewerKey: string, events: ConnectLnCalendarEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    const k = normalizeCalendarParticipantKey(viewerKey) || 'default';
    const env = readCacheEnvelope();
    env.activeViewerKey = k;
    env.viewers[k] = events.slice(0, 400);
    window.localStorage.setItem(CALENDAR_CACHE_STORAGE_KEY, JSON.stringify(env));
  } catch {
    // ignore storage quota errors
  }
}

export function loadActiveCachedCalendarEvents(): ConnectLnCalendarEvent[] {
  const env = readCacheEnvelope();
  if (env.activeViewerKey && Array.isArray(env.viewers[env.activeViewerKey])) {
    return env.viewers[env.activeViewerKey];
  }
  const firstKey = Object.keys(env.viewers)[0];
  return firstKey && Array.isArray(env.viewers[firstKey]) ? env.viewers[firstKey] : [];
}

export interface LegacyScheduledMeetingLike {
  id: string;
  reason: string;
  notes?: string;
  startIso: string;
  durationMin: number;
  mode: 'video' | 'audio';
  invitees: { id: string; name: string }[];
  createdAtIso?: string;
  reminders?: number[];
  joinUrl?: string;
}

export function convertLegacyMeetingToCalendarEvent(
  m: LegacyScheduledMeetingLike,
  ownerName: string,
  ownerEmail?: string
): ConnectLnCalendarEvent {
  const startDate = new Date(m.startIso);
  const startMs = Number.isFinite(startDate.getTime()) ? startDate.getTime() : Date.now();
  const durationMin = Number.isFinite(m.durationMin) && m.durationMin > 0 ? m.durationMin : 30;
  const endMs = startMs + durationMin * 60_000;
  const ownerKey =
    normalizeCalendarParticipantKey(ownerEmail) ||
    normalizeCalendarParticipantKey(ownerName) ||
    'connectln_member';

  const attendees: CalendarAttendee[] = (m.invitees || []).map((inv) => ({
    id: inv.id,
    name: inv.name,
    key: normalizeCalendarParticipantKey(inv.name),
    rsvp: 'pending',
  }));

  const participantKeys = computeParticipantKeysForEvent({
    ownerName,
    ownerEmail,
    ownerKey,
    attendees,
  });

  return {
    id: m.id,
    title: m.reason || 'ConnectLn Scheduled Meeting',
    category: 'meeting',
    showAs: 'busy',
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endMs).toISOString(),
    startMs,
    endMs,
    allDay: false,
    recurrence: 'none',
    callMode: m.mode || 'video',
    joinUrl: m.joinUrl,
    notes: m.notes || '',
    reminders: Array.isArray(m.reminders) ? m.reminders : [15, 30],
    ownerName: ownerName || 'You',
    ownerEmail: ownerEmail || undefined,
    ownerKey,
    attendees,
    participantKeys,
    createdAtIso: m.createdAtIso || new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
  };
}
