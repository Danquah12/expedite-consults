import { getSql } from "@/lib/db";

export type ClinicRow = {
  learn: number;
  play: number;
  local: number;
  xp: number;
  sparks: number;
  echoes: number;
  goal: string;
  stamps: string[];
  drills: string[];
  strands: { name: string; pct: number }[];
  crews: string[];
  wire: string[];
  concepts: { name: string; house: string; passed: number; missed: number }[];
};

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)));

export async function ensureCustomer() {
  const sql = await getSql();
  await sql.query(`create table if not exists member_diet (
    user_id text primary key references "user" (id) on delete cascade,
    learn int not null default 55,
    play int not null default 32,
    local int not null default 13,
    xp int not null default 0,
    sparks int not null default 0,
    echoes int not null default 0,
    goal text,
    updated_at timestamptz not null default now()
  )`);
  await sql.query(`create table if not exists member_stamp (
    user_id text not null references "user" (id) on delete cascade,
    name text not null,
    earned_at timestamptz not null default now(),
    primary key (user_id, name)
  )`);
  await sql.query(`create table if not exists member_drill (
    user_id text not null references "user" (id) on delete cascade,
    post_id text not null,
    passed_at timestamptz not null default now(),
    primary key (user_id, post_id)
  )`);
  await sql.query(`create table if not exists member_strand (
    user_id text not null references "user" (id) on delete cascade,
    strand text not null,
    pct int not null default 0,
    updated_at timestamptz not null default now(),
    primary key (user_id, strand)
  )`);
  await sql.query(`create table if not exists member_crew (
    user_id text not null references "user" (id) on delete cascade,
    crew_id text not null,
    joined_at timestamptz not null default now(),
    primary key (user_id, crew_id)
  )`);
  await sql.query(`create table if not exists hall_wire (
    id bigserial primary key,
    user_id text references "user" (id) on delete set null,
    body text not null,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`create table if not exists member_concept (
    user_id text not null references "user" (id) on delete cascade,
    concept text not null,
    house text not null default '',
    passed int not null default 0,
    missed int not null default 0,
    updated_at timestamptz not null default now(),
    primary key (user_id, concept)
  )`);
  await sql.query(`create table if not exists gap_lesson (
    concept text primary key,
    house text not null default '',
    seated_at timestamptz not null default now(),
    passes int not null default 0
  )`);
  await sql.query(`create table if not exists campus_here (
    user_id text primary key references "user" (id) on delete cascade,
    place text not null default 'Clinic',
    seen_at timestamptz not null default now()
  )`);
  await sql.query(`create table if not exists open_drop (
    id text primary key,
    host_id text references "user" (id) on delete set null,
    title text not null,
    listeners int not null default 0,
    live boolean not null default false,
    started_at timestamptz not null default now()
  )`);
}

export async function loadClinic(userId: string): Promise<ClinicRow | null> {
  await ensureCustomer();
  const sql = await getSql();
  const diet = await sql<{
    learn: number;
    play: number;
    local: number;
    xp: number;
    sparks: number;
    echoes: number;
    goal: string | null;
  }>`select learn, play, local, xp, sparks, echoes, goal from member_diet where user_id = ${userId} limit 1`;
  if (!diet[0]) return null;
  const stamps = await sql<{ name: string }>`select name from member_stamp where user_id = ${userId} order by earned_at desc`;
  const drills = await sql<{ post_id: string }>`select post_id from member_drill where user_id = ${userId}`;
  const strands = await sql<{ name: string; pct: number }>`select strand as name, pct from member_strand where user_id = ${userId}`;
  const crews = await sql<{ crew_id: string }>`select crew_id from member_crew where user_id = ${userId}`;
  const wire = await sql<{ body: string }>`select body from hall_wire order by created_at desc limit 8`;
  return {
    learn: diet[0].learn,
    play: diet[0].play,
    local: diet[0].local,
    xp: diet[0].xp,
    sparks: diet[0].sparks,
    echoes: diet[0].echoes,
    goal: diet[0].goal ?? "",
    stamps: stamps.map((r) => r.name),
    drills: drills.map((r) => r.post_id),
    strands,
    crews: crews.map((r) => r.crew_id),
    wire: wire.map((r) => r.body),
    concepts: [],
  };
}

export async function saveClinic(userId: string, who: string, row: ClinicRow) {
  await ensureCustomer();
  const sql = await getSql();
  const learn = clamp(row.learn, 100);
  const play = clamp(row.play, 100);
  const local = clamp(row.local, 100);
  await sql`
    insert into member_diet (user_id, learn, play, local, xp, sparks, echoes, goal, updated_at)
    values (${userId}, ${learn}, ${play}, ${local}, ${clamp(row.xp, 1_000_000)}, ${clamp(row.sparks, 100_000)}, ${clamp(row.echoes, 100_000)}, ${row.goal.slice(0, 40)}, now())
    on conflict (user_id) do update set
      learn = excluded.learn,
      play = excluded.play,
      local = excluded.local,
      xp = excluded.xp,
      sparks = excluded.sparks,
      echoes = excluded.echoes,
      goal = excluded.goal,
      updated_at = now()
  `;
  const held = await sql<{ name: string }>`select name from member_stamp where user_id = ${userId}`;
  const have = new Set(held.map((r) => r.name));
  for (const stamp of row.stamps.slice(0, 40)) {
    const label = stamp.slice(0, 80);
    if (!label || have.has(label)) continue;
    await sql`insert into member_stamp (user_id, name) values (${userId}, ${label}) on conflict do nothing`;
    await sql`insert into hall_wire (user_id, body) values (${userId}, ${`${who || "A member"} earned ${label}`.slice(0, 180)})`;
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({ userId, action: "stamp", detail: `Earned ${label}`, target: label, surface: "clinic" });
  }
  for (const postId of row.drills.slice(0, 200)) {
    await sql`insert into member_drill (user_id, post_id) values (${userId}, ${postId.slice(0, 80)}) on conflict do nothing`;
  }
  for (const strand of row.strands.slice(0, 24)) {
    await sql`
      insert into member_strand (user_id, strand, pct, updated_at)
      values (${userId}, ${strand.name.slice(0, 40)}, ${clamp(strand.pct, 100)}, now())
      on conflict (user_id, strand) do update set pct = excluded.pct, updated_at = now()
    `;
  }
  for (const concept of (row.concepts ?? []).slice(0, 24)) {
    const name = concept.name.slice(0, 60);
    if (!name) continue;
    await sql`
      insert into member_concept (user_id, concept, house, passed, missed, updated_at)
      values (${userId}, ${name}, ${concept.house.slice(0, 40)}, ${clamp(concept.passed, 10000)}, ${clamp(concept.missed, 10000)}, now())
      on conflict (user_id, concept) do update set
        house = excluded.house,
        passed = excluded.passed,
        missed = excluded.missed,
        updated_at = now()
    `;
  }
  for (const crew of row.crews.slice(0, 20)) {
    await sql`insert into member_crew (user_id, crew_id) values (${userId}, ${crew.slice(0, 40)}) on conflict do nothing`;
  }
  await sql`
    insert into campus_here (user_id, place, seen_at)
    values (${userId}, ${"Clinic"}, now())
    on conflict (user_id) do update set seen_at = now()
  `;
}

export type GapRollup = {
  learners: number;
  rows: { house: string; name: string; passed: number; missed: number; learners: number }[];
  lessons: { concept: string; house: string; passes: number }[];
};

export async function rollupGaps(): Promise<GapRollup> {
  await ensureCustomer();
  const sql = await getSql();
  const learners = await sql<{ n: number }>`select count(distinct user_id)::int as n from member_concept`;
  const rows = await sql<{ house: string; name: string; passed: number; missed: number; learners: number }>`
    select house, concept as name, sum(passed)::int as passed, sum(missed)::int as missed, count(distinct user_id)::int as learners
    from member_concept
    group by house, concept
    order by sum(missed) desc, concept
  `;
  const lessons = await sql<{ concept: string; house: string; passes: number }>`
    select concept, house, passes from gap_lesson order by seated_at desc
  `;
  return { learners: learners[0]?.n ?? 0, rows, lessons };
}

export async function seatGap(name: string, house: string) {
  await ensureCustomer();
  const sql = await getSql();
  const concept = name.slice(0, 60);
  if (!concept) return;
  await sql`
    insert into gap_lesson (concept, house, seated_at, passes)
    values (${concept}, ${house.slice(0, 40)}, now(), 0)
    on conflict (concept) do nothing
  `;
}

export async function passGap(userId: string, name: string) {
  await ensureCustomer();
  const sql = await getSql();
  const concept = name.slice(0, 60);
  if (!concept) return;
  await sql`
    insert into member_concept (user_id, concept, house, passed, missed, updated_at)
    values (${userId}, ${concept}, ${"Seated"}, 1, 0, now())
    on conflict (user_id, concept) do update set passed = member_concept.passed + 1, updated_at = now()
  `;
  await sql`update gap_lesson set passes = passes + 1 where concept = ${concept}`;
}

export type HealthSignal = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

function noteKind(body: string) {
  if (/^(Comment|Reel comment|Study comment|Hub comment)/i.test(body)) return "comment";
  if (body.startsWith("Liked")) return "like";
  if (body.startsWith("Saved")) return "save";
  if (/^Report/i.test(body) || /misinformation/i.test(body)) return "report";
  return "other";
}

export async function communityHealth(): Promise<{ notes: number; signals: HealthSignal[] }> {
  await ensureCustomer();
  const sql = await getSql();
  await sql.query(`create table if not exists member_note (
    id serial primary key,
    post_id text not null,
    author text not null,
    body text not null,
    clip text,
    token text,
    status text not null default 'new',
    revise text,
    created_at timestamptz not null default now()
  )`);
  const notes = await sql<{ post_id: string; body: string }>`
    select post_id, body from member_note order by created_at desc limit 200
  `;
  const comments = notes.filter((row) => noteKind(row.body) === "comment");
  const likes = notes.filter((row) => noteKind(row.body) === "like").length;
  const saves = notes.filter((row) => noteKind(row.body) === "save").length;
  const reports = notes.filter((row) => noteKind(row.body) === "report").length;
  const byPost = new Map<string, string[]>();
  for (const row of comments) {
    const list = byPost.get(row.post_id) ?? [];
    list.push(row.body);
    byPost.set(row.post_id, list);
  }
  let questions = 0;
  let answered = 0;
  for (const bodies of byPost.values()) {
    const asked = bodies.filter((body) => body.includes("?"));
    questions += asked.length;
    if (asked.length && bodies.some((body) => !body.includes("?"))) answered += asked.length;
  }
  const sourced = comments.filter((row) => /https?:\/\//i.test(row.body)).length;
  const informative = comments.filter((row) => row.body.length > 80 || /\bbecause\b|https?:\/\//i.test(row.body)).length;
  const folded = new Map<string, number>();
  for (const row of comments) {
    const key = row.body.toLowerCase().replace(/\s+/g, " ").slice(0, 180);
    folded.set(key, (folded.get(key) ?? 0) + 1);
  }
  const repeated = [...folded.values()].filter((n) => n >= 3).reduce((sum, n) => sum + n, 0);
  const gaps = await rollupGaps();
  const passed = gaps.rows.reduce((sum, row) => sum + row.passed, 0);
  const missed = gaps.rows.reduce((sum, row) => sum + row.missed, 0);
  const lessonPasses = gaps.lessons.reduce((sum, row) => sum + row.passes, 0);
  const signals: HealthSignal[] = [
    {
      id: "questions",
      label: "Questions answered",
      value: questions ? `${answered} of ${questions}` : "None stored",
      detail: questions
        ? "A question counts as answered only when the same post has another comment that is not a question."
        : "No question mark was stored in a comment.",
    },
    {
      id: "informative",
      label: "Informative comments",
      value: comments.length ? `${informative} of ${comments.length}` : "None stored",
      detail: "A comment counts when it is long, says because, or includes a link. A short reaction does not.",
    },
    {
      id: "learning",
      label: "Learners passing checks",
      value: passed + missed ? `${passed} passed · ${missed} missed` : "None stored",
      detail: `${gaps.learners} clinics reported a concept. This is the learning count, not views.`,
    },
    {
      id: "sources",
      label: "Sources in the discussion",
      value: comments.length ? `${sourced} comments with a link` : "None stored",
      detail: "Only a link written in a comment counts. The film’s own caption does not.",
    },
    {
      id: "repeat",
      label: "Repetitive comments",
      value: comments.length ? `${repeated} copies of a line said at least 3 times` : "None stored",
      detail: "The same comment text, not the same subject.",
    },
    {
      id: "welcome",
      label: "Newcomers welcomed",
      value: "Not stored",
      detail: "A follow is not a welcome. This is left blank until a welcome is recorded.",
    },
    {
      id: "constructive",
      label: "Comments that explain",
      value: comments.length ? `${informative} explain or cite` : "None stored",
      detail: "The same rule as informative. The desk does not score tone.",
    },
    {
      id: "reports",
      label: "Misinformation reports",
      value: `${reports} stored`,
      detail: reports ? "These are reports people filed." : "None filed. Zero reports is not a claim that nothing was wrong.",
    },
    {
      id: "resources",
      label: "Useful resources found",
      value: `${saves} saves · ${lessonPasses} gap-lesson passes`,
      detail: "A save or a passed gap lesson. A view is not counted.",
    },
    {
      id: "likes",
      label: "Likes in this sample",
      value: `${likes}`,
      detail: "Shown so it is not mistaken for health. Likes are not the score.",
    },
  ];
  return { notes: notes.length, signals };
}

export async function communityBrief(crewId: string) {
  const { CREW_BRIEFS, subjectsIn } = await import("@/lib/community-brief");
  const spec = CREW_BRIEFS[crewId];
  if (!spec) return null;
  await ensureCustomer();
  const sql = await getSql();
  await sql.query(`create table if not exists member_note (
    id serial primary key,
    post_id text not null,
    author text not null,
    body text not null,
    clip text,
    token text,
    status text not null default 'new',
    revise text,
    created_at timestamptz not null default now()
  )`);
  const notes = await sql<{ post_id: string; body: string }>`
    select post_id, body from member_note
    where created_at > now() - interval '7 days'
    order by created_at desc
    limit 200
  `;
  const comments = notes.filter((row) => /^(Comment|Reel comment|Study comment|Hub comment)/i.test(row.body));
  const matched = comments.filter((row) => subjectsIn(row.body, spec.subjects).length > 0);
  const tally = new Map<string, number>();
  for (const row of matched) {
    for (const name of subjectsIn(row.body, spec.subjects)) tally.set(name, (tally.get(name) ?? 0) + 1);
  }
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  const byPost = new Map<string, string[]>();
  for (const row of matched) {
    const list = byPost.get(row.post_id) ?? [];
    list.push(row.body);
    byPost.set(row.post_id, list);
  }
  let unanswered = 0;
  for (const bodies of byPost.values()) {
    const asked = bodies.filter((body) => body.includes("?"));
    if (asked.length && !bodies.some((body) => !body.includes("?"))) unanswered += asked.length;
  }
  const links = new Set<string>();
  for (const row of matched) {
    for (const hit of row.body.match(/https?:\/\/[^\s)]+/gi) ?? []) links.add(hit);
  }
  const gaps = await rollupGaps();
  const misunderstood = gaps.rows.filter((row) => row.house === spec.house && row.missed > 0 && row.missed >= row.passed);
  const lessons = gaps.lessons.filter((row) => row.house === spec.house || misunderstood.some((gap) => gap.name === row.concept));
  return {
    title: spec.title,
    discussions: matched.length,
    subjects: ranked,
    unanswered,
    lessons: lessons.length,
    misunderstood: misunderstood.map((row) => row.name),
    reading: [...links].slice(0, 8),
  };
}

export type RosterPerson = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  place: string;
};

export async function listRoster(): Promise<{
  people: RosterPerson[];
  drops: { id: string; title: string; listeners: number; name: string; username: string; avatar: string }[];
}> {
  await ensureCustomer();
  const { ensurePeople } = await import("@/lib/people.server");
  await ensurePeople();
  const sql = await getSql();
  const people = await sql<{
    id: string;
    name: string;
    username: string | null;
    avatar: string | null;
    place: string | null;
  }>`
    select u.id,
      coalesce(p.display_name, u.name) as name,
      p.username,
      coalesce(p.avatar, u.image) as avatar,
      c.place
    from campus_here c
    join "user" u on u.id = c.user_id
    left join person p on p.user_id = u.id
    where c.seen_at > now() - interval '12 hours'
    order by c.seen_at desc
    limit 24
  `;
  const drops = await sql<{
    id: string;
    title: string;
    listeners: number;
    name: string | null;
    username: string | null;
    avatar: string | null;
  }>`
    select d.id, d.title, d.listeners,
      coalesce(p.display_name, u.name) as name,
      p.username,
      coalesce(p.avatar, u.image) as avatar
    from open_drop d
    left join "user" u on u.id = d.host_id
    left join person p on p.user_id = d.host_id
    where d.live = true
    order by d.started_at desc
    limit 12
  `;
  return {
    people: people.map((row) => ({
      id: row.id,
      name: row.name,
      username: row.username || row.id.slice(0, 8),
      avatar: row.avatar || "/favicon.svg",
      place: row.place || "Clinic",
    })),
    drops: drops.map((row) => ({
      id: row.id,
      title: row.title,
      listeners: row.listeners,
      name: row.name || "Member",
      username: row.username || row.id.slice(0, 8),
      avatar: row.avatar || "/favicon.svg",
    })),
  };
}

