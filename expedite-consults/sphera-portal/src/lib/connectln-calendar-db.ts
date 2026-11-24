import {
  getConnectLnMongoDb,
  isConnectLnMongoConfigured,
} from './connectln-mongodb';
import { firebaseKvGetItem, firebaseKvSetItem } from './connectin-firebase-kv';
import {
  CalendarAttendee,
  ConnectLnCalendarEvent,
  computeParticipantKeysForEvent,
  normalizeCalendarParticipantKey,
} from './connectln-calendar-utils';

const COLLECTION_NAME = 'connectln_calendar_events';
const FB_CALENDAR_MAP = 'connectln_calendar_events_v1';
const FB_BUCKET_KEY = 'all_events_v1';
const MAX_FALLBACK_EVENTS = 1000;

const gCal = globalThis as unknown as {
  __connectlnCalendarMemory?: ConnectLnCalendarEvent[];
};

function stripMongoInternalFields(doc: Record<string, any> | null | undefined): ConnectLnCalendarEvent | null {
  if (!doc || typeof doc !== 'object') return null;
  const { _id, ...rest } = doc;
  const id = String(rest.id || _id || '').trim();
  if (!id) return null;
  const startMs = Number.isFinite(rest.startMs)
    ? Number(rest.startMs)
    : new Date(rest.startIso).getTime();
  const endMs = Number.isFinite(rest.endMs)
    ? Number(rest.endMs)
    : new Date(rest.endIso).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

  const normalized: ConnectLnCalendarEvent = {
    ...(rest as ConnectLnCalendarEvent),
    id,
    startMs,
    endMs,
    startIso: rest.startIso || new Date(startMs).toISOString(),
    endIso: rest.endIso || new Date(endMs).toISOString(),
    recurrence: rest.recurrence || 'none',
    category: rest.category || 'meeting',
    showAs: rest.showAs || 'busy',
    ownerName: String(rest.ownerName || 'ConnectLn Member'),
    ownerKey: normalizeCalendarParticipantKey(rest.ownerKey || rest.ownerEmail || rest.ownerName),
    attendees: Array.isArray(rest.attendees) ? rest.attendees : [],
    participantKeys: Array.isArray(rest.participantKeys) ? rest.participantKeys : [],
    createdAtIso: rest.createdAtIso || new Date(startMs).toISOString(),
    updatedAtIso: rest.updatedAtIso || new Date().toISOString(),
  };
  return normalized;
}

async function readFallbackEvents(): Promise<ConnectLnCalendarEvent[]> {
  try {
    const kv = await firebaseKvGetItem<ConnectLnCalendarEvent[]>(FB_CALENDAR_MAP, FB_BUCKET_KEY);
    if (Array.isArray(kv)) {
      gCal.__connectlnCalendarMemory = kv;
      return kv;
    }
  } catch {
    // ignore KV read failure
  }
  return Array.isArray(gCal.__connectlnCalendarMemory) ? gCal.__connectlnCalendarMemory : [];
}

async function writeFallbackEvents(list: ConnectLnCalendarEvent[]): Promise<void> {
  const capped = list.slice(0, MAX_FALLBACK_EVENTS);
  gCal.__connectlnCalendarMemory = capped;
  try {
    await firebaseKvSetItem(FB_CALENDAR_MAP, FB_BUCKET_KEY, capped);
  } catch {
    // ignore KV write failure
  }
}

export async function listUserCalendarEvents(
  viewerKeys: string[]
): Promise<{ events: ConnectLnCalendarEvent[]; mongoConnected: boolean }> {
  const cleanKeys = Array.from(
    new Set(viewerKeys.map((k) => normalizeCalendarParticipantKey(k) || k.trim().toLowerCase()).filter(Boolean))
  );
  if (cleanKeys.length === 0) {
    return { events: [], mongoConnected: false };
  }

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        const docs = await col
          .find({
            participantKeys: { $in: cleanKeys },
            cancelled: { $ne: true },
          })
          .sort({ startMs: 1 })
          .limit(400)
          .toArray();
        const events = docs
          .map(stripMongoInternalFields)
          .filter((e): e is ConnectLnCalendarEvent => e !== null);
        return { events, mongoConnected: true };
      }
    } catch (err) {
      console.warn('[connectln-calendar-db] listUserCalendarEvents fallback:', (err as any)?.message);
    }
  }

  const all = await readFallbackEvents();
  const keySet = new Set(cleanKeys);
  const filtered = all
    .filter((ev) => !ev.cancelled && (ev.participantKeys || []).some((pk) => keySet.has(pk)))
    .sort((a, b) => a.startMs - b.startMs)
    .slice(0, 400);

  return { events: filtered, mongoConnected: false };
}

export async function getCalendarEventById(
  eventId: string
): Promise<{ event: ConnectLnCalendarEvent | null; mongoConnected: boolean }> {
  const cleanId = String(eventId || '').trim();
  if (!cleanId) return { event: null, mongoConnected: false };

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        const doc = await col.findOne({ _id: cleanId as any });
        return { event: stripMongoInternalFields(doc), mongoConnected: true };
      }
    } catch {
      // fallback
    }
  }

  const all = await readFallbackEvents();
  const found = all.find((e) => e.id === cleanId) || null;
  return { event: found, mongoConnected: false };
}

