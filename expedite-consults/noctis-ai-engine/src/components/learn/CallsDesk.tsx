import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, MessageCircle, Mic, Paperclip, Phone, Search, Star, Video } from "lucide-react";
import { createStudyGroup, dialHref, studyBlock, studyBrief, studyChat, studyEdit, studyHide, studyJoined, studyPin, studyReact, studyReport, studyRing, studyRoom, studySavePhone, studySend } from "@/lib/study-group-api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { StudyCall } from "@/components/learn/StudyCall";
import { COMMUNITY_ROOMS, knowledgeGraph } from "@/lib/knowledge-graph";
import { readIdentity } from "@/lib/identity";
import { openNoctis } from "@/lib/ask-noctis";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

type Group = { id: string; interest: string; title: string; members?: number; last?: string; live?: number };
type Person = { userId: string; name: string; phone: string; live: boolean };
type Note = {
  id: number;
  mine: boolean;
  name: string;
  body: string;
  time?: string;
  replyName?: string;
  replyBody?: string;
  reactions?: { emoji: string; n: number }[];
  userId?: string;
  media?: string;
  mediaName?: string;
  mediaKind?: string;
  edited?: boolean;
  removed?: boolean;
  pinned?: boolean;
};
type Chip = "all" | "unread" | "favorites" | "archived";
type Marks = { fav: string[]; arch: string[]; seen: Record<string, string> };

function readMarks(): Marks {
  try {
    const raw = localStorage.getItem("vibetok-chat-marks");
    const parsed = raw ? (JSON.parse(raw) as Marks) : null;
    if (parsed?.fav && parsed.arch && parsed.seen) return parsed;
  } catch {
    /* a bad save starts empty */
  }
  return { fav: [], arch: [], seen: {} };
}

type Brief = { summary: string; decisions: string[]; open: string[]; next: string[] };

