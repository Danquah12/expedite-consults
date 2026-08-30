"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Home,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Sparkles,
  Send,
  Plus,
  Search,
  Bell,
  Check,
  Tag,
  BookOpen,
  Laptop,
  Flame,
  Award,
  Globe,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Map as MapIcon,
  GraduationCap,
  QrCode,
  X,
  Radio,
  Coffee,
  Pizza,
  Zap,
  Bookmark,
  RotateCcw,
  Database,
  Cloud,
  LogOut,
  ChevronDown,
  UserCheck,
  Building2,
  Briefcase,
  Microscope,
  Vote,
  Trophy,
  Bot,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Info,
  CalendarCheck,
  Building,
  Layers,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Video,
  Play,
  Printer,
  Download,
  CheckSquare,
  UserPlus,
  Target,
  Wrench,
  Camera,
  CalendarDays,
  Film,
  Gamepad2,
  Sliders,
  ChevronUp,
  Settings,
  ShieldCheck,
  Flag,
  HelpCircle,
} from "lucide-react";

import {
  CampusPost,
  CampusEvent,
  CampusCourse,
  CampusClub,
  MarketItem,
  ChatMessage,
  MapLocationPin,
  UserProfile,
  VolunteerActivity,
  ResearchOpportunity,
  CampusJob,
  CampusPoll,
  CampusAlert,
  CampusMediaItem,
  CourseStudyPod,
  LiveCampusActivity,
  PeerMatch,
  QuickGroup,
  CampusOpportunity,
  CampusServiceRequest,
  EventMemory,
  OfficeHourSlot,
  CampusReel,
  CampusGame,
  CampusNotification,
  NotificationPreferences,
  ContentReport,
  defaultCurrentUser,
  defaultNotificationPreferences,
} from "@/lib/campus-data";

import {
  loadCampusPosts,
  saveCampusPosts,
  loadCampusEvents,
  saveCampusEvents,
  loadCampusCourses,
  saveCampusCourses,
  loadCampusClubs,
  saveCampusClubs,
  loadVolunteerActivities,
  saveVolunteerActivities,
  loadResearchProjects,
  saveResearchProjects,
  loadCampusJobs,
  saveCampusJobs,
  loadCampusPolls,
  saveCampusPolls,
  loadCampusAlerts,
  saveCampusAlerts,
  loadMarketplaceItems,
  saveMarketplaceItems,
  loadChatMessages,
  saveChatMessages,
  loadCampusMedia,
  saveCampusMedia,
  loadStudyPods,
  saveStudyPods,
  loadLiveActivities,
  saveLiveActivities,
  loadPeerMatches,
  savePeerMatches,
  loadQuickGroups,
  saveQuickGroups,
  loadCampusOpportunities,
  saveCampusOpportunities,
  loadServiceRequests,
  saveServiceRequests,
  loadEventMemories,
  saveEventMemories,
  loadOfficeHours,
  saveOfficeHours,
  loadCampusReels,
  saveCampusReels,
  loadCampusGames,
  saveCampusGames,
  loadCampusNotifications,
  saveCampusNotifications,
  loadNotificationPreferences,
  saveNotificationPreferences,
  saveContentReport,
  loadCurrentUser,
  saveCurrentUser,
  resetCampusDemoData,
} from "@/lib/campus-storage";

