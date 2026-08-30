"use client";

import { useActionState } from "react";
import { joinCoupleAction } from "@/actions/couple";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function JoinCoupleForm() {
  const [state, formAction, pending] = useActionState(joinCoupleAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Código de convite" htmlFor="inviteCode">
        <Input
          id="inviteCode"
          name="inviteCode"
          type="text"
          placeholder="Ex: 39A3C3"
          className="uppercase tracking-widest"
          required
        />
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar no casal"}
      </Button>
    </form>
  );
}
