import { NextResponse } from 'next/server';
import {
    getEnclaveB2BThreads,
    getThreadQuickReplies,
    B2BConversationThread,
    B2BMessageItem,
} from '@/lib/b2b-messaging-data';
import {
    CloudDirectConversation,
    CloudDirectMessage,
    makeDmPairKey,
    normalizeParticipantKey,
    pullCloudDirectConversations,
    upsertCloudDirectConversation,
    pullCloudUsersIntoDb,
    recordGlobalUserActivity,
} from '@/lib/connectin-cloud-sync';
import { connectinDb } from '@/lib/connectin-db';
import { notifyDmRecipient } from '@/lib/connectin-dm-notify';
import {
    SEED_PATIENCE_CREATED_AT_ISO,
    resolveMessageIsoDate,
    formatMessageSentDateTime,
    resolveValidMessagingAvatarUrl,
} from '@/lib/direct-mailbox-sync';

// Server-side in-memory store for dynamic replies and custom conversations
const customThreadsByEnclave: Record<string, B2BConversationThread[]> = {};
const appendedMessagesByThreadId: Record<string, B2BMessageItem[]> = {};
const readThreadIds = new Set<string>();

// Bilateral user-to-user direct message store (synced with Twilio Cloud Sync Map `connectin_dm_conversations_v1`)
const bilateralConversationsByPairKey: Record<string, CloudDirectConversation> = {};

const SIMPLE_EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmailsFromInput(raw?: string): string[] {
    if (!raw) return [];
    const matches = String(raw).match(SIMPLE_EMAIL_RE) || [];
    return Array.from(new Set(matches.map((m) => m.trim().toLowerCase())));
}

function formatEmailProviderLabel(email?: string): string {
    const domain = (email || '').split('@')[1]?.toLowerCase() || '';
    if (!domain) return 'External Email';
    if (domain.includes('gmail.com') || domain.includes('googlemail.com')) return 'Gmail';
    if (domain.includes('yahoo.')) return 'Yahoo Mail';
    if (domain.includes('outlook.') || domain.includes('hotmail.') || domain.includes('live.') || domain.includes('msn.')) return 'Outlook';
    if (domain.includes('icloud.') || domain.includes('me.com') || domain.includes('mac.com')) return 'iCloud Mail';
    if (domain.includes('aol.')) return 'AOL Mail';
    if (domain.includes('proton')) return 'Proton Mail';
    return domain;
}

function deriveDisplayNameFromEmail(email: string): string {
    const local = (email.split('@')[0] || 'Contact').replace(/[._+-]+/g, ' ').trim();
    return (
        local
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') || email
    );
}

function doesParticipantMatch(candidateName: string, viewerName: string, candidateEmail?: string, viewerEmail?: string): boolean {
    const cName = normalizeParticipantKey(candidateName);
    const vName = normalizeParticipantKey(viewerName);
    if (cName && vName && cName === vName) return true;

    // Same name ignoring spaces/punctuation, e.g. "Busy Vito" vs "Busyvito"
    const cCompact = cName.replace(/[^a-z0-9]/g, '');
    const vCompact = vName.replace(/[^a-z0-9]/g, '');
    if (cCompact.length >= 4 && cCompact === vCompact) return true;

    if (candidateEmail && viewerEmail) {
        const cEmail = normalizeParticipantKey(candidateEmail);
        const vEmail = normalizeParticipantKey(viewerEmail);
        if (cEmail && vEmail && cEmail === vEmail) {
            // A shared email counts when names are related OR when the thread recipient name was
            // originally derived as an external email handle placeholder before the user claimed a profile.
            const emailLocalCompact = (cEmail.split('@')[0] || '').replace(/[^a-z0-9]/g, '');
            const cTok = cName.split(' ').filter((t) => t.length >= 3);
            const vTok = vName.split(' ').filter((t) => t.length >= 3);
            if (
                !cName ||
                !vName ||
                cCompact === vCompact ||
                (emailLocalCompact.length >= 2 && cCompact === emailLocalCompact) ||
                cTok.some((t) => vTok.includes(t))
            ) {
                return true;
            }
        }
    }

    // Match if first + last token match
    const cTokens = cName.split(' ').filter(Boolean);
    const vTokens = vName.split(' ').filter(Boolean);
    if (cTokens.length >= 2 && vTokens.length >= 2) {
        if (cTokens[0] === vTokens[0] && cTokens[cTokens.length - 1] === vTokens[vTokens.length - 1]) {
            return true;
        }
    }
    return false;
}

