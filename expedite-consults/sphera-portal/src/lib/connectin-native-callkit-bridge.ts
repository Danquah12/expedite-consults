/**
 * ConnectLn Native CallKit (iOS PushKit) & Android Telecom ConnectionService Bridge
 * ---------------------------------------------------------------------------------
 * - On Web / Installed PWA (`https://conectln.com`): Uses `public/sw.js` + RFC 8291 VAPID Web Push
 *   to wake up the phone/desktop and display Answer / Decline call notifications even when minimized.
 * - IMPORTANT: `Notification.requestPermission()` is invoked SYNCHRONOUSLY before any `await`
 *   so Chrome, Edge, Android, and iOS never drop the transient user-gesture activation token.
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

export async function reportIncomingCallToNativeOS(
  payload: NativeIncomingCallPayload
): Promise<boolean> {
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
  const rawData =
    typeof window !== "undefined"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("binary")
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

let armListenerInstalled = false

/**
 * Zero-step call arming: piggybacks on the FIRST click anywhere on login / registration / app
 * (browsers only allow permission prompts inside a user gesture). Once granted, every later
 * visit auto-registers this device for call push, so calls pop up with no "Activate" step.
 */
export function armCallNotificationsOnFirstGesture(): () => void {
  if (typeof window === "undefined" || armListenerInstalled) return () => {}
  if (!("Notification" in window) || Notification.permission !== "default") return () => {}
  armListenerInstalled = true
  const handler = () => {
    window.removeEventListener("click", handler, true)
    window.removeEventListener("keydown", handler, true)
    armListenerInstalled = false
    // Synchronous call inside the gesture — never await before this.
    Notification.requestPermission()
      .then(() => {
        try {
          window.dispatchEvent(new Event("connectln_notification_permission_changed"))
        } catch {}
      })
      .catch(() => {})
  }
  window.addEventListener("click", handler, true)
  window.addEventListener("keydown", handler, true)
  return () => {
    window.removeEventListener("click", handler, true)
    window.removeEventListener("keydown", handler, true)
    armListenerInstalled = false
  }
}

export async function registerConnectLnPushSubscription(
  vapidPublicKey: string
): Promise<PushSubscriptionJSON | null> {
  if (typeof window === "undefined") return null

  try {
    // CRITICAL: Request Notification permission SYNCHRONOUSLY FIRST before ANY `await`
    // so mobile Chrome, Edge, and Safari preserve the user-gesture activation token!
    if ("Notification" in window) {
      let permission = Notification.permission
      if (permission === "default") {
        permission = await Notification.requestPermission()
      }
      if (permission !== "granted") {
        return null
      }
    } else {
      return null
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null
    }

    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    const readyReg = await navigator.serviceWorker.ready

    let existing = await readyReg.pushManager.getSubscription()
    if (existing && vapidPublicKey) {
      // Verify the existing subscription's VAPID key matches our current server VAPID key
      const expectedKey = urlBase64ToUint8Array(vapidPublicKey)
      const currentKeyBuf = existing.options?.applicationServerKey
      if (currentKeyBuf) {
        const currentKey = new Uint8Array(currentKeyBuf)
        const mismatch =
          currentKey.length !== expectedKey.length ||
          currentKey.some((b, idx) => b !== expectedKey[idx])
        if (mismatch) {
          await existing.unsubscribe().catch(() => {})
          existing = null
        }
      }
    }

    if (!existing && vapidPublicKey) {
      const appServerKey = urlBase64ToUint8Array(vapidPublicKey)
      existing = await (readyReg || registration).pushManager.subscribe({
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
