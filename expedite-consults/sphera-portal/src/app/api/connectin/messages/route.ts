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
} from '@/lib/connectin-cloud-sync';
import { connectinDb } from '@/lib/connectin-db';

// Server-side in-memory store for dynamic replies and custom conversations
const customThreadsByEnclave: Record<string, B2BConversationThread[]> = {};
const appendedMessagesByThreadId: Record<string, B2BMessageItem[]> = {};
const readThreadIds = new Set<string>();

// Bilateral user-to-user direct message store (synced with Twilio Cloud Sync Map `connectin_dm_conversations_v1`)
const bilateralConversationsByPairKey: Record<string, CloudDirectConversation> = {};

// Pre-seed the live message from Kwesi Asiedu -> PATIENCE Addo so PATIENCE Addo immediately receives it in her inbox
const INITIAL_PAIR_KEY = makeDmPairKey('Kwesi Asiedu', 'PATIENCE Addo');
bilateralConversationsByPairKey[INITIAL_PAIR_KEY] = {
    pairKey: INITIAL_PAIR_KEY,
    participantA: {
        name: 'Kwesi Asiedu',
        email: 'kwesi.asiedu@connectin.app',
        avatar: '/brand/kwesi-avatar.png',
        headline: 'Principal Cloud & AI Security Architect · ConnectLn Founder',
    },
    participantB: {
        name: 'PATIENCE Addo',
        email: 'patience.addo@connectin.app',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PATIENCE%20Addo&backgroundColor=0a66c2',
        headline: 'Doctor of Veterinary Medicine (DVM) · Small Animal Surgery, Pharmacology & Preventive Care',
    },
    messages: [
        {
            id: 'dm_seed_kwesi_patience_1',
            senderName: 'Kwesi Asiedu',
            senderEmail: 'kwesi.asiedu@connectin.app',
            senderAvatar: '/brand/kwesi-avatar.png',
            senderRole: 'Principal Cloud & AI Security Architect · ConnectLn Founder',
            recipientName: 'PATIENCE Addo',
            subject: 'neeed you for a job',
            text: 'Subject: neeed you for a job\nneed to connect with you for a job\n📎 Attached: noctis-report-2026-10-26.doc',
            attachment: 'noctis-report-2026-10-26.doc',
            timestamp: 'Just now',
            createdAtIso: new Date().toISOString(),
            readBy: ['kwesi asiedu'],
        },
    ],
    updatedAtIso: new Date().toISOString(),
};

