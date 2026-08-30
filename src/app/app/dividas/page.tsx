import { Trash2 } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { createDebtAction, deleteDebtAction } from "@/actions/debts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function DividasPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Dívidas</h1>
        <p className="text-sm text-text-muted">O que o casal deve e o plano para quitar.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova dívida</CardTitle>
          </CardHeader>
          <form action={createDebtAction} className="space-y-4">
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" placeholder="Ex: Empréstimo pessoal" required />
            </Field>
            <Field label="Valor total (R$)" htmlFor="totalAmount">
              <Input id="totalAmount" name="totalAmount" type="number" step="0.01" min="0.01" placeholder="15000" required />
            </Field>
            <Field label="Pagamento planejado por mês (R$)" htmlFor="monthlyPayment">
              <Input id="monthlyPayment" name="monthlyPayment" type="number" step="0.01" min="0.01" placeholder="500" required />
            </Field>
            <Button type="submit" className="w-full">
              Adicionar dívida
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dívidas cadastradas</CardTitle>
            <Badge tone="lilac">Total: {formatCurrency(snap.debtsTotal)}</Badge>
          </CardHeader>
          {snap.debts.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">Vocês não têm dívidas cadastradas. 🎉</p>
          ) : (
            <ul className="divide-y divide-border">
              {snap.debts.map((debt) => (
                <li key={debt.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{debt.name}</p>
                    <p className="text-xs text-text-faint">
                      {formatCurrency(debt.monthlyPayment)}/mês
                      {debt.payoffMonths && ` · quita em ~${debt.payoffMonths} meses`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-text">{formatCurrency(debt.totalAmount)}</span>
                    <form action={deleteDebtAction}>
                      <input type="hidden" name="id" value={debt.id} />
                      <button type="submit" className="text-text-faint transition-colors hover:text-danger" aria-label="Excluir dívida">
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
