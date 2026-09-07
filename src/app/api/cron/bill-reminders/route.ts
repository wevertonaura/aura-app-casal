import { NextResponse } from "next/server";
import { sendDueBillReminders } from "@/lib/aura/billReminders";

/**
 * Endpoint pensado pra ser chamado uma vez por dia por um agendador externo
 * (Vercel Cron — ver vercel.json na raiz — ou qualquer outro cron/GitHub
 * Action apontando pra cá com o header Authorization certo).
 *
 * Protegido por CRON_SECRET: se a env var estiver definida, exige
 * `Authorization: Bearer <CRON_SECRET>`. Sem a env var (dev local), roda
 * sem checar nada — não deixe isso acontecer em produção.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await sendDueBillReminders();
  return NextResponse.json({ ok: true, ...result });
}
