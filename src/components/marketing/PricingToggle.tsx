"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";

const MONTHLY = 59.9;
const ANNUAL_MONTHLY = 39.9;

const FEATURES = [
  "Casal completo — vocês dois no mesmo painel",
  "Gastos, contas fixas, dívidas e sonhos ilimitados",
  "Aura pelo WhatsApp, sem app extra pra abrir",
  "Orçamento de lazer com alertas automáticos",
  "Mensagens da Aura sobre o orçamento do mês",
];

export function PricingToggle() {
  const [annual, setAnnual] = useState(true);
  const price = annual ? ANNUAL_MONTHLY : MONTHLY;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", !annual ? "bg-surface text-text" : "text-text-faint")}
        >
          Mensal
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={cn("flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors", annual ? "bg-surface text-text" : "text-text-faint")}
        >
          Anual
          <span className="rounded-full bg-lilac/20 px-2 py-0.5 text-[10px] font-semibold text-lilac">-33%</span>
        </button>
      </div>

      <div className="card-glass glow-lilac p-8 text-center">
        <p className="text-sm font-medium text-text-muted">Aura Casal</p>
        <div className="my-4 flex items-end justify-center gap-1">
          <span className="font-display text-4xl font-semibold text-text">{formatCurrency(price)}</span>
          <span className="mb-1 text-sm text-text-faint">/mês</span>
        </div>
        {annual && <p className="mb-4 text-xs text-text-faint">Cobrado anualmente</p>}

        <ul className="mb-6 space-y-2.5 text-left text-sm text-text-muted">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-lilac" />
              {f}
            </li>
          ))}
        </ul>

        <LinkButton href="/signup" className="w-full">
          Começar agora
        </LinkButton>
        <p className="mt-3 text-xs text-text-faint">14 dias de garantia · cancele quando quiser</p>
      </div>
    </div>
  );
}
