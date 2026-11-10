import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Check, Clock, GraduationCap, Play, Search, Star, ThumbsUp, Users } from "lucide-react";
import { Avatar, Composer, POSTS, Post } from "@/components/social/StudySocial";
import { GroupsLayout } from "@/components/social/Groups";
import { cn } from "@/lib/utils";

/* Visual mockup only: courses, lessons, ratings and reviews are sample data. */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

type Course = {
  id: string;
  title: string;
  subject: string;
  cover: string;
  by: string;
  rating: number;
  reviews: number;
  learners: number;
  about: string;
  lessons: { title: string; min: number }[];
};

export const COURSES: Course[] = [
  {
    id: "sec701",
    title: "Security+ SY0-701 crash course",
    subject: "Cybersecurity",
    cover: "from-sky-400 to-indigo-700",
    by: "Kofi Mensah",
    rating: 4.8,
    reviews: 412,
    learners: 5230,
    about: "All five exam domains in 12 short lessons, each ending with a 60-second drill and a printable cheat sheet.",
    lessons: [
      { title: "Threats, vulnerabilities and attacks", min: 14 },
      { title: "Cryptography essentials", min: 18 },
      { title: "Identity and access management", min: 16 },
      { title: "Network security architecture", min: 20 },
      { title: "Zero trust and segmentation", min: 12 },
      { title: "Incident response", min: 15 },
    ],
  },
  {
    id: "calc2",
    title: "Calculus II: series and sequences",
    subject: "Mathematics",
    cover: "from-violet-400 to-purple-700",
    by: "Lena Park",
    rating: 4.7,
    reviews: 268,
    learners: 3180,
    about: "Convergence tests, power series and Taylor expansions explained with worked examples.",
    lessons: [
      { title: "Sequences and limits", min: 11 },
      { title: "Series and the ratio test", min: 17 },
      { title: "Power series", min: 19 },
      { title: "Taylor and Maclaurin", min: 22 },
    ],
  },
  {
    id: "orgo",
    title: "Organic Chemistry: reaction mechanisms",
    subject: "Chemistry",
    cover: "from-emerald-400 to-teal-700",
    by: "Ama Boateng",
    rating: 4.9,
    reviews: 590,
    learners: 7410,
    about: "Arrow-pushing from scratch. SN1, SN2, E1, E2 and carbonyl chemistry with exam-style practice.",
    lessons: [
      { title: "Arrow pushing basics", min: 13 },
      { title: "SN1 vs SN2", min: 21 },
      { title: "Elimination reactions", min: 18 },
      { title: "Carbonyl chemistry", min: 24 },
      { title: "Synthesis problems", min: 26 },
    ],
  },
];

const REVIEWS = [
  { name: "Dev Patel", initials: "DP", tone: "bg-fuchsia-600", stars: 5, text: "The 60-second drills at the end of each lesson made it stick." },
  { name: "Zoe Rivers", initials: "ZR", tone: "bg-rose-500", stars: 5, text: "Passed on my first attempt. The cheat sheets are gold." },
  { name: "Sam Okafor", initials: "SO", tone: "bg-teal-600", stars: 4, text: "Great pacing. I'd love more practice questions in the last unit." },
];

function Stars({ n, size = "size-4" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, i <= Math.round(n) ? "fill-[#f7b928] text-[#f7b928]" : "text-[#ced0d4]")} />
      ))}
    </span>
  );
}

