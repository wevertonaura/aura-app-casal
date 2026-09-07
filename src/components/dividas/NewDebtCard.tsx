import { Landmark, DollarSign, CalendarDays, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createDebtAction } from "@/actions/debts";

export function NewDebtCard() {
  return (
    <Card>
      <CardHeader className="mb-1">
        <CardTitle>Adicionar dívida</CardTitle>
      </CardHeader>
      <p className="mb-5 text-sm text-text-muted">Cadastre uma dívida para acompanhar sua quitação.</p>

      <form action={createDebtAction} className="space-y-4">
        <Field label="Nome da dívida" htmlFor="name">
          <div className="relative">
            <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <Input id="name" name="name" placeholder="Ex: Empréstimo pessoal" required className="pl-9" />
          </div>
        </Field>
        <Field label="Valor total (R$)" htmlFor="totalAmount">
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="15000"
              required
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Pagamento mensal (R$)" htmlFor="monthlyPayment">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <Input
              id="monthlyPayment"
              name="monthlyPayment"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="500"
              required
              className="pl-9"
            />
          </div>
        </Field>
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4" /> Adicionar dívida
        </Button>
      </form>
    </Card>
  );
}
