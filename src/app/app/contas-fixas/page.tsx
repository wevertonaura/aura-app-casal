import { Trash2, Bell } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { createFixedBillAction, deleteFixedBillAction, updateFixedBillDueDayAction } from "@/actions/fixedBills";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DueDayField } from "@/components/contas-fixas/DueDayField";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "aluguel", label: "Aluguel" },
  { value: "agua", label: "Água" },
  { value: "luz", label: "Luz" },
  { value: "internet", label: "Internet" },
  { value: "academia", label: "Academia" },
  { value: "assinatura", label: "Assinatura" },
  { value: "parcela", label: "Parcela" },
  { value: "outro", label: "Outro" },
];

export default async function ContasFixasPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);
  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Contas fixas</h1>
        <p className="text-sm text-text-muted">
          {snap.couple.mode === "individual" ? "Despesas recorrentes e parcelas." : "Despesas recorrentes e parcelas do casal."}
        </p>
      </div>

      <div className="card-glass flex items-start gap-3 p-4 text-sm text-text-muted">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-lilac" />
        <p>
          A Aura manda um lembrete no WhatsApp de quem estiver conectado <strong className="text-text">3 dias antes</strong> do
          vencimento de cada conta. Defina o dia do vencimento em cada uma abaixo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova conta</CardTitle>
          </CardHeader>
          <form action={createFixedBillAction} className="space-y-4">
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" placeholder="Ex: Aluguel, Celular..." required />
            </Field>
            <Field label="Valor (R$)" htmlFor="amount">
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0,00" required />
            </Field>
            <Field label="Categoria" htmlFor="category">
              <Select id="category" name="category" defaultValue="aluguel">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Dia do vencimento" htmlFor="dueDay">
              <Input id="dueDay" name="dueDay" type="number" min="1" max="31" defaultValue={today} required />
            </Field>
            <Field label="Parcelas (deixe vazio se não for parcelado)" htmlFor="totalInstallments">
              <Input id="totalInstallments" name="totalInstallments" type="number" min="1" placeholder="Ex: 10" />
            </Field>
            <Button type="submit" className="w-full">
              Adicionar conta
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas cadastradas</CardTitle>
            <Badge tone="lilac">Total ativo: {formatCurrency(snap.fixedBillsTotal)}</Badge>
          </CardHeader>
          {snap.fixedBills.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">Nenhuma conta fixa cadastrada ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {snap.fixedBills.map((bill) => (
                <li key={bill.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{bill.name}</p>
                    <p className="text-xs text-text-faint">
                      {CATEGORIES.find((c) => c.value === bill.category)?.label}
                      {bill.installments.total && (
                        <>
                          {" · "}
                          {bill.installments.finished
                            ? "quitado"
                            : `parcela ${bill.installments.current}/${bill.installments.total} · faltam ${bill.installments.remaining}`}
                        </>
                      )}
                      {!bill.installments.total && " · recorrente"}
                    </p>
                    <div className="mt-1">
                      <DueDayField
                        billId={bill.id}
                        dueDay={bill.dueDay}
                        daysUntilDue={bill.daysUntilDue}
                        onUpdate={updateFixedBillDueDayAction}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-text">{formatCurrency(bill.amount)}</span>
                    <form action={deleteFixedBillAction}>
                      <input type="hidden" name="id" value={bill.id} />
                      <button type="submit" className="text-text-faint transition-colors hover:text-danger" aria-label="Excluir conta">
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
