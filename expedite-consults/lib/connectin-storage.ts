"use client"

import { Post, UserProfile, MessageThread, SuggestedConnection, initialPosts, currentUser, initialMessages, suggestedConnections } from "./linkedin-data"

const STORAGE_KEYS = {
  POSTS: 'connectin_posts_v1',
  USER: 'connectin_user_v1',
  MESSAGES: 'connectin_messages_v1',
  CONNECTIONS: 'connectin_connections_v1',
  THEME: 'connectin_theme_v1'
}

export function loadStoredPosts(): Post[] {
  if (typeof window === 'undefined') return initialPosts
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS)
    return saved ? JSON.parse(saved) : initialPosts
  } catch (e) {
    console.error('Failed to load posts from storage', e)
    return initialPosts
  }
}

export function saveStoredPosts(posts: Post[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
  } catch (e) {
    console.error('Failed to save posts to storage', e)
  }
}

export function loadStoredUser(): UserProfile {
  if (typeof window === 'undefined') return currentUser
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : currentUser
  } catch (e) {
    console.error('Failed to load user from storage', e)
    return currentUser
  }
}

export function saveStoredUser(user: UserProfile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (e) {
    console.error('Failed to save user to storage', e)
  }
}

export function loadStoredMessages(): MessageThread[] {
  if (typeof window === 'undefined') return initialMessages
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    return saved ? JSON.parse(saved) : initialMessages
  } catch (e) {
    console.error('Failed to load messages from storage', e)
    return initialMessages
  }
}

export function saveStoredMessages(messages: MessageThread[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  } catch (e) {
    console.error('Failed to save messages to storage', e)
  }
}

export function loadStoredConnections(): SuggestedConnection[] {
  if (typeof window === 'undefined') return suggestedConnections
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONNECTIONS)
    return saved ? JSON.parse(saved) : suggestedConnections
  } catch (e) {
    console.error('Failed to load connections from storage', e)
    return suggestedConnections
  }
}

export function saveStoredConnections(connections: SuggestedConnection[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections))
  } catch (e) {
    console.error('Failed to save connections to storage', e)
  }
}
