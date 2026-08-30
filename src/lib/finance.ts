import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, installmentsInfo, debtPayoffMonths, goalMonthlySavings, sumDecimal } from "@/lib/calc";

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
    db.debt.findMany({ where: { coupleId }, orderBy: { createdAt: "desc" } }),
    db.goal.findMany({ where: { coupleId }, orderBy: { targetDate: "asc" } }),
  ]);

  const coupleIncome = sumDecimal(couple.users.map((u) => u.monthlyIncome));

  const fixedBillsWithInfo = fixedBills.map((bill) => ({
    ...bill,
    installments: installmentsInfo(bill.startDate, bill.totalInstallments),
  }));
  const activeFixedBills = fixedBillsWithInfo.filter((b) => !b.installments.finished);
  const fixedBillsTotal = sumDecimal(activeFixedBills.map((b) => b.amount));

  const monthExpensesTotal = sumDecimal(expenses.map((e) => e.amount));
  const leisureSpent = sumDecimal(expenses.filter((e) => e.category === "lazer").map((e) => e.amount));
  const leisureBudget = Number(couple.leisureBudget);

  const debtsWithInfo = debts.map((debt) => ({
    ...debt,
    payoffMonths: debtPayoffMonths(Number(debt.totalAmount), Number(debt.monthlyPayment)),
  }));
  const debtsTotal = sumDecimal(debts.map((d) => d.totalAmount));
  const debtsMonthlyTotal = sumDecimal(debts.map((d) => d.monthlyPayment));

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
    goals: goalsWithInfo,
    available,
  };
}

export type CoupleSnapshot = Awaited<ReturnType<typeof getCoupleSnapshot>>;
