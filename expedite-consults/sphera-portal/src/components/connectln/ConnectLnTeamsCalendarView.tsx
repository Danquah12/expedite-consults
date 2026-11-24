'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  MapPin,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Phone,
  Plus,
  Repeat,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { B2BConversationThread } from '@/lib/b2b-messaging-data';
import {
  CALENDAR_CATEGORY_META,
  CALENDAR_RECURRENCE_LABELS,
  CALENDAR_SHOW_AS_META,
  CalendarAttendee,
  CalendarEventCategory,
  CalendarRecurrenceRule,
  CalendarRsvpStatus,
  CalendarShowAs,
  ConnectLnCalendarEvent,
  ExpandedCalendarOccurrence,
  buildCalendarEventIcs,
  buildViewerCalendarKeys,
  convertLegacyMeetingToCalendarEvent,
  expandRecurringOccurrences,
  layoutOverlappingEvents,
  loadCachedCalendarEvents,
  normalizeCalendarParticipantKey,
  saveCachedCalendarEvents,
  toLocalDateString,
  toLocalTimeString,
} from '@/lib/connectln-calendar-utils';
import { loadScheduledMeetings, MeetingInvitee } from './ScheduleMeetingModal';

export type CalendarViewMode = 'day' | 'work_week' | 'week' | 'month' | 'agenda';

interface ConnectLnTeamsCalendarViewProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    headline?: string;
  };
  threads: B2BConversationThread[];
  invitees: MeetingInvitee[];
  onStartLiveCall: (mode: 'audio' | 'video', targetName?: string) => void;
  onSelectChatThread: (threadId: string) => void;
  onSendInvite?: (invitee: MeetingInvitee, text: string) => Promise<void> | void;
  onEventsCountChange?: (todayCount: number) => void;
  triggerToast: (msg: string) => void;
}

const HOUR_HEIGHT_PX = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const VIEW_MODES: Array<{ id: CalendarViewMode; label: string; shortLabel: string }> = [
  { id: 'day', label: 'Day', shortLabel: 'Day' },
  { id: 'work_week', label: 'Work Week', shortLabel: 'Work Wk' },
  { id: 'week', label: 'Week', shortLabel: 'Week' },
  { id: 'month', label: 'Month', shortLabel: 'Month' },
  { id: 'agenda', label: 'Agenda', shortLabel: 'Agenda' },
];

const QUICK_DURATIONS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: '8h Shift', minutes: 480 },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta, 0, 0, 0, 0);
}

function startOfWeekSunday(d: Date): Date {
  const s = startOfDay(d);
  return addDays(s, -s.getDay());
}

