"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card-glass w-full max-w-sm p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
          <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
        </Link>
        <h1 className="mb-1 font-display text-xl font-semibold text-text">Criar conta</h1>
        <p className="mb-6 text-sm text-text-muted">
          Comece grátis e convide seu parceiro(a) em seguida.
        </p>

        <form action={formAction} className="space-y-4">
          <Field label="Nome" htmlFor="name">
            <Input id="name" name="name" type="text" placeholder="Seu nome" required />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
          </Field>
          <Field label="Senha" htmlFor="password">
            <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          </Field>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-lilac hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
