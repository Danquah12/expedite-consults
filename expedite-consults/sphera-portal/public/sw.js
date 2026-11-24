/* ConnectLn Service Worker v2026-11-24-whatsapp-stopring — Background & Minimized Incoming Video & Voice Call Ringing + High-Visibility Banner */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function buildCallNotificationSpec(payload) {
  const isVideo = payload.callMode !== "audio";
  const callerName = payload.callerName || "ConnectLn Caller";
  const callerPhone = payload.callerPhone ? ` (${payload.callerPhone})` : "";
  const callId = payload.callId || `wa_${Date.now()}`;
  const joinUrl =
    payload.joinUrl ||
    `/connectin?waCall=${encodeURIComponent(callId)}&mode=${isVideo ? "video" : "audio"}&callerName=${encodeURIComponent(callerName)}&autoAnswer=1`;
  const bannerImageUrl = `/api/connectin/call-banner?caller=${encodeURIComponent(callerName)}&mode=${isVideo ? "video" : "audio"}${payload.callerPhone ? `&phone=${encodeURIComponent(payload.callerPhone)}` : ""}`;

  const title = isVideo
    ? `🔔 INCOMING VIDEO CALL · ${callerName}`
    : `🔔 INCOMING CALL · ${callerName}`;
  const body = `TAP THIS BANNER OR PRESS ACCEPT CALL BELOW${callerPhone}`;

  const options = {
    body,
    icon: payload.callerAvatar || "/brand/connectln-icon-256.png",
    badge: "/brand/connectln-icon.png",
    image: bannerImageUrl,
    tag: `connectln-call-${callId}`,
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [800, 250, 800, 250, 1000, 300, 800],
    data: {
      callId,
      callMode: isVideo ? "video" : "audio",
      callerName,
      callerPhone: payload.callerPhone || "",
      joinUrl,
    },
    actions: [
      {
        action: "answer",
        title: isVideo ? "✅ ACCEPT VIDEO CALL" : "✅ ACCEPT CALL",
      },
      {
        action: "decline",
        title: "❌ DECLINE",
      },
    ],
  };

  return { title, options, callId, isVideo, callerName, joinUrl };
}

async function closeCallNotificationsByTag(callId) {
  if (!callId || !self.registration || typeof self.registration.getNotifications !== "function") return;
  try {
    const notifs = await self.registration.getNotifications({ tag: `connectln-call-${callId}` });
    for (const n of notifs) {
      try {
        n.close();
      } catch {}
    }
  } catch {}
}