/** WhatsApp-style desk. Chats and calls live on the Chat button, not as extra tabs. */
export function CallsDesk() {
  const [lane, setLane] = useState<"chats" | "calls">("chats");
  const [groups, setGroups] = useState<Group[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(false);
  const [reply, setReply] = useState<Note | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [room, setRoom] = useState<(typeof COMMUNITY_ROOMS)[number]["id"]>("general");
  const [mapOn, setMapOn] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [chip, setChip] = useState<Chip>("all");
  const [more, setMore] = useState(false);
  const [marks, setMarks] = useState<Marks>({ fav: [], arch: [], seen: {} });
  const [when, setWhen] = useState("");
  const [plans, setPlans] = useState<{ title: string; at: string }[]>([]);
  const [log, setLog] = useState<{ title: string; at: string; kind: string }[]>([]);
  const [chatName, setChatName] = useState("");
  const [making, setMaking] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [findOn, setFindOn] = useState(false);
  const [find, setFind] = useState("");
  const [clip, setClip] = useState(false);
  const [hearing, setHearing] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tape = useRef<MediaRecorder | null>(null);
  const open = groups.find((group) => group.id === openId) ?? null;
  const { user } = useCurrentUserState();
  const films = useFeedStore((s) => s.posts);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const shown = groups.filter((group) => {
    const q = query.trim().toLowerCase();
    const matches = !q || group.title.toLowerCase().includes(q) || (group.last ?? "").toLowerCase().includes(q);
    if (!matches) return false;
    const archived = marks.arch.includes(group.id);
    if (chip === "archived") return archived;
    if (archived) return false;
    if (chip === "favorites") return marks.fav.includes(group.id);
    if (chip === "unread") return Boolean(group.last) && marks.seen[group.id] !== group.last;
    return true;
  });

  useEffect(() => {
    return () => {
      if (tape.current && tape.current.state === "recording") tape.current.stop();
    };
  }, []);

  useEffect(() => {
    setMarks(readMarks());
    try {
      const savedPlans = localStorage.getItem("vibetok-call-plans");
      const savedLog = localStorage.getItem("vibetok-call-log");
      if (savedPlans) setPlans(JSON.parse(savedPlans) as { title: string; at: string }[]);
      if (savedLog) setLog(JSON.parse(savedLog) as { title: string; at: string; kind: string }[]);
    } catch {
      /* the lists stay empty */
    }
  }, []);

  function keepMarks(next: Marks) {
    setMarks(next);
    localStorage.setItem("vibetok-chat-marks", JSON.stringify(next));
  }

  function rememberCall(title: string, kind: string) {
    const next = [{ title, at: new Date().toLocaleString(), kind }, ...log].slice(0, 12);
    setLog(next);
    localStorage.setItem("vibetok-call-log", JSON.stringify(next));
  }

  useEffect(() => {
    let stop = false;
    void studyJoined()
      .then((rows) => {
        if (!stop) setGroups(rows);
      })
      .catch(() => {
        if (!stop) setGroups([]);
      })
      .finally(() => {
        if (!stop) setReady(true);
      });
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    const topic = sessionStorage.getItem("vibetok-discuss");
    if (!topic) return;
    sessionStorage.removeItem("vibetok-discuss");
    setDraft(topic);
    setLane("chats");
    setNote("Pick the community, then send this so the group can discuss the video.");
  }, []);

  useEffect(() => {
    if (!openId) return;
    let stop = false;
    setNotes([]);
    setReply(null);
    setBrief(null);
    async function pull() {
      try {
        const rows = await studyChat({ data: { groupId: openId!, after: 0, channel: room } });
        if (!stop) setNotes(rows);
      } catch {
        /* the next poll retries */
      }
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 2000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [openId, room]);

  async function pick(group: Group, next: "chats" | "calls") {
    setLane(next);
    setOpenId(group.id);
    setVideo(false);
    setRoom("general");
    setMapOn(false);
    setNote(null);
    setMore(false);
    keepMarks({ ...marks, seen: { ...marks.seen, [group.id]: group.last ?? "open" } });
    try {
      const room = await studyRoom({ data: { groupId: group.id } });
      setPeople(room.people);
      setPhone(room.phone);
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not open this group");
    }
  }

  async function startChat(event: FormEvent) {
    event.preventDefault();
    const title = chatName.trim();
    if (title.length < 3) return;
    setMaking(true);
    setNote(null);
    try {
      const created = await createStudyGroup({ data: { interest: "practice", title } });
      setChatName("");
      const rows = await studyJoined();
      setGroups(rows);
      const made = rows.find((group) => group.id === created.id) ?? rows[0];
      if (made) await pick(made, "chats");
      setNote("Chat is open. Press Invite and send the link. Your friend must be signed in.");
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not start the chat");
    } finally {
      setMaking(false);
    }
  }

  async function invite() {
    if (!open) return;
    const url = `${window.location.origin}/study?desk=${open.interest}&group=${open.id}`;
    const text = `Join my chat “${open.title}” on Noctis.`;
    try {
      if (navigator.share) await navigator.share({ title: open.title, text, url });
      else await navigator.clipboard.writeText(url);
      setNote("Invite ready. Your friend signs in, then opens the link.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setNote("Invite link copied. Your friend signs in, then opens the link.");
      } catch {
        setNote(url);
      }
    }
  }

  async function post(event: FormEvent) {
    event.preventDefault();
    if (!openId) return;
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const quoted = reply;
    setReply(null);
    try {
      if (editing) {
        await studyEdit({ data: { groupId: openId, chatId: editing.id, body } });
        setEditing(null);
        return;
      }
      await studySend({
        data: { groupId: openId, body, replyName: quoted?.name ?? "", replyBody: quoted?.body ?? "", channel: room },
      });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not send");
    }
  }

  async function sendMedia(kind: "image" | "voice" | "file", media: string, mediaName: string) {
    if (!openId) return;
    const body = draft.trim();
    setDraft("");
    const quoted = reply;
    setReply(null);
    try {
      await studySend({
        data: { groupId: openId, body, media, mediaName, mediaKind: kind, replyName: quoted?.name ?? "", replyBody: quoted?.body ?? "", channel: room },
      });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not send");
    }
  }

  async function shrinkImage(file: File) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("That photo could not be read"));
        img.src = url;
      });
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function onPhoto(file: File | undefined) {
    setClip(false);
    if (!file) return;
    try {
      const media = await shrinkImage(file);
      if (media.length > 700_000) {
        setNote("That photo is still too large.");
        return;
      }
      await sendMedia("image", media, file.name);
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not send the photo");
    }
  }

  async function onFile(file: File | undefined) {
    setClip(false);
    if (!file) return;
    if (file.size > 350_000 || !/pdf|text\/plain/i.test(file.type)) {
      setNote("Send a PDF or text file under 350 KB.");
      return;
    }
    const media = await file.arrayBuffer().then((buf) => {
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (const byte of bytes) bin += String.fromCharCode(byte);
      return `data:${file.type || "text/plain"};base64,${btoa(bin)}`;
    });
    await sendMedia("file", media, file.name);
  }

  async function hear() {
    if (tape.current && tape.current.state === "recording") {
      tape.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const parts: Blob[] = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) parts.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setHearing(false);
        const blob = new Blob(parts, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 400_000) {
          setNote("Keep the voice note shorter.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const media = String(reader.result || "");
          if (media.startsWith("data:audio/")) void sendMedia("voice", media, "Voice note");
        };
        reader.readAsDataURL(blob);
      };
      tape.current = rec;
      rec.start();
      setHearing(true);
    } catch {
      setNote("Allow the microphone to send a voice note.");
    }
  }

  function askMessage(row: Note) {
    setMenuId(null);
    if (row.mediaKind === "image" && row.media) {
      openNoctis(`Explain this picture from the chat “${open?.title ?? "Chat"}”. ${row.body}`, row.media);
      return;
    }
    const words = row.removed ? "" : row.body;
    if (!words) return;
    openNoctis(`In the chat “${open?.title ?? "Chat"}”, ${row.name} said: ${words}\n\nExplain this. If it is a file or a voice note, say only what the words support.`);
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-border md:grid md:min-h-[32rem] md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className={cn("border-white/10 p-4 md:border-r", open ? "hidden md:block" : "block")}>
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-primary" />
        <h1 className="text-lg font-semibold">Chat</h1>
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(event) => void startChat(event)}>
        <input
          value={chatName}
          onChange={(event) => setChatName(event.target.value)}
          placeholder="New chat name"
          maxLength={80}
          className="min-h-11 min-w-0 flex-1 rounded-full bg-elevated px-4 text-sm"
        />
        <button type="submit" disabled={making || chatName.trim().length < 3} className="min-h-11 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg disabled:opacity-50">
          New
        </button>
      </form>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search chats"
        className="mt-3 min-h-11 w-full rounded-full bg-elevated px-4 text-sm"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setLane("chats")}
          className={cn("min-h-11 flex-1 rounded-full text-xs font-semibold", lane === "chats" ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
        >
          Chats
        </button>
        <button
          type="button"
          onClick={() => setLane("calls")}
          className={cn("min-h-11 flex-1 rounded-full text-xs font-semibold", lane === "calls" ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
        >
          Calls
        </button>
      </div>
      <div className="relative mt-2 flex gap-1.5">
        {(
          [
            ["all", "All"],
            ["unread", "Unread"],
            ["favorites", "Favorites"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setChip(id);
              setMore(false);
            }}
            className={cn("min-h-8 rounded-full px-3 text-[11px] font-semibold", chip === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
          >
            {label}
          </button>
        ))}
        <button type="button" aria-label="More filters" onClick={() => setMore((on) => !on)} className={cn("grid size-8 place-items-center rounded-full", chip === "archived" ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>
          <ChevronDown className="size-4" />
        </button>
        {more ? (
          <button
            type="button"
            onClick={() => {
              setChip("archived");
              setMore(false);
            }}
            className="absolute top-9 right-0 z-10 rounded-xl bg-elevated px-3 py-2 text-xs font-semibold shadow-float"
          >
            Archived
          </button>
        ) : null}
      </div>
      {!ready ? <p className="mt-4 text-sm text-muted">Loading…</p> : null}
      {ready && groups.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No chats yet. Name one above, press New, then Invite. Your friend must be signed in to join.
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {shown.map((group) => (
          <li key={group.id}>
            <button
              type="button"
              onClick={() => void pick(group, lane)}
              className={cn("flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left", openId === group.id ? "bg-primary/15" : "bg-elevated")}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold">
                {group.title.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{group.title}</span>
                <span className="block truncate text-xs text-muted">{group.last ?? "No messages yet"}</span>
              </span>
              {group.live ? <span className="shrink-0 rounded-full bg-[#b42318] px-2 py-0.5 text-[10px] font-bold text-white">LIVE {group.live}</span> : null}
              {group.last && marks.seen[group.id] !== group.last && !marks.arch.includes(group.id) ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-fg">1</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {ready && groups.length > 0 && shown.length === 0 ? <p className="mt-4 text-sm text-muted">Nothing in {chip === "all" ? "Chats" : chip}.</p> : null}
      </aside>
      <div className={cn("min-w-0 p-4", open ? "block" : "hidden md:block")}>
      {open ? (
        <button type="button" onClick={() => setOpenId(null)} className="mb-3 text-xs font-semibold text-primary md:hidden">
          Back
        </button>
      ) : (
        <div className="grid h-full min-h-64 place-items-center text-center">
          <div>
            <MessageCircle className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-lg font-semibold">{lane === "calls" ? "Voice and video" : "Pick a chat"}</p>
            <p className="mt-1 max-w-xs text-sm text-muted">{lane === "calls" ? "Choose a group, then start the call." : "Choose a conversation on the left."}</p>
          </div>
        </div>
      )}
      {open && lane === "chats" ? (
        <div className="mt-3 rounded-xl bg-elevated p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold">{open.title}</p>
            <button
              type="button"
              aria-label={marks.fav.includes(open.id) ? "Remove favorite" : "Add favorite"}
              onClick={() => {
                const fav = marks.fav.includes(open.id) ? marks.fav.filter((id) => id !== open.id) : [open.id, ...marks.fav];
                keepMarks({ ...marks, fav });
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-surface"
            >
              <Star className={cn("size-4", marks.fav.includes(open.id) ? "fill-primary text-primary" : "text-muted")} />
            </button>
            <button
              type="button"
              onClick={() => {
                const arch = marks.arch.includes(open.id) ? marks.arch.filter((id) => id !== open.id) : [open.id, ...marks.arch];
                keepMarks({ ...marks, arch });
                setOpenId(null);
                setNote(marks.arch.includes(open.id) ? "Returned to Chats." : "Archived.");
              }}
              className="min-h-11 shrink-0 rounded-full bg-surface px-3 text-xs font-semibold"
            >
              {marks.arch.includes(open.id) ? "Unarchive" : "Archive"}
            </button>
            <button type="button" aria-label="Search this chat" onClick={() => setFindOn((on) => !on)} className="grid size-11 shrink-0 place-items-center rounded-full bg-surface">
              <Search className="size-4" />
            </button>
            <button type="button" onClick={() => void invite()} className="min-h-11 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
              Invite
            </button>
            <button
              type="button"
              onClick={() => {
                setVideo(true);
                rememberCall(open.title, "Video");
              }}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
            >
              <Video className="size-3.5" />
              Video
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            {open.members ?? people.length + 1} people · {people.map((person) => person.name).join(", ") || "Waiting for others to join"}
          </p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {COMMUNITY_ROOMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoom(item.id)}
                className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold", room === item.id ? "bg-primary text-primary-fg" : "bg-surface text-muted")}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMapOn((on) => !on)}
              className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold", mapOn ? "bg-primary text-primary-fg" : "bg-surface text-muted")}
            >
              Map
            </button>
          </div>
          {mapOn ? <CommunityMap title={open.title} people={people.map((person) => person.name)} notes={notes.map((row) => row.body)} films={films.map((post) => ({ id: post.id, title: post.teach?.hook || post.caption }))} onOpen={(id) => setPlayingId(id)} /> : null}
          {video && user ? (
            <div className="mt-2">
              <StudyCall groupId={open.id} title={open.title} selfId={user.id} onClose={() => setVideo(false)} />
            </div>
          ) : null}
          {findOn ? (
            <input value={find} onChange={(event) => setFind(event.target.value)} placeholder="Search this chat" className="mt-2 min-h-10 w-full rounded-full bg-surface px-4 text-sm" />
          ) : null}
          {notes.some((row) => row.pinned) ? (
            <p className="mt-2 truncate rounded-xl bg-surface px-3 py-2 text-xs">Pinned · {notes.find((row) => row.pinned)?.body}</p>
          ) : null}
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {notes.length === 0 ? <p className="text-xs text-muted">No messages yet. Write the first one.</p> : null}
            {notes.filter((row) => {
              const q = find.trim().toLowerCase();
              if (!findOn || !q) return true;
              return row.body.toLowerCase().includes(q) || (row.mediaName ?? "").toLowerCase().includes(q);
            }).map((row) => (
              <div key={row.id} id={`msg-${row.id}`} className={cn("relative max-w-[85%] rounded-2xl px-3 py-2 text-sm", row.mine ? "ml-auto bg-primary text-primary-fg" : "bg-surface")}>
                {row.mine ? null : <span className="block text-[11px] font-semibold opacity-70">{row.name}</span>}
                {row.replyBody ? (
                  <span className="mb-1 block rounded-lg bg-black/10 px-2 py-1 text-[11px] opacity-80">
                    {row.replyName}: {row.replyBody}
                  </span>
                ) : null}
                {row.mediaKind === "image" && row.media ? <img src={row.media} alt={row.mediaName || "Photo"} className="mb-1 max-h-40 rounded-lg" /> : null}
                {row.mediaKind === "voice" && row.media ? <audio controls src={row.media} className="mb-1 h-8 max-w-full" /> : null}
                {row.mediaKind === "file" && row.media ? (
                  <a href={row.media} download={row.mediaName || "file"} className="mb-1 block text-xs font-semibold underline">
                    {row.mediaName || "File"}
                  </a>
                ) : null}
                {row.body}
                <span className="mt-1 flex flex-wrap items-center gap-1">
                  {row.time ? <span className="text-[10px] opacity-70">{row.time}{row.edited ? " · edited" : ""}</span> : null}
                  {(row.reactions ?? []).map((mark) => (
                    <span key={mark.emoji} className="rounded-full bg-black/10 px-1.5 text-[10px]">
                      {mark.emoji} {mark.n}
                    </span>
                  ))}
                  <button type="button" className="text-[10px] font-semibold opacity-80" onClick={() => setReply(row)}>
                    Reply
                  </button>
                  {["👍", "❤️", "🙏"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-[12px]"
                      onClick={() => void studyReact({ data: { groupId: open.id, chatId: row.id, emoji } }).catch(() => undefined)}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button type="button" className="text-[10px] font-semibold opacity-80" onClick={() => setMenuId(menuId === row.id ? null : row.id)}>
                    More
                  </button>
                </span>
                {menuId === row.id ? (
                  <span className="mt-1 flex flex-wrap gap-1">
                    <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => askMessage(row)}>Ask Noctis</button>
                    <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => void studyPin({ data: { groupId: open.id, chatId: row.id } }).then(() => setMenuId(null)).catch(() => setNote("Could not pin"))}>Pin</button>
                    {row.mine && !row.removed ? (
                      <>
                        <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => { setEditing(row); setDraft(row.body); setMenuId(null); }}>Edit</button>
                        <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => void studyHide({ data: { groupId: open.id, chatId: row.id } }).then(() => setMenuId(null)).catch(() => setNote("Could not remove"))}>Delete</button>
                      </>
                    ) : null}
                    {!row.mine && row.userId ? (
                      <>
                        <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => void studyBlock({ data: { groupId: open.id, aboutId: row.userId! } }).then(() => { setMenuId(null); setNote(`${row.name} is blocked.`); }).catch(() => setNote("Could not block"))}>Block</button>
                        <button type="button" className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold" onClick={() => void studyReport({ data: { groupId: open.id, aboutId: row.userId!, note: row.body.slice(0, 180) } }).then(() => { setMenuId(null); setNote("Reported."); }).catch(() => setNote("Could not report"))}>Report</button>
                      </>
                    ) : null}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          {brief ? (
            <div className="mt-2 rounded-xl bg-surface px-3 py-2 text-xs leading-relaxed">
              <p className="font-semibold">VibeAI</p>
              <p className="mt-1">{brief.summary}</p>
              {brief.decisions.length ? <p className="mt-1">Decisions: {brief.decisions.join(" · ")}</p> : null}
              {brief.open.length ? <p className="mt-1">Still open: {brief.open.join(" · ")}</p> : null}
              {brief.next.length ? <p className="mt-1">Next: {brief.next.join(" · ")}</p> : null}
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted">Generated from this conversation. Not a verified source.</p>
            </div>
          ) : null}
          {reply ? (
            <p className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
              <span className="min-w-0 truncate">Replying to {reply.name}: {reply.body}</span>
              <button type="button" className="shrink-0 font-semibold" onClick={() => setReply(null)}>
                Cancel
              </button>
            </p>
          ) : null}
          {editing ? (
            <p className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
              <span>Editing your message</span>
              <button type="button" className="shrink-0 font-semibold" onClick={() => { setEditing(null); setDraft(""); }}>Cancel</button>
            </p>
          ) : null}
          <form className="mt-2 flex gap-2" onSubmit={(event) => void post(event)}>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(event) => void onPhoto(event.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="application/pdf,text/plain" className="hidden" onChange={(event) => void onFile(event.target.files?.[0])} />
            <div className="relative">
              <button type="button" aria-label="Attach" onClick={() => setClip((on) => !on)} className="grid size-11 place-items-center rounded-full bg-surface">
                <Paperclip className="size-4" />
              </button>
              {clip ? (
                <span className="absolute bottom-12 left-0 z-10 grid w-28 gap-1 rounded-xl bg-surface p-1 shadow-float">
                  <button type="button" className="rounded-lg px-2 py-2 text-left text-xs font-semibold" onClick={() => photoRef.current?.click()}>Photo</button>
                  <button type="button" className="rounded-lg px-2 py-2 text-left text-xs font-semibold" onClick={() => fileRef.current?.click()}>File</button>
                </span>
              ) : null}
            </div>
            <button type="button" aria-label={hearing ? "Stop voice note" : "Voice note"} onClick={() => void hear()} className={cn("grid size-11 shrink-0 place-items-center rounded-full", hearing ? "bg-[#b42318] text-white" : "bg-surface")}>
              <Mic className="size-4" />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={hearing ? "Recording…" : editing ? "Edit message" : "Message"}
              maxLength={500}
              className="min-h-11 min-w-0 flex-1 rounded-full bg-surface px-4 text-sm"
            />
            <button type="submit" className="min-h-11 shrink-0 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
              {editing ? "Save" : "Send"}
            </button>
            <button
              type="button"
              className="min-h-11 shrink-0 rounded-full bg-surface px-3 text-xs font-semibold"
              onClick={() => {
                if (!readIdentity().ai.chat) {
                  setNote("VibeAI cannot read this chat. Turn on “This conversation” under You.");
                  return;
                }
                void studyBrief({ data: { groupId: open.id } })
                  .then((next) => setBrief(next))
                  .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not summarize"));
              }}
            >
              VibeAI
            </button>
          </form>
        </div>
      ) : null}
      {open && lane === "calls" ? (
        <div className="mt-3 space-y-2 rounded-xl bg-elevated p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setVideo(true);
                rememberCall(open.title, "Video");
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
            >
              <Video className="size-3.5" />
              Start call
            </button>
            <button
              type="button"
              onClick={() => {
                const link = `${window.location.origin}/?join=${open.id}`;
                void navigator.clipboard.writeText(link).then(() => setNote("Call link copied.")).catch(() => setNote(link));
              }}
              className="min-h-11 rounded-full bg-surface px-3 text-xs font-semibold"
            >
              Call link
            </button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!when) return;
              const next = [{ title: open.title, at: new Date(when).toLocaleString() }, ...plans].slice(0, 8);
              setPlans(next);
              localStorage.setItem("vibetok-call-plans", JSON.stringify(next));
              setWhen("");
              setNote("Call scheduled.");
            }}
          >
            <input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl bg-surface px-3 text-sm" />
            <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-surface px-3 text-xs font-semibold">
              Schedule
            </button>
          </form>
          {plans.filter((plan) => plan.title === open.title).map((plan) => (
            <p key={`${plan.title}-${plan.at}`} className="text-xs text-muted">Scheduled · {plan.at}</p>
          ))}
          {log.length ? (
            <div>
              <p className="text-xs font-semibold text-muted">Recent</p>
              {log.map((row) => (
                <p key={`${row.at}-${row.title}`} className="mt-1 text-xs text-muted">
                  {row.kind} · {row.title} · {row.at}
                </p>
              ))}
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold">{open.title}</p>
            <Phone className="size-4 text-muted" />
          </div>
          {video && user ? (
            <div className="mt-2">
              <StudyCall groupId={open.id} title={open.title} selfId={user.id} onClose={() => setVideo(false)} />
            </div>
          ) : null}
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void studySavePhone({ data: { groupId: open.id, phone } })
                .then(() => setNote("Your phone is saved."))
                .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not save the phone"));
            }}
          >
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone"
              className="min-h-11 min-w-0 flex-1 rounded-xl bg-surface px-3 text-sm"
            />
            <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-surface px-3 text-xs font-semibold">
              Save
            </button>
          </form>
          {people.length === 0 ? <p className="text-xs text-muted">No one else has joined, so a call has nowhere to go.</p> : null}
          {people.map((person) => (
            <div key={person.userId} className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                {person.name}
                {person.live ? <span className="text-xs text-muted"> · in the room</span> : null}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void studyRing({ data: { groupId: open.id, to: person.userId } })
                      .then(() => setNote(`Calling ${person.name}.`))
                      .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not call"))
                  }
                  className="min-h-11 rounded-full bg-surface px-3 text-xs font-semibold"
                >
                  Call in app
                </button>
                {person.phone && dialHref(person.phone) ? (
                  <a href={dialHref(person.phone)} className="grid min-h-11 place-items-center rounded-full bg-surface px-3 text-xs font-semibold">
                    Call phone
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {note ? <p className="mt-3 text-xs text-muted">{note}</p> : null}
      </div>
    </section>
  );
}

function CommunityMap({
  title,
  people,
  notes,
  films,
  onOpen,
}: {
  title: string;
  people: string[];
  notes: string[];
  films: { id: string; title: string }[];
  onOpen: (id: string) => void;
}) {
  const graph = knowledgeGraph({ title, people, notes, films });
  return (
    <div className="mt-2 rounded-xl bg-surface px-3 py-2 text-xs leading-relaxed">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-muted">People · {graph.people.join(", ") || "Just you so far"}</p>
      <p className="mt-1 text-muted">Topics · {graph.topics.join(" · ")}</p>
      {graph.videos.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {graph.videos.map((film) => (
            <button key={film.id} type="button" onClick={() => onOpen(film.id)} className="rounded-full bg-elevated px-2 py-1 font-semibold">
              {film.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-muted">Videos · none matched this conversation yet</p>
      )}
    </div>
  );
}