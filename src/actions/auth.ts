"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  createPasswordResetToken,
  getUserByValidResetToken,
  resetPassword,
} from "@/lib/auth";
import { generateInviteCode } from "@/lib/inviteCode";
import { sendPasswordResetEmail } from "@/lib/email";

export type AuthState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
  mode: z.enum(["conjunto", "individual"]).default("conjunto"),
  // Só usado no modo "conjunto" — se a pessoa já tem o código do
  // parceiro(a), entra direto no mesmo casal em vez de criar um novo.
  inviteCode: z.string().optional(),
});

export async function signupAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    mode: formData.get("mode") || "conjunto",
    inviteCode: formData.get("inviteCode") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password, mode, inviteCode } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  // Confere o código de convite ANTES de criar a conta — se estiver
  // errado, a pessoa corrige e tenta de novo sem ficar com uma conta
  // "solta" (sem casal) no meio do caminho.
  const trimmedCode = inviteCode?.trim().toUpperCase();
  let existingCouple: { id: string } | null = null;
  if (mode === "conjunto" && trimmedCode) {
    existingCouple = await db.couple.findUnique({ where: { inviteCode: trimmedCode }, select: { id: true } });
    if (!existingCouple) {
      return { error: "Código de convite inválido. Confira com seu parceiro(a) e tente de novo." };
    }
  }

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

  if (existingCouple) {
    // Segunda pessoa do casal — já entra direto, sem passar por nenhuma
    // tela extra.
    await db.user.update({ where: { id: user.id }, data: { coupleId: existingCouple.id } });
    redirect("/app/dashboard");
  }

  // Primeira pessoa do casal: cria o casal na hora (sem precisar de um
  // clique extra de "criar casal") e manda pra Configurações, onde o
  // código de convite já aparece pronto pra compartilhar.
  const couple = await db.couple.create({ data: { inviteCode: generateInviteCode() } });
  await db.user.update({ where: { id: user.id }, data: { coupleId: couple.id } });
  redirect("/app/configuracoes?bemvindo=1");
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

/** Monta a URL base (protocolo + domínio) a partir da própria requisição — funciona em local e em produção sem precisar configurar nada. */
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido."),
});

export type ForgotPasswordState = { error?: string; sent?: boolean } | undefined;

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Sempre responde como se tivesse enviado, mesmo se o e-mail não existir —
  // evita que alguém use esse formulário pra descobrir quais e-mails têm conta.
  if (!user) return { sent: true };

  const token = await createPasswordResetToken(user.id);
  const baseUrl = await getBaseUrl();
  const resetUrl = `${baseUrl}/redefinir-senha?token=${token}`;

  const result = await sendPasswordResetEmail(user.email, resetUrl);
  if (!result.ok) return { error: result.error };

  return { sent: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
});

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await getUserByValidResetToken(parsed.data.token);
  if (!user) {
    return { error: "Esse link expirou ou já foi usado. Peça um novo em 'Esqueci minha senha'." };
  }

  await resetPassword(user.id, parsed.data.password);
  redirect("/login?redefinida=1");
}
