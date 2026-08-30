import { Wallet, CalendarClock, Receipt, Landmark, Sparkles, PiggyBank } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { auraDashboardMessage } from "@/lib/aura/insights";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const CATEGORY_LABELS: Record<string, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  compras: "Compras",
  outros: "Outros",
};

export default async function DashboardPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);
  const aura = auraDashboardMessage({
    coupleIncome: snap.coupleIncome,
    fixedBillsTotal: snap.fixedBillsTotal,
    monthExpenses: snap.monthExpensesTotal,
    leisureBudget: snap.leisureBudget,
    leisureSpent: snap.leisureSpent,
  });

  const toneClasses = {
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-danger/30 bg-danger/10 text-danger",
  }[aura.tone];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">{formatMonthYear(new Date())}</p>
      </div>

      <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${toneClasses}`}>{aura.text}</div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="Renda do casal" value={formatCurrency(snap.coupleIncome)} icon={Wallet} />
        <StatTile label="Contas fixas" value={formatCurrency(snap.fixedBillsTotal)} icon={CalendarClock} />
        <StatTile label="Gastos do mês" value={formatCurrency(snap.monthExpensesTotal)} icon={Receipt} />
        <StatTile
          label="Dívidas"
          value={formatCurrency(snap.debtsTotal)}
          sub={snap.debts.length ? `${formatCurrency(snap.debtsMonthlyTotal)}/mês planejado` : undefined}
          icon={Landmark}
        />
        <StatTile
          label="Sonhos"
          value={String(snap.goals.length)}
          sub={snap.goals.length ? "objetivo(s) ativo(s)" : "nenhum ainda"}
          icon={Sparkles}
        />
        <StatTile
          label="Saldo disponível"
          value={formatCurrency(snap.available)}
          icon={PiggyBank}
          tone={snap.available < 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimos gastos</CardTitle>
            <Badge tone="lilac">{snap.expenses.length} este mês</Badge>
          </CardHeader>
          {snap.expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-faint">Nenhum gasto lançado este mês ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {snap.expenses.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{e.description}</p>
                    <p className="text-xs text-text-faint">
                      {e.user.name} · {CATEGORY_LABELS[e.category]} · {formatDate(e.date)}
                      {e.source === "whatsapp" && " · via WhatsApp"}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium text-text">{formatCurrency(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamento de lazer</CardTitle>
          </CardHeader>
          {snap.leisureBudget <= 0 ? (
            <p className="text-sm text-text-faint">
              Defina um limite mensal de lazer em Configurações para a Aura acompanhar.
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-text-muted">
                {formatCurrency(snap.leisureSpent)} de {formatCurrency(snap.leisureBudget)}
              </p>
              <ProgressBar
                value={(snap.leisureSpent / snap.leisureBudget) * 100}
                tone={snap.leisureSpent > snap.leisureBudget ? "danger" : "lilac"}
              />
              <p className="mt-2 text-xs text-text-faint">
                {snap.leisureSpent > snap.leisureBudget
                  ? `Estourou em ${formatCurrency(snap.leisureSpent - snap.leisureBudget)}`
                  : `Restam ${formatCurrency(snap.leisureBudget - snap.leisureSpent)}`}
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
