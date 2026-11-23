/* ConnectLn Service Worker — Background & Minimized Incoming Video & Voice Call Ringing + Pop-Up Call Window */
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

  const title = isVideo
    ? `📹 Incoming Video Call · ${callerName}`
    : `📞 Incoming Voice Call · ${callerName}`;
  const body = `Calling${callerPhone} on ConnectLn — Click Answer to open call screen`;

  const options = {
    body,
    icon: payload.callerAvatar || "/brand/connectln-icon-256.png",
    badge: "/brand/connectln-icon.png",
    tag: `connectln-call-${callId}`,
    renotify: false,
    requireInteraction: true,
    silent: false,
    vibrate: [600, 220, 600, 220, 800, 250, 800],
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
        title: isVideo ? "📹 Answer Video" : "📞 Answer Call",
      },
      {
        action: "decline",
        title: "❌ Decline",
      },
    ],
  };

  return { title, options, callId, isVideo, callerName, joinUrl };
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "ConnectLn Incoming Call", body: event.data ? event.data.text() : "" };
  }
  if (payload && payload.ignore) return;

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
      if (!swNotifiedCallIds.has(spec.callId)) {
        rememberSwCallId(swNotifiedCallIds, spec.callId);
        await self.registration.showNotification(spec.title, spec.options);
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
            body: JSON.stringify({ action: "end", call_id: callId, user_id: "declined_push" }),
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

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windowClients) {
        if ("focus" in client && String(client.url || "").includes("/connectin")) {
          try {
            await client.focus();
            client.postMessage({
              type: "CONNECTLN_ANSWER_CALL_FROM_NOTIFICATION",
              payload: {
                callId,
                callMode: data.callMode || "video",
                callerName: data.callerName || "ConnectLn Caller",
                callerPhone: data.callerPhone || "",
                joinUrl: targetUrl,
              },
            });
            return;
          } catch {}
        }
      }
      // If minimized window could not be focused by OS, open a brand-new foreground Call Window!
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

let swWatchPollUrl = "";
let swWatchTimer = null;
let swPollInFlight = false;
const swNotifiedCallIds = new Set();
const swHandledCallIds = new Set();

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
      await self.registration.showNotification(spec.title, spec.options).catch(() => {});
    }
  } catch {
  } finally {
    swPollInFlight = false;
  }
}

self.addEventListener("message", (event) => {
  const msg = event && event.data;
  if (!msg) return;

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