export async function upsertCalendarEvent(
  event: ConnectLnCalendarEvent
): Promise<{ event: ConnectLnCalendarEvent; mongoConnected: boolean }> {
  const normalizedAttendees: CalendarAttendee[] = (event.attendees || []).map((att) => ({
    ...att,
    key:
      normalizeCalendarParticipantKey(att.email) ||
      normalizeCalendarParticipantKey(att.key || att.name),
    rsvp: att.rsvp || 'pending',
  }));

  const cleanEvent: ConnectLnCalendarEvent = {
    ...event,
    ownerKey:
      normalizeCalendarParticipantKey(event.ownerKey) ||
      normalizeCalendarParticipantKey(event.ownerEmail) ||
      normalizeCalendarParticipantKey(event.ownerName),
    attendees: normalizedAttendees,
    participantKeys: computeParticipantKeysForEvent({
      ownerName: event.ownerName,
      ownerEmail: event.ownerEmail,
      ownerKey: event.ownerKey,
      attendees: normalizedAttendees,
    }),
    updatedAtIso: new Date().toISOString(),
  };

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        await col.updateOne(
          { _id: cleanEvent.id as any },
          {
            $set: {
              ...cleanEvent,
              _id: cleanEvent.id,
            },
          },
          { upsert: true }
        );
        return { event: cleanEvent, mongoConnected: true };
      }
    } catch (err) {
      console.warn('[connectln-calendar-db] upsertCalendarEvent fallback:', (err as any)?.message);
    }
  }

  const all = await readFallbackEvents();
  const next = [cleanEvent, ...all.filter((e) => e.id !== cleanEvent.id)].sort(
    (a, b) => a.startMs - b.startMs
  );
  await writeFallbackEvents(next);
  return { event: cleanEvent, mongoConnected: false };
}

export async function updateCalendarEventRsvp(params: {
  eventId: string;
  actorKeys: string[];
  actorName: string;
  actorEmail?: string;
  rsvp: 'accepted' | 'tentative' | 'declined';
}): Promise<{ event: ConnectLnCalendarEvent | null; mongoConnected: boolean }> {
  const { eventId, actorKeys, actorName, actorEmail, rsvp } = params;
  const actorKeySet = new Set(
    actorKeys.map((k) => normalizeCalendarParticipantKey(k) || k.trim().toLowerCase()).filter(Boolean)
  );

  const applyRsvpUpdate = (existing: ConnectLnCalendarEvent): ConnectLnCalendarEvent => {
    let matchedAttendee = false;
    const updatedAttendees = (existing.attendees || []).map((att) => {
      const attKeys = [
        normalizeCalendarParticipantKey(att.key),
        normalizeCalendarParticipantKey(att.email),
        normalizeCalendarParticipantKey(att.name),
      ].filter(Boolean);
      if (attKeys.some((k) => actorKeySet.has(k))) {
        matchedAttendee = true;
        return { ...att, rsvp };
      }
      return att;
    });

    if (!matchedAttendee && actorName) {
      updatedAttendees.push({
        name: actorName,
        email: actorEmail,
        key:
          normalizeCalendarParticipantKey(actorEmail) ||
          normalizeCalendarParticipantKey(actorName),
        rsvp,
      });
    }

    // Keep actor in participantKeys when replying to an RSVP so declined invites remain changeable if re-opened
    const mergedKeys = new Set(existing.participantKeys || []);
    for (const k of actorKeySet) mergedKeys.add(k);

    return {
      ...existing,
      attendees: updatedAttendees,
      participantKeys: Array.from(mergedKeys),
      updatedAtIso: new Date().toISOString(),
    };
  };

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        const doc = await col.findOne({ _id: eventId as any });
        const existing = stripMongoInternalFields(doc);
        if (!existing) return { event: null, mongoConnected: true };
        const nextEvent = applyRsvpUpdate(existing);
        await col.updateOne(
          { _id: eventId as any },
          {
            $set: {
              attendees: nextEvent.attendees,
              participantKeys: nextEvent.participantKeys,
              updatedAtIso: nextEvent.updatedAtIso,
            },
          }
        );
        return { event: nextEvent, mongoConnected: true };
      }
    } catch (err) {
      console.warn('[connectln-calendar-db] updateCalendarEventRsvp fallback:', (err as any)?.message);
    }
  }

  const all = await readFallbackEvents();
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx === -1) return { event: null, mongoConnected: false };
  const nextEvent = applyRsvpUpdate(all[idx]);
  all[idx] = nextEvent;
  await writeFallbackEvents(all);
  return { event: nextEvent, mongoConnected: false };
}