function mergeCloudConversationsIntoMemory(cloudConvos: CloudDirectConversation[]) {
    for (const cloud of cloudConvos) {
        if (!cloud || !cloud.pairKey) continue;
        const local = bilateralConversationsByPairKey[cloud.pairKey];
        if (!local) {
            bilateralConversationsByPairKey[cloud.pairKey] = cloud;
            continue;
        }
        // Merge messages by ID preserving chronological order and fixing seed message timestamp
        const msgMap = new Map<string, CloudDirectMessage>();
        for (const m of local.messages || []) {
            msgMap.set(m.id, m);
        }
        for (const rawM of cloud.messages || []) {
            const m =
                rawM.id === 'dm_seed_kwesi_patience_1'
                    ? {
                          ...rawM,
                          createdAtIso: SEED_PATIENCE_CREATED_AT_ISO,
                          timestamp: 'Oct 26, 2026 · 10:30 AM',
                      }
                    : {
                          ...rawM,
                          createdAtIso: resolveMessageIsoDate(rawM) || rawM.createdAtIso,
                      };
            const existing = msgMap.get(m.id);
            if (existing) {
                const mergedReadBy = Array.from(new Set([...(existing.readBy || []), ...(m.readBy || [])]));
                const mergedReactions: Record<string, string[]> = { ...(existing.reactions || {}) };
                if (m.reactions) {
                    for (const [rKey, rUsers] of Object.entries(m.reactions)) {
                        if (Array.isArray(rUsers)) {
                            mergedReactions[rKey] = Array.from(
                                new Set([...(mergedReactions[rKey] || []), ...rUsers])
                            );
                        }
                    }
                }
                const mergedComments = [...(existing.comments || [])];
                for (const c of m.comments || []) {
                    if (!mergedComments.some((ec) => ec.id === c.id || (ec.author === c.author && ec.text === c.text))) {
                        mergedComments.push(c);
                    }
                }
                msgMap.set(m.id, {
                    ...existing,
                    ...m,
                    readBy: mergedReadBy,
                    reactions:
                        Object.keys(mergedReactions).length > 0 ? mergedReactions : existing.reactions || m.reactions,
                    comments: mergedComments.length > 0 ? mergedComments : existing.comments || m.comments,
                });
            } else {
                msgMap.set(m.id, m);
            }
        }
        const mergedMessages = Array.from(msgMap.values()).sort((a, b) =>
            (a.createdAtIso || '').localeCompare(b.createdAtIso || '')
        );
        const latestMsgIso =
            mergedMessages[mergedMessages.length - 1]?.createdAtIso ||
            SEED_PATIENCE_CREATED_AT_ISO;
        bilateralConversationsByPairKey[cloud.pairKey] = {
            ...local,
            ...cloud,
            participantA: {
                ...local.participantA,
                ...cloud.participantA,
                avatar: resolveValidMessagingAvatarUrl(
                    cloud.participantA?.avatar || local.participantA?.avatar,
                    cloud.participantA?.name || local.participantA?.name
                ),
            },
            participantB: {
                ...local.participantB,
                ...cloud.participantB,
                avatar: resolveValidMessagingAvatarUrl(
                    cloud.participantB?.avatar || local.participantB?.avatar,
                    cloud.participantB?.name || local.participantB?.name
                ),
            },
            messages: mergedMessages,
            updatedAtIso: latestMsgIso,
        };
    }
}

function buildViewerBilateralThreads(
    viewerName: string,
    viewerEmail: string,
    enclave: string
): B2BConversationThread[] {
    if (!viewerName && !viewerEmail) return [];
    const viewerKey = normalizeParticipantKey(viewerName || viewerEmail);
    const results: B2BConversationThread[] = [];

    const allConvos = Object.values(bilateralConversationsByPairKey).sort((a, b) =>
        (b.updatedAtIso || '').localeCompare(a.updatedAtIso || '')
    );

    for (const convo of allConvos) {
        const isA = doesParticipantMatch(
            convo.participantA.name,
            viewerName,
            convo.participantA.email,
            viewerEmail
        );
        const isB = doesParticipantMatch(
            convo.participantB.name,
            viewerName,
            convo.participantB.email,
            viewerEmail
        );

        if (!isA && !isB) continue;

        // The counterparty shown in the viewer's inbox is the OTHER participant!
        const partner = isA ? convo.participantB : convo.participantA;

        const mappedMessages: B2BMessageItem[] = [...(convo.messages || [])]
            .map((m) => {
                const resolvedIso = resolveMessageIsoDate(m) || m.createdAtIso;
                return { ...m, createdAtIso: resolvedIso };
            })
            .sort((a, b) => (a.createdAtIso || '').localeCompare(b.createdAtIso || ''))
            .map((m) => {
            const sentByViewer = doesParticipantMatch(
                m.senderName,
                viewerName,
                m.senderEmail,
                viewerEmail
            );
            const formattedTimestamp = formatMessageSentDateTime(m, m.timestamp);
            return {
                id: m.id,
                sender: {
                    id: sentByViewer ? 'me' : `partner_${normalizeParticipantKey(m.senderName).replace(/\s+/g, '_')}`,
                    name: m.senderName,
                    avatar: resolveValidMessagingAvatarUrl(m.senderAvatar, m.senderName),
                    role: m.senderRole || 'Verified ConnectLn Member',
                    isVerified: true,
                },
                text: m.text,
                timestamp: formattedTimestamp,
                createdAtIso: m.createdAtIso,
                reactions: m.reactions,
                comments: m.comments,
                attachments: m.attachment
                    ? [{ name: m.attachment, type: 'Document' }]
                    : undefined,
            };
        });

        const unreadForViewer = (convo.messages || []).filter((m) => {
            const sentByViewer = doesParticipantMatch(
                m.senderName,
                viewerName,
                m.senderEmail,
                viewerEmail
            );
            if (sentByViewer) return false;
            const readList = (m.readBy || []).map((r) => normalizeParticipantKey(r));
            return !readList.includes(viewerKey) && !readList.includes(normalizeParticipantKey(viewerName));
        }).length;

        const lastMsg = mappedMessages[mappedMessages.length - 1];
        const partnerEmailClean = (partner.email || '').trim().toLowerCase();
        const partnerIsExternal =
            Boolean(partnerEmailClean) &&
            !partnerEmailClean.endsWith('@connectin.app') &&
            !isRealRegisteredMember(partner.name);

        results.push({
            id: convo.pairKey,
            professionEnclave: enclave === 'all' ? 'trades_construction' : enclave,
            channelType: 'People',
            subType: 'DM',
            title: partner.name,
            subtitle:
                partner.headline ||
                (partnerIsExternal
                    ? `External Email · ${formatEmailProviderLabel(partnerEmailClean)} (${partnerEmailClean})`
                    : 'Verified ConnectLn Professional · Direct Member Channel'),
            avatar: resolveValidMessagingAvatarUrl(partner.avatar, partner.name),
            isVerified: !partnerIsExternal,
            verifiedBadge: partnerIsExternal
                ? `📧 ${formatEmailProviderLabel(partnerEmailClean)} · ${partnerEmailClean}`
                : '✓ Direct Member Message',
            recipientEmail: partnerEmailClean || undefined,
            isExternalEmail: partnerIsExternal,
            onlineStatus: 'online',
            unreadCount: readThreadIds.has(`${convo.pairKey}__${viewerKey}`) ? 0 : unreadForViewer,
            lastMessage: lastMsg ? lastMsg.text.replace(/\n/g, ' · ') : 'New conversation',
            lastMessageTime: lastMsg ? lastMsg.timestamp : 'Just now',
            messages: mappedMessages,
        });
    }

    // The same person can exist under slightly different names ("Busy Vito" / "Busyvito"),
    // which creates several conversations. Show them as ONE thread with every message.
    const compact = (s: string) => normalizeParticipantKey(s).replace(/[^a-z0-9]/g, '');
    const byPartner = new Map<string, B2BConversationThread>();
    for (const t of results) {
        const key = compact(t.title) || t.id;
        const prev = byPartner.get(key);
        if (!prev) {
            byPartner.set(key, t);
            continue;
        }
        const seen = new Set<string>();
        const msgs = [...prev.messages, ...t.messages]
            .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
            .sort((a, b) => (a.createdAtIso || '').localeCompare(b.createdAtIso || ''));
        const last = msgs[msgs.length - 1];
        byPartner.set(key, {
            ...prev,
            messages: msgs,
            unreadCount: (prev.unreadCount || 0) + (t.unreadCount || 0),
            lastMessage: last ? last.text.replace(/\n/g, ' · ') : prev.lastMessage,
            lastMessageTime: last ? last.timestamp : prev.lastMessageTime,
        });
    }

    return Array.from(byPartner.values());
}

