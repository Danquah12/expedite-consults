import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeedStore } from "@/lib/feed-store";
import { studyClearRing, studyJoined, studyRing, studyRings, studyRoom, studySavePhone, dialHref } from "@/lib/study-group-api";

type Group = { id: string; interest: string; title: string };
type Person = { userId: string; name: string; phone: string; live: boolean };
type Ring = { id: number; groupId: string; from: string; title: string; interest: string };

export function StudyCalls({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [ring, setRing] = useState<Ring | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stop = false;
    void studyJoined()
      .then((rows) => {
        if (!stop) setGroups(rows);
      })
      .catch(() => {
        if (!stop) setGroups([]);
      });
    void studyRings()
      .then((rows) => {
        if (!stop) setRing(rows[0] ?? null);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [open]);

  async function pick(group: Group) {
    setOpenId(group.id);
    setNote(null);
    try {
      const room = await studyRoom({ data: { groupId: group.id } });
      setPeople(room.people);
      setPhone(room.phone);
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not open this group");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="size-4" />
            Calls
          </DialogTitle>
          <DialogDescription>Call a study group in the app, or dial the phone they saved.</DialogDescription>
        </DialogHeader>
        {ring ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary px-3 py-3 text-primary-fg">
            <p className="text-sm">
              <span className="font-semibold">{ring.from}</span> is calling you into {ring.title}.
            </p>
            <button
              type="button"
              className="min-h-11 rounded-full bg-bg px-3 text-xs font-semibold text-fg"
              onClick={() => {
                const next = ring;
                setRing(null);
                closeModal();
                void studyClearRing({ data: { id: next.id } });
                void navigate({
                  to: "/study",
                  search: { desk: next.interest, group: next.groupId, family: undefined, step: undefined },
                });
              }}
            >
              Join the call
            </button>
          </div>
        ) : null}
        {groups.length === 0 ? (
          <p className="text-sm text-muted">Join a study group first. Open Study, then Study group.</p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {groups.map((group) => (
              <li key={group.id} className="rounded-xl bg-elevated px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold">{group.title}</p>
                  <button type="button" onClick={() => void pick(group)} className="min-h-11 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
                    {openId === group.id ? "Open" : "Call"}
                  </button>
                </div>
                {openId === group.id ? (
                  <div className="mt-2 space-y-2">
                    <form
                      className="flex gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void studySavePhone({ data: { groupId: group.id, phone } })
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
                    {people.length === 0 ? (
                      <p className="text-xs text-muted">No one else has joined, so an in-app call has nowhere to go. Invite them from the study group first.</p>
                    ) : null}
                    {phone && dialHref(phone) ? (
                      <a href={dialHref(phone)} className="grid min-h-11 place-items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
                        Call {phone}
                      </a>
                    ) : null}
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
                              void studyRing({ data: { groupId: group.id, to: person.userId } })
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
              </li>
            ))}
          </ul>
        )}
        {note ? <p className="text-xs text-muted">{note}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
