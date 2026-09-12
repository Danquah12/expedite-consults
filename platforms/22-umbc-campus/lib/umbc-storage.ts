// lib/campus-storage.ts
"use client";

import {
  CampusPost,
  CampusEvent,
  CampusCourse,
  CampusClub,
  MarketItem,
  ChatMessage,
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
  UMBCBuilding,
  LocationCircle,
  UMBCShuttle,
  UMBCParkingGarage,
  SafetyBeacon,
  ScavengerHuntCheckpoint,
  HousingListing,
  RoommateProfile,
  HousingTourBooking,
  HousingMaintenanceTicket,
  defaultCurrentUser,
  initialCampusPosts,
  initialCampusEvents,
  initialCampusCourses,
  initialCampusClubs,
  initialMarketplaceItems,
  initialChatMessages,
  initialVolunteerActivities,
  initialResearchProjects,
  initialCampusJobs,
  initialCampusPolls,
  initialCampusAlerts,
  initialCampusMedia,
  initialStudyPods,
  initialLiveActivities,
  initialPeerMatches,
  initialQuickGroups,
  initialCampusOpportunities,
  initialServiceRequests,
  initialEventMemories,
  initialOfficeHours,
  initialCampusReels,
  initialCampusGames,
  initialCampusNotifications,
  defaultNotificationPreferences,
  initialUMBCBuildings,
  initialUMBCCircles,
  initialUMBCShuttles,
  initialUMBCParking,
  initialUMBCSafetyBeacons,
  initialUMBCScavengerCheckpoints,
  initialHousingListings,
  initialRoommateProfiles,
  initialHousingTours,
  initialHousingMaintenanceTickets,
} from "./umbc-data";

import {
  CampusWeatherReport,
  WeatherNotificationPreferences,
  initialUmbcMainWeather,
  defaultWeatherPreferences,
} from "./umbc-weather-data";

const STORAGE_KEYS = {
  POSTS: "campussync_posts_v10",
  EVENTS: "campussync_events_v10",
  COURSES: "campussync_courses_v10",
  CLUBS: "campussync_clubs_v10",
  MARKETPLACE: "campussync_market_v10",
  MESSAGES: "campussync_messages_v10",
  USER: "campussync_user_v10",
  VOLUNTEER: "campussync_volunteer_v10",
  RESEARCH: "campussync_research_v10",
  JOBS: "campussync_jobs_v10",
  POLLS: "campussync_polls_v10",
  ALERTS: "campussync_alerts_v10",
  MEDIA: "campussync_media_v10",
  STUDY_PODS: "campussync_pods_v10",
  LIVE_ACT: "campussync_live_v10",
  PEER_MATCH: "campussync_peers_v10",
  QUICK_GROUPS: "campussync_qgroups_v10",
  OPPORTUNITIES: "campussync_opps_v10",
  SERVICE_REQ: "campussync_311_v10",
  EVENT_MEMORIES: "campussync_memories_v10",
  OFFICE_HOURS: "campussync_oh_v10",
  REELS: "campussync_reels_v10",
  GAMES: "campussync_games_v10",
  NOTIFICATIONS: "campussync_notifs_v10",
  NOTIF_PREFS: "campussync_notif_prefs_v10",
  REPORTS: "campussync_reports_v10",
  UMBC_BUILDINGS: "retrieversync_umbc_buildings_v10",
  UMBC_CIRCLES: "retrieversync_umbc_circles_v10",
  UMBC_SHUTTLES: "retrieversync_umbc_shuttles_v10",
  UMBC_PARKING: "retrieversync_umbc_parking_v10",
  UMBC_SAFETY: "retrieversync_umbc_safety_v10",
  UMBC_SCAVENGER: "retrieversync_umbc_scavenger_v10",
  HOUSING_LISTINGS: "campussync_housing_listings_v10",
  ROOMMATE_PROFILES: "campussync_roommates_v10",
  HOUSING_TOURS: "campussync_housing_tours_v10",
  HOUSING_MAINTENANCE: "campussync_housing_maint_v10",
  CAMPUS_WEATHER: "campussync_weather_v10",
  WEATHER_PREFS: "campussync_weather_prefs_v10",
  LAST_SYNC: "campussync_last_sync_v10",
};

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null") return fallback;
    return JSON.parse(saved);
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return fallback;
  }
}

function safeSave<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    window.dispatchEvent(new CustomEvent("campussync:sync", { detail: { key } }));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

