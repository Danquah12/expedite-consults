"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  GraduationCap, BookOpen, CheckCircle2, Circle, Smartphone, 
  Terminal, Shield, Award, ChevronDown, ChevronRight, ExternalLink, Play, Clock 
} from "lucide-react";

interface SyllabusModule {
  id: string;
  title: string;
  duration: string;
  completedPercent: number;
  lectures: { title: string; duration: string; completed: boolean; link?: string }[];
}

const SYLLABUS: SyllabusModule[] = [
  {
    id: "mod-1",
    title: "1. Introduction and Course Resources",
    duration: "25 mins",
    completedPercent: 100,
    lectures: [
      { title: "Course Introduction", duration: "7:25", completed: true },
      { title: "Course Resources & Cheatsheets", duration: "6:52", completed: true },
      { title: "Mobile Pentesting Certification Landscape (PMPA)", duration: "4:37", completed: true },
      { title: "Device Requirements (Physical vs. Emulators)", duration: "4:10", completed: true },
      { title: "Course Discord & Community", duration: "2:04", completed: true }
    ]
  },
  {
    id: "mod-2",
    title: "2. Penetration Testing Process",
    duration: "28 mins",
    completedPercent: 100,
    lectures: [
      { title: "The Penetration Testing Process", duration: "8:16", completed: true },
      { title: "The Mobile Application Penetration Testing Process", duration: "20:26", completed: true }
    ]
  },
  {
    id: "mod-3",
    title: "3. Android Intro and Security Architecture",
    duration: "28 mins",
    completedPercent: 100,
    lectures: [
      { title: "Android Security Architecture (Sandbox, IPC, Binder)", duration: "22:05", completed: true },
      { title: "Application Security and Signing Process (v1/v2/v3 Schemes)", duration: "5:52", completed: true }
    ]
  },
  {
    id: "mod-4",
    title: "4. Android Lab Setup (All Platforms)",
    duration: "52 mins",
    completedPercent: 100,
    lectures: [
      { title: "Windows - JADX-GUI & APKTool Install", duration: "6:00", completed: true },
      { title: "Windows - ADB & Android Studio Setup", duration: "4:48", completed: true },
      { title: "Kali Linux - PimpMyKali, ADB & JADX Setup", duration: "8:05", completed: true },
      { title: "Mac - Brew, JADX, APKTool & Android Studio", duration: "8:51", completed: true },
      { title: "Emulator Setup & Recommendations (Rooted AVD)", duration: "10:38", completed: true },
      { title: "Accessing ADB Shell from a VM / Networked Device", duration: "4:39", completed: true },
      { title: "Physical Device Setup & USB Debugging", duration: "4:50", completed: true }
    ]
  },
  {
    id: "mod-5",
    title: "5. Android Static Analysis",
    duration: "1 hr 25 mins",
    completedPercent: 100,
    lectures: [
      { title: "Pulling an APK From the Google Play Store (gplaycli)", duration: "5:37", completed: true },
      { title: "Intro to InjuredAndroid CTF", duration: "3:14", completed: true },
      { title: "AndroidManifest.xml Inspection (Exported, Permissions)", duration: "9:26", completed: true },
      { title: "Manual Static Analysis with JADX-GUI", duration: "9:50", completed: true },
      { title: "How to Find Hardcoded Strings & API Keys", duration: "11:53", completed: true },
      { title: "InjuredAndroid Static Analysis (Flags 1-4)", duration: "11:59", completed: true },
      { title: "Enumerating AWS Storage Buckets via Static Analysis", duration: "9:05", completed: true },
      { title: "Enumerating Firebase Databases via Static Analysis", duration: "7:25", completed: true },
      { title: "Automated Analysis using MobSF", duration: "20:53", completed: true }
    ]
  },
  {
    id: "mod-6",
    title: "6. Android Dynamic Analysis",
    duration: "1 hr 35 mins",
    completedPercent: 100,
    lectures: [
      { title: "Intro to SSL Pinning & Dynamic Analysis", duration: "9:13", completed: true },
      { title: "Dynamic Analysis using MobSF Dynamic Analyzer", duration: "16:07", completed: true },
      { title: "Burp Suite Install & CA Certificate Injection", duration: "15:47", completed: true },
      { title: "Proxyman Install & HTTPS Interception", duration: "12:41", completed: true },
      { title: "Patching Applications Automatically using Objection", duration: "7:47", completed: true },
      { title: "Patching Applications Manually with APKTool & Frida Gadget", duration: "16:05", completed: true },
      { title: "The Frida Codeshare & Custom Hooking Scripts", duration: "5:23", completed: true }
    ]
  },
  {
    id: "mod-7",
    title: "7. Android Bug Bounty Hunt & Red Teaming",
    duration: "1 hr 18 mins",
    completedPercent: 85,
    lectures: [
      { title: "Bounty Hunt 1 - Joann Fabrics (Deep Link Hijack)", duration: "34:01", completed: true },
      { title: "Bounty Hunt 2 - Zaxby's (Order Price Tampering)", duration: "17:30", completed: true },
      { title: "In-Line Attacks & Backdooring APKs with Metasploit", duration: "18:12", completed: false },
      { title: "The Ghost Framework for Remote ADB Exploitation", duration: "5:07", completed: true }
    ]
  },
  {
    id: "mod-8",
    title: "8. iOS Introduction, Setup & Static Analysis",
    duration: "48 mins",
    completedPercent: 70,
    lectures: [
      { title: "Intro to iOS Security Architecture & Sandbox", duration: "10:35", completed: true },
      { title: "Xcode Setup & Sideloading via Developer Certificate", duration: "11:15", completed: true },
      { title: "Extracting IPAs via IPATool & AnyTrans", duration: "10:47", completed: true },
      { title: "iOS Manual Static Analysis & Info.plist Inspection", duration: "7:13", completed: true },
      { title: "Automated iOS Analysis with MobSF", duration: "10:48", completed: false }
    ]
  },
  {
    id: "mod-9",
    title: "9. iOS Dynamic Analysis, Jailbreaking & Bug Bounty",
    duration: "1 hr 15 mins",
    completedPercent: 50,
    lectures: [
      { title: "Burp Suite & Proxyman CA Configuration for iOS", duration: "11:20", completed: true },
      { title: "SSL Pinning on iOS & SSL KillSwitch 2", duration: "11:17", completed: true },
      { title: "Using Objection for iOS Runtime Inspection", duration: "9:35", completed: true },
      { title: "Jailbreaking iOS 15.x–16.x (Dopamine / Palera1n)", duration: "16:34", completed: false },
      { title: "Bug Bounty 1 - Nike App (URL Scheme Abuse)", duration: "18:03", completed: false },
      { title: "Bug Bounty 2 - Kohl's App (Biometric Bypass)", duration: "11:57", completed: false }
    ]
  },
  {
    id: "mod-10",
    title: "10. Wrapping Up: Practical Mobile Pentest Associate (PMPA)",
    duration: "15 mins",
    completedPercent: 0,
    lectures: [
      { title: "PMPA Exam Guide, Scope & Report Writing Tips", duration: "15:00", completed: false }
    ]
  }
];

