"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { simulateWhatsappAction } from "@/actions/whatsapp";

const SUGGESTIONS = [
  "Aura, gastei R$ 80 no mercado.",
  "Aura, comprei um celular em 10x de R$ 350.",
  "Aura, quanto ainda posso gastar esse mês?",
  "Aura, quero criar uma meta de R$ 2.800 para viajar em dezembro.",
  "Aura, quanto temos de dívida?",
  "Aura, paguei R$ 200 no empréstimo pessoal.",
];

async function submit(_prev: null, formData: FormData) {
  await simulateWhatsappAction(formData);
  return null;
}

export function SimulateChat() {
  const [, formAction, pending] = useActionState(submit, null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pending) formRef.current?.reset();
  }, [pending]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = s;
                inputRef.current.focus();
              }
            }}
            className="rounded-full border border-border-strong bg-bg-elevated px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-lilac/50 hover:text-text"
          >
            {s}
          </button>
        ))}
      </div>
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input
          ref={inputRef}
          name="text"
          placeholder='Simular mensagem, ex: "Aura, gastei R$ 50 no uber"'
          required
          className="flex-1 rounded-full border border-border-strong bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-faint outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
