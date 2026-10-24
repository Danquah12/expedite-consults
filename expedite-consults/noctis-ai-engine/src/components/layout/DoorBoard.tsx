import { Link } from "@tanstack/react-router";
import { Ellipsis, LogOut } from "lucide-react";
import { NoctisMark } from "@/components/brand/NoctisMark";
import { DiscoverDesk } from "@/components/discover/DiscoverDesk";
import { JourneyDesk } from "@/components/journey/JourneyDesk";
import { LearnDesk } from "@/components/learn/LearnDesk";
import { WorkDesk } from "@/components/work/WorkDesk";
import { DOORS, MORE_DOOR, forgetDoor, rememberDoor, type DoorId, type DoorItem } from "@/lib/door-board";
import { useFeedStore } from "@/lib/feed-store";
import { leaveHall } from "@/lib/auth/client";
import { vt } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const CARDS: { id: DoorId; label: string; blurb: string; icon: LucideIcon; items: DoorItem[] }[] = [
  ...DOORS,
  { id: "more", label: MORE_DOOR.label, blurb: MORE_DOOR.blurb, icon: Ellipsis, items: MORE_DOOR.items },
];

const SLIDES: { src: string; poster?: string; video?: boolean; title: string }[] = [
  { src: "/media/covers/chalkboard.jpg", title: "Learn" },
  { src: "/media/desk/pulpit.jpg", title: "Word" },
  { src: "/media/covers/harmattan.jpg", title: "Light" },
  { src: "/media/hall/physician.mp4", poster: "/media/hall/physician.jpg", video: true, title: "Care" },
  { src: "/media/covers/hall.jpg", title: "Hall" },
  { src: "/media/hall/developer.mp4", poster: "/media/hall/developer.jpg", video: true, title: "Build" },
  { src: "/media/covers/nightmarket.jpg", title: "Evening" },
  { src: "/media/hall/realtor.mp4", poster: "/media/hall/realtor.jpg", video: true, title: "Home" },
];

const warm =
  "border border-[#e4b86a]/45 bg-[linear-gradient(165deg,#3a2c1c_0%,#241910_55%,#1a140e_100%)] text-[#f6f1e8] shadow-[0_10px_24px_rgba(42,24,8,0.35)]";

function DoorLinks({ items, from }: { items: DoorItem[]; from: DoorId }) {
  const openClinic = useFeedStore((s) => s.openClinic);
  const enterReels = useFeedStore((s) => s.enterReels);
  return (
    <ul className="grid gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.label}>
            <Link
              to={item.to}
              hash={item.hash}
              onClick={() => {
                rememberDoor(from);
                if (item.to === "/") openClinic();
                if (item.to === "/reels") enterReels();
              }}
              className={cn("flex items-center gap-3 rounded-2xl px-3 py-3", warm)}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4b86a]/15 text-[#f0c56a]">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{vt(item.label)}</span>
                <span className="block truncate text-[12px] text-[#d7c4a2]">{vt(item.blurb)}</span>
              </span>
            </Link>
          </li>
        );
      })}
      {from === "more" ? (
        <li>
          <button
            type="button"
            onClick={() => {
              void leaveHall();
            }}
            className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left", warm)}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4b86a]/15 text-[#f0c56a]">
              <LogOut className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{vt("Sign out")}</span>
              <span className="block truncate text-[12px] text-[#d7c4a2]">{vt("Leave this account")}</span>
            </span>
          </button>
        </li>
      ) : null}
    </ul>
  );
}