export async function deleteOrLeaveCalendarEvent(params: {
  eventId: string;
  actorKeys: string[];
}): Promise<{
  deleted: boolean;
  actionTaken: 'deleted' | 'left' | 'not_found';
  mongoConnected: boolean;
}> {
  const { eventId, actorKeys } = params;
  const actorKeySet = new Set(
    actorKeys.map((k) => normalizeCalendarParticipantKey(k) || k.trim().toLowerCase()).filter(Boolean)
  );

  const isActorOrganizer = (ev: ConnectLnCalendarEvent): boolean => {
    const ownerKeys = [
      normalizeCalendarParticipantKey(ev.ownerKey),
      normalizeCalendarParticipantKey(ev.ownerEmail),
      normalizeCalendarParticipantKey(ev.ownerName),
    ].filter(Boolean);
    return ownerKeys.some((k) => actorKeySet.has(k));
  };

  const leaveEventUpdate = (ev: ConnectLnCalendarEvent): ConnectLnCalendarEvent => {
    const updatedAttendees = (ev.attendees || []).map((att) => {
      const attKeys = [
        normalizeCalendarParticipantKey(att.key),
        normalizeCalendarParticipantKey(att.email),
        normalizeCalendarParticipantKey(att.name),
      ].filter(Boolean);
      return attKeys.some((k) => actorKeySet.has(k)) ? { ...att, rsvp: 'declined' as const } : att;
    });
    const remainingKeys = (ev.participantKeys || []).filter((pk) => !actorKeySet.has(pk));
    return {
      ...ev,
      attendees: updatedAttendees,
      participantKeys: remainingKeys,
      updatedAtIso: new Date().toISOString(),
    };
  };

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        const doc = await col.findOne({ _id: eventId as any });
        const existing = stripMongoInternalFields(doc);
        if (!existing) {
          return { deleted: false, actionTaken: 'not_found', mongoConnected: true };
        }
        if (isActorOrganizer(existing)) {
          await col.deleteOne({ _id: eventId as any });
          return { deleted: true, actionTaken: 'deleted', mongoConnected: true };
        }
        const left = leaveEventUpdate(existing);
        await col.updateOne(
          { _id: eventId as any },
          {
            $set: {
              attendees: left.attendees,
              participantKeys: left.participantKeys,
              updatedAtIso: left.updatedAtIso,
            },
          }
        );
        return { deleted: true, actionTaken: 'left', mongoConnected: true };
      }
    } catch (err) {
      console.warn('[connectln-calendar-db] deleteOrLeaveCalendarEvent fallback:', (err as any)?.message);
    }
  }

  const all = await readFallbackEvents();
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx === -1) return { deleted: false, actionTaken: 'not_found', mongoConnected: false };

  if (isActorOrganizer(all[idx])) {
    await writeFallbackEvents(all.filter((e) => e.id !== eventId));
    return { deleted: true, actionTaken: 'deleted', mongoConnected: false };
  }

  all[idx] = leaveEventUpdate(all[idx]);
  await writeFallbackEvents(all);
  return { deleted: true, actionTaken: 'left', mongoConnected: false };
}

export async function syncLegacyCalendarEvents(
  events: ConnectLnCalendarEvent[]
): Promise<{ syncedCount: number; mongoConnected: boolean }> {
  const cleanEvents = events
    .filter((e) => e && e.id && e.title && Number.isFinite(e.startMs) && Number.isFinite(e.endMs))
    .slice(0, 50)
    .map((ev) => ({
      ...ev,
      ownerKey:
        normalizeCalendarParticipantKey(ev.ownerKey) ||
        normalizeCalendarParticipantKey(ev.ownerEmail) ||
        normalizeCalendarParticipantKey(ev.ownerName),
      participantKeys: computeParticipantKeysForEvent(ev),
    }));

  if (cleanEvents.length === 0) {
    return { syncedCount: 0, mongoConnected: isConnectLnMongoConfigured() };
  }

  if (isConnectLnMongoConfigured()) {
    try {
      const db = await getConnectLnMongoDb();
      if (db) {
        const col = db.collection<Record<string, any>>(COLLECTION_NAME);
        const ops = cleanEvents.map((ev) => ({
          updateOne: {
            filter: { _id: ev.id as any },
            update: {
              $setOnInsert: {
                ...ev,
                _id: ev.id,
              },
            },
            upsert: true,
          },
        }));
        const res = await col.bulkWrite(ops, { ordered: false });
        return {
          syncedCount: Number(res.upsertedCount || 0),
          mongoConnected: true,
        };
      }
    } catch (err) {
      console.warn('[connectln-calendar-db] syncLegacyCalendarEvents fallback:', (err as any)?.message);
    }
  }

  const existing = await readFallbackEvents();
  const existingIds = new Set(existing.map((e) => e.id));
  const newOnes = cleanEvents.filter((e) => !existingIds.has(e.id));
  if (newOnes.length > 0) {
    await writeFallbackEvents([...newOnes, ...existing].sort((a, b) => a.startMs - b.startMs));
  }
  return { syncedCount: newOnes.length, mongoConnected: false };
}
