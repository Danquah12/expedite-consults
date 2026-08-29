import type { MobileFinding, MobileApp, ScanSummary } from "@/types/mobile";

export const SCAN_SUMMARY: ScanSummary = {
  apps: 6, criticalCount: 6, highCount: 9, mediumCount: 12, totalFindings: 27, avgRiskScore: 78,
};

export const APPS: MobileApp[] = [
  { id: "app-1", name: "ACME Banking",   platform: "Both",         version: "4.2.1", bundleId: "com.acme.banking",  findings: 7, riskScore: 88 },
  { id: "app-2", name: "ACME Shopping",  platform: "React Native", version: "2.8.0", bundleId: "com.acme.shopping", findings: 6, riskScore: 72 },
  { id: "app-3", name: "ACME Health",    platform: "Flutter",      version: "1.5.3", bundleId: "com.acme.health",   findings: 4, riskScore: 55 },
  { id: "app-4", name: "InjuredAndroid", platform: "Android",      version: "1.0.0", bundleId: "b3nac.injuredandroid", findings: 5, riskScore: 92 },
  { id: "app-5", name: "Nike Sports iOS", platform: "iOS",          version: "22.4.1", bundleId: "com.nike.sport",   findings: 3, riskScore: 68 },
  { id: "app-6", name: "Zaxby's Rewards", platform: "Android",      version: "3.1.2", bundleId: "com.zaxbys.rewards", findings: 2, riskScore: 64 },
];

