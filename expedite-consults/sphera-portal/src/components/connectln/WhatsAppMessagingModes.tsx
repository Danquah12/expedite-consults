'use client';

import React, { useState, useEffect } from 'react';
import { PulseChannelFeed, fetchPulseChannelPosts, PulseChannelSource } from './PulseChannelFeed';
import { B2BConversationThread } from '@/lib/b2b-messaging-data';
import {
    ConnectLnCellPhoneSoftphoneModal,
    looksLikeClientPhone,
    prettyClientPhone,
} from './ConnectLnCellPhoneSoftphone';
import {
    ConnectLnMyPhoneNumberCard,
    ConnectLnWhatsAppCallModal,
    buildInternationalPhone,
} from './ConnectLnWhatsAppCallModal';
import {
    CONNECTLN_RINGTONE_PRESETS,
    ConnectLnRingtoneId,
    getSelectedConnectLnRingtoneId,
    setSelectedConnectLnRingtoneId,
    saveCustomDeviceRingtoneDataUrl,
    getCustomDeviceRingtoneName,
    previewConnectLnRingtone,
    startOutgoingCallerRingbackTone,
} from '@/lib/connectin-background-ring';
import {
    parseSocialVideoUrl,
    buildStatusEmbedIframeSrc,
    splitLinkAndCustomTitle,
    SocialEmbedProvider,
} from '@/lib/connectin-social-video';
import { ConnectLnTeamsCalendarView } from './ConnectLnTeamsCalendarView';
import { ConnectLnVoicemailInbox } from './ConnectLnVoicemailInbox';
import { MeetingInvitee } from './ScheduleMeetingModal';

export type MessagingWorkspaceMode =
    | 'chats'
    | 'calls'
    | 'calendar'
    | 'status'
    | 'channels'
    | 'communities'
    | 'archived';

export type StatusSourcePlatform =
    | 'YouTube'
    | 'WhatsApp'
    | 'TikTok'
    | 'Facebook'
    | 'Instagram'
    | 'ConnectLn';

export interface StatusUpdateItem {
    id: string;
    authorName: string;
    authorEmail?: string;
    authorAvatar: string;
    timestampLabel: string;
    createdAtMs?: number;
    viewed: boolean;
    mediaType: 'text' | 'photo' | 'video' | 'audio' | 'info';
    title?: string;
    text: string;
    infoDetails?: string;
    infoBadge?: string;
    attachmentName?: string;
    attachmentUrl?: string;
    bgColor?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    embedUrl?: string;
    embedProvider?: SocialEmbedProvider;
    isVerticalEmbed?: boolean;
    musicSegmentsCount?: number;
    videoDuration?: string;
    videoTitle?: string;
    professionTag?: string;
    sourcePlatform?: StatusSourcePlatform;
    mediaFormat?: string;
    externalSourceUrl?: string;
    seriesLabel?: string;
}

export interface StatusCommentItem {
    id: string;
    slideId: string;
    authorName: string;
    authorEmail?: string;
    authorAvatar?: string;
    text: string;
    timestampLabel: string;
    createdAtMs: number;
}

export interface StatusSlideInteractions {
    slideId: string;
    reactions: Record<string, string[]>;
    comments: StatusCommentItem[];
    updatedAtMs: number;
}

function formatSecondsToMmSs(sec: number): string {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const whole = Math.floor(sec);
    const mins = Math.floor(whole / 60);
    const rem = whole % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
}

