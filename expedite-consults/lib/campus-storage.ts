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
  TowsonBuilding,
  LocationCircle,
  TowsonShuttle,
  TowsonParkingGarage,
  SafetyBeacon,
  ScavengerHuntCheckpoint,
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
  initialTowsonBuildings,
  initialTowsonCircles,
  initialTowsonShuttles,
  initialTowsonParking,
  initialTowsonSafetyBeacons,
  initialTowsonScavengerCheckpoints,
} from "./campus-data";

const STORAGE_KEYS = {
  POSTS: "campussync_posts_v6",
  EVENTS: "campussync_events_v6",
  COURSES: "campussync_courses_v6",
  CLUBS: "campussync_clubs_v6",
  MARKETPLACE: "campussync_market_v6",
  MESSAGES: "campussync_messages_v6",
  USER: "campussync_user_v6",
  VOLUNTEER: "campussync_volunteer_v6",
  RESEARCH: "campussync_research_v6",
  JOBS: "campussync_jobs_v6",
  POLLS: "campussync_polls_v6",
  ALERTS: "campussync_alerts_v6",
  MEDIA: "campussync_media_v6",
  STUDY_PODS: "campussync_pods_v6",
  LIVE_ACT: "campussync_live_v6",
  PEER_MATCH: "campussync_peers_v6",
  QUICK_GROUPS: "campussync_qgroups_v6",
  OPPORTUNITIES: "campussync_opps_v6",
  SERVICE_REQ: "campussync_311_v6",
  EVENT_MEMORIES: "campussync_memories_v6",
  OFFICE_HOURS: "campussync_oh_v6",
  REELS: "campussync_reels_v6",
  GAMES: "campussync_games_v6",
  NOTIFICATIONS: "campussync_notifs_v6",
  NOTIF_PREFS: "campussync_notif_prefs_v6",
  REPORTS: "campussync_reports_v6",
  TOWSON_BUILDINGS: "campussync_tu_buildings_v6",
  TOWSON_CIRCLES: "campussync_tu_circles_v6",
  TOWSON_SHUTTLES: "campussync_tu_shuttles_v6",
  TOWSON_PARKING: "campussync_tu_parking_v6",
  TOWSON_SAFETY: "campussync_tu_safety_v6",
  TOWSON_SCAVENGER: "campussync_tu_scavenger_v6",
  LAST_SYNC: "campussync_last_sync_v6",
};

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
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

// 1. Towson Buildings
export function loadTowsonBuildings(): TowsonBuilding[] {
  return safeLoad(STORAGE_KEYS.TOWSON_BUILDINGS, initialTowsonBuildings);
}
export function saveTowsonBuildings(buildings: TowsonBuilding[]): void {
  safeSave(STORAGE_KEYS.TOWSON_BUILDINGS, buildings);
}

// 2. Towson Circles (Life360 Groups)
export function loadTowsonCircles(): LocationCircle[] {
  return safeLoad(STORAGE_KEYS.TOWSON_CIRCLES, initialTowsonCircles);
}
export function saveTowsonCircles(circles: LocationCircle[]): void {
  safeSave(STORAGE_KEYS.TOWSON_CIRCLES, circles);
}

// 3. Towson Shuttles (Tiger Ride)
export function loadTowsonShuttles(): TowsonShuttle[] {
  return safeLoad(STORAGE_KEYS.TOWSON_SHUTTLES, initialTowsonShuttles);
}
export function saveTowsonShuttles(shuttles: TowsonShuttle[]): void {
  safeSave(STORAGE_KEYS.TOWSON_SHUTTLES, shuttles);
}

// 4. Towson Parking
export function loadTowsonParking(): TowsonParkingGarage[] {
  return safeLoad(STORAGE_KEYS.TOWSON_PARKING, initialTowsonParking);
}
export function saveTowsonParking(parking: TowsonParkingGarage[]): void {
  safeSave(STORAGE_KEYS.TOWSON_PARKING, parking);
}

// 5. Towson Safety Beacons (TUPD)
export function loadTowsonSafetyBeacons(): SafetyBeacon[] {
  return safeLoad(STORAGE_KEYS.TOWSON_SAFETY, initialTowsonSafetyBeacons);
}
export function saveTowsonSafetyBeacons(beacons: SafetyBeacon[]): void {
  safeSave(STORAGE_KEYS.TOWSON_SAFETY, beacons);
}

