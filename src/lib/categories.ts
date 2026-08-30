/**
 * As 5 categorias padrão de gasto. Casais podem criar categorias extras na
 * aba Gastos (guardadas em `Category`, ligadas ao casal) — essas usam o
 * próprio nome digitado como valor, então `categoryLabel` só precisa de um
 * mapa para as padrão e cai no valor cru para as customizadas.
 */
export const DEFAULT_EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "lazer", label: "Lazer" },
  { value: "compras", label: "Compras" },
  { value: "outros", label: "Outros" },
];

const DEFAULT_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
);

export function categoryLabel(value: string): string {
  return DEFAULT_LABELS[value] ?? value;
}

/** Valor sentinela usado no <select> de categoria pra sinalizar "criar uma nova". */
export const NEW_CATEGORY_VALUE = "__nova__";
