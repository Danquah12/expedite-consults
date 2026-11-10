import { useEffect, useState } from "react";
import { Hand, Mic, MicOff, Pause, Play, Plus, RotateCcw, Video, VideoOff, LogOut } from "lucide-react";
import { Avatar } from "@/components/social/StudySocial";
import { GroupsLayout } from "@/components/social/Groups";
import { cn } from "@/lib/utils";

/* Visual mockup only: rooms, participants and the shared notes are sample data (no real calls). */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

type Room = { id: string; title: string; group: string; live: boolean; n: number; when?: string; tone: string };

const ROOMS: Room[] = [
  { id: "r1", title: "Live problem room: integration", group: "Calculus II Survivors", live: true, n: 14, tone: "from-violet-400 to-purple-700" },
  { id: "r2", title: "Silent focus (25/5)", group: "Med School MCAT Prep", live: true, n: 31, tone: "from-rose-400 to-red-700" },
  { id: "r3", title: "Security+ ports bootcamp", group: "CompTIA Security+ Sprint", live: true, n: 9, tone: "from-sky-400 to-indigo-700" },
  { id: "r4", title: "Orgo mechanisms Q&A", group: "Organic Chemistry Crew", live: false, n: 0, when: "Tonight 9:00 PM", tone: "from-emerald-400 to-teal-700" },
  { id: "r5", title: "Weekly mock exam review", group: "CompTIA Security+ Sprint", live: false, n: 0, when: "Sat 10:00 AM", tone: "from-sky-400 to-indigo-700" },
];

const PEOPLE = [
  { name: "Ama", initials: "AB", tone: "bg-amber-500" },
  { name: "Kofi", initials: "KM", tone: "bg-sky-600" },
  { name: "Lena", initials: "LP", tone: "bg-emerald-600" },
  { name: "Dev", initials: "DP", tone: "bg-fuchsia-600" },
  { name: "Zoe", initials: "ZR", tone: "bg-rose-500" },
];

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Inside a room: participant tiles, 25/5 Pomodoro, shared notes, mic/camera/hand controls. */
function RoomView({ room, onLeave }: { room: Room; onLeave: () => void }) {
  const [focus, setFocus] = useState(true);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [hand, setHand] = useState(false);
  const [notes, setNotes] = useState("Shared notes\n- ");

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((v) => v - 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (left > 0) return;
    const next = !focus;
    setFocus(next);
    setLeft(next ? 25 * 60 : 5 * 60);
  }, [left, focus]);

  const reset = () => {
    setRunning(false);
    setFocus(true);
    setLeft(25 * 60);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="overflow-hidden rounded-lg bg-[#18191a] p-3 shadow">
        <div className="mb-3 flex items-center justify-between text-white">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold">{room.title}</p>
            <p className="text-[13px] text-white/60">{room.group}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#e41e3f] px-2.5 py-1 text-[12px] font-bold">
            <span className="size-2 rounded-full bg-white" /> LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PEOPLE.map((p) => (
            <div key={p.name} className="relative grid aspect-video place-items-center rounded-lg bg-[#3a3b3c]">
              <Avatar initials={p.initials} tone={p.tone} size="size-14" />
              <span className="absolute bottom-1.5 left-2 text-[12px] font-semibold text-white">{p.name}</span>
            </div>
          ))}
          <div className="relative grid aspect-video place-items-center rounded-lg bg-[#3a3b3c] ring-2 ring-[#1877f2]">
            <Avatar initials="YOU" tone="bg-[#1c1e21]" size="size-14" />
            <span className="absolute bottom-1.5 left-2 text-[12px] font-semibold text-white">You{hand ? " ✋" : ""}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button onClick={() => setMic((v) => !v)} className={cn("grid size-12 place-items-center rounded-full", mic ? "bg-white text-[#050505]" : "bg-[#e41e3f] text-white")} title="Microphone">
            {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <button onClick={() => setCam((v) => !v)} className={cn("grid size-12 place-items-center rounded-full", cam ? "bg-white text-[#050505]" : "bg-[#e41e3f] text-white")} title="Camera">
            {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
          <button onClick={() => setHand((v) => !v)} className={cn("grid size-12 place-items-center rounded-full", hand ? "bg-[#f7b928] text-[#050505]" : "bg-[#3a3b3c] text-white")} title="Raise hand">
            <Hand className="size-5" />
          </button>
          <button onClick={onLeave} className="flex h-12 items-center gap-2 rounded-full bg-[#e41e3f] px-5 text-[15px] font-semibold text-white" title="Leave">
            <LogOut className="size-5" /> Leave
          </button>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className={cn(CARD, "p-4 text-center")}>
          <p className={cn("text-[13px] font-bold uppercase", focus ? "text-[#e41e3f]" : "text-[#31a24c]")}>{focus ? "Focus" : "Break"}</p>
          <p className="my-1 text-6xl font-bold tabular-nums text-[#050505]">{fmt(left)}</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setRunning((v) => !v)} className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />} {running ? "Pause" : "Start"}
            </button>
            <button onClick={reset} className={cn("grid size-10 place-items-center rounded-md", BTN_GREY)} title="Reset">
              <RotateCcw className="size-4" />
            </button>
          </div>
        </section>
        <section className={cn(CARD, "p-3")}>
          <p className="mb-2 text-[17px] font-bold text-[#050505]">Shared notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-48 w-full resize-none rounded-lg bg-[#f0f2f5] p-3 text-[15px] text-[#050505] outline-none"
          />
        </section>
      </aside>
    </div>
  );
}

/** /rooms: lobby of live and scheduled study rooms. Joining opens the in-room view. */
export function RoomsLobby() {
  const [joined, setJoined] = useState<Room | null>(null);
  const [filter, setFilter] = useState<"All" | "Live now" | "Scheduled">("All");
  const list = ROOMS.filter((r) => filter === "All" || (filter === "Live now" ? r.live : !r.live));
  return (
    <GroupsLayout wide current="rooms">
      {joined ? (
        <RoomView room={joined} onLeave={() => setJoined(null)} />
      ) : (
        <>
          <section className={cn(CARD, "p-4")}>
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-[#050505]">Study rooms</h1>
              <button className={cn("flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-semibold", BTN_BLUE)}>
                <Plus className="size-4" /> Create room
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {(["All", "Live now", "Scheduled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("rounded-full px-3 py-1.5 text-[15px] font-semibold", filter === f ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY)}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <article key={r.id} className={cn(CARD, "overflow-hidden")}>
                <div className={cn("relative grid h-32 place-items-center bg-gradient-to-br text-white", r.tone)}>
                  <Video className="size-10 opacity-90" />
                  {r.live ? (
                    <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-[#e41e3f] px-2 py-0.5 text-[11px] font-bold">
                      <span className="size-1.5 rounded-full bg-white" /> LIVE · {r.n}
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="text-[17px] font-semibold leading-tight text-[#050505]">{r.title}</p>
                  <p className="mt-0.5 text-[13px] text-[#65676b]">{r.live ? r.group : `${r.group} · ${r.when}`}</p>
                  <button
                    onClick={() => (r.live ? setJoined(r) : undefined)}
                    className={cn("mt-3 w-full rounded-md py-2 text-[15px] font-semibold", r.live ? BTN_BLUE : BTN_GREY)}
                  >
                    {r.live ? "Join room" : "Remind me"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </GroupsLayout>
  );
}
