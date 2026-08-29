"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, FileText, 
  Download, Filter, ArrowUpRight, BarChart3, RefreshCw, Smartphone 
} from "lucide-react";

interface MasvsRequirement {
  id: string;
  domain: string;
  level: "L1" | "L2" | "R";
  title: string;
  description: string;
  defaultStatus: "PASS" | "FAIL" | "WARNING" | "NA";
  cwe: string;
  mastgTest: string;
}

const MASVS_DOMAINS = [
  { id: "ALL", name: "All Domains", count: 14 },
  { id: "MASVS-STORAGE", name: "MASVS-STORAGE", count: 2 },
  { id: "MASVS-CRYPTO", name: "MASVS-CRYPTO", count: 2 },
  { id: "MASVS-AUTH", name: "MASVS-AUTH", count: 2 },
  { id: "MASVS-NETWORK", name: "MASVS-NETWORK", count: 2 },
  { id: "MASVS-PLATFORM", name: "MASVS-PLATFORM", count: 2 },
  { id: "MASVS-CODE", name: "MASVS-CODE", count: 2 },
  { id: "MASVS-RESILIENCE", name: "MASVS-RESILIENCE", count: 2 }
];

const REQUIREMENTS: MasvsRequirement[] = [
  {
    id: "MASVS-STORAGE-1",
    domain: "MASVS-STORAGE",
    level: "L1",
    title: "Secure Data Storage & Encryption at Rest",
    description: "The app encrypts sensitive data stored on client devices using platform-provided Keystore / Keychain APIs with AES-GCM.",
    defaultStatus: "FAIL",
    cwe: "CWE-312",
    mastgTest: "MASTG-TEST-0001 (Testing Local Storage for Sensitive Data)"
  },
  {
    id: "MASVS-STORAGE-2",
    domain: "MASVS-STORAGE",
    level: "L1",
    title: "Memory & Cache Exposure Prevention",
    description: "No sensitive data is written to application logs, system clipboard, or temporary cache files.",
    defaultStatus: "WARNING",
    cwe: "CWE-532",
    mastgTest: "MASTG-TEST-0003 (Testing App Logs for Sensitive Data)"
  },
  {
    id: "MASVS-CRYPTO-1",
    domain: "MASVS-CRYPTO",
    level: "L1",
    title: "Strong Cryptographic Primitives",
    description: "The app relies exclusively on industry standard algorithms (AES-256, RSA-2048+, SHA-256) with secure random IVs.",
    defaultStatus: "PASS",
    cwe: "CWE-327",
    mastgTest: "MASTG-TEST-0012 (Testing for Insecure Cryptographic Algorithms)"
  },
  {
    id: "MASVS-CRYPTO-2",
    domain: "MASVS-CRYPTO",
    level: "L2",
    title: "Hardware-Backed Key Management",
    description: "Cryptographic keys are generated and stored inside the Android Keystore StrongBox or Apple Secure Enclave.",
    defaultStatus: "PASS",
    cwe: "CWE-320",
    mastgTest: "MASTG-TEST-0014 (Testing Key Management)"
  },
  {
    id: "MASVS-AUTH-1",
    domain: "MASVS-AUTH",
    level: "L1",
    title: "Cryptographically Bound Biometric Auth",
    description: "Local biometric authentication requires server-validated crypto challenges using CryptoObject / SecAccessControl.",
    defaultStatus: "FAIL",
    cwe: "CWE-287",
    mastgTest: "MASTG-TEST-0020 (Testing Biometric Authentication Bypass)"
  },
  {
    id: "MASVS-AUTH-2",
    domain: "MASVS-AUTH",
    level: "L1",
    title: "Session Termination & Token Invalidation",
    description: "Authentication tokens have appropriate short lifetimes and are revoked on the backend upon logout or timeout.",
    defaultStatus: "PASS",
    cwe: "CWE-613",
    mastgTest: "MASTG-TEST-0022 (Testing Session Management)"
  },
  {
    id: "MASVS-NETWORK-1",
    domain: "MASVS-NETWORK",
    level: "L1",
    title: "Enforced TLS / HTTPS Architecture",
    description: "All network traffic is encrypted via TLS 1.3 with cleartext HTTP strictly prohibited in NetworkSecurityConfig and ATS.",
    defaultStatus: "WARNING",
    cwe: "CWE-319",
    mastgTest: "MASTG-TEST-0030 (Testing for Cleartext Traffic)"
  },
  {
    id: "MASVS-NETWORK-2",
    domain: "MASVS-NETWORK",
    level: "L2",
    title: "Certificate & Public Key Pinning",
    description: "The app enforces custom X.509 certificate pinning with backup pin sets to prevent MITM interception.",
    defaultStatus: "FAIL",
    cwe: "CWE-295",
    mastgTest: "MASTG-TEST-0032 (Testing Custom Certificate Pinning)"
  },
  {
    id: "MASVS-PLATFORM-1",
    domain: "MASVS-PLATFORM",
    level: "L1",
    title: "Secure IPC & Component Export Controls",
    description: "All Android Activities, Services, and Receivers set android:exported='false' unless explicitly required with signature permissions.",
    defaultStatus: "FAIL",
    cwe: "CWE-926",
    mastgTest: "MASTG-TEST-0040 (Testing Android IPC Mechanisms)"
  },
  {
    id: "MASVS-PLATFORM-2",
    domain: "MASVS-PLATFORM",
    level: "L1",
    title: "Deep Link & URL Scheme Validation",
    description: "App links and custom URL schemes sanitize all incoming query parameters and reject untrusted domain redirects.",
    defaultStatus: "PASS",
    cwe: "CWE-939",
    mastgTest: "MASTG-TEST-0042 (Testing Custom URL Schemes)"
  },
  {
    id: "MASVS-CODE-1",
    domain: "MASVS-CODE",
    level: "L1",
    title: "Compiler Hardening & Obfuscation",
    description: "Release builds enable ProGuard / R8 bytecode shrinking and symbol obfuscation to hinder reverse engineering.",
    defaultStatus: "PASS",
    cwe: "CWE-693",
    mastgTest: "MASTG-TEST-0050 (Testing Code Obfuscation)"
  },
  {
    id: "MASVS-CODE-2",
    domain: "MASVS-CODE",
    level: "L1",
    title: "Zero Hardcoded Secrets or Cloud Keys",
    description: "No private API keys, AWS credentials, or backend passwords are embedded in decompilable bytecode or strings.xml.",
    defaultStatus: "FAIL",
    cwe: "CWE-798",
    mastgTest: "MASTG-TEST-0052 (Searching for Hardcoded Secrets)"
  },
  {
    id: "MASVS-RESILIENCE-1",
    domain: "MASVS-RESILIENCE",
    level: "R",
    title: "Root & Jailbreak Detection",
    description: "The app detects su binaries, test-keys, Magisk, and Cydia substrates and terminates execution on compromised devices.",
    defaultStatus: "WARNING",
    cwe: "CWE-919",
    mastgTest: "MASTG-TEST-0060 (Testing Root Detection Bypass)"
  },
  {
    id: "MASVS-RESILIENCE-2",
    domain: "MASVS-RESILIENCE",
    level: "R",
    title: "Anti-Hooking & Frida Detection",
    description: "The application detects ptrace attachment, memory injection, and active Frida server sockets.",
    defaultStatus: "FAIL",
    cwe: "CWE-920",
    mastgTest: "MASTG-TEST-0062 (Testing Frida & Hooking Detection)"
  }
];