export default function CampusSyncApp() {
  const router = useRouter();

  // Primary 6 Tabs + More Sub-views
  const [activeTab, setActiveTab] = useState<
    "home" | "campus" | "organizations" | "events" | "activities" | "messages" | "more"
  >("home");

  // More Sub-views
  const [moreSubView, setMoreSubView] = useState<
    "transcript" | "reels" | "games" | "opportunities" | "peermatch" | "studypods" | "media" | "ai" | "map" | "marketplace" | "admin"
  >("reels");

  // Multi-Campus Switcher
  const [selectedCampus, setSelectedCampus] = useState<"Main Campus" | "Downtown Campus" | "Medical Campus">("Main Campus");

  // Modals & Panels
  const [selectedOrgModal, setSelectedOrgModal] = useState<CampusClub | null>(null);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<CampusEvent | null>(null);
  const [selectedMapPin, setSelectedMapPin] = useState<MapLocationPin | null>(null);
  const [selectedMediaModal, setSelectedMediaModal] = useState<CampusMediaItem | null>(null);
  const [selectedMemoryModal, setSelectedMemoryModal] = useState<EventMemory | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showHostEventModal, setShowHostEventModal] = useState(false);
  const [showCreatePodModal, setShowCreatePodModal] = useState(false);
  const [showQuickGroupModal, setShowQuickGroupModal] = useState(false);
  const [show311Modal, setShow311Modal] = useState(false);
  const [showListMarketItemModal, setShowListMarketItemModal] = useState(false);
  const [showUploadReelModal, setShowUploadReelModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showNotifPrefsModal, setShowNotifPrefsModal] = useState(false);
  const [showOmniSearch, setShowOmniSearch] = useState(false);
  const [reportTargetEntity, setReportTargetEntity] = useState<{ id: string; type: "POST" | "REEL" | "COMMENT"; title: string } | null>(null);

  const [isQrCheckedIn, setIsQrCheckedIn] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Reels Player State
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [selectedReelResolution, setSelectedReelResolution] = useState<"1080p" | "720p" | "480p">("1080p");

  // Games & Trivia State
  const [activeTriviaQuestionIdx, setActiveTriviaQuestionIdx] = useState(0);
  const [triviaSelectedOption, setTriviaSelectedOption] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaGameOver, setTriviaGameOver] = useState(false);

  // Notification Filter Tab
  const [notifFilterTab, setNotifFilterTab] = useState<"ALL" | "EVENT" | "ORG" | "SOCIAL" | "SYSTEM">("ALL");

  // Campus AI Chat State
  const [aiChatQuery, setAiChatQuery] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hello Kwesi! I'm your Campus AI Assistant. Ask me about upcoming events, reels, research openings, volunteer shifts, or study groups on campus.",
    },
  ]);

  // Core Data Stores
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultCurrentUser);
  const [reels, setReels] = useState<CampusReel[]>([]);
  const [games, setGames] = useState<CampusGame[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [liveActivities, setLiveActivities] = useState<LiveCampusActivity[]>([]);
  const [peerMatches, setPeerMatches] = useState<PeerMatch[]>([]);
  const [quickGroups, setQuickGroups] = useState<QuickGroup[]>([]);
  const [opportunities, setOpportunities] = useState<CampusOpportunity[]>([]);
  const [serviceRequests, setServiceRequests] = useState<CampusServiceRequest[]>([]);
  const [eventMemories, setEventMemories] = useState<EventMemory[]>([]);
  const [officeHours, setOfficeHours] = useState<OfficeHourSlot[]>([]);
  const [alerts, setAlerts] = useState<CampusAlert[]>([]);
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [clubs, setClubs] = useState<CampusClub[]>([]);
  const [activities, setActivities] = useState<VolunteerActivity[]>([]);
  const [courses, setCourses] = useState<CampusCourse[]>([]);
  const [studyPods, setStudyPods] = useState<CourseStudyPod[]>([]);
  const [mediaItems, setMediaItems] = useState<CampusMediaItem[]>([]);
  const [polls, setPolls] = useState<CampusPoll[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState("#general-announcements");
  const [inputMsg, setInputMsg] = useState("");

  // Post Composer State
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostScope, setNewPostScope] = useState<"CAMPUS_WIDE" | "CLUB" | "DEPARTMENT">("CAMPUS_WIDE");
  const [newPostLocation, setNewPostLocation] = useState("Student Center Main Hall");
  const [newPostImage, setNewPostImage] = useState<string>("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Host Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<CampusEvent["category"]>("Guest Speaker");
  const [newEventLocation, setNewEventLocation] = useState("Student Union Auditorium");
  const [newEventTime, setNewEventTime] = useState("Wednesday, 6:00 PM");
  const [newEventSpeaker, setNewEventSpeaker] = useState("");
  const [newEventCapacity, setNewEventCapacity] = useState(150);

  // Quick 30-Second Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupPurpose, setNewGroupPurpose] = useState("");
  const [newGroupExpiration, setNewGroupExpiration] = useState("Expires May 15, 2026 (End of Semester)");

  // Reel Upload Form State
  const [newReelTitle, setNewReelTitle] = useState("");
  const [newReelCategory, setNewReelCategory] = useState<CampusReel["category"]>("Robotics");
  const [newReelAudio, setNewReelAudio] = useState("Original Sound — Student Lab");

  // 311 Ticket Form State
  const [new311Category, setNew311Category] = useState<CampusServiceRequest["category"]>("Wi-Fi & Network");
  const [new311Location, setNew311Location] = useState("Main Library 3rd Floor Pods");
  const [new311Description, setNew311Description] = useState("");

  // Study Pod Form State
  const [newPodCourse, setNewPodCourse] = useState("CMSC 421");
  const [newPodTopic, setNewPodTopic] = useState("");
  const [newPodRoom, setNewPodRoom] = useState("Main Library 3rd Floor, Pod C");
  const [newPodTime, setNewPodTime] = useState("Today at 5:00 PM");

  // Marketplace Item Form State
  const [newMarketTitle, setNewMarketTitle] = useState("");
  const [newMarketPrice, setNewMarketPrice] = useState(25);
  const [newMarketCategory, setNewMarketCategory] = useState<MarketItem["category"]>("Textbooks");
  const [newMarketCondition, setNewMarketCondition] = useState("Like New");

  // Report Form State
  const [reportReason, setReportReason] = useState<ContentReport["reason"]>("Inappropriate");
  const [reportDetails, setReportDetails] = useState("");

  // Opportunity Filter
  const [opportunityFilter, setOpportunityFilter] = useState<string>("ALL");

  // Campus Map Pins
  const campusPins: MapLocationPin[] = [
    {
      id: "pin-1",
      name: "Student Center & Union",
      code: "SC-100",
      type: "event",
      title: "Cultural Night & SGA Hub",
      description: "African Student Association showcase and student government desks.",
      x: 35,
      y: 45,
      activityCount: "240 Students",
      hours: "7:00 AM - Midnight",
      icon: "🎉",
    },
    {
      id: "pin-2",
      name: "Main Library 24/7 Pods",
      code: "LIB-24",
      type: "study",
      title: "Quiet Study Pods & Tech Cafe",
      description: "Silent group study pods, dual displays, and peer tutoring lounge.",
      x: 65,
      y: 28,
      activityCount: "88% Capacity",
      hours: "Open 24/7 (Midterms)",
      icon: "📚",
    },
    {
      id: "pin-3",
      name: "Memorial Quad & Lawn",
      code: "QUAD-N",
      type: "food",
      title: "Food Truck Fair & Community Service Desk",
      description: "Spring food festival staging area and voter registration booths.",
      x: 48,
      y: 65,
      activityCount: "42 in line",
      hours: "Until 8:00 PM",
      icon: "🌮",
    },
    {
      id: "pin-4",
      name: "Science & Engineering Hall",
      code: "ENG-204",
      type: "event",
      title: "Autonomous Security & Robotics Labs",
      description: "Dr. Hayes's Autonomous Loop Lab and drone obstacle trials.",
      x: 78,
      y: 72,
      activityCount: "35 Active",
      hours: "8:00 AM - 10:00 PM",
      icon: "🤖",
    },
  ];

  // Hydration from persistent storage
  useEffect(() => {
    setPosts(loadCampusPosts());
    setEvents(loadCampusEvents());
    setClubs(loadCampusClubs());
    setActivities(loadVolunteerActivities());
    setCourses(loadCampusCourses());
    setStudyPods(loadStudyPods());
    setMediaItems(loadCampusMedia());
    setPolls(loadCampusPolls());
    setAlerts(loadCampusAlerts());
    setMarketItems(loadMarketplaceItems());
    setMessages(loadChatMessages());
    setLiveActivities(loadLiveActivities());
    setPeerMatches(loadPeerMatches());
    setQuickGroups(loadQuickGroups());
    setOpportunities(loadCampusOpportunities());
    setServiceRequests(loadServiceRequests());
    setEventMemories(loadEventMemories());
    setOfficeHours(loadOfficeHours());
    setReels(loadCampusReels());
    setGames(loadCampusGames());
    setNotifications(loadCampusNotifications());
    setNotifPrefs(loadNotificationPreferences());
    setCurrentUser(loadCurrentUser());
    setIsHydrated(true);

    const handleSync = () => {
      setPosts(loadCampusPosts());
      setEvents(loadCampusEvents());
      setClubs(loadCampusClubs());
      setActivities(loadVolunteerActivities());
      setCourses(loadCampusCourses());
      setStudyPods(loadStudyPods());
      setMediaItems(loadCampusMedia());
      setPolls(loadCampusPolls());
      setAlerts(loadCampusAlerts());
      setMarketItems(loadMarketplaceItems());
      setMessages(loadChatMessages());
      setLiveActivities(loadLiveActivities());
      setPeerMatches(loadPeerMatches());
      setQuickGroups(loadQuickGroups());
      setOpportunities(loadCampusOpportunities());
      setServiceRequests(loadServiceRequests());
      setEventMemories(loadEventMemories());
      setOfficeHours(loadOfficeHours());
      setReels(loadCampusReels());
      setGames(loadCampusGames());
      setNotifications(loadCampusNotifications());
      setNotifPrefs(loadNotificationPreferences());
      setCurrentUser(loadCurrentUser());
    };

    window.addEventListener("campussync:sync", handleSync);
    window.addEventListener("campussync:reset", handleSync);
    return () => {
      window.removeEventListener("campussync:sync", handleSync);
      window.removeEventListener("campussync:reset", handleSync);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setShowNotificationToast(msg);
    setTimeout(() => setShowNotificationToast(null), 3500);
  };

  // 1. Switch User Roles
  const handleSwitchUserRole = (role: "student" | "officer" | "faculty") => {
    let user: UserProfile;
    if (role === "student") {
      user = defaultCurrentUser;
    } else if (role === "officer") {
      user = {
        ...defaultCurrentUser,
        id: "usr-amara",
        name: "Amara Diallo",
        email: "a.diallo@state.edu",
        major: "Business Administration & Marketing",
        role: "CLUB_LEAD",
        leadershipRoles: ["African Student Association — President", "Global Student Council"],
      };
    } else {
      user = {
        ...defaultCurrentUser,
        id: "usr-dr-hayes",
        name: "Dr. Catherine Hayes",
        email: "c.hayes@state.edu",
        major: "Department of Computer Science",
        role: "FACULTY",
        leadershipRoles: ["Principal Investigator — Autonomous Security Lab", "Faculty Advisor"],
      };
    }
    saveCurrentUser(user);
    setCurrentUser(user);
    setShowUserDropdown(false);
    triggerToast(`👤 Switched account to ${user.name} (${user.role})`);
  };

  // 2. Post creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CampusPost = {
      id: `p-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorMajor: currentUser.role === "FACULTY" ? "Faculty Advisor • CS Dept" : `${currentUser.major} • Class of ${currentUser.gradYear}`,
      authorAvatar: currentUser.avatar,
      clubName: currentUser.role === "CLUB_LEAD" ? "African Student Association (President)" : undefined,
      scope: newPostScope,
      location: newPostLocation,
      content: newPostContent,
      imageUrl: newPostImage.trim() || undefined,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      timeAgo: "Just now",
      createdAt: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveCampusPosts(updated);
    setNewPostContent("");
    setNewPostImage("");
    setShowImageInput(false);
    triggerToast("🎉 Post published to personalized campus feed!");
  };

  // 3. Like Post
  const handleToggleLike = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
        };
      }
      return p;
    });
    setPosts(updated);
    saveCampusPosts(updated);
  };

  // 4. Add Comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newComment = {
          id: `c-${Date.now()}`,
          authorId: currentUser.id,
          author: `${currentUser.name} (You)`,
          avatar: currentUser.avatar,
          text: text.trim(),
          time: "Just now",
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    setPosts(updated);
    saveCampusPosts(updated);
    setCommentInputs({ ...commentInputs, [postId]: "" });
    triggerToast("💬 Comment posted!");
  };

  // 5. Reels Toggle Like / Save
  const handleToggleReelLike = (reelId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const isLiked = !r.isLiked;
        return { ...r, isLiked, likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1 };
      }
      return r;
    });
    setReels(updated);
    saveCampusReels(updated);
  };

  const handleToggleReelSave = (reelId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const isSaved = !r.isSaved;
        return { ...r, isSaved, savesCount: isSaved ? r.savesCount + 1 : r.savesCount - 1 };
      }
      return r;
    });
    setReels(updated);
    saveCampusReels(updated);
    triggerToast("🔖 Reel saved to your campus bookmarks!");
  };

  // 6. Upload New Reel (Transcoding Pipeline Simulator)
  const handleUploadReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelTitle.trim()) return;

    const newReel: CampusReel = {
      id: `reel-${Date.now()}`,
      title: newReelTitle.trim(),
      creatorName: currentUser.name,
      creatorHandle: `@${currentUser.name.replace(/\s+/g, "_")}`,
      creatorAvatar: currentUser.avatar,
      videoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      audioTrack: newReelAudio.trim() || "Original Sound",
      duration: "0:30",
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isSaved: false,
      resolution: "1080p",
      category: newReelCategory,
    };

    const updated = [newReel, ...reels];
    setReels(updated);
    saveCampusReels(updated);
    setShowUploadReelModal(false);
    setNewReelTitle("");
    triggerToast("🎬 Reel transcoded (1080p, 720p, 480p) & published to Campus Reels feed!");
  };

  // 7. Interactive Trivia Game Engine
  const handleAnswerTriviaQuestion = (optionIdx: number) => {
    const currentGame = games[0];
    if (!currentGame) return;

    setTriviaSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentGame.questions[activeTriviaQuestionIdx].correctIndex;
    const addedScore = isCorrect ? 500 : 0;
    const nextScore = triviaScore + addedScore;
    setTriviaScore(nextScore);

    setTimeout(() => {
      if (activeTriviaQuestionIdx + 1 < currentGame.questions.length) {
        setActiveTriviaQuestionIdx(activeTriviaQuestionIdx + 1);
        setTriviaSelectedOption(null);
      } else {
        setTriviaGameOver(true);
        // Submit score to Leaderboard
        const updatedLeaderboard = [
          { rank: 1, studentName: currentUser.name, score: nextScore, major: currentUser.major, avatar: currentUser.avatar },
          ...currentGame.leaderboard.slice(0, 3).map((item, i) => ({ ...item, rank: i + 2 })),
        ];
        const updatedGames = games.map((g) => (g.id === currentGame.id ? { ...g, leaderboard: updatedLeaderboard } : g));
        setGames(updatedGames);
        saveCampusGames(updatedGames);
        triggerToast(`🏆 Trivia Complete! Scored ${nextScore} pts. You ranked #1 on the Semester Leaderboard!`);
      }
    }, 900);
  };

  const handleResetTriviaGame = () => {
    setActiveTriviaQuestionIdx(0);
    setTriviaSelectedOption(null);
    setTriviaScore(0);
    setTriviaGameOver(false);
  };

  // 8. Content Reporting (Moderation Engine)
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetEntity) return;

    const report: ContentReport = {
      id: `rep-${Date.now()}`,
      entityId: reportTargetEntity.id,
      entityType: reportTargetEntity.type,
      reason: reportReason,
      details: reportDetails,
      reporterId: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    saveContentReport(report);
    setReportTargetEntity(null);
    setReportDetails("");
    triggerToast("🛡️ Content flagged and sent to Student Affairs Moderation Queue for review.");
  };

  // 9. Event RSVP
  const handleToggleRsvp = (eventId: string, status: "GOING" | "INTERESTED") => {
    const targetEvent = events.find((e) => e.id === eventId);
    const newStatus = targetEvent?.userRsvp === status ? null : status;

    const updated = events.map((ev) => {
      if (ev.id === eventId) {
        const delta = newStatus === "GOING" ? 1 : ev.userRsvp === "GOING" ? -1 : 0;
        return {
          ...ev,
          userRsvp: newStatus,
          attendeesCount: ev.attendeesCount + delta,
        };
      }
      return ev;
    });

    setEvents(updated);
    saveCampusEvents(updated);

    if (newStatus === "GOING") {
      const updatedUser = { ...currentUser, eventsAttendedCount: currentUser.eventsAttendedCount + 1 };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }

    triggerToast(`📅 RSVP saved: ${newStatus ? (newStatus === "GOING" ? "Going ✓" : "Interested") : "Removed"}`);
  };

  // 10. Host New Event
  const handleHostNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const createdEvent: CampusEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      clubName: currentUser.role === "CLUB_LEAD" ? "African Student Association" : "Student Life",
      category: newEventCategory,
      location: newEventLocation,
      buildingCode: "SU-101",
      dateMonth: "MAR",
      dateDay: "14",
      time: newEventTime,
      capacity: newEventCapacity,
      attendeesCount: 1,
      userRsvp: "GOING",
      description: `Hosted by ${currentUser.name}. Join us for discussion, networking, and project demos.`,
      speakers: newEventSpeaker ? [{ name: newEventSpeaker, title: "Keynote Speaker", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }] : undefined,
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
      recommendationReason: "Event created by you",
      createdAt: new Date().toISOString(),
    };

    const updated = [createdEvent, ...events];
    setEvents(updated);
    saveCampusEvents(updated);
    setShowHostEventModal(false);
    setNewEventTitle("");
    triggerToast("🎉 Campus event created and published to calendar!");
  };

  // 11. Create 30-Second Quick Group
  const handleCreateQuickGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: QuickGroup = {
      id: `qg-${Date.now()}`,
      name: newGroupName.trim(),
      purpose: newGroupPurpose.trim() || "Project & study collaboration",
      creator: currentUser.name,
      membersCount: 1,
      expirationDate: newGroupExpiration,
      isJoined: true,
    };

    const updated = [newGroup, ...quickGroups];
    setQuickGroups(updated);
    saveQuickGroups(updated);
    setShowQuickGroupModal(false);
    setNewGroupName("");
    setNewGroupPurpose("");
    triggerToast(`⚡ "${newGroup.name}" created! Auto-expires on ${newGroup.expirationDate.split("(")[0]}`);
  };

  // 12. Submit Campus 311 Fix-It Ticket
  const handleSubmit311Request = (e: React.FormEvent) => {
    e.preventDefault();
    if (!new311Description.trim()) return;

    const newReq: CampusServiceRequest = {
      id: `req-${Date.now()}`,
      ticketNumber: `#311-${Math.floor(1000 + Math.random() * 9000)}`,
      category: new311Category,
      location: new311Location,
      description: new311Description.trim(),
      status: "Submitted",
      submittedTime: "Just now",
    };

    const updated = [newReq, ...serviceRequests];
    setServiceRequests(updated);
    saveServiceRequests(updated);
    setShow311Modal(false);
    setNew311Description("");
    triggerToast(`🛠️ Ticket ${newReq.ticketNumber} submitted to Campus Facilities!`);
  };

  // 13. Book Office Hours Slot
  const handleBookOfficeHours = (ohId: string, slotId: string) => {
    const updated = officeHours.map((oh) => {
      if (oh.id === ohId) {
        const updatedSlots = oh.slots.map((s) => {
          if (s.id === slotId) {
            const isBooked = !s.isBooked;
            return { ...s, isBooked, bookedBy: isBooked ? currentUser.name : undefined };
          }
          return s;
        });
        return { ...oh, slots: updatedSlots };
      }
      return oh;
    });

    setOfficeHours(updated);
    saveOfficeHours(updated);
    triggerToast("📅 Office hour meeting booked! Calendar invite sent.");
  };

  // 14. Peer Connect ("Find My People")
  const handleTogglePeerConnect = (peerId: string) => {
    const updated = peerMatches.map((p) => (p.id === peerId ? { ...p, isConnected: !p.isConnected } : p));
    setPeerMatches(updated);
    savePeerMatches(updated);
    const peer = peerMatches.find((p) => p.id === peerId);
    triggerToast(peer?.isConnected ? `Disconnected from ${peer.name}` : `🤝 Connected with ${peer?.name}! Chat room opened.`);
  };

  // 15. Apply for Consolidated Opportunity
  const handleApplyOpportunity = (oppId: string) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === oppId) {
        const hasApplied = !opp.hasApplied;
        triggerToast(hasApplied ? `💼 Application submitted for ${opp.title}!` : "Application withdrawn.");
        return { ...opp, hasApplied };
      }
      return opp;
    });
    setOpportunities(updated);
    saveCampusOpportunities(updated);
  };

  // 16. Volunteer Shift Claim & Hours Crediting
  const handleClaimVolunteerShift = (activityId: string, roleId: string) => {
    let hoursGained = 0;
    const updatedActivities = activities.map((act) => {
      if (act.id === activityId) {
        const updatedRoles = act.roles.map((r) => {
          if (r.id === roleId) {
            const isClaimed = !r.isClaimed;
            hoursGained = isClaimed ? r.hoursCredit : -r.hoursCredit;
            return {
              ...r,
              isClaimed,
              spotsFilled: isClaimed ? r.spotsFilled + 1 : r.spotsFilled - 1,
            };
          }
          return r;
        });
        return { ...act, roles: updatedRoles };
      }
      return act;
    });

    setActivities(updatedActivities);
    saveVolunteerActivities(updatedActivities);

    const updatedUser = {
      ...currentUser,
      volunteerHoursLogged: Math.max(0, currentUser.volunteerHoursLogged + hoursGained),
    };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);

    triggerToast(
      hoursGained > 0
        ? `🤝 Volunteer Shift Claimed! +${hoursGained} hours credited to your Engagement Profile!`
        : `Shift released.`
    );
  };

  // 17. Create Study Pod
  const handleCreateStudyPod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPodTopic.trim()) return;

    const newPod: CourseStudyPod = {
      id: `pod-${Date.now()}`,
      courseCode: newPodCourse,
      courseName: newPodCourse === "CMSC 421" ? "Operating Systems" : newPodCourse === "IT 350" ? "Network Defense" : "Linear Algebra",
      topic: newPodTopic.trim(),
      roomLocation: newPodRoom,
      meetingTime: newPodTime,
      maxMembers: 8,
      currentMembers: 1,
      organizer: currentUser.name,
      organizerAvatar: currentUser.avatar,
      isJoined: true,
    };

    const updated = [newPod, ...studyPods];
    setStudyPods(updated);
    saveStudyPods(updated);
    setShowCreatePodModal(false);
    setNewPodTopic("");
    triggerToast("📚 Study Pod created! Room reserved in library system.");
  };

  // 18. Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeChannel,
      sender: `${currentUser.name} (You)`,
      avatar: currentUser.avatar,
      text: inputMsg.trim(),
      time: "Just now",
      isMe: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveChatMessages(updated);
    setInputMsg("");
  };

  // 19. Campus AI Assistant Engine
  const handleSendAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;

    const userText = aiChatQuery.trim();
    const newHistory = [...aiChatHistory, { role: "user" as const, text: userText }];
    setAiChatHistory(newHistory);
    setAiChatQuery("");

    let aiResponse = "I've searched the State University digital campus ecosystem for you:";
    const lower = userText.toLowerCase();

    if (lower.includes("reel") || lower.includes("video") || lower.includes("robot")) {
      aiResponse = `🎬 Campus Reels highlight:
• **Autonomous battlebot arena test run** by @RoboticsSociety (2,450 likes)
• **Containerized honeypot live demo** by @CybersecurityClub`;
    } else if (lower.includes("trivia") || lower.includes("game") || lower.includes("score")) {
      aiResponse = `🎮 Campus Games:
You are currently ranked in the **Cybersecurity & Campus Tech Challenge**! Current top score is 9,420 pts. Launch it under ⋯ More → Games!`;
    } else if (lower.includes("volunteer") || lower.includes("cleanup") || lower.includes("food")) {
      aiResponse = `🤝 Active volunteer opportunities:
1. **Campus Food Drive & Pantry Distribution** (Saturday, 9 AM • +4 hrs credit).
You have currently completed **${currentUser.volunteerHoursLogged} verified volunteer hours**!`;
    } else {
      aiResponse = `I found matching events, reels, opportunities, and study pods matching "${userText}". Browse details under Opportunities, Reels, or Events!`;
    }

    setTimeout(() => {
      setAiChatHistory([...newHistory, { role: "ai", text: aiResponse }]);
    }, 600);
  };

  // Global Omni-Search Filtered Results
  const omniResults = {
    people: peerMatches.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.major.toLowerCase().includes(searchQuery.toLowerCase())),
    clubs: clubs.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    events: events.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())),
    reels: reels.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
    opportunities: opportunities.filter((o) => o.title.toLowerCase().includes(searchQuery.toLowerCase())),
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Hydrating Digital Campus Ecosystem...</span>
        </div>
      </div>
    );
  }

  const activeReel = reels[currentReelIndex] || reels[0];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {showNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-400 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="font-semibold text-sm">{showNotificationToast}</span>
        </div>
      )}

      {/* 1. MODAL: GLOBAL OMNI-SEARCH */}
      {showOmniSearch && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5 flex-1">
                <Search className="w-5 h-5 text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search people, clubs, events, reels, research, jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm font-semibold focus:outline-none"
                />
              </div>
              <button onClick={() => setShowOmniSearch(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Grid */}
            <div className="space-y-4 text-xs">
              {omniResults.people.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">People & Classmates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {omniResults.people.map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl flex items-center gap-2">
                        <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <span className="text-[10px] text-slate-400">{p.major}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {omniResults.events.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Events</h4>
                  <div className="space-y-1.5">
                    {omniResults.events.map((e) => (
                      <div key={e.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold">{e.title}</div>
                          <span className="text-[10px] text-slate-400">{e.location} • {e.time}</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          {e.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {omniResults.reels.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Reels & Videos</h4>
                  <div className="space-y-1.5">
                    {omniResults.reels.map((r) => (
                      <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-between">
                        <div className="truncate font-bold">🎬 {r.title}</div>
                        <span className="text-[10px] text-slate-400">{r.creatorHandle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: NOTIFICATION PREFERENCES */}
      {showNotifPrefsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowNotifPrefsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Notification Preferences</h3>
                <p className="text-xs text-slate-500">Customize push and email alerts to prevent notification fatigue.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="font-bold uppercase tracking-wider text-slate-400">Push Notifications (Mobile & Web)</div>
              
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl cursor-pointer">
                <span>Direct Messages & Group Chats</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.pushMessages}
                  onChange={(e) => {
                    const updated = { ...notifPrefs, pushMessages: e.target.checked };
                    setNotifPrefs(updated);
                    saveNotificationPreferences(updated);
                  }}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl cursor-pointer">
                <span>Event Reminders (1 hour before start)</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.pushEventReminders}
                  onChange={(e) => {
                    const updated = { ...notifPrefs, pushEventReminders: e.target.checked };
                    setNotifPrefs(updated);
                    saveNotificationPreferences(updated);
                  }}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl cursor-pointer">
                <span>Organization Pinned Announcements</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.pushOrgAnnouncements}
                  onChange={(e) => {
                    const updated = { ...notifPrefs, pushOrgAnnouncements: e.target.checked };
                    setNotifPrefs(updated);
                    saveNotificationPreferences(updated);
                  }}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <div className="font-bold uppercase tracking-wider text-slate-400 pt-2">Email Notifications</div>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl cursor-pointer">
                <span>Emergency & High-Priority University Alerts</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.emailImportantAnnouncements}
                  onChange={(e) => {
                    const updated = { ...notifPrefs, emailImportantAnnouncements: e.target.checked };
                    setNotifPrefs(updated);
                    saveNotificationPreferences(updated);
                  }}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>
            </div>

            <button
              onClick={() => {
                triggerToast("⚙️ Notification preferences updated!");
                setShowNotifPrefsModal(false);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 3. MODAL: NOTIFICATION CENTER DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 max-w-md w-full h-full p-6 shadow-2xl space-y-4 flex flex-col justify-between animate-in slide-in-from-right">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Notification Center</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNotifPrefsModal(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    title="Notification Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowNotifDrawer(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                {(["ALL", "EVENT", "ORG", "SOCIAL", "SYSTEM"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNotifFilterTab(tab)}
                    className={`px-3 py-1 rounded-xl transition ${
                      notifFilterTab === tab ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {notifications
                  .filter((n) => (notifFilterTab === "ALL" ? true : n.type === notifFilterTab))
                  .map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.actionUrl) setActiveTab(notif.actionUrl as any);
                        setShowNotifDrawer(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-1 ${
                        !notif.isRead
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900"
                          : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">{notif.body}</p>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => {
                const marked = notifications.map((n) => ({ ...n, isRead: true }));
                setNotifications(marked);
                saveCampusNotifications(marked);
                triggerToast("✓ All notifications marked as read!");
              }}
              className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 transition"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE REEL */}
      {showUploadReelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowUploadReelModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Upload Campus Reel</h3>
                <p className="text-xs text-slate-500">Share short video highlights, lab demos, or event recaps.</p>
              </div>
            </div>

            <form onSubmit={handleUploadReel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Reel Title / Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Battlebot arena trials in Eng 204! 🤖"
                  value={newReelTitle}
                  onChange={(e) => setNewReelTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <select
                    value={newReelCategory}
                    onChange={(e) => setNewReelCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5"
                  >
                    <option value="Robotics">Robotics & Labs 🤖</option>
                    <option value="Cybersecurity">Cybersecurity 🛡️</option>
                    <option value="Campus Life">Campus Life 🎉</option>
                    <option value="Athletics">Athletics & Sports 🏀</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Audio / Music Tag</label>
                  <input
                    type="text"
                    value={newReelAudio}
                    onChange={(e) => setNewReelAudio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 text-[11px] text-slate-600 dark:text-zinc-300 space-y-1">
                <span className="font-bold text-indigo-600 block">⚡ Automatic Transcoding Pipeline</span>
                <p>Generates 1080p, 720p, and 480p adaptive bitrate streams + thumbnails upon publication.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadReelModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Publish Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: CONTENT REPORTING */}
      {reportTargetEntity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setReportTargetEntity(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Report Content</h3>
                <p className="text-xs text-slate-500">Flag for Student Affairs & Campus Honor Code review.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Violation Category</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5"
                >
                  <option value="Inappropriate">Inappropriate / Harmful Content</option>
                  <option value="Harassment">Harassment / Bullying</option>
                  <option value="Academic Dishonesty">Academic Dishonesty / Cheating</option>
                  <option value="Spam">Spam / Unauthorized Commercial Promotion</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Additional Context</label>
                <textarea
                  placeholder="Provide context for campus moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportTargetEntity(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Campus Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("home")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                C
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                  CampusSync
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold leading-none">The Digital Campus</span>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700">
              {(["Main Campus", "Downtown Campus", "Medical Campus"] as const).map((camp) => (
                <button
                  key={camp}
                  onClick={() => {
                    setSelectedCampus(camp);
                    triggerToast(`📍 Switched view to ${camp}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedCampus === camp
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {camp.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Main Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "home"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab("campus")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "campus"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Campus</span>
            </button>

            <button
              onClick={() => setActiveTab("organizations")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "organizations"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Organizations</span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "events"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events</span>
            </button>

            <button
              onClick={() => setActiveTab("activities")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "activities"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Activities</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "messages"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveTab("more")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "more"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>⋯ More</span>
            </button>
          </nav>

          {/* Right Tools */}
          <div className="flex items-center gap-2.5">
            
            <button
              onClick={() => setShowOmniSearch(true)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition"
              title="Search Campus"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative pl-1 border-l border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold leading-tight">{currentUser.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block -mt-0.5">
                    {currentUser.role === "CLUB_LEAD" ? "👑 Club Lead" : currentUser.role === "FACULTY" ? "🏛️ Faculty" : "🎓 Verified Student"}
                  </span>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-3 z-50 animate-in fade-in space-y-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      {currentUser.studentId} • {currentUser.major}
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                    Switch Active Persona:
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleSwitchUserRole("student")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        currentUser.role === "STUDENT" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold" : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Kwesi Asiedu (Student)</span>
                      </div>
                      {currentUser.role === "STUDENT" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleSwitchUserRole("officer")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        currentUser.role === "CLUB_LEAD" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold" : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        <span>Amara Diallo (ASA President)</span>
                      </div>
                      {currentUser.role === "CLUB_LEAD" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleSwitchUserRole("faculty")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        currentUser.role === "FACULTY" ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold" : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Dr. Hayes (Faculty Advisor)</span>
                      </div>
                      {currentUser.role === "FACULTY" && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => router.push("/campus/login")}
                      className="w-full px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Student Onboarding</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 🔴 LAYER 1: AMBIENT LIVE ON CAMPUS PULSE STRIP */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-black uppercase tracking-wider text-[11px] text-rose-400">Live On Campus</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {liveActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  setActiveTab(act.linkTab);
                  triggerToast(`📍 Navigated to live ${act.title}`);
                }}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 cursor-pointer transition text-[11px]"
              >
                <span>{act.icon}</span>
                <span className="font-bold text-slate-200">{act.title}</span>
                <span className="text-amber-400 font-mono font-semibold">({act.attendeesCount.toLocaleString()} attending)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: 🏠 HOME */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Center Stream */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Personalized Greeting & Today's Schedule Card */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
                        {selectedCampus} • Today's Dashboard
                      </span>
                      <h1 className="text-2xl font-black mt-0.5">Good afternoon, {currentUser.name.split(" ")[0]}!</h1>
                      <p className="text-xs text-slate-300">
                        🎓 {currentUser.major} • Class of {currentUser.gradYear}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab("more");
                          setMoreSubView("reels");
                        }}
                        className="bg-rose-600 hover:bg-rose-700 border border-rose-400 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                      >
                        <Film className="w-3.5 h-3.5 text-white" />
                        <span>Watch Reels</span>
                      </button>
                    </div>
                  </div>

                  {/* Today's Schedule Timeline */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      📅 Your Schedule Today
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                        <span className="text-indigo-400 font-bold font-mono">10:00 AM</span>
                        <div className="font-bold text-white truncate">CMSC 421 Class</div>
                        <span className="text-[10px] text-slate-400">Hall B</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                        <span className="text-amber-400 font-bold font-mono">2:00 PM</span>
                        <div className="font-bold text-white truncate">Cybersecurity Club</div>
                        <span className="text-[10px] text-slate-400">Eng Lab 102</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                        <span className="text-emerald-400 font-bold font-mono">5:00 PM</span>
                        <div className="font-bold text-white truncate">AI Security Keynote</div>
                        <span className="text-[10px] text-slate-400">Student Union</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🧭 CAMPUS GRAPH RECOMMENDATION HERO WITH "WHY?" EXPLANATIONS */}
              <div className="bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/20 p-5 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Your Campus Recommendations (The Campus Graph)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-indigo-200">
                    Personalized For You
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md inline-block">
                      💡 Why: Based on Cybersecurity Club & IT Major
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Keynote: Autonomous Cyber Defense</h4>
                    <p className="text-[11px] text-slate-500">Distinguished lecture by DARPA AI Architect. Tuesday at 5:00 PM.</p>
                    <button
                      onClick={() => handleToggleRsvp("ev-1", "GOING")}
                      className="w-full bg-indigo-600 text-white text-xs font-bold py-1.5 rounded-xl hover:bg-indigo-700 transition"
                    >
                      RSVP Going ✓
                    </button>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md inline-block">
                      💡 Why: Matches CMSC 421 Course Schedule
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">CMSC 421 Virtual Memory Pod</h4>
                    <p className="text-[11px] text-slate-500">4 classmates studying in Main Library Pod B today at 4:30 PM.</p>
                    <button
                      onClick={() => {
                        setActiveTab("more");
                        setMoreSubView("studypods");
                      }}
                      className="w-full bg-slate-900 dark:bg-white dark:text-black text-white text-xs font-bold py-1.5 rounded-xl transition"
                    >
                      Join Study Pod
                    </button>
                  </div>
                </div>
              </div>

              {/* POST COMPOSER */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{currentUser.name}</span>
                      {currentUser.role === "CLUB_LEAD" && (
                        <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          👑 ASA President
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-400">Audience:</span>
                      <select
                        value={newPostScope}
                        onChange={(e) => setNewPostScope(e.target.value as any)}
                        className="text-xs font-semibold bg-slate-100 dark:bg-zinc-800 border-none rounded-lg px-2 py-0.5 text-indigo-600 dark:text-indigo-400"
                      >
                        <option value="CAMPUS_WIDE">🌐 All Campus</option>
                        <option value="CLUB">👥 Joined Organizations</option>
                        <option value="DEPARTMENT">📚 IT & CS Department</option>
                      </select>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreatePost}>
                  <textarea
                    placeholder="Share an announcement, event, student project, or activity..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={3}
                    className="w-full text-sm bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
                  />

                  {showImageInput && (
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      className="w-full mt-2 text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2"
                    />
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowImageInput(!showImageInput)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        <span>📷</span>
                        <span>{showImageInput ? "Remove Photo" : "Add Photo"}</span>
                      </button>
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <select
                          value={newPostLocation}
                          onChange={(e) => setNewPostLocation(e.target.value)}
                          className="bg-transparent border-none text-xs font-medium focus:ring-0 p-0"
                        >
                          <option value="Student Center Main Hall">Student Center Main Hall</option>
                          <option value="Science Complex Rm 104">Science Complex Rm 104</option>
                          <option value="Memorial Lawn Quad">Memorial Lawn Quad</option>
                          <option value="Engineering Hall 204">Engineering Hall 204</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPostContent.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post to Campus</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* POSTS LIST */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{post.authorName}</span>
                            {post.clubName && (
                              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                {post.clubName}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            <span>{post.authorMajor}</span> • <span>{post.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {post.location}
                        </span>
                        <button
                          onClick={() => setReportTargetEntity({ id: post.id, type: "POST", title: post.content.slice(0, 30) })}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Report Post"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-96">
                        <img src={post.imageUrl} alt="Attachment" className="w-full h-full object-cover hover:scale-102 transition duration-300" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                          post.isLiked ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40" : "hover:bg-slate-100"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-600" : ""}`} />
                        <span>{post.likesCount} Upvotes</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-slate-400" />
                        <span>{post.commentsCount} Comments</span>
                      </div>

                      <button onClick={() => triggerToast("🔗 Post link copied!")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

            </div>

            {/* Right Rail */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Campus Reels Teaser Widget */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trending Reels</h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("more");
                      setMoreSubView("reels");
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {reels.slice(0, 2).map((r, i) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setCurrentReelIndex(i);
                        setActiveTab("more");
                        setMoreSubView("reels");
                      }}
                      className="relative h-36 rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="text-[10px] font-bold truncate">{r.title}</span>
                        <span className="text-[9px] text-slate-300">❤️ {r.likesCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Trivia Challenge Widget */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cyber Trivia Challenge</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 px-2 py-0.5 rounded">
                    Rank #1 ({games[0]?.highScore} pts)
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Compete with classmates across IT and CS departments in weekly trivia sprints.
                </p>

                <button
                  onClick={() => {
                    setActiveTab("more");
                    setMoreSubView("games");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Trivia & Climb Leaderboard</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 🏫 CAMPUS */}
        {/* ========================================================================= */}
        {activeTab === "campus" && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Central University Information & Operations</span>
                <h1 className="text-2xl font-black mt-0.5">{selectedCampus} Directory & Facilities</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Access official campus news, faculty office hours, academic departments, dining menus, library hours, and 311 service tickets.
                </p>
              </div>
              <button
                onClick={() => setShow311Modal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Submit 311 Fix-It Ticket</span>
              </button>
            </div>

            {/* Quick Campus Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-lg">
                  🍔
                </div>
                <h3 className="text-sm font-bold">Campus Dining Menus</h3>
                <p className="text-xs text-slate-500">Student Center Food Court & Dining Hall: Open until 10:00 PM.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-lg">
                  📚
                </div>
                <h3 className="text-sm font-bold">Libraries & Study Pods</h3>
                <p className="text-xs text-slate-500">Main Library Floors 1-4 open 24/7. Dual monitor pod booking.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🚌
                </div>
                <h3 className="text-sm font-bold">Campus Shuttle Tracker</h3>
                <p className="text-xs text-slate-500">Next Blue Line Shuttle arrives at Student Union in 4 mins.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-lg">
                  🚨
                </div>
                <h3 className="text-sm font-bold">Campus Police & Safety</h3>
                <p className="text-xs text-slate-500">24/7 Blue Light Dispatch & Safe Escort Service: (555) 019-9111</p>
              </div>
            </div>

            {/* Professor Office Hours Booking System */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold">Professor Office-Hours Booking System</h3>
                </div>
                <span className="text-xs text-slate-400">15-minute consultation slots</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officeHours.map((oh) => (
                  <div key={oh.id} className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={oh.professorAvatar} alt={oh.professorName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{oh.professorName}</div>
                        <span className="text-[10px] text-slate-400">{oh.department} • 📍 {oh.officeLocation}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-indigo-600">{oh.dateDay} • {oh.timeRange}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {oh.slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleBookOfficeHours(oh.id, slot.id)}
                          className={`p-2 rounded-xl text-[11px] font-bold transition ${
                            slot.isBooked
                              ? slot.bookedBy === currentUser.name
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"
                              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-indigo-500"
                          }`}
                        >
                          {slot.isBooked ? (slot.bookedBy === currentUser.name ? "Your Slot ✓" : "Booked") : slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 👥 ORGANIZATIONS */}
        {/* ========================================================================= */}
        {activeTab === "organizations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black">Student Organizations & Societies</h1>
                <p className="text-xs text-slate-500">
                  Discover cultural, academic, professional, and Greek student organizations. Each organization has its own dedicated hub.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clubs.map((org) => (
                <div
                  key={org.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 relative bg-slate-200 dark:bg-zinc-800">
                      <img src={org.banner} alt={org.name} className="w-full h-full object-cover" />
                      <div className="absolute -bottom-4 left-5 w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-2xl shadow-md">
                        {org.logo}
                      </div>
                    </div>

                    <div className="p-5 pt-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {org.category}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{org.membersCount} Members</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{org.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">{org.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedOrgModal(org)}
                      className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 text-xs font-bold py-2 rounded-xl transition"
                    >
                      View Org Hub
                    </button>
                    <button
                      onClick={() => {
                        const updated = clubs.map((c) => (c.id === org.id ? { ...c, isJoined: !c.isJoined } : c));
                        setClubs(updated);
                        saveCampusClubs(updated);
                        triggerToast(org.isJoined ? `Left ${org.name}` : `🎉 Joined ${org.name}!`);
                      }}
                      className={`text-xs font-bold py-2 rounded-xl transition ${
                        org.isJoined
                          ? "bg-slate-200 dark:bg-zinc-800 text-slate-700"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                      }`}
                    >
                      {org.isJoined ? "Joined ✓" : "Join Org"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 📅 EVENTS */}
        {/* ========================================================================= */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black">Campus Activities & Event Calendar</h1>
                <p className="text-xs text-slate-500">
                  Guest lectures, basketball games, coding workshops, and art exhibitions with instant QR entrance tickets.
                </p>
              </div>
              <button
                onClick={() => setShowHostEventModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Host Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {events.map((event) => {
                const capacityPct = Math.min(100, Math.round((event.attendeesCount / event.capacity) * 100));
                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col md:flex-row"
                  >
                    <div className="md:w-64 h-48 md:h-auto relative bg-slate-200 dark:bg-zinc-800 shrink-0">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-center shadow-lg">
                        <span className="block text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">{event.dateMonth}</span>
                        <span className="block text-xl font-black leading-none">{event.dateDay}</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {event.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {event.buildingCode}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{event.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">{event.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleRsvp(event.id, "GOING")}
                          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            event.userRsvp === "GOING"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black"
                          }`}
                        >
                          {event.userRsvp === "GOING" && <Check className="w-3.5 h-3.5" />}
                          <span>{event.userRsvp === "GOING" ? "Going ✓" : "RSVP Going"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 🤝 ACTIVITIES */}
        {/* ========================================================================= */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Communal Work & Service Engine</span>
                <h1 className="text-2xl font-black mt-0.5">Volunteer Activities & Shift Hub</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Select volunteer shifts, check in on site, and have verified volunteer hours automatically credited to your Student Engagement Profile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
                      {activity.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{activity.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">{activity.description}</p>
                    
                    <div className="pt-2 space-y-2">
                      {activity.roles.map((role) => (
                        <div key={role.id} className="p-3 rounded-2xl border flex items-center justify-between text-xs bg-slate-50 dark:bg-zinc-800/40">
                          <div>
                            <div className="font-bold">{role.name} (+{role.hoursCredit} hrs)</div>
                            <span className="text-[10px] text-slate-400">{role.spotsFilled} / {role.spotsNeeded} Filled</span>
                          </div>
                          <button
                            onClick={() => handleClaimVolunteerShift(activity.id, role.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                              role.isClaimed ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
                            }`}
                          >
                            {role.isClaimed ? "Claimed ✓" : "Select"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 💬 MESSAGES */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 h-[620px]">
            <div className="md:col-span-4 border-r border-slate-200 dark:border-zinc-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Channels</h3>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setActiveChannel("#general-announcements")}
                  className={`w-full text-left p-2.5 rounded-xl font-bold transition ${
                    activeChannel === "#general-announcements" ? "bg-indigo-600 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  📢 #general-announcements
                </button>
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col justify-between h-full bg-slate-50/50 dark:bg-zinc-900/50 p-4">
              <div className="text-sm font-bold border-b pb-2">{activeChannel}</div>
              <div className="overflow-y-auto space-y-3 flex-1 py-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex items-start gap-2.5 ${m.isMe ? "flex-row-reverse" : ""}`}>
                    <img src={m.avatar} alt={m.sender} className="w-7 h-7 rounded-full object-cover" />
                    <div className={`p-3 rounded-2xl text-xs ${m.isMe ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-800 border"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs"
                />
                <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: ⋯ MORE (CAMPUS REELS & GAMES MODULAR SERVICES) */}
        {/* ========================================================================= */}
        {activeTab === "more" && (
          <div className="space-y-6">
            
            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              <button
                onClick={() => setMoreSubView("reels")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "reels" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Campus Reels</span>
              </button>

              <button
                onClick={() => setMoreSubView("games")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "games" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Campus Games & Trivia</span>
              </button>

              <button
                onClick={() => setMoreSubView("opportunities")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "opportunities" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Opportunity Hub</span>
              </button>

              <button
                onClick={() => setMoreSubView("peermatch")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "peermatch" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Find My People</span>
              </button>

              <button
                onClick={() => setMoreSubView("transcript")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "transcript" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Experience Transcript</span>
              </button>

              <button
                onClick={() => setMoreSubView("ai")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "ai" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Campus AI</span>
              </button>
            </div>

            {/* SUB-VIEW 1: 🎬 CAMPUS REELS VERTICAL VIEWER */}
            {moreSubView === "reels" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-black">Campus Reels — Short Video Stream</h2>
                    <p className="text-xs text-slate-500">Swipe through student projects, robotics trials, and campus life highlights.</p>
                  </div>
                  <button
                    onClick={() => setShowUploadReelModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Reel</span>
                  </button>
                </div>

                {/* Vertical Reels Player Shell */}
                <div className="flex justify-center">
                  <div className="w-full max-w-sm h-[580px] bg-black rounded-3xl overflow-hidden relative shadow-2xl flex flex-col justify-between border-4 border-slate-900">
                    
                    {/* Background Simulated Video Canvas */}
                    <img
                      src={activeReel.thumbnailUrl}
                      alt={activeReel.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-75"
                    />

                    {/* Top Controls: Resolution Switcher & Navigation */}
                    <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
                        <span>Res:</span>
                        {(["1080p", "720p", "480p"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setSelectedReelResolution(r);
                              triggerToast(`📺 Adaptive Bitrate switched to ${r}`);
                            }}
                            className={`px-1.5 py-0.5 rounded ${
                              selectedReelResolution === r ? "bg-rose-600 text-white" : "text-slate-400"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setReportTargetEntity({ id: activeReel.id, type: "REEL", title: activeReel.title })}
                        className="p-1.5 rounded-full bg-black/60 text-white hover:text-rose-400"
                        title="Report Reel"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right Side Interaction Buttons */}
                    <div className="relative z-20 self-end p-4 space-y-4 text-white text-center text-xs font-bold">
                      <button
                        onClick={() => handleToggleReelLike(activeReel.id)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className={`p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition ${activeReel.isLiked ? "text-rose-500" : ""}`}>
                          <Heart className={`w-5 h-5 ${activeReel.isLiked ? "fill-rose-500" : ""}`} />
                        </div>
                        <span className="text-[10px]">{activeReel.likesCount.toLocaleString()}</span>
                      </button>

                      <button onClick={() => triggerToast("💬 Reel comments opened!")} className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px]">{activeReel.commentsCount}</span>
                      </button>

                      <button onClick={() => handleToggleReelSave(activeReel.id)} className="flex flex-col items-center gap-1 group">
                        <div className={`p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition ${activeReel.isSaved ? "text-amber-400" : ""}`}>
                          <Bookmark className={`w-5 h-5 ${activeReel.isSaved ? "fill-amber-400" : ""}`} />
                        </div>
                        <span className="text-[10px]">Save</span>
                      </button>

                      <button onClick={() => triggerToast("🔗 Reel link copied!")} className="flex flex-col items-center gap-1 group">
                        <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px]">Share</span>
                      </button>
                    </div>

                    {/* Bottom Creator Meta & Reel Progress */}
                    <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <img src={activeReel.creatorAvatar} alt={activeReel.creatorName} className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500" />
                        <div>
                          <div className="text-xs font-black">{activeReel.creatorName}</div>
                          <span className="text-[10px] text-slate-300 font-mono">{activeReel.creatorHandle}</span>
                        </div>
                      </div>

                      <p className="text-xs leading-snug">{activeReel.title}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                        <span>🎵 {activeReel.audioTrack}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentReelIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1))}
                            className="p-1 rounded bg-white/20 hover:bg-white/40"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCurrentReelIndex((prev) => (prev + 1 < reels.length ? prev + 1 : 0))}
                            className="p-1 rounded bg-white/20 hover:bg-white/40"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-2/3" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: 🎮 CAMPUS GAMES & LIVE TRIVIA */}
            {moreSubView === "games" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black">Campus Games & Live Trivia Platform</h2>
                  <p className="text-xs text-slate-500">Compete in verified campus challenge modules and climb the University Semester Leaderboards.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Trivia Play Console */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{games[0]?.icon}</span>
                        <div>
                          <h3 className="text-base font-bold">{games[0]?.title}</h3>
                          <span className="text-[10px] text-slate-400">Question {activeTriviaQuestionIdx + 1} of {games[0]?.questions.length}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-indigo-600">{triviaScore} pts</span>
                        <span className="text-[10px] text-slate-400 block">Score</span>
                      </div>
                    </div>

                    {!triviaGameOver ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border text-sm font-bold">
                          {games[0]?.questions[activeTriviaQuestionIdx]?.question}
                        </div>

                        <div className="space-y-2">
                          {games[0]?.questions[activeTriviaQuestionIdx]?.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswerTriviaQuestion(idx)}
                              disabled={triviaSelectedOption !== null}
                              className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition ${
                                triviaSelectedOption === idx
                                  ? idx === games[0]?.questions[activeTriviaQuestionIdx].correctIndex
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-rose-600 text-white border-rose-600"
                                  : "bg-white dark:bg-zinc-900 border-slate-200 hover:border-indigo-500"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-3">
                        <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                        <h4 className="text-lg font-black">Challenge Complete!</h4>
                        <p className="text-xs text-slate-500">You scored {triviaScore} points and claimed the #1 rank!</p>
                        <button
                          onClick={handleResetTriviaGame}
                          className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                        >
                          Play Again
                        </button>
                      </div>
                    )}
                  </div>

                  {/* University Leaderboard */}
                  <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Semester Leaderboard</h3>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600">College of Engineering</span>
                    </div>

                    <div className="space-y-2">
                      {games[0]?.leaderboard.map((entry) => (
                        <div key={entry.rank} className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              entry.rank === 1 ? "bg-amber-400 text-black" : entry.rank === 2 ? "bg-slate-300 text-black" : "bg-amber-700 text-white"
                            }`}>
                              {entry.rank}
                            </span>
                            <img src={entry.avatar} alt={entry.studentName} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-zinc-100">{entry.studentName}</div>
                              <span className="text-[10px] text-slate-400">{entry.major}</span>
                            </div>
                          </div>
                          <span className="font-mono font-black text-indigo-600">{entry.score.toLocaleString()} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-VIEW 3: 💼 OPPORTUNITY HUB */}
            {moreSubView === "opportunities" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black">Unified Opportunity Hub</h2>
                  <p className="text-xs text-slate-500">Consolidated research, jobs, hackathons, and scholarships in one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-2.5 py-0.5 rounded-full">
                            {opp.type}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">{opp.rewardOrPay}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{opp.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400">{opp.description}</p>
                      </div>

                      <button
                        onClick={() => handleApplyOpportunity(opp.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                          opp.hasApplied ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white"
                        }`}
                      >
                        {opp.hasApplied ? "Applied ✓" : "1-Click Apply"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: 🤝 FIND MY PEOPLE */}
            {moreSubView === "peermatch" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black">Find My People — Peer Matchmaker</h2>
                  <p className="text-xs text-slate-500">Connect with classmates based on shared interests and goals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {peerMatches.map((peer) => (
                    <div key={peer.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={peer.avatar} alt={peer.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20" />
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{peer.name}</h3>
                            <span className="text-xs text-slate-400">{peer.major}</span>
                          </div>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                          {peer.compatibilityScore}% Compatibility Match
                        </div>
                        <p className="text-xs text-slate-500">💡 {peer.sharedReason}</p>
                      </div>

                      <button
                        onClick={() => handleTogglePeerConnect(peer.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                          peer.isConnected ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white"
                        }`}
                      >
                        {peer.isConnected ? "Connected ✓" : "Say Hi / Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: 🏆 EXPERIENCE TRANSCRIPT */}
            {moreSubView === "transcript" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4 border-b pb-6">
                  <div className="flex items-center gap-4">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-3xl object-cover ring-4 ring-indigo-500/30" />
                    <div>
                      <h2 className="text-xl font-black">{currentUser.name}</h2>
                      <p className="text-xs text-slate-500">Major: {currentUser.major} • ID: {currentUser.studentId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Official Service Certificate</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl">
                    <span className="text-2xl font-black text-indigo-600 block">{currentUser.volunteerHoursLogged}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Volunteer Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl">
                    <span className="text-2xl font-black text-amber-500 block">{currentUser.eventsAttendedCount}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Events Attended</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl">
                    <span className="text-2xl font-black text-emerald-500 block">{currentUser.leadershipRoles.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Leadership Roles</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl">
                    <span className="text-2xl font-black text-purple-500 block">{currentUser.achievements.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Achievements</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 6: 🤖 CAMPUS AI */}
            {moreSubView === "ai" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                    🤖
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Campus AI Knowledge Engine</h2>
                    <p className="text-xs text-slate-500">Ask natural language queries across the entire campus platform.</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border max-h-96 overflow-y-auto text-xs">
                  {aiChatHistory.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`p-3 rounded-2xl max-w-xl ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-900 border"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendAiPrompt} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask Campus AI (e.g. Find reels, trivia, volunteer shifts)..."
                    value={aiChatQuery}
                    onChange={(e) => setAiChatQuery(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-zinc-800 border rounded-xl px-4 py-2.5 text-xs"
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                    Ask AI
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
