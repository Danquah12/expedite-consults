import { LOOP_LESSONS, loadLoop } from "@/lib/learner-loop";
import type { LearningBoard } from "@/lib/learning-board";

export type Achievement = { name: string; earned: boolean; because: string };
export type Certificate = { subject: string; earned: boolean };

export type LearningRewards = {
  points: number;
  level: string;
  achievements: Achievement[];
  certificates: Certificate[];
  challenge: string;
  mastery: string[];
  community: string;
  team: string;
  boardNote: string;
};

function levelName(percent: number) {
  if (percent >= 75) return "Expert";
  if (percent >= 45) return "Advanced";
  if (percent >= 15) return "Intermediate";
  return "Beginner";
}

export function learningRewards(board: LearningBoard, crews: string[] = []): LearningRewards {
  const loopPassed = ["Cyber", "Bible", "Science", "Engineering"].reduce((sum, track) => sum + loadLoop(track).passed.length, 0);
  const points = board.quizzes * 80 + loopPassed * 25;
  const average = board.bars.length ? Math.round(board.bars.reduce((sum, bar) => sum + bar.percent, 0) / board.bars.length) : 0;
  const vectorsDone = loadLoop("Engineering").passed.includes("eng-vectors");
  const mastery = board.bars.filter((bar) => bar.percent >= 100).map((bar) => bar.label);
  const open = board.bars.find((bar) => bar.percent < 100);
  const lessonsOnOpen = open ? LOOP_LESSONS.filter((lesson) => lesson.track === (open.label === "Cyber" ? "Cyber" : open.label)).length : 0;
  return {
    points,
    level: levelName(average),
    achievements: [
      { name: "First check", earned: board.quizzes > 0 || loopPassed > 0, because: "A quiz or a lesson was passed. A watch does not count." },
      { name: "Study streak", earned: board.streak >= 2, because: "Two days in a row with a check, not with time on screen." },
      { name: "Gap closed", earned: vectorsDone, because: "The vectors lesson was passed before the next forces step." },
      { name: "Subject mastery", earned: mastery.length > 0, because: "Every step of one subject is checked." },
    ],
    certificates: board.bars.map((bar) => ({ subject: bar.label, earned: bar.percent >= 100 })),
    challenge: open
      ? `Pass one ${open.label} check. ${lessonsOnOpen ? "The lesson is on that path." : "Open a film in that subject and take the check."} Screen time does not finish it.`
      : "Every subject on this board is checked. There is no extra challenge.",
    mastery,
    community: "There is no public leaderboard. Other people's watches are not a score.",
    team: crews.length
      ? `You are in ${crews.length} crew${crews.length === 1 ? "" : "s"}. Take a line you checked. The crew does not add points.`
      : "A crew is for talking after a check. Joining one does not add points.",
    boardNote: "Learning points come from passed checks and finished lessons. Watching a film adds none.",
  };
}
