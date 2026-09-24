export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  verified?: boolean;
  badgeType?: "blue" | "gold" | "gospel" | "campus" | "none";
  timeAgo: string;
  privacy?: string;
  isFollowed?: boolean;
  isFriend?: boolean;
  campusAffiliation?: string;
}

export interface CommentItem {
  id: string;
  user: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
  voted?: boolean;
}

export interface FeedPoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresIn?: string;
  hasVoted?: boolean;
  userVotedIndex?: number;
}

export interface ScriptureReference {
  book: string;
  reference: string;
  text: string;
  translation?: string;
  theme?: string;
}

export interface FeedPost {
  id: string;
  type: "standard" | "immersive_video" | "gospel_scripture" | "poll" | "pulse_thread" | "bounty" | "article";
  category?: "general" | "gospel" | "campus" | "tech" | "faith" | "pulse";
  streamCategory?: string;
  isGospel?: boolean;
  scriptureRef?: string;
  author: Author;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  musicTitle?: string;
  musicAuthor?: string;
  hashtags?: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  repostsCount?: number;
  viewsCount?: number;
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  likedByFriend?: string;
  commentsList?: CommentItem[];
  poll?: FeedPoll;
  scripture?: ScriptureReference;
  isThread?: boolean;
  threadIndex?: number;
  threadTotal?: number;
  threadReplies?: any[];
  communityNote?: any;
  bounty?: any;
  article?: any;
  repostOf?: {
    authorName: string;
    authorUsername: string;
    content: string;
    timeAgo: string;
  };
  createdAt: string;
}

export interface StoryItem {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  timeAgo: string;
  hasLive?: boolean;
  isUser?: boolean;
  isGospel?: boolean;
}

export interface LiveStreamItem {
  id: string;
  name: string;
  username: string;
  viewers: string;
  viewerCount: number;
  avatar: string;
  title: string;
  streamUrl?: string;
  category: string;
  startedAt: string;
  isFaith?: boolean;
}

export interface GospelVerse {
  id: string;
  book: string;
  reference: string;
  text: string;
  theme: string;
  commentary: string;
  reflectionQuestion: string;
  translation: string;
  audioDuration: string;
  tags: string[];
}

export interface PrayerRequestItem {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  details: string;
  category: "Healing" | "Academics" | "Family" | "Guidance" | "Peace" | "General";
  prayedCount: number;
  hasPrayed?: boolean;
  timeAgo: string;
  answersCount: number;
}

export interface GospelMediaItem {
  id: string;
  title: string;
  artistOrSpeaker: string;
  category: "Worship" | "Sermon" | "Podcast" | "Scripture Meditation";
  duration: string;
  thumbnail: string;
  audioSnippet?: string;
  videoUrl?: string;
  verseRef?: string;
}

export interface GospelMusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  genre: "Praise & Worship" | "Contemporary Gospel" | "Afro-Gospel" | "Hymns & Choral" | "Prayer & Soaking";
  duration: string;
  plays: string;
  scriptureAnchor?: string;
  lyricsPreview: string;
  audioUrl?: string;
  isFavorite?: boolean;
}

export interface GospelRadioStation {
  id: string;
  name: string;
  tagline: string;
  listeners: number;
  currentProgram: string;
  currentHost: string;
  coverArt: string;
}

