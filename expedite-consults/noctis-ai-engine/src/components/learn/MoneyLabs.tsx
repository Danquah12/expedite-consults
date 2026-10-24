import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const LABS = [
  { id: "compound", label: "Compound" },
  { id: "mortgage", label: "Mortgage" },
  { id: "retire", label: "Retirement" },
  { id: "budget", label: "Budget" },
] as const;

type LabId = (typeof LABS)[number]["id"];

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function MoneyLabs() {
  const [lab, setLab] = useState<LabId>("compound");
  const [principal, setPrincipal] = useState(10_000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const [monthly, setMonthly] = useState(400);
  const [price, setPrice] = useState(320_000);
  const [down, setDown] = useState(20);
  const [income, setIncome] = useState(4_800);
  const [needs, setNeeds] = useState(2_400);
  const [wants, setWants] = useState(1_200);

  const r = rate / 100;
  const compound = principal * (1 + r) ** years;
  const loan = price * (1 - down / 100);
  const mr = r / 12;
  const n = years * 12;
  const mortgage = mr === 0 ? loan / n : (loan * mr * (1 + mr) ** n) / ((1 + mr) ** n - 1);
  const retire = monthly * (((1 + r / 12) ** n - 1) / (r / 12 || 1));
  const save = Math.max(0, income - needs - wants);
  const needPct = income ? (needs / income) * 100 : 0;
  const wantPct = income ? (wants / income) * 100 : 0;

  const line = useMemo(() => {
    if (lab === "compound") return `${money(principal)} at ${rate}% for ${years} years becomes ${money(compound)}.`;
    if (lab === "mortgage") return `${money(price)} with ${down}% down → ${money(mortgage)} / month.`;
    if (lab === "retire") return `${money(monthly)} / month for ${years} years at ${rate}% → ${money(retire)}.`;
    return `Needs ${needPct.toFixed(0)}% · Wants ${wantPct.toFixed(0)}% · Save ${money(save)}. Target 50 / 30 / 20.`;
  }, [lab, principal, rate, years, compound, price, down, mortgage, monthly, retire, needPct, wantPct, save]);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Money labs</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Learn by doing. Not by scrolling tickers.</h2>
      <p className="mt-1 text-sm text-muted">{line}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {LABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLab(item.id)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              lab === item.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {lab === "compound" ? (
          <>
            <Field label="Principal" value={principal} onChange={setPrincipal} max={200000} />
            <Field label="Rate %" value={rate} onChange={setRate} max={20} />
            <Field label="Years" value={years} onChange={setYears} max={50} />
          </>
        ) : null}
        {lab === "mortgage" ? (
          <>
            <Field label="Price" value={price} onChange={setPrice} max={900000} />
            <Field label="Down %" value={down} onChange={setDown} max={50} />
            <Field label="Rate %" value={rate} onChange={setRate} max={12} />
            <Field label="Years" value={years} onChange={setYears} max={40} />
          </>
        ) : null}
        {lab === "retire" ? (
          <>
            <Field label="Monthly" value={monthly} onChange={setMonthly} max={5000} />
            <Field label="Rate %" value={rate} onChange={setRate} max={12} />
            <Field label="Years" value={years} onChange={setYears} max={50} />
          </>
        ) : null}
        {lab === "budget" ? (
          <>
            <Field label="Income / mo" value={income} onChange={setIncome} max={20000} />
            <Field label="Needs" value={needs} onChange={setNeeds} max={income} />
            <Field label="Wants" value={wants} onChange={setWants} max={income} />
          </>
        ) : null}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
      <span className="mt-1 block text-sm font-semibold tabular-nums">
        {label.includes("%") ? `${value}%` : /year/i.test(label) ? `${value} yrs` : money(value)}
      </span>
    </label>
  );
}