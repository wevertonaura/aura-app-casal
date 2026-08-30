"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import { NEW_CATEGORY_VALUE } from "@/lib/categories";

export async function createExpenseAction(formData: FormData) {
  const user = await requireCoupleUser();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const userId = String(formData.get("userId") ?? user.id);
  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? new Date(dateStr) : new Date();

  const selectedCategory = String(formData.get("category") ?? "outros");
  const newCategoryName = String(formData.get("newCategory") ?? "").trim();
  const category = await resolveCategory(user.coupleId!, selectedCategory, newCategoryName);

  if (!description || !Number.isFinite(amount) || amount <= 0 || !category) return;

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

/**
 * Se o usuário escolheu "+ Nova categoria" no formulário, cria (ou reaproveita,
 * se já existir com o mesmo nome) uma categoria para o casal e devolve o nome
 * a usar no gasto. Caso contrário, devolve a categoria selecionada como está.
 */
async function resolveCategory(coupleId: string, selected: string, newName: string): Promise<string | null> {
  if (selected !== NEW_CATEGORY_VALUE) return selected || null;
  if (!newName) return null;

  const category = await db.category.upsert({
    where: { coupleId_name: { coupleId, name: newName } },
    create: { coupleId, name: newName },
    update: {},
  });
  return category.name;
}