// 6. Towson Scavenger Hunt Checkpoints
export function loadTowsonScavengerCheckpoints(): ScavengerHuntCheckpoint[] {
  return safeLoad(STORAGE_KEYS.TOWSON_SCAVENGER, initialTowsonScavengerCheckpoints);
}
export function saveTowsonScavengerCheckpoints(checkpoints: ScavengerHuntCheckpoint[]): void {
  safeSave(STORAGE_KEYS.TOWSON_SCAVENGER, checkpoints);
}

// 7. Reels Storage
export function loadCampusReels(): CampusReel[] {
  return safeLoad(STORAGE_KEYS.REELS, initialCampusReels);
}
export function saveCampusReels(reels: CampusReel[]): void {
  safeSave(STORAGE_KEYS.REELS, reels);
}

// 8. Games & Leaderboards Storage
export function loadCampusGames(): CampusGame[] {
  return safeLoad(STORAGE_KEYS.GAMES, initialCampusGames);
}
export function saveCampusGames(games: CampusGame[]): void {
  safeSave(STORAGE_KEYS.GAMES, games);
}

// 9. Notifications Storage
export function loadCampusNotifications(): CampusNotification[] {
  return safeLoad(STORAGE_KEYS.NOTIFICATIONS, initialCampusNotifications);
}
export function saveCampusNotifications(notifs: CampusNotification[]): void {
  safeSave(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// 10. Notification Preferences
export function loadNotificationPreferences(): NotificationPreferences {
  return safeLoad(STORAGE_KEYS.NOTIF_PREFS, defaultNotificationPreferences);
}
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  safeSave(STORAGE_KEYS.NOTIF_PREFS, prefs);
}

// 11. Reports Pipeline
export function loadContentReports(): ContentReport[] {
  return safeLoad(STORAGE_KEYS.REPORTS, []);
}
export function saveContentReport(report: ContentReport): void {
  const reports = loadContentReports();
  safeSave(STORAGE_KEYS.REPORTS, [report, ...reports]);
}

// 12. Live Activities Storage
export function loadLiveActivities(): LiveCampusActivity[] {
  return safeLoad(STORAGE_KEYS.LIVE_ACT, initialLiveActivities);
}
export function saveLiveActivities(acts: LiveCampusActivity[]): void {
  safeSave(STORAGE_KEYS.LIVE_ACT, acts);
}

// 13. Peer Matches ("Find My People")
export function loadPeerMatches(): PeerMatch[] {
  return safeLoad(STORAGE_KEYS.PEER_MATCH, initialPeerMatches);
}
export function savePeerMatches(peers: PeerMatch[]): void {
  safeSave(STORAGE_KEYS.PEER_MATCH, peers);
}

// 14. Quick Groups ("30-Second Groups")
export function loadQuickGroups(): QuickGroup[] {
  return safeLoad(STORAGE_KEYS.QUICK_GROUPS, initialQuickGroups);
}
export function saveQuickGroups(groups: QuickGroup[]): void {
  safeSave(STORAGE_KEYS.QUICK_GROUPS, groups);
}

// 15. Consolidated Opportunities
export function loadCampusOpportunities(): CampusOpportunity[] {
  return safeLoad(STORAGE_KEYS.OPPORTUNITIES, initialCampusOpportunities);
}
export function saveCampusOpportunities(opps: CampusOpportunity[]): void {
  safeSave(STORAGE_KEYS.OPPORTUNITIES, opps);
}

// 16. 311 Service Requests
export function loadServiceRequests(): CampusServiceRequest[] {
  return safeLoad(STORAGE_KEYS.SERVICE_REQ, initialServiceRequests);
}
export function saveServiceRequests(reqs: CampusServiceRequest[]): void {
  safeSave(STORAGE_KEYS.SERVICE_REQ, reqs);
}

// 17. Event Memories
export function loadEventMemories(): EventMemory[] {
  return safeLoad(STORAGE_KEYS.EVENT_MEMORIES, initialEventMemories);
}
export function saveEventMemories(mems: EventMemory[]): void {
  safeSave(STORAGE_KEYS.EVENT_MEMORIES, mems);
}

// 18. Office Hours
export function loadOfficeHours(): OfficeHourSlot[] {
  return safeLoad(STORAGE_KEYS.OFFICE_HOURS, initialOfficeHours);
}
export function saveOfficeHours(oh: OfficeHourSlot[]): void {
  safeSave(STORAGE_KEYS.OFFICE_HOURS, oh);
}

// 19. Core Domain Getters
export function loadCampusPosts(): CampusPost[] {
  return safeLoad(STORAGE_KEYS.POSTS, initialCampusPosts);
}
export function saveCampusPosts(posts: CampusPost[]): void {
  safeSave(STORAGE_KEYS.POSTS, posts);
}

export function loadCampusEvents(): CampusEvent[] {
  return safeLoad(STORAGE_KEYS.EVENTS, initialCampusEvents);
}
export function saveCampusEvents(events: CampusEvent[]): void {
  safeSave(STORAGE_KEYS.EVENTS, events);
}

export function loadCampusCourses(): CampusCourse[] {
  return safeLoad(STORAGE_KEYS.COURSES, initialCampusCourses);
}
export function saveCampusCourses(courses: CampusCourse[]): void {
  safeSave(STORAGE_KEYS.COURSES, courses);
}

export function loadCampusClubs(): CampusClub[] {
  return safeLoad(STORAGE_KEYS.CLUBS, initialCampusClubs);
}
export function saveCampusClubs(clubs: CampusClub[]): void {
  safeSave(STORAGE_KEYS.CLUBS, clubs);
}

export function loadVolunteerActivities(): VolunteerActivity[] {
  return safeLoad(STORAGE_KEYS.VOLUNTEER, initialVolunteerActivities);
}
export function saveVolunteerActivities(activities: VolunteerActivity[]): void {
  safeSave(STORAGE_KEYS.VOLUNTEER, activities);
}

export function loadResearchProjects(): ResearchOpportunity[] {
  return safeLoad(STORAGE_KEYS.RESEARCH, initialResearchProjects);
}
export function saveResearchProjects(projects: ResearchOpportunity[]): void {
  safeSave(STORAGE_KEYS.RESEARCH, projects);
}

export function loadCampusJobs(): CampusJob[] {
  return safeLoad(STORAGE_KEYS.JOBS, initialCampusJobs);
}
export function saveCampusJobs(jobs: CampusJob[]): void {
  safeSave(STORAGE_KEYS.JOBS, jobs);
}

export function loadStudyPods(): CourseStudyPod[] {
  return safeLoad(STORAGE_KEYS.STUDY_PODS, initialStudyPods);
}
export function saveStudyPods(pods: CourseStudyPod[]): void {
  safeSave(STORAGE_KEYS.STUDY_PODS, pods);
}

export function loadCampusMedia(): CampusMediaItem[] {
  return safeLoad(STORAGE_KEYS.MEDIA, initialCampusMedia);
}
export function saveCampusMedia(media: CampusMediaItem[]): void {
  safeSave(STORAGE_KEYS.MEDIA, media);
}

export function loadCampusPolls(): CampusPoll[] {
  return safeLoad(STORAGE_KEYS.POLLS, initialCampusPolls);
}
export function saveCampusPolls(polls: CampusPoll[]): void {
  safeSave(STORAGE_KEYS.POLLS, polls);
}

export function loadCampusAlerts(): CampusAlert[] {
  return safeLoad(STORAGE_KEYS.ALERTS, initialCampusAlerts);
}
export function saveCampusAlerts(alerts: CampusAlert[]): void {
  safeSave(STORAGE_KEYS.ALERTS, alerts);
}

export function loadMarketplaceItems(): MarketItem[] {
  return safeLoad(STORAGE_KEYS.MARKETPLACE, initialMarketplaceItems);
}
export function saveMarketplaceItems(items: MarketItem[]): void {
  safeSave(STORAGE_KEYS.MARKETPLACE, items);
}

export function loadChatMessages(): ChatMessage[] {
  return safeLoad(STORAGE_KEYS.MESSAGES, initialChatMessages);
}
export function saveChatMessages(messages: ChatMessage[]): void {
  safeSave(STORAGE_KEYS.MESSAGES, messages);
}

export function loadCurrentUser(): UserProfile {
  const loaded = safeLoad<UserProfile>(STORAGE_KEYS.USER, defaultCurrentUser);
  return {
    ...defaultCurrentUser,
    ...loaded,
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
