import { formatCurrency } from "@/lib/format";

export type BreakdownSegment = {
  key: string;
  label: string;
  color: string;
  value: number;
};

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3; // px de espaço entre fatias, no mesmo "orçamento" da circunferência

export function SpendingDonut({ segments }: { segments: BreakdownSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return (
      <p className="py-10 text-center text-sm text-text-faint">
        Sem lançamentos este mês ainda pra montar a distribuição.
      </p>
    );
  }

  type Arc = BreakdownSegment & { fraction: number; dash: number; offset: number; rawLength: number };
  const arcs = segments.reduce<Arc[]>((acc, s) => {
    const fraction = s.value / total;
    const rawLength = fraction * CIRCUMFERENCE;
    const cumulative = acc.length ? acc[acc.length - 1].offset * -1 + acc[acc.length - 1].rawLength : 0;
    acc.push({ ...s, fraction, dash: Math.max(0, rawLength - GAP), offset: -cumulative, rawLength });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Distribuição dos gastos do mês por categoria">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--surface-hover)"
            strokeWidth={STROKE}
          />
          {arcs.map((s) => {
            return (
              <circle
                key={s.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${s.dash} ${CIRCUMFERENCE - s.dash}`}
                strokeDashoffset={s.offset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                strokeLinecap="butt"
              >
                <title>{`${s.label}: ${formatCurrency(s.value)} (${Math.round(s.fraction * 100)}%)`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-text-faint">Total do mês</span>
          <span className="font-display text-lg font-semibold text-text">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={s.key} className="flex items-center gap-3 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-text-muted">{s.label}</span>
              <span className="text-text-faint">{formatCurrency(s.value)}</span>
              <span className="w-10 shrink-0 text-right font-medium text-text">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
