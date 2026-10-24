import { createServerFn } from "@tanstack/react-start";

export type StudyMaterial = { title: string; href: string; note: string };

function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/"/g, '"')
    .replace(/&#039;|'/g, "'")
    .replace(/&/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const moreToStudy = createServerFn({ method: "POST" })
  .validator((input: { subject: string }) => ({
    subject: String(input?.subject ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160),
  }))
  .handler(async ({ data }): Promise<{ subject: string; materials: StudyMaterial[] }> => {
    const subject = data.subject;
    const q = encodeURIComponent(`${subject} explained`);
    const materials: StudyMaterial[] = [
      {
        title: "Search this subject",
        href: `https://www.google.com/search?q=${q}`,
        note: "Lectures, articles, and courses on the open web.",
      },
      {
        title: "Papers on this subject",
        href: `https://scholar.google.com/scholar?q=${encodeURIComponent(subject)}`,
        note: "Research, not a social clip.",
      },
    ];
    if (subject.length < 8) return { subject, materials };
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(subject)}&srlimit=3&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "NoctisStudy/1.0 (https://www.expediteconsults.com/; further-study)" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const body = (await res.json()) as { query?: { search?: { title: string; snippet: string }[] } };
        for (const row of body.query?.search ?? []) {
          materials.push({
            title: row.title,
            href: `https://en.wikipedia.org/wiki/${encodeURIComponent(row.title.replace(/ /g, "_"))}`,
            note: plain(row.snippet).slice(0, 180),
          });
        }
      }
    } catch {
      /* the Google links still stand */
    }
    return { subject, materials };
  });
