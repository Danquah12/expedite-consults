import { useEffect, useRef, useState } from "react";
import { STUDY_HOUSES, type StudyHouse } from "@/lib/study-desk";
import { createStudyGroup, dialHref, joinStudyGroup, leaveStudyGroup, listStudyGroups, studyRing, studyRoom, studySavePhone } from "@/lib/study-group-api";
import { StudyCall } from "@/components/learn/StudyCall";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

type Circle = {
  id: string;
  interest: string;
  title: string;
  members: number;
  mine: boolean;
  names: string[];
  live: number;
};

const SUBJECTS = STUDY_HOUSES.filter((house) => house.id !== "all");

export function StudyGroups({ house, invite }: { house: StudyHouse | "all"; invite?: string }) {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState(house === "all" ? "cyber" : house);
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Circle[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [call, setCall] = useState<Circle | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const joinedRef = useRef("");
  const { user } = useCurrentUserState();
  const [dial, setDial] = useState<string | null>(null);
  const [mates, setMates] = useState<{ userId: string; name: string; phone: string; live: boolean }[]>([]);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (house !== "all") setInterest(house);
  }, [house]);

  useEffect(() => {
    if (!open) return;
    let stop = false;
    setErr(null);
    void listStudyGroups({ data: { interest } })
      .then((list) => {
        if (!stop) setRows(list);
      })
      .catch((caught: unknown) => {
        if (!stop) setErr(caught instanceof Error ? caught.message : "Could not load groups");
      });
    return () => {
      stop = true;
    };
  }, [open, interest]);

  useEffect(() => {
    if (!invite || joinedRef.current === invite) return;
    joinedRef.current = invite;
    setOpen(true);
    void joinStudyGroup({ data: { id: invite } })
      .then(async () => {
        setRows(await listStudyGroups({ data: { interest } }));
        setNote("You're in this study group.");
      })
      .catch((caught: unknown) => {
        setErr(caught instanceof Error ? caught.message : "Could not join from that invite");
      });
  }, [invite, interest]);

  async function refresh() {
    setRows(await listStudyGroups({ data: { interest } }));
  }

  async function create() {
    setBusy(true);
    setErr(null);
    try {
      await createStudyGroup({ data: { interest, title } });
      setTitle("");
      await refresh();
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not create the group");
    } finally {
      setBusy(false);
    }
  }

  async function sendInvite(row: Circle) {
    const url = `${window.location.origin}/study?desk=${row.interest}&group=${row.id}`;
    const text = `Join my study group “${row.title}” on Noctis.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: row.title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(url);
      setNote("Invite link is ready. Send it to anyone you want in the group.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(url);
        setNote("Invite link copied.");
      } catch {
        setCopied(url);
        setErr("Copy this link and send it.");
      }
    }
  }

  async function openDial(row: Circle) {
    setBusy(true);
    setErr(null);
    try {
      if (!row.mine) await joinStudyGroup({ data: { id: row.id } });
      const room = await studyRoom({ data: { groupId: row.id } });
      setMates(room.people);
      setPhone(room.phone);
      setDial(row.id);
      if (!row.mine) await refresh();
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not open calls");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    setCall(null);
    setDial(null);
    setMates([]);
    setPhone("");
    setCopied(null);
    setNote(null);
    setOpen(false);
  }

  async function goLive(row: Circle) {
    setBusy(true);
    setErr(null);
    try {
      if (!row.mine) await joinStudyGroup({ data: { id: row.id } });
      await refresh();
      setCall({ ...row, mine: true });
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not open the room");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(row: Circle) {
    setBusy(true);
    setErr(null);
    try {
      if (row.mine) await leaveStudyGroup({ data: { id: row.id } });
      else await joinStudyGroup({ data: { id: row.id } });
      await refresh();
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not update the group");
    } finally {
      setBusy(false);
    }
  }

  const subject = SUBJECTS.find((item) => item.id === interest)?.label ?? "this subject";

  return (
    <div className="rounded-2xl bg-surface px-4 py-3 shadow-border">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Same subject. Member counts appear only after a group is loaded.</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 shrink-0 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          {open ? "Close" : "Study group"}
        </button>
      </div>
      {open && call && user ? (
        <StudyCall key="teams-clear" groupId={call.id} title={call.title} selfId={user.id} onClose={finish} />
      ) : null}
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {SUBJECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id !== "all") setInterest(item.id);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
                  interest === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Name a ${subject} group`}
              maxLength={80}
              className="min-h-11 min-w-0 flex-1 rounded-xl bg-elevated px-3 text-sm"
            />
            <button
              type="submit"
              disabled={busy || title.trim().length < 3}
              className="min-h-11 shrink-0 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-fg disabled:opacity-50"
            >
              Create
            </button>
          </form>
          {err ? <p className="text-xs text-live">{err}</p> : null}
          {note ? <p className="text-xs text-muted">{note}</p> : null}
          {copied ? (
            <p className="break-all rounded-xl bg-elevated px-3 py-2 text-xs text-fg">{copied}</p>
          ) : null}
          {rows.length === 0 ? (
            <p className="text-xs text-muted">No {subject} group yet. Create the first one.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row.id} className="rounded-xl bg-elevated px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{row.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {row.members} {row.members === 1 ? "person" : "people"}
                        {row.live ? ` · ${row.live} live` : ""} · {subject}
                      </p>
                      {row.names.length ? <p className="mt-1 text-xs text-fg">{row.names.join(" · ")}</p> : null}
                      {dial === row.id ? (
                        <div className="mt-2 space-y-2">
                          <form
                            className="flex gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void studySavePhone({ data: { groupId: row.id, phone } })
                                .then(() => setNote("Your phone is saved for this group."))
                                .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Could not save the phone"));
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
                          {mates.length === 0 ? (
                            <p className="text-xs text-muted">
                              No one else has joined, so an in-app call has nowhere to go. Invite someone who is signed in, then use Call in app.
                            </p>
                          ) : null}
                          {phone && dialHref(phone) ? (
                            <a href={dialHref(phone)} className="grid min-h-11 place-items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
                              Call {phone}
                            </a>
                          ) : null}
                          {mates.map((person) => (
                            <div key={person.userId} className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm">{person.name}</p>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void studyRing({ data: { groupId: row.id, to: person.userId } })
                                      .then(() => setNote(`Calling ${person.name}. They will see it on any tab.`))
                                      .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Could not call"))
                                  }
                                  className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
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
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => void sendInvite(row)}
                        className="min-h-11 rounded-full bg-surface px-3 text-xs font-semibold text-fg"
                      >
                        Invite
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (dial === row.id) {
                            setDial(null);
                            return;
                          }
                          void openDial(row);
                        }}
                        className="min-h-11 rounded-full bg-surface px-3 text-xs font-semibold text-fg"
                      >
                        {dial === row.id ? "Close" : "Call"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void goLive(row)}
                        className="min-h-11 rounded-full bg-[#b42318] px-3 text-xs font-semibold text-white"
                      >
                        {row.live ? "Join live" : "Go live"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void toggle(row)}
                        className={cn(
                          "min-h-11 rounded-full px-3 text-xs font-semibold",
                          row.mine ? "bg-surface text-fg" : "bg-primary text-primary-fg",
                        )}
                      >
                        {row.mine ? "Leave" : "Join"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
