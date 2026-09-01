import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date as relative ("2 hours ago") */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Format a number with K/M suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Slugify a string for hashtags */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/** Extract hashtags from a caption/content string */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9]+/g) ?? [];
  return [...new Set(matches.map((h) => h.slice(1).toLowerCase()))];
}

/** Extract @mentions from a text string */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_]+/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

/** Assert a value is not null/undefined */
export function invariant<T>(val: T | null | undefined, msg: string): T {
  if (val === null || val === undefined) {
    throw new Error(`Invariant failed: ${msg}`);
  }
  return val;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/** Alias for formatCount — used by legacy (sphera) components */
export const formatNumber = formatCount;

/** Format a date as relative — alias used by legacy (sphera) components */
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Get initials from a name string */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, maxChars)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}
