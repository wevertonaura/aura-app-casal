type Money = number | string | { toString(): string };

function toNumber(value: Money): number {
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function formatCurrency(value: Money): string {
  return toNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function toNumberValue(value: Money): number {
  return toNumber(value);
}

/** "vence hoje" / "vence amanhã" / "vence em 3 dias" / "venceu há 2 dias". */
export function formatDueLabel(daysUntilDue: number): string {
  if (daysUntilDue === 0) return "vence hoje";
  if (daysUntilDue === 1) return "vence amanhã";
  if (daysUntilDue > 1) return `vence em ${daysUntilDue} dias`;
  const late = Math.abs(daysUntilDue);
  return `venceu há ${late} ${late === 1 ? "dia" : "dias"}`;
}

/** "05 SET" — usado em listas de histórico compactas. */
export function formatDayMonthShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  return `${day} ${month}`;
}
