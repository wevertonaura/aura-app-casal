"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import type { ExpenseCategory } from "@prisma/client";

export async function createExpenseAction(formData: FormData) {
  const user = await requireCoupleUser();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "outros") as ExpenseCategory;
  const userId = String(formData.get("userId") ?? user.id);
  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? new Date(dateStr) : new Date();

  if (!description || !Number.isFinite(amount) || amount <= 0) return;

  await db.expense.create({
    data: { coupleId: user.coupleId!, userId, description, amount, category, date, source: "app" },
  });

  revalidatePath("/app/gastos");
  revalidatePath("/app/dashboard");
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireCoupleUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.expense.deleteMany({ where: { id, coupleId: user.coupleId! } });

  revalidatePath("/app/gastos");
  revalidatePath("/app/dashboard");
}
