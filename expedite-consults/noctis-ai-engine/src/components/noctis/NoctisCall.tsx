import { useEffect, useRef, useState } from "react";
import { Delete, Link2, Mic, MicOff, Phone, PhoneOff, UserPlus, Video, X } from "lucide-react";
import { StudyCall } from "@/components/learn/StudyCall";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { studyClearRing, studyInvite, studyJoined, studyOpenCall, studyRing, studyRings, studyRoom } from "@/lib/study-group-api";
import { voipReady, voipToken } from "@/lib/voip-api";

type Person = {
  userId: string;
  name: string;
  phone: string;
  live: boolean;
  groupId: string;
  groupTitle: string;
};

type Live = { groupId: string; title: string; video: boolean; name: string; userId: string };
type Ring = { id: number; groupId: string; from: string; title: string; interest: string };
type Line = { hangup: () => void; mute: (on: boolean) => void };
type Pstn = { number: string; line: Line };

const KEYS: [string, string][] = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];

function digitsOf(value: string) {
  return value.replace(/\D/g, "");
}

function pretty(value: string) {
  const raw = value.trim();
  if (raw.startsWith("+")) return raw;
  const d = digitsOf(raw);
  if (d.length < 4) return raw;
  if (d.length < 8) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length < 11) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `+${d}`;
}

