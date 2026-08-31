"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Calendar as CalendarIcon,
  MessageSquare,
  Video,
  FileText,
  Users,
  Bot,
  Settings,
  Search,
  Plus,
  Star,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Paperclip,
  Send,
  Sparkles,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  Hand,
  PhoneOff,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  RefreshCw,
  Folder,
  FolderInput,
  Tag,
  Smile,
  ArrowLeft,
  X,
  Check,
  Maximize2,
  Minimize2,
  Radio,
  Lock,
  Layers,
  HardDrive,
  Pin,
  Flag,
  Printer,
  RotateCcw,
  Zap,
  Wind,
  VolumeX,
  Sliders,
  Eye,
  EyeOff,
  UserX,
  BookmarkPlus,
  TrendingUp,
} from "lucide-react";

import {
  EmailMessage,
  CalendarEvent,
  TeamsMeetingSession,
  TeamsChannel,
  DriveFile,
  ContactEntry,
  initialEmailMessages,
  initialCalendarEvents,
  initialActiveTeamsMeeting,
  initialTeamsChannels,
  initialDriveFiles,
  initialContactsList,
} from "@/lib/connect-suite-data";

import {
  generateGlobalCopilotResponse,
  CopilotAction,
  CopilotMessage,
  COPILOT_SUGGESTIONS,
} from "@/lib/global-copilot-engine";

interface AxiomConnectWorkspaceProps {
  initialApp?: "mail" | "calendar" | "teams" | "meetings" | "drive" | "contacts" | "ai" | "settings";
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserRole?: string;
  onBackToCampus?: () => void;
}