function isAudioFileOrUrl(nameOrUrl?: string, mimeType?: string): boolean {
    if (String(mimeType || '').toLowerCase().startsWith('audio/')) return true;
    const clean = String(nameOrUrl || '').trim().toLowerCase().split('?')[0];
    return clean.startsWith('data:audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|opus|wma)$/i.test(clean);
}

function detectMediaFormatLabel(raw?: string, fallback = 'MP4'): string {
    const clean = String(raw || '').trim().toLowerCase().split('?')[0];
    const extMatch = clean.match(/\.([a-z0-9]{2,5})$/);
    if (extMatch) return extMatch[1].toUpperCase();
    if (clean.startsWith('data:image/')) {
        const mime = clean.slice(11).split(';')[0];
        return mime.toUpperCase().replace('JPEG', 'JPG');
    }
    if (clean.startsWith('data:video/') || clean.startsWith('data:audio/')) {
        const mime = clean.slice(11).split(';')[0];
        return mime.toUpperCase().replace('MPEG', 'MP3');
    }
    return fallback;
}

function getPlatformBadgeLabel(platform?: StatusSourcePlatform): string {
    switch (platform) {
        case 'YouTube':
            return '▶️ YouTube';
        case 'WhatsApp':
            return '💬 WhatsApp';
        case 'TikTok':
            return '🎵 TikTok';
        case 'Facebook':
            return '📘 Facebook';
        case 'Instagram':
            return '📸 Instagram';
        default:
            return '✦ ConnectLn';
    }
}

function inferPlatformFromHint(hint?: string, fallback: StatusSourcePlatform = 'ConnectLn'): StatusSourcePlatform {
    const lower = String(hint || '').toLowerCase();
    if (lower.includes('youtube') || lower.includes('youtu.be')) return 'YouTube';
    if (lower.includes('tiktok') || lower.includes('snaptik')) return 'TikTok';
    if (lower.includes('facebook') || lower.includes('fb.watch') || lower.includes('fbcdn')) return 'Facebook';
    if (lower.includes('whatsapp') || lower.includes('wa.me') || /\bwa[-_]/i.test(lower)) return 'WhatsApp';
    if (lower.includes('instagram') || lower.includes('instagr.am')) return 'Instagram';
    return fallback;
}

export interface UserStatusBox {
    userId: string;
    authorName: string;
    authorAvatar: string;
    professionTag?: string;
    isCurrentUser?: boolean;
    slides: StatusUpdateItem[];
}

export interface CallLogEntry {
    id: string;
    name: string;
    avatar: string;
    direction: 'incoming' | 'outgoing' | 'missed';
    count?: number;
    timeLabel: string;
    callType: 'voice' | 'video';
    isFavorite?: boolean;
    subtitle?: string;
}

export interface CommunityGroupItem {
    id: string;
    name: string;
    avatar: string;
    subtitle: string;
    groups: Array<{
        id: string;
        name: string;
        isAnnouncement?: boolean;
        lastPreview: string;
        dateLabel: string;
        messages: Array<{
            id: string;
            sender: string;
            text: string;
            time: string;
        }>;
    }>;
}

export interface ArchivedChatEntry {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    dateLabel: string;
    unreadCount: number;
    isBlocked?: boolean;
    subtitle?: string;
}

const STATUS_VIDEO_PRESETS = [
    {
        label: 'City & Site Architecture Reel',
        videoUrl: '/status-videos/spot.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'Executive Property Walkthrough',
        videoUrl: '/status-videos/realtor.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'Clinical & Biomedical Bench Reel',
        videoUrl: '/status-videos/physician.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'Systems & Software Build Clip',
        videoUrl: '/status-videos/developer.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'THE CHURCH OF CHRIST — Choir Music Video',
        videoUrl: '/status-videos/hallelujah_choir.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'Hot Swing Full Instrumental Music (2:11 MP3)',
        videoUrl: '/status-videos/hot-swing.mp3',
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900',
        mediaType: 'audio' as const,
    },
    {
        label: 'AI Agentic Flywheel Telemetry',
        videoUrl: '/status-videos/agentic_flywheel.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
        mediaType: 'video' as const,
    },
    {
        label: 'Aerospace & Orbital Telemetry',
        videoUrl: '/status-videos/nasa_space.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900',
        mediaType: 'video' as const,
    },
];

const STATUS_PHOTO_PRESETS = [
    {
        label: 'Structural Site Corridor',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
    },
    {
        label: 'Cloud & Security Ops Desk',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
    },
    {
        label: 'Executive Interior Suite',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
    },
    {
        label: 'Solar Microgrid Array',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900',
    },
];

const INITIAL_STATUS_UPDATES: StatusUpdateItem[] = [
    {
        id: 'st_boat',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 1:58 PM',
        viewed: false,
        mediaType: 'video',
        videoUrl: '/status-videos/spot.mp4',
        videoDuration: '0:27',
        videoTitle: 'Structural Steel & Field Commissioning Walkthrough Training',
        text: 'Step-by-step site delivery, structural blueprint verification, and phase 2 OSHA 30 rigging inspection training.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
        professionTag: 'Field Operations Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_boat_photo',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 1:15 PM',
        viewed: false,
        mediaType: 'photo',
        title: 'Steel Truss & Rigging Inspection Visual Guide',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        text: 'North bay structural beams verified and torque-checked ahead of commercial concrete pour.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
        professionTag: 'Field Operations Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'JPG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_boat_info',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 12:40 PM',
        viewed: false,
        mediaType: 'info',
        infoBadge: 'Field Safety SOP',
        title: 'Phase 2 Commissioning Window & Gate Access Training Brief',
        text: 'Electrical and rigging apprentices clear Gate B starting 6:30 AM for certified lift & load-testing orientation.',
        infoDetails: 'Supervisor on duty: Boat · Radio Channel 4 · PPE Level B & OSHA 30 badge required.',
        attachmentName: 'Phase2_Rigging_Signoff_Checklist.pdf',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Field Operations Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_it_guru',
        authorName: 'IT-Guru GURU Trainer',
        authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
        timestampLabel: 'Today at 12:14 PM',
        viewed: false,
        mediaType: 'video',
        videoUrl: '/status-videos/k8s_ebpf.mp4',
        videoDuration: '0:24',
        videoTitle: 'Live Cloud Cluster & Zero-Trust eBPF Telemetry Lab Training',
        text: 'Live Cloud Security, Kubernetes runtime defense & Zero-Trust eBPF lab training session.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
        bgColor: 'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)',
        professionTag: 'Cyber & IT Training',
        sourcePlatform: 'TikTok',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_it_guru_photo',
        authorName: 'IT-Guru GURU Trainer',
        authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
        timestampLabel: 'Today at 11:50 AM',
        viewed: false,
        mediaType: 'photo',
        title: 'Zero-Trust SOC & Telemetry Ops Architecture',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
        text: 'Live student lab cluster nodes provisioned across US-East and EU-Central with eBPF runtime policy enforcement.',
        bgColor: 'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)',
        professionTag: 'Cyber & IT Training',
        sourcePlatform: 'TikTok',
        mediaFormat: 'PNG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_it_guru_info',
        authorName: 'IT-Guru GURU Trainer',
        authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
        timestampLabel: 'Today at 11:30 AM',
        viewed: false,
        mediaType: 'info',
        infoBadge: 'Training Cohort Syllabus',
        title: 'SOC & Kubernetes eBPF Hands-On Lab Curriculum',
        text: 'Hands-on cohort covering runtime container containment, Zero-Trust policies, and autonomous incident response drills.',
        infoDetails: 'Schedule: 4:00 PM – 6:30 PM EST · Lab VMs provisioned automatically for registered ConnectLn members.',
        attachmentName: 'ZeroTrust_eBPF_Lab_Guide_v4.pdf',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Cyber & IT Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_ashley',
        authorName: 'Ashley Furniture Homestore JA',
        authorAvatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
        timestampLabel: 'Today at 7:56 AM',
        viewed: false,
        mediaType: 'video',
        videoUrl: '/status-videos/realtor.mp4',
        videoDuration: '0:22',
        videoTitle: 'Commercial Millwork, Interior Fit-Out & Staging Training',
        text: 'Architectural interior installation, executive suite assembly, and contractor staging standards walkthrough.',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Commercial Fit-Out Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'MOV',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_ashley_photo',
        authorName: 'Ashley Furniture Homestore JA',
        authorAvatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
        timestampLabel: 'Today at 7:40 AM',
        viewed: false,
        mediaType: 'photo',
        title: 'Commercial Lobby & Executive Suite Spec Reference',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        text: 'Finish carpentry tolerances, acoustic paneling placement, and white-glove commercial staging standards.',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Commercial Fit-Out Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'JPG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_ashley_info',
        authorName: 'Ashley Furniture Homestore JA',
        authorAvatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
        timestampLabel: 'Today at 7:15 AM',
        viewed: false,
        mediaType: 'info',
        infoBadge: 'Trade Contractor Standards',
        title: 'Commercial Fit-Out Delivery & OSHA Staging Manual',
        text: 'Field installation checklist, elevator protection protocols, and commercial trade partner certification terms.',
        infoDetails: 'Commercial Support Desk · White-Glove Certification · Multi-Site Dispatch Specs.',
        attachmentName: 'Trade_Partner_Installation_Manual.pdf',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Commercial Fit-Out Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_sam_k_choir',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 5:23 AM',
        viewed: false,
        mediaType: 'video',
        videoUrl: '/status-videos/hallelujah_choir.mp4',
        musicSegmentsCount: 5,
        videoDuration: '0:30',
        videoTitle: 'THE CHURCH OF CHRIST — Full Choir Music Worship',
        text: 'Full multi-segment choir worship & music performance — plays continuously through all segments until the very end.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900',
        bgColor: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
        professionTag: 'Music & Worship Series',
        sourcePlatform: 'Facebook',
        mediaFormat: 'MP4',
        externalSourceUrl: 'https://www.facebook.com',
        seriesLabel: 'Part 1 of 5',
    },
    {
        id: 'st_sam_k_music',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 5:18 AM',
        viewed: false,
        mediaType: 'audio',
        audioUrl: '/status-videos/hot-swing.mp3',
        videoDuration: '2:11',
        title: 'Hot Swing — Full Studio Instrumental Track',
        text: 'Complete full-length studio music upload (2:11) — plays continuously from start to finish without cutting off.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900',
        bgColor: 'linear-gradient(135deg, #18181b 0%, #3b1e10 100%)',
        professionTag: 'Full Music Audio',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'MP3',
        seriesLabel: 'Part 2 of 5',
    },
    {
        id: 'st_sam_k',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 2:10 PM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/developer.mp4',
        videoDuration: '0:16',
        videoTitle: 'Control Systems, PLC & Automation Commissioning Training',
        text: 'Hands-on industrial PLC commissioning, SCADA validation, and fail-safe controller testing training module.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #7c4225 100%)',
        professionTag: 'Systems Engineering Training',
        sourcePlatform: 'TikTok',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 3 of 5',
    },
    {
        id: 'st_sam_k_photo',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 1:45 PM',
        viewed: true,
        mediaType: 'photo',
        title: 'PLC Telemetry Bench Verification Schematic',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
        text: 'All Modbus & OPC-UA SCADA endpoints passing 24-hour soak testing during technician certification.',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #7c4225 100%)',
        professionTag: 'Systems Engineering Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'WEBP',
        seriesLabel: 'Part 4 of 5',
    },
    {
        id: 'st_sam_k_info',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 1:10 PM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Commissioning SOP',
        title: 'Plant Automation Cutover & Failover Sign-Off Training',
        text: 'Redundant failover steps between Line A and Line B controllers verified under peak load simulation.',
        infoDetails: 'Inspection Lab: Thursday 8:00 AM · SCADA Credentials & PLC Ladder Logic Pack included.',
        attachmentName: 'SCADA_Failover_Signoff.pdf',
        bgColor: 'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
        professionTag: 'Systems Engineering Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 5 of 5',
    },
    {
        id: 'st_murchisson',
        authorName: 'Murchisson',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        timestampLabel: 'Today at 10:35 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/calc.mp4',
        videoDuration: '0:20',
        videoTitle: 'Q4 Engineering Quantity Takeoff & Cost Estimation Training',
        text: 'Engineering tender modeling, structural load calculations, and bonded commercial estimation training.',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
        professionTag: 'Cost Estimation Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_murchisson_photo',
        authorName: 'Murchisson',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        timestampLabel: 'Today at 10:22 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Q4 Structural Takeoff & MEP Bid Audit Reference',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900',
        text: 'Structural takeoffs and subcontractor rate benchmarking across 14 infrastructure work packages.',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
        professionTag: 'Cost Estimation Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'JPG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_murchisson_info',
        authorName: 'Murchisson',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        timestampLabel: 'Today at 10:12 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Estimation Manual',
        title: 'Commercial Bid Takeoff & Surety Compliance Brief',
        text: 'All structural steel, MEP switchgear, and commercial HVAC BOM bids evaluated on unit-rate accuracy & SLA readiness.',
        infoDetails: 'Includes CSI MasterFormat breakdown and addendum drawing checklist.',
        attachmentName: 'Q4_Master_Tender_Schedule.xlsx',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
        professionTag: 'Cost Estimation Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'XLSX',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_mike_mukasa',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 9:29 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/scenario_drill.mp4',
        videoDuration: '0:25',
        videoTitle: 'Security Architecture & Workshop Readiness Scenario Drill',
        text: 'Live NIST Zero-Trust, OWASP & STRIDE scenario readiness training drill at the central operations workshop.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #443c34 100%)',
        professionTag: 'Workshop & Security Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'WEBM',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_mike_mukasa_photo',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 9:10 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Central Workshop CNC & Turbine Metrology Bay',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
        text: '5-axis CNC tolerance calibration bay prepped for incoming apprentice fabrication assessment.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #443c34 100%)',
        professionTag: 'Workshop & Security Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'JPG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_mike_mukasa_info',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 8:55 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Workshop Shift SOP',
        title: 'Safety, Overhead Crane & Tooling Readiness Protocol',
        text: 'Daily pre-shift verification checklist covering overhead cranes, diagnostic rigs, and calibrated torque benches.',
        infoDetails: 'Shift hours: 7:00 AM – 6:00 PM · Practical skills sign-off tracked in ConnectLn Passport.',
        attachmentName: 'Workshop_Readiness_Log_Today.pdf',
        bgColor: 'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
        professionTag: 'Workshop & Security Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_suzzan',
        authorName: 'Suzzan Coldwell Banker',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        timestampLabel: 'Today at 9:02 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/nasa_space.mp4',
        videoDuration: '0:30',
        videoTitle: 'Aerospace Infrastructure & Commercial Corridor GIS Training',
        text: 'Commercial corridor asset valuation, geospatial telemetry, and institutional property walkthrough training.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #5e3119 100%)',
        professionTag: 'Commercial Real Estate Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_suzzan_photo',
        authorName: 'Suzzan Coldwell Banker',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        timestampLabel: 'Today at 8:40 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Waterfront Mixed-Use Tower MEP & Core Inspection',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900',
        text: '42,000 sq ft turnkey flagship floorplate inspection for medical & enterprise infrastructure build-out.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #5e3119 100%)',
        professionTag: 'Commercial Real Estate Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'JPG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_suzzan_info',
        authorName: 'Suzzan Coldwell Banker',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        timestampLabel: 'Today at 8:15 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Facility Commissioning Brief',
        title: 'Commercial Underwriting & ARGUS Fit-Out Specs',
        text: 'TI Allowance up to $65/sq ft with redundant fiber core and hospital-grade HVAC air-exchange compliance.',
        infoDetails: 'Tour window: 10:00 AM – 4:00 PM · Includes LEED Gold & Class-A underwriting packet.',
        attachmentName: 'Commercial_Portfolio_Brochure.pdf',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Commercial Real Estate Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_naana',
        authorName: 'Naana L',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        timestampLabel: 'Today at 7:03 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/physician.mp4',
        videoDuration: '0:28',
        videoTitle: 'Clinical Biomedical Lab & Acute Trauma Triage Training',
        text: 'Evidence-based clinical diagnostics, sterile laboratory workflow, and emergency trauma protocol training.',
        imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900',
        bgColor: 'linear-gradient(135deg, #63331b 0%, #8a4b29 100%)',
        professionTag: 'Clinical & Healthcare Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'MP4',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_naana_photo',
        authorName: 'Naana L',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        timestampLabel: 'Today at 6:48 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Biomedical Diagnostic Bench & Assay Calibration',
        imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900',
        text: 'Clinical hematology analyzer QC verification and sterile chain-of-custody documentation visual.',
        bgColor: 'linear-gradient(135deg, #63331b 0%, #8a4b29 100%)',
        professionTag: 'Clinical & Healthcare Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'PNG',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_naana_info',
        authorName: 'Naana L',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        timestampLabel: 'Today at 6:30 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Clinical Continuing Ed',
        title: 'CCRN, ACLS & Lab Sterile Technique Verification Guide',
        text: 'Full shift clinical competency checklist for acute care RNs, clinical lab scientists, and EMS paramedics.',
        infoDetails: 'Includes HIPAA-compliant EHR charting protocol & 4.0 CEU credit summary.',
        attachmentName: 'Clinical_Triage_ACLS_Checklist.pdf',
        bgColor: 'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
        professionTag: 'Clinical & Healthcare Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_branding',
        authorName: 'Branding - Market Project',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        timestampLabel: 'Today at 4:54 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/agentic_flywheel.mp4',
        videoDuration: '0:21',
        videoTitle: 'AI Agentic Career Flywheel & Commercial Systems Training',
        text: 'How autonomous skills verification, credential telemetry, and multi-platform portfolios accelerate placements.',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Workforce AI Training',
        sourcePlatform: 'TikTok',
        mediaFormat: 'MOV',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_branding_photo',
        authorName: 'Branding - Market Project',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        timestampLabel: 'Today at 4:40 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Workforce Credential Graph & Technical Portfolio Layout',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900',
        text: 'Reference showcase format for engineering drawings, trade certifications, and employer video briefings.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Workforce AI Training',
        sourcePlatform: 'Facebook',
        mediaFormat: 'WEBP',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_branding_info',
        authorName: 'Branding - Market Project',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        timestampLabel: 'Today at 4:25 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Technical Portfolio Standard',
        title: 'Verified Member Skill Ledger & KSA Evidence Guide',
        text: 'Best practices for publishing trade videos, CAD snapshots, and OSHA/HIPAA/SOC credentials to employers.',
        infoDetails: 'Covers MP4/MOV/WEBM video clips, WEBP/HEIC/PNG jobsite photos & USAJOBS KSA alignment.',
        attachmentName: 'Workforce_Portfolio_Standard_v3.pdf',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Workforce AI Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
    {
        id: 'st_ob',
        authorName: 'OB',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        timestampLabel: 'Today at 4:12 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/spot.mp4',
        videoDuration: '0:27',
        videoTitle: 'NABCEP Solar Microgrid & High-Voltage Diagnostics Training',
        text: 'Field diagnostics walkthrough: 480V switchgear thermal scan, IV-curve testing & microgrid inverter sync.',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900',
        bgColor: 'linear-gradient(135deg, #1c1917 0%, #3d3730 100%)',
        professionTag: 'Solar & Grid Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: '3GP',
        seriesLabel: 'Part 1 of 3',
    },
    {
        id: 'st_ob_photo',
        authorName: 'OB',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        timestampLabel: 'Today at 4:02 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Solar & Feeder Array Morning IV-Curve Inspection',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900',
        text: 'Inverter string voltage balanced across all 6 commercial solar arrays prior to peak load window.',
        bgColor: 'linear-gradient(135deg, #1c1917 0%, #3d3730 100%)',
        professionTag: 'Solar & Grid Training',
        sourcePlatform: 'WhatsApp',
        mediaFormat: 'HEIC',
        seriesLabel: 'Part 2 of 3',
    },
    {
        id: 'st_ob_info',
        authorName: 'OB',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        timestampLabel: 'Today at 3:45 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'NEC 2026 & NFPA 70E SOP',
        title: 'Field Lockout/Tagout & Battery Telemetry Health Log',
        text: 'Zero faults across feeder substations; preventative battery thermal management passed at 99.4% efficiency.',
        infoDetails: 'NFPA 70E Arc-Flash PPE Category 2 · Fluke Solmetric PVA-1500 calibration verified.',
        bgColor: 'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
        professionTag: 'Solar & Grid Training',
        sourcePlatform: 'ConnectLn',
        mediaFormat: 'PDF',
        seriesLabel: 'Part 3 of 3',
    },
];

function groupSlidesToUserBoxes(
    slides: StatusUpdateItem[],
    ownerName: string,
    ownerAvatar: string,
    ownerEmail?: string
): UserStatusBox[] {
    const map = new Map<string, UserStatusBox>();
    const ownerSlug = ownerName.toLowerCase().trim();
    const ownerEmailClean = String(ownerEmail || '').trim().toLowerCase();

    // Ensure "My Status" always has its own dedicated Status Box
    map.set('__me__', {
        userId: '__me__',
        authorName: ownerName,
        authorAvatar: ownerAvatar,
        professionTag: 'My Status Box',
        isCurrentUser: true,
        slides: [],
    });

    for (const s of slides) {
        const cleanAuthor = s.authorName.replace(/\s*\(My Status\)\s*$/i, '').trim();
        const slideEmailClean = String(s.authorEmail || '').trim().toLowerCase();
        const isOwner = Boolean(
            (ownerEmailClean && slideEmailClean && slideEmailClean === ownerEmailClean) ||
            (!slideEmailClean && cleanAuthor.toLowerCase() === ownerSlug)
        );
        const boxKey = isOwner ? '__me__' : cleanAuthor.toLowerCase();
        const existing = map.get(boxKey);
        if (existing) {
            existing.slides.push({ ...s, authorName: isOwner ? ownerName : cleanAuthor });
        } else {
            map.set(boxKey, {
                userId: `user_box_${cleanAuthor.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
                authorName: cleanAuthor,
                authorAvatar: s.authorAvatar,
                professionTag: s.professionTag,
                isCurrentUser: isOwner,
                slides: [{ ...s, authorName: cleanAuthor }],
            });
        }
    }

    return Array.from(map.values());
}

const INITIAL_CALL_LOGS: CallLogEntry[] = [
    {
        id: 'call_kojo',
        name: 'Kojo Larbi - New & Adwoa L...',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        direction: 'incoming',
        timeLabel: '1:50 PM',
        callType: 'voice',
        isFavorite: true,
        subtitle: 'Group Voice Call • 3 participants',
    },
    {
        id: 'call_ashwin',
        name: 'Ashwinprakash',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        direction: 'outgoing',
        count: 2,
        timeLabel: '12:38 PM',
        callType: 'voice',
        isFavorite: true,
        subtitle: 'Verified Senior Solutions Architect',
    },
    {
        id: 'call_ceci',
        name: 'Ceci',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        direction: 'outgoing',
        timeLabel: '12:33 PM',
        callType: 'voice',
        subtitle: 'Operations & Client Relations',
    },
    {
        id: 'call_boat_kojo',
        name: 'Boat & Kojo Larbi - New',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        direction: 'outgoing',
        timeLabel: '12:20 PM',
        callType: 'voice',
        subtitle: 'Project Coordination Call',
    },
    {
        id: 'call_boat_missed',
        name: 'Boat',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        direction: 'missed',
        timeLabel: '12:14 PM',
        callType: 'voice',
        subtitle: 'Field Operations Lead',
    },
    {
        id: 'call_boat_earlier',
        name: 'Boat',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        direction: 'incoming',
        timeLabel: '10:50 AM',
        callType: 'video',
        subtitle: 'Field Operations Lead',
    },
];

const INITIAL_COMMUNITIES: CommunityGroupItem[] = [
    {
        id: 'comm_christian_family',
        name: 'My Christian Family',
        avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150',
        subtitle: 'Faith, fellowship & daily encouragement community',
        groups: [
            {
                id: 'grp_cf_announcements',
                name: 'Announcements',
                isAnnouncement: true,
                lastPreview: '✓✓ You: https://www.facebook.com/sh...',
                dateLabel: '9/12/2025',
                messages: [
                    {
                        id: 'm1',
                        sender: 'You',
                        text: 'https://www.facebook.com/share/fellowship-stream — Weekly community prayer & announcements.',
                        time: '9:15 AM',
                    },
                ],
            },
            {
                id: 'grp_cf_main',
                name: 'My Christian Family',
                lastPreview: '✓✓ You: https://www.facebook.com/sha..',
                dateLabel: '9/12/2025',
                messages: [
                    {
                        id: 'm2',
                        sender: 'You',
                        text: 'https://www.facebook.com/share/sunday-message — Wishing everyone a blessed week ahead!',
                        time: '9:18 AM',
                    },
                ],
            },
            {
                id: 'grp_icon_connect',
                name: 'ICON CONNECT',
                lastPreview: 'You added this group to the community: ...',
                dateLabel: '9/9/2025',
                messages: [
                    {
                        id: 'm3',
                        sender: 'System',
                        text: 'You added this group to the community: ICON CONNECT Professional & Outreach Network.',
                        time: '4:30 PM',
                    },
                ],
            },
        ],
    },
];

const INITIAL_ARCHIVED_CHATS: ArchivedChatEntry[] = [
    {
        id: 'arch_kramo',
        name: 'KRAMO LABI FAMILY',
        avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
        lastMessage: 'ama: 🖼️ Photo',
        dateLabel: 'Tuesday',
        unreadCount: 41,
        subtitle: 'Family Group Chat • 28 members',
    },
    {
        id: 'arch_tony',
        name: 'Tony Adusei',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        lastMessage: '🖼️ Photo',
        dateLabel: '8/19/2026',
        unreadCount: 0,
        subtitle: 'Verified ConnectLn Contact',
    },
    {
        id: 'arch_florence',
        name: 'Florence Asare',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        lastMessage: 'You blocked this person',
        dateLabel: '8/1/2026',
        unreadCount: 0,
        isBlocked: true,
        subtitle: 'Archived Direct Contact',
    },
    {
        id: 'arch_nana',
        name: 'Nana Amma Gyameah Fa...',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        lastMessage: '+44 7830 097575 changed their phone n...',
        dateLabel: '7/22/2026',
        unreadCount: 0,
        subtitle: 'International Contact',
    },
];

const INITIAL_CHANNELS = [
    {
        id: 'chan_noctis_brief',
        name: 'Noctis Global Engineering & Trades Pulse',
        followers: 'Live industry & security news',
        avatar: '/brand/connectln-icon-256.png',
        lastUpdate: 'Loading latest news…',
        time: '',
        source: 'news' as PulseChannelSource,
    },
    {
        id: 'chan_connectln_jobs',
        name: 'ConnectLn Verified High-Priority Bounties',
        followers: 'Live jobs & contracts',
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
        lastUpdate: 'Loading latest bounties…',
        time: '',
        source: 'jobs' as PulseChannelSource,
    },
];

export function WhatsAppLeftIconRail({
    activeMode,
    onSelectMode,
    unreadChatsCount,
    unreadArchivedCount,
    todayCalendarCount,
    currentUserAvatar,
}: {
    activeMode: MessagingWorkspaceMode;
    onSelectMode: (mode: MessagingWorkspaceMode) => void;
    unreadChatsCount: number;
    unreadArchivedCount: number;
    todayCalendarCount?: number;
    currentUserAvatar?: string;
}) {
    const items: Array<{
        id: MessagingWorkspaceMode;
        label: string;
        shortLabel: string;
        badge?: number;
        dot?: boolean;
        icon: React.ReactNode;
    }> = [
        {
            id: 'chats',
            label: 'ConnectLn Inbox & Noctis AI',
            shortLabel: 'Inbox',
            badge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
            icon: (
                /* ConnectLn Bespoke Editorial Folio & Sealed Envelope Emblem */
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7.5L12 13l8.5-5.5" />
                    <polygon points="12 10.5 13.6 12.1 12 13.7 10.4 12.1" fill="currentColor" stroke="none" />
                    <line x1="7" y1="16.5" x2="17" y2="16.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            id: 'calls',
            label: 'ConnectLn Voice & Video Calls',
            shortLabel: 'Calls',
            icon: (
                /* ConnectLn Bespoke Acoustic Wave & Studio Capsule Emblem (non-WhatsApp) */
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <rect x="8.5" y="4" width="7" height="11" rx="3.5" />
                    <path strokeLinecap="round" d="M5 10v1.5a7 7 0 0 0 14 0V10" />
                    <line x1="12" y1="18.5" x2="12" y2="21" strokeLinecap="round" />
                    <line x1="8.5" y1="21" x2="15.5" y2="21" strokeLinecap="round" />
                    <line x1="3" y1="7.5" x2="3" y2="12.5" strokeLinecap="round" />
                    <line x1="21" y1="7.5" x2="21" y2="12.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            id: 'calendar',
            label: 'ConnectLn Calendar & Work Schedule (Day · Week · Month)',
            shortLabel: 'Calendar',
            badge: todayCalendarCount && todayCalendarCount > 0 ? todayCalendarCount : undefined,
            icon: (
                /* ConnectLn Bespoke Teams-Style Schedule Grid Emblem */
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
                    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
                    <line x1="8" y1="2.5" x2="8" y2="6" strokeLinecap="round" />
                    <line x1="16" y1="2.5" x2="16" y2="6" strokeLinecap="round" />
                    <rect x="7" y="12.5" width="3" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
                    <rect x="11.5" y="12.5" width="5.5" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
                    <line x1="7" y1="17.5" x2="13.5" y2="17.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            id: 'status',
            label: 'ConnectLn Status & 24h Chronicles',
            shortLabel: 'Status',
            dot: true,
            icon: (
                /* ConnectLn Bespoke 4-Pointed Starburst Compass Seal (replaces WhatsApp dashed circle) */
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.85}>
                    <polygon
                        points="12 2.5 14.4 9.6 21.5 12 14.4 14.4 12 21.5 9.6 14.4 2.5 12 9.6 9.6"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
                </svg>
            ),
        },
        {
            id: 'archived',
            label: 'ConnectLn Vault & Archived Folios',
            shortLabel: 'Vault',
            badge: unreadArchivedCount > 0 ? unreadArchivedCount : 1,
            icon: (
                /* ConnectLn Bespoke Editorial Vault Shield & Keyhole Folio */
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
                    <line x1="8" y1="3.5" x2="8" y2="20.5" />
                    <circle cx="14" cy="11" r="2" />
                    <path strokeLinecap="round" d="M14 13v2.5" />
                </svg>
            ),
        },
    ];

    return (
        <div className="w-full md:w-[68px] bg-[#F3EDE2] border-b md:border-b-0 md:border-r border-[#E0D6C5] flex md:flex-col items-center justify-between px-2 py-1.5 md:py-3 shrink-0 select-none">
            <div className="flex md:flex-col items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                {/* ConnectLn Official Crest Seal at top of rail */}
                <div
                    className="hidden md:flex flex-col items-center pb-2 mb-0.5 border-b border-[#E0D6C5] w-full"
                    title="ConnectLn Desk Note Suite"
                >
                    <div className="w-9 h-9 rounded-xl bg-[#292521] border border-[#7C4225] flex items-center justify-center shadow-2xs overflow-hidden">
                        <img
                            src="/brand/connectln-icon-256.png"
                            alt="ConnectLn"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                </div>

                {items.map((item) => {
                    const isActive = activeMode === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectMode(item.id)}
                            title={item.label}
                            className={`relative flex md:flex-col items-center justify-center gap-1 md:gap-0.5 px-2.5 md:px-1 h-9 md:h-12 md:w-13 rounded-xl transition-all cursor-pointer shrink-0 border ${
                                isActive
                                    ? 'bg-[#7C4225] border-[#5E3119] text-[#FBF8F3] font-bold shadow-2xs'
                                    : 'bg-transparent border-transparent text-[#57534E] hover:bg-[#E8D8C8]/75 hover:border-[#D0C4AE] hover:text-[#1C1917]'
                            }`}
                            style={isActive ? { color: '#FBF8F3' } : undefined}
                        >
                            {item.icon}
                            <span className="text-[10px] md:text-[9px] font-bold tracking-tight leading-none">
                                {item.shortLabel}
                            </span>
                            {typeof item.badge === 'number' && item.badge > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-md bg-[#7C4225] border border-[#FBF8F3] text-[9px] font-extrabold flex items-center justify-center shadow-2xs"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    {item.badge}
                                </span>
                            )}
                            {item.dot && !item.badge && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-md bg-[#7C4225] border border-[#FBF8F3] text-[8px] flex items-center justify-center leading-none"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    ✦
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="hidden md:flex flex-col items-center gap-1.5 pt-3 border-t border-[#E0D6C5] w-full">
                <button
                    type="button"
                    onClick={() => onSelectMode('status')}
                    title="My Status & Profile"
                    className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#7C4225] shadow-2xs cursor-pointer"
                >
                    <img
                        src={currentUserAvatar || '/brand/kwesi-avatar.png'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
            </div>
        </div>
    );
}

export function WhatsAppModeWorkspace({
    mode,
    currentUser,
    threads,
    archivedThreadIds,
    onUnarchiveThread,
    onSelectChatThread,
    onStartLiveCall,
    onOpenScheduleModal,
    invitees,
    onSendInvite,
    onCalendarCountChange,
    triggerToast,
}: {
    mode: Exclude<MessagingWorkspaceMode, 'chats'>;
    currentUser?: any;
    threads: B2BConversationThread[];
    archivedThreadIds: string[];
    onUnarchiveThread: (id: string) => void;
    onSelectChatThread: (threadId: string) => void;
    onStartLiveCall: (mode: 'audio' | 'video', targetName?: string) => void;
    onOpenScheduleModal: () => void;
    invitees?: MeetingInvitee[];
    onSendInvite?: (invitee: MeetingInvitee, text: string) => Promise<void> | void;
    onCalendarCountChange?: (count: number) => void;
    triggerToast: (msg: string) => void;
}) {
    const userAvatar = currentUser?.avatar || '/brand/kwesi-avatar.png';
    const userName = currentUser?.name || 'Kwesi Asiedu';
    const userEmail = String(currentUser?.email || '').trim().toLowerCase();
    const reactorKey = (userEmail || userName).toLowerCase().trim();
    const interactionsStorageKey = 'connectln_status_interactions_v1';

    const [statusInteractions, setStatusInteractions] = useState<Record<string, StatusSlideInteractions>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = window.localStorage.getItem(interactionsStorageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    });
    const [showStatusComments, setShowStatusComments] = useState<boolean>(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
    const lastStatusInteractionWriteMsRef = React.useRef<Record<string, number>>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(interactionsStorageKey, JSON.stringify(statusInteractions));
        } catch {}
    }, [statusInteractions]);

    // ---- STATUS STATE (Per-User Multi-Item Status Boxes) ----
    const statusStorageKey = `connectln_user_status_boxes_v4__${userName.toLowerCase().trim()}`;
    const [statusBoxes, setStatusBoxes] = useState<UserStatusBox[]>(() => {
        const seeded = groupSlidesToUserBoxes(INITIAL_STATUS_UPDATES, userName, userAvatar, userEmail);
        if (typeof window === 'undefined') return seeded;
        try {
            const raw = window.localStorage.getItem(statusStorageKey);
            if (!raw) return seeded;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return seeded;
            return seeded.map((box) => {
                const savedBox = parsed.find((b: any) => b?.userId === box.userId);
                if (!savedBox) return box;
                if (box.isCurrentUser && Array.isArray(savedBox.slides)) {
                    return {
                        ...box,
                        authorName: userName,
                        authorAvatar: userAvatar,
                        slides: savedBox.slides.filter(
                            (sl: any) =>
                                sl &&
                                typeof sl.id === 'string' &&
                                !String(sl.videoUrl || '').startsWith('blob:') &&
                                !String(sl.audioUrl || '').startsWith('blob:')
                        ),
                    };
                }
                const viewedIds = new Set(Array.isArray(savedBox.viewedIds) ? savedBox.viewedIds : []);
                return {
                    ...box,
                    slides: box.slides.map((sl) =>
                        viewedIds.has(sl.id) ? { ...sl, viewed: true } : sl
                    ),
                };
            });
        } catch {
            return seeded;
        }
    });

    // Hydrate shared cloud status items & interactions (comments + reactions) with live 15s polling
    useEffect(() => {
        if (mode !== 'status') return;
        let cancelled = false;
        const loadStatusFromCloud = async () => {
            try {
                const res = await fetch('/api/connectin/status', { cache: 'no-store' });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                const cloudInteractions = data?.interactions;
                if (cloudInteractions && typeof cloudInteractions === 'object') {
                    setStatusInteractions((prev) => {
                        const next = { ...prev };
                        for (const [sid, srv] of Object.entries<any>(cloudInteractions)) {
                            if (!sid || !srv || typeof srv !== 'object') continue;
                            const prevTs = Number(next[sid]?.updatedAtMs || 0);
                            const srvTs = Number(srv.updatedAtMs || 0);
                            const lastLocalWrite = lastStatusInteractionWriteMsRef.current[sid] || 0;
                            if (!next[sid] || srvTs >= prevTs || Date.now() - lastLocalWrite > 4000) {
                                next[sid] = {
                                    slideId: sid,
                                    reactions:
                                        srv.reactions && typeof srv.reactions === 'object' ? srv.reactions : {},
                                    comments: Array.isArray(srv.comments) ? srv.comments : [],
                                    updatedAtMs: srvTs,
                                };
                            }
                        }
                        return next;
                    });
                }

                const cloudItems: StatusUpdateItem[] = Array.isArray(data?.items) ? data.items : [];
                if (cloudItems.length === 0 || cancelled) return;

                const ownerSlug = userName.toLowerCase().trim();
                const ownerBoxes = new Map<string, { box: UserStatusBox; slides: StatusUpdateItem[] }>();
                const myCloudSlides: StatusUpdateItem[] = [];

                for (const raw of cloudItems) {
                    if (!raw || typeof raw.id !== 'string' || typeof raw.authorName !== 'string') continue;
                    const cleanAuthor = raw.authorName.replace(/\s*\(My Status\)\s*$/i, '').trim();
                    const slideEmail = String(raw.authorEmail || '').trim().toLowerCase();
                    const isMine = Boolean(
                        (userEmail && slideEmail && slideEmail === userEmail) ||
                        (!slideEmail && cleanAuthor.toLowerCase() === ownerSlug)
                    );
                    if (isMine) {
                        myCloudSlides.push({ ...raw, authorName: userName });
                    } else {
                        const targetUserId = `user_box_${cleanAuthor.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                        const existing = ownerBoxes.get(targetUserId);
                        const normalizedSlide = { ...raw, authorName: cleanAuthor };
                        if (existing) {
                            existing.slides.push(normalizedSlide);
                        } else {
                            ownerBoxes.set(targetUserId, {
                                box: {
                                    userId: targetUserId,
                                    authorName: cleanAuthor,
                                    authorAvatar: raw.authorAvatar || '/brand/kwesi-avatar.png',
                                    professionTag: raw.professionTag,
                                    isCurrentUser: false,
                                    slides: [],
                                },
                                slides: [normalizedSlide],
                            });
                        }
                    }
                }

                setStatusBoxes((prev) => {
                    const existingOtherIds = new Set<string>();
                    const updated = prev.map((box) => {
                        if (box.isCurrentUser) {
                            const existingMap = new Map(box.slides.map((s) => [s.id, s]));
                            for (const c of myCloudSlides) {
                                const prevCopy = existingMap.get(c.id);
                                if (
                                    !prevCopy ||
                                    (!prevCopy.embedUrl && c.embedUrl) ||
                                    (prevCopy.videoUrl === '/status-videos/spot.mp4' && Boolean(c.embedUrl))
                                ) {
                                    existingMap.set(c.id, prevCopy ? { ...c, viewed: prevCopy.viewed } : c);
                                }
                            }
                            const mergedSlides = Array.from(existingMap.values()).sort(
                                (a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0)
                            );
                            return { ...box, slides: mergedSlides };
                        }
                        existingOtherIds.add(box.userId);
                        const cloudMatch = ownerBoxes.get(box.userId);
                        if (!cloudMatch) return box;
                        const existingMap = new Map(box.slides.map((s) => [s.id, s]));
                        const nextSlides: StatusUpdateItem[] = [];
                        for (const c of cloudMatch.slides) {
                            const prevCopy = existingMap.get(c.id);
                            nextSlides.push(prevCopy ? { ...c, viewed: prevCopy.viewed } : c);
                        }
                        for (const s of box.slides) {
                            if (!cloudMatch.slides.some((c) => c.id === s.id)) {
                                nextSlides.push(s);
                            }
                        }
                        return { ...box, slides: nextSlides };
                    });

                    const newBoxes: UserStatusBox[] = [];
                    for (const [uid, entry] of ownerBoxes.entries()) {
                        if (!existingOtherIds.has(uid) && entry.slides.length > 0) {
                            newBoxes.push({ ...entry.box, slides: entry.slides });
                        }
                    }

                    if (newBoxes.length === 0) return updated;
                    const meIdx = updated.findIndex((b) => b.isCurrentUser);
                    if (meIdx >= 0) {
                        return [updated[meIdx], ...newBoxes, ...updated.filter((_, idx) => idx !== meIdx)];
                    }
                    return [...newBoxes, ...updated];
                });
            } catch {}
        };

        void loadStatusFromCloud();
        const intervalId = window.setInterval(() => {
            if (typeof document === 'undefined' || document.visibilityState === 'visible') {
                void loadStatusFromCloud();
            }
        }, 15000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [mode, userName, userEmail]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const serializable = statusBoxes.map((box) =>
                box.isCurrentUser
                    ? {
                          userId: box.userId,
                          slides: box.slides.filter(
                              (sl) =>
                                  !String(sl.videoUrl || '').startsWith('blob:') &&
                                  !String(sl.audioUrl || '').startsWith('blob:')
                          ),
                      }
                    : {
                          userId: box.userId,
                          viewedIds: box.slides.filter((sl) => sl.viewed).map((sl) => sl.id),
                      }
            );
            window.localStorage.setItem(statusStorageKey, JSON.stringify(serializable));
        } catch {
            // Ignore localStorage quota exceeded for large inline uploads
        }
    }, [statusBoxes, statusStorageKey]);

    const [activeStatusUserId, setActiveStatusUserId] = useState<string | null>('user_box_boat');
    const [activeStatusSlideIndex, setActiveStatusSlideIndex] = useState<number>(0);
    const [statusComposerMode, setStatusComposerMode] = useState<'series' | 'video' | 'photo' | 'info' | null>(null);
    const [isStatusAutoPlaying, setIsStatusAutoPlaying] = useState<boolean>(true);
    const [isStatusMuted, setIsStatusMuted] = useState<boolean>(false);
    const [activeClipPassIndex, setActiveClipPassIndex] = useState<number>(0);
    const [statusSlideProgress, setStatusSlideProgress] = useState<number>(0);
    const [isStatusCompletedForUser, setIsStatusCompletedForUser] = useState<boolean>(false);
    const [isStatusReplyFocused, setIsStatusReplyFocused] = useState<boolean>(false);
    const [statusReplayNonce, setStatusReplayNonce] = useState<number>(0);
    const [isResolvingLinks, setIsResolvingLinks] = useState<boolean>(false);
    const [activeVideoTiming, setActiveVideoTiming] = useState<{ currentSec: number; durationSec: number }>({
        currentSec: 0,
        durationSec: 0,
    });
    const activeStatusVideoRef = React.useRef<HTMLVideoElement | null>(null);
    const activeStatusAudioRef = React.useRef<HTMLAudioElement | null>(null);
    const [statusSourcePlatform, setStatusSourcePlatform] = useState<StatusSourcePlatform>('YouTube');
    const [seriesBatchUrlsText, setSeriesBatchUrlsText] = useState('');
    const [queuedSeriesItems, setQueuedSeriesItems] = useState<
        Array<{
            id: string;
            mediaType: 'video' | 'audio' | 'photo';
            name: string;
            title: string;
            caption?: string;
            url: string;
            embedUrl?: string;
            embedProvider?: SocialEmbedProvider;
            isVerticalEmbed?: boolean;
            posterUrl?: string;
            sourcePlatform: StatusSourcePlatform;
            mediaFormat: string;
            externalSourceUrl?: string;
        }>
    >([]);
    const [statusDraftTitle, setStatusDraftTitle] = useState('');
    const [statusDraftText, setStatusDraftText] = useState('');
    const [statusDraftInfoBadge, setStatusDraftInfoBadge] = useState('Project Update');
    const [statusDraftInfoDetails, setStatusDraftInfoDetails] = useState('');
    const [statusDraftAttachmentName, setStatusDraftAttachmentName] = useState('');
    const [statusDraftAttachmentUrl, setStatusDraftAttachmentUrl] = useState('');
    const [statusDraftImage, setStatusDraftImage] = useState(
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900'
    );
    const [statusDraftVideo, setStatusDraftVideo] = useState('/status-videos/physician.mp4');
    const [queuedPhotoUploads, setQueuedPhotoUploads] = useState<
        Array<{ id: string; name: string; dataUrl: string; mediaFormat: string }>
    >([]);
    const [queuedVideoUploads, setQueuedVideoUploads] = useState<
        Array<{ id: string; name: string; url: string; mediaFormat: string; mediaType: 'video' | 'audio' }>
    >([]);
    const [statusBgColor, setStatusBgColor] = useState(
        'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)'
    );
    const [statusReplyText, setStatusReplyText] = useState('');

    // Derived active Status Box & slide for automatic sequential per-user playback
    const topActiveStatusBox =
        mode === 'status' && !statusComposerMode
            ? statusBoxes.find((b) => b.userId === activeStatusUserId) || null
            : null;
    const topActiveSlides = topActiveStatusBox?.slides || [];
    const topSafeSlideIndex =
        topActiveSlides.length > 0
            ? Math.min(Math.max(activeStatusSlideIndex, 0), topActiveSlides.length - 1)
            : 0;
    const topActiveSlide = topActiveSlides[topSafeSlideIndex] || null;
    const topActiveSlideId = topActiveSlide?.id || '';
    const topActiveSlideMediaType = topActiveSlide?.mediaType || '';
    const topActiveSlideVideoUrl = topActiveSlide?.videoUrl || '';
    const topActiveSlideAudioUrl = topActiveSlide?.audioUrl || '';
    const topActiveSlideEmbedUrl =
        topActiveSlide?.embedUrl ||
        parseSocialVideoUrl(topActiveSlide?.externalSourceUrl || topActiveSlide?.videoUrl || '')?.embedUrl ||
        '';
    const topActiveSlideCount = topActiveSlides.length;

    useEffect(() => {
        setActiveVideoTiming({ currentSec: 0, durationSec: 0 });
        setActiveClipPassIndex(0);
    }, [topActiveStatusBox?.userId, topActiveSlideId, statusReplayNonce]);

    // Effect 1: Auto-advance Picture (10s) & Info (12s) status slides so users can read & enjoy comfortably (videos, embeds & music NEVER cut off early)
    useEffect(() => {
        if (
            mode !== 'status' ||
            statusComposerMode ||
            !topActiveStatusBox ||
            !topActiveSlide ||
            !isStatusAutoPlaying ||
            isStatusReplyFocused ||
            isStatusCompletedForUser
        ) {
            return;
        }
        if (
            topActiveSlideEmbedUrl ||
            (topActiveSlideMediaType === 'video' && topActiveSlideVideoUrl) ||
            (topActiveSlideMediaType === 'audio' && topActiveSlideAudioUrl)
        ) {
            return;
        }

        const DURATION_MS = topActiveSlideMediaType === 'info' ? 12000 : 10000;
        const TICK_MS = 100;
        const startOffsetPct = statusSlideProgress >= 99 ? 0 : statusSlideProgress;
        const startTime = Date.now() - (startOffsetPct / 100) * DURATION_MS;

        const timerId = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const nextPct = Math.min(100, (elapsed / DURATION_MS) * 100);
            if (nextPct >= 100) {
                window.clearInterval(timerId);
                if (topSafeSlideIndex < topActiveSlideCount - 1) {
                    setActiveStatusSlideIndex(topSafeSlideIndex + 1);
                    setStatusSlideProgress(0);
                } else {
                    setStatusSlideProgress(100);
                    setIsStatusAutoPlaying(false);
                    setIsStatusCompletedForUser(true);
                }
            } else {
                setStatusSlideProgress(nextPct);
            }
        }, TICK_MS);

        return () => window.clearInterval(timerId);
    }, [
        mode,
        statusComposerMode,
        topActiveStatusBox?.userId,
        topActiveSlideId,
        topActiveSlideMediaType,
        topActiveSlideVideoUrl,
        topActiveSlideAudioUrl,
        topActiveSlideEmbedUrl,
        topSafeSlideIndex,
        topActiveSlideCount,
        isStatusAutoPlaying,
        isStatusReplyFocused,
        isStatusCompletedForUser,
    ]);

    // Effect 2: Control active <video> and <audio> play / pause / mute / autoplay-fallback
    useEffect(() => {
        if (mode !== 'status' || statusComposerMode) return;
        if (topActiveSlideEmbedUrl) return;
        const mediaEl: HTMLMediaElement | null =
            topActiveSlideMediaType === 'audio'
                ? activeStatusAudioRef.current
                : activeStatusVideoRef.current;
        if (!mediaEl) return;
        if (topActiveSlideMediaType === 'video' && !topActiveSlideVideoUrl) return;
        if (topActiveSlideMediaType === 'audio' && !topActiveSlideAudioUrl) return;
        if (topActiveSlideMediaType !== 'video' && topActiveSlideMediaType !== 'audio') return;

        mediaEl.muted = isStatusMuted;

        if (isStatusAutoPlaying && !isStatusReplyFocused && !isStatusCompletedForUser) {
            const playPromise = mediaEl.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    mediaEl.muted = true;
                    setIsStatusMuted(true);
                    mediaEl.play().catch(() => {});
                });
            }
        } else {
            mediaEl.pause();
        }
    }, [
        mode,
        statusComposerMode,
        topActiveStatusBox?.userId,
        topActiveSlideId,
        topActiveSlideMediaType,
        topActiveSlideVideoUrl,
        topActiveSlideAudioUrl,
        isStatusAutoPlaying,
        isStatusMuted,
        isStatusReplyFocused,
        isStatusCompletedForUser,
        statusReplayNonce,
    ]);

    // ---- CALLS STATE ----
    const [callLogs, setCallLogs] = useState<CallLogEntry[]>(() => {
        if (typeof window === 'undefined') return INITIAL_CALL_LOGS;
        try {
            const raw = window.localStorage.getItem('connectln_studio_call_logs_v1');
            const parsed = raw ? JSON.parse(raw) : null;
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CALL_LOGS;
        } catch {
            return INITIAL_CALL_LOGS;
        }
    });
    const [callSearch, setCallSearch] = useState('');
    const [callsSidebarTab, setCallsSidebarTab] = useState<'calls' | 'voicemail'>('calls');
    const [unreadVoicemailsCount, setUnreadVoicemailsCount] = useState(0);
    const callSearchInputRef = React.useRef<HTMLInputElement | null>(null);
    const [generatedCallLink, setGeneratedCallLink] = useState<string | null>(null);
    const [showAddFavoriteModal, setShowAddFavoriteModal] = useState(false);
    const [activeSoftphoneTarget, setActiveSoftphoneTarget] = useState<{
        label: string;
        phone?: string;
        avatar?: string;
    } | null>(null);
    const [activeWhatsAppCall, setActiveWhatsAppCall] = useState<{
        callId: string;
        label: string;
        phone?: string;
        avatar?: string;
        mode: 'audio' | 'video';
    } | null>(null);
    const [selectedRingtoneId, setSelectedRingtoneId] = useState<ConnectLnRingtoneId>(() =>
        getSelectedConnectLnRingtoneId()
    );
    const [customRingtoneName, setCustomRingtoneName] = useState<string>(() =>
        getCustomDeviceRingtoneName()
    );
    const ringtoneUploadInputRef = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem('connectln_studio_call_logs_v1', JSON.stringify(callLogs.slice(0, 40)));
        } catch {}
    }, [callLogs]);

    const [myVerifiedCallerPhone, setMyVerifiedCallerPhone] = useState<string>(
        () => ((currentUser as any)?.phone ? String((currentUser as any).phone) : '')
    );

    const ensureVerifiedCallerBeforeCalling = (): boolean => {
        const storedLinked =
            typeof window !== 'undefined'
                ? window.localStorage.getItem('connectln_my_whatsapp_phone_v1') || ''
                : '';
        const hasVerified = Boolean(
            myVerifiedCallerPhone || (currentUser as any)?.phone || storedLinked
        );
        if (!hasVerified) {
            triggerToast(
                '🔒 Please verify your mobile number via 2FA at the top card to enable calling on ConnectLn.'
            );
            return false;
        }
        return true;
    };

    const resolveDialTarget = (raw: string): string => {
        const clean = raw.trim();
        if (!clean) return '';
        if (clean.startsWith('@') || clean.startsWith('+') || /[a-zA-Z]/.test(clean)) {
            return clean;
        }
        return buildInternationalPhone('+1', clean) || clean;
    };

    const launchWhatsAppDirectCall = (
        rawTarget: string,
        callMode: 'audio' | 'video',
        avatarOverride?: string
    ) => {
        if (!ensureVerifiedCallerBeforeCalling()) return;
        const clean = resolveDialTarget(rawTarget);
        if (!clean) return;
        const isNum = looksLikeClientPhone(clean);
        const displayLabel = isNum ? prettyClientPhone(clean) : clean;
        const avatar =
            avatarOverride ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clean)}&backgroundColor=7c4225`;

        setCallLogs((prev) => [
            {
                id: `call_wa_${Date.now()}`,
                name: displayLabel,
                avatar,
                direction: 'outgoing',
                timeLabel: 'Just now',
                callType: callMode === 'video' ? 'video' : 'voice',
                subtitle: isNum ? 'ConnectLn Direct E2EE Call' : 'ConnectLn Direct Voice/Video',
            },
            ...prev.filter((c) => c.name !== displayLabel),
        ]);

        setActiveWhatsAppCall({
            callId: `wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
            label: displayLabel,
            phone: isNum ? clean : undefined,
            avatar,
            mode: callMode,
        });
        startOutgoingCallerRingbackTone();
    };

    const launchSmartVoiceCall = async (rawTarget: string, avatarOverride?: string) => {
        if (!ensureVerifiedCallerBeforeCalling()) return;
        const clean = resolveDialTarget(rawTarget);
        if (!clean) return;
        // 100% Free Internet Voice Call ($0.00 Twilio cost) + User-Borne SIM/SMS Handoff inside the call screen
        launchWhatsAppDirectCall(clean, 'audio', avatarOverride);
    };

    const launchCellPhoneCall = (rawTarget: string, avatarOverride?: string) => {
        if (!ensureVerifiedCallerBeforeCalling()) return;
        const clean = rawTarget.trim();
        if (!clean) return;
        const isNum = looksLikeClientPhone(clean);
        const displayLabel = isNum ? prettyClientPhone(clean) : clean;
        const avatar =
            avatarOverride ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clean)}&backgroundColor=7c4225`;

        setCallLogs((prev) => [
            {
                id: `call_dial_${Date.now()}`,
                name: displayLabel,
                avatar,
                direction: 'outgoing',
                timeLabel: 'Just now',
                callType: 'voice',
                subtitle: isNum ? 'Mobile Carrier Call' : 'ConnectLn & Mobile Bridge',
            },
            ...prev.filter((c) => c.name !== displayLabel),
        ]);

        setActiveSoftphoneTarget({
            label: displayLabel,
            phone: isNum ? clean : undefined,
            avatar,
        });
    };

    // ---- COMMUNITIES STATE ----
    const [communities, setCommunities] = useState<CommunityGroupItem[]>(INITIAL_COMMUNITIES);
    const [selectedCommunityGroup, setSelectedCommunityGroup] = useState<{
        communityId: string;
        groupId: string;
    } | null>(null);
    const [showNewCommunityModal, setShowNewCommunityModal] = useState(false);
    const [newCommName, setNewCommName] = useState('');
    const [newCommDesc, setNewCommDesc] = useState('');
    const [commMessageInput, setCommMessageInput] = useState('');

    // ---- ARCHIVED STATE ----
    const [presetArchived, setPresetArchived] = useState<ArchivedChatEntry[]>(INITIAL_ARCHIVED_CHATS);
    const [selectedArchivedId, setSelectedArchivedId] = useState<string | null>(null);
    const [archivedReplyInput, setArchivedReplyInput] = useState('');

    // ---- CHANNELS STATE ----
    const [channels, setChannels] = useState(INITIAL_CHANNELS);
    // Live previews: show each channel's newest real post in the list
    useEffect(() => {
        if (mode !== 'channels') return;
        let cancelled = false;
        INITIAL_CHANNELS.forEach((ch) => {
            fetchPulseChannelPosts(ch.source)
                .then((posts) => {
                    if (cancelled || posts.length === 0) return;
                    setChannels((prev) =>
                        prev.map((c) => (c.id === ch.id ? { ...c, lastUpdate: posts[0].title } : c))
                    );
                })
                .catch(() => {
                    if (cancelled) return;
                    setChannels((prev) =>
                        prev.map((c) => (c.id === ch.id ? { ...c, lastUpdate: 'Tap to retry loading updates' } : c))
                    );
                });
        });
        return () => {
            cancelled = true;
        };
    }, [mode]);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

    // =========================================================================
    // 0. CALENDAR VIEW (Microsoft Teams-Style Work Schedule & Shift Planner)
    // =========================================================================
    if (mode === 'calendar') {
        return (
            <ConnectLnTeamsCalendarView
                currentUser={currentUser}
                threads={threads}
                invitees={invitees || []}
                onStartLiveCall={onStartLiveCall}
                onSelectChatThread={onSelectChatThread}
                onSendInvite={onSendInvite}
                onEventsCountChange={onCalendarCountChange}
                triggerToast={triggerToast}
            />
        );
    }

    // =========================================================================
    // 1. STATUS VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    if (mode === 'status') {
        const myStatusBox = statusBoxes.find((b) => b.isCurrentUser) || statusBoxes[0];
        const otherBoxes = statusBoxes.filter((b) => !b.isCurrentUser);
        const recentBoxes = otherBoxes.filter((b) => b.slides.some((sl) => !sl.viewed));
        const viewedBoxes = otherBoxes.filter((b) => b.slides.length > 0 && b.slides.every((sl) => sl.viewed));
        const activeUserBox = statusBoxes.find((b) => b.userId === activeStatusUserId) || null;
        const activeUserSlides = activeUserBox?.slides || [];
        const safeSlideIndex =
            activeUserSlides.length > 0
                ? Math.min(Math.max(activeStatusSlideIndex, 0), activeUserSlides.length - 1)
                : 0;
        const activeSlide = activeUserSlides[safeSlideIndex] || null;
        const totalUploadedItems = statusBoxes.reduce((acc, b) => acc + b.slides.length, 0);

        const handleOpenUserStatusBox = (box: UserStatusBox, startSlideIdx = 0) => {
            setActiveStatusUserId(box.userId);
            setActiveStatusSlideIndex(startSlideIdx);
            setActiveClipPassIndex(0);
            setStatusSlideProgress(0);
            setIsStatusCompletedForUser(false);
            setIsStatusAutoPlaying(true);
            setStatusReplayNonce((n) => n + 1);
            setStatusComposerMode(null);
            setStatusBoxes((prev) =>
                prev.map((b) =>
                    b.userId === box.userId
                        ? { ...b, slides: b.slides.map((sl) => ({ ...sl, viewed: true })) }
                        : b
                )
            );
        };

        const handleStepWithinUserBox = (delta: number) => {
            if (!activeUserBox || activeUserBox.slides.length === 0) return;
            const nextIdx = safeSlideIndex + delta;
            if (nextIdx < 0 || nextIdx >= activeUserBox.slides.length) return;
            setActiveStatusSlideIndex(nextIdx);
            setActiveClipPassIndex(0);
            setStatusSlideProgress(0);
            setIsStatusCompletedForUser(false);
            setIsStatusAutoPlaying(true);
        };

        const handleSelectSlideInUserBox = (idx: number) => {
            if (!activeUserBox || idx < 0 || idx >= activeUserBox.slides.length) return;
            setActiveStatusSlideIndex(idx);
            setActiveClipPassIndex(0);
            setStatusSlideProgress(0);
            setIsStatusCompletedForUser(false);
            setIsStatusAutoPlaying(true);
            setStatusReplayNonce((n) => n + 1);
        };

        const handleReplayUserBox = () => {
            if (!activeUserBox || activeUserBox.slides.length === 0) return;
            setActiveStatusSlideIndex(0);
            setActiveClipPassIndex(0);
            setStatusSlideProgress(0);
            setIsStatusCompletedForUser(false);
            setIsStatusAutoPlaying(true);
            setStatusReplayNonce((n) => n + 1);
        };

        const handleDeleteMySlide = (slideId: string) => {
            setStatusBoxes((prev) =>
                prev.map((b) =>
                    b.isCurrentUser ? { ...b, slides: b.slides.filter((sl) => sl.id !== slideId) } : b
                )
            );
            setActiveStatusSlideIndex(0);
            fetch(`/api/connectin/status?id=${encodeURIComponent(slideId)}`, {
                method: 'DELETE',
            }).catch(() => {});
            triggerToast('🗑️ Removed status item from My Status Box.');
        };

        const handleToggleStatusReaction = async (slideId: string, emoji: string, boxAuthorName: string) => {
            if (!slideId || !emoji) return;
            lastStatusInteractionWriteMsRef.current[slideId] = Date.now();
            let wasAdded = false;
            setStatusInteractions((prev) => {
                const current = prev[slideId] || {
                    slideId,
                    reactions: {},
                    comments: [],
                    updatedAtMs: 0,
                };
                const nextReactions = { ...current.reactions };
                const list = Array.isArray(nextReactions[emoji]) ? [...nextReactions[emoji]] : [];
                const idx = list.indexOf(reactorKey);
                if (idx >= 0) {
                    list.splice(idx, 1);
                } else {
                    list.push(reactorKey);
                    wasAdded = true;
                }
                if (list.length > 0) {
                    nextReactions[emoji] = list;
                } else {
                    delete nextReactions[emoji];
                }
                return {
                    ...prev,
                    [slideId]: {
                        ...current,
                        reactions: nextReactions,
                        updatedAtMs: Date.now(),
                    },
                };
            });

            triggerToast(
                wasAdded
                    ? `${emoji} Reacted to ${boxAuthorName}'s status`
                    : `Removed ${emoji} reaction`
            );

            try {
                const res = await fetch('/api/connectin/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'react',
                        slideId,
                        emoji,
                        userName,
                        userEmail: userEmail || undefined,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.interactions) {
                        setStatusInteractions((prev) => ({
                            ...prev,
                            [slideId]: data.interactions,
                        }));
                    }
                }
            } catch {}
        };

        const handleSubmitStatusComment = async (slideId: string, boxAuthorName: string) => {
            const cleanText = statusReplyText.trim();
            if (!slideId || !cleanText || isSubmittingComment) return;
            lastStatusInteractionWriteMsRef.current[slideId] = Date.now();
            const nowStamp = `Today at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            const optimisticComment: StatusCommentItem = {
                id: `sc_local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                slideId,
                authorName: userName,
                authorEmail: userEmail || undefined,
                authorAvatar: userAvatar,
                text: cleanText,
                timestampLabel: nowStamp,
                createdAtMs: Date.now(),
            };

            setStatusReplyText('');
            setShowStatusComments(true);
            setStatusInteractions((prev) => {
                const current = prev[slideId] || {
                    slideId,
                    reactions: {},
                    comments: [],
                    updatedAtMs: 0,
                };
                return {
                    ...prev,
                    [slideId]: {
                        ...current,
                        comments: [...current.comments, optimisticComment],
                        updatedAtMs: Date.now(),
                    },
                };
            });

            setIsSubmittingComment(true);
            try {
                const res = await fetch('/api/connectin/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'comment',
                        slideId,
                        text: cleanText,
                        authorName: userName,
                        authorEmail: userEmail || undefined,
                        authorAvatar: userAvatar,
                        timestampLabel: nowStamp,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.interactions) {
                        setStatusInteractions((prev) => ({
                            ...prev,
                            [slideId]: data.interactions,
                        }));
                    }
                    triggerToast(`💬 Comment posted on ${boxAuthorName}'s Status`);
                } else {
                    triggerToast('⚠️ Comment saved locally (cloud sync retry needed).');
                }
            } catch {
                triggerToast('⚠️ Comment saved locally (offline).');
            } finally {
                setIsSubmittingComment(false);
            }
        };

        const handleDeleteStatusComment = async (slideId: string, commentId: string) => {
            lastStatusInteractionWriteMsRef.current[slideId] = Date.now();
            setStatusInteractions((prev) => {
                const current = prev[slideId];
                if (!current) return prev;
                return {
                    ...prev,
                    [slideId]: {
                        ...current,
                        comments: current.comments.filter((c) => c.id !== commentId),
                        updatedAtMs: Date.now(),
                    },
                };
            });

            try {
                const res = await fetch('/api/connectin/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete_comment',
                        slideId,
                        commentId,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.interactions) {
                        setStatusInteractions((prev) => ({
                            ...prev,
                            [slideId]: data.interactions,
                        }));
                    }
                }
            } catch {}
        };

        const readCompactImageDataUrl = (file: File): Promise<string> =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const rawResult = String(reader.result || '');
                    if (!rawResult || typeof window === 'undefined') {
                        resolve(rawResult);
                        return;
                    }
                    const img = new Image();
                    img.onload = () => {
                        const maxDim = 1100;
                        const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
                        const w = Math.max(1, Math.round(img.width * scale));
                        const h = Math.max(1, Math.round(img.height * scale));
                        const canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            resolve(rawResult);
                            return;
                        }
                        ctx.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', 0.84));
                    };
                    img.onerror = () => resolve(rawResult);
                    img.src = rawResult;
                };
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
            });

        const handlePhotoFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const converted = await Promise.all(
                files.map(async (f, idx) => ({
                    id: `q_img_${Date.now()}_${idx}`,
                    name: f.name,
                    dataUrl: await readCompactImageDataUrl(f),
                    mediaFormat: detectMediaFormatLabel(f.name || f.type, 'JPG'),
                }))
            );
            setQueuedPhotoUploads((prev) => [...prev, ...converted.filter((x) => Boolean(x.dataUrl))]);
            e.target.value = '';
        };

        const handleVideoFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const uploaded = files.map((f, idx) => {
                const isAudio = isAudioFileOrUrl(f.name, f.type);
                return {
                    id: `q_vid_${Date.now()}_${idx}`,
                    name: f.name,
                    url: URL.createObjectURL(f),
                    mediaType: (isAudio ? 'audio' : 'video') as 'video' | 'audio',
                    mediaFormat: detectMediaFormatLabel(f.name || f.type, isAudio ? 'MP3' : 'MP4'),
                };
            });
            setQueuedVideoUploads((prev) => [...prev, ...uploaded]);
            e.target.value = '';
        };

        const handleSeriesMixedFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const nextItems: typeof queuedSeriesItems = [];
            for (let idx = 0; idx < files.length; idx++) {
                const f = files[idx];
                const isAudioFile = isAudioFileOrUrl(f.name, f.type);
                const isVideoFile =
                    !isAudioFile &&
                    (f.type.startsWith('video/') ||
                        /\.(mp4|mov|webm|mkv|avi|m4v|3gp|3g2|mpeg|mpg|ogv|flv|wmv)$/i.test(f.name));
                const inferredPlatform = inferPlatformFromHint(f.name, statusSourcePlatform);
                const formatLabel = detectMediaFormatLabel(
                    f.name || f.type,
                    isAudioFile ? 'MP3' : isVideoFile ? 'MP4' : 'JPG'
                );
                if (isAudioFile) {
                    nextItems.push({
                        id: `q_ser_${Date.now()}_${idx}`,
                        mediaType: 'audio',
                        name: f.name,
                        title: f.name.replace(/\.[^/.]+$/, ''),
                        url: URL.createObjectURL(f),
                        sourcePlatform: inferredPlatform,
                        mediaFormat: formatLabel,
                    });
                } else if (isVideoFile) {
                    nextItems.push({
                        id: `q_ser_${Date.now()}_${idx}`,
                        mediaType: 'video',
                        name: f.name,
                        title: f.name.replace(/\.[^/.]+$/, ''),
                        url: URL.createObjectURL(f),
                        sourcePlatform: inferredPlatform,
                        mediaFormat: formatLabel,
                    });
                } else {
                    const dataUrl = await readCompactImageDataUrl(f);
                    if (dataUrl) {
                        nextItems.push({
                            id: `q_ser_${Date.now()}_${idx}`,
                            mediaType: 'photo',
                            name: f.name,
                            title: f.name.replace(/\.[^/.]+$/, ''),
                            url: dataUrl,
                            sourcePlatform: inferredPlatform,
                            mediaFormat: formatLabel,
                        });
                    }
                }
            }
            if (nextItems.length > 0) {
                setQueuedSeriesItems((prev) => [...prev, ...nextItems]);
                triggerToast(`🎞️ Added ${nextItems.length} file${nextItems.length > 1 ? 's' : ''} to your training/music queue.`);
            }
            e.target.value = '';
        };

        const resolveLinksBatch = async (rawLines: string[]): Promise<typeof queuedSeriesItems> => {
            if (!rawLines.length) return [];
            let serverResolved: any[] = [];
            try {
                const res = await fetch('/api/connectin/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'resolve', urls: rawLines }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data?.resolved)) {
                        serverResolved = data.resolved;
                    }
                }
            } catch {}

            const results: typeof queuedSeriesItems = [];
            rawLines.forEach((rawLine, idx) => {
                const { url: cleanUrl, customTitle } = splitLinkAndCustomTitle(rawLine);
                if (!cleanUrl) return;
                const srv = serverResolved[idx];
                const parsed =
                    srv?.ok && srv?.provider
                        ? srv
                        : parseSocialVideoUrl(cleanUrl);

                if (parsed) {
                    const platform: StatusSourcePlatform = parsed.platform || inferPlatformFromHint(cleanUrl, statusSourcePlatform);
                    const finalTitle =
                        customTitle ||
                        (typeof parsed.title === 'string' && parsed.title.trim()) ||
                        `${platform} ${parsed.isVertical ? 'Video Reel' : 'Video'}`;
                    const authorNote =
                        typeof parsed.authorName === 'string' && parsed.authorName.trim()
                            ? ` · by ${parsed.authorName.trim()}`
                            : '';
                    results.push({
                        id: `q_url_${Date.now()}_${idx}`,
                        mediaType: 'video',
                        name: finalTitle,
                        title: finalTitle,
                        caption: `Shared ${platform} video (${parsed.formatLabel})${authorNote}`,
                        url: parsed.canonicalUrl || parsed.originalUrl || cleanUrl,
                        embedUrl: parsed.embedUrl || undefined,
                        embedProvider: parsed.provider,
                        isVerticalEmbed: Boolean(parsed.isVertical),
                        posterUrl: parsed.thumbnailUrl || undefined,
                        sourcePlatform: platform,
                        mediaFormat: parsed.formatLabel || platform.toUpperCase(),
                        externalSourceUrl: parsed.originalUrl || cleanUrl,
                    });
                    return;
                }

                const detectedPlatform = inferPlatformFromHint(cleanUrl, statusSourcePlatform);
                const isAudio = isAudioFileOrUrl(cleanUrl);
                const isImageExt = /\.(jpg|jpeg|png|webp|gif|avif|heic|heif|bmp|svg|jfif)(\?|$)/i.test(cleanUrl);
                const isExplicitVideoExt = /\.(mp4|mov|webm|mkv|avi|m4v|3gp|mpeg|mpg|ogv|flv|wmv)(\?|$)/i.test(cleanUrl);
                const isUnsupportedSocialLink =
                    !isAudio &&
                    !isImageExt &&
                    !isExplicitVideoExt &&
                    /https?:\/\/([^/]+\.)?(youtube\.com|youtu\.be|facebook\.com|fb\.watch|tiktok\.com)/i.test(cleanUrl);
                if (isUnsupportedSocialLink) {
                    triggerToast(
                        '⚠️ Please paste a valid YouTube video/Shorts/Music Playlist, Facebook Video/Reel, or TikTok Video URL.'
                    );
                    return;
                }
                const isPhoto = !isAudio && isImageExt && !isExplicitVideoExt;
                const fallbackVideoPreset = STATUS_VIDEO_PRESETS[idx % STATUS_VIDEO_PRESETS.length];
                const fallbackPhotoPreset = STATUS_PHOTO_PRESETS[idx % STATUS_PHOTO_PRESETS.length];
                const formatLabel = isAudio
                    ? detectMediaFormatLabel(cleanUrl, 'MP3')
                    : isPhoto
                    ? detectMediaFormatLabel(cleanUrl, 'WEBP')
                    : detectMediaFormatLabel(cleanUrl, 'MP4');

                results.push({
                    id: `q_url_${Date.now()}_${idx}`,
                    mediaType: isAudio ? 'audio' : isPhoto ? 'photo' : 'video',
                    name: customTitle || `${detectedPlatform} ${isAudio ? 'Music' : 'Media'} #${idx + 1}`,
                    title:
                        customTitle ||
                        `${detectedPlatform} ${isAudio ? 'Full Music Track' : `Status ${isPhoto ? 'Picture' : 'Clip'}`} #${idx + 1}`,
                    caption: `Imported ${detectedPlatform} ${isAudio ? 'full-length music track' : isPhoto ? 'visual' : 'clip'} (${formatLabel})`,
                    url: isAudio
                        ? cleanUrl
                        : isPhoto
                        ? isImageExt
                            ? cleanUrl
                            : fallbackPhotoPreset.imageUrl
                        : isExplicitVideoExt
                        ? cleanUrl
                        : fallbackVideoPreset.videoUrl,
                    posterUrl: !isPhoto ? fallbackVideoPreset.posterUrl : undefined,
                    sourcePlatform: detectedPlatform,
                    mediaFormat: formatLabel,
                    externalSourceUrl: cleanUrl,
                });
            });

            return results;
        };

        const handleAddSocialLinksToSeries = async () => {
            const lines = seriesBatchUrlsText
                .split(/[\r\n]+/)
                .map((l) => l.trim())
                .filter(Boolean);
            if (!lines.length || isResolvingLinks) return;
            setIsResolvingLinks(true);
            try {
                const imported = await resolveLinksBatch(lines);
                if (imported.length > 0) {
                    setQueuedSeriesItems((prev) => [...prev, ...imported]);
                    setSeriesBatchUrlsText('');
                    triggerToast(
                        `✅ Added ${imported.length} playable video link${imported.length > 1 ? 's' : ''} to your queue!`
                    );
                }
            } finally {
                setIsResolvingLinks(false);
            }
        };

        const handleApplyTrainingSeriesPreset = (platform: 'WhatsApp' | 'TikTok' | 'Facebook') => {
            setStatusSourcePlatform(platform);
            const now = Date.now();
            if (platform === 'WhatsApp') {
                setQueuedSeriesItems((prev) => [
                    ...prev,
                    {
                        id: `pre_wa_1_${now}`,
                        mediaType: 'video',
                        name: 'OSHA_30_Structural_Rigging_Training.mp4',
                        title: 'OSHA 30 Structural Rigging & Field Commissioning',
                        caption: 'Full-length WhatsApp trade crew safety & rigging inspection training video.',
                        url: '/status-videos/spot.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
                        sourcePlatform: 'WhatsApp',
                        mediaFormat: 'MP4',
                    },
                    {
                        id: `pre_wa_2_${now}`,
                        mediaType: 'photo',
                        name: 'Solar_Microgrid_IV_Curve_Diagram.webp',
                        title: 'NABCEP 480V Solar Microgrid Switchgear Layout',
                        caption: 'High-voltage inverter & feeder array field visual from WhatsApp Trade Desk.',
                        url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900',
                        sourcePlatform: 'WhatsApp',
                        mediaFormat: 'WEBP',
                    },
                    {
                        id: `pre_wa_3_${now}`,
                        mediaType: 'video',
                        name: 'MEP_Cost_Estimation_Training.3gp',
                        title: 'Commercial Blueprint Quantity Takeoff & Estimating',
                        caption: 'Step-by-step MEP tender estimation walkthrough shared via WhatsApp Training Group.',
                        url: '/status-videos/calc.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900',
                        sourcePlatform: 'WhatsApp',
                        mediaFormat: '3GP',
                    },
                ]);
            } else if (platform === 'TikTok') {
                setQueuedSeriesItems((prev) => [
                    ...prev,
                    {
                        id: `pre_tt_1_${now}`,
                        mediaType: 'video',
                        name: 'ZeroTrust_Kubernetes_eBPF_Lab.mp4',
                        title: 'Zero-Trust Kubernetes & eBPF Threat Containment',
                        caption: 'Hands-on SOC & DevSecOps runtime training reel from TikTok Tech Academy.',
                        url: '/status-videos/k8s_ebpf.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
                        sourcePlatform: 'TikTok',
                        mediaFormat: 'MP4 (9:16)',
                    },
                    {
                        id: `pre_tt_2_${now}`,
                        mediaType: 'photo',
                        name: 'Autonomous_SOC_Telemetry_Diagram.png',
                        title: 'Autonomous SOC & NIST SP 800-207 Topology',
                        caption: 'Visual reference schematic for runtime workload containment & detection rules.',
                        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
                        sourcePlatform: 'TikTok',
                        mediaFormat: 'PNG',
                    },
                    {
                        id: `pre_tt_3_${now}`,
                        mediaType: 'video',
                        name: 'Agentic_AI_Workforce_Training.mov',
                        title: 'AI Agentic Career Flywheel & Technical Architecture',
                        caption: 'Practical AI systems orchestration training clip imported from TikTok Creator Studio.',
                        url: '/status-videos/agentic_flywheel.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900',
                        sourcePlatform: 'TikTok',
                        mediaFormat: 'MOV',
                    },
                ]);
            } else {
                setQueuedSeriesItems((prev) => [
                    ...prev,
                    {
                        id: `pre_fb_1_${now}`,
                        mediaType: 'video',
                        name: 'Clinical_Biomedical_Triage_Training.mp4',
                        title: 'Acute Trauma Triage & Biomedical Diagnostics Lab',
                        caption: 'Continuing medical & clinical lab workflow training shared from Facebook Clinical Guild.',
                        url: '/status-videos/physician.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900',
                        sourcePlatform: 'Facebook',
                        mediaFormat: 'MP4 (HD)',
                    },
                    {
                        id: `pre_fb_2_${now}`,
                        mediaType: 'photo',
                        name: 'Workshop_CNC_Metrology_Calibration.jpg',
                        title: '5-Axis CNC Fabrication & Torque Inspection Bench',
                        caption: 'Precision manufacturing & shop certification visual imported from Facebook Industrial Group.',
                        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
                        sourcePlatform: 'Facebook',
                        mediaFormat: 'JPG',
                    },
                    {
                        id: `pre_fb_3_${now}`,
                        mediaType: 'video',
                        name: 'PLC_Automation_Systems_Drill.webm',
                        title: 'PLC Automation & SCADA Controller Verification',
                        caption: 'Industrial SCADA & Modbus commissioning training series from Facebook Engineering Hub.',
                        url: '/status-videos/developer.mp4',
                        posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
                        sourcePlatform: 'Facebook',
                        mediaFormat: 'WEBM',
                    },
                ]);
            }
            triggerToast(`🎞️ Loaded 3-part ${platform} professional training series into queue!`);
        };

        const handleMoveQueuedSeriesItem = (index: number, delta: -1 | 1) => {
            setQueuedSeriesItems((prev) => {
                const target = index + delta;
                if (target < 0 || target >= prev.length) return prev;
                const copy = [...prev];
                const [item] = copy.splice(index, 1);
                copy.splice(target, 0, item);
                return copy;
            });
        };

        const handleAttachmentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setStatusDraftAttachmentName(file.name);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setStatusDraftAttachmentUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };

        const handlePublishStatus = async (e: React.FormEvent) => {
            e.preventDefault();
            const nowStamp = `Today at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            const createdSlides: StatusUpdateItem[] = [];
            const nowMs = Date.now();
            const randTag = () => Math.random().toString(36).slice(2, 6);

            if (statusComposerMode === 'series') {
                let effectiveItems = [...queuedSeriesItems];
                if (seriesBatchUrlsText.trim()) {
                    setIsResolvingLinks(true);
                    try {
                        const lines = seriesBatchUrlsText
                            .split(/[\r\n]+/)
                            .map((l) => l.trim())
                            .filter(Boolean);
                        const resolved = await resolveLinksBatch(lines);
                        effectiveItems = [...effectiveItems, ...resolved];
                    } finally {
                        setIsResolvingLinks(false);
                    }
                }
                if (effectiveItems.length === 0) return;
                const total = effectiveItems.length;
                effectiveItems.forEach((item, idx) => {
                    createdSlides.push({
                        id: `st_pub_${nowMs}_${idx}_${randTag()}`,
                        authorName: userName,
                        authorEmail: userEmail || undefined,
                        authorAvatar: userAvatar,
                        timestampLabel: nowStamp,
                        createdAtMs: nowMs - idx,
                        viewed: false,
                        mediaType: item.mediaType,
                        title: statusDraftTitle.trim() || item.title || item.name,
                        videoTitle: item.mediaType !== 'photo' ? (statusDraftTitle.trim() || item.title || item.name) : undefined,
                        videoUrl: item.mediaType === 'video' ? item.url : undefined,
                        audioUrl: item.mediaType === 'audio' ? item.url : undefined,
                        embedUrl: item.embedUrl,
                        embedProvider: item.embedProvider,
                        isVerticalEmbed: item.isVerticalEmbed,
                        imageUrl: item.mediaType === 'photo' ? item.url : item.posterUrl,
                        videoDuration:
                            item.embedUrl
                                ? item.sourcePlatform
                                : item.mediaType === 'video'
                                ? 'Full Clip'
                                : item.mediaType === 'audio'
                                ? 'Full Song'
                                : undefined,
                        text:
                            statusDraftText.trim() ||
                            item.caption ||
                            `${item.sourcePlatform} ${item.mediaType === 'audio' ? 'Full Music Track' : item.mediaType === 'video' ? 'Video' : 'Picture'} (${item.mediaFormat})`,
                        bgColor: statusBgColor,
                        professionTag: `${item.sourcePlatform} ${item.embedUrl ? 'Video Status' : item.mediaType === 'audio' ? 'Music' : 'Series'}`,
                        sourcePlatform: item.sourcePlatform,
                        mediaFormat: item.mediaFormat,
                        externalSourceUrl: item.externalSourceUrl,
                        seriesLabel: total > 1 ? `Part ${idx + 1} of ${total}` : undefined,
                    });
                });
            } else if (statusComposerMode === 'video') {
                if (queuedVideoUploads.length > 0) {
                    const total = queuedVideoUploads.length;
                    queuedVideoUploads.forEach((v, idx) => {
                        const isAudio = v.mediaType === 'audio' || isAudioFileOrUrl(v.name);
                        createdSlides.push({
                            id: `st_pub_${nowMs}_${idx}_${randTag()}`,
                            authorName: userName,
                            authorEmail: userEmail || undefined,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            createdAtMs: nowMs - idx,
                            viewed: false,
                            mediaType: isAudio ? 'audio' : 'video',
                            title: statusDraftTitle.trim() || v.name.replace(/\.[^/.]+$/, ''),
                            videoTitle: statusDraftTitle.trim() || v.name,
                            videoUrl: !isAudio ? v.url : undefined,
                            audioUrl: isAudio ? v.url : undefined,
                            videoDuration: isAudio ? 'Full Song' : 'Full Clip',
                            text:
                                statusDraftText.trim() ||
                                `Uploaded ${isAudio ? 'full music track' : 'training video'} (${v.mediaFormat}): ${v.name}`,
                            bgColor: statusBgColor,
                            professionTag: `${statusSourcePlatform} ${isAudio ? 'Music Track' : 'Training Video'}`,
                            sourcePlatform: inferPlatformFromHint(v.name, statusSourcePlatform),
                            mediaFormat: v.mediaFormat,
                            seriesLabel: total > 1 ? `Part ${idx + 1} of ${total}` : undefined,
                        });
                    });
                } else if (statusDraftVideo.trim()) {
                    const urlTrimmed = statusDraftVideo.trim();
                    const socialParsed = parseSocialVideoUrl(urlTrimmed);
                    if (socialParsed) {
                        setIsResolvingLinks(true);
                        let resolvedOne = socialParsed as any;
                        try {
                            const batch = await resolveLinksBatch([
                                statusDraftTitle.trim() ? `${urlTrimmed} | ${statusDraftTitle.trim()}` : urlTrimmed,
                            ]);
                            if (batch[0]) resolvedOne = batch[0];
                        } finally {
                            setIsResolvingLinks(false);
                        }
                        const platform: StatusSourcePlatform = resolvedOne.sourcePlatform || resolvedOne.platform || 'YouTube';
                        const resolvedTitle =
                            statusDraftTitle.trim() || resolvedOne.title || `${platform} Video Status`;
                        createdSlides.push({
                            id: `st_pub_${nowMs}_${randTag()}`,
                            authorName: userName,
                            authorEmail: userEmail || undefined,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            createdAtMs: nowMs,
                            viewed: false,
                            mediaType: 'video',
                            title: resolvedTitle,
                            videoTitle: resolvedTitle,
                            videoUrl: resolvedOne.url || resolvedOne.canonicalUrl || urlTrimmed,
                            embedUrl: resolvedOne.embedUrl,
                            embedProvider: resolvedOne.embedProvider || resolvedOne.provider,
                            isVerticalEmbed: Boolean(resolvedOne.isVerticalEmbed ?? resolvedOne.isVertical),
                            imageUrl: resolvedOne.posterUrl || resolvedOne.thumbnailUrl || undefined,
                            videoDuration: platform,
                            text: statusDraftText.trim() || resolvedOne.caption || `Shared ${platform} video status`,
                            bgColor: statusBgColor,
                            professionTag: `${platform} Video Status`,
                            sourcePlatform: platform,
                            mediaFormat: resolvedOne.mediaFormat || resolvedOne.formatLabel || platform.toUpperCase(),
                            externalSourceUrl: resolvedOne.externalSourceUrl || urlTrimmed,
                        });
                    } else {
                        const isAudio = isAudioFileOrUrl(urlTrimmed);
                        const inferredPlatform = inferPlatformFromHint(urlTrimmed, statusSourcePlatform);
                        const formatLabel = detectMediaFormatLabel(urlTrimmed, isAudio ? 'MP3' : 'MP4');
                        createdSlides.push({
                            id: `st_pub_${nowMs}_${randTag()}`,
                            authorName: userName,
                            authorEmail: userEmail || undefined,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            createdAtMs: nowMs,
                            viewed: false,
                            mediaType: isAudio ? 'audio' : 'video',
                            title:
                                statusDraftTitle.trim() ||
                                (isAudio ? 'Full Music Track Status' : 'Professional Training Video Update'),
                            videoTitle:
                                statusDraftTitle.trim() ||
                                (isAudio ? 'Full Music Track Status' : 'Professional Training Video Update'),
                            videoUrl: !isAudio ? urlTrimmed : undefined,
                            audioUrl: isAudio ? urlTrimmed : undefined,
                            imageUrl: statusDraftImage || undefined,
                            videoDuration: isAudio ? 'Full Song' : 'Full Clip',
                            text:
                                statusDraftText.trim() ||
                                (isAudio
                                    ? 'Full-length music status — plays continuously until finished.'
                                    : 'New 24-hour ConnectLn professional training video update.'),
                            bgColor: statusBgColor,
                            professionTag: `${inferredPlatform} ${isAudio ? 'Music Track' : 'Training Video'}`,
                            sourcePlatform: inferredPlatform,
                            mediaFormat: formatLabel,
                        });
                    }
                }
            } else if (statusComposerMode === 'photo') {
                if (queuedPhotoUploads.length > 0) {
                    const total = queuedPhotoUploads.length;
                    queuedPhotoUploads.forEach((imgItem, idx) => {
                        createdSlides.push({
                            id: `st_pub_${nowMs}_${idx}_${randTag()}`,
                            authorName: userName,
                            authorEmail: userEmail || undefined,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            createdAtMs: nowMs - idx,
                            viewed: false,
                            mediaType: 'photo',
                            title: statusDraftTitle.trim() || imgItem.name.replace(/\.[^/.]+$/, ''),
                            imageUrl: imgItem.dataUrl,
                            text: statusDraftText.trim() || `Uploaded training picture (${imgItem.mediaFormat}): ${imgItem.name}`,
                            bgColor: statusBgColor,
                            professionTag: `${statusSourcePlatform} Training Picture`,
                            sourcePlatform: inferPlatformFromHint(imgItem.name, statusSourcePlatform),
                            mediaFormat: imgItem.mediaFormat,
                            seriesLabel: total > 1 ? `Part ${idx + 1} of ${total}` : undefined,
                        });
                    });
                } else if (statusDraftImage.trim()) {
                    const inferredPlatform = inferPlatformFromHint(statusDraftImage, statusSourcePlatform);
                    const formatLabel = detectMediaFormatLabel(statusDraftImage, 'JPG');
                    createdSlides.push({
                        id: `st_pub_${nowMs}_${randTag()}`,
                        authorName: userName,
                        authorEmail: userEmail || undefined,
                        authorAvatar: userAvatar,
                        timestampLabel: nowStamp,
                        createdAtMs: nowMs,
                        viewed: false,
                        mediaType: 'photo',
                        title: statusDraftTitle.trim() || 'Professional Training Visual',
                        imageUrl: statusDraftImage.trim(),
                        text: statusDraftText.trim() || 'New 24-hour ConnectLn professional training picture update.',
                        bgColor: statusBgColor,
                        professionTag: `${inferredPlatform} Training Picture`,
                        sourcePlatform: inferredPlatform,
                        mediaFormat: formatLabel,
                    });
                }
            } else if (statusComposerMode === 'info') {
                if (!statusDraftText.trim() && !statusDraftTitle.trim() && !statusDraftInfoDetails.trim()) {
                    return;
                }
                createdSlides.push({
                    id: `st_pub_${nowMs}_${randTag()}`,
                    authorName: userName,
                    authorEmail: userEmail || undefined,
                    authorAvatar: userAvatar,
                    timestampLabel: nowStamp,
                    createdAtMs: nowMs,
                    viewed: false,
                    mediaType: 'info',
                    infoBadge: statusDraftInfoBadge || 'Training Briefing',
                    title: statusDraftTitle.trim() || 'Member Training & Status Briefing',
                    text: statusDraftText.trim() || statusDraftInfoDetails.trim(),
                    infoDetails: statusDraftInfoDetails.trim() || undefined,
                    attachmentName: statusDraftAttachmentName || undefined,
                    attachmentUrl: statusDraftAttachmentUrl || undefined,
                    imageUrl: queuedPhotoUploads[0]?.dataUrl || undefined,
                    bgColor: statusBgColor,
                    professionTag: statusDraftInfoBadge || 'Training Briefing',
                    sourcePlatform: 'ConnectLn',
                    mediaFormat: statusDraftAttachmentName
                        ? detectMediaFormatLabel(statusDraftAttachmentName, 'PDF')
                        : 'BRIEF',
                });
            }

            if (createdSlides.length === 0) return;

            setStatusBoxes((prev) =>
                prev.map((box) =>
                    box.isCurrentUser
                        ? { ...box, slides: [...createdSlides, ...box.slides] }
                        : box
                )
            );
            setQueuedSeriesItems([]);
            setSeriesBatchUrlsText('');
            setQueuedPhotoUploads([]);
            setQueuedVideoUploads([]);
            setStatusDraftTitle('');
            setStatusDraftText('');
            setStatusDraftInfoDetails('');
            setStatusDraftAttachmentName('');
            setStatusDraftAttachmentUrl('');
            setStatusComposerMode(null);
            setActiveStatusUserId('__me__');
            setActiveStatusSlideIndex(0);
            setStatusSlideProgress(0);
            setActiveVideoTiming({ currentSec: 0, durationSec: 0 });
            setIsStatusCompletedForUser(false);
            setIsStatusAutoPlaying(true);
            setStatusReplayNonce((n) => n + 1);

            const cloudPublishable = createdSlides.filter(
                (sl) =>
                    !String(sl.videoUrl || '').startsWith('blob:') &&
                    !String(sl.audioUrl || '').startsWith('blob:')
            );
            if (cloudPublishable.length > 0) {
                fetch('/api/connectin/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'publish', items: cloudPublishable }),
                }).catch(() => {});
            }

            triggerToast(
                `✅ Published ${createdSlides.length} status item${createdSlides.length > 1 ? 's' : ''} — ready for users to watch!`
            );
        };

        const renderUserSlideSummaryIcons = (slides: StatusUpdateItem[]) => {
            const videos = slides.filter((s) => s.mediaType === 'video').length;
            const audios = slides.filter((s) => s.mediaType === 'audio').length;
            const photos = slides.filter((s) => s.mediaType === 'photo').length;
            const infos = slides.filter((s) => s.mediaType === 'info' || s.mediaType === 'text').length;
            const parts: string[] = [];
            if (videos > 0) parts.push(`🎬 ${videos}`);
            if (audios > 0) parts.push(`🎵 ${audios}`);
            if (photos > 0) parts.push(`🖼️ ${photos}`);
            if (infos > 0) parts.push(`📋 ${infos}`);
            return parts.join(' · ') || '0 items';
        };

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Per-User Status Boxes List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#E0D6C5]/60 shrink-0 bg-[#FBF8F3]">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className="w-6 h-6 rounded-lg bg-[#7C4225] flex items-center justify-center text-[11px] font-bold shadow-2xs shrink-0"
                                style={{ color: '#FBF8F3' }}
                            >
                                ✦
                            </span>
                            <h2 className="text-xl font-bold text-[#1C1917]" translate="no">
                                Status
                            </h2>
                            <span className="rounded-md bg-[#EFE8DA] border border-[#D8CEBE] px-2 py-0.5 text-[10px] font-bold text-[#5E3119] truncate">
                                {totalUploadedItems} Items
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusComposerMode('series');
                            }}
                            style={{ color: '#FBF8F3' }}
                            title="Upload YouTube, Facebook, TikTok video links & multi-format Status media"
                            className="px-2.5 py-1.5 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] text-[11px] font-bold cursor-pointer transition-colors shrink-0 shadow-2xs"
                        >
                            + Upload Status
                        </button>
                    </div>

                    {/* My Own Dedicated Status Box Row */}
                    {myStatusBox && (
                        <div className="px-2 py-2 border-b border-[#E0D6C5]/50 shrink-0 bg-[#FBF8F3]">
                            <div
                                className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                                    activeStatusUserId === '__me__' && !statusComposerMode
                                        ? 'bg-[#EFE8DA] border border-[#D8CEBE]'
                                        : 'hover:bg-[#EFE8DA]/70 border border-transparent'
                                }`}
                            >
                                <div
                                    onClick={() => {
                                        if (myStatusBox.slides.length > 0) {
                                            handleOpenUserStatusBox(myStatusBox, 0);
                                        } else {
                                            setStatusComposerMode('series');
                                        }
                                    }}
                                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={userAvatar}
                                            alt={userName}
                                            className="w-11 h-11 rounded-2xl object-cover border-2 border-[#7C4225]"
                                        />
                                        <span
                                            className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-md bg-[#7C4225] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FBF8F3]"
                                            style={{ color: '#FBF8F3' }}
                                        >
                                            ✦
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold text-[#1C1917] truncate">
                                                My status
                                            </p>
                                            {myStatusBox.slides.length > 0 && (
                                                <span className="rounded bg-[#EFE8DA] border border-[#D8CEBE] px-1.5 py-0.5 text-[9px] font-bold text-[#5E3119] shrink-0">
                                                    {myStatusBox.slides.length} items
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#78716C] truncate">
                                            {myStatusBox.slides.length > 0
                                                ? `${renderUserSlideSummaryIcons(myStatusBox.slides)} · Click to auto-play`
                                                : 'Upload training videos, pictures & info'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode('series')}
                                    className="px-2.5 py-1 rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[10px] font-bold text-[#5E3119] cursor-pointer shrink-0"
                                    title="Upload multi-format videos, pictures or training series"
                                >
                                    + Upload
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Per-User Status Boxes (Each row = 1 dedicated user with their own multi-item Status Box) */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2.5 space-y-4">
                        {recentBoxes.length > 0 && (
                            <div>
                                <p className="px-2.5 py-1 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                                    Recent Users ({recentBoxes.length})
                                </p>
                                <div className="space-y-1">
                                    {recentBoxes.map((box) => {
                                        const latestSlide = box.slides[0];
                                        return (
                                            <div
                                                key={box.userId}
                                                onClick={() => handleOpenUserStatusBox(box, 0)}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                                                    activeStatusUserId === box.userId && !statusComposerMode
                                                        ? 'bg-[#EFE8DA] border border-[#D8CEBE]'
                                                        : 'hover:bg-[#F6F1E7] border border-transparent'
                                                }`}
                                            >
                                                <div className="relative p-0.5 rounded-2xl border-2 border-[#7C4225] shrink-0">
                                                    <img
                                                        src={box.authorAvatar}
                                                        alt={box.authorName}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                    />
                                                    <span
                                                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-md bg-[#7C4225] border border-[#FBF8F3] text-[9px] font-bold flex items-center justify-center leading-none"
                                                        style={{ color: '#FBF8F3' }}
                                                    >
                                                        {box.slides.length}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-sm font-semibold text-[#1C1917] truncate">
                                                            {box.authorName}
                                                        </p>
                                                        <span className="rounded bg-[#EFE8DA] border border-[#D8CEBE] px-1.5 py-0.5 text-[9px] font-bold text-[#5E3119] shrink-0">
                                                            {renderUserSlideSummaryIcons(box.slides)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-[#57534E] truncate">
                                                        {latestSlide?.title || latestSlide?.videoTitle || latestSlide?.text}
                                                    </p>
                                                    <p className="text-[10px] text-[#78716C]">
                                                        {latestSlide?.timestampLabel} · {box.slides.length} items in box
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {viewedBoxes.length > 0 && (
                            <div>
                                <p className="px-2.5 py-1 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                                    Viewed Users ({viewedBoxes.length})
                                </p>
                                <div className="space-y-1">
                                    {viewedBoxes.map((box) => {
                                        const latestSlide = box.slides[0];
                                        return (
                                            <div
                                                key={box.userId}
                                                onClick={() => handleOpenUserStatusBox(box, 0)}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                                                    activeStatusUserId === box.userId && !statusComposerMode
                                                        ? 'bg-[#EFE8DA] border border-[#D8CEBE]'
                                                        : 'hover:bg-[#F6F1E7] border border-transparent'
                                                }`}
                                            >
                                                <div className="relative p-0.5 rounded-2xl border-2 border-[#D0C4AE] shrink-0">
                                                    <img
                                                        src={box.authorAvatar}
                                                        alt={box.authorName}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                    />
                                                    <span
                                                        className="absolute -bottom-1 -right-1 min-w-[16px] h-4 px-1 rounded-md bg-[#57534E] border border-[#FBF8F3] text-[9px] font-bold flex items-center justify-center leading-none"
                                                        style={{ color: '#FBF8F3' }}
                                                    >
                                                        {box.slides.length}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-sm font-medium text-[#1C1917] truncate">
                                                            {box.authorName}
                                                        </p>
                                                        <span className="rounded bg-[#F3EDE2] border border-[#DDD3C2] px-1.5 py-0.5 text-[9px] font-semibold text-[#57534E] shrink-0">
                                                            {renderUserSlideSummaryIcons(box.slides)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-[#57534E] truncate">
                                                        {latestSlide?.title || latestSlide?.videoTitle || latestSlide?.text}
                                                    </p>
                                                    <p className="text-[10px] text-[#78716C]">
                                                        {latestSlide?.timestampLabel} · {box.slides.length} items in box
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Upload Status Composer OR Dedicated Single-User Multi-Item Status Box */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-y-auto">
                    {statusComposerMode ? (
                        <div className="w-full max-w-2xl bg-[#FBF8F3] rounded-2xl shadow-lg border border-[#E0D6C5] p-5 sm:p-6 my-auto animate-in fade-in space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-base font-bold text-[#1C1917]">
                                        Upload to Your Dedicated Status Box ({userName})
                                    </h3>
                                    <p className="text-xs text-[#57534E]">
                                        Upload multiple videos, pictures, or structured status information slides into your own Status Box.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode(null)}
                                    className="w-8 h-8 rounded-full bg-[#EFE8DA] hover:bg-[#E2D9C8] text-[#57534E] hover:text-[#1C1917] font-bold text-sm cursor-pointer shrink-0"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 4-Mode Upload Type Switcher */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-xl bg-[#EFE8DA] border border-[#DDD3C2]">
                                {[
                                    { id: 'series' as const, label: '📺 YouTube / FB / TikTok & Series' },
                                    { id: 'video' as const, label: '🎬🎵 Videos, Links & Music' },
                                    { id: 'photo' as const, label: '🖼️ Upload Pictures' },
                                    { id: 'info' as const, label: '📋 Status Info' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStatusComposerMode(tab.id)}
                                        style={statusComposerMode === tab.id ? { color: '#FBF8F3' } : undefined}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            statusComposerMode === tab.id
                                                ? 'bg-[#7C4225] text-[#FBF8F3] shadow-xs'
                                                : 'text-[#5E3119] hover:bg-[#FBF8F3]/70'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handlePublishStatus} className="space-y-4">
                                {/* Mode S: YouTube, Facebook & TikTok Links + Multi-Format Series */}
                                {statusComposerMode === 'series' && (
                                    <div className="space-y-4 rounded-xl border border-[#DDD3C2] bg-[#FAF6EE] p-4">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <p className="text-xs font-extrabold uppercase tracking-wider text-[#5E3119]">
                                                    Playable YouTube, Facebook &amp; TikTok Status Series
                                                </p>
                                                <p className="text-[11px] text-[#6B5A45] mt-0.5">
                                                    Paste any <strong>YouTube</strong> (watch, Shorts, youtu.be), <strong>YouTube Music &amp; Playlists</strong> (<code className="px-1 bg-[#EFE8DA] rounded">music.youtube.com/playlist?list=...</code>), <strong>Facebook</strong> (video, watch, reel, fb.watch), or <strong>TikTok</strong> link—or upload local videos, music &amp; pictures—to play directly inside Status for all users.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Prominent Social Video Link Importer */}
                                        <div className="space-y-2 rounded-xl border-2 border-[#BC9675] bg-[#FBF8F3] p-3.5">
                                            <label className="block text-xs font-extrabold text-[#5E3119]">
                                                Paste YouTube, YouTube Music Playlist, Facebook, or TikTok Links (one per line)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={seriesBatchUrlsText}
                                                onChange={(e) => setSeriesBatchUrlsText(e.target.value)}
                                                placeholder={
                                                    'https://music.youtube.com/playlist?list=... | Worship Playlist\n' +
                                                    'https://www.youtube.com/watch?v=... | Optional Custom Title\n' +
                                                    'https://www.facebook.com/watch/?v=... or https://www.tiktok.com/@username/video/...'
                                                }
                                                className="w-full rounded-xl border border-[#D0C4AE] bg-white px-3 py-2 text-xs text-[#2A1E12] focus:outline-none focus:ring-2 focus:ring-[#7C4225]"
                                            />
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="text-[10px] text-[#6B5A45]">
                                                    Tip: Add <code className="px-1 bg-[#EFE8DA] rounded">| Title</code> after any link to customize its Status headline.
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleAddSocialLinksToSeries}
                                                    disabled={!seriesBatchUrlsText.trim() || isResolvingLinks}
                                                    style={{ color: '#FBF8F3' }}
                                                    className="rounded-lg bg-[#7C4225] hover:bg-[#5E3119] disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                                                >
                                                    {isResolvingLinks ? 'Resolving Video Links...' : '+ Add Links to Status Queue'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Source Platform Selector */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-bold text-[#5E3119]">
                                                Default Source Platform Tag (for uploaded local files)
                                            </label>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {(['YouTube', 'TikTok', 'Facebook', 'WhatsApp', 'ConnectLn'] as const).map((platform) => (
                                                    <button
                                                        key={platform}
                                                        type="button"
                                                        onClick={() => setStatusSourcePlatform(platform)}
                                                        style={statusSourcePlatform === platform ? { color: '#FBF8F3' } : undefined}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                                            statusSourcePlatform === platform
                                                                ? 'bg-[#7C4225] border-[#7C4225] text-[#FBF8F3]'
                                                                : 'bg-[#FBF8F3] border-[#D0C4AE] text-[#5E3119] hover:bg-[#EFE8DA]'
                                                        }`}
                                                    >
                                                        {platform}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mixed Multi-Format Device Upload */}
                                        <div className="rounded-xl border border-dashed border-[#BC9675] bg-[#FBF8F3] p-3.5 text-center space-y-2">
                                            <p className="text-xs text-[#5E3119] font-semibold">
                                                Or upload videos, music &amp; pictures from your device
                                            </p>
                                            <label
                                                style={{ color: '#FBF8F3' }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer"
                                            >
                                                <span>🎞️ Choose Multi-Format Videos, Music &amp; Pictures</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="video/*,audio/*,image/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.3gp,.3g2,.mpeg,.mpg,.ogv,.flv,.wmv,.mp3,.wav,.m4a,.aac,.ogg,.flac,.opus,.wma,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.svg,.jfif"
                                                    className="hidden"
                                                    onChange={handleSeriesMixedFilesUpload}
                                                />
                                            </label>
                                            <p className="text-[10px] text-[#6B5A45]">
                                                Supports MP4, MOV, WEBM, MKV, MP3, WAV, M4A, FLAC, JPG, PNG, WEBP, GIF, HEIC, AVIF
                                            </p>
                                        </div>

                                        {/* 1-Click Professional Training Series Presets */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-bold text-[#5E3119]">
                                                Quick-Load Sample Training Series
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyTrainingSeriesPreset('WhatsApp')}
                                                    className="rounded-xl border border-[#25D366]/40 bg-[#FBF8F3] hover:bg-[#EFE8DA] px-3 py-2 text-left transition-colors cursor-pointer"
                                                >
                                                    <span className="block text-xs font-bold text-[#5E3119]">💬 WhatsApp Training Series</span>
                                                    <span className="block text-[10px] text-[#6B5A45]">Field Safety, K8s &amp; Briefing Clips</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyTrainingSeriesPreset('TikTok')}
                                                    className="rounded-xl border border-[#5E3119]/30 bg-[#FBF8F3] hover:bg-[#EFE8DA] px-3 py-2 text-left transition-colors cursor-pointer"
                                                >
                                                    <span className="block text-xs font-bold text-[#5E3119]">🎵 TikTok Micro-Lessons</span>
                                                    <span className="block text-[10px] text-[#6B5A45]">Clinical, Dev &amp; Grid Shorts</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyTrainingSeriesPreset('Facebook')}
                                                    className="rounded-xl border border-[#1877F2]/40 bg-[#FBF8F3] hover:bg-[#EFE8DA] px-3 py-2 text-left transition-colors cursor-pointer"
                                                >
                                                    <span className="block text-xs font-bold text-[#5E3119]">📘 Facebook Trade Modules</span>
                                                    <span className="block text-[10px] text-[#6B5A45]">Trade &amp; Compliance Series</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Shared Series Title & Notes */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-[#5E3119] mb-1">
                                                    Series Label / Training Track
                                                </label>
                                                <input
                                                    type="text"
                                                    value={statusDraftTitle}
                                                    onChange={(e) => setStatusDraftTitle(e.target.value)}
                                                    placeholder="e.g., Field Safety & Certification Module"
                                                    className="w-full rounded-xl border border-[#D0C4AE] bg-[#FBF8F3] px-3 py-2 text-xs text-[#2A1E12] focus:outline-none focus:ring-2 focus:ring-[#7C4225]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-[#5E3119] mb-1">
                                                    Training Objective / Summary Note
                                                </label>
                                                <input
                                                    type="text"
                                                    value={statusDraftText}
                                                    onChange={(e) => setStatusDraftText(e.target.value)}
                                                    placeholder="Key takeaway played across each slide"
                                                    className="w-full rounded-xl border border-[#D0C4AE] bg-[#FBF8F3] px-3 py-2 text-xs text-[#2A1E12] focus:outline-none focus:ring-2 focus:ring-[#7C4225]"
                                                />
                                            </div>
                                        </div>

                                        {/* Reorderable Queued Series Preview */}
                                        {queuedSeriesItems.length > 0 && (
                                            <div className="space-y-2 rounded-xl border border-[#DDD3C2] bg-[#FBF8F3] p-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E3119]">
                                                        Queued Training Series ({queuedSeriesItems.length} {queuedSeriesItems.length === 1 ? 'item' : 'items'})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQueuedSeriesItems([])}
                                                        className="text-[11px] font-bold text-[#7C4225] hover:underline cursor-pointer"
                                                    >
                                                        Clear Queue
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                                    {queuedSeriesItems.map((item, idx) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between gap-2 rounded-lg border border-[#E5DDD0] bg-[#FAF6EE] px-2.5 py-1.5 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-mono text-[10px] font-bold text-[#7C4225]">
                                                                    #{idx + 1}
                                                                </span>
                                                                {item.posterUrl ? (
                                                                    <img
                                                                        src={item.posterUrl}
                                                                        alt={item.title || item.name}
                                                                        className="w-8 h-6 rounded object-cover border border-[#D0C4AE] shrink-0"
                                                                    />
                                                                ) : (
                                                                    <span>
                                                                        {item.mediaType === 'audio'
                                                                            ? '🎵'
                                                                            : item.mediaType === 'video'
                                                                            ? '🎬'
                                                                            : '🖼️'}
                                                                    </span>
                                                                )}
                                                                <span className="rounded bg-[#EFE8DA] border border-[#D0C4AE] px-1.5 py-0.5 text-[10px] font-bold text-[#5E3119] shrink-0">
                                                                    {getPlatformBadgeLabel(item.sourcePlatform)}
                                                                </span>
                                                                <span className="rounded bg-[#7C4225]/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#7C4225] shrink-0">
                                                                    {item.mediaFormat}
                                                                </span>
                                                                <span className="truncate font-medium text-[#2A1E12]">
                                                                    {item.title || item.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveQueuedSeriesItem(idx, -1)}
                                                                    disabled={idx === 0}
                                                                    title="Move up"
                                                                    className="px-1.5 py-0.5 rounded border border-[#D0C4AE] text-[11px] font-bold text-[#5E3119] hover:bg-[#EFE8DA] disabled:opacity-40 cursor-pointer"
                                                                >
                                                                    ↑
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveQueuedSeriesItem(idx, 1)}
                                                                    disabled={idx === queuedSeriesItems.length - 1}
                                                                    title="Move down"
                                                                    className="px-1.5 py-0.5 rounded border border-[#D0C4AE] text-[11px] font-bold text-[#5E3119] hover:bg-[#EFE8DA] disabled:opacity-40 cursor-pointer"
                                                                >
                                                                    ↓
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setQueuedSeriesItems((prev) =>
                                                                            prev.filter((q) => q.id !== item.id)
                                                                        )
                                                                    }
                                                                    title="Remove item"
                                                                    className="px-1.5 py-0.5 rounded border border-[#D0C4AE] text-[11px] font-bold text-[#9E2A2B] hover:bg-[#EFE8DA] cursor-pointer"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mode A: Upload Structured Status Information */}
                                {statusComposerMode === 'info' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-[#57534E]">
                                                    Information Category
                                                </label>
                                                <select
                                                    value={statusDraftInfoBadge}
                                                    onChange={(e) => setStatusDraftInfoBadge(e.target.value)}
                                                    className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs font-semibold text-[#1C1917]"
                                                >
                                                    <option value="Project Update">📋 Project Update</option>
                                                    <option value="Availability & Rates">📅 Availability &amp; Rates</option>
                                                    <option value="Site Briefing">📍 Site Briefing</option>
                                                    <option value="Safety & Compliance">🛡️ Safety &amp; Compliance</option>
                                                    <option value="Credentials & Licenses">🎖️ Credentials &amp; Licenses</option>
                                                    <option value="General Announcement">📣 General Announcement</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-[#57534E]">
                                                    Information Headline / Title
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={statusDraftTitle}
                                                    onChange={(e) => setStatusDraftTitle(e.target.value)}
                                                    placeholder="e.g. Q4 Structural Steel Capacity & Site Dispatch Info"
                                                    className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className="rounded-2xl p-4 space-y-2 shadow-inner"
                                            style={{ background: statusBgColor, color: '#FBF8F3' }}
                                        >
                                            <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                {statusDraftInfoBadge}
                                            </span>
                                            <textarea
                                                required
                                                value={statusDraftText}
                                                onChange={(e) => setStatusDraftText(e.target.value)}
                                                placeholder="Enter your status information, updates, schedules, instructions, or details..."
                                                rows={3}
                                                className="w-full bg-transparent placeholder-white/75 text-sm font-semibold focus:outline-none resize-none"
                                                style={{ color: '#FBF8F3' }}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-[#57534E]">
                                                Additional Notes / Schedule / Contact Details (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={statusDraftInfoDetails}
                                                onChange={(e) => setStatusDraftInfoDetails(e.target.value)}
                                                placeholder="e.g. Mon–Fri 7:00 AM–5:00 PM · Contact (555) 234-8910 · Gate B check-in"
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-bold text-[#57534E]">
                                                    Attach Supporting File / Document (Optional)
                                                </label>
                                                <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-[#BC9675] bg-[#F8F4EC] px-3 py-2 text-xs font-semibold text-[#5E3119] cursor-pointer hover:bg-[#EFE8DA]">
                                                    <span className="truncate">
                                                        {statusDraftAttachmentName ? `📎 ${statusDraftAttachmentName}` : '+ Choose PDF, Doc, Sheet, or Image'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx,image/*"
                                                        className="hidden"
                                                        onChange={handleAttachmentFileUpload}
                                                    />
                                                </label>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-bold text-[#57534E]">
                                                    Card Color Theme
                                                </span>
                                                <div className="flex items-center gap-2 pt-1">
                                                    {[
                                                        'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)',
                                                        'linear-gradient(135deg, #3b1e10 0%, #8a4b29 100%)',
                                                        'linear-gradient(135deg, #292521 0%, #524b42 100%)',
                                                        'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
                                                        'linear-gradient(135deg, #1c1917 0%, #3d3730 100%)',
                                                    ].map((bg, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setStatusBgColor(bg)}
                                                            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                                                                statusBgColor === bg
                                                                    ? 'border-[#1C1917] scale-110'
                                                                    : 'border-[#FBF8F3]'
                                                            }`}
                                                            style={{ background: bg }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mode B: Upload One or Many Pictures */}
                                {statusComposerMode === 'photo' && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border-2 border-dashed border-[#BC9675] bg-[#F8F4EC] p-4 text-center space-y-2">
                                            <p className="text-xs font-bold text-[#5E3119]">
                                                Select one or multiple pictures from your device (WhatsApp/TikTok/Facebook exports supported — all added to YOUR Status Box)
                                            </p>
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap pb-1">
                                                {(['YouTube', 'WhatsApp', 'TikTok', 'Facebook', 'ConnectLn'] as const).map((platform) => (
                                                    <button
                                                        key={platform}
                                                        type="button"
                                                        onClick={() => setStatusSourcePlatform(platform)}
                                                        style={statusSourcePlatform === platform ? { color: '#FBF8F3' } : undefined}
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                            statusSourcePlatform === platform
                                                                ? 'bg-[#7C4225] border-[#7C4225] text-[#FBF8F3]'
                                                                : 'bg-[#FBF8F3] border-[#D0C4AE] text-[#5E3119] hover:bg-[#EFE8DA]'
                                                        }`}
                                                    >
                                                        {platform}
                                                    </button>
                                                ))}
                                            </div>
                                            <label
                                                style={{ color: '#FBF8F3' }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer"
                                            >
                                                <span>🖼️ Choose Pictures (Multi-Select Supported)</span>
                                                <input
                                                    type="file"
                                                    accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.svg,.jfif"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handlePhotoFilesUpload}
                                                />
                                            </label>
                                            {queuedPhotoUploads.length > 0 && (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                                                    {queuedPhotoUploads.map((item) => (
                                                        <div key={item.id} className="relative rounded-lg overflow-hidden border border-[#D0C4AE] bg-white">
                                                            <img src={item.dataUrl} alt={item.name} className="w-full h-20 object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setQueuedPhotoUploads((prev) => prev.filter((p) => p.id !== item.id))
                                                                }
                                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-[#57534E]">
                                                Or pick a quick preset photo / paste an Image URL:
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {STATUS_PHOTO_PRESETS.map((p) => (
                                                    <button
                                                        key={p.imageUrl}
                                                        type="button"
                                                        onClick={() => setStatusDraftImage(p.imageUrl)}
                                                        style={statusDraftImage === p.imageUrl ? { color: '#FBF8F3' } : undefined}
                                                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer ${
                                                            statusDraftImage === p.imageUrl
                                                                ? 'bg-[#7C4225] border-[#5E3119] text-[#FBF8F3]'
                                                                : 'bg-[#EFE8DA] border-[#DDD3C2] text-[#5E3119]'
                                                        }`}
                                                    >
                                                        🖼️ {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={statusDraftImage}
                                                onChange={(e) => setStatusDraftImage(e.target.value)}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-1.5 text-xs text-[#1C1917]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={statusDraftTitle}
                                                onChange={(e) => setStatusDraftTitle(e.target.value)}
                                                placeholder="Picture title (optional)"
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                            <input
                                                type="text"
                                                value={statusDraftText}
                                                onChange={(e) => setStatusDraftText(e.target.value)}
                                                placeholder="Caption for your picture(s)..."
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Mode C: Upload One or Many Videos & Full Music Tracks */}
                                {statusComposerMode === 'video' && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border-2 border-dashed border-[#BC9675] bg-[#F8F4EC] p-4 text-center space-y-2">
                                            <p className="text-xs font-bold text-[#5E3119]">
                                                Upload full videos (MP4/MOV/WEBM/MKV/3GP) or full music tracks (MP3/WAV/M4A/FLAC/OGG) — played 100% end-to-end in YOUR Status Box
                                            </p>
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap pb-1">
                                                {(['YouTube', 'TikTok', 'Facebook', 'WhatsApp', 'ConnectLn'] as const).map((platform) => (
                                                    <button
                                                        key={platform}
                                                        type="button"
                                                        onClick={() => setStatusSourcePlatform(platform)}
                                                        style={statusSourcePlatform === platform ? { color: '#FBF8F3' } : undefined}
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                            statusSourcePlatform === platform
                                                                ? 'bg-[#7C4225] border-[#7C4225] text-[#FBF8F3]'
                                                                : 'bg-[#FBF8F3] border-[#D0C4AE] text-[#5E3119] hover:bg-[#EFE8DA]'
                                                        }`}
                                                    >
                                                        {platform}
                                                    </button>
                                                ))}
                                            </div>
                                            <label
                                                style={{ color: '#FBF8F3' }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer"
                                            >
                                                <span>🎬🎵 Choose Video or Full Music File(s)</span>
                                                <input
                                                    type="file"
                                                    accept="video/*,audio/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.3gp,.3g2,.mpeg,.mpg,.ogv,.flv,.wmv,.mp3,.wav,.m4a,.aac,.ogg,.flac,.opus,.wma"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleVideoFilesUpload}
                                                />
                                            </label>
                                            {queuedVideoUploads.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
                                                    {queuedVideoUploads.map((v) => (
                                                        <div key={v.id} className="relative rounded-lg overflow-hidden border border-[#D0C4AE] bg-black p-2">
                                                            {v.mediaType === 'audio' ? (
                                                                <div className="h-24 flex flex-col items-center justify-center gap-2 bg-zinc-950 rounded px-2">
                                                                    <span className="text-[11px] font-bold text-amber-300">
                                                                        🎵 Full Music Track ({v.mediaFormat})
                                                                    </span>
                                                                    <audio src={v.url} controls className="w-full h-8" />
                                                                </div>
                                                            ) : (
                                                                <video src={v.url} controls muted className="w-full h-24 object-cover rounded" />
                                                            )}
                                                            <p className="text-[10px] font-semibold text-white truncate pt-1 px-1">{v.name}</p>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setQueuedVideoUploads((prev) => prev.filter((item) => item.id !== v.id))
                                                                }
                                                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-[#57534E]">
                                                Paste a YouTube, YouTube Music Playlist, Facebook, TikTok, or MP4/MP3 link — or pick a preset below:
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {STATUS_VIDEO_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.videoUrl}
                                                        type="button"
                                                        onClick={() => {
                                                            setStatusDraftVideo(preset.videoUrl);
                                                            setStatusDraftImage(preset.posterUrl);
                                                        }}
                                                        style={
                                                            statusDraftVideo === preset.videoUrl
                                                                ? { color: '#FBF8F3' }
                                                                : undefined
                                                        }
                                                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                                                            statusDraftVideo === preset.videoUrl
                                                                ? 'bg-[#7C4225] border-[#5E3119] text-[#FBF8F3]'
                                                                : 'bg-[#EFE8DA] hover:bg-[#E5DEC9] border-[#DDD3C2] text-[#5E3119]'
                                                        }`}
                                                    >
                                                        ▶ {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={statusDraftVideo}
                                                onChange={(e) => setStatusDraftVideo(e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=... | https://www.facebook.com/reel/... | https://www.tiktok.com/@.../video/..."
                                                className="w-full border border-[#D0C4AE] bg-white rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={statusDraftTitle}
                                                onChange={(e) => setStatusDraftTitle(e.target.value)}
                                                placeholder="Video title (optional)"
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                            <input
                                                type="text"
                                                value={statusDraftText}
                                                onChange={(e) => setStatusDraftText(e.target.value)}
                                                placeholder="Video description / caption..."
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-2 border-t border-[#E0D6C5]">
                                    <button
                                        type="button"
                                        onClick={() => setStatusComposerMode(null)}
                                        className="px-4 py-2 rounded-full text-xs font-semibold text-[#57534E] hover:bg-[#EFE8DA] cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResolvingLinks}
                                        className="px-5 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] disabled:opacity-60 text-xs font-bold shadow-sm cursor-pointer"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        {isResolvingLinks
                                            ? 'Resolving & Publishing...'
                                            : statusComposerMode === 'series'
                                            ? `Publish Video Links / Series (${
                                                  queuedSeriesItems.length +
                                                  (seriesBatchUrlsText.trim()
                                                      ? seriesBatchUrlsText
                                                            .split(/[\r\n]+/)
                                                            .filter((l) => l.trim()).length
                                                      : 0)
                                              } Items) to My Status Box`
                                            : statusComposerMode === 'photo'
                                            ? `Upload ${queuedPhotoUploads.length > 1 ? `${queuedPhotoUploads.length} Pictures` : 'Picture'} to My Status Box`
                                            : statusComposerMode === 'video'
                                            ? `Upload ${queuedVideoUploads.length > 1 ? `${queuedVideoUploads.length} Track(s)/Video(s)` : 'Video / Link / Music'} to My Status Box`
                                            : 'Publish Information to My Status Box'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : activeUserBox && activeSlide ? (() => {
                        const parsedEmbed = activeSlide.embedUrl
                            ? {
                                  embedUrl: activeSlide.embedUrl,
                                  provider:
                                      activeSlide.embedProvider ||
                                      (activeSlide.sourcePlatform === 'TikTok'
                                          ? ('tiktok' as const)
                                          : activeSlide.sourcePlatform === 'Facebook'
                                          ? ('facebook' as const)
                                          : ('youtube' as const)),
                                  isVertical: Boolean(activeSlide.isVerticalEmbed),
                                  originalUrl: activeSlide.externalSourceUrl || activeSlide.videoUrl || '',
                              }
                            : parseSocialVideoUrl(activeSlide.externalSourceUrl || activeSlide.videoUrl || '');
                        const isEmbeddedSocialVideo = Boolean(parsedEmbed?.embedUrl);
                        const isAudioSlide = !isEmbeddedSocialVideo && activeSlide.mediaType === 'audio' && Boolean(activeSlide.audioUrl);
                        const isVideoSlide = !isEmbeddedSocialVideo && activeSlide.mediaType === 'video' && Boolean(activeSlide.videoUrl);
                        const activeInteractions: StatusSlideInteractions = statusInteractions[activeSlide.id] || {
                            slideId: activeSlide.id,
                            reactions: {},
                            comments: [],
                            updatedAtMs: 0,
                        };
                        const reactionEntries = Object.entries(activeInteractions.reactions || {})
                            .filter(([, users]) => Array.isArray(users) && users.length > 0)
                            .sort((a, b) => b[1].length - a[1].length);
                        const totalReactionsCount = reactionEntries.reduce((acc, [, users]) => acc + users.length, 0);
                        const activeComments = Array.isArray(activeInteractions.comments)
                            ? activeInteractions.comments
                            : [];
                        const totalClipPasses = Math.max(1, activeSlide.musicSegmentsCount || 1);
                        const cumulativeCurrentSec =
                            totalClipPasses > 1 && activeVideoTiming.durationSec > 0
                                ? activeClipPassIndex * activeVideoTiming.durationSec + activeVideoTiming.currentSec
                                : activeVideoTiming.currentSec;
                        const cumulativeDurationSec =
                            totalClipPasses > 1 && activeVideoTiming.durationSec > 0
                                ? totalClipPasses * activeVideoTiming.durationSec
                                : activeVideoTiming.durationSec;

                        const handleFullMediaEnded = (el: HTMLMediaElement) => {
                            if (activeClipPassIndex < totalClipPasses - 1) {
                                setActiveClipPassIndex((p) => p + 1);
                                setStatusSlideProgress(0);
                                el.currentTime = 0;
                                el.play().catch(() => {});
                                return;
                            }
                            if (safeSlideIndex < activeUserBox.slides.length - 1) {
                                setActiveVideoTiming({ currentSec: 0, durationSec: 0 });
                                setActiveClipPassIndex(0);
                                setActiveStatusSlideIndex(safeSlideIndex + 1);
                                setStatusSlideProgress(0);
                            } else {
                                const fullDur =
                                    el.duration && Number.isFinite(el.duration)
                                        ? el.duration
                                        : activeVideoTiming.durationSec;
                                setActiveVideoTiming({ currentSec: fullDur, durationSec: fullDur });
                                setStatusSlideProgress(100);
                                setIsStatusAutoPlaying(false);
                                setIsStatusCompletedForUser(true);
                            }
                        };

                        const showMultiSubSegments =
                            activeUserBox.slides.length === 1 && totalClipPasses > 1;
                        const longTrackSegCount =
                            activeUserBox.slides.length === 1 &&
                            totalClipPasses === 1 &&
                            (isAudioSlide || isVideoSlide) &&
                            activeVideoTiming.durationSec > 35
                                ? Math.min(10, Math.ceil(activeVideoTiming.durationSec / 30))
                                : 0;

                        return (
                        <div className="w-full max-w-2xl my-auto space-y-3 animate-in fade-in">
                            <div className="w-full bg-[#09090B] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#524B42]">
                                {/* Dedicated User Identity Strip + WhatsApp Multi-Segment Progress ONLY for THIS User */}
                                <div className="px-4 pt-3 space-y-2 bg-[#0B0B0D]">
                                    <div className="flex items-center justify-between text-[11px] text-[#D0C4AE] gap-2 flex-wrap">
                                        <span className="font-bold text-[#FBF8F3]">
                                            {activeUserBox.authorName}&apos;s Dedicated Status Box
                                        </span>
                                        <span className="font-mono flex items-center gap-2 flex-wrap">
                                            {isEmbeddedSocialVideo ? (
                                                <>
                                                    <span className="text-[#E8C59B]">
                                                        {getPlatformBadgeLabel(activeSlide.sourcePlatform)} · Embedded Player
                                                    </span>
                                                    <span>·</span>
                                                </>
                                            ) : (isVideoSlide || isAudioSlide) && (
                                                <>
                                                    <span className="text-[#E8C59B]">
                                                        {isAudioSlide ? '🎵 Full Music:' : '🎬 Full Video:'}{' '}
                                                        {formatSecondsToMmSs(cumulativeCurrentSec)} /{' '}
                                                        {cumulativeDurationSec > 0
                                                            ? formatSecondsToMmSs(cumulativeDurationSec)
                                                            : activeSlide.videoDuration || 'Full Track'}
                                                    </span>
                                                    <span>·</span>
                                                </>
                                            )}
                                            <span>
                                                {isStatusCompletedForUser
                                                    ? `✓ Finished all ${activeUserBox.slides.length} items`
                                                    : isStatusAutoPlaying
                                                    ? isStatusReplyFocused
                                                        ? '⏸ Paused while typing'
                                                        : '▶ Auto-playing'
                                                    : '⏸ Paused'}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                Item {safeSlideIndex + 1} of {activeUserBox.slides.length}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {showMultiSubSegments
                                            ? Array.from({ length: totalClipPasses }).map((_, segIdx) => {
                                                  const fillPct =
                                                      segIdx < activeClipPassIndex
                                                          ? 100
                                                          : segIdx === activeClipPassIndex
                                                          ? isStatusCompletedForUser
                                                              ? 100
                                                              : Math.min(100, Math.max(0, statusSlideProgress))
                                                          : 0;
                                                  return (
                                                      <div
                                                          key={segIdx}
                                                          className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden relative"
                                                      >
                                                          <span
                                                              className="block h-full rounded-full bg-white transition-all duration-100"
                                                              style={{ width: `${fillPct}%` }}
                                                          />
                                                      </div>
                                                  );
                                              })
                                            : longTrackSegCount > 1
                                            ? Array.from({ length: longTrackSegCount }).map((_, segIdx) => {
                                                  const overall =
                                                      cumulativeDurationSec > 0
                                                          ? cumulativeCurrentSec / cumulativeDurationSec
                                                          : 0;
                                                  const segStart = segIdx / longTrackSegCount;
                                                  const segEnd = (segIdx + 1) / longTrackSegCount;
                                                  const fillPct = isStatusCompletedForUser
                                                      ? 100
                                                      : overall >= segEnd
                                                      ? 100
                                                      : overall <= segStart
                                                      ? 0
                                                      : ((overall - segStart) / (segEnd - segStart)) * 100;
                                                  return (
                                                      <div
                                                          key={segIdx}
                                                          className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden relative"
                                                      >
                                                          <span
                                                              className="block h-full rounded-full bg-white transition-all duration-100"
                                                              style={{ width: `${Math.min(100, Math.max(0, fillPct))}%` }}
                                                          />
                                                      </div>
                                                  );
                                              })
                                            : activeUserBox.slides.map((sl, idx) => {
                                                  const slideFill =
                                                      idx === safeSlideIndex && totalClipPasses > 1
                                                          ? ((activeClipPassIndex + statusSlideProgress / 100) /
                                                                totalClipPasses) *
                                                            100
                                                          : statusSlideProgress;
                                                  const fillPct =
                                                      idx < safeSlideIndex
                                                          ? 100
                                                          : idx === safeSlideIndex
                                                          ? isStatusCompletedForUser
                                                              ? 100
                                                              : Math.min(100, Math.max(0, slideFill))
                                                          : 0;
                                                  return (
                                                      <button
                                                          key={sl.id}
                                                          type="button"
                                                          onClick={() => handleSelectSlideInUserBox(idx)}
                                                          title={sl.title || sl.videoTitle || `Item ${idx + 1}`}
                                                          className="h-1 flex-1 rounded-full bg-white/25 hover:bg-white/40 overflow-hidden cursor-pointer relative"
                                                      >
                                                          <span
                                                              className={`block h-full rounded-full transition-all duration-100 ${
                                                                  idx <= safeSlideIndex ? 'bg-white' : 'bg-white/30'
                                                              }`}
                                                              style={{ width: `${fillPct}%` }}
                                                          />
                                                      </button>
                                                  );
                                              })}
                                    </div>
                                </div>

                                {/* Top Author & Navigation Bar (WhatsApp-style Controls: Play/Pause, Speaker Mute, Prev/Next, Close) */}
                                <div className="px-4 py-3 bg-[#0B0B0D] flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={activeUserBox.authorAvatar}
                                            alt={activeUserBox.authorName}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p
                                                    className="text-sm font-bold truncate"
                                                    style={{ color: '#FBF8F3' }}
                                                >
                                                    {activeUserBox.authorName}
                                                </p>
                                                {(activeSlide.infoBadge || activeSlide.professionTag || activeUserBox.professionTag) && (
                                                    <span className="rounded-md bg-[#7C4225]/50 border border-[#BC9675]/40 px-2 py-0.5 text-[10px] font-bold text-[#FBF8F3]">
                                                        {activeSlide.infoBadge || activeSlide.professionTag || activeUserBox.professionTag}
                                                    </span>
                                                )}
                                                {activeSlide.sourcePlatform && (
                                                    <span className="rounded-md bg-white/10 border border-white/15 px-1.5 py-0.5 text-[10px] font-bold text-[#FBF8F3]">
                                                        {getPlatformBadgeLabel(activeSlide.sourcePlatform)}
                                                    </span>
                                                )}
                                                {activeSlide.mediaFormat && (
                                                    <span className="rounded-md bg-[#7C4225]/50 border border-[#BC9675]/40 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#FBF8F3]">
                                                        {activeSlide.mediaFormat}
                                                    </span>
                                                )}
                                                {activeSlide.seriesLabel && (
                                                    <span className="rounded-md bg-emerald-900/50 border border-emerald-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                                                        {activeSlide.seriesLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-[#D0C4AE] truncate">
                                                {activeSlide.timestampLabel}
                                                {activeSlide.sourcePlatform
                                                    ? ` • View on ${activeSlide.sourcePlatform} ›`
                                                    : ''}
                                                {(activeSlide.title || activeSlide.videoTitle)
                                                    ? ` • ${activeSlide.title || activeSlide.videoTitle}`
                                                    : ''}
                                                {activeSlide.externalSourceUrl && (
                                                    <a
                                                        href={activeSlide.externalSourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-2 text-[#D69E6B] hover:underline font-semibold"
                                                    >
                                                        Open ↗
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                        {activeUserBox.isCurrentUser && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusComposerMode('series')}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                                                    style={{ color: '#FFFFFF' }}
                                                >
                                                    + Upload More
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMySlide(activeSlide.id)}
                                                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-red-600/80 text-xs font-bold cursor-pointer"
                                                    style={{ color: '#FBF8F3' }}
                                                    title="Remove this item from My Status Box"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isStatusCompletedForUser) {
                                                    handleReplayUserBox();
                                                } else {
                                                    setIsStatusAutoPlaying((prev) => !prev);
                                                }
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                                            style={{ color: '#FBF8F3' }}
                                            title={
                                                isStatusCompletedForUser
                                                    ? `Replay ${activeUserBox.authorName}'s Status Box`
                                                    : isStatusAutoPlaying
                                                    ? 'Pause automatic playback'
                                                    : 'Resume automatic playback'
                                            }
                                        >
                                            {isStatusCompletedForUser ? '↻ Replay' : isStatusAutoPlaying ? '⏸ Pause' : '▶ Play'}
                                        </button>
                                        {(isEmbeddedSocialVideo || isVideoSlide || isAudioSlide) && (
                                            <button
                                                type="button"
                                                onClick={() => setIsStatusMuted((m) => !m)}
                                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                                                style={{ color: '#FBF8F3' }}
                                                title={isStatusMuted ? 'Unmute sound' : 'Mute sound'}
                                            >
                                                {isStatusMuted ? '🔇' : '🔊'}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            disabled={safeSlideIndex <= 0}
                                            onClick={() => handleStepWithinUserBox(-1)}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold cursor-pointer"
                                            style={{ color: '#FBF8F3' }}
                                            title="Previous Item in This User's Status Box"
                                        >
                                            ← Prev
                                        </button>
                                        <button
                                            type="button"
                                            disabled={safeSlideIndex >= activeUserBox.slides.length - 1}
                                            onClick={() => handleStepWithinUserBox(1)}
                                            className="px-2.5 py-1 rounded-lg bg-[#7C4225] hover:bg-[#5E3119] disabled:opacity-40 text-xs font-bold cursor-pointer"
                                            style={{ color: '#FBF8F3' }}
                                            title="Next Item in This User's Status Box"
                                        >
                                            Next →
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveStatusUserId(null)}
                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer ml-1"
                                            style={{ color: '#FBF8F3' }}
                                            title="Close Status Box"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Slide Media Body: Embedded Social Video (YouTube / Facebook / TikTok), Video, Full-Duration Music Audio, Picture, OR Structured Status Information */}
                                <div
                                    className="p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]"
                                    style={{
                                        background:
                                            isEmbeddedSocialVideo || isVideoSlide
                                                ? '#000000'
                                                : activeSlide.bgColor ||
                                                  'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
                                        color: '#FBF8F3',
                                    }}
                                >
                                    {isEmbeddedSocialVideo && parsedEmbed ? (
                                        <div
                                            className={`${
                                                parsedEmbed.isVertical ? 'w-full max-w-[330px] mx-auto' : 'w-full'
                                            } rounded-xl overflow-hidden border border-white/15 bg-black shadow-2xl flex flex-col`}
                                        >
                                            <iframe
                                                key={`${activeSlide.id}_${statusReplayNonce}`}
                                                src={buildStatusEmbedIframeSrc(
                                                    parsedEmbed.embedUrl,
                                                    parsedEmbed.provider,
                                                    isStatusMuted
                                                )}
                                                title={activeSlide.title || activeSlide.videoTitle || 'Embedded Status Video'}
                                                className={`w-full border-0 bg-black ${
                                                    parsedEmbed.isVertical
                                                        ? 'h-[450px] sm:h-[500px]'
                                                        : 'h-[260px] sm:h-[340px]'
                                                }`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                                allowFullScreen
                                                referrerPolicy="strict-origin-when-cross-origin"
                                            />
                                            <div className="px-3 py-2 bg-[#141416] border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-[#D0C4AE] flex-wrap">
                                                <span>
                                                    Playing {getPlatformBadgeLabel(activeSlide.sourcePlatform)} inside Status
                                                </span>
                                                {(parsedEmbed.originalUrl || activeSlide.externalSourceUrl) && (
                                                    <a
                                                        href={parsedEmbed.originalUrl || activeSlide.externalSourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#E8C59B] hover:underline font-bold"
                                                    >
                                                        Open Original ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : isVideoSlide ? (
                                        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-xl">
                                            <video
                                                ref={activeStatusVideoRef}
                                                key={`${activeSlide.id}_${statusReplayNonce}`}
                                                src={activeSlide.videoUrl}
                                                poster={activeSlide.imageUrl}
                                                autoPlay
                                                playsInline
                                                muted={isStatusMuted}
                                                controls
                                                onLoadedMetadata={(e) => {
                                                    const v = e.currentTarget;
                                                    if (v.duration && Number.isFinite(v.duration)) {
                                                        setActiveVideoTiming({
                                                            currentSec: v.currentTime || 0,
                                                            durationSec: v.duration,
                                                        });
                                                    }
                                                }}
                                                onTimeUpdate={(e) => {
                                                    const v = e.currentTarget;
                                                    if (v.duration && Number.isFinite(v.duration)) {
                                                        setActiveVideoTiming({
                                                            currentSec: v.currentTime,
                                                            durationSec: v.duration,
                                                        });
                                                        setStatusSlideProgress(
                                                            Math.min(100, (v.currentTime / v.duration) * 100)
                                                        );
                                                    }
                                                }}
                                                onEnded={(e) => handleFullMediaEnded(e.currentTarget)}
                                                onError={() => {
                                                    setActiveVideoTiming({ currentSec: 0, durationSec: 0 });
                                                    setActiveClipPassIndex(0);
                                                    if (isStatusAutoPlaying && safeSlideIndex < activeUserBox.slides.length - 1) {
                                                        setActiveStatusSlideIndex(safeSlideIndex + 1);
                                                        setStatusSlideProgress(0);
                                                    }
                                                }}
                                                className="w-full h-[260px] sm:h-[330px] object-contain bg-black"
                                            />
                                        </div>
                                    ) : isAudioSlide ? (
                                        <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-black/50 p-5 space-y-4 shadow-2xl">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D69E6B] shrink-0 bg-zinc-900 flex items-center justify-center">
                                                    {activeSlide.imageUrl ? (
                                                        <img
                                                            src={activeSlide.imageUrl}
                                                            alt={activeSlide.title || 'Music Track'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">🎵</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="rounded bg-[#7C4225] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                                            🎵 Full-Length Music Track
                                                        </span>
                                                        {activeSlide.mediaFormat && (
                                                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[#E8C59B]">
                                                                {activeSlide.mediaFormat}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                                        {activeSlide.title || activeSlide.videoTitle || 'Music Status Upload'}
                                                    </h4>
                                                    <p className="text-xs font-mono text-[#E8C59B]">
                                                        {formatSecondsToMmSs(cumulativeCurrentSec)} /{' '}
                                                        {cumulativeDurationSec > 0
                                                            ? formatSecondsToMmSs(cumulativeDurationSec)
                                                            : activeSlide.videoDuration || 'Full Song'}{' '}
                                                        · Plays complete track until finished
                                                    </p>
                                                </div>
                                            </div>
                                            <audio
                                                ref={activeStatusAudioRef}
                                                key={`${activeSlide.id}_${statusReplayNonce}`}
                                                src={activeSlide.audioUrl}
                                                autoPlay
                                                muted={isStatusMuted}
                                                controls
                                                onLoadedMetadata={(e) => {
                                                    const a = e.currentTarget;
                                                    if (a.duration && Number.isFinite(a.duration)) {
                                                        setActiveVideoTiming({
                                                            currentSec: a.currentTime || 0,
                                                            durationSec: a.duration,
                                                        });
                                                    }
                                                }}
                                                onTimeUpdate={(e) => {
                                                    const a = e.currentTarget;
                                                    if (a.duration && Number.isFinite(a.duration)) {
                                                        setActiveVideoTiming({
                                                            currentSec: a.currentTime,
                                                            durationSec: a.duration,
                                                        });
                                                        setStatusSlideProgress(
                                                            Math.min(100, (a.currentTime / a.duration) * 100)
                                                        );
                                                    }
                                                }}
                                                onEnded={(e) => handleFullMediaEnded(e.currentTarget)}
                                                onError={() => {
                                                    setActiveVideoTiming({ currentSec: 0, durationSec: 0 });
                                                    setActiveClipPassIndex(0);
                                                    if (isStatusAutoPlaying && safeSlideIndex < activeUserBox.slides.length - 1) {
                                                        setActiveStatusSlideIndex(safeSlideIndex + 1);
                                                        setStatusSlideProgress(0);
                                                    }
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                    ) : activeSlide.mediaType === 'photo' && activeSlide.imageUrl ? (
                                        <div className="w-full rounded-xl overflow-hidden border border-white/15 bg-black/50 shadow-xl flex items-center justify-center">
                                            <img
                                                src={activeSlide.imageUrl}
                                                alt={activeSlide.title || activeUserBox.authorName}
                                                className="w-full max-h-[320px] object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-xl rounded-2xl bg-black/25 border border-white/15 p-5 text-left space-y-3 shadow-inner">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="rounded-md bg-[#D69E6B]/25 border border-[#D69E6B]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#FBF8F3]">
                                                    📋 {activeSlide.infoBadge || 'Status Information'}
                                                </span>
                                                <span className="text-[11px] text-[#D0C4AE]">
                                                    {activeSlide.timestampLabel}
                                                </span>
                                            </div>
                                            {activeSlide.title && (
                                                <h4 className="text-base sm:text-lg font-bold text-[#FBF8F3]">
                                                    {activeSlide.title}
                                                </h4>
                                            )}
                                            <p className="text-sm text-[#FBF8F3]/95 leading-relaxed whitespace-pre-line">
                                                {activeSlide.text}
                                            </p>
                                            {activeSlide.infoDetails && (
                                                <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-xs text-[#F3EDE2]">
                                                    {activeSlide.infoDetails}
                                                </div>
                                            )}
                                            {activeSlide.attachmentName && (
                                                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs">
                                                    <span className="truncate font-semibold">
                                                        📎 {activeSlide.attachmentName}
                                                    </span>
                                                    {activeSlide.attachmentUrl && (
                                                        <a
                                                            href={activeSlide.attachmentUrl}
                                                            download={activeSlide.attachmentName}
                                                            className="rounded bg-[#7C4225] px-2.5 py-1 text-[10px] font-bold text-white shrink-0"
                                                        >
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(isEmbeddedSocialVideo || isVideoSlide || isAudioSlide || activeSlide.mediaType === 'photo') && (
                                        <div className="space-y-1 max-w-xl px-2">
                                            {(activeSlide.title || activeSlide.videoTitle) && (
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#D69E6B]">
                                                    {activeSlide.title || activeSlide.videoTitle}
                                                </p>
                                            )}
                                            <p className="text-sm sm:text-base font-semibold leading-relaxed">
                                                {activeSlide.text}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Per-User Uploaded Items Strip (Click any Video / Music / Picture / Info item uploaded by THIS user) */}
                                <div className="px-4 py-2.5 bg-[#1B1815] border-t border-white/10 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#D0C4AE]">
                                        <span>
                                            Uploaded Items in {activeUserBox.authorName}&apos;s Status Box ({activeUserBox.slides.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setStatusComposerMode('series')}
                                            className="text-[#D69E6B] hover:underline cursor-pointer"
                                        >
                                            + Upload Series / Music / Media
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {activeUserBox.slides.map((sl, idx) => {
                                            const slInt = statusInteractions[sl.id];
                                            const slRxCount = slInt
                                                ? Object.values(slInt.reactions || {}).reduce(
                                                      (a, arr) => a + (Array.isArray(arr) ? arr.length : 0),
                                                      0
                                                  )
                                                : 0;
                                            const slCmtCount = slInt?.comments?.length || 0;
                                            return (
                                                <button
                                                    key={sl.id}
                                                    type="button"
                                                    onClick={() => handleSelectSlideInUserBox(idx)}
                                                    className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                                                        idx === safeSlideIndex
                                                            ? 'bg-[#7C4225] border-[#D69E6B] text-[#FBF8F3] font-bold'
                                                            : 'bg-white/5 border-white/10 text-[#D0C4AE] hover:bg-white/15'
                                                    }`}
                                                >
                                                    <span>
                                                        {sl.mediaType === 'audio'
                                                            ? '🎵'
                                                            : sl.mediaType === 'video'
                                                            ? '🎬'
                                                            : sl.mediaType === 'photo'
                                                            ? '🖼️'
                                                            : '📋'}
                                                    </span>
                                                    <span className="max-w-[140px] truncate">
                                                        {sl.title || sl.videoTitle || sl.infoBadge || `Item ${idx + 1}`}
                                                    </span>
                                                    {sl.mediaFormat && (
                                                        <span className="rounded bg-black/40 border border-white/15 px-1 py-0.5 text-[9px] font-mono text-[#E8C59B] shrink-0">
                                                            {sl.mediaFormat}
                                                        </span>
                                                    )}
                                                    {sl.sourcePlatform && (
                                                        <span className="text-[9px] text-[#D0C4AE]/80 shrink-0">
                                                            · {sl.sourcePlatform}
                                                        </span>
                                                    )}
                                                    {(slRxCount > 0 || slCmtCount > 0) && (
                                                        <span className="text-[9px] text-[#E8C59B] font-semibold shrink-0">
                                                            {slRxCount > 0 ? ` · ❤️${slRxCount}` : ''}
                                                            {slCmtCount > 0 ? ` · 💬${slCmtCount}` : ''}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Live Reactions Summary & Comments Thread */}
                                <div className="px-4 py-2.5 bg-[#121110] border-t border-white/10 space-y-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {reactionEntries.length > 0 ? (
                                                reactionEntries.map(([emoji, users]) => {
                                                    const hasReacted = users.includes(reactorKey);
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() =>
                                                                void handleToggleStatusReaction(
                                                                    activeSlide.id,
                                                                    emoji,
                                                                    activeUserBox.authorName
                                                                )
                                                            }
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                                                                hasReacted
                                                                    ? 'bg-[#7C4225] border-[#D69E6B] text-[#FBF8F3]'
                                                                    : 'bg-white/10 border-white/15 text-[#E5DDD0] hover:bg-white/20'
                                                            }`}
                                                            title="Tap to toggle reaction"
                                                        >
                                                            <span>{emoji}</span>
                                                            <span>{users.length}</span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-[11px] text-[#A1A1AA]">
                                                    Tap an emoji below to react ({totalReactionsCount})
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowStatusComments((prev) => !prev)}
                                            className="text-[11px] font-bold text-[#E8C59B] hover:underline cursor-pointer shrink-0"
                                        >
                                            💬 {activeComments.length}{' '}
                                            {activeComments.length === 1 ? 'Comment' : 'Comments'}{' '}
                                            {showStatusComments ? '▾' : '▸'}
                                        </button>
                                    </div>

                                    {showStatusComments && (
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                            {activeComments.length === 0 ? (
                                                <p className="text-[11px] text-[#A1A1AA] py-1">
                                                    No comments yet — write a comment or tap a reaction below.
                                                </p>
                                            ) : (
                                                activeComments.map((cmt) => {
                                                    const canDelete =
                                                        activeUserBox.isCurrentUser ||
                                                        (cmt.authorEmail &&
                                                            userEmail &&
                                                            cmt.authorEmail.toLowerCase() === userEmail) ||
                                                        cmt.authorName.toLowerCase().trim() ===
                                                            userName.toLowerCase().trim();
                                                    return (
                                                        <div
                                                            key={cmt.id}
                                                            className="flex items-start justify-between gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-left"
                                                        >
                                                            <div className="flex items-start gap-2 min-w-0">
                                                                {cmt.authorAvatar ? (
                                                                    <img
                                                                        src={cmt.authorAvatar}
                                                                        alt={cmt.authorName}
                                                                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/20"
                                                                    />
                                                                ) : (
                                                                    <span className="w-6 h-6 rounded-full bg-[#7C4225] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                                        {cmt.authorName.slice(0, 1).toUpperCase()}
                                                                    </span>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-[11px] font-bold text-[#FBF8F3]">
                                                                            {cmt.authorName}
                                                                        </span>
                                                                        <span className="text-[10px] text-[#A1A1AA]">
                                                                            {cmt.timestampLabel}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-[#E5DDD0] break-words">
                                                                        {cmt.text}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {canDelete && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        void handleDeleteStatusComment(
                                                                            activeSlide.id,
                                                                            cmt.id
                                                                        )
                                                                    }
                                                                    className="text-[10px] text-[#A1A1AA] hover:text-rose-400 cursor-pointer shrink-0 px-1"
                                                                    title="Delete comment"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Live Comment + Quick Emoji Reactions Bar */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleSubmitStatusComment(
                                            activeSlide.id,
                                            activeUserBox.authorName
                                        );
                                    }}
                                    className="p-3 bg-[#141416] flex items-center gap-2 border-t border-white/10 flex-wrap sm:flex-nowrap"
                                >
                                    <input
                                        type="text"
                                        value={statusReplyText}
                                        onFocus={() => setIsStatusReplyFocused(true)}
                                        onBlur={() => setIsStatusReplyFocused(false)}
                                        onChange={(e) => setStatusReplyText(e.target.value)}
                                        placeholder="Write a comment or reply..."
                                        className="flex-1 min-w-[140px] bg-[#262629] placeholder-[#A1A1AA] text-xs rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#D69E6B]"
                                        style={{ color: '#FBF8F3' }}
                                    />
                                    <div className="flex items-center gap-1 shrink-0 flex-wrap">
                                        {(['❤️', '😍', '🙏', '🔥', '😂', '😮'] as const).map((emoji) => {
                                            const reactors = activeInteractions.reactions?.[emoji] || [];
                                            const hasReacted = reactors.includes(reactorKey);
                                            return (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() =>
                                                        void handleToggleStatusReaction(
                                                            activeSlide.id,
                                                            emoji,
                                                            activeUserBox.authorName
                                                        )
                                                    }
                                                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110 ${
                                                        hasReacted
                                                            ? 'bg-[#7C4225] ring-2 ring-[#D69E6B]'
                                                            : 'bg-white/10 hover:bg-white/20'
                                                    }`}
                                                    title={`React with ${emoji}`}
                                                >
                                                    <span>{emoji}</span>
                                                    {reactors.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-[#D69E6B] text-[#1C1917] text-[9px] font-black flex items-center justify-center leading-none">
                                                            {reactors.length}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingComment || !statusReplyText.trim()}
                                        className="px-4 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] disabled:opacity-50 text-xs font-bold cursor-pointer shrink-0"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        {isSubmittingComment ? 'Posting...' : 'Comment'}
                                    </button>
                                </form>
                            </div>
                        </div>
                        );
                    })() : (
                        <div className="w-full max-w-xl my-auto">
                            <div className="bg-[#FBF8F3] border border-[#DDD3C2] rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-2xs">
                                <div className="w-14 h-14 rounded-2xl bg-[#EFE8DA] border border-[#D0C4AE] flex items-center justify-center text-[#7C4225] shrink-0">
                                    <svg
                                        className="w-7 h-7"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <polygon
                                            points="12 3.5 14.3 9.7 20.5 12 14.3 14.3 12 20.5 9.7 14.3 3.5 12 9.7 9.7"
                                            strokeLinejoin="round"
                                        />
                                        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-[#1C1917]">
                                        {activeUserBox && activeUserBox.isCurrentUser
                                            ? 'Your Dedicated Status Box is Ready'
                                            : 'Dedicated Per-User 24h Status Boxes'}
                                    </h3>
                                    <p className="text-xs text-[#57534E] max-w-md">
                                        Every member has their own private collection box for multiple videos, pictures, and information cards. Select any user on the left or upload directly to your own Status Box below.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setStatusComposerMode('series')}
                                        style={{ color: '#FBF8F3' }}
                                        className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                                    >
                                        📺 + Upload YouTube / FB / TikTok &amp; Series
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusComposerMode('info')}
                                        className="rounded-xl bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                                    >
                                        📋 Upload Status Information
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusComposerMode('photo')}
                                        className="rounded-xl bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                                    >
                                        🖼️ Upload Pictures
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusComposerMode('video')}
                                        className="rounded-xl bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                                    >
                                        🎬 Upload Video Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================================
    // 2. CALLS VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    if (mode === 'calls') {
        const filteredCalls = callLogs.filter(
            (c) =>
                !callSearch.trim() ||
                c.name.toLowerCase().includes(callSearch.toLowerCase()) ||
                (c.subtitle || '').toLowerCase().includes(callSearch.toLowerCase())
        );

        const handleCreateNewCallLink = () => {
            const roomCode = Math.random().toString(36).substring(2, 10);
            const url = `https://conectln.com/connectin?call=${roomCode}`;
            setGeneratedCallLink(url);
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(url).catch(() => {});
            }
            triggerToast('🔗 E2EE Call link copied! Share via SMS or email to join on any cell phone.');
        };

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Calls List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                    {/* Header */}
                    <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#E0D6C5]/60">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-6 h-6 rounded-lg bg-[#7C4225] flex items-center justify-center text-[11px] font-bold shadow-2xs"
                                style={{ color: '#FBF8F3' }}
                            >
                                ◈
                            </span>
                            <h2 className="text-xl font-bold text-[#1C1917]">Calls</h2>
                            <div className="ml-1 inline-flex rounded-xl bg-[#EFE8DA] p-0.5 border border-[#D0C4AE]">
                                <button
                                    type="button"
                                    onClick={() => setCallsSidebarTab('calls')}
                                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                        callsSidebarTab === 'calls'
                                            ? 'bg-[#7C4225] text-[#FBF8F3]'
                                            : 'text-[#57534E] hover:text-[#1C1917]'
                                    }`}
                                >
                                    Recents
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCallsSidebarTab('voicemail')}
                                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                        callsSidebarTab === 'voicemail'
                                            ? 'bg-[#7C4225] text-[#FBF8F3]'
                                            : 'text-[#57534E] hover:text-[#1C1917]'
                                    }`}
                                >
                                    <span>Voicemail</span>
                                    {unreadVoicemailsCount > 0 && (
                                        <span className="px-1.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold">
                                            {unreadVoicemailsCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onStartLiveCall('video')}
                            title="Launch ConnectLn Studio Call"
                            className="w-9 h-9 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                            style={{ color: '#FBF8F3' }}
                        >
                            {/* ConnectLn Studio Acoustic Capsule Icon */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <rect x="8.5" y="3.5" width="7" height="11" rx="3.5" />
                                <path strokeLinecap="round" d="M5 10v1a7 7 0 0 0 14 0v-1" />
                                <line x1="12" y1="18" x2="12" y2="21" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {callsSidebarTab === 'voicemail' ? (
                        <div className="flex-1 overflow-y-auto px-1 pb-4">
                            <ConnectLnVoicemailInbox
                                viewerName={userName}
                                viewerEmail={currentUser?.email}
                                viewerPhone={myVerifiedCallerPhone || (currentUser as any)?.phone}
                                onCallBack={(target) => launchWhatsAppDirectCall(target, 'audio')}
                                onUnreadCountChange={setUnreadVoicemailsCount}
                            />
                        </div>
                    ) : (
                    <>
                    {/* Search / Quick Dial Bar */}
                    <div className="px-3 py-2.5">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (callSearch.trim()) {
                                    void launchSmartVoiceCall(callSearch.trim());
                                }
                            }}
                            className="relative flex items-center gap-1.5"
                        >
                            <div className="relative flex-1">
                                <input
                                    ref={callSearchInputRef}
                                    type="text"
                                    value={callSearch}
                                    onChange={(e) => setCallSearch(e.target.value)}
                                    placeholder="Search name, number or @username"
                                    className="w-full bg-[#F3EDE2] border border-[#E0D6C5] rounded-full py-2 pl-9 pr-4 text-xs text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#7C4225]"
                                />
                                <svg
                                    className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5"
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
                            </div>
                            {callSearch.trim() && (
                                <button
                                    type="submit"
                                    style={{ color: '#FBF8F3' }}
                                    className="rounded-full bg-[#7C4225] hover:bg-[#5E3119] px-3 py-1.5 text-[11px] font-bold cursor-pointer shrink-0"
                                    title="Ring on Cell Phone"
                                >
                                    📞 Dial
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Favorites & Recent Calls */}
                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-3">
                        <div>
                            <p className="px-2.5 py-1 text-xs font-bold text-[#57534E] uppercase tracking-wider">
                                Favorites
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowAddFavoriteModal((prev) => !prev)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#EFE8DA]/70 cursor-pointer transition-colors"
                            >
                                <span
                                    className="w-10 h-10 rounded-xl bg-[#7C4225] flex items-center justify-center shrink-0 shadow-2xs"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    {/* ConnectLn Starred Seal Crest */}
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <polygon points="12 3 14.6 9.4 21 12 14.6 14.6 12 21 9.4 14.6 3 12 9.4 9.4" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold text-[#1C1917]">
                                    Add favorite
                                </span>
                            </button>
                            {showAddFavoriteModal && (
                                <div className="mx-2 mt-1 p-2.5 rounded-xl bg-[#F3EDE2] border border-[#E0D6C5] text-xs text-[#57534E]">
                                    Click any recent contact below to start an instant call or pin them to Favorites.
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="px-2.5 py-1 text-xs font-bold text-[#57534E] uppercase tracking-wider">
                                Recent
                            </p>
                            <div className="space-y-0.5">
                                {filteredCalls.map((call) => (
                                    <div
                                        key={call.id}
                                        onClick={() => launchCellPhoneCall(call.name, call.avatar)}
                                        className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-[#EFE8DA]/70 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={call.avatar}
                                                alt={call.name}
                                                className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#D0C4AE]"
                                            />
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-medium truncate ${
                                                        call.direction === 'missed'
                                                            ? 'text-[#8C3B32] font-semibold'
                                                            : 'text-[#1C1917]'
                                                    }`}
                                                >
                                                    {call.name}
                                                </p>
                                                <p
                                                    className={`text-xs flex items-center gap-1 ${
                                                        call.direction === 'missed'
                                                            ? 'text-[#8C3B32] font-medium'
                                                            : 'text-[#78716C]'
                                                    }`}
                                                >
                                                    <span>
                                                        {call.direction === 'missed'
                                                            ? '↙ ◈ Missed'
                                                            : call.direction === 'incoming'
                                                            ? '↙ ◈ Incoming'
                                                            : `↗ ◈ Outgoing${call.count ? ` (${call.count})` : ''}`}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void launchSmartVoiceCall(call.name, call.avatar);
                                                }}
                                                title="Direct ConnectLn Voice Call (auto-bridges SIM if offline)"
                                                className="w-7 h-7 rounded-lg bg-[#EFE8DA] hover:bg-[#7C4225] text-[#5E3119] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                                            >
                                                📞
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    launchWhatsAppDirectCall(call.name, 'video', call.avatar);
                                                }}
                                                title="Start WhatsApp-Style Video Call"
                                                className="w-7 h-7 rounded-lg bg-[#EFE8DA] hover:bg-[#7C4225] text-[#5E3119] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                                            >
                                                🎥
                                            </button>
                                            <span className="text-[11px] text-[#78716C] ml-0.5">
                                                {call.timeLabel}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    </>
                    )}
                </div>

                {/* Right Column: "Voice and video calling" Card in Desk Note Palette */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <ConnectLnMyPhoneNumberCard
                        userName={userName}
                        userEmail={currentUser?.email}
                        userAvatar={userAvatar}
                        userHeadline={currentUser?.headline}
                        verifiedUserPhone={(currentUser as any)?.phone}
                        onVerifiedPhoneReady={(ph) => setMyVerifiedCallerPhone(ph)}
                    />
                    <div className="bg-[#FBF8F3] rounded-2xl shadow-2xs border border-[#E0D6C5] px-8 py-7 max-w-md w-full text-center mb-6">
                        {/* ConnectLn Bespoke Studio Console & Acoustic Crest Illustration */}
                        <div className="mx-auto mb-4 w-36 h-24 flex items-center justify-center">
                            <div className="relative w-32 h-20 rounded-xl border-2 border-[#5E3119] bg-[#F3EAE1] flex overflow-hidden shadow-xs">
                                <div className="w-1/2 bg-[#7C4225] flex flex-col items-center justify-center gap-1 px-2">
                                    <span
                                        className="text-sm font-extrabold tracking-widest"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        ✦ E2EE
                                    </span>
                                    <div className="flex items-end gap-1 h-4">
                                        <span className="w-1 h-2 bg-[#FBF8F3]/80 rounded-full" />
                                        <span className="w-1 h-4 bg-[#FBF8F3] rounded-full" />
                                        <span className="w-1 h-3 bg-[#FBF8F3]/90 rounded-full" />
                                        <span className="w-1 h-4 bg-[#FBF8F3] rounded-full" />
                                        <span className="w-1 h-2 bg-[#FBF8F3]/80 rounded-full" />
                                    </div>
                                </div>
                                <div className="w-1/2 bg-[#E8D8C8] flex items-center justify-center text-[#5E3119]">
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <rect x="8.5" y="3.5" width="7" height="11" rx="3.5" />
                                        <path strokeLinecap="round" d="M5 10v1a7 7 0 0 0 14 0v-1" />
                                        <line x1="12" y1="18" x2="12" y2="21" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-[#1C1917] mb-1.5">
                            Voice and video calling
                        </h3>
                        <p className="text-xs text-[#57534E] leading-relaxed">
                            Share device material &amp; screen, switch studio backgrounds, chat with everyone or selected members, and use Host Mute &amp; Co-Host controls.
                        </p>

                        {/* Compact In-Call Feature Badges */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                            <span className="rounded-full bg-[#EFE8DA] border border-[#D5BBA3] px-2.5 py-0.5 text-[10px] font-bold text-[#5E3119]">
                                🎨 Studio Backgrounds
                            </span>
                            <span className="rounded-full bg-[#EFE8DA] border border-[#D5BBA3] px-2.5 py-0.5 text-[10px] font-bold text-[#5E3119]">
                                💬 Team &amp; Direct Chat
                            </span>
                            <span className="rounded-full bg-[#EFE8DA] border border-[#D5BBA3] px-2.5 py-0.5 text-[10px] font-bold text-[#5E3119]">
                                📁 Device Material
                            </span>
                            <span className="rounded-full bg-[#EFE8DA] border border-[#D5BBA3] px-2.5 py-0.5 text-[10px] font-bold text-[#5E3119]">
                                👑 Mute &amp; Co-Host
                            </span>
                        </div>

                        {/* Ringtone Preference & Custom Device Ringtone Picker */}
                        <div className="mt-4 pt-3 border-t border-[#E0D6C5] text-left space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-extrabold text-[#5E3119]">
                                    🔔 Call Ringtone
                                </span>
                                <button
                                    type="button"
                                    onClick={() => ringtoneUploadInputRef.current?.click()}
                                    className="text-[10.5px] font-bold text-[#7C4225] hover:underline cursor-pointer"
                                >
                                    🎵 Upload From Device{customRingtoneName ? ` (${customRingtoneName})` : ''}
                                </button>
                            </div>
                            <input
                                ref={ringtoneUploadInputRef}
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    e.target.value = '';
                                    if (file.size > 3 * 1024 * 1024) {
                                        triggerToast('Please pick a ringtone audio file under 3 MB.');
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        const url = String(reader.result || '');
                                        if (url) {
                                            saveCustomDeviceRingtoneDataUrl(url, file.name);
                                            setSelectedRingtoneId('device-custom');
                                            setCustomRingtoneName(file.name);
                                            previewConnectLnRingtone('device-custom', 3800);
                                            triggerToast(`🔔 Ringtone set to device file: ${file.name}`);
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                            <div className="flex items-center gap-1.5">
                                <select
                                    value={selectedRingtoneId}
                                    onChange={(e) => {
                                        const nextId = e.target.value as ConnectLnRingtoneId;
                                        if (nextId === 'device-custom' && !customRingtoneName) {
                                            ringtoneUploadInputRef.current?.click();
                                            return;
                                        }
                                        setSelectedConnectLnRingtoneId(nextId);
                                        setSelectedRingtoneId(nextId);
                                        previewConnectLnRingtone(nextId, 3500);
                                    }}
                                    className="flex-1 rounded-xl border border-[#D0C4AE] bg-[#F3EDE2] px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                                >
                                    {CONNECTLN_RINGTONE_PRESETS.map((tone) => (
                                        <option key={tone.id} value={tone.id}>
                                            {tone.label}
                                            {tone.id === 'device-custom' && customRingtoneName
                                                ? ` (${customRingtoneName})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => previewConnectLnRingtone(selectedRingtoneId, 3800)}
                                    style={{ color: '#FBF8F3' }}
                                    className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-3 py-1.5 text-xs font-bold cursor-pointer shrink-0"
                                >
                                    ▶️ Preview
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4 ConnectLn Desk Note Tile Buttons: Start call, New call link, Call a number, Schedule call */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button
                            type="button"
                            onClick={() => {
                                const typedTarget = callSearch.trim();
                                if (typedTarget) {
                                    launchWhatsAppDirectCall(typedTarget, 'video');
                                } else if (callLogs[0]?.name) {
                                    launchWhatsAppDirectCall(callLogs[0].name, 'video', callLogs[0].avatar);
                                } else {
                                    onStartLiveCall('video');
                                }
                            }}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span
                                className="w-12 h-12 rounded-2xl bg-[#7C4225] group-hover:bg-[#5E3119] flex items-center justify-center shadow-sm transition-colors"
                                style={{ color: '#FBF8F3' }}
                            >
                                {/* ConnectLn Studio Aperture & Live Lens */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <rect x="2.5" y="5.5" width="13.5" height="13" rx="2.5" />
                                    <polygon points="22 7.5 16 12 22 16.5 22 7.5" strokeLinejoin="round" />
                                    <circle cx="9.25" cy="12" r="2.2" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">Start call</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateNewCallLink}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-2xl bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] flex items-center justify-center shadow-2xs transition-colors">
                                {/* ConnectLn Interlocking Diamond Link Seal */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <polygon points="9 6 15 12 9 18 3 12" strokeLinejoin="round" />
                                    <polygon points="15 6 21 12 15 18 9 12" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">New call link</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => callSearchInputRef.current?.focus()}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-2xl bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] flex items-center justify-center shadow-2xs transition-colors">
                                {/* ConnectLn Diamond Matrix Keypad */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="4.5" y="4.5" width="3" height="3" rx="0.8" />
                                    <rect x="10.5" y="4.5" width="3" height="3" rx="0.8" />
                                    <rect x="16.5" y="4.5" width="3" height="3" rx="0.8" />
                                    <rect x="4.5" y="10.5" width="3" height="3" rx="0.8" />
                                    <rect x="10.5" y="10.5" width="3" height="3" rx="0.8" />
                                    <rect x="16.5" y="10.5" width="3" height="3" rx="0.8" />
                                    <rect x="4.5" y="16.5" width="3" height="3" rx="0.8" />
                                    <rect x="10.5" y="16.5" width="3" height="3" rx="0.8" />
                                    <rect x="16.5" y="16.5" width="3" height="3" rx="0.8" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">Call a number</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenScheduleModal}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-2xl bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#5E3119] flex items-center justify-center shadow-2xs transition-colors">
                                {/* ConnectLn Editorial Folio Calendar */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <rect x="3" y="4" width="18" height="17" rx="2.5" />
                                    <line x1="16" y1="2.5" x2="16" y2="6" strokeLinecap="round" />
                                    <line x1="8" y1="2.5" x2="8" y2="6" strokeLinecap="round" />
                                    <line x1="3" y1="9.5" x2="21" y2="9.5" />
                                    <polygon points="12 12.5 13.8 15 12 17.5 10.2 15" fill="currentColor" stroke="none" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">Schedule call</span>
                        </button>
                    </div>

                    {generatedCallLink && (
                        <div className="mt-5 bg-[#FBF8F3] border border-[#D5BBA3] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                            <span className="text-xs font-mono text-[#292524] truncate max-w-xs">
                                {generatedCallLink}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const codeMatch = generatedCallLink.match(/[?&](?:call|joinCall)=([^&]+)/);
                                    if (codeMatch?.[1] && typeof window !== 'undefined') {
                                        window.location.href = `/connectin?tab=vibecomms&joinCall=${encodeURIComponent(codeMatch[1])}`;
                                    } else {
                                        onStartLiveCall('video');
                                    }
                                }}
                                className="px-3 py-1 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                style={{ color: '#FBF8F3' }}
                            >
                                Join Now
                            </button>
                        </div>
                    )}

                    {/* WhatsApp-Style Direct WebRTC + Push Ringing Voice & Video Call Modal (fresh callId & state per call) */}
                    {activeWhatsAppCall && (
                        <ConnectLnWhatsAppCallModal
                            key={activeWhatsAppCall.callId}
                            open={true}
                            onClose={() => setActiveWhatsAppCall(null)}
                            initialCallId={activeWhatsAppCall.callId}
                            initialMode={activeWhatsAppCall.mode}
                            targetLabel={activeWhatsAppCall.label}
                            targetPhone={activeWhatsAppCall.phone}
                            targetAvatar={activeWhatsAppCall.avatar}
                            callerName={userName}
                            callerEmail={currentUser?.email}
                            callerAvatar={userAvatar}
                            onBridgeCarrierFallback={(phoneOrName) => {
                                setActiveWhatsAppCall(null);
                                launchCellPhoneCall(phoneOrName);
                            }}
                        />
                    )}

                    {/* Live Carrier Browser-to-Cell-Phone Softphone Console */}
                    <ConnectLnCellPhoneSoftphoneModal
                        open={Boolean(activeSoftphoneTarget)}
                        onClose={() => setActiveSoftphoneTarget(null)}
                        targetLabel={activeSoftphoneTarget?.label || ''}
                        targetPhone={activeSoftphoneTarget?.phone}
                        targetAvatar={activeSoftphoneTarget?.avatar}
                        callerName={userName}
                        callerEmail={currentUser?.email}
                        callerAvatar={userAvatar}
                        roomJoinUrl={generatedCallLink || undefined}
                        onUpgradeToVideoHuddle={(label) => {
                            const targetAvatar = activeSoftphoneTarget?.avatar;
                            const targetPhone = activeSoftphoneTarget?.phone;
                            setActiveSoftphoneTarget(null);
                            launchWhatsAppDirectCall(targetPhone || label, 'video', targetAvatar);
                        }}
                    />
                </div>
            </div>
        );
    }

    // =========================================================================
    // 3. COMMUNITIES VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    if (mode === 'communities') {
        const activeCommObj = selectedCommunityGroup
            ? communities.find((c) => c.id === selectedCommunityGroup.communityId)
            : null;
        const activeGroupObj = activeCommObj?.groups.find(
            (g) => g.id === selectedCommunityGroup?.groupId
        );

        const handleCreateCommunity = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newCommName.trim()) return;
            const created: CommunityGroupItem = {
                id: `comm_${Date.now()}`,
                name: newCommName.trim(),
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCommName.trim())}&backgroundColor=7c4225`,
                subtitle: newCommDesc.trim() || 'Topic-based ConnectLn Community',
                groups: [
                    {
                        id: `grp_ann_${Date.now()}`,
                        name: 'Announcements',
                        isAnnouncement: true,
                        lastPreview: '✓✓ You: Welcome to the community!',
                        dateLabel: 'Just now',
                        messages: [
                            {
                                id: `m_${Date.now()}`,
                                sender: userName,
                                text: `Welcome to ${newCommName.trim()}! Admin announcements will be posted here.`,
                                time: 'Just now',
                            },
                        ],
                    },
                ],
            };
            setCommunities((prev) => [created, ...prev]);
            setNewCommName('');
            setNewCommDesc('');
            setShowNewCommunityModal(false);
            setSelectedCommunityGroup({
                communityId: created.id,
                groupId: created.groups[0].id,
            });
            triggerToast(`🌐 Community "${created.name}" created!`);
        };

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Communities List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#E0D6C5]/60">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-6 h-6 rounded-lg bg-[#7C4225] flex items-center justify-center text-[11px] font-bold shadow-2xs"
                                style={{ color: '#FBF8F3' }}
                            >
                                ⬡
                            </span>
                            <h2 className="text-xl font-bold text-[#1C1917]">Communities</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowNewCommunityModal(true)}
                            title="New community"
                            className="w-8 h-8 rounded-xl bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] flex items-center justify-center text-[#5E3119] cursor-pointer transition-colors"
                        >
                            {/* ConnectLn Hexagonal Guild + Seal */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <polygon points="12 2.5 19.5 6.8 19.5 15.2 12 19.5 4.5 15.2 4.5 6.8" strokeLinejoin="round" />
                                <line x1="12" y1="8" x2="12" y2="14" strokeLinecap="round" />
                                <line x1="9" y1="11" x2="15" y2="11" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2 pt-2">
                        {/* New community row */}
                        <button
                            type="button"
                            onClick={() => setShowNewCommunityModal(true)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EFE8DA]/70 cursor-pointer transition-colors"
                        >
                            <span
                                className="w-11 h-11 rounded-xl bg-[#7C4225] flex items-center justify-center shrink-0 shadow-2xs"
                                style={{ color: '#FBF8F3' }}
                            >
                                {/* ConnectLn Bespoke Interlocking Hexagonal Guild Shield */}
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                                    <polygon
                                        points="12 2.5 19.5 6.8 19.5 15.2 12 19.5 4.5 15.2 4.5 6.8"
                                        strokeLinejoin="round"
                                    />
                                    <polygon
                                        points="12 7 16 9.3 16 13.7 12 16 8 13.7 8 9.3"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="12" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
                                </svg>
                            </span>
                            <span className="text-sm font-semibold text-[#1C1917]">
                                New community
                            </span>
                        </button>

                        {/* Communities & Subgroups */}
                        {communities.map((comm) => (
                            <div key={comm.id} className="pt-2 border-t border-[#E0D6C5]/70">
                                <div className="flex items-center gap-3 p-2">
                                    <img
                                        src={comm.avatar}
                                        alt={comm.name}
                                        className="w-11 h-11 rounded-xl object-cover border border-[#D0C4AE] shrink-0"
                                    />
                                    <span className="text-sm font-bold text-[#1C1917]">
                                        {comm.name}
                                    </span>
                                </div>

                                <div className="space-y-0.5 mt-1">
                                    {comm.groups.map((grp) => {
                                        const isSel =
                                            selectedCommunityGroup?.communityId === comm.id &&
                                            selectedCommunityGroup?.groupId === grp.id;
                                        return (
                                            <div
                                                key={grp.id}
                                                onClick={() => {
                                                    setSelectedCommunityGroup({
                                                        communityId: comm.id,
                                                        groupId: grp.id,
                                                    });
                                                    setShowNewCommunityModal(false);
                                                }}
                                                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                                                    isSel ? 'bg-[#EFE8DA]' : 'hover:bg-[#F6F1E7]'
                                                }`}
                                            >
                                                <span
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                                        grp.isAnnouncement
                                                            ? 'bg-[#F3EAE1] text-[#7C4225] border-[#D5BBA3]'
                                                            : 'bg-[#EFE8DA] text-[#524B42] border-[#D0C4AE]'
                                                    }`}
                                                >
                                                    {grp.isAnnouncement ? (
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                            <polygon points="12 3 20 19 4 19" strokeLinejoin="round" />
                                                            <circle cx="12" cy="13.5" r="1.5" fill="currentColor" stroke="none" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                            <polygon points="12 3 19 7 19 15 12 19 5 15 5 7" strokeLinejoin="round" />
                                                            <circle cx="12" cy="11" r="2" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-[#1C1917] truncate">
                                                            {grp.name}
                                                        </p>
                                                        <span className="text-[11px] text-[#78716C] shrink-0">
                                                            {grp.dateLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#78716C] truncate">
                                                        {grp.lastPreview}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedCommunityGroup({
                                            communityId: comm.id,
                                            groupId: comm.groups[0].id,
                                        })
                                    }
                                    className="px-3 py-1.5 text-xs font-bold text-[#7C4225] hover:underline cursor-pointer"
                                >
                                    View all
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Create Communities Canvas or Selected Community Chat */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6">
                    {showNewCommunityModal ? (
                        <form
                            onSubmit={handleCreateCommunity}
                            className="bg-[#FBF8F3] rounded-2xl shadow-md border border-[#E0D6C5] p-6 max-w-md w-full space-y-4 animate-in fade-in"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-[#1C1917]">
                                    Create a New Community
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCommunityModal(false)}
                                    className="text-[#78716C] hover:text-[#1C1917] font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                                    Community Name
                                </label>
                                <input
                                    type="text"
                                    value={newCommName}
                                    onChange={(e) => setNewCommName(e.target.value)}
                                    placeholder="e.g. Master Builders Guild"
                                    className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={newCommDesc}
                                    onChange={(e) => setNewCommDesc(e.target.value)}
                                    placeholder="Bring members together in topic-based groups and send admin announcements..."
                                    className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewCommunityModal(false)}
                                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#57534E] hover:bg-[#EFE8DA] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-1.5 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    Create Community
                                </button>
                            </div>
                        </form>
                    ) : activeCommObj && activeGroupObj ? (
                        <div className="w-full h-full flex flex-col bg-[#F3EDE2] rounded-xl overflow-hidden border border-[#E0D6C5]">
                            <div className="px-4 py-3 bg-[#FBF8F3] border-b border-[#E0D6C5] flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[#1C1917]">
                                        {activeCommObj.name} · {activeGroupObj.name}
                                    </p>
                                    <p className="text-xs text-[#78716C]">{activeCommObj.subtitle}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCommunityGroup(null)}
                                    className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                                >
                                    ✕ Close
                                </button>
                            </div>
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                                {activeGroupObj.messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className="bg-[#E8D8C8] border border-[#D5BBA3] rounded-xl p-3 max-w-lg ml-auto shadow-2xs"
                                    >
                                        <p className="text-[11px] font-bold text-[#5E3119] mb-0.5">
                                            {m.sender}
                                        </p>
                                        <p className="text-xs text-[#1C1917]">{m.text}</p>
                                        <p className="text-[10px] text-[#57534E] text-right mt-1">
                                            {m.time} ✓✓
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!commMessageInput.trim()) return;
                                    const text = commMessageInput.trim();
                                    setCommunities((prev) =>
                                        prev.map((c) =>
                                            c.id !== activeCommObj.id
                                                ? c
                                                : {
                                                      ...c,
                                                      groups: c.groups.map((g) =>
                                                          g.id !== activeGroupObj.id
                                                              ? g
                                                              : {
                                                                    ...g,
                                                                    lastPreview: `✓✓ You: ${text}`,
                                                                    dateLabel: 'Just now',
                                                                    messages: [
                                                                        ...g.messages,
                                                                        {
                                                                            id: `msg_${Date.now()}`,
                                                                            sender: 'You',
                                                                            text,
                                                                            time: 'Just now',
                                                                        },
                                                                    ],
                                                                }
                                                      ),
                                                  }
                                        )
                                    );
                                    setCommMessageInput('');
                                }}
                                className="p-3 bg-[#FBF8F3] border-t border-[#E0D6C5] flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={commMessageInput}
                                    onChange={(e) => setCommMessageInput(e.target.value)}
                                    placeholder={`Post announcement to ${activeGroupObj.name}...`}
                                    className="flex-1 bg-[#F8F4EC] border border-[#D0C4AE] rounded-full px-4 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Default "Create communities" Screen in Desk Note Palette */
                        <div className="text-center max-w-md flex flex-col items-center">
                            <div className="w-20 h-20 mb-4 rounded-2xl bg-[#EFE8DA] border-2 border-[#D0C4AE] shadow-xs flex items-center justify-center text-[#7C4225]">
                                {/* ConnectLn Bespoke Interlocking Hexagonal Guild Crest */}
                                <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                    <polygon
                                        points="12 2.5 19.5 6.8 19.5 15.2 12 19.5 4.5 15.2 4.5 6.8"
                                        strokeLinejoin="round"
                                    />
                                    <polygon
                                        points="12 7 16 9.3 16 13.7 12 16 8 13.7 8 9.3"
                                        fill="currentColor"
                                        fillOpacity={0.18}
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="12" cy="11.5" r="1.8" fill="currentColor" stroke="none" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-normal text-[#1C1917] mb-2">
                                Create communities
                            </h3>
                            <p className="text-sm text-[#57534E] mb-6 max-w-sm">
                                Bring members together in topic-based groups and easily send them
                                admin announcements.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowNewCommunityModal(true)}
                                className="px-5 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold shadow-sm cursor-pointer transition-colors"
                                style={{ color: '#FBF8F3' }}
                            >
                                ⬡ New community
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================================
    // 4. ARCHIVED VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    if (mode === 'archived') {
        const dynamicArchivedFromThreads: ArchivedChatEntry[] = threads
            .filter((t) => archivedThreadIds.includes(t.id))
            .map((t) => ({
                id: t.id,
                name: t.title,
                avatar: t.avatar,
                lastMessage: t.lastMessage,
                dateLabel: t.lastMessageTime,
                unreadCount: t.unreadCount || 0,
                subtitle: t.subtitle,
            }));

        const allArchived = [...dynamicArchivedFromThreads, ...presetArchived];
        const selectedArch = allArchived.find((a) => a.id === selectedArchivedId) || null;

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Archived Chats List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                    <div className="px-4 pt-3.5 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="w-6 h-6 rounded-lg bg-[#7C4225] flex items-center justify-center text-[11px] font-bold shadow-2xs"
                                style={{ color: '#FBF8F3' }}
                            >
                                ▣
                            </span>
                            <h2 className="text-xl font-bold text-[#1C1917]">Archived</h2>
                        </div>
                        <p className="text-xs text-[#57534E] leading-relaxed pb-3 border-b border-[#E0D6C5]">
                            These chats stay archived when new messages are received. To change
                            this experience, go to{' '}
                            <strong className="font-semibold text-[#1C1917]">
                                Settings &gt; Chats
                            </strong>{' '}
                            on your phone.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
                        {allArchived.map((item) => {
                            const isSel = selectedArchivedId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedArchivedId(item.id)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                                        isSel ? 'bg-[#EFE8DA]' : 'hover:bg-[#F6F1E7]'
                                    }`}
                                >
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-[#D0C4AE] shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-[#1C1917] truncate">
                                                {item.name}
                                            </p>
                                            <span
                                                className={`text-[11px] shrink-0 ${
                                                    item.unreadCount > 0
                                                        ? 'text-[#7C4225] font-bold'
                                                        : 'text-[#78716C]'
                                                }`}
                                            >
                                                {item.dateLabel}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p
                                                className={`text-xs truncate ${
                                                    item.isBlocked
                                                        ? 'italic text-[#78716C]'
                                                        : 'text-[#57534E]'
                                                }`}
                                            >
                                                {item.lastMessage}
                                            </p>
                                            {item.unreadCount > 0 && (
                                                <span
                                                    className="min-w-[20px] h-5 px-1.5 rounded-md bg-[#7C4225] text-[11px] font-bold flex items-center justify-center shrink-0"
                                                    style={{ color: '#FBF8F3' }}
                                                >
                                                    {item.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6">
                    {selectedArch ? (
                        <div className="bg-[#FBF8F3] rounded-2xl shadow-md border border-[#E0D6C5] p-6 max-w-md w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedArch.avatar}
                                        alt={selectedArch.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-[#D0C4AE]"
                                    />
                                    <div>
                                        <h3 className="text-base font-bold text-[#1C1917]">
                                            {selectedArch.name}
                                        </h3>
                                        <p className="text-xs text-[#78716C]">
                                            {selectedArch.subtitle || 'Archived Conversation'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedArchivedId(null)}
                                    className="text-[#78716C] hover:text-[#1C1917] font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#F3EDE2] border border-[#E0D6C5] text-xs text-[#1C1917]">
                                <span className="font-semibold text-[#57534E] block mb-1">
                                    Last message ({selectedArch.dateLabel}):
                                </span>
                                {selectedArch.lastMessage}
                            </div>

                            {!selectedArch.isBlocked && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!archivedReplyInput.trim()) return;
                                        const text = archivedReplyInput.trim();
                                        setPresetArchived((prev) =>
                                            prev.map((a) =>
                                                a.id === selectedArch.id
                                                    ? {
                                                          ...a,
                                                          lastMessage: `You: ${text}`,
                                                          dateLabel: 'Just now',
                                                          unreadCount: 0,
                                                      }
                                                    : a
                                            )
                                        );
                                        setArchivedReplyInput('');
                                        triggerToast(`✓ Sent reply to ${selectedArch.name}.`);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        value={archivedReplyInput}
                                        onChange={(e) => setArchivedReplyInput(e.target.value)}
                                        placeholder={`Message ${selectedArch.name}...`}
                                        className="flex-1 border border-[#D0C4AE] bg-[#F8F4EC] rounded-full px-3.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        Send
                                    </button>
                                </form>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-[#E0D6C5]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (archivedThreadIds.includes(selectedArch.id)) {
                                            onUnarchiveThread(selectedArch.id);
                                            onSelectChatThread(selectedArch.id);
                                        } else {
                                            setPresetArchived((prev) =>
                                                prev.filter((a) => a.id !== selectedArch.id)
                                            );
                                            triggerToast(
                                                `📬 Unarchived "${selectedArch.name}" back to Chats.`
                                            );
                                        }
                                        setSelectedArchivedId(null);
                                    }}
                                    className="px-4 py-1.5 rounded-full bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-xs font-bold text-[#1C1917] cursor-pointer"
                                >
                                    ▣ Unarchive to Chats
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Default Right Canvas in Desk Note Palette */
                        <div className="text-center max-w-md flex flex-col items-center">
                            <div className="w-20 h-20 mb-4 rounded-2xl bg-[#EFE8DA] border-2 border-[#D0C4AE] shadow-xs flex items-center justify-center text-[#7C4225]">
                                {/* ConnectLn Bespoke Editorial Vault Shield & Keyhole Folio */}
                                <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
                                    <line x1="8" y1="3.5" x2="8" y2="20.5" />
                                    <circle cx="14" cy="11" r="2.2" fill="currentColor" fillOpacity={0.2} />
                                    <path strokeLinecap="round" d="M14 13.2v2.8" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-normal text-[#1C1917] mb-2">
                                ConnectLn Archive Vault
                            </h3>
                            <p className="text-sm text-[#57534E] max-w-sm">
                                Select an archived folio on the left to review past transcripts or
                                restore conversations to your active Desk Note inbox.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================================
    // 5. CHANNELS VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    const activeChan = channels.find((c) => c.id === selectedChannelId) || null;
    return (
        <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
            <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#E0D6C5]/60">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-6 h-6 rounded-lg bg-[#7C4225] flex items-center justify-center text-[11px] font-bold shadow-2xs"
                            style={{ color: '#FBF8F3' }}
                        >
                            △
                        </span>
                        <h2 className="text-xl font-bold text-[#1C1917]">Pulse</h2>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2 space-y-1">
                    {channels.map((ch) => (
                        <div
                            key={ch.id}
                            onClick={() => setSelectedChannelId(ch.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                                selectedChannelId === ch.id ? 'bg-[#EFE8DA]' : 'hover:bg-[#F6F1E7]'
                            }`}
                        >
                            <img
                                src={ch.avatar}
                                alt={ch.name}
                                className="w-11 h-11 rounded-xl object-cover border border-[#D0C4AE] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#1C1917] truncate">
                                    {ch.name}
                                </p>
                                <p className="text-xs text-[#78716C] truncate">{ch.lastUpdate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center text-center min-w-0">
                {activeChan ? (
                    <PulseChannelFeed
                        key={activeChan.id}
                        channelId={activeChan.id}
                        name={activeChan.name}
                        followers={activeChan.followers}
                        avatar={activeChan.avatar}
                        source={activeChan.source}
                    />
                ) : (
                    <div className="max-w-md flex flex-col items-center p-6">
                        <div className="w-20 h-20 mb-4 rounded-2xl bg-[#EFE8DA] border-2 border-[#D0C4AE] shadow-xs flex items-center justify-center text-[#7C4225]">
                            <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                <polygon points="12 3 20 19 4 19" strokeLinejoin="round" />
                                <circle cx="12" cy="13.5" r="2" fill="currentColor" stroke="none" />
                                <path strokeLinecap="round" d="M8.5 7.5a5.5 5.5 0 0 1 7 0" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-normal text-[#1C1917] mb-2">
                            Stay updated on topics that matter
                        </h3>
                        <p className="text-sm text-[#57534E]">
                            Select a channel on the left to read broadcast updates from verified
                            ConnectLn leaders and guilds.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