/** /courses: course discovery, laid out like Facebook Pages discovery. */
export function CoursesHome() {
  const [q, setQ] = useState("");
  const shown = COURSES.filter((c) => (c.title + c.subject).toLowerCase().includes(q.toLowerCase()));
  return (
    <GroupsLayout>
      <section className={cn(CARD, "p-4")}>
        <h1 className="text-2xl font-bold text-[#050505]">Courses</h1>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
          <Search className="size-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses and subjects"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
          />
        </label>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((c) => (
          <Link
            key={c.id}
            to="/courses/$courseId"
            params={{ courseId: c.id }}
            className={cn(CARD, "overflow-hidden transition-shadow hover:shadow-md")}
          >
            <div className={cn("grid h-32 place-items-center bg-gradient-to-br text-white", c.cover)}>
              <GraduationCap className="size-12 opacity-90" />
            </div>
            <div className="p-3">
              <p className="text-[17px] font-semibold leading-tight text-[#050505]">{c.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#65676b]">
                <Stars n={c.rating} size="size-3.5" /> {c.rating} ({c.reviews})
              </p>
              <p className="mt-0.5 text-[13px] text-[#65676b]">
                {c.learners.toLocaleString()} learners · {c.lessons.length} lessons · Free
              </p>
            </div>
          </Link>
        ))}
        {shown.length === 0 ? <p className="p-4 text-[15px] text-[#65676b]">No courses match your search.</p> : null}
      </div>
    </GroupsLayout>
  );
}

const TABS = ["Lessons", "About", "Discussion", "Reviews"] as const;
type Tab = (typeof TABS)[number];

