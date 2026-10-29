'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    getEnclaveB2BThreads,
    getThreadQuickReplies,
    B2BConversationThread,
    B2BMessageItem,
} from '@/lib/b2b-messaging-data';
import { PROFESSION_ENCLAVES } from '@/lib/connectin-professions';
import { ScheduleMeetingModal, MeetingInvitee } from './ScheduleMeetingModal';
import { MessageActionBar, ReactionBadges } from './MessageActionBar';
import { resolveUserProfilePicture } from '@/lib/connectin-storage';
import {
    getLocalBilateralThreadsForViewer,
    mergeBilateralAndServerThreads,
    recordLocalBilateralDirectMessage,
    markLocalBilateralConversationRead,
    doesDmParticipantMatch,
} from '@/lib/direct-mailbox-sync';

type ChannelFilterType = 'All' | 'People' | 'Companies' | 'Products' | 'Communities';

const PRESET_ATTACHMENTS = [
    { label: '📐 Site_Blueprint_Rev4.pdf', name: 'Site_Blueprint_Rev4.pdf (2.4 MB)' },
    { label: '📄 Verified_ConnectIn_Resume.pdf', name: 'Verified_ConnectIn_Resume.pdf (480 KB)' },
    { label: '📋 Commercial_BOM_Quote_Sheet.xlsx', name: 'Commercial_BOM_Quote_Sheet.xlsx (1.1 MB)' },
    { label: '🛡️ Safety_Compliance_Credential.pdf', name: 'Safety_Compliance_Credential.pdf (620 KB)' },
];

const QUICK_EMOJIS = ['👍', '🤝', '🔥', '✅', '🙌', '🚀', '📐', '⚡'];

