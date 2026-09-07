"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoupleUser } from "@/lib/auth";
import { handleAuraMessage } from "@/lib/aura/engine";
import { whatsappClient } from "@/lib/aura/whatsapp-client";

export type WhatsappActionState = { error?: string } | undefined;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationCode(userId: string, phone: string) {
  const code = generateCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await db.user.update({
    where: { id: userId },
    data: { whatsappPendingNumber: phone, whatsappVerifyCode: code, whatsappVerifyExpires: expires },
  });

  await whatsappClient.sendMessage(
    phone,
    `🔐 Seu código de verificação da Aura é *${code}*. Ele expira em 10 minutos. Se não foi você, ignore essa mensagem.`
  );
}

/** Passo 1: manda um código de 6 dígitos pro número informado, sem conectar nada ainda. */
export async function requestWhatsappCodeAction(
  _prevState: WhatsappActionState,
  formData: FormData
): Promise<WhatsappActionState> {
  const user = await requireCoupleUser();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { error: "Informe um número de WhatsApp." };

  await sendVerificationCode(user.id, phone);
  revalidatePath("/app/aura-whatsapp");
}

/** Reenvia o código pro mesmo número que já estava pendente (novo código, novo prazo). */
export async function resendWhatsappCodeAction(
  _prevState: WhatsappActionState,
  _formData: FormData
): Promise<WhatsappActionState> {
  const user = await requireCoupleUser();
  const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!fresh.whatsappPendingNumber) {
    return { error: "Nenhuma verificação em andamento. Informe o número de novo." };
  }

  await sendVerificationCode(user.id, fresh.whatsappPendingNumber);
  revalidatePath("/app/aura-whatsapp");
}

/** Passo 2: confirma o código e só aí marca o número como conectado de verdade. */
export async function confirmWhatsappCodeAction(
  _prevState: WhatsappActionState,
  formData: FormData
): Promise<WhatsappActionState> {
  const user = await requireCoupleUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Informe o código recebido no WhatsApp." };

  const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } });

  if (!fresh.whatsappPendingNumber || !fresh.whatsappVerifyCode || !fresh.whatsappVerifyExpires) {
    return { error: "Nenhuma verificação em andamento. Informe o número de novo." };
  }
  if (fresh.whatsappVerifyExpires < new Date()) {
    return { error: "Esse código expirou. Peça um novo." };
  }
  if (fresh.whatsappVerifyCode !== code) {
    return { error: "Código incorreto." };
  }

  const phone = fresh.whatsappPendingNumber;

  await db.user.update({
    where: { id: user.id },
    data: {
      whatsappConnected: true,
      whatsappNumber: phone,
      whatsappPendingNumber: null,
      whatsappVerifyCode: null,
      whatsappVerifyExpires: null,
    },
  });

  // Mensagem de boas-vindas — a primeira coisa que a pessoa recebe de
  // verdade no WhatsApp, assim que o número é confirmado.
  const firstName = user.name.trim().split(" ")[0];
  const welcome = `👋 Oi, ${firstName}! Eu sou a Aura. A partir de agora você pode falar comigo por aqui — me conta um gasto, uma dívida, um sonho, ou pergunta quanto ainda dá pra gastar esse mês. Bora começar? 💙`;
  await db.whatsappMessage.create({
    data: { coupleId: user.coupleId!, direction: "out", text: welcome, relatedType: "welcome" },
  });
  await whatsappClient.sendMessage(phone, welcome);

  revalidatePath("/app/aura-whatsapp");
}

/** Cancela uma verificação em andamento — deixa a pessoa tentar outro número. */
export async function cancelWhatsappVerificationAction() {
  const user = await requireCoupleUser();
  await db.user.update({
    where: { id: user.id },
    data: { whatsappPendingNumber: null, whatsappVerifyCode: null, whatsappVerifyExpires: null },
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
