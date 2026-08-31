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
  DollarSign,
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
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Thermometer,
  CloudLightning,
  Umbrella,
  Gauge,
  Sunrise,
  Sunset,
  Moon,
  CreditCard,
  Wallet,
  Activity,
  Shield,
  RefreshCw,
} from "lucide-react";

import {
  CampusWeatherReport,
  HourlyForecastPoint,
  DailyForecastDay,
  NWSWeatherAlert,
  CampusOperatingStatus,
  WeatherNotificationPreferences,
  initialTowsonMainWeather,
  defaultWeatherPreferences,
} from "@/lib/campus-weather-data";

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
  HousingListing,
  RoommateProfile,
  HousingTourBooking,
  HousingMaintenanceTicket,
  TigerWalletPass,
  LiveFacilityDensity,
  SafeWalkSession,
  AlumniMentor,
  CourseDeliverable,
  defaultCurrentUser,
  defaultNotificationPreferences,
  initialTowsonBuildings,
  initialTowsonCircles,
  initialTowsonShuttles,
  initialTowsonParking,
  initialTowsonSafetyBeacons,
  initialTowsonScavengerCheckpoints,
  initialHousingListings,
  initialRoommateProfiles,
  initialHousingTours,
  initialHousingMaintenanceTickets,
  initialTigerWalletPass,
  initialFacilityDensities,
  initialSafeWalkSession,
  initialAlumniMentors,
  sampleTowsonRoute,
  UserRole,
  initialCampusPersonas,
  AdminVerificationRequest,
  initialAdminVerifications,
  AdminSecurityAuditLog,
  initialAdminAuditLogs,
  AdminSystemHealth,
  initialAdminSystemHealth,
} from "@/lib/campus-data";

import AxiomConnectWorkspace from "@/components/connect-suite/AxiomConnectWorkspace";

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
  loadHousingListings,
  saveHousingListings,
  loadRoommateProfiles,
  saveRoommateProfiles,
  loadHousingTours,
  saveHousingTours,
  loadHousingMaintenanceTickets,
  saveHousingMaintenanceTickets,
  loadCampusWeather,
  saveCampusWeather,
  loadWeatherPreferences,
  saveWeatherPreferences,
  loadCurrentUser,
  saveCurrentUser,
  resetCampusDemoData,
} from "@/lib/campus-storage";