function getThreadsForEnclaveMerged(
    enclave: string,
    viewerName = '',
    viewerEmail = ''
): B2BConversationThread[] {
    const bilateralThreads = buildViewerBilateralThreads(viewerName, viewerEmail, enclave);
    const bilateralPartnerNames = new Set(
        bilateralThreads.map((t) => normalizeParticipantKey(t.title))
    );

    const baseThreads = getEnclaveB2BThreads(enclave);
    const custom =
        enclave === 'all'
            ? Object.values(customThreadsByEnclave).flat()
            : customThreadsByEnclave[enclave] || [];

    const standardMerged = [...custom, ...baseThreads]
        .filter((t) => !bilateralPartnerNames.has(normalizeParticipantKey(t.title)))
        .map((thread) => {
            const extraMsgs = appendedMessagesByThreadId[thread.id] || [];
            const fullHistory = [...thread.messages, ...extraMsgs];
            const latestMsg = fullHistory[fullHistory.length - 1];
            return {
                ...thread,
                avatar: resolveValidMessagingAvatarUrl(thread.avatar, thread.title),
                messages: fullHistory,
                lastMessage: latestMsg ? latestMsg.text : thread.lastMessage,
                lastMessageTime: latestMsg ? latestMsg.timestamp : thread.lastMessageTime,
                unreadCount: readThreadIds.has(thread.id) ? 0 : thread.unreadCount,
            };
        });

    return [...bilateralThreads, ...standardMerged];
}

function generateAutoReply(thread: B2BConversationThread, userText: string): string {
    const lower = userText.toLowerCase();

    if (thread.channelType === 'Products') {
        if (
            lower.includes('price') ||
            lower.includes('quote') ||
            lower.includes('cost') ||
            lower.includes('discount') ||
            lower.includes('kit') ||
            lower.includes('license')
        ) {
            return `Thanks for reaching out to ${thread.title}! I've generated your commercial partner quote with verified ConnectIn member pricing and attached the itemized breakdown to your workspace.`;
        }
        if (
            lower.includes('ship') ||
            lower.includes('deliver') ||
            lower.includes('tracking') ||
            lower.includes('site')
        ) {
            return `Confirmed — our regional logistics desk has scheduled priority dispatch directly to your site. Let us know the receiving gate contact!`;
        }
        return `Received by ${thread.title} (${thread.subtitle}). A dedicated commercial specialist has logged your request and prepared the specs for immediate review.`;
    }

    if (thread.channelType === 'Companies') {
        if (
            lower.includes('schedule') ||
            lower.includes('call') ||
            lower.includes('walkthrough') ||
            lower.includes('interview') ||
            lower.includes('available')
        ) {
            return `Fantastic! I've locked in a 15-minute intro slot on our hiring calendar and sent over the calendar invite along with the full compensation & benefits brief.`;
        }
        if (
            lower.includes('rate') ||
            lower.includes('salary') ||
            lower.includes('comp') ||
            lower.includes('pay') ||
            lower.includes('per-diem')
        ) {
            return `Great question — we offer top-quartile base pay plus full overtime/bonus structures and immediate benefits eligibility. Happy to share the formal offer sheet!`;
        }
        return `Thank you for following up with ${thread.title}! Our lead hiring partner reviewed your ConnectIn credentials and moved your profile to the priority shortlist.`;
    }

    if (thread.channelType === 'Communities') {
        return `[${thread.title}] Awesome contribution! 3 guild members just bookmarked your note in the community feed.`;
    }

    // Direct message (People)
    if (
        lower.includes('blueprint') ||
        lower.includes('spec') ||
        lower.includes('drawing') ||
        lower.includes('file') ||
        lower.includes('resume') ||
        lower.includes('attached')
    ) {
        return `Got the file loud and clear — reviewing the details right now and will follow up with you shortly!`;
    }
    return `Sounds great! Appreciate the message — let's stay synced on this and connect soon.`;
}

/** Finds the registered member for a name/email so conversations always use their real account name and email. */
function findRegisteredUser(
    name: string,
    email?: string
): { name: string; email: string; headline?: string; phone?: string } | null {
    if (!name && !email) return null;
    const allUsers = connectinDb.getAllUsersWithProfiles();
    const hit = allUsers.find((u) => doesParticipantMatch(u.name, name, u.email, email));
    return hit
        ? { name: hit.name, email: hit.email || '', headline: hit.headline, phone: hit.phone }
        : null;
}