let hasPushedInitialSeedToCloud = false;

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
        if (cEmail && vEmail && cEmail === vEmail) return true;
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
        // Merge messages by ID preserving chronological order
        const msgMap = new Map<string, CloudDirectMessage>();
        for (const m of local.messages || []) {
            msgMap.set(m.id, m);
        }
        for (const m of cloud.messages || []) {
            const existing = msgMap.get(m.id);
            if (existing) {
                const mergedReadBy = Array.from(new Set([...(existing.readBy || []), ...(m.readBy || [])]));
                msgMap.set(m.id, { ...existing, ...m, readBy: mergedReadBy });
            } else {
                msgMap.set(m.id, m);
            }
        }
        bilateralConversationsByPairKey[cloud.pairKey] = {
            ...local,
            ...cloud,
            participantA: {
                ...local.participantA,
                ...cloud.participantA,
                avatar: cloud.participantA?.avatar || local.participantA?.avatar,
            },
            participantB: {
                ...local.participantB,
                ...cloud.participantB,
                avatar: cloud.participantB?.avatar || local.participantB?.avatar,
            },
            messages: Array.from(msgMap.values()),
            updatedAtIso:
                cloud.updatedAtIso > local.updatedAtIso ? cloud.updatedAtIso : local.updatedAtIso,
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

        const mappedMessages: B2BMessageItem[] = (convo.messages || []).map((m) => {
            const sentByViewer = doesParticipantMatch(
                m.senderName,
                viewerName,
                m.senderEmail,
                viewerEmail
            );
            return {
                id: m.id,
                sender: {
                    id: sentByViewer ? 'me' : `partner_${normalizeParticipantKey(m.senderName).replace(/\s+/g, '_')}`,
                    name: m.senderName,
                    avatar:
                        m.senderAvatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.senderName)}&backgroundColor=0a66c2`,
                    role: m.senderRole || 'Verified ConnectLn Member',
                    isVerified: true,
                },
                text: m.text,
                timestamp: m.timestamp || 'Just now',
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

        results.push({
            id: convo.pairKey,
            professionEnclave: enclave === 'all' ? 'trades_construction' : enclave,
            channelType: 'People',
            subType: 'DM',
            title: partner.name,
            subtitle:
                partner.headline ||
                'Verified ConnectLn Professional · Direct Member Channel',
            avatar:
                partner.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.name)}&backgroundColor=0a66c2`,
            isVerified: true,
            verifiedBadge: '✓ Direct Member Message',
            onlineStatus: 'online',
            unreadCount: readThreadIds.has(`${convo.pairKey}__${viewerKey}`) ? 0 : unreadForViewer,
            lastMessage: lastMsg ? lastMsg.text.replace(/\n/g, ' · ') : 'New conversation',
            lastMessageTime: lastMsg ? lastMsg.timestamp : 'Just now',
            messages: mappedMessages,
        });
    }

    return results;
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
function findRegisteredUser(name: string, email?: string): { name: string; email: string } | null {
    if (!name && !email) return null;
    const allUsers = connectinDb.getAllUsersWithProfiles();
    const hit = allUsers.find((u) => doesParticipantMatch(u.name, name, u.email, email));
    return hit ? { name: hit.name, email: hit.email || '' } : null;
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

    // Ensure initial seed is pushed to cloud once and pull latest cloud DMs
    try {
        if (!hasPushedInitialSeedToCloud) {
            hasPushedInitialSeedToCloud = true;
            await upsertCloudDirectConversation(bilateralConversationsByPairKey[INITIAL_PAIR_KEY]);
        }
        const cloudConvos = await pullCloudDirectConversations();
        if (cloudConvos.length > 0) {
            mergeCloudConversationsIntoMemory(cloudConvos);
        }
    } catch {
        // Proceed with in-memory store
    }

    const threads = getThreadsForEnclaveMerged(enclave, viewerName, viewerEmail);

    return NextResponse.json({
        ok: true,
        enclave,
        viewerName,
        totalThreads: threads.length,
        unreadTotal: threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0),
        threads,
        syncedAt: new Date().toISOString(),
    });
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

        if (action === 'mark_read' && threadId) {
            readThreadIds.add(threadId);
            const readerKey = normalizeParticipantKey(viewerName || senderName);
            if (readerKey) {
                readThreadIds.add(`${threadId}__${readerKey}`);
            }

            const existingBilateral = bilateralConversationsByPairKey[threadId];
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

        const effectiveRecipientName = (recipientName || title || '').trim();
        const effectiveRecipientSubtitle =
            recipientSubtitle ||
            subtitle ||
            'Verified ConnectLn Professional · Direct Member Channel';
        const effectiveRecipientAvatar =
            recipientAvatar ||
            avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(effectiveRecipientName || 'Member')}&backgroundColor=0a66c2`;

        // If this is a Direct Message to a named recipient OR an existing bilateral thread (`dm_pair__...` or `dm_...`)
        const isBilateralDm =
            (channelType === 'People' && Boolean(effectiveRecipientName)) ||
            (typeof threadId === 'string' &&
                (threadId.startsWith('dm_pair__') ||
                    threadId.startsWith('dm_') ||
                    Boolean(bilateralConversationsByPairKey[threadId])));

        if (isBilateralDm && text) {
            await pullCloudUsersIntoDb().catch(() => {});

            // Resolve counterparty name if only threadId was passed
            let resolvedRecipientName = effectiveRecipientName;
            if (!resolvedRecipientName && threadId && bilateralConversationsByPairKey[threadId]) {
                const existing = bilateralConversationsByPairKey[threadId];
                const senderIsA = doesParticipantMatch(
                    existing.participantA.name,
                    senderName,
                    existing.participantA.email,
                    senderEmail
                );
                resolvedRecipientName = senderIsA
                    ? existing.participantB.name
                    : existing.participantA.name;
            }

            if (resolvedRecipientName) {
                // Use each member's registered account name/email so both sides share one conversation
                const senderReg = findRegisteredUser(senderName, senderEmail);
                const recipientReg = findRegisteredUser(resolvedRecipientName, recipientEmail);
                const canonSenderName = senderReg?.name || senderName;
                const canonRecipientName = recipientReg?.name || resolvedRecipientName;
                const effectiveRecipientEmail = recipientEmail || recipientReg?.email || '';
                const pairKey = makeDmPairKey(canonSenderName, canonRecipientName);
                const nowLabel = new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const nowIso = new Date().toISOString();
                const senderKey = normalizeParticipantKey(senderName);

                const existingConvo = bilateralConversationsByPairKey[pairKey];
                const newMsgId = `dm_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

                const newCloudMsg: CloudDirectMessage = {
                    id: newMsgId,
                    senderName,
                    senderEmail,
                    senderAvatar,
                    senderRole,
                    recipientName: resolvedRecipientName,
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
                          messages: [...existingConvo.messages, newCloudMsg],
                          updatedAtIso: nowIso,
                      }
                    : {
                          pairKey,
                          participantA: {
                              name: senderName,
                              email: senderEmail,
                              avatar: senderAvatar,
                              headline: senderRole,
                          },
                          participantB: {
                              name: canonRecipientName,
                              email: effectiveRecipientEmail,
                              avatar: effectiveRecipientAvatar,
                              headline: effectiveRecipientSubtitle,
                          },
                          messages: [newCloudMsg],
                          updatedAtIso: nowIso,
                      };

                bilateralConversationsByPairKey[pairKey] = updatedConvo;
                // Clear read flag for recipient so recipient sees unread badge immediately
                const recipientKey = normalizeParticipantKey(resolvedRecipientName);
                readThreadIds.delete(`${pairKey}__${recipientKey}`);

                // Only generate simulated auto-reply if the recipient is NOT a real registered user account
                let autoReplyMsg: B2BMessageItem | null = null;
                const recipientIsRegisteredHuman = isRealRegisteredMember(resolvedRecipientName);

                if (!recipientIsRegisteredHuman) {
                    const dummyThread: B2BConversationThread = {
                        id: pairKey,
                        channelType: 'People',
                        title: resolvedRecipientName,
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
                        senderName: resolvedRecipientName,
                        senderAvatar: effectiveRecipientAvatar,
                        senderRole: effectiveRecipientSubtitle,
                        recipientName: senderName,
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
                            name: resolvedRecipientName,
                            avatar: effectiveRecipientAvatar,
                            role: effectiveRecipientSubtitle,
                            isVerified: true,
                        },
                        text: replyText,
                        timestamp: 'Just now',
                    };
                }

                await upsertCloudDirectConversation(updatedConvo).catch(() => {});

                const viewerThreads = buildViewerBilateralThreads(senderName, senderEmail, enclave);
                const updatedThreadForSender = viewerThreads.find((t) => t.id === pairKey);

                return NextResponse.json({
                    ok: true,
                    threadId: pairKey,
                    deliveredToRecipient: resolvedRecipientName,
                    recipientIsRegisteredHuman,
                    thread: updatedThreadForSender,
                    userMessage: {
                        id: newMsgId,
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
