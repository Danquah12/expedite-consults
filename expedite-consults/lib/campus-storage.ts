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
} from "./campus-data";

const STORAGE_KEYS = {
  POSTS: "campussync_posts_v5",
  EVENTS: "campussync_events_v5",
  COURSES: "campussync_courses_v5",
  CLUBS: "campussync_clubs_v5",
  MARKETPLACE: "campussync_market_v5",
  MESSAGES: "campussync_messages_v5",
  USER: "campussync_user_v5",
  VOLUNTEER: "campussync_volunteer_v5",
  RESEARCH: "campussync_research_v5",
  JOBS: "campussync_jobs_v5",
  POLLS: "campussync_polls_v5",
  ALERTS: "campussync_alerts_v5",
  MEDIA: "campussync_media_v5",
  STUDY_PODS: "campussync_pods_v5",
  LIVE_ACT: "campussync_live_v5",
  PEER_MATCH: "campussync_peers_v5",
  QUICK_GROUPS: "campussync_qgroups_v5",
  OPPORTUNITIES: "campussync_opps_v5",
  SERVICE_REQ: "campussync_311_v5",
  EVENT_MEMORIES: "campussync_memories_v5",
  OFFICE_HOURS: "campussync_oh_v5",
  REELS: "campussync_reels_v5",
  GAMES: "campussync_games_v5",
  NOTIFICATIONS: "campussync_notifs_v5",
  NOTIF_PREFS: "campussync_notif_prefs_v5",
  REPORTS: "campussync_reports_v5",
  LAST_SYNC: "campussync_last_sync_v5",
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

// 1. Reels Storage
export function loadCampusReels(): CampusReel[] {
  return safeLoad(STORAGE_KEYS.REELS, initialCampusReels);
}
export function saveCampusReels(reels: CampusReel[]): void {
  safeSave(STORAGE_KEYS.REELS, reels);
}

// 2. Games & Leaderboards Storage
export function loadCampusGames(): CampusGame[] {
  return safeLoad(STORAGE_KEYS.GAMES, initialCampusGames);
}
export function saveCampusGames(games: CampusGame[]): void {
  safeSave(STORAGE_KEYS.GAMES, games);
}

// 3. Notifications Storage
export function loadCampusNotifications(): CampusNotification[] {
  return safeLoad(STORAGE_KEYS.NOTIFICATIONS, initialCampusNotifications);
}
export function saveCampusNotifications(notifs: CampusNotification[]): void {
  safeSave(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// 4. Notification Preferences
export function loadNotificationPreferences(): NotificationPreferences {
  return safeLoad(STORAGE_KEYS.NOTIF_PREFS, defaultNotificationPreferences);
}
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  safeSave(STORAGE_KEYS.NOTIF_PREFS, prefs);
}

// 5. Reports Pipeline
export function loadContentReports(): ContentReport[] {
  return safeLoad(STORAGE_KEYS.REPORTS, []);
}
export function saveContentReport(report: ContentReport): void {
  const reports = loadContentReports();
  safeSave(STORAGE_KEYS.REPORTS, [report, ...reports]);
}

// 6. Live Activities Storage
export function loadLiveActivities(): LiveCampusActivity[] {
  return safeLoad(STORAGE_KEYS.LIVE_ACT, initialLiveActivities);
}
export function saveLiveActivities(acts: LiveCampusActivity[]): void {
  safeSave(STORAGE_KEYS.LIVE_ACT, acts);
}

// 7. Peer Matches ("Find My People")
export function loadPeerMatches(): PeerMatch[] {
  return safeLoad(STORAGE_KEYS.PEER_MATCH, initialPeerMatches);
}
export function savePeerMatches(peers: PeerMatch[]): void {
  safeSave(STORAGE_KEYS.PEER_MATCH, peers);
}

// 8. Quick Groups ("30-Second Groups")
export function loadQuickGroups(): QuickGroup[] {
  return safeLoad(STORAGE_KEYS.QUICK_GROUPS, initialQuickGroups);
}
export function saveQuickGroups(groups: QuickGroup[]): void {
  safeSave(STORAGE_KEYS.QUICK_GROUPS, groups);
}

// 9. Consolidated Opportunities
export function loadCampusOpportunities(): CampusOpportunity[] {
  return safeLoad(STORAGE_KEYS.OPPORTUNITIES, initialCampusOpportunities);
}
export function saveCampusOpportunities(opps: CampusOpportunity[]): void {
  safeSave(STORAGE_KEYS.OPPORTUNITIES, opps);
}

// 10. 311 Service Requests
export function loadServiceRequests(): CampusServiceRequest[] {
  return safeLoad(STORAGE_KEYS.SERVICE_REQ, initialServiceRequests);
}
export function saveServiceRequests(reqs: CampusServiceRequest[]): void {
  safeSave(STORAGE_KEYS.SERVICE_REQ, reqs);
}

// 11. Event Memories
export function loadEventMemories(): EventMemory[] {
  return safeLoad(STORAGE_KEYS.EVENT_MEMORIES, initialEventMemories);
}
export function saveEventMemories(mems: EventMemory[]): void {
  safeSave(STORAGE_KEYS.EVENT_MEMORIES, mems);
}

// 12. Office Hours
export function loadOfficeHours(): OfficeHourSlot[] {
  return safeLoad(STORAGE_KEYS.OFFICE_HOURS, initialOfficeHours);
}
export function saveOfficeHours(oh: OfficeHourSlot[]): void {
  safeSave(STORAGE_KEYS.OFFICE_HOURS, oh);
}

// 13. Core Domain Getters
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
