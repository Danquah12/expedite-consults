import { useMemo, useState } from "react";

/**
 * Standalone "Midterm forecast" table for the Desk Note Midterms tab.
 *
 * - No dependencies beyond React and the Tailwind tokens the site already uses
 *   (bg-surface, border-border, text-muted, text-primary, rounded-card, font-display).
 * - This is a FORECAST, not a result. Election Day has not happened.
 * - Rows are seeded ONLY from ratings already published on the live page
 *   (Cook Political Report, Oct 6 Senate update; Sept 25 House count).
 *   Add more races by appending to FORECAST_ROWS; keep `source` and `asOf` honest.
 */

export type Party = "Democrats" | "Republicans";
export type Confidence =
  | "Favored"
  | "Likely"
  | "Lean"
  | "Toss-up"
  | "Unrated";
export type Chamber = "House" | "Senate" | "Governor";

export interface ForecastRow {
  race: string;
  chamber: Chamber;
  rating: string; // the published rating, quoted as-is
  confidence: Confidence;
  /** Party the rating leans toward. null = too close to call / no rating. */
  predictedWinner: Party | null;
  note: string;
  source: string;
  asOf: string;
}

const other = (p: Party): Party => (p === "Democrats" ? "Republicans" : "Democrats");

export const FORECAST_ROWS: ForecastRow[] = [
  {
    race: "U.S. House majority",
    chamber: "House",
    rating: "Favored to flip",
    confidence: "Favored",
    predictedWinner: "Democrats",
    note: "Democrats hold 215 seats and need a net of 3. Published range is a gain of 5 to 15 (220 to 230 seats).",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "North Carolina Senate",
    chamber: "Senate",
    rating: "Likely Democrat",
    confidence: "Likely",
    predictedWinner: "Democrats",
    note: "Moved from Lean Democrat on Oct 6.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "New Hampshire Senate",
    chamber: "Senate",
    rating: "Lean Democrat",
    confidence: "Lean",
    predictedWinner: "Democrats",
    note: "Moved from Toss Up on Oct 6. Lean is an edge, not a called result.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "Kansas Senate",
    chamber: "Senate",
    rating: "Toss Up",
    confidence: "Toss-up",
    predictedWinner: null,
    note: "Moved from Lean Republican on Oct 6. No longer rated for Republicans, and not rated a Democratic win.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "Michigan Senate",
    chamber: "Senate",
    rating: "No rating on this page",
    confidence: "Unrated",
    predictedWinner: null,
    note: "Named as Republicans' hoped-for pickup. That is a path in the article, not a rating.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "Maine Senate",
    chamber: "Senate",
    rating: "No rating on this page",
    confidence: "Unrated",
    predictedWinner: null,
    note: "Named as Republicans' hoped-for hold. That is a path in the article, not a rating.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
  {
    race: "U.S. Senate majority",
    chamber: "Senate",
    rating: "Narrow Republican path remains",
    confidence: "Toss-up",
    predictedWinner: null,
    note: "Democrats need a net of 4 seats. Published range is a gain of 2 to 6, so a majority is possible but not settled.",
    source: "Cook Political Report",
    asOf: "Oct 6, 2026",
  },
];

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  Favored: "border-primary bg-primary text-primary-fg",
  Likely: "border-primary bg-primary text-primary-fg",
  Lean: "border-primary text-primary",
  "Toss-up": "border-border text-fg",
  Unrated: "border-border text-muted",
};

const FILTERS: Array<"All" | Chamber> = ["All", "House", "Senate", "Governor"];

export default function MidtermForecastTable({
  rows = FORECAST_ROWS,
}: {
  rows?: ForecastRow[];
}) {
  const [filter, setFilter] = useState<"All" | Chamber>("All");

  const visible = useMemo(
    () => (filter === "All" ? rows : rows.filter((r) => r.chamber === filter)),
    [rows, filter],
  );

  return (
    <section
      aria-labelledby="forecast-heading"
      className="mt-4 rounded-card border border-border bg-surface p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Forecast
      </p>
      <h3
        id="forecast-heading"
        className="mt-1 font-display text-xl font-medium"
      >
        Projected winners and losers
      </h3>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
        These are published ratings, not results. Election Day is still ahead.
        A toss-up has no projected winner or loser, and an unrated race is left
        open rather than guessed.
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by chamber">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
              filter === f
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-surface"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Projected winner and loser for each midterm race, with the published
            rating and its source.
          </caption>
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted">
              <th scope="col" className="py-2 pr-3">Race</th>
              <th scope="col" className="py-2 pr-3">Rating</th>
              <th scope="col" className="py-2 pr-3">Projected winner</th>
              <th scope="col" className="py-2 pr-3">Projected loser</th>
              <th scope="col" className="py-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const winner = r.predictedWinner;
              return (
                <tr key={r.race} className="border-b border-border align-top last:border-b-0">
                  <th scope="row" className="py-3 pr-3 font-semibold">
                    {r.race}
                    <span className="mt-1 block text-xs font-normal text-muted">
                      {r.note}
                    </span>
                  </th>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-block rounded-lg border px-2 py-1 text-xs font-semibold ${CONFIDENCE_STYLE[r.confidence]}`}
                    >
                      {r.rating}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-semibold">
                    {winner ?? <span className="font-normal text-muted">Too close to call</span>}
                  </td>
                  <td className="py-3 pr-3">
                    {winner ? other(winner) : <span className="text-muted">—</span>}
                  </td>
                  <td className="py-3 text-xs text-muted">
                    {r.source}
                    <span className="block">{r.asOf}</span>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-sm text-muted">
                  No races rated for this chamber yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
