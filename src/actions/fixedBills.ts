"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import type { FixedBillCategory } from "@prisma/client";

export async function createFixedBillAction(formData: FormData) {
  const user = await requireCoupleUser();
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "outro") as FixedBillCategory;
  const totalInstallmentsRaw = String(formData.get("totalInstallments") ?? "").trim();
  const totalInstallments = totalInstallmentsRaw ? Number(totalInstallmentsRaw) : null;
  const dueDayRaw = Number(formData.get("dueDay"));
  const dueDay = Number.isFinite(dueDayRaw) && dueDayRaw >= 1 && dueDayRaw <= 31 ? Math.round(dueDayRaw) : new Date().getDate();

  if (!name || !Number.isFinite(amount) || amount <= 0) return;

  await db.fixedBill.create({
    data: {
      coupleId: user.coupleId!,
      name,
      amount,
      category,
      totalInstallments: totalInstallments && totalInstallments > 0 ? Math.round(totalInstallments) : null,
      dueDay,
      startDate: new Date(),
    },
  });

  revalidatePath("/app/contas-fixas");
  revalidatePath("/app/dashboard");
}

export async function updateFixedBillDueDayAction(formData: FormData) {
  const user = await requireCoupleUser();
  const id = String(formData.get("id") ?? "");
  const dueDayRaw = Number(formData.get("dueDay"));

  if (!id || !Number.isFinite(dueDayRaw) || dueDayRaw < 1 || dueDayRaw > 31) return;

  await db.fixedBill.updateMany({
    where: { id, coupleId: user.coupleId! },
    data: { dueDay: Math.round(dueDayRaw) },
  });

  revalidatePath("/app/contas-fixas");
  revalidatePath("/app/dashboard");
}

export async function deleteFixedBillAction(formData: FormData) {
  const user = await requireCoupleUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.fixedBill.deleteMany({ where: { id, coupleId: user.coupleId! } });

  revalidatePath("/app/contas-fixas");
  revalidatePath("/app/dashboard");
}
