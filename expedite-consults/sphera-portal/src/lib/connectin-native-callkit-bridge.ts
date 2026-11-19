/**
 * ConnectLn Native CallKit (iOS PushKit) & Android Telecom ConnectionService Bridge
 * ---------------------------------------------------------------------------------
 * - On Web / Installed PWA (`https://conectln.com`): Uses `public/sw.js` + RFC 8291 VAPID Web Push
 *   to wake up the phone and display Answer / Decline call notifications.
 * - When packaged as a native iOS/Android app via Capacitor (`capacitor.config.json`),
 *   automatically bridges incoming/outgoing call events to native CallKit (iOS) and
 *   ConnectionService (Android) for full-screen lock-screen slide-to-answer UI.
 */

export interface NativeIncomingCallPayload {
  callId: string
  callerName: string
  callerPhone?: string
  hasVideo: boolean
}

export function isRunningInNativeCapacitorShell(): boolean {
  if (typeof window === "undefined") return false
  const w = window as any
  return Boolean(w.Capacitor?.isNativePlatform?.())
}

export async function reportIncomingCallToNativeOS(payload: NativeIncomingCallPayload): Promise<boolean> {
  if (!isRunningInNativeCapacitorShell()) return false
  try {
    const w = window as any
    const callKitPlugin = w.Capacitor?.Plugins?.CallKitVoip || w.Capacitor?.Plugins?.VoiceCallKeep
    if (callKitPlugin?.displayIncomingCall) {
      await callKitPlugin.displayIncomingCall({
        uuid: payload.callId,
        handle: payload.callerPhone || payload.callerName,
        callerName: payload.callerName,
        hasVideo: payload.hasVideo,
      })
      return true
    }
  } catch {
    // Fallback to ConnectLn Web Push + In-App Ringing UI
  }
  return false
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = typeof window !== "undefined" ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary")
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerConnectLnPushSubscription(vapidPublicKey: string): Promise<PushSubscriptionJSON | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    await navigator.serviceWorker.ready

    if (!("PushManager" in window) || !("Notification" in window)) {
      return null
    }

    let permission = Notification.permission
    if (permission === "default") {
      permission = await Notification.requestPermission()
    }
    if (permission !== "granted") {
      return null
    }

    let existing = await registration.pushManager.getSubscription()
    if (!existing && vapidPublicKey) {
      const appServerKey = urlBase64ToUint8Array(vapidPublicKey)
      existing = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      })
    }
    return existing ? existing.toJSON() : null
  } catch (err) {
    console.warn("[ConnectLn Push] Service worker / Push registration notice:", err)
    return null
  }
}
