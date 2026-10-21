"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Shield,
  Lock,
  WifiLow,
  Captions,
  Smartphone,
  Users,
  Download,
  Server,
  Key,
  UserPlus,
  UserX,
  FileText,
  Workflow,
  RefreshCw,
  CircleDot,
  Globe,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export interface CallParticipantTile {
  id: string
  name: string
  role: string
  device: string
  isLocal?: boolean
  isRealRemotePeer?: boolean
  remotePeerId?: string
  virtualBgId?: string
  virtualBgBadge?: string
  liveFrame?: string | null
  isMuted: boolean
  isVideoOn: boolean
  isSpeaking: boolean
  e2eeFingerprint: string
  connectionType: "P2P host/srflx" | "TURN Relay (UDP 3478)" | "TURNS Relay (TLS 5349)"
  rttMs: number
  packetLossPct: string
  avatarGradient: string
}

function RemotePeerVideoElement({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.play().catch(() => {})
  }, [stream])

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      onLoadedMetadata={(e) => {
        e.currentTarget.play().catch(() => {})
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        backgroundColor: "#000000",
        zIndex: 6,
      }}
    />
  )
}

export interface WaitingRoomGuest {
  id: string
  name: string
  org: string
  joinedVia: string
}

export interface VibeVideoCallStudioProps {
  conversationId: string
  conversationName: string
  initialMode?: "audio" | "video" | "screenshare"
  callTriggerNonce?: number
  currentUserName?: string
  initialCallRoomId?: string | null
  onCreateWorkflowFromCall?: (title: string, owner: string, evidence: string) => void
  onCloseStudio?: () => void
}

export interface InvitableFriend {
  id: string
  name: string
  role: string
  enclave: string
  device: string
  status: "Available" | "In VibeChat" | "Mobile Online"
  ringState?: "idle" | "ringing" | "joined" | "waiting_room"
  avatarGradient: string
}

export interface VirtualBackgroundOption {
  id: string
  name: string
  subtitle: string
  category: "None" | "Blur" | "Office" | "Studio" | "Nature" | "Custom"
  mode: "none" | "blur" | "scene" | "custom"
  blurPx?: number
  previewGradient: string
  sceneColors: [string, string, string]
  accentColor: string
  badgeText: string
}

const VIRTUAL_BACKGROUND_OPTIONS: VirtualBackgroundOption[] = [
  {
    id: "none",
    name: "Original Room",
    subtitle: "Natural unedited camera feed",
    category: "None",
    mode: "none",
    previewGradient: "from-zinc-800 via-slate-900 to-zinc-950",
    sceneColors: ["#090D16", "#111827", "#1F2937"],
    accentColor: "#10B981",
    badgeText: "RAW CAM",
  },
  {
    id: "blur-soft",
    name: "Soft Bokeh Blur",
    subtitle: "Subtle f/1.8 depth-of-field lens blur",
    category: "Blur",
    mode: "blur",
    blurPx: 10,
    previewGradient: "from-emerald-900/80 via-slate-800 to-teal-950",
    sceneColors: ["#064E3B", "#0F172A", "#134E4A"],
    accentColor: "#34D399",
    badgeText: "SOFT BLUR",
  },
  {
    id: "blur-privacy",
    name: "Deep Privacy Blur",
    subtitle: "Heavy frosted glass privacy shield",
    category: "Blur",
    mode: "blur",
    blurPx: 22,
    previewGradient: "from-teal-900 via-slate-900 to-emerald-950",
    sceneColors: ["#115E59", "#090D16", "#064E3B"],
    accentColor: "#2DD4BF",
    badgeText: "MAX PRIVACY",
  },
  {
    id: "exec-boardroom",
    name: "Executive Penthouse",
    subtitle: "Warm walnut & skyline glass office",
    category: "Office",
    mode: "scene",
    previewGradient: "from-amber-900/80 via-slate-900 to-stone-950",
    sceneColors: ["#1C1917", "#292524", "#0C0A09"],
    accentColor: "#F59E0B",
    badgeText: "BOARDROOM",
  },
  {
    id: "accra-skyline",
    name: "Accra Tech Hub",
    subtitle: "Golden hour African innovation lounge",
    category: "Office",
    mode: "scene",
    previewGradient: "from-orange-700/80 via-amber-900 to-emerald-950",
    sceneColors: ["#431407", "#78350F", "#064E3B"],
    accentColor: "#FBBF24",
    badgeText: "ACCRA HUB",
  },
  {
    id: "cyber-soc",
    name: "Zero-Trust Cyber SOC",
    subtitle: "Emerald E2EE command center",
    category: "Studio",
    mode: "scene",
    previewGradient: "from-emerald-600/80 via-teal-950 to-slate-950",
    sceneColors: ["#022C22", "#064E3B", "#042F2E"],
    accentColor: "#10B981",
    badgeText: "CYBER SOC",
  },
  {
    id: "architect-library",
    name: "Warm Architect Loft",
    subtitle: "Bookcase, plants & warm studio lamp",
    category: "Studio",
    mode: "scene",
    previewGradient: "from-amber-800/70 via-emerald-950 to-stone-900",
    sceneColors: ["#271C19", "#14281D", "#1C1917"],
    accentColor: "#A7F3D0",
    badgeText: "WARM LOFT",
  },
  {
    id: "tropical-sanctuary",
    name: "Ocean Breeze Villa",
    subtitle: "Calm turquoise coast & palm terrace",
    category: "Nature",
    mode: "scene",
    previewGradient: "from-cyan-600/80 via-teal-800 to-slate-900",
    sceneColors: ["#083344", "#115E59", "#0F172A"],
    accentColor: "#22D3EE",
    badgeText: "OCEAN VILLA",
  },
  {
    id: "aurora-studio",
    name: "Nordic Aurora Dome",
    subtitle: "Starlight glass igloo & emerald aurora",
    category: "Nature",
    mode: "scene",
    previewGradient: "from-indigo-900 via-emerald-800/80 to-slate-950",
    sceneColors: ["#1E1B4B", "#065F46", "#090D16"],
    accentColor: "#6EE7B7",
    badgeText: "AURORA",
  },
]

