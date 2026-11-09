import { NextResponse } from 'next/server';
import { normalizeParticipantKey, recordGlobalUserActivity } from '@/lib/connectin-cloud-sync';

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
    viewCount?: number;
    visitCount?: number;
    privacyMode?: 'full' | 'role_only' | 'anonymous';
}

export interface CloudContentReachItem {
    id: string;
    title: string;
    category: string;
    actorName: string;
    actorRole?: string;
    actorCompany?: string;
    eventKind?: 'view' | 'interaction';
    details?: string;
    createdAtIso: string;
}

export interface CloudDirectoryDiscoveryItem {
    id: string;
    keyword: string;
    searcherName: string;
    searcherHeadline: string;
    searcherCompany: string;
    source: string;
    discoveryType?: 'search_appearance' | 'profile_click';
    createdAtIso: string;
}

interface TargetTelemetryBundle {
    checks: CloudCredentialCheckItem[];
    reachEvents: CloudContentReachItem[];
    discoveryEvents: CloudDirectoryDiscoveryItem[];
}

const SYNC_CHECKS_MAP = 'connectin_profile_checks_v2';
const memoryTelemetryByTargetKey: Record<string, TargetTelemetryBundle> = {};

function getTwilioAuthHeader(): string | null {
    const sid = process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_AUTH_TOKEN || '';
    if (!sid || !token) return null;
    return `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
}

function targetMapKey(name: string): string {
    return `tel__${normalizeParticipantKey(name).replace(/[^a-z0-9]/g, '_').slice(0, 48)}`;
}

function formatRelativeAgo(iso: string, prefix = ''): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 60_000) return prefix ? `${prefix} just now` : 'Just now';
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 60) return prefix ? `${prefix} ${mins}m ago` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return prefix ? `${prefix} ${hrs}h ago` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return prefix ? `${prefix} ${days}d ago` : `${days}d ago`;
}

function formatViewedDateTime(iso: string): string {
    const dt = new Date(iso);
    if (!Number.isNaN(dt.getTime())) {
        const datePart = dt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const timePart = dt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        const relPart = formatRelativeAgo(iso);
        return `Viewed ${datePart} · ${timePart} (${relPart})`;
    }
    return formatRelativeAgo(iso, 'Viewed');
}

function emptyBundle(): TargetTelemetryBundle {
    return { checks: [], reachEvents: [], discoveryEvents: [] };
}

async function pullCloudTelemetryForTarget(key: string): Promise<TargetTelemetryBundle> {
    const auth = getTwilioAuthHeader();
    if (!auth) return emptyBundle();
    try {
        const res = await fetch(
            `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_CHECKS_MAP}/Items/${encodeURIComponent(key)}`,
            {
                method: 'GET',
                headers: { Authorization: auth },
                cache: 'no-store',
            }
        );
        if (!res.ok) return emptyBundle();
        const json = await res.json();
        const d = json?.data || {};
        return {
            checks: Array.isArray(d.checks) ? d.checks : Array.isArray(d.items) ? d.items : [],
            reachEvents: Array.isArray(d.reachEvents) ? d.reachEvents : [],
            discoveryEvents: Array.isArray(d.discoveryEvents) ? d.discoveryEvents : [],
        };
    } catch {
        return emptyBundle();
    }
}

async function pushCloudTelemetryForTarget(key: string, bundle: TargetTelemetryBundle): Promise<void> {
    const auth = getTwilioAuthHeader();
    if (!auth) return;
    try {
        const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_CHECKS_MAP}`;
        const serialized = JSON.stringify({
            checks: bundle.checks.slice(0, 40),
            reachEvents: bundle.reachEvents.slice(0, 50),
            discoveryEvents: bundle.discoveryEvents.slice(0, 40),
        });
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
            map.set(vKey, {
                ...item,
                viewCount: Math.max(item.viewCount || 1, existing?.viewCount || 1),
                visitCount: Math.max(item.visitCount || 1, existing?.visitCount || 1),
            });
        }
    }
    return Array.from(map.values()).sort((x, y) => (y.createdAtIso || '').localeCompare(x.createdAtIso || ''));
}