// ─────────────────────────────────────────────────────────────
// RETRIEVERHOUSING STORAGE API
// ─────────────────────────────────────────────────────────────
export function loadHousingListings(): HousingListing[] {
  const loaded = safeLoad<HousingListing[]>(STORAGE_KEYS.HOUSING_LISTINGS, initialHousingListings);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialHousingListings;
}
export function saveHousingListings(listings: HousingListing[]): void {
  safeSave(STORAGE_KEYS.HOUSING_LISTINGS, listings);
}

export function loadRoommateProfiles(): RoommateProfile[] {
  const loaded = safeLoad<RoommateProfile[]>(STORAGE_KEYS.ROOMMATE_PROFILES, initialRoommateProfiles);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialRoommateProfiles;
}
export function saveRoommateProfiles(profiles: RoommateProfile[]): void {
  safeSave(STORAGE_KEYS.ROOMMATE_PROFILES, profiles);
}

export function loadHousingTours(): HousingTourBooking[] {
  const loaded = safeLoad<HousingTourBooking[]>(STORAGE_KEYS.HOUSING_TOURS, initialHousingTours);
  return Array.isArray(loaded) ? loaded : initialHousingTours;
}
export function saveHousingTours(tours: HousingTourBooking[]): void {
  safeSave(STORAGE_KEYS.HOUSING_TOURS, tours);
}

export function loadHousingMaintenanceTickets(): HousingMaintenanceTicket[] {
  const loaded = safeLoad<HousingMaintenanceTicket[]>(STORAGE_KEYS.HOUSING_MAINTENANCE, initialHousingMaintenanceTickets);
  return Array.isArray(loaded) ? loaded : initialHousingMaintenanceTickets;
}
export function saveHousingMaintenanceTickets(tickets: HousingMaintenanceTicket[]): void {
  safeSave(STORAGE_KEYS.HOUSING_MAINTENANCE, tickets);
}

// ─────────────────────────────────────────────────────────────
// NOAA / NWS CAMPUS WEATHER STORAGE API
// ─────────────────────────────────────────────────────────────
export function loadCampusWeather(): CampusWeatherReport {
  const loaded = safeLoad<CampusWeatherReport>(STORAGE_KEYS.CAMPUS_WEATHER, initialUmbcMainWeather);
  return {
    ...initialUmbcMainWeather,
    ...(loaded || {}),
    hourlyForecast: Array.isArray(loaded?.hourlyForecast) && loaded.hourlyForecast.length > 0 ? loaded.hourlyForecast : initialUmbcMainWeather.hourlyForecast,
    dailyForecast: Array.isArray(loaded?.dailyForecast) && loaded.dailyForecast.length > 0 ? loaded.dailyForecast : initialUmbcMainWeather.dailyForecast,
    activeAlerts: Array.isArray(loaded?.activeAlerts) ? loaded.activeAlerts : initialUmbcMainWeather.activeAlerts,
    clothingRecommendation: loaded?.clothingRecommendation || initialUmbcMainWeather.clothingRecommendation,
    conditionIcon: loaded?.conditionIcon || initialUmbcMainWeather.conditionIcon,
    radarImageUrl: loaded?.radarImageUrl || initialUmbcMainWeather.radarImageUrl,
  };
}
export function saveCampusWeather(report: CampusWeatherReport): void {
  safeSave(STORAGE_KEYS.CAMPUS_WEATHER, report);
}

export function loadWeatherPreferences(): WeatherNotificationPreferences {
  const loaded = safeLoad<WeatherNotificationPreferences>(STORAGE_KEYS.WEATHER_PREFS, defaultWeatherPreferences);
  return { ...defaultWeatherPreferences, ...loaded };
}
export function saveWeatherPreferences(prefs: WeatherNotificationPreferences): void {
  safeSave(STORAGE_KEYS.WEATHER_PREFS, prefs);
}

// ─────────────────────────────────────────────────────────────
// CORE CAMPUS STORAGE API
// ─────────────────────────────────────────────────────────────
export function loadUmbcBuildings(): UMBCBuilding[] {
  const loaded = safeLoad<UMBCBuilding[]>(STORAGE_KEYS.UMBC_BUILDINGS, initialUMBCBuildings);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCBuildings;
}
export function saveUmbcBuildings(buildings: UMBCBuilding[]): void {
  safeSave(STORAGE_KEYS.UMBC_BUILDINGS, buildings);
}

export function loadUmbcCircles(): LocationCircle[] {
  const loaded = safeLoad<LocationCircle[]>(STORAGE_KEYS.UMBC_CIRCLES, initialUMBCCircles);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCCircles;
}
export function saveUmbcCircles(circles: LocationCircle[]): void {
  safeSave(STORAGE_KEYS.UMBC_CIRCLES, circles);
}

