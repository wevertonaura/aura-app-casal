/**
 * Mensagem da Aura no dashboard: compara o que já foi comprometido
 * (contas fixas + gastos do mês) com a renda do casal e devolve um
 * aviso curto, no tom da assistente.
 */
export function auraDashboardMessage(params: {
  coupleIncome: number;
  fixedBillsTotal: number;
  monthExpenses: number;
  leisureBudget: number;
  leisureSpent: number;
}): { tone: "success" | "warning" | "danger"; text: string } {
  const { coupleIncome, fixedBillsTotal, monthExpenses, leisureBudget, leisureSpent } = params;
  const committed = fixedBillsTotal + monthExpenses;
  const available = coupleIncome - committed;

  if (coupleIncome > 0 && committed > coupleIncome) {
    return {
      tone: "danger",
      text: `⚠️ Vocês já comprometeram ${formatPct(committed, coupleIncome)}% da renda do mês — estão gastando mais do que ganham.`,
    };
  }

  if (leisureBudget > 0 && leisureSpent > leisureBudget) {
    return {
      tone: "warning",
      text: `⚠️ O orçamento de lazer estourou este mês. Vale reduzir os próximos gastos com lazer.`,
    };
  }

  if (coupleIncome > 0 && committed / coupleIncome >= 0.85) {
    return {
      tone: "warning",
      text: `⚠️ Vocês estão gastando mais do que o planejado este mês. Sobram apenas ${formatMoneyShort(available)} até o fim do mês.`,
    };
  }

  if (coupleIncome === 0) {
    return {
      tone: "warning",
      text: "👋 Cadastre a renda de vocês em Configurações para a Aura começar a acompanhar o orçamento.",
    };
  }

  return {
    tone: "success",
    text: "🟢 Este mês vocês estão dentro do orçamento. Continuem assim!",
  };
}

function formatPct(part: number, total: number): string {
  if (total <= 0) return "0";
  return Math.round((part / total) * 100).toString();
}

function formatMoneyShort(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function leisureMessage(leisureBudget: number, leisureSpent: number): string | null {
  if (leisureBudget <= 0) return null;
  const remaining = leisureBudget - leisureSpent;
  if (remaining < 0) {
    return `⚠️ O orçamento de lazer estourou em ${formatMoneyShort(Math.abs(remaining))} este mês.`;
  }
  return `⚠️ Restam ${formatMoneyShort(remaining)} do orçamento de lazer este mês.`;
}