function isRealRegisteredMember(recipientName: string): boolean {
    if (!recipientName) return false;
    const norm = normalizeParticipantKey(recipientName);
    if (norm.includes('patience addo') || norm.includes('kwesi asiedu')) return true;
    const allUsers = connectinDb.getAllUsersWithProfiles();
    return allUsers.some((u) => doesParticipantMatch(u.name, recipientName, u.email));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const enclave = searchParams.get('enclave') || 'trades_construction';
    const viewerName = searchParams.get('viewerName') || '';
    const viewerEmail = searchParams.get('viewerEmail') || '';

    // Pull latest cloud DMs into memory
    try {
        const cloudConvos = await pullCloudDirectConversations();
        if (cloudConvos.length > 0) {
            mergeCloudConversationsIntoMemory(cloudConvos);
        }
    } catch {
        // Proceed with in-memory store
    }

    let threads: B2BConversationThread[] = [];
    let degraded = false;
    try {
        threads = getThreadsForEnclaveMerged(enclave, viewerName, viewerEmail);
    } catch (err) {
        // Never 500 the inbox poll: log, then fall back to the static enclave threads (or an empty list).
        degraded = true;
        console.error('[messages GET] failed to build merged threads, using fallback:', err);
        try {
            threads = getEnclaveB2BThreads(enclave);
        } catch (fallbackErr) {
            console.error('[messages GET] fallback threads failed:', fallbackErr);
            threads = [];
        }
    }

    return NextResponse.json(
        {
            ok: true,
            degraded,
            enclave,
            viewerName,
            totalThreads: threads.length,
            unreadTotal: threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0),
            threads,
            syncedAt: new Date().toISOString(),
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            action = 'send_message',
            enclave = 'trades_construction',
            threadId,
            text,
            subject,
            senderName = 'You',
            senderEmail = '',
            senderAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            senderRole = 'Verified ConnectIn Professional',
            attachment,
            // Recipient metadata for bilateral user-to-user messaging
            recipientName,
            recipientEmail = '',
            recipientSubtitle,
            recipientAvatar,
            // Legacy create_thread fields
            title,
            subtitle,
            channelType = 'People',
            avatar,
            viewerName = '',
        } = body;

        // Pull latest cloud DMs first
        try {
            const cloudConvos = await pullCloudDirectConversations();
            if (cloudConvos.length > 0) {
                mergeCloudConversationsIntoMemory(cloudConvos);
            }
        } catch {}

        // Reactions (like / thumbs up / thumbs down) and comments on a direct message, visible to both people
        if (action === 'react_message' || action === 'comment_message') {
            const {
                messageId,
                messageText,
                messageSenderName,
                reaction,
                commentText,
                senderAvatar: actorAvatar,
            } = body as {
                messageId?: string;
                messageText?: string;
                messageSenderName?: string;
                reaction?: string;
                commentText?: string;
                senderAvatar?: string;
            };
            const actorName = (viewerName || senderName || '').trim();
            if (!messageId || !actorName) {
                return NextResponse.json({ ok: false, error: 'messageId and the signed-in member are required' }, { status: 400 });
            }
            let foundConvo: CloudDirectConversation | null = null;
            let foundMsg: CloudDirectMessage | null = null;

            // 1. Search by exact messageId across all bilateral conversations
            for (const c of Object.values(bilateralConversationsByPairKey)) {
                const m = (c.messages || []).find((x) => x.id === messageId);
                if (m) {
                    foundConvo = c;
                    foundMsg = m;
                    break;
                }
            }

            // 2. Fallback: if message had an optimistic/local ID (e.g. local_dm_... or local-...), match by threadId/recipientName + messageText
            if (!foundMsg && messageText) {
                const cleanTargetText = String(messageText).trim();
                const candidateConvo =
                    (threadId && bilateralConversationsByPairKey[threadId]) ||
                    (recipientName ? bilateralConversationsByPairKey[makeDmPairKey(actorName, recipientName)] : null);

                const searchPool = candidateConvo
                    ? [candidateConvo, ...Object.values(bilateralConversationsByPairKey)]
                    : Object.values(bilateralConversationsByPairKey);

                for (const c of searchPool) {
                    const isPart =
                        doesParticipantMatch(c.participantA.name, actorName, c.participantA.email, senderEmail) ||
                        doesParticipantMatch(c.participantB.name, actorName, c.participantB.email, senderEmail);
                    if (!isPart) continue;
                    // Search from newest to oldest for matching message text
                    const msgs = c.messages || [];
                    for (let i = msgs.length - 1; i >= 0; i--) {
                        const m = msgs[i];
                        if (m.text.trim() === cleanTargetText) {
                            if (!messageSenderName || doesParticipantMatch(m.senderName, messageSenderName)) {
                                foundConvo = c;
                                foundMsg = m;
                                break;
                            }
                        }
                    }
                    if (foundMsg) break;
                }
            }

            // 3. If the message only existed in the user's local bilateral store and not yet in cloud, create/sync the message into the bilateral conversation now so the other user sees the message AND the reaction!
            if (!foundMsg && messageText && recipientName) {
                const pairKey = makeDmPairKey(actorName, recipientName);
                const nowIso = new Date().toISOString();
                const resolvedSender = messageSenderName || actorName;
                const resolvedRecipient = doesParticipantMatch(resolvedSender, actorName)
                    ? recipientName
                    : actorName;
                const syncedMsg: CloudDirectMessage = {
                    id: messageId,
                    senderName: resolvedSender,
                    senderAvatar: actorAvatar || '/brand/kwesi-avatar.png',
                    senderRole: senderRole || 'Verified ConnectLn Professional',
                    recipientName: resolvedRecipient,
                    text: String(messageText),
                    timestamp: formatMessageSentDateTime(nowIso),
                    createdAtIso: nowIso,
                    readBy: [normalizeParticipantKey(actorName)],
                };
                if (!bilateralConversationsByPairKey[pairKey]) {
                    bilateralConversationsByPairKey[pairKey] = {
                        pairKey,
                        participantA: {
                            name: actorName,
                            email: senderEmail,
                            avatar: actorAvatar || '/brand/kwesi-avatar.png',
                            headline: senderRole,
                        },
                        participantB: {
                            name: recipientName,
                            email: recipientEmail,
                            avatar:
                                recipientAvatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipientName)}&backgroundColor=0a66c2`,
                            headline: recipientSubtitle || 'Verified ConnectLn Member',
                        },
                        messages: [syncedMsg],
                        updatedAtIso: nowIso,
                    };
                } else {
                    bilateralConversationsByPairKey[pairKey].messages.push(syncedMsg);
                }
                foundConvo = bilateralConversationsByPairKey[pairKey];
                foundMsg = syncedMsg;
            }

            if (!foundConvo || !foundMsg) {
                // Not a stored member-to-member message (e.g. a demo thread): nothing to save on the server
                return NextResponse.json({ ok: false, error: 'message_not_stored' });
            }
            const isParticipant =
                doesParticipantMatch(foundConvo.participantA.name, actorName, foundConvo.participantA.email, senderEmail) ||
                doesParticipantMatch(foundConvo.participantB.name, actorName, foundConvo.participantB.email, senderEmail);
            if (!isParticipant) {
                return NextResponse.json({ ok: false, error: 'not_a_participant' }, { status: 403 });
            }

            if (action === 'react_message') {
                const rKind = String(reaction);
                if (!['like', 'up', 'down', 'rsvp_yes', 'rsvp_no', 'rsvp_maybe'].includes(rKind)) {
                    return NextResponse.json({ ok: false, error: 'unknown reaction' }, { status: 400 });
                }
                const actorKey = normalizeParticipantKey(actorName);
                const reactions: Record<string, string[]> = { ...(foundMsg.reactions || {}) };
                const current = new Set(reactions[rKind] || []);
                if (current.has(actorKey)) {
                    current.delete(actorKey);
                } else {
                    current.add(actorKey);
                    // Thumbs up and thumbs down are mutually exclusive
                    const opposite = rKind === 'up' ? 'down' : rKind === 'down' ? 'up' : null;
                    if (opposite && reactions[opposite]) {
                        reactions[opposite] = reactions[opposite].filter((k) => k !== actorKey);
                    }
                    // Meeting RSVP choices (Yes / No / Maybe) are mutually exclusive
                    if (rKind.startsWith('rsvp_')) {
                        for (const other of ['rsvp_yes', 'rsvp_no', 'rsvp_maybe']) {
                            if (other !== rKind && reactions[other]) {
                                reactions[other] = reactions[other].filter((k) => k !== actorKey);
                            }
                        }
                    }
                }
                reactions[rKind] = Array.from(current);
                foundMsg.reactions = reactions;
            } else {
                const textClean = String(commentText || '').trim().slice(0, 200);
                if (!textClean) return NextResponse.json({ ok: false, error: 'empty comment' }, { status: 400 });
                const comments = [...(foundMsg.comments || [])];
                comments.push({
                    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    author: actorName,
                    avatar: actorAvatar && !actorAvatar.startsWith('data:') ? actorAvatar : '',
                    text: textClean,
                    createdAtIso: new Date().toISOString(),
                });
                foundMsg.comments = comments.slice(-10);
            }
            foundConvo.updatedAtIso = new Date().toISOString();
            await upsertCloudDirectConversation(foundConvo).catch(() => {});
            recordGlobalUserActivity({
                id: `act_msg_${action}_${messageId}_${Date.now().toString().slice(-5)}`,
                userName: actorName,
                userEmail: senderEmail || `${actorName.toLowerCase().replace(/\s+/g, '.')}@connectin.app`,
                userAvatar: actorAvatar || '',
                actionType: action === 'react_message' ? (String(reaction).startsWith('rsvp_') ? 'MEETING_RSVP' : 'POST_LIKED') : 'COMMENT_REPLIED',
                actionLabel:
                    action === 'react_message'
                        ? String(reaction).startsWith('rsvp_')
                            ? `RSVPed "${String(reaction).replace('rsvp_', '').toUpperCase()}" to Meeting`
                            : `Reacted (${String(reaction).toUpperCase()}) to Direct Message`
                        : 'Replied on Direct Message Thread',
                category: 'engagement',
                targetTitle: `Message Thread (${foundConvo.participantA.name} & ${foundConvo.participantB.name})`,
                details: action === 'react_message' ? `Reaction: ${reaction}` : `Reply: "${String(commentText || '').slice(0, 120)}"`,
                timestampIso: foundConvo.updatedAtIso,
            }).catch(() => {});
            return NextResponse.json({
                ok: true,
                messageId,
                reactions: foundMsg.reactions || {},
                comments: foundMsg.comments || [],
            });
        }

        if (action === 'mark_read' && threadId) {
            readThreadIds.add(threadId);
            const readerKey = normalizeParticipantKey(viewerName || senderName);
            if (readerKey) {
                readThreadIds.add(`${threadId}__${readerKey}`);
            }

            const existingBilateral = bilateralConversationsByPairKey[threadId];
            if (existingBilateral && readerKey) {
                // Duplicate conversations with the same two people are shown as one thread, so mark them all read
                const compact = (s: string) => normalizeParticipantKey(s).replace(/[^a-z0-9]/g, '');
                const partnerOf = (c: CloudDirectConversation) =>
                    doesParticipantMatch(c.participantA.name, viewerName || senderName, c.participantA.email, '')
                        ? c.participantB.name
                        : c.participantA.name;
                const partnerKey = compact(partnerOf(existingBilateral));
                for (const c of Object.values(bilateralConversationsByPairKey)) {
                    if (c === existingBilateral || compact(partnerOf(c)) !== partnerKey) continue;
                    c.messages = c.messages.map((m) => ({
                        ...m,
                        readBy: Array.from(new Set([...(m.readBy || []), readerKey])),
                    }));
                    await upsertCloudDirectConversation(c).catch(() => {});
                }
            }
            if (existingBilateral && readerKey) {
                existingBilateral.messages = existingBilateral.messages.map((m) => ({
                    ...m,
                    readBy: Array.from(new Set([...(m.readBy || []), readerKey])),
                }));
                await upsertCloudDirectConversation(existingBilateral).catch(() => {});
            }

            return NextResponse.json({
                ok: true,
                threadId,
                unreadCount: 0,
            });
        }

        const rawRecipientInput = (recipientName || title || '').trim();
        const parsedRecipientEmails = Array.from(
            new Set([
                ...extractEmailsFromInput(recipientEmail),
                ...extractEmailsFromInput(rawRecipientInput),
                ...extractEmailsFromInput(recipientSubtitle),
                ...extractEmailsFromInput(subtitle),
            ])
        );
        const primaryParsedEmail = parsedRecipientEmails[0] || '';
        const strippedNameWithoutAngleEmail = rawRecipientInput
            .replace(/<[^>]+>/g, '')
            .trim();
        const effectiveRecipientName =
            strippedNameWithoutAngleEmail && !strippedNameWithoutAngleEmail.includes('@')
                ? strippedNameWithoutAngleEmail
                : primaryParsedEmail
                ? deriveDisplayNameFromEmail(primaryParsedEmail)
                : rawRecipientInput;

        const effectiveRecipientSubtitle =
            recipientSubtitle ||
            subtitle ||
            (primaryParsedEmail
                ? `External Email · ${formatEmailProviderLabel(primaryParsedEmail)} (${primaryParsedEmail})`
                : 'Verified ConnectLn Professional · Direct Member Channel');
        const effectiveRecipientAvatar = resolveValidMessagingAvatarUrl(
            recipientAvatar || avatar,
            effectiveRecipientName || primaryParsedEmail || 'Member'
        );

        // Route ALL direct member DMs AND external email threads (Gmail, Yahoo, Outlook, etc.) through bilateral cloud + Resend
        const isBilateralDm =
            Boolean(primaryParsedEmail) ||
            (channelType === 'People' && Boolean(effectiveRecipientName)) ||
            (typeof threadId === 'string' &&
                (threadId.startsWith('dm_pair__') ||
                    threadId.startsWith('dm_') ||
                    Boolean(bilateralConversationsByPairKey[threadId])));

        if (isBilateralDm && text) {
            await Promise.all([
                pullCloudUsersIntoDb().catch(() => {}),
                pullCloudDirectConversations()
                    .then((convos) => {
                        if (convos.length > 0) mergeCloudConversationsIntoMemory(convos);
                    })
                    .catch(() => {}),
            ]);

            // Resolve counterparty name & stored email from Cloud Sync even on fresh serverless instances
            let resolvedRecipientName = effectiveRecipientName;
            let storedPartnerEmail = '';
            let matchedExistingConvo: CloudDirectConversation | undefined =
                threadId && bilateralConversationsByPairKey[threadId]
                    ? bilateralConversationsByPairKey[threadId]
                    : undefined;

            if (!matchedExistingConvo && resolvedRecipientName) {
                matchedExistingConvo = Object.values(bilateralConversationsByPairKey).find((c) => {
                    const aMatchesSender = doesParticipantMatch(c.participantA.name, senderName, c.participantA.email, senderEmail);
                    const bMatchesSender = doesParticipantMatch(c.participantB.name, senderName, c.participantB.email, senderEmail);
                    if (!aMatchesSender && !bMatchesSender) return false;
                    const partnerCandidate = aMatchesSender ? c.participantB : c.participantA;
                    return doesParticipantMatch(
                        partnerCandidate.name,
                        resolvedRecipientName,
                        partnerCandidate.email,
                        primaryParsedEmail
                    );
                });
            }

            if (matchedExistingConvo) {
                const senderIsA = doesParticipantMatch(
                    matchedExistingConvo.participantA.name,
                    senderName,
                    matchedExistingConvo.participantA.email,
                    senderEmail
                );
                const partnerObj = senderIsA ? matchedExistingConvo.participantB : matchedExistingConvo.participantA;
                if (!resolvedRecipientName) {
                    resolvedRecipientName = partnerObj.name;
                }
                const fallbackFromMsgs = (matchedExistingConvo.messages || [])
                    .map((m) =>
                        doesParticipantMatch(m.senderName, senderName, m.senderEmail, senderEmail)
                            ? m.recipientEmail
                            : m.senderEmail
                    )
                    .find((em) => Boolean(em && em.includes('@') && !em.endsWith('@connectin.app')));
                const candidateStored =
                    partnerObj.email ||
                    fallbackFromMsgs ||
                    extractEmailsFromInput(partnerObj.headline)[0] ||
                    '';
                if (candidateStored) {
                    storedPartnerEmail = candidateStored.trim().toLowerCase();
                }
            }

            if (resolvedRecipientName || primaryParsedEmail) {
                const senderReg = findRegisteredUser(senderName, senderEmail);
                const recipientReg = findRegisteredUser(
                    resolvedRecipientName,
                    primaryParsedEmail || storedPartnerEmail
                );
                const canonSenderName = senderReg?.name || senderName;
                const canonRecipientName =
                    recipientReg?.name ||
                    resolvedRecipientName ||
                    deriveDisplayNameFromEmail(primaryParsedEmail);
                const effectiveRecipientEmail = (
                    primaryParsedEmail ||
                    storedPartnerEmail ||
                    recipientReg?.email ||
                    ''
                )
                    .trim()
                    .toLowerCase();

                const pairKey =
                    matchedExistingConvo?.pairKey ||
                    makeDmPairKey(
                        canonSenderName,
                        recipientReg ? canonRecipientName : effectiveRecipientEmail || canonRecipientName
                    );
                const nowIso = new Date().toISOString();
                const nowLabel = formatMessageSentDateTime(nowIso);
                const senderKey = normalizeParticipantKey(senderName);

                const existingConvo = bilateralConversationsByPairKey[pairKey] || matchedExistingConvo;
                const newMsgId = `dm_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

                const newCloudMsg: CloudDirectMessage = {
                    id: newMsgId,
                    senderName: canonSenderName,
                    senderEmail: senderEmail || senderReg?.email || '',
                    senderAvatar,
                    senderRole,
                    recipientName: canonRecipientName,
                    recipientEmail: effectiveRecipientEmail,
                    subject: subject || undefined,
                    text,
                    attachment: attachment || undefined,
                    timestamp: nowLabel,
                    createdAtIso: nowIso,
                    readBy: [senderKey],
                };

                const updatedConvo: CloudDirectConversation = existingConvo
                    ? {
                          ...existingConvo,
                          participantB: {
                              ...existingConvo.participantB,
                              email: effectiveRecipientEmail || existingConvo.participantB.email,
                              avatar: resolveValidMessagingAvatarUrl(
                                  recipientAvatar || avatar || existingConvo.participantB.avatar,
                                  existingConvo.participantB.name || canonRecipientName
                              ),
                          },
                          messages: [...existingConvo.messages, newCloudMsg],
                          updatedAtIso: nowIso,
                      }
                    : {
                          pairKey,
                          participantA: {
                              name: canonSenderName,
                              email: senderEmail || senderReg?.email || '',
                              avatar: senderAvatar,
                              headline: senderRole,
                          },
                          participantB: {
                              name: canonRecipientName,
                              email: effectiveRecipientEmail,
                              avatar: effectiveRecipientAvatar,
                              headline: recipientReg?.headline || effectiveRecipientSubtitle,
                          },
                          messages: [newCloudMsg],
                          updatedAtIso: nowIso,
                      };

                bilateralConversationsByPairKey[pairKey] = updatedConvo;
                const recipientKey = normalizeParticipantKey(canonRecipientName);
                readThreadIds.delete(`${pairKey}__${recipientKey}`);

                // Only generate simulated auto-reply for offline demo personas (NEVER for real registered members OR real external email addresses!)
                let autoReplyMsg: B2BMessageItem | null = null;
                const recipientIsRegisteredHuman =
                    Boolean(recipientReg) || isRealRegisteredMember(canonRecipientName);
                const recipientHasRealExternalEmail =
                    Boolean(effectiveRecipientEmail) &&
                    !effectiveRecipientEmail.endsWith('@connectin.app') &&
                    !recipientIsRegisteredHuman;

                if (!recipientIsRegisteredHuman && !recipientHasRealExternalEmail) {
                    const dummyThread: B2BConversationThread = {
                        id: pairKey,
                        channelType: 'People',
                        subType: 'DM',
                        title: canonRecipientName,
                        subtitle: effectiveRecipientSubtitle,
                        avatar: effectiveRecipientAvatar,
                        onlineStatus: 'online',
                        unreadCount: 0,
                        lastMessage: text,
                        lastMessageTime: 'Just now',
                        messages: [],
                    };
                    const replyText = generateAutoReply(dummyThread, text);
                    const replyId = `dm_reply_${Date.now()}`;
                    const cloudReply: CloudDirectMessage = {
                        id: replyId,
                        senderName: canonRecipientName,
                        senderAvatar: effectiveRecipientAvatar,
                        senderRole: effectiveRecipientSubtitle,
                        recipientName: canonSenderName,
                        text: replyText,
                        timestamp: 'Just now',
                        createdAtIso: new Date().toISOString(),
                        readBy: [recipientKey, senderKey],
                    };
                    updatedConvo.messages.push(cloudReply);

                    autoReplyMsg = {
                        id: replyId,
                        sender: {
                            id: `partner_${recipientKey.replace(/\s+/g, '_')}`,
                            name: canonRecipientName,
                            avatar: effectiveRecipientAvatar,
                            role: effectiveRecipientSubtitle,
                            isVerified: true,
                        },
                        text: replyText,
                        timestamp: 'Just now',
                    };
                }

                await upsertCloudDirectConversation(updatedConvo).catch(() => {});
                recordGlobalUserActivity({
                    id: `act_dm_${newMsgId}`,
                    userName: canonSenderName,
                    userEmail: senderEmail || senderReg?.email || `${canonSenderName.toLowerCase().replace(/\s+/g, '.')}@connectin.app`,
                    userAvatar: senderAvatar,
                    actionType: 'MESSAGE_SENT',
                    actionLabel: recipientHasRealExternalEmail
                        ? `Sent External Email (${formatEmailProviderLabel(effectiveRecipientEmail)}) to ${effectiveRecipientEmail}`
                        : `Sent Direct Message to ${canonRecipientName}`,
                    category: 'network',
                    targetId: pairKey,
                    targetTitle: recipientHasRealExternalEmail
                        ? `External Email → ${canonRecipientName} (${effectiveRecipientEmail})`
                        : `Direct Message → ${canonRecipientName}`,
                    details: `${String(text).replace(/\n+/g, ' ').slice(0, 140)}${attachment ? ` (📎 ${attachment})` : ''}`,
                    timestampIso: nowIso,
                }).catch(() => {});

                // Dispatch real email (and SMS if member has phone) on EVERY message (1st, 2nd, 3rd...) to external Gmail/Yahoo/Outlook users AND internal members!
                let notified: { email: boolean; emailError?: string; sms: boolean; skipped?: string; smsNote?: string } | null = null;
                const allTargetEmails = (
                    parsedRecipientEmails.length > 0
                        ? parsedRecipientEmails
                        : effectiveRecipientEmail
                        ? [effectiveRecipientEmail]
                        : []
                ).filter((e) => Boolean(e) && !e.endsWith('@connectin.app'));

                const isExplicitEmailThread = Boolean(primaryParsedEmail || storedPartnerEmail);
                const isSamePersonWithoutExplicitEmail =
                    !isExplicitEmailThread &&
                    doesParticipantMatch(canonSenderName, canonRecipientName, senderEmail, effectiveRecipientEmail) &&
                    (!effectiveRecipientEmail ||
                        effectiveRecipientEmail === (senderEmail || senderReg?.email || '').trim().toLowerCase());

                if (recipientHasRealExternalEmail && allTargetEmails.length > 0) {
                    const dispatchResults = await Promise.all(
                        allTargetEmails.map((targetAddr) =>
                            notifyDmRecipient({
                                recipientName:
                                    allTargetEmails.length === 1
                                        ? canonRecipientName
                                        : deriveDisplayNameFromEmail(targetAddr),
                                recipientEmail: targetAddr,
                                senderName: canonSenderName,
                                senderEmail: senderEmail || senderReg?.email || undefined,
                                senderHeadline: senderRole,
                                subject: subject || undefined,
                                text,
                                messageId: newMsgId,
                                isExternalRecipient: true,
                                bypassCooldown: true,
                            })
                        )
                    );
                    notified = dispatchResults[0] || null;
                } else if ((recipientIsRegisteredHuman || allTargetEmails.length > 0) && !isSamePersonWithoutExplicitEmail) {
                    try {
                        const rec =
                            recipientReg ||
                            connectinDb
                                .getAllUsersWithProfiles()
                                .find((u) =>
                                    doesParticipantMatch(u.name, canonRecipientName, u.email, effectiveRecipientEmail)
                                );
                        const targetMemberEmail = allTargetEmails[0] || rec?.email || effectiveRecipientEmail;
                        if (rec || targetMemberEmail) {
                            notified = await notifyDmRecipient({
                                recipientName: rec?.name || canonRecipientName,
                                recipientEmail: targetMemberEmail || undefined,
                                recipientPhone: rec?.phone,
                                senderName: canonSenderName,
                                senderEmail: senderEmail || senderReg?.email || undefined,
                                senderHeadline: senderRole,
                                subject: subject || undefined,
                                text,
                                messageId: newMsgId,
                                isExternalRecipient: isExplicitEmailThread && !rec,
                                bypassCooldown: true,
                            });
                        }
                    } catch (e) {
                        console.warn('[messages] recipient notification failed', e);
                    }
                }

                const viewerThreads = buildViewerBilateralThreads(canonSenderName, senderEmail || senderReg?.email || '', enclave);
                const updatedThreadForSender = viewerThreads.find((t) => t.id === pairKey);

                return NextResponse.json({
                    ok: true,
                    threadId: pairKey,
                    deliveredToRecipient: canonRecipientName,
                    deliveredToEmail: effectiveRecipientEmail || undefined,
                    deliveredToEmails: allTargetEmails,
                    recipientIsRegisteredHuman,
                    recipientIsExternalEmail: recipientHasRealExternalEmail,
                    emailDispatched: Boolean(notified?.email),
                    emailError: notified?.emailError,
                    notified,
                    thread: updatedThreadForSender,
                    userMessage: {
                        id: newMsgId,
                        sender: {
                            id: 'me',
                            name: canonSenderName,
                            avatar: senderAvatar,
                            role: senderRole,
                        },
                        text,
                        timestamp: nowLabel,
                        attachments: attachment
                            ? [{ name: attachment, type: 'Document' }]
                            : undefined,
                    },
                    autoReply: autoReplyMsg,
                });
            }
        }

        if (action === 'create_thread') {
            if (!title || !text) {
                return NextResponse.json(
                    { ok: false, error: 'Recipient name and initial message are required.' },
                    { status: 400 }
                );
            }

            const newId = `custom-${Date.now()}`;
            const nowLabel = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });

            const initialUserMsg: B2BMessageItem = {
                id: `${newId}-m1`,
                sender: {
                    id: 'me',
                    name: senderName,
                    avatar: senderAvatar,
                    role: senderRole,
                },
                text,
                timestamp: nowLabel,
                attachments: attachment
                    ? [{ name: attachment, type: 'Document' }]
                    : undefined,
            };

            const subTypeMap: Record<
                'People' | 'Companies' | 'Products' | 'Communities',
                B2BConversationThread['subType']
            > = {
                People: 'DM',
                Companies: 'Recruiter',
                Products: 'Product Inquiry',
                Communities: 'Community Chat',
            };

            const tempThread: B2BConversationThread = {
                id: newId,
                professionEnclave: enclave === 'all' ? 'trades_construction' : enclave,
                channelType,
                subType: subTypeMap[channelType as 'People' | 'Companies' | 'Products' | 'Communities'] || 'DM',
                title,
                subtitle: subtitle || 'Verified ConnectIn Partner • Direct Channel',
                avatar: effectiveRecipientAvatar,
                isVerified: true,
                onlineStatus: 'online',
                unreadCount: 0,
                lastMessage: text,
                lastMessageTime: 'Just now',
                messages: [initialUserMsg],
            };

            const replyText = generateAutoReply(tempThread, text);
            const autoReplyMsg: B2BMessageItem = {
                id: `${newId}-m2`,
                sender: {
                    id: `partner-${Date.now()}`,
                    name: title,
                    avatar: effectiveRecipientAvatar,
                    role: tempThread.subtitle,
                    isVerified: true,
                },
                text: replyText,
                timestamp: 'Just now',
            };

            tempThread.messages.push(autoReplyMsg);
            tempThread.lastMessage = replyText;

            const bucket = enclave === 'all' ? 'trades_construction' : enclave;
            if (!customThreadsByEnclave[bucket]) {
                customThreadsByEnclave[bucket] = [];
            }
            customThreadsByEnclave[bucket].unshift(tempThread);
            readThreadIds.add(newId);

            return NextResponse.json({
                ok: true,
                thread: tempThread,
                quickReplies: getThreadQuickReplies(tempThread, bucket),
            });
        }

        // Default: send_message to an existing B2B thread
        if (!threadId || !text) {
            return NextResponse.json(
                { ok: false, error: 'threadId and text are required.' },
                { status: 400 }
            );
        }

        const threads = getThreadsForEnclaveMerged(enclave, senderName, senderEmail);
        const targetThread =
            threads.find((t) => t.id === threadId) ||
            getThreadsForEnclaveMerged('all', senderName, senderEmail).find((t) => t.id === threadId);

        const nowLabel = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const userMsg: B2BMessageItem = {
            id: `msg-${Date.now()}-user`,
            sender: {
                id: 'me',
                name: senderName,
                avatar: senderAvatar,
                role: senderRole,
            },
            text,
            timestamp: nowLabel,
            attachments: attachment ? [{ name: attachment, type: 'Document' }] : undefined,
        };

        if (!appendedMessagesByThreadId[threadId]) {
            appendedMessagesByThreadId[threadId] = [];
        }
        appendedMessagesByThreadId[threadId].push(userMsg);
        readThreadIds.add(threadId);

        let autoReplyMsg: B2BMessageItem | null = null;
        if (targetThread) {
            const replyText = generateAutoReply(targetThread, text);
            autoReplyMsg = {
                id: `msg-${Date.now()}-reply`,
                sender: {
                    id: targetThread.id,
                    name: targetThread.title,
                    avatar: targetThread.avatar,
                    role: targetThread.subtitle,
                    isVerified: targetThread.isVerified,
                },
                text: replyText,
                timestamp: 'Just now',
            };
            appendedMessagesByThreadId[threadId].push(autoReplyMsg);
        }

        return NextResponse.json({
            ok: true,
            threadId,
            userMessage: userMsg,
            autoReply: autoReplyMsg,
        });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: error?.message || 'Failed to process message request' },
            { status: 500 }
        );
    }
}
