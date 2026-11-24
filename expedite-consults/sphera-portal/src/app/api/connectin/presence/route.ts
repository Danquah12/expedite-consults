import { NextResponse } from 'next/server';
import { firebaseKvGetItem, firebaseKvSetItem } from '@/lib/connectin-firebase-kv';
import {
  ConnectLnPresenceRecord,
  PRESENCE_META,
  normalizePresenceKey,
} from '@/lib/connectln-presence';

export const dynamic = 'force-dynamic';

const PRESENCE_KV_MAP = 'connectln_presence_v1';
const TYPING_KV_MAP = 'connectln_typing_v1';
const PRESENCE_TTL_SEC = 7 * 86400;
const TYPING_TTL_SEC = 60;
const TYPING_FRESH_MS = 7500;

interface ThreadTypingBucket {
  users: Record<string, { key: string; name: string; updatedAtMs: number }>;
}

function makeCleanKvKey(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '_')
    .slice(0, 72);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawKeys = (url.searchParams.get('keys') || '').trim();
    const threadId = (url.searchParams.get('threadId') || '').trim();
    const nowMs = Date.now();

    const keyList = Array.from(
      new Set(
        rawKeys
          .split(',')
          .map((k) => normalizePresenceKey(k))
          .filter(Boolean)
          .slice(0, 12)
      )
    );

    const [presencePairs, typingBucket] = await Promise.all([
      Promise.all(
        keyList.map(async (k) => {
          const item = await firebaseKvGetItem<ConnectLnPresenceRecord>(
            PRESENCE_KV_MAP,
            `p_${makeCleanKvKey(k)}`
          ).catch(() => null);
          return [k, item] as const;
        })
      ),
      threadId
        ? firebaseKvGetItem<ThreadTypingBucket>(
            TYPING_KV_MAP,
            `t_${makeCleanKvKey(threadId)}`
          ).catch(() => null)
        : Promise.resolve(null),
    ]);

    const presence: Record<string, ConnectLnPresenceRecord> = {};
    for (const [k, rec] of presencePairs) {
      if (rec && rec.status) {
        presence[k] = rec;
      }
    }

    const typingUsers: Array<{ key: string; name: string; updatedAtMs: number }> = [];
    if (typingBucket?.users) {
      for (const entry of Object.values(typingBucket.users)) {
        if (entry && entry.name && nowMs - (entry.updatedAtMs || 0) < TYPING_FRESH_MS) {
          typingUsers.push(entry);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      presence,
      typingUsers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to read presence state' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || '').trim().toLowerCase();
    const nowMs = Date.now();

    if (action === 'set_presence') {
      const userName = String(body?.userName || '').trim();
      const userEmail = String(body?.userEmail || '').trim().toLowerCase();
      const rawRec = body?.record && typeof body.record === 'object' ? body.record : body;
      const status =
        rawRec?.status && String(rawRec.status) in PRESENCE_META
          ? (String(rawRec.status) as ConnectLnPresenceRecord['status'])
          : 'available';

      const record: ConnectLnPresenceRecord = {
        status,
        customMessage: rawRec?.customMessage ? String(rawRec.customMessage).slice(0, 140) : '',
        oooAutoDecline: Boolean(rawRec?.oooAutoDecline),
        oooMessage: rawRec?.oooMessage ? String(rawRec.oooMessage).slice(0, 240) : '',
        updatedAtMs: nowMs,
        previousStatus: rawRec?.previousStatus,
      };

      const keys = Array.from(
        new Set(
          [normalizePresenceKey(userEmail), normalizePresenceKey(userName)].filter(Boolean)
        )
      );
      if (keys.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'userName or userEmail is required.' },
          { status: 400 }
        );
      }

      await Promise.all(
        keys.map((k) =>
          firebaseKvSetItem(PRESENCE_KV_MAP, `p_${makeCleanKvKey(k)}`, record, PRESENCE_TTL_SEC)
        )
      );

      return NextResponse.json({ ok: true, record, keys });
    }

    if (action === 'typing') {
      const threadId = String(body?.threadId || '').trim();
      const userName = String(body?.userName || '').trim();
      const userKey = normalizePresenceKey(body?.userEmail || userName);
      const isTyping = body?.isTyping !== false;

      if (!threadId || !userName || !userKey) {
        return NextResponse.json(
          { ok: false, error: 'threadId and userName are required.' },
          { status: 400 }
        );
      }

      const bucketKey = `t_${makeCleanKvKey(threadId)}`;
      const existing =
        (await firebaseKvGetItem<ThreadTypingBucket>(TYPING_KV_MAP, bucketKey).catch(() => null)) ||
        { users: {} };

      const nextUsers: ThreadTypingBucket['users'] = {};
      for (const [k, v] of Object.entries(existing.users || {})) {
        if (v && nowMs - (v.updatedAtMs || 0) < TYPING_FRESH_MS && k !== userKey) {
          nextUsers[k] = v;
        }
      }
      if (isTyping) {
        nextUsers[userKey] = {
          key: userKey,
          name: userName,
          updatedAtMs: nowMs,
        };
      }

      await firebaseKvSetItem(TYPING_KV_MAP, bucketKey, { users: nextUsers }, TYPING_TTL_SEC);

      return NextResponse.json({
        ok: true,
        typingUsers: Object.values(nextUsers),
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported presence action "${action}".` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Presence update failed' },
      { status: 500 }
    );
  }
}