export default function MasvsAuditPage() {
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [statuses, setStatuses] = useState<Record<string, "PASS" | "FAIL" | "WARNING" | "NA">>(() => {
    const initial: Record<string, "PASS" | "FAIL" | "WARNING" | "NA"> = {};
    REQUIREMENTS.forEach(r => { initial[r.id] = r.defaultStatus; });
    return initial;
  });

  const handleStatusChange = (id: string, newStatus: "PASS" | "FAIL" | "WARNING" | "NA") => {
    setStatuses(prev => ({ ...prev, [id]: newStatus }));
  };

  const filteredRequirements = selectedDomain === "ALL" 
    ? REQUIREMENTS 
    : REQUIREMENTS.filter(r => r.domain === selectedDomain);

  // Calculations
  const passCount = Object.values(statuses).filter(s => s === "PASS").length;
  const failCount = Object.values(statuses).filter(s => s === "FAIL").length;
  const warnCount = Object.values(statuses).filter(s => s === "WARNING").length;
  const totalEvaluated = passCount + failCount + warnCount;
  const complianceScore = Math.round((passCount / (totalEvaluated || 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a060d] text-white">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> OWASP Mobile Application Security Verification Standard v2.1
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              OWASP MASVS 2.1 Audit &amp; Compliance Matrix
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Verify your mobile applications against all 7 official OWASP MASVS security domains and MASTG testing checklists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const reportContent = `OWASP MASVS 2.1 Audit Report\nScore: ${complianceScore}%\nPassed: ${passCount} | Failed: ${failCount} | Warnings: ${warnCount}\n\n` +
                  REQUIREMENTS.map(r => `[${statuses[r.id]}] ${r.id} - ${r.title} (${r.cwe})`).join("\n");
                const blob = new Blob([reportContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "OWASP_MASVS_Audit_Report.txt";
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30 transition-all"
            >
              <Download className="w-4 h-4" /> Export Audit Report
            </button>
          </div>
        </div>

        {/* Score Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">MASVS Compliance Score</div>
            <div className="text-3xl font-black text-pink-400">{complianceScore}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-emerald-400 h-full rounded-full" style={{ width: `${complianceScore}%` }} />
            </div>
          </div>

          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-emerald-400 font-bold uppercase mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed Controls
            </div>
            <div className="text-3xl font-black text-emerald-400">{passCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Verified compliant with L1/L2</div>
          </div>

          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-rose-400 font-bold uppercase mb-1 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Failed Controls
            </div>
            <div className="text-3xl font-black text-rose-400">{failCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Critical remediations needed</div>
          </div>

          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-amber-400 font-bold uppercase mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Security Warnings
            </div>
            <div className="text-3xl font-black text-amber-400">{warnCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Partial or conditional controls</div>
          </div>
        </div>

        {/* Domain Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
          {MASVS_DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === domain.id
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {domain.name}
            </button>
          ))}
        </div>

        {/* Requirements Table */}
        <div className="bg-[#120b17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80">
            {filteredRequirements.map((req) => {
              const currentStatus = statuses[req.id];
              return (
                <div key={req.id} className="p-5 hover:bg-[#160d1d]/60 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded border border-pink-500/20">
                          {req.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.level === "L1" ? "bg-slate-800 text-slate-300" : req.level === "L2" ? "bg-purple-950 text-purple-300 border border-purple-800" : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}>
                          Level: {req.level}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {req.cwe}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{req.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{req.description}</p>
                      <div className="text-[11px] font-mono text-emerald-400/90 pt-1">
                        📖 {req.mastgTest}
                      </div>
                    </div>

                    {/* Status Pill Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-[#08040b] p-1.5 rounded-xl border border-slate-800">
                      {(["PASS", "FAIL", "WARNING", "NA"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(req.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            currentStatus === st
                              ? st === "PASS"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                                : st === "FAIL"
                                ? "bg-rose-600 text-white shadow-md shadow-rose-600/40"
                                : st === "WARNING"
                                ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                                : "bg-slate-700 text-white"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
