"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  MessageSquare,
  Phone,
  Video,
  Shield,
  Lock,
  Sparkles,
  CheckCheck,
  Send,
  Search,
  FileText,
  Layers,
  MonitorUp,
  Languages,
  Building2,
  GraduationCap,
  Heart,
  Briefcase,
  CheckCircle2,
  ListTodo,
} from "lucide-react"
import { VibeVideoCallStudio } from "./VibeVideoCallStudio"
import { filterAndRankMembers, scoreMemberSearchMatch } from "@/lib/connectin-search-match"
import { loadMembers, ShareTarget } from "./MessageActionBar"

export interface StudioCallHandoffPayload {
  callId: string
  conversationId: string
  conversationName: string
  mode: "audio" | "video" | "screenshare"
  avatar?: string
  subtitle?: string
  returnToMessaging?: boolean
}

export interface VibeUnifiedCommunicationsViewProps {
  currentUser?: {
    name?: string
    email?: string
    headline?: string
    avatar?: string
    profession?: string
  }
  onNavigateTab?: (tab: string) => void
  onOpenVibeCampus?: () => void
  studioHandoff?: StudioCallHandoffPayload | null
  onReturnToMessaging?: (opts?: {
    keepCallActive?: boolean
    mode?: "audio" | "video" | "screenshare"
  }) => void
}

type MainSectionTab = "workspace" | "video_call_studio"

type ChatCategoryMode =
  | "all"
  | "work"
  | "family"
  | "school"
  | "church"
  | "customer"
  | "notes"

interface ActionItem {
  id: string
  sourceMessageId: string
  title: string
  owner: string
  dueLabel: string
  reference: string
  status: "Open" | "In Review" | "Completed"
  roomName: string
}

interface ChatMessageItem {
  id: string
  sender: string
  role: string
  time: string
  text: string
  translatedText?: Record<string, string>
  isOwn?: boolean
  state: "Sent" | "Delivered" | "Read"
  attachment?: {
    name: string
    size: string
  }
}

