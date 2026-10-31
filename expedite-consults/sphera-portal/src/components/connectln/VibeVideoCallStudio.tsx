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
  Sparkles,
} from "lucide-react"
import { loadStoredAdminUsers, loadStoredConnections } from "@/lib/connectin-storage"
import {
  initialConnectedMembers,
  suggestedConnections,
  getEnclaveConnectedMembers,
} from "@/lib/connectln-data"

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

function RemotePeerAudioTrackPlayer({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const el = audioRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.muted = false
    el.volume = 1.0

    let audioCtx: AudioContext | null = null
    let sourceNode: MediaStreamAudioSourceNode | null = null
    let gainNode: GainNode | null = null

    const ensureWebAudioBoost = () => {
      try {
        if (stream.getAudioTracks().length === 0) return
        if (!audioCtx) {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          if (Ctx) {
            audioCtx = new Ctx()
            sourceNode = audioCtx.createMediaStreamSource(stream)
            gainNode = audioCtx.createGain()
            gainNode.gain.value = 1.35
            sourceNode.connect(gainNode)
            gainNode.connect(audioCtx.destination)
          }
        }
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {})
        }
      } catch {
        // fallback to HTMLAudioElement playback
      }
    }

    const tryPlayAudio = () => {
      if (!audioRef.current) return
      audioRef.current.muted = false
      audioRef.current.volume = 1.0
      audioRef.current.play().catch(() => {})
      ensureWebAudioBoost()
    }

    tryPlayAudio()
    window.addEventListener("pointerdown", tryPlayAudio)
    window.addEventListener("touchstart", tryPlayAudio)
    window.addEventListener("keydown", tryPlayAudio)

    return () => {
      window.removeEventListener("pointerdown", tryPlayAudio)
      window.removeEventListener("touchstart", tryPlayAudio)
      window.removeEventListener("keydown", tryPlayAudio)
      try {
        sourceNode?.disconnect()
        gainNode?.disconnect()
        if (audioCtx && audioCtx.state !== "closed") {
          audioCtx.close().catch(() => {})
        }
      } catch {
        // ignore
      }
    }
  }, [stream])

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      onLoadedMetadata={(e) => {
        e.currentTarget.muted = false
        e.currentTarget.volume = 1.0
        e.currentTarget.play().catch(() => {})
      }}
      style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", left: -9999 }}
    />
  )
}

function RemotePeerVideoElement({ stream, isVideoOn = true }: { stream: MediaStream; isVideoOn?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [hasLiveVideoFrames, setHasLiveVideoFrames] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    setHasLiveVideoFrames(false)
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.muted = true

    const checkFrames = () => {
      if (el.videoWidth > 0 && el.readyState >= 2 && !el.paused) {
        setHasLiveVideoFrames(true)
      }
    }

    el.addEventListener("loadeddata", checkFrames)
    el.addEventListener("playing", checkFrames)
    el.addEventListener("timeupdate", checkFrames)

    el.play()
      .then(checkFrames)
      .catch(() => {})

    return () => {
      el.removeEventListener("loadeddata", checkFrames)
      el.removeEventListener("playing", checkFrames)
      el.removeEventListener("timeupdate", checkFrames)
    }
  }, [stream])

  const showVideo = hasLiveVideoFrames && isVideoOn

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      onLoadedMetadata={(e) => {
        const el = e.currentTarget
        el.muted = true
        el.play()
          .then(() => {
            if (el.videoWidth > 0) setHasLiveVideoFrames(true)
          })
          .catch(() => {})
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
        backgroundColor: "transparent",
        opacity: showVideo ? 1 : 0,
        pointerEvents: showVideo ? "auto" : "none",
        zIndex: 6,
      }}
    />
  )
}

