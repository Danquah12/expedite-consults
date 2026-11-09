import { NextResponse } from 'next/server';
import { normalizeParticipantKey, recordGlobalUserActivity } from '@/lib/connectin-cloud-sync';

export interface CloudFollowMember {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    profession?: string;
    location?: string;
    followedAtIso: string;
}

export interface CloudFollowNotification {
    id: string;
    followerName: string;
    followerHeadline: string;
    followerAvatar: string;
    createdAtIso: string;
    unread: boolean;
}

export interface CloudBlockedUser {
    name: string;
    headline?: string;
    avatar?: string;
    blockedAtIso: string;
}

export interface CloudFollowPrivacySettings {
    whoCanFollow: 'everyone' | 'connections_only';
    whoCanSeeFollowLists: 'everyone' | 'connections' | 'only_me';
    notifyOnNewFollower: boolean;
}

export interface CloudUserFollowBundle {
    following: CloudFollowMember[];
    followers: CloudFollowMember[];
    notifications: CloudFollowNotification[];
    blockedUsers: CloudBlockedUser[];
    settings: CloudFollowPrivacySettings;
}

const SYNC_FOLLOW_MAP = 'connectin_follow_graph_v1';
const memoryFollowByKey: Record<string, CloudUserFollowBundle> = {};