interface ConversationThread {
  id: string
  name: string
  category: Exclude<ChatCategoryMode, "all">
  subtitle: string
  unread: number
  online: boolean
  safetyCode: string
  retentionPolicy: string
  membersCount: number
  messages: ChatMessageItem[]
}

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: "room-launch-standup",
    name: "Product Launch & Weekly Standup",
    category: "work",
    subtitle: "Team Room · Active discussion & call prep",
    unread: 2,
    online: true,
    safetyCode: "88412 09341 77210 44198 60125 33910",
    retentionPolicy: "Team Room",
    membersCount: 14,
    messages: [
      {
        id: "msg-work-1",
        sender: "Dr. Kwame Osei",
        role: "Project Lead",
        time: "09:14 AM",
        text: "Good morning team! The Friday launch checklist is ready for review. Please join the 10:00 AM video call so we can finalize the client demo flow.",
        translatedText: {
          Twi: "Maakye kuw! Yawda dwumadi nhyehyɛe krataa no ayɛ krado. Yɛn hyiamu no bɛhyɛ ase anɔpa dɔn du.",
          French: "Bonjour l'équipe ! La liste de lancement de vendredi est prête pour révision. Rejoignez l'appel vidéo à 10h00.",
          Spanish: "¡Buenos días equipo! La lista de lanzamiento del viernes está lista para revisar. Únanse a la videollamada a las 10:00 AM.",
        },
        state: "Read",
        attachment: {
          name: "Q2_Launch_Checklist.pdf",
          size: "240 KB",
        },
      },
      {
        id: "msg-work-2",
        sender: "Ama Mensah",
        role: "Operations Coordinator",
        time: "09:18 AM",
        text: "Confirmed — partner slides are updated and calendar invites for Friday's walkthrough have been sent out.",
        translatedText: {
          Twi: "Mate — ayɛ krado, na yɛde nkrataa no amena ahɔho no nyinaa.",
          French: "Confirmé — les diapositives partenaires sont à jour et les invitations de vendredi sont envoyées.",
          Spanish: "Confirmado — las diapositivas de socios están actualizadas y enviamos las invitaciones para el viernes.",
        },
        state: "Read",
      },
    ],
  },
  {
    id: "room-client-support",
    name: "Client & Partner Support Desk",
    category: "customer",
    subtitle: "Partner Check-In · Onboarding call confirmed",
    unread: 1,
    online: true,
    safetyCode: "51920 44812 30911 66204 88103 19450",
    retentionPolicy: "Encrypted",
    membersCount: 8,
    messages: [
      {
        id: "msg-cust-1",
        sender: "Efua Boateng",
        role: "Client Success Manager",
        time: "10:05 AM",
        text: "Our onboarding guide for Acme Holdings is uploaded below. They asked for a quick screen-share walkthrough at 2:30 PM today.",
        translatedText: {
          Twi: "Yɛde akwankyerɛ krataa no ato ha. Wɔpɛ sɛ yɛkyerɛ wɔn wɔ video so awia 2:30.",
          French: "Notre guide d'intégration pour Acme Holdings est ci-dessous. Ils souhaitent une démonstration à 14h30.",
          Spanish: "Nuestra guía de incorporación para Acme Holdings está adjunta. Solicitaron una revisión compartida a las 2:30 PM.",
        },
        state: "Read",
        attachment: {
          name: "Partner_Onboarding_Guide.pdf",
          size: "1.2 MB",
        },
      },
    ],
  },
  {
    id: "room-career-study",
    name: "Leadership & Career Study Group",
    category: "school",
    subtitle: "Learning Cohort · Thursday mentoring call",
    unread: 2,
    online: true,
    safetyCode: "73014 88921 10244 55390 21847 64012",
    retentionPolicy: "Encrypted",
    membersCount: 32,
    messages: [
      {
        id: "msg-school-1",
        sender: "Prof. Kojo Addo",
        role: "Cohort Mentor",
        time: "Yesterday",
        text: "Looking forward to Thursday's live Q&A call. Drop your leadership case questions here ahead of our session.",
        translatedText: {
          Twi: "M'ani gye Yawda adesua hyiamu no ho. Momfa mo nsɛmmisa ngu ha ansa na yɛahyia.",
          French: "Hâte de vous retrouver jeudi pour notre session questions-réponses en direct. Posez vos questions ici.",
          Spanish: "Nos vemos el jueves en la llamada de preguntas y respuestas en vivo. Dejen sus preguntas aquí.",
        },
        state: "Delivered",
      },
    ],
  },
  {
    id: "room-community-hub",
    name: "Community Events & Outreach Hub",
    category: "church",
    subtitle: "Weekend Volunteers · Livestream & coordination",
    unread: 0,
    online: true,
    safetyCode: "62041 33819 90512 11478 77320 50981",
    retentionPolicy: "Encrypted",
    membersCount: 84,
    messages: [
      {
        id: "msg-comm-1",
        sender: "Grace Owusu",
        role: "Outreach Organizer",
        time: "Yesterday",
        text: "Volunteers check-in starts Saturday at 8:30 AM. Use Live Video Studio if you want to join the briefing remotely.",
        translatedText: {
          Twi: "Adwumayɛfo nhyiamu no bɛhyɛ ase Memeneda anɔpa 8:30. Mo a mo wɔ akyiri no betumi abɛka ho wɔ video so.",
          French: "L'accueil des bénévoles commence samedi à 8h30. Rejoignez le briefing à distance via le studio vidéo.",
          Spanish: "El registro de voluntarios empieza el sábado a las 8:30 AM. Pueden unirse a la reunión por videollamada.",
        },
        state: "Read",
      },
    ],
  },
  {
    id: "room-family-catchup",
    name: "Family Catch-Up Room",
    category: "family",
    subtitle: "Private Family Call · Sunday evening reunion",
    unread: 1,
    online: true,
    safetyCode: "91402 67230 48105 33920 12084 77615",
    retentionPolicy: "Private",
    membersCount: 9,
    messages: [
      {
        id: "msg-fam-1",
        sender: "Auntie Akosua",
        role: "Family Member",
        time: "8:15 PM",
        text: "Everyone free for a quick Sunday evening video call at 6:00 PM? Auntie Maggie wants to join from Accra too!",
        translatedText: {
          Twi: "Obiara benya kwan Kwasida anwummere dɔn nsia ama yɛadi nkɔmmɔ wɔ video so anaa?",
          French: "Tout le monde est libre dimanche à 18h pour un appel vidéo en famille ? Tante Maggie se connectera depuis Accra !",
          Spanish: "¿Todos están libres el domingo a las 6:00 PM para una videollamada familiar? ¡La tía Maggie se conectará desde Accra!",
        },
        state: "Read",
      },
    ],
  },
  {
    id: "room-personal-notes",
    name: "Personal Meeting Notes",
    category: "notes",
    subtitle: "Private Notes · Visible only to you",
    unread: 0,
    online: true,
    safetyCode: "40291 18374 65029 94102 38475 11029",
    retentionPolicy: "Saved Notes",
    membersCount: 1,
    messages: [
      {
        id: "msg-notes-1",
        sender: "Personal Note",
        role: "Self Notes",
        time: "Today",
        text: "Agenda for next client check-in: 1) Share timeline update, 2) Walk through invoice milestone, 3) Confirm training date.",
        translatedText: {
          Twi: "Nhyiamu nhyehyɛe: 1) Kyerɛ bere nhyehyɛe foforo, 2) Hwɛ akontaabu no mu, 3) Si ntetee da no so dua.",
          French: "Ordre du jour client : 1) Partager le calendrier, 2) Revoir le jalon de facturation, 3) Confirmer la date de formation.",
          Spanish: "Agenda para el cliente: 1) Compartir cronograma, 2) Revisar hitos de facturación, 3) Confirmar fecha de capacitación.",
        },
        state: "Read",
      },
    ],
  },
]

