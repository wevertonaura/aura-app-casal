"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  requestWhatsappCodeAction,
  confirmWhatsappCodeAction,
  resendWhatsappCodeAction,
  cancelWhatsappVerificationAction,
  type WhatsappActionState,
} from "@/actions/whatsapp";

export function WhatsappConnectForm({ pendingNumber }: { pendingNumber: string | null }) {
  const [requestState, requestAction, requestPending] = useActionState<WhatsappActionState, FormData>(
    requestWhatsappCodeAction,
    undefined
  );
  const [confirmState, confirmAction, confirmPending] = useActionState<WhatsappActionState, FormData>(
    confirmWhatsappCodeAction,
    undefined
  );
  const [resendState, resendAction, resendPending] = useActionState<WhatsappActionState, FormData>(
    resendWhatsappCodeAction,
    undefined
  );

  if (pendingNumber) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">
          Mandamos um código de 6 dígitos pro WhatsApp <strong className="text-text">{pendingNumber}</strong>. Cola
          ele aqui embaixo pra confirmar que o número é seu:
        </p>
        <form action={confirmAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Código de verificação" htmlFor="code" className="flex-1">
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              required
              autoFocus
            />
          </Field>
          <Button type="submit" disabled={confirmPending}>
            {confirmPending ? "Confirmando..." : "Confirmar"}
          </Button>
        </form>
        {confirmState?.error && <p className="text-xs text-danger">{confirmState.error}</p>}
        <div className="flex items-center gap-4">
          <form action={resendAction}>
            <button type="submit" disabled={resendPending} className="text-xs text-lilac underline hover:text-lilac-strong disabled:opacity-50">
              {resendPending ? "Reenviando..." : "Reenviar código"}
            </button>
          </form>
          <form action={cancelWhatsappVerificationAction}>
            <button type="submit" className="text-xs text-text-faint underline hover:text-text">
              Usar outro número
            </button>
          </form>
        </div>
        {resendState?.error && <p className="text-xs text-danger">{resendState.error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form action={requestAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Número de WhatsApp" htmlFor="phone" className="flex-1">
          <Input id="phone" name="phone" type="tel" placeholder="+55 11 91234-5678" required />
        </Field>
        <Button type="submit" disabled={requestPending}>
          {requestPending ? "Enviando..." : "Enviar código"}
        </Button>
      </form>
      <p className="text-xs text-text-faint">
        Pode digitar com ou sem o 55 na frente, com ou sem +, espaço, parênteses e traço — a gente entende de
        qualquer jeito. Ex: <span className="text-text-muted">11 91234-5678</span>,{" "}
        <span className="text-text-muted">5511912345678</span> ou{" "}
        <span className="text-text-muted">+55 11 91234-5678</span>.
      </p>
      {requestState?.error && <p className="text-xs text-danger">{requestState.error}</p>}
    </div>
  );
}
