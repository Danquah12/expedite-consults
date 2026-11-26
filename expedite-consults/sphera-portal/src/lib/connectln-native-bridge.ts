"use client"

/**
 * ConnectLn Native Capacitor & Call Transport Readiness Bridge
 * --------------------------------------------------------------------------
 * Bridges Capacitor PushNotifications (APNs / FCM) inside `connectln-mobile`
 * without affecting standard web browser execution.
 */

export interface NativeAndSfuReadiness {
  isNativeShell: boolean
  platform: "ios" | "android" | "web"
  pushApiSupported: boolean
  serviceWorkerSupported: boolean
  webAuthnSupported: boolean
  webCryptoSupported: boolean
}

export function isNativeMobileApp(): boolean {
  if (typeof window === "undefined") return false
  const cap = (window as any).Capacitor
  if (!cap) return false
  if (typeof cap.isNativePlatform === "function") {
    try {
      return Boolean(cap.isNativePlatform())
    } catch {
      return false
    }
  }
  return Boolean(cap.platform && cap.platform !== "web")
}

export function getMobileAndSfuReadiness(): NativeAndSfuReadiness {
  if (typeof window === "undefined") {
    return {
      isNativeShell: false,
      platform: "web",
      pushApiSupported: false,
      serviceWorkerSupported: false,
      webAuthnSupported: false,
      webCryptoSupported: false,
    }
  }
  const cap = (window as any).Capacitor
  const capPlatform = typeof cap?.getPlatform === "function" ? cap.getPlatform() : cap?.platform
  const platform: "ios" | "android" | "web" =
    capPlatform === "ios" || capPlatform === "android" ? capPlatform : "web"

  return {
    isNativeShell: isNativeMobileApp(),
    platform,
    pushApiSupported: "Notification" in window && "PushManager" in window,
    serviceWorkerSupported: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    webAuthnSupported: typeof window.PublicKeyCredential !== "undefined",
    webCryptoSupported: Boolean(window.crypto?.subtle),
  }
}

let bridgeRegisteredForKey = ""

export async function registerNativePushAndVoipBridge(user?: {
  name?: string
  email?: string
  phone?: string
}): Promise<{ registered: boolean; platform: string }> {
  if (typeof window === "undefined") return { registered: false, platform: "ssr" }
  const cap = (window as any).Capacitor
  if (!cap || !isNativeMobileApp()) {
    return { registered: false, platform: "web" }
  }
  const key = String(user?.email || user?.name || "").trim().toLowerCase()
  if (!key || bridgeRegisteredForKey === key) {
    return { registered: bridgeRegisteredForKey === key, platform: "native" }
  }
  bridgeRegisteredForKey = key

  try {
    const pushPlugin = cap?.Plugins?.PushNotifications
    if (pushPlugin && typeof pushPlugin.requestPermissions === "function") {
      const perm = await pushPlugin.requestPermissions()
      if (perm?.receive === "granted" && typeof pushPlugin.register === "function") {
        pushPlugin.addListener?.("registration", async (tokenEvent: { value?: string }) => {
          const fcmOrApnsToken = String(tokenEvent?.value || "").trim()
          if (!fcmOrApnsToken) return
          try {
            await fetch("/api/connectin/calls/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "register_native_push",
                userName: user?.name || "",
                userEmail: user?.email || "",
                userPhone: user?.phone || "",
                fcmToken: fcmOrApnsToken,
                platform: cap.getPlatform?.() || "android",
              }),
            })
          } catch {}
        })
        await pushPlugin.register()
        return { registered: true, platform: String(cap.getPlatform?.() || "native") }
      }
    }
  } catch {}

  return { registered: false, platform: "native" }
}
