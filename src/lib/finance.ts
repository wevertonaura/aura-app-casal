import { db } from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  installmentsInfo,
  debtPayoffMonths,
  goalMonthlySavings,
  sumDecimal,
  nextDueDate,
  daysUntil,
} from "@/lib/calc";

/**
 * Consolida os números financeiros de um casal para o período atual.
 * Usado tanto pelo Dashboard quanto pelas respostas de consulta da Aura
 * no WhatsApp — uma única fonte de verdade para os cálculos.
 */
export async function getCoupleSnapshot(coupleId: string) {
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [couple, expenses, fixedBills, debts, goals] = await Promise.all([
    db.couple.findUniqueOrThrow({ where: { id: coupleId }, include: { users: true } }),
    db.expense.findMany({
      where: { coupleId, date: { gte: monthStart, lte: monthEnd } },
      include: { user: true },
      orderBy: { date: "desc" },
    }),
    db.fixedBill.findMany({ where: { coupleId }, orderBy: { createdAt: "desc" } }),
    db.debt.findMany({
      where: { coupleId },
      include: { payments: { orderBy: { date: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    db.goal.findMany({ where: { coupleId }, orderBy: { targetDate: "asc" } }),
  ]);

  const coupleIncome = sumDecimal(couple.users.map((u) => u.monthlyIncome));

  const fixedBillsWithInfo = fixedBills.map((bill) => {
    const dueDate = nextDueDate(bill.dueDay);
    return {
      ...bill,
      installments: installmentsInfo(bill.startDate, bill.totalInstallments),
      nextDueDate: dueDate,
      daysUntilDue: daysUntil(dueDate),
    };
  });
  const activeFixedBills = fixedBillsWithInfo.filter((b) => !b.installments.finished);
  const fixedBillsTotal = sumDecimal(activeFixedBills.map((b) => b.amount));

  const monthExpensesTotal = sumDecimal(expenses.map((e) => e.amount));
  const leisureSpent = sumDecimal(expenses.filter((e) => e.category === "lazer").map((e) => e.amount));
  const leisureBudget = Number(couple.leisureBudget);

  const debtsWithInfo = debts.map((debt) => {
    const total = Number(debt.totalAmount);
    const monthly = Number(debt.monthlyPayment);
    const paidAmount = sumDecimal(debt.payments.map((p) => p.amount));
    const remainingAmount = Math.max(0, total - paidAmount);
    const progressPct = total > 0 ? Math.min(100, (paidAmount / total) * 100) : 0;
    return {
      ...debt,
      paidAmount,
      remainingAmount,
      progressPct,
      // Baseada no valor original — histórico do plano inicial.
      payoffMonths: debtPayoffMonths(total, monthly),
      // Baseada no que falta pagar agora — atualiza a cada pagamento registrado.
      remainingPayoffMonths: remainingAmount <= 0 ? 0 : debtPayoffMonths(remainingAmount, monthly),
    };
  });
  const debtsTotal = sumDecimal(debts.map((d) => d.totalAmount));
  const debtsMonthlyTotal = sumDecimal(debts.map((d) => d.monthlyPayment));
  const debtsPaidTotal = sumDecimal(debtsWithInfo.map((d) => d.paidAmount));
  const debtsRemainingTotal = Math.max(0, debtsTotal - debtsPaidTotal);
  const debtsProgressPct = debtsTotal > 0 ? Math.min(100, (debtsPaidTotal / debtsTotal) * 100) : 0;
  const debtsPayoffMonths =
    debtsMonthlyTotal > 0 && debtsRemainingTotal > 0 ? Math.ceil(debtsRemainingTotal / debtsMonthlyTotal) : 0;

  const debtPaymentsHistory = debtsWithInfo
    .flatMap((debt) => debt.payments.map((p) => ({ id: p.id, debtName: debt.name, amount: Number(p.amount), date: p.date })))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);

  const goalsWithInfo = goals.map((goal) => ({
    ...goal,
    progress: goalMonthlySavings(Number(goal.targetAmount), Number(goal.savedAmount), goal.targetDate),
  }));

  const available = coupleIncome - fixedBillsTotal - monthExpensesTotal;

  return {
    couple,
    coupleIncome,
    fixedBills: fixedBillsWithInfo,
    fixedBillsTotal,
    expenses,
    monthExpensesTotal,
    leisureBudget,
    leisureSpent,
    debts: debtsWithInfo,
    debtsTotal,
    debtsMonthlyTotal,
    debtsPaidTotal,
    debtsRemainingTotal,
    debtsProgressPct,
    debtsPayoffMonths,
    debtPaymentsHistory,
    goals: goalsWithInfo,
    available,
  };
}

export type CoupleSnapshot = Awaited<ReturnType<typeof getCoupleSnapshot>>;
