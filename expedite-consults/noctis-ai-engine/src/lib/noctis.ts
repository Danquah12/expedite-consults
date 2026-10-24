export type VibeLane = "learn" | "laugh" | "local";
export type VibeMix = Record<VibeLane, number>;

export const DEFAULT_MIX: VibeMix = { learn: 55, laugh: 32, local: 13 };

export const LANE_LABEL: Record<VibeLane, string> = {
  learn: "Learn",
  laugh: "Play",
  local: "Local",
};

export function nudgeMix(mix: VibeMix, lane: VibeLane): VibeMix {
  const bump = 12;
  const next = { ...mix, [lane]: Math.min(85, mix[lane] + bump) };
  const rest = (["learn", "laugh", "local"] as VibeLane[]).filter((l) => l !== lane);
  const leftover = 100 - next[lane];
  const other = rest.reduce((a, l) => a + mix[l], 0) || 1;
  rest.forEach((l) => {
    next[l] = Math.max(8, Math.round((mix[l] / other) * leftover));
  });
  const drift = 100 - next.learn - next.laugh - next.local;
  next[lane] += drift;
  return next;
}