export const dailyVerses: GospelVerse[] = [
  {
    id: "v1",
    book: "Philippians",
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    theme: "Peace & Freedom from Anxiety",
    commentary: "When exam pressures, career uncertainties, or life transitions feel heavy, surrender the outcome. Gratitude recalibrates the soul while divine peace becomes your anchor.",
    reflectionQuestion: "What is one burden you can place into God's hands in prayer today instead of carrying alone?",
    translation: "NIV",
    audioDuration: "1:15",
    tags: ["Peace", "Anxiety", "Trust", "Prayer"],
  },
  {
    id: "v2",
    book: "Isaiah",
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    theme: "Renewed Strength & Endurance",
    commentary: "Human effort has limits, but divine grace is inexhaustible. Waiting on God is not passive; it is an active alignment that restores your energy and vision.",
    reflectionQuestion: "Where do you feel weary right now, and how can resting in God's promises refresh your spirit?",
    translation: "NIV",
    audioDuration: "1:05",
    tags: ["Strength", "Hope", "Endurance", "Exams"],
  },
  {
    id: "v3",
    book: "Romans",
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    theme: "Divine Purpose & Sovereignty",
    commentary: "Every unexpected delay, closed door, or challenge is woven into a greater tapestry of redemption and growth.",
    reflectionQuestion: "Can you trust that current obstacles are working together for your character and destiny?",
    translation: "NIV",
    audioDuration: "1:20",
    tags: ["Purpose", "Hope", "Faith", "Growth"],
  },
  {
    id: "v4",
    book: "Proverbs",
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    theme: "Direction & Wisdom",
    commentary: "Our limited vantage point often misses the curves ahead. Total reliance on God brings clarity to your next career and life steps.",
    reflectionQuestion: "In what decision are you trying to rely solely on human calculation rather than asking for divine direction?",
    translation: "NIV",
    audioDuration: "1:10",
    tags: ["Wisdom", "Guidance", "Decisions", "College"],
  },
  {
    id: "v5",
    book: "Psalms",
    reference: "Psalm 23:1-3",
    text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    theme: "Restoration & Comfort",
    commentary: "In a hyper-connected, high-speed campus and corporate world, your soul needs sacred stillness with the Good Shepherd.",
    reflectionQuestion: "How can you take 10 minutes of uninterrupted stillness in God's presence today?",
    translation: "NIV",
    audioDuration: "1:25",
    tags: ["Rest", "Soul Care", "Comfort", "Peace"],
  },
];

export const initialPrayerRequests: PrayerRequestItem[] = [
  {
    id: "pr1",
    authorName: "Sarah Mensah",
    authorUsername: "sarah_m",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Midterm Exams & Mental Clarity",
    details: "Praying for peace and clarity for all students preparing for engineering and biochemistry midterms this week at UMD and Towson. May God grant sharp focus and calm anxiety! 🙏",
    category: "Academics",
    prayedCount: 148,
    hasPrayed: true,
    timeAgo: "1h ago",
    answersCount: 12,
  },
  {
    id: "pr2",
    authorName: "Pastor David Osei",
    authorUsername: "pastor_david",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Campus Fellowship Outreach & Revival",
    details: "Joining hands in prayer for our inter-collegiate worship night this Friday at Stamp Union. Praying for hearts to be touched with God's unconditional love and hope.",
    category: "Guidance",
    prayedCount: 312,
    hasPrayed: false,
    timeAgo: "3h ago",
    answersCount: 28,
  },
  {
    id: "pr3",
    authorName: "Emmanuel Boateng",
    authorUsername: "emmanuel_b",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "Family Health & Healing for My Mother",
    details: "My mom is undergoing surgery this Thursday. Standing on Jeremiah 17:14 for complete restoration and speedy recovery. Thank you family for your intercession!",
    category: "Healing",
    prayedCount: 520,
    hasPrayed: true,
    timeAgo: "5h ago",
    answersCount: 45,
  },
];

export const initialGospelMedia: GospelMediaItem[] = [
  {
    id: "gm1",
    title: "Goodness of God (Collegiate Acoustic Session)",
    artistOrSpeaker: "Sphera Worship Collective ft. Grace Choir",
    category: "Worship",
    duration: "4:32",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audioSnippet: "acoustic_goodness.mp3",
    verseRef: "Psalm 145:9",
  },
  {
    id: "gm2",
    title: "Navigating Career Ambition with Kingdom Purpose",
    artistOrSpeaker: "Pastor David Osei (Sunday Keynote)",
    category: "Sermon",
    duration: "24:15",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
    audioSnippet: "purpose_keynote.mp3",
    verseRef: "Colossians 3:23",
  },
  {
    id: "gm3",
    title: "Scripture Meditation for Overcoming Fear & Pressure",
    artistOrSpeaker: "Daily Grace Audio Devotional",
    category: "Scripture Meditation",
    duration: "8:40",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
    audioSnippet: "peace_meditation.mp3",
    verseRef: "2 Timothy 1:7",
  },
];