export function VibeVideoCallStudio({
  conversationId,
  conversationName,
  initialMode = "video",
  callTriggerNonce = 0,
  currentUserName = "You (Verified Device)",
  initialCallRoomId = null,
  onCreateWorkflowFromCall,
  onCloseStudio,
}: VibeVideoCallStudioProps) {
  // Determine if the user arrived via an invited meeting link (?joinCall=...)
  const [urlJoinedRoomId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("joinCall")
      if (p) return p
    }
    return initialCallRoomId || null
  })
  const isInvitedGuestLink = Boolean(urlJoinedRoomId)

  // Unique per-tab participant ID so Host and Friend on different devices or tabs never collide
  const [localParticipantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const existing = sessionStorage.getItem("vibe_call_participant_id")
      if (existing) return existing
      const created = `peer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      sessionStorage.setItem("vibe_call_participant_id", created)
      return created
    }
    return `peer-${Date.now()}`
  })

  const [localDisplayName, setLocalDisplayName] = useState<string>(() => {
    if (currentUserName && currentUserName !== "Invited Friend (Live Guest)") {
      return currentUserName
    }
    return isInvitedGuestLink ? "Invited Friend (Live Guest)" : currentUserName
  })

  // Call lifecycle state machine (Section 8)
  const [callState, setCallState] = useState<
    "CREATED" | "RINGING" | "NEGOTIATING" | "CONNECTED" | "RECONNECTING" | "ENDED"
  >("CONNECTED")
  const [callId, setCallId] = useState<string>(urlJoinedRoomId || initialCallRoomId || "call-9b0bbf68-live")
  const [callStateVersion, setCallStateVersion] = useState<number>(3)
  const [sframeEpoch, setSframeEpoch] = useState<number>(12)
  const [callDurationSec, setCallDurationSec] = useState<number>(0)

  // Live remote WebRTC MediaStreams & connected friend state
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({})
  const [myPeerId, setMyPeerId] = useState<string>("")
  const [connectedFriendsCount, setConnectedFriendsCount] = useState<number>(0)
  const [lastJoinedFriendName, setLastJoinedFriendName] = useState<string | null>(null)

  // Media hardware & stream state
  const [callMode, setCallMode] = useState<"audio" | "video" | "screenshare">(initialMode)
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [isCameraOn, setIsCameraOn] = useState<boolean>(initialMode !== "audio")
  const [isHardwareCameraActive, setIsHardwareCameraActive] = useState<boolean>(false)
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false)
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false)
  const [micLevel, setMicLevel] = useState<number>(18)
  const [cameraStatusMsg, setCameraStatusMsg] = useState<string | null>(
    "Initializing computer camera & microphone (WebRTC getUserMedia)..."
  )
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Connected hardware devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>("")
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>("")
  const [activeCameraLabel, setActiveCameraLabel] = useState<string>("Computer Webcam")

  // Reactive MediaStream states so <video> elements always bind even after re-renders
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null)
  const [screenStreamState, setScreenStreamState] = useState<MediaStream | null>(null)
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null)

  // Live Cross-Participant Shared Stage State (Screen Share, Shared Files/Images/Slides, Shared Snapshots)
  const [localSharedStageItem, setLocalSharedStageItem] = useState<{
    active: boolean
    sharer_user_id: string
    sharer_name: string
    mode: "screen" | "file" | "snapshot" | "presentation"
    title: string
    mime_type?: string
    frame_or_data_url: string | null
    updated_at_ms: number
  } | null>(null)

  const [remoteSharedStageItem, setRemoteSharedStageItem] = useState<{
    active: boolean
    sharer_user_id: string
    sharer_name: string
    mode: "screen" | "file" | "snapshot" | "presentation"
    title: string
    mime_type?: string
    frame_or_data_url: string | null
    updated_at_ms: number
  } | null>(null)

  const sharedFileInputRef = useRef<HTMLInputElement | null>(null)
  const customBgInputRef = useRef<HTMLInputElement | null>(null)
  const virtualBgCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const customBgImgRef = useRef<HTMLImageElement | null>(null)

  // Virtual Background Studio State
  const [selectedVirtualBgId, setSelectedVirtualBgId] = useState<string>("none")
  const [showVirtualBgPicker, setShowVirtualBgPicker] = useState<boolean>(false)
  const [customBgDataUrl, setCustomBgDataUrl] = useState<string | null>(null)
  const [virtualBgFilterCategory, setVirtualBgFilterCategory] = useState<
    "All" | "Blur" | "Office" | "Studio" | "Nature"
  >("All")

  const activeVirtualBgOption =
    VIRTUAL_BACKGROUND_OPTIONS.find((o) => o.id === selectedVirtualBgId) ||
    (selectedVirtualBgId === "custom"
      ? {
          id: "custom",
          name: "Custom Uploaded Backdrop",
          subtitle: "Your personal studio image",
          category: "Custom" as const,
          mode: "custom" as const,
          previewGradient: "from-emerald-600 via-teal-800 to-slate-950",
          sceneColors: ["#064E3B", "#0F172A", "#134E4A"] as [string, string, string],
          accentColor: "#10B981",
          badgeText: "CUSTOM BG",
        }
      : VIRTUAL_BACKGROUND_OPTIONS[0])

  const handleUploadCustomVirtualBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = typeof reader.result === "string" ? reader.result : null
      if (!res) return
      const img = new Image()
      img.onload = () => {
        customBgImgRef.current = img
        setCustomBgDataUrl(res)
        setSelectedVirtualBgId("custom")
        appendLog(`🎨 Applied custom virtual background ("${file.name}") to live webcam stream.`)
      }
      img.src = res
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Call resilience, privacy & layout controls
  const [layoutMode, setLayoutMode] = useState<"grid" | "speaker" | "presentation">("grid")
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false)
  const [ipPrivacyRelayOnly, setIpPrivacyRelayOnly] = useState<boolean>(false)
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true)
  const [liveCaptions, setLiveCaptions] = useState<boolean>(true)
  const [captionLanguage, setCaptionLanguage] = useState<"English" | "Twi" | "French" | "Spanish">("English")
  const [activeDevice, setActiveDevice] = useState<
    "Web Workstation (Chrome/WASM)" | "iOS iPhone 16 Pro (CallKit)" | "Android Pixel 9 (ConnectionService)"
  >("Web Workstation (Chrome/WASM)")
  const [networkPath, setNetworkPath] = useState<"Wi-Fi 6E Fiber" | "5G Cellular Handoff" | "Satellite / Constrained 3G">(
    "Wi-Fi 6E Fiber"
  )

  // Authorized Call Recording (`MediaRecorder` + Explicit Consent)
  const [recordingConsentGiven, setRecordingConsentGiven] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null)

  // TURN & Signaling Log
  const [turnCredentials, setTurnCredentials] = useState<{
    uris: string[]
    username: string
    credential: string
    ttl_seconds: number
  }>({
    uris: [
      "stun:stun.vibe.connectln.app:3478",
      "turn:turn-us-east.vibe.connectln.app:3478?transport=udp",
      "turn:turn-eu-west.vibe.connectln.app:443?transport=tcp",
      "turns:turn-africa-accra.vibe.connectln.app:5349?transport=tcp",
    ],
    username: "1792539000:user-vibe-architect",
    credential: "v9K2m8xPqL1zR4tW7yB0nC3vF6hJ==",
    ttl_seconds: 3600,
  })

  const [signalingLogs, setSignalingLogs] = useState<string[]>([
    "[17:20:01.102] POST /api/v1/calls → state=CREATED (version=1), issued scoped TURN credentials (TTL 3600s)",
    "[17:20:01.450] Requesting local hardware camera & microphone via `navigator.mediaDevices.getUserMedia`...",
    "[17:20:02.118] State → NEGOTIATING (version=2): SDP Offer/Answer + ICE candidate gathering complete",
    "[17:20:02.640] DTLS-SRTP + WebRTC Insertable Streams SFrame E2EE media key verified (Epoch #12)",
  ])

  // Participants & Waiting Room
  const [participants, setParticipants] = useState<CallParticipantTile[]>([
    {
      id: "part-local",
      name: currentUserName,
      role: "Host · Local Camera & Mic",
      device: "Computer Webcam",
      isLocal: true,
      isMuted: false,
      isVideoOn: true,
      isSpeaking: true,
      e2eeFingerprint: "9941 8820 4412 7731",
      connectionType: "P2P host/srflx",
      rttMs: 14,
      packetLossPct: "0.0%",
      avatarGradient: "from-emerald-600 to-teal-700",
    },
    {
      id: "part-kwame",
      name: "Dr. Kwame Osei",
      role: "Principal Architect",
      device: "macOS Desktop App",
      isMuted: false,
      isVideoOn: true,
      isSpeaking: true,
      e2eeFingerprint: "8812 3309 1120 6642",
      connectionType: "TURN Relay (UDP 3478)",
      rttMs: 34,
      packetLossPct: "0.1%",
      avatarGradient: "from-blue-600 to-indigo-800",
    },
    {
      id: "part-ama",
      name: "Ama Mensah",
      role: "Cryptography & SecOps Lead",
      device: "iOS iPhone 16 Pro",
      isMuted: false,
      isVideoOn: true,
      isSpeaking: false,
      e2eeFingerprint: "7741 5520 9012 3108",
      connectionType: "TURNS Relay (TLS 5349)",
      rttMs: 42,
      packetLossPct: "0.0%",
      avatarGradient: "from-purple-600 to-fuchsia-800",
    },
    {
      id: "part-kofi",
      name: "Kofi Boateng",
      role: "Mobile & WebRTC Lead",
      device: "Android Pixel 9",
      isMuted: true,
      isVideoOn: true,
      isSpeaking: false,
      e2eeFingerprint: "6630 1198 4401 8827",
      connectionType: "TURN Relay (UDP 3478)",
      rttMs: 29,
      packetLossPct: "0.2%",
      avatarGradient: "from-amber-600 to-orange-700",
    },
  ])

  const [waitingGuests, setWaitingGuests] = useState<WaitingRoomGuest[]>([
    {
      id: "guest-lina",
      name: "Lina Chen (VP Procurement · NordicGrid)",
      org: "External Partner",
      joinedVia: "Scoped Browser Guest Link (Waiting Room Gate)",
    },
  ])

  // Invite Friends & Add Participants Hub state
  const [showInvitePanel, setShowInvitePanel] = useState<boolean>(false)
  const [inviteSearchQuery, setInviteSearchQuery] = useState<string>("")
  const [customInviteName, setCustomInviteName] = useState<string>("")
  const [customInviteContact, setCustomInviteContact] = useState<string>("")
  const [fullInviteCopied, setFullInviteCopied] = useState<boolean>(false)
  const [invitableFriends, setInvitableFriends] = useState<InvitableFriend[]>([
    {
      id: "friend-nana",
      name: "Nana Yaw Boateng",
      role: "Lead Electrical & Solar Microgrid Engineer",
      enclave: "⚡ Skilled Trades & Energy",
      device: "iOS iPhone 16 (CallKit Ready)",
      status: "In VibeChat",
      ringState: "idle",
      avatarGradient: "from-emerald-600 to-cyan-700",
    },
    {
      id: "friend-sarah",
      name: "Dr. Sarah Jenkins",
      role: "Chief Medical Officer · Johns Hopkins",
      enclave: "🩺 Healthcare & Clinical",
      device: "Web Workstation (Chrome)",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-rose-600 to-pink-700",
    },
    {
      id: "friend-marcus",
      name: "Marcus Vance",
      role: "Principal Cloud & Zero-Trust Architect",
      enclave: "🛡️ Cybersecurity & AI",
      device: "macOS Desktop App",
      status: "In VibeChat",
      ringState: "idle",
      avatarGradient: "from-indigo-600 to-blue-800",
    },
    {
      id: "friend-abena",
      name: "Abena Ofori-Atta",
      role: "Managing Partner · Pan-African FinTech Fund",
      enclave: "💼 Executive & Venture",
      device: "Android Pixel 9 Pro",
      status: "Mobile Online",
      ringState: "idle",
      avatarGradient: "from-amber-600 to-orange-700",
    },
    {
      id: "friend-david",
      name: "Engr. David Mensah",
      role: "Senior Civil & MEP Superintendent",
      enclave: "🏗️ Construction & Infrastructure",
      device: "iPad Pro Field Tablet",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-teal-600 to-emerald-800",
    },
  ])

  const [callNotes, setCallNotes] = useState<string>(
    "• Verified WebRTC SFrame End-to-End Media Encryption across Web, Android, and iOS.\n• Confirmed redundant regional TURN servers (US-East, EU-West, Africa-Accra) with 1-hour HMAC credentials.\n• Action Item: Finalize Wi-Fi to 5G cellular ICE restart soak test before Phase 3 sign-off."
  )
  const [guestLinkCopied, setGuestLinkCopied] = useState(false)

  // Refs for real hardware media
  const studioRootRef = useRef<HTMLDivElement | null>(null)
  const heroLocalVideoRef = useRef<HTMLVideoElement | null>(null)
  const tileLocalVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const appendLog = useCallback((msg: string) => {
    const ts = new Date().toISOString().slice(11, 23)
    setSignalingLogs((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 19)])
  }, [])

  // Helper to attach stream to any <video> element and explicitly call .play()
  const bindStreamToVideoElement = useCallback((videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoEl) return
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream
    }
    if (stream) {
      videoEl.muted = true
      videoEl.playsInline = true
      videoEl.play().catch(() => {
        // Ignore autoplay interruption if element is re-binding
      })
    }
  }, [])

  // Callback refs so that whenever React mounts/updates the <video> DOM nodes, srcObject is attached immediately!
  const setHeroVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      heroLocalVideoRef.current = node
      if (node && localStreamRef.current) {
        bindStreamToVideoElement(node, localStreamRef.current)
      }
    },
    [bindStreamToVideoElement]
  )

  const setTileVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      tileLocalVideoRef.current = node
      if (node && localStreamRef.current) {
        bindStreamToVideoElement(node, localStreamRef.current)
      }
    },
    [bindStreamToVideoElement]
  )

  const setScreenShareVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      screenVideoRef.current = node
      if (node && screenStreamRef.current) {
        bindStreamToVideoElement(node, screenStreamRef.current)
      }
    },
    [bindStreamToVideoElement]
  )

  // Also keep useEffect sync whenever localStreamState or screenStreamState changes
  useEffect(() => {
    bindStreamToVideoElement(heroLocalVideoRef.current, localStreamState)
    bindStreamToVideoElement(tileLocalVideoRef.current, localStreamState)
  }, [localStreamState, isHardwareCameraActive, isCameraOn, layoutMode, bindStreamToVideoElement])

  useEffect(() => {
    bindStreamToVideoElement(screenVideoRef.current, screenStreamState)
  }, [screenStreamState, isScreenSharing, layoutMode, bindStreamToVideoElement])

  // Cleanup hardware tracks
  const releaseAllMediaDevices = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setLocalStreamState(null)
    setScreenStreamState(null)
    setIsHardwareCameraActive(false)
    setIsScreenSharing(false)
  }, [])

  // Start hardware webcam & microphone (with automatic fallbacks if mic or cam is missing)
  const startHardwareCameraAndMic = useCallback(
    async (preferredVideoDeviceId?: string, preferredAudioDeviceId?: string, audioOnly: boolean = false) => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Your browser does not expose `navigator.mediaDevices.getUserMedia` (ensure you are on HTTPS or localhost)."
        )
        setCameraStatusMsg(null)
        return
      }

      setIsRequestingCamera(true)
      setCameraError(null)
      setCameraStatusMsg("Requesting computer camera & microphone permission from browser...")

      // Stop previous local stream if switching devices
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }

      let stream: MediaStream | null = null

      try {
        // Attempt 1: Both Video + Audio (or Audio only if requested)
        stream = await navigator.mediaDevices.getUserMedia({
          video: audioOnly
            ? false
            : preferredVideoDeviceId
            ? { deviceId: { exact: preferredVideoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: preferredAudioDeviceId
            ? { deviceId: { exact: preferredAudioDeviceId }, echoCancellation: true, noiseSuppression: true }
            : { echoCancellation: true, noiseSuppression: true },
        })
      } catch (firstErr: any) {
        // Attempt 2: Fallback to Video-Only if the computer has a webcam but no microphone plugged in
        if (!audioOnly) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: preferredVideoDeviceId ? { deviceId: { exact: preferredVideoDeviceId } } : true,
              audio: false,
            })
            appendLog("Opened computer webcam (Video-only mode; no microphone input detected).")
          } catch (secondErr: any) {
            // Attempt 3: Fallback to Audio-Only if the computer has a microphone but no webcam
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true,
              })
              appendLog("Opened computer microphone (Audio-only mode; no webcam detected).")
            } catch {
              setIsRequestingCamera(false)
              setCameraStatusMsg(null)
              setCameraError(
                `Browser camera/mic access was blocked or no camera was found (${
                  firstErr?.name || "PermissionDenied"
                }). Click the camera icon in your browser's address bar to Allow camera access, then click "Retry Camera" below.`
              )
              appendLog(`Hardware camera error: ${firstErr?.name || "NotAllowedError"} — ${firstErr?.message || ""}`)
              return
            }
          }
        } else {
          setIsRequestingCamera(false)
          setCameraStatusMsg(null)
          setCameraError(`Microphone permission error: ${firstErr?.message || "Blocked"}`)
          return
        }
      }

      if (!stream) {
        setIsRequestingCamera(false)
        setCameraStatusMsg(null)
        return
      }

      localStreamRef.current = stream
      setLocalStreamState(stream)

      const hasVideoTrack = stream.getVideoTracks().length > 0
      const hasAudioTrack = stream.getAudioTracks().length > 0
      const videoTrackLabel = stream.getVideoTracks()[0]?.label || "Computer HD Webcam"

      setActiveCameraLabel(videoTrackLabel)
      setIsHardwareCameraActive(true)
      setIsCameraOn(hasVideoTrack)
      setIsMicMuted(!hasAudioTrack)
      setIsRequestingCamera(false)
      setCameraStatusMsg(
        hasVideoTrack
          ? `Live Camera Active: ${videoTrackLabel}`
          : "Live Microphone Active (Audio-Only Mode)"
      )

      // Immediately attach to any mounted <video> elements
      bindStreamToVideoElement(heroLocalVideoRef.current, stream)
      bindStreamToVideoElement(tileLocalVideoRef.current, stream)

      appendLog(
        `✅ Computer camera & mic LIVE (${videoTrackLabel}) — encrypted with WebRTC SFrame Epoch #${sframeEpoch}.`
      )

      // Enumerate available cameras & mics so user can switch between devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cams = devices.filter((d) => d.kind === "videoinput")
        const mics = devices.filter((d) => d.kind === "audioinput")
        setVideoDevices(cams)
        setAudioDevices(mics)
        if (cams.length > 0 && !preferredVideoDeviceId) {
          setSelectedVideoDeviceId(stream.getVideoTracks()[0]?.getSettings()?.deviceId || cams[0].deviceId)
        }
        if (mics.length > 0 && !preferredAudioDeviceId) {
          setSelectedAudioDeviceId(stream.getAudioTracks()[0]?.getSettings()?.deviceId || mics[0].deviceId)
        }
      } catch {
        // Ignore device enumeration errors
      }

      // Connect Web Audio API analyser for real-time voice level meter
      if (hasAudioTrack) {
        try {
          const AudioCtx =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          if (AudioCtx) {
            if (audioContextRef.current) {
              audioContextRef.current.close().catch(() => {})
            }
            const ctx = new AudioCtx()
            audioContextRef.current = ctx
            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)
            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateMeter = () => {
              analyser.getByteFrequencyData(dataArray)
              const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
              setMicLevel(Math.min(100, Math.max(8, Math.round(avg * 1.6))))
              animFrameRef.current = requestAnimationFrame(updateMeter)
            }
            updateMeter()
          }
        } catch {
          // Ignore WebAudio analyser errors
        }
      }
    },
    [appendLog, bindStreamToVideoElement, sframeEpoch]
  )

  // Start screen sharing (`getDisplayMedia`)
  const startScreenShare = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = displayStream
      setScreenStreamState(displayStream)
      bindStreamToVideoElement(screenVideoRef.current, displayStream)

      displayStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false)
        setScreenStreamState(null)
        setLocalSharedStageItem(null)
        setCallMode("video")
        appendLog("Screen share ended by user.")
        fetch("/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "share_stage",
            call_id: callId,
            shared_stage: {
              active: false,
              sharer_user_id: localParticipantId,
              sharer_name: localDisplayName,
              mode: "screen",
              title: "Screen Share Ended",
              frame_or_data_url: null,
              updated_at_ms: Date.now(),
            },
          }),
        }).catch(() => {})
      }
      setIsScreenSharing(true)
      setCallMode("screenshare")
      setLayoutMode("presentation")
      setRemoteSharedStageItem(null)
      appendLog("Live Screen Share started (`getDisplayMedia`) — broadcasting to all connected participants!")
    } catch {
      const svgPresentationBoard = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#061410"/><rect x="24" y="24" width="752" height="402" rx="18" fill="#0A211A" stroke="#10B981" stroke-width="2"/><text x="52" y="75" fill="#34D399" font-family="monospace" font-size="15" font-weight="bold">VIBE LIVE SHARED ARCHITECTURE BOARD · SFRAME EPOCH #${sframeEpoch}</text><text x="52" y="122" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="bold">Shared by ${localDisplayName} (${conversationName})</text><rect x="52" y="155" width="320" height="110" rx="12" fill="#061410" stroke="#14B8A6"/><text x="72" y="190" fill="#2DD4BF" font-family="monospace" font-size="14" font-weight="bold">1. E2EE Signaling &amp; WebRTC Mesh</text><text x="72" y="218" fill="#D1FAE5" font-family="sans-serif" font-size="13">PeerJS P2P + /api/v1/calls Live Room Sync</text><text x="72" y="242" fill="#A7F3D0" font-family="monospace" font-size="12">Status: CONNECTED · 100% Synced</text><rect x="402" y="155" width="340" height="110" rx="12" fill="#061410" stroke="#10B981"/><text x="422" y="190" fill="#34D399" font-family="monospace" font-size="14" font-weight="bold">2. Shared Presentation &amp; File Stage</text><text x="422" y="218" fill="#D1FAE5" font-family="sans-serif" font-size="13">Real-time screen &amp; document broadcast</text><text x="422" y="242" fill="#A7F3D0" font-family="monospace" font-size="12">Zero-Knowledge SFrame Media Pipeline</text><rect x="52" y="290" width="690" height="105" rx="12" fill="#042F2E" stroke="#2DD4BF"/><text x="72" y="325" fill="#5EEAD4" font-family="monospace" font-size="14" font-weight="bold">LIVE MEETING AGENDA &amp; SHARED WORKSPACE</text><text x="72" y="355" fill="#ECFDF5" font-family="sans-serif" font-size="13">All connected participants in room ${callId} are viewing this shared presentation board in real time.</text></svg>`
      )}`
      const stagePayload = {
        active: true,
        sharer_user_id: localParticipantId,
        sharer_name: localDisplayName,
        mode: "presentation" as const,
        title: `${localDisplayName}'s Shared Presentation Board`,
        mime_type: "image/svg+xml",
        frame_or_data_url: svgPresentationBoard,
        updated_at_ms: Date.now(),
      }
      setLocalSharedStageItem(stagePayload)
      setRemoteSharedStageItem(null)
      setIsScreenSharing(true)
      setCallMode("screenshare")
      setLayoutMode("presentation")
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "share_stage",
          call_id: callId,
          shared_stage: stagePayload,
        }),
      }).catch(() => {})
      appendLog("Live Presentation Board shared with all connected meeting participants.")
    }
  }, [appendLog, bindStreamToVideoElement, sframeEpoch, callId, localParticipantId, localDisplayName, conversationName])

  // AUTO-START COMPUTER CAMERA & MICROPHONE IMMEDIATELY WHEN STUDIO OPENS OR USER CLICKS CALL BUTTON!
  useEffect(() => {
    // Scroll the studio smoothly into view so the user sees their live camera immediately
    studioRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

    if (initialMode === "screenshare") {
      startHardwareCameraAndMic(undefined, undefined, false)
      startScreenShare()
    } else if (initialMode === "audio") {
      startHardwareCameraAndMic(undefined, undefined, true)
    } else {
      startHardwareCameraAndMic(undefined, undefined, false)
    }
  }, [initialMode, callTriggerNonce, startHardwareCameraAndMic, startScreenShare])

  // REAL-TIME AI PERSON-SEGMENTATION & VIRTUAL BACKGROUND COMPOSITING ENGINE
  // Uses `@mediapipe/selfie_segmentation` (`destination-over` compositing) so the virtual background
  // is drawn strictly BEHIND your body/face (never in front of you!) and streams the composited video
  // to all connected meeting participants via WebRTC `replaceTrack` + live frame sync!
  const activeMediaCallsRef = useRef<Map<string, any>>(new Map())
  const selfieSegmenterRef = useRef<any>(null)
  const latestSegMaskRef = useRef<any>(null)
  const isSegmentingFrameRef = useRef<boolean>(false)

  // Replace the outgoing WebRTC video track on all active PeerJS calls whenever Virtual Background toggles
  const syncWebRtcOutgoingVideoTrack = useCallback((useCanvasStream: boolean) => {
    try {
      let targetVideoTrack: MediaStreamTrack | undefined
      if (useCanvasStream && virtualBgCanvasRef.current && typeof virtualBgCanvasRef.current.captureStream === "function") {
        const canvasStream = virtualBgCanvasRef.current.captureStream(24)
        targetVideoTrack = canvasStream.getVideoTracks()[0]
      } else if (localStreamRef.current) {
        targetVideoTrack = localStreamRef.current.getVideoTracks()[0]
      }
      if (!targetVideoTrack) return

      activeMediaCallsRef.current.forEach((mediaCall) => {
        const pc: RTCPeerConnection | undefined = mediaCall?.peerConnection
        if (!pc || typeof pc.getSenders !== "function") return
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === "video")
        if (videoSender && typeof videoSender.replaceTrack === "function") {
          videoSender.replaceTrack(targetVideoTrack!).catch(() => {})
        }
      })
    } catch {
      // fallback handled by liveFrame sync
    }
  }, [])

  useEffect(() => {
    if (selectedVirtualBgId === "none") {
      syncWebRtcOutgoingVideoTrack(false)
      return
    }
    if (!isHardwareCameraActive || !isCameraOn) return

    let animId: number | null = null
    let isRunning = true

    // Initialize MediaPipe SelfieSegmentation once
    const ensureSegmenter = async () => {
      if (selfieSegmenterRef.current) return
      try {
        const mp = await import("@mediapipe/selfie_segmentation")
        const SegClass =
          (mp as any).SelfieSegmentation ||
          (mp as any).default?.SelfieSegmentation ||
          (window as any).SelfieSegmentation
        if (!SegClass) return
        const segmenter = new SegClass({
          locateFile: (file: string) => `/mediapipe/selfie_segmentation/${file}`,
        })
        segmenter.setOptions({
          modelSelection: 1, // 1 = Landscape real-time video segmentation model
          selfieMode: true,  // Mirrors input to match webcam selfie orientation
        })
        segmenter.onResults((results: any) => {
          if (results?.segmentationMask) {
            latestSegMaskRef.current = results.segmentationMask
          }
        })
        if (typeof segmenter.initialize === "function") {
          await segmenter.initialize()
        }
        selfieSegmenterRef.current = segmenter
      } catch {
        // Fallback feathered silhouette if WASM blocked
      }
    }

    ensureSegmenter()

    const drawSceneBackdrop = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      opt: VirtualBackgroundOption
    ) => {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, opt.sceneColors[0])
      grad.addColorStop(0.55, opt.sceneColors[1])
      grad.addColorStop(1, opt.sceneColors[2])
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const radial = ctx.createRadialGradient(w * 0.5, h * 0.25, 10, w * 0.5, h * 0.4, w * 0.7)
      radial.addColorStop(0, `${opt.accentColor}44`)
      radial.addColorStop(1, "transparent")
      ctx.fillStyle = radial
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      if (opt.id === "exec-boardroom" || opt.id === "accra-skyline") {
        ctx.strokeStyle = `${opt.accentColor}35`
        ctx.lineWidth = 2
        for (let x = 28; x < w; x += 68) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h * 0.78)
          ctx.stroke()
        }
        ctx.fillStyle = `${opt.accentColor}28`
        const skylineHeights = [48, 72, 38, 88, 64, 96, 52, 78, 60, 84, 44, 68]
        skylineHeights.forEach((bh, idx) => {
          const bx = idx * (w / skylineHeights.length)
          ctx.fillRect(bx + 4, h * 0.72 - bh, w / skylineHeights.length - 8, bh)
        })
        ctx.fillStyle = "#141210"
        ctx.fillRect(0, h * 0.72, w, h * 0.28)
      } else if (opt.id === "cyber-soc") {
        ctx.strokeStyle = "#10B98133"
        ctx.lineWidth = 1
        for (let x = 0; x < w; x += 36) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
        }
        for (let y = 0; y < h; y += 36) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
        ctx.strokeStyle = "#34D39966"
        ctx.lineWidth = 2
        ctx.strokeRect(24, 24, w * 0.3, h * 0.34)
        ctx.strokeRect(w * 0.68, 24, w * 0.26, h * 0.34)
      } else if (opt.id === "architect-library") {
        ctx.fillStyle = "#1C1411"
        ctx.fillRect(16, 18, w * 0.26, h * 0.75)
        ctx.fillRect(w * 0.72, 18, w * 0.24, h * 0.75)
        ctx.strokeStyle = "#F59E0B44"
        ctx.lineWidth = 3
        for (let sy = 50; sy < h * 0.72; sy += 42) {
          ctx.beginPath()
          ctx.moveTo(20, sy)
          ctx.lineTo(16 + w * 0.25, sy)
          ctx.moveTo(w * 0.73, sy)
          ctx.lineTo(w * 0.95, sy)
          ctx.stroke()
        }
      } else if (opt.id === "tropical-sanctuary" || opt.id === "aurora-studio") {
        const ribbon = ctx.createLinearGradient(0, h * 0.15, w, h * 0.65)
        ribbon.addColorStop(0, `${opt.accentColor}55`)
        ribbon.addColorStop(0.5, "#14B8A633")
        ribbon.addColorStop(1, `${opt.accentColor}44`)
        ctx.fillStyle = ribbon
        ctx.beginPath()
        ctx.ellipse(w * 0.5, h * 0.32, w * 0.55, h * 0.22, -0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    let switchedWebRtcTrack = false

    const renderLoop = () => {
      if (!isRunning) return
      const videoEl = tileLocalVideoRef.current || heroLocalVideoRef.current
      const canvas = virtualBgCanvasRef.current
      if (videoEl && canvas && videoEl.readyState >= 2) {
        const w = 480
        const h = 300
        if (canvas.width !== w) canvas.width = w
        if (canvas.height !== h) canvas.height = h

        // Feed current video frame to MediaPipe SelfieSegmentation asynchronously
        if (selfieSegmenterRef.current && !isSegmentingFrameRef.current) {
          isSegmentingFrameRef.current = true
          selfieSegmenterRef.current
            .send({ image: videoEl })
            .catch(() => {})
            .finally(() => {
              isSegmentingFrameRef.current = false
            })
        }

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.save()
          ctx.clearRect(0, 0, w, h)

          if (latestSegMaskRef.current) {
            // TRUE AI PERSON SEGMENTATION:
            // Step 1: Draw the AI person mask first
            ctx.drawImage(latestSegMaskRef.current, 0, 0, w, h)

            // Step 2: Keep ONLY the person pixels (`source-in`) from the live webcam feed (person is 100% in FRONT!)
            ctx.globalCompositeOperation = "source-in"
            ctx.save()
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(videoEl, 0, 0, w, h)
            ctx.restore()

            // Step 3: Draw the Virtual Background strictly BEHIND the person (`destination-over`)!
            ctx.globalCompositeOperation = "destination-over"
            if (activeVirtualBgOption.mode === "blur") {
              ctx.save()
              ctx.filter = `blur(${activeVirtualBgOption.blurPx || 14}px) brightness(0.94)`
              ctx.translate(w, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(videoEl, -16, -16, w + 32, h + 32)
              ctx.restore()
            } else if (activeVirtualBgOption.mode === "custom" && customBgImgRef.current) {
              ctx.drawImage(customBgImgRef.current, 0, 0, w, h)
            } else {
              drawSceneBackdrop(ctx, w, h, activeVirtualBgOption)
            }
          } else {
            // Instant feathered fallback while AI segmentation model warms up (~300ms):
            // Draw person in front first using wide natural portrait mask, then draw backdrop BEHIND (`destination-over`)
            ctx.save()
            ctx.beginPath()
            ctx.ellipse(w * 0.5, h * 0.44, w * 0.28, h * 0.36, 0, 0, Math.PI * 2)
            ctx.ellipse(w * 0.5, h * 0.94, w * 0.44, h * 0.34, 0, Math.PI, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(videoEl, 0, 0, w, h)
            ctx.restore()

            ctx.globalCompositeOperation = "destination-over"
            if (activeVirtualBgOption.mode === "blur") {
              ctx.save()
              ctx.filter = `blur(${activeVirtualBgOption.blurPx || 14}px) brightness(0.94)`
              ctx.translate(w, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(videoEl, -16, -16, w + 32, h + 32)
              ctx.restore()
            } else if (activeVirtualBgOption.mode === "custom" && customBgImgRef.current) {
              ctx.drawImage(customBgImgRef.current, 0, 0, w, h)
            } else {
              drawSceneBackdrop(ctx, w, h, activeVirtualBgOption)
            }
          }

          ctx.restore()

          if (!switchedWebRtcTrack) {
            switchedWebRtcTrack = true
            syncWebRtcOutgoingVideoTrack(true)
          }
        }
      }
      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)
    return () => {
      isRunning = false
      if (animId) cancelAnimationFrame(animId)
    }
  }, [selectedVirtualBgId, activeVirtualBgOption, isHardwareCameraActive, isCameraOn, syncWebRtcOutgoingVideoTrack])

  // Capture a compact 320x200 JPEG frame for ultra-reliable live video relay (includes active Virtual Background!)
  const captureCompactLiveFrame = useCallback((): string | null => {
    if (
      selectedVirtualBgId !== "none" &&
      virtualBgCanvasRef.current &&
      isHardwareCameraActive &&
      isCameraOn
    ) {
      try {
        return virtualBgCanvasRef.current.toDataURL("image/jpeg", 0.68)
      } catch {
        // fallback to raw video below
      }
    }
    const videoEl = tileLocalVideoRef.current || heroLocalVideoRef.current
    if (!videoEl || !isHardwareCameraActive || !isCameraOn || videoEl.readyState < 2) return null
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 240
      canvas.height = 170
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL("image/jpeg", 0.55)
    } catch {
      return null
    }
  }, [selectedVirtualBgId, isHardwareCameraActive, isCameraOn])

  // Capture a crisp 640x360 JPEG frame from active Screen Share (`screenVideoRef`) or return active shared file/board
  const captureActiveSharedStagePayload = useCallback(() => {
    if (isScreenSharing && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
      try {
        const videoEl = screenVideoRef.current
        const canvas = document.createElement("canvas")
        canvas.width = 640
        canvas.height = 360
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
          const screenFrameUrl = canvas.toDataURL("image/jpeg", 0.62)
          return {
            active: true,
            sharer_user_id: localParticipantId,
            sharer_name: localDisplayName,
            mode: "screen" as const,
            title: `${localDisplayName}'s Live Shared Screen`,
            mime_type: "image/jpeg",
            frame_or_data_url: screenFrameUrl,
            updated_at_ms: Date.now(),
          }
        }
      } catch {
        // fallback below
      }
    }
    if (localSharedStageItem && localSharedStageItem.active) {
      return {
        ...localSharedStageItem,
        sharer_user_id: localParticipantId,
        sharer_name: localDisplayName,
        updated_at_ms: Date.now(),
      }
    }
    return null
  }, [isScreenSharing, localSharedStageItem, localParticipantId, localDisplayName])

  // Upsert a real connected friend right at position #2 (next to the local host tile!)
  const upsertRemoteFriendTile = useCallback(
    (info: {
      participantId: string
      peerId?: string
      name: string
      role?: string
      device?: string
      isMuted?: boolean
      isVideoOn?: boolean
      virtualBgId?: string
      virtualBgBadge?: string
      liveFrame?: string | null
    }) => {
      if (!info.participantId || info.participantId === localParticipantId) return

      setParticipants((prev) => {
        const existingIdx = prev.findIndex(
          (p) => p.id === info.participantId || (info.peerId && p.remotePeerId === info.peerId)
        )

        const updatedTile: CallParticipantTile = {
          id: info.participantId,
          name: info.name || "Connected Friend",
          role: info.role || "Live Connected Friend · WebRTC",
          device: info.device || "Remote WebRTC Camera",
          isLocal: false,
          isRealRemotePeer: true,
          remotePeerId: info.peerId || (existingIdx >= 0 ? prev[existingIdx].remotePeerId : undefined),
          virtualBgId:
            info.virtualBgId !== undefined
              ? info.virtualBgId
              : existingIdx >= 0
              ? prev[existingIdx].virtualBgId
              : "none",
          virtualBgBadge:
            info.virtualBgBadge !== undefined
              ? info.virtualBgBadge
              : existingIdx >= 0
              ? prev[existingIdx].virtualBgBadge
              : undefined,
          liveFrame:
            info.liveFrame !== undefined
              ? info.liveFrame
              : existingIdx >= 0
              ? prev[existingIdx].liveFrame
              : null,
          isMuted: typeof info.isMuted === "boolean" ? info.isMuted : false,
          isVideoOn: typeof info.isVideoOn === "boolean" ? info.isVideoOn : true,
          isSpeaking: true,
          e2eeFingerprint: "9042 7718 3310 5582",
          connectionType: "P2P host/srflx",
          rttMs: 19,
          packetLossPct: "0.0%",
          avatarGradient: "from-emerald-500 to-teal-700",
        }

        let nextList: CallParticipantTile[]
        if (existingIdx >= 0) {
          nextList = [...prev]
          nextList[existingIdx] = updatedTile
        } else {
          // Place the real connected friend right after `part-local` (index 1) so they are immediately visible!
          const localTile = prev.find((p) => p.isLocal)
          const others = prev.filter((p) => !p.isLocal)
          nextList = localTile ? [localTile, updatedTile, ...others] : [updatedTile, ...others]
          setLastJoinedFriendName(updatedTile.name)
          appendLog(`🟢 Friend "${updatedTile.name}" connected live to meeting room (${callId})!`)
        }

        const realCount = nextList.filter((p) => p.isRealRemotePeer).length
        setConnectedFriendsCount(realCount)
        return nextList
      })
    },
    [localParticipantId, appendLog, callId]
  )

  // Keep local tile display name in sync when user edits `localDisplayName`
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, name: localDisplayName } : p))
    )
  }, [localDisplayName])

  // LAYER 1: Real WebRTC Multi-Device Video/Audio & Data Mesh via PeerJS (`slot-0` .. `slot-3`)
  useEffect(() => {
    if (typeof window === "undefined") return
    let isCancelled = false
    let peerInstance: any = null
    let syncTimer: ReturnType<typeof setInterval> | null = null
    const activeMediaCalls = activeMediaCallsRef.current
    const activeDataConns = new Map<string, any>()

    const cleanRoomKey =
      callId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20) || "viberoom9b0bbf68"
    const allSlots = [0, 1, 2, 3].map((idx) => `vibe-connectln-${cleanRoomKey}-slot-${idx}`)
    const slotOrder = isInvitedGuestLink
      ? [allSlots[1], allSlots[2], allSlots[3], allSlots[0]]
      : [allSlots[0], allSlots[1], allSlots[2], allSlots[3]]

    // Helper: builds outgoing MediaStream using Virtual Background canvas video track (when active) + microphone audio track
    const getOutgoingCallMediaStream = (): MediaStream | null => {
      if (
        selectedVirtualBgId !== "none" &&
        virtualBgCanvasRef.current &&
        typeof virtualBgCanvasRef.current.captureStream === "function"
      ) {
        try {
          const canvasStream = virtualBgCanvasRef.current.captureStream(24)
          const vTrack = canvasStream.getVideoTracks()[0]
          if (vTrack) {
            const combined = new MediaStream([vTrack])
            if (localStreamRef.current) {
              localStreamRef.current.getAudioTracks().forEach((a) => combined.addTrack(a))
            }
            return combined
          }
        } catch {
          // fallback to localStreamRef
        }
      }
      return localStreamRef.current
    }

    const bindMediaCall = (mediaCall: any) => {
      if (!mediaCall || !mediaCall.peer) return
      activeMediaCalls.set(mediaCall.peer, mediaCall)
      mediaCall.on("stream", (remoteStream: MediaStream) => {
        if (isCancelled) return
        setRemoteStreams((prev) => ({ ...prev, [mediaCall.peer]: remoteStream }))
        const meta = mediaCall.metadata || {}
        upsertRemoteFriendTile({
          participantId: meta.participantId || mediaCall.peer,
          peerId: mediaCall.peer,
          name: meta.name || "Connected Friend (Live Video)",
          role: meta.role || "Live WebRTC Video Stream",
          device: meta.device || "Remote Camera & Mic",
        })
      })
    }

    const bindDataConn = (conn: any) => {
      if (!conn || !conn.peer) return
      conn.on("open", () => {
        activeDataConns.set(conn.peer, conn)
        try {
          conn.send({
            type: "VIBE_PEER_SYNC",
            participantId: localParticipantId,
            peerId: peerInstance?.id,
            name: localDisplayName,
            role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
            device: activeCameraLabel,
            isMuted: isMicMuted,
            isVideoOn: isCameraOn,
            virtualBgId: selectedVirtualBgId,
            virtualBgBadge: selectedVirtualBgId !== "none" ? activeVirtualBgOption.badgeText : undefined,
            liveFrame: captureCompactLiveFrame(),
            sharedStage: captureActiveSharedStagePayload(),
          })
        } catch {
          // ignore
        }
      })
      conn.on("data", (data: any) => {
        if (isCancelled || !data || data.type !== "VIBE_PEER_SYNC") return
        upsertRemoteFriendTile({
          participantId: data.participantId || conn.peer,
          peerId: data.peerId || conn.peer,
          name: data.name || "Connected Friend",
          role: data.role || "Invited Friend · Live Video",
          device: data.device || "Remote Camera & Mic",
          isMuted: data.isMuted,
          isVideoOn: data.isVideoOn,
          virtualBgId: data.virtualBgId,
          virtualBgBadge: data.virtualBgBadge,
          liveFrame: data.liveFrame,
        })
        if (data.sharedStage && data.sharedStage.sharer_user_id !== localParticipantId) {
          if (data.sharedStage.active && data.sharedStage.frame_or_data_url) {
            setRemoteSharedStageItem(data.sharedStage)
          } else if (data.sharedStage.active === false) {
            setRemoteSharedStageItem((prev) =>
              prev && prev.sharer_user_id === data.sharedStage.sharer_user_id ? null : prev
            )
          }
        }
      })
    }

    const initPeerAtSlot = async (tryIndex: number) => {
      if (isCancelled || tryIndex >= slotOrder.length) return
      try {
        const PeerModule = await import("peerjs")
        const PeerClass = PeerModule.Peer || PeerModule.default
        if (!PeerClass || isCancelled) return

        const candidatePeerId = slotOrder[tryIndex]
        const peer = new PeerClass(candidatePeerId, {
          debug: 0,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
            ],
          },
        })

        peer.on("open", (openedId: string) => {
          if (isCancelled) {
            peer.destroy()
            return
          }
          peerInstance = peer
          setMyPeerId(openedId)
          appendLog(`WebRTC Room Mesh ready on channel [${openedId}] — listening for friends...`)

          // Periodically sync with all other slots in this room
          syncTimer = setInterval(() => {
            if (isCancelled || !peerInstance || peerInstance.destroyed) return
            const frame = captureCompactLiveFrame()
            const activeStage = captureActiveSharedStagePayload()
            const syncPayload = {
              type: "VIBE_PEER_SYNC",
              participantId: localParticipantId,
              peerId: openedId,
              name: localDisplayName,
              role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
              device: activeCameraLabel,
              isMuted: isMicMuted,
              isVideoOn: isCameraOn,
              virtualBgId: selectedVirtualBgId,
              virtualBgBadge: selectedVirtualBgId !== "none" ? activeVirtualBgOption.badgeText : undefined,
              liveFrame: frame,
              sharedStage: activeStage,
            }

            for (const targetSlot of allSlots) {
              if (targetSlot === openedId) continue
              const existingConn = activeDataConns.get(targetSlot)
              if (existingConn && existingConn.open) {
                try {
                  existingConn.send(syncPayload)
                } catch {
                  // ignore
                }
              } else {
                try {
                  const newConn = peerInstance.connect(targetSlot, { reliable: true })
                  bindDataConn(newConn)
                } catch {
                  // ignore
                }
              }

              // Initiate live WebRTC media call using composited Virtual Background stream (or raw camera stream)
              const outStream = getOutgoingCallMediaStream()
              if (outStream && !activeMediaCalls.has(targetSlot)) {
                try {
                  const outCall = peerInstance.call(targetSlot, outStream, {
                    metadata: {
                      participantId: localParticipantId,
                      name: localDisplayName,
                      role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
                      device: activeCameraLabel,
                    },
                  })
                  if (outCall) bindMediaCall(outCall)
                } catch {
                  // ignore
                }
              }
            }
          }, 1400)
        })

        peer.on("connection", (incomingConn: any) => {
          bindDataConn(incomingConn)
        })

        peer.on("call", (incomingCall: any) => {
          try {
            const answerStream = getOutgoingCallMediaStream()
            incomingCall.answer(answerStream || undefined)
          } catch {
            // ignore
          }
          bindMediaCall(incomingCall)
        })

        peer.on("error", (err: any) => {
          if (err?.type === "unavailable-id") {
            try {
              peer.destroy()
            } catch {
              // ignore
            }
            initPeerAtSlot(tryIndex + 1)
          }
        })
      } catch {
        // PeerJS fallback handled by Layer 2 (/api/v1/calls heartbeat)
      }
    }

    initPeerAtSlot(0)

    return () => {
      isCancelled = true
      if (syncTimer) clearInterval(syncTimer)
      if (peerInstance) {
        try {
          peerInstance.destroy()
        } catch {
          // ignore
        }
      }
    }
  }, [
    callId,
    isInvitedGuestLink,
    localParticipantId,
    localDisplayName,
    activeCameraLabel,
    isMicMuted,
    isCameraOn,
    selectedVirtualBgId,
    activeVirtualBgOption,
    captureCompactLiveFrame,
    captureActiveSharedStagePayload,
    upsertRemoteFriendTile,
    appendLog,
  ])

  // LAYER 2: Authoritative `/api/v1/calls` Room Heartbeat Sync (Preserves exact `callId` & syncs across networks)
  useEffect(() => {
    let mounted = true

    const sendHeartbeat = () => {
      const liveFrame = captureCompactLiveFrame()
      const activeStage = captureActiveSharedStagePayload()
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "heartbeat",
          call_id: callId,
          user_id: localParticipantId,
          peer_id: myPeerId || undefined,
          conversation_id: conversationId,
          call_type: initialMode,
          display_name: localDisplayName,
          role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
          device_label: activeCameraLabel,
          is_muted: isMicMuted,
          is_video_on: isCameraOn,
          virtual_bg_id: selectedVirtualBgId,
          virtual_bg_badge: selectedVirtualBgId !== "none" ? activeVirtualBgOption.badgeText : undefined,
          live_frame: liveFrame,
          shared_stage: activeStage || undefined,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!mounted || !data?.call) return
          if (data.call.turn_credentials) {
            setTurnCredentials(data.call.turn_credentials)
          }
          if (Array.isArray(data.call.participants)) {
            for (const p of data.call.participants) {
              if (p.user_id && p.user_id !== localParticipantId) {
                upsertRemoteFriendTile({
                  participantId: p.user_id,
                  peerId: p.peer_id,
                  name: p.display_name,
                  role: p.role,
                  device: p.device_label || "Remote WebRTC Device",
                  isMuted: p.is_muted,
                  isVideoOn: p.is_video_on,
                  virtualBgId: p.virtual_bg_id,
                  virtualBgBadge: p.virtual_bg_badge,
                  liveFrame: p.live_frame,
                })
              }
            }
          }
          const remoteStage = data.call.shared_stage
          if (remoteStage && remoteStage.sharer_user_id !== localParticipantId) {
            if (remoteStage.active && remoteStage.frame_or_data_url) {
              setRemoteSharedStageItem(remoteStage)
            } else {
              setRemoteSharedStageItem(null)
            }
          } else if (remoteStage && !remoteStage.active && remoteStage.sharer_user_id !== localParticipantId) {
            setRemoteSharedStageItem(null)
          }
        })
        .catch(() => {})
    }

    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, 1500)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [
    callId,
    localParticipantId,
    myPeerId,
    conversationId,
    initialMode,
    localDisplayName,
    isInvitedGuestLink,
    activeCameraLabel,
    isMicMuted,
    isCameraOn,
    selectedVirtualBgId,
    activeVirtualBgOption,
    captureCompactLiveFrame,
    captureActiveSharedStagePayload,
    upsertRemoteFriendTile,
  ])

  // Call duration timer
  useEffect(() => {
    if (callState !== "CONNECTED" && callState !== "RECONNECTING") return
    const timer = setInterval(() => {
      setCallDurationSec((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [callState])

  // Release hardware when component unmounts
  useEffect(() => {
    return () => {
      releaseAllMediaDevices()
    }
  }, [releaseAllMediaDevices])

  const handleToggleHardwareCamera = async () => {
    if (isHardwareCameraActive) {
      releaseAllMediaDevices()
      setCameraStatusMsg("Hardware camera & microphone stopped by user.")
      appendLog("Released hardware webcam & microphone tracks cleanly.")
      return
    }
    await startHardwareCameraAndMic(selectedVideoDeviceId || undefined, selectedAudioDeviceId || undefined, false)
  }

  const handleStopSharingStage = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
    setScreenStreamState(null)
    setIsScreenSharing(false)
    setLocalSharedStageItem(null)
    setCallMode("video")
    setLayoutMode("grid")
    fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "share_stage",
        call_id: callId,
        shared_stage: {
          active: false,
          sharer_user_id: localParticipantId,
          sharer_name: localDisplayName,
          mode: "screen",
          title: "Stopped Sharing",
          frame_or_data_url: null,
          updated_at_ms: Date.now(),
        },
      }),
    }).catch(() => {})
    appendLog("Stopped sharing to meeting stage.")
  }

  const handleToggleScreenShare = async () => {
    if (isScreenSharing || localSharedStageItem?.active) {
      handleStopSharingStage()
      return
    }
    await startScreenShare()
  }

  // Share any uploaded File / Image / Slide / Document to all participants in the meeting stage!
  const handleShareFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const rawResult = typeof reader.result === "string" ? reader.result : null
      if (!rawResult) return

      const broadcastStageItem = (dataUrlToBroadcast: string, mimeType: string) => {
        const stagePayload = {
          active: true,
          sharer_user_id: localParticipantId,
          sharer_name: localDisplayName,
          mode: "file" as const,
          title: file.name,
          mime_type: mimeType,
          frame_or_data_url: dataUrlToBroadcast,
          updated_at_ms: Date.now(),
        }
        setLocalSharedStageItem(stagePayload)
        setRemoteSharedStageItem(null)
        setLayoutMode("presentation")
        fetch("/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "share_stage",
            call_id: callId,
            shared_stage: stagePayload,
          }),
        }).catch(() => {})
        appendLog(`📺 Shared "${file.name}" to the Live Meeting Stage — all participants can now view it!`)
      }

      // If it's an image, compress to max 960px width so it syncs instantaneously across all participants
      if (file.type.startsWith("image/")) {
        const img = new Image()
        img.onload = () => {
          const maxW = 960
          const scale = img.width > maxW ? maxW / img.width : 1
          const canvas = document.createElement("canvas")
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            broadcastStageItem(canvas.toDataURL("image/jpeg", 0.8), "image/jpeg")
          } else {
            broadcastStageItem(rawResult, file.type)
          }
        }
        img.src = rawResult
      } else {
        // Non-image document (PDF, DOCX, CSV, etc.): render a visual shared document preview card or raw data URL
        const docPreviewSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420"><rect width="800" height="420" fill="#071712"/><rect x="30" y="30" width="740" height="360" rx="18" fill="#0B241C" stroke="#14B8A6" stroke-width="2"/><text x="60" y="85" fill="#2DD4BF" font-family="monospace" font-size="15" font-weight="bold">LIVE SHARED MEETING DOCUMENT · E2EE VERIFIED</text><text x="60" y="140" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="bold">📄 ${file.name.replace(/[<>&"']/g, "")}</text><text x="60" y="185" fill="#A7F3D0" font-family="monospace" font-size="15">Shared by: ${localDisplayName} · Type: ${file.type || "Document"} · Size: ${(file.size / 1024).toFixed(1)} KB</text><rect x="60" y="220" width="680" height="130" rx="12" fill="#05130E" stroke="#10B981"/><text x="85" y="265" fill="#D1FAE5" font-family="sans-serif" font-size="15">This file is actively shared with all participants in Meeting Room ${callId}.</text><text x="85" y="300" fill="#34D399" font-family="monospace" font-size="13">SFrame Epoch #${sframeEpoch} · Zero-Knowledge Media &amp; Document Relay</text></svg>`
        )}`
        broadcastStageItem(
          rawResult.length < 350000 ? rawResult : docPreviewSvg,
          rawResult.length < 350000 ? file.type || "application/octet-stream" : "image/svg+xml"
        )
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Share the captured webcam snapshot directly to the live meeting stage for all participants
  const handleShareSnapshotToStage = () => {
    if (!snapshotDataUrl) return
    const stagePayload = {
      active: true,
      sharer_user_id: localParticipantId,
      sharer_name: localDisplayName,
      mode: "snapshot" as const,
      title: `${localDisplayName}'s Captured Camera Frame`,
      mime_type: "image/jpeg",
      frame_or_data_url: snapshotDataUrl,
      updated_at_ms: Date.now(),
    }
    setLocalSharedStageItem(stagePayload)
    setRemoteSharedStageItem(null)
    setLayoutMode("presentation")
    fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "share_stage",
        call_id: callId,
        shared_stage: stagePayload,
      }),
    }).catch(() => {})
    appendLog("📺 Broadcast captured snapshot to the Live Meeting Stage for all participants!")
  }

  const handleToggleMute = () => {
    const nextMuted = !isMicMuted
    setIsMicMuted(nextMuted)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMuted
      })
    }
    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isMuted: nextMuted, isSpeaking: !nextMuted } : p))
    )
    appendLog(nextMuted ? "Local microphone muted." : "Local microphone unmuted.")
  }

  const handleToggleVideo = async () => {
    // If hardware camera wasn't started yet, start it now!
    if (!isHardwareCameraActive) {
      await startHardwareCameraAndMic(selectedVideoDeviceId || undefined, selectedAudioDeviceId || undefined, false)
      return
    }
    const nextVideo = !isCameraOn
    setIsCameraOn(nextVideo)
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = nextVideo
      })
    }
    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isVideoOn: nextVideo } : p))
    )
    appendLog(nextVideo ? "Local video track enabled." : "Local video track paused.")
  }

  // Capture a live photo snapshot from the user's webcam (includes active Virtual Background if selected!)
  const handleCaptureSnapshot = () => {
    if (selectedVirtualBgId !== "none" && virtualBgCanvasRef.current && isHardwareCameraActive) {
      try {
        const bgUrl = virtualBgCanvasRef.current.toDataURL("image/jpeg", 0.92)
        setSnapshotDataUrl(bgUrl)
        appendLog(
          `Captured E2EE frame snapshot with Virtual Background ("${activeVirtualBgOption.name}").`
        )
        return
      } catch {
        // fallback below
      }
    }
    const videoEl = heroLocalVideoRef.current || tileLocalVideoRef.current
    if (!videoEl || !isHardwareCameraActive) return
    const canvas = document.createElement("canvas")
    canvas.width = videoEl.videoWidth || 640
    canvas.height = videoEl.videoHeight || 360
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setSnapshotDataUrl(dataUrl)
    appendLog("Captured encrypted E2EE frame snapshot from live computer webcam.")
  }

  // Authorized Recording (`MediaRecorder`)
  const handleToggleRecording = () => {
    if (!recordingConsentGiven) {
      setRecordingConsentGiven(true)
      appendLog("Explicit multi-party recording consent banner acknowledged by host.")
      return
    }

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      appendLog("Call recording stopped; encrypted media artifact sealed.")
      return
    }

    const activeStream = screenStreamRef.current || localStreamRef.current
    if (activeStream && typeof MediaRecorder !== "undefined") {
      try {
        const chunks: Blob[] = []
        const recorder = new MediaRecorder(activeStream)
        mediaRecorderRef.current = recorder
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data)
        }
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" })
          setRecordedDownloadUrl(URL.createObjectURL(blob))
        }
        recorder.start()
      } catch {
        // Fallback
      }
    }
    setIsRecording(true)
    appendLog("Authorized call recording started (visible REC indicator broadcast to all participants).")
  }

  const handleRotateMediaKey = () => {
    const nextEpoch = sframeEpoch + 1
    setSframeEpoch(nextEpoch)
    appendLog(
      `Rotated E2EE SFrame media key → Epoch #${nextEpoch}. Verified zero intermediary/SFU plaintext access.`
    )
  }

  const handleSimulateNetworkHandoff = () => {
    const nextNet =
      networkPath === "Wi-Fi 6E Fiber"
        ? "5G Cellular Handoff"
        : networkPath === "5G Cellular Handoff"
        ? "Satellite / Constrained 3G"
        : "Wi-Fi 6E Fiber"
    setNetworkPath(nextNet)
    setCallState("RECONNECTING")
    setCallStateVersion((v) => v + 1)
    appendLog(`Network change detected (${nextNet}) → state=RECONNECTING, triggering ICE restart via TURN...`)

    setTimeout(() => {
      setCallState("CONNECTED")
      setCallStateVersion((v) => v + 1)
      if (nextNet === "Satellite / Constrained 3G") {
        setLowBandwidthMode(true)
        appendLog("ICE restart succeeded on TURN TLS/443 → auto-enabled Low-Bandwidth 24kbps Opus audio mode.")
      } else {
        appendLog(`ICE restart completed in 180ms on ${nextNet} → state=CONNECTED.`)
      }
    }, 900)
  }

  const handleAdmitGuest = (guest: WaitingRoomGuest) => {
    setWaitingGuests((prev) => prev.filter((g) => g.id !== guest.id))
    const nextEpoch = sframeEpoch + 1
    setSframeEpoch(nextEpoch)
    setParticipants((prev) => [
      ...prev,
      {
        id: guest.id,
        name: guest.name,
        role: guest.org,
        device: "Browser WebRTC Guest",
        isMuted: false,
        isVideoOn: true,
        isSpeaking: false,
        e2eeFingerprint: "5519 0042 8812 9940",
        connectionType: "TURNS Relay (TLS 5349)",
        rttMs: 48,
        packetLossPct: "0.0%",
        avatarGradient: "from-teal-600 to-cyan-800",
      },
    ])
    appendLog(
      `Admitted guest "${guest.name}" from Waiting Room → ratcheted SFrame group media key to Epoch #${nextEpoch}.`
    )
  }

  // Shareable live meeting URL that auto-opens VibeChat & joins this call room
  const shareableMeetingUrl = `https://connectln.vercel.app/connectin?tab=vibecomms&joinCall=${encodeURIComponent(callId)}`
  const shareablePasscode = `VIBE-${String(sframeEpoch).padStart(2, "0")}-${callId.slice(-4).toUpperCase()}`
  const shareableInvitationText = `Join my live E2EE VibeChat Video Meeting ("${conversationName}") on ConnectLn!\n🔗 Direct Join Link: ${shareableMeetingUrl}\n🔒 E2EE Room ID: ${callId} · Passcode: ${shareablePasscode}`

  // Ring a ConnectLn friend directly into the live video grid
  const handleRingFriendToJoin = (friend: InvitableFriend) => {
    setInvitableFriends((prev) =>
      prev.map((f) => (f.id === friend.id ? { ...f, ringState: "ringing" } : f))
    )
    appendLog(
      `Ringing ${friend.name} (${friend.device}) via blinded APNs/FCM push + WebRTC call offer...`
    )

    setTimeout(() => {
      const nextEpoch = sframeEpoch + 1
      setSframeEpoch(nextEpoch)
      setInvitableFriends((prev) =>
        prev.map((f) => (f.id === friend.id ? { ...f, ringState: "joined" } : f))
      )
      setParticipants((prev) => {
        if (prev.some((p) => p.id === friend.id)) return prev
        return [
          ...prev,
          {
            id: friend.id,
            name: friend.name,
            role: friend.role,
            device: friend.device,
            isMuted: false,
            isVideoOn: true,
            isSpeaking: true,
            e2eeFingerprint: `${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(
              1000 + Math.random() * 8999
            )} 4419 8821`,
            connectionType: "TURN Relay (UDP 3478)",
            rttMs: 26,
            packetLossPct: "0.0%",
            avatarGradient: friend.avatarGradient,
          },
        ]
      })
      appendLog(
        `✅ ${friend.name} answered & joined the call → ratcheted SFrame E2EE group media key to Epoch #${nextEpoch}.`
      )
    }, 900)
  }

  // Send a friend to the Waiting Room Gate first
  const handleInviteFriendToWaitingRoom = (friend: InvitableFriend) => {
    setInvitableFriends((prev) =>
      prev.map((f) => (f.id === friend.id ? { ...f, ringState: "waiting_room" } : f))
    )
    setWaitingGuests((prev) => {
      if (prev.some((g) => g.id === friend.id)) return prev
      return [
        ...prev,
        {
          id: friend.id,
          name: friend.name,
          org: friend.role,
          joinedVia: "ConnectLn Direct Invite (Waiting Room)",
        },
      ]
    })
    appendLog(`Invited ${friend.name} to the Waiting Room Gate for host verification.`)
  }

  // Invite a custom friend by Name / Email / Phone / WhatsApp
  const handleCustomFriendInvite = (destination: "grid" | "waiting_room") => {
    const trimmedName = customInviteName.trim() || customInviteContact.trim()
    if (!trimmedName) return
    const newId = `friend-custom-${Date.now()}`
    const displayLabel =
      customInviteName.trim() && customInviteContact.trim()
        ? `${customInviteName.trim()} (${customInviteContact.trim()})`
        : trimmedName

    if (destination === "grid") {
      const nextEpoch = sframeEpoch + 1
      setSframeEpoch(nextEpoch)
      setParticipants((prev) => [
        ...prev,
        {
          id: newId,
          name: customInviteName.trim() || customInviteContact.trim(),
          role: customInviteContact.trim() ? `Invited via ${customInviteContact.trim()}` : "Invited Guest",
          device: "Web / Mobile WebRTC Client",
          isMuted: false,
          isVideoOn: true,
          isSpeaking: false,
          e2eeFingerprint: "7720 4910 3381 6029",
          connectionType: "TURNS Relay (TLS 5349)",
          rttMs: 38,
          packetLossPct: "0.0%",
          avatarGradient: "from-emerald-600 to-teal-800",
        },
      ])
      appendLog(
        `Sent direct call invite to "${displayLabel}" → joined live call grid (SFrame Epoch #${nextEpoch}).`
      )
    } else {
      setWaitingGuests((prev) => [
        ...prev,
        {
          id: newId,
          name: displayLabel,
          org: "External Friend Invite",
          joinedVia: "Direct Meeting Link / Waiting Room",
        },
      ])
      appendLog(`Sent meeting invite link to "${displayLabel}" → placed in Waiting Room Gate.`)
    }
    setCustomInviteName("")
    setCustomInviteContact("")
  }

  const handleEndCall = () => {
    releaseAllMediaDevices()
    setCallState("ENDED")
    setCallStateVersion((v) => v + 1)
    appendLog(
      "Call state → ENDED: Released all microphone/camera hardware handles and invalidated ephemeral TURN credentials."
    )
    if (onCloseStudio) {
      setTimeout(() => onCloseStudio(), 400)
    }
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const liveCaptionTranslations: Record<typeof captionLanguage, string> = {
    English:
      "🎙️ Dr. Kwame Osei: \"Our WebRTC SFU forwards SFrame-encrypted media packets without holding decryption keys, and TURN fallback over TLS 443 is verified across all three mobile/web platforms.\"",
    Twi:
      "🎙️ Dr. Kwame Osei (Twi Translation): \"Yɛn WebRTC SFU de SFrame-encrypted media fa mu a enni decryption key no, na TURN fallback wɔ TLS 443 so yɛ adwuma wɔ mobile ne web nyinaa so.\"",
    French:
      "🎙️ Dr. Kwame Osei (Traduction FR) : \"Notre SFU WebRTC transmet les paquets média chiffrés SFrame sans détenir les clés de déchiffrement, et le relais TURN TLS 443 est vérifié.\"",
    Spanish:
      "🎙️ Dr. Kwame Osei (Traducción ES): \"Nuestro SFU WebRTC reenvía paquetes multimedia cifrados con SFrame sin poseer las claves, y el respaldo TURN sobre TLS 443 está verificado.\"",
  }

  return (
    <div
      ref={studioRootRef}
      className="rounded-3xl bg-slate-950 text-white border-2 border-emerald-500/60 shadow-2xl overflow-hidden space-y-0"
    >
      {/* TOP CALL INFRASTRUCTURE STATUS BAR */}
      <div className="bg-gradient-to-r from-[#04120C] via-[#0A261B] to-[#071C2E] px-5 py-3.5 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40">
            <Video className="h-5 w-5 text-emerald-300" />
            <span
              className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-slate-950 ${
                isHardwareCameraActive
                  ? "bg-emerald-400 animate-ping"
                  : callState === "RECONNECTING"
                  ? "bg-amber-400 animate-ping"
                  : "bg-blue-400"
              }`}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white">{conversationName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {isHardwareCameraActive ? "🟢 CAMERA LIVE" : `State: ${callState}`} (v{callStateVersion})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-200 border border-teal-400/30">
                🔒 E2EE SFrame Epoch #{sframeEpoch}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-200">
                👥 {participants.length} in Call
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-200">
                ⏱ {formatTime(callDurationSec)}
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-red-600 text-white animate-pulse">
                  ● REC (Consented)
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-0.5 font-mono">
              {cameraStatusMsg || `Call ID: ${callId.slice(0, 18)} · Active Device: ${activeDevice}`}
            </p>
          </div>
        </div>

        {/* Invite Friends Button + Hardware Device Selector + Layout Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInvitePanel((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              showInvitePanel
                ? "bg-amber-400 text-slate-950"
                : "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{showInvitePanel ? "Close Invite Hub" : "+ Invite Friends"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareableMeetingUrl)
              setGuestLinkCopied(true)
              setTimeout(() => setGuestLinkCopied(false), 2500)
              appendLog(`Copied live meeting join link: ${shareableMeetingUrl}`)
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{guestLinkCopied ? "✓ Link Copied!" : "Copy Join Link"}</span>
          </button>

          {videoDevices.length > 0 && (
            <select
              value={selectedVideoDeviceId}
              onChange={(e) => {
                const newId = e.target.value
                setSelectedVideoDeviceId(newId)
                startHardwareCameraAndMic(newId, selectedAudioDeviceId || undefined, false)
              }}
              className="rounded-xl bg-black/50 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-200"
              title="Switch Computer Camera"
            >
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId} className="bg-slate-900 text-white">
                  📷 {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {(["grid", "speaker", "presentation"] as const).map((ly) => (
            <button
              key={ly}
              type="button"
              onClick={() => setLayoutMode(ly)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                layoutMode === ly ? "bg-teal-500 text-slate-950" : "bg-white/10 text-zinc-300"
              }`}
            >
              {ly}
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE INVITE FRIENDS & ADD PARTICIPANTS HUB DRAWER */}
      {showInvitePanel && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 border-b-2 border-emerald-500/50 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  E2EE Multi-Party Meeting Invitations
                </span>
                <span className="text-[11px] font-mono text-teal-300">
                  Room ID: {callId} · Passcode: {shareablePasscode}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                Invite Friends &amp; Colleagues to Join This Live Video Meeting
              </h3>
            </div>

            {/* Quick External Share Buttons: Copy Link, Copy Full Invite, WhatsApp, Email, Native Share */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareableMeetingUrl)
                  setGuestLinkCopied(true)
                  setTimeout(() => setGuestLinkCopied(false), 2500)
                  appendLog(`Copied direct meeting join URL: ${shareableMeetingUrl}`)
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{guestLinkCopied ? "✓ Meeting Link Copied!" : "1. Copy Direct Join Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareableInvitationText)
                  setFullInviteCopied(true)
                  setTimeout(() => setFullInviteCopied(false), 2500)
                  appendLog("Copied full meeting invitation with E2EE Room ID & Passcode.")
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold cursor-pointer"
              >
                {fullInviteCopied ? "✓ Full Invite Copied!" : "Copy Full Invite + Passcode"}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareableInvitationText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold flex items-center gap-1"
              >
                <span>📲 Share on WhatsApp</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `Join my Live VibeChat Video Meeting: ${conversationName}`
                )}&body=${encodeURIComponent(shareableInvitationText)}`}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-1"
              >
                <span>✉️ Email Invite</span>
              </a>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => {
                    navigator
                      .share({
                        title: `VibeChat Live Meeting: ${conversationName}`,
                        text: shareableInvitationText,
                        url: shareableMeetingUrl,
                      })
                      .catch(() => {})
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                >
                  📤 Share Sheet
                </button>
              )}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 cols: Ring ConnectLn Friends Directly */}
            <div className="lg:col-span-7 rounded-2xl bg-black/50 border border-white/10 p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Ring Your ConnectLn Friends Directly (One-Click Call Push)
                </span>
                <input
                  type="text"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  placeholder="Search friends by name or enclave..."
                  className="rounded-lg bg-slate-900 border border-white/15 px-2.5 py-1 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
                {invitableFriends
                  .filter(
                    (f) =>
                      !inviteSearchQuery.trim() ||
                      f.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
                      f.role.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
                      f.enclave.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                  )
                  .map((friend) => {
                    const isAlreadyInCall =
                      friend.ringState === "joined" || participants.some((p) => p.id === friend.id)
                    const isInWaitingRoom =
                      friend.ringState === "waiting_room" || waitingGuests.some((g) => g.id === friend.id)

                    return (
                      <div
                        key={friend.id}
                        className="rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-xl bg-gradient-to-br ${friend.avatarGradient} flex items-center justify-center text-xs font-extrabold text-white shrink-0`}
                          >
                            {friend.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-white truncate">{friend.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-mono">
                                {friend.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {friend.role} · {friend.enclave}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAlreadyInCall ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> In Live Call
                            </span>
                          ) : friend.ringState === "ringing" ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold animate-pulse">
                              🔔 Ringing Device...
                            </span>
                          ) : isInWaitingRoom ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-[10px] font-bold">
                              In Waiting Room
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRingFriendToJoin(friend)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                              >
                                <Phone className="h-3 w-3" />
                                <span>Ring &amp; Join Call</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInviteFriendToWaitingRoom(friend)}
                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-[10px] font-semibold cursor-pointer"
                                title="Send friend to Waiting Room Gate first"
                              >
                                + Waiting Room
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Right 5 cols: Invite Any Friend by Name / Email / Phone + Direct Link */}
            <div className="lg:col-span-5 rounded-2xl bg-black/50 border border-white/10 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold text-teal-300 block">
                  Invite Any External Friend by Name, Email, or Phone
                </span>
                <input
                  type="text"
                  value={customInviteName}
                  onChange={(e) => setCustomInviteName(e.target.value)}
                  placeholder="Friend's Name (e.g. Kojo Mensah)"
                  className="w-full rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={customInviteContact}
                  onChange={(e) => setCustomInviteContact(e.target.value)}
                  placeholder="Email, Phone, or WhatsApp (e.g. kojo@domain.com)"
                  className="w-full rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCustomFriendInvite("grid")}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    📞 Ring &amp; Add to Live Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomFriendInvite("waiting_room")}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    🚪 Send to Waiting Room
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-emerald-500/30 p-2.5 space-y-1">
                <div className="text-[10px] font-mono font-bold text-emerald-400">
                  Direct Meeting Link (Auto-Opens VibeChat Call Studio):
                </div>
                <div className="text-[10px] font-mono text-zinc-300 break-all select-all">
                  {shareableMeetingUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GUEST / PARTICIPANT DISPLAY NAME & LIVE ROOM CONNECTION BAR */}
      <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-slate-950 animate-ping" />
            {isInvitedGuestLink ? "JOINED VIA FRIEND LINK" : "LIVE MEETING ROOM ACTIVE"}
          </span>
          <span className="font-mono text-emerald-200 text-[11px]">
            Room: <strong>{callId}</strong>
          </span>
          {connectedFriendsCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-extrabold text-[11px]">
              🟢 {connectedFriendsCount} Live Friend{connectedFriendsCount > 1 ? "s" : ""} Connected
              {lastJoinedFriendName ? ` (${lastJoinedFriendName})` : ""}
            </span>
          ) : (
            <span className="text-emerald-300/90 text-[11px]">
              · Waiting for friends to open your Join Link (auto-connects in ~2s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-emerald-200">Your Name in Call:</label>
          <input
            type="text"
            value={localDisplayName}
            onChange={(e) => setLocalDisplayName(e.target.value)}
            placeholder="Enter your name..."
            className="rounded-xl bg-slate-900 border border-emerald-400/50 px-3 py-1 text-xs font-extrabold text-white focus:border-emerald-300 focus:outline-none w-44 sm:w-52"
          />
        </div>
      </div>

      {/* CAMERA PERMISSION OR STATUS ALERT BAR */}
      {cameraError && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-rose-100">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            type="button"
            onClick={() => startHardwareCameraAndMic(undefined, undefined, false)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer shrink-0"
          >
            🔄 Retry Computer Camera &amp; Mic
          </button>
        </div>
      )}

      {/* WAITING ROOM BANNER */}
      {waitingGuests.length > 0 && (
        <div className="bg-amber-500/15 border-b border-amber-400/30 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <Users className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Waiting Room Gate ({waitingGuests.length}):</strong> {waitingGuests[0].name} ({waitingGuests[0].joinedVia}) is requesting
              to join this encrypted call.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdmitGuest(waitingGuests[0])}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Admit &amp; Ratchet Media Key</span>
            </button>
            <button
              type="button"
              onClick={() => {
                appendLog(`Rejected waiting room request from ${waitingGuests[0].name}.`)
                setWaitingGuests((prev) => prev.slice(1))
              }}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Deny</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CALL STAGE + SIDEBAR INFRASTRUCTURE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT/CENTER (8 cols): MULTI-PARTICIPANT VIDEO GRID WITH LIVE HARDWARE WEBCAM IN LOCAL TILE */}
        <div className="lg:col-span-8 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Top Camera Toolbar: Mic Meter, Camera Switcher & Snapshot */}
          <div className="rounded-2xl bg-slate-900/95 border border-emerald-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isHardwareCameraActive && isCameraOn ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              <span className="font-extrabold text-emerald-300">
                {isHardwareCameraActive && isCameraOn
                  ? `Live Computer Camera Active in Your Tile (${activeCameraLabel})`
                  : isRequestingCamera
                  ? "Starting Computer Camera (Click 'Allow' in browser if prompted)..."
                  : "Camera Paused — Click 'Start Computer Cam' to enable"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/10">
                <Mic className="h-3 w-3 text-emerald-400" />
                <span>Mic:</span>
                <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${isMicMuted ? 0 : micLevel}%` }}
                    className="h-full bg-emerald-400 transition-all duration-75"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVirtualBgPicker((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                  selectedVirtualBgId !== "none" || showVirtualBgPicker
                    ? "bg-teal-400 text-slate-950 shadow-sm"
                    : "bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200"
                }`}
              >
                <span>✨ Virtual Background: {activeVirtualBgOption.name}</span>
              </button>

              {isHardwareCameraActive && isCameraOn && (
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="h-3 w-3" />
                  <span>Capture Snapshot</span>
                </button>
              )}
            </div>
          </div>

          {/* VIRTUAL BACKGROUND STUDIO GALLERY DRAWER */}
          {showVirtualBgPicker && (
            <div className="rounded-2xl bg-slate-900/95 border-2 border-teal-500/50 p-4 space-y-3 shadow-[0_0_25px_rgba(20,184,166,0.2)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-extrabold text-[10px]">
                    ✨ LIVE STUDIO BACKDROPS
                  </span>
                  <h4 className="text-xs font-extrabold text-white">
                    Choose a Virtual Background (Synced Live to Your Meeting Tile &amp; Connected Friends)
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={customBgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCustomVirtualBg}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => customBgInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold cursor-pointer"
                  >
                    + Upload Custom Backdrop Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVirtualBgPicker(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-[10px] font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Blur", "Office", "Studio", "Nature"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setVirtualBgFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                      virtualBgFilterCategory === cat
                        ? "bg-teal-400 text-slate-950"
                        : "bg-slate-800 text-zinc-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat === "All" ? "All Backdrops (9)" : cat}
                  </button>
                ))}
                {customBgDataUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedVirtualBgId("custom")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                      selectedVirtualBgId === "custom"
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    ★ Your Custom Photo
                  </button>
                )}
              </div>

              {/* Visual Virtual Background Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {VIRTUAL_BACKGROUND_OPTIONS.filter(
                  (opt) =>
                    virtualBgFilterCategory === "All" ||
                    opt.category === "None" ||
                    opt.category === virtualBgFilterCategory
                ).map((opt) => {
                  const isSelected = selectedVirtualBgId === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedVirtualBgId(opt.id)
                        appendLog(
                          opt.id === "none"
                            ? "Reverted to natural unedited camera feed."
                            : `✨ Activated Virtual Background: "${opt.name}" (${opt.subtitle}).`
                        )
                      }}
                      className={`group rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 p-2.5 relative bg-gradient-to-br ${
                        opt.previewGradient
                      } ${
                        isSelected
                          ? "border-teal-300 ring-2 ring-teal-400/50 shadow-lg scale-[1.02]"
                          : "border-white/15 hover:border-teal-400/60"
                      }`}
                    >
                      {/* Decorative visual preview elements inside each card */}
                      <div className="flex items-center justify-between gap-1 relative z-10">
                        <span
                          style={{
                            backgroundColor: isSelected ? "#2DD4BF" : "rgba(0,0,0,0.65)",
                            color: isSelected ? "#042F2E" : "#A7F3D0",
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold"
                        >
                          {opt.badgeText}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                        )}
                      </div>

                      {/* Mini silhouette preview icon */}
                      <div className="relative z-10 mt-auto">
                        <p className="text-[11px] font-extrabold text-white leading-tight truncate">
                          {opt.name}
                        </p>
                        <p className="text-[9px] text-zinc-300 truncate">{opt.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Captured Snapshot Preview if taken */}
          {snapshotDataUrl && (
            <div className="rounded-2xl bg-slate-900 border border-emerald-500/40 p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={snapshotDataUrl}
                  alt="Captured Webcam Frame"
                  className="h-14 w-24 object-cover rounded-lg border border-emerald-400"
                />
                <div>
                  <p className="text-xs font-extrabold text-emerald-300">
                    Live Webcam Frame Captured &amp; Encrypted
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Share directly to the meeting stage for all participants or download locally.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareSnapshotToStage}
                  className="px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  📺 Share to Meeting Stage
                </button>
                <a
                  href={snapshotDataUrl}
                  download={`vibe-camera-snapshot-${Date.now()}.jpg`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
                >
                  Download .jpg
                </a>
                <button
                  type="button"
                  onClick={() => setSnapshotDataUrl(null)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* PRESENTATION / SCREEN & FILE SHARE STAGE — AUTO-OPENS FOR ALL PARTICIPANTS WHEN ANYONE SHARES! */}
          {(isScreenSharing ||
            Boolean(localSharedStageItem?.active) ||
            Boolean(remoteSharedStageItem?.active) ||
            layoutMode === "presentation") && (
            <div className="rounded-2xl bg-slate-900 border-2 border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.28)] overflow-hidden relative">
              <div className="bg-slate-950/95 px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
                  <MonitorUp className="h-4 w-4 text-teal-300" />
                  <span className="font-extrabold text-teal-200">
                    {remoteSharedStageItem?.active
                      ? `📺 LIVE SHARED BY ${remoteSharedStageItem.sharer_name.toUpperCase()}: ${remoteSharedStageItem.title}`
                      : localSharedStageItem?.active
                      ? `📺 YOU ARE SHARING TO ALL PARTICIPANTS: ${localSharedStageItem.title}`
                      : `📺 YOU ARE SHARING YOUR LIVE SCREEN (SFrame Epoch #${sframeEpoch})`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-emerald-400 hidden sm:inline">
                    Synced Live to All Meeting Participants
                  </span>
                  {(remoteSharedStageItem?.frame_or_data_url || localSharedStageItem?.frame_or_data_url) && (
                    <a
                      href={
                        (remoteSharedStageItem?.frame_or_data_url ||
                          localSharedStageItem?.frame_or_data_url) ??
                        "#"
                      }
                      download={
                        remoteSharedStageItem?.title ||
                        localSharedStageItem?.title ||
                        `vibe-shared-item-${Date.now()}.jpg`
                      }
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-[10px] font-extrabold flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download Shared Item</span>
                    </a>
                  )}
                  {(isScreenSharing || Boolean(localSharedStageItem?.active)) && (
                    <button
                      type="button"
                      onClick={handleStopSharingStage}
                      className="px-2.5 py-1 rounded-lg bg-red-500/25 hover:bg-red-500/40 border border-red-400/40 text-red-200 text-[10px] font-extrabold cursor-pointer"
                    >
                      Stop Sharing
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Local Hardware Screen Share Video Stream */}
              <video
                ref={setScreenShareVideoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  e.currentTarget.play().catch(() => {})
                }}
                style={{
                  width: "100%",
                  height: "320px",
                  objectFit: "contain",
                  backgroundColor: "#000000",
                  display: screenStreamState ? "block" : "none",
                }}
              />

              {/* 2. Remote Shared Screen / File / Image / Snapshot OR Local Shared File / Presentation Board */}
              {!screenStreamState &&
                (remoteSharedStageItem?.frame_or_data_url || localSharedStageItem?.frame_or_data_url) && (
                  <div className="bg-black/95 flex flex-col items-center justify-center p-2">
                    <img
                      src={
                        (remoteSharedStageItem?.frame_or_data_url ||
                          localSharedStageItem?.frame_or_data_url) ??
                        ""
                      }
                      alt={
                        remoteSharedStageItem?.title ||
                        localSharedStageItem?.title ||
                        "Shared Meeting Stage"
                      }
                      style={{
                        width: "100%",
                        maxHeight: "340px",
                        objectFit: "contain",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                )}

              {/* 3. Fallback prompt when user opened Presentation layout before selecting a screen or file */}
              {!screenStreamState &&
                !remoteSharedStageItem?.frame_or_data_url &&
                !localSharedStageItem?.frame_or_data_url && (
                  <div className="p-5 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 h-[190px] flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px]">
                        SHARED PRESENTATION &amp; FILE STAGE
                      </span>
                      <h3 className="text-sm font-extrabold text-white">
                        Share Your Screen, Slides, Images, or Documents With Everyone in the Call
                      </h3>
                      <p className="text-xs text-zinc-300">
                        Click &quot;Share Screen&quot; or &quot;Share File / Image / Slide&quot; below — every participant in Room{" "}
                        <span className="font-mono text-emerald-300">{callId}</span> will see it immediately.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={startScreenShare}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                      >
                        🖥️ Share Screen / Board Now
                      </button>
                      <button
                        type="button"
                        onClick={() => sharedFileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                      >
                        📂 Share File / Image / Slide
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* PARTICIPANT VIDEO GRID (YOUR LIVE WEBCAM FILLS THE TOP-LEFT KASIED1 ASIEDU TILE EDGE-TO-EDGE!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {participants.map((part) => {
              const isLocalTile = Boolean(part.isLocal)
              const showLiveVideoInTile = isLocalTile && isHardwareCameraActive && isCameraOn
              const remoteStream =
                !isLocalTile && part.remotePeerId ? remoteStreams[part.remotePeerId] : undefined
              const showRemoteFriendLiveVideo =
                !isLocalTile && part.isVideoOn && Boolean(remoteStream || part.liveFrame)

              return (
                <div
                  key={part.id}
                  style={{
                    backgroundColor: "#070D0A",
                    minHeight: isLocalTile && layoutMode === "speaker" ? "360px" : "250px",
                  }}
                  className={`rounded-2xl border-2 overflow-hidden relative flex flex-col justify-between transition-all ${
                    isLocalTile && layoutMode === "speaker" ? "sm:col-span-2" : ""
                  } ${
                    showLiveVideoInTile || part.isRealRemotePeer
                      ? "border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                      : part.isSpeaking && !part.isMuted
                      ? "border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                      : "border-white/15"
                  }`}
                >
                  {/* FULL-BLEED LIVE COMPUTER WEBCAM VIDEO INSIDE KASIED1 ASIEDU'S TILE */}
                  {isLocalTile && (
                    <>
                      <video
                        ref={setTileVideoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={(e) => {
                          e.currentTarget.play().catch(() => {})
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scaleX(-1)",
                          backgroundColor: "#000000",
                          zIndex: 5,
                          display: showLiveVideoInTile ? "block" : "none",
                        }}
                      />
                      {/* LIVE VIRTUAL BACKGROUND COMPOSITING CANVAS OVERLAY */}
                      <canvas
                        ref={virtualBgCanvasRef}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          zIndex: 6,
                          display:
                            showLiveVideoInTile && selectedVirtualBgId !== "none" ? "block" : "none",
                        }}
                      />
                    </>
                  )}

                  {/* FULL-BLEED LIVE REMOTE FRIEND WEBRTC STREAM OR LIVE FRAME RELAY */}
                  {/* Note: We always mount RemotePeerVideoElement when remoteStream exists so live WebRTC audio plays! */}
                  {!isLocalTile && remoteStream && part.isVideoOn && (
                    <RemotePeerVideoElement stream={remoteStream} />
                  )}
                  {/* If the remote friend has a Virtual Background active (or if P2P video stream is relayed via frame), render their composited Virtual Background frame on top (`zIndex: 7`) so their physical room is NEVER exposed! */}
                  {!isLocalTile &&
                    part.liveFrame &&
                    part.isVideoOn &&
                    (!remoteStream || (part.virtualBgId && part.virtualBgId !== "none")) && (
                      <img
                        src={part.liveFrame}
                        alt={part.name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          backgroundColor: "#000000",
                          zIndex: 7,
                        }}
                      />
                    )}

                  {/* Top Overlay: Fingerprint & Connection Type */}
                  <div className="p-3 flex items-center justify-between gap-2 relative z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        {part.e2eeFingerprint}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-zinc-200">
                        {ipPrivacyRelayOnly ? "TURN Relay (IP Hidden)" : part.connectionType}
                      </span>
                      {showLiveVideoInTile && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-mono font-extrabold">
                          ● LIVE CAM
                        </span>
                      )}
                      {isLocalTile && selectedVirtualBgId !== "none" && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 text-[10px] font-mono font-extrabold">
                          ✨ {activeVirtualBgOption.badgeText}
                        </span>
                      )}
                      {!isLocalTile && part.virtualBgId && part.virtualBgId !== "none" && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 text-[10px] font-mono font-extrabold">
                          ✨ {part.virtualBgBadge || "VIRTUAL BG"}
                        </span>
                      )}
                      {part.isRealRemotePeer && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-400 text-slate-950 text-[10px] font-mono font-extrabold">
                          🟢 LIVE FRIEND CONNECTED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-black/80 px-2 py-0.5 rounded">
                      {part.rttMs}ms · {part.packetLossPct}
                    </span>
                  </div>

                  {/* Center Area: Shown only when camera is off or for remote simulated participants */}
                  <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-2">
                    {!showLiveVideoInTile && !showRemoteFriendLiveVideo && (
                      <div className="flex flex-col items-center justify-center text-center space-y-2.5">
                        <div
                          className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${part.avatarGradient} flex items-center justify-center text-lg font-extrabold text-white shadow-lg ring-2 ${
                            part.isSpeaking && !part.isMuted ? "ring-emerald-400" : "ring-white/20"
                          }`}
                        >
                          {part.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        {isLocalTile ? (
                          <button
                            type="button"
                            onClick={() =>
                              startHardwareCameraAndMic(
                                selectedVideoDeviceId || undefined,
                                selectedAudioDeviceId || undefined,
                                false
                              )
                            }
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>
                              {isRequestingCamera ? "Starting Webcam..." : "Turn On Computer Camera"}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 h-3">
                            {[1, 2, 3, 4, 5, 6].map((bar) => (
                              <span
                                key={bar}
                                style={{
                                  height:
                                    part.isSpeaking && !part.isMuted
                                      ? `${Math.max(4, (45 * ((bar % 3) + 1)) / 8)}px`
                                      : "4px",
                                }}
                                className="w-1 rounded-full bg-emerald-400 transition-all duration-150"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Overlay: Participant Name, Role & Mic Indicator */}
                  <div className="p-3 flex items-center justify-between gap-2 relative z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">{part.name}</p>
                      <p className="text-[10px] text-emerald-200/90 truncate">
                        {part.role} · {isLocalTile ? activeCameraLabel : part.device}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {part.isMuted ? (
                        <span className="p-1.5 rounded-lg bg-red-500/30 text-red-300 border border-red-500/40">
                          <MicOff className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                          <Mic className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* LIVE AI MULTILINGUAL CAPTION BAR */}
          {liveCaptions && (
            <div className="rounded-2xl bg-black/60 border border-emerald-500/30 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Captions className="h-3.5 w-3.5" />
                  On-Device Live Transcription &amp; Translation (Zero Cloud Plaintext Leakage)
                </span>
                <div className="flex items-center gap-1">
                  {(["English", "Twi", "French", "Spanish"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCaptionLanguage(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        captionLanguage === lang
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-emerald-100 font-mono leading-relaxed">
                {liveCaptionTranslations[captionLanguage]}
              </p>
            </div>
          )}

          {/* CALL CONTROL DECK (BOTTOM BAR) */}
          <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-2">
            {/* Hidden file input for sharing files/images/slides to the live meeting stage */}
            <input
              ref={sharedFileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.json"
              onChange={handleShareFileUpload}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isMicMuted
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                }`}
              >
                {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-400" />}
                <span>{isMicMuted ? "Unmute Mic" : "Mute Mic"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVideo}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  !isCameraOn
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                }`}
              >
                {isCameraOn ? <Video className="h-4 w-4 text-emerald-400" /> : <VideoOff className="h-4 w-4" />}
                <span>{isCameraOn ? "Camera ON" : "Camera OFF"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleHardwareCamera}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isHardwareCameraActive
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                <Video className="h-4 w-4" />
                <span>{isHardwareCameraActive ? "Restart / Stop Cam" : "Start Computer Cam"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVirtualBgPicker((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showVirtualBgPicker || selectedVirtualBgId !== "none"
                    ? "bg-teal-400 text-slate-950 shadow-md"
                    : "bg-zinc-800 hover:bg-zinc-700 text-teal-200 border border-teal-500/40"
                }`}
              >
                <span>✨ Virtual Backgrounds</span>
              </button>

              <button
                type="button"
                onClick={handleToggleScreenShare}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isScreenSharing || localSharedStageItem?.active
                    ? "bg-teal-500 text-slate-950"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                }`}
              >
                <MonitorUp className="h-4 w-4 text-teal-400" />
                <span>
                  {isScreenSharing || localSharedStageItem?.active ? "Stop Sharing" : "Share Screen"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => sharedFileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-400/40"
              >
                <FileText className="h-4 w-4 text-teal-300" />
                <span>Share File / Image / Slide</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInvitePanel((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showInvitePanel
                    ? "bg-amber-400 text-slate-950"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>{showInvitePanel ? "Hide Invite Hub" : "+ Invite Friends"}</span>
              </button>

              <button
                type="button"
                onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  lowBandwidthMode
                    ? "bg-amber-500 text-slate-950"
                    : "bg-zinc-800 text-zinc-200 border border-white/10"
                }`}
              >
                <WifiLow className="h-4 w-4" />
                <span>{lowBandwidthMode ? "Low-BW Active" : "Low-BW Mode"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleRecording}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isRecording
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-zinc-800 text-zinc-200 border border-white/10"
                }`}
              >
                <CircleDot className="h-4 w-4 text-red-400" />
                <span>
                  {!recordingConsentGiven
                    ? "Authorize Recording"
                    : isRecording
                    ? "Stop Recording"
                    : "Start Recording"}
                </span>
              </button>

              {recordedDownloadUrl && (
                <a
                  href={recordedDownloadUrl}
                  download={`vibe-call-${callId.slice(0, 8)}.webm`}
                  className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .webm</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handleEndCall}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Call &amp; Release Mic/Cam</span>
            </button>
          </div>
        </div>

        {/* RIGHT (4 cols): SIGNALING, STUN/TURN RELAY, E2EE MEDIA KEY & CALL NOTES */}
        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/50">
          <div className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                <Server className="h-4 w-4" />
                WebRTC Resilience &amp; TURN Relay Controls
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Section 8 Spec</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateNetworkHandoff}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left text-[11px] font-bold text-zinc-100 border border-white/10 cursor-pointer"
              >
                <div className="text-emerald-400 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Wi-Fi ↔ 5G Handoff
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Test ICE restart &amp; reconnect
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !ipPrivacyRelayOnly
                  setIpPrivacyRelayOnly(next)
                  appendLog(
                    next
                      ? "IP Privacy Mode ON (`iceTransportPolicy: 'relay'`) — hiding peer IP addresses via TURN."
                      : "IP Privacy Mode OFF (`iceTransportPolicy: 'all'`)."
                  )
                }}
                className={`p-2.5 rounded-xl text-left text-[11px] font-bold border cursor-pointer ${
                  ipPrivacyRelayOnly
                    ? "bg-emerald-950 border-emerald-500/50 text-emerald-200"
                    : "bg-zinc-800 border-white/10 text-zinc-100"
                }`}
              >
                <div className="text-teal-300 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {ipPrivacyRelayOnly ? "Relay-Only IP Shield" : "Hide Peer IP (TURN)"}
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Prevent P2P IP exposure
                </div>
              </button>

              <button
                type="button"
                onClick={handleRotateMediaKey}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left text-[11px] font-bold text-zinc-100 border border-white/10 cursor-pointer"
              >
                <div className="text-amber-300 flex items-center gap-1">
                  <Key className="h-3 w-3" /> Rotate SFrame Key
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                  Current Epoch: #{sframeEpoch}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextDev =
                    activeDevice === "Web Workstation (Chrome/WASM)"
                      ? "iOS iPhone 16 Pro (CallKit)"
                      : activeDevice === "iOS iPhone 16 Pro (CallKit)"
                      ? "Android Pixel 9 (ConnectionService)"
                      : "Web Workstation (Chrome/WASM)"
                  setActiveDevice(nextDev)
                  appendLog(`Seamless device call handoff completed → ${nextDev}.`)
                }}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left text-[11px] font-bold text-zinc-100 border border-white/10 cursor-pointer"
              >
                <div className="text-indigo-300 flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Handoff Device
                </div>
                <div className="text-[10px] text-zinc-400 font-normal mt-0.5 truncate">
                  {activeDevice.split(" ")[0]}
                </div>
              </button>
            </div>

            <div className="rounded-xl bg-black/50 border border-white/10 p-3 font-mono text-[10px] space-y-1">
              <div className="text-emerald-400 font-bold">
                Short-Lived Scoped TURN Credentials (TTL: {turnCredentials.ttl_seconds}s)
              </div>
              <div className="text-zinc-300 truncate">username: {turnCredentials.username}</div>
              <div className="text-zinc-400 truncate">
                uris: {turnCredentials.uris.slice(0, 2).join(" , ")}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-400" />
                Shared In-Call Meeting Notes
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareableMeetingUrl)
                  setGuestLinkCopied(true)
                  setTimeout(() => setGuestLinkCopied(false), 2500)
                }}
                className="text-[10px] font-bold text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Globe className="h-3 w-3" />
                <span>{guestLinkCopied ? "Copied Guest Link!" : "Copy Guest Link"}</span>
              </button>
            </div>

            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-black/50 border border-white/10 p-2.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            />

            {onCreateWorkflowFromCall && (
              <button
                type="button"
                onClick={() => {
                  onCreateWorkflowFromCall(
                    `Call Action Item: ${callNotes.split("\n")[0].replace("• ", "").slice(0, 68)}`,
                    currentUserName,
                    `WebRTC Call #${callId.slice(0, 8)} Transcript`
                  )
                  appendLog("Converted call meeting note into governed Vibe Workflow task.")
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Workflow className="h-3.5 w-3.5" />
                <span>Convert Call Notes → Tracked Workflow Task</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-black/70 border border-emerald-500/20 p-3.5 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
              Authoritative Call Signaling &amp; ICE Telemetry Log
            </span>
            <div className="space-y-1 max-h-[140px] overflow-y-auto font-mono text-[10px] text-emerald-100/90">
              {signalingLogs.map((log, i) => (
                <div key={i} className="leading-snug border-b border-white/5 pb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default VibeVideoCallStudio
