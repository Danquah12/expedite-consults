import { CREWS, type FeedPost } from "@/lib/feed-data";
import { careerLift } from "@/lib/career-lift";
import { CONTENT_SOURCES, type ContentSource } from "@/lib/content-sources";
import { hostEmbed } from "@/lib/hosts";
import { learnThread, studyHouse } from "@/lib/study-this";

export type AiDesk = "learn" | "career" | "community";

export type DeskNote = {
  desk: AiDesk;
  title: string;
  line: string;
  href?: string;
  steps?: { title: string; line: string }[];
};

const PIPES = ["youtube", "vimeo", "twitch", "ted", "spotify", "coursera", "mit", "khan", "gnews"] as const;

export function sourcePipes(): ContentSource[] {
  return PIPES.map((id) => CONTENT_SOURCES.find((row) => row.id === id)).filter((row): row is ContentSource => Boolean(row));
}

function blob(post: FeedPost) {
  return `${post.caption} ${post.teach.hook} ${post.teach.stamp} ${post.hashtags.join(" ")} ${post.lane}`.toLowerCase();
}

function crewFor(post: FeedPost) {
  const text = blob(post);
  const hit =
    CREWS.find((crew) => text.includes(crew.id) || text.includes(crew.name.toLowerCase().split(" ")[0] ?? "")) ??
    (text.includes("cyber") || text.includes("security")
      ? CREWS.find((c) => c.id === "cyber")
      : text.includes("bible") || text.includes("gospel")
        ? CREWS.find((c) => c.id === "pulpit")
        : text.includes("health") || text.includes("clinic")
          ? CREWS.find((c) => c.id === "ward")
          : CREWS.find((c) => c.id === "classroom"));
  return hit ?? CREWS[0];
}

export function recommendPost(post: FeedPost, library: FeedPost[]): DeskNote[] {
  const lift = careerLift(post);
  const crew = crewFor(post);
  const house = studyHouse(post);
  const thread = learnThread(post, library);
  const course = lift?.courses[0];
  const cert = lift?.certs[0];
  const job = lift?.jobs[0];

  return [
    {
      desk: "learn",
      title: "Learning",
      line: `Stay with ${house}. Read the line, say what it means, then open the next film in the same subject.`,
      href: course?.href,
      steps: thread.map((step) => ({ title: step.title, line: step.line })),
    },
    {
      desk: "career",
      title: "Career",
      line: lift
        ? `The skill in this film is ${lift.skills[0] ?? house}. ${cert ? `The next credential people use for that skill is ${cert.title}.` : ""} ${job ? `Roles that ask for it are listed at ${job.title}.` : ""}`.replace(/\s+/g, " ").trim()
        : `Name the one skill this film taught. Then look for the job that asks for that skill, not for the channel name.`,
      href: cert?.href ?? job?.href,
    },
    {
      desk: "community",
      title: "Community",
      line: `After the film, talk about it in ${crew.name}. ${crew.blurb} Bring the line from the film, not a new topic.`,
    },
  ];
}
