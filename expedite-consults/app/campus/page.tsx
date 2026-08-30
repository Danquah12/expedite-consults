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
  Navigation,
  Battery,
  Eye,
  EyeOff,
  PhoneCall,
  Bus,
  Car,
  AlertOctagon,
  Footprints,
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
  TowsonBuilding,
  TowsonFloor,
  TowsonRoom,
  LocationCircle,
  CircleMember,
  TowsonShuttle,
  TowsonParkingGarage,
  SafetyBeacon,
  ScavengerHuntCheckpoint,
  NavigationStep,
  defaultCurrentUser,
  defaultNotificationPreferences,
  initialTowsonBuildings,
  initialTowsonCircles,
  initialTowsonShuttles,
  initialTowsonParking,
  initialTowsonSafetyBeacons,
  initialTowsonScavengerCheckpoints,
  sampleTowsonRoute,
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
  loadTowsonBuildings,
  saveTowsonBuildings,
  loadTowsonCircles,
  saveTowsonCircles,
  loadTowsonShuttles,
  saveTowsonShuttles,
  loadTowsonParking,
  saveTowsonParking,
  loadTowsonSafetyBeacons,
  saveTowsonSafetyBeacons,
  loadTowsonScavengerCheckpoints,
  saveTowsonScavengerCheckpoints,
  loadCurrentUser,
  saveCurrentUser,
  resetCampusDemoData,
} from "@/lib/campus-storage";