async function ringNotificationUntilAnsweredOrEnded(spec, payload) {
  const callId = spec.callId;
  if (swHandledCallIds.has(callId)) {
    await closeCallNotificationsByTag(callId);
    return;
  }

  const initialClients = await self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .catch(() => []);
  if (initialClients.some((c) => c.visibilityState === "visible" && c.focused)) {
    return;
  }

  await self.registration.showNotification(spec.title, spec.options).catch(() => {});

  for (let step = 0; step < 16; step++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (swHandledCallIds.has(callId)) {
      await closeCallNotificationsByTag(callId);
      return;
    }

    const windowClients = await self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .catch(() => []);

    try {
      const checkRes = await fetch(`/api/v1/calls?call_id=${encodeURIComponent(callId)}`, {
        cache: "no-store",
      });
      if (checkRes.ok) {
        const data = await checkRes.json();
        const callObj = data && data.call;
        const isExplicitEnded = Boolean(
          (callObj && callObj.state === "ENDED") ||
            (Array.isArray(data && data.ended_call_ids) && data.ended_call_ids.includes(callId))
        );
        const isAlreadyAnswered = Boolean(
          callObj && Array.isArray(callObj.participants) && callObj.participants.length >= 2
        );
        if (isExplicitEnded || isAlreadyAnswered || swAckedAnswerCallIds.has(callId)) {
          rememberSwCallId(swHandledCallIds, callId);
          for (const client of windowClients) {
            try {
              client.postMessage({
                type: isExplicitEnded
                  ? "CONNECTLN_DECLINE_CALL_FROM_NOTIFICATION"
                  : "CONNECTLN_CALL_ANSWERED_ELSEWHERE",
                payload: { callId },
              });
            } catch {}
          }
          await closeCallNotificationsByTag(callId);
          return;
        }
      }
    } catch {}

    if (swHandledCallIds.has(callId)) {
      await closeCallNotificationsByTag(callId);
      return;
    }

    if (windowClients.some((c) => c.visibilityState === "visible" && c.focused)) {
      await closeCallNotificationsByTag(callId);
      return;
    }

    if (step % 2 === 1) {
      for (const client of windowClients) {
        try {
          client.postMessage({
            type: "CONNECTLN_PUSH_INCOMING_CALL",
            payload: {
              callId,
              callMode: spec.isVideo ? "video" : "audio",
              callerName: spec.callerName,
              callerPhone: (payload && payload.callerPhone) || "",
              callerAvatar: (payload && payload.callerAvatar) || "",
              joinUrl: spec.joinUrl,
            },
          });
        } catch {}
      }
      if (!swPageAudioRingingCallIds.has(callId)) {
        await self.registration
          .showNotification(
            spec.title,
            Object.assign({}, spec.options, { renotify: true, silent: false })
          )
          .catch(() => {});
      }
    }
  }
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "ConnectLn Incoming Call", body: event.data ? event.data.text() : "" };
  }
  if (payload && payload.ignore) return;

  if (payload && (payload.type === "CALL_ENDED" || payload.action === "end") && payload.callId) {
    const endedId = String(payload.callId).trim();
    rememberSwCallId(swHandledCallIds, endedId);
    rememberSwCallId(swNotifiedCallIds, endedId);
    event.waitUntil(
      (async () => {
        const allClients = await self.clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .catch(() => []);
        for (const client of allClients) {
          try {
            client.postMessage({
              type: "CONNECTLN_DECLINE_CALL_FROM_NOTIFICATION",
              payload: { callId: endedId },
            });
          } catch {}
        }
        await closeCallNotificationsByTag(endedId);
      })()
    );
    return;
  }

  const spec = buildCallNotificationSpec(payload);
  if (swHandledCallIds.has(spec.callId)) return;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        try {
          client.postMessage({
            type: "CONNECTLN_PUSH_INCOMING_CALL",
            payload: {
              callId: spec.callId,
              callMode: spec.isVideo ? "video" : "audio",
              callerName: spec.callerName,
              callerPhone: payload.callerPhone || "",
              callerAvatar: payload.callerAvatar || "",
              joinUrl: spec.joinUrl,
            },
          });
        } catch {}
      }
      if (!swHandledCallIds.has(spec.callId) && !swNotifiedCallIds.has(spec.callId)) {
        rememberSwCallId(swNotifiedCallIds, spec.callId);
        await ringNotificationUntilAnsweredOrEnded(spec, payload);
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const callId = data.callId || "";
  if (callId) {
    rememberSwCallId(swHandledCallIds, String(callId));
    rememberSwCallId(swNotifiedCallIds, String(callId));
  }

  if (event.action === "decline") {
    if (callId) {
      event.waitUntil(
        (async () => {
          const windowClients = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true,
          });
          for (const client of windowClients) {
            try {
              client.postMessage({
                type: "CONNECTLN_DECLINE_CALL_FROM_NOTIFICATION",
                payload: { callId },
              });
            } catch {}
          }
          await fetch("/api/v1/calls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "decline", call_id: callId, user_id: "declined_push" }),
          }).catch(() => {});
        })()
      );
    }
    return;
  }

  const targetUrl =
    data.joinUrl ||
    `/connectin?waCall=${encodeURIComponent(callId)}&mode=${encodeURIComponent(
      data.callMode || "video"
    )}&callerName=${encodeURIComponent(data.callerName || "ConnectLn Caller")}&autoAnswer=1`;

  const answerPayload = {
    callId,
    callMode: data.callMode || "video",
    callerName: data.callerName || "ConnectLn Caller",
    callerPhone: data.callerPhone || "",
    joinUrl: targetUrl,
  };
  swPendingAnswerPayload = Object.assign({}, answerPayload, { ts: Date.now() });

  event.waitUntil(
    (async () => {
      await closeCallNotificationsByTag(callId);
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const targetClient = windowClients.find((c) => isExactConnectInClientUrl(c.url));
      for (const client of windowClients) {
        if (targetClient && client.id === targetClient.id) continue;
        try {
          client.postMessage({
            type: "CONNECTLN_CALL_ANSWERED_ELSEWHERE",
            payload: { callId },
          });
        } catch {}
      }
      if (targetClient) {
        try {
          if ("focus" in targetClient) {
            await targetClient.focus().catch(() => {});
          }
          targetClient.postMessage({
            type: "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION",
            payload: answerPayload,
          });
          await new Promise((r) => setTimeout(r, 250));
          if (!swAckedAnswerCallIds.has(callId)) {
            targetClient.postMessage({
              type: "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION",
              payload: answerPayload,
            });
          }
          await new Promise((r) => setTimeout(r, 450));
          if (swAckedAnswerCallIds.has(callId)) {
            return;
          }
          if ("navigate" in targetClient && typeof targetClient.navigate === "function") {
            try {
              await targetClient.navigate(targetUrl);
              return;
            } catch {}
          }
        } catch {}
      }
      // If no /connectin client or minimized client didn't ack, open foreground Call Window!
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

let swWatchPollUrl = "";
let swWatchTimer = null;
let swPollInFlight = false;
let swPendingAnswerPayload = null;
const swNotifiedCallIds = new Set();
const swHandledCallIds = new Set();
const swPageAudioRingingCallIds = new Set();
const swAckedAnswerCallIds = new Set();

function isExactConnectInClientUrl(urlStr) {
  try {
    const parsed = new URL(String(urlStr || ""));
    return parsed.pathname === "/connectin";
  } catch {
    return false;
  }
}

function rememberSwCallId(setRef, callId) {
  const clean = String(callId || "").trim();
  if (!clean) return;
  if (setRef.has(clean)) return;
  if (setRef.size >= 200) {
    const oldest = setRef.values().next().value;
    if (oldest) setRef.delete(oldest);
  }
  setRef.add(clean);
}

async function runSwMinimizedCallCheck() {
  if (!swWatchPollUrl || swPollInFlight) return;
  swPollInFlight = true;
  try {
    const windowClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    if (!windowClients || windowClients.length === 0) {
      if (swWatchTimer) {
        clearInterval(swWatchTimer);
        swWatchTimer = null;
      }
      swWatchPollUrl = "";
      return;
    }

    // Only poll from the SW when at least one client is minimized/hidden or unfocused
    const hasHiddenClient = windowClients.some(
      (c) => c.visibilityState !== "visible" || !c.focused
    );
    if (!hasHiddenClient) return;

    const res = await fetch(swWatchPollUrl, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data && data.incoming_calls) ? data.incoming_calls : [];

    for (const c of list) {
      if (!c || !c.id) continue;
      const callId = String(c.id);
      if (swHandledCallIds.has(callId) || swNotifiedCallIds.has(callId)) continue;
      rememberSwCallId(swNotifiedCallIds, callId);

      const callerName =
        (c.participants && c.participants[0] && c.participants[0].display_name) ||
        c.initiator_name ||
        "ConnectLn Caller";
      const callerPhone = c.initiator_phone || "";
      const callMode = c.call_type === "audio" ? "audio" : "video";

      for (const client of windowClients) {
        try {
          client.postMessage({
            type: "CONNECTLN_PUSH_INCOMING_CALL",
            payload: {
              callId,
              callMode,
              callerName,
              callerPhone,
            },
          });
        } catch {}
      }

      const spec = buildCallNotificationSpec({
        callId,
        callMode,
        callerName,
        callerPhone,
      });
      void ringNotificationUntilAnsweredOrEnded(spec, {
        callId,
        callMode,
        callerName,
        callerPhone,
      });
    }
  } catch {
  } finally {
    swPollInFlight = false;
  }
}

self.addEventListener("message", (event) => {
  const msg = event && event.data;
  if (!msg) return;

  if (msg.type === "CONNECTLN_ANSWER_ACK" && msg.callId) {
    const ackCid = String(msg.callId).trim();
    rememberSwCallId(swAckedAnswerCallIds, ackCid);
    rememberSwCallId(swHandledCallIds, ackCid);
    rememberSwCallId(swNotifiedCallIds, ackCid);
    if (swPendingAnswerPayload && swPendingAnswerPayload.callId === ackCid) {
      swPendingAnswerPayload = null;
    }
    event.waitUntil(
      (async () => {
        await closeCallNotificationsByTag(ackCid);
        const allClients = await self.clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .catch(() => []);
        const senderId = event.source && event.source.id;
        for (const client of allClients) {
          if (senderId && client.id === senderId) continue;
          try {
            client.postMessage({
              type: "CONNECTLN_CALL_ANSWERED_ELSEWHERE",
              payload: { callId: ackCid },
            });
          } catch {}
        }
      })()
    );
    return;
  }

  if (msg.type === "CONNECTLN_CHECK_PENDING_ANSWER") {
    if (
      swPendingAnswerPayload &&
      Date.now() - swPendingAnswerPayload.ts < 25000 &&
      !swAckedAnswerCallIds.has(swPendingAnswerPayload.callId)
    ) {
      const replyPayload = swPendingAnswerPayload;
      if (event.source && typeof event.source.postMessage === "function") {
        try {
          event.source.postMessage({
            type: "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION",
            payload: replyPayload,
          });
        } catch {}
      } else {
        event.waitUntil(
          self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clients) => {
              for (const client of clients) {
                if (isExactConnectInClientUrl(client.url)) {
                  try {
                    client.postMessage({
                      type: "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION",
                      payload: replyPayload,
                    });
                  } catch {}
                }
              }
            })
            .catch(() => {})
        );
      }
    }
    return;
  }

  if (msg.type === "CONNECTLN_PAGE_AUDIO_RINGING" && msg.callId) {
    rememberSwCallId(swPageAudioRingingCallIds, String(msg.callId));
    return;
  }

  if (msg.type === "CONNECTLN_SW_CALL_HANDLED" && msg.callId) {
    const cid = String(msg.callId).trim();
    rememberSwCallId(swHandledCallIds, cid);
    rememberSwCallId(swNotifiedCallIds, cid);
    if (cid && self.registration && typeof self.registration.getNotifications === "function") {
      self.registration
        .getNotifications({ tag: `connectln-call-${cid}` })
        .then((notifs) => {
          for (const n of notifs) {
            try {
              n.close();
            } catch {}
          }
        })
        .catch(() => {});
    }
    return;
  }

  if (msg.type !== "CONNECTLN_SW_WATCH_CALLS") return;

  if (!msg.active || !msg.pollUrl) {
    swWatchPollUrl = "";
    if (swWatchTimer) {
      clearInterval(swWatchTimer);
      swWatchTimer = null;
    }
    return;
  }

  swWatchPollUrl = String(msg.pollUrl);
  if (!swWatchTimer) {
    swWatchTimer = setInterval(() => {
      void runSwMinimizedCallCheck();
    }, 1500);
  }
  void runSwMinimizedCallCheck();
});
