import { NextResponse } from 'next/server';
import { normalizeParticipantKey } from '@/lib/connectin-cloud-sync';

export interface CloudCredentialCheckItem {
    id: string;
    viewerName: string;
    viewerHeadline: string;
    viewerAvatar: string;
    viewerCompany: string;
    viewerLocation: string;
    clearanceLevel: string;
    viewVector: string;
    category: 'recruiter' | 'buyer' | 'peer' | 'executive';
    createdAtIso: string;
}

const SYNC_CHECKS_MAP = 'connectin_profile_checks_v1';
const memoryChecksByTargetKey: Record<string, CloudCredentialCheckItem[]> = {};

function getTwilioAuthHeader(): string | null {
    const sid = process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_AUTH_TOKEN || '';
    if (!sid || !token) return null;
    return `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
}

function targetMapKey(name: string): string {
    return `checks__${normalizeParticipantKey(name).replace(/[^a-z0-9]/g, '_').slice(0, 48)}`;
}

function formatRelativeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 60_000) return 'Checked just now';
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 60) return `Checked ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Checked ${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `Checked ${days}d ago`;
}

async function pullCloudChecksForTarget(key: string): Promise<CloudCredentialCheckItem[]> {
    const auth = getTwilioAuthHeader();
    if (!auth) return [];
    try {
        const res = await fetch(
            `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_CHECKS_MAP}/Items/${encodeURIComponent(key)}`,
            {
                method: 'GET',
                headers: { Authorization: auth },
                cache: 'no-store',
            }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data?.items) ? (json.data.items as CloudCredentialCheckItem[]) : [];
    } catch {
        return [];
    }
}

async function pushCloudChecksForTarget(key: string, items: CloudCredentialCheckItem[]): Promise<void> {
    const auth = getTwilioAuthHeader();
    if (!auth) return;
    try {
        const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_CHECKS_MAP}`;
        const serialized = JSON.stringify({ items: items.slice(0, 35) });
        const updateRes = await fetch(`${baseUrl}/Items/${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: {
                Authorization: auth,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ Data: serialized }).toString(),
        });
        if (updateRes.ok) return;
        if (updateRes.status === 404) {
            await fetch('https://sync.twilio.com/v1/Services/default/Maps', {
                method: 'POST',
                headers: {
                    Authorization: auth,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ UniqueName: SYNC_CHECKS_MAP }).toString(),
            }).catch(() => {});
            await fetch(`${baseUrl}/Items`, {
                method: 'POST',
                headers: {
                    Authorization: auth,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ Key: key, Data: serialized }).toString(),
            }).catch(() => {});
        }
    } catch {
        // best-effort cloud persistence
    }
}

function mergeChecks(a: CloudCredentialCheckItem[], b: CloudCredentialCheckItem[]): CloudCredentialCheckItem[] {
    const map = new Map<string, CloudCredentialCheckItem>();
    for (const item of [...a, ...b]) {
        if (!item || !item.viewerName) continue;
        const vKey = normalizeParticipantKey(item.viewerName);
        const existing = map.get(vKey);
        if (!existing || item.createdAtIso > existing.createdAtIso) {
            map.set(vKey, item);
        }
    }
    return Array.from(map.values()).sort((x, y) => (y.createdAtIso || '').localeCompare(x.createdAtIso || ''));
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const targetName = (searchParams.get('targetName') || '').trim();
    if (!targetName) {
        return NextResponse.json({ ok: true, checks: [] });
    }
    const key = targetMapKey(targetName);
    const cloud = await pullCloudChecksForTarget(key);
    const merged = mergeChecks(memoryChecksByTargetKey[key] || [], cloud);
    memoryChecksByTargetKey[key] = merged;

    return NextResponse.json({
        ok: true,
        checks: merged.map((c) => ({
            ...c,
            viewedAt: formatRelativeAgo(c.createdAtIso),
        })),
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const targetName = String(body.targetName || '').trim();
        const viewerName = String(body.viewerName || '').trim();
        if (!targetName || !viewerName) {
            return NextResponse.json({ ok: false, error: 'targetName and viewerName required' }, { status: 400 });
        }
        if (normalizeParticipantKey(targetName) === normalizeParticipantKey(viewerName)) {
            return NextResponse.json({ ok: true, skipped: 'self_view' });
        }

        const rawAvatar = String(body.viewerAvatar || '');
        const safeAvatar =
            rawAvatar && !rawAvatar.startsWith('data:')
                ? rawAvatar
                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewerName)}&backgroundColor=0a66c2`;

        const headline = String(body.viewerHeadline || 'Verified ConnectLn Member').slice(0, 140);
        const company = String(body.viewerCompany || 'ConnectLn Verified Network').slice(0, 90);
        const location = String(body.viewerLocation || 'United States · Verified Enclave').slice(0, 80);
        const viewVector = String(body.viewVector || 'Ticket Scouting & Dossier Lookup').slice(0, 110);
        const lowerH = headline.toLowerCase();
        const category: CloudCredentialCheckItem['category'] =
            lowerH.includes('recruiter') || lowerH.includes('talent') || lowerH.includes('hr')
                ? 'recruiter'
                : lowerH.includes('procurement') || lowerH.includes('buyer') || lowerH.includes('vendor')
                ? 'buyer'
                : lowerH.includes('chief') || lowerH.includes('vp') || lowerH.includes('director') || lowerH.includes('founder')
                ? 'executive'
                : 'peer';

        const newItem: CloudCredentialCheckItem = {
            id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            viewerName,
            viewerHeadline: headline,
            viewerAvatar: safeAvatar,
            viewerCompany: company,
            viewerLocation: location,
            clearanceLevel: '✓ Live Member Credential Check',
            viewVector,
            category,
            createdAtIso: new Date().toISOString(),
        };

        const key = targetMapKey(targetName);
        const cloud = await pullCloudChecksForTarget(key);
        const merged = mergeChecks([newItem, ...(memoryChecksByTargetKey[key] || [])], cloud);
        memoryChecksByTargetKey[key] = merged;
        await pushCloudChecksForTarget(key, merged);

        return NextResponse.json({ ok: true, recorded: newItem });
    } catch {
        return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
    }
}
