import type { LucideIcon } from "lucide-react";
import { Landmark, Wallet, CalendarClock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ProgressBar } from "@/components/ui/ProgressBar";

function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="card-glass card-glass-hover min-w-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lilac/10 text-lilac">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 truncate font-display text-lg font-semibold text-text sm:text-xl">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-text-faint">{suffix}</span>}
      </p>
      {children}
    </div>
  );
}

export function DebtSummaryCards({
  totalAmount,
  monthlyCommitment,
  payoffMonths,
  progressPct,
}: {
  totalAmount: number;
  monthlyCommitment: number;
  payoffMonths: number;
  progressPct: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Dívidas totais" value={formatCurrency(totalAmount)} icon={Landmark} />
      <MetricCard label="Comprometimento mensal" value={formatCurrency(monthlyCommitment)} suffix="/mês" icon={Wallet} />
      <MetricCard
        label="Previsão de quitação"
        value={payoffMonths > 0 ? `~${payoffMonths}` : "—"}
        suffix={payoffMonths > 0 ? (payoffMonths === 1 ? "mês" : "meses") : undefined}
        icon={CalendarClock}
      />
      <MetricCard label="Progresso" value={`${progressPct.toFixed(0)}%`} suffix="quitado" icon={TrendingUp}>
        <ProgressBar value={progressPct} className="mt-3 h-1.5" />
      </MetricCard>
    </div>
  );
}