function mergeById<T extends { id: string; createdAtIso: string }>(a: T[], b: T[]): T[] {
    const map = new Map<string, T>();
    for (const item of [...a, ...b]) {
        if (!item || !item.id) continue;
        if (!map.has(item.id)) {
            map.set(item.id, item);
        }
    }
    return Array.from(map.values()).sort((x, y) => (y.createdAtIso || '').localeCompare(x.createdAtIso || ''));
}

function mergeBundles(a: TargetTelemetryBundle, b: TargetTelemetryBundle): TargetTelemetryBundle {
    return {
        checks: mergeChecks(a.checks || [], b.checks || []),
        reachEvents: mergeById(a.reachEvents || [], b.reachEvents || []),
        discoveryEvents: mergeById(a.discoveryEvents || [], b.discoveryEvents || []),
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const targetName = (searchParams.get('targetName') || '').trim();
    if (!targetName) {
        return NextResponse.json({
            ok: true,
            checks: [],
            reachEvents: [],
            discoveryEvents: [],
            profileViewsCount: 0,
            contentReachCount: 0,
            directoryDiscoveriesCount: 0,
        });
    }
    const key = targetMapKey(targetName);
    const cloud = await pullCloudTelemetryForTarget(key);
    const merged = mergeBundles(memoryTelemetryByTargetKey[key] || emptyBundle(), cloud);
    memoryTelemetryByTargetKey[key] = merged;

    return NextResponse.json({
        ok: true,
        checks: merged.checks.map((c) => ({
            ...c,
            viewedAt: formatViewedDateTime(c.createdAtIso),
        })),
        reachEvents: merged.reachEvents.map((r) => ({
            ...r,
            timeAgo: formatRelativeAgo(r.createdAtIso),
        })),
        discoveryEvents: merged.discoveryEvents.map((d) => ({
            ...d,
            timeAgo: formatRelativeAgo(d.createdAtIso),
        })),
        profileViewsCount: merged.checks.length,
        contentReachCount: merged.reachEvents.length,
        directoryDiscoveriesCount: merged.discoveryEvents.length,
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = String(body.eventType || 'profile_view').trim();
        const targetName = String(body.targetName || body.userName || '').trim();
        if (!targetName) {
            return NextResponse.json({ ok: false, error: 'targetName required' }, { status: 400 });
        }

        const key = targetMapKey(targetName);
        const cloud = await pullCloudTelemetryForTarget(key);
        const current = mergeBundles(memoryTelemetryByTargetKey[key] || emptyBundle(), cloud);
        const nowIso = new Date().toISOString();

        if (eventType === 'content_reach') {
            const title = String(body.title || 'Engaged with ConnectLn Content').slice(0, 140);
            const category = String(body.category || 'Content').slice(0, 60);
            const actorName = String(body.actorName || targetName).slice(0, 90);
            const actorRole = body.actorRole ? String(body.actorRole).slice(0, 100) : undefined;
            const actorCompany = body.actorCompany ? String(body.actorCompany).slice(0, 90) : undefined;
            const eventKind: 'view' | 'interaction' = body.eventKind === 'interaction' ? 'interaction' : 'view';
            const details = body.details ? String(body.details).slice(0, 180) : undefined;
            const newReach: CloudContentReachItem = {
                id: String(body.id || `rch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
                title,
                category,
                actorName,
                actorRole,
                actorCompany,
                eventKind,
                details,
                createdAtIso: nowIso,
            };
            const updated: TargetTelemetryBundle = {
                ...current,
                reachEvents: mergeById([newReach], current.reachEvents),
            };
            memoryTelemetryByTargetKey[key] = updated;
            await pushCloudTelemetryForTarget(key, updated);
            return NextResponse.json({
                ok: true,
                recordedReach: newReach,
                contentReachCount: updated.reachEvents.length,
            });
        }

        if (eventType === 'directory_discovery') {
            const keyword = String(body.keyword || 'ConnectLn Directory Search').slice(0, 100);
            const searcherName = String(body.searcherName || 'ConnectLn Member').slice(0, 90);
            const searcherHeadline = String(body.searcherHeadline || 'Verified ConnectLn Professional').slice(0, 140);
            const searcherCompany = String(body.searcherCompany || 'ConnectLn Network').slice(0, 90);
            const source = String(body.source || 'Directory & Specialty Search').slice(0, 90);
            const discoveryType: 'search_appearance' | 'profile_click' =
                body.discoveryType === 'search_appearance' ? 'search_appearance' : 'profile_click';
            const newDisc: CloudDirectoryDiscoveryItem = {
                id: String(body.id || `dsc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
                keyword,
                searcherName,
                searcherHeadline,
                searcherCompany,
                source,
                discoveryType,
                createdAtIso: nowIso,
            };
            const updated: TargetTelemetryBundle = {
                ...current,
                discoveryEvents: mergeById([newDisc], current.discoveryEvents),
            };
            memoryTelemetryByTargetKey[key] = updated;
            await pushCloudTelemetryForTarget(key, updated);
            return NextResponse.json({
                ok: true,
                recordedDiscovery: newDisc,
                directoryDiscoveriesCount: updated.discoveryEvents.length,
            });
        }

        // Default: profile_view (Someone viewed targetName's profile)
        const viewerName = String(body.viewerName || '').trim();
        if (!viewerName) {
            return NextResponse.json({ ok: false, error: 'viewerName required' }, { status: 400 });
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
        const viewVector = String(body.viewVector || 'Profile & Dossier Inspection').slice(0, 110);
        const lowerH = headline.toLowerCase();
        const category: CloudCredentialCheckItem['category'] =
            lowerH.includes('recruiter') || lowerH.includes('talent') || lowerH.includes('hr')
                ? 'recruiter'
                : lowerH.includes('procurement') || lowerH.includes('buyer') || lowerH.includes('vendor')
                ? 'buyer'
                : lowerH.includes('chief') || lowerH.includes('vp') || lowerH.includes('director') || lowerH.includes('founder')
                ? 'executive'
                : 'peer';

        const prevViewerEntry = current.checks.find(
            (c) => normalizeParticipantKey(c.viewerName) === normalizeParticipantKey(viewerName)
        );
        const privacyMode: 'full' | 'role_only' | 'anonymous' =
            body.privacyMode === 'anonymous' || body.privacyMode === 'role_only' ? body.privacyMode : 'full';
        const computedVisitCount = Number(body.visitCount) || (prevViewerEntry?.visitCount || prevViewerEntry?.viewCount || 0) + 1;

        const newItem: CloudCredentialCheckItem = {
            id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            viewerName,
            viewerHeadline: headline,
            viewerAvatar: safeAvatar,
            viewerCompany: company,
            viewerLocation: location,
            clearanceLevel:
                privacyMode === 'anonymous'
                    ? '🔒 Private Viewer Mode'
                    : privacyMode === 'role_only'
                    ? '🛡️ Semi-Private (Role & Industry)'
                    : '✓ Live Profile Viewer',
            viewVector,
            category,
            createdAtIso: nowIso,
            viewCount: computedVisitCount,
            visitCount: computedVisitCount,
            privacyMode,
        };

        const newDiscFromView: CloudDirectoryDiscoveryItem = {
            id: `dsc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            keyword: viewVector,
            searcherName: privacyMode === 'anonymous' ? 'Anonymous ConnectLn Member' : viewerName,
            searcherHeadline: headline,
            searcherCompany: company,
            source: 'Directory Profile Click',
            discoveryType: 'profile_click',
            createdAtIso: nowIso,
        };

        const updated: TargetTelemetryBundle = {
            checks: mergeChecks([newItem], current.checks),
            reachEvents: current.reachEvents,
            discoveryEvents: mergeById([newDiscFromView], current.discoveryEvents),
        };
        memoryTelemetryByTargetKey[key] = updated;
        await pushCloudTelemetryForTarget(key, updated);

        recordGlobalUserActivity({
            id: `act_${newItem.id}`,
            userName: viewerName,
            userAvatar: safeAvatar,
            actionType: 'PROFILE_VIEWED',
            actionLabel: `Viewed Member Profile (${targetName})`,
            category: 'profile',
            targetTitle: `${targetName}'s Profile`,
            details: `${viewerName} (${headline}) viewed ${targetName}'s profile via ${viewVector}`,
            timestampIso: nowIso,
        }).catch(() => {});

        return NextResponse.json({
            ok: true,
            recorded: newItem,
            profileViewsCount: updated.checks.length,
            directoryDiscoveriesCount: updated.discoveryEvents.length,
        });
    } catch {
        return NextResponse.json({ ok: false, error: 'invalid request' }, { status: 400 });
    }
}
