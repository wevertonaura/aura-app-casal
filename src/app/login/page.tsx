"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const justReset = searchParams.get("redefinida") === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card-glass w-full max-w-sm p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
          <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
        </Link>
        <h1 className="mb-1 font-display text-xl font-semibold text-text">Entrar</h1>
        <p className="mb-6 text-sm text-text-muted">Organize as finanças do casal.</p>

        {justReset && (
          <p className="mb-4 rounded-lg bg-lilac/10 px-3 py-2 text-sm text-lilac">
            Senha redefinida! Entre com a nova senha.
          </p>
        )}

        <form action={formAction} className="space-y-4">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
          </Field>
          <Field label="Senha" htmlFor="password">
            <Input id="password" name="password" type="password" placeholder="••••••" required />
          </Field>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <div className="text-right">
            <Link href="/esqueci-senha" className="text-xs text-text-muted hover:text-lilac hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Não tem conta?{" "}
          <Link href="/signup" className="text-lilac hover:underline">
            Criar conta
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-text-faint">
          Demo: ana@aura.app / 123456
        </p>
      </div>
    </div>
  );
}