export default function LearningRoadmapPage() {
  const [expandedModule, setExpandedModule] = useState<string>("mod-5");

  // Calculate overall course completion
  const totalLectures = SYLLABUS.reduce((acc, m) => acc + m.lectures.length, 0);
  const completedLectures = SYLLABUS.reduce((acc, m) => acc + m.lectures.filter(l => l.completed).length, 0);
  const overallPercent = Math.round((completedLectures / totalLectures) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a060d] text-white">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-2">
              <GraduationCap className="w-3.5 h-3.5" /> TCM Security Mobile Application Penetration Testing
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              PMPA Knowledge Hub &amp; Course Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Curriculum progress, command cheat sheets, and practical lab objectives for the Practical Mobile Pentest Associate certification.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#120b17] border border-slate-800 rounded-2xl p-3 px-5">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Overall Completion</div>
              <div className="text-2xl font-black text-pink-400">{overallPercent}% Complete</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-pink-500/10 border-2 border-pink-500 flex items-center justify-center font-bold text-sm text-white">
              {overallPercent}%
            </div>
          </div>
        </div>

        {/* Cheat Sheets Quick Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-bold text-pink-400 uppercase mb-1">Android Tools</div>
            <div className="text-xs text-slate-300 font-mono">adb, apktool, jadx-gui, MobSF, drozer</div>
          </div>
          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-bold text-sky-400 uppercase mb-1">iOS Tools</div>
            <div className="text-xs text-slate-300 font-mono">ipatool, objection, SSL Killswitch, Xcode</div>
          </div>
          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Proxies</div>
            <div className="text-xs text-slate-300 font-mono">Burp Suite Pro, Proxyman, OWASP ZAP</div>
          </div>
          <div className="bg-[#120b17] border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-bold text-purple-400 uppercase mb-1">Dynamic Hooking</div>
            <div className="text-xs text-slate-300 font-mono">Frida 16.x, Frida Codeshare, Objection</div>
          </div>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4">
          {SYLLABUS.map((mod) => {
            const isExpanded = expandedModule === mod.id;
            const modCompleted = mod.lectures.filter(l => l.completed).length;

            return (
              <div 
                key={mod.id} 
                className="bg-[#120b17] border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                <button
                  onClick={() => setExpandedModule(isExpanded ? "" : mod.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-[#180f20] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      mod.completedPercent === 100 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : mod.completedPercent > 0
                        ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {mod.completedPercent === 100 ? "✓" : `${mod.completedPercent}%`}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span><Clock className="w-3 h-3 inline mr-1" />{mod.duration}</span>
                        <span>•</span>
                        <span>{modCompleted} of {mod.lectures.length} lessons completed</span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-[#09040c] p-4 divide-y divide-slate-800/50">
                    {mod.lectures.map((lec, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between first:pt-1 last:pb-1">
                        <div className="flex items-center gap-3">
                          {lec.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className={`text-xs font-medium ${lec.completed ? "text-slate-200" : "text-slate-400"}`}>
                            {lec.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {lec.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
