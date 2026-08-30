"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import { handleAuraMessage } from "@/lib/aura/engine";

export async function connectWhatsappAction(formData: FormData) {
  const user = await requireCoupleUser();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return;

  await db.user.update({
    where: { id: user.id },
    data: { whatsappConnected: true, whatsappNumber: phone },
  });

  revalidatePath("/app/aura-whatsapp");
}

export async function disconnectWhatsappAction() {
  const user = await requireCoupleUser();
  await db.user.update({ where: { id: user.id }, data: { whatsappConnected: false } });
  revalidatePath("/app/aura-whatsapp");
}

export async function simulateWhatsappAction(formData: FormData) {
  const user = await requireCoupleUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  await handleAuraMessage({
    coupleId: user.coupleId!,
    userId: user.id,
    userPhone: user.whatsappNumber,
    text,
  });

  revalidatePath("/app/aura-whatsapp");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/gastos");
  revalidatePath("/app/contas-fixas");
  revalidatePath("/app/sonhos");
}
