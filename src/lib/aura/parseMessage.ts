/**
 * Parser de intenção "mock" para as mensagens do WhatsApp.
 *
 * Hoje é baseado em regras (regex/palavras-chave) para o MVP funcionar
 * de ponta a ponta sem depender de uma API de IA paga. A interface
 * (`parseAuraMessage(text) => AuraIntent`) foi desenhada para ser
 * substituída por uma chamada a um modelo de linguagem real no futuro —
 * só troca a implementação desta função, o resto do fluxo continua igual.
 */

export type ExpenseCategoryGuess = "alimentacao" | "transporte" | "lazer" | "compras" | "outros";

export type AuraIntent =
  | { type: "add_expense"; amount: number; description: string; category: ExpenseCategoryGuess }
  | { type: "add_installment_bill"; amount: number; installments: number; description: string }
  | { type: "pay_debt"; amount: number; debtQuery: string }
  | { type: "create_debt"; totalAmount: number; monthlyPayment: number; name: string }
  | { type: "create_goal"; amount: number; name: string; targetDate: Date | null }
  | { type: "query_leisure_budget" }
  | { type: "query_debts" }
  | { type: "query_balance" }
  | { type: "query_expenses" }
  | { type: "unknown"; raw: string };

const MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const CATEGORY_KEYWORDS: Record<ExpenseCategoryGuess, string[]> = {
  alimentacao: ["mercado", "supermercado", "restaurante", "ifood", "padaria", "lanche", "almoço", "almoco", "janta", "comida"],
  transporte: ["uber", "99", "gasolina", "combustível", "combustivel", "ônibus", "onibus", "taxi", "táxi", "carro", "posto"],
  lazer: ["cinema", "bar", "show", "viagem", "balada", "streaming", "netflix", "passeio", "festa"],
  compras: ["roupa", "loja", "shopping", "tênis", "tenis", "celular", "eletrônico", "eletronico"],
  outros: [],
};

