# ConnectLn Android App (WhatsApp-style ringing)

Native wrapper around https://conectln.com/connectin. Incoming calls arrive as FCM high-priority
data messages -> `ConnectLnMessagingService` -> full-screen incoming-call screen + ringtone,
even when the app is closed and the phone is locked. Users install once, sign in, tap Allow once
on Android's system prompt. Nothing else to activate.

## One-time setup (you)
1. https://console.firebase.google.com -> Add project "ConnectLn".
2. Project settings -> Add Android app, package name `com.conectln.app`.
   Download `google-services.json` -> put in `connectln-mobile/android/app/`.
3. Project settings -> Service accounts -> Generate new private key (JSON).
   Add its full JSON as Vercel env var `FIREBASE_SERVICE_ACCOUNT_JSON` (Production), redeploy:
   `vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production --cwd sphera-portal`
4. Install Android Studio. Open `connectln-mobile/android`, let Gradle sync.
5. Build > Build APK(s). Install the APK on your phone (sideload) to test.
   Later: Build > Generate Signed Bundle for Play Store ($25 one-time Play account).

## Android notes
- Android 14+: if the call screen shows only as a heads-up banner on a locked phone, enable
  Settings > Apps > ConnectLn > "Full screen notifications". Play Store calling apps get this
  automatically.
- After editing capacitor.config.json run `npx cap sync android`.