function samePhone(a: string, b: string) {
  const left = digitsOf(a);
  const right = digitsOf(b);
  if (left.length < 7 || right.length < 7) return false;
  return left.endsWith(right.slice(-10)) || right.endsWith(left.slice(-10));
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function NoctisCall({ onClose, onVibe, startVideo = false, join = "", onRecorded }: { onClose: () => void; onVibe: () => void; startVideo?: boolean; join?: string; onRecorded?: (url: string) => void }) {
  const { user } = useCurrentUserState();
  const [people, setPeople] = useState<Person[]>([]);
  const [number, setNumber] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [video, setVideo] = useState(startVideo);
  const [live, setLive] = useState<Live | null>(null);
  const [ring, setRing] = useState<Ring | null>(null);
  const [pstn, setPstn] = useState<Pstn | null>(null);
  const [internet, setInternet] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [adding, setAdding] = useState(false);
  const tone = useRef<AudioContext | null>(null);
  const deviceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let stop = false;
    void voipReady()
      .then((row) => {
        if (!stop) setInternet(Boolean(row?.ready));
      })
      .catch(() => undefined);
    return () => {
      stop = true;
      deviceRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!join || !user?.id) return;
    setLive({
      groupId: join,
      title: "Noctis meeting",
      video: true,
      name: "Noctis meeting",
      userId: "",
    });
    let stop = false;
    void studyRoom({ data: { groupId: join } })
      .then((room) => {
        if (stop) return;
        const other = room.people.find((person) => person.userId !== user?.id);
        setLive({
          groupId: join,
          title: "Noctis meeting",
          video: true,
          name: other?.name || "Noctis meeting",
          userId: other?.userId ?? "",
        });
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [join, user?.id]);

  useEffect(() => {
    let stop = false;
    void studyJoined()
      .then(async (groups) => {
        const rooms = await Promise.all(
          groups.slice(0, 12).map(async (group) => {
            try {
              const room = await studyRoom({ data: { groupId: group.id } });
              return room.people.map((person) => ({
                userId: person.userId,
                name: person.name,
                phone: person.phone,
                live: person.live,
                groupId: group.id,
                groupTitle: group.title,
              }));
            } catch {
              return [];
            }
          }),
        );
        if (stop) return;
        const seen = new Set<string>();
        const next: Person[] = [];
        for (const row of rooms.flat()) {
          if (seen.has(row.userId)) continue;
          seen.add(row.userId);
          next.push(row);
        }
        setPeople(next);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    if (live) return;
    let stop = false;
    async function look() {
      try {
        const rows = await studyRings();
        if (!stop) setRing(rows[0] ?? null);
      } catch {
        if (!stop) setRing(null);
      }
    }
    void look();
    const timer = window.setInterval(() => void look(), 3000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [live]);

  useEffect(() => {
    if (!ring) {
      tone.current?.close().catch(() => undefined);
      tone.current = null;
      return;
    }
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    tone.current = ctx;
    let on = false;
    const pulse = () => {
      if (ctx.state === "closed") return;
      on = !on;
      if (!on) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 440;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    };
    pulse();
    const timer = window.setInterval(pulse, 1400);
    return () => {
      window.clearInterval(timer);
      void ctx.close().catch(() => undefined);
      if (tone.current === ctx) tone.current = null;
    };
  }, [ring]);

  useEffect(() => {
    if (!live) return;
    setSeconds(0);
    setConnected(false);
    const tick = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    let stop = false;
    const watch = window.setInterval(() => {
      void studyRoom({ data: { groupId: live.groupId } })
        .then((room) => {
          if (stop) return;
          const them = room.people.find((person) => person.userId === live.userId);
          if (them?.live) setConnected(true);
        })
        .catch(() => undefined);
    }, 2000);
    return () => {
      stop = true;
      window.clearInterval(tick);
      window.clearInterval(watch);
    };
  }, [live]);

  useEffect(() => {
    if (!pstn) return;
    setSeconds(0);
    const tick = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(tick);
  }, [pstn]);

  useEffect(() => {
    pstn?.line.mute(muted);
  }, [muted, pstn]);

  function press(key: string) {
    setNote(null);
    setNumber((now) => (now + key).slice(0, 18));
  }

  async function startRoom(title = "Video call") {
    setNote(null);
    try {
      const room = await studyOpenCall({ data: { title: title.slice(0, 60) } });
      setMuted(false);
      setVideo(true);
      setLive({ groupId: room.id, title: room.title, video: true, name: title, userId: "" });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not start the call");
    }
  }

  async function start(person: Person, withVideo: boolean) {
    setNote(null);
    if (withVideo) {
      try {
        const room = await studyOpenCall({ data: { title: person.name } });
        await studyInvite({ data: { groupId: room.id, to: person.userId } });
        setMuted(false);
        setLive({ groupId: room.id, title: room.title, video: true, name: person.name, userId: person.userId });
      } catch (caught) {
        setNote(caught instanceof Error ? caught.message : "Could not start the video call");
      }
      return;
    }
    try {
      await studyRing({ data: { groupId: person.groupId, to: person.userId } });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not ring them");
      return;
    }
    setMuted(false);
    setLive({ groupId: person.groupId, title: person.groupTitle, video: false, name: person.name, userId: person.userId });
  }

  function place() {
    const match = people.find((person) => samePhone(number, person.phone));
    if (match) {
      void start(match, true);
      return;
    }
    const raw = digitsOf(number);
    if (raw === "911" || raw === "112" || raw === "999" || raw === "000") {
      window.location.href = `tel:${raw}`;
      return;
    }
    if (raw.length >= 7 && internet) {
      const e164 = raw.length === 10 ? `+1${raw}` : `+${raw}`;
      void placeVoip(e164);
      return;
    }
    void startRoom(raw ? pretty(number) : "Video call");
  }

  async function placeVoip(to: string) {
    setNote(null);
    setMuted(false);
    setConnected(false);
    setSeconds(0);
    try {
      const { Device } = await import("@twilio/voice-sdk");
      const minted = await voipToken();
      deviceRef.current?.destroy();
      const device = new Device(minted.token, { closeProtection: true });
      deviceRef.current = device;
      const call = await device.connect({ params: { To: to } });
      call.on("accept", () => setConnected(true));
      call.on("disconnect", () => setPstn(null));
      call.on("cancel", () => setPstn(null));
      call.on("error", (err: { message?: string }) => {
        setPstn(null);
        setNote(err?.message || "The call did not connect.");
      });
      setPstn({
        number: to,
        line: {
          hangup: () => call.disconnect(),
          mute: (on) => call.mute(on),
        },
      });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "The call did not connect.");
    }
  }

  function answer() {
    if (!ring || !user) return;
    const next = ring;
    setRing(null);
    void studyClearRing({ data: { id: next.id } });
    const person = people.find((row) => row.groupId === next.groupId);
    setLive({
      groupId: next.groupId,
      title: next.title,
      video,
      name: next.from,
      userId: person?.userId ?? "",
    });
  }

  function decline() {
    if (!ring) return;
    void studyClearRing({ data: { id: ring.id } });
    setRing(null);
  }

  const matched = people.find((person) => samePhone(number, person.phone));
  const shown = matched?.name || (number ? pretty(number) : "");

  if (ring && !live) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center bg-[#0c0c0c] px-6 py-8 text-zinc-100">
        <p className="text-sm text-zinc-400">Incoming call</p>
        <p className="mt-3 text-center text-3xl font-semibold tracking-tight">{ring.from}</p>
        <p className="mt-1 text-sm text-zinc-500">{ring.title}</p>
        <div className="mt-auto flex w-full max-w-xs items-end justify-between pb-6">
          <button type="button" onClick={decline} className="grid gap-2 justify-items-center text-xs text-zinc-300">
            <span className="grid size-16 place-items-center rounded-full bg-[#ff3b30] text-white">
              <PhoneOff className="size-7" />
            </span>
            Decline
          </button>
          <button type="button" onClick={answer} className="grid gap-2 justify-items-center text-xs text-zinc-300">
            <span className="grid size-16 place-items-center rounded-full bg-[#34c759] text-white">
              <Phone className="size-7" />
            </span>
            Accept
          </button>
        </div>
      </div>
    );
  }

  if (pstn) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center bg-[#0c0c0c] px-6 py-8 text-zinc-100">
        <p className="text-sm text-zinc-400">{connected ? clock(seconds) : "Calling…"}</p>
        <p className="mt-3 max-w-full truncate text-center text-3xl font-semibold tracking-tight">{pretty(pstn.number)}</p>
        <p className="mt-1 text-sm text-zinc-500">Internet call</p>
        <div className="mt-auto flex w-full max-w-xs items-end justify-between pb-6">
          <button type="button" onClick={() => setMuted((on) => !on)} className="grid gap-2 justify-items-center text-xs text-zinc-300">
            <span className="grid size-14 place-items-center rounded-full bg-white/10">
              {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </span>
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            aria-label="End call"
            onClick={() => {
              pstn.line.hangup();
              setPstn(null);
            }}
            className="grid size-16 place-items-center rounded-full bg-[#ff3b30] text-white"
          >
            <PhoneOff className="size-7" />
          </button>
          <span className="w-14" />
        </div>
      </div>
    );
  }

  if (live && user && live.video) {
    return (
      <div className="relative h-full min-h-0 bg-black">
        <StudyCall
          console
          groupId={live.groupId}
          title={live.name}
          selfId={user.id}
          video
          muted={muted}
          onAdd={() => setAdding(true)}
          onShare={() => shareCallLink(live.groupId)}
          onRecorded={onRecorded}
          onClose={() => {
            setLive(null);
            onClose();
          }}
        />
        {adding ? (
          <InviteSheet
            groupId={live.groupId}
            people={people.filter((person) => person.userId !== user.id)}
            onClose={() => setAdding(false)}
          />
        ) : null}
      </div>
    );
  }

  if (live && user) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#0c0c0c] text-zinc-100">
        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <p className="text-sm text-zinc-400">{connected ? clock(seconds) : "Calling…"}</p>
          <button type="button" onClick={() => setLive(null)} aria-label="Close" className="grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
        <p className="shrink-0 text-center text-3xl font-semibold tracking-tight">{live.name}</p>
        <p className="mt-1 shrink-0 text-center text-sm text-zinc-500">{live.video ? "Video" : "Voice"}</p>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3">
          <StudyCall
            groupId={live.groupId}
            title={live.title}
            selfId={user.id}
            video={live.video}
            muted={muted}
            onClose={() => setLive(null)}
          />
        </div>
        <div className="flex shrink-0 items-end justify-center gap-8 px-6 py-6">
          <button
            type="button"
            onClick={() => setMuted((on) => !on)}
            className="grid gap-2 justify-items-center text-xs text-zinc-300"
          >
            <span className="grid size-14 place-items-center rounded-full bg-white/10">
              {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </span>
            {muted ? "Unmute" : "Mute"}
          </button>
          <button type="button" onClick={() => setLive(null)} aria-label="End call" className="grid size-16 place-items-center rounded-full bg-[#ff3b30] text-white">
            <PhoneOff className="size-7" />
          </button>
          <button
            type="button"
            onClick={() => setLive((now) => (now ? { ...now, video: !now.video } : now))}
            className="grid gap-2 justify-items-center text-xs text-zinc-300"
          >
            <span className={`grid size-14 place-items-center rounded-full ${live.video ? "bg-white text-black" : "bg-white/10"}`}>
              <Video className="size-5" />
            </span>
            Video
          </button>
        </div>
      </div>
    );
  }

  if (join && !live) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-[#0c0c0c] px-6 text-zinc-100">
        <p className="text-sm text-zinc-400">{user ? "Opening the meeting" : "Sign in, then open the link again."}</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden text-zinc-100"
      style={{ background: "radial-gradient(120% 70% at 50% 18%, #4a3420 0%, #1a140f 46%, #0c0c0c 100%)" }}
    >
      <img src="/media/meet-loft.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/70" />
      <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <button type="button" onClick={onVibe} className="text-sm text-zinc-500 hover:text-zinc-200">
          Vibe
        </button>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <div className="flex min-h-[4.5rem] shrink-0 flex-col items-center justify-end px-6">
        <p className="max-w-full truncate text-center text-4xl font-light tracking-wide">{shown || " "}</p>
        {matched ? <p className="mt-1 text-xs text-zinc-500">In the app · {matched.groupTitle}</p> : null}
        {note ? <p className="mt-1 text-center text-xs text-[#e4b86a]">{note}</p> : null}
        <p className="mt-1 text-center text-[11px] text-zinc-500">Stays in Vibe. Nothing opens outside the app.</p>
      </div>
      {people.length ? (
        <div className="mt-3 flex shrink-0 gap-3 overflow-x-auto px-4 pb-1">
          {people.map((person) => (
            <button
              key={person.userId}
              type="button"
              onClick={() => void start(person, video)}
              className="flex w-16 shrink-0 flex-col items-center gap-1"
            >
              <span className="grid size-12 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                {person.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="w-full truncate text-center text-[11px] text-zinc-400">{person.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      ) : null}
      {video ? (
        <button
          type="button"
          onClick={() => void startRoom()}
          className="mx-auto mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-zinc-100"
        >
          <Link2 className="size-4" />
          Start a call and send a link
        </button>
      ) : null}
      <div className="mx-auto mt-auto grid w-full max-w-xs shrink-0 grid-cols-3 gap-x-6 gap-y-3 px-4 pt-4">
        {KEYS.map(([key, letters]) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className="flex h-[4.25rem] flex-col items-center justify-center rounded-full bg-black/45 backdrop-blur-sm active:bg-black/60"
          >
            <span className="text-2xl leading-none">{key}</span>
            <span className="mt-0.5 h-3 text-[9px] tracking-[0.18em] text-zinc-400">{letters}</span>
          </button>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-xs shrink-0 grid-cols-3 items-center gap-x-6 px-4 py-5">
        <button
          type="button"
          onClick={() => setVideo((on) => !on)}
          aria-label={video ? "Voice call" : "Video call"}
          className={`grid size-14 place-items-center justify-self-center rounded-full ${video ? "bg-white text-black" : "bg-white/10 text-zinc-100"}`}
        >
          <Video className="size-5" />
        </button>
        <button type="button" onClick={place} aria-label="Call" className="grid size-16 place-items-center justify-self-center rounded-full bg-[#34c759] text-white">
          <Phone className="size-7" />
        </button>
        <button
          type="button"
          onClick={() => setNumber((now) => now.slice(0, -1))}
          aria-label="Delete"
          className="grid size-14 place-items-center justify-self-center text-zinc-200 disabled:opacity-0"
          disabled={!number}
        >
          <Delete className="size-6" />
        </button>
      </div>
      </div>
    </div>
  );
}

function InviteSheet({ groupId, people, onClose }: { groupId: string; people: Person[]; onClose: () => void }) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#0c0c0c] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium">Add people</p>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          void shareCallLink(groupId).then((result) => {
            if (result === "copied") setNote("Link copied. Send it to anyone with Noctis.");
            if (result === "failed") setNote(callLink(groupId));
          });
        }}
        className="mx-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 text-left text-sm"
      >
        <span className="min-w-0">
          <span className="block font-medium">Send join link</span>
          <span className="block truncate text-xs text-white/50">{callLink(groupId)}</span>
        </span>
        <Link2 className="size-4 shrink-0" />
      </button>
      {note ? <p className="px-4 pt-3 text-sm text-[#e4b86a]">{note}</p> : null}
      <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-6">
        {people.length === 0 ? <p className="px-2 text-sm text-white/50">No one else is in your groups yet. Share the link.</p> : null}
        {people.map((person) => (
          <button
            key={person.userId}
            type="button"
            onClick={() => {
              void studyInvite({ data: { groupId, to: person.userId } })
                .then(() => setNote(`Calling ${person.name}`))
                .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not add them"));
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left hover:bg-white/5"
          >
            <span className="grid size-10 place-items-center rounded-full bg-white/10 text-sm font-semibold">{person.name.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1 truncate">{person.name}</span>
            <span className="text-xs text-white/50">Add</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function callLink(groupId: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?join=${groupId}`;
}

async function shareCallLink(groupId: string) {
  const link = callLink(groupId);
  try {
    await navigator.clipboard.writeText(link);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}
