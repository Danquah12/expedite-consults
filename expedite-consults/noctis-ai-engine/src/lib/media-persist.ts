const DB = "vibetok-media";
const STORE = "clips";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putClip(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getClip(id: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const blob = req.result as Blob | undefined;
      resolve(blob ? URL.createObjectURL(blob) : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function blobFromUrl(url: string) {
  const res = await fetch(url);
  return res.blob();
}

export function isEphemeral(url: string) {
  return url.startsWith("blob:") || url.startsWith("data:");
}

export async function freezeUrl(id: string, url: string) {
  if (!isEphemeral(url)) return url;
  try {
    const blob = await blobFromUrl(url);
    await putClip(id, blob);
    return url;
  } catch {
    return url;
  }
}

const KEY = "vibetok-feed-v2";

export function readPersisted<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function writePersisted(data: unknown) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}