function WelcomeCard({ onStartJourney }: { onStartJourney: () => void }) {
  const row = [...SLIDES, ...SLIDES];
  return (
    <section
      aria-label={vt("Welcome")}
      className={cn(
        "door-welcome relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border-2 border-[#e4b86a] md:min-h-[38rem]",
        warm,
      )}
    >
      <p className="absolute left-4 top-4 z-10 rounded-full border border-[#e4b86a] bg-[#1a140e]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6e3b0] md:left-6 md:top-5">
        {vt("Welcome")}
      </p>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#e4b86a]/20 to-transparent" />
      <div className="absolute inset-x-0 top-14 overflow-hidden md:top-16">
        <div className="door-glide flex w-max gap-3.5 px-4">
          {row.map((slide, index) => (
            <figure key={`${slide.src}-${index}`} className="w-36 shrink-0 md:w-52">
              <div className="overflow-hidden rounded-2xl border border-[#f6e7c3]/25 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                {slide.video ? (
                  <video
                    src={slide.src}
                    poster={slide.poster}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <img src={slide.src} alt="" className="aspect-[4/5] w-full object-cover" />
                )}
              </div>
              <figcaption className="mt-2 px-1 text-[11px] font-medium tracking-wide text-[#e7d3ae]">
                {vt(slide.title)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a140e] via-[#1a140e]/95 to-transparent px-4 pb-5 pt-16 md:px-7 md:pb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <NoctisMark className="size-10 md:size-12" />
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {vt("Welcome.")}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#d7c4a2]">
              {vt("Open a card. This welcome steps aside, and only that list stays.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartJourney}
            className="w-full shrink-0 rounded-2xl border border-[#e4b86a]/55 bg-[#1a140e]/80 px-5 py-3 text-left backdrop-blur-sm transition hover:border-[#f0c56a] hover:bg-[#241910] sm:w-auto sm:min-w-[11rem]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
              {vt("Next")}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#f6f1e8]">{vt("Start something")}</p>
          </button>
        </div>
      </div>
    </section>
  );
}

export function DoorBoard({ door, onDoor }: { door?: DoorId; onDoor: (door?: DoorId) => void }) {
  const open = CARDS.find((item) => item.id === door);
  return (
    <div className="w-full px-4 py-4 pb-24 md:px-7 md:py-6 md:pb-10">
      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start">
        {/* Persistent Left Sidebar: START HERE (6 Warm Cards stacked vertically on desktop) */}
        <aside aria-label={vt("Start here")} className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
            {vt("Start here")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-1">
            {CARDS.map((item) => {
              const Icon = item.icon;
              const on = door === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    if (on) {
                      forgetDoor();
                      onDoor(undefined);
                      return;
                    }
                    rememberDoor(item.id);
                    onDoor(item.id);
                  }}
                  className={cn(
                    "flex h-auto w-full flex-col items-start justify-between gap-3 rounded-[1.35rem] p-3.5 text-left transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 md:h-[7.25rem] md:p-4",
                    warm,
                    on && "ring-2 ring-[#f0c56a]",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[#e4b86a]/18 text-[#f6e3b0]">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="block">
                    <span className="block font-display text-lg font-semibold leading-tight">
                      {vt(item.label)}
                    </span>
                    <span className="mt-1 block text-xs text-[#d7c4a2]">{vt(item.blurb)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content Panel: WelcomeCard initially, JourneyDesk for Journey, DiscoverDesk for Discover, LearnDesk for Learn */}
        <div className="min-w-0 md:pt-6">
          {open?.id === "journey" ? (
            <section key="journey" aria-label={vt("My Journey")} className="min-w-0">
              <JourneyDesk
                onOpenLearn={() => {
                  rememberDoor("learn");
                  onDoor("learn");
                }}
              />
            </section>
          ) : open?.id === "discover" ? (
            <section key="discover" aria-label={vt("Discover")} className="min-w-0 space-y-4">
              <div>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
                  {vt(open.label)} · Direct Channels (Academy, Reels, News & Analysis)
                </p>
                <DoorLinks items={open.items} from={open.id} />
              </div>
              <DiscoverDesk
                onOpenJourney={() => {
                  rememberDoor("journey");
                  onDoor("journey");
                }}
              />
            </section>
          ) : open?.id === "learn" ? (
            <section key="learn" aria-label={vt("Learn")} className="min-w-0 space-y-4">
              <div>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
                  {vt(open.label)} · Shared Curriculum Workspace & Direct Surfaces (Hall, Lessons, Paths)
                </p>
                <DoorLinks items={open.items} from={open.id} />
              </div>
              <LearnDesk
                onOpenJourney={() => {
                  rememberDoor("journey");
                  onDoor("journey");
                }}
              />
            </section>
          ) : open?.id === "work" ? (
            <section key="work" aria-label={vt("Work")} className="min-w-0 space-y-4">
              <div>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
                  {vt(open.label)} · Career Explorer, Certifications, Skilled Trades, Projects, Opportunities &amp; Skills Passport
                </p>
                <DoorLinks items={open.items} from={open.id} />
              </div>
              <WorkDesk
                onOpenJourney={() => {
                  rememberDoor("journey");
                  onDoor("journey");
                }}
                onOpenLearn={() => {
                  rememberDoor("learn");
                  onDoor("learn");
                }}
              />
            </section>
          ) : open ? (
            <section key={open.id} aria-label={vt(open.label)}>
              <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">
                {vt(open.label)}
              </p>
              <DoorLinks items={open.items} from={open.id} />
            </section>
          ) : (
            <WelcomeCard
              onStartJourney={() => {
                rememberDoor("journey");
                onDoor("journey");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


