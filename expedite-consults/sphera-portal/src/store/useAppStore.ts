"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // UI
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;

  // Feed
  feedType: "home" | "following" | "trending";
  setFeedType: (type: "home" | "following" | "trending") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // UI
      isCreatePostOpen: false,
      setIsCreatePostOpen: (open) => set({ isCreatePostOpen: open }),

      // Notifications
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnreadCount: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
      resetUnreadCount: () => set({ unreadCount: 0 }),

      // Feed
      feedType: "home",
      setFeedType: (type) => set({ feedType: type }),
    }),
    {
      name: "sphera-app-store",
      // Only persist non-sensitive UI preferences
      partialize: (state) => ({ feedType: state.feedType }),
    }
  )
);