function startOfWorkWeekMonday(d: Date): Date {
  const s = startOfDay(d);
  const dow = s.getDay(); // 0=Sun..6=Sat
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  return addDays(s, diffToMon);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function formatTimeShort(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getViewerRsvpStatus(
  ev: ConnectLnCalendarEvent,
  viewerKeySet: Set<string>
): CalendarRsvpStatus {
  const ownerKeys = [
    normalizeCalendarParticipantKey(ev.ownerKey),
    normalizeCalendarParticipantKey(ev.ownerEmail),
    normalizeCalendarParticipantKey(ev.ownerName),
  ].filter(Boolean);
  if (ownerKeys.some((k) => viewerKeySet.has(k))) return 'organizer';

  for (const att of ev.attendees || []) {
    const keys = [
      normalizeCalendarParticipantKey(att.key),
      normalizeCalendarParticipantKey(att.email),
      normalizeCalendarParticipantKey(att.name),
    ].filter(Boolean);
    if (keys.some((k) => viewerKeySet.has(k))) {
      return att.rsvp || 'pending';
    }
  }
  return 'pending';
}

function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = (timeStr || '09:00').split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const total = Math.min(23 * 60 + 45, Math.max(15, h * 60 + m + minutesToAdd));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

function computeDurationMinutes(startStr: string, endStr: string): number {
  const [sh, sm] = (startStr || '09:00').split(':').map(Number);
  const [eh, em] = (endStr || '10:00').split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

interface EventEditorDraft {
  id?: string;
  title: string;
  category: CalendarEventCategory;
  showAs: CalendarShowAs;
  dateStr: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  recurrence: CalendarRecurrenceRule;
  recurrenceUntilIso: string;
  callMode: 'video' | 'audio' | 'in_person' | 'none';
  location: string;
  notes: string;
  reminders: number[];
  selectedInviteeKeys: Record<string, boolean>;
}

function buildEmptyDraft(date: Date, startHour = 9): EventEditorDraft {
  const safeStartHour = Math.max(0, Math.min(22, startHour));
  return {
    title: '',
    category: 'meeting',
    showAs: 'busy',
    dateStr: toLocalDateString(date),
    startTime: `${pad2(safeStartHour)}:00`,
    endTime: `${pad2(Math.min(23, safeStartHour + 1))}:00`,
    allDay: false,
    recurrence: 'none',
    recurrenceUntilIso: '',
    callMode: 'video',
    location: '',
    notes: '',
    reminders: [15],
    selectedInviteeKeys: {},
  };
}

export function ConnectLnTeamsCalendarView({
  currentUser,
  threads,
  invitees,
  onStartLiveCall,
  onSelectChatThread,
  onSendInvite,
  onEventsCountChange,
  triggerToast,
}: ConnectLnTeamsCalendarViewProps) {
  const viewerName = String(currentUser?.name || 'ConnectLn Member').trim();
  const viewerEmail = String(currentUser?.email || '').trim().toLowerCase() || undefined;
  const viewerCacheKey = useMemo(
    () =>
      normalizeCalendarParticipantKey(viewerEmail) ||
      normalizeCalendarParticipantKey(viewerName) ||
      'default',
    [viewerEmail, viewerName]
  );
  const viewerKeys = useMemo(
    () => buildViewerCalendarKeys(viewerName, viewerEmail),
    [viewerEmail, viewerName]
  );
  const viewerKeySet = useMemo(() => new Set(viewerKeys), [viewerKeys]);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('work_week');
  const [anchorDate, setAnchorDate] = useState<Date>(() => startOfDay(new Date()));
  const [miniMonthCursor, setMiniMonthCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCategories, setVisibleCategories] = useState<Record<CalendarEventCategory, boolean>>({
    meeting: true,
    shift: true,
    focus: true,
    site_visit: true,
    ooo: true,
  });
  const [agendaOnlyPending, setAgendaOnlyPending] = useState(false);

  const [events, setEvents] = useState<ConnectLnCalendarEvent[]>(() => {
    const cached = loadCachedCalendarEvents(viewerCacheKey);
    const legacy = loadScheduledMeetings().map((m) =>
      convertLegacyMeetingToCalendarEvent(m, viewerName, viewerEmail)
    );
    const byId = new Map<string, ConnectLnCalendarEvent>();
    for (const ev of legacy) byId.set(ev.id, ev);
    for (const ev of cached) byId.set(ev.id, ev);
    return Array.from(byId.values()).sort((a, b) => a.startMs - b.startMs);
  });
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [inspectedOccurrence, setInspectedOccurrence] =
    useState<ExpandedCalendarOccurrence | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EventEditorDraft>(() =>
    buildEmptyDraft(new Date(), 9)
  );
  const [editorInviteeSearch, setEditorInviteeSearch] = useState('');
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

  const timeGridScrollRef = useRef<HTMLDivElement | null>(null);
  const legacySyncedRef = useRef(false);

  // Switch default view cleanly on narrow screens if initial mount is mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode((prev) => (prev === 'work_week' ? 'day' : prev));
      setSidebarOpen(false);
    }
  }, []);

  // Update live red time indicator every 60s
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Scroll time grid to working hours / current time when switching to hourly views
  useEffect(() => {
    if (viewMode !== 'day' && viewMode !== 'work_week' && viewMode !== 'week') return;
    const el = timeGridScrollRef.current;
    if (!el) return;
    const currentHour = new Date().getHours();
    const targetHour = currentHour >= 7 && currentHour <= 20 ? Math.max(0, currentHour - 2) : 7.5;
    el.scrollTop = targetHour * HOUR_HEIGHT_PX;
  }, [viewMode]);

  const fetchCalendarFromCloud = useCallback(
    async (silent = false) => {
      if (!viewerKeys.length) return;
      if (!silent) setIsSyncing(true);
      try {
        // First one-time upsert of any legacy localStorage meetings into MongoDB
        if (!legacySyncedRef.current) {
          legacySyncedRef.current = true;
          const legacyLocal = loadScheduledMeetings();
          if (legacyLocal.length > 0) {
            const converted = legacyLocal.map((m) =>
              convertLegacyMeetingToCalendarEvent(m, viewerName, viewerEmail)
            );
            await fetch('/api/connectin/calendar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'sync_local',
                userName: viewerName,
                userEmail: viewerEmail,
                events: converted,
              }),
            }).catch(() => {});
          }
        }

        const qs = new URLSearchParams({
          userName: viewerName,
          ...(viewerEmail ? { userEmail: viewerEmail } : {}),
        });
        const res = await fetch(`/api/connectin/calendar?${qs.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.ok && Array.isArray(data.events)) {
          setMongoConnected(Boolean(data.mongoConnected));
          const serverEvents: ConnectLnCalendarEvent[] = data.events;
          const legacyOnly = loadScheduledMeetings()
            .filter((m) => !serverEvents.some((s) => s.id === m.id))
            .map((m) => convertLegacyMeetingToCalendarEvent(m, viewerName, viewerEmail));
          const merged = [...serverEvents, ...legacyOnly].sort((a, b) => a.startMs - b.startMs);
          setEvents(merged);
          saveCachedCalendarEvents(viewerCacheKey, merged);
        }
      } catch {
        // retain cached schedule
      } finally {
        if (!silent) setIsSyncing(false);
      }
    },
    [viewerCacheKey, viewerEmail, viewerKeys.length, viewerName]
  );

  // Hydrate immediately from cache + fetch from cloud + 30s background poll
  useEffect(() => {
    fetchCalendarFromCloud(false);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCalendarFromCloud(true);
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [fetchCalendarFromCloud]);

  // Keep localStorage cache synchronized whenever events update optimistically
  useEffect(() => {
    saveCachedCalendarEvents(viewerCacheKey, events);
  }, [events, viewerCacheKey]);

  const todayDate = useMemo(() => startOfDay(new Date(nowMs)), [nowMs]);

  // Summary metrics across Today & This Week + Rail Badge
  const summaryStats = useMemo(() => {
    const tStart = todayDate.getTime();
    const tEnd = endOfDay(todayDate).getTime();
    const wStart = startOfWorkWeekMonday(todayDate).getTime();
    const wEnd = endOfDay(addDays(startOfWorkWeekMonday(todayDate), 6)).getTime();

    const weekOccs = expandRecurringOccurrences(events, wStart, wEnd);
    const nonDeclinedWeek = weekOccs.filter(
      (o) => getViewerRsvpStatus(o.baseEvent, viewerKeySet) !== 'declined'
    );
    const todayOccs = nonDeclinedWeek.filter(
      (o) => o.occurrenceEndMs >= tStart && o.occurrenceStartMs <= tEnd
    );

    let weekMinutes = 0;
    for (const occ of nonDeclinedWeek) {
      if (occ.baseEvent.allDay) continue;
      weekMinutes += Math.max(0, Math.round((occ.occurrenceEndMs - occ.occurrenceStartMs) / 60_000));
    }

    const pendingCount = events.filter((ev) => {
      if (ev.cancelled) return false;
      const rsvp = getViewerRsvpStatus(ev, viewerKeySet);
      return rsvp === 'pending' && ev.endMs >= tStart;
    }).length;

    return {
      todayCount: todayOccs.length,
      weekHours: Math.round((weekMinutes / 60) * 10) / 10,
      pendingCount,
    };
  }, [events, todayDate, viewerKeySet]);

  useEffect(() => {
    onEventsCountChange?.(summaryStats.todayCount);
  }, [onEventsCountChange, summaryStats.todayCount]);

  // Filtered events (category checkboxes + search query)
  const filteredBaseEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      if (ev.cancelled) return false;
      if (!visibleCategories[ev.category || 'meeting']) return false;
      if (!q) return true;
      const attStr = (ev.attendees || []).map((a) => `${a.name} ${a.email || ''}`).join(' ');
      const haystack = `${ev.title} ${ev.ownerName} ${ev.location || ''} ${ev.notes || ''} ${attStr}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [events, searchQuery, visibleCategories]);

  // Visible columns for Day / Work Week / Week
  const visibleDays = useMemo(() => {
    if (viewMode === 'day') return [startOfDay(anchorDate)];
    if (viewMode === 'work_week') {
      const mon = startOfWorkWeekMonday(anchorDate);
      return Array.from({ length: 5 }, (_, i) => addDays(mon, i));
    }
    if (viewMode === 'week') {
      const sun = startOfWeekSunday(anchorDate);
      return Array.from({ length: 7 }, (_, i) => addDays(sun, i));
    }
    return [startOfDay(anchorDate)];
  }, [anchorDate, viewMode]);

  // Expanded occurrences for active grid / agenda range
  const activeRangeOccurrences = useMemo(() => {
    if (viewMode === 'month') {
      const monthFirst = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
      const gridStart = startOfWeekSunday(monthFirst);
      const gridEnd = endOfDay(addDays(gridStart, 41));
      return expandRecurringOccurrences(filteredBaseEvents, gridStart.getTime(), gridEnd.getTime());
    }
    if (viewMode === 'agenda') {
      const rangeStart = startOfDay(anchorDate).getTime();
      const rangeEnd = endOfDay(addDays(anchorDate, 29)).getTime();
      const expanded = expandRecurringOccurrences(filteredBaseEvents, rangeStart, rangeEnd);
      if (agendaOnlyPending) {
        return expanded.filter((o) => getViewerRsvpStatus(o.baseEvent, viewerKeySet) === 'pending');
      }
      return expanded;
    }
    const rangeStart = visibleDays[0].getTime();
    const rangeEnd = endOfDay(visibleDays[visibleDays.length - 1]).getTime();
    return expandRecurringOccurrences(filteredBaseEvents, rangeStart, rangeEnd);
  }, [agendaOnlyPending, anchorDate, filteredBaseEvents, viewMode, viewerKeySet, visibleDays]);

  // Mini month dots set
  const miniMonthDots = useMemo(() => {
    const monthFirst = new Date(miniMonthCursor.getFullYear(), miniMonthCursor.getMonth(), 1);
    const gridStart = startOfWeekSunday(monthFirst);
    const gridEnd = endOfDay(addDays(gridStart, 41));
    const occs = expandRecurringOccurrences(events, gridStart.getTime(), gridEnd.getTime());
    const map = new Map<string, string[]>();
    for (const occ of occs) {
      if (getViewerRsvpStatus(occ.baseEvent, viewerKeySet) === 'declined') continue;
      const d = new Date(occ.occurrenceStartMs);
      const key = toLocalDateString(d);
      const hex = CALENDAR_CATEGORY_META[occ.baseEvent.category || 'meeting']?.accentHex || '#0A66C2';
      const arr = map.get(key) || [];
      if (!arr.includes(hex) && arr.length < 3) {
        arr.push(hex);
        map.set(key, arr);
      }
    }
    return map;
  }, [events, miniMonthCursor, viewerKeySet]);

  const navigateRange = (dir: -1 | 1) => {
    if (viewMode === 'day') setAnchorDate((d) => addDays(d, dir));
    else if (viewMode === 'work_week' || viewMode === 'week') setAnchorDate((d) => addDays(d, dir * 7));
    else if (viewMode === 'month') {
      setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
      setMiniMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
    } else {
      setAnchorDate((d) => addDays(d, dir * 14));
    }
  };

  const jumpToToday = () => {
    const t = startOfDay(new Date());
    setAnchorDate(t);
    setMiniMonthCursor(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const headerTitle = useMemo(() => {
    if (viewMode === 'day') {
      return anchorDate.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'month') {
      return anchorDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'agenda') {
      const end = addDays(anchorDate, 29);
      return `${anchorDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString([], { month: 'short' })} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${first.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }, [anchorDate, viewMode, visibleDays]);

  // ---- EVENT MODAL HELPERS ----
  const openNewEventModal = (date: Date, hour = 9) => {
    setEditorError(null);
    setEditorInviteeSearch('');
    setEditorDraft(buildEmptyDraft(date, hour));
    setEditorOpen(true);
  };

  const openEditEventModal = (ev: ConnectLnCalendarEvent) => {
    const s = new Date(ev.startMs || ev.startIso);
    const e = new Date(ev.endMs || ev.endIso);
    const invKeys: Record<string, boolean> = {};
    for (const att of ev.attendees || []) {
      const matched = invitees.find(
        (p) =>
          normalizeCalendarParticipantKey(p.name) === normalizeCalendarParticipantKey(att.name) ||
          (att.id && p.id === att.id)
      );
      if (matched) invKeys[matched.id] = true;
    }
    setEditorError(null);
    setEditorInviteeSearch('');
    setEditorDraft({
      id: ev.id,
      title: ev.title,
      category: ev.category || 'meeting',
      showAs: ev.showAs || 'busy',
      dateStr: toLocalDateString(s),
      startTime: toLocalTimeString(s),
      endTime: toLocalTimeString(e),
      allDay: Boolean(ev.allDay),
      recurrence: ev.recurrence || 'none',
      recurrenceUntilIso: ev.recurrenceUntilIso ? ev.recurrenceUntilIso.slice(0, 10) : '',
      callMode: ev.callMode || 'video',
      location: ev.location || '',
      notes: ev.notes || '',
      reminders: Array.isArray(ev.reminders) && ev.reminders.length ? ev.reminders : [15],
      selectedInviteeKeys: invKeys,
    });
    setInspectedOccurrence(null);
    setEditorOpen(true);
  };

  const saveEditorEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditorError(null);
    const title = editorDraft.title.trim();
    if (!title) {
      setEditorError('Please enter an event title.');
      return;
    }

    const [y, mo, d] = editorDraft.dateStr.split('-').map(Number);
    let start: Date;
    let end: Date;
    if (editorDraft.allDay) {
      start = new Date(y, mo - 1, d, 0, 0, 0, 0);
      end = new Date(y, mo - 1, d, 23, 59, 0, 0);
    } else {
      const [sh, sm] = editorDraft.startTime.split(':').map(Number);
      const [eh, em] = editorDraft.endTime.split(':').map(Number);
      start = new Date(y, mo - 1, d, sh, sm, 0, 0);
      end = new Date(y, mo - 1, d, eh, em, 0, 0);
      if (end.getTime() <= start.getTime()) {
        setEditorError('End time must be after start time.');
        return;
      }
    }

    const chosenInvitees = invitees.filter((p) => editorDraft.selectedInviteeKeys[p.id]);
    const attendees: CalendarAttendee[] = chosenInvitees.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      subtitle: p.subtitle,
      key: normalizeCalendarParticipantKey(p.name),
      rsvp: 'pending',
    }));

    const isUpdate = Boolean(editorDraft.id);
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://conectln.com';

    setIsSavingEvent(true);
    try {
      const res = await fetch('/api/connectin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isUpdate ? 'update' : 'create',
          userName: viewerName,
          userEmail: viewerEmail,
          origin,
          event: {
            id: editorDraft.id,
            title,
            category: editorDraft.category,
            showAs: editorDraft.showAs,
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            allDay: editorDraft.allDay,
            recurrence: editorDraft.recurrence,
            recurrenceUntilIso: editorDraft.recurrenceUntilIso || undefined,
            callMode: editorDraft.callMode,
            location: editorDraft.location.trim() || undefined,
            notes: editorDraft.notes.trim(),
            reminders: editorDraft.reminders,
            ownerId: currentUser?.id,
            ownerName: viewerName,
            ownerEmail: viewerEmail,
            attendees,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.event) {
        setEditorError(data?.error || 'Unable to save schedule block.');
        return;
      }
      const savedEvent: ConnectLnCalendarEvent = data.event;
      setMongoConnected(Boolean(data.mongoConnected));
      setEvents((prev) =>
        [savedEvent, ...prev.filter((ev) => ev.id !== savedEvent.id)].sort(
          (a, b) => a.startMs - b.startMs
        )
      );
      setEditorOpen(false);
      triggerToast(
        isUpdate
          ? `Updated "${savedEvent.title}" on your schedule`
          : `Added "${savedEvent.title}" to your schedule`
      );

      // Dispatch DM invitations for newly created events with invitees
      if (!isUpdate && chosenInvitees.length > 0 && onSendInvite) {
        const whenStr = savedEvent.allDay
          ? `${start.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} (All Day)`
          : `${start.toLocaleString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const inviteNames = chosenInvitees.slice(0, 5).map((c) => c.name).join(', ');
        const text =
          `📅 Meeting invitation from ${viewerName}\n` +
          `Reason: ${savedEvent.title}\n` +
          `When: ${whenStr}\n` +
          `Invited: ${inviteNames}${chosenInvitees.length > 5 ? ` + ${chosenInvitees.length - 5} more` : ''}` +
          (savedEvent.location ? `\nLocation: ${savedEvent.location}` : '') +
          (savedEvent.notes ? `\nNotes: ${savedEvent.notes}` : '') +
          (savedEvent.joinUrl ? `\n🔗 Join the meeting: ${savedEvent.joinUrl}` : '') +
          `\n📋 Check your ConnectLn Calendar or respond below.`;
        Promise.allSettled(
          chosenInvitees.map((inv) => Promise.resolve(onSendInvite(inv, text)))
        ).catch(() => {});
      }
    } catch {
      setEditorError('Network error while saving event.');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleRsvpAction = async (
    ev: ConnectLnCalendarEvent,
    rsvp: 'accepted' | 'tentative' | 'declined'
  ) => {
    setIsMutatingId(ev.id);
    try {
      const res = await fetch('/api/connectin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rsvp',
          eventId: ev.id,
          userName: viewerName,
          userEmail: viewerEmail,
          rsvp,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.event) {
        setEvents((prev) => prev.map((x) => (x.id === ev.id ? data.event : x)));
        setInspectedOccurrence((prev) =>
          prev && prev.baseEvent.id === ev.id ? { ...prev, baseEvent: data.event } : prev
        );
        triggerToast(`RSVP updated to "${rsvp}" for ${ev.title}`);
      }
    } catch {
      triggerToast('Could not update RSVP right now.');
    } finally {
      setIsMutatingId(null);
    }
  };

  const handleDeleteOrLeave = async (ev: ConnectLnCalendarEvent) => {
    setIsMutatingId(ev.id);
    try {
      const res = await fetch('/api/connectin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          eventId: ev.id,
          userName: viewerName,
          userEmail: viewerEmail,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setEvents((prev) => prev.filter((x) => x.id !== ev.id));
        setInspectedOccurrence(null);
        triggerToast(
          data.actionTaken === 'left'
            ? `Removed "${ev.title}" from your calendar`
            : `Deleted "${ev.title}"`
        );
      } else {
        triggerToast(data?.error || 'Could not remove event.');
      }
    } catch {
      triggerToast('Could not remove event right now.');
    } finally {
      setIsMutatingId(null);
    }
  };

  const handleOpenEventChat = (ev: ConnectLnCalendarEvent) => {
    const targetNames = [
      ev.ownerName,
      ...(ev.attendees || []).map((a) => a.name),
    ].filter((n) => normalizeCalendarParticipantKey(n) !== normalizeCalendarParticipantKey(viewerName));
    const matched = threads.find((t) =>
      targetNames.some(
        (n) =>
          normalizeCalendarParticipantKey(t.title) === normalizeCalendarParticipantKey(n) ||
          t.title.toLowerCase().includes(n.toLowerCase())
      )
    );
    if (matched) {
      setInspectedOccurrence(null);
      onSelectChatThread(matched.id);
    } else {
      triggerToast('No active chat thread yet for these attendees.');
    }
  };

  const handleJoinMeeting = (ev: ConnectLnCalendarEvent) => {
    const mode = ev.callMode === 'audio' ? 'audio' : 'video';
    const target =
      ev.attendees.find(
        (a) => normalizeCalendarParticipantKey(a.name) !== normalizeCalendarParticipantKey(viewerName)
      )?.name || ev.ownerName;
    setInspectedOccurrence(null);
    onStartLiveCall(mode, target);
  };

  const handleDownloadIcs = (ev: ConnectLnCalendarEvent) => {
    const ics = buildCalendarEventIcs(ev);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'event'}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Downloaded .ics calendar file');
  };

  // ---- RENDER HELPERS FOR MINI MONTH GRID ----
  const miniMonthCells = useMemo(() => {
    const first = new Date(miniMonthCursor.getFullYear(), miniMonthCursor.getMonth(), 1);
    const gridStart = startOfWeekSunday(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [miniMonthCursor]);

  const mainMonthCells = useMemo(() => {
    const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const gridStart = startOfWeekSunday(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [anchorDate]);

  // Agenda groupings
  const agendaGroups = useMemo(() => {
    if (viewMode !== 'agenda') return [];
    const byDay = new Map<string, { date: Date; items: ExpandedCalendarOccurrence[] }>();
    for (const occ of activeRangeOccurrences) {
      const d = startOfDay(new Date(occ.occurrenceStartMs));
      const key = toLocalDateString(d);
      const grp = byDay.get(key) || { date: d, items: [] };
      grp.items.push(occ);
      byDay.set(key, grp);
    }
    return Array.from(byDay.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activeRangeOccurrences, viewMode]);

  const currentMinutesSinceMidnight = useMemo(() => {
    const d = new Date(nowMs);
    return d.getHours() * 60 + d.getMinutes();
  }, [nowMs]);

  const filteredModalInvitees = useMemo(() => {
    const q = editorInviteeSearch.trim().toLowerCase();
    return invitees.filter(
      (p) => !q || `${p.name} ${p.subtitle || ''}`.toLowerCase().includes(q)
    );
  }, [editorInviteeSearch, invitees]);

  const inspectedRsvp = inspectedOccurrence
    ? getViewerRsvpStatus(inspectedOccurrence.baseEvent, viewerKeySet)
    : null;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#FBF8F3] text-[#1C1917] overflow-hidden">
      {/* TOP TEAMS-STYLE CALENDAR TOOLBAR */}
      <div className="bg-white border-b border-[#E0D6C5] px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSidebarOpen((s) => !s)}
            title={sidebarOpen ? 'Hide calendar sidebar' : 'Show calendar sidebar'}
            className="p-1.5 rounded-lg bg-[#F7F2E8] hover:bg-[#EFE8DA] border border-[#D0C4AE] text-[#3D3730] cursor-pointer"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-[#7C4225]" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-[#7C4225]" />
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-[#0A66C2] flex items-center justify-center shadow-2xs">
              <CalendarIcon className="w-4 h-4 text-white" />
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-[#1C1917] tracking-tight">
              Calendar
            </h2>
          </div>

          <button
            type="button"
            onClick={jumpToToday}
            className="px-2.5 py-1 rounded-lg bg-[#F7F2E8] hover:bg-[#EFE8DA] border border-[#D0C4AE] text-xs font-bold text-[#1C1917] cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center rounded-lg border border-[#D0C4AE] bg-white overflow-hidden">
            <button
              type="button"
              aria-label="Previous date range"
              onClick={() => navigateRange(-1)}
              className="p-1.5 hover:bg-[#F7F2E8] text-[#3D3730] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next date range"
              onClick={() => navigateRange(1)}
              className="p-1.5 hover:bg-[#F7F2E8] text-[#3D3730] border-l border-[#E0D6C5] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-[#1C1917] whitespace-nowrap">
            {headerTitle}
          </span>

          <span
            className={`hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              mongoConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSyncing
                  ? 'bg-amber-500 animate-pulse'
                  : mongoConnected
                  ? 'bg-emerald-600'
                  : 'bg-amber-600'
              }`}
            />
            {isSyncing ? 'Syncing…' : mongoConnected ? 'Cloud Synced' : 'Local Cache'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Segmented Switcher */}
          <div className="inline-flex items-center rounded-xl bg-[#F3EDE2] border border-[#E0D6C5] p-0.5">
            {VIEW_MODES.map((vm) => {
              const active = viewMode === vm.id;
              return (
                <button
                  key={vm.id}
                  type="button"
                  onClick={() => {
                    setViewMode(vm.id);
                    if (vm.id !== 'agenda') setAgendaOnlyPending(false);
                  }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#7C4225] shadow-2xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                  style={active ? { color: '#FBF8F3' } : undefined}
                >
                  <span className="hidden sm:inline">{vm.label}</span>
                  <span className="sm:hidden">{vm.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onStartLiveCall('video')}
            className="px-2.5 py-1.5 rounded-xl bg-[#F7F2E8] hover:bg-[#EFE8DA] border border-[#D0C4AE] text-xs font-bold text-[#1C1917] flex items-center gap-1 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-[#7C4225]" />
            <span className="hidden sm:inline">Meet Now</span>
          </button>

          <button
            type="button"
            onClick={() => openNewEventModal(anchorDate, 9)}
            className="px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-extrabold flex items-center gap-1 shadow-2xs cursor-pointer"
            style={{ color: '#FFFFFF' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* BODY: SIDEBAR + MAIN SCHEDULE CANVAS */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* LEFT MINI CALENDAR & FILTERS SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-[250px] shrink-0 bg-[#F7F2E8] border-r border-[#E0D6C5] p-3 flex flex-col gap-3 overflow-y-auto z-20 max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-xl">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedule, people, site…"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-[#D0C4AE] text-xs text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#0A66C2]"
              />
            </div>

            {/* Interactive Mini Month Picker */}
            <div className="rounded-xl bg-white border border-[#E0D6C5] p-2.5">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  aria-label="Previous mini month"
                  onClick={() =>
                    setMiniMonthCursor(
                      (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
                    )
                  }
                  className="p-1 rounded hover:bg-[#F3EDE2] text-[#3D3730] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold text-[#1C1917]">
                  {miniMonthCursor.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  aria-label="Next mini month"
                  onClick={() =>
                    setMiniMonthCursor(
                      (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
                    )
                  }
                  className="p-1 rounded hover:bg-[#F3EDE2] text-[#3D3730] cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#78716C] mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {miniMonthCells.map((cell, idx) => {
                  const inMonth = cell.getMonth() === miniMonthCursor.getMonth();
                  const isTodayCell = isSameCalendarDay(cell, todayDate);
                  const isSelected = isSameCalendarDay(cell, anchorDate);
                  const dots = miniMonthDots.get(toLocalDateString(cell)) || [];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnchorDate(cell)}
                      className={`relative h-7 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        isTodayCell
                          ? 'bg-[#0A66C2] font-extrabold'
                          : isSelected
                          ? 'bg-[#E8D8C8] text-[#1C1917]'
                          : inMonth
                          ? 'text-[#1C1917] hover:bg-[#F3EDE2]'
                          : 'text-[#A8A29E] hover:bg-[#F3EDE2]/60'
                      }`}
                      style={isTodayCell ? { color: '#FFFFFF' } : undefined}
                    >
                      <span>{cell.getDate()}</span>
                      {dots.length > 0 && (
                        <span className="flex gap-0.5 -mt-0.5">
                          {dots.map((hex, di) => (
                            <span
                              key={di}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: isTodayCell ? '#FFFFFF' : hex }}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Summary Card */}
            <div className="rounded-xl bg-white border border-[#E0D6C5] p-3 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#7C4225]">
                My Schedule Summary
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#F7F2E8] p-2 border border-[#E0D6C5]">
                  <p className="text-[10px] font-semibold text-[#57534E]">Today</p>
                  <p className="text-base font-extrabold text-[#1C1917]">
                    {summaryStats.todayCount}
                  </p>
                </div>
                <div className="rounded-lg bg-[#F7F2E8] p-2 border border-[#E0D6C5]">
                  <p className="text-[10px] font-semibold text-[#57534E]">This Week</p>
                  <p className="text-base font-extrabold text-[#0A66C2]">
                    {summaryStats.weekHours}h
                  </p>
                </div>
              </div>
              {summaryStats.pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAgendaOnlyPending(true);
                    setViewMode('agenda');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-between cursor-pointer"
                >
                  <span>Pending Invites</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold">
                    {summaryStats.pendingCount}
                  </span>
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="rounded-xl bg-white border border-[#E0D6C5] p-3 space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#57534E]">
                Calendars &amp; Shifts
              </p>
              <div className="space-y-1.5">
                {(Object.keys(CALENDAR_CATEGORY_META) as CalendarEventCategory[]).map((cat) => {
                  const meta = CALENDAR_CATEGORY_META[cat];
                  const checked = visibleCategories[cat];
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-xs font-semibold text-[#1C1917] cursor-pointer hover:bg-[#F7F2E8] px-1.5 py-1 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setVisibleCategories((prev) => ({
                            ...prev,
                            [cat]: e.target.checked,
                          }))
                        }
                        className="h-3.5 w-3.5 accent-[#0A66C2]"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.accentHex }}
                      />
                      <span className="truncate">{meta.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* MAIN VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
          {/* 1. DAY / WORK WEEK / WEEK HOURLY GRID */}
          {(viewMode === 'day' || viewMode === 'work_week' || viewMode === 'week') && (
            <>
              {/* Sticky Day Headers */}
              <div className="flex border-b border-[#E0D6C5] bg-[#FBF8F3] shrink-0">
                <div className="w-14 shrink-0 border-r border-[#E0D6C5] px-1 py-2 text-[10px] font-bold text-[#78716C] flex items-end justify-center">
                  LOCAL
                </div>
                <div
                  className="flex-1 grid"
                  style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                >
                  {visibleDays.map((day, i) => {
                    const isToday = isSameCalendarDay(day, todayDate);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAnchorDate(day);
                          if (viewMode !== 'day') setViewMode('day');
                        }}
                        className="py-2 px-1 border-r last:border-r-0 border-[#E0D6C5] flex flex-col items-center justify-center hover:bg-[#F3EDE2]/70 cursor-pointer transition-colors"
                      >
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isToday ? 'text-[#0A66C2]' : 'text-[#57534E]'
                          }`}
                        >
                          {day.toLocaleDateString([], { weekday: 'short' })}
                        </span>
                        <span
                          className={`mt-0.5 w-7 h-7 rounded-full text-sm font-extrabold flex items-center justify-center ${
                            isToday ? 'bg-[#0A66C2]' : 'text-[#1C1917]'
                          }`}
                          style={isToday ? { color: '#FFFFFF' } : undefined}
                        >
                          {day.getDate()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pinned All-Day Row */}
              {(() => {
                const allDayByCol = visibleDays.map((day) => {
                  const dStart = day.getTime();
                  const dEnd = endOfDay(day).getTime();
                  return activeRangeOccurrences.filter((occ) => {
                    const spansFullDay =
                      occ.baseEvent.allDay || occ.occurrenceEndMs - occ.occurrenceStartMs >= 23.5 * 3600_000;
                    return spansFullDay && occ.occurrenceEndMs >= dStart && occ.occurrenceStartMs <= dEnd;
                  });
                });
                const hasAnyAllDay = allDayByCol.some((arr) => arr.length > 0);
                if (!hasAnyAllDay) return null;
                return (
                  <div className="flex border-b border-[#E0D6C5] bg-[#F7F2E8]/70 shrink-0">
                    <div className="w-14 shrink-0 border-r border-[#E0D6C5] px-1 py-1.5 text-[10px] font-bold text-[#78716C] flex items-center justify-center">
                      All day
                    </div>
                    <div
                      className="flex-1 grid"
                      style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                    >
                      {allDayByCol.map((list, ci) => (
                        <div
                          key={ci}
                          className="border-r last:border-r-0 border-[#E0D6C5] p-1 space-y-1 min-h-[28px]"
                        >
                          {list.map((occ) => {
                            const meta = CALENDAR_CATEGORY_META[occ.baseEvent.category || 'meeting'];
                            const rsvp = getViewerRsvpStatus(occ.baseEvent, viewerKeySet);
                            return (
                              <button
                                key={occ.occurrenceKey}
                                type="button"
                                onClick={() => setInspectedOccurrence(occ)}
                                className={`w-full text-left px-1.5 py-0.5 rounded border border-l-4 text-[11px] font-bold truncate cursor-pointer ${
                                  meta.softBgClass
                                } ${meta.borderClass} ${meta.textClass} ${
                                  rsvp === 'declined' ? 'opacity-50 line-through' : ''
                                }`}
                              >
                                {occ.baseEvent.title}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Scrollable 24-Hour Time Grid */}
              <div ref={timeGridScrollRef} className="flex-1 overflow-y-auto relative">
                <div className="flex" style={{ height: `${HOURS.length * HOUR_HEIGHT_PX}px` }}>
                  {/* Time Axis */}
                  <div className="w-14 shrink-0 border-r border-[#E0D6C5] bg-[#FBF8F3] relative select-none">
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        style={{ height: `${HOUR_HEIGHT_PX}px` }}
                        className="relative pr-1.5 text-right"
                      >
                        <span className="text-[10px] font-semibold text-[#78716C] -top-2 relative">
                          {h === 0 ? '' : formatHourLabel(h)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  <div
                    className="flex-1 grid relative"
                    style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                  >
                    {visibleDays.map((day, colIdx) => {
                      const dStart = day.getTime();
                      const dEnd = endOfDay(day).getTime();
                      const isToday = isSameCalendarDay(day, todayDate);

                      const timedForDay: ExpandedCalendarOccurrence[] = [];
                      for (const occ of activeRangeOccurrences) {
                        const isFull =
                          occ.baseEvent.allDay ||
                          occ.occurrenceEndMs - occ.occurrenceStartMs >= 23.5 * 3600_000;
                        if (isFull) continue;
                        if (occ.occurrenceEndMs > dStart && occ.occurrenceStartMs < dEnd) {
                          timedForDay.push({
                            ...occ,
                            occurrenceStartMs: Math.max(occ.occurrenceStartMs, dStart),
                            occurrenceEndMs: Math.min(occ.occurrenceEndMs, dEnd),
                          });
                        }
                      }
                      const placed = layoutOverlappingEvents(timedForDay);

                      return (
                        <div
                          key={colIdx}
                          className={`relative border-r last:border-r-0 border-[#E0D6C5] ${
                            isToday ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {/* Clickable Hour Grid Cells */}
                          {HOURS.map((h) => (
                            <div
                              key={h}
                              onClick={() => openNewEventModal(day, h)}
                              title={`Create event on ${day.toLocaleDateString()} at ${formatHourLabel(h)}`}
                              style={{ height: `${HOUR_HEIGHT_PX}px` }}
                              className="border-b border-[#EFE8DA] hover:bg-blue-50/40 cursor-pointer transition-colors"
                            />
                          ))}

                          {/* Live Current Time Line */}
                          {isToday && (
                            <div
                              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                              style={{ top: `${(currentMinutesSinceMidnight / 60) * HOUR_HEIGHT_PX}px` }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1.5 shadow-xs" />
                              <span className="flex-1 h-[2px] bg-red-600/90" />
                            </div>
                          )}

                          {/* Positioned Events */}
                          {placed.map((occ) => {
                            const sDate = new Date(occ.occurrenceStartMs);
                            const startMins = sDate.getHours() * 60 + sDate.getMinutes();
                            const durMins = Math.max(
                              20,
                              Math.round((occ.occurrenceEndMs - occ.occurrenceStartMs) / 60_000)
                            );
                            const topPx = (startMins / 60) * HOUR_HEIGHT_PX;
                            const heightPx = Math.max(26, (durMins / 60) * HOUR_HEIGHT_PX);
                            const meta =
                              CALENDAR_CATEGORY_META[occ.baseEvent.category || 'meeting'];
                            const rsvp = getViewerRsvpStatus(occ.baseEvent, viewerKeySet);
                            const isJoinable =
                              (occ.baseEvent.callMode === 'video' ||
                                occ.baseEvent.callMode === 'audio') &&
                              rsvp !== 'declined';

                            return (
                              <div
                                key={`${occ.occurrenceKey}_${colIdx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedOccurrence(occ);
                                }}
                                style={{
                                  top: `${topPx}px`,
                                  height: `${heightPx}px`,
                                  left: `calc(${(occ.colIndex / occ.colCount) * 100}% + 2px)`,
                                  width: `calc(${(1 / occ.colCount) * 100}% - 4px)`,
                                }}
                                className={`absolute z-10 rounded-lg border border-l-4 px-2 py-1 overflow-hidden cursor-pointer shadow-2xs transition-all flex flex-col justify-between ${
                                  meta.softBgClass
                                } ${meta.borderClass} ${meta.textClass} ${
                                  rsvp === 'tentative' ? 'border-dashed' : ''
                                } ${rsvp === 'declined' ? 'opacity-50 line-through' : ''}`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-extrabold truncate">
                                      {occ.baseEvent.title}
                                    </span>
                                    {occ.baseEvent.recurrence &&
                                      occ.baseEvent.recurrence !== 'none' && (
                                        <Repeat className="w-3 h-3 shrink-0 opacity-75" />
                                      )}
                                  </div>
                                  {heightPx >= 38 && (
                                    <p className="text-[10px] font-semibold opacity-80 truncate">
                                      {formatTimeShort(occ.occurrenceStartMs)} –{' '}
                                      {formatTimeShort(occ.occurrenceEndMs)}
                                    </p>
                                  )}
                                  {heightPx >= 58 && occ.baseEvent.location && (
                                    <p className="text-[10px] opacity-75 truncate flex items-center gap-0.5 mt-0.5">
                                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate">{occ.baseEvent.location}</span>
                                    </p>
                                  )}
                                </div>
                                {heightPx >= 52 && isJoinable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJoinMeeting(occ.baseEvent);
                                    }}
                                    className="self-start mt-0.5 px-1.5 py-0.5 rounded bg-[#0A66C2] hover:bg-[#004182] text-[9px] font-extrabold cursor-pointer"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    ▶ Join
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. MONTH GRID VIEW */}
          {viewMode === 'month' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#E0D6C5] bg-[#FBF8F3] shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#57534E] border-r last:border-r-0 border-[#E0D6C5]"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 overflow-y-auto">
                {mainMonthCells.map((cell, idx) => {
                  const inMonth = cell.getMonth() === anchorDate.getMonth();
                  const isToday = isSameCalendarDay(cell, todayDate);
                  const dStart = cell.getTime();
                  const dEnd = endOfDay(cell).getTime();
                  const cellOccs = activeRangeOccurrences.filter(
                    (o) => o.occurrenceEndMs >= dStart && o.occurrenceStartMs <= dEnd
                  );
                  const visiblePills = cellOccs.slice(0, 3);
                  const hiddenCount = Math.max(0, cellOccs.length - 3);

                  return (
                    <div
                      key={idx}
                      onClick={() => openNewEventModal(cell, 9)}
                      className={`border-r border-b border-[#E0D6C5] p-1.5 min-h-[96px] flex flex-col gap-1 cursor-pointer transition-colors ${
                        isToday
                          ? 'bg-blue-50/35'
                          : inMonth
                          ? 'bg-white hover:bg-[#FBF8F3]'
                          : 'bg-[#F7F2E8]/60 text-[#A8A29E]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorDate(cell);
                            setViewMode('day');
                          }}
                          className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center cursor-pointer ${
                            isToday
                              ? 'bg-[#0A66C2]'
                              : inMonth
                              ? 'text-[#1C1917] hover:bg-[#EFE8DA]'
                              : 'text-[#A8A29E]'
                          }`}
                          style={isToday ? { color: '#FFFFFF' } : undefined}
                        >
                          {cell.getDate()}
                        </button>
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {visiblePills.map((occ) => {
                          const meta = CALENDAR_CATEGORY_META[occ.baseEvent.category || 'meeting'];
                          const rsvp = getViewerRsvpStatus(occ.baseEvent, viewerKeySet);
                          return (
                            <button
                              key={occ.occurrenceKey}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedOccurrence(occ);
                              }}
                              className={`w-full text-left px-1.5 py-0.5 rounded border-l-2 text-[10px] font-bold truncate cursor-pointer flex items-center gap-1 ${
                                meta.softBgClass
                              } ${meta.borderClass} ${meta.textClass} ${
                                rsvp === 'declined' ? 'opacity-50 line-through' : ''
                              }`}
                            >
                              {!occ.baseEvent.allDay && (
                                <span className="opacity-75 shrink-0">
                                  {new Date(occ.occurrenceStartMs).toLocaleTimeString([], {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                              <span className="truncate">{occ.baseEvent.title}</span>
                            </button>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorDate(cell);
                              setViewMode('day');
                            }}
                            className="text-[10px] font-extrabold text-[#0A66C2] hover:underline px-1 cursor-pointer"
                          >
                            +{hiddenCount} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. AGENDA / SCHEDULE LIST VIEW */}
          {viewMode === 'agenda' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E0D6C5]">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C1917]">
                    {agendaOnlyPending
                      ? 'Pending Meeting Invitations'
                      : '30-Day Schedule & Shifts'}
                  </h3>
                  <p className="text-xs text-[#57534E]">
                    Showing {activeRangeOccurrences.length} scheduled item
                    {activeRangeOccurrences.length === 1 ? '' : 's'}
                  </p>
                </div>
                {agendaOnlyPending && (
                  <button
                    type="button"
                    onClick={() => setAgendaOnlyPending(false)}
                    className="px-3 py-1 rounded-lg bg-[#F7F2E8] border border-[#D0C4AE] text-xs font-bold text-[#1C1917] cursor-pointer"
                  >
                    Show All Scheduled Events
                  </button>
                )}
              </div>

              {agendaGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D0C4AE] bg-[#FBF8F3] p-8 text-center space-y-2">
                  <CalendarIcon className="w-8 h-8 text-[#7C4225] mx-auto" />
                  <p className="text-sm font-extrabold text-[#1C1917]">
                    No events scheduled in this window
                  </p>
                  <p className="text-xs text-[#57534E]">
                    Add a meeting, work shift, focus block, or site visit to organize your week.
                  </p>
                  <button
                    type="button"
                    onClick={() => openNewEventModal(anchorDate, 9)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A66C2] text-xs font-extrabold cursor-pointer"
                    style={{ color: '#FFFFFF' }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule First Event
                  </button>
                </div>
              ) : (
                agendaGroups.map((grp) => {
                  const isToday = isSameCalendarDay(grp.date, todayDate);
                  const isTomorrow = isSameCalendarDay(grp.date, addDays(todayDate, 1));
                  const prefix = isToday ? 'Today · ' : isTomorrow ? 'Tomorrow · ' : '';
                  return (
                    <div key={toLocalDateString(grp.date)} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            isToday
                              ? 'bg-[#0A66C2]'
                              : 'bg-[#F3EDE2] text-[#3D3730] border border-[#E0D6C5]'
                          }`}
                          style={isToday ? { color: '#FFFFFF' } : undefined}
                        >
                          {prefix}
                          {grp.date.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {grp.items.map((occ) => {
                          const ev = occ.baseEvent;
                          const meta = CALENDAR_CATEGORY_META[ev.category || 'meeting'];
                          const rsvp = getViewerRsvpStatus(ev, viewerKeySet);
                          const isOrganizer = rsvp === 'organizer';
                          return (
                            <div
                              key={occ.occurrenceKey}
                              onClick={() => setInspectedOccurrence(occ)}
                              className={`rounded-xl border border-l-4 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                                meta.softBgClass
                              } ${meta.borderClass} ${meta.textClass}`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                                    style={{ backgroundColor: meta.accentHex }}
                                  >
                                    {meta.label}
                                  </span>
                                  <span className="text-xs font-bold opacity-85 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {ev.allDay
                                      ? 'All Day'
                                      : `${formatTimeShort(occ.occurrenceStartMs)} – ${formatTimeShort(
                                          occ.occurrenceEndMs
                                        )}`}
                                  </span>
                                  {ev.recurrence !== 'none' && (
                                    <span className="text-[10px] font-bold opacity-75 flex items-center gap-0.5">
                                      <Repeat className="w-3 h-3" />
                                      {CALENDAR_RECURRENCE_LABELS[ev.recurrence]}
                                    </span>
                                  )}
                                  {!isOrganizer && (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/80 border border-slate-200 uppercase">
                                      RSVP: {rsvp}
                                    </span>
                                  )}
                                </div>
                                <h4
                                  className={`text-sm font-extrabold truncate ${
                                    rsvp === 'declined' ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  {ev.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs opacity-80">
                                  <span>Organizer: {ev.ownerName}</span>
                                  {ev.attendees.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" /> {ev.attendees.length} invitee
                                      {ev.attendees.length === 1 ? '' : 's'}
                                    </span>
                                  )}
                                  {ev.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {ev.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-1.5 flex-wrap shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {!isOrganizer && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isMutatingId === ev.id}
                                      onClick={() => handleRsvpAction(ev, 'accepted')}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                        rsvp === 'accepted'
                                          ? 'bg-emerald-600 border-emerald-700'
                                          : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                                      }`}
                                      style={rsvp === 'accepted' ? { color: '#FFFFFF' } : undefined}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isMutatingId === ev.id}
                                      onClick={() => handleRsvpAction(ev, 'tentative')}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                        rsvp === 'tentative'
                                          ? 'bg-amber-600 border-amber-700'
                                          : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                                      }`}
                                      style={rsvp === 'tentative' ? { color: '#FFFFFF' } : undefined}
                                    >
                                      Tentative
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isMutatingId === ev.id}
                                      onClick={() => handleRsvpAction(ev, 'declined')}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                        rsvp === 'declined'
                                          ? 'bg-rose-600 border-rose-700'
                                          : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-50'
                                      }`}
                                      style={rsvp === 'declined' ? { color: '#FFFFFF' } : undefined}
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {(ev.callMode === 'video' || ev.callMode === 'audio') && (
                                  <button
                                    type="button"
                                    onClick={() => handleJoinMeeting(ev)}
                                    className="px-2.5 py-1 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-[11px] font-extrabold cursor-pointer"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    ▶ Join
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* EVENT INSPECTOR / DETAILS MODAL */}
      <Dialog
        open={Boolean(inspectedOccurrence)}
        onOpenChange={(o) => !o && setInspectedOccurrence(null)}
      >
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white text-slate-900">
          {inspectedOccurrence &&
            (() => {
              const ev = inspectedOccurrence.baseEvent;
              const meta = CALENDAR_CATEGORY_META[ev.category || 'meeting'];
              const showAsMeta = CALENDAR_SHOW_AS_META[ev.showAs || 'busy'];
              const isOrganizer = inspectedRsvp === 'organizer';
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white"
                        style={{ backgroundColor: meta.accentHex }}
                      >
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${showAsMeta.dotClass}`} />
                        {showAsMeta.label}
                      </span>
                      {ev.recurrence !== 'none' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800">
                          <Repeat className="w-3 h-3" />
                          {CALENDAR_RECURRENCE_LABELS[ev.recurrence]}
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-lg font-extrabold text-slate-900">
                      {ev.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl bg-[#FBF8F3] border border-[#E0D6C5] p-3 space-y-1.5">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7C4225]" />
                        <span>
                          {new Date(inspectedOccurrence.occurrenceStartMs).toLocaleDateString([], {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {ev.allDay
                            ? ' · All Day'
                            : ` · ${formatTimeShort(
                                inspectedOccurrence.occurrenceStartMs
                              )} – ${formatTimeShort(inspectedOccurrence.occurrenceEndMs)}`}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Organizer: <strong className="text-slate-900">{ev.ownerName}</strong>
                        {ev.ownerEmail ? ` (${ev.ownerEmail})` : ''}
                      </p>
                      {ev.location && (
                        <p className="text-xs text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0A66C2]" />
                          <span>{ev.location}</span>
                        </p>
                      )}
                      {ev.notes && (
                        <p className="text-xs text-slate-700 pt-1 whitespace-pre-wrap">
                          {ev.notes}
                        </p>
                      )}
                    </div>

                    {/* RSVP Bar for Invitees */}
                    {!isOrganizer && (
                      <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                        <p className="text-xs font-extrabold text-slate-700">
                          Your Response ({inspectedRsvp})
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isMutatingId === ev.id}
                            onClick={() => handleRsvpAction(ev, 'accepted')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer ${
                              inspectedRsvp === 'accepted'
                                ? 'bg-emerald-600 border-emerald-700'
                                : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                            }`}
                            style={inspectedRsvp === 'accepted' ? { color: '#FFFFFF' } : undefined}
                          >
                            ✓ Accept
                          </button>
                          <button
                            type="button"
                            disabled={isMutatingId === ev.id}
                            onClick={() => handleRsvpAction(ev, 'tentative')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer ${
                              inspectedRsvp === 'tentative'
                                ? 'bg-amber-600 border-amber-700'
                                : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                            }`}
                            style={inspectedRsvp === 'tentative' ? { color: '#FFFFFF' } : undefined}
                          >
                            ? Tentative
                          </button>
                          <button
                            type="button"
                            disabled={isMutatingId === ev.id}
                            onClick={() => handleRsvpAction(ev, 'declined')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer ${
                              inspectedRsvp === 'declined'
                                ? 'bg-rose-600 border-rose-700'
                                : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-50'
                            }`}
                            style={inspectedRsvp === 'declined' ? { color: '#FFFFFF' } : undefined}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Attendee List */}
                    {ev.attendees.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-extrabold text-slate-700">
                          Attendees ({ev.attendees.length})
                        </p>
                        <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
                          {ev.attendees.map((att, ai) => (
                            <div
                              key={att.key || ai}
                              className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-bold text-slate-800 truncate">{att.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                                  att.rsvp === 'accepted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : att.rsvp === 'declined'
                                    ? 'bg-rose-100 text-rose-800'
                                    : att.rsvp === 'tentative'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {att.rsvp || 'pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {(ev.callMode === 'video' || ev.callMode === 'audio') && (
                        <button
                          type="button"
                          onClick={() => handleJoinMeeting(ev)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                          style={{ color: '#FFFFFF' }}
                        >
                          {ev.callMode === 'video' ? (
                            <Video className="w-3.5 h-3.5" />
                          ) : (
                            <Phone className="w-3.5 h-3.5" />
                          )}
                          <span>Join Meeting</span>
                        </button>
                      )}
                      {ev.joinUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(ev.joinUrl || '').catch(() => {});
                            triggerToast('Meeting link copied');
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownloadIcs(ev)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export .ics
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEventChat(ev)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                      </button>
                      {isOrganizer && (
                        <button
                          type="button"
                          onClick={() => openEditEventModal(ev)}
                          className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A66C2] text-xs font-extrabold border border-blue-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isMutatingId === ev.id}
                        onClick={() => handleDeleteOrLeave(ev)}
                        className="ml-auto px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isOrganizer ? 'Delete' : 'Leave'}</span>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT SCHEDULE EVENT MODAL */}
      <Dialog open={editorOpen} onOpenChange={(o) => !o && setEditorOpen(false)}>
        <DialogContent className="max-w-3xl w-[96vw] max-h-[92vh] overflow-y-auto bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#0A66C2]" />
              <span>{editorDraft.id ? 'Edit Schedule Event' : 'New Schedule Event'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveEditorEvent} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Left Column: Details, Timing, Category */}
              <div className="space-y-3">
                <label className="block text-xs font-bold">
                  Title
                  <input
                    type="text"
                    required
                    value={editorDraft.title}
                    onChange={(e) =>
                      setEditorDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="e.g. Framing Inspection, Day Shift, Deep Focus…"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal"
                  />
                </label>

                <div>
                  <span className="block text-xs font-bold mb-1">Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(CALENDAR_CATEGORY_META) as CalendarEventCategory[]).map((cat) => {
                      const meta = CALENDAR_CATEGORY_META[cat];
                      const active = editorDraft.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setEditorDraft((d) => ({
                              ...d,
                              category: cat,
                              showAs: cat === 'ooo' ? 'oof' : d.showAs === 'oof' ? 'busy' : d.showAs,
                              callMode: cat === 'meeting' ? 'video' : cat === 'focus' || cat === 'ooo' ? 'none' : d.callMode,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer flex items-center gap-1 ${
                            active
                              ? 'border-transparent shadow-2xs'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                          style={
                            active
                              ? { backgroundColor: meta.accentHex, color: '#FFFFFF' }
                              : undefined
                          }
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold">
                    Date
                    <input
                      type="date"
                      value={editorDraft.dateStr}
                      onChange={(e) =>
                        setEditorDraft((d) => ({ ...d, dateStr: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Show As
                    <select
                      value={editorDraft.showAs}
                      onChange={(e) =>
                        setEditorDraft((d) => ({
                          ...d,
                          showAs: e.target.value as CalendarShowAs,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal bg-white"
                    >
                      {(Object.keys(CALENDAR_SHOW_AS_META) as CalendarShowAs[]).map((s) => (
                        <option key={s} value={s}>
                          {CALENDAR_SHOW_AS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editorDraft.allDay}
                    onChange={(e) =>
                      setEditorDraft((d) => ({ ...d, allDay: e.target.checked }))
                    }
                    className="h-4 w-4 accent-[#0A66C2]"
                  />
                  <span>All-Day Event / Full Day Off</span>
                </label>

                {!editorDraft.allDay && (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs font-bold">
                        Start Time
                        <input
                          type="time"
                          value={editorDraft.startTime}
                          onChange={(e) => {
                            const nextStart = e.target.value;
                            setEditorDraft((d) => {
                              const prevDur = Math.max(
                                30,
                                computeDurationMinutes(d.startTime, d.endTime)
                              );
                              return {
                                ...d,
                                startTime: nextStart,
                                endTime: addMinutesToTimeString(nextStart, prevDur),
                              };
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                        />
                      </label>
                      <label className="text-xs font-bold">
                        End Time
                        <input
                          type="time"
                          value={editorDraft.endTime}
                          onChange={(e) =>
                            setEditorDraft((d) => ({ ...d, endTime: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_DURATIONS.map((qd) => (
                        <button
                          key={qd.label}
                          type="button"
                          onClick={() =>
                            setEditorDraft((d) => ({
                              ...d,
                              endTime: addMinutesToTimeString(d.startTime, qd.minutes),
                            }))
                          }
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-[#0A66C2] text-[10px] font-bold border border-slate-200 cursor-pointer"
                        >
                          {qd.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold">
                    Repeat
                    <select
                      value={editorDraft.recurrence}
                      onChange={(e) =>
                        setEditorDraft((d) => ({
                          ...d,
                          recurrence: e.target.value as CalendarRecurrenceRule,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal bg-white"
                    >
                      {(Object.keys(CALENDAR_RECURRENCE_LABELS) as CalendarRecurrenceRule[]).map(
                        (r) => (
                          <option key={r} value={r}>
                            {CALENDAR_RECURRENCE_LABELS[r]}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                  {editorDraft.recurrence !== 'none' && (
                    <label className="text-xs font-bold">
                      End Repeat (optional)
                      <input
                        type="date"
                        value={editorDraft.recurrenceUntilIso}
                        onChange={(e) =>
                          setEditorDraft((d) => ({
                            ...d,
                            recurrenceUntilIso: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold">
                    Format / Call Mode
                    <select
                      value={editorDraft.callMode}
                      onChange={(e) =>
                        setEditorDraft((d) => ({
                          ...d,
                          callMode: e.target.value as EventEditorDraft['callMode'],
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal bg-white"
                    >
                      <option value="video">🎥 Video Huddle</option>
                      <option value="audio">📞 Voice Call</option>
                      <option value="in_person">📍 In-Person / Job Site</option>
                      <option value="none">🕒 No Call (Schedule Block)</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Location / Site
                    <input
                      type="text"
                      value={editorDraft.location}
                      onChange={(e) =>
                        setEditorDraft((d) => ({ ...d, location: e.target.value }))
                      }
                      placeholder="Site B / Room / Desk"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                    />
                  </label>
                </div>

                <div className="text-xs font-bold">
                  Reminders
                  <div className="mt-1 flex flex-wrap gap-3 font-normal">
                    {[5, 15, 30, 60].map((min) => (
                      <label key={min} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editorDraft.reminders.includes(min)}
                          onChange={(e) =>
                            setEditorDraft((d) => ({
                              ...d,
                              reminders: e.target.checked
                                ? Array.from(new Set([...d.reminders, min]))
                                : d.reminders.filter((x) => x !== min),
                            }))
                          }
                          className="h-3.5 w-3.5 accent-[#0A66C2]"
                        />
                        <span>{min}m</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Notes & Optional Connection Invitees */}
              <div className="space-y-3">
                <label className="block text-xs font-bold">
                  Notes / Agenda
                  <textarea
                    rows={3}
                    value={editorDraft.notes}
                    onChange={(e) =>
                      setEditorDraft((d) => ({ ...d, notes: e.target.value }))
                    }
                    placeholder="Shift handover notes, drawings to review, inspection checklist…"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal"
                  />
                </label>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">
                      Invite Connections (optional ·{' '}
                      {Object.values(editorDraft.selectedInviteeKeys).filter(Boolean).length}{' '}
                      selected)
                    </span>
                    {Object.values(editorDraft.selectedInviteeKeys).some(Boolean) && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditorDraft((d) => ({ ...d, selectedInviteeKeys: {} }))
                        }
                        className="text-[11px] font-bold text-[#0A66C2] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editorInviteeSearch}
                    onChange={(e) => setEditorInviteeSearch(e.target.value)}
                    placeholder="Filter teammates or contractors…"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                    {filteredModalInvitees.length === 0 ? (
                      <p className="p-3 text-xs text-slate-500">No matching connections.</p>
                    ) : (
                      filteredModalInvitees.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 p-2 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(editorDraft.selectedInviteeKeys[p.id])}
                            onChange={(e) =>
                              setEditorDraft((d) => ({
                                ...d,
                                selectedInviteeKeys: {
                                  ...d.selectedInviteeKeys,
                                  [p.id]: e.target.checked,
                                },
                              }))
                            }
                            className="h-3.5 w-3.5 accent-[#0A66C2]"
                          />
                          {p.avatar ? (
                            <img
                              src={p.avatar}
                              alt=""
                              className="h-7 w-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span className="h-7 w-7 rounded-full bg-slate-200 shrink-0" />
                          )}
                          <span className="min-w-0">
                            <span className="block text-xs font-bold truncate">{p.name}</span>
                            {p.subtitle && (
                              <span className="block text-[10px] text-slate-500 truncate">
                                {p.subtitle}
                              </span>
                            )}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-rose-600">{editorError}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-extrabold cursor-pointer disabled:opacity-60"
                  style={{ color: '#FFFFFF' }}
                >
                  {isSavingEvent
                    ? 'Saving…'
                    : editorDraft.id
                    ? 'Save Changes'
                    : 'Save to Schedule'}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