function getTwilioAuthHeader(): string | null {
    const sid = process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_AUTH_TOKEN || '';
    if (!sid || !token) return null;
    return `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
}

function userMapKey(name: string): string {
    return `flw__${normalizeParticipantKey(name).replace(/[^a-z0-9]/g, '_').slice(0, 48)}`;
}

function defaultSettings(): CloudFollowPrivacySettings {
    return {
        whoCanFollow: 'everyone',
        whoCanSeeFollowLists: 'everyone',
        notifyOnNewFollower: true,
    };
}

function emptyFollowBundle(): CloudUserFollowBundle {
    return {
        following: [],
        followers: [],
        notifications: [],
        blockedUsers: [],
        settings: defaultSettings(),
    };
}

function dedupFollowList(list: CloudFollowMember[]): CloudFollowMember[] {
    const map = new Map<string, CloudFollowMember>();
    for (const item of list || []) {
        if (!item || !item.name) continue;
        const k = normalizeParticipantKey(item.name);
        if (!k) continue;
        if (!map.has(k)) {
            map.set(k, item);
        }
    }
    return Array.from(map.values()).sort((a, b) => (b.followedAtIso || '').localeCompare(a.followedAtIso || ''));
}

async function pullCloudFollowForUser(key: string): Promise<CloudUserFollowBundle> {
    const auth = getTwilioAuthHeader();
    if (!auth) return memoryFollowByKey[key] || emptyFollowBundle();
    try {
        const res = await fetch(
            `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_FOLLOW_MAP}/Items/${encodeURIComponent(key)}`,
            {
                method: 'GET',
                headers: { Authorization: auth },
                cache: 'no-store',
            }
        );
        if (!res.ok) return memoryFollowByKey[key] || emptyFollowBundle();
        const json = await res.json();
        const d = json?.data || {};
        return {
            following: dedupFollowList(Array.isArray(d.following) ? d.following : []),
            followers: dedupFollowList(Array.isArray(d.followers) ? d.followers : []),
            notifications: Array.isArray(d.notifications) ? d.notifications : [],
            blockedUsers: Array.isArray(d.blockedUsers) ? d.blockedUsers : [],
            settings: {
                ...defaultSettings(),
                ...(d.settings || {}),
            },
        };
    } catch {
        return memoryFollowByKey[key] || emptyFollowBundle();
    }
}

async function pushCloudFollowForUser(key: string, bundle: CloudUserFollowBundle): Promise<void> {
    memoryFollowByKey[key] = bundle;
    const auth = getTwilioAuthHeader();
    if (!auth) return;
    try {
        const baseUrl = `https://sync.twilio.com/v1/Services/default/Maps/${SYNC_FOLLOW_MAP}`;
        const serialized = JSON.stringify({
            following: dedupFollowList(bundle.following).slice(0, 60),
            followers: dedupFollowList(bundle.followers).slice(0, 60),
            notifications: (bundle.notifications || []).slice(0, 30),
            blockedUsers: (bundle.blockedUsers || []).slice(0, 40),
            settings: bundle.settings || defaultSettings(),
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
                body: new URLSearchParams({ UniqueName: SYNC_FOLLOW_MAP }).toString(),
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
        // best-effort cloud sync
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userName = (searchParams.get('userName') || '').trim();
    if (!userName) {
        return NextResponse.json({
            ok: true,
            ...emptyFollowBundle(),
            followingCount: 0,
            followersCount: 0,
        });
    }
    const key = userMapKey(userName);
    const bundle = await pullCloudFollowForUser(key);
    memoryFollowByKey[key] = bundle;
    return NextResponse.json({
        ok: true,
        ...bundle,
        followingCount: bundle.following.length,
        followersCount: bundle.followers.length,
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const action = String(body.action || 'follow').trim();
        const actorName = String(body.actorName || '').trim();
        if (!actorName) {
            return NextResponse.json({ ok: false, error: 'actorName is required' }, { status: 400 });
        }

        const actorKey = userMapKey(actorName);
        const actorBundle = await pullCloudFollowForUser(actorKey);
        const nowIso = new Date().toISOString();

        // 1. Update privacy & notification settings
        if (action === 'update_settings') {
            actorBundle.settings = {
                ...actorBundle.settings,
                ...(body.settings || {}),
            };
            await pushCloudFollowForUser(actorKey, actorBundle);
            return NextResponse.json({ ok: true, bundle: actorBundle });
        }

        // 2. Mark follow notifications read
        if (action === 'mark_notifications_read') {
            actorBundle.notifications = actorBundle.notifications.map((n) => ({ ...n, unread: false }));
            await pushCloudFollowForUser(actorKey, actorBundle);
            return NextResponse.json({ ok: true, bundle: actorBundle });
        }

        const targetName = String(body.targetName || '').trim();
        if (!targetName) {
            return NextResponse.json({ ok: false, error: 'targetName is required' }, { status: 400 });
        }

        const normActor = normalizeParticipantKey(actorName);
        const normTarget = normalizeParticipantKey(targetName);

        // Prevent self-following or self-blocking
        if (normActor === normTarget) {
            return NextResponse.json({ ok: false, error: 'Cannot follow or block yourself' }, { status: 400 });
        }

        const targetKey = userMapKey(targetName);
        const targetBundle = await pullCloudFollowForUser(targetKey);

        // 3. Block a user: removes follow relationships in both directions and prevents future follows
        if (action === 'block') {
            actorBundle.following = actorBundle.following.filter(
                (f) => normalizeParticipantKey(f.name) !== normTarget
            );
            actorBundle.followers = actorBundle.followers.filter(
                (f) => normalizeParticipantKey(f.name) !== normTarget
            );
            if (!actorBundle.blockedUsers.some((b) => normalizeParticipantKey(b.name) === normTarget)) {
                actorBundle.blockedUsers.unshift({
                    name: targetName,
                    headline: body.targetHeadline || 'ConnectLn Member',
                    avatar: body.targetAvatar || '',
                    blockedAtIso: nowIso,
                });
            }

            targetBundle.following = targetBundle.following.filter(
                (f) => normalizeParticipantKey(f.name) !== normActor
            );
            targetBundle.followers = targetBundle.followers.filter(
                (f) => normalizeParticipantKey(f.name) !== normActor
            );

            await pushCloudFollowForUser(actorKey, actorBundle);
            await pushCloudFollowForUser(targetKey, targetBundle);
            return NextResponse.json({ ok: true, actorBundle, targetBundle });
        }

        // 4. Unblock a user
        if (action === 'unblock') {
            actorBundle.blockedUsers = actorBundle.blockedUsers.filter(
                (b) => normalizeParticipantKey(b.name) !== normTarget
            );
            await pushCloudFollowForUser(actorKey, actorBundle);
            return NextResponse.json({ ok: true, actorBundle });
        }

        // 5. Unfollow a user: removes target from actor's Following and removes actor from target's Followers
        if (action === 'unfollow') {
            actorBundle.following = actorBundle.following.filter(
                (f) => normalizeParticipantKey(f.name) !== normTarget
            );
            targetBundle.followers = targetBundle.followers.filter(
                (f) => normalizeParticipantKey(f.name) !== normActor
            );
            await pushCloudFollowForUser(actorKey, actorBundle);
            await pushCloudFollowForUser(targetKey, targetBundle);
            return NextResponse.json({
                ok: true,
                status: 'unfollowed',
                actorBundle,
                targetBundle,
            });
        }

        // 6. Follow a user (default action === 'follow')
        // Check blocking rules
        const isBlockedByTarget = targetBundle.blockedUsers.some(
            (b) => normalizeParticipantKey(b.name) === normActor
        );
        const hasBlockedTarget = actorBundle.blockedUsers.some(
            (b) => normalizeParticipantKey(b.name) === normTarget
        );
        if (isBlockedByTarget || hasBlockedTarget) {
            return NextResponse.json(
                { ok: false, error: 'Follow action is unavailable due to account blocking settings.' },
                { status: 403 }
            );
        }

        // Check if target only allows 1st-degree connections to follow them
        if (targetBundle.settings?.whoCanFollow === 'connections_only' && !body.isConnectedWithTarget) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `${targetName} only allows 1st-degree connections to follow them. Send a connection request first.`,
                },
                { status: 403 }
            );
        }

        const safeActorAvatar =
            body.actorAvatar && !String(body.actorAvatar).startsWith('data:')
                ? String(body.actorAvatar)
                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actorName)}&backgroundColor=0a66c2`;
        const safeTargetAvatar =
            body.targetAvatar && !String(body.targetAvatar).startsWith('data:')
                ? String(body.targetAvatar)
                : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}&backgroundColor=0a66c2`;

        // Add target to actor's Following (deduplicated)
        const targetRecord: CloudFollowMember = {
            id: String(body.targetId || `flw_${normTarget}`),
            name: targetName,
            headline: String(body.targetHeadline || 'Verified Professional · ConnectLn Member').slice(0, 140),
            avatar: safeTargetAvatar,
            profession: body.targetProfession ? String(body.targetProfession).slice(0, 80) : undefined,
            location: body.targetLocation ? String(body.targetLocation).slice(0, 80) : undefined,
            followedAtIso: nowIso,
        };
        actorBundle.following = dedupFollowList([targetRecord, ...actorBundle.following]);

        // Add actor to target's Followers (deduplicated)
        const wasAlreadyFollower = targetBundle.followers.some(
            (f) => normalizeParticipantKey(f.name) === normActor
        );
        const actorRecord: CloudFollowMember = {
            id: String(body.actorId || `flw_${normActor}`),
            name: actorName,
            headline: String(body.actorHeadline || 'Verified Professional · ConnectLn Member').slice(0, 140),
            avatar: safeActorAvatar,
            profession: body.actorProfession ? String(body.actorProfession).slice(0, 80) : undefined,
            location: body.actorLocation ? String(body.actorLocation).slice(0, 80) : undefined,
            followedAtIso: nowIso,
        };
        targetBundle.followers = dedupFollowList([actorRecord, ...targetBundle.followers]);

        // Create notification for target if not already following and target has notifications enabled
        if (!wasAlreadyFollower && targetBundle.settings?.notifyOnNewFollower !== false) {
            const newNotif: CloudFollowNotification = {
                id: `fnotif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                followerName: actorName,
                followerHeadline: actorRecord.headline,
                followerAvatar: safeActorAvatar,
                createdAtIso: nowIso,
                unread: true,
            };
            targetBundle.notifications = [
                newNotif,
                ...targetBundle.notifications.filter(
                    (n) => normalizeParticipantKey(n.followerName) !== normActor
                ),
            ].slice(0, 30);
        }

        await pushCloudFollowForUser(actorKey, actorBundle);
        await pushCloudFollowForUser(targetKey, targetBundle);

        recordGlobalUserActivity({
            id: `act_flw_${Date.now()}`,
            userName: actorName,
            userAvatar: safeActorAvatar,
            actionType: 'USER_FOLLOWED',
            actionLabel: `Started Following ${targetName}`,
            category: 'network',
            targetTitle: targetName,
            details: `${actorName} followed ${targetName} (One-way Follow)`,
            timestampIso: nowIso,
        }).catch(() => {});

        return NextResponse.json({
            ok: true,
            status: 'followed',
            actorBundle,
            targetBundle,
        });
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid follow request' }, { status: 400 });
    }
}
