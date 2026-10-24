export type Talk = { id: string; name: string; text: string; replyTo?: string };

export type Discussion = {
  count: number;
  questions: Talk[];
  unanswered: Talk[];
  duplicates: Talk[][];
  resources: { href: string; name: string }[];
};

function plain(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ?]/g, " ").replace(/\s+/g, " ").trim();
}

export function discussion(comments: Talk[]): Discussion {
  const questions = comments.filter((row) => row.text.includes("?"));
  const answered = new Set(comments.map((row) => row.replyTo).filter((id): id is string => Boolean(id)));
  const unanswered = questions.filter((row) => !answered.has(row.id));
  const groups = new Map<string, Talk[]>();
  for (const row of questions) {
    const key = plain(row.text);
    if (key.length < 12) continue;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const resources: { href: string; name: string }[] = [];
  for (const row of comments) {
    for (const href of row.text.match(/https?:\/\/[^\s)]+/g) ?? []) {
      if (!resources.some((item) => item.href === href)) resources.push({ href, name: row.name });
    }
  }
  return {
    count: comments.length,
    questions,
    unanswered,
    duplicates: [...groups.values()].filter((group) => group.length > 1),
    resources: resources.slice(0, 4),
  };
}
