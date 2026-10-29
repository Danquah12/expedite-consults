import { NextResponse } from 'next/server';
import {
    makeDmPairKey,
    normalizeParticipantKey,
    pullCloudDirectConversations,
    upsertCloudDirectConversation,
    pullCloudUsersIntoDb,
} from '@/lib/connectin-cloud-sync';
import { connectinDb } from '@/lib/connectin-db';
import { notifyDmRecipient } from '@/lib/connectin-dm-notify';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const host = (url.searchParams.get('host') || '').trim();
    const invitee = (url.searchParams.get('invitee') || '').trim();
    const msgId = (url.searchParams.get('msgId') || '').trim();
    const reason = (url.searchParams.get('reason') || 'Scheduled Meeting').trim();
    const rawChoice = (url.searchParams.get('choice') || 'yes').toLowerCase();
    const choice: 'yes' | 'no' | 'maybe' =
        rawChoice === 'no' ? 'no' : rawChoice === 'maybe' ? 'maybe' : 'yes';

    const labelMap = {
        yes: '✅ Yes — I will attend',
        no: '❌ No — Unable to attend',
        maybe: '🤔 Maybe — Tentative',
    };
    const rKind = `rsvp_${choice}`;

    if (host && invitee) {
        try {
            await pullCloudUsersIntoDb().catch(() => {});
            const cloudConvos = await pullCloudDirectConversations().catch(() => []);
            const pairKey = makeDmPairKey(invitee, host);
            const existing = cloudConvos.find((c) => c.pairKey === pairKey);
            const actorKey = normalizeParticipantKey(invitee);
            const nowIso = new Date().toISOString();
            const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const responseText =
                `📅 Meeting RSVP Response from ${invitee}\n` +
                `Response: ${labelMap[choice]}\n` +
                `Meeting: ${reason}\n` +
                `(In response to the meeting invitation sent by ${host})`;

            const replyMsg = {
                id: `dm_rsvp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                senderName: invitee,
                senderAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(invitee)}&backgroundColor=0a66c2`,
                senderRole: 'Verified ConnectLn Member',
                recipientName: host,
                text: responseText,
                timestamp: nowLabel,
                createdAtIso: nowIso,
                readBy: [actorKey],
            };

            if (existing) {
                if (msgId) {
                    const targetMsg = (existing.messages || []).find((m) => m.id === msgId);
                    if (targetMsg) {
                        const reactions: Record<string, string[]> = { ...(targetMsg.reactions || {}) };
                        for (const k of ['rsvp_yes', 'rsvp_no', 'rsvp_maybe']) {
                            reactions[k] = (reactions[k] || []).filter((u) => u !== actorKey);
                        }
                        reactions[rKind] = [...(reactions[rKind] || []), actorKey];
                        targetMsg.reactions = reactions;
                    }
                }
                existing.messages = [...(existing.messages || []), replyMsg];
                existing.updatedAtIso = nowIso;
                await upsertCloudDirectConversation(existing).catch(() => {});
            } else {
                await upsertCloudDirectConversation({
                    pairKey,
                    participantA: {
                        name: invitee,
                        email: '',
                        avatar: replyMsg.senderAvatar,
                        headline: 'Verified ConnectLn Member',
                    },
                    participantB: {
                        name: host,
                        email: '',
                        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(host)}&backgroundColor=0a66c2`,
                        headline: 'Verified ConnectLn Member',
                    },
                    messages: [replyMsg],
                    updatedAtIso: nowIso,
                }).catch(() => {});
            }

            const hostRec = connectinDb
                .getAllUsersWithProfiles()
                .find((u) => normalizeParticipantKey(u.name) === normalizeParticipantKey(host));
            if (hostRec) {
                await notifyDmRecipient({
                    recipientName: hostRec.name,
                    recipientEmail: hostRec.email,
                    recipientPhone: hostRec.phone,
                    senderName: invitee,
                    text: responseText,
                    messageId: replyMsg.id,
                }).catch(() => {});
            }
        } catch {
            // Best-effort sync
        }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ConnectLn Meeting RSVP Confirmed</title>
</head>
<body style="margin:0;background:#f5f2eb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px">
  <div style="max-width:460px;width:100%;background:#ffffff;border:1px solid #e4ddd0;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.08)">
    <div style="display:flex;align-items:center;gap:10px;background:#171513;color:#F5F0EB;padding:14px 18px">
      <img src="https://www.connectln.app/brand/connectln-icon-256.png" alt="ConnectLn" width="28" height="28" style="border-radius:6px" />
      <span style="font-size:17px;font-weight:900;color:#F5F0EB">ConnectLn</span>
      <span style="margin-left:auto;font-size:11px;font-weight:700;color:#d6d3d1">📅 Meeting RSVP</span>
    </div>
    <div style="padding:22px">
      <h2 style="margin:0 0 8px 0;font-size:18px;color:#0f172a">Your response has been sent to ${host || 'the organizer'}!</h2>
      <p style="margin:0 0 14px 0;font-size:14px;color:#334155"><strong>${labelMap[choice]}</strong> for <em>"${reason}"</em>.</p>
      <a href="https://www.connectln.app/connectin?tab=messaging" style="display:inline-block;background:#0A66C2;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:800;font-size:13px">Open ConnectLn Messaging →</a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
