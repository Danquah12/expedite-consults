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

export type MessagingWorkspaceMode =
    | 'chats'
    | 'calls'
    | 'status'
    | 'channels'
    | 'communities'
    | 'archived';

export interface StatusUpdateItem {
    id: string;
    authorName: string;
    authorAvatar: string;
    timestampLabel: string;
    viewed: boolean;
    mediaType: 'text' | 'photo' | 'video' | 'info';
    title?: string;
    text: string;
    infoDetails?: string;
    infoBadge?: string;
    attachmentName?: string;
    attachmentUrl?: string;
    bgColor?: string;
    imageUrl?: string;
    videoUrl?: string;
    videoDuration?: string;
    videoTitle?: string;
    professionTag?: string;
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
    },
    {
        label: 'Executive Property Walkthrough',
        videoUrl: '/status-videos/realtor.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
    },
    {
        label: 'Clinical & Biomedical Bench Reel',
        videoUrl: '/status-videos/physician.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900',
    },
    {
        label: 'Systems & Software Build Clip',
        videoUrl: '/status-videos/developer.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
    },
    {
        label: 'AI Agentic Flywheel Telemetry',
        videoUrl: '/status-videos/agentic_flywheel.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
    },
    {
        label: 'Aerospace & Orbital Telemetry',
        videoUrl: '/status-videos/nasa_space.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900',
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
        videoDuration: '0:18',
        videoTitle: 'Downtown Site & Structural Corridor Walkthrough',
        text: 'New site delivery & structural blueprint inspection complete — ready for phase 2 commissioning.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
        professionTag: 'Field Operations',
    },
    {
        id: 'st_boat_photo',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 1:15 PM',
        viewed: false,
        mediaType: 'photo',
        title: 'Steel Truss & Rigging Inspection Shot',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        text: 'North bay structural beams verified and torque-checked ahead of concrete pour.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
        professionTag: 'Field Operations',
    },
    {
        id: 'st_boat_info',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 12:40 PM',
        viewed: false,
        mediaType: 'info',
        infoBadge: 'Site Dispatch Notice',
        title: 'Phase 2 Commissioning Window & Gate Access Info',
        text: 'Electrical and rigging subcontractors can clear Gate B starting 6:30 AM tomorrow.',
        infoDetails: 'Supervisor on duty: Boat · Radio Channel 4 · PPE Level B & OSHA 30 badge required.',
        attachmentName: 'Phase2_Rigging_Signoff_Checklist.pdf',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Field Operations',
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
        videoTitle: 'Live Cloud Cluster & Runtime Telemetry Lab',
        text: 'Live Cloud Security & Zero-Trust runtime lab cohort starts at 4:00 PM EST! Drop a message to join.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900',
        bgColor: 'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)',
        professionTag: 'Cyber & IT Training',
    },
    {
        id: 'st_it_guru_info',
        authorName: 'IT-Guru GURU Trainer',
        authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
        timestampLabel: 'Today at 11:30 AM',
        viewed: false,
        mediaType: 'info',
        infoBadge: 'Training Cohort Info',
        title: 'SOC & Kubernetes eBPF Hands-On Lab Syllabus',
        text: 'Open seats remaining for evening lab covering runtime threat containment, Zero-Trust policies, and incident response drills.',
        infoDetails: 'Schedule: 4:00 PM – 6:30 PM EST · Lab VMs provisioned automatically for registered members.',
        attachmentName: 'ZeroTrust_eBPF_Lab_Guide_v4.pdf',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Cyber & IT Training',
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
        videoTitle: 'Commercial Interior & Executive Suite Walkthrough',
        text: 'Commercial interior & executive office collection now in stock for regional contractors and design teams.',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Commercial Furnishings',
    },
    {
        id: 'st_ashley_photo',
        authorName: 'Ashley Furniture Homestore JA',
        authorAvatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
        timestampLabel: 'Today at 7:40 AM',
        viewed: false,
        mediaType: 'photo',
        title: 'Executive Lounge & Conference Inventory',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        text: 'Same-week white-glove staging available for hospitality and corporate suites.',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #5e3119 100%)',
        professionTag: 'Commercial Furnishings',
    },
    {
        id: 'st_sam_k',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 2:10 PM',
        viewed: false,
        mediaType: 'video',
        videoUrl: '/status-videos/developer.mp4',
        videoDuration: '0:16',
        videoTitle: 'Control Systems & Automation Build Verification',
        text: 'On-site systems commissioning wrapped ahead of schedule. Grateful for the entire engineering crew!',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #7c4225 100%)',
        professionTag: 'Systems Engineering',
    },
    {
        id: 'st_sam_k_photo',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 1:45 PM',
        viewed: false,
        mediaType: 'photo',
        title: 'PLC Telemetry Bench Verification',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900',
        text: 'All Modbus & OPC-UA SCADA endpoints passed 24-hour soak testing with zero packet drop.',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #7c4225 100%)',
        professionTag: 'Systems Engineering',
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
        videoTitle: 'Q4 Engineering Cost & Tender Modeling',
        text: 'Reviewing Q4 procurement tenders, structural load calculations, and supplier SLA renewals today.',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
        professionTag: 'Procurement & Estimation',
    },
    {
        id: 'st_murchisson_info',
        authorName: 'Murchisson',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        timestampLabel: 'Today at 10:12 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Procurement Notice',
        title: 'Q4 Vendor Bid Cut-Off Schedule',
        text: 'All structural steel, MEP switchgear, and commercial HVAC BOM bids must be submitted by Friday 5:00 PM.',
        infoDetails: 'Contact Murchisson for addendum drawings and bonded surety requirements.',
        attachmentName: 'Q4_Master_Tender_Schedule.xlsx',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
        professionTag: 'Procurement & Estimation',
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
        videoTitle: 'Central Workshop & Operations Readiness Briefing',
        text: 'Morning team briefing and live scenario readiness check at the central workshop.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #443c34 100%)',
        professionTag: 'Workshop Operations',
    },
    {
        id: 'st_mike_mukasa_photo',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 9:10 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Central Workshop CNC & Fabrication Floor',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
        text: 'Precision calibration bay prepped for incoming turbine housing fabrication run.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #443c34 100%)',
        professionTag: 'Workshop Operations',
    },
    {
        id: 'st_mike_mukasa_info',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 8:55 AM',
        viewed: true,
        mediaType: 'info',
        infoBadge: 'Workshop Shift Update',
        title: 'Safety & Tooling Readiness Summary',
        text: 'All overhead cranes, diagnostic rigs, and torque benches passed morning shift certification.',
        infoDetails: 'Shift hours: 7:00 AM – 6:00 PM · Visitors check in with Workshop Desk.',
        attachmentName: 'Workshop_Readiness_Log_Today.pdf',
        bgColor: 'linear-gradient(135deg, #4d6b53 0%, #2f4534 100%)',
        professionTag: 'Workshop Operations',
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
        videoTitle: 'Global Commercial Corridor & Aerial Overview',
        text: 'New commercial property portfolio & executive campus listings open for private walkthroughs this week.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #5e3119 100%)',
        professionTag: 'Commercial Real Estate',
    },
    {
        id: 'st_suzzan_photo',
        authorName: 'Suzzan Coldwell Banker',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        timestampLabel: 'Today at 8:40 AM',
        viewed: true,
        mediaType: 'photo',
        title: 'Waterfront Mixed-Use Tower Tour',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900',
        text: '42,000 sq ft turnkey flagship floorplate available for immediate medical or tech fit-out.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #5e3119 100%)',
        professionTag: 'Commercial Real Estate',
    },
    {
        id: 'st_naana',
        authorName: 'Naana L',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        timestampLabel: 'Today at 7:03 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/hallelujah_choir.mp4',
        videoDuration: '0:28',
        videoTitle: 'Morning Inspiration & Harmony Session',
        text: 'Blessed morning! Wishing everyone an uplifting and productive workday.',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900',
        bgColor: 'linear-gradient(135deg, #63331b 0%, #8a4b29 100%)',
        professionTag: 'Community & Culture',
    },
    {
        id: 'st_branding',
        authorName: 'Branding - Market Project',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        timestampLabel: 'Today at 4:54 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/bounce.mp4',
        videoDuration: '0:21',
        videoTitle: 'Brand Identity Motion Reel & Visual Campaign',
        text: 'Updated brand identity motion reel and visual campaign assets uploaded to the shared project folder.',
        imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=900',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
        professionTag: 'Creative Direction',
    },
    {
        id: 'st_ob',
        authorName: 'OB',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        timestampLabel: 'Today at 4:12 AM',
        viewed: true,
        mediaType: 'video',
        videoUrl: '/status-videos/run.mp4',
        videoDuration: '0:19',
        videoTitle: 'Early Shift Field Run & Diagnostics',
        text: 'Early shift field run & morning diagnostics complete — all systems green for today.',
        imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900',
        bgColor: 'linear-gradient(135deg, #1c1917 0%, #3d3730 100%)',
        professionTag: 'Field Diagnostics',
    },
];

