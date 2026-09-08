"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card-glass w-full max-w-sm p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
          <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
        </Link>

        {!token ? (
          <>
            <h1 className="mb-1 font-display text-xl font-semibold text-text">Link inválido</h1>
            <p className="text-sm text-text-muted">
              Esse link de recuperação está incompleto.{" "}
              <Link href="/esqueci-senha" className="text-lilac hover:underline">
                Peça um novo aqui
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 font-display text-xl font-semibold text-text">Escolha uma nova senha</h1>
            <p className="mb-6 text-sm text-text-muted">Sua senha precisa ter pelo menos 6 caracteres.</p>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <Field label="Nova senha" htmlFor="password">
                <Input id="password" name="password" type="password" placeholder="••••••" required minLength={6} />
              </Field>
              {state?.error && <p className="text-sm text-danger">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Salvando..." : "Redefinir senha"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/login" className="text-lilac hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
