export type ConnectLnPresenceStatus =
  | 'available'
  | 'busy'
  | 'dnd'
  | 'brb'
  | 'in_call'
  | 'ooo'
  | 'offline';

export interface ConnectLnPresenceRecord {
  status: ConnectLnPresenceStatus;
  customMessage?: string;
  oooAutoDecline?: boolean;
  oooMessage?: string;
  updatedAtMs: number;
  previousStatus?: ConnectLnPresenceStatus;
}

export const PRESENCE_META: Record<
  ConnectLnPresenceStatus,
  { label: string; shortLabel: string; colorHex: string; dotClass: string; desc: string }
> = {
  available: {
    label: 'Available',
    shortLabel: 'Available',
    colorHex: '#10B981',
    dotClass: 'bg-emerald-500',
    desc: 'Ready to chat and receive incoming calls',
  },
  busy: {
    label: 'Busy',
    shortLabel: 'Busy',
    colorHex: '#EF4444',
    dotClass: 'bg-rose-500',
    desc: 'Focused or occupied (still rings quietly)',
  },
  dnd: {
    label: 'Do Not Disturb',
    shortLabel: 'DND',
    colorHex: '#DC2626',
    dotClass: 'bg-red-600',
    desc: 'Silences loud incoming ringtones & popups',
  },
  brb: {
    label: 'Be Right Back',
    shortLabel: 'BRB',
    colorHex: '#F59E0B',
    dotClass: 'bg-amber-500',
    desc: 'Temporarily stepped away from keyboard',
  },
  in_call: {
    label: 'In a Call',
    shortLabel: 'In Call',
    colorHex: '#DC2626',
    dotClass: 'bg-rose-600',
    desc: 'Automatically active during live ConnectLn calls',
  },
  ooo: {
    label: 'Out of Office',
    shortLabel: 'OOO',
    colorHex: '#9333EA',
    dotClass: 'bg-purple-600',
    desc: 'Away / optional auto-decline for new meeting invites',
  },
  offline: {
    label: 'Appear Offline',
    shortLabel: 'Offline',
    colorHex: '#94A3B8',
    dotClass: 'bg-slate-400',
    desc: 'Shown as offline to other team members',
  },
};

const PRESENCE_STORAGE_KEY = 'connectln_presence_v1';
export const PRESENCE_CHANGE_EVENT = 'connectln_presence_change';

export function normalizePresenceKey(raw?: string): string {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return '';
  if (s.includes('@')) return s;
  return s.replace(/[^a-z0-9]/g, '');
}

export function getLocalPresenceRecord(): ConnectLnPresenceRecord {
  if (typeof window === 'undefined') {
    return { status: 'available', updatedAtMs: 0 };
  }
  try {
    const raw = window.localStorage.getItem(PRESENCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ConnectLnPresenceRecord>;
      if (parsed && parsed.status && parsed.status in PRESENCE_META) {
        return {
          status: parsed.status,
          customMessage: parsed.customMessage || '',
          oooAutoDecline: Boolean(parsed.oooAutoDecline),
          oooMessage: parsed.oooMessage || '',
          updatedAtMs: Number(parsed.updatedAtMs) || Date.now(),
          previousStatus:
            parsed.previousStatus && parsed.previousStatus in PRESENCE_META
              ? parsed.previousStatus
              : undefined,
        };
      }
    }
  } catch {}
  return { status: 'available', updatedAtMs: Date.now() };
}

export function isLocalUserDnd(): boolean {
  const rec = getLocalPresenceRecord();
  return rec.status === 'dnd';
}

export function saveLocalPresenceRecord(rec: ConnectLnPresenceRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(rec));
    window.dispatchEvent(new CustomEvent(PRESENCE_CHANGE_EVENT, { detail: rec }));
  } catch {}
}

export async function setLocalPresenceStatus(
  patch: Partial<ConnectLnPresenceRecord>,
  userIdentity?: { name?: string; email?: string }
): Promise<ConnectLnPresenceRecord> {
  const current = getLocalPresenceRecord();
  const next: ConnectLnPresenceRecord = {
    ...current,
    ...patch,
    updatedAtMs: Date.now(),
  };
  saveLocalPresenceRecord(next);

  if (typeof window !== 'undefined' && (userIdentity?.name || userIdentity?.email)) {
    fetch('/api/connectin/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_presence',
        userName: userIdentity?.name || '',
        userEmail: userIdentity?.email || '',
        record: next,
      }),
    }).catch(() => {});
  }

  return next;
}

export function enterInCallPresence(userIdentity?: { name?: string; email?: string }): void {
  const current = getLocalPresenceRecord();
  if (current.status === 'in_call' || current.status === 'dnd') return;
  void setLocalPresenceStatus(
    {
      status: 'in_call',
      previousStatus: current.status,
    },
    userIdentity
  );
}

export function exitInCallPresence(userIdentity?: { name?: string; email?: string }): void {
  const current = getLocalPresenceRecord();
  if (current.status !== 'in_call') return;
  const restored: ConnectLnPresenceStatus =
    current.previousStatus && current.previousStatus !== 'in_call'
      ? current.previousStatus
      : 'available';
  void setLocalPresenceStatus(
    {
      status: restored,
      previousStatus: undefined,
    },
    userIdentity
  );
}

export function subscribePresenceChange(
  cb: (rec: ConnectLnPresenceRecord) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (ev: Event) => {
    const detail = (ev as CustomEvent<ConnectLnPresenceRecord>).detail;
    cb(detail || getLocalPresenceRecord());
  };
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === PRESENCE_STORAGE_KEY) {
      cb(getLocalPresenceRecord());
    }
  };
  window.addEventListener(PRESENCE_CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PRESENCE_CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
