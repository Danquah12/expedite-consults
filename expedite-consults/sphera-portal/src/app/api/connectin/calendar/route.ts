import { NextResponse } from 'next/server';
import {
  CalendarAttendee,
  CalendarEventCategory,
  CalendarRecurrenceRule,
  CalendarShowAs,
  ConnectLnCalendarEvent,
  buildViewerCalendarKeys,
  computeParticipantKeysForEvent,
  normalizeCalendarParticipantKey,
} from '@/lib/connectln-calendar-utils';
import {
  deleteOrLeaveCalendarEvent,
  getCalendarEventById,
  listUserCalendarEvents,
  syncLegacyCalendarEvents,
  updateCalendarEventRsvp,
  upsertCalendarEvent,
} from '@/lib/connectln-calendar-db';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = new Set<CalendarEventCategory>([
  'meeting',
  'shift',
  'focus',
  'site_visit',
  'ooo',
]);

const VALID_SHOW_AS = new Set<CalendarShowAs>(['busy', 'tentative', 'free', 'oof']);

const VALID_RECURRENCE = new Set<CalendarRecurrenceRule>([
  'none',
  'daily',
  'weekdays',
  'weekly',
  'monthly',
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userName = (url.searchParams.get('userName') || '').trim();
  const userEmail = (url.searchParams.get('userEmail') || '').trim();
  const viewerKeys = buildViewerCalendarKeys(userName, userEmail);

  if (viewerKeys.length === 0) {
    return NextResponse.json({
      ok: true,
      events: [],
      count: 0,
      mongoConnected: false,
    });
  }

  const { events, mongoConnected } = await listUserCalendarEvents(viewerKeys);
  return NextResponse.json({
    ok: true,
    events,
    count: events.length,
    mongoConnected,
  });
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const action = String(body?.action || '').trim().toLowerCase();

  if (action === 'create' || action === 'update') {
    const rawEvent = body?.event && typeof body.event === 'object' ? body.event : body;
    const title = String(rawEvent?.title || '').trim();
    if (!title) {
      return NextResponse.json(
        { ok: false, error: 'Event title is required.' },
        { status: 400 }
      );
    }

    const startMs = new Date(rawEvent?.startIso || rawEvent?.startMs).getTime();
    const endMs = new Date(rawEvent?.endIso || rawEvent?.endMs).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      return NextResponse.json(
        { ok: false, error: 'Valid startIso and endIso (with end > start) are required.' },
        { status: 400 }
      );
    }

    const actorName = String(body?.userName || rawEvent?.ownerName || '').trim() || 'ConnectLn Member';
    const actorEmail = String(body?.userEmail || rawEvent?.ownerEmail || '').trim() || undefined;
    const actorKeys = buildViewerCalendarKeys(actorName, actorEmail);

    const existingId = String(rawEvent?.id || '').trim();
    let existingEvent: ConnectLnCalendarEvent | null = null;
    if (action === 'update') {
      if (!existingId) {
        return NextResponse.json(
          { ok: false, error: 'Event id is required for update.' },
          { status: 400 }
        );
      }
      const lookup = await getCalendarEventById(existingId);
      existingEvent = lookup.event;
      if (existingEvent) {
        const ownerKeys = new Set(
          buildViewerCalendarKeys(
            existingEvent.ownerName,
            existingEvent.ownerEmail || existingEvent.ownerKey
          )
        );
        const ownerCompact = normalizeCalendarParticipantKey(existingEvent.ownerKey);
        if (ownerCompact) ownerKeys.add(ownerCompact);
        const authorized = actorKeys.some((k) => ownerKeys.has(k));
        if (!authorized) {
          return NextResponse.json(
            { ok: false, error: 'Only the event organizer can edit this schedule block.' },
            { status: 403 }
          );
        }
      }
    }

    const category: CalendarEventCategory = VALID_CATEGORIES.has(rawEvent?.category)
      ? rawEvent.category
      : 'meeting';
    const showAs: CalendarShowAs = VALID_SHOW_AS.has(rawEvent?.showAs)
      ? rawEvent.showAs
      : category === 'ooo'
      ? 'oof'
      : 'busy';
    const recurrence: CalendarRecurrenceRule = VALID_RECURRENCE.has(rawEvent?.recurrence)
      ? rawEvent.recurrence
      : 'none';
    const callMode: 'video' | 'audio' | 'in_person' | 'none' =
      rawEvent?.callMode === 'video' ||
      rawEvent?.callMode === 'audio' ||
      rawEvent?.callMode === 'in_person' ||
      rawEvent?.callMode === 'none'
        ? rawEvent.callMode
        : category === 'meeting'
        ? 'video'
        : 'none';

    const eventId =
      existingId || `cal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let joinUrl = String(rawEvent?.joinUrl || existingEvent?.joinUrl || '').trim() || undefined;
    if (!joinUrl && (callMode === 'video' || callMode === 'audio')) {
      const origin = String(body?.origin || 'https://conectln.com').replace(/\/$/, '');
      const roomId = `call-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}-live`;
      joinUrl = `${origin}/connectin?tab=vibecomms&joinCall=${encodeURIComponent(roomId)}`;
    }

    const existingAttendeeRsvps = new Map<string, CalendarAttendee['rsvp']>();
    for (const oldAtt of existingEvent?.attendees || []) {
      const k = normalizeCalendarParticipantKey(oldAtt.email || oldAtt.key || oldAtt.name);
      if (k) existingAttendeeRsvps.set(k, oldAtt.rsvp);
    }

    const rawAttendees: any[] = Array.isArray(rawEvent?.attendees) ? rawEvent.attendees : [];
    const attendees: CalendarAttendee[] = rawAttendees
      .filter((a) => a && String(a.name || a.email || '').trim())
      .map((a) => {
        const name = String(a.name || a.email).trim();
        const email = a.email ? String(a.email).trim().toLowerCase() : undefined;
        const key =
          normalizeCalendarParticipantKey(email) ||
          normalizeCalendarParticipantKey(a.key || name);
        const preservedRsvp = existingAttendeeRsvps.get(key);
        return {
          id: a.id ? String(a.id) : undefined,
          name,
          email,
          avatar: a.avatar ? String(a.avatar) : undefined,
          subtitle: a.subtitle ? String(a.subtitle) : undefined,
          key,
          rsvp: a.rsvp || preservedRsvp || 'pending',
        };
      });

    const ownerName = existingEvent?.ownerName || actorName;
    const ownerEmail = existingEvent?.ownerEmail || actorEmail;
    const ownerKey =
      existingEvent?.ownerKey ||
      normalizeCalendarParticipantKey(ownerEmail) ||
      normalizeCalendarParticipantKey(ownerName) ||
      'connectln_member';

    const reminders = Array.isArray(rawEvent?.reminders)
      ? rawEvent.reminders.map(Number).filter((n: number) => Number.isFinite(n) && n >= 0 && n <= 1440)
      : [15];

    const eventToSave: ConnectLnCalendarEvent = {
      id: eventId,
      title: title.slice(0, 160),
      category,
      showAs,
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(endMs).toISOString(),
      startMs,
      endMs,
      allDay: Boolean(rawEvent?.allDay),
      recurrence,
      recurrenceUntilIso: rawEvent?.recurrenceUntilIso
        ? String(rawEvent.recurrenceUntilIso).slice(0, 32)
        : undefined,
      callMode,
      joinUrl,
      location: rawEvent?.location ? String(rawEvent.location).trim().slice(0, 180) : undefined,
      notes: rawEvent?.notes ? String(rawEvent.notes).trim().slice(0, 2000) : '',
      reminders,
      ownerId: rawEvent?.ownerId ? String(rawEvent.ownerId) : existingEvent?.ownerId,
      ownerName,
      ownerEmail,
      ownerKey,
      attendees,
      participantKeys: computeParticipantKeysForEvent({
        ownerName,
        ownerEmail,
        ownerKey,
        attendees,
      }),
      createdAtIso: existingEvent?.createdAtIso || rawEvent?.createdAtIso || new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
      cancelled: false,
    };

    const { event, mongoConnected } = await upsertCalendarEvent(eventToSave);
    return NextResponse.json({ ok: true, event, mongoConnected });
  }

  if (action === 'rsvp') {
    const eventId = String(body?.eventId || '').trim();
    const rsvp = String(body?.rsvp || '').trim().toLowerCase();
    if (!eventId || !['accepted', 'tentative', 'declined'].includes(rsvp)) {
      return NextResponse.json(
        { ok: false, error: 'Valid eventId and rsvp (accepted | tentative | declined) are required.' },
        { status: 400 }
      );
    }

    const actorName = String(body?.userName || '').trim();
    const actorEmail = String(body?.userEmail || '').trim() || undefined;
    const actorKeys = buildViewerCalendarKeys(actorName, actorEmail);
    if (actorKeys.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'User identity is required to update RSVP.' },
        { status: 400 }
      );
    }

    const { event, mongoConnected } = await updateCalendarEventRsvp({
      eventId,
      actorKeys,
      actorName: actorName || actorEmail || 'ConnectLn Member',
      actorEmail,
      rsvp: rsvp as 'accepted' | 'tentative' | 'declined',
    });

    if (!event) {
      return NextResponse.json(
        { ok: false, error: 'Calendar event not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, event, mongoConnected });
  }

  if (action === 'delete') {
    const eventId = String(body?.eventId || '').trim();
    const actorName = String(body?.userName || '').trim();
    const actorEmail = String(body?.userEmail || '').trim() || undefined;
    const actorKeys = buildViewerCalendarKeys(actorName, actorEmail);

    if (!eventId || actorKeys.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'eventId and user identity are required.' },
        { status: 400 }
      );
    }

    const { deleted, actionTaken, mongoConnected } = await deleteOrLeaveCalendarEvent({
      eventId,
      actorKeys,
    });

    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: 'Calendar event not found.', actionTaken },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, deletedId: eventId, actionTaken, mongoConnected });
  }

  if (action === 'sync_local') {
    const rawList = Array.isArray(body?.events) ? body.events.slice(0, 50) : [];
    const normalized: ConnectLnCalendarEvent[] = [];
    for (const raw of rawList) {
      if (!raw || !raw.id || !raw.title) continue;
      const startMs = new Date(raw.startIso || raw.startMs).getTime();
      const endMs = new Date(raw.endIso || raw.endMs).getTime();
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue;
      const ownerName = String(raw.ownerName || body?.userName || 'You').trim();
      const ownerEmail = raw.ownerEmail || body?.userEmail || undefined;
      const attendees: CalendarAttendee[] = Array.isArray(raw.attendees) ? raw.attendees : [];
      normalized.push({
        id: String(raw.id),
        title: String(raw.title).slice(0, 160),
        category: VALID_CATEGORIES.has(raw.category) ? raw.category : 'meeting',
        showAs: VALID_SHOW_AS.has(raw.showAs) ? raw.showAs : 'busy',
        startIso: new Date(startMs).toISOString(),
        endIso: new Date(endMs).toISOString(),
        startMs,
        endMs,
        allDay: Boolean(raw.allDay),
        recurrence: VALID_RECURRENCE.has(raw.recurrence) ? raw.recurrence : 'none',
        callMode: raw.callMode || 'video',
        joinUrl: raw.joinUrl,
        location: raw.location,
        notes: raw.notes || '',
        reminders: Array.isArray(raw.reminders) ? raw.reminders : [15, 30],
        ownerName,
        ownerEmail,
        ownerKey:
          normalizeCalendarParticipantKey(raw.ownerKey || ownerEmail || ownerName) ||
          'connectln_member',
        attendees,
        participantKeys: computeParticipantKeysForEvent({
          ownerName,
          ownerEmail,
          ownerKey: raw.ownerKey,
          attendees,
        }),
        createdAtIso: raw.createdAtIso || new Date().toISOString(),
        updatedAtIso: raw.updatedAtIso || new Date().toISOString(),
      });
    }

    const { syncedCount, mongoConnected } = await syncLegacyCalendarEvents(normalized);
    return NextResponse.json({ ok: true, syncedCount, mongoConnected });
  }

  return NextResponse.json(
    { ok: false, error: `Unsupported calendar action "${action}".` },
    { status: 400 }
  );
}