export function loadUmbcShuttles(): UMBCShuttle[] {
  const loaded = safeLoad<UMBCShuttle[]>(STORAGE_KEYS.UMBC_SHUTTLES, initialUMBCShuttles);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCShuttles;
}
export function saveUmbcShuttles(shuttles: UMBCShuttle[]): void {
  safeSave(STORAGE_KEYS.UMBC_SHUTTLES, shuttles);
}

export function loadUmbcParking(): UMBCParkingGarage[] {
  const loaded = safeLoad<UMBCParkingGarage[]>(STORAGE_KEYS.UMBC_PARKING, initialUMBCParking);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCParking;
}
export function saveUmbcParking(parking: UMBCParkingGarage[]): void {
  safeSave(STORAGE_KEYS.UMBC_PARKING, parking);
}

export function loadUmbcSafetyBeacons(): SafetyBeacon[] {
  const loaded = safeLoad<SafetyBeacon[]>(STORAGE_KEYS.UMBC_SAFETY, initialUMBCSafetyBeacons);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCSafetyBeacons;
}
export function saveUmbcSafetyBeacons(beacons: SafetyBeacon[]): void {
  safeSave(STORAGE_KEYS.UMBC_SAFETY, beacons);
}

export function loadUmbcScavengerCheckpoints(): ScavengerHuntCheckpoint[] {
  const loaded = safeLoad<ScavengerHuntCheckpoint[]>(STORAGE_KEYS.UMBC_SCAVENGER, initialUMBCScavengerCheckpoints);
  return Array.isArray(loaded) && loaded.length > 0 ? loaded : initialUMBCScavengerCheckpoints;
}
export function saveUmbcScavengerCheckpoints(checkpoints: ScavengerHuntCheckpoint[]): void {
  safeSave(STORAGE_KEYS.UMBC_SCAVENGER, checkpoints);
}

export function loadCampusPosts(): CampusPost[] {
  const loaded = safeLoad<CampusPost[]>(STORAGE_KEYS.POSTS, initialCampusPosts);
  return Array.isArray(loaded) ? loaded : initialCampusPosts;
}
export function saveCampusPosts(posts: CampusPost[]): void {
  safeSave(STORAGE_KEYS.POSTS, posts);
}

export function loadCampusEvents(): CampusEvent[] {
  const loaded = safeLoad<CampusEvent[]>(STORAGE_KEYS.EVENTS, initialCampusEvents);
  return Array.isArray(loaded) ? loaded : initialCampusEvents;
}
export function saveCampusEvents(events: CampusEvent[]): void {
  safeSave(STORAGE_KEYS.EVENTS, events);
}

export function loadCampusCourses(): CampusCourse[] {
  const loaded = safeLoad<CampusCourse[]>(STORAGE_KEYS.COURSES, initialCampusCourses);
  return Array.isArray(loaded) ? loaded : initialCampusCourses;
}
export function saveCampusCourses(courses: CampusCourse[]): void {
  safeSave(STORAGE_KEYS.COURSES, courses);
}

export function loadCampusClubs(): CampusClub[] {
  const loaded = safeLoad<CampusClub[]>(STORAGE_KEYS.CLUBS, initialCampusClubs);
  return Array.isArray(loaded) ? loaded : initialCampusClubs;
}
export function saveCampusClubs(clubs: CampusClub[]): void {
  safeSave(STORAGE_KEYS.CLUBS, clubs);
}

export function loadVolunteerActivities(): VolunteerActivity[] {
  const loaded = safeLoad<VolunteerActivity[]>(STORAGE_KEYS.VOLUNTEER, initialVolunteerActivities);
  return Array.isArray(loaded) ? loaded : initialVolunteerActivities;
}
export function saveVolunteerActivities(activities: VolunteerActivity[]): void {
  safeSave(STORAGE_KEYS.VOLUNTEER, activities);
}

export function loadResearchProjects(): ResearchOpportunity[] {
  const loaded = safeLoad<ResearchOpportunity[]>(STORAGE_KEYS.RESEARCH, initialResearchProjects);
  return Array.isArray(loaded) ? loaded : initialResearchProjects;
}
export function saveResearchProjects(projects: ResearchOpportunity[]): void {
  safeSave(STORAGE_KEYS.RESEARCH, projects);
}

export function loadCampusJobs(): CampusJob[] {
  const loaded = safeLoad<CampusJob[]>(STORAGE_KEYS.JOBS, initialCampusJobs);
  return Array.isArray(loaded) ? loaded : initialCampusJobs;
}
export function saveCampusJobs(jobs: CampusJob[]): void {
  safeSave(STORAGE_KEYS.JOBS, jobs);
}

