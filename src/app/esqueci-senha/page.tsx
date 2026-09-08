"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card-glass w-full max-w-sm p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
          <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
        </Link>

        {state?.sent ? (
          <>
            <h1 className="mb-1 font-display text-xl font-semibold text-text">Verifique seu e-mail</h1>
            <p className="text-sm text-text-muted">
              Se existir uma conta com esse e-mail, mandamos um link pra redefinir a senha. Ele vale por 1 hora.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 font-display text-xl font-semibold text-text">Esqueci minha senha</h1>
            <p className="mb-6 text-sm text-text-muted">
              Informe o e-mail da sua conta — vamos mandar um link pra você escolher uma nova senha.
            </p>

            <form action={formAction} className="space-y-4">
              <Field label="E-mail" htmlFor="email">
                <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
              </Field>
              {state?.error && <p className="text-sm text-danger">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Enviando..." : "Enviar link de recuperação"}
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
