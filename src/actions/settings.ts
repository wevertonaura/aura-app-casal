"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const monthlyIncome = Number(formData.get("monthlyIncome"));

  await db.user.update({
    where: { id: user.id },
    data: {
      name: name || user.name,
      monthlyIncome: Number.isFinite(monthlyIncome) && monthlyIncome >= 0 ? monthlyIncome : user.monthlyIncome,
    },
  });

  revalidatePath("/app/configuracoes");
  revalidatePath("/app/dashboard");
}
