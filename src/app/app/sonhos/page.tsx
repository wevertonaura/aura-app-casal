import { Trash2 } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { createGoalAction, deleteGoalAction } from "@/actions/goals";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function SonhosPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Sonhos</h1>
        <p className="text-sm text-text-muted">
          {snap.couple.mode === "individual" ? "Seus objetivos financeiros." : "Objetivos financeiros do casal."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Novo sonho</CardTitle>
          </CardHeader>
          <form action={createGoalAction} className="space-y-4">
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" placeholder="Ex: Viagem" required />
            </Field>
            <Field label="Valor alvo (R$)" htmlFor="targetAmount">
              <Input id="targetAmount" name="targetAmount" type="number" step="0.01" min="0.01" placeholder="2800" required />
            </Field>
            <Field label="Já guardado (R$)" htmlFor="savedAmount">
              <Input id="savedAmount" name="savedAmount" type="number" step="0.01" min="0" placeholder="0" defaultValue={0} />
            </Field>
            <Field label="Data alvo" htmlFor="targetDate">
              <Input id="targetDate" name="targetDate" type="date" required />
            </Field>
            <Button type="submit" className="w-full">
              Criar sonho
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {snap.goals.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm text-text-faint">Nenhum sonho cadastrado ainda.</p>
            </Card>
          ) : (
            snap.goals.map((goal) => (
              <Card key={goal.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-text">{goal.name}</h3>
                    <p className="text-xs text-text-faint">Até {formatMonthYear(goal.targetDate)}</p>
                  </div>
                  <form action={deleteGoalAction}>
                    <input type="hidden" name="id" value={goal.id} />
                    <button type="submit" className="text-text-faint transition-colors hover:text-danger" aria-label="Excluir sonho">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                <p className="mb-2 text-sm text-text-muted">
                  {formatCurrency(goal.savedAmount)} de {formatCurrency(goal.targetAmount)}
                </p>
                <ProgressBar value={goal.progress.progressPct} />
                <p className="mt-2 text-xs text-text-faint">
                  Guardem ~{formatCurrency(goal.progress.monthly)}/mês para chegar lá ({goal.progress.monthsLeft}{" "}
                  {goal.progress.monthsLeft === 1 ? "mês restante" : "meses restantes"})
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