/** /courses/$courseId: a course shown as a Facebook Page, with a lesson player, comments and reviews. */
export function CoursePage({ courseId }: { courseId: string }) {
  const course = COURSES.find((c) => c.id === courseId);
  const [tab, setTab] = useState<Tab>("Lessons");
  const [enrolled, setEnrolled] = useState(true);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set([0]));
  if (!course) {
    return (
      <GroupsLayout>
        <section className={cn(CARD, "p-6 text-center")}>
          <h1 className="text-xl font-bold">This course isn't available</h1>
          <Link to="/courses" className={cn("mt-4 inline-block rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
            Back to courses
          </Link>
        </section>
      </GroupsLayout>
    );
  }
  const pct = Math.round((done.size / course.lessons.length) * 100);
  const lesson = course.lessons[current];
  const posts = POSTS.slice(0, 2).map((p) => ({ ...p, group: course.title }));
  return (
    <GroupsLayout wide>
      <section className={cn(CARD, "overflow-hidden")}>
        <div className={cn("grid h-40 place-items-center bg-gradient-to-br text-white sm:h-60", course.cover)}>
          <GraduationCap className="size-16 opacity-90" />
        </div>
        <div className="px-4 pt-3">
          <h1 className="text-[28px] font-bold leading-tight text-[#050505]">{course.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#65676b]">
            <span className="flex items-center gap-1.5">
              <Stars n={course.rating} /> {course.rating} ({course.reviews} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" /> {course.learners.toLocaleString()} learners
            </span>
            <span>by {course.by}</span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setEnrolled((v) => !v)}
              className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", enrolled ? BTN_GREY : BTN_BLUE)}
            >
              {enrolled ? "Enrolled ✓" : "Enroll for free"}
            </button>
            {enrolled ? (
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-[#e4e6eb]">
                  <div className="h-full rounded-full bg-[#1877f2]" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[13px] text-[#65676b]">{pct}% complete</p>
              </div>
            ) : null}
          </div>
        </div>
        <nav className="mx-4 mt-3 flex gap-1 overflow-x-auto border-t border-[#ced0d4]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative shrink-0 px-4 py-3.5 text-[15px] font-semibold",
                tab === t ? "text-[#1877f2]" : cn("my-1 rounded-md py-2.5 text-[#65676b]", HOVER),
              )}
            >
              {t}
              {tab === t ? <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t bg-[#1877f2]" /> : null}
            </button>
          ))}
        </nav>
      </section>

      {tab === "Lessons" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className={cn(CARD, "overflow-hidden")}>
              <div className={cn("relative grid aspect-video place-items-center bg-gradient-to-br", course.cover)}>
                <button className="grid size-16 place-items-center rounded-full bg-white/90 text-[#1877f2] shadow-lg" title="Play">
                  <Play className="ml-1 size-8 fill-current" />
                </button>
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[12px] font-semibold text-white">
                  {lesson.min}:00
                </span>
              </div>
              <div className="p-4">
                <p className="text-[13px] font-semibold uppercase text-[#65676b]">
                  Lesson {current + 1} of {course.lessons.length}
                </p>
                <h2 className="text-[20px] font-bold text-[#050505]">{lesson.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setDone((s) => new Set(s).add(current))}
                    className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}
                  >
                    <Check className="size-4" /> Mark complete
                  </button>
                  <button className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>
                    <ThumbsUp className="size-4" /> Helpful
                  </button>
                  <button className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>
                    <BookOpen className="size-4" /> 60-second drill
                  </button>
                </div>
              </div>
            </section>
            <section className={cn(CARD, "p-4")}>
              <h3 className="mb-3 text-[17px] font-bold text-[#050505]">Comments on this lesson</h3>
              {[
                { n: "Dev Patel", i: "DP", t: "bg-fuchsia-600", c: "The example at 6:30 finally made this click." },
                { n: "Zoe Rivers", i: "ZR", t: "bg-rose-500", c: "Does anyone have the slide with the comparison table?" },
              ].map((c) => (
                <div key={c.n} className="mb-3 flex gap-2">
                  <Avatar initials={c.i} tone={c.t} size="size-9" />
                  <div className="rounded-2xl bg-[#f0f2f5] px-3 py-2">
                    <p className="text-[13px] font-semibold text-[#050505]">{c.n}</p>
                    <p className="text-[15px] text-[#050505]">{c.c}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Avatar initials="YOU" tone="bg-[#1c1e21]" size="size-9" />
                <input
                  placeholder="Write a comment..."
                  className="h-9 min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-3 text-[15px] outline-none placeholder:text-[#65676b]"
                />
              </div>
            </section>
          </div>
          <aside className={cn(CARD, "h-fit p-2")}>
            <h3 className="px-2 py-2 text-[17px] font-bold text-[#050505]">Course content</h3>
            {course.lessons.map((l, i) => (
              <button
                key={l.title}
                onClick={() => setCurrent(i)}
                className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", i === current ? "bg-[#e7f3ff]" : HOVER)}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold",
                    done.has(i) ? "bg-[#31a24c] text-white" : "bg-[#e4e6eb] text-[#65676b]",
                  )}
                >
                  {done.has(i) ? <Check className="size-4" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-[#050505]">{l.title}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#65676b]">
                    <Clock className="size-3" /> {l.min} min
                  </span>
                </span>
              </button>
            ))}
          </aside>
        </div>
      ) : null}

      {tab === "About" ? (
        <section className={cn(CARD, "p-4")}>
          <h2 className="mb-2 text-[20px] font-bold">About this course</h2>
          <p className="text-[15px] leading-snug text-[#050505]">{course.about}</p>
          <ul className="mt-3 space-y-2 text-[15px] text-[#050505]">
            <li className="flex items-center gap-3">
              <BookOpen className="size-5 text-[#65676b]" /> {course.lessons.length} lessons ·{" "}
              {course.lessons.reduce((a, l) => a + l.min, 0)} minutes
            </li>
            <li className="flex items-center gap-3">
              <GraduationCap className="size-5 text-[#65676b]" /> Taught by {course.by}
            </li>
          </ul>
        </section>
      ) : null}

      {tab === "Discussion" ? (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
          <Composer />
          {posts.map((p) => (
            <Post key={p.id} post={p} />
          ))}
        </div>
      ) : null}

      {tab === "Reviews" ? (
        <section className={cn(CARD, "mx-auto w-full max-w-[680px] p-4")}>
          <div className="mb-4 flex items-center gap-4">
            <span className="text-5xl font-bold text-[#050505]">{course.rating}</span>
            <div>
              <Stars n={course.rating} size="size-5" />
              <p className="text-[13px] text-[#65676b]">{course.reviews} reviews</p>
            </div>
          </div>
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex gap-3 border-t border-[#e4e6eb] py-3">
              <Avatar initials={r.initials} tone={r.tone} />
              <div>
                <p className="text-[15px] font-semibold text-[#050505]">{r.name}</p>
                <Stars n={r.stars} size="size-3.5" />
                <p className="mt-1 text-[15px] text-[#050505]">{r.text}</p>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </GroupsLayout>
  );
}