export const initialGospelMusic: GospelMusicTrack[] = [
  {
    id: "gm-track-1",
    title: "Goodness of God",
    artist: "CeCe Winans",
    album: "Believe For It",
    albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    genre: "Praise & Worship",
    duration: "4:56",
    plays: "1.4M",
    scriptureAnchor: "Psalm 23:6 & Psalm 145:9",
    lyricsPreview: "All my life You have been faithful / All my life You have been so, so good / With every breath that I am able / I will sing of the goodness of God",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    isFavorite: true,
  },
  {
    id: "gm-track-2",
    title: "Jireh (You Are Enough)",
    artist: "Elevation Worship & Maverick City Music ft. Chandler Moore, Naomi Raine",
    album: "Old Church Basement",
    albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    genre: "Contemporary Gospel",
    duration: "5:48",
    plays: "2.8M",
    scriptureAnchor: "Genesis 22:14 & Matthew 6:26",
    lyricsPreview: "I'll never be more loved than I am right now / Wasn't holding You up, so there's nothing I can do to let You down / Jireh, You are enough",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=worship-piano-123793.mp3",
    isFavorite: true,
  },
  {
    id: "gm-track-3",
    title: "Way Maker",
    artist: "Sinach",
    album: "Way Maker (Live)",
    albumArt: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    genre: "Praise & Worship",
    duration: "5:04",
    plays: "3.5M",
    scriptureAnchor: "Isaiah 43:19 & Exodus 14:21",
    lyricsPreview: "Way Maker, Miracle Worker, Promise Keeper / Light in the darkness, my God, that is who You are",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=inspirational-piano-110597.mp3",
    isFavorite: false,
  },
  {
    id: "gm-track-4",
    title: "Breathe",
    artist: "Dunsin Oyekan",
    album: "Kingdom Now",
    albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    genre: "Prayer & Soaking",
    duration: "6:20",
    plays: "890K",
    scriptureAnchor: "Ezekiel 37:9 & Genesis 2:7",
    lyricsPreview: "Breathe on me / Lord breathe on me / What I need is Your spirit / Breathe on me",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b9e0.mp3?filename=deep-meditation-19282.mp3",
    isFavorite: true,
  },
  {
    id: "gm-track-5",
    title: "Gratitude",
    artist: "Brandon Lake",
    album: "House of Miracles",
    albumArt: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    genre: "Praise & Worship",
    duration: "4:38",
    plays: "1.9M",
    scriptureAnchor: "Psalm 103:1 & Hebrews 13:15",
    lyricsPreview: "So I throw up my hands and praise You again and again / 'Cause all that I have is a hallelujah, hallelujah",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=acoustic-guitars-ambient-uplifting-11219.mp3",
    isFavorite: false,
  },
  {
    id: "gm-track-6",
    title: "Olorun Agbaye (You Are Mighty)",
    artist: "Nathaniel Bassey ft. Chandler Moore & Oba",
    album: "The King Is Coming",
    albumArt: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
    genre: "Afro-Gospel",
    duration: "7:12",
    plays: "1.2M",
    scriptureAnchor: "Jeremiah 32:17 & Psalm 89:8",
    lyricsPreview: "Olorun Agbaye o, You are mighty / Nothing is impossible for You / There is no mountain You cannot move",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=inspirational-piano-110597.mp3",
    isFavorite: true,
  },
  {
    id: "gm-track-7",
    title: "Fill Me Up / Overflow",
    artist: "Tasha Cobbs Leonard",
    album: "Grace",
    albumArt: "https://images.unsplash.com/photo-1520523839898-507127053999?w=600&auto=format&fit=crop&q=80",
    genre: "Contemporary Gospel",
    duration: "5:52",
    plays: "2.1M",
    scriptureAnchor: "Ephesians 5:18 & Psalm 23:5",
    lyricsPreview: "You provide the fire, I'll provide the sacrifice / You provide the spirit, and I will open up inside / Fill me up God",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=worship-piano-123793.mp3",
    isFavorite: false,
  },
  {
    id: "gm-track-8",
    title: "Great Is Thy Faithfulness (Campus Choral)",
    artist: "Sphera University Gospel Choir",
    album: "Campus Hymns & Heritage",
    albumArt: "https://images.unsplash.com/photo-1445743432342-eac500ce72b7?w=600&auto=format&fit=crop&q=80",
    genre: "Hymns & Choral",
    duration: "4:15",
    plays: "450K",
    scriptureAnchor: "Lamentations 3:22-23",
    lyricsPreview: "Great is Thy faithfulness, O God my Father / There is no shadow of turning with Thee / Thou changest not, Thy compassions, they fail not",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    isFavorite: false,
  },
];

