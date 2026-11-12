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
import { NoctisAIInboxView } from './NoctisAIInboxView';
import {
    WhatsAppLeftIconRail,
    WhatsAppModeWorkspace,
    MessagingWorkspaceMode,
} from './WhatsAppMessagingModes';
import { MessageActionBar, ReactionBadges, loadMembers, ShareTarget, MessageReactionKind } from './MessageActionBar';
import { resolveUserProfilePicture, trackUserActivity } from '@/lib/connectin-storage';
import {
    getLocalBilateralThreadsForViewer,
    mergeBilateralAndServerThreads,
    recordLocalBilateralDirectMessage,
    recordLocalBilateralMessageReaction,
    recordLocalBilateralMessageComment,
    markLocalBilateralConversationRead,
    doesDmParticipantMatch,
    formatMessageSentDateTime,
    formatMessageDateHeading,
} from '@/lib/direct-mailbox-sync';
import {
    startLiveVoiceChunkCapture,
    GaplessRemoteVoicePlayer,
    EncodedVoiceChunk,
} from '@/lib/vibe-voice-codec';

type ChannelFilterType = 'All' | 'People' | 'Companies' | 'Products' | 'Communities';
type ConnectLnMailboxFolder =
    | 'inbox'
    | 'ai_inbox'
    | 'starred'
    | 'snoozed'
    | 'important'
    | 'sent'
    | 'drafts'
    | 'purchases'
    | 'social'
    | 'updates'
    | 'forums'
    | 'promotions'
    | 'scheduled'
    | 'all_mail';

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
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingEntity, setTypingEntity] = useState<string | null>(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(false);

    // ConnectLn Mailbox Navigation Rail States (Inbox, AI Inbox, Starred, Snoozed, Important, Sent, Drafts, Purchases, Social, Updates, Forums, Promotions, Labels)
    const [workspaceMode, setWorkspaceMode] = useState<MessagingWorkspaceMode>('chats');
    const [archivedThreadIds, setArchivedThreadIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem('connectln_archived_threads_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [activeMailboxFolder, setActiveMailboxFolder] = useState<ConnectLnMailboxFolder>('inbox');
    const [showMoreFolders, setShowMoreFolders] = useState<boolean>(false);
    const [activeCustomLabel, setActiveCustomLabel] = useState<string | null>(null);
    const [starredIds, setStarredIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return ['thread_trade_people_gus'];
        try {
            const raw = localStorage.getItem('connectln_starred_threads_v1');
            return raw ? JSON.parse(raw) : ['thread_trade_people_gus'];
        } catch {
            return ['thread_trade_people_gus'];
        }
    });
    const [unstarredIds, setUnstarredIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem('connectln_unstarred_threads_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [snoozedIds, setSnoozedIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem('connectln_snoozed_threads_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [importantIds, setImportantIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return ['thread_comp_recruiter_builder'];
        try {
            const raw = localStorage.getItem('connectln_important_threads_v1');
            return raw ? JSON.parse(raw) : ['thread_comp_recruiter_builder'];
        } catch {
            return ['thread_comp_recruiter_builder'];
        }
    });
    const [savedDraftsByThread, setSavedDraftsByThread] = useState<Record<string, string>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = localStorage.getItem('connectln_message_drafts_v1');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [dismissedDraftIds, setDismissedDraftIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem('connectln_dismissed_drafts_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const composerInputRef = useRef<HTMLInputElement | null>(null);
    const enclaveScrollRef = useRef<HTMLDivElement | null>(null);
    const DEFAULT_CUSTOM_LABELS = [
        { id: 'verified_dm', name: 'Verified DMs', color: '#0A66C2' },
        { id: 'specs_files', name: 'Specs & Attachments', color: '#059669' },
        { id: 'video_huddle', name: 'Video Huddles', color: '#7C3AED' },
        { id: 'job_offers', name: 'Hiring & Offers', color: '#D97706' },
    ];
    const [customLabels, setCustomLabels] = useState<Array<{ id: string; name: string; color: string }>>(() => {
        if (typeof window === 'undefined') return DEFAULT_CUSTOM_LABELS;
        try {
            const raw = localStorage.getItem('connectln_custom_labels_v1');
            if (!raw) return DEFAULT_CUSTOM_LABELS;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CUSTOM_LABELS;
        } catch {
            return DEFAULT_CUSTOM_LABELS;
        }
    });
    const [threadCustomLabels, setThreadCustomLabels] = useState<Record<string, string[]>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = localStorage.getItem('connectln_thread_labels_v1');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [showNewLabelInput, setShowNewLabelInput] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');

    const toggleLabelOnThread = (threadId: string, labelId: string) => {
        setThreadCustomLabels((prev) => {
            const current = prev[threadId] || [];
            const exists = current.includes(labelId);
            const nextList = exists ? current.filter((x) => x !== labelId) : [...current, labelId];
            const next = { ...prev, [threadId]: nextList };
            try {
                localStorage.setItem('connectln_thread_labels_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    // Noctis Inbox API Briefing States
    const [noctisBriefingText, setNoctisBriefingText] = useState<string>('');
    const [noctisDateSummaries, setNoctisDateSummaries] = useState<Record<string, string>>({});
    const [noctisUnreadFilterMode, setNoctisUnreadFilterMode] = useState<
        'unread_and_pending' | 'strict_unread' | 'all'
    >('unread_and_pending');
    const [isNoctisLoading, setIsNoctisLoading] = useState<boolean>(false);
    const [noctisUpdatedAtLabel, setNoctisUpdatedAtLabel] = useState<string>('Updated just now');
    const [noctisQuestionInput, setNoctisQuestionInput] = useState<string>('');
    const [noctisCustomAnswer, setNoctisCustomAnswer] = useState<string | null>(null);
    const [showAllNoctisTodos, setShowAllNoctisTodos] = useState<boolean>(false);
    const [completedNoctisTodoIds, setCompletedNoctisTodoIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem('connectln_noctis_done_todos_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const markNoctisTodoDone = (threadId: string) => {
        setCompletedNoctisTodoIds((prev) => {
            const next = prev.includes(threadId) ? prev : [...prev, threadId];
            try {
                localStorage.setItem('connectln_noctis_done_todos_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        triggerToast('✓ Marked to-do as completed in Noctis.');
    };

    const saveDraftForThread = (threadId: string, draftText: string, showToast = false) => {
        const clean = draftText;
        setSavedDraftsByThread((prev) => {
            const next = { ...prev };
            if (clean.trim()) {
                next[threadId] = clean;
            } else {
                delete next[threadId];
            }
            try {
                localStorage.setItem('connectln_message_drafts_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        if (clean.trim()) {
            setDismissedDraftIds((prev) => {
                if (!prev.includes(threadId)) return prev;
                const next = prev.filter((id) => id !== threadId);
                try {
                    localStorage.setItem('connectln_dismissed_drafts_v1', JSON.stringify(next));
                } catch {}
                return next;
            });
            if (showToast) {
                triggerToast('📝 Draft saved to your ConnectLn Drafts folder.');
            }
        }
    };

    const discardDraftForThread = (threadId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSavedDraftsByThread((prev) => {
            if (!prev[threadId]) return prev;
            const next = { ...prev };
            delete next[threadId];
            try {
                localStorage.setItem('connectln_message_drafts_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        setDismissedDraftIds((prev) => {
            if (prev.includes(threadId)) return prev;
            const next = [...prev, threadId];
            try {
                localStorage.setItem('connectln_dismissed_drafts_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        if (activeThread?.id === threadId) {
            setMessageInput('');
        }
        triggerToast('🗑️ Draft discarded.');
    };

    const toggleStarThread = (threadId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const currentlyStarred = isThreadStarredById(threadId);
        if (currentlyStarred) {
            setStarredIds((prev) => {
                const next = prev.filter((id) => id !== threadId);
                try {
                    localStorage.setItem('connectln_starred_threads_v1', JSON.stringify(next));
                } catch {}
                return next;
            });
            setUnstarredIds((prev) => {
                const next = prev.includes(threadId) ? prev : [...prev, threadId];
                try {
                    localStorage.setItem('connectln_unstarred_threads_v1', JSON.stringify(next));
                } catch {}
                return next;
            });
        } else {
            setUnstarredIds((prev) => {
                const next = prev.filter((id) => id !== threadId);
                try {
                    localStorage.setItem('connectln_unstarred_threads_v1', JSON.stringify(next));
                } catch {}
                return next;
            });
            setStarredIds((prev) => {
                const next = prev.includes(threadId) ? prev : [...prev, threadId];
                try {
                    localStorage.setItem('connectln_starred_threads_v1', JSON.stringify(next));
                } catch {}
                return next;
            });
        }
    };

    const toggleImportantThread = (threadId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setImportantIds((prev) => {
            const next = prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId];
            try {
                localStorage.setItem('connectln_important_threads_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    const toggleSnoozeThread = (threadId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSnoozedIds((prev) => {
            const next = prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId];
            try {
                localStorage.setItem('connectln_snoozed_threads_v1', JSON.stringify(next));
            } catch {}
            triggerToast(
                next.includes(threadId)
                    ? '🕒 Thread snoozed to your Snoozed folder.'
                    : '✓ Thread restored to Inbox.'
            );
            return next;
        });
    };

    const toggleArchiveThread = (threadId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setArchivedThreadIds((prev) => {
            const next = prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId];
            try {
                localStorage.setItem('connectln_archived_threads_v1', JSON.stringify(next));
            } catch {}
            triggerToast(
                next.includes(threadId)
                    ? '📦 Conversation archived to your Archived tab.'
                    : '📬 Conversation restored to Chats.'
            );
            return next;
        });
    };

    // Modals & Interactive States
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newRecipientName, setNewRecipientName] = useState('');
    const [newRecipientRole, setNewRecipientRole] = useState('');
    const [newRecipientAvatar, setNewRecipientAvatar] = useState('');
    const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false);
    const [allPlatformMembers, setAllPlatformMembers] = useState<ShareTarget[]>([]);
    const [newRecipientChannel, setNewRecipientChannel] = useState<
        'People' | 'Companies' | 'Products' | 'Communities'
    >('People');
    const [newInitialMessage, setNewInitialMessage] = useState('');

    useEffect(() => {
        if (showNewMessageModal || showScheduler) {
            loadMembers().then(setAllPlatformMembers);
        }
    }, [showNewMessageModal, showScheduler]);

    const [showEnclaveFilterBar, setShowEnclaveFilterBar] = useState(false);
    const [showQuickRepliesBar, setShowQuickRepliesBar] = useState(false);
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
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
            } catch {
                // Attempt 2: Simpler Video + Audio
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: preferredCamId ? { deviceId: { exact: preferredCamId } } : true,
                        audio: true,
                    });
                } catch {
                    // Attempt 3: Try any available videoinput device on the computer
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

            // Guarantee microphone audio track is attached if video fallback lacked audio
            if (stream && stream.getAudioTracks().length === 0) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                    });
                    micStream.getAudioTracks().forEach((t) => {
                        t.enabled = !isMicMuted;
                        stream!.addTrack(t);
                    });
                } catch {
                    // ignore if no mic hardware exists
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

            // Fallback if physical webcam is locked by another app or blocked: show live self-preview stream + attach real microphone!
            const fallbackStream = createLiveSelfPreviewStream();
            if (fallbackStream) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                    });
                    micStream.getAudioTracks().forEach((t) => {
                        t.enabled = !isMicMuted;
                        fallbackStream.addTrack(t);
                    });
                } catch {
                    // ignore if no mic hardware exists
                }
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

    const handleSelectEnclave = (enclaveId: string, buttonEl?: HTMLElement | null) => {
        setSelectedEnclave(enclaveId);
        setActiveChannel('All');
        setActiveCustomLabel(null);
        setSearchQuery('');
        if (buttonEl) {
            try {
                buttonEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } catch {}
        }
        const vName = currentUser?.name || '';
        const vEmail = currentUser?.email || '';
        const enclaveThreads = getEnclaveB2BThreads(enclaveId);
        const localBilateral = getLocalBilateralThreadsForViewer(vName, vEmail, enclaveId);
        const immediate = mergeBilateralAndServerThreads(localBilateral, enclaveThreads);
        setThreads(immediate);
        // When selecting a specific profession enclave, select its primary profession thread so the conversation pane updates immediately
        const targetThread =
            enclaveId !== 'all' && enclaveThreads.length > 0
                ? enclaveThreads[0]
                : immediate[0];
        if (targetThread) {
            setSelectedThreadId(targetThread.id);
        }
    };

    // Load threads from backend API + local bilateral mailbox whenever selectedEnclave or currentUser changes
    useEffect(() => {
        let cancelled = false;
        const vName = currentUser?.name || '';
        const vEmail = currentUser?.email || '';

        // Immediately populate with local bilateral DMs + enclave threads for zero-latency switch
        const enclaveThreads = getEnclaveB2BThreads(selectedEnclave);
        const localBilateral = getLocalBilateralThreadsForViewer(vName, vEmail, selectedEnclave);
        const immediate = mergeBilateralAndServerThreads(localBilateral, enclaveThreads);
        setThreads(immediate);

        // Check if Recruiting Hub ("Reach Out") handed off a specific recruiting conversation to open
        let handoffMatchedId = '';
        if (typeof window !== 'undefined') {
            try {
                const rawHandoff = sessionStorage.getItem('connectln_open_messaging_target_v1');
                if (rawHandoff) {
                    sessionStorage.removeItem('connectln_open_messaging_target_v1');
                    const parsed = JSON.parse(rawHandoff);
                    const targetName = String(parsed?.threadTitle || '').trim().toLowerCase();
                    const targetChannel = (parsed?.channel as ChannelFilterType) || 'Companies';
                    setActiveMailboxFolder('inbox');
                    setActiveCustomLabel(null);
                    setActiveChannel(targetChannel);
                    const found = immediate.find(
                        (t) => t.title.trim().toLowerCase() === targetName
                    );
                    if (found) {
                        handoffMatchedId = found.id;
                        setSelectedThreadId(found.id);
                        setMobileShowChat(true);
                        triggerToast(
                            `Recruiting conversation with ${found.title} opened in 🏢 Recruiters tab.`
                        );
                    }
                }
            } catch {}
        }

        if (!handoffMatchedId) {
            setSelectedThreadId((prev) =>
                immediate.some((t) => t.id === prev)
                    ? prev
                    : (selectedEnclave !== 'all' && enclaveThreads[0]?.id) || immediate[0]?.id || ''
            );
        }

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
                            : (selectedEnclave !== 'all' && data.threads[0]?.id) || merged[0].id
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

    // Helper to check if a thread has any message sent by the signed-in user
    const hasMessageSentByViewer = (t: B2BConversationThread) =>
        (t.messages || []).some(
            (m) =>
                m.sender.id === 'me' ||
                m.sender.name === 'You' ||
                doesDmParticipantMatch(m.sender.name, currentUser?.name || '')
        );

    const hasAttachmentInThread = (t: B2BConversationThread) =>
        t.lastMessage.includes('📎') ||
        t.lastMessage.toLowerCase().includes('attached:') ||
        (t.messages || []).some(
            (m) => (m.attachments && m.attachments.length > 0) || m.text.includes('📎')
        );

    const hasMeetingOrHuddleInThread = (t: B2BConversationThread) =>
        t.lastMessage.toLowerCase().includes('huddle') ||
        t.lastMessage.toLowerCase().includes('meeting') ||
        t.lastMessage.toLowerCase().includes('call') ||
        t.lastMessage.toLowerCase().includes('briefing') ||
        (t.messages || []).some(
            (m) =>
                m.text.toLowerCase().includes('meeting invitation') ||
                m.text.toLowerCase().includes('video huddle') ||
                m.text.toLowerCase().includes('voice call') ||
                m.text.toLowerCase().includes('rsvp')
        ) ||
        (t.channelType === 'People' && t.onlineStatus === 'online');

    const isThreadStarredById = (threadId: string): boolean => {
        if (unstarredIds.includes(threadId)) return false;
        if (starredIds.includes(threadId)) return true;
        const firstPeer = threads.find((x) => x.channelType === 'People');
        const firstGuild = threads.find((x) => x.channelType === 'Communities');
        return threadId === firstPeer?.id || threadId === firstGuild?.id;
    };

    const getEffectiveDraftForThread = (t: B2BConversationThread): string => {
        const userSaved = savedDraftsByThread[t.id];
        if (typeof userSaved === 'string' && userSaved.trim().length > 0) {
            return userSaved;
        }
        if (dismissedDraftIds.includes(t.id)) {
            return '';
        }
        const shortRecipient = t.title.split('(')[0].trim();
        if (t.channelType === 'Companies') {
            return `Hi ${shortRecipient}, I reviewed the position scope and compensation band — attaching my updated ConnectLn dossier and available for a briefing call this week.`;
        }
        if (t.channelType === 'Products') {
            const prodName = t.productMetadata?.productName || 'the listed commercial package';
            return `Hi ${shortRecipient}, please send the enterprise quote, lead time, and technical spec sheet for ${prodName} so we can finalize procurement.`;
        }
        const firstPeer = threads.find((x) => x.channelType === 'People');
        if (firstPeer && t.id === firstPeer.id) {
            return `Hi ${shortRecipient}, following up on our project specifications and schedule — let me know when you have 10 minutes for a quick ConnectLn Video Huddle.`;
        }
        return '';
    };

    const matchesMailboxFolder = (t: B2BConversationThread, folder: ConnectLnMailboxFolder): boolean => {
        if (folder === 'snoozed') return snoozedIds.includes(t.id);
        if (folder === 'all_mail') return true;
        // Hide snoozed threads from regular Inbox unless all threads in the current enclave were snoozed
        if (folder === 'inbox') {
            const allSnoozedInView =
                threads.length > 0 && threads.every((x) => snoozedIds.includes(x.id));
            return allSnoozedInView ? true : !snoozedIds.includes(t.id);
        }
        if (folder === 'ai_inbox') {
            return (
                (t.unreadCount || 0) > 0 ||
                hasAttachmentInThread(t) ||
                importantIds.includes(t.id) ||
                t.channelType === 'Companies' ||
                t.id.startsWith('dm_pair__')
            );
        }
        if (folder === 'starred') return isThreadStarredById(t.id);
        if (folder === 'important') {
            return (
                importantIds.includes(t.id) ||
                (t.unreadCount || 0) > 0 ||
                t.channelType === 'Companies'
            );
        }
        if (folder === 'sent') return hasMessageSentByViewer(t);
        if (folder === 'drafts') {
            return Boolean(getEffectiveDraftForThread(t).trim());
        }
        if (folder === 'purchases') return t.channelType === 'Products';
        if (folder === 'social') return t.channelType === 'People';
        if (folder === 'updates') {
            return (
                hasMeetingOrHuddleInThread(t) ||
                hasAttachmentInThread(t) ||
                (t.unreadCount || 0) > 0
            );
        }
        if (folder === 'forums') return t.channelType === 'Communities';
        if (folder === 'promotions') return t.channelType === 'Companies';
        if (folder === 'scheduled') return hasMeetingOrHuddleInThread(t);
        return true;
    };

    const matchesCustomLabel = (t: B2BConversationThread, labelId: string | null): boolean => {
        if (!labelId) return true;
        const explicitTags = threadCustomLabels[t.id] || [];
        if (explicitTags.includes(labelId)) return true;
        if (labelId === 'verified_dm') return t.channelType === 'People' && Boolean(t.isVerified);
        if (labelId === 'specs_files') return hasAttachmentInThread(t);
        if (labelId === 'video_huddle') return hasMeetingOrHuddleInThread(t);
        if (labelId === 'job_offers')
            return (
                t.channelType === 'Companies' ||
                t.lastMessage.toLowerCase().includes('job') ||
                t.lastMessage.toLowerCase().includes('recruiting') ||
                t.lastMessage.toLowerCase().includes('role')
            );
        const customDef = customLabels.find((l) => l.id === labelId);
        if (customDef) {
            const kw = customDef.name.trim().toLowerCase();
            if (
                kw &&
                (t.title.toLowerCase().includes(kw) ||
                    t.subtitle.toLowerCase().includes(kw) ||
                    t.lastMessage.toLowerCase().includes(kw))
            ) {
                return true;
            }
            return false;
        }
        return true;
    };

    const countByMailboxFolder = (folder: ConnectLnMailboxFolder): number =>
        threads.filter((t) => matchesMailboxFolder(t, folder)).length;

    // Filter threads based on activeMailboxFolder, activeCustomLabel, activeChannel & searchQuery
    // When a custom label or explicit channel tab is selected, filter across all threads so the thread list count matches the badge count
    const filteredThreads = threads.filter((t) => {
        const matchesFolder =
            activeCustomLabel || activeChannel !== 'All'
                ? true
                : matchesMailboxFolder(t, activeMailboxFolder);
        const matchesLabel = matchesCustomLabel(t, activeCustomLabel);
        const matchesChannel = activeChannel === 'All' || t.channelType === activeChannel;
        const q = searchQuery.trim().toLowerCase();
        const draftPreview = getEffectiveDraftForThread(t).toLowerCase();
        const matchesSearch =
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.lastMessage.toLowerCase().includes(q) ||
            t.subtitle.toLowerCase().includes(q) ||
            draftPreview.includes(q) ||
            (t.companyMetadata?.industry || '').toLowerCase().includes(q) ||
            (t.productMetadata?.productName || '').toLowerCase().includes(q);
        return matchesFolder && matchesLabel && matchesChannel && matchesSearch;
    });

    const activeThread =
        filteredThreads.find((t) => t.id === selectedThreadId) ||
        filteredThreads[0] ||
        threads.find((t) => t.id === selectedThreadId) ||
        threads[0];

    const isThreadUnreadForNoctis = (
        t: B2BConversationThread,
        mode: 'unread_and_pending' | 'strict_unread' | 'all' = noctisUnreadFilterMode
    ): boolean => {
        if (completedNoctisTodoIds.includes(t.id) || snoozedIds.includes(t.id)) {
            return false;
        }
        if (mode === 'all') return true;
        if (mode === 'strict_unread') {
            return (t.unreadCount || 0) > 0;
        }
        // Default ('unread_and_pending'): any thread with unread badge > 0 OR incoming bilateral peer/recruiter/vendor email not yet marked read/done in Noctis
        const lastMsg = t.messages?.[t.messages.length - 1];
        const isIncomingLastMsg = !lastMsg || !lastMsg.isMe;
        return (
            (t.unreadCount || 0) > 0 ||
            t.id.startsWith('dm_pair__') ||
            t.channelType === 'People' ||
            isIncomingLastMsg
        );
    };

    const fetchNoctisInboxBriefing = async (customQuestion?: string) => {
        setIsNoctisLoading(true);
        try {
            const digest = threads.slice(0, 25).map((t) => {
                const lastMsg = t.messages?.[t.messages.length - 1];
                const formattedDateTime = formatMessageSentDateTime(lastMsg, t.lastMessageTime);
                const dateHeading =
                    formattedDateTime.split(' · ')[0]?.trim() ||
                    formatMessageDateHeading(lastMsg) ||
                    formattedDateTime;
                const atts: string[] = [];
                for (const m of t.messages || []) {
                    for (const a of m.attachments || []) {
                        if (a?.name && !atts.includes(a.name)) atts.push(a.name);
                    }
                }
                return {
                    id: t.id,
                    title: t.title,
                    subtitle: t.subtitle,
                    channelType: t.channelType,
                    unreadCount: t.unreadCount,
                    isUnreadOrPending: isThreadUnreadForNoctis(t, 'unread_and_pending'),
                    lastMessage: t.lastMessage,
                    lastMessageTime: formattedDateTime,
                    dateHeading,
                    attachments: atts,
                    messagesCount: (t.messages || []).length,
                };
            });

            const res = await fetch('/api/connectin/noctis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'inbox_briefing',
                    question: customQuestion || undefined,
                    inboxThreads: digest,
                    profile: {
                        name: currentUser?.name || 'Kwesi Asiedu',
                        profession: currentUser?.headline || currentUser?.professionEnclave || '',
                    },
                }),
            });
            const data = await res.json().catch(() => null);
            if (data?.dateSummaries && typeof data.dateSummaries === 'object') {
                setNoctisDateSummaries(data.dateSummaries);
            }
            if (data?.text) {
                if (customQuestion) {
                    setNoctisCustomAnswer(data.text);
                } else {
                    setNoctisBriefingText(data.text);
                }
                setNoctisUpdatedAtLabel(
                    `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                );
            }
        } catch {
            // Keep existing synthesis
        } finally {
            setIsNoctisLoading(false);
        }
    };

    useEffect(() => {
        if (activeMailboxFolder === 'ai_inbox' && threads.length > 0) {
            fetchNoctisInboxBriefing();
        }
    }, [activeMailboxFolder, selectedEnclave, threads.length]);

    const handleSelectMailboxFolder = (folder: ConnectLnMailboxFolder) => {
        if (
            folder === 'inbox' &&
            threads.length > 0 &&
            threads.every((t) => snoozedIds.includes(t.id))
        ) {
            setSnoozedIds([]);
            try {
                localStorage.removeItem('connectln_snoozed_threads_v1');
            } catch {}
        }
        setActiveMailboxFolder(folder);
        setActiveCustomLabel(null);
        setActiveChannel('All');
        setSearchQuery('');
        setMobileShowChat(false);
        if (folder === 'ai_inbox') {
            fetchNoctisInboxBriefing();
        }
        const matching = threads.filter((t) => matchesMailboxFolder(t, folder));
        if (matching.length > 0) {
            const target = matching.find((t) => t.id === selectedThreadId) || matching[0];
            setSelectedThreadId(target.id);
            const draftForTarget = getEffectiveDraftForThread(target);
            if (folder === 'drafts' && draftForTarget) {
                setMessageInput(draftForTarget);
            } else if (savedDraftsByThread[target.id]) {
                setMessageInput(savedDraftsByThread[target.id]);
            }
        }
    };

    const handleSelectCustomLabel = (labelId: string) => {
        if (activeCustomLabel === labelId) {
            setActiveCustomLabel(null);
            return;
        }
        setActiveCustomLabel(labelId);
        if (activeMailboxFolder === 'ai_inbox') {
            setActiveMailboxFolder('inbox');
        }
        setActiveChannel('All');
        setSearchQuery('');
        setMobileShowChat(false);
        const matching = threads.filter((t) => matchesCustomLabel(t, labelId));
        if (matching.length > 0) {
            const target = matching.find((t) => t.id === selectedThreadId) || matching[0];
            setSelectedThreadId(target.id);
        }
    };

    // Live voice capture & playback refs for Messaging Video/Audio Huddle
    const huddleLatestAudioChunkRef = useRef<EncodedVoiceChunk | undefined>(undefined);
    const huddleRecentAudioChunksRef = useRef<EncodedVoiceChunk[]>([]);
    const huddleVoicePlayerRef = useRef<GaplessRemoteVoicePlayer | null>(null);

    // Capture 900ms universal WAV PCM voice chunks when Messaging Huddle is open
    useEffect(() => {
        if (!isCallModalOpen || !localStreamState) {
            huddleLatestAudioChunkRef.current = undefined;
            huddleRecentAudioChunksRef.current = [];
            return;
        }
        if (!huddleVoicePlayerRef.current) {
            huddleVoicePlayerRef.current = new GaplessRemoteVoicePlayer();
        }
        huddleVoicePlayerRef.current.unlock();
        const stopCapture = startLiveVoiceChunkCapture(
            localStreamState,
            () => isMicMuted,
            (latest, recentWindow) => {
                huddleLatestAudioChunkRef.current = latest;
                huddleRecentAudioChunksRef.current = recentWindow;
            },
            480
        );
        return () => {
            stopCapture();
        };
    }, [isCallModalOpen, localStreamState, isMicMuted]);

    // Sync live video frames & live voice chunks with /api/v1/calls when Messaging Video Huddle is active
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
                    const ctx = c.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(vEl, 0, 0, c.width, c.height);
                        if (lastValidLocalHuddleFrameRef.current || isCanvasBright(ctx, c.width, c.height)) {
                            const encoded = c.toDataURL('image/jpeg', 0.52);
                            if (encoded && encoded.length > 800) {
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
                        live_audio_chunk: !isMicMuted ? huddleLatestAudioChunkRef.current : undefined,
                        recent_audio_chunks: !isMicMuted ? huddleRecentAudioChunksRef.current : undefined,
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

                // Verify new frames asynchronously and play remote audio chunks immediately
                for (const peer of activeRemotes) {
                    if (
                        peer.live_audio_chunk ||
                        (Array.isArray(peer.recent_audio_chunks) && peer.recent_audio_chunks.length > 0)
                    ) {
                        if (!huddleVoicePlayerRef.current) {
                            huddleVoicePlayerRef.current = new GaplessRemoteVoicePlayer();
                        }
                        if (Array.isArray(peer.recent_audio_chunks) && peer.recent_audio_chunks.length > 0) {
                            huddleVoicePlayerRef.current.enqueueChunks(
                                peer.user_id,
                                peer.recent_audio_chunks,
                                Boolean(peer.is_muted)
                            );
                        } else if (peer.live_audio_chunk) {
                            huddleVoicePlayerRef.current.enqueueChunk(
                                peer.user_id,
                                peer.live_audio_chunk,
                                Boolean(peer.is_muted)
                            );
                        }
                    }

                    if (
                        typeof peer.live_frame === 'string' &&
                        peer.live_frame.length > 800
                    ) {
                        verifiedRemoteFramesRef.current.set(peer.user_id, peer.live_frame);
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
        const hb = setInterval(syncHuddleFrame, 380);
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
        setMobileShowChat(true);
        const draftForSelected = getEffectiveDraftForThread(thread);
        if (activeMailboxFolder === 'drafts' && draftForSelected) {
            setMessageInput(draftForSelected);
        } else if (savedDraftsByThread[thread.id]) {
            setMessageInput(savedDraftsByThread[thread.id]);
        } else {
            setMessageInput('');
        }
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
        const nowIso = new Date().toISOString();
        const nowStr = formatMessageSentDateTime(nowIso);

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
            createdAtIso: nowIso,
            attachments: pendingAttachment
                ? [{ name: pendingAttachment, type: 'Document' }]
                : undefined,
        };

        const targetThreadId = activeThread.id;
        const targetEntityName = activeThread.title;

        // Persist immediately in bilateral local mailbox so People DMs and Recruiting threads keep all messages across reloads
        if (
            activeThread.channelType === 'People' ||
            activeThread.channelType === 'Companies' ||
            targetThreadId.startsWith('dm_pair__')
        ) {
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
                channelType: activeThread.channelType,
                subType: activeThread.subType as any,
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
                    lastMessageTime: nowStr,
                    messages: [...t.messages, optimisticMsg],
                };
            })
        );

        const sentAttachment = pendingAttachment;
        setMessageInput('');
        setSavedDraftsByThread((prev) => {
            if (!prev[targetThreadId]) return prev;
            const next = { ...prev };
            delete next[targetThreadId];
            try {
                localStorage.setItem('connectln_message_drafts_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        setDismissedDraftIds((prev) => {
            if (prev.includes(targetThreadId)) return prev;
            const next = [...prev, targetThreadId];
            try {
                localStorage.setItem('connectln_dismissed_drafts_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
        setPendingAttachment(null);
        setShowAttachmentMenu(false);
        setShowEmojiBar(false);
        setIsSending(true);
        setTypingEntity(targetEntityName);

        trackUserActivity({
            actionType: 'MESSAGE_SENT',
            actionLabel: `Sent Message to ${activeThread.title}`,
            category: 'network',
            targetId: targetThreadId,
            targetTitle: `${activeThread.channelType} · ${activeThread.title}`,
            details: `${finalText.slice(0, 140)}${sentAttachment ? ` (📎 ${sentAttachment})` : ''}`,
        });

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

    const messageActionBody = (msg?: B2BMessageItem) => ({
        enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
        threadId: activeThread?.id,
        recipientName: activeThread?.title || '',
        recipientSubtitle: activeThread?.subtitle || '',
        recipientAvatar: activeThread?.avatar || '',
        messageText: msg?.text || '',
        messageSenderName:
            msg?.sender.id === 'me' || msg?.sender.name === 'You'
                ? currentUser?.name || ''
                : msg?.sender.name || '',
        viewerName: currentUser?.name || '',
        senderName: currentUser?.name || '',
        senderEmail: currentUser?.email || '',
        senderAvatar: currentUser?.avatar || '',
    });

    const handleReactToMessage = async (msg: B2BMessageItem, kind: MessageReactionKind) => {
        const me = (currentUser?.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        if (!me) return;
        // Persist in bilateral local store immediately so reactions survive polling & sync across accounts
        recordLocalBilateralMessageReaction({
            messageId: msg.id,
            messageText: msg.text,
            actorName: currentUser?.name || me,
            reaction: kind,
            partnerName: activeThread?.title,
        });
        // Optimistic update so the tap feels instant
        updateMessage(msg.id, (m) => {
            const reactions: Record<string, string[]> = { ...(m.reactions || {}) };
            const set = new Set(reactions[kind] || []);
            if (set.has(me)) set.delete(me);
            else {
                set.add(me);
                const opp = kind === 'up' ? 'down' : kind === 'down' ? 'up' : null;
                if (opp && reactions[opp]) reactions[opp] = reactions[opp].filter((k) => k !== me);
                if (kind.startsWith('rsvp_')) {
                    for (const other of ['rsvp_yes', 'rsvp_no', 'rsvp_maybe']) {
                        if (other !== kind && reactions[other]) {
                            reactions[other] = reactions[other].filter((k) => k !== me);
                        }
                    }
                }
            }
            reactions[kind] = Array.from(set);
            return { ...m, reactions };
        });
        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'react_message',
                    messageId: msg.id,
                    reaction: kind,
                    ...messageActionBody(msg),
                }),
            });
            const data = await res.json();
            if (data?.ok) updateMessage(msg.id, (m) => ({ ...m, reactions: data.reactions || {} }));
        } catch {
            // keep the optimistic reaction on this screen
        }
    };

    const handleRsvpToMeetingInvite = async (msg: B2BMessageItem, choice: 'yes' | 'no' | 'maybe') => {
        const responder = currentUser?.name || 'You';
        const reasonMatch = msg.text.match(/Reason:\s*([^\n]+)/i);
        const reason = reasonMatch ? reasonMatch[1].trim() : 'Scheduled Meeting';
        const labelMap = {
            yes: '✅ Yes — I will attend',
            no: '❌ No — Unable to attend',
            maybe: '🤔 Maybe — Tentative',
        };
        const replyText =
            `📅 Meeting RSVP Response from ${responder}\n` +
            `Response: ${labelMap[choice]}\n` +
            `Meeting: ${reason}\n` +
            `(In response to the meeting invitation sent by ${msg.sender.name})`;
        await sendChatText(replyText);
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
        recordLocalBilateralMessageComment({
            messageId: msg.id,
            messageText: msg.text,
            actorName: author,
            actorAvatar: local.avatar,
            commentText: text,
            partnerName: activeThread?.title,
        });
        updateMessage(msg.id, (m) => ({ ...m, comments: [...(m.comments || []), local].slice(-10) }));
        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'comment_message',
                    messageId: msg.id,
                    commentText: text,
                    ...messageActionBody(msg),
                }),
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
        const rawAvatar = currentUser?.avatar || '';
        const senderAvatar =
            rawAvatar && !String(rawAvatar).startsWith('data:')
                ? rawAvatar
                : '/brand/kwesi-avatar.png';
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
        fetch('/api/connectin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send_message',
                enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                threadId: target.id || `dm_forward_${Date.now()}`,
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
        }).catch(() => {});
        triggerToast(`↪ Message shared with ${target.name}.`);
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
        const senderEmail = currentUser?.email || '';
        const senderAvatar =
            currentUser?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
        const recipientTitle = newRecipientName.trim();
        const recipientSub =
            newRecipientRole.trim() ||
            `Verified ${newRecipientChannel} Partner • ConnectIn Direct`;
        const recipientAvatarUrl =
            newRecipientAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipientTitle)}&backgroundColor=0a66c2`;
        const initialText = newInitialMessage.trim();
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (newRecipientChannel === 'People') {
            recordLocalBilateralDirectMessage({
                senderName,
                senderEmail,
                senderAvatar,
                senderRole,
                recipientName: recipientTitle,
                recipientAvatar: recipientAvatarUrl,
                recipientSubtitle: recipientSub,
                text: initialText,
            });
        }

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
            avatar: recipientAvatarUrl,
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
        setMobileShowChat(true);
        setShowNewMessageModal(false);
        setNewRecipientName('');
        setNewRecipientRole('');
        setNewRecipientAvatar('');
        setShowRecipientSuggestions(false);
        setNewInitialMessage('');
        triggerToast(`New conversation started with ${recipientTitle}!`);
        trackUserActivity({
            actionType: 'MESSAGE_SENT',
            actionLabel: `Started New Message Thread with ${recipientTitle}`,
            category: 'network',
            targetId: optimisticThread.id,
            targetTitle: `${newRecipientChannel} · ${recipientTitle}`,
            details: initialText.slice(0, 140),
        });

        try {
            const res = await fetch('/api/connectin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: newRecipientChannel === 'People' ? 'send_message' : 'create_thread',
                    enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                    title: recipientTitle,
                    recipientName: recipientTitle,
                    subtitle: recipientSub,
                    recipientSubtitle: recipientSub,
                    avatar: recipientAvatarUrl,
                    recipientAvatar: recipientAvatarUrl,
                    channelType: newRecipientChannel,
                    text: initialText,
                    senderName,
                    senderEmail,
                    senderAvatar,
                    senderRole,
                }),
            });

            const data = await res.json();
            if (data?.ok && data.thread) {
                setThreads((prev) =>
                    prev
                        .filter((t) => t.id === optimisticThread.id || t.id !== data.thread.id)
                        .map((t) => (t.id === optimisticThread.id ? data.thread : t))
                );
                setSelectedThreadId(data.thread.id);
            }
        } catch {
            // Keep optimisticThread in state
        }
    };

    const handleSaveNewModalAsDraft = () => {
        const recipientTitle = newRecipientName.trim() || 'New ConnectLn Contact';
        const draftBody =
            newInitialMessage.trim() ||
            `Hi ${recipientTitle.split(',')[0]}, reaching out via ConnectLn regarding upcoming project specs and availability.`;
        const existing = threads.find(
            (t) => t.title.toLowerCase() === recipientTitle.toLowerCase()
        );
        if (existing) {
            saveDraftForThread(existing.id, draftBody, true);
            setSelectedThreadId(existing.id);
            setMessageInput(draftBody);
            setActiveMailboxFolder('drafts');
            setActiveCustomLabel(null);
            setActiveChannel('All');
        } else {
            const recipientSub =
                newRecipientRole.trim() ||
                `Verified ${newRecipientChannel} Partner • ConnectIn Direct`;
            const recipientAvatarUrl =
                newRecipientAvatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipientTitle)}&backgroundColor=0a66c2`;
            const draftThreadId = `thread-draft-${Date.now()}`;
            const draftThread: B2BConversationThread = {
                id: draftThreadId,
                channelType: newRecipientChannel,
                subType:
                    newRecipientChannel === 'Companies'
                        ? 'Recruiter'
                        : newRecipientChannel === 'Products'
                        ? 'Vendor'
                        : newRecipientChannel === 'Communities'
                        ? 'Community Chat'
                        : 'DM',
                title: recipientTitle,
                subtitle: recipientSub,
                avatar: recipientAvatarUrl,
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
                lastMessage: `[Draft] ${draftBody}`,
                lastMessageTime: formatMessageSentDateTime(new Date().toISOString()),
                messages: [],
            };
            setThreads((prev) => [draftThread, ...prev]);
            saveDraftForThread(draftThreadId, draftBody, true);
            setSelectedThreadId(draftThreadId);
            setMessageInput(draftBody);
            setActiveMailboxFolder('drafts');
            setActiveCustomLabel(null);
            setActiveChannel('All');
        }
        setShowNewMessageModal(false);
        setNewRecipientName('');
        setNewRecipientRole('');
        setNewRecipientAvatar('');
        setShowRecipientSuggestions(false);
        setNewInitialMessage('');
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

            {/* Clean, Streamlined Top Header Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 online-dot-blink" />
                            <span>ConnectLn Inbox</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowEnclaveFilterBar((prev) => !prev)}
                            title="Filter inbox by profession enclave"
                            className="text-xs font-bold text-[#0A66C2] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <span>
                                {selectedEnclave === 'all'
                                    ? '🌐 All Professions'
                                    : `${currentEnclaveObj?.icon || '💼'} ${currentEnclaveObj?.shortName || currentEnclaveObj?.name || 'Active Enclave'}`}
                            </span>
                            <span className="text-[10px] opacity-75">{showEnclaveFilterBar ? '▴' : '▾'}</span>
                        </button>
                        {totalUnreadCount > 0 && (
                            <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                                {totalUnreadCount} Unread
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Quick Mode Switcher Pills (Chats, Calls, Status, Communities, Archived) — ConnectLn Desk Note Symbols */}
                        {(
                            [
                                { id: 'chats' as MessagingWorkspaceMode, symbol: '❖', label: 'Chats' },
                                { id: 'calls' as MessagingWorkspaceMode, symbol: '◈', label: 'Calls' },
                                { id: 'status' as MessagingWorkspaceMode, symbol: '✦', label: 'Status' },
                                { id: 'communities' as MessagingWorkspaceMode, symbol: '⬡', label: 'Communities' },
                                { id: 'archived' as MessagingWorkspaceMode, symbol: '▣', label: 'Archived' },
                            ]
                        ).map((m) => {
                            const isAct = workspaceMode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setWorkspaceMode(m.id)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                        isAct
                                            ? 'bg-[#7C4225] border-[#5E3119] shadow-2xs'
                                            : 'bg-[#F7F2E8] hover:bg-[#EFE8DA] text-[#3D3730] border-[#D0C4AE]'
                                    }`}
                                    style={isAct ? { color: '#FBF8F3' } : undefined}
                                >
                                    <span
                                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-extrabold leading-none ${
                                            isAct
                                                ? 'bg-[#5E3119] text-[#FBF8F3]'
                                                : 'bg-[#E5DBCA] text-[#5E3119]'
                                        }`}
                                    >
                                        {m.symbol}
                                    </span>
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => {
                                setWorkspaceMode('chats');
                                setShowNewMessageModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                            style={{ color: '#FFFFFF' }}
                        >
                            <span>✒️</span> New Message
                        </button>
                        {onNavigateVibeComms && (
                            <button
                                onClick={onNavigateVibeComms}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <span>◉</span> Audio / Video Studio
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapsible 15-Profession Pill Bar (Shown when user clicks the Profession pill) */}
                {showEnclaveFilterBar && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 animate-in fade-in">
                        <button
                            type="button"
                            onClick={() => {
                                enclaveScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
                            }}
                            title="Scroll professions left"
                            className="shrink-0 w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                            ‹
                        </button>
                        <div
                            ref={enclaveScrollRef}
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar [&::-webkit-scrollbar]:hidden scroll-smooth"
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    handleSelectEnclave('all', e.currentTarget);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
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
                                        type="button"
                                        onClick={(e) => {
                                            handleSelectEnclave(enc.id, e.currentTarget);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
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
                        <button
                            type="button"
                            onClick={() => {
                                enclaveScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
                            }}
                            title="Scroll professions right"
                            className="shrink-0 w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs cursor-pointer"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            {/* Main ConnectLn + WhatsApp Multi-Mode Workspace: (0) WhatsApp Left Icon Rail, then either WhatsAppModeWorkspace OR (1) ConnectLn Mailbox Menu Rail, (2) Thread List, (3) Active Conversation */}
            <div className="flex flex-col md:flex-row min-h-[680px] md:h-[calc(100vh-210px)]">
                <WhatsAppLeftIconRail
                    activeMode={workspaceMode}
                    onSelectMode={(m) => {
                        setWorkspaceMode(m);
                        if (m === 'chats') {
                            setMobileShowChat(false);
                        }
                    }}
                    unreadChatsCount={totalUnreadCount}
                    unreadArchivedCount={archivedThreadIds.length + 1}
                    currentUserAvatar={currentUser?.avatar}
                />

                {workspaceMode !== 'chats' ? (
                    <WhatsAppModeWorkspace
                        mode={workspaceMode}
                        currentUser={currentUser}
                        threads={threads}
                        archivedThreadIds={archivedThreadIds}
                        onUnarchiveThread={(id) => toggleArchiveThread(id)}
                        onSelectChatThread={(threadId) => {
                            setSelectedThreadId(threadId);
                            setWorkspaceMode('chats');
                            setMobileShowChat(true);
                        }}
                        onStartLiveCall={(callType, targetName) => {
                            if (targetName) {
                                const matched = threads.find((t) =>
                                    t.title.toLowerCase().includes(targetName.toLowerCase().slice(0, 6))
                                );
                                if (matched) {
                                    setSelectedThreadId(matched.id);
                                }
                            }
                            setActiveCallMode(callType);
                        }}
                        onOpenScheduleModal={() => setShowScheduler(true)}
                        triggerToast={triggerToast}
                    />
                ) : (
                    <>
                {/* Column 1: Customized ConnectLn Mailbox Navigation Rail (Horizontal strip on mobile < md, vertical rail on md+) */}
                <div
                    className={`w-full md:w-[218px] border-b md:border-b-0 md:border-r border-slate-200 bg-[#F7F2E8] flex-col shrink-0 py-2 md:py-3 px-2 md:overflow-y-auto select-none ${
                        mobileShowChat ? 'hidden md:flex' : 'flex'
                    }`}
                >
                    {/* ConnectLn Branded Mailbox Badge */}
                    <div className="px-2 md:px-3 pb-2 md:pb-2.5 mb-1.5 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img
                                src="/brand/connectln-icon-256.png"
                                alt="ConnectLn"
                                className="h-5 w-5 rounded-md object-contain shadow-2xs"
                            />
                            <span className="text-xs font-black tracking-tight text-slate-900">
                                ConnectLn Mail
                            </span>
                        </div>
                        <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            E2EE
                        </span>
                    </div>

                    {/* Primary 7 ConnectLn Mailbox Menu Items (Clean & Uncluttered; Secondary folders inside More) */}
                    <div className="flex md:flex-col items-center md:items-stretch gap-1 md:gap-0 md:space-y-0.5 overflow-x-auto md:overflow-x-visible no-scrollbar pb-1 md:pb-0">
                        {(
                            [
                                {
                                    id: 'inbox' as ConnectLnMailboxFolder,
                                    label: 'Inbox',
                                    boldCount: true,
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'ai_inbox' as ConnectLnMailboxFolder,
                                    label: 'Noctis AI',
                                    boldCount: true,
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 15h4l2 3h4l2-3h4v5H4v-5z" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'starred' as ConnectLnMailboxFolder,
                                    label: 'Starred',
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'important' as ConnectLnMailboxFolder,
                                    label: 'Important',
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h11l5 6-5 6H4l4-6-4-6z" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'sent' as ConnectLnMailboxFolder,
                                    label: 'Sent',
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <polygon points="3 4 21 12 3 20 6 12 3 4" />
                                            <line x1="6" y1="12" x2="14" y2="12" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'drafts' as ConnectLnMailboxFolder,
                                    label: 'Drafts',
                                    boldCount: true,
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'snoozed' as ConnectLnMailboxFolder,
                                    label: 'Snoozed',
                                    icon: (
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <circle cx="12" cy="12" r="9" />
                                            <polyline points="12 7 12 12 15 15" />
                                        </svg>
                                    ),
                                },
                            ]
                        ).map((item) => {
                            const isActive = activeMailboxFolder === item.id && !activeCustomLabel;
                            const count = countByMailboxFolder(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelectMailboxFolder(item.id)}
                                    className={`shrink-0 md:w-full flex items-center justify-between gap-1.5 md:gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? 'bg-[#E8D8C8] text-[#3B1E10] font-extrabold shadow-2xs'
                                            : item.boldCount && count > 0
                                            ? 'text-slate-900 font-bold hover:bg-slate-200/70'
                                            : 'text-slate-700 font-medium hover:bg-slate-200/70'
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5 md:gap-3 min-w-0 truncate">
                                        {item.icon}
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                    {count > 0 && (
                                        <span
                                            className={`text-[11px] shrink-0 ${
                                                isActive
                                                    ? 'font-extrabold text-[#3B1E10]'
                                                    : item.boldCount
                                                    ? 'font-bold text-slate-700'
                                                    : 'font-semibold text-slate-500'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* Expandable "More Folders" Section */}
                        <button
                            type="button"
                            onClick={() => setShowMoreFolders((prev) => !prev)}
                            className="shrink-0 md:w-full flex items-center gap-1.5 md:gap-3 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer whitespace-nowrap"
                        >
                            <svg
                                className={`w-4 h-4 shrink-0 transition-transform ${
                                    showMoreFolders ? 'rotate-180' : ''
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                            <span>{showMoreFolders ? 'Less' : 'More Folders'}</span>
                        </button>

                        {showMoreFolders && (
                            <div className="flex md:flex-col items-center md:items-stretch gap-1 md:gap-0 md:space-y-0.5 pl-1 animate-in fade-in">
                                {(
                                    [
                                        { id: 'purchases' as ConnectLnMailboxFolder, label: 'Purchases', icon: '🛍️' },
                                        { id: 'social' as ConnectLnMailboxFolder, label: 'Social', icon: '👥' },
                                        { id: 'updates' as ConnectLnMailboxFolder, label: 'Updates', icon: '🔔' },
                                        { id: 'forums' as ConnectLnMailboxFolder, label: 'Forums', icon: '💬' },
                                        { id: 'promotions' as ConnectLnMailboxFolder, label: 'Promotions', icon: '🏷️' },
                                        { id: 'scheduled' as ConnectLnMailboxFolder, label: 'Scheduled', icon: '📅' },
                                        { id: 'all_mail' as ConnectLnMailboxFolder, label: 'All Mail', icon: '📬' },
                                    ]
                                ).map((sub) => {
                                    const subCount =
                                        sub.id === 'all_mail' ? threads.length : countByMailboxFolder(sub.id);
                                    const isSubActive = activeMailboxFolder === sub.id && !activeCustomLabel;
                                    return (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => handleSelectMailboxFolder(sub.id)}
                                            className={`shrink-0 md:w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                                                isSubActive
                                                    ? 'bg-[#E8D8C8] text-[#3B1E10] font-extrabold'
                                                    : 'text-slate-700 font-medium hover:bg-slate-200/70'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2 md:gap-3">
                                                <span>{sub.icon}</span>
                                                <span>{sub.label}</span>
                                            </span>
                                            {subCount > 0 && (
                                                <span className="text-[11px] text-slate-500">
                                                    {subCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ConnectLn Custom Labels Section ("Labels +") — Always visible on md+, collapsible via More & Labels on mobile */}
                    <div className={`${showMoreFolders ? 'block' : 'hidden md:block'} mt-2 md:mt-4 pt-2 md:pt-3 border-t border-slate-200/90`}>
                        <div className="flex items-center justify-between px-3 mb-1.5">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">
                                Labels
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowNewLabelInput((prev) => !prev)}
                                className="h-6 w-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-base leading-none cursor-pointer"
                                title="Create new ConnectLn label"
                            >
                                +
                            </button>
                        </div>

                        {showNewLabelInput && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const clean = newLabelName.trim();
                                    if (!clean) return;
                                    const id = `lbl_${Date.now()}`;
                                    setCustomLabels((prev) => {
                                        const next = [
                                            ...prev,
                                            { id, name: clean, color: '#0A66C2' },
                                        ];
                                        try {
                                            localStorage.setItem(
                                                'connectln_custom_labels_v1',
                                                JSON.stringify(next)
                                            );
                                        } catch {}
                                        return next;
                                    });
                                    if (activeThread) {
                                        toggleLabelOnThread(activeThread.id, id);
                                        triggerToast(
                                            `🏷️ Label "${clean}" created and applied to ${activeThread.title}.`
                                        );
                                    }
                                    setNewLabelName('');
                                    setShowNewLabelInput(false);
                                }}
                                className="px-2 mb-2 flex items-center gap-1"
                            >
                                <input
                                    type="text"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    placeholder="New label..."
                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 focus:border-[#0A66C2] focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#0A66C2] text-white px-2 py-1 text-[10px] font-bold shrink-0"
                                >
                                    Add
                                </button>
                            </form>
                        )}

                        <div className="space-y-0.5">
                            {customLabels.map((lbl) => {
                                const isSelected = activeCustomLabel === lbl.id;
                                const lblCount = threads.filter((t) =>
                                    matchesCustomLabel(t, lbl.id)
                                ).length;
                                return (
                                    <button
                                        key={lbl.id}
                                        type="button"
                                        onClick={() => handleSelectCustomLabel(lbl.id)}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#E8D8C8] text-[#3B1E10] font-extrabold shadow-2xs'
                                                : 'text-slate-700 font-medium hover:bg-slate-200/70'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2.5 truncate">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: lbl.color }}
                                            />
                                            <span className="truncate">{lbl.name}</span>
                                        </span>
                                        {lblCount > 0 && (
                                            <span
                                                className={`text-[10px] shrink-0 ${
                                                    isSelected
                                                        ? 'font-extrabold text-[#3B1E10]'
                                                        : 'font-semibold text-slate-500'
                                                }`}
                                            >
                                                {lblCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* When "Noctis" is selected in the left navigation rail: search unread emails & summarize them grouped by the dates they came in */}
                {activeMailboxFolder === 'ai_inbox' && !activeCustomLabel ? (
                    (() => {
                        const firstName =
                            (currentUser?.name || 'Kwesi').trim().split(/\s+/)[0] || 'Kwesi';

                        const strictUnreadThreadsCount = threads.filter(
                            (t) =>
                                (t.unreadCount || 0) > 0 &&
                                !completedNoctisTodoIds.includes(t.id) &&
                                !snoozedIds.includes(t.id)
                        ).length;

                        const unreadAndPendingCount = threads.filter((t) =>
                            isThreadUnreadForNoctis(t, 'unread_and_pending')
                        ).length;

                        const activeNoctisTodos = threads
                            .filter((t) => isThreadUnreadForNoctis(t, noctisUnreadFilterMode))
                            .map((t) => {
                                const lastMsg = t.messages?.[t.messages.length - 1];
                                const dateStr = formatMessageSentDateTime(
                                    lastMsg,
                                    t.lastMessageTime
                                );
                                const parts = dateStr.split(' · ');
                                const dateKey =
                                    parts[0]?.trim() ||
                                    formatMessageDateHeading(lastMsg) ||
                                    'Recent';
                                const timeOnly = parts[1]?.trim() || dateStr;
                                const parsedDateMs = Date.parse(dateKey);
                                const sortTimestamp = Number.isNaN(parsedDateMs)
                                    ? 0
                                    : parsedDateMs;

                                const atts: string[] = [];
                                for (const m of t.messages || []) {
                                    for (const a of m.attachments || []) {
                                        if (a?.name && !atts.includes(a.name)) atts.push(a.name);
                                    }
                                }
                                const hasAtt =
                                    atts.length > 0 ||
                                    t.lastMessage.includes('📎') ||
                                    t.lastMessage.toLowerCase().includes('attached:');

                                let todoTitle = `Unread email from ${t.title}`;
                                let todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): ${t.title} (${t.subtitle}) sent "${t.lastMessage}". Open the conversation to reply, schedule a meeting, or attach a verified ConnectLn document.`;
                                let actionLabel = 'View';
                                let actionIcon = '✉️';

                                if (hasAtt) {
                                    const fileName =
                                        atts[0] ||
                                        t.lastMessage
                                            .replace(/^.*attached:\s*/i, '')
                                            .slice(0, 48) ||
                                        'attached file';
                                    todoTitle = `Unread attachment from ${t.title} (${fileName})`;
                                    todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): ${t.title} (${t.subtitle}) sent "${t.lastMessage}" with attachment "${fileName}". Review the attached file and confirm next steps in the thread.`;
                                    actionLabel = 'Open';
                                    actionIcon = '🔗';
                                } else if (t.channelType === 'Companies') {
                                    todoTitle = `Unread hiring & role email from ${t.title}`;
                                    todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): ${t.title} (${t.subtitle}) reached out regarding an open role: "${t.lastMessage}". Reply with your availability or attach your ConnectLn resume.`;
                                    actionLabel = 'View';
                                    actionIcon = '';
                                } else if (t.channelType === 'Products') {
                                    todoTitle = `Unread vendor quote & spec from ${t.title}`;
                                    todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): ${t.title} (${t.subtitle}) updated your commercial quote thread: "${t.lastMessage}". Open to review pricing, lead time, or technical specifications.`;
                                    actionLabel = 'Open';
                                    actionIcon = '🔗';
                                } else if (
                                    t.lastMessage.toLowerCase().includes('huddle') ||
                                    t.lastMessage.toLowerCase().includes('meeting')
                                ) {
                                    todoTitle = `Unread Video Huddle & meeting log with ${t.title}`;
                                    todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): Your E2EE Video Huddle or scheduled session with ${t.title} (${t.subtitle}) was logged: "${t.lastMessage}". Review session notes or schedule the next follow-up.`;
                                    actionLabel = 'View';
                                    actionIcon = '';
                                } else if (t.channelType === 'People') {
                                    todoTitle = `Unread direct email from ${t.title}`;
                                    todoExplanation = `Noctis Summary (${dateKey} at ${timeOnly}): ${t.title} (${t.subtitle}) sent a direct message: "${t.lastMessage}". Click View to open the conversation and send your reply.`;
                                    actionLabel = 'View';
                                    actionIcon = '✉️';
                                }

                                return {
                                    thread: t,
                                    todoTitle,
                                    todoExplanation,
                                    dateStr,
                                    dateKey,
                                    timeOnly,
                                    sortTimestamp,
                                    attCount: Math.max(atts.length, hasAtt ? 1 : 0),
                                    msgCount: (t.messages || []).length || 1,
                                    actionLabel,
                                    actionIcon,
                                };
                            });

                        // Group unread emails chronologically by the exact calendar date they came in
                        const dateMap = new Map<
                            string,
                            {
                                dateKey: string;
                                sortTimestamp: number;
                                items: typeof activeNoctisTodos;
                                autoSummary: string;
                            }
                        >();

                        for (const item of activeNoctisTodos) {
                            const existing = dateMap.get(item.dateKey);
                            if (existing) {
                                existing.items.push(item);
                            } else {
                                dateMap.set(item.dateKey, {
                                    dateKey: item.dateKey,
                                    sortTimestamp: item.sortTimestamp,
                                    items: [item],
                                    autoSummary: '',
                                });
                            }
                        }

                        const dateGroups = Array.from(dateMap.values())
                            .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
                            .map((group) => {
                                const apiDateSummary = noctisDateSummaries[group.dateKey];
                                const sendersList = group.items
                                    .map((i) => i.thread.title)
                                    .join(', ');
                                const fallbackDateSummary = `${group.items.length} unread ${
                                    group.items.length === 1 ? 'email' : 'emails'
                                } arrived on ${group.dateKey} from ${sendersList}. ${group.items
                                    .map(
                                        (i) =>
                                            `${i.thread.title} (${i.timeOnly}): "${i.thread.lastMessage.slice(0, 90)}"`
                                    )
                                    .join(' · ')}`;
                                return {
                                    ...group,
                                    autoSummary: apiDateSummary || fallbackDateSummary,
                                };
                            });

                        const visibleDateGroups = showAllNoctisTodos
                            ? dateGroups
                            : dateGroups.slice(0, 4);
                        const hiddenDatesCount = Math.max(
                            0,
                            dateGroups.length - visibleDateGroups.length
                        );

                        const noctisTopics = [
                            {
                                id: 'topic_direct',
                                title: 'Direct Peer Conversations',
                                icon: '👤',
                                items: threads.filter((t) => t.channelType === 'People'),
                                summary:
                                    '1-on-1 verified member messages, job connections, and peer follow-ups.',
                            },
                            {
                                id: 'topic_attachments',
                                title: 'Attached Reports, Screenshots & Specs',
                                icon: '📎',
                                items: threads.filter((t) => hasAttachmentInThread(t)),
                                summary:
                                    'Conversations containing uploaded reports, engineering blueprints, or screenshots.',
                            },
                            {
                                id: 'topic_recruiters',
                                title: 'Hiring Teams & Recruiter Outreach',
                                icon: '💼',
                                items: threads.filter((t) => t.channelType === 'Companies'),
                                summary:
                                    'Direct interview invitations, compensation bands, and role specifications.',
                            },
                            {
                                id: 'topic_vendors',
                                title: 'Commercial Vendor Quotes & Procurement',
                                icon: '🛍️',
                                items: threads.filter((t) => t.channelType === 'Products'),
                                summary:
                                    'Equipment quotes, software/tooling licenses, and BOM pricing.',
                            },
                            {
                                id: 'topic_huddles',
                                title: 'Video Huddles & Scheduled Meetings',
                                icon: '🎥',
                                items: threads.filter((t) => hasMeetingOrHuddleInThread(t)),
                                summary:
                                    'Completed live E2EE video huddles and calendar meeting invitations.',
                            },
                            {
                                id: 'topic_guilds',
                                title: 'Profession Guilds & Enclave Forums',
                                icon: '🌐',
                                items: threads.filter((t) => t.channelType === 'Communities'),
                                summary:
                                    'Trade standards, peer-reviewed briefings, and regional guild updates.',
                            },
                        ];

                        return (
                            <NoctisAIInboxView
                                firstName={firstName}
                                threads={threads}
                                activeNoctisTodos={activeNoctisTodos}
                                dateGroups={dateGroups}
                                noctisTopics={noctisTopics}
                                noctisUnreadFilterMode={noctisUnreadFilterMode}
                                setNoctisUnreadFilterMode={setNoctisUnreadFilterMode}
                                unreadAndPendingCount={unreadAndPendingCount}
                                strictUnreadThreadsCount={strictUnreadThreadsCount}
                                isNoctisLoading={isNoctisLoading}
                                noctisUpdatedAtLabel={noctisUpdatedAtLabel}
                                noctisBriefingText={noctisBriefingText}
                                noctisCustomAnswer={noctisCustomAnswer}
                                setNoctisCustomAnswer={setNoctisCustomAnswer}
                                noctisQuestionInput={noctisQuestionInput}
                                setNoctisQuestionInput={setNoctisQuestionInput}
                                fetchNoctisInboxBriefing={fetchNoctisInboxBriefing}
                                completedNoctisTodoIds={completedNoctisTodoIds}
                                onRestoreCompletedTodos={() => {
                                    setCompletedNoctisTodoIds([]);
                                    try {
                                        localStorage.removeItem('connectln_noctis_done_todos_v1');
                                    } catch {}
                                }}
                                markNoctisTodoDone={markNoctisTodoDone}
                                toggleSnoozeThread={toggleSnoozeThread}
                                onOpenThread={(threadId, prefillDraft) => {
                                    if (prefillDraft) {
                                        saveDraftForThread(threadId, prefillDraft, false);
                                        setMessageInput(prefillDraft);
                                        triggerToast('✨ Noctis prepared an AI draft reply in the composer.');
                                    }
                                    setSelectedThreadId(threadId);
                                    setActiveMailboxFolder('inbox');
                                    setMobileShowChat(true);
                                }}
                            />
                        );
                    })()
                ) : (
                    <>
                        {/* Column 2: Channels & Conversation Thread List */}
                        <div
                            className={`w-full md:w-[340px] border-r border-slate-200 flex-col bg-white shrink-0 h-full ${
                                mobileShowChat ? 'hidden md:flex' : 'flex'
                            }`}
                        >
                    {/* Sidebar Header */}
                    <div className="p-3 bg-white border-b border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <div className="min-w-0">
                                <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                    <span>Messages</span>
                                    {isLoadingThreads && (
                                        <span className="text-[10px] font-bold text-slate-400 animate-pulse">
                                            Syncing...
                                        </span>
                                    )}
                                </h2>
                                {(activeCustomLabel || activeMailboxFolder !== 'inbox') && (
                                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 flex-wrap mt-0.5">
                                        {activeCustomLabel ? (
                                            <>
                                                <span className="text-[#0A66C2] font-extrabold">
                                                    🏷️{' '}
                                                    {customLabels.find((l) => l.id === activeCustomLabel)?.name ||
                                                        activeCustomLabel}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveCustomLabel(null)}
                                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded cursor-pointer"
                                                >
                                                    ✕ Clear
                                                </button>
                                            </>
                                        ) : activeMailboxFolder === 'drafts' ? (
                                            '📝 Unsent Drafts'
                                        ) : (
                                            <>
                                                <span className="text-[#0A66C2] font-extrabold capitalize">
                                                    📂 {activeMailboxFolder.replace('_', ' ')}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectMailboxFolder('inbox')}
                                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded cursor-pointer"
                                                >
                                                    ✕ Inbox
                                                </button>
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                {filteredThreads.length}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-2">
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0A66C2] rounded-xl py-1.5 pl-8 pr-7 text-xs font-medium text-slate-900 focus:outline-none transition-all"
                            />
                            <svg
                                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2"
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
                                    className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-700 font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Single-Row Channel Category Filter Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                            {(
                                [
                                    { id: 'All', label: 'All' },
                                    { id: 'People', label: 'Direct' },
                                    { id: 'Companies', label: 'Recruiters' },
                                    { id: 'Products', label: 'Vendors' },
                                    { id: 'Communities', label: 'Guilds' },
                                ] as const
                            ).map((tab) => {
                                const isActive = activeChannel === tab.id;
                                const count = countByChannel(tab.id);
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveChannel(tab.id);
                                            setActiveCustomLabel(null);
                                            if (
                                                ['purchases', 'social', 'forums', 'promotions'].includes(
                                                    activeMailboxFolder
                                                )
                                            ) {
                                                setActiveMailboxFolder('inbox');
                                            }
                                            const matching = threads.filter((t) =>
                                                tab.id === 'All' ? true : t.channelType === tab.id
                                            );
                                            if (matching.length > 0 && !matching.some((t) => t.id === selectedThreadId)) {
                                                setSelectedThreadId(matching[0].id);
                                            }
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border cursor-pointer shrink-0 ${
                                            isActive
                                                ? 'bg-[#0A66C2] border-[#0A66C2] shadow-2xs'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        style={isActive ? { color: '#FFFFFF' } : undefined}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`text-[10px] font-semibold ${
                                                isActive
                                                    ? 'text-white/90'
                                                    : 'text-slate-400'
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
                                    {activeMailboxFolder === 'snoozed'
                                        ? 'No snoozed conversations right now'
                                        : activeMailboxFolder === 'drafts'
                                        ? 'No unsent drafts in this view'
                                        : 'No conversations match this filter'}
                                </p>
                                <p className="text-xs text-slate-500 mb-3">
                                    {activeMailboxFolder === 'snoozed'
                                        ? 'Click the 🕒 Snooze icon on any thread to snooze it here.'
                                        : activeMailboxFolder === 'drafts'
                                        ? 'Type in any conversation or click "+ New Draft" below to save a draft.'
                                        : 'Switch back to Inbox or start a new conversation.'}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {activeMailboxFolder === 'drafts' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDismissedDraftIds([]);
                                                try {
                                                    localStorage.removeItem('connectln_dismissed_drafts_v1');
                                                } catch {}
                                                setShowNewMessageModal(true);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-bold cursor-pointer"
                                            style={{ color: '#FFFFFF' }}
                                        >
                                            + Create New Draft
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSelectMailboxFolder('inbox');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-[#0A66C2] text-xs font-bold cursor-pointer"
                                        style={{ color: '#FFFFFF' }}
                                    >
                                        Return to Inbox
                                    </button>
                                </div>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => {
                                const isSelected = activeThread?.id === thread.id;
                                const isStarred = isThreadStarredById(thread.id);
                                const isImportant = importantIds.includes(thread.id);
                                const isSnoozed = snoozedIds.includes(thread.id);
                                const effectiveDraft = getEffectiveDraftForThread(thread);
                                const showDraftPreview =
                                    activeMailboxFolder === 'drafts'
                                        ? Boolean(effectiveDraft)
                                        : Boolean(savedDraftsByThread[thread.id]);
                                const lastMsg = thread.messages?.[thread.messages.length - 1];
                                const formattedDateLabel = formatMessageSentDateTime(
                                    lastMsg,
                                    thread.lastMessageTime
                                );
                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => handleSelectThread(thread)}
                                        className={`p-3.5 flex gap-3 cursor-pointer transition-all relative group ${
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
                                                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center absolute -bottom-0.5 -right-0.5">
                                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                                    <span className="relative w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm online-dot-blink" />
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5 gap-1.5">
                                                <h4 className="font-bold text-sm text-slate-900 truncate flex items-center gap-1">
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
                                                <span
                                                    className="text-[10px] font-medium text-slate-400 shrink-0 whitespace-nowrap"
                                                    title={`Last message date & time: ${formattedDateLabel}`}
                                                >
                                                    {formattedDateLabel.split(' · ')[0] || formattedDateLabel}
                                                </span>
                                            </div>

                                            {/* Clean Subtitle */}
                                            <p className="text-[11px] text-slate-500 font-medium truncate mb-0.5">
                                                {thread.subtitle}
                                            </p>

                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={`text-xs truncate ${
                                                        thread.unreadCount > 0
                                                            ? 'font-bold text-slate-900'
                                                            : 'text-slate-500 font-normal'
                                                    }`}
                                                >
                                                    {showDraftPreview ? (
                                                        <span className="text-rose-600 font-bold">
                                                            📝 [Draft] {effectiveDraft}
                                                        </span>
                                                    ) : (
                                                        thread.lastMessage
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {/* Star Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleStarThread(thread.id, e)}
                                                        title={isStarred ? 'Unstar conversation' : 'Star conversation'}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-xs transition-all cursor-pointer ${
                                                            isStarred
                                                                ? 'text-amber-500 scale-110'
                                                                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                                                        }`}
                                                    >
                                                        {isStarred ? '★' : '☆'}
                                                    </button>
                                                    {/* Important Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleImportantThread(thread.id, e)}
                                                        title={isImportant ? 'Remove from Important' : 'Mark as Important'}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                                                            isImportant
                                                                ? 'text-amber-600 font-black'
                                                                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-600'
                                                        }`}
                                                    >
                                                        🏷️
                                                    </button>
                                                    {/* Snooze Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleSnoozeThread(thread.id, e)}
                                                        title={isSnoozed ? 'Unsnooze conversation' : 'Snooze conversation'}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                                                            isSnoozed
                                                                ? 'text-blue-600 font-black'
                                                                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600'
                                                        }`}
                                                    >
                                                        🕒
                                                    </button>
                                                    {/* Archive Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleArchiveThread(thread.id, e)}
                                                        title={archivedThreadIds.includes(thread.id) ? 'Unarchive conversation' : 'Archive conversation'}
                                                        className={`w-5 h-5 rounded flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                                                            archivedThreadIds.includes(thread.id)
                                                                ? 'text-emerald-600 font-black'
                                                                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-emerald-600'
                                                        }`}
                                                    >
                                                        📦
                                                    </button>
                                                    {thread.unreadCount > 0 && (
                                                        <span
                                                            className="bg-[#0A66C2] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                                                            style={{ color: '#FFFFFF' }}
                                                        >
                                                            {thread.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
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
                    <div
                        className={`flex-1 flex-col bg-white overflow-hidden h-full ${
                            mobileShowChat ? 'flex' : 'hidden md:flex'
                        }`}
                    >
                        {/* Conversation Header */}
                        <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200 flex flex-col gap-2 bg-white shadow-sm z-10">
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-[200px] flex-1">
                                    <button
                                        type="button"
                                        onClick={() => setMobileShowChat(false)}
                                        className="md:hidden shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-200 flex items-center gap-1 cursor-pointer"
                                        aria-label="Back to messages list"
                                    >
                                        <span>←</span>
                                        <span>Inbox</span>
                                    </button>
                                    <div className="relative shrink-0">
                                        <img
                                            src={activeThread.avatar}
                                            alt={activeThread.title}
                                            className={`w-11 h-11 object-cover border border-slate-200 shadow-sm ${
                                                activeThread.channelType === 'People'
                                                    ? 'rounded-full'
                                                    : 'rounded-xl'
                                            }`}
                                        />
                                        {activeThread.onlineStatus === 'online' && (
                                            <span className="w-3 h-3 rounded-full flex items-center justify-center absolute -bottom-0.5 -right-0.5">
                                                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                                <span className="relative w-3 h-3 rounded-full bg-emerald-500 border-2 border-white online-dot-blink" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate flex items-center gap-1.5">
                                                <span className="truncate">{activeThread.title}</span>
                                            </h3>
                                            {activeThread.isVerified && (
                                                <span className="bg-blue-50 text-[#0A66C2] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                                    ✓ Verified
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                                🔒 E2EE
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium truncate">
                                            {activeThread.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons (Star, Audio Call, Video Huddle, Schedule) */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleStarThread(activeThread.id)}
                                        title={isThreadStarredById(activeThread.id) ? 'Starred (click to unstar)' : 'Star conversation'}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-all cursor-pointer ${
                                            isThreadStarredById(activeThread.id)
                                                ? 'bg-amber-50 text-amber-500 border-amber-300 shadow-2xs'
                                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500 hover:bg-amber-50/50'
                                        }`}
                                    >
                                        {isThreadStarredById(activeThread.id) ? '★' : '☆'}
                                    </button>
                                    {activeThread.channelType === 'Companies' && onNavigateJobs && (
                                        <button
                                            onClick={onNavigateJobs}
                                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 transition-all border border-amber-300 whitespace-nowrap cursor-pointer"
                                            title="View Matching Jobs"
                                        >
                                            <span>💼</span>
                                            <span className="hidden lg:inline">Jobs</span>
                                        </button>
                                    )}
                                    {activeThread.channelType === 'Products' &&
                                        onNavigateMarketplace && (
                                            <button
                                                onClick={onNavigateMarketplace}
                                                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1 transition-all border border-indigo-200 whitespace-nowrap cursor-pointer"
                                                title="Open Vendor Marketplace"
                                            >
                                                <span>🛒</span>
                                                <span className="hidden lg:inline">Market</span>
                                            </button>
                                        )}
                                    <button
                                        onClick={() => setActiveCallMode('audio')}
                                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all border border-slate-200 whitespace-nowrap cursor-pointer"
                                        title="Start Voice Call"
                                    >
                                        <span>📞</span>
                                        <span className="hidden xl:inline">Call</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveCallMode('video')}
                                        className="px-2.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-bold flex items-center gap-1 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                                        style={{ color: '#FFFFFF' }}
                                        title="Start Live Video Huddle"
                                    >
                                        <span>🎥</span>
                                        <span className="hidden sm:inline">Video</span>
                                    </button>
                                    <button
                                        onClick={() => setShowScheduler(true)}
                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 transition-all border border-emerald-300 whitespace-nowrap cursor-pointer"
                                        title="Schedule a meeting with your connections"
                                    >
                                        <span>📅</span>
                                        <span className="hidden xl:inline">Schedule</span>
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Badges Strip (Clean horizontal row so badges never stack vertically or collide with buttons) */}
                            {(activeThread.companyMetadata ||
                                activeThread.productMetadata ||
                                activeThread.communityMetadata) && (
                                <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-100">
                                    {activeThread.companyMetadata && (
                                        <>
                                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                🏭 {activeThread.companyMetadata.industry}
                                            </span>
                                            {activeThread.companyMetadata.openJobsCount && (
                                                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                    💼 {activeThread.companyMetadata.openJobsCount} Open Roles
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {activeThread.productMetadata && (
                                        <>
                                            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-md border border-indigo-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                📦 {activeThread.productMetadata.productName}
                                            </span>
                                            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                💰 {activeThread.productMetadata.price}
                                            </span>
                                        </>
                                    )}
                                    {activeThread.communityMetadata && (
                                        <>
                                            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                👥 {activeThread.communityMetadata.membersCount.toLocaleString()} Members
                                            </span>
                                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1 whitespace-nowrap">
                                                📌 {activeThread.communityMetadata.topic}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chat History Stream */}
                        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
                            {activeThread.messages.map((msg, idx) => {
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
                                const msgFullSentDateTime = formatMessageSentDateTime(
                                    msg,
                                    msg.timestamp
                                );
                                const msgDateHeading = formatMessageDateHeading(msg);
                                const prevMsgDateHeading =
                                    idx > 0
                                        ? formatMessageDateHeading(activeThread.messages[idx - 1])
                                        : null;
                                const showDateSeparator =
                                    Boolean(msgDateHeading) && msgDateHeading !== prevMsgDateHeading;

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDateSeparator && (
                                            <div className="flex items-center justify-center my-2.5">
                                                <div className="h-px bg-slate-200/80 flex-1 max-w-[80px]" />
                                                <span className="mx-2.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/90 text-[10px] font-bold text-slate-500">
                                                    {msgDateHeading}
                                                </span>
                                                <div className="h-px bg-slate-200/80 flex-1 max-w-[80px]" />
                                            </div>
                                        )}
                                        <div
                                            className={`group flex gap-2.5 ${
                                                isMe ? 'flex-row-reverse' : 'flex-row'
                                            }`}
                                        >
                                            <img
                                                src={isMe ? myResolvedPic : msg.sender.avatar}
                                                alt={msg.sender.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(isMe ? currentUser?.name || 'Member' : msg.sender.name)}&backgroundColor=0a66c2`;
                                                }}
                                                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 shadow-2xs"
                                            />
                                            <div
                                                className={`max-w-[76%] flex flex-col ${
                                                    isMe ? 'items-end' : 'items-start'
                                                }`}
                                            >
                                                <div className="flex items-baseline gap-1.5 mb-1 px-0.5 flex-wrap">
                                                    <span className="text-xs font-bold text-slate-800">
                                                        {isMe
                                                            ? currentUser?.name || 'You'
                                                            : msg.sender.name}
                                                    </span>
                                                    <span
                                                        className="text-[10px] font-medium text-slate-400"
                                                        title={
                                                            isMe
                                                                ? `Sent on ${msgFullSentDateTime}`
                                                                : `Received on ${msgFullSentDateTime}`
                                                        }
                                                    >
                                                        {msgFullSentDateTime.split(' · ')[1] || msgFullSentDateTime}
                                                    </span>
                                                </div>

                                            {/* Clean, Presentable Message Bubble */}
                                            <div className="relative">
                                                <ReactionBadges msg={msg} />
                                                <div
                                                    className={`overflow-hidden rounded-2xl text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                                                        isMe
                                                            ? 'p-3.5 bg-[#0A66C2] text-white rounded-tr-none font-normal'
                                                            : msg.text.includes('Meeting invitation from') || msg.text.includes('Meeting RSVP Response')
                                                            ? 'bg-white text-slate-800 border border-slate-300 rounded-tl-none font-medium'
                                                            : 'p-3.5 bg-white text-slate-800 border border-slate-200 rounded-tl-none font-normal'
                                                    }`}
                                                >
                                                {(msg.text.includes('Meeting invitation from') || msg.text.includes('Meeting RSVP Response')) && (
                                                    <div
                                                        className="flex items-center justify-between gap-4 px-3.5 py-2 border-b bg-slate-900 border-slate-800 text-white"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <img
                                                                src={isMe ? myResolvedPic : msg.sender.avatar}
                                                                alt={isMe ? currentUser?.name || 'You' : msg.sender.name}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(isMe ? currentUser?.name || 'Member' : msg.sender.name)}&backgroundColor=0a66c2`;
                                                                }}
                                                                className="h-6 w-6 rounded-full object-cover ring-1 ring-white/40 shrink-0"
                                                            />
                                                            <span className="text-[11px] font-bold truncate text-white">
                                                                {isMe ? currentUser?.name || 'You' : msg.sender.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <img
                                                                src="/brand/connectln-icon-256.png"
                                                                alt="ConnectLn"
                                                                className="h-4 w-4 rounded-xs object-contain"
                                                            />
                                                            <span className="text-[11px] font-bold tracking-tight text-white">
                                                                ConnectLn Calendar
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={msg.text.includes('Meeting invitation from') || msg.text.includes('Meeting RSVP Response') ? 'p-3.5' : ''}>
                                                    <p className={isMe && !(msg.text.includes('Meeting invitation from') || msg.text.includes('Meeting RSVP Response')) ? 'text-white' : 'text-slate-800'}>
                                                        {msg.text}
                                                    </p>

                                                    {/* Attachments inside bubble */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className={`mt-2 pt-2 border-t flex flex-wrap gap-1.5 ${isMe ? 'border-white/20' : 'border-slate-100'}`}>
                                                            {msg.attachments.map((att, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                                                        isMe
                                                                            ? 'bg-white/15 text-white'
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
                                                authorName={isMe ? currentUser?.name || 'You' : msg.sender.name}
                                                authorRole={isMe ? currentUser?.headline || 'Verified ConnectLn Professional' : msg.sender.role}
                                                authorAvatar={isMe ? myResolvedPic : msg.sender.avatar}
                                                shareTargets={threads
                                                    .filter((t) => t.channelType === 'People' && t.id !== activeThread.id)
                                                    .map((t) => ({ id: t.id, name: t.title, avatar: t.avatar, subtitle: t.subtitle }))}
                                                shareText={msg.text}
                                                shareLink="https://www.connectln.app/connectin"
                                                onReact={(kind) => handleReactToMessage(msg, kind)}
                                                onRsvp={(choice) => handleRsvpToMeetingInvite(msg, choice)}
                                                onComment={(text) => handleCommentOnMessage(msg, text)}
                                                onForward={(target) => handleForwardMessage(msg, isMe ? currentUser?.name || 'You' : msg.sender.name, target)}
                                                onPostToFeed={() => handlePostMessageToFeed(msg, isMe)}
                                            />
                                        </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}

                            {/* Live Draft Message Card inside Conversation Stream (when viewing Drafts or when thread has a saved draft) */}
                            {(() => {
                                const activeDraftText = getEffectiveDraftForThread(activeThread);
                                const shouldShowDraftCard =
                                    Boolean(activeDraftText.trim()) &&
                                    (activeMailboxFolder === 'drafts' ||
                                        Boolean(savedDraftsByThread[activeThread.id]?.trim()));
                                if (!shouldShowDraftCard) return null;
                                return (
                                    <div className="my-3 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/90 p-4 shadow-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                                    📝 Draft Message
                                                </span>
                                                <span className="text-xs font-extrabold text-amber-950">
                                                    To: {activeThread.title}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                                                Saved in Drafts • Not Yet Sent
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 bg-white rounded-xl p-3 border border-amber-200/90 whitespace-pre-line mb-3">
                                            {messageInput.trim() || activeDraftText}
                                        </p>
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const textToLoad =
                                                        messageInput.trim() || activeDraftText;
                                                    setMessageInput(textToLoad);
                                                    saveDraftForThread(
                                                        activeThread.id,
                                                        textToLoad,
                                                        false
                                                    );
                                                    setTimeout(() => {
                                                        composerInputRef.current?.focus();
                                                    }, 40);
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold transition-all cursor-pointer"
                                            >
                                                ✏️ Edit Draft Below
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    discardDraftForThread(activeThread.id, e)
                                                }
                                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold transition-all cursor-pointer"
                                            >
                                                🗑️ Discard Draft
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    sendChatText(
                                                        messageInput.trim() || activeDraftText
                                                    )
                                                }
                                                className="px-4 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-black transition-all shadow-xs cursor-pointer"
                                                style={{ color: '#FFFFFF' }}
                                            >
                                                Send Draft Now ➤
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Live Typing Indicator */}
                            {typingEntity && (
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 pl-2 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-[#0A66C2] animate-ping" />
                                    <span>{typingEntity} is typing a response...</span>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Collapsible Context-Aware Profession Quick Replies */}
                        {showQuickRepliesBar && (
                            <div
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden animate-in fade-in"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                                    ⚡ Quick Reply:
                                </span>
                                {quickReplies.map((replyText, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            sendChatText(replyText);
                                            setShowQuickRepliesBar(false);
                                        }}
                                        className="text-xs bg-white hover:bg-blue-50 text-[#0A66C2] border border-blue-200/90 px-3 py-1 rounded-full font-semibold whitespace-nowrap shadow-2xs transition-all hover:border-[#0A66C2] cursor-pointer"
                                    >
                                        {replyText}
                                    </button>
                                ))}
                            </div>
                        )}

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
                                        onClick={() => {
                                            const nextVal = `${messageInput}${em} `;
                                            setMessageInput(nextVal);
                                            saveDraftForThread(activeThread.id, nextVal, false);
                                        }}
                                        className="text-base hover:scale-125 transition-transform px-1"
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Active Draft Status Bar above Composer */}
                        {(Boolean(messageInput.trim()) ||
                            Boolean(savedDraftsByThread[activeThread.id]?.trim()) ||
                            activeMailboxFolder === 'drafts') && (
                            <div className="px-4 py-1.5 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 truncate">
                                    <span>📝</span>
                                    <span>
                                        Draft active for <strong>{activeThread.title}</strong>
                                    </span>
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const textToSave =
                                                messageInput.trim() ||
                                                getEffectiveDraftForThread(activeThread);
                                            if (textToSave) {
                                                setMessageInput(textToSave);
                                                saveDraftForThread(
                                                    activeThread.id,
                                                    textToSave,
                                                    true
                                                );
                                            }
                                        }}
                                        className="text-[11px] font-extrabold text-[#0A66C2] hover:underline cursor-pointer"
                                    >
                                        💾 Save Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => discardDraftForThread(activeThread.id, e)}
                                        className="text-[11px] font-extrabold text-rose-600 hover:underline cursor-pointer"
                                    >
                                        🗑️ Discard
                                    </button>
                                </div>
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
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                    showEmojiBar
                                        ? 'bg-blue-50 border-[#0A66C2] text-[#0A66C2]'
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Insert Emoji"
                            >
                                😊
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowQuickRepliesBar((prev) => !prev);
                                }}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                    showQuickRepliesBar
                                        ? 'bg-blue-50 border-[#0A66C2] text-[#0A66C2]'
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Toggle Instant Smart Replies"
                            >
                                ⚡
                            </button>

                            <div className="flex-1 relative">
                                <input
                                    ref={composerInputRef}
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setMessageInput(val);
                                        saveDraftForThread(activeThread.id, val, false);
                                    }}
                                    placeholder={`Message ${activeThread.title}...`}
                                    className="w-full bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0A66C2] rounded-xl py-3 px-4 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                                />
                            </div>

                            {messageInput.trim() && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        saveDraftForThread(activeThread.id, messageInput, true)
                                    }
                                    className="px-3.5 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs transition-all shrink-0 cursor-pointer"
                                    title="Save message to your Drafts folder"
                                >
                                    📝 Save Draft
                                </button>
                            )}

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
                    </>
                )}
                    </>
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

                            <div className="relative">
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                    Recipient Name / Organization *
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoComplete="off"
                                    value={newRecipientName}
                                    onFocus={() => setShowRecipientSuggestions(true)}
                                    onChange={(e) => {
                                        setNewRecipientName(e.target.value);
                                        setNewRecipientAvatar('');
                                        setShowRecipientSuggestions(true);
                                    }}
                                    placeholder="Type any letter (e.g., J, V, Y, K) to search members..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0A66C2]"
                                />
                                {showRecipientSuggestions && newRecipientName.trim().length > 0 && (() => {
                                    const q = newRecipientName.trim().toLowerCase();
                                    const qc = q.replace(/[^a-z0-9]/g, '');
                                    const myCompact = (currentUser?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                                    const seen = new Set<string>(myCompact ? [myCompact] : []);
                                    const candidates: ShareTarget[] = [];
                                    const combined: ShareTarget[] = [
                                        ...allPlatformMembers,
                                        ...threads.map((t) => ({
                                            id: t.id,
                                            name: t.title,
                                            avatar: t.avatar,
                                            subtitle: t.subtitle,
                                        })),
                                        { id: 'preset_elena', name: 'Elena Vance, PE', subtitle: 'Senior Commercial Superintendent • Turner Builds' },
                                        { id: 'preset_ta', name: 'Talent Acquisition Desk', subtitle: 'Verified Hiring Team • Direct Interview Track' },
                                        { id: 'preset_fleet', name: 'Commercial Tooling & Fleet Desk', subtitle: 'Enterprise Equipment & Spec Quotes' },
                                        { id: 'preset_guild', name: 'Master Practitioners Guild', subtitle: 'Regional Licensing & Project Exchange' },
                                    ];
                                    for (const item of combined) {
                                        const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                                        if (!key || seen.has(key)) continue;
                                        seen.add(key);
                                        const lower = item.name.toLowerCase();
                                        if (lower.includes(q) || (qc && key.includes(qc))) {
                                            candidates.push(item);
                                        }
                                    }
                                    if (candidates.length === 0) return null;
                                    return (
                                        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                            {candidates.slice(0, 8).map((c) => {
                                                const avatarSrc =
                                                    c.avatar ||
                                                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=0a66c2`;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewRecipientName(c.name);
                                                            if (c.subtitle) setNewRecipientRole(c.subtitle);
                                                            setNewRecipientAvatar(avatarSrc);
                                                            setShowRecipientSuggestions(false);
                                                        }}
                                                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-blue-50 transition-colors cursor-pointer"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={avatarSrc}
                                                            alt={c.name}
                                                            className="h-8 w-8 shrink-0 rounded-full object-cover border border-slate-200"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-extrabold text-slate-900">
                                                                {c.name}
                                                            </p>
                                                            {c.subtitle && (
                                                                <p className="truncate text-[11px] text-slate-500">
                                                                    {c.subtitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
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

                            <div className="flex flex-wrap justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewMessageModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveNewModalAsDraft}
                                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold transition-all cursor-pointer"
                                >
                                    📝 Save as Draft
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
                invitees={(() => {
                    const myCompact = (currentUser?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const seen = new Set<string>(myCompact ? [myCompact] : []);
                    const list: MeetingInvitee[] = [];
                    const raw: MeetingInvitee[] = [
                        ...threads
                            .filter((t) => t.channelType === 'People')
                            .map<MeetingInvitee>((t) => ({ id: t.id, name: t.title, avatar: t.avatar, subtitle: t.subtitle })),
                        ...allPlatformMembers,
                    ];
                    for (const item of raw) {
                        const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!key || seen.has(key)) continue;
                        seen.add(key);
                        list.push(item);
                    }
                    return list;
                })()}
                onLaunchCall={(callMode) => {
                    setShowScheduler(false);
                    setIsCameraOn(callMode === 'video');
                    setActiveCallMode(callMode);
                }}
                onOpenScheduledFolder={() => {
                    setShowScheduler(false);
                    setShowMoreFolders(true);
                    handleSelectMailboxFolder('scheduled');
                }}
                onSendInvite={async (invitee, text) => {
                    const senderName = currentUser?.name || 'You';
                    const senderEmail = currentUser?.email || '';
                    const rawAvatar = currentUser?.avatar || '';
                    const senderAvatar =
                        rawAvatar && !String(rawAvatar).startsWith('data:')
                            ? rawAvatar
                            : '/brand/kwesi-avatar.png';
                    const senderRole = currentUser?.headline || 'Verified ConnectIn Professional';
                    const updatedConvo = recordLocalBilateralDirectMessage({
                        senderName,
                        senderEmail,
                        senderAvatar,
                        senderRole,
                        recipientName: invitee.name,
                        recipientAvatar: invitee.avatar,
                        recipientSubtitle: invitee.subtitle,
                        text,
                    });
                    if (updatedConvo?.pairKey) {
                        const freshLocal = getLocalBilateralThreadsForViewer(
                            senderName,
                            senderEmail,
                            selectedEnclave
                        );
                        setThreads((prev) => mergeBilateralAndServerThreads(freshLocal, prev));
                    }
                    fetch('/api/connectin/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'send_message',
                            enclave: selectedEnclave === 'all' ? activeEnclave : selectedEnclave,
                            threadId: invitee.id || updatedConvo?.pairKey || `dm_mtg_${Date.now()}`,
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
                    }).catch(() => {});
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
                                                        <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0 online-dot-blink" />
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
                                                <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0 online-dot-blink" />
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
