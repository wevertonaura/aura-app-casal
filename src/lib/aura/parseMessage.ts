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

function findAmount(text: string): number | null {
  const match = text.match(/r\$\s*([\d.]*\d(?:,\d{1,2})?)/i) ?? text.match(/(\d+(?:[.,]\d{1,2})?)\s*reais/i);
  if (!match) return null;
  const raw = match[1].replace(/\./g, "").replace(",", ".");
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
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
    .replace(/(gastei|paguei)\s*r?\$?\s*[\d.,]*\s*/i, "")
    .replace(/comprei\s*/i, "")
    .replace(/^(no|na|em|do|da|de)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  return noPrefix ? noPrefix.charAt(0).toUpperCase() + noPrefix.slice(1) : "Gasto via WhatsApp";
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

  return { type: "unknown", raw: text };
}
