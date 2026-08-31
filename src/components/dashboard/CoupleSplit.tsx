import { formatCurrency } from "@/lib/format";

export type SplitPerson = {
  id: string;
  name: string;
  color: string;
  income: number;
  incomePct: number;
  paid: number;
  paidPct: number;
};

type SplitEntry = { id: string; name: string; color: string; pct: number; amount: number };

function SplitBar({ title, entries }: { title: string; entries: SplitEntry[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-faint">{title}</p>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-hover">
        {entries.map((e) => (
          <div key={e.id} style={{ width: `${e.pct}%`, backgroundColor: e.color }}>
            <span className="sr-only">
              {e.name}: {Math.round(e.pct)}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {entries.map((e) => (
          <span key={e.id} className="flex items-center gap-1.5 text-text-muted">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
            {e.name}: <span className="font-medium text-text">{formatCurrency(e.amount)}</span>
            <span className="text-text-faint">({Math.round(e.pct)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function CoupleSplit({ people }: { people: SplitPerson[] }) {
  const incomeEntries: SplitEntry[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    pct: p.incomePct,
    amount: p.income,
  }));
  const paidEntries: SplitEntry[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    pct: p.paidPct,
    amount: p.paid,
  }));

  const mostImbalanced = [...people].sort(
    (a, b) => Math.abs(b.paidPct - b.incomePct) - Math.abs(a.paidPct - a.incomePct)
  )[0];
  const diff = mostImbalanced ? mostImbalanced.paidPct - mostImbalanced.incomePct : 0;

  return (
    <div className="space-y-5">
      <SplitBar title="Renda" entries={incomeEntries} />
      <SplitBar title="Gastos pagos este mês" entries={paidEntries} />
      {mostImbalanced && Math.abs(diff) >= 10 && (
        <p className="text-xs text-text-faint">
          ⚖️ {mostImbalanced.name} está pagando {Math.round(Math.abs(diff))} pontos percentuais{" "}
          {diff > 0 ? "a mais" : "a menos"} do que sua parte da renda no total do casal este mês.
        </p>
      )}
    </div>
  );
}
