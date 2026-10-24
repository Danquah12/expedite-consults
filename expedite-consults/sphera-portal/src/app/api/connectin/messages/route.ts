import { NextResponse } from 'next/server';
import {
    getEnclaveB2BThreads,
    getThreadQuickReplies,
    B2BConversationThread,
    B2BMessageItem,
} from '@/lib/b2b-messaging-data';

// Server-side in-memory store for dynamic replies and custom conversations during the session
const customThreadsByEnclave: Record<string, B2BConversationThread[]> = {};
const appendedMessagesByThreadId: Record<string, B2BMessageItem[]> = {};
const readThreadIds = new Set<string>();

function getThreadsForEnclaveMerged(enclave: string): B2BConversationThread[] {
    const baseThreads = getEnclaveB2BThreads(enclave);
    const custom =
        enclave === 'all'
            ? Object.values(customThreadsByEnclave).flat()
            : customThreadsByEnclave[enclave] || [];

    return [...custom, ...baseThreads].map((thread) => {
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
        lower.includes('resume')
    ) {
        return `Got the file loud and clear — reviewing the details right now and will mark up my notes for you shortly!`;
    }
    return `Sounds great! Appreciate the quick update — let's stay synced on this and keep the momentum going.`;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const enclave = searchParams.get('enclave') || 'trades_construction';

    const threads = getThreadsForEnclaveMerged(enclave);

    return NextResponse.json({
        ok: true,
        enclave,
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
            senderName = 'You',
            senderAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            senderRole = 'Verified ConnectIn Professional',
            attachment,
            // For creating a new conversation
            title,
            subtitle,
            channelType = 'People',
            avatar,
        } = body;

        if (action === 'mark_read' && threadId) {
            readThreadIds.add(threadId);
            return NextResponse.json({
                ok: true,
                threadId,
                unreadCount: 0,
            });
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

            const recipientAvatar =
                avatar ||
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';

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
                avatar: recipientAvatar,
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
                    avatar: recipientAvatar,
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

        // Default: send_message to an existing thread
        if (!threadId || !text) {
            return NextResponse.json(
                { ok: false, error: 'threadId and text are required.' },
                { status: 400 }
            );
        }

        const threads = getThreadsForEnclaveMerged(enclave);
        const targetThread =
            threads.find((t) => t.id === threadId) ||
            getThreadsForEnclaveMerged('all').find((t) => t.id === threadId);

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
