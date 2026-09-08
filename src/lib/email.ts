import "server-only";
import { Resend } from "resend";

// Sem domínio verificado no Resend, o remetente precisa ser o
// onboarding@resend.dev deles — e só entrega pro e-mail do dono da conta
// Resend. Assim que um domínio próprio for verificado (resend.com/domains),
// troca só o FROM abaixo, nada mais no código muda.
const FROM = "Aura <onboarding@resend.dev>";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ ok: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.error("RESEND_API_KEY não configurada — e-mail de recuperação não enviado.");
    return { ok: false, error: "E-mail não configurado no momento. Tente novamente mais tarde." };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinir sua senha — Aura",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 20px; color: #1a1a1a;">Redefinir sua senha</h1>
        <p style="font-size: 14px; color: #444; line-height: 1.5;">
          Recebemos um pedido para redefinir a senha da sua conta na Aura. Clique no botão abaixo pra escolher uma nova senha. Esse link expira em 1 hora.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #b794f4, #8a4a6f); color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size: 12px; color: #888; line-height: 1.5;">
          Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.
          <br />Ou copie e cole este link no navegador: ${resetUrl}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Erro ao enviar e-mail via Resend:", error);
    return { ok: false, error: "Não consegui enviar o e-mail. Tente novamente." };
  }

  return { ok: true };
}
