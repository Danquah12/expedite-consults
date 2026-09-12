"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertOctagon, AlertTriangle, ArrowRight, Award, BarChart3, Battery, BatteryCharging, Bell, BookOpen, Bookmark, Bot, Briefcase, Building, Building2, Bus, Calendar, CalendarCheck, CalendarDays, Camera, Car, Check, CheckCircle2, CheckSquare, ChevronDown, ChevronRight, ChevronUp, Clock, Cloud, CloudLightning, CloudRain, CloudSun, Coffee, Compass, Copy, CreditCard, Crosshair, Crown, Database, DollarSign, Download, Droplets, ExternalLink, Eye, EyeOff, FileText, Film, Filter, Flag, Flame, Footprints, Gamepad2, Gauge, Globe, GraduationCap, Heart, HelpCircle, Home, Info, Laptop, Layers, LogOut, Mail, Map as MapIcon, MapPin, MapPinned, MessageCircle, MessageSquare, Microscope, Moon, Music, Navigation, Pause, PauseCircle, PhoneCall, Pizza, Play, PlayCircle, Plus, Printer, QrCode, Radio, RefreshCw, Rocket, RotateCcw, Route, Search, Send, Settings, Share2, Shield, ShieldAlert, ShieldCheck, ShoppingBag, Siren, Sliders, Sparkles, Star, Sun, Sunrise, Sunset, Tag, Target, Thermometer, Ticket, TrendingUp, Trophy, Umbrella, UserCheck, UserPlus, Users, Video, Volume2, Vote, Wallet, Wifi, Wind, Wrench, X, Zap
} from "lucide-react";

import {
  CampusWeatherReport,
  HourlyForecastPoint,
  DailyForecastDay,
  NWSWeatherAlert,
  CampusOperatingStatus,
  WeatherNotificationPreferences,
  initialHopkinsMainWeather,
  defaultWeatherPreferences,
} from "@/lib/hopkins-weather-data";

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
  HopkinsBuilding,
  HopkinsFloor,
  HopkinsRoom,
  LocationCircle,
  CircleMember,
  HopkinsShuttle,
  HopkinsParkingGarage,
  SafetyBeacon,
  ScavengerHuntCheckpoint,
  NavigationStep,
  HousingListing,
  RoommateProfile,
  HousingTourBooking,
  HousingMaintenanceTicket,
  JCardPass,
  LiveFacilityDensity,
  SafeWalkSession,
  AlumniMentor,
  CourseDeliverable,
  defaultCurrentUser,
  defaultNotificationPreferences,
  CirclePlaceAlert,
  DrivingSafetyScore,
  MemberLocationTimelineEntry,
  initialHopkinsPlaces,
  initialHopkinsBuildings,
  initialHopkinsCircles,
  initialHopkinsShuttles,
  initialHopkinsParking,
  initialHopkinsSafetyBeacons,
  initialHopkinsScavengerCheckpoints,
  initialHousingListings,
  initialRoommateProfiles,
  initialHousingTours,
  initialHousingMaintenanceTickets,
  initialJCardPass,
  initialFacilityDensities,
  initialSafeWalkSession,
  initialAlumniMentors,
  sampleHopkinsRoute,
  UserRole,
  initialCampusPersonas,
  AdminVerificationRequest,
  initialAdminVerifications,
  AdminSecurityAuditLog,
  initialAdminAuditLogs,
  AdminSystemHealth,
  initialAdminSystemHealth,
} from "@/lib/hopkins-data";

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
  loadHopkinsBuildings,
  saveHopkinsBuildings,
  loadHopkinsCircles,
  saveHopkinsCircles,
  loadHopkinsShuttles,
  saveHopkinsShuttles,
  loadHopkinsParking,
  saveHopkinsParking,
  loadHopkinsSafetyBeacons,
  saveHopkinsSafetyBeacons,
  loadHopkinsScavengerCheckpoints,
  saveHopkinsScavengerCheckpoints,
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
} from "@/lib/hopkins-storage";

import GlobalCopilotModal from "@/components/global-copilot/GlobalCopilotModal";
import { CopilotAction } from "@/lib/global-copilot-engine";