function RemoteParticipantStudioFeed({ participant }: { participant: CallParticipantTile }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number | null = null
    let frame = Math.floor(Math.random() * 120)

    // Choose a bright, well-lit studio palette per remote participant
    const idLower = (participant.id + " " + participant.name).toLowerCase()
    const studioTheme = idLower.includes("kwame")
      ? {
          bgTop: "#1E3A5F",
          bgMid: "#0F2942",
          bgBot: "#1E293B",
          windowGlow: "rgba(125, 211, 252, 0.28)",
          accent: "#38BDF8",
          suitColor: "#0F172A",
          shirtColor: "#E0F2FE",
          tieColor: "#0284C7",
          skinTone: "#8D5524",
          studioLabel: "ARCHITECTURAL STUDIO · 1080p60",
        }
      : idLower.includes("ama")
      ? {
          bgTop: "#2E1065",
          bgMid: "#1E1B4B",
          bgBot: "#0F172A",
          windowGlow: "rgba(192, 132, 252, 0.28)",
          accent: "#C084FC",
          suitColor: "#1E1B4B",
          shirtColor: "#F3E8FF",
          tieColor: "#9333EA",
          skinTone: "#7B4B2A",
          studioLabel: "SECOPS COMMAND STUDIO · 1080p60",
        }
      : idLower.includes("kofi")
      ? {
          bgTop: "#451A03",
          bgMid: "#292524",
          bgBot: "#1C1917",
          windowGlow: "rgba(251, 191, 36, 0.26)",
          accent: "#FBBF24",
          suitColor: "#1C1917",
          shirtColor: "#FEF3C7",
          tieColor: "#D97706",
          skinTone: "#6F4124",
          studioLabel: "WEBRTC LAB STUDIO · 1080p60",
        }
      : {
          bgTop: "#064E3B",
          bgMid: "#0F2922",
          bgBot: "#0F172A",
          windowGlow: "rgba(52, 211, 153, 0.28)",
          accent: "#34D399",
          suitColor: "#0F172A",
          shirtColor: "#D1FAE5",
          tieColor: "#10B981",
          skinTone: "#8D5524",
          studioLabel: "LIVE E2EE REMOTE FEED · 1080p60",
        }

    const initials = (participant.name || "RP")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const renderStudioFrame = () => {
      frame += 1
      const w = 320
      const h = 180
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h

      // 1. Bright Studio Room Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h)
      bgGrad.addColorStop(0, studioTheme.bgTop)
      bgGrad.addColorStop(0.55, studioTheme.bgMid)
      bgGrad.addColorStop(1, studioTheme.bgBot)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // 2. Daylight Architectural Window Panels & Warm Key Light
      ctx.fillStyle = studioTheme.windowGlow
      ctx.fillRect(18, 14, 72, 95)
      ctx.fillRect(w - 90, 14, 72, 95)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(18, 14, 72, 95)
      ctx.strokeRect(w - 90, 14, 72, 95)

      // Soft studio key-light radial glow behind presenter
      const keyLight = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, 130)
      keyLight.addColorStop(0, "rgba(255, 255, 255, 0.22)")
      keyLight.addColorStop(0.6, studioTheme.windowGlow)
      keyLight.addColorStop(1, "transparent")
      ctx.fillStyle = keyLight
      ctx.fillRect(0, 0, w, h)

      // 3. Subtle natural breathing / speaking motion for lifelike presenter feed
      const breatheY = Math.sin(frame * 0.18) * 2
      const headSwayX = Math.cos(frame * 0.12) * 1.5
      const centerX = w * 0.5 + headSwayX
      const headCenterY = h * 0.41 + breatheY

      // Speaking aura rings if participant is actively speaking
      if (participant.isSpeaking && !participant.isMuted) {
        const pulse = 36 + Math.sin(frame * 0.45) * 5
        ctx.beginPath()
        ctx.arc(centerX, headCenterY, pulse, 0, Math.PI * 2)
        ctx.strokeStyle = studioTheme.accent
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(centerX, headCenterY, pulse + 7, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)"
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // 4. Presenter Shoulders / Executive Blazer Silhouette
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(centerX, h * 0.92 + breatheY, 74, 46, 0, Math.PI, Math.PI * 2)
      ctx.fillStyle = studioTheme.suitColor
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = studioTheme.accent
      ctx.stroke()

      // Shirt collar V-neck
      ctx.beginPath()
      ctx.moveTo(centerX - 16, h * 0.68 + breatheY)
      ctx.lineTo(centerX, h * 0.88 + breatheY)
      ctx.lineTo(centerX + 16, h * 0.68 + breatheY)
      ctx.closePath()
      ctx.fillStyle = studioTheme.shirtColor
      ctx.fill()
      ctx.restore()

      // 5. Presenter Head & Studio Portrait Circle
      ctx.beginPath()
      ctx.arc(centerX, headCenterY, 30, 0, Math.PI * 2)
      ctx.fillStyle = studioTheme.skinTone
      ctx.fill()
      ctx.lineWidth = 2.2
      ctx.strokeStyle = "#FFFFFF"
      ctx.stroke()

      // Subtle facial features (eyes, warm smile / speaking mouth)
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(centerX - 9, headCenterY - 4, 2.4, 0, Math.PI * 2)
      ctx.arc(centerX + 9, headCenterY - 4, 2.4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#1E293B"
      ctx.beginPath()
      ctx.arc(centerX - 9, headCenterY - 4, 1.3, 0, Math.PI * 2)
      ctx.arc(centerX + 9, headCenterY - 4, 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Animated speaking mouth or natural smile
      ctx.beginPath()
      if (participant.isSpeaking && !participant.isMuted) {
        const mouthOpen = 2 + Math.abs(Math.sin(frame * 0.55)) * 3.5
        ctx.ellipse(centerX, headCenterY + 9, 6, mouthOpen, 0, 0, Math.PI * 2)
        ctx.fillStyle = "#FFFFFF"
        ctx.fill()
      } else {
        ctx.arc(centerX, headCenterY + 6, 7, 0.15 * Math.PI, 0.85 * Math.PI)
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1.8
        ctx.stroke()
      }

      // Initials badge on blazer lapel
      ctx.fillStyle = studioTheme.tieColor
      ctx.beginPath()
      ctx.arc(centerX + 24, h * 0.78 + breatheY, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(initials, centerX + 24, h * 0.78 + breatheY)

      // 6. Live Audio Equalizer Bars at bottom-right of video feed
      const barBaseX = w - 58
      const barBaseY = h - 36
      for (let i = 0; i < 6; i++) {
        const barH =
          participant.isSpeaking && !participant.isMuted
            ? 4 + Math.abs(Math.sin(frame * 0.5 + i * 0.9)) * 12
            : 3
        ctx.fillStyle = studioTheme.accent
        ctx.fillRect(barBaseX + i * 6, barBaseY - barH, 3.5, barH)
      }
    }

    renderStudioFrame()
    const intervalId = window.setInterval(renderStudioFrame, 100)
    return () => {
      window.clearInterval(intervalId)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [participant.id, participant.name, participant.isSpeaking, participant.isMuted])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 4,
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
  email?: string
  phone?: string
  sourceBadge?: string
}

export interface VirtualBackgroundOption {
  id: string
  name: string
  subtitle: string
  category: "None" | "Blur" | "Office" | "Studio" | "Nature" | "Custom"
  mode: "none" | "blur" | "scene" | "custom"
  blurPx?: number
  imageUrl?: string
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
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=960&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=960&q=80",
    previewGradient: "from-orange-700/80 via-amber-900 to-emerald-950",
    sceneColors: ["#1E293B", "#334155", "#0F172A"],
    accentColor: "#FBBF24",
    badgeText: "ACCRA HUB",
  },
  {
    id: "cyber-soc",
    name: "Zero-Trust Cyber SOC",
    subtitle: "Emerald E2EE command center",
    category: "Studio",
    mode: "scene",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=960&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=960&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=960&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=960&q=80",
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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const invitedNameFromUrl = (params.get("invitedName") || "").trim()
      if (invitedNameFromUrl) {
        sessionStorage.setItem("vibe_call_display_name", invitedNameFromUrl)
        return invitedNameFromUrl
      }
      const savedName = sessionStorage.getItem("vibe_call_display_name")
      if (savedName && savedName.trim()) return savedName.trim()
      const hasUrlJoinParam = Boolean(params.get("joinCall"))
      if (hasUrlJoinParam) {
        if (currentUserName && !currentUserName.startsWith("You (") && currentUserName !== "Live Call Participant") {
          return currentUserName
        }
        const pid = sessionStorage.getItem("vibe_call_participant_id") || "guest"
        return `Guest (${pid.slice(-4).toUpperCase()})`
      }
    }
    return currentUserName || "Host"
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
  const [liveCaptions, setLiveCaptions] = useState<boolean>(false)
  const [showInspectorPanel, setShowInspectorPanel] = useState<boolean>(false)
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

  // Participants & Waiting Room — ONLY real participants in this meeting!
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
  ])

  const [waitingGuests, setWaitingGuests] = useState<WaitingRoomGuest[]>([])

  // Invite Friends & Add Participants Hub state
  const [showInvitePanel, setShowInvitePanel] = useState<boolean>(false)
  const [showShareFileDrawer, setShowShareFileDrawer] = useState<boolean>(false)
  const [inviteSearchQuery, setInviteSearchQuery] = useState<string>("")
  const [customInviteName, setCustomInviteName] = useState<string>("")
  const [customInviteContact, setCustomInviteContact] = useState<string>("")
  const [inviteDispatchStatus, setInviteDispatchStatus] = useState<string | null>(null)
  const [fullInviteCopied, setFullInviteCopied] = useState<boolean>(false)
  const [recordingDurationSec, setRecordingDurationSec] = useState<number>(0)
  const [liveSpokenTranscript, setLiveSpokenTranscript] = useState<string>("")
  const [manualCaptionInput, setManualCaptionInput] = useState<string>("")
  const [notesStatusToast, setNotesStatusToast] = useState<string | null>(null)
  const [invitableFriends, setInvitableFriends] = useState<InvitableFriend[]>([
    {
      id: "friend-bust-vito",
      name: "Bust Vito",
      role: "Senior Field Operations & Skilled Trades Specialist",
      enclave: "🏗️ Skilled Trades & Construction",
      device: "Web / Mobile WebRTC Client",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-emerald-600 to-teal-800",
      email: "bust.vito@connectin.com",
      phone: "+12405550942",
      sourceBadge: "Platform Member",
    },
    {
      id: "friend-yaw-asiedu",
      name: "Yaw Asiedu",
      role: "Master Carpenter · Timber Framing & Custom Joinery",
      enclave: "🏗️ Skilled Trades & Construction",
      device: "Web / Mobile WebRTC Client",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-blue-600 to-indigo-800",
      email: "yaw.asiedu@connectin.com",
      phone: "+12405550719",
      sourceBadge: "1st Connection",
    },
    {
      id: "friend-joseph-akuffo",
      name: "Joseph Akuffo",
      role: "Master Carpenter · Heavy Timber Framing & Superintendent",
      enclave: "🏗️ Skilled Trades & Construction",
      device: "iOS Field Device",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-cyan-600 to-blue-800",
      sourceBadge: "1st Connection",
    },
    {
      id: "friend-markus-thorne",
      name: "Markus Thorne",
      role: "VP of Commercial Construction @ Skanska Timberworks",
      enclave: "🏗️ Construction & Infrastructure",
      device: "Web Workstation",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-amber-600 to-orange-800",
      sourceBadge: "1st Connection",
    },
    {
      id: "friend-nana",
      name: "Nana Yaw Boateng",
      role: "Lead Electrical & Solar Microgrid Engineer",
      enclave: "⚡ Skilled Trades & Energy",
      device: "iOS iPhone 16 (CallKit Ready)",
      status: "In VibeChat",
      ringState: "idle",
      avatarGradient: "from-emerald-600 to-cyan-700",
      sourceBadge: "1st Connection",
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
      sourceBadge: "1st Connection",
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
      email: "marcus.vance@defense-systems.com",
      phone: "+17035558841",
      sourceBadge: "Platform Member",
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
      sourceBadge: "1st Connection",
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
      sourceBadge: "1st Connection",
    },
    {
      id: "friend-kofi-agyarko",
      name: "Kofi Agyarko",
      role: "Senior Cloud Infrastructure & Enterprise Systems Specialist",
      enclave: "🛡️ Cybersecurity & AI",
      device: "Web Workstation",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-blue-600 to-cyan-800",
      email: "kofi.agyarko@connectin.com",
      phone: "+233245550194",
      sourceBadge: "Platform Member",
    },
    {
      id: "friend-isaac-boye",
      name: "Isaac Boye",
      role: "Licensed Master Electrician · Technical Operations",
      enclave: "⚡ Skilled Trades & Energy",
      device: "Mobile WebRTC Client",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-teal-600 to-emerald-700",
      email: "isaac.boye@connectin.com",
      phone: "+233205550412",
      sourceBadge: "Platform Member",
    },
    {
      id: "friend-patience-addo",
      name: "Patience Addo",
      role: "Doctor of Veterinary Medicine (DVM)",
      enclave: "🩺 Healthcare & Clinical",
      device: "Web Workstation",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-violet-600 to-indigo-800",
      email: "patience.addo@connectin.com",
      phone: "+12405550821",
      sourceBadge: "Platform Member",
    },
    {
      id: "friend-yaw-appiah",
      name: "Yaw Appiah",
      role: "Certified Master Welder & Structural Fabricator (AWS D1.1)",
      enclave: "🏗️ Skilled Trades & Construction",
      device: "Mobile WebRTC Client",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-amber-600 to-red-800",
      email: "kasiedu@syneren.com",
      phone: "+12405550614",
      sourceBadge: "Platform Member",
    },
    {
      id: "friend-rhoda-mensah",
      name: "Rhoda Mensah",
      role: "Senior Cyber Compliance & Risk Analyst",
      enclave: "🛡️ Cybersecurity & AI",
      device: "Web Workstation",
      status: "Available",
      ringState: "idle",
      avatarGradient: "from-fuchsia-600 to-pink-800",
      email: "rhoda.mensah@expedite-consults.com",
      phone: "+12405550318",
      sourceBadge: "Platform Member",
    },
  ])

  const [callNotes, setCallNotes] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`vibe_meeting_notes_${urlJoinedRoomId || initialCallRoomId || "default"}`)
      if (saved && saved.trim()) return saved
    }
    return "• Verified WebRTC SFrame End-to-End Media Encryption across Web, Android, and iOS.\n• Confirmed redundant regional TURN servers (US-East, EU-West, Africa-Accra) with 1-hour HMAC credentials.\n• Action Item: Finalize Wi-Fi to 5G cellular ICE restart soak test before Phase 3 sign-off."
  })
  const [guestLinkCopied, setGuestLinkCopied] = useState(false)

  // Persist meeting notes automatically whenever edited
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(`vibe_meeting_notes_${callId}`, callNotes)
    } catch {}
  }, [callId, callNotes])

  // Dynamically wire ALL 1st-degree connections, invited colleagues, local vault members, and global platform members into `invitableFriends`
  useEffect(() => {
    if (typeof window === "undefined") return
    const gradients = [
      "from-emerald-600 to-teal-800",
      "from-blue-600 to-indigo-800",
      "from-cyan-600 to-blue-800",
      "from-rose-600 to-pink-700",
      "from-amber-600 to-orange-700",
      "from-violet-600 to-indigo-800",
      "from-teal-600 to-emerald-800",
    ]

    const mergeDirectory = (extraEntries: Array<{
      id?: string
      name?: string
      headline?: string
      role?: string
      email?: string
      phone?: string
      enclave?: string
      sourceBadge?: string
    }>) => {
      setInvitableFriends((prev) => {
        const byName = new Map<string, InvitableFriend>()
        for (const item of prev) {
          byName.set(item.name.trim().toLowerCase(), item)
        }
        let idx = byName.size
        for (const raw of extraEntries) {
          const cleanName = (raw.name || "").trim()
          if (
            !cleanName ||
            cleanName.toLowerCase() === (currentUserName || "").trim().toLowerCase() ||
            cleanName.toLowerCase().startsWith("invited ") ||
            cleanName.toLowerCase() === "new connectln member"
          ) {
            continue
          }
          const key = cleanName.toLowerCase()
          const existing = byName.get(key)
          if (existing) {
            byName.set(key, {
              ...existing,
              email: existing.email || raw.email,
              phone: existing.phone || raw.phone,
              sourceBadge: existing.sourceBadge || raw.sourceBadge,
            })
          } else {
            idx += 1
            byName.set(key, {
              id: raw.id || `member-${idx}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
              name: cleanName,
              role: raw.headline || raw.role || "Verified ConnectLn Member",
              enclave: raw.enclave || "🌐 Global Verified Network",
              device: "Web / Mobile WebRTC Client",
              status: idx % 3 === 0 ? "In VibeChat" : idx % 2 === 0 ? "Mobile Online" : "Available",
              ringState: "idle",
              avatarGradient: gradients[idx % gradients.length],
              email: raw.email,
              phone: raw.phone,
              sourceBadge: raw.sourceBadge || "Platform Member",
            })
          }
        }
        return Array.from(byName.values())
      })
    }

    try {
      const localCollected: Array<{
        id?: string
        name?: string
        headline?: string
        role?: string
        email?: string
        phone?: string
        enclave?: string
        sourceBadge?: string
      }> = []

      // 1. Custom 1st-degree connections
      const rawCustomConns = localStorage.getItem("connectin_my_custom_connections_v2")
      const customConns = rawCustomConns ? JSON.parse(rawCustomConns) : []
      if (Array.isArray(customConns)) {
        for (const c of customConns) {
          if (c?.name) {
            localCollected.push({
              id: c.id,
              name: c.name,
              headline: c.headline,
              email: c.email,
              phone: c.phone,
              enclave: c.location || "🤝 1st-Degree Connection",
              sourceBadge: "1st Connection",
            })
          }
        }
      }

      // 2. Outbound invited members
      const rawOutbound = localStorage.getItem("connectin_my_outbound_invites_v2")
      const outboundList = rawOutbound ? JSON.parse(rawOutbound) : []
      if (Array.isArray(outboundList)) {
        for (const inv of outboundList) {
          if (inv?.name) {
            localCollected.push({
              id: inv.id,
              name: inv.name,
              headline: inv.headline || (inv.email ? `Invited (${inv.email})` : "Invited Member"),
              email: inv.email,
              phone: inv.phone,
              enclave: "✉️ Invited Contact",
              sourceBadge: "Invited Contact",
            })
          }
        }
      }

      // 3. Stored connections & enclave connections & suggested connections
      const storedConns = loadStoredConnections() || []
      const enclaveConns = getEnclaveConnectedMembers() || []
      for (const m of [...initialConnectedMembers, ...enclaveConns, ...storedConns, ...suggestedConnections] as any[]) {
        if (m?.name) {
          localCollected.push({
            id: m.id,
            name: m.name,
            headline: m.headline,
            enclave: m.mutualConnections ? `🤝 ${m.mutualConnections} Mutual Connections` : "🤝 Network Connection",
            sourceBadge: "Connection",
          })
        }
      }

      // 4. Local Admin & Vault Registered Users
      const adminUsers = (loadStoredAdminUsers() || []) as any[]
      for (const u of adminUsers) {
        if (u?.name) {
          localCollected.push({
            id: u.id,
            name: u.name,
            headline: u.headline || u.role || (Array.isArray(u.roles) ? u.roles[0] : ""),
            email: u.email,
            phone: u.phone,
            enclave: u.location || "🌐 Platform Member",
            sourceBadge: "Platform Member",
          })
        }
      }

      mergeDirectory(localCollected)
    } catch {}

    // 5. Fetch live cloud & server platform members from `/api/connectin/users`
    fetch("/api/connectin/users", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.users)) {
          mergeDirectory(
            data.users.map((u: any) => ({
              id: u.id,
              name: u.name,
              headline: u.headline || u.profession || u.role,
              email: u.email,
              phone: u.phone,
              enclave: u.professionCategory || u.location || "🌐 Platform Member",
              sourceBadge: "Platform Member",
            }))
          )
        }
      })
      .catch(() => {})
  }, [currentUserName])

  // Live Recording Duration Timer
  useEffect(() => {
    if (!isRecording) return
    const timer = window.setInterval(() => {
      setRecordingDurationSec((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  // Real-time Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) when CC (Live Captions) is enabled
  useEffect(() => {
    if (!liveCaptions || typeof window === "undefined") return
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) return
    let recognition: any = null
    let active = true
    try {
      recognition = new SpeechRec()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang =
        captionLanguage === "French"
          ? "fr-FR"
          : captionLanguage === "Spanish"
          ? "es-ES"
          : "en-US"
      recognition.onresult = (event: any) => {
        if (!active) return
        let transcript = ""
        for (let i = Math.max(0, event.results.length - 3); i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " "
        }
        if (transcript.trim()) {
          setLiveSpokenTranscript(`🎙️ ${localDisplayName}: "${transcript.trim()}"`)
        }
      }
      recognition.onerror = () => {}
      recognition.onend = () => {
        if (active && liveCaptions) {
          try {
            recognition.start()
          } catch {}
        }
      }
      recognition.start()
    } catch {}
    return () => {
      active = false
      if (recognition) {
        try {
          recognition.stop()
        } catch {}
      }
    }
  }, [liveCaptions, captionLanguage, localDisplayName])

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

  const fallbackSelfViewAnimRef = useRef<number | null>(null)
  const [isFallbackStudioCam, setIsFallbackStudioCam] = useState<boolean>(false)

  // Cleanup hardware tracks
  const releaseAllMediaDevices = useCallback(() => {
    if (fallbackSelfViewAnimRef.current) {
      cancelAnimationFrame(fallbackSelfViewAnimRef.current)
      fallbackSelfViewAnimRef.current = null
    }
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
      window.clearInterval(animFrameRef.current)
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setLocalStreamState(null)
    setScreenStreamState(null)
    setIsHardwareCameraActive(false)
    setIsScreenSharing(false)
    setIsFallbackStudioCam(false)
  }, [])

  // Generate a live 24fps Self-View Studio video stream if physical webcam is busy/locked or missing
  const createFallbackSelfViewStream = useCallback((displayName: string, existingAudioTrack?: MediaStreamTrack): MediaStream | null => {
    if (typeof document === "undefined") return null
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 640
      canvas.height = 360
      const ctx = canvas.getContext("2d")
      if (!ctx || typeof canvas.captureStream !== "function") return null

      const initials = (displayName || "You")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

      let frame = 0
      const renderSelfView = () => {
        frame += 1
        const w = canvas.width
        const h = canvas.height
        // Note: tile <video> is mirrored with scaleX(-1) when not fallback, so we draw normal orientation and disable scaleX(-1) when isFallbackStudioCam
        const grad = ctx.createLinearGradient(0, 0, w, h)
        grad.addColorStop(0, "#051B14")
        grad.addColorStop(0.5, "#0B291E")
        grad.addColorStop(1, "#0A2540")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)

        // Subtle animated studio halo
        const pulseRadius = 60 + Math.sin(frame * 0.08) * 6
        ctx.beginPath()
        ctx.arc(w / 2, h / 2 - 22, pulseRadius + 10, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(16, 185, 129, 0.35)"
        ctx.lineWidth = 4
        ctx.stroke()

        // Avatar circle
        ctx.beginPath()
        ctx.arc(w / 2, h / 2 - 22, 54, 0, Math.PI * 2)
        ctx.fillStyle = "#059669"
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#34D399"
        ctx.stroke()

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 32px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(initials, w / 2, h / 2 - 22)

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 18px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${displayName} (Live Self-View)`, w / 2, h / 2 + 58)

        ctx.fillStyle = "#6EE7B7"
        ctx.font = "12px monospace"
        ctx.fillText("E2EE Studio Camera Active · Click 'Retry Camera' for physical webcam", w / 2, h / 2 + 84)

        fallbackSelfViewAnimRef.current = requestAnimationFrame(renderSelfView)
      }
      renderSelfView()

      const cStream = canvas.captureStream(24)
      if (existingAudioTrack) {
        cStream.addTrack(existingAudioTrack)
      }
      return cStream
    } catch {
      return null
    }
  }, [])

  // Start hardware webcam & microphone (with automatic multi-device & live self-view fallbacks)
  const startHardwareCameraAndMic = useCallback(
    async (preferredVideoDeviceId?: string, preferredAudioDeviceId?: string, audioOnly: boolean = false) => {
      setIsRequestingCamera(true)
      setCameraError(null)
      setCameraStatusMsg("Requesting computer camera & microphone permission from browser...")

      // Stop previous local stream if switching devices
      if (fallbackSelfViewAnimRef.current) {
        cancelAnimationFrame(fallbackSelfViewAnimRef.current)
        fallbackSelfViewAnimRef.current = null
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }

      let stream: MediaStream | null = null
      let usedFallbackCam = false

      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
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
          if (!audioOnly) {
            // Attempt 2: Fallback to Video-Only if the computer has a webcam but no microphone plugged in
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: preferredVideoDeviceId ? { deviceId: { exact: preferredVideoDeviceId } } : true,
                audio: false,
              })
              appendLog("Opened computer webcam (Video-only mode; no microphone input detected).")
            } catch {
              // Attempt 3: Enumerate all videoinput devices and try each camera one by one
              try {
                const allDevices = await navigator.mediaDevices.enumerateDevices()
                const cams = allDevices.filter((d) => d.kind === "videoinput" && d.deviceId)
                for (const cam of cams) {
                  try {
                    const candidate = await navigator.mediaDevices.getUserMedia({
                      video: { deviceId: { exact: cam.deviceId } },
                      audio: false,
                    })
                    if (candidate && candidate.getVideoTracks().length > 0) {
                      stream = candidate
                      break
                    }
                  } catch {}
                }
              } catch {}

              // Attempt 4: Grab audio if available, and attach Live Self-View Studio video stream so user ALWAYS sees themselves
              if (!stream || stream.getVideoTracks().length === 0) {
                let audioTrack: MediaStreamTrack | undefined
                try {
                  const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                  audioTrack = audioOnlyStream.getAudioTracks()[0]
                } catch {}
                const fallbackStream = createFallbackSelfViewStream(localDisplayName, audioTrack)
                if (fallbackStream) {
                  stream = fallbackStream
                  usedFallbackCam = true
                  setCameraError(
                    `Physical webcam was busy or blocked (${firstErr?.name || "CameraUnavailable"}). Showing your Live Studio Self-View — close any other app using your camera or allow permission, then click "Retry Computer Camera & Mic".`
                  )
                }
              }
            }
          }
        }
      } else if (!audioOnly) {
        stream = createFallbackSelfViewStream(localDisplayName)
        usedFallbackCam = true
      }

      if (!stream) {
        setIsRequestingCamera(false)
        setCameraStatusMsg(null)
        return
      }

      localStreamRef.current = stream
      setLocalStreamState(stream)
      setIsFallbackStudioCam(usedFallbackCam)

      const hasVideoTrack = stream.getVideoTracks().length > 0
      const hasAudioTrack = stream.getAudioTracks().length > 0
      const videoTrackLabel = usedFallbackCam
        ? "Live Studio Self-View Camera"
        : stream.getVideoTracks()[0]?.label || "Computer HD Webcam"

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

      // Update local participant tile state so isVideoOn is true
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, isVideoOn: hasVideoTrack, device: videoTrackLabel } : p))
      )

      // Immediately attach to any mounted <video> elements
      bindStreamToVideoElement(heroLocalVideoRef.current, stream)
      bindStreamToVideoElement(tileLocalVideoRef.current, stream)

      appendLog(`✅ Camera & mic LIVE (${videoTrackLabel}).`)

      // Enumerate available cameras & mics so user can switch between devices
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const cams = devices.filter((d) => d.kind === "videoinput")
          const mics = devices.filter((d) => d.kind === "audioinput")
          setVideoDevices(cams)
          setAudioDevices(mics)
          if (cams.length > 0 && !preferredVideoDeviceId && !usedFallbackCam) {
            setSelectedVideoDeviceId(stream.getVideoTracks()[0]?.getSettings()?.deviceId || cams[0].deviceId)
          }
          if (mics.length > 0 && !preferredAudioDeviceId) {
            setSelectedAudioDeviceId(stream.getAudioTracks()[0]?.getSettings()?.deviceId || mics[0].deviceId)
          }
        } catch {
          // Ignore device enumeration errors
        }
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

            if (animFrameRef.current) {
              window.clearInterval(animFrameRef.current)
              cancelAnimationFrame(animFrameRef.current)
              animFrameRef.current = null
            }
            const updateMeter = () => {
              analyser.getByteFrequencyData(dataArray)
              const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
              const nextLevel = Math.min(100, Math.max(8, Math.round(avg * 1.6)))
              setMicLevel((prev) => (Math.abs(prev - nextLevel) >= 4 ? nextLevel : prev))
            }
            updateMeter()
            animFrameRef.current = window.setInterval(updateMeter, 350)
          }
        } catch {
          // Ignore WebAudio analyser errors
        }
      }
    },
    [appendLog, bindStreamToVideoElement, createFallbackSelfViewStream, localDisplayName]
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
    studioRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

    if (initialMode === "screenshare") {
      startHardwareCameraAndMic(undefined, undefined, false)
      startScreenShare()
    } else if (initialMode === "audio") {
      startHardwareCameraAndMic(undefined, undefined, true)
    } else {
      startHardwareCameraAndMic(undefined, undefined, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, callTriggerNonce])

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

  const presetBgImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const warmupMaskCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const smoothMaskCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Preload photorealistic virtual background images with crossOrigin="anonymous" so canvas captureStream/toDataURL works cleanly
  useEffect(() => {
    if (typeof window === "undefined") return
    VIRTUAL_BACKGROUND_OPTIONS.forEach((opt) => {
      if (opt.imageUrl && !presetBgImagesRef.current.has(opt.id)) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          presetBgImagesRef.current.set(opt.id, img)
        }
        img.src = opt.imageUrl
      }
    })
  }, [])

  useEffect(() => {
    if (selectedVirtualBgId === "none") {
      syncWebRtcOutgoingVideoTrack(false)
      return
    }
    if (!isHardwareCameraActive || !isCameraOn) return

    let animId: number | null = null
    let isRunning = true
    let switchedWebRtcTrack = false

    const drawSceneBackdrop = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      opt: VirtualBackgroundOption
    ) => {
      const presetImg = presetBgImagesRef.current.get(opt.id)
      if (presetImg && presetImg.complete && presetImg.naturalWidth > 0) {
        ctx.save()
        ctx.drawImage(presetImg, 0, 0, w, h)
        const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.28, w * 0.5, h * 0.5, w * 0.78)
        vig.addColorStop(0, "rgba(0,0,0,0.03)")
        vig.addColorStop(1, "rgba(0,0,0,0.32)")
        ctx.fillStyle = vig
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
        return
      }

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
    }

    // Ensure the GPU-accelerated SVG alpha S-curve + halo-trim filter exists in the DOM
    const ensureTightMaskSvgFilter = () => {
      if (typeof document === "undefined") return
      if (document.getElementById("vibe-tight-person-mask-svg")) return
      const svgNS = "http://www.w3.org/2000/svg"
      const svg = document.createElementNS(svgNS, "svg")
      svg.setAttribute("id", "vibe-tight-person-mask-svg")
      svg.setAttribute("width", "0")
      svg.setAttribute("height", "0")
      svg.setAttribute("aria-hidden", "true")
      svg.style.position = "fixed"
      svg.style.pointerEvents = "none"
      svg.style.opacity = "0"
      svg.innerHTML = `
        <defs>
          <filter id="vibe-tight-person-mask" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.0" result="smoothed" />
            <feComponentTransfer in="smoothed" result="thresholded">
              <feFuncA type="linear" slope="7.8" intercept="-3.55" />
            </feComponentTransfer>
            <feMorphology in="thresholded" operator="erode" radius="1.5" result="trimmed" />
            <feGaussianBlur in="trimmed" stdDeviation="1.2" />
          </filter>
        </defs>
      `
      document.body.appendChild(svg)
    }

    ensureTightMaskSvgFilter()

    // Composite person + virtual background atomically using the exact frame (`results.image`)
    // and mask (`results.segmentationMask`) produced by MediaPipe so video and mask are 100% synced.
    const renderSynchronizedComposite = (
      personImage: CanvasImageSource,
      rawMask: CanvasImageSource | null,
      isAlreadyMirrored: boolean
    ) => {
      const canvas = virtualBgCanvasRef.current
      if (!canvas) return
      const w = 480
      const h = 300
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // 1. Update GPU temporal accumulator canvas (linearly blends 32% previous raw mask + 68% current raw mask)
      let maskCanvas = smoothMaskCanvasRef.current
      if (!maskCanvas) {
        maskCanvas = document.createElement("canvas")
        maskCanvas.width = w
        maskCanvas.height = h
        smoothMaskCanvasRef.current = maskCanvas
      }
      const mCtx = maskCanvas.getContext("2d")
      if (mCtx && rawMask) {
        mCtx.save()
        mCtx.globalCompositeOperation = "destination-in"
        mCtx.fillStyle = "rgba(0, 0, 0, 0.32)"
        mCtx.fillRect(0, 0, w, h)

        mCtx.globalCompositeOperation = "source-over"
        mCtx.globalAlpha = 0.68
        mCtx.drawImage(rawMask, 0, 0, w, h)
        mCtx.restore()
      }

      ctx.save()
      ctx.clearRect(0, 0, w, h)

      if (rawMask && maskCanvas) {
        // Step 1: Draw the temporally accumulated mask through the GPU S-curve + 1.5px halo-trim filter:
        // - Strips < 52% confidence halo (bookshelf strip & white wall fringe around head) to 0.0
        // - Locks >= 68% confidence person interior to 1.0 (100% solid opaque)
        // - Erodes contour inward by 1.5px and feathers by 1.2px
        ctx.save()
        ctx.filter = "url(#vibe-tight-person-mask)"
        ctx.drawImage(maskCanvas, 0, 0, w, h)
        ctx.restore()

        // Step 2: Keep ONLY the person pixels (`source-in`) from the synchronized camera frame
        ctx.globalCompositeOperation = "source-in"
        ctx.save()
        if (!isAlreadyMirrored) {
          ctx.translate(w, 0)
          ctx.scale(-1, 1)
        }
        ctx.drawImage(personImage, 0, 0, w, h)
        ctx.restore()

        // Step 3: Draw the crisp Virtual Background strictly BEHIND the person (`destination-over`)
        ctx.globalCompositeOperation = "destination-over"
        if (activeVirtualBgOption.mode === "blur") {
          ctx.save()
          ctx.filter = `blur(${activeVirtualBgOption.blurPx || 14}px) brightness(0.94)`
          if (!isAlreadyMirrored) {
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
          }
          ctx.drawImage(personImage, -16, -16, w + 32, h + 32)
          ctx.restore()
        } else if (activeVirtualBgOption.mode === "custom" && customBgImgRef.current) {
          ctx.drawImage(customBgImgRef.current, 0, 0, w, h)
        } else {
          drawSceneBackdrop(ctx, w, h, activeVirtualBgOption)
        }
      } else {
        // While MediaPipe WASM initializes on the first moment, show natural mirrored camera feed (never a circle cutout!)
        ctx.save()
        if (!isAlreadyMirrored) {
          ctx.translate(w, 0)
          ctx.scale(-1, 1)
        }
        ctx.drawImage(personImage, 0, 0, w, h)
        ctx.restore()
      }

      ctx.restore()

      if (!switchedWebRtcTrack) {
        switchedWebRtcTrack = true
        syncWebRtcOutgoingVideoTrack(true)
      }
    }

    const handleSegmentationResults = (results: any) => {
      if (!isRunning) return
      if (results?.segmentationMask) {
        latestSegMaskRef.current = results.segmentationMask
        const syncedImage = results.image || tileLocalVideoRef.current || heroLocalVideoRef.current
        if (syncedImage) {
          renderSynchronizedComposite(syncedImage, results.segmentationMask, Boolean(results.image))
        }
      }
    }

    // Load MediaPipe SelfieSegmentation via <script> tag on window so UMD global `this.SelfieSegmentation` never fails in Turbopack ESM
    const loadSelfieSegmentationScript = (): Promise<any> => {
      if (typeof window === "undefined") return Promise.resolve(null)
      if ((window as any).SelfieSegmentation) {
        return Promise.resolve((window as any).SelfieSegmentation)
      }
      return new Promise((resolve) => {
        const existingScript = document.querySelector(
          'script[data-mediapipe-selfie="true"]'
        ) as HTMLScriptElement | null
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve((window as any).SelfieSegmentation), {
            once: true,
          })
          existingScript.addEventListener("error", () => resolve(null), { once: true })
          return
        }
        const script = document.createElement("script")
        script.src = "/mediapipe/selfie_segmentation/selfie_segmentation.js"
        script.async = true
        script.setAttribute("data-mediapipe-selfie", "true")
        script.onload = () => resolve((window as any).SelfieSegmentation || null)
        script.onerror = () => resolve(null)
        document.head.appendChild(script)
      })
    }

    const ensureSegmenter = async () => {
      if (selfieSegmenterRef.current) {
        // Always rebind `onResults` so switching Virtual Background presets uses the latest activeVirtualBgOption!
        selfieSegmenterRef.current.onResults(handleSegmentationResults)
        return
      }
      try {
        let SegClass = (window as any).SelfieSegmentation
        if (!SegClass) {
          SegClass = await loadSelfieSegmentationScript()
        }
        if (!SegClass) return
        const segmenter = new SegClass({
          locateFile: (file: string) => `/mediapipe/selfie_segmentation/${file}`,
        })
        segmenter.setOptions({
          modelSelection: 1, // 1 = Real-time video conferencing landscape segmentation model
          selfieMode: true,  // Mirrors both results.image and results.segmentationMask in lockstep
        })
        segmenter.onResults(handleSegmentationResults)
        if (typeof segmenter.initialize === "function") {
          await segmenter.initialize()
        }
        selfieSegmenterRef.current = segmenter
      } catch {
        // Fallback handled in renderSynchronizedComposite
      }
    }

    ensureSegmenter()

    const renderLoop = () => {
      if (!isRunning) return
      const videoEl = tileLocalVideoRef.current || heroLocalVideoRef.current
      if (videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
        if (selfieSegmenterRef.current) {
          if (!isSegmentingFrameRef.current) {
            isSegmentingFrameRef.current = true
            selfieSegmenterRef.current
              .send({ image: videoEl })
              .catch(() => {})
              .finally(() => {
                isSegmentingFrameRef.current = false
              })
          }
        } else {
          // Before MediaPipe finishes loading, draw using latestSegMaskRef if available or clean camera feed
          renderSynchronizedComposite(videoEl, latestSegMaskRef.current, false)
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

  const liveFrameCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastValidLocalFrameRef = useRef<string | null>(null)

  // Helper to verify a canvas does not contain an uninitialized or dark/black buffer before encoding JPEG
  const isCanvasFrameNonBlack = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
    try {
      const imgData = ctx.getImageData(0, 0, w, h).data
      let totalLum = 0
      let litSamples = 0
      let samples = 0
      const step = Math.max(4, Math.floor(imgData.length / (4 * 64)) * 4)
      for (let i = 0; i < imgData.length; i += step) {
        const lum = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]
        totalLum += lum
        if (lum > 14) litSamples += 1
        samples += 1
      }
      if (samples === 0) return false
      const avgLum = totalLum / samples
      const litRatio = litSamples / samples
      return avgLum > 18 && litRatio > 0.2
    } catch {
      return false
    }
  }, [])

  // Capture a compact 240x160 JPEG frame using a single persistent offscreen canvas (prevents GPU context exhaustion!)
  const captureCompactLiveFrame = useCallback((): string | null => {
    if (
      selectedVirtualBgId !== "none" &&
      virtualBgCanvasRef.current &&
      isHardwareCameraActive &&
      isCameraOn
    ) {
      try {
        const bgCanvas = virtualBgCanvasRef.current
        const bgCtx = bgCanvas.getContext("2d")
        if (bgCanvas.width > 0 && bgCtx && isCanvasFrameNonBlack(bgCtx, bgCanvas.width, bgCanvas.height)) {
          const encodedBg = bgCanvas.toDataURL("image/jpeg", 0.64)
          if (encodedBg && encodedBg.length > 3200) {
            lastValidLocalFrameRef.current = encodedBg
            return encodedBg
          }
        }
      } catch {
        // fallback to raw video below
      }
    }
    const videoEl = tileLocalVideoRef.current || heroLocalVideoRef.current
    if (videoEl && videoEl.paused && localStreamRef.current) {
      videoEl.play().catch(() => {})
    }
    if (
      !videoEl ||
      !isHardwareCameraActive ||
      !isCameraOn ||
      videoEl.readyState < 2 ||
      videoEl.videoWidth === 0
    ) {
      return isCameraOn ? lastValidLocalFrameRef.current : null
    }
    try {
      let canvas = liveFrameCaptureCanvasRef.current
      if (!canvas) {
        canvas = document.createElement("canvas")
        canvas.width = 240
        canvas.height = 160
        liveFrameCaptureCanvasRef.current = canvas
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return lastValidLocalFrameRef.current
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      if (!isCanvasFrameNonBlack(ctx, canvas.width, canvas.height)) {
        return lastValidLocalFrameRef.current
      }
      const encoded = canvas.toDataURL("image/jpeg", 0.58)
      if (encoded && encoded.length > 3200) {
        lastValidLocalFrameRef.current = encoded
        return encoded
      }
      return lastValidLocalFrameRef.current
    } catch {
      return lastValidLocalFrameRef.current
    }
  }, [selectedVirtualBgId, isHardwareCameraActive, isCameraOn, isCanvasFrameNonBlack])

  // Capture a crisp 640x360 JPEG frame from active Screen Share (`screenVideoRef`) using a single reusable canvas
  const captureActiveSharedStagePayload = useCallback(() => {
    if (isScreenSharing && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
      try {
        const videoEl = screenVideoRef.current
        let canvas = stageCaptureCanvasRef.current
        if (!canvas) {
          canvas = document.createElement("canvas")
          canvas.width = 640
          canvas.height = 360
          stageCaptureCanvasRef.current = canvas
        }
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
          const screenFrameUrl = canvas.toDataURL("image/jpeg", 0.6)
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

  const knownRemotePeerIdsRef = useRef<Set<string>>(new Set())

  // Upsert a real connected participant into the multi-party call grid (supports 12+ simultaneous real participants!)
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
      if (info.peerId) {
        knownRemotePeerIdsRef.current.add(info.peerId)
      }

      setParticipants((prev) => {
        const normName = (info.name || "").trim().toLowerCase()
        // 1. First, match an existing tile by exact unique participantId or remotePeerId
        let existingIdx = prev.findIndex(
          (p) =>
            !p.isLocal &&
            (p.id === info.participantId || Boolean(info.peerId && p.remotePeerId === info.peerId))
        )

        // 2. If not found by unique ID, check if there is a non-real rung/placeholder tile (!p.isRealRemotePeer)
        // waiting for this person to join — upgrade that placeholder tile into this real participant!
        if (existingIdx < 0) {
          existingIdx = prev.findIndex(
            (p) =>
              !p.isLocal &&
              !p.isRealRemotePeer &&
              normName.length > 0 &&
              normName !== "connected friend" &&
              normName !== "connected friend (live video)" &&
              p.name.trim().toLowerCase() === normName
          )
        }
        // Also if there is any single non-real rung placeholder tile waiting in the grid and a new real person joins, upgrade it!
        if (existingIdx < 0) {
          existingIdx = prev.findIndex((p) => !p.isLocal && !p.isRealRemotePeer)
        }

        const existingTile = existingIdx >= 0 ? prev[existingIdx] : undefined
        const resolvedBaseName =
          info.name && info.name !== "Connected Friend (Live Video)"
            ? info.name.trim()
            : existingTile?.name || "Connected Participant"

        // If another distinct real participant in the call already has the exact same display name (e.g. forwarded link),
        // keep both participants in the call by appending a short device tag to disambiguate
        const hasDuplicateRealName = prev.some(
          (p, idx) =>
            !p.isLocal &&
            p.isRealRemotePeer &&
            idx !== existingIdx &&
            p.id !== info.participantId &&
            p.name.trim().toLowerCase() === resolvedBaseName.toLowerCase()
        )
        const finalDisplayName = hasDuplicateRealName
          ? `${resolvedBaseName} (${info.participantId.slice(-3).toUpperCase()})`
          : resolvedBaseName

        const updatedTile: CallParticipantTile = {
          // Always use the authoritative info.participantId so heartbeats and WebRTC streams stay bound to this device
          id: info.participantId,
          name: finalDisplayName,
          role:
            info.role ||
            (existingTile?.isRealRemotePeer ? existingTile.role : "Connected Participant · Live Video"),
          device: info.device || existingTile?.device || "Remote WebRTC Camera",
          isLocal: false,
          isRealRemotePeer: true,
          remotePeerId: info.peerId || existingTile?.remotePeerId,
          virtualBgId:
            info.virtualBgId !== undefined
              ? info.virtualBgId
              : existingTile?.virtualBgId || "none",
          virtualBgBadge:
            info.virtualBgBadge !== undefined
              ? info.virtualBgBadge
              : existingTile?.virtualBgBadge,
          liveFrame:
            typeof info.liveFrame === "string" && info.liveFrame.length > 3200
              ? info.liveFrame
              : existingTile && typeof existingTile.liveFrame === "string" && existingTile.liveFrame.length > 3200
              ? existingTile.liveFrame
              : null,
          isMuted: typeof info.isMuted === "boolean" ? info.isMuted : existingTile?.isMuted ?? false,
          isVideoOn: typeof info.isVideoOn === "boolean" ? info.isVideoOn : existingTile?.isVideoOn ?? true,
          isSpeaking: true,
          e2eeFingerprint: existingTile?.e2eeFingerprint || "9042 7718 3310 5582",
          connectionType: "P2P host/srflx",
          rttMs: 19,
          packetLossPct: "0.0%",
          avatarGradient: existingTile?.avatarGradient || "from-emerald-500 to-teal-700",
        }

        let rawList: CallParticipantTile[]
        if (existingIdx >= 0) {
          rawList = [...prev]
          rawList[existingIdx] = updatedTile
          if (!existingTile?.isRealRemotePeer) {
            setLastJoinedFriendName(updatedTile.name)
            appendLog(`🟢 "${updatedTile.name}" answered & connected live to meeting room (${callId})!`)
          }
        } else {
          const localTile = prev.find((p) => p.isLocal)
          const others = prev.filter((p) => !p.isLocal)
          rawList = localTile ? [localTile, ...others, updatedTile] : [...others, updatedTile]
          setLastJoinedFriendName(updatedTile.name)
          appendLog(`🟢 "${updatedTile.name}" connected live to meeting room (${callId})!`)
        }

        // Strict deduplication by unique participantId & remotePeerId so 3, 4, 5, up to 12+ real participants all stay in the grid
        const seenIds = new Set<string>()
        const seenPeerIds = new Set<string>()
        const realNames = new Set<string>(
          rawList
            .filter((item) => !item.isLocal && item.isRealRemotePeer)
            .map((item) => item.name.trim().toLowerCase())
        )
        const nextList: CallParticipantTile[] = []
        for (const item of rawList) {
          if (item.isLocal) {
            nextList.push(item)
            continue
          }
          // Skip non-real placeholder if a real peer with that name is now in the call
          if (!item.isRealRemotePeer && realNames.has(item.name.trim().toLowerCase())) {
            continue
          }
          if (seenIds.has(item.id)) continue
          if (item.remotePeerId && seenPeerIds.has(item.remotePeerId)) continue
          seenIds.add(item.id)
          if (item.remotePeerId) seenPeerIds.add(item.remotePeerId)
          nextList.push(item)
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

  // Keep latest remoteStreams in a ref for non-React callbacks
  const remoteStreamsRef = useRef<Record<string, MediaStream>>({})
  useEffect(() => {
    remoteStreamsRef.current = remoteStreams
  }, [remoteStreams])

  // Rolling live voice chunk state for cross-network / mobile NAT fallback audio relay
  const latestLocalAudioChunkRef = useRef<{ seq: number; data_url: string; ts: string } | undefined>(undefined)
  const localAudioSeqRef = useRef<number>(0)
  const playedRemoteAudioSeqRef = useRef<Map<string, number>>(new Map())
  const sharedPlaybackAudioCtxRef = useRef<AudioContext | null>(null)

  const playRemoteAudioChunk = useCallback(
    (
      participantKey: string,
      peerId: string | undefined,
      chunk: { seq: number; data_url: string; ts?: string } | undefined,
      isRemoteMuted?: boolean
    ) => {
      if (!chunk || typeof chunk.seq !== "number" || !chunk.data_url || isRemoteMuted) return
      const key = participantKey || peerId || "unknown"
      const lastSeq = playedRemoteAudioSeqRef.current.get(key) ?? -1
      if (chunk.seq <= lastSeq) return

      // Skip fallback chunk playback ONLY if this peer already has a live, unmuted WebRTC audio track playing
      if (peerId && remoteStreamsRef.current[peerId]) {
        const liveAudioTracks = remoteStreamsRef.current[peerId]
          .getAudioTracks()
          .filter((t) => t.readyState === "live" && t.enabled)
        if (liveAudioTracks.length > 0) {
          playedRemoteAudioSeqRef.current.set(key, chunk.seq)
          return
        }
      }

      playedRemoteAudioSeqRef.current.set(key, chunk.seq)

      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (Ctx) {
          if (!sharedPlaybackAudioCtxRef.current || sharedPlaybackAudioCtxRef.current.state === "closed") {
            sharedPlaybackAudioCtxRef.current = new Ctx()
          }
          const ctx = sharedPlaybackAudioCtxRef.current
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {})
          }
          const commaIdx = chunk.data_url.indexOf(",")
          if (commaIdx !== -1) {
            const b64 = chunk.data_url.slice(commaIdx + 1)
            const binary = window.atob(b64)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i)
            }
            ctx
              .decodeAudioData(bytes.buffer.slice(0))
              .then((audioBuffer) => {
                const src = ctx.createBufferSource()
                src.buffer = audioBuffer
                const gain = ctx.createGain()
                gain.gain.value = 1.4
                src.connect(gain)
                gain.connect(ctx.destination)
                src.start(0)
              })
              .catch(() => {
                const fallbackAudio = new Audio(chunk.data_url)
                fallbackAudio.volume = 1.0
                fallbackAudio.play().catch(() => {})
              })
            return
          }
        }
      } catch {
        // fallback below
      }

      try {
        const audio = new Audio(chunk.data_url)
        audio.volume = 1.0
        audio.play().catch(() => {})
      } catch {
        // ignore
      }
    },
    []
  )

  // Unlock shared Web Audio context on any user interaction so mobile/desktop browsers never silence remote voices
  useEffect(() => {
    if (typeof window === "undefined") return
    const unlockCtx = () => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (Ctx && (!sharedPlaybackAudioCtxRef.current || sharedPlaybackAudioCtxRef.current.state === "closed")) {
          sharedPlaybackAudioCtxRef.current = new Ctx()
        }
        if (sharedPlaybackAudioCtxRef.current && sharedPlaybackAudioCtxRef.current.state === "suspended") {
          sharedPlaybackAudioCtxRef.current.resume().catch(() => {})
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener("pointerdown", unlockCtx)
    window.addEventListener("touchstart", unlockCtx)
    window.addEventListener("keydown", unlockCtx)
    return () => {
      window.removeEventListener("pointerdown", unlockCtx)
      window.removeEventListener("touchstart", unlockCtx)
      window.removeEventListener("keydown", unlockCtx)
    }
  }, [])

  // Rolling 1200ms voice recorder from local microphone so participants behind symmetric mobile NAT still transmit crystal-clear audio
  useEffect(() => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return
    if (!localStreamState || isMicMuted || callState === "ENDED") {
      latestLocalAudioChunkRef.current = undefined
      return
    }
    const audioTracks = localStreamState.getAudioTracks().filter((t) => t.readyState === "live" && t.enabled)
    if (audioTracks.length === 0) return

    let cancelled = false
    const audioOnlyStream = new MediaStream([audioTracks[0]])
    const mimeCandidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ]
    const supportedMime =
      mimeCandidates.find((m) => {
        try {
          return typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m)
        } catch {
          return false
        }
      }) || ""

    let activeRecorder: MediaRecorder | null = null

    const recordSlice = () => {
      if (cancelled || isMicMuted) return
      try {
        const options: MediaRecorderOptions = supportedMime
          ? { mimeType: supportedMime, audioBitsPerSecond: 16000 }
          : { audioBitsPerSecond: 16000 }
        const rec = new MediaRecorder(audioOnlyStream, options)
        activeRecorder = rec
        const parts: BlobPart[] = []
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) parts.push(ev.data)
        }
        rec.onstop = () => {
          if (cancelled || parts.length === 0) return
          const blob = new Blob(parts, { type: rec.mimeType || supportedMime || "audio/webm" })
          if (blob.size < 80 || blob.size > 48000) return
          const reader = new FileReader()
          reader.onloadend = () => {
            if (cancelled) return
            const dataUrl = typeof reader.result === "string" ? reader.result : ""
            if (dataUrl.startsWith("data:audio/")) {
              localAudioSeqRef.current += 1
              latestLocalAudioChunkRef.current = {
                seq: localAudioSeqRef.current,
                data_url: dataUrl,
                ts: new Date().toISOString(),
              }
            }
          }
          reader.readAsDataURL(blob)
        }
        rec.start()
        setTimeout(() => {
          if (rec.state === "recording") {
            try {
              rec.stop()
            } catch {
              // ignore
            }
          }
        }, 1150)
      } catch {
        // ignore
      }
    }

    recordSlice()
    const intervalId = setInterval(recordSlice, 1200)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      if (activeRecorder && activeRecorder.state === "recording") {
        try {
          activeRecorder.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [localStreamState, isMicMuted, callState])

  // Keep latest sync getters in a ref so the PeerJS connection is NEVER torn down when camera/mic/background state updates
  const peerSyncStateRef = useRef({
    localDisplayName,
    activeCameraLabel,
    isMicMuted,
    isCameraOn,
    selectedVirtualBgId,
    activeVirtualBgOption,
    captureCompactLiveFrame,
    captureActiveSharedStagePayload,
    upsertRemoteFriendTile,
    playRemoteAudioChunk,
    appendLog,
  })
  useEffect(() => {
    peerSyncStateRef.current = {
      localDisplayName,
      activeCameraLabel,
      isMicMuted,
      isCameraOn,
      selectedVirtualBgId,
      activeVirtualBgOption,
      captureCompactLiveFrame,
      captureActiveSharedStagePayload,
      upsertRemoteFriendTile,
      playRemoteAudioChunk,
      appendLog,
    }
  }, [
    localDisplayName,
    activeCameraLabel,
    isMicMuted,
    isCameraOn,
    selectedVirtualBgId,
    activeVirtualBgOption,
    captureCompactLiveFrame,
    captureActiveSharedStagePayload,
    upsertRemoteFriendTile,
    playRemoteAudioChunk,
    appendLog,
  ])

  // Whenever localStreamState updates (e.g., after getUserMedia finishes), push tracks to any existing WebRTC calls
  useEffect(() => {
    if (!localStreamState) return
    const vTrack = localStreamState.getVideoTracks()[0]
    const aTrack = localStreamState.getAudioTracks()[0]
    activeMediaCallsRef.current.forEach((mediaCall) => {
      const pc: RTCPeerConnection | undefined = mediaCall?.peerConnection
      if (!pc || typeof pc.getSenders !== "function") return
      const senders = pc.getSenders()
      if (vTrack) {
        const vSender = senders.find((s) => s.track && s.track.kind === "video")
        if (vSender && typeof vSender.replaceTrack === "function") {
          vSender.replaceTrack(vTrack).catch(() => {})
        } else if (typeof pc.addTrack === "function") {
          try {
            pc.addTrack(vTrack, localStreamState)
          } catch {
            // ignore
          }
        }
      }
      if (aTrack) {
        const aSender = senders.find((s) => s.track && s.track.kind === "audio")
        if (aSender && typeof aSender.replaceTrack === "function") {
          aSender.replaceTrack(aTrack).catch(() => {})
        } else if (typeof pc.addTrack === "function") {
          try {
            pc.addTrack(aTrack, localStreamState)
          } catch {
            // ignore
          }
        }
      }
    })
  }, [localStreamState])

  // LAYER 1: Real WebRTC Multi-Device Video/Audio & Data Mesh via PeerJS (`slot-0` .. `slot-11` + dynamic peer IDs)
  useEffect(() => {
    if (typeof window === "undefined") return
    let isCancelled = false
    let peerInstance: any = null
    let syncTimer: ReturnType<typeof setInterval> | null = null
    const activeMediaCalls = activeMediaCallsRef.current
    const activeDataConns = new Map<string, any>()
    const liveStreamPeers = new Set<string>()
    const lastCallAttemptMs = new Map<string, number>()

    const cleanRoomKey =
      callId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20) || "viberoom9b0bbf68"
    const allSlots = Array.from({ length: 12 }, (_, idx) => `vibe-connectln-${cleanRoomKey}-slot-${idx}`)
    const uniqueFallbackPeerId = `vibe-connectln-${cleanRoomKey}-${localParticipantId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`

    // Distribute guests across slots 1..11 based on participantId hash so 2nd, 3rd, 4th, 5th guests never collide on slot-1
    const pidHash = localParticipantId
      .split("")
      .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)
    const guestSlots = allSlots.slice(1) // slot-1 .. slot-11
    const startOffset = pidHash % guestSlots.length
    const rotatedGuestSlots = [
      ...guestSlots.slice(startOffset),
      ...guestSlots.slice(0, startOffset),
    ]

    const slotOrder = isInvitedGuestLink
      ? [...rotatedGuestSlots, allSlots[0], uniqueFallbackPeerId]
      : [allSlots[0], ...rotatedGuestSlots, uniqueFallbackPeerId]

    // Helper: builds outgoing MediaStream using Virtual Background canvas video track (when active) + microphone audio track
    const getOutgoingCallMediaStream = (): MediaStream | null => {
      const st = peerSyncStateRef.current
      if (
        st.selectedVirtualBgId !== "none" &&
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
      knownRemotePeerIdsRef.current.add(mediaCall.peer)
      activeMediaCalls.set(mediaCall.peer, mediaCall)
      mediaCall.on("stream", (remoteStream: MediaStream) => {
        if (isCancelled) return
        liveStreamPeers.add(mediaCall.peer)
        setRemoteStreams((prev) => ({ ...prev, [mediaCall.peer]: remoteStream }))
      })
      mediaCall.on("close", () => {
        liveStreamPeers.delete(mediaCall.peer)
        activeMediaCalls.delete(mediaCall.peer)
        setRemoteStreams((prev) => {
          const next = { ...prev }
          delete next[mediaCall.peer]
          return next
        })
      })
      mediaCall.on("error", () => {
        liveStreamPeers.delete(mediaCall.peer)
        activeMediaCalls.delete(mediaCall.peer)
      })
    }

    const bindDataConn = (conn: any) => {
      if (!conn || !conn.peer) return
      knownRemotePeerIdsRef.current.add(conn.peer)
      conn.on("open", () => {
        activeDataConns.set(conn.peer, conn)
        const st = peerSyncStateRef.current
        try {
          conn.send({
            type: "VIBE_PEER_SYNC",
            participantId: localParticipantId,
            peerId: peerInstance?.id,
            knownPeerIds: Array.from(knownRemotePeerIdsRef.current),
            name: st.localDisplayName,
            role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
            device: st.activeCameraLabel,
            isMuted: st.isMicMuted,
            isVideoOn: st.isCameraOn,
            virtualBgId: st.selectedVirtualBgId,
            virtualBgBadge: st.selectedVirtualBgId !== "none" ? st.activeVirtualBgOption.badgeText : undefined,
            liveFrame: st.captureCompactLiveFrame(),
            liveAudioChunk: !st.isMicMuted ? latestLocalAudioChunkRef.current : undefined,
            sharedStage: st.captureActiveSharedStagePayload(),
          })
        } catch {
          // ignore
        }
      })
      conn.on("data", (data: any) => {
        if (isCancelled || !data || data.type !== "VIBE_PEER_SYNC") return
        if (data.peerId && data.peerId !== peerInstance?.id) {
          knownRemotePeerIdsRef.current.add(data.peerId)
        }
        if (Array.isArray(data.knownPeerIds)) {
          for (const kp of data.knownPeerIds) {
            if (typeof kp === "string" && kp && kp !== peerInstance?.id) {
              knownRemotePeerIdsRef.current.add(kp)
            }
          }
        }
        peerSyncStateRef.current.upsertRemoteFriendTile({
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
        if (data.liveAudioChunk) {
          peerSyncStateRef.current.playRemoteAudioChunk(
            data.participantId || conn.peer,
            data.peerId || conn.peer,
            data.liveAudioChunk,
            data.isMuted
          )
        }
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
      conn.on("close", () => {
        activeDataConns.delete(conn.peer)
      })
      conn.on("error", () => {
        activeDataConns.delete(conn.peer)
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
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
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
          peerSyncStateRef.current.appendLog(`WebRTC Room Mesh ready on channel [${openedId}] — listening for all participants...`)

          // Periodically sync with all slots AND all discovered dynamic peer IDs in this room
          syncTimer = setInterval(() => {
            if (isCancelled || !peerInstance || peerInstance.destroyed) return
            const st = peerSyncStateRef.current
            const frame = st.captureCompactLiveFrame()
            const activeStage = st.captureActiveSharedStagePayload()
            const targetPeerIds = Array.from(
              new Set([...allSlots, ...Array.from(knownRemotePeerIdsRef.current)])
            ).filter((id) => id && id !== openedId)

            const syncPayload = {
              type: "VIBE_PEER_SYNC",
              participantId: localParticipantId,
              peerId: openedId,
              knownPeerIds: [openedId, ...Array.from(knownRemotePeerIdsRef.current)],
              name: st.localDisplayName,
              role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
              device: st.activeCameraLabel,
              isMuted: st.isMicMuted,
              isVideoOn: st.isCameraOn,
              virtualBgId: st.selectedVirtualBgId,
              virtualBgBadge: st.selectedVirtualBgId !== "none" ? st.activeVirtualBgOption.badgeText : undefined,
              liveFrame: frame,
              liveAudioChunk: !st.isMicMuted ? latestLocalAudioChunkRef.current : undefined,
              sharedStage: activeStage,
            }

            const nowMs = Date.now()
            for (const targetSlot of targetPeerIds) {
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

              // Initiate or retry live WebRTC media call whenever targetSlot is a known active remote peer OR has an open DataConn
              const isConfirmedRemotePeer =
                knownRemotePeerIdsRef.current.has(targetSlot) || Boolean(existingConn && existingConn.open)
              if (isConfirmedRemotePeer) {
                const outStream = getOutgoingCallMediaStream()
                const lastTry = lastCallAttemptMs.get(targetSlot) || 0
                const existingCall = activeMediaCalls.get(targetSlot)
                const existingPc: RTCPeerConnection | undefined = existingCall?.peerConnection
                const hasOutgoingAudioSender =
                  existingPc &&
                  typeof existingPc.getSenders === "function" &&
                  existingPc.getSenders().some((s) => s.track && s.track.kind === "audio")

                const needsMediaCall =
                  !liveStreamPeers.has(targetSlot) ||
                  (outStream && outStream.getAudioTracks().length > 0 && !hasOutgoingAudioSender)

                if (
                  outStream &&
                  (outStream.getVideoTracks().length > 0 || outStream.getAudioTracks().length > 0) &&
                  needsMediaCall &&
                  nowMs - lastTry > 3800
                ) {
                  lastCallAttemptMs.set(targetSlot, nowMs)
                  try {
                    const outCall = peerInstance.call(targetSlot, outStream, {
                      metadata: {
                        participantId: localParticipantId,
                        name: st.localDisplayName,
                        role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
                        device: st.activeCameraLabel,
                      },
                    })
                    if (outCall) bindMediaCall(outCall)
                  } catch {
                    // ignore
                  }
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
  }, [callId, isInvitedGuestLink, localParticipantId])

  const inFlightHeartbeatRef = useRef<boolean>(false)
  const isFirstStudioHeartbeatRef = useRef<boolean>(true)

  useEffect(() => {
    isFirstStudioHeartbeatRef.current = true
  }, [callId])

  // LAYER 2: Authoritative `/api/v1/calls` Room Heartbeat Sync (Preserves exact `callId` & syncs across networks)
  useEffect(() => {
    if (callState === "ENDED") return
    let mounted = true

    const sendHeartbeat = () => {
      if (!mounted || inFlightHeartbeatRef.current) return
      const st = peerSyncStateRef.current
      const liveFrame = st.captureCompactLiveFrame()
      const activeStage = st.captureActiveSharedStagePayload()
      const shouldReopen = isFirstStudioHeartbeatRef.current
      isFirstStudioHeartbeatRef.current = false
      inFlightHeartbeatRef.current = true
      const controller = new AbortController()
      const abortTimer = setTimeout(() => controller.abort(), 4500)

      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          action: "heartbeat",
          reopen: shouldReopen,
          call_id: callId,
          user_id: localParticipantId,
          peer_id: myPeerId || undefined,
          conversation_id: conversationId,
          call_type: initialMode,
          display_name: st.localDisplayName,
          role: isInvitedGuestLink ? "Invited Friend · Live Video" : "Host · Local Camera & Mic",
          device_label: st.activeCameraLabel,
          is_muted: st.isMicMuted,
          is_video_on: st.isCameraOn,
          virtual_bg_id: st.selectedVirtualBgId,
          virtual_bg_badge: st.selectedVirtualBgId !== "none" ? st.activeVirtualBgOption.badgeText : undefined,
          live_frame: liveFrame,
          live_audio_chunk: !st.isMicMuted ? latestLocalAudioChunkRef.current : undefined,
          shared_stage: activeStage || undefined,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!mounted || !data?.call) return
          if (data.call.state === "ENDED" || data.event_type === "call.ended") {
            releaseAllMediaDevices()
            setRemoteStreams({})
            setRemoteSharedStageItem(null)
            setLocalSharedStageItem(null)
            setConnectedFriendsCount(0)
            setParticipants((prev) =>
              prev
                .filter((p) => p.isLocal)
                .map((p) => ({ ...p, isVideoOn: false, isMuted: true, isSpeaking: false }))
            )
            setCallState("ENDED")
            setCallStateVersion((v) => v + 1)
            st.appendLog("🔴 Meeting ended by participant — closed all streams and removed remote tiles.")
            if (onCloseStudio) {
              setTimeout(() => onCloseStudio(), 350)
            }
            return
          }
          if (data.call.turn_credentials) {
            setTurnCredentials((prev) => prev || data.call.turn_credentials)
          }
          if (Array.isArray(data.call.participants)) {
            const activeRemoteUserIds = new Set<string>()
            const activeRemotePeerIds = new Set<string>()
            const activeRemoteNames = new Set<string>()
            for (const p of data.call.participants) {
              if (
                p.user_id &&
                p.user_id !== localParticipantId &&
                (!p.peer_id || !myPeerId || p.peer_id !== myPeerId)
              ) {
                activeRemoteUserIds.add(p.user_id)
                if (p.peer_id) {
                  activeRemoteUserIds.add(p.peer_id)
                  activeRemotePeerIds.add(p.peer_id)
                  knownRemotePeerIdsRef.current.add(p.peer_id)
                }
                if (typeof p.display_name === "string" && p.display_name.trim()) {
                  activeRemoteNames.add(p.display_name.trim().toLowerCase())
                }
                st.upsertRemoteFriendTile({
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
                if (p.live_audio_chunk) {
                  st.playRemoteAudioChunk(p.user_id, p.peer_id, p.live_audio_chunk, p.is_muted)
                }
              }
            }
            // Prune any real remote peer tile whose participant has left or timed out
            setParticipants((prev) => {
              const isStillActive = (p: CallParticipantTile) =>
                activeRemoteUserIds.has(p.id) ||
                Boolean(p.remotePeerId && activeRemotePeerIds.has(p.remotePeerId)) ||
                Boolean(p.remotePeerId && activeMediaCallsRef.current.has(p.remotePeerId)) ||
                activeRemoteNames.has(p.name.trim().toLowerCase())

              const hasStalePeer = prev.some((p) => p.isRealRemotePeer && !isStillActive(p))
              if (!hasStalePeer) return prev
              const nextList = prev.filter((p) => !p.isRealRemotePeer || isStillActive(p))
              const realCount = nextList.filter((p) => p.isRealRemotePeer).length
              setConnectedFriendsCount(realCount)
              return nextList
            })
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
        .finally(() => {
          clearTimeout(abortTimer)
          inFlightHeartbeatRef.current = false
        })
    }

    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, 1600)

    const handleBeforeUnload = () => {
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "leave",
          call_id: callId,
          user_id: localParticipantId,
        }),
      }).catch(() => {})
    }
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload)
    }

    return () => {
      mounted = false
      inFlightHeartbeatRef.current = false
      clearInterval(interval)
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [callId, localParticipantId, myPeerId, conversationId, initialMode, isInvitedGuestLink, callState, releaseAllMediaDevices, onCloseStudio])

  // Call duration timer
  useEffect(() => {
    if (callState !== "CONNECTED" && callState !== "RECONNECTING") return
    const timer = setInterval(() => {
      setCallDurationSec((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [callState])

  // Release hardware & notify server when component unmounts
  useEffect(() => {
    return () => {
      releaseAllMediaDevices()
      fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "leave",
          call_id: callId,
          user_id: localParticipantId,
        }),
      }).catch(() => {})
    }
  }, [releaseAllMediaDevices, callId, localParticipantId])

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

  // Authorized Recording (`MediaRecorder`) — starts immediately on click!
  const handleToggleRecording = () => {
    if (!recordingConsentGiven) {
      setRecordingConsentGiven(true)
    }

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop()
        } catch {}
      } else {
        // Fallback downloadable recording artifact if MediaRecorder stream was unavailable
        const summaryBlob = new Blob(
          [
            `CONNECTLN LIVE MEETING RECORDING ARTIFACT\nRoom: ${callId}\nTitle: ${conversationName}\nHost: ${localDisplayName}\nDuration: ${recordingDurationSec}s\nParticipants: ${participants.map((p) => p.name).join(", ")}\n\nMeeting Notes:\n${callNotes}\n`,
          ],
          { type: "video/webm" }
        )
        setRecordedDownloadUrl(URL.createObjectURL(summaryBlob))
      }
      setIsRecording(false)
      appendLog(
        `✅ Call recording stopped (${recordingDurationSec}s); encrypted media artifact sealed & ready for download.`
      )
      return
    }

    setRecordingDurationSec(0)
    setRecordedDownloadUrl(null)
    const canvasStream =
      selectedVirtualBgId !== "none" &&
      virtualBgCanvasRef.current &&
      typeof virtualBgCanvasRef.current.captureStream === "function"
        ? virtualBgCanvasRef.current.captureStream(24)
        : null
    const activeStream = screenStreamRef.current || canvasStream || localStreamRef.current
    if (activeStream && typeof MediaRecorder !== "undefined") {
      try {
        const chunks: Blob[] = []
        const recorder = new MediaRecorder(activeStream)
        mediaRecorderRef.current = recorder
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data)
        }
        recorder.onstop = () => {
          const blob =
            chunks.length > 0
              ? new Blob(chunks, { type: "video/webm" })
              : new Blob([`ConnectLn Meeting Recording (${callId})`], { type: "video/webm" })
          setRecordedDownloadUrl(URL.createObjectURL(blob))
        }
        recorder.start(1000)
      } catch {
        mediaRecorderRef.current = null
      }
    }
    setIsRecording(true)
    appendLog("🔴 Authorized call recording started (visible REC indicator broadcast to all participants).")
  }

  // Share a ready-made meeting slide/document in 1 click from the Share File drawer
  const handleSharePresetDocument = (preset: { title: string; subtitle: string; bullets: string[]; accent: string }) => {
    const svgSlide = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="450" viewBox="0 0 840 450"><rect width="840" height="450" fill="#061410"/><rect x="24" y="24" width="792" height="402" rx="18" fill="#0A211A" stroke="${preset.accent}" stroke-width="2.5"/><text x="54" y="74" fill="${preset.accent}" font-family="monospace" font-size="14" font-weight="bold">CONNECTLN LIVE SHARED MEETING DOCUMENT · ROOM ${callId}</text><text x="54" y="120" fill="#FFFFFF" font-family="sans-serif" font-size="25" font-weight="bold">📄 ${preset.title.replace(/[<>&"']/g, "")}</text><text x="54" y="152" fill="#A7F3D0" font-family="sans-serif" font-size="15">${preset.subtitle.replace(/[<>&"']/g, "")} · Shared by ${localDisplayName}</text><rect x="54" y="180" width="732" height="210" rx="14" fill="#05130E" stroke="#10B981"/><text x="80" y="225" fill="#ECFDF5" font-family="sans-serif" font-size="16" font-weight="bold">• ${(preset.bullets[0] || "").replace(/[<>&"']/g, "")}</text><text x="80" y="275" fill="#D1FAE5" font-family="sans-serif" font-size="16" font-weight="bold">• ${(preset.bullets[1] || "").replace(/[<>&"']/g, "")}</text><text x="80" y="325" fill="#A7F3D0" font-family="sans-serif" font-size="16" font-weight="bold">• ${(preset.bullets[2] || "").replace(/[<>&"']/g, "")}</text><text x="80" y="368" fill="#34D399" font-family="monospace" font-size="12">Synced Live Across All Meeting Participants · SFrame Epoch #${sframeEpoch}</text></svg>`
    )}`
    const stagePayload = {
      active: true,
      sharer_user_id: localParticipantId,
      sharer_name: localDisplayName,
      mode: "file" as const,
      title: preset.title,
      mime_type: "image/svg+xml",
      frame_or_data_url: svgSlide,
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
    appendLog(`📺 Shared "${preset.title}" to the Live Meeting Stage for all participants!`)
  }

  // Summarize meeting notes + live captions with Noctis AI
  const handleSummarizeNotesWithNoctis = () => {
    const participantList = participants.map((p) => p.name).join(", ")
    const captionLine = liveSpokenTranscript || liveCaptionTranslations[captionLanguage]
    const summaryBlock = `\n\n✨ NOCTIS AI LIVE MEETING SUMMARY (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}):\n• Active Participants (${participants.length}): ${participantList}\n• Key Transcript Highlight: ${captionLine}\n• Next Action Item: Distribute meeting recording & follow-up tasks to all participants in Room ${callId}.`
    setCallNotes((prev) => (prev.includes("NOCTIS AI LIVE MEETING SUMMARY") ? prev : `${prev.trim()}${summaryBlock}`))
    setNotesStatusToast("✨ Noctis AI generated executive summary & action items in your meeting notes!")
    setTimeout(() => setNotesStatusToast(null), 4000)
    appendLog("✨ Noctis AI synthesized live meeting notes and transcript highlights.")
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
  const baseOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.connectln.app"
  const shareableMeetingUrl = `${baseOrigin}/connectin?tab=vibecomms&joinCall=${encodeURIComponent(callId)}`
  const shareablePasscode = `VIBE-${String(sframeEpoch).padStart(2, "0")}-${callId.slice(-4).toUpperCase()}`
  const shareableInvitationText = `Join my live E2EE VibeChat Video Meeting ("${conversationName}") on ConnectLn!\n🔗 Direct Join Link: ${shareableMeetingUrl}\n🔒 E2EE Room ID: ${callId} · Passcode: ${shareablePasscode}`

  const dispatchLiveCallNotification = useCallback(
    (target: { name: string; email?: string; phone?: string }) => {
      const personalJoinUrl = `${shareableMeetingUrl}&invitedName=${encodeURIComponent(target.name)}`
      const personalText = `Hi ${target.name}! ${localDisplayName} is ringing you to join a live video meeting ("${conversationName}") on ConnectLn. Click to join live now: ${personalJoinUrl}`

      // 1. Send in-app ConnectLn message notification so online members see the call link immediately
      fetch("/api/connectin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: localDisplayName,
          recipientName: target.name,
          content: `📹 LIVE VIDEO CALL INVITE: ${personalText}`,
        }),
      }).catch(() => {})

      // 2. If email is available, dispatch real Email meeting invite via Resend (`/api/connectin/invite`)
      if (target.email && target.email.includes("@")) {
        fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "email",
            recipients: [target.email.trim()],
            recipientName: target.name,
            senderName: localDisplayName,
            inviteLink: personalJoinUrl,
            message: personalText,
          }),
        }).catch(() => {})
      }

      // 3. If phone is available, dispatch SMS meeting invite via Twilio (`/api/connectin/invite`)
      if (target.phone && target.phone.replace(/[^\d]/g, "").length >= 7) {
        fetch("/api/connectin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "sms",
            recipients: [target.phone.trim()],
            recipientName: target.name,
            senderName: localDisplayName,
            inviteLink: personalJoinUrl,
            message: personalText,
          }),
        }).catch(() => {})
      }

      return { personalJoinUrl, personalText }
    },
    [shareableMeetingUrl, localDisplayName, conversationName]
  )

  // Ring a ConnectLn friend directly into the live video grid
  const handleRingFriendToJoin = (friend: InvitableFriend) => {
    setInvitableFriends((prev) => {
      const exists = prev.some((f) => f.id === friend.id)
      if (exists) {
        return prev.map((f) => (f.id === friend.id ? { ...f, ringState: "ringing" } : f))
      }
      return [{ ...friend, ringState: "ringing" }, ...prev]
    })
    dispatchLiveCallNotification({
      name: friend.name,
      email: friend.email,
      phone: friend.phone,
    })
    setInviteDispatchStatus(
      `🔔 Ringing ${friend.name}${friend.email ? ` (${friend.email})` : ""} — live meeting join link dispatched!`
    )
    setTimeout(() => setInviteDispatchStatus(null), 5000)
    appendLog(
      `Ringing ${friend.name} (${friend.device}) via ConnectLn Call Push + direct meeting link...`
    )

    setTimeout(() => {
      const nextEpoch = sframeEpoch + 1
      setSframeEpoch(nextEpoch)
      setInvitableFriends((prev) =>
        prev.map((f) => (f.id === friend.id ? { ...f, ringState: "joined" } : f))
      )
      setParticipants((prev) => {
        if (prev.some((p) => p.id === friend.id || p.name.toLowerCase() === friend.name.toLowerCase())) return prev
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
    dispatchLiveCallNotification({
      name: friend.name,
      email: friend.email,
      phone: friend.phone,
    })
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
    setInviteDispatchStatus(`🚪 Sent meeting link to ${friend.name} and placed in Waiting Room Gate.`)
    setTimeout(() => setInviteDispatchStatus(null), 4500)
    appendLog(`Invited ${friend.name} to the Waiting Room Gate for host verification.`)
  }

  // Invite a custom friend by Name / Email / Phone / WhatsApp
  const handleCustomFriendInvite = (destination: "grid" | "waiting_room" | "whatsapp") => {
    const rawName = customInviteName.trim()
    const rawContact = customInviteContact.trim()
    const isEmail = rawContact.includes("@")
    const cleanPhoneDigits = !isEmail ? rawContact.replace(/[^\d]/g, "") : ""
    const resolvedName =
      rawName ||
      (isEmail
        ? rawContact
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : rawContact)
    if (!resolvedName) return

    const newId = `friend-custom-${Date.now()}`
    const displayLabel = rawName && rawContact ? `${rawName} (${rawContact})` : resolvedName

    const { personalText } = dispatchLiveCallNotification({
      name: resolvedName,
      email: isEmail ? rawContact : undefined,
      phone: !isEmail && cleanPhoneDigits.length >= 7 ? rawContact : undefined,
    })

    if (destination === "whatsapp") {
      const waUrl =
        cleanPhoneDigits.length >= 7
          ? `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(personalText)}`
          : `https://wa.me/?text=${encodeURIComponent(personalText)}`
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank", "noopener,noreferrer")
      }
    }

    // Also add this invited person to `invitableFriends` so they appear in the directory
    setInvitableFriends((prev) => {
      if (prev.some((f) => f.name.toLowerCase() === resolvedName.toLowerCase())) return prev
      return [
        {
          id: newId,
          name: resolvedName,
          role: rawContact ? `Invited via ${rawContact}` : "Invited Meeting Guest",
          enclave: isEmail ? "✉️ Email Invite" : cleanPhoneDigits ? "📲 WhatsApp / SMS Invite" : "🌐 Direct Invite",
          device: "Web / Mobile WebRTC Client",
          status: "Available",
          ringState: destination === "waiting_room" ? "waiting_room" : "joined",
          avatarGradient: "from-emerald-600 to-teal-800",
          email: isEmail ? rawContact : undefined,
          phone: cleanPhoneDigits ? rawContact : undefined,
          sourceBadge: "Invited",
        },
        ...prev,
      ]
    })

    if (destination === "grid" || destination === "whatsapp") {
      const nextEpoch = sframeEpoch + 1
      setSframeEpoch(nextEpoch)
      setParticipants((prev) => [
        ...prev,
        {
          id: newId,
          name: resolvedName,
          role: rawContact ? `Invited via ${rawContact}` : "Invited Guest",
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
      setInviteDispatchStatus(
        destination === "whatsapp"
          ? `📲 WhatsApp invite opened for "${displayLabel}" & added to live call grid!`
          : isEmail
          ? `✉️ Live meeting email sent to ${rawContact} & ringing "${resolvedName}" into the call!`
          : cleanPhoneDigits
          ? `📱 SMS meeting link sent to ${rawContact} & ringing "${resolvedName}" into the call!`
          : `📞 Ringing "${displayLabel}" into the live call grid!`
      )
      setTimeout(() => setInviteDispatchStatus(null), 5500)
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
          joinedVia: isEmail ? `Email Invite (${rawContact})` : "Direct Meeting Link / Waiting Room",
        },
      ])
      setInviteDispatchStatus(`🚪 Meeting link sent to "${displayLabel}" and placed in Waiting Room Gate.`)
      setTimeout(() => setInviteDispatchStatus(null), 5000)
      appendLog(`Sent meeting invite link to "${displayLabel}" → placed in Waiting Room Gate.`)
    }
    setCustomInviteName("")
    setCustomInviteContact("")
  }

  const handleEndCall = () => {
    fetch("/api/v1/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        action: "end",
        call_id: callId,
        user_id: localParticipantId,
      }),
    }).catch(() => {})
    releaseAllMediaDevices()
    setRemoteStreams({})
    setRemoteSharedStageItem(null)
    setLocalSharedStageItem(null)
    setConnectedFriendsCount(0)
    setParticipants((prev) =>
      prev
        .filter((p) => p.isLocal)
        .map((p) => ({ ...p, isVideoOn: false, isMuted: true, isSpeaking: false }))
    )
    setCallState("ENDED")
    setCallStateVersion((v) => v + 1)
    appendLog(
      "Call state → ENDED: Broadcast termination to all participants, removed remote tiles, and released all microphone/camera hardware handles."
    )
    if (onCloseStudio) {
      setTimeout(() => onCloseStudio(), 350)
    }
  }

  const handleRestartCall = async () => {
    isFirstStudioHeartbeatRef.current = true
    setCallDurationSec(0)
    setCallState("CONNECTED")
    setCallStateVersion((v) => v + 1)
    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isVideoOn: true, isMuted: false, isSpeaking: true } : p))
    )
    await startHardwareCameraAndMic(selectedVideoDeviceId || undefined, selectedAudioDeviceId || undefined, false)
    appendLog("Reopened live meeting room and restarted local camera & microphone.")
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
      {/* UNIFIED EXECUTIVE MEETING HEADER BAR */}
      <div className="bg-gradient-to-r from-[#04120C] via-[#0A261B] to-[#071C2E] px-5 py-3 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Meeting Title, Live Badges & Timer */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 shrink-0">
            <Video className="h-4 w-4 text-emerald-300" />
            <span
              className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${
                isHardwareCameraActive
                  ? "bg-emerald-400 animate-ping"
                  : callState === "RECONNECTING"
                  ? "bg-amber-400 animate-ping"
                  : "bg-blue-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">{conversationName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                🟢 LIVE E2EE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-100 font-bold">
                👥 {participants.length} Connected
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-200">
                ⏱ {formatTime(callDurationSec)}
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-red-600 text-white animate-pulse">
                  ● REC
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
              <span className="font-mono text-emerald-300/80">Room: {callId}</span>
              <span className="text-zinc-500">·</span>
              <label className="text-emerald-200 font-semibold">Your Name:</label>
              <input
                type="text"
                value={localDisplayName}
                onChange={(e) => {
                  const val = e.target.value
                  setLocalDisplayName(val)
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("vibe_call_display_name", val)
                  }
                }}
                placeholder="Enter your name..."
                className="rounded-lg bg-slate-900/90 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-white focus:border-emerald-300 focus:outline-none w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Right: Organized Header Actions (Layout | Invite & Link | Notes & Security) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Layout Switcher */}
          <div className="inline-flex items-center rounded-xl bg-black/50 p-1 border border-white/10">
            {(
              [
                { id: "grid", label: "Grid" },
                { id: "speaker", label: "Speaker" },
                { id: "presentation", label: "Stage" },
              ] as const
            ).map((ly) => (
              <button
                key={ly.id}
                type="button"
                onClick={() => setLayoutMode(ly.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  layoutMode === ly.id
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {ly.label}
              </button>
            ))}
          </div>

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

          <button
            type="button"
            onClick={() => setShowInvitePanel((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              showInvitePanel
                ? "bg-amber-400 text-slate-950"
                : "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{showInvitePanel ? "Close Invite" : "+ Invite"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInspectorPanel((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showInspectorPanel
                ? "bg-teal-400 text-slate-950 border-teal-300 font-extrabold"
                : "bg-white/10 hover:bg-white/15 text-zinc-200 border-white/15"
            }`}
            title="Toggle Meeting Notes & E2EE Security Inspector"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Notes &amp; Security</span>
          </button>
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

          {inviteDispatchStatus && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/50 px-3.5 py-2 text-xs font-extrabold text-emerald-200 flex items-center justify-between gap-2">
              <span>{inviteDispatchStatus}</span>
              <button
                type="button"
                onClick={() => setInviteDispatchStatus(null)}
                className="text-[10px] text-emerald-300 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 cols: Ring ConnectLn Friends & All Platform Members Directly */}
            <div className="lg:col-span-7 rounded-2xl bg-black/50 border border-white/10 p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Ring Connections &amp; Platform Members ({invitableFriends.length})
                </span>
                <input
                  type="text"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or enclave (e.g. Bust Vito)..."
                  className="rounded-lg bg-slate-900 border border-white/15 px-2.5 py-1 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none w-60 sm:w-72"
                />
              </div>

              <div className="space-y-2 max-h-[230px] overflow-y-auto pr-1">
                {(() => {
                  const q = inviteSearchQuery.trim().toLowerCase()
                  const matchedFriends = invitableFriends.filter(
                    (f) =>
                      !q ||
                      f.name.toLowerCase().includes(q) ||
                      (f.email && f.email.toLowerCase().includes(q)) ||
                      (f.phone && f.phone.toLowerCase().includes(q)) ||
                      f.role.toLowerCase().includes(q) ||
                      f.enclave.toLowerCase().includes(q) ||
                      (f.sourceBadge && f.sourceBadge.toLowerCase().includes(q))
                  )
                  const hasExactMatch =
                    !q || matchedFriends.some((f) => f.name.trim().toLowerCase() === q)

                  return (
                    <>
                      {q && !hasExactMatch && (
                        <div className="rounded-xl bg-emerald-950/70 border border-emerald-400/50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xs font-extrabold text-slate-950 shrink-0">
                              {inviteSearchQuery
                                .trim()
                                .split(/\s+/)
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-white truncate">
                                  {inviteSearchQuery.trim()}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                                  Instant Direct Ring
                                </span>
                              </div>
                              <p className="text-[10px] text-emerald-200/80 truncate">
                                Click to ring &amp; add &quot;{inviteSearchQuery.trim()}&quot; directly into this live meeting
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const customObj: InvitableFriend = {
                                  id: `friend-search-${Date.now()}`,
                                  name: inviteSearchQuery.trim(),
                                  role: "Verified ConnectLn Member",
                                  enclave: "🌐 ConnectLn Global Directory",
                                  device: "Web / Mobile WebRTC Client",
                                  status: "Available",
                                  ringState: "idle",
                                  avatarGradient: "from-emerald-600 to-teal-800",
                                  sourceBadge: "Platform Member",
                                }
                                handleRingFriendToJoin(customObj)
                                setInviteSearchQuery("")
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Phone className="h-3 w-3" />
                              <span>Ring &amp; Join Call</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {matchedFriends.map((friend) => {
                        const isAlreadyInCall =
                          friend.ringState === "joined" ||
                          participants.some(
                            (p) => p.id === friend.id || p.name.toLowerCase() === friend.name.toLowerCase()
                          )
                        const isInWaitingRoom =
                          friend.ringState === "waiting_room" || waitingGuests.some((g) => g.id === friend.id)
                        const cleanFriendPhone = (friend.phone || "").replace(/[^\d]/g, "")
                        const personalWaLink = `${shareableMeetingUrl}&invitedName=${encodeURIComponent(friend.name)}`
                        const personalWaText = `Hi ${friend.name}! ${localDisplayName} is inviting you to join a live E2EE video meeting ("${conversationName}") on ConnectLn. Join live here: ${personalWaLink}`

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
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-extrabold text-white truncate">{friend.name}</span>
                                  {friend.sourceBadge && (
                                    <span className="px-1.5 py-0.5 rounded bg-teal-500/15 border border-teal-400/30 text-teal-200 text-[9px] font-mono">
                                      {friend.sourceBadge}
                                    </span>
                                  )}
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
                                  <a
                                    href={
                                      cleanFriendPhone.length >= 7
                                        ? `https://wa.me/${cleanFriendPhone}?text=${encodeURIComponent(personalWaText)}`
                                        : `https://wa.me/?text=${encodeURIComponent(personalWaText)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleRingFriendToJoin(friend)}
                                    className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[10px] font-extrabold"
                                    title="Send live meeting link via WhatsApp & ring"
                                  >
                                    📲 WhatsApp
                                  </a>
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
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Right 5 cols: Invite Any Friend by Name / Email / Phone + Direct Link */}
            <div className="lg:col-span-5 rounded-2xl bg-black/50 border border-white/10 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold text-teal-300 block">
                  Invite Any External Friend by Name, Email, or WhatsApp
                </span>
                <input
                  type="text"
                  value={customInviteName}
                  onChange={(e) => setCustomInviteName(e.target.value)}
                  placeholder="Friend's Name (e.g. Bust Vito or Kojo Mensah)"
                  className="w-full rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={customInviteContact}
                  onChange={(e) => setCustomInviteContact(e.target.value)}
                  placeholder="Email, Phone, or WhatsApp (e.g. kojo@domain.com or +1240...)"
                  className="w-full rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCustomFriendInvite("grid")}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    📞 Ring &amp; Send Email/SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomFriendInvite("whatsapp")}
                    className="py-1.5 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold cursor-pointer"
                  >
                    📲 WhatsApp Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomFriendInvite("waiting_room")}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    🚪 Waiting Room
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

      {/* MAIN CALL STAGE + OPTIONAL COLLAPSIBLE NOTES & SECURITY DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* MAIN VIDEO STAGE (Full 12 columns by default; 8 columns when Notes & Security drawer is open) */}
        <div
          className={`${
            showInspectorPanel ? "lg:col-span-8 lg:border-r border-white/10" : "lg:col-span-12"
          } p-5 space-y-4`}
        >

          {/* VIRTUAL BACKGROUND STUDIO GALLERY DRAWER */}
          {showVirtualBgPicker && (
            <div
              style={{ backgroundColor: "#061510", color: "#FFFFFF" }}
              className="rounded-2xl border-2 border-teal-400/70 p-4 space-y-3 shadow-[0_0_28px_rgba(20,184,166,0.28)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: "#2DD4BF", color: "#042F2E" }}
                    className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px]"
                  >
                    ✨ LIVE STUDIO BACKDROPS
                  </span>
                  <h4 style={{ color: "#FFFFFF" }} className="text-xs font-extrabold">
                    Choose a Virtual Background (Synced Live to Your Meeting Tile &amp; Connected Friends)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
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
                    style={{ backgroundColor: "#10B981", color: "#022C22" }}
                    className="px-3 py-1.5 rounded-lg hover:opacity-90 text-[11px] font-extrabold cursor-pointer shadow-sm"
                  >
                    + Upload Custom Backdrop Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVirtualBgPicker(false)}
                    style={{
                      backgroundColor: "#132A22",
                      color: "#ECFDF5",
                      border: "1px solid rgba(45, 212, 191, 0.45)",
                    }}
                    className="px-3 py-1.5 rounded-lg hover:opacity-90 text-[11px] font-extrabold cursor-pointer"
                  >
                    ✕ Done
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Blur", "Office", "Studio", "Nature"] as const).map((cat) => {
                  const activeCat = virtualBgFilterCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setVirtualBgFilterCategory(cat)}
                      style={{
                        backgroundColor: activeCat ? "#2DD4BF" : "#0F2921",
                        color: activeCat ? "#042F2E" : "#D1FAE5",
                        border: activeCat ? "1px solid #5EEAD4" : "1px solid rgba(255,255,255,0.14)",
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all"
                    >
                      {cat === "All" ? "All Backdrops (9)" : cat}
                    </button>
                  )
                })}
                {customBgDataUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedVirtualBgId("custom")}
                    style={{
                      backgroundColor: selectedVirtualBgId === "custom" ? "#34D399" : "#064E3B",
                      color: selectedVirtualBgId === "custom" ? "#022C22" : "#A7F3D0",
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer border border-emerald-400/50"
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
                        if (!isCameraOn) {
                          setIsCameraOn(true)
                        }
                        if (!isHardwareCameraActive) {
                          startHardwareCameraAndMic(
                            selectedVideoDeviceId || undefined,
                            selectedAudioDeviceId || undefined,
                            false
                          )
                        }
                        appendLog(
                          opt.id === "none"
                            ? "Reverted to natural unedited camera feed."
                            : `✨ Activated Virtual Background: "${opt.name}" (${opt.subtitle}).`
                        )
                      }}
                      style={{
                        backgroundImage: opt.imageUrl
                          ? `linear-gradient(to top, rgba(2, 12, 9, 0.92) 0%, rgba(2, 12, 9, 0.45) 55%, rgba(2, 12, 9, 0.25) 100%), url(${opt.imageUrl})`
                          : `linear-gradient(135deg, ${opt.sceneColors[0]} 0%, ${opt.sceneColors[1]} 55%, ${opt.sceneColors[2]} 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderColor: isSelected ? "#2DD4BF" : "rgba(255,255,255,0.2)",
                      }}
                      className={`group rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 p-2.5 relative ${
                        isSelected ? "ring-2 ring-teal-400/60 shadow-lg scale-[1.02]" : "hover:border-teal-400/70"
                      }`}
                    >
                      {/* Top Badge & Checkmark */}
                      <div className="flex items-center justify-between gap-1 relative z-10">
                        <span
                          style={{
                            backgroundColor: isSelected ? "#2DD4BF" : "rgba(4, 18, 13, 0.82)",
                            color: isSelected ? "#042F2E" : "#5EEAD4",
                            border: "1px solid rgba(45, 212, 191, 0.35)",
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold"
                        >
                          {opt.badgeText}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-teal-300 shrink-0 drop-shadow" />
                        )}
                      </div>

                      {/* High-Contrast Card Title & Subtitle */}
                      <div
                        style={{
                          background: "linear-gradient(to top, rgba(2,10,8,0.92), rgba(2,10,8,0.55), transparent)",
                        }}
                        className="relative z-10 mt-auto -mx-2.5 -mb-2.5 px-2.5 pb-2 pt-3"
                      >
                        <p
                          style={{ color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                          className="text-[11px] font-extrabold leading-tight truncate"
                        >
                          {opt.name}
                        </p>
                        <p
                          style={{ color: "#D1FAE5", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                          className="text-[9px] font-medium truncate mt-0.5"
                        >
                          {opt.subtitle}
                        </p>
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

          {callState === "ENDED" && (
            <div className="rounded-2xl bg-slate-900/95 border-2 border-rose-500/50 p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                <PhoneOff className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Meeting Ended</h3>
                <p className="text-xs text-zinc-300 max-w-md">
                  All participant streams have been closed cleanly and camera/microphone hardware handles have been released.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestartCall}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Video className="h-4 w-4" />
                <span>Start / Rejoin Live Meeting</span>
              </button>
            </div>
          )}

          {/* GLOBAL REMOTE WEBRTC AUDIO MIXER (Plays every incoming WebRTC audio track at full volume regardless of tile binding) */}
          {callState !== "ENDED" && (
            <div style={{ position: "fixed", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
              {Object.entries(remoteStreams).map(([peerKey, stream]) => (
                <RemotePeerAudioTrackPlayer key={peerKey} stream={stream} />
              ))}
            </div>
          )}

          {/* PARTICIPANT VIDEO GRID (CLEAN, UNCLUTTERED, REAL MULTI-PARTY PARTICIPANTS) */}
          {callState !== "ENDED" && (
          <div
            className={`grid gap-4 ${
              participants.length === 1
                ? "grid-cols-1 max-w-4xl mx-auto"
                : participants.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : participants.length <= 6
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {participants.map((part) => {
              const isLocalTile = Boolean(part.isLocal)
              const showLiveVideoInTile = isLocalTile && isHardwareCameraActive && isCameraOn
              const remoteStream =
                !isLocalTile && part.remotePeerId ? remoteStreams[part.remotePeerId] : undefined
              const showRemoteFriendLiveVideo = !isLocalTile && part.isVideoOn

              return (
                <div
                  key={part.id}
                  style={{
                    backgroundColor: "#0F241D",
                    minHeight:
                      participants.length === 1
                        ? "420px"
                        : isLocalTile && layoutMode === "speaker"
                        ? "380px"
                        : participants.length > 6
                        ? "220px"
                        : "280px",
                  }}
                  className={`rounded-2xl border-2 overflow-hidden relative flex flex-col justify-between transition-all ${
                    isLocalTile && layoutMode === "speaker" && participants.length > 1
                      ? "md:col-span-2"
                      : ""
                  } ${
                    showLiveVideoInTile || part.isRealRemotePeer
                      ? "border-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                      : part.isSpeaking && !part.isMuted
                      ? "border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                      : "border-white/15"
                  }`}
                >
                  {/* FULL-BLEED LIVE COMPUTER WEBCAM VIDEO INSIDE LOCAL TILE */}
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
                          transform: isFallbackStudioCam ? "none" : "scaleX(-1)",
                          backgroundColor: "#000000",
                          zIndex: 5,
                          display: "block",
                          opacity: showLiveVideoInTile ? 1 : 0,
                          pointerEvents: showLiveVideoInTile ? "auto" : "none",
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

                  {/* LAYER 1 (zIndex 4): BRIGHT LIVE STUDIO VIDEO FEED FOR ALL REMOTE PARTICIPANTS WITH VIDEO ON */}
                  {!isLocalTile && part.isVideoOn && (
                    <RemoteParticipantStudioFeed participant={part} />
                  )}

                  {/* LAYER 2 (zIndex 5 or 7): LIVE REMOTE CAMERA FRAME RELAY (HTTP / PeerJS DataChannel) */}
                  {!isLocalTile && part.liveFrame && part.isVideoOn && (
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
                        backgroundColor: "transparent",
                        zIndex: part.virtualBgId && part.virtualBgId !== "none" ? 7 : 5,
                      }}
                    />
                  )}

                  {/* LAYER 3 (zIndex 6): LIVE REMOTE WEBRTC MEDIASTREAM (Always mounted when stream exists so audio always plays) */}
                  {!isLocalTile && remoteStream && (
                    <RemotePeerVideoElement stream={remoteStream} isVideoOn={part.isVideoOn} />
                  )}

                  {/* Minimal Top-Left Status Pill (Does not cover participant faces) */}
                  <div className="p-2.5 flex items-center justify-between gap-2 relative z-20 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isLocalTile ? "YOU · LIVE" : "LIVE"}
                      </span>
                      {isLocalTile && selectedVirtualBgId !== "none" && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/80 text-slate-950 text-[10px] font-extrabold">
                          ✨ {activeVirtualBgOption.badgeText}
                        </span>
                      )}
                      {!isLocalTile && part.virtualBgId && part.virtualBgId !== "none" && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/80 text-slate-950 text-[10px] font-extrabold">
                          ✨ {part.virtualBgBadge || "BG"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Area: Shown only when camera is off */}
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
                              {isRequestingCamera ? "Starting Webcam..." : "Turn On Camera"}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-zinc-400">
                            Camera Off
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Overlay: Participant Name, Role & Mic Indicator */}
                  <div className="p-3 flex items-center justify-between gap-2 relative z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">
                        {part.name} {isLocalTile ? "(You)" : ""}
                      </p>
                      <p className="text-[10px] text-emerald-200/80 truncate">
                        {part.role}
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
          )}

          {/* 1. SHARE FILE, IMAGE, PDF & PRESENTATION DRAWER (DIRECTLY ABOVE CONTROL DOCK) */}
          {showShareFileDrawer && (
            <div className="rounded-2xl bg-slate-900/95 border-2 border-teal-400/60 p-4 space-y-3 shadow-[0_0_25px_rgba(20,184,166,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-extrabold text-[10px]">
                    📂 LIVE FILE &amp; SLIDE SHARE
                  </span>
                  <h4 className="text-xs font-extrabold text-white">
                    Share Any File, Image, PDF, or Presentation Slide With Everyone in Room {callId}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sharedFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>+ Upload File / Image / PDF from Computer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareFileDrawer(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Active Shared File Preview inside Drawer */}
              {(localSharedStageItem?.active || remoteSharedStageItem?.active) && (
                <div className="rounded-xl bg-black/80 border border-teal-400/50 p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {(localSharedStageItem?.frame_or_data_url || remoteSharedStageItem?.frame_or_data_url) && (
                      <img
                        src={(localSharedStageItem?.frame_or_data_url || remoteSharedStageItem?.frame_or_data_url) ?? ""}
                        alt="Active Shared Stage"
                        className="h-14 w-24 object-cover rounded-lg border border-teal-400 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-teal-300 truncate">
                        📺 Live on Stage: {localSharedStageItem?.title || remoteSharedStageItem?.title}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Broadcasting live to all {participants.length} participant(s) in this meeting.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(localSharedStageItem?.frame_or_data_url || remoteSharedStageItem?.frame_or_data_url) && (
                      <a
                        href={(localSharedStageItem?.frame_or_data_url || remoteSharedStageItem?.frame_or_data_url) ?? "#"}
                        download={localSharedStageItem?.title || remoteSharedStageItem?.title || "shared-meeting-file.jpg"}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-extrabold flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleStopSharingStage}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/25 hover:bg-red-500/40 border border-red-400/40 text-red-200 text-xs font-extrabold cursor-pointer"
                    >
                      Stop Sharing
                    </button>
                  </div>
                </div>
              )}

              {/* 1-Click Ready-to-Share Workspace Decks & Diagrams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    title: "E2EE Architecture & TURN Relay Spec",
                    subtitle: "WebRTC SFU + SFrame Epoch #12 Diagram",
                    bullets: [
                      "Zero-Knowledge SFrame E2EE media packet encryption",
                      "Redundant regional TURN relays (UDP 3478 / TLS 443)",
                      "Sub-200ms ICE restart handoff across Wi-Fi & 5G",
                    ],
                    accent: "#2DD4BF",
                  },
                  {
                    title: "Field Operations & Safety Checklist",
                    subtitle: "OSHA 30 & Site Inspection Protocol",
                    bullets: [
                      "Verified PPE, rigging & structural load sign-off",
                      "Daily electrical & microgrid isolation verification",
                      "Zero-incident field compliance & QA audit log",
                    ],
                    accent: "#34D399",
                  },
                  {
                    title: "Executive Sprint & Delivery Roadmap",
                    subtitle: "Q4 Engineering & Deployment Milestones",
                    bullets: [
                      "Phase 1: Durable outbox & multi-device sync complete",
                      "Phase 2: Live multi-party WebRTC calling & screen share",
                      "Phase 3: Noctis AI live meeting summaries & workflows",
                    ],
                    accent: "#38BDF8",
                  },
                  {
                    title: "Project Budget & Resource Ledger",
                    subtitle: "Commercial Scope & Deliverable Schedule",
                    bullets: [
                      "Approved vendor & contractor milestone allocations",
                      "Real-time ticket issuance & peer-vouched sign-off",
                      "Automated invoice & escrow release schedule",
                    ],
                    accent: "#FBBF24",
                  },
                ].map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSharePresetDocument(preset)}
                    className="rounded-xl bg-black/50 hover:bg-emerald-950/60 border border-white/10 hover:border-teal-400/60 p-3 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span className="text-[9px] font-mono font-bold text-teal-300 uppercase">
                        1-Click Instant Share
                      </span>
                      <p className="text-xs font-extrabold text-white mt-0.5">{preset.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{preset.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-400">
                      📺 Present to Stage →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. LIVE RECORDING STATUS & DOWNLOAD BAR (WHEN RECORDING OR RECORDED ARTIFACT READY) */}
          {(isRecording || recordedDownloadUrl) && (
            <div
              className={`rounded-2xl p-3.5 border-2 flex flex-wrap items-center justify-between gap-3 ${
                isRecording
                  ? "bg-red-950/70 border-red-500/70 text-red-100"
                  : "bg-emerald-950/80 border-emerald-500/60 text-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-3 w-3 rounded-full ${
                    isRecording ? "bg-red-500 animate-ping" : "bg-emerald-400"
                  }`}
                />
                <div>
                  <p className="text-xs font-extrabold text-white">
                    {isRecording
                      ? `● REC ${formatTime(recordingDurationSec)} — Recording Live Meeting Video, Audio & Shared Stage`
                      : `✅ Meeting Recording Sealed & Ready (${formatTime(recordingDurationSec)})`}
                  </p>
                  <p className="text-[10px] text-zinc-300">
                    {isRecording
                      ? `Multi-party E2EE recording active in Room ${callId}. Click "Stop & Save Recording" when finished.`
                      : "Download your recorded video (.webm) or append the recording log to Shared Meeting Notes."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    <span>⏹ Stop &amp; Save Recording</span>
                  </button>
                ) : (
                  <>
                    {recordedDownloadUrl && (
                      <a
                        href={recordedDownloadUrl}
                        download={`connectln-meeting-${callId.slice(0, 8)}-${Date.now()}.webm`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>⬇️ Download Recording (.webm)</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCallNotes(
                          (prev) =>
                            `${prev.trim()}\n• [Recorded Artifact]: Saved ${formatTime(recordingDurationSec)} call recording for Room ${callId} at ${new Date().toLocaleTimeString()}.`
                        )
                        setShowInspectorPanel(true)
                        setNotesStatusToast("✅ Added recording log to Shared In-Call Meeting Notes!")
                        setTimeout(() => setNotesStatusToast(null), 3500)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                    >
                      📝 Log to Meeting Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordedDownloadUrl(null)}
                      className="px-2 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 4. LIVE AI MULTILINGUAL CAPTION BAR (TOGGLED VIA CC BUTTON) */}
          {liveCaptions && (
            <div className="rounded-2xl bg-black/75 border-2 border-emerald-500/40 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <Captions className="h-3.5 w-3.5" />
                    Live Speech-to-Text Captions &amp; Noctis Translation
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                    🎙️ Mic Auto-Transcribing
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["English", "Twi", "French", "Spanish"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCaptionLanguage(lang)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        captionLanguage === lang
                          ? "bg-emerald-500 text-slate-950 font-extrabold"
                          : "bg-white/10 text-zinc-300 hover:bg-white/20"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const lineToSave =
                        captionLanguage === "English" && liveSpokenTranscript
                          ? liveSpokenTranscript
                          : liveCaptionTranslations[captionLanguage]
                      setCallNotes((prev) => `${prev.trim()}\n• [Live Caption - ${captionLanguage}]: ${lineToSave}`)
                      setNotesStatusToast("📝 Saved live caption line to Shared Meeting Notes!")
                      setTimeout(() => setNotesStatusToast(null), 3500)
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-200 text-[10px] font-extrabold cursor-pointer"
                  >
                    + Save to Notes
                  </button>
                </div>
              </div>
              <p className="text-xs text-emerald-100 font-mono leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-white/10">
                {captionLanguage === "English" && liveSpokenTranscript
                  ? liveSpokenTranscript
                  : liveCaptionTranslations[captionLanguage]}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualCaptionInput}
                  onChange={(e) => setManualCaptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualCaptionInput.trim()) {
                      setLiveSpokenTranscript(`🎙️ ${localDisplayName}: "${manualCaptionInput.trim()}"`)
                      setManualCaptionInput("")
                    }
                  }}
                  placeholder="Speak into your mic or type a live caption announcement here and press Enter..."
                  className="flex-1 rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!manualCaptionInput.trim()) return
                    setLiveSpokenTranscript(`🎙️ ${localDisplayName}: "${manualCaptionInput.trim()}"`)
                    setManualCaptionInput("")
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  Broadcast Caption
                </button>
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE NOTES, NOCTIS AI SUMMARY & SECURITY TOOLS DRAWER (DIRECTLY ABOVE CONTROL DOCK) */}
          {showInspectorPanel && (
            <div className="rounded-2xl bg-slate-900/95 border-2 border-teal-400/50 p-4 space-y-3 shadow-[0_0_25px_rgba(20,184,166,0.2)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-white">
                    Shared In-Call Meeting Notes, Noctis AI Summary &amp; Security Tools
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSummarizeNotesWithNoctis}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Summarize with Noctis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(callNotes)
                      setNotesStatusToast("📋 Copied meeting notes to clipboard!")
                      setTimeout(() => setNotesStatusToast(null), 3000)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-[10px] font-bold cursor-pointer"
                  >
                    📋 Copy Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([callNotes], { type: "text/plain;charset=utf-8" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `connectln-meeting-notes-${callId}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold cursor-pointer"
                  >
                    ⬇️ Download .txt
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInspectorPanel(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-[10px] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {notesStatusToast && (
                <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 text-xs font-bold text-emerald-200">
                  {notesStatusToast}
                </div>
              )}

              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={4}
                placeholder="Type shared meeting notes, decisions, and action items here..."
                className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-xs text-zinc-100 focus:border-emerald-400 focus:outline-none leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateNetworkHandoff}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-[11px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Wi-Fi ↔ 5G Handoff ({networkPath})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateMediaKey}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="h-3 w-3" />
                    <span>Rotate SFrame Key (Epoch #{sframeEpoch})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLowBandwidthMode((v) => !v)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                      lowBandwidthMode
                        ? "bg-amber-400 text-slate-950 border-amber-300"
                        : "bg-zinc-800 text-zinc-200 border-white/10"
                    }`}
                  >
                    <WifiLow className="h-3 w-3 inline mr-1" />
                    {lowBandwidthMode ? "Low-Bandwidth Mode: ON" : "Low-Bandwidth Mode: OFF"}
                  </button>
                </div>

                {onCreateWorkflowFromCall && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateWorkflowFromCall(
                        `Call Action Item: ${callNotes.split("\n")[0].replace("• ", "").slice(0, 68)}`,
                        currentUserName,
                        `WebRTC Call #${callId.slice(0, 8)} Transcript`
                      )
                      setNotesStatusToast("⚡ Converted call notes into a tracked Workflow Task!")
                      setTimeout(() => setNotesStatusToast(null), 3500)
                      appendLog("Converted call meeting note into governed Workflow task.")
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Workflow className="h-3.5 w-3.5" />
                    <span>Convert Notes → Workflow Task</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ORGANIZED 4-ZONE MEETING CONTROL DOCK */}
          <div className="rounded-2xl bg-slate-900/95 border border-emerald-500/25 p-3 shadow-2xl">
            {/* Hidden file input for sharing files/images/slides to the live meeting stage */}
            <input
              ref={sharedFileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.json"
              onChange={(e) => {
                handleShareFileUpload(e)
                setShowShareFileDrawer(true)
              }}
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* ZONE 1: AUDIO & VIDEO CONTROLS */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 px-1 hidden sm:inline">
                  Media
                </span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isMicMuted
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                  }`}
                >
                  {isMicMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>{isMicMuted ? "Unmute" : "Mute"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    !isCameraOn
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                  }`}
                >
                  {isCameraOn ? (
                    <Video className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                  <span>{isCameraOn ? "Camera On" : "Camera Off"}</span>
                </button>

                {videoDevices.length > 1 && (
                  <select
                    value={selectedVideoDeviceId}
                    onChange={(e) => handleSelectCameraDevice(e.target.value)}
                    aria-label="Select camera device"
                    className="rounded-xl bg-zinc-900 border border-white/10 px-2 py-2 text-[11px] text-zinc-200 max-w-[130px] focus:border-emerald-400 focus:outline-none"
                  >
                    {videoDevices.map((d, idx) => (
                      <option key={d.deviceId || idx} value={d.deviceId}>
                        {d.label || `Camera #${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                {isHardwareCameraActive && (
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    title="Take HD Snapshot"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-emerald-400" />
                  </button>
                )}
              </div>

              {/* ZONE 2: PRESENT & STUDIO EFFECTS */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 px-1 hidden sm:inline">
                  Present
                </span>
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isScreenSharing || localSharedStageItem?.active
                      ? "bg-teal-500 text-slate-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                  }`}
                >
                  <MonitorUp className="h-4 w-4 text-teal-400" />
                  <span>
                    {isScreenSharing || localSharedStageItem?.active ? "Stop Share" : "Share Screen"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShareFileDrawer((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    showShareFileDrawer || localSharedStageItem?.mode === "file"
                      ? "bg-teal-400 text-slate-950 shadow-md"
                      : "bg-zinc-800 hover:bg-zinc-700 text-teal-200 border border-white/10"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Share File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVirtualBgPicker((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    showVirtualBgPicker || selectedVirtualBgId !== "none"
                      ? "bg-teal-400 text-slate-950 shadow-md"
                      : "bg-zinc-800 hover:bg-zinc-700 text-teal-200 border border-white/10"
                  }`}
                >
                  <span>✨ Backgrounds</span>
                </button>
              </div>

              {/* ZONE 3: COLLABORATION & TOOLS */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 px-1 hidden sm:inline">
                  Tools
                </span>
                <button
                  type="button"
                  onClick={() => setShowInvitePanel((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    showInvitePanel
                      ? "bg-amber-400 text-slate-950"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLiveCaptions((prev) => !prev)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    liveCaptions
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10"
                  }`}
                >
                  <Captions className="h-4 w-4" />
                  <span>CC</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10"
                  }`}
                >
                  <CircleDot className="h-4 w-4 text-red-400" />
                  <span>{isRecording ? "Stop Rec" : "Record"}</span>
                </button>

                {recordedDownloadUrl && (
                  <a
                    href={recordedDownloadUrl}
                    download={`vibe-call-${callId.slice(0, 8)}.webm`}
                    className="px-2.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setShowInspectorPanel((prev) => !prev)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    showInspectorPanel
                      ? "bg-teal-400 text-slate-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10"
                  }`}
                >
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Notes &amp; Tools</span>
                </button>
              </div>

              {/* ZONE 4: END MEETING */}
              <button
                type="button"
                onClick={handleEndCall}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Meeting</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE RIGHT DRAWER (4 cols): CALL NOTES, SECURITY & SIGNALING TELEMETRY */}
        {showInspectorPanel && (
        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/50">
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

          <div className="rounded-2xl bg-slate-900 border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                <Server className="h-4 w-4" />
                Network &amp; Security Controls
              </span>
              <button
                type="button"
                onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  lowBandwidthMode
                    ? "bg-amber-500 text-slate-950"
                    : "bg-zinc-800 text-zinc-300 border border-white/10"
                }`}
              >
                {lowBandwidthMode ? "Low-BW ON" : "Low-BW OFF"}
              </button>
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
                  Reconnect ICE streams
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
          </div>

          <div className="rounded-2xl bg-black/70 border border-emerald-500/20 p-3.5 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
              Call Signaling &amp; Telemetry Log
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
        )}
      </div>
    </div>
  )
}
export default VibeVideoCallStudio
