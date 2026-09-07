"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import { parseLocalDate } from "@/lib/calc";

export async function createDebtAction(formData: FormData) {
  const user = await requireCoupleUser();
  const name = String(formData.get("name") ?? "").trim();
  const totalAmount = Number(formData.get("totalAmount"));
  const monthlyPayment = Number(formData.get("monthlyPayment"));

  if (!name || !Number.isFinite(totalAmount) || totalAmount <= 0 || !Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return;
  }

  await db.debt.create({
    data: { coupleId: user.coupleId!, name, totalAmount, monthlyPayment, startDate: new Date() },
  });

  revalidatePath("/app/dividas");
  revalidatePath("/app/dashboard");
}

export async function deleteDebtAction(formData: FormData) {
  const user = await requireCoupleUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.debt.deleteMany({ where: { id, coupleId: user.coupleId! } });

  revalidatePath("/app/dividas");
  revalidatePath("/app/dashboard");
}

export async function registerDebtPaymentAction(formData: FormData) {
  const user = await requireCoupleUser();
  const debtId = String(formData.get("debtId") ?? "");
  const amount = Number(formData.get("amount"));
  const dateStr = String(formData.get("date") ?? "");

  if (!debtId || !Number.isFinite(amount) || amount <= 0) return;

  // Confirma que a dívida pertence ao casal do usuário antes de gravar o pagamento.
  const debt = await db.debt.findFirst({ where: { id: debtId, coupleId: user.coupleId! } });
  if (!debt) return;

  await db.debtPayment.create({
    data: { debtId, amount, date: dateStr ? parseLocalDate(dateStr) : new Date() },
  });

  revalidatePath("/app/dividas");
  revalidatePath("/app/dashboard");
}
