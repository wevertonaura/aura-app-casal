"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import { parseLocalDate } from "@/lib/calc";

export async function createGoalAction(formData: FormData) {
  const user = await requireCoupleUser();
  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount"));
  const targetDateStr = String(formData.get("targetDate") ?? "");
  const savedAmount = Number(formData.get("savedAmount") ?? 0);

  if (!name || !Number.isFinite(targetAmount) || targetAmount <= 0 || !targetDateStr) return;

  await db.goal.create({
    data: {
      coupleId: user.coupleId!,
      name,
      targetAmount,
      targetDate: parseLocalDate(targetDateStr),
      savedAmount: Number.isFinite(savedAmount) && savedAmount >= 0 ? savedAmount : 0,
    },
  });

  revalidatePath("/app/sonhos");
  revalidatePath("/app/dashboard");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await requireCoupleUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.goal.deleteMany({ where: { id, coupleId: user.coupleId! } });

  revalidatePath("/app/sonhos");
  revalidatePath("/app/dashboard");
}