export function loadCampusPolls(): CampusPoll[] {
  const loaded = safeLoad<CampusPoll[]>(STORAGE_KEYS.POLLS, initialCampusPolls);
  return Array.isArray(loaded) ? loaded : initialCampusPolls;
}
export function saveCampusPolls(polls: CampusPoll[]): void {
  safeSave(STORAGE_KEYS.POLLS, polls);
}

export function loadCampusAlerts(): CampusAlert[] {
  const loaded = safeLoad<CampusAlert[]>(STORAGE_KEYS.ALERTS, initialCampusAlerts);
  return Array.isArray(loaded) ? loaded : initialCampusAlerts;
}
export function saveCampusAlerts(alerts: CampusAlert[]): void {
  safeSave(STORAGE_KEYS.ALERTS, alerts);
}

export function loadCampusMedia(): CampusMediaItem[] {
  const loaded = safeLoad<CampusMediaItem[]>(STORAGE_KEYS.MEDIA, initialCampusMedia);
  return Array.isArray(loaded) ? loaded : initialCampusMedia;
}
export function saveCampusMedia(media: CampusMediaItem[]): void {
  safeSave(STORAGE_KEYS.MEDIA, media);
}

export function loadStudyPods(): CourseStudyPod[] {
  const loaded = safeLoad<CourseStudyPod[]>(STORAGE_KEYS.STUDY_PODS, initialStudyPods);
  return Array.isArray(loaded) ? loaded : initialStudyPods;
}
export function saveStudyPods(pods: CourseStudyPod[]): void {
  safeSave(STORAGE_KEYS.STUDY_PODS, pods);
}

export function loadLiveActivities(): LiveCampusActivity[] {
  const loaded = safeLoad<LiveCampusActivity[]>(STORAGE_KEYS.LIVE_ACT, initialLiveActivities);
  return Array.isArray(loaded) ? loaded : initialLiveActivities;
}
export function saveLiveActivities(acts: LiveCampusActivity[]): void {
  safeSave(STORAGE_KEYS.LIVE_ACT, acts);
}

export function loadPeerMatches(): PeerMatch[] {
  const loaded = safeLoad<PeerMatch[]>(STORAGE_KEYS.PEER_MATCH, initialPeerMatches);
  return Array.isArray(loaded) ? loaded : initialPeerMatches;
}
export function savePeerMatches(peers: PeerMatch[]): void {
  safeSave(STORAGE_KEYS.PEER_MATCH, peers);
}

export function loadQuickGroups(): QuickGroup[] {
  const loaded = safeLoad<QuickGroup[]>(STORAGE_KEYS.QUICK_GROUPS, initialQuickGroups);
  return Array.isArray(loaded) ? loaded : initialQuickGroups;
}
export function saveQuickGroups(groups: QuickGroup[]): void {
  safeSave(STORAGE_KEYS.QUICK_GROUPS, groups);
}

export function loadCampusOpportunities(): CampusOpportunity[] {
  const loaded = safeLoad<CampusOpportunity[]>(STORAGE_KEYS.OPPORTUNITIES, initialCampusOpportunities);
  return Array.isArray(loaded) ? loaded : initialCampusOpportunities;
}
export function saveCampusOpportunities(opps: CampusOpportunity[]): void {
  safeSave(STORAGE_KEYS.OPPORTUNITIES, opps);
}

export function loadServiceRequests(): CampusServiceRequest[] {
  const loaded = safeLoad<CampusServiceRequest[]>(STORAGE_KEYS.SERVICE_REQ, initialServiceRequests);
  return Array.isArray(loaded) ? loaded : initialServiceRequests;
}
export function saveServiceRequests(reqs: CampusServiceRequest[]): void {
  safeSave(STORAGE_KEYS.SERVICE_REQ, reqs);
}

export function loadEventMemories(): EventMemory[] {
  const loaded = safeLoad<EventMemory[]>(STORAGE_KEYS.EVENT_MEMORIES, initialEventMemories);
  return Array.isArray(loaded) ? loaded : initialEventMemories;
}
export function saveEventMemories(mems: EventMemory[]): void {
  safeSave(STORAGE_KEYS.EVENT_MEMORIES, mems);
}

export function loadOfficeHours(): OfficeHourSlot[] {
  const loaded = safeLoad<OfficeHourSlot[]>(STORAGE_KEYS.OFFICE_HOURS, initialOfficeHours);
  return Array.isArray(loaded) ? loaded : initialOfficeHours;
}
export function saveOfficeHours(oh: OfficeHourSlot[]): void {
  safeSave(STORAGE_KEYS.OFFICE_HOURS, oh);
}