export default function AxiomConnectWorkspace({
  initialApp = "mail",
  currentUserName = "Kwesi Asiedu",
  currentUserEmail = "kwesi@towson.edu",
  currentUserRole = "Student & Lead Architect",
  onBackToCampus,
}: AxiomConnectWorkspaceProps) {
  // Global Workspace App Navigation
  const [activeApp, setActiveApp] = useState<"mail" | "calendar" | "teams" | "meetings" | "drive" | "contacts" | "ai" | "settings">(initialApp);

  // Global Copilot in Workspace State
  const [copilotHistory, setCopilotHistory] = useState<CopilotMessage[]>([
    {
      id: "ws-ai-init",
      role: "assistant",
      text: `Hello **${currentUserName}**! I'm the **Axiom Cross-Ecosystem AI Copilot**.\n\nI can assist you across:\n- ✉️ **Communications**: Email thread summarization, 1-click replies, Sweep cleanup rules, Viva focus time.\n- 🎥 **Teams Meetings**: WebRTC conference rooms, action item delegation, transcripts.\n- 🎓 **Campus Life**: Classes, Canvas deadlines, Dining balances, Shuttle schedules.\n- 🏢 **Enterprise Architecture**: Change requests, Zero-Trust compliance, cATO governance.`,
      timestamp: "Just now",
      category: "GENERAL",
      actions: [
        { label: "📧 Summarize unread emails", app: "mail" },
        { label: "🎥 Launch instant Teams meeting", app: "meetings" },
        { label: "📅 Check today's calendar", app: "calendar" },
        { label: "🛡️ View cATO retention policy", modal: "policy" },
      ],
    },
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Email State
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmailMessages);
  const [selectedEmailId, setSelectedEmailId] = useState<string>(initialEmailMessages[0]?.id || "mail-101");
  const [mailFolder, setMailFolder] = useState<"inbox" | "sent" | "drafts" | "archive" | "spam" | "trash" | "snoozed">("inbox");
  const [mailCategory, setMailCategory] = useState<"all" | "primary" | "updates" | "security">("all");
  const [mailSearchQuery, setMailSearchQuery] = useState("");
  const [pinnedEmailIds, setPinnedEmailIds] = useState<string[]>(["mail-101"]);
  const [lastAction, setLastAction] = useState<{ type: string; email: EmailMessage } | null>(null);

  // Compose State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeHasMeetingLink, setComposeHasMeetingLink] = useState(false);

  // Outlook Ribbon Interactive Modals & Dropdowns
  const [showSweepModal, setShowSweepModal] = useState(false);
  const [showShareToTeamsModal, setShowShareToTeamsModal] = useState(false);
  const [showVivaInsightsModal, setShowVivaInsightsModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showQuickStepsDropdown, setShowQuickStepsDropdown] = useState(false);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [showCategorizeDropdown, setShowCategorizeDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-31");
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("2:00 PM – 2:30 PM");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("Axiom Virtual Room 1");
  const [newEventCategory, setNewEventCategory] = useState<"LECTURE" | "TEAM_SYNC" | "ONE_ON_ONE" | "ALL_HANDS" | "CAMPUS">("TEAM_SYNC");
  const [newEventAttendees, setNewEventAttendees] = useState("catherine.hayes@towson.edu, marcus.rivera@towson.edu");

  // Teams Meetings State
  const [meetingSession, setMeetingSession] = useState<TeamsMeetingSession>(initialActiveTeamsMeeting);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [meetingTab, setMeetingTab] = useState<"video" | "chat" | "participants" | "ai_notes">("video");
  const [meetingChatInput, setMeetingChatInput] = useState("");

  // Teams Channels State
  const [channels, setChannels] = useState<TeamsChannel[]>(initialTeamsChannels);
  const [activeChannelId, setActiveChannelId] = useState<string>(initialTeamsChannels[0]?.id || "ch-1");
  const [channelPostInput, setChannelPostInput] = useState("");

  // Drive & Contacts
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(initialDriveFiles);
  const [contacts, setContacts] = useState<ContactEntry[]>(initialContactsList);

  // Presence State
  const [userPresence, setUserPresence] = useState<"AVAILABLE" | "BUSY" | "IN_MEETING" | "AWAY">("AVAILABLE");

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered Emails
  const filteredEmails = emails.filter((m) => {
    const matchesFolder = m.folder === mailFolder;
    const matchesCat = mailCategory === "all" || m.category === mailCategory;
    const matchesSearch =
      mailSearchQuery === "" ||
      (m.subject && m.subject.toLowerCase().includes(mailSearchQuery.toLowerCase())) ||
      (m.from?.name && m.from.name.toLowerCase().includes(mailSearchQuery.toLowerCase())) ||
      (m.from?.email && m.from.email.toLowerCase().includes(mailSearchQuery.toLowerCase())) ||
      (m.body && m.body.toLowerCase().includes(mailSearchQuery.toLowerCase()));
    return matchesFolder && matchesCat && matchesSearch;
  });

  const selectedEmail: EmailMessage | undefined = emails.find((m) => m.id === selectedEmailId) || emails[0];
  const activeChannel: TeamsChannel | undefined = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Helper actions for Outlook Command Bar
  const handleDeleteEmail = (emailId: string) => {
    const target = emails.find((m) => m.id === emailId);
    if (!target) return;
    setLastAction({ type: "DELETE", email: target });
    setEmails((prev) => prev.map((m) => (m.id === emailId ? { ...m, folder: "trash" } : m)));
    triggerToast(`🗑️ Moved "${target.subject?.slice(0, 24)}..." to Trash.`);
  };

  const handleArchiveEmail = (emailId: string) => {
    const target = emails.find((m) => m.id === emailId);
    if (!target) return;
    setLastAction({ type: "ARCHIVE", email: target });
    setEmails((prev) => prev.map((m) => (m.id === emailId ? { ...m, folder: "archive" } : m)));
    triggerToast(`📥 Archived "${target.subject?.slice(0, 24)}...".`);
  };

  const handleUndo = () => {
    if (!lastAction) {
      triggerToast("No action to undo.");
      return;
    }
    const { email } = lastAction;
    setEmails((prev) => prev.map((m) => (m.id === email.id ? email : m)));
    setLastAction(null);
    triggerToast(`↩️ Restored email to ${email.folder}.`);
  };

  const handleTogglePin = (emailId: string) => {
    if (pinnedEmailIds.includes(emailId)) {
      setPinnedEmailIds((prev) => prev.filter((id) => id !== emailId));
      triggerToast("📌 Unpinned email from top.");
    } else {
      setPinnedEmailIds((prev) => [...prev, emailId]);
      triggerToast("📌 Pinned email to top of Inbox.");
    }
  };

  const handleToggleFlag = (emailId: string) => {
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === emailId) {
          const next = !m.isFlagged;
          triggerToast(next ? "🚩 Flagged email for follow-up." : "Cleared follow-up flag.");
          return { ...m, isFlagged: next };
        }
        return m;
      })
    );
  };

  return (
    <div className="bg-slate-100 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black">
      
      {/* ========================================================================= */}
      {/* GLOBAL TOP WORKSPACE NAVBAR */}
      {/* ========================================================================= */}
      <header className="bg-gradient-to-r from-[#030c1d] via-[#091e42] to-[#030c1d] border-b border-indigo-500/20 text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0 z-30">
        
        {/* Left: Brand & Suite Identity */}
        <div className="flex items-center gap-3">
          {onBackToCampus && (
            <button
              onClick={onBackToCampus}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold mr-1"
              title="Return to TowsonSync Campus"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-base shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">AXIOM CONNECT</span>
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-bold">
                  v3.5 OUTLOOK+TEAMS
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-none">Integrated Mail, Calendar & Teams Suite</p>
            </div>
          </div>
        </div>

        {/* Center: Global Intelligent Omnisearch Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder='Search emails, calendar events, Teams files, or type "from:catherine"...'
              value={mailSearchQuery}
              onChange={(e) => setMailSearchQuery(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-black placeholder:text-slate-400 rounded-2xl pl-10 pr-4 py-1.5 text-xs transition border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Right: Quick Triggers & Authenticated Persona */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveApp("meetings");
              triggerToast("🎥 Launched Instant Axiom Teams Video Meeting room.");
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
          >
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Meet Now</span>
          </button>

          <button
            onClick={() => setShowComposeModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Mail</span>
          </button>

          {/* User Presence & Identity */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xs">
                {(currentUserName || "User").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <span className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#030c1d] ${
                userPresence === "AVAILABLE" ? "bg-emerald-400" : userPresence === "IN_MEETING" ? "bg-purple-400" : "bg-amber-400"
              }`} />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-black text-white leading-tight">{currentUserName}</div>
              <span className="text-[10px] text-slate-300">{currentUserEmail}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE BODY (ZOHO VERTICAL APP RAIL + OUTLOOK PANE) */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── 1. ZOHO-STYLE LEFT VERTICAL APP RAIL ─────────────────────────────── */}
        <aside className="w-16 bg-[#030c1d] border-r border-indigo-950/80 flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          {[
            { id: "mail", label: "Mail", icon: Mail, badge: "2" },
            { id: "calendar", label: "Calendar", icon: CalendarIcon },
            { id: "teams", label: "Teams", icon: MessageSquare, badge: "4" },
            { id: "meetings", label: "Meetings", icon: Video, pulse: true },
            { id: "drive", label: "Drive", icon: HardDrive },
            { id: "contacts", label: "Contacts", icon: Users },
            { id: "ai", label: "Copilot", icon: Sparkles, gold: true },
          ].map((app) => {
            const IconComp = app.icon;
            const isActive = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => {
                  setActiveApp(app.id as any);
                  triggerToast(`Switched to Axiom ${app.label}`);
                }}
                className={`relative w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition group ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
                title={app.label}
              >
                <IconComp className={`w-5 h-5 ${app.gold && !isActive ? "text-amber-400" : ""}`} />
                <span className="text-[8px] font-bold mt-0.5 tracking-tighter leading-none">{app.label}</span>

                {app.badge && !isActive && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#030c1d]">
                    {app.badge}
                  </span>
                )}

                {app.pulse && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}

          <div className="mt-auto pt-2 border-t border-white/10 w-full flex flex-col items-center gap-2">
            <button
              onClick={() => {
                setUserPresence((prev) => (prev === "AVAILABLE" ? "IN_MEETING" : prev === "IN_MEETING" ? "BUSY" : "AVAILABLE"));
                triggerToast(`Presence status updated.`);
              }}
              className="w-10 h-10 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              title="Toggle Presence Status"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </aside>

        {/* ── 2. SUB-NAVIGATION DRAWER (DEPENDS ON ACTIVE APP) ────────────────── */}
        
        {/* SUB-NAV: 📧 MAIL FOLDERS & LABELS */}
        {activeApp === "mail" && (
          <div className="w-56 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between p-3 shrink-0">
            <div className="space-y-4">
              <button
                onClick={() => setShowComposeModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Compose Email</span>
              </button>

              {/* System Inboxes */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 block">
                  Folders
                </span>
                {[
                  { id: "inbox", label: "Inbox", icon: Mail, count: emails.filter((m) => m.folder === "inbox" && m.isUnread).length },
                  { id: "drafts", label: "Drafts", icon: FileText, count: 1 },
                  { id: "sent", label: "Sent Mail", icon: Send },
                  { id: "archive", label: "Archive", icon: Archive },
                  { id: "spam", label: "Spam & Quarantine", icon: ShieldAlert, alert: true },
                  { id: "trash", label: "Trash", icon: Trash2 },
                ].map((f) => {
                  const IconC = f.icon;
                  const isSelected = mailFolder === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setMailFolder(f.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconC className={`w-3.5 h-3.5 ${f.alert ? "text-rose-500" : ""}`} />
                        <span>{f.label}</span>
                      </div>
                      {f.count !== undefined && f.count > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-black">
                          {f.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 block">
                  Categories
                </span>
                {[
                  { id: "all", label: "All Items" },
                  { id: "primary", label: "Primary" },
                  { id: "security", label: "Security & cATO" },
                  { id: "updates", label: "Canvas & System" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setMailCategory(cat.id as any)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      mailCategory === cat.id
                        ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    • {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Quota */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Storage Vault</span>
                <span>18.4 GB / 100 GB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className="w-[18.4%] h-full bg-amber-500 rounded-full" />
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
                Zero-Trust S3 Encrypted
              </span>
            </div>
          </div>
        )}

        {/* SUB-NAV: 💬 TEAMS CHANNELS */}
        {activeApp === "teams" && (
          <div className="w-56 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between p-3 shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-900 dark:text-zinc-100">Teams & Channels</span>
                <button className="text-xs font-bold text-amber-600 hover:underline">+ New</button>
              </div>

              <div className="space-y-1">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                      activeChannelId === ch.id
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400">#</span>
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 px-2 block">Direct Messages</span>
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs">
                    <div className="relative">
                      <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 ${
                        c.presence === "AVAILABLE" ? "bg-emerald-500" : c.presence === "IN_MEETING" ? "bg-purple-500" : "bg-amber-500"
                      }`} />
                    </div>
                    <span className="truncate font-medium">{c.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. MAIN INTERACTIVE CONTENT AREA (MAIL / CALENDAR / TEAMS) ─────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* ========================================================================= */}
          {/* VIEW A: 📧 OUTLOOK MODERN ACTION RIBBON & TRI-PANE EMAIL WORKSPACE */}
          {/* ========================================================================= */}
          {activeApp === "mail" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* ========================================================================= */}
              {/* ⚡ MICROSOFT OUTLOOK MODERN ACTION RIBBON COMMAND BAR */}
              {/* ========================================================================= */}
              <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-between overflow-x-auto gap-2 shrink-0 text-xs shadow-xs z-10 select-none">
                
                <div className="flex items-center gap-1 shrink-0">
                  
                  {/* GROUP 1: NEW */}
                  <div className="flex items-center pr-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowComposeModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-1.5 shadow-xs transition"
                      title="New Email"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                    </button>
                  </div>

                  {/* GROUP 2: DELETE & CLEAN */}
                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => triggerToast(`🔇 Thread muted: No further notifications.`)}
                      className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold flex items-center gap-1"
                      title="Ignore Conversation"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden xl:inline">Ignore</span>
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                        className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold flex items-center gap-1"
                        title="Block Sender"
                      >
                        <UserX className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden xl:inline">Block</span>
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                      </button>

                      {showBlockDropdown && selectedEmail && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-1 z-30 animate-in zoom-in-95 space-y-0.5">
                          <button
                            onClick={() => {
                              triggerToast(`🚫 Blocked sender: ${selectedEmail.from?.email || "sender"}`);
                              setShowBlockDropdown(false);
                            }}
                            className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2"
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                            <span>Block {selectedEmail.from?.email || "sender"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEmail(selectedEmailId)}
                      className="px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-semibold flex items-center gap-1"
                      title="Delete Email (Del)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden lg:inline">Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleArchiveEmail(selectedEmailId)}
                      className="px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"
                      title="Archive Email (E)"
                    >
                      <Archive className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden lg:inline">Archive</span>
                    </button>
                  </div>

                  {/* GROUP 3: REPORT */}
                  <div className="flex items-center px-1.5 border-r border-slate-200 dark:border-zinc-800 relative">
                    <button
                      type="button"
                      onClick={() => setShowReportDropdown(!showReportDropdown)}
                      className="px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 font-semibold flex items-center gap-1"
                      title="Report Phishing / Junk"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden md:inline">Report</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {showReportDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-1.5 z-30 animate-in zoom-in-95 space-y-1">
                        <button
                          onClick={() => {
                            triggerToast("🛡️ Submitted Zero-Trust Phishing Forensic Report to AXIOM SOC.");
                            setShowReportDropdown(false);
                          }}
                          className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Report Phishing Threat</span>
                        </button>
                        <button
                          onClick={() => {
                            setEmails((prev) => prev.map((m) => (m.id === selectedEmailId ? { ...m, folder: "spam" } : m)));
                            triggerToast("Marked as Junk / Spam.");
                            setShowReportDropdown(false);
                          }}
                          className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Report Junk</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* GROUP 4: RESPOND */}
                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedEmail) return;
                        setShowComposeModal(true);
                        setComposeTo(selectedEmail.from?.email || "");
                        setComposeSubject(`Re: ${selectedEmail.subject || ""}`);
                        setComposeBody(`\n\n--- On ${selectedEmail.date} at ${selectedEmail.time}, ${selectedEmail.from?.name || "Sender"} wrote:\n${selectedEmail.body || ""}`);
                      }}
                      className="px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
                      title="Reply"
                    >
                      <Send className="w-3.5 h-3.5 -rotate-45" />
                      <span className="hidden sm:inline">Reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedEmail) return;
                        setShowComposeModal(true);
                        setComposeTo(`${selectedEmail.from?.email || ""}, ${(selectedEmail.to || []).map(t => t.email).join(", ")}`);
                        setComposeSubject(`Re: ${selectedEmail.subject || ""}`);
                      }}
                      className="px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
                      title="Reply All"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Reply all</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedEmail) return;
                        setShowComposeModal(true);
                        setComposeSubject(`Fwd: ${selectedEmail.subject || ""}`);
                        setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${selectedEmail.from?.name || ""} <${selectedEmail.from?.email || ""}>\nSubject: ${selectedEmail.subject || ""}\n\n${selectedEmail.body || ""}`);
                      }}
                      className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold flex items-center gap-1"
                      title="Forward"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Forward</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveApp("meetings");
                        triggerToast("🟣 Schedule Teams meeting with attendees.");
                      }}
                      className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                      title="Schedule Meeting"
                    >
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      <span>Meeting</span>
                    </button>
                  </div>

                  {/* GROUP 5: SHARE TO TEAMS */}
                  <div className="flex items-center px-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowShareToTeamsModal(true)}
                      className="px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5"
                      title="Share to Teams Channel"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="hidden lg:inline">Share to Teams</span>
                    </button>
                  </div>

                  {/* GROUP 6: MOVE & SWEEP */}
                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-zinc-800 relative">
                    <button
                      type="button"
                      onClick={() => setShowSweepModal(true)}
                      className="px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1"
                      title="Sweep: Clean up older emails from sender"
                    >
                      <Wind className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden md:inline">Sweep</span>
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                        className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold flex items-center gap-1"
                        title="Move to Folder"
                      >
                        <FolderInput className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden md:inline">Move</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {showMoveDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-1 z-30 animate-in zoom-in-95 space-y-0.5">
                          {["Archive", "Inbox", "Spam", "Trash"].map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                setEmails((prev) => prev.map((m) => (m.id === selectedEmailId ? { ...m, folder: f.toLowerCase() as any } : m)));
                                triggerToast(`Moved email to ${f}.`);
                                setShowMoveDropdown(false);
                              }}
                              className="w-full text-left p-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
                            >
                              📁 {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GROUP 7: QUICK STEPS */}
                  <div className="flex items-center px-1.5 border-r border-slate-200 dark:border-zinc-800 relative">
                    <button
                      type="button"
                      onClick={() => setShowQuickStepsDropdown(!showQuickStepsDropdown)}
                      className="px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 border border-amber-300/40"
                      title="1-Click Automated Quick Steps"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Quick steps</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {showQuickStepsDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-2 z-30 animate-in zoom-in-95 space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-400 px-2">Automated Macros</div>
                        <button
                          onClick={() => {
                            triggerToast("⚡ Forwarded to Research Advisor & Archived email.");
                            handleArchiveEmail(selectedEmailId);
                            setShowQuickStepsDropdown(false);
                          }}
                          className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-800 dark:text-zinc-200"
                        >
                          🎓 Forward to Advisor & Archive
                        </button>
                        <button
                          onClick={() => {
                            triggerToast("📝 Created Canvas Study Task & marked email read.");
                            setShowQuickStepsDropdown(false);
                          }}
                          className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-800 dark:text-zinc-200"
                        >
                          📝 Create Canvas Task & Mark Read
                        </button>
                        <button
                          onClick={() => {
                            setEmails((prev) => prev.map((m) => (m.id === selectedEmailId ? { ...m, isStarred: true } : m)));
                            triggerToast("⭐ Starred and moved to Projects.");
                            setShowQuickStepsDropdown(false);
                          }}
                          className="w-full text-left p-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                        >
                          ⭐ Star & Move to Projects
                        </button>
                      </div>
                    )}
                  </div>

                  {/* GROUP 8: TAGS & STATUS */}
                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEmails((prev) => prev.map((m) => (m.id === selectedEmailId ? { ...m, isUnread: !m.isUnread } : m)));
                        triggerToast("Toggled read status.");
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      title="Mark Read / Unread"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategorizeDropdown(!showCategorizeDropdown)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center gap-0.5"
                        title="Categorize"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                      </button>

                      {showCategorizeDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-1.5 z-30 animate-in zoom-in-95 space-y-1">
                          {["Academics", "Research", "SGA", "Career", "Security"].map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                setEmails((prev) =>
                                  prev.map((m) => (m.id === selectedEmailId ? { ...m, labels: [...(m.labels || []), c] } : m))
                                );
                                triggerToast(`🏷️ Categorized as ${c}.`);
                                setShowCategorizeDropdown(false);
                              }}
                              className="w-full text-left p-1.5 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
                            >
                              • {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(selectedEmailId)}
                      className={`p-1.5 rounded-lg transition ${
                        selectedEmail?.isFlagged ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60" : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}
                      title="Flag Email"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(selectedEmailId)}
                      className={`p-1.5 rounded-lg transition ${
                        pinnedEmailIds.includes(selectedEmailId) ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60" : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}
                      title="Pin to Top"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerToast("⏱️ Snoozed email until Tomorrow at 8:00 AM.")}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      title="Snooze"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      title="Retention & cATO Zero-Trust Policy"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  </div>

                  {/* GROUP 9: PRINT & ADD-INS / AI INSIGHTS */}
                  <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                        triggerToast("🖨️ Opened Print Preview.");
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      title="Print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowVivaInsightsModal(true)}
                      className="px-2 py-1 rounded-lg bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-black flex items-center gap-1 border border-sky-400/30"
                      title="Viva Insights & AI Workload Analytics"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      <span>Insights</span>
                    </button>
                  </div>

                  {/* GROUP 10: UNDO */}
                  <div className="flex items-center pl-1">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={!lastAction}
                      className="px-2 py-1 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1 transition"
                      title="Undo Last Action (Ctrl + Z)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Tri-Pane: Email List + Detailed Viewer */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Middle Pane: Email List */}
                <div className="w-80 lg:w-96 bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col overflow-y-auto shrink-0">
                  <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300">
                        {mailFolder.toUpperCase()} ({filteredEmails.length})
                      </span>
                    </div>
                    <button
                      onClick={() => triggerToast("🔄 Synchronized with IMAP & TowsonSync Mailbox.")}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-900">
                    {filteredEmails.map((msg) => {
                      const isSelected = selectedEmailId === msg.id;
                      const isPinned = pinnedEmailIds.includes(msg.id);
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setSelectedEmailId(msg.id);
                            setEmails((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isUnread: false } : m)));
                          }}
                          className={`p-3.5 cursor-pointer transition flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-amber-500/10 border-l-4 border-amber-500 dark:bg-amber-500/5"
                              : msg.isUnread
                              ? "bg-white dark:bg-zinc-900 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-zinc-900/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-2 truncate">
                              {isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 rotate-45" />}
                              {msg.isStarred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                              <span className={`text-xs truncate ${msg.isUnread ? "font-black text-slate-900 dark:text-zinc-100" : "text-slate-600 dark:text-zinc-300"}`}>
                                {msg.from?.name || "Sender"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{msg.time}</span>
                          </div>

                          <h4 className={`text-xs line-clamp-1 ${msg.isUnread ? "font-black text-slate-900 dark:text-zinc-100" : "text-slate-700 dark:text-zinc-300"}`}>
                            {msg.subject}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {msg.preview}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              {msg.hasAttachment && (
                                <span className="text-[9px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>Att</span>
                                </span>
                              )}
                              {msg.securityStatus?.threatScore && msg.securityStatus.threatScore > 50 ? (
                                <span className="text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 px-1.5 py-0.2 rounded">
                                  ⚠️ Phishing Flag
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                  SPF/DKIM ✓
                                </span>
                              )}
                            </div>

                            {msg.isFlagged && <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Pane: Detailed Email Viewer */}
                {selectedEmail ? (
                  <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto p-6 space-y-6">
                    
                    {/* Subject & Action Bar */}
                    <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {(selectedEmail.labels || []).map((lbl) => (
                            <span key={lbl} className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                              {lbl}
                            </span>
                          ))}
                          {selectedEmail.securityStatus?.tlsEncrypted && (
                            <span className="text-[9px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>TLS 1.3 Strict</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">{selectedEmail.subject}</h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowComposeModal(true);
                            setComposeTo(selectedEmail.from?.email || "");
                            setComposeSubject(`Re: ${selectedEmail.subject || ""}`);
                            setComposeBody(`\n\n--- On ${selectedEmail.date} at ${selectedEmail.time}, ${selectedEmail.from?.name || "Sender"} wrote:\n${selectedEmail.body || ""}`);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApp("meetings");
                            triggerToast("🎥 Launched Axiom Teams video meeting for this email thread.");
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Teams Sync</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Copilot Suggestion Box */}
                    {selectedEmail.aiSummary && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Axiom AI Thread Copilot
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                          {selectedEmail.aiSummary}
                        </p>

                        {selectedEmail.suggestedAction && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setShowComposeModal(true);
                                setComposeTo(selectedEmail.from?.email || "");
                                setComposeSubject(`Confirmed: ${selectedEmail.suggestedAction?.meetingDetails?.title || "Meeting"}`);
                                setComposeBody(`Hi ${(selectedEmail.from?.name || "there").split(" ")[0]},\n\nI have confirmed our sync for ${selectedEmail.suggestedAction?.meetingDetails?.suggestedTime || "the requested time"}.\n\nHere is our Axiom Teams meeting link:\nhttps://meet.axiom.com/AXM-492-831\n\nLooking forward to it!`);
                                setComposeHasMeetingLink(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                            >
                              <span>📅 {selectedEmail.suggestedAction.label}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sender Profile Strip */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedEmail.from?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                          alt={selectedEmail.from?.name || "Sender"}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-black text-slate-900 dark:text-zinc-100">{selectedEmail.from?.name || "Sender"}</h3>
                            <span className="text-[10px] text-slate-400">&lt;{selectedEmail.from?.email || ""}&gt;</span>
                          </div>
                          <span className="text-[11px] text-slate-500">To: {(selectedEmail.to || []).map((t) => t.name).join(", ")}</span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono text-slate-400">
                        <span>{selectedEmail.date} • {selectedEmail.time}</span>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-normal bg-slate-50/50 dark:bg-zinc-950/30 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      {selectedEmail.body}
                    </div>

                    {/* Attachments List */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                          Attachments ({selectedEmail.attachments.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedEmail.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="text-xl">📄</span>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{att.name}</div>
                                  <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => triggerToast(`📥 Downloaded ${att.name}`)}
                                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                    Select an email to view its content.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW B: 📅 OUTLOOK-STYLE CALENDAR & AVAILABILITY SCHEDULER */}
          {/* ========================================================================= */}
          {activeApp === "calendar" && (
            <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Campus & Enterprise Schedule</h2>
                  <p className="text-xs text-slate-500">Synchronized across Canvas courses, Axiom Standups, and Research Labs</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>
              </div>

              {/* Event Timeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {evt.dateLabel} • {evt.timeLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{evt.category}</span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">{evt.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{evt.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-700">
                      <span className="text-xs text-slate-400 font-medium truncate max-w-[50%]">📍 {evt.location || "Axiom Teams"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMeetingSession((prev) => ({
                            ...prev,
                            title: evt.title,
                            meetingId: evt.meetingId || "AXM-492-831",
                          }));
                          setActiveApp("meetings");
                          triggerToast(`📹 Connected to Teams Meeting: ${evt.title} (${evt.meetingId || "AXM-492-831"})`);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition hover:scale-105 cursor-pointer shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Teams</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW C: 🎥 MICROSOFT TEAMS-STYLE REAL-TIME VIDEO MEETING ROOM */}
          {/* ========================================================================= */}
          {activeApp === "meetings" && (
            <div className="flex-1 bg-slate-950 text-white flex flex-col overflow-hidden">
              
              {/* Meeting Header */}
              <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <h3 className="text-sm font-black text-white">{meetingSession.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Meeting ID: {meetingSession.meetingId} • Passcode: {meetingSession.passcode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {[
                    { id: "video", label: "Video Grid" },
                    { id: "chat", label: `Chat (${meetingSession.chatMessages.length})` },
                    { id: "participants", label: `People (${meetingSession.participants.length})` },
                    { id: "ai_notes", label: "✨ AI Notes" },
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => setMeetingTab(tb.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        meetingTab === tb.id ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Meeting Space */}
              <div className="flex-1 flex overflow-hidden p-4 gap-4">
                
                {/* Video Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
                  {meetingSession.participants.map((p) => (
                    <div
                      key={p.id}
                      className={`relative bg-slate-900 rounded-3xl border overflow-hidden flex flex-col justify-between p-4 min-h-[180px] shadow-lg ${
                        p.isSpeaking ? "border-amber-400 ring-2 ring-amber-400/40" : "border-slate-800"
                      }`}
                    >
                      {/* Video Camera Simulator */}
                      {p.isVideoOn && !isVideoOff ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-black text-white">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                          {p.role}
                        </span>
                        {p.isHandRaised && (
                          <span className="text-sm bg-amber-500 p-1 rounded-full text-black shadow-md">✋</span>
                        )}
                      </div>

                      {/* Bottom Name Strip */}
                      <div className="relative z-10 flex items-center justify-between bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-2xl">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Drawer (Chat / Participants / AI Notes) */}
                {meetingTab !== "video" && (
                  <div className="w-80 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-2xl">
                    
                    {meetingTab === "chat" && (
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <h4 className="text-xs font-black text-slate-300 uppercase">Meeting Conversation</h4>
                        <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                          {meetingSession.chatMessages.map((m) => (
                            <div key={m.id} className={`p-3 rounded-2xl ${m.isAiNote ? "bg-amber-500/20 border border-amber-400/40 text-amber-300" : "bg-slate-800 text-white"}`}>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                <span className="font-bold">{m.sender}</span>
                                <span>{m.time}</span>
                              </div>
                              <p className="leading-snug">{m.text}</p>
                            </div>
                          ))}
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!meetingChatInput.trim()) return;
                            setMeetingSession((prev) => ({
                              ...prev,
                              chatMessages: [
                                ...prev.chatMessages,
                                {
                                  id: `mc-${Date.now()}`,
                                  sender: currentUserName,
                                  time: "Just now",
                                  text: meetingChatInput,
                                },
                              ],
                            }));
                            setMeetingChatInput("");
                          }}
                          className="flex gap-2 pt-2 border-t border-slate-800"
                        >
                          <input
                            type="text"
                            placeholder="Type meeting message..."
                            value={meetingChatInput}
                            onChange={(e) => setMeetingChatInput(e.target.value)}
                            className="flex-1 bg-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button type="submit" className="bg-amber-500 text-black px-3 py-2 rounded-xl font-bold">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}

                    {meetingTab === "ai_notes" && (
                      <div className="space-y-3 overflow-y-auto text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="font-black text-amber-400">Live AI Meeting Summary</h4>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {meetingSession.aiSummaryNotes?.overview}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-black uppercase text-slate-400">Key Decisions</span>
                          {meetingSession.aiSummaryNotes?.decisions.map((d, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                              <span className="text-emerald-400">✓</span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-black uppercase text-slate-400">Assigned Action Items</span>
                          {meetingSession.aiSummaryNotes?.actionItems.map((act, i) => (
                            <div key={i} className="p-2 bg-slate-800 rounded-xl space-y-0.5">
                              <div className="font-bold text-white text-[11px]">{act.task}</div>
                              <span className="text-[10px] text-amber-400">Assignee: {act.assignee} ({act.due})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {meetingTab === "participants" && (
                      <div className="space-y-3 overflow-y-auto text-xs">
                        <h4 className="text-xs font-black text-slate-300 uppercase">Participants ({meetingSession.participants.length})</h4>
                        <div className="space-y-2">
                          {meetingSession.participants.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-xl">
                              <div className="flex items-center gap-2">
                                <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                                <div>
                                  <div className="font-bold text-white text-xs">{p.name}</div>
                                  <span className="text-[9px] text-slate-400">{p.role}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="text-xs font-mono text-emerald-400">
                  <span>● WebRTC SFU Encrypted (1080p60)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-2xl font-bold transition flex items-center gap-2 text-xs ${
                      isMicMuted ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    <span>{isMicMuted ? "Unmute" : "Mute"}</span>
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3 rounded-2xl font-bold transition flex items-center gap-2 text-xs ${
                      isVideoOff ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {isVideoOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4 text-indigo-400" />}
                    <span>{isVideoOff ? "Start Video" : "Stop Video"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsScreenSharing(!isScreenSharing);
                      triggerToast(isScreenSharing ? "Stopped screen sharing." : "Screen share active.");
                    }}
                    className={`p-3 rounded-2xl font-bold transition flex items-center gap-2 text-xs ${
                      isScreenSharing ? "bg-emerald-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHandRaised(!isHandRaised);
                      triggerToast(isHandRaised ? "Lowered hand." : "Raised hand.");
                    }}
                    className={`p-3 rounded-2xl font-bold transition flex items-center gap-2 text-xs ${
                      isHandRaised ? "bg-amber-500 text-black font-black" : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>Hand</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveApp("mail");
                      triggerToast("Left meeting room.");
                    }}
                    className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Axiom Media Engine</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW D: 📁 CLOUD DRIVE & FILES */}
          {/* ========================================================================= */}
          {activeApp === "drive" && (
            <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Axiom Cloud Drive Vault</h2>
                  <p className="text-xs text-slate-500">Secure zero-trust cloud file storage & direct email attachment integration</p>
                </div>
                <button
                  onClick={() => triggerToast("📁 File upload completed to Axiom Drive.")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3 flex flex-col justify-between hover:border-amber-500 transition"
                  >
                    <div className="space-y-2">
                      <span className="text-3xl">{file.icon}</span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 line-clamp-2">{file.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">{file.size} • {file.updatedAt}</span>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 font-bold">{file.type}</span>
                      <button
                        onClick={() => triggerToast(`📥 Downloaded ${file.name}`)}
                        className="text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-amber-500"
                      >
                        Download →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW E: 👥 CONTACTS & ORGANIZATION DIRECTORY */}
          {/* ========================================================================= */}
          {activeApp === "contacts" && (
            <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col p-6 overflow-y-auto space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Unified Contacts & Faculty Directory</h2>
                <p className="text-xs text-slate-500">Towson University faculty, students, and enterprise engineering staff</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-2xl object-cover" />
                        <span className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                          c.presence === "AVAILABLE" ? "bg-emerald-500" : c.presence === "IN_MEETING" ? "bg-purple-500" : "bg-amber-500"
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{c.name}</h4>
                        <span className="text-xs text-slate-500 block">{c.role}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveApp("mail");
                          setShowComposeModal(true);
                          setComposeTo(c.email);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-amber-500 hover:text-black transition"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveApp("meetings");
                          triggerToast(`Starting Axiom Teams call with ${c.name}...`);
                        }}
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition"
                        title="Start Teams Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW F: 🤖 AXIOM AI EMAIL & MULTI-DOMAIN COPILOT */}
          {/* ========================================================================= */}
          {activeApp === "ai" && (
            <div className="flex-1 bg-white dark:bg-zinc-900 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 px-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-black text-xl shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-zinc-100">Axiom Global AI Copilot</h2>
                    <p className="text-xs text-slate-500">Autonomous communications, schedule optimization, and campus intelligence</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCopilotHistory([
                      {
                        id: `ws-clear-${Date.now()}`,
                        role: "assistant",
                        text: "Conversation refreshed. How can I assist you across email, meetings, courses, or enterprise systems?",
                        timestamp: "Just now",
                        category: "GENERAL",
                      },
                    ]);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
                {copilotHistory.map((msg) => {
                  const isAi = msg.role === "assistant";
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}>
                      {isAi && (
                        <div className="w-8 h-8 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          ⚡
                        </div>
                      )}
                      <div
                        className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm ${
                          isAi
                            ? "bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                            : "bg-indigo-600 text-white rounded-tr-xs"
                        }`}
                      >
                        {isAi && msg.category && (
                          <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 border-b pb-1">
                            {msg.category === "CAMPUS" && "🎓 TowsonSync Campus Intelligence"}
                            {msg.category === "COMMUNICATIONS" && "✉️ Axiom Communications & Security"}
                            {msg.category === "ENTERPRISE" && "🏢 Expedite Consults Enterprise"}
                            {msg.category === "VERITAS" && "🔍 VeritasLens Fact Engine"}
                            {msg.category === "GENERAL" && "⚡ Cross-Ecosystem Global Response"}
                          </div>
                        )}
                        <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>

                        {/* Action Chips */}
                        {isAi && msg.actions && msg.actions.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Actions:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.actions.map((act, aIdx) => (
                                <button
                                  key={aIdx}
                                  type="button"
                                  onClick={() => {
                                    if (act.app) {
                                      setActiveApp(act.app);
                                    }
                                    if (act.modal === "compose") {
                                      setShowComposeModal(true);
                                    } else if (act.modal === "sweep") {
                                      setShowSweepModal(true);
                                    } else if (act.modal === "viva") {
                                      setShowVivaModal(true);
                                    } else if (act.modal === "policy") {
                                      setShowRetentionPolicyModal(true);
                                    }
                                    if (act.href) {
                                      window.location.href = act.href;
                                    }
                                    triggerToast(`⚡ Executed: ${act.label}`);
                                  }}
                                  className="bg-white dark:bg-zinc-900 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black text-slate-800 dark:text-zinc-200 font-bold px-2.5 py-1 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 hover:border-amber-500 transition flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>{act.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isCopilotTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-xs shrink-0">
                      ⚡
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>Synthesizing cross-ecosystem answer...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions and Input */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 space-y-2.5 max-w-4xl w-full mx-auto">
                <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
                  {[
                    "📧 Summarize unread emails",
                    "🎥 Start instant Teams meeting",
                    "🧹 How does Sweep clean inbox?",
                    "📚 What is due in CS 421 tonight?",
                    "💳 Check dining dollars",
                    "🏢 What is CR-892?",
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const userMsg: CopilotMessage = {
                          id: `user-${Date.now()}`,
                          role: "user",
                          text: p,
                          timestamp: "Just now",
                        };
                        setCopilotHistory((prev) => [...prev, userMsg]);
                        setIsCopilotTyping(true);
                        setTimeout(() => {
                          const resp = generateGlobalCopilotResponse(p);
                          const aiMsg: CopilotMessage = {
                            id: `ai-${Date.now()}`,
                            role: "assistant",
                            text: resp.text,
                            timestamp: "Just now",
                            category: resp.category,
                            actions: resp.actions,
                          };
                          setCopilotHistory((prev) => [...prev, aiMsg]);
                          setIsCopilotTyping(false);
                        }, 400);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 whitespace-nowrap font-medium transition cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!copilotInput.trim() || isCopilotTyping) return;
                    const text = copilotInput.trim();
                    setCopilotInput("");
                    const userMsg: CopilotMessage = {
                      id: `user-${Date.now()}`,
                      role: "user",
                      text,
                      timestamp: "Just now",
                    };
                    setCopilotHistory((prev) => [...prev, userMsg]);
                    setIsCopilotTyping(true);
                    setTimeout(() => {
                      const resp = generateGlobalCopilotResponse(text);
                      const aiMsg: CopilotMessage = {
                        id: `ai-${Date.now()}`,
                        role: "assistant",
                        text: resp.text,
                        timestamp: "Just now",
                        category: resp.category,
                        actions: resp.actions,
                      };
                      setCopilotHistory((prev) => [...prev, aiMsg]);
                      setIsCopilotTyping(false);
                    }, 400);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    placeholder="Ask Axiom Copilot anything across mail, teams, courses, or enterprise..."
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!copilotInput.trim() || isCopilotTyping}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: 🧹 SWEEP AUTOMATION RULES MODAL */}
      {/* ========================================================================= */}
      {showSweepModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Sweep Inbox Messages</h3>
              </div>
              <button onClick={() => setShowSweepModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              For all messages from <strong>{selectedEmail?.from?.name || "Sender"}</strong> ({selectedEmail?.from?.email || ""}):
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                <input type="radio" name="sweepOption" defaultChecked className="accent-amber-500" />
                <span>Move all messages from the Inbox folder</span>
              </label>
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                <input type="radio" name="sweepOption" className="accent-amber-500" />
                <span>Move all messages older than 10 days</span>
              </label>
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                <input type="radio" name="sweepOption" className="accent-amber-500" />
                <span>Always keep the latest message and delete the rest</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setShowSweepModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => {
                  triggerToast(`🧹 Sweep executed: Cleaned all older messages from ${selectedEmail?.from?.name || "Sender"}.`);
                  setShowSweepModal(false);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2 rounded-xl text-xs shadow-md"
              >
                Execute Sweep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 💬 SHARE TO TEAMS CHANNEL MODAL */}
      {/* ========================================================================= */}
      {showShareToTeamsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Share Email to Teams</h3>
              </div>
              <button onClick={() => setShowShareToTeamsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Cross-post <strong>"{selectedEmail?.subject || "Email"}"</strong> to a persistent team channel:
            </p>

            <div className="space-y-1.5 text-xs font-bold">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setChannels((prev) =>
                      prev.map((c) =>
                        c.id === ch.id
                          ? {
                              ...c,
                              posts: [
                                ...c.posts,
                                {
                                  id: `post-${Date.now()}`,
                                  sender: {
                                    name: currentUserName,
                                    email: currentUserEmail,
                                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                                    title: currentUserRole,
                                  },
                                  timestamp: "Just now",
                                  content: `📢 [Shared from Email] ${selectedEmail?.subject || ""}\n\nFrom: ${selectedEmail?.from?.name || ""}\n${selectedEmail?.preview || ""}`,
                                  reactions: [],
                                  repliesCount: 0,
                                },
                              ],
                            }
                          : c
                      )
                    );
                    triggerToast(`💬 Shared email thread into #${ch.name}!`);
                    setShowShareToTeamsModal(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950 flex items-center justify-between"
                >
                  <span>#{ch.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{ch.membersCount} members</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 🪢 VIVA INSIGHTS & AI WORKLOAD COPILOT MODAL */}
      {/* ========================================================================= */}
      {showVivaInsightsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Axiom Insights & Workload Copilot</h3>
              </div>
              <button onClick={() => setShowVivaInsightsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/60 rounded-2xl border border-sky-200 dark:border-sky-800">
                <span className="text-lg font-black text-sky-600">3.5 hrs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Focus Time Today</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-lg font-black text-emerald-600">92%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Response Rate</span>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-200 dark:border-purple-800">
                <span className="text-lg font-black text-purple-600">2 Syncs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Scheduled Today</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-black uppercase text-slate-400 text-[10px]">AI Follow-Up Recommendations</span>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border space-y-1">
                <div className="font-bold text-slate-900 dark:text-zinc-100">Dr. Hayes (COSC 421)</div>
                <p className="text-slate-500 text-[11px]">You committed to sharing the benchmark dataset by 5 PM today.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border space-y-1">
                <div className="font-bold text-slate-900 dark:text-zinc-100">T. Rowe Price Recruiter</div>
                <p className="text-slate-500 text-[11px]">Invitation pending for Summer 2026 technical interview.</p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerToast("🛡️ AI scheduled 2 hours of protected focus time on your calendar.");
                setShowVivaInsightsModal(false);
              }}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md"
            >
              Book 2 Hours Focus Time
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 🗂️ RETENTION & ZERO-TRUST POLICY MODAL */}
      {/* ========================================================================= */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Retention & cATO Compliance Policy</h3>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Active Policy: Enterprise 7-Year cATO Vault</span>
                <p className="text-slate-500 text-[11px]">All academic and research correspondence is cryptographically sealed with SHA-256 integrity checks.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl border space-y-1">
                <span className="font-bold text-slate-800 dark:text-zinc-200">Zero-Trust DLP Engine</span>
                <p className="text-slate-500 text-[11px]">Automatic redaction enabled for PII, SSN, and student financial records.</p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerToast("Policy updated & verified.");
                setShowPolicyModal(false);
              }}
              className="w-full bg-indigo-600 text-white font-black py-2 rounded-xl text-xs"
            >
              Confirm Policy
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPOSE EMAIL MODAL */}
      {/* ========================================================================= */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">New Email Message</h3>
              </div>
              <button onClick={() => setShowComposeModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 border-b pb-2">
                <span className="w-14 font-bold text-slate-400">To:</span>
                <input
                  type="text"
                  placeholder="recipient@domain.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 border-b pb-2">
                <span className="w-14 font-bold text-slate-400">Subject:</span>
                <input
                  type="text"
                  placeholder="Subject line"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              {/* Action Ribbon for Compose */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const meetingCode = "AXM-492-831";
                    setComposeBody((prev) => `${prev}\n\n🎥 Join Axiom Teams Meeting:\nhttps://meet.axiom.com/${meetingCode}\nMeeting ID: ${meetingCode}`);
                    setComposeHasMeetingLink(true);
                    triggerToast("🎥 Inserted Axiom Teams Meeting link!");
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  <span>+ Add Teams Meeting</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setComposeBody((prev) => `Hi,\n\nThank you for reaching out. I would be glad to sync on this matter and review the technical deliverables.\n\nBest regards,\n${currentUserName}`);
                    triggerToast("✨ AI drafted email response.");
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Smart Draft</span>
                </button>
              </div>

              <textarea
                rows={8}
                placeholder="Write your email message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={() => triggerToast("📎 File attached to draft.")}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    triggerToast(`🚀 Sent email to ${composeTo || "recipient"} via SMTP/TLS.`);
                    setShowComposeModal(false);
                    setComposeTo("");
                    setComposeSubject("");
                    setComposeBody("");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 📅 SCHEDULE MEETING & CALENDAR EVENT */}
      {/* ========================================================================= */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-sm">
                  📅
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Schedule Meeting & Sync</h3>
                  <p className="text-[11px] text-slate-500">Add to Outlook Calendar & generate Teams WebRTC link</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newEventTitle.trim()) return;

                const generatedMeetingId = `AXM-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
                const newEvent: CalendarEvent = {
                  id: `evt-${Date.now()}`,
                  title: newEventTitle.trim(),
                  description: newEventDescription || "Sync and discussion via Axiom Teams encrypted conference link.",
                  startTime: "2026-08-31T14:00:00",
                  endTime: "2026-08-31T14:30:00",
                  dateLabel: "Today",
                  timeLabel: newEventTime || "2:00 PM – 2:30 PM",
                  category: newEventCategory,
                  color: "bg-indigo-500",
                  location: newEventLocation || "Axiom Virtual Room 1",
                  meetingLink: `https://meet.axiom.com/${generatedMeetingId}`,
                  meetingId: generatedMeetingId,
                  attendees: (newEventAttendees || "catherine.hayes@towson.edu").split(",").map((email, idx) => ({
                    name: email.trim().split("@")[0] || `Attendee ${idx + 1}`,
                    email: email.trim(),
                    status: "ACCEPTED",
                  })),
                };

                setCalendarEvents((prev) => [newEvent, ...prev]);
                setShowCreateEventModal(false);
                setNewEventTitle("");
                setNewEventDescription("");
                triggerToast(`📅 Meeting "${newEvent.title}" scheduled with 1080p Teams room (${generatedMeetingId})!`);
              }}
              className="space-y-3.5 text-xs font-semibold"
            >
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., COSC 421 Lab 3 Code Review & Standup"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                    Time Slot
                  </label>
                  <select
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 dark:text-zinc-100"
                  >
                    <option value="9:00 AM – 9:30 AM">9:00 AM – 9:30 AM</option>
                    <option value="10:00 AM – 11:15 AM">10:00 AM – 11:15 AM</option>
                    <option value="1:00 PM – 1:30 PM">1:00 PM – 1:30 PM</option>
                    <option value="2:00 PM – 2:30 PM">2:00 PM – 2:30 PM</option>
                    <option value="3:30 PM – 4:30 PM">3:30 PM – 4:30 PM</option>
                    <option value="5:00 PM – 6:00 PM">5:00 PM – 6:00 PM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                    Category
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 dark:text-zinc-100"
                  >
                    <option value="TEAM_SYNC">Team Sync</option>
                    <option value="ONE_ON_ONE">1-on-1 Mentorship</option>
                    <option value="LECTURE">Class / Lecture</option>
                    <option value="ALL_HANDS">All Hands / Gala</option>
                    <option value="CAMPUS">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                  Location / Teams Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Complex Rm 304 or Axiom Virtual Room 1"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                  Attendees (comma-separated emails)
                </label>
                <input
                  type="text"
                  placeholder="catherine.hayes@towson.edu, marcus.rivera@towson.edu"
                  value={newEventAttendees}
                  onChange={(e) => setNewEventAttendees(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-zinc-300 block text-[11px] font-bold">
                  Agenda / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief meeting agenda, goals, and preparation requirements..."
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <Video className="w-3.5 h-3.5 text-amber-600" />
                  <span>Auto-generate 1080p Teams Meeting link</span>
                </div>
                <span className="font-mono font-bold text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full">Active</span>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#030c1d] text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-400/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

    </div>
  );
}