function createCallRoomId(convId: string): string {
  const slug =
    convId
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 12) || "room"
  return `call-${slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function VibeUnifiedCommunicationsView({
  currentUser,
  onOpenVibeCampus,
  studioHandoff,
  onReturnToMessaging,
}: VibeUnifiedCommunicationsViewProps) {
  const [storedHandoff] = useState<StudioCallHandoffPayload | null>(() => {
    if (studioHandoff) return studioHandoff
    if (typeof window === "undefined") return null
    try {
      const raw = sessionStorage.getItem("connectln_studio_handoff_v1")
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed && parsed.callId && (!parsed.ts || Date.now() - Number(parsed.ts) < 15 * 60 * 1000)) {
        return parsed as StudioCallHandoffPayload
      }
    } catch {}
    return null
  })

  const effectiveHandoff = studioHandoff || storedHandoff

  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>(() => {
    if (effectiveHandoff?.callId) return "video_call_studio"
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search)
      if (sp.get("joinCall") || sp.get("call")) return "video_call_studio"
    }
    return "workspace"
  })
  const [joinedCallRoomId, setJoinedCallRoomId] = useState<string | null>(() => {
    if (effectiveHandoff?.callId) return effectiveHandoff.callId
    if (typeof window !== "undefined") {
      const joinCallParam = new URLSearchParams(window.location.search).get("joinCall")
      if (joinCallParam) return joinCallParam
    }
    return null
  })

  useEffect(() => {
    if (studioHandoff?.callId) {
      setJoinedCallRoomId(studioHandoff.callId)
      setCallMode(studioHandoff.mode || "video")
      setActiveMainTab("video_call_studio")
      return
    }
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const joinCallParam = params.get("joinCall") || params.get("call")
    if (joinCallParam) {
      setJoinedCallRoomId(joinCallParam)
      setActiveMainTab("video_call_studio")
    }
  }, [studioHandoff])

  const [chatCategory, setChatCategory] = useState<ChatCategoryMode>("all")
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS)
  const [selectedConvId, setSelectedConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<string>("Original")
  const [interfaceDensity, setInterfaceDensity] = useState<"compact" | "comfortable">("comfortable")
  const [showSafetyModal, setShowSafetyModal] = useState(false)

  const [callState, setCallState] = useState<"IDLE" | "CONNECTED">("IDLE")
  const [callMode, setCallMode] = useState<"audio" | "video" | "screenshare">(
    effectiveHandoff?.mode || "video"
  )
  const [inlineCallRoomId, setInlineCallRoomId] = useState<string | null>(null)
  const [inlineCallNonce, setInlineCallNonce] = useState<number>(0)
  const [studioSessionNonce, setStudioSessionNonce] = useState<number>(0)

  const [aiConsentMode, setAiConsentMode] = useState<"on_device" | "explicit_share">("on_device")
  const [aiOutputTitle, setAiOutputTitle] = useState<string>("Noctis Meeting Assistant")
  const [aiOutputContent, setAiOutputContent] = useState<string>(
    "Keep summaries private on this device, or switch to Live Noctis AI to generate custom recaps from this conversation."
  )

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "act-101",
      sourceMessageId: "msg-work-1",
      title: "Confirm Friday launch demo slides and invite partner leads",
      owner: "Dr. Kwame Osei",
      dueLabel: "This Friday",
      reference: "Q2_Launch_Checklist.pdf",
      status: "In Review",
      roomName: "Product Launch & Weekly Standup",
    },
    {
      id: "act-102",
      sourceMessageId: "msg-cust-1",
      title: "Share updated onboarding checklist ahead of kickoff call",
      owner: "Efua Boateng",
      dueLabel: "Today · 2:30 PM",
      reference: "Partner_Onboarding_Guide.pdf",
      status: "Open",
      roomName: "Client & Partner Support Desk",
    },
  ])

  const [registeredMembers, setRegisteredMembers] = useState<ShareTarget[]>([])

  useEffect(() => {
    let cancelled = false
    const compactKey = (v?: string) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const myNameKey = compactKey(currentUser?.name)
    const myEmailKey = String(currentUser?.email || "").trim().toLowerCase()

    Promise.allSettled([
      fetch("/api/connectin/users", { cache: "no-store" }).then((r) => r.json()),
      loadMembers(true),
    ]).then((results) => {
      if (cancelled) return
      const usersData = results[0].status === "fulfilled" ? results[0].value : null
      const shareTargets: ShareTarget[] = results[1].status === "fulfilled" ? results[1].value : []
      const combined: ShareTarget[] = []
      const seen = new Set<string>()

      const pushItem = (item: ShareTarget) => {
        const cleanName = String(item.name || "").trim()
        const nk = compactKey(cleanName)
        const ek = String(item.email || "").trim().toLowerCase()
        if (!nk) return
        if ((myNameKey && nk === myNameKey) || (myEmailKey && ek && ek === myEmailKey)) return
        if (seen.has(nk) || (ek && seen.has(`e:${ek}`))) return
        seen.add(nk)
        if (ek) seen.add(`e:${ek}`)
        combined.push({ ...item, name: cleanName })
      }

      if (Array.isArray(usersData?.users)) {
        for (const u of usersData.users) {
          pushItem({
            id: `vibe_usr_${String(u.email || u.phone || u.name).toLowerCase()}`,
            name: String(u.name || ""),
            email: u.email ? String(u.email).trim().toLowerCase() : undefined,
            phone: u.phone ? String(u.phone).trim() : undefined,
            avatar: u.avatar && !String(u.avatar).startsWith("data:") ? u.avatar : undefined,
            subtitle: u.headline || "Verified ConnectLn Member",
          })
        }
      }
      for (const m of shareTargets) pushItem(m)
      setRegisteredMembers(combined)
    })

    return () => {
      cancelled = true
    }
  }, [currentUser?.name, currentUser?.email])

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0]
  }, [conversations, selectedConvId])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesCat = chatCategory === "all" || c.category === chatCategory
      const matchesQuery =
        !searchQuery.trim() ||
        scoreMemberSearchMatch(
          [c.name, c.subtitle, ...c.messages.map((m) => m.text)],
          searchQuery
        ) > 0
      return matchesCat && matchesQuery
    })
  }, [conversations, chatCategory, searchQuery])

  const matchedRegisteredMembers = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return registeredMembers.slice(0, 10)
    return filterAndRankMembers(registeredMembers, q, (m) => [
      m.name,
      m.email,
      m.phone,
      m.subtitle,
    ]).slice(0, 8)
  }, [registeredMembers, searchQuery])

  useEffect(() => {
    if (
      filteredConversations.length > 0 &&
      !filteredConversations.some((c) => c.id === selectedConvId)
    ) {
      setSelectedConvId(filteredConversations[0].id)
    }
  }, [filteredConversations, selectedConvId])

  const handleStartInlineRoomCall = (mode: "audio" | "video" | "screenshare") => {
    setCallMode(mode)
    setInlineCallRoomId(createCallRoomId(selectedConversation.id))
    setInlineCallNonce((n) => n + 1)
    setCallState("CONNECTED")
  }

  const handleSelectOrCallMember = (member: ShareTarget, directCallMode?: "audio" | "video") => {
    const compactKey = (v?: string) => String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const mKey = compactKey(member.name)
    const existing = conversations.find((c) => compactKey(c.name) === mKey)

    const targetId = existing ? existing.id : `dm-member-${mKey || Date.now()}`
    if (!existing) {
      const newConv: ConversationThread = {
        id: targetId,
        name: member.name,
        category: "work",
        subtitle: member.subtitle || member.email || "Verified ConnectLn Member",
        unread: 0,
        online: true,
        safetyCode: "88412 09341 77210 44198 60125 33910",
        retentionPolicy: "Direct Member",
        membersCount: 2,
        messages: [],
      }
      setConversations((prev) => [newConv, ...prev])
    }

    setChatCategory("all")
    setSelectedConvId(targetId)
    setSearchQuery("")

    if (directCallMode) {
      setCallMode(directCallMode)
      setInlineCallRoomId(createCallRoomId(targetId))
      setInlineCallNonce((n) => n + 1)
      setCallState("CONNECTED")
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || "You",
      role: currentUser?.profession || "Team Member",
      time: "Just now",
      text: messageInput.trim(),
      isOwn: true,
      state: "Sent",
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg] } : c))
    )
    setMessageInput("")
  }

  const handleSaveActionItem = (msg: ChatMessageItem) => {
    const newItem: ActionItem = {
      id: `act-${Date.now().toString().slice(-4)}`,
      sourceMessageId: msg.id,
      title: msg.text.length > 76 ? `${msg.text.slice(0, 76)}...` : msg.text,
      owner: currentUser?.name || msg.sender || "You",
      dueLabel: "Within 48 Hours",
      reference: msg.attachment?.name || selectedConversation.name,
      status: "Open",
      roomName: selectedConversation.name,
    }
    setActionItems((prev) => [newItem, ...prev])
  }

  const handleAdvanceActionStatus = (itemId: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        if (item.status === "Open") return { ...item, status: "In Review" }
        if (item.status === "In Review") return { ...item, status: "Completed" }
        return item
      })
    )
  }

  const runVibeAiAction = async (type: "summarize" | "decision" | "tasks" | "translate") => {
    const modeLabel = aiConsentMode === "on_device" ? "Private Mode" : "Live Noctis AI"

    if (aiConsentMode === "explicit_share" && type !== "translate") {
      const transcript = selectedConversation.messages
        .slice(-8)
        .map((m) => `${m.sender}: ${m.text}`)
        .join("\n")
      const promptByType: Record<string, string> = {
        summarize: `Summarize this conversation concisely in 3 bullet points:\n\n${transcript}`,
        decision: `Identify the key decisions or confirmations in this conversation:\n\n${transcript}`,
        tasks: `List concrete follow-up action items from this conversation:\n\n${transcript}`,
      }
      setAiOutputTitle("Asking Live Noctis AI...")
      try {
        const res = await fetch("/api/connectin/noctis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: promptByType[type] }),
        })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.text) {
          setAiOutputTitle(`Noctis AI · ${type === "summarize" ? "Summary" : type === "decision" ? "Key Decisions" : "Action Items"}`)
          setAiOutputContent(data.text)
          return
        }
      } catch {
        // Fall through to local summary from the visible conversation messages
      }
    }

    const recentMessages = selectedConversation.messages.slice(-3)
    if (type === "summarize") {
      const bullets = recentMessages
        .map((m) => `• ${m.sender} (${m.time}): ${m.text}`)
        .join("\n")
      setAiOutputTitle(`Conversation Summary · ${modeLabel}`)
      setAiOutputContent(bullets || `No messages in ${selectedConversation.name} yet.`)
    } else if (type === "decision") {
      const latest = recentMessages[recentMessages.length - 1]
      setAiOutputTitle(`Key Decisions · ${modeLabel}`)
      setAiOutputContent(
        latest
          ? `Latest update in ${selectedConversation.name}: ${latest.sender} noted — "${latest.text}"`
          : `No recent updates recorded in ${selectedConversation.name}.`
      )
    } else if (type === "tasks") {
      const generatedTasks = recentMessages
        .map((m, idx) => `${idx + 1}. Follow up with ${m.sender}: ${m.text.slice(0, 90)}${m.text.length > 90 ? "..." : ""}`)
        .join("\n")
      setAiOutputTitle(`Suggested Action Items · ${modeLabel}`)
      setAiOutputContent(generatedTasks || "No follow-up items found in the current thread.")
    } else {
      const next =
        selectedTranslationLang === "Twi" ? "French" : selectedTranslationLang === "French" ? "Spanish" : "Twi"
      setSelectedTranslationLang(next)
      setAiOutputTitle(`Translated to ${next} · ${modeLabel}`)
      setAiOutputContent(`Inline ${next} translations are now active for messages in ${selectedConversation.name}.`)
    }
  }

  return (
    <div className="space-y-5 pb-12">
      {/* HERO HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-[#071A12] via-[#0B291E] to-[#0A2540] text-white p-5 sm:p-7 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <Lock className="h-3.5 w-3.5" />
                ConnectLn HD Calls · End-to-End Encrypted
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-medium text-teal-200">
                HD Video · Crystal-Clear Voice · Screen Share
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              HD Video Calls, Voice Rooms &amp; Encrypted Team Messaging
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              Start encrypted 1:1 or group video calls, host voice rooms, share your screen, and capture follow-up
              action items across web and mobile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMainTab("video_call_studio")}
              className="rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Launch Live Video &amp; Call Studio</span>
            </button>
            {onOpenVibeCampus && (
              <button
                type="button"
                onClick={onOpenVibeCampus}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Ask Noctis</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-TAB CONSUMER NAVIGATION */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            {
              id: "workspace" as MainSectionTab,
              label: "1. Calls & Conversations",
              badge: "ROOMS",
              icon: MessageSquare,
            },
            {
              id: "video_call_studio" as MainSectionTab,
              label: "2. Live Video & Call Studio",
              badge: "HD VIDEO",
              icon: Video,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeMainTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-emerald-100 hover:bg-white/15 border border-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    active ? "bg-slate-950/20 text-slate-950 font-extrabold" : "bg-black/30 text-emerald-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =====================================================================
          TAB 2: LIVE VIDEO & CALL STUDIO
         ===================================================================== */}
      {activeMainTab === "video_call_studio" && (
        <VibeVideoCallStudio
          key={effectiveHandoff?.callId || joinedCallRoomId || `studio-standby-${studioSessionNonce}`}
          conversationId={effectiveHandoff?.conversationId || joinedCallRoomId || selectedConversation.id}
          conversationName={effectiveHandoff?.conversationName || selectedConversation.name}
          initialMode={effectiveHandoff?.mode || callMode}
          autoStartCall={Boolean(effectiveHandoff?.callId || joinedCallRoomId)}
          currentUserName={currentUser?.name || "You"}
          currentUserAvatar={currentUser?.avatar}
          currentUserEmail={currentUser?.email}
          initialCallRoomId={effectiveHandoff?.callId || joinedCallRoomId}
          canReturnToMessaging={Boolean(effectiveHandoff?.returnToMessaging && onReturnToMessaging)}
          onReturnToMessagingHuddle={
            effectiveHandoff?.returnToMessaging && onReturnToMessaging
              ? (activeMode) => onReturnToMessaging({ keepCallActive: true, mode: activeMode })
              : undefined
          }
          onCreateWorkflowFromCall={(title, owner, evidence) => {
            setActionItems((prev) => [
              {
                id: `act-${Date.now().toString().slice(-4)}`,
                sourceMessageId: "call-notes",
                title,
                owner,
                dueLabel: "Within 48 Hours",
                reference: evidence,
                status: "Open",
                roomName: effectiveHandoff?.conversationName || selectedConversation.name,
              },
              ...prev,
            ])
          }}
          onCloseStudio={() => {
            if (effectiveHandoff?.returnToMessaging && onReturnToMessaging) {
              onReturnToMessaging({ keepCallActive: false })
            } else {
              setJoinedCallRoomId(null)
              setStudioSessionNonce((n) => n + 1)
              try {
                sessionStorage.removeItem("connectln_studio_handoff_v1")
              } catch {}
              setActiveMainTab("workspace")
            }
          }}
        />
      )}

      {/* =====================================================================
          TAB 1: CALLS & CONVERSATIONS WORKSPACE
         ===================================================================== */}
      {activeMainTab === "workspace" && (
        <div className="space-y-4">
          {/* Category Filters & Language Bar */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Conversations", icon: Layers },
                { id: "work", label: "Team Rooms", icon: Briefcase },
                { id: "customer", label: "Clients & Partners", icon: Building2 },
                { id: "school", label: "Study & Learning", icon: GraduationCap },
                { id: "church", label: "Community", icon: Heart },
                { id: "family", label: "Family", icon: Shield },
                { id: "notes", label: "Meeting Notes", icon: FileText },
              ].map((cat) => {
                const Icon = cat.icon
                const active = chatCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setChatCategory(cat.id as ChatCategoryMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1 border border-zinc-200 dark:border-zinc-700">
                <Languages className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">Translate:</span>
                {["Original", "Twi", "French", "Spanish"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedTranslationLang(lang)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      selectedTranslationLang === lang
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setInterfaceDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                Layout: {interfaceDensity === "comfortable" ? "Comfortable" : "Compact"}
              </button>
            </div>
          </div>

          {/* Inline Call Studio when triggered directly from a room header */}
          {callState !== "IDLE" && (
            <VibeVideoCallStudio
              key={inlineCallRoomId || "inline-call"}
              conversationId={selectedConversation.id}
              conversationName={selectedConversation.name}
              initialMode={callMode}
              autoStartCall={true}
              callTriggerNonce={inlineCallNonce}
              initialCallRoomId={inlineCallRoomId}
              currentUserName={currentUser?.name || "You"}
              currentUserAvatar={currentUser?.avatar}
              currentUserEmail={currentUser?.email}
              onCreateWorkflowFromCall={(title, owner, evidence) => {
                setActionItems((prev) => [
                  {
                    id: `act-${Date.now().toString().slice(-4)}`,
                    sourceMessageId: "call-notes",
                    title,
                    owner,
                    dueLabel: "Within 48 Hours",
                    reference: evidence,
                    status: "Open",
                    roomName: selectedConversation.name,
                  },
                  ...prev,
                ])
              }}
              onCloseStudio={() => {
                setInlineCallRoomId(null)
                setCallState("IDLE")
              }}
            />
          )}

          {/* 3-COLUMN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT: Conversations List */}
            <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    Conversations ({filteredConversations.length})
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Synced
                  </span>
                </div>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, calls, or conversations..."
                    className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 pl-8 pr-7 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70 max-h-[560px] overflow-y-auto">
                {searchQuery.trim().length > 0 && matchedRegisteredMembers.length > 0 && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="px-3.5 py-1.5 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-100 dark:border-emerald-900">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Registered People — Tap to Call ({matchedRegisteredMembers.length})
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Direct Call
                      </span>
                    </div>
                    {matchedRegisteredMembers.map((member) => {
                      const avatarSrc =
                        member.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=059669`
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleSelectOrCallMember(member)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img
                              src={avatarSrc}
                              alt={member.name}
                              className="h-9 w-9 rounded-full object-cover shrink-0 border border-emerald-200 dark:border-emerald-800"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                                {member.name}
                              </p>
                              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">
                                {member.subtitle || member.email || "Verified ConnectLn Member"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOrCallMember(member, "audio")
                              }}
                              title={`Voice Call ${member.name}`}
                              className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 dark:border-emerald-800 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOrCallMember(member, "video")
                              }}
                              title={`Video Call ${member.name}`}
                              className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Video className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConversation.id
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full text-left p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                        {conv.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {conv.name}
                          </p>
                          {conv.unread > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {conv.subtitle}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span>{conv.membersCount} {conv.membersCount === 1 ? "member" : "members"}</span>
                          <span>·</span>
                          <span>{conv.retentionPolicy}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {!searchQuery.trim() && matchedRegisteredMembers.length > 0 && (
                  <div className="bg-zinc-50/60 dark:bg-zinc-950/30">
                    <div className="px-3.5 py-1.5 bg-zinc-100/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        ConnectLn People ({registeredMembers.length})
                      </span>
                    </div>
                    {matchedRegisteredMembers.map((member) => {
                      const avatarSrc =
                        member.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=059669`
                      return (
                        <div
                          key={`browse_${member.id}`}
                          onClick={() => handleSelectOrCallMember(member)}
                          className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img
                              src={avatarSrc}
                              alt={member.name}
                              className="h-8 w-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {member.name}
                              </p>
                              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">
                                {member.subtitle || member.email || "Verified ConnectLn Member"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOrCallMember(member, "audio")
                              }}
                              title={`Voice Call ${member.name}`}
                              className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOrCallMember(member, "video")
                              }}
                              title={`Video Call ${member.name}`}
                              className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Video className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Active Room & Messages */}
            <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/60 dark:bg-zinc-900">
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                    {selectedConversation.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowSafetyModal(!showSafetyModal)}
                      className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="h-3 w-3" />
                      <span>End-to-End Encrypted · Verify Safety Code</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartInlineRoomCall("audio")}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Start Audio Call"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartInlineRoomCall("video")}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Start Video Call"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartInlineRoomCall("screenshare")}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Share Screen"
                  >
                    <MonitorUp className="h-3.5 w-3.5 text-teal-600" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {showSafetyModal && (
                <div className="p-3.5 bg-emerald-950 text-emerald-100 border-b border-emerald-700/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">
                      End-to-End Encryption Verification
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSafetyModal(false)}
                      className="text-[11px] text-emerald-300 underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-100/85">
                    Compare this safety code with other participants to confirm your calls and messages are end-to-end encrypted.
                  </p>
                  <p className="font-mono text-xs bg-black/40 p-2 rounded-lg border border-emerald-500/30">
                    Safety Code: {selectedConversation.safetyCode}
                  </p>
                </div>
              )}

              <div
                className={`p-4 space-y-3 overflow-y-auto max-h-[460px] bg-zinc-50/40 dark:bg-zinc-950/40 ${
                  interfaceDensity === "compact" ? "text-xs" : "text-sm"
                }`}
              >
                {selectedConversation.messages.map((msg) => {
                  const translated =
                    selectedTranslationLang !== "Original"
                      ? msg.translatedText?.[selectedTranslationLang]
                      : undefined
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl p-3.5 border ${
                        msg.isOwn
                          ? "bg-emerald-600 text-white border-emerald-500 ml-6"
                          : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-xs font-extrabold ${
                            msg.isOwn ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {msg.sender}
                        </span>
                        <span
                          className={`text-[10px] ${
                            msg.isOwn ? "text-emerald-100" : "text-zinc-400"
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>

                      <p className={msg.isOwn ? "text-white" : "text-zinc-800 dark:text-zinc-200"}>
                        {msg.text}
                      </p>

                      {translated && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                          <strong className="text-emerald-700 dark:text-emerald-300 block">
                            {selectedTranslationLang}:
                          </strong>
                          <span className="text-zinc-800 dark:text-zinc-200">{translated}</span>
                        </div>
                      )}

                      {msg.attachment && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              📎 {msg.attachment.name}
                            </span>
                            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                              {msg.attachment.size}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500">Encrypted attachment</div>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-[10px] ${msg.isOwn ? "text-emerald-100" : "text-zinc-400"}`}>
                          {msg.role}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveActionItem(msg)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              msg.isOwn
                                ? "bg-white/20 text-white"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            Save Action Item
                          </button>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                              msg.isOwn ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            <CheckCheck className="h-3.5 w-3.5" /> {msg.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    placeholder={`Write a message to ${selectedConversation.name}...`}
                    className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Noctis Meeting Assistant + Meeting Action Items */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>Noctis Meeting Assistant</span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 px-1.5 py-0.5 text-[9px] font-bold">
                          {aiConsentMode === "on_device" ? "Private" : "Live AI"}
                        </span>
                      </h3>
                      <p className="text-[10px] text-zinc-500">
                        Keep summaries private on this device, or share this thread with Noctis AI.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAiConsentMode((m) => (m === "on_device" ? "explicit_share" : "on_device"))
                    }
                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-[10px] font-bold cursor-pointer shrink-0"
                  >
                    {aiConsentMode === "on_device" ? "Private Mode" : "Live Noctis AI"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("summarize")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    Summarize Thread
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("decision")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    Key Decisions
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("tasks")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    Action Items
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("translate")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    Translate (Twi/FR/ES)
                  </button>
                </div>

                <div className="rounded-xl bg-emerald-950/90 text-emerald-50 p-3 border border-emerald-700/50 space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-300">{aiOutputTitle}</p>
                  <p className="text-xs whitespace-pre-line leading-relaxed text-emerald-100/95">
                    {aiOutputContent}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4 text-emerald-600" />
                  <span>Meeting Action Items</span>
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Owner: {item.owner} · {item.dueLabel} · {item.reference}
                      </div>
                      {item.status !== "Completed" && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceActionStatus(item.id)}
                          className="w-full py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold cursor-pointer"
                        >
                          {item.status === "Open" ? "Move to In Review" : "Mark Complete"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VibeUnifiedCommunicationsView
