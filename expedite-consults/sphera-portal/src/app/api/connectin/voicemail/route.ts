import { NextResponse } from 'next/server';
import { firebaseKvGetItem, firebaseKvSetItem } from '@/lib/connectin-firebase-kv';

export const dynamic = 'force-dynamic';

const VOICEMAIL_KV_MAP = 'connectln_voicemail_v1';
const VOICEMAIL_BUCKET_KEY = 'all_voicemails_v1';

export interface ConnectLnVoicemailItem {
  id: string;
  callerName: string;
  callerPhone?: string;
  callerEmail?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  audioDataUrl?: string;
  durationSec: number;
  transcript: string;
  createdAtIso: string;
  read: boolean;
}

function normStr(v?: string): string {
  return String(v || '').trim().toLowerCase();
}

function last10Digits(v?: string): string {
  const d = String(v || '').replace(/[^\d]/g, '');
  return d.length >= 7 ? d.slice(-10) : '';
}

function matchesRecipient(
  vm: ConnectLnVoicemailItem,
  viewer: { phone?: string; email?: string; name?: string }
): boolean {
  const vTel = last10Digits(viewer.phone);
  const vmTel = last10Digits(vm.recipientPhone);
  if (vTel && vmTel && vTel === vmTel) return true;

  const vEmail = normStr(viewer.email);
  const vmEmail = normStr(vm.recipientEmail);
  if (vEmail && vmEmail && vEmail === vmEmail) return true;

  const vName = normStr(viewer.name);
  const vmName = normStr(vm.recipientName);
  if (vName && vmName) {
    if (vName === vmName) return true;
    const vComp = vName.replace(/[^a-z0-9]/g, '');
    const vmComp = vmName.replace(/[^a-z0-9]/g, '');
    if (vComp.length >= 4 && vComp === vmComp) return true;
  }
  return false;
}

async function readBucket(): Promise<ConnectLnVoicemailItem[]> {
  const bucket = await firebaseKvGetItem<{ items: ConnectLnVoicemailItem[] }>(
    VOICEMAIL_KV_MAP,
    VOICEMAIL_BUCKET_KEY
  ).catch(() => null);
  return Array.isArray(bucket?.items) ? bucket.items : [];
}

async function writeBucket(items: ConnectLnVoicemailItem[]): Promise<void> {
  await firebaseKvSetItem(VOICEMAIL_KV_MAP, VOICEMAIL_BUCKET_KEY, {
    items: items.slice(0, 120),
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const viewerPhone = (url.searchParams.get('viewerPhone') || '').trim();
    const viewerEmail = (url.searchParams.get('viewerEmail') || '').trim();
    const viewerName = (url.searchParams.get('viewerName') || '').trim();

    if (!viewerPhone && !viewerEmail && !viewerName) {
      return NextResponse.json({ ok: true, voicemails: [], unreadCount: 0 });
    }

    const all = await readBucket();
    const voicemails = all
      .filter((vm) => matchesRecipient(vm, { phone: viewerPhone, email: viewerEmail, name: viewerName }))
      .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

    const unreadCount = voicemails.filter((vm) => !vm.read).length;
    return NextResponse.json({ ok: true, voicemails, unreadCount });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to load voicemails' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (action === 'leave_voicemail') {
      const callerName = String(body?.callerName || '').trim() || 'ConnectLn Caller';
      const recipientName = String(body?.recipientName || '').trim() || 'ConnectLn Member';
      const rawAudio = typeof body?.audioDataUrl === 'string' ? body.audioDataUrl : '';
      const audioDataUrl =
        rawAudio.startsWith('data:audio/') && rawAudio.length <= 650000 ? rawAudio : undefined;
      const transcript = String(body?.transcript || '').trim().slice(0, 2000);
      const durationSec = Math.max(1, Math.min(300, Number(body?.durationSec) || 1));

      if (!audioDataUrl && !transcript) {
        return NextResponse.json(
          { ok: false, error: 'Voicemail audio or message transcript is required.' },
          { status: 400 }
        );
      }

      const item: ConnectLnVoicemailItem = {
        id: String(body?.id || `vm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        callerName: callerName.slice(0, 100),
        callerPhone: body?.callerPhone ? String(body.callerPhone).trim() : undefined,
        callerEmail: body?.callerEmail ? String(body.callerEmail).trim().toLowerCase() : undefined,
        recipientName: recipientName.slice(0, 100),
        recipientPhone: body?.recipientPhone ? String(body.recipientPhone).trim() : undefined,
        recipientEmail: body?.recipientEmail ? String(body.recipientEmail).trim().toLowerCase() : undefined,
        audioDataUrl,
        durationSec,
        transcript: transcript || 'Voice message recorded on ConnectLn.',
        createdAtIso: nowIso,
        read: false,
      };

      const all = await readBucket();
      await writeBucket([item, ...all.filter((x) => x.id !== item.id)]);
      return NextResponse.json({ ok: true, voicemail: item });
    }

    if (action === 'mark_read') {
      const id = String(body?.id || '').trim();
      const all = await readBucket();
      const updated = all.map((vm) => (vm.id === id ? { ...vm, read: body?.read !== false } : vm));
      await writeBucket(updated);
      return NextResponse.json({ ok: true, id });
    }

    if (action === 'delete') {
      const id = String(body?.id || '').trim();
      const all = await readBucket();
      await writeBucket(all.filter((vm) => vm.id !== id));
      return NextResponse.json({ ok: true, deletedId: id });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported voicemail action "${action}".` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Voicemail request failed' },
      { status: 500 }
    );
  }
}
