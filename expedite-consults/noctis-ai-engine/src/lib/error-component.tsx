import { useEffect, useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
const STALE_CHUNK =
  /dynamically imported module|module script failed|Importing a module script failed|can't access property ["']component["']|cannot read properties of undefined \(reading ["']component["']\)/i;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const bag = error as { message?: unknown; statusText?: unknown };
    if (typeof bag.message === "string" && bag.message) return bag.message;
    if (typeof bag.statusText === "string" && bag.statusText) return bag.statusText;
  }
  return FALLBACK_MESSAGE;
}

async function warmModule(url: string, depth: number, seen: Set<string>) {
  if (depth > 2 || seen.has(url) || seen.size > 40) return;
  seen.add(url);
  const res = await fetch(url, { cache: "reload" });
  if (!res.ok) return;
  const text = await res.text();
  const base = url.slice(0, url.lastIndexOf("/") + 1);
  const names = [...text.matchAll(/from"\.\/([^"]+\.js)"/g)].map((hit) => hit[1]);
  await Promise.all(names.map((name) => warmModule(base + name, depth + 1, seen)));
}

const RETRY_KEY = "vt-chunk-retry-12";

function freshUrl() {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}

async function bustChunk(message: string) {
  sessionStorage.removeItem(RETRY_KEY);
  sessionStorage.removeItem("vt-chunk-retry");
  sessionStorage.removeItem("vt-chunk-retry-4");
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* a reload still replaces the stale copy */
  }
  const hit = message.match(/https?:\/\/\S+?\.js/);
  if (hit) {
    try {
      await warmModule(hit[0], 0, new Set());
    } catch {
      /* the reload still replaces a stale copy */
    }
  }
  window.location.replace(freshUrl());
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const message = errorMessage(error);
  const stale = STALE_CHUNK.test(message);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!stale) return;
    const key = RETRY_KEY;
    const n = Number(sessionStorage.getItem(key) || "0");
    if (n >= 2) {
      setGaveUp(true);
      return;
    }
    sessionStorage.setItem(key, String(n + 1));
    window.location.replace(freshUrl());
  }, [stale, message]);

  if (stale && !gaveUp) return null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-live" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {stale && !gaveUp
          ? "Loading the current app."
          : stale
            ? "A page file did not load. Press Reload once. If it stays, publish the app again."
            : message}
      </p>
      <button
        type="button"
        className="mt-2 min-h-11 rounded-full bg-elevated px-4 text-sm font-semibold"
        onClick={() => {
          sessionStorage.removeItem(RETRY_KEY);
          sessionStorage.removeItem("vt-chunk-retry");
          sessionStorage.removeItem("vt-chunk-retry-4");
          sessionStorage.removeItem("vt-chunk-retry-6");
          void bustChunk(message);
        }}
      >
        Reload
      </button>
    </main>
  );
}
