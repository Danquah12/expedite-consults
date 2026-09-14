// IndexedDB Persistent Vault for Videos & Local Feed Posts
// Bypasses 5MB localStorage limit and supports Gigabytes of video blobs

const DB_NAME = "SpheraMediaVault_v1";
const DB_VERSION = 1;
const STORE_VIDEOS = "videos";
const STORE_POSTS = "local_posts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        db.createObjectStore(STORE_VIDEOS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_POSTS)) {
        db.createObjectStore(STORE_POSTS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VIDEOS, "readwrite");
      const store = tx.objectStore(STORE_VIDEOS);
      const req = store.put({
        id,
        blob,
        type: blob.type,
        size: blob.size,
        savedAt: Date.now(),
      });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not save video blob:", err);
  }
}

export async function getVideoBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VIDEOS, "readonly");
      const store = tx.objectStore(STORE_VIDEOS);
      const cleanId = id.replace(/^idb:\/\//, "");
      const req = store.get(cleanId);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not get video blob:", err);
    return null;
  }
}

export async function getVideoObjectUrl(id: string): Promise<string | null> {
  const blob = await getVideoBlob(id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

export async function saveLocalFeedPost(post: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSTS, "readwrite");
      const store = tx.objectStore(STORE_POSTS);
      const req = store.put(post);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not save local feed post:", err);
  }
}

export async function getLocalFeedPosts(): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSTS, "readonly");
      const store = tx.objectStore(STORE_POSTS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not get local feed posts:", err);
    return [];
  }
}
