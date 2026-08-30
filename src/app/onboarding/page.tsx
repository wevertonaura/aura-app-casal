import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createCoupleAction } from "@/actions/couple";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { JoinCoupleForm } from "@/components/onboarding/JoinCoupleForm";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.coupleId) redirect("/app/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
            <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-text">
            Olá, {user.name.split(" ")[0]}! Vamos formar o casal.
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Crie um casal novo ou entre com o código que seu parceiro(a) recebeu.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card-glass p-6">
            <h2 className="mb-1 font-display text-base font-semibold text-text">Criar casal</h2>
            <p className="mb-4 text-sm text-text-muted">
              Você recebe um código para convidar seu parceiro(a) depois.
            </p>
            <form action={createCoupleAction} className="space-y-4">
              <Field label="Sua renda mensal (opcional)" htmlFor="monthlyIncome">
                <Input id="monthlyIncome" name="monthlyIncome" type="number" step="0.01" min="0" placeholder="4000" />
              </Field>
              <Button type="submit" className="w-full">
                Criar casal
              </Button>
            </form>
          </div>

          <div className="card-glass p-6">
            <h2 className="mb-1 font-display text-base font-semibold text-text">Entrar com código</h2>
            <p className="mb-4 text-sm text-text-muted">
              Seu parceiro(a) já criou o casal e te passou um código de convite.
            </p>
            <JoinCoupleForm />
          </div>
        </div>
      </div>
    </div>
  );
}