export default function CampusSyncApp() {
  const router = useRouter();

  // Primary Navigation
  const [activeTab, setActiveTab] = useState<
    "home" | "map" | "housing" | "campus" | "organizations" | "events" | "activities" | "messages" | "more"
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

  // TUHousing & Off-Campus Platform State
  const [housingListings, setHousingListings] = useState<HousingListing[]>(initialHousingListings);
  const [roommateProfiles, setRoommateProfiles] = useState<RoommateProfile[]>(initialRoommateProfiles);
  const [housingTours, setHousingTours] = useState<HousingTourBooking[]>(initialHousingTours);
  const [housingTickets, setHousingTickets] = useState<HousingMaintenanceTicket[]>(initialHousingMaintenanceTickets);
  const [housingSubTab, setHousingSubTab] = useState<"find" | "roommates" | "tours" | "maintenance" | "calculator">("find");
  const [housingFilterType, setHousingFilterType] = useState<string>("ALL");
  const [housingMaxRent, setHousingMaxRent] = useState<number>(1500);
  const [selectedHousingListing, setSelectedHousingListing] = useState<HousingListing | null>(null);
  const [showTourBookingModal, setShowTourBookingModal] = useState<boolean>(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [tourFormProperty, setTourFormProperty] = useState<HousingListing | null>(null);
  const [tourDateSelected, setTourDateSelected] = useState<string>("Saturday, Mar 08, 2026");
  const [tourTimeSelected, setTourTimeSelected] = useState<string>("11:00 AM");
  const [tourTypeSelected, setTourTypeSelected] = useState<"In-Person Guided Tour" | "Live Video Walkthrough">("In-Person Guided Tour");
  const [newMaintCategory, setNewMaintCategory] = useState<HousingMaintenanceTicket["category"]>("Heating / AC");
  const [newMaintUrgency, setNewMaintUrgency] = useState<HousingMaintenanceTicket["urgency"]>("Standard");
  const [newMaintDesc, setNewMaintDesc] = useState<string>("");
  const [newMaintAddress, setNewMaintAddress] = useState<string>("201 E Joppa Rd (Univ. Village)");
  const [newMaintUnit, setNewMaintUnit] = useState<string>("Apt 304-B");

  // Cost of Living Calculator State
  const [calcRent, setCalcRent] = useState<number>(925);
  const [calcUtilities, setCalcUtilities] = useState<number>(85);
  const [calcInternet, setCalcInternet] = useState<number>(35);
  const [calcParking, setCalcParking] = useState<number>(50);

  // NOAA / NWS Authoritative Campus Weather & Environmental Safety State
  const [weatherReport, setWeatherReport] = useState<CampusWeatherReport>(initialTowsonMainWeather);
  const [weatherPrefs, setWeatherPrefs] = useState<WeatherNotificationPreferences>(defaultWeatherPreferences);
  const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false);
  const [weatherModalTab, setWeatherModalTab] = useState<"now" | "hourly" | "daily" | "radar" | "alerts" | "settings">("now");

  // Map Filters & View Modes
  const [mapLayerFilter, setMapLayerFilter] = useState<"ALL" | "BUILDINGS" | "CIRCLES" | "SHUTTLES" | "PARKING" | "SAFETY" | "SCAVENGER" | "HOUSING" | "WEATHER" | "FESTIVAL">("ALL");
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedTheme = typeof window !== "undefined" ? localStorage.getItem("towson_theme") : null;
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (_) {}
  }, []);

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("towson_theme", "dark");
        setShowNotificationToast("🌙 Dark Mode Enabled");
        setTimeout(() => setShowNotificationToast(null), 2500);
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("towson_theme", "light");
        setShowNotificationToast("☀️ Light Mode Enabled");
        setTimeout(() => setShowNotificationToast(null), 2500);
      }
    } catch (_) {}
  };

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

  // 5 Enterprise Campus Systems State
  const [selectedCourseForCanvas, setSelectedCourseForCanvas] = useState<CampusCourse | null>(null);
  const [showTigerWalletModal, setShowTigerWalletModal] = useState<boolean>(false);
  const [tigerWallet, setTigerWallet] = useState<TigerWalletPass>(initialTigerWalletPass);
  const [facilityDensities, setFacilityDensities] = useState<LiveFacilityDensity[]>(initialFacilityDensities);
  const [showSafeWalkModal, setShowSafeWalkModal] = useState<boolean>(false);
  const [safeWalkSession, setSafeWalkSession] = useState<SafeWalkSession>(initialSafeWalkSession);
  const [alumniMentors, setAlumniMentors] = useState<AlumniMentor[]>(initialAlumniMentors);
  const [careerSubFilter, setCareerSubFilter] = useState<"jobs" | "mentors" | "projects">("jobs");

  // Core Identity & RBAC Personas
  const [personas] = useState<UserProfile[]>(initialCampusPersonas);
  const [activePersonaIndex, setActivePersonaIndex] = useState<number>(0);
  const [showAskAiModal, setShowAskAiModal] = useState<boolean>(false);
  const [showTigerRecordExportModal, setShowTigerRecordExportModal] = useState<boolean>(false);
  const [launchpadFilter, setLaunchpadFilter] = useState<"ALL" | "ACADEMICS" | "SAFETY" | "MEDIA" | "OPERATIONS">("ALL");

  // TowsonSync Administration Center State
  const [adminVerifications, setAdminVerifications] = useState<AdminVerificationRequest[]>(initialAdminVerifications);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminSecurityAuditLog[]>(initialAdminAuditLogs);
  const [adminSystemHealth, setAdminSystemHealth] = useState<AdminSystemHealth>(initialAdminSystemHealth);
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<"verifications" | "housing" | "marketplace" | "events" | "security" | "health">("verifications");

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
    setHousingListings(loadHousingListings());
    setRoommateProfiles(loadRoommateProfiles());
    setHousingTours(loadHousingTours());
    setHousingTickets(loadHousingMaintenanceTickets());
    setWeatherReport(loadCampusWeather());
    setWeatherPrefs(loadWeatherPreferences());
    setCurrentUser(loadCurrentUser());
    setIsHydrated(true);

    // Fetch latest live weather from our backend endpoint
    fetch("/api/campus/weather?campus=main")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.weather) {
          setWeatherReport(data.weather);
          saveCampusWeather(data.weather);
        }
      })
      .catch(() => {});

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
      setHousingListings(loadHousingListings());
      setRoommateProfiles(loadRoommateProfiles());
      setHousingTours(loadHousingTours());
      setHousingTickets(loadHousingMaintenanceTickets());
      setWeatherReport(loadCampusWeather());
      setWeatherPrefs(loadWeatherPreferences());
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

  // 3.1 TUHousing Handlers
  const handleToggleSaveHousing = (id: string) => {
    const updated = housingListings.map((h) => {
      if (h.id === id) {
        const isSaved = !h.isSaved;
        triggerToast(isSaved ? `❤️ Saved "${h.title}" to your Housing Shortlist!` : `Removed from Saved Homes`);
        return { ...h, isSaved };
      }
      return h;
    });
    setHousingListings(updated);
    saveHousingListings(updated);
  };

  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourFormProperty) return;

    const newTour: HousingTourBooking = {
      id: `tour-${Date.now()}`,
      propertyId: tourFormProperty.id,
      propertyTitle: tourFormProperty.title,
      propertyAddress: tourFormProperty.address,
      tourDate: tourDateSelected,
      tourTimeSlot: tourTimeSelected,
      tourType: tourTypeSelected,
      status: "Confirmed",
      landlordName: tourFormProperty.landlordName,
      contactNumber: tourFormProperty.landlordContact,
    };

    const updatedTours = [newTour, ...housingTours];
    setHousingTours(updatedTours);
    saveHousingTours(updatedTours);
    setShowTourBookingModal(false);
    triggerToast(`📅 Tour Confirmed for ${tourFormProperty.title} on ${tourDateSelected} at ${tourTimeSelected}!`);
  };

  const handleCreateMaintenanceTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintDesc.trim()) return;

    const newTicket: HousingMaintenanceTicket = {
      id: `maint-${Date.now()}`,
      ticketNumber: `#TUH-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyAddress: newMaintAddress,
      unitNumber: newMaintUnit,
      category: newMaintCategory,
      urgency: newMaintUrgency,
      description: newMaintDesc.trim(),
      status: "Submitted",
      submittedDate: "Just now",
      assignedTech: "Towson Facilities Dispatch",
    };

    const updatedTickets = [newTicket, ...housingTickets];
    setHousingTickets(updatedTickets);
    saveHousingMaintenanceTickets(updatedTickets);
    setShowMaintenanceModal(false);
    setNewMaintDesc("");
    triggerToast(`🔧 Maintenance ticket ${newTicket.ticketNumber} dispatched to facilities!`);
  };

  const handleConnectRoommate = (id: string) => {
    const updated = roommateProfiles.map((rm) => {
      if (rm.id === id) {
        const nextState = !rm.isConnected;
        triggerToast(nextState ? `🤝 Connected with ${rm.name}! Message sent to coordinate housing.` : `Disconnected`);
        return { ...rm, isConnected: nextState };
      }
      return rm;
    });
    setRoommateProfiles(updated);
    saveRoommateProfiles(updated);
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
    buildings: (towsonBuildings || []).filter((b) => ((b?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || (b?.code || "").toLowerCase().includes((searchQuery || "").toLowerCase()))),
    people: (peerMatches || []).filter((p) => ((p?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || (p?.major || "").toLowerCase().includes((searchQuery || "").toLowerCase()))),
    events: (events || []).filter((e) => (e?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())),
    reels: (reels || []).filter((r) => (r?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())),
    opportunities: (opportunities || []).filter((o) => (o?.title || "").toLowerCase().includes((searchQuery || "").toLowerCase())),
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

  const activeReel = (reels && reels.length > 0) ? (reels[currentReelIndex] || reels[0]) : initialCampusReels[0];

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
              <button
                type="button"
                onClick={() => setSelectedBuildingModal(null)}
                className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
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

      {/* 3. MODAL: TIGERORBIT 360 LOCATION SHARING MANAGER */}
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
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">TigerOrbit 360 Controls</h3>
                <p className="text-xs text-slate-500">Privacy-First Campus Orbits & Circles with temporary timers.</p>
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

      {/* 4.1 MODAL: TUHOUSING TOUR BOOKING */}
      {showTourBookingModal && tourFormProperty && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTourBookingModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowTourBookingModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">Schedule Property Tour</h3>
                <p className="text-xs text-slate-500">{tourFormProperty.title}</p>
              </div>
            </div>

            <form onSubmit={handleBookTour} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Tour Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["In-Person Guided Tour", "Live Video Walkthrough"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTourTypeSelected(t)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        tourTypeSelected === t
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-slate-200 dark:border-zinc-700 hover:border-indigo-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Select Date:</label>
                <select
                  value={tourDateSelected}
                  onChange={(e) => setTourDateSelected(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold"
                >
                  <option value="Saturday, Mar 08, 2026">Saturday, Mar 08, 2026</option>
                  <option value="Monday, Mar 10, 2026">Monday, Mar 10, 2026</option>
                  <option value="Wednesday, Mar 12, 2026">Wednesday, Mar 12, 2026</option>
                  <option value="Saturday, Mar 15, 2026">Saturday, Mar 15, 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Time Slot:</label>
                <div className="grid grid-cols-3 gap-2">
                  {["10:00 AM", "11:30 AM", "2:00 PM"].map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTourTimeSelected(slot)}
                      className={`p-2 rounded-xl border font-bold text-center transition ${
                        tourTimeSelected === slot
                          ? "bg-amber-500 text-black border-amber-500 font-black"
                          : "border-slate-200 dark:border-zinc-700 hover:border-amber-500"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 text-slate-600 dark:text-zinc-400 text-[11px]">
                🛡️ <strong>Verified Contact:</strong> Managed by {tourFormProperty.landlordName} ({tourFormProperty.landlordContact}).
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTourBookingModal(false)}
                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-xs shadow-md transition"
                >
                  Confirm Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.2 MODAL: TUHOUSING MAINTENANCE REQUEST */}
      {showMaintenanceModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMaintenanceModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowMaintenanceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">Submit Resident Repair Ticket</h3>
                <p className="text-xs text-slate-500">Towson Facilities & Off-Campus Dispatch</p>
              </div>
            </div>

            <form onSubmit={handleCreateMaintenanceTicket} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Property Address & Unit:</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMaintAddress}
                    onChange={(e) => setNewMaintAddress(e.target.value)}
                    className="col-span-2 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                    placeholder="Address"
                  />
                  <input
                    type="text"
                    value={newMaintUnit}
                    onChange={(e) => setNewMaintUnit(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                    placeholder="Unit #"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Category:</label>
                  <select
                    value={newMaintCategory}
                    onChange={(e) => setNewMaintCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold"
                  >
                    <option value="Heating / AC">Heating / AC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Lock & Key">Lock & Key</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Urgency Level:</label>
                  <select
                    value={newMaintUrgency}
                    onChange={(e) => setNewMaintUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Describe the Issue:</label>
                <textarea
                  value={newMaintDesc}
                  onChange={(e) => setNewMaintDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 resize-none"
                  placeholder="e.g. Water leak under bathroom sink or heater not blowing warm air."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={!newMaintDesc.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl text-xs shadow-md transition disabled:opacity-50"
                >
                  Dispatch Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.3 MODAL: SELECTED HOUSING PROPERTY DETAILS */}
      {selectedHousingListing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedHousingListing(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            {/* Prominent Floating Close Button */}
            <button
              type="button"
              onClick={() => setSelectedHousingListing(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/80 hover:bg-black text-white transition z-30 shadow-lg"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-800">
              <img
                src={selectedHousingListing.images[0]}
                alt={selectedHousingListing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>60s Video Walkthrough Active</span>
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {selectedHousingListing.propertyType}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{selectedHousingListing.neighborhood}</span>
                </div>
                <h2 className="text-xl font-black mt-1">{selectedHousingListing.title}</h2>
                <p className="text-xs text-slate-500">{selectedHousingListing.address}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-600">${selectedHousingListing.monthlyRent}</span>
                <span className="text-xs text-slate-400 block">/month + ~${selectedHousingListing.estimatedUtilities} util</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {selectedHousingListing.description}
            </p>

            {/* Commute & Shuttle Matrix */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-zinc-200">Commute to Towson Main Campus (Freedom Square):</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">DISTANCE</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedHousingListing.distanceFromCampusMiles} mi</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">WALK</span>
                  <span className="font-bold text-emerald-600">🚶 {selectedHousingListing.walkTimeMinutes} min</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">BIKE</span>
                  <span className="font-bold text-indigo-600">🚲 {selectedHousingListing.bikeTimeMinutes} min</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-bold">SHUTTLE</span>
                  <span className="font-bold text-amber-600">🚌 {selectedHousingListing.transitTimeMinutes} min</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Property Amenities:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedHousingListing.amenities.map((a) => (
                  <span key={a} className="text-xs bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl font-bold">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions with Clear Cancel / Close Button */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTourFormProperty(selectedHousingListing);
                    setShowTourBookingModal(true);
                    setSelectedHousingListing(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule a Tour</span>
                </button>

                <a
                  href={`tel:${selectedHousingListing.landlordContact.replace(/\D/g, "")}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 text-center"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Landlord</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHousingListing(null)}
                className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-zinc-700"
              >
                <X className="w-4 h-4" />
                <span>Close / Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.4 MODAL: CAMPUS WEATHER & NOAA RADAR CENTER */}
      {showWeatherModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWeatherModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            {/* Prominent Floating Close Button */}
            <button
              type="button"
              onClick={() => setShowWeatherModal(false)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition z-30 shadow-md"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pr-10">
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 text-2xl">
                {weatherReport.conditionIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    NOAA / NWS Authoritative Station {weatherReport.nwsStationId}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{weatherReport.lastUpdated}</span>
                </div>
                <h2 className="text-xl font-black mt-0.5">Towson Campus Weather & Atmospheric Center</h2>
                <p className="text-xs text-slate-500">
                  Forecast Office: <strong>{weatherReport.nwsOffice} (Baltimore/Washington)</strong> · Grid [{weatherReport.nwsGridX}, {weatherReport.nwsGridY}]
                </p>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl text-xs font-bold">
              {[
                { id: "now", label: "⚡ Current Conditions" },
                { id: "hourly", label: "⏱️ Next 24 Hours" },
                { id: "daily", label: "📅 7-Day Forecast" },
                { id: "radar", label: "📡 Live Doppler Radar" },
                { id: "alerts", label: `🚨 NWS Alerts (${weatherReport.activeAlerts.length})` },
                { id: "settings", label: "🔔 Alert Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWeatherModalTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                    weatherModalTab === tab.id
                      ? "bg-sky-600 text-white shadow-xs font-black"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CURRENT CONDITIONS */}
            {weatherModalTab === "now" && (
              <div className="space-y-4">
                {/* Hero Current Temperature & Feels Like Card */}
                <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-sky-500/30">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400">
                      {selectedCampus} (39.39° N, 76.60° W)
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black font-mono">{weatherReport.currentTemp}°F</span>
                      <span className="text-lg text-slate-300 font-bold">{weatherReport.conditionText}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Feels like <strong className="text-sky-300">{weatherReport.feelsLike}°F</strong> · High: <strong>{weatherReport.highToday}°F</strong> · Low: <strong>{weatherReport.lowToday}°F</strong>
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between gap-4 text-slate-300">
                      <span>Rain Chance:</span>
                      <strong className="text-sky-400">{weatherReport.popPercentToday}%</strong>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-300">
                      <span>Wind:</span>
                      <strong className="text-slate-100">{weatherReport.windDirection} {weatherReport.windSpeedMph} mph</strong>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-300">
                      <span>Humidity:</span>
                      <strong className="text-slate-100">{weatherReport.humidityPercent}%</strong>
                    </div>
                  </div>
                </div>

                {/* AI & NWS Campus Recommendation Box */}
                <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900 text-xs flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <strong className="text-sky-950 dark:text-sky-200 block font-bold">Campus Lifestyle Recommendation:</strong>
                    <span className="text-slate-600 dark:text-zinc-400">{weatherReport.clothingRecommendation}</span>
                  </div>
                </div>

                {/* 6 Key Atmospheric Observations Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">UV INDEX</span>
                    <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono">
                      {weatherReport.uvIndex} ({weatherReport.uvCategory})
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sun protection recommended at midday</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">AIR QUALITY (EPA AIRNOW)</span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      AQI {weatherReport.airQualityIndex} ({weatherReport.airQualityCategory})
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Clean air across campus quads</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">VISIBILITY</span>
                    <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono">
                      {weatherReport.visibilityMiles} Miles
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Clear line of sight</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">DEW POINT</span>
                    <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono">
                      {weatherReport.dewPointF}°F
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Comfortable humidity zone</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">BAROMETRIC PRESSURE</span>
                    <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono">
                      {weatherReport.barometricPressureInHg} inHg
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Steady high pressure</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">SUNRISE & SUNSET</span>
                    <span className="text-base font-black text-amber-600 font-mono">
                      🌅 {weatherReport.sunrise} · 🌇 {weatherReport.sunset}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">11h 36m daylight</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HOURLY FORECAST (NEXT 24 HOURS) */}
            {weatherModalTab === "hourly" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black">24-Hour Microclimate Timeline</h3>
                  <span className="text-xs text-slate-400">NOAA NWS Point Model</span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1">
                  {(weatherReport.hourly || []).map((h, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 min-w-[95px] text-center space-y-1.5 shrink-0 hover:border-sky-500 transition"
                    >
                      <span className="text-xs font-bold text-slate-500 block">{h.hour}</span>
                      <span className="text-2xl block">{h.icon}</span>
                      <span className="text-base font-black font-mono block">{h.temperature}°</span>
                      <div className="text-[10px] text-sky-600 font-bold">
                        {h.popPercent > 0 ? `💧 ${h.popPercent}%` : "Dry"}
                      </div>
                      <span className="text-[9px] text-slate-400 block">{h.windDirection} {h.windSpeed}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 7-DAY FORECAST */}
            {weatherModalTab === "daily" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black">7-Day Extended NWS Outlook</h3>
                  <span className="text-xs text-slate-400">Towson, MD Zone MDZ006</span>
                </div>

                <div className="space-y-2.5">
                  {(weatherReport.daily || []).map((d, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border flex items-center justify-between flex-wrap gap-3 hover:border-sky-500 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{d.dayName}</span>
                            <span className="text-[10px] text-slate-400">{d.date}</span>
                          </div>
                          <p className="text-xs text-slate-500">{d.shortForecast}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        {d.popPercent > 20 && (
                          <span className="text-sky-600 font-bold">💧 {d.popPercent}%</span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 dark:text-zinc-100">{d.highTemp}°</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500">{d.lowTemp}°</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: LIVE DOPPLER RADAR SIMULATION */}
            {weatherModalTab === "radar" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black">Towson High-Definition Base Reflectivity Radar</h3>
                    <p className="text-xs text-slate-500">NOAA KLWX Doppler Radar • Centered over Freedom Square & Cook Library</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2.5 py-1 rounded-full border border-emerald-200">
                    ● Live Feed Active
                  </span>
                </div>

                <div className="relative h-64 bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between p-4">
                  {/* Radar Sweeper Animation */}
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                  
                  {/* Circular Radar Sweep Beam */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-sky-500/30 animate-pulse pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-sky-500/20 pointer-events-none" />
                  
                  {/* Towson Campus Quad Label */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/20">
                      📍 Towson Main Quad (0 dBZ · Clear Air)
                    </div>
                    <div className="bg-sky-950/80 text-sky-300 px-3 py-1 rounded-full text-[10px] font-mono border border-sky-500/40">
                      Scan Elevation: 0.5°
                    </div>
                  </div>

                  {/* Simulated Rain Band in distance */}
                  <div className="absolute right-8 top-12 w-32 h-20 bg-gradient-to-br from-emerald-500/30 via-yellow-500/30 to-transparent rounded-full blur-xl animate-pulse" />

                  {/* Reflectivity Legend */}
                  <div className="relative z-10 flex items-center justify-between bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 text-[10px] text-slate-300">
                    <span className="font-bold">dBZ Scale:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500 text-black font-bold">Light</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black font-bold">Moderate</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">Heavy</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">Severe</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: NWS ALERTS & UNIVERSITY OPERATIONAL STATUS */}
            {weatherModalTab === "alerts" && (
              <div className="space-y-4">
                {/* Government NWS Alert Section */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Official National Weather Service (NWS) Bulletins
                  </span>
                  {(weatherReport.activeAlerts || []).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>{alert.event}</span>
                        </span>
                        <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold px-2 py-0.5 rounded-full">
                          {alert.severity} • {alert.urgency}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 font-semibold">{alert.headline}</p>
                      <p className="text-slate-500">{alert.description}</p>
                      <div className="pt-2 border-t border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                        🛡️ Action: {alert.instruction}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Separate University Administration Operational Status */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Towson University Official Operational Status
                  </span>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{weatherReport.operatingStatus.title}</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        {weatherReport.operatingStatus.status}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-zinc-300">{weatherReport.operatingStatus.announcement}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                      <div>🚌 <strong>Transit:</strong> {weatherReport.operatingStatus.shuttleStatus}</div>
                      <div>🍽️ <strong>Dining:</strong> {weatherReport.operatingStatus.diningStatus}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: NOTIFICATION PREFERENCES */}
            {weatherModalTab === "settings" && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-black">Weather Safety Notification Settings</h3>
                  <p className="text-slate-500">Customize push notifications for campus weather events and morning briefings.</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: "emergencyAlerts", title: "Emergency Tornado & Flash Flood Warnings", desc: "Immediate push alerts for imminent hazardous weather affecting Towson." },
                    { key: "severeStormWatches", title: "Severe Thunderstorm Watches & Lightning", desc: "Advisories when severe storm conditions are favorable over northern Maryland." },
                    { key: "winterWeatherAlerts", title: "Winter Weather, Snow & Ice Closures", desc: "Alerts for campus delays, snow routes, and university schedule modifications." },
                    { key: "extremeHeatAdvisories", title: "Extreme Heat Index Warnings", desc: "Hydration and indoor cooling station reminders when Heat Index exceeds 100°F." },
                    { key: "morningBriefing", title: "7:30 AM Daily Campus Weather Briefing", desc: "Receive morning highs, umbrella recommendation, and outdoor event forecasts." },
                  ].map((pref) => (
                    <div key={pref.key} className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold">{pref.title}</div>
                        <span className="text-[11px] text-slate-400">{pref.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={(weatherPrefs as any)[pref.key]}
                        onChange={(e) => {
                          const updated = { ...weatherPrefs, [pref.key]: e.target.checked };
                          setWeatherPrefs(updated);
                          saveWeatherPreferences(updated);
                          triggerToast("🔔 Weather notification preferences saved!");
                        }}
                        className="rounded text-sky-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Modal Actions */}
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowWeatherModal(false)}
                className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-zinc-700"
              >
                <X className="w-4 h-4" />
                <span>Close Weather Center</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4.1 MODAL: CANVAS SYNC & ASSIGNMENT RADAR */}
      {selectedCourseForCanvas && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCourseForCanvas(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCourseForCanvas.imageUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80"}
                  alt={selectedCourseForCanvas.code}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                      {selectedCourseForCanvas.code}
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      Canvas Synced ✓
                    </span>
                  </div>
                  <h3 className="text-sm font-black line-clamp-1">{selectedCourseForCanvas.name}</h3>
                  <span className="text-xs text-slate-500">👨‍🏫 {selectedCourseForCanvas.professor} • 📍 {selectedCourseForCanvas.room}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourseForCanvas(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Grade Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Grade</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{selectedCourseForCanvas.grade || "A (94%)"}</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Credits</span>
                <span className="text-sm font-black">{selectedCourseForCanvas.credits || 3.0} CR</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Study Pods</span>
                <span className="text-sm font-black text-emerald-500">{selectedCourseForCanvas.studyGroupsCount || 8} Active</span>
              </div>
            </div>

            {/* Upcoming Assignments / Deliverables */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                📅 Upcoming Deliverables & Exams
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedCourseForCanvas.deliverables || [
                  { id: "d1", title: "Assignment Deliverable 1", dueText: "Today at 11:59 PM", dueHoursLeft: 6, points: 100, type: "Lab", isSubmitted: false, activeStudyPodsCount: 4 }
                ]).map((del) => (
                  <div
                    key={del.id}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {del.type}
                          </span>
                          <span className="text-xs font-bold">{del.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span className="text-amber-600 font-semibold">⏳ {del.dueText}</span>
                          <span>•</span>
                          <span>{del.points} Pts</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        del.isSubmitted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {del.isSubmitted ? "Submitted ✓" : `${del.dueHoursLeft}h left`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => {
                          setSelectedCourseForCanvas(null);
                          setActiveTab("campus");
                          triggerToast(`👥 Joined study pod for ${del.title}`);
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>👥 Join Study Pod ({del.activeStudyPodsCount || 3} online)</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerToast(`🚀 Submitted ${del.title} to Towson Canvas!`);
                        }}
                        className="text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded-xl transition"
                      >
                        {del.isSubmitted ? "Resubmit" : "Submit File"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCourseForCanvas(null);
                  setActiveTab("campus");
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-2xl text-xs transition"
              >
                Open Course Hub & Notes
              </button>
              <button
                onClick={() => setSelectedCourseForCanvas(null)}
                className="px-4 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold py-2.5 rounded-2xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 MODAL: DIGITAL TIGER CARD & DINING WALLET PASS */}
      {showTigerWalletModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTigerWalletModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">Towson Digital Tiger OneCard</h3>
              </div>
              <button
                onClick={() => setShowTigerWalletModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Digital Tiger Card Visual (Gold/Black Luxe Design) */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-black rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden space-y-4 border border-amber-400/40">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐯</span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 block leading-none">TOWSON UNIVERSITY</span>
                    <span className="text-[9px] text-amber-100 uppercase tracking-wider font-mono">OneCard • Digital Pass</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs font-mono font-bold">
                  NFC
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/60 shadow-lg"
                />
                <div>
                  <h4 className="text-base font-black leading-tight text-white">{currentUser.name}</h4>
                  <span className="text-xs text-amber-100 block">{currentUser.major}</span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold block mt-0.5">ID: {currentUser.studentId}</span>
                </div>
              </div>

              {/* Scannable Barcode */}
              <div className="bg-white p-2.5 rounded-2xl space-y-1 text-center text-black">
                <div className="h-9 flex items-center justify-center gap-1 overflow-hidden px-4">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${(i % 3) + 1.5}px`, opacity: i % 5 === 0 ? 0.4 : 1 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800">{tigerWallet.barcodeNumber}</span>
              </div>
            </div>

            {/* Live Campus Balances */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                💳 Live Dining & Student Accounts
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-1">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase block">Meal Swipes</span>
                  <span className="text-xl font-black text-amber-900 dark:text-amber-100">{tigerWallet.mealSwipesRemaining} Swipes</span>
                  <span className="text-[9px] text-slate-400 block">Resets Sunday midnight</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">Dining Dollars</span>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">${(tigerWallet?.diningDollarsBalance ?? 428.5).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">All campus dining + Dunkin'</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Retail Points</span>
                  <span className="text-base font-black">${(tigerWallet?.retailPointsBalance ?? 185.0).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">Bookstore & concessions</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Print Quota</span>
                  <span className="text-base font-black">${(tigerWallet?.printQuotaBalance ?? 34.25).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">Cook Library Printers</span>
                </div>
              </div>
            </div>

            {/* Dorm Access Zone */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">DORM KEYCARD ACCESS</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100">{tigerWallet.dormAccessZone}</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => triggerToast("📲 Added Towson OneCard pass to Apple Wallet & Google Wallet!")}
                className="w-full bg-black hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition border border-white/20"
              >
                <span> Add to Apple Wallet & Google Wallet</span>
              </button>
              <button
                onClick={() => {
                  setTigerWallet({
                    ...tigerWallet,
                    diningDollarsBalance: tigerWallet.diningDollarsBalance + 50,
                  });
                  triggerToast("💳 Reloaded +$50.00 to Towson Dining Dollars!");
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-2xl text-xs transition"
              >
                + Quick Reload ($50 Dining Dollars)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4.3 MODAL: TIGER SAFEWALK VIRTUAL NIGHT ESCORT */}
      {showSafeWalkModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSafeWalkModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black">Tiger SafeWalk Virtual Escort</h3>
              </div>
              <button
                onClick={() => setShowSafeWalkModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Escort Status */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-3xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                  LIVE SESSION ACTIVE
                </span>
                <span className="text-xs font-mono text-emerald-300 font-black">ETA: ~{safeWalkSession.estimatedMinutes} Mins</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-300">
                  📍 Origin: <strong>{safeWalkSession.originName}</strong>
                </div>
                <div className="text-xs text-slate-300">
                  🏁 Destination: <strong>{safeWalkSession.destinationName}</strong>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Route Progress</span>
                  <span className="font-bold text-emerald-400">{safeWalkSession.currentProgressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${safeWalkSession.currentProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                👀 Companion Guardian Monitoring You:
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={safeWalkSession.guardianAvatar}
                    alt={safeWalkSession.guardianName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-zinc-100">{safeWalkSession.guardianName}</h5>
                    <span className="text-[10px] text-emerald-600 font-medium">Tracking live via TigerOrbit 360</span>
                  </div>
                </div>
                <a
                  href={`tel:${safeWalkSession.guardianPhone}`}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold flex items-center gap-1 transition"
                  title="Call Guardian"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setSafeWalkSession({ ...safeWalkSession, currentProgressPercent: 100, status: "ARRIVED" });
                  setShowSafeWalkModal(false);
                  triggerToast("🎉 Arrived safely! Your SafeWalk session has ended.");
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Arrived Safely ✓</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => triggerToast("📞 Triggering simulated incoming check-in call...")}
                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl transition"
                >
                  📱 Fake Check-in Call
                </button>
                <button
                  onClick={() => {
                    setSafeWalkSession({ ...safeWalkSession, status: "EMERGENCY_DISPATCHED" });
                    triggerToast("🚨 TUPD Emergency Dispatch alerted with your exact GPS coordinates!");
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>1-Tap TUPD SOS</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4.5 MODAL: UNIVERSAL SPOTLIGHT SEARCH (CMD/CTRL + K) */}
      {showOmniSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOmniSearch(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <Search className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">Universal Campus Search</h3>
              </div>
              <button
                onClick={() => setShowOmniSearch(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search people, housing, events, clubs, products, jobs, classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Result Clusters */}
            <div className="max-h-80 overflow-y-auto space-y-3 pt-2 text-xs">
              {/* Buildings & Places */}
              {omniResults.buildings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">🏫 Campus Places & Rooms</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {omniResults.buildings.slice(0, 4).map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBuildingModal(b);
                          setShowOmniSearch(false);
                        }}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="font-bold">{b.name}</div>
                        <span className="text-[10px] font-mono text-amber-600 font-bold">{b.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {omniResults.events.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">📅 Campus Events</span>
                  <div className="space-y-1.5">
                    {omniResults.events.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          setActiveTab("events");
                          setShowOmniSearch(false);
                        }}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <div className="font-bold">{ev.title}</div>
                          <span className="text-[10px] text-slate-400">📍 {ev.location} • {ev.time}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600">View Event →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {omniResults.people.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">👥 Students & Peers</span>
                  <div className="grid grid-cols-2 gap-2">
                    {omniResults.people.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab("messages");
                          setShowOmniSearch(false);
                        }}
                        className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer"
                      >
                        <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="truncate">
                          <div className="font-bold truncate">{p.name}</div>
                          <span className="text-[10px] text-slate-400 truncate block">{p.major}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-slate-400">
              <span>ProTip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-800 rounded font-mono text-[10px]">Esc</kbd> anytime to exit</span>
              <button
                onClick={() => {
                  setActiveTab("more");
                  setMoreSubView("ai");
                  setShowOmniSearch(false);
                }}
                className="text-amber-600 font-bold hover:underline"
              >
                Ask Campus AI Instead →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.6 DRAWER: GLOBAL NOTIFICATION CENTER */}
      {showNotifDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNotifDrawer(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 w-full max-w-md h-full p-6 relative shadow-2xl space-y-4 flex flex-col justify-between text-slate-900 dark:text-zinc-100 animate-in slide-in-from-right">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black">Towson Notifications</h3>
                </div>
                <button
                  onClick={() => setShowNotifDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                {(["ALL", "EVENT", "ORG", "SOCIAL", "SYSTEM"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNotifFilterTab(tab)}
                    className={`px-3 py-1 rounded-xl transition ${
                      notifFilterTab === tab ? "bg-amber-500 text-black font-black" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notification Stream */}
              <div className="space-y-2.5 max-h-[70vh] overflow-y-auto text-xs">
                {[
                  { id: "1", title: "🏠 Housing Match Alert", msg: "A new 2BR unit matched your budget near University Village ($875/mo).", time: "5m ago", type: "HOUSING", read: false },
                  { id: "2", title: "🎟️ Event RSVP Reminder", msg: "Towson Cybersecurity Keynote starts today at 5:00 PM in Science Complex.", time: "45m ago", type: "EVENT", read: false },
                  { id: "3", title: "🌦️ NOAA Weather Update", msg: "NOAA reports 20% precipitation chance. Good conditions for outdoor campus walking.", time: "2h ago", type: "WEATHER", read: true },
                  { id: "4", title: "👥 ASA Towson Announcement", msg: "General body meeting confirmed for Thursday 6:30 PM in Union Rm 302.", time: "4h ago", type: "ORG", read: true },
                ].map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition space-y-1 ${
                      !notif.read ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800" : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-zinc-100">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">{notif.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                triggerToast("🔔 All notifications marked as read.");
                setShowNotifDrawer(false);
              }}
              className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}

      {/* 4.7 MODAL: OFFICIAL SERVICE CERTIFICATE */}
      {showCertificateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertificateModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border-4 border-amber-500 rounded-3xl max-w-xl w-full p-8 relative shadow-2xl space-y-6 text-center text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-black flex items-center justify-center mx-auto text-3xl font-black shadow-lg">
              TU
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600">Towson University Office of Civic Engagement</span>
              <h2 className="text-2xl font-black">Official Certificate of Student Leadership</h2>
              <p className="text-xs text-slate-500">This certifies that</p>
              <h3 className="text-xl font-black text-amber-600">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                has completed <strong>{currentUser.volunteerHoursLogged ?? 48} verified volunteer hours</strong> and attended <strong>{currentUser.eventsAttendedCount ?? 12} official campus engagement programs</strong> during the 2025–2026 academic term.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border text-xs font-mono flex items-center justify-between">
              <span>Verification Hash: 0x9f4a...81c2</span>
              <span className="text-emerald-600 font-bold">Verified Tiger Record ✓</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  triggerToast("📥 Certificate downloaded as verified PDF.");
                  setShowCertificateModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl text-xs shadow-md transition"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold py-3 rounded-2xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2.5">
          
          {/* Left: Logo & Campus Selector & NOAA Weather */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setActiveTab("home")}>
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-base shadow-sm">
                TU
              </div>
              <div className="hidden xl:block">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-zinc-100 block leading-tight">
                  TowsonSync
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">Digital Campus</span>
              </div>
            </div>

            {/* Sleek Compact Campus Selector */}
            <select
              value={selectedCampus}
              onChange={(e) => {
                setSelectedCampus(e.target.value as any);
                triggerToast(`📍 Switched to ${e.target.value}`);
              }}
              className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="Towson Main Campus">🏛️ Main Campus</option>
              <option value="TU Downtown">🏙️ TU Downtown</option>
              <option value="TU Health Complex">🏥 Health Complex</option>
            </select>

            {/* Authoritative NOAA / NWS Compact Weather Pill */}
            <div
              onClick={() => {
                setShowWeatherModal(true);
                setWeatherModalTab("now");
              }}
              className="flex items-center gap-1.5 bg-sky-50/80 hover:bg-sky-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-xl border border-sky-200 dark:border-zinc-700 cursor-pointer transition text-xs shadow-xs shrink-0 font-bold text-slate-900 dark:text-zinc-100"
              title="Click for NOAA NWS Radar & Campus Weather"
            >
              <span className="text-sm">{weatherReport?.conditionIcon || "☀️"}</span>
              <span>{weatherReport?.currentTemp ?? 82}°F</span>
              {((weatherReport?.activeAlerts) || []).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Active Advisory" />
              )}
            </div>
          </div>

          {/* Center: Clean Navigation Menu (No Wrapping) */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "map"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab("housing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "housing"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Housing</span>
            </button>

            <button
              onClick={() => setActiveTab("campus")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "messages"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Mail & Teams</span>
            </button>

            <button
              onClick={() => setActiveTab("more")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "more"
                  ? "bg-amber-500 text-black shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>⋯ More</span>
            </button>
          </nav>

          {/* Right: Streamlined Utility Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Digital Tiger OneCard Button */}
            <button
              onClick={() => setShowTigerWalletModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 hover:border-amber-500 transition shrink-0"
              title="Open Towson Digital OneCard & Balances"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-mono text-[11px] font-bold">{tigerWallet.mealSwipesRemaining} Swipes</span>
            </button>

            {/* Search */}
            <button
              onClick={() => setShowOmniSearch(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition shrink-0"
              title="Search Campus (Cmd + K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Center */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition shrink-0"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 shrink-0"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition duration-300" />
              )}
            </button>

            {/* Profile Dropdown with "Me ⌵" (as in image media_1788129714840.png) */}
            <div className="relative pl-1 border-l border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition group cursor-pointer"
                title="Account & Profile"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
                <div className="flex items-center gap-0.5 text-[11px] font-bold text-slate-600 dark:text-zinc-300 group-hover:text-amber-500 leading-none mt-1">
                  <span>Me</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-500 transition" />
                </div>
              </button>

              {/* User Dropdown Menu with Full Cover & Enrolled Courses */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden z-50 animate-in zoom-in-95">
                  {/* Banner */}
                  <div className="h-16 bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-900 relative">
                    <img
                      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
                      alt="Profile Banner"
                      className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                  </div>

                  {/* Profile Header */}
                  <div className="p-4 pt-0 relative space-y-3">
                    <div className="flex items-end justify-between -mt-8">
                      <div className="relative">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md"
                        />
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                      </div>
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                        {currentUser.role === "CLUB_LEAD" ? "👑 Club Lead" : currentUser.role === "FACULTY" ? "🏛️ TU Faculty" : "🐯 Verified Tiger"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{currentUser.name}</h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-xs text-slate-500">{currentUser?.major || "Computer Science"} • Class of {currentUser?.gradYear || "2026"}</p>
                      <span className="text-[10px] font-mono text-amber-600 font-bold block mt-0.5">🪪 ID: {currentUser?.studentId || "0982341"}</span>
                    </div>

                    {/* Quick Access Card: Tiger OneCard */}
                    <button
                      onClick={() => {
                        setShowTigerWalletModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-900 dark:text-zinc-100">Digital OneCard Wallet</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400">
                        {tigerWallet?.mealSwipesRemaining ?? 14} Swipes • ${(tigerWallet?.diningDollarsBalance ?? 428).toFixed(0)}
                      </span>
                    </button>

                    {/* Enrolled Courses Preview inside dropdown */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Enrolled Courses ({(courses.length > 0 ? courses : initialCampusCourses).length}):
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                        {(courses.length > 0 ? courses : initialCampusCourses).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCourseForCanvas(c);
                              setShowUserDropdown(false);
                            }}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition"
                          >
                            <img src={c.imageUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80"} alt={c.code} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-[11px] block truncate text-slate-900 dark:text-zinc-100">{c.code}: {c.name}</span>
                              <span className="text-[9px] text-slate-400 block truncate">👨‍🏫 {c.professor}</span>
                            </div>
                            {c.grade && (
                              <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                                {(c.grade || "").split(" ")[0]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Switch Account Persona & Roles */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs font-bold">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Switch Identity & Role:</span>
                        <span className="text-[9px] font-mono text-emerald-500 font-bold">RBAC ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {personas.map((persona, pIdx) => (
                          <button
                            key={persona.id}
                            onClick={() => {
                              setActivePersonaIndex(pIdx);
                              setCurrentUser(persona);
                              setShowUserDropdown(false);
                              triggerToast(`👤 Switched identity to ${persona.name} (${persona.role})`);
                              if (persona.role === "ADMIN") {
                                setActiveTab("more");
                                setMoreSubView("admin");
                              }
                            }}
                            className={`p-2 rounded-xl text-left transition flex items-center gap-2 border ${
                              currentUser?.id === persona.id
                                ? "bg-amber-500 text-black border-amber-600 font-black shadow-xs"
                                : "bg-slate-50 dark:bg-zinc-800/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                            }`}
                          >
                            <img src={persona.avatar} alt={persona.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[11px] block truncate font-bold">{(persona.name || "User").split(" ")[0]}</span>
                              <span className="text-[9px] block opacity-75 font-mono uppercase">{persona.role}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Console Shortcut for Admins & Staff */}
                    {currentUser.role === "ADMIN" && (
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          onClick={() => {
                            setActiveTab("more");
                            setMoreSubView("admin");
                            setShowUserDropdown(false);
                          }}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-2.5 rounded-2xl flex items-center justify-between text-xs font-black shadow-md transition"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-300" />
                            <span>TowsonSync Administration</span>
                          </div>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Open →</span>
                        </button>
                      </div>
                    )}

                    {/* Axiom Connect Mail & Teams Suite Quick Launch */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setActiveTab("more");
                          setMoreSubView("connect" as any);
                          setShowUserDropdown(false);
                          triggerToast("⚡ Launched Axiom Connect Mail & Teams Suite");
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black p-2.5 rounded-2xl flex items-center justify-between text-xs font-black shadow-md transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">⚡</span>
                          <span>Axiom Mail & Teams Suite</span>
                        </div>
                        <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-bold">Launch →</span>
                      </button>
                    </div>

                    <div className="border-t pt-2 space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setShowSafeWalkModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tiger SafeWalk Night Escort</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAskAiModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>✨ Ask TowsonSync AI</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLocationSharePicker(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-2"
                      >
                        <span>🪐</span>
                        <span>TigerOrbit 360 Privacy (Opt-in)</span>
                      </button>
                      <button
                        onClick={() => {
                          handleToggleTheme();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{isDarkMode ? "☀️" : "🌙"}</span>
                          <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{isDarkMode ? "Dark" : "Light"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("more");
                          setMoreSubView("transcript");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center justify-between text-amber-600 dark:text-amber-400"
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>Tiger Record & Passport</span>
                        </div>
                        <span className="text-[10px] font-mono">5/7 ✓</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  Towson University • Geographic Platform & TigerOrbit 360
                </span>
                <h1 className="text-2xl font-black mt-0.5">Towson Campus Live Map & Indoor Radar</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Explore academic buildings, floor plans, live Tiger Ride shuttles, parking garages, TUPD Blue Lights, and temporary TigerOrbit 360 circles.
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
                  <span>{currentUser.isLocationSharing ? "Manage Orbits" : "Share My Location"}</span>
                </button>
              </div>
            </div>

            {/* Filter Layer Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              {[
                { id: "ALL", label: "🌐 All Campus" },
                { id: "BUILDINGS", label: "🏛️ Academic Buildings" },
                { id: "CIRCLES", label: "👥 TigerOrbit 360" },
                { id: "HOUSING", label: "🏠 TUHousing Off-Campus" },
                { id: "WEATHER", label: "🌦️ NOAA Weather & Radar" },
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

              {/* 2. TigerOrbit 360 Friend Pins */}
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

              {/* 7. TUHousing Off-Campus Listings */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "HOUSING") &&
                (housingListings || []).map((hse) => (
                  <button
                    key={hse.id}
                    onClick={() => {
                      setSelectedHousingListing(hse);
                      triggerToast(`🏠 Selected ${hse.title} ($${hse.monthlyRent}/mo · ${hse.distanceFromCampusMiles} mi away)`);
                    }}
                    style={{ top: `${hse.mapCoords.y}%`, left: `${hse.mapCoords.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-25"
                  >
                    <div className="px-2.5 py-1 rounded-2xl bg-indigo-950 border-2 border-indigo-400 text-white font-bold text-[10px] shadow-2xl flex items-center gap-1 hover:scale-110 hover:bg-indigo-600 transition">
                      <span>🏠</span>
                      <span>${hse.monthlyRent}</span>
                    </div>
                  </button>
                ))}

              {/* 8. NOAA / NWS Live Radar & Microclimate Layer */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "WEATHER") && (
                <>
                  {/* Microclimate Weather Nodes */}
                  <div
                    style={{ top: "32%", left: "48%" }}
                    onClick={() => {
                      setShowWeatherModal(true);
                      setWeatherModalTab("now");
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                  >
                    <div className="px-2.5 py-1 rounded-xl bg-sky-950/90 border border-sky-400 text-sky-200 font-bold text-[10px] shadow-xl flex items-center gap-1 hover:scale-110 transition">
                      <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                      <span>Freedom Square: {weatherReport.currentTemp}°F</span>
                    </div>
                  </div>

                  <div
                    style={{ top: "62%", left: "22%" }}
                    onClick={() => {
                      setShowWeatherModal(true);
                      setWeatherModalTab("now");
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                  >
                    <div className="px-2 py-0.5 rounded-lg bg-sky-950/80 border border-sky-500/60 text-sky-300 font-bold text-[9px] shadow-lg flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-400" />
                      <span>Burdick: {weatherReport.currentTemp - 1}°F · {weatherReport.windDirection} {weatherReport.windSpeedMph}mph</span>
                    </div>
                  </div>

                  <div
                    style={{ top: "16%", left: "76%" }}
                    onClick={() => {
                      setShowWeatherModal(true);
                      setWeatherModalTab("radar");
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                  >
                    <div className="px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-400/60 text-indigo-200 font-bold text-[9px] shadow-lg flex items-center gap-1">
                      <Compass className="w-3 h-3 text-sky-400" />
                      <span>U-Village: {weatherReport.currentTemp + 1}°F</span>
                    </div>
                  </div>
                </>
              )}

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
              
              {/* 1. TigerOrbit 360 Panel */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">TigerOrbit 360 (My Orbits)</h3>
                  </div>
                  <button
                    onClick={() => setShowLocationSharePicker(true)}
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    Manage Orbits
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
        {/* 🏠 DEDICATED MODULE: TUHOUSING & OFF-CAMPUS PLATFORM */}
        {/* ========================================================================= */}
        {activeTab === "housing" && (
          <div className="space-y-6">
            
            {/* Header & Quick Stats Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                  Towson University • Off-Campus Housing & Roommate Mesh
                </span>
                <h1 className="text-2xl font-black mt-0.5">TUHousing — Find Your Campus Home</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Explore verified student apartments, colonial shared houses, roommate matching, virtual video walkthroughs, and direct Tiger Shuttle routes.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Maintenance</span>
                </button>

                <button
                  onClick={() => setHousingSubTab("calculator")}
                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cost Calculator</span>
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              {[
                { id: "find", label: "🔍 Find Homes" },
                { id: "roommates", label: "👥 Roommate Matchmaker" },
                { id: "tours", label: `📅 Booked Tours (${(housingTours || []).length})` },
                { id: "maintenance", label: `🔧 Resident Maintenance (${(housingTickets || []).length})` },
                { id: "calculator", label: "💡 Cost of Living Calculator" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setHousingSubTab(sub.id as any)}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                    housingSubTab === sub.id
                      ? "bg-amber-500 text-black shadow-xs font-black"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>

            {/* SUB-VIEW 1: FIND HOMES */}
            {housingSubTab === "find" && (
              <div className="space-y-6">
                
                {/* Search & Filters */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between flex-wrap gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">Property Type:</span>
                    {["ALL", "Apartment", "Shared House", "Private Room"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setHousingFilterType(t)}
                        className={`px-3 py-1.5 rounded-xl transition ${
                          housingFilterType === t
                            ? "bg-indigo-600 text-white font-black"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                        }`}
                      >
                        {t === "ALL" ? "All Homes" : t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Max Budget:</span>
                    <span className="font-mono text-amber-600 font-bold">${housingMaxRent}/mo</span>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="50"
                      value={housingMaxRent}
                      onChange={(e) => setHousingMaxRent(Number(e.target.value))}
                      className="accent-amber-500 cursor-pointer w-28"
                    />
                  </div>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(housingListings || [])
                    .filter((h) => housingFilterType === "ALL" || h.propertyType === housingFilterType)
                    .filter((h) => h.monthlyRent <= housingMaxRent)
                    .map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition group"
                      >
                        <div>
                          {/* Image & Video Walkthrough Badge */}
                          <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSaveHousing(listing.id);
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:scale-110 transition"
                            >
                              <Heart className={`w-4 h-4 ${listing.isSaved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                            </button>

                            {listing.isVerifiedLandlord && (
                              <div className="absolute top-3 left-3 bg-emerald-500 text-black font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified Landlord ({listing.trustScorePercent}%)</span>
                              </div>
                            )}

                            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Film className="w-3 h-3 text-amber-400" />
                              <span>60s Video Tour Available</span>
                            </div>
                          </div>

                          {/* Listing Details */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono">
                                  ${listing.monthlyRent}
                                </span>
                                <span className="text-xs text-slate-400">/mo</span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                + ~${listing.estimatedUtilities} util (~${listing.estimatedTotalMonthly}/mo total)
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug group-hover:text-indigo-600 transition">
                              {listing.title}
                            </h3>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{listing.address}</span>
                            </p>

                            {/* Distance & Transit Matrix */}
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                                <span>📍 {listing.distanceFromCampusMiles} miles from Cook Library</span>
                                <span className="text-emerald-600">🚶 {listing.walkTimeMinutes} min walk</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>🚌 {listing.shuttleRouteName}</span>
                                <span className="text-amber-600 font-bold">~{listing.transitTimeMinutes} min ride ({listing.nextShuttleEtaMinutes}m ETA)</span>
                              </div>
                            </div>

                            {/* Amenities Chips */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(listing.amenities || []).slice(0, 4).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="p-5 pt-0 grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => {
                              setTourFormProperty(listing);
                              setShowTourBookingModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book Tour</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedHousingListing(listing);
                            }}
                            className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: ROOMMATE MATCHMAKER */}
            {housingSubTab === "roommates" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/40">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Towson Peer Matchmaker</span>
                    <h2 className="text-xl font-black mt-0.5">Find Compatible Roommates for Fall 2026</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Matched by major, target rent budget, sleep schedule, study habits, and cleanliness standards.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(roommateProfiles || []).map((rm) => (
                    <div
                      key={rm.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            <img src={rm.avatar} alt={rm.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500" />
                            <div>
                              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">{rm.name}</h3>
                              <span className="text-xs font-bold text-indigo-600 block">{rm.major} • {rm.classStanding}</span>
                              <span className="text-[10px] text-slate-400">Target Move-in: {rm.targetMoveIn}</span>
                            </div>
                          </div>

                          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-2xl text-center">
                            <span className="text-base font-black block font-mono leading-none">{rm.compatibilityPercent}%</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">Match</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{rm.bio}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border">
                            <span className="text-[10px] text-slate-400 font-bold block">BUDGET:</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{rm.budgetMonthly}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border">
                            <span className="text-[10px] text-slate-400 font-bold block">SCHEDULE:</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{(rm.sleepSchedule || "").split("(")[0]}</span>
                          </div>
                        </div>

                        {/* Match Tags */}
                        <div className="space-y-1">
                          {(rm.compatibilityTags || []).map((tag) => (
                            <div key={tag} className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              <span>{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConnectRoommate(rm.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md ${
                          rm.isConnected
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>{rm.isConnected ? "Connected ✓ (Message Sent)" : "Connect & Form Housing Group"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: BOOKED TOURS */}
            {housingSubTab === "tours" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">Your Scheduled Property Tours</h2>
                  <span className="text-xs font-bold text-slate-500">{(housingTours || []).length} Active Tours</span>
                </div>

                <div className="space-y-4">
                  {(housingTours || []).map((tour) => (
                    <div
                      key={tour.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex items-center justify-between flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-2xl font-black text-xl">
                          📅
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded-full border border-emerald-200">
                              {tour.status}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">{tour.tourType}</span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 mt-1">{tour.propertyTitle}</h3>
                          <p className="text-xs text-slate-500">{tour.propertyAddress}</p>
                          <span className="text-xs font-bold text-amber-600 mt-0.5 block">
                            ⏰ {tour.tourDate} at {tour.tourTimeSlot}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${tour.contactNumber.replace(/\D/g, "")}`}
                          className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Landlord</span>
                        </a>

                        <button
                          onClick={() => triggerToast("📅 Calendar reminder exported to your device!")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-md flex items-center gap-1.5"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: RESIDENT MAINTENANCE */}
            {housingSubTab === "maintenance" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-amber-500/30">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Towson Resident Services</span>
                    <h2 className="text-xl font-black mt-0.5">Off-Campus & Dorm Maintenance Portal</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Report plumbing, heating/AC, electrical, or appliance issues with instant dispatch to authorized facilities techs.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black px-4 py-2.5 rounded-2xl text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Submit Repair Ticket</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(housingTickets || []).map((tkt) => (
                    <div
                      key={tkt.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {tkt.ticketNumber}
                          </span>
                          <span className="text-sm font-bold">{tkt.category} ({tkt.urgency} Priority)</span>
                        </div>

                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200">
                          Status: {tkt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400">{tkt.description}</p>

                      <div className="pt-2 border-t flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                        <span>📍 {tkt.propertyAddress} • {tkt.unitNumber}</span>
                        <span>Assigned: <strong className="text-slate-700 dark:text-zinc-200">{tkt.assignedTech || "Dispatch"}</strong></span>
                        <span>Submitted: {tkt.submittedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: COST OF LIVING CALCULATOR */}
            {housingSubTab === "calculator" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Towson Student Cost of Living Calculator</h2>
                  <p className="text-xs text-slate-500">Estimate your total monthly expenses across rent, gas/electric, high-speed Wi-Fi, and garage parking.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    {/* Rent Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Monthly Rent:</span>
                        <span className="font-mono text-indigo-600">${calcRent}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="2000"
                        step="25"
                        value={calcRent}
                        onChange={(e) => setCalcRent(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Utilities Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Electric & Gas Utilities:</span>
                        <span className="font-mono text-indigo-600">${calcUtilities}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={calcUtilities}
                        onChange={(e) => setCalcUtilities(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Internet Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>High-Speed Wi-Fi Split:</span>
                        <span className="font-mono text-indigo-600">${calcInternet}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={calcInternet}
                        onChange={(e) => setCalcInternet(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Parking Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Parking / Garage Pass:</span>
                        <span className="font-mono text-indigo-600">${calcParking}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        step="10"
                        value={calcParking}
                        onChange={(e) => setCalcParking(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Cost Summary Card */}
                  <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-indigo-500/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Total Monthly Breakdown</span>
                    
                    <div>
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        ${calcRent + calcUtilities + calcInternet + calcParking}
                      </span>
                      <span className="text-xs text-slate-300"> / month</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Rent:</span>
                        <span className="font-mono font-bold">${calcRent}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Gas / Electric:</span>
                        <span className="font-mono font-bold">${calcUtilities}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Internet:</span>
                        <span className="font-mono font-bold">${calcInternet}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Parking:</span>
                        <span className="font-mono font-bold">${calcParking}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/40 text-xs text-emerald-300">
                      💡 <strong>Est. Savings:</strong> You save approx. <strong>$255/mo</strong> compared to standard on-campus dorm rates ($1,350/mo).
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: 🏠 HOME */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 1: 🏠 HOME (LINKEDIN-STYLE STUDENT INTELLIGENCE FEED) */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT COLUMN: 🧑‍🎓 STUDENT PROFILE & UNDERTAKEN COURSES (WITH PICTURES) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile & Enrolled Courses Card Container */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden text-slate-900 dark:text-zinc-100">
                {/* Tech / Circuit Cover Banner */}
                <div className="h-24 bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-900 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
                    alt="Campus Cover"
                    className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Overlapping Circular Avatar & Live Status Dot */}
                <div className="px-5 pb-5 pt-0 relative space-y-3">
                  <div className="flex items-end justify-between -mt-10">
                    <div className="relative">
                      <img
                        src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                        alt={currentUser?.name || "Student"}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                      />
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" title="Online on Towson Campus" />
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab("more");
                        setMoreSubView("transcript");
                      }}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full transition"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Student Name & Verified Checkmark */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-black text-slate-900 dark:text-zinc-100">
                        {currentUser?.name || "Kwesi Asiedu"}
                      </h2>
                      <span className="text-[11px] text-blue-500" title="Verified Towson Student">
                        <ShieldCheck className="w-4 h-4 inline" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      B.S. {currentUser?.major || "Computer Science"} • Class of {currentUser?.gradYear || "2026"} ({currentUser?.classStanding || "Senior"})
                    </p>
                    
                    {/* Digital Campus Student ID Pill */}
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 mt-1">
                      <span>🪪 Towson ID ({currentUser?.studentId || "0982341"})</span>
                      <span className="text-emerald-500 font-black">ACTIVE</span>
                    </div>
                  </div>

                  {/* Profile Strength Progress Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 text-[11px]">Profile Strength</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">94%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-[94%] h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* 📚 ENROLLED COURSES UNDERTAKEN (WITH PICTURES) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Enrolled Courses ({(courses.length > 0 ? courses : initialCampusCourses).length})
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab("campus")}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Explore All →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(courses.length > 0 ? courses : initialCampusCourses).map((course) => (
                        <div
                          key={course.id}
                          className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-slate-200 dark:border-zinc-700/70 hover:border-amber-500 transition group space-y-2.5"
                        >
                          <div
                            onClick={() => setSelectedCourseForCanvas(course)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                              <img
                                src={course.imageUrl || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80"}
                                alt={course.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              />
                              {course.grade && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-black text-amber-400 px-1 rounded">
                                  {(course.grade || "").split(" ")[0]}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 truncate">
                                  {course.code}
                                </span>
                                <span className="text-[10px] font-bold bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded">
                                  {course.credits || 3.0} cr
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-amber-500 transition">
                                {course.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                                👨‍🏫 {course.professor} • 📍 {course.room || "Science Complex"}
                              </p>
                            </div>
                          </div>

                          {/* Canvas Next Assignment Radar Pill */}
                          {course.nextAssignment && (
                            <button
                              onClick={() => setSelectedCourseForCanvas(course)}
                              className="w-full text-left p-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80 text-[10px] font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between transition"
                            >
                              <span className="truncate">⏳ {course.nextAssignment}</span>
                              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 shrink-0 ml-1">Canvas →</span>
                            </button>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                            <span>🕒 {(course.schedule || "").split("•")[0]}</span>
                            <button
                              onClick={() => {
                                setSelectedCourseForCanvas(course);
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
                            >
                              <span>Study Pods ({course.studyGroupsCount || 4}) →</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tiger Record Quick Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab("more");
                        setMoreSubView("transcript");
                      }}
                      className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/80 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span>Tiger Record & Passport</span>
                      </div>
                      <span className="font-mono text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">
                        5 / 7 Milestones
                      </span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* CENTER COLUMN: 📰 SOCIAL FEED & INTERACTIVE POST COMPOSER */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* FEED CATEGORY TABS & FILTER PILLS */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
                  {[
                    { id: "foryou", label: "🔥 For You", active: true },
                    { id: "products", label: "🚀 Products", active: false },
                    { id: "research", label: "📄 Research", active: false },
                    { id: "following", label: "👥 Following", active: false },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "products") {
                          setActiveTab("more");
                          setMoreSubView("market");
                        } else if (tab.id === "research") {
                          setActiveTab("more");
                          setMoreSubView("career");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                        tab.id === "foryou"
                          ? "bg-amber-500 text-black font-black shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">FILTER:</span>
                  {[
                    "All",
                    "AI Discussions",
                    "Cybersecurity",
                    "Cloud",
                    "Technology",
                    "Business",
                    "Career",
                  ].map((chip, idx) => (
                    <button
                      key={chip}
                      className={`px-2.5 py-0.5 rounded-full font-bold transition shrink-0 ${
                        idx === 0
                          ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-black"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* LINKEDIN-STYLE POST COMPOSER */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500 shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Start a post, share insights or milestones..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-zinc-800/80 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Composer Actions */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="px-2.5 py-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-500" />
                      <span>Media</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("📊 Poll creator activated.")}
                      className="px-2.5 py-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Create a Poll</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("🎉 Celebrate student milestone.")}
                      className="px-2.5 py-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Celebrate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("📄 Document upload ready.")}
                      className="px-2.5 py-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-orange-500" />
                      <span>Document</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
                  >
                    <span>Write with AI</span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
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
                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{post.authorName}</span>
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

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: 🌟 RECOMMENDED OPPORTUNITIES & WEATHER RADAR */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* RECOMMENDED OPPORTUNITY CARD (MATCHING USER SCREENSHOT) */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 border border-indigo-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    ✨ Recommended for you
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-black">92% Match</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">Because you follow <strong>Cloud Security & Zero Trust</strong>:</span>
                  
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">AXIOM Cyber Defense Suite</h4>
                        <span className="text-[10px] text-slate-400">Autonomous Zero-Trust & cATO</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Deploy identity perimeters and continuous automated compliance across campus lab nodes.
                    </p>
                    
                    <button
                      onClick={() => {
                        setActiveTab("more");
                        setMoreSubView("career");
                        triggerToast("💼 Research opportunity details loaded.");
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black py-2 rounded-xl transition shadow-md"
                    >
                      1-Click Apply →
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 📅 "MY DAY" — STUDENT PERSONAL COMMAND CENTER */}
              {/* ========================================================================= */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3.5">
                
                {/* Header: Greeting & Quick Weather Snippet */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">☀️</span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                        My Day • {(currentUser?.name || "Student").split(" ")[0]}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {weatherReport?.conditionIcon || "☀️"} {weatherReport?.currentTemp ?? 82}°F • {(weatherReport?.clothingRecommendation || "Light apparel & sunglasses").split(".")[0]}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full shrink-0">
                    7 Actions
                  </span>
                </div>

                {/* Interactive Agenda & Daily Timeline */}
                <div className="space-y-2 text-xs">
                  
                  {/* 1. Next Class */}
                  <div
                    onClick={() => {
                      if (courses[0]) setSelectedCourseForCanvas(courses[0]);
                      else triggerToast("📚 Class details loaded: COSC 421");
                    }}
                    className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📚</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">10:00 AM • COSC 421</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">Study Pod →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      📍 Science Complex Rm 304 • Dr. Catherine Hayes
                    </p>
                  </div>

                  {/* 2. Assignment Deadline */}
                  <div
                    onClick={() => {
                      if (courses[0]) setSelectedCourseForCanvas(courses[0]);
                      else triggerToast("📝 Canvas Deliverable: Lab 3 Due in 6h");
                    }}
                    className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📝</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">Lab 3 Due Tonight (11:59 PM)</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 group-hover:underline">Canvas (100 pts) →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      ⏳ Virtual Memory Pager • 4 Study Pod members online
                    </p>
                  </div>

                  {/* 3. Dining Special */}
                  <div
                    onClick={() => setShowTigerWalletModal(true)}
                    className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍔</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">12:15 PM • Newell Dining Special</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">1 Swipe • Wallet →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      Maryland Crab Cakes & Tiger Crisp Salad • $9.50
                    </p>
                  </div>

                  {/* 4. Live Shuttle ETA */}
                  <div
                    onClick={() => {
                      setActiveTab("map");
                      setMoreSubView("map");
                      triggerToast("🚌 Tiger Ride GPS live tracking active.");
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🚌</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">Tiger Ride Shuttle #14</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">4m ETA (Map) →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      Arriving at Cook Library Stop ➔ West Village
                    </p>
                  </div>

                  {/* 5. Housing Match */}
                  <div
                    onClick={() => {
                      setActiveTab("housing");
                      triggerToast("🏠 Loaded 3 verified off-campus housing matches.");
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏠</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">3 New Housing Matches</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">Explore →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      West Village 2-Bed Sublease ($925/mo) • 0.3 mi
                    </p>
                  </div>

                  {/* 6. Evening Event */}
                  <div
                    onClick={() => {
                      setActiveTab("events");
                      triggerToast("🎉 Towson Cyber Summit & Cultural Gala loaded.");
                    }}
                    className="p-2.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 hover:border-purple-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎉</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">7:00 PM • Cultural Gala</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">RSVP →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      University Union Ballrooms • Free Food & Campus XP
                    </p>
                  </div>

                  {/* 7. Volunteer Service */}
                  <div
                    onClick={() => {
                      setActiveTab("activities");
                      triggerToast("🤝 Volunteer opportunity loaded: +3.5h Tiger Record");
                    }}
                    className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🤝</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">Volunteer Opportunity</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 group-hover:underline">+3.5h Record →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      Towson Campus Green Planting Drive
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-bold">
                  <span className="text-slate-400">Synced with Canvas & Calendar</span>
                  <button
                    type="button"
                    onClick={() => setShowAskAiModal(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-black flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Ask AI for Today →</span>
                  </button>
                </div>
              </div>

              {/* LIVE FACILITY DENSITY & STUDY CROWD RADAR */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Live Campus Density
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-black">Live IoT</span>
                </div>

                <div className="space-y-2 text-xs">
                  {facilityDensities.slice(0, 3).map((fac) => (
                    <div
                      key={fac.id}
                      className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{fac.icon}</span>
                          <div>
                            <div className="font-bold leading-tight text-slate-900 dark:text-zinc-100">{fac.facilityName}</div>
                            <span className="text-[10px] text-slate-400">{fac.zoneName}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          fac.statusLevel === "Quiet"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : fac.statusLevel === "Moderate"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        }`}>
                          {fac.occupancyPercent}% ({fac.statusLevel})
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fac.occupancyPercent < 45 ? "bg-emerald-500" : fac.occupancyPercent < 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${fac.occupancyPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>✨ {fac.availableDesksOrSpots} spots open</span>
                        <span>{fac.bestStudyTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Campus Radar Mini-Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Campus Radar</h3>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black">Towson Campus Events</h1>
                <p className="text-xs text-slate-500">Official campus activities, club meetings, athletics, and student gatherings.</p>
              </div>
              <div
                onClick={() => {
                  setShowWeatherModal(true);
                  setWeatherModalTab("now");
                }}
                className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3 py-1.5 rounded-2xl cursor-pointer text-xs"
              >
                <span>{weatherReport?.conditionIcon || "☀️"}</span>
                <span className="font-bold text-sky-900 dark:text-sky-200">{weatherReport?.currentTemp ?? 82}°F {weatherReport?.conditionText || "Partly Sunny"}</span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] text-emerald-600 font-bold">Outdoor Event Friendly ✓</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                        {ev.category}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{ev.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{ev.title}</h3>
                    <p className="text-xs text-slate-500">📍 {ev.location} • ⏰ {ev.time}</p>
                    
                    {/* Atmospheric Intelligence Badge */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/40 px-2.5 py-1 rounded-xl border border-sky-100 dark:border-sky-900">
                      <span>{weatherReport?.conditionIcon || "☀️"}</span>
                      <span>Weather: {weatherReport?.currentTemp ?? 82}°F · {(ev.location || "").toLowerCase().includes("field") || (ev.location || "").toLowerCase().includes("square") ? "Outdoor Ready" : "Indoor Climate Controlled"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-slate-400">{ev.rsvpCount} Attending</span>
                    <button
                      onClick={() => handleToggleRsvp(ev.id, "GOING")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                        ev.userRsvp === "GOING"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-black font-black"
                      }`}
                    >
                      {ev.userRsvp === "GOING" ? "Going ✓" : "RSVP"}
                    </button>
                  </div>
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
        {/* TAB 6: ✉️ AXIOM CONNECT (MAIL, CALENDAR, TEAMS & WORKSPACE) */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 min-h-[820px] flex flex-col">
            <AxiomConnectWorkspace
              initialApp="mail"
              currentUserName={currentUser?.name || "Kwesi Asiedu"}
              currentUserEmail={currentUser?.studentId ? `${(currentUser.name || "kwesi").toLowerCase().replace(/\s+/g, ".")}@towson.edu` : "kwesi@expediteconsults.com"}
              currentUserRole={currentUser?.role || "Student & Lead Architect"}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: ⋯ MORE (POWERFUL APPLICATION LAUNCHER) */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 8: ⋯ MORE (POWERFUL APPLICATION LAUNCHER & SUB-SYSTEMS) */}
        {/* ========================================================================= */}
        {activeTab === "more" && (
          <div className="space-y-6">
            {/* Top Navigation Bar with Back-to-Launcher Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "launcher", label: "📱 App Launcher", icon: "🍱" },
                  { id: "connect", label: "⚡ Mail & Teams", icon: "📧" },
                  { id: "tv", label: "🎥 Towson TV & Reels", icon: "📺" },
                  { id: "career", label: "💼 Career & Jobs", icon: "👔" },
                  { id: "market", label: "🛍️ Marketplace", icon: "🛒" },
                  { id: "games", label: "🎮 Campus Games", icon: "👾" },
                  { id: "transcript", label: "🏆 Tiger Record", icon: "🎓" },
                  { id: "ai", label: "🤖 Campus AI", icon: "⚡" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setMoreSubView(sub.id as any);
                      triggerToast(`Navigated to ${sub.label}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                      moreSubView === sub.id
                        ? "bg-amber-500 text-black shadow-xs font-black"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>

              {moreSubView !== "launcher" && moreSubView !== "map" && (
                <button
                  type="button"
                  onClick={() => setMoreSubView("launcher")}
                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-slate-700 dark:text-zinc-300 font-black px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shrink-0"
                >
                  <span>← Back to Launcher</span>
                </button>
              )}
            </div>

            {/* SUB-VIEW 1: 🍱 APPLICATION LAUNCHER GRID (DEFAULT) */}
            {(moreSubView === "launcher" || !moreSubView || moreSubView === "map") && (
              <div className="space-y-6">
                {/* Launchpad Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                        TowsonSync Enterprise Suite
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                        18 Modules Active
                      </span>
                    </div>
                    <h1 className="text-2xl font-black mt-1">Application Launchpad & Campus Hub</h1>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Access academics, safe transportation, digital wallet, student media, marketplace, AI intelligence, and administrative systems.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAskAiModal(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ask AI Anything</span>
                    </button>
                  </div>
                </div>

                {/* Launchpad Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                  {[
                    { id: "ALL", label: "🍱 All Modules (18)" },
                    { id: "ACADEMICS", label: "🎓 Academics & Career (4)" },
                    { id: "SAFETY", label: "🛡️ Campus Life & Safety (5)" },
                    { id: "MEDIA", label: "🛍️ Media & Marketplace (4)" },
                    { id: "OPERATIONS", label: "🏛️ Operations & Tools (5)" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLaunchpadFilter(cat.id as any)}
                      className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                        launchpadFilter === cat.id
                          ? "bg-amber-500 text-black font-black shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* 18-Module Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    // Academics & Career
                    { id: "canvas", category: "ACADEMICS", title: "Canvas & Assignment Radar", desc: "Live deadline countdowns, grade sync, and 1-click midterm study pods.", icon: "🎓", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "action", target: "canvas" },
                    { id: "alumni", category: "ACADEMICS", title: "Alumni Mentorship Mesh", desc: "15-min coffee chats with verified alumni at T. Rowe Price, Northrop, AWS.", icon: "🤝", bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", type: "subview", target: "career" },
                    { id: "career", category: "ACADEMICS", title: "Handshake & Campus Jobs", desc: "Direct Handshake sync, paid research fellowships, and student employment.", icon: "💼", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", type: "subview", target: "career" },
                    { id: "study", category: "ACADEMICS", title: "Study Pods & Peer Match", desc: "Reserve study spaces in Cook Library & Science Complex with peers.", icon: "📚", bg: "bg-teal-500/10 text-teal-500 border-teal-500/20", type: "tab", target: "campus" },
                    
                    // Campus Life & Safety
                    { id: "wallet", category: "SAFETY", title: "Digital Tiger OneCard", desc: "Meal Swipes (14), Dining Dollars ($284.50), NFC pass & Apple Wallet.", icon: "💳", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "action", target: "wallet" },
                    { id: "safewalk", category: "SAFETY", title: "Tiger SafeWalk Escort", desc: "Virtual night escort with live companion tracking, fake calls & TUPD SOS.", icon: "🛡️", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", type: "action", target: "safewalk" },
                    { id: "density", category: "SAFETY", title: "Live Campus Density IoT", desc: "Real-time crowd heatmaps for Cook Library, Burdick Gym & Union.", icon: "📊", bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", type: "action", target: "density" },
                    { id: "weather", category: "SAFETY", title: "NOAA Campus Weather", desc: "Authoritative NWS forecasts, live Doppler radar, and severe weather alerts.", icon: "🌦️", bg: "bg-sky-500/10 text-sky-500 border-sky-500/20", type: "modal", target: "weather" },
                    { id: "311", category: "SAFETY", title: "Campus 311 Maintenance", desc: "Report campus maintenance, facilities requests, and safety concerns.", icon: "🔧", bg: "bg-slate-500/10 text-slate-500 border-slate-500/20", type: "action", target: "311" },

                    // Media & Marketplace
                    { id: "tv", category: "MEDIA", title: "Towson TV & Reels", desc: "Live streams, 60s reels, video channels, and student creator shows.", icon: "🎥", bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", type: "subview", target: "tv" },
                    { id: "market", category: "MEDIA", title: "Towson Marketplace", desc: "Official TowsonSync store, student peer buy/sell, textbooks, and merch.", icon: "🛍️", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", type: "subview", target: "market" },
                    { id: "games", category: "MEDIA", title: "Campus Games & XP", desc: "Tiger trivia championship, campus scavenger hunt, and XP leaderboard.", icon: "🎮", bg: "bg-purple-500/10 text-purple-500 border-purple-500/20", type: "subview", target: "games" },
                    { id: "transcript", category: "MEDIA", title: "Tiger Record & Passport", desc: "Verified milestone certificates, digital passport, and PDF graduation export.", icon: "🏆", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "subview", target: "transcript" },

                    // Operations & Tools
                    { id: "connect", category: "OPERATIONS", title: "Axiom Mail, Teams & Calendar", desc: "Integrated Zoho-style webmail, Outlook scheduler, and Teams WebRTC video meeting room.", icon: "⚡", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "subview", target: "connect" },
                    { id: "ai", category: "OPERATIONS", title: "Ask TowsonSync AI", desc: "Contextual intelligence assistant across schedules, dining, and maps.", icon: "🤖", bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", type: "action", target: "ai" },
                    { id: "admin", category: "OPERATIONS", title: "Administration Center", desc: "Identity verification queue, housing safety moderation, and security logs.", icon: "🏛️", bg: "bg-slate-900 text-amber-400 border-amber-500/30", type: "subview", target: "admin" },
                    { id: "map", category: "OPERATIONS", title: "Live Campus Map OS", desc: "TigerOrbit 360, indoor blueprints, GPS Tiger Ride shuttles & parking.", icon: "🗺️", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "tab", target: "map" },
                    { id: "housing", category: "OPERATIONS", title: "TUHousing Platform", desc: "Verified off-campus student apartments, roommate mesh, and 3D tours.", icon: "🏠", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", type: "tab", target: "housing" },
                    { id: "settings", category: "OPERATIONS", title: "Privacy & Ghost Mode", desc: "Customize location sharing duration, notifications, and security keys.", icon: "⚙️", bg: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", type: "action", target: "orbit" },
                  ]
                    .filter((item) => launchpadFilter === "ALL" || item.category === launchpadFilter)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.type === "modal" && item.target === "weather") {
                            setShowWeatherModal(true);
                            setWeatherModalTab("now");
                          } else if (item.type === "action" && item.target === "wallet") {
                            setShowTigerWalletModal(true);
                          } else if (item.type === "action" && item.target === "safewalk") {
                            setShowSafeWalkModal(true);
                          } else if (item.type === "action" && item.target === "canvas") {
                            if (courses[0]) setSelectedCourseForCanvas(courses[0]);
                            else triggerToast("🎓 Canvas LMS & Assignment Radar loaded.");
                          } else if (item.type === "action" && item.target === "ai") {
                            setShowAskAiModal(true);
                          } else if (item.type === "action" && item.target === "density") {
                            setActiveTab("home");
                            triggerToast("📊 Live IoT Facility Density loaded on Home dashboard.");
                          } else if (item.type === "action" && item.target === "311") {
                            setShow311Modal(true);
                          } else if (item.type === "action" && item.target === "orbit") {
                            setShowLocationSharePicker(true);
                          } else if (item.type === "subview") {
                            setMoreSubView(item.target as any);
                            triggerToast(`🚀 Launched ${item.title}`);
                          } else if (item.type === "tab") {
                            setActiveTab(item.target as any);
                            triggerToast(`🚀 Switched to ${item.title}`);
                          }
                        }}
                        className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col justify-between group space-y-3 text-left w-full hover:border-amber-500/50"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${item.bg} group-hover:scale-110 transition`}>
                              {item.icon}
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-zinc-800 w-full">
                          <span>Launch Module</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: 🎥 TOWSON TV & REELS */}
            {moreSubView === "tv" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-rose-500/30">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">Towson TV & Student Creator Studio</span>
                    <h2 className="text-2xl font-black mt-0.5">Campus Life, Sports, News & Housing Video Tours</h2>
                    <p className="text-xs text-slate-300 mt-1">Watch 60s vertical campus reels and official university broadcast channels.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("🎬 Creator Studio: Reel upload dialog ready.");
                      setShowUploadReelModal(true);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5"
                  >
                    <Film className="w-4 h-4" />
                    <span>Upload 60s Reel</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {(reels.length > 0 ? reels : initialCampusReels).map((reel, idx) => (
                    <div
                      key={reel.id}
                      onClick={() => {
                        setCurrentReelIndex(idx);
                        triggerToast(`🎬 Playing Reel: ${reel.title}`);
                      }}
                      className="bg-black rounded-3xl overflow-hidden shadow-xl border-2 border-slate-800 relative group cursor-pointer aspect-[9/14] flex flex-col justify-between p-4"
                    >
                      <img src={reel.thumbnailUrl} alt={reel.title} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500" />
                      <div className="relative z-10 flex justify-between">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          {reel.category}
                        </span>
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ▶ {reel.viewsCount?.toLocaleString() || "1.2K"}
                        </span>
                      </div>

                      <div className="relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-3 rounded-2xl space-y-1 text-white">
                        <div className="text-xs font-black">{reel.creatorName}</div>
                        <p className="text-xs leading-tight line-clamp-2">{reel.title}</p>
                        <span className="text-[10px] text-slate-300 block">🎵 {reel.audioTrack}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: 💼 CAREER & INTERNSHIPS */}
            {/* SUB-VIEW 3: 💼 CAREER & INTERNSHIPS MESH + ALUMNI MENTORS */}
            {moreSubView === "career" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-amber-500/30">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Towson Career, Research & Alumni Mesh</span>
                    <h2 className="text-2xl font-black mt-0.5">Verified Student Opportunities & Alumni Mentorship</h2>
                    <p className="text-xs text-slate-300 mt-1">Direct synchronization with Handshake, TU Career Center, and verified corporate alumni.</p>
                  </div>

                  {/* Career Filter Switcher */}
                  <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCareerSubFilter("jobs")}
                      className={`px-3 py-1.5 rounded-xl transition ${careerSubFilter === "jobs" ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:text-white"}`}
                    >
                      💼 Jobs & Research (4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCareerSubFilter("mentors")}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${careerSubFilter === "mentors" ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:text-white"}`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Alumni Mentors ({alumniMentors.length})</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: JOBS & RESEARCH */}
                {careerSubFilter === "jobs" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "job-1",
                        title: "Undergraduate AI Cyber Defense Research Fellow",
                        employer: "TU Autonomous Security Lab (ASSL)",
                        jobType: "Paid Campus Research",
                        location: "Science Complex Rm 304",
                        wage: "$22.50 / hr + 3 Academic Credits",
                        desc: "Develop automated vulnerability scanning scripts and LLM honeypots under Dr. Catherine Hayes.",
                        deadline: "April 15, 2026",
                      },
                      {
                        id: "job-2",
                        title: "IT Support & Cloud Infrastructure Assistant",
                        employer: "Towson University Office of Technology (OTS)",
                        jobType: "Student Employment",
                        location: "Cook Library Lower Level",
                        wage: "$18.00 / hr",
                        desc: "Assist students and faculty with TU network access, dual-factor authentication, and hardware diagnostics.",
                        deadline: "May 01, 2026",
                      },
                      {
                        id: "job-3",
                        title: "Student Community Engagement Lead",
                        employer: "Towson Student Affairs",
                        jobType: "Part-Time",
                        location: "University Union Rm 204",
                        wage: "$17.50 / hr",
                        desc: "Coordinate campus-wide volunteer drives, service days, and official Tiger Record certifications.",
                        deadline: "April 30, 2026",
                      },
                      {
                        id: "job-4",
                        title: "Cyber Threat Intelligence Intern",
                        employer: "T. Rowe Price / Baltimore Cyber Center",
                        jobType: "Summer Corporate Internship",
                        location: "Downtown Baltimore (Hybrid)",
                        wage: "$32.00 / hr",
                        desc: "Analyze real-time threat vectors, build incident playbooks, and participate in red/blue team simulations.",
                        deadline: "March 25, 2026",
                      },
                    ].map((job) => (
                      <div key={job.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{job.employer}</span>
                            <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">{job.jobType}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{job.title}</h3>
                          <p className="text-xs text-slate-500">📍 {job.location} • 💵 {job.wage}</p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{job.desc}</p>
                          <span className="text-[10px] text-slate-400 font-semibold block">⏰ Deadline: {job.deadline}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => triggerToast(`💼 Application submitted for ${job.title} at ${job.employer} using your verified Tiger Record!`)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-xl text-xs shadow-md transition"
                        >
                          1-Click Apply with Tiger Record
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: ALUMNI MENTORS */}
                {careerSubFilter === "mentors" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {alumniMentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{mentor.name}</h4>
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">{mentor.currentRole}</span>
                              <span className="text-[11px] text-slate-500 font-semibold block">🏢 {mentor.company} • Class of '{(mentor?.gradYear || "2024").toString().slice(-2)}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            {mentor.bio}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {mentor.matchedSkills.map((sk) => (
                              <span key={sk} className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => triggerToast(`☕ Coffee Chat requested with ${mentor.name} (${mentor.company})! They will connect via Tiger Message.`)}
                          className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black font-black py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Request 15-Min Coffee Chat</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 4: 🛍️ MARKETPLACE & OFFICIAL STORE */}
            {moreSubView === "market" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-emerald-500/30">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Towson Student & Official Store</span>
                    <h2 className="text-2xl font-black mt-0.5">Buy, Sell & Explore Verified Campus Products</h2>
                    <p className="text-xs text-slate-300 mt-1">Official Towson University merchandise, textbooks, electronics, and student creator gear.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("🛍️ Marketplace Lister: Fill out your listing details.");
                      setShowListMarketItemModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Sell an Item / Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(marketItems.length > 0 ? marketItems : initialMarketplaceItems).map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-36 rounded-2xl overflow-hidden bg-slate-800 relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            ${item.price}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{item.condition || "Verified Item"}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerToast(`🛒 Connected with seller for "${item.title}" ($${item.price})!`)}
                        className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition"
                      >
                        Contact Seller (${item.price})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: 🎮 CAMPUS GAMES & TRIVIA */}
            {moreSubView === "games" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Tiger Trivia Championship & Campus XP</h2>
                    <p className="text-xs text-slate-500">Test your Towson University knowledge and earn points toward your Tiger Record.</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 px-4 py-2 rounded-2xl border border-amber-200 font-mono text-xs font-black text-amber-700 dark:text-amber-300">
                    ⭐ Campus XP Score: {triviaScore * 50} pts
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border space-y-4 max-w-xl mx-auto">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Question {activeTriviaQuestionIdx + 1} of {(games[0]?.questions || initialCampusGames[0]?.questions || []).length}</span>
                    <span>Category: TU Traditions</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                    {(games[0]?.questions || initialCampusGames[0]?.questions)?.[activeTriviaQuestionIdx]?.question || "In what year was Towson University originally founded as Maryland State Normal School?"}
                  </h3>

                  <div className="space-y-2">
                    {((games[0]?.questions || initialCampusGames[0]?.questions)?.[activeTriviaQuestionIdx]?.options || ["1866", "1912", "1935", "1976"]).map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTriviaSelectedOption(i);
                          const correctIdx = (games[0]?.questions || initialCampusGames[0]?.questions)?.[activeTriviaQuestionIdx]?.correctIndex ?? 0;
                          if (i === correctIdx) {
                            setTriviaScore((prev) => prev + 1);
                            triggerToast("🎉 Correct answer! +50 Campus XP");
                          } else {
                            triggerToast("❌ Incorrect! Try the next question.");
                          }
                          setTimeout(() => {
                            const totalQ = (games[0]?.questions || initialCampusGames[0]?.questions)?.length || 5;
                            if (activeTriviaQuestionIdx + 1 < totalQ) {
                              setActiveTriviaQuestionIdx((prev) => prev + 1);
                              setTriviaSelectedOption(null);
                            } else {
                              setTriviaGameOver(true);
                              triggerToast(`🏆 Trivia completed! Final score: ${(triviaScore + (i === correctIdx ? 1 : 0)) * 50} XP`);
                            }
                          }, 1000);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          triviaSelectedOption === i
                            ? "bg-amber-500 text-black border-amber-500 font-black"
                            : "bg-white dark:bg-zinc-900 hover:border-amber-500 border-slate-200 dark:border-zinc-700"
                        }`}
                      >
                        <span>{opt}</span>
                        <span>{triviaSelectedOption === i ? "✓" : "→"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 6: 🏆 EXPERIENCE TRANSCRIPT & CAMPUS PASSPORT */}
            {moreSubView === "transcript" && (
              <div className="space-y-6">
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
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Official Service Certificate</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-100 dark:border-amber-900">
                      <span className="text-2xl font-black text-amber-600 block leading-none">{currentUser.volunteerHoursLogged ?? 48} hrs</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Volunteer Hours</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                      <span className="text-2xl font-black text-slate-900 dark:text-zinc-100 block leading-none">{currentUser.eventsAttendedCount ?? 12}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Events Attended</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                      <span className="text-2xl font-black text-emerald-600 block leading-none">{(currentUser.leadershipRoles || []).length || 2}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Leadership Roles</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border">
                      <span className="text-2xl font-black text-purple-600 block leading-none">{(currentUser.achievements || []).length || 5}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Honor Badges</span>
                    </div>
                  </div>

                  {/* 🎓 CAMPUS PASSPORT CHECKLIST */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎓</span>
                        <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Official Towson Campus Passport</h3>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200">
                        5 of 7 Milestones Completed (71%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {[
                        { title: "New Student Orientation Completed", status: "VERIFIED", date: "Aug 2024", icon: "✓" },
                        { title: "Joined Verified Student Org (ASA Towson)", status: "VERIFIED", date: "Sep 2024", icon: "✓" },
                        { title: "Attended Spring Career & Internship Fair", status: "VERIFIED", date: "Feb 2026", icon: "✓" },
                        { title: "Logged 40+ Community Service Hours", status: "VERIFIED", date: "Mar 2026", icon: "✓" },
                        { title: "Participated in Cyber Security Hackathon", status: "VERIFIED", date: "Apr 2026", icon: "✓" },
                        { title: "Complete Leadership Certificate Academy", status: "IN_PROGRESS", date: "Due May 2026", icon: "○" },
                        { title: "Attend Senior Alumni Networking Gala", status: "UPCOMING", date: "Fall 2026", icon: "○" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            item.status === "VERIFIED"
                              ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                              : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              item.status === "VERIFIED" ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-500"
                            }`}>
                              {item.icon}
                            </div>
                            <span className="font-bold">{item.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 7: 🤖 CAMPUS AI ASSISTANT */}
            {moreSubView === "ai" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-black text-xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-base">TowsonSync Campus AI Assistant</h3>
                    <p className="text-xs text-slate-500">Ask about dining menus, class schedules, housing, weather, and campus events.</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl max-h-96 overflow-y-auto text-xs">
                  {aiChatHistory.map((m, i) => (
                    <div key={i} className={`p-3.5 rounded-2xl max-w-[85%] ${m.role === "user" ? "bg-amber-500 text-black ml-auto font-semibold" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200"}`}>
                      {m.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendAiPrompt} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Towson Campus AI anything..."
                    value={aiChatQuery}
                    onChange={(e) => setAiChatQuery(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button type="submit" className="bg-amber-500 text-black font-black px-5 py-2.5 rounded-2xl text-xs shadow-md">
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* SUB-VIEW 8: 🛡️ TOWSONSYNC ADMINISTRATION CENTER */}
            {moreSubView === "admin" && (
              <div className="space-y-6">
                {/* Admin Header Banner */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-2xl border border-indigo-500/40 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                          🛡️ TowsonSync Security & Operations Center
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                          ● ALL SYSTEMS HEALTHY
                        </span>
                      </div>
                      <h2 className="text-2xl font-black">University Administration & Moderation Console</h2>
                      <p className="text-xs text-slate-300">
                        Authenticated as: <strong>{currentUser.name}</strong> ({currentUser.studentId} • {currentUser.major})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerToast("🔄 Synchronized live campus records with PeopleSoft / TU OneCard & Canvas SIS.");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync University SIS</span>
                      </button>
                    </div>
                  </div>

                  {/* High-Level Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Users</span>
                      <span className="text-xl font-black text-white">22,410</span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">98.4% ID Verified</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Queue</span>
                      <span className="text-xl font-black text-amber-400">{adminVerifications.filter(v => v.status === "PENDING").length} Pending</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Avg Review: 18 mins</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">TUPD Blue Lights</span>
                      <span className="text-xl font-black text-emerald-400">24 / 24</span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">100% Operational</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Server API Latency</span>
                      <span className="text-xl font-black text-sky-400">{adminSystemHealth.apiLatencyMs}ms</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{adminSystemHealth.uptimePercent}% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Admin Sub-Nav Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                  {[
                    { id: "verifications", label: `👥 User Verifications (${adminVerifications.filter(v => v.status === "PENDING").length})` },
                    { id: "housing", label: "🏠 Housing Provider Moderation (1)" },
                    { id: "marketplace", label: "🛍️ Marketplace Escrow & Reports" },
                    { id: "events", label: "📅 Organization & Event Charters" },
                    { id: "security", label: "🔒 Security & Audit Trail" },
                    { id: "health", label: "💻 Telemetry & IoT Status" },
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setAdminActiveSubTab(subTab.id as any)}
                      className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
                        adminActiveSubTab === subTab.id
                          ? "bg-indigo-600 text-white font-black shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: USER & ID VERIFICATION QUEUE */}
                {adminActiveSubTab === "verifications" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                        Identity Verification Requests ({adminVerifications.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminVerifications((prev) => prev.map(v => ({ ...v, status: "APPROVED" })));
                          triggerToast("✅ Approved all pending verification requests.");
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Approve All Pending →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminVerifications.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={req.idCardImageUrl}
                                  alt={req.applicantName}
                                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{req.applicantName}</h4>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                      {req.type}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500 block">{req.email}</span>
                                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold block">{req.studentOrFacultyId} • {req.departmentOrMajor}</span>
                                </div>
                              </div>

                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                req.status === "APPROVED"
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              }`}>
                                {req.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">
                              Submitted {req.submittedAt} with verified official TU document upload.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminVerifications((prev) => prev.map(v => v.id === req.id ? { ...v, status: "APPROVED" } : v));
                                triggerToast(`✅ Approved ${req.applicantName}. Verified badge issued.`);
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs transition"
                            >
                              Approve Badge
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminVerifications((prev) => prev.map(v => v.id === req.id ? { ...v, status: "REJECTED" } : v));
                                triggerToast(`❌ Rejected verification for ${req.applicantName}. Notification sent.`);
                              }}
                              className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: HOUSING PROVIDER MODERATION */}
                {adminActiveSubTab === "housing" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                      Off-Campus Housing Safety & Landlord Verification
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                            Pending Safety Inspection
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100 mt-1">The York Towson Residences • 4 Bed / 4 Bath Penthouse</h4>
                          <span className="text-xs text-slate-500">Provider: The York Towson Property Management (License #MD-9042)</span>
                        </div>
                        <span className="text-base font-black text-emerald-600">$1,150 / mo</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        Submitted safety certifications: Fire Marshal Approval 2026, Towson Shuttle Route Direct Stop, Secure RFID Fob entry.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => triggerToast("✅ Housing listing approved & verified on TUHousing live map.")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs"
                        >
                          Approve Housing Listing
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerToast("📋 Requested additional lease safety documentation.")}
                          className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                        >
                          Request Documents
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: MARKETPLACE MODERATION */}
                {adminActiveSubTab === "marketplace" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                      Peer-to-Peer Marketplace Moderation & Escrow Safety
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Flagged Item: "TI-84 Plus CE Graphing Calculator" ($75)</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">Seller Verified</span>
                      </div>
                      <p className="text-xs text-slate-500">Report Reason: Price discrepancy. Automated AI Scan resolved: Price conforms to fair campus market standard.</p>
                      <button
                        type="button"
                        onClick={() => triggerToast("🛡️ Listing verified & cleared of flags.")}
                        className="bg-indigo-600 text-white font-black px-3 py-1.5 rounded-xl text-xs"
                      >
                        Clear Flag & Keep Active
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: EVENT & CHARTER APPROVALS */}
                {adminActiveSubTab === "events" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                      Student Organization Event & Room Booking Charters
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Towson Spring Hackathon & Cyber CTF</h4>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">Requires Union Rm 204</span>
                      </div>
                      <p className="text-xs text-slate-500">Host: Towson Cybersecurity Club • Expected Attendance: 250 students • Budget: $1,500 SGA Grant</p>
                      <button
                        type="button"
                        onClick={() => triggerToast("🎉 Event charter approved! Union Rm 204 booked on Campus Calendar.")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs"
                      >
                        Approve Event & Room Booking
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: SECURITY AUDIT LOGS */}
                {adminActiveSubTab === "security" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                        Real-Time Platform Security & Audit Trail
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">LIVE STREAMING</span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {adminAuditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              log.severity === "CRITICAL" ? "bg-rose-500 animate-ping" : log.severity === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-zinc-100">{log.eventType}</span>
                              <span className="text-slate-400 block text-[11px] font-sans">{log.details}</span>
                            </div>
                          </div>

                          <div className="text-right text-[10px] text-slate-400">
                            <span>{log.actor}</span>
                            <span className="block">{log.timestamp} • {log.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: SERVER HEALTH & IOT TELEMETRY */}
                {adminActiveSubTab === "health" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                      TowsonSync Infrastructure & Geographic IoT Telemetry
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Database Engine</span>
                        <div className="text-base font-black text-slate-900 dark:text-zinc-100">{adminSystemHealth.databaseSyncStatus}</div>
                        <span className="text-[10px] text-emerald-500 font-bold block">Zero Replication Lag</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Active WebSockets</span>
                        <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{(adminSystemHealth?.activeSessionsCount || 1420).toLocaleString()} Connected</div>
                        <span className="text-[10px] text-slate-400 block">Encrypted TLS 1.3</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Campus Blue Light Network</span>
                        <div className="text-base font-black text-emerald-600">{adminSystemHealth?.tupdBeaconHealth || "100% Operational"}</div>
                        <span className="text-[10px] text-emerald-500 font-bold block">TUPD Dispatch Linked</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 9: ⚡ AXIOM CONNECT (MAIL, CALENDAR & TEAMS SUITE) */}
            {moreSubView === "connect" && (
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 min-h-[750px] flex flex-col">
                <AxiomConnectWorkspace
                  initialApp="mail"
                  currentUserName={currentUser?.name || "Kwesi Asiedu"}
                  currentUserEmail={currentUser?.studentId ? `${(currentUser.name || "kwesi").toLowerCase().replace(/\s+/g, ".")}@towson.edu` : "kwesi@expediteconsults.com"}
                  currentUserRole={currentUser?.role || "Student & Lead Architect"}
                  onBackToCampus={() => setMoreSubView("launcher")}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* FLOATING ACTION TRIGGER: ✨ ASK TOWSONSYNC AI */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setShowAskAiModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:scale-105 text-white p-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs border border-white/20 transition group"
        title="Ask TowsonSync AI anything about your classes, housing, schedule, or campus"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition duration-300" />
        <span>Ask TowsonSync</span>
      </button>

      {/* ========================================================================= */}
      {/* MODAL 1: ✨ ASK TOWSONSYNC AI ASSISTANT MODAL */}
      {/* ========================================================================= */}
      {showAskAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Ask TowsonSync AI</h3>
                  <p className="text-[11px] text-slate-500">Autonomous context engine for {currentUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAskAiModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Context Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "⏳ What assignments are due today?",
                "📚 Quiet study spots at Cook Library?",
                "🚌 When is the next Tiger Ride shuttle?",
                "🌦️ What's the weather advisory?",
                "💼 Find cybersecurity research jobs",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setAiChatQuery(chip);
                    setAiChatHistory((prev) => [
                      ...prev,
                      { role: "user", text: chip },
                      {
                        role: "ai",
                        text: chip.includes("assignments")
                          ? "Here are your upcoming Canvas deadlines:\n1. Lab 3: Virtual Memory Pager (COSC 421) — Due in 6 hours (100 pts)\n2. Midterm Sprint Demo (COSC 484) — Due in 3 days\nWould you like to open the Study Pod for COSC 421?"
                          : chip.includes("Cook Library")
                          ? "Albert S. Cook Library is currently at 38% capacity (Quiet). 3rd floor quiet pods and collaborative tables currently have 64 open seats."
                          : chip.includes("shuttle")
                          ? "Tiger Ride Shuttle #14 (Gold Route) is currently 2 minutes away from Cook Library stop, heading to West Village."
                          : "Here is what TowsonSync recommends based on your profile and verified courses.",
                      },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 text-[11px] font-bold transition border border-slate-200/60 dark:border-zinc-700/60"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl max-h-80 overflow-y-auto text-xs">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white ml-auto font-bold"
                      : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!aiChatQuery.trim()) return;
                const userQ = aiChatQuery;
                setAiChatQuery("");
                setAiChatHistory((prev) => [
                  ...prev,
                  { role: "user", text: userQ },
                  {
                    role: "ai",
                    text: `TowsonSync AI responded to "${userQ}": Everything is synchronized across your courses, housing, shuttle schedules, and campus map.`,
                  },
                ]);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask anything about classes, rooms, dining, or events..."
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={!aiChatQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-2xl text-xs shadow-md transition"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 🎓 OFFICIAL TIGER RECORD & PASSPORT GRADUATION EXPORT */}
      {/* ========================================================================= */}
      {showTigerRecordExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Official TowsonSync Campus Record</h3>
                  <p className="text-xs text-slate-500">Verified Digital Portfolio & Graduation Passport</p>
                </div>
              </div>
              <button
                onClick={() => setShowTigerRecordExportModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800/80 dark:to-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-zinc-100">{currentUser.name}</h4>
                  <span className="text-[11px] text-slate-500">B.S. {currentUser.major} • Class of {currentUser.gradYear}</span>
                </div>
                <span className="font-mono text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">
                  VERIFIED SEAL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200/60 dark:border-zinc-700">
                <div>
                  <span className="font-black text-sm text-slate-900 dark:text-zinc-100">{currentUser.volunteerHoursLogged}h</span>
                  <span className="text-[9px] text-slate-400 block">Service Hours</span>
                </div>
                <div>
                  <span className="font-black text-sm text-slate-900 dark:text-zinc-100">{currentUser.eventsAttendedCount}</span>
                  <span className="text-[9px] text-slate-400 block">Campus Events</span>
                </div>
                <div>
                  <span className="font-black text-sm text-emerald-600 font-mono">5 / 7 ✓</span>
                  <span className="text-[9px] text-slate-400 block">Milestones</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerToast("📄 Generating Official Towson University Verified Digital PDF Portfolio...");
                setTimeout(() => {
                  triggerToast("✅ Download ready: TowsonSync_CampusRecord_KwesiAsiedu.pdf");
                  setShowTigerRecordExportModal(false);
                }, 1500);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Digital Graduation Record (PDF)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
