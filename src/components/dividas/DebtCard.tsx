"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "@/components/dividas/PaymentModal";

export type DebtCardData = {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  paidAmount: number;
  remainingAmount: number;
  progressPct: number;
  remainingPayoffMonths: number;
};

export function DebtCard({
  debt,
  onRegisterPayment,
  onDelete,
}: {
  debt: DebtCardData;
  onRegisterPayment: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const quitado = debt.remainingAmount <= 0;

  return (
    <div className="card-glass card-glass-hover relative p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-display text-base font-semibold text-text">{debt.name}</h3>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Opções"
            className="rounded-lg p-1.5 text-text-faint transition-colors hover:bg-surface-hover hover:text-text"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Fechar menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-sm">
                <form action={onDelete}>
                  <input type="hidden" name="id" value={debt.id} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-2xl font-semibold text-text">{formatCurrency(debt.totalAmount)}</p>
        <p className="text-sm text-text-faint">{formatCurrency(debt.monthlyPayment)}/mês</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-text-faint">Pago</p>
          <p className="font-medium text-success">{formatCurrency(debt.paidAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-text-faint">Restante</p>
          <p className="font-medium text-text">{formatCurrency(debt.remainingAmount)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
          <span>Progresso</span>
          <span className="font-medium text-text">{debt.progressPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={debt.progressPct} tone={quitado ? "success" : "lilac"} />
      </div>

      <p className="mt-3 text-xs text-text-faint">
        {quitado ? "Dívida quitada" : `Previsão de quitação · ~${debt.remainingPayoffMonths} ${debt.remainingPayoffMonths === 1 ? "mês" : "meses"}`}
      </p>

      {!quitado && (
        <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setPaymentOpen(true)}>
          <Wallet className="h-3.5 w-3.5" /> Registrar pagamento
        </Button>
      )}

      {paymentOpen && (
        <PaymentModal
          debtId={debt.id}
          debtName={debt.name}
          onSubmit={onRegisterPayment}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </div>
  );
}