function groupSlidesToUserBoxes(slides: StatusUpdateItem[], ownerName: string, ownerAvatar: string): UserStatusBox[] {
    const map = new Map<string, UserStatusBox>();
    const ownerSlug = ownerName.toLowerCase().trim();

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
        const isOwner = s.id.startsWith('st_me_') || cleanAuthor.toLowerCase() === ownerSlug;
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
    currentUserAvatar,
}: {
    activeMode: MessagingWorkspaceMode;
    onSelectMode: (mode: MessagingWorkspaceMode) => void;
    unreadChatsCount: number;
    unreadArchivedCount: number;
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
    triggerToast: (msg: string) => void;
}) {
    const userAvatar = currentUser?.avatar || '/brand/kwesi-avatar.png';
    const userName = currentUser?.name || 'Kwesi Asiedu';

    // ---- STATUS STATE (Per-User Multi-Item Status Boxes) ----
    const statusStorageKey = `connectln_user_status_boxes_v2__${userName.toLowerCase().trim()}`;
    const [statusBoxes, setStatusBoxes] = useState<UserStatusBox[]>(() => {
        const seeded = groupSlidesToUserBoxes(INITIAL_STATUS_UPDATES, userName, userAvatar);
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
                                !String(sl.videoUrl || '').startsWith('blob:')
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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const serializable = statusBoxes.map((box) =>
                box.isCurrentUser
                    ? {
                          userId: box.userId,
                          slides: box.slides.filter((sl) => !String(sl.videoUrl || '').startsWith('blob:')),
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
    const [statusComposerMode, setStatusComposerMode] = useState<'video' | 'photo' | 'info' | null>(null);
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
    const [queuedPhotoUploads, setQueuedPhotoUploads] = useState<Array<{ id: string; name: string; dataUrl: string }>>([]);
    const [queuedVideoUploads, setQueuedVideoUploads] = useState<Array<{ id: string; name: string; url: string }>>([]);
    const [statusBgColor, setStatusBgColor] = useState(
        'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)'
    );
    const [statusReplyText, setStatusReplyText] = useState('');

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
            if (!activeUserBox || activeUserBox.slides.length <= 1) return;
            const nextIdx =
                (safeSlideIndex + delta + activeUserBox.slides.length) % activeUserBox.slides.length;
            setActiveStatusSlideIndex(nextIdx);
        };

        const handleSelectSlideInUserBox = (idx: number) => {
            if (!activeUserBox || idx < 0 || idx >= activeUserBox.slides.length) return;
            setActiveStatusSlideIndex(idx);
        };

        const handleDeleteMySlide = (slideId: string) => {
            setStatusBoxes((prev) =>
                prev.map((b) =>
                    b.isCurrentUser ? { ...b, slides: b.slides.filter((sl) => sl.id !== slideId) } : b
                )
            );
            setActiveStatusSlideIndex(0);
            triggerToast('🗑️ Removed status item from My Status Box.');
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
                }))
            );
            setQueuedPhotoUploads((prev) => [...prev, ...converted.filter((x) => Boolean(x.dataUrl))]);
            e.target.value = '';
        };

        const handleVideoFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const uploaded = files.map((f, idx) => ({
                id: `q_vid_${Date.now()}_${idx}`,
                name: f.name,
                url: URL.createObjectURL(f),
            }));
            setQueuedVideoUploads((prev) => [...prev, ...uploaded]);
            e.target.value = '';
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

        const handlePublishStatus = (e: React.FormEvent) => {
            e.preventDefault();
            const nowStamp = `Today at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            const createdSlides: StatusUpdateItem[] = [];

            if (statusComposerMode === 'video') {
                if (queuedVideoUploads.length > 0) {
                    queuedVideoUploads.forEach((v, idx) => {
                        createdSlides.push({
                            id: `st_me_${Date.now()}_${idx}`,
                            authorName: userName,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            viewed: false,
                            mediaType: 'video',
                            title: statusDraftTitle.trim() || v.name.replace(/\.[^/.]+$/, ''),
                            videoTitle: statusDraftTitle.trim() || v.name,
                            videoUrl: v.url,
                            videoDuration: 'Uploaded',
                            text: statusDraftText.trim() || `Uploaded video status: ${v.name}`,
                            bgColor: statusBgColor,
                            professionTag: 'My Uploaded Video',
                        });
                    });
                } else if (statusDraftVideo.trim()) {
                    createdSlides.push({
                        id: `st_me_${Date.now()}`,
                        authorName: userName,
                        authorAvatar: userAvatar,
                        timestampLabel: nowStamp,
                        viewed: false,
                        mediaType: 'video',
                        title: statusDraftTitle.trim() || '24h Video Status Update',
                        videoTitle: statusDraftTitle.trim() || '24h Video Status Update',
                        videoUrl: statusDraftVideo.trim(),
                        imageUrl: statusDraftImage || undefined,
                        videoDuration: '0:22',
                        text: statusDraftText.trim() || 'New 24-hour ConnectLn video status update.',
                        bgColor: statusBgColor,
                        professionTag: 'My Uploaded Video',
                    });
                }
            } else if (statusComposerMode === 'photo') {
                if (queuedPhotoUploads.length > 0) {
                    queuedPhotoUploads.forEach((imgItem, idx) => {
                        createdSlides.push({
                            id: `st_me_${Date.now()}_${idx}`,
                            authorName: userName,
                            authorAvatar: userAvatar,
                            timestampLabel: nowStamp,
                            viewed: false,
                            mediaType: 'photo',
                            title: statusDraftTitle.trim() || imgItem.name.replace(/\.[^/.]+$/, ''),
                            imageUrl: imgItem.dataUrl,
                            text: statusDraftText.trim() || `Uploaded photo update (${imgItem.name})`,
                            bgColor: statusBgColor,
                            professionTag: 'My Uploaded Picture',
                        });
                    });
                } else if (statusDraftImage.trim()) {
                    createdSlides.push({
                        id: `st_me_${Date.now()}`,
                        authorName: userName,
                        authorAvatar: userAvatar,
                        timestampLabel: nowStamp,
                        viewed: false,
                        mediaType: 'photo',
                        title: statusDraftTitle.trim() || '24h Picture Update',
                        imageUrl: statusDraftImage.trim(),
                        text: statusDraftText.trim() || 'New 24-hour ConnectLn picture status update.',
                        bgColor: statusBgColor,
                        professionTag: 'My Uploaded Picture',
                    });
                }
            } else if (statusComposerMode === 'info') {
                if (!statusDraftText.trim() && !statusDraftTitle.trim() && !statusDraftInfoDetails.trim()) {
                    return;
                }
                createdSlides.push({
                    id: `st_me_${Date.now()}`,
                    authorName: userName,
                    authorAvatar: userAvatar,
                    timestampLabel: nowStamp,
                    viewed: false,
                    mediaType: 'info',
                    infoBadge: statusDraftInfoBadge || 'Status Information',
                    title: statusDraftTitle.trim() || 'Member Status Information Update',
                    text: statusDraftText.trim() || statusDraftInfoDetails.trim(),
                    infoDetails: statusDraftInfoDetails.trim() || undefined,
                    attachmentName: statusDraftAttachmentName || undefined,
                    attachmentUrl: statusDraftAttachmentUrl || undefined,
                    imageUrl: queuedPhotoUploads[0]?.dataUrl || undefined,
                    bgColor: statusBgColor,
                    professionTag: statusDraftInfoBadge || 'Status Information',
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
            triggerToast(
                `✅ Uploaded ${createdSlides.length} item${createdSlides.length > 1 ? 's' : ''} into YOUR dedicated Status Box!`
            );
        };

        const renderUserSlideSummaryIcons = (slides: StatusUpdateItem[]) => {
            const videos = slides.filter((s) => s.mediaType === 'video').length;
            const photos = slides.filter((s) => s.mediaType === 'photo').length;
            const infos = slides.filter((s) => s.mediaType === 'info' || s.mediaType === 'text').length;
            const parts: string[] = [];
            if (videos > 0) parts.push(`🎬 ${videos}`);
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
                                setStatusComposerMode('info');
                            }}
                            style={{ color: '#FBF8F3' }}
                            title="Upload Video, Pictures, or Status Information to Your Status Box"
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
                                            setStatusComposerMode('info');
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
                                                ? `${renderUserSlideSummaryIcons(myStatusBox.slides)} · Click to open your Status Box`
                                                : 'Upload your own videos, pictures & info'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode('photo')}
                                    className="px-2.5 py-1 rounded-lg bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[10px] font-bold text-[#5E3119] cursor-pointer shrink-0"
                                    title="Add videos, pictures or status information"
                                >
                                    + Add
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

                            {/* 3-Mode Upload Type Switcher */}
                            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#EFE8DA] border border-[#DDD3C2]">
                                {[
                                    { id: 'info' as const, label: '📋 Status Information' },
                                    { id: 'photo' as const, label: '🖼️ Upload Pictures' },
                                    { id: 'video' as const, label: '🎬 Upload Videos' },
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
                                                Select one or multiple pictures from your device (all will be added to YOUR Status Box)
                                            </p>
                                            <label
                                                style={{ color: '#FBF8F3' }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer"
                                            >
                                                <span>🖼️ Choose Pictures (Multi-Select Supported)</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
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

                                {/* Mode C: Upload One or Many Videos */}
                                {statusComposerMode === 'video' && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl border-2 border-dashed border-[#BC9675] bg-[#F8F4EC] p-4 text-center space-y-2">
                                            <p className="text-xs font-bold text-[#5E3119]">
                                                Upload MP4 / WebM / MOV videos from your device into YOUR Status Box
                                            </p>
                                            <label
                                                style={{ color: '#FBF8F3' }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-bold cursor-pointer"
                                            >
                                                <span>🎬 Choose Video File(s)</span>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleVideoFilesUpload}
                                                />
                                            </label>
                                            {queuedVideoUploads.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
                                                    {queuedVideoUploads.map((v) => (
                                                        <div key={v.id} className="relative rounded-lg overflow-hidden border border-[#D0C4AE] bg-black p-1.5">
                                                            <video src={v.url} controls muted className="w-full h-24 object-cover rounded" />
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
                                                Or select a video preset / enter an MP4 URL:
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
                                                placeholder="/status-videos/physician.mp4"
                                                className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-1.5 text-xs text-[#1C1917]"
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
                                        className="px-5 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold shadow-sm cursor-pointer"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        {statusComposerMode === 'photo'
                                            ? `Upload ${queuedPhotoUploads.length > 1 ? `${queuedPhotoUploads.length} Pictures` : 'Picture'} to My Status Box`
                                            : statusComposerMode === 'video'
                                            ? `Upload ${queuedVideoUploads.length > 1 ? `${queuedVideoUploads.length} Videos` : 'Video'} to My Status Box`
                                            : 'Publish Information to My Status Box'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : activeUserBox && activeSlide ? (
                        <div className="w-full max-w-2xl my-auto space-y-3 animate-in fade-in">
                            <div className="w-full bg-[#1C1917] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#524B42]">
                                {/* Dedicated User Identity Strip + Segmented Progress ONLY for THIS User's Slides */}
                                <div className="px-4 pt-3 space-y-2 bg-[#141210]">
                                    <div className="flex items-center justify-between text-[11px] text-[#D0C4AE]">
                                        <span className="font-bold text-[#FBF8F3]">
                                            {activeUserBox.authorName}&apos;s Dedicated Status Box
                                        </span>
                                        <span className="font-mono">
                                            Item {safeSlideIndex + 1} of {activeUserBox.slides.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {activeUserBox.slides.map((sl, idx) => (
                                            <button
                                                key={sl.id}
                                                type="button"
                                                onClick={() => handleSelectSlideInUserBox(idx)}
                                                title={sl.title || sl.videoTitle || `Item ${idx + 1}`}
                                                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                                                    idx === safeSlideIndex
                                                        ? 'bg-[#D69E6B]'
                                                        : idx < safeSlideIndex
                                                        ? 'bg-[#7C4225]'
                                                        : 'bg-white/20 hover:bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Top Author & Navigation Bar (Steps ONLY inside this user's box) */}
                                <div className="px-4 py-3 bg-[#141210] flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={activeUserBox.authorAvatar}
                                            alt={activeUserBox.authorName}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-[#BC9675] shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p
                                                    className="text-sm font-bold truncate"
                                                    style={{ color: '#FBF8F3' }}
                                                >
                                                    {activeUserBox.authorName}
                                                </p>
                                                {(activeSlide.infoBadge || activeSlide.professionTag || activeUserBox.professionTag) && (
                                                    <span className="rounded-md bg-[#7C4225]/40 border border-[#BC9675]/40 px-2 py-0.5 text-[10px] font-bold text-[#FBF8F3]">
                                                        {activeSlide.infoBadge || activeSlide.professionTag || activeUserBox.professionTag}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-[#D0C4AE] truncate">
                                                {activeSlide.timestampLabel}
                                                {(activeSlide.title || activeSlide.videoTitle)
                                                    ? ` • ${activeSlide.title || activeSlide.videoTitle}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                        {activeUserBox.isCurrentUser && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusComposerMode('info')}
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
                                            disabled={activeUserBox.slides.length <= 1}
                                            onClick={() => handleStepWithinUserBox(-1)}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold cursor-pointer"
                                            style={{ color: '#FBF8F3' }}
                                            title="Previous Item in This User's Status Box"
                                        >
                                            ← Prev
                                        </button>
                                        <button
                                            type="button"
                                            disabled={activeUserBox.slides.length <= 1}
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

                                {/* Slide Media Body: Video, Picture, OR Structured Status Information */}
                                <div
                                    className="p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]"
                                    style={{
                                        background:
                                            activeSlide.bgColor ||
                                            'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
                                        color: '#FBF8F3',
                                    }}
                                >
                                    {activeSlide.mediaType === 'video' && activeSlide.videoUrl ? (
                                        <div className="w-full rounded-xl overflow-hidden border border-white/15 bg-black shadow-xl">
                                            <video
                                                key={activeSlide.id}
                                                src={activeSlide.videoUrl}
                                                poster={activeSlide.imageUrl}
                                                autoPlay
                                                loop
                                                playsInline
                                                controls
                                                className="w-full h-[260px] sm:h-[310px] object-cover bg-black"
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

                                    {(activeSlide.mediaType === 'video' || activeSlide.mediaType === 'photo') && (
                                        <div className="space-y-1 max-w-xl px-2">
                                            {activeSlide.title && (
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#D69E6B]">
                                                    {activeSlide.title}
                                                </p>
                                            )}
                                            <p className="text-sm sm:text-base font-semibold leading-relaxed">
                                                {activeSlide.text}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Per-User Uploaded Items Strip (Click any Video / Picture / Info item uploaded by THIS user) */}
                                <div className="px-4 py-2.5 bg-[#1B1815] border-t border-white/10 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#D0C4AE]">
                                        <span>
                                            Uploaded Items in {activeUserBox.authorName}&apos;s Status Box ({activeUserBox.slides.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setStatusComposerMode('photo')}
                                            className="text-[#D69E6B] hover:underline cursor-pointer"
                                        >
                                            + Upload to My Status
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {activeUserBox.slides.map((sl, idx) => (
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
                                                    {sl.mediaType === 'video' ? '🎬' : sl.mediaType === 'photo' ? '🖼️' : '📋'}
                                                </span>
                                                <span className="max-w-[140px] truncate">
                                                    {sl.title || sl.videoTitle || sl.infoBadge || `Item ${idx + 1}`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reply to THIS User's Status Bar */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!statusReplyText.trim()) return;
                                        triggerToast(
                                            `💬 Replied to ${activeUserBox.authorName}'s Status Box: "${statusReplyText}"`
                                        );
                                        setStatusReplyText('');
                                    }}
                                    className="p-3 bg-[#292521] flex items-center gap-2 border-t border-white/10"
                                >
                                    <input
                                        type="text"
                                        value={statusReplyText}
                                        onChange={(e) => setStatusReplyText(e.target.value)}
                                        placeholder={`Reply to ${activeUserBox.authorName}...`}
                                        className="flex-1 bg-[#3D3730] placeholder-[#D0C4AE] text-xs rounded-full px-4 py-2 focus:outline-none"
                                        style={{ color: '#FBF8F3' }}
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer shrink-0"
                                        style={{ color: '#FBF8F3' }}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
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
                                        style={{ color: '#FBF8F3' }}
                                        className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] text-[#FBF8F3] px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                                    >
                                        🎬 + Upload Video Status
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
                            Share your screen, react with emoji and more, with up to 32 people.
                        </p>
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
                        roomJoinUrl={generatedCallLink || undefined}
                        onUpgradeToVideoHuddle={(label) => {
                            setActiveSoftphoneTarget(null);
                            onStartLiveCall('video', label);
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
