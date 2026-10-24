import type { LearningTree } from "@/lib/learning-profile";

export function LearningProfile({ tree }: { tree: LearningTree }) {
  if (!tree.houses.length) {
    return <p className="mt-3 text-sm text-muted">No concept has been practiced yet. A watch and a check are what move a skill. A like does not.</p>;
  }
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Knowledge</p>
      <ul className="mt-2 space-y-2">
        {tree.houses.map((house) => (
          <li key={house.name}>
            <p className="text-sm font-semibold">{house.name}</p>
            <ul className="mt-1 space-y-0.5 pl-3">
              {house.skills.map((skill) => (
                <li key={skill.name} className="text-sm text-muted">
                  {skill.name} <span className="text-fg">→ {skill.level}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {tree.practice ? <p className="mt-2 text-xs text-primary">{tree.practice.name} needs practice. That is the next concept, not a belief.</p> : null}
    </div>
  );
}