export default function CampusSyncApp() {
  const router = useRouter();

  // Global Copilot Modal State
  const [showGlobalCopilot, setShowGlobalCopilot] = useState(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string | undefined>(undefined);

  const handlePerformCopilotAction = (action: CopilotAction) => {
    if (action.tab) {
      setActiveTab(action.tab);
    }
    if (action.subView) {
      setMoreSubView(action.subView as any);
    }
    if (action.modal === "wallet") {
      setShowJCardModal(true);
    } else if (action.modal === "weather") {
      setShowWeatherModal(true);
    } else if (action.modal === "navigation") {
      setShowNavigationRouteModal(true);
    }
    triggerToast(`⚡ Navigated via AI Copilot: ${action.label}`);
  };

  // Primary Navigation
  const [activeTab, setActiveTab] = useState<
    "home" | "map" | "housing" | "campus" | "organizations" | "events" | "activities" | "messages" | "more"
  >("home");

  // More Sub-views
  const [moreSubView, setMoreSubView] = useState<
    "map" | "transcript" | "reels" | "games" | "opportunities" | "peermatch" | "studypods" | "media" | "marketplace" | "ai" | "admin"
  >("map");

  // Multi-Campus Switcher (Johns Hopkins University (JHU) Flagship + Campuses)
  const [selectedCampus, setSelectedCampus] = useState<"Johns Hopkins University Main Campus" | "East Baltimore Medical Campus (JHH & Bloomberg)" | "Downtown Johns Hopkins University Plaza">("Johns Hopkins University Main Campus");

  // Map Engine & Location Sharing State
  const [hopkinsBuildings, setHopkinsBuildings] = useState<HopkinsBuilding[]>(initialHopkinsBuildings);
  const [hopkinsCircles, setHopkinsCircles] = useState<LocationCircle[]>(initialHopkinsCircles);
  const [hopkinsShuttles, setHopkinsShuttles] = useState<HopkinsShuttle[]>(initialHopkinsShuttles);
  const [hopkinsParking, setHopkinsParking] = useState<HopkinsParkingGarage[]>(initialHopkinsParking);
  const [hopkinsSafetyBeacons, setHopkinsSafetyBeacons] = useState<SafetyBeacon[]>(initialHopkinsSafetyBeacons);
  const [hopkinsScavenger, setHopkinsScavenger] = useState<ScavengerHuntCheckpoint[]>(initialHopkinsScavengerCheckpoints);

  // HopkinsHousing & Off-Campus Platform State
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
  const [weatherReport, setWeatherReport] = useState<CampusWeatherReport>(initialHopkinsMainWeather);
  const [weatherPrefs, setWeatherPrefs] = useState<WeatherNotificationPreferences>(defaultWeatherPreferences);
  const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false);
  const [weatherModalTab, setWeatherModalTab] = useState<"now" | "hourly" | "daily" | "radar" | "alerts" | "settings">("now");

  // Map Filters & View Modes
  const [mapLayerFilter, setMapLayerFilter] = useState<"ALL" | "BUILDINGS" | "CIRCLES" | "SHUTTLES" | "PARKING" | "SAFETY" | "SCAVENGER" | "HOUSING" | "WEATHER" | "FESTIVAL">("ALL");
  const [selectedBuildingModal, setSelectedBuildingModal] = useState<HopkinsBuilding | null>(null);
  const [selectedBuildingFloor, setSelectedBuildingFloor] = useState<number>(3);
  const [selectedCircle, setSelectedCircle] = useState<LocationCircle | null>(null);
  const [selectedCircleId, setSelectedCircleId] = useState<string>("circle-cyber");
  const [mapCartoMode, setMapCartoMode] = useState<"carto" | "satellite" | "night">("carto");
  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState<string>("");
  const [volunteerCategoryFilter, setVolunteerCategoryFilter] = useState<string>("ALL");
  const [volunteerSubTab, setVolunteerSubTab] = useState<"discover" | "myshifts" | "partners" | "leaderboard">("discover");
  const [campusHubSubTab, setCampusHubSubTab] = useState<"buildings" | "dining" | "library" | "shuttles" | "parking" | "facilities">("buildings");
  const [buildingSearchQuery, setBuildingSearchQuery] = useState<string>("");
  const [buildingCategoryFilter, setBuildingCategoryFilter] = useState<string>("ALL");
  const [selectedDiningVenue, setSelectedDiningVenue] = useState<any | null>(null);
  const [selectedLibraryFloor, setSelectedLibraryFloor] = useState<number>(2);
  const [reservedPodId, setReservedPodId] = useState<string | null>(null);
  const [selectedVolunteerModal, setSelectedVolunteerModal] = useState<VolunteerActivity | null>(null);
  const [showLogHoursModal, setShowLogHoursModal] = useState<boolean>(false);
  const [registeredShiftIds, setRegisteredShiftIds] = useState<string[]>(["vol-1"]);
  const [logHoursForm, setLogHoursForm] = useState({
    activityTitle: "Campus Food Drive & Baltimore Pantry Distribution",
    organization: "Johns Hopkins University Student Community Service Council",
    hours: 4.0,
    date: "2026-03-08",
    supervisorEmail: "service-learning@hopkins.edu",
    reflection: "Helped sort 3,000 lbs of food supplies and distributed 140 family grocery packages to commuter students and local food pantries.",
  });
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(1);
  const [selectedLife360Member, setSelectedLife360Member] = useState<CircleMember | null>(null);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);
  const [showPlaceAlertsModal, setShowPlaceAlertsModal] = useState<boolean>(false);
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number>(3);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState<boolean>(false);
  const [showJoinCircleModal, setShowJoinCircleModal] = useState<boolean>(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState<boolean>(false);
  const [inviteCodeInput, setInviteCodeInput] = useState<string>("");
  const [newCircleName, setNewCircleName] = useState<string>("");
  const [newCircleCategory, setNewCircleCategory] = useState<LocationCircle["category"]>("Club");
  const [newCircleIcon, setNewCircleIcon] = useState<string>("🛡️");
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState<boolean>(true);
  const [placesList, setPlacesList] = useState<CirclePlaceAlert[]>(initialHopkinsPlaces);
  const [newPlaceName, setNewPlaceName] = useState<string>("");
  const [newPlaceIcon, setNewPlaceIcon] = useState<string>("📍");
  const [newPlaceRadius, setNewPlaceRadius] = useState<number>(100);
  const [activeTrajectoryMemberId, setActiveTrajectoryMemberId] = useState<string | null>(null);

  // Active circle computation
  const activeCircle = hopkinsCircles.find((c) => c.id === selectedCircleId) || hopkinsCircles[0] || initialHopkinsCircles[0];

  // Live Movement Simulation Effect
  useEffect(() => {
    if (!isSimulatingMovement) return;

    const simulationWaypoints: Record<string, { x: number; y: number; building: string; room: string; speed: number; type: "walking" | "driving" }[]> = {
      "m-liam": [
        { x: 62, y: 36, building: "Brody Learning Commons & Milton S. Eisenhower Library", room: "Lab 304", speed: 0, type: "walking" },
        { x: 56, y: 40, building: "University Mall Walkway", room: "Near Devilbiss Hall", speed: 3.2, type: "walking" },
        { x: 48, y: 48, building: "Albert S. PAGAC Academic Commons", room: "Commons Study Pod", speed: 2.8, type: "walking" },
        { x: 42, y: 54, building: "Red Square", room: "North Plaza", speed: 3.1, type: "walking" },
        { x: 38, y: 58, building: "Charles Commons (GSU)", room: "Food Court", speed: 1.5, type: "walking" },
      ],
      "m-maya": [
        { x: 50, y: 72, building: "Ralph S. O'Connor Center for Recreation & Well-Being (PAC) & Rec", room: "Fitness Floor", speed: 0, type: "walking" },
        { x: 45, y: 65, building: "Center for the Arts", room: "Atrium", speed: 3.0, type: "walking" },
        { x: 38, y: 58, building: "Charles Commons (GSU)", room: "Blue Jay Lounge", speed: 2.4, type: "walking" },
        { x: 48, y: 48, building: "Albert S. PAGAC Academic Commons", room: "2nd Floor Stacks", speed: 2.9, type: "walking" },
      ],
      "m-tyler": [
        { x: 82, y: 22, building: "University Village", room: "Apt 304", speed: 0, type: "driving" },
        { x: 60, y: 20, building: "Johns Hopkins Universitytown Blvd", room: "In Transit", speed: 24.5, type: "driving" },
        { x: 30, y: 35, building: "Wayne Street", room: "In Transit", speed: 28.0, type: "driving" },
        { x: 26, y: 76, building: "South Parking Garage", room: "Level 2 Bay C", speed: 8.5, type: "driving" },
      ],
      "m-kwesi": [
        { x: 48, y: 48, building: "Albert S. PAGAC Academic Commons", room: "Commons Lounge", speed: 0, type: "walking" },
        { x: 46, y: 50, building: "Red Square", room: "Clock Tower", speed: 2.5, type: "walking" },
        { x: 38, y: 58, building: "Charles Commons (GSU)", room: "SGA Tech Suite", speed: 3.1, type: "walking" },
        { x: 62, y: 36, building: "Brody Learning Commons & Milton S. Eisenhower Library", room: "Cybersecurity Lab", speed: 3.4, type: "walking" },
      ],
    };

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setHopkinsCircles((prevCircles) =>
        prevCircles.map((circle) => ({
          ...circle,
          members: circle.members.map((member) => {
            const waypoints = simulationWaypoints[member.id];
            if (!waypoints || waypoints.length === 0) return member;
            const targetIdx = step % waypoints.length;
            const target = waypoints[targetIdx];

            // Check geofence intersections
            placesList.forEach((place) => {
              const dist = Math.hypot(target.x - place.coordinates.x, target.y - place.coordinates.y);
              if (dist < 8 && Math.random() > 0.65) {
                triggerToast(`🔔 Place Alert: ${member.name.split(" ")[0]} arrived at ${place.placeName}!`);
              }
            });

            return {
              ...member,
              x: target.x,
              y: target.y,
              currentBuilding: target.building,
              exactRoom: target.room,
              speedMph: target.speed,
              movementType: target.type,
              lastUpdated: "Just now",
              batteryPercent: Math.max(12, Math.round((member.batteryPercent - (member.isCharging ? -0.5 : 0.2)) * 10) / 10),
            };
          }),
        }))
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingMovement, placesList]);

  // SOS Emergency Timer Effect
  useEffect(() => {
    let timer: any;
    if (showSOSModal && sosCountdown > 0 && !sosActive) {
      timer = setTimeout(() => {
        setSosCountdown((c) => {
          if (c <= 1) {
            setSosActive(true);
            triggerToast("🚨 EMERGENCY SOS BROADCASTED to all Circle Members & JHUPD Dispatch (410-704-4444)!");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showSOSModal, sosCountdown, sosActive]);
  const [selectedSafetyBeacon, setSelectedSafetyBeacon] = useState<SafetyBeacon | null>(null);
  const [showNavigationRouteModal, setShowNavigationRouteModal] = useState<boolean>(false);
  const [activeNavigationRoute, setActiveNavigationRoute] = useState<NavigationStep[]>(sampleHopkinsRoute);
  const [isSafetyModeActive, setIsSafetyModeActive] = useState<boolean>(false);
  const [isFestivalModeActive, setIsFestivalModeActive] = useState<boolean>(false);
  const [userLocationSharingTimer, setUserLocationSharingTimer] = useState<string | null>(null);
  const [showLocationSharePicker, setShowLocationSharePicker] = useState<boolean>(false);

  // Core Modals & Panels
  const [selectedOrgModal, setSelectedOrgModal] = useState<CampusClub | null>(null);
  const [orgSubTab, setOrgSubTab] = useState<"explore" | "my-orgs" | "greek" | "sga-grants" | "calendar" | "incubator">("explore");
  const [orgSearchQuery, setOrgSearchQuery] = useState<string>("");
  const [orgCategoryFilter, setOrgCategoryFilter] = useState<string>("All");
  const [selectedOrgDrawerTab, setSelectedOrgDrawerTab] = useState<"about" | "leadership" | "projects" | "documents">("about");
  const [showSgaGrantModal, setShowSgaGrantModal] = useState<boolean>(false);
  const [showStartClubModal, setShowStartClubModal] = useState<boolean>(false);
  const [showAttendanceQrModal, setShowAttendanceQrModal] = useState<CampusClub | null>(null);
  const [sgaGrantFormData, setSgaGrantFormData] = useState({ clubName: "Johns Hopkins University Cybersecurity Club", amount: "1500", purpose: "Conference Travel & Registration", description: "Funding for 6 students to compete at MACCDC Regional Finals." });
  const [sgaGrantSuccessToast, setSgaGrantSuccessToast] = useState<string | null>(null);
  const [newClubStep, setNewClubStep] = useState<number>(1);
  const [newClubData, setNewClubData] = useState({ name: "", category: "Academic", description: "", president: "", email: "", advisor: "" });
  const [newClubSuccess, setNewClubSuccess] = useState<boolean>(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<CampusEvent | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<CampusEvent | null>(null);
  const [eventSubTab, setEventSubTab] = useState<"all" | "athletics" | "concerts" | "my-tickets" | "career" | "host">("all");
  const [eventSearchQuery, setEventSearchQuery] = useState<string>("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("All");
  const [eventTimeFilter, setEventTimeFilter] = useState<string>("All");
  const [selectedEventDrawerTab, setSelectedEventDrawerTab] = useState<"details" | "agenda" | "speakers" | "venue">("details");
  // showHostEventModal declared above
  const [hostEventStep, setHostEventStep] = useState<number>(1);
  const [hostEventData, setHostEventData] = useState({ title: "", category: "Coding Workshop", location: "Brody Learning Commons & Milton S. Eisenhower Library Auditorium", date: "MAR 22", time: "6:00 PM - 8:00 PM", capacity: 150, description: "", organizer: "Student Club" });
  const [hostEventSuccess, setHostEventSuccess] = useState<boolean>(false);
  const [ticketClaimSuccessToast, setTicketClaimSuccessToast] = useState<string | null>(null);
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
      const savedTheme = typeof window !== "undefined" ? localStorage.getItem("hopkinssync_theme") : null;
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
        localStorage.setItem("hopkinssync_theme", "dark");
        setShowNotificationToast("🌙 Dark Mode Enabled");
        setTimeout(() => setShowNotificationToast(null), 2500);
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("hopkinssync_theme", "light");
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
      text: "Hello Kwesi! I'm your Johns Hopkins University Campus AI Assistant. Ask me about PAGAC Academic Commons study spaces, Brody Learning Commons & Milton S. Eisenhower Library labs, Blue Jay Ride shuttles, or student organizations on campus.",
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

  // 5 Enblue jayrise Campus Systems State
  const [selectedCourseForCanvas, setSelectedCourseForCanvas] = useState<CampusCourse | null>(null);
  const [showJCardModal, setShowJCardModal] = useState<boolean>(false);
  const [jCardWallet, setJCardWallet] = useState<JCardPass>(initialJCardPass);
  const [facilityDensities, setFacilityDensities] = useState<LiveFacilityDensity[]>(initialFacilityDensities);
  const [showSafeWalkModal, setShowSafeWalkModal] = useState<boolean>(false);
  const [safeWalkSession, setSafeWalkSession] = useState<SafeWalkSession>(initialSafeWalkSession);
  const [alumniMentors, setAlumniMentors] = useState<AlumniMentor[]>(initialAlumniMentors);
  const [careerSubFilter, setCareerSubFilter] = useState<"jobs" | "mentors" | "projects">("jobs");

  // Core Identity & RBAC Personas
  const [personas] = useState<UserProfile[]>(initialCampusPersonas);
  const [activePersonaIndex, setActivePersonaIndex] = useState<number>(0);
  const [showAskAiModal, setShowAskAiModal] = useState<boolean>(false);
  const [showBlueJayRecordExportModal, setShowBlueJayRecordExportModal] = useState<boolean>(false);
  const [launchpadFilter, setLaunchpadFilter] = useState<"ALL" | "ACADEMICS" | "SAFETY" | "MEDIA" | "OPERATIONS">("ALL");

  // HopkinsSync Administration Center State
  const [adminVerifications, setAdminVerifications] = useState<AdminVerificationRequest[]>(initialAdminVerifications);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminSecurityAuditLog[]>(initialAdminAuditLogs);
  const [adminSystemHealth, setAdminSystemHealth] = useState<AdminSystemHealth>(initialAdminSystemHealth);
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<"verifications" | "housing" | "marketplace" | "events" | "security" | "health">("verifications");

  // Post Composer State
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostScope, setNewPostScope] = useState<"CAMPUS_WIDE" | "CLUB" | "DEPARTMENT">("CAMPUS_WIDE");
  const [newPostLocation, setNewPostLocation] = useState("Red Square / PAGAC Academic Commons");
  const [newPostImage, setNewPostImage] = useState<string>("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Host Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<CampusEvent["category"]>("Guest Speaker");
  const [newEventLocation, setNewEventLocation] = useState("Brody Learning Commons & Milton S. Eisenhower Library Auditorium");
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
  const [newReelAudio, setNewReelAudio] = useState("Original Sound — SU Brody Learning Commons & Milton S. Eisenhower Library");

  // 311 Ticket Form State
  const [new311Category, setNew311Category] = useState<CampusServiceRequest["category"]>("Wi-Fi & Network");
  const [new311Location, setNew311Location] = useState("PAGAC Academic Commons 2nd Floor Pod B");
  const [new311Description, setNew311Description] = useState("");

  // Study Pod Form State
  const [newPodCourse, setNewPodCourse] = useState("COSC 421");
  const [newPodTopic, setNewPodTopic] = useState("");
  const [newPodRoom, setNewPodRoom] = useState("PAGAC Academic Commons 2nd Floor, Pod B");
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
    setHopkinsBuildings(loadHopkinsBuildings());
    setHopkinsCircles(loadHopkinsCircles());
    setHopkinsShuttles(loadHopkinsShuttles());
    setHopkinsParking(loadHopkinsParking());
    setHopkinsSafetyBeacons(loadHopkinsSafetyBeacons());
    setHopkinsScavenger(loadHopkinsScavengerCheckpoints());
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
      setHopkinsBuildings(loadHopkinsBuildings());
      setHopkinsCircles(loadHopkinsCircles());
      setHopkinsShuttles(loadHopkinsShuttles());
      setHopkinsParking(loadHopkinsParking());
      setHopkinsSafetyBeacons(loadHopkinsSafetyBeacons());
      setHopkinsScavenger(loadHopkinsScavengerCheckpoints());
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

  // 1. Switch User Roles (Johns Hopkins University Personas)
  const handleSwitchUserRole = (role: "student" | "officer" | "faculty") => {
    let user: UserProfile;
    if (role === "student") {
      user = defaultCurrentUser;
    } else if (role === "officer") {
      user = {
        ...defaultCurrentUser,
        id: "usr-amara",
        name: "Amara Diallo",
        email: "a.diallo@students.hopkins.edu",
        major: "Business Administration & Marketing",
        role: "CLUB_LEAD",
        leadershipRoles: ["African Student Association — President", "SU Student Government Association (SGA)"],
      };
    } else {
      user = {
        ...defaultCurrentUser,
        id: "usr-dr-hayes",
        name: "Dr. Catherine Hayes",
        email: "c.hayes@hopkins.edu",
        major: "Department of Computer and Information Sciences",
        role: "FACULTY",
        leadershipRoles: ["Principal Investigator — SU Autonomous Cyber Defense Lab", "Faculty Advisor"],
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
    const updated = hopkinsScavenger.map((chk) => {
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

    setHopkinsScavenger(updated);
    saveHopkinsScavengerCheckpoints(updated);
  };

  // 3.1 HopkinsHousing Handlers
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
      assignedTech: "Johns Hopkins University Facilities Dispatch",
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
    triggerToast("🎉 Post published to Johns Hopkins University campus feed!");
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
      audioTrack: newReelAudio.trim() || "Original Sound — SU Brody Learning Commons & Milton S. Eisenhower Library",
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
    triggerToast("🎬 Reel transcoded (1080p, 720p, 480p) & published to Johns Hopkins University Reels feed!");
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
        triggerToast(`🏆 Trivia Complete! Scored ${nextScore} pts. You ranked #1 on the JHU Semester Leaderboard!`);
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
    triggerToast("🛡️ Content flagged and sent to Johns Hopkins University Student Affairs Moderation Queue for review.");
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

    let aiResponse = "I've searched the Johns Hopkins University (JHU) digital campus ecosystem for you:";
    const lower = userText.toLowerCase();

    if (lower.includes("map") || lower.includes("navigate") || lower.includes("malone engineering complex") || lower.includes("library")) {
      aiResponse = `📍 Johns Hopkins University Live Map Highlights:
• **Brody Learning Commons & Milton S. Eisenhower Library**: 420 ft away (SC 304 Cyber Lab on Floor 3).
• **Albert S. PAGAC Academic Commons**: 180 ft away (Starbucks on Floor 1, 24/7 Pods on Floor 2).
• **Blue Jay Ride Gold Shuttle**: Arrives in 2 minutes at Charles Commons (GSU) Transit Plaza.`;
    } else if (lower.includes("shuttle") || lower.includes("bus") || lower.includes("gold route")) {
      aiResponse = `🚌 Blue Jay Ride Live Radar:
• **Gold Route (Campus Loop)**: Blue Jay Bus #14 is 2 mins away at Charles Commons (GSU).
• **Black Route (Johns Hopkins University Town Center)**: Blue Jay Bus #08 is 5 mins away at PAGAC Academic Commons North Stop.`;
    } else if (lower.includes("parking") || lower.includes("garage")) {
      aiResponse = `🅿️ Johns Hopkins University Parking Garage Status:
• **Blue Jay Square Garage**: 🟢 184 spaces open (Levels 1-6, 8 EV chargers).
• **Johns Hopkins Universitytown Garage**: 🟡 42 spaces open.
• **Blue Jay Square Garage**: 🔴 Full.`;
    } else if (lower.includes("police") || lower.includes("safety") || lower.includes("blue light")) {
      aiResponse = `🚨 Johns Hopkins University Safety & JHUPD:
• **JHUPD Emergency Dispatch**: (410) 704-4444.
• **Nearest Blue Light Phone**: #104 at Red Square (90 ft away).
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
    buildings: (hopkinsBuildings || []).filter((b) => ((b?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || (b?.code || "").toLowerCase().includes((searchQuery || "").toLowerCase()))),
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
          <span>Hydrating Johns Hopkins University (JHU) Campus Ecosystem...</span>
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
                <p className="text-xs text-slate-500">Red Square ➔ Brody Learning Commons & Milton S. Eisenhower Library Rm 304 (Cyber Lab)</p>
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

      {/* 3. MODAL: HOPKINSORBIT 360 LOCATION SHARING MANAGER */}
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
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Blue JayOrbit 360 Controls</h3>
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

            {/* 3.1 MODAL: LIFE360 MEMBER PROFILE & REAL-TIME TELEMETRY STUDIO */}
      {selectedLife360Member && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedLife360Member(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Member Header Card */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={selectedLife360Member.avatar}
                  alt={selectedLife360Member.name}
                  className="w-16 h-16 rounded-3xl object-cover ring-4 ring-amber-500 shadow-xl"
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                  selectedLife360Member.status === "on_campus" ? "bg-emerald-500" :
                  selectedLife360Member.status === "driving" ? "bg-sky-500" :
                  selectedLife360Member.status === "studying" ? "bg-amber-500" : "bg-slate-400"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 truncate">
                    {selectedLife360Member.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    {activeCircle.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{selectedLife360Member.major}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                  <span>Updated {selectedLife360Member.lastUpdated}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live GPS Active
                  </span>
                </div>
              </div>
            </div>

            {/* Current Real-Time Location Card */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-slate-50 to-slate-100 dark:from-amber-950/20 dark:via-zinc-800/40 dark:to-zinc-800/80 rounded-2xl border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Current Position
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                  {selectedLife360Member.distanceFt === 0 ? "📍 Exact Same Location" : `📏 ${selectedLife360Member.distanceFt} ft away`}
                </span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {selectedLife360Member.currentBuilding}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border text-[11px]">
                  {selectedLife360Member.currentFloor || "Ground Floor"}
                </span>
                {selectedLife360Member.exactRoom && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                    🚪 {selectedLife360Member.exactRoom}
                  </span>
                )}
              </div>
            </div>

            {/* Live Telemetry Matrix (Battery, Speed, Wi-Fi, GPS Mode) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* 1. Battery Gauge */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
                  <span>BATTERY</span>
                  {selectedLife360Member.isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-1">
                  <span>{selectedLife360Member.batteryPercent}%</span>
                  {selectedLife360Member.isCharging && <span className="text-[10px] text-emerald-500">⚡</span>}
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedLife360Member.batteryPercent > 50 ? "bg-emerald-500" :
                      selectedLife360Member.batteryPercent > 20 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${selectedLife360Member.batteryPercent}%` }}
                  />
                </div>
              </div>

              {/* 2. Speed / Movement */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
                  <span>SPEED</span>
                  <Gauge className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-zinc-100">
                  {selectedLife360Member.speedMph ? `${selectedLife360Member.speedMph} mph` : "0 mph"}
                </div>
                <span className="text-[10px] font-bold text-slate-500 capitalize">
                  {selectedLife360Member.movementType === "driving" ? "🚗 Driving" :
                   selectedLife360Member.movementType === "walking" ? "🚶 Walking" : "📍 Stationary"}
                </span>
              </div>

              {/* 3. Wi-Fi / Radio Signal */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
                  <span>NETWORK</span>
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-zinc-100 truncate">
                  Hopkins-Secure
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {selectedLife360Member.wifiSignal || "5GHz Strong"}
                </span>
              </div>

              {/* 4. Precision Privacy Mode */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
                  <span>ACCURACY</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ±3m GPS
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {selectedLife360Member.privacyMode === "bubble" ? "Ghost Ring" : "Precise Pin"}
                </span>
              </div>
            </div>

            {/* Today's Location History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Today's Location Timeline
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {selectedLife360Member.timeline?.length || 4} Stops Recorded
                </span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {(selectedLife360Member.timeline || [
                  { time: "8:30 AM", location: "University Village Apt 304", activity: "Departed Dorm", icon: "🏠", duration: "Night" },
                  { time: "9:15 AM", location: "Albert S. PAGAC Academic Commons", activity: "Study Pod B-12", icon: "📚", duration: "2h 15m" },
                  { time: "11:30 AM", location: "Brody Learning Commons & Milton S. Eisenhower Library", activity: "Cybersecurity Lab 304", icon: "🔬", duration: "1h 45m" },
                  { time: "01:30 PM", location: "Charles Commons (GSU)", activity: "Lunch & SGA Meet", icon: "🍕", duration: "Current" },
                ]).map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-xs">
                    <span className="text-base">{entry.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 truncate">{entry.location}</span>
                        <span className="text-[10px] font-mono text-slate-400">{entry.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{entry.activity}</span>
                        {entry.duration && <span className="font-semibold text-amber-600">{entry.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driving Safety Telemetry (Life360 Crash & Driving Engine) */}
            {selectedLife360Member.drivingScore && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold">Driving Safety Telemetry</span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Score: {selectedLife360Member.drivingScore.overallScore}/100 (Safe)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-800/60 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">Top Speed</div>
                    <div className="text-sm font-black text-amber-400">{selectedLife360Member.drivingScore.topSpeedMph} mph</div>
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">Hard Brakes</div>
                    <div className="text-sm font-black text-emerald-400">{selectedLife360Member.drivingScore.hardBrakingEvents}</div>
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">Rapid Accel</div>
                    <div className="text-sm font-black text-sky-400">{selectedLife360Member.drivingScore.rapidAccelerations}</div>
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">Phone Use</div>
                    <div className="text-sm font-black text-emerald-400">{selectedLife360Member.drivingScore.phoneUsageMinutes}m</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t dark:border-zinc-800">
              {/* 1. Get Directions */}
              <button
                onClick={() => {
                  setSelectedLife360Member(null);
                  setShowNavigationRouteModal(true);
                  triggerToast(`🧭 Routing turn-by-turn navigation to ${selectedLife360Member.name} at ${selectedLife360Member.currentBuilding}`);
                }}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition flex flex-col items-center justify-center gap-1 shadow-md"
              >
                <Navigation className="w-4 h-4" />
                <span>Directions</span>
              </button>

              {/* 2. Set Place Alert */}
              <button
                onClick={() => {
                  setSelectedLife360Member(null);
                  setShowPlaceAlertsModal(true);
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition flex flex-col items-center justify-center gap-1"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Place Alert</span>
              </button>

              {/* 3. Nudge / Ping */}
              <button
                onClick={() => {
                  triggerToast(`👋 Nudge sent to ${selectedLife360Member.name}! Device will buzz.`);
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition flex flex-col items-center justify-center gap-1"
              >
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Send Ping</span>
              </button>

              {/* 4. Request Safety Check-In */}
              <button
                onClick={() => {
                  triggerToast(`🛡️ Safety check-in requested from ${selectedLife360Member.name}.`);
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition flex flex-col items-center justify-center gap-1"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Check-In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.2 MODAL: GEOFENCED PLACES & PLACE ALERTS MANAGER */}
      {showPlaceAlertsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-5 my-8">
            <button
              onClick={() => setShowPlaceAlertsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Campus Place Alerts</h3>
                <p className="text-xs text-slate-500">Get automatic push notifications when circle members arrive or depart.</p>
              </div>
            </div>

            {/* Places List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {placesList.map((place) => (
                <div key={place.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-zinc-100">
                      <span className="text-base">{place.icon}</span>
                      <span>{place.placeName}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      {place.radiusMeters}m Geofence
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t dark:border-zinc-700">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={place.notifyOnArrival}
                        onChange={(e) => {
                          setPlacesList((prev) =>
                            prev.map((p) => p.id === place.id ? { ...p, notifyOnArrival: e.target.checked } : p)
                          );
                          triggerToast(`Arrival alert ${e.target.checked ? "enabled" : "disabled"} for ${place.placeName}`);
                        }}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                      <span>Arrive Alert</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={place.notifyOnDeparture}
                        onChange={(e) => {
                          setPlacesList((prev) =>
                            prev.map((p) => p.id === place.id ? { ...p, notifyOnDeparture: e.target.checked } : p)
                          );
                          triggerToast(`Departure alert ${e.target.checked ? "enabled" : "disabled"} for ${place.placeName}`);
                        }}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                      <span>Depart Alert</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Campus Place */}
            <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-3 text-xs">
              <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" /> Add Custom Campus Geofence Place
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Place Name (e.g. Blue Jay Square Dorm)"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="col-span-2 p-2 rounded-xl bg-white dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                />
                <select
                  value={newPlaceIcon}
                  onChange={(e) => setNewPlaceIcon(e.target.value)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border text-xs"
                >
                  <option value="🏠">🏠 Home/Dorm</option>
                  <option value="📚">📚 Library</option>
                  <option value="🔬">🔬 Lab</option>
                  <option value="🍕">🍕 Food</option>
                  <option value="🏋️">🏋️ Gym</option>
                  <option value="☕">☕ Cafe</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (!newPlaceName.trim()) {
                    triggerToast("Please enter a place name");
                    return;
                  }
                  const newPlace: CirclePlaceAlert = {
                    id: `place-${Date.now()}`,
                    placeName: newPlaceName.trim(),
                    icon: newPlaceIcon,
                    radiusMeters: newPlaceRadius,
                    coordinates: { x: 50, y: 50 },
                    notifyOnArrival: true,
                    notifyOnDeparture: true,
                    membersWatched: ["ALL"],
                  };
                  setPlacesList([...placesList, newPlace]);
                  setNewPlaceName("");
                  triggerToast(`✅ Geofence created for "${newPlace.placeName}"!`);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-xl transition text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Geofence Place
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 MODAL: 🚨 360 SOS EMERGENCY PANIC DISPATCH */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-rose-600 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-6 text-white text-center animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSOSModal(false);
                setSosActive(false);
                setSosCountdown(3);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Siren Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <span className="absolute -inset-4 rounded-full bg-rose-600/40 animate-ping" />
                <div className="relative p-5 rounded-full bg-rose-600 text-white shadow-2xl">
                  <ShieldAlert className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Emergency Status Text */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-rose-500 tracking-wide">
                {sosActive ? "🚨 SOS EMERGENCY BEACON ACTIVE" : `🚨 EMERGENCY SOS COUNTDOWN`}
              </h3>
              <p className="text-xs text-slate-300">
                {sosActive
                  ? "Distress beacon sent to all Circle members, Johns Hopkins University Police & nearest Blue Light Beacon #04."
                  : `Dispatching your exact GPS coordinates & indoor room to Circle & JHUPD in ${sosCountdown} seconds.`}
              </p>
            </div>

            {!sosActive ? (
              <div className="p-4 bg-slate-900 rounded-2xl border border-rose-900/50 space-y-3">
                <div className="text-4xl font-black text-rose-400 font-mono animate-bounce">
                  {sosCountdown}
                </div>
                <p className="text-[11px] text-slate-400">
                  Tap Cancel immediately if this was an accidental press.
                </p>
                <button
                  onClick={() => {
                    setShowSOSModal(false);
                    setSosActive(false);
                    setSosCountdown(3);
                    triggerToast("Cancelled SOS Panic Dispatch.");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs"
                >
                  Cancel SOS / False Alarm
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-800 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                    <span>GPS Coordinates:</span>
                    <span>39.3924° N, 76.6048° W</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                    <span>Location:</span>
                    <span>Red Square Quad</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                    <span>Nearest Blue Light:</span>
                    <span>Beacon #04 (60 ft away)</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                    <span>Battery Telemetry:</span>
                    <span>88% Remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:4107044444"
                    className="p-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call JHUPD Dispatch</span>
                  </a>
                  <a
                    href="tel:911"
                    className="p-3 bg-red-800 hover:bg-red-900 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 911</span>
                  </a>
                </div>

                <button
                  onClick={() => {
                    setShowSOSModal(false);
                    setSosActive(false);
                    setSosCountdown(3);
                    triggerToast("✅ SOS Alarm Resolved & Cleared.");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs"
                >
                  I Am Safe (Clear Alert)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.4 MODAL: CREATE NEW CIRCLE / ORBIT */}
      {showCreateCircleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowCreateCircleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Create New Orbit</h3>
                <p className="text-xs text-slate-500">Create a private Life360 circle for study pods, roommates, or clubs.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Orbit Name</label>
                <input
                  type="text"
                  placeholder="e.g. Blue Jay Square Roommates 402"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Category</label>
                  <select
                    value={newCircleCategory}
                    onChange={(e) => setNewCircleCategory(e.target.value as any)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs"
                  >
                    <option value="Club">Club</option>
                    <option value="Study Group">Study Group</option>
                    <option value="Dorm / Roommates">Dorm / Roommates</option>
                    <option value="Friends">Friends</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Icon</label>
                  <select
                    value={newCircleIcon}
                    onChange={(e) => setNewCircleIcon(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs"
                  >
                    <option value="🛡️">🛡️ Shield</option>
                    <option value="🏠">🏠 House</option>
                    <option value="📚">📚 Books</option>
                    <option value="💻">💻 Tech</option>
                    <option value="⚡">⚡ Lightning</option>
                    <option value="🐾">🐾 Blue Jay</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!newCircleName.trim()) {
                    triggerToast("Please enter an orbit name");
                    return;
                  }
                  const code = "JHU-" + Math.random().toString(36).substring(2, 6).toUpperCase();
                  const newCircle: LocationCircle = {
                    id: `circle-${Date.now()}`,
                    name: newCircleName.trim(),
                    icon: newCircleIcon,
                    inviteCode: code,
                    category: newCircleCategory,
                    membersCount: 1,
                    activeSharingCount: 1,
                    isUserMember: true,
                    isAdmin: true,
                    places: initialHopkinsPlaces,
                    members: [
                      {
                        id: "m-kwesi",
                        name: "Kwesi Asiedu (You)",
                        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                        major: "IT Junior",
                        status: "on_campus",
                        currentBuilding: "Red Square / PAGAC Academic Commons",
                        currentFloor: "Ground Floor",
                        exactRoom: "Commons Lounge",
                        distanceFt: 0,
                        x: 48,
                        y: 48,
                        batteryPercent: 88,
                        lastUpdated: "Just now",
                        isSharingLocation: true,
                      },
                    ],
                  };
                  setHopkinsCircles([newCircle, ...hopkinsCircles]);
                  setSelectedCircleId(newCircle.id);
                  setNewCircleName("");
                  setShowCreateCircleModal(false);
                  triggerToast(`🎉 Created Orbit "${newCircle.name}"! Invite Code: ${newCircle.inviteCode}`);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl transition text-xs shadow-md mt-2 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Orbit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.5 MODAL: JOIN CIRCLE WITH CODE */}
      {showJoinCircleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowJoinCircleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Join an Orbit</h3>
                <p className="text-xs text-slate-500">Enter a 6-character Johns Hopkins University circle invite code (e.g. JHU-9X4K).</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="e.g. JHU-9X4K"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border text-center font-mono font-black text-lg uppercase tracking-widest focus:outline-amber-500"
                  maxLength={8}
                />
              </div>

              <button
                onClick={() => {
                  if (!inviteCodeInput.trim()) {
                    triggerToast("Please enter an invite code");
                    return;
                  }
                  triggerToast(`🎉 Successfully joined orbit with code "${inviteCodeInput}"!`);
                  setInviteCodeInput("");
                  setShowJoinCircleModal(false);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Join Orbit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.6 MODAL: SHARE INVITE CODE & QR */}
      {showInviteCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl space-y-4 text-center">
            <button
              onClick={() => setShowInviteCodeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Share2 className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">{activeCircle.name}</h3>
              <p className="text-xs text-slate-500">Share this 6-character code with your friends or study pod.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-dashed border-amber-500 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orbit Invite Code</span>
              <div className="text-2xl font-black font-mono tracking-widest text-amber-600 dark:text-amber-400">
                {activeCircle.inviteCode || "JHU-9X4K"}
              </div>
            </div>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(activeCircle.inviteCode || "JHU-9X4K");
                }
                triggerToast(`📋 Copied invite code ${activeCircle.inviteCode || "JHU-9X4K"} to clipboard!`);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Copy className="w-4 h-4" /> Copy Invite Code
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: SAFETY MODE & JHUPD ASSISTANCE */}
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
                <span>Call JHUPD Dispatch {selectedSafetyBeacon.emergencyPhone}</span>
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

      {/* 4.1 MODAL: HOPKINSHOUSING TOUR BOOKING */}
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

      {/* 4.2 MODAL: HOPKINSHOUSING MAINTENANCE REQUEST */}
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
                <p className="text-xs text-slate-500">Johns Hopkins University Facilities & Off-Campus Dispatch</p>
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
              <div className="font-bold text-slate-800 dark:text-zinc-200">Commute to Johns Hopkins University Main Campus (Red Square):</div>
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
                <h2 className="text-xl font-black mt-0.5">Johns Hopkins University Campus Weather & Atmospheric Center</h2>
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
                  <span className="text-xs text-slate-400">Johns Hopkins University, MD Zone MDZ006</span>
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
                    <h3 className="text-sm font-black">Johns Hopkins University High-Definition Base Reflectivity Radar</h3>
                    <p className="text-xs text-slate-500">NOAA KLWX Doppler Radar • Centered over Red Square & PAGAC Academic Commons</p>
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
                  
                  {/* Johns Hopkins University Campus Quad Label */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/20">
                      📍 Johns Hopkins University Main Quad (0 dBZ · Clear Air)
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
                    Johns Hopkins University (JHU) Official Operational Status
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
                    { key: "emergencyAlerts", title: "Emergency Tornado & Flash Flood Warnings", desc: "Immediate push alerts for imminent hazardous weather affecting Johns Hopkins University." },
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
                          triggerToast(`🚀 Submitted ${del.title} to Johns Hopkins University Canvas!`);
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

      {/* 4.2 MODAL: DIGITAL JCARD & DINING WALLET PASS */}
      {showJCardModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowJCardModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5 text-slate-900 dark:text-zinc-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">Johns Hopkins University Digital Blue Jay JCard</h3>
              </div>
              <button
                onClick={() => setShowJCardModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Digital Blue Jay Card Visual (Gold/Black Luxe Design) */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-black rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden space-y-4 border border-amber-400/40">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐯</span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 block leading-none">Hopkins UNIVERSITY</span>
                    <span className="text-[9px] text-amber-100 uppercase tracking-wider font-mono">JCard • Digital Pass</span>
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
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800">{jCardWallet.barcodeNumber}</span>
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
                  <span className="text-xl font-black text-amber-900 dark:text-amber-100">{jCardWallet.mealSwipesRemaining} Swipes</span>
                  <span className="text-[9px] text-slate-400 block">Resets Sunday midnight</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase block">Dining Dollars</span>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">${(jCardWallet?.diningDollarsBalance ?? 428.5).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">All campus dining + Cool Beans Coffee (PAGAC)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Retail Points</span>
                  <span className="text-base font-black">${(jCardWallet?.retailPointsBalance ?? 185.0).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">Bookstore & concessions</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Print Quota</span>
                  <span className="text-base font-black">${(jCardWallet?.printQuotaBalance ?? 34.25).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block">PAGAC Academic Commons Printers</span>
                </div>
              </div>
            </div>

            {/* Dorm Access Zone */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">DORM KEYCARD ACCESS</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100">{jCardWallet.dormAccessZone}</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => triggerToast("📲 Added Johns Hopkins University JCard pass to Apple Wallet & Google Wallet!")}
                className="w-full bg-black hover:bg-slate-900 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition border border-white/20"
              >
                <span> Add to Apple Wallet & Google Wallet</span>
              </button>
              <button
                onClick={() => {
                  setJCardWallet({
                    ...jCardWallet,
                    diningDollarsBalance: jCardWallet.diningDollarsBalance + 50,
                  });
                  triggerToast("💳 Reloaded +$50.00 to Johns Hopkins University Dining Dollars!");
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-2xl text-xs transition"
              >
                + Quick Reload ($50 Dining Dollars)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4.3 MODAL: HOPKINS NIGHT RIDE SAFEWALK VIRTUAL NIGHT ESCORT */}
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
                <h3 className="text-base font-black">Blue Jay SafeWalk Virtual Escort</h3>
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
                    <span className="text-[10px] text-emerald-600 font-medium">Tracking live via Blue JayOrbit 360</span>
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
                    triggerToast("🚨 JHUPD Emergency Dispatch alerted with your exact GPS coordinates!");
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>1-Tap JHUPD SOS</span>
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
                  <h3 className="text-base font-black">Johns Hopkins University Notifications</h3>
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
                  { id: "2", title: "🎟️ Event RSVP Reminder", msg: "Johns Hopkins University Cybersecurity Keynote starts today at 5:00 PM in Brody Learning Commons & Milton S. Eisenhower Library.", time: "45m ago", type: "EVENT", read: false },
                  { id: "3", title: "🌦️ NOAA Weather Update", msg: "NOAA reports 20% precipitation chance. Good conditions for outdoor campus walking.", time: "2h ago", type: "WEATHER", read: true },
                  { id: "4", title: "👥 ASA Johns Hopkins University Announcement", msg: "General body meeting confirmed for Thursday 6:30 PM in Union Rm 302.", time: "4h ago", type: "ORG", read: true },
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

            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-black flex items-center justify-center mx-auto text-3xl font-black shadow-lg">SU</div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600">Johns Hopkins University (JHU) Office of Civic Engagement</span>
              <h2 className="text-2xl font-black">Official Certificate of Student Leadership</h2>
              <p className="text-xs text-slate-500">This certifies that</p>
              <h3 className="text-xl font-black text-amber-600">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                has completed <strong>{currentUser.volunteerHoursLogged ?? 48} verified volunteer hours</strong> and attended <strong>{currentUser.eventsAttendedCount ?? 12} official campus engagement programs</strong> during the 2025–2026 academic term.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border text-xs font-mono flex items-center justify-between">
              <span>Verification Hash: 0x9f4a...81c2</span>
              <span className="text-emerald-600 font-bold">Verified Blue Jay Record ✓</span>
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

      {/* JOHNS HOPKINS RESEARCH & CLINICAL ATRIUM BAR */}
      <div className="bg-[#002D72] text-white border-b border-[#68ACE5]/40 px-4 py-1.5 text-[11px] font-serif flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-[#68ACE5] text-[#002D72] px-2.5 py-0.5 rounded-full font-sans font-black text-[10px] tracking-wider uppercase">JHU ATRIUM</span>
          <span className="font-semibold text-blue-100 italic">"Veritas Vos Liberabit"</span>
          <span className="text-blue-300">|</span>
          <span className="text-amber-300 font-sans font-bold">⚕️ Bloomberg School of Public Health</span>
          <span className="text-blue-300">|</span>
          <span className="text-white font-sans">🥍 9x NCAA Lacrosse National Champions</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-blue-200 text-[10px] font-sans">
          <span>JHMI Blue Line: 4 min</span>
          <span>•</span>
          <span>Brody Atrium: Quiet Study</span>
          <span>•</span>
          <span className="text-blue-100">Homewood Campus (39.3299° N)</span>
        </div>
      </div>
{/* TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2.5">
          
          {/* Left: Logo & Campus Selector & NOAA Weather */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setActiveTab("home")}>
              <div className="w-8 h-8 rounded-xl bg-[#E03A3E] border border-[#FFD520]/60 flex items-center justify-center text-[#FFD520] font-black text-sm shadow-sm">Hopkins</div>
              <div className="hidden xl:block">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-zinc-100 block leading-tight">
                  HopkinsSync
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">Digital Campus</span>
              </div>
            </div>

            {/* Sleek Compact Campus Selector */}
            <select
              value={selectedCampus}
              onChange={(e) => {
                if (e.target.value === "Johns Hopkins University (JHU)") {
                window.location.href = "/campus";
                return;
              }
              setSelectedCampus(e.target.value as any);
                triggerToast(`📍 Switched to ${e.target.value}`);
              }}
              className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="Johns Hopkins University Main Campus">🏛️ Main Campus</option>
              <option value="East Baltimore Medical Campus (JHH & Bloomberg)">🏙️ East Baltimore Medical Campus (JHH & Bloomberg)</option>
              <option value="Downtown Johns Hopkins University Plaza">🏥 Health Complex</option>
              <option value="Johns Hopkins University (JHU)">🐯 Johns Hopkins University (JHU) (Blue Jays)</option>
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
            
            {/* Digital Blue Jay JCard Button */}
            <button
              onClick={() => setShowJCardModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 hover:border-amber-500 transition shrink-0"
              title="Open Johns Hopkins University Digital JCard & Balances"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-mono text-[11px] font-bold">{jCardWallet.mealSwipesRemaining} Swipes</span>
            </button>

            {/* Global AI Copilot Button */}
            <button
              onClick={() => {
                setCopilotInitialQuery(undefined);
                setShowGlobalCopilot(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 shadow-xs transition shrink-0 animate-in fade-in cursor-pointer"
              title="Open Global AI Copilot (Cross-Ecosystem Intelligence)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
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
                        {currentUser.role === "CLUB_LEAD" ? "👑 Club Lead" : currentUser.role === "FACULTY" ? "🏛️ JHU Faculty" : "🐯 Verified Blue Jay"}
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

                    {/* Quick Access Card: Blue Jay JCard */}
                    <button
                      onClick={() => {
                        setShowJCardModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-900 dark:text-zinc-100">Digital JCard Wallet</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400">
                        {jCardWallet?.mealSwipesRemaining ?? 14} Swipes • ${(jCardWallet?.diningDollarsBalance ?? 428).toFixed(0)}
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
                            <span>HopkinsSync Administration</span>
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
                        <span>Blue Jay SafeWalk Night Escort</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAskAiModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>✨ Ask HopkinsSync AI</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowLocationSharePicker(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold flex items-center gap-2"
                      >
                        <span>🪐</span>
                        <span>Blue JayOrbit 360 Privacy (Opt-in)</span>
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
                          <span>Blue Jay Record & Passport</span>
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

      {/* 🔴 AMBIENT LIVE ON Hopkins CAMPUS PULSE STRIP */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-black uppercase tracking-wider text-[11px] text-amber-400">Live At Johns Hopkins University</span>
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
        {/* 🗺️ DEDICATED MODULE: 📍 CAMPUS LIVE MAP (Hopkins UNIVERSITY) */}
        {/* ========================================================================= */}
        {(activeTab === "map" || (activeTab === "more" && moreSubView === "map")) && (
          <div className="space-y-6">
            
            {/* Map Header & Controls */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-amber-500/30">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                  Johns Hopkins University (JHU) • Geographic Platform & Blue JayOrbit 360
                </span>
                <h1 className="text-2xl font-black mt-0.5">Johns Hopkins University Campus Live Map & Indoor Radar</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Explore academic buildings, floor plans, live Blue Jay Ride shuttles, parking garages, JHUPD Blue Lights, and temporary Blue JayOrbit 360 circles.
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
                { id: "CIRCLES", label: "👥 Blue JayOrbit 360" },
                { id: "HOUSING", label: "🏠 HopkinsHousing Off-Campus" },
                { id: "WEATHER", label: "🌦️ NOAA Weather & Radar" },
                { id: "SHUTTLES", label: "🚌 Blue Jay Ride GPS" },
                { id: "PARKING", label: "🅿️ Parking Garages" },
                { id: "SAFETY", label: "🚨 JHUPD Blue Lights" },
                { id: "SCAVENGER", label: "🐾 Blue Jay Scavenger Hunt" },
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
            <div className={`relative h-[640px] rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between select-none transition-colors duration-500 ${
              mapCartoMode === "carto" ? "bg-[#0b1329]" :
              mapCartoMode === "satellite" ? "bg-[#071318]" : "bg-[#050811]"
            }`}>
              
              {/* 1. Grid & Topographic Ambient Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

              {/* 2. FULL CAMPUS VECTOR CARTOGRAPHY & GEOGRAPHY SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 640" preserveAspectRatio="none">
                <defs>
                  {/* Grass & Lawn Pattern */}
                  <pattern id="lawnPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="rgba(16, 185, 129, 0.08)" />
                    <circle cx="10" cy="10" r="1" fill="rgba(52, 211, 153, 0.15)" />
                  </pattern>
                  {/* Forest Tree Pattern */}
                  <pattern id="forestPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill="rgba(5, 150, 105, 0.12)" />
                    <circle cx="6" cy="6" r="3" fill="rgba(16, 185, 129, 0.25)" />
                    <circle cx="18" cy="18" r="3" fill="rgba(16, 185, 129, 0.25)" />
                  </pattern>
                  {/* Paved Plaza Pattern */}
                  <pattern id="plazaPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                    <rect width="16" height="16" fill="rgba(245, 158, 11, 0.05)" />
                    <path d="M 0 0 L 16 16 M 16 0 L 0 16" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="0.8" />
                  </pattern>
                </defs>

                {/* ─── A. CAMPUS QUADRANTS & GREEN LAWNS ─── */}
                
                {/* 1. Academic Core Quad & Red Square */}
                <path
                  d="M 360 220 L 660 160 L 680 380 L 360 420 Z"
                  fill="url(#lawnPattern)"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text x="510" y="270" fill="#34d399" fontSize="12" fontWeight="bold" letterSpacing="2" opacity="0.6" textAnchor="middle">
                  🏛️ ACADEMIC QUAD & FREEDOM SQUARE
                </text>

                {/* 2. Wicomico River Greenway & Nature Reserve (North-East) */}
                <path
                  d="M 680 60 L 920 60 L 900 240 L 700 220 Z"
                  fill="url(#forestPattern)"
                  stroke="rgba(5, 150, 105, 0.4)"
                  strokeWidth="1.5"
                />
                <text x="800" y="140" fill="#10b981" fontSize="11" fontWeight="bold" letterSpacing="1.5" opacity="0.7" textAnchor="middle">
                  🌲 WYMAN PARK DELL NATURE GROVE
                </text>

                {/* 3. Blue Jay Square Residential Quad (West) */}
                <path
                  d="M 80 200 L 260 200 L 250 440 L 70 420 Z"
                  fill="url(#lawnPattern)"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="1.5"
                />
                <text x="160" y="320" fill="#34d399" fontSize="11" fontWeight="bold" letterSpacing="1.5" opacity="0.6" textAnchor="middle">
                  🏠 KEYSER QUAD & LOWER BOWL
                </text>

                {/* 4. Minnegan Athletic Complex & Stadium (South-West) */}
                <g opacity="0.85">
                  {/* Outer Running Track Oval */}
                  <ellipse cx="280" cy="520" rx="90" ry="50" fill="#450a0a" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Inner Turf Field */}
                  <ellipse cx="280" cy="520" rx="65" ry="32" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="280" y="524" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                    🏃 MINNEGAN STADIUM
                  </text>
                </g>

                {/* 5. Johns Hopkins University Stream / Stony Run Creek Meander */}
                <path
                  d="M 690 40 Q 740 180 720 320 T 760 580"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <text x="745" y="360" fill="#38bdf8" fontSize="9" fontWeight="bold" transform="rotate(75 745 360)" opacity="0.6">
                  🌊 Johns Hopkins University Stony Run Creek
                </text>

                {/* ─── B. MAJOR ARTERIAL ROADS & THOROUGHFARES ─── */}
                
                {/* 1. Johns Hopkins Universitytown Blvd (North Highway Corridor) */}
                <path d="M 50 120 L 950 120" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <path d="M 50 120 L 950 120" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                <path d="M 50 120 L 950 120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 8" />
                <text x="500" y="114" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="3" textAnchor="middle">
                  BATEMAN STREET & CAMDEN AVE
                </text>

                {/* 2. Wayne Street (West Main Arterial) */}
                <path d="M 160 50 L 320 600" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <path d="M 160 50 L 320 600" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                <path d="M 160 50 L 320 600" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 8" />
                <text x="210" y="240" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="3" transform="rotate(74 210 240)">
                  OSLER DRIVE
                </text>

                {/* 3. Bateman Street MD-45 (East Arterial Avenue) */}
                <path d="M 880 50 L 880 600" stroke="#1e293b" strokeWidth="26" strokeLinecap="round" />
                <path d="M 880 50 L 880 600" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
                <path d="M 880 50 L 880 600" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 8" />
                <text x="895" y="320" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="3" transform="rotate(90 895 320)">
                  YORK ROAD (MD-45)
                </text>

                {/* 4. Cross Campus Drive (Central Connector) */}
                <path d="M 300 240 L 700 240 L 760 480" stroke="#334155" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M 300 240 L 700 240 L 760 480" stroke="#64748b" strokeWidth="1" strokeDasharray="6 4" fill="none" />

                {/* 5. University Mall Walkway (Central Promenade) */}
                <path d="M 380 370 L 620 230" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                <path d="M 380 370 L 620 230" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                <text x="500" y="310" fill="#f59e0b" fontSize="9" fontWeight="bold" transform="rotate(-30 500 310)" opacity="0.8">
                  🚶 University Mall Walkway
                </text>

                {/* ─── C. ARCHITECTURAL BUILDING FOOTPRINTS ─── */}

                {/* 1. Albert S. PAGAC Academic Commons (CK) Footprint */}
                <g opacity="0.95">
                  <rect x="430" y="275" width="100" height="70" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="445" y="285" width="70" height="50" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="480" y="315" fill="#fef3c7" fontSize="11" fontWeight="bold" textAnchor="middle">📚 BRODY & MSE LIBRARY</text>
                  <text x="480" y="330" fill="#f59e0b" fontSize="9" textAnchor="middle">Level 1-5 • Central Hub</text>
                </g>

                {/* 2. Brody Learning Commons & Milton S. Eisenhower Library (SC) Footprint */}
                <g opacity="0.95">
                  {/* Multi-Wing Footprint */}
                  <path d="M 570 190 L 690 190 L 690 270 L 650 270 L 650 290 L 570 290 Z" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
                  <rect x="585" y="205" width="50" height="70" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="630" y="235" fill="#cffafe" fontSize="11" fontWeight="bold" textAnchor="middle">🔬 MALONE ENGINEERING COMPLEX</text>
                  <text x="630" y="250" fill="#06b6d4" fontSize="9" textAnchor="middle">Cyber Lab • Planetarium</text>
                </g>

                {/* 3. Charles Commons (GSU) (UU) Footprint */}
                <g opacity="0.95">
                  <rect x="330" y="340" width="100" height="70" rx="8" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
                  <rect x="345" y="352" width="70" height="46" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="380" y="375" fill="#f3e8ff" fontSize="11" fontWeight="bold" textAnchor="middle">🍕 UNIV. UNION</text>
                  <text x="380" y="390" fill="#c084fc" fontSize="9" textAnchor="middle">Dining • Ballrooms • SGA</text>
                </g>

                {/* 4. Ralph S. O'Connor Center for Recreation & Well-Being (PAC) & Rec Center (BD) Footprint */}
                <g opacity="0.95">
                  <rect x="440" y="425" width="110" height="75" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <rect x="455" y="438" width="80" height="50" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1" strokeDasharray="3 2" />
                  <text x="495" y="465" fill="#d1fae5" fontSize="11" fontWeight="bold" textAnchor="middle">🏋️ OCONNOR-REC REC</text>
                  <text x="495" y="480" fill="#34d399" fontSize="9" textAnchor="middle">Gym • Pool • Climbing</text>
                </g>

                {/* 5. Center for the Arts (CA) Footprint */}
                <g opacity="0.9">
                  <rect x="370" y="415" width="60" height="55" rx="6" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
                  <text x="400" y="445" fill="#fbcfe8" fontSize="9" fontWeight="bold" textAnchor="middle">🎭 ARTS (CA)</text>
                  <text x="400" y="458" fill="#f472b6" fontSize="8" textAnchor="middle">Theater</text>
                </g>

                {/* 6. Malone Hall & Hackerman Hall (Computer Science & Robotics) (ST) Landmark Footprint */}
                <g opacity="0.9">
                  <rect x="540" y="150" width="70" height="40" rx="6" fill="#1e293b" stroke="#eab308" strokeWidth="1.5" />
                  <text x="575" y="172" fill="#fef08a" fontSize="9" fontWeight="bold" textAnchor="middle">🎓 GILMAN HALL</text>
                  <text x="575" y="184" fill="#eab308" fontSize="8" textAnchor="middle">Clocktower</text>
                </g>

                {/* 7. East Baltimore Medical Campus (JHH & Bloomberg) (Computer Science / IT) Footprint */}
                <g opacity="0.9">
                  <rect x="710" y="275" width="85" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="752" y="300" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle">💻 7800 YORK</text>
                  <text x="752" y="314" fill="#38bdf8" fontSize="8" textAnchor="middle">Comp Sci / CIS</text>
                </g>

                {/* 8. Blue Jay Square Commons & Marshall/Carroll Dorms */}
                <g opacity="0.9">
                  <rect x="170" y="255" width="80" height="55" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="210" y="282" fill="#d1fae5" fontSize="9" fontWeight="bold" textAnchor="middle">🏠 KEYSER QUAD RESIDENCES</text>
                  <text x="210" y="296" fill="#34d399" fontSize="8" textAnchor="middle">Commons & Dorms</text>
                </g>

                {/* 9. University Village Apartments Apt 304 Footprint */}
                <g opacity="0.9">
                  <rect x="770" y="105" width="95" height="50" rx="6" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
                  <text x="817" y="130" fill="#e0e7ff" fontSize="9" fontWeight="bold" textAnchor="middle">🏠 UNIV. VILLAGE</text>
                  <text x="817" y="144" fill="#a5b4fc" fontSize="8" textAnchor="middle">Apt 304 Suites</text>
                </g>

                {/* 10. South Parking Garage (SG) Footprint */}
                <g opacity="0.9">
                  <rect x="210" y="455" width="75" height="48" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="247" y="480" fill="#dbeafe" fontSize="9" fontWeight="bold" textAnchor="middle">🅿️ SOUTH GARAGE</text>
                  <text x="247" y="493" fill="#60a5fa" fontSize="8" textAnchor="middle">428 Open Spaces</text>
                </g>

                {/* ─── D. GEOFENCED PLACES (LIFE360 GEOFENCE RINGS) ─── */}
                {(mapLayerFilter === "ALL" || mapLayerFilter === "CIRCLES") &&
                  placesList.map((plc) => (
                    <g key={plc.id} className="transition-all duration-300">
                      {/* Outer Pulse Ring */}
                      <circle
                        cx={`${plc.coordinates.x * 10}`}
                        cy={`${plc.coordinates.y * 6.4}`}
                        r="48"
                        fill="rgba(245, 158, 11, 0.05)"
                        stroke="rgba(245, 158, 11, 0.45)"
                        strokeWidth="1.5"
                        strokeDasharray="5 3"
                      />
                    </g>
                  ))}

                {/* ─── E. TRAJECTORY BREADCRUMBS & GLOWING PATHWAYS ─── */}
                {(mapLayerFilter === "ALL" || mapLayerFilter === "CIRCLES") && (
                  <>
                    {/* Liam's Path: Science -> Mall -> PAGAC Academic Commons -> Union */}
                    <polyline
                      points="630,230 560,260 480,310 420,350 380,370"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Maya's Path: Gym -> Arts -> Union -> Library */}
                    <polyline
                      points="495,460 400,440 380,370 480,310"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Tyler's Driving Path: U-Village -> Johns Hopkins Universitytown -> Osler -> Garage */}
                    <polyline
                      points="817,130 600,120 250,220 247,480"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="4"
                      strokeDasharray="8 4"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Kwesi's Path */}
                    <polyline
                      points="480,310 460,320 380,370 630,230"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </>
                )}
              </svg>

              {/* 3. GEOFENCE PLACE FLOATING BADGES */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "CIRCLES") &&
                placesList.map((plc) => (
                  <div
                    key={plc.id}
                    style={{ top: `${plc.coordinates.y - 4}%`, left: `${plc.coordinates.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                  >
                    <div className="px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/60 text-[10px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-lg">
                      <span>{plc.icon}</span>
                      <span>{plc.placeName}</span>
                    </div>
                  </div>
                ))}

              {/* 4. TOP MAP HUD: LIFE360 CONTROL BAR */}
              <div className="relative z-20 p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                {/* Left: Circle Selector & Members */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Circle Selector Dropdown */}
                  <div className="relative flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-white font-bold">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={selectedCircleId}
                      onChange={(e) => setSelectedCircleId(e.target.value)}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
                    >
                      {hopkinsCircles.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.icon} {c.name} ({c.members.length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Invite Code Button */}
                  <button
                    onClick={() => setShowInviteCodeModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition"
                    title="Click to view & share invite code"
                  >
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{activeCircle.inviteCode || "JHU-9X4K"}</span>
                    <Copy className="w-2.5 h-2.5 ml-0.5 text-slate-400" />
                  </button>

                  {/* Members Drawer Toggle Button */}
                  <button
                    onClick={() => setIsMembersDrawerOpen(!isMembersDrawerOpen)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                      isMembersDrawerOpen
                        ? "bg-amber-500 text-black font-black shadow-md"
                        : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Members ({activeCircle.members.length})</span>
                  </button>
                </div>

                {/* Center: Map Style Mode Switcher */}
                <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setMapCartoMode("carto")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      mapCartoMode === "carto" ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    🗺️ Carto
                  </button>
                  <button
                    onClick={() => setMapCartoMode("satellite")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      mapCartoMode === "satellite" ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    🛰️ Satellite
                  </button>
                  <button
                    onClick={() => setMapCartoMode("night")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      mapCartoMode === "night" ? "bg-amber-500 text-black font-black" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    🌙 Night
                  </button>
                </div>

                {/* Right: Simulator, Place Alerts & 🚨 SOS */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Live Movement Simulator Toggle */}
                  <button
                    onClick={() => {
                      const nextState = !isSimulatingMovement;
                      setIsSimulatingMovement(nextState);
                      triggerToast(
                        nextState
                          ? "▶️ Live Movement Simulation Active: Circle members are walking & driving on campus."
                          : "⏸️ Live Movement Simulation Paused."
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm ${
                      isSimulatingMovement
                        ? "bg-emerald-500 text-black font-black animate-pulse"
                        : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500"
                    }`}
                  >
                    {isSimulatingMovement ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isSimulatingMovement ? "Simulating Walk" : "Simulate Walk"}</span>
                  </button>

                  {/* Place Alerts Button */}
                  <button
                    onClick={() => setShowPlaceAlertsModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Place Alerts</span>
                  </button>

                  {/* 🚨 360 Emergency SOS Button */}
                  <button
                    onClick={() => setShowSOSModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-lg animate-pulse"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SOS</span>
                  </button>
                </div>
              </div>

              {/* 5. COLLAPSIBLE LEFT-SIDE LIVE CIRCLE MEMBER DRAWER */}
              {isMembersDrawerOpen && (
                <div className="absolute top-14 left-3 bottom-14 z-30 w-72 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-3 flex flex-col justify-between animate-in fade-in slide-in-from-left-4 duration-200">
                  {/* Drawer Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{activeCircle.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-xs truncate max-w-[140px]">{activeCircle.name}</h4>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            {activeCircle.members.length} Live in Orbit
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowCreateCircleModal(true)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Create New Orbit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowJoinCircleModal(true)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Join with Code"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Member Cards List */}
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {activeCircle.members.map((mem) => (
                        <div
                          key={mem.id}
                          onClick={() => {
                            setSelectedLife360Member(mem);
                            triggerToast(`📍 Focused on ${mem.name} at ${mem.currentBuilding}`);
                          }}
                          className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500 cursor-pointer transition space-y-1.5 group"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Avatar */}
                            <div className="relative">
                              <img
                                src={mem.avatar}
                                alt={mem.name}
                                className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-500"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                                  mem.status === "on_campus" ? "bg-emerald-500" :
                                  mem.status === "driving" ? "bg-sky-500" :
                                  mem.status === "studying" ? "bg-amber-500" : "bg-slate-400"
                                }`}
                              />
                            </div>

                            {/* Name & Location */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition">
                                  {mem.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-400">
                                  {mem.distanceFt === 0 ? "You" : `${mem.distanceFt} ft`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{mem.currentBuilding}</p>
                            </div>
                          </div>

                          {/* Telemetry Row */}
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-700/40 text-slate-400 font-mono">
                            <span className="flex items-center gap-1 text-slate-300">
                              {mem.movementType === "driving" ? (
                                <span className="text-sky-400 font-semibold">🚗 {mem.speedMph} mph</span>
                              ) : mem.movementType === "walking" ? (
                                <span className="text-emerald-400 font-semibold">🚶 {mem.speedMph || 3.2} mph</span>
                              ) : (
                                <span className="text-amber-300">📍 Stationary</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Battery className="w-3 h-3 text-emerald-400" />
                              <span className="text-slate-200 font-bold">{mem.batteryPercent}%</span>
                              {mem.isCharging && <span className="text-emerald-400">⚡</span>}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drawer Bottom Quick Action */}
                  <button
                    onClick={() => setShowLocationSharePicker(true)}
                    className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ghost & Privacy Settings</span>
                  </button>
                </div>
              )}

              {/* 6. FLOATING QUICK MEMBERS BAR (WHEN DRAWER IS COLLAPSED) */}
              {!isMembersDrawerOpen && (
                <div className="absolute top-16 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-xl">
                  {activeCircle.members.map((mem) => (
                    <button
                      key={mem.id}
                      onClick={() => setSelectedLife360Member(mem)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition border border-slate-700"
                    >
                      <img src={mem.avatar} alt={mem.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400" />
                      <span>{mem.name.split(" ")[0]}</span>
                      <span className="text-[10px] text-amber-400 font-mono">({mem.batteryPercent}%)</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 7. MAP PINS & ENTITIES */}

              {/* A. Academic & Student Life Buildings */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "BUILDINGS") &&
                hopkinsBuildings.map((bld) => (
                  <button
                    key={bld.id}
                    onClick={() => {
                      setSelectedBuildingModal(bld);
                      setSelectedBuildingFloor(bld.floors[0]?.floorNumber || 1);
                    }}
                    style={{ top: `${bld.y}%`, left: `${bld.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 hover:scale-110 transition"
                  >
                    <div className="relative">
                      <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-pulse" />
                      <div className="relative px-3 py-1.5 rounded-2xl bg-slate-900 border-2 border-amber-500 text-white font-black text-xs shadow-2xl flex items-center gap-1.5 hover:bg-amber-500 hover:text-black transition">
                        <span>{bld.icon}</span>
                        <span>{bld.shortCode}</span>
                        <span className="text-[9px] font-mono opacity-80">({bld.occupancyPercent}%)</span>
                      </div>
                    </div>
                  </button>
                ))}

              {/* B. Blue JayOrbit 360 Life360 Member Pins (Avatar + Battery + Speed + Name) */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "CIRCLES") &&
                activeCircle.members.map((mem) => (
                  <button
                    key={mem.id}
                    onClick={() => {
                      setSelectedLife360Member(mem);
                      triggerToast(`📍 ${mem.name}: ${mem.currentBuilding} · ${mem.batteryPercent}% Battery · ${mem.distanceFt} ft away`);
                    }}
                    style={{ top: `${mem.y}%`, left: `${mem.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-30 transition-all duration-700"
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Pulse Halo for Moving Members */}
                      <span className={`absolute -inset-3 rounded-full animate-ping opacity-50 ${
                        mem.movementType === "driving" ? "bg-sky-500" :
                        mem.movementType === "walking" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />

                      {/* Avatar with Status Ring */}
                      <div className="relative">
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-11 h-11 rounded-full object-cover ring-3 ring-amber-400 shadow-2xl group-hover:scale-115 transition"
                        />
                        
                        {/* Top-Right Battery Pill Badge */}
                        <div className={`absolute -top-2.5 -right-4 px-1.5 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-0.5 shadow-lg ${
                          mem.batteryPercent > 50 ? "bg-emerald-600 text-white border-emerald-300" :
                          mem.batteryPercent > 20 ? "bg-amber-600 text-white border-amber-300" : "bg-rose-600 text-white border-rose-300"
                        }`}>
                          <span>🔋{mem.batteryPercent}%</span>
                          {mem.isCharging && <span>⚡</span>}
                        </div>

                        {/* Bottom-Right Movement Badge */}
                        <div className={`absolute -bottom-2 -right-2.5 px-1.5 py-0.5 rounded-md text-[9px] font-black border flex items-center shadow-lg ${
                          mem.movementType === "driving" ? "bg-sky-600 text-white border-sky-300" :
                          mem.movementType === "walking" ? "bg-emerald-600 text-white border-emerald-300" : "bg-slate-800 text-amber-300 border-slate-600"
                        }`}>
                          {mem.movementType === "driving" ? `🚗 ${mem.speedMph}m` :
                           mem.movementType === "walking" ? `🚶 ${mem.speedMph || 3.2}m` : "📍"}
                        </div>
                      </div>

                      {/* Member Name Tag */}
                      <span className="text-[10px] font-black bg-slate-900/95 text-amber-300 px-2.5 py-0.5 rounded-lg mt-1 border border-slate-700 shadow-xl whitespace-nowrap">
                        {mem.name.split(" ")[0]}
                      </span>
                    </div>
                  </button>
                ))}

              {/* C. Live GPS Blue Jay Ride Shuttles */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "SHUTTLES") &&
                hopkinsShuttles.map((sht) => (
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

              {/* D. Parking Garages */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "PARKING") &&
                hopkinsParking.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => triggerToast(`🅿️ ${pkg.name}: ${pkg.openSpaces} spaces available`)}
                    style={{ top: `${pkg.y}%`, left: `${pkg.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                  >
                    <div className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-[10px] shadow-lg border border-white flex items-center gap-1">
                      <span>🅿️</span>
                      <span>{pkg.openSpaces > 0 ? `${pkg.openSpaces} Open` : "Full"}</span>
                    </div>
                  </button>
                ))}

              {/* E. Safety Mode Blue Light Phones */}
              {(isSafetyModeActive || mapLayerFilter === "SAFETY") &&
                hopkinsSafetyBeacons.map((bcn) => (
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

              {/* F. Scavenger Hunt Checkpoints */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "SCAVENGER") &&
                hopkinsScavenger.map((chk) => (
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

              {/* G. HopkinsHousing Off-Campus Listings */}
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

              {/* H. NOAA / NWS Live Radar & Microclimate Layer */}
              {(mapLayerFilter === "ALL" || mapLayerFilter === "WEATHER") && (
                <>
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
                      <span>Red Square: {weatherReport.currentTemp}°F</span>
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
                      <span>O'Connor Recreation Center: {weatherReport.currentTemp - 1}°F · {weatherReport.windDirection} {weatherReport.windSpeedMph}mph</span>
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

              {/* 8. BOTTOM RADAR & NAVIGATION BAR */}
              <div className="relative z-20 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    📍 Johns Hopkins University Flagship Campus Quad
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>Nearest Shuttle: <strong className="text-amber-400">Blue Jay Bus #14 (2 mins away)</strong></span>
                  <span className="hidden md:inline text-slate-600">|</span>
                  <span className="hidden md:inline text-[11px] text-slate-400 font-mono">Scale: 1 in ≈ 500 ft</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerToast("🎯 Centered map on your current location (Red Square).")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-1"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Center Me</span>
                  </button>

                  <button
                    onClick={() => setShowNavigationRouteModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Turn-by-Turn Directions</span>
                  </button>
                </div>
              </div>

            </div>


            {/* 3 Grid Summary Cards Below Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Blue JayOrbit 360 Full Suite Hub */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">Blue JayOrbit 360 (Life360 Suite)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCreateCircleModal(true)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      + New
                    </button>
                    <button
                      onClick={() => setShowLocationSharePicker(true)}
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      Settings
                    </button>
                  </div>
                </div>

                {/* Circles List */}
                <div className="space-y-2.5 text-xs">
                  {hopkinsCircles.map((circle) => (
                    <div
                      key={circle.id}
                      onClick={() => setSelectedCircleId(circle.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 ${
                        selectedCircleId === circle.id
                          ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 ring-1 ring-amber-400"
                          : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{circle.icon}</span>
                          <span className="text-slate-900 dark:text-zinc-100">{circle.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          {circle.activeSharingCount} Live
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2 overflow-hidden py-0.5">
                          {circle.members.map((m) => (
                            <img
                              key={m.id}
                              src={m.avatar}
                              alt={m.name}
                              className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
                              title={`${m.name} (${m.batteryPercent}% Battery)`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Code: {circle.inviteCode || "JHU-9X4K"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Action Footer */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t dark:border-zinc-800 text-xs">
                  <button
                    onClick={() => setShowPlaceAlertsModal(true)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-slate-700 dark:text-zinc-300 transition flex items-center justify-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Place Alerts</span>
                  </button>
                  <button
                    onClick={() => setShowJoinCircleModal(true)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-slate-700 dark:text-zinc-300 transition flex items-center justify-center gap-1"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Join Orbit</span>
                  </button>
                </div>
              </div>

              {/* 2. Blue Jay Ride Shuttle Radar */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">Blue Jay Ride Live GPS</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">3 Buses Moving</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {hopkinsShuttles.map((sht) => (
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

              {/* 3. Blue Jay Scavenger Hunt & Treasure Radar */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold">Blue Jay Pride Scavenger Hunt</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    {hopkinsScavenger.filter((c) => c.isVisited).length} / {hopkinsScavenger.length} Visited
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {hopkinsScavenger.map((chk) => (
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
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        chk.isVisited ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"
                      }`}>
                        {chk.isVisited ? "Collected" : `+${chk.points} pts`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 🏠 DEDICATED MODULE: HOPKINSHOUSING & OFF-CAMPUS PLATFORM */}
        {/* ========================================================================= */}
        {activeTab === "housing" && (
          <div className="space-y-6">
            
            {/* Header & Quick Stats Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                  Johns Hopkins University (JHU) • Off-Campus Housing & Roommate Mesh
                </span>
                <h1 className="text-2xl font-black mt-0.5">HopkinsHousing — Find Your Campus Home</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Explore verified student apartments, colonial shared houses, roommate matching, virtual video walkthroughs, and direct Blue Jay Shuttle routes.
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
                                <span>📍 {listing.distanceFromCampusMiles} miles from PAGAC Academic Commons</span>
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
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Johns Hopkins University Peer Matchmaker</span>
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
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Johns Hopkins University Resident Services</span>
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
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Johns Hopkins University Student Cost of Living Calculator</h2>
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
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" title="Online on Johns Hopkins University Campus" />
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
                      <span className="text-[11px] text-blue-500" title="Verified Johns Hopkins University Student">
                        <ShieldCheck className="w-4 h-4 inline" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      B.S. {currentUser?.major || "Computer Science"} • Class of {currentUser?.gradYear || "2026"} ({currentUser?.classStanding || "Senior"})
                    </p>
                    
                    {/* Digital Campus Student ID Pill */}
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 mt-1">
                      <span>🪪 Johns Hopkins University ID ({currentUser?.studentId || "0982341"})</span>
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
                                👨‍🏫 {course.professor} • 📍 {course.room || "Brody Learning Commons & Milton S. Eisenhower Library"}
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

                  {/* Blue Jay Record Quick Card */}
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
                        <span>Blue Jay Record & Passport</span>
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
                      📍 Brody Learning Commons & Milton S. Eisenhower Library Rm 304 • Dr. Catherine Hayes
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
                    onClick={() => setShowJCardModal(true)}
                    className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🍔</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">12:15 PM • Wolman Hall Market Special</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">1 Swipe • Wallet →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      Maryland Crab Cakes & Blue Jay Crisp Salad • $9.50
                    </p>
                  </div>

                  {/* 4. Live Shuttle ETA */}
                  <div
                    onClick={() => {
                      setActiveTab("map");
                      setMoreSubView("map");
                      triggerToast("🚌 Blue Jay Ride GPS live tracking active.");
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 hover:border-amber-500 cursor-pointer transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🚌</span>
                        <span className="font-black text-slate-900 dark:text-zinc-100">Blue Jay Ride Shuttle #14</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">4m ETA (Map) →</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                      Arriving at PAGAC Academic Commons Stop ➔ Blue Jay Square
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
                      Blue Jay Square 2-Bed Sublease ($925/mo) • 0.3 mi
                    </p>
                  </div>

                  {/* 6. Evening Event */}
                  <div
                    onClick={() => {
                      setActiveTab("events");
                      triggerToast("🎉 Johns Hopkins University Cyber Summit & Cultural Gala loaded.");
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
                      Charles Commons (GSU) Ballrooms • Free Food & Campus XP
                    </p>
                  </div>

                  {/* 7. Volunteer Service */}
                  <div
                    onClick={() => {
                      setActiveTab("activities");
                      triggerToast("🤝 Volunteer opportunity loaded: +3.5h Blue Jay Record");
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
                      Johns Hopkins University Campus Green Planting Drive
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-bold">
                  <span className="text-slate-400">Synced with Canvas & Calendar</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCopilotInitialQuery("What is my schedule, next class, and assignment deadlines for today?");
                      setShowGlobalCopilot(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
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
                  📍 <strong>PAGAC Academic Commons</strong> (180 ft) · 🚌 <strong>Blue Jay Bus #14</strong> arriving in 2m.
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
        {/* TAB 2: 🏫 CAMPUS HUB (Hopkins UNIVERSITY FACILITIES & OPERATIONS) */}
        {activeTab === "campus" && (
          <div className="space-y-6">
            
            {/* 1. HERO OPERATING TELEMETRY BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/30 space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Johns Hopkins University (JHU) Operations & Facilities
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Normal Campus Operations (All Systems Operational)
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black mt-2">
                    {selectedCampus} Directory & Facilities Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Explore academic buildings and indoor blueprints, check live dining hall menus and lines, reserve 24/7 library pods, track Blue Jay Ride shuttles, and check live parking availability.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShow311Modal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-lg"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Report 311 Fix</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("map")}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition border border-slate-700 hover:border-amber-500 flex items-center gap-1.5 shadow-sm"
                  >
                    <MapIcon className="w-4 h-4 text-amber-400" />
                    <span>Open Vector Map</span>
                  </button>
                </div>
              </div>

              {/* 5 Real-Time Campus Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left pt-2 border-t border-white/10">
                {/* 1. Academic Buildings */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                    <span>BUILDINGS</span>
                    <Building2 className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-white font-mono">{hopkinsBuildings.length} Active</div>
                  <span className="text-[10px] text-emerald-400 font-bold block">120+ Classrooms</span>
                </div>

                {/* 2. Dining Venues */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                    <span>DINING VENUES</span>
                    <Coffee className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-white font-mono">14 Open Now</div>
                  <span className="text-[10px] text-amber-300 font-bold block">Avg Wait: 4.5 mins</span>
                </div>

                {/* 3. PAGAC Academic Commons Pods */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                    <span>BRODY & MSE LIBRARY</span>
                    <BookOpen className="w-3 h-3 text-sky-400" />
                  </div>
                  <div className="text-lg font-black text-white font-mono">58% Busy</div>
                  <span className="text-[10px] text-sky-300 font-bold block">Floors 1-3 Open 24/7</span>
                </div>

                {/* 4. Live Shuttles */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                    <span>SHUTTLE-UM BUS</span>
                    <Bus className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-white font-mono">{hopkinsShuttles.length} Buses Live</div>
                  <span className="text-[10px] text-emerald-400 font-bold block">Gold Route: 2m ETA</span>
                </div>

                {/* 5. Open Parking Spaces */}
                <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                    <span>OPEN PARKING</span>
                    <Car className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="text-lg font-black text-white font-mono">
                    {hopkinsParking.reduce((acc, p) => acc + p.openSpaces, 0)} Spaces
                  </div>
                  <span className="text-[10px] text-indigo-300 font-bold block">Across 3 Garages</span>
                </div>
              </div>
            </div>

            {/* 2. SUB-VIEW NAVIGATION TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              {[
                { id: "buildings", label: "🏛️ Academic Buildings & Blueprints" },
                { id: "dining", label: "🍔 Dining Menus, Hours & Mobile Order" },
                { id: "library", label: "📚 PAGAC Academic Commons 24/7 Pods & Tech" },
                { id: "shuttles", label: "🚌 Blue Jay Ride Live GPS Shuttles" },
                { id: "parking", label: "🅿️ Parking Garages & EV Chargers" },
                { id: "facilities", label: "🔧 Campus 311 & Maintenance Desk" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCampusHubSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl transition shrink-0 ${
                    campusHubSubTab === tab.id
                      ? "bg-amber-500 text-black font-black shadow-xs"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3. SUB-TAB 1: ACADEMIC BUILDINGS & INDOOR BLUEPRINTS */}
            {campusHubSubTab === "buildings" && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search buildings, room numbers (e.g. SC-304), study pods, or departments..."
                        value={buildingSearchQuery}
                        onChange={(e) => setBuildingSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 pl-10 pr-4 py-2.5 rounded-2xl text-xs border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold pt-1 border-t dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">CATEGORY:</span>
                    {[
                      { id: "ALL", label: "All Buildings" },
                      { id: "Academic", label: "🏛️ Academic" },
                      { id: "Library", label: "📚 Library & Study" },
                      { id: "Student Life", label: "🍕 Student Life & Dining" },
                      { id: "Athletics", label: "🏋️ Athletics & Rec" },
                      { id: "Residential", label: "🏠 Residential" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setBuildingCategoryFilter(pill.id)}
                        className={`px-3 py-1 rounded-full transition shrink-0 text-xs ${
                          buildingCategoryFilter === pill.id
                            ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-black font-black"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buildings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {hopkinsBuildings
                    .filter((bld) => {
                      const matchCat = buildingCategoryFilter === "ALL" || bld.category === buildingCategoryFilter;
                      const matchSearch = !buildingSearchQuery ||
                        bld.name.toLowerCase().includes(buildingSearchQuery.toLowerCase()) ||
                        bld.code.toLowerCase().includes(buildingSearchQuery.toLowerCase()) ||
                        bld.shortCode.toLowerCase().includes(buildingSearchQuery.toLowerCase()) ||
                        bld.description.toLowerCase().includes(buildingSearchQuery.toLowerCase());
                      return matchCat && matchSearch;
                    })
                    .map((bld) => (
                      <div
                        key={bld.id}
                        className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                      >
                        <div>
                          {/* Building Image Cover */}
                          <div className="h-44 bg-slate-800 relative overflow-hidden">
                            <img
                              src={bld.image}
                              alt={bld.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-white font-black text-xs border border-amber-500 shadow-md">
                                {bld.icon} {bld.shortCode}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold">
                                {bld.isOpenNow ? "Open Now" : "Closed"}
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                              <span className="font-mono text-[11px] opacity-90">📍 {bld.distanceFt} ft away</span>
                              <span className="font-bold text-amber-300 font-mono">{bld.occupancyPercent}% Occupancy</span>
                            </div>
                          </div>

                          {/* Building Content */}
                          <div className="p-5 space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                                  {bld.category} • Code {bld.code}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">{bld.floorsCount} Floors</span>
                              </div>
                              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition mt-0.5">
                                {bld.name}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                              {bld.description}
                            </p>

                            {/* Features Row */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t dark:border-zinc-800">
                              <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                                <span className="text-[10px] text-slate-400 block font-bold">Classrooms</span>
                                <span className="font-black text-slate-900 dark:text-zinc-100">{bld.classroomsCount}</span>
                              </div>
                              <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                                <span className="text-[10px] text-slate-400 block font-bold">Study Pods</span>
                                <span className="font-black text-amber-600 dark:text-amber-400">{bld.studySpacesCount}</span>
                              </div>
                              <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                                <span className="text-[10px] text-slate-400 block font-bold">Today Events</span>
                                <span className="font-black text-emerald-600">{bld.todayEventsCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedBuildingModal(bld);
                              setSelectedBuildingFloor(bld.floors[0]?.floorNumber || 1);
                            }}
                            className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>View Blueprints</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab("map");
                              triggerToast(`📍 Routing to ${bld.name} on Live Campus Map.`);
                            }}
                            className="py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5 text-amber-500" />
                            <span>Navigate</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. SUB-TAB 2: DINING MENUS & LIVE WAIT TIMES */}
            {campusHubSubTab === "dining" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      id: "din-1",
                      name: "Chick-fil-A",
                      location: "Charles Commons (GSU) Food Court",
                      hours: "10:30 AM - 9:00 PM",
                      waitMins: 6,
                      icon: "🍗",
                      mealSwipes: true,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80",
                      specials: ["Spicy Chicken Deluxe", "Waffle Potato Fries", "Fresh Squeezed Lemonade", "Cookies & Cream Shake"],
                      tags: ["Meal Exchange", "Quick Service", "High Demand"],
                    },
                    {
                      id: "din-2",
                      name: "Blue Jay Square Dining Hall",
                      location: "Blue Jay Square Commons (Floor 2)",
                      hours: "7:00 AM - 10:00 PM",
                      waitMins: 2,
                      icon: "🥗",
                      mealSwipes: true,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
                      specials: ["All-You-Care-To-Eat Chef Station", "Brick Oven Pizza", "Hydration Bar", "Vegan & Halal Corner"],
                      tags: ["All You Can Eat", "Dietary Friendly", "18 Stations"],
                    },
                    {
                      id: "din-3",
                      name: "Cool Beans Coffee (PAGAC) Donuts",
                      location: "PAGAC Academic Commons Ground Floor & Union",
                      hours: "6:30 AM - 11:00 PM",
                      waitMins: 4,
                      icon: "☕",
                      mealSwipes: false,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80",
                      specials: ["Iced Caramel Macchiato", "Avocado Toast", "Boston Kreme Donuts", "Cold Brew on Tap"],
                      tags: ["Coffee & Bakery", "Late Night Study", "Mobile Order"],
                    },
                    {
                      id: "din-4",
                      name: "Chesapeake Roasting Co. & Asian Kitchen",
                      location: "Charles Commons (GSU) Food Court",
                      hours: "11:00 AM - 8:00 PM",
                      waitMins: 5,
                      icon: "🍱",
                      mealSwipes: true,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
                      specials: ["Spicy Salmon Roll", "Chicken Teriyaki Bento", "Bubble Tea", "Steamed Gyoza"],
                      tags: ["Meal Exchange", "Fresh Daily", "Custom Bowls"],
                    },
                    {
                      id: "din-5",
                      name: "Einstein Bros. Bagels",
                      location: "Brody Learning Commons & Milton S. Eisenhower Library Main Atrium",
                      hours: "7:30 AM - 4:00 PM",
                      waitMins: 3,
                      icon: "🥑",
                      mealSwipes: true,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
                      specials: ["Farmhouse Egg & Cheddar Bagel", "Shmear Sampler", "Cold Brew Hazelnut", "Asiago Cheese Bagel"],
                      tags: ["Breakfast", "Atrium Lounge", "Mobile Order"],
                    },
                    {
                      id: "din-6",
                      name: "The Market C-Store",
                      location: "Blue Jay Square Commons & Wolman Hall",
                      hours: "8:00 AM - Midnight",
                      waitMins: 1,
                      icon: "🥪",
                      mealSwipes: true,
                      diningDollars: true,
                      image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&auto=format&fit=crop&q=80",
                      specials: ["Fresh Deli Sandwiches", "Cold Pressed Juices", "Dorm Essentials", "Late Night Snacks"],
                      tags: ["Groceries", "Grab & Go", "Late Night"],
                    },
                  ].map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{venue.icon}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                            ⏱️ {venue.waitMins} min wait
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">{venue.name}</h3>
                          <p className="text-xs text-slate-500">📍 {venue.location}</p>
                          <span className="text-[11px] text-amber-600 font-bold block mt-0.5">🕒 {venue.hours}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {venue.tags.map((tag) => (
                            <span key={tag} className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Popular Items:</span>
                          <p className="text-slate-700 dark:text-zinc-300 font-medium">
                            {venue.specials.join(" • ")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-zinc-800">
                        <button
                          onClick={() => triggerToast(`📱 Mobile order started for ${venue.name}!`)}
                          className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition"
                        >
                          Order Ahead
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("map");
                            triggerToast(`📍 Navigating to ${venue.name} at ${venue.location}.`);
                          }}
                          className="py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs transition"
                        >
                          Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SUB-TAB 3: BRODY & MSE LIBRARY 24/7 PODS & TECH CHECKOUT */}
            {campusHubSubTab === "library" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Floor Level Status */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>PAGAC Academic Commons Floor Occupancy</span>
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      {[
                        { floor: 1, name: "Floor 1 (Commons)", vibe: "Collaborative Buzz", busy: "72% Busy", hrs: "24/7 Access", color: "text-amber-500" },
                        { floor: 2, name: "Floor 2 (Quiet Study & Pods)", vibe: "Moderate Quiet", busy: "48% Busy", hrs: "24/7 Access", color: "text-emerald-500" },
                        { floor: 3, name: "Floor 3 (Deep Silent Study)", vibe: "Absolute Silence", busy: "35% Busy", hrs: "24/7 Access", color: "text-sky-500" },
                        { floor: 4, name: "Floor 4 (Archives & Tech)", vibe: "Research Hub", busy: "20% Busy", hrs: "8am - 10pm", color: "text-indigo-500" },
                      ].map((fl) => (
                        <div
                          key={fl.floor}
                          onClick={() => setSelectedLibraryFloor(fl.floor)}
                          className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                            selectedLibraryFloor === fl.floor
                              ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500"
                              : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{fl.name}</span>
                            <span className={fl.color}>{fl.busy}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{fl.vibe}</span>
                            <span>{fl.hrs}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Pods Reservation Engine */}
                  <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                          Reservable Study Pods (Floor {selectedLibraryFloor})
                        </h3>
                        <p className="text-xs text-slate-500">Equipped with 4K AirPlay displays, whiteboards, and power hubs.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                        6 Pods Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "pod-1", name: "Study Pod A-01", capacity: "4 Persons", hasAV: true, status: "Available", roomCode: "CK-201" },
                        { id: "pod-2", name: "Study Pod A-02", capacity: "6 Persons", hasAV: true, status: "Available", roomCode: "CK-202" },
                        { id: "pod-3", name: "Focus Nook B-11", capacity: "2 Persons", hasAV: false, status: "Available", roomCode: "CK-211" },
                        { id: "pod-4", name: "Media Collab Suite", capacity: "8 Persons", hasAV: true, status: "Reserved", roomCode: "CK-240" },
                      ].map((pod) => (
                        <div
                          key={pod.id}
                          className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{pod.name}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              pod.status === "Available" ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-200 text-slate-500"
                            }`}>
                              {pod.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">👥 {pod.capacity} • 📺 4K Screen & HDMI</p>
                          <button
                            onClick={() => {
                              setReservedPodId(pod.id);
                              triggerToast(`🎉 Reserved ${pod.name} for 2 hours! Door PIN: 4829`);
                            }}
                            disabled={pod.status !== "Available"}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-black py-2 rounded-xl text-xs transition"
                          >
                            {reservedPodId === pod.id ? "Reserved (PIN: 4829) ✓" : "Reserve 2-Hour Slot"}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Tech Checkout Locker */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h4 className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
                          <Laptop className="w-4 h-4" /> 24-Hour Tech Checkout Desk
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          24 Dell XPS Laptops, 8 Podcasting Mic Kits, and USB-C Chargers in stock.
                        </p>
                      </div>
                      <button
                        onClick={() => triggerToast("💻 Tech Checkout requested! Pick up at Floor 1 Help Desk with Blue Jay JCard.")}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition border border-slate-700"
                      >
                        Request Device
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SUB-TAB 4: SHUTTLE-UM LIVE TRANSIT */}
            {campusHubSubTab === "shuttles" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {hopkinsShuttles.map((sht) => (
                    <div
                      key={sht.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                            <Bus className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">{sht.routeName}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">Bus #{sht.busNumber}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                          {sht.etaMinutes} min ETA
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border">
                        <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
                          <span className="font-bold">Next Stop:</span>
                          <span className="font-black text-slate-900 dark:text-zinc-100">{sht.nextStop}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Capacity:</span>
                          <span className="text-emerald-600 font-bold">{sht.occupancyStatus}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("map");
                          triggerToast(`🚌 Tracking Blue Jay Ride Bus #${sht.busNumber} live on campus map.`);
                        }}
                        className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs py-2.5 rounded-xl transition"
                      >
                        Track Bus on Map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SUB-TAB 5: PARKING GARAGES & EV CHARGERS */}
            {campusHubSubTab === "parking" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {hopkinsParking.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🅿️</span>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">{pkg.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">Code {pkg.code}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-full ${
                        pkg.openSpaces > 50 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {pkg.openSpaces} Open
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Total Spaces:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{pkg.totalSpaces}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>EV Fast Chargers:</span>
                        <span className="font-bold text-emerald-600">{pkg.evChargingAvailable} Available</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Permits Valid:</span>
                        <span className="font-bold text-slate-700 dark:text-zinc-300">{pkg.permitTypes.join(", ")}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("map");
                        triggerToast(`🅿️ Navigating to ${pkg.name} on map.`);
                      }}
                      className="w-full bg-slate-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs py-2.5 rounded-xl transition"
                    >
                      Navigate to Garage
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 8. SUB-TAB 6: CAMPUS 311 & FACILITIES DESK */}
            {campusHubSubTab === "facilities" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-500" />
                      <span>Johns Hopkins University 311 Campus Facilities & Maintenance Dispatch</span>
                    </h3>
                    <p className="text-xs text-slate-500">Report broken fixtures, heating/AC issues, lighting, and request urgent repairs.</p>
                  </div>
                  <button
                    onClick={() => setShow311Modal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2.5 rounded-2xl transition shadow-md"
                  >
                    + Submit 311 Ticket
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "req-1", title: "Water Bottle Refill Station Filter Replacement", location: "Brody Learning Commons & Milton S. Eisenhower Library 2nd Floor", status: "In Progress", eta: "Today by 4 PM", category: "Plumbing" },
                    { id: "req-2", title: "Study Pod B-04 HDMI Cable Replacement", location: "PAGAC Academic Commons 2nd Floor", status: "Resolved ✓", eta: "Completed", category: "AV / Tech" },
                    { id: "req-3", title: "Blue Jay Square Pedestrian Path Light Bulb Out", location: "Near Marshall Hall", status: "Dispatched", eta: "Tomorrow 9 AM", category: "Lighting & Safety" },
                  ].map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border flex items-center justify-between flex-wrap gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] bg-slate-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                            {ticket.category}
                          </span>
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            ticket.status.includes("Resolved") ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-zinc-100">{ticket.title}</h4>
                        <p className="text-slate-400">📍 {ticket.location}</p>
                      </div>
                      <span className="font-mono text-slate-500">{ticket.eta}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 👥 ORGANIZATIONS */}
        {/* ========================================================================= */}
        {activeTab === "organizations" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Hero Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Johns Hopkins University Involvement & Leadership
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    264 Active Recognized Orgs
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1.5">
                  Student Organizations & Greek Life Hub
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl mt-1">
                  Discover student clubs, leadership opportunities, Greek councils, SGA funding appropriations, and campus traditions.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowStartClubModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a New Student Org</span>
                </button>
                <button
                  onClick={() => setShowSgaGrantModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-bold text-xs transition flex items-center gap-2 border border-slate-200 dark:border-zinc-700"
                >
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Request SGA Grant</span>
                </button>
              </div>
            </div>

            {/* Live Telemetry Banner (5 Vital Org Metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Recognized Orgs</span>
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">264</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>+12 New This Term</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Blue Jays Involved</span>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">14,850</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  73% Undergrad Rate
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Meetings This Week</span>
                  <Calendar className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">42</div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                  18 in Charles Commons (GSU)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">SGA Grant Pool</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">$1.24M</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  $315k Available Spring
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Greek Life</span>
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">34</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                  4 Councils (NPHC/IFC/PHA)
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: "explore", label: "Discover & Directory", icon: Compass, count: clubs.length },
                { id: "my-orgs", label: "My Memberships & Exec Desk", icon: Crown, count: clubs.filter(c => c.isJoined).length },
                { id: "greek", label: "Greek Life & Councils", icon: ShieldCheck, count: 34 },
                { id: "sga-grants", label: "SGA Funding & Grants", icon: DollarSign, count: "$1.24M" },
                { id: "calendar", label: "GBM & Events Schedule", icon: Calendar, count: 42 },
                { id: "incubator", label: "Start a Club (Incubator)", icon: Rocket, count: "Apply" }
              ].map((sub) => {
                const IconComponent = sub.icon;
                const isActive = orgSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setOrgSubTab(sub.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-400 dark:text-amber-500" : ""}`} />
                    <span>{sub.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      isActive
                        ? "bg-amber-500 text-black"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    }`}>
                      {sub.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* SUB-TAB 1: 🌟 DISCOVER & DIRECTORY */}
            {/* ========================================================================= */}
            {orgSubTab === "explore" && (
              <div className="space-y-6">
                {/* Search & Category Filter Pills */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search 264+ organizations by name, keyword, or major (e.g. Cybersecurity, African, Business, Pre-Med)..."
                      value={orgSearchQuery}
                      onChange={(e) => setOrgSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
                    />
                    {orgSearchQuery && (
                      <button
                        onClick={() => setOrgSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
                    {["All", "Cultural", "Academic", "Professional", "Greek", "Student Org", "Sports", "Volunteer"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setOrgCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          orgCategoryFilter === cat
                            ? "bg-amber-500 text-black shadow-xs font-black"
                            : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Organizations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubs
                    .filter((org) => {
                      const matchesSearch =
                        org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                        org.description.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
                        (org.tags && org.tags.some(t => t.toLowerCase().includes(orgSearchQuery.toLowerCase())));
                      const matchesCategory =
                        orgCategoryFilter === "All" || org.category === orgCategoryFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((org) => {
                      return (
                        <div
                          key={org.id}
                          className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Card Banner Image */}
                            <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                              <img
                                src={org.banner || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80"}
                                alt={org.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              
                              {/* Category Badge & Council Badge */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                                  {org.category}
                                </span>
                                {org.council && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/90 text-black border border-amber-400/50">
                                    {org.council}
                                  </span>
                                )}
                              </div>

                              {/* Members Count Badge */}
                              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                                <Users className="w-3 h-3 text-amber-400" />
                                <span>{org.membersCount} Members</span>
                              </div>

                              {/* Org Emoji Logo */}
                              <div className="absolute -bottom-4 left-5 w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-md flex items-center justify-center text-2xl">
                                {org.logo}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="pt-6 px-5 pb-3 space-y-3">
                              <div>
                                <h3 className="font-black text-base text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-500 transition">
                                  {org.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                  {org.description}
                                </p>
                              </div>

                              {/* Meeting & Dues Badges */}
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-semibold truncate">{org.meetingTime || "Weekly Meetings @ Union"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{org.meetingLocation || "Charles Commons (GSU)"}</span>
                                </div>
                              </div>

                              {/* Tags */}
                              {org.tags && org.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {org.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                      #{tag}
                                    </span>
                                  ))}
                                  {org.tags.length > 3 && (
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      +{org.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                            <button
                              onClick={() => {
                                setSelectedOrgModal(org);
                                setSelectedOrgDrawerTab("about");
                              }}
                              className="text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-amber-500 transition flex items-center gap-1"
                            >
                              <span>View Profile & Bylaws</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setClubs(prev => prev.map(c => {
                                  if (c.id === org.id) {
                                    const nextState = !c.isJoined;
                                    return {
                                      ...c,
                                      isJoined: nextState,
                                      membersCount: nextState ? c.membersCount + 1 : c.membersCount - 1
                                    };
                                  }
                                  return c;
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                org.isJoined
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
                                  : "bg-amber-500 hover:bg-amber-600 text-black shadow-xs"
                              }`}
                            >
                              {org.isJoined ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Joined</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Join Club</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 2: 👑 MY MEMBERSHIPS & EXEC DESK */}
            {/* ========================================================================= */}
            {orgSubTab === "my-orgs" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span>My Active Memberships & Leadership Desk</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      You are currently active in {clubs.filter(c => c.isJoined).length} Johns Hopkins University organizations. Manage executive meeting check-ins, rosters, and budgets below.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOrgSubTab("explore")}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Join More Clubs</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {clubs.filter(c => c.isJoined).map((org) => (
                    <div key={org.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800">{org.logo}</span>
                          <div>
                            <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{org.name}</h3>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{org.category} • {org.membersCount} Members</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active Member
                        </span>
                      </div>

                      {/* Next Meeting Banner */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            Next General Body Meeting (GBM)
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            Upcoming
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {org.nextEvent || `${org.meetingTime} @ ${org.meetingLocation}`}
                        </p>
                      </div>

                      {/* Exec Quick Actions */}
                      <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          onClick={() => setShowAttendanceQrModal(org)}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition flex flex-col items-center gap-1 text-center"
                        >
                          <QrCode className="w-4 h-4 text-blue-500" />
                          <span className="text-[11px]">Attendance QR</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrgModal(org);
                            setSelectedOrgDrawerTab("projects");
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition flex flex-col items-center gap-1 text-center"
                        >
                          <Briefcase className="w-4 h-4 text-amber-500" />
                          <span className="text-[11px]">Projects ({org.projects.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setSgaGrantFormData(prev => ({ ...prev, clubName: org.name }));
                            setShowSgaGrantModal(true);
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition flex flex-col items-center gap-1 text-center"
                        >
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-[11px]">SGA Budget</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 3: 🏛️ GREEK LIFE & COUNCILS */}
            {/* ========================================================================= */}
            {orgSubTab === "greek" && (
              <div className="space-y-8">
                {/* 4 Councils Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-linear-to-br from-amber-500/10 to-transparent border border-amber-500/20 space-y-2">
                    <span className="text-2xl">🔱</span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">National Pan-Hellenic Council</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Historically Black Greek-letter organizations (Divine Nine).</p>
                    <div className="pt-2 text-xs font-bold text-amber-600 dark:text-amber-400">9 Chapters at TU</div>
                  </div>

                  <div className="p-5 rounded-3xl bg-linear-to-br from-blue-500/10 to-transparent border border-blue-500/20 space-y-2">
                    <span className="text-2xl">🛡️</span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Interfraternity Council (IFC)</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Men's social and leadership fraternities.</p>
                    <div className="pt-2 text-xs font-bold text-blue-600 dark:text-blue-400">12 Chapters at TU</div>
                  </div>

                  <div className="p-5 rounded-3xl bg-linear-to-br from-rose-500/10 to-transparent border border-rose-500/20 space-y-2">
                    <span className="text-2xl">🌸</span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Panhellenic Association (PHA)</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">National women's sororities focused on sisterhood & philanthropy.</p>
                    <div className="pt-2 text-xs font-bold text-rose-600 dark:text-rose-400">8 Chapters at TU</div>
                  </div>

                  <div className="p-5 rounded-3xl bg-linear-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-2">
                    <span className="text-2xl">🌐</span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">Multicultural Greek Council</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Culturally-based Latinx, Asian, and professional fraternities.</p>
                    <div className="pt-2 text-xs font-bold text-purple-600 dark:text-purple-400">5 Chapters at TU</div>
                  </div>
                </div>

                {/* Greek Chapters Directory */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Featured Greek Chapters & Rush Schedules</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.filter(c => c.category === "Greek").map((org) => (
                      <div key={org.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">{org.logo}</span>
                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">{org.name}</h3>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{org.council} • Est. {org.foundedYear}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{org.description}</p>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Dues:</span>
                            <span className="font-bold text-slate-900 dark:text-zinc-100">{org.dues}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Rush Event:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 truncate max-w-[180px]">{org.nextEvent}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedOrgModal(org);
                            setSelectedOrgDrawerTab("about");
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition"
                        >
                          View Chapter Profile & Rush Info
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 4: 💰 SGA FUNDING & GRANTS */}
            {/* ========================================================================= */}
            {orgSubTab === "sga-grants" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <span>SGA Appropriations & Financial Grant Desk</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                      Johns Hopkins University Student Government Association allocates over $1.24M annually to fund student org conferences, guest lecturers, equipment, and campus culture galas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSgaGrantModal(true)}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit New Grant Request</span>
                  </button>
                </div>

                {/* SGA Grant Ledger */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Recent Appropriations Ledger (Spring 2026)</h3>
                    <span className="text-xs text-slate-500">Updated 2h ago</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                    {[
                      { org: "Johns Hopkins University Cybersecurity Club", amount: "$12,500", purpose: "MACCDC National Finals Defense Lab & Travel", status: "Approved & Disbursed", date: "Feb 28, 2026", type: "Conference Travel" },
                      { org: "African Student Association", amount: "$6,800", purpose: "Annual Pan-African Cultural Gala & Catering", status: "Approved & Disbursed", date: "Feb 24, 2026", type: "Cultural Event" },
                      { org: "Johns Hopkins University Blue Jays Esports", amount: "$11,000", purpose: "NACE Regional LAN Gaming Stations & Tournament Licenses", status: "Under Senate Review", date: "Mar 02, 2026", type: "Equipment" },
                      { org: "Women in Computer Science (WiCS)", amount: "$8,500", purpose: "Grace Hopper 2026 Student Travel Cohort", status: "Approved", date: "Feb 19, 2026", type: "Conference Travel" },
                      { org: "Johns Hopkins University Investment Group", amount: "$9,200", purpose: "Bloomberg Terminal Student Lab Access Subscriptions", status: "Approved & Disbursed", date: "Feb 12, 2026", type: "Academic Software" },
                      { org: "Black Student Union (BSU)", amount: "$14,000", purpose: "Black History Month Keynote Speaker & Alumni Summit", status: "Approved & Disbursed", date: "Feb 05, 2026", type: "Keynote / Speaker" }
                    ].map((grant, idx) => (
                      <div key={idx} className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-zinc-100">{grant.org}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {grant.type}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-zinc-400">{grant.purpose}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{grant.amount}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            grant.status.includes("Approved")
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                            {grant.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 5: 📅 GBM & EVENT CALENDAR */}
            {/* ========================================================================= */}
            {orgSubTab === "calendar" && (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">Weekly General Body Meetings (GBM) Schedule</h2>
                    <p className="text-xs text-slate-500">All student org meetings are open to currently enrolled JHU students.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">42 Meetings This Week</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clubs.map((org) => (
                    <div key={org.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-start gap-4">
                      <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 shrink-0">{org.logo}</span>
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100">{org.name}</h3>
                          <span className="text-xs text-amber-600 font-bold">{org.category}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold">{org.meetingTime || "Thursdays @ 6:00 PM"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{org.meetingLocation || "Charles Commons (GSU)"}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrgModal(org);
                            setSelectedOrgDrawerTab("about");
                          }}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>View Meeting Details & RSVP</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 6: 🚀 CLUB INCUBATOR (START A NEW ORG) */}
            {/* ========================================================================= */}
            {orgSubTab === "incubator" && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Student Organization Incubator</h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Want to start a new club at Johns Hopkins University? The Office of Student Involvement provides step-by-step incubation, SGA seed funding ($500), free room reservation privileges, and faculty mentorship.
                  </p>
                </div>

                {/* 4 Steps Stepper */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { step: 1, label: "Concept & Category" },
                    { step: 2, label: "Executive Board" },
                    { step: 3, label: "Faculty Advisor" },
                    { step: 4, label: "Constitution & Review" }
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => setNewClubStep(s.step)}
                      className={`p-3 rounded-2xl border transition ${
                        newClubStep === s.step
                          ? "bg-amber-500 text-black border-amber-500 font-black shadow-xs"
                          : newClubStep > s.step
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold"
                          : "bg-slate-100 dark:bg-zinc-800/80 text-slate-400 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">Step {s.step}</div>
                      <div className="truncate mt-0.5">{s.label}</div>
                    </button>
                  ))}
                </div>

                {/* Step Form Container */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
                  {newClubSuccess ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
                        ✓
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Application Submitted to SGA & Student Involvement!</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your application for <strong>{newClubData.name || "New Student Organization"}</strong> is under review by the SGA Affiliations Committee. Expect a hearing notice within 5 business days.
                      </p>
                      <button
                        onClick={() => {
                          setNewClubSuccess(false);
                          setNewClubStep(1);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
                      >
                        Submit Another Organization
                      </button>
                    </div>
                  ) : (
                    <>
                      {newClubStep === 1 && (
                        <div className="space-y-4">
                          <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Step 1: Organization Concept & Purpose</h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Organization Proposed Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Johns Hopkins University Quantum Computing Club"
                              value={newClubData.name}
                              onChange={(e) => setNewClubData({ ...newClubData, name: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Organization Category</label>
                            <select
                              value={newClubData.category}
                              onChange={(e) => setNewClubData({ ...newClubData, category: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            >
                              {["Academic", "Cultural", "Professional", "Sports", "Volunteer", "Special Interest"].map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Mission Statement & Purpose</label>
                            <textarea
                              rows={3}
                              placeholder="Describe the goals, intended campus impact, and target student audience..."
                              value={newClubData.description}
                              onChange={(e) => setNewClubData({ ...newClubData, description: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                        </div>
                      )}

                      {newClubStep === 2 && (
                        <div className="space-y-4">
                          <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Step 2: Founding Executive Officers</h3>
                          <p className="text-xs text-slate-500">Johns Hopkins University (JHU) requires a minimum of 3 executive officers in good academic standing (GPA {'>='} 2.50).</p>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">President Full Name & NetID</label>
                            <input
                              type="text"
                              placeholder="e.g. Kwesi Asiedu (kasied1@students.hopkins.edu)"
                              value={newClubData.president}
                              onChange={(e) => setNewClubData({ ...newClubData, president: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Official Contact Email</label>
                            <input
                              type="email"
                              placeholder="e.g. quantum@hopkins.edu"
                              value={newClubData.email}
                              onChange={(e) => setNewClubData({ ...newClubData, email: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                        </div>
                      )}

                      {newClubStep === 3 && (
                        <div className="space-y-4">
                          <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Step 3: Faculty / Staff Advisor</h3>
                          <p className="text-xs text-slate-500">All recognized organizations must have a full-time JHU faculty or staff member as primary advisor.</p>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Advisor Name & Department</label>
                            <input
                              type="text"
                              placeholder="e.g. Dr. Michael O'Leary, Computer & Information Sciences"
                              value={newClubData.advisor}
                              onChange={(e) => setNewClubData({ ...newClubData, advisor: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                        </div>
                      )}

                      {newClubStep === 4 && (
                        <div className="space-y-4">
                          <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Step 4: Constitution & 10 Founding Roster</h3>
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <span className="font-black">Standard JHU Non-Discrimination Clause:</span>
                            <p>Membership in this organization is open to all currently enrolled Johns Hopkins University (JHU) students without regard to race, religion, gender, sexual orientation, or disability.</p>
                          </div>
                          <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-2">
                            <FileText className="w-8 h-8 mx-auto text-amber-500" />
                            <div>Drag and drop your <strong>Club Constitution & Bylaws (.pdf/.docx)</strong></div>
                            <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px]">
                              Browse Files
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
                        {newClubStep > 1 ? (
                          <button
                            onClick={() => setNewClubStep(prev => prev - 1)}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs"
                          >
                            Back
                          </button>
                        ) : <div />}

                        {newClubStep < 4 ? (
                          <button
                            onClick={() => setNewClubStep(prev => prev + 1)}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition"
                          >
                            Continue to Step {newClubStep + 1}
                          </button>
                        ) : (
                          <button
                            onClick={() => setNewClubSuccess(true)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition"
                          >
                            Submit Club Application
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 1: 📋 FULL CLUB PROFILE & BYLAWS DRAWER */}
            {/* ========================================================================= */}
            {selectedOrgModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Modal Banner Header */}
                  <div className="relative h-44 w-full bg-slate-200 dark:bg-zinc-800 shrink-0">
                    <img
                      src={selectedOrgModal.banner || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80"}
                      alt={selectedOrgModal.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <button
                      onClick={() => setSelectedOrgModal(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-lg flex items-center justify-center text-3xl">
                          {selectedOrgModal.logo}
                        </div>
                        <div className="text-white">
                          <h2 className="font-black text-xl leading-tight">{selectedOrgModal.name}</h2>
                          <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px]">
                              {selectedOrgModal.category}
                            </span>
                            <span>• {selectedOrgModal.membersCount} Active Blue Jays</span>
                            {selectedOrgModal.foundedYear && (
                              <span>• Est. {selectedOrgModal.foundedYear}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setClubs(prev => prev.map(c => {
                            if (c.id === selectedOrgModal.id) {
                              const nextState = !c.isJoined;
                              return {
                                ...c,
                                isJoined: nextState,
                                membersCount: nextState ? c.membersCount + 1 : c.membersCount - 1
                              };
                            }
                            return c;
                          }));
                          setSelectedOrgModal(prev => prev ? { ...prev, isJoined: !prev.isJoined, membersCount: !prev.isJoined ? prev.membersCount + 1 : prev.membersCount - 1 } : null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
                          selectedOrgModal.isJoined
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 hover:bg-amber-600 text-black shadow-md"
                        }`}
                      >
                        {selectedOrgModal.isJoined ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Member</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Join Organization</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Modal Inner Tabs */}
                  <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-zinc-800">
                    {[
                      { id: "about", label: "About & Meetings", icon: Info },
                      { id: "leadership", label: "Leadership Board", icon: Users },
                      { id: "projects", label: `Active Projects (${selectedOrgModal.projects.length})`, icon: Briefcase },
                      { id: "documents", label: `Bylaws & Docs (${selectedOrgModal.documents.length})`, icon: FileText }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = selectedOrgDrawerTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedOrgDrawerTab(t.id as any)}
                          className={`px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
                            isActive
                              ? "border-amber-500 text-amber-600 dark:text-amber-400"
                              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                    {selectedOrgDrawerTab === "about" && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Mission & Description</h4>
                          <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed text-sm">
                            {selectedOrgModal.aboutText || selectedOrgModal.description}
                          </p>
                        </div>

                        {/* Meeting Schedule Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2">
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100">Meeting & Location Schedule</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span>{selectedOrgModal.meetingTime || "Thursdays @ 6:00 PM"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                              <MapPin className="w-4 h-4 text-rose-500" />
                              <span>{selectedOrgModal.meetingLocation || "Charles Commons (GSU) Rm 320"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact & Socials */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Email</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">{selectedOrgModal.contactEmail || "studentorg@hopkins.edu"}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Instagram</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedOrgModal.instagram || "@hopkins_blue jays"}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Annual Dues</span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">{selectedOrgModal.dues || "$0 / Free"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrgDrawerTab === "leadership" && (
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Executive Board Officers</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedOrgModal.leadership.map((officer, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-3.5">
                              <img
                                src={officer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                                alt={officer.name}
                                className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                              />
                              <div>
                                <h5 className="font-black text-slate-900 dark:text-zinc-100 text-sm">{officer.name}</h5>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{officer.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedOrgDrawerTab === "projects" && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Active Initiatives & Committees</h4>
                        {selectedOrgModal.projects.map((proj) => (
                          <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="font-black text-slate-900 dark:text-zinc-100">{proj.title}</h5>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                proj.status === "In Progress"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : proj.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}>
                                {proj.status}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400">{proj.description}</p>
                            <span className="text-[10px] text-slate-400 block pt-1">Project Lead: {proj.lead}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedOrgDrawerTab === "documents" && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Official Bylaws & Documents</h4>
                        {selectedOrgModal.documents.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-amber-500" />
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-zinc-100">{doc.name}</h5>
                                <span className="text-[10px] text-slate-400">{doc.type} • {doc.size}</span>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              download
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: 💵 SGA FUNDING GRANT REQUEST MODAL */}
            {/* ========================================================================= */}
            {showSgaGrantModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg p-6 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">SGA Grant Application</h3>
                        <span className="text-xs text-slate-500">Student Government Appropriations Desk</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSgaGrantModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {sgaGrantSuccessToast ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
                        ✓
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-zinc-100 text-sm">Grant Request Submitted!</h4>
                      <p className="text-xs text-slate-500">{sgaGrantSuccessToast}</p>
                      <button
                        onClick={() => {
                          setSgaGrantSuccessToast(null);
                          setShowSgaGrantModal(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Applying Organization</label>
                        <select
                          value={sgaGrantFormData.clubName}
                          onChange={(e) => setSgaGrantFormData({ ...sgaGrantFormData, clubName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                        >
                          {clubs.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Requested Amount ($)</label>
                          <input
                            type="number"
                            value={sgaGrantFormData.amount}
                            onChange={(e) => setSgaGrantFormData({ ...sgaGrantFormData, amount: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                            placeholder="1500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Grant Category</label>
                          <select
                            value={sgaGrantFormData.purpose}
                            onChange={(e) => setSgaGrantFormData({ ...sgaGrantFormData, purpose: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                          >
                            <option value="Conference Travel & Registration">Conference Travel</option>
                            <option value="Campus Event & Catering">Event & Catering</option>
                            <option value="Equipment & Hardware">Equipment & Hardware</option>
                            <option value="Guest Speaker Honorarium">Guest Speaker</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Detailed Line-Item Justification</label>
                        <textarea
                          rows={3}
                          value={sgaGrantFormData.description}
                          onChange={(e) => setSgaGrantFormData({ ...sgaGrantFormData, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                          placeholder="Explain how these funds directly benefit JHU students..."
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <button
                          onClick={() => setShowSgaGrantModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSgaGrantSuccessToast(`Application for $${sgaGrantFormData.amount} submitted to SGA Senate. Ticket #SGA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-500/20"
                        >
                          Submit to SGA Senate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: 📱 ATTENDANCE QR CODE CHECK-IN MODAL */}
            {/* ========================================================================= */}
            {showAttendanceQrModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-sm p-6 space-y-4 text-center shadow-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Live Meeting Check-In</span>
                    <button onClick={() => setShowAttendanceQrModal(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-3xl">{showAttendanceQrModal.logo}</span>
                    <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{showAttendanceQrModal.name}</h3>
                    <p className="text-xs text-slate-500">Scan QR Code or enter passcode below to verify meeting attendance.</p>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 flex flex-col items-center justify-center shadow-inner mx-auto w-48 h-48">
                    <QrCode className="w-36 h-36 text-slate-900" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Meeting Check-In PIN</span>
                    <div className="text-2xl font-black text-amber-500 tracking-widest">
                      {Math.floor(1000 + Math.random() * 9000)}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAttendanceQrModal(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
                  >
                    Close Attendance Window
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Hero Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Johns Hopkins University Campus Life & Traditions
                  </span>
                  <div
                    onClick={() => {
                      setShowWeatherModal(true);
                      setWeatherModalTab("now");
                    }}
                    className="cursor-pointer flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 hover:bg-sky-500/20 transition"
                  >
                    <span>{weatherReport?.conditionIcon || "☀️"}</span>
                    <span>{weatherReport?.currentTemp ?? 79}°F {weatherReport?.conditionText || "Partly Cloudy"}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">· Outdoor Friendly ✓</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1.5">
                  Campus Events, Athletics & Ticket Box Office
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl mt-1">
                  Discover official university keynotes, CAA Division-I sports matchups, Blue Jayfest concerts, career fairs, and claim student mobile tickets.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowHostEventModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Host a Campus Event</span>
                </button>
                <button
                  onClick={() => setEventSubTab("my-tickets")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-bold text-xs transition flex items-center gap-2 border border-slate-200 dark:border-zinc-700"
                >
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span>My Passes ({events.filter(e => e.userRsvp === "GOING").length})</span>
                </button>
              </div>
            </div>

            {/* Live Event Telemetry Banner (5 Vital Pulse Gauges) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Happening Today</span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">8 Events</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>3 Free Food Sessions</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Blue Jay Athletics</span>
                  <Trophy className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">5 D-I Games</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  Blue Jay Stadium & Unitas
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Passes Claimed</span>
                  <Ticket className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">4,320</div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                  92% Student Take-up
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Blue Jayfest 2026</span>
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">48 Days</div>
                <div className="text-[11px] text-slate-500 font-bold">
                  Blue Jay Stadium Lawn Concert
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-semibold">Atmospheric Index</span>
                  <CloudSun className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">79°F</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Lawn Activities Active
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: "all", label: "All Campus Events", icon: Calendar, count: events.length },
                { id: "athletics", label: "Blue Jay Athletics (D-I)", icon: Trophy, count: events.filter(e => e.category === "Athletics").length },
                { id: "concerts", label: "Concerts & Blue Jayfest (CAB)", icon: Music, count: events.filter(e => e.category === "Concert" || e.category === "Tradition").length },
                { id: "my-tickets", label: "My Passes & Wallet", icon: Ticket, count: events.filter(e => e.userRsvp === "GOING").length },
                { id: "career", label: "Career Fairs & Hacks", icon: Sparkles, count: events.filter(e => e.category === "Career Fair" || e.category === "Hackathon").length },
                { id: "host", label: "Host / Reserve Space", icon: Plus, count: "Book" }
              ].map((sub) => {
                const IconComponent = sub.icon;
                const isActive = eventSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setEventSubTab(sub.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-400 dark:text-amber-500" : ""}`} />
                    <span>{sub.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      isActive
                        ? "bg-amber-500 text-black"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    }`}>
                      {sub.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* SUB-TAB 1: 🌟 ALL CAMPUS EVENTS FEED */}
            {/* ========================================================================= */}
            {eventSubTab === "all" && (
              <div className="space-y-6">
                {/* Search & Category Filter Pills */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search events by title, host, speaker, or location (e.g. Basketball, Hackathon, Gala, AI)..."
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
                    />
                    {eventSearchQuery && (
                      <button
                        onClick={() => setEventSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
                    {["All", "Athletics", "Guest Speaker", "Hackathon", "Concert", "Career Fair", "Cultural Festival", "Academic", "Tradition"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEventCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          eventCategoryFilter === cat
                            ? "bg-amber-500 text-black shadow-xs font-black"
                            : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Events Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events
                    .filter((ev) => {
                      const matchesSearch =
                        ev.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                        ev.description.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                        ev.clubName.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                        ev.location.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                        (ev.tags && ev.tags.some(t => t.toLowerCase().includes(eventSearchQuery.toLowerCase())));
                      const matchesCategory =
                        eventCategoryFilter === "All" || ev.category === eventCategoryFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((ev) => {
                      const isOutdoor = ev.weatherRequirement === "Outdoor" || (ev.location || "").toLowerCase().includes("field") || (ev.location || "").toLowerCase().includes("beach") || (ev.location || "").toLowerCase().includes("lawn");
                      const capacityPct = Math.min(100, Math.round((ev.attendeesCount / ev.capacity) * 100));

                      return (
                        <div
                          key={ev.id}
                          className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Card Banner Image */}
                            <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                              <img
                                src={ev.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80"}
                                alt={ev.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                              
                              {/* Date Badge */}
                              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 text-center text-white">
                                <div className="text-[10px] uppercase font-black tracking-widest text-amber-400">{ev.dateMonth || "MAR"}</div>
                                <div className="text-base font-black leading-none">{ev.dateDay || "05"}</div>
                              </div>

                              {/* Category & Status */}
                              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                                  {ev.category}
                                </span>
                              </div>

                              {/* Weather Tag */}
                              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                                <span>{weatherReport?.conditionIcon || "☀️"}</span>
                                <span>{isOutdoor ? "Outdoor (79°F Friendly)" : "Indoor Climate Controlled"}</span>
                              </div>

                              {/* Price Tag */}
                              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/90 text-black">
                                {ev.ticketPrice || "Free Student Pass"}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 space-y-3">
                              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                                {ev.clubName}
                              </div>
                              <h3 className="font-black text-base text-slate-900 dark:text-zinc-100 line-clamp-2 group-hover:text-amber-500 transition leading-snug">
                                {ev.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {ev.description}
                              </p>

                              {/* Logistics Box */}
                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-semibold truncate">{ev.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{ev.location}</span>
                                </div>
                              </div>

                              {/* Capacity Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-semibold">{ev.attendeesCount} / {ev.capacity} Claimed</span>
                                  <span className="font-black text-amber-600 dark:text-amber-400">{capacityPct}% Full</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      capacityPct > 85 ? "bg-rose-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${capacityPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                            <button
                              onClick={() => {
                                setSelectedEventModal(ev);
                                setSelectedEventDrawerTab("details");
                              }}
                              className="text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-amber-500 transition flex items-center gap-1"
                            >
                              <span>Full Agenda & Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEvents(prev => prev.map(e => {
                                  if (e.id === ev.id) {
                                    const nextRsvp = e.userRsvp === "GOING" ? null : "GOING";
                                    return {
                                      ...e,
                                      userRsvp: nextRsvp,
                                      attendeesCount: nextRsvp === "GOING" ? e.attendeesCount + 1 : Math.max(0, e.attendeesCount - 1)
                                    };
                                  }
                                  return e;
                                }));
                                if (ev.userRsvp !== "GOING") {
                                  setSelectedTicketEvent({ ...ev, userRsvp: "GOING" });
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                ev.userRsvp === "GOING"
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "bg-amber-500 hover:bg-amber-600 text-black shadow-xs"
                              }`}
                            >
                              {ev.userRsvp === "GOING" ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Going (View Pass)</span>
                                </>
                              ) : (
                                <>
                                  <Ticket className="w-3.5 h-3.5" />
                                  <span>Claim Pass</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 2: 🏀 JOHNS HOPKINS BLUE JAYS ATHLETICS (NCAA D-I LACROSSE / D-III) */}
            {/* ========================================================================= */}
            {eventSubTab === "athletics" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span>Johns Hopkins University Blue Jay Athletics (NCAA Division-I / CAA)</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      All undergraduate & graduate students receive 100% free admission to Blue Jay Stadium and Johnny Blue Jay Stadium with valid Johns Hopkins University JCard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs">
                      Doc's Army Student Section
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.filter(e => e.category === "Athletics").map((ev) => (
                    <div key={ev.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            CAA Matchup
                          </span>
                          <span className="text-xs font-bold text-slate-500">{ev.dateMonth} {ev.dateDay}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Free Student Pass</span>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{ev.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{ev.description}</p>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>{ev.location} • Gate Entrance: {ev.gateEntrance}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{ev.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => {
                            setSelectedEventModal(ev);
                            setSelectedEventDrawerTab("details");
                          }}
                          className="text-xs font-bold text-slate-600 dark:text-zinc-300 hover:underline"
                        >
                          View Game Details
                        </button>
                        <button
                          onClick={() => {
                            setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, userRsvp: e.userRsvp === "GOING" ? null : "GOING" } : e));
                            setSelectedTicketEvent(ev);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Claim Student Pass</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 3: 🎤 CONCERTS & ART ATTACK (HOP) */}
            {/* ========================================================================= */}
            {eventSubTab === "concerts" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-500" />
                      <span>Campus Activities Board (CAB) Concerts & Traditions</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Major student concerts, Blue Jayfest music festival, comedy tours, and outdoor starlight cinema screenings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.filter(e => e.category === "Concert" || e.category === "Tradition" || e.category === "Cultural Festival").map((ev) => (
                    <div key={ev.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {ev.category}
                        </span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">{ev.dateMonth} {ev.dateDay}</span>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{ev.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{ev.description}</p>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{ev.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEventModal(ev);
                          setSelectedEventDrawerTab("agenda");
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition"
                      >
                        View Festival Lineup & Reserve Wristband
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 4: 🎟️ MY TICKETS & JCARD PASSES */}
            {/* ========================================================================= */}
            {eventSubTab === "my-tickets" && (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">My Claimed Event Passes & Digital Tickets</h2>
                    <p className="text-xs text-slate-500">Show digital QR barcode at venue entrance for expedited door scan.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {events.filter(e => e.userRsvp === "GOING").length} Active Passes
                  </span>
                </div>

                {events.filter(e => e.userRsvp === "GOING").length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-3">
                    <Ticket className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
                    <h3 className="font-black text-slate-900 dark:text-zinc-100 text-base">No Tickets Claimed Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Explore all campus events, basketball games, and keynote lectures to claim your free passes!</p>
                    <button
                      onClick={() => setEventSubTab("all")}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs"
                    >
                      Browse Campus Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.filter(e => e.userRsvp === "GOING").map((ev) => (
                      <div key={ev.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Verified Pass
                          </span>
                          <span className="text-xs font-bold text-slate-400">{ev.dateMonth} {ev.dateDay}</span>
                        </div>

                        <div>
                          <h3 className="font-black text-base text-slate-900 dark:text-zinc-100 line-clamp-1">{ev.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{ev.location}</p>
                        </div>

                        {/* Digital Ticket Code Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Pass Code</span>
                            <div className="font-mono font-black text-sm text-slate-900 dark:text-zinc-100">{ev.ticketCode || "JHU-TKT-8891"}</div>
                          </div>
                          <QrCode className="w-8 h-8 text-amber-500" />
                        </div>

                        <button
                          onClick={() => setSelectedTicketEvent(ev)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Display Mobile Scan Pass</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 5: 🎓 CAREER FAIRS & HACKATHONS */}
            {/* ========================================================================= */}
            {eventSubTab === "career" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>Career Fairs, Hackathons & Tech Symposiums</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    High-impact professional growth opportunities, corporate sponsor recruitment expos, and competitive student hackathons.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.filter(e => e.category === "Career Fair" || e.category === "Hackathon" || e.category === "Academic").map((ev) => (
                    <div key={ev.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {ev.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{ev.dateMonth} {ev.dateDay}</span>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{ev.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{ev.description}</p>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{ev.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEventModal(ev);
                          setSelectedEventDrawerTab("details");
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                      >
                        View Employer List & Register
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB 6: ➕ HOST / RESERVE SPACE */}
            {/* ========================================================================= */}
            {eventSubTab === "host" && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Host an Official Campus Event</h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Johns Hopkins University student organizations, faculty, and departments can request room bookings across Charles Commons (GSU) ballrooms, Blue Jay Stadium, and Brody Learning Commons & Milton S. Eisenhower Library lecture halls with integrated A/V support.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
                  {hostEventSuccess ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
                        ✓
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">Space Reservation Request Submitted!</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your event <strong>{hostEventData.title || "Campus Event"}</strong> has been submitted to Campus Reservations & Event Management. Confirmation notice will be sent within 48 hours.
                      </p>
                      <button
                        onClick={() => setHostEventSuccess(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
                      >
                        Submit Another Booking
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Event Title</label>
                        <input
                          type="text"
                          placeholder="e.g. AI & Robotics Hack Showcase 2026"
                          value={hostEventData.title}
                          onChange={(e) => setHostEventData({ ...hostEventData, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Event Category</label>
                          <select
                            value={hostEventData.category}
                            onChange={(e) => setHostEventData({ ...hostEventData, category: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                          >
                            {["Coding Workshop", "Guest Speaker", "Cultural Festival", "Academic", "Concert", "Hackathon", "Career Fair"].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Preferred Campus Venue</label>
                          <select
                            value={hostEventData.location}
                            onChange={(e) => setHostEventData({ ...hostEventData, location: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                          >
                            <option value="Brody Learning Commons & Milton S. Eisenhower Library Auditorium (SC-101)">Brody Learning Commons & Milton S. Eisenhower Library Auditorium</option>
                            <option value="Charles Commons (GSU) Ballrooms (UU-300)">Charles Commons (GSU) Ballrooms</option>
                            <option value="Potomac Lounge (UU-200)">Potomac Lounge</option>
                            <option value="Malone Hall & Hackerman Hall (Computer Science & Robotics) Theater">Malone Hall & Hackerman Hall (Computer Science & Robotics) Theater</option>
                            <option value="Blue Jay Stadium Main Floor">Blue Jay Stadium Main Floor</option>
                            <option value="Blue Jay Stadium Lawn Lawn">Blue Jay Stadium Lawn Lawn (Outdoor)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Estimated Attendance</label>
                          <input
                            type="number"
                            value={hostEventData.capacity}
                            onChange={(e) => setHostEventData({ ...hostEventData, capacity: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Host Organization / Department</label>
                          <input
                            type="text"
                            placeholder="e.g. Johns Hopkins University Cybersecurity Club"
                            value={hostEventData.organizer}
                            onChange={(e) => setHostEventData({ ...hostEventData, organizer: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Event Description & Audio/Visual Needs</label>
                        <textarea
                          rows={3}
                          placeholder="Describe the agenda, microphone requirements, projector setups, and catering requests..."
                          value={hostEventData.description}
                          onChange={(e) => setHostEventData({ ...hostEventData, description: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                        />
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          onClick={() => setHostEventSuccess(true)}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-lg shadow-amber-500/20"
                        >
                          Submit Campus Space Booking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 1: 📋 FULL EVENT DETAIL & AGENDA DRAWER */}
            {/* ========================================================================= */}
            {selectedEventModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Modal Hero Banner */}
                  <div className="relative h-48 w-full bg-slate-200 dark:bg-zinc-800 shrink-0">
                    <img
                      src={selectedEventModal.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80"}
                      alt={selectedEventModal.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <button
                      onClick={() => setSelectedEventModal(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                      <div className="text-white space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider">
                          {selectedEventModal.category}
                        </span>
                        <h2 className="font-black text-xl leading-tight line-clamp-1">{selectedEventModal.title}</h2>
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <span>{selectedEventModal.dateMonth} {selectedEventModal.dateDay}</span>
                          <span>•</span>
                          <span>{selectedEventModal.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEvents(prev => prev.map(e => {
                            if (e.id === selectedEventModal.id) {
                              const nextRsvp = e.userRsvp === "GOING" ? null : "GOING";
                              return {
                                ...e,
                                userRsvp: nextRsvp,
                                attendeesCount: nextRsvp === "GOING" ? e.attendeesCount + 1 : Math.max(0, e.attendeesCount - 1)
                              };
                            }
                            return e;
                          }));
                          setSelectedEventModal(prev => prev ? {
                            ...prev,
                            userRsvp: prev.userRsvp === "GOING" ? null : "GOING",
                            attendeesCount: prev.userRsvp === "GOING" ? Math.max(0, prev.attendeesCount - 1) : prev.attendeesCount + 1
                          } : null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
                          selectedEventModal.userRsvp === "GOING"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 hover:bg-amber-600 text-black shadow-md"
                        }`}
                      >
                        {selectedEventModal.userRsvp === "GOING" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Going</span>
                          </>
                        ) : (
                          <>
                            <Ticket className="w-4 h-4" />
                            <span>Claim Ticket</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Modal Inner Tabs */}
                  <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-zinc-800">
                    {[
                      { id: "details", label: "Event Overview", icon: Info },
                      { id: "agenda", label: `Schedule Agenda (${selectedEventModal.agenda?.length || 0})`, icon: Clock },
                      { id: "speakers", label: `Guest Speakers (${selectedEventModal.speakers?.length || 0})`, icon: Users }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = selectedEventDrawerTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedEventDrawerTab(t.id as any)}
                          className={`px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
                            isActive
                              ? "border-amber-500 text-amber-600 dark:text-amber-400"
                              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                    {selectedEventDrawerTab === "details" && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">About This Event</h4>
                          <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed text-sm">
                            {selectedEventModal.description}
                          </p>
                        </div>

                        {/* Logistics Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2">
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100">Venue & Entrance Guidelines</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-zinc-300">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-rose-500" />
                              <span>{selectedEventModal.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span>{selectedEventModal.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-emerald-500" />
                              <span>{selectedEventModal.ticketPrice || "Free with Student JCard"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              <span>Gate: {selectedEventModal.gateEntrance || "Main Concourse"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {selectedEventModal.tags && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {selectedEventModal.tags.map((t, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedEventDrawerTab === "agenda" && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Event Agenda & Schedule Blocks</h4>
                        {(selectedEventModal.agenda || []).map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-4">
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-black text-xs shrink-0">
                              {item.time}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">{item.topic}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedEventDrawerTab === "speakers" && (
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Featured Speakers & Hosts</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(selectedEventModal.speakers || []).map((spk, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-3.5">
                              <img
                                src={spk.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                                alt={spk.name}
                                className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                              />
                              <div>
                                <h5 className="font-black text-slate-900 dark:text-zinc-100 text-sm">{spk.name}</h5>
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{spk.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: 🎟️ MOBILE TICKET PASS MODAL */}
            {/* ========================================================================= */}
            {selectedTicketEvent && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 w-full max-w-sm p-6 space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" />
                      Johns Hopkins University Official Event Pass
                    </span>
                    <button onClick={() => setSelectedTicketEvent(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-center">
                    <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100">{selectedTicketEvent.title}</h3>
                    <p className="text-xs text-slate-500">{selectedTicketEvent.location}</p>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{selectedTicketEvent.time}</p>
                  </div>

                  {/* QR Barcode Box */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 flex flex-col items-center justify-center shadow-inner mx-auto w-48 h-48 space-y-2">
                    <QrCode className="w-32 h-32 text-slate-900" />
                    <span className="font-mono text-[10px] font-black text-slate-500 tracking-widest">{selectedTicketEvent.ticketCode || "JHU-TKT-9912"}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Pass Holder:</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">Kwesi Asiedu (#8492)</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Entry Gate:</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{selectedTicketEvent.gateEntrance || "General Concourse"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTicketEvent(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-6">
            
            {/* 1. HERO IMPACT & SERVICE DASHBOARD BANNER */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/30 space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Johns Hopkins University (JHU) Civic Engagement
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      GivePulse Connected ✓
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                      Verified Honors & Greek Credit
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black mt-2">
                    Volunteer & Civic Engagement Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Connect with community partners, discover high-impact service shifts, log verified hours, and earn official Johns Hopkins University (JHU) service transcripts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShowLogHoursModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Service Hours</span>
                  </button>

                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition border border-slate-700 hover:border-amber-500 flex items-center gap-1.5 shadow-sm"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Service Transcript</span>
                  </button>
                </div>
              </div>

              {/* 4 Impact Telemetry Gauges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left pt-2 border-t border-white/10">
                {/* 1. Total Campus Hours */}
                <div className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                    <span>CAMPUS SERVICE</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    14,820 <span className="text-xs font-sans text-slate-400">/ 20k hrs</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[74%] h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold block">74% of Annual Goal</span>
                </div>

                {/* 2. Active Student Volunteers */}
                <div className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                    <span>ACTIVE BLUE JAYS</span>
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    1,248 <span className="text-xs font-sans text-slate-400">Students</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    +142 joined this month
                  </span>
                </div>

                {/* 3. Community Partners */}
                <div className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                    <span>PARTNERS</span>
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    38 <span className="text-xs font-sans text-slate-400">Non-Profits</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block">Baltimore & Johns Hopkins University Area</span>
                </div>

                {/* 4. Your Personal Record */}
                <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 rounded-2xl border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center justify-between text-amber-300 text-[11px] font-bold">
                    <span>MY RECORD</span>
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-400 font-mono">
                    {currentUser.volunteerHoursLogged ?? 34.5} <span className="text-xs font-sans text-white">hrs</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold block">
                    🏅 3 Certified Badges Earned
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SUB-VIEW NAVIGATION TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold">
              {[
                { id: "discover", label: `🎯 Discover Opportunities (${(activities.length > 0 ? activities : initialVolunteerActivities).length})` },
                { id: "myshifts", label: `📋 My Shifts & Hours Log (${registeredShiftIds.length})` },
                { id: "partners", label: "🏢 Community Partners (38)" },
                { id: "leaderboard", label: "🏆 Blue Jay Impact Leaderboard" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVolunteerSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl transition shrink-0 ${
                    volunteerSubTab === tab.id
                      ? "bg-amber-500 text-black font-black shadow-xs"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3. SUB-VIEW 1: DISCOVER OPPORTUNITIES */}
            {volunteerSubTab === "discover" && (
              <div className="space-y-4">
                {/* Search & Category Filter Toolbar */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search service projects by keyword, cause, organizer, or location..."
                        value={volunteerSearchQuery}
                        onChange={(e) => setVolunteerSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 pl-10 pr-4 py-2.5 rounded-2xl text-xs border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold pt-1 border-t dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">CAUSE:</span>
                    {[
                      { id: "ALL", label: "All Causes" },
                      { id: "Food Drive", label: "🍎 Food Security" },
                      { id: "Campus Cleanup", label: "🌲 Eco & Arboretum" },
                      { id: "Community Service", label: "🤝 Mentorship & Senior Tech" },
                      { id: "Fundraiser", label: "🩸 Health & Red Cross" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setVolunteerCategoryFilter(pill.id)}
                        className={`px-3 py-1 rounded-full transition shrink-0 text-xs ${
                          volunteerCategoryFilter === pill.id
                            ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-black font-black"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opportunities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(activities.length > 0 ? activities : initialVolunteerActivities)
                    .filter((act) => {
                      const matchCategory = volunteerCategoryFilter === "ALL" || act.category === volunteerCategoryFilter;
                      const matchSearch = !volunteerSearchQuery ||
                        act.title.toLowerCase().includes(volunteerSearchQuery.toLowerCase()) ||
                        act.description.toLowerCase().includes(volunteerSearchQuery.toLowerCase()) ||
                        act.location.toLowerCase().includes(volunteerSearchQuery.toLowerCase()) ||
                        act.organizer.toLowerCase().includes(volunteerSearchQuery.toLowerCase());
                      return matchCategory && matchSearch;
                    })
                    .map((act) => {
                      const isRegistered = registeredShiftIds.includes(act.id);
                      return (
                        <div
                          key={act.id}
                          className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                        >
                          <div className="space-y-3">
                            {/* Card Header: Category & Hours Credit */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                                {act.category}
                              </span>
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
                                ⏱️ {act.roles?.[0]?.hoursCredit || 4.0} hrs Credit
                              </span>
                            </div>

                            {/* Title & Organizer */}
                            <div>
                              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 group-hover:text-amber-500 transition">
                                {act.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <img
                                  src={act.organizerAvatar}
                                  alt={act.organizer}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="text-xs text-slate-500 font-medium truncate">{act.organizer}</span>
                              </div>
                            </div>

                            {/* Date & Location */}
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-xs space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300">
                                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>{act.date}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500">
                                <div className="flex items-center gap-2 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{act.location}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveTab("map");
                                    triggerToast(`📍 Navigated to ${act.location} on Live Map.`);
                                  }}
                                  className="text-[10px] font-bold text-amber-600 hover:underline shrink-0 ml-1"
                                >
                                  View Map →
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                              {act.description}
                            </p>

                            {/* Capacity Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-500">Volunteer Capacity</span>
                                <span className="text-amber-600 font-mono">{act.currentMetric} / {act.goalMetric}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${act.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Tasks Preview */}
                            {act.tasks && act.tasks.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {act.tasks.slice(0, 3).map((task, i) => (
                                  <span key={i} className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-lg">
                                    • {task}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-zinc-800">
                            <button
                              onClick={() => {
                                if (isRegistered) {
                                  setRegisteredShiftIds(registeredShiftIds.filter((id) => id !== act.id));
                                  triggerToast(`Cancelled registration for "${act.title}".`);
                                } else {
                                  setRegisteredShiftIds([...registeredShiftIds, act.id]);
                                  triggerToast(`🎉 Registered for shift: ${act.title}! Added to your calendar.`);
                                }
                              }}
                              className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
                                isRegistered
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "bg-amber-500 hover:bg-amber-600 text-black"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>{isRegistered ? "Shift Claimed ✓" : "Claim a Shift"}</span>
                            </button>

                            <button
                              onClick={() => setSelectedVolunteerModal(act)}
                              className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition flex items-center justify-center gap-1.5"
                            >
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                              <span>Shift Details</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 4. SUB-VIEW 2: MY SHIFTS & HOURS LOG */}
            {volunteerSubTab === "myshifts" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                        My Registered Volunteer Shifts & Certified Hours
                      </h2>
                      <p className="text-xs text-slate-500">Track upcoming service days, supervisor signatures, and honors credits.</p>
                    </div>
                    <button
                      onClick={() => setShowLogHoursModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Completed Hours</span>
                    </button>
                  </div>

                  {/* Registered Shifts Cards */}
                  <div className="space-y-3">
                    {(activities.length > 0 ? activities : initialVolunteerActivities)
                      .filter((act) => registeredShiftIds.includes(act.id))
                      .map((act) => (
                        <div
                          key={act.id}
                          className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-emerald-500/30 flex items-center justify-between flex-wrap gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                CONFIRMED SHIFT
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-600">
                                ⏱️ {act.roles?.[0]?.hoursCredit || 4.0} hrs Credit
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{act.title}</h4>
                            <p className="text-xs text-slate-500">📅 {act.date} • 📍 {act.location}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setRegisteredShiftIds(registeredShiftIds.filter((id) => id !== act.id));
                                triggerToast("Cancelled shift.");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-rose-600 hover:text-white text-xs font-bold transition"
                            >
                              Cancel Shift
                            </button>
                            <button
                              onClick={() => setShowCertificateModal(true)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition"
                            >
                              View Certificate
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. SUB-VIEW 3: COMMUNITY PARTNERS DIRECTORY */}
            {volunteerSubTab === "partners" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "Maryland Food Bank", category: "Food Security", location: "Halethorpe / Baltimore", activeProjects: 4, icon: "🍎", contact: "community@mdfoodbank.org" },
                  { name: "Baltimore City Public Schools", category: "STEM & Literacy", location: "Baltimore City", activeProjects: 6, icon: "💻", contact: "mentors@baltimorecityschools.org" },
                  { name: "Wicomico River Greenway Board", category: "Conservation", location: "Johns Hopkins University Campus Woods", activeProjects: 2, icon: "🌲", contact: "arboretum@hopkins.edu" },
                  { name: "Maryland SPCA", category: "Animal Welfare", location: "Falls Road, Baltimore", activeProjects: 3, icon: "🐾", contact: "volunteer@mdspca.org" },
                  { name: "American Red Cross Greater Chesapeake", category: "Disaster & Blood", location: "Mount Hope Dr, Baltimore", activeProjects: 5, icon: "🩸", contact: "chesapeake@redcross.org" },
                  { name: "Johns Hopkins University Senior Center", category: "Elder Care & Tech", location: "Washington Ave, Johns Hopkins University", activeProjects: 2, icon: "👵", contact: "seniorcenter@baltimorecountymd.gov" },
                ].map((partner, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{partner.icon}</span>
                        <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                          {partner.activeProjects} Active Drives
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">{partner.name}</h4>
                      <p className="text-xs text-slate-500">📍 {partner.location}</p>
                      <span className="text-[11px] text-slate-400 font-mono block">{partner.contact}</span>
                    </div>

                    <button
                      onClick={() => triggerToast(`Connected with ${partner.name}. Coordinator notified.`)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black font-bold text-xs py-2 rounded-xl transition"
                    >
                      Connect with Partner
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 6. SUB-VIEW 4: BLUE JAY IMPACT LEADERBOARD */}
            {volunteerSubTab === "leaderboard" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                      Blue Jay Impact Honor Roll & Top Student Service Rankings
                    </h3>
                    <p className="text-xs text-slate-500">Recognizing extraordinary community contributions across Johns Hopkins University (JHU).</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full">
                    Spring 2026 Term
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: "Kwesi Asiedu", major: "IT Senior", hours: "48.0 hrs", badge: "🥇 President's Gold Cup", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
                    { rank: 2, name: "Maya Chen", major: "Pre-Med Junior", hours: "42.5 hrs", badge: "🥈 Silver Service Star", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
                    { rank: 3, name: "Liam Vance", major: "Environmental Sci", hours: "36.0 hrs", badge: "🥉 Bronze Eco-Blue Jay", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
                    { rank: 4, name: "Tyler Stone", major: "Computer Science", hours: "28.5 hrs", badge: "⭐ Community Champion", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                  ].map((user) => (
                    <div
                      key={user.rank}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm w-6 text-slate-400">#{user.rank}</span>
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500" />
                        <div>
                          <span className="font-black text-sm text-slate-900 dark:text-zinc-100">{user.name}</span>
                          <span className="text-xs text-slate-400 block">{user.major} • {user.badge}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">{user.hours}</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Verified Service</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* MODAL: VOLUNTEER SHIFT DETAILS & WAIVER CONFIRMATION */}
        {/* ───────────────────────────────────────────────────────────── */}
        {selectedVolunteerModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-xs">
              <button
                onClick={() => setSelectedVolunteerModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    {selectedVolunteerModal.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">
                    {selectedVolunteerModal.title}
                  </h3>
                </div>
              </div>

              {/* Schedule & Meeting Spot */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>📅 Date & Time:</span>
                  <span>{selectedVolunteerModal.date}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>📍 Meeting Point:</span>
                  <span>{selectedVolunteerModal.location}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>⏱️ Verified Service Credit:</span>
                  <span className="text-emerald-600 font-mono">{selectedVolunteerModal.roles?.[0]?.hoursCredit || 4.0} Hours</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100">Description & Community Impact:</h4>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {selectedVolunteerModal.description}
                </p>
              </div>

              {/* Roles Selection */}
              {selectedVolunteerModal.roles && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100">Select Your Preferred Shift Role:</h4>
                  <div className="space-y-1.5">
                    {selectedVolunteerModal.roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input type="radio" name="shiftRole" defaultChecked className="text-amber-500 focus:ring-0" />
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{role.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {role.spotsFilled} / {role.spotsNeeded} Spots Filled
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety & Attire Guidelines */}
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-slate-700 dark:text-zinc-300 space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-300">📋 Attire & Requirements:</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Closed-toe shoes required. Work gloves and drinking water stations will be provided on-site.
                </p>
              </div>

              {/* Claim Button */}
              <button
                onClick={() => {
                  if (!registeredShiftIds.includes(selectedVolunteerModal.id)) {
                    setRegisteredShiftIds([...registeredShiftIds, selectedVolunteerModal.id]);
                  }
                  setSelectedVolunteerModal(null);
                  triggerToast(`🎉 Shift confirmed for "${selectedVolunteerModal.title}"! Added to your schedule.`);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Shift Registration</span>
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* MODAL: LOG COMPLETED SERVICE HOURS */}
        {/* ───────────────────────────────────────────────────────────── */}
        {showLogHoursModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 my-8 text-xs">
              <button
                onClick={() => setShowLogHoursModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">Log Volunteer Hours</h3>
                  <p className="text-slate-500 text-xs">Submit hours for verification by the Office of Civic Engagement.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Project / Activity Name</label>
                  <input
                    type="text"
                    value={logHoursForm.activityTitle}
                    onChange={(e) => setLogHoursForm({ ...logHoursForm, activityTitle: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Hours Completed</label>
                    <input
                      type="number"
                      step="0.5"
                      value={logHoursForm.hours}
                      onChange={(e) => setLogHoursForm({ ...logHoursForm, hours: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Date Completed</label>
                    <input
                      type="date"
                      value={logHoursForm.date}
                      onChange={(e) => setLogHoursForm({ ...logHoursForm, date: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Supervisor Email for Verification</label>
                  <input
                    type="email"
                    value={logHoursForm.supervisorEmail}
                    onChange={(e) => setLogHoursForm({ ...logHoursForm, supervisorEmail: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Brief Impact Reflection</label>
                  <textarea
                    rows={3}
                    value={logHoursForm.reflection}
                    onChange={(e) => setLogHoursForm({ ...logHoursForm, reflection: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border text-xs focus:outline-amber-500"
                  />
                </div>

                <button
                  onClick={() => {
                    const updatedUser = {
                      ...currentUser,
                      volunteerHoursLogged: (currentUser.volunteerHoursLogged ?? 34.5) + logHoursForm.hours,
                    };
                    setCurrentUser(updatedUser);
                    saveCurrentUser(updatedUser);
                    setShowLogHoursModal(false);
                    triggerToast(`✅ Logged ${logHoursForm.hours} hrs for "${logHoursForm.activityTitle}"! Verification email sent.`);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </button>
              </div>
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
              currentUserEmail={currentUser?.studentId ? `${(currentUser.name || "kwesi").toLowerCase().replace(/\s+/g, ".")}@hopkins.edu` : "kwesi@expediteconsults.com"}
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
                  { id: "tv", label: "🎥 Johns Hopkins University TV & Reels", icon: "📺" },
                  { id: "career", label: "💼 Career & Jobs", icon: "👔" },
                  { id: "market", label: "🛍️ Marketplace", icon: "🛒" },
                  { id: "games", label: "🎮 Campus Games", icon: "👾" },
                  { id: "transcript", label: "🏆 Blue Jay Record", icon: "🎓" },
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
                        HopkinsSync Enblue jayrise Suite
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
                    { id: "study", category: "ACADEMICS", title: "Study Pods & Peer Match", desc: "Reserve study spaces in PAGAC Academic Commons & Brody Learning Commons & Milton S. Eisenhower Library with peers.", icon: "📚", bg: "bg-teal-500/10 text-teal-500 border-teal-500/20", type: "tab", target: "campus" },
                    
                    // Campus Life & Safety
                    { id: "wallet", category: "SAFETY", title: "Digital Blue Jay JCard", desc: "Meal Swipes (14), Dining Dollars ($284.50), NFC pass & Apple Wallet.", icon: "💳", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "action", target: "wallet" },
                    { id: "safewalk", category: "SAFETY", title: "Blue Jay SafeWalk Escort", desc: "Virtual night escort with live companion tracking, fake calls & JHUPD SOS.", icon: "🛡️", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", type: "action", target: "safewalk" },
                    { id: "density", category: "SAFETY", title: "Live Campus Density IoT", desc: "Real-time crowd heatmaps for PAGAC Academic Commons, O'Connor Recreation Center Gym & Union.", icon: "📊", bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", type: "action", target: "density" },
                    { id: "weather", category: "SAFETY", title: "NOAA Campus Weather", desc: "Authoritative NWS forecasts, live Doppler radar, and severe weather alerts.", icon: "🌦️", bg: "bg-sky-500/10 text-sky-500 border-sky-500/20", type: "modal", target: "weather" },
                    { id: "311", category: "SAFETY", title: "Campus 311 Maintenance", desc: "Report campus maintenance, facilities requests, and safety concerns.", icon: "🔧", bg: "bg-slate-500/10 text-slate-500 border-slate-500/20", type: "action", target: "311" },

                    // Media & Marketplace
                    { id: "tv", category: "MEDIA", title: "Johns Hopkins University TV & Reels", desc: "Live streams, 60s reels, video channels, and student creator shows.", icon: "🎥", bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", type: "subview", target: "tv" },
                    { id: "market", category: "MEDIA", title: "Johns Hopkins University Marketplace", desc: "Official HopkinsSync store, student peer buy/sell, textbooks, and merch.", icon: "🛍️", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", type: "subview", target: "market" },
                    { id: "games", category: "MEDIA", title: "Campus Games & XP", desc: "Blue Jay trivia championship, campus scavenger hunt, and XP leaderboard.", icon: "🎮", bg: "bg-purple-500/10 text-purple-500 border-purple-500/20", type: "subview", target: "games" },
                    { id: "transcript", category: "MEDIA", title: "Blue Jay Record & Passport", desc: "Verified milestone certificates, digital passport, and PDF graduation export.", icon: "🏆", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "subview", target: "transcript" },

                    // Operations & Tools
                    { id: "connect", category: "OPERATIONS", title: "Axiom Mail, Teams & Calendar", desc: "Integrated Zoho-style webmail, Outlook scheduler, and Teams WebRTC video meeting room.", icon: "⚡", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "subview", target: "connect" },
                    { id: "ai", category: "OPERATIONS", title: "Ask HopkinsSync AI", desc: "Contextual intelligence assistant across schedules, dining, and maps.", icon: "🤖", bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", type: "action", target: "ai" },
                    { id: "admin", category: "OPERATIONS", title: "Administration Center", desc: "Identity verification queue, housing safety moderation, and security logs.", icon: "🏛️", bg: "bg-slate-900 text-amber-400 border-amber-500/30", type: "subview", target: "admin" },
                    { id: "map", category: "OPERATIONS", title: "Live Campus Map OS", desc: "Blue JayOrbit 360, indoor blueprints, GPS Blue Jay Ride shuttles & parking.", icon: "🗺️", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", type: "tab", target: "map" },
                    { id: "housing", category: "OPERATIONS", title: "HopkinsHousing Platform", desc: "Verified off-campus student apartments, roommate mesh, and 3D tours.", icon: "🏠", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", type: "tab", target: "housing" },
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
                            setShowJCardModal(true);
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

            {/* SUB-VIEW 2: 🎥 Hopkins TV & REELS */}
            {moreSubView === "tv" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-rose-500/30">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">Johns Hopkins University TV & Student Creator Studio</span>
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
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Johns Hopkins University Career, Research & Alumni Mesh</span>
                    <h2 className="text-2xl font-black mt-0.5">Verified Student Opportunities & Alumni Mentorship</h2>
                    <p className="text-xs text-slate-300 mt-1">Direct synchronization with Handshake, Life Design Lab @ Imagine Center, and verified corporate alumni.</p>
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
                        employer: "SU Autonomous Cyber Defense Lab (ASSL)",
                        jobType: "Paid Campus Research",
                        location: "Brody Learning Commons & Milton S. Eisenhower Library Rm 304",
                        wage: "$22.50 / hr + 3 Academic Credits",
                        desc: "Develop automated vulnerability scanning scripts and LLM honeypots under Dr. Catherine Hayes.",
                        deadline: "April 15, 2026",
                      },
                      {
                        id: "job-2",
                        title: "IT Support & Cloud Infrastructure Assistant",
                        employer: "Johns Hopkins University (JHU) Office of Technology (OTS)",
                        jobType: "Student Employment",
                        location: "PAGAC Academic Commons Lower Level",
                        wage: "$18.00 / hr",
                        desc: "Assist students and faculty with JHU network access, dual-factor authentication, and hardware diagnostics.",
                        deadline: "May 01, 2026",
                      },
                      {
                        id: "job-3",
                        title: "Student Community Engagement Lead",
                        employer: "Johns Hopkins University Student Affairs",
                        jobType: "Part-Time",
                        location: "Charles Commons (GSU) Rm 204",
                        wage: "$17.50 / hr",
                        desc: "Coordinate campus-wide volunteer drives, service days, and official Blue Jay Record certifications.",
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
                          onClick={() => triggerToast(`💼 Application submitted for ${job.title} at ${job.employer} using your verified Blue Jay Record!`)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-xl text-xs shadow-md transition"
                        >
                          1-Click Apply with Blue Jay Record
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
                          onClick={() => triggerToast(`☕ Coffee Chat requested with ${mentor.name} (${mentor.company})! They will connect via Blue Jay Message.`)}
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
                    <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Johns Hopkins University Student & Official Store</span>
                    <h2 className="text-2xl font-black mt-0.5">Buy, Sell & Explore Verified Campus Products</h2>
                    <p className="text-xs text-slate-300 mt-1">Official Johns Hopkins University (JHU) merchandise, textbooks, electronics, and student creator gear.</p>
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
                    <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">Blue Jay Trivia Championship & Campus XP</h2>
                    <p className="text-xs text-slate-500">Test your Johns Hopkins University (JHU) knowledge and earn points toward your Blue Jay Record.</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 px-4 py-2 rounded-2xl border border-amber-200 font-mono text-xs font-black text-amber-700 dark:text-amber-300">
                    ⭐ Campus XP Score: {triviaScore * 50} pts
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border space-y-4 max-w-xl mx-auto">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Question {activeTriviaQuestionIdx + 1} of {(games[0]?.questions || initialCampusGames[0]?.questions || []).length}</span>
                    <span>Category: JHU Traditions</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                    {(games[0]?.questions || initialCampusGames[0]?.questions)?.[activeTriviaQuestionIdx]?.question || "In what year was Johns Hopkins University (JHU) originally founded as Maryland State Normal School?"}
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
                            Verified Johns Hopkins University Blue Jay ✓
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
                        <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">Official Johns Hopkins University Campus Passport</h3>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200">
                        5 of 7 Milestones Completed (71%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {[
                        { title: "New Student Orientation Completed", status: "VERIFIED", date: "Aug 2024", icon: "✓" },
                        { title: "Joined Verified Student Org (ASA Johns Hopkins University)", status: "VERIFIED", date: "Sep 2024", icon: "✓" },
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
                    <h3 className="font-bold text-base">HopkinsSync Campus AI Assistant</h3>
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
                    placeholder="Ask Johns Hopkins University Campus AI anything..."
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

            {/* SUB-VIEW 8: 🛡️ HOPKINSSYNC ADMINISTRATION CENTER */}
            {moreSubView === "admin" && (
              <div className="space-y-6">
                {/* Admin Header Banner */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-2xl border border-indigo-500/40 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                          🛡️ HopkinsSync Security & Operations Center
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
                          triggerToast("🔄 Synchronized live campus records with PeopleSoft / JHU JCard & Canvas SIS.");
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
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">JHUPD Blue Lights</span>
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
                              Submitted {req.submittedAt} with verified official JHU document upload.
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
                          <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100 mt-1">The York Johns Hopkins University Residences • 4 Bed / 4 Bath Penthouse</h4>
                          <span className="text-xs text-slate-500">Provider: The York Johns Hopkins University Property Management (License #MD-9042)</span>
                        </div>
                        <span className="text-base font-black text-emerald-600">$1,150 / mo</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        Submitted safety certifications: Fire Marshal Approval 2026, Johns Hopkins University Shuttle Route Direct Stop, Secure RFID Fob entry.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => triggerToast("✅ Housing listing approved & verified on HopkinsHousing live map.")}
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
                        <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">Johns Hopkins University Spring Hackathon & Cyber CTF</h4>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">Requires Union Rm 204</span>
                      </div>
                      <p className="text-xs text-slate-500">Host: Johns Hopkins University Cybersecurity Club • Expected Attendance: 250 students • Budget: $1,500 SGA Grant</p>
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
                      HopkinsSync Infrastructure & Geographic IoT Telemetry
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
                        <span className="text-[10px] text-emerald-500 font-bold block">JHUPD Dispatch Linked</span>
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
                  currentUserEmail={currentUser?.studentId ? `${(currentUser.name || "kwesi").toLowerCase().replace(/\s+/g, ".")}@hopkins.edu` : "kwesi@expediteconsults.com"}
                  currentUserRole={currentUser?.role || "Student & Lead Architect"}
                  onBackToCampus={() => setMoreSubView("launcher")}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* FLOATING ACTION TRIGGER: ✨ ASK HOPKINSSYNC AI */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setShowAskAiModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:scale-105 text-white p-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs border border-white/20 transition group"
        title="Ask HopkinsSync AI anything about your classes, housing, schedule, or campus"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition duration-300" />
        <span>Ask HopkinsSync</span>
      </button>

      {/* ========================================================================= */}
      {/* MODAL 1: ✨ ASK HOPKINSSYNC AI ASSISTANT MODAL */}
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
                  <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Ask HopkinsSync AI</h3>
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
                "📚 Quiet study spots at PAGAC Academic Commons?",
                "🚌 When is the next Blue Jay Ride shuttle?",
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
                          : chip.includes("PAGAC Academic Commons")
                          ? "Albert S. PAGAC Academic Commons is currently at 38% capacity (Quiet). 3rd floor quiet pods and collaborative tables currently have 64 open seats."
                          : chip.includes("shuttle")
                          ? "Blue Jay Ride Shuttle #14 (Gold Route) is currently 2 minutes away from PAGAC Academic Commons stop, heading to Blue Jay Square."
                          : "Here is what HopkinsSync recommends based on your profile and verified courses.",
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
                    text: `HopkinsSync AI responded to "${userQ}": Everything is synchronized across your courses, housing, shuttle schedules, and campus map.`,
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
      {/* MODAL 2: 🎓 OFFICIAL BLUE JAY RECORD & PASSPORT GRADUATION EXPORT */}
      {/* ========================================================================= */}
      {showBlueJayRecordExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-zinc-100">Official HopkinsSync Campus Record</h3>
                  <p className="text-xs text-slate-500">Verified Digital Portfolio & Graduation Passport</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlueJayRecordExportModal(false)}
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
                triggerToast("📄 Generating Official Johns Hopkins University (JHU) Verified Digital PDF Portfolio...");
                setTimeout(() => {
                  triggerToast("✅ Download ready: HopkinsSync_CampusRecord_KwesiAsiedu.pdf");
                  setShowBlueJayRecordExportModal(false);
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

      {/* ========================================================================= */}
      {/* GLOBAL FLOATING AI COPILOT LAUNCHER BADGE */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setCopilotInitialQuery(undefined);
            setShowGlobalCopilot(true);
          }}
          className="bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-black font-black p-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 transition duration-300 hover:scale-105 group border border-amber-300 ring-4 ring-amber-500/20 cursor-pointer"
          title="Open Global AI Copilot (Cross-Domain Intelligence)"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          </div>
          <span className="text-xs font-black tracking-tight hidden sm:inline">Ask Copilot</span>
        </button>
      </div>

      {/* GLOBAL COPILOT MODAL */}
      <GlobalCopilotModal
        isOpen={showGlobalCopilot}
        onClose={() => {
          setShowGlobalCopilot(false);
          setCopilotInitialQuery(undefined);
        }}
        onPerformAction={handlePerformCopilotAction}
        currentUserName={currentUser?.name || "Kwesi"}
        initialQuery={copilotInitialQuery}
      />

    </div>
  );
}
