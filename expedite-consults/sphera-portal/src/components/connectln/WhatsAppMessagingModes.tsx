'use client';

import React, { useState } from 'react';
import { B2BConversationThread } from '@/lib/b2b-messaging-data';

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
    mediaType: 'text' | 'photo';
    text: string;
    bgColor?: string;
    imageUrl?: string;
    professionTag?: string;
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

const INITIAL_STATUS_UPDATES: StatusUpdateItem[] = [
    {
        id: 'st_boat',
        authorName: 'Boat',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestampLabel: 'Today at 1:58 PM',
        viewed: false,
        mediaType: 'photo',
        text: 'New site delivery & structural blueprint inspection complete — ready for phase 2.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900',
        professionTag: 'Field Operations',
    },
    {
        id: 'st_it_guru',
        authorName: 'IT-Guru GURU Trainer',
        authorAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
        timestampLabel: 'Today at 12:14 PM',
        viewed: false,
        mediaType: 'text',
        text: '🚀 Live Cloud Security & Zero-Trust Lab cohort starts at 4:00 PM EST! Drop a message to join.',
        bgColor: 'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)',
        professionTag: 'Cyber & IT Training',
    },
    {
        id: 'st_ashley',
        authorName: 'Ashley Furniture Homestore JA',
        authorAvatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
        timestampLabel: 'Today at 7:56 AM',
        viewed: false,
        mediaType: 'photo',
        text: 'Commercial interior & executive office collection now in stock for regional contractors.',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
        professionTag: 'Commercial Furnishings',
    },
    {
        id: 'st_sam_k',
        authorName: 'Sam K',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timestampLabel: 'Today at 2:10 PM',
        viewed: false,
        mediaType: 'text',
        text: 'On-site commissioning wrapped ahead of schedule. Grateful for the entire crew! ⚡',
        bgColor: 'linear-gradient(135deg, #3b1e10 0%, #7c4225 100%)',
        professionTag: 'Systems Engineering',
    },
    {
        id: 'st_murchisson',
        authorName: 'Murchisson',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        timestampLabel: 'Today at 10:35 AM',
        viewed: true,
        mediaType: 'text',
        text: 'Reviewing Q4 procurement tenders and supplier SLA renewals today.',
        bgColor: 'linear-gradient(135deg, #3d3730 0%, #524b42 100%)',
    },
    {
        id: 'st_mike_mukasa',
        authorName: 'Mike Mukasa',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        timestampLabel: 'Today at 9:29 AM',
        viewed: true,
        mediaType: 'photo',
        text: 'Morning team briefing at the central workshop.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900',
    },
    {
        id: 'st_suzzan',
        authorName: 'Suzzan Coldwell Banker',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        timestampLabel: 'Today at 9:02 AM',
        viewed: true,
        mediaType: 'photo',
        text: 'New commercial property listing open for walkthroughs this week.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900',
    },
    {
        id: 'st_naana',
        authorName: 'Naana L',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        timestampLabel: 'Today at 7:03 AM',
        viewed: true,
        mediaType: 'text',
        text: 'Blessed morning! Wishing everyone a productive Thursday.',
        bgColor: 'linear-gradient(135deg, #63331b 0%, #8a4b29 100%)',
    },
    {
        id: 'st_branding',
        authorName: 'Branding - Market Project',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        timestampLabel: 'Today at 4:54 AM',
        viewed: true,
        mediaType: 'text',
        text: 'Updated brand identity assets uploaded to the shared project folder.',
        bgColor: 'linear-gradient(135deg, #292521 0%, #524b42 100%)',
    },
    {
        id: 'st_ob',
        authorName: 'OB',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        timestampLabel: 'Today at 4:12 AM',
        viewed: true,
        mediaType: 'text',
        text: 'Early shift diagnostics complete.',
        bgColor: 'linear-gradient(135deg, #1c1917 0%, #3d3730 100%)',
    },
];

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
        followers: '148K followers',
        avatar: '/brand/connectln-icon-256.png',
        lastUpdate: '🔔 New OSHA & ISO 2026 Automated Field Checklist released for all 15 enclaves.',
        time: 'Today, 1:15 PM',
    },
    {
        id: 'chan_connectln_jobs',
        name: 'ConnectLn Verified High-Priority Bounties',
        followers: '92K followers',
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
        lastUpdate: '⚡ 14 new urgent enterprise & trade contracts posted this afternoon.',
        time: 'Today, 11:40 AM',
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
        badge?: number;
        dot?: boolean;
        icon: React.ReactNode;
    }> = [
        {
            id: 'chats',
            label: 'Chats & Mail',
            badge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3V7a2 2 0 0 1 2-2z" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="13" y2="14" />
                </svg>
            ),
        },
        {
            id: 'calls',
            label: 'Calls',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                    />
                </svg>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            dot: true,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 3a9 9 0 0 1 7.79 4.5" />
                    <path strokeLinecap="round" d="M19.79 16.5A9 9 0 0 1 12 21" />
                    <path strokeLinecap="round" d="M4.21 16.5a9 9 0 0 1 0-9" />
                </svg>
            ),
        },
        {
            id: 'channels',
            label: 'Channels',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M8.5 12a3.5 3.5 0 0 1 7 0" />
                    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                </svg>
            ),
        },
        {
            id: 'communities',
            label: 'Communities',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            id: 'archived',
            label: 'Archived',
            badge: unreadArchivedCount > 0 ? unreadArchivedCount : 1,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="4" rx="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4" />
                </svg>
            ),
        },
    ];

    return (
        <div className="w-full md:w-[56px] bg-[#F3EDE2] border-b md:border-b-0 md:border-r border-[#E0D6C5] flex md:flex-col items-center justify-between px-2 py-1.5 md:py-3 shrink-0 select-none">
            <div className="flex md:flex-col items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                {items.map((item) => {
                    const isActive = activeMode === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectMode(item.id)}
                            title={item.label}
                            className={`relative flex items-center gap-1.5 md:justify-center px-2.5 md:px-0 h-9 md:h-10 md:w-10 rounded-full transition-all cursor-pointer shrink-0 ${
                                isActive
                                    ? 'bg-[#7C4225] text-[#FBF8F3] font-bold shadow-2xs ring-1 ring-[#5E3119]/40'
                                    : 'text-[#57534E] hover:bg-[#E8D8C8]/70 hover:text-[#1C1917]'
                            }`}
                            style={isActive ? { color: '#FBF8F3' } : undefined}
                        >
                            {item.icon}
                            <span className="md:hidden text-[11px] font-bold">{item.label}</span>
                            {typeof item.badge === 'number' && item.badge > 0 && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C4225] border border-[#FBF8F3] text-[10px] font-extrabold flex items-center justify-center shadow-2xs"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    {item.badge}
                                </span>
                            )}
                            {item.dot && !item.badge && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7C4225] ring-2 ring-[#F3EDE2]" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="hidden md:flex flex-col items-center gap-2.5 pt-3 border-t border-[#E0D6C5]">
                <button
                    type="button"
                    onClick={() => onSelectMode('status')}
                    title="My Status & Profile"
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#7C4225] shadow-2xs cursor-pointer"
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

    // ---- STATUS STATE ----
    const [statusList, setStatusList] = useState<StatusUpdateItem[]>(INITIAL_STATUS_UPDATES);
    const [activeStatusId, setActiveStatusId] = useState<string | null>(null);
    const [statusComposerMode, setStatusComposerMode] = useState<'text' | 'photo' | null>(null);
    const [statusDraftText, setStatusDraftText] = useState('');
    const [statusDraftImage, setStatusDraftImage] = useState(
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900'
    );
    const [statusBgColor, setStatusBgColor] = useState(
        'linear-gradient(135deg, #5e3119 0%, #7c4225 55%, #3d3730 100%)'
    );
    const [statusReplyText, setStatusReplyText] = useState('');

    // ---- CALLS STATE ----
    const [callLogs, setCallLogs] = useState<CallLogEntry[]>(INITIAL_CALL_LOGS);
    const [callSearch, setCallSearch] = useState('');
    const [showDialPadModal, setShowDialPadModal] = useState(false);
    const [dialInput, setDialInput] = useState('');
    const [generatedCallLink, setGeneratedCallLink] = useState<string | null>(null);
    const [showAddFavoriteModal, setShowAddFavoriteModal] = useState(false);

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
    const [channels] = useState(INITIAL_CHANNELS);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

    // =========================================================================
    // 1. STATUS VIEW (Desk Note Warm Parchment & Espresso Theme)
    // =========================================================================
    if (mode === 'status') {
        const recentStatuses = statusList.filter((s) => !s.viewed);
        const viewedStatuses = statusList.filter((s) => s.viewed);
        const activeStatus = statusList.find((s) => s.id === activeStatusId) || null;

        const handleOpenStatus = (item: StatusUpdateItem) => {
            setActiveStatusId(item.id);
            setStatusComposerMode(null);
            setStatusList((prev) =>
                prev.map((s) => (s.id === item.id ? { ...s, viewed: true } : s))
            );
        };

        const handlePublishStatus = (e: React.FormEvent) => {
            e.preventDefault();
            if (!statusDraftText.trim()) return;
            const newStatus: StatusUpdateItem = {
                id: `st_me_${Date.now()}`,
                authorName: `${userName} (My Status)`,
                authorAvatar: userAvatar,
                timestampLabel: 'Just now',
                viewed: false,
                mediaType: statusComposerMode === 'photo' ? 'photo' : 'text',
                text: statusDraftText.trim(),
                bgColor: statusBgColor,
                imageUrl: statusComposerMode === 'photo' ? statusDraftImage : undefined,
                professionTag: 'Verified Status Update',
            };
            setStatusList((prev) => [newStatus, ...prev]);
            setStatusDraftText('');
            setStatusComposerMode(null);
            setActiveStatusId(newStatus.id);
            triggerToast('✅ Status shared! Visible to your connections for 24 hours.');
        };

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Status List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                    {/* Header */}
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#E0D6C5]/60">
                        <h2 className="text-xl font-bold text-[#1C1917]">Status</h2>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveStatusId(null);
                                    setStatusComposerMode('text');
                                }}
                                title="Add status update"
                                className="w-8 h-8 rounded-full hover:bg-[#EFE8DA] flex items-center justify-center text-[#57534E] cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" />
                                    <line x1="12" y1="8" x2="12" y2="16" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveStatusId(null);
                                    setStatusComposerMode(null);
                                }}
                                title="Status privacy & options"
                                className="w-8 h-8 rounded-full hover:bg-[#EFE8DA] flex items-center justify-center text-[#57534E] cursor-pointer"
                            >
                                ⋮
                            </button>
                        </div>
                    </div>

                    {/* My Status Row */}
                    <div className="px-2 py-2">
                        <div
                            onClick={() => {
                                setActiveStatusId(null);
                                setStatusComposerMode('text');
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EFE8DA]/70 cursor-pointer transition-colors"
                        >
                            <div className="relative shrink-0">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-11 h-11 rounded-full object-cover border border-[#D0C4AE]"
                                />
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#7C4225] text-xs font-bold flex items-center justify-center ring-2 ring-[#FBF8F3]"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    +
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1C1917]">My status</p>
                                <p className="text-xs text-[#78716C]">Click to add status update</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Recent & Viewed Lists */}
                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
                        {recentStatuses.length > 0 && (
                            <div>
                                <p className="px-2.5 py-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                                    Recent
                                </p>
                                <div className="space-y-0.5">
                                    {recentStatuses.map((st) => (
                                        <div
                                            key={st.id}
                                            onClick={() => handleOpenStatus(st)}
                                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                                                activeStatusId === st.id
                                                    ? 'bg-[#EFE8DA]'
                                                    : 'hover:bg-[#F6F1E7]'
                                            }`}
                                        >
                                            <div className="p-0.5 rounded-full border-2 border-[#7C4225] shrink-0">
                                                <img
                                                    src={st.authorAvatar}
                                                    alt={st.authorName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-[#1C1917] truncate">
                                                    {st.authorName}
                                                </p>
                                                <p className="text-xs text-[#78716C]">
                                                    {st.timestampLabel}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewedStatuses.length > 0 && (
                            <div>
                                <p className="px-2.5 py-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                                    Viewed
                                </p>
                                <div className="space-y-0.5">
                                    {viewedStatuses.map((st) => (
                                        <div
                                            key={st.id}
                                            onClick={() => handleOpenStatus(st)}
                                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                                                activeStatusId === st.id
                                                    ? 'bg-[#EFE8DA]'
                                                    : 'hover:bg-[#F6F1E7]'
                                            }`}
                                        >
                                            <div className="p-0.5 rounded-full border-2 border-[#D0C4AE] shrink-0">
                                                <img
                                                    src={st.authorAvatar}
                                                    alt={st.authorName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-[#1C1917] truncate">
                                                    {st.authorName}
                                                </p>
                                                <p className="text-xs text-[#78716C]">
                                                    {st.timestampLabel}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Share Statuses Canvas / Active Status Viewer / Composer */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6 relative overflow-y-auto">
                    {statusComposerMode ? (
                        <div className="w-full max-w-lg bg-[#FBF8F3] rounded-2xl shadow-lg border border-[#E0D6C5] p-6 animate-in fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-[#1C1917]">
                                    {statusComposerMode === 'text'
                                        ? '✏️ Create Text Status (24h)'
                                        : '📷 Share Photo & Video Status (24h)'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode(null)}
                                    className="text-[#78716C] hover:text-[#1C1917] font-bold text-sm cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handlePublishStatus} className="space-y-4">
                                <div
                                    className="rounded-2xl p-6 min-h-[200px] flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden"
                                    style={{ background: statusBgColor }}
                                >
                                    {statusComposerMode === 'photo' && statusDraftImage && (
                                        <img
                                            src={statusDraftImage}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-xl mb-3 border border-white/20"
                                        />
                                    )}
                                    <textarea
                                        value={statusDraftText}
                                        onChange={(e) => setStatusDraftText(e.target.value)}
                                        placeholder="Type your 24-hour status update..."
                                        rows={3}
                                        className="w-full bg-transparent placeholder-white/75 text-center font-bold text-lg focus:outline-none resize-none"
                                        style={{ color: '#FBF8F3' }}
                                    />
                                </div>

                                {statusComposerMode === 'text' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-[#57534E]">
                                            Desk Note Theme:
                                        </span>
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
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#57534E] mb-1">
                                            Photo / Video URL or Preset:
                                        </label>
                                        <input
                                            type="text"
                                            value={statusDraftImage}
                                            onChange={(e) => setStatusDraftImage(e.target.value)}
                                            className="w-full border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-1.5 text-xs text-[#1C1917]"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-2">
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
                                        Share Status
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : activeStatus ? (
                        <div className="w-full max-w-md bg-[#1C1917] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#524B42] animate-in fade-in">
                            {/* Top Progress & Author Bar */}
                            <div className="p-4 bg-[#141210]/80 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={activeStatus.authorAvatar}
                                        alt={activeStatus.authorName}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#BC9675]"
                                    />
                                    <div>
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: '#FBF8F3' }}
                                        >
                                            {activeStatus.authorName}
                                        </p>
                                        <p className="text-[11px] text-[#D0C4AE]">
                                            {activeStatus.timestampLabel}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveStatusId(null)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Story Body */}
                            <div
                                className="min-h-[320px] p-6 flex flex-col items-center justify-center text-center"
                                style={{
                                    background:
                                        activeStatus.bgColor ||
                                        'linear-gradient(135deg, #292521 0%, #3d3730 100%)',
                                    color: '#FBF8F3',
                                }}
                            >
                                {activeStatus.imageUrl && (
                                    <img
                                        src={activeStatus.imageUrl}
                                        alt={activeStatus.authorName}
                                        className="w-full max-h-56 object-cover rounded-xl mb-4 shadow-md"
                                    />
                                )}
                                <p className="text-base font-semibold leading-relaxed max-w-sm">
                                    {activeStatus.text}
                                </p>
                            </div>

                            {/* Reply to Status Bar */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!statusReplyText.trim()) return;
                                    triggerToast(
                                        `💬 Replied to ${activeStatus.authorName}'s status: "${statusReplyText}"`
                                    );
                                    setStatusReplyText('');
                                }}
                                className="p-3 bg-[#292521] flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={statusReplyText}
                                    onChange={(e) => setStatusReplyText(e.target.value)}
                                    placeholder={`Reply to ${activeStatus.authorName}...`}
                                    className="flex-1 bg-[#3D3730] placeholder-[#D0C4AE] text-xs rounded-full px-4 py-2 focus:outline-none"
                                    style={{ color: '#FBF8F3' }}
                                />
                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Default "Share statuses" Screen in Desk Note Editorial Palette */
                        <div className="text-center max-w-md flex flex-col items-center">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center text-[#9C8F7A]">
                                <svg
                                    className="w-14 h-14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                                    <path strokeLinecap="round" d="M12 3a9 9 0 0 1 7.79 4.5" />
                                    <path strokeLinecap="round" d="M19.79 16.5A9 9 0 0 1 12 21" />
                                    <path strokeLinecap="round" d="M4.21 16.5a9 9 0 0 1 0-9" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-normal text-[#1C1917] mb-2">
                                Share statuses
                            </h3>
                            <p className="text-sm text-[#57534E] mb-7">
                                Share photos, videos and text that disappear after 24 hours.
                            </p>
                            <div className="flex items-center justify-center gap-8">
                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode('text')}
                                    className="flex flex-col items-center gap-2 group cursor-pointer"
                                >
                                    <span className="w-12 h-12 rounded-full bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] flex items-center justify-center text-[#1C1917] transition-colors shadow-2xs">
                                        <svg
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-xs font-semibold text-[#57534E]">
                                        Text status
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatusComposerMode('photo')}
                                    className="flex flex-col items-center gap-2 group cursor-pointer"
                                >
                                    <span className="w-12 h-12 rounded-full bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] flex items-center justify-center text-[#1C1917] transition-colors shadow-2xs">
                                        <svg
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                                            />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </span>
                                    <span className="text-xs font-semibold text-[#57534E]">
                                        Photo and video
                                    </span>
                                </button>
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
            triggerToast('🔗 E2EE Call link copied to clipboard!');
        };

        return (
            <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
                {/* Left Column: Calls List */}
                <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
                    {/* Header */}
                    <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#E0D6C5]/60">
                        <h2 className="text-xl font-bold text-[#1C1917]">Calls</h2>
                        <button
                            type="button"
                            onClick={() => onStartLiveCall('video')}
                            title="Start a new call"
                            className="w-9 h-9 rounded-full bg-[#7C4225] hover:bg-[#5E3119] flex items-center justify-center shadow-sm cursor-pointer"
                            style={{ color: '#FBF8F3' }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-3 py-2.5">
                        <div className="relative">
                            <input
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
                                    className="w-10 h-10 rounded-full bg-[#7C4225] flex items-center justify-center shrink-0 shadow-2xs"
                                    style={{ color: '#FBF8F3' }}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <line x1="20" y1="8" x2="20" y2="14" />
                                        <line x1="23" y1="11" x2="17" y2="11" />
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
                                        onClick={() => onStartLiveCall(call.callType === 'video' ? 'video' : 'audio', call.name)}
                                        className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#EFE8DA]/70 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={call.avatar}
                                                alt={call.name}
                                                className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#D0C4AE]"
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
                                                            ? '↙ 📞 Missed'
                                                            : call.direction === 'incoming'
                                                            ? '↙ 📞 Incoming'
                                                            : `↗ 📞 Outgoing${call.count ? ` (${call.count})` : ''}`}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-[#78716C] shrink-0">
                                            {call.timeLabel}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: "Voice and video calling" Card in Desk Note Palette */}
                <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6">
                    <div className="bg-[#FBF8F3] rounded-2xl shadow-2xs border border-[#E0D6C5] px-8 py-7 max-w-md w-full text-center mb-6">
                        {/* Laptop + Espresso Phone Illustration */}
                        <div className="mx-auto mb-4 w-32 h-24 flex items-center justify-center">
                            <div className="relative w-28 h-20 rounded-lg border-2 border-[#3D3730] bg-[#F3EAE1] flex overflow-hidden shadow-2xs">
                                <div className="w-1/2 bg-[#7C4225] flex flex-col justify-center gap-1.5 px-2.5">
                                    <div className="h-1 w-full bg-[#FBF8F3]/75 rounded" />
                                    <div className="h-1 w-3/4 bg-[#FBF8F3]/75 rounded" />
                                    <div className="h-1 w-5/6 bg-[#FBF8F3]/75 rounded" />
                                </div>
                                <div className="w-1/2 bg-[#E8D8C8] flex items-center justify-center text-[#1C1917]">
                                    <svg className="w-6 h-6 text-[#7C4225]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
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

                    {/* 4 Circular Action Buttons: Start call, New call link, Call a number, Schedule call */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <button
                            type="button"
                            onClick={() => onStartLiveCall('video')}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span
                                className="w-12 h-12 rounded-full bg-[#7C4225] group-hover:bg-[#5E3119] flex items-center justify-center shadow-sm transition-colors"
                                style={{ color: '#FBF8F3' }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <rect x="2" y="6" width="14" height="12" rx="2" />
                                    <polygon points="22 8 16 12 22 16 22 8" />
                                    <line x1="9" y1="9" x2="9" y2="15" />
                                    <line x1="6" y1="12" x2="12" y2="12" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">Start call</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateNewCallLink}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-full bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#1C1917] flex items-center justify-center shadow-2xs transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">New call link</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowDialPadModal((prev) => !prev)}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-full bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#1C1917] flex items-center justify-center shadow-2xs transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="6" cy="5" r="1.6" />
                                    <circle cx="12" cy="5" r="1.6" />
                                    <circle cx="18" cy="5" r="1.6" />
                                    <circle cx="6" cy="11" r="1.6" />
                                    <circle cx="12" cy="11" r="1.6" />
                                    <circle cx="18" cy="11" r="1.6" />
                                    <circle cx="6" cy="17" r="1.6" />
                                    <circle cx="12" cy="17" r="1.6" />
                                    <circle cx="18" cy="17" r="1.6" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-[#57534E]">Call a number</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenScheduleModal}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <span className="w-12 h-12 rounded-full bg-[#EFE8DA] group-hover:bg-[#E2D9C8] border border-[#D0C4AE] text-[#1C1917] flex items-center justify-center shadow-2xs transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
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
                                onClick={() => onStartLiveCall('video')}
                                className="px-3 py-1 rounded-full bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                style={{ color: '#FBF8F3' }}
                            >
                                Join Now
                            </button>
                        </div>
                    )}

                    {showDialPadModal && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!dialInput.trim()) return;
                                setCallLogs((prev) => [
                                    {
                                        id: `call_dial_${Date.now()}`,
                                        name: dialInput.trim(),
                                        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dialInput.trim())}&backgroundColor=7c4225`,
                                        direction: 'outgoing',
                                        timeLabel: 'Just now',
                                        callType: 'voice',
                                    },
                                    ...prev,
                                ]);
                                onStartLiveCall('audio', dialInput.trim());
                                setDialInput('');
                                setShowDialPadModal(false);
                            }}
                            className="mt-5 bg-[#FBF8F3] border border-[#E0D6C5] rounded-2xl p-4 shadow-md flex items-center gap-2 max-w-sm w-full"
                        >
                            <input
                                type="text"
                                value={dialInput}
                                onChange={(e) => setDialInput(e.target.value)}
                                placeholder="Enter phone number or @username..."
                                className="flex-1 border border-[#D0C4AE] bg-[#F8F4EC] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
                            />
                            <button
                                type="submit"
                                className="px-4 py-1.5 rounded-lg bg-[#7C4225] hover:bg-[#5E3119] text-xs font-bold cursor-pointer"
                                style={{ color: '#FBF8F3' }}
                            >
                                Call
                            </button>
                        </form>
                    )}
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
                        <h2 className="text-xl font-bold text-[#1C1917]">Communities</h2>
                        <button
                            type="button"
                            onClick={() => setShowNewCommunityModal(true)}
                            title="New community"
                            className="w-8 h-8 rounded-full hover:bg-[#EFE8DA] flex items-center justify-center text-[#57534E] cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="9" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
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
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
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
                                                    {grp.isAnnouncement ? '📢' : '👥'}
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
                            <div className="w-16 h-16 mb-3 flex items-center justify-center text-[#9C8F7A]">
                                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
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
                                + New community
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
                        <h2 className="text-xl font-bold text-[#1C1917] mb-2">Archived</h2>
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
                                        className="w-12 h-12 rounded-full object-cover border border-[#D0C4AE] shrink-0"
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
                                                    className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#7C4225] text-[11px] font-bold flex items-center justify-center shrink-0"
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
                                        className="w-12 h-12 rounded-full object-cover border border-[#D0C4AE]"
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
                                    📤 Unarchive to Chats
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Default Right Canvas in Desk Note Palette */
                        <div className="text-center max-w-md flex flex-col items-center">
                            <div className="w-16 h-16 mb-3 flex items-center justify-center text-[#9C8F7A]">
                                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-normal text-[#1C1917] mb-2">
                                Create communities
                            </h3>
                            <p className="text-sm text-[#57534E] max-w-sm">
                                Bring members together in topic-based groups and easily send them
                                admin announcements.
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
                    <h2 className="text-xl font-bold text-[#1C1917]">Channels</h2>
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
                                className="w-11 h-11 rounded-full object-cover border border-[#D0C4AE] shrink-0"
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
            <div className="flex-1 bg-[#F3EDE2] flex flex-col items-center justify-center p-6 text-center">
                {activeChan ? (
                    <div className="bg-[#FBF8F3] rounded-2xl shadow-md border border-[#E0D6C5] p-6 max-w-md w-full space-y-3">
                        <h3 className="text-base font-bold text-[#1C1917]">{activeChan.name}</h3>
                        <p className="text-xs text-[#78716C]">{activeChan.followers}</p>
                        <div className="p-3.5 rounded-xl bg-[#E8D8C8] border border-[#D5BBA3] text-xs text-[#1C1917] text-left">
                            {activeChan.lastUpdate}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md">
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
