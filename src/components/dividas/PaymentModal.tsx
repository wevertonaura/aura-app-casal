"use client";

import { useTransition, useState } from "react";
import { X, Wallet, CalendarDays } from "lucide-react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function PaymentModal({
  debtName,
  debtId,
  onSubmit,
  onClose,
}: {
  debtName: string;
  debtId: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    startTransition(async () => {
      await onSubmit(formData);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-text/30 backdrop-blur-[2px]"
      />

      <div className="card-glass relative w-full max-w-sm p-6">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold text-text">Registrar pagamento</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-text-faint transition-colors hover:bg-surface-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-text-muted">
          Dívida: <span className="font-medium text-text">{debtName}</span>
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="debtId" value={debtId} />
          <Field label="Valor do pagamento (R$)" htmlFor="amount">
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="500,00" required autoFocus className="pl-9" />
            </div>
          </Field>
          <Field label="Data" htmlFor="date">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
              <Input id="date" name="date" type="date" defaultValue={today} required className="pl-9" />
            </div>
          </Field>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Registrando..." : "Registrar pagamento"}
          </Button>
        </form>
      </div>
    </div>
  );
}
