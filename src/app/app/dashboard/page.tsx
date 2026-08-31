import { Wallet, CalendarClock, Receipt, Landmark, Sparkles, PiggyBank } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { auraDashboardMessage } from "@/lib/aura/insights";
import { formatCurrency, formatDate, formatMonthYear, toNumberValue } from "@/lib/format";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SpendingDonut, type BreakdownSegment } from "@/components/dashboard/SpendingDonut";
import { CoupleSplit, type SplitPerson } from "@/components/dashboard/CoupleSplit";
import { categoryLabel } from "@/lib/categories";

// Paleta categórica validada pro modo claro (ordem fixa, nunca ciclada — ver skill de dataviz)
const BREAKDOWN_COLORS = {
  fixedBills: "#2a78d6",
  debts: "#eb6834",
  alimentacao: "#1baf7a",
  transporte: "#eda100",
  lazer: "#e87ba4",
  compras: "#4a3aa7",
  outros: "#008300",
} as const;

// Só as 5 categorias padrão viram fatia própria no gráfico do dashboard —
// categorias criadas pelo casal (nome livre) entram na fatia "Outros" pra
// não estourar o limite de cores validado. A lista completa continua
// aparecendo normalmente em Gastos.
const KNOWN_CATEGORY_KEYS = new Set(["alimentacao", "transporte", "lazer", "compras", "outros"]);

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

  const expenseByCategory: Record<string, number> = {};
  for (const e of snap.expenses) {
    // categorias customizadas somam em "outros" no gráfico (ver KNOWN_CATEGORY_KEYS acima)
    const key = KNOWN_CATEGORY_KEYS.has(e.category) ? e.category : "outros";
    expenseByCategory[key] = (expenseByCategory[key] ?? 0) + toNumberValue(e.amount);
  }

  const expensesByUser: Record<string, number> = {};
  for (const e of snap.expenses) {
    expensesByUser[e.userId] = (expensesByUser[e.userId] ?? 0) + toNumberValue(e.amount);
  }
  const splitPeople: SplitPerson[] = snap.couple.users.map((u, idx) => {
    const income = toNumberValue(u.monthlyIncome);
    const paid = expensesByUser[u.id] ?? 0;
    return {
      id: u.id,
      name: u.name,
      color: idx === 0 ? "var(--lilac)" : "var(--marsala)",
      income,
      incomePct: snap.coupleIncome > 0 ? (income / snap.coupleIncome) * 100 : 0,
      paid,
      paidPct: snap.monthExpensesTotal > 0 ? (paid / snap.monthExpensesTotal) * 100 : 0,
    };
  });

  const breakdownSegments: BreakdownSegment[] = [
    { key: "fixedBills", label: "Contas fixas", color: BREAKDOWN_COLORS.fixedBills, value: snap.fixedBillsTotal },
    { key: "debts", label: "Dívidas", color: BREAKDOWN_COLORS.debts, value: snap.debtsMonthlyTotal },
    { key: "alimentacao", label: "Alimentação", color: BREAKDOWN_COLORS.alimentacao, value: expenseByCategory.alimentacao ?? 0 },
    { key: "transporte", label: "Transporte", color: BREAKDOWN_COLORS.transporte, value: expenseByCategory.transporte ?? 0 },
    { key: "lazer", label: "Lazer", color: BREAKDOWN_COLORS.lazer, value: expenseByCategory.lazer ?? 0 },
    { key: "compras", label: "Compras", color: BREAKDOWN_COLORS.compras, value: expenseByCategory.compras ?? 0 },
    { key: "outros", label: "Outros", color: BREAKDOWN_COLORS.outros, value: expenseByCategory.outros ?? 0 },
  ].filter((s) => s.value > 0);

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
            <CardTitle>Para onde vai o dinheiro</CardTitle>
            <Badge tone="lilac">{formatMonthYear(new Date())}</Badge>
          </CardHeader>
          <SpendingDonut segments={breakdownSegments} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quem está pagando</CardTitle>
          </CardHeader>
          {splitPeople.length < 2 ? (
            <p className="text-sm text-text-faint">
              Assim que o parceiro(a) entrar no casal, a divisão aparece aqui.
            </p>
          ) : (
            <CoupleSplit people={splitPeople} />
          )}
        </Card>
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
                      {e.user.name} · {categoryLabel(e.category)} · {formatDate(e.date)}
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
