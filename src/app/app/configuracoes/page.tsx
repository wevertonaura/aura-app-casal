import { requireCoupleUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { updateProfileAction } from "@/actions/settings";
import { updateLeisureBudgetAction } from "@/actions/couple";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";

export default async function ConfiguracoesPage() {
  const user = await requireCoupleUser();
  const couple = await db.couple.findUniqueOrThrow({
    where: { id: user.coupleId! },
    include: { users: true },
  });
  const coupleIncome = couple.users.reduce((sum, u) => sum + Number(u.monthlyIncome), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Configurações</h1>
        <p className="text-sm text-text-muted">Perfil, renda e preferências do casal.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seu perfil</CardTitle>
          </CardHeader>
          <form action={updateProfileAction} className="space-y-4">
            <Field label="Nome" htmlFor="name">
              <Input id="name" name="name" defaultValue={user.name} required />
            </Field>
            <Field label="Sua renda mensal (R$)" htmlFor="monthlyIncome">
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(user.monthlyIncome)}
              />
            </Field>
            <Button type="submit">Salvar perfil</Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamento de lazer</CardTitle>
          </CardHeader>
          <form action={updateLeisureBudgetAction} className="space-y-4">
            <Field label="Limite mensal de lazer (R$)" htmlFor="leisureBudget">
              <Input
                id="leisureBudget"
                name="leisureBudget"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(couple.leisureBudget)}
              />
            </Field>
            <Button type="submit">Salvar limite</Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convidar parceiro(a)</CardTitle>
          </CardHeader>
          <p className="mb-3 text-sm text-text-muted">
            Compartilhe este código para seu parceiro(a) entrar no casal.
          </p>
          <div className="flex items-center justify-between rounded-xl border border-border-strong bg-bg-elevated px-4 py-3">
            <span className="font-display text-lg font-semibold tracking-widest text-lilac">{couple.inviteCode}</span>
            <CopyButton value={couple.inviteCode} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Renda do casal</CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-sm">
            {couple.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-text-muted">
                <span>{u.name}</span>
                <span className="font-medium text-text">{formatCurrency(Number(u.monthlyIncome))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-text">
            <span>Total</span>
            <span>{formatCurrency(coupleIncome)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
