"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";

type PlanKey = "individual" | "casal";

const PLANS: Record<
  PlanKey,
  {
    name: string;
    monthly: number;
    annualMonthly: number;
    annualBadge: string | null;
    features: string[];
    highlight: boolean;
  }
> = {
  individual: {
    name: "Individual",
    monthly: 39.9,
    annualMonthly: 29.9,
    annualBadge: "Oferta de lançamento · 100 primeiras vagas",
    features: [
      "Você organiza sozinho(a), sem precisar de parceiro(a)",
      "Gastos, contas fixas, dívidas e sonhos ilimitados",
      "Aura pelo WhatsApp, sem app extra pra abrir",
      "Orçamento de lazer com alertas automáticos",
    ],
    highlight: false,
  },
  casal: {
    name: "Casal",
    monthly: 59.9,
    annualMonthly: 39.9,
    annualBadge: null,
    features: [
      "Casal completo — vocês dois no mesmo painel",
      "Renda conjunta e divisão de gastos por pessoa",
      "Gastos, contas fixas, dívidas e sonhos ilimitados",
      "Aura pelo WhatsApp, sem app extra pra abrir",
      "Orçamento de lazer com alertas automáticos",
    ],
    highlight: true,
  },
};

export function PricingToggle() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-center gap-3">
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

      <div className="grid gap-5 sm:grid-cols-2">
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const plan = PLANS[key];
          const price = annual ? plan.annualMonthly : plan.monthly;
          const showBadge = annual && plan.annualBadge;

          return (
            <div
              key={key}
              className={cn("card-glass flex flex-col p-8 text-center", plan.highlight && "glow-lilac border-lilac/40")}
            >
              <p className="text-sm font-medium text-text-muted">Aura {plan.name}</p>
              <div className="my-4 flex items-end justify-center gap-1">
                <span className="font-display text-4xl font-semibold text-text">{formatCurrency(price)}</span>
                <span className="mb-1 text-sm text-text-faint">/mês</span>
              </div>

              <div className="mb-4 min-h-[38px]">
                {annual && <p className="text-xs text-text-faint">Cobrado 12x</p>}
                {showBadge && (
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                    <Sparkles className="h-3 w-3" /> {plan.annualBadge}
                  </p>
                )}
              </div>

              <ul className="mb-6 flex-1 space-y-2.5 text-left text-sm text-text-muted">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lilac" />
                    {f}
                  </li>
                ))}
              </ul>

              <LinkButton href="/signup" variant={plan.highlight ? "primary" : "secondary"} className="w-full">
                Começar agora
              </LinkButton>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-text-faint">14 dias de garantia · cancele quando quiser</p>
    </div>
  );
}
