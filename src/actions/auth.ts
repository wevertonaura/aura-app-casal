"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { generateInviteCode } from "@/lib/inviteCode";

export type AuthState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
  mode: z.enum(["conjunto", "individual"]).default("conjunto"),
});

export async function signupAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    mode: formData.get("mode") || "conjunto",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password, mode } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  const user = await db.user.create({
    data: { name, email, passwordHash: hashPassword(password) },
  });
  await createSession(user.id);

  if (mode === "individual") {
    // Modo individual não passa pelo convite de parceiro(a) — internamente
    // ainda é um "casal", só que de uma pessoa só, então nada mais no
    // sistema precisa saber a diferença.
    const couple = await db.couple.create({ data: { inviteCode: generateInviteCode(), mode: "individual" } });
    await db.user.update({ where: { id: user.id }, data: { coupleId: couple.id } });
    redirect("/app/dashboard");
  }

  redirect("/onboarding");
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id);
  redirect(user.coupleId ? "/app/dashboard" : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
