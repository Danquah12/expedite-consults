import { runBenchmark } from "../lib/benchmark-runner";

const split = process.argv[2]; // optional: "development" | "held_out"
const run = runBenchmark();
const pct = (x: number | null) => (x === null ? "n/a" : `${(x * 100).toFixed(0)}%`);
for (const c of run.cases) {
  if (split && c.split !== split) continue;
  console.log(
    `${c.id.padEnd(14)} ${c.vulnerable ? "VULN" : "SAFE"} ${c.cwe.padEnd(8)} alert=${c.outcomeAlert} confirmed=${c.outcomeConfirmed}  states=[${c.reportedStates.join(",")}]`
  );
}
for (const s of ["development", "held_out"] as const) {
  if (split && s !== split) continue;
  for (const k of ["alert", "confirmed"] as const) {
    const r = run.bySplit[s][k];
    console.log(`${s.padEnd(12)} ${k.padEnd(9)} TP=${r.tp} FP=${r.fp} TN=${r.tn} FN=${r.fn} precision=${pct(r.precision)} recall=${pct(r.recall)}`);
  }
}
console.log(`interprocedural vulnerable fixtures: ${run.interprocedural.detected}/${run.interprocedural.total} alerted, ${run.interprocedural.confirmed}/${run.interprocedural.total} confirmed`);
