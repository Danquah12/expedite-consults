"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  FileCode, Folder, FolderOpen, FileText, ShieldAlert, AlertTriangle, 
  Search, CheckCircle2, ChevronRight, Copy, Check, Terminal, ExternalLink, Smartphone 
} from "lucide-react";

interface AppFile {
  path: string;
  name: string;
  type: "manifest" | "java" | "xml" | "plist" | "kt";
  findingsCount: number;
  content: string;
  annotations?: {
    line: number;
    severity: "Critical" | "High" | "Medium";
    cwe: string;
    masvs: string;
    msg: string;
  }[];
}

interface PackageStructure {
  pkgName: string;
  platform: "Android (APK)" | "iOS (IPA)";
  files: AppFile[];
}

const DECOMPILED_PACKAGES: PackageStructure[] = [
  {
    pkgName: "com.acme.banking.apk (v4.2.1)",
    platform: "Android (APK)",
    files: [
      {
        path: "AndroidManifest.xml",
        name: "AndroidManifest.xml",
        type: "manifest",
        findingsCount: 2,
        annotations: [
          { line: 9, severity: "High", cwe: "CWE-926", masvs: "MASVS-PLATFORM-1", msg: "Exported Activity 'DisplayPostActivity' with no permission requirement." },
          { line: 16, severity: "Medium", cwe: "CWE-276", masvs: "MASVS-PLATFORM-2", msg: "android:allowBackup='true' permits unauthorized adb backup extraction." }
        ],
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.acme.banking">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:networkSecurityConfig="@xml/network_security_config"
        android:theme="@style/AppTheme">

        <activity 
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity 
            android:name=".DisplayPostActivity"
            android:exported="true"> <!-- VULNERABILITY: Exported with no permission gate -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <data android:scheme="acme" android:host="view" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".PushNotificationReceiver"
            android:exported="false" />

    </application>
</manifest>`
      },
      {
        path: "com/acme/banking/utils/AwsHelper.java",
        name: "AwsHelper.java",
        type: "java",
        findingsCount: 1,
        annotations: [
          { line: 6, severity: "Critical", cwe: "CWE-798", masvs: "MASVS-CODE-2", msg: "Hardcoded production AWS Access Key & Secret Key." }
        ],
        content: `package com.acme.banking.utils;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

public class AwsHelper {
    // CRITICAL: Hardcoded AWS Credentials in Production Binary
    private static final String AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    private static final String AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
    private static final String S3_BUCKET = "acme-banking-prod-documents";

    public static AmazonS3 getS3Client() {
        BasicAWSCredentials creds = new BasicAWSCredentials(
            AWS_ACCESS_KEY, AWS_SECRET_KEY
        );
        return AmazonS3ClientBuilder.standard()
            .withCredentials(new AWSStaticCredentialsProvider(creds))
            .build();
    }
}`
      },
      {
        path: "res/xml/network_security_config.xml",
        name: "network_security_config.xml",
        type: "xml",
        findingsCount: 1,
        annotations: [
          { line: 6, severity: "High", cwe: "CWE-295", masvs: "MASVS-NETWORK-1", msg: "User installed certificates trusted for all debug and release builds." }
        ],
        content: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <!-- VULNERABILITY: Allows user CA (Burp Suite proxy) in production builds -->
            <certificates src="user" /> 
        </trust-anchors>
    </base-config>
</network-security-config>`
      }
    ]
  },
  {
    pkgName: "b3nac.injuredandroid.apk (v1.0.0)",
    platform: "Android (APK)",
    files: [
      {
        path: "res/values/strings.xml",
        name: "strings.xml",
        type: "xml",
        findingsCount: 2,
        annotations: [
          { line: 5, severity: "Critical", cwe: "CWE-284", masvs: "MASVS-STORAGE-1", msg: "Exposed Firebase Realtime Database URL with unauthenticated read/write rules." },
          { line: 9, severity: "High", cwe: "CWE-798", masvs: "MASVS-CODE-2", msg: "Base64 encoded secret CTF flag stored in plaintext resources." }
        ],
        content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">InjuredAndroid</string>
    
    <!-- Flag 4: Open Firebase Database -->
    <string name="firebase_database_url">https://injured-android-default-rtdb.firebaseio.com/</string>
    
    <!-- Flag 2: Hardcoded Base64 Secret -->
    <string name="flag_two_key">TkZTQ3twcjB0ZWN0X3lvdXJfc3RyMW5nc30=</string>
    
    <string name="aws_s3_public_bucket">https://injuredandroid-test-assets.s3.amazonaws.com/</string>
</resources>`
      },
      {
        path: "b3nac/injuredandroid/FlagThreeActivity.java",
        name: "FlagThreeActivity.java",
        type: "java",
        findingsCount: 1,
        annotations: [
          { line: 12, severity: "High", cwe: "CWE-798", masvs: "MASVS-RESILIENCE-1", msg: "Hardcoded secret string passed into Native C library (libflag.so)." }
        ],
        content: `package b3nac.injuredandroid;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class FlagThreeActivity extends AppCompatActivity {
    static {
        System.loadLibrary("native-lib");
    }

    public native String getFlagNative();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_flag_three);
        
        // Native function called without anti-tamper or integrity check
        String flag = getFlagNative();
    }
}`
      }
    ]
  },
  {
    pkgName: "com.nike.sport.ipa (v22.4.1)",
    platform: "iOS (IPA)",
    files: [
      {
        path: "Payload/NikeApp.app/Info.plist",
        name: "Info.plist",
        type: "plist",
        findingsCount: 2,
        annotations: [
          { line: 8, severity: "High", cwe: "CWE-319", masvs: "MASVS-NETWORK-1", msg: "NSAllowsArbitraryLoads=true disables App Transport Security." },
          { line: 14, severity: "Medium", cwe: "CWE-939", masvs: "MASVS-PLATFORM-1", msg: "Custom URL Scheme 'nike://' declared without origin validation." }
        ],
        content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.nike.sport</string>
    
    <key>NSAppTransportSecurity</key>
    <dict>
        <!-- VULNERABILITY: Global ATS exception permitting cleartext HTTP -->
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>

    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>nike</string>
            </array>
        </dict>
    </array>
</dict>
</plist>`
      }
    ]
  }
];