function parseAmountToken(raw: string): number {
  const value = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

function findAmount(text: string): number | null {
  const match =
    text.match(/r\$\s*([\d.]*\d(?:,\d{1,2})?)/i) ??
    text.match(/(\d+(?:[.,]\d{1,2})?)\s*reais/i) ??
    // último recurso: um número solto (ex: "paguei 1200 da minha dívida",
    // sem "R$" nem "reais" junto) — os pontos de chamada já são
    // suficientemente específicos (verbo + palavra-chave) pra isso não
    // pegar número errado com frequência.
    text.match(/\b(\d+(?:[.,]\d{1,2})?)\b/);
  if (!match) return null;
  const value = parseAmountToken(match[1]);
  return value > 0 ? value : null;
}

function guessCategory(text: string): ExpenseCategoryGuess {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ExpenseCategoryGuess, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "outros";
}

function guessDescription(text: string): string {
  const lower = text.toLowerCase();
  const noPrefix = lower
    .replace(/^aura,?\s*/i, "")
    .replace(/(gastei|paguei)\s*/i, "")
    .replace(/comprei\s*/i, "")
    // valor em qualquer formato ("R$ 80", "80 reais" ou só "80") — cobre
    // tanto "gastei 80 reais no mercado" quanto "80 reais no mercado" sem
    // verbo nenhum.
    .replace(/r\$\s*[\d.,]+\s*/i, "")
    .replace(/\d+(?:[.,]\d{1,2})?\s*reais\s*/i, "")
    .replace(/\d+(?:[.,]\d{1,2})?\s*/, "")
    .replace(/^(no|na|em|do|da|de)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  return noPrefix ? noPrefix.charAt(0).toUpperCase() + noPrefix.slice(1) : "Gasto via WhatsApp";
}

// Palavras que indicam "isso é um pagamento de dívida", não um gasto normal.
const DEBT_PAYMENT_VERBS = /paguei|abati|abatir|quitei|amortizei/i;
const DEBT_KEYWORDS = /d[íi]vida|cart[ãa]o|empr[ée]stimo|financiamento/i;

function guessDebtQuery(text: string): string {
  const lower = text.toLowerCase();
  return lower
    .replace(/^aura,?\s*/i, "")
    .replace(/(paguei|abati|quitei|amortizei)\s*r?\$?\s*[\d.,]*\s*/i, "")
    .replace(/^(no|na|em|do|da|de|para)\s+/i, "")
    .replace(/^(a\s+)?d[íi]vida\s+(do|da|de)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
}

function findTargetDate(text: string): Date | null {
  const lower = text.toLowerCase();
  for (const [name, monthIndex] of Object.entries(MONTHS)) {
    if (lower.includes(name)) {
      const now = new Date();
      let year = now.getFullYear();
      if (monthIndex < now.getMonth()) year += 1;
      return new Date(year, monthIndex + 1, 0); // último dia do mês alvo
    }
  }
  return null;
}

export function parseAuraMessage(rawText: string): AuraIntent {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Compra parcelada: "comprei um celular em 10x de R$ 350"
  const installmentMatch = lower.match(/em\s*(\d{1,2})\s*x/i);
  if (installmentMatch && /compr/i.test(lower)) {
    const amount = findAmount(text) ?? 0;
    return {
      type: "add_installment_bill",
      amount,
      installments: Number(installmentMatch[1]),
      description: guessDescription(text),
    };
  }

  // Meta/sonho: "quero criar uma meta de R$ 2.800 para viajar em dezembro"
  if (/(meta|sonho)/i.test(lower) && /(criar|quero|nova)/i.test(lower)) {
    const amount = findAmount(text) ?? 0;
    const targetDate = findTargetDate(text);
    const cleaned = lower.replace(/[.!?]+$/, "");
    const paraMatch = cleaned.match(/para\s+(.+)/i);
    let name = "Novo sonho";
    if (paraMatch) {
      const monthNames = Object.keys(MONTHS).join("|");
      const candidate = paraMatch[1].replace(new RegExp(`\\s+em\\s+(${monthNames})$`, "i"), "").trim();
      if (candidate) name = candidate;
    }
    return {
      type: "create_goal",
      amount,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      targetDate,
    };
  }

  // Consultas
  if (/dívida|divida/i.test(lower) && /quant/i.test(lower)) {
    return { type: "query_debts" };
  }
  if (/lazer/i.test(lower) && /quant/i.test(lower)) {
    return { type: "query_leisure_budget" };
  }
  if (/quanto.*(posso gastar|ainda posso|resta|sobrando|saldo)/i.test(lower)) {
    return { type: "query_balance" };
  }
  if (/quanto.*gast/i.test(lower)) {
    return { type: "query_expenses" };
  }

  // Nova dívida: "coloca 1000 reais, vou pagar 100 por mês" / "tenho uma
  // dívida de 3000, pago 500 por mês" — dois valores na frase, o segundo
  // com "por mês" junto. Verbo de pagamento (paguei/abati/...) tem
  // prioridade e é checado depois, então uma frase no passado não cai aqui.
  const monthlyMatch = lower.match(/(?:pagar|pago|pagando)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais\s*)?\s*(?:por\s*m[êe]s|\/\s*m[êe]s|mensa(?:is|l))/i);
  if (monthlyMatch && !DEBT_PAYMENT_VERBS.test(lower)) {
    const monthlyPayment = parseAmountToken(monthlyMatch[1]);
    const totalAmount = findAmount(text.slice(0, monthlyMatch.index));
    if (totalAmount !== null && monthlyPayment > 0 && totalAmount !== monthlyPayment) {
      // Só pega o nome se vier antes de qualquer número — evita capturar o
      // valor junto (ex: "dívida de cartão de 1000 reais" → só "cartão").
      const nameMatch = lower.match(/d[íi]vida\s+(?:do|da|de)\s+([a-zà-ú\s]+?)(?:\s*\d|,|\.|$)/i);
      const name = nameMatch ? nameMatch[1].trim().replace(/\s+(de|do|da)$/i, "") : "Dívida via WhatsApp";
      return {
        type: "create_debt",
        totalAmount,
        monthlyPayment,
        name: name.charAt(0).toUpperCase() + name.slice(1),
      };
    }
  }

  // Pagamento de dívida: "paguei 200 no cartão nubank" / "abati 300 da dívida do carro"
  if (DEBT_PAYMENT_VERBS.test(lower) && DEBT_KEYWORDS.test(lower)) {
    const amount = findAmount(text);
    if (amount !== null) {
      return { type: "pay_debt", amount, debtQuery: guessDebtQuery(text) };
    }
  }

  // Gasto simples: "gastei R$ 80 no mercado" / "paguei 45 no uber"
  if (/gastei|paguei|comprei/i.test(lower)) {
    const amount = findAmount(text);
    if (amount !== null) {
      return {
        type: "add_expense",
        amount,
        description: guessDescription(text),
        category: guessCategory(text),
      };
    }
  }

  // Último recurso: só "valor + lugar", sem verbo nenhum (ex: "80 reais no
  // mercado"). Só entra aqui se nada acima bateu — ou seja, não é consulta,
  // não é dívida, não é meta — então um valor solto quase sempre é um gasto.
  const bareAmount = findAmount(text);
  if (bareAmount !== null) {
    return {
      type: "add_expense",
      amount: bareAmount,
      description: guessDescription(text),
      category: guessCategory(text),
    };
  }

  return { type: "unknown", raw: text };
}
