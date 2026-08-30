"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requireCoupleUser } from "@/lib/auth";

export type CoupleState = { error?: string } | undefined;

function generateInviteCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export async function createCoupleAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.coupleId) redirect("/app/dashboard");

  const monthlyIncome = Number(formData.get("monthlyIncome"));

  const couple = await db.couple.create({ data: { inviteCode: generateInviteCode() } });
  await db.user.update({
    where: { id: user.id },
    data: {
      coupleId: couple.id,
      monthlyIncome: Number.isFinite(monthlyIncome) && monthlyIncome >= 0 ? monthlyIncome : user.monthlyIncome,
    },
  });
  redirect("/app/dashboard");
}

export async function joinCoupleAction(_prevState: CoupleState, formData: FormData): Promise<CoupleState> {
  const user = await requireUser();
  if (user.coupleId) redirect("/app/dashboard");

  const code = String(formData.get("inviteCode") ?? "").trim().toUpperCase();
  if (!code) return { error: "Informe o código de convite." };

  const couple = await db.couple.findUnique({ where: { inviteCode: code } });
  if (!couple) return { error: "Código de convite inválido." };

  await db.user.update({ where: { id: user.id }, data: { coupleId: couple.id } });
  redirect("/app/dashboard");
}

export async function updateLeisureBudgetAction(formData: FormData) {
  const user = await requireCoupleUser();
  const leisureBudget = Number(formData.get("leisureBudget"));
  await db.couple.update({
    where: { id: user.coupleId! },
    data: { leisureBudget: Number.isFinite(leisureBudget) && leisureBudget >= 0 ? leisureBudget : 0 },
  });
  revalidatePath("/app/configuracoes");
  revalidatePath("/app/gastos");
  revalidatePath("/app/dashboard");
}
