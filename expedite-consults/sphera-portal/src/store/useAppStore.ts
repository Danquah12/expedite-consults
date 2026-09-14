"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeedStreamType = "for_you" | "following" | "friends" | "pulse" | "live";
export type UniversalCreateTab = "pulse" | "reel" | "photo" | "article" | "bounty" | "bazaar" | "poll";

interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  username: string | null;
  role: string;
}

interface AppState {
  // Auth
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;

  // UI - Universal Create Modal
  isUniversalCreateOpen: boolean;
  universalCreateInitialTab: UniversalCreateTab;
  openUniversalCreate: (tab?: UniversalCreateTab) => void;
  closeUniversalCreate: () => void;

  // Backwards compatibility for isCreatePostOpen
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;

  // Feed Streams
  activeFeedStream: FeedStreamType;
  setFeedStream: (stream: FeedStreamType) => void;

  // Legacy feedType compatibility
  feedType: "home" | "following" | "trending";
  setFeedType: (type: "home" | "following" | "trending") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // UI - Universal Create Matrix
      isUniversalCreateOpen: false,
      universalCreateInitialTab: "pulse",
      openUniversalCreate: (tab = "pulse") =>
        set({ isUniversalCreateOpen: true, universalCreateInitialTab: tab }),
      closeUniversalCreate: () =>
        set({ isUniversalCreateOpen: false }),

      // Legacy create post modal
      isCreatePostOpen: false,
      setIsCreatePostOpen: (open) =>
        set({ isCreatePostOpen: open, isUniversalCreateOpen: open }),

      // Notifications
      unreadCount: 3,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnreadCount: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
      resetUnreadCount: () => set({ unreadCount: 0 }),

      // Feed Streams
      activeFeedStream: "for_you",
      setFeedStream: (stream) => set({ activeFeedStream: stream }),

      // Legacy
      feedType: "home",
      setFeedType: (type) => set({ feedType: type }),
    }),
    {
      name: "sphera-app-store",
      partialize: (state) => ({
        activeFeedStream: state.activeFeedStream,
        feedType: state.feedType,
      }),
    }
  )
);