export const initialGospelRadios: GospelRadioStation[] = [
  {
    id: "gr-1",
    name: "Sphera 24/7 Praise & Worship Radio",
    tagline: "Non-stop uplifting praise, deep worship & scripture affirmations",
    listeners: 1420,
    currentProgram: "Midday Glory & Collegiate Worship Hour",
    currentHost: "Campus Faith Network",
    coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "gr-2",
    name: "Afro-Gospel & Highlife Vibes Live",
    tagline: "Joyful rhythms, vibrant praise & contemporary African gospel",
    listeners: 980,
    currentProgram: "African Gospel Heritage & Beats",
    currentHost: "DJ Grace & Joy",
    coverArt: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "gr-3",
    name: "Midnight Soaking & Prayer Sanctuary",
    tagline: "Peaceful acoustic melodies and scriptures for deep study and sleep",
    listeners: 2150,
    currentProgram: "Quiet Waters Prayer Soaking",
    currentHost: "Daily Grace Collective",
    coverArt: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
  },
];

export const initialFeedPosts: FeedPost[] = [
  {
    id: "p-gospel-1",
    type: "gospel_scripture",
    category: "gospel",
    author: {
      id: "u-pastordavid",
      name: "Pastor David Osei",
      username: "pastordavid",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badgeType: "gospel",
      timeAgo: "25m",
      privacy: "Public",
      isFollowed: true,
    },
    content: "When you feel like you are at the end of your strength, remember that God's grace is perfected in weakness. You do not walk into this new week alone — He goes before you! 🕊️✨\n\n'My grace is sufficient for you, for my power is made perfect in weakness.' — 2 Corinthians 12:9",
    scripture: {
      book: "2 Corinthians",
      reference: "2 Corinthians 12:9",
      text: "My grace is sufficient for you, for my power is made perfect in weakness.",
      translation: "NIV",
      theme: "Grace & Power",
    },
    hashtags: ["#GospelHope", "#DailyBread", "#Grace", "#FaithOverFear"],
    likes: 3420,
    repostsCount: 890,
    commentsCount: 184,
    viewsCount: 42100,
    sharesCount: 512,
    savesCount: 680,
    isLiked: true,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    commentsList: [
      { id: "cg1", user: "Sarah Mensah", username: "sarah_m", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", text: "Amen! Needed this exact reminder before my chemistry exam today 🙏", time: "15m", likes: 42 },
      { id: "cg2", user: "Michael Adjei", username: "madjei", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", text: "Glory to God! Have a blessed week Pastor.", time: "10m", likes: 18 },
    ],
  },
  {
    id: "p1",
    type: "immersive_video",
    category: "tech",
    author: {
      id: "u1",
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badgeType: "blue",
      timeAgo: "2h",
      privacy: "Public",
      isFollowed: false,
    },
    content: "3 years of building in the dark, and today our largest platform update is finally live across SpheraNet! 🚀✨ Complete Twitter/X style collegiate social graph with dedicated Gospel Hub and instant campus pulse. Tag a friend who needs to see this! 💫",
    videoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Afrobeats Synthwave Future Mix Vol. 4",
    musicAuthor: "DJ Khaled x Sphera Sound",
    hashtags: ["#SpheraViral", "#GospelMenu", "#TechPulse", "#BuildInPublic", "#AI2026"],
    likes: 184200,
    repostsCount: 14200,
    commentsCount: 3210,
    viewsCount: 680000,
    sharesCount: 8900,
    savesCount: 12400,
    isLiked: true,
    likedByFriend: "Marcus Johnson",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    commentsList: [
      { id: "c1", user: "Marcus Johnson", username: "mj_tech", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", text: "This UI is next level! The sound synchronization and Gospel integration is insane 🔥", time: "1h", likes: 242 },
      { id: "c2", user: "Zara Williams", username: "zara.w", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", text: "Proud of you Amara! Collegiate feeds will never be the same 👏", time: "45m", likes: 118 },
    ],
  },
  {
    id: "p-gospel-2",
    type: "poll",
    category: "gospel",
    author: {
      id: "u-fellowship",
      name: "Collegiate Christian Fellowship",
      username: "campus_fellowship",
      avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badgeType: "gospel",
      timeAgo: "3h",
      privacy: "Public",
      isFollowed: true,
    },
    content: "Quick poll for our Friday Inter-Campus Fellowship Night at Stamp Grand Ballroom (UMD & Towson combined)! Which study series should we kick off for the second half of the semester? 📖🕊️",
    poll: {
      id: "poll-1",
      question: "Which bible study series should we launch this Friday?",
      options: [
        { id: "opt-1", text: "Finding Peace in High-Stress Seasons", votes: 482, voted: true },
        { id: "opt-2", text: "Kingdom Purpose in Technology & AI", votes: 395 },
        { id: "opt-3", text: "The Book of Romans: Deep Dive", votes: 260 },
        { id: "opt-4", text: "Faith & Leadership on Campus", votes: 198 },
      ],
      totalVotes: 1335,
      expiresIn: "18 hours left",
      hasVoted: true,
    },
    hashtags: ["#BibleStudy", "#CampusRevival", "#Fellowship", "#GospelMenu"],
    likes: 890,
    repostsCount: 240,
    commentsCount: 94,
    viewsCount: 18900,
    sharesCount: 140,
    savesCount: 210,
    isLiked: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    commentsList: [
      { id: "c-poll-1", user: "Daniel Kwak", username: "dkwak", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", text: "Voted for Peace in High-Stress! Midterms are testing us all haha", time: "2h", likes: 35 },
    ],
  },
  {
    id: "p2",
    type: "immersive_video",
    category: "tech",
    author: {
      id: "u2",
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badgeType: "blue",
      timeAgo: "4h",
      privacy: "Public",
      isFollowed: true,
    },
    content: "5 VS Code & AI shortcuts that changed my development workflow in 2026. Number 3 will save you 2 hours every single day 🤯 Try this right now and thank me later! 🦾💻",
    videoUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    musicTitle: "Lo-Fi Study Beats & Cyber Bass",
    musicAuthor: "ChillHop Cafe Records",
    hashtags: ["#CodingHacks", "#VSCode", "#DevLife", "#Productivity", "#Nextjs"],
    likes: 94200,
    repostsCount: 8400,
    commentsCount: 1780,
    viewsCount: 380000,
    sharesCount: 14200,
    savesCount: 31000,
    likedByFriend: "Zara Williams",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    commentsList: [
      { id: "c3", user: "Elena Vasquez", username: "elena_v", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Shortcut #3 just fixed my entire terminal layout thank you!", time: "2h", likes: 89 },
    ],
  },
  {
    id: "p3",
    type: "standard",
    category: "campus",
    author: {
      id: "u3",
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badgeType: "campus",
      timeAgo: "1d",
      privacy: "Public",
      isFollowed: true,
    },
    content: "Collegiate hackathon kickoff at University of Maryland! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen gaming protocols 🔥 The energy in the Iribe Center is unbelievable.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    hashtags: ["#HackUMD", "#StudentBuilders", "#CampusLife", "#Robotics"],
    likes: 34100,
    repostsCount: 3200,
    commentsCount: 1420,
    viewsCount: 125000,
    sharesCount: 5800,
    savesCount: 3120,
    likedByFriend: "Kwesi Asiedu",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    commentsList: [
      { id: "c4", user: "David Chen", username: "dchen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", text: "Best hackathon project of the season!", time: "5h", likes: 45 },
    ],
  },
];

export const initialStories: StoryItem[] = [
  {
    id: "s0",
    username: "Your Story",
    displayName: "Kwesi Asiedu",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Late night building across SpheraNet! ⚡",
    timeAgo: "Just now",
    isUser: true,
  },
  {
    id: "s-gospel",
    username: "pastordavid",
    displayName: "Pastor David",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Morning Devotional & Prayer: 'His mercies are new every morning!' 📖🕊️",
    timeAgo: "35m",
    isGospel: true,
  },
  {
    id: "s1",
    username: "amara_creates",
    displayName: "Amara Diallo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "Live coding the new AI duets! Join the stream 🎙️",
    timeAgo: "2h",
    hasLive: true,
  },
  {
    id: "s2",
    username: "mj_tech",
    displayName: "Marcus J.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "New desk setup with triple curved monitors 🚀",
    timeAgo: "4h",
  },
  {
    id: "s3",
    username: "zara.w",
    displayName: "Zara W.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    mediaType: "image",
    caption: "HackUMD day 2 breakfast round ☕🥞",
    timeAgo: "6h",
  },
];

export const initialLiveStreams: LiveStreamItem[] = [
  {
    id: "l-faith",
    name: "Grace Collegiate Live",
    username: "grace_campus",
    viewers: "3.4K",
    viewerCount: 3410,
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    title: "Live Worship & Midweek Prayer Lounge",
    streamUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80",
    category: "Gospel & Faith",
    startedAt: "20m ago",
    isFaith: true,
  },
  {
    id: "l1",
    name: "Amara Diallo",
    username: "amara_creates",
    viewers: "4.2K",
    viewerCount: 4230,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Live Coding & UI Architecture",
    streamUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    category: "Tech & Coding",
    startedAt: "35m ago",
  },
];

// Global persistent in-memory store instance
declare global {
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_POSTS__: FeedPost[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_STORIES__: StoryItem[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FEED_LIVE__: LiveStreamItem[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_PRAYERS__: PrayerRequestItem[] | undefined;
  // eslint-disable-next-line no-var
  var __SPHERA_FOLLOWED_USERS__: Set<string> | undefined;
}

// Persistent storage on local storage & json fallback
function getStorageFilePaths(filename: string): string[] {
  if (typeof window !== "undefined") return [];
  try {
    const p = require("path");
    const fs = require("fs");
    const primary = p.join(process.cwd(), "data", "db", filename);
    const dir = p.dirname(primary);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return [
      primary,
      p.join(process.cwd(), "sphera-portal", "data", "db", filename),
      p.join(process.cwd(), "data", filename),
    ];
  } catch {
    return [];
  }
}

function loadPersistedData<T>(filename: string, fallback: T): T {
  if (typeof window !== "undefined") return fallback;
  try {
    const fs = require("fs");
    const filePaths = getStorageFilePaths(filename);
    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as unknown as T;
        }
      }
    }
  } catch (err) {
    console.warn(`[FeedStore] Notice for ${filename}:`, err);
  }
  return fallback;
}

function savePersistedData(filename: string, data: any) {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const p = require("path");
    const filePaths = getStorageFilePaths(filename);
    for (const filePath of filePaths) {
      const dir = p.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn(`[FeedStore] Could not save ${filename}:`, err);
  }
}

if (!globalThis.__SPHERA_FEED_POSTS__) {
  globalThis.__SPHERA_FEED_POSTS__ = loadPersistedData<FeedPost[]>("feed_posts.json", [...initialFeedPosts]);
}

if (!globalThis.__SPHERA_FEED_STORIES__) {
  globalThis.__SPHERA_FEED_STORIES__ = loadPersistedData<StoryItem[]>("feed_stories.json", [...initialStories]);
}

if (!globalThis.__SPHERA_FEED_LIVE__) {
  globalThis.__SPHERA_FEED_LIVE__ = loadPersistedData<LiveStreamItem[]>("feed_livestreams.json", [...initialLiveStreams]);
}

if (!globalThis.__SPHERA_PRAYERS__) {
  globalThis.__SPHERA_PRAYERS__ = loadPersistedData<PrayerRequestItem[]>("prayers.json", [...initialPrayerRequests]);
}

if (!globalThis.__SPHERA_FOLLOWED_USERS__) {
  globalThis.__SPHERA_FOLLOWED_USERS__ = new Set(["mj_tech", "zara.w", "pastordavid", "campus_fellowship"]);
}

export const feedStore = {
  getPosts: (mode: "FYP" | "FOLLOWING" | "GOSPEL" | "CAMPUS" | string = "FYP"): FeedPost[] => {
    globalThis.__SPHERA_FEED_POSTS__ = loadPersistedData<FeedPost[]>("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__ || [...initialFeedPosts]);
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    const followed = globalThis.__SPHERA_FOLLOWED_USERS__ || new Set();
    const upperMode = (mode || "FYP").toUpperCase();

    if (upperMode === "FOLLOWING") {
      return posts.filter((p) => followed.has(p.author.username) || p.author.isFollowed);
    }
    if (upperMode === "GOSPEL" || upperMode === "FAITH") {
      return posts.filter((p) => p.category === "gospel" || p.category === "faith" || p.type === "gospel_scripture" || p.isGospel);
    }
    if (upperMode === "CAMPUS") {
      return posts.filter((p) => p.category === "campus" || p.hashtags?.some((h) => h.includes("Campus") || h.includes("UMD") || h.includes("Towson") || h.includes("Salisbury")));
    }
    return posts;
  },

  addPost: (post: Omit<FeedPost, "id" | "likes" | "commentsCount" | "sharesCount" | "createdAt"> & { id?: string }): FeedPost => {
    const newPost: FeedPost = {
      ...post,
      id: post.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      repostsCount: 0,
      viewsCount: 1,
      savesCount: 0,
      isLiked: true,
      isSaved: false,
      isReposted: false,
      commentsList: [],
      createdAt: new Date().toISOString(),
    };
    globalThis.__SPHERA_FEED_POSTS__ = [newPost, ...(globalThis.__SPHERA_FEED_POSTS__ || [])];
    savePersistedData("feed_posts.json", globalThis.__SPHERA_FEED_POSTS__);
    return newPost;
  },

  toggleLike: (postId: string): { isLiked: boolean; likes: number } => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updated = { isLiked: false, likes: 0 };

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        const nextLikes = nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
        updated = { isLiked: nextLiked, likes: nextLikes };
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLikes,
        };
      }
      return p;
    });

    return updated;
  },

  toggleRepost: (postId: string): { isReposted: boolean; repostsCount: number } => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updated = { isReposted: false, repostsCount: 0 };

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        const nextReposted = !p.isReposted;
        const nextCount = nextReposted ? (p.repostsCount || 0) + 1 : Math.max(0, (p.repostsCount || 0) - 1);
        updated = { isReposted: nextReposted, repostsCount: nextCount };
        return {
          ...p,
          isReposted: nextReposted,
          repostsCount: nextCount,
        };
      }
      return p;
    });

    return updated;
  },

  votePoll: (postId: string, optionId: string): FeedPoll | null => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updatedPoll: FeedPoll | null = null;

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId && p.poll && !p.poll.hasVoted) {
        const nextOptions = p.poll.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1, voted: true };
          }
          return opt;
        });
        const totalVotes = p.poll.totalVotes + 1;
        updatedPoll = {
          ...p.poll,
          options: nextOptions,
          totalVotes,
          hasVoted: true,
        };
        return {
          ...p,
          poll: updatedPoll,
        };
      }
      return p;
    });

    return updatedPoll;
  },

  toggleSave: (postId: string): { isSaved: boolean; savesCount: number } => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    let updated = { isSaved: false, savesCount: 0 };

    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        const nextSaved = !p.isSaved;
        const nextSaves = nextSaved ? (p.savesCount || 0) + 1 : Math.max(0, (p.savesCount || 0) - 1);
        updated = { isSaved: nextSaved, savesCount: nextSaves };
        return {
          ...p,
          isSaved: nextSaved,
          savesCount: nextSaves,
        };
      }
      return p;
    });

    return updated;
  },

  toggleFollow: (username: string): boolean => {
    const followed = globalThis.__SPHERA_FOLLOWED_USERS__ || new Set();
    const isCurrentlyFollowed = followed.has(username);

    if (isCurrentlyFollowed) {
      followed.delete(username);
    } else {
      followed.add(username);
    }

    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.author.username === username) {
        return {
          ...p,
          author: { ...p.author, isFollowed: !isCurrentlyFollowed },
        };
      }
      return p;
    });

    return !isCurrentlyFollowed;
  },

  addComment: (postId: string, text: string, user = "Kwesi Asiedu", username = "kwesi"): CommentItem | null => {
    const posts = globalThis.__SPHERA_FEED_POSTS__ || [];
    const newComment: CommentItem = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user,
      username,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      text: text.trim(),
      time: "Just now",
      likes: 0,
    };

    let added = false;
    globalThis.__SPHERA_FEED_POSTS__ = posts.map((p) => {
      if (p.id === postId) {
        added = true;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [newComment, ...(p.commentsList || [])],
        };
      }
      return p;
    });

    return added ? newComment : null;
  },

  // Prayer Wall Actions
  getPrayers: (): PrayerRequestItem[] => {
    return globalThis.__SPHERA_PRAYERS__ || initialPrayerRequests;
  },

  togglePray: (prayerId: string): { prayedCount: number; hasPrayed: boolean } => {
    const prayers = globalThis.__SPHERA_PRAYERS__ || initialPrayerRequests;
    let res = { prayedCount: 0, hasPrayed: false };
    globalThis.__SPHERA_PRAYERS__ = prayers.map((pr) => {
      if (pr.id === prayerId) {
        const nextPrayed = !pr.hasPrayed;
        const count = nextPrayed ? pr.prayedCount + 1 : Math.max(0, pr.prayedCount - 1);
        res = { prayedCount: count, hasPrayed: nextPrayed };
        return { ...pr, hasPrayed: nextPrayed, prayedCount: count };
      }
      return pr;
    });
    return res;
  },

  addPrayerRequest: (title: string, details: string, category: PrayerRequestItem["category"] = "General"): PrayerRequestItem => {
    const newPrayer: PrayerRequestItem = {
      id: `pr-${Date.now()}`,
      authorName: "Kwesi Asiedu",
      authorUsername: "kwesi",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      title,
      details,
      category,
      prayedCount: 1,
      hasPrayed: true,
      timeAgo: "Just now",
      answersCount: 0,
    };
    globalThis.__SPHERA_PRAYERS__ = [newPrayer, ...(globalThis.__SPHERA_PRAYERS__ || initialPrayerRequests)];
    savePersistedData("prayers.json", globalThis.__SPHERA_PRAYERS__);
    return newPrayer;
  },

  getStories: (): StoryItem[] => {
    return globalThis.__SPHERA_FEED_STORIES__ || [];
  },

  addStory: (story: Omit<StoryItem, "id" | "timeAgo">): StoryItem => {
    const newStory: StoryItem = {
      ...story,
      id: `story-${Date.now()}`,
      timeAgo: "Just now",
    };
    globalThis.__SPHERA_FEED_STORIES__ = [newStory, ...(globalThis.__SPHERA_FEED_STORIES__ || [])];
    return newStory;
  },

  getLiveStreams: (): LiveStreamItem[] => {
    return globalThis.__SPHERA_FEED_LIVE__ || [];
  },

  startLiveStream: (stream: Omit<LiveStreamItem, "id" | "viewers" | "viewerCount" | "startedAt">): LiveStreamItem => {
    const newLive: LiveStreamItem = {
      ...stream,
      id: `live-${Date.now()}`,
      viewers: "1",
      viewerCount: 1,
      startedAt: "Just now",
    };
    globalThis.__SPHERA_FEED_LIVE__ = [newLive, ...(globalThis.__SPHERA_FEED_LIVE__ || [])];
    return newLive;
  },
};
