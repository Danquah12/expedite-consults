import { NextResponse } from 'next/server';
import {
  CalendarRecurrenceRule,
  ConnectLnCalendarEvent,
  buildViewerCalendarKeys,
  computeParticipantKeysForEvent,
  normalizeCalendarParticipantKey,
} from '@/lib/connectln-calendar-utils';
import { listUserCalendarEvents, upsertCalendarEvent } from '@/lib/connectln-calendar-db';

export const dynamic = 'force-dynamic';

const pad2 = (n: number) => String(n).padStart(2, '0');

function toIcsUtcStamp(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(
    d.getUTCHours()
  )}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeIcsText(raw?: string): string {
  return String(raw || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function buildRruleLine(rule: CalendarRecurrenceRule, untilIso?: string): string | null {
  if (!rule || rule === 'none') return null;
  let freq = '';
  if (rule === 'daily') freq = 'FREQ=DAILY';
  else if (rule === 'weekdays') freq = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  else if (rule === 'weekly') freq = 'FREQ=WEEKLY';
  else if (rule === 'monthly') freq = 'FREQ=MONTHLY';
  if (!freq) return null;
  if (untilIso) {
    const cleanUntil = untilIso.slice(0, 10).replace(/-/g, '');
    if (/^\d{8}$/.test(cleanUntil)) {
      freq += `;UNTIL=${cleanUntil}T235959Z`;
    }
  }
  return `RRULE:${freq}`;
}

function parseIcsDateValue(rawVal: string): { ms: number; allDay: boolean } | null {
  const clean = rawVal.trim().replace(/^.*:/, '');
  if (/^\d{8}$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6)) - 1;
    const d = Number(clean.slice(6, 8));
    const dt = new Date(y, m, d, 9, 0, 0, 0);
    return Number.isFinite(dt.getTime()) ? { ms: dt.getTime(), allDay: true } : null;
  }
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const da = Number(m[3]);
    const hr = Number(m[4]);
    const mi = Number(m[5]);
    const sec = Number(m[6] || '0');
    const ms = m[7]
      ? Date.UTC(y, mo, da, hr, mi, sec)
      : new Date(y, mo, da, hr, mi, sec).getTime();
    return Number.isFinite(ms) ? { ms, allDay: false } : null;
  }
  const fallback = new Date(clean).getTime();
  return Number.isFinite(fallback) ? { ms: fallback, allDay: false } : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userName = (url.searchParams.get('userName') || '').trim();
    const userEmail = (url.searchParams.get('userEmail') || '').trim();
    const viewerKeys = buildViewerCalendarKeys(userName, userEmail);
    const { events } =
      viewerKeys.length > 0 ? await listUserCalendarEvents(viewerKeys) : { events: [] };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ConnectLn//Teams Calendar Sync//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeIcsText(userName ? `${userName} · ConnectLn` : 'ConnectLn Calendar')}`,
    ];

    for (const ev of events) {
      if (!ev || ev.cancelled) continue;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.id}@connectln.app`);
      lines.push(`DTSTAMP:${toIcsUtcStamp(Date.now())}`);
      lines.push(`DTSTART:${toIcsUtcStamp(ev.startMs)}`);
      lines.push(`DTEND:${toIcsUtcStamp(ev.endMs)}`);
      lines.push(`SUMMARY:${escapeIcsText(ev.title)}`);
      if (ev.location || ev.joinUrl) {
        lines.push(`LOCATION:${escapeIcsText(ev.location || ev.joinUrl)}`);
      }
      if (ev.joinUrl) {
        lines.push(`URL:${ev.joinUrl}`);
      }
      const desc = [ev.notes || '', ev.joinUrl ? `Join ConnectLn: ${ev.joinUrl}` : '']
        .filter(Boolean)
        .join('\n');
      if (desc) {
        lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
      }
      const rrule = buildRruleLine(ev.recurrence, ev.recurrenceUntilIso);
      if (rrule) lines.push(rrule);
      lines.push(
        `STATUS:${ev.showAs === 'tentative' ? 'TENTATIVE' : 'CONFIRMED'}`
      );
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Reminder: ${escapeIcsText(ev.title)}`);
      lines.push('TRIGGER:-PT15M');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="connectln-calendar.ics"',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to generate ICS feed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawIcs = String(body?.icsText || '');
    const userName = String(body?.userName || '').trim() || 'ConnectLn Member';
    const userEmail = body?.userEmail ? String(body.userEmail).trim().toLowerCase() : undefined;

    if (!rawIcs.includes('BEGIN:VEVENT')) {
      return NextResponse.json(
        { ok: false, error: 'Valid .ics calendar content with VEVENT blocks is required.' },
        { status: 400 }
      );
    }

    // Unfold RFC 5545 lines (CRLF + space/tab continuation)
    const unfolded = rawIcs.replace(/\r?\n[ \t]/g, '');
    const blocks = unfolded.split(/BEGIN:VEVENT/i).slice(1);
    const ownerKey =
      normalizeCalendarParticipantKey(userEmail) ||
      normalizeCalendarParticipantKey(userName) ||
      'connectln_member';

    const importedEvents: ConnectLnCalendarEvent[] = [];
    const nowIso = new Date().toISOString();

    for (const block of blocks.slice(0, 60)) {
      const evBody = block.split(/END:VEVENT/i)[0] || '';
      const rawLines = evBody.split(/\r?\n/).filter(Boolean);
      const props: Record<string, string> = {};
      for (const ln of rawLines) {
        const colonIdx = ln.indexOf(':');
        if (colonIdx <= 0) continue;
        const propName = ln.slice(0, colonIdx).split(';')[0].trim().toUpperCase();
        const propVal = ln.slice(colonIdx + 1).trim();
        props[propName] = propVal
          .replace(/\\n/g, '\n')
          .replace(/\\,/g, ',')
          .replace(/\\;/g, ';')
          .replace(/\\\\/g, '\\');
      }

      const title = (props.SUMMARY || '').trim();
      const parsedStart = props.DTSTART ? parseIcsDateValue(props.DTSTART) : null;
      if (!title || !parsedStart) continue;
      const parsedEnd = props.DTEND ? parseIcsDateValue(props.DTEND) : null;
      const startMs = parsedStart.ms;
      const endMs =
        parsedEnd && parsedEnd.ms > startMs
          ? parsedEnd.ms
          : startMs + (parsedStart.allDay ? 8 * 3600000 : 3600000);

      let recurrence: CalendarRecurrenceRule = 'none';
      const rrule = (props.RRULE || '').toUpperCase();
      if (rrule.includes('FREQ=DAILY')) recurrence = 'daily';
      else if (rrule.includes('FREQ=WEEKLY') && rrule.includes('BYDAY=MO,TU,WE,TH,FR')) {
        recurrence = 'weekdays';
      } else if (rrule.includes('FREQ=WEEKLY')) recurrence = 'weekly';
      else if (rrule.includes('FREQ=MONTHLY')) recurrence = 'monthly';

      const uidClean = String(props.UID || '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 48);
      const id = uidClean ? `ics_${uidClean}` : `ics_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      const ev: ConnectLnCalendarEvent = {
        id,
        title: title.slice(0, 160),
        category: /ooo|out of office|vacation|pto/i.test(title) ? 'ooo' : 'meeting',
        showAs: /ooo|out of office|vacation|pto/i.test(title) ? 'oof' : 'busy',
        startIso: new Date(startMs).toISOString(),
        endIso: new Date(endMs).toISOString(),
        startMs,
        endMs,
        allDay: parsedStart.allDay,
        recurrence,
        callMode: 'video',
        joinUrl: props.URL && /^https?:\/\//i.test(props.URL) ? props.URL : undefined,
        location: props.LOCATION ? props.LOCATION.slice(0, 180) : undefined,
        notes: props.DESCRIPTION ? props.DESCRIPTION.slice(0, 2000) : '',
        reminders: [15],
        ownerName: userName,
        ownerEmail: userEmail,
        ownerKey,
        attendees: [],
        participantKeys: computeParticipantKeysForEvent({
          ownerName: userName,
          ownerEmail: userEmail,
          ownerKey,
          attendees: [],
        }),
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        cancelled: false,
      };

      const { event } = await upsertCalendarEvent(ev);
      importedEvents.push(event);
    }

    return NextResponse.json({
      ok: true,
      importedCount: importedEvents.length,
      events: importedEvents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to import ICS calendar' },
      { status: 500 }
    );
  }
}