export function MessagingView({
    onNavigateVibeComms,
    onNavigateMarketplace,
    onNavigateJobs,
    currentUser,
    onPostToFeed,
}: {
    onNavigateVibeComms?: () => void;
    onNavigateMarketplace?: () => void;
    onNavigateJobs?: () => void;
    currentUser?: any;
    /** Publishes a chat message to the member's Feed; repostOf is the original sender when reposting. */
    onPostToFeed?: (content: string, repostOf?: string) => void;
}) {
    const activeEnclave = currentUser?.professionEnclave || 'trades_construction';
    const [selectedEnclave, setSelectedEnclave] = useState<string>(activeEnclave);
    const [showScheduler, setShowScheduler] = useState(false);
    const [threads, setThreads] = useState<B2BConversationThread[]>(() =>
        getEnclaveB2BThreads(activeEnclave)
    );
    const [activeChannel, setActiveChannel] = useState<ChannelFilterType>('All');
    const [selectedThreadId, setSelectedThreadId] = useState<string>(
        () => getEnclaveB2BThreads(activeEnclave)[0]?.id || ''
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingEntity, setTypingEntity] = useState<string | null>(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(false);

    // Modals & Interactive States
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newRecipientName, setNewRecipientName] = useState('');
    const [newRecipientRole, setNewRecipientRole] = useState('');
    const [newRecipientChannel, setNewRecipientChannel] = useState<
        'People' | 'Companies' | 'Products' | 'Communities'
    >('People');
    const [newInitialMessage, setNewInitialMessage] = useState('');

    const [activeCallMode, setActiveCallMode] = useState<'audio' | 'video' | null>(null);
    const [callSeconds, setCallSeconds] = useState(0);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [hasLocalStream, setHasLocalStream] = useState(false);
    const [isUsingFallbackCam, setIsUsingFallbackCam] = useState(false);
    const [cameraStatusText, setCameraStatusText] = useState<string>('Live HD Camera Active');
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('');
    const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const fallbackCanvasAnimRef = useRef<number | null>(null);
    const [toastBanner, setToastBanner] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const triggerToast = (msg: string) => {
        setToastBanner(msg);
        setTimeout(() => {
            setToastBanner((prev) => (prev === msg ? null : prev));
        }, 4000);
    };

    const stopCurrentCallMedia = () => {
        if (fallbackCanvasAnimRef.current) {
            cancelAnimationFrame(fallbackCanvasAnimRef.current);
            fallbackCanvasAnimRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
        }
        setLocalStreamState(null);
    };

    // Create a live 30fps self-view canvas MediaStream if physical webcam is busy/unavailable so user ALWAYS sees themselves
    const createLiveSelfPreviewStream = (): MediaStream | null => {
        if (typeof document === 'undefined') return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            if (!ctx || typeof canvas.captureStream !== 'function') return null;

            const userName = currentUser?.name || 'Verified Professional';
            const userHeadline = currentUser?.headline || 'ConnectLn Live Video Studio';
            const initials = userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

            const avatarImg = new Image();
            avatarImg.crossOrigin = 'anonymous';
            let avatarLoaded = false;
            if (currentUser?.avatar) {
                avatarImg.onload = () => {
                    avatarLoaded = true;
                };
                avatarImg.src = currentUser.avatar;
            }

            let tick = 0;
            const drawFrame = () => {
                tick += 1;
                const w = canvas.width;
                const h = canvas.height;
                const grad = ctx.createLinearGradient(0, 0, w, h);
                grad.addColorStop(0, '#071A12');
                grad.addColorStop(0.5, '#0F172A');
                grad.addColorStop(1, '#0A2540');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Subtle pulsing studio ring around user self-view
                const pulse = 58 + Math.sin(tick * 0.08) * 6;
                ctx.beginPath();
                ctx.arc(w / 2, h / 2 - 18, pulse + 10, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(w / 2, h / 2 - 18, 54, 0, Math.PI * 2);
                ctx.fillStyle = '#0A66C2';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#34D399';
                ctx.stroke();

                if (avatarLoaded) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(w / 2, h / 2 - 18, 52, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(avatarImg, w / 2 - 52, h / 2 - 70, 104, 104);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 32px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(initials, w / 2, h / 2 - 18);
                }

                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${userName} (You — Live Self-View)`, w / 2, h / 2 + 64);

                ctx.fillStyle = '#6EE7B7';
                ctx.font = '13px monospace';
                ctx.fillText(userHeadline.slice(0, 48), w / 2, h / 2 + 88);

                fallbackCanvasAnimRef.current = requestAnimationFrame(drawFrame);
            };
            drawFrame();
            return canvas.captureStream(24);
        } catch {
            return null;
        }
    };

    const bindStreamToLocalVideo = (el: HTMLVideoElement | null, stream: MediaStream | null) => {
        if (!el || !stream) return;
        if (el.srcObject !== stream) {
            el.srcObject = stream;
        }
        el.muted = true;
        el.playsInline = true;
        el.play().catch(() => {});
    };

    const setLocalVideoCallbackRef = (node: HTMLVideoElement | null) => {
        localVideoRef.current = node;
        if (node && localStreamRef.current) {
            bindStreamToLocalVideo(node, localStreamRef.current);
        }
    };

    useEffect(() => {
        if (localVideoRef.current && localStreamState) {
            bindStreamToLocalVideo(localVideoRef.current, localStreamState);
        }
    }, [localStreamState, isCameraOn, isScreenSharing, activeCallMode]);

    const startCallMedia = async (mode: 'audio' | 'video', preferredCamId?: string) => {
        stopCurrentCallMedia();
        setIsScreenSharing(false);
        setIsMicMuted(false);
        setIsCameraOn(mode === 'video');

        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            const fallback = createLiveSelfPreviewStream();
            if (fallback) {
                localStreamRef.current = fallback;
                setLocalStreamState(fallback);
                setHasLocalStream(true);
                setIsUsingFallbackCam(true);
                setCameraStatusText('Live Studio Self-View Active');
                bindStreamToLocalVideo(localVideoRef.current, fallback);
            }
            return;
        }

        let stream: MediaStream | null = null;

        if (mode === 'video') {
            setCameraStatusText('Starting your webcam...');
            // Attempt 1: Video + Audio
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: preferredCamId
                        ? { deviceId: { exact: preferredCamId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                        : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: true,
                });
            } catch {
                // Attempt 2: Video-only (in case microphone is missing or locked)
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: preferredCamId ? { deviceId: { exact: preferredCamId } } : true,
                        audio: false,
                    });
                } catch {
                    // Attempt 3: Try any other available videoinput device on the computer
                    try {
                        const allDevs = await navigator.mediaDevices.enumerateDevices();
                        const cams = allDevs.filter((d) => d.kind === 'videoinput' && d.deviceId);
                        for (const cam of cams) {
                            try {
                                stream = await navigator.mediaDevices.getUserMedia({
                                    video: { deviceId: { exact: cam.deviceId } },
                                    audio: false,
                                });
                                if (stream && stream.getVideoTracks().length > 0) break;
                            } catch {}
                        }
                    } catch {}
                }
            }

            if (stream && stream.getVideoTracks().length > 0) {
                localStreamRef.current = stream;
                setLocalStreamState(stream);
                setHasLocalStream(true);
                setIsUsingFallbackCam(false);
                const label = stream.getVideoTracks()[0]?.label || 'HD Webcam';
                setCameraStatusText(`🟢 ${label}`);
                bindStreamToLocalVideo(localVideoRef.current, stream);

                try {
                    const devs = await navigator.mediaDevices.enumerateDevices();
                    const cams = devs.filter((d) => d.kind === 'videoinput');
                    setVideoDevices(cams);
                    if (cams.length > 0 && !preferredCamId) {
                        setSelectedVideoDeviceId(
                            stream.getVideoTracks()[0]?.getSettings()?.deviceId || cams[0].deviceId
                        );
                    }
                } catch {}
                return;
            }

            // Fallback if physical webcam is locked by another app or blocked: show live self-preview stream so user ALWAYS sees themselves
            const fallbackStream = createLiveSelfPreviewStream();
            if (fallbackStream) {
                localStreamRef.current = fallbackStream;
                setLocalStreamState(fallbackStream);
                setHasLocalStream(true);
                setIsUsingFallbackCam(true);
                setCameraStatusText('Live Self-View Studio (Click Retry Webcam if camera was busy)');
                bindStreamToLocalVideo(localVideoRef.current, fallbackStream);
            }
        } else {
            // Audio call mode
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                localStreamRef.current = stream;
                setLocalStreamState(stream);
                setHasLocalStream(true);
                setIsUsingFallbackCam(false);
            } catch {
                setHasLocalStream(false);
            }
        }
    };

    const [remoteHuddleParticipants, setRemoteHuddleParticipants] = useState<
        Array<{
            user_id: string;
            display_name: string;
            role?: string;
            device_label?: string;
            is_muted?: boolean;
            is_video_on?: boolean;
            live_frame?: string | null;
        }>
    >([]);
    const verifiedRemoteFramesRef = useRef<Map<string, string>>(new Map());
    const isFirstHuddleHeartbeatRef = useRef<boolean>(true);
    const [huddleLocalPeerId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const existing = sessionStorage.getItem('vibe_call_participant_id');
            if (existing) return existing;
            const created = `peer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            sessionStorage.setItem('vibe_call_participant_id', created);
            return created;
        }
        return `peer-${Date.now().toString(36)}`;
    });
    const huddleCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const huddleVerifyCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastValidLocalHuddleFrameRef = useRef<string | null>(null);
    const inFlightHuddleSyncRef = useRef<boolean>(false);

    // Start/stop call timer & initial media when call modal opens or closes
    const isCallModalOpen = Boolean(activeCallMode);
    useEffect(() => {
        if (!isCallModalOpen || !activeCallMode) {
            setCallSeconds(0);
            setIsScreenSharing(false);
            setHasLocalStream(false);
            setIsUsingFallbackCam(false);
            setRemoteHuddleParticipants([]);
            verifiedRemoteFramesRef.current.clear();
            lastValidLocalHuddleFrameRef.current = null;
            stopCurrentCallMedia();
            return;
        }

        isFirstHuddleHeartbeatRef.current = true;
        startCallMedia(activeCallMode);

        const timer = setInterval(() => {
            setCallSeconds((s) => s + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            stopCurrentCallMedia();
        };
    }, [isCallModalOpen]);

    const formatCallTime = (secs: number) => {
        const mins = Math.floor(secs / 60).toString().padStart(2, '0');
        const rem = (secs % 60).toString().padStart(2, '0');
        return `${mins}:${rem}`;
    };

    const handleToggleMic = () => {
        setIsMicMuted((prev) => {
            const next = !prev;
            if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach((t) => {
                    t.enabled = !next;
                });
            }
            return next;
        });
    };

    const handleToggleCamera = async () => {
        if (!isCameraOn || activeCallMode !== 'video') {
            setActiveCallMode('video');
            setIsCameraOn(true);
            await startCallMedia('video', selectedVideoDeviceId || undefined);
        } else {
            setIsCameraOn(false);
            if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach((t) => {
                    t.enabled = false;
                });
            }
        }
    };

    const handleToggleScreenShare = async () => {
        if (isScreenSharing) {
            setIsScreenSharing(false);
            await startCallMedia('video', selectedVideoDeviceId || undefined);
            return;
        }
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setIsScreenSharing(true);
                setActiveCallMode('video');
                setHasLocalStream(true);
                setIsUsingFallbackCam(false);
                localStreamRef.current = screenStream;
                setLocalStreamState(screenStream);
                bindStreamToLocalVideo(localVideoRef.current, screenStream);
                screenStream.getVideoTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    startCallMedia('video', selectedVideoDeviceId || undefined);
                };
            } catch {
                triggerToast('Screen sharing cancelled or unavailable.');
            }
        }
    };

    const handleEndCallAndLog = () => {
        const modeLabel = activeCallMode === 'video' ? '🎥 Video Huddle' : '📞 Voice Call';
        const durationStr = formatCallTime(Math.max(1, callSeconds));
        const endingThreadId = activeThread?.id;
        setActiveCallMode(null);
        setRemoteHuddleParticipants([]);
        verifiedRemoteFramesRef.current.clear();
        stopCurrentCallMedia();
        if (endingThreadId) {
            fetch('/api/v1/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
                body: JSON.stringify({
                    action: 'end',
                    call_id: endingThreadId,
                    user_id: huddleLocalPeerId,
                }),
            }).catch(() => {});
        }
        if (activeThread) {
            sendChatText(`${modeLabel} completed with ${activeThread.title} (Duration: ${durationStr}) — E2EE verified session.`);
            triggerToast(`${modeLabel} ended (${durationStr}) and logged to thread.`);
        }
    };

    // Sync enclave when currentUser's enclave changes
    useEffect(() => {
        if (currentUser?.professionEnclave && currentUser.professionEnclave !== selectedEnclave) {
            setSelectedEnclave(currentUser.professionEnclave);
        }
    }, [currentUser?.professionEnclave]);

    // Load threads from backend API + local bilateral mailbox whenever selectedEnclave or currentUser changes
    useEffect(() => {
        let cancelled = false;
        const vName = currentUser?.name || '';
        const vEmail = currentUser?.email || '';

        // Immediately populate with local bilateral DMs + enclave threads for zero-latency switch
        const localBilateral = getLocalBilateralThreadsForViewer(vName, vEmail, selectedEnclave);
        const immediate = mergeBilateralAndServerThreads(
            localBilateral,
            getEnclaveB2BThreads(selectedEnclave)
        );
        setThreads(immediate);
        setSelectedThreadId((prev) =>
            immediate.some((t) => t.id === prev) ? prev : immediate[0]?.id || ''
        );

        const fetchLiveThreads = async (showSpinner = false) => {
            if (showSpinner) setIsLoadingThreads(true);
            try {
                const freshLocal = getLocalBilateralThreadsForViewer(vName, vEmail, selectedEnclave);
                const res = await fetch(
                    `/api/connectin/messages?enclave=${encodeURIComponent(selectedEnclave)}&viewerName=${encodeURIComponent(vName)}&viewerEmail=${encodeURIComponent(vEmail)}`,
                    { cache: 'no-store' }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && Array.isArray(data.threads) && data.threads.length > 0) {
                    const merged = mergeBilateralAndServerThreads(freshLocal, data.threads);
                    setThreads(merged);
                    setSelectedThreadId((prev) =>
                        merged.some((t: B2BConversationThread) => t.id === prev)
                            ? prev
                            : merged[0].id
                    );
                }
            } catch {
                // Keep immediate fallback threads
            } finally {
                if (!cancelled && showSpinner) setIsLoadingThreads(false);
            }
        };

        fetchLiveThreads(true);
        const pollId = setInterval(() => fetchLiveThreads(false), 4000);
        const handleSyncEvent = () => fetchLiveThreads(false);
        window.addEventListener('connectin_dm_updated', handleSyncEvent);
        window.addEventListener('storage', handleSyncEvent);
        // Background tabs throttle timers, so also refresh as soon as the tab/window becomes active again
        const handleVisible = () => {
            if (document.visibilityState === 'visible') fetchLiveThreads(false);
        };
        document.addEventListener('visibilitychange', handleVisible);
        window.addEventListener('focus', handleSyncEvent);

        return () => {
            cancelled = true;
            clearInterval(pollId);
            window.removeEventListener('connectin_dm_updated', handleSyncEvent);
            window.removeEventListener('storage', handleSyncEvent);
            document.removeEventListener('visibilitychange', handleVisible);
            window.removeEventListener('focus', handleSyncEvent);
        };
    }, [selectedEnclave, currentUser?.name, currentUser?.email]);

    // Filter threads based on activeChannel & searchQuery
    const filteredThreads = threads.filter((t) => {
        const matchesChannel = activeChannel === 'All' || t.channelType === activeChannel;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.lastMessage.toLowerCase().includes(q) ||
            t.subtitle.toLowerCase().includes(q) ||
            (t.companyMetadata?.industry || '').toLowerCase().includes(q) ||
            (t.productMetadata?.productName || '').toLowerCase().includes(q);
        return matchesChannel && matchesSearch;
    });

    const activeThread =
        threads.find((t) => t.id === selectedThreadId) ||
        filteredThreads[0] ||
        threads[0];

    // Sync live video frames with /api/v1/calls when Messaging Video Huddle is active
    useEffect(() => {
        if (!isCallModalOpen || !activeThread) return;
        let mounted = true;

        const isCanvasBright = (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
            try {
                const data = ctx.getImageData(0, 0, w, h).data;
                let sum = 0;
                let litCount = 0;
                let total = 0;
                const step = Math.max(4, Math.floor(data.length / (4 * 64)) * 4);
                for (let i = 0; i < data.length; i += step) {
                    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    sum += lum;
                    if (lum > 20) litCount += 1;
                    total += 1;
                }
                return total > 0 && sum / total > 18 && litCount / total > 0.2;
            } catch {
                return true;
            }
        };

        const syncHuddleFrame = async () => {
            if (inFlightHuddleSyncRef.current) return;

            const vEl = localVideoRef.current;
            // Watchdog: ensure local self-view <video> never stays paused
            if (vEl && vEl.paused && localStreamRef.current) {
                vEl.play().catch(() => {});
            }

            let localFrame: string | null = lastValidLocalHuddleFrameRef.current;
            if (vEl && vEl.readyState >= 2 && vEl.videoWidth > 0 && isCameraOn) {
                try {
                    if (!huddleCaptureCanvasRef.current) {
                        const c = document.createElement('canvas');
                        c.width = 240;
                        c.height = 160;
                        huddleCaptureCanvasRef.current = c;
                    }
                    const c = huddleCaptureCanvasRef.current;
                    const ctx = c.getContext('2d', { willReadFrequently: true });
                    if (ctx) {
                        ctx.drawImage(vEl, 0, 0, c.width, c.height);
                        if (isCanvasBright(ctx, c.width, c.height)) {
                            const encoded = c.toDataURL('image/jpeg', 0.58);
                            if (encoded && encoded.length > 3200) {
                                localFrame = encoded;
                                lastValidLocalHuddleFrameRef.current = encoded;
                            }
                        }
                    }
                } catch {}
            }

            inFlightHuddleSyncRef.current = true;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const isFirst = isFirstHuddleHeartbeatRef.current;
            isFirstHuddleHeartbeatRef.current = false;

            try {
                const res = await fetch('/api/v1/calls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        action: 'heartbeat',
                        reopen: isFirst,
                        call_id: activeThread.id,
                        user_id: huddleLocalPeerId,
                        conversation_id: activeThread.id,
                        call_type: activeCallMode || 'video',
                        display_name: currentUser?.name || 'You',
                        is_muted: isMicMuted,
                        is_video_on: isCameraOn,
                        live_frame: localFrame,
                    }),
                });
                const data = await res.json();
                if (!mounted) return;

                // If another participant ended the meeting, immediately close & clear so nobody stays frozen!
                if (data?.call?.state === 'ENDED' || data?.event_type === 'call.ended') {
                    verifiedRemoteFramesRef.current.clear();
                    setRemoteHuddleParticipants([]);
                    stopCurrentCallMedia();
                    setActiveCallMode(null);
                    triggerToast('Meeting ended by participant.');
                    return;
                }

                if (!Array.isArray(data?.call?.participants)) return;

                const nowMs = Date.now();
                const activeRemotes = data.call.participants.filter(
                    (p: any) =>
                        p.user_id &&
                        p.user_id !== huddleLocalPeerId &&
                        (!p.last_seen_ms || nowMs - p.last_seen_ms < 7500)
                );

                // Prune any cached frame for a participant who has left
                const activeIds = new Set(activeRemotes.map((p: any) => p.user_id));
                for (const key of Array.from(verifiedRemoteFramesRef.current.keys())) {
                    if (!activeIds.has(key)) {
                        verifiedRemoteFramesRef.current.delete(key);
                    }
                }

                // Verify new frames asynchronously and update state immediately with all active remote peers
                for (const peer of activeRemotes) {
                    if (
                        typeof peer.live_frame === 'string' &&
                        peer.live_frame.length > 3200 &&
                        verifiedRemoteFramesRef.current.get(peer.user_id) !== peer.live_frame
                    ) {
                        const candidateUrl: string = peer.live_frame;
                        const peerId: string = peer.user_id;
                        // Set immediately if we had no frame yet so there's zero delay when a 2nd/3rd person joins
                        if (!verifiedRemoteFramesRef.current.has(peerId)) {
                            verifiedRemoteFramesRef.current.set(peerId, candidateUrl);
                        }
                        const img = new Image();
                        img.onload = () => {
                            if (!mounted) return;
                            try {
                                if (!huddleVerifyCanvasRef.current) {
                                    const vc = document.createElement('canvas');
                                    vc.width = 16;
                                    vc.height = 16;
                                    huddleVerifyCanvasRef.current = vc;
                                }
                                const vc = huddleVerifyCanvasRef.current;
                                const vctx = vc.getContext('2d', { willReadFrequently: true });
                                if (vctx) {
                                    vctx.drawImage(img, 0, 0, 16, 16);
                                    if (isCanvasBright(vctx, 16, 16)) {
                                        verifiedRemoteFramesRef.current.set(peerId, candidateUrl);
                                    }
                                }
                            } catch {
                                verifiedRemoteFramesRef.current.set(peerId, candidateUrl);
                            }
                        };
                        img.src = candidateUrl;
                    }
                }

                setRemoteHuddleParticipants(
                    activeRemotes.map((p: any) => ({
                        user_id: p.user_id,
                        display_name: p.display_name || 'Connected Participant',
                        role: p.role,
                        device_label: p.device_label,
                        is_muted: p.is_muted,
                        is_video_on: p.is_video_on,
                        live_frame: verifiedRemoteFramesRef.current.get(p.user_id) || null,
                    }))
                );
            } catch {
                // ignore network timeout
            } finally {
                clearTimeout(timeoutId);
                inFlightHuddleSyncRef.current = false;
            }
        };

        const handleUnloadLeave = () => {
            try {
                fetch('/api/v1/calls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true,
                    body: JSON.stringify({
                        action: 'leave',
                        call_id: activeThread.id,
                        user_id: huddleLocalPeerId,
                    }),
                }).catch(() => {});
            } catch {}
        };
        window.addEventListener('beforeunload', handleUnloadLeave);

        syncHuddleFrame();
        const hb = setInterval(syncHuddleFrame, 1600);
        return () => {
            mounted = false;
            clearInterval(hb);
            window.removeEventListener('beforeunload', handleUnloadLeave);
        };
    }, [isCallModalOpen, activeThread?.id, activeCallMode, isCameraOn, isMicMuted, currentUser?.name, huddleLocalPeerId]);

    const quickReplies = activeThread
        ? getThreadQuickReplies(
              activeThread,
              selectedEnclave === 'all' ? activeEnclave : selectedEnclave
          )
        : [];

    const handleSelectThread = (thread: B2BConversationThread) => {
        setSelectedThreadId(thread.id);
        if (currentUser?.name) {
            markLocalBilateralConversationRead(thread.title, currentUser.name);
        }
        if (thread.unreadCount > 0) {
            setThreads((prev) =>
                prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
            );
            fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'mark_read',
                    enclave: selectedEnclave,
                    threadId: thread.id,
                    viewerName: currentUser?.name || '',
                }),
            }).catch(() => {});
        }
    };

    const sendChatText = async (rawText: string) => {
        const trimmed = rawText.trim();
        if ((!trimmed && !pendingAttachment) || !activeThread || isSending) return;

        const senderName = currentUser?.name || 'You';
        const senderEmail = currentUser?.email || '';
        const senderAvatar =
            currentUser?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
        const nowStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const finalText = trimmed || `Attached ${pendingAttachment}`;

        const optimisticMsg: B2BMessageItem = {
            id: `local-${Date.now()}`,
            sender: {
                id: 'me',
                name: senderName,
                avatar: senderAvatar,
                role: senderRole,
            },
            text: finalText,
            timestamp: nowStr,
            createdAtIso: new Date().toISOString(),
            attachments: pendingAttachment
                ? [{ name: pendingAttachment, type: 'Document' }]
                : undefined,
        };

        const targetThreadId = activeThread.id;
        const targetEntityName = activeThread.title;

        // If People DM, persist immediately in bilateral local mailbox so recipient receives it in 0ms
        if (activeThread.channelType === 'People' || targetThreadId.startsWith('dm_pair__')) {
            recordLocalBilateralDirectMessage({
                senderName,
                senderEmail,
                senderAvatar,
                senderRole,
                recipientName: activeThread.title,
                recipientAvatar: activeThread.avatar,
                recipientSubtitle: activeThread.subtitle,
                text: finalText,
                attachment: pendingAttachment || undefined,
            });
        }

        // Optimistically append message
        setThreads((prev) =>
            prev.map((t) => {
                if (t.id !== targetThreadId) return t;
                return {
                    ...t,
                    unreadCount: 0,
                    lastMessage: finalText,
                    lastMessageTime: 'Just now',
                    messages: [...t.messages, optimisticMsg],
                };
            })
        );

        const sentAttachment = pendingAttachment;
        setMessageInput('');
        setPendingAttachment(null);
        setShowAttachmentMenu(false);
        setShowEmojiBar(false);
        setIsSending(true);
        setTypingEntity(targetEntityName);

        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send_message',
                    enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                    threadId: targetThreadId,
                    text: finalText,
                    attachment: sentAttachment || undefined,
                    senderName,
                    senderEmail,
                    senderAvatar,
                    senderRole,
                    recipientName: activeThread.title,
                    recipientSubtitle: activeThread.subtitle,
                    recipientAvatar: activeThread.avatar,
                    channelType: activeThread.channelType,
                }),
            });

            const data = await res.json();

            setTimeout(() => {
                setTypingEntity(null);
                if (data?.ok && data.autoReply) {
                    setThreads((prev) =>
                        prev.map((t) => {
                            if (t.id !== targetThreadId && t.id !== data.threadId) return t;
                            const exists = t.messages.some((m) => m.id === data.autoReply.id);
                            if (exists) return t;
                            return {
                                ...t,
                                lastMessage: data.autoReply.text,
                                lastMessageTime: 'Just now',
                                messages: [...t.messages, data.autoReply],
                            };
                        })
                    );
                }
                setTimeout(() => {
                    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 80);
            }, 900);
        } catch {
            setTypingEntity(null);
        } finally {
            setIsSending(false);
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        }
    };

    // ---- Message actions: reactions, comments, share/forward, post/repost to Feed ----
    const updateMessage = (msgId: string, patch: (m: B2BMessageItem) => B2BMessageItem) => {
        setThreads((prev) =>
            prev.map((t) => ({ ...t, messages: t.messages.map((m) => (m.id === msgId ? patch(m) : m)) }))
        );
    };

    const messageActionBody = () => ({
        enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
        threadId: activeThread?.id,
        viewerName: currentUser?.name || '',
        senderName: currentUser?.name || '',
        senderEmail: currentUser?.email || '',
        senderAvatar: currentUser?.avatar || '',
    });

    const handleReactToMessage = async (msg: B2BMessageItem, kind: 'like' | 'up' | 'down') => {
        const me = (currentUser?.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        if (!me) return;
        // Optimistic update so the tap feels instant
        updateMessage(msg.id, (m) => {
            const reactions: Record<string, string[]> = { ...(m.reactions || {}) };
            const set = new Set(reactions[kind] || []);
            if (set.has(me)) set.delete(me);
            else {
                set.add(me);
                const opp = kind === 'up' ? 'down' : kind === 'down' ? 'up' : null;
                if (opp && reactions[opp]) reactions[opp] = reactions[opp].filter((k) => k !== me);
            }
            reactions[kind] = Array.from(set);
            return { ...m, reactions };
        });
        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'react_message', messageId: msg.id, reaction: kind, ...messageActionBody() }),
            });
            const data = await res.json();
            if (data?.ok) updateMessage(msg.id, (m) => ({ ...m, reactions: data.reactions || {} }));
        } catch {
            // keep the optimistic reaction on this screen
        }
    };

    const handleCommentOnMessage = async (msg: B2BMessageItem, text: string) => {
        const author = currentUser?.name || 'You';
        const local = {
            id: `cmt_local_${Date.now()}`,
            author,
            avatar: currentUser?.avatar && !String(currentUser.avatar).startsWith('data:') ? currentUser.avatar : '',
            text: text.slice(0, 200),
            createdAtIso: new Date().toISOString(),
        };
        updateMessage(msg.id, (m) => ({ ...m, comments: [...(m.comments || []), local].slice(-10) }));
        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'comment_message', messageId: msg.id, commentText: text, ...messageActionBody() }),
            });
            const data = await res.json();
            if (data?.ok) updateMessage(msg.id, (m) => ({ ...m, comments: data.comments || [] }));
        } catch {
            // keep the optimistic comment on this screen
        }
    };

    const handleForwardMessage = async (msg: B2BMessageItem, originalSender: string, target: MeetingInvitee) => {
        const senderName = currentUser?.name || 'You';
        const senderEmail = currentUser?.email || '';
        const senderAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
        const text = `↪ Shared by ${senderName} (originally from ${originalSender}):\n"${msg.text}"`;
        recordLocalBilateralDirectMessage({
            senderName,
            senderEmail,
            senderAvatar,
            senderRole,
            recipientName: target.name,
            recipientAvatar: target.avatar,
            recipientSubtitle: target.subtitle,
            text,
        });
        const res = await fetch('/api/connectin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send_message',
                enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                threadId: target.id,
                text,
                senderName,
                senderEmail,
                senderAvatar,
                senderRole,
                recipientName: target.name,
                recipientSubtitle: target.subtitle,
                recipientAvatar: target.avatar,
                channelType: 'People',
            }),
        });
        if (!res.ok) throw new Error('send failed');
    };

    const handlePostMessageToFeed = (msg: B2BMessageItem, isMine: boolean) => {
        if (!onPostToFeed) return;
        onPostToFeed(msg.text, isMine ? undefined : msg.sender.name);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendChatText(messageInput);
    };

    const handleCreateNewThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecipientName.trim() || !newInitialMessage.trim()) return;

        const senderName = currentUser?.name || 'You';
        const senderAvatar =
            currentUser?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
        const recipientTitle = newRecipientName.trim();
        const recipientSub =
            newRecipientRole.trim() ||
            `Verified ${newRecipientChannel} Partner • ConnectIn Direct`;
        const initialText = newInitialMessage.trim();
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const optimisticThread: B2BConversationThread = {
            id: `thread-custom-${Date.now()}`,
            channelType: newRecipientChannel,
            subType:
                newRecipientChannel === 'Companies'
                    ? 'Recruiter'
                    : newRecipientChannel === 'Products'
                    ? 'Vendor'
                    : newRecipientChannel === 'Communities'
                    ? 'Guild'
                    : 'DM',
            title: recipientTitle,
            subtitle: recipientSub,
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
            onlineStatus: 'online',
            isVerified: true,
            badgeIcon:
                newRecipientChannel === 'Companies'
                    ? '🏢'
                    : newRecipientChannel === 'Products'
                    ? '🛍️'
                    : newRecipientChannel === 'Communities'
                    ? '🌐'
                    : '🤝',
            unreadCount: 0,
            lastMessage: initialText,
            lastMessageTime: 'Just now',
            messages: [
                {
                    id: `msg-init-${Date.now()}`,
                    sender: {
                        id: 'me',
                        name: senderName,
                        avatar: senderAvatar,
                        role: senderRole,
                    },
                    text: initialText,
                    timestamp: nowStr,
                },
            ],
        };

        // Immediately add & select thread
        setThreads((prev) => [optimisticThread, ...prev]);
        setActiveChannel('All');
        setSelectedThreadId(optimisticThread.id);
        setShowNewMessageModal(false);
        setNewRecipientName('');
        setNewRecipientRole('');
        setNewInitialMessage('');
        triggerToast(`New conversation started with ${recipientTitle}!`);

        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_thread',
                    enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                    title: recipientTitle,
                    subtitle: recipientSub,
                    channelType: newRecipientChannel,
                    text: initialText,
                    senderName,
                    senderAvatar,
                    senderRole,
                }),
            });

            const data = await res.json();
            if (data?.ok && data.thread) {
                setThreads((prev) =>
                    prev.map((t) => (t.id === optimisticThread.id ? data.thread : t))
                );
                setSelectedThreadId(data.thread.id);
            }
        } catch {
            // Keep optimisticThread in state
        }
    };

    const currentEnclaveObj = PROFESSION_ENCLAVES.find((e) => e.id === selectedEnclave);

    // Channel pill counts
    const countByChannel = (ch: ChannelFilterType) =>
        ch === 'All' ? threads.length : threads.filter((t) => t.channelType === ch).length;

    const totalUnreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col max-w-[1250px] mx-auto my-2 animate-in fade-in duration-300">
            {/* Top Toast Notification */}
            {toastBanner && (
                <div className="bg-emerald-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span>✅</span> {toastBanner}
                    </span>
                    <button
                        onClick={() => setToastBanner(null)}
                        className="text-white/80 hover:text-white font-black"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* 15-Profession Enclave Switcher Ribbon */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Omni-Channel Profession Inbox:
                        </span>
                        <span className="text-xs font-extrabold text-[#0A66C2] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {selectedEnclave === 'all'
                                ? '🌐 All 15 Professions (60+ Channels)'
                                : `${currentEnclaveObj?.icon || '💼'} ${currentEnclaveObj?.name || 'Active Enclave'}`}
                        </span>
                        {totalUnreadCount > 0 && (
                            <span className="text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                                {totalUnreadCount} Unread
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowNewMessageModal(true)}
                            className="px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                            style={{ color: '#FFFFFF' }}
                        >
                            <span>➕</span> New Message
                        </button>
                        {onNavigateVibeComms && (
                            <button
                                onClick={onNavigateVibeComms}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                                style={{ color: '#FFFFFF' }}
                            >
                                <span>🎙️</span> Launch Audio / Video Studio
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable 15-Profession Pill Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        onClick={() => {
                            setSelectedEnclave('all');
                            setActiveChannel('All');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
                            selectedEnclave === 'all'
                                ? 'bg-[#0A66C2] border-[#0A66C2] shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        style={selectedEnclave === 'all' ? { color: '#FFFFFF' } : undefined}
                    >
                        🌐 All Professions
                    </button>
                    {PROFESSION_ENCLAVES.map((enc) => {
                        const isSelected = selectedEnclave === enc.id;
                        return (
                            <button
                                key={enc.id}
                                onClick={() => {
                                    setSelectedEnclave(enc.id);
                                    setActiveChannel('All');
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                                    isSelected
                                        ? 'bg-[#0A66C2] border-[#0A66C2] shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                                style={isSelected ? { color: '#FFFFFF' } : undefined}
                            >
                                <span>{enc.icon}</span>
                                <span>{enc.shortName}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Two-Column Inbox Layout */}
            <div className="flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[640px]">
                {/* Left Sidebar: Channels & Conversation List */}
                <div className="w-full md:w-[390px] border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">
                    {/* Sidebar Header */}
                    <div className="p-3.5 bg-white border-b border-slate-200">
                        <div className="flex justify-between items-center mb-2.5">
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span>💬</span> ConnectIn Messaging
                                    {isLoadingThreads && (
                                        <span className="text-[10px] font-bold text-slate-400 animate-pulse">
                                            Syncing...
                                        </span>
                                    )}
                                </h2>
                                <p className="text-[11px] text-slate-500 font-semibold">
                                    Direct Peers • Hiring Teams • Commercial Vendors • Guilds
                                </p>
                            </div>
                            <span className="text-[11px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                {filteredThreads.length}{' '}
                                {filteredThreads.length === 1 ? 'Thread' : 'Threads'}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-2.5">
                            <input
                                type="text"
                                placeholder="Search people, recruiters, vendors, specs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0A66C2] rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-slate-900 focus:outline-none transition-all"
                            />
                            <svg
                                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Channel Category Filter Pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {(
                                [
                                    { id: 'All', label: '📥 All Inboxes' },
                                    { id: 'People', label: '👤 Direct' },
                                    { id: 'Companies', label: '🏢 Recruiters' },
                                    { id: 'Products', label: '🛍️ Vendors' },
                                    { id: 'Communities', label: '🌐 Guilds' },
                                ] as const
                            ).map((tab) => {
                                const isActive = activeChannel === tab.id;
                                const count = countByChannel(tab.id);
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChannel(tab.id)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all flex items-center gap-1 border ${
                                            isActive
                                                ? 'bg-slate-900 border-slate-900 shadow-sm'
                                                : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/70'
                                        }`}
                                        style={isActive ? { color: '#FFFFFF' } : undefined}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white text-slate-600'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Thread List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60">
                        {filteredThreads.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm font-bold text-slate-700 mb-1">
                                    No conversations match this filter
                                </p>
                                <p className="text-xs text-slate-500 mb-3">
                                    Switch back to All Inboxes or start a new conversation.
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveChannel('All');
                                        setSearchQuery('');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#0A66C2] text-xs font-bold"
                                    style={{ color: '#FFFFFF' }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isSelected = activeThread?.id === thread.id;
                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => handleSelectThread(thread)}
                                        className={`p-3.5 flex gap-3 cursor-pointer transition-all relative ${
                                            isSelected
                                                ? 'bg-blue-50/90 border-l-4 border-l-[#0A66C2]'
                                                : 'bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <img
                                                src={thread.avatar}
                                                alt={thread.title}
                                                className={`w-12 h-12 object-cover border border-slate-200 shadow-sm ${
                                                    thread.channelType === 'People'
                                                        ? 'rounded-full'
                                                        : 'rounded-xl'
                                                }`}
                                            />
                                            {thread.onlineStatus === 'online' && (
                                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-sm" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5 gap-2">
                                                <h4 className="font-extrabold text-sm text-slate-900 truncate flex items-center gap-1">
                                                    {thread.badgeIcon && (
                                                        <span>{thread.badgeIcon}</span>
                                                    )}
                                                    <span className="truncate">{thread.title}</span>
                                                    {thread.isVerified && (
                                                        <svg
                                                            className="w-3.5 h-3.5 text-[#0A66C2] shrink-0"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                    )}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                                    {thread.lastMessageTime}
                                                </span>
                                            </div>

                                            {/* Channel Type & Role Badge */}
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span
                                                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                                        thread.channelType === 'Products'
                                                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                            : thread.channelType === 'Companies'
                                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                            : thread.channelType === 'Communities'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}
                                                >
                                                    {thread.channelType === 'People'
                                                        ? 'Direct'
                                                        : thread.channelType === 'Companies'
                                                        ? 'Recruiter'
                                                        : thread.channelType === 'Products'
                                                        ? 'Vendor Desk'
                                                        : 'Guild'}
                                                </span>
                                                <p className="text-[11px] text-slate-500 font-semibold truncate">
                                                    {thread.subtitle}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={`text-xs truncate ${
                                                        thread.unreadCount > 0
                                                            ? 'font-extrabold text-slate-900'
                                                            : 'text-slate-600 font-medium'
                                                    }`}
                                                >
                                                    {thread.lastMessage}
                                                </p>
                                                {thread.unreadCount > 0 && (
                                                    <span
                                                        className="bg-[#0A66C2] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                                                        style={{ color: '#FFFFFF' }}
                                                    >
                                                        {thread.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Pane: Active Conversation */}
                {activeThread ? (
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        {/* Conversation Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="relative shrink-0">
                                    <img
                                        src={activeThread.avatar}
                                        alt={activeThread.title}
                                        className={`w-12 h-12 object-cover border border-slate-200 shadow-sm ${
                                            activeThread.channelType === 'People'
                                                ? 'rounded-full'
                                                : 'rounded-xl'
                                        }`}
                                    />
                                    {activeThread.onlineStatus === 'online' && (
                                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-base text-slate-900 truncate flex items-center gap-1.5">
                                            {activeThread.badgeIcon && (
                                                <span>{activeThread.badgeIcon}</span>
                                            )}
                                            <span>{activeThread.title}</span>
                                        </h3>
                                        {activeThread.isVerified && (
                                            <span className="bg-blue-50 text-[#0A66C2] text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                                                ✓ Verified {activeThread.subType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 font-semibold truncate">
                                        {activeThread.subtitle}
                                    </p>

                                    {/* Metadata Badges */}
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {activeThread.companyMetadata && (
                                            <>
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                                    🏭 {activeThread.companyMetadata.industry}
                                                </span>
                                                {activeThread.companyMetadata.openJobsCount && (
                                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                                        💼 {activeThread.companyMetadata.openJobsCount} Open Roles
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {activeThread.productMetadata && (
                                            <>
                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                                                    📦 {activeThread.productMetadata.productName}
                                                </span>
                                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                                    💰 {activeThread.productMetadata.price}
                                                </span>
                                            </>
                                        )}
                                        {activeThread.communityMetadata && (
                                            <>
                                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                                    👥 {activeThread.communityMetadata.membersCount.toLocaleString()} Members
                                                </span>
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                                    📌 {activeThread.communityMetadata.topic}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Audio Call, Video Huddle, Contextual Portal Links) */}
                            <div className="flex items-center gap-2 shrink-0">
                                {activeThread.channelType === 'Companies' && onNavigateJobs && (
                                    <button
                                        onClick={onNavigateJobs}
                                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold flex items-center gap-1.5 transition-all border border-amber-300"
                                        title="View Matching Jobs"
                                    >
                                        <span>💼</span>
                                        <span className="hidden lg:inline">Open Jobs</span>
                                    </button>
                                )}
                                {activeThread.channelType === 'Products' &&
                                    onNavigateMarketplace && (
                                        <button
                                            onClick={onNavigateMarketplace}
                                            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-extrabold flex items-center gap-1.5 transition-all border border-indigo-200"
                                            title="Open Vendor Marketplace"
                                        >
                                            <span>🛒</span>
                                            <span className="hidden lg:inline">Marketplace</span>
                                        </button>
                                    )}
                                <button
                                    onClick={() => setActiveCallMode('audio')}
                                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition-all border border-slate-200"
                                    title="Start Voice Call"
                                >
                                    <span>📞</span>
                                    <span className="hidden sm:inline">Voice Call</span>
                                </button>
                                <button
                                    onClick={() => setActiveCallMode('video')}
                                    className="px-3 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                                    style={{ color: '#FFFFFF' }}
                                    title="Start Live Video Huddle"
                                >
                                    <span>🎥</span>
                                    <span className="hidden sm:inline">Video Huddle</span>
                                </button>
                                <button
                                    onClick={() => setShowScheduler(true)}
                                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center gap-1.5 transition-all border border-emerald-300"
                                    title="Schedule a meeting with your connections"
                                >
                                    <span>📅</span>
                                    <span className="hidden sm:inline">Schedule</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat History Stream */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                            {/* Security Banner */}
                            <div className="text-center my-2">
                                <span className="bg-slate-200/80 text-slate-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                    🔒 End-to-End Encrypted ConnectIn {activeThread.channelType}{' '}
                                    Channel
                                </span>
                            </div>

                            {activeThread.messages.map((msg) => {
                                const isMe =
                                    msg.sender.id === 'me' ||
                                    msg.sender.name === 'You' ||
                                    doesDmParticipantMatch(
                                        msg.sender.name,
                                        currentUser?.name || ''
                                    );
                                const myResolvedPic = resolveUserProfilePicture(
                                    currentUser,
                                    msg.sender.avatar
                                );
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${
                                            isMe ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                    >
                                        <img
                                            src={isMe ? myResolvedPic : msg.sender.avatar}
                                            alt={msg.sender.name}
                                            onError={(e) => {
                                                if (isMe) e.currentTarget.src = '/brand/kwesi-avatar.png';
                                            }}
                                            className="w-9 h-9 rounded-full object-cover shrink-0 mt-1 border border-slate-200 shadow-sm ring-2 ring-[#0066FF]"
                                        />
                                        <div
                                            className={`max-w-[75%] flex flex-col ${
                                                isMe ? 'items-end' : 'items-start'
                                            }`}
                                        >
                                            <div className="flex items-baseline gap-2 mb-1 px-1">
                                                <span className="text-xs font-extrabold text-slate-800">
                                                    {isMe
                                                        ? currentUser?.name || 'You'
                                                        : msg.sender.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {msg.timestamp}
                                                </span>
                                            </div>

                                            {/* High-Contrast Message Bubble (Outgoing messages include Profile Picture inserted into ConnectLn Logo Card) */}
                                            <div className="relative">
                                                <ReactionBadges msg={msg} />
                                                <div
                                                    className={`overflow-hidden rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                                                        isMe
                                                            ? 'rounded-tr-none font-semibold'
                                                            : 'p-3.5 bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                                                    }`}
                                                    style={
                                                        isMe
                                                            ? {
                                                                  backgroundColor: '#171513',
                                                                  color: '#F5F0EB',
                                                                  border: '1px solid #2C2825',
                                                              }
                                                            : undefined
                                                    }
                                                >
                                                {isMe && (
                                                    <div
                                                        className="flex items-center justify-between gap-4 px-3.5 py-2 border-b"
                                                        style={{
                                                            backgroundColor: '#1F1C1A',
                                                            borderColor: 'rgba(255,255,255,0.1)',
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <img
                                                                src={myResolvedPic}
                                                                alt={currentUser?.name || 'You'}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/brand/kwesi-avatar.png';
                                                                }}
                                                                className="h-7 w-7 rounded-full object-cover ring-2 ring-[#0066FF] shrink-0"
                                                            />
                                                            <span
                                                                className="text-[11px] font-extrabold truncate"
                                                                style={{ color: '#F5F0EB' }}
                                                            >
                                                                {currentUser?.name || 'Kwesi Asiedu'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <img
                                                                src="/brand/connectln-icon-256.png"
                                                                alt="ConnectLn"
                                                                className="h-5 w-5 rounded-sm object-contain"
                                                            />
                                                            <div className="inline-flex flex-col">
                                                                <span
                                                                    className="text-xs font-black tracking-tight leading-none"
                                                                    style={{ color: '#F5F0EB' }}
                                                                >
                                                                    ConnectLn
                                                                </span>
                                                                <span
                                                                    className="mt-0.5 h-0.5 w-4/5 rounded-full"
                                                                    style={{ backgroundColor: '#A64532' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={isMe ? 'p-3.5' : ''}>
                                                    <p style={isMe ? { color: '#F5F0EB' } : undefined}>
                                                        {msg.text}
                                                    </p>

                                                    {/* Attachments inside bubble */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap gap-1.5">
                                                            {msg.attachments.map((att, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                                                                        isMe
                                                                            ? 'bg-white/10 text-white'
                                                                            : 'bg-slate-100 text-[#0A66C2] border border-slate-200'
                                                                    }`}
                                                                >
                                                                    <span>📎</span>
                                                                    <span>{att.name}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                </div>
                                            </div>
                                            <MessageActionBar
                                                msg={msg}
                                                isMe={isMe}
                                                myKey={(currentUser?.name || '').toLowerCase().trim().replace(/\s+/g, ' ')}
                                                myName={currentUser?.name || ''}
                                                shareTargets={threads
                                                    .filter((t) => t.channelType === 'People' && t.id !== activeThread.id)
                                                    .map((t) => ({ id: t.id, name: t.title, avatar: t.avatar, subtitle: t.subtitle }))}
                                                shareText={msg.text}
                                                shareLink="https://www.connectln.app/connectin"
                                                onReact={(kind) => handleReactToMessage(msg, kind)}
                                                onComment={(text) => handleCommentOnMessage(msg, text)}
                                                onForward={(target) => handleForwardMessage(msg, isMe ? currentUser?.name || 'You' : msg.sender.name, target)}
                                                onPostToFeed={() => handlePostMessageToFeed(msg, isMe)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Live Typing Indicator */}
                            {typingEntity && (
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 pl-2 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-[#0A66C2] animate-ping" />
                                    <span>{typingEntity} is typing a response...</span>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Context-Aware Profession Quick Replies */}
                        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">
                                ⚡ Instant Reply:
                            </span>
                            {quickReplies.map((replyText, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => sendChatText(replyText)}
                                    className="text-xs bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200/90 px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm transition-all hover:border-[#0A66C2]"
                                >
                                    {replyText}
                                </button>
                            ))}
                        </div>

                        {/* Pending Attachment Chip */}
                        {pendingAttachment && (
                            <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                                <span className="text-xs font-extrabold text-[#0A66C2] flex items-center gap-1.5">
                                    <span>📎 Ready to attach:</span>
                                    <span className="underline">{pendingAttachment}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPendingAttachment(null)}
                                    className="text-xs font-black text-rose-600 hover:underline"
                                >
                                    Remove ✕
                                </button>
                            </div>
                        )}

                        {/* Attachment Picker Popover */}
                        {showAttachmentMenu && (
                            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-black text-slate-600">
                                    Select Document to Attach:
                                </span>
                                {PRESET_ATTACHMENTS.map((att) => (
                                    <button
                                        key={att.name}
                                        type="button"
                                        onClick={() => {
                                            setPendingAttachment(att.name);
                                            setShowAttachmentMenu(false);
                                        }}
                                        className="text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-[#0A66C2] text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-all"
                                    >
                                        {att.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quick Emoji Bar */}
                        {showEmojiBar && (
                            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500">
                                    Insert Emoji:
                                </span>
                                {QUICK_EMOJIS.map((em) => (
                                    <button
                                        key={em}
                                        type="button"
                                        onClick={() => setMessageInput((prev) => `${prev}${em} `)}
                                        className="text-base hover:scale-125 transition-transform px-1"
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Message Input Composer */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAttachmentMenu((prev) => !prev);
                                    setShowEmojiBar(false);
                                }}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    showAttachmentMenu || pendingAttachment
                                        ? 'bg-blue-50 border-[#0A66C2] text-[#0A66C2]'
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Attach Blueprint, Spec Sheet, or Verified Resume"
                            >
                                📎
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowEmojiBar((prev) => !prev);
                                    setShowAttachmentMenu(false);
                                }}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    showEmojiBar
                                        ? 'bg-blue-50 border-[#0A66C2] text-[#0A66C2]'
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Insert Emoji"
                            >
                                😊
                            </button>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder={`Message ${activeThread.title}...`}
                                    className="w-full bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0A66C2] rounded-xl py-3 px-4 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={(!messageInput.trim() && !pendingAttachment) || isSending}
                                className="px-5 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] disabled:bg-slate-200 disabled:text-slate-400 font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
                                style={
                                    (!messageInput.trim() && !pendingAttachment) || isSending
                                        ? undefined
                                        : { color: '#FFFFFF' }
                                }
                            >
                                {isSending ? 'Sending...' : 'Send ➤'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
                        <h3 className="text-lg font-black text-slate-800 mb-1">
                            Select a Conversation
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                            Choose any peer, recruiter, commercial vendor desk, or guild on the left
                            to start messaging.
                        </p>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    {/* Quick Contacts Selector */}
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span>✉️</span> Start New ConnectIn Conversation
                            </h3>
                            <button
                                onClick={() => setShowNewMessageModal(false)}
                                className="text-slate-400 hover:text-slate-700 font-black cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-3">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                                ⚡ 1-Click Quick Contacts:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { name: 'Elena Vance, PE', role: 'Senior Commercial Superintendent • Turner Builds', channel: 'People' as const },
                                    { name: 'Talent Acquisition Desk', role: 'Verified Hiring Team • Direct Interview Track', channel: 'Companies' as const },
                                    { name: 'Commercial Tooling & Fleet Desk', role: 'Enterprise Equipment & Spec Quotes', channel: 'Products' as const },
                                    { name: 'Master Practitioners Guild', role: 'Regional Licensing & Project Exchange', channel: 'Communities' as const },
                                ].map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => {
                                            setNewRecipientName(preset.name);
                                            setNewRecipientRole(preset.role);
                                            setNewRecipientChannel(preset.channel);
                                            if (!newInitialMessage) {
                                                setNewInitialMessage(`Hi ${preset.name.split(',')[0]}, reaching out via ConnectLn regarding upcoming project specs and availability.`);
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0A66C2] border border-blue-200 text-[11px] font-bold transition-all cursor-pointer"
                                    >
                                        + {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleCreateNewThread} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    Channel Category
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(
                                        [
                                            { id: 'People', label: '👤 Direct Peer' },
                                            { id: 'Companies', label: '🏢 Recruiter / HR' },
                                            { id: 'Products', label: '🛍️ Vendor Desk' },
                                            { id: 'Communities', label: '🌐 Guild / Group' },
                                        ] as const
                                    ).map((ch) => (
                                        <button
                                            key={ch.id}
                                            type="button"
                                            onClick={() => setNewRecipientChannel(ch.id)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                                                newRecipientChannel === ch.id
                                                    ? 'bg-[#0A66C2] border-[#0A66C2]'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                            style={
                                                newRecipientChannel === ch.id
                                                    ? { color: '#FFFFFF' }
                                                    : undefined
                                            }
                                        >
                                            {ch.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    Recipient Name / Organization *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newRecipientName}
                                    onChange={(e) => setNewRecipientName(e.target.value)}
                                    placeholder="e.g., Elena Vance or DeWalt Commercial Desk"
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0A66C2]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    Role / Specialty Tagline
                                </label>
                                <input
                                    type="text"
                                    value={newRecipientRole}
                                    onChange={(e) => setNewRecipientRole(e.target.value)}
                                    placeholder="e.g., Senior Project Superintendent • Commercial Builds"
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0A66C2]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    Message *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newInitialMessage}
                                    onChange={(e) => setNewInitialMessage(e.target.value)}
                                    placeholder="Write your opening message, quote request, or hiring inquiry..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0A66C2]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewMessageModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-black shadow-sm cursor-pointer"
                                    style={{ color: '#FFFFFF' }}
                                >
                                    Send &amp; Open Thread ➤
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule a meeting with connections (calendar + invitees + reason) */}
            <ScheduleMeetingModal
                open={showScheduler}
                onClose={() => setShowScheduler(false)}
                hostName={currentUser?.name || 'You'}
                defaultInviteeId={activeThread?.channelType === 'People' ? activeThread.id : undefined}
                invitees={threads
                    .filter((t) => t.channelType === 'People')
                    .map<MeetingInvitee>((t) => ({ id: t.id, name: t.title, avatar: t.avatar, subtitle: t.subtitle }))}
                onSendInvite={async (invitee, text) => {
                    const senderName = currentUser?.name || 'You';
                    const senderEmail = currentUser?.email || '';
                    const senderAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                    const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
                    recordLocalBilateralDirectMessage({
                        senderName,
                        senderEmail,
                        senderAvatar,
                        senderRole,
                        recipientName: invitee.name,
                        recipientAvatar: invitee.avatar,
                        recipientSubtitle: invitee.subtitle,
                        text,
                    });
                    const res = await fetch('/api/connectin/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'send_message',
                            enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                            threadId: invitee.id,
                            text,
                            senderName,
                            senderEmail,
                            senderAvatar,
                            senderRole,
                            recipientName: invitee.name,
                            recipientSubtitle: invitee.subtitle,
                            recipientAvatar: invitee.avatar,
                            channelType: 'People',
                        }),
                    });
                    if (!res.ok) throw new Error('send failed');
                }}
            />

            {/* Live WebRTC Audio / Video Huddle Studio Modal */}
            {activeCallMode && activeThread && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div
                        className={`bg-slate-900 text-white rounded-2xl border border-slate-700 ${
                            remoteHuddleParticipants.length >= 2 ? 'max-w-5xl' : 'max-w-3xl'
                        } w-full p-6 shadow-2xl space-y-5 my-auto transition-all`}
                    >
                        {/* Top Call Status Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                    {isScreenSharing
                                        ? '🖥️ Live Screen Share Session'
                                        : activeCallMode === 'video' && isCameraOn
                                        ? '🎥 Live E2EE Video Huddle'
                                        : '📞 Live E2EE Voice Call'}
                                </span>
                                <span className="rounded-md bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                                    ⏱️ {formatCallTime(callSeconds)}
                                </span>
                                <span className="rounded-md bg-sky-950/80 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300">
                                    👥 {1 + Math.max(1, remoteHuddleParticipants.length)} Connected Live
                                </span>
                                {activeCallMode === 'video' && isCameraOn && (
                                    <span className="rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                        {cameraStatusText}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {videoDevices.length > 1 && (
                                    <select
                                        value={selectedVideoDeviceId}
                                        onChange={(e) => {
                                            const devId = e.target.value;
                                            setSelectedVideoDeviceId(devId);
                                            startCallMedia('video', devId);
                                        }}
                                        className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-bold text-emerald-300"
                                    >
                                        {videoDevices.map((d, idx) => (
                                            <option key={d.deviceId || idx} value={d.deviceId}>
                                                📷 {d.label || `Camera ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {isUsingFallbackCam && activeCallMode === 'video' && (
                                    <button
                                        type="button"
                                        onClick={() => startCallMedia('video', selectedVideoDeviceId || undefined)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-extrabold text-white cursor-pointer"
                                    >
                                        🔄 Retry Hardware Webcam
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        const inviteUrl = `${window.location.origin}/connectin?tab=vibecomms&joinCall=${encodeURIComponent(activeThread.id)}`;
                                        navigator.clipboard?.writeText(inviteUrl);
                                        triggerToast('Call invite link copied to clipboard!');
                                    }}
                                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-sky-300 cursor-pointer"
                                >
                                    🔗 Copy Invite Link
                                </button>
                            </div>
                        </div>

                        {/* Multi-Participant Stage (Local Self-View + All Connected Remote Peers) */}
                        <div
                            className={`grid grid-cols-1 sm:grid-cols-2 ${
                                remoteHuddleParticipants.length >= 2 ? 'lg:grid-cols-3' : ''
                            } gap-4`}
                        >
                            {/* Local User WebRTC Stream / Self-View Card (Placed FIRST so user immediately sees themselves!) */}
                            <div className="relative rounded-xl bg-slate-950 border-2 border-emerald-500/80 h-64 flex flex-col items-center justify-center overflow-hidden shadow-lg">
                                <video
                                    ref={setLocalVideoCallbackRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={(e) => {
                                        e.currentTarget.play().catch(() => {});
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform:
                                            !isScreenSharing && !isUsingFallbackCam ? 'scaleX(-1)' : 'none',
                                        opacity:
                                            ((activeCallMode === 'video' && isCameraOn) || isScreenSharing) &&
                                            hasLocalStream
                                                ? 1
                                                : 0,
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 5,
                                    }}
                                />

                                {(!hasLocalStream || (!isCameraOn && !isScreenSharing) || activeCallMode === 'audio') && (
                                    <div className="relative z-10 flex flex-col items-center justify-center p-4">
                                        {currentUser?.avatar ? (
                                            <img
                                                src={currentUser.avatar}
                                                alt={currentUser.name || 'You'}
                                                className="w-20 h-20 rounded-full object-cover border-4 border-sky-400 mb-2 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-[#0A66C2] text-white font-black text-xl flex items-center justify-center border-4 border-sky-400 mb-2 shadow-lg">
                                                {(currentUser?.name || 'You').slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <p className="text-sm font-black text-white">
                                            {currentUser?.name || 'You'} (You · Host)
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {isMicMuted ? '🔇 Microphone Muted' : '🎙️ Microphone Active'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveCallMode('video');
                                                setIsCameraOn(true);
                                                startCallMedia('video', selectedVideoDeviceId || undefined);
                                            }}
                                            className="mt-2.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold cursor-pointer"
                                        >
                                            📷 Turn On Self-View Camera
                                        </button>
                                    </div>
                                )}

                                <span className="absolute top-2.5 left-2.5 z-20 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                    ● YOU (SELF-VIEW)
                                </span>

                                <span className="absolute bottom-2.5 left-2.5 z-20 bg-black/75 px-2.5 py-0.5 rounded text-[11px] font-bold text-white border border-white/15">
                                    {currentUser?.name || 'You'} {isMicMuted ? '🔇 (Muted)' : '🎙️ (Live)'}
                                </span>
                            </div>

                            {/* Render every connected remote participant when 1+ remote peers have joined */}
                            {remoteHuddleParticipants.length > 0 ? (
                                remoteHuddleParticipants.map((peer, idx) => {
                                    const peerTitle =
                                        peer.display_name && peer.display_name !== 'You'
                                            ? peer.display_name
                                            : idx === 0
                                            ? activeThread.title
                                            : `Connected Participant #${idx + 1}`;
                                    const peerSubtitle =
                                        peer.role || peer.device_label || activeThread.subtitle;
                                    return (
                                        <div
                                            key={peer.user_id}
                                            className="relative rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 border-2 border-emerald-500/70 h-64 flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg"
                                        >
                                            {activeCallMode === 'video' && (
                                                <>
                                                    <img
                                                        src={peer.live_frame || activeThread.avatar}
                                                        alt={peerTitle}
                                                        className="absolute inset-0 w-full h-full object-cover z-5 transition-transform duration-700"
                                                        style={{
                                                            filter: peer.live_frame
                                                                ? 'none'
                                                                : 'brightness(1.06) contrast(1.05)',
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute inset-0 z-10 pointer-events-none"
                                                        style={{
                                                            background:
                                                                'linear-gradient(to bottom, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.05) 35%, rgba(2,6,23,0.05) 65%, rgba(2,6,23,0.72) 100%)',
                                                        }}
                                                    />
                                                </>
                                            )}

                                            <span className="absolute top-2.5 left-2.5 z-20 bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                                                <span>●</span>
                                                <span>
                                                    {activeCallMode === 'video'
                                                        ? peer.live_frame
                                                            ? `LIVE REMOTE CAMERA #${idx + 1}`
                                                            : 'LIVE HD VIDEO'
                                                        : 'CONNECTED PEER'}
                                                </span>
                                            </span>

                                            <span className="absolute top-2.5 right-2.5 z-20 bg-black/75 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                                🔒 E2EE 1080p
                                            </span>

                                            {activeCallMode !== 'video' && (
                                                <div className="relative z-20 flex flex-col items-center">
                                                    <div className="relative mb-3">
                                                        <img
                                                            src={activeThread.avatar}
                                                            alt={peerTitle}
                                                            className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                                                        />
                                                        <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0" />
                                                    </div>
                                                    <h4 className="font-black text-sm text-white text-center truncate max-w-full">
                                                        {peerTitle}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-300 text-center line-clamp-1 mt-0.5">
                                                        {peerSubtitle}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Bottom HUD Bar with Name + Live Audio/Video Waveform */}
                                            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 bg-black/75 border border-white/15 px-2.5 py-1 rounded">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-extrabold text-white truncate">
                                                        {peerTitle} {peer.is_muted ? '🔇' : ''}
                                                    </p>
                                                    <p className="text-[9px] text-emerald-300 truncate">
                                                        {peerSubtitle}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 h-3.5 shrink-0">
                                                    {[45, 90, 65, 100, 55, 80].map((h, i) => (
                                                        <span
                                                            key={i}
                                                            className="w-1 bg-emerald-400 rounded-full animate-pulse"
                                                            style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                /* Fallback single recipient preview card when waiting for peers to join */
                                <div className="relative rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 border-2 border-emerald-500/70 h-64 flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg">
                                    {activeCallMode === 'video' && (
                                        <>
                                            <img
                                                src={activeThread.avatar}
                                                alt={activeThread.title}
                                                className="absolute inset-0 w-full h-full object-cover z-5 transition-transform duration-700"
                                                style={{ filter: 'brightness(1.06) contrast(1.05)' }}
                                            />
                                            <div
                                                className="absolute inset-0 z-10 pointer-events-none"
                                                style={{
                                                    background:
                                                        'linear-gradient(to bottom, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.05) 35%, rgba(2,6,23,0.05) 65%, rgba(2,6,23,0.72) 100%)',
                                                }}
                                            />
                                        </>
                                    )}

                                    <span className="absolute top-2.5 left-2.5 z-20 bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                                        <span>●</span>
                                        <span>{activeCallMode === 'video' ? 'LIVE HD VIDEO' : 'CONNECTED PEER'}</span>
                                    </span>

                                    <span className="absolute top-2.5 right-2.5 z-20 bg-black/75 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                        🔒 E2EE 1080p
                                    </span>

                                    {activeCallMode !== 'video' && (
                                        <div className="relative z-20 flex flex-col items-center">
                                            <div className="relative mb-3">
                                                <img
                                                    src={activeThread.avatar}
                                                    alt={activeThread.title}
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                                                />
                                                <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0" />
                                            </div>
                                            <h4 className="font-black text-sm text-white text-center truncate max-w-full">
                                                {activeThread.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-300 text-center line-clamp-1 mt-0.5">
                                                {activeThread.subtitle}
                                            </p>
                                        </div>
                                    )}

                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 bg-black/75 border border-white/15 px-2.5 py-1 rounded">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-extrabold text-white truncate">
                                                {activeThread.title}
                                            </p>
                                            <p className="text-[9px] text-emerald-300 truncate">
                                                {activeThread.subtitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 h-3.5 shrink-0">
                                            {[45, 90, 65, 100, 55, 80].map((h, i) => (
                                                <span
                                                    key={i}
                                                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                                                    style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Call Controls Bar */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={handleToggleMic}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isMicMuted
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                            >
                                <span>{isMicMuted ? '🔇' : '🎙️'}</span>
                                <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleCamera}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isCameraOn && activeCallMode === 'video'
                                        ? 'bg-[#0A66C2] hover:bg-[#004182] text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                            >
                                <span>📷</span>
                                <span>{isCameraOn && activeCallMode === 'video' ? 'Camera On (Self-View)' : 'Turn Camera On'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleScreenShare}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isScreenSharing
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                            >
                                <span>🖥️</span>
                                <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
                            </button>

                            {onNavigateVibeComms && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveCallMode(null);
                                        onNavigateVibeComms();
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-black cursor-pointer flex items-center gap-1.5"
                                    style={{ color: '#FFFFFF' }}
                                >
                                    <span>🎙️</span>
                                    <span>Full Audio/Video Studio</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleEndCallAndLog}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black cursor-pointer flex items-center gap-1.5"
                                style={{ color: '#FFFFFF' }}
                            >
                                <span>📞</span>
                                <span>End &amp; Log Call ✕</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MessagingView;