export default function DecompilerPage() {
  const [selectedPkg, setSelectedPkg] = useState<PackageStructure>(DECOMPILED_PACKAGES[0]);
  const [selectedFile, setSelectedFile] = useState<AppFile>(DECOMPILED_PACKAGES[0].files[0]);
  const [searchFilter, setSearchFilter] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);

  const handleSelectPackage = (pkg: PackageStructure) => {
    setSelectedPkg(pkg);
    setSelectedFile(pkg.files[0]);
    setSelectedAnnotation(null);
  };

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

  const handleCopyCode = () => {
    safeCopy(selectedFile.content, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const lines = selectedFile.content.split("\n");

  return (
    <div className="min-h-screen flex flex-col bg-[#0a060d] text-white">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-2">
              <FileCode className="w-3.5 h-3.5" /> Static APK &amp; IPA Decompiler
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Bytecode &amp; Manifest Inspector
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Decompile DEX with JADX, unpack APK resources with Apktool, and inspect Info.plist / AndroidManifest.xml for cloud key exposures.
            </p>
          </div>

          {/* Package Selector */}
          <div className="flex items-center gap-2 bg-[#140c19] border border-slate-800 rounded-xl p-1.5">
            {DECOMPILED_PACKAGES.map((pkg) => (
              <button
                key={pkg.pkgName}
                onClick={() => handleSelectPackage(pkg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPkg.pkgName === pkg.pkgName
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {pkg.pkgName.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree Explorer (Left Column) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-pink-400" /> Package Tree
                </span>
                <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded font-mono">
                  {selectedPkg.platform}
                </span>
              </div>

              <div className="space-y-1.5">
                {selectedPkg.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFile(file);
                      setSelectedAnnotation(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      selectedFile.path === file.path
                        ? "bg-pink-950/30 border-pink-500/60 shadow-md shadow-pink-950/30"
                        : "bg-[#0a060e] border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className={`w-4 h-4 shrink-0 ${
                        file.type === "manifest" ? "text-amber-400" : file.type === "java" ? "text-sky-400" : "text-purple-400"
                      }`} />
                      <div className="truncate text-xs font-mono font-medium text-slate-200">
                        {file.path}
                      </div>
                    </div>
                    {file.findingsCount > 0 && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
                        {file.findingsCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud & Secret Exposure Scanner Summary */}
            <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> High-Risk Key Exposures
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> AWS Access Key (AKIA...)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Found in <code className="text-pink-300">AwsHelper.java:7</code>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Firebase Open Database
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Found in <code className="text-pink-300">strings.xml:5</code> (.json open rule)
                  </div>
                </div>
              </div>
            </div>

            {/* Annotation Inspector Detail */}
            {selectedAnnotation && (
              <div className="bg-[#160d1d] border border-pink-500/40 rounded-2xl p-4 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedAnnotation.severity === "Critical" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}>
                    {selectedAnnotation.severity}
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">{selectedAnnotation.masvs}</span>
                </div>
                <div className="text-xs font-bold text-white">Line {selectedAnnotation.line}: {selectedAnnotation.cwe}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedAnnotation.msg}</p>
              </div>
            )}
          </div>

          {/* Code Viewer Panel (Right Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#120b17] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#180f20] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({lines.length} lines)</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Code Lines with Interactive Vulnerability Gutter */}
              <div className="p-4 bg-[#060309] max-h-[580px] overflow-y-auto font-mono text-xs leading-relaxed">
                {lines.map((lineText, idx) => {
                  const lineNum = idx + 1;
                  const annot = selectedFile.annotations?.find(a => a.line === lineNum);

                  return (
                    <div 
                      key={idx}
                      onClick={() => annot && setSelectedAnnotation(annot)}
                      className={`group flex items-start gap-4 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        annot 
                          ? annot.severity === "Critical"
                            ? "bg-rose-950/40 border-l-2 border-rose-500 hover:bg-rose-900/30"
                            : "bg-amber-950/40 border-l-2 border-amber-500 hover:bg-amber-900/30"
                          : "hover:bg-slate-900/40"
                      }`}
                    >
                      <span className={`w-8 shrink-0 text-right text-[11px] select-none font-mono ${
                        annot ? "text-pink-400 font-bold" : "text-slate-600 group-hover:text-slate-400"
                      }`}>
                        {lineNum}
                      </span>

                      <div className="flex-1 whitespace-pre overflow-x-auto text-slate-200">
                        {lineText}
                      </div>

                      {annot && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {annot.cwe}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