export default function CampusSyncApp() {
  const router = useRouter();

  // Primary Navigation
  const [activeTab, setActiveTab] = useState<
    "home" | "map" | "campus" | "organizations" | "events" | "activities" | "messages" | "more"
  >("home");

  // More Sub-views
  const [moreSubView, setMoreSubView] = useState<
    "map" | "transcript" | "reels" | "games" | "opportunities" | "peermatch" | "studypods" | "media" | "marketplace" | "ai" | "admin"
  >("map");

  // Multi-Campus Switcher (Towson University Flagship + Campuses)
  const [selectedCampus, setSelectedCampus] = useState<"Towson Main Campus" | "TU Downtown" | "TU Health Complex">("Towson Main Campus");

  // Map Engine & Location Sharing State
  const [towsonBuildings, setTowsonBuildings] = useState<TowsonBuilding[]>(initialTowsonBuildings);
  const [towsonCircles, setTowsonCircles] = useState<LocationCircle[]>(initialTowsonCircles);
  const [towsonShuttles, setTowsonShuttles] = useState<TowsonShuttle[]>(initialTowsonShuttles);
  const [towsonParking, setTowsonParking] = useState<TowsonParkingGarage[]>(initialTowsonParking);
  const [towsonSafetyBeacons, setTowsonSafetyBeacons] = useState<SafetyBeacon[]>(initialTowsonSafetyBeacons);
  const [towsonScavenger, setTowsonScavenger] = useState<ScavengerHuntCheckpoint[]>(initialTowsonScavengerCheckpoints);

  // Map Filters & View Modes
  const [mapLayerFilter, setMapLayerFilter] = useState<"ALL" | "BUILDINGS" | "CIRCLES" | "SHUTTLES" | "PARKING" | "SAFETY" | "SCAVENGER" | "FESTIVAL">("ALL");
  const [selectedBuildingModal, setSelectedBuildingModal] = useState<TowsonBuilding | null>(null);
  const [selectedBuildingFloor, setSelectedBuildingFloor] = useState<number>(3);
  const [selectedCircle, setSelectedCircle] = useState<LocationCircle | null>(null);
  const [selectedSafetyBeacon, setSelectedSafetyBeacon] = useState<SafetyBeacon | null>(null);
  const [showNavigationRouteModal, setShowNavigationRouteModal] = useState<boolean>(false);
  const [activeNavigationRoute, setActiveNavigationRoute] = useState<NavigationStep[]>(sampleTowsonRoute);
  const [isSafetyModeActive, setIsSafetyModeActive] = useState<boolean>(false);
  const [isFestivalModeActive, setIsFestivalModeActive] = useState<boolean>(false);
  const [userLocationSharingTimer, setUserLocationSharingTimer] = useState<string | null>(null);
  const [showLocationSharePicker, setShowLocationSharePicker] = useState<boolean>(false);

  // Core Modals & Panels
  const [selectedOrgModal, setSelectedOrgModal] = useState<CampusClub | null>(null);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<CampusEvent | null>(null);
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
      text: "Hello Kwesi! I'm your Towson Campus AI Assistant. Ask me about Cook Library study spaces, Science Complex labs, Tiger Ride shuttles, or student organizations on campus.",
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
  const [newPostLocation, setNewPostLocation] = useState("Freedom Square / Cook Library");
  const [newPostImage, setNewPostImage] = useState<string>("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Host Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<CampusEvent["category"]>("Guest Speaker");
  const [newEventLocation, setNewEventLocation] = useState("Science Complex Auditorium");
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
  const [newReelAudio, setNewReelAudio] = useState("Original Sound — TU Science Complex");

  // 311 Ticket Form State
  const [new311Category, setNew311Category] = useState<CampusServiceRequest["category"]>("Wi-Fi & Network");
  const [new311Location, setNew311Location] = useState("Cook Library 2nd Floor Pod B");
  const [new311Description, setNew311Description] = useState("");

  // Study Pod Form State
  const [newPodCourse, setNewPodCourse] = useState("COSC 421");
  const [newPodTopic, setNewPodTopic] = useState("");
  const [newPodRoom, setNewPodRoom] = useState("Cook Library 2nd Floor, Pod B");
  const [newPodTime, setNewPodTime] = useState("Today at 4:30 PM");

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
    setTowsonBuildings(loadTowsonBuildings());
    setTowsonCircles(loadTowsonCircles());
    setTowsonShuttles(loadTowsonShuttles());
    setTowsonParking(loadTowsonParking());
    setTowsonSafetyBeacons(loadTowsonSafetyBeacons());
    setTowsonScavenger(loadTowsonScavengerCheckpoints());
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
      setTowsonBuildings(loadTowsonBuildings());
      setTowsonCircles(loadTowsonCircles());
      setTowsonShuttles(loadTowsonShuttles());
      setTowsonParking(loadTowsonParking());
      setTowsonSafetyBeacons(loadTowsonSafetyBeacons());
      setTowsonScavenger(loadTowsonScavengerCheckpoints());
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

  // 1. Switch User Roles (Towson Personas)
  const handleSwitchUserRole = (role: "student" | "officer" | "faculty") => {
    let user: UserProfile;
    if (role === "student") {
      user = defaultCurrentUser;
    } else if (role === "officer") {
      user = {
        ...defaultCurrentUser,
        id: "usr-amara",
        name: "Amara Diallo",
        email: "a.diallo@students.towson.edu",
        major: "Business Administration & Marketing",
        role: "CLUB_LEAD",
        leadershipRoles: ["African Student Association — President", "TU Global Student Council"],
      };
    } else {
      user = {
        ...defaultCurrentUser,
        id: "usr-dr-hayes",
        name: "Dr. Catherine Hayes",
        email: "c.hayes@towson.edu",
        major: "Department of Computer and Information Sciences",
        role: "FACULTY",
        leadershipRoles: ["Principal Investigator — TU Autonomous Security Lab", "Faculty Advisor"],
      };
    }
    saveCurrentUser(user);
    setCurrentUser(user);
    setShowUserDropdown(false);
    triggerToast(`👤 Switched account to ${user.name} (${user.role})`);
  };

  // 2. Location Sharing Timer (Life360 Mode)
  const handleEnableLocationSharing = (durationText: string) => {
    const updatedUser = {
      ...currentUser,
      isLocationSharing: true,
      locationShareExpiresAt: durationText,
    };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
    setUserLocationSharingTimer(durationText);
    setShowLocationSharePicker(false);
    triggerToast(`🟢 Location Sharing Active: ${durationText} (Visible to your Circles)`);
  };

  const handleStopLocationSharing = () => {
    const updatedUser = {
      ...currentUser,
      isLocationSharing: false,
      locationShareExpiresAt: undefined,
    };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
    setUserLocationSharingTimer(null);
    setShowLocationSharePicker(false);
    triggerToast(`🛑 Location Sharing Stopped. Your location is now Private.`);
  };

  // 3. Check-in at Scavenger Hunt Checkpoint
  const handleScavengerCheckIn = (checkpointId: string) => {
    const updated = towsonScavenger.map((chk) => {
      if (chk.id === checkpointId) {
        if (chk.isVisited) return chk;
        const newPoints = chk.points;
        const updatedUser = {
          ...currentUser,
          achievements: Array.from(new Set([...(currentUser.achievements || []), chk.badgeReward])),
        };
        setCurrentUser(updatedUser);
        saveCurrentUser(updatedUser);
        triggerToast(`🎉 Landmark Check-In Verified! +${newPoints} pts & Unlocked badge: ${chk.badgeReward}!`);
        return { ...chk, isVisited: true };
      }
      return chk;
    });

    setTowsonScavenger(updated);
    saveTowsonScavengerCheckpoints(updated);
  };

  // 4. Post creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CampusPost = {
      id: `p-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorMajor: currentUser.role === "FACULTY" ? "Faculty Advisor • CIS Dept" : `${currentUser.major} • Class of ${currentUser.gradYear}`,
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
    triggerToast("🎉 Post published to Towson campus feed!");
  };

  // 5. Like Post
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

  // 6. Reels Toggle Like / Save
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

  // 7. Upload New Reel
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
      audioTrack: newReelAudio.trim() || "Original Sound — TU Science Complex",
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
    triggerToast("🎬 Reel transcoded (1080p, 720p, 480p) & published to Towson Reels feed!");
  };

  // 8. Trivia Challenge Engine
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
        const updatedLeaderboard = [
          { rank: 1, studentName: currentUser.name, score: nextScore, major: currentUser.major, avatar: currentUser.avatar },
          ...currentGame.leaderboard.slice(0, 3).map((item, i) => ({ ...item, rank: i + 2 })),
        ];
        const updatedGames = games.map((g) => (g.id === currentGame.id ? { ...g, leaderboard: updatedLeaderboard } : g));
        setGames(updatedGames);
        saveCampusGames(updatedGames);
        triggerToast(`🏆 Trivia Complete! Scored ${nextScore} pts. You ranked #1 on the TU Semester Leaderboard!`);
      }
    }, 900);
  };

  const handleResetTriviaGame = () => {
    setActiveTriviaQuestionIdx(0);
    setTriviaSelectedOption(null);
    setTriviaScore(0);
    setTriviaGameOver(false);
  };

  // 9. Content Reporting
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
    triggerToast("🛡️ Content flagged and sent to Towson Student Affairs Moderation Queue for review.");
  };

  // 10. Event RSVP
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
      const updatedUser = { ...currentUser, eventsAttendedCount: (currentUser.eventsAttendedCount || 0) + 1 };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }

    triggerToast(`📅 RSVP saved: ${newStatus ? (newStatus === "GOING" ? "Going ✓" : "Interested") : "Removed"}`);
  };

  // 11. Send Chat Message
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

  // 12. Campus AI Assistant Engine
  const handleSendAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;

    const userText = aiChatQuery.trim();
    const newHistory = [...aiChatHistory, { role: "user" as const, text: userText }];
    setAiChatHistory(newHistory);
    setAiChatQuery("");

    let aiResponse = "I've searched the Towson University digital campus ecosystem for you:";
    const lower = userText.toLowerCase();

    if (lower.includes("map") || lower.includes("navigate") || lower.includes("science complex") || lower.includes("library")) {
      aiResponse = `📍 Towson Live Map Highlights:
• **Science Complex**: 420 ft away (SC 304 Cyber Lab on Floor 3).
• **Albert S. Cook Library**: 180 ft away (Starbucks on Floor 1, 24/7 Pods on Floor 2).
• **Tiger Ride Gold Shuttle**: Arrives in 2 minutes at University Union Transit Plaza.`;
    } else if (lower.includes("shuttle") || lower.includes("bus") || lower.includes("gold route")) {
      aiResponse = `🚌 Tiger Ride Live Radar:
• **Gold Route (Campus Loop)**: Tiger Bus #14 is 2 mins away at University Union.
• **Black Route (Towson Town Center)**: Tiger Bus #08 is 5 mins away at Cook Library North Stop.`;
    } else if (lower.includes("parking") || lower.includes("garage")) {
      aiResponse = `🅿️ Towson Parking Garage Status:
• **Union Garage**: 🟢 184 spaces open (Levels 1-6, 8 EV chargers).
• **Towsontown Garage**: 🟡 42 spaces open.
• **West Village Garage**: 🔴 Full.`;
    } else if (lower.includes("police") || lower.includes("safety") || lower.includes("blue light")) {
      aiResponse = `🚨 Towson Safety & TUPD:
• **TUPD Emergency Dispatch**: (410) 704-4444.
• **Nearest Blue Light Phone**: #104 at Freedom Square (90 ft away).
• **SafeWalk Escort**: 1-tap dispatch available in Safety Mode.`;
    } else {
      aiResponse = `I found matching locations, events, and study pods matching "${userText}". Explore the live map under the Map tab!`;
    }

    setTimeout(() => {
      setAiChatHistory([...newHistory, { role: "ai", text: aiResponse }]);
    }, 600);
  };

  // Global Omni-Search Filtered Results
  const omniResults = {
    buildings: towsonBuildings.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase())),
    people: peerMatches.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.major.toLowerCase().includes(searchQuery.toLowerCase())),
    events: events.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())),
    reels: reels.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
    opportunities: opportunities.filter((o) => o.title.toLowerCase().includes(searchQuery.toLowerCase())),
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Hydrating Towson University Campus Ecosystem...</span>
        </div>
      </div>
    );
  }

  const activeReel = reels[currentReelIndex] || reels[0];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Toast Notification */}
      {showNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500/60 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="font-semibold text-sm">{showNotificationToast}</span>
        </div>
      )}

      {/* 1. MODAL: TURN-BY-TURN CAMPUS NAVIGATION ROUTE */}
      {showNavigationRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowNavigationRouteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Turn-by-Turn Campus Navigation</h3>
                <p className="text-xs text-slate-500">Freedom Square ➔ Science Complex Rm 304 (Cyber Lab)</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between font-bold">
              <span>Estimated Walk: 4 mins (420 ft)</span>
              <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full">🚧 Detour Active</span>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-3 pt-2 text-xs">
              {activeNavigationRoute.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    step.isDetourAvoidance
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                      : step.icon === "arrive"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                      : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    step.isDetourAvoidance ? "bg-amber-500 text-black" : step.icon === "arrive" ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                  }`}>
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>{step.instruction}</span>
                      {step.distanceFt > 0 && <span className="text-[10px] text-slate-400 font-mono">{step.distanceFt} ft</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Outdoor GPS + Bluetooth Beacon Indoor Assistance</span>
              <button
                onClick={() => {
                  triggerToast("🧭 Voice Guidance Active: Head Northeast along paved path");
                  setShowNavigationRouteModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2.5 rounded-xl text-xs shadow-md"
              >
                Start Voice Guidance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: BUILDING INTELLIGENCE & INDOOR FLOOR BLUEPRINTS */}
      {selectedBuildingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBuildingModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <img src={selectedBuildingModal.image} alt={selectedBuildingModal.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedBuildingModal.icon}</span>
                  <h3 className="text-lg font-black">{selectedBuildingModal.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 px-2 py-0.5 rounded">
                    {selectedBuildingModal.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedBuildingModal.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                  <span>📍 {selectedBuildingModal.distanceFt} ft away</span>
                  <span>⏰ {selectedBuildingModal.openHours}</span>
                  <span className="text-emerald-600 font-bold">🟢 Open Now ({selectedBuildingModal.occupancyPercent}% Occupancy)</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                <span className="text-lg font-black text-amber-500 block">{selectedBuildingModal.studySpacesCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Study Pods</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                <span className="text-lg font-black text-indigo-500 block">{selectedBuildingModal.classroomsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Classrooms</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                <span className="text-lg font-black text-emerald-500 block">{selectedBuildingModal.todayEventsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Today's Events</span>
              </div>
            </div>

            {/* Multi-Floor Indoor Blueprints */}
            {selectedBuildingModal.floors.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Indoor Floor Blueprints & Rooms</h4>
                  
                  {/* Floor Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
                    {selectedBuildingModal.floors.map((fl) => (
                      <button
                        key={fl.floorNumber}
                        onClick={() => setSelectedBuildingFloor(fl.floorNumber)}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          selectedBuildingFloor === fl.floorNumber ? "bg-amber-500 text-black shadow-xs" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Floor {fl.floorNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Floor Rooms */}
                {selectedBuildingModal.floors
                  .filter((fl) => fl.floorNumber === selectedBuildingFloor)
                  .map((fl) => (
                    <div key={fl.floorNumber} className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{fl.floorName}</span>
                        <span className="text-[10px] text-slate-400">🛗 {fl.elevators.join(", ")} • 🚻 {fl.restrooms.length} Restrooms</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {fl.rooms.map((rm) => (
                          <div key={rm.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                <span>{rm.roomNumber}</span>
                                <span className="text-[10px] font-normal text-slate-400">({rm.name})</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Capacity: {rm.capacity} • {rm.hasAV ? "Dual 4K AV Displays ✓" : "Standard"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rm.status === "Available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {rm.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400">Accessible Entrance: {selectedBuildingModal.accessibleEntrance}</span>
              <button
                onClick={() => {
                  setSelectedBuildingModal(null);
                  setShowNavigationRouteModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Building</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: LIFE360-STYLE CIRCLE LOCATION SHARING MANAGER */}
      {showLocationSharePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowLocationSharePicker(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Location Sharing Controls</h3>
                <p className="text-xs text-slate-500">Privacy-First Life360 Circles with temporary timers.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border text-xs space-y-3">
              <div className="font-bold text-slate-900 dark:text-zinc-100">Select Sharing Duration:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEnableLocationSharing("15 Minutes")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 font-bold text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                >
                  ⏱️ 15 Minutes
                </button>
                <button
                  onClick={() => handleEnableLocationSharing("1 Hour")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 font-bold text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                >
                  ⏱️ 1 Hour
                </button>
                <button
                  onClick={() => handleEnableLocationSharing("Until Event Ends")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 font-bold text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                >
                  🎉 Until Event Ends
                </button>
                <button
                  onClick={() => handleEnableLocationSharing("Until I Turn Off")}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 font-bold text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                >
                  🟢 Until Turned Off
                </button>
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-zinc-300">Ghost Mode (Obfuscate Sensitive Areas)</span>
                <input
                  type="checkbox"
                  checked={currentUser.ghostModeEnabled}
                  onChange={(e) => {
                    const updated = { ...currentUser, ghostModeEnabled: e.target.checked };
                    setCurrentUser(updated);
                    saveCurrentUser(updated);
                    triggerToast(e.target.checked ? "👻 Ghost Mode On: Shows 'Near North Campus'" : "Ghost Mode Off");
                  }}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </div>
            </div>

            {currentUser.isLocationSharing && (
              <button
                onClick={handleStopLocationSharing}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>🛑 STOP SHARING LOCATION</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL: SAFETY MODE & TUPD ASSISTANCE */}
      {selectedSafetyBeacon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedSafetyBeacon(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">{selectedSafetyBeacon.name}</h3>
                <span className="text-xs text-rose-600 font-bold">{selectedSafetyBeacon.status} • {selectedSafetyBeacon.distanceFt} ft away</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">{selectedSafetyBeacon.locationDescription}</p>

            <div className="space-y-2 pt-2">
              <a
                href={`tel:${selectedSafetyBeacon.emergencyPhone.replace(/\D/g, "")}`}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call TUPD Dispatch {selectedSafetyBeacon.emergencyPhone}</span>
              </a>

              <button
                onClick={() => {
                  triggerToast("🛡️ SafeWalk Escort Dispatched! An officer is en route to your location.");
                  setSelectedSafetyBeacon(null);
                }}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-2"
              >
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>Request SafeWalk Escort to My Location</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Towson Campus Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("home")}>
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-lg shadow-md shadow-amber-500/30">
                TU
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-zinc-100">
                  TowsonSync
                </span>
                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-none">Towson University Digital Campus</span>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700">
              {(["Towson Main Campus", "TU Downtown", "TU Health Complex"] as const).map((camp) => (
                <button
                  key={camp}
                  onClick={() => {
                    setSelectedCampus(camp);
                    triggerToast(`📍 Switched view to ${camp}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedCampus === camp
                      ? "bg-amber-500 text-black shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {camp.split(" ")[1] || camp.split(" ")[0]}
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
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("map");
                setMoreSubView("map");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "map"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab("campus")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "campus"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Campus Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("organizations")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "organizations"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clubs & Orgs</span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "events"
                  ? "bg-amber-500 text-black shadow-xs font-black"
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
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Volunteer</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "messages"
                  ? "bg-amber-500 text-black shadow-xs font-black"
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
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>⋯ More</span>
            </button>
          </nav>

          {/* Right Tools */}
          <div className="flex items-center gap-2.5">
            
            {/* Location Sharing Pill */}
            <button
              onClick={() => setShowLocationSharePicker(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
                currentUser.isLocationSharing
                  ? "bg-emerald-500 text-black border-emerald-400 animate-pulse shadow-md"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 border-slate-200 hover:border-amber-500"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentUser.isLocationSharing ? "bg-black" : "bg-rose-500"}`} />
              <span className="hidden sm:inline">{currentUser.isLocationSharing ? `Sharing (${currentUser.locationShareExpiresAt})` : "Share Location"}</span>
            </button>

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
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
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
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold leading-tight">{currentUser.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block -mt-0.5">
                    {currentUser.role === "CLUB_LEAD" ? "👑 ASA Lead" : currentUser.role === "FACULTY" ? "🏛️ TU Faculty" : "🐯 Verified Tiger"}
                  </span>
                </div>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* 🔴 AMBIENT LIVE ON TOWSON CAMPUS PULSE STRIP */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-black uppercase tracking-wider text-[11px] text-amber-400">Live At Towson</span>
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
        {/* 🗺️ DEDICATED MODULE: 📍 CAMPUS LIVE MAP (TOWSON UNIVERSITY) */}
        {/* ========================================================================= */}
        {(activeTab === "map" || (activeTab === "more" && moreSubView === "map")) && (
          <div className="space-y-6">
            
            {/* Map Header & Controls */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-amber-500/30">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                  Towson University • Geographic Platform & Life360 Circles
                </span>
                <h1 className="text-2xl font-black mt-0.5">Towson Campus Live Map & Indoor Radar</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Explore academic buildings, floor plans, live Tiger Ride shuttles, parking garages, TUPD Blue Lights, and temporary location sharing circles.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsSafetyModeActive(!isSafetyModeActive)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    isSafetyModeActive
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-rose-500"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>{isSafetyModeActive ? "🚨 Safety Mode ON" : "Safety Mode"}</span>
                </button>

                <button
                  onClick={() => setShowLocationSharePicker(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.isLocationSharing ? "Manage Circles" : "Share My Location"}</span>
                </button>
              </div>
            </div>

            {/* Filter Layer Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              {[
                { id: "ALL", label: "🌐 All Campus" },
                { id: "BUILDINGS", label: "🏛️ Academic Buildings" },
                { id: "CIRCLES", label: "👥 Life360 Circles" },
                { id: "SHUTTLES", label: "🚌 Tiger Ride GPS" },
                { id: "PARKING", label: "🅿️ Parking Garages" },
                { id: "SAFETY", label: "🚨 TUPD Blue Lights" },
                { id: "SCAVENGER", label: "🐾 Tiger Scavenger Hunt" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMapLayerFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                    mapLayerFilter === pill.id
                      ? "bg-amber-500 text-black shadow-xs font-black"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* INTERACTIVE VECTOR MAP CANVAS */}
            <div className="relative h-[540px] bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Map Grid & Topographic Terrain Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
              
              {/* Campus Roads & Paved Path SVG Overlays */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                {/* Osler Drive */}
                <line x1="15%" y1="10%" x2="35%" y2="90%" stroke="#475569" strokeWidth="8" strokeDasharray="6 4" />
                {/* Towsontown Blvd */}
                <line x1="10%" y1="20%" x2="85%" y2="20%" stroke="#475569" strokeWidth="10" />
                {/* York Road */}
                <line x1="85%" y1="10%" x2="85%" y2="90%" stroke="#475569" strokeWidth="12" />
                {/* University Mall Main Walkway */}
                <line x1="38%" y1="58%" x2="62%" y2="36%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 2" />
              </svg>

              {/* Top Map HUD: Live Status */}
              <div className="relative z-20 p-4 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-xs text-white pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold">GPS: Towson University Quad</span>
                  <span className="text-amber-400 font-mono">({towsonBuildings.length} Buildings Active)</span>
                </div>

                {/* Construction Alert Pill */}
                <div className="bg-amber-500/90 backdrop-blur-md text-black px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg pointer-events-auto">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>🚧 North Quad Repaving (Detour Avoidance Active)</span>
                </div>
              </div>

              {/* MAP PINS & ENTITIES */}

              {/* 1. Academic & Student Life Buildings */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "BUILDINGS") &&
                towsonBuildings.map((bld) => (
                  <button
                    key={bld.id}
                    onClick={() => {
                      setSelectedBuildingModal(bld);
                      setSelectedBuildingFloor(bld.floors[0]?.floorNumber || 1);
                    }}
                    style={{ top: `${bld.y}%`, left: `${bld.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                  >
                    <div className="relative">
                      <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-pulse" />
                      <div className="relative px-3 py-1 rounded-2xl bg-slate-900 border-2 border-amber-500 text-white font-bold text-xs shadow-xl flex items-center gap-1.5 hover:scale-110 hover:bg-amber-500 hover:text-black transition">
                        <span>{bld.icon}</span>
                        <span>{bld.shortCode}</span>
                      </div>
                    </div>
                  </button>
                ))}

              {/* 2. Life360 Circles Friend Pins */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "CIRCLES") &&
                towsonCircles[0]?.members.map((mem) => (
                  <button
                    key={mem.id}
                    onClick={() => triggerToast(`📍 ${mem.name} is at ${mem.currentBuilding} (${mem.distanceFt} ft away)`)}
                    style={{ top: `${mem.y}%`, left: `${mem.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30"
                  >
                    <div className="relative flex flex-col items-center">
                      <img src={mem.avatar} alt={mem.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400 shadow-xl" />
                      <span className="text-[9px] font-bold bg-black/80 text-emerald-300 px-1.5 rounded mt-0.5">
                        {mem.name.split(" ")[0]}
                      </span>
                    </div>
                  </button>
                ))}

              {/* 3. Live GPS Tiger Ride Shuttles */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "SHUTTLES") &&
                towsonShuttles.map((sht) => (
                  <button
                    key={sht.id}
                    onClick={() => triggerToast(`🚌 ${sht.busNumber} (${sht.routeName}): ETA ${sht.etaMinutes} mins at ${sht.nextStop}`)}
                    style={{ top: `${sht.currentCoordinates.y}%`, left: `${sht.currentCoordinates.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30 animate-bounce"
                  >
                    <div className="px-2.5 py-1 rounded-xl bg-amber-500 text-black font-black text-[10px] shadow-2xl border border-black flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{sht.etaMinutes}m ETA</span>
                    </div>
                  </button>
                ))}

              {/* 4. Parking Garages */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "PARKING") &&
                towsonParking.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => triggerToast(`🅿️ ${pkg.name}: ${pkg.openSpaces} spaces available`)}
                    style={{ top: `${pkg.y}%`, left: `${pkg.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                  >
                    <div className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] shadow-lg border border-white flex items-center gap-1">
                      <span>🅿️</span>
                      <span>{pkg.openSpaces > 0 ? `${pkg.openSpaces} Open` : "Full"}</span>
                    </div>
                  </button>
                ))}

              {/* 5. Safety Mode Blue Light Phones */}
              {(isSafetyModeActive || mapLayerFilter === "SAFETY") &&
                towsonSafetyBeacons.map((bcn) => (
                  <button
                    key={bcn.id}
                    onClick={() => setSelectedSafetyBeacon(bcn)}
                    style={{ top: `${bcn.y}%`, left: `${bcn.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30"
                  >
                    <div className="relative">
                      <span className="absolute -inset-2 rounded-full bg-rose-500/50 animate-ping" />
                      <div className="relative px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-2xl border-2 border-white flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Blue Light</span>
                      </div>
                    </div>
                  </button>
                ))}

              {/* 6. Scavenger Hunt Checkpoints */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "SCAVENGER") &&
                towsonScavenger.map((chk) => (
                  <button
                    key={chk.id}
                    onClick={() => handleScavengerCheckIn(chk.id)}
                    style={{ top: `${chk.y}%`, left: `${chk.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-25"
                  >
                    <div className={`px-2.5 py-1 rounded-full font-black text-[10px] shadow-2xl border-2 flex items-center gap-1 ${
                      chk.isVisited ? "bg-emerald-600 text-white border-emerald-400" : "bg-amber-500 text-black border-white animate-pulse"
                    }`}>
                      <span>{chk.isVisited ? "✓" : "🐾"}</span>
                      <span>{chk.isVisited ? "Visited" : `+${chk.points} pts`}</span>
                    </div>
                  </button>
                ))}

              {/* Bottom Radar Bar */}
              <div className="relative z-20 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">📍 Freedom Square (Cook Library)</span>
                  <span className="text-slate-500">|</span>
                  <span>Nearest Shuttle: <strong className="text-amber-400">Tiger Bus #14 (2 mins away)</strong></span>
                </div>

                <button
                  onClick={() => setShowNavigationRouteModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-black px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Turn-by-Turn Directions</span>
                </button>
              </div>

            </div>

            {/* 3 Grid Summary Cards Below Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Life360 Circles Panel */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">My Circles (Life360)</h3>
                  </div>
                  <button
                    onClick={() => setShowLocationSharePicker(true)}
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    Manage
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {towsonCircles.map((circle) => (
                    <div key={circle.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{circle.icon}</span>
                          <span>{circle.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          {circle.activeSharingCount} Sharing
                        </span>
                      </div>
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {circle.members.map((m) => (
                          <img key={m.id} src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Tiger Ride Shuttle Radar */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">Tiger Ride Live GPS</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">3 Buses Moving</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {towsonShuttles.map((sht) => (
                    <div key={sht.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>{sht.routeName}</span>
                        <span className="text-amber-600 font-mono">{sht.etaMinutes} min ETA</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Next: {sht.nextStop}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Tiger Scavenger Hunt & Treasure Radar */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">Tiger Pride Scavenger Hunt</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    {towsonScavenger.filter((c) => c.isVisited).length} / {towsonScavenger.length} Visited
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {towsonScavenger.map((chk) => (
                    <div
                      key={chk.id}
                      onClick={() => handleScavengerCheckIn(chk.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        chk.isVisited
                          ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200"
                          : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 hover:border-amber-500"
                      }`}
                    >
                      <div>
                        <div className="font-bold">{chk.title}</div>
                        <span className="text-[10px] text-slate-400">{chk.landmark}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        chk.isVisited ? "bg-emerald-600 text-white" : "bg-amber-500 text-black"
                      }`}>
                        {chk.isVisited ? "Checked In ✓" : "Check In"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: 🏠 HOME */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Center Stream */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Personalized Greeting & Today's Schedule Card */}
              <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-amber-500/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-full bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                        {selectedCampus} • Today's Dashboard
                      </span>
                      <h1 className="text-2xl font-black mt-0.5">Good afternoon, {currentUser.name.split(" ")[0]}!</h1>
                      <p className="text-xs text-slate-300">
                        🐯 {currentUser.major} • Class of {currentUser.gradYear}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab("map");
                          setMoreSubView("map");
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-black px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
                      >
                        <MapIcon className="w-3.5 h-3.5 text-black" />
                        <span>Open Live Map</span>
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
                        <span className="text-amber-400 font-bold font-mono">10:00 AM</span>
                        <div className="font-bold text-white truncate">COSC 421 OS Class</div>
                        <span className="text-[10px] text-slate-400">Science Complex 204</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                        <span className="text-amber-400 font-bold font-mono">2:00 PM</span>
                        <div className="font-bold text-white truncate">Cybersecurity Club</div>
                        <span className="text-[10px] text-slate-400">7800 York Rd Rm 214</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                        <span className="text-emerald-400 font-bold font-mono">5:00 PM</span>
                        <div className="font-bold text-white truncate">AI Security Keynote</div>
                        <span className="text-[10px] text-slate-400">Science Complex Atrium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* POST COMPOSER */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{currentUser.name}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreatePost}>
                  <textarea
                    placeholder="Share an announcement, event, or student project at Towson..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={3}
                    className="w-full text-sm bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition"
                  />

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{newPostLocation}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPostContent.trim()}
                      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
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
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/20" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{post.authorName}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            <span>{post.authorMajor}</span> • <span>{post.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {post.location}
                      </span>
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
                    </div>
                  </article>
                ))}
              </div>

            </div>

            {/* Right Rail */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Map Radar Teaser */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Towson Live Map Radar</h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("map");
                      setMoreSubView("map");
                    }}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Open
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  📍 <strong>Cook Library</strong> (180 ft) · 🚌 <strong>Tiger Bus #14</strong> arriving in 2m.
                </p>

                <button
                  onClick={() => {
                    setActiveTab("map");
                    setMoreSubView("map");
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>Launch Live Campus Map</span>
                </button>
              </div>

              {/* Verified Student Engagement Record Mini-Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiger Record</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-100 dark:border-amber-900">
                    <span className="block text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                      {currentUser.volunteerHoursLogged}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">Volunteer Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl border">
                    <span className="block text-2xl font-black text-slate-900 dark:text-zinc-100 leading-none">
                      {currentUser.eventsAttendedCount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">Events Attended</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Service Certificate</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 🏫 CAMPUS HUB (TOWSON UNIVERSITY) */}
        {/* ========================================================================= */}
        {activeTab === "campus" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-amber-500/30">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Towson University Operations & Facilities</span>
                <h1 className="text-2xl font-black mt-0.5">{selectedCampus} Directory</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Cook Library research desks, Science Complex labs, dining menus, and TUPD 311 service tickets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-lg">
                  🍔
                </div>
                <h3 className="text-sm font-bold">Union & West Village Dining</h3>
                <p className="text-xs text-slate-500">Chick-fil-A, Dunkin', Bento Sushi, and West Village Dining Hall.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-lg">
                  📚
                </div>
                <h3 className="text-sm font-bold">Cook Library 24/7 Pods</h3>
                <p className="text-xs text-slate-500">Floors 1-3 open 24/7 during midterms. Tech checkout available.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🚌
                </div>
                <h3 className="text-sm font-bold">Tiger Ride Shuttles</h3>
                <p className="text-xs text-slate-500">Next Gold Route arrives at University Union in 2 mins.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold text-lg">
                  🚨
                </div>
                <h3 className="text-sm font-bold">Towson Police (TUPD)</h3>
                <p className="text-xs text-slate-500">24/7 Emergency Dispatch: (410) 704-4444 & SafeWalk Escorts.</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 👥 ORGANIZATIONS */}
        {/* ========================================================================= */}
        {activeTab === "organizations" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Towson Student Organizations</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clubs.map((org) => (
                <div key={org.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{org.logo}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-zinc-100">{org.name}</h3>
                      <span className="text-xs text-amber-600 font-semibold">{org.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{org.description}</p>
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
            <h1 className="text-2xl font-black">Towson Campus Events</h1>
            <div className="grid grid-cols-1 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white dark:bg-zinc-900 rounded-3xl border p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">{ev.title}</h3>
                    <p className="text-xs text-slate-500">{ev.location} • {ev.time}</p>
                  </div>
                  <button onClick={() => handleToggleRsvp(ev.id, "GOING")} className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs">
                    {ev.userRsvp === "GOING" ? "Going ✓" : "RSVP"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 🤝 ACTIVITIES / VOLUNTEER */}
        {/* ========================================================================= */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Volunteer & Civic Engagement</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <div key={act.id} className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 space-y-3">
                  <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded">{act.category}</span>
                  <h3 className="text-lg font-bold">{act.title}</h3>
                  <p className="text-xs text-slate-500">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 💬 MESSAGES */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-4 h-[550px] flex flex-col justify-between">
            <div className="text-sm font-bold border-b pb-2">{activeChannel}</div>
            <div className="overflow-y-auto space-y-3 flex-1 py-3 text-xs">
              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.isMe ? "flex-row-reverse" : ""}`}>
                  <img src={m.avatar} alt={m.sender} className="w-7 h-7 rounded-full object-cover" />
                  <div className={`p-3 rounded-2xl ${m.isMe ? "bg-amber-500 text-black" : "bg-slate-100 dark:bg-zinc-800"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Message channel..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs"
              />
              <button type="submit" className="bg-amber-500 text-black p-2.5 rounded-xl font-bold">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: ⋯ MORE (REELS, GAMES, TRANSCRIPT, AI) */}
        {/* ========================================================================= */}
        {activeTab === "more" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              <button
                onClick={() => setMoreSubView("map")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "map" ? "bg-amber-500 text-black font-black" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Towson Live Map</span>
              </button>

              <button
                onClick={() => setMoreSubView("transcript")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "transcript" ? "bg-amber-500 text-black font-black" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Experience Transcript</span>
              </button>

              <button
                onClick={() => setMoreSubView("reels")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "reels" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Towson Reels</span>
              </button>

              <button
                onClick={() => setMoreSubView("games")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "games" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Tiger Trivia</span>
              </button>

              <button
                onClick={() => setMoreSubView("ai")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  moreSubView === "ai" ? "bg-amber-500 text-black font-black" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Campus AI</span>
              </button>
            </div>

            {/* SUB-VIEW: 🏆 EXPERIENCE TRANSCRIPT */}
            {moreSubView === "transcript" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4 border-b pb-6">
                  <div className="flex items-center gap-4">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-3xl object-cover ring-4 ring-amber-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">{currentUser.name}</h2>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified Towson Tiger ✓
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Major: <strong>{currentUser.major}</strong> • ID: <code className="font-mono">{currentUser.studentId}</code>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Official Service Certificate</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-100 dark:border-amber-900">
                    <span className="text-2xl font-black text-amber-600 block leading-none">{currentUser.volunteerHoursLogged ?? 48} hrs</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Volunteer Hours</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                    <span className="text-2xl font-black text-slate-900 dark:text-zinc-100 block leading-none">{currentUser.eventsAttendedCount ?? 12}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Events Attended</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                    <span className="text-2xl font-black text-emerald-600 block leading-none">{(currentUser.leadershipRoles || []).length}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Leadership Titles</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                    <span className="text-2xl font-black text-purple-600 block leading-none">{(currentUser.achievements || []).length}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Honor Badges</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: 🎬 REELS */}
            {moreSubView === "reels" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm h-[560px] bg-black rounded-3xl overflow-hidden relative shadow-2xl flex flex-col justify-between border-4 border-slate-900">
                    <img src={activeReel.thumbnailUrl} alt={activeReel.title} className="absolute inset-0 w-full h-full object-cover opacity-75" />
                    <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 to-transparent space-y-2 text-white mt-auto">
                      <div className="text-xs font-black">{activeReel.creatorName}</div>
                      <p className="text-xs leading-snug">{activeReel.title}</p>
                      <span className="text-[10px] text-slate-300">🎵 {activeReel.audioTrack}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: 🎮 GAMES */}
            {moreSubView === "games" && (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border space-y-4">
                <h3 className="text-base font-bold">{games[0]?.title}</h3>
                <p className="text-xs text-slate-500">{games[0]?.description}</p>
              </div>
            )}

            {/* SUB-VIEW: 🤖 AI */}
            {moreSubView === "ai" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border space-y-4">
                <div className="space-y-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl max-h-80 overflow-y-auto text-xs">
                  {aiChatHistory.map((m, i) => (
                    <div key={i} className={`p-3 rounded-2xl ${m.role === "user" ? "bg-amber-500 text-black ml-auto" : "bg-white dark:bg-zinc-900"}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendAiPrompt} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Towson Campus AI..."
                    value={aiChatQuery}
                    onChange={(e) => setAiChatQuery(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-zinc-800 border rounded-xl px-4 py-2 text-xs"
                  />
                  <button type="submit" className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs">
                    Ask
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
