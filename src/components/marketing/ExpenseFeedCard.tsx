const TRANSACTIONS = [
  { name: "Mercado Extra", category: "Alimentação", value: "R$ 186,40" },
  { name: "Uber", category: "Transporte", value: "R$ 24,90" },
  { name: "Academia", category: "Saúde", value: "R$ 129,90" },
  { name: "Netflix", category: "Assinatura", value: "R$ 39,90" },
  { name: "Posto Ipiranga", category: "Transporte", value: "R$ 210,00" },
  { name: "Farmácia São João", category: "Saúde", value: "R$ 67,30" },
];

// Lista duplicada para o loop vertical ficar contínuo (sem "salto" no fim).
const FEED = [...TRANSACTIONS, ...TRANSACTIONS];

export function ExpenseFeedCard() {
  return (
    <div className="card-glass mx-auto w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-faint">Fatura do casal · setembro</p>
          <p className="font-display text-2xl font-semibold text-text">R$ 1.847,30</p>
          <p className="mt-0.5 text-xs text-success">+12% em relação ao mês anterior</p>
        </div>
        <span className="rounded-full border border-border-strong bg-surface-hover px-2.5 py-1 text-[10px] font-medium text-text-muted">
          final 4416
        </span>
      </div>

      <div className="relative h-[260px] overflow-hidden px-5 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee-vertical flex flex-col py-2">
          {FEED.map((t, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-border py-3.5 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{t.name}</p>
                <p className="text-xs text-text-faint">{t.category}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-text">{t.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-5 py-3 text-center text-[11px] text-text-faint">
        Atualizado sozinho a cada compra no cartão
      </div>
    </div>
  );
}
