import { Trash2 } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { leisureMessage } from "@/lib/aura/insights";
import { formatCurrency, formatDate } from "@/lib/format";
import { createExpenseAction, deleteExpenseAction } from "@/actions/expenses";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "lazer", label: "Lazer" },
  { value: "compras", label: "Compras" },
  { value: "outros", label: "Outros" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function GastosPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);
  const leisureWarning = leisureMessage(snap.leisureBudget, snap.leisureSpent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Gastos</h1>
        <p className="text-sm text-text-muted">Lançamentos do mês atual do casal.</p>
      </div>

      {leisureWarning && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-5 py-3 text-sm font-medium text-warning">
          {leisureWarning}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Novo gasto</CardTitle>
          </CardHeader>
          <form action={createExpenseAction} className="space-y-4">
            <Field label="Descrição" htmlFor="description">
              <Input id="description" name="description" placeholder="Ex: Mercado" required />
            </Field>
            <Field label="Valor (R$)" htmlFor="amount">
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0,00" required />
            </Field>
            <Field label="Categoria" htmlFor="category">
              <Select id="category" name="category" defaultValue="alimentacao">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Pessoa" htmlFor="userId">
              <Select id="userId" name="userId" defaultValue={user.id}>
                {snap.couple.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data" htmlFor="date">
              <Input id="date" name="date" type="date" defaultValue={todayISO()} required />
            </Field>
            <Button type="submit" className="w-full">
              Adicionar gasto
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lançamentos</CardTitle>
            <Badge tone="lilac">Total: {formatCurrency(snap.monthExpensesTotal)}</Badge>
          </CardHeader>
          {snap.expenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">Nenhum gasto lançado ainda este mês.</p>
          ) : (
            <ul className="divide-y divide-border">
              {snap.expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{e.description}</p>
                    <p className="text-xs text-text-faint">
                      {e.user.name} · {CATEGORIES.find((c) => c.value === e.category)?.label} · {formatDate(e.date)}
                      {e.source === "whatsapp" && " · via WhatsApp"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-text">{formatCurrency(e.amount)}</span>
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="text-text-faint transition-colors hover:text-danger"
                        aria-label="Excluir gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