export const FINDINGS: MobileFinding[] = [
  {
    id: "MOB-001", title: "Hardcoded AWS Production API Keys in Android APK",
    severity: "Critical", category: "Code Quality", platform: "Android", status: "Open",
    appId: "com.acme.banking", appVersion: "4.2.1",
    file: "classes.dex → com/acme/banking/utils/AwsHelper.java", line: 23,
    description: "The production AWS access key and secret key are hardcoded in the APK source. Any attacker downloading the app from the Google Play Store can run jadx or strings on classes.dex and extract these credentials in seconds.",
    impact: "Full AWS account compromise. Attacker can access S3 buckets containing customer KYC identity documents, financial statements, and DynamoDB databases.",
    codeExample: `// Decompiled from classes.dex via jadx
public class AwsHelper {
    private static final String AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    private static final String AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
    private static final String S3_BUCKET = "acme-banking-prod-documents";

    public AmazonS3 getS3Client() {
        BasicAWSCredentials creds = new BasicAWSCredentials(
            AWS_ACCESS_KEY, AWS_SECRET_KEY  // CRITICAL: Hardcoded AWS root keys!
        );
        return AmazonS3ClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(creds))
            .build();
    }
}`,
    codeFix: `public class AwsHelper {
    public AmazonS3 getS3Client() {
        // Use AWS STS / Cognito federated short-lived session tokens
        String sessionToken = SecureTokenManager.getFederatedSessionToken();
        AWSSessionCredentials creds = new BasicSessionCredentials(
            sessionToken.getAccessKeyId(),
            sessionToken.getSecretAccessKey(),
            sessionToken.getSessionToken()
        );
        return AmazonS3ClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(creds))
            .build();
    }
}`,
    remediation: "Immediately revoke and rotate the exposed AWS IAM credentials. Migrate mobile client authentication to AWS Cognito Identity Pools with IAM roles granting least-privilege short-lived STS tokens.",
    owaspRef: "MASVS-CODE-2", cweId: "CWE-798", detectedAt: "2026-08-20", owner: "Mobile Team",
  },
  {
    id: "MOB-002", title: "Public Unauthenticated Firebase Database URL",
    severity: "Critical", category: "Data Storage", platform: "Android", status: "Open",
    appId: "b3nac.injuredandroid", appVersion: "1.0.0",
    file: "res/values/strings.xml → firebase_database_url", line: 14,
    description: "The Firebase Realtime Database URL is embedded with default '.read: true, .write: true' security rules. Appending '.json' allows unauthenticated public read and write access to all stored user records.",
    impact: "Unauthenticated remote database dump and arbitrary data overwrite. Attackers can wipe or exfiltrate all user profile data, hashed passwords, and session records.",
    codeExample: `<!-- res/values/strings.xml -->
<resources>
    <string name="firebase_database_url">https://injured-android-default-rtdb.firebaseio.com/</string>
</resources>

// PoC Exploit via cURL:
// curl https://injured-android-default-rtdb.firebaseio.com/users.json`,
    codeFix: `// Firebase Security Rules (firebase.json)
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}`,
    remediation: "Deploy strict Firebase Realtime Database and Cloud Firestore security rules requiring authenticated UID verification for all read and write operations.",
    owaspRef: "MASVS-STORAGE-1", cweId: "CWE-284", detectedAt: "2026-08-21", owner: "Backend API Team",
  },
  {
    id: "MOB-003", title: "SQLite Database Stored Unencrypted with User PII",
    severity: "Critical", category: "Data Storage", platform: "Android", status: "Open",
    appId: "com.acme.banking", appVersion: "4.2.1",
    file: "/data/data/com.acme.banking/databases/acme_banking.db",
    description: "The app stores a SQLite database in internal storage containing user transaction records, account numbers, and PII without encryption. On rooted devices or via backup extraction, this file is directly accessible.",
    impact: "Full financial transaction logs and PII exposed on rooted devices or physical acquisition. Violates PCI-DSS Requirement 3.4 and GDPR Article 32.",
    codeExample: `public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "acme_banking.db";

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE transactions (" +
            "id INTEGER PRIMARY KEY, " +
            "account_number TEXT, " +   // Plaintext account number
            "ssn_fragment TEXT, " +      // Plaintext SSN last 4
            "amount REAL, " +
            "recipient TEXT" +
        ")");
    }
}`,
    codeFix: `import net.sqlcipher.database.SQLiteDatabase;
import net.sqlcipher.database.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    public SQLiteDatabase getEncryptedDatabase(Context ctx) {
        SQLiteDatabase.loadLibs(ctx);
        byte[] key = AndroidKeyStoreHelper.getDatabaseEncryptionKey();
        return getWritableDatabase(key); // AES-256 encrypted via SQLCipher
    }
}`,
    remediation: "Adopt SQLCipher for Android or Room Database with SQLCipher support, generating an AES-256 key protected inside the Android Keystore (KeyStore.getInstance('AndroidKeyStore')).",
    owaspRef: "MASVS-STORAGE-1", cweId: "CWE-312", detectedAt: "2026-08-19", owner: "Mobile Team",
  },
  {
    id: "MOB-004", title: "SSL / TLS Certificate Pinning Not Implemented",
    severity: "Critical", category: "Network", platform: "Both", status: "Open",
    appId: "com.acme.banking", appVersion: "4.2.1",
    file: "NetworkClient.kt", line: 45,
    description: "The app does not implement certificate or public key pinning. An attacker performing a Man-in-the-Middle (MITM) attack using tools like Aegis Exploit Prober or Proxyman with a custom CA cert can inspect and modify all API traffic.",
    impact: "Interception of session tokens, authentication credentials, wire transfer requests, and API responses in plaintext over public Wi-Fi or compromised routers.",
    codeExample: `// OkHttp client — no certificate pinning
class NetworkClient {
    fun buildClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            // Missing CertificatePinner!
            .build()
    }
}`,
    codeFix: `class NetworkClient {
    fun buildClient(): OkHttpClient {
        val pinner = CertificatePinner.Builder()
            .add("api.acme-banking.com", "sha256/k2v657xUM4MpNGnqw5nYKI6Ygl1LfTXYydvqw5YyNxE=")
            .add("api.acme-banking.com", "sha256/WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18=") // Backup PIN
            .build()

        return OkHttpClient.Builder()
            .certificatePinner(pinner)
            .build()
    }
}`,
    remediation: "Configure OkHttp CertificatePinner on Android and NSPinnedDomains in Info.plist for iOS. Provide at least one primary and one backup public key hash to prevent denial of service upon certificate rotation.",
    owaspRef: "MASVS-NETWORK-2", cweId: "CWE-295", detectedAt: "2026-08-18", owner: "Mobile Team",
  },
  {
    id: "MOB-005", title: "Exported Activity with Intent Injection & Path Traversal",
    severity: "High", category: "Permissions", platform: "Android", status: "Open",
    appId: "b3nac.injuredandroid", appVersion: "1.0.0",
    file: "AndroidManifest.xml → .DisplayPostActivity", line: 32,
    description: "The activity 'DisplayPostActivity' is declared with android:exported='true' and contains an intent filter that processes incoming URI intent parameters directly into a WebView loadUrl() without validation.",
    impact: "Arbitrary local file inclusion (file:///data/data/...) and XSS in WebViews triggered by any third-party app installed on the device.",
    codeExample: `<!-- AndroidManifest.xml -->
<activity 
    android:name=".DisplayPostActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="injuredandroid" android:host="post" />
    </intent-filter>
</activity>

// DisplayPostActivity.kt:
val uri = intent.data
webView.loadUrl(uri.getQueryParameter("url")) // Untrusted URL loaded!`,
    codeFix: `// DisplayPostActivity.kt
if (!isTrustedDomain(uri)) {
    finish()
    return
}
webView.settings.allowFileAccess = false
webView.settings.allowContentAccess = false`,
    remediation: "Set android:exported='false' unless external app interaction is required. If exported, strictly sanitize all intent extras and disable WebView file access permissions.",
    owaspRef: "MASVS-PLATFORM-1", cweId: "CWE-926", detectedAt: "2026-08-22", owner: "Mobile Team",
  },
  {
    id: "MOB-006", title: "Insecure App Transport Security (ATS) Exception in iOS",
    severity: "High", category: "Network", platform: "iOS", status: "Open",
    appId: "com.nike.sport", appVersion: "22.4.1",
    file: "Info.plist → NSAppTransportSecurity", line: 18,
    description: "The iOS application declares NSAllowsArbitraryLoads = true in Info.plist, completely disabling Apple's App Transport Security (ATS) enforcement and allowing cleartext HTTP traffic.",
    impact: "Network eavesdropping and credential leakage across unencrypted HTTP endpoints. Fails Apple App Store review guidelines and OWASP MASVS-NETWORK-1.",
    codeExample: `<!-- Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/> <!-- Disables all iOS ATS security controls -->
</dict>`,
    codeFix: `<!-- Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>legacy-analytics.partner.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>`,
    remediation: "Remove NSAllowsArbitraryLoads=true. Upgrade all backend API endpoints to HTTPS with TLS 1.3 and modern cipher suites.",
    owaspRef: "MASVS-NETWORK-1", cweId: "CWE-319", detectedAt: "2026-08-20", owner: "iOS Team",
  },
  {
    id: "MOB-007", title: "Biometric Authentication Bypass via Frida Runtime Hooking",
    severity: "High", category: "Authentication", platform: "Both", status: "Open",
    appId: "com.acme.banking", appVersion: "4.2.1",
    file: "BiometricAuthManager.kt", line: 62,
    description: "Biometric authentication relies solely on a client-side boolean return value from BiometricPrompt.AuthenticationCallback.onAuthenticationSucceeded(). An attacker using Frida or Objection can hook this method and force it to return success without presenting a fingerprint.",
    impact: "Complete authentication bypass on passcode-locked or fingerprint-protected banking screens.",
    codeExample: `// Frida Hook PoC:
Java.perform(function() {
    var BiometricCallback = Java.use('androidx.biometric.BiometricPrompt$AuthenticationCallback');
    BiometricCallback.onAuthenticationFailed.implementation = function() {
        console.log('[+] Bypassing Biometric Auth...');
        this.onAuthenticationSucceeded(null); // Force authentication!
    };
});`,
    codeFix: `// Use CryptoObject bound to Android KeyStore
val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
val cipher = Cipher.getInstance("AES/GCM/NoPadding")
val secretKey = keyStore.getKey(KEY_NAME, null) as SecretKey
cipher.init(Cipher.ENCRYPT_MODE, secretKey)

val cryptoObject = BiometricPrompt.CryptoObject(cipher)
biometricPrompt.authenticate(promptInfo, cryptoObject) // Server validates signature!`,
    remediation: "Bind biometric authentication to a KeyStore cryptographic key using BiometricPrompt.CryptoObject. The server must verify a signed cryptographic challenge, ensuring the client cannot forge authentication via runtime hooking.",
    owaspRef: "MASVS-AUTH-1", cweId: "CWE-287", detectedAt: "2026-08-19", owner: "Mobile Team",
  },
  {
    id: "MOB-008", title: "Plaintext Token Storage in Android SharedPreferences",
    severity: "High", category: "Data Storage", platform: "Android", status: "Open",
    appId: "com.zaxbys.rewards", appVersion: "3.1.2",
    file: "SessionManager.java", line: 38,
    description: "OAuth 2.0 refresh tokens and JWT access tokens are stored in world-readable / unencrypted XML files under /data/data/com.zaxbys.rewards/shared_prefs/user_session.xml.",
    impact: "Permanent session hijacking if the device is rooted, inspected via ADB backup, or compromised by malicious malware.",
    codeExample: `SharedPreferences prefs = ctx.getSharedPreferences("user_session", Context.MODE_PRIVATE);
prefs.edit().putString("auth_token", jwtToken).apply(); // Plaintext XML storage!`,
    codeFix: `MasterKey masterKey = new MasterKey.Builder(ctx)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build();

SharedPreferences securePrefs = EncryptedSharedPreferences.create(
    ctx, "user_session_encrypted", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);
securePrefs.edit().putString("auth_token", jwtToken).apply();`,
    remediation: "Use Android Jetpack Security EncryptedSharedPreferences backed by hardware Keystore keys.",
    owaspRef: "MASVS-STORAGE-1", cweId: "CWE-312", detectedAt: "2026-08-21", owner: "Mobile Team",
  },
  {
    id: "MOB-009", title: "Sensitive Credit Card & CVV Data Logged to Logcat",
    severity: "Medium", category: "Code Quality", platform: "Android", status: "Open",
    appId: "com.acme.shopping", appVersion: "2.8.0",
    file: "CheckoutActivity.kt", line: 134,
    description: "The payment checkout handler logs full credit card numbers, expiration dates, and billing addresses to Android Logcat using Log.d() in release builds.",
    impact: "Other apps with READ_LOGS permission on older Android versions or any USB debugging session can siphon customer payment details.",
    codeExample: `Log.d("PAYMENT_DEBUG", "Processing card: " + cardNumber + " CVV: " + cvv);`,
    codeFix: `if (BuildConfig.DEBUG) {
    Timber.d("Processing payment transaction for order #%s", orderId);
    // Never log PCI cardholder data!
}`,
    remediation: "Use ProGuard / R8 rules (assumenosideeffects class android.util.Log { *; }) to strip all debug logging in release builds.",
    owaspRef: "MASVS-CODE-3", cweId: "CWE-532", detectedAt: "2026-08-20", owner: "Mobile Team",
  }
];
