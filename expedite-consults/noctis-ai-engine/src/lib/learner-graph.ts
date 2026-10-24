export type LearnerGraph = {
  knows: string[];
  learning: string[];
  interested: string;
  completed: number;
  weak: string[];
  wants: string;
};

export function learnerGraph(input: { understood: string[]; studied: string[]; missing: string[]; goal: string; completed: number }): LearnerGraph {
  const knows = input.understood.slice(0, 6);
  return {
    knows,
    learning: input.studied.filter((item) => !knows.includes(item)).slice(0, 6),
    interested: input.goal,
    completed: input.completed,
    weak: input.missing.slice(0, 6),
    wants: input.goal,
  };
}