export function loadCampusReels(): CampusReel[] {
  const loaded = safeLoad<CampusReel[]>(STORAGE_KEYS.REELS, initialCampusReels);
  return Array.isArray(loaded) ? loaded : initialCampusReels;
}
export function saveCampusReels(reels: CampusReel[]): void {
  safeSave(STORAGE_KEYS.REELS, reels);
}

export function loadCampusGames(): CampusGame[] {
  const loaded = safeLoad<CampusGame[]>(STORAGE_KEYS.GAMES, initialCampusGames);
  return Array.isArray(loaded) ? loaded : initialCampusGames;
}
export function saveCampusGames(games: CampusGame[]): void {
  safeSave(STORAGE_KEYS.GAMES, games);
}

export function loadCampusNotifications(): CampusNotification[] {
  const loaded = safeLoad<CampusNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialCampusNotifications);
  return Array.isArray(loaded) ? loaded : initialCampusNotifications;
}
export function saveCampusNotifications(notifs: CampusNotification[]): void {
  safeSave(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

export function loadNotificationPreferences(): NotificationPreferences {
  return safeLoad(STORAGE_KEYS.NOTIF_PREFS, defaultNotificationPreferences);
}
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  safeSave(STORAGE_KEYS.NOTIF_PREFS, prefs);
}

export function loadContentReports(): ContentReport[] {
  return safeLoad(STORAGE_KEYS.REPORTS, []);
}
export function saveContentReport(report: ContentReport): void {
  const reports = loadContentReports();
  safeSave(STORAGE_KEYS.REPORTS, [report, ...reports]);
}

export function loadMarketplaceItems(): MarketItem[] {
  const loaded = safeLoad<MarketItem[]>(STORAGE_KEYS.MARKETPLACE, initialMarketplaceItems);
  return Array.isArray(loaded) ? loaded : initialMarketplaceItems;
}
export function saveMarketplaceItems(items: MarketItem[]): void {
  safeSave(STORAGE_KEYS.MARKETPLACE, items);
}

export function loadChatMessages(): ChatMessage[] {
  const loaded = safeLoad<ChatMessage[]>(STORAGE_KEYS.MESSAGES, initialChatMessages);
  return Array.isArray(loaded) ? loaded : initialChatMessages;
}
export function saveChatMessages(messages: ChatMessage[]): void {
  safeSave(STORAGE_KEYS.MESSAGES, messages);
}

export function loadCurrentUser(): UserProfile {
  const loaded = safeLoad<UserProfile>(STORAGE_KEYS.USER, defaultCurrentUser);
  return {
    ...defaultCurrentUser,
    ...(loaded || {}),
    name: loaded?.name || defaultCurrentUser.name,
    major: loaded?.major || defaultCurrentUser.major,
    studentId: loaded?.studentId || defaultCurrentUser.studentId,
    avatar: loaded?.avatar || defaultCurrentUser.avatar,
    gradYear: loaded?.gradYear || defaultCurrentUser.gradYear,
    role: loaded?.role || defaultCurrentUser.role,
    leadershipRoles: Array.isArray(loaded?.leadershipRoles) ? loaded.leadershipRoles : defaultCurrentUser.leadershipRoles || [],
    achievements: Array.isArray(loaded?.achievements) ? loaded.achievements : defaultCurrentUser.achievements || [],
    projects: Array.isArray(loaded?.projects) ? loaded.projects : defaultCurrentUser.projects || [],
    interests: Array.isArray(loaded?.interests) ? loaded.interests : defaultCurrentUser.interests || [],
    goals: Array.isArray(loaded?.goals) ? loaded.goals : defaultCurrentUser.goals || [],
    volunteerHoursLogged: typeof loaded?.volunteerHoursLogged === "number" ? loaded.volunteerHoursLogged : defaultCurrentUser.volunteerHoursLogged,
    eventsAttendedCount: typeof loaded?.eventsAttendedCount === "number" ? loaded.eventsAttendedCount : defaultCurrentUser.eventsAttendedCount,
    isLocationSharing: loaded?.isLocationSharing ?? false,
    ghostModeEnabled: loaded?.ghostModeEnabled ?? false,
  };
}
export function saveCurrentUser(user: UserProfile): void {
  safeSave(STORAGE_KEYS.USER, user);
}

export function resetCampusDemoData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  window.dispatchEvent(new CustomEvent("campussync:reset"));
}
