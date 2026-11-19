/* ConnectLn Service Worker — Background & Minimized Incoming Video & Voice Call Ringing (WhatsApp-Style PWA Push) */
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
  const body = `Calling${callerPhone} on ConnectLn — Tap to answer with ${
    isVideo ? "camera & audio" : "live voice"
  }`;

  const options = {
    body,
    icon: payload.callerAvatar || "/brand/connectln-icon-256.png",
    badge: "/brand/connectln-icon.png",
    tag: `connectln-call-${callId}`,
    renotify: true,
    requireInteraction: true,
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

  const spec = buildCallNotificationSpec(payload);

  event.waitUntil(
    (async () => {
      // Wake any minimized/background ConnectLn tabs immediately so loud audio ringtone starts in <50ms!
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
      await self.registration.showNotification(spec.title, spec.options);
    })()
  );
});

// Allow minimized ConnectLn tabs (via Web Worker poll) to pop up an OS-level Answer/Decline notification!
self.addEventListener("message", (event) => {
  const msg = event && event.data;
  if (!msg || msg.type !== "SHOW_LOCAL_CALL_NOTIFICATION" || !msg.payload) return;
  const spec = buildCallNotificationSpec(msg.payload);
  event.waitUntil(self.registration.showNotification(spec.title, spec.options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const callId = data.callId || "";

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
      // Prefer focusing an already-open minimized ConnectLn window for instant (<100ms) answer without page reload!
      for (const client of windowClients) {
        if ("focus" in client && String(client.url || "").includes("/connectin")) {
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
        }
      }
      for (const client of windowClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {}
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});
