import { toNumberValue } from "@/lib/format";

/**
 * Converte o valor de um <input type="date"> ("AAAA-MM-DD") pra meia-noite
 * no fuso LOCAL, não UTC. `new Date("AAAA-MM-DD")` (parsing nativo do JS)
 * interpreta strings só-de-data como UTC — misturado com startOfMonth/
 * endOfMonth (que usam o fuso local), isso fazia lançamentos do dia 1 do
 * mês sumirem do filtro "mês atual" em fusos atrás de UTC (ex: Brasil).
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function isSameMonth(date: Date, ref = new Date()): boolean {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    (to.getDate() >= from.getDate() ? 0 : -1)
  );
}

/** Parcela atual e restante de uma conta fixa, calculada a partir da data de início. */
export function installmentsInfo(
  startDate: Date,
  totalInstallments: number | null,
  now = new Date()
): { current: number; remaining: number; total: number | null; finished: boolean } {
  if (!totalInstallments) {
    return { current: 0, remaining: 0, total: null, finished: false };
  }
  const elapsed = Math.max(0, monthsBetween(startDate, now)) + 1;
  const current = Math.min(elapsed, totalInstallments);
  const remaining = Math.max(0, totalInstallments - current);
  return { current, remaining, total: totalInstallments, finished: current >= totalInstallments };
}

/** Estimativa simples (em meses) para quitar uma dívida com o pagamento planejado. */
export function debtPayoffMonths(totalAmount: number, monthlyPayment: number): number | null {
  if (monthlyPayment <= 0) return null;
  return Math.ceil(totalAmount / monthlyPayment);
}

/** Quanto falta poupar por mês para bater a meta até a data alvo. */
export function goalMonthlySavings(
  targetAmount: number,
  savedAmount: number,
  targetDate: Date,
  now = new Date()
): { monthly: number; monthsLeft: number; progressPct: number } {
  const remaining = Math.max(0, targetAmount - savedAmount);
  const monthsLeft = Math.max(1, monthsBetween(now, targetDate) + 1);
  const monthly = remaining / monthsLeft;
  const progressPct = targetAmount > 0 ? Math.min(100, (savedAmount / targetAmount) * 100) : 0;
  return { monthly, monthsLeft, progressPct };
}

export function sumDecimal(values: Array<number | string | { toString(): string }>): number {
  return values.reduce((acc: number, v) => acc + toNumberValue(v), 0);
}
